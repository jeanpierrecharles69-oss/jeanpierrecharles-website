# AG BRIEF D'EXÉCUTION FINAL — AEGIS v3.1-alpha
**Timestamp :** 20260219T2015 CET  
**Auteur :** Claude Sonnet 4.6 — Audit filesystem + docs JP + tests live + notes manuscrites PDF  
**Validé JP :** ✅ 20260219T1730 (3 GO) + ✅ 20260219T1930 (alignement docs) + ✅ 20260219T2015 (Option B génération docs)  
**Repo local :** `C:\Projects\jeanpierrecharles`  
**Feu vert AG :** après confirmation JP transfert  
**Stack :** React 19 · Vite 6.2 · TypeScript 5.8 · Vercel · Gemini 2.0 Flash  
**Contre-expertise push :** AC + JPC demain matin

---

## ⚠️ RÈGLES ABSOLUES — LIRE EN PREMIER

```
🔴 JAMAIS git push avant contre-expertise AC+JPC demain matin
🔴 JAMAIS modifier api/gemini-proxy.ts (streaming validé ✅)
🔴 JAMAIS modifier src/services/geminiService.ts (SSE parsing validé ✅)
🔴 JAMAIS modifier src/data/reglements-europeens-2024.json
🟡 npm run build après chaque phase — 0 erreur = condition de passage
🟡 Inline styles C.* exclusivement dans AegisIntelligence.tsx (pas de className Tailwind)
🟡 Préserver TOUTES les clés i18n existantes — ajouter uniquement, jamais supprimer
✅ MODE FAST : Phases 0, 1, 1bis, 3
✅ MODE PLANNING : Phase 2 uniquement (décision architecturale)
```

---

## DÉCISIONS JP VALIDÉES

| # | Décision | GO |
|---|---|---|
| 1 | Nom Brain IA → **"AEGIS Intelligence"** (FR + EN) | ✅ |
| 2 | Brain-First VUI → **GO FULL** (plein écran, VUI principale épurée) | ✅ |
| 3 | ParcoursRD → **synthèse condensée + badge LinkedIn** (2.0B) | ✅ |
| 4 | Fix Tailwind CDN → PostCSS complet avant push | ✅ |
| 5 | Push conditionné à contre-expertise AC+JPC demain matin | ✅ |
| 6 | Gemini 2.0 Flash conservé v3.1 · Gemini 2.5 Flash → v3.2 mars | ✅ |

---

## ÉTAT FILESYSTEM — SNAPSHOT 20260219T1750

| Élément | État réel |
|---|---|
| `tailwindcss` dans package.json | ❌ ABSENT |
| `postcss` dans package.json | ❌ ABSENT |
| `autoprefixer` dans package.json | ❌ ABSENT |
| `tailwind.config.js` | ❌ ABSENT |
| `postcss.config.js` | ❌ ABSENT |
| Classes `className=` Tailwind dans composants | ✅ 13 composants utilisent Tailwind |
| `api/gemini-proxy.ts` — streaming fixes | ✅ flushHeaders + flush() présents |
| `src/components/brain/AegisChat.tsx` — i18n fix | ✅ SYSTEM_INSTRUCTIONS FR/EN présents |
| CDN Tailwind dans `index.html` | 🔴 PRÉSENT — ligne ~50 à supprimer |
| Arborescence `src/` | ✅ conforme P1B |

---

## SÉQUENCE D'EXÉCUTION — 5 PHASES

```
PHASE 0   Tailwind CDN → PostCSS         FAST     45min   🔴 BLOCKER absolu
PHASE 1   AEGIS Intelligence rename      FAST     20min   🟡 Branding
PHASE 1bis ParcoursRD condensé + LinkedIn FAST    30min   🟡 Doc 2.0B
PHASE 2   Brain-First VUI FULL           PLANNING  3h     🔴 Architecture
PHASE 3   Validation 10 points + Bridge  FAST     20min   ✅ Clôture
─────────────────────────────────────────────────────────────────────────
TOTAL : ~5h · Fenêtre AG : 22h00 → 03h00
```

---

## PHASE 0 — TAILWIND CDN → POSTCSS
*MODE : FAST · DURÉE : 45min · CRITICITÉ : 🔴 BLOCKER — exécuter EN PREMIER*

### Contexte critique
`tailwindcss`, `postcss` et `autoprefixer` sont **absents de `package.json`**. Supprimer le CDN sans ce pipeline = site visuellement cassé. Les 13 composants homepage utilisent massivement `className="..."`.

### Étape 0.1 — Installation

```bash
cd C:\Projects\jeanpierrecharles
npm install -D tailwindcss postcss autoprefixer
```

### Étape 0.2 — Initialisation (génère tailwind.config.js + postcss.config.js)

