# CONVERSATION_BRIDGE_CLAUDEDXT-ARM64_20260219T0915

**Date :** 20260219T0905 CET  
**Auteur :** Jean-Pierre Charles — Aegis Circular  
**Contexte :** Compatibilité & sécurité Surface Pro 11 ARM64 + Claude Desktop 1.1.3363 + MCP Filesystem DXT + Claude in Chrome  
**Projet :** Aegis Circular — Workflow hybride  

---

## 1. STATUT OFFICIEL ANTHROPIC (19 février 2026)

### 1.1 Claude Desktop v1.1.3363 (18/02/2026)

| Composant | ARM64 SP11 | Statut officiel |
|-----------|-----------|----------------|
| **Chat (onglet)** | ✅ Natif | Pleinement fonctionnel |
| **Cowork (onglet)** | ❌ Bloqué | "Support is not available for Windows (arm64) at this time" — claude.com/download |
| **Code (onglet)** | ⚠️ Partiel | Sessions locales non supportées. Sessions distantes (Remote) uniquement |
| **MCP Filesystem DXT** | ✅ Fonctionne | Extension DXT activée, 14 outils, Node.js intégré 22.22.0 |
| **Claude in Chrome** | ✅ Fonctionne | Extension Chrome indépendante de l'architecture, beta plans payants |
| **Extensions DXT** | ✅ Fonctionne | Marketplace accessible, mises à jour automatiques activées |

### 1.2 Évolution majeure détectée : Claude Code CLI ARM64

**NOUVEAU (13 février 2026) :** Claude Code CLI v2.1.41 a ajouté le support natif Windows ARM64 (`win32-arm64 native binary`). Ceci corrige potentiellement le crash `ACCESS_VIOLATION` sur Snapdragon X documenté précédemment. À tester — installation via PowerShell :

```powershell
irm https://cli.claude.com/install.ps1 | iex
```

> **Note :** L'extension VS Code pour Claude Code utilise un fallback x64 via émulation sur ARM64 — fonctionnel mais plus lent.

---

## 2. MATRICE DE RISQUES ACTUALISÉE (février 2026)

### 2.1 Vulnérabilités actives

| CVE / Rapport | Sévérité | Composant | Statut correction | Impact config JP |
|---------------|----------|-----------|-------------------|-----------------|
| **DXT Zero-click RCE** (LayerX, 9 fév. 2026) | 🔴 CVSS 10/10 | Toute extension DXT | **NON CORRIGÉ — Anthropic a refusé** | ⚠️ Filesystem DXT installé |
| **CVE-2025-68143/44/45** (Cyata, 20 jan. 2026) | 🔴 Critique (chaîné) | Git MCP Server | Corrigé (déc. 2025) | ✅ Git MCP non installé |
| **CVE-2025-53109/53110** (Cymulate, août 2025) | 🟠 Élevé | Filesystem MCP Server | Corrigé ≥ 2025.7.1 | ✅ Version à jour (DXT auto-update) |
| **SSRF latent** (BlueRock, jan. 2026) | 🟠 Élevé | 36.7% serveurs MCP | Non corrigé (systémique) | ⚠️ Filesystem DXT concerné potentiellement |
| **Tool poisoning MCP** (Adversa AI, fév. 2026) | 🟡 Modéré | Écosystème MCP global | Aucun correctif global | ⚠️ Risque inhérent au protocole |

### 2.2 Analyse de la vulnérabilité DXT Zero-click RCE

**Ce qui est prouvé :** Un événement Google Calendar malveillant peut déclencher une exécution de code arbitraire sur le système via le chaînage autonome d'extensions DXT, sans aucune interaction utilisateur. Les extensions DXT s'exécutent **sans sandbox**, avec les **pleins privilèges système**.

**Position Anthropic (porte-parole Jennifer Martinez) :** "Claude Desktop's MCP integration is a local development tool where users explicitly configure and grant permissions to servers they choose to run. [...] The security boundary is defined by the user's configuration choices."

**Impact pour Jean-Pierre :** Risque **atténué** car la config actuelle ne combine que Filesystem DXT (sans Google Calendar, Gmail, Slack ou autres connecteurs à données externes). Le vecteur d'attaque documenté nécessite le chaînage de connecteurs à données externes avec des exécuteurs locaux.

### 2.3 Évaluation du risque pour la config actuelle

| Scénario | Niveau | Justification |
|----------|--------|---------------|
| Filesystem DXT seul + 2 dossiers ciblés | 🟢 Modéré-Faible | Pas de connecteur externe, pas de chaînage possible |
| Filesystem DXT + Claude in Chrome | 🟡 Modéré | Chrome = source de données externe potentielle (prompt injection via pages web) |
| Ajout futur Google Calendar/Gmail DXT | 🔴 Critique | Vecteur zero-click RCE prouvé, non corrigé |

---

## 3. CONFIGURATION VALIDÉE (15 février 2026)

### 3.1 Dossiers connectés (DXT Filesystem)

| Dossier | Fonction | Risque |
|---------|----------|--------|
| `C:\Users\jpcha\.gemini` | Workspace Antigravity IDE | 🟡 Modéré (vérifier tokens) |
| `C:\Projects\jeanpierrecharles` | Projet Aegis Circular | 🟢 Faible |
| `C:\Users\jpcha\Downloads` | Zone de transit fichiers | 🟢 Faible |

### 3.2 Dossiers retirés

