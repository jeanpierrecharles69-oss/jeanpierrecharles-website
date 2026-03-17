# AEGIS LIFECYCLE MASTER DOCUMENT
# Document unique de reference -- Toute duree de developpement
# jeanpierrecharles.com + AEGIS Intelligence

**Version**: 2.4.0
**Cree le**: 2026-02-18 20h00 CET
**Auteur**: Claude Opus 4.6 (claude.ai)
**Destinataire**: Tous modeles Claude (Opus, Sonnet, Haiku) + AG (Gemini)
**Classification**: DOCUMENT VIVANT -- MIS A JOUR A CHAQUE SESSION
**Derniere MAJ**: 2026-03-10 17h00 CET (v2.4.0 -- INTEGRATION bridges 08-10/03. D98-D119 (Desktop v1.1.5749, computer use, memoire 3 niveaux, corrections v3.1, deploy production). L96-L106 (memoire Projets, DST, createPortal, prompt Gemini). R39-R43 (regression Desktop, computer use, memoire, markdown, code mort). v3.1 EN PRODUCTION commit 4837709. Sprint v3.1 CLOS.)

---

> **INSTRUCTION AUX MODELES CLAUDE**
> Ce document est le contexte de reference pour TOUTE conversation
> impliquant le projet jeanpierrecharles.com ou AEGIS Intelligence.
> Lisez-le AVANT de repondre. Si une information contredit vos
> connaissances anterieures, CE DOCUMENT FAIT FOI.
>
> **REGLE IDs (D80 -- OBLIGATOIRE)** :
> Les bridges ne contiennent JAMAIS d'IDs definitifs.
> Format obligatoire dans les bridges : D_THHMM_01, L_THHMM_01, R_THHMM_01
> Seul CE DOCUMENT attribue les IDs definitifs sequentiels.
> **Derniers IDs : D119, L106, R43**

---

## TABLE DES MATIERES

1. IDENTITE PROJET & FONDATEUR
2. ARCHITECTURE TECHNIQUE
3. ETAT COURANT DU SPRINT
4. HISTORIQUE DES VERSIONS
5. REGISTRE DES DECISIONS CLES
6. REGLES DE GOUVERNANCE
7. WORKFLOW OPERATIONNEL
8. PIPELINE SYNC (AEGIS SYNC HUB)
9. SECURITE & CONFORMITE
10. LECONS APPRISES (REGISTRE VIVANT)
11. RISQUES ACTIFS
12. SCOPE PAR VERSION
13. V-GATE CRITERES
14. SUIVI ECONOMIQUE
15. PROTOCOLE NOMMAGE & SEQUENCAGE
16. REFERENCES & LIENS
17. JOURNAL DES MISES A JOUR

---

## 1. IDENTITE PROJET & FONDATEUR

### 1.1 Jean-Pierre Charles -- Fondateur
- 57 ans, ingenieur mecatronique senior, 32 ans d'experience R&D industrielle
- Parcours : Autoliv, Faurecia, Saft/TotalEnergies, Forsee Power
- Methodologie : Analyse integree systemique (causalite Pearl, rationalite limitee Simon, neurosciences Damasio)

### 1.2 Projet AEGIS Intelligence
- Plateforme B2B SaaS d'intelligence reglementaire EU pour PME/ETI industrielles
- Modele : Expert Intelligence as a Service (EISaaS)
- Cible : 200,000+ entreprises europeennes (UE + DOM-TOM, regions ultraperipheriques)
- Fenetre strategique : EU AI Act deadline aout 2026

### 1.3 Triangle de Gouvernance (Scenario D Opus-First)
| Role | Modele | Capacites |
|---|---|---|
| Brain + Arms | Claude Opus 4.6 | Filesystem + Chrome Extension ARM64 |
| Conversation | Claude Sonnet 4.6 | Analyse, synthese, bridges strategiques |
| Execution | AG (Gemini) | Editing statique uniquement |
| Decideur | Jean-Pierre Charles | Decisions finales + git push |
Hierarchie : Securite > Qualite > Vitesse

### 1.4 Concept Lucidite Industrielle (05/03/2026)
AEGIS = machine a lucidite industrielle. 3 niveaux discours : societal (Laulusa/ESCP) + empirique (MIT/BCG) + systemique (Epic Fury). Principes : "Garde-Corps pas Garde-Fou" (D67), "Compliance = Protection" (D68), "20 secondes ou 20 jours" (D69).

---

## 2. ARCHITECTURE TECHNIQUE

