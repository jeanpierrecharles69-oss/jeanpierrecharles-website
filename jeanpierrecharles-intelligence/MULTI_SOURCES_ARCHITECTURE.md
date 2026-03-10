# JEANPIERRECHARLES INTELLIGENCE - ARCHITECTURE MULTI-SOURCES

## 🌐 Vision Globale

Le système JeanPierreCharles Intelligence agrège et analyse **toutes vos sources de recherche et consultation** :

- **Navigateurs classiques** : Chrome, Firefox, Edge, Brave
- **AI Assistants** : Claude.ai, Perplexity.ai, Gemini, ChatGPT
- **Outils spécialisés** : Notion, Obsidian, etc.

## 🏗️ Architecture Unifiée

```text
┌─────────────────────────────────────────────────────────────────┐
│                    LAYER 1 : CAPTURE                            │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  Browsers   │  │ AI Assistants│  │   Other     │            │
│  │  Connectors │  │  Connectors  │  │ Connectors  │            │
│  └──────┬──────┘  └──────┬───────┘  └──────┬──────┘            │
│         │                 │                  │                   │
│    Chrome, Firefox   Claude, Perplexity   Notion, etc.          │
└─────────┴─────────────────┴──────────────────┴──────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│               LAYER 1.5 : SÉCURITÉ (P0)                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PII Filter     → OAuth tokens, session IDs, emails     │  │
│  │  URL Sanitizer  → Suppression paramètres sensibles      │  │
│  │  Data Retention → Purge automatique configurable         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   UNIFIED DATA PIPELINE                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Normalization Layer                                      │  │
│  │  → Convertit tous les formats vers un schema unique      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              FastAPI REST SERVER + STORAGE                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Phase 0-1 : SQLite + JSON chiffrés Fernet (AES-128-CBC)     │  │
│  │  Phase 2+  : Supabase + Gemini Embeddings                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

> ⚠️ **Mise à jour 13/02/2026** : Architecture révisée suite à la contre-expertise Claude Opus.
> Le MCP Server / Claude Desktop est remplacé par FastAPI REST (compatibilité ARM64, indépendance Claude Desktop).

### Architecture cible recommandée

| Composant | Conversation source | Recommandation (contre-expertise) |
|-----------|--------------------|---------------------------------|
| **Runtime** | Node.js + MCP SDK | Python 3.12+ (natif ARM64, aligné Aegis) |
| **Serveur** | MCP Server Fastify | FastAPI (REST, compatible claude.ai) |
| **Base de données** | PostgreSQL + Qdrant | SQLite (Phase 0-1) puis Supabase (Phase 2+) |
| **Cache** | Redis | Fichiers JSON chiffrés (Phase 0-1) puis Redis (Phase 2+) |
| **Embeddings** | OpenAI text-embedding-3 | Gemini 2.0 Flash embeddings (aligné Google One AI Pro) |
| **Interface** | Claude Desktop MCP | API REST + Dashboard React via Vercel |
| **CI/CD** | Non spécifié | GitHub Actions → Vercel (pipeline existant) |

## 📊 Schema de Données Unifié

Tous les connecteurs produisent le même format :

```typescript
interface UnifiedCapture {
  // Métadonnées source
  source: {
    type: 'browser' | 'ai-assistant' | 'other';
    name: 'chrome' | 'firefox' | 'perplexity' | 'claude' | ...;
    version?: string;
  };
  
  // Contenu
  content: {
    url?: string;              // Pour navigateurs
    title: string;
    text: string;              // Texte nettoyé
    htmlSnapshot?: string;     // HTML brut (optionnel)
  };
  
  // Métadonnées temporelles
  timestamp: Date;
  duration?: number;           // Secondes
  
  // Classification automatique
  category: string;
  tags: string[];
  
