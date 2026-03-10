# AUDIT & EXPERTISE — AEGIS v3.1 FUSION

## Document horodaté : 20260216T2327 CET

## Destinataire : Claude Opus (contre-expertise)

## Émetteur : AG Gemini (exécutant) + JP Charles (décideur)

---

## 1. OBJET

Contre-expertise de la fusion v2.6 (PRODUCTION, Brain IA) + v3.0 (LOCALHOST, Light/Glass marketing) vers v3.1 "Expertise Industrielle Stratégique as a Service" (EISaaS).

Ce document consolide les 5 sources de vérité ayant alimenté le plan d'implémentation :

| # | Document | Horodatage | Lignes | Rôle |
|---|----------|-----------|--------|------|
| 1 | `wireframe-homepage-v3-r5.jsx` | 20260216T2250 | 880 | Wireframe UI + i18n source of truth |
| 2 | `GANTT_KANBAN_LIFECYCLE_v3_1_20260216T2220.jsx` | 20260216T2220 | 508 | Planning, V-Gate, Risques, REX |
| 3 | `STRATEGIC_PROPOSAL_v3.1_20260216T2145.jsx` | 20260216T2145 | 657 | Vision, Architecture, Nico feedback |
| 4 | `AG_EXECUTION_BRIEF_v3.1_20260216T2145.md` | 20260216T2145 | 206 | Brief d'exécution 3 phases |
| 5 | `CONTRE_EXPERTISE_DEFINITIVE_20260214_2000.md` | 20260214T2000 | — | Audit historique de référence |

---

## 2. PÉRIMÈTRE DE L'AUDIT

### 2.1 Phase P1B — FUSION v2.6+v3.0 → v3.1

La fusion concerne **10 tâches** identifiées dans le GANTT (phase P1B) :

| # | Tâche | Owner | Critique | Statut |
|---|-------|-------|----------|--------|
| 1 | Copier services/ + data/ vers src/ (0 modif) | AG nuit | ✅ OUI | 🔄 En cours |
| 2 | Créer src/components/brain/AegisChat.tsx (Light/Glass) | AG nuit | ✅ OUI | 🔄 En cours |
| 3 | HeroSection v3.1 : 2 colonnes + Brain IA intégré | AG | ✅ OUI | ○ À faire |
| 4 | TrustBadges : métriques ROI (<30s, -70%, 0, 27+) | AG | ✅ OUI | ○ À faire |
| 5 | ParcoursRD : reformulation angle 'apport' (Nico) | AG | ○ NON | ○ À faire |
| 6 | CookieBanner Light + import App.tsx | AG | ✅ OUI | ○ À faire |
| 7 | Photo JP médaillon dans carte Brain | JP+AG | ○ NON | ○ À faire |
| 8 | Logos clients /public/images/clients/ | JP+AG | ○ NON | ○ À faire |
| 9 | i18n.ts extension Brain FR/EN | AG | ✅ OUI | ○ À faire |
| 10 | V&V fusion Claude Opus (14 critères V-Gate) | Claude | ✅ OUI | ○ À faire |

### 2.2 Fichiers source v2.6 — Audit de dépendances

Tous les fichiers v2.6 ont été vérifiés existants et analysés :

| Fichier v2.6 | Lignes | Destination v3.1 | Transformation |
|---|---|---|---|
| `components/AegisInline.tsx` | 254 | `src/components/brain/AegisChat.tsx` | FUSION (avec AiAssistant) |
| `components/AiAssistant.tsx` | 487 | `src/components/brain/AegisChat.tsx` | FUSION (avec AegisInline) |
| `services/geminiService.ts` | 112 | `src/services/geminiService.ts` | COPIE EXACTE |
| `services/regulationKnowledgeService.ts` | 137 | `src/services/regulationKnowledgeService.ts` | COPIE EXACTE |
| `components/CookieBanner.tsx` | 96 | `src/components/common/CookieBanner.tsx` | ADAPTATION Light/Glass |
| `data/reglements-europeens-2024.json` | — | `src/data/reglements-europeens-2024.json` | COPIE EXACTE |
| `api/gemini-proxy.ts` | 152 | ❌ NE PAS TOUCHER | Vercel serverless |
| `types.ts` | 39 | `src/types.ts` | COPIE PARTIELLE (ChatMessage) |
| `components/icons/*.tsx` | 15 fichiers | `src/components/icons/` | COPIE (3 nécessaires) |
| `vite.config.ts` | 181 | ❌ NE PAS TOUCHER | Dev proxy fonctionnel |

**Chaîne de dépendances critique identifiée :**

```
AegisChat.tsx
  ├── imports hasAIConsent() from CookieBanner.tsx  ← RGPD gate
  ├── imports runQueryStream from geminiService.ts  ← Streaming SSE
  ├── imports enrichPromptWithRegulation from regulationKnowledgeService.ts
  ├── imports ChatMessage from types.ts
  ├── imports PaperAirplaneIcon, SparklesIcon from icons/
  └── uses useLang() hook from LangContext.tsx  ← v3.1 Context (pas de prop lang)
```

