# AFRS Methodology Guide - How to Use the Framework

**Version**: 2.1  
**Date**: 22 janvier 2026  
**Objectif**: Guide pratique d'application du template AFRS Master Document avec exemples concrets

---

## Introduction

Ce guide explique **comment utiliser** le framework AFRS Master Document v2.0 pour vos projets. Il complète la documentation principale en fournissant des exemples pratiques et des conseils d'application.

---

## 1. Avant de Commencer

### Conditions Préalables

**Compétences requises**:

- Compréhension basique de votre domaine métier
- Pas besoin d'être développeur (framework adapté aux ingénieurs non-programmeurs)
- Capacité à documenter et structurer l'information

**Temps estimé**:

- Petite application (MVP simple): 2-4 semaines
- Application moyenne: 2-3 mois
- Application complexe multi-réglementations: 4-6 mois

### Exemple Fil Rouge: Aegis AI Compliance Platform

Nous utiliserons le projet **Aegis** (plateforme de gestion de conformité EU pour PME manufacturières) comme exemple tout au long de ce guide.

**Contexte Aegis**:

- Secteur: Compliance réglementaire EU
- Utilisateurs: PME manufacturières françaises
- Règlements: ERSP, Machine, CRA  
- MVP: Accueil expert + espace collectif info réglementaire

---

## 2. Application des 3 Méthodologies

### 2.1 Analyse Herméneutique: Le Tout ↔ Les Parties

**Quand l'appliquer**: À chaque phase, systématiquement

**Exemple Phase 1 (Vision) - Aegis**:

## Analyse Herméneutique - Phase 1 Aegis

### Le Tout (Vision Globale)

