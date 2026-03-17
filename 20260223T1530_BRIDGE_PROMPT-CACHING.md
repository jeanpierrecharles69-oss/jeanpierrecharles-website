# CONVERSATION_BRIDGE — 20260223T1530

## Prompt Caching — Fondements, Fonctions & Intégration AEGIS Intelligence

**Timestamp :** 20260223T1530 CET  
**Writer :** Claude Sonnet 4.6 (claude.ai)  
**Auteur :** Jean-Pierre Charles — AEGIS Intelligence  
**Appareil :** Surface Pro 11 — ARM64 — Windows 11  
**Projet :** jeanpierrecharles.com + AEGIS Intelligence  
**Classification :** BRIDGE EXECUTIF — Référence technique & stratégique  
**Références croisées :** CONVERSATION_BRIDGE_POWERSHELL_20260220T2000 | bridge_AG_Claude_20260220T1400_v2 | CONVERSATION-CONTEXT_EXPERTISE_AEGIS-LIFECYCLE-MASTER_20260219T1045

---

## 0. RÉSUMÉ EXÉCUTIF

Le Prompt Caching est une fonctionnalité API Anthropic qui permet de **mettre en cache côté serveur des portions déterminées du prompt** pour éviter de les retraiter à chaque appel. Le modèle lit depuis le cache au lieu de retokeniser le même contenu.

**Impact stratégique AEGIS :** Cette fonctionnalité est un enabler direct de l'architecture Dual-Brain et du cœur cognitif AEGIS Intelligence — elle rend économiquement viable le maintien d'un contexte AEGIS riche et permanent dans chaque appel API, transformant structurellement le coût d'exploitation du pipeline.

**Verdict :** Implémentation **P0** dès que les appels API directs (PowerShell → Claude API) sont activés dans le workflow AEGIS. Économie estimée : **80-90% sur les tokens de contexte répétitifs**.

---

## 1. FONDEMENTS TECHNIQUES

### 1.1 Principe de fonctionnement

Le Prompt Caching fonctionne via des **marqueurs `cache_control`** placés dans la structure JSON de la requête API. On balise un bloc de contenu pour indiquer que tout ce qui précède ce marqueur doit être mis en cache côté serveur Anthropic.

```json
{
  "model": "claude-sonnet-4-6",
  "system": [
    {
      "type": "text",
      "text": "[Contexte AEGIS complet — standards, architecture, governance, 3000+ tokens]",
      "cache_control": {"type": "ephemeral"}
    }
  ],
  "messages": [{"role": "user", "content": "Question spécifique du moment..."}]
}
```

### 1.2 Contraintes techniques

| Paramètre | Valeur |
|---|---|
| Taille minimale cacheable | 1024 tokens (Haiku : 2048) |
| TTL (Time To Live) | 5 minutes — rafraîchi à chaque cache read |
| Breakpoints maximum | 4 par requête |
| Modèles supportés | Claude Sonnet 4.6, Opus 4.6, Haiku 4.5 |
| Types de contenu | System prompt, tool definitions, messages, documents |

### 1.3 Mécanisme de coûts

| Type de token | Coût relatif | Impact AEGIS |
|---|---|---|
| Input standard | 100% | Baseline |
| Cache write (1ère fois) | **125%** | Légèrement plus cher |
| Cache read (réutilisations) | **10%** | 90% d'économie |

> **Point d'équilibre :** Atteint dès la **2ème requête**. Le surcoût de l'écriture (+25%) est compensé dès le 1er cache read (économie de 90%).

---

## 2. FONCTIONS PRINCIPALES

### F1 — Contexte système permanent
Cacher le system prompt AEGIS (standards, governance, architecture, règles V-Gate). Valable pour toute session d'appels API en PowerShell.

### F2 — Ingestion de documents longs
Charger une fois en cache un document réglementaire, base de code, ou ensemble de fichiers projet. Questions successives sur ce document lisent depuis le cache.

### F3 — Historique de conversation stable
Dans les sessions multi-tours longues via API, les échanges précédents sont mis en cache. Seuls les nouveaux messages sont facturés au tarif plein.

### F4 — Définitions d'outils (Tools)
Cacher les définitions JSON des outils PowerShell et fonctions du pipeline AEGIS — évite de les retransmettre à chaque appel.

### F5 — Contexte multi-documents
Jusqu'à 4 breakpoints permettent de cacher plusieurs niveaux : (1) contexte AEGIS de base, (2) docs projet spécifiques, (3) historique récent, (4) instructions de tâche.

---

## 3. BÉNÉFICES OPÉRATIONNELS — AEGIS INTELLIGENCE