  // Contexte spécifique
  context?: {
    query?: string;            // Pour Perplexity/Google
    conversation?: string;     // Pour Claude/ChatGPT
    references?: string[];     // URLs citées
  };
}
```

## 🔌 Connecteurs par Source

### 1. NAVIGATEURS (Chrome, Firefox, Edge, Brave)

**Méthode 1 : Analyse rétrospective SQLite**

Chaque navigateur stocke son historique dans une BDD SQLite locale :

```
Chrome:    %LOCALAPPDATA%\Google\Chrome\User Data\Default\History
Firefox:   %APPDATA%\Mozilla\Firefox\Profiles\*.default\places.sqlite
Edge:      %LOCALAPPDATA%\Microsoft\Edge\User Data\Default\History
Brave:     %LOCALAPPDATA%\BraveSoftware\Brave-Browser\User Data\Default\History
```

**Implementation** :

```python
# browser_history_analyzer.py (Phase 1)
class BrowserHistoryAnalyzer:
    BROWSERS = {
        'chrome': {...},
        'firefox': {...},
        'edge': {...},
        'brave': {...}
    }
    
    def analyze_all_browsers(self, start_date, end_date):
        unified_history = []
        
        for browser_name, config in self.BROWSERS.items():
            history = self.extract_browser_history(
                browser_name, 
                config, 
                start_date, 
                end_date
            )
            unified_history.extend(history)
        
        return self.merge_and_deduplicate(unified_history)
```

**Méthode 2 : Extension/Add-on temps réel** (Phase 2)

Extensions pour chaque navigateur qui envoient au MCP Server :

- Chrome : Extension Manifest V3
- Firefox : WebExtension
- Edge : Extension compatible Chrome
- Brave : Extension compatible Chrome

### 2. PERPLEXITY.AI

**Méthode 1 : Export manuel périodique**

Perplexity n'a pas d'API publique, mais permet l'export :

1. User exporte ses conversations Perplexity (JSON)
2. Script Python parse le fichier
3. Extraction des queries + réponses + sources citées

**Format Perplexity** :

```json
{
  "conversations": [
    {
      "id": "...",
      "created_at": "2026-02-03T10:00:00Z",
      "messages": [
        {
          "role": "user",
          "content": "What are the latest AI regulations?"
        },
        {
          "role": "assistant",
          "content": "...",
          "sources": [
            {"url": "...", "title": "..."}
          ]
        }
      ]
    }
  ]
}
```

**Parser** :

```python
class PerplexityConnector:
    def parse_export(self, json_file):
        data = json.load(json_file)
        
        captures = []
        for conv in data['conversations']:
            for msg in conv['messages']:
                if msg['role'] == 'user':
                    # Query de l'utilisateur
                    captures.append({
                        'source': {'type': 'ai-assistant', 'name': 'perplexity'},
                        'content': {
                            'title': msg['content'][:100],
                            'text': msg['content']
                        },
                        'timestamp': conv['created_at'],
                        'context': {'query': msg['content']}
                    })
                    
                if msg.get('sources'):
                    # Sources citées
                    for source in msg['sources']:
                        captures.append({
                            'source': {'type': 'ai-assistant', 'name': 'perplexity'},
                            'content': {
                                'url': source['url'],
                                'title': source['title'],
                                'text': ''  # Peut être fetchée
                            },
                            'context': {'query': msg['content']}
                        })
        
        return captures
```

**Méthode 2 : Browser extension avec détection Perplexity** (Future)

Extension qui détecte quand on est sur perplexity.ai et capture le DOM.

### 3. CLAUDE.AI

**Méthode 1 : Export conversations**

Claude.ai permet l'export des conversations en Markdown :

1. Settings → Export data
2. Download ZIP avec tous les .md
3. Parser les fichiers

**Format Claude** :

```markdown
# Conversation with Claude
**Date**: 2026-02-03

## User
Tell me about AI compliance

## Claude
[Réponse détaillée...]
```

**Parser** :

```python
class ClaudeConnector:
    def parse_conversation(self, md_content):
        # Regex pour extraire user queries et réponses
        pattern = r'## User\n(.*?)\n\n## Claude\n(.*?)(?=\n## User|\Z)'
        matches = re.findall(pattern, md_content, re.DOTALL)
        
        captures = []
        for user_query, claude_response in matches:
            captures.append({
                'source': {'type': 'ai-assistant', 'name': 'claude'},
                'content': {
                    'title': user_query[:100],
                    'text': f"Q: {user_query}\n\nA: {claude_response}"
                },
                'context': {'conversation': user_query}
            })
        
        return captures
