# 20260312T1500_BRIEF_ACC-BLOG-INSIGHTS-V311-GSEO

**Timestamp session** : 20260312T1500 CET
**Auteur** : Claude Opus 4.6 (claude.ai Web)
**Objet** : Brief ACC (Anthropic Claude Code) -- Implementation section "Intelligence Industrielle" + GSEO v3.1.1
**Deadline** : 13/03/2026 15h00 CET (< 24h)
**Statut** : POUR EXECUTION JP via Claude Code CLI sur Surface Pro 11 ARM64
**IDs temporaires** : D_T1500_01 a D_T1500_09

---

## 0. POURQUOI CLAUDE CODE AU LIEU D'AG

| Critere | AG (Gemini) | Claude Code |
|---|---|---|
| Lit le code reel | Non (copier-coller) | Oui (acces filesystem direct) |
| Edite les fichiers | Non (brief avant/apres) | Oui (edit in-place) |
| Teste le build | Non | Oui (npm run build dans le terminal) |
| Fiabilite | ~85% avec brief structure | ~95%+ avec CLAUDE.md |
| V&V integree | Non (contre-expertise Opus) | Oui (lit+verifie+corrige) |
| Git | Non | Oui (mais JP garde le push) |

**Conclusion** : Claude Code execute directement le travail qu'AG necessite un brief de 500 lignes pour approximer.

---

## 1. INSTALLATION CLAUDE CODE SUR SURFACE PRO 11 ARM64

### 1.1 Pre-requis

- **Surface Pro 11 ARM64, Windows 11 25H2** : OK
- **Claude Max 5x (100 EUR/mois)** : Inclut Claude Code, pas de cout additionnel
- **PowerShell 7.5.4 ARM64** : Deja installe (aegis-sync-hub.ps1)

### 1.2 Installation native (methode recommandee -- PAS npm)

Ouvrir **PowerShell en mode administrateur** :

```powershell
irm https://claude.ai/install.ps1 | iex
```

C'est tout. Pas de Node.js requis. Le binaire natif s'installe dans `~\.local\bin\claude.exe` et s'auto-met a jour.

### 1.3 Verification

```powershell
claude --version
```

Doit afficher un numero de version sans erreur.

### 1.4 Authentification (premiere fois)

```powershell
claude
```

→ Ouvre le navigateur automatiquement pour OAuth avec ton compte Claude Max.
→ Token stocke localement dans `~\.claude\` — pas de cle API a manipuler.

**SECURITE** : L'authentification OAuth utilise ton abonnement Claude Max existant. JAMAIS d'export de cle API en variable d'environnement sur une machine de production.

---

## 2. CONFIGURATION PROJET — CLAUDE.md

### 2.1 Dossier a connecter

Claude Code travaille dans le dossier ou tu le lances. Tu dois :

```powershell
cd C:\Projects\jeanpierrecharles
claude
```

Claude Code va automatiquement :
1. Scanner la structure du projet
2. Lire package.json, vite.config.ts, tsconfig.json
3. Chercher un fichier CLAUDE.md a la racine pour les instructions projet

### 2.2 Creer CLAUDE.md a la racine du projet

**AVANT de lancer la premiere commande**, creer ce fichier :

```powershell
New-Item -Path "C:\Projects\jeanpierrecharles\CLAUDE.md" -ItemType File
```

Puis copier-coller le contenu suivant dans CLAUDE.md :

```markdown
# AEGIS Intelligence — Project Context for Claude Code

## Stack
- React 19 / TypeScript / Vite 6.2
- Deploy: Vercel auto-deploy via git push origin main
- Hosting: Gandi.net DNS → Vercel
- AI: Gemini 2.0 Flash via SSE proxy (api/gemini-proxy.ts)

## Architecture
- SPA single-page, scroll-based (pas de routing actuellement)
- Composants homepage dans src/components/homepage/
- Composant Brain IA dans src/components/brain/AegisIntelligence.tsx
- i18n bilingue FR/EN via src/components/homepage/i18n.ts
- LangContext pour toggle langue
- CookieBanner RGPD dans src/components/common/

