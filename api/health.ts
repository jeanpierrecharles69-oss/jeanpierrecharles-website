import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connect as netConnect } from 'node:net';
import { supabase } from './_lib/supabase.js';

/**
 * AEGIS Intelligence -- Health check endpoint multi-provider
 * Usage :
 *   GET /api/health          -> check rapide (presence cles), ~50 ms, toujours HTTP 200 (compat historique)
 *   GET /api/health?deep=1   -> check approfondi (ping providers + composants critiques),
 *                               500-2000 ms, ~0.001 USD/invocation Anthropic, toujours HTTP 200
 *   GET /api/health?strict=1 -> probe composants critiques (Supabase SELECT head 3 s,
 *                               SMTP socket Gandi 465 3 s, sans envoi) ; HTTP 503 si un
 *                               composant critique est down, 200 sinon. Cible moniteur
 *                               externe 5 min (HA-4) -- le trafic DB regulier previent
 *                               aussi la re-pause auto Supabase plan gratuit.
 *
 * HA-3 (F-06 partiel) : le JSON liste chaque composant up/down/latence.
 * Version : 2.0.0 -- 20260819 -- HA-3 : probes Supabase + SMTP, param strict=1 -> 503 fail-visible
 * Version : 1.0.0 -- 20260409T1445 CET
 */

const AEGIS_VERSION = '3.4.6';
const TIMEOUT_MS = 3000;

interface ProviderStatus {
    key_configured: boolean;
    reachable?: boolean;
    latency_ms?: number;
    error?: string;
}

interface ComponentStatus {
    configured: boolean;
    up?: boolean;
    latency_ms?: number;
    error?: string;
}

// Probe Supabase : requete HEAD count sur diagnostic_requests (0 ligne transferee, 0 PII).
// Note : PostgREST n'expose pas les tables systeme -> equivalent minimal du "SELECT 1"
// du brief HA-3. Timeout 3 s via Promise.race (le client supabase-js ne prend pas de
// signal d'abort sur cette forme de requete).
async function checkSupabase(): Promise<ComponentStatus> {
    if (!supabase) return { configured: false };
    const start = Date.now();
    try {
        const probePromise = supabase
            .from('diagnostic_requests')
            .select('request_id', { count: 'exact', head: true })
            .limit(1);
        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)
        );
        const result = await Promise.race([probePromise, timeoutPromise]) as { error: { message?: string } | null };
        if (result.error) {
            return {
                configured: true,
                up: false,
                latency_ms: Date.now() - start,
                error: result.error.message || 'query_error',
            };
        }
        return { configured: true, up: true, latency_ms: Date.now() - start };
    } catch (e: any) {
        return {
            configured: true,
            up: false,
            latency_ms: Date.now() - start,
            error: e?.message === 'timeout' ? 'timeout' : (e?.message || 'unknown'),
        };
    }
}

// Probe SMTP : connexion socket TCP vers Gandi (defaut mail.gandi.net:465), timeout 3 s,
// AUCUN envoi (socket detruite des la connexion etablie).
function checkSmtp(): Promise<ComponentStatus> {
    const host = process.env.SMTP_HOST || 'mail.gandi.net';
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    const start = Date.now();
    return new Promise<ComponentStatus>((resolve) => {
        let settled = false;
        const done = (status: ComponentStatus) => {
            if (settled) return;
            settled = true;
            socket.destroy();
            resolve(status);
        };
        const socket = netConnect({ host, port, timeout: TIMEOUT_MS });
        socket.once('connect', () => done({ configured: true, up: true, latency_ms: Date.now() - start }));
        socket.once('timeout', () => done({ configured: true, up: false, latency_ms: Date.now() - start, error: 'timeout' }));
        socket.once('error', (e: Error) => done({ configured: true, up: false, latency_ms: Date.now() - start, error: e.message }));
    });
}

async function checkAnthropic(deep: boolean): Promise<ProviderStatus> {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return { key_configured: false };
    if (!deep) return { key_configured: true };

    const start = Date.now();
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': key,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 1,
                messages: [{ role: 'user', content: 'ping' }],
            }),
            signal: controller.signal,
        });
        clearTimeout(timeout);
        return {
            key_configured: true,
            reachable: res.ok,
            latency_ms: Date.now() - start,
            ...(!res.ok && { error: `HTTP ${res.status}` }),
        };
    } catch (e: any) {
        return {
            key_configured: true,
            reachable: false,
            latency_ms: Date.now() - start,
            error: e.name === 'AbortError' ? 'timeout' : e.message,
        };
    }
}

