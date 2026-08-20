import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';
import { timingSafeEqual } from 'node:crypto';
import { supabase, SUPABASE_ENABLED } from './_lib/supabase.js';
import { generateDiagnosticReport, type DiagnosticInput } from './_lib/diagnostic-generator.js';
import { sendDiagnosticFailureOps, sendQANotificationEmail } from './_lib/mailer.js';

/**
 * AEGIS Intelligence -- Generate Diagnostic Endpoint (S4 Mission N11)
 *
 * Voie B serverless DIAGNOSTIC : Opus + jsPDF + delivery, sans PS1.
 *
 * Trigger : POST /api/generate-diagnostic depuis mollie-webhook.ts (fire-and-forget)
 *           ou fallback manuel JP via curl/dashboard.
 *
 * Auth : header `x-admin-key` (timing-safe vs process.env.AEGIS_ADMIN_KEY).
 *
 * Pipeline (machine d'etat paid -> generating -> delivered | failed) :
 *   1. Auth + idempotent guard (status check : skip si delivered ou generating in-flight)
 *   2. SELECT diagnostic_requests + invoices (facture S1)
 *   3. UPDATE status='generating'
 *   4. generateDiagnosticReport (Opus + jsPDF)  [longue tache, ~30-90s]
 *   5. sendDiagnosticDelivery (rapport PJ + facture PJ)
 *   6. UPDATE status='delivered', delivered_at, pdf_sha256
 *   7. Sur erreur : UPDATE status='failed', sendDiagnosticFailureOps
 *
 * Vercel : maxDuration 300s, memory 1024MB (cf. vercel.json override).
 *
 * Version : 1.1.0 -- 20260819 -- HB-4 CE-01 : claim atomique paid->generating (.select() + verif ligne retournee avant travail long)
 * Version : 1.0.1 -- 20260819 -- HA-2 CE-02 : commentaire liens QA (GET non-mutant, mutation POST cote admin-approve)
 * Version : 1.0.0 -- 20260508 -- creation S4
 */

export const config = { maxDuration: 800, memory: 1024 };

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// G3 QA Gate (D_T0955_G3_01) : base URL pour liens approve/reject email JP.
// Symetrique a mollie-webhook.ts WEBHOOK_BASE_URL pour preserver preview branch URL.
const PUBLIC_BASE_URL = (() => {
    const vEnv = process.env.VERCEL_ENV || 'development';
    if (vEnv === 'production') return 'https://jeanpierrecharles.com';
    if (vEnv === 'preview' && process.env.VERCEL_BRANCH_URL) {
        return `https://${process.env.VERCEL_BRANCH_URL}`;
    }
    return 'https://jeanpierrecharles.com';
})();

function timingSafeStringEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    try {
        return timingSafeEqual(bufA, bufB);
    } catch {
        return false;
    }
}

function authorize(req: VercelRequest, res: VercelResponse): boolean {
    const expected = process.env.AEGIS_ADMIN_KEY;
    if (!expected) {
        console.error(JSON.stringify({
            event: 'generate_diagnostic_misconfigured',
            reason: 'AEGIS_ADMIN_KEY not set',
            severity: 'critical',
            timestamp: new Date().toISOString(),
        }));
        res.status(401).json({ error: 'Unauthorized', reason: 'admin_key_not_configured' });
        return false;
    }
    const provided = req.headers['x-admin-key'];
    if (typeof provided !== 'string' || provided.length === 0) {
        res.status(401).json({ error: 'Unauthorized', reason: 'missing_admin_key' });
        return false;
    }
    if (!timingSafeStringEqual(provided, expected)) {
        console.warn(JSON.stringify({
            event: 'generate_diagnostic_forbidden',
            ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown',
            timestamp: new Date().toISOString(),
        }));
        res.status(403).json({ error: 'Forbidden', reason: 'invalid_admin_key' });
        return false;
    }
    return true;
}

interface DiagnosticRequestRow {
    request_id: string;
    invoice_number: string;
    status: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    company: string | null;
    country: string | null;
    city: string | null;
    sector: string | null;
    product: string | null;
    context: string | null;
    regulations: string[] | string | null;
    lang: string;
    payment_id: string | null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
    if (!authorize(req, res)) return;

