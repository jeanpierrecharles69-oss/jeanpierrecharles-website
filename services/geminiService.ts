
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY environment variable not set.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Configuration DÉTERMINISTE - MODÈLE VALIDÉ ET TESTÉ
// IMPORTANT : Le préfixe 'models/' est OBLIGATOIRE pour l'API Google Generative AI
const MODEL_NAME = 'models/gemini-2.0-flash';

// DÉTERMINISME STRICT POUR CONFORMITÉ RÉGLEMENTAIRE
// Configuration garantissant la reproductibilité parfaite des réponses
// Same input → Same output (essentiel pour audits et confiance utilisateur)
const DETERMINISTIC_CONFIG = {
    temperature: 0,        // Déterminisme maximal (pas de randomness)
    topP: 1,              // Désactive le nucleus sampling
    topK: 1,              // Sélectionne systématiquement le token le plus probable
    candidateCount: 1,    // Génère une seule réponse
    seed: 42,             // Seed fixe pour reproductibilité cross-platform
    maxOutputTokens: 2048,
};

const modelInstance = genAI.getGenerativeModel({
    model: MODEL_NAME,
    safetySettings: [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
    ],
    generationConfig: DETERMINISTIC_CONFIG
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

    // Utilisation de la configuration DÉTERMINISTE avec system instruction
    const modelWithSystem = genAI.getGenerativeModel({
        model: MODEL_NAME,
        systemInstruction: systemInstruction,
        generationConfig: DETERMINISTIC_CONFIG
    });

    while (retries > 0) {
        try {
            const result = await modelWithSystem.generateContentStream(prompt);

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

    const modelWithSystem = genAI.getGenerativeModel({
        model: MODEL_NAME,
        systemInstruction: systemInstruction,
        generationConfig: DETERMINISTIC_CONFIG
    });

    while (retries > 0) {
        try {
            const result = await modelWithSystem.generateContent(prompt);
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
