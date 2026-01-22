# 🔧 Configuration pas-à-pas : Google Cloud Console

## 📍 But de ce guide

Ce guide vous montre les étapes **EXACTES** à suivre dans Google Cloud Console pour configurer correctement votre clé API Gemini pour jeanpierrecharles.com.

---

## ⚠️ Clarification importante

**L'avertissement OAuth que vous voyez n'est PAS nécessaire pour votre projet.**

Voici pourquoi :

- ✅ **Vous utilisez** : Clé API simple (Gemini_API_Key=Aegis)
- ❌ **OAuth est requis pour** : Accès aux données utilisateur Google (Gmail, Drive, etc.)
- 📝 **Votre usage** : Génération de contenu AI uniquement

**Vous pouvez ignorer cet avertissement en toute sécurité !**

---

## 📋 Étapes de configuration

### Étape 1 : Accéder à vos identifiants API

1. **Ouvrez Google Cloud Console** :
   - URL : <https://console.cloud.google.com/apis/credentials>
   - Assurez-vous d'être dans le bon projet

2. **Naviguez vers** : API et services → Identifiants

3. **Cliquez sur votre clé API** : `Gemini_API_Key=Aegis`

---

### Étape 2 : Configurer les restrictions de la clé

#### A. Restrictions d'application (RECOMMANDÉ)

1. Dans la section **"Restriction de l'application"** :
   - Sélectionnez : ☑️ **Restrictions HTTP (sites web)**

2. Cliquez sur **"AJOUTER UN ÉLÉMENT"**

3. Ajoutez les domaines suivants (un par ligne) :

```text
localhost:5173
http://localhost:5173
https://jeanpierrecharles.com
https://*.jeanpierrecharles.com
https://*.vercel.app
```

1. Cliquez sur **"TERMINÉ"**

#### B. Restrictions d'API (OBLIGATOIRE)

1. Dans la section **"Restrictions d'API"** :
   - Sélectionnez : ☑️ **Restreindre la clé**

2. Cliquez sur **"Sélectionner des API"**

3. Recherchez et sélectionnez :
   - ✅ **Generative Language API**

4. Cliquez sur **"OK"**

5. **IMPORTANT** : Cliquez sur **"ENREGISTRER"** en bas de la page

---

### Étape 3 : Copier votre clé API

1. **Retournez à la liste des identifiants** :
   - URL : <https://console.cloud.google.com/apis/credentials>

2. **Cliquez sur l'icône "Copier"** à côté de `Gemini_API_Key=Aegis`

3. **La clé copiée ressemble à** :

   ```
   AIzaSyABC123def456GHI789jkl012MNO345pqr
   ```

4. **Gardez cette clé secrète !** Ne la partagez jamais publiquement.

---

### Étape 4 : Activer l'API Generative Language (si pas déjà fait)

1. **Naviguez vers** : API et services → Bibliothèque
   - URL : <https://console.cloud.google.com/apis/library>

2. **Recherchez** : "Generative Language API"

3. **Cliquez sur "Generative Language API"**

4. **Cliquez sur "ACTIVER"** (si pas déjà activé)

5. **Attendez** quelques secondes que l'API soit activée

---

### Étape 5 : Configurer dans votre projet local

1. **Ouvrez le fichier** : `c:\Projects\jeanpierrecharles\.env.local`

2. **Remplacez** :

   ```env
   VITE_GEMINI_API_KEY=PLACEHOLDER_API_KEY
   ```

3. **Par** (utilisez VOTRE clé copiée à l'étape 3) :

   ```env
   VITE_GEMINI_API_KEY=AIzaSyABC123def456GHI789jkl012MNO345pqr
   ```

4. **Enregistrez le fichier**

---

### Étape 6 : Configurer dans Vercel (Production)

1. **Accédez à votre projet Vercel** :
   - URL : <https://vercel.com>

2. **Sélectionnez votre projet** : `jeanpierrecharles-website`

3. **Naviguez vers** : Settings → Environment Variables

4. **Cliquez sur "Add New"**

5. **Remplissez** :
   - **Name** : `VITE_GEMINI_API_KEY`
   - **Value** : `AIzaSyABC123def456GHI789jkl012MNO345pqr` (votre clé)
   - **Environment** : ✅ Production, ✅ Preview, ✅ Development

6. **Cliquez sur "Save"**

7. **Redéployez** : Vercel redéploiera automatiquement

---

## ✅ Vérification de la configuration

### Test local

1. **Ouvrez un terminal PowerShell**

2. **Naviguez vers votre projet** :

   ```powershell
   cd C:\Projects\jeanpierrecharles
   ```

3. **Démarrez le serveur de développement** :

   ```powershell
   npm run dev
   ```

4. **Ouvrez votre navigateur** : <http://localhost:5173>

5. **Testez la fonctionnalité AI** sur votre site

### Erreurs possibles et solutions

#### ❌ "VITE_GEMINI_API_KEY environment variable not set"

- ✅ Vérifiez que `.env.local` existe avec la bonne variable
- ✅ Redémarrez le serveur (`Ctrl+C` puis `npm run dev`)

#### ❌ "API key not valid"

- ✅ Vérifiez que vous avez copié la clé complète
- ✅ Vérifiez qu'il n'y a pas d'espaces avant/après la clé
- ✅ Vérifiez que l'API "Generative Language API" est activée

#### ❌ "API key restrictions"

- ✅ Ajoutez `localhost:5173` dans les restrictions HTTP
- ✅ Vérifiez que "Generative Language API" est dans la liste des API autorisées

---

## 🔒 Sécurité : Bonnes pratiques

### ✅ À FAIRE

- Configurer les restrictions HTTP (domaines autorisés)
- Configurer les restrictions API (uniquement Generative Language API)
- Utiliser `.env.local` pour le développement local
- Ajouter `.env.local` dans `.gitignore` (déjà fait)
- Utiliser les variables d'environnement Vercel pour la production

### ❌ À NE JAMAIS FAIRE

- Commiter la clé dans Git
- Partager la clé publiquement
- Exposer la clé dans le code JavaScript
- Laisser la clé sans restrictions

---

## 🎯 Concernant l'écran de consentement OAuth

**Question** : Dois-je configurer l'écran de consentement OAuth ?

**Réponse** : **NON** ❌

**Explication** :

- L'écran de consentement OAuth est **uniquement nécessaire** pour les flux OAuth 2.0
- Votre projet utilise une **clé API simple**, pas OAuth 2.0
- L'avertissement dans Google Cloud Console est **générique** et s'affiche pour tous les projets
- Vous pouvez **ignorer cet avertissement en toute sécurité**

**Quand faut-il configurer un écran de consentement OAuth ?**

- Uniquement si vous utilisez des identifiants OAuth 2.0 (ID client OAuth)
- Par exemple : lire les emails Gmail d'un utilisateur, accéder à Google Drive, etc.
- Ce n'est **PAS votre cas** avec Gemini API

---

## 📚 Ressources utiles

- [Documentation Gemini API](https://ai.google.dev/docs)
- [Google Cloud - Bonnes pratiques pour les clés API](https://cloud.google.com/docs/authentication/api-keys)
- [Vite - Variables d'environnement](https://vitejs.dev/guide/env-and-mode.html)

---

**Date** : 17 janvier 2026  
**Projet** : jeanpierrecharles.com  
**Clé API** : Gemini_API_Key=Aegis
