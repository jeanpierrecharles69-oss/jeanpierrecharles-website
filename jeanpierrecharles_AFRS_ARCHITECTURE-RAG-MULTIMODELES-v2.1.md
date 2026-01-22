# 🏗️ Architecture RAG Multi-Modèles - Aegis Platform

**Date**: 22 janvier 2026  
**Version**: 1.0  
**Objectif**: Architecture technique pour RAG avec 8 modules réglementaires EU

---

## 📊 MODULES RÉGLEMENTAIRES COMPLETS

### Configuration Actuelle (6 modules)

1. ✅ **AI Act** (2024/1689) - Deployed
2. ✅ **GDPR** (2016/679) - Deployed
3. ✅ **Data Act** (2023/2854) - Deployed
4. ✅ **CRA** (Cyber Resilience Act 2024/2847) - Deployed
5. ✅ **Machines** (2023/1230) - Deployed
6. ✅ **ESPR** (2024/1781) - Deployed

### Extension Recommandée (+2 modules)

1. ⏳ **CPR** (Construction Products Regulation 305/2011) - To Deploy
2. ⏳ **Batteries** (2023/1542) - To Deploy

---

## 🤖 ANALYSE COMPARATIVE: Moteurs IA pour RAG

### Benchmark: Gemini vs Claude vs Mistral

| Critère | Gemini 1.5 Flash | Claude 3.5 Sonnet | Mistral Large 2 | Recommandation |
| :--- | :--- | :--- | :--- | :--- |
| **Stabilité** | ⭐⭐⭐⭐⭐ GA stable | ⭐⭐⭐⭐⭐ Production | ⭐⭐⭐⭐ Stable | Gemini/Claude |
| **Coût (1M tokens)** | $0.075 input / $0.30 output | $3.00 input / $15.00 output | $2.00 input / $6.00 output | **Gemini** 40x moins cher |
| **Context Window** | 1M tokens | 200K tokens | 128K tokens | **Gemini** (documents longs) |
| **Latence** | ~500ms | ~800ms | ~600ms | **Gemini** (plus rapide) |
| **Qualité RAG** | ⭐⭐⭐⭐ Très bon | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Très bon | **Claude** (nuances) |
| **Citations sources** | ⭐⭐⭐⭐ Bon | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐ Correct | **Claude** |
| **Multilanguage (FR/EN)** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Très bon | Gemini/Claude |
| **EU Compliance** | ⭐⭐⭐⭐ RGPD OK | ⭐⭐⭐⭐⭐ RGPD + Anthropic Claude EU | ⭐⭐⭐⭐ RGPD OK | **Claude** (EU-hosted) |
| **API Disponibilité** | ⭐⭐⭐⭐⭐ 99.9% SLA | ⭐⭐⭐⭐⭐ 99.9% SLA | ⭐⭐⭐⭐ 99.5% | Gemini/Claude |

### 🏆 Recommandation Finale

**Architecture Hybride Recommandée**:

```typescript
// Configuration optimale coût/qualité
const RAG_CONFIG = {
  // Moteur PRINCIPAL: Gemini 1.5 Flash
  primaryEngine: {
    name: "gemini-1.5-flash",
    usage: "80% requêtes (routine, questionnaires standards)",
    cost: "~$50/mois (100K requêtes)",
    temperature: 0.1
  },
  
  // Moteur PREMIUM: Claude 3.5 Sonnet
  premiumEngine: {
    name: "claude-3.5-sonnet",
    usage: "20% requêtes (analyses complexes, audits critiques)",
    cost: "~$150/mois (5K requêtes premium)",
    temperature: 0.0,
    triggerCriteria: [
      "Audit complet conformité",
      "Analyse multi-réglementaire complexe",
      "Génération documentation technique critique"
    ]
  },
  
  // Fallback: Mistral Large 2
  fallbackEngine: {
    name: "mistral-large-2",
    usage: "Si Gemini/Claude indisponibles",
    cost: "Backup uniquement"
  }
}
```

**Coût mensuel estimé**: $200/mois (vs $3000+ avec Claude seul)

---

## 🏗️ ARCHITECTURE TECHNIQUE RAG (8 Modules)

