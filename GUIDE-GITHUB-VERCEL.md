# 🚀 Guide GitHub & Vercel - Déploiement de votre site

**Pour** : Jean-Pierre Charles  
**Date** : 16 janvier 2026  
**Objectif** : Mettre en ligne `jeanpierrecharles.com` de manière professionnelle

---

## 📖 Comprendre les outils

### 🐙 GitHub - Qu'est-ce que c'est ?

**Analogie simple** : GitHub est comme **Google Drive pour le code**.

- 📦 **Stocke** votre code en ligne (sauvegarde sécurisée)
- 📜 **Historique complet** de toutes les modifications (comme un journal)
- 🔄 **Versioning** : Vous pouvez revenir à n'importe quelle version précédente
- 🌍 **Collaboration** : Partage avec d'autres développeurs si besoin
- 🆓 **Gratuit** pour les projets publics et privés

**Pourquoi c'est important ?**
- Sauvegarde automatique de votre travail
- Déploiement automatique sur Vercel
- Portfolio professionnel (les recruteurs regardent GitHub)

### ⚡ Vercel - Qu'est-ce que c'est ?

**Analogie simple** : Vercel est comme **un serveur automatique ultra-rapide**.

- 🌐 **Héberge** votre site web gratuitement
- ⚡ **CDN mondial** : Votre site est rapide partout dans le monde
- 🔒 **HTTPS automatique** : Sécurité incluse
- 🚀 **Déploiement auto** : Chaque fois que vous modifiez le code sur GitHub, le site se met à jour automatiquement
- 📊 **Analytics** : Statistiques de visiteurs

**Pourquoi c'est important ?**
- Gratuit et professionnel
- Zéro maintenance technique
- Performance optimale pour React/Vite

---

## 🎯 Étape 1 : Créer un compte GitHub

**Durée** : 5 minutes

### Actions à faire :

1. **Aller sur** : https://github.com

