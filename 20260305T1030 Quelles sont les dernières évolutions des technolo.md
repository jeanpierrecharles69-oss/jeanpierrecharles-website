<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Quelles sont les dernières évolutions des technologies AI nécessaires à la transformation digitale des entreprises et des personnels et l'innovation 5.0

Les évolutions vraiment structurantes des 18–24 derniers mois peuvent se résumer en 6 grandes familles de technologies AI qui, ensemble, rendent possible une transformation digitale “AI-native” des entreprises, des métiers et de l’innovation 5.0 :

1. Modèles de fondation multimodaux comme nouvelle “infrastructure cognitive”
2. Agentic AI (agents autonomes orchestrés) pour passer du “chat” à l’automatisation de bout en bout
3. Human‑Centric / Human‑Centered AI comme principe d’architecture d’Industry 5.0
4. Convergence AI + robots + edge (cobots, vision, AMR) pour la production 5.0
5. Générative + prédictive AI intégrées aux jumeaux numériques
6. Gouvernance \& conformité (EU AI Act) comme “rail de sécurité” intégré à l’architecture

Je les détaille en orientant systématiquement vers la transformation des personnels et l’innovation 5.0 dans un contexte européen.

***

## 1. Modèles de fondation multimodaux : nouvelle couche de base de la stack digitale

Depuis 2024–2025, la bascule est claire : les grands modèles de fondation (LLM, multimodaux) deviennent une couche d’infrastructure générique que l’on spécialise par les données et les outils de l’entreprise, plutôt que des modèles “use‑case par use‑case”.

Points clés récents :

- Montée en puissance des modèles multimodaux (texte + image + tableau + parfois audio/vidéo) utilisés en contexte entreprise pour analyser simultanément documents, données structurées, images, interfaces, etc.[^1_1][^1_2]
- Généralisation des “private GPTs” / “LLM privés” : déploiement sur‑site ou en VPC de modèles open source (LLaMA, Mistral, etc.) ou propriétaires pour traiter des données internes sensibles, notamment dans la finance, la santé, l’industrie et le conseil.[^1_1]
- Outils de fine‑tuning et d’adaptation beaucoup plus accessibles (LoRA, DeepSpeed, Hugging Face, LangChain, etc.) rendant réaliste la création de modèles réellement “orientés métier” (contrats, procédures qualité, normes, etc.).[^1_1]
- Focalisation des fournisseurs sur le raisonnement et le “tool use” : les modèles intègrent nativement l’appel d’outils, d’APIs, de moteurs de recherche, etc., pour résoudre des tâches complexes en plusieurs étapes plutôt que simplement générer du texte.[^1_3]

Impact pour la transformation digitale et les personnels :

- On passe de “chatbots” à de vrais copilot(e)s métiers multimodaux capables de :
    - Lire et commenter un dossier d’homologation CE (texte + tableaux + schémas),
    - Extraire et relier des exigences de normes (EN/ISO),
    - Préparer un dossier de fabrication ou un AMDEC à partir de gabarits existants, etc.
- Ces modèles deviennent le front‑end cognitif de l’ERP, du PLM, du MES, du CRM et des référentiels documentaires internes.

En pratique, pour une entreprise 5.0, cela signifie :
> Penser les modèles de fondation comme “nouveau système d’exploitation cognitif” de l’entreprise, puis organiser les données, les droits, les outils et la conformité autour.

***

## 2. Agentic AI : des assistants aux agents orchestrés qui exécutent des workflows

L’évolution la plus marquante depuis 2024–2025 est l’émergence de l’**Agentic AI** : des systèmes qui ne font plus que répondre à des prompts, mais qui poursuivent des objectifs, planifient des étapes, appellent des outils et agissent dans les systèmes avec supervision humaine.[^1_4][^1_3]

Tendances observées :

- Les grandes plateformes cloud (OpenAI, AWS, Google, etc.) proposent désormais nativement des **agents** capables d’orchestrer des appels d’API, de manipuler des interfaces logicielles (“computer use”), d’exécuter des actions dans CRM/ERP, etc.[^1_4]
- Les architectures multi‑agents émergent : plusieurs agents spécialisés collaborent (un agent “plan”, un agent “contrôle qualité”, un agent “compliance”, un agent “ops IT”...) pour exécuter un processus complexe.[^1_5][^1_4]
- Côté adoption :
    - McKinsey 2025 : ~23% des organisations déclarent être en phase de **scaling** d’un système agentique dans au moins une fonction, et 39% expérimentent déjà des AI agents.[^1_6]
    - D’autres analyses évoquent “près de 8 entreprises sur 10” ayant intégré des agents autonomes dans leurs workflows à l’horizon 2025, au moins sur un périmètre limité.[^1_7]

Exemples de cas d’usage concrets en entreprise :

- **Back‑office / middle‑office** : un agent suit un dossier de bout en bout (ouverture, vérification documentaire, relances, mise à jour de systèmes, préparation des rapports) avec validation humaine aux étapes critiques.
- **Supply chain \& logistique** : un ensemble d’agents surveille les stocks, prédit des ruptures, déclenche des réapprovisionnements, gère des litiges fournisseurs.
- **Qualité / conformité** : des agents parcourent les changements d’ingénierie, vérifient les impacts réglementaires (RDM, RED, ERP, AI Act, etc.) et ouvrent automatiquement des actions correctives.

Implications techniques :

- Besoin de **micro‑services**, d’architectures orientées événements, de **vector databases** et de moteurs de RAG robustes pour permettre à ces agents d’agir et de raisonner à partir du SI existant.[^1_8][^1_4]
- Besoin d’outillage MLOps / “agent‑ops” pour monitorer, loguer et auditer les décisions des agents.

Pour la transformation des personnels :

- On ne délègue plus une tâche isolée, mais **un résultat** : l’humain devient “manager d’agents”, valide, corrige, supervise et améliore les stratégies des agents.
- Cela redéfinit les compétences nécessaires : moins de saisie, plus de formulation d’objectifs, d’analyse critique et de pilotage de systèmes autonomes.

***

## 3. Human‑Centered AI \& Industry 5.0 : l’AI comme amplificateur du travail humain

L’Industry 5.0, telle que promue par la Commission européenne, place le travailleur au centre du système productif : augmentation des capacités humaines, durabilité et résilience avant tout.[^1_9]

Les travaux récents sur l’**Human‑Centered AI (HCAI)** convergent sur plusieurs points :[^1_10][^1_11][^1_12]

- L’objectif n’est plus d’optimiser uniquement la productivité, mais de **co‑construire** des systèmes où l’humain reste le décideur et le porteur de sens.
- Les systèmes AI doivent être : transparents, interprétables, alignés avec les valeurs, capables d’interagir de manière intuitive (langage naturel, vision, gestuelle).[^1_11][^1_10]
- On voit apparaître des interfaces homme‑machine sophistiquées (NLP avancé, vision, XR) qui rendent la collaboration homme‑machine plus fluide, y compris pour la formation et la requalification des opérateurs.[^1_10][^1_11]

