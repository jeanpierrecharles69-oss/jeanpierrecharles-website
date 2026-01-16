# 📚 Guide de Configuration et Démarrage - JeanPierreCharles.com

**Date de création** : 16 janvier 2026  
**Version** : 1.0  
**Projet** : Portfolio professionnel Jean-Pierre Charles + Aegis AI Compliance Platform

---

## 📋 Table des matières

1. [Configuration initiale Windows](#1-configuration-initiale-windows)
2. [Installation du projet](#2-installation-du-projet)
3. [Démarrage quotidien](#3-démarrage-quotidien)
4. [Dépannage](#4-dépannage)
5. [Bonnes pratiques](#5-bonnes-pratiques)

---

## 1. Configuration initiale Windows

### 1.1 Prérequis système

- ✅ **Node.js** version 18 ou supérieure
  - Télécharger depuis : https://nodejs.org/
  - Vérifier l'installation : `node --version`

- ✅ **Git** (REQUIS pour déploiement Vercel)
  - Télécharger depuis : https://git-scm.com/
  - Voir `GUIDE-GITHUB-VERCEL.md` pour configuration complète

### 1.2 Configuration PowerShell (Une seule fois)

⚠️ **Important** : Cette étape doit être effectuée UNE SEULE FOIS sur votre machine.

**Problème rencontré** : "l'exécution de scripts est désactivée sur ce système"

**Solution permanente** :

1. Ouvrir PowerShell (pas besoin d'être administrateur)
2. Exécuter la commande suivante :
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
   ```
3. Vérifier que la configuration est appliquée :
   ```powershell
   Get-ExecutionPolicy -Scope CurrentUser
   ```
   Résultat attendu : `RemoteSigned`

**Qu'est-ce que cela fait ?**
- Permet l'exécution de scripts PowerShell locaux (comme `npm`)
- S'applique uniquement à votre compte utilisateur
- Exige que les scripts téléchargés soient signés (sécurité)

---

## 2. Installation du projet

### 2.1 Première installation

1. **Naviguer vers le dossier du projet** :
   ```powershell
   cd C:\Projects\jeanpierrecharles
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```
   ⏱️ Durée estimée : 1-3 minutes

3. **Configurer la clé API Gemini** :
   - Ouvrir ou créer le fichier `.env.local` à la racine du projet
   - Ajouter votre clé API :
     ```
     GEMINI_API_KEY=votre_clé_api_gemini
     ```
   - Obtenir une clé : https://ai.google.dev/

---

## 3. Démarrage quotidien

### 🚀 Méthode A : Script automatique (RECOMMANDÉ)

1. Double-cliquer sur **`start-dev.bat`** dans le dossier racine
2. Une fenêtre de terminal s'ouvre et lance automatiquement le serveur
3. Attendre le message "ready in XXX ms"
4. Ouvrir votre navigateur sur l'URL affichée (généralement `http://localhost:3000`)

**Avantages** :
- ✅ Vérifie automatiquement les prérequis
- ✅ Installe les dépendances manquantes
- ✅ Affiche des messages d'erreur clairs
- ✅ Ne nécessite aucune commande manuelle

### 📋 Méthode B : Ligne de commande

1. Ouvrir PowerShell ou Terminal
2. Naviguer vers le projet :
   ```bash
   cd C:\Projects\jeanpierrecharles
   ```
3. Lancer le serveur :
   ```bash
   npm run dev
   ```
4. Ouvrir le navigateur sur `http://localhost:3000`

### ⏹️ Arrêter le serveur

Dans le terminal où le serveur tourne :
- Appuyer sur **`Ctrl + C`**
- Si demandé, confirmer avec **`O`** (Oui) ou **`Y`** (Yes)

---

## 4. Dépannage

### 🔴 Problème 1 : ERR_CONNECTION_REFUSED

**Symptôme** : Le navigateur affiche "Ce site est inaccessible - localhost n'autorise pas la connexion"

**Cause** : Le serveur de développement n'est pas en cours d'exécution

**Solution** :
1. Vérifier qu'aucun serveur n'est lancé dans un terminal
2. Lancer le serveur avec `start-dev.bat` ou `npm run dev`
3. Attendre le message "ready in XXX ms" avant d'ouvrir le navigateur

---

### 🔴 Problème 2 : "l'exécution de scripts est désactivée"

**Symptôme** :
```
npm : Impossible de charger le fichier C:\Program Files\nodejs\npm.ps1,
car l'exécution de scripts est désactivée sur ce système.
```

**Solution permanente** (voir section 1.2) :
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

**Solution temporaire** (si vous ne pouvez pas modifier la politique) :
```bash
node node_modules/vite/bin/vite.js
```

---

### 🔴 Problème 3 : Port 3000 déjà utilisé

**Symptôme** : "Port 3000 is in use, trying another one..."

**Comportement** : Vite utilise automatiquement un autre port (3001, 3002, etc.)

**Action** : Simplement utiliser le nouveau port affiché dans le terminal

**Pour libérer le port 3000** (optionnel) :
1. Trouver le processus :
   ```powershell
   netstat -ano | findstr :3000
   ```
2. Noter le PID (dernier nombre)
3. Terminer le processus :
   ```powershell
   taskkill /PID <numéro_du_PID> /F
   ```

---

### 🔴 Problème 4 : Erreurs de dépendances

**Symptôme** : Erreurs lors de `npm install` ou au démarrage

**Solution** : Réinstallation complète
```bash
# Supprimer le dossier node_modules et le cache
rmdir /s /q node_modules
del package-lock.json

# Réinstaller
npm install
```

---

### 🔴 Problème 5 : Clé API Gemini manquante

**Symptôme** : L'assistant IA ne fonctionne pas

**Solution** :
1. Créer/modifier `.env.local` à la racine du projet
2. Ajouter : `GEMINI_API_KEY=votre_clé`
3. Obtenir une clé sur : https://ai.google.dev/
4. Redémarrer le serveur (Ctrl+C puis relancer)

---

## 5. Bonnes pratiques

### ✅ Développement quotidien

1. **Toujours utiliser `npm run dev`** pour le développement (pas `npm run build`)
2. **Vérifier la console du navigateur** pour les erreurs JavaScript
3. **Vérifier le terminal** pour les erreurs du serveur
4. **Arrêter proprement le serveur** avec Ctrl+C avant de fermer le terminal

### ✅ Gestion des versions (GitHub)

1. **Avant de modifier du code** :
   ```bash
   git status           # Vérifier l'état actuel
   git pull             # Récupérer les dernières modifications
   ```

2. **Après avoir modifié du code** :
   ```bash
   git add .
   git commit -m "Description des modifications"
   git push
   ```
   
💡 **Note** : Chaque `git push` déclenche un redéploiement automatique sur Vercel !

### ✅ Performance

1. **Redémarrer le serveur** si vous rencontrez des comportements étranges
2. **V ider le cache du navigateur** (Ctrl + Shift + Suppr) si les changements n'apparaissent pas
3. **Fermer les applications inutiles** pour libérer de la mémoire

### ✅ Sécurité

1. **Ne jamais committer `.env.local`** dans Git (déjà dans `.gitignore`)
2. **Ne jamais partager votre clé API Gemini** publiquement
3. **Mettre à jour régulièrement les dépendances** : `npm update`

---

## 📞 Support

### Commandes utiles

```bash
# Vérifier la version de Node.js
node --version

# Vérifier la version de npm
npm --version

# Vérifier les processus Node.js en cours
Get-Process node

# Nettoyer le cache npm
npm cache clean --force

# Voir l'aide de Vite
npx vite --help

# Vérifier l'état Git
git status

# Voir l'historique des commits
git log --oneline
```

### Ressources

- **Documentation Vite** : https://vitejs.dev/
- **Documentation React** : https://react.dev/
- **Documentation Gemini API** : https://ai.google.dev/docs
- **Documentation Vercel** : https://vercel.com/docs
- **Documentation Git** : https://git-scm.com/book/fr/v2
- **AI Studio (source du projet)** : https://ai.studio/apps/drive/1lzt9_dwB2FwEJza_oXv_GEztDkthOoEH

---

## 📝 Guides complémentaires

- 🚀 **[QUICK-START.md](QUICK-START.md)** - Démarrage rapide en 30 secondes
- 🌐 **[GUIDE-GITHUB-VERCEL.md](GUIDE-GITHUB-VERCEL.md)** - Configuration GitHub et déploiement Vercel
- 📱 **[ACCES-MOBILE.md](ACCES-MOBILE.md)** - Accès depuis smartphone/tablette
- 🔧 **[.agent/workflows/start-dev-server.md](.agent/workflows/start-dev-server.md)** - Workflow détaillé

---

## 📝 Historique des modifications

| Date | Version | Modifications |
|------|---------|---------------|
| 2026-01-16 | 1.0 | Création du document - Configuration complete pour jeanpierrecharles.com |

---

**Document maintenu par** : Jean-Pierre Charles avec Antigravity AI  
**Dernière révision** : 16 janvier 2026
