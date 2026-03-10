# Rapport de sécurité — Session 2026.02.11

## Projet Aegis Circular | Jean-Pierre Charles

---

## 1. Résultat du scan antimalware

**Statut : ✅ CLEAN**

Le scan complet Windows Defender s'est terminé le 10/02/2026 à 15h02 après 16 heures 46 minutes d'analyse couvrant 1 810 636 fichiers. Résultat : **0 menaces trouvées**. Cela couvre l'intégralité du disque local, incluant le Google Drive monté (G:\Mon Drive), les dépendances npm (node_modules), et le cache système Windows.

**Conclusion :** Aucune compromission détectée sur la Surface Pro 11 suite à l'exposition aux serveurs MCP filesystem. Le poste de travail est considéré sain.

---

## 2. Migration TOTP — Explications

### 2.1 Qu'est-ce que TOTP ?

**TOTP** signifie **Time-based One-Time Password** (mot de passe à usage unique basé sur le temps). C'est un algorithme standardisé (RFC 6238) qui génère un code à 6 chiffres renouvelé toutes les 30 secondes.

**Comment ça fonctionne :** Lors de la configuration, le service (Google, Microsoft, etc.) partage un "secret" unique avec votre application Authenticator, généralement via un QR code. À partir de ce secret et de l'heure actuelle, l'application calcule un code à 6 chiffres. Le serveur fait le même calcul de son côté. Si les deux codes correspondent, l'accès est accordé.

**Pourquoi c'est supérieur au SMS :**

- **Résistance au SIM swapping** : Un attaquant qui convainc votre opérateur de transférer votre numéro sur sa SIM reçoit vos SMS, mais ne peut pas reproduire vos codes TOTP car il n'a pas le secret stocké dans votre téléphone.
- **Pas de transmission réseau** : Le code TOTP est calculé localement sur votre téléphone — il ne transite jamais par le réseau téléphonique, éliminant les risques d'interception (SS7, faux relais).
- **Fonctionne hors-ligne** : Pas besoin de réseau mobile pour générer un code. Utile en déplacement ou en zone de couverture faible.
- **Multi-comptes** : Une seule application gère tous vos comptes (Google, Microsoft, Anthropic, GitHub, etc.).

**Impact sur Aegis Circular :** Pour une plateforme de conformité réglementaire, la sécurité des accès n'est pas optionnelle. Un compte Google compromis via SIM swapping donnerait accès au Google Drive contenant la documentation stratégique, le code source, et les données clients futures. Le TOTP élimine ce vecteur d'attaque.

### 2.2 État actuel — Google (compte unique perso/Aegis)

**Abonnement :** Google One AI Pro (2 To de stockage). Ce compte unique sert actuellement à la fois pour l'usage personnel et le projet Aegis Circular. La question de la séparation est traitée au point 8.

