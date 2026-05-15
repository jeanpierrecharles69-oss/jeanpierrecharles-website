import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * AEGIS Intelligence -- Proxy Mollie Subscription API v2 (V360)
 * Calque mollie-checkout.ts v1.3.3 — différences ciblées :
 *   - sequenceType: "first" (au lieu de "oneoff" implicite) → crée mandate pour récurrence future
 *   - Montant 150.00 EUR / Description VEILLE 1er mois
 *   - redirectUrl /merci?product=veille&lang=...
 *   - metadata.product = "veille"
 *
 * Phase 1 MVP : Mollie subscription récurrente créée manuellement par JP dans dashboard
 * pour les premiers clients. Phase 2 (J+14) automatisera customer→mandate→subscription.
 *
 * SECURITE : Cle API dans variables Vercel (JAMAIS dans le code)
 * CORS : Restreint a jeanpierrecharles.com + localhost dev
 *
 * Version : 1.0.0 -- 20260430T1100 -- V360 MVP subscription
 */

const VERCEL_ENV = process.env.VERCEL_ENV || 'development';
const MOLLIE_API_KEY =
    VERCEL_ENV === 'production'
        ? process.env.MOLLIE_API_KEY_LIVE
        : process.env.MOLLIE_API_KEY_TEST;
const MOLLIE_MODE = VERCEL_ENV === 'production' ? 'LIVE' : 'TEST';
const MOLLIE_API_URL = 'https://api.mollie.com/v2/payments';

const WEBHOOK_BASE_URL = (() => {
    if (VERCEL_ENV === 'production') return 'https://jeanpierrecharles.com';
    if (VERCEL_ENV === 'preview' && process.env.VERCEL_BRANCH_URL) {
        return `https://${process.env.VERCEL_BRANCH_URL}`;
    }
    return 'https://jeanpierrecharles.com';
})();

const ALLOWED_ORIGINS = [
    'https://jeanpierrecharles.com',
    'https://www.jeanpierrecharles.com',
    'http://localhost:5173',
    'http://localhost:3000',
];

// Rate limiting (5 req/min par IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 1000;

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now > entry.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
        return false;
    }
    entry.count++;
    return entry.count > RATE_LIMIT;
}

