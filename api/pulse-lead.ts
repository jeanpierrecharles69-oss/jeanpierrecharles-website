import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, logSupabaseUnavailable } from './_lib/supabase.js';

/**
 * AEGIS Intelligence -- PULSE Lead Capture Handler (S2 Mission N11)
 *
 * Email gate avant export PDF Brain (M3.5). Capture email B2B + contexte de la
 * derniere requete pour funnel PULSE -> DIAGNOSTIC.
 *
 * SECURITE :
 *  - Pas d'auth (lead public, capture intentionnelle utilisateur)
 *  - SERVICE_ROLE_KEY server-side uniquement (bypass RLS) -- JAMAIS expose
 *  - Validation stricte email + cap query_context 500 chars
 *  - Rate limit 5/min/IP (anti-spam)
 *
 * RGPD :
 *  - Modal cote client affiche finalite + mention "pas de spam"
 *  - Email = donnee personnelle, base legale Art. 6.1.a (consentement explicite par submit)
 *
 * Version : 1.0.0 -- 20260508 -- creation S2
 */

const ALLOWED_ORIGINS = [
    'https://jeanpierrecharles.com',
    'https://www.jeanpierrecharles.com',
    'http://localhost:5173',
    'http://localhost:3000',
];

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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_QUERY_CONTEXT_LEN = 500;
const MAX_EMAIL_LEN = 200;

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
        const { email, query_context, lang } = body;

        if (typeof email !== 'string' || email.length === 0 || email.length > MAX_EMAIL_LEN || !EMAIL_REGEX.test(email)) {
            return res.status(400).json({ error: 'email invalide' });
        }

        let cleanContext: string | null = null;
        if (typeof query_context === 'string' && query_context.length > 0) {
            cleanContext = query_context.slice(0, MAX_QUERY_CONTEXT_LEN);
        }

        const cleanLang: 'fr' | 'en' = lang === 'en' ? 'en' : 'fr';

        if (!supabase) {
            logSupabaseUnavailable('pulse-lead');
            return res.status(503).json({ error: 'Service temporairement indisponible' });
        }

        const { error: insertError } = await supabase
            .from('pulse_leads')
            .insert({
                email: email.toLowerCase().trim(),
                query_context: cleanContext,
                lang: cleanLang,
            });

        if (insertError) {
            console.error(JSON.stringify({
                event: 'pulse_lead_insert_failed',
                error: (insertError as { message?: string }).message || 'unknown',
                code: (insertError as { code?: string }).code || 'none',
                severity: 'warning',
                timestamp: new Date().toISOString(),
            }));
            return res.status(500).json({ error: 'Erreur enregistrement' });
        }

        // R_T0838_JP_01 : aucun email clair en log (mask local part)
        const localPart = email.split('@')[0] || '';
        const domain = email.split('@')[1] || '';
        const masked = `${localPart[0] || ''}***@${domain}`;

        console.log(JSON.stringify({
            event: 'pulse_lead_captured',
            email_masked: masked,
            lang: cleanLang,
            has_context: cleanContext !== null,
            timestamp: new Date().toISOString(),
        }));

        return res.status(201).json({ stored: true });

    } catch (error: unknown) {
        const msg = (error as { message?: string })?.message || 'unknown';
        console.error('pulse-lead error:', msg);
        return res.status(500).json({ error: 'Erreur interne' });
    }
}
