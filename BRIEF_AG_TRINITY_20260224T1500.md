# BRIEF AG — AEGIS v3.1 Homepage Trinity + Neuro-inclusif
# Session: 20260224T1500 CET
# Auteur: Opus (validé JP)
# Statut: PRET POUR IMPLEMENTATION

---

## CONTEXTE

Jean-Pierre a validé les décisions suivantes le 20260224T1215 CET :
- **D29 GO** : Trinity JPC + AEGIS Circular + AEGIS Intelligence = axe narratif principal Homepage
- **D33 GO** : Pricing SaaS (0/50/500 EUR) maintenu tel quel — consulting en discussion commerciale
- **D30 GO** : GSEO priorité Q2 2026

La maquette de référence est : **AEGIS_INTELLIGENCE_MOCKUP_v3_1_20260224T1500.jsx**
Variante retenue : **A enrichie** (3 cards horizontales + grille neuro-inclusive)

---

## MODIFICATION AG-1 : TRINITY BLOCK DANS HEROSECTION

### Fichiers a modifier
1. `src/components/homepage/i18n.ts` — Ajouter clés FR + EN
2. `src/components/homepage/HeroSection.tsx` — Insérer bloc Trinity

### Emplacement exact
Dans HeroSection.tsx, insérer le bloc Trinity **ENTRE** le subtitle (paragraphe sous H1) **ET** le composant `<AegisIntelligence />`.

### Clés i18n a ajouter

```
// FR
trinityTitle: "La force de la convergence",
trinityItem1Title: "32 ans d'expertise R&D",
trinityItem1Sub: "Patrimoine intellectuel industriel",
trinityItem1Desc: "De la conception a la serie — automobile, batteries, ferroviaire, defense",
trinityItem2Title: "AEGIS Circular",
trinityItem2Sub: "Plateforme Compliance EU",
trinityItem2Desc: "SaaS B2B couvrant 27+ Etats membres — veille, roadmap, ingenierie",
trinityItem3Title: "AEGIS Intelligence",
trinityItem3Sub: "Moteur IA reglementaire",
trinityItem3Desc: "Analyse d'impact en <30s — alimentee par 32 ans de terrain",
trinityResult: "Expert Intelligence as a Service (EISaaS)",

// EN
trinityTitle: "The power of convergence",
trinityItem1Title: "32 years of R&D expertise",
trinityItem1Sub: "Industrial intellectual capital",
trinityItem1Desc: "From design to production — automotive, batteries, rail, defence",
trinityItem2Title: "AEGIS Circular",
trinityItem2Sub: "EU Compliance Platform",
trinityItem2Desc: "B2B SaaS covering 27+ Member States — watch, roadmap, engineering",
trinityItem3Title: "AEGIS Intelligence",
trinityItem3Sub: "Regulatory AI Engine",
trinityItem3Desc: "Impact analysis in <30s — powered by 32 years on the ground",
trinityResult: "Expert Intelligence as a Service (EISaaS)",
```

### Couleurs par card (depuis constants.ts existant)
- Card 1 (Expertise) : `C.copper` (#c2956a)
- Card 2 (AEGIS Circular) : `C.accent` (#3b82f6)
- Card 3 (AEGIS Intelligence) : `C.emerald` (#10b981)

### Gradients background par card
- Card 1 : `linear-gradient(135deg, #c2956a20, #c2956a08)`
- Card 2 : `linear-gradient(135deg, #3b82f620, #3b82f608)`
- Card 3 : `linear-gradient(135deg, #10b98120, #10b98108)`

---

## MODIFICATION AG-2 : FIX H1 OVERFLOW (A8)

### Probleme
Le H1 complet "L'ingénieur R&D qui a conçu vos systèmes, pilote votre conformité EU."
est partiellement tronqué au chargement initial. Les 2 premières lignes sont coupées.

### Solution
Dans HeroSection.tsx, ajuster le `paddingTop` de la section Hero pour que le H1 complet
soit visible au-dessus du fold sans scroll.

### Critere de validation
- Sur viewport 1366x768 : H1 complet visible sans scroll
- Sur viewport 1920x1080 : H1 complet visible sans scroll
- Sur mobile 375x812 : H1 complet visible (peut nécessiter fontSize réduit)

---

## REGLES NEURO-INCLUSIVES (OBLIGATOIRES)

Les 10 règles suivantes s'appliquent à toutes les modifications AG v3.1 :

| ID | Regle | Critere | Statut |
|----|-------|---------|--------|
| NI-01 | Fond | Blanc pur ou gradient ultra-subtil, zero pattern decoratif | APPLIED |
| NI-02 | Palette | Max 3 couleurs fonctionnelles, pas de surcharge chromatique | APPLIED |
| NI-03 | Pictogrammes | Icones explicites et univoques, 1 icone = 1 concept | APPLIED |
| NI-04 | Typographie | Inter sans-serif, hierarchie par taille | APPLIED |
| NI-05 | Animations | Reduites au minimum, pas de mouvement auto ni clignotement | TARGET v3.2 |
| NI-06 | Espacement | Genereux, 1 concept = 1 bloc visuel isole | APPLIED |
| NI-07 | Langage | Litteral, concis, factuel, zero metaphore | APPLIED |
| NI-08 | Layout | Previsible, lecture naturelle haut vers bas | APPLIED |
| NI-09 | Navigation | Labels explicites, 1 CTA = 1 action clairement nommee | APPLIED |
| NI-10 | Charge cognitive | Max 3-4 elements par groupe visuel | APPLIED |

**Sources** : UK Gov Accessibility Posters (Autism) · WCAG 2.2 Cognitive · Neurodiversity Design System ·
PRINT Magazine "Designing for the 15%" · Feedback Mme Charles (interface Cartesienne, simple, logique)

---

## INTERDICTIONS AG

AG ne doit PAS :
- Toucher `constants.ts` (design tokens)
- Toucher `AegisIntelligence.tsx` (composant VUI)
- Toucher `PricingSection.tsx` (pricing validé D33)
- Modifier le proxy Vercel (`api/gemini-proxy.ts`)
- Modifier la config de deploiement (vercel.json, vite.config.ts)
- Changer la structure des fichiers/dossiers
- Supprimer ou remplacer des composants existants (migration additive L3)

---

## VALIDATION

Apres implementation AG, Opus executera :
1. `npm run build` — doit passer sans erreur
2. Scan secrets — 0 leak dans dist/
3. Verification visuelle localhost:5173 — Trinity visible, H1 non tronqué
4. Test i18n — switch FR/EN correct sur Trinity
5. Conformite NI-01 a NI-10 (sauf NI-05 defer v3.2)

---

## TIMELINE

| Date | Action | Responsable |
|------|--------|-------------|
| 24/02 T1500 | Brief AG pret | Opus |
| 24/02-25/02 | Implementation AG-1 + AG-2 | AG |
| 25/02 | V-Gate Opus (build + secrets + visuel) | Opus |
| 26/02 | V-Gate P1C partiel (10 criteres) | Opus + JP |
| 26/02 | GO/NO-GO git push | JP |
| 27/02 | Sprint deadline | git push ou defer |

---

*Document genere par Opus 4.6 — 20260224T1500 CET*
*Ref: AEGIS_INTELLIGENCE_MOCKUP_v3_1_20260224T1500.jsx*
