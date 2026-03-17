# Signaux filtrés D81 — Convergence EU AI Act / CRA / Machinery Regulation — PME industrielles 2026

**Timestamp** : 20260312T1700 CET
**Workflow** : D81 — Perplexity collecte brute → JP filtre 5 signaux → Claude intègre
**Règle D81** : Données chiffrées sourcées uniquement. Zéro blabla.

***

## SIGNAL 1 — Nombre PME manufacturières EU concernées

```
SIGNAL : 2,2 millions d'entreprises manufacturières (NACE C) dans l'UE en 2022,
         employant 30 millions de personnes. Les PME manufacturières représentent
         8,5% de l'ensemble des PME UE (~2 millions de PME manufacturing).
SOURCE : Eurostat — Structural Business Statistics, données extraites janvier 2025
URL    : https://ec.europa.eu/eurostat/statistics-explained/SEPDF/cache/10086.pdf
FIABILITE : haute
```

Eurostat confirme 2,2 millions d'entreprises dans le secteur manufacturier (NACE Section C) en 2022, soit 6,7% de l'ensemble de l'économie marchande UE. À l'échelle de toute l'économie UE, 240 000 entreprises moyennes (50-249 employés) représentent 0,8% du total, 15% de l'emploi et 18% du chiffre d'affaires. Le rapport annuel PME de la Commission européenne indique que les PME manufacturières comptent pour 8,5% de l'ensemble des PME UE, mais pèsent environ 12% de la valeur ajoutée PME.[^1][^2][^3]

**Données complémentaires compliance** : 32% des PME citent la charge réglementaire comme obstacle majeur à l'investissement, et 28% allouent plus de 10% de leur personnel à la conformité réglementaire. Par ailleurs, 55% des PME identifient les charges administratives comme leur plus grand défi, avec un coût administratif estimé à ~150 milliards € annuels pour l'ensemble de l'UE. Environ 67% des PME européennes utilisant des outils d'automatisation ne réalisent pas que ces outils peuvent être qualifiés de systèmes d'IA au sens de l'article 2 de l'AI Act.[^4][^5][^6]

***

## SIGNAL 2 — Deadlines CRA 2026-2027 confirmées

```
SIGNAL : Trois jalons réglementaires CRA confirmés dans le texte officiel
         (Regulation (EU) 2024/2847) + deux deadlines intermédiaires par type de produit.
SOURCE : CRA Art. 71(2), Art. 14, Art. 35 + EC Digital Strategy summary
URL    : https://digital-strategy.ec.europa.eu/en/policies/cra-summary
FIABILITE : haute
```

| Date | Obligation | Référence |
|------|-----------|-----------|
| **11 juin 2026** | Notification des organismes d'évaluation de conformité (notified bodies) par les autorités nationales | Chapitre IV, Art. 71(2) CRA [^7][^8] |
| **11 septembre 2026** | Obligations de signalement : vulnérabilités activement exploitées (24h early warning, 72h notification, 14j rapport final) + incidents sévères | Art. 14 CRA [^9][^8] |
| **11 décembre 2026** | Nombre suffisant de notified bodies opérationnels dans les États membres | Art. 35 CRA [^7] |
| **11 décembre 2027** | Conformité CRA complète obligatoire pour tout nouveau produit mis sur le marché UE | Full CRA [^9][^10] |

**Deadlines intermédiaires par classification produit** (à vérifier dans texte consolidé) : horizontal type A au 30/08/2026, vertical type C et horizontal type B au 30/10/2026.[^11]

**Deadline parallèle AI Act** : Obligations high-risk AI systems au **2 août 2026** — conformity assessments, documentation technique, marquage CE, enregistrement base de données UE.[^12][^13]

**Deadline parallèle Machinery Regulation** : Application complète du Règlement (UE) 2023/1230 au **20 janvier 2027**, remplaçant la Directive Machines 2006/42/EC.[^14][^15]

***

## SIGNAL 3 — Amendes et coûts non-conformité AI Act + CRA

