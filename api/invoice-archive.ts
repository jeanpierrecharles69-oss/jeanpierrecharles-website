import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, logSupabaseUnavailable } from './_lib/supabase.js';

/**
 * AEGIS Intelligence -- Invoice Archive Handler (V352)
 *
 * Fire-and-forget archive client invoice PDF base64 -> Supabase invoices table.
 * Obligation fiscale Art. 293 B CGI : conservation 10 ans pieces comptables.
 *
 * SECURITE :
 *  - Pas d'auth (fire-and-forget client, document EI public Art. 293 B)
 *  - SERVICE_ROLE_KEY server-side (bypass RLS) - JAMAIS expose
 *  - Validation stricte invoice_number format + pdf_base64 size cap (500KB)
 *  - Rate limit 3/min par IP (anti-spam)
 *  - Idempotent via UNIQUE constraint invoice_number -> 409 sur duplicate
 *
 * FAULT TOLERANCE :
 *  - Si request_id fourni mais FK invalide (diagnostic_requests vide en preview),
 *    retry INSERT avec request_id=NULL pour preserver l'archive comptable.
 *
 * Version : 1.0.0 -- 20260430 -- creation V352 INVOICE-ARCHIVE-FISCAL
 */

const ALLOWED_ORIGINS = [
    'https://jeanpierrecharles.com',
    'https://www.jeanpierrecharles.com',
    'http://localhost:5173',
    'http://localhost:3000',
];

// Rate limit 3/min par IP (anti-spam, brief §4)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 3;
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

// Format invoice_number : AEGIS-YYYYMMDD-HHMM (cf. diagnostic-request.ts L107)
const INVOICE_NUMBER_REGEX = /^AEGIS-\d{8}-\d{4}$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_PDF_BASE64_BYTES = 500 * 1024; // 500KB cap (brief §4)

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
        const body = req.body || {};
        const { invoice_number, request_id, pdf_base64, lang } = body;

        // Validation invoice_number (format strict AEGIS-YYYYMMDD-HHMM)
        if (typeof invoice_number !== 'string' || !INVOICE_NUMBER_REGEX.test(invoice_number)) {
            return res.status(400).json({ error: 'invoice_number invalide (format AEGIS-YYYYMMDD-HHMM attendu)' });
        }

        // Validation pdf_base64 (presence + size cap)
        if (typeof pdf_base64 !== 'string' || pdf_base64.length === 0) {
            return res.status(400).json({ error: 'pdf_base64 requis' });
        }
        if (pdf_base64.length > MAX_PDF_BASE64_BYTES) {
            return res.status(413).json({ error: `pdf_base64 trop volumineux (>${MAX_PDF_BASE64_BYTES} bytes)` });
        }

        // Validation request_id (UUID si fourni, sinon null accepte)
        let cleanRequestId: string | null = null;
        if (request_id !== undefined && request_id !== null && request_id !== '') {
            if (typeof request_id !== 'string' || !UUID_REGEX.test(request_id)) {
                return res.status(400).json({ error: 'request_id invalide (UUID v4 attendu)' });
            }
            cleanRequestId = request_id;
        }

        // Validation lang (whitelist 'fr'/'en', default 'fr')
        const cleanLang: 'fr' | 'en' = lang === 'en' ? 'en' : 'fr';

        // Supabase availability gate
        if (!supabase) {
            logSupabaseUnavailable('invoice-archive');
            return res.status(503).json({ error: 'Archive temporairement indisponible' });
        }

        // INSERT initial avec request_id (peut etre null)
        const { error: insertError } = await supabase
            .from('invoices')
            .insert({
                invoice_number,
                request_id: cleanRequestId,
                pdf_base64,
                lang: cleanLang,
            });

        // 23505 = unique_violation Postgres -> idempotent 409 (AC#5 brief)
        const errCode = (insertError as { code?: string } | null)?.code;

        if (insertError && errCode === '23505') {
            console.log(JSON.stringify({
                event: 'invoice_archive_already_exists',
                invoice_number,
                timestamp: new Date().toISOString(),
            }));
            return res.status(409).json({ already_exists: true, invoice_number });
        }

        // 23503 = foreign_key_violation : retry NULL request_id (preserve archive)
        if (insertError && errCode === '23503' && cleanRequestId !== null) {
            console.warn(JSON.stringify({
                event: 'invoice_archive_fk_retry_null',
                invoice_number,
                rejected_request_id: cleanRequestId,
                severity: 'warning',
                timestamp: new Date().toISOString(),
            }));
            const retry = await supabase
                .from('invoices')
                .insert({
                    invoice_number,
                    request_id: null,
                    pdf_base64,
                    lang: cleanLang,
                });
            const retryCode = (retry.error as { code?: string } | null)?.code;
            if (retry.error && retryCode === '23505') {
                return res.status(409).json({ already_exists: true, invoice_number });
            }
            if (retry.error) {
                console.error(JSON.stringify({
                    event: 'invoice_archive_retry_failed',
                    invoice_number,
                    error: (retry.error as { message?: string }).message || 'unknown',
                    severity: 'warning',
                    timestamp: new Date().toISOString(),
                }));
                return res.status(500).json({ error: 'Archive failed' });
            }
            console.log(JSON.stringify({
                event: 'invoice_archive_stored_null_ref',
                invoice_number,
                lang: cleanLang,
                pdf_size_bytes: pdf_base64.length,
                timestamp: new Date().toISOString(),
            }));
            return res.status(201).json({ stored: true, invoice_number, request_id_dropped: true });
        }

        if (insertError) {
            console.error(JSON.stringify({
                event: 'invoice_archive_insert_failed',
                invoice_number,
                error: (insertError as { message?: string }).message || 'unknown',
                code: errCode || 'none',
                severity: 'warning',
                timestamp: new Date().toISOString(),
            }));
            return res.status(500).json({ error: 'Archive failed' });
        }

        // Succes nominal
        console.log(JSON.stringify({
            event: 'invoice_archive_stored',
            invoice_number,
            lang: cleanLang,
            has_request_id: cleanRequestId !== null,
            pdf_size_bytes: pdf_base64.length,
            timestamp: new Date().toISOString(),
        }));
        return res.status(201).json({ stored: true, invoice_number });

    } catch (error: unknown) {
        const msg = (error as { message?: string })?.message || 'unknown';
        console.error('invoice-archive error:', msg);
        return res.status(500).json({ error: 'Erreur interne' });
    }
}
