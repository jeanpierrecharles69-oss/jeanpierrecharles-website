# ✅ CHECKLIST : Configuration complète jeanpierrecharles.com

## 🎯 Configuration actuelle - Gemini API (TERMINÉ ✅)

### Configuration de base

- [x] **Clé API créée** : `Gemini_API_Key=Aegis` dans Google Cloud Console
- [x] **Variable renommée** : `VITE_GEMINI_API_KEY` (convention Vite)
- [x] **Fichier mis à jour** : `services/geminiService.ts`
- [x] **Types TypeScript** : `vite-env.d.ts` créé
- [x] **Configuration Vite** : `vite.config.ts` simplifié

### Actions restantes (À FAIRE MAINTENANT)

- [ ] **Remplacer PLACEHOLDER dans `.env.local`**

  ```env
  VITE_GEMINI_API_KEY=AIzaSy...VOTRE_VRAIE_CLÉ
  ```

  📍 Copier la clé depuis : <https://console.cloud.google.com/apis/credentials>

- [ ] **Configurer restrictions de sécurité (Google Cloud Console)**
  - [ ] Ouvrir : <https://console.cloud.google.com/apis/credentials>
  - [ ] Cliquer sur : `Gemini_API_Key=Aegis`
  - [ ] Section "Restriction de l'application" :
    - [x] Sélectionner : ☑️ Restrictions HTTP (sites web)
    - [ ] Ajouter domaines :

      ```
      localhost:5173
      jeanpierrecharles.com
      *.jeanpierrecharles.com
      *.vercel.app
      ```

  - [ ] Section "Restrictions d'API" :
    - [x] Sélectionner : ☑️ Restreindre la clé
    - [ ] Cocher : ✅ Generative Language API
  - [ ] Cliquer : **ENREGISTRER**

- [ ] **Vérifier que l'API est activée**
  - [ ] Aller à : <https://console.cloud.google.com/apis/library>
  - [ ] Rechercher : "Generative Language API"
  - [ ] Statut : **ACTIVÉ** (ou cliquer ACTIVER)

### Tests locaux

- [ ] **Installer les dépendances**

  ```powershell
  cd C:\Projects\jeanpierrecharles
  npm install
  ```

- [ ] **Démarrer le serveur de développement**

  ```powershell
  npm run dev
  ```

- [ ] **Ouvrir le navigateur**
  - URL : <http://localhost:5173>
  - Vérifier que le site charge

- [ ] **Tester la fonctionnalité Gemini AI**
  - Tester une génération de contenu
  - Vérifier qu'il n'y a pas d'erreur dans la console

### Configuration Vercel (Production)

- [ ] **Aller sur Vercel**
  - URL : <https://vercel.com>
  - Projet : `jeanpierrecharles-website`

- [ ] **Ajouter la variable d'environnement**
  - Settings → Environment Variables → Add New
  - Nom : `VITE_GEMINI_API_KEY`
  - Value : `AIzaSy...VOTRE_VRAIE_CLÉ` (même que .env.local)
  - Environnements : ✅ Production ✅ Preview ✅ Development

- [ ] **Redéployer**
  - Vercel redéploie automatiquement
  - Ou : Deployments → Redeploy

- [ ] **Tester en production**
  - URL : <https://jeanpierrecharles.com>
  - Vérifier que Gemini fonctionne

---

## ⚠️ OAuth 2.0 - PAS NÉCESSAIRE MAINTENANT

### Avertissement dans Google Cloud Console

- [x] **Compris** : L'avertissement "Configurer l'écran de consentement OAuth" ne concerne PAS mon usage actuel
- [x] **Raison** : J'utilise une clé API simple, pas OAuth
- [x] **Action** : Ignorer l'avertissement en toute sécurité

### Quand activer OAuth 2.0 ?

**Activer OAuth SI vous voulez** :

- [ ] "Se connecter avec Google" (Social Login)
- [ ] Lire les emails Gmail des utilisateurs
- [ ] Accéder à Google Drive des utilisateurs
- [ ] Créer des événements dans Google Calendar

**Pour l'instant** : ❌ Pas nécessaire

---

## 🚀 PHASE 2 (Optionnel - Futur) : Social Login OAuth

