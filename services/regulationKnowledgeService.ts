/**
 * Service de base de connaissances réglementaires
 * 
 * Enrichit les prompts utilisateur avec le contexte réglementaire pertinent
 * pour améliorer la précision des réponses de l'assistant IA.
 * 
 * 8 RÈGLEMENTS EU COUVERTS :
 * 1. AI Act (2024/1689)
 * 2. Règlement Machines (2023/1230)
 * 3. ESPR (2024/1781)
 * 4. CRA (2024/2847)
 * 5. RGPD (2016/679)
 * 6. Règlement Batteries (2023/1542)
 * 7. Data Act (2023/2854)
 * 8. CPR (305/2011)
 */

interface RegulationContext {
    systemAddition: string;
}

// Base de connaissances réglementaires par thème
const REGULATION_KNOWLEDGE: Record<string, string> = {
    ai_act: `RÈGLEMENT (UE) 2024/1689 — AI Act (Intelligence Artificielle)
Entrée en vigueur : 1er août 2024. Application progressive : février 2025 (pratiques interdites), août 2025 (IA à usage général), août 2026 (systèmes à haut risque).
Classement par risque : inacceptable (interdit), haut risque (Annexe III), risque limité (transparence), risque minimal (libre).
Obligations haut risque : système de gestion des risques (Art.9), gouvernance des données (Art.10), documentation technique (Art.11), journalisation (Art.12), transparence (Art.13), contrôle humain (Art.14), précision/robustesse/cybersécurité (Art.15).
Sanctions : jusqu'à 35M€ ou 7% du CA mondial.`,

    machinery: `RÈGLEMENT (UE) 2023/1230 — Règlement Machines
Remplace la Directive 2006/42/CE. Application : 20 janvier 2027.
Nouveautés : intègre la cybersécurité, les systèmes autonomes, et l'IA dans les machines.
Exigences essentielles : sécurité et fiabilité des systèmes de commande (EHSR), évaluation des risques obligatoire, documentation technique complète, déclaration UE de conformité, marquage CE.
Catégories de machines à haut risque : Annexe I (évaluation par tiers obligatoire).`,

    espr: `RÈGLEMENT (UE) 2024/1781 — ESPR (Ecodesign for Sustainable Products Regulation)
Entrée en vigueur : 18 juillet 2024. Remplace la Directive 2009/125/CE.
Passeport Numérique Produit (DPP) : obligatoire pour les produits couverts par des actes délégués.
Exigences : durabilité, réparabilité, recyclabilité, empreinte carbone, contenu recyclé, efficacité énergétique.
Actes délégués prioritaires : textiles, acier/fer, aluminium, batteries (déjà couvert), meubles, pneus, détergents, peintures, lubrifiants.`,

    cra: `RÈGLEMENT (UE) 2024/2847 — CRA (Cyber Resilience Act)
Adopté : 23 octobre 2024. Application : 11 décembre 2027.
S'applique à tout produit comportant des éléments numériques (logiciels et matériels connectés).
Obligations fabricants : évaluation des risques cyber, sécurité par conception (security by design), mises à jour de sécurité pendant la durée de vie du produit (min. 5 ans), signalement des vulnérabilités à l'ENISA sous 24h.
Catégories : par défaut (auto-évaluation), classe I (harmonisée ou tiers), classe II (tiers obligatoire).`,

    gdpr: `RÈGLEMENT (UE) 2016/679 — RGPD (Règlement Général sur la Protection des Données)
Application : 25 mai 2018.
Principes : licéité/loyauté/transparence, limitation des finalités, minimisation des données, exactitude, limitation de la conservation, intégrité/confidentialité, responsabilité (accountability).
Bases légales (Art.6) : consentement, exécution d'un contrat, obligation légale, intérêts vitaux, mission d'intérêt public, intérêts légitimes.
Droits des personnes : accès, rectification, effacement, portabilité, opposition, limitation du traitement.
DPO obligatoire si : autorité publique, suivi régulier à grande échelle, traitement de données sensibles à grande échelle.
Sanctions : jusqu'à 20M€ ou 4% du CA mondial.`,

    batteries: `RÈGLEMENT (UE) 2023/1542 — Règlement Batteries
Entrée en vigueur : 17 août 2023. Application progressive jusqu'en 2031.
S'applique à toutes les batteries mises sur le marché de l'UE.
Exigences : empreinte carbone (obligatoire dès 2025 pour VE), contenu recyclé minimum, performance et durabilité, étiquetage et marquage, passeport numérique de batterie (2027), collecte et recyclage.
Devoir de diligence : chaîne d'approvisionnement pour cobalt, lithium, nickel, graphite naturel.
Objectifs recyclage : 2031 — Li 80%, Co 95%, Ni 95%, Cu 95%.`,

    data_act: `RÈGLEMENT (UE) 2023/2854 — Data Act (Règlement sur les données)
Application : 12 septembre 2025.
Objectif : accès équitable aux données générées par les produits connectés (IoT) et services associés.
Droits des utilisateurs : accès aux données générées par leurs appareils, droit de partager ces données avec des tiers.
Obligations fabricants : conception permettant l'accès aux données par défaut (data accessible by design), transparence sur les données collectées.
Cloud switching : droit de changer de fournisseur cloud, suppression des barrières au transfert, interopérabilité obligatoire.
Protection PME : clauses contractuelles abusives interdites pour le partage de données B2B.
Données publiques : accès facilité aux données du secteur privé en cas de besoin exceptionnel (urgences publiques).`,

    cpr: `RÈGLEMENT (UE) 305/2011 — CPR (Construction Products Regulation)
Application : depuis 2013. Révision en cours (proposition 2022/0094).
S'applique aux produits de construction mis sur le marché de l'UE.
Exigences : déclaration des performances (DoP) obligatoire, marquage CE basé sur normes harmonisées (hEN) ou ETA (European Technical Assessment).
Exigences fondamentales des ouvrages : résistance mécanique et stabilité, sécurité incendie, hygiène/santé/environnement, sécurité d'utilisation, protection bruit, économie d'énergie, utilisation durable des ressources naturelles.
Organismes notifiés : évaluation par tiers selon le système AVCP (Assessment and Verification of Constancy of Performance) — systèmes 1+, 1, 2+, 3, 4.
Points de contact produits : chaque État membre maintient un point de contact pour informer sur les règles nationales applicables.`,

    nis2: `DIRECTIVE (UE) 2022/2555 — NIS 2 (Network and Information Security)
Transposition nationale : 17 octobre 2024.
Élargit le champ d'application de NIS 1 à 18 secteurs (dont industrie manufacturière, chimie, alimentation, gestion des déchets).
Obligations : mesures de gestion des risques cyber, signalement d'incidents (24h alerte, 72h notification complète), responsabilité de la direction, sécurité de la chaîne d'approvisionnement.
Sanctions : entités essentielles jusqu'à 10M€ ou 2% du CA ; entités importantes jusqu'à 7M€ ou 1,4% du CA.`,

    dora: `RÈGLEMENT (UE) 2022/2554 — DORA (Digital Operational Resilience Act)
Application : 17 janvier 2025.
S'applique au secteur financier : banques, assurances, fintechs, prestataires TIC critiques.
Piliers : gestion des risques TIC, tests de résilience opérationnelle numérique, signalement des incidents TIC, gestion des risques liés aux prestataires TIC tiers, partage d'informations.`,
};

