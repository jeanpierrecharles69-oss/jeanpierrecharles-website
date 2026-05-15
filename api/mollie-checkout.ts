import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * AEGIS Intelligence -- Proxy Mollie Payments API v2
 * SECURITE : Cle API dans variables Vercel (JAMAIS dans le code)
 * CORS : Restreint a jeanpierrecharles.com + localhost dev
 * Usage : Checkout one-shot DIAGNOSTIC 250 EUR
 * Version : 1.3.3 -- 20260427T1448 CET -- FIX L_T1158_01 locale Mollie dynamique selon lang (fr_FR / en_GB)
 * Version : 1.3.2 -- 20260427T1320 CET -- FIX L_T1212_01 propagation invoice_number + ref dans redirectUrl (cross-origin sessionStorage perte preview cobaye-2-en)
 * Version : 1.3.1 -- 20260424T1715 CET -- metadata allege (1kB limit Mollie) product_description 100c regulations 80c context null
 */

// Selection automatique de la cle Mollie selon l'environnement Vercel
// Production = LIVE, Preview/Development = TEST
// Bump : 20260409T1410 - protection contre debit involontaire pendant la phase J-6 -> J0
const VERCEL_ENV = process.env.VERCEL_ENV || 'development';
const MOLLIE_API_KEY =
    VERCEL_ENV === 'production'
        ? process.env.MOLLIE_API_KEY_LIVE
        : process.env.MOLLIE_API_KEY_TEST;
const MOLLIE_MODE = VERCEL_ENV === 'production' ? 'LIVE' : 'TEST';
const MOLLIE_API_URL = 'https://api.mollie.com/v2/payments';

// Webhook URL dynamique (v1.3.0)
// - Production : URL fixe jeanpierrecharles.com (v1.2.0 preserve)
// - Preview : URL branch stable via VERCEL_BRANCH_URL (asset V&V permanent Rupture 2 FAI)
// - Development : fallback production (Mollie webhook inaccessible localhost)
// Note : VERCEL_BRANCH_URL stable tant que branche existe (vs VERCEL_URL qui change chaque deploy).
const WEBHOOK_BASE_URL = (() => {
    if (VERCEL_ENV === 'production') return 'https://jeanpierrecharles.com';
    if (VERCEL_ENV === 'preview' && process.env.VERCEL_BRANCH_URL) {
        return `https://${process.env.VERCEL_BRANCH_URL}`;
    }
    return 'https://jeanpierrecharles.com'; // fallback dev + preview sans VERCEL_BRANCH_URL
})();

const ALLOWED_ORIGINS = [
    'https://jeanpierrecharles.com',
    'https://www.jeanpierrecharles.com',
    'http://localhost:5173',
    'http://localhost:3000',
];

// Rate limiting (5 req/min par IP — plus strict que brain)
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

// Produits autorises (extensible v3.4+)
const PRODUCTS: Record<string, { amount: string; description_fr: string; description_en: string }> = {
    diagnostic: {
        amount: '250.00',
        description_fr: 'AEGIS Intelligence — Diagnostic Conformité Industrielle EU',
        description_en: 'AEGIS Intelligence — EU Industrial Compliance Diagnostic',
    },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
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

    // Log observabilite config checkout (v1.3.0, R_T1340_01 strict : aucun secret expose)
    console.log(JSON.stringify({
        event: 'mollie_checkout_config',
        env: VERCEL_ENV,
        mode: MOLLIE_MODE,
        webhook_base: WEBHOOK_BASE_URL,
        timestamp: new Date().toISOString(),
    }));

    // Validation defensive : si on est en production et qu'on a une cle test, REFUS
    // Et reciproquement : si on est en preview/dev avec une cle live, REFUS
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
                sector, product_description, regulations, context,
                invoice_number } = req.body;

        // Validation produit
        const productConfig = PRODUCTS[product];
        if (!productConfig) {
            return res.status(400).json({
                error: `Produit invalide. Produits autorises : ${Object.keys(PRODUCTS).join(', ')}`,
            });
        }

        const langKey = lang === 'en' ? 'en' : 'fr';
        const description = langKey === 'en' ? productConfig.description_en : productConfig.description_fr;

        // Determiner base URL pour redirect (C10a correctif T1600).
        // Localhost dev : reflechi l'origin (developpement local).
        // Preview/Production : utilise WEBHOOK_BASE_URL deja conditionnel (preview branch URL
        // si VERCEL_BRANCH_URL existe, sinon production). Cela evite que la MerciPage Preview
        // redirige vers le domaine production (constat smoke T1405 : URL prod sur Preview).
        const baseUrl = origin.includes('localhost') ? origin : WEBHOOK_BASE_URL;

        // Creation paiement Mollie v2
        const mollieBody = {
            amount: {
                currency: 'EUR',
                value: productConfig.amount,
            },
            description,
            locale: langKey === 'en' ? 'en_GB' : 'fr_FR',
            redirectUrl: `${baseUrl}/merci?product=${product}&lang=${langKey}`
                + (invoice_number ? `&invoice=${encodeURIComponent(invoice_number)}` : '')
                + (request_id ? `&ref=${encodeURIComponent(request_id)}` : ''),
            webhookUrl: `${WEBHOOK_BASE_URL}/api/mollie-webhook`,
            metadata: {
                product,
                lang: langKey,
                email: email || 'non fourni',
                source: 'jeanpierrecharles.com',
                version: 'v3.4.6',
                mode: MOLLIE_MODE,
                request_id: request_id || null,
                customer_name: customer_name || null,
                customer_company: customer_company || null,
                sector: sector || null,
                product_description: typeof product_description === 'string'
                    ? product_description.slice(0, 100) : null,
                regulations: Array.isArray(regulations)
                    ? regulations.join(', ').slice(0, 80) : null,
                context: null, // v1.3.1 -- donnees completes dans Supabase diagnostic_requests via request_id
                invoice_number: invoice_number || null,
            },
        };

        // Email self-block : refus de checkout si l'email appartient au domaine jeanpierrecharles.com
        // en mode LIVE (evite que JP teste accidentellement sur sa propre carte en production)
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

        // D_T1105_01 : LIVE host whitelist (defense-in-depth bridge forensique T1100 §3)
        // Bloque tout paiement LIVE depuis un host non-canonique (ex. alias .vercel.app du
        // Production deployment, confondu avec un Preview). Symetrique au garde-fou env/cle L101-108.
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

        // Retourner le checkout URL pour redirection client
        return res.status(200).json({
            checkoutUrl: data._links?.checkout?.href || null,
            paymentId: data.id,
            status: data.status,
        });

    } catch (error: any) {
        console.error('Mollie proxy error:', error);
        return res.status(500).json({ error: 'Erreur interne', message: error.message });
    }
}
