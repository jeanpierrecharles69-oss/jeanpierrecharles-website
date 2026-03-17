# 20260312T1500_BRIEF_ACC-BLOG-INSIGHTS-V311-GSEO (RECTIFIE)

**Timestamp** : 20260312T1730 CET (rectification)
**Objet** : Brief pour Claude Desktop mode Code — section blog v3.1.1
**Outil** : Claude Desktop onglet "Code" (PAS le CLI PowerShell)
**Deadline** : 13/03/2026 15h00 CET

---

## ETAPE 1 — CONFIGURER CLAUDE DESKTOP CODE (5 min)

### 1.1 Connecter le dossier projet

1. Ouvrir Claude Desktop
2. Cliquer sur l'onglet **"Code"** en haut
3. En bas a gauche, cliquer **"Selectionner un dossier"**
4. Naviguer vers : `C:\Projects\jeanpierrecharles`
5. Valider

Claude Code va scanner automatiquement le projet (package.json, tsconfig.json, structure src/).

### 1.2 Verifier le mode d'execution

En bas a droite : confirmer que c'est bien **"Local"** (pas Cloud/Remote).

### 1.3 Configurer les permissions

Le dropdown **"Accepter automatiquement les modifications"** :
- Si possible, passer en mode **"Demander confirmation"** ou equivalent
- Si pas d'option : laisser en auto MAIS lire attentivement chaque modification proposee avant de valider
- REGLE : ne jamais laisser Claude modifier .env, .env.local, ou api/gemini-proxy.ts

### 1.4 Modele

Confirmer **Opus 4.6** (visible en bas a droite). C'est le modele le plus fiable pour les modifications multi-fichiers.

---

## ETAPE 2 — CREER CLAUDE.md DANS LE PROJET (3 min)

AVANT de lancer le prompt principal, creer manuellement un fichier `CLAUDE.md` a la racine de `C:\Projects\jeanpierrecharles\`.

**Methode** : ouvrir le Bloc-notes Windows, coller le contenu ci-dessous, sauvegarder comme `CLAUDE.md` (pas .txt) :

```markdown
# AEGIS Intelligence — Project Context

## Stack
- React 19 / TypeScript / Vite 6.2
- Deploy: Vercel auto-deploy via git push origin main
- AI: Gemini 2.0 Flash via SSE proxy (api/gemini-proxy.ts)

## Architecture
- SPA single-page, scroll-based (pas de routing actuellement)
- Homepage composants dans src/components/homepage/
- Brain IA dans src/components/brain/AegisIntelligence.tsx
- i18n bilingue FR/EN via src/components/homepage/i18n.ts
- LangContext pour toggle langue

## Regles IMPERATIVES
1. JAMAIS modifier .env, .env.local, ou api/gemini-proxy.ts
2. JAMAIS afficher de cles API ou secrets
3. JAMAIS git push — JP fait tous les push manuellement
4. JAMAIS git commit sans validation JP
5. npm run build apres chaque modification = 0 erreurs TS
6. Preserver le design glass/light existant
7. BUG-01 connu : react-markdown = markdown brut dans Brain IA

## Nommage
- "AEGIS Intelligence" = nom officiel
- DIAGNOSTIC 250 EUR/rapport
- EXPERTISE TERRAIN 350 EUR/h ou 2500 EUR/mois
- Fondateur : Jean-Pierre Charles, 32 ans R&D, 6 groupes internationaux
```

---

## ETAPE 3 — GIT BRANCHE DE SECURITE (2 min)

Ouvrir un terminal PowerShell SEPARE (pas dans Claude Desktop) :

```powershell
cd C:\Projects\jeanpierrecharles
git checkout -b feature/blog-insights-v311
```

Cela protege la branche main. Si quelque chose casse, tu reviens avec `git checkout main`.

---

## ETAPE 4 — COLLER LE PROMPT DANS CLAUDE DESKTOP CODE

Dans le champ de saisie (la ou il est ecrit "Find a small todo..."), coller CE PROMPT :

---

DEBUT DU PROMPT A COPIER-COLLER :

```
Lis d'abord le fichier CLAUDE.md a la racine du projet pour comprendre 
les regles et l'architecture.