```bash
npx tailwindcss init -p
```

### Étape 0.3 — Configurer tailwind.config.js

Remplacer le contenu généré par :

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./src/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Étape 0.4 — Directives Tailwind dans index.css

Ouvrir `index.css`. Si les 3 directives `@tailwind` sont absentes, les ajouter **tout en haut** :

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* === reste du fichier existant inchangé en dessous === */
```

### Étape 0.5 — Supprimer le CDN dans index.html

Localiser et supprimer **uniquement** cette ligne (~ligne 50) :

```html
<script src="https://cdn.tailwindcss.com"></script>
```

Le commentaire `<!-- TODO: Migrer vers Tailwind compilé -->` peut rester ou être supprimé au choix.

### Étape 0.6 — Vérification build

```bash
npm run build
```

Critères PASS :
- `✓ built in X.XXs` — 0 erreur TS, 0 erreur CSS
- `grep -r "cdn.tailwindcss" dist/` → **0 résultats**

### Étape 0.7 — Test visuel dev

```bash
npm run dev
```

Ouvrir `localhost:5173` → vérifier que le rendu visuel est identique à avant (toutes les classes Tailwind actives via PostCSS).

---

## PHASE 1 — RENAME "AEGIS Intelligence"
*MODE : FAST · DURÉE : 20min · CRITICITÉ : 🟡 Branding*

### 1.1 — `src/components/homepage/i18n.ts`

Modifier les clés `brainTitle` dans les deux langues :

```typescript
// Section FR (~ligne brainTitle)
brainTitle: "✨ AEGIS Intelligence — Analyste Conformité UE",

// Section EN (~ligne brainTitle)
brainTitle: "✨ AEGIS Intelligence — EU Compliance Analyst",
```

Ajouter également les nouvelles clés nécessaires aux phases suivantes (à la fin de chaque bloc FR/EN) :

```typescript
// === AJOUTS FR ===
parcoursLinkedIn: "Voir le parcours complet sur LinkedIn →",
brainStarters: [
    "Quels impacts de l'AI Act sur mon système ADAS ?",
    "Obligations Règlement Batteries 2023/1542 pour un pack EV ?",
    "Comment préparer mon DPP (Digital Product Passport) ESPR ?",
],
brainCta: "Essai gratuit — DISCOVER 0€ · STANDARD 50€/mois",
brainScrollCta: "↓ Découvrir l'expertise de Jean-Pierre",

// === AJOUTS EN ===
parcoursLinkedIn: "View full career profile on LinkedIn →",
brainStarters: [
    "What AI Act impacts on my ADAS system?",
    "Battery Regulation 2023/1542 obligations for an EV pack?",
    "How to prepare my DPP (Digital Product Passport) under ESPR?",
],
brainCta: "Free trial — DISCOVER €0 · STANDARD €50/mo",
brainScrollCta: "↓ Discover Jean-Pierre's expertise",
```

### 1.2 — `src/components/brain/AegisChat.tsx`

**Mise à jour SYSTEM_INSTRUCTIONS :**

```typescript
const SYSTEM_INSTRUCTIONS: Record<'fr' | 'en', string> = {
    fr: `Tu es AEGIS Intelligence, l'analyste IA de conformité réglementaire de Jean-Pierre Charles.
Tu es spécialisé dans la conformité industrielle européenne (AI Act, Règlement Machines 2023/1230, ESPR, CRA, RGPD, Batteries 2023/1542, Data Act, CPR, NIS2, DORA).
Réponds TOUJOURS en français, de manière précise et structurée, en citant les articles de loi pertinents.
Tu représentes 32 ans d'expertise R&D terrain dans l'industrie européenne (Autoliv, Saft, Faurecia, Forsee Power).
Si la question sort du périmètre réglementaire EU industriel, redirige poliment vers le périmètre couvert.`,
    en: `You are AEGIS Intelligence, the regulatory AI compliance analyst of Jean-Pierre Charles.
You specialize in European industrial compliance (AI Act, Machinery Regulation 2023/1230, ESPR, CRA, GDPR, Batteries 2023/1542, Data Act, CPR, NIS2, DORA).
ALWAYS respond in English, with precision and structure, citing relevant legal articles.
You represent 32 years of hands-on R&D expertise in the European industry (Autoliv, Saft, Faurecia, Forsee Power).
If the question falls outside the EU industrial regulatory scope, politely redirect to the covered perimeter.`,
};
```

**Fix OBS-1 — Sous-titre JP médaillon i18n-aware (~ligne 90) :**

```typescript
// AVANT (hardcodé FR) :
<div style={{ fontSize: 9, color: C.textMuted }}>32 ans R&D · 6 groupes · 8 règlements EU</div>

