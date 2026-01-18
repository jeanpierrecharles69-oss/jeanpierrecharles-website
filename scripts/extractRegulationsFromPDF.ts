import { GoogleGenAI } from "@google/genai";
import * as fs from 'fs';
import * as path from 'path';

// Outil pour extraire les informations réglementaires d'un PDF
// et mettre à jour la base de connaissances

const apiKey = process.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY not set");
}

const ai = new GoogleGenAI({ apiKey });

interface RegulationData {
    numero: string;
    nom_complet: string;
    nom_court: string;
    nom_francais: string;
    date_adoption: string;
    date_publication: string;
    date_entree_vigueur: string;
    sujet: string;
    description: string;
    champ_application: string;
    mots_cles: string[];
    source: string;
}

export async function extractRegulationFromPDF(pdfPath: string): Promise<RegulationData | null> {
    try {
        // Lire le PDF en base64
        const pdfBuffer = fs.readFileSync(pdfPath);
        const pdfBase64 = pdfBuffer.toString('base64');

        const prompt = `Analyse ce document PDF d'un règlement européen et extrais les informations suivantes au format JSON :

{
  "numero": "YYYY/NNNN",
  "nom_complet": "Règlement (UE) ... titre complet",
  "nom_court": "Acronyme ou nom court",
  "nom_francais": "Nom en français",
  "date_adoption": "YYYY-MM-DD",
  "date_publication": "YYYY-MM-DD", 
  "date_entree_vigueur": "YYYY-MM-DD",
  "sujet": "Sujet principal en 1 phrase",
  "description": "Description détaillée en 2-3 phrases",
  "champ_application": "À quoi s'applique ce règlement",
  "mots_cles": ["mot1", "mot2", "mot3"],
  "source": "Journal officiel de l'Union européenne, date"
}

Sois précis et factuel. N'invente rien.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: 'application/pdf',
                                data: pdfBase64
                            }
                        }
                    ]
                }
            ]
        });

        const text = response.text;

        // Extraire le JSON de la réponse
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const regulationData = JSON.parse(jsonMatch[0]);
            return regulationData;
        }

        return null;
    } catch (error) {
        console.error('Erreur extraction PDF:', error);
        return null;
    }
}

export async function addRegulationToDatabase(regulationData: RegulationData): Promise<void> {
    const dbPath = path.join(__dirname, '../data/reglements-europeens-2024.json');

    // Lire la base actuelle
    const dbContent = fs.readFileSync(dbPath, 'utf-8');
    const db = JSON.parse(dbContent);

    // Vérifier si le règlement existe déjà
    const existingIndex = db.reglements.findIndex(
        (r: any) => r.numero === regulationData.numero
    );

    if (existingIndex !== -1) {
        // Mettre à jour
        db.reglements[existingIndex] = regulationData;
        console.log(`✅ Règlement ${regulationData.numero} mis à jour`);
    } else {
        // Ajouter
        db.reglements.push(regulationData);
        console.log(`✅ Règlement ${regulationData.numero} ajouté`);
    }

    // Mettre à jour la date
    db.derniere_mise_a_jour = new Date().toISOString().split('T')[0];

    // Sauvegarder
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
}

// Fonction principale pour traiter un dossier de PDFs
export async function processPDFFolder(folderPath: string): Promise<void> {
    const files = fs.readdirSync(folderPath);
    const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));

    console.log(`📂 ${pdfFiles.length} PDFs trouvés dans ${folderPath}`);

    for (const pdfFile of pdfFiles) {
        const fullPath = path.join(folderPath, pdfFile);
        console.log(`\n📄 Traitement de ${pdfFile}...`);

        const regulationData = await extractRegulationFromPDF(fullPath);

        if (regulationData) {
            await addRegulationToDatabase(regulationData);
            console.log(`   ${regulationData.nom_francais}`);
        } else {
            console.log(`   ❌ Échec de l'extraction`);
        }
    }

    console.log('\n✅ Traitement terminé !');
}

// Script CLI
if (require.main === module) {
    const pdfFolder = process.argv[2] || './pdf-reglements';

    console.log('🚀 Extraction automatique des règlements depuis PDFs');
    console.log(`📂 Dossier : ${pdfFolder}`);

    processPDFFolder(pdfFolder)
        .then(() => console.log('✨ Done!'))
        .catch(err => console.error('❌ Erreur:', err));
}