### Stack Recommandée

```typescript
// Stack complète RAG
interface RAGStack {
  // Bases de données vectorielles
  vectorDB: "Supabase pgvector" | "ChromaDB" | "Pinecone";
  
  // Embeddings
  embeddings: {
    provider: "Google text-embedding-004" | "OpenAI text-embedding-3-large";
    dimensions: 768 | 1536;
    cost: "$0.00002/1K tokens";
  };
  
  // Document Processing
  ingestion: {
    sources: ["EUR-Lex PDFs", "Official Journals", "CJEU Decisions"];
    chunking: {
      strategy: "semantic" | "fixed";
      chunkSize: 1000; // tokens
      overlap: 200;
    };
  };
  
  // LLM Orchestration
  llm: {
    primary: "gemini-1.5-flash";
    premium: "claude-3.5-sonnet";
    routing: "smart-routing-by-complexity";
  };
}

// Configuration recommandée Aegis
const AEGIS_RAG_CONFIG: RAGStack = {
  vectorDB: "Supabase pgvector", // Déjà utilisé pour DB
  
  embeddings: {
    provider: "Google text-embedding-004",
    dimensions: 768,
    cost: "$0.00002/1K tokens" // Ultra économique
  },
  
  ingestion: {
    sources: [
      "EUR-Lex PDFs (8 règlements)",
      "Guides Commission EU",
      "FAQ officielles"
    ],
    chunking: {
      strategy: "semantic", // Découpage intelligent par section
      chunkSize: 1000,
      overlap: 200
    }
  },
  
  llm: {
    primary: "gemini-1.5-flash",
    premium: "claude-3.5-sonnet",
    routing: "smart-routing-by-complexity"
  }
}
```

---

## 📋 MODULES DÉTAILLÉS (8 Réglementations)

### Module 1: AI Act 🤖

```typescript
const AI_ACT_CONFIG = {
  regulation: {
    id: "2024/1689",
    name: "AI Act (Artificial Intelligence Regulation)",
    dateApplication: "2 août 2026 (haut risque)",
    knowledgeBase: {
      mainDoc: "eur-lex.europa.eu/eli/reg/2024/1689/oj",
      annexes: ["Annex I (AI Systems)", "Annex III (High-Risk)"],
      guidelines: ["Commission Guidelines on Risk Classification"]
    }
  },
  
  ragConfig: {
    engine: "gemini-1.5-flash", // Routine OK
    chunks: 250, // Estimation (174 articles)
    specialCases: {
      "Classification High-Risk": "claude-3.5-sonnet", // Critique
      "Prohibited Practices": "claude-3.5-sonnet"
    }
  }
}
```

### Module 2: GDPR 🔒

```typescript
const GDPR_CONFIG = {
  regulation: {
    id: "2016/679",
    name: "General Data Protection Regulation",
    dateApplication: "25 mai 2018",
    amendments: ["2023 guidelines CNIL", "EDPB recommendations"],
    knowledgeBase: {
      mainDoc: "eur-lex.europa.eu/eli/reg/2016/679/oj",
      caselaw: ["CJEU Schrems II", "CJEU TikTok"],
      nationalLaws: ["Loi Informatique et Libertés (France)"]
    }
  },
  
  ragConfig: {
    engine: "gemini-1.5-flash",
    chunks: 200, // 99 articles
    specialCases: {
      "DPIA (Art 35)": "claude-3.5-sonnet", // Analyse complexe
      "Transferts hors-UE (Ch V)": "claude-3.5-sonnet"
    }
  }
}
```

### Module 3: Data Act 📊

```typescript
const DATA_ACT_CONFIG = {
  regulation: {
    id: "2023/2854",
    name: "Data Act",
    dateApplication: "12 septembre 2025",
    knowledgeBase: {
      mainDoc: "eur-lex.europa.eu/eli/reg/2023/2854/oj",
      guidelines: ["Commission FAQ", "Industrial IoT Guidelines"]
    }
  },
  
  ragConfig: {
    engine: "gemini-1.5-flash",
    chunks: 150, // Moins complexe que AI Act
    specialCases: {
      "Data Portability (Ch II)": "gemini-1.5-flash" // OK standard
    }
  }
}
```