### Quand commencer cette phase ?

- [ ] Vous avez du trafic sur le site
- [ ] Vous voulez augmenter les inscriptions Aegis
- [ ] Vous êtes prêt à investir 1 semaine de développement

### Actions Phase 2

#### Google Cloud Console

- [ ] **Créer un ID client OAuth 2.0**
  - [ ] Console : <https://console.cloud.google.com/apis/credentials>
  - [ ] Créer des identifiants → ID client OAuth 2.0
  - [ ] Type : Application Web
  - [ ] Nom : `jeanpierrecharles-oauth-client`
  - [ ] URI de redirection :

    ```
    http://localhost:5173/auth/callback
    https://jeanpierrecharles.com/auth/callback
    ```

- [ ] **Configurer l'écran de consentement OAuth**
  - [ ] Console : <https://console.cloud.google.com/apis/credentials/consent>
  - [ ] Type d'utilisateur : **Externe**
  - [ ] Nom de l'application : `JeanPierreCharles - Aegis Platform`
  - [ ] Email d'assistance : `support@jeanpierrecharles.com`
  - [ ] Domaines autorisés : `jeanpierrecharles.com`
  - [ ] Scopes :

    ```
    https://www.googleapis.com/auth/userinfo.email
    https://www.googleapis.com/auth/userinfo.profile
    openid
    ```

  - [ ] Utilisateurs de test : votre email

#### Pages légales (OBLIGATOIRE RGPD)

- [ ] **Créer page Politique de confidentialité**
  - [ ] Fichier : `public/privacy.html`
  - [ ] URL : <https://jeanpierrecharles.com/privacy>
  - [ ] Contenu : Template fourni dans `GUIDE-OAUTH-2.0-COMPLET.md`

- [ ] **Créer page Conditions d'utilisation**
  - [ ] Fichier : `public/terms.html`
  - [ ] URL : <https://jeanpierrecharles.com/terms>

- [ ] **Lier dans écran de consentement**
  - [ ] Politique de confidentialité : URL complète
  - [ ] Conditions d'utilisation : URL complète

#### Code React

- [ ] **Installer les dépendances**

  ```powershell
  npm install @react-oauth/google jwt-decode
  ```

- [ ] **Créer composant GoogleLogin**
  - [ ] Fichier : `components/GoogleLogin.tsx`
  - [ ] Code : Template fourni dans `GUIDE-OAUTH-2.0-COMPLET.md`

- [ ] **Configurer variable d'environnement**
  - [ ] `.env.local` :

    ```env
    VITE_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
    ```

- [ ] **Ajouter dans Vercel**
  - [ ] Variable : `VITE_GOOGLE_CLIENT_ID`

- [ ] **Intégrer dans l'interface Aegis**
  - [ ] Ajouter bouton "Se connecter avec Google"
  - [ ] Gérer le callback d'authentification
  - [ ] Sauvegarder l'utilisateur

#### Tests

- [ ] **Tester en local**
  - [ ] Connexion fonctionnelle
  - [ ] Données récupérées (nom, email, photo)
  - [ ] Pas d'erreur console

- [ ] **Tester en production**
  - [ ] Déployer sur Vercel
  - [ ] Tester avec utilisateurs de test
  - [ ] Vérifier le flux complet

- [ ] **Passer en mode Publication**
  - [ ] Google Cloud Console → Écran de consentement
  - [ ] Passer de "Test" à "En production"
  - [ ] Attendre validation Google (si nécessaire)

---

## 🏢 PHASE 3 (Optionnel - Long terme) : OAuth Complet

### Quand commencer cette phase ?

- [ ] Vous avez des utilisateurs payants Aegis
- [ ] Vous voulez des fonctionnalités premium
- [ ] Vous êtes prêt à investir 1 mois de développement

### Scopes supplémentaires à demander

- [ ] **Gmail API**
  - [ ] Scope : `https://www.googleapis.com/auth/gmail.readonly`
  - [ ] Fonctionnalité : Email Compliance Scanner

- [ ] **Google Drive API**
  - [ ] Scope : `https://www.googleapis.com/auth/drive.readonly`
  - [ ] Fonctionnalité : Document Auditor

