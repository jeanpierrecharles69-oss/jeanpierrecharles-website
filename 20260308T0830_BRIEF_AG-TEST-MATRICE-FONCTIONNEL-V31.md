# BRIEF AG -- CORRECTIONS + TEST MATRICE FONCTIONNEL v3.1
# Reference : 20260308T0830_BRIEF_AG-TEST-MATRICE-FONCTIONNEL-V31

**Date** : 08/03/2026 08h30 CET (MAJ apres V&V JP)
**Auteur** : Claude Opus 4.6 (convergence avec JP)
**Commanditaire** : Jean-Pierre Charles
**Destinataire** : AG (Gemini 2.0 Flash)
**Statut** : DEFINITIF -- TOUTES DECISIONS JP VALIDEES
**Contre-expertise post-AG** : Opus via MCP Filesystem + Chrome Extension

---

## 0. REGLES ABSOLUES AG

### Phase 0 (Corrections ANO)
1. NE TOUCHER QU'AUX FICHIERS LISTES dans la section 2 (i18n.ts + PricingSection.tsx)
2. NE PAS creer de nouveaux fichiers
3. NE PAS modifier la structure des dossiers
4. NE PAS toucher a : vite.config.ts, gemini-proxy.ts, .env*, constants.ts, LangContext.tsx, NavBar.tsx, App.tsx, src/components/brain/*, src/services/*, src/data/*
5. Tester mentalement que chaque modification compile
6. Executer `npm run build` apres les corrections -- 0 erreurs obligatoire

### Phase 1-4 (Tests)
7. NE MODIFIER AUCUN FICHIER du projet -- les phases de test sont 100% READ-ONLY
8. NE PAS faire de git add, git commit, git push (meme apres Phase 0)
9. Si npm run dev echoue : STOP, documenter l'erreur, ne pas tenter de fix
10. Si AEGIS Intelligence (Brain) ne repond pas apres 15 secondes : scorer 0 et passer au suivant
11. Chaque scenario doit etre documente avec screenshot ou description textuelle precise
12. Produire un RAPPORT_TEST structure en fin d'execution (format section 12)
13. 100% ASCII dans le rapport (pas d'accents dans le fichier de sortie)

---

## 1. OBJECTIF DE LA MISSION

Mission en 2 volets :

**VOLET A** : Corriger 4 anomalies identifiees par Opus (bridge T2115 du 06/03)
**VOLET B** : Simuler l'experience utilisateur v3.1 via matrice de test multi-roles x multi-verticales

**But** : Evaluer la pertinence du site pour sa cible commerciale AVANT git push production.

**Seuil GO deploy** : Score global >= 75%

---

## 2. PHASE 0 -- CORRECTIONS ANOMALIES (AVANT TEST)

Les 4 anomalies ci-dessous doivent etre corrigees AVANT de lancer les tests.
Elles ont ete identifiees par Opus dans le bridge V&V T2115 du 06/03/2026.
Origine des ANO : le brief Opus T1730 etait en ASCII-safe, AG a copie fidelement.

### 2.1 FIX ANO-1 + ANO-4 : References "gratuit" / "0 EUR" orphelines

**Fichier** : `C:\Projects\jeanpierrecharles\src\components\homepage\i18n.ts`

**Probleme** : Le tier DISCOVER a ete supprime (MOD-5 du 06/03). Mais des textes
referenant "gratuit" et "0 EUR" persistent dans heroTrust, pricingSub, ctaSub, ctaBtn.

**Corrections FR** (chercher et remplacer les valeurs exactes) :

| Cle i18n | Texte ACTUEL (a chercher) | Texte CORRIGE (a mettre) |
|---|---|---|
| heroTrust[2] | `0\u20ac pour commencer` | `Essai gratuit 14 jours` |
| pricingSub | `Commencez gratuitement. \u00c9voluez quand vous \u00eates pr\u00eat.` | `Deux formules claires. Z\u00e9ro engagement.` |
| ctaSub | `Cr\u00e9ez votre compte gratuit en 30 secondes` | `D\u00e9marrez votre essai en 30 secondes. Sans engagement.` |
| ctaBtn1 | `Cr\u00e9er mon compte gratuit` | `D\u00e9marrer mon essai gratuit \u2192` |

**Corrections EN** (memes cles, section EN) :

| Cle i18n | Texte ACTUEL (a chercher) | Texte CORRIGE (a mettre) |
|---|---|---|
| heroTrust[2] | `\u20ac0 to start` | `14-day free trial` |
| pricingSub | `Start free. Scale when you're ready.` | `Two clear plans. Zero commitment.` |
| ctaSub | `Create your free account in 30 seconds` | `Start your trial in 30 seconds. No commitment.` |
| ctaBtn1 | `Create my free account` | `Start my free trial \u2192` |

### 2.2 FIX ANO-2 : Accents manquants dans textes FR

**Fichier** : `C:\Projects\jeanpierrecharles\src\components\homepage\i18n.ts`

**Probleme** : Le brief Opus T1730 etait en ASCII-safe. AG a copie les textes sans accents.
Les textes FR doivent porter les accents corrects.

**Corrections dans la section FR uniquement** :

**Tiers PILOTAGE features FR** :
- `analyse d'impact reglementaire IA` → `analyse d'impact r\u00e9glementaire IA`
- `strategiques` → `strat\u00e9giques`
- `actualites` → `actualit\u00e9s`

**Tiers EXPERTISE TERRAIN features FR** :
- `dedie` → `d\u00e9di\u00e9`
- `mecatronique` → `m\u00e9catronique`
- `reglementaire` → `r\u00e9glementaire`

**Taglines tiers FR** :
- `Pilotez votre conformite EU avec l'IA` → `Pilotez votre conformit\u00e9 EU avec l'IA`
- `32 ans d'expertise R&D + IA reglementaire` → `32 ans d'expertise R&D + IA r\u00e9glementaire`

**CTA tiers FR** :
- `Demarrer l'essai gratuit` → `D\u00e9marrer l'essai gratuit`

**4 reglements ajoutes le 06/03 -- section FR** :
- `equipements` → `\u00e9quipements`
- `Donnees` → `Donn\u00e9es`
- `Cybersecurite` → `Cybers\u00e9curit\u00e9`
- `entites` → `entit\u00e9s`

**Tagline convergence FR (trinityResult)** :
- `conformite industrielle, pilotee par` → `conformit\u00e9 industrielle, pilot\u00e9e par`

**IMPORTANT** : NE PAS toucher aux textes EN -- ils n'ont pas de probleme d'accents.

### 2.3 FIX ANO-3 : "(-17%)" sur EXPERTISE TERRAIN

**Fichier** : `C:\Projects\jeanpierrecharles\src\components\homepage\PricingSection.tsx`

**Probleme** : Le toggle annual/monthly affiche `annual (-17%)` pour chaque tier.
Pour EXPERTISE TERRAIN (350 EUR/h, forfait 2 500 EUR/mois), le "(-17%)" n'a pas de sens.

**Correction** : Modifier le rendu du champ `annual` dans PricingSection.tsx pour
afficher `ou 2 500\u20ac/mois` (FR) / `or \u20ac2,500/mo` (EN) au lieu de `2 500\u20ac/mois (-17%)`.

Logique a appliquer :
```
Si le tier a un champ `period` contenant "/h" ou "/hr" ou "/heure" :
    Afficher le champ `annual` SANS le suffixe "(-17%)"
    Prefixer avec "ou " (FR) / "or " (EN)
Sinon :
    Conserver le comportement actuel avec "(-17%)"
```

Alternative plus simple si la logique conditionnelle est complexe :
```
Supprimer le suffixe "(-17%)" du rendu pour TOUS les tiers
et afficher le champ `annual` tel quel comme alternative tarifaire.
```

AG choisit l'approche la plus sure pour le build. Les deux sont acceptables.

### 2.4 Validation Phase 0

Apres les 3 FIX :

```
1. npm run build → doit etre 0 erreurs TS
2. npm run dev → verifier visuellement :
   - Plus de "0 EUR" ou "gratuit" dans Hero (FR) → "Essai gratuit 14 jours"
   - pricingSub = "Deux formules claires. Zero engagement." (FR)
   - Accents presents dans tiers FR (conformite, reglementaire, etc.)
   - EXPERTISE TERRAIN affiche "ou 2 500 EUR/mois" sans "(-17%)"
   - Toggle EN : memes verifications en anglais
3. Si build OK + verif visuelle OK → passer aux tests Phase 1
4. Si build FAIL → STOP, documenter dans le rapport, ne pas continuer
```

---

## 3. ROLES TESTEURS (R)

| ID | Role | Persona | Ce qu'il cherche sur le site |
|---|---|---|---|
| R1 | Directeur R&D / Ingenierie | Decideur technique, 45-55 ans, gere 10-30 ingenieurs | Expertise sectorielle, couverture reglementaire, ROI temps |
| R2 | Responsable Qualite | Garant conformite, pilote audits, interface organismes notifies | Exhaustivite reglementaire, tracabilite, AMDEC, preuves conformite |
| R3 | DSI / Responsable IT | Securite donnees, integration SI, RGPD, cybersecurite | RGPD natif, hebergement EU, NIS2, CRA |
| R4 | Directeur Achats | Gestion fournisseurs, conformite supply chain, REACH, CSRD | Impact fournisseurs, Due Diligence, couts, ROI financier |
| R5 | Directeur Production/Operations | Lancement serie, industrialisation, zero defaut | Machinery Regulation, EN 45545, zero non-conformite, AMDEC process |

---

## 4. VERTICALES INDUSTRIELLES (IV)

| ID | Verticale | Exemple entreprise type | Reglements cles |
|---|---|---|---|
| IV1 | Fabrication produits mecatroniques | ETI 200 pers., capteurs ADAS, airbags | AI Act, UNECE R155/R156, Machinery Reg, REACH |
| IV2 | Fabrication machines/systemes cyber | PME 80 pers., machines-outils connectees IoT | CRA, NIS2, Machinery Reg, Data Act, RGPD |
| IV3 | Fabrication systemes energetiques | ETI 150 pers., packs batteries Li-ion, onduleurs | Battery Reg, ESPR/DPP, EN 45545, REACH, CSRD |
| IV4 | Systemes construction | PME 50 pers., equipements BTP, materiaux | Machinery Reg, REACH, CSRD, Ecodesign ESPR |

---

## 5. MATRICE DE TEST -- 20 SCENARIOS

### 5.1 Protocole par scenario (8 etapes)

1. **FIRST IMPRESSION (5s)** : Le visiteur comprend-il immediatement la proposition de valeur ?
2. **PERTINENCE HERO** : Le H1 + tagline convergence resonnent-ils avec ce profil ?
3. **REGLEMENTS** : Les 12 cartes affichees couvrent-elles les besoins du profil x verticale ?
4. **PRICING FIT** : Le tier PILOTAGE ou EXPERTISE TERRAIN correspond-il au besoin ?
5. **CTA SCROLL** : Cliquer le CTA du tier pertinent → scroll smooth vers #cta-section ?
6. **TOGGLE PRICING** : Basculer monthly/annual → les valeurs affichees sont-elles coherentes ?
7. **BRAIN TEST** : Poser la question specifique (section 5.2) dans AEGIS Intelligence
8. **REPONSE QUALITE** : La reponse est-elle pertinente, precise, et actionnable ?

### 5.2 Matrice complete -- Questions Brain simulees

| # | Role | Verticale | Question a poser dans AEGIS Intelligence |
|---|---|---|---|
| T01 | R1 Dir R&D | IV1 Mecatronique | "Quels impacts de l'AI Act sur un systeme ADAS de niveau 2 ?" |
| T02 | R1 Dir R&D | IV2 Cyber machines | "Comment le CRA impacte-t-il nos machines-outils connectees IoT ?" |
| T03 | R1 Dir R&D | IV3 Energie | "Quelles obligations du Reglement Batteries pour un pack Li-ion 48V ?" |
| T04 | R1 Dir R&D | IV4 Construction | "Machinery Regulation : quels changements pour nos equipements BTP ?" |
| T05 | R2 Qualite | IV1 Mecatronique | "AMDEC reglementaire AI Act : quelles preuves de conformite documenter ?" |
| T06 | R2 Qualite | IV2 Cyber machines | "NIS2 : quelles exigences pour un fabricant de machines essentielles ?" |
| T07 | R2 Qualite | IV3 Energie | "DPP batteries : quel contenu obligatoire pour le passeport numerique ?" |
| T08 | R2 Qualite | IV4 Construction | "REACH : quelles substances a tracer dans nos materiaux construction ?" |
| T09 | R3 DSI/IT | IV1 Mecatronique | "RGPD et donnees vehicule connecte : quelles obligations pour notre SI ?" |
| T10 | R3 DSI/IT | IV2 Cyber machines | "CRA + NIS2 : comment securiser nos machines connectees contre les cyberattaques ?" |
| T11 | R3 DSI/IT | IV3 Energie | "Data Act : quelles obligations de partage pour nos donnees batteries IoT ?" |
| T12 | R3 DSI/IT | IV4 Construction | "RGPD chantier connecte : quelles donnees personnelles proteger ?" |
| T13 | R4 Achats | IV1 Mecatronique | "REACH : comment auditer la conformite substances de mes fournisseurs tier 2 ?" |
| T14 | R4 Achats | IV2 Cyber machines | "CSRD : quelles obligations de reporting ESG pour notre supply chain ?" |
| T15 | R4 Achats | IV3 Energie | "Reglement Batteries : due diligence cobalt/lithium, quelles preuves ?" |
| T16 | R4 Achats | IV4 Construction | "ESPR : impact du passeport numerique produit sur nos achats materiaux ?" |
| T17 | R5 Production | IV1 Mecatronique | "Machinery Regulation : quels tests de validation avant mise en service ADAS ?" |
| T18 | R5 Production | IV2 Cyber machines | "Cybersecurite en production : comment integrer CRA dans nos process fabrication ?" |
| T19 | R5 Production | IV3 Energie | "EN 45545 : exigences securite incendie pour assemblage batteries ferroviaires ?" |
| T20 | R5 Production | IV4 Construction | "Marquage CE machines BTP : quelles etapes Machinery Regulation 2023/1230 ?" |

### 5.3 PRIORITES D'EXECUTION

| Phase | Contenu | Obligatoire |
|---|---|---|
| Phase 0 | Corrections ANO-1 a ANO-4 (section 2) | OUI |
| Phase 1 | 4 scenarios diagonaux Desktop (T01, T06, T11, T16) | OUI |
| Phase 2 | 16 scenarios restants Desktop | OUI |
| Phase 3 | Tests fonctionnels (CTA scroll, toggle pricing, FR/EN) | OUI |
| Phase 4 | Phase 1 repetee sur viewport MOBILE (375px) | OUI |

---

## 6. GRILLE D'EVALUATION PAR SCENARIO

| Critere | Score 0 | Score 1 | Score 2 | Score 3 |
|---|---|---|---|---|
| FIRST IMPRESSION | Incomprehensible | Vague | Clair | Immediat + differenciant |
| PERTINENCE HERO | Hors cible | Generique | Pertinent | Resonne directement |
| COUVERTURE REG | Reglements cles absents | Partiels | Presents | Exhaustifs |
| PRICING FIT | Incoherent | Confus | Comprehensible | Naturel pour ce profil |
| CTA SCROLL | Casse / ne fonctionne pas | Scroll mais pas smooth | Smooth mais mauvaise cible | Smooth vers #cta-section OK |
| TOGGLE PRICING | Casse / ne fonctionne pas | Affiche mais valeurs fausses | Fonctionne mais confus | Clair monthly / annual |
| BRAIN PERTINENCE | Hors sujet | Generique | Pertinent | Actionnable et precis |
| BRAIN QUALITE | Erreurs factuelles | Superficiel | Correct | Expert-level |

**Score max par scenario** : 24 points (8 criteres x 3 max)
**Score max Phase 1 (4 scenarios Desktop)** : 96 points
**Score max Phase 4 (4 scenarios Mobile)** : 96 points
**Score max total (20 scenarios Desktop)** : 480 points

**Seuils** :
- Phase 1 Desktop GO : >= 72/96 (75%)
- Phase 4 Mobile GO : >= 72/96 (75%)
- Total Desktop GO : >= 360/480 (75%)
- **ATTENTION** : < 50% sur un critere individuel (moyenne tous scenarios) = flag bloquant

---

## 7. INSTRUCTIONS D'EXECUTION DETAILLEES

### 7.1 Phase 0 -- Corrections (section 2)

```
1. Ouvrir les fichiers i18n.ts et PricingSection.tsx
2. Appliquer FIX ANO-1+4 (section 2.1)
3. Appliquer FIX ANO-2 (section 2.2)
4. Appliquer FIX ANO-3 (section 2.3)
5. npm run build → DOIT etre 0 erreurs
6. npm run dev → verifications visuelles (section 2.4)
7. Documenter resultat dans le rapport
```

### 7.2 Phase 1 -- Scenarios diagonaux Desktop

```
Pour chaque scenario T01, T06, T11, T16 :
  a. Recharger http://localhost:5173/ (page propre)
  b. Se mettre dans la peau du role Rx (section 3)
  c. Observer la page 5 secondes → noter FIRST IMPRESSION
  d. Lire H1 + tagline → noter PERTINENCE HERO
  e. Scroller aux cartes reglements → noter COUVERTURE REG
  f. Scroller au pricing → noter PRICING FIT
  g. Cliquer le CTA du tier pertinent → noter CTA SCROLL
  h. Remonter au pricing, basculer monthly/annual → noter TOGGLE PRICING
  i. Remonter au champ Brain IA
  j. Taper la question exacte du scenario (section 5.2)
  k. Attendre reponse complete (max 15 secondes)
  l. Evaluer → noter BRAIN PERTINENCE + BRAIN QUALITE
  m. Screenshot ou description textuelle de la reponse Brain
  n. Reporter les 8 scores dans la grille
```

### 7.3 Phase 3 -- Tests fonctionnels specifiques

Ces tests sont executes UNE FOIS (pas par scenario) :

| # | Test | Protocole | Resultat attendu |
|---|---|---|---|
| F1 | CTA PILOTAGE scroll | Cliquer CTA du tier PILOTAGE | Scroll smooth vers #cta-section |
| F2 | CTA EXPERTISE scroll | Cliquer CTA du tier EXPERTISE TERRAIN | Scroll smooth vers #cta-section |
| F3 | Toggle monthly→annual FR | Cliquer toggle annual dans PricingSection (FR) | PILOTAGE affiche prix annuel avec (-17%), EXPERTISE affiche "ou 2 500 EUR/mois" SANS (-17%) |
| F4 | Toggle monthly→annual EN | Basculer EN, repeter F3 | Meme comportement en anglais |
| F5 | Toggle FR→EN global | Cliquer bouton langue EN | Tous textes traduits : H1, tagline, reglements, pricing, Brain CTA |
| F6 | Toggle EN→FR global | Cliquer bouton langue FR | Retour FR complet, accents presents |
| F7 | Brain FR reponse | Poser question FR dans Brain IA | Reponse en francais, streaming visible |
| F8 | Brain EN reponse | Poser question EN dans Brain IA (apres toggle EN) | Reponse en anglais |

**Resultat par test** : PASS / FAIL / PARTIEL (avec description si FAIL ou PARTIEL)

### 7.4 Phase 4 -- Mobile (4 scenarios diagonaux)

```
1. Redimensionner le viewport navigateur a 375px de largeur (iPhone SE/standard)
   Ou utiliser les DevTools Chrome : Toggle device toolbar → iPhone SE
2. Recharger http://localhost:5173/
3. Repeter le protocole Phase 1 (section 7.2) pour T01, T06, T11, T16
4. Attention particuliere a :
   - Lisibilite du H1 + tagline sur petit ecran
   - Cartes reglements : overflow horizontal ? Scroll necessaire ?
   - Pricing : les 2 tiers s'empilent-ils correctement en colonne ?
   - Brain IA : le champ est-il accessible ? La reponse est-elle lisible ?
   - CTA : le bouton est-il cliquable sans zoom ?
5. Scorer avec la meme grille 8 criteres
```

---

## 8. OBSERVATIONS SPECIFIQUES A DOCUMENTER

Pour chaque scenario (Desktop ET Mobile), AG doit noter :

| Element | Ce qu'AG doit documenter |
|---|---|
| Reglements manquants | Si un reglement cle pour le profil x verticale n'est PAS dans les 12 cartes |
| Brain timeout | Si Brain IA ne repond pas dans les 15 secondes |
| Brain erreur factuelle | Si la reponse contient une information objectivement fausse |
| Brain langue | Si la reponse est dans la mauvaise langue |
| Markdown brut | Si des asterisques * ou ## s'affichent en brut dans la reponse Brain (connu -- defere v3.2) |
| Responsive casse | Elements qui debordent, se chevauchent ou sont illisibles sur mobile |
| Accents post-fix | Si des textes FR sont encore sans accents apres FIX ANO-2 |

---

## 9. CONTEXTE TECHNIQUE POUR AG

**Production actuelle** : v2.6.0 (commit c2c532b) sur jeanpierrecharles.com
**Local v3.1** : Build OK (verifie 06/03 -- AG build 5.94s, 0 erreurs TS)
**Modifications v3.1 appliquees** : 6 MODs (brief T1730) -- V&V Opus 10/10 PASS
**Streaming Brain IA** : Gemini 2.0 Flash SSE via proxy Vercel
**Markdown brut** : Connu -- asterisques/headers affichent raw dans reponses Brain (defere v3.2)

**Stack** : React 19 + Vite 6.2 + TypeScript 5.8 + Tailwind v4 + Gemini SSE + Vercel

**Fichiers modifiables (Phase 0 uniquement)** :
- `src/components/homepage/i18n.ts` (FIX ANO-1, ANO-2, ANO-4)
- `src/components/homepage/PricingSection.tsx` (FIX ANO-3)

**Fichiers INTERDITS** (ne pas modifier meme si tente) :
- vite.config.ts, api/gemini-proxy.ts, .env*, constants.ts
- LangContext.tsx, NavBar.tsx, App.tsx
- Tout fichier dans src/components/brain/, src/services/, src/data/

---

## 10. ORDRE D'EXECUTION GLOBAL

```
PHASE 0 -- CORRECTIONS (30 min estimees)
  1. FIX ANO-1+4 (i18n.ts FR+EN) -- references gratuit
  2. FIX ANO-2 (i18n.ts FR) -- accents
  3. FIX ANO-3 (PricingSection.tsx) -- toggle annual
  4. npm run build → 0 erreurs
  5. npm run dev → verification visuelle
  6. Documenter Phase 0 dans rapport

PHASE 1 -- TESTS DIAGONAUX DESKTOP (45 min estimees)
  7. T01 (R1 x IV1) -- coeur de cible JP
  8. T06 (R2 x IV2) -- qualite + cyber
  9. T11 (R3 x IV3) -- IT + energie
  10. T16 (R4 x IV4) -- achats + construction
  11. Scorer + documenter

PHASE 2 -- TESTS COMPLETS DESKTOP (2h estimees -- OBLIGATOIRE)
  12. T02-T05, T07-T10, T12-T15, T17-T20
  13. Scorer + documenter

PHASE 3 -- TESTS FONCTIONNELS (20 min estimees)
  14. F1-F8 (CTA scroll, toggle pricing, toggle langue, Brain FR/EN)
  15. PASS/FAIL + documenter

PHASE 4 -- TESTS MOBILE (30 min estimees)
  16. Viewport 375px
  17. T01, T06, T11, T16 en mobile
  18. Scorer + documenter

RAPPORT FINAL
  19. Consolidation scores + verdict
```

**Temps total estime** :
- Phases 0+1+3+4 : ~2h05
- Phase 2 : ~2h
- Total : ~4h (toutes phases obligatoires)

---

## 11. DECISIONS (IDs temporaires T0830)

| ID | Decision | Statut |
|---|---|---|
| D_T0830_01 | Deleguer corrections ANO + execution matrice test v3.1 a AG | JP VALIDE |
| D_T0830_02 | Corriger les 4 ANO AVANT les tests (pas de baseline "tel quel") | JP VALIDE |
| D_T0830_03 | Seuil GO deploy >= 75% maintenu | JP VALIDE |
| D_T0830_04 | Ajouter CTA scroll + toggle annual/monthly a la grille d'evaluation (8 criteres) | JP VALIDE |
| D_T0830_05 | Tester Desktop + Mobile (viewport 375px) | JP VALIDE |
| D_T0830_06 | Phase 1 + Phase 2 + Phase 3 + Phase 4 TOUTES obligatoires | JP VALIDE |
| D_T0830_07 | FIX ANO-3 Option B retenue (afficher "ou X EUR/mois" sans "(-17%)") | JP VALIDE |

---

## 12. FORMAT DU RAPPORT DE TEST (TEMPLATE AG)

AG doit produire son rapport en respectant ce format exact :

```
# RAPPORT_TEST_MATRICE_FONCTIONNEL_V31

**Date execution** : [YYYYMMDDTHHMM]
**Agent** : AG (Gemini 2.0 Flash)
**Brief source** : 20260308T0830_BRIEF_AG-TEST-MATRICE-FONCTIONNEL-V31
**Duree totale** : [Xh XXmin]

---

## PHASE 0 -- CORRECTIONS

### Build pre-correction
npm run build : [resultat]

### FIX ANO-1+4
- Fichier : i18n.ts
- Modifications : [liste]
- Verification visuelle : [OK/FAIL + detail]

### FIX ANO-2
- Fichier : i18n.ts
- Modifications : [liste]
- Verification visuelle : [OK/FAIL + detail]

### FIX ANO-3
- Fichier : PricingSection.tsx
- Approche choisie : [conditionnelle / suppression globale]
- Verification visuelle : [OK/FAIL + detail]

### Build post-correction
npm run build : [resultat -- DOIT etre 0 erreurs]

### Verdict Phase 0 : [OK / FAIL]

---

## PHASE 1 -- SCENARIOS DIAGONAUX DESKTOP

### T01 -- R1 Dir R&D x IV1 Mecatronique
- FIRST IMPRESSION : [0-3] -- [commentaire]
- PERTINENCE HERO : [0-3] -- [commentaire]
- COUVERTURE REG : [0-3] -- [reglements manquants si applicable]
- PRICING FIT : [0-3] -- [commentaire]
- CTA SCROLL : [0-3] -- [commentaire]
- TOGGLE PRICING : [0-3] -- [commentaire]
- BRAIN PERTINENCE : [0-3] -- [commentaire]
- BRAIN QUALITE : [0-3] -- [commentaire]
- BRAIN REPONSE : [resume 2-3 lignes]
- ANOMALIES : [liste]
- SCORE T01 : [X/24]

### T06 -- R2 Qualite x IV2 Cyber machines
[meme format]

### T11 -- R3 DSI/IT x IV3 Energie
[meme format]

### T16 -- R4 Achats x IV4 Construction
[meme format]

---

## SYNTHESE PHASE 1 DESKTOP

| Scenario | FI | HERO | REG | PRICE | CTA | TOGGLE | B-PERT | B-QUAL | TOTAL |
|---|---|---|---|---|---|---|---|---|---|
| T01 | | | | | | | | | /24 |
| T06 | | | | | | | | | /24 |
| T11 | | | | | | | | | /24 |
| T16 | | | | | | | | | /24 |
| TOTAL | | | | | | | | | /96 |

**Score Phase 1 Desktop** : [X/96] ([XX%])
**Verdict Phase 1** : [GO / NO-GO / CONDITIONNEL]

---

## PHASE 2 -- SCENARIOS COMPLETS DESKTOP
[meme format par scenario]

---

## PHASE 3 -- TESTS FONCTIONNELS

| # | Test | Resultat | Detail |
|---|---|---|---|
| F1 | CTA PILOTAGE scroll | [PASS/FAIL] | |
| F2 | CTA EXPERTISE scroll | [PASS/FAIL] | |
| F3 | Toggle annual FR | [PASS/FAIL] | |
| F4 | Toggle annual EN | [PASS/FAIL] | |
| F5 | Toggle FR→EN | [PASS/FAIL] | |
| F6 | Toggle EN→FR | [PASS/FAIL] | |
| F7 | Brain FR | [PASS/FAIL] | |
| F8 | Brain EN | [PASS/FAIL] | |

**Score Phase 3** : [X/8 PASS]
**Verdict Phase 3** : [GO / NO-GO]

---

## PHASE 4 -- MOBILE (viewport 375px)

### T01 Mobile -- R1 Dir R&D x IV1 Mecatronique
[meme format 8 criteres]

### T06 Mobile -- [...]
### T11 Mobile -- [...]
### T16 Mobile -- [...]

| Scenario | FI | HERO | REG | PRICE | CTA | TOGGLE | B-PERT | B-QUAL | TOTAL |
|---|---|---|---|---|---|---|---|---|---|
| T01m | | | | | | | | | /24 |
| T06m | | | | | | | | | /24 |
| T11m | | | | | | | | | /24 |
| T16m | | | | | | | | | /24 |
| TOTAL | | | | | | | | | /96 |

**Score Phase 4 Mobile** : [X/96] ([XX%])
**Verdict Phase 4** : [GO / NO-GO / CONDITIONNEL]

---

## SYNTHESE GLOBALE

| Critere | Moy. Desktop | Moy. Mobile | Flag |
|---|---|---|---|
| FIRST IMPRESSION | | | |
| PERTINENCE HERO | | | |
| COUVERTURE REG | | | |
| PRICING FIT | | | |
| CTA SCROLL | | | |
| TOGGLE PRICING | | | |
| BRAIN PERTINENCE | | | |
| BRAIN QUALITE | | | |

**Verdict final** :
- Phase 0 Corrections : [OK/FAIL]
- Phase 1 Desktop (4 diag.) : [X/96] [GO/NO-GO]
- Phase 2 Desktop (20 total) : [X/480] [GO/NO-GO]
- Phase 3 Fonctionnel : [X/8] [GO/NO-GO]
- Phase 4 Mobile : [X/96] [GO/NO-GO]
- **DECISION RECOMMANDEE** : [GO / NO-GO / CONDITIONNEL + conditions]

---

## ANOMALIES OBSERVEES (liste consolidee)
[Liste de toutes anomalies avec reference scenario et phase]

---

## RECOMMANDATIONS AG
[Max 5 items -- recommandations basees sur les resultats]
```

---

*AEGIS CIRCULAR -- Brief AG Corrections + Test Matrice Fonctionnel v3.1*
*Reference : 20260308T0830_BRIEF_AG-TEST-MATRICE-FONCTIONNEL-V31*
*Redige par Claude Opus 4.6 -- convergence avec JP -- 08/03/2026 08h30 CET*
*V3 FINAL -- integre decisions JP (corrections avant test, seuil 75%, CTA+toggle, Desktop+Mobile, Phase 2 obligatoire, ANO-3 Option B)*
*100% ASCII-safe*
