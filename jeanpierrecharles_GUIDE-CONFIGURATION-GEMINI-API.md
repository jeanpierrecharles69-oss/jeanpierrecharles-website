# 🔐 Guide de Configuration Gemini API pour jeanpierrecharles.com

## 📌 Vue d'ensemble

Ce guide explique comment configurer correctement votre clé API Gemini pour le site jeanpierrecharles.com, ainsi que la différence entre les clés API et OAuth 2.0.

---

## 🎯 Votre situation actuelle

- **Projet** : jeanpierrecharles.com
- **Clé API** : `Gemini_API_Key=Aegis` (créée le 14 janvier 2026)
- **Type d'authentification** : Clé API simple
- **Avertissement OAuth** : ⚠️ Peut être ignoré (ne concerne pas les clés API)

---

## 🔍 Clé API vs OAuth 2.0

### Clé API (ce que vous utilisez actuellement) ✅

- **Usage** : Accès direct à l'API Gemini depuis votre application
- **Authentication** : Via la clé API dans les variables d'environnement
- **Consentement utilisateur** : Non nécessaire
- **Cas d'usage** : Génération de contenu, chat AI, analyse de texte

### OAuth 2.0 (non nécessaire pour votre projet) ❌

- **Usage** : Accès aux données Google des utilisateurs (Gmail, Drive, Calendar, etc.)
- **Authentication** : Flux OAuth avec consentement de l'utilisateur
- **Consentement utilisateur** : Obligatoire
- **Cas d'usage** : Lire les emails Gmail d'un utilisateur, accéder à ses fichiers Drive

---

## ⚙️ Configuration de votre clé API Gemini

### Étape 1 : Sécuriser votre clé API dans Google Cloud Console

1. **Accédez à Google Cloud Console** :
   - <https://console.cloud.google.com/apis/credentials>

2. **Cliquez sur votre clé API** : `Gemini_API_Key=Aegis`

3. **Configurez les restrictions** :

   #### A. Restrictions d'application (recommandé)

   ```
   ☑️ Restrictions HTTP (sites web)
   
   Domaines autorisés :
   - localhost:5173 (développement local)
   - jeanpierrecharles.com
   - *.jeanpierrecharles.com
   - *.vercel.app (si déployé sur Vercel)
   ```

   #### B. Restrictions d'API (obligatoire)

   ```
   ☑️ Restreindre la clé
   
   API autorisées :
   - Generative Language API
   ```

4. **Enregistrez les modifications**

---

### Étape 2 : Configurer les variables d'environnement

#### Pour le développement local

Votre fichier `.env.local` actuel :

```env
GEMINI_API_KEY=PLACEHOLDER_API_KEY
```

**Action requise** : Remplacez `PLACEHOLDER_API_KEY` par votre vraie clé API depuis Google Cloud Console.

```env
GEMINI_API_KEY=AIzaSy...votre_vraie_clé
```

⚠️ **Ne jamais commiter ce fichier dans Git** ! (déjà dans `.gitignore`)

---

#### Pour la production (Vercel)

1. **Accédez à votre projet Vercel** :
   - <https://vercel.com/jeanpierrecharles/jeanpierrecharles-website/settings/environment-variables>

2. **Ajoutez la variable d'environnement** :

   ```
   Nom  : GEMINI_API_KEY
   Value: AIzaSy...votre_vraie_clé
   ```

3. **Redéployez** : Vercel redéploiera automatiquement avec la nouvelle variable

---

## 🛠️ Correction du code (problème détecté)

Votre fichier `services/geminiService.ts` cherche `process.env.API_KEY` mais votre variable est `GEMINI_API_KEY`. Cela doit être corrigé.

### Fichier actuel (ligne 5)

```typescript
const apiKey = process.env.API_KEY;
```

### Devrait être

```typescript
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
```

**Note** : Avec Vite, les variables d'environnement doivent être préfixées par `VITE_` pour être accessibles côté client.

---

## 📝 Actions à réaliser

### ✅ Checklist de configuration

- [ ] 1. **Google Cloud Console** : Configurer les restrictions de la clé API
  - [ ] Restrictions HTTP (domaines autorisés)
  - [ ] Restrictions API (Generative Language API uniquement)

- [ ] 2. **Variables d'environnement** :
  - [ ] Renommer `GEMINI_API_KEY` en `VITE_GEMINI_API_KEY` dans `.env.local`
  - [ ] Ajouter la vraie clé API (remplacer `PLACEHOLDER_API_KEY`)
  - [ ] Configurer `VITE_GEMINI_API_KEY` dans Vercel

- [ ] 3. **Code** :
  - [ ] Corriger `services/geminiService.ts` pour utiliser `import.meta.env.VITE_GEMINI_API_KEY`
  - [ ] Tester localement
  - [ ] Redéployer sur Vercel

---

## 🔒 Bonnes pratiques de sécurité

### ✅ À FAIRE

- Utiliser des restrictions d'application (HTTP referrers)
- Utiliser des restrictions d'API
- Ne jamais exposer la clé dans le code source
- Utiliser `.env.local` pour le développement
- Utiliser les variables d'environnement Vercel pour la production
- Régénérer la clé si elle est compromise

### ❌ À NE PAS FAIRE

- Commiter la clé dans Git
- Partager la clé publiquement
- Utiliser la même clé pour dev et prod
- Laisser la clé sans restrictions

---

## 🧪 Test de la configuration

Une fois configuré, testez avec :

```bash
# Démarrer le serveur de développement
npm run dev
```

Puis testez la fonctionnalité AI sur votre site local (<http://localhost:5173>).

---

## 🆘 Dépannage

### Erreur : "API_KEY environment variable not set"

- ✅ Vérifiez que `.env.local` contient `VITE_GEMINI_API_KEY=...`
- ✅ Redémarrez le serveur de développement (`npm run dev`)

### Erreur : "API key not valid"

- ✅ Vérifiez que la clé est correcte dans Google Cloud Console
- ✅ Vérifiez que l'API "Generative Language API" est activée
- ✅ Vérifiez les restrictions de domaine

### Erreur : "API key restrictions"

- ✅ Ajoutez `localhost:5173` dans les restrictions HTTP
- ✅ Assurez-vous que "Generative Language API" est dans la liste des API autorisées

---

## 📚 Ressources

- [Documentation Gemini API](https://ai.google.dev/docs)
- [Google Cloud API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

**Date de création** : 17 janvier 2026  
**Dernière mise à jour** : 17 janvier 2026  
**Auteur** : Jean-Pierre Charles