| Dossier | Raison |
|---------|--------|
| `AppData\Roaming\Claude` | Expose la config MCP + tokens logs |
| `AppData\Roaming\Antigravity` | Cache applicatif sans intérêt |
| `AppData\Roaming\Perplexity` | Tokens de session exposables |
| `AppData\Roaming\Adobe` | Volume inutile, aucun bénéfice |

### 3.3 Paramètres système détectés

- **Node.js système :** 24.12.0 (ARM64)
- **Node.js intégré Claude :** 22.22.0
- **Python détecté :** 3.14.3
- **Mises à jour extensions :** Automatiques activées
- **Autorisations outils :** Personnalisé (validation manuelle)

---

## 4. RECOMMANDATIONS STRATÉGIQUES

### 4.1 Sécurité immédiate

| # | Recommandation | Priorité |
|---|---------------|----------|
| R1 | **Ne JAMAIS ajouter** de connecteurs DXT à données externes (Calendar, Gmail, Slack) tant que la vuln zero-click RCE n'est pas corrigée | 🔴 P0 |
| R2 | Maintenir les **autorisations sur "Personnalisé"** (validation manuelle de chaque action) — ne jamais activer auto-approve | 🔴 P0 |
| R3 | Vérifier l'absence de **credentials/tokens** dans `C:\Users\jpcha\.gemini` (sous-dossiers de config Gemini) | 🟠 P1 |
| R4 | Utiliser **claude.ai** (web) pour tout travail de conformité réglementaire — aucune surface MCP exposée | 🟠 P1 |
| R5 | Surveiller les **répertoires .git inattendus** dans les dossiers exposés (indicateur d'attaque) | 🟡 P2 |

### 4.2 Optimisation workflow

| # | Recommandation | Priorité |
|---|---------------|----------|
| R6 | **Tester Claude Code CLI v2.1.41+** avec le binaire natif ARM64 — si fonctionnel, intégrer au workflow de déploiement | 🟠 P1 |
| R7 | Maintenir le workflow hybride : Antigravity (code) → claude.ai Projets (analyse/docs) → PowerShell (déploiement) → Claude in Chrome (vérification) | 🟢 Continu |
| R8 | Capitaliser les documents clés (ce bridge, synthèse MCP, config filesystem) dans la **knowledge base du Projet Claude** pour persistance RAG | 🟠 P1 |
| R9 | Préférer le **DXT Filesystem** au MCP JSON pour la gestion des dossiers — interface graphique plus simple et maintenable pour non-développeur | 🟢 Acté |

### 4.3 Veille stratégique

| # | Sujet | Source à surveiller | Fréquence |
|---|-------|-------------------|-----------|
| V1 | Correction vuln DXT zero-click RCE | LayerX blog, Anthropic changelog | Hebdo |
| V2 | Support ARM64 Cowork | claude.com/download, GitHub issues | Hebdo |
| V3 | Claude Code CLI ARM64 stabilité | GitHub anthropics/claude-code releases | Hebdo |
| V4 | Mises à jour sécurité MCP Filesystem | npm @modelcontextprotocol/server-filesystem | Mensuel |
| V5 | Sortie Cowork de "research preview" → GA | Annonces Anthropic blog | Mensuel |

---

## 5. PLAN D'EXÉCUTION D'ACTIONS

| # | Action | Quand | Outil | Statut |
|---|--------|-------|-------|--------|
| A1 | Config DXT Filesystem validée (3 dossiers, 4 retirés) | 15 fév. 2026 | Claude Desktop DXT | ✅ FAIT |
| A2 | Document Config-Filesystem-MCP-Fev2026.docx mis à jour | 19 fév. 2026 | claude.ai | ✅ FAIT |
| A3 | Tester installation Claude Code CLI ARM64 natif (v2.1.41+) | Cette semaine | PowerShell | 🔲 À FAIRE |
| A4 | Scanner `.gemini` pour credentials/tokens exposés | Cette semaine | Claude Desktop Filesystem | 🔲 À FAIRE |
| A5 | Ajouter ce bridge + docs clés à la KB du Projet Claude | 19 fév. 2026 | claude.ai Projet | 🔲 À FAIRE |
| A6 | Mettre en place veille hebdo ARM64 (Cowork + Claude Code) | Continu | Perplexity / claude.ai | 🔲 À FAIRE |
| A7 | Évaluer Cowork quand : ARM64 OK + sortie research preview + audit logs + fix zero-click RCE | H2 2026 ? | — | ⏳ FUTUR |

---

## 6. RÉSUMÉ DÉCISIONNEL

**Configuration actuelle (Claude Desktop 1.1.3363 + DXT Filesystem + Chrome) sur Surface Pro 11 ARM64 :**

✅ **Fonctionnelle** — Les trois composants sont compatibles et opérationnels  
⚠️ **Risque maîtrisé** — Filesystem DXT seul sans connecteurs externes, autorisations manuelles  
🔴 **Ligne rouge** — Ne jamais combiner avec des connecteurs à données externes (Calendar, Gmail, Slack)  
📋 **Traçabilité** — claude.ai reste la plateforme principale pour la conformité réglementaire  

**Évolution à surveiller :** Claude Code CLI ARM64 natif (13 fév. 2026) pourrait transformer le workflow de déploiement si la stabilité est confirmée sur Snapdragon X.

---

*Document généré par Claude Opus 4.6 — 19 février 2026 — Aegis Circular*  
*Sources : Anthropic (claude.com/download, support.claude.com, code.claude.com), LayerX Security (9 fév. 2026), Cyata (20 jan. 2026), Cymulate (août 2025), Adversa AI (fév. 2026), Infosecurity Magazine, CSO Online, The Register, Dark Reading, GitHub anthropics/claude-code*