```

**Méthode 2 : Export claude.ai (API REST — Phase 2)**

Si claude.ai expose une API pour accéder aux conversations exportées.

### 4. GEMINI (Google AI)

**Méthode 1 : Google Takeout**

1. takeout.google.com
2. Sélectionner "Gemini activity"
3. Download archive
4. Parser JSON

**Méthode 2 : Browser extension sur gemini.google.com**

Similaire à Perplexity, capture DOM sur gemini.google.com.

### 5. CHATGPT (OpenAI)

**Méthode : Export conversations**

ChatGPT permet l'export en JSON :

1. Settings → Data controls → Export data
2. Download JSON
3. Parser similaire à Perplexity

## 🔄 Workflow de Capture Multi-Sources

### Phase 1 : Collecte Manuelle + Automatique

```
┌─────────────────────────────────────────┐
│  CHAQUE SEMAINE                         │
│                                         │
│  1. Script auto : Navigateurs           │
│     → Lit SQLite databases              │
│                                         │
│  2. Export manuel : AI Assistants       │
│     → Perplexity (JSON)                 │
│     → Claude (MD)                       │
│     → Gemini (Takeout)                  │
│                                         │
│  3. Consolidation                       │
│     → Script Python unifie tout         │
│     → Génère rapport unique             │
└─────────────────────────────────────────┘
```

### Phase 2 : Capture Temps Réel (via FastAPI REST)

```text
┌─────────────────────────────────────────────────────────────────┐
│  EN CONTINU                                                     │
│                                                                  │
│  Browser Extensions                                             │
│  → Envoient au FastAPI Server en temps réel                    │
│                                                                  │
│  AI Assistant Monitors                                          │
│  → Détectent nouvelles conversations                           │
│  → Auto-sync périodique                                        │
│                                                                  │
│  FastAPI REST Server                                            │
│  → Reçoit tous les flux                                        │
│  → PII Filter → Normalise → Chiffre → Stocke                  │
└─────────────────────────────────────────────────────────────────┘
```

## 📋 Checklist de Support par Source

| Source | Phase 1 (Rétro) | Phase 2 (Temps réel) | Difficulté |
|--------|----------------|----------------------|------------|
| Chrome | ✅ SQLite | ✅ Extension | Facile |
| Firefox | ✅ SQLite | ✅ WebExtension | Facile |
| Edge | ✅ SQLite | ✅ Extension | Facile |
| Brave | ✅ SQLite | ✅ Extension | Facile |
| Perplexity | ✅ Export JSON | 🔜 DOM scraping | Moyen |
| Claude | ✅ Export MD | 🔜 API Desktop | Moyen |
| Gemini | ✅ Takeout | 🔜 DOM scraping | Moyen |
| ChatGPT | ✅ Export JSON | 🔜 API | Moyen |

## 🚀 Feuille de Route d'Implémentation

### Sprint 1 : Multi-Browser Support + Sécurité P0 (Semaine 1)

> **Prérequis ARM64** : Valider `sqlite3`, `cryptography`, `re` sur Surface Pro 11 Snapdragon X

```python
# Mise à jour browser_history_analyzer.py
import re
from cryptography.fernet import Fernet

class MultiBrowserAnalyzer:
    # Patterns PII à filtrer dans les URLs
    PII_PATTERNS = [
        r'(?:access_token|token|auth|session|sid)=[^&]+',
        r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',
        r'(?:key|apikey|api_key)=[^&]+',
    ]
    
    def __init__(self):
        self.browsers = {
            'chrome': ChromeHistoryReader(),
            'firefox': FirefoxHistoryReader(),
            'edge': EdgeHistoryReader(),
            'brave': BraveHistoryReader()
        }
        self.encryption_key = Fernet.generate_key()
    
    def sanitize_url(self, url: str) -> str:
        """Filtre les PII des URLs capturées"""
        for pattern in self.PII_PATTERNS:
            url = re.sub(pattern, '[FILTERED]', url)
        return url
    
    def analyze_all(self, start_date, end_date):
        all_history = []
        
        for browser_name, reader in self.browsers.items():
            try:
                history = reader.extract(start_date, end_date)
                # Filtrage PII sur chaque entrée
                for entry in history:
                    entry['url'] = self.sanitize_url(entry['url'])
                all_history.extend(history)
            except Exception as e:
                print(f"⚠️ {browser_name}: {e}")
        
        return self.deduplicate(all_history)
    
    def export_encrypted(self, data, output_path):
        """Export chiffré Fernet (AES-128-CBC) des données"""
        f = Fernet(self.encryption_key)
        encrypted = f.encrypt(json.dumps(data).encode())
        with open(output_path, 'wb') as file:
            file.write(encrypted)