Puis execute ces modifications dans l'ordre, en faisant npm run build 
apres chaque etape pour verifier 0 erreurs TypeScript :

PHASE 1 — DEPENDANCES
- npm install react-router-dom react-helmet-async marked
- npm run build → doit passer

PHASE 2 — DONNEES ARTICLES
- Creer src/data/blogData.ts
- Interface BlogArticle : id (slug), publishDate, author, tags[], readingTime, 
  fr/en (title, subtitle, metaDescription, content string Markdown)
- Premier article :
  id = "cra-ai-act-reglements-meres-industrie-5"
  date = "2026-03-13"
  author = "Jean-Pierre Charles"
  tags = ["AI Act", "CRA", "Industrie 5.0", "PME", "Compliance"]
  readingTime = 7
  FR title = "AI Act + CRA : les reglements-meres de l'Industrie 5.0"
  EN title = "AI Act + CRA: the parent regulations of Industry 5.0"
  FR subtitle = "Pourquoi la convergence reglementaire europeenne est le plus puissant levier de transformation industrielle depuis le marquage CE"
  EN subtitle = "Why European regulatory convergence is the most powerful lever for industrial transformation since CE marking"
  FR metaDescription (max 160 chars) = "Comment l'EU AI Act et le CRA deviennent les fondations dont decoulent Machinery CE, ESPR, NIS2, Battery Reg pour les PME industrielles EU."
  EN metaDescription = "How the EU AI Act and CRA become the foundations from which Machinery CE, ESPR, NIS2, Battery Reg cascade down for industrial SMEs."
  content FR et EN = "CONTENU_A_INSERER" (placeholder, je remplacerai apres)
- npm run build → doit passer

PHASE 3 — COMPOSANT BLOG SECTION
- Creer src/components/blog/BlogSection.tsx
- Section avec id="insights"
- Titre i18n : "Intelligence Industrielle" / "Industrial Intelligence"
- Sous-titre : "Analyses & Decryptages" / "Analysis & Insights"
- Affiche les articles en cartes cliquables (style coherent avec ReglementsSection : 
  glass/backdrop-blur, border subtle, hover)
- Utilise useLang() et useNavigate()
- Clic carte → navigate vers /insights/{article.id}
- npm run build → doit passer

PHASE 4 — PAGE ARTICLE
- Creer src/components/blog/ArticlePage.tsx
- Route /insights/:articleId
- Layout max-w-3xl mx-auto, typo lisible
- Header : titre, sous-titre, auteur, date formatee, tags badges, temps de lecture
- Corps : rendu Markdown via la lib "marked" (PAS react-markdown — BUG-01 connu)
  Utilise : import { marked } from 'marked' puis dangerouslySetInnerHTML={{ __html: marked(content) }}
- Bouton "Retour aux analyses" → navigate('/') 
- npm run build → doit passer

PHASE 5 — JSON-LD GSEO
- Creer src/components/blog/ArticleJsonLd.tsx
  JSON-LD type Article avec : headline, description, author (Jean-Pierre Charles, 
  R&D Expert, knowsAbout EU AI Act/CRA/Machinery/Battery/ESPR/NIS2), 
  publisher AEGIS Intelligence, datePublished, keywords
  Injecte via react-helmet-async dans <head>
  + meta tags OG dynamiques + canonical URL
- Creer src/components/blog/OrganizationJsonLd.tsx
  JSON-LD Organization pour AEGIS Intelligence sur la homepage
- npm run build → doit passer

PHASE 6 — ROUTING APP.TSX
- Modifier App.tsx :
  * Wrapper BrowserRouter + HelmetProvider autour de tout
  * Extraire les composants homepage actuels dans un composant HomePage
  * Ajouter BlogSection entre ReglementsSection et CTASection dans HomePage
  * Ajouter OrganizationJsonLd dans HomePage
  * Routes : "/" → HomePage, "/insights/:articleId" → ArticlePage
  * NavBar doit etre GLOBAL (hors des Routes, visible sur toutes les pages)
  * CookieBanner aussi global
