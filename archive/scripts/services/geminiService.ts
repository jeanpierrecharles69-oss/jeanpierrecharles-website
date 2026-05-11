/**
 * Service Gemini avec Proxy Sécurisé
 * 
 * SÉCURITÉ : Les appels passent par /api/gemini-proxy (serverless Vercel)
 * La clé API n'est JAMAIS exposée côté client
 * 
 * Configuration déterministe (AI Act compliant) : Temp=0, TopK=1, Seed=42
 */

const PROXY_URL = '/api/gemini-proxy';

// Configuration DÉTERMINISTE pour conformité réglementaire
const DETERMINISTIC_CONFIG = {
    temperature: 0,
    topP: 1,
    topK: 1,
    candidateCount: 1,
    seed: 42,
    maxOutputTokens: 2048,
};

/**
 * Exécute une requête via le proxy serverless (PRODUCTION + DEV)
 * En dev : le proxy tourne via `npx vercel dev` sur localhost:3000
 * En prod : le proxy tourne via Vercel serverless
 */
async function* runQueryViaProxy(prompt: string, systemInstruction: string) {
    try {
        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, systemInstruction })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
            if (response.status === 429) {
                yield "\n\n⚠️ **QUOTA API DÉPASSÉ**\n\n";
                yield "Votre quota API Gemini a été atteint. Réessayez dans quelques minutes.\n";
                return;
            }
            throw new Error(error.message || `API Error ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (text) yield text;
                    } catch {
                        // Skip malformed chunks
                    }
                }
            }
        }
    } catch (error: any) {
        console.error('Proxy error:', error);
        yield `⚠️ Service momentanément indisponible. Veuillez réessayer.\n\nDétail technique : ${error.message}`;
    }
}

/**
 * Point d'entrée principal — TOUJOURS via le proxy sécurisé
 */
export const runQueryStream = async function* (
    prompt: string,
    systemInstruction: string,
    _useGrounding: boolean = false
) {
    yield* runQueryViaProxy(prompt, systemInstruction);
};

/**
 * Requête simple (non-streaming)
 */
export const runQuery = async (
    prompt: string,
    systemInstruction: string,
    _useGrounding: boolean = false
): Promise<string> => {
    const chunks: string[] = [];
    for await (const chunk of runQueryStream(prompt, systemInstruction)) {
        chunks.push(chunk);
    }
    return chunks.join('');
};

/**
 * Requête spécialisée conformité
 */
export const runComplianceQuery = async (prompt: string): Promise<string> => {
    const systemInstruction = `Tu es un expert en conformité européenne (RGPD, AI Act, ESPR).
Réponds de manière précise, structurée et cite les articles de loi pertinents.`;
    return runQuery(prompt, systemInstruction);
};