**Configuration 2FA actuelle (validée sur capture d'écran) :**

- ✅ Clés d'accès et clés de sécurité : 3 clés d'accès configurées
- ✅ Invite Google : 1 appareil configuré
- ✅ Authenticator : ajouté (Microsoft Authenticator via TOTP)
- ⚠️ Numéro de téléphone : supprimé (plus de SMS — SIM swapping éliminé)
- ⚠️ Codes de secours : **À GÉNÉRER** (voir point 4)

**Verdict :** La migration SMS → TOTP est effective pour Google. Le compte est maintenant protégé contre le SIM swapping. Il reste impératif de générer et sécuriser les codes de secours.

---

## 3. Anthropic / claude.ai — Vérification et migration 2FA

### Instructions pas-à-pas

**Étape 1 — Vérifier votre méthode de connexion actuelle**

1. Ouvrez **claude.ai** dans votre navigateur
2. Cliquez sur votre avatar/initiales (coin inférieur gauche)
3. Sélectionnez **Settings** (Paramètres)
4. Cherchez la section **Security** ou **Account**

**Étape 2 — Évaluer les options disponibles**

D'après la recherche effectuée, Anthropic propose actuellement la 2FA principalement via SMS ou email. Le support TOTP via application Authenticator est en cours de déploiement mais n'est pas encore universellement disponible (un ticket GitHub anthropics/claude-code#12480 de novembre 2025 signale que le magic link contourne le 2FA même quand activé).

**Étape 3 — Activer la 2FA si ce n'est pas fait**

1. Dans Settings → Security, cherchez l'option **Two-Factor Authentication**
2. Si l'option "Authenticator App" est disponible → configurez-la avec Microsoft Authenticator
3. Si seul le SMS/email est disponible → activez-le quand même (c'est mieux que rien)
4. Sauvegardez les codes de récupération si proposés

**Étape 4 — Sécurité complémentaire pour Anthropic**

Même si la 2FA TOTP n'est pas encore disponible sur claude.ai, renforcez votre sécurité :

- Utilisez un mot de passe **unique et fort** (16+ caractères) pour votre compte Anthropic
- Ne réutilisez pas le mot de passe d'un autre service
- Votre compte Google (utilisé pour vous connecter à claude.ai si SSO) est déjà protégé en TOTP — c'est une protection indirecte

**Recommandation :** Vérifier régulièrement (mensuel) si Anthropic a ajouté le support TOTP natif. La fonctionnalité est en développement actif.

---

## 4. Codes de secours — Sécurisation

### Pourquoi c'est critique

Si vous perdez votre téléphone (vol, panne, réinitialisation), vous perdez l'accès à Microsoft Authenticator et donc à tous vos comptes protégés par TOTP. Les codes de secours sont votre **seule bouée de sauvetage**.

### Instructions pas-à-pas

**Étape 1 — Générer les codes Google**

1. myaccount.google.com → Sécurité → Validation en 2 étapes
2. Section **Codes de secours** → cliquez **Générer des codes de secours**
3. Google génère 10 codes à usage unique
4. **Ne fermez pas cette page avant d'avoir sauvegardé les codes**

**Étape 2 — Stockage sécurisé (choisissez UNE méthode)**

**Option A — Papier physique (recommandé pour simplicité) :**

- Imprimez les codes ou recopiez-les à la main
- Stockez dans un endroit sûr et séparé de votre Surface Pro (coffre, tiroir verrouillé)
- Ne prenez pas de photo des codes (elle pourrait être synchronisée sur le cloud)

**Option B — Fichier chiffré VeraCrypt :**

- Créez un volume VeraCrypt chiffré (AES-256) sur une clé USB dédiée
- Stockez les codes dans un fichier texte à l'intérieur du volume
- Mémorisez le mot de passe VeraCrypt (distinct de tous vos autres mots de passe)
- Stockez la clé USB séparément de votre Surface Pro

**Étape 3 — Vérification**

- Testez un code de secours pour confirmer qu'il fonctionne (Google invalidera ce code après usage, il vous en restera 9)
- Ou ne testez pas et gardez les 10, en sachant qu'ils fonctionneront le jour où vous en aurez besoin

**Étape 4 — Codes Microsoft (si 2FA activé sur le compte Microsoft)**

1. account.microsoft.com → Sécurité → Options de sécurité avancées
2. Générer un code de récupération
3. Stocker avec la même méthode que pour Google

### Règles absolues

- **JAMAIS** de codes de secours en clair sur le disque dur
- **JAMAIS** dans un fichier Google Drive non chiffré
- **JAMAIS** dans un email envoyé à vous-même
- **JAMAIS** en capture d'écran dans votre galerie photo
- **UN SEUL** exemplaire physique, dans un lieu sûr

---

## 5. Audit des tâches planifiées

### Commande à exécuter dans PowerShell

```powershell
# Afficher les tâches planifiées actives hors Microsoft
Get-ScheduledTask | Where-Object {
    $_.TaskPath -notlike '\Microsoft\*' -and
    $_.State -ne 'Disabled'
} | Select TaskName, TaskPath, State,
    @{N='Actions';E={($_.Actions.Execute -join ', ')}} |
    Format-Table -AutoSize
```

### Quoi chercher

**Résultats attendus (légitimes) :**

- Tâches Google Drive (GoogleDriveFS)
- Tâches de mise à jour (Brave, Opera, Adobe, etc.)
- Votre tâche de synchronisation Antigravity → Google Drive (si configurée via le script du 10/02)

**Signaux d'alerte (à investiguer immédiatement) :**

- Toute tâche avec un nom inconnu ou aléatoire (ex: "svchost_update", "WindowsHelper")
- Toute tâche exécutant un script PowerShell (.ps1) que vous n'avez pas créé
- Toute tâche pointant vers %TEMP%, %APPDATA%, ou un dossier inhabituel
- Toute tâche créée entre le 01/01/2026 et le 10/02/2026 que vous ne reconnaissez pas

### Commande complémentaire — tâches créées récemment

```powershell
# Tâches créées dans les 30 derniers jours
Get-ScheduledTask | ForEach-Object {
    $info = Get-ScheduledTaskInfo $_.TaskName -ErrorAction SilentlyContinue
    [PSCustomObject]@{
        Name = $_.TaskName
        Path = $_.TaskPath
        State = $_.State
        LastRun = $info.LastRunTime
        NextRun = $info.NextRunTime
        Action = ($_.Actions.Execute -join ', ')
    }
} | Where-Object {
    $_.Path -notlike '\Microsoft\*'
} | Sort-Object LastRun -Descending |
    Format-Table -AutoSize
```

Partagez le résultat et on analysera ensemble.

---

## 6. Chaîne de déploiement — Documentation

### Pipeline complet

```
C:\Projects\jeanpierrecharles\
    → git push origin main
        → GitHub (jeanpierrecharles69-oss/jeanpierrecharles-website)
            → Vercel (auto-deploy, build Vite)
                → jeanpierrecharles.com (DNS chez Gandi.net)
```

### Procédure standard de déploiement

```powershell
# 1. Build local de vérification
cd C:\Projects\jeanpierrecharles
npm run build

# 2. Vérifier qu'aucune clé API n'est exposée dans le bundle
Select-String -Path "dist\assets\*.js" -Pattern "AIzaSy" -SimpleMatch
# (Doit retourner AUCUN résultat)

# 3. Vérifier les fichiers modifiés
git status

# 4. Ajouter les changements
git add -A

# 5. Vérifier ce qui sera commité
git diff --cached --stat
# VÉRIFICATION CRITIQUE : .env.local ne doit PAS apparaître

# 6. Commit avec message descriptif
git commit -m "vX.Y.Z: Description courte"

# 7. Push → déclenche auto-deploy Vercel
git push origin main
```

### Vérifications post-déploiement

1. **Vercel Dashboard** → vercel.com/jean-pierre-charles-projects → build status ✅
2. **Variable d'environnement** → Settings > Environment Variables → GEMINI_API_KEY présente (sans préfixe VITE_)
3. **Test production** → jeanpierrecharles.com → tester l'assistant Aegis
4. **Gandi.net** → vérifier que le build est aussi à jour côté hébergeur

### Points critiques à ne jamais oublier

- Le déploiement passe par **Git push**, PAS par `vercel --prod` (Vercel CLI n'est pas installé)
- La clé API Gemini est dans les **variables d'environnement Vercel** (côté serveur), pas dans le code client
- Si la clé Gemini est modifiée dans .env.local, il faut aussi la mettre à jour dans **Vercel Dashboard** ET vérifier **Gandi.net**
- Le fichier `.env.local` est exclu de Git via `.gitignore`

### Convention de commit

```
Format : "vX.Y.Z: Description courte"
Tags optionnels dans le corps :
  [SECURITY] — Correctifs de sécurité
  [RGPD]     — Conformité données personnelles
  [FIX]      — Correction de bug
  [UX]       — Amélioration interface
  [CONFIG]   — Configuration infrastructure
  [PERF]     — Optimisation performance
```

Un fichier DEPLOYMENT.md séparé est fourni pour intégration directe dans C:\Projects\jeanpierrecharles\.

---

## 7. Claude Desktop — Résolution de l'erreur au démarrage

### Message d'erreur

```
Impossible de charger les paramètres de l'application
Une erreur s'est produite lors de la lecture ou de l'analyse de claude_desktop_config.json :
Unexpected token '', "{
  "mcpS"... is not valid JSON
```

### Cause

Lors du nettoyage des serveurs MCP le 10/02/2026, la commande PowerShell utilisée pour écrire le fichier de configuration nettoyé a probablement inséré un **BOM (Byte Order Mark)** ou un caractère invisible au début du fichier. Le parseur JSON de Claude Desktop ne tolère pas ces caractères parasites, d'où l'erreur "Unexpected token".

Le contenu du fichier `claude_desktop_config.json` est correct (mcpServers vidé, extensions désactivées), mais l'encodage du fichier pose problème.

### Résolution

Exécutez cette commande dans PowerShell pour réécrire le fichier avec un encodage UTF-8 propre (sans BOM) :

```powershell
# Réécrire la config avec encodage UTF-8 sans BOM
$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
$cleanJson = '{"mcpServers": {}, "preferences": {"chromeExtensionEnabled": false}}'
[System.IO.File]::WriteAllText($configPath, $cleanJson, [System.Text.UTF8Encoding]::new($false))
```

Puis relancez Claude Desktop. L'erreur devrait disparaître.

### Vérification

```powershell
# Vérifier que le fichier est du JSON valide
Get-Content $env:APPDATA\Claude\claude_desktop_config.json | ConvertFrom-Json
```

### Note importante

Même si Claude Desktop redémarre correctement, rappelons que conformément au plan de sécurité du 10/02/2026, **l'utilisation de Claude Desktop est déconseillée** tant que la vulnérabilité 0-Click RCE (CVSS 10/10) n'est pas corrigée par Anthropic. L'interface web claude.ai reste la méthode recommandée. Cependant, corriger l'erreur de configuration est utile pour ne pas avoir ce message parasite si l'application se lance accidentellement.

---

## 8. Analyse SWOT — Création d'un compte Google Workspace professionnel

### Contexte

Actuellement, un seul compte Google personnel (avec abonnement Google One AI Pro, 2 To) est utilisé à la fois pour l'usage personnel et pour le projet Aegis Circular. La question est de savoir s'il faut créer un compte Google Workspace dédié pour l'activité professionnelle.

### SWOT

#### FORCES (Strengths) — Raisons de créer un Workspace dédié

**Séparation des données**
Un compte Workspace crée une frontière étanche entre données personnelles (photos, emails privés, documents familiaux) et données professionnelles (code, documentation réglementaire, données clients futures). En cas de compromission d'un compte, l'autre reste intact.

**Crédibilité professionnelle**
Une adresse contact@aegis-circular.com (ou @jeanpierrecharles.com) inspire davantage confiance qu'une adresse @gmail.com dans un contexte B2B de conformité réglementaire. Pour une plateforme qui vend de la rigueur et de la conformité, c'est un signal fort.

**Conformité RGPD native**
Google Workspace inclut un DPA (Data Processing Agreement) conforme au RGPD, des contrôles administratifs avancés, et Google Vault pour la rétention des données. Ces fonctionnalités sont essentielles pour une plateforme de conformité réglementaire.

**Sécurité renforcée**
Workspace Business offre des contrôles de sécurité supérieurs : gestion avancée des endpoints, règles DLP (Data Loss Prevention), audit logs détaillés, et la possibilité de forcer le 2FA pour tous les utilisateurs du domaine.

**Scalabilité**
Quand Aegis Circular recrutera des collaborateurs ou sous-traitants, Workspace permet de leur créer des comptes contrôlés sous votre domaine, avec des permissions granulaires. Impossible avec un compte personnel.

#### FAIBLESSES (Weaknesses) — Inconvénients et risques

**Coût additionnel**
Business Starter : 5,75 €/mois. Business Standard (recommandé pour 2 To) : 11,50 €/mois. Business Plus : 17,25 €/mois. Ce coût s'ajoute à l'abonnement Google One AI Pro existant (qui resterait pour l'usage personnel).

**Complexité opérationnelle**
Gérer deux comptes Google signifie jongler entre deux environnements Drive, deux boîtes mail, deux calendriers. Le risque de confusion existe (envoyer un email pro depuis le compte perso, stocker un fichier client dans le Drive perso, etc.).

**Migration des données existantes**
Le Google Drive actuel contient déjà la documentation Aegis Circular (Master Files, documentation stratégique). Il faudra migrer ces fichiers vers le nouveau Workspace, ce qui prend du temps et comporte des risques de perte ou de duplication.

**Double maintenance sécurité**
Deux comptes signifie deux configurations 2FA à maintenir, deux jeux de codes de secours, deux profils Chrome séparés. La surface de gestion augmente.

#### OPPORTUNITÉS (Opportunities) — Bénéfices stratégiques

**Positionnement de marché**
Aegis Circular vend de la conformité réglementaire. Utiliser soi-même les outils de conformité Google (Vault, DLP, audit logs) démontre que vous appliquez ce que vous prêchez — un argument commercial puissant.

**Google Workspace + Gemini intégré**
Depuis 2026, toutes les formules Workspace incluent Gemini AI nativement (aide à la rédaction dans Gmail, résumés dans Docs). Cela complète votre stack IA existante (Claude + Gemini API) sans coût supplémentaire pour l'IA.

**Domaine personnalisé**
Workspace vous permet d'utiliser votre propre domaine (@jeanpierrecharles.com ou @aegis-circular.com) pour l'email professionnel, renforçant votre marque.

**Préparation à la certification**
Si Aegis Circular vise des certifications (ISO 27001, SOC 2) ou des clients enterprise, avoir un environnement Google Workspace avec audit trail est un prérequis quasi-incontournable.

#### MENACES (Threats) — Risques à anticiper

**Verrouillage fournisseur (vendor lock-in)**
Plus vous investissez dans l'écosystème Google (Drive, Docs, Sheets, Gmail, Calendar), plus il est difficile et coûteux d'en sortir. La compatibilité avec les fichiers Office reste imparfaite.

**Hausse des prix**
Google a augmenté les tarifs Workspace de 30% récemment, avec l'intégration forcée de Gemini AI. De nouvelles hausses sont probables. Pour un solopreneur, le rapport coût/bénéfice doit être réévalué régulièrement.

**Complexité prématurée**
Aegis Circular est en phase de développement, pas encore en production B2B. Investir dans une infrastructure Workspace complète maintenant pourrait être prématuré si le lancement commercial est encore à plusieurs mois.

**Risque de dépendance Google**
Concentrer email pro + stockage + développement + IA sur un seul fournisseur crée un point de défaillance unique (SPOF). Une suspension de compte Google (même erronée) paralyserait toute l'activité.

### Recommandation

**Décision recommandée : Attendre le lancement B2B, puis créer un Workspace Business Starter.**

**Maintenant (phase développement) :** Le compte Google One AI Pro actuel est suffisant. La migration TOTP effectuée aujourd'hui le sécurise correctement. Concentrez vos ressources sur le développement d'Aegis Circular.

**Au lancement B2B (quand les premiers clients arrivent) :** Créez un Google Workspace Business Starter (5,75 €/mois) avec votre domaine professionnel. Migrez uniquement les données Aegis Circular. Gardez le compte personnel séparé.

**Si besoin de conformité avancée :** Passez à Business Standard (11,50 €/mois) pour Google Vault et 2 To de stockage dédié.

Le timing idéal se situe environ 1-2 mois avant l'ouverture commerciale, pour avoir le temps de migrer les données et de configurer l'environnement sans précipitation.

---

## Tableau récapitulatif — Session 2026.02.11

| # | Action | Statut | Priorité |
|---|--------|--------|----------|
| 1 | Scan antimalware | ✅ Clean (0 menaces) | — |
| 2 | Migration TOTP Google | ✅ Fait | — |
| 3 | 2FA Anthropic/claude.ai | ⚠️ À vérifier (TOTP peut-être pas disponible) | URGENT |
| 4 | Codes de secours Google | 🔴 À FAIRE | URGENT |
| 5 | Audit tâches planifiées | 🔴 À FAIRE | URGENT |
| 6 | Documentation déploiement | ✅ Fichier DEPLOYMENT.md fourni | — |
| 7 | Erreur Claude Desktop | ✅ Commande de résolution fournie | FAIBLE |
| 8 | Analyse SWOT Workspace | ✅ Recommandation : attendre lancement B2B | RÉFLEXION |
