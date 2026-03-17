# 20260312T1500_BRIEF_AG-BLOG-INSIGHTS-V311-GSEO

**Timestamp session** : 20260312T1500 CET
**Auteur** : Claude Opus 4.6 (claude.ai Web)
**Objet** : Brief AG -- Implementation section "Intelligence Industrielle" + SSG GSEO v3.1.1
**Deadline** : 13/03/2026 15h00 CET (< 24h)
**Statut** : POUR EXECUTION AG via Claude Desktop MCP
**IDs temporaires** : D_T1500_01 a D_T1500_09

---

## 0. CONTEXTE OPERATIONNEL

v3.1 est en production (commit 4837709, deploy 10/03/2026).
JP demande l'ajout d'une section blog "Intelligence Industrielle -- Analyses et Decryptages" avec pre-rendu SSG pour GSEO reel. Le premier article sera publie demain 13/03 : analyse CRA + AI Act comme reglements-meres de l'Industrie 5.0.

**Stack actuel** : React 19 / TypeScript / Vite 6.2 / Vercel auto-deploy
**Architecture actuelle** : SPA single-page, scroll-based, pas de routing
**Pattern existant** : i18n.ts pour traductions, composants homepage dans src/components/homepage/

---

## 1. FICHIERS A CREER (6 nouveaux fichiers)

### 1.1 src/data/blogData.ts

Donnees des articles, bilingue FR/EN. Structure :

```typescript
export interface BlogArticle {
  id: string;           // slug URL-friendly ex: "cra-ai-act-reglements-meres-industrie-5"
  publishDate: string;  // ISO "2026-03-13"
  author: string;       // "Jean-Pierre Charles"
  tags: string[];       // ["AI Act", "CRA", "Industrie 5.0", "PME"]
  readingTime: number;  // minutes
  fr: {
    title: string;
    subtitle: string;
    metaDescription: string;  // max 160 chars pour SEO
    content: string;          // Markdown complet de l'article
  };
  en: {
    title: string;
    subtitle: string;
    metaDescription: string;
    content: string;
  };
}

export const blogArticles: BlogArticle[] = [
  {
    id: "cra-ai-act-reglements-meres-industrie-5",
    publishDate: "2026-03-13",
    author: "Jean-Pierre Charles",
    tags: ["AI Act", "CRA", "Industrie 5.0", "PME", "Compliance"],
    readingTime: 7,
    fr: {
      title: "AI Act + CRA : les reglements-meres de l'Industrie 5.0",
      subtitle: "Pourquoi la convergence reglementaire europeenne est le plus puissant levier de transformation industrielle depuis le marquage CE",
      metaDescription: "Analyse expert : comment l'EU AI Act et le Cyber Resilience Act deviennent les fondations reglementaires dont decoulent Machinery CE, ESPR, NIS2, Battery Reg pour les PME industrielles.",
      content: `CONTENU_ARTICLE_FR_A_INSERER_PAR_OPUS`
    },
    en: {
      title: "AI Act + CRA: the parent regulations of Industry 5.0",
      subtitle: "Why European regulatory convergence is the most powerful lever for industrial transformation since CE marking",
      metaDescription: "Expert analysis: how the EU AI Act and Cyber Resilience Act become the regulatory foundations from which Machinery CE, ESPR, NIS2, Battery Reg cascade down for industrial SMEs.",
      content: `CONTENU_ARTICLE_EN_A_INSERER_PAR_OPUS`
    }
  }
];
```

**IMPORTANT** : Les champs `content` seront remplaces par Opus avec le contenu Markdown complet apres validation JP. AG doit creer la structure avec un placeholder `CONTENU_ARTICLE_FR_A_INSERER_PAR_OPUS` et `CONTENU_ARTICLE_EN_A_INSERER_PAR_OPUS`.

---

### 1.2 src/components/blog/BlogSection.tsx

Composant liste des articles, integre dans la page principale (scroll anchor).