2. **Cliquer** sur **"Sign up"** (S'inscrire)

3. **Remplir le formulaire** :
   - Email : `contact@jeanpierrecharles.com` (ou votre email personnel)
   - Nom d'utilisateur : `jeanpierrecharles` (ou `jpc69` ou ce que vous voulez)
   - Mot de passe : Choisir un mot de passe fort

4. **Vérifier l'email** que GitHub vous envoie

5. **Choisir le plan gratuit** (Free)

6. **Personnaliser** (optionnel) :
   - Photo de profil
   - Bio : "Industrial Engineer | Industry 5.0 | AI Compliance Expert"

✅ **Résultat** : Vous avez maintenant un compte GitHub !

**Votre profil sera** : `https://github.com/jeanpierrecharles` (ou votre username)

---

## 🎯 Étape 2 : Installer Git sur Windows

**Durée** : 5 minutes

### Pourquoi Git ?

Git est le logiciel qui permet de synchroniser votre code local (sur votre PC) avec GitHub (en ligne).

### Installation :

1. **Télécharger Git** : https://git-scm.com/download/win

2. **Lancer l'installateur** :
   - Laisser toutes les options par défaut
   - Cliquer "Next" jusqu'à "Install"
   - Attendre l'installation (~2 minutes)

3. **Vérifier l'installation** :
   - Ouvrir PowerShell
   - Taper : `git --version`
   - Résultat attendu : `git version 2.47.x` (ou supérieur)

4. **Configuration initiale** (une seule fois) :
   ```powershell
   git config --global user.name "Jean-Pierre Charles"
   git config --global user.email "contact@jeanpierrecharles.com"
   ```

✅ **Résultat** : Git est installé et configuré !

---

## 🎯 Étape 3 : Créer un dépôt GitHub pour votre projet

**Durée** : 3 minutes

### Option A : Via l'interface GitHub (Recommandé pour débutants)

1. **Aller sur GitHub** : https://github.com

2. **Cliquer** sur le bouton **"New"** (ou icône +) → **"New repository"**

3. **Remplir** :
   - Repository name : `jeanpierrecharles-website`
   - Description : `Portfolio professionnel et plateforme Aegis de conformité industrielle européenne`
   - Visibilité : **Public** (pour que Vercel gratuit fonctionne)
   - ✅ Cocher **"Add a README file"**
   - ✅ Cocher **"Add .gitignore"** → Template : **Node**

4. **Cliquer** : **"Create repository"**

✅ **Résultat** : Votre dépôt est créé !

URL : `https://github.com/jeanpierrecharles/jeanpierrecharles-website`

---

## 🎯 Étape 4 : Connecter votre projet local à GitHub

**Durée** : 5 minutes

### Dans PowerShell :

1. **Naviguer** vers votre projet :
   ```powershell
   cd C:\Projects\jeanpierrecharles
   ```

2. **Initialiser Git** (si pas déjà fait) :
   ```powershell
   git init
   ```

3. **Ajouter tous les fichiers** :
   ```powershell
   git add .
   ```

4. **Premier commit** (sauvegarde) :
   ```powershell
   git commit -m "Initial commit - Portfolio JPC + Aegis Platform"
   ```

5. **Connecter au dépôt GitHub** :
   ```powershell
   git remote add origin https://github.com/VOTRE_USERNAME/jeanpierrecharles-website.git
   ```
   ⚠️ Remplacez `VOTRE_USERNAME` par votre username GitHub

6. **Envoyer le code sur GitHub** :
   ```powershell
   git push -u origin main
   ```
   
   💡 GitHub vous demandera peut-être vos identifiants :
   - Username : Votre username GitHub
   - Password : Utilisez un **Personal Access Token** (voir section dépannage si besoin)

✅ **Résultat** : Votre code est maintenant sur GitHub !

Vérifiez en allant sur : `https://github.com/VOTRE_USERNAME/jeanpierrecharles-website`

---

## 🎯 Étape 5 : Créer un compte Vercel

**Durée** : 3 minutes

### Actions :

1. **Aller sur** : https://vercel.com

2. **Cliquer** : **"Sign Up"**

3. **Choisir** : **"Continue with GitHub"** (Continuer avec GitHub)

4. **Autoriser Vercel** à accéder à votre GitHub (cliquer "Authorize")

5. **Remplir les infos** :
   - Nom : Jean-Pierre Charles
   - Utilisation : Personal / Hobby

✅ **Résultat** : Compte Vercel créé et connecté à GitHub !

---

## 🎯 Étape 6 : Déployer votre site sur Vercel

**Durée** : 5 minutes

### Actions :

1. **Dans Vercel**, cliquer : **"Add New..."** → **"Project"**

2. **Importer** votre dépôt GitHub :
   - Chercher `jeanpierrecharles-website`
   - Cliquer **"Import"**

3. **Configuration du projet** :
   - **Framework Preset** : Vercel détecte automatiquement **Vite** ✅
   - **Root Directory** : `./` (laisser par défaut)
   - **Build Command** : `npm run build` (auto-détecté)
   - **Output Directory** : `dist` (auto-détecté)

4. **Variables d'environnement** :
   - Cliquer **"Add Environment Variable"**
   - Name : `GEMINI_API_KEY`
   - Value : Coller votre clé API Gemini (depuis `.env.local`)

5. **Cliquer** : **"Deploy"** 🚀

⏱️ **Attendre** : 1-2 minutes (première fois)

✅ **Résultat** : Site déployé !

Vercel vous donne une URL : `https://jeanpierrecharles-website.vercel.app`

---

## 🎯 Étape 7 : Connecter votre domaine Gandi

**Durée** : 10 minutes (+ propagation DNS 5-30 min)

### Partie A : Configuration Vercel

1. **Dans votre projet Vercel**, aller dans **"Settings"** → **"Domains"**

2. **Ajouter votre domaine** :
   - Taper : `jeanpierrecharles.com`
   - Cliquer **"Add"**

3. **Vercel affiche les enregistrements DNS à configurer** :
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### Partie B : Configuration Gandi

1. **Aller sur** : https://admin.gandi.net

2. **Se connecter** à votre compte Gandi

3. **Aller dans** : "Domaines" → `jeanpierrecharles.com` → **"Enregistrements DNS"**

4. **Modifier/Ajouter** les enregistrements suivants :

   **Pour l'apex (jeanpierrecharles.com)** :
   - Type : **A**
   - Nom : **@**
   - Valeur : **76.76.21.21**
   - TTL : **10800** (ou laisser par défaut)

   **Pour www** :
   - Type : **CNAME**
   - Nom : **www**
   - Valeur : **cname.vercel-dns.com**
   - TTL : **10800**

5. **Sauvegarder** les modifications

6. **Attendre** : 5 à 30 minutes (propagation DNS)

### Vérification :

1. **Dans Vercel**, vérifier que le domaine affiche **"Valid Configuration"** ✅

2. **Tester** dans votre navigateur :
   - `https://jeanpierrecharles.com` → Doit afficher votre site ✅
   - `https://www.jeanpierrecharles.com` → Doit rediriger vers apex ✅

✅ **Résultat** : Votre site est en ligne sur votre domaine !

---

## 🔄 Workflow quotidien - Comment mettre à jour le site

**C'est très simple !**

### Chaque fois que vous modifiez le code :

1. **Sauvegarder** les fichiers dans VS Code (ou votre éditeur)

2. **Dans PowerShell** :
   ```powershell
   cd C:\Projects\jeanpierrecharles
   
   # Ajouter les modifications
   git add .
   
   # Créer un commit avec message descriptif
   git commit -m "Description de la modification (ex: Ajout timeline parcours professionnel)"
   
   # Envoyer sur GitHub
   git push
   ```

3. **Vercel détecte automatiquement** et redéploie (1-2 minutes)

4. **Site mis à jour** automatiquement ! ✅

**Aucune autre action nécessaire** !

---

## 🛠️ Dépannage

### Problème : Git demande un mot de passe mais refuse mon mot de passe GitHub

**Solution** : GitHub n'accepte plus les mots de passe classiques. Il faut un **Personal Access Token**.

**Créer un token** :

1. Aller sur GitHub → **Settings** (icône profil en haut à droite)
2. **Developer settings** (tout en bas)
3. **Personal access tokens** → **Tokens (classic)**
4. **Generate new token** → **Generate new token (classic)**
5. Note : `Vercel Deploy Token`
6. Expiration : **90 days** (ou plus)
7. Scopes : Cocher **repo** (toutes les sous-cases)
8. **Generate token**
9. **Copier le token** (vous ne le verrez plus jamais !)
10. **Utiliser ce token** comme mot de passe dans Git

**Alternative simple** : Utiliser **GitHub Desktop** (interface graphique)
- Télécharger : https://desktop.github.com/
- Se connecter avec votre compte GitHub
- Cloner le dépôt
- Faire les commits et push avec l'interface visuelle

---

### Problème : Le site ne se met pas à jour après `git push`

**Vérifications** :

1. **Vérifier que le push a réussi** :
   - Aller sur GitHub
   - Voir si les dernières modifications sont visibles

2. **Vérifier Vercel** :
   - Aller sur Vercel Dashboard
   - Voir l'onglet "Deployments"
   - Vérifier qu'un nouveau déploiement est en cours ou terminé

3. **Vider le cache du navigateur** :
   - Ctrl + Shift + Suppr
   - Ou tester en navigation privée

---

### Problème : Erreur lors du build Vercel

**Voir les logs** :
1. Aller sur Vercel Dashboard
2. Cliquer sur le déploiement qui a échoué
3. Lire les logs d'erreur

**Causes fréquentes** :
- Variable d'environnement `GEMINI_API_KEY` manquante
- Erreur de syntaxe dans le code
- Dépendance manquante dans `package.json`

**Solution** :
- Corriger localement
- Tester avec `npm run build` en local
- Si ça marche en local, push sur GitHub

---

## 📊 Commandes Git essentielles à connaître

```powershell
# Voir l'état des fichiers modifiés
git status

# Voir l'historique des commits
git log

# Voir les différences avant de commit
git diff

# Annuler les modifications d'un fichier
git checkout -- nom_du_fichier

# Créer une nouvelle branche (pour tester sans risque)
git checkout -b nom-branche

# Revenir à la branche principale
git checkout main

# Voir toutes les branches
git branch -a
```

---

## 🎓 Ressources pour apprendre

### Git & GitHub :
- 📘 **GitHub Skills** (interactif) : https://skills.github.com/
- 📺 **Git et GitHub pour les débutants** (YouTube en français)
- 📖 **Git - La doc officielle** : https://git-scm.com/book/fr/v2

### Vercel :
- 📘 **Vercel Docs** : https://vercel.com/docs
- 📺 **Vercel YouTube Channel**

---

## ✅ Checklist de validation

Après avoir tout configuré, vérifier :

- [ ] Compte GitHub créé
- [ ] Git installé et configuré sur PC
- [ ] Dépôt GitHub créé
- [ ] Code local pushé sur GitHub
- [ ] Compte Vercel créé et connecté à GitHub
- [ ] Premier déploiement Vercel réussi
- [ ] URL Vercel accessible : `https://jeanpierrecharles-website.vercel.app`
- [ ] DNS Gandi configuré
- [ ] Site accessible sur `https://jeanpierrecharles.com`
- [ ] Email `contact@jeanpierrecharles.com` fonctionne toujours
- [ ] Test sur mobile : OK
- [ ] HTTPS automatique : OK

---

## 🎯 Prochaines étapes

Une fois le déploiement réussi :

1. **Analytics** : Activer Vercel Analytics pour suivre les visiteurs
2. **Custom 404** : Créer une page 404 personnalisée
3. **Amélioration SEO** : Meta tags, sitemap.xml
4. **PWA** : Transformer en Progressive Web App
5. **Blog** : Ajouter un blog technique (sur Gandi ou via Hashnode)

---

**Document maintenu par** : Antigravity AI Assistant  
**Pour** : Jean-Pierre Charles  
**Dernière mise à jour** : 16 janvier 2026
