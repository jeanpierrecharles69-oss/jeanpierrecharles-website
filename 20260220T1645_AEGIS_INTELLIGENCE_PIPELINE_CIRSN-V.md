# AEGIS INTELLIGENCE — Architecture Pipeline Semi-Automatisé Human-in-the-Loop
**Session** : 20260220T1645 CET  
**Auteur** : Claude Opus 4.6 (claude.ai)  
**Destinataire** : Jean-Pierre Charles — AEGIS CIRCULAR  
**Statut** : DRAFT v1.0 — Validation JP requise  
**Réf. traçabilité** : À inscrire dans AEGIS_REGISTRE_TRACABILITE

---

## 0. ALIGNEMENT NOMMAGE — AEGIS Intelligence

### 0.1 Règle de nommage officielle (rappel mémoire #11)

| Terme OFFICIEL | Termes RETIRÉS (ne plus utiliser) |
|---|---|
| **AEGIS Intelligence** | JPC Intelligence, Brain IA, AEGIS Brain, JPC Brain |
| **AEGIS CIRCULAR** | (inchangé — nom plateforme SaaS) |
| **Gemini** | (inchangé — nom propre Google DeepMind) |
| **AG** / **Antigravity** | (inchangé — nom propre agent) |
| **Claude** | (inchangé — nom propre Anthropic) |

### 0.2 Périmètre d'application

