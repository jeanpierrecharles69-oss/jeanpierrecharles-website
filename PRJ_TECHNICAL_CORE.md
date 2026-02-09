# 🛠️ PRJ_TECHNICAL_CORE: ARCHITECTURE & DEV STANDARDS

> **GOAL**: Maintain a high-performance, cost-effective, and EU-compliant technical stack. Focus on **Determinism** for regulatory trust.

---

## 1. THE TECH STACK (AEGIS PLATFORM)

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Vite | Speed, scalability, and modern React 19 features. |
| **Backend** | Node.js (Vercel/Gandi) | Seamless integration with PDF & AI services. |
| **AI Engine** | Gemini 2.0 Flash (Primary) | Ultra-low latency, low cost, 1M context. |
| **Premium AI**| Claude 3.5 Sonnet | High-precision for complex audits (DPIA, High-Risk). |
| **Vector DB** | Supabase (pgvector) | PostgreSQL robustness, simplified auth/database. |
| **Embeddings**| Google text-embedding-004 | Multi-language support, dimensions 768 (optimal). |

---

## 2. DETERMINISM & AI CONFIGURATION

To pass EU audits, the AI must be reproducible (**Same Input -> Same Output**).

### 2.1 Deterministic Config (`geminiService.ts`)

```typescript
const DETERMINISTIC_CONFIG = {
    temperature: 0,        // Absolute determinism
    topP: 1,               // Disable nucleus sampling
    topK: 1,               // Always pick the most probable token
    candidateCount: 1,     
    seed: 42,              // Fixed seed for cross-platform stability
    maxOutputTokens: 2048,
};
```

### 2.2 Smart Routing Logic

* **Routine (80%)**: Questionnaire, basic advice -> **Gemini 2.0 Flash**.
* **Critical (20%)**: Legal syntheses, High-Risk classification -> **Claude 3.5 Sonnet**.
* **Fallback**: Mistral Large 2 (Ensuring EU Sovereignty).

---

## 3. DEVELOPMENT STANDARDS (CI/CD)

### 3.1 Quality Gates

* **Linting**: 0 Markdown/TS warnings allowed before PR (`STANDARD-QUALITE-CICD.md`).
* **SBOM**: Mandatory generation for CRA compliance (`npx @cyclonedx/cyclonedx-npm`).
* **Testing**: Hybrid suite (Unit -> Integration -> E2E with Playwright).

### 3.2 Security Invariants

* **Auth**: CSRF Protection + HttpOnly Cookies.
* **Hosting**: 100% EU-based (Gandi.net / OVH Cloud) for GDPR compliance.
* **Secrets**: Never commit `.env.local`. Use GitHub Secrets + Vercel Env Vars.

---

## 4. COMPLIANCE-BY-DESIGN (AI ACT)

### 4.1 Transparency (Art. 52)

Every AI response must include:
> "I am an AI Assistant. My responses may contain errors. Please consult a legal expert for binding decisions. [Source: EUR-Lex 2024/1689]"

### 4.2 Explainability (Art. 14)

* **Citation Engine**: 100% of regulatory answers MUST cite specific Articles/Paragraphs.
* **Human-in-the-loop**: Flagging system for incorrect answers + Admin Review Dashboard.

---

## 5. REPOSITORY STRUCTURE

```
/projects/jeanpierrecharles
├── components/         # UI Components (shadcn/ui)
├── services/           # Gemini, RAG, Subscriptions
├── scripts/            # Benchmarks & Extraction
├── data/               # Local SQLite/JSON cache
└── docs/               # _archives/ (The migrated files)
```

---
*Technical architecture frozen for v2.1 deployment.*
