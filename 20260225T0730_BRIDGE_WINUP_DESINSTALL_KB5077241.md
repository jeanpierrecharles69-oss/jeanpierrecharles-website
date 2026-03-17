# 20260225T0730 — BRIDGE WINUP DÉSINSTALLATION KB5077241 (26200.7922 → 26200.7840)

| Champ | Valeur |
| :---- | :---- |
| **Date/Heure** | 2026-02-25 07:30 → 12:00 CET |
| **Agent** | Claude Opus 4.6 (claude.ai) |
| **Portée** | Désinstallation préversion KB5077241 \+ Diagnostic Claude Desktop ARM64 |
| **Scope** | JPC \+ AC (claude.ai) |
| **Sessions précédentes** | T0600 (KB5007651), T0630 (200.0.50.0), T0915 (DXT ARM64), T2035 (Phi Silica \+ KB5077241) |
| **Format nommage** | YYYYMMDDTHHMM\_BRIDGE\_DESCRIPTION.md (standard T1900) |

---

## 1\. CONTEXTE & OBJECTIF INITIAL

Jean-Pierre a constaté l'impossibilité de lancer Claude Desktop sur Surface Pro 11 ARM64 (25H2 / 26200.7922). Hypothèse initiale : régression causée par KB5077241 (préversion non-sécurité installée le 24/02/2026 à 19:49, malgré la recommandation du bridge T2035 de ne pas l'installer avant mars 2026).

Objectif : désinstaller KB5077241 et restaurer le build de référence 26200.7840 (KB5077181 Patch Tuesday février 2026).

---

## 2\. CHRONOLOGIE DES OPÉRATIONS

| Heure CET | Action | Résultat |
| :---- | :---- | :---- |
| 07:30 | Début session — diagnostic KB5077241 | KB5077241 confirmée présente (Get-HotFix) |
| 07:33 | Tentative DISM `Select-String "KB5077241"` | Non trouvée par DISM (indexation LCU différente) |
| 07:38 | Tentative wusa `/uninstall /kb:5077241` | **BLOQUÉ** — "requise par votre ordinateur" |
| 07:42 | Recherche package DISM par build | Package trouvé : `Package_for_RollupFix~31bf3856ad364e35~arm64~~26100.7922.1.22` |
| 07:45 | Analyse discordance build 26100 vs 26200 | **CLARIFIÉ** : 26200 \= affichage 25H2 (enablement package), 26100 \= base de code maintenance partagée 24H2/25H2 |
| 07:50 | Tentative DISM `/remove-package` | **ERREUR 0x800f0825** — CBS\_E\_CANNOT\_UNINSTALL (package permanent) |
| 07:55 | Vérification points de restauration | Point du 24/02/2026 19:21 disponible ("Programme d'installation pour les modules Windows") |
| 08:00 | Restauration système via `Restore-Computer` | Bug boucle confirmation avec `-Confirm` → résolu sans flag |
| 09:05 | Système restauré | Build **26200.7840** confirmée — KB5077241 absente |
| 09:05 | Test Claude Desktop | **ÉCHEC** — Claude.exe introuvable (supprimé par la restauration) |
| 09:12 | Réinstallation Claude Desktop v1.1.4173 | Installation OK mais **aucune fenêtre** ne s'affiche |
| 09:30 | Diagnostic cache corrompu | Erreur "Unable to move cache: Accès refusé (0x5)" → résolu par nettoyage |
| 09:35 | Diagnostic @formatjs/intl | Erreur critique : "An `id` must be provided to format a message" |
| 09:41 | Nettoyage Singleton Lock | Résolu mais nouvelle erreur @formatjs persiste |
| 09:47 | Nettoyage nucléaire \+ réinstallation | Même erreur @formatjs/intl |
| 09:55 | Test \--disable-gpu | GPU process crash → fallback → "GPU access not allowed" |
| 10:00 | Test \--lang=en-US | Même erreur @formatjs — pas lié à la locale |
| 10:05 | Recherche web GitHub Issues | **BUG CONFIRMÉ** : Issue \#28304 — bug Anthropic v1.1.4173 |

