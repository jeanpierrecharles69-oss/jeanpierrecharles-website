<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# JeanPierreCharles.com

**Portfolio professionnel** + **Aegis - AI Compliance Platform**

Dual-mode application React/TypeScript :
- 🌐 **Mode Website** : Portfolio professionnel Jean-Pierre Charles (Expert Industrie 5.0)
- 🛡️ **Mode App** : Plateforme Aegis de conformité AI européenne (AI Act, RGPD, Machinery, CRA, ESPR)

**En production** : [https://jeanpierrecharles.com](https://jeanpierrecharles.com)  
**AI Studio** : [View app](https://ai.studio/apps/drive/1lzt9_dwB2FwEJza_oXv_GEztDkthOoEH)

---

## 📚 Documentation complète

- **🚀 [QUICK-START.md](QUICK-START.md)** - Démarrage en 30 secondes
- **📖 [GUIDE-DEMARRAGE.md](GUIDE-DEMARRAGE.md)** - Configuration complète Windows, dépannage, bonnes pratiques
- **🌐 [GUIDE-GITHUB-VERCEL.md](GUIDE-GITHUB-VERCEL.md)** - Déploiement sur jeanpierrecharles.com via Vercel
- **📱 [ACCES-MOBILE.md](ACCES-MOBILE.md)** - Tester sur smartphone/tablette
- **🔧 [Workflow: Start Dev Server](.agent/workflows/start-dev-server.md)** - Procédure détaillée

---

## 🚀 Démarrage rapide

### Option 1 : Automatique (Recommandé)
```
Double-cliquer sur start-dev.bat
```

### Option 2 : Manuelle
```bash
npm install
npm run dev
```

### Option 3 : Accès mobile
Utilisez l'URL "Network" affichée dans le terminal (ex: `http://192.168.x.x:3000/`)

---

## ⚙️ Configuration

### Prérequis
- **Node.js** 18+ ([télécharger](https://nodejs.org/))
- **Git** ([télécharger](https://git-scm.com/)) - requis pour déploiement Vercel

### Variables d'environnement
Créer `.env.local` à la racine :
```
GEMINI_API_KEY=votre_clé_api_gemini
```
Obtenir une clé : [https://ai.google.dev/](https://ai.google.dev/)

### Configuration PowerShell (Windows - une seule fois)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

---

## 🏗️ Architecture du projet

```
jeanpierrecharles/
├── components/
│   ├── JpcWebsite.tsx          # Portfolio Jean-Pierre Charles
│   ├── Dashboard.tsx            # Aegis Dashboard
│   ├── AiAssistant.tsx          # Aegis AI Assistant
│   ├── CompliancePassportView.tsx  # Digital Passport
│   └── ...
├── services/
│   └── geminiService.ts         # Gemini API integration
├── translations.ts              # FR/EN multilingual
├── constants.tsx                # Compliance modules config
├── .agent/workflows/            # Workflows automatisés
├── GUIDE-*.md                   # Documentation complète
└── start-dev.bat               # Script de démarrage automatique
```

---

## 🌐 Déploiement

Le site est déployé sur **Vercel** avec domaine **jeanpierrecharles.com** (Gandi).

### Mise à jour automatique
```bash
git add .
git commit -m "Description des modifications"
git push
```
➡️ **Vercel redéploie automatiquement** en 1-2 minutes !

Voir [GUIDE-GITHUB-VERCEL.md](GUIDE-GITHUB-VERCEL.md) pour configuration initiale.

---

## 🎨 Fonctionnalités

### Mode Website (Portfolio)
- ✨ Design moderne et professionnel
- 🌍 Multilingue (FR/EN)
- 📱 Responsive mobile-first
- 💼 Expertise Industrie 5.0
- 📞 Contact direct

### Mode App (Aegis Platform)
- 🤖 AI Assistant spécialisé conformité EU
- 📊 Dashboard de conformité
- 🛡️ Modules réglementaires (AI Act, RGPD, Machinery, CRA, ESPR)
- 📄 Digital Compliance Passport
- 🌍 Sources officielles EUR-Lex

---

## 📝 Scripts disponibles

```bash
npm run dev      # Serveur de développement (port 3000)
npm run build    # Build production
npm run preview  # Preview du build local
```

---

## 🔧 Dépannage

### Problème : ERR_CONNECTION_REFUSED
➡️ Le serveur n'est pas lancé. Exécuter `npm run dev` ou `start-dev.bat`

### Problème : "l'exécution de scripts est désactivée"
➡️ Voir section Configuration PowerShell ci-dessus

### Problème : Port 3000 déjà utilisé
➡️ Vite utilise automatiquement un autre port (3001, 3002...)

**Documentation complète** : [GUIDE-DEMARRAGE.md](GUIDE-DEMARRAGE.md)

---

## 📊 Stack technique

- **Frontend** : React 19.2 + TypeScript
- **Build** : Vite 6.2
- **Styling** : TailwindCSS (CDN)
- **AI** : Google Gemini API
- **Deployment** : Vercel
- **Domain** : Gandi (jeanpierrecharles.com)

---

## 👤 Auteur

**Jean-Pierre Charles**  
Ingénieur Consultant Sénior | Expert Industrie 5.0  
Spécialiste Transformation Digitale & Conformité IA Européenne

- 🌐 Website : [jeanpierrecharles.com](https://jeanpierrecharles.com)
- ✉️ Email : contact@jeanpierrecharles.com
- 📍 Tercé, Nouvelle-Aquitaine, France

---

## 📄 Licence

© 2026 Jean-Pierre Charles. Tous droits réservés.

---

**Dernière mise à jour** : 16 janvier 2026
