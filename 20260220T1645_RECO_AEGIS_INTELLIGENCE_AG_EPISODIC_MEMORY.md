# RECOMMANDATIONS — Exploitation Mémoire Épisodique AG pour AEGIS Intelligence
**Session** : 20260220T1645 CET  
**Auteur** : Claude Opus 4.6 (claude.ai)  
**Destinataire** : Jean-Pierre Charles — AEGIS CIRCULAR  
**Statut** : DRAFT — Validation JP requise  
**Réf. traçabilité** : À inscrire dans AEGIS_REGISTRE_TRACABILITE

---

## 1. CONTEXTE ET DÉCOUVERTE

La conversation Sonnet 4.6 du 20260220 a cartographié deux répertoires `.antigravity` coexistants sur le Surface Pro 11 :

| Répertoire | Nature | Contenu clé | Valeur AEGIS |
|---|---|---|---|
| `C:\Users\jpcha\.antigravity` | Profil VSCode "Antigravity" | 30+ extensions (Python, GitLens, PowerShell, Java), dossier `Anthropic_Claude/` | FAIBLE — runtime IDE, pas d'intelligence |
| `C:\Users\jpcha\.gemini\antigravity` | Runtime agent AG (Google DeepMind) | `brain/` (16 sessions UUID), `browser_recordings/` (14 fichiers), `playground/eternal-spirit/`, `mcp_config.json` | ÉLEVÉE — mémoire épisodique AG |

**Fait établi** : `aegis-sync-hub.ps1 v1.0.3` synchronise déjà les fichiers `brain/` vers Google Drive (`Gemini-AG/Antigravity`) avec filtre `*.md, *.json, *.txt`. La donnée brute est disponible. L'exploitation structurée manque.

---

## 2. ANALYSE — POURQUOI LA MÉMOIRE ÉPISODIQUE AG EST STRATÉGIQUE

### 2.1 Complément unique au pipeline cross-source existant

Le pipeline d'ingestion AEGIS Intelligence (8 étapes, cf. RAG ChatGPT Synthèse Executive) couvre les sources de *recherche* :

- ChatGPT Export (1 728 conversations) → pensée exploratoire JP
- Chrome/Perplexity → recherche web structurée
- Claude claude.ai → validation architecturale, contre-expertise
- Gemini API → exécution Brain IA côté client

**Ce qui manque** : la trace de ce qu'AG a *fait* avec ces informations. La mémoire épisodique AG (`brain/`) capture :

- Les **décisions d'implémentation** prises par AG en autonomie (sessions nuit)
- Le **contexte retenu entre sessions** — ce qu'AG considère pertinent de rappeler
- Les **patterns d'erreur** non documentés (cf. L1 LIFECYCLE MASTER : AG ne préserve pas les corrections ponctuelles)
- Les **arbitrages techniques implicites** qu'AG fait sans les expliquer

C'est la **7ᵉ source d'intelligence** pour AEGIS Intelligence, et la seule qui capture le raisonnement opérationnel d'un agent IA autonome.

### 2.2 Biais identifiés — Filtrage obligatoire

| Biais | Source d'identification | Impact | Mitigation |
|---|---|---|---|
| **Optimisme AG** | L2 LIFECYCLE MASTER : "SESSION_REPORT AG optimiste — marque OK alors que régressions existent" | Décisions basées sur status faussement positifs | Cross-vérifier chaque "OK" AG avec les V-Gate Claude |
| **Amnésie corrective** | L1 LIFECYCLE MASTER : "AG ne préserve pas les corrections ponctuelles lors des refactors complets" | Régressions récurrentes (BUG-1 + REGRESSION-1) | Extraire les corrections du brain/ et les injecter comme contraintes dans les briefs AG |
| **Biais de récence** | Structure sessions UUID — dernière session surpondérée | Perte de contexte des premières sessions | Indexer chronologiquement toutes les sessions |
| **Hallucination structurelle** | Même biais identifié sur ChatGPT (cf. RAG synthèse) | Données chiffrées AG potentiellement approximatives | Flag confidence_score sur chaque extraction |