Un éditorial de 2024 sur l’Industry 5.0 rappelle que la HCAI est au cœur de cette nouvelle phase industrielle, garantissant que l’AI **augmente** les capacités humaines tout en assurant transparence et standards éthiques élevés.[^1_9]

Pour les personnels, cela se traduit par :

- Des outils AI conçus comme **assistants de décision**, pas comme “boîtes noires”.
- Des systèmes qui intègrent explicitement des boucles de rétroaction humaines : validation, contestation, explication.
- Un repositionnement des métiers vers la supervision, l’exploration créative, la coordination homme‑machine.

***

## 4. Cobots, robots mobiles et Edge AI : matérialisation de l’Industry 5.0

La convergence AI + robotique collaborative + edge computing est une autre évolution clé pour l’innovation 5.0.

Tendances :

- Les **cobots** (collaborative robots) sont vus comme une des pierres angulaires d’Industry 5.0 : ils travaillent **aux côtés** des opérateurs, avec des capteurs avancés, de la vision et du ML pour s’adapter en temps réel.[^1_13][^1_14][^1_15][^1_16]
- Marché des cobots en croissance exponentielle (CAGR > 30% jusqu’en 2030), porté par l’automobile, la logistique, la santé, etc.[^1_15][^1_13]
- Les rapports industriels récents soulignent que ces cobots deviennent des “partenaires” plutôt que des simples outils, avec des gains de cycle time pouvant atteindre 20% et des réductions de coûts de 15% dans certains cas d’assemblage automobile.[^1_14]
- Au niveau plus global, le marché Industry 5.0 est attendu à ~255,7 Md\$ en 2029 (contre 65,8 Md\$ en 2024), avec un CAGR d’environ 31%.[^1_16]

L’**Edge AI** (vision embarquée, traitement sur la machine) permet :

- Détection temps réel d’anomalies qualité, de défauts sécurité,
- Pilotage autonome d’AMR/AGV intelligents,
- Réactivité sans latence cloud pour des applications critiques.[^1_17][^1_14]

Pour les opérateurs :

- Sécurité accrue (collaboration sécurisée, détection de présence, ergonomie),
- Délestage des tâches pénibles ou répétitives,
- Possibilité de mass‑customization : l’AI + cobot gèrent la flexibilité, l’opérateur se concentre sur la personnalisation, la qualité perçue, la relation client.

***

## 5. Générative + prédictive AI au cœur des jumeaux numériques

Les jumeaux numériques évoluent rapidement d’outils de simulation statique vers des **systèmes cognitifs** intégrant plusieurs formes d’AI : prédictive, générative, explicable, context‑aware, agentique.[^1_18][^1_19][^1_20]

Des travaux récents proposent des cadres d’**AI‑enabled Digital Twins (AI‑DT)** pour la fabrication qui :[^1_21][^1_18]

- Intègrent :
    - Générative AI pour la génération de données synthétiques, l’exploration d’espace de conception, la reconstruction 3D à partir de vidéos/senseurs,
    - Prédictive AI pour le forecasting temps réel, la détection d’anomalies, la maintenance prédictive,
    - Explainable AI pour rendre les décisions transparentes,
    - Context‑Aware AI pour adapter les décisions aux variations d’environnement,
    - Agentic AI pour un contrôle autonome et décentralisé des processus.[^1_18]
- Visent explicitement la transition “jumeau 4.0” → “jumeau 5.0” : systèmes résilients, auto‑optimisants, alignés avec les objectifs de durabilité (“twin transition” numérique + vert).[^1_20][^1_18]

Pour la R\&D et l’industrialisation :

- Capacité à explorer des variantes de conception produit/process via GAI, avant investissement industriel massif.
- Boucles fermées : données capteurs → jumeau → recommandations de réglage → action automatisée (souvent via agents et cobots).
- En intégrant un volet explicable et context‑aware, on garde l’opérateur dans la boucle tout en maximisant le niveau d’automatisation.

On voit émerger des approches combinant expertise humaine et generative AI pour concevoir les jumeaux, avec des cadres méthodologiques validés sur des micro‑machines ou lignes pilotes.[^1_19]

***

## 6. Évolution de la stack AI d’entreprise : RAG, BPM augmenté \& “Private Enterprise Brain”

Pour rendre ces technologies opérationnelles, la stack AI d’entreprise évolue dans plusieurs directions :

1. **RAG comme standard de personnalisation**
    - Les entreprises standardisent des pipelines **Retrieval‑Augmented Generation** pour injecter le contexte métier (documents, bases de connaissances, IoT) dans les modèles sans les réentraîner.[^1_4]
    - Les offres managées (Vertex AI RAG Engine, Azure AI Search, etc.) fournissent ingestion, indexation hybride (vectorielle + symbolique), et orchestration pour les agents.[^1_4]
2. **“Private Enterprise Brain”**
    - Construction de “corpus unifiés” où les workflows, procédures, démonstrations de tâches et best practices sont documentés pour être exploitables par des modèles multimodaux.[^1_22]
    - Des travaux récents montrent que des FMs multimodaux peuvent analyser des démonstrations de workflows (vidéos, captures, docs) pour documenter, transférer et améliorer des processus métier, dépassant les limites des outils BPM classiques.[^1_22]
3. **Intégration dans ERP / PLM / MES / CRM**
    - L’évolution majeure n’est plus “un chatbot à côté”, mais des **copilots nativement intégrés** aux systèmes de gestion : ERP 5.0 avec AI agents qui orchestrent les flux, supervisent les exceptions, préparent des plans d’actions.[^1_23]

Pour les employés, cela signifie :

- Moins de temps passé à naviguer dans des systèmes complexes, plus de temps à interagir avec un copilot unifié qui “comprend” les processus et les données de l’entreprise.
- On passe d’un modèle “skill = savoir utiliser l’outil X” à “skill = savoir dialoguer avec des systèmes intelligents pour obtenir le bon résultat, puis exercer un jugement critique”.

***

## 7. Gouvernance \& EU AI Act : la conformité comme brique d’architecture

En Europe, les dernières évolutions technologiques ne peuvent être dissociées du **cadre réglementaire**.

État des lieux (AI Act \& Omnibus) :

- L’**AI Act** entre en application progressive :
    - Dès 2 février 2025 : les interdictions concernant certains systèmes à risque inacceptable sont effectives.[^1_24]
    - 2 août 2025 : obligations pour les fournisseurs de modèles d’AI à usage général (GPAI), et mise en place de l’infrastructure de gouvernance (organismes notifiés, etc.).[^1_25][^1_24]
    - 2 août 2026 : application complète pour les systèmes à haut risque, avec des exigences fortes en matière de gestion des risques, qualité des données, transparence, surveillance post‑marché, etc.[^1_25][^1_24]
- Un projet de **Digital Omnibus on AI** (2025) vise à simplifier et clarifier certains aspects : prolongation de certains délais, allègement documentaire pour PME/ETI (small mid‑caps jusqu’à 750 employés / 150 M€ CA), extensions de sandboxes réglementaires, etc.[^1_26][^1_27][^1_28]

