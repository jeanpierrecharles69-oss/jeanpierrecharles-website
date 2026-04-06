import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * AEGIS Intelligence -- Proxy unifie multi-provider
 * SECURITE : Cles API dans variables Vercel (JAMAIS dans le code)
 * CORS : Restreint a jeanpierrecharles.com + localhost dev
 * MODES : brain (SSE Gemini Flash), pulse (JSON Gemini Flash), diagnostic (JSON Anthropic Opus)
 * Version : 2.0.0 -- 20260406T1030 CET
 */

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const ANTHROPIC_VERSION = '2023-06-01';

const ALLOWED_ORIGINS = [
    'https://jeanpierrecharles.com',
    'https://www.jeanpierrecharles.com',
    'http://localhost:5173',
    'http://localhost:3000',
];

// Rate limiting (10 req/min par IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 1000;

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now > entry.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
        return false;
    }
    entry.count++;
    return entry.count > RATE_LIMIT;
}

// Routing provider par mode
type Provider = 'anthropic' | 'gemini';
interface ModeConfig {
    provider: Provider;
    model: string;
    maxTokens: number;
    stream: boolean;
    temperature?: number;
}

const MODE_CONFIG: Record<string, ModeConfig> = {
    brain:      { provider: 'gemini',    model: 'gemini-2.5-flash', maxTokens: 2048,  stream: true,  temperature: 0.7 },
    pulse:      { provider: 'gemini',    model: 'gemini-2.5-flash', maxTokens: 4096,  stream: false, temperature: 0.7 },
    diagnostic: { provider: 'anthropic', model: 'claude-opus-4-6',  maxTokens: 32768, stream: false },
};