---

## 3. ARCHITECTURE D'EXPLOITATION RECOMMANDÉE

### 3.1 Pipeline AG Brain Ingestion (Extension du pipeline E1-E8 existant)

Ce pipeline s'insère comme source complémentaire dans l'architecture AEGIS Intelligence :

| Étape | Composant | Fonction | Technologie | Priorité |
|---|---|---|---|---|
| **B1** | Brain Session Parser | Lecture et structuration des 16 sessions UUID (.md/.json) | Python + jq | P0 |
| **B2** | Decision Extractor | Identification des décisions, arbitrages, et choix de code | Gemini 2.0 Flash (few-shot) | P0 |
| **B3** | Error Pattern Miner | Extraction des corrections, bugs découverts, régressions | Regex + NLP | P1 |
| **B4** | Confidence Tagger | Score de fiabilité par assertion AG (cross-ref V-Gate) | Rules engine + Claude API | P1 |
| **B5** | Knowledge Merger | Fusion avec KnowledgeDocuments ChatGPT/Chrome/Claude | Schéma KnowledgeDocument unifié | P2 |
| **B6** | Contradiction Detector | Détection divergences AG vs Claude vs ChatGPT sur même sujet | Embedding similarity + Gemini | P2 |

### 3.2 Schéma de données — AG Brain KnowledgeDocument

Extension du schéma KnowledgeDocument unifié :

```json
{
  "source_type": "ag_brain_session",
  "session_uuid": "uuid-de-la-session",
  "timestamp": "ISO 8601",
  "content_type": "decision | error_pattern | context_retention | implementation_note",
  "raw_content": "texte brut extrait du brain/",
  "extracted_decisions": [
    {
      "decision": "description",
      "confidence_score": 0-100,
      "cross_verified_by": ["claude_vgate_p1b", "manual_test"],
      "known_bias": "optimism | amnesia | none"
    }
  ],
  "related_files": ["src/components/brain/AegisChat.tsx"],
  "cross_source_matches": ["chatgpt_conv_id", "claude_bridge_id"],
  "aegis_category": "one of 13 catégories thématiques"
}
```

---

## 4. RECOMMANDATIONS OPÉRATIONNELLES

### R1 — IMMÉDIAT (Sprint courant, avant 27/02)

