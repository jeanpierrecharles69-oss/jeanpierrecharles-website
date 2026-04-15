import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * AEGIS Intelligence -- Mollie Webhook Handler
 * Called by Mollie when a payment status changes.
 *
 * SECURITE : Mollie sends only the payment ID in the webhook body.
 * We must re-query Mollie API to get actual status (never trust webhook body alone).
 *
 * Phase 0 (J0) : Log payment status. JP correlates via Mollie Dashboard + email.
 * Phase 2 : Send structured email to JP with request_id from metadata.
 *
 * Version : 1.0.0 -- 20260415 -- MISSION-J0-EXEC-PCR-02 CHANGE-10
 */

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

        // Phase 2: On status === 'paid', send structured email to JP
        // with request_id, customer info from metadata, payment confirmation
        // JP_INPUT_NEEDED: SMTP credentials for email notification

        // Always return 200 to Mollie (acknowledges receipt)
        return res.status(200).json({ received: true, status });

    } catch (error: any) {
        console.error('Mollie webhook error:', error.message);
        // Return 200 even on error to prevent Mollie retry storms
        return res.status(200).json({ received: true, error: 'internal' });
    }
}
