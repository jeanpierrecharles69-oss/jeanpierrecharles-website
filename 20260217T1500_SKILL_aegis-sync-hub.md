# SKILL: aegis-sync-hub — Ajout et gestion de sources sync

## Quand utiliser ce skill

- Ajouter un nouveau dossier local a synchroniser vers Google Drive  
- Modifier le filtre d'une source existante  
- Diagnostiquer un probleme de sync  
- Preparer une migration (OneDrive, ProtonDrive, Nextcloud)

## Fichier cible

C:\\Users\\jpcha\\Scripts\\antigravity\_sync\_pipeline\\aegis-sync-hub.ps1

## Procedure : Ajouter une source (5 min)

### Etape 1 — Definir la source

Repondre a ces 4 questions :

- **Nom** : identifiant court (ex: `migration`, `onedrive-pro`)  
- **Chemin local** : dossier a scanner (ex: `C:\Projects\Migration_Cloud_2026`)  
- **Dossier Drive** : nom du sous-dossier cree sous RootFolderID dans Google Drive  
- **Filtre** : quelles extensions/fichiers inclure

### Etape 2 — Editer le tableau $SOURCES

Ouvrir `aegis-sync-hub.ps1` et ajouter un bloc dans le tableau `$SOURCES` :

    @{

        Name       \= "nom-source"

        LocalPath  \= "C:\\chemin\\vers\\dossier"

        DriveFolder \= "Nom\_Dossier\_Drive"

        Description \= "Description courte pour \-ListSources"

        Group      \= "groupe"           \# aegis | ai-tools | migration

        FileFilter \= { param($f)

            $f.Extension \-in @(".md", ".txt", ".csv", ".json", ".ps1",

                               ".docx", ".xlsx", ".pdf")

        }

    }

### Etape 3 — Respecter la syntaxe du tableau

CRITIQUE : le dernier element du tableau n'a PAS de virgule apres `}`.

$SOURCES \= @(

    @{ ... },      \# virgule (suivi d'un autre)

    @{ ... },      \# virgule

    @{ ... }       \# PAS de virgule \= dernier element

)

Si vous ajoutez un element a la fin, ajoutez une virgule a l'ancien dernier.

### Etape 4 — Verifier

cd $env:USERPROFILE\\Scripts\\antigravity\_sync\_pipeline

\# La source apparait-elle ?

.\\aegis-sync-hub.ps1 \-ListSources

\# Simulation (aucun upload)

.\\aegis-sync-hub.ps1 \-OnlySource nom-source \-DryRun \-Verbose

\# Sync reel

.\\aegis-sync-hub.ps1 \-OnlySource nom-source \-Verbose

### Etape 5 — Valider le cache

Relancer une 2eme fois :

.\\aegis-sync-hub.ps1 \-OnlySource nom-source \-Verbose

Resultat attendu : **0 created, 0 updated, N unchanged**.

## Filtres courants (copier-coller)

### Documents bureautiques uniquement

FileFilter \= { param($f)

    $f.Extension \-in @(".docx", ".xlsx", ".pptx", ".pdf", ".md", ".txt")

}

### Code source

FileFilter \= { param($f)

    $f.Extension \-in @(".ts", ".tsx", ".js", ".jsx", ".py", ".ps1",

                       ".sh", ".json", ".yaml", ".yml", ".css", ".html")

}

### Tout sauf les binaires lourds

FileFilter \= { param($f)

    $f.Extension \-notin @(".exe", ".msi", ".zip", ".tar", ".gz",

                          ".iso", ".img", ".mp4", ".avi", ".mov") \-and

    $f.Length \-lt (10 \* 1024 \* 1024\)  \# max 10 MB

}

### Fichiers modifies recemment (\< 90 jours)

FileFilter \= { param($f)

    $f.LastWriteTime \-gt (Get-Date).AddDays(-90) \-and

    $f.Extension \-in @(".docx", ".xlsx", ".pdf", ".md", ".txt")

}

## Commandes de reference

| Action | Commande |
| :---- | :---- |
| Lister les sources | `.\aegis-sync-hub.ps1 -ListSources` |
| Sync une source | `.\aegis-sync-hub.ps1 -OnlySource nom` |
| Sync plusieurs | `.\aegis-sync-hub.ps1 -OnlySource project,migration` |
| Sync tout | `.\aegis-sync-hub.ps1` |
| Forcer re-upload | `.\aegis-sync-hub.ps1 -Force` |
| Simulation | `.\aegis-sync-hub.ps1 -DryRun` |
| Debug | `.\aegis-sync-hub.ps1 -Verbose` |
| Voir les logs | `Get-Content $env:USERPROFILE\.config\ag_sync\sync_hub.log -Tail 30` |
| Voir le cache | `Get-Content $env:USERPROFILE\.config\ag_sync\sync_hashes.json` |

## Tache planifiee

La tache `Antigravity-Sync-Pipeline` execute TOUTES les sources toutes les 15 min via `pwsh.exe`. Toute nouvelle source ajoutee au tableau sera automatiquement incluse au prochain run.

\# Verifier la tache

(Get-ScheduledTask \-TaskName "Antigravity-Sync-Pipeline").Actions | Format-List

## Depannage

| Symptome | Cause | Solution |
| :---- | :---- | :---- |
| ParserError ligne N | Virgule en trop/manquante dans $SOURCES | Verifier syntaxe tableau (dernier element sans virgule) |
| "fichier non signe" | Zone.Identifier apres telechargement | `Unblock-File .\aegis-sync-hub.ps1` |
| Tous les fichiers re-uploades | Cache corrompu ou vide | Normal au 1er run ; verifier au 2eme run |
| Token refresh failed | Token expire ou credentials invalides | Relancer `.\setup_oauth.ps1` |
| 0 fichiers trouves | FileFilter trop restrictif | Tester avec `-DryRun -Verbose` |

## Architecture du script

aegis-sync-hub.ps1 v1.0.3

├── $CONFIG        : chemins token, credentials, cache, log

├── $SOURCES       : tableau des sources (EDITER ICI)

├── ConvertTo-Hashtable : fix PS 5.1 (AsHashtable)

├── Get-AccessToken : OAuth2 Google (refresh auto)

├── Get-OrCreateDriveFolder : creation recursive dossiers Drive

├── Upload-FileToDrive : upload \+ detection secrets \+ dedup

├── Get-HashCache / Save-HashCache : cache SHA-256

└── Sync-Source    : orchestration par source

## Lecons apprises

- **L15** : Les fichiers .ps1 telecharges depuis claude.ai doivent etre 100% ASCII (pas d'emojis, pas de tirets longs)  
- **L16** : PowerShell 5.1 ne supporte pas `-AsHashtable` (corrige dans v1.0.3)  
- **L17** : `Unblock-File` obligatoire apres chaque telechargement web  
- **L18** : Ne JAMAIS supprimer dans G:\\Mon Drive — la suppression se propage au cloud via Drive Desktop  
- **L19** : Le dernier element d'un tableau PowerShell @() ne prend PAS de virgule