| Zone | Action requise |
|---|---|
| Code source (`src/components/brain/`) | AegisChat.tsx, AegisIntelligence.tsx — vérifier labels UI FR/EN |
| i18n.ts | `brainTitle` → "AEGIS Intelligence" (FR/EN) |
| Documents KB projet Claude | Ce document + RECO précédent + tous futurs documents |
| Google Drive (dossiers sync) | Renommer `01_Projets_Actifs/JPC_Intelligence/` → `01_Projets_Actifs/AEGIS_Intelligence/` |
| REGISTRE_TRACABILITE | Mettre à jour toutes les références |
| Briefs d'exécution AG | Template à mettre à jour |
| LIFECYCLE MASTER | Section 1 à mettre à jour |
| Production jeanpierrecharles.com | Déjà fait (V-Gate P1B #10 : "AEGIS Intelligence" visible partout, zéro "AEGIS Brain") |

### 0.3 Exception — Nommage technique interne

Dans le code, les noms de fichiers techniques restent descriptifs :
- `AegisChat.tsx` → OK (composant technique)
- `geminiService.ts` → OK (service API)
- `brain/` (dossier) → conserver pour compatibilité AG, mais UI affiche "AEGIS Intelligence"

---

## 1. DIAGNOSTIC — ÉTAT RÉEL DU PIPELINE (20260220)

### 1.1 Ce qui EXISTE et FONCTIONNE

| Composant | État | Automatisation |
|---|---|---|
| **aegis-sync-hub.ps1 v1.0.3** | Opérationnel, toutes les 15 min | 100% automatique |
| **7 sources configurées** | project, claude, gemini, antigravity, migration + 2 réservées | 100% automatique |
| **SHA-256 cache** | Détection changements sans re-upload | 100% automatique |
| **Google Drive centralisé** | 149+ fichiers natifs Google Docs | 100% automatique |
| **Daily Bridge documents** | Template structuré, continuité inter-sessions | 100% MANUEL (JP + Claude) |
| **V-Gate validation** | Checklists formalisées P1A/P1B/P1C | 100% MANUEL (Claude) |
| **Cross-source pattern detection** | 6 clusters thématiques identifiés (RAG ChatGPT) | 100% MANUEL (JP mémoire) |
| **Pipeline E1-E8 ChatGPT** | Spécification documentée | 0% implémenté |
| **AG brain/ ingestion** | Sync OK, exploitation inexistante | 0% implémenté |

### 1.2 Le goulet d'étranglement — Charge cognitive JP

```
SOURCES BRUTES (automatisé)          ANALYSE (100% manuel JP)         DÉCISIONS
┌─────────────────────┐             ┌───────────────────┐           ┌──────────┐
│ ChatGPT (1728 conv) │──┐          │                   │           │          │
│ Chrome (browsing)   │──┤          │  JP lit, mémorise, │           │ Briefs   │
│ Claude (sessions)   │──┤──sync──→ │  cross-référence,  │──────────→│ V-Gates  │
│ Perplexity          │──┤  Drive   │  décide, rédige    │           │ Décision │
│ AG brain/ (16 sess) │──┤          │                   │           │          │
│ Gemini API logs     │──┘          │  POINT DE RUPTURE  │           │          │
│ Mistral (futur)     │             └───────────────────┘           └──────────┘
                                          ↑
                                    Mémoire humaine
                                    = non-scalable
                                    = risque d'oubli
                                    = fatigue cognitive
```

**Constat** : La sync fonctionne. L'analyse est le bottleneck. JP fait manuellement ce qu'AEGIS Intelligence devrait faire pour lui.

---

## 2. ARCHITECTURE CIBLE — AEGIS Intelligence Pipeline Semi-Automatisé

### 2.1 Principe directeur : Human-in-the-Loop, pas Human-as-the-Loop

```
SOURCES BRUTES        AEGIS Intelligence Engine        JP (validation)        OUTPUTS
┌──────────┐         ┌─────────────────────────┐      ┌──────────────┐      ┌──────────┐
│ sync-hub │──15min─→│ COLLECT : fichiers Drive │      │              │      │          │
│ (auto)   │         │ INDEX   : catalogue+hash │      │ Dashboard    │      │ Briefs   │
└──────────┘         │ INFER   : Gemini extract │──→──→│ "À valider"  │──→──→│ V-Gates  │
                     │ STORE   : BD décisionnel │      │ Push notif   │      │ Rapports │
                     │ NOTIFY  : demande V&V    │      │ Approve/Edit │      │ Publish  │
                     └─────────────────────────┘      └──────────────┘      └──────────┘
                              ↑                              ↑
                        Automatisé                    Human-in-the-Loop
                     (PS + Gemini API)              (10-15 min/jour max)
```

### 2.2 Les 6 étages du pipeline

| Étage | Nom | Fonction | Automatisation | Technologie |
|---|---|---|---|---|
| **C** | COLLECT | Récupérer les fichiers nouveaux/modifiés depuis Drive | 100% auto | PowerShell + Google Drive API (extension aegis-sync-hub) |
| **I** | INDEX | Cataloguer, hasher, classifier par type et source | 100% auto | PowerShell + JSON index |
| **R** | RAG + INFER | Extraire les décisions, patterns, contradictions via LLM | 90% auto | Gemini 2.0 Flash API (batch, pas streaming) |
| **S** | STORE | Sauvegarder dans BD décisionnelle (dossier Google Drive structuré) | 100% auto | Google Drive API + JSON structuré |
| **N** | NOTIFY | Push notification de demande V&V + Approval | 100% auto | Email via Google Gmail API ou Google Chat webhook |
| **V** | VALIDATE | JP review, approuve, corrige, rejette | 100% HUMAIN | Google Drive comments + tags |

**Acronyme mnémotechnique : CIRSN-V** (prononcé "cirque-envé" — le cirque des sources qui tourne, JP qui valide)

---

## 3. SPÉCIFICATION TECHNIQUE DÉTAILLÉE

### 3.1 Étage C — COLLECT (extension aegis-sync-hub)

**Déjà fonctionnel à 90%.** L'étage C n'est qu'un mode "pull" ajouté au sync-hub existant :

```powershell
# Nouveau paramètre aegis-sync-hub.ps1 v1.1.0
.\aegis-sync-hub.ps1 -CollectNew -Since "2026-02-20T00:00:00"
# Retourne : liste JSON des fichiers nouveaux/modifiés depuis le timestamp
# Sortie : C:\Users\jpcha\.config\ag_sync\collect_manifest.json
```

**Manifest de collecte** (nouveau fichier produit) :
```json
{
  "collected_at": "2026-02-20T17:00:00+01:00",
  "since": "2026-02-20T00:00:00+01:00",
  "files": [
    {
      "source": "gemini",
      "path": ".gemini/antigravity/brain/session-uuid-1/context.md",
      "drive_id": "1abc...",
      "sha256": "e3b0c44...",
      "modified": "2026-02-20T03:15:00Z",
      "size_bytes": 4521,
      "status": "new"
    }
  ],
  "stats": { "new": 3, "modified": 7, "total": 10 }
}
```

### 3.2 Étage I — INDEX (nouveau script)

**Script** : `aegis-intelligence-index.ps1` (nouveau, ~150 lignes)

Fonction : lire le `collect_manifest.json`, classifier chaque fichier, et produire un index enrichi.

```powershell
# Classification automatique par source + type de contenu
$CLASSIFIERS = @{
    "brain/*.md"           = "ag_episodic_memory"
    "brain/*.json"         = "ag_session_state"
    "playground/*.md"      = "ag_workspace_output"
    "browser_recordings/*" = "ag_browser_trace"
    "Claude/*.json"        = "claude_session_config"
    "Claude/local-agent-mode-sessions/*" = "claude_agent_session"
    "project/src/*"        = "source_code"
    "project/*.md"         = "project_documentation"
    "project/BRIDGE_*"     = "session_bridge"
    "project/RECO_*"       = "recommendation_document"
}
```

**Index enrichi** (produit dans Drive) :
```
Google Drive/01_Projets_Actifs/AEGIS_Intelligence/
  index/
    intelligence_index_20260220.json    ← catalogue du jour
    intelligence_index_20260219.json    ← historique J-1
    ...
```

### 3.3 Étage R — RAG + INFER (cœur AEGIS Intelligence)

**Script** : `aegis-intelligence-infer.ps1` (nouveau, ~300 lignes)

C'est le cœur du pipeline. Il utilise l'API Gemini 2.0 Flash (déjà configurée via GEMINI_API_KEY) pour extraire automatiquement :

**3.3.1 Extraction de décisions (pour chaque fichier brain/ ou bridge)**

```powershell
# Prompt système Gemini pour extraction structurée
$SYSTEM_PROMPT = @"
Tu es AEGIS Intelligence, le moteur d'analyse décisionnelle du projet AEGIS CIRCULAR.
Analyse le document fourni et extrais UNIQUEMENT en JSON :
{
  "decisions": [
    {
      "description": "description courte de la décision",
      "type": "technical|strategic|operational|security",
      "confidence": 0-100,
      "source_quote": "citation exacte max 20 mots",
      "cross_check_needed": true/false,
      "related_files": ["fichiers mentionnés"]
    }
  ],
  "error_patterns": [
    {
      "description": "pattern d'erreur identifié",
      "severity": "critical|important|minor",
      "recurrence": "first|repeated",
      "mitigation": "action corrective suggérée"
    }
  ],
  "contradictions": [
    {
      "claim_a": "assertion source A",
      "claim_b": "assertion contradictoire source B",
      "resolution_needed": true/false
    }
  ],
  "action_items": [
    {
      "action": "description",
      "owner": "JP|AG|Claude",
      "priority": "P0|P1|P2",
      "deadline": "date si mentionnée"
    }
  ]
}
Réponds UNIQUEMENT en JSON valide. Aucun texte avant ou après.
"@

# Appel API Gemini batch (pas streaming — extraction structurée)
$body = @{
    contents = @(@{
        parts = @(
            @{ text = $SYSTEM_PROMPT },
            @{ text = "DOCUMENT À ANALYSER :`n$fileContent" }
        )
    })
    generationConfig = @{
        responseMimeType = "application/json"
        temperature = 0.1  # Extraction factuelle, pas créative
    }
} | ConvertTo-Json -Depth 10