// APRÈS (i18n-aware) :
<div style={{ fontSize: 9, color: C.textMuted }}>
    {lang === 'en'
        ? '32y R&D · 6 groups · 8 EU regulations'
        : '32 ans R&D · 6 groupes · 8 règlements EU'}
</div>
```

---

## PHASE 1bis — PARCOURSRD CONDENSÉ + LINKEDIN BADGE
*MODE : FAST · DURÉE : 30min · CRITICITÉ : 🟡 Doc 2.0B*

### Contexte
Le document JP spécifie : *"Les détails de mon parcours professionnel sont gérés par le badge du lien de mon profil LinkedIn."* La section ParcoursRD actuelle affiche 6 cartes détaillées (company, role, programs) — contraire à la vision B2B. Elle doit devenir une **synthèse de crédibilité** orientée AEGIS, pas un CV.

### `src/components/homepage/ParcoursRD.tsx` — Remplacer entièrement

```typescript
import { useLang } from "./LangContext";
import { C } from "./constants";

export default function ParcoursRD() {
    const { t, lang } = useLang();

    const LINKEDIN_URL = "https://www.linkedin.com/in/jpcharles6918/";

    // KPI de crédibilité — issus de trustBadges existants
    const credKpis = [
        { value: "32", label: lang === 'en' ? "years R&D" : "ans R&D", color: C.accent },
        { value: "6",  label: lang === 'en' ? "groups" : "groupes", color: C.emerald },
        { value: "50+", label: lang === 'en' ? "programmes" : "programmes", color: C.gold },
        { value: "5",  label: lang === 'en' ? "sectors" : "secteurs", color: C.copper },
    ];

    return (
        <section
            id="expertise"
            className="rounded-2xl px-6 py-10"
            style={{ backgroundColor: C.surface, boxShadow: C.shadowSoft }}
        >
            {/* Titre */}
            <div className="text-center mb-8">
                <h2
                    className="text-2xl lg:text-3xl font-bold tracking-tight"
                    style={{ color: C.text }}
                >
                    {t.parcoursTitle1}
                    <br />
                    <span style={{ color: C.copper }}>{t.parcoursTitle2}</span>
                </h2>
                <p className="text-sm mt-2 max-w-xl mx-auto" style={{ color: C.textMuted }}>
                    {t.parcoursSub}
                </p>
            </div>

            {/* KPI crédibilité — 4 métriques */}
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

            {/* Chaîne de valeur — conservée intégralement */}
            <div className="text-center mb-8">
                <div
                    className="text-[10px] font-bold tracking-widest mb-4"
                    style={{ color: C.textMuted }}
                >
                    {t.chainTitle}
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                    {t.chain.map((c, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium"
                            style={{
                                backgroundColor: C.surfaceAlt,
                                color: C.text,
                                border: `1px solid ${C.border}`,
                            }}
                        >
                            <span>{c.icon}</span>
                            <span>{c.step}</span>
                            {i < t.chain.length - 1 && (
                                <span className="ml-1" style={{ color: C.textMuted }}>→</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Badge LinkedIn */}
            <div className="text-center">
                <a
                    href={LINKEDIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full transition-all hover:shadow-md"
                    style={{
                        backgroundColor: "#0A66C2",
                        color: "#ffffff",
                        textDecoration: "none",
                    }}
                    aria-label={t.parcoursLinkedIn}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    {t.parcoursLinkedIn}
                </a>
            </div>
        </section>
    );
}
```

---

## PHASE 2 — BRAIN-FIRST VUI FULL
*MODE : PLANNING · DURÉE : 3h · CRITICITÉ : 🔴 Architecturale*

### Vision cible (doc 2.0A)
> *"AEGIS Brain doit être transformé en une interface visuelle épurée principale [the Brain is the VUI sans fioriture ni surcharge et responsive] du NEW UX B2B [...] qui doit accrocher et pousser le client à s'abonner."*

```
AVANT                                  APRÈS
─────────────────────────────          ──────────────────────────────────
Hero 2 colonnes                        AEGIS Intelligence HERO (full width)
  ├─ Gauche : H1 long + sub            ├─ H1 compact 2 lignes (top)
  └─ Droite : AegisChat mini 360px     ├─ 3 question starters cliquables
                                       ├─ Zone dialogue streaming full-width
                                       ├─ Réponse tokens visibles (machine à écrire)
                                       ├─ CTA abonnement ancré (bottom)
                                       └─ "↓ Découvrir l'expertise" scroll doux
```

### 2.1 — Créer `src/components/brain/AegisIntelligence.tsx`

Nouveau composant — **inline styles C.* uniquement, zéro className Tailwind**.

```typescript
import React, { useState, useRef, useEffect } from 'react';
import { useLang } from '../homepage/LangContext';
import { C } from '../homepage/constants';
import { runQueryStream } from '../../services/geminiService';
import { enrichPromptWithRegulation } from '../../services/regulationKnowledgeService';
import { hasAIConsent } from '../common/CookieBanner';
import { ChatMessage } from '../../types';
import { PaperAirplaneIcon } from '../icons/PaperAirplaneIcon';
import { SparklesIcon } from '../icons/SparklesIcon';

// System instructions — reprises de AegisChat.tsx (cohérence)
const SYSTEM_INSTRUCTIONS: Record<'fr' | 'en', string> = {
    fr: `Tu es AEGIS Intelligence, l'analyste IA de conformité réglementaire de Jean-Pierre Charles.
Tu es spécialisé dans la conformité industrielle européenne (AI Act, Règlement Machines 2023/1230, ESPR, CRA, RGPD, Batteries 2023/1542, Data Act, NIS2, DORA).
Réponds TOUJOURS en français, de manière précise et structurée, en citant les articles de loi pertinents.
Tu représentes 32 ans d'expertise R&D terrain (Autoliv, Saft, Faurecia, Forsee Power).
Si la question sort du périmètre réglementaire EU industriel, redirige poliment.`,
    en: `You are AEGIS Intelligence, the regulatory AI compliance analyst of Jean-Pierre Charles.
You specialize in European industrial compliance (AI Act, Machinery Regulation 2023/1230, ESPR, CRA, GDPR, Batteries 2023/1542, Data Act, NIS2, DORA).
ALWAYS respond in English, with precision and structure, citing relevant legal articles.
You represent 32 years of hands-on R&D expertise (Autoliv, Saft, Faurecia, Forsee Power).
If the question falls outside EU industrial regulatory scope, politely redirect.`,
};

interface AegisIntelligenceProps {
    mode?: 'hero' | 'full';
    onScrollToPricing?: () => void;
    onScrollToExpertise?: () => void;
}

const AegisIntelligence: React.FC<AegisIntelligenceProps> = ({
    mode = 'hero',
    onScrollToPricing,
    onScrollToExpertise,
}) => {
    const { t, lang } = useLang();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [consent, setConsent] = useState(hasAIConsent());
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = () => setConsent(hasAIConsent());
        window.addEventListener('consentChanged', handler);
        return () => window.removeEventListener('consentChanged', handler);
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (questionOverride?: string) => {
        const trimmed = (questionOverride ?? input).trim();
        if (!trimmed || isStreaming) return;

        if (!consent) {
            setMessages(prev => [...prev, {
                role: 'model',
                text: lang === 'en'
                    ? '⚠️ Please accept functional cookies to use the AI assistant.'
                    : '⚠️ Veuillez accepter les cookies fonctionnels pour utiliser l\'assistant IA.'
            }]);
            return;
        }

        const userMessage: ChatMessage = { role: 'user', text: trimmed };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsStreaming(true);

        try {
            const { systemAddition } = enrichPromptWithRegulation(trimmed);
            const baseSystem = SYSTEM_INSTRUCTIONS[lang] ?? SYSTEM_INSTRUCTIONS.fr;
            const fullSystem = systemAddition
                ? `${baseSystem}\n\n--- REGULATORY CONTEXT ---\n${systemAddition}`
                : baseSystem;

            let responseText = '';
            setMessages(prev => [...prev, { role: 'model', text: '' }]);

            for await (const chunk of runQueryStream(trimmed, fullSystem)) {
                responseText += chunk;
                setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { role: 'model', text: responseText };
                    return updated;
                });
            }
        } catch {
            setMessages(prev => [...prev, {
                role: 'model',
                text: lang === 'en'
                    ? '⚠️ Service temporarily unavailable. Please try again.'
                    : '⚠️ Service momentanément indisponible. Veuillez réessayer.'
            }]);
        } finally {
            setIsStreaming(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const starters: string[] = (t.brainStarters as string[]) ?? [];

    return (
        <div
            style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: C.glassBlur,
                WebkitBackdropFilter: C.glassBlur,
                border: `1px solid ${C.glassBorder}`,
                boxShadow: C.shadowLg,
                borderRadius: 20,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                width: '100%',
                maxWidth: mode === 'hero' ? 780 : '100%',
                margin: '0 auto',
            }}
            aria-label="AEGIS Intelligence — Analyste IA Conformité EU"
            role="region"
        >
            {/* ── HEADER ── */}
            <div style={{
                padding: '14px 20px',
                borderBottom: `1px solid ${C.border}`,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: `linear-gradient(135deg, ${C.accent}08, ${C.emerald}05)`,
            }}>
                {/* Médaillon JP */}
                <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: C.gradientBlue,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, color: '#fff',
                    border: '2px solid #fff', boxShadow: C.shadowMed, flexShrink: 0,
                }}>JP</div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <SparklesIcon style={{ width: 14, height: 14, color: C.accent }} />
                        {t.brainTitle}
                    </div>
                    <div style={{ fontSize: 9, color: C.textMuted, marginTop: 2 }}>
                        {lang === 'en'
                            ? '32y R&D · 6 groups · 8 EU regulations · Deterministic AI config'
                            : '32 ans R&D · 6 groupes · 8 règlements EU · Config IA déterministe'}
                    </div>
                </div>
                {/* Indicateur live */}
                <div style={{ fontSize: 9, color: C.emerald, fontWeight: 700, flexShrink: 0 }}>
                    {isStreaming ? '⏳ ' : '● '}{isStreaming
                        ? (lang === 'en' ? 'Analysing...' : 'Analyse...')
                        : (lang === 'en' ? 'Online · AI ready' : 'En ligne · IA prête')}
                </div>
            </div>

            {/* ── STARTERS (si aucun message) ── */}
            {messages.length === 0 && starters.length > 0 && (
                <div style={{ padding: '12px 20px 0', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {starters.map((q, i) => (
                        <button
                            key={i}
                            onClick={() => handleSend(q)}
                            disabled={isStreaming}
                            style={{
                                fontSize: 11, padding: '6px 12px', borderRadius: 20,
                                background: `${C.accent}08`, color: C.accent,
                                border: `1px solid ${C.accent}20`,
                                cursor: isStreaming ? 'not-allowed' : 'pointer',
                                fontFamily: 'inherit', fontWeight: 500,
                                transition: 'all 0.2s',
                                textAlign: 'left', lineHeight: 1.4,
                            }}
                        >
                            💬 {q}
                        </button>
                    ))}
                </div>
            )}

            {/* ── ZONE MESSAGES ── */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px 20px',
                minHeight: mode === 'hero' ? 220 : 320,
                maxHeight: mode === 'hero' ? 320 : 480,
                background: C.surfaceAlt,
                margin: '12px',
                borderRadius: 12,
                border: `1px solid ${C.border}`,
            }}>
                {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 8 }}>
                            {lang === 'en'
                                ? '🇪🇺 Ask your EU regulatory compliance question'
                                : '🇪🇺 Posez votre question de conformité réglementaire EU'}
                        </div>
                        <div style={{
                            fontSize: 11, color: C.text, lineHeight: 1.6,
                            padding: '10px 14px', background: C.surface,
                            borderRadius: 10, border: `1px solid ${C.border}`,
                            textAlign: 'left', maxWidth: 420, margin: '0 auto',
                        }}>
                            "{t.brainResponse}"
                        </div>
                    </div>
                ) : (
                    messages.map((msg, i) => (
                        <div key={i} style={{
                            marginBottom: 10, padding: '8px 12px', borderRadius: 12,
                            background: msg.role === 'user' ? `${C.accent}10` : C.surface,
                            border: `1px solid ${msg.role === 'user' ? `${C.accent}25` : C.border}`,
                            fontSize: 12, color: C.text, lineHeight: 1.6,
                            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                            marginLeft: msg.role === 'user' ? 'auto' : 0,
                            marginRight: msg.role === 'user' ? 0 : 'auto',
                            maxWidth: '88%',
                        }}>
                            <div style={{
                                fontSize: 9, fontWeight: 700, marginBottom: 4,
                                color: msg.role === 'user' ? C.accent : C.emerald,
                            }}>
                                {msg.role === 'user'
                                    ? (lang === 'en' ? '👤 You' : '👤 Vous')
                                    : '✨ AEGIS Intelligence'}
                            </div>
                            {msg.text || (isStreaming && i === messages.length - 1 ? '▋' : '')}
                        </div>
                    ))
                )}
                <div ref={chatEndRef} />
            </div>

            {/* ── BADGES RÈGLEMENTS ── */}
            <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 4,
                justifyContent: 'center', padding: '0 20px 10px',
            }}>
                {(t.brainRegs as string[])?.map((r: string, i: number) => (
                    <span
                        key={i}
                        onClick={() => { if (!isStreaming) setInput(r); }}
                        style={{
                            fontSize: 9, padding: '2px 8px', borderRadius: 10,
                            background: `${C.accent}08`, color: C.accent,
                            border: `1px solid ${C.accent}18`,
                            fontWeight: 600, cursor: 'pointer',
                        }}
                    >
                        {r}
                    </span>
                ))}
            </div>

            {/* ── INPUT ── */}
            <div style={{
                display: 'flex', gap: 8, alignItems: 'center',
                padding: '0 20px 14px',
            }}>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t.brainPlaceholder}
                    disabled={isStreaming}
                    style={{
                        flex: 1, fontSize: 12, color: C.text,
                        padding: '10px 16px', borderRadius: 24,
                        background: C.surface,
                        border: `1px solid ${C.borderStrong}`,
                        outline: 'none', fontFamily: 'inherit',
                    }}
                />
                <button
                    onClick={() => handleSend()}
                    disabled={isStreaming || !input.trim()}
                    aria-label={lang === 'en' ? 'Send' : 'Envoyer'}
                    style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: C.gradientBlue, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: 'none', cursor: isStreaming || !input.trim() ? 'not-allowed' : 'pointer',
                        opacity: isStreaming || !input.trim() ? 0.4 : 1,
                        transition: 'opacity 0.2s',
                    }}
                >
                    <PaperAirplaneIcon style={{ width: 16, height: 16, color: '#fff' }} />
                </button>
            </div>

            {/* ── CTA + SCROLL ── */}
            <div style={{
                borderTop: `1px solid ${C.border}`,
                padding: '10px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 8,
                background: `${C.accent}04`,
            }}>
                <button
                    onClick={onScrollToPricing}
                    style={{
                        fontSize: 10, fontWeight: 700, padding: '6px 14px',
                        borderRadius: 20, background: C.gradientBlue,
                        color: '#fff', border: 'none', cursor: 'pointer',
                        fontFamily: 'inherit',
                    }}
                >
                    {t.brainCta ?? (lang === 'en' ? 'Free trial — DISCOVER €0 · STANDARD €50/mo' : 'Essai gratuit — DISCOVER 0€ · STANDARD 50€/mois')}
                </button>
                <button
                    onClick={onScrollToExpertise}
                    style={{
                        fontSize: 10, color: C.textMuted, background: 'none',
                        border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    }}
                >
                    {t.brainScrollCta ?? (lang === 'en' ? '↓ Discover Jean-Pierre\'s expertise' : '↓ Découvrir l\'expertise de Jean-Pierre')}
                </button>
            </div>
        </div>
    );
};