    if (!SUPABASE_ENABLED || !supabase) {
        return res.status(503).json({ error: 'supabase_unavailable' });
    }

    const body = req.body || {};
    const requestId = typeof body.request_id === 'string' ? body.request_id : '';
    if (!UUID_REGEX.test(requestId)) {
        return res.status(400).json({ error: 'invalid_request_id' });
    }

    // 1. SELECT diagnostic_requests
    const { data: row, error: selErr } = await supabase
        .from('diagnostic_requests')
        .select('request_id, invoice_number, status, email, first_name, last_name, company, country, city, sector, product, context, regulations, lang, payment_id')
        .eq('request_id', requestId)
        .maybeSingle();

    if (selErr) {
        console.error(JSON.stringify({
            event: 'generate_diagnostic_select_failed',
            request_id: requestId,
            error: selErr.message || 'unknown',
            timestamp: new Date().toISOString(),
        }));
        return res.status(500).json({ error: 'supabase_select_failed' });
    }
    if (!row) {
        return res.status(404).json({ error: 'request_not_found' });
    }

    const requestRow = row as DiagnosticRequestRow;

    // 2. Idempotent guard sur status
    if (requestRow.status === 'delivered') {
        console.log(JSON.stringify({
            event: 'generate_diagnostic_idempotent',
            request_id: requestId,
            existing_status: requestRow.status,
            timestamp: new Date().toISOString(),
        }));
        return res.status(200).json({ status: 'already_delivered' });
    }
    if (requestRow.status === 'generating') {
        console.log(JSON.stringify({
            event: 'generate_diagnostic_already_generating',
            request_id: requestId,
            timestamp: new Date().toISOString(),
        }));
        return res.status(202).json({ status: 'already_generating' });
    }
    if (requestRow.status !== 'paid' && requestRow.status !== 'failed') {
        return res.status(409).json({ error: 'invalid_status', current: requestRow.status });
    }

    // 3. UPDATE conditionnel paid|failed -> generating : CLAIM ATOMIQUE (HB-4 / CE-01).
    // .select() retourne les lignes reellement mutees : 0 ligne = un caller concurrent
    // a deja pris le claim entre notre SELECT (etape 1, potentiellement stale) et ici
    // -> repondre "deja en cours" SANS lancer le travail long (~700 s).
    // Invariant : exactement une generation par dossier, meme en concurrence.
    {
        const { data: claimed, error: upErr } = await supabase
            .from('diagnostic_requests')
            .update({ status: 'generating', updated_at: new Date().toISOString() })
            .eq('request_id', requestId)
            .in('status', ['paid', 'failed'])
            .select('request_id');
        if (upErr) {
            console.error(JSON.stringify({
                event: 'generate_diagnostic_status_generating_failed',
                request_id: requestId,
                error: upErr.message || 'unknown',
                timestamp: new Date().toISOString(),
            }));
            return res.status(500).json({ error: 'status_update_failed' });
        }
        if (!claimed || claimed.length === 0) {
            console.log(JSON.stringify({
                event: 'generate_diagnostic_claim_lost',
                request_id: requestId,
                reason: 'zero_row_updated_concurrent_claim',
                timestamp: new Date().toISOString(),
            }));
            return res.status(202).json({ status: 'already_generating', reason: 'claim_lost' });
        }
    }

    // 4. (G3 QA Gate) SELECT invoice retire ici : la facture est jointe au moment
    //    de l'approval JP par /api/admin-approve (apres clic APPROUVER), pas avant.

    // 5. Build DiagnosticInput depuis Supabase row
    const customerName = [requestRow.first_name, requestRow.last_name].filter(Boolean).join(' ') || 'Client';
    const regulationsArray: string[] = Array.isArray(requestRow.regulations)
        ? requestRow.regulations
        : (typeof requestRow.regulations === 'string' && requestRow.regulations.length > 0)
            ? requestRow.regulations.split(',').map(r => r.trim()).filter(Boolean)
            : [];