**R1.1 Audit manuel du contenu brain/** : Avant toute automatisation, lire les 16 sessions UUID pour évaluer la densité d'information exploitable. C'est une opération de 30-45 min qui détermine le ROI du pipeline B1-B6.

**R1.2 Cartographier les sessions brain/ vs les briefs d'exécution** : Chaque session AG correspond (en théorie) à un brief d'exécution Claude. Établir la matrice de correspondance :

```
brain/session-uuid-1 ↔ AG_EXECUTION_BRIEF_v3.1_20260216T2145.md
brain/session-uuid-2 ↔ AG_BRIEF_EXECUTION_FINAL_20260219T2000.md
...etc
```

Cette matrice permet de mesurer la divergence entre ce qu'AG devait faire (brief) et ce qu'AG a retenu (brain).

**R1.3 Ajouter un tag `ag_brain_audit` dans AEGIS_REGISTRE_TRACABILITE** pour tracer cette nouvelle source.

### R2 — COURT TERME (Mars 2026, aligné avec A1-A3 pipeline ChatGPT)

**R2.1 Parser B1 minimal** : Script Python ou PowerShell qui :
- Lit tous les fichiers dans `.gemini\antigravity\brain\*\*.{md,json}`
- Extrait les métadonnées (date, taille, type)
- Produit un index structuré (CSV ou JSON)
- S'intègre dans le pipeline aegis-sync-hub existant comme post-processing

**R2.2 Alimenter les briefs d'exécution AG** : La valeur immédiate n'est pas le pipeline automatisé mais l'utilisation des insights brain/ pour rédiger de meilleurs briefs. Concrètement :
- Avant chaque session AG nuit, Claude lit les sessions brain/ pertinentes
- Les patterns d'erreur deviennent des "CONTRAINTES EXPLICITES" dans le brief
- Les décisions retenues par AG deviennent des "CONTEXTE HÉRITÉ" vérifiés

**R2.3 Browser recordings comme source secondaire** : Les 14 fichiers dans `browser_recordings/` contiennent les actions Playwright d'AG. C'est une mine pour comprendre *comment* AG navigue et interagit, mais la priorité reste brain/ (raisonnement > actions).

### R3 — MOYEN TERME (Avril-Mai 2026, post-v3.1 deployment)

**R3.1 Pipeline B1-B6 complet** : Automatiser l'extraction, le tagging, et la fusion cross-source une fois que :
- Le parser ChatGPT (E1-E3) est opérationnel
- Le schéma KnowledgeDocument est stabilisé
- Un volume suffisant de sessions brain/ s'est accumulé

**R3.2 Contradiction Detector (B6)** : C'est la fonctionnalité la plus différenciante. Quand AG dit "j'ai implémenté le streaming correctement" (brain/) mais Claude détecte un bug de double buffering (BRIDGE 20260219), cette contradiction est un signal à haute valeur pour :
- Améliorer la fiabilité des validations AG
- Alimenter le registre de leçons apprises (L1-L19)
- Renforcer les critères V-Gate

**R3.3 Intégration Perplexity + Mistral** : Conformément au plan L10 du LIFECYCLE MASTER (étendre aegis-sync-hub v3.2), les sources Perplexity et Mistral viendront compléter le pipeline. La mémoire AG sera alors une source parmi 7+.

---

## 5. IMPACT SUR LES DOCUMENTS DÉCISIONNELS AEGIS

La mémoire épisodique AG, correctement exploitée, améliore directement 4 documents clés :

| Document | Amélioration via brain/ AG |
|---|---|
| **Daily Bridge** | Section "Contexte hérité AG" avec décisions extraites du brain/ — remplace les suppositions par des faits |
| **Brief d'exécution AG** | Section "Contraintes explicites" basée sur les patterns d'erreur minés (B3) — réduit les régressions |
| **LIFECYCLE MASTER** | Leçons apprises enrichies par les données réelles AG, pas seulement les observations Claude/JP |
| **V-Gate Checklist** | Critères de validation augmentés par les points de défaillance AG documentés dans brain/ |

---

## 6. RISQUES ET GARDE-FOUS

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| brain/ contient des tokens/secrets | Moyenne | Critique | Audit sécurité R1.1 AVANT toute ingestion automatisée. Pattern grep pour API keys. |
| Volume brain/ insuffisant pour justifier un pipeline | Faible | Moyen | R1.1 détermine le ROI. Si < 5 sessions utiles, rester en exploitation manuelle. |
| Sur-ingénierie du pipeline avant product-market fit | Moyenne | Élevé | R2.2 d'abord (usage manuel), pipeline automatisé seulement après validation manuelle |
| AG modifie le format brain/ lors d'une mise à jour | Moyenne | Moyen | Versionner le parser B1 et monitorer les changements de structure |

---

## 7. DÉCISION REQUISE

**Question à JP** : Valider l'approche en 3 phases (R1/R2/R3) et prioriser R1.1 (audit manuel brain/) comme prochaine action. L'audit détermine si la richesse du contenu justifie le développement du pipeline B1-B6 ou si une exploitation manuelle suffit pour le sprint courant.

---

## TRAÇABILITÉ

- **Source** : Conversation Sonnet 4.6 20260220 (cartographie .antigravity)
- **Contexte KB** : RAG ChatGPT Synthèse Executive (pipeline E1-E8), LIFECYCLE MASTER (L1-L19), BRIDGE 20260219 (streaming fix), aegis-sync-hub v1.0.3
- **Mémoire Claude** : Historique complet conversations projet AEGIS (audit 17/02, bridge 18/02, brief AG 19/02)
- **À inscrire** : AEGIS_REGISTRE_TRACABILITE — nouvelle entrée "AG Brain Episodic Memory — Source Intelligence #7"