### 2.1 Stack
React 19 + Vite 6.4.1 + TypeScript 5.8 + Tailwind v4 PostCSS + Gemini 2.0 Flash SSE + Vercel + Gandi.net

### 2.2 Materiel JP
Surface Pro 11 ARM64 Win11 25H2 16GB. Claude Desktop v1.1.5749 (ecf3d9) Squirrel MODE RESTREINT (D10r2). MCP Filesystem ACTIVE. DXT/Cowork/ComputerUse INTERDIT. Cowork ARM64 NON SUPPORTE.

### 2.3 Securite Gemini (VALIDEE 27/02)
Cle server-side Vercel. Proxy serverless CORS restreint. Rate limit 10+30 req/min. Budget alert 50 EUR. GCP isole. Zero secret dist/. TOTP actif.

---

## 3. ETAT COURANT

### 3.1 Production (MAJ 10/03/2026)
v3.1 EN PRODUCTION (commit 4837709). Deploy 10/03/2026 via git push origin main -> Vercel auto-deploy. Build Vite 6.4.1, 58 modules, 0 erreurs TS, 5.61s. V&V post-deploy JP confirmee : landing, TrustBadges, Brain IA streaming FR+EN, export PDF, ContactModal, navigation scroll smooth.

### 3.2 Blockers v3.1 (CLOS 10/03)
| ID | Blocker | Statut |
|---|---|---|
| BLK-BUILD | npm run build | PASS |
| BLK-STREAM | SSE Gemini | PASS |
| MOD-1 a MOD-3 | Stats, CTA, reglements | FAIT AG 06/03 |
| ANO-1 a ANO-4 | Corrections i18n | FAIT AG 08/03 |
| ANO-NEW-01 | System prompt enrichi | FAIT Opus 08/03 |
| COR-A1 a B2 | Corrections T1545/T1615/T1700 | FAIT Opus 09/03 |
| D109-D118 | Corrections V&V JP T1330 | FAIT Opus 10/03 |
| D119 | git push origin main | FAIT 10/03 commit 4837709 |

### 3.3 Sprint actif
v3.1 CLOS. Prochain sprint : v3.2 (stabilisation + auth + GSEO).

---

## 4. HISTORIQUE DES VERSIONS
v1.0 Jan 2026, v2.0 Jan 2026, v2.6.0 06/02 PRODUCTION (c2c532b), v3.0 13-16/02, v3.1-alpha 16/02-06/03, v3.1 sprint 06-10/03 GO DEPLOY, **v3.1 PRODUCTION 10/03 (4837709)**. v3.2 mars-avril, v3.3 Q2, v4.0 Q3+.

---

## 5. REGISTRE DES DECISIONS CLES

*(D1-D25 : voir LIFECYCLE v1.4.0)*