---

## 3. WIREFRAME R5 — DELTA R4→R5 AUDITÉ

### 3.1 Nouvelles clés i18n à vérifier (FR + EN)

| Namespace | Clés FR | Clés EN | Status |
|-----------|---------|---------|--------|
| `brain*` | `brainTitle`, `brainPlaceholder`, `brainExample`, `brainResponse`, `brainRegs[8]`, `brainStatus`, `brainCaption` | Idem EN | ✅ Défini dans R5 L84-91, L252-258 |
| `roiMetrics` | 4 objets `{value, label, sub}` | 4 objets EN | ✅ Défini dans R5 L93-98, L259-264 |
| `cookie*` | `cookieTitle`, `cookieText`, `cookieAccept`, `cookieReject`, `cookieMore` | 5 clés EN | ✅ Défini dans R5 L222-224, L384-386 |
| `clientLogos` | 6 strings | 6 strings | ✅ Défini dans R5 L114, L278 |
| `parcours[].apport` | 6 champs | 6 champs EN | ✅ Défini dans R5 L119-143, L282-306 |
| `parcoursTitle1/2` | 2 chaînes + `parcoursSub` | 3 chaînes EN | ✅ Défini dans R5 L116-118, L279-281 |
| `services[].result` | 3 champs | 3 champs EN | ✅ Défini dans R5 L173, L177, L182, L336, L340, L344 |
| `trustCreds` | 6 items (incl. "Config IA Déterministe") | 6 items EN | ✅ Défini dans R5 L107-112, L272-277 |

### 3.2 Design System — Cohérence constants.ts ↔ R5

Le design system R5 (lignes 28-63) est **identique** au `constants.ts` actuel (modifié le 16/02 12:55) :

| Token | R5 | constants.ts | Match |
|-------|-----|-------------|-------|
| `C.bg` | `#f8fafc` | `#f8fafc` | ✅ |
| `C.glassBg` | `rgba(255,255,255,0.72)` | `rgba(255,255,255,0.72)` | ✅ |
| `C.accent` | `#3b82f6` | `#3b82f6` | ✅ |
| `C.gradientHero` | `linear-gradient(170deg, ...)` | `linear-gradient(170deg, ...)` | ✅ |
| `C.shadowLg` | `0 12px 32px ...` | `0 12px 32px ...` | ✅ |

**→ Aucune modification de `constants.ts` requise.**

---

## 4. RISQUES CRITIQUES À AUDITER

### R7 — git push tue le Brain IA (**ÉLEVÉE × Critique**)

**Contexte :** Le site production utilise `components/AegisInline.tsx` (v2.6). L'App.tsx v3.0 n'importe PAS ce composant. Un push = Brain IA disparaît.

**Mitigation :** Intégrer `AegisChat.tsx` dans `HeroSection.tsx` AVANT tout push. V-Gate #3 (Brain IA streaming) est bloquant.

**Vérification requise :** grep dans le bundle final pour `runQueryViaProxy` et `enrichPromptWithRegulation`.

### R8 — Fusion casse le streaming Gemini (**MOYENNE × Critique**)