```

### Sprint 2 : AI Assistants Export Parsers (Semaine 2)

```python
# ai_assistant_parsers.py
class PerplexityParser: ...
class ClaudeParser: ...
class GeminiParser: ...
class ChatGPTParser: ...

# Dans browser_history_analyzer.py
def analyze_all_sources(self, start_date, end_date):
    # Navigateurs
    browser_history = self.analyze_all_browsers(...)
    
    # AI Assistants (export manuels)
    perplexity_data = PerplexityParser().parse('exports/perplexity.json')
    claude_data = ClaudeParser().parse_directory('exports/claude/')
    gemini_data = GeminiParser().parse('exports/gemini.json')
    
    # Fusion
    unified = browser_history + perplexity_data + claude_data + gemini_data
    
    return self.merge_and_analyze(unified)
```

### Sprint 3 : Dashboard Multi-Sources (Semaine 3)

Ajout dans le dashboard d'une vue par source :

```javascript
// Filtre par source
<select onChange={filterBySource}>
  <option value="all">Toutes sources</option>
  <option value="chrome">Chrome</option>
  <option value="firefox">Firefox</option>
  <option value="perplexity">Perplexity</option>
  <option value="claude">Claude</option>
</select>

// Stats par source
<div className="stats-grid">
  {Object.entries(statsBySource).map(([source, stats]) => (
    <StatCard 
      source={source}
      count={stats.count}
      timeSpent={stats.timeSpent}
    />
  ))}
</div>
```

## 💡 Avantages de l'Architecture Multi-Sources

### 1. Vue Unifiée

**Avant** : Données fragmentées

- Historique Chrome : 150 pages
- Conversations Perplexity : 25 queries
- Sessions Claude : 10 conversations

**Après** : Vue consolidée

- **185 interactions** totales analysées
- Détection de patterns cross-sources
- Insights sur répartition des outils

### 2. Intelligence Augmentée

**Exemple** :

```
Détection : Même sujet recherché sur 3 sources différentes
- Chrome : "GDPR compliance tools" (3 articles)
- Perplexity : "Best GDPR software" (1 query)
- Claude : "Help me understand GDPR" (1 conversation)

→ Signal fort : Intérêt majeur pour GDPR
→ Recommandation : Approfondir ce sujet
```

### 3. Métriques Comparatives

```markdown
## Répartition de vos Recherches (Semaine 05)

- **Navigateurs** : 65% (Chrome 40%, Firefox 25%)
- **AI Assistants** : 35% (Perplexity 20%, Claude 15%)

**Insight** : Vous utilisez principalement Perplexity pour
la recherche exploratoire, puis Chrome pour l'approfondissement.
```

## 🔧 Configuration Utilisateur

Fichier `sources_config.json` :

```json
{
  "browsers": {
    "chrome": { "enabled": true, "priority": 1 },
    "firefox": { "enabled": true, "priority": 2 },
    "edge": { "enabled": false },
    "brave": { "enabled": false }
  },
  "ai_assistants": {
    "perplexity": { 
      "enabled": true, 
      "export_path": "C:\\Users\\JP\\Downloads\\perplexity_export.json"
    },
    "claude": { 
      "enabled": true,
      "export_path": "C:\\Users\\JP\\Downloads\\claude_conversations\\"
    },
    "gemini": { "enabled": false },
    "chatgpt": { "enabled": false }
  },
  "sync_frequency": "weekly",
  "auto_categorize": true
}
```

---

**Version** : 2.0  
**Date** : 13 février 2026  
**Mise à jour** : Intégration contre-expertise Claude Opus 4.6 (sécurité P0, architecture FastAPI, ARM64)  
**Projet** : JeanPierreCharles Intelligence  
**Référence** : [contre-expertise-jpc-intelligence.md](contre-expertise-jpc-intelligence.md)
