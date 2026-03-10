# CONTRE-EXPERTISE DÉFINITIVE — Fichiers Fondation AG
**Claude Opus 4.6 — 14/02/2026 20h00**
**Scope : Analyse binaire des 3 fichiers .ts/.tsx uploadés par JP**

---

## VERDICT : ✅ GO — 3/3 fichiers validés

---

## CORRECTION — C2 était un FAUX POSITIF

Mon alerte C2 (encodage cassé) était **erronée**. Explication :

L'affichage des fichiers dans l'interface claude.ai rendait les caractères UTF-8 comme du mojibake (`MÃ©catronique` au lieu de `Mécatronique`). C'est un artefact de rendu côté interface, pas un problème dans les fichiers eux-mêmes.

**Preuve par analyse binaire :**
```
Fichier i18n.ts : UTF-8 valide
Caractères accentués littéraux trouvés : 102
Unicode escapes trouvés : 0
Patterns mojibake trouvés : 0
```

AG a utilisé des caractères UTF-8 littéraux (`é`, `è`, `ç`, `ê`, `î`, `à`) au lieu des unicode escapes (`\u00e9`). Les deux approches sont valides. Le pipeline git → GitHub → Vercel gère parfaitement l'UTF-8 littéral. Aucune correction nécessaire.

**→ C2 reclassé : ~~🔴 CRITIQUE~~ → ✅ FAUX POSITIF — encodage correct**

---

## ANALYSE FICHIER PAR FICHIER

### constants.ts (39 lignes) — ✅ PARFAIT

| Vérification | Résultat |
|---|---|
| 16 couleurs hex | ✅ Toutes présentes et conformes R3 |
| Palette identique R3 | ✅ #0f172a, #1e293b, #162032... tous vérifiés |
| sectionColors[10] | ✅ Mapping S0-S9 correct |
| FONT_LINK | ✅ URL Google Fonts CDN complète (DM Sans + Playfair Display) |
| Export nommé | ✅ `export const C`, `export const sectionColors`, `export const FONT_LINK` |
| Commentaires | ✅ Rôle de chaque couleur documenté |

Aucune anomalie.

### i18n.ts (229 lignes) — ✅ CONFORME R3

| Vérification | Résultat |
|---|---|
| Encodage | ✅ UTF-8 valide, 102 caractères accentués corrects |
| É dans navSub | ✅ `MÉCATRONIQUE` |
| é dans heroH1a | ✅ `ingénieur` |
| ç dans heroH1b | ✅ `conçu` |
| è dans heroH1b | ✅ `systèmes` |
| î dans chaîne | ✅ `CHAÎNE` |
| Citroën | ✅ Tréma préservé |
| Açores | ✅ Cédille préservée |
| FR parcours 6 entrées | ✅ Autoliv → Emerson |
| EN parcours 6 entrées | ✅ Traductions complètes |
| Couleurs via import C | ✅ `color: C.accent`, `C.rose`, etc. |
| heroPreviewLines FR/EN | ✅ 5 lignes chacune avec couleurs |
| Type I18nStrings exporté | ✅ `export type I18nStrings = typeof i18n.fr` |
| Clés S0-S4 | ✅ Toutes présentes FR + EN |
| Clés S5-S9 | ⏳ Absentes (attendu — session nuit) |

### LangContext.tsx (31 lignes) — ✅ CONFORME avec 1 manque mineur

| Vérification | Résultat |
|---|---|
| LangProvider | ✅ FC avec children ReactNode |
| useLang() hook | ✅ Avec guard `throw Error` si hors Provider |
| État par défaut `"fr"` | ✅ |
| Objet value `{lang, setLang, t}` | ✅ Le `t` est calculé `i18n[lang]` — ergonomique |
| Import de Lang + i18n | ✅ |
| **useEffect document.lang** | ❌ **Absent** |

---

## SEULE ACTION REQUISE

### M2 — Ajouter useEffect dans LangContext.tsx

**Instruction pour AG :**

```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
//                                                     ^^^^^^^^^ ajouter

// Dans LangProvider, après useState :
useEffect(() => {
    document.documentElement.lang = lang;
}, [lang]);
```