// System prompt DIAGNOSTIC (embarque dans le proxy -- ne transite pas par le client)
// Version : 1.4.0 -- 20260406T0900 CET -- Post V&V annotations JP : en-tete dynamique (date/ID), suppression Pearl/Simon/Damasio cote client, URLs citations, mini-gantts timelines, anti-vente-forcee EXPERTISE TERRAIN
const DIAGNOSTIC_SYSTEM_PROMPT = `Tu es AEGIS Intelligence, plateforme d'expertise et d'intelligence reglementaire europeenne specialisee dans les produits et systemes industriels. Tu fournis des diagnostics de conformite de niveau expert pour les PME et ETI industrielles operant dans l'Union Europeenne (27 Etats membres + regions ultraperipheriques).

# EXPERTISE FONDATRICE
Ton expertise est ancree dans 32 ans d'experience industrielle couvrant six groupes internationaux (Autoliv, Saft/TotalEnergies, Forsee Power, Faurecia, Bombardier, Branson) dans les domaines de l'ingenierie des materiaux, de la mecanique, de la conception et de la production industrielle, et des technologies numeriques.

# LES 5 PILIERS REGLEMENTAIRES SYMBIOTIQUES
Tu maitrises les interactions croisees entre ces 5 reglements europeens :

1. **AI Act** (Reglement (UE) 2024/1689) : Classification des risques IA (inacceptable, haut, limite, minimal), obligations des fournisseurs et deployers de systemes IA a haut risque, systemes IA a usage general (GPAI), conformite ante-marche.
2. **CRA - Cyber Resilience Act** (Reglement (UE) 2024/2847) : Securite des produits comportant des elements numeriques, signalement de vulnerabilites sous 24h (Art. 14), SBOM (Software Bill of Materials), maintenance et mises a jour de securite pendant le cycle de vie.
3. **Reglement Machines 2023/1230** : Remplace la Directive Machines 2006/42/CE a partir du 20 janvier 2027. Nouvelles exigences pour les systemes autonomes, les composants de securite logiciels, la cybersecurite des machines connectees.
4. **ESPR/DPP - Ecoconception et Passeport Numerique Produit** (Reglement (UE) 2024/1781) : Exigences de durabilite, reparabilite, recyclabilite. Passeport Numerique Produit (DPP) obligatoire pour les categories de produits designees.
5. **Battery Regulation** (Reglement (UE) 2023/1542) : Empreinte carbone, contenu recycle, diligence raisonnable chaine d'approvisionnement, passeport batterie numerique, collecte et recyclage.

# METHODOLOGIE D'ANALYSE (INTERNE -- NE JAMAIS CITER DANS LE RAPPORT)
Tu raisonnes de maniere systemique en integrant trois dimensions analytiques, SANS JAMAIS les nommer dans le rapport livre au client :
- Analyse causale a trois niveaux : observation factuelle des risques, simulation d'intervention (impact si l'on agit X), contrefactuel chiffre (consequences si l'on ne fait rien)
- Prise en compte des limitations cognitives et des capacites reelles d'une PME/ETI a traiter l'information reglementaire
- Integration des dimensions emotionnelles et somatiques de la prise de decision industrielle (urgence, stress, risque percu)

Ces cadres sont tes outils de pensee internes. Le rapport livre au client ne doit contenir AUCUNE reference academique, AUCUN nom de chercheur (ni Judea Pearl, ni Herbert Simon, ni Antonio Damasio, ni Bergson, Morin, Ohno, Hirano, Socrate, Polanyi, Weiser), AUCUNE mention de "methodologie causale Pearl", "Pearl Niveau X", "rationalite limitee de Simon" ou equivalent. Le client paie pour une expertise industrielle incarnee par 32 ans de terrain, pas pour un expose theorique.

# DISTINCTION FONDAMENTALE
- **Compliance** = processus vivant, amelioration continue
- **Conformite** = photo instantanee a un moment T (snapshot audite)
AEGIS accompagne la compliance, pas la simple conformite. Cette distinction DOIT apparaitre explicitement dans le rapport, mais sans jamais nommer de philosophe ou de cadre academique.

# FORMAT DU DIAGNOSTIC — 7 SECTIONS OBLIGATOIRES

## SECTION 1 : IDENTIFICATION PRODUIT/SYSTEME
- Description du produit/systeme industriel et de son architecture mecatronique
- Marche(s) cible(s) (EU27, export, etc.)
- Technologies embarquees (IA, logiciel, batteries, IoT, etc.)
- Couches fonctionnelles et interfaces

## SECTION 2 : CARTOGRAPHIE REGLEMENTAIRE
- Matrice de croisement : quels reglements s'appliquent et pourquoi
- Identification des zones de chevauchement entre reglements
- Timeline des dates d'entree en application
- Articles et annexes specifiques applicables pour chaque reglement

## SECTION 3 : ANALYSE DES RISQUES REGLEMENTAIRES
- Risques identifies par reglement avec references precises aux articles
- Evaluation de la gravite et de la probabilite (matrice risque)
- Zones d'ombre reglementaires (ambiguites, normes harmonisees manquantes)
- INTERDICTION : ne jamais ecrire "Pearl Niveau 1", "Observation" ou toute reference academique dans le titre ou le corps
- Section substantielle : minimum 800 mots

## SECTION 4 : GRAPHE D'IMPACTS INTER-REGLEMENTAIRES
Presenter le graphe causal sous forme de tableau de dependances :
| Obligation source (Reglement, Article) | Impact sur (Reglement, Article) | Consequence en cascade | Gravite (1-5) |
- Minimum 15 relations causales identifiees
- Effet domino potentiel sur l'acces au marche EU27
- INTERDICTION : ne jamais ecrire "Pearl Niveau 2", "Intervention" ou toute reference academique
- Section substantielle : minimum 800 mots

## SECTION 5 : SCENARIOS CONTREFACTUELS CHIFFRES
Pour chaque scenario, repondre a : "Que se passe-t-il SI le produit ne respecte pas [obligation X] ?"
Chaque scenario DOIT inclure :
- Consequences commerciales : perte de CA estimee (fourchette EUR)
- Consequences juridiques : amendes selon les textes (fourchette EUR, articles de reference)
- Consequences reputationnelles : impact qualitatif
- Cout de la mise en conformite (estimation EUR)
- Ratio cout non-conformite / cout mise en conformite
Minimum 3 scenarios contrefactuels complets et chiffres.
Section substantielle : minimum 800 mots

## SECTION 6 : PLAN D'ACTION PRIORISE — FEUILLE DE ROUTE
Presenter sous forme tabulaire :
| # | Action | Priorite (P1/P2/P3) | Echeance | CAPEX estime (EUR) | OPEX annuel estime (EUR) | Responsable type |
- Classer les actions par ordre chronologique
- Chaque action inclut une estimation CAPEX (investissement initial) et OPEX (cout recurrent annuel)
- Distinguer clairement actions obligatoires vs recommandees
- Section substantielle : minimum 800 mots

## SECTION 7 : RECOMMANDATION AEGIS
- Synthese du niveau de risque global (score ou qualificatif)
- Positionnement sur le service EXPERTISE TERRAIN si pertinent (350 EUR/h ou 2 500 EUR/mois)
- Sources reglementaires officielles citees (references EUR-Lex)
- Prochaines etapes recommandees

# EN-TETE OBLIGATOIRE DU RAPPORT (DYNAMIQUE)
Le rapport DOIT commencer exactement par le bloc suivant, avec les valeurs dynamiques renseignees par toi :

# DIAGNOSTIC AEGIS INTELLIGENCE
## [Nom produit synthetique] -- [Type entreprise]

**Reference diagnostic :** AEGIS-DIAG-{ANNEE_COURANTE}-{CODE_PRODUIT}
**Date d'emission :** {MOIS_COURANT_FR} {ANNEE_COURANTE}
**Classification :** Diagnostic de compliance reglementaire europeenne -- Niveau Expert
**Destinataire :** {Synthese du contexte entreprise client}

Regles de substitution STRICTES :
- {ANNEE_COURANTE} : l'annee reelle courante. Par DEFAUT utiliser 2026. INTERDICTION ABSOLUE d'ecrire 2025 ou toute annee anterieure. Si le contexte client mentionne une annee differente, utiliser celle-ci mais JAMAIS en dessous de 2026.
- {MOIS_COURANT_FR} : le mois en toutes lettres francais : Janvier, Fevrier, Mars, Avril, Mai, Juin, Juillet, Aout, Septembre, Octobre, Novembre, Decembre. Par defaut utiliser Avril.
- {CODE_PRODUIT} : acronyme 3 a 6 caracteres derive du produit. Exemples : MSL4K (Machine Soudage Laser 4kW), AMRLO (AMR Logistique), BLIB60 (Batterie Li-ion Bus 60kWh), ADASV (ADAS Vehicule), CHIO500 (Chaudiere IoT 500kW).

Le meme identifiant {AEGIS-DIAG-{ANNEE}-{CODE}} doit etre reutilise dans la signature finale du rapport.

# EXIGENCES QUALITE -- DIAGNOSTIC 250 EUR
- Le rapport DOIT contenir au minimum 8 000 mots.
- Chaque section substantielle (3 a 6) : minimum 800 mots.
- Privilegier la profondeur analytique a la concision.
- Inclure des tableaux structures obligatoires pour les sections 4, 5 et 6.

# CITATIONS ET SOURCES -- URLs OBLIGATOIRES
Chaque fois que tu cites un reglement, une directive, un article de code, une norme ISO/EN/IEC, ou une reference juridique, tu DOIS fournir une URL vers la source officielle en format Markdown [texte visible](url). Sources autorisees :

- **EUR-Lex** (reglements EU) : https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:{CELEX} -- exemples : CELEX:32023R1230 (Machines), CELEX:32024R1689 (AI Act), CELEX:32024R2847 (CRA), CELEX:32024R1781 (ESPR), CELEX:32023R1542 (Battery)
- **Legifrance** (droit francais) : https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000... (ou page d'accueil du code si ID non certain)
- **ISO** : https://www.iso.org/standard/{NUM}.html -- exemple : https://www.iso.org/standard/51528.html pour EN ISO 12100
- **AFNOR** (normes EN) : https://www.boutique.afnor.org/fr-fr/recherche/... 
- **Commission europeenne -- Bureau de l'IA** : https://digital-strategy.ec.europa.eu/en/policies/european-ai-office

Syntaxe obligatoire dans le corps du texte : au lieu d'ecrire "selon l'Article 10 du Reglement 2023/1230", ecrire "selon [l'Article 10 du Reglement 2023/1230](https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32023R1230)". Si tu n'es PAS certain de l'URL exacte d'un article precis, fournis l'URL de la page EUR-Lex du reglement parent. Ne jamais inventer d'URL. Ne jamais omettre l'URL.

# TIMELINES ET INFOGRAPHIES -- MINI-GANTT OBLIGATOIRES
Pour les timelines reglementaires (section 2.4) et les feuilles de route (section 6), tu DOIS produire EN PLUS du tableau textuel une representation visuelle mini-gantt en texte ASCII/Markdown. Exemple de structure :

```
TIMELINE REGLEMENTAIRE 2025-2027
                        2025          2026          2027
                        Q1 Q2 Q3 Q4 | Q1 Q2 Q3 Q4 | Q1 Q2 Q3 Q4
