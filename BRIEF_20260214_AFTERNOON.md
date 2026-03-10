# BRIEF_20260214_AFTERNOON.md
# ═══════════════════════════════════════════════════════════════
# AEGIS v3.0-alpha · Session après-midi 14/02/2026
# Rédigé par Claude Opus 4.6 · Validé JP 14/02/2026
# ═══════════════════════════════════════════════════════════════

## CONTEXTE
- **Commit actuel :** v2.6.0 (c2c532b) sur `main`
- **Cible :** v3.0-alpha B2B — **27/02/2026** (13 jours restants)
- **Stack :** React 19 + Vite + TypeScript + Tailwind CDN
- **Hébergement :** Vercel (auto-deploy via git push main)
- **DNS :** Gandi.net → jeanpierrecharles.com

## OBJECTIF — SESSION APRÈS-MIDI
Implémenter les **sections S0 à S4** de la homepage v3.0-alpha B2B
conformément au **wireframe R2** (source de vérité design fourni).

Priorité : construire le **above the fold** complet — ce que le visiteur
voit AVANT de scroller (Nav + Hero + Trust + début Parcours).

## SCOPE — Fichiers à créer

| Fichier | Type | Description |
|---------|------|-------------|
| `src/components/homepage/NavBar.tsx` | NEW | Navigation sticky responsive |
| `src/components/homepage/HeroSection.tsx` | NEW | Hero R&D × IA avec dashboard mockup |
| `src/components/homepage/TrustBadges.tsx` | NEW | 5 métriques crédibilité + diplômes |
| `src/components/homepage/ParcoursRD.tsx` | NEW | Timeline 6 postes + chaîne de valeur |
| `src/components/homepage/SansAvecAegis.tsx` | NEW | Comparatif Sans/Avec |

## SCOPE — Fichiers à modifier

| Fichier | Modification |
|---------|-------------|
| `src/App.tsx` | Ajouter route `/` avec les 5 composants homepage |
| `index.html` | Ajouter Google Fonts CDN (DM Sans + Playfair Display) |

## ⛔ NE PAS TOUCHER

- `api/gemini-proxy.ts` — proxy sécurisé Gemini (déjà live)
- `vercel.json` — configuration Vercel
- `.env` / `.env.local` — secrets
- `src/components/AegisInline.tsx` — assistant IA existant
- `src/components/CookieBanner.tsx` — RGPD existant
- Tout fichier dans `api/`

## INPUTS DE RÉFÉRENCE

| Fichier | Rôle |
|---------|------|
| `wireframe-homepage-v3-r2.jsx` | **SOURCE DE VÉRITÉ DESIGN** — suivre fidèlement |
| `VizuGraphicEngine3D_Convergence_AG.docx` | Contexte 3D (NO-GO v3.0, info seulement) |

## PALETTE COULEURS (reprendre de v2.6.0 + wireframe R2)

```typescript
const C = {
  navy: "#0f172a",       // fond principal
  navyLight: "#1e293b",  // cards
  navyMid: "#162032",    // sections alternées
  slate: "#334155",      // bordures
  slateLight: "#64748b", // texte secondaire
  slateMuted: "#94a3b8", // texte tertiaire
  white: "#f8fafc",      // texte principal
  accent: "#3b82f6",     // bleu CTA
  gold: "#f59e0b",       // or badges
  emerald: "#10b981",    // vert succès
  rose: "#f43f5e",       // rouge erreur
  copper: "#c2956a",     // cuivre parcours
  bg: "#080e1a",         // fond page
};
```

## TYPOGRAPHIE

