# BRIEF EXÉCUTION AG — v3.1 FUSION
## 20260216T2145 — Claude Opus → Antigravity Gemini 3 Flash

---

## CONTEXTE CRITIQUE

**SITUATION :** Deux versions du site coexistent. La PRODUCTION (jeanpierrecharles.com) a le Brain IA fonctionnel mais un design CV/dark obsolète. Le LOCALHOST (v3.0-alpha) a le design Light/Glass marketing mais AUCUN Brain IA. Le prochain `git push main` tuera le Brain en production.

**OBJECTIF :** Fusionner les deux en v3.1 = "Expertise Industrielle Stratégique as a Service". Le visiteur doit comprendre en 5 secondes : un ingénieur R&D de 32 ans + une IA réglementaire = conformité EU pilotée.

**DEADLINE :** 27 février 2026 (v3.0-alpha deploy)

---

## ARCHITECTURE CIBLE v3.1

```
C:\Projects\jeanpierrecharles\
├── src/
│   ├── components/
│   │   ├── homepage/          ← BASE v3.0 (GARDER tel quel sauf HeroSection)
│   │   │   ├── constants.ts       ← Design system Light/Glass (NE PAS MODIFIER)
│   │   │   ├── i18n.ts           ← Dictionnaire FR/EN (ÉTENDRE pour Brain)
│   │   │   ├── HeroSection.tsx   ← MODIFIER : 2 colonnes + Brain IA intégré
│   │   │   ├── TrustBadges.tsx   ← MODIFIER : ajouter métriques ROI + logos
│   │   │   ├── ParcoursRD.tsx    ← MODIFIER : angle "apport" pas "poste"
│   │   │   └── ... (autres sections INCHANGÉES)
│   │   ├── brain/             ← NOUVEAU répertoire
│   │   │   └── AegisChat.tsx     ← Adapté de AegisInline.tsx + AiAssistant.tsx
│   │   └── common/            ← NOUVEAU répertoire
│   │       └── CookieBanner.tsx  ← Adapté de components/CookieBanner.tsx
│   ├── services/              ← NOUVEAU répertoire
│   │   ├── geminiService.ts      ← COPIE EXACTE de services/geminiService.ts
│   │   └── regulationKnowledgeService.ts ← COPIE EXACTE
│   └── data/                  ← NOUVEAU répertoire
│       └── reglements-europeens-2024.json ← COPIE EXACTE
├── api/gemini-proxy.ts        ← GARDER (serverless Vercel)
├── App.tsx                    ← MODIFIER : ajouter CookieBanner import
└── public/
    ├── jpc.jpg                ← GARDER (photo existante)
    └── images/clients/        ← CRÉER logos entreprises
```

---

## PHASE 1 — BRAIN IA INTEGRATION (P0, ~2h)

### Étape 1.1 : Copier les services (0 modification)
```bash
# Dans PowerShell
mkdir -p src/services
mkdir -p src/data
cp services/geminiService.ts src/services/geminiService.ts
cp services/regulationKnowledgeService.ts src/services/regulationKnowledgeService.ts
cp data/reglements-europeens-2024.json src/data/reglements-europeens-2024.json
```

### Étape 1.2 : Créer AegisChat.tsx
**Source :** `components/AegisInline.tsx` + `components/AiAssistant.tsx`
**Destination :** `src/components/brain/AegisChat.tsx`