---

## 3\. DIAGNOSTIC FINAL — CAUSE RACINE

### 3.1 KB5077241 : NON responsable du problème Claude Desktop

La restauration système a confirmé que le retour au build 26200.7840 ne résout pas le problème. Claude Desktop ne fonctionnait déjà plus avant la tentative de désinstallation.

### 3.2 Cause réelle : Bug Anthropic Claude Desktop v1.1.4173

| Élément | Détail |
| :---- | :---- |
| **Bug** | Claude Desktop v1.1.4173 — crash au démarrage, aucune fenêtre |
| **Erreur** | `@formatjs/intl` — "An `id` must be provided to format a message" |
| **Scope** | Windows 11 25H2 (Build 26200.x) — toutes architectures |
| **Issue GitHub** | \#28304 — ouverte le 24/02/2026 — "crashes on startup, no window renders, process visible in Task Manager" |
| **Issue liée** | \#28231 — "Multiple Critical Bugs on Windows 11 25H2 (Build 26200)" |
| **Workaround** | Aucun trouvé — attendre correctif Anthropic |
| **Impact** | Chat Desktop bloqué, Cowork bloqué, MCP Filesystem inaccessible |

### 3.3 Impact workflow JPC

| Composant | Statut post-session | Impact |
| :---- | :---- | :---- |
| **claude.ai (web)** | ✅ Opérationnel | Aucun — workflow principal préservé |
| **Claude Desktop Chat** | ❌ Bloqué (bug v1.1.4173) | Pas de chat desktop |
| **Claude Desktop MCP Filesystem** | ❌ Bloqué (conséquence) | Pas d'accès fichiers locaux via Claude |
| **Claude Desktop Cowork** | ❌ Bloqué (ARM64 non supporté \+ bug) | Double blocage |
| **Claude Code CLI** | ⚠️ Non testé cette session | Alternative potentielle pour MCP |
| **Antigravity IDE** | ✅ Opérationnel | Aucun impact |
| **Build Windows** | ✅ 26200.7840 (restauré) | Stable — build de référence |

---

## 4\. CLARIFICATION TECHNIQUE : BUILDS 26100 vs 26200

### 4.1 Erreur corrigée

Le bridge T2035 contenait une attribution incorrecte (26200 \= ARM64, 26100 \= x64). La vérité validée par recherche Microsoft :

| Build | Signification | Architectures |
| :---- | :---- | :---- |
| **26100.xxxx** | Windows 11 **24H2** | x64 ET ARM64 |
| **26200.xxxx** | Windows 11 **25H2** | x64 ET ARM64 |

### 4.2 Mécanisme Enablement Package

Windows 11 25H2 est construit sur la même base 24H2 (26100). La transition se fait via un enablement package (KB5054156) qui :

- Active les fonctionnalités 25H2  
- Change l'affichage build de 26100 → 26200 dans Paramètres

La pile de maintenance DISM reste indexée sur **26100** (base partagée). C'est pourquoi le package RollupFix porte le nom `arm64~~26100.7922` alors que les Paramètres affichent 26200.7922.

### 4.3 Surface Pro 11 — Configuration confirmée

| Paramètre | Valeur |
| :---- | :---- |
| Édition | Windows 11 Famille |
| Version | 25H2 |
| Build Paramètres | 26200.7840 (post-restauration) |
| Build DISM (interne) | 26100.7840 |
| Processeur | Snapdragon(R) X 12-core X1E80100 @ 3.40 GHz |
| RAM | 16,0 Go |
| GPU | Qualcomm(R) Adreno(TM) X1-85 |
| Nom machine | JPFranckie |

---

## 5\. MÉTHODES DE DÉSINSTALLATION LCU — RETEX