async function checkGemini(deep: boolean): Promise<ProviderStatus> {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return { key_configured: false };
    if (!deep) return { key_configured: true };

    const start = Date.now();
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
                    generationConfig: { maxOutputTokens: 1 },
                }),
                signal: controller.signal,
            }
        );
        clearTimeout(timeout);
        return {
            key_configured: true,
            reachable: res.ok,
            latency_ms: Date.now() - start,
            ...(!res.ok && { error: `HTTP ${res.status}` }),
        };
    } catch (e: any) {
        return {
            key_configured: true,
            reachable: false,
            latency_ms: Date.now() - start,
            error: e.name === 'AbortError' ? 'timeout' : e.message,
        };
    }
}

async function checkMollie(deep: boolean): Promise<ProviderStatus> {
    // Dual-key aware : check whichever key is configured for current env
    const vercelEnv = process.env.VERCEL_ENV || 'development';
    const key = vercelEnv === 'production'
        ? process.env.MOLLIE_API_KEY_LIVE
        : process.env.MOLLIE_API_KEY_TEST;
    if (!key) return { key_configured: false };
    if (!deep) return { key_configured: true };

    const start = Date.now();
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
        const res = await fetch('https://api.mollie.com/v2/methods', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${key}` },
            signal: controller.signal,
        });
        clearTimeout(timeout);
        return {
            key_configured: true,
            reachable: res.ok,
            latency_ms: Date.now() - start,
            ...(!res.ok && { error: `HTTP ${res.status}` }),
        };
    } catch (e: any) {
        return {
            key_configured: true,
            reachable: false,
            latency_ms: Date.now() - start,
            error: e.name === 'AbortError' ? 'timeout' : e.message,
        };
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Accept GET and POST
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const deep = req.query.deep === '1';
    const strict = req.query.strict === '1';
    const mode = deep ? (strict ? 'deep+strict' : 'deep') : (strict ? 'strict' : 'light');

    // HA-3 : composants critiques (Supabase, SMTP) probes en strict et en deep.
    // Sans param : comportement historique conserve (light, pas de probe critique).
    const probeCritical = strict || deep;
    const [anthropic, gemini, mollie, supabaseStatus, smtpStatus] = await Promise.all([
        checkAnthropic(deep),
        checkGemini(deep),
        checkMollie(deep),
        probeCritical ? checkSupabase() : Promise.resolve(null),
        probeCritical ? checkSmtp() : Promise.resolve(null),
    ]);

    const providers = { anthropic, gemini, mollie };

    // Determine overall status
    const allDown = !anthropic.key_configured && !gemini.key_configured && !mollie.key_configured;
    let status: 'ok' | 'degraded' | 'down' = 'ok';

    if (deep) {
        const reachableResults = [anthropic, gemini, mollie].filter(p => p.key_configured);
        const failCount = reachableResults.filter(p => p.reachable === false).length;
        if (failCount === reachableResults.length && reachableResults.length > 0) {
            status = 'down';
        } else if (failCount > 0) {
            status = 'degraded';
        }
    } else if (allDown) {
        status = 'down';
    }

    // Composant critique non configure ou injoignable = pipeline DIAGNOSTIC mort -> down.
    const criticalDown = probeCritical && [supabaseStatus, smtpStatus].some(
        c => c !== null && (!c.configured || c.up === false)
    );
    if (criticalDown) status = 'down';

    // strict=1 : fail-visible HTTP 503 si un composant critique est down.
    // Sans strict : toujours HTTP 200 (compat historique, moniteurs legacy).
    const httpStatus = strict && criticalDown ? 503 : 200;

    return res.status(httpStatus).json({
        status,
        version: AEGIS_VERSION,
        timestamp: new Date().toISOString(),
        providers,
        ...(probeCritical && {
            components: {
                supabase: supabaseStatus,
                smtp: smtpStatus,
            },
        }),
        mode,
    });
}