    const input: DiagnosticInput = {
        invoice_number: requestRow.invoice_number,
        request_id: requestRow.request_id,
        lang: requestRow.lang === 'en' ? 'en' : 'fr',
        customer_name: customerName,
        customer_company: requestRow.company || 'N/A',
        customer_email: requestRow.email,
        sector: requestRow.sector || 'N/A',
        product: requestRow.product || 'N/A',
        regulations: regulationsArray,
        context: requestRow.context || undefined,
        country: requestRow.country || undefined,
        city: requestRow.city || undefined,
    };

    // 6. Generate report (long task, ~30-90s)
    let report;
    const startedAt = Date.now();
    try {
        report = await generateDiagnosticReport(input);
    } catch (genErr: unknown) {
        const reason = (genErr as { message?: string })?.message || 'generation_unknown_error';
        console.error(JSON.stringify({
            event: 'generate_diagnostic_generation_failed',
            request_id: requestId,
            invoice_number: requestRow.invoice_number,
            error: reason,
            elapsed_ms: Date.now() - startedAt,
            severity: 'critical',
            timestamp: new Date().toISOString(),
        }));

        // UPDATE status='failed'
        await supabase
            .from('diagnostic_requests')
            .update({ status: 'failed', updated_at: new Date().toISOString() })
            .eq('request_id', requestId);

        // sendDiagnosticFailureOps (best-effort)
        await sendDiagnosticFailureOps({
            payment_id: requestRow.payment_id || 'N/A',
            request_id: requestRow.request_id,
            email: requestRow.email,
            customer_name: customerName,
            customer_company: requestRow.company || undefined,
            sector: requestRow.sector || undefined,
            invoice_number: requestRow.invoice_number,
            amount: '250.00',
            failure_reason: reason,
            lang: input.lang,
        }).catch((e) => {
            console.error(JSON.stringify({
                event: 'failure_ops_email_failed',
                request_id: requestId,
                error: (e as Error)?.message || 'unknown',
                timestamp: new Date().toISOString(),
            }));
        });

        return res.status(500).json({ error: 'generation_failed', reason });
    }

    const generationMs = Date.now() - startedAt;
    const pdfSha256 = crypto.createHash('sha256').update(report.pdfBuffer).digest('hex');

    console.log(JSON.stringify({
        event: 'generate_diagnostic_generated',
        request_id: requestId,
        invoice_number: requestRow.invoice_number,
        pdf_size_bytes: report.pdfSize,
        pdf_sha256_prefix: pdfSha256.slice(0, 8),
        generation_ms: generationMs,
        opus_usage: report.opusUsage || null,
        timestamp: new Date().toISOString(),
    }));

    // === G3 QA Gate (D_T0955_G3_01) : interception avant livraison client ===
    // Au lieu d'envoyer directement au client (sendDiagnosticDelivery), on stocke
    // le PDF en Supabase + notifie JP. JP clique APPROUVER (->admin-approve) qui
    // declenche le vrai sendDiagnosticDelivery. Garde-fou QA humain avant livraison.

    // 7. Generer qa_token + UPDATE diagnostic_requests (qa_status='pending', stockage PDF)
    //    N12.A DT-04 : ajout pdf_url (signed URL Storage aegis-documents) si upload OK,
    //    null sinon (double canal email PJ + Storage backup, garde l'idempotence retry).
    const qaToken = crypto.randomUUID();
    {
        const { error: qaErr } = await supabase
            .from('diagnostic_requests')
            .update({
                qa_status: 'pending',
                qa_token: qaToken,
                pdf_base64: report.pdfBase64,
                pdf_sha256: pdfSha256,
                pdf_url: report.pdfUrl ?? null,
                updated_at: new Date().toISOString(),
            })
            .eq('request_id', requestId);

        if (qaErr) {
            console.error(JSON.stringify({
                event: 'generate_diagnostic_qa_gate_update_failed',
                request_id: requestId,
                error: qaErr.message || 'unknown',
                severity: 'critical',
                timestamp: new Date().toISOString(),
            }));
            // UPDATE QA gate echoue : PDF genere mais pas stocke. JP doit intervenir.
            await sendDiagnosticFailureOps({
                payment_id: requestRow.payment_id || 'N/A',
                request_id: requestRow.request_id,
                email: requestRow.email,
                customer_name: customerName,
                customer_company: requestRow.company || undefined,
                sector: requestRow.sector || undefined,
                invoice_number: requestRow.invoice_number,
                amount: '250.00',
                failure_reason: `qa_gate_update_failed: ${qaErr.message || 'unknown'}`,
                lang: input.lang,
            }).catch(() => { /* swallow */ });
            return res.status(500).json({ error: 'qa_gate_update_failed' });
        }
    }