$response = Invoke-RestMethod -Uri "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$env:GEMINI_API_KEY" `
    -Method POST -ContentType "application/json" -Body $body
```

**3.3.2 Détection de patterns cross-source**

Après extraction individuelle, un 2ᵉ appel Gemini compare les extractions du jour :

```powershell
$CROSS_SOURCE_PROMPT = @"
Tu es AEGIS Intelligence. Voici les extractions de N sources différentes du même jour.
Identifie :
1. CONVERGENCES : décisions/observations qui apparaissent dans 2+ sources
2. CONTRADICTIONS : assertions contradictoires entre sources
3. SIGNAUX FAIBLES : mentions isolées qui méritent investigation
4. ACTIONS CONSOLIDÉES : fusion des action_items dédoublonnés

Réponds UNIQUEMENT en JSON.
"@
```

**Output** : Un fichier `intelligence_digest_YYYYMMDD.json` par jour, stocké dans Drive.

### 3.4 Étage S — STORE (BD décisionnelle dans Google Drive)

Pas de base de données externe. Google Drive EST la BD, structurée ainsi :

```
Google Drive/01_Projets_Actifs/AEGIS_Intelligence/
  index/                              ← Catalogues quotidiens
    intelligence_index_20260220.json
  digests/                            ← Synthèses quotidiennes (output Gemini)
    intelligence_digest_20260220.json
    intelligence_digest_20260219.json
  decisions/                          ← Registre cumulatif des décisions
    decisions_register.json           ← Append-only, jamais écraser
  patterns/                           ← Patterns d'erreur cumulatifs
    error_patterns_register.json
  contradictions/                     ← Contradictions non résolues
    open_contradictions.json          ← JP doit résoudre
  actions/                            ← Actions consolidées
    pending_actions.json              ← File d'attente V&V JP
    validated_actions.json            ← Approuvées par JP
    rejected_actions.json             ← Rejetées par JP (avec motif)
  publications/                       ← Contenu prêt pour publication
    ready_for_site.json               ← jeanpierrecharles.com
    ready_for_platform.json           ← AEGIS CIRCULAR SaaS
```