```
SIGNAL : Amendes cumulables AI Act (max €35M/7% CA) + CRA (max €15M/2,5% CA).
         Coût compliance réactive PME estimé €15 000-50 000 par incident.
SOURCE : AI Act Art. 99 + CRA Art. 64 (textes officiels)
URL    : https://artificialintelligenceact.eu/article/99/
         https://cyber-resilience-act.com/cra/chapter-7/article-64/
FIABILITE : haute (amendes) / moyenne (coûts estimés)
```

### Amendes AI Act (Regulation (EU) 2024/1689, Art. 99)

| Niveau | Violation | Amende max | % CA mondial |
|--------|----------|-----------|-------------|
| Tier 1 | Pratiques AI interdites (Art. 5) | €35 000 000 | 7% [^16][^17] |
| Tier 2 | Non-conformité obligations high-risk (Art. 16, 22-26, 50) | €15 000 000 | 3% [^18][^19] |
| Tier 3 | Information incorrecte/trompeuse aux autorités | €7 500 000 | 1% [^16][^19] |

Les PME et startups bénéficient de plafonds réduits au seuil inférieur de chaque tier. Les sanctions doivent être « effectives, proportionnées et dissuasives » et tenir compte de la viabilité économique des PME (Art. 99§1).[^16][^17]

### Amendes CRA (Regulation (EU) 2024/2847, Art. 64)

| Niveau | Violation | Amende max | % CA mondial |
|--------|----------|-----------|-------------|
| Tier 1 | Exigences cybersécurité essentielles (Annexe I) + Art. 13-14 | €15 000 000 | 2,5% [^20][^10] |
| Tier 2 | Autres obligations (Art. 18-23, 28, 30-33, 39, 41, 47, 49, 53) | €10 000 000 | 2% [^20][^21] |
| Tier 3 | Information incorrecte aux organismes notifiés/autorités | €5 000 000 | 1% [^22] |

### Coûts de conformité estimés pour PME manufacturières

Les estimations disponibles (sources consultants, non-institutionnelles) indiquent : un surcoût de +17% sur les dépenses AI pour les entreprises UE, des coûts de compliance réactive d'urgence de €15 000 à €50 000 par entreprise lors d'un audit, et jusqu'à 15% du budget R&D pour les PME fabricants de dispositifs médicaux. Ces chiffres restent des estimations sectorielles ; aucune donnée consolidée Commission/Eurostat sur le coût moyen de mise en conformité CRA+AI Act pour une PME manufacturière type (50-250 employés) n'a été identifiée.[^23][^24][^25]

***

## SIGNAL 4 — Convergence tripartite AI Act / CRA / Machinery Regulation

```
SIGNAL : Confirmation du cadre réglementaire tripartite. Les machines avec IA
         embarquée (robots, AGVs, cobots, maintenance prédictive) sont soumises
         aux 3 réglements simultanément. Annexe I(A) Machinery Reg inclut
         les composants de sécurité avec comportement auto-évolutif ML.
SOURCE : Machinery Regulation (EU) 2023/1230, AI Act Annex II Section A,
         TechworksAI analysis
URL    : https://www.techworksai.org/how-ai-impacts-the-2027-eu-machinery-regulation/
FIABILITE : haute
```

Le cadre réglementaire tripartite est désormais confirmé : les machines intégrant de l'IA embarquée — robots industriels adaptatifs, véhicules guidés autonomes (AGVs), cobots, systèmes de maintenance prédictive déclenchant des actions physiques — sont potentiellement soumises au Machinery Regulation, à l'AI Act ET au CRA simultanément. Le Machinery Regulation 2023/1230 introduit une nouvelle catégorie de « produits machines à haut risque » incluant explicitement les machines utilisant des algorithmes d'IA auto-évolutifs dont les résultats ne sont pas entièrement prévisibles à la conception.[^26][^14]

