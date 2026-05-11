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
 * Version : 2.3.0 -- 20260422T2130 -- Night N7 : INSERT pending_generations + idempotence Supabase-level (L_T2130_N7_01)
 */

import {
    sendClientConfirmation,
    sendOpsNewOrder,
    sendVeilleClientConfirmation,
    sendVeilleActivationConfirmation,
    sendVeilleOpsNewOrder,
    sendVeilleRecurringOps,
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

// S3 Mission N11 : webhook URL pour subscription Mollie auto-creee.
// Symetrique a mollie-checkout.ts / mollie-subscription.ts (preserve preview branch URL).
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

        // V360 — branch dispatch product (veille vs diagnostic)
        const isVeille = metadata.product === 'veille';
        const targetTable = isVeille ? 'veille_requests' : 'diagnostic_requests';

        // S3 Mission N11 : VEILLE recurring branch (sequenceType='recurring')
        // Mollie re-declenche le webhook a chaque prelevement mensuel. On log + ops mail.
        // PAS de re-creation subscription, PAS d'invoice serveur (la facture mensuelle est generee
        // par S5 distribute-veille-report ou via flow simplifie ulterieur).
        const sequenceType = (payment.sequenceType as string | undefined) || undefined;
        const subscriptionIdFromPayment = (payment.subscriptionId as string | undefined) || undefined;
        const isVeilleRecurring = isVeille && sequenceType === 'recurring';

        if (status === 'paid' && isVeilleRecurring) {
            if (!isAlreadyProcessed(id)) {
                markProcessed(id);

                const subId = subscriptionIdFromPayment || metadata.subscription_id || null;
                const recurringAmount = payment.amount?.value || '150.00';
                const period = new Date().toISOString().slice(0, 7); // YYYY-MM

                // INSERT veille_payments (idempotent : payment_id UNIQUE)
                if (supabase) {
                    try {
                        const insertPromise = supabase
                            .from('veille_payments')
                            .insert({
                                subscription_id: subId,
                                payment_id: id,
                                amount: recurringAmount,
                                status: 'paid',
                                period,
                            });
                        const insertTimeout = new Promise<{ error: { message?: string; code?: string } }>((_, reject) =>
                            setTimeout(() => reject(new Error('veille_payments_insert_timeout_3s')), 3000)
                        );
                        const ipsResult = await Promise.race([insertPromise, insertTimeout]) as {
                            error: { message?: string; code?: string } | null
                        };
                        if (ipsResult.error) {
                            if (ipsResult.error.code === '23505') {
                                console.log(JSON.stringify({
                                    event: 'veille_payments_already_exists',
                                    payment_id: id,
                                    timestamp: new Date().toISOString(),
                                }));
                            } else {
                                console.warn(JSON.stringify({
                                    event: 'veille_payments_insert_failed',
                                    payment_id: id,
                                    error: ipsResult.error.message || 'unknown',
                                    code: ipsResult.error.code || 'none',
                                    severity: 'warning',
                                    timestamp: new Date().toISOString(),
                                }));
                            }
                        } else {
                            console.log(JSON.stringify({
                                event: 'veille_payments_logged',
                                payment_id: id,
                                subscription_id: subId,
                                amount: recurringAmount,
                                period,
                                timestamp: new Date().toISOString(),
                            }));
                        }
                    } catch (re: unknown) {
                        const rmsg = (re as { message?: string })?.message || 'unknown';
                        console.warn(JSON.stringify({
                            event: 'veille_payments_insert_timeout',
                            payment_id: id,
                            error: rmsg,
                            severity: 'warning',
                            timestamp: new Date().toISOString(),
                        }));
                    }
                }

                // Email ops simple (best-effort, 5s safety)
                await Promise.race([
                    sendVeilleRecurringOps({
                        payment_id: id,
                        subscription_id: subId || undefined,
                        amount: recurringAmount,
                        period,
                        mode: metadata.mode || undefined,
                    }).catch((e) => {
                        console.error(JSON.stringify({
                            event: 'veille_recurring_ops_mail_failed',
                            payment_id: id,
                            error: (e as Error)?.message || 'unknown',
                            severity: 'warning',
                            timestamp: new Date().toISOString(),
                        }));
                    }),
                    new Promise<void>(resolve => setTimeout(resolve, 5000)),
                ]);
            } else {
                console.log(JSON.stringify({
                    event: 'veille_recurring_skipped_idempotent',
                    payment_id: id,
                    timestamp: new Date().toISOString(),
                }));
            }
            return res.status(200).json({ received: true, status, sequence: 'recurring' });
        }

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
                        .from(targetTable)
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
                            product: metadata.product || 'diagnostic',
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
                        .from(targetTable)
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
                            target_table: targetTable,
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
                            target_table: targetTable,
                            new_status: 'paid',
                            timestamp: new Date().toISOString(),
                        }));

                        // Phase C auto-queue : signal post-UPDATE pour PS1 watchdog / n8n W4
                        if (isVeille) {
                            console.log(JSON.stringify({
                                event: 'veille_ready_for_activation',
                                request_id: metadata.request_id,
                                invoice_number: metadata.invoice_number || null,
                                timestamp: new Date().toISOString(),
                            }));
                        } else {
                            console.log(JSON.stringify({
                                event: 'diagnostic_ready_for_generation',
                                request_id: metadata.request_id,
                                invoice_number: metadata.invoice_number || null,
                                lang: metadata.lang || 'fr',
                                timestamp: new Date().toISOString(),
                            }));
                        }

                        // Night N7 Option β : INSERT pending_generations (DIAGNOSTIC uniquement — pipeline PS1 Opus rapport)
                        // V360 : VEILLE pas de pending_generations (Phase 1 = JP crée subscription Mollie manuellement)
                        if (!isVeille) try {
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
            let invoicePdfBase64: string | undefined;
            let invoicePdfFilename: string | undefined;
            const invoiceNumber = metadata.invoice_number || undefined;

            if (invoiceNumber) {
                try {
                    const invoice = generateInvoicePdf({
                        invoice_number: invoiceNumber,
                        product: isVeille ? 'veille' : 'diagnostic',
                        lang: (metadata.lang === 'en' ? 'en' : 'fr') as 'fr' | 'en',
                        amount: isVeille ? '150.00' : '250.00',
                        customer_name: metadata.customer_name || undefined,
                        customer_company: metadata.customer_company || undefined,
                        customer_email: metadata.email || undefined,
                        sector: metadata.sector || undefined,
                        regulations: metadata.regulations
                            ? (metadata.regulations as string).split(', ').filter((s: string) => s.trim().length > 0)
                            : undefined,
                        context: metadata.context || undefined,
                    });
                    invoicePdfBase64 = invoice.base64;
                    invoicePdfFilename = invoice.filename;

                    console.log(JSON.stringify({
                        event: 'invoice_generated',
                        payment_id: id,
                        invoice_number: invoiceNumber,
                        product: isVeille ? 'veille' : 'diagnostic',
                        pdf_size_bytes: invoice.size,
                        timestamp: new Date().toISOString(),
                    }));

                    // INSERT invoices (idempotent : 23505 unique_violation = deja archive cote client MerciPage)
                    if (supabase) {
                        try {
                            const archivePromise = supabase
                                .from('invoices')
                                .insert({
                                    invoice_number: invoiceNumber,
                                    request_id: metadata.request_id || null,
                                    product: isVeille ? 'veille' : 'diagnostic',
                                    amount: isVeille ? '150.00' : '250.00',
                                    pdf_base64: invoice.base64,
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
            if (!isVeille && metadata.request_id && process.env.AEGIS_ADMIN_KEY) {
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
            } else if (!isVeille && metadata.request_id && !process.env.AEGIS_ADMIN_KEY) {
                console.warn(JSON.stringify({
                    event: 'diagnostic_generation_trigger_skipped_no_admin_key',
                    payment_id: id,
                    request_id: metadata.request_id,
                    severity: 'warning',
                    timestamp: new Date().toISOString(),
                }));
            }

            // === S3 Mission N11 : VEILLE auto-subscription creation (sequenceType='first') ===
            // Mollie API : POST /v2/customers/{cid}/subscriptions cree le mandate recurrent.
            // Echec gracieux : si la creation echoue, status reste 'paid', ops alerte JP pour intervention manuelle.
            let veilleSubscriptionId: string | undefined;
            let veilleActivationOk = false;
            if (isVeille && metadata.customer_id && MOLLIE_API_KEY) {
                try {
                    const subPromise = (async () => {
                        const subRes = await fetch(`https://api.mollie.com/v2/customers/${metadata.customer_id}/subscriptions`, {
                            method: 'POST',
                            headers: {
                                Authorization: `Bearer ${MOLLIE_API_KEY}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                amount: { currency: 'EUR', value: '150.00' },
                                interval: '1 month',
                                description: metadata.lang === 'en'
                                    ? 'AEGIS Intelligence — EU Regulatory Watch (monthly)'
                                    : 'AEGIS Intelligence — Veille reglementaire EU (mensuel)',
                                webhookUrl: `${WEBHOOK_BASE_URL}/api/mollie-webhook`,
                                metadata: {
                                    product: 'veille',
                                    request_id: metadata.request_id || null,
                                    customer_id: metadata.customer_id,
                                    lang: metadata.lang || 'fr',
                                },
                            }),
                        });
                        if (!subRes.ok) {
                            const errText = await subRes.text();
                            throw new Error(`mollie_sub_${subRes.status}: ${errText.slice(0, 200)}`);
                        }
                        return subRes.json();
                    })();
                    const subTimeout = new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error('mollie_sub_create_timeout_5s')), 5000)
                    );
                    const subData = await Promise.race([subPromise, subTimeout]) as { id?: string };
                    veilleSubscriptionId = subData.id;
                    veilleActivationOk = Boolean(veilleSubscriptionId);

                    console.log(JSON.stringify({
                        event: 'veille_subscription_created',
                        payment_id: id,
                        request_id: metadata.request_id || null,
                        customer_id: metadata.customer_id,
                        subscription_id: veilleSubscriptionId,
                        timestamp: new Date().toISOString(),
                    }));

                    // UPDATE veille_requests : status='active' + subscription_id + customer_id
                    if (supabase && veilleSubscriptionId && metadata.request_id) {
                        try {
                            const upPromise = supabase
                                .from('veille_requests')
                                .update({
                                    status: 'active',
                                    subscription_id: veilleSubscriptionId,
                                    customer_id: metadata.customer_id,
                                    updated_at: new Date().toISOString(),
                                })
                                .eq('request_id', metadata.request_id);
                            const upTimeout = new Promise<{ error: { message: string } }>((_, reject) =>
                                setTimeout(() => reject(new Error('veille_active_update_timeout_3s')), 3000)
                            );
                            const upResult = await Promise.race([upPromise, upTimeout]) as { error: unknown };
                            if ((upResult as { error: { message?: string } }).error) {
                                console.warn(JSON.stringify({
                                    event: 'veille_active_update_failed',
                                    payment_id: id,
                                    request_id: metadata.request_id,
                                    error: ((upResult as { error: { message?: string } }).error.message) || 'unknown',
                                    severity: 'warning',
                                    timestamp: new Date().toISOString(),
                                }));
                            } else {
                                console.log(JSON.stringify({
                                    event: 'veille_active_update_ok',
                                    payment_id: id,
                                    request_id: metadata.request_id,
                                    subscription_id: veilleSubscriptionId,
                                    timestamp: new Date().toISOString(),
                                }));
                            }
                        } catch (ue: unknown) {
                            console.warn(JSON.stringify({
                                event: 'veille_active_update_timeout',
                                payment_id: id,
                                error: (ue as Error)?.message || 'unknown',
                                severity: 'warning',
                                timestamp: new Date().toISOString(),
                            }));
                        }
                    }
                } catch (se: unknown) {
                    const smsg = (se as { message?: string })?.message || 'unknown';
                    console.error(JSON.stringify({
                        event: 'veille_subscription_creation_failed',
                        payment_id: id,
                        request_id: metadata.request_id || null,
                        customer_id: metadata.customer_id || null,
                        error: smsg,
                        severity: 'critical',
                        timestamp: new Date().toISOString(),
                    }));
                    // Fallback : status reste 'paid', ops mail flag manuel pour creation subscription.
                }
            } else if (isVeille && !metadata.customer_id) {
                console.warn(JSON.stringify({
                    event: 'veille_subscription_skipped_no_customer_id',
                    payment_id: id,
                    request_id: metadata.request_id || null,
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
                amount: isVeille ? '150.00' : '250.00',
                sector: metadata.sector || undefined,
                regulations: metadata.regulations
                    ? metadata.regulations.split(', ') : undefined,
                context: metadata.context || undefined,
                invoice_number: metadata.invoice_number || undefined,
                pdf_base64: invoicePdfBase64,
                pdf_filename: invoicePdfFilename,
                subscription_id: veilleSubscriptionId,
            };

            // V360 + S3 : dispatch mailers par produit
            //  - VEILLE activation OK -> sendVeilleActivationConfirmation (subscription cree auto)
            //  - VEILLE activation FAIL -> sendVeilleClientConfirmation (fallback Phase 1, JP gere manuellement)
            const clientMailer = isVeille
                ? (veilleActivationOk ? sendVeilleActivationConfirmation : sendVeilleClientConfirmation)
                : sendClientConfirmation;
            const opsMailer = isVeille ? sendVeilleOpsNewOrder : sendOpsNewOrder;

            // Await with safety timeout 7s (Vercel function limit 10s)
            await Promise.race([
                Promise.allSettled([
                    clientMailer(emailData),
                    opsMailer(emailData),
                ]).then(results => {
                    results.forEach((r, i) => {
                        const type = i === 0 ? 'client' : 'ops';
                        if (r.status === 'rejected') {
                            console.error(JSON.stringify({
                                event: 'mailer_failed',
                                payment_id: id,
                                request_id: metadata.request_id || null,
                                product: metadata.product || 'diagnostic',
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
