import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as fs from 'fs';
import * as path from 'path';

/**
 * AEGIS Intelligence -- Proxy unifie multi-provider
 * SECURITE : Cles API dans variables Vercel (JAMAIS dans le code)
 * CORS : Restreint a jeanpierrecharles.com + localhost dev
 * MODES : brain (SSE Gemini Flash), pulse (JSON Gemini Flash), diagnostic (JSON Anthropic Opus)
 * Version : 2.1.0 -- 20260409T1445 CET -- Externalise prompts dans config/*.txt + thinking budget 8192
 */

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const ANTHROPIC_VERSION = '2023-06-01';

const ALLOWED_ORIGINS = [
    'https://jeanpierrecharles.com',
    'https://www.jeanpierrecharles.com',
    'http://localhost:5173',
    'http://localhost:3000',
];

// Rate limiting (10 req/min par IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
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

// Routing provider par mode
type Provider = 'anthropic' | 'gemini';
interface ModeConfig {
    provider: Provider;
    model: string;
    maxTokens: number;
    stream: boolean;
    temperature?: number;
}

const MODE_CONFIG: Record<string, ModeConfig> = {
    brain:      { provider: 'gemini',    model: 'gemini-2.5-flash', maxTokens: 8192,  stream: true,  temperature: 0.7 },
    pulse:      { provider: 'gemini',    model: 'gemini-2.5-flash', maxTokens: 8192,  stream: false, temperature: 0.7 },
    diagnostic: { provider: 'anthropic', model: 'claude-opus-4-6',  maxTokens: 32768, stream: false },
};

// System prompt DIAGNOSTIC — externalise dans config/diagnostic-system-prompt.txt
// Version : 1.4.1 -- 20260409T1445 CET -- Externalise dans config/diagnostic-system-prompt.txt
const DIAGNOSTIC_SYSTEM_PROMPT = (() => {
    try {
        const p = path.join(process.cwd(), 'config', 'diagnostic-system-prompt.txt');
        return fs.readFileSync(p, 'utf-8');
    } catch (e) {
        console.error('Failed to load diagnostic-system-prompt.txt:', e);
        return 'FALLBACK: Tu es AEGIS Intelligence, plateforme d\'expertise reglementaire EU. Produis un diagnostic de conformite.';
    }
})();

// System prompt BRAIN — externalise dans config/brain-system-prompt.txt
// Version : 1.0.0 -- 20260415 CET -- CHANGE-09 securite: prompt cote serveur
const BRAIN_SYSTEM_PROMPTS: Record<string, string> = (() => {
    try {
        const p = path.join(process.cwd(), 'config', 'brain-system-prompt.txt');
        const raw = fs.readFileSync(p, 'utf-8');
        const result: Record<string, string> = {};
        const parts = raw.split(/===LANG:(\w+)===/);
        for (let i = 1; i < parts.length; i += 2) {
            result[parts[i].toLowerCase()] = parts[i + 1].trim();
        }
        return result;
    } catch (e) {
        console.error('Failed to load brain-system-prompt.txt:', e);
        return {
            fr: 'FALLBACK: Tu es AEGIS Intelligence, plateforme d\'expertise reglementaire EU.',
            en: 'FALLBACK: You are AEGIS Intelligence, European regulatory expertise platform.',
        };
    }
})();

// System prompt PULSE — externalise dans config/pulse-system-prompt.txt
// Version : 2.0.1 -- 20260409T1445 CET -- Externalise dans config/pulse-system-prompt.txt
const PULSE_SYSTEM_PROMPT = (() => {
    try {
        const p = path.join(process.cwd(), 'config', 'pulse-system-prompt.txt');
        return fs.readFileSync(p, 'utf-8');
    } catch (e) {
        console.error('Failed to load pulse-system-prompt.txt:', e);
        return 'FALLBACK: Tu es AEGIS Intelligence, plateforme d\'expertise reglementaire EU. Produis un pre-diagnostic rapide.';
    }
})();

// --- Anthropic path (DIAGNOSTIC uniquement) ---
async function callAnthropic(
    config: ModeConfig,
    mode: string,
    prompt: string,
    systemPrompt: string | undefined,
    res: VercelResponse
) {
    if (!ANTHROPIC_API_KEY) {
        console.error('ANTHROPIC_API_KEY not configured');
        return res.status(500).json({ error: 'Service Anthropic non configure.' });
    }

    const requestBody: Record<string, unknown> = {
        model: config.model,
        max_tokens: config.maxTokens,
        messages: [{ role: 'user', content: prompt }],
    };

    // System instruction : embarque DIAGNOSTIC avec prompt caching
    if (mode === 'diagnostic') {
        requestBody.system = [
            {
                type: 'text',
                text: DIAGNOSTIC_SYSTEM_PROMPT,
                cache_control: { type: 'ephemeral' },
            },
        ];
    } else if (systemPrompt) {
        requestBody.system = systemPrompt;
    }

    if (config.stream) {
        requestBody.stream = true;
    }

    const headers: Record<string, string> = {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': ANTHROPIC_VERSION,
        'content-type': 'application/json',
    };

    const response = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error(`Anthropic API error (mode=${mode}):`, response.status, errText);
        if (response.status === 429) {
            return res.status(429).json({
                error: 'QUOTA_EXCEEDED',
                message: 'Quota API Anthropic depasse. Reessayez dans quelques minutes.',
            });
        }
        return res.status(response.status).json({ error: 'Anthropic API error', details: errText });
    }

    // Streaming (future-proof, pas utilise pour DIAGNOSTIC actuellement)
    if (config.stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();

        const reader = response.body?.getReader();
        if (!reader) return res.status(500).json({ error: 'No response body' });
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(decoder.decode(value, { stream: true }));
            (res as any).flush?.();
        }
        res.end();
        return;
    }

    // JSON response
    const data = await response.json();
    const text = data.content
        ?.filter((c: any) => c.type === 'text')
        .map((c: any) => c.text)
        .join('\n') || '';

    return res.status(200).json({
        text,
        usage: data.usage,
        model: data.model,
        stop_reason: data.stop_reason,
    });
}