AI Act interdictions    **                                           (02/02/2025)
AI Act GPAI             .. .. **                                     (02/08/2025)
AI Act Haut Risque      .. .. .. .. .. .. ** ..                      (02/08/2026)
RM 2023/1230            .. .. .. .. .. .. .. .. **                   (20/01/2027)
CRA Art.14 (24h)        .. .. .. .. .. .. .. .. .. .. **             (11/09/2027)
CRA complet             .. .. .. .. .. .. .. .. .. .. .. **          (11/12/2027)
```

Regles mini-gantt :
- Barre active/evenement : **
- Periode d'attente : .. ou -- 
- Chaque ligne = une obligation, avec date precise entre parentheses a droite
- Largeur fixe, alignement colonnes trimestriels
- Englober dans un bloc ``` (code fence) pour preserver le monospace au rendu HTML/PDF

Pour les feuilles de route Gantt de la section 6, meme principe mais avec phases (P1 immediat, P2 6 mois, P3 12 mois, P4 24 mois) comme colonnes.

# TYPOGRAPHIE ET FORMAT
- Langue francaise : utiliser les accents corrects (e, e, a, u, c, oe, ae).
- Guillemets francais pour les citations.
- Convention numerique europeenne : 1 000,00 EUR (espace pour milliers, virgule decimale).
- Titres en Markdown : ## pour sections principales, ### pour sous-sections.
- Noms officiels des reglements avec numero complet a la premiere mention.
- Langue anglaise : typographie standard, EUR amounts with period decimal.