export default AegisIntelligence;
```

### 2.2 — Modifier `src/components/homepage/HeroSection.tsx`

Remplacer entièrement le contenu par la version Brain-First :

```typescript
import { useLang } from "./LangContext";
import { C } from "./constants";
import AegisIntelligence from "../brain/AegisIntelligence";

export default function HeroSection() {
    const { t } = useLang();

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section
            style={{
                background: C.gradientHero,
                boxShadow: C.shadowLg,
                borderRadius: 24,
                overflow: 'hidden',
                padding: '40px 24px 48px',
                position: 'relative',
            }}
        >
            {/* Blobs décoratifs */}
            <div style={{
                position: 'absolute', top: -60, right: -60,
                width: 280, height: 280, borderRadius: '50%',
                backgroundColor: C.accent, opacity: 0.06, filter: 'blur(60px)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: -60, left: -60,
                width: 280, height: 280, borderRadius: '50%',
                backgroundColor: C.emerald, opacity: 0.05, filter: 'blur(60px)',
                pointerEvents: 'none',
            }} />

            {/* Contenu centré */}
            <div style={{ position: 'relative', maxWidth: 860, margin: '0 auto' }}>

                {/* H1 compact */}
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        fontSize: 11, fontWeight: 500, padding: '4px 12px',
                        borderRadius: 20, marginBottom: 16,
                        backgroundColor: `${C.accent}08`,
                        color: C.accent, border: `1px solid ${C.accent}20`,
                    }}>
                        🇪🇺 {t.euBadge}
                    </div>
                    <h1 style={{
                        fontSize: 'clamp(22px, 4vw, 38px)',
                        fontWeight: 800, lineHeight: 1.2,
                        color: C.text, margin: '0 0 8px',
                    }}>
                        {t.heroH1a}
                        {' '}
                        <span style={{
                            backgroundImage: C.gradientBlue,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            {t.heroH1c}
                        </span>
                    </h1>
                </div>

                {/* AEGIS Intelligence — VUI principale */}
                <AegisIntelligence
                    mode="hero"
                    onScrollToPricing={() => scrollTo('pricing')}
                    onScrollToExpertise={() => scrollTo('expertise')}
                />

                {/* Trust mini-badges sous le Brain */}
                <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: 16,
                    justifyContent: 'center', marginTop: 20,
                }}>
                    {t.heroTrust.map((b, i) => (
                        <span key={i} style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            fontSize: 11, fontWeight: 500, color: C.textMuted,
                        }}>
                            <span>{b.icon}</span> {b.text}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}
