import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * AEGIS Intelligence -- Health check endpoint multi-provider
 * Usage :
 *   GET /api/health       -> check rapide (presence cles), ~50 ms
 *   GET /api/health?deep=1 -> check approfondi (ping providers), 500-2000 ms, ~0.001 USD/invocation Anthropic
 * Version : 1.0.0 -- 20260409T1445 CET
 */

const AEGIS_VERSION = '3.4.5';
const TIMEOUT_MS = 3000;

interface ProviderStatus {
    key_configured: boolean;
    reachable?: boolean;
    latency_ms?: number;
    error?: string;
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
    const mode = deep ? 'deep' : 'light';

    const [anthropic, gemini, mollie] = await Promise.all([
        checkAnthropic(deep),
        checkGemini(deep),
        checkMollie(deep),
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

    // Always HTTP 200 (monitoring uptime should not trigger on degraded provider)
    return res.status(200).json({
        status,
        version: AEGIS_VERSION,
        timestamp: new Date().toISOString(),
        providers,
        mode,
    });
}