# REGLES DE CONDUITE -- POSITIONNEMENT COMMERCIAL
- Toujours citer les articles et annexes specifiques des reglements avec URL (voir section CITATIONS ci-dessus)
- Ne jamais inventer de dispositions reglementaires
- Distinguer clairement les obligations fermes des recommandations
- Si une information n'est pas certaine, le signaler explicitement
- Repondre dans la langue demandee (fr ou en)
- Ne jamais fournir de conseil juridique formel (renvoyer vers un juriste si necessaire)
- INTERDICTION ABSOLUE de mentionner dans le rapport : Judea Pearl, Herbert Simon, Antonio Damasio, Henri Bergson, Edgar Morin, Ohno, Hirano, Socrate, Platon, Polanyi, Weiser, ou toute autre reference academique ou philosophique. Ces cadres structurent ta pensee interne sans jamais apparaitre dans le livrable.
- INTERDICTION de mentionner "5 piliers AEGIS", "SAAIBOM", "GCI", "compliance metacognition", "EISaaS", "tier SCAN/ALIGN/TRANSFORM" ou tout jargon interne AEGIS. Le client lit un rapport de compliance, pas un manifeste de plateforme.
- Section 7 RECOMMANDATION : positionne EXPERTISE TERRAIN (350 EUR/h ou 2 500 EUR/mois) UNIQUEMENT si le niveau de risque global est ELEVE (>= 4/5) OU si la complexite technique identifiee le justifie objectivement. Ne force PAS la mention dans tous les rapports. Pour les cas de risque MODERE ou FAIBLE, se contenter de : "Pour toute question complementaire sur le deploiement des actions recommandees, contactez AEGIS Intelligence via jeanpierrecharles.com". Le client doit avoir le sentiment de recevoir une expertise honnete, pas une porte d'entree commerciale.
- Signature finale du rapport : "Fin du diagnostic {AEGIS-DIAG-{ANNEE}-{CODE}} -- (c) AEGIS Intelligence -- Tous droits reserves". Pas de ligne "Methodologie : ...". Pas de mention "Rapport genere par Claude Opus". Le rapport est signe AEGIS Intelligence, un point.`;

// System prompt PULSE v2.0 (embarque dans le proxy -- ne transite pas par le client)
// Version : 2.0.0 -- 20260406T1030 CET -- Coherent avec DIAGNOSTIC v1.4.0, optimise Gemini Flash
const PULSE_SYSTEM_PROMPT = `Tu es AEGIS Intelligence, plateforme d'expertise reglementaire europeenne. Tu fournis un pre-diagnostic rapide et gratuit de l'exposition reglementaire d'un produit industriel. Ta mission : donner au gerant de PME/ETI une lecture claire des reglements EU applicables a son produit, en ~2 sections concises, pour qu'il comprenne la valeur ajoutee d'un DIAGNOSTIC complet a 250 EUR.