| ID | Date | Decision | Statut |
|---|---|---|---|
| D26 | 23/02 | Scope reduit v3.1-homepage | FAIT |
| D27 | 23/02 | Prompt Caching P0 | ACTIF |
| D28 | 23/02 | REPrompt framework | ACTIF |
| D29 | 24/02 | AEGIS Intelligence = nom officiel | ACTIF |
| D30 | 24/02 | Trinite JP-AEGIS-AEGIS Intelligence | ACTIF |
| D31 | 24/02 | 5 piliers IAIA scope v3.2 | REPORTE v3.2 |
| D32 | 24/02 | GSEO Q2 2026 | PLANIFIE |
| D33 | 24/02 | Tarification arbitrage JP | REMPLACE D110 |
| D34 | 27/02 | V-Gate securite prerequis deploy | VALIDE |
| D35 | 27/02 | GCP projet isolation | VALIDE |
| D36 | 27/02 | Installation Squirrel acceptee | VALIDE |
| D37 | 27/02 | MCP local AUTORISE, externe INTERDIT | ACTIF |
| D10r2 | 27/02 | Claude Desktop MODE RESTREINT | ACTIF |
| D38 | 27/02 | Quota GCP 30 req/min | ACTIF |
| D39 | 27/02 | Budget alert 50 EUR | ACTIF |
| D40 | 27/02 | Deploy v3.1 AUTORISE | FAIT |
| D41 | 05/03 | heroH1b BUG a corriger | FAIT |
| D42 | 05/03 | Timeline v3 deploy 06-07/03 | FAIT (10/03) |
| D43 | 05/03 | Claude Max x5 renouvele | ACTIF |
| D44 | 05/03 | Section suivi economique | ACTIF |
| D45 | 05/03 | Convention bridge Sonnet auto | ACTIF |
| D46 | 05/03 | Lucidite industrielle lexique | ACTIF |
| D47 | 05/03 | GSEO profondeur > volume | ACTIF |
| D48 | 05/03 | Protocole nommage YYYYMMDDTHHMM | ACTIF |
| D49 | 05/03 | IDs prefixes session -- REMPLACE D80 | ARCHIVE |
| D50 | 05/03 | Nommage User Preferences | FAIT JP |
| D51 | 05/03 | Auto-identification capacites | ACTIF |
| D52 | 05/03 | MOD-1 Redondance stats GO | FAIT AG 06/03 |
| D53 | 05/03 | MOD-2 CTA Pricing scroll | FAIT AG 06/03 |
| D54 | 05/03 | MOD-3 Ajout 4 reglements | FAIT AG 06/03 |
| D55 | 05/03 | Grille 0/50/500 maintenue v3.1 | REMPLACE D110 |
| D56 | 05/03 | IAA 10e verticale AEGIS | VALIDE JP |
| D57 | 05/03 | Article IAA GSEO 72h | A EXECUTER |
| D58 | 05/03 | Landing /eu-iaa-compliance v3.2 | PLANIFIE |
| D59 | 05/03 | Module Made in EU v3.2 | PLANIFIE |
| D60 | 05/03 | Discover = diagnostic maturite v3.2 | PLANIFIE |
| D61 | 05/03 | Standard = matrice croisee v3.2 | PLANIFIE |
| D62 | 05/03 | GSEO anti-substitution | PLANIFIE |
| D63 | 05/03 | Architecture v4.0 Option C | A VALIDER JP |
| D64 | 05/03 | Veille plugins MCP trimestrielle | ACTIF |
| D65 | 05/03 | GCI Pearl-Simon-Damasio v3.3 | PLANIFIE |
| D66 | 05/03 | MIT data argument commercial | ACTIF |
| D67 | 05/03 | Garde-Corps pas Garde-Fou | ACTIF |
| D68 | 05/03 | Compliance = Protection | ACTIF |
| D69 | 05/03 | 20 secondes ou 20 jours | ACTIF |
| D70 | 05/03 | Auditabilite EU AI Act Art.14 | ACTIF |
| D71 | 06/03 | Desktop v1.1.5368 MODE RESTREINT | REMPLACE D98 |
| D72 | 06/03 | Test ARM64 avant git push | FAIT JP 10/03 |
| D73 | 06/03 | XTC-Orano cas ecole AEGIS | DOCUMENTE |
| D74 | 06/03 | Export CN surveillance CIRSN-V | A VALIDER JP |
| D75 | 06/03 | Brief Battery Reg passeport 2025 | A PLANIFIER |
| D76 | 06/03 | AI Act + Battery Reg angle | A VALIDER JP |
| D77 | 06/03 | Syensqo archetype client | A VALIDER JP |
| D78 | 06/03 | Questionnaire diagnostic 20-25 Q | A PLANIFIER |
| D79 | 06/03 | Roadmap 3 phases | A VALIDER JP |
| D80 | 06/03 | IDs TOUJOURS temporaires bridges | VALIDE JP |
| D81 | 06/03 | Perplexity WF3T collecte/triage/analyse | VALIDE JP |
| D82 | 06/03 | Script aegis-id-counter.ps1 | REPORTE |
| D83 | 06/03 | Prompt 3 lignes obligatoire | VALIDE JP |
| D84 | 06/03 | Integration Opus 1x/jour max | VALIDE JP |
| D85 | 06/03 | REGISTRE rattrapage Option A | VALIDE JP |
| D86 | 07/03 | Matrice test 5Rx4IV 20 scenarios seuil >= 75% | VALIDE JP |
| D87 | 07/03 | Architecture connecteurs Desktop/Web/CLI documentee | A GRAVER |
| D88 | 08/03 | Deleguer corrections ANO + test a AG corrections AVANT tests | VALIDE JP |
| D89 | 08/03 | Grille 8 criteres (ajout CTA scroll + toggle pricing) | VALIDE JP |
| D90 | 08/03 | Toutes phases obligatoires P0-P4 | VALIDE JP |
| D91 | 08/03 | FIX ANO-3 Option B ou/or ternaire | FAIT |
| D92 | 08/03 | Rapport AG #2 VALIDE 8/10 | FAIT |
| D93 | 08/03 | BUG-03 Machinery Reg = FAUX POSITIF AG | FAIT |
| D94 | 08/03 | Fix system prompt REACH CSRD UNECE EN45545 | FAIT |
| D95 | 08/03 | GO DEPLOY v3.1 (95.4% Desktop, 93.8% Mobile) | FAIT |
| D96 | 08/03 | BUG-01 markdown + BUG-02 Brain EN backlog v3.2 | ACTIF |
| D97 | 08/03 | Hero messaging supply chain backlog v3.2 | ACTIF |
| **D98** | **09/03** | **Desktop v1.1.5749 (ecf3d9) D10r2 MAINTENU** | **FAIT** |
| **D99** | **09/03** | **Computer use Claude Desktop HORS PERIMETRE AEGIS** | **VALIDE JP** |
| **D100** | **09/03** | **Bridge unique tracabilite MAJ Desktop** | **FAIT** |
| **D101** | **09/03** | **Routine synthese memoire quotidienne hors-Projet** | **A VALIDER JP** |
| **D102** | **09/03** | **Strategie memoire 3 niveaux KB > Pref > Memoire** | **VALIDE** |
| **D103** | **09/03** | **Consulter TOUS fichiers KB recents avant bridge (obligatoire)** | **VALIDE** |
| **D104** | **09/03** | **v1.1.5749 = correctif DST, impact AEGIS nul** | **FAIT** |
| **D105** | **10/03** | **Code v3.1 valide GO DEPLOY post V&V Chrome dynamique** | **FAIT** |
| **D106** | **10/03** | **MAJ docs essentiels APRES deploy pas avant** | **APPLIQUE** |
| **D107** | **10/03** | **Nettoyer i18n.ts cles footer inutilisees v3.2** | **DEFERE v3.2** |
| **D108** | **10/03** | **Session deploy horodatee 20260310 dans nouvelle conversation** | **FAIT** |
| **D109** | **10/03** | **Supprimer tous boutons/refs Essai gratuit** | **FAIT** |
| **D110** | **10/03** | **Tier PILOTAGE 50eur/mois -> DIAGNOSTIC 250eur/rapport** | **FAIT** |
| **D111** | **10/03** | **Reduire 32 ans a 1 occurrence TrustBadges seul** | **FAIT** |
| **D112** | **10/03** | **Photo JP horizontal a cote bouton LinkedIn** | **FAIT** |
| **D113** | **10/03** | **TrustBadges 25+ noms programmes reels** | **FAIT** |
| **D114** | **10/03** | **Supprimer bandeau PREMIUM DocumentReportView** | **FAIT** |
| **D115** | **10/03** | **Diagnostic Technique de Conformite (renommage)** | **FAIT** |
| **D116** | **10/03** | **Fix navigation 4 boutons mapping + scroll smooth** | **FAIT** |
| **D117** | **10/03** | **Fix modal clippe createPortal(document.body)** | **FAIT** |
| **D118** | **10/03** | **Accelerer generation Gemini prompt raccourci 60%** | **FAIT** |
| **D119** | **10/03** | **Deploy v3.1 production commit 4837709** | **FAIT** |