**Pourquoi Google Drive et pas une vraie DB** :
- Zéro infra à maintenir (pas de Supabase/PostgreSQL pour cette couche)
- JSON lisible par tous les agents (Claude, AG, scripts PS)
- Sync bidirectionnelle native via Drive Desktop
- Sauvegarde automatique + versioning Google
- Compatible avec la stratégie existante (tout dans Drive = source de vérité)

### 3.5 Étage N — NOTIFY (notifications push)

**Option A — Email (recommandée, zéro setup)** :

```powershell
# Utiliser Gmail API (même OAuth que aegis-sync-hub)
function Send-AegisNotification {
    param([string]$Subject, [string]$Body)
    
    $message = @{
        raw = [Convert]::ToBase64String(
            [System.Text.Encoding]::UTF8.GetBytes(
                "From: aegis-intelligence@gmail.com`r`nTo: jpcharles@gmail.com`r`nSubject: [AEGIS Intelligence] $Subject`r`nContent-Type: text/html; charset=utf-8`r`n`r`n$Body"
            )
        ) -replace '\+','-' -replace '/','_' -replace '=',''
    }
    # POST https://gmail.googleapis.com/gmail/v1/users/me/messages/send
}
```

**Notification quotidienne type** (email HTML) :

```
Sujet : [AEGIS Intelligence] Digest 20260220 — 3 décisions · 1 contradiction · 5 actions

═══ DIGEST QUOTIDIEN AEGIS INTELLIGENCE ═══

📊 SOURCES ANALYSÉES : 10 fichiers (3 brain/ AG · 4 bridges · 2 code · 1 config)

🔴 CONTRADICTION DÉTECTÉE :
   AG brain/session-5 : "streaming OK, tests passés"
   Bridge 20260219   : "Bug 1 — Streaming cassé, double buffering"
   → ACTION REQUISE : Résoudre dans REGISTRE

🟡 DÉCISIONS EXTRAITES (3) :
   1. [TECHNIQUE] Migration Tailwind CDN → PostCSS (confidence: 95%)
   2. [STRATÉGIE] Gemini 2.0 Flash maintenu (pas 2.5) (confidence: 80%)
   3. [OPÉRATIONNEL] Phase 4 hors scope nuit (confidence: 100%)

🟢 ACTIONS EN ATTENTE DE VALIDATION (5) :
   → Cliquer ici pour ouvrir pending_actions.json dans Drive

[APPROUVER TOUT]  [OUVRIR DANS DRIVE]  [RÉPONDRE]
```

**Option B — Google Chat webhook** (si JP utilise Google Chat) :
```powershell
# Webhook URL configuré une fois
Invoke-RestMethod -Uri $GOOGLE_CHAT_WEBHOOK -Method POST -Body (@{
    text = "🔔 *AEGIS Intelligence* — Digest 20260220`n3 décisions · 1 contradiction · 5 actions`n→ Ouvrir dans Drive"
} | ConvertTo-Json)
```