### Module 4: CRA (Cyber Resilience Act) 🛡️

```typescript
const CRA_CONFIG = {
  regulation: {
    id: "2024/2847",
    name: "Cyber Resilience Act",
    dateApplication: "Décembre 2027 (estimé)",
    knowledgeBase: {
      mainDoc: "eur-lex.europa.eu/eli/reg/2024/2847/oj",
      standards: ["EN 18045 (Security)", "IEC 62443"],
      sbom: ["CycloneDX", "SPDX formats"]
    }
  },
  
  ragConfig: {
    engine: "gemini-1.5-flash",
    chunks: 180,
    specialCases: {
      "Critical Products (Annex III)": "claude-3.5-sonnet",
      "Vulnerability Disclosure": "claude-3.5-sonnet"
    }
  }
}
```

### Module 5: Règlement Machines ⚙️

```typescript
const MACHINES_CONFIG = {
  regulation: {
    id: "2023/1230",
    name: "Machinery Regulation",
    dateApplication: "14 janvier 2027",
    knowledgeBase: {
      mainDoc: "eur-lex.europa.eu/eli/reg/2023/1230/oj",
      standards: ["EN ISO 12100 (Safety)", "EN 60204-1"],
      guidanceNotes: ["Blue Guide 2022"]
    }
  },
  
  ragConfig: {
    engine: "gemini-1.5-flash",
    chunks: 160,
    specialCases: {
      "Essential Safety Requirements": "gemini-1.5-flash" // Standard OK
    }
  }
}
```

### Module 6: ESPR (Ecodesign) ♻️

```typescript
const ESPR_CONFIG = {
  regulation: {
    id: "2024/1781",
    name: "Ecodesign for Sustainable Products Regulation",
    dateApplication: "18 juillet 2024 (cadre général)",
    delegatedActs: [
      "Smartphones (2025)",
      "Textiles (2026)",
      "Furniture (2027)"
    ],
    knowledgeBase: {
      mainDoc: "eur-lex.europa.eu/eli/reg/2024/1781/oj",
      productSpecific: ["DPP Templates", "PEF/OEF Guidelines"]
    }
  },
  
  ragConfig: {
    engine: "gemini-1.5-flash",
    chunks: 140,
    specialCases: {
      "Digital Product Passport": "claude-3.5-sonnet", // Complexe
      "Performance Classes": "gemini-1.5-flash"
    }
  }
}
```

### Module 7: CPR (Construction Products) 🏗️ **NOUVEAU**

```typescript
const CPR_CONFIG = {
  regulation: {
    id: "305/2011",
    name: "Construction Products Regulation",
    dateApplication: "1 juillet 2013 (v1) + CPR 2.0 attendu 2026",
    knowledgeBase: {
      mainDoc: "eur-lex.europa.eu/eli/reg/2011/305/oj",
      harmonizedStandards: ["EN 13501 (Fire)", "EN 15804 (EPD)"],
      technicalAssessments: ["ETA Guidelines"]
    }
  },
  
  ragConfig: {
    engine: "gemini-1.5-flash",
    chunks: 120,
    specialCases: {
      "DoP (Declaration of Performance)": "gemini-1.5-flash",
      "CE Marking Construction": "gemini-1.5-flash"
    }
  }
}
```

### Module 8: Batteries 🔋 **NOUVEAU**

```typescript
const BATTERIES_CONFIG = {
  regulation: {
    id: "2023/1542",
    name: "Batteries Regulation",
    dateApplication: "18 février 2024 (progressif jusqu'à 2028)",
    knowledgeBase: {
      mainDoc: "eur-lex.europa.eu/eli/reg/2023/1542/oj",
      specificRequirements: [
        "Battery Passport (2026)",
        "Recycled Content (2027)",
        "Carbon Footprint Declaration (2028)"
      ]
    }
  },
  
  ragConfig: {
    engine: "gemini-1.5-flash",
    chunks: 110,
    specialCases: {
      "Battery Passport": "claude-3.5-sonnet", // Nouveau concept
      "LCA Requirements": "gemini-1.5-flash"
    }
  }
}
```

---

## 💻 IMPLÉMENTATION: Smart Routing