---

## 6. REGLES DE GOUVERNANCE

### 6.1 Workflow standard
1. JP ouvre session 3 lignes : timestamp + convention + derniers IDs (D83)
2. Claude lit LIFECYCLE MASTER + TOUS fichiers KB recents (D103)
3. Securite > Qualite > Vitesse
4. IDs TEMPORAIRES D_THHMM_xx dans bridges (D80)
5. Opus integre max 1x/jour : IDs definitifs (D84)
6. JP git push sur decision explicite

### 6.2 Regles absolues
- NE JAMAIS supprimer dans G:\Mon Drive
- NE JAMAIS baser decision sur affirmation AG non verifiee (L27)
- NE JAMAIS lire .env/.credentials via MCP Filesystem (L40)
- NE JAMAIS afficher secrets en clair (D_SEC_01)
- NOMMAGE YYYYMMDDTHHMM_TYPE obligatoire (D48)
- IDs bridges = TOUJOURS temporaires D_THHMM_xx (D80)
- Perplexity = collecte brute, pas production (D81)
- Scripts .ps1 100% ASCII (L15)
- Consulter TOUS fichiers KB recents avant bridge (D103)
- MAJ docs essentiels APRES deploy pas avant (D106)

---

## 7. WORKFLOW OPERATIONNEL