| Méthode | Résultat | Code erreur | Enseignement |
| :---- | :---- | :---- | :---- |
| `Get-HotFix` | ✅ Détecte la KB | — | Fiable pour confirmation présence |
| `dism /get-packages` \+ KB name | ❌ Non trouvé | — | DISM n'indexe pas par numéro KB |
| `dism /get-packages` \+ build | ✅ Trouvé (26100.7922) | — | Chercher par numéro de build |
| `wusa /uninstall /kb:5077241` | ❌ Bloqué | "requise" | LCU marquée permanente |
| `dism /remove-package` | ❌ Bloqué | 0x800f0825 | CBS\_E\_CANNOT\_UNINSTALL |
| **Restauration système** | ✅ **Succès** | — | **Seule méthode viable** pour LCU permanentes |

**Recommandation** : toujours vérifier les points de restauration AVANT d'installer une preview. La restauration système reste la seule méthode fiable pour retirer une LCU intégrée au servicing stack.

---

## 6\. PLAN D'ACTIONS

| ID | Action | Outil | Délai | Statut |
| :---- | :---- | :---- | :---- | :---- |
| **A1** | Surveiller issue GitHub \#28304 pour correctif Claude Desktop | GitHub/Web | Continu | 🔄 EN COURS |
| **A2** | Ne PAS installer KB5077241 (preview) — attendre Patch Tuesday mars 2026 | WU Settings | Décision prise | ✅ DÉCIDÉ |
| **A3** | Vérifier que "Recevoir les dernières MAJ" est décoché dans WU | WU Settings | J0 | À FAIRE |
| **A4** | Tester Claude Code CLI ARM64 v2.1.41+ comme alternative MCP | PowerShell | J+1 | À FAIRE |
| **A5** | Reconfigurer MCP Filesystem config.json quand Claude Desktop corrigé | Config JSON | Post-correctif | EN ATTENTE |
| **A6** | Mettre à jour SUIVI\_WINUP avec correction builds 26100/26200 | claude.ai | J+1 | À FAIRE |
| **A7** | Surveiller Claude Desktop changelog pour version post-1.1.4173 | claude.com/download | Continu | 🔄 EN COURS |

---

## 7\. COMMANDES POWERSHELL DIAGNOSTIC — RÉFÉRENCE

\# Build actuelle

Get-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion' | Select-Object DisplayVersion, CurrentBuild, UBR

\# Vérifier absence KB5077241

Get-HotFix \-Id KB5077241

\# Points de restauration

Get-ComputerRestorePoint | Format-Table CreationTime, Description, SequenceNumber \-AutoSize

\# Packages DISM par build

dism /online /get-packages /format:table | Select-String "26100.7840"

\# Claude Desktop — chemin réel

Get-ChildItem "$env:LOCALAPPDATA\\AnthropicClaude" \-Directory | Select-Object Name

\# Claude Desktop — version installée

Get-ItemProperty "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\\*" | Where-Object { $\_.DisplayName \-like "\*Claude\*" } | Select-Object DisplayName, DisplayVersion, InstallLocation

\# Singleton Lock (problème multi-instance)

Remove-Item "$env:APPDATA\\Claude\\SingletonLock" \-Force \-ErrorAction SilentlyContinue

\# SecHealthUI (suivi boucle KB5007651)

Get-AppxPackage Microsoft.SecHealthUI | Select-Object Name, Version

---

## 8\. RÉFÉRENCES CROISÉES BRIDGES