- [ ] **Google Calendar API** (optionnel)
  - [ ] Scope : `https://www.googleapis.com/auth/calendar`
  - [ ] Fonctionnalité : Compliance Calendar

### Vérification Google (OBLIGATOIRE pour scopes sensibles)

- [ ] **Soumettre pour vérification**
  - [ ] Console OAuth : Demander vérification
  - [ ] Fournir vidéo de démonstration
  - [ ] Expliquer l'usage des scopes
  - [ ] Délai : 4-6 semaines

- [ ] **Audit de sécurité** (si requis)
  - [ ] Questionnaire de sécurité Google
  - [ ] Preuve de conformité RGPD
  - [ ] Politique de conservation des données

### Développement

- [ ] **Implémenter Gmail Service**
  - [ ] Code : Template dans `GUIDE-OAUTH-2.0-COMPLET.md`
  - [ ] Interface utilisateur
  - [ ] Rapports de conformité

- [ ] **Implémenter Drive Service**
  - [ ] Scan de documents
  - [ ] Analyse avec Gemini
  - [ ] Recommandations

- [ ] **Monétisation**
  - [ ] Plan gratuit : Social Login seulement
  - [ ] Plan Premium : Gmail + Drive
  - [ ] Intégration Stripe/PayPal

---

## 📊 Suivi de progression

### Aujourd'hui (30 min)

- [ ] Lire `RECAPITULATIF-OAUTH-ET-API-KEY.md`
- [ ] Remplacer PLACEHOLDER dans `.env.local`
- [ ] Tester localement

### Cette semaine

- [ ] Configurer restrictions clé API
- [ ] Déployer sur Vercel avec variable
- [ ] Tester en production

### Ce mois (si Phase 2)

- [ ] Décider : activer OAuth ou non ?
- [ ] Si oui : configurer écran de consentement
- [ ] Créer pages `/privacy` et `/terms`
- [ ] Implémenter Social Login

### Q2 2026 (si Phase 3)

- [ ] Demander scopes Gmail/Drive
- [ ] Implémenter fonctionnalités premium
- [ ] Monétiser

---

## 📚 Documentation de référence

### Créée pour vous

- ✅ `GUIDE-CONFIGURATION-GEMINI-API.md` - Configuration actuelle
- ✅ `GUIDE-GOOGLE-CLOUD-CONSOLE.md` - Google Cloud pas à pas
- ✅ `GUIDE-OAUTH-2.0-COMPLET.md` - OAuth 2.0 complet
- ✅ `RECAPITULATIF-OAUTH-ET-API-KEY.md` - Vue d'ensemble
- ✅ `.agent/workflows/start-dev-server.md` - Workflow serveur

### Ressources externes

- [Gemini API Docs](https://ai.google.dev/docs)
- [OAuth 2.0 Google](https://developers.google.com/identity/protocols/oauth2)
- [RGPD Article 13](https://gdpr-info.eu/art-13-gdpr/)
- [AI Act Transparence](https://artificialintelligenceact.eu/)

---

## 🎯 Statut actuel

**Date** : 17 janvier 2026

### ✅ Terminé

- Configuration technique Gemini API
- Documentation complète
- Templates de code
- Guides visuels

### ⏳ En cours

- [ ] Remplacement PLACEHOLDER_API_KEY
- [ ] Configuration restrictions de sécurité
- [ ] Tests locaux et production

### 📅 Planifié (optionnel)

- Phase 2 : Social Login OAuth (Mars-Avril 2026)
- Phase 3 : OAuth complet (Q2-Q3 2026)

---

## 💡 Points clés à retenir

### ✅ À FAIRE

1. Remplacer PLACEHOLDER dans `.env.local`
2. Configurer restrictions dans Google Cloud Console
3. Tester localement
4. Déployer sur Vercel

### ❌ À NE PAS FAIRE

1. Ne PAS configurer OAuth maintenant (pas nécessaire)
2. Ne PAS s'inquiéter de l'avertissement OAuth
3. Ne PAS compliquer inutilement

### 🎯 Focus

- Lancez vite avec Gemini API
- Testez votre produit Aegis
- Ajoutez OAuth plus tard si besoin

---

**Bon développement ! 🚀**