- ATTENTION : preserver TOUS les composants existants, zero regression
- npm run build → doit passer

PHASE 7 — NAVBAR + I18N
- Modifier NavBar.tsx : ajouter lien "Insights" entre Tarifs/Pricing et Contact
  Si sur homepage → scroll smooth vers #insights
  Si sur page article → navigate('/') puis scroll
- Modifier i18n.ts : ajouter cles blog FR/EN
  blogSectionTitle, blogSectionSubtitle, blogReadMore, blogReadingTime, 
  blogBackToInsights, blogPublishedOn
- npm run build → doit passer

PHASE 8 — VERCEL REWRITE
- Creer vercel.json a la racine :
  { "rewrites": [{ "source": "/insights/(.*)", "destination": "/index.html" }] }

PHASE 9 — V&V FINALE
- npm run build → 0 erreurs
- npm run dev → ouvrir localhost:5173
- Verifier : homepage identique v3.1, section Insights visible, 
  clic carte → page article, JSON-LD dans <head>, toggle FR/EN OK partout,
  bouton retour fonctionne

NE FAIS PAS de git commit. Je le ferai moi-meme.
Ne touche PAS a .env, .env.local, api/gemini-proxy.ts.
```

FIN DU PROMPT

---

## ETAPE 5 — SUPERVISER L'EXECUTION

Claude Desktop Code va :
1. Lire CLAUDE.md et la structure du projet
2. Te montrer chaque fichier cree/modifie
3. Executer npm install et npm run build
4. Signaler les erreurs et proposer des corrections

**TON ROLE** : Lire les modifications proposees. Valider ou refuser.

---

## ETAPE 6 — V&V MANUELLE (10 min)

Ouvrir un navigateur sur http://localhost:5173 (Claude Code aura lance npm run dev).

```
[ ] 1. Homepage identique a v3.1 (zero regression)
[ ] 2. Section "Intelligence Industrielle" visible avant CTA
[ ] 3. Carte article affichee avec titre, date, tags
[ ] 4. Clic carte → /insights/cra-ai-act-reglements-meres-industrie-5
[ ] 5. ArticlePage affiche titre + placeholder contenu
[ ] 6. DevTools → Elements → chercher "ld+json" → JSON-LD present
[ ] 7. Bouton retour → homepage #insights
[ ] 8. NavBar "Insights" → scroll smooth
[ ] 9. Toggle FR/EN fonctionne (BlogSection + ArticlePage)
[ ] 10. npm run build → 0 erreurs final
```

---

## ETAPE 7 — INJECTION CONTENU ARTICLE (apres V&V structure)

Revenir dans Claude Desktop Code et demander :

```
Remplace "CONTENU_A_INSERER" dans src/data/blogData.ts par le contenu 
Markdown que je vais te fournir. D'abord la version FR, puis la version EN.
```

Puis coller le contenu Markdown de l'article (prepare dans claude.ai web).

---

## ETAPE 8 — DEPLOY

Dans PowerShell (PAS dans Claude Desktop) :

```powershell
cd C:\Projects\jeanpierrecharles
git add .
git diff --cached   # VERIFIER : 0 secret expose
git commit -m "feat: add Intelligence Industrielle blog section with GSEO JSON-LD v3.1.1"
git checkout main
git merge feature/blog-insights-v311
git push origin main
```

---

## MESURES DE SECURITE

| # | Regle |
|---|---|
| S1 | Creer branche feature/ AVANT toute modification |
| S2 | Verifier git diff avant commit : 0 secret, 0 cle API |
| S3 | Ne pas autoriser modification de .env ou api/gemini-proxy.ts |
| S4 | npm run build apres CHAQUE phase |
| S5 | V&V visuelle localhost avant push |
| S6 | JP fait TOUS les git push |
| S7 | Mode "Local" confirme (pas Cloud) |
| S8 | Cowork = INTERDIT (D10r2) |

---

*Brief ACC rectifie — Claude Desktop Code*
*Opus 4.6 — 12/03/2026 17h30 CET*