### 3.6 Étage V — VALIDATE (Human-in-the-Loop)

**Workflow JP quotidien (~10-15 min)** :

```
1. Recevoir notification email/chat (automatique)
2. Ouvrir pending_actions.json dans Drive (1 clic)
3. Pour chaque item :
   - ✅ Approuver → déplace vers validated_actions.json
   - ❌ Rejeter + motif → déplace vers rejected_actions.json
   - ✏️ Modifier → éditer inline, puis approuver
4. Pour les contradictions :
   - Choisir assertion correcte
   - Le pipeline met à jour le registre de décisions
5. Pour les publications :
   - Marquer "ready" → script publie vers jeanpierrecharles.com ou AEGIS CIRCULAR
```

**Interface simple** : Pas de webapp custom. Un Google Doc ou Sheet formaté avec des checkboxes :

```
PENDING ACTIONS — 20260220
═══════════════════════════

☐ [P0][TECHNIQUE] Corriger streaming double buffering
  Source: Bridge 20260219 · Confidence: 95%
  Owner: AG · Deadline: 21/02
  → [Approuver] [Rejeter] [Modifier]

☐ [P1][STRATÉGIE] Évaluer Gemini 2.5 Flash vs 2.0
  Source: AG brain/session-12 · Confidence: 60%
  Owner: JP · Deadline: 27/02
  → [Approuver] [Rejeter] [Modifier]
```

---

## 4. ORCHESTRATION — SCRIPT MAÎTRE

### 4.1 Script principal : `aegis-intelligence-engine.ps1`

```powershell
# AEGIS Intelligence Engine — Orchestrateur principal
# Exécution : quotidienne (tâche planifiée) ou à la demande
# Prérequis : aegis-sync-hub.ps1 v1.1.0+, GEMINI_API_KEY, OAuth Google

param(
    [switch]$DryRun,        # Simulation sans écriture
    [switch]$Verbose,       # Logs détaillés
    [string]$Since,         # Override date de collecte
    [switch]$SkipNotify,    # Pas d'envoi email
    [switch]$ForceReindex   # Réindexer tout
)

# Étage C — COLLECT
Write-Host "[C] Collecte des fichiers nouveaux..."
& .\aegis-sync-hub.ps1 -CollectNew -Since $since

# Étage I — INDEX
Write-Host "[I] Indexation et classification..."
& .\aegis-intelligence-index.ps1 -Manifest $collectManifest

# Étage R — RAG + INFER
Write-Host "[R] Extraction décisions via Gemini..."
& .\aegis-intelligence-infer.ps1 -Index $indexFile -ApiKey $env:GEMINI_API_KEY

# Étage S — STORE
Write-Host "[S] Sauvegarde BD décisionnelle..."
& .\aegis-intelligence-store.ps1 -Digest $digestFile

# Étage N — NOTIFY
if (-not $SkipNotify) {
    Write-Host "[N] Envoi notification V&V..."
    & .\aegis-intelligence-notify.ps1 -Digest $digestFile -To "jpcharles@gmail.com"
}

Write-Host "[✓] Pipeline AEGIS Intelligence terminé. En attente validation JP."
```

### 4.2 Planification

| Tâche | Fréquence | Script |
|---|---|---|
| **Sync sources** | Toutes les 15 min | `aegis-sync-hub.ps1` (existant) |
| **Pipeline AEGIS Intelligence** | 1x/jour à 07:00 CET | `aegis-intelligence-engine.ps1` (nouveau) |
| **Digest hebdomadaire** | Dimanche 20:00 CET | `aegis-intelligence-engine.ps1 -WeeklyDigest` |

### 4.3 Registre des scripts

