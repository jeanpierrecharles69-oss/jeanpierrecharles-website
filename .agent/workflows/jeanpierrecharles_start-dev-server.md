---
description: Démarrer le serveur de développement JeanPierreCharles.com
---

# Workflow : Démarrer le serveur de développement

Ce workflow décrit comment démarrer le serveur de développement pour le site JeanPierreCharles.com (Portfolio + Aegis AI Compliance Platform).

## Méthode automatisée (Recommandée)

1. **Double-cliquer sur `start-dev.bat`**
   - Emplacement : racine du projet
   - Le script vérifie automatiquement les prérequis et lance le serveur

## Méthode manuelle

### Étape 1 : Vérifier Node.js

```bash
node --version
```

Attendu : Version 18.x ou supérieure

### Étape 2 : Installer les dépendances (si nécessaire)

// turbo

```bash
npm install
```

### Étape 3 : Configurer l'environnement

Vérifier que le fichier `.env.local` existe avec :

```
VITE_GEMINI_API_KEY=votre_clé_api_ici
```

### Étape 4 : Lancer le serveur

// turbo

```bash
npm run dev
```

### Étape 5 : Accéder à l'application

Ouvrir le navigateur sur `http://localhost:3000` (ou le port indiqué dans le terminal)

**Modes disponibles** :

- **Mode Website** : Portfolio professionnel Jean-Pierre Charles (page d'accueil)
- **Mode App** : Plateforme Aegis AI Compliance (accessible via bouton "Aegis Platform")

## Dépannage

### Problème : "l'exécution de scripts est désactivée"

**Solution permanente :**

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

**Solution temporaire :**

```bash
node node_modules/vite/bin/vite.js
```

### Problème : Port déjà utilisé

Vite va automatiquement utiliser un autre port (3001, 3002, etc.).
Vous pouvez aussi arrêter le processus qui utilise le port 3000 :

```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Problème : Erreur de dépendances

Supprimer `node_modules` et réinstaller :

```bash
rmdir /s /q node_modules
npm install
```

## Arrêter le serveur

Dans le terminal où le serveur tourne :

- Appuyer sur `Ctrl + C`
- Confirmer avec `O` (Oui) si demandé

## Déploiement

Pour déployer sur jeanpierrecharles.com (Vercel) :

1. **Commit et push** :

   ```bash
   git add .
   git commit -m "Description des modifications"
   git push
   ```

2. **Vercel déploie automatiquement** en 1-2 minutes

3. **Vérifier** sur <https://jeanpierrecharles.com>

Voir `GUIDE-GITHUB-VERCEL.md` pour configuration initiale.