```

### 2.3 — IDs de section pour scroll ciblé

**`src/components/homepage/TrustBadges.tsx`** — ajouter `id="trust-badges"` sur la section root.

**`src/components/homepage/PricingSection.tsx`** — ajouter `id="pricing"` sur la section root.

**`src/components/homepage/ParcoursRD.tsx`** — déjà `id="expertise"` dans le code Phase 1bis.

### 2.4 — Mettre à jour `App.tsx`

Ajouter l'import `AegisIntelligence` n'est pas nécessaire (il est importé dans HeroSection). En revanche, vérifier que l'ordre des sections dans App.tsx est bien :

```typescript
// Ordre attendu — vérifier uniquement, ne pas modifier si déjà conforme :
<HeroSection />      // contient AegisIntelligence
<TrustBadges />      // id="trust-badges"
<ParcoursRD />       // id="expertise" — version condensée
<SansAvecAegis />
<ServicesSection />
<PricingSection />   // id="pricing"
<ReglementsSection />
<CTASection />
```

---

## PHASE 3 — VALIDATION & BRIDGE
*MODE : FAST · DURÉE : 20min · CRITICITÉ : ✅ Clôture*

### Checklist 10 points — à cocher avant commit local

```
□ 1. npm run build → "✓ built in X.XXs" · 0 erreur TS · 0 erreur CSS
□ 2. grep -r "cdn.tailwindcss" dist/ → 0 résultats
□ 3. npm run dev → localhost:5173 → rendu visuel identique
□ 4. Brain FR : question → réponse FR mot-à-mot (streaming visible)
□ 5. Brain EN : toggle EN → question EN → réponse EN
□ 6. Starters : clic question starter → envoi direct → réponse streaming
□ 7. CTA "Essai gratuit" : clic → scroll vers PricingSection#pricing
□ 8. CTA "↓ Découvrir" : clic → scroll vers ParcoursRD#expertise
□ 9. Mobile 375px DevTools : AegisIntelligence lisible · input accessible
□ 10. "AEGIS Intelligence" visible partout · zéro occurrence "AEGIS Brain"
```

### CONVERSATION_BRIDGE_20260220T0700.md — À rédiger avant fermeture AG

Structure requise :

```markdown
# CONVERSATION_BRIDGE — AEGIS v3.1-alpha · Session Nocturne AG
Timestamp : 20260220T0700
Fichiers créés : [liste exacte]
Fichiers modifiés : [liste exacte + lignes clés]
Checklist résultat : [10 items PASS/FAIL]
Tests streaming FR/EN : [résultats textuels]
Points ouverts AC+JPC : [liste]
V-Gate P1C actualisé : [tableau]
```

---

## ARCHITECTURE FINALE v3.1-alpha POST-NUIT

```
src/
  components/
    brain/
      AegisChat.tsx            ← inchangé (mode mini — conservé pour /platform futur)
      AegisIntelligence.tsx    ← NOUVEAU (Brain-First hero, Phase 2)
    homepage/
      HeroSection.tsx          ← MODIFIÉ (Brain-First layout, Phase 2)
      ParcoursRD.tsx           ← MODIFIÉ (synthèse condensée + LinkedIn, Phase 1bis)
      i18n.ts                  ← MODIFIÉ (brainTitle + starters + LinkedIn + scrollCta)
      TrustBadges.tsx          ← MODIFIÉ (id="trust-badges" ajouté)
      PricingSection.tsx       ← MODIFIÉ (id="pricing" ajouté)
      [autres 8 composants]    ← inchangés
    common/
      CookieBanner.tsx         ← inchangé
  services/
    geminiService.ts           ← inchangé ✅ streaming validé
  data/
    reglements-europeens-2024.json ← inchangé