| Script | Lignes estimées | État | Dépendances |
|---|---|---|---|
| `aegis-sync-hub.ps1` | ~450 (existant v1.0.3) | Opérationnel | OAuth Google, PS 7.5.4 |
| `aegis-intelligence-index.ps1` | ~150 (nouveau) | À développer | collect_manifest.json |
| `aegis-intelligence-infer.ps1` | ~300 (nouveau) | À développer | Gemini API, index JSON |
| `aegis-intelligence-store.ps1` | ~200 (nouveau) | À développer | Google Drive API |
| `aegis-intelligence-notify.ps1` | ~100 (nouveau) | À développer | Gmail API ou Chat webhook |
| `aegis-intelligence-engine.ps1` | ~80 (nouveau, orchestrateur) | À développer | Tous les précédents |

**Effort total estimé** : ~830 lignes PowerShell + ~4-6h développement AG sous supervision Claude.

---

## 5. TRAÇABILITÉ DYNAMIQUE

### 5.1 Chaîne de traçabilité complète

```
SOURCE BRUTE           AEGIS Intelligence         REGISTRE              PUBLICATION
                       (automatisé)               (validé JP)           (selon besoin)
                       
AG brain/ ─────┐       
Claude bridge ─┤       
ChatGPT export┤ →COLLECT→INDEX→INFER→STORE→NOTIFY→ JP V&V → validated → jeanpierrecharles.com
Perplexity ────┤                                              ↓         ou
Chrome logs ───┤                                      REGISTRE_TRACABILITE  AEGIS CIRCULAR
Mistral ───────┘                                              ↓
                                                      LIFECYCLE MASTER
                                                              ↓
                                                      Daily Bridge (enrichi)
```

### 5.2 Identifiants de traçabilité

Chaque extraction reçoit un ID unique :

```
AEGIS-INT-{SOURCE}-{DATE}-{SEQ}

Exemples :
  AEGIS-INT-AGBRAIN-20260220-001    ← 1ère extraction brain/ AG du 20/02
  AEGIS-INT-BRIDGE-20260220-003    ← 3ème extraction bridge du 20/02
  AEGIS-INT-CHATGPT-20260220-012  ← 12ème extraction ChatGPT du 20/02
```

Ces IDs sont référencés dans :
- Le `decisions_register.json` (BD décisionnelle)
- Le REGISTRE_TRACABILITE (Google Doc)
- Les Daily Bridge (section "Contexte hérité AEGIS Intelligence")

### 5.3 Publication conditionnelle