```
SPECIFICATIONS :
- id="insights" sur la section root (pour scroll NavBar)
- Titre section : "Intelligence Industrielle" / "Industrial Intelligence"
- Sous-titre : "Analyses & Decryptages" / "Analysis & Insights"
- Affiche les articles sous forme de cartes (max 3 visibles, grille responsive)
- Chaque carte : titre, date, tags (badges), temps de lecture, sous-titre
- Clic sur une carte → navigation vers ArticlePage (voir 1.3)
- Design coherent avec le style existant (glass/light, memes couleurs)
- Utiliser useLang() du LangContext existant
- Import blogArticles depuis ../../data/blogData
```

Structure JSX attendue :

```tsx
import { useLang } from '../homepage/LangContext';
import { blogArticles } from '../../data/blogData';
import { useNavigate } from 'react-router-dom'; // NOUVEAU -- voir section 2

export default function BlogSection() {
  const { lang } = useLang();
  const navigate = useNavigate();
  // ... map blogArticles → cartes
  // onClick → navigate(`/insights/${article.id}`)
}
```

**Style** : Reprendre les patterns visuels de ReglementsSection (cartes avec backdrop-blur, border subtle, hover scale). Palette : memes variables CSS que le reste du site.

---

### 1.3 src/components/blog/ArticlePage.tsx

Page individuelle article. C'est la page qui sera pre-rendue en SSG.

```
SPECIFICATIONS :
- Route : /insights/:articleId
- Layout : max-w-3xl mx-auto, padding genereux, typographie lisible
- Header : titre, sous-titre, auteur "Jean-Pierre Charles", date formatee, tags, temps de lecture
- Corps : rendu Markdown via react-markdown (meme lib que Brain IA)
  - IMPORTANT : si BUG-01 non encore fixe, utiliser dangerouslySetInnerHTML avec un parser markdown simple (marked) en fallback
- Footer article : CTA vers jeanpierrecharles.com (diagnostic), lien retour blog
- Bouton "Retour aux analyses" → navigate('/') + scroll to #insights
- JSON-LD structured data (voir 1.4)
- Meta tags dynamiques (voir 1.5)
```

---

### 1.4 src/components/blog/ArticleJsonLd.tsx

Composant qui injecte le JSON-LD dans le `<head>` pour GSEO.

```tsx
import { Helmet } from 'react-helmet-async';
import { BlogArticle } from '../../data/blogData';

interface Props {
  article: BlogArticle;
  lang: 'fr' | 'en';
}

export default function ArticleJsonLd({ article, lang }: Props) {
  const localized = article[lang];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": localized.title,
    "description": localized.metaDescription,
    "author": {
      "@type": "Person",
      "name": "Jean-Pierre Charles",
      "jobTitle": "Expert R&D Industrial Compliance & AI",
      "url": "https://jeanpierrecharles.com",
      "knowsAbout": ["EU AI Act", "Cyber Resilience Act", "Machinery Regulation", "Industrial Compliance", "Mechatronics", "Lithium Batteries"]
    },
    "publisher": {
      "@type": "Organization",
      "name": "AEGIS Intelligence",
      "url": "https://jeanpierrecharles.com"
    },
    "datePublished": article.publishDate,
    "mainEntityOfPage": `https://jeanpierrecharles.com/insights/${article.id}`,
    "keywords": article.tags.join(", "),
    "inLanguage": lang === 'fr' ? "fr-FR" : "en-US",
    "about": [
      { "@type": "Thing", "name": "EU AI Act", "url": "https://artificialintelligenceact.eu/" },
      { "@type": "Thing", "name": "Cyber Resilience Act", "url": "https://www.european-cyber-resilience-act.com/" },
      { "@type": "Thing", "name": "Industry 5.0" }
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <title>{localized.title} | AEGIS Intelligence</title>
      <meta name="description" content={localized.metaDescription} />
      <meta property="og:title" content={localized.title} />
      <meta property="og:description" content={localized.metaDescription} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={`https://jeanpierrecharles.com/insights/${article.id}`} />
      <link rel="canonical" href={`https://jeanpierrecharles.com/insights/${article.id}`} />
    </Helmet>
  );
}
```

---

### 1.5 src/components/blog/OrganizationJsonLd.tsx

JSON-LD Organisation pour la homepage (GSEO global).

```tsx
import { Helmet } from 'react-helmet-async';

