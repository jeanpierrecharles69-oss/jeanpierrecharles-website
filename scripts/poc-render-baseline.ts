/**
 * AEGIS Intelligence -- POC Puppeteer V&V autonome RC1 (N12.C)
 *
 * Script standalone tsx pour generer un PDF DIAGNOSTIC FR via la chaine Puppeteer
 * et comparer visuellement avec la baseline LaTeX 29/04 T1809.
 *
 * Sortie : C:\Projects\aegis-ops\diagnostics\vvs\poc-N12C-<YYYYMMDDTHHMM>\
 *   - poc-output.pdf
 *   - poc-output.html (debug)
 *   - poc-metadata.json (sha256, pageCount, sizeBytes, durationMs)
 *
 * Usage : npx tsx scripts/poc-render-baseline.ts
 *
 * Version : 1.0.0 -- 20260512 -- creation N12.C
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { renderDiagnosticHtml } from '../api/_lib/diagnostic-html-template.js';
import { renderPdfFromHtml } from '../api/_lib/pdf-renderer.js';
import type { DiagnosticHtmlInput } from '../api/_lib/diagnostic-html-template.js';

const BASELINE_DATASET_PATH = 'C:\\Projects\\aegis-ops\\diagnostics\\baseline\\fr\\dataset-input.json';
const VVS_BASE = 'C:\\Projects\\aegis-ops\\diagnostics\\vvs';

function formatTimestamp(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}`;
}

interface DatasetCustomer {
    first_name: string;
    last_name: string;
    company: string;
    country?: string;
    city?: string;
    email: string;
}

interface DatasetShape {
    lang: 'fr' | 'en';
    invoice_number: string;
    customer: DatasetCustomer;
    scenario: {
        sector: string;
        product: string;
        client_questions: string[];
    };
}

function buildDemoMarkdown(ds: DatasetShape): string {
    // Markdown demo reprenant la structure attendue 30-40 pages avec :
    //  - 12 sections H2 (couvre les 5 piliers + Pearl + plan)
    //  - tables, listes, blockquotes, code spans, unicode -> car ≥ « »
    //  - accents complets pour valider rendu typographique
    const scenario = ds.scenario;
    return `# Synthese executive

Le present diagnostic analyse la conformite reglementaire de la **${scenario.product}** developpee et commercialisee par **${ds.customer.company}**. Le secteur d'activite (${scenario.sector}) place ce produit a l'intersection de plusieurs reglements EU symbiotiques entres en vigueur ou en transition entre 2024 et 2027.

> *Resume directionnel* : la mise en conformite reglementaire de la machine de soudage laser 4 kW exige une **action coordonnee** sur trois axes -- Machinery Regulation 2023/1230 (obligatoire 20/01/2027), AI Act 2024/1689 (analyse de classification du systeme de vision) et CRA 2024/2847 (statut sans connectivite -> exclusion conditionnelle a documenter).

Le budget estime pour la transition complete est de l'ordre de **18 000 EUR a 35 000 EUR** sur 24 mois, hors temps interne du bureau d'etudes. Le calendrier critique pointe vers le **20/01/2027** comme date butoir Machinery Reg.

## Cartographie reglementaire des 5 piliers

Les cinq reglements symbiotiques constituent l'ossature de notre methodologie d'analyse. Chacun a un statut distinct pour le produit etudie.

| Pilier | Statut | Date butoir | Action prioritaire |
|---|---|---|---|
| Machinery Reg 2023/1230 | **Applicable** | 20/01/2027 | Marquage CE refondu Annexe III |
| AI Act 2024/1689 | A clarifier | 02/08/2026 (GPAI) | Analyse vision -> Annexe I/III ? |
| CRA 2024/2847 | Hors scope conditionnel | 11/12/2027 | Documenter absence de connectivite |
| ESPR / DPP 2024/1781 | Applicable (timeline ulterieure) | 2027-2030 | Passeport produit numerique |
| Battery Reg 2023/1542 | Sans objet | --- | Aucune batterie integree |

Les flux d'interdependance entre ces piliers sont representes ci-dessous via la decomposition Pearl trois niveaux.

### Notation typographique de reference

Le diagnostic emploie une notation rigoureuse :

- Fleches : -> pour relation causale, <-> pour interdependance, ⇒ pour implication forte
- Operateurs : ≥ ≤ ± § ¶ pour ponctuation reglementaire
- Guillemets francais : « citation reglementaire » avec espaces fines insecables
- Caracteres accentues complets : é è ê ë à â ä î ï ô ö ù û ü ÿ ç Æ Œ

\`\`\`
Schema Pearl simplifie :
  N1 Observation  ->  N2 Intervention  ->  N3 Contrefactuel
\`\`\`

## Contexte produit et entreprise

### Profil technique du produit

La **${scenario.product}** integre les composants critiques suivants :

1. Source laser fibre **4 kW** (IPG YLS-4000), classe 4 selon EN 60825-1
2. Table de deplacement XY motorisee, course 1500 x 800 mm, precision ± 0,01 mm
3. Automate Siemens S7-1200 pour pilotage sequentiel
4. IHM tactile Siemens KTP700 Basic
5. Systeme de vision industrielle pour controle de cordon de soudure (camera + eclairage structure)
6. Enceinte de protection laser classe 4, interverrouillage portes
7. Aspiration des fumees avec filtration HEPA
8. **Absence totale de connectivite cloud ou reseau externe** (point determinant CRA)
9. **Absence d'intelligence artificielle** (sequences programmees fixes, pas d'apprentissage)

### Profil entreprise

| Indicateur | Valeur |
|---|---|
| Taille | 30 salaries |
| CA | 4 millions EUR |
| Activite | Fabricant de machines speciales sur cahier des charges client |
| Anciennete | 20 ans (transition laser depuis 2022) |
| Production | 8-12 machines par an |
| Prix unitaire | 150 000 a 300 000 EUR |
| Marche | France 80 %, export Belgique/Suisse 20 % |
| Normes appliquees | EN ISO 12100, EN 60825-1 |
| Equipe conformite | Bureau d'etudes en interne (pas d'equipe dediee) |

## Machinery Regulation 2023/1230

Le **Reglement Machines 2023/1230** remplace integralement la **Directive 2006/42/CE** au **20 janvier 2027**. Cette transition concerne directement la ${scenario.product}.

### Changements structurants

Les modifications principales par rapport a la Directive 2006/42/CE sont les suivantes :

- **Annexe I categories de machines a haut risque** : extension de la liste, notamment pour les machines integrant un systeme de detection ou de decision automatise
- **Article 6 obligations du fabricant** : refonte avec exigences renforcees sur la **documentation technique** et la **declaration UE de conformite**
- **Annexe III exigences essentielles de sante et securite** (EESS) : restructuration en 9 sections, integration des **risques numeriques** et de la **cybersecurite des composants pilotes**
- **Procedures d'evaluation de conformite** (Annexe IX a XI) : nouvelles voies pour machines complexes integrant logiciel critique

> *Article 6 paragraphe 1* : « Avant la mise sur le marche, le fabricant veille a ce que les machines aient ete concues et fabriquees conformement aux exigences essentielles de sante et de securite enoncees a l'annexe III. »

### Implications operationnelles pour ${ds.customer.company}

La transition exigera :

1. **Refonte du dossier technique** existant pour aligner sur la nouvelle Annexe III
2. **Reanalyse de risques** integrant les risques cyber-physiques meme en absence de connectivite (defaillance PLC, alteration HMI)
3. **Mise a jour des procedures de marquage CE** : nouvelle Declaration UE de conformite (DUC) format 2023/1230
4. **Formation du bureau d'etudes** sur les EESS modifiees (estimation : 2 jours formation x 3 personnes)
5. **Audit interne** des procedures qualite ISO 9001 si presentes, ou structuration documentaire equivalente

### Calendrier critique

| Phase | Echeance | Livrable |
|---|---|---|
| Veille reglementaire | T0+1 mois | Synthese Reg 2023/1230 a jour |
| Diagnostic ecart | T0+3 mois | Liste des EESS impactees |
| Refonte dossier technique | T0+9 mois | Dossier 2023/1230 complet |
| Formation interne | T0+10 mois | 3 collaborateurs formes |
| Production premiere machine 2027 | 20/01/2027 | DUC nouveau format |

## AI Act 2024/1689

Le **Reglement IA 2024/1689** entre progressivement en vigueur du **02/08/2025** (pratiques interdites Annexe II) au **02/08/2027** (regles systemes IA usage general).

### Analyse de classification

Le systeme de vision industrielle pour controle de cordon de soudure pose une question de **classification AI Act**. Trois lectures sont possibles.

#### Lecture 1 : exclusion par definition

L'**Article 3(1) AI Act** definit un « systeme d'IA » comme « un systeme automatise concu pour fonctionner avec differents niveaux d'autonomie et qui peut faire preuve d'une capacite d'adaptation apres son deploiement, et qui [...] genere des sorties [...] ».

> *Question critique* : un systeme de vision a base de seuillage classique avec parametres figes par calibration sortie d'usine est-il un « systeme d'IA » au sens de l'Article 3(1) ?

Une lecture restrictive (favorable au fabricant) suggere que **non**, car il n'y a ni capacite d'adaptation post-deploiement, ni inference statistique. La sortie binaire « conforme / non conforme » resulte d'un algorithme deterministe.

#### Lecture 2 : haut risque par usage

L'**Annexe III, point 4(a)** liste comme **systeme a haut risque** les systemes d'IA utilises comme **« composants de securite » dans la gestion d'**equipements industriels.

La vision est-elle un composant de securite ?

- *Argument pour* : si l'absence de detection de defaut peut compromettre la securite d'une soudure structurelle livree au client final
- *Argument contre* : la vision est utilisee pour le **controle qualite** post-soudure, pas pour la **securite operationnelle** (cf. interverrouillage portes -> seul element de securite reel)

**Position prudente recommandee** : documenter explicitement dans le manuel utilisateur que le systeme de vision est un **outil de qualite** et non un **composant de securite**, et conserver des traces de calibration pour demontrer le caractere deterministe.

#### Lecture 3 : exclusion explicite a documenter

Une troisieme voie consiste a **documenter formellement** dans le dossier technique 2023/1230 la classification non-AI-Act, en s'appuyant sur l'**Article 3(1)** restrictif. Cette documentation devient l'**element probant** en cas d'inspection.

## CRA 2024/2847 -- Cyber Resilience Act

Le **CRA 2024/2847** entre en application complete au **11/12/2027** pour les produits comportant **« des elements numeriques »** avec connectivite directe ou indirecte.

### Statut de la machine ${scenario.product}

L'absence totale de connectivite cloud, reseau externe ou interface IoT positionne le produit en **exclusion conditionnelle CRA**. Cependant, plusieurs nuances doivent etre documentees :

- L'**HMI tactile Siemens** comporte un firmware mis a jour periodiquement par USB cle physique. Ces mises a jour sont-elles des « elements numeriques » au sens CRA ?
- Le **PLC S7-1200** dispose d'une interface PROFINET filaire pour configuration. Bien que non connectee au reseau client, cette interface existe.
- Le **logiciel de pilotage** (ladder logic + IHM) constitue-t-il un produit « avec elements numeriques » ?

> **Position recommandee** : documenter dans le dossier technique 2023/1230 :
> 1. L'absence d'interface reseau active a la livraison ;
> 2. Le **processus de mise a jour firmware** (par cle USB physique, version manuelle controlee par le bureau d'etudes) ;
> 3. La **politique de cybersecurite documentee** (mots de passe HMI, acces physique enceinte).

### Plan documentaire CRA

| Document | Statut | Priorite |
|---|---|---|
| Politique de cybersecurite produit | A creer | Haute |
| Procedure mise a jour firmware | A formaliser | Haute |
| Inventaire composants numeriques (SBOM lite) | A produire | Moyenne |
| Plan de reponse a vulnerabilite | A creer | Moyenne |

## ESPR / DPP 2024/1781

Le **Reglement ESPR (Ecodesign for Sustainable Products Regulation)** 2024/1781 introduit le **Passeport Produit Numerique** (DPP) avec une **mise en oeuvre progressive par categorie de produits**.

### Statut machine-outil industrielle

La categorie « machines industrielles » n'est **pas** dans la premiere vague DPP (electronique grand public, textile, batteries). Les actes delegues categoriels sont attendus a partir de **2026-2028**.

### Anticipation strategique

Bien que non obligatoire avant 2028 au plus tot, l'anticipation DPP presente trois avantages :

1. **Differenciation commerciale** : les clients ETI exportateurs valorisent la tracabilite
2. **Tracabilite des composants critiques** (source laser, PLC) facilite la maintenance
3. **Convergence avec CRA SBOM** : meme effort documentaire, deux conformites

## Battery Regulation 2023/1542

**Sans objet** pour le produit etudie : la machine de soudage laser ne comporte **aucune batterie integree** (alimentation triphasee 400 V).

Aucune action requise sauf si une evolution future integrait une **batterie de secours UPS** pour la conservation des reglages PLC en cas de coupure -- a documenter le cas echeant.

## Analyse Pearl trois niveaux

### N1 -- Observation

L'etat actuel de conformite revele :

- **Conformite Directive 2006/42/CE** : confirmee (marquage CE en vigueur, normes EN ISO 12100 et EN 60825-1 appliquees)
- **Conformite Reg 2023/1230** : **non encore documentee** (transition a planifier)
- **Conformite AI Act** : **statut a clarifier** sur la vision industrielle
- **Conformite CRA** : **exclusion conditionnelle** a documenter

### N2 -- Intervention

Les interventions recommandees, classees par criticite :

1. **Lancer le diagnostic ecart Reg 2023/1230** (T0+3 mois)
2. **Documenter la classification non-AI-Act** du systeme de vision (T0+1 mois)
3. **Formaliser le processus de mise a jour firmware** (T0+2 mois) -- couvre CRA
4. **Refondre le dossier technique** au format 2023/1230 (T0+9 mois)
5. **Former le bureau d'etudes** aux nouvelles EESS (T0+10 mois)

### N3 -- Contrefactuel

> *Question contrefactuelle* : Que se passerait-il si l'entreprise ne realisait **aucune action** d'ici 20/01/2027 ?

**Scenario contrefactuel "statu quo"** :
- Les machines produites apres le 20/01/2027 ne pourraient plus etre mises sur le marche EU sous l'ancien regime
- Le marquage CE selon Directive 2006/42/CE deviendrait invalide
- Les clients exigeraient la nouvelle DUC au format 2023/1230
- **Risque commercial** : interruption potentielle de la production environ 6-12 mois pour rattrapage
- **Risque juridique** : retrait des machines non conformes du marche par les autorites de surveillance

**Scenario contrefactuel "preparation anticipee"** :
- Transition fluide sans interruption de production
- Avantage concurrentiel sur les concurrents non prepares
- Capacite a documenter la conformite des le 20/01/2027
- Aucun risque commercial ni juridique

L'**ecart de valeur** entre les deux scenarios est estime a **150 000 a 400 000 EUR de chiffre d'affaires en peril** plus **risque reputationnel**.

## Plan d'action et feuille de route

### Vue Gantt simplifiee (24 mois)

| Phase | M01-M03 | M04-M06 | M07-M09 | M10-M12 | M13-M18 | M19-M24 |
|---|---|---|---|---|---|---|
| Veille reglementaire | OOOO | -- | -- | -- | -- | -- |
| Documentation AI Act / CRA | -- | OOOO | -- | -- | -- | -- |
| Diagnostic ecart Reg 2023/1230 | -- | OOOO | -- | -- | -- | -- |
| Refonte dossier technique | -- | -- | OOOO | OOOO | -- | -- |
| Formation interne | -- | -- | -- | OOOO | -- | -- |
| Test premiere machine 2027 | -- | -- | -- | -- | OOOO | -- |
| Production reguliere 2027 | -- | -- | -- | -- | -- | OOOO |

### Budget previsionnel

| Poste | Estimation basse | Estimation haute |
|---|---|---|
| Veille reglementaire externe | 1 500 EUR | 3 000 EUR |
| Conseil Machinery Reg 2023/1230 | 6 000 EUR | 12 000 EUR |
| Conseil AI Act / CRA | 3 000 EUR | 8 000 EUR |
| Documentation technique (interne valorisee) | 5 000 EUR | 8 000 EUR |
| Formation bureau d'etudes | 2 000 EUR | 4 000 EUR |
| Audit pre-conformite (optionnel) | 0 EUR | 5 000 EUR |
| **Total estime** | **17 500 EUR** | **40 000 EUR** |

## Recommandations finales

### Priorite 1 -- Immediate (T0+1 a T0+3 mois)

- Engager une veille reglementaire structurelle (abonnement EUR-Lex notifications)
- Documenter formellement la classification non-AI-Act du systeme de vision
- Lancer le diagnostic ecart Reg 2023/1230 vs dossier technique actuel

### Priorite 2 -- Tactique (T0+3 a T0+12 mois)

- Refondre le dossier technique au format 2023/1230
- Formaliser le processus de mise a jour firmware (couverture CRA)
- Former le bureau d'etudes aux nouvelles EESS

### Priorite 3 -- Strategique (T0+12 a T0+24 mois)

- Anticiper le DPP en construisant une tracabilite composants
- Tester la premiere machine production sous regime 2023/1230 en blanc
- Etablir les processus operationnels pour production reguliere 2027+

## Mentions legales

Le present diagnostic est realise dans le cadre de l'offre **AEGIS Intelligence DIAGNOSTIC 250 EUR**. Il a une valeur **informative et methodologique** et ne constitue pas un avis juridique au sens des professions reglementees.

- *Propriete intellectuelle* : ce rapport est la propriete exclusive du destinataire ${ds.customer.company}. La reproduction et la diffusion sont soumises a autorisation ecrite prealable du destinataire.
- *Confidentialite* : AEGIS Intelligence respecte le secret professionnel. Aucune information transmise par le client n'est partagee a un tiers.
- *Limitation de responsabilite* : AEGIS Intelligence ne peut etre tenu responsable des consequences operationnelles, commerciales ou juridiques resultant de l'application des recommandations contenues dans ce rapport. La decision finale d'action releve du destinataire.
- *RGPD* : les donnees personnelles (nom, email, coordonnees entreprise) sont traitees conformement au Reglement (UE) 2016/679. La duree de conservation est de 5 ans apres la livraison du rapport, conformement aux obligations comptables francaises (Art. L123-22 Code de commerce).

## Annexe A -- Normes harmonisees citees

Les normes harmonisees suivantes sont referencees dans le diagnostic. La presomption de conformite (Art. 16 Reg 2023/1230) s'applique aux machines qui s'y conforment integralement.

### Normes machinerie

| Norme | Titre abrege | Statut presomption |
|---|---|---|
| EN ISO 12100:2010 | Securite des machines -- principes generaux | Type A (concepts fondamentaux) |
| EN ISO 13849-1:2023 | Parties des systemes de commande relatives a la securite | Type B (aspects securite) |
| EN ISO 13849-2:2012 | Partie 2 : validation | Type B |
| EN 60204-1:2018 | Equipement electrique des machines -- regles generales | Type B |
| EN 62061:2021 | Securite fonctionnelle electrique/electronique | Type B |
| EN ISO 14120:2015 | Protecteurs fixes et mobiles | Type B |

### Normes laser

| Norme | Titre abrege | Statut presomption |
|---|---|---|
| EN 60825-1:2014/A11:2021 | Securite des appareils a laser -- classification | Type C (specifique) |
| EN ISO 11553-1:2020 | Securite des machines de traitement laser | Type C |
| EN ISO 11553-2:2020 | Securite des machines portables a laser | Type C (sans objet ici) |

### Normes vision et IHM

| Norme | Titre abrege | Statut presomption |
|---|---|---|
| EN ISO 13855:2010 | Positionnement des protecteurs en fonction de la vitesse d'approche | Type B |
| EN ISO 9241-110:2020 | Ergonomie de l'interaction homme-systeme | Type B (informatif IHM) |
| EN 61496-1:2020 | Equipements de protection electro-sensibles | Type B |

### Normes cybersecurite (anticipation CRA)

| Norme | Titre abrege | Statut presomption |
|---|---|---|
| ISO/IEC 27001:2022 | SMSI -- exigences | Hors presomption directe |
| IEC 62443-3-3:2013 | Securite des reseaux industriels -- exigences systeme | Hors presomption directe |
| EN IEC 62443-4-2:2019 | Cybersecurite -- exigences techniques composants | Hors presomption directe |

> *Note importante* : la liste officielle des normes harmonisees Reg 2023/1230 est publiee progressivement par la Commission Europeenne au Journal Officiel de l'UE (serie L et C). Les references CELEX a verifier au moment de la mise sur le marche.

## Annexe B -- Matrice de tracabilite EESS

La matrice ci-dessous trace les Exigences Essentielles de Sante et Securite (EESS) de l'**Annexe III Reg 2023/1230** vers les normes harmonisees applicables a la ${scenario.product}.

| EESS Annexe III | Sujet | Norme couvrante | Mode de demonstration |
|---|---|---|---|
| 1.1 | Principes generaux | EN ISO 12100 | Analyse de risque documentee |
| 1.2 | Eclairage | EN 60204-1 | Mesure photometrique |
| 1.3 | Commandes -- securite et fiabilite | EN ISO 13849-1 PL d | Bloc de commande certifie |
| 1.4 | Mise en marche -- arrets normal et d'urgence | EN ISO 13850 | Bouton arret d'urgence cat. 0 |
| 1.5 | Protection contre risques mecaniques | EN ISO 14120 | Enceinte de protection |
| 1.6 | Risques dus a d'autres dangers | EN 60825-1, EN ISO 11553-1 | Classification laser classe 4 + interverrouillage |
| 1.7 | Maintenance | EN 60204-1 | Sectionneur cadenas |
| 2.1 | Risques electriques | EN 60204-1 | Schema electrique conforme + tableau IP54 |
| 2.2 | Risques dus a l'electricite statique | EN 60204-1 | Mise a la terre documentee |
| 2.3 | Risques dus aux fluides | EN ISO 4413 (hydraulique) | Sans objet (pneumatique seul, sous 6 bar) |
| 2.4 | Risques dus aux fumees | Locaux : Code du travail R.4222 | Aspiration HEPA + DTU ventilation |
| 3.1 | Marquage des machines | Annexe III sec. 7 | Plaque signaletique CE-2023-1230 |
| 3.2 | Notice d'instructions | Annexe III sec. 7 | Notice FR + EN livree |
| 4.1 | Risques dus aux substances dangereuses | REACH Reg 1907/2006 | Fiche de donnees de securite consommables |
| 4.2 | Bruit | Directive 2003/10/CE | Mesure niveau pression sonore < 80 dBA |

## Annexe C -- Modele de Declaration UE de Conformite (DUC)

Le modele suivant respecte les exigences de l'**Annexe V Reg 2023/1230** (anciennement Annexe II Directive 2006/42/CE). Il est a etablir pour chaque machine livree.

\`\`\`
DECLARATION UE DE CONFORMITE

Nous, ${ds.customer.company}, sis a [adresse],
Numero d'identification : [SIRET / VAT]

declarons sous notre seule responsabilite que la machine suivante :

  Designation : ${scenario.product}
  Type / Serie : [reference commerciale]
  Numero de serie : [N de serie individuel]
  Annee de construction : [AAAA]

est conforme aux dispositions :

  - Reglement (UE) 2023/1230 du Parlement Europeen et du Conseil
    du 14 juin 2023 relatif aux machines

et qu'elle a ete conque, fabriquee et controlee dans le respect
des Exigences Essentielles de Sante et de Securite (EESS) de
l'Annexe III dudit Reglement.

Normes harmonisees appliquees integralement :
  - EN ISO 12100:2010
  - EN ISO 13849-1:2023
  - EN 60204-1:2018
  - EN 60825-1:2014/A11:2021
  - EN ISO 11553-1:2020

Personne autorisee a constituer le dossier technique :
  Nom : [Responsable bureau d'etudes]
  Adresse : [adresse identique a la societe]

Fait a [ville], le [JJ/MM/AAAA]
Signature : [signature manuscrite ou eIDAS qualifiee]
Fonction du signataire : [Gerant / Directeur technique]
\`\`\`

> *Conseil pratique* : conserver une **copie signee** de chaque DUC pendant **10 ans** apres la mise sur le marche de la derniere machine concernee (obligation legale).

## Annexe D -- Glossaire des termes reglementaires

| Terme | Definition synthetique |
|---|---|
| Acte legislatif d'harmonisation de l'Union | Acte UE imposant des exigences essentielles communes (RU 765/2008) |
| Composant de securite | Composant dont la defaillance compromet la securite (Art. 3 Reg 2023/1230) |
| Conformite par conception | Approche prevenant les risques des la phase d'ingenierie |
| Declaration UE de conformite (DUC) | Document officiel attestant la conformite (Annexe V Reg 2023/1230) |
| Dossier technique | Ensemble documentaire prouvant la conformite (Annexe IV Reg 2023/1230) |
| EESS | Exigence Essentielle de Sante et Securite (Annexe III Reg 2023/1230) |
| Evaluation de conformite | Procedure prouvant que les EESS sont remplies (Annexes IX a XI) |
| Fabricant | Personne physique ou morale qui concoit ou fait concevoir une machine et la commercialise sous son nom (Art. 3) |
| Importateur | Personne mettant sur le marche UE une machine provenant d'un pays tiers (Art. 3) |
| Marquage CE | Marquage attestant la conformite aux exigences UE applicables |
| Mise sur le marche | Premiere mise a disposition d'une machine sur le marche de l'Union (Art. 3) |
| Mise en service | Premiere utilisation conforme a sa destination dans l'UE (Art. 3) |
| Norme harmonisee | Norme adoptee par un organisme europeen de normalisation, citee au JOUE |
| Notice d'instructions | Document accompagnant la machine, en langue de l'utilisateur final |
| Personne autorisee a constituer le dossier technique | Identifiee dans la DUC, residant dans l'UE |
| Presomption de conformite | Effet juridique de l'application integrale d'une norme harmonisee |
| Procedure d'evaluation de conformite | Voie choisie parmi celles definies aux Annexes IX, X, XI |
| Quasi-machine | Ensemble qui constitue presque une machine mais ne peut assurer seul une application precise (Art. 3) |
| Surveillance du marche | Activites des autorites pour assurer la conformite des machines (RU 2019/1020) |
| Systeme d'IA | Systeme automatise capable d'adaptation et de generer des sorties influencant l'environnement (Art. 3 AI Act) |
| Tracabilite des machines | Capacite a retrouver la machine et son fabricant via marquage |
| Utilisation prevue | Utilisation conforme aux informations fournies par le fabricant (Art. 3) |
| Utilisation incorrecte raisonnablement previsible | Utilisation differente de l'utilisation prevue mais resultant d'un comportement humain previsible |

## Annexe E -- Sources EUR-Lex et CELEX

Les references reglementaires de ce rapport sont a verifier sur le portail officiel **EUR-Lex** (eur-lex.europa.eu). Les numeros CELEX permettent l'acces direct au texte.

### Reglements cites integralement

| Texte | CELEX | URL eur-lex |
|---|---|---|
| Reg (UE) 2023/1230 Machines | 32023R1230 | eur-lex.europa.eu/eli/reg/2023/1230 |
| Reg (UE) 2024/1689 IA | 32024R1689 | eur-lex.europa.eu/eli/reg/2024/1689 |
| Reg (UE) 2024/2847 CRA | 32024R2847 | eur-lex.europa.eu/eli/reg/2024/2847 |
| Reg (UE) 2024/1781 ESPR | 32024R1781 | eur-lex.europa.eu/eli/reg/2024/1781 |
| Reg (UE) 2023/1542 Batteries | 32023R1542 | eur-lex.europa.eu/eli/reg/2023/1542 |
| Reg (UE) 2016/679 RGPD | 32016R0679 | eur-lex.europa.eu/eli/reg/2016/679 |
| Reg (UE) 2019/1020 Surveillance marche | 32019R1020 | eur-lex.europa.eu/eli/reg/2019/1020 |
| Directive 2006/42/CE Machines (abrogee 20/01/2027) | 32006L0042 | eur-lex.europa.eu/eli/dir/2006/42 |
| Directive 2003/10/CE Bruit | 32003L0010 | eur-lex.europa.eu/eli/dir/2003/10 |

### Documents d'orientation Commission

| Document | Acces |
|---|---|
| Guide d'application Reg 2023/1230 (a paraitre 2026) | DG GROW, Single Market |
| Lignes directrices AI Act (Annexe III evaluation) | DG CONNECT |
| FAQ CRA Cyber Resilience Act | DG CONNECT, ENISA |
| Methodologie passeport produit numerique (DPP) | DG GROW, JRC |

### Bases techniques

| Base | Acces |
|---|---|
| OSHA EU-OSHA Risques professionnels | osha.europa.eu |
| AFNOR -- Normes francaises | afnor.org |
| CEN -- Normes europeennes | cencenelec.eu |
| ISO -- Normes internationales | iso.org |

## Annexe F -- FAQ Questions frequentes

### Q1 -- Peut-on continuer a livrer une machine sous Directive 2006/42/CE apres le 20/01/2027 ?

**Non.** Le Reglement 2023/1230 abroge integralement la Directive 2006/42/CE au **20 janvier 2027**. Toute machine mise sur le marche apres cette date doit etre couverte par une **DUC au format 2023/1230**.

Cependant, les machines deja sur le marche avant cette date conservent leur conformite (principe de non-retroactivite).

### Q2 -- Que faire si un client souhaite une machine "AI Act compatible" alors qu'on n'a pas d'IA ?

Documenter formellement dans le **dossier technique 2023/1230** la classification **non-AI-Act** du produit, avec :

1. L'analyse Article 3(1) AI Act (definition systeme IA)
2. Le caractere deterministe des algorithmes
3. L'absence de capacite d'adaptation post-deploiement
4. La justification que le systeme de vision n'est **pas** un **composant de securite** (Annexe III point 4(a) AI Act)

Cette documentation peut etre annexee a la DUC pour rassurer le client.

### Q3 -- Faut-il une signature electronique qualifiee (eIDAS QES) sur la DUC ?

**Non, pas obligatoirement.** L'**Annexe V Reg 2023/1230** exige une signature mais ne specifie pas la nature. Une signature manuscrite scannee est acceptable. Une signature electronique simple (eIDAS Art. 25 SES) est juridiquement valable.

Cependant, une **signature electronique qualifiee** (eIDAS QES) presente l'avantage d'une **presomption d'integrite** (Art. 35 eIDAS), particulierement utile en cas de contestation lors d'une inspection.

### Q4 -- Combien de temps conserver le dossier technique ?

L'**Annexe IV Reg 2023/1230** impose une conservation de **10 ans apres la mise sur le marche de la derniere machine** du modele concerne. Cette duree commence a courir a la **derniere DUC signee** pour le modele.

### Q5 -- Doit-on prevenir le client en cas de mise a jour firmware ?

Si la mise a jour modifie les **caracteristiques essentielles** declarees dans la DUC (performance, securite, fonctionnalites), oui : il faut emettre une **DUC modificative** et notifier le client.

Pour les mises a jour mineures (correction bug non-securitaire, optimisation interne), une simple **notice technique** suffit, archivee dans le journal de service de la machine.

### Q6 -- Le marquage CE est-il suffisant pour exporter en Suisse ?

**Pour la Suisse, oui** (accord bilateral UE-Suisse de reconnaissance mutuelle MRA Machines). Le marquage CE est accepte.

**Pour le Royaume-Uni, non depuis 01/01/2025** : le marquage **UKCA** est obligatoire pour le marche britannique (Great Britain). L'Irlande du Nord conserve le marquage CE via le Protocole Irlande/Irlande du Nord.

### Q7 -- Quels sont les couts de non-conformite ?

Les sanctions du **Reg 2023/1230** sont fixees par chaque Etat membre. En France, le **Code de la consommation Art. L451-1** prevoit jusqu'a **300 000 EUR** d'amende et **2 ans d'emprisonnement** pour mise sur le marche d'un produit non conforme.

Plus operationnellement :
- **Retrait du marche** par les autorites (en France, DGCCRF ou DIRECCTE)
- **Frais de mise en conformite** des machines deja livrees (5 a 25 % du prix unitaire)
- **Perte commerciale** : un client ayant subi un incident peut requalifier la non-conformite en defaut materiel et invoquer la **responsabilite produit** (Code civil Art. 1245).

### Q8 -- A-t-on besoin d'un organisme notifie pour la machine de soudage laser ?

**Non, si toutes les normes harmonisees applicables sont integralement respectees** (procedure d'evaluation de conformite **Annexe IX -- controle interne**).

**Oui, si la machine est listee en Annexe I Reg 2023/1230 categories haut risque** (laser inclus selon classification a confirmer). Dans ce cas, procedure **Annexe X (examen UE de type) ou Annexe XI (assurance qualite complete)**.

La classification de la machine soudage laser 4 kW est a **valider explicitement** dans le diagnostic ecart Reg 2023/1230 (action Priorite 1).

## Annexe G -- Calendrier detaille mois par mois

Le calendrier ci-dessous detaille les actions reglementaires mois par mois sur 24 mois pour atteindre la conformite au **20 janvier 2027**. T0 = date du presents diagnostic.

| Mois | Action principale | Owner | Livrable | Statut |
|---|---|---|---|---|
| M01 | Lancement veille EUR-Lex sur Reg 2023/1230 + AI Act + CRA | Bureau d'etudes | Abonnement notifications + premier rapport veille | A faire |
| M01 | Cartographie initiale des machines en production (modeles + variantes) | Bureau d'etudes | Inventaire de tous les modeles avec DUC actuelles | A faire |
| M02 | Diagnostic ecart Reg 2023/1230 sur modele de reference (machine de soudage laser 4 kW) | Bureau d'etudes + conseil externe | Liste detaillee des EESS impactees, classification haut risque ou non | A faire |
| M02 | Documentation classification non-AI-Act du systeme de vision | Bureau d'etudes | Note technique 4 pages avec analyse Article 3(1) | A faire |
| M03 | Synthese veille reglementaire trimestrielle (Q1) | Bureau d'etudes | Bulletin interne 1 page | A faire |
| M03 | Plan de transition formalise pour validation direction | Bureau d'etudes + Direction | Document presentation comite de direction | A faire |
| M04 | Refonte dossier technique - section 1 : description machine et architecture | Bureau d'etudes | Section 1 redigee au format 2023/1230 | A faire |
| M04 | Formalisation processus mise a jour firmware (CRA) | Bureau d'etudes | Procedure documentee + journal type | A faire |
| M05 | Refonte dossier technique - section 2 : analyse de risque revisee | Bureau d'etudes | Section 2 + matrice de risque EN ISO 12100 | A faire |
| M05 | Synthese veille reglementaire (mise a jour mensuelle) | Bureau d'etudes | Bulletin | A faire |
| M06 | Refonte dossier technique - section 3 : normes harmonisees appliquees | Bureau d'etudes | Section 3 + matrice de tracabilite EESS | A faire |
| M06 | Synthese veille reglementaire trimestrielle (Q2) | Bureau d'etudes | Bulletin trimestriel | A faire |
| M07 | Refonte dossier technique - section 4 : preuves d'essais et certifications | Bureau d'etudes | Section 4 + copies certificats | A faire |
| M07 | Audit interne procedures qualite (ISO 9001 ou equivalent) | Direction | Rapport audit interne | A faire |
| M08 | Refonte dossier technique - section 5 : notice d'instructions revisee FR/EN | Bureau d'etudes + traduction | Notice complete FR + traduction EN | A faire |
| M08 | Test premier prototype "blanc" sous regime 2023/1230 | Bureau d'etudes | Rapport de test + DUC test signee | A faire |
| M09 | Refonte dossier technique - section 6 : declaration UE de conformite type | Bureau d'etudes | Modele DUC valide | A faire |
| M09 | Synthese veille reglementaire trimestrielle (Q3) | Bureau d'etudes | Bulletin trimestriel | A faire |
| M10 | Formation interne bureau d'etudes - module 1 : Reg 2023/1230 EESS | Formateur externe | Attestations + supports | A faire |
| M10 | Formation interne bureau d'etudes - module 2 : AI Act / CRA implications | Formateur externe | Attestations + supports | A faire |
| M11 | Test deuxieme prototype "blanc" complet avec DUC 2023/1230 | Bureau d'etudes | Validation finale DUC type | A faire |
| M11 | Synthese veille reglementaire (mise a jour mensuelle) | Bureau d'etudes | Bulletin | A faire |
| M12 | Synthese veille reglementaire trimestrielle (Q4) | Bureau d'etudes | Bulletin trimestriel | A faire |
| M12 | Audit pre-conformite par tiers (optionnel) | Tiers expert | Rapport conformite | A faire |
| M13 | Mise en place processus production 2027 sur ligne pilote | Production | Procedures production validees | A faire |
| M14 | Production premiere machine 2027 sous regime 2023/1230 | Production | Machine + DUC 2023/1230 | A faire |
| M15 | Veille trimestrielle (Q5) | Bureau d'etudes | Bulletin | A faire |
| M16 | Production machine 2 + 3 sous regime 2023/1230 | Production | DUCs signees | A faire |
| M17 | Audit annuel surveillance marche (preparation) | Direction | Plan reponse audit | A faire |
| M18 | Veille trimestrielle (Q6) | Bureau d'etudes | Bulletin | A faire |
| M19-M24 | Production reguliere 2027+ -- 6 a 9 machines selon historique | Production | DUCs signees + livraisons | A faire |

## Annexe H -- Methodologie AEGIS Intelligence

AEGIS Intelligence applique une **methodologie integree** combinant sept approches complementaires pour produire des diagnostics rigoureux et actionnables.

### Pearl -- Causalite trois niveaux

Le philosophe et statisticien **Judea Pearl** a distingue trois niveaux de raisonnement causal :

1. **N1 Observation** : que voit-on ? (statistiques, correlations, etat actuel)
2. **N2 Intervention** : que se passe-t-il si on agit ? (effet des actions sur le systeme)
3. **N3 Contrefactuel** : que se serait-il passe sinon ? (raisonnement contre-factuel sur les alternatives)

Chaque diagnostic AEGIS traverse ces trois niveaux pour identifier non seulement l'etat actuel mais aussi les leviers d'action et les couts de l'inaction.

### Simon -- Rationalite bornee

**Herbert Simon** a montre que les decideurs operent sous **rationalite bornee** : information incomplete, temps limite, cout cognitif eleve. Les decisions visent le **satisfacing** (suffisamment bon) plutot que l'optimisation.

Les recommandations AEGIS sont **satisfaisantes** -- elles tiennent compte des contraintes operationnelles reelles (budget, equipe, calendrier client), pas du theoriquement optimal.

### Damasio -- Marqueurs somatiques

Le neuroscientifique **Antonio Damasio** a etabli que **l'intuition experte a une valeur epistemique** : les emotions des decideurs experimentes encodent une connaissance tacite essentielle.

AEGIS Intelligence est conduit par **Jean-Pierre Charles**, 32 ans de R&D mecatronique dans 6 groupes internationaux. Les recommandations integrent cette intuition experte sur ce qui fonctionne reellement en industrie.

### Bergson -- Duree

Le philosophe **Henri Bergson** a distingue la **duree** (temps vecu, processus continu) du **temps spatialise** (instant T fige).

La distinction **compliance != conformite** s'enracine dans cette philosophie :
- **Conformite** : etat audite a l'instant T (spatialized time)
- **Compliance** : processus vivant en duree (Flywheel)

Le Flywheel Compliance d'AEGIS assure que **la compliance produit naturellement la conformite**.

### Morin -- Complexite

**Edgar Morin** a developpe la pensee complexe -- comprendre les phenomenes via leurs interdependances systemiques plutot que par reduction analytique.

Les **5 piliers reglementaires symbiotiques** (AI Act, CRA, Machinery Reg, ESPR/DPP, Battery Reg) sont analyses dans leur **interdependance** :
- Machinery Reg cite l'AI Act pour les composants de securite
- ESPR/DPP recoupe le CRA SBOM
- Battery Reg interagit avec ESPR sur l'ecoconception

### Gadamer / Ricoeur -- Hermeneutique

Les philosophes **Gadamer** et **Ricoeur** ont developpe l'**hermeneutique** : l'interpretation des textes a partir de leur contexte historique, culturel, juridique.

AEGIS interprete les textes reglementaires (Reg 2023/1230, AI Act) dans leur contexte :
- Histoire legislative (considerants, propositions amendees)
- Jurisprudence anterieure
- Lignes directrices Commission
- Doctrine professionnelle des associations sectorielles

### Ohno / Hirano -- LEAN / 5S

**Taiichi Ohno** (Toyota) et **Hiroyuki Hirano** ont developpe le **LEAN management** et la methode **5S** : eliminer le gaspillage (muda) en organisant l'espace et les processus.

AEGIS applique LEAN aux processus de conformite :
- **Muda d'intention** : eviter les actions sans valeur reglementaire
- **5S documentaire** : Seiri (eliminer documents obsoletes), Seiton (ranger), Seiso (nettoyer), Seiketsu (standardiser), Shitsuke (perenniser)

### Integration GCI

La **Gouvernance Cognitive Integree** (GCI) d'AEGIS articule ces 7 approches sur **7 couches** (C0 a C6) et **22 piliers**. Les 4 tiers de service AEGIS (PULSE, DIAGNOSTIC, VEILLE, EXPERTISE TERRAIN) couvrent progressivement ces couches selon la valeur ajoutee requise.
`;
}

async function main(): Promise<void> {
    const startTotal = Date.now();
    const timestamp = formatTimestamp(new Date());
    const outDir = path.join(VVS_BASE, `poc-N12C-${timestamp}`);
    fs.mkdirSync(outDir, { recursive: true });
    console.log(`[POC-N12C] output dir : ${outDir}`);

    console.log(`[POC-N12C] reading baseline dataset : ${BASELINE_DATASET_PATH}`);
    const datasetRaw = fs.readFileSync(BASELINE_DATASET_PATH, 'utf-8');
    const dataset = JSON.parse(datasetRaw) as DatasetShape;

    const markdown = buildDemoMarkdown(dataset);
    console.log(`[POC-N12C] markdown demo built : ${markdown.length} chars`);

    const input: DiagnosticHtmlInput = {
        invoice_number: dataset.invoice_number,
        request_id: dataset.invoice_number,
        lang: dataset.lang,
        customer_name: `${dataset.customer.first_name} ${dataset.customer.last_name}`.trim(),
        customer_company: dataset.customer.company,
        customer_email: dataset.customer.email,
        sector: dataset.scenario.sector,
        product: dataset.scenario.product,
        regulations: [],
        country: dataset.customer.country,
        city: dataset.customer.city,
        markdown_opus: markdown,
        issue_date: new Date(2026, 3, 29, 18, 9),
    };

    console.log('[POC-N12C] rendering HTML...');
    const htmlStart = Date.now();
    const html = renderDiagnosticHtml(input);
    const htmlMs = Date.now() - htmlStart;
    console.log(`[POC-N12C] HTML rendered : ${html.length} chars in ${htmlMs} ms`);

    const htmlPath = path.join(outDir, 'poc-output.html');
    fs.writeFileSync(htmlPath, html, 'utf-8');
    console.log(`[POC-N12C] HTML debug saved : ${htmlPath}`);

    console.log('[POC-N12C] rendering PDF via Puppeteer...');
    const result = await renderPdfFromHtml({
        html,
        invoice_number: input.invoice_number,
        format: 'A4',
        printBackground: true,
    });

    const pdfPath = path.join(outDir, 'poc-output.pdf');
    fs.writeFileSync(pdfPath, result.pdf);
    console.log(`[POC-N12C] PDF saved : ${pdfPath}`);

    const metadata = {
        timestamp,
        invoice_number: input.invoice_number,
        lang: input.lang,
        sha256: result.sha256,
        sizeBytes: result.sizeBytes,
        pageCount: result.pageCount,
        durationMs: result.durationMs,
        htmlMs,
        totalMs: Date.now() - startTotal,
        baseline_reference: {
            path: 'C:\\Projects\\aegis-ops\\diagnostics\\baseline\\fr\\reference-20260429T1809.pdf',
            sha256: '34E81F5FC7CD0FD4C5D0CD63FD71830B04D6E5C359A54593C80B4CA2A7995578',
            sizeBytes: 157119,
        },
    };
    const metaPath = path.join(outDir, 'poc-metadata.json');
    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), 'utf-8');
    console.log(`[POC-N12C] metadata saved : ${metaPath}`);

    console.log('');
    console.log('=============================================================');
    console.log('  POC N12.C -- V&V RESULTS');
    console.log('=============================================================');
    console.log(`  page count   : ${result.pageCount}`);
    console.log(`  size bytes   : ${result.sizeBytes}  (~${(result.sizeBytes / 1024).toFixed(1)} KB)`);
    console.log(`  sha-256      : ${result.sha256}`);
    console.log(`  pdf duration : ${result.durationMs} ms`);
    console.log(`  html render  : ${htmlMs} ms`);
    console.log(`  total elapsed: ${Date.now() - startTotal} ms`);
    console.log('-------------------------------------------------------------');
    console.log(`  baseline ref : 157119 bytes (157.1 KB) SHA prefix 34E81F5F`);
    console.log(`  poc output   : ${result.sizeBytes} bytes SHA prefix ${result.sha256.slice(0, 8)}`);
    console.log('=============================================================');
}

main().catch((err: unknown) => {
    console.error('[POC-N12C] FATAL :', err);
    process.exit(1);
});
