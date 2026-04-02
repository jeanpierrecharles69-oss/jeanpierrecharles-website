import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * AEGIS Intelligence -- Proxy unifie Claude API
 * SECURITE : Cle API dans variables Vercel (JAMAIS dans le code)
 * CORS : Restreint a jeanpierrecharles.com + localhost dev
 * MODES : brain (SSE Haiku), pulse (JSON Sonnet), diagnostic (JSON Opus)
 * Version : 1.0.0 -- 20260331T1200 CET
 */

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const API_URL = 'https://api.anthropic.com/v1/messages';
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

// Modeles par mode
const MODE_CONFIG: Record<string, { model: string; maxTokens: number; stream: boolean }> = {
    brain:      { model: 'claude-haiku-4-5-20251001', maxTokens: 2048, stream: true },
    pulse:      { model: 'claude-sonnet-4-6',         maxTokens: 4096, stream: false },
    diagnostic: { model: 'claude-opus-4-6',           maxTokens: 32768, stream: false },
};

// System prompt PULSE (embarque dans le proxy -- ne transite pas par le client)
const PULSE_SYSTEM_PROMPT = `Tu es AEGIS Intelligence, plateforme d'expertise reglementaire europeenne.
Tu fournis un pre-diagnostic rapide de l'exposition reglementaire d'un produit industriel.

# LES 5 PILIERS REGLEMENTAIRES
1. AI Act (UE) 2024/1689 : Classification risques IA, obligations fournisseurs/deployers de systemes IA a haut risque.
2. CRA (UE) 2024/2847 : Securite des produits comportant des elements numeriques, signalement vulnerabilites sous 24h (Art. 14), SBOM.
3. Reglement Machines 2023/1230 : Remplace Directive 2006/42/CE au 20/01/2027. Systemes autonomes, composants de securite logiciels.
4. ESPR/DPP (UE) 2024/1781 : Ecoconception, Passeport Numerique Produit.
5. Battery Regulation (UE) 2023/1542 : Empreinte carbone, diligence raisonnable, passeport batterie.

# FORMAT — 2 SECTIONS
## SECTION 1 : IDENTIFICATION PRODUIT ET ARCHITECTURE
- Description du produit et couches d'architecture mecatronique
- Technologies embarquees

## SECTION 2 : CARTOGRAPHIE REGLEMENTAIRE ET ECHEANCES
- Matrice : quels reglements s'appliquent et pourquoi
- Zones de chevauchement entre piliers
- Timeline des echeances critiques

# CONCLUSION
Terminer par : "Ce pre-diagnostic identifie [N] reglements applicables. Pour une analyse complete (graphe causal, scenarios contrefactuels, plan d'action CAPEX/OPEX), demandez le DIAGNOSTIC AEGIS complet a 250 EUR."

# REGLES
- Citer les articles specifiques des reglements
- Ne pas inventer de dispositions reglementaires
- Repondre dans la langue demandee (fr ou en)
- Rapport concis (max 200 lignes)`;

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

    if (!ANTHROPIC_API_KEY) {
        console.error('ANTHROPIC_API_KEY not configured in Vercel environment variables');
        return res.status(500).json({ error: 'Service non configure. Contactez l\'administrateur.' });
    }

    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
                     || req.socket?.remoteAddress || 'unknown';
    if (isRateLimited(clientIp)) {
        return res.status(429).json({ error: 'RATE_LIMITED', message: 'Trop de requetes. Patientez 1 minute.' });
    }

    try {
        const { mode, prompt, systemInstruction } = req.body;

        // Validation mode
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

        // Construction requete Claude Messages API
        const requestBody: Record<string, unknown> = {
            model: config.model,
            max_tokens: config.maxTokens,
            messages: [{ role: 'user', content: prompt }],
        };

        // System instruction : embarque (PULSE) ou fourni par le client (brain)
        if (mode === 'pulse') {
            requestBody.system = PULSE_SYSTEM_PROMPT;
        } else if (systemInstruction && typeof systemInstruction === 'string') {
            requestBody.system = systemInstruction;
        }

        // Streaming pour mode brain
        if (config.stream) {
            requestBody.stream = true;
        }

        const headers: Record<string, string> = {
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': ANTHROPIC_VERSION,
            'content-type': 'application/json',
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`Claude API error (mode=${mode}):`, response.status, errText);

            if (response.status === 429) {
                return res.status(429).json({
                    error: 'QUOTA_EXCEEDED',
                    message: 'Quota API Claude depasse. Reessayez dans quelques minutes.',
                });
            }
            return res.status(response.status).json({ error: 'API error', details: errText });
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
                const chunk = decoder.decode(value, { stream: true });
                res.write(chunk);
                (res as any).flush?.();
            }
            res.end();
            return;
        }

        // --- MODE JSON (pulse, diagnostic) ---
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

    } catch (error: any) {
        console.error('Claude proxy error:', error);
        return res.status(500).json({ error: 'Erreur interne', message: error.message });
    }
}
