

**AEGIS CIRCULAR — v3.0-alpha**

**DOCUMENT DE CONVERGENCE AG**

VizuGraphicEngine 3D — Modal Causality Effect Analysis

Analyse d’intégration Moteurs 3D (Unity / Unreal / Web-native)

Expertise Format STEP (ISO 10303\) & Sources Ouvertes

| Date | 14 février 2026 |
| :---- | :---- |
| **Référence** | AEGIS-CONV-VGE3D-20260214 |
| **Auteur** | Claude Opus 4.6 (Anthropic) |
| **Destinataire** | Jean-Pierre Charles (Décideur) |
| **Statut** | **VALIDÉ JP — 14/02/2026 12h25** |
| **Décision** | **NO-GO v3.0-alpha • GO CONDITIONNEL v3.1 (web-native)** |
| **Classification** | **CONFIDENTIEL** |

*Décision validée par JP le 14/02/2026 à 12h25 — Prêt pour V\&V AG*

**NO-GO v3.0-alpha • GO CONDITIONNEL v3.1 Web-native**

# **1\. Executive Summary**

Ce document analyse l’opportunité d’intégrer une capacité de visualisation 3D dans la plateforme Aegis Circular v3.0-alpha, suite à l’analyse du document TriTech « Graphic Engine for Visualization » présentant l’utilisation de Unity et Unreal Engine pour la conversion et le rendu de données CAO industrielles.

| ✅ DÉCISION VALIDÉE | NO-GO v3.0-alpha (27/02/2026) — Validé JP 14/02/2026 12h25 |
| :---- | :---- |
| **GO CONDITIONNEL** | Pour v3.1 (mars-avril 2026\) — **Viewer STEP web-native (Three.js \+ React Three Fiber \+ OpenCascade.js WASM)** |
| **STACK VALIDÉ** | Three.js \+ React Three Fiber \+ OpenCascade.js (WASM) \+ @react-three/drei — 0€ licence, intégration native React/Vite |

**Justification clé :** Unity et Unreal sont des moteurs desktop/natifs conçus pour des applications standalone. Aegis est un SaaS B2B web. L’intégration de ces moteurs dans une SPA React est techniquement non viable dans le budget et le calendrier v3.0, et stratégiquement non alignée avec l’architecture actuelle. La bonne approche est un viewer 3D web-native basé sur Three.js \+ OpenCascade.js (WASM) pour le parsing STEP.

# **2\. Contexte & Périmètre**

## **2.1 Document source : TriTech « Graphic Engine for Visualization »**

Le slide TriTech (Virtual.Art.Clean) présente un workflow de visualisation industrielle :

* CAO originale (plans 2D/3D complexes) → Défeaturing CAO (simplification géométrique)

* Conversion de format \+ Re-groupement de modèles

* Unity → applications légères (laptop, mobile)

* Unreal Engine → qualité graphique supérieure (cartes graphiques puissantes)

Ce workflow est typique de l’industrie lourde (nucléaire, pétrochimie, aéronautique) où des assemblages CAO de millions de polygones doivent être visualisés pour la maintenance, la formation ou la revue de conception.

## **2.2 Périmètre Aegis Circular v3.0-alpha**

Aegis est une plateforme SaaS B2B de conformité réglementaire EU pour ETI industrielles. Le stack technique est React 19 \+ Vite \+ Gemini 2.0 Flash \+ Supabase \+ Stripe. La v3.0-alpha vise le 27/02/2026 avec un objectif de revenu \< 10 000€ à fin mars 2026\.

**Question stratégique :** La visualisation 3D de produits industriels apporte-t-elle une valeur différenciante mesurable pour le positionnement d’Aegis comme plateforme de conformité réglementaire EU ?

# **3\. Expertise Moteurs 3D**

## **3.1 Matrice comparative Unity / Unreal / Web-native**

