import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import type { Plugin } from 'vite';

// Charger .env.local côté serveur (pas exposé au client)
dotenv.config({ path: '.env.local' });

/**
 * Plugin Vite : Proxy local pour Gemini API (DEV uniquement)
 * 
 * En développement, intercepte les requêtes POST /api/gemini-proxy
 * et les redirige vers l'API Gemini avec la clé API côté serveur.
 * La clé n'est JAMAIS exposée au navigateur.
 * 
 * En production, Vercel utilise api/gemini-proxy.ts (serverless function).
 */
function geminiDevProxy(): Plugin {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const MODEL_NAME = 'gemini-2.0-flash';
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:streamGenerateContent`;

    return {
        name: 'gemini-dev-proxy',
        configureServer(server) {
            server.middlewares.use('/api/gemini-proxy', async (req, res) => {
                // CORS headers
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

                if (req.method === 'OPTIONS') {
                    res.statusCode = 200;
                    res.end();
                    return;
                }

                if (req.method !== 'POST') {
                    res.statusCode = 405;
                    res.end(JSON.stringify({ error: 'Method not allowed' }));
                    return;
                }

                if (!GEMINI_API_KEY) {
                    console.error('❌ GEMINI_API_KEY non trouvée dans .env.local');
                    res.statusCode = 500;
                    res.end(JSON.stringify({ 
                        error: 'API key not configured',
                        message: 'Ajoutez GEMINI_API_KEY=votre_clé dans .env.local'
                    }));
                    return;
                }

                // Lire le body de la requête
                let body = '';
                try {
                    body = await new Promise<string>((resolve, reject) => {
                        const chunks: Buffer[] = [];
                        req.on('data', (chunk: Buffer) => chunks.push(chunk));
                        req.on('end', () => resolve(Buffer.concat(chunks).toString()));
                        req.on('error', reject);
                    });
                } catch {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ error: 'Failed to read request body' }));
                    return;
                }

                let parsed: { prompt?: string; systemInstruction?: string };
                try {
                    parsed = JSON.parse(body);
                } catch {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ error: 'Invalid JSON' }));
                    return;
                }

                if (!parsed.prompt || typeof parsed.prompt !== 'string') {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ error: 'Missing or invalid prompt' }));
                    return;
                }

                // Configuration déterministe (AI Act compliant)
                const requestBody = {
                    generationConfig: {
                        temperature: 0,
                        topP: 1,
                        topK: 1,
                        candidateCount: 1,
                        seed: 42,
                        maxOutputTokens: 2048,
                    },
                    systemInstruction: parsed.systemInstruction 
                        ? { parts: [{ text: parsed.systemInstruction }] } 
                        : undefined,
                    contents: [{ parts: [{ text: parsed.prompt }] }],
                };

                try {
                    console.log('[DEV PROXY] → Gemini API request');
                    
                    const geminiResponse = await fetch(
                        `${API_URL}?key=${GEMINI_API_KEY}&alt=sse`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(requestBody),
                        }
                    );

                    if (!geminiResponse.ok) {
                        const errorText = await geminiResponse.text();
                        console.error('[DEV PROXY] ❌ Gemini error:', geminiResponse.status, errorText);
                        
                        res.statusCode = geminiResponse.status;
                        res.end(JSON.stringify({ 
                            error: geminiResponse.status === 429 ? 'QUOTA_EXCEEDED' : 'API error',
                            message: geminiResponse.status === 429 
                                ? 'Quota API Gemini dépassé. Réessayez dans quelques minutes.'
                                : `Gemini API error: ${geminiResponse.status}`
                        }));
                        return;
                    }

                    // Streaming SSE vers le client
                    res.setHeader('Content-Type', 'text/event-stream');
                    res.setHeader('Cache-Control', 'no-cache');
                    res.setHeader('Connection', 'keep-alive');

                    const reader = geminiResponse.body?.getReader();
                    if (!reader) {
                        res.statusCode = 500;
                        res.end(JSON.stringify({ error: 'No response body from Gemini' }));
                        return;
                    }

                    const decoder = new TextDecoder();
                    
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        const chunk = decoder.decode(value, { stream: true });
                        res.write(chunk);
                    }

                    console.log('[DEV PROXY] ✅ Response streamed successfully');
                    res.end();

                } catch (error: any) {
                    console.error('[DEV PROXY] ❌ Proxy error:', error.message);
                    res.statusCode = 500;
                    res.end(JSON.stringify({ 
                        error: 'Proxy error', 
                        message: error.message 
                    }));
                }
            });
        },
    };
}

export default defineConfig(() => {
    return {
        server: {
            port: 5173,
            host: '0.0.0.0',
        },
        plugins: [
            react(),
            geminiDevProxy(),
        ],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            },
        },
    };
});
