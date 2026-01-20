
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY environment variable not set.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Configuration robuste - MODÈLE VALIDÉ ET TESTÉ
// gemini-2.5-flash est disponible et performant (décembre 2024+)
const MODEL_NAME = 'gemini-2.5-flash';

const modelInstance = genAI.getGenerativeModel({
    model: MODEL_NAME,
    safetySettings: [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
    ],
});

/**
 * Exécute une requête Gemini en streaming avec mécanisme de retry (Exponential Backoff)
 */
export const runQueryStream = async function* (
    prompt: string,
    systemInstruction: string,
    useGrounding: boolean = false
) {
    let retries = 3;
    let delay = 1000;

    // Simulation tool grounding si supporté par le modèle (sinon ignoré par SDK std)
    // Note: Le SDK @google/generative-ai gère les tools différemment.
    // Pour l'instant on se concentre sur le texte pur pour la stabilité.

    while (retries > 0) {
        try {
            const result = await modelInstance.generateContentStream({
                contents: [{ role: 'user', parts: [{ text: systemInstruction + "\n\n" + prompt }] }],
                // Note: systemInstruction natif est supporté dans les modèles récents,
                // mais l'injecter dans le prompt est souvent plus robuste cross-version.
            });

            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                if (chunkText) {
                    yield chunkText;
                }
            }
            return; // Success
        } catch (error: any) {
            retries--;
            console.error(`Gemini Stream Error (${retries} left):`, error);

            // Gestion spécifique erreur 429 (quota dépassé)
            const isQuotaError = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota');

            if (isQuotaError) {
                yield "\n\n⚠️ **QUOTA API DÉPASSÉ / API QUOTA EXCEEDED**\n\n";
                yield "🇫🇷 **Français** : Votre clé API Gemini a atteint sa limite d'utilisation.\n";
                yield "- **Action** : Attendez 1-60 minutes ou vérifiez vos quotas sur : https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas\n";
                yield "- **Solution** : Passez à un plan payant pour des quotas illimités.\n\n";
                yield "🇬🇧 **English** : Your Gemini API key has reached its usage limit.\n";
                yield "- **Action**: Wait 1-60 minutes or check your quotas at: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas\n";
                yield "- **Solution**: Upgrade to a paid plan for unlimited quotas.\n";
                return;
            }

            const isOverloaded = error?.status === 503 || error?.message?.includes('503') || error?.message?.includes('overloaded');

            if (isOverloaded && retries > 0) {
                yield "⚠️ Trafic intense détecté. Reconnexion optimisée en cours...";
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
                continue;
            }

            if (retries === 0) {
                yield "Désolé, le service est momentanément indisponible (Erreur Technique).";
            }
        }
    }
};

/**
 * Exécute une requête Gemini simple
 */
export const runQuery = async (
    prompt: string,
    systemInstruction: string,
    useGrounding: boolean = false
) => {
    let retries = 3;
    let delay = 1000;

    while (retries > 0) {
        try {
            const result = await modelInstance.generateContent({
                contents: [{ role: 'user', parts: [{ text: systemInstruction + "\n\n" + prompt }] }]
            });
            return result.response.text();
        } catch (error: any) {
            retries--;
            console.error(`Gemini Query Error (${retries} left):`, error);
            if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
                continue;
            }
            return "Erreur technique lors de la génération.";
        }
    }
    return "Service indisponible.";
};

export const runComplianceQuery = async (prompt: string) => {
    const systemInstruction = `Tu es un expert en conformité européenne (RGPD, AI Act, ESPR).
    Réponds de manière précise, structurée et cite les articles de loi pertinents.`;
    return runQuery(prompt, systemInstruction);
};
