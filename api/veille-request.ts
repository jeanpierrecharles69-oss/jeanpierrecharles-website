import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, logSupabaseUnavailable } from './_lib/supabase.js';

/**
 * AEGIS Intelligence -- Veille Request Handler (V360)
 * Receives pre-checkout VEILLE form data, generates request_id + invoice_number,
 * persists in Supabase `veille_requests` (EU Frankfurt).
 *
 * Calque diagnostic-request.ts v2.2.0 (await Promise.race 3s pattern).
 * Differences :
 *   - Table cible : `veille_requests` (au lieu de `diagnostic_requests`)
 *   - Invoice prefix : `AEGIS-VEILLE-YYYYMMDD-HHMM`
 *   - Fields adaptés VEILLE : pas de country/city/product, sectors[]/regulations[] requis (>=1)
 *   - Pas d'ops pre-notify (Phase 1 manuelle JP via Mollie dashboard)
 *
 * Version : 1.0.0 -- 20260430T1100 -- V360 MVP subscription manuelle
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

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

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

        // Server-side validation
        const email = sanitize(body.email, 320);
        const firstName = sanitize(body.firstName, 100);
        const lastName = sanitize(body.lastName, 100);
        const company = sanitize(body.company, 200);
        const context = sanitize(body.context, 2000);
        const sectors: string[] = Array.isArray(body.sectors)
            ? body.sectors.map((s: unknown) => sanitize(s, 80)).filter(Boolean)
            : [];
        const regulations: string[] = Array.isArray(body.regulations)
            ? body.regulations.map((r: unknown) => sanitize(r, 50)).filter(Boolean)
            : [];

        const errors: string[] = [];
        if (!email || !isValidEmail(email)) errors.push('email');
        if (!firstName) errors.push('firstName');
        if (!lastName) errors.push('lastName');
        if (!company) errors.push('company');
        if (sectors.length === 0) errors.push('sectors');
        if (regulations.length === 0) errors.push('regulations');

        if (errors.length > 0) {
            return res.status(400).json({
                error: 'Validation failed',
                fields: errors,
            });
        }

        const request_id = crypto.randomUUID();
        const now = new Date();
        const invoice_number = `AEGIS-VEILLE-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

        // Log non-sensitive metadata
        console.log(JSON.stringify({
            event: 'veille_request',
            request_id,
            invoice_number,
            timestamp: new Date().toISOString(),
            sectors_count: sectors.length,
            regulations_count: regulations.length,
            // NEVER log email, name, company
        }));

        const lang = typeof body.lang === 'string' && body.lang === 'en' ? 'en' : 'fr';
        if (supabase) {
            try {
                const insertPromise = supabase
                    .from('veille_requests')
                    .insert({
                        request_id,
                        invoice_number,
                        status: 'pending',
                        email,
                        first_name: firstName,
                        last_name: lastName,
                        company,
                        sector: sectors.join(', '),
                        regulations: regulations.join(', '),
                        context,
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
                        context: 'veille-request',
                        request_id,
                        invoice_number,
                        error: msg,
                        severity: 'warning',
                        timestamp: new Date().toISOString(),
                    }));
                } else {
                    console.log(JSON.stringify({
                        event: 'supabase_insert_ok',
                        context: 'veille-request',
                        request_id,
                        invoice_number,
                        timestamp: new Date().toISOString(),
                    }));
                }
            } catch (e: unknown) {
                const msg = (e as { message?: string })?.message || 'unknown';
                console.error(JSON.stringify({
                    event: 'supabase_insert_timeout',
                    context: 'veille-request',
                    request_id,
                    invoice_number,
                    error: msg,
                    severity: 'warning',
                    timestamp: new Date().toISOString(),
                }));
            }
        } else {
            logSupabaseUnavailable('veille-request');
        }

        return res.status(200).json({
            request_id,
            invoice_number,
            status: 'ok',
        });

    } catch (error: any) {
        console.error('veille-request error:', error.message);
        return res.status(500).json({ error: 'Erreur interne' });
    }
}