| Bridge | Sujet | Relation |
| :---- | :---- | :---- |
| CONVERSATION\_BRIDGE\_20260219T0600.md | KB5007651 \+ Patch Tuesday fév. 2026 | Boucle réinstallation — non impactée par restauration |
| CONVERSATION\_BRIDGE\_20260219T0630.md | System Hardware Update 200.0.50.0 | Boucle — non impactée par restauration |
| CONVERSATION\_BRIDGE\_CLAUDEDXT-ARM64\_20260219T0915.md | Claude Desktop \+ MCP ARM64 | Config MCP perdue — à reconfigurer post-correctif |
| 20260224T2035\_BRIDGE\_WINUP\_PHI\_SILICA\_KB5079254\_KB5077241.md | Phi Silica \+ KB5077241 | **CORRECTION** : attribution builds 26100/26200 erronée |
| SUIVI\_WINUP\_20260224T2035\_SURFACE\_PRO11\_ARM64.md | Suivi WU global | **À METTRE À JOUR** avec correction builds et statut restauration |
| 20260224T1900\_BRIDGE\_FORMALISATION\_TRANSVERSALE.md | Standards horodatage | Format nommage de ce document |

---

## 9\. ERRATA — CORRECTIONS BRIDGES PRÉCÉDENTS

### 9.1 Bridge T2035 — Attribution builds incorrecte

**Erreur** : "26200.7922 (25H2) / 26100.7922 (24H2)" impliquait une distinction par architecture (ARM64 vs x64).

**Correction** : Les deux builds (26100 et 26200\) existent pour TOUTES les architectures (x64 ET ARM64). La distinction est **24H2 vs 25H2**, pas x64 vs ARM64. Surface Pro 11 de JPC est en 25H2 → build affiché 26200.xxxx, mais DISM indexe les packages sous 26100.xxxx (base de code partagée via enablement package).

---

## 10\. DÉPLOIEMENT WATCHDOG AEGIS-CDSKT (T1130-T1200)

### 10.1 Script déployé