## Regles IMPERATIVES
1. JAMAIS modifier .env, .env.local, ou api/gemini-proxy.ts
2. JAMAIS afficher de cles API, tokens, ou secrets — meme en commentaires
3. JAMAIS git push — JP fait tous les push manuellement
4. JAMAIS git commit sans validation JP explicite
5. Toujours faire npm run build apres chaque modification pour verifier 0 erreurs TS
6. Preserver le design existant (glass/light theme, palette couleurs)
7. Tester le toggle FR/EN apres toute modification i18n
8. BUG-01 connu : react-markdown affiche du markdown brut dans Brain IA (defere v3.2)

## Nommage
- "AEGIS Intelligence" = nom officiel partout
- Pricing : DIAGNOSTIC 250 EUR/rapport, EXPERTISE TERRAIN 350 EUR/h ou 2500 EUR/mois
- Fondateur : Jean-Pierre Charles, 32 ans R&D, 6 groupes internationaux

## Fichiers sensibles (NE PAS TOUCHER)
- .env / .env.local
- api/gemini-proxy.ts
- vite.config.ts (sauf ajout plugin SSG documente)
```

### 2.3 Fichier .claude/settings.json (permissions)

Claude Code a un systeme de permissions a 3 niveaux :
- **Ask** : demande confirmation pour chaque action (defaut securise)
- **Allowlisted** : actions pre-approuvees
- **--dangerously-skip-permissions** : INTERDIT

**Pour AEGIS, on reste en mode Ask (defaut)**. Claude Code te demandera confirmation avant chaque ecriture de fichier et chaque commande terminal. Tu valides ou tu refuses.

---

## 3. CE QUE JP DOIT FAIRE (step by step)

### Etape 1 — Installation (15 min) — Ce soir 12/03

```
1. Ouvrir PowerShell Admin
2. irm https://claude.ai/install.ps1 | iex
3. Fermer et rouvrir PowerShell
4. claude --version → verifier OK
5. claude → OAuth dans navigateur → authentifier avec compte Max
```

### Etape 2 — Configuration projet (10 min) — Ce soir 12/03

```
1. cd C:\Projects\jeanpierrecharles
2. Creer CLAUDE.md (contenu section 2.2 ci-dessus)
3. Verifier : git status → branche main, working tree clean
4. OPTIONNEL : git checkout -b feature/blog-insights-v311
   (branche de securite — recommande)
```

### Etape 3 — Lancer Claude Code sur le projet (demain matin 13/03)

```powershell
cd C:\Projects\jeanpierrecharles
claude
```

### Etape 4 — Donner les instructions a Claude Code

Copier-coller ce prompt dans le terminal Claude Code :

---

**PROMPT CLAUDE CODE — COPIER-COLLER :**

```
Je veux ajouter une section blog "Intelligence Industrielle — Analyses & Decryptages" 
a mon site React/Vite existant. Voici les specifications :

1. DEPENDANCES : Installer react-router-dom, react-helmet-async, marked

2. NOUVEAU FICHIER src/data/blogData.ts :
   - Interface BlogArticle avec id, publishDate, author, tags, readingTime, fr/en (title, subtitle, metaDescription, content en Markdown)
   - Premier article : id="cra-ai-act-reglements-meres-industrie-5", date 2026-03-13
   - Titre FR : "AI Act + CRA : les reglements-meres de l'Industrie 5.0"
   - Titre EN : "AI Act + CRA: the parent regulations of Industry 5.0"
   - Contenu placeholder pour l'instant : "CONTENU_A_INSERER"

3. NOUVEAU FICHIER src/components/blog/BlogSection.tsx :
   - Section avec id="insights" 
   - Titre utilisant i18n : "Intelligence Industrielle" / "Industrial Intelligence"
   - Sous-titre : "Analyses & Decryptages" / "Analysis & Insights"
   - Cartes articles cliquables, design coherent avec ReglementsSection (glass/backdrop-blur)
   - useLang() pour i18n, useNavigate() pour routing

4. NOUVEAU FICHIER src/components/blog/ArticlePage.tsx :
   - Route /insights/:articleId
   - Layout max-w-3xl, typo lisible, header (titre, date, author, tags, reading time)
   - Rendu markdown via la lib "marked" (pas react-markdown, BUG-01 connu)
   - Bouton retour vers homepage #insights
   - JSON-LD Article schema dans <head> via react-helmet-async
   - Meta tags OG dynamiques

