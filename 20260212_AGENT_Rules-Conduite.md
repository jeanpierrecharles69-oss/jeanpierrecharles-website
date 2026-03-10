# AGENT_RULES.md — RÈGLES DE CONDUITE AGENT IA

## Briefing Obligatoire · Nettoyage & Organisation Cloud Storage

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Métadonnée | Valeur |
| :---- | :---- |
| **Document** | Règles de conduite Agent IA — Migration Cloud Storage |
| **Référence** | 20260212_AGENT_Rules-Conduite |
| **Version** | 1.0 |
| **Date** | 12 février 2026 |
| **Contexte** | Migration OneDrive → Google Drive + Organisation fichiers |
| **Propriétaire** | Jean-Pierre Charles · FR 86 Tercé NA · jeanpierrecharles69@gmail.com |
| **Classification** | Document interne — Usage professionnel |
| **Usage** | Coller en début de CHAQUE session Antigravity liée à la migration |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## §1 — IDENTITÉ ET CONTEXTE PROJET

**Qui je suis** : Jean-Pierre Charles, ingénieur senior mécatronique, 30+ ans d'expérience industrielle (Autoliv, Faurecia, Saft). Expert compliance. Développeur de la plateforme SaaS Aegis Circular.

**Ce que je fais** : Migration consolidation de mon stockage cloud (OneDrive 200 GB + Google Drive 80 GB → Google Drive unique + backup Proton Drive).

**Pourquoi** : Simplification opérationnelle, réduction des coûts, sécurisation des données.

**Outils** :
- Rclone v1.73.0 (ARM64, installé via winget)
- Remote configuré : `gdrive:` → `jeanpierrecharles69@gmail.com`
- Surface Pro 11 · Windows 11 ARM64
- Git/GitHub pour les Master Files Aegis Circular

**Projet parallèle** : JeanPierreCharles Intelligence (Knowledge Management multi-sources). Ne PAS interférer avec ce projet durant les sessions migration.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## §2 — RÈGLES ABSOLUES (NON NÉGOCIABLES)

### RÈGLE 1 — AUCUNE OPÉRATION DESTRUCTIVE DIRECTE

```
🔴 INTERDIT : Remove-Item, del, rclone delete, rclone purge, rm, rmdir
🔴 INTERDIT : rclone move (car supprime la source)
🔴 INTERDIT : rclone sync (car peut supprimer des fichiers à la destination)
```

**Workflow obligatoire** :

```
Étape 1 → Agent analyse et produit un RAPPORT (CSV, JSON ou Markdown)
Étape 2 → L'UTILISATEUR valide le rapport (review humain)
Étape 3 → Agent génère un SCRIPT d'exécution (.ps1 ou .sh)
Étape 4 → L'UTILISATEUR exécute le script manuellement
```

L'agent NE DOIT JAMAIS exécuter une action qui supprime, déplace ou renomme un fichier sans que l'utilisateur ait validé explicitement le rapport d'intention.

**Commandes AUTORISÉES sans validation** :

```
✅ Get-ChildItem (lecture)
✅ rclone ls, rclone lsd, rclone lsf, rclone lsjson (lecture)
✅ rclone size (lecture)
✅ rclone check (vérification intégrité, lecture seule)
✅ Export-Csv, Out-File, ConvertTo-Json (écriture de rapports)
✅ rclone copy (copie non destructive — la source reste intacte)
```

### RÈGLE 2 — MÉTADONNÉES UNIQUEMENT POUR FICHIERS SENSIBLES

L'agent travaille sur les **métadonnées** des fichiers (nom, extension, taille, date modification, chemin) et NON sur leur contenu.

**Raisons** :
- Documents compliance sous NDA potentiel (Autoliv, Faurecia, Saft)
- Données fiscales personnelles (URSSAF, DGFIP)
- Documents stratégiques Aegis Circular
- Le contenu transite par l'infrastructure Google lors du traitement

**Si l'agent a besoin de comprendre le contenu d'un fichier** :
- Demander à l'utilisateur d'ouvrir et décrire le fichier
- OU travailler uniquement sur le nom de fichier et l'extension
- NE JAMAIS lire le contenu de fichiers PDF, DOCX, XLSX contenant des données compliance ou fiscales

