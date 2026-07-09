import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * AEGIS Intelligence -- Mollie Webhook Handler
 * Called by Mollie when a payment status changes.
 *
 * SECURITE : Mollie sends only the payment ID in the webhook body.
 * We must re-query Mollie API to get actual status (never trust webhook body alone).
 *
 * Phase 2 ACTIVE : On status === 'paid', send client confirmation + ops notification.
 * Pattern : await Promise.race([allSettled, timeout 7s]) (Vercel serverless safe).
 *
 * Idempotence (Night N7 v2.3.0 renforcee) :
 *   - Set<string> in-memory par instance warm (fast-path <1ms)
 *   - + SELECT Supabase status pre-email (survit cold starts Vercel lambda)
 *   - Tout UPDATE cible status IN ('pending_payment', 'pending') uniquement -> idempotent via WHERE
 *   - pending_generations : contrainte UNIQUE request_id -> INSERT duplique echoue gracieusement
 *
 * Night N7 Option β : apres UPDATE paid, INSERT pending_generations pour dashboard JP.
 * NIGHT-N5 Phase B3 : update Supabase status=paid + paid_at + payment_id (NON-BLOQUANT).
 *
 * Version : 3.0.0 -- 20260601T2200 -- D_T1740_01 : VEILLE removal (handler DIAGNOSTIC seul)
 */

import {
    sendClientConfirmation,
    sendOpsNewOrder,
    isAlreadyProcessed,
    markProcessed,
} from './_lib/mailer.js';
import { supabase } from './_lib/supabase.js';
import { generateInvoicePdf } from './_lib/invoice-generator.js';

const VERCEL_ENV = process.env.VERCEL_ENV || 'development';
const MOLLIE_API_KEY =
    VERCEL_ENV === 'production'
        ? process.env.MOLLIE_API_KEY_LIVE
        : process.env.MOLLIE_API_KEY_TEST;