5. NOUVEAU FICHIER src/components/blog/OrganizationJsonLd.tsx :
   - JSON-LD Organization pour AEGIS Intelligence sur la homepage
   - Inclure founder Jean-Pierre Charles, knowsAbout tous les reglements EU

6. MODIFIER App.tsx :
   - Wrapper avec BrowserRouter et HelmetProvider
   - Extraire les composants homepage dans un composant HomePage
   - Routes : "/" → HomePage, "/insights/:articleId" → ArticlePage
   - NavBar global (hors des routes)
   - BlogSection insere entre ReglementsSection et CTASection
   - OrganizationJsonLd sur la homepage

7. MODIFIER NavBar.tsx :
   - Ajouter lien "Insights" entre "Tarifs"/"Pricing" et "Contact"
   - Si sur homepage : scroll smooth vers #insights
   - Si sur article : navigate("/") puis scroll

8. MODIFIER i18n.ts :
   - Ajouter cles blog FR/EN (blogSectionTitle, blogSectionSubtitle, blogReadMore, blogReadingTime, blogBackToInsights, blogPublishedOn)

9. CREER vercel.json a la racine :
   { "rewrites": [{ "source": "/insights/(.*)", "destination": "/index.html" }] }

10. Apres chaque etape : npm run build pour verifier 0 erreurs TypeScript.

IMPORTANT :
- Ne touche PAS a .env, api/gemini-proxy.ts, ou vite.config.ts
- Ne fais PAS de git commit sans ma validation
- Preserve le design glass/light existant
- Teste le toggle FR/EN sur BlogSection et ArticlePage
```

---

### Etape 5 — Superviser l'execution

Claude Code va :
1. Te montrer chaque fichier qu'il veut creer/modifier
2. Te demander confirmation avant d'ecrire
3. Executer npm install et npm run build
4. Signaler les erreurs et proposer des corrections

**TON ROLE** : Lire, valider ou refuser chaque action. Tu es le V-Gate humain.

### Etape 6 — V&V post-execution

```powershell
# Dans un autre terminal :
cd C:\Projects\jeanpierrecharles
npm run dev
# → Ouvrir http://localhost:5173 dans le navigateur
```

**Checklist V&V manuelle (10 points)** :

```
[ ] 1. Homepage identique a v3.1 (zero regression)
[ ] 2. Section "Intelligence Industrielle" visible avant CTA
[ ] 3. Carte article affichee avec titre, date, tags
[ ] 4. Clic carte → /insights/cra-ai-act-reglements-meres-industrie-5
[ ] 5. ArticlePage affiche titre + placeholder contenu
[ ] 6. DevTools → Elements → chercher "ld+json" → JSON-LD present
[ ] 7. Bouton retour → homepage #insights
[ ] 8. NavBar "Insights" → scroll smooth
[ ] 9. Toggle FR/EN fonctionne partout (BlogSection + ArticlePage)
[ ] 10. npm run build → 0 erreurs
```

### Etape 7 — Injection contenu article

Une fois la structure validee, demander a Claude Code :

```
Remplace "CONTENU_A_INSERER" dans blogData.ts par le contenu Markdown 
de l'article que je vais te fournir. Je te donne d'abord la version FR, 
puis la version EN.
```

Puis coller le contenu Markdown de l'article (que nous preparons en parallele dans claude.ai web).

### Etape 8 — Deploy

```powershell
# Si branche feature :
git add .
git commit -m "feat: add Intelligence Industrielle blog section with GSEO JSON-LD v3.1.1"
git checkout main
git merge feature/blog-insights-v311
git push origin main
# → Vercel auto-deploy