api/
  gemini-proxy.ts              ← inchangé ✅ flush() validé

index.html                     ← MODIFIÉ (CDN supprimé, Phase 0)
package.json                   ← MODIFIÉ (3 devDeps ajoutés, Phase 0)
tailwind.config.js             ← NOUVEAU (Phase 0)
postcss.config.js              ← NOUVEAU (Phase 0)
index.css                      ← MODIFIÉ (@tailwind directives, Phase 0)
```

---

---

## PHASE 4 — HORS SCOPE NUIT · SPECS GÉNÉRATION DOCUMENTS INDUSTRIELS
*MODE : PLANNING · DURÉE : À planifier sprint suivant · CRITICITÉ : 🔴 Cœur modèle commercial*

> ⚠️ **NE PAS IMPLÉMENTER CETTE NUIT.** Documentation uniquement, pour la session AC+JPC demain matin.  
> Source : notes manuscrites JP du 16.02.2026 (annotées 18.02) — `AEGIS-CHAT-RISQ-COMPLIANCE-GENERATIVE-DOCUMENT-20260219_161115.pdf`

---

### Vision JP — AEGIS comme moteur de génération de documents techniques industriels

Ce n'est **pas** un simple export PDF. C'est l'**ossature du modèle commercial payant AEGIS** :

```
DISCOVER (0€)     → AEGIS Intelligence chat (questions libres, 3 questions/mois)
STANDARD (50€)    → + Génération Dossier des Charges + Rapport Ecarts/Risques/Non-Conformités
PREMIUM (500€)    → + AMEC/FMEA réglementaire + Gantt/Kanban générés + Architecture SBOM
```

---

### Transcription notes manuscrites JP (16.02.2026 + annotations 18.02)

**Architecture système :**
```
Byte Systems Architecture + Mécatronique + Agents AI Industriels → SBOM
```

**Flux de données entrant dans AEGIS :**
```
→ Matériaux → Nomenclatures → Origine + Logistique
→ Qualité Conformité → Règlement → Normes / Ipso / Standards
```

**Cœur du moteur AEGIS — ce qu'il génère automatiquement :**
```
AEGIS = Document Produit / Dossier des Charges
  ├─ Génération Automatique + Expertise
  ├─ Analyse Robustesse Fiabilité → Spécifications Techniques
  ├─ Harmonique Mécatronique Interrelations → Conformité Structurelle
  └─ AMEC (FMEA/FMECA réglementaire)