### Code TypeScript Recommandé

```typescript
// services/ragService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";

interface RAGQuery {
  userQuestion: string;
  regulation: "AI_ACT" | "GDPR" | "DATA_ACT" | "CRA" | "MACHINES" | "ESPR" | "CPR" | "BATTERIES";
  complexity: "simple" | "medium" | "complex";
  premium: boolean; // User paywall tier
}

interface RAGResponse {
  answer: string;
  sources: Source[];
  engine: "gemini" | "claude";
  confidence: number;
}

class SmartRAGRouter {
  private gemini: GoogleGenerativeAI;
  private claude: Anthropic;
  
  constructor() {
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    this.claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  }
  
  /**
   * Détermine quel moteur utiliser selon complexité et budget
   */
  private async selectEngine(query: RAGQuery): Promise<"gemini" | "claude"> {
    // RÈGLE 1: Utilisateur Premium → Peut accéder à Claude
    if (!query.premium) {
      return "gemini"; // Free tier = Gemini uniquement
    }
    
    // RÈGLE 2: Complexité élevée → Claude recommandé
    if (query.complexity === "complex") {
      return "claude";
    }
    
    // RÈGLE 3: Cas spéciaux par règlement
    const complexTopics = {
      "AI_ACT": ["classification high-risk", "prohibited practices"],
      "GDPR": ["dpia", "transferts hors-ue"],
      "CRA": ["critical products", "vulnerability disclosure"],
      "ESPR": ["digital product passport"],
      "BATTERIES": ["battery passport"]
    };
    
    const keywords = complexTopics[query.regulation] || [];
    const isComplexTopic = keywords.some(keyword => 
      query.userQuestion.toLowerCase().includes(keyword)
    );
    
    if (isComplexTopic) {
      return "claude";
    }
    
    // RÈGLE 4: Par défaut → Gemini (80% cas d'usage)
    return "gemini";
  }
  
  /**
   * Execute RAG query with selected engine
   */
  async query(query: RAGQuery): Promise<RAGResponse> {
    const engine = await this.selectEngine(query);
    
    // 1. Retrieve relevant chunks from vector DB
    const relevantChunks = await this.retrieveFromVectorDB(
      query.userQuestion,
      query.regulation
    );
    
    // 2. Build context-enhanced prompt
    const enhancedPrompt = this.buildRAGPrompt(
      query.userQuestion,
      relevantChunks
    );
    
    // 3. Query selected LLM
    if (engine === "gemini") {
      return this.queryGemini(enhancedPrompt, relevantChunks);
    } else {
      return this.queryClaude(enhancedPrompt, relevantChunks);
    }
  }
  
  private async queryGemini(prompt: string, sources: Source[]): Promise<RAGResponse> {
    const model = this.gemini.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048
      },
      systemInstruction: GEMINI_SYSTEM_PROMPT
    });
    
    const result = await model.generateContent(prompt);
    const answer = result.response.text();
    
    return {
      answer,
      sources,
      engine: "gemini",
      confidence: 0.85 // Estimé
    };
  }
  
  private async queryClaude(prompt: string, sources: Source[]): Promise<RAGResponse> {
    const message = await this.claude.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      temperature: 0,
      system: CLAUDE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }]
    });
    
    const answer = message.content[0].type === "text" 
      ? message.content[0].text 
      : "";
    
    return {
      answer,
      sources,
      engine: "claude",
      confidence: 0.95 // Claude = plus précis
    };
  }
  
  private async retrieveFromVectorDB(
    question: string,
    regulation: string
  ): Promise<Source[]> {
    // TODO: Implement avec Supabase pgvector
    // 1. Embed question avec Google text-embedding-004
    // 2. Similarity search dans regulation spécifique
    // 3. Return top 5 chunks
    return [];
  }
  
  private buildRAGPrompt(question: string, chunks: Source[]): string {
    const context = chunks.map(c => `[${c.article}] ${c.content}`).join("\n\n");
    
    return `
CONTEXTE RÉGLEMENTAIRE:
${context}

QUESTION UTILISATEUR:
${question}