**Impact si non corrigé :** Les lecteurs d'écran prononceront le contenu français avec un moteur anglais. Google indexera mal la langue. Non bloquant pour le build mais dégradant pour l'accessibilité et le SEO.

**Quand corriger :** AG peut l'ajouter au début de la session nuit (30 secondes de modification) ou pendant l'implémentation S5-S9. Également ajouter `<html lang="fr">` dans index.html lors de l'ajout des fonts Google.

---

## STATUT FINAL CONSOLIDÉ — Toutes anomalies

| # | Sévérité | Statut final | Commentaire |
|---|---|---|---|
| C1 | ~~🔴~~ | ✅ ACCEPTÉ | Architecture import C directe = valide, pas de cycle |
| C2 | ~~🔴~~ | ✅ FAUX POSITIF | Encodage UTF-8 correct — artefact rendu claude.ai |
| M1 | 🟡 | ⏳ EN ATTENTE | 3 fichiers fondation à ajouter au SESSION_REPORT |
| M2 | 🟡 | ⚠️ À CORRIGER | useEffect document.lang manquant — instruction donnée |
| M3 | 🟡 | ⏳ EN ATTENTE | "S5-S8" → "S5-S9" dans SESSION_REPORT |
| M4 | 🟡 | ⏳ EN ATTENTE | Exclusions wireframe-only dans BRIEF nuit |

---

## RECOMMANDATIONS SESSION NUIT 14→15/02

### Pré-requis avant lancement

1. **M2** — Corriger LangContext.tsx (ajout useEffect, 30 secondes)
2. **index.html** — Ajouter `<html lang="fr">` + `<link>` fonts Google
3. **Charger dans AG Brain :** wireframe R3 + BRIEF correctif + ce rapport

### Scope nuit : S5-S9

| # | Fichier | Complexité | Durée |
|---|---|---|---|
| 1 | i18n.ts (ajout clés S5-S9) | Moyenne | 30 min |
| 2 | CTASection.tsx | Basse | 15 min |
| 3 | FooterSection.tsx | Moyenne | 30 min |
| 4 | ServicesSection.tsx | Moyenne | 30 min |
| 5 | ReglementsSection.tsx | Moyenne | 30 min |
| 6 | PricingSection.tsx | **Haute** | 60 min |
| 7 | App.tsx (ajout S5-S9) | Basse | 15 min |
| 8 | npm run build + test | — | 30 min |
| | **TOTAL** | | **~4h** |

### Points d'attention spécifiques nuit

**PricingSection.tsx (le plus complexe) :**
- État local `activeTier` (useState, pas besoin de context)
- Badges positionnés en absolu (`POPULAIRE`, `EXPERTISE`)
- Animation `scale(1.02)` sur le tier sélectionné
- Affichage prix annuel avec remise `-17%`
- NE PAS implémenter le "Tunnel de conversion" (annotation wireframe)

**i18n.ts S5-S9 :**
- Copier les textes FR et EN directement depuis le wireframe R3 (lignes 100-175 FR, 262-322 EN)
- Maintenir le même pattern : textes + `color: C.xxx` pour les éléments colorés
- Mettre à jour le type `I18nStrings` (automatique via `typeof i18n.fr`)

**Exclusions wireframe (M4) :**
- Barre titre "WIREFRAME v3.0-alpha R3"
- Labels sections (S5·, S6·, S7·, S8·, S9·)
- Bloc "DELTA R2→R3"
- "TUNNEL DE CONVERSION" dans Pricing
- `sectionTag()` function

### Review matin 15/02 — Checklist V&V élargie

- V1 SÉCURITÉ : aucun secret/clé dans les .tsx
- V2 COHÉRENCE : chaque composant visuellement vs R3
- V3 QUALITÉ : TS strict, imports propres, pas de console.log
- V4 RGPD : N/A pour S5-S9
- V5 RESPONSIVE : breakpoints mobile/md/lg
- V6 BUILD : `npm run build` propre
- V7 i18n : toggle FR/EN fonctionnel sur S0-S9
- V8 ENCODAGE : ~~vérifier~~ ✅ déjà validé — UTF-8 correct
- V9 a11y : `<html lang>`, aria-labels, skip-to-content

**Verdict attendu si V1-V9 passent :** GO → `git push main` → Vercel deploy → live sur jeanpierrecharles.com