### 3.1 Pipeline PowerShell → API Claude

Le workflow AEGIS inclut des scripts (`aegis-sync-hub.ps1`, futurs scripts d'automatisation) qui font des séries d'appels API Claude. Sans caching, chaque appel retransmet le contexte AEGIS complet.

```powershell
# Pattern PowerShell avec Prompt Caching
function Invoke-ClaudeAPIWithCache {
    param([string]$UserMessage, [string]$SystemContext)
    
    $body = @{
        model = "claude-sonnet-4-6"
        max_tokens = 2048
        system = @(
            @{
                type = "text"
                text = $SystemContext  # Contexte AEGIS complet
                cache_control = @{ type = "ephemeral" }  # CACHE ce bloc
            }
        )
        messages = @(@{ role = "user"; content = $UserMessage })
    } | ConvertTo-Json -Depth 10
    
    Invoke-RestMethod -Uri "https://api.anthropic.com/v1/messages" `
                      -Method POST `
                      -Headers @{
                          "x-api-key"             = $env:ANTHROPIC_API_KEY
                          "anthropic-version"     = "2023-06-01"
                          "anthropic-beta"        = "prompt-caching-2024-07-31"
                          "Content-Type"          = "application/json"
                      } `
                      -Body $body
}
```

**Header requis :** `"anthropic-beta": "prompt-caching-2024-07-31"` — le caching doit être activé explicitement.

### 3.2 Antigravity IDE → Modèles Claude

AG fait un appel API Claude par interaction utilisateur. Si votre workspace AG inclut un system prompt riche (architecture jpc.com, stack technique, conventions de code), ce contexte est facturé à chaque échange. Le Prompt Caching réduit structurellement ce coût opérationnel.

### 3.3 Analyse documentaire réglementaire

Pour les travaux de conformité (Aegis Circular), le workflow typique est :
1. Charger document réglementaire (50+ pages) → **cache write** (1 fois)
2. Poser 10-15 questions successives → **cache read** (10% du coût de chaque lecture)
3. Économie sur 15 questions : ~85% du coût total de traitement documentaire

---

## 4. BÉNÉFICES STRATÉGIQUES — JEANPIERRECHARLES.COM

### 4.1 Contexte AEGIS permanent à faible coût

Il devient économiquement viable de transmettre un **contexte AEGIS très riche** à chaque appel API — toute la gouvernance, les standards, l'historique décisionnel, les règles V-Gate — sans surcoût proportionnel au volume d'appels.

### 4.2 Enabler de l'architecture Dual-Brain

Le Dual-Brain (claude.ai analyse + Claude API automation) bénéficie directement : le "cerveau" Claude peut maintenir un état de connaissance AEGIS complet entre les appels PowerShell sans explosion des coûts API.

### 4.3 Scalabilité du cœur cognitif AEGIS Intelligence

Quand AEGIS Intelligence sera exposé à des utilisateurs finaux de jeanpierrecharles.com via des agents IA, le caching devient **indispensable** pour la viabilité économique :
- System prompt AEGIS Intelligence (~3000-5000 tokens) → écrit une fois en cache
- Chaque utilisateur concurrent → cache read à 10% du coût
- Volume élevé = économies exponentielles

### 4.4 Latence réduite — expérience utilisateur

Les cache reads sont significativement plus rapides que le traitement complet. Sur un system prompt de 3000 tokens, le gain de latence améliore la réactivité perçue du cœur cognitif — critère UX direct pour jeanpierrecharles.com.

---

## 5. MATRICE D'IMPLÉMENTATION AEGIS

| Cas d'usage | Contenu à cacher | Tokens estimés | Économie |
|---|---|---|---|
| Scripts PS automation | System prompt AEGIS governance | 2000-3000 | **🟢 Élevée** |
| AG workspace Claude | Contexte stack + conventions | 1500-2000 | **🟢 Élevée** |
| Analyse documents conformité | Doc réglementaire complet | 5000-50000 | **🟢 Très élevée** |
| Cœur cognitif AEGIS (futur) | System prompt agent | 3000-5000 | **🟢 Critique** |
| V-Gate validation | Règles validation + historique | 1000-1500 | **🟡 Modérée** |

---

## 6. RECOMMANDATIONS D'ACTIONS — BONNES PRATIQUES

### P0 — Immédiat (dès activation API directe)

| # | Action | Outil | Détail |
|---|---|---|---|
| **C1** | Créer `$AEGIS_SYSTEM_CONTEXT` dans scripts PS | PowerShell | Variable contenant le system prompt AEGIS complet (governance, standards, règles V-Gate) |
| **C2** | Ajouter header `anthropic-beta: prompt-caching-2024-07-31` | PowerShell | Requis pour activer le caching dans tous les appels API |
| **C3** | Refactoriser `Invoke-ClaudeAPI` → `Invoke-ClaudeAPIWithCache` | PowerShell | Pattern réutilisable basé sur le template §3.1 |

### P1 — Court terme (semaines suivantes)

| # | Action | Outil | Détail |
|---|---|---|---|
| **C4** | Mesurer `cache_creation_input_tokens` vs `cache_read_input_tokens` | PS + JSON | Vérifier l'efficacité du cache via les métriques de réponse API |
| **C5** | Définir le corpus AEGIS à cacher | Claude.ai | Rédiger le system prompt AEGIS canonical (governance + architecture + stack) à utiliser dans tous les scripts |
| **C6** | Implémenter le pattern 4-breakpoints | PS | (1) AEGIS base, (2) projet spécifique, (3) docs session, (4) instructions tâche |

### P2 — Planification (avant activation agents jpc.com)

| # | Action | Outil | Détail |
|---|---|---|---|
| **C7** | Architecture caching pour AEGIS Intelligence agents | AG + Claude.ai | Design du system prompt agent avec cache_control optimal |
| **C8** | Test de charge : mesure économies réelles | PowerShell | Benchmark 50 appels avec/sans caching sur tâches AEGIS types |
| **C9** | Documenter le TTL dans les procédures | Bridge | Alerter : sessions > 5 min sans appel = cache expiré, surcoût write au redémarrage |

### Bonnes pratiques transversales

**DO :**
- Toujours placer le cache_control sur le contenu le plus stable (system prompt avant les messages dynamiques)
- Surveiller les métriques `cache_creation_input_tokens` / `cache_read_input_tokens` dans les réponses API pour valider l'efficacité
- Structurer le system prompt par ordre de stabilité : governance permanente → contexte projet → contexte session
- Utiliser les 4 breakpoints pour segmenter les niveaux de contexte

**DON'T :**
- Ne pas cacher des contenus qui changent à chaque requête (aucun bénéfice, surcoût de write)
- Ne pas oublier le header `anthropic-beta` (sans lui, caching inactif silencieusement)
- Ne pas confondre TTL 5 min avec la durée de session — des sessions longues sans appel API invalident le cache
- Ne pas inclure de données sensibles (credentials, tokens, PII) dans les blocs cachés

---

## 7. VEILLE STRATÉGIQUE

| Sujet | Source | Fréquence |
|---|---|---|
| Extension TTL (potentiellement 1h en GA) | docs.anthropic.com/prompt-caching | Mensuel |
| Prompt Caching pour Claude Haiku 4.5 | Anthropic changelog | Mensuel |
| Évolution pricing cache read/write | api.anthropic.com/pricing | Trimestriel |
| Caching support dans AG Antigravity | AG changelog + GitHub | Mensuel |

---

## 8. RÉFÉRENCES CROISÉES

| Document | Relation | Action liée |
|---|---|---|
| CONVERSATION_BRIDGE_POWERSHELL_20260220T2000 | Pattern `Invoke-ClaudeAPI` → à refactoriser avec cache | C1, C2, C3 |
| bridge_AG_Claude_20260220T1400_v2 | Routing Sonnet 4.6 (Thinking) — contexte AG à cacher | C5, C7 |
| CONVERSATION-CONTEXT_EXPERTISE_AEGIS-LIFECYCLE-MASTER_20260219T1045 | Governance AEGIS — corpus du system prompt canonique | C5 |
| CONVERSATION_BRIDGE_CLAUDEDXT-ARM64_20260219T0915 | Sécurité MCP — ne pas cacher credentials | Bonnes pratiques DON'T |

---

## 9. PROCHAINS POINTS DE CONTRÔLE

| Échéance | Objet | Action requise |
|---|---|---|
| **À l'activation API PS** | Implémentation caching PS | C1, C2, C3 |
| **J+7** | Rédaction system prompt AEGIS canonical | C5 |
| **J+14** | Benchmark économies réelles | C8 |
| **Avant lancement agents jpc.com** | Architecture caching AEGIS Intelligence | C7 |
| **20260311** | Patch Tuesday — vérifier impacts ARM64 | Contexte général AEGIS |

---

*AEGIS Intelligence · jeanpierrecharles.com*  
*CONVERSATION_BRIDGE_PROMPTCACHING_20260223T1530*  
*Généré par Claude Sonnet 4.6 — 20260223T1530 CET*  
*ASCII-safe : OUI*