Conséquences pour la transformation digitale :

- La conformité (risk management, data governance, documentation, post‑market monitoring) devient une **brique standard** de la plateforme AI, au même titre que le moteur de RAG ou l’orchestration d’agents.
- Avantage stratégique pour les entreprises qui intègrent dès maintenant :
    - **Cartographie des cas d’usage** selon les catégories de risque,
    - Conformité‑by‑design (traçabilité des données, logs, explicabilité, H‑in‑the‑loop),
    - Programmes d’**AI literacy** pour les personnels, qui sont explicitement encouragés par l’AI Act pour assurer un usage responsable.[^1_25]

L’Industrialisation 5.0 se joue donc sur deux rails parallèles : **progrès technique** et **maturité de gouvernance**.

***

## 8. Transformation des personnels : du “digital worker” au “AI‑augmented worker 5.0”

Toutes ces évolutions techniques n’ont de sens que si elles transforment concrètement le travail.

Tendances majeures côté compétences et travail humain :

- L’AI dans l’Industry 5.0 vise explicitement à **renforcer et re‑qualifier** la main‑d’œuvre, via des outils de formation et de simulation AI‑enabled (simulateurs, jumeaux numériques pédagogiques, coaching en temps réel).[^1_11][^1_10]
- Des AI copilots métiers (ingénierie, maintenance, qualité, achat, RH, etc.) deviennent des “compagnons de travail” quotidiens, avec un impact comparable à l’arrivée du PC ou d’Internet, mais en plus personnalisé.
- Le rôle de l’humain se déplace :
    - De l’exécution à la **conception, supervision, arbitrage**,
    - De la mémorisation de règles à la **capacité de juger, d’interpréter, d’expliquer** ce que proposent les systèmes AI,
    - De la maîtrise d’un seul processus à une vision plus systémique des interactions dans l’écosystème 5.0 (technique + social + environnemental).

Dans un cadre 5.0, la transformation des personnels n’est plus un “sous‑projet HR” mais une **dimension architecturale** : comment concevoir les agents, jumeaux et cobots pour qu’ils augmentent réellement les capacités humaines, au lieu de les déqualifier.

***

## 9. Comment traduire cela en feuille de route concrète pour l’innovation 5.0

Pour une entreprise industrielle européenne visant une transformation 5.0, les **technologies AI nécessaires** à court–moyen terme se structurent bien si l’on raisonne en “couches” :

1. **Socle réglementaire \& data**
    - Cartographier les cas d’usage et systèmes potentiellement **à haut risque** au sens de l’AI Act.
    - Mettre en place un **data backbone** compatible avec les futures exigences : qualité, gouvernance, traçabilité, sécurité, souveraineté.
2. **Infrastructure cognitive**
    - Choisir un ou plusieurs **modèles de fondation multimodaux** (cloud et/ou self‑hosted) comme socle.
    - Déployer un cadre RAG robuste (indexation documentaire, data produits/process, données temps réel) et une stratégie “Private GPT” pour les contenus sensibles.[^1_1][^1_4]
3. **Copilots métiers \& BPM augmenté**
    - Construire des copilots par familles de métiers (conception, industrialisation, maintenance, achats, qualité, conformité) intégrés au SI existant.
    - Exploiter les capacités multimodales pour documenter, expliquer et **améliorer** les workflows (BPM augmenté par FMs).[^1_22]
4. **Agentic AI sur des domaines ciblés**
    - Identifier quelques processus où des **agents orchestrés** peuvent boucler la chaîne de valeur (demande → traitement → mise à jour systèmes → reporting), avec humains dans la boucle pour les décisions critiques.[^1_8][^1_6][^1_4]
    - Mettre en place un cadre de monitoring, de tests et de validation continue des agents (KPIs, biais, sécurité).
5. **Couche physique : cobots, edge AI \& jumeaux numériques**
    - Étendre ces capacités cognitives vers le terrain : cobots AI‑enabled, vision embarquée, AMR, jumeaux numériques couplant prédictif et génératif.[^1_14][^1_17][^1_18]
    - Concevoir les jumeaux comme plateformes d’expérimentation pour l’optimisation process, la formation et la circularité (re‑fabrication, remanufacturing).
6. **Human‑Centered by design**
    - Intégrer dès la conception des systèmes :
        - Des interfaces naturelles (langage, gestes, AR/VR),
        - L’explicabilité et la contestabilité,
        - Des parcours de montée en compétence (AI literacy, co‑design homme‑machine).[^1_23][^1_10][^1_9]

***

### En synthèse

Les “dernières évolutions” ne sont pas seulement de nouveaux modèles plus puissants, mais un **changement de paradigme** :

- De modèles spécialisés à des **modèles de fondation multimodaux** intégrés partout,
- De l’assistance ponctuelle au **travail d’agents orchestrés** dans les systèmes métier,
- De l’automatisation 4.0 centrée machine à une **Industry 5.0 human‑centric**,
- De la simple conformité “a posteriori” à une **AI gouvernée par design** dans le cadre de l’AI Act.

Pour un ingénieur et leader de transformation comme vous, le vrai levier est d’architecturer ces briques dans une trajectoire progressive : copilots → agents → jumeaux \& cobots → écosystème 5.0, en alignant en permanence technologie, compétences humaines et exigences réglementaires.

Si vous le souhaitez, on peut, à partir de cette cartographie, détailler :

- une **architecture de référence** (cloud/hybride) pour un site industriel 5.0 en contexte AI Act,
- ou un **roadmap 3 ans** de déploiement AI (use cases, stack techno, jalons réglementaires, plan compétences).
<span style="display:none">[^1_29][^1_30]</span>

<div align="center">⁂</div>

[^1_1]: https://www.linkedin.com/pulse/multimodal-foundation-models-enterprise-why-ai-matters-esumane-xtykf

[^1_2]: https://www.uniphore.com/blog/enterprise-ai-trends-2025/

[^1_3]: https://gradientflow.com/foundation-models-whats-next-for-2025-and-beyond/

[^1_4]: https://svitla.com/blog/agentic-ai-trends-2025/

[^1_5]: https://www.linkedin.com/pulse/agentic-ai-trends-2025-what-enterprises-must-qgt1c

[^1_6]: https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai

[^1_7]: https://www.aibmag.com/ai-for-business-strategy-and-transformation/agentic-ai-enterprise-automation-2025/

[^1_8]: https://www.bain.com/insights/building-the-foundation-for-agentic-ai-technology-report-2025/

[^1_9]: https://pmc.ncbi.nlm.nih.gov/articles/PMC11194418/

[^1_10]: https://deepscienceresearch.com/dsr/catalog/book/3/chapter/5

[^1_11]: https://deepscienceresearch.com/index.php/dsr/catalog/book/3/chapter/5

[^1_12]: https://www.sciencedirect.com/science/article/abs/pii/S2452414X25001268

