import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendOpsPreNotify } from './_lib/mailer.js';
import { supabase, logSupabaseUnavailable } from './_lib/supabase.js';
import { getCetDateParts } from './_lib/cet-timestamp.js';

/**
 * AEGIS Intelligence -- Diagnostic Request Handler
 * Receives pre-checkout form data, generates request_id, logs for JP.
 *
 * SECURITE : No sensitive data in logs. Only request_id + timestamp.
 * EMAIL Phase 2 ACTIVE : sendOpsPreNotify best-effort (kill switch OPS_PRENOTIFY_ENABLED).
 *
 * INVARIANT HA-1 (F-01) : AUCUNE URL de checkout emise sans intake durable confirme.
 * Echec/timeout/client absent Supabase -> 503 { error: 'service_unavailable', retryable: true }.
 *
 * Version : 3.1.0 -- 20260819 -- HB-1 F-08 : invoice_number suffixe 4 hex request_id (anti-collision intra-minute)
 * Version : 3.0.0 -- 20260819 -- HA-1 F-01 : fail-visible intake (503 si INSERT non confirme, fin du fail-open 200)
 * Version : 2.2.0 -- 20260420 -- FIX silent fail await Promise.race 3s (kill fire-and-forget Vercel serverless)
 */

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

// Email format validation
function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Sanitize string input (strip HTML tags, trim, limit length)
function sanitize(input: unknown, maxLen: number): string {
    if (typeof input !== 'string') return '';
    return input.replace(/<[^>]*>/g, '').trim().slice(0, maxLen);
}

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

    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
        || req.socket?.remoteAddress || 'unknown';
    if (isRateLimited(clientIp)) {
        return res.status(429).json({ error: 'Trop de requetes. Patientez 1 minute.' });
    }

    try {
        const body = req.body;

        // Server-side validation (re-verify what client validated)
        const email = sanitize(body.email, 320);
        const firstName = sanitize(body.firstName, 100);
        const lastName = sanitize(body.lastName, 100);
        const company = sanitize(body.company, 200);
        const country = sanitize(body.country, 100);
        const city = sanitize(body.city, 100);
        const sector = sanitize(body.sector, 100);
        const product = sanitize(body.product, 500);
        const context = sanitize(body.context, 2000);
        const regulations: string[] = Array.isArray(body.regulations)
            ? body.regulations.map((r: unknown) => sanitize(r, 50)).filter(Boolean)
            : [];

        // Required field checks
        const errors: string[] = [];
        if (!email || !isValidEmail(email)) errors.push('email');
        if (!firstName) errors.push('firstName');
        if (!lastName) errors.push('lastName');
        if (!company) errors.push('company');
        if (!country) errors.push('country');
        if (!city) errors.push('city');
        if (!sector) errors.push('sector');
        if (!product || product.length < 50) errors.push('product');
        if (regulations.length === 0) errors.push('regulations');

        if (errors.length > 0) {
            return res.status(400).json({
                error: 'Validation failed',
                fields: errors,
            });
        }

        // Generate request_id (UUID v4) + invoice_number (FIX-04)
        // N12.A DT-01 : invoice_number en CET Paris (Vercel Lambda TZ=UTC sinon decalage 1-2h).
        // HB-1 (F-08) : suffixe 4 hex derive du request_id -> plus de collision intra-minute
        // (2 commandes la meme minute recevaient le meme numero -> ecrasement Storage possible,
        // rapprochement facture/dossier errone). Format : AEGIS-YYYYMMDD-HHMM-a1b2.
        // Contrainte UNIQUE migration 20260430 conservee ; anciens numeros sans suffixe restent valides.
        const request_id = crypto.randomUUID();
        const now = new Date();
        const { yyyy, MM, dd, hh, mm } = getCetDateParts(now);
        const invoice_number = `AEGIS-${yyyy}${MM}${dd}-${hh}${mm}-${request_id.replace(/-/g, '').slice(0, 4)}`;

        // Log only non-sensitive metadata (RGPD-safe)
        console.log(JSON.stringify({
            event: 'diagnostic_request',
            request_id,
            invoice_number,
            timestamp: new Date().toISOString(),
            sector,
            regulations_count: regulations.length,
            product_length: product.length,
            // NEVER log email, name, company, or full content
        }));

        // NIGHT-N5 Phase B2 + v2.2.0 FIX : persistance Supabase EU Frankfurt (AWAIT Promise.race 3s)
        // v3.0.0 HA-1 (F-01) : fail-visible. L'intake DOIT etre durable avant d'autoriser le
        // checkout Mollie (le frontend n'appelle mollie-checkout que sur 2xx ici). Tout echec
        // transitoire (client absent, erreur INSERT, timeout 3s) -> 503 retryable, PAS de 200.
        // NUANCE (contre-expertise T1740) : un timeout Promise.race n'annule PAS l'insert
        // sous-jacent. Si l'INSERT aboutit apres le timeout, la ligne orpheline reste en
        // pending_payment sans checkout associe ; une retente client cree une nouvelle ligne
        // (nouveau request_id). Doublon possible et acceptable -- aucune collision d'ID.
        const lang = typeof body.lang === 'string' && body.lang === 'en' ? 'en' : 'fr';
        if (!supabase) {
            logSupabaseUnavailable('diagnostic-request');
            return res.status(503).json({ error: 'service_unavailable', retryable: true });
        }
        try {
            const insertPromise = supabase
                .from('diagnostic_requests')
                .insert({
                    request_id,
                    invoice_number,
                    status: 'pending_payment',
                    email,
                    first_name: firstName,
                    last_name: lastName,
                    company,
                    country,
                    city,
                    sector,
                    product,
                    context,
                    regulations,
                    lang,
                    created_at: new Date().toISOString(),
                });

            const timeoutPromise = new Promise<{ error: { message: string } }>((_, reject) =>
                setTimeout(() => reject(new Error('supabase_insert_timeout_3s')), 3000)
            );

            const result = await Promise.race([insertPromise, timeoutPromise]) as { error: unknown };

            if (result.error) {
                const msg = (result.error as { message?: string })?.message || 'unknown';
                console.error(JSON.stringify({
                    event: 'supabase_insert_failed',
                    context: 'diagnostic-request',
                    request_id,
                    invoice_number,
                    error: msg,
                    severity: 'error',
                    timestamp: new Date().toISOString(),
                }));
                return res.status(503).json({ error: 'service_unavailable', retryable: true });
            }
            console.log(JSON.stringify({
                event: 'supabase_insert_ok',
                context: 'diagnostic-request',
                request_id,
                invoice_number,
                timestamp: new Date().toISOString(),
            }));
        } catch (e: unknown) {
            const msg = (e as { message?: string })?.message || 'unknown';
            console.error(JSON.stringify({
                event: 'supabase_insert_timeout',
                context: 'diagnostic-request',
                request_id,
                invoice_number,
                error: msg,
                severity: 'error',
                timestamp: new Date().toISOString(),
            }));
            return res.status(503).json({ error: 'service_unavailable', retryable: true });
        }

        // Phase 2 ACTIVE : ops pre-notify (best-effort, kill switch M2)
        if (process.env.OPS_PRENOTIFY_ENABLED !== 'false') {
            sendOpsPreNotify({
                payment_id: 'pre-checkout',
                request_id,
                email,
                customer_company: company,
                sector,
                product,
            }).catch(() => {
                // Best-effort : never block client response
            });
        }

        return res.status(200).json({
            request_id,
            invoice_number,
            status: 'ok',
        });

    } catch (error: any) {
        console.error('diagnostic-request error:', error.message);
        return res.status(500).json({ error: 'Erreur interne' });
    }
}
