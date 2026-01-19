
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from 'fs';
import * as path from 'path';

// Outil d'extraction PDF utilisant @google/generative-ai

const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
if (!apiKey) {
    if (import.meta.url === `file://${process.argv[1]}`) {
        console.error("❌ ERREUR: Variable GEMINI_API_KEY manquante.");
        process.exit(1);
    }
}

const genAI = new GoogleGenerativeAI(apiKey!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

interface RegulationData {
    numero: string;
    nom_complet: string;
    description: string;
    // ... autres champs
}

export async function extractRegulationFromPDF(pdfPath: string): Promise<any | null> {
    try {
        const fileData = fs.readFileSync(pdfPath);
        const pdfBase64 = fileData.toString('base64');

        const prompt = "Analyse ce règlement UE et extrait : Titre, Numéro, Dates clés, Résumé. Format JSON.";

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: pdfBase64,
                    mimeType: "application/pdf",
                },
            },
        ]);

        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    } catch (error) {
        console.error("Erreur Gemini PDF:", error);
        return null;
    }
}

// Fonction utilitaire pour tester
async function main() {
    const folder = './pdf-reglements';
    if (!fs.existsSync(folder)) {
        console.log(`Dossier ${folder} non trouvé - Mode Test Unitaire seul.`);
        return;
    }
    // Logique de scan de dossier...
}

// Exécution conditionnelle (ESM compatible check)
if (process.argv[1] && process.argv[1].endsWith('extractRegulationsFromPDF.ts')) {
    main();
}