**Règles de transformation :**
- Importer depuis `../../services/geminiService` (nouveau chemin)
- Importer depuis `../../services/regulationKnowledgeService` (nouveau chemin)
- Remplacer TOUS les styles dark par les tokens de `../homepage/constants.ts` :
  - Background: utiliser `C.glassBg` + `C.glassBlur` au lieu du dark
  - Texte: `C.text` (#1e293b) au lieu de blanc
  - Bordures: `C.glassBorder` au lieu de bordures sombres
  - Badges réglements: garder les couleurs par catégorie mais fond clair
  - Chat input: fond blanc, bordure glass, placeholder gris
- Le composant doit accepter une prop `mode?: "full" | "mini"`
  - `mini` = pour le Hero (hauteur fixe ~350px, sans header, exemple pré-chargé)
  - `full` = pour la page plateforme future (pleine hauteur, avec header)
- Garder le streaming SSE intact (ne pas casser le reader)
- Garder les 8 badges réglements cliquables
- Garder les exemples de questions

### Étape 1.3 : Modifier HeroSection.tsx
**Layout 2 colonnes :**

```
┌─────────────────────────────────────────────────────────┐
│  NavBar (sticky)                                         │
├────────────────────────┬────────────────────────────────┤
│                        │                                │
│  Badge "27 États UE"   │  ┌─────────────────────────┐  │
│                        │  │ 🧠 ASSISTANT AEGIS       │  │
│  L'ingénieur R&D       │  │                         │  │
│  qui a conçu vos       │  │  Exemple : Battery Reg  │  │
│  systèmes,             │  │  "Votre pack Li-ion..." │  │
│  pilote votre          │  │                         │  │
│  conformité EU.        │  │  [badges réglements]    │  │
│                        │  │                         │  │
│  32 ans · 6 groupes    │  │  ● Prêt — Posez votre  │  │
│                        │  │    question             │  │
│  [Essayer] [Tarifs]    │  └─────────────────────────┘  │
│                        │                                │
│  ✓ <30s  ✓ -70%  ✓ 0€ │                                │
│                        │                                │
├────────────────────────┴────────────────────────────────┤
```

**Code guidance :**
- Garder le contenu texte actuel de HeroSection (headline, description, CTAs)
- Remplacer le `div` du dashboard preview par `<AegisChat mode="mini" />`
- Ajouter ligne de métriques ROI sous les CTAs
- Grid responsive : 2 colonnes desktop, 1 colonne mobile (Brain sous le texte)
- Photo JP : médaillon 48px border-radius:50% en haut à gauche de la carte Brain

### Étape 1.4 : Test
```bash
npm run dev
# Vérifier localhost:5173 :
# ✓ Hero affiche 2 colonnes
# ✓ Brain IA à droite avec badges réglements
# ✓ Taper une question → réponse streaming
# ✓ Design Light/Glass cohérent
```

---

## PHASE 2 — MÉTRIQUES ROI + PHOTO (P0, ~1h)

### Étape 2.1 : TrustBadges.tsx — Ajouter métriques ROI
Ajouter au-dessus des stats existantes une ligne de 4 métriques :
- `<30s` — Analyse d'impact réglementaire (vs 2-4 semaines)
- `-70%` — Coût veille réglementaire (50€/mois vs 1500€/jour)
- `0` — Non-conformité en production (anticipée dès conception)
- `27+` — États EU couverts (+ DOM-TOM, Canaries, Açores)

Style : chiffres grands (fontSize 24px, fontWeight 900), couleur accent, fond glass card.

### Étape 2.2 : Logos clients
Créer `/public/images/clients/` — si pas d'images SVG disponibles, utiliser les noms texte stylisés comme en production v2.6 (section "Expertise Industrielle Prouvée").

### Étape 2.3 : ParcoursRD.tsx — Angle "apport"
Reformuler chaque expérience dans i18n.ts :
- Autoliv: "Industrialisé les volants airbag nouvelle gen pour Toyota CH-R Europe 2024 et BMW New Klass"
- Saft: "Développé les batteries TGV M 1500V et batteries marines 3MWh pour navires"
- Forsee: "Conçu les packs batteries bus électriques ZEN de la cellule au véhicule"
- Faurecia: "Piloté 16 ans de projets planches de bord pour Renault, Peugeot, Citroën, DS7, Volvo, Ford, Opel"
- Bombardier: "Optimisé les lignes d'assemblage trains régionaux en lean manufacturing"
- Emerson: "Dirigé le bureau d'études soudage ultrasons industriel et machines spéciales"

---

## PHASE 3 — RGPD + POLISH (P1, ~1h)

### Étape 3.1 : CookieBanner
Copier `components/CookieBanner.tsx` → `src/components/common/CookieBanner.tsx`
- Adapter les couleurs au Light theme
- Corriger le texte : remplacer toute mention de Google par "serveurs proxy sécurisés"
- Résoudre l'antinomie RGPD : le banner doit dire "Ce site utilise uniquement des cookies fonctionnels nécessaires au fonctionnement de la plateforme. L'assistant IA traite vos questions via un proxy sécurisé sans collecte de données personnelles."

### Étape 3.2 : App.tsx
Ajouter l'import CookieBanner :
```tsx
import CookieBanner from "./src/components/common/CookieBanner";
// ... dans le return, après <FooterSection />
<CookieBanner />
```

### Étape 3.3 : Vérification responsive
Tester à 375px, 768px, 1024px, 1440px.

### Étape 3.4 : i18n
Vérifier que TOUTES les nouvelles chaînes ont FR + EN dans i18n.ts.

---

## CRITÈRES V-GATE (validation Claude Opus AVANT git push)

| # | Critère | Bloquant |
|---|---------|----------|
| V1 | Brain IA chat fonctionnel dans HeroSection avec streaming Gemini | OUI |
| V2 | Métriques ROI visibles above-the-fold | OUI |
| V3 | Photo JP visible dans carte Brain ou médaillon | NON |
| V4 | Cookie banner RGPD affiché au premier chargement | OUI |
| V5 | i18n FR/EN complet pour toutes nouvelles sections | OUI |
| V6 | Design system Light/Glass cohérent (constants.ts) | OUI |
| V7 | REGRESSION-1 préservé (aria-label, pas role=presentation) | OUI |
| V8 | Responsive mobile OK (375px min) | OUI |
| V9 | Aucun import depuis components/ v2.6 dans App.tsx | OUI |
| V10 | npm run build sans erreur TypeScript | OUI |

---

## FICHIERS NE PAS TOUCHER

- `src/components/homepage/constants.ts` — design tokens source de vérité
- `api/gemini-proxy.ts` — serverless Vercel fonctionnel
- `vite.config.ts` — proxy dev fonctionnel
- `.env.local` — clé API Gemini
- `vercel.json` — security headers
- `.gitignore` — règles sécurité

---

## TRAÇABILITÉ
- Ce brief est dérivé de : STRATEGIC_PROPOSAL_v3.1_20260216T2145.jsx
- Sources : Scan visuel localhost+prod (16/02), Feedback Nico (10/02), RAG ChatGPT (13-15/02), Contre-expertise (14/02), Conv. supprimée 06/02 (reconstituée)
- Destinataire : AG Gemini 3 Flash — session nuit 16-17/02/2026
- Validation : Claude Opus post-exécution
- REGISTRE : AEGIS_REGISTRE_TRACABILITE à mettre à jour après V-Gate
