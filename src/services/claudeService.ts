/**
 * Service AI API via Proxy Securise (multi-provider)
 *
 * SECURITE : Les appels passent par /api/claude-proxy (serverless Vercel)
 * La cle API n'est JAMAIS exposee cote client
 *
 * Le proxy route vers Gemini (brain, pulse) ou Anthropic (diagnostic).
 * Le client gere les deux formats SSE :
 *   - Anthropic : event: content_block_delta / data: {"type":"content_block_delta",...}
 *   - Gemini : data: {"candidates":[{"content":{"parts":[{"text":"..."}]}}]}
 *
 * Version : 2.0.0 -- 20260406T1030 CET
 * Signature : identique a geminiService.ts pour compatibilite import
 */

const PROXY_URL = '/api/claude-proxy';

/**
 * Parse un chunk SSE data en texte -- supporte Anthropic ET Gemini
 */
function parseStreamChunk(jsonStr: string): string {
    try {
        const data = JSON.parse(jsonStr);

        // Anthropic format : content_block_delta
        if (data.type === 'content_block_delta'
            && data.delta?.type === 'text_delta'
            && data.delta?.text) {
            return data.delta.text;
        }

        // Gemini format : candidates[].content.parts[].text
        if (data.candidates?.[0]?.content?.parts) {
            return data.candidates[0].content.parts
                .map((p: { text?: string }) => p.text || '')
                .join('');
        }
    } catch {
        // Skip : malformed JSON, event metadata, etc.
    }
    return '';
}

/**
 * Brain streaming (Gemini Flash) -- parse SSE multi-provider format
 * Signature identique a geminiService.runQueryStream pour compatibilite import
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
                if (line.startsWith('data: ')) {
                    const text = parseStreamChunk(line.slice(6));
                    if (text) yield text;
                }
            }
        }
    } catch (error: any) {
        console.error('AI proxy error:', error);
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
 * Requete DIAGNOSTIC (Opus 4.6, non-streaming JSON, system prompt embarque proxy)
 * Retourne le texte + flag troncature si stop_reason === 'max_tokens'
 */
export const runDiagnosticQuery = async (
    prompt: string,
    lang: string = 'fr'
): Promise<{
    text: string;
    usage?: Record<string, number>;
    model?: string;
    truncated: boolean;
}> => {
    const langInstruction = lang === 'en' ? 'Answer in English.' : 'Réponds en français.';
    const fullPrompt = `${langInstruction}\n\nVoici la demande de diagnostic d'un client PME/ETI industrielle :\n\n---\n${prompt}\n---\n\nProduis le diagnostic complet selon le format AEGIS Intelligence (7 sections).\nSois précis sur les articles et annexes des règlements applicables.\nIdentifie les interactions croisées entre les règlements qui s'appliquent au produit/système décrit.`;

    const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            mode: 'diagnostic',
            prompt: fullPrompt,
            systemInstruction: '', // system prompt embarqué dans le proxy
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erreur' }));
        if (response.status === 429) {
            throw new Error('QUOTA_EXCEEDED');
        }
        throw new Error(error.message || `API Error ${response.status}`);
    }

    const data = await response.json();
    return {
        text: data.text,
        usage: data.usage,
        model: data.model,
        truncated: data.stop_reason === 'max_tokens',
    };
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