export default function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "AEGIS Intelligence",
    "url": "https://jeanpierrecharles.com",
    "description": "Expert intelligence as a service for EU industrial compliance - AI Act, CRA, Machinery Regulation, Battery Regulation, ESPR, NIS2",
    "founder": {
      "@type": "Person",
      "name": "Jean-Pierre Charles",
      "jobTitle": "Founder & R&D Expert",
      "description": "32 years of R&D engineering across 6 international industrial groups"
    },
    "areaServed": "EU",
    "knowsAbout": ["EU AI Act", "Cyber Resilience Act", "Machinery Regulation 2023/1230", "Battery Regulation 2023/1542", "CSRD", "NIS2", "ESPR", "Data Act", "REACH"],
    "serviceType": "Industrial Compliance Intelligence"
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}
```

---

### 1.6 vite-ssg.config.ts (OU modification vite.config.ts)

Configuration SSG pour pre-rendu des pages articles.

**Option A (recommandee)** : Utiliser `vite-ssg` plugin

```bash
npm install vite-ssg
```

**Option B (fallback si vite-ssg incompatible)** : Script post-build avec `puppeteer` ou `prerender-spa-plugin`

```bash
npm install --save-dev prerender-spa-plugin
```

AG doit d'abord tester Option A. Si echec, passer a Option B.

**Configuration Option A** dans vite.config.ts :

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Ajouter :
import { ViteSSG } from 'vite-ssg'; // si compatible

export default defineConfig({
  plugins: [react()],
  // ... config existante preservee
});
```

**Script SSG alternatif** (si vite-ssg ne fonctionne pas avec React 19) :

Creer `scripts/prerender.mjs` :

```javascript
import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { blogArticles } from '../src/data/blogData.js';

// Routes a pre-rendre
const routes = [
  '/',
  ...blogArticles.map(a => `/insights/${a.id}`)
];

// Utiliser le build statique + injection meta tags
routes.forEach(route => {
  const dir = `dist${route}`;
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  // Copier index.html avec meta tags injectes
  // ... logique de pre-rendu
});
```

**ATTENTION** : AG doit tester que le build passe sans erreur avant de passer a la suite. Si le SSG est trop complexe en < 24h, livrer Couche 1 (composant + JSON-LD + react-helmet) et noter le SSG comme action restante pour Opus.

---

## 2. FICHIERS A MODIFIER (4 fichiers existants)

### 2.1 package.json -- Ajouter dependances

```bash
npm install react-router-dom react-helmet-async marked
```

Verifier que `react-markdown` est deja installe (pour Brain IA). Si oui, reutiliser pour le rendu articles.

---

### 2.2 App.tsx -- Ajouter routing

**AVANT** (structure actuelle, SPA scroll-based) :

```tsx
function App() {
  return (
    <LangProvider>
      {/* ... */}
      <HeroSection />
      <TrustBadges />
      <ParcoursRD />
      <SansAvecAegis />
      <ServicesSection />
      <PricingSection />
      <ReglementsSection />
      <CTASection />
      <CookieBanner />
    </LangProvider>
  );
}
```

**APRES** :

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import BlogSection from './components/blog/BlogSection';
import ArticlePage from './components/blog/ArticlePage';
import OrganizationJsonLd from './components/blog/OrganizationJsonLd';

