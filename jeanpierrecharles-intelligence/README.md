# 📊 JEANPIERRECHARLES INTELLIGENCE

**Système Global Intégré de Gestion d'Ingénierie d'Actualités, d'Informations et de Connaissances Stratégiques**

> Transformez toutes vos recherches et consultations web en intelligence stratégique activable via API REST

> **Statut** : GO CONDITIONNEL — Phase 0 (Consolidation) en cours  
> **Contre-expertise** : [contre-expertise-jpc-intelligence.md](contre-expertise-jpc-intelligence.md)  
> **Date de mise à jour** : 13 février 2026

---

## 🎯 Vue d'Ensemble

JeanPierreCharles Intelligence est une infrastructure pérenne de **Knowledge Management** multi-sources qui :

1. ✅ **Capture** automatiquement vos recherches sur **toutes vos applications** (Chrome, Firefox, Perplexity, Claude, Gemini, etc.)
2. ✅ **Analyse** le contenu avec IA et embeddings sémantiques
3. ✅ **Structure** les connaissances dans un graph interrogeable unifié
4. ✅ **Active** les insights directement via API REST et Dashboard

### 🌐 Sources Supportées

- **Navigateurs** : Chrome, Firefox, Edge, Brave
- **AI Assistants** : Claude.ai, Perplexity.ai, Gemini
- **Autres** : Extensible à toute application web

## 📦 Structure du Projet

```
jeanpierrecharles-intelligence/
├── phase1-immediate/           # Solution immédiate (rétrospective)
│   ├── browser_history_analyzer.py  # Analyser tous navigateurs
│   ├── dashboard.html
│   ├── install_and_run.ps1
│   └── README.md
│
├── phase2-infrastructure/      # Infrastructure pérenne (prospective)
│   ├── ARCHITECTURE.md
│   ├── IMPLEMENTATION_GUIDE.md
│   ├── browser-connectors/    # Connecteurs multi-navigateurs
│   │   ├── chrome/            # Extension Chrome
│   │   ├── firefox/           # Add-on Firefox
│   │   └── universal/         # Script universel
│   ├── ai-connectors/         # Connecteurs AI assistants
│   │   ├── perplexity/
│   │   ├── claude/
│   │   └── gemini/
│   └── mcp-server/            # Backend MCP + API
│       ├── package.json
│       └── src/
│           └── index.js
│
├── docs/                       # Documentation
│   └── (générée automatiquement)
│
├── EXECUTIVE_SYNTHESIS.md      # Synthèse stratégique
└── README.md                   # Ce fichier
```

## 🚀 Démarrage Rapide

### Phase 1 : Analyse Rétrospective Multi-Sources (IMMÉDIAT)

**Analysez votre historique de toutes vos sources du 03.02 au 07.02.2026**

```powershell
# Windows PowerShell
cd phase1-immediate
.\install_and_run.ps1
```

**Sources supportées en Phase 1** :

- ✅ Google Chrome
- ✅ Firefox
- ✅ Edge
- ✅ Brave
- 🔜 Historique Perplexity (export manuel)
- 🔜 Conversations Claude (export manuel)

**Résultat** :

- Rapport JSON unifié avec insights thématiques
- Dashboard interactif de visualisation
- Signaux faibles et tendances détectés
- **Vue consolidée** de toutes vos sources

### Phase 2 : Infrastructure Pérenne (4 SEMAINES)

**Déploiement complet du système MCP**

Consultez [`phase2-infrastructure/IMPLEMENTATION_GUIDE.md`](phase2-infrastructure/IMPLEMENTATION_GUIDE.md)

## 📚 Documentation

| Document | Description | Audience |
|----------|-------------|----------|
| [EXECUTIVE_SYNTHESIS.md](EXECUTIVE_SYNTHESIS.md) | Synthèse stratégique et décisionnelle | Direction |
| [phase1-immediate/README.md](phase1-immediate/README.md) | Guide Phase 1 - Script immédiat | Utilisateur |
| [phase2-infrastructure/ARCHITECTURE.md](phase2-infrastructure/ARCHITECTURE.md) | Architecture technique complète | Tech Lead |
| [phase2-infrastructure/IMPLEMENTATION_GUIDE.md](phase2-infrastructure/IMPLEMENTATION_GUIDE.md) | Guide de déploiement Phase 2 | DevOps |