// Mots-clés associés à chaque réglementation
const KEYWORD_MAP: Record<string, string[]> = {
    ai_act: ['ia', 'ai', 'intelligence artificielle', 'artificial intelligence', 'ai act', 'algorithme', 'machine learning', 'deep learning', 'système autonome', 'autonomous system', 'haut risque', 'high risk', '2024/1689'],
    machinery: ['machine', 'machines', 'machinery', 'directive machines', 'règlement machines', 'sécurité machine', 'marquage ce', 'ce marking', '2023/1230', 'système de commande', 'automate'],
    espr: ['espr', 'ecodesign', 'écoconception', 'dpp', 'passeport numérique', 'digital product passport', 'durabilité', 'réparabilité', 'recyclabilité', '2024/1781', 'produit durable'],
    cra: ['cra', 'cyber resilience', 'cybersécurité', 'cybersecurity', 'résilience cyber', 'vulnérabilité', 'vulnerability', '2024/2847', 'security by design', 'sécurité par conception'],
    gdpr: ['rgpd', 'gdpr', 'données personnelles', 'personal data', 'protection des données', 'data protection', 'dpo', 'consentement', 'consent', '2016/679', 'vie privée', 'privacy'],
    batteries: ['batterie', 'battery', 'batteries', 'lithium', 'cobalt', 'recyclage batterie', '2023/1542', 'véhicule électrique', 'electric vehicle', 'empreinte carbone batterie'],
    data_act: ['data act', 'règlement données', 'données industrielles', 'iot données', '2023/2854', 'partage de données', 'data sharing', 'cloud switching', 'interopérabilité cloud', 'données connectées'],
    cpr: ['cpr', 'produits de construction', 'construction products', 'marquage ce construction', '305/2011', 'déclaration des performances', 'declaration of performance', 'dop', 'produit construction', 'bâtiment', 'ouvrage'],
    nis2: ['nis', 'nis2', 'sécurité réseau', 'network security', 'incident cyber', '2022/2555', 'infrastructure critique'],
    dora: ['dora', 'résilience opérationnelle', 'operational resilience', 'fintech', '2022/2554', 'risque tic'],
};

/**
 * Analyse le prompt utilisateur et retourne le contexte réglementaire pertinent
 */
export function enrichPromptWithRegulation(userPrompt: string): RegulationContext {
    const promptLower = userPrompt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const matchedRegulations: string[] = [];

    for (const [regId, keywords] of Object.entries(KEYWORD_MAP)) {
        for (const keyword of keywords) {
            const keywordNorm = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            if (promptLower.includes(keywordNorm)) {
                if (!matchedRegulations.includes(regId)) {
                    matchedRegulations.push(regId);
                }
                break;
            }
        }
    }

    if (matchedRegulations.length === 0) {
        return { systemAddition: '' };
    }

    const contexts = matchedRegulations
        .map(regId => REGULATION_KNOWLEDGE[regId])
        .filter(Boolean);

    return {
        systemAddition: contexts.join('\n\n---\n\n'),
    };
}
