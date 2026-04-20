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
 * Idempotence : in-memory Set per warm instance (DETTE7 : Vercel KV v3.4.6).
 * NIGHT-N5 Phase B3 : update Supabase status=paid + paid_at + payment_id (NON-BLOQUANT).
 *
 * Version : 2.2.0 -- 20260420 -- FIX silent fail update await Promise.race 3s (Promise.race 7s emails C3-bis inchange)
 */

import {
    sendClientConfirmation,
    sendOpsNewOrder,
    isAlreadyProcessed,
    markProcessed,
} from './_lib/mailer.js';
import { supabase } from './_lib/supabase.js';

const VERCEL_ENV = process.env.VERCEL_ENV || 'development';
const MOLLIE_API_KEY =
    VERCEL_ENV === 'production'
        ? process.env.MOLLIE_API_KEY_LIVE
        : process.env.MOLLIE_API_KEY_TEST;

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

            // NIGHT-N5 Phase B3 + v2.2.0 FIX : update Supabase status=paid (AWAIT Promise.race 3s)
            // v2.1.0 fire-and-forget .then() etait tue par Vercel serverless apres return res.
            // v2.2.0 : await Promise.race(update, timeout3s) garantit execution avant Promise.race 7s emails.
            // Placement AVANT le Promise.race emails C3-bis (inchange) conforme audit L2 T2035.
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
                        .eq('request_id', metadata.request_id);

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
                            new_status: 'paid',
                            timestamp: new Date().toISOString(),
                        }));
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
