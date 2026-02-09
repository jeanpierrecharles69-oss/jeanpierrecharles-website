# ⚖️ PRJ_COMPLIANCE_MATRIX: REGULATORY KNOWLEDGE BASE

> **GOAL**: Provide definitive guidance on EU Regulations. This is the **Source of Truth** for the Aegis RAG engine.

---

## 1. THE 8 PILLARS OF COMPLIANCE

| Regulation | Code | Core Focus | Critical Artifact |
| :--- | :--- | :--- | :--- |
| **AI Act** | 2024/1689 | Risk classification & Transparency. | Risk Analysis (Art. 9) |
| **RGPD** | 2016/679 | Data privacy & User rights. | Registre des Traitements |
| **Data Act** | 2023/2854 | Data access for IoT/connected products. | Portability API |
| **CRA** | 2024/2847 | Cybersecurity for digital elements. | SBOM (CycloneDX) |
| **Machines** | 2023/1230 | Physical safety & AI integration. | CE Marking |
| **ESPR** | 2024/1781 | Ecodesign & Sustainability. | Digital Product Passport |
| **CPR** | 305/2011 | Construction products safety. | DoP (Perf. Declaration) |
| **Batteries**| 2023/1542 | Battery life-cycle & recycling. | Battery Passport (2026) |

---

## 2. CROSS-REGULATION SYNERGY (AFRS MAPPING)

| Phase | RGPD | AI Act | ESPR / DPP | CRA (Cyber) |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1-2** | Lawfulness (Art 5) | Risk Classif. | - | - |
| **Phase 6-7** | Portability (Art 20) | - | **UPI Creation** | Secure by Design |
| **Phase 9** | Security (Art 32) | - | - | **SBOM Generation** |
| **Phase 13** | Breach Notification | High-Risk Doc. | Maintenance Log | Vuln. Disclosure |
| **Phase 15** | Policy Publish | **Disclaimer (Art 52)** | Public Page / QR | CE Marking |

---

## 3. CRITICAL CLARIFICATIONS

### 3.1 ERSP vs ESPR

* **ESPR** (*Ecodesign for Sustainable Products Regulation*): The official EU regulation 2024/1781.
* **ERSP**: A common acronym error in draft documents. **Always use ESPR** in UI and official exports.

### 3.2 Digital Product Passport (DPP)

The DPP is mandatory for all products falling under ESPR.

* **Requirements**: Unique Product Identifier (UPI), Material sourcing info, Recyclability score, Repairability index.
* **Implementation**: A public URL associated with a QR code on the product.

---

## 4. TECHNICAL GLOSSARY (FOR NON-LAWYERS)

* **LCA (Life Cycle Assessment)**: Environmental impact from extraction to disposal.
* **SBOM (Software Bill of Materials)**: List of all software components used in a product.
* **High-Risk AI**: AI used in critical infrastructure, recruitment, or safety components (e.g., ADAS).
* **PII (Personally Identifiable Information)**: Any data that can identify an individual (RGPD).

---

## 5. CERTIFICATION CHECKLIST (V&V GATE 15)

- [ ] **Transparency**: "Powered by AI" disclaimer visible? (AI Act Art 52)
* [ ] **Data Safety**: Hosting in EU (France/Germany)? (RGPD)
* [ ] **Traceability**: All source articles cited for legal advice?
* [ ] **Resilience**: SBOM generated and patched? (CRA)

---
*Verified against EUR-Lex latest publications - Jan 2026.*