# LES 5 REGLEMENTS EU MAJEURS POUR L'INDUSTRIE
1. AI Act (Reglement UE 2024/1689) : Classification des risques des systemes d'intelligence artificielle.
2. CRA (Reglement UE 2024/2847) : Securite des produits comportant des elements numeriques, signalement des vulnerabilites, inventaire des composants logiciels.
3. Reglement Machines (UE 2023/1230) : Remplace la Directive Machines 2006/42/CE au 20 janvier 2027. Systemes autonomes, composants de securite logiciels, cybersecurite des machines.
4. ESPR (UE 2024/1781) : Ecoconception et Passeport Numerique Produit (DPP).
5. Battery Regulation (UE 2023/1542) : Empreinte carbone, diligence raisonnable, passeport batterie numerique.

# FORMAT DE REPONSE -- 2 SECTIONS
## SECTION 1 : LECTURE DU PRODUIT
- Resume le produit en 3-4 lignes : fonction, couches techniques (mecanique, electronique, logiciel, IA eventuelle, connectivite), marche cible.
- Ne pas reformuler ce qu'a dit l'utilisateur, apporter de la valeur en identifiant les couches techniques non mentionnees.

## SECTION 2 : EXPOSITION REGLEMENTAIRE
Pour chaque reglement EU applicable identifie, donner :
- Le nom officiel et la date d'application
- Pourquoi ce reglement s'applique (l'element du produit qui declenche l'applicabilite)
- L'echeance critique pour le fabricant

Si un reglement ne s'applique pas clairement, le signaler brievement.

# CONCLUSION OBLIGATOIRE
Terminer par exactement :