## 🎬 Cas d'Usage

### Use Case 1 : Veille Concurrentielle Automatisée

```
User → Dashboard JPC Intelligence: 
"Synthétise mes lectures sur les SaaS compliance tools cette semaine"

Claude → knowledge_search tool:
{query: "SaaS compliance", timeRange: "7d"}

Résultat → Rapport structuré avec :
- Top 10 articles consultés
- Tendances de marché détectées
- Nouveaux acteurs identifiés
```

### Use Case 2 : Détection de Signaux Faibles

```
System → Analyse automatique quotidienne

Détection → Nouvelle thématique "DORA regulation"
- 3 visites en 24h (inhabituel)
- Temps moyen 8 min/article (forte attention)

Action → Notification Dashboard
"Signal faible détecté : DORA regulation. Voulez-vous approfondir ?"
```

### Use Case 3 : Génération de Rapports Stratégiques

```
User → Dashboard JPC Intelligence:
"Génère un rapport hebdomadaire de mes lectures"

Claude → generate_report tool:
{type: "weekly", format: "markdown"}

Résultat → Document .md avec :
- Vue exécutive (KPIs)
- Thèmes prioritaires
- Recommandations d'action
```

## 🏗️ Architecture Technique

### Phase 0-1 : Script immédiat + Consolidation sécurité

```
SQLite (Chrome/Firefox/Edge/Brave History)
    ↓
Python Analyzer + PII Filtering + Fernet Encryption
    ↓
JSON Report chiffré → Dashboard HTML
```

### Phase 2+ : Infrastructure Aegis

```
Multi-Browser Connectors
    ↓
FastAPI REST Server (Python 3.12+)
    ↓
Supabase (PostgreSQL + Auth) + Gemini Embeddings
    ↓
Dashboard React via Vercel
```

**Stack cible recommandée** (post contre-expertise) :

| Composant | Avant | Après (recommandé) |
|-----------|-------|---------------------|
| **Runtime** | Node.js + MCP SDK | Python 3.12+ (natif ARM64) |
| **Serveur** | MCP Server Fastify | FastAPI REST |
| **Base de données** | PostgreSQL + Qdrant | SQLite (Phase 0-1) → Supabase (Phase 2+) |
| **Cache** | Redis | JSON chiffrés (Phase 0-1) → Redis (Phase 2+) |
| **Embeddings** | OpenAI text-embedding-3 | Gemini 2.0 Flash (aligné Google One AI Pro) |
| **Interface** | Claude Desktop MCP | API REST + Dashboard React via Vercel |
| **CI/CD** | Non spécifié | GitHub Actions → Vercel (pipeline existant) |

> ⚠️ **Note** : L'architecture MCP/Claude Desktop originale est abandonnée suite à la vulnérabilité 0-Click RCE (CVSS 10) de Claude Desktop (10/02/2026).

## 📊 Résultats Attendus

> **⚠️ Les métriques ci-dessous sont des OBJECTIFS CIBLES, non des résultats mesurés.**  
> Aucune donnée réelle n'a encore été analysée (Phase 0 en cours).

### Gains Quantifiables (objectifs)

| Métrique | Baseline | Objectif (3 mois) | Statut |
|----------|----------|-------------------|--------|
| Temps de veille | 20h/semaine | 6h/semaine (-70%) | À mesurer |
| Insights actionnés | 2/mois | 10/mois (+400%) | À mesurer |
| Qualité décisions | Baseline | +40% (score interne) | À mesurer |
| Précision catégorisation | N/A | >80% | À valider en Phase 1 |

### Bénéfices Qualitatifs

- ✅ **Mémoire organisationnelle** persistante et interrogeable
- ✅ **Détection proactive** des tendances émergentes
- ✅ **Accélération** des cycles de décision stratégique
- ✅ **Veille multi-sources cross-référencée** (différenciateur clé)

## 🔒 Sécurité & Confidentialité (Risque P0)

