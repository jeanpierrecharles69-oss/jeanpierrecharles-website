# BRIEF AG -- ACTIVITES NOCTURNES v3.1
# Reference : 20260306T1730_BRIEF_AG-ACTIVITES-V31-ID01

**Date** : 06/03/2026 17h30 CET
**Auteur** : Claude Opus 4.6 (V&V convergence avec JP)
**Commanditaire** : Jean-Pierre Charles
**Destinataire** : AG (Gemini 2.0 Flash)
**Statut** : DEFINITIF -- TOUTES DECISIONS JP VALIDEES
**V&V matin 07/03** : Opus via MCP Filesystem + Chrome Extension

---

## 0. REGLES ABSOLUES AG

1. NE TOUCHER QU'AUX FICHIERS LISTES DANS CE BRIEF (Section 8)
2. NE PAS creer de nouveaux fichiers
3. NE PAS modifier la structure des dossiers
4. NE PAS toucher a : vite.config.ts, gemini-proxy.ts, .env*, constants.ts, LangContext.tsx, NavBar.tsx
5. 100% ASCII dans les commentaires code (pas d'accents)
6. Garder le style inline + tokens C.* existant (pas de nouvelles classes Tailwind)
7. Tester mentalement que chaque modification compile (pas de variables non definies)
8. Produire un SESSION_REPORT en fin d'execution

---

## 1. RESUME DES 6 MODIFICATIONS

| ID | Modification | Fichiers | Effort | Risque |
|---|---|---|---|---|
| MOD-1 | Supprimer stats dupliquees ParcoursRD | ParcoursRD.tsx | 10min | TRES FAIBLE |
| MOD-2 | CTA Pricing scroll vers #contact | PricingSection.tsx + CTASection.tsx | 10min | NUL |
| MOD-3 | Ajouter 4 reglements (RGPD, Machines, Data Act, NIS2) | i18n.ts | 20min | TRES FAIBLE |
| MOD-4 | Supprimer AEGIS Circular de la Trinity (3→2 blocs) | HeroSection.tsx + i18n.ts | 20min | FAIBLE |
| MOD-5 | Refonte tarification (supprimer Discover, renommer tiers, nouveaux prix) | i18n.ts + PricingSection.tsx | 30min | FAIBLE |
| MOD-6 | Redimensionner/equilibrer les sections (grids 2 cols) | HeroSection.tsx + PricingSection.tsx | 15min | FAIBLE |

**Temps total estime** : ~1h45

---

## 2. MOD-1 : SUPPRIMER STATS DUPLIQUEES (D52 -- JP GO)

### Fichier : C:\Projects\jeanpierrecharles\src\components\homepage\ParcoursRD.tsx

### Action : Supprimer le bloc credKpis (definition + rendu grid)

**SUPPRIMER** la definition credKpis (lignes ~13-18) :
```typescript
// SUPPRIMER CE BLOC ENTIER :
const credKpis = [
    { value: "32", label: lang === 'en' ? "years R&D" : "ans R&D", color: C.accent },
    { value: "6", label: lang === 'en' ? "groups" : "groupes", color: C.emerald },
    { value: "50+", label: lang === 'en' ? "programmes" : "programmes", color: C.gold },
    { value: "5", label: lang === 'en' ? "sectors" : "secteurs", color: C.copper },
];
```

**SUPPRIMER** le rendu grid credKpis (lignes ~39-64) :
```tsx
// SUPPRIMER CE BLOC ENTIER :
{/* KPI credibilite -- 4 metriques */}
<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
    {credKpis.map((kpi, i) => (
        <div
            key={i}
            className="text-center p-4 rounded-xl"
            style={{
                backgroundColor: C.surfaceAlt,
                border: `1px solid ${C.border}`,
            }}
        >
            <div
                className="text-3xl font-black"
                style={{ color: kpi.color }}
            >
                {kpi.value}
            </div>
            <div
                className="text-[11px] font-semibold mt-1"
                style={{ color: C.textSecondary }}
            >
                {kpi.label}
            </div>
        </div>
    ))}
</div>
```

**VERIFICATION** : Apres suppression, le `lang` dans le destructuring `const { t, lang } = useLang()`
n'est plus utilise. Deux options :
- Option A : Changer en `const { t } = useLang()` (plus propre)
- Option B : Laisser tel quel (pas de bug, juste un warning TS)

**Recommandation** : Option A.

### Resultat attendu
La section ParcoursRD affiche : Titre + Sous-titre + Chaine de valeur + LinkedIn.
Plus de metriques dupliquees avec TrustBadges.

---

## 3. MOD-2 : CTA PRICING SCROLL (D53 -- JP GO Option B)

### Fichier 1 : C:\Projects\jeanpierrecharles\src\components\homepage\CTASection.tsx

**AJOUTER** `id="cta-section"` sur la balise `<section>` :

```tsx
// AVANT :
<section
    className="relative rounded-2xl px-6 py-12 text-center overflow-hidden"
    style={{...}}
>

// APRES :
<section
    id="cta-section"
    className="relative rounded-2xl px-6 py-12 text-center overflow-hidden"
    style={{...}}
>
```

### Fichier 2 : C:\Projects\jeanpierrecharles\src\components\homepage\PricingSection.tsx

**AJOUTER** `onClick` sur le bouton CTA :

```tsx
// AVANT :
<button
    className="w-full text-xs font-bold py-2.5 rounded-full mt-auto transition-all"
    style={{
        backgroundColor: isActive ? tier.color : "transparent",
        color: isActive ? "#fff" : tier.color,
        border: isActive ? "none" : `1px solid ${tier.color}30`,
    }}
    aria-label={tier.cta}
>
    {tier.cta}
</button>

// APRES :
<button
    className="w-full text-xs font-bold py-2.5 rounded-full mt-auto transition-all"
    style={{
        backgroundColor: isActive ? tier.color : "transparent",
        color: isActive ? "#fff" : tier.color,
        border: isActive ? "none" : `1px solid ${tier.color}30`,
    }}
    aria-label={tier.cta}
    onClick={() => document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' })}
>
    {tier.cta}
</button>
```

---

## 4. MOD-3 : AJOUTER 4 REGLEMENTS (D54 -- JP GO)

### Fichier : C:\Projects\jeanpierrecharles\src\components\homepage\i18n.ts

### Section FR -- Ajouter apres l'entree EN 45545 dans le tableau `regs` :

```typescript
{ reg: "RGPD", ref: "2016/679", xp: "DPO process industriel transversal", sectors: "Transversal", color: C.emerald },
{ reg: "Machinery Regulation", ref: "2023/1230", xp: "Faurecia/Autoliv \u2014 equipements production", sectors: "Industrie", color: C.copper },
{ reg: "Data Act", ref: "2023/2854", xp: "Donnees industrielles IoT", sectors: "IoT \u00b7 Industrie", color: C.accent },
{ reg: "NIS2", ref: "2022/2555", xp: "Cybersecurite entites essentielles", sectors: "Transversal", color: C.rose },
```

### Section EN -- Ajouter apres l'entree EN 45545 dans le tableau `regs` :

```typescript
{ reg: "GDPR", ref: "2016/679", xp: "Cross-sector industrial DPO process", sectors: "Cross-sector", color: C.emerald },
{ reg: "Machinery Regulation", ref: "2023/1230", xp: "Faurecia/Autoliv \u2014 production equipment", sectors: "Industry", color: C.copper },
{ reg: "Data Act", ref: "2023/2854", xp: "Industrial IoT data", sectors: "IoT \u00b7 Industry", color: C.accent },
{ reg: "NIS2", ref: "2022/2555", xp: "Essential entities cybersecurity", sectors: "Cross-sector", color: C.rose },
```

**NOTE** : Utiliser les caracteres Unicode exacts comme dans le code existant
(tiret cadratin \u2014, point median \u00b7). Si probleme, utiliser " -- " et " . " a la place.

---

## 5. MOD-4 : SUPPRIMER AEGIS CIRCULAR DE LA TRINITY (JP GO)

### Fichier 1 : C:\Projects\jeanpierrecharles\src\components\homepage\HeroSection.tsx

**REMPLACER** le bloc Trinity 3 colonnes par un bloc 2 colonnes.

Le bloc Trinity actuel commence a la ligne avec le commentaire :
```tsx
{/* === TRINITY BLOCK v3.1 === */}
```

Et se termine avant :
```tsx
{/* AEGIS Intelligence -- VUI principale */}
```

**REMPLACER** tout ce bloc par :

```tsx
{/* === CONVERGENCE BLOCK v3.1 === */}
<div style={{ marginBottom: 28, marginTop: 28 }}>
    <p style={{
        textAlign: 'center', fontSize: 11, fontWeight: 600,
        letterSpacing: '0.08em', color: C.textMuted,
        marginBottom: 12, textTransform: 'uppercase',
    }}>
        {t.trinityTitle}
    </p>
    <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 16,
        maxWidth: 680,
        margin: '0 auto',
    }}>
        {/* Bloc 1 -- 32 ans R&D */}
        <div style={{
            background: `linear-gradient(135deg, ${C.copper}20, ${C.copper}08)`,
            border: `1px solid ${C.copper}18`,
            borderRadius: 16, padding: '20px 18px',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🧠</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>{t.trinityItem1Title}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.copper, marginBottom: 8, letterSpacing: '0.03em' }}>{t.trinityItem1Sub}</div>
            <div style={{ fontSize: 11, color: C.textSecondary, lineHeight: 1.5 }}>{t.trinityItem1Desc}</div>
        </div>
        {/* Bloc 2 -- AEGIS Intelligence */}
        <div style={{
            background: `linear-gradient(135deg, ${C.emerald}20, ${C.emerald}08)`,
            border: `1px solid ${C.emerald}18`,
            borderRadius: 16, padding: '20px 18px',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✨</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>{t.trinityItem3Title}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.emerald, marginBottom: 8, letterSpacing: '0.03em' }}>{t.trinityItem3Sub}</div>
            <div style={{ fontSize: 11, color: C.textSecondary, lineHeight: 1.5 }}>{t.trinityItem3Desc}</div>
        </div>
    </div>
    <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: C.accent, marginTop: 12, maxWidth: 500, margin: '12px auto 0' }}>
        = {t.trinityResult}
    </p>
</div>
{/* ========================= */}
```

### Fichier 2 : C:\Projects\jeanpierrecharles\src\components\homepage\i18n.ts

**REMPLACER** la valeur de `trinityTitle` et `trinityResult` dans les deux sections FR et EN :

**FR** :
```typescript
// AVANT :
trinityTitle: "La force de la convergence",
// APRES :
trinityTitle: "LA FORCE DE LA CONVERGENCE",

// AVANT :
trinityResult: "Expert Intelligence as a Service (EISaaS)",
// APRES :
trinityResult: "Votre conformite industrielle, pilotee par 32 ans de R&D et l'IA reglementaire AEGIS.",
```

**EN** :
```typescript
// AVANT :
trinityTitle: "The power of convergence",
// APRES :
trinityTitle: "THE POWER OF CONVERGENCE",

// AVANT :
trinityResult: "Expert Intelligence as a Service (EISaaS)",
// APRES :
trinityResult: "Your industrial compliance, driven by 32 years of R&D and AEGIS regulatory AI.",
```

**NOTE** : Les cles trinityItem2Title, trinityItem2Sub, trinityItem2Desc (AEGIS Circular)
restent dans i18n.ts mais ne sont plus referencees dans HeroSection.tsx.
NE PAS les supprimer (zero risque si presentes, risque si absentes et referencees ailleurs).

---

## 6. MOD-5 : REFONTE TARIFICATION (D33r -- JP REFACTORE)

### Fichier : C:\Projects\jeanpierrecharles\src\components\homepage\i18n.ts

**REMPLACER** le tableau `tiers` complet dans la section FR :

```typescript
tiers: [
    {
        name: "PILOTAGE", price: "50\u20ac", period: "/mois", badge: "POPULAIRE", annual: "500\u20ac/an", color: C.accent,
        tagline: "Pilotez votre conformite EU avec l'IA",
        features: [
            "AEGIS Intelligence -- analyse d'impact reglementaire IA",
            "Tous secteurs industriels EU",
            "Kanban recommandations strategiques",
            "Feuille de route Gantt PDF complet",
            "Fil d'actualites multi-secteurs",
            "Rapports PDF premium",
        ],
        notIncluded: ["Accompagnement expert dedie"],
        cta: "Demarrer l'essai gratuit",
    },
    {
        name: "EXPERTISE TERRAIN", price: "350\u20ac", period: "/heure", badge: "INGENIEUR R&D", annual: "2 500\u20ac/mois", color: C.gold,
        tagline: "32 ans d'expertise R&D + IA reglementaire",
        features: [
            "Tout PILOTAGE inclus",
            "Accompagnement ingenieur R&D dedie (32 ans)",
            "Conf-calls & interventions sur site",
            "Audit conformite mecatronique personnalise",
            "AMDEC reglementaire produit/process",
            "Feuille de route industrialisation sur mesure",
        ],
        notIncluded: [],
        cta: "Prendre rendez-vous",
    },
],
```

**REMPLACER** le tableau `tiers` complet dans la section EN :

```typescript
tiers: [
    {
        name: "PILOTAGE", price: "\u20ac50", period: "/mo", badge: "POPULAR", annual: "\u20ac500/yr", color: C.accent,
        tagline: "Pilot your EU compliance with AI",
        features: [
            "AEGIS Intelligence -- AI regulatory impact analysis",
            "All EU industrial sectors",
            "Strategic recommendations Kanban",
            "Full Gantt PDF roadmap",
            "Multi-sector news feed",
            "Premium PDF reports",
        ],
        notIncluded: ["Dedicated expert support"],
        cta: "Start free trial",
    },
    {
        name: "EXPERTISE TERRAIN", price: "\u20ac350", period: "/hr", badge: "R&D ENGINEER", annual: "\u20ac2,500/mo", color: C.gold,
        tagline: "32 years of R&D expertise + regulatory AI",
        features: [
            "Everything in PILOTAGE",
            "Dedicated R&D engineer support (32 years)",
            "Conf-calls & on-site interventions",
            "Custom mechatronic compliance audit",
            "Regulatory FMEA product/process",
            "Bespoke industrialisation roadmap",
        ],
        notIncluded: [],
        cta: "Book a call",
    },
],
```

**IMPORTANT** : Mettre a jour aussi les references aux tiers dans ServicesSection :

Dans la section FR `services` :
```typescript
// AVANT :
{ ..., tier: "\u2192 DISCOVER (0\u20ac)", ... },
{ ..., tier: "\u2192 STANDARD (50\u20ac/mois)", ... },
{ ..., tier: "\u2192 PREMIUM (500\u20ac/mois)", ... },

// APRES :
{ ..., tier: "\u2192 PILOTAGE (50\u20ac/mois)", ... },
{ ..., tier: "\u2192 PILOTAGE (50\u20ac/mois)", ... },
{ ..., tier: "\u2192 EXPERTISE TERRAIN (350\u20ac/h)", ... },
```

Dans la section EN `services` :
```typescript
// AVANT :
{ ..., tier: "\u2192 DISCOVER (\u20ac0)", ... },
{ ..., tier: "\u2192 STANDARD (\u20ac50/mo)", ... },
{ ..., tier: "\u2192 PREMIUM (\u20ac500/mo)", ... },

// APRES :
{ ..., tier: "\u2192 PILOTAGE (\u20ac50/mo)", ... },
{ ..., tier: "\u2192 PILOTAGE (\u20ac50/mo)", ... },
{ ..., tier: "\u2192 EXPERTISE TERRAIN (\u20ac350/hr)", ... },
```

**AUSSI** : Mettre a jour `brainCta` dans les deux langues :

FR :
```typescript
// AVANT :
brainCta: "Essai gratuit \u2014 DISCOVER 0\u20ac \u00b7 STANDARD 50\u20ac/mois",
// APRES :
brainCta: "Essai gratuit \u2014 PILOTAGE 50\u20ac/mois",
```

EN :
```typescript
// AVANT :
brainCta: "Free trial \u2014 DISCOVER \u20ac0 \u00b7 STANDARD \u20ac50/mo",
// APRES :
brainCta: "Free trial \u2014 PILOTAGE \u20ac50/mo",
```

---

## 7. MOD-6 : REDIMENSIONNER SECTIONS (JP GO)

### Fichier : C:\Projects\jeanpierrecharles\src\components\homepage\PricingSection.tsx

**REMPLACER** la grid 3 colonnes par 2 colonnes centrees :

```tsx
// AVANT :
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">

// APRES :
<div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-3xl mx-auto">
```

**AUSSI** : Adapter `activeTier` initial -- passer de `useState(1)` a `useState(0)`
puisqu'il n'y a plus que 2 tiers (index 0 = PILOTAGE, index 1 = EXPERTISE TERRAIN).

```tsx
// AVANT :
const [activeTier, setActiveTier] = useState(1);

// APRES :
const [activeTier, setActiveTier] = useState(0);
```

### Fichier : HeroSection.tsx
Deja traite dans MOD-4 (Trinity passe de grid-cols-3 a grid-cols-2).

---

## 8. FICHIERS IMPACTES (LISTE EXHAUSTIVE ET FERMEE)

| # | Fichier | MODs | Lignes estimees |
|---|---|---|---|
| 1 | ParcoursRD.tsx | MOD-1 | Suppression ~30 lignes |
| 2 | CTASection.tsx | MOD-2 | Ajout 1 attribut (id) |
| 3 | PricingSection.tsx | MOD-2 + MOD-5 + MOD-6 | Modification ~5 lignes |
| 4 | i18n.ts | MOD-3 + MOD-4 + MOD-5 | Modification ~60 lignes (FR+EN) |
| 5 | HeroSection.tsx | MOD-4 + MOD-6 | Remplacement bloc Trinity ~40 lignes |

**AUCUN AUTRE FICHIER NE DOIT ETRE TOUCHE.**

Fichiers INTERDITS (ne pas modifier meme si tente) :
- vite.config.ts
- api/gemini-proxy.ts
- .env, .env.local
- constants.ts
- LangContext.tsx
- NavBar.tsx
- App.tsx
- Tout fichier dans src/components/brain/
- Tout fichier dans src/services/
- Tout fichier dans src/data/

---

## 9. ORDRE D'EXECUTION RECOMMANDE

1. MOD-1 (ParcoursRD.tsx) -- le plus simple, zero dependance
2. MOD-2 (CTASection.tsx + PricingSection.tsx) -- prerequis pour MOD-5
3. MOD-3 (i18n.ts reglements) -- independant
4. MOD-4 (HeroSection.tsx + i18n.ts Trinity) -- dependance i18n.ts
5. MOD-5 (i18n.ts tarification + PricingSection.tsx) -- le plus complexe
6. MOD-6 (PricingSection.tsx grid) -- finalisation visuelle

**ATTENTION** : MOD-3, MOD-4 et MOD-5 touchent tous i18n.ts.
AG doit faire les 3 modifications dans le meme fichier sans conflit.
Recommandation : ouvrir i18n.ts une seule fois et appliquer les 3 MODs d'un coup.

---

## 10. CRITERES DE SUCCES (V&V OPUS MATIN 07/03)

| # | Critere | Methode verification |
|---|---|---|
| C1 | npm run build = 0 erreurs | JP terminal |
| C2 | ParcoursRD sans stats dupliquees | Chrome audit visuel |
| C3 | Trinity = 2 blocs (R&D + Intelligence) | Chrome audit visuel |
| C4 | Tarification = 2 tiers (PILOTAGE + EXPERTISE TERRAIN) | Chrome audit visuel |
| C5 | ReglementsSection = 12 cartes (8 existantes + 4 nouvelles) | Chrome audit visuel |
| C6 | CTA Pricing scroll vers section contact | Chrome clic test |
| C7 | ServicesSection references tiers mises a jour | Chrome audit visuel |
| C8 | brainCta mis a jour (plus de DISCOVER) | Chrome audit visuel |
| C9 | Toggle FR/EN fonctionne pour tous les changements | Chrome test bilingue |
| C10 | Aucun fichier non autorise modifie | diff git |

---

## 11. DECISIONS ENREGISTREES (IDs TEMPORAIRES -- session T1730)

| ID temp | Decision | Decideur | Statut |
|---|---|---|---|
| D_T1730_01 (ex D52) | Supprimer stats dupliquees ParcoursRD | JP | VALIDE GO |
| D_T1730_02 (ex D53) | CTA Pricing scroll vers #cta-section (Option B) | JP | VALIDE GO |
| D_T1730_03 (ex D54) | Ajouter 4 reglements RGPD/Machines/DataAct/NIS2 | JP | VALIDE GO |
| D_T1730_04 (ex D33r) | Supprimer DISCOVER, renommer STANDARD→PILOTAGE, PREMIUM→EXPERTISE TERRAIN 350EUR/h 2500EUR/mois | JP | VALIDE GO |
| D_T1730_05 | Supprimer AEGIS Circular de la Trinity (3→2 blocs) | JP | VALIDE GO |
| D_T1730_06 | Tagline convergence = "Votre conformite industrielle, pilotee par 32 ans de R&D et l'IA reglementaire AEGIS." | JP | VALIDE GO |
| D_T1730_07 | Grids PricingSection et Trinity passes a 2 colonnes | JP | VALIDE GO |

---

## 12. CONTEXTE POUR AG

**Production actuelle** : v2.6.0 (commit c2c532b) sur jeanpierrecharles.com
**Local v3.1** : Build OK (verifie 05/03 15h30 -- 0 erreurs, 56 modules)
**Streaming** : OK (verifie 05/03 15h40 -- Gemini SSE fonctionnel)
**Deploy vise** : 06-07/03/2026 apres V&V Opus

**RAPPEL** : AG ne fait QUE de l'edition statique de fichiers.
Pas de npm, pas de terminal, pas de git, pas de tests.
Opus fera la V&V complete le matin.

---

*AEGIS CIRCULAR -- Brief AG Activites Nocturnes v3.1*
*Reference : 20260306T1730_BRIEF_AG-ACTIVITES-V31-ID01*
*Redige par Claude Opus 4.6 -- convergence V&V avec JP -- 06/03/2026 17h30 CET*
*100% ASCII-safe*