const WEBHOOK_BASE_URL = (() => {
    if (VERCEL_ENV === 'production') return 'https://jeanpierrecharles.com';
    if (VERCEL_ENV === 'preview' && process.env.VERCEL_BRANCH_URL) {
        return `https://${process.env.VERCEL_BRANCH_URL}`;
    }
    return 'https://jeanpierrecharles.com';
})();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Mollie webhooks are POST only
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id } = req.body;

        if (!id || typeof id !== 'string') {
            console.error('Mollie webhook: missing or invalid payment id');
            return res.status(400).json({ error: 'Missing payment id' });
        }

        if (!MOLLIE_API_KEY) {
            console.error('Mollie webhook: API key not configured');
            // Still return 200 to Mollie to avoid retries
            return res.status(200).json({ received: true, error: 'key_missing' });
        }

        // Re-query Mollie API for actual payment status (security best practice)
        const mollieRes = await fetch(`https://api.mollie.com/v2/payments/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${MOLLIE_API_KEY}`,
            },
        });

        if (!mollieRes.ok) {
            const errText = await mollieRes.text();
            console.error(`Mollie webhook: failed to fetch payment ${id}:`, mollieRes.status, errText);
            // Return 200 to prevent Mollie from retrying indefinitely
            return res.status(200).json({ received: true, error: 'fetch_failed' });
        }

        const payment = await mollieRes.json();
        const status = payment.status; // open, pending, authorized, paid, expired, canceled, failed
        const metadata = payment.metadata || {};

        // Log payment event (non-sensitive: only IDs and status)
        console.log(JSON.stringify({
            event: 'mollie_webhook',
            payment_id: id,
            status,
            request_id: metadata.request_id || null,
            product: metadata.product || null,
            mode: metadata.mode || null,
            timestamp: new Date().toISOString(),
        }));

        // Phase 2 ACTIVE : email pipeline on paid (C3-bis pattern)
        if (status === 'paid' && !isAlreadyProcessed(id)) {
            markProcessed(id);

            // Night N7 v2.3.0 : Supabase-level idempotence pre-check (survit cold starts).
            // Si le row est deja status='paid' ou 'delivered', on evite emails & INSERT pending dupliques.
            // Ce check survient APRES markProcessed pour preserver fast-path warm instance.
            let dbAlreadyPaid = false;
            if (supabase && metadata.request_id) {
                try {
                    const selectPromise = supabase
                        .from('diagnostic_requests')
                        .select('status')
                        .eq('request_id', metadata.request_id)
                        .single();

                    const selectTimeout = new Promise<{ data: null; error: { message: string } }>((_, reject) =>
                        setTimeout(() => reject(new Error('supabase_select_timeout_2s')), 2000)
                    );

                    const { data: existing } = await Promise.race([selectPromise, selectTimeout]) as {
                        data: { status?: string } | null;
                        error: unknown;
                    };

                    if (existing?.status === 'paid' || existing?.status === 'delivered' || existing?.status === 'generating') {
                        dbAlreadyPaid = true;
                        console.log(JSON.stringify({
                            event: 'webhook_idempotent_db_check',
                            payment_id: id,
                            request_id: metadata.request_id,
                            product: 'diagnostic',
                            existing_status: existing.status,
                            timestamp: new Date().toISOString(),
                        }));
                    }
                } catch (e: unknown) {
                    // Sur timeout/erreur du SELECT, on continue (degrade gracefully vers in-memory only).
                    const msg = (e as { message?: string })?.message || 'unknown';
                    console.warn(JSON.stringify({
                        event: 'webhook_idempotent_db_check_skipped',
                        payment_id: id,
                        request_id: metadata.request_id,
                        reason: msg,
                        timestamp: new Date().toISOString(),
                    }));
                }
            }

            if (dbAlreadyPaid) {
                // Reponse 200 immediate sans effets de bord
                return res.status(200).json({ received: true, status, idempotent: 'db' });
            }

            // NIGHT-N5 Phase B3 + v2.2.0 FIX : update Supabase status=paid (AWAIT Promise.race 3s)
            // v2.3.0 Night N7 : WHERE status IN ('pending_payment','pending') pour atomicite cross-cold-start.
            if (supabase && metadata.request_id) {
                try {
                    const updatePromise = supabase
                        .from('diagnostic_requests')
                        .update({
                            status: 'paid',
                            paid_at: new Date().toISOString(),
                            payment_id: id,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('request_id', metadata.request_id)
                        .in('status', ['pending_payment', 'pending']);

                    const timeoutPromise = new Promise<{ error: { message: string } }>((_, reject) =>
                        setTimeout(() => reject(new Error('supabase_update_timeout_3s')), 3000)
                    );

                    const result = await Promise.race([updatePromise, timeoutPromise]) as { error: unknown };

                    if (result.error) {
                        const msg = (result.error as { message?: string })?.message || 'unknown';
                        console.error(JSON.stringify({
                            event: 'supabase_update_failed',
                            context: 'mollie-webhook',
                            payment_id: id,
                            request_id: metadata.request_id,
                            target_table: 'diagnostic_requests',
                            error: msg,
                            severity: 'warning',
                            timestamp: new Date().toISOString(),
                        }));
                    } else {
                        console.log(JSON.stringify({
                            event: 'supabase_update_ok',
                            context: 'mollie-webhook',
                            payment_id: id,
                            request_id: metadata.request_id,
                            target_table: 'diagnostic_requests',
                            new_status: 'paid',
                            timestamp: new Date().toISOString(),
                        }));

                        // Phase C auto-queue : signal post-UPDATE pour PS1 watchdog / n8n W4
                        console.log(JSON.stringify({
                            event: 'diagnostic_ready_for_generation',
                            request_id: metadata.request_id,
                            invoice_number: metadata.invoice_number || null,
                            lang: metadata.lang || 'fr',
                            timestamp: new Date().toISOString(),
                        }));

                        // Night N7 Option β : INSERT pending_generations (DIAGNOSTIC pipeline PS1 Opus rapport)
                        try {
                            const insertPromise = supabase
                                .from('pending_generations')
                                .insert({
                                    request_id: metadata.request_id,
                                    status: 'pending',
                                });

                            const insertTimeout = new Promise<{ error: { message: string; code?: string } }>((_, reject) =>
                                setTimeout(() => reject(new Error('supabase_insert_pending_timeout_2s')), 2000)
                            );

                            const insResult = await Promise.race([insertPromise, insertTimeout]) as { error: { message?: string; code?: string } | null };

                            if (insResult.error) {
                                // Code 23505 = unique_violation (row deja presente, idempotent OK)
                                if (insResult.error.code === '23505') {
                                    console.log(JSON.stringify({
                                        event: 'pending_generations_already_exists',
                                        payment_id: id,
                                        request_id: metadata.request_id,
                                        timestamp: new Date().toISOString(),
                                    }));
                                } else {
                                    console.error(JSON.stringify({
                                        event: 'pending_generations_insert_failed',
                                        payment_id: id,
                                        request_id: metadata.request_id,
                                        error: insResult.error.message || 'unknown',
                                        code: insResult.error.code || null,
                                        severity: 'warning',
                                        timestamp: new Date().toISOString(),
                                    }));
                                }
                            } else {
                                console.log(JSON.stringify({
                                    event: 'pending_generations_insert_ok',
                                    payment_id: id,
                                    request_id: metadata.request_id,
                                    timestamp: new Date().toISOString(),
                                }));
                            }
                        } catch (pe: unknown) {
                            const pmsg = (pe as { message?: string })?.message || 'unknown';
                            console.warn(JSON.stringify({
                                event: 'pending_generations_insert_timeout',
                                payment_id: id,
                                request_id: metadata.request_id,
                                error: pmsg,
                                severity: 'warning',
                                timestamp: new Date().toISOString(),
                            }));
                        }
                    }
                } catch (e: unknown) {
                    const msg = (e as { message?: string })?.message || 'unknown';
                    console.error(JSON.stringify({
                        event: 'supabase_update_timeout',
                        context: 'mollie-webhook',
                        payment_id: id,
                        request_id: metadata.request_id,
                        error: msg,
                        severity: 'warning',
                        timestamp: new Date().toISOString(),
                    }));
                }
            }

            // === S1 Mission N11 : facture PDF serveur-side (P0 legal Art. L441-10) ===
            // Generation jsPDF + INSERT invoices + propagation pdf_base64 vers emailData.
            // Fail-safe : si la generation echoue, l'email part sans PJ (UX degradee, paiement confirme).
            // N12.A DT-04 : upload facture vers Supabase Storage aegis-documents/invoices/{ref}/.
            let invoicePdfBase64: string | undefined;
            let invoicePdfFilename: string | undefined;
            let invoicePdfUrl: string | null = null;
            const invoiceNumber = metadata.invoice_number || undefined;

            if (invoiceNumber) {
                try {
                    // D_T1105_03 : enrichissement Supabase avant generation facture (fix regression 15/05).
                    // Cause racine : metadata Mollie limite 1KB (cf. commit bca9afc), tronque
                    // silencieusement quand product_description/regulations/customer_company depassent.
                    // Source canonique = diagnostic_requests table (deja ecrite par diagnostic-request.ts
                    // avant le checkout). Fallback sur metadata si SELECT echoue (preserve robustesse).
                    let customerName = metadata.customer_name || undefined;
                    let customerCompany = metadata.customer_company || undefined;
                    let customerEmail = metadata.email || undefined;
                    let sectorVal = metadata.sector || undefined;
                    let regulationsList: string[] | undefined = metadata.regulations
                        ? (metadata.regulations as string).split(', ').filter((s: string) => s.trim().length > 0)
                        : undefined;
                    let contextVal = metadata.context || undefined;

                    if (supabase && metadata.request_id) {
                        try {
                            const enrichPromise = supabase
                                .from('diagnostic_requests')
                                .select('first_name, last_name, company, email, sector, regulations, context')
                                .eq('request_id', metadata.request_id)
                                .single();
                            const enrichTimeout = new Promise<{ data: null; error: { message: string } }>((_, reject) =>
                                setTimeout(() => reject(new Error('invoice_enrichment_timeout_2s')), 2000)
                            );
                            const { data: clientRow } = await Promise.race([enrichPromise, enrichTimeout]) as {
                                data: {
                                    first_name?: string | null;
                                    last_name?: string | null;
                                    company?: string | null;
                                    email?: string | null;
                                    sector?: string | null;
                                    regulations?: string | string[] | null;
                                    context?: string | null;
                                } | null;
                                error: unknown;
                            };
                            if (clientRow) {
                                const fullName = [clientRow.first_name, clientRow.last_name].filter(Boolean).join(' ').trim();
                                if (fullName) customerName = fullName;
                                if (clientRow.company) customerCompany = clientRow.company;
                                if (clientRow.email) customerEmail = clientRow.email;
                                if (clientRow.sector) sectorVal = clientRow.sector;
                                if (clientRow.regulations) {
                                    regulationsList = Array.isArray(clientRow.regulations)
                                        ? clientRow.regulations
                                        : (clientRow.regulations as string).split(',').map(r => r.trim()).filter(Boolean);
                                }
                                if (clientRow.context) contextVal = clientRow.context;
                                console.log(JSON.stringify({
                                    event: 'invoice_supabase_enrichment_ok',
                                    payment_id: id,
                                    request_id: metadata.request_id,
                                    target_table: 'diagnostic_requests',
                                    timestamp: new Date().toISOString(),
                                }));
                            }
                        } catch (ee: unknown) {
                            console.warn(JSON.stringify({
                                event: 'invoice_supabase_enrichment_failed',
                                payment_id: id,
                                request_id: metadata.request_id,
                                error: (ee as Error)?.message || 'unknown',
                                severity: 'warning',
                                timestamp: new Date().toISOString(),
                            }));
                        }
                    }

                    const invoice = generateInvoicePdf({
                        invoice_number: invoiceNumber,
                        product: 'diagnostic',
                        lang: (metadata.lang === 'en' ? 'en' : 'fr') as 'fr' | 'en',
                        amount: '250.00',
                        customer_name: customerName,
                        customer_company: customerCompany,
                        customer_email: customerEmail,
                        sector: sectorVal,
                        regulations: regulationsList,
                        context: contextVal,
                    });
                    invoicePdfBase64 = invoice.base64;
                    invoicePdfFilename = invoice.filename;

                    console.log(JSON.stringify({
                        event: 'invoice_generated',
                        payment_id: id,
                        invoice_number: invoiceNumber,
                        product: 'diagnostic',
                        pdf_size_bytes: invoice.size,
                        timestamp: new Date().toISOString(),
                    }));

                    // N12.A DT-04 : upload facture vers Storage aegis-documents (non-bloquant).
                    // Path : invoices/{invoice_number}/Facture_AEGIS_{invoice_number}.pdf
                    // Echec -> invoicePdfUrl reste null, archive jsPDF (pdf_base64) reste source.
                    if (supabase) {
                        const invoiceStoragePath = `invoices/${invoiceNumber}/Facture_AEGIS_${invoiceNumber}.pdf`;
                        try {
                            const invoiceBuffer = Buffer.from(invoice.base64, 'base64');
                            const { error: uploadErr } = await supabase.storage
                                .from('aegis-documents')
                                .upload(invoiceStoragePath, invoiceBuffer, {
                                    contentType: 'application/pdf',
                                    upsert: true,
                                });
                            if (uploadErr) {
                                console.error(JSON.stringify({
                                    event: 'invoice_storage_upload_failed',
                                    payment_id: id,
                                    invoice_number: invoiceNumber,
                                    path: invoiceStoragePath,
                                    error: uploadErr.message,
                                    severity: 'warning',
                                    timestamp: new Date().toISOString(),
                                }));
                            } else {
                                const { data: signedData } = await supabase.storage
                                    .from('aegis-documents')
                                    .createSignedUrl(invoiceStoragePath, 7 * 24 * 3600);
                                invoicePdfUrl = signedData?.signedUrl || null;
                                console.log(JSON.stringify({
                                    event: 'invoice_storage_upload_ok',
                                    payment_id: id,
                                    invoice_number: invoiceNumber,
                                    path: invoiceStoragePath,
                                    pdf_size_bytes: invoice.size,
                                    has_signed_url: invoicePdfUrl !== null,
                                    timestamp: new Date().toISOString(),
                                }));
                            }
                        } catch (se: unknown) {
                            console.warn(JSON.stringify({
                                event: 'invoice_storage_upload_error',
                                payment_id: id,
                                invoice_number: invoiceNumber,
                                path: invoiceStoragePath,
                                error: (se as { message?: string })?.message || 'unknown',
                                severity: 'warning',
                                timestamp: new Date().toISOString(),
                            }));
                        }
                    }

                    // INSERT invoices (idempotent : 23505 unique_violation = deja archive cote client MerciPage)
                    if (supabase) {
                        try {
                            const archivePromise = supabase
                                .from('invoices')
                                .insert({
                                    invoice_number: invoiceNumber,
                                    request_id: metadata.request_id || null,
                                    product: 'diagnostic',
                                    amount: '250.00',
                                    pdf_base64: invoice.base64,
                                    pdf_url: invoicePdfUrl,
                                    lang: metadata.lang === 'en' ? 'en' : 'fr',
                                });
                            const archiveTimeout = new Promise<{ error: { message?: string; code?: string } }>((_, reject) =>
                                setTimeout(() => reject(new Error('invoice_insert_timeout_3s')), 3000)
                            );
                            const archiveResult = await Promise.race([archivePromise, archiveTimeout]) as { error: { message?: string; code?: string } | null };

                            if (archiveResult.error) {
                                if (archiveResult.error.code === '23505') {
                                    console.log(JSON.stringify({
                                        event: 'invoice_archive_already_exists_webhook',
                                        payment_id: id,
                                        invoice_number: invoiceNumber,
                                        timestamp: new Date().toISOString(),
                                    }));
                                } else {
                                    console.warn(JSON.stringify({
                                        event: 'invoice_archive_insert_failed_webhook',
                                        payment_id: id,
                                        invoice_number: invoiceNumber,
                                        error: archiveResult.error.message || 'unknown',
                                        code: archiveResult.error.code || 'none',
                                        severity: 'warning',
                                        timestamp: new Date().toISOString(),
                                    }));
                                }
                            } else {
                                console.log(JSON.stringify({
                                    event: 'invoice_archive_stored_webhook',
                                    payment_id: id,
                                    invoice_number: invoiceNumber,
                                    pdf_size_bytes: invoice.size,
                                    timestamp: new Date().toISOString(),
                                }));
                            }
                        } catch (ae: unknown) {
                            const amsg = (ae as { message?: string })?.message || 'unknown';
                            console.warn(JSON.stringify({
                                event: 'invoice_archive_insert_timeout_webhook',
                                payment_id: id,
                                invoice_number: invoiceNumber,
                                error: amsg,
                                severity: 'warning',
                                timestamp: new Date().toISOString(),
                            }));
                        }
                    }
                } catch (ge: unknown) {
                    const gmsg = (ge as { message?: string })?.message || 'unknown';
                    console.error(JSON.stringify({
                        event: 'invoice_generate_failed',
                        payment_id: id,
                        invoice_number: invoiceNumber,
                        error: gmsg,
                        severity: 'warning',
                        timestamp: new Date().toISOString(),
                    }));
                    // Email part sans PJ : paiement confirme, facture archive ulterieurement via MerciPage client.
                }
            } else {
                console.warn(JSON.stringify({
                    event: 'invoice_skipped_no_number',
                    payment_id: id,
                    request_id: metadata.request_id || null,
                    severity: 'warning',
                    timestamp: new Date().toISOString(),
                }));
            }

            // === S4 Mission N11 : DIAGNOSTIC auto-generation trigger (Voie B serverless) ===
            // Fire-and-forget POST /api/generate-diagnostic. La fonction reçoit le request_id,
            // transitionne 'paid' -> 'generating' atomiquement, genere le rapport (Opus + jsPDF, ~30-90s)
            // et delivre par email (rapport PJ + facture PJ). Vercel maxDuration 300s (vercel.json).
            //
            // Pattern fire-and-forget : on attend max 1.5s pour que la requete arrive a la lambda
            // generate-diagnostic, puis on continue (la lambda continue independamment).
            // PS1 coexiste : pending_generations INSERT plus haut reste pour fallback manuel JP (rule #4 brief).
            if (metadata.request_id && process.env.AEGIS_ADMIN_KEY) {
                const triggerUrl = `${WEBHOOK_BASE_URL}/api/generate-diagnostic`;
                try {
                    const ac = new AbortController();
                    const abortTimer = setTimeout(() => ac.abort(), 1500);
                    await fetch(triggerUrl, {
                        method: 'POST',
                        headers: {
                            'x-admin-key': process.env.AEGIS_ADMIN_KEY,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ request_id: metadata.request_id }),
                        signal: ac.signal,
                    }).catch((fetchErr) => {
                        // Timeout/abort attendus : la lambda receveuse continue independamment.
                        const errMsg = (fetchErr as Error)?.message || 'unknown';
                        const isAbort = (fetchErr as Error)?.name === 'AbortError'
                            || errMsg.includes('aborted');
                        console.log(JSON.stringify({
                            event: isAbort
                                ? 'diagnostic_generation_triggered_fire_and_forget'
                                : 'diagnostic_generation_trigger_network_error',
                            payment_id: id,
                            request_id: metadata.request_id,
                            target: triggerUrl,
                            error: isAbort ? null : errMsg,
                            timestamp: new Date().toISOString(),
                        }));
                    });
                    clearTimeout(abortTimer);
                } catch (te: unknown) {
                    console.warn(JSON.stringify({
                        event: 'diagnostic_generation_trigger_failed',
                        payment_id: id,
                        request_id: metadata.request_id,
                        error: (te as Error)?.message || 'unknown',
                        severity: 'warning',
                        timestamp: new Date().toISOString(),
                    }));
                }
            } else if (metadata.request_id && !process.env.AEGIS_ADMIN_KEY) {
                console.warn(JSON.stringify({
                    event: 'diagnostic_generation_trigger_skipped_no_admin_key',
                    payment_id: id,
                    request_id: metadata.request_id,
                    severity: 'warning',
                    timestamp: new Date().toISOString(),
                }));
            }

            const emailData = {
                payment_id: id,
                request_id: metadata.request_id || undefined,
                email: metadata.email || undefined,
                customer_name: metadata.customer_name || undefined,
                customer_company: metadata.customer_company || undefined,
                product: metadata.product_description || metadata.product || undefined,
                lang: metadata.lang || undefined,
                mode: metadata.mode || undefined,
                amount: '250.00',
                sector: metadata.sector || undefined,
                regulations: metadata.regulations
                    ? metadata.regulations.split(', ') : undefined,
                context: metadata.context || undefined,
                invoice_number: metadata.invoice_number || undefined,
                pdf_base64: invoicePdfBase64,
                pdf_filename: invoicePdfFilename,
            };

            // Await with safety timeout 7s (Vercel function limit 10s)
            await Promise.race([
                Promise.allSettled([
                    sendClientConfirmation(emailData),
                    sendOpsNewOrder(emailData),
                ]).then(results => {
                    results.forEach((r, i) => {
                        const type = i === 0 ? 'client' : 'ops';
                        if (r.status === 'rejected') {
                            console.error(JSON.stringify({
                                event: 'mailer_failed',
                                payment_id: id,
                                request_id: metadata.request_id || null,
                                product: 'diagnostic',
                                recipient_type: type,
                                error: (r.reason as Error)?.message || 'unknown',
                                severity: 'critical',
                                timestamp: new Date().toISOString(),
                            }));
                        }
                    });
                }),
                new Promise<void>(resolve => setTimeout(() => {
                    console.error(JSON.stringify({
                        event: 'mailer_timeout_safety',
                        payment_id: id,
                        timestamp: new Date().toISOString(),
                    }));
                    resolve();
                }, 7000)),
            ]);
        } else if (status === 'paid') {
            console.log(JSON.stringify({
                event: 'mailer_skipped_idempotent',
                payment_id: id,
                timestamp: new Date().toISOString(),
            }));
        }

        // Always return 200 to Mollie (C4 : email failure != webhook failure)
        return res.status(200).json({ received: true, status });

    } catch (error: any) {
        console.error('Mollie webhook error:', error.message);
        // Return 200 even on error to prevent Mollie retry storms
        return res.status(200).json({ received: true, error: 'internal' });
    }
}
