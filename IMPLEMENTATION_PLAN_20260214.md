# Implementation Plan - Homepage v3.0-alpha (S0-S4)

# Corrigé après contre-expertise — 14/02/2026 16:44

## Source de Vérité
>
> **`wireframe-homepage-v3-r3.jsx` (R3) est la source de vérité design.**
> R3 supersède R2 (ajout i18n FR/EN, correction encodage UTF-8, architecture données/présentation séparées).
> Validé JP 14/02/2026.

## Décisions Autonomes Documentées

| # | Décision | Justification |
|---|----------|---------------|
| D1 | **Emojis** (pas lucide-react) | Wireframe R3 utilise exclusivement des emojis. lucide-react disponible mais non utilisé dans R3. |
| D2 | **React Context** pour i18n | Le wireframe monolithique utilise useState local. L'éclatement en 5+ composants nécessite un partage d'état. Context est la solution la plus propre sans lib externe interdite. |
| D3 | **Valeurs Tailwind arbitraires** | `bg-[#0f172a]` etc. pour respecter la palette exacte du wireframe sans modifier tailwind.config.js. |

## Stratégie Responsive (Mobile-First)

- **Mobile (défaut)** : Layouts en colonne (`flex-col`), texte adapté, composants full-width
- **Tablette (`md:`)** : Grids 2 colonnes, tailles de texte intermédiaires
- **Desktop (`lg:`)** : Layout final wireframe (flex-row, max-width, espacement large)
- Tous les `flex-wrap: "wrap"` du wireframe inline → convertis en `flex-wrap` + breakpoints Tailwind

## Proposed Changes

### Configuration

#### [MODIFY] `index.html`

- Ajouter Google Fonts CDN link (DM Sans + Playfair Display).

### Shared Files (New)

#### [NEW] `src/components/homepage/constants.ts`

- Palette `C` (12 couleurs) exportée
- `sectionColors` array exporté
- Types utilitaires

#### [NEW] `src/components/homepage/i18n.ts`

- Dictionnaire i18n FR/EN complet (repris de R3)
- Types TypeScript (`Lang`, `I18nStrings`, etc.)
- Export typé pour autocomplétion

#### [NEW] `src/components/homepage/LangContext.tsx`

- React Context + Provider pour `lang` state
- `useLang()` custom hook
- `LangProvider` wrapping les composants homepage dans App.tsx

### Components (New) — `src/components/homepage/`

#### [NEW] `NavBar.tsx`

- Logo, Links, CTA, Login, Lang Toggle
- Sticky positioning, responsive layout
- **a11y** : `aria-label` sur boutons CTA, Login, et toggle langue

#### [NEW] `HeroSection.tsx`

- H1 (Playfair), Subtext, Company badges, CTAs, Dashboard Preview Mockup
- Gradients via Tailwind arbitrary values
- **a11y** : `aria-label` sur boutons CTA, rôle `img` pour le dashboard preview

#### [NEW] `TrustBadges.tsx`

- 5 métriques clés (grid responsive) + diplômes/credentials
- **a11y** : structure sémantique `<section>` avec `aria-labelledby`

#### [NEW] `ParcoursRD.tsx`

- Timeline verticale 6 postes + chaîne de valeur horizontale
- **a11y** : `<ol>` sémantique pour la timeline, `aria-label` sur la chaîne de valeur

#### [NEW] `SansAvecAegis.tsx`

- 2 cartes comparatives (rouge = Sans, vert = Avec)
- **a11y** : `<ul>` sémantiques, contraste suffisant rouge/vert

### Integration

#### [MODIFY] `App.tsx`

- Import `LangProvider` + tous les composants homepage
- Route `/` → Homepage composée avec `LangProvider` wrapper

## Grille V&V — Mapping Vérification (Protocole v2)

| # | Vérification | Action dans ce plan | Quand |
|---|-------------|---------------------|-------|
| V1 | **SÉCURITÉ** | Vérifier : aucun secret, aucune clé API, aucun `VITE_` prefix suspect dans les fichiers produits | Avant commit |
| V2 | **COHÉRENCE** | Chaque composant comparé visuellement au wireframe R3 + palette `C` du constants.ts | Par composant |
| V3 | **QUALITÉ** | Pas de code mort, imports corrects, TypeScript strict, pas de `console.log` | Par composant |
| V4 | **RGPD** | Non applicable pour S0-S4 (pas de formulaire, pas de tracking). À vérifier en S5-S9. | N/A |
| V5 | **RESPONSIVE** | Test mobile-first : défaut → `md:` → `lg:` breakpoints sur chaque composant | Par composant |
| V6 | **BUILD** | `npm run build` sans erreur ni warning TypeScript | Fin de session |

## Ordre d'Exécution

1. `constants.ts` — palette et types (fondation)
2. `i18n.ts` — dictionnaire bilingue (fondation)
3. `LangContext.tsx` — Context React pour partage lang
4. `index.html` — ajouter fonts CDN
5. `NavBar.tsx` — composant le plus simple, valide le setup
6. `HeroSection.tsx` — le plus impactant visuellement
7. `TrustBadges.tsx` — données factuelles
8. `ParcoursRD.tsx` — timeline complexe
9. `SansAvecAegis.tsx` — comparatif
10. `App.tsx` — intégration et test
11. `npm run build` — vérification V6
