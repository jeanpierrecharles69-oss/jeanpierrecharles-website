# 🛡️ Token Quota Management (TQM) Strategy

**Question Jean-Pierre Charles 20260218T1235**: Review quota-monitoring.md and quota-status.md. Align update and create one only for TQ managment pusposes in the developpement framework context of jeanpierrecharles.com and the Aegis AI engine. Add in the same document executive and strategic recommandations with an implementation actions plan.

**Context**: jeanpierrecharles.com Development Framework & Aegis AI Engine

**Last Update**: 2026-02-18

**Writer**: Google Antigravity

---

## 1. Executive Summary & Strategic Recommendations

In the context of the **Aegis AI Engine** development, continuous availability of high-reasoning models (Claude 3.5/4.5, Gemini Ultra) is critical for architectural decisions, while cost-efficiency is required for routine code generation.

### 🧠 The "Brain-Tiering" Strategy

To optimize the limited "Pro" quotas across 7 models, we apply a tiering strategy:

| Tier | Models | Use Case | Configuration |
| :--- | :--- | :--- | :--- |
| **S-Tier (Strategic)** | **Claude 3.5/4.5 Sonnet**, GPT-4o | **Architecture**, Complex Refactoring, Logic Debugging. | `Agent Mode: OFF` <br> `Max Output: 8192` |
| **A-Tier (Tactical)** | **Gemini 2.5 Flash/Pro** | **Code Generation**, Unit Tests, Boilerplate. | `Agent Mode: ON` <br> `Auto-Planning: ON` |
| **B-Tier (Operational)** | Gemini 2.5 Flash-Lite, GPT-4o-mini | Documentation, Markdown, basic formatting. | `Temp: 0.2` <br> `Top-K: 40` |
| **Search-Tier** | Perplexity AI | Fact-checking, Library research. | N/A |

### 💎 Context Caching Strategy (New!)

*Vital for long sessions to reduce input token costs.*

**Policy**: ENABLE Context Caching when the session context exceeds **30,000 tokens** and you expect >50 subsequent interactions.

| Cache Tier | Trigger Condition | TTL Setting |
| :--- | :--- | :--- |
| **Project Knowledge** | Loading full documentation `docs/` | **60 minutes** |
| **Codebase Snapshot** | Analyzing >10 files simultaneously | **30 minutes** |
| **Session History** | Long debugging thread (>20 turns) | **20 minutes** |

**How to Activate**:

- In Antigravity: `Settings > Experimental > Context Caching > "Auto-Cache Large Contexts"`

### 🚀 Optimization Recommendations

1. **Context Saturation Control**: Do not feed the entire codebase context to S-Tier models. Use "Extracts" or specific file references.
2. **No "Chat" with S-Tier**: Use S-Tier models for *Deliverables* (Code, JSON, Plans), not for brainstorming. Use A-Tier for brainstorming.
3. **Agent Mode Discipline**: Disable "Auto-planning" for routine tasks. It consumes 3x-5x tokens.
4. **Batching**: Group small requests into one large prompt ("Review this file AND fix typos AND add comments").

### 🛡️ Agentic Safeguards

*Prevent runaway token consumption by autonomous agents.*

1. **Stop-Loss Rule**: If the Agent performs **3 consecutive "Planning" steps** without writing code -> **TERMINATE** the task.
2. **Review Checkpoint**: Force a user review (`notify_user`) before any file edit >50 lines.
3. **No-Go Zones**: Block Agent access to `node_modules`, `dist/`, and large data files to prevent context flooding.

---

## 2. Implementation Action Plan

### ✅ Immediate Actions (Day 0)

- [ ] **Consolidate Tracking**: Use this single document as the daily dashboard.
- [ ] **Configure IDE**: Set Gemini 2.5 Flash as the *Default Model* in Antigravity to prevent accidental S-Tier usage.
- [ ] **Browser Bookmarks**: Create a folder "AI Quotas" with direct links to usage pages.

### ⏳ Mid-Term Actions (Week 1)

- [ ] **Define `model-strategy.json`**: Implement rigid rules in the project root to warn when using high-cost models for low-value files (e.g., `*.md`).
- [ ] **Token Budgeting**: Allocate a "Daily Token Budget" per session (e.g., 50k tokens) and stop development on S-Tier when reached.

---

## 3. Daily Operational Workflow

**Goal**: Check health status before starting any development session.

### Step 1: Check Quota Status

Run the following command to open all dashboards at once:

```powershell
# Open Quota Dashboards
Start-Process "https://console.anthropic.com/settings/limits"
Start-Process "https://platform.openai.com/usage"
Start-Process "https://aistudio.google.com/app/settings/billing"
```

### Step 2: Update Status Dashboard (Below)

*Fill this table at the start of every session.*

| Model Service | Status | Remaining (Est.) | Reset Date/Time | Action for Today |
| :--- | :---: | :--- | :--- | :--- |
| **Claude (Anthropic)** | 🟢/🟡/🔴 | `% or Tokens` | `DD/MM` | *e.g., Reserved for Architecture only* |
| **OpenAI (GPT)** | 🟢/🟡/🔴 | `% or $` | `DD/MM` | *e.g., Use for Debugging only* |
| **Gemini (Google)** | 🟢/🟡/🔴 | `Requests/5h` | `HH:MM` | *e.g., Primary Dev Model* |
| **Perplexity** | 🟢/🟡/🔴 | `Requests` | `Daily` | *e.g., Research* |

**Legend**: 🟢 OK (>50%) | 🟡 Caution (<20%) | 🔴 Critical (Stop)

### Step 3: Decision Matrix

- **If Claude is 🔴**: Switch Architecture tasks to **Gemini 2.0 Pro**.
- **If Gemini is 🔴**: Switch Code Gen to **DeepSeek** (if avail) or **GPT-4o**.
- **If ALL are 🟡**: Focus on **Documentation** (Markdown) using Flash/Lite models.

---

## 4. Aegis AI Framework Alignment

In the context of **jeanpierrecharles.com**:

- **Aegis Core**: Only touch `src/components/Aegis` using **S-Tier** models to ensure logic integrity.
- **UI/Content**: Use **A-Tier** models for `src/pages` or CSS adjustments.
- **Data/Content**: Use **B-Tier** for blog posts or JSON data entry.

---
*End of Management Framework*