L'AI Act Annexe II Section A liste le Machinery Regulation parmi les législations d'harmonisation UE : tout système d'IA utilisé comme composant de sécurité d'une machine, ou étant lui-même le produit machine, est classé high-risk s'il nécessite une évaluation de conformité par tiers. L'Annexe I(A) du Machinery Regulation inclut désormais les « composants de sécurité avec comportement entièrement ou partiellement auto-évolutif utilisant des approches d'apprentissage automatique assurant des fonctions de sécurité ».[^27][^28]

### Calendrier de convergence

| Réglementation | Application complète | Organisme principal |
|---------------|---------------------|-------------------|
| AI Act — obligations high-risk | 2 août 2026 [^12] | Autorités nationales + AI Office |
| Machinery Regulation 2023/1230 | 20 janvier 2027 [^14][^15] | Autorités surveillance marché |
| CRA — conformité complète | 11 décembre 2027 [^9][^8] | ENISA + autorités nationales |

Les fabricants doivent donc préparer une évaluation de risque intégrée couvrant trois dimensions : sécurité physique (Machinery Reg), impact IA et transparence (AI Act), et vulnérabilités cybersécurité (CRA). La déclaration de conformité CE devra référencer la conformité aux trois cadres réglementaires.[^14]

***

## SIGNAL 5 — Consultation CRA mars 2026 — provisions PME

```
SIGNAL : Art. 26(1) CRA impose à la Commission de publier des orientations
         facilitant la conformité pour micro/PME. Draft guidance publié le 3 mars 2026.
         Consultation ouverte jusqu'au 31 mars 2026.
SOURCE : European Commission — Communication draft guidance CRA
URL    : https://digital-strategy.ec.europa.eu/en/news/commission-publishes-feedback-draft-guidance-assist-companies-applying-cyber-resilience-act
FIABILITE : haute
```

L'article 26(1) du CRA impose explicitement à la Commission européenne de publier des orientations pour aider les opérateurs économiques, « avec un focus particulier sur la facilitation de la conformité par les microentreprises et les PME ». Le draft guidance publié le 3 mars 2026 couvre quatre thématiques prioritaires : le traitement des solutions de data processing à distance (cloud), le logiciel libre et open-source, la notion de « périodes de support » et l'interaction du CRA avec d'autres législations UE. La consultation est ouverte jusqu'au 31 mars 2026.[^29][^30][^31][^32]

### Mesures PME identifiées dans l'écosystème réglementaire combiné

**AI Act — mesures spécifiques PME** : documentation technique simplifiée développée par la Commission pour micro/PME, accès prioritaire et gratuit aux bacs à sable réglementaires (regulatory sandboxes), système de gestion de la qualité (QMS) simplifié pour microentreprises, programmes de formation et sensibilisation obligatoires organisés par les États membres, et représentation des PME dans les structures de gouvernance comme l'Advisory Forum. Le terme « SME » est mentionné 38 fois dans le texte de l'AI Act, contre 7 pour « industry » et 11 pour « civil society ».[^33][^34]

**CRA — draft guidance mars 2026** : la guidance reconnaît que les produits complexes impliquent des cycles de développement longs, des contrats signés avant l'entrée en vigueur, et des durées de vie opérationnelle étendues. Les fabricants de produits conçus avant l'entrée en vigueur ne sont pas tenus de fournir des résultats de tests des phases de conception originales, et les tests peuvent être regroupés par familles de produits plutôt que répétés pour chaque variante. Une future guidance est prévue sur l'interaction CRA ↔ AI Act ↔ DORA.[^32]

**Simplification en cours** : la Commission a étendu certaines simplifications accordées aux PME et small mid-caps, incluant des exigences de documentation technique simplifiées et un élargissement des mesures de conformité pour que davantage d'innovateurs puissent utiliser les sandboxes réglementaires.[^35]

***

## Résumé exécutif des enjeux critiques