function HomePage() {
  return (
    <>
      <OrganizationJsonLd />
      <HeroSection />
      <TrustBadges />
      <ParcoursRD />
      <SansAvecAegis />
      <ServicesSection />
      <PricingSection />
      <ReglementsSection />
      <BlogSection />          {/* NOUVEAU -- avant CTASection */}
      <CTASection />
      <CookieBanner />
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <LangProvider>
        <BrowserRouter>
          <NavBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/insights/:articleId" element={<ArticlePage />} />
          </Routes>
        </BrowserRouter>
      </LangProvider>
    </HelmetProvider>
  );
}
```

**CRITIQUES** :
- Preserver TOUS les composants existants sans modification
- NavBar doit etre sorti du flux HomePage pour etre global
- HelmetProvider wrape tout pour react-helmet-async
- BrowserRouter wrape les routes
- Verifier que `<CookieBanner />` est accessible sur toutes les routes

---

### 2.3 NavBar.tsx -- Ajouter lien "Insights"

Ajouter un lien de navigation vers la section blog.

**Dans la liste de navigation FR** :
- Ajouter entre "Tarifs" et "Contact" : `{ label: "Insights", target: "insights" }`

**Dans la liste de navigation EN** :
- Ajouter entre "Pricing" et "Contact" : `{ label: "Insights", target: "insights" }`

**Logique de scroll/navigation** :
- Si on est sur "/" : scrollIntoView smooth vers #insights
- Si on est sur "/insights/:id" : navigate("/") puis scroll vers #insights

AG doit adapter le pattern existant de mapping label → section id.

---

### 2.4 i18n.ts -- Ajouter cles blog

Ajouter dans la section FR :

```typescript
blogSectionTitle: "Intelligence Industrielle",
blogSectionSubtitle: "Analyses & Decryptages",
blogReadMore: "Lire l'analyse",
blogReadingTime: "min de lecture",
blogBackToInsights: "Retour aux analyses",
blogPublishedOn: "Publie le",
blogAuthor: "Jean-Pierre Charles",
blogCta: "Decouvrir AEGIS Intelligence",
```

Ajouter dans la section EN :

```typescript
blogSectionTitle: "Industrial Intelligence",
blogSectionSubtitle: "Analysis & Insights",
blogReadMore: "Read analysis",
blogReadingTime: "min read",
blogBackToInsights: "Back to insights",
blogPublishedOn: "Published on",
blogAuthor: "Jean-Pierre Charles",
blogCta: "Discover AEGIS Intelligence",
```

---

### 2.5 vercel.json -- Ajouter rewrite pour SPA routing

Creer ou modifier `vercel.json` a la racine du projet :

```json
{
  "rewrites": [
    { "source": "/insights/(.*)", "destination": "/index.html" }
  ]
}
```

Cela permet a Vercel de servir l'app React pour toutes les routes `/insights/*` au lieu de retourner un 404.

---

## 3. FICHIERS NON TOUCHES (verification)

- api/gemini-proxy.ts -- NON MODIFIE
- .env / .env.local -- NON MODIFIE
- src/components/brain/* -- NON MODIFIE
- src/services/* -- NON MODIFIE
- src/components/homepage/HeroSection.tsx -- NON MODIFIE
- src/components/homepage/PricingSection.tsx -- NON MODIFIE
- src/components/homepage/ReglementsSection.tsx -- NON MODIFIE
- src/components/homepage/ServicesSection.tsx -- NON MODIFIE
- src/components/homepage/CTASection.tsx -- NON MODIFIE
- src/components/homepage/ParcoursRD.tsx -- NON MODIFIE

---

## 4. CHECKLIST V&V (10 points)

```
[ ] 1. npm install react-router-dom react-helmet-async marked → 0 erreurs
[ ] 2. npm run build → 0 erreurs TypeScript
[ ] 3. npm run dev → localhost:5173 → homepage identique a v3.1
[ ] 4. Section "Intelligence Industrielle" visible entre Reglements et CTA
[ ] 5. Clic carte article → /insights/cra-ai-act-reglements-meres-industrie-5
[ ] 6. ArticlePage affiche titre, date, tags, contenu markdown rendu
[ ] 7. JSON-LD present dans <head> (DevTools → Elements → chercher ld+json)
[ ] 8. Bouton "Retour aux analyses" → retour homepage #insights
[ ] 9. NavBar "Insights" → scroll smooth vers section blog
[ ] 10. Toggle FR/EN fonctionne sur BlogSection ET ArticlePage
```

---

## 5. SEQUENCAGE EXECUTION (< 24h)

| Etape | Duree est. | Action | Agent |
|---|---|---|---|
| E1 | 30min | npm install dependances + verifier build passe | AG |
| E2 | 1h | Creer blogData.ts + BlogSection.tsx + i18n.ts cles | AG |
| E3 | 1h30 | Creer ArticlePage.tsx + ArticleJsonLd.tsx + OrganizationJsonLd.tsx | AG |
| E4 | 1h | Modifier App.tsx (routing) + NavBar.tsx (lien) + vercel.json | AG |
| E5 | 30min | V&V checklist 10 points + npm run build | AG |
| E6 | 1-2h | SSG pre-rendu : tester vite-ssg ou prerender-spa-plugin | AG |
| E7 | 30min | Opus contre-expertise MCP Filesystem + Chrome | Opus Desktop |
| E8 | -- | Opus insere contenu article (Markdown FR+EN) dans blogData.ts | Opus Desktop |
| E9 | -- | JP V&V finale + git push | JP |

**Total estime** : 6-8h execution AG + 1h Opus V&V + contenu article

---

## 6. RISQUES ET FALLBACKS

| Risque | Proba | Fallback |
|---|---|---|
| react-router-dom casse le scroll SPA existant | Moyenne | Tester ScrollRestoration, ou HashRouter en dernier recours |
| vite-ssg incompatible React 19 | Elevee | Fallback prerender-spa-plugin ou script puppeteer post-build |
| react-helmet-async conflit avec head existant | Faible | Injection manuelle dans index.html via plugin Vite |
| BUG-01 markdown raw affecte aussi ArticlePage | Elevee | Utiliser `marked` + `dangerouslySetInnerHTML` en attendant fix |
| Build > 500kB warning avec nouvelles deps | Moyenne | Lazy-load ArticlePage via React.lazy() |

**REGLE** : Si SSG (Couche 2) bloque apres 2h de tentatives, livrer Couche 1 complete (composant + JSON-LD + routing) et noter SSG comme action restante Opus. NE PAS bloquer le deploy pour le SSG.

---

## 7. DECISIONS (IDs temporaires T1500)

| ID | Decision | Statut |
|---|---|---|
| D_T1500_01 | Creer section "Intelligence Industrielle -- Analyses et Decryptages" dans v3.1.1 | VALIDE JP |
| D_T1500_02 | Integrer GSEO (JSON-LD + SSG) dans v3.1.1 au lieu de v3.2 | VALIDE JP |
| D_T1500_03 | Premier article = "AI Act + CRA reglements-meres Industrie 5.0" publie 13/03 | VALIDE JP |
| D_T1500_04 | Routing React Router DOM pour pages articles individuelles | POUR V&V OPUS |
| D_T1500_05 | vercel.json rewrite pour SPA routing Vercel | POUR V&V OPUS |
| D_T1500_06 | SSG = best effort < 24h, Couche 1 = livrable minimum | POUR V&V JP |
| D_T1500_07 | Position BlogSection : entre ReglementsSection et CTASection | VALIDE JP |
| D_T1500_08 | Contenu article insere par Opus apres structure AG validee | WORKFLOW |
| D_T1500_09 | Post LinkedIn FR + EN valides, prets a publier | VALIDE JP |

---

## 8. ACTIONS IMMEDIATES

| Prio | Action | Responsable | Echeance |
|---|---|---|---|
| P0 | Publier post LinkedIn FR (V3 finale rectifiee) | JP | 12/03 soir |
| P0 | Ouvrir session Opus Desktop MCP — copier ce brief | JP | 12/03 soir |
| P0 | Opus Desktop : lire code actuel App.tsx + NavBar.tsx + vite.config.ts | Opus | 12/03 soir |
| P0 | Opus Desktop : adapter ce brief aux specificites code reel | Opus | 12/03 soir |
| P0 | AG execute brief adapte — Couche 1 d'abord, Couche 2 ensuite | AG | 13/03 matin |
| P0 | Opus V&V checklist 10 points | Opus | 13/03 midi |
| P0 | Opus insere contenu article FR+EN dans blogData.ts | Opus | 13/03 apres-midi |
| P1 | JP V&V finale + git push v3.1.1 | JP | 13/03 15h00 |
| P1 | Publier post LinkedIn EN | JP | 13/03 apres deploy |

---

*AEGIS Intelligence -- Brief AG Blog/Insights v3.1.1 + GSEO*
*Reference : 20260312T1500_BRIEF_AG-BLOG-INSIGHTS-V311-GSEO*
*Opus 4.6 -- 12/03/2026 15h00 CET -- ASCII-safe*
*IDs temporaires D_T1500_01 a D_T1500_09*
*Derniers IDs definitifs : D167, L120, R58*