```
JP (3 lignes ouverture D83)
  -> Perplexity (collecte si besoin)
    -> JP (triage 3-5 signaux D81)
      -> Sonnet (analyse + bridge IDs temporaires)
        -> Opus (integration 1x/jour : IDs definitifs + LIFECYCLE + REGISTRE)
          -> AG (editing statique si brief)
            -> JP (git push decision finale)
```

---

## 8. PIPELINE SYNC
aegis-sync-hub.ps1 v1.0.3. PS 7.5.4 ARM64. 15min. 6 sources 3 groupes 149+ fichiers. GCP Antigravity-Sync-Pipeline OAuth. Bug MIME .md connu.

---

## 9. SECURITE & CONFORMITE

### 9.1 API Gemini (AUDITEE 27/02)
Server-side Vercel. Proxy CORS. Rate limit. Budget alert. Zero secret dist/. TOTP actif.

### 9.2 GCP (AUDITEE 27/02)
jeanpierrecharles (Gemini, isole, maitrise). Antigravity-Sync-Pipeline (OAuth, faible). My First Project (inutilise, nul).

### 9.3 Claude Desktop (MAJ 10/03)
v1.1.5749 (ecf3d9) Squirrel MODE RESTREINT D10r2. MCP Filesystem 3 dirs. Zero DXT/Cowork/ComputerUse. Computer use = HORS PERIMETRE (D99). Cowork ARM64 NON SUPPORTE.

---

## 10. LECONS APPRISES (REGISTRE VIVANT)

### Critiques (rouge)
| ID | Lecon | Action |
|---|---|---|
| L1 | AG ne preserve pas corrections lors refactors | V&V post-AG |
| L2 | SESSION_REPORT AG optimiste | Claude validateur |
| L3 | Migration par substitution tue le produit | Migration ADDITIVE |
| L4 | Conversation supprimee = intelligence perdue | Bridge + LIFECYCLE |
| L40 | NE JAMAIS lire .env via MCP | Discipline |
| L49 | Glissement timeline = dette invisible | Sprint court |
| L55 | Sessions paralleles = collisions | D80 IDs temporaires |
| L58 | Opus ne doit JAMAIS usurper identite | D51 capacites |
| L59 | Contamination prompt = corruption tracabilite | Verifier identite |
| L61 | Cowork redefinit plancher marche = commodity | Remonter chaine valeur |
| L64 | Risque #1 = non-acquisition fausse confiance | GSEO + DISCOVER |
| L69 | Boite noire militaire = miroir risque industriel | Messaging |
| L85 | Collisions IDs massives si definitifs sans coordination | D80 obligatoire |
| L86 | Architecture connecteurs documenter pas redecouvrir | D87 |
| L87 | Claude OBSERVER (Pearl E1) avant PRESUMER | Prompt D83 |
| L90 | AG substitue raisonnement a execution si charge elevee | Brief gardes-fous |
| L91 | Scores auto-evalues par executant = biais confirmation | Separateur evaluateur |
| L94 | Cartes regs et system prompt Brain synchronises | D94 audit |
| **L98** | **Memoire globale Claude ne capture PAS conversations Projets** | **D102 3 niveaux** |
| **L101** | **Opus consulter TOUS fichiers KB recents avant bridge** | **D103** |
| **L103** | **CSS transform:translateZ(0) casse position:fixed -> createPortal** | **Pattern doc** |