[^1_13]: https://www.grandviewresearch.com/blog/role-collaborative-robots-cobots-new-era

[^1_14]: https://www.edge-ai-vision.com/2025/07/the-rise-of-collaborative-robots-technical-and-commercial-insights/

[^1_15]: https://revtechsys.com/en/blog-in-robotics-automation/industry-5.0-the-role-of-collaborative-robots-in-this-new-era

[^1_16]: https://www.linkedin.com/pulse/ai-cobots-personalization-technology-shaping-industry-kumarran-swgwf

[^1_17]: https://www.idc.com/getdoc.jsp?containerId=US52347524

[^1_18]: https://pmc.ncbi.nlm.nih.gov/articles/PMC12753877/

[^1_19]: https://fredfactory.mit.edu/post/digital-twin-designs-with-generative-ai

[^1_20]: https://www.mckinsey.com/featured-insights/mckinsey-explainers/what-is-digital-twin-technology

[^1_21]: https://www.frontiersin.org/journals/artificial-intelligence/articles/10.3389/frai.2025.1655470/full

[^1_22]: https://arxiv.org/html/2406.13264v1

[^1_23]: https://www.forbes.com/sites/moorinsights/2025/07/29/erp-shifts-to-industry-50-to-enable-smarter-human-centric-operations/

[^1_24]: https://www.legalnodes.com/article/eu-ai-act-2026-updates-compliance-requirements-and-business-risks

[^1_25]: https://digital.nemko.com/insights/navigating-the-eu-ai-act-in-2025

[^1_26]: https://www.cooley.com/news/insight/2025/2025-11-24-eu-ai-act-proposed-digital-omnibus-on-ai-will-impact-businesses-ai-compliance-roadmaps

[^1_27]: https://oliverpatel.substack.com/p/whats-next-for-eu-ai-act-simplification

[^1_28]: https://cdp.cooley.com/eu-ai-act-proposed-digital-omnibus-on-ai-will-impact-businesses-ai-compliance-roadmaps/

[^1_29]: https://2025.hci.international/c08.html

[^1_30]: https://aws.amazon.com/blogs/industries/the-transformative-impact-of-generative-ai-in-industrial-manufacturing-at-hannover-messe-2024/


---

# Développer avec plus de détails: On passe de “chatbots” à de vrais copilot(e)s métiers multimodaux capables de :Lire et commenter un dossier d’homologation CE (texte + tableaux + schémas),Extraire et relier des exigences de normes (EN/ISO),Préparer un dossier de fabrication ou un AMDEC à partir de gabarits existants, etc.Ces modèles deviennent le front‑end cognitif de l’ERP, du PLM, du MES, du CRM et des référentiels documentaires internes.En pratique, pour une entreprise 5.0, cela signifie :Penser les modèles de fondation comme “nouveau système d’exploitation cognitif” de l’entreprise, puis organiser les données, les droits, les outils et la conformité autour.

Voici le développement détaillé que vous avez demandé.

***

# Des chatbots aux copilotes métiers multimodaux : le modèle de fondation comme système d'exploitation cognitif de l'entreprise 5.0

## Résumé exécutif

La transformation en cours ne consiste pas à "ajouter un chatbot" aux systèmes existants. Elle opère un changement de nature : les modèles de fondation multimodaux deviennent une **couche d'intelligence unifiée** — un véritable système d'exploitation cognitif — à travers laquelle les personnels interagissent avec l'ensemble du système d'information de l'entreprise (PLM, ERP, MES, CRM, référentiels documentaires). Ce basculement redistribue les rôles : l'humain passe de la navigation entre systèmes complexes à la **formulation d'objectifs, la supervision critique et l'arbitrage**, tandis que l'AI traite, relie et prépare l'information à travers toutes les sources. Les enjeux critiques sont : la qualité de l'intégration données/outils, la gouvernance de l'information, la maturité des architectures RAG, et la conformité by-design dans le cadre de l'EU AI Act.

***

## 1. Anatomie d'un copilote métier multimodal : bien au-delà du chatbot

### 1.1 Ce qui change fondamentalement

Un chatbot classique répond à des questions dans un périmètre étroit, en texte seul, sans contexte persistant. Un **copilote métier multimodal** fait tout autre chose :

- Il ingère et raisonne sur **plusieurs modalités simultanément** : texte réglementaire, tableaux de données, schémas techniques, images de pièces, plans P\&ID, diagrammes fonctionnels, relevés capteurs. Les architectures de type LayoutLMv2 ou les modèles multimodaux récents (GPT-4o, Claude 3.5, Gemini) sont capables d'interpréter conjointement la structure spatiale d'un document, son texte et ses éléments visuels.[^2_1]
- Il maintient un **contexte métier persistant** : il "sait" quel projet, quel produit, quelle nomenclature, quel dossier d'homologation est en cours, et il relie les questions de l'utilisateur à ce contexte.
- Il **appelle des outils** : il ne fait pas que générer du texte — il interroge des bases de données, lance des requêtes sur le PLM, extrait des valeurs depuis l'ERP, compare avec des référentiels normatifs, le tout de façon orchestrée.


### 1.2 Trois cas d'usage industriels concrets

**a) Lecture et commentaire d'un dossier d'homologation CE**

Un dossier technique CE (au sens du Règlement Machines 2023/1230, des Directives Basse Tension, CEM, RED, etc.) est un assemblage hétérogène de centaines de pages : descriptions produit, analyses de risques, rapports d'essais, schémas électriques, notices d'instructions, Déclarations de Conformité. Traditionnellement, sa constitution et sa vérification mobilisent des semaines d'expertise humaine.

Les plateformes AI de nouvelle génération — comme xMarkings, qui automatise la pré-conformité, l'identification des directives applicables, la génération de dossiers techniques et de Déclarations de Conformité — montrent que l'AI peut désormais :[^2_2][^2_3]

- **Identifier automatiquement** les directives et normes harmonisées applicables à partir de la description du produit,
- **Générer des gabarits pré-remplis** de dossiers techniques avec les sections requises par chaque directive,
- **Croiser les exigences** pour détecter les incohérences et les gaps documentaires,
- **Préparer la Déclaration de Conformité** au format correct pour chaque directive, avec les références de normes, dates, et informations d'organisme notifié.

Les outils RegTech avancés vont plus loin : ils scannent les textes réglementaires par NLP, extraient les phrases d'obligation ("le fabricant doit…"), les structurent en exigences traçables, et génèrent des checks automatisés liés à la documentation correspondante — tout en maintenant l'étape finale de **sign-off humain** pour le jugement contextuel, la proportionnalité et la responsabilité.[^2_4]

Un cas concret documenté : un fabricant d'équipements industriels utilisant une plateforme AI multimodale a réduit son cycle de documentation de **6 semaines à 2 semaines**, avec un taux de succès aux audits de conformité passant de 78% à 96%, et un ROI de 340% en 18 mois.[^2_5]

**b) Extraction et mise en relation d'exigences de normes EN/ISO**