```

**Sorties générées (documents payants) :**
```
← Ecarts + Risques + Non-Conformités + MSCascade + GraphRelator
→ Feuille de Route Stratégique Gantt + Kanban
```

---

### Mapping fonctionnel — Sprint suivant

| # | Feature | Tier | Complexité | Stack |
|---|---|---|---|---|
| F1 | Rapport Ecarts/Risques/Non-Conformités PDF | STANDARD | Moyenne | html2pdf.js existant + Gemini |
| F2 | Dossier des Charges auto-généré | STANDARD | Haute | Nouveau template moteur |
| F3 | SBOM (System Bill of Materials) industriel | PREMIUM | Haute | Structure JSON → PDF |
| F4 | AMEC/FMEA réglementaire généré par IA | PREMIUM | Très haute | Gemini long-context |
| F5 | Gantt + Kanban générés automatiquement | PREMIUM | Haute | Composants existants → export |
| F6 | MSCascade + GraphRelator (analyse impacts) | PREMIUM | R&D | Nouveaux modules |

---

### Questions ouvertes pour AC+JPC demain matin

1. **Format Dossier des Charges** : structure standard (IEC 62443 ? ISO 26262 ? custom AEGIS ?)
2. **Inputs utilisateur** : l'utilisateur fournit quoi exactement ? (secteur, type produit, matériaux, normes cibles)
3. **Profondeur AMEC/FMEA** : générique ou paramétré par secteur (auto, batteries, ferroviaire…) ?
4. **SBOM** : format standard (CycloneDX, SPDX) ou format propriétaire AEGIS ?
5. **MSCascade / GraphRelator** : librairies existantes ou développement custom ?
6. **Séquence de déploiement** : F1 d'abord (quick win STANDARD) ou architecture SBOM complète d'abord ?

---

### Note de priorité

F1 (Rapport Ecarts/Risques PDF) est le **quick win** : `html2pdf.js` est déjà dans le stack, Gemini génère déjà l'analyse. Effort estimé : 4-6h AG. C'est le premier livrable payant STANDARD.

Le reste (F2-F6) constitue la **roadmap v3.2-v4.0**, à spécifier avec JP sur base de l'Executive Report 20260218 (Actions 2, 5, 8).

---

## SIGNATURES & TRAÇABILITÉ

| Rôle | Acteur | Timestamp | Statut |
|---|---|---|---|
| Audit filesystem complet | Claude Sonnet 4.6 | 20260219T1750 | ✅ |
| Tests live localhost:5173 | Claude via Chrome | 20260219T1715 | ✅ |
| Lecture docs JP (2 documents) | Claude Sonnet 4.6 | 20260219T1805 | ✅ |
| Brief révisé final + Phase 4 | Claude Sonnet 4.6 | 20260219T2015 | ✅ |
| Décisions GO validées | Jean-Pierre Charles | 20260219T1730 | ✅ |
| Alignement docs validé | Jean-Pierre Charles | 20260219T1930 | ✅ |
| Transfert à AG | Jean-Pierre Charles | ⏳ À confirmer | — |
| Exécution nocturne | AG (Antigravity) | ⏳ Post transfert | — |
| Contre-expertise push | AC + JPC | 20260220 matin | ⏳ |

---

*AEGIS CIRCULAR · AG_BRIEF_EXECUTION_FINAL · 20260219T2000 CET*  
*Référence : AEGIS-BRIEF-AG-FINAL-20260219T2015*  
*Basé sur : filesystem audit + live tests localhost:5173 + docs JP 20260219 + notes manuscrites PDF 16.02.2026*
