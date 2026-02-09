# 📜 PRJ_PROJECT_HISTORY: LOGS & DECISIONS

> **GOAL**: Maintain a searchable, compressed memory of the project's evolution. Every major decision and incident is logged here.

---

## 1. VERSION HISTORY (CHANGELOG)

| Version | Date | Milestone | Key Changes |
| :--- | :--- | :--- | :--- |
| **v2.1.2** | 2026-01-22 | **Exactitude Audit** | Added JOUE numbers to UI buttons. Clarified ESPR acronym (Fix for Android S24+). |
| **v2.1.1** | 2026-01-22 | **Determinism Fix** | Forced Temp 0 and Seed 42 across all IA services to fix cross-platform discrepancies. |
| **v2.1.0** | 2026-01-21 | **Knowledge OS** | Introduced Phase 17 (Staff of Agents). Standardized CI/CD & Quality. |
| **v2.0.2** | 2026-01-19 | **Production Go-Live** | Successfully deployed `jeanpierrecharles.com` to Vercel/Gandi. |
| **v2.0.1** | 2026-01-17 | **Anti-Hallucination** | Created AI Accuracy Framework after ERSP 2024/1781 incident. |
| **v2.0.0** | 2026-01-15 | **Master Doc v2** | Initial framework defined for Aegis. |

---

## 2. ARCHIVE: PHASES 1-15 (COMPRESSED)

| Phase | Description | Status | Decision/Note |
| :--- | :--- | :--- | :--- |
| **01-03** | Vision & MVP | ✅ | Focused on PME Compliance (Aegis). |
| **04-06** | Benchmarking & Flow| ✅ | Chose Hybrid Architecture (Gemini/Claude). |
| **07-09** | Development & Security| ✅ | Implemented `html2pdf`, Subscriptions, API Keys. |
| **10-12** | AI Prompts & Invariants| ✅ | Shifted to **XML tagging** for structured prompts. |
| **13-15** | Agents & Deployment | ✅ | Deploy to Vercel + Gandi (EU Hosting). |

---

## 3. CRITICAL DECISIONS LOG

### DEC-001: The "Local-First" Rule (Jan 14, 2026)

* **Problem**: Google Drive sync issues (EBADF/EPERM).
* **Decision**: Source code in Cloud, Development in `C:\Projects\`. Sync via Git/Robocopy.

### DEC-002: Deterministic AI (Jan 22, 2026)

* **Problem**: AI gave different answers on Android vs Win11 for the same user.
* **Decision**: Hard-lock `temperature: 0` and `seed: 42`. Consistency > "Creativity".

### DEC-003: The 5 Master Files Convergence (Jan 26, 2026)

* **Problem**: Documentation fragmentation causing token exhaustion in Antigravity.
* **Decision**: Merge 62 files into 5 Pillar Documents. Archive all others.

---

## 4. INCIDENT REPORTS

### INC-001: The ERSP Hallucination (Jan 17, 2026)

* **Scenario**: User asked about ERSP 2024/1781. AI replied "This regulation does not exist".
* **Cause**: Knowledge cutoff + training data lag.
* **Resolution**: Implemented RAG (Phase 16) and forced citation of official EUR-Lex articles.

---

## 5. REPOSITORY METRICS

* **Total Documents**: 17 -> 5 (Master) + Archives.
* **Context Volume**: Reduced from ~350 KB to ~120 KB.
* **Token Efficiency**: Expected +80% improvement in AI reasoning accuracy.

---
*Maintained by Project Manager Agent - Sync: Jan 26, 2026*