### Importants (ambre)
| ID | Lecon | Action |
|---|---|---|
| L5 | Securite repose sur accidents | Security-by-design |
| L6 | React SPA = SEO invisible | SSR/SSG v3.2 |
| L41-L44 | GCP securite | Standards actifs |
| L50 | Sessions strategiques divertissent du deploy | Prioriser execution |
| L51 | Vercept valide EISaaS | Veille computer use |
| L53 | Profondeur > accumulation | Lexique + messaging |
| L54 | Tribune = actif editorial rare | Article LinkedIn P0 |
| L56-L57 | 22% conformite nommage | D48 |
| L60 | KB = autorite contenu, Prefs = persistance | Double canal |
| L62 | Valeur AEGIS = croisement reglementaire | Messaging v3.2 |
| L63 | 32 ans R&D = moat non-reproductible | USP central |
| L65 | Perplexity ratio signal/bruit ~15% | Workflow D81 |
| L66 | Validation externe Pearl-Simon-Damasio | Argument commercial |
| L67 | Ethique IA = avantage concurrentiel | Positionnement |
| L68 | Homme dans la boucle applicable AEGIS | Architecture v3.2 |
| L70-L71 | Urgence AI Act + 3 niveaux discours | Messaging + LinkedIn |
| L72-L73 | Anthropic changelog absent + Cowork concurrent | Veille D64 |
| L75 | Cowork ARM64 non supporte = protection involontaire | R32 |
| L76 | Perplexity facts/speculatif cross-validation | P_CR_01 |
| L77 | Chute SaaS 285Mrd Cowork = signal disruptif | Veille |
| L78-L84 | Batteries (CN, rebut, Vallee, passeport, Syensqo, roadmap) | CIRSN-V |
| L88 | Doc Anthropic obsolete possible -- observation empirique | Veille |
| L89 | Session polluee diagnostic = bridge + nouvelle session | Ne pas forcer |
| L93 | AG s'ameliore avec rappel explicite phases manquantes | Management AG |
| L95 | AG faux positifs visuels -- contre-expertise MCP indispensable | V&V Opus |
| **L96** | **Computer use Desktop = extension surface attaque confirmant D10r2** | **HORS PERIMETRE** |
| **L97** | **Flag gov deployment confirme positionnement souverain Anthropic** | **Argument commercial** |
| **L99** | **Cycle synthese memoire ~24h -- MAJ manuelles immediates** | **Solution A** |
| **L100** | **Cadence builds Anthropic en acceleration +381 en 3j** | **Veille hebdo** |
| **L102** | **Release build = possible correctif urgence non annonce (DST)** | **Croiser sources** |
| **L105** | **Anthropic Code Review = Teams/Enterprise only** | **Non applicable** |
| **L106** | **System prompt Gemini premier levier latence (-60% tokens -3-5s)** | **Pattern perf** |

### Operationnels (vert)
L9 multi-IA, L10 sync 15min, L15 ASCII, L21 timestamps, L27 AG non verifie, L36 Trinite, L48 V-Gate, L52 MCP seul moyen, L74 cadence Anthropic, L92 doc limitations Playwright AG, L104 git push main != git push origin main.

---

## 11. RISQUES ACTIFS

| ID | Risque | Proba | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Supabase Auth complexe | MOY | Critique | REPORTE v3.2 |
| R3 | AG regressions | ELEVEE | Majeur | V&V Claude |
| R5 | SEO invisible SPA | ELEVEE | Majeur | SSR/SSG v3.2 |
| R9 | Quotas tokens | MOY | Majeur | Conversations courtes |
| R10 | Markdown brut UX | ELEVEE | Majeur | Parser v3.2 |
| R13 | Ecart docs vs code | MOY | Majeur | Audits MCP |
| R15 | Tarification incoherente | RESOLU | -- | D110 DIAGNOSTIC |
| R17 | GSEO absent | MOY | Majeur | Q2 2026 |
| R22 | Cle revoquee git history | NULLE | Faible | Nettoyage P1 |
| R23 | Glissement timeline v3.1 | RESOLU | -- | Deploy 10/03 |
| R24 | Perte momentum AI Act | ATTENUE | -- | v3.1 live |
| R25 | Disruption agents IA | FAIBLE | Majeur T+12 | Differentiation |
| R26 | Collisions IDs paralleles | RESIDUEL | Majeur | D80 |
| R27 | Fausse confiance Cowork PME | ELEVEE | CRITIQUE | GSEO + DISCOVER |
| R28 | Standard pression prix Cowork | ELEVEE | ELEVE | Matrice croisee D61 |
| R29 | Plugin MCP compliance tiers | FAIBLE | CRITIQUE | Veille D64 |
| R30 | Consultants low-cost Cowork | MOY | ELEVE | Expert Network |
| R31 | Regression MCP v1.1.5749 | TRES FAIBLE | ELEVE | Test JP fait |
| R32 | Cowork activation Surface Pro | IMPROBABLE | ELEVE | ARM64 |
| R33 | Veto Pekin techno XTC-Orano | MOY | CRITIQUE | CIRSN-V D74 |
| R34 | Battery Booster retard >2027 | HAUTE | ELEVE | AEGIS compliance |
| R35 | Confusion expertise/dependance CN | MOY | MOYEN | Pedagogie |
| R36 | Brain EN repond en FR (Gemini) | FAIBLE | Moyen | Reset v3.2 |
| R37 | BUG-01 markdown raw perception | ELEVEE | Moyen | react-markdown P0 |
| R38 | Desync cartes regs vs system prompt | FAIBLE | Moyen | Audit |
| **R39** | **Regression MCP Desktop v1.1.5749 DST** | **TRES FAIBLE** | **Eleve** | **Test fait** |
| **R40** | **Computer use active accidentellement** | **FAIBLE** | **Eleve** | **D10r2+D99** |
| **R41** | **Memoire obsolete sans synthese hors-Projet** | **MOYEN** | **Moyen** | **D101** |
| **R42** | **BUG-01 markdown raw en production** | **ELEVEE** | **Moyen** | **P0 v3.2** |
| **R43** | **Prop onScrollToPricing orpheline** | **FAIBLE** | **Faible** | **Nettoyage v3.2** |