L'exercice de **mapping normatif** — relier les exigences essentielles d'une directive européenne aux clauses des normes harmonisées EN/ISO correspondantes — est l'un des plus chronophages et les plus sujets à erreur dans le processus d'homologation.

Avec les modèles multimodaux et le RAG, un copilote peut :

- Parcourir un corpus de normes harmonisées (ex. : EN ISO 12100, EN 60204-1, EN ISO 13849) et en extraire les exigences structurées,
- Les relier aux exigences essentielles du règlement (ex. : Annexe III du Règlement Machines),
- Construire une **matrice de traçabilité exigences ↔ normes ↔ preuves** mise à jour dynamiquement,
- Alerter sur les changements normatifs (nouvelles versions, normes retirées) via du horizon scanning automatisé.

Le CEN-CENELEC JTC 21 développe actuellement les normes harmonisées spécifiques à l'AI Act, et des outils de mapping interactifs commencent à rendre cette traçabilité accessible.[^2_6][^2_7] La même logique s'applique aux normes produit/process classiques : le copilote construit un pipeline vivant **intent juridique → principes de conception → contrôles → preuves**.[^2_4]

**c) Préparation d'un dossier de fabrication ou d'une AMDEC**

L'AMDEC (Analyse des Modes de Défaillance, de leurs Effets et de leur Criticité) est un exercice fondamental de la gestion des risques produit/process. Historiquement réalisée sous Excel, elle souffre de limites bien connues : traçabilité insuffisante, collaboration en temps réel quasi impossible, capitalisation du savoir fragmentée, conformité aux référentiels (AIAG-VDA, EN 9145) difficile à maintenir.[^2_8]

La digitalisation de l'AMDEC par des outils dédiés (comme Skill FMEA Pro, conforme aux standards AIAG, AIAG-VDA, VDA, IAQG EN9145) représente déjà un progrès majeur.[^2_8][^2_9] La prochaine étape, que les modèles de fondation rendent accessible, consiste à :

- **Pré-remplir** une AMDEC produit/process à partir de gabarits génériques (core FMEA) et des données de conception (BOM, spécifications, historique qualité),
- **Suggérer des modes de défaillance** à partir de la capitalisation des projets précédents et de bases de connaissances sectorielles,
- **Calculer et hiérarchiser** les indices de criticité (S×O×D ou AP selon AIAG-VDA) en croisant données terrain et modèles prédictifs,
- **Relier chaque ligne AMDEC** aux actions correctives, aux documents de preuve et aux exigences normatives traçables.

Le même principe s'applique à la préparation de dossiers de fabrication : le copilote peut assembler les gammes, nomenclatures, plans de contrôle, fiches d'instruction et check-lists à partir des données PLM/ERP, en vérifiant la cohérence et la complétude.

***

## 2. L'état de l'art des copilotes PLM/ERP : ce qui est réel en 2025–2026

### 2.1 Le paysage des trois grands éditeurs PLM

L'année 2025 marque un tournant : pour la première fois, les ingénieurs peuvent réellement interroger leurs données PLM en langage naturel et obtenir des réponses vérifiées.[^2_10] Voici l'état des lieux :


| Éditeur | Produit AI | Capacités actuelles | Vision stratégique |
| :-- | :-- | :-- | :-- |
| **Siemens** | Teamcenter Copilot + Industrial AI Agents | Chat sur BOM/documents, image-to-part search (Azure Vision AI), résumé mono-document, NLP sur données Teamcenter. Operations Copilot pour shop floor (fin 2025). Architecture multi-agents avec orchestrateur.[^2_11][^2_12][^2_13] | Marketplace d'agents industriels sur Xcelerator. Agents digitaux + physiques (robots mobiles). Productivité +50% visée. |
| **PTC** | Windchill AI + Document Vault AI Agent + Codebeamer AI + ServiceMax AI | Extraction d'information depuis documents Windchill, agent "Document Vault" pour sourcer specs, résultats d'essais, données qualité. Stratégie "Advise → Assist → Automate".[^2_14][^2_15][^2_16] | Agentic AI explicite cross-digital-thread : PLM + ALM + service terrain orchestrés par agents. |
| **Dassault Systèmes** | Virtual Companions (Aura, Leo, Marie) | Aura disponible : assistant AI contextuel langage naturel, accès workflows, recherche d'information. Plateforme agentique 3DEXPERIENCE capable d'orchestrer des milliers de companions + humains de façon asynchrone.[^2_17][^2_18][^2_19] | "Économie Générative" : les compagnons virtuels incarnent des décennies de savoir-faire industriel, enseignent, raisonnent et orchestrent. |