> **CRITIQUE** : La sécurité est identifiée comme risque P0 dans la contre-expertise.

### Exigences implémentées (Phase 0)

- ✅ **Filtrage PII** : Regex patterns pour OAuth tokens, session IDs, emails dans URLs
- ✅ **Chiffrement Fernet (AES-128-CBC)** : Exports JSON chiffrés au repos
- ✅ **Politique de rétention** : Auto-purge configurable (défaut 90 jours)

### Exigences prévues (Phase 1+)

- 🔜 **Sandboxing** : Isolation des copies SQLite
- 🔜 **TLS 1.3** : Chiffrement en transit pour la Phase 2
- 🔜 **RGPD** : Filtrage des URLs contenant des identifiants tiers
- 🔜 **Audit trail** : Journalisation des accès aux données

## 🛠️ Prérequis Système

### Phase 0-1 (Consolidation + Validation)

- Windows 11 ARM64 (Surface Pro 11 Snapdragon X) ✅ Validé
- Python 3.12+ (natif ARM64) ✅ Disponible
- Navigateurs : Chrome, Firefox, Edge (au moins 1)
- Bibliothèque `cryptography` pour chiffrement Fernet

### Phase 2+ (Infrastructure Aegis)

- Python 3.12+ avec FastAPI
- Supabase (cloud, pas de dépendance locale)
- Gemini API (via Google One AI Pro existant)
- Vercel (pipeline CI/CD existant)

> ⚠️ **ARM64** : Toutes les dépendances Phase 2 sont validées ARM64-native.  
> Claude Desktop est exclu (vulnérabilité CVSS 10, incompatibilité ARM64 confirmée).

## 📈 Roadmap (révisée post contre-expertise)

### ✅ Phase 0 : Consolidation (Semaines 1-2) — EN COURS

- Validation `browser_history_analyzer.py` sur Surface Pro 11 ARM64
- Implémentation chiffrement Fernet (AES-128-CBC) des exports
- Filtrage PII/tokens dans les URLs capturées
- Remplacement architecture MCP → FastAPI REST
- Nettoyage données fictives dans EXECUTIVE_SYNTHESIS.md

### 🔜 Phase 1 : Validation (Semaines 3-4)

- Première analyse complète sur 30 jours d'historique multi-navigateurs
- Test des parsers d'export Claude et Perplexity
- Documentation des taux de précision catégorisation (objectif >80%)
- Premier rapport de veille réglementaire automatisé

### 🔮 Phase 2 : Extraction pour Aegis (Semaines 5-8)

- Module de catégorisation comme composant réutilisable
- Adaptation schéma KnowledgeDocument pour Aegis multi-tenant
- Connecteurs sources réglementaires officielles (EUR-Lex, ECHA SCIP)
- Embeddings sémantiques via Gemini 2.0 Flash
- Pipeline CI/CD + tests automatisés

## 🎓 Ressources

### Tutoriels

- [Démarrage Phase 1](phase1-immediate/README.md)
- [Déploiement Phase 2](phase2-infrastructure/IMPLEMENTATION_GUIDE.md)
- [Architecture détaillée](phase2-infrastructure/ARCHITECTURE.md)

### Références Externes

- [MCP Protocol](https://modelcontextprotocol.io/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Qdrant Vector DB](https://qdrant.tech/)

## 🤝 Contribution

Ce projet est actuellement en phase de développement interne pour **Aegis Circular**.

Potentiel open-source en Q2 2026 (à décider).

## 📄 Licence

Propriétaire - Usage interne Aegis Circular

## 📞 Support

**Issues techniques** : Consultez les README spécifiques à chaque phase

**Questions stratégiques** : Voir [EXECUTIVE_SYNTHESIS.md](EXECUTIVE_SYNTHESIS.md)

---

**Version** : 2.0.0  
**Date** : 13 février 2026  
**Mise à jour** : Intégration contre-expertise Claude Opus 4.6  
**Auteur** : Jean-Pierre Charles (Aegis Circular)  
**Référence** : [contre-expertise-jpc-intelligence.md](contre-expertise-jpc-intelligence.md)