const VEILLE_AMOUNT = '150.00';
const VEILLE_DESC_FR = 'AEGIS Intelligence — Veille réglementaire EU (1er mois)';
const VEILLE_DESC_EN = 'AEGIS Intelligence — EU Regulatory Watch (1st month)';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const origin = req.headers.origin || '';
    const allowedOrigin = ALLOWED_ORIGINS.find(o => origin.startsWith(o)) || ALLOWED_ORIGINS[0];
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Vary', 'Origin');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    if (!MOLLIE_API_KEY) {
        console.error(`MOLLIE_API_KEY missing for VERCEL_ENV=${VERCEL_ENV}`);
        return res.status(500).json({
            error: 'Payment provider not configured',
            mode: MOLLIE_MODE,
            env: VERCEL_ENV,
        });
    }

    console.log(JSON.stringify({
        event: 'mollie_subscription_config',
        env: VERCEL_ENV,
        mode: MOLLIE_MODE,
        webhook_base: WEBHOOK_BASE_URL,
        timestamp: new Date().toISOString(),
    }));

    // Validation defensive : env <-> Mollie key mismatch
    if (VERCEL_ENV === 'production' && !MOLLIE_API_KEY.startsWith('live_')) {
        console.error('CRITICAL: production env with non-live Mollie key');
        return res.status(500).json({ error: 'Payment provider misconfiguration (env mismatch)' });
    }
    if (VERCEL_ENV !== 'production' && !MOLLIE_API_KEY.startsWith('test_')) {
        console.error(`CRITICAL: ${VERCEL_ENV} env with non-test Mollie key`);
        return res.status(500).json({ error: 'Payment provider misconfiguration (env mismatch)' });
    }

    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
        || req.socket?.remoteAddress || 'unknown';
    if (isRateLimited(clientIp)) {
        return res.status(429).json({ error: 'Trop de requetes. Patientez 1 minute.' });
    }

    try {
        const { product, lang, email, request_id, customer_name, customer_company,
                sector, regulations, context, invoice_number } = req.body;

        // Produit cible : "veille" uniquement (endpoint dédié)
        if (product !== 'veille') {
            return res.status(400).json({
                error: 'Produit invalide. Cet endpoint accepte uniquement product=veille.',
            });
        }

        const langKey = lang === 'en' ? 'en' : 'fr';
        const description = langKey === 'en' ? VEILLE_DESC_EN : VEILLE_DESC_FR;

        const baseUrl = origin.includes('localhost')
            ? origin
            : 'https://jeanpierrecharles.com';

        // Email self-block : refus en LIVE si email @jeanpierrecharles.com
        // (fait AVANT creation customer Mollie pour eviter de polluer le dashboard avec self-tests)
        const SELF_DOMAIN = 'jeanpierrecharles.com';
        if (MOLLIE_MODE === 'LIVE' && email && typeof email === 'string') {
            const emailLower = email.toLowerCase();
            if (emailLower.endsWith(`@${SELF_DOMAIN}`)) {
                console.warn(`Self-block triggered for email ${emailLower} in LIVE mode`);
                return res.status(403).json({
                    error: 'Self-test blocked',
                    message: 'Use Preview/Development environment with test Mollie key for self-tests.',
                    mode: MOLLIE_MODE,
                });
            }
        }

        // D_T1105_02 : LIVE host whitelist (defense-in-depth bridge forensique T1100 §3)
        // Symetrique mollie-checkout.ts D_T1105_01.
        const host = req.headers['host'] || req.headers['x-forwarded-host'] || '';
        const PRODUCTION_HOSTS = ['jeanpierrecharles.com', 'www.jeanpierrecharles.com'];
        if (MOLLIE_API_KEY?.startsWith('live_') && !PRODUCTION_HOSTS.includes(String(host))) {
            console.error(JSON.stringify({
                event: 'mollie_live_host_block',
                host: String(host),
                origin,
                mode: MOLLIE_MODE,
                timestamp: new Date().toISOString(),
            }));
            return res.status(403).json({
                error: 'Live payments are only allowed on the production domain.',
                host: String(host),
            });
        }

        // --- Step 1 : Create Mollie customer (REQUIS pour sequenceType:'first' subscription recurrente)
        // Mollie API v2 exige customerId pour tout paiement first/recurring (FIX 422 customerId field)
        const customerName = (typeof customer_name === 'string' && customer_name.trim()) || 'Client AEGIS';
        const customerEmail = (typeof email === 'string' && email) ? email : '';

        const customerRes = await fetch('https://api.mollie.com/v2/customers', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MOLLIE_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: customerName,
                email: customerEmail,
                metadata: {
                    company: customer_company || null,
                    request_id: request_id || null,
                    source: 'aegis-veille-subscription',
                },
            }),
        });

        if (!customerRes.ok) {
            const errText = await customerRes.text();
            console.error(JSON.stringify({
                event: 'mollie_customer_creation_failed',
                status: customerRes.status,
                error: errText,
                mode: MOLLIE_MODE,
                timestamp: new Date().toISOString(),
            }));
            return res.status(500).json({ error: 'Payment provider error' });
        }

        const customer = await customerRes.json();
        const customerId: string = customer.id; // format : cst_XXXXXXXXXX

        console.log(JSON.stringify({
            event: 'mollie_customer_created',
            customer_id: customerId,
            mode: MOLLIE_MODE,
            request_id: request_id || null,
            timestamp: new Date().toISOString(),
        }));

        const mollieBody = {
            amount: {
                currency: 'EUR',
                value: VEILLE_AMOUNT,
            },
            customerId, // V360 FIX : requis Mollie API v2 quand sequenceType=first
            description,
            sequenceType: 'first', // V360 : prépare mandate pour récurrence future (vs "oneoff" diagnostic)
            locale: langKey === 'en' ? 'en_GB' : 'fr_FR',
            redirectUrl: `${baseUrl}/merci?product=veille&lang=${langKey}`
                + (invoice_number ? `&invoice=${encodeURIComponent(invoice_number)}` : '')
                + (request_id ? `&ref=${encodeURIComponent(request_id)}` : ''),
            webhookUrl: `${WEBHOOK_BASE_URL}/api/mollie-webhook`,
            metadata: {
                product: 'veille',
                lang: langKey,
                email: email || 'non fourni',
                source: 'jeanpierrecharles.com',
                version: 'v3.6.0',
                mode: MOLLIE_MODE,
                request_id: request_id || null,
                customer_id: customerId, // V360 FIX : tracable webhook + future facturation recurrente
                customer_name: customer_name || null,
                customer_company: customer_company || null,
                sector: typeof sector === 'string' ? sector.slice(0, 100) : null,
                regulations: Array.isArray(regulations)
                    ? regulations.join(', ').slice(0, 80) : null,
                context: null, // donnees completes dans Supabase veille_requests via request_id
                invoice_number: invoice_number || null,
            },
        };

        const response = await fetch(MOLLIE_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MOLLIE_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mollieBody),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('Mollie API error:', response.status, errText);
            return res.status(response.status).json({
                error: 'Erreur paiement',
                details: errText,
            });
        }

        const data = await response.json();

        return res.status(200).json({
            checkoutUrl: data._links?.checkout?.href || null,
            paymentId: data.id,
            status: data.status,
        });

    } catch (error: any) {
        console.error('Mollie subscription proxy error:', error);
        return res.status(500).json({ error: 'Erreur interne', message: error.message });
    }
}