**Constat critique** : fin 2025, ces copilotes sont encore majoritairement des copilotes **en lecture seule** — excellents pour chercher, résumer et expliquer les données, mais pas encore pour **agir** dans les systèmes (créer un ECO, modifier une BOM, déclencher un workflow).[^2_10] La traçabilité (citer d'où viennent les insights) est devenue la "monnaie de confiance" : seuls les copilotes capables de prouver leurs sources sont réellement utilisés par les équipes.[^2_10]

### 2.2 Au-delà du copilot : vers des systèmes d'agents PLM

L'analyse architecturale la plus pénétrante du paysage PLM+AI, publiée fin 2025 par Oleg Shilovitsky (BeyondPLM), pointe un problème structurel fondamental :[^2_20]

> **Intégrer l'AI dans un système PLM ne rend pas l'architecture PLM prête pour les agents.** Cela ne fait qu'ajouter une nouvelle surface d'interface utilisateur.

Les raisons :

1. **Les bases de données PLM conçues il y a 25+ ans** ne sont pas faites pour le raisonnement d'agents : elles gèrent des enregistrements structurés, pas des fenêtres de contexte dynamiques, des traces de raisonnement ou de la mémoire multi-agents.[^2_20]
2. **Les workflows industriels traversent PLM, CAD, ERP, MES, simulation, achats, portails fournisseurs** : un agent enfermé dans le PLM est piégé dans le même silo que le PLM tentait de briser depuis 20 ans.[^2_20]
3. **Le digital thread est intrinsèquement distribué** : aucun éditeur ne le possède entièrement.

La conclusion : l'avenir n'est pas le copilot dans le PLM, mais un **système d'agents orchestrant des workflows à travers le digital thread**, avec une couche de "product memory" (graphe de connaissances produit) et une couche d'orchestration multi-agents **au-dessus** des systèmes existants.[^2_20]

***

## 3. Le modèle de fondation comme "Système d'exploitation cognitif" de l'entreprise

### 3.1 Le concept de Cognitive Operating System (COS)

L'idée centrale est de penser les modèles de fondation non pas comme des outils isolés, mais comme un **Cognitive Operating System** — une couche d'intelligence unifiée qui :

- **Agrège les données** de tous les systèmes métier (PLM, ERP, MES, CRM, GED, IoT) en une source de vérité unifiée,[^2_21]
- **Apprend en continu** des patterns métier, des comportements utilisateurs et des changements de contexte,
- **Orchestre les activités** de façon transversale entre départements et systèmes,
- **Anticipe** les problèmes et opportunités via de l'intelligence prédictive.[^2_21]


### 3.2 L'architecture concrète : quatre couches

Pour matérialiser ce concept, l'architecture repose sur quatre couches interdépendantes :

**Couche 1 — Data Fabric + Knowledge Graph (le "système circulatoire")**

Le data fabric crée des chemins intelligents qui découvrent, connectent et livrent automatiquement les données à travers les environnements hybrides et multi-cloud. Le knowledge graph superpose une compréhension sémantique, transformant les flux de données brutes en réseaux d'information contextuellement riches que les modèles AI peuvent interpréter et exploiter.[^2_22][^2_23]

En pratique :

- Un graphe de connaissances produit (items, BOM, exigences, résultats simulation, processus fabrication, alternatives, historiques coûts, pièces fournisseurs, boucles qualité, événements service terrain) qui **traverse les systèmes** sans les remplacer.[^2_20][^2_23]
- Des connecteurs fédérés : les serveurs MCP (Model Context Protocol) se connectent aux systèmes existants sans migration massive de données.[^2_23]
- Approche d'augmentation, pas de remplacement : le knowledge graph se superpose aux SI existants en préservant les workflows.[^2_23]

**Couche 2 — RAG Enterprise (le "moteur de contextualisation")**

Le RAG (Retrieval-Augmented Generation) est devenu le standard de facto pour injecter le contexte métier dans les modèles de fondation sans les réentraîner. Mais en 2025, la réalité est nuancée : 40 à 60% des implémentations RAG échouent à atteindre la production, à cause de problèmes de qualité de retrieval, de gaps de gouvernance et d'incapacité à expliquer les décisions aux régulateurs.[^2_24]

L'évolution en cours (2026–2030) va du "pipeline RAG" vers un **knowledge runtime** autonome qui orchestre retrieval, raisonnement, vérification et gouvernance comme des opérations unifiées.[^2_24] Les caractéristiques clés :

- Traçabilité cryptographique de bout en bout (provenance des sources),
- Contrôle d'accès natif au niveau document (RBAC, ACL temps réel),
- Modules de compliance intégrés : audit trails automatisés, détection de biais, documentation réglementaire,[^2_24][^2_25]
- Évaluation systématique (frameworks RAGAS, Galileo) dès le jour 1 du déploiement.[^2_24]

**Couche 3 — Orchestration multi-agents (le "système nerveux")**

C'est la couche la plus critique et la moins mature. Elle doit :

- Coordonner le comportement des agents (routage de contexte, gestion des permissions, médiation de l'accès aux outils),
- Tracer les étapes de raisonnement et logguer les actions,
- Gérer les budgets d'exécution et résoudre les conflits,
- Permettre l'escalade vers l'humain aux points de décision critiques.

Siemens est le plus avancé sur ce plan avec son architecture orchestrateur + agents spécialisés sur la Xcelerator Platform, incluant un marketplace d'agents tiers planifié.[^2_11] Microsoft, avec Copilot Studio, permet désormais de connecter plusieurs agents entre eux pour accomplir des tâches larges et complexes, tout en supportant le standard ouvert MCP pour l'interopérabilité inter-fournisseurs.[^2_26][^2_27]

**Couche 4 — Interfaces homme-machine naturelles (le "front-end cognitif")**

Le copilote métier est l'interface visible. Mais son efficacité dépend des trois couches précédentes. Les caractéristiques qui distinguent un vrai copilot métier d'un chatbot :

- Interaction en **langage naturel** contextualisée au projet/produit en cours,
- Capacité **multimodale** : montrer un schéma et poser une question dessus, uploader une image de pièce pour trouver l'article correspondant (image-to-part search de Teamcenter),[^2_12][^2_13]
- **Traçabilité des réponses** : chaque affirmation cite ses sources (document, norme, enregistrement BOM),
- **Itérativité** : le contenu généré peut être affiné et édité en temps réel.[^2_28]


### 3.3 Architecture hybride de modèles : l'insight clé de 2025

Un insight majeur de 2025 : l'efficacité ne vient pas d'un modèle unique géant, mais d'**architectures hybrides** qui mélangent des modèles spécialisés plus petits (pour la compliance, le raisonnement normatif, les calculs) avec des modèles généraux larges (pour la fluence linguistique et la multimodalité). Ces systèmes hybrides atteignent des performances comparables aux modèles monolithiques à une fraction du coût.[^2_29]

Siemens illustre cette approche : le Teamcenter Copilot supporte GPT-4o via Azure OpenAI, Claude via AWS Bedrock, et Llama en on-premise, offrant une flexibilité de déploiement alignée avec les exigences de souveraineté.[^2_20][^2_13]

***

## 4. Organiser les données, les droits, les outils et la conformité autour du COS

### 4.1 Gouvernance des données : le prérequis non-négociable

Sans données bien gouvernées, le COS ne fonctionne pas. Les piliers :

- **Classification documentaire** : définir la base légale, les règles de rétention et de masquage, réaliser les DPIA nécessaires,[^2_30]
- **Sécurité au niveau document** : RBAC, gestion des secrets, isolation des modèles, logs d'audit, alignement sur les guidelines NCSC/CISA,[^2_30]
- **Qualité des données** : le RAG enterprise n'est utile que si les données qu'il retrouve sont fiables, à jour et non contradictoires.


### 4.2 Conformité AI Act intégrée à l'architecture

La gouvernance ne peut pas être "boulonnée après coup" sur les systèmes RAG et les agents — elle doit être **architecturalement intégrée**. Les implémentations les plus avancées :

- Documentent automatiquement les décisions de retrieval (audit trails),
- Maintiennent la chaîne de traçabilité des sources,
- Détectent les biais dans le ranking de retrieval,
- Évaluent automatiquement la conformité aux exigences réglementaires.[^2_24]

Les normes harmonisées en cours de développement par le CEN-CENELEC JTC 21 (en réponse à la demande de standardisation de la Commission) couvrent : gestion des risques, gouvernance et qualité des données, tenue d'enregistrements, transparence, supervision humaine, spécifications de précision et de robustesse, et évaluation de conformité.[^2_31][^2_6] La norme ISO/IEC 42001 (système de management de l'AI) est attendue comme probable future norme harmonisée européenne.[^2_31]

### 4.3 Gestion des droits et rôles

Le COS doit respecter et appliquer les permissions existantes de l'entreprise :

- Les copilotes PLM comme Teamcenter Copilot opèrent dans le périmètre des permissions existantes de l'utilisateur,[^2_10]
- Le RAG enterprise doit implémenter un contrôle d'accès granulaire, massivement scalable, avec ACL temps réel et audit trails complets,[^2_25]
- Les agents doivent avoir des **identités explicites**, des permissions limitées, des budgets d'exécution et une auditabilité complète — la sécurité vit dans la couche d'orchestration, pas dans le modèle.[^2_20]

***

## 5. Implications pour la transformation des personnels et l'innovation 5.0

### 5.1 Redéfinition des compétences

Le passage du chatbot au copilote métier redéfinit profondément les compétences nécessaires :


| Compétence "ancienne" | Compétence "COS-native" |
| :-- | :-- |
| Naviguer entre 5-10 applications métier | Formuler des objectifs en langage naturel et valider les résultats |
| Compiler manuellement un dossier CE | Superviser un agent qui assemble le dossier, vérifier la complétude et la pertinence |
| Rédiger une AMDEC depuis zéro sous Excel | Piloter un copilote qui capitalise les AMDEC précédentes et en pré-génère une nouvelle |
| Chercher manuellement les normes applicables | Superviser le mapping automatique exigences ↔ normes et valider les gaps |
| Mémoriser les processus et règles métier | Exercer un jugement critique sur les recommandations des agents |

### 5.2 Le skills gap comme accélérateur

Siemens le dit explicitement : le Copilot industriel adresse le **skills gap** dans la fabrication. À l'usine Siemens de Bad Neustadt, le Production Copilot a transformé les opérations en convertissant des données dispersées en insights actionnables. Chez thyssenkrupp Automation Engineering, le déploiement global a amélioré la qualité du code et la vitesse de développement.[^2_11]

### 5.3 L'humain comme "manager d'agents"

Dans le paradigme 5.0, l'opérateur, l'ingénieur ou le responsable qualité ne disparaît pas : il devient le **superviseur critique** d'un écosystème d'agents. Comme le résume Rainer Brehm (CEO Factory Automation, Siemens) :

> *"Nous envisageons un futur où les agents AI industriels travaillent de façon transparente aux côtés des travailleurs humains, gérant les processus routiniers de façon autonome tout en permettant aux humains de se concentrer sur l'innovation, la créativité et la résolution de problèmes complexes."*[^2_11]

***

## 6. Conclusion : recommandations et feuille de route stratégique

### 6.1 Recommandations clés

1. **Penser "Cognitive OS", pas "chatbot"** : le modèle de fondation n'est pas un gadget à ajouter — c'est une nouvelle couche d'infrastructure qui restructure la façon dont les données, les outils et les personnes interagissent.
2. **Commencer par le "toil"** (Vercel) : identifier les tâches répétitives, vérifiables et à haute friction (mapping métadonnées, validation révisions, préparation ECO, vérification compliance, assemblage données fournisseurs) et les automatiser en premier.[^2_20]
3. **Architecturer au-dessus des systèmes, pas à l'intérieur** : ne pas enfermer l'intelligence dans un seul PLM ou ERP, mais construire une couche de product memory + orchestration qui traverse le digital thread.[^2_20]
4. **Intégrer la governance dès le jour 1** : traçabilité des sources, audit trails, RBAC, compliance-by-design — ce n'est pas un "nice-to-have", c'est une exigence AI Act et un facteur de confiance des équipes.[^2_24][^2_4]
5. **Adopter une architecture hybride de modèles** : combiner modèles de fondation large + modèles spécialisés domaine + RAG enterprise, avec flexibilité cloud/on-premise pour la souveraineté.[^2_29]

### 6.2 Feuille de route d'actions en 4 phases

| Phase | Horizon | Actions clés |
| :-- | :-- | :-- |
| **1 – Fondation** | 0-6 mois | Cartographier les cas d'usage par catégorie de risque AI Act. Inventorier et qualifier les données clés (PLM, ERP, GED, normes). Déployer un premier pipeline RAG sur un périmètre documentaire ciblé (ex. : corpus normatif EN/ISO). Lancer un programme d'AI literacy. |
| **2 – Copilotes métiers** | 6-18 mois | Déployer des copilotes intégrés au PLM/ERP (Teamcenter Copilot, Windchill AI, ou équivalent). Construire un premier "Private Enterprise Brain" (corpus unifié des procédures, gabarits, best practices). Automatiser la préparation de dossiers CE et la capitalisation AMDEC. |
| **3 – Agents orchestrés** | 12-24 mois | Piloter des agents multi-systèmes sur des workflows clés (gestion changements ingénierie, compliance monitoring, supply chain). Mettre en place un product memory graph fédéré. Déployer un cadre de monitoring, test et validation continue des agents. |
| **4 – Écosystème 5.0** | 18-36 mois | Intégrer agents digitaux + physiques (cobots, AMR). Connecter jumeaux numériques cognitifs (prédictif + génératif). Ouvrir le marketplace d'agents à des tiers. Optimiser en continu via les retours terrain et les évolutions réglementaires (normes harmonisées, OJEU). |

Cette feuille de route s'inscrit dans la logique de causalité structurelle que vous pratiquez : chaque phase crée les **préconditions nécessaires** à la suivante. Sans données gouvernées (Phase 1), les copilotes hallucinent. Sans copilotes validés (Phase 2), les agents n'ont pas de boucle de confiance. Sans agents orchestrés (Phase 3), l'écosystème 5.0 reste un assemblage fragmenté.

L'enjeu ultime, dans la perspective de Herbert Simon et des neurosciences de Damasio, est que ce système d'exploitation cognitif ne remplace pas le jugement humain — il **libère la bande passante cognitive** nécessaire pour l'exercer là où il compte le plus : dans l'arbitrage entre risques, dans l'innovation de rupture, et dans les décisions qui engagent la responsabilité de l'entreprise.
<span style="display:none">[^2_32][^2_33][^2_34][^2_35][^2_36][^2_37][^2_38][^2_39][^2_40][^2_41][^2_42][^2_43][^2_44][^2_45][^2_46][^2_47][^2_48][^2_49][^2_50][^2_51][^2_52][^2_53][^2_54][^2_55][^2_56][^2_57][^2_58][^2_59][^2_60][^2_61][^2_62][^2_63][^2_64][^2_65][^2_66][^2_67][^2_68][^2_69][^2_70][^2_71]</span>

<div align="center">⁂</div>

[^2_1]: https://aikosha.indiaai.gov.in/home/models/details/layoutlmv2_multimodal_document_understanding.html

[^2_2]: https://xmarkings.com

[^2_3]: https://xmarkings.com/blog/ai-powered-compliance-future

[^2_4]: https://digital.nemko.com/insights/regtech-for-ai-enabled-systems

[^2_5]: https://www.morphik.ai/blog/ai-tools-for-technical-docs

[^2_6]: https://naaia.ai/harmonized-ai-standards-eu-compliance/

[^2_7]: https://ai-act-standards.com

[^2_8]: https://www.skillsoftware.com/en/blog/skill-fmea-pro-et-lintégration-des-données-vers-une-amdec-collaborative-et-efficace

[^2_9]: https://www.skillsoftware.com/fr/solution-amdec

[^2_10]: https://www.linkedin.com/posts/mfinocchiaro_plm-aiacrosstheproductlifecycle-engineeringsoftware-activity-7392100959486836736-to9_

[^2_11]: https://assets.new.siemens.com/siemens/assets/api/uuid:ce0ea29d-0431-4b8f-96c9-47d986eb4624/HQDIPR202505097159EN.pdf

[^2_12]: https://blogs.sw.siemens.com/teamcenter/teamcenter-plm-ai-copilot/

[^2_13]: https://blogs.sw.siemens.com/teamcenter/teamcenter-2506-copilot-genai/

[^2_14]: https://www.prnewswire.com/news-releases/ptc-brings-ai-powered-plm-to-hannover-messe-2025-with-windchill-ai-302410612.html

[^2_15]: https://www.digitalengineering247.com/article/ptc-brings-ai-powered-plm-to-hannover-messe-2025

[^2_16]: https://www.linkedin.com/pulse/windchill-leads-ai-driven-plm-2025-joshua-israel-corrales-castillo-lxk0e

[^2_17]: https://www.3ds.com/newsroom/press-releases/dassault-systemes-unveils-new-way-working-industry-ai-powered-virtual-companions

[^2_18]: https://www.engineering.com/dassault-unveils-ai-powered-virtual-companions/

[^2_19]: https://www.3ds.com/fr/newsroom/press-releases/dassault-systemes-unveils-new-way-working-industry-ai-powered-virtual-companions

[^2_20]: https://beyondplm.com/2025/11/22/building-plm-agents-why-everyone-is-announcing-ai-and-why-almost-everyone-is-missing-the-point/

[^2_21]: https://aimagicx.com/blog/cognitive-operating-systems-revolutionizing-business-2025/

[^2_22]: https://www.kovench.com/blog/data-fabric-and-knowledge-graphs-the-circulatory-system-of-the-ai-enterprise

[^2_23]: https://mem0.ai/blog/mcp-knowledge-graph-memory-enterprise-ai

[^2_24]: https://nstarxinc.com/blog/the-next-frontier-of-rag-how-enterprise-knowledge-systems-will-evolve-2026-2030/

[^2_25]: https://www.linkedin.com/pulse/state-rag-2025-bridging-knowledge-generative-ai-squirroag-xwale

[^2_26]: https://www.solutions-numeriques.com/microsoft-build-2025-de-nouveaux-agents-ia-dans-copilot-studio-et-dynamics/

[^2_27]: https://www.itforbusiness.fr/build-2025-1-4-l-agentification-du-travail-selon-microsoft-91316

[^2_28]: https://bluestarplm.com/modules/ai-copilot/

[^2_29]: https://darkclear.ai/blog/the-quiet-revolution-of-foundation-models-in-enterprise-ai/

[^2_30]: https://datanucleus.dev/rag-and-agentic-ai/what-is-rag-enterprise-guide-2025

[^2_31]: https://www.dlapiper.com/insights/publications/2024/01/the-role-of-harmonised-standards-as-tools-for-ai-act-compliance

[^2_32]: https://bluestarplm.com/article/ai-in-plm/

[^2_33]: https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-48

[^2_34]: https://aisciencetalk.blog/2025/06/30/ai-driven-automation-in-2025-transforming-manufacturing-and-logistics/

[^2_35]: https://artificialintelligenceact.eu/article/48/

[^2_36]: https://www.customertimes.com/ai-automation-in-manufacturing-2025-report

[^2_37]: https://encord.com/blog/obtaining-ce-approval-for-medical-diagnostic-models/

[^2_38]: https://bluestarplm.de/module/ai-und-copilot/

[^2_39]: https://www.skillsoftware.com/en/solution-amdec

[^2_40]: https://rationalk.ch/blog/le-savoir-contenu-dans-les-fmea-amdec/

[^2_41]: https://htec.com/insights/blogs/why-rag-is-a-game-changer-for-enterprise-knowledge-management/

[^2_42]: https://www.youtube.com/watch?v=eHPqfNLeous

[^2_43]: https://www.compuvate.com/how-retrieval-augmented-generation-rag-systems-transform-enterprise-knowledge-management-in-2025/

[^2_44]: https://galent.com/insights/blogs/genai-architecture-2025-multi-agent-systems-modular-stacks-and-enterprise-ai-strategy/

[^2_45]: https://neptune.ai/state-of-foundation-model-training-report

[^2_46]: https://www.isms.online/frameworks/iso-42001/iso-42001-harmonised-standards-eu-ai-act-presumption-of-conformity/

[^2_47]: https://www.engineering.com/ptc-to-preview-windchill-ai-plm-assistant-at-hannover-messe-2025/

[^2_48]: https://techintelpro.com/news/ai/agentic-ai/dassault-unveils-ai-virtual-companions-for-industry

[^2_49]: https://engtechnica.com/ptc-to-preview-windchill-ai-at-hannover-messe-2025/

[^2_50]: https://www.technia.com/en/resources/dassault-systemes-generative-ai-strategy/

[^2_51]: https://adamleonsmith.substack.com/p/understanding-the-different-types

[^2_52]: https://www.shadecoder.com/topics/regulatory-compliance-ai-a-comprehensive-guide-for-2025

[^2_53]: https://www.mesagroup.eu/en/mesa-events/mesa-copilot-generative-ai

[^2_54]: https://xmarkings.com/sv

[^2_55]: https://learn.microsoft.com/en-us/shows/powerful-devs-conference-2025/maximizing-the-value-of-generative-ai-in-copilot-studio

[^2_56]: https://trycomp.ai/automated-compliance-software

[^2_57]: https://europa.eu/youreurope/business/product-requirements/labels-markings/ce-marking/index_en.htm

[^2_58]: https://www.regulativ.ai/blog-articles/2025-compliance-predictions-ai-automation-new-regulations

[^2_59]: https://www.mesagroup.eu/it/eventi/mesa-copilot-generative-ai

[^2_60]: https://yousign.com/blog/ai-act-e-signatures-compliance-requirements-eu

[^2_61]: https://journalwjaets.com/content/architectural-evolution-enterprise-integration-paradigm-shifts-middleware-api-first

[^2_62]: https://eajournals.org/wp-content/uploads/sites/21/2025/06/AI-Driven-Data-Mesh.pdf

[^2_63]: https://www.llamaindex.ai/careers/multimodal-ai-engineer-document-understanding

[^2_64]: https://wjaets.com/content/architectural-evolution-enterprise-integration-paradigm-shifts-middleware-api-first

[^2_65]: https://itmonks.com/blog/enterprise/integration/

[^2_66]: https://www.youtube.com/watch?v=k1gwZQgCBhc

[^2_67]: https://www.shaip.com/blog/multimodal-ai-the-complete-guide-to-training-data/

[^2_68]: https://docs.oracle.com/middleware/11119/fp/development/directintegration.htm

[^2_69]: https://www.intelligentbusiness.biz/blog/key-trends-in-data-management-ai-in-2025-2026/

[^2_70]: https://www.v7labs.com/blog/ai-document-analysis-complete-guide

[^2_71]: https://wjaets.com/sites/default/files/fulltext_pdf/WJAETS-2025-0205.pdf