| Type de contenu | Destination | Condition |
|---|---|---|
| Veille réglementaire (EU AI Act, Battery Reg...) | jeanpierrecharles.com (blog/articles) | JP marque "publish_site" |
| Analyse sectorielle (batteries, Digital Twin...) | AEGIS CIRCULAR (base de connaissances) | JP marque "publish_platform" |
| Insights internes (patterns d'erreur, décisions...) | REGISTRE interne uniquement | Par défaut — jamais publié |
| Alertes urgentes (deadline réglementaire, breaking news) | Email JP immédiat | Confidence > 90% ET type = "regulatory_deadline" |

---

## 6. PLAN DE DÉVELOPPEMENT INCRÉMENTAL

### Phase 0 — Validation concept (cette semaine, ~1h JP)

- [ ] JP valide cette architecture
- [ ] JP confirme le canal de notification (email vs Google Chat)
- [ ] JP vérifie que GEMINI_API_KEY est accessible depuis PowerShell ($env:GEMINI_API_KEY)
- [ ] Créer la structure dossier `01_Projets_Actifs/AEGIS_Intelligence/` dans Google Drive

### Phase 1 — MVP Collect + Index (sprint courant si marge, sinon mars)

- [ ] Étendre aegis-sync-hub.ps1 → v1.1.0 avec `-CollectNew` et manifest JSON
- [ ] Développer `aegis-intelligence-index.ps1` (classification auto)
- [ ] Test : exécuter sur les fichiers brain/ AG existants
- [ ] Valider : l'index produit est-il utile ? JP review

### Phase 2 — Inférence Gemini (mars 2026)

- [ ] Développer `aegis-intelligence-infer.ps1` avec prompts structurés
- [ ] Calibrer les prompts sur 5-10 fichiers manuellement (few-shot)
- [ ] Test : comparer extraction Gemini vs lecture manuelle JP
- [ ] Valider : le gain de temps justifie-t-il le coût tokens Gemini ?

### Phase 3 — Store + Notify + V&V (mars-avril 2026)

- [ ] Développer `aegis-intelligence-store.ps1` (BD Drive)
- [ ] Développer `aegis-intelligence-notify.ps1` (email quotidien)
- [ ] Développer `aegis-intelligence-engine.ps1` (orchestrateur)
- [ ] Créer la tâche planifiée Windows `AEGIS-Intelligence-Daily`
- [ ] Test : 7 jours de fonctionnement continu
- [ ] Valider : JP confirme que 10-15 min/jour suffisent pour la V&V

### Phase 4 — Publication + Cross-source (avril-mai 2026)

- [ ] Connecter les publications validées au CMS jeanpierrecharles.com
- [ ] Intégrer Perplexity et Mistral comme sources additionnelles
- [ ] Implémenter le Contradiction Detector cross-source (B6)
- [ ] Métriques : taux d'approbation JP, temps V&V, contradictions détectées

---

## 7. COÛTS ET RESSOURCES

| Ressource | Coût | Déjà disponible ? |
|---|---|---|
| Gemini 2.0 Flash API (extraction ~10 fichiers/jour) | ~$0.02/jour (~$0.60/mois) | Oui (GEMINI_API_KEY) |
| Google Drive storage | Inclus Google One AI Pro 2TB | Oui |
| Gmail API (notifications) | Gratuit (même OAuth) | Oui (à activer scope) |
| PowerShell 7.5.4 | Gratuit | Oui |
| Temps développement (~830 lignes PS) | ~4-6h AG supervisé Claude | Budget sprint |
| Temps JP validation quotidienne | ~10-15 min/jour | Investissement cognitif réduit vs aujourd'hui |

**ROI estimé** : JP passe actuellement ~45-60 min/jour en lecture cross-source manuelle et mémorisation. Le pipeline ramène ça à ~10-15 min de validation structurée. Gain net : ~30-45 min/jour = ~10-15h/mois redirigées vers développement et commercial.

---

## 8. RISQUES ET GARDE-FOUS

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Gemini hallucine des "décisions" inexistantes | Moyenne | Élevé | Temperature 0.1 + cross-vérification + JP valide TOUT |
| Sur-ingénierie avant product-market fit | Moyenne | Moyen | Phases incrémentales — Phase 1 MVP d'abord |
| Tokens Gemini insuffisants pour batch quotidien | Faible | Moyen | Monitoring coût + fallback extraction manuelle |
| AG brain/ change de format silencieusement | Moyenne | Moyen | Versionner le parser + test de régression index |
| JP ne valide pas (notification ignorée) | Faible | Élevé | Escalade : rappel J+1, consolidation hebdo dimanche |
| Secrets dans les fichiers analysés par Gemini | Moyenne | Critique | PII scrubber AVANT envoi API — pattern grep .env, API_KEY, token |

---

## 9. DÉCISION REQUISE

**Questions à JP pour avancer** :

1. **Architecture globale** : cette approche CIRSN-V (Collect-Index-Infer-Store-Notify + Validate) est-elle alignée avec ta vision ?
2. **Canal notification** : email quotidien ou Google Chat webhook ?
3. **BD format** : JSON dans Drive (léger, compatible tous agents) ou Google Sheets (plus visuel, mais moins programmatique) ?
4. **Priorité développement** : Phase 1 maintenant (dans le sprint v3.1) ou après déploiement production ?
5. **Scope R1.1** : on maintient l'audit manuel brain/ comme prévu, en le considérant comme la "Phase 0 de calibration" du pipeline ?

---

## TRAÇABILITÉ

- **Source** : Demande JP 20260220T1645 — alignement nommage + pipeline semi-automatisé
- **Contexte KB** : RAG ChatGPT Synthèse (pipeline E1-E8), LIFECYCLE MASTER (L1-L19), SKILL aegis-sync-hub, Migration Gouvernance v2
- **Mémoire Claude** : Sessions 16-20/02/2026, audit filesystem, bridge streaming fix
- **Prédécesseur** : RECO_AEGIS_INTELLIGENCE_AG_EPISODIC_MEMORY_20260220T1645.md
- **À inscrire** : AEGIS_REGISTRE_TRACABILITE — "AEGIS Intelligence Pipeline CIRSN-V — Architecture v1.0"