Le triple cadre réglementaire UE (AI Act + CRA + Machinery Regulation) crée une situation sans précédent pour les PME manufacturières européennes. Sur 2,2 millions d'entreprises manufacturières dans l'UE, la quasi-totalité (99,8%) sont des PME. La fenêtre de mise en conformité se resserre : obligations AI Act high-risk dès août 2026, signalement CRA dès septembre 2026, Machinery Regulation dès janvier 2027, et CRA complet dès décembre 2027.[^36][^3]

L'exposition financière cumulée est significative : jusqu'à €35M ou 7% du CA mondial pour l'AI Act, plus €15M ou 2,5% pour le CRA, plus les sanctions du Machinery Regulation. Les PME manufacturières avec IA embarquée (robotique, cobots, AGVs, maintenance prédictive) sont au point de convergence des trois réglements.[^20][^17][^14]

La Commission reconnaît cette charge disproportionnée — l'Art. 26(1) du CRA et les dispositions PME de l'AI Act prévoient des simplifications — mais la guidance détaillée sur l'interaction CRA/AI Act n'est pas encore publiée. Le draft guidance du 3 mars 2026 constitue la première étape concrète, avec consultation ouverte jusqu'au 31 mars 2026.[^31][^32]

***

## Recommandations et feuille de route stratégique — Ère IA agentique

### Actions immédiates (T2 2026)

Les PME manufacturières doivent lancer immédiatement un audit de leur portefeuille de systèmes AI/ML embarqués en se basant sur les définitions de l'Article 3 de l'AI Act, identifier les produits soumis au triple cadre réglementaire, et constituer un SBOM (Software Bill of Materials) pour chaque produit connecté. La participation à la consultation CRA avant le 31 mars 2026 est essentielle pour influencer les modalités d'application aux PME.[^30][^25][^14]

### Actions moyen terme (S2 2026 – S1 2027)

L'évaluation de risque intégrée couvrant les trois dimensions (sécurité physique, IA, cybersécurité) doit être documentée avant les deadlines d'août-septembre 2026. Les PME doivent utiliser les bacs à sable réglementaires à accès prioritaire, adopter le format de documentation technique simplifié dès sa publication par la Commission, et mettre en place les processus de signalement 24h/72h/14j exigés par le CRA dès septembre 2026.[^34][^9][^33][^14]

### Actions structurantes (2027+)

À l'ère des technologies IA agentiques, les PME doivent intégrer la conformité réglementaire dès la phase de conception (compliance-by-design), en utilisant des agents IA spécialisés pour automatiser la veille réglementaire, la génération de documentation technique, le suivi des vulnérabilités et le reporting d'incidents. La convergence des trois réglements impose une approche systémique de gestion des risques — au sens de Judea Pearl — modélisant les relations de causalité entre sécurité machine, fiabilité IA et résilience cyber, tout en intégrant les limitations cognitives du facteur humain (Herbert Simon) dans la conception des interfaces homme-machine et des mécanismes d'override exigés par le Machinery Regulation.[^14]

***

*Signaux filtrés — Workflow D81*
*Perplexity Pro — 12/03/2026 17h00 CET*

---

## References