**Contexte :** `geminiService.ts` utilise un `async function*` generator avec `ReadableStream` reader. Toute modification (même d'imports) peut casser le streaming SSE.

**Mitigation :** COPIE EXACTE de `services/geminiService.ts` → `src/services/geminiService.ts`. 0 modification. Tester le streaming immédiatement après `AegisChat.tsx` créé, avant toute modification UI.

**Vérification requise :** Test en dev (`npm run dev`) → taper une question → vérifier que les tokens arrivent en streaming.

### R3 — AG regressions lors des refactors (**ÉLEVÉE × Majeur**)

**Contexte :** Pattern confirmé : BUG-1 (15/02), REGRESSION-1 (16/02). AG peut oublier des corrections ponctuelles lors des refactors multi-fichiers.

**Mitigation :** REGRESSION-1 (`aria-label` au lieu de `role=presentation`) explicitement documentée dans R5 (ligne 852). V&V systématique Claude post-AG.

---

## 5. ARCHITECTURE CIBLE v3.1

```
src/
├── components/
│   ├── homepage/          ← S0-S9 (base v3.0 — GARDER)
│   │   ├── NavBar.tsx
│   │   ├── HeroSection.tsx      ← MODIFIER (2 colonnes + Brain)
│   │   ├── TrustBadges.tsx      ← MODIFIER (+logos, +ROI, +creds)
│   │   ├── ParcoursRD.tsx       ← MODIFIER (+apport)
│   │   ├── SansAvecAegis.tsx
│   │   ├── ServicesSection.tsx   ← MODIFIER (+result)
│   │   ├── PricingSection.tsx
│   │   ├── ReglementsSection.tsx
│   │   ├── CTASection.tsx
│   │   ├── FooterSection.tsx
│   │   ├── constants.ts          ← NE PAS TOUCHER
│   │   ├── i18n.ts               ← ÉTENDRE (+brain, +roi, +cookie...)
│   │   └── LangContext.tsx       ← NE PAS TOUCHER
│   ├── brain/              ← NOUVEAU
│   │   └── AegisChat.tsx         ← FUSION AegisInline + AiAssistant
│   ├── common/             ← NOUVEAU
│   │   └── CookieBanner.tsx      ← ADAPTÉ v2.6 → Light/Glass
│   └── icons/              ← COPIÉ
│       ├── PaperAirplaneIcon.tsx
│       ├── SparklesIcon.tsx
│       └── XMarkIcon.tsx
├── services/               ← COPIÉ EXACT
│   ├── geminiService.ts
│   └── regulationKnowledgeService.ts
├── data/                   ← COPIÉ EXACT
│   └── reglements-europeens-2024.json
└── types.ts                ← COPIÉ (ChatMessage)

api/                        ← NE PAS TOUCHER (Vercel serverless)
│   └── gemini-proxy.ts
components/                 ← v2.6 LEGACY (ne plus importer depuis src/)
services/                   ← v2.6 LEGACY (copié vers src/)
```

---

## 6. V-GATE P1B — 6 CRITÈRES BLOQUANTS

Pour la phase P1B (fusion), les critères bloquants avant `git push main` sont :

| # | Critère | Commande / Méthode | PASS | FAIL |
|---|---------|-------------------|------|------|
| V1 | Build | `npm run build` | 0 erreur TS | Toute erreur |
| V2 | Secrets | `grep -r "AIzaSy\|supabase\|sk_live" dist/` | 0 résultat | ≥1 secret |
| V3 | Brain IA | Test manuel : question → streaming | Tokens en streaming | Pas de réponse |
| V8 | RGPD | Test : rechargement page | Bandeau cookie apparaît | Absent |
| V10 | ROI | Test visuel | 4 métriques visibles dessus la ligne de flottaison | Absentes |
| V11 | Homepage | Test visuel | Offre EISaaS claire, Brain live, 0 placeholder | Placeholder visible |

---

## 7. QUESTIONS À AUDITER PAR CLAUDE OPUS

### 7.1 Cohérence architecturale

- [ ] Le mapping fichiers source → destination est-il cohérent avec l'arborescence v3.1 ?
- [ ] Les imports entre `src/components/brain/AegisChat.tsx` et les services dans `src/services/` sont-ils corrects ?
- [ ] La chaîne de dépendances `CookieBanner → hasAIConsent → AegisChat` est-elle correctement définie ?

### 7.2 Risques techniques

- [ ] La copie exacte de `geminiService.ts` préserve-t-elle le streaming SSE ?
- [ ] L'utilisation de `useLang()` au lieu de `lang` prop dans AegisChat est-elle compatible avec le React Context v3.1 ?
- [ ] Les tokens de design `C.*` sont-ils tous définis dans `constants.ts` sans gap ?

### 7.3 Conformité RGPD

- [ ] Le texte du CookieBanner ne mentionne plus Google/Gemini (remplacé par "serveurs proxy sécurisés") ?
- [ ] `hasAIConsent()` bloque-t-il effectivement les requêtes Gemini si refusé ?
- [ ] Le consentement est-il persisté et vérifié côté client ?

### 7.4 i18n complétude

- [ ] Toutes les clés R5 (brain*, roiMetrics, cookie*, clientLogos, parcours[].apport, services[].result) sont-elles prévues en FR et EN ?
- [ ] Les textes parcours angle "apport" sont-ils factuellement exacts par rapport au CV JP ?

### 7.5 Régression connue

- [ ] REGRESSION-1 (`aria-label` au lieu de `role=presentation`) est-elle explicitement vérifiée dans le code ?
- [ ] Le pattern R3 (AG oublie les fixes lors des refactors) est-il mitigé par la V&V systématique ?

---

## 8. HISTORIQUE AUDIT

| Date | Document | Résultat |
|------|----------|---------|
| 14/02/2026 | `CONTRE_EXPERTISE_DEFINITIVE_20260214_2000.md` | ✅ 13 fichiers validés, OBS-1→OBS-4 résolus |
| 16/02/2026 | Scan visuel prod vs localhost | ✅ Brain IA identifié comme orphelin v3.0 |
| 16/02/2026 | Proposition stratégique v3.1 | ✅ VALIDÉE par JP |
| 16/02/2026 | **CE DOCUMENT** — Audit P1B fusion | ⏳ EN ATTENTE Claude Opus |

---

## 9. SIGNATURE

| Rôle | Acteur | Statut |
|------|--------|--------|
| Rédacteur | AG Gemini (Antigravity) | ✅ 20260216T2327 |
| Décideur | Jean-Pierre Charles | ⏳ |
| Contre-expert | Claude Opus | ⏳ EN ATTENTE |

---

*AEGIS CIRCULAR — Registre de traçabilité v3.1 — Document horodaté pour contre-expertise*