---

## 12. SCOPE PAR VERSION

### v3.1-homepage (sprint 06-10/03 -- CLOS -- EN PRODUCTION)
FAIT : 10 sections, TW v4, i18n FR/EN, Brain IA Gemini SSE, ROI, RGPD, PDF, V-Gate, sitemap, build+streaming PASS. 6 MODs AG. 4 ANO. System prompt 14 regs. Matrice test 95.4% Desktop 93.8% Mobile. Corrections V&V JP : refs gratuit, DIAGNOSTIC 250eur, 32 ans 1x, photo horizontal, TrustBadges reels, nav scroll, createPortal modal, prompt Gemini raccourci. Deploy 10/03 commit 4837709.
DEFERE v3.2 : BUG-01 markdown, BUG-02 Brain EN, Hero messaging, reglements PME, polices+contraste, code mort.

### v3.2 (mars-avril 2026)
BUG-01 react-markdown P0, BUG-02 reset messages, Hero messaging, SSR/SSG SEO, Supabase Auth, Stripe DIAGNOSTIC+EXPERTISE, Contact formulaire, i18n nettoyage, reglements PME (retirer DORA?), polices+contraste, code-splitting html2pdf, IAIA, lucidite messaging, IAA module (D58-D59), DISCOVER diagnostic (D60).

### v3.3 (Q2 2026)
3D STEP viewer, GSEO (D47+D62), GCI Pearl-Simon-Damasio (D65), charte ethique, matrice croisee STANDARD (D61).

### v4.0 (Q3+ 2026)
Option C plateforme+API (D63), multi-tenant, localisation EU, EBW/eIDAS 2.0, DPP, SIAIA, PHENIX, Expert Network.

---

## 13. V-GATE CRITERES

### V-Gate v3.1 (10/03) : DEPLOYED
| # | Critere | Resultat |
|---|---|---|
| V1 | Build 0 erreurs | PASS (5.61s, 58 modules) |
| V2 | Secrets 0 leak dist/ | PASS |
| V3 | Streaming Brain IA | PASS (FR+EN) |
| V4 | Mobile responsive | PASS (93.8%) |
| V5 | i18n FR/EN | PASS |
| V6 | RGPD CookieBanner | PASS |
| V7 | Trust badges reels | PASS (D113) |
| V8 | Contact | PASS (D116 ContactModal) |
| V9 | ROI metrics | PASS |
| V10 | Pricing DIAGNOSTIC+EXPERTISE | PASS (D110) |
| V11 | CTA scroll smooth | PASS (D116) |
| V12 | Toggle annual/monthly | PASS |
| V13 | 10 cartes reglements | PASS |
| V14 | System prompt reglements | PASS |
| V15 | Navigation 4 boutons | PASS (D116) |
| V16 | Modal rapport createPortal | PASS (D117) |

---

## 14. SUIVI ECONOMIQUE
Couts ~125-140 EUR/mo (Vercel 0, Gandi 1.25, Google One 22, Claude Max 100, GCP 0-5, GitHub 0). Tarification v3.1 : DIAGNOSTIC 250 EUR/rapport + EXPERTISE TERRAIN (tarif custom). Breakeven 3-4 DIAGNOSTIC OU 1 EXPERTISE. Objectif MRR T+6 2,000-5,000 EUR. Premier revenu mai 2026.

---

## 15. PROTOCOLE NOMMAGE & SEQUENCAGE

### 15.1 Nommage (D48)
YYYYMMDDTHHMM_TYPE_DESCRIPTION.md. Types : BRIDGE, LIFECYCLE, DELTA, AUDIT, BRIEF, RAPPORT, SPEC, PRINCIPE. Timestamp MENE.

### 15.2 IDs (D80)
Bridges = TOUJOURS IDs temporaires D_THHMM_01. Seul LIFECYCLE = IDs definitifs. Opus max 1x/jour (D84).