| Paramètre | Valeur |
| :---- | :---- |
| **Fichier** | `C:\Users\jpcha\Projects\aegis-cdskt-watchdog.ps1` |
| **Fonction** | Détection nouvelle version Claude Desktop \+ V\&V automatique |
| **Bug cible** | v1.1.4173 (GitHub \#28304 — @formatjs/intl crash) |
| **Logs** | `%USERPROFILE%\Documents\AEGIS\logs\cdskt-watchdog.log` |
| **Rapport V\&V** | `%USERPROFILE%\Documents\AEGIS\logs\cdskt-vv-<version>.md` (auto-généré si nouvelle version) |
| **Tâche planifiée** | `AEGIS-CDSKT-Watchdog` — toutes les 2h de 08:00 à 20:00 |
| **Premier test** | 2026-02-25 11:57 CET — OK (v1.1.4173 détectée, bug confirmé) |

### 10.2 Fonctionnement V\&V

Le watchdog exécute un cycle V\&V en 3 phases :

1. **Détection** — Compare la version installée (registre \+ dossier app-\*) à la version buggée 1.1.4173  
2. **Validation** — Si nouvelle version : lance Claude Desktop 15s, vérifie fenêtre visible \+ absence erreur @formatjs dans les logs  
3. **Notification** — Toast Windows \+ rapport markdown si V\&V PASS ; log silencieux si version inchangée

### 10.3 Désactivation (post-correctif)

schtasks /delete /tn "AEGIS-CDSKT-Watchdog" /f

---

## 11\. LESSONS LEARNED — RECOMMANDATIONS

### 11.1 Windows Update — Préversions LCU

| \# | Lesson | Recommandation | Prio |
| :---- | :---- | :---- | :---- |
| **LL1** | Les préversions LCU s'intègrent au servicing stack et deviennent **permanentes** (CBS\_E\_CANNOT\_UNINSTALL) | Ne JAMAIS installer de preview sans point de restauration vérifié au préalable | P0 |
| **LL2** | wusa et DISM ne peuvent pas désinstaller une LCU marquée permanente | La **restauration système** est la seule méthode fiable de rollback | P0 |
| **LL3** | DISM indexe les packages sous 26100.xxxx même pour les systèmes 25H2 (26200) | Toujours chercher par numéro de build interne, pas par build affiché | P1 |
| **LL4** | La restauration système supprime les apps dans LOCALAPPDATA (ex: Claude Desktop) | Prévoir la réinstallation des apps Electron post-restauration | P1 |
| **LL5** | Les apps Electron laissent des SingletonLock qui bloquent le redémarrage | Nettoyer les fichiers Singleton\* avant tout relancement | P2 |

### 11.2 Diagnostic applicatif — Méthodologie

| \# | Lesson | Recommandation | Prio |
| :---- | :---- | :---- | :---- |
| **LL6** | Toujours vérifier les issues GitHub AVANT de troubleshooter localement | Recherche web `[app] [version] [erreur]` en priorité — évite des heures de diagnostic inutile | P0 |
| **LL7** | Ne pas attribuer un bug à Windows Update sans preuve de causalité | Isoler la variable : restaurer le build ET tester l'app AVANT de conclure | P1 |
| **LL8** | Les erreurs PS dans la console ne sont pas toujours la cause racine | Toujours vérifier les logs applicatifs (`%APPDATA%\[app]\logs\`) | P1 |

### 11.3 Architecture ARM64 — Clarifications

| \# | Lesson | Recommandation | Prio |
| :---- | :---- | :---- | :---- |
| **LL9** | 26100 vs 26200 \= 24H2 vs 25H2 (PAS x64 vs ARM64) | Corriger les bridges précédents. Les deux builds existent pour toutes les architectures. | P0 |
| **LL10** | L'enablement package (KB5054156) change l'affichage mais pas la base DISM | Documenter les deux identifiants (affiché/interne) dans chaque bridge WinUP | P1 |
| **LL11** | L'execution policy AllSigned bloque les scripts PS non signés | Utiliser `-ExecutionPolicy Bypass` pour les scripts AEGIS ou passer en `RemoteSigned` pour CurrentUser | P2 |

### 11.4 Workflow AEGIS — Résilience

| \# | Lesson | Recommandation | Prio |
| :---- | :---- | :---- | :---- |
| **LL12** | Claude Desktop bloqué \= MCP Filesystem inaccessible | Maintenir claude.ai (web) comme plateforme **principale** — Desktop est un complément, pas une dépendance | P0 |
| **LL13** | Pas de monitoring proactif sur les outils tiers | Déployer des watchdogs PS pour les composants critiques (modèle aegis-cdskt-watchdog.ps1 réutilisable) | P1 |
| **LL14** | Claude Code CLI ARM64 (v2.1.41+) reste non testé | Planifier le test comme fallback MCP si Desktop reste bloqué longtemps | P2 |

---

## 12\. MISE À JOUR PLAN D'ACTIONS (T1200)

| ID | Action | Outil | Délai | Statut |
| :---- | :---- | :---- | :---- | :---- |
| **A1** | Surveiller issue GitHub \#28304 | Watchdog automatique | Continu | ✅ AUTOMATISÉ |
| **A2** | Ne PAS installer KB5077241 (preview) | WU Settings | Décision prise | ✅ DÉCIDÉ |
| **A3** | Décocher "Recevoir les dernières MAJ" dans WU | WU Settings | J0 | À FAIRE |
| **A4** | Tester Claude Code CLI ARM64 v2.1.41+ | PowerShell | J+3 | À FAIRE (si CDSKT non corrigé) |
| **A5** | Reconfigurer MCP Filesystem | Config JSON | Post-correctif CDSKT | EN ATTENTE |
| **A6** | Corriger builds 26100/26200 dans SUIVI\_WINUP | claude.ai | J+1 | À FAIRE |
| **A7** | Passer ExecutionPolicy en RemoteSigned (CurrentUser) | PowerShell | J+1 | OPTIONNEL |
| **A8** | Archiver le modèle watchdog pour réutilisation | Projects AEGIS | J+1 | À FAIRE |

---

*AEGIS CIRCULAR — Bridge WinUP Désinstallation KB5077241 \+ Diagnostic Claude Desktop v1.1.4173 \+ Watchdog* *Généré par Claude Opus 4.6 — 2026-02-25 12:00 CET*  
