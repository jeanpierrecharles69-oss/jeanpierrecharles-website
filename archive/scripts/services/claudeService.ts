/**
 * Service Claude API via Proxy Securise
 *
 * SECURITE : Les appels passent par /api/claude-proxy (serverless Vercel)
 * La cle API n'est JAMAIS exposee cote client
 *
 * Format SSE Claude Messages API :
 *   event: content_block_delta
 *   data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"..."}}
 *
 * Version : 1.0.0 -- 20260331T1200 CET
 * Remplace : geminiService.ts (Gemini 2.0 Flash deprecie, arret 01/06/2026)
 * Signature : identique a geminiService.ts pour compatibilite import
 */

const PROXY_URL = '/api/claude-proxy';

/**
 * Brain streaming (Haiku 4.5) -- parse SSE Claude format
 * Signature identique a geminiService.runQueryStream pour changement d'import 1 ligne
 */
export const runQueryStream = async function* (
    prompt: string,
    systemInstruction: string,
    _useGrounding: boolean = false
) {
    try {
        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mode: 'brain',
                prompt,
                systemInstruction,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
            if (response.status === 429) {
                yield "\n\n⚠️ **QUOTA API DÉPASSÉ**\n\n";
                yield "Quota atteint. Réessayez dans quelques minutes.\n";
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
                // Claude SSE format : "data: {...}"
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));

                        // Extraire le texte des content_block_delta
                        if (data.type === 'content_block_delta'
                            && data.delta?.type === 'text_delta'
                            && data.delta?.text) {
                            yield data.delta.text;
                        }
                    } catch {
                        // Skip : event lines, empty data, message_start, message_stop, etc.
                    }
                }
            }
        }
    } catch (error: any) {
        console.error('Claude proxy error:', error);
        yield `⚠️ Service momentanément indisponible. Veuillez réessayer.\n\nDétail technique : ${error.message}`;
    }
};

/**
 * Requete PULSE (Sonnet 4.6, non-streaming JSON)
 */
export const runPulseQuery = async (
    sector: string,
    product: string,
    concerns: string,
    lang: string = 'fr'
): Promise<{ text: string; usage?: Record<string, number>; model?: string }> => {
    const langInstruction = lang === 'en' ? 'Answer in English.' : 'Réponds en français.';
    const prompt = `${langInstruction}\n\nSecteur : ${sector}\nProduit : ${product}\nPréoccupations : ${concerns || 'Non précisées'}\n\nProduis le pré-diagnostic AEGIS PULSE (sections 1 et 2 uniquement).`;

    const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            mode: 'pulse',
            prompt,
            systemInstruction: '', // system prompt embarque dans le proxy
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erreur' }));
        throw new Error(error.message || `API Error ${response.status}`);
    }

    return response.json();
};

/**
 * Requete simple (non-streaming) -- backward compatible avec geminiService.runQuery
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
 * Requete specialisee conformite -- backward compatible avec geminiService
 */
export const runComplianceQuery = async (prompt: string): Promise<string> => {
    const systemInstruction = `Tu es un expert en conformité européenne (RGPD, AI Act, ESPR).
Réponds de manière précise, structurée et cite les articles de loi pertinents.`;
    return runQuery(prompt, systemInstruction);
};