1. [Micro & small businesses make up 99% of enterprises in the EU](https://ec.europa.eu/eurostat/fr/web/products-eurostat-news/w/ddn-20241025-1) - In 2022, the EU had 32.3 million enterprises, employing 160 million persons. Of that total, 99% were...

2. [[PDF] Annual Report on European SMEs 2022/2023](https://single-market-economy.ec.europa.eu/system/files/2023-08/Annual%20Report%20on%20European%20SMEs%202023_FINAL.pdf) - While, in general, the distributions of the number of EU-27 SMEs, SME employment, and SME value adde...

3. [[PDF] Businesses in the manufacturing sector Statistics Explained](https://ec.europa.eu/eurostat/statistics-explained/SEPDF/cache/10086.pdf)

4. [EU AI Act Automation Compliance for SMEs | 2026 Guide](https://www.linkedin.com/pulse/eu-ai-act-automation-compliance-smes-2026-guide-dr-hernani-costa-zi3je) - 67% of European SMEs using automation tools face €35M AI Act penalties. The 4-layer compliance frame...

5. [SME update - Accountancy Europe](https://accountancyeurope.eu/update/sme-update-250217/) - Accountancy Europe's SME update for February 2025. Read latest factsheet on EU AI Act’s main provisi...

6. [As EU's Regulatory Burden Grows, What Should Mid-Sized ...](https://luvianglobalinsights.substack.com/p/as-eus-regulatory-burden-grows-what) - Why SMEs Must Adapt, Innovate, and Push Back as the EU’s Expanding Rulebook Redraws the Competitive ...

7. [EU Cyber Resilience Act: Key 2026 milestones toward CRA ...](https://www.jdsupra.com/legalnews/eu-cyber-resilience-act-key-2026-1304993/) - The EU Cyber Resilience Act (“CRA”) establishes mandatory cybersecurity requirements for most hardwa...

8. [The Cyber Resilience Act - Summary of the legislative text](https://digital-strategy.ec.europa.eu/en/policies/cra-summary) - The text below summarises the main provisions of Regulation (EU) 2024/2847, in order to support the ...

9. [Cyber Resilience Act Timeline: Key Deadlines for 2026 & 2027](https://scandog.io/blog/security-compliance/cyber-resilience-act-timeline) - The Cyber Resilience Act timeline has two critical dates. Learn the difference between the Sept 2026...

10. [Cyber Resilience Act: The clock is ticking for compliance](https://www.whitecase.com/insight-alert/cyber-resilience-act-clock-ticking-compliance) - The Cyber Resilience Act (the "CRA") entered into force on 10 December 2024 and applies in full from...

11. [The European Union's Cyber Resilience Act](https://orcwg.org/cra/) - Learn how the EU Cyber Resilience Act (CRA) impacts open source software development. Understand key...

12. [EU AI Act 2026 Updates: Compliance Requirements and Business ...](https://www.legalnodes.com/article/eu-ai-act-2026-updates-compliance-requirements-and-business-risks) - Obligations under the Act will apply to all operators of High-risk AI systems in place before 2 Augu...

13. [EU AI Act 2026: The August Compliance Deadline That Could Cost ...](https://hamzajadoon.cloud/posts/eu-ai-act-2026-the-august-compliance-deadline-that-could-cost-your-business-eur35-million.html) - EU AI Act 2026: The August Compliance Deadline That Could Cost Your Business EUR35 Million · Table o...

14. [How AI Impacts the 2027 EU Machinery Regulation](https://www.techworksai.org/how-ai-impacts-the-2027-eu-machinery-regulation/) - Introduction From January 20, 2027, the EU's Machinery Regulation (EU) 2023/1230 will fully replace ...

15. [Regulation 2023/1230/EU - machinery | Safety and health at work ...](https://osha.europa.eu/en/legislation/directive/regulation-20231230eu-machinery) - Background

16. [Penalties of the EU AI Act: The High Cost of Non-Compliance](https://www.holisticai.com/blog/penalties-of-the-eu-ai-act) - Here is a summary of the penalties of the EU AI Act and European Commission's AI rules and that you ...

17. [Article 99: Penalties | EU Artificial Intelligence Act](https://artificialintelligenceact.eu/article/99/)

18. [The EU AI Act: enforcement overview - Stephenson Harwood](https://www.stephensonharwood.com/insights/the-eu-ai-act-enforcement-overview/) - The EU Artificial Intelligence Act (the "AI Act") is a legal framework for the regulation of AI in t...

19. [A comprehensive EU AI Act Summary [January 2026 update] - SIG](https://www.softwareimprovementgroup.com/blog/eu-ai-act-summary/) - The EU AI Act impacts businesses active in the EU. Learn exactly what it means without needing any p...

20. [Article 64 Penalties - Cyber Resilience Act](https://cyber-resilience-act.com/cra/chapter-7/article-64/)

21. [Cyber Resilience Act text, Article 64](https://www.european-cyber-resilience-act.com/Cyber_Resilience_Act_Article_64.html) - Article 64 - Penalties

22. [Cyber Resilience Act text, Article 53 (15.9.2022)](https://www.european-cyber-resilience-act.com/Cyber_Resilience_Act_Article_53_15.9.2022.html) - European Cyber Resilience Act, Text, Article 53 (15.9.2022)

23. [Here's What to Do - AI Policy Bulletin](https://www.aipolicybulletin.org/articles/its-too-hard-for-small-and-medium-sized-businesses-to-comply-with-eu-ai-act-heres-what-to-do)

24. [Is Your SME Ready for the EU AI Act? Here’s What You Need to Know | Veritern](https://veritern.com/articles/innovation/eu-ai-act-sme-compliance/) - Having spent years guiding SMEs through complex regulatory landscapes, I can attest to the challenge...

25. [Title: EU AI Act Compliance for SMEs: 2026 Risk Framework - LinkedIn](https://www.linkedin.com/pulse/title-eu-ai-act-compliance-smes-2026-risk-framework-dr-hernani-costa-gxoae) - EU AI Act Compliance for SMEs: The 2026 Risk Assessment Framework. €35 million penalties or 7% of gl...

26. [[PDF] Review of Machinery Regulation EU 2023/1230 - PEMA](https://www.pema.org/wp-content/uploads/2025/12/PEMA-IP32-Review-of-Machinery-Regulation-EU-20231230.pdf)

27. [Guidance on Classification and Conformity Assessments for High ...](https://ai-regulation.com/guidance-on-high-risk-ai-systems-under-eu-ai-act/) - Here is a guide (with infographics) on the classification of ALL “High Risk” systems in the AI Act, ...

28. [Machinery Regulation | Insight - Baker McKenzie](https://www.bakermckenzie.com/en/insight/publications/resources/product-risk-radar-articles/machinery-regulation) - With the Machinery Regulation, the EU intends to address new risks linked to emerging technologies.

29. [Cyber Resilience Act (CRA) | Updates, Compliance, Training](https://www.european-cyber-resilience-act.com) - 03 March 2026 - The European Commission publishes for feedback draft guidance to assist companies in...

30. [EU Commission's new guidance to push Cybersecurity Resilience Act](https://dig.watch/updates/eu-commissions-new-guidance-to-push-cybersecurity-resilience-act) - The guidance is framed as practical help, especially for microenterprises and SMEs, and the consulta...

31. [Commission publishes for feedback draft guidance to assist ...](https://digital-strategy.ec.europa.eu/en/news/commission-publishes-feedback-draft-guidance-assist-companies-applying-cyber-resilience-act) - The European Commission has published for feedback draft guidance to assist companies in meeting the...

32. [European Commission opens consultation on draft guidance to help ...](https://industrialcyber.co/threats-attacks/european-commission-opens-consultation-on-draft-guidance-to-help-manufacturers-and-developers-comply-with-cra/) - European Commission opens consultation on draft guidance to help manufacturers and developers comply...

33. [Navigating the EU AI Act: A Guide for SMEs and Start-Ups](https://thebarristergroup.co.uk/blog/navigating-the-eu-ai-act-a-guide-for-smes-and-start-ups) - The EU AI Act supports SMEs by offering regulatory sandboxes, simplified documentation, inclusive go...

34. [Proportional Obligations For...](https://artificialintelligenceact.eu/small-businesses-guide-to-the-ai-act/)

35. [SME update - Accountancy Europe](https://accountancyeurope.eu/update/sme-update-251124/) - Read Accountancy Europe's November 2025 SME update for the latest news on EU, international, and nat...

36. [Structural business statistics overview - European Commission](https://ec.europa.eu/eurostat/statistics-explained/index.php/Structural_business_statistics_overview) - Some 19.9 million persons worked in SMEs in the distributive trades sector, 15.4 million in manufact...