INSTRUCTIONS:
1. Répondre en citant précisément les articles
2. Si incertitude, le mentionner explicitement
3. Fournir sources EUR-Lex
`;
  }
}

// Export singleton
export const ragRouter = new SmartRAGRouter();
```

---

## 📊 COÛTS ESTIMÉS (Architecture Hybride)

### Scénario: 10 000 requêtes/mois

| Engine | % Requêtes | Tokens/requête | Coût unitaire | Coût mensuel |
| :--- | :--- | :--- | :--- | :--- |
| Gemini 1.5 Flash | 80% (8000 req) | 2000 tok | $0.00015 | **$120** |
| Claude 3.5 Sonnet | 20% (2000 req) | 2500 tok | $0.018 | **$360** |
| Embeddings (Google) | 100% | 500 tok | $0.00001 | **$5** |
| **TOTAL** | | | | **$485/mois** |

**vs Claude seul**: $1800/mois (économie de **73%**)

---

## 🎯 RECOMMANDATIONS FINALES

### Architecture Optimale pour Aegis

1. **Moteur Principal**: **Gemini 1.5 Flash**
   - Stabilité prouvée
   - Coût ultra-compétitif
   - Context window 1M tokens (docs EU longs)
   - Température 0.1 = déterminisme

2. **Moteur Premium**: **Claude 3.5 Sonn et**
   - Analyses critiques (DPIA, High-Risk AI)
   - Citations sources supérieures
   - Disponible tier Premium uniquement
   - Température 0.0 = maximum précision

3. **Fallback**: **Mistral Large 2**
   - Si Gemini/Claude indisponibles
   - Coût intermédiaire
   - Performance acceptable

4. **Vector DB**: **Supabase pgvector**
   - Déjà dans votre stack
   - Économie d'infrastructure
   - PostgreSQL = robustesse

5. **Embeddings**: **Google text-embedding-004**
   - $0.00002/1K tokens (ultra-économique)
   - Dimensions 768 (optimal pour pgvector)
   - Compatible multilangue (FR/EN)

### Roadmap Implémentation

**Phase 1 (Semaines 1-4)**: RAG Foundation

- [ ] Setup Supabase pgvector
- [ ] Ingestion 6 règlements existants (AI Act → ESPR)
- [ ] Test Gemini 1.5 Flash uniquement

**Phase 2 (Semaines 5-8)**: Dual Engine

- [ ] Intégration Claude 3.5 Sonnet
- [ ] Smart routing logic
- [ ] A/B testing Gemini vs Claude

**Phase 3 (Semaines 9-12)**: Extension Modules

- [ ] Ajout CPR (Construction)
- [ ] Ajout Batteries
- [ ] Optimisation coûts

**Phase 4 (Mois 4+)**: Continuous Update

- [ ] Pipeline automatique EUR-Lex
- [ ] Monitoring qualité réponses
- [ ] User feedback loop

---

## 📚 RESSOURCES TECHNIQUES

### APIs Documentation

- **Gemini**: <https://ai.google.dev/docs/gemini_api_overview>
- **Claude**: <https://docs.anthropic.com/claude/reference/getting-started-with-the-api>
- **Mistral**: <https://docs.mistral.ai/api/>
- **Supabase pgvector**: <https://supabase.com/docs/guides/ai/vector-columns>

### EUR-Lex Sources

| Règlement | URL EUR-Lex |
| :--- | :--- |
| AI Act | `eur-lex.europa.eu/eli/reg/2024/1689/oj` |
| GDPR | `eur-lex.europa.eu/eli/reg/2016/679/oj` |
| Data Act | `eur-lex.europa.eu/eli/reg/2023/2854/oj` |
| CRA | `eur-lex.europa.eu/eli/reg/2024/2847/oj` |
| Machines | `eur-lex.europa.eu/eli/reg/2023/1230/oj` |
| ESPR | `eur-lex.europa.eu/eli/reg/2024/1781/oj` |
| CPR | `eur-lex.europa.eu/eli/reg/2011/305/oj` |
| Batteries | `eur-lex.europa.eu/eli/reg/2023/1542/oj` |

---

**Document créé par**: Jean-Pierre Charles avec Antigravity AI  
**Date**: 22 janvier 2026  
**Version**: 1.0