| Critère | Unity 6.x | Unreal Engine 5.x | Web-native (Three.js) |
| :---- | :---- | :---- | :---- |
| **Architecture** | App standalone C\# | App standalone C++ | Navigateur WebGL/WebGPU |
| **Licence (\< 200k€ CA)** | Gratuit (Personal) | Gratuit (\< 1M$ CA) | MIT / Open Source |
| **Licence (\> 200k€ CA)** | 2 310€/an/siège (Pro) | 5% royalties \> 1M$ ou 1 850€/an/siège | Gratuit |
| **Import CAD/STEP** | PiXYZ (payant, \~3 000€/an) | Datasmith (inclus) | OpenCascade.js (LGPL, gratuit) |
| **Qualité rendu** | Bonne (HDRP) | Excellente (Nanite/Lumen) | Bonne (PBR Three.js) |
| **Déploiement web** | WebGL (lourd, 20-80 Mo) | Non supporté nativement | Natif (\< 5 Mo) |
| **Intégration React SPA** | Iframe/embed uniquement | Impossible en web | **Native React Three Fiber** |
| **Courbe apprentissage** | Modérée (C\#) | Élevée (C++/Blueprints) | Faible (JavaScript) |
| **Mobile** | Excellent | Lourd | Bon (responsive) |
| **Compatibilité ARM64** | Limitée Windows ARM | Non supporté Windows ARM | Natif (navigateur) |

## **3.2 Analyse critique pour Aegis**

### **3.2.1 Pourquoi Unity est INADÉQUAT pour Aegis v3.0**

1. Problème d’architecture : Unity produit des applications standalone, pas des composants React intégrables. L’export WebGL Unity génère un blob de 20-80 Mo qui ne s’intègre que par iframe dans une SPA.

2. Coût caché : le plugin PiXYZ pour importer les fichiers STEP coûte \~3 000€/an, en plus de la licence Unity Pro à 2 310€/an/siège. Total : \~5 300€/an minimum.

3. Incompatibilité matérielle : Unity a un support limité de Windows on ARM (Surface Pro 11 Snapdragon X). Le développement serait contraint.

4. Risque licensing : l’historique chaotique de Unity (Runtime Fee 2023, revirement 2024, hausses 2025-2026) crée une incertitude structurelle pour une startup B2B.

### **3.2.2 Pourquoi Unreal Engine est INADÉQUAT pour Aegis v3.0**

5. Zéro déploiement web : Unreal ne supporte pas le déploiement WebGL/WebGPU. Tout rendu nécessite une application native ou du Pixel Streaming (serveur GPU coûteux).

6. Exigences matérielles : cartes graphiques dédiées puissantes requises, incompatible avec la cible ETI (utilisateurs sur laptops standards).

7. Royalties 5% : au-delà de 1M$ de CA, Epic prélève 5% du CA brut attribuable. Pour un SaaS, cela impacte structurellement la rentabilité.

8. Courbe d’apprentissage C++ : totalement hors du stack technique actuel (React/JS/Python). Le coût d’acquisition de compétences est prohibitif.

### **3.2.3 Pourquoi le Web-native est la BONNE approche pour Aegis**

9. Intégration native React : React Three Fiber (R3F) s’intègre directement comme composant React dans la SPA existante. Zéro iframe, zéro build séparé.

10. Coût zéro licence : Three.js (MIT), OpenCascade.js (LGPL), Online3DViewer (MIT) sont tous gratuits et open source.

11. Format STEP natif : OpenCascade.js est un portage WebAssembly de la bibliothèque OCCT (utilisée par FreeCAD, KiCad, etc.) qui parse nativement les fichiers STEP ISO 10303 dans le navigateur.

12. Compatibilité universelle : fonctionne sur tout navigateur WebGL 2.0/WebGPU, y compris ARM64, mobile, et les laptops ETI standards sans carte graphique dédiée.

# **4\. Format STEP & Écosystème Open Source**

## **4.1 Le format STEP (ISO 10303\)**

STEP (Standard for the Exchange of Product Data) est le standard international pour l’échange de données CAO. Il encode la géométrie B-Rep (Boundary Representation), la topologie, les matériaux, les annotations PMI, et la structure d’assemblage. C’est le format pivot de l’industrie mécanique.

**Pertinence pour Aegis :** Les ETI industrielles cibles (mécanique, batteries, équipements) utilisent quotidiennement des fichiers STEP. Permettre le chargement et la visualisation de ces fichiers dans Aegis créerait un pont tangible entre le produit physique et son analyse de conformité réglementaire.

## **4.2 Solutions open source identifiées**

| Solution | Licence | Formats | Stack | Maturité |
| :---- | :---- | :---- | :---- | :---- |
| **OpenCascade.js** | LGPL 2.1 | STEP, IGES, BREP | WASM \+ JS | Prod-ready, communauté active |
| **Online3DViewer** | MIT | STEP, glTF, OBJ, STL, IFC... | JS / Three.js | Prod-ready (3dviewer.net) |
| **three-cad-viewer** | Apache 2.0 | Triangulated mesh | Three.js / npm | Stable, orienté CAD |
| **React Three Fiber** | MIT | glTF, OBJ (loaders) | React \+ Three.js | Standard industrie React 3D |
| **STEP Tools (stp2webgl)** | Open Source | STEP → WebGL/STL | Server-side C | NIST-backed, référence |
| **Staircase (Formlabs)** | LGPL | STEP | OCCT \+ WASM | Expérimental |

## **4.3 Architecture recommandée pour Aegis**

La solution optimale combine OpenCascade.js (parsing STEP côté client via WASM) avec React Three Fiber (rendu 3D intégré React) et les loaders de Online3DViewer (support multi-format).

Pipeline proposé : Fichier STEP (upload client) → OpenCascade.js (tessellation WASM dans le navigateur) → Géométrie mesh (vertices/faces) → React Three Fiber (rendu WebGL interactif) → Annotations réglementaires (overlay Aegis).

**Avantage différenciant :** Le viewer 3D pourrait afficher directement les zones du produit concernées par chaque exigence réglementaire (marquage CE, zones de sécurité Machines 2023/1230, emplacement batterie 2023/1542, etc.). C’est unique sur le marché.

# **5\. Analyse d’impacts Multi-dimensionnelle**

| Dimension | Niveau | Analyse | Mitigation |
| :---- | :---- | :---- | :---- |
| **SÉCURITÉ** | **MOYEN** | Upload fichiers STEP côté client \= vecteur d’attaque potentiel (fichiers malformés, taille excessive). Processing WASM isolé dans le navigateur \= pas d’exécution serveur. | Validation côté client (taille max, type MIME). Sandboxing WASM natif du navigateur. Pas de stockage serveur des fichiers CAO en v3.1 (traitement client-only). |
| **COÛT** | **FAIBLE** | Zéro licence. Librairies OSS gratuites. Pas de serveur GPU requis. Développement estimé : 40-60h pour un viewer STEP fonctionnel. | Comparaison : Unity \+ PiXYZ \= 5 300€/an \+ 80-120h dev. Unreal \= non viable en web. Le web-native est 10x moins cher. |
| **QUALITÉ** | **BON** | Three.js avec PBR offre une qualité de rendu suffisante pour la revue réglementaire (pas besoin de photoralisme Unreal). OpenCascade.js parse fidèlement les STEP AP203/AP214. | LOD (Level of Detail) pour les gros assemblages. Tessellation adaptative. Tests avec fichiers STEP réels de clients pilotes. |
| **COMPLIANCE** | **FAVORABLE** | LGPL 2.1 (OpenCascade.js) compatible avec SaaS commercial si pas de modification du code LGPL. MIT (Three.js, R3F) \= aucune contrainte. Traitement client-only \= pas de stockage de PI client côté serveur \= RGPD simplifié. | Audit licences OSS pré-intégration. Vérifier LGPL dynamique linking vs static. Documenter dans le registre de traçabilité. |
| **TIMING** | **CRITIQUE** | 13 jours restants avant v3.0-alpha (27/02). L’intégration 3D nécessite 40-60h (2-3 semaines). Totalement incompatible avec le calendrier v3.0. | Reporter à v3.1 (mars-avril 2026). Prioriser : auth, homepage B2B, Stripe, dashboard — les fonctions génératrices de revenu. |
| **PLANNING** | **v3.1** | La 3D est une feature PREMIUM (tier 500€/mois) qui justifie le prix premium et différencie Aegis. Pas critique pour la génération de revenu initiale. | Phase 1 (v3.1) : Viewer STEP basique. Phase 2 (v3.2) : Annotations réglementaires overlay. Phase 3 (v4.0) : Digital Twin avec suivi conformité. |

# **6\. Plan d’exécution recommandé**

## **6.1 Roadmap d’intégration 3D (post v3.0-alpha)**

| Phase | Version / Date | Scope | Effort |
| :---- | :---- | :---- | :---- |
| **P0** | **v3.0-alpha 27/02/2026** | NE RIEN FAIRE. Focus auth \+ homepage \+ Stripe \+ dashboard. Aucune dépendance 3D. | 0h (pas de 3D) |
| **P1** | **v3.1 Mars-Avril 2026** | POC viewer STEP : npm install three @react-three/fiber opencascade.js. Composant React \<StepViewer /\> avec drag-and-drop fichier STEP. Rotation, zoom, pan. Pas de stockage serveur. | 40-60h dev |
| **P2** | **v3.2 Mai-Juin 2026** | Annotations réglementaires : overlay zones réglementaires sur le modèle 3D (marquage CE, zones batteries, points de sécurité machines). Mapping STEP entités ↔ exigences EU. | 60-80h dev |
| **P3** | **v4.0 Q3-Q4 2026** | Digital Product Passport 3D : visualisation intégrée du DPP (ESPR 2024/1781) directement sur le modèle 3D. Historique conformité par composant. Export rapport avec captures 3D. | 100-150h dev |

## **6.2 Stack technique v3.1 (détail)**

| Composant | Package npm | Rôle |
| :---- | :---- | :---- |
| **Rendu 3D** | three \+ @react-three/fiber \+ @react-three/drei | Moteur de rendu WebGL intégré React |
| **Parsing STEP** | opencascade.js (WASM) | Lecture fichiers STEP ISO 10303 côté client |
| **Multi-format (bonus)** | online-3d-viewer (lib) | Support STL, glTF, OBJ, IFC en plus de STEP |
| **Contrôles** | @react-three/drei (OrbitControls) | Rotation, zoom, pan, sélection |
| **UI overlay** | @react-three/drei (Html) | Annotations HTML sur le modèle 3D |

## **6.3 Causalité modale : valeur business de la 3D**

L’analyse de causalité modale démontre l’impact 3D sur chaque tier de pricing :

| Tier | Sans 3D (actuel) | Avec 3D (v3.1+) | Impact Δ revenu |
| :---- | :---- | :---- | :---- |
| **DISCOVER (0€)** | Recherche réglementaire texte | Idem (pas de 3D) | Aucun — conversion funnel |
| **STANDARD (50€/m)** | Kanban \+ Gantt PDF | Idem \+ viewer STEP basique en preview | Teaser 3D → upgrade PREMIUM |
| **PREMIUM (500€/m)** | Accompagnement expert | Viewer 3D complet \+ annotations réglementaires \+ export rapports 3D | **Différenciateur majeur, justifie 10x le prix** |

# **7\. Registre des Risques**

| ID | Risque | Probabilité | Impact | Mitigation |
| :---- | :---- | :---- | :---- | :---- |
| **R1** | Fichiers STEP volumineux (\> 100 Mo) saturent le navigateur | **HAUTE** | MOYEN | LOD progressif, Web Workers pour tessellation, limite upload 50 Mo en v3.1, augmentation progressive |
| **R2** | LGPL OpenCascade.js : obligation de distribution code modifié | FAIBLE | MOYEN | Utiliser en dynamic linking (WASM séparé \= pas de contamination copyleft). Audit juridique OSS. |
| **R3** | Performance insuffisante sur mobiles/tablettes ETI | MOYENNE | MOYEN | Fallback 2D (captures d’écran pré-rendues). Détection capabilities WebGL. Progressive enhancement. |
| **R4** | Diversion de focus dev au détriment des fonctions core (auth, Stripe) | **HAUTE** | **CRITIQUE** | STRICTEMENT reporter à v3.1. Le revenu \< 10k€ fin mars est l’objectif existentiel. La 3D ne génère pas de revenu en v3.0. |
| **R5** | Propriété intellectuelle : fichiers CAO clients sont des secrets industriels | **HAUTE** | HAUT | Traitement 100% client-side en v3.1 (zéro upload serveur). Mention explicite dans les CGU. Chiffrement si stockage futur. |

# **8\. Synthèse décisionnelle**

## **8.1 Matrice de décision**

| Question | Unity | Unreal | Web-native |
| :---- | :---- | :---- | :---- |
| **Compatible stack React/Vite ?** | ❌ Non (iframe) | ❌ Non | ✅ Oui (natif) |
| **Déployable en SaaS web ?** | ⚠️ Partiel (WebGL lourd) | ❌ Non | ✅ Oui (natif) |
| **Lit le format STEP ?** | ⚠️ PiXYZ (payant) | ✅ Datasmith | ✅ OpenCascade.js |
| **Coût licence annuel ?** | 5 300€+/an | 1 850€/an ou 5% royalties | **0€** |
| **Fonctionne sur Surface Pro ARM ?** | ⚠️ Limité | ❌ Non | ✅ Oui |
| **Réalisable en 13 jours ?** | ❌ Non | ❌ Non | ❌ Non (40-60h) |

## **8.2 Actions immédiates**

| \# | Action | Responsable | Date | Statut |
| :---- | :---- | :---- | :---- | :---- |
| **A1** | Valider le NO-GO 3D pour v3.0-alpha | JP (décideur) | 14/02/2026 | **✅ VALIDÉ 14/02 12h25** |
| **A2** | Ajouter ticket backlog v3.1 : « FEAT-3D-STEP-VIEWER » | JP \+ Claude | 15/02/2026 | ⏳ À faire |
| **A3** | POC OpenCascade.js : charger un fichier STEP test dans React | AG (Gemini) | Mars 2026 | ⏳ Planifié v3.1 |
| **A4** | Audit licences OSS (LGPL dynamic linking) | Claude \+ JP | Mars 2026 | ⏳ Planifié v3.1 |
| **A5** | Collecter fichiers STEP réels de clients pilotes pour tests | JP (terrain) | Mars-Avril 2026 | ⏳ Planifié v3.1 |

# **9\. Recommandations pour AG — Instructions de cross-vérification**

**Statut :** Décision validée par JP le 14/02/2026 à 12h25. Ce document est prêt pour cross-vérification AG. Les instructions ci-dessous définissent les actions à intégrer dans les prochains briefs nocturnes et le backlog v3.1.

## **9.1 Directive v3.0-alpha (27/02/2026) — AUCUNE action 3D**

**RÈGLE ABSOLUE :** AG ne doit installer aucune dépendance 3D (three, @react-three/fiber, opencascade.js, etc.) dans la branche main pour v3.0-alpha. Zéro import, zéro composant, zéro référence à la 3D dans le code v3.0.

Raison : le budget dev restant (13 jours) est entièrement alloué aux fonctions génératrices de revenu — auth Supabase, homepage B2B (wireframe R2), intégration Stripe, dashboard client, et RGPD.

## **9.2 Stack web-native validé pour v3.1**

JP a validé l’approche web-native. La stack 3D est la suivante (tous packages npm, 0€ licence) :

| Package | Version cible | Licence | Rôle Aegis |
| :---- | :---- | :---- | :---- |
| **three** | ^0.170.x (latest stable) | MIT | Moteur rendu WebGL/WebGPU |
| **@react-three/fiber** | ^8.x ou ^9.x | MIT | Wrapper React pour Three.js |
| **@react-three/drei** | ^9.x | MIT | OrbitControls, Html overlay, helpers |
| **opencascade.js** | ^2.x (WASM build) | LGPL 2.1 | Parsing STEP ISO 10303 client-side |
| **online-3d-viewer** | latest | MIT | Multi-format (STL, OBJ, glTF) — optionnel |

**Vérification AG (LGPL) :** OpenCascade.js est sous LGPL 2.1. Tant que Aegis utilise le module WASM comme dépendance dynamique (import du .wasm sans modification du code source OCCT), il n’y a pas de contamination copyleft. AG doit vérifier que l’intégration ne modifie pas le code source d’OpenCascade.js lui-même.

## **9.3 Architecture pipeline 3D à implémenter (v3.1)**

Le pipeline de visualisation STEP pour Aegis suit ce flux :

| Étape | Composant | Détail technique | Garde-fou |
| :---- | :---- | :---- | :---- |
| **E1** | **Upload STEP** | Drag-and-drop fichier .step/.stp dans \<StepViewer /\>. Validation MIME type \+ taille max 50 Mo. | JAMAIS upload vers serveur. 100% client-side. Fichier reste en mémoire navigateur. |
| **E2** | **Tessellation WASM** | OpenCascade.js lit le STEP, génère un mesh triangulé (vertices \+ faces). Exécution dans un Web Worker pour ne pas bloquer le UI thread. | Timeout 30s max. Si échec, message utilisateur « fichier trop complexe » avec suggestion de défeaturing. |
| **E3** | **Rendu Three.js** | React Three Fiber affiche le mesh dans un \<Canvas\>. OrbitControls (rotation/zoom/pan). PBR materials pour rendu réaliste. | LOD adaptatif : réduire la tessellation sur mobile/tablette. Détection WebGL 2.0 minimum. |
| **E4** | **Annotations Aegis** | Overlay HTML via drei \<Html\> sur les zones réglementaires : marquage CE, zones batteries, points de sécurité machines, substances REACH. | Phase P2 (v3.2). Pas en v3.1. Le mapping STEP entités ↔ exigences EU nécessite un modèle de données dédié. |
| **E5** | **Export rapport 3D** | Capture screenshot 3D intégrée dans les rapports PDF Aegis. Canvas.toDataURL() \+ intégration PDF. | Phase P2/P3. Qualité capture dépend de la résolution du canvas. |

## **9.4 Brief nocturne modèle — Ticket FEAT-3D-STEP-VIEWER (v3.1)**

Ci-dessous le brief nocturne type pour AG quand le développement 3D démarrera en mars 2026\. NE PAS EXÉCUTER avant la livraison réussie de v3.0-alpha.

| Champ BRIEF | Contenu |
| :---- | :---- |
| **OBJECTIF** | Créer le composant \<StepViewer /\> autonome : chargement fichier STEP, tessellation WASM, rendu 3D interactif |
| **SCOPE — Créer** | src/components/3d/StepViewer.tsx (composant principal) | src/components/3d/useStepLoader.ts (hook WASM) | src/components/3d/StepScene.tsx (scène R3F) | src/components/3d/StepControls.tsx (UI contrôles) |
| **SCOPE — Modifier** | package.json (+4 dépendances 3D) | src/App.tsx (route /viewer ou intégration dashboard) |
| **NE PAS TOUCHER** | api/gemini-proxy.ts | vercel.json | .env | Composants auth/Stripe/dashboard existants |
| **INPUTS** | Ce document de convergence (AEGIS-CONV-VGE3D-20260214) | Fichier STEP test (fourni par JP) | Wireframe v3 pour style visuel |
| **CRITÈRES D’ACCEPTATION** | \[ \] Fichier STEP chargé et affiché en 3D | \[ \] Rotation/zoom/pan fonctionnels | \[ \] Zéro upload serveur | \[ \] Taille max 50 Mo respectée | \[ \] npm run build sans erreur | \[ \] Mobile : dégradation gracieuse si pas de WebGL 2.0 |
| **CONTRAINTES** | React 19 \+ Vite \+ TypeScript | Tailwind pour styling | WASM dans Web Worker | Pas de dépendance hors liste validée (section 9.2) | LGPL respecté : zéro modification du code OpenCascade.js |

## **9.5 Checklist V\&V pour AG — review post-implémentation**

Après l’exécution du brief nocturne 3D, AG et Claude appliqueront la checklist suivante :

| \# | Vérification | Critère GO | Action NO-GO |
| :---- | :---- | :---- | :---- |
| **V1** | **Sécurité : pas de stockage serveur** | Zéro appel API upload. Fichier STEP reste en mémoire client uniquement. | Supprimer tout code upload côté serveur |
| **V2** | **Performance : chargement \< 10s** | Fichier STEP standard (\< 20 Mo) s’affiche en moins de 10 secondes. | Optimiser tessellation, ajouter LOD, augmenter timeout |
| **V3** | **Licence : LGPL non contaminé** | opencascade.js importé en WASM dynamique, zéro modification du code source OCCT. | Refactorer l’intégration pour dynamic linking strict |
| **V4** | **UX : fallback 2D** | Si WebGL non supporté : message clair \+ alternative 2D (screenshot). | Ajouter détection capabilities et fallback |
| **V5** | **Build : zéro régression** | npm run build sans erreur. Tests existants passent. Dashboard/auth/Stripe non impactés. | Rollback complet du composant 3D |
| **V6** | **RGPD : mentions mises à jour** | Politique de confidentialité mentionne le traitement client-side des fichiers CAO. | Mettre à jour les mentions avant push |

## **9.6 Valeur business confirmée — Justification tier PREMIUM**

**Décision JP :** La visualisation 3D STEP avec annotations réglementaires est un différenciateur majeur pour le tier PREMIUM (500€/mois). C’est la seule plateforme de conformité EU qui permettrait de voir le produit physique directement lié aux exigences réglementaires. Cette fonctionnalité justifie le ratio de prix 10x entre STANDARD et PREMIUM.

**Action AG :** Intégrer le ticket FEAT-3D-STEP-VIEWER dans le backlog v3.1 avec priorité P1. Estimer 40-60h de développement (3-4 nuits AG \+ review Claude). Démarrage conditionné à la livraison réussie de v3.0-alpha le 27/02/2026.

**VALIDATION**

| Rôle | Nom | Décision |
| :---- | :---- | :---- |
| **Analyse & Rédaction** | Claude Opus 4.6 (Anthropic) | **✅ Analyse validée** |
| **Vérification (AG)** | Google Antigravity (Gemini) | **⏳ Cross-vérification à exécuter** |
| **Validation & Décision** | Jean-Pierre Charles | **✅ NO-GO v3.0 • GO COND. v3.1 web-native** |

*Fin du document — Référence AEGIS-CONV-VGE3D-20260214-V2 — Décision validée JP 14/02/2026 12h25*