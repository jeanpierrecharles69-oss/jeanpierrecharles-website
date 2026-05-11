import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';
import { timingSafeEqual } from 'node:crypto';
import { supabase, SUPABASE_ENABLED } from './_lib/supabase.js';
import { generateDiagnosticReport, type DiagnosticInput } from './_lib/diagnostic-generator.js';
import { sendDiagnosticDelivery, sendDiagnosticFailureOps } from './_lib/mailer.js';

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
 * Version : 1.0.0 -- 20260508 -- creation S4
 */

export const config = { maxDuration: 800, memory: 1024 };

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

    // 3. UPDATE status='generating' (atomic transition)
    {
        const { error: upErr } = await supabase
            .from('diagnostic_requests')
            .update({ status: 'generating', updated_at: new Date().toISOString() })
            .eq('request_id', requestId)
            .in('status', ['paid', 'failed']);
        if (upErr) {
            console.error(JSON.stringify({
                event: 'generate_diagnostic_status_generating_failed',
                request_id: requestId,
                error: upErr.message || 'unknown',
                timestamp: new Date().toISOString(),
            }));
            return res.status(500).json({ error: 'status_update_failed' });
        }
    }

    // 4. SELECT invoice (S1) pour PJ facture
    let invoicePdfBase64: string | undefined;
    let invoicePdfFilename: string | undefined;
    {
        const { data: invRow, error: invErr } = await supabase
            .from('invoices')
            .select('pdf_base64, invoice_number')
            .eq('invoice_number', requestRow.invoice_number)
            .maybeSingle();
        if (invErr) {
            console.warn(JSON.stringify({
                event: 'generate_diagnostic_invoice_select_failed',
                request_id: requestId,
                invoice_number: requestRow.invoice_number,
                error: invErr.message || 'unknown',
                severity: 'warning',
                timestamp: new Date().toISOString(),
            }));
        } else if (invRow && invRow.pdf_base64) {
            invoicePdfBase64 = invRow.pdf_base64;
            invoicePdfFilename = `Facture_AEGIS_${invRow.invoice_number}.pdf`;
        } else {
            console.warn(JSON.stringify({
                event: 'generate_diagnostic_invoice_missing',
                request_id: requestId,
                invoice_number: requestRow.invoice_number,
                severity: 'warning',
                timestamp: new Date().toISOString(),
            }));
        }
    }

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

    // 7. Send delivery email (rapport PJ + facture PJ)
    try {
        await sendDiagnosticDelivery({
            payment_id: requestRow.payment_id || 'N/A',
            request_id: requestRow.request_id,
            email: requestRow.email,
            customer_name: customerName,
            customer_company: requestRow.company || undefined,
            invoice_number: requestRow.invoice_number,
            amount: '250.00',
            lang: input.lang,
            report_pdf_base64: report.pdfBase64,
            report_pdf_filename: report.pdfFilename,
            pdf_base64: invoicePdfBase64,
            pdf_filename: invoicePdfFilename,
        });
    } catch (mailErr: unknown) {
        const reason = (mailErr as { message?: string })?.message || 'mail_unknown_error';
        console.error(JSON.stringify({
            event: 'generate_diagnostic_delivery_mail_failed',
            request_id: requestId,
            error: reason,
            severity: 'critical',
            timestamp: new Date().toISOString(),
        }));
        // PDF genere OK mais mail echoue : status reste 'generating' → JP peut relancer manuellement.
        // PAS de fallback status='failed' ici (PDF est genere, intervention manuelle simple).
        await supabase
            .from('diagnostic_requests')
            .update({ pdf_sha256: pdfSha256, updated_at: new Date().toISOString() })
            .eq('request_id', requestId);

        await sendDiagnosticFailureOps({
            payment_id: requestRow.payment_id || 'N/A',
            request_id: requestRow.request_id,
            email: requestRow.email,
            customer_name: customerName,
            customer_company: requestRow.company || undefined,
            sector: requestRow.sector || undefined,
            invoice_number: requestRow.invoice_number,
            amount: '250.00',
            failure_reason: `mail_delivery: ${reason}`,
            lang: input.lang,
        }).catch(() => { /* swallow */ });

        return res.status(502).json({ error: 'delivery_mail_failed', reason });
    }

    // 8. UPDATE status='delivered'
    {
        const { error: finalErr } = await supabase
            .from('diagnostic_requests')
            .update({
                status: 'delivered',
                delivered_at: new Date().toISOString(),
                pdf_sha256: pdfSha256,
                updated_at: new Date().toISOString(),
            })
            .eq('request_id', requestId);
        if (finalErr) {
            console.warn(JSON.stringify({
                event: 'generate_diagnostic_final_update_failed',
                request_id: requestId,
                error: finalErr.message || 'unknown',
                severity: 'warning',
                timestamp: new Date().toISOString(),
            }));
            // Email OK + PDF genere : ne pas faire echouer la requete pour un bug UPDATE
        }
    }

    console.log(JSON.stringify({
        event: 'generate_diagnostic_delivered',
        request_id: requestId,
        invoice_number: requestRow.invoice_number,
        elapsed_ms: Date.now() - startedAt,
        pdf_sha256_prefix: pdfSha256.slice(0, 8),
        timestamp: new Date().toISOString(),
    }));

    return res.status(200).json({
        status: 'delivered',
        request_id: requestId,
        pdf_size_bytes: report.pdfSize,
        elapsed_ms: Date.now() - startedAt,
    });
}