    // 8. Notifier JP avec rapport en PJ + liens approve/reject
    // HA-2 (CE-02) : ces liens GET n'executent PLUS la mutation -- ils ouvrent la page
    // de confirmation admin-approve (recap + boutons POST). Un prefetch email est inoffensif.
    const adminKey = process.env.AEGIS_ADMIN_KEY || '';
    const approveUrl = `${PUBLIC_BASE_URL}/api/admin-approve?token=${qaToken}&action=approve&key=${encodeURIComponent(adminKey)}`;
    const rejectUrl = `${PUBLIC_BASE_URL}/api/admin-approve?token=${qaToken}&action=reject&key=${encodeURIComponent(adminKey)}`;
    const opusUsageInfo = report.opusUsage
        ? `in:${report.opusUsage.input_tokens || 0} out:${report.opusUsage.output_tokens || 0} cache_read:${report.opusUsage.cache_read_input_tokens || 0}`
        : undefined;

    try {
        await sendQANotificationEmail({
            invoiceNumber: requestRow.invoice_number,
            requestId: requestRow.request_id,
            customerName,
            customerCompany: requestRow.company || undefined,
            customerEmail: requestRow.email,
            lang: input.lang,
            sector: requestRow.sector || undefined,
            approveUrl,
            rejectUrl,
            pdfBase64: report.pdfBase64,
            pdfFilename: report.pdfFilename,
            opusUsageInfo,
        });
    } catch (mailErr: unknown) {
        const reason = (mailErr as { message?: string })?.message || 'mail_unknown_error';
        // P1-ARCH-01 fix (T1115) : QA email is notification-only, not pipeline-critical.
        // Diagnostic is generated + stored (pdf_base64 in DB + Storage signed URL if upload OK).
        // QA gate row exists with qa_status='pending'. JP can approve via Supabase Studio
        // or direct /api/admin-approve URL even if this email failed.
        // Severity downgraded critical -> warning. Fall-through to standard 200 qa_pending response.
        console.warn(JSON.stringify({
            event: 'generate_diagnostic_qa_notify_mail_failed',
            request_id: requestId,
            invoice_number: requestRow.invoice_number,
            error: reason,
            severity: 'warning',
            fallback: 'JP approve via Supabase Studio or direct /api/admin-approve URL',
            timestamp: new Date().toISOString(),
        }));
        await sendDiagnosticFailureOps({
            payment_id: requestRow.payment_id || 'N/A',
            request_id: requestRow.request_id,
            email: requestRow.email,
            customer_name: customerName,
            customer_company: requestRow.company || undefined,
            sector: requestRow.sector || undefined,
            invoice_number: requestRow.invoice_number,
            amount: '250.00',
            failure_reason: `qa_notify_mail: ${reason}`,
            lang: input.lang,
        }).catch(() => { /* swallow */ });
        // No return — fall-through to qa_pending 200 response below.
    }

    // status reste 'generating' jusqu'a approve/reject par JP via /api/admin-approve.
    // delivered_at est positionne a l'approbation, pas ici.

    console.log(JSON.stringify({
        event: 'generate_diagnostic_qa_pending',
        request_id: requestId,
        invoice_number: requestRow.invoice_number,
        qa_token_prefix: qaToken.slice(0, 8),
        pdf_sha256_prefix: pdfSha256.slice(0, 8),
        elapsed_ms: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
    }));

    return res.status(200).json({
        status: 'qa_pending',
        request_id: requestId,
        qa_token_prefix: qaToken.slice(0, 8),
        pdf_size_bytes: report.pdfSize,
        elapsed_ms: Date.now() - startedAt,
    });
}
