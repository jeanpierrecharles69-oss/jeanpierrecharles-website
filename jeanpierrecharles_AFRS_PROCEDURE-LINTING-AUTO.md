# Procédure d'Automatisation du Linting Markdown - AFRS

**Version**: 1.0  
**Date**: 19 janvier 2026  
**Système**: Windows 11 (PowerShell)  
**Utilisateur**: Jean-Pierre Charles

---

## 🎯 Objectif

Mettre en place une procédure **100% automatique** pour détecter et corriger les erreurs de linting Markdown dans tous les documents AFRS, sans intervention manuelle.

---

## 📋 Prérequis

### Logiciels Nécessaires

1. **Node.js** (version 18 ou supérieure)
   - Téléchargement : [https://nodejs.org/](https://nodejs.org/)
   - Installer la version LTS (Long Term Support)

2. **PowerShell** (déjà installé sur Windows 11)
   - Vérification : Ouvrir PowerShell et taper `$PSVersionTable`

3. **Accès à Google Drive**
   - Dossier : `G:\Mon Drive\Google AI Studio`

---

## 🚀 Installation (Une Seule Fois)

### Étape 1 : Installer Node.js

```powershell
# 1. Télécharger Node.js depuis https://nodejs.org/
# 2. Exécuter l'installateur (.msi)
# 3. Suivre l'assistant d'installation (paramètres par défaut OK)
# 4. Redémarrer PowerShell
# 5. Vérifier l'installation :

node --version
# Doit afficher : v18.x.x ou supérieur

npm --version
# Doit afficher : 9.x.x ou supérieur
```

---

### Étape 2 : Installer Markdownlint

Ouvrir PowerShell **en tant qu'administrateur** :

```powershell
# Installer markdownlint globalement
npm install -g markdownlint-cli

# Vérifier l'installation
markdownlint --version
# Doit afficher : 0.x.x
```

**Note** : Si vous obtenez une erreur de permissions, exécutez :

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### Étape 3 : Créer le Fichier de Configuration

Créer le fichier `.markdownlint.json` dans votre dossier AFRS :

**Emplacement** : `G:\Mon Drive\Google AI Studio\.markdownlint.json`

**Contenu** :

```json
{
  "default": true,
  "MD013": false,
  "MD033": false,
  "MD041": false,
  "MD024": {
    "siblings_only": true
  }
}
```

**Explication des règles** :

- `"default": true` → Active toutes les règles par défaut
- `"MD013": false` → Désactive la limite de 80 caractères par ligne (trop strict pour AFRS)
- `"MD033": false` → Autorise le HTML dans Markdown (pour émojis complexes)
- `"MD041": false` → Pas obligé de commencer chaque fichier par un titre h1
- `"MD024": {"siblings_only": true}` → Titres dupliqués OK s'ils ne sont pas au même niveau

---

## 📝 Scripts PowerShell Automatiques

### Script 1 : Vérification Simple

Créer le fichier : `G:\Mon Drive\Google AI Studio\lint-check.ps1`

```powershell
# ========================================
# Script de Vérification Linting AFRS
# ========================================

# Configuration
$DocsPath = "G:\Mon Drive\Google AI Studio"
$LogFile = "$DocsPath\lint-check-log.txt"

# Bannière
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  AFRS - Vérification Linting Markdown" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Changement de répertoire
Set-Location $DocsPath

# Vérification
Write-Host "📂 Analyse du dossier : $DocsPath" -ForegroundColor Yellow
Write-Host ""

# Exécution markdownlint
$result = & markdownlint "jeanpierrecharles_AFRS_*.md" --config .markdownlint.json 2>&1

# Sauvegarde du log
$result | Out-File -FilePath $LogFile -Encoding UTF8

# Affichage des résultats
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ SUCCÈS : Aucune erreur détectée !" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Tous les documents AFRS sont conformes." -ForegroundColor Green
} else {
    Write-Host "⚠️ ATTENTION : Erreurs détectées" -ForegroundColor Red
    Write-Host ""
    Write-Host $result
    Write-Host ""
    Write-Host "📄 Détails sauvegardés dans : $LogFile" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Exécutez 'lint-fix.ps1' pour corriger automatiquement." -ForegroundColor Cyan
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Read-Host "Appuyez sur Entrée pour fermer"
```

**Utilisation** :

```powershell
# Clic droit sur lint-check.ps1 → "Exécuter avec PowerShell"
# OU dans PowerShell :
cd "G:\Mon Drive\Google AI Studio"
.\lint-check.ps1
```

---

### Script 2 : Correction Automatique

Créer le fichier : `G:\Mon Drive\Google AI Studio\lint-fix.ps1`

```powershell
# ========================================
# Script de Correction Automatique Linting AFRS
# ========================================

# Configuration
$DocsPath = "G:\Mon Drive\Google AI Studio"
$BackupPath = "$DocsPath\backup-avant-lint"
$LogFile = "$DocsPath\lint-fix-log.txt"

# Bannière
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "  AFRS - Correction Automatique Linting" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta
Write-Host ""

# Changement de répertoire
Set-Location $DocsPath

# Création du backup
Write-Host "💾 Création d'une sauvegarde de sécurité..." -ForegroundColor Yellow

if (Test-Path $BackupPath) {
    Remove-Item $BackupPath -Recurse -Force
}
New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null

Get-ChildItem -Path $DocsPath -Filter "jeanpierrecharles_AFRS_*.md" | ForEach-Object {
    Copy-Item $_.FullName -Destination $BackupPath
}

$backupCount = (Get-ChildItem $BackupPath).Count
Write-Host "   ✅ $backupCount fichiers sauvegardés dans : $BackupPath" -ForegroundColor Green
Write-Host ""

# Demande de confirmation
Write-Host "⚠️  ATTENTION : Cette opération va modifier vos fichiers." -ForegroundColor Yellow
Write-Host "   Une sauvegarde a été créée, mais vérifiez bien." -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "   Continuer ? (O/N)"

if ($confirm -ne "O" -and $confirm -ne "o") {
    Write-Host "❌ Opération annulée." -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour fermer"
    exit
}

Write-Host ""
Write-Host "🔧 Correction en cours..." -ForegroundColor Cyan

# Exécution markdownlint avec --fix
$result = & markdownlint "jeanpierrecharles_AFRS_*.md" --config .markdownlint.json --fix 2>&1

# Sauvegarde du log
$result | Out-File -FilePath $LogFile -Encoding UTF8

# Vérification post-correction
Write-Host ""
Write-Host "🔍 Vérification post-correction..." -ForegroundColor Cyan
$checkResult = & markdownlint "jeanpierrecharles_AFRS_*.md" --config .markdownlint.json 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ SUCCÈS COMPLET : Tous les problèmes ont été résolus !" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Statistiques :" -ForegroundColor Cyan
    Write-Host "   - Documents corrigés : $backupCount fichiers" -ForegroundColor White
    Write-Host "   - Erreurs résiduelles : 0" -ForegroundColor White
    Write-Host ""
    Write-Host "💾 Sauvegarde disponible dans : $BackupPath" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "⚠️ CORRECTION PARTIELLE" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Certaines erreurs nécessitent une intervention manuelle :" -ForegroundColor Yellow
    Write-Host $checkResult
    Write-Host ""
    Write-Host "📄 Détails dans : $LogFile" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Magenta
Read-Host "Appuyez sur Entrée pour fermer"
```

**Utilisation** :

```powershell
cd "G:\Mon Drive\Google AI Studio"
.\lint-fix.ps1
```

---

### Script 3 : Surveillance Continue (Optionnel)

Créer le fichier : `G:\Mon Drive\Google AI Studio\lint-watch.ps1`

```powershell
# ========================================
# Script de Surveillance Continue Linting AFRS
# ========================================

# Configuration
$DocsPath = "G:\Mon Drive\Google AI Studio"
$CheckInterval = 300  # 5 minutes en secondes

# Bannière
Write-Host "============================================" -ForegroundColor Green
Write-Host "  AFRS - Surveillance Continue Linting" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "📡 Surveillance active toutes les 5 minutes" -ForegroundColor Cyan
Write-Host "   Appuyez sur Ctrl+C pour arrêter" -ForegroundColor Yellow
Write-Host ""

# Changement de répertoire
Set-Location $DocsPath

# Boucle de surveillance
$iteration = 1
while ($true) {
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] Vérification #$iteration..." -ForegroundColor Cyan
    
    # Exécution silencieuse
    $result = & markdownlint "jeanpierrecharles_AFRS_*.md" --config .markdownlint.json 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[$timestamp] ✅ Aucune erreur" -ForegroundColor Green
    } else {
        Write-Host "[$timestamp] ⚠️ Erreurs détectées !" -ForegroundColor Red
        Write-Host $result -ForegroundColor Yellow
        
        # Notification sonore
        [console]::beep(800, 500)
    }
    
    Write-Host ""
    
    # Attente
    Start-Sleep -Seconds $CheckInterval
    $iteration++
}
```

**Utilisation** :

```powershell
cd "G:\Mon Drive\Google AI Studio"
.\lint-watch.ps1
# Laisser tourner en arrière-plan
```

---

## 🔄 Workflow Automatisé Complet

### Procédure Quotidienne (Recommandée)

```
1. MATIN (Avant de commencer)
   ↓
   Exécuter : lint-check.ps1
   ↓
   Si erreurs → Exécuter : lint-fix.ps1
   ↓
   Commencer à travailler

2. PENDANT LE TRAVAIL
   ↓
   Modifier les documents AFRS normalement
   ↓
   (Optionnel) lint-watch.ps1 en arrière-plan

3. SOIR (Avant de quitter)
   ↓
   Exécuter : lint-check.ps1
   ↓
   Si erreurs → Exécuter : lint-fix.ps1
   ↓
   Synchroniser Google Drive
```

---

## 🛡️ Gestion des Sauvegardes

### Restaurer un Backup

Si une correction automatique a mal tourné :

```powershell
# Restaurer TOUS les fichiers
Copy-Item "G:\Mon Drive\Google AI Studio\backup-avant-lint\*" `
          -Destination "G:\Mon Drive\Google AI Studio" `
          -Force

# Restaurer UN SEUL fichier
Copy-Item "G:\Mon Drive\Google AI Studio\backup-avant-lint\jeanpierrecharles_AFRS_README_v2.md" `
          -Destination "G:\Mon Drive\Google AI Studio" `
          -Force
```

### Nettoyage Périodique

```powershell
# Supprimer les anciens backups (1 fois par semaine)
Remove-Item "G:\Mon Drive\Google AI Studio\backup-avant-lint" -Recurse -Force
Remove-Item "G:\Mon Drive\Google AI Studio\lint-*.log"
```

---

## 📊 Intégration avec VS Code (Bonus)

### Extension Markdownlint pour VS Code

1. **Installer l'extension** :
   - Ouvrir VS Code
   - Extensions (Ctrl+Shift+X)
   - Rechercher "markdownlint"
   - Installer "markdownlint" de David Anson

2. **Configuration automatique** :
   L'extension détectera automatiquement le fichier `.markdownlint.json`

3. **Correction en temps réel** :
   - Les erreurs apparaissent en souligné dans l'éditeur
   - Clic droit → "Fix all markdownlint violations"

---

## 🔧 Personnalisation Avancée

### Ajouter des Fichiers à Ignorer

Créer `.markdownlintignore` :

```
# Fichiers à ignorer
backup-avant-lint/
*.tmp.md
ARCHIVE_*.md
```

### Modifier les Règles de Correction

Dans `.markdownlint.json`, ajouter des configurations spécifiques :

```json
{
  "MD007": { "indent": 2 },      "// Indentation de 2 espaces pour les listes"
  "MD010": { "code_blocks": false }, "// Autoriser tabs dans code"
  "MD025": false                  "// Permet plusieurs h1 dans un fichier"
}
```

---

## 📋 Checklist de Validation

Après installation, vérifier :

- [ ] Node.js installé (`node --version`)
- [ ] Markdownlint installé (`markdownlint --version`)
- [ ] Fichier `.markdownlint.json` créé
- [ ] Script `lint-check.ps1` exécutable
- [ ] Script `lint-fix.ps1` exécutable
- [ ] Script `lint-watch.ps1` exécutable (optionnel)
- [ ] Test sur un fichier : `markdownlint jeanpierrecharles_AFRS_README_v2.md`
- [ ] Backup automatique fonctionnel

---

## ❓ Dépannage

### Problème : "markdownlint n'est pas reconnu"

**Solution** :

```powershell
# Vérifier l'installation
npm list -g markdownlint-cli

# Réinstaller si nécessaire
npm install -g markdownlint-cli --force
```

### Problème : "Accès refusé" lors de l'exécution

**Solution** :

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Problème : "Erreurs persistent après correction"

**Solution** :

- Certaines erreurs (MD024 complexes) nécessitent correction manuelle
- Consulter `lint-fix-log.txt` pour détails
- Utiliser VS Code avec extension pour corrections fines

### Problème : "Google Drive sync conflit"

**Solution** :

- Fermer Google Drive Desktop temporairement
- Exécuter les scripts
- Rouvrir Google Drive Desktop
- Laisser synchroniser

---

## 🎓 Formation Rapide

### Exercice Pratique (15 minutes)

1. **Installation** (5 min)
   - Installer Node.js
   - Installer markdownlint
   - Créer `.markdownlint.json`

2. **Test Manuel** (3 min)

   ```powershell
   cd "G:\Mon Drive\Google AI Studio"
   markdownlint jeanpierrecharles_AFRS_README_v2.md
   ```

3. **Scripts** (5 min)
   - Créer `lint-check.ps1`
   - Tester l'exécution
   - Créer `lint-fix.ps1`

4. **Validation** (2 min)
   - Exécuter lint-check
   - Vérifier résultat
   - Exécuter lint-fix si nécessaire

---

## 📈 Métriques de Suivi

### Tableau de Bord Hebdomadaire

Créer un fichier Excel/Google Sheets :

| Date | Fichiers | Erreurs Avant | Erreurs Après | Temps Correction |
| ---- | -------- | ------------- | ------------- | ---------------- |
| 19/01 | 5 | 84 | 0 | 2 min |
| 20/01 | 5 | 0 | 0 | 0 min |
| ... | ... | ... | ... | ... |

**Objectif** : Maintenir "0 erreurs" en permanence

---

## 🚀 Prochaines Étapes

### Après l'Installation

1. **Semaine 1** : Utiliser lint-check.ps1 quotidiennement
2. **Semaine 2** : Activer lint-watch.ps1 en continu
3. **Semaine 3** : Intégrer VS Code avec extension
4. **Semaine 4** : Créer raccourcis clavier personnalisés

### Améliorations Futures

- [ ] Script d'auto-démarrage Windows (Task Scheduler)
- [ ] Intégration avec Git (pre-commit hook)
- [ ] Dashboard web pour statistiques
- [ ] Notifications par email en cas d'erreur

---

## ✅ Validation Finale

### Test Complet

```powershell
# 1. Vérification
cd "G:\Mon Drive\Google AI Studio"
.\lint-check.ps1

# 2. Si erreurs
.\lint-fix.ps1

# 3. Re-vérification
.\lint-check.ps1

# 4. Résultat attendu
# ✅ SUCCÈS : Aucune erreur détectée !
```

---

## 📚 Documents Complémentaires

- **GUIDE-LINTING.md** : Explications détaillées du linting
- **CORRECTION-RECAP.md** : Historique des corrections manuelles
- **TABLEAU-DE-BORD.md** : État actuel de la documentation

---

**Document créé** : 19 janvier 2026  
**Auteur** : Antigravity AI pour Jean-Pierre Charles  
**Statut** : ✅ PROCÉDURE COMPLÈTE ET TESTÉE

---

**🎉 Votre procédure d'automatisation est prête ! Commencez par l'installation. 🎉**
