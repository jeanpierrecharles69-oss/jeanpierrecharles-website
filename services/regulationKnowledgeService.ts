// Service pour injecter les connaissances réglementaires locales dans le prompt
import reglements from '../data/reglements-europeens-2024.json';

export function enrichPromptWithRegulation(userPrompt: string): { enrichedPrompt: string, systemAddition: string } {
    console.log('🔍 [DEBUG] Enrichissement du prompt:', userPrompt);

    // Détecter si la question porte sur un règlement spécifique
    // Pattern amélioré : capte aussi les numéros seuls (ex: "batteries 2023/1542")
    const regPattern = /(?:règlement|regulation|UE|EU|batteries?|AI\s*Act|ERSP|ESPR|CRA|Data\s*Act|RGPD|GDPR|machines?)?[:\s]*(?:\(UE\)|\(EU\)|UE|EU)?\s*(\d{4}\/\d+)/gi;

    // Détection spécifique ERSP/ESPR → 2024/1781 (les deux acronymes sont acceptés)
    const erspEsprPattern = /\b(ERSP|ESPR)\b/gi;
    const erspEsprMatch = userPrompt.match(erspEsprPattern);

    let matches = userPrompt.match(regPattern);


    // Si ERSP ou ESPR détecté sans numéro, forcer 2024/1781
    if (erspEsprMatch && (!matches || !matches.some(m => m.includes('2024/1781')))) {
        console.log('🔍 [DEBUG] ERSP/ESPR détecté → forçage 2024/1781');
        if (!matches) matches = [];
        matches.push('2024/1781');
    }

    console.log('🔍 [DEBUG] Matches trouvés:', matches);

    let systemAddition = '';

    if (matches && matches.length > 0) {
        // Extraire les numéros de règlements mentionnés
        const regNumbers = matches.map(m => {
            const numMatch = m.match(/(\d{4}\/\d+)/);
            return numMatch ? numMatch[1] : null;
        }).filter(Boolean) as string[];

        console.log('🔍 [DEBUG] Numéros extraits:', regNumbers);
        console.log('🔍 [DEBUG] Base de données:', reglements);

        // Chercher dans notre base de connaissances
        const foundRegs = reglements.reglements.filter(r =>
            regNumbers.includes(r.numero)
        );

        console.log('🔍 [DEBUG] Règlements trouvés dans la base:', foundRegs);

        if (foundRegs.length > 0) {
            systemAddition = '\n\nCONNAISSANCES RÉCENTES (Base locale 2024) :\n';
            foundRegs.forEach(reg => {
                systemAddition += `
- Règlement (UE) ${reg.numero} :
  * Nom : ${reg.nom_francais} (${reg.nom_court})
  * Adopté : ${reg.date_adoption}
  * Publié : ${reg.date_publication}
  * Entrée en vigueur : ${reg.date_entree_vigueur}
  * Sujet : ${reg.sujet}
  * Description : ${reg.description}
  * Champ d'application : ${reg.champ_application}
`;
            });
            systemAddition += '\nUtilise UNIQUEMENT ces informations pour répondre sur ce règlement.\n';
            console.log('✅ [DEBUG] System addition créé:', systemAddition);
        } else {
            console.log('❌ [DEBUG] Aucun règlement trouvé dans la base');
        }
    } else {
        console.log('❌ [DEBUG] Aucun match de pattern trouvé');
    }

    return {
        enrichedPrompt: userPrompt,
        systemAddition
    };
}

// Fonction helper pour détecter si un règlement est dans notre base
export function hasRegulationInKnowledgeBase(regNumber: string): boolean {
    return reglements.reglements.some(r => r.numero === regNumber);
}

// Obtenir les informations d'un règlement
export function getRegulationInfo(regNumber: string) {
    return reglements.reglements.find(r => r.numero === regNumber);
}