### 15.3 Perplexity (D81 -- WF3T)
Collecte -> triage JP 3-5 signaux -> analyse Claude IDs temporaires. Ratio ~15% brut, ~60-70% filtre.

### 15.4 Prompt ouverture (D83)
JP : timestamp + convention D48 + derniers IDs. 3 lignes.

### 15.5 Memoire (D102)
Niveau 1 KB Projet (verite). Niveau 2 User Preferences (permanent). Niveau 3 Memoire globale (dynamique). NE JAMAIS compter sur memoire comme source de verite.

---

## 16. REFERENCES & LIENS

Audit securite 20260227T0800. Bridge V-Gate 20260227T0800. Bridge pre-deploy 20260305T1000. Bridge lucidite 20260305T1030. Bridge IAA 20260305T1500. Bridge Cowork 20260305T1530. Audit MOD 20260305T1600. Bridge synthese 20260305T1930. Bridge Desktop 20260306T0815. Bridge batteries 20260306T1030. Audit alignement 20260306T1100. Rapport gouvernance 20260306T1100. Delta LIFECYCLE 20260306T1100. Rattrapage REGISTRE 20260306T1100. Brief AG v3.1 20260306T1730. V&V Opus 20260306T2115. AG implementation 20260306T2100. Test matrice 20260307T0920. Diagnostic connecteurs 20260307T2025. Brief AG test 20260308T0830. Rapports AG 20260308. Delta LIFECYCLE 20260308T2000. Consolidation 20260308T2000. Bridge Desktop 20260309T0945. Corrections brief 20260309T1545. GANTT 20260309T1330. Audit predeploy 20260310T1000. Resume IA agentique 20260310T1020. Bridge deploy 20260310T1630. REGISTRE Google Drive.

---

## 17. JOURNAL DES MISES A JOUR

| Date-Heure | Auteur | Modifications |
|---|---|---|
| 2026-02-18 20h00 | Opus 4.6 | Creation v1.0.0 |
| 2026-02-20 18h00 | Opus 4.6 | v1.1.0 -- L20 OAuth |
| 2026-02-21 06h30 | Sonnet | v1.2.0 -- D15 timestamps |
| 2026-02-21 08h30 | Opus 4.6 | v1.3.0 -- Audit qualite |
| 2026-02-22 12h00 | Opus 4.6 | v1.4.0 -- Benchmark AG, Scenario D |
| 2026-02-23 16h30 | Opus 4.6 | v1.5.0 -- Audit croise |
| 2026-02-24 13h00 | Opus 4.6 | v1.6.0 -- Notes JP. D29-D33. |
| 2026-02-27 07h45 | Sonnet 4.6 | v1.7.0 -- VS 2026. L38-L39. |
| 2026-02-27 11h00 | Opus 4.6 | v1.8.0 -- AUDIT SECURITE. D34-D40. L40-L48. R19-R22. |
| 2026-03-05 11h00 | Opus 4.6 | v2.1.0 -- Integration T1000+T1030. D41-D51. L49-L60. R23-R26. |
| 2026-03-06 11h00 | Opus 4.6 | v2.2.0 -- Integration 7 bridges. D52-D85. L61-L85. R27-R35. D80. |
| **2026-03-10 17h00** | **Opus 4.6** | **v2.4.0 -- Integration 4 bridges (T2000+T0945+T1000+T1630). D86-D119. L86-L106. R36-R43. v3.1 EN PRODUCTION 4837709. Sprint CLOS.** |

---

> **INSTRUCTION DE MISE A JOUR**
> 1. MAJ section 3 (ETAT COURANT)
> 2. Decisions section 5 (dernier ID D119)
> 3. Lecons section 10 (dernier ID L106)
> 4. Risques section 11 (dernier ID R43)
> 5. Suivi eco section 14 si pertinent
> 6. Journal section 17
> 7. Incrementer version
> 8. MAJ "Derniere MAJ" en header
> 9. Nommer YYYYMMDDTHHMM_LIFECYCLE_MASTER.md
> 10. 100% ASCII
> 11. IDs bridges = TOUJOURS temporaires D_THHMM_xx (D80)
> 12. Integration Opus max 1x/jour (D84)
> 13. Consulter TOUS fichiers KB recents avant bridge (D103)

---

*AEGIS Intelligence -- Lifecycle Master Document v2.4.0*
*Reference : 20260310T1700_LIFECYCLE_MASTER*
*Mis a jour par Claude Opus 4.6 -- 2026-03-10 17h00 CET -- ASCII-safe*
*Derniers IDs : D119, L106, R43*