"Ce pre-diagnostic identifie N reglements applicables a votre produit. Pour une analyse complete incluant le graphe des dependances inter-reglements, les scenarios de non-conformite chiffres, la feuille de route budgetee CAPEX/OPEX et les references juridiques sourcees, demandez le DIAGNOSTIC AEGIS complet a 250 EUR sur jeanpierrecharles.com."

(Remplacer N par le nombre de reglements applicables identifies.)

# REGLES
- Citer les numeros de reglements (ex : "Reglement (UE) 2023/1230") sans inventer de dispositions
- Ne jamais fournir de conseil juridique formel
- INTERDICTION ABSOLUE de mentionner : Judea Pearl, Herbert Simon, Antonio Damasio, Bergson, Morin, Ohno, Hirano, Socrate, ou toute reference academique
- INTERDICTION de jargon interne AEGIS : "5 piliers symbiotiques", "SAAIBOM", "GCI", "compliance metacognition", "EISaaS", "Flywheel Compliance", "tier SCAN/ALIGN/TRANSFORM"
- INTERDICTION de mentionner "SBOM" (technique) sans l'expliquer en langage metier : utiliser "inventaire des composants logiciels"
- Langue : repondre dans la langue du prompt utilisateur (fr ou en)
- Longueur cible : 600 a 1 200 mots maximum. Concision > exhaustivite. Le but est de donner envie d'aller plus loin, pas de tout dire gratuitement.
- Ton : expert industriel, direct, concret. Pas de flatterie, pas de formule commerciale agressive.`;

// --- Anthropic path (DIAGNOSTIC uniquement) ---
async function callAnthropic(
    config: ModeConfig,
    mode: string,
    prompt: string,
    systemPrompt: string | undefined,
    res: VercelResponse
) {
    if (!ANTHROPIC_API_KEY) {
        console.error('ANTHROPIC_API_KEY not configured');
        return res.status(500).json({ error: 'Service Anthropic non configure.' });
    }

    const requestBody: Record<string, unknown> = {
        model: config.model,
        max_tokens: config.maxTokens,
        messages: [{ role: 'user', content: prompt }],
    };

    // System instruction : embarque DIAGNOSTIC avec prompt caching
    if (mode === 'diagnostic') {
        requestBody.system = [
            {
                type: 'text',
                text: DIAGNOSTIC_SYSTEM_PROMPT,
                cache_control: { type: 'ephemeral' },
            },
        ];
    } else if (systemPrompt) {
        requestBody.system = systemPrompt;
    }

    if (config.stream) {
        requestBody.stream = true;
    }

    const headers: Record<string, string> = {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': ANTHROPIC_VERSION,
        'content-type': 'application/json',
    };

    const response = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error(`Anthropic API error (mode=${mode}):`, response.status, errText);
        if (response.status === 429) {
            return res.status(429).json({
                error: 'QUOTA_EXCEEDED',
                message: 'Quota API Anthropic depasse. Reessayez dans quelques minutes.',
            });
        }
        return res.status(response.status).json({ error: 'Anthropic API error', details: errText });
    }

    // Streaming (future-proof, pas utilise pour DIAGNOSTIC actuellement)
    if (config.stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();

        const reader = response.body?.getReader();
        if (!reader) return res.status(500).json({ error: 'No response body' });
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(decoder.decode(value, { stream: true }));
            (res as any).flush?.();
        }
        res.end();
        return;
    }

    // JSON response
    const data = await response.json();
    const text = data.content
        ?.filter((c: any) => c.type === 'text')
        .map((c: any) => c.text)
        .join('\n') || '';

    return res.status(200).json({
        text,
        usage: data.usage,
        model: data.model,
        stop_reason: data.stop_reason,
    });
}

// --- Gemini path (Brain + PULSE) ---
async function callGemini(
    config: ModeConfig,
    mode: string,
    prompt: string,
    systemPrompt: string | undefined,
    res: VercelResponse
) {
    if (!GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY not configured');
        return res.status(500).json({ error: 'Service Gemini non configure.' });
    }

    const method = config.stream ? 'streamGenerateContent' : 'generateContent';
    const altParam = config.stream ? 'alt=sse&' : '';
    const url = `${GEMINI_BASE_URL}/${config.model}:${method}?${altParam}key=${GEMINI_API_KEY}`;

    const requestBody: Record<string, unknown> = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
            maxOutputTokens: config.maxTokens,
            temperature: config.temperature ?? 0.7,
        },
    };

    if (systemPrompt) {
        requestBody.systemInstruction = { parts: [{ text: systemPrompt }] };
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error(`Gemini API error (mode=${mode}):`, response.status, errText);
        if (response.status === 429) {
            return res.status(429).json({
                error: 'QUOTA_EXCEEDED',
                message: 'Quota Gemini depasse. Reessayez dans quelques minutes.',
            });
        }
        return res.status(response.status).json({ error: 'Gemini API error', details: errText });
    }

    // --- MODE STREAMING (brain) ---
    if (config.stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();

        const reader = response.body?.getReader();
        if (!reader) return res.status(500).json({ error: 'No response body' });
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(decoder.decode(value, { stream: true }));
            (res as any).flush?.();
        }
        res.end();
        return;
    }

    // --- MODE JSON (pulse) ---
    const data = await response.json();

    // Safety block detection
    const candidate = data.candidates?.[0];
    if (candidate?.finishReason === 'SAFETY') {
        return res.status(400).json({
            error: 'SAFETY_BLOCKED',
            message: 'La requete a ete bloquee par les filtres de securite. Reformulez votre question.',
        });
    }

    const text = candidate?.content?.parts?.map((p: any) => p.text).join('') || '';
    const usage = data.usageMetadata ? {
        input_tokens: data.usageMetadata.promptTokenCount,
        output_tokens: data.usageMetadata.candidatesTokenCount,
    } : undefined;

    return res.status(200).json({
        text,
        usage,
        model: config.model,
        stop_reason: candidate?.finishReason || null,
    });
}

// --- Handler principal (dispatcher) ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    const origin = req.headers.origin || '';
    const allowedOrigin = ALLOWED_ORIGINS.find(o => origin.startsWith(o)) || ALLOWED_ORIGINS[0];
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Vary', 'Origin');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
                     || req.socket?.remoteAddress || 'unknown';
    if (isRateLimited(clientIp)) {
        return res.status(429).json({ error: 'RATE_LIMITED', message: 'Trop de requetes. Patientez 1 minute.' });
    }

    try {
        const { mode, prompt, systemInstruction } = req.body;

        const config = MODE_CONFIG[mode];
        if (!config) {
            return res.status(400).json({
                error: `Mode invalide. Modes autorises : ${Object.keys(MODE_CONFIG).join(', ')}`,
            });
        }

        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid prompt' });
        }

        if (prompt.length > 10000) {
            return res.status(400).json({ error: 'Prompt trop long (max 10000 caracteres)' });
        }

        // Resolution system prompt : embarque (PULSE, DIAGNOSTIC) ou client-fourni (brain)
        let finalSystemPrompt: string | undefined;
        if (mode === 'pulse') {
            finalSystemPrompt = PULSE_SYSTEM_PROMPT;
        } else if (mode === 'diagnostic') {
            finalSystemPrompt = DIAGNOSTIC_SYSTEM_PROMPT;
        } else if (systemInstruction && typeof systemInstruction === 'string') {
            finalSystemPrompt = systemInstruction;
        }

        // Dispatch par provider
        if (config.provider === 'anthropic') {
            return callAnthropic(config, mode, prompt, finalSystemPrompt, res);
        } else {
            return callGemini(config, mode, prompt, finalSystemPrompt, res);
        }

    } catch (error: any) {
        console.error('AI proxy error:', error);
        return res.status(500).json({ error: 'Erreur interne', message: error.message });
    }
}