- **Body :** DM Sans (Google Fonts) — 400, 500, 600, 700, 800
- **Headings :** Playfair Display (Google Fonts) — 400, 600, 700
- Charger via CDN dans `index.html` :
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet">
```

## DONNÉES CV VÉRIFIÉES (source wireframe R2)

### Parcours R&D (6 postes chronologiques)
1. **2020–2025** · Autoliv · Automobile/ADAS · Ingénieur R&D Mécatronique Sénior
   - Programmes Toyota, BMW — Volants airbag nouvelle génération, ADAS, UNECE R155/R156
2. **2017–2020** · Saft (TotalEnergies) · Énergie/Batteries · Ingénieur Systèmes Batteries
   - Batteries TGV M (1500V), batteries marines (3MWh) — EN 45545
3. **2015–2017** · Forsee Power · Mobilité Électrique · Ingénieur Développement Produit
   - Batteries bus électriques ZEN — UN 38.3
4. **1999–2015** · Faurecia · Automobile/Intérieurs · Responsable Développement & Industrialisation
   - 16 ans — Planches de bord mécatroniques Renault, Peugeot, Citroën, DS7, Volvo, Ford, Opel
5. **1995–1999** · Bombardier Transport · Ferroviaire · Ingénieur Méthodes & Industrialisation
   - Lean manufacturing trains régionaux
6. **1993–1995** · Emerson (Branson) · Équipements Industriels · Responsable Bureau d'Études
   - R&D soudage ultrasons industriel

### Métriques Trust
- 32 ans de R&D industrielle (Conception → Industrialisation → Série)
- 6 groupes internationaux (Autoliv · Faurecia · Saft · Forsee · Bombardier · Emerson)
- 27+ États membres UE couverts (+ DOM-TOM, Canaries, Açores, Madère, Réunion)
- 5 secteurs mécatroniques (Auto · Batteries · Ferroviaire · MedTech · Défense)
- 50+ programmes véhicules (Toyota · BMW · DS7 · Renault · Volvo · Peugeot...)

### Formations
- 🎓 MSc Advanced Manufacturing (Coventry UK)
- 🎓 Management Technologique (Centrale Paris)
- 🎓 Digital Transformation (EIT Digital 2025)

## CRITÈRES D'ACCEPTATION

- [ ] Chaque composant est un fichier `.tsx` autonome dans `src/components/homepage/`
- [ ] Tailwind CDN classes uniquement (pas de CSS custom, pas de styled-components)
- [ ] Responsive mobile-first (sm/md/lg breakpoints Tailwind)
- [ ] Textes en français, données CV vérifiées ci-dessus
- [ ] Zéro import de librairie externe non listée ci-dessous
- [ ] `npm run build` sans erreur
- [ ] Pas de `console.log` ni code de debug
- [ ] Accessibilité : `aria-label` sur les boutons, contraste suffisant

## LIBRAIRIES AUTORISÉES

| Package | Déjà installé ? | Usage |
|---------|-----------------|-------|
| `react` / `react-dom` | ✅ Oui | Framework |
| `lucide-react` | ✅ Oui | Icônes (si besoin) |
| `react-router-dom` | ✅ Oui | Routing |
| Tailwind CDN | ✅ Oui (CDN) | Styling |
| Google Fonts CDN | À ajouter | Typographie |

**INTERDIT :** framer-motion, styled-components, @emotion, three.js, toute lib 3D, toute lib non listée.

## CONTRAINTES TECHNIQUES

- React 19 + Vite + TypeScript strict
- Tailwind via CDN (v3.0-alpha — sera compilé en v3.1)
- **PAS** de Supabase/Stripe dans ces sections (Phase 2)
- **PAS** de fonctionnalité IA/Gemini dans ces sections
- Export default de chaque composant pour import facile

## ORDRE D'EXÉCUTION RECOMMANDÉ

1. `index.html` — ajouter fonts CDN
2. `NavBar.tsx` — composant le plus simple, valide le setup
3. `HeroSection.tsx` — le plus impactant visuellement
4. `TrustBadges.tsx` — données factuelles
5. `ParcoursRD.tsx` — timeline complexe
6. `SansAvecAegis.tsx` — comparatif
7. `App.tsx` — intégration et test

## RAPPORT DE SESSION

À la fin de la session, produire un rapport avec :
1. **RÉSUMÉ** (3 lignes max)
2. **FICHIERS PRODUITS** (tableau : fichier | statut | lignes)
3. **DÉCISIONS AUTONOMES** (choix faits sans validation JP)
4. **QUESTIONS** pour review Claude V&V
5. **PROCHAINES ÉTAPES** (S5–S8 pour prochaine session)