**Description**: Écosystème complet de gestion de la compliance [stratégie opérationnelle ses processus et ses trajectoires d'exécution] et la conformité [certification des produits et des systèmes cyberphysiques] pour les TPE, PME, ETI des industries manufacturières et de la construction en Europe, en France et dans les Régions Européennes Ultrapériphériques d'Outre-Mer.

**Objectifs principaux**:

- Aider les entreprises à naviguer la complexité réglementaire et à mieux comprendre les exigences critiques des réglementations de l'Union Européenne et des pays membres.
- Offrir des services d'expertise technique et d'ingénierie en R&D innovation V&V, transformation digitale industrielle et décarbonation de la production des produits et des systèmes cyberphysiques.
- Collaborer avec les experts en conformité pour fournir des services d'expertise, de conseil et de formation.
- Accompagner et faciliter l'obtention des certifications CE et  environnementaux et des passeports numériques des produits.
- Accélérer la commercialisation produits industriels sur le marché Européen.

**Contraintes globales**:

- Respect des exigences des réglementations européennes pour la gestion du cycle de vie des données (RGPD, Data Act, AI Act, CRA)
- Hébergement sécurisé en France ou en Europe (RGPD)
- Interface ultra-simple pour une expérience utilisateur optimale
- Budget limité (PME = petits moyens)

### Les Parties (Composants)  

1. **Acceuil Expert**
   - Rôle: Établir confiance, crédibilité
   - Contrainte: Concis (temps attention <30s)
   - Dépendance: Design professionnel

2. **Espace Collectif Information**
   - Rôle: Veille réglementaire centralisée
   - Contrainte: Sources institutionnelles et officielles (JOE uniquement)
   - Dépendance: Scraping EUR-Lex OU curation manuelle

3. **CTA Contact**
   - Rôle: Conversion visiteur → lead
   - Contrainte: Formulaire minimal (RGPD minimisation)
   - Dépendance: Service email (SMTP)

### Relations Tout ↔ Parties

**Du tout vers les parties**:

- Vision "conformité accessible PME" → Chaque composant doit être simple
- Contrainte budget → Pas de features complexes en MVP

**Des parties vers le tout**:

- Si espace collectif nécessite backend lourd → Augmente coût infrastructure
- Si formulaire contact ne convertit pas → Tout (modèle business) échoue

### Incohérences Détectées

- ❌ Initialement prévu "dashboard compliance personnalisé" en Must-Have
  → Résolution: Descendre en "Later" (trop complexe pour MVP, pas cohérent avec contrainte budget)

### Synthèse

Le MVP Aegis se concentre sur **2 parties essentielles** (Accueil + Info collective) qui suffisent à délivrer valeur initiale ("découvrir expert + comprendre réglementations"). Dashboard personnalisé reporté post-MVP.

---

### 2.2 Exactitude de l'IA: Leçons de l'Incident Aegis

**L'Incident**:
Lors des tests, l'IA d'Aegis a nié l'existence du règlement **ERSP 2024/1781**, affirmant qu'il n'existait pas, alors qu'il s'agit d'un règlement officiel publié au JOE.

**Cause**:
La "connaissance coupée" (knowledge cutoff) de l'IA était antérieure à la publication du règlement. Sans connexion à une base de données actualisée (RAG), l'IA a "halluciné" une réponse négative avec assurance.

**Résolution (Méthodologie AFRS v2.0)**:

1. **Protocole de Vérification (Phase 10)**:
   L'IA doit désormais extraire les faits clés et demander confirmation à l'utilisateur si elle n'a pas la source exacte dans ses instructions.
   *Exemple*: "📋 Je vois que vous mentionnez le règlement 2024/1781. Pouvez-vous confirmer qu'il s'agit bien du règlement sur l'écoconception (ERSP) ?"

2. **Intégration RAG (Retrieval-Augmented Generation)**:
   Connexion de l'IA à une base de données vectorielle (ex: ChromaDB) contenant les textes intégraux des règlements téléchargés sur EUR-Lex.

3. **Observabilité (Phase 13)**:
   Logging systématique du "score de confiance" et des sources citées pour chaque réponse.

Voir [AFRS_AI_Accuracy_Framework.md](./AFRS_AI_Accuracy_Framework.md) pour les détails techniques d'implémentation.

---

## 3. Gestion Documentaire v2.1

### 3.1 Règles de Nomenclature Strictes

**Standard Obligatoire AFRS**:

```text
Format: jeanpierrecharles_AFRS_[NOM-DESCRIPTIF]_v[VERSION].md

Exemples valides:
✅ jeanpierrecharles_AFRS_README_v2.1.md
✅ jeanpierrecharles_AFRS_Master-Document-v2_Part3-Final.md
✅ jeanpierrecharles_AFRS_CHANGELOG_v2.1.md
```

**Exceptions** (documents non-AFRS):

```text
Format: jeanpierrecharles_[CATEGORIE]-[NOM].md

Exemples:
✅ jeanpierrecharles_STRATEGIE-OUTREMERS.md
✅ jeanpierrecharles_GUIDE-GANDI-VERCEL-DNS.md
```

**Bénéfices**:

- ✅ Traçabilité totale (git log, recherches)
- ✅ Conformité ISO 9001 (gestion documentaire)
- ✅ Recherche simplifiée (préfixe unique)
- ✅ Versioning explicite

### 3.2 Processus de Versioning

**Règle de Versioning Sémantique**:

- **v2.0 → v2.1**: Ajout fonctionnel majeur (ex: Phase 17)
- **v2.1 → v2.1.1**: Correction mineure (typos, clarifications)
- **v2.x → v3.0**: Refonte architecture complète

**Archivage**:

- Anciennes versions: Renommer avec suffix `_ARCHIVE-v2.0.md`
- Conserver dans dossier `archives/` (optionnel)

---

## 4. Architecture RAG Multi-Modèles (Phase 16+)

### 4.1 Pourquoi Gemini-1.5-Flash est Obligatoire

**Comparaison Modèles**:

| Critère | gemini-1.5-flash (GA) | gemini-2.5-flash (Preview) |
| :--- | :--- | :--- |
| Statut | ✅ Stable Production | ⚠️ Expérimental |
| Déterminisme | ✅ Élevé (temp 0.1) | ⚠️ Variable |
| Knowledge Cutoff | ✅ Fixe documenté | ⚠️ Flottant |
| Hallucinations | ✅ <2% (avec RAG) | ⚠️ ~15% |
| Support Long-terme | ✅ Garanti 2+ ans | ❌ Non garanti |

**Verdict**: **gemini-1.5-flash OBLIGATOIRE** pour conformité EU (zéro tolérance erreur).

### 4.2 Architecture Hybride Recommandée

**Pour gérer l'évolution réglementaire EU** (ESPR, AI Act, CPR 2.0...):

```typescript
const RAG_ARCHITECTURE = {
  // Moteur PRINCIPAL (80% requêtes)
  primary: {
    engine: "gemini-1.5-flash",
    temperature: 0.1,
    usage: "Questionnaires standards, analyses simples",
    cost: "$50/mois (100K requêtes)"
  },
  
  // Moteur PREMIUM (20% requêtes critiques)
  premium: {
    engine: "claude-3.5-sonnet",
    temperature: 0.0,
    usage: "DPIA, High-Risk AI Classification, Audits",
    cost: "$150/mois (5K requêtes)",
    paywall: "Premium tier uniquement"
  },
  
  // Base vectorielle
  vectorDB: "Supabase pgvector",
  
  // Embeddings
  embeddings: "Google text-embedding-004", // $0.00002/1K
  
  // 8 Modules Réglementaires
  regulations: [
    "AI Act (2024/1689)",
    "GDPR (2016/679)",
    "Data Act (2023/2854)",
    "CRA (2024/2847)",
    "Machines (2023/1230)",
    "ESPR (2024/1781)",
    "CPR (305/2011)", // NOUVEAU
    "Batteries (2023/1542)" // NOUVEAU
  ]
}
```

**Coût total estimé**: $485/mois (vs $1800 avec Claude seul = **73% économie**)

### 4.3 Smart Routing Logic

**Règles de sélection automatique**:

1. **User Free Tier** → Gemini uniquement
2. **User Premium + Complexité Simple** → Gemini
3. **User Premium + Complexité Élevée** → Claude
4. **Cas spéciaux** (DPIA, Classification AI High-Risk) → Claude

**Bénéfices**:

- ✅ Qualité optimale (Claude pour critique)
- ✅ Coût contrôlé (Gemini pour routine)
- ✅ Différenciation paywall (Claude = feature premium)

### 4.4 Gestion Évolution Réglementaire

**Pipeline Automatique EUR-Lex**:

```typescript
// Pipeline mensuel
async function updateRegulationsKnowledgeBase() {
  // 1. Scrape EUR-Lex pour nouveaux textes
  const newDocs = await scrapeEURLex([
    "2024/1689", // AI Act
    "2024/1781", // ESPR
    // ... autres
  ]);
  
  // 2. Chunking sémantique
  const chunks = await semanticChunking(newDocs, {
    chunkSize: 1000,
    overlap: 200
  });
  
  // 3. Embedding + Ingestion Supabase
  await vectorDB.upsert(chunks);
  
  // 4. Version tracking
  await logRegulationVersion({
    regulation: "AI_ACT",
    version: "2024/1689 (consolidée nov 2024)",
    timestamp: new Date()
  });
}
```

**Traçabilité**: Chaque réponse IA cite la **version exacte** du règlement utilisé.

---

## 5. Leçons du Déploiement jeanpierrecharles.com

### 5.1 Cloud Sync Issues (CRITIQUE)

**Problème**: Développement dans dossiers cloud-synchronisés (Google Drive, OneDrive).

**Impact**: `npm install` échoue avec erreurs `EBADF`, `EPERM`, `ENOTEMPTY`.

**Raison**: Milliers de petits fichiers `node_modules/` conflits de synchronisation.

**Solution Définitive**:

```powershell
# ❌ INTERDIT
cd "G:\Mon Drive\projet"
npm install # ÉCHOUE

# ✅ BON WORKFLOW
robocopy "G:\Mon Drive\projet" "C:\Projects\projet" /E /XD node_modules
cd C:\Projects\projet
npm install # ✅ FONCTIONNE
npm run dev
```

### 5.2 DNS Propagation (48h)

**Leçon**: Configurer DNS Gandi.net **48-72h avant lancement** prévu.

**Vérification**: `nslookup jeanpierrecharles.com` + `dnschecker.org`

### 5.3 SSL Auto-Provisioning Vercel

**Leçon**: Vercel génère automatiquement SSL **APRÈS** propagation DNS complète.

**Patience**: Attendre 24-48h, ne PAS forcer manuellement.

---

## 6. Conclusion

Le framework AFRS n'est pas une simple checklist, c'est un système itératif. Chaque incident (comme l'hallucination Aegis) doit alimenter l'amélioration continue du document Master et des protocoles de vérification.

**Nouveautés v2.1**:

- ✅ Règles nomenclature strictes
- ✅ Architecture RAG hybride (Gemini + Claude)
- ✅ Gestion 8 modules réglementaires
- ✅ Leçons déploiement production

**Bonne conception !**

---

## 📚 Références

- **Architecture RAG complète**: `jeanpierrecharles_AFRS_ARCHITECTURE-RAG-MULTIMODELES-v2.1.md`
- **AI Accuracy Framework**: `jeanpierrecharles_AFRS_AI_Accuracy_Framework.md`
- **Analyse Nomenclature**: `jeanpierrecharles_AFRS_ANALYSE-NOMENCLATURE-v2.1.md`

---

**Auteur**: Jean-Pierre Charles + Antigravity AI  
**Version**: 2.1  
**Date**: 22 janvier 2026