**Exceptions autorisées** (contenu lisible par l'agent) :
- Fichiers `.md` du projet (documentation, README)
- Scripts `.ps1`, `.sh`, `.py` (code)
- Fichiers `.json` de configuration
- Fichiers `.csv` de rapports générés par les scripts de migration

### RÈGLE 3 — ZONES INTERDITES

```
🚫 C:\Projects\jeanpierrecharles\          → Géré par Git. Ne JAMAIS toucher.
🚫 C:\Projects\jeanpierrecharles\.git\     → Dépôt Git. INTERDIT.
🚫 G:\Mon Drive\                            → Mirror Google Drive Desktop. Laisser sync gérer.
🚫 %APPDATA%\                               → Configuration système.
🚫 %LOCALAPPDATA%\Google\Chrome\            → Données navigateur (géré par JPC Intelligence).
```

**Zones de travail autorisées** :

```
✅ C:\Users\jpcha\OneDrive\                 → Source principale de migration
✅ C:\Migration_Cloud_2026\                  → Espace de travail migration (rapports, logs, scripts)
✅ gdrive:                                   → Destination Google Drive (via rclone, lecture + copie)
✅ C:\Users\jpcha\Téléchargements\           → Fichiers récents à trier
```

### RÈGLE 4 — SNAPSHOT AVANT CHAQUE SESSION

Avant toute opération d'analyse, l'agent DOIT produire un snapshot des métadonnées du périmètre ciblé.

**Script snapshot standard** :

```powershell
# Snapshot OneDrive — exécuter en début de session
$SnapshotDate = Get-Date -Format "yyyyMMdd_HHmm"
$SnapshotDir = "C:\Migration_Cloud_2026\snapshots"
if (-not (Test-Path $SnapshotDir)) { New-Item -ItemType Directory -Path $SnapshotDir -Force }

Get-ChildItem $env:OneDrive -Recurse -File -ErrorAction SilentlyContinue |
    Select-Object FullName, Name, Extension, Length,
                  @{N='SizeMB';E={[math]::Round($_.Length / 1MB, 2)}},
                  LastWriteTime, CreationTime |
    Export-Csv "$SnapshotDir\${SnapshotDate}_onedrive_snapshot.csv" -NoTypeInformation -Encoding UTF8

Write-Host "✓ Snapshot sauvegardé : ${SnapshotDate}_onedrive_snapshot.csv"
```

**Script snapshot Google Drive** :

```powershell
$SnapshotDate = Get-Date -Format "yyyyMMdd_HHmm"
$SnapshotDir = "C:\Migration_Cloud_2026\snapshots"

rclone lsjson gdrive: --recursive --no-mimetype |
    Out-File "$SnapshotDir\${SnapshotDate}_gdrive_snapshot.json" -Encoding UTF8

Write-Host "✓ Snapshot Google Drive sauvegardé"
```

Ces snapshots sont le point de restauration en cas d'erreur.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## §3 — CONVENTION DE NOMMAGE

### Format standard

```
[AAAAMMJJ]_[THEME]_[Description-Courte].[ext]
```

### Composants

| Composant | Format | Règle |
| :---- | :---- | :---- |
| **Date** | AAAAMMJJ (8 chiffres) | Date de création du fichier |
| **Thème** | MAJUSCULES, 3-12 car. | Catégorie principale |
| **Description** | Mots-Tirets | Description concise, pas d'espaces, pas d'accents |
| **Extension** | .ext | Extension standard du type de fichier |

### Thèmes autorisés

| Thème | Périmètre |
| :---- | :---- |
| ADMIN | Administration générale, courriers |
| ARCHIVE | Anciens projets, documents historiques |
| AEGIS | Projet Aegis Circular Platform |
| COMPLIANCE | Expertise réglementaire, normes, audits |
| ENERGIE | Rapports énergie, EDF, environnement |
| FINANCE | Comptabilité, facturation, budget |
| LEX | Documents juridiques, veille législative |
| MIGRATION | Scripts et rapports de migration cloud |
| PERSO | Documents personnels |
| PROJET | Projets techniques divers |
| RCLONE | Configuration et scripts rclone |
| URSSAF | Déclarations et documents URSSAF |
| DGFIP | Documents fiscaux DGFIP |

### Exemples conformes

```
✓ 20260212_LEX_Plan-Organisation-Dossier.docx
✓ 20260212_RCLONE_Guide-Configuration.md
✓ 20230601_URSSAF_Declaration-CA-T2.pdf
✓ 20260217_MIGRATION_Audit-OneDrive.ps1
✓ 20260303_MIGRATION_Rapport-Nettoyage.csv
✓ 20241015_COMPLIANCE_Audit-Faurecia-Q3.pdf
```

### Exemples NON conformes

```
✗ document.pdf                    → Pas de date, pas de thème
✗ document (1).pdf                → Copie avec parenthèses
✗ 1744700367509.pdf               → Nom système non descriptif
✗ Rapport final v2 (copie).docx   → Espaces, parenthèses, version dans le nom
✗ scan_20260212.pdf               → Date mal positionnée, pas de thème
```

### Renommage de fichiers existants

Quand l'agent identifie un fichier à renommer, il produit une **table de correspondance** :

```csv
Ancien_Nom,Nouveau_Nom,Raison
document.pdf,20260115_ADMIN_Attestation-Domicile.pdf,Identifié comme attestation
1744700367509.pdf,20240726_ENERGIE_Rapport-Impact-EDF.pdf,Rapport EDF identifié par contenu
```

L'utilisateur valide la table AVANT exécution du renommage.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## §4 — STRUCTURE GOOGLE DRIVE CIBLE

### Arborescence de destination

```
Google Drive (2TB — Master)
│
├── 01_Projets_Actifs/
│   ├── Aegis_Circular/
│   │   ├── Master_Files/           ← Mirror Git (NE PAS modifier ici)
│   │   ├── Dev/
│   │   └── Business/
│   └── JPC_Intelligence/
│       ├── Phase1/
│       └── Phase2/
│
├── 02_Compliance_Expertise/
│   ├── Autoliv/
│   ├── Faurecia/
│   ├── Saft/
│   ├── Certifications/
│   └── Veille_Reglementaire/
│
├── 03_Administration/
│   ├── LEX/                        ← Migré depuis OneDrive/LEX ✅
│   ├── URSSAF/
│   ├── DGFIP/
│   └── Correspondance/
│
├── 04_Personnel/
│   ├── Documents_Identite/
│   ├── Sante/
│   └── Divers/
│
├── 05_Archives/
│   ├── Projets_Termines/
│   └── Archives_Avant_2020/
│
└── Google_Antigravity/              ← Espace de travail Antigravity (existant)
```

### Règles de classement

| Si le fichier concerne... | → Destination |
| :---- | :---- |
| Aegis Circular, SaaS, plateforme | `01_Projets_Actifs/Aegis_Circular/` |
| JPC Intelligence, browser history | `01_Projets_Actifs/JPC_Intelligence/` |
| Audit, norme, ISO, IATF, compliance | `02_Compliance_Expertise/` |
| URSSAF, DGFIP, factures, admin | `03_Administration/` |
| Photos, documents personnels | `04_Personnel/` |
| Projets terminés, >2 ans sans accès | `05_Archives/` |
| Fichier non classifiable | **Demander à l'utilisateur** |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## §5 — WORKFLOW TYPE D'UNE SESSION

### Début de session

```
1. Rappeler le périmètre de la session (quel dossier/zone)
2. Exécuter le snapshot (§2 Règle 4)
3. Scanner les métadonnées du périmètre
4. Produire un rapport d'état (nombre fichiers, volume, types, anomalies)
```

### Analyse et recommandations

```
5. Identifier les fichiers candidats au nettoyage :
   - Extensions temporaires : .tmp, .temp, .cache, .bak, .old
   - Fichiers système : Thumbs.db, Desktop.ini, .DS_Store
   - Doublons (même nom + taille similaire ±0.1 MB)
   - Fichiers non nommés (document.pdf, sans-titre.docx)
   - Fichiers volumineux non modifiés depuis >3 ans

6. Identifier les fichiers candidats au renommage :
   - Ne respectant pas la convention AAAAMMJJ_THEME_Description
   - Noms génériques (document, scan, copie, etc.)
   - Espaces, accents, parenthèses dans le nom

7. Proposer le classement dans la structure GDrive cible (§4)

8. Produire un rapport structuré avec 3 sections :
   a) SUPPRIMER — fichiers inutiles (avec justification)
   b) RENOMMER — table ancien_nom → nouveau_nom
   c) DÉPLACER — table fichier → destination GDrive
```

### Validation et exécution

```
9.  ATTENDRE validation utilisateur sur chaque section (a, b, c)
10. Générer les scripts d'exécution (.ps1) pour les actions validées
11. L'UTILISATEUR exécute les scripts
12. Vérifier le résultat (post-snapshot, comparaison avant/après)
```

### Fin de session

```
13. Produire une entrée journal de bord :

## [DATE] — Session [N] : [Périmètre]
- Outil : Antigravity + Opus 4.6
- Périmètre : [dossier analysé]
- Fichiers analysés : [nombre]
- Actions : [supprimés: N, renommés: N, déplacés: N]
- Volume libéré : [X MB/GB]
- Anomalies : [le cas échéant]
- Prochaine session : [périmètre suivant]
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## §6 — BATCHING PAR DOSSIER

OneDrive contient ~200 GB et des milliers de fichiers. Traiter tout en une session est impossible (limites contexte LLM).

### Ordre de traitement recommandé

| Session | Périmètre | Volume est. | Priorité |
| :---- | :---- | :---- | :---- |
| 0 | OneDrive\LEX | ~1 MB | ✅ FAIT |
| 1 | OneDrive\ (racine, niveau 1 uniquement) | — | 🔴 Vue d'ensemble |
| 2 | OneDrive\Documents | Variable | 🔴 Probable gros volume |
| 3 | OneDrive\Bureau (Desktop) | Variable | 🟡 Souvent encombré |
| 4 | OneDrive\Images | Variable | 🟡 Photos, captures |
| 5 | OneDrive\[dossier suivant par volume décroissant] | — | 🟢 Itératif |
| ... | Continuer jusqu'à couverture 100% | — | — |
| N | Google Drive (audit de l'existant) | ~80 GB | 🔴 Après OneDrive |

### Critère de fin de session

Une session se termine quand :
- Le périmètre du dossier est entièrement analysé
- Le rapport est produit et prêt pour validation
- L'entrée journal est rédigée
- Le périmètre de la session suivante est identifié

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## §7 — COMMANDES RCLONE DE RÉFÉRENCE

### Configuration actuelle

```
Remote : gdrive:
Compte : jeanpierrecharles69@gmail.com
Scope  : 1 (Full access)
Rclone : v1.73.0 (ARM64)
PATH   : C:\Users\jpcha\AppData\Local\Microsoft\WinGet\Packages\
         Rclone.Rclone_Microsoft.Winget.Source_8wekyb3d8bbwe\
         rclone-v1.73.0-windows-arm64\rclone.exe
```

### Commandes lecture seule (autorisées sans validation)

```powershell
# Lister dossiers racine Google Drive
rclone lsd gdrive:

# Lister récursivement avec métadonnées JSON
rclone lsjson gdrive: --recursive --no-mimetype

# Taille d'un dossier
rclone size gdrive:01_Projets_Actifs

# Vérifier intégrité (comparaison source ↔ destination)
rclone check "onedrive_local_path" "gdrive:destination" --one-way
```

### Commandes copie (autorisées, non destructives)

```powershell
# Copier un fichier (source intacte)
rclone copy "C:\source\fichier.pdf" "gdrive:destination/" --progress

# Copier un dossier (source intacte)
rclone copy "C:\source\dossier" "gdrive:destination/dossier" --progress --checksum
```

### Commandes INTERDITES (destructives)

```powershell
# 🔴 INTERDIT — supprime des fichiers
rclone delete gdrive:chemin
rclone purge gdrive:chemin

# 🔴 INTERDIT — peut supprimer à la destination
rclone sync source: dest:

# 🔴 INTERDIT — supprime la source après copie
rclone move source: dest:
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## §8 — GESTION DES MASTER FILES AEGIS CIRCULAR

### Fichiers protégés (NE JAMAIS TOUCHER)

```
C:\Projects\jeanpierrecharles\PRJ_BRAIN_MASTER.md
C:\Projects\jeanpierrecharles\PRJ_BUSINESS_STRATEGY.md
C:\Projects\jeanpierrecharles\PRJ_TECHNICAL_CORE.md
C:\Projects\jeanpierrecharles\PRJ_COMPLIANCE_MATRIX.md
C:\Projects\jeanpierrecharles\PRJ_PROJECT_HISTORY.md
```

### Règle de synchronisation

```
Git (C:\Projects\) = SOURCE DE VÉRITÉ
Google Drive (G:\Mon Drive\ ou gdrive:) = COPIE MIROIR

Flux autorisé : Git → Google Drive (copie)
Flux INTERDIT : Google Drive → Git (jamais modifier via Drive)
```

### Si la session concerne les Master Files

- NE PAS renommer
- NE PAS déplacer
- NE PAS modifier le contenu
- Vérifier que le mirror Google Drive est à jour (`rclone check`)
- Signaler si des modifications non committées existent

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## §9 — FORMATS DE RAPPORT STANDARD

### Rapport d'audit (début de session)

```markdown
# RAPPORT AUDIT — [Périmètre]
Date : [AAAA-MM-JJ HH:MM]
Session : [N]

## Métriques
- Fichiers totaux : [N]
- Volume total : [X MB/GB]
- Extensions distinctes : [liste]
- Fichier le plus ancien : [date]
- Fichier le plus récent : [date]
- Fichier le plus volumineux : [nom, taille]

## Anomalies détectées
- Fichiers sans nom descriptif : [N]
- Fichiers temporaires : [N]
- Doublons potentiels : [N]
- Fichiers >100 MB non modifiés >3 ans : [N]
```

### Rapport d'action (fin d'analyse)

```csv
Action,Fichier_Actuel,Fichier_Cible,Raison,Taille_MB
SUPPRIMER,Thumbs.db,,Fichier système inutile,0.01
RENOMMER,document.pdf,20260115_ADMIN_Attestation.pdf,Nom non descriptif,0.24
DEPLACER,facture_edf.pdf,03_Administration/ENERGIE/20240301_ENERGIE_Facture-EDF.pdf,Classement,1.2
IGNORER,PRJ_BRAIN_MASTER.md,,Fichier protégé Git,0.5
```

### Entrée journal de bord

```markdown
## [AAAA-MM-JJ] — Session [N] : [Périmètre]
- **Outil** : Antigravity + Opus 4.6
- **Périmètre** : [chemin du dossier]
- **Snapshot** : [nom du fichier snapshot]
- **Fichiers analysés** : [N]
- **Actions validées** : Supprimés [N] · Renommés [N] · Déplacés [N]
- **Volume libéré** : [X MB/GB]
- **Anomalies** : [description ou "Aucune"]
- **Prochaine session** : [périmètre]
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## §10 — RAPPEL SÉCURITÉ & CONFIDENTIALITÉ

| Donnée | Niveau | Traitement agent |
| :---- | :---- | :---- |
| Noms de fichiers, extensions, tailles, dates | Public | ✅ Lecture autorisée |
| Structure dossiers | Public | ✅ Lecture autorisée |
| Scripts .ps1, .sh, .py | Interne | ✅ Lecture/écriture autorisée |
| README, .md documentation | Interne | ✅ Lecture/écriture autorisée |
| Documents compliance (Autoliv, Faurecia, Saft) | **Confidentiel** | 🔴 MÉTADONNÉES UNIQUEMENT |
| Documents fiscaux (URSSAF, DGFIP) | **Confidentiel** | 🔴 MÉTADONNÉES UNIQUEMENT |
| Master Files PRJ_*.md | **Stratégique** | 🔴 NE PAS TOUCHER |
| Données personnelles (santé, identité) | **RGPD** | 🔴 MÉTADONNÉES UNIQUEMENT |

**Rappel** : Les données traitées par Antigravity transitent par l'infrastructure Google (DeepMind). Seules les métadonnées doivent être exposées pour les fichiers classés Confidentiel ou supérieur.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## §11 — HISTORIQUE DES SESSIONS

| Date | Session | Périmètre | Résultat | Agent |
| :---- | :---- | :---- | :---- | :---- |
| 2026-02-12 | 0 | OneDrive\LEX | 60→7 fichiers, -84 MB | Antigravity + Claude |
| 2026-02-12 | — | Contre-expertise globale | Plan aligné v2 produit | Claude.ai Opus 4.6 |
| | 1 | | | |
| | 2 | | | |
| | 3 | | | |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**FIN DU DOCUMENT — AGENT_RULES.md v1.0**

*Généré par Claude (Anthropic) · Opus 4.6 · Claude.ai*
*Pour Jean-Pierre Charles · Projet Aegis Circular*
*12 février 2026*
