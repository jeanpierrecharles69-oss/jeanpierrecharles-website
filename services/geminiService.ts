
import { GoogleGenAI } from "@google/genai";

// Ensure the API key is available as an environment variable
// Vite requires import.meta.env for client-side environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY environment variable not set. Please add it to your .env.local file.");
}

const ai = new GoogleGenAI({ apiKey });

// Gemini 2.5 Flash - Modèle stable et testé (production-ready)
const model = 'gemini-2.5-flash';

// Configuration pour Google Search Grounding (recherche dynamique)
// Permet à Gemini d'accéder à des informations récentes via Google Search
const groundingTool = {
    googleSearch: {}  // Syntaxe simplifiée pour activation
};

/**
 * Exécute une requête Gemini en streaming
 * @param prompt - La question/prompt de l'utilisateur
 * @param systemInstruction - Instructions système pour Gemini
 * @param useGrounding - Activer Google Search pour infos récentes (défaut: false)
 */
export const runQueryStream = async function* (
    prompt: string,
    systemInstruction: string,
    useGrounding: boolean = false
) {
    try {
        const requestConfig: any = {
            model: model,
            contents: prompt,
            systemInstruction: systemInstruction,
        };

        // Activer Google Search si demandé (pour données récentes)
        if (useGrounding) {
            requestConfig.tools = [groundingTool];
        }

        const response = await ai.models.generateContentStream(requestConfig);

        for await (const chunk of response) {
            if (chunk.text) {
                yield chunk.text;
            }
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        yield "Désolé, une erreur s'est produite. Veuillez réessayer.";
    }
};

/**
 * Exécute une requête Gemini simple
 * @param prompt - La question/prompt de l'utilisateur
 * @param systemInstruction - Instructions système pour Gemini
 * @param useGrounding - Activer Google Search pour infos récentes (défaut: false)
 */
export const runQuery = async (
    prompt: string,
    systemInstruction: string,
    useGrounding: boolean = false
) => {
    try {
        const requestConfig: any = {
            model: model,
            contents: prompt,
            systemInstruction: systemInstruction,
        };

        // Activer Google Search si demandé (pour données récentes)
        if (useGrounding) {
            requestConfig.tools = [groundingTool];
        }

        const response = await ai.models.generateContent(requestConfig);
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Désolé, une erreur s'est produite. Veuillez réessayer.";
    }
};

/**
 * Fonction spécialisée pour les questions sur la conformité réglementaire
 * Active automatiquement Google Search pour les règlements récents
 */
export const runComplianceQuery = async (prompt: string) => {
    const systemInstruction = `Tu es un expert en conformité européenne spécialisé dans :
- RGPD (Règlement Général sur la Protection des Données)
- AI Act (Règlement sur l'Intelligence Artificielle)
- Data Act (Règlement sur les données)
- Cyber Resilience Act
- Et autres règlements européens récents

Utilise Google Search pour trouver les informations les plus récentes.
Cite toujours tes sources avec les numéros de règlement exacts et les dates.
Si un règlement n'existe pas, indique-le clairement.`;

    return runQuery(prompt, systemInstruction, true); // Active grounding
};
