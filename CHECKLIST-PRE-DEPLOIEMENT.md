# ✅ Checklist Pré-Déploiement Vercel - jeanpierrecharles.com

**Date** : 17 janvier 2026  
**Objectif** : Site vitrine pro + Plateforme Aegis opérationnels

---

## 🔍 PHASE 1 : Vérification Fonctionnelle (AVANT cosmétique)

### A. Vérification Boutons & Navigation

- [ ] **Homepage JeanPierreCharles**
  - [ ] Bouton "Échanger ensemble" → scroll vers section Contact
  - [ ] Bouton "Accéder à Aegis" → ouvre /aegis
  - [ ] Navigation sticky fonctionne
  - [ ] Tous les liens menu (Vision, Services, Aegis, Contact)
  - [ ] Bouton "Mentions Légales" → ouvre modal
  - [ ] Modal Mentions Légales se ferme (X)
  - [ ] Sélecteur de langue FR/EN fonctionne

- [ ] **Plateforme Aegis (/aegis)**
  - [ ] Sidebar navigation (Vue d'ensemble, Passeports...)
  - [ ] Dashboard affiche le produit actif (Bras Robotique)
  - [ ] Graphiques/gauges chargent correctement
  - [ ] Bouton "Voir le Passeport" → ouvre CompliancePassportView
  - [ ] Onglets Passeport (Vue d'ensemble / Traçabilité)
  - [ ] Toggles Smart Questioning fonctionnent
  - [ ] Bouton "Exporter Certificat" (PDF export)

- [ ] **Assistant Aegis**
  - [ ] Bouton Assistant s'ouvre (icône sparkle)
  - [ ] 6 Badges cliquables :
    - [ ] 🤖 AI Act → ouvre questionnaire
    - [ ] ⚙️ Machinery → ouvre questionnaire  
    - [ ] 🔒 GDPR → ouvre questionnaire
    - [ ] 🛡️ CRA → ouvre questionnaire
    - [ ] ♻️ ESPR → ouvre questionnaire
    - [ ] 📊 Data Act → ouvre questionnaire
  - [ ] Questionnaires :
    - [ ] Résumé critique s'affiche
    - [ ] Bouton "Commencer le questionnaire"
    - [ ] Questions avec radio/checkbox fonctionnent
    - [ ] Bouton "Retour" fonctionne
    - [ ] Bouton "Générer l'analyse" fonctionne
    - [ ] "Je ne sais pas" présent sur toutes questions choice
  - [ ] Réponse générée :
    - [ ] Format ~250 mots respecté
    - [ ] Structure : Priorité, Situation, Actions, Timeline, Conseil
    - [ ] Pas d'hallucinations (utilise base locale)
  - [ ] Input texte libre fonctionne
  - [ ] Bouton Envoyer (avion) fonctionne
  - [ ] Entrée pour envoyer fonctionne
  - [ ] Bouton fermer (X) fonctionne

### B. Vérification Base de Données

- [ ] `data/reglements-europeens-2024.json` contient tous les règlements :
  - [ ] 2024/1781 (ESPR)
  - [ ] 2024/1689 (AI Act)
  - [ ] 2024/2847 (CRA)
  - [ ] 2023/2854 (Data Act)
  - [ ] 2023/1230 (Machines)
  - [ ] 2016/679 (RGPD)

### C. Tests Multi-devices

- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Mode sombre/clair (si implémenté)

### D. Performance

- [ ] Lighthouse Score :
  - [ ] Performance > 90
  - [ ] Accessibility > 90
  - [ ] Best Practices > 90
  - [ ] SEO > 90
- [ ] Temps de chargement < 3s
- [ ] Pas d'erreurs console JavaScript
- [ ] Images optimisées (WebP, lazy loading)

---

## 🎨 PHASE 2 : Optimisations Cosmétiques

### A. Intégration CV / Profil

**Informations à intégrer** (d'après aperçu CV) :

- [ ] **Identité**
  - [ ] Nom : Jean-Pierre Charles
  - [ ] Né : 8 janvier 1969, Pointe-à-Pitre, Guadeloupe [971]
  - [ ] Localisation actuelle : Tercé (86), Grand Poitiers, Nouvelle-Aquitaine
  - [ ] Contact : +33 679 842 208 | <contact@jeanpierrecharles.com>

- [ ] **Section "À propos" enrichie**
  - [ ] Photo professionnelle (à ajouter si disponible)
  - [ ] Bio condensée mentionnant origine Guadeloupe
  - [ ] Expertise : Industrie 5.0, Mécatronique, IA, Conformité EU
  - [ ] Parcours : Guadeloupe → France métropolitaine → Expert EU compliance

- [ ] **Section Parcours/Expérience** (nouvelle section)
  - Résumé 3-4 expériences clés du CV
  - Timeline visuelle (optionnel)

- [ ] **Certifications/Diplômes** (si applicable)
  - Ingénierie
  - Certifications spécifiques

### B. LinkedIn Integration

- [ ] **Bouton "LinkedIn" dans section Contact**

  ```html
  <a href="https://www.linkedin.com/in/jeanpierrecharles/" target="_blank">
    <svg>LinkedIn Icon</svg> Mon profil LinkedIn
  </a>
  ```

- [ ] **Badge LinkedIn "Follow"** (optionnel)
  Snippet à intégrer : <https://www.linkedin.com/profile/badge>

- [ ] **Open Graph tags pour partage LinkedIn**

  ```html
  <meta property="og:title" content="Jean-Pierre Charles - Expert Industrie 5.0 & Conformité UE" />
  <meta property="og:description" content="Ingénieur expert en transformation digitale, IA et conformité réglementaire pour PME/ETI européennes" />
  <meta property="og:image" content="/og-image.jpg" />
  ```

### C. Améliorations Visuelles

- [ ] **Favicon** personnalisé (JPC initiales ou logo)
- [ ] **Animations micro-interactions** :
  - [ ] Hover sur boutons
  - [ ] Scroll smooth
  - [ ] Transitions badges Assistant
- [ ] **Typographie** :
  - [ ] Google Fonts cohérent (Inter/Roboto déjà ok ?)
  - [ ] Hiérarchie claire (H1, H2, H3)
- [ ] **Couleurs** :
  - [ ] Palette cohérente avec identité
  - [ ] Contraste WCAG AA minimum
- [ ] **Images** :
  - [ ] Bandeau hero attractif
  - [ ] Illustration services (si applicable)
  - [ ] Photo profil

### D. SEO Final

- [ ] **Balises meta complètes** :

  ```html
  <title>Jean-Pierre Charles | Expert Industrie 5.0 & Conformité UE</title>
  <meta name="description" content="Ingénieur conseil spécialisé en transformation Industrie 5.0, IA et conformité réglementaire européenne pour PME/ETI. Services : stratégie, écoconception, IA Act, RGPD, DPP." />
  <meta name="keywords" content="Industrie 5.0, Conformité UE, AI Act, ESPR, Mécatronique, Guadeloupe, PME, ETI" />
  ```

- [ ] **Sitemap.xml** généré
- [ ] **Robots.txt** configuré
- [ ] **Schema.org markup** (Person + Organization)

  ```json
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Jean-Pierre Charles",
    "jobTitle": "Expert Industrie 5.0 & Conformité UE",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Tercé",
      "addressRegion": "Nouvelle-Aquitaine",
      "addressCountry": "FR"
    },
    "birthPlace": "Pointe-à-Pitre, Guadeloupe",
    "telephone": "+33679842208",
    "email": "contact@jeanpierrecharles.com"
  }
  ```

---

## 🚀 PHASE 3 : Déploiement Vercel

### A. Variables d'Environnement

- [ ] **Vercel Dashboard** → Project Settings → Environment Variables
  - [ ] `VITE_GEMINI_API_KEY` = [Votre clé API Gemini]
  - Scope : Production + Preview + Development

### B. Configuration Build

- [ ] **Build Command** : `npm run build`
- [ ] **Output Directory** : `dist`
- [ ] **Install Command** : `npm install`
- [ ] **Framework Preset** : Vite

### C. Domaine

- [ ] **Domaine personnalisé** :
  - Option 1 : `jeanpierrecharles.com` (si acheté)
  - Option 2 : Sous-domaine Vercel `jeanpierrecharles.vercel.app`
- [ ] Configuration DNS (si domaine custom)
- [ ] Certificat SSL (auto via Vercel)

### D. Post-Déploiement

- [ ] Tester URL production
- [ ] Vérifier Gemini API fonctionne en prod
- [ ] Test complet de tous les boutons en production
- [ ] Analytics (Vercel Analytics activé)
- [ ] Monitoring erreurs

---

## 📱 PHASE 4 : Stratégie Communication & Réseaux (Voir STRATEGIE-COMMUNICATION.md)

---

## 🌍 PHASE 5 : Ciblage Outremers (Voir STRATEGIE-OUTREMERS.md)

---

## 📊 Estimation Temps

| Phase | Tâches | Temps estimé |
|-------|--------|--------------|
| **Phase 1** | Vérification fonctionnelle | 1-2h |
| **Phase 2** | Cosmétique + CV + LinkedIn | 3-4h |
| **Phase 3** | Déploiement Vercel | 30 min |
| **Phase 4** | Stratégie communication | 1h (planification) |
| **Phase 5** | Outremers | Continu |
| **TOTAL** | | **6-8h avant mise en ligne** |

---

## 🎯 Ordre Recommandé

1. ✅ **Aujourd'hui** : Phase 1 (vérifications) + Badge Construction si temps
2. **Demain** : Phase 2 (cosmétique + intégration CV/LinkedIn)
3. **J+2** : Phase 3 (déploiement Vercel)
4. **J+3** : Phase 4-5 (lancement communication)

---

**Prêt à commencer les vérifications ?**
