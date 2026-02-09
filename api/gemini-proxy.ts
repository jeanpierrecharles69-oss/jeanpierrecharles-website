import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Proxy serverless pour Gemini API
 * SÉCURITÉ : La clé API est dans les variables d'environnement Vercel
 * CORS : Restreint à jeanpierrecharles.com
 * RATE LIMIT : Basique par IP (10 requêtes/minute)
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = 'gemini-2.0-flash';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:streamGenerateContent`;

// Domaines autorisés (CORS)
const ALLOWED_ORIGINS = [
    'https://jeanpierrecharles.com',
    'https://www.jeanpierrecharles.com',
    'http://localhost:5173',  // Dev local Vite
    'http://localhost:3000',  // Dev local Vercel
];

// Rate limiting simple en mémoire (reset au redémarrage de la function)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requêtes max
const RATE_WINDOW = 60 * 1000; // par minute

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

// Configuration déterministe (AI Act compliant)
const DETERMINISTIC_CONFIG = {
    generationConfig: {
        temperature: 0,
        topP: 1,
        topK: 1,
        candidateCount: 1,
        seed: 42,
        maxOutputTokens: 2048,
    }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS — Restreint aux domaines autorisés
    const origin = req.headers.origin || '';
    const allowedOrigin = ALLOWED_ORIGINS.find(o => origin.startsWith(o)) || ALLOWED_ORIGINS[0];
    
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Vary', 'Origin');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY not configured in Vercel environment variables');
        return res.status(500).json({ error: 'Service non configuré. Contactez l\'administrateur.' });
    }

    // Rate limiting par IP
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() 
                     || req.socket?.remoteAddress 
                     || 'unknown';
    
    if (isRateLimited(clientIp)) {
        return res.status(429).json({ 
            error: 'RATE_LIMITED',
            message: 'Trop de requêtes. Veuillez patienter 1 minute.' 
        });
    }

    try {
        const { prompt, systemInstruction } = req.body;

        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid prompt' });
        }

        // Limiter la taille du prompt (protection contre les abus)
        if (prompt.length > 10000) {
            return res.status(400).json({ error: 'Prompt trop long (max 10000 caractères)' });
        }

        const requestBody = {
            ...DETERMINISTIC_CONFIG,
            systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
            contents: [{ parts: [{ text: prompt }] }]
        };

        const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}&alt=sse`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API error:', response.status, errorText);

            if (response.status === 429) {
                return res.status(429).json({
                    error: 'QUOTA_EXCEEDED',
                    message: 'Quota API Gemini dépassé. Réessayez dans quelques minutes.'
                });
            }

            return res.status(response.status).json({ error: 'API error', details: errorText });
        }

        // Streaming response
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const reader = response.body?.getReader();
        if (!reader) {
            return res.status(500).json({ error: 'No response body' });
        }

        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            res.write(chunk);
        }

        res.end();

    } catch (error: any) {
        console.error('Proxy error:', error);
        return res.status(500).json({ error: 'Erreur interne', message: error.message });
    }
}