// --- Gemini path (Brain + PULSE) ---
async function callGemini(
    config: ModeConfig,
    mode: string,
    prompt: string,
    systemPrompt: string | undefined,
    res: VercelResponse
) {
    if (!GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY not configured');
        return res.status(500).json({ error: 'Service Gemini non configure.' });
    }

    const method = config.stream ? 'streamGenerateContent' : 'generateContent';
    const altParam = config.stream ? 'alt=sse&' : '';
    const url = `${GEMINI_BASE_URL}/${config.model}:${method}?${altParam}key=${GEMINI_API_KEY}`;

    const requestBody: Record<string, unknown> = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
            maxOutputTokens: config.maxTokens,
            temperature: config.temperature ?? 0.7,
            thinkingConfig: { thinkingBudget: 0 },
        },
    };

    if (systemPrompt) {
        requestBody.systemInstruction = { parts: [{ text: systemPrompt }] };
    }

    let response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
    });

    // Fallback : si Gemini refuse thinkingConfig (400), retenter sans
    if (response.status === 400 && (requestBody.generationConfig as any)?.thinkingConfig) {
        const errText = await response.text();
        if (errText.includes('thinkingConfig') || errText.includes('thinking')) {
            console.warn(`Gemini rejected thinkingConfig (mode=${mode}), retrying without it`);
            const fallbackConfig = { ...(requestBody.generationConfig as any) };
            delete fallbackConfig.thinkingConfig;
            requestBody.generationConfig = fallbackConfig;
            response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });
        }
    }

    if (!response.ok) {
        const errText = await response.text();
        console.error(`Gemini API error (mode=${mode}):`, response.status, errText);
        if (response.status === 429) {
            return res.status(429).json({
                error: 'QUOTA_EXCEEDED',
                message: 'Quota Gemini depasse. Reessayez dans quelques minutes.',
            });
        }
        return res.status(response.status).json({ error: 'Gemini API error', details: errText });
    }

    // --- MODE STREAMING (brain) ---
    if (config.stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();

        const reader = response.body?.getReader();
        if (!reader) return res.status(500).json({ error: 'No response body' });
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(decoder.decode(value, { stream: true }));
            (res as any).flush?.();
        }
        res.end();
        return;
    }

    // --- MODE JSON (pulse) ---
    const data = await response.json();

    // Safety block detection
    const candidate = data.candidates?.[0];
    if (candidate?.finishReason === 'SAFETY') {
        return res.status(400).json({
            error: 'SAFETY_BLOCKED',
            message: 'La requete a ete bloquee par les filtres de securite. Reformulez votre question.',
        });
    }

    const text = candidate?.content?.parts?.map((p: any) => p.text).join('') || '';
    const usage = data.usageMetadata ? {
        input_tokens: data.usageMetadata.promptTokenCount,
        output_tokens: data.usageMetadata.candidatesTokenCount,
    } : undefined;

    return res.status(200).json({
        text,
        usage,
        model: config.model,
        stop_reason: candidate?.finishReason || null,
    });
}

// --- Handler principal (dispatcher) ---
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
        return res.status(429).json({ error: 'RATE_LIMITED', message: 'Trop de requetes. Patientez 1 minute.' });
    }

    try {
        const { mode, prompt, systemInstruction } = req.body;

        const config = MODE_CONFIG[mode];
        if (!config) {
            return res.status(400).json({
                error: `Mode invalide. Modes autorises : ${Object.keys(MODE_CONFIG).join(', ')}`,
            });
        }

        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid prompt' });
        }

        if (prompt.length > 10000) {
            return res.status(400).json({ error: 'Prompt trop long (max 10000 caracteres)' });
        }

        // Resolution system prompt : TOUS les modes utilisent des prompts serveur
        // CHANGE-09 securite : le client n'a plus le droit d'injecter un system prompt
        const bodyLang = (req.body.lang || 'fr').toString().toLowerCase();
        let finalSystemPrompt: string | undefined;
        if (mode === 'brain') {
            finalSystemPrompt = BRAIN_SYSTEM_PROMPTS[bodyLang] || BRAIN_SYSTEM_PROMPTS['fr'];
            if (systemInstruction) {
                console.warn('Brain mode: client-sent systemInstruction ignored (server-enforced)');
            }
        } else if (mode === 'pulse') {
            finalSystemPrompt = PULSE_SYSTEM_PROMPT;
        } else if (mode === 'diagnostic') {
            finalSystemPrompt = DIAGNOSTIC_SYSTEM_PROMPT;
        }

        // Dispatch par provider
        if (config.provider === 'anthropic') {
            return callAnthropic(config, mode, prompt, finalSystemPrompt, res);
        } else {
            return callGemini(config, mode, prompt, finalSystemPrompt, res);
        }

    } catch (error: any) {
        console.error('AI proxy error:', error);
        return res.status(500).json({ error: 'Erreur interne', message: error.message });
    }
}
