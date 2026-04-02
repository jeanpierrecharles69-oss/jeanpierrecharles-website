import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * AEGIS Intelligence -- Proxy Mollie Payments API v2
 * SECURITE : Cle API dans variables Vercel (JAMAIS dans le code)
 * CORS : Restreint a jeanpierrecharles.com + localhost dev
 * Usage : Checkout one-shot DIAGNOSTIC 250 EUR
 * Version : 1.0.0 -- 20260401T1500 CET
 */

const MOLLIE_API_KEY = process.env.MOLLIE_API_KEY;
const MOLLIE_API_URL = 'https://api.mollie.com/v2/payments';

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
        description_fr: 'AEGIS Intelligence — Diagnostic Conformite Industrielle EU',
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
        console.error('MOLLIE_API_KEY not configured in Vercel environment variables');
        return res.status(500).json({ error: 'Service de paiement non configure.' });
    }

    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
                     || req.socket?.remoteAddress || 'unknown';
    if (isRateLimited(clientIp)) {
        return res.status(429).json({ error: 'Trop de requetes. Patientez 1 minute.' });
    }

    try {
        const { product, lang, email } = req.body;

        // Validation produit
        const productConfig = PRODUCTS[product];
        if (!productConfig) {
            return res.status(400).json({
                error: `Produit invalide. Produits autorises : ${Object.keys(PRODUCTS).join(', ')}`,
            });
        }

        const langKey = lang === 'en' ? 'en' : 'fr';
        const description = langKey === 'en' ? productConfig.description_en : productConfig.description_fr;

        // Determiner base URL pour redirect
        const baseUrl = origin.includes('localhost')
            ? origin
            : 'https://jeanpierrecharles.com';

        // Creation paiement Mollie v2
        const mollieBody = {
            amount: {
                currency: 'EUR',
                value: productConfig.amount,
            },
            description,
            redirectUrl: `${baseUrl}/merci?product=${product}&lang=${langKey}`,
            metadata: {
                product,
                lang: langKey,
                email: email || 'non fourni',
                source: 'jeanpierrecharles.com',
                version: 'v3.3',
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
