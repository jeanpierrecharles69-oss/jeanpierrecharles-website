# AFRS Methodology Guide - How to Use the Framework

**Version**: 2.0.1  
**Date**: 17 janvier 2026  
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

## 3. Conclusion

Le framework AFRS n'est pas une simple checklist, c'est un système itératif. Chaque incident (comme l'hallucination Aegis) doit alimenter l'amélioration continue du document Master et des protocoles de vérification.

**Bonne conception !**

---

**Auteur**: Jean-Pierre Charles + Antigravity AI  
**Version**: 2.0  
**Date**: 17 janvier 2026 (Mise à jour post-incident)