# Si branche main directe :
git add .
git commit -m "feat: add Intelligence Industrielle blog section with GSEO JSON-LD v3.1.1"
git push origin main
```

---

## 4. MESURES DE SECURITE IMPERATIVES

| # | Regle | Raison |
|---|---|---|
| S1 | Mode permissions "Ask" (defaut) — JAMAIS --dangerously-skip-permissions | Chaque ecriture fichier necessite validation JP |
| S2 | JAMAIS d'export ANTHROPIC_API_KEY en variable d'environnement | OAuth suffit avec Max. Pas de secret expose |
| S3 | Creer branche feature/ avant modifications | Rollback facile si probleme |
| S4 | git diff avant tout commit — verifier 0 secret expose | Securite D10r2 |
| S5 | Ne pas autoriser Claude Code a modifier .env ou api/gemini-proxy.ts | Fichiers sensibles sanctuarises dans CLAUDE.md |
| S6 | Faire npm run build apres CHAQUE modification | Zero erreur TS = invariant |
| S7 | Tester localhost:5173 avant git push | V&V visuelle humaine obligatoire |
| S8 | CLAUDE.md reste dans le repo MAIS ne contient JAMAIS de secrets | Guide projet, pas config sensible |
| S9 | Ne pas installer de plugins VS Code MCP externes | MODE RESTREINT D10r2 maintenu |
| S10 | JP fait TOUS les git push — Claude Code ne push jamais seul | Gouvernance finale JP |

---

## 5. COUCHE 2 — SSG PRE-RENDU (si temps restant)

Apres Couche 1 validee, demander a Claude Code :

```
Je veux ajouter du pre-rendu SSG pour les pages articles 
afin qu'elles soient indexables par les moteurs de recherche.
Explore les options : vite-ssg, prerender-spa-plugin, ou un script 
post-build avec puppeteer. Choisis la plus compatible avec React 19 + Vite 6.2.
Ne modifie pas vite.config.ts sans me montrer les changements d'abord.
```

**Regle de fallback** : Si SSG bloque apres 2h, on livre Couche 1 seule. Le JSON-LD + react-helmet-async fournissent deja un signal GSEO fort pour les LLMs meme sans SSG.

---

## 6. CHRONOLOGIE < 24H

| Heure | Action | Qui |
|---|---|---|
| 12/03 18h | Installer Claude Code (irm script) | JP |
| 12/03 18h15 | Creer CLAUDE.md + branche feature | JP |
| 12/03 18h30 | Lancer claude, coller le prompt section 3.4 | JP + Claude Code |
| 12/03 19h-20h | Superviser execution Couche 1 | JP (V-Gate humain) |
| 12/03 20h-21h | V&V checklist 10 points + corrections | JP |
| 13/03 matin | Tenter Couche 2 SSG | JP + Claude Code |
| 13/03 10h-12h | Injection contenu article FR+EN | JP (contenu depuis claude.ai web) |
| 13/03 13h | npm run build final + V&V | JP |
| 13/03 14h | git push v3.1.1 | JP |
| 13/03 15h | Publier post LinkedIn EN + partager article | JP |

---

## 7. DECISIONS (IDs temporaires T1500)

| ID | Decision | Statut |
|---|---|---|
| D_T1500_01 | Section "Intelligence Industrielle — Analyses & Decryptages" v3.1.1 | VALIDE JP |
| D_T1500_02 | GSEO (JSON-LD + SSG) avance de v3.2 a v3.1.1 | VALIDE JP |
| D_T1500_03 | Execution via Claude Code CLI (pas AG) | VALIDE JP |
| D_T1500_04 | Installation native PowerShell (pas npm) | RECOMMANDE |
| D_T1500_05 | Mode permissions "Ask" obligatoire | SECURITE |
| D_T1500_06 | Branche feature/ recommandee avant modifications | SECURITE |
| D_T1500_07 | SSG = best effort, Couche 1 = livrable minimum | FALLBACK |
| D_T1500_08 | CLAUDE.md commit dans le repo (sans secrets) | GOUVERNANCE |
| D_T1500_09 | Post LinkedIn FR+EN + article blog = triple publication 13/03 | CAMPAGNE |

---

*AEGIS Intelligence — Brief ACC Blog/Insights v3.1.1 + GSEO*
*Reference : 20260312T1500_BRIEF_ACC-BLOG-INSIGHTS-V311-GSEO*
*Opus 4.6 — 12/03/2026 15h00 CET — ASCII-safe*
*IDs temporaires D_T1500_01 a D_T1500_09*
*Derniers IDs definitifs : D167, L120, R58*
