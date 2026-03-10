# 📅 PLANNING GANTT v3 : Aegis Circular v3.0 B2B

**Période** : 13 Février — 27 Février 2026 (**10 jours ouvrés**)  
**Commit de départ** : `c2c532b` (v2.6.0)  
**Objectif** : Production-ready v3.0 B2B

> [!WARNING]
> V3 intègre les éléments découverts dans les 86 fichiers d'archives (CDN Tailwind, tests multi-navigateurs, grille tarifaire Stripe).

---

## Diagramme

```mermaid
gantt
    title Planning v3.0 B2B (10j ouvrés)
    dateFormat YYYY-MM-DD
    excludes weekends

    section P1 Fondations (3j)
    Proxy API Vercel Edge           :crit, a1, 2026-02-13, 1d
    Scan secrets + SEC-GATE         :a2, after a1, 1d
    RGPD bandeau + politique        :a3, after a1, 1d
    CDN Tailwind → compilation      :a5, after a1, 1d
    Audit AUDIT-SYNC Master Files   :a4, after a2, 1d

    section P2 Noyau B2B (3j)
    Purge TrustSection (CV2025)     :b1, after a4, 1d
    Contact + Analytics + Stripe    :b2, after a4, 1d
    SEO complet + Schema.org        :b3, after b1, 1d
    Dashboard Exécutif MVP          :crit, b4, after b2, 2d

    section P3 Tunnel & Flux (2j)
    Stripe Checkout (€49 PDF)       :crit, c1, after b4, 1d
    Routines transfert contexte     :c2, after b3, 1d
    Polish UI/UX + palette v2.6     :c3, after c1, 1d

    section P4 V&V + Lancement (2j)
    V-Gate + multi-navigateurs      :d1, after c3, 1d
    Buffer + Déploiement production :crit, milestone, d2, after d1, 1d
```

---

## Détail Jour par Jour

| Jour | Date | Phase | Tâches | Livrable |
|:--|:--|:--|:--|:--|
| J1 | **13/02 jeu** | P1 | Proxy API, retrait clé client | API sécurisée |
| J2 | **14/02 ven** | P1 | Scan secrets, RGPD, CDN Tailwind → local | Socle sécurité + perf |
| J3 | **17/02 lun** | P1 | Audit AUDIT-SYNC, sécurité rapport 11/02 | Alignement documentation |
| J4 | **18/02 mar** | P2 | TrustSection (CV2025), contact, Plausible.io | Crédibilité + mesure |
| J5 | **19/02 mer** | P2 | SEO complet, début Dashboard Exécutif | Visibilité + MVP B2B |
| J6 | **20/02 jeu** | P2 | Dashboard complet + grille tarifaire Stripe | Tunnel prêt |
| J7 | **21/02 ven** | P3 | Stripe Checkout, routines transfert IA | Conversion active |
| J8 | **24/02 lun** | P3 | Polish UI/UX, palette slate/navy v2.6 | Expérience premium |
| J9 | **25/02 mar** | P4 | V-Gate complet + tests multi-navigateurs | Rapport V&V |
| J10 | **26-27/02** | P4 | Buffer + corrections + déploiement Vercel | **🚀 v3.0 EN LIGNE** |

---

## Points d'Arbitrage

1. **Stripe** : intégrer maintenant (J7) ou reporter à v3.1 ?
2. **Dashboard Exécutif** : complet ou MVP simplifié ?
3. **Google Workspace** : maintenant ou post-lancement ?

---

## Dépendances

```mermaid
graph LR
    A[Proxy API] --> B[Scan Secrets]
    A --> C[RGPD]
    A --> E[CDN Fix]
    B --> D[AUDIT-SYNC]
    D --> F[TrustSection CV]
    D --> G[Contact + Analytics]
    F --> H[SEO]
    G --> I[Dashboard B2B]
    I --> J[Stripe]
    J --> K[V-Gate + Multi-nav]
    K --> L[🚀 DEPLOY]
```
