# Plan d'Évolution v2.6.0 → v3.0 B2B — V3 Finale

**Commit de référence** : `c2c532b` (v2.6.0)  
**Cible** : v3.0 B2B — Production le **27 février 2026**  
**Date d'analyse** : 13 février 2026  
**Langue** : 🇫🇷 Français (tous les documents)

---

## 0. Historique des Contre-Expertises

| Version | Date | Lacunes trouvées | Source |
|:--|:--|:--|:--|
| V1 | 13/02 10h30 | Plan initial trop vague | Antigravity seul |
| V2 | 13/02 10h50 | 9 lacunes critiques identifiées | Auto-contre-expertise Antigravity |
| **V3** | **13/02 11h00** | **6 lacunes supplémentaires** issues des archives | Croisement 86 fichiers `_archives/` + Claude Opus `.resolved` |

---

## 1. Alignement Archives ↔ Plan Actuel

> [!IMPORTANT]
> 86 fichiers `.md` dans `_archives/` ont été scannés. 7 fichiers clés contiennent des informations **non intégrées** dans le plan V2.

### Matrice d'Alignement

| Archive | Contenu Pertinent | Intégré V2 ? | Action V3 |
|:--|:--|:--|:--|
| [MONETISATION-RAPIDE-FEV2026](file:///c:/Projects/jeanpierrecharles/_archives/jeanpierrecharles_AFRS_MONETISATION-RAPIDE-FEV2026.md) | 12 flux de revenus détaillés, workflow Audit Flash, prix Stripe | ❌ Partiel | Intégrer la grille tarifaire dans le tunnel B2B |
| [CHECKLIST-PRE-DEPLOIEMENT](file:///c:/Projects/jeanpierrecharles/_archives/jeanpierrecharles_AFRS_CHECKLIST-PRE-DEPLOIEMENT.md) | Checklist complète V&V (53 items + tests multi-devices) | ❌ Non | Réutiliser comme base V-Gate v3.0 |
| [AUDIT-SITE-PRODUCTION](file:///c:/Projects/jeanpierrecharles/_archives/jeanpierrecharles_AFRS_AUDIT-SITE-PRODUCTION.md) | CDN Tailwind en prod, formulaire contact absent, SEO incomplet | ❌ Partiel | Confirmer résolution CDN + ajouter tâches SEO |
| [STRATEGIE-OUTREMERS](file:///c:/Projects/jeanpierrecharles/_archives/jeanpierrecharles_AFRS_STRATEGIE-OUTREMERS.md) | Go-to-market Outre-mer, pages `/guadeloupe`, partenariats CCI | ❌ Non | Intégrer comme axe d'acquisition post-launch |
| [HARMONISATION_DESIGN_v2.6](file:///c:/Projects/jeanpierrecharles/_archives/jeanpierrecharles_AFRS_HARMONISATION_DESIGN_v2.6.md) | Palette Aegis unifiée (slate/navy), règles WCAG | ✅ Implicite | Vérifier cohérence avec nouveaux composants B2B |
| [PLAN-FIABILISATION-AEGIS](file:///c:/Projects/jeanpierrecharles/_archives/jeanpierrecharles_AFRS_PLAN-FIABILISATION-AEGIS.md) | Déterminisme IA (temp 0.1), XML tagging, non-dérive | ✅ Acquis v2.6 | Maintenir comme invariant v3.0 |
| [JeanPierreCHARLES_CV2025](file:///c:/Projects/jeanpierrecharles/_archives/JeanPierreCHARLES_CV2025.md) | CV complet avec dates, postes, entreprises vérifiées | ❌ Non utilisé | Source de vérité pour purge TrustSection |

### Lacunes Supplémentaires V3 (issues des archives)

| # | Lacune | Source Archive | Impact |
|:--|:--|:--|:--|
| L10 | **Grille tarifaire Stripe absente** — Le tunnel B2B n'a pas de prix définis | MONETISATION-RAPIDE | 🔴 Bloquant |
| L11 | **CDN Tailwind toujours en production** — Performance dégradée | AUDIT-SITE-PRODUCTION | 🟡 Majeur |
| L12 | **Stratégie Outre-mer non planifiée** — Axe différenciateur ignoré | STRATEGIE-OUTREMERS | 🟡 Majeur |
| L13 | **CV non exploité** — Données de TrustSection à remplacer par CV réel | JeanPierreCHARLES_CV2025 | 🟡 Majeur |
| L14 | **Checklist V&V existante non réutilisée** — 53 items déjà écrits | CHECKLIST-PRE-DEPLOIEMENT | 🟡 Efficacité |
| L15 | **Tests multi-navigateurs jamais effectués** — Chrome seul testé | AUDIT + HARMONISATION | 🟡 Qualité |

---

## 2. Capitalisation v2.6.0 — Leçons → Actions

| # | Leçon | Action v3.0 |
|:--|:--|:--|
| L1 | Écart vision/code | Audit AUDIT-SYNC avant chaque sprint |
| L2 | ARM64 non qualifié | Valider chaque composant sur Surface Pro 11 |
| L3 | Multi-IA = divergence | Protocole CONVERGENCE (§3) |
| L4 | Sécurité en aval | SEC-GATE pré-commit |
| L5 | Expertise = différenciateur | Purge placeholders → CV réel |
| L6 | TrustSection fictive | Données CV2025 vérifiées |
| L7 | Sprint déclaré "succès" sans V&V | Critères pass/fail explicites |
| L8 | Auto-validation IA | Contre-vérification Claude Opus |
| L9 | RGPD non appliqué | Bandeau cookies + politique |

---

## 3. Stratégie de Collaboration IA

### Rôles

| Outil | Rôle | Quand | Format |
|:--|:--|:--|:--|
| **Antigravity** | Exécution, build, V&V | Quotidien | Code dans `C:\Projects\` |
| **Claude Opus** | Contre-expertise, audit | Fin de phase | `SNAPSHOT_CONTEXT_V3.md` |
| **Perplexity** | Veille réglementaire | Ponctuel | Notes → Master Files |
| **ChatGPT** | Copywriting, contenu LinkedIn | Ponctuel | Export → `data/` |

### Routine de Transfert

```
DÉBUT DE SESSION
├── Charger SNAPSHOT_CONTEXT_V3.md
├── git log -5
└── Vérifier delta compris

FIN DE SESSION
├── Générer SNAPSHOT_CONTEXT_V3.md
├── git commit [SESSION-YYYYMMDD-N]
├── Rclone sync → Google Drive
└── Si milestone → soumettre à Claude Opus
```

### Protocole CONVERGENCE

1. Soumettre la même requête à Claude + Antigravity
2. Extraire convergences (= validé) et divergences (= à arbitrer)
3. Jean-Pierre fait autorité en cas de conflit

---

## 4. Prérequis Bloquants B2B

| # | Élément | Statut | Action |
|:--|:--|:--|:--|
| E1 | Proxy API serverless | ❌ | Vercel Edge Function |
| E2 | Stripe Checkout | ❌ | Grille tarifaire MONETISATION + intégration |
| E3 | Formulaire de contact | ❌ | Formspree ou Vercel Function |
| E4 | RGPD (cookies + politique) | ❌ | Bandeau + page /politique |
| E5 | Analytics | ❌ | Plausible.io (EU, RGPD) |
| E6 | SEO complet | ❌ | sitemap, robots.txt, canonical, Schema.org |
| E7 | Purge TrustSection | ❌ | Données CV2025 vérifiées |
| E8 | Résolution CDN Tailwind | ⚠️ | Compilation locale (archive AUDIT) |
| E9 | Tests multi-navigateurs | ❌ | Chrome, Firefox, Safari, Edge, Mobile |

---

## 5. Fichiers Modifiés/Créés

### Sécurité & Conformité

- **[MODIFY]** [vite.config.ts](file:///c:/Projects/jeanpierrecharles/vite.config.ts) — Retrait clé API client
- **[NEW]** [api/gemini-proxy.ts](file:///c:/Projects/jeanpierrecharles/api/gemini-proxy.ts) — Proxy Vercel Edge
- **[MODIFY]** [index.html](file:///c:/Projects/jeanpierrecharles/index.html) — Meta SEO + RGPD

### B2B Core

- **[MODIFY]** [TrustSection.tsx](file:///c:/Projects/jeanpierrecharles/components/TrustSection.tsx) — CV réel
- **[NEW]** [CookieBanner.tsx](file:///c:/Projects/jeanpierrecharles/components/CookieBanner.tsx)
- **[NEW]** [ContactForm.tsx](file:///c:/Projects/jeanpierrecharles/components/ContactForm.tsx)

### Routines

- **[NEW]** [ROUTINE_TRANSFER_CONTEXT.ps1](file:///c:/Projects/jeanpierrecharles/scripts/ROUTINE_TRANSFER_CONTEXT.ps1)
- **[NEW]** [VALIDATE_V3_B2B.ps1](file:///c:/Projects/jeanpierrecharles/scripts/VALIDATE_V3_B2B.ps1)

---

## 6. Plan de Vérification (V-Gate)

> Réutilisation de la [CHECKLIST-PRE-DEPLOIEMENT](file:///c:/Projects/jeanpierrecharles/_archives/jeanpierrecharles_AFRS_CHECKLIST-PRE-DEPLOIEMENT.md) archivée (53 items).

| Test | Critère Pass | Critère Fail |
|:--|:--|:--|
| Build | `npm run build` sans erreur | Toute erreur TypeScript |
| Scan secrets | 0 occurrence `AIzaSy` dans `dist/` | ≥1 occurrence |
| RGPD | Bandeau visible au 1er chargement | Absent |
| Contact | Formulaire envoie un email test | Cassé ou absent |
| Analytics | Events Plausible reçus | Aucun event |
| Mobile | Lighthouse ≥ 85 | < 85 |
| Multi-navigateur | Chrome + Firefox + Safari OK | Régression visuelle |
| Palette design | Cohérence slate/navy (v2.6) | Rupture visuelle |
| Déterminisme IA | Même réponse ×3 pour même input | Divergence |

---

## 7. Post-Lancement (Axes Stratégiques)

| Axe | Source | Planning |
|:--|:--|:--|
| Stratégie Outre-mer | `STRATEGIE-OUTREMERS.md` | Mars 2026 (pages `/guadeloupe`, `/martinique`) |
| Formations certifiantes | `MONETISATION-RAPIDE.md` | Mars 2026 (Gumroad / page dédiée) |
| API B2B | `PRJ_BUSINESS_STRATEGY.md` | Q2 2026 |
| PWA + Offline | `VALIDATION_PLAN_v3.0.md` | Q2 2026 |
