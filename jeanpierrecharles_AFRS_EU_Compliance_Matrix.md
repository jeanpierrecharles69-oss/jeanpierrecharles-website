# AFRS EU Compliance Matrix

**Version**: 2.0  
**Date**: 15 janvier 2026  
**Objectif**: Matrice de traçabilité complète mapping chaque article des 6 réglementations EU vers les phases AFRS

---

## Matrice RGPD (UE 2016/679) ↔ AFRS

| Article | Exigence | Phase AFRS | Implémentation Technique | Vérification |
|---------|----------|------------|--------------------------|--------------|
| **Art. 5.1.a** | Licéité, loyauté, transparence | Phase 1, 2 | Documenter bases légales (consentement/contrat/intérêt légitime) | V&V Gate 1, 2 |
| **Art. 5.1.b** | Limitation des finalités | Phase 2, 7 | Finalités déclarées dans politique confidentialité + schéma DB | V&V Gate 2, 7 |
| **Art. 5.1.c** | Minimisation des données | Phase 7 | Auditer chaque champ: nécessaire ou nice-to-have? | V&V Gate 7 |
| **Art. 5.1.d** | Exactitude | Phase 7 | Permettre modification profil utilisateur | V&V Gate 7 |
| **Art. 5.1.e** | Limitation de conservation | Phase 7 | Politique purge automatique (ex: 3 ans après dernière activité) | V&V Gate 7 |
| **Art. 5.1.f** | Intégrité et confidentialité | Phase 9, 15 | Chiffrement AES-256, hachage bcrypt, HTTPS, RBAC | V&V Gate 9, 15 |
| **Art. 6** | Base légale du traitement | Phase 2 | Identifier base légale pour chaque traitement | V&V Gate 2 |
| **Art. 7** | Consentement | Phase 5, 15 | Bannière cookies opt-in, double opt-in newsletters | V&V Gate 5, 15 |
| **Art. 13-14** | Information personne concernée | Phase 15 | Politique confidentialité accessible, claire | V&V Gate 15 |
| **Art. 15** | Droit d'accès | Phase 6, 7 | API GET /api/user/:id/data (authentifié) | V&V Gate 6, 7 |
| **Art. 16** | Droit de rectification | Phase 7 | API PATCH /api/user/:id/profile | V&V Gate 7 |
| **Art. 17** | Droit à l'effacement | Phase 7 | Soft delete (deleted_at) + anonymisation après délai | V&V Gate 7 |
| **Art. 18** | Droit à la limitation | Phase 7 | Flag `processing_limited` dans DB | V&V Gate 7 |
| **Art. 20** | Droit à la portabilité | Phase 6, 7 | Export JSON/CSV complet | V&V Gate 6, 7 |
| **Art. 21** | Droit d'opposition | Phase 7 | Opt-out marketing, analytics | V&V Gate 7 |
| **Art. 25** | Privacy by Design & Default | Toutes | Checklist RGPD à chaque phase | Tous V&V Gates |
| **Art. 30** | Registre des traitements | Phase 7 | Document `registre_traitements.json` maintenu | V&V Gate 7 |
| **Art. 32** | Sécurité du traitement | Phase 9, 15 | Chiffrement, pseudonymisation, tests pénétration | V&V Gate 9, 15 |
| **Art. 33-34** | Notification violations | Phase 13 | Processus incident <72h CNIL + notification utilisateurs | V&V Gate 13 |
| **Art. 37** | Désignation DPO | Phase 1 | Si >250 employés OU données sensibles | V&V Gate 1 |

---

## Matrice Data Act (UE 2023/2854) ↔ AFRS

| Article | Exigence | Phase AFRS | Implémentation | Vérification |
|---------|----------|------------|----------------|--------------|
| **Art. 4** | Accès utilisateur aux données produit | Phase 6, 7 | API d'export données temps réel | V&V Gate 6, 7 |
| **Art. 5** | Portabilité données | Phase 6, 7 | Format JSON/CSV, documentation API publique | V&V Gate 6, 7 |
| **Art. 6** | Obligations fournisseurs services données | Phase 6 | SLA documentés, conditions équitables | V&V Gate 6 |
| **Art. 8** | Protection clauses abusives | Phase 3 | Review juridique CGU/CGV | V&V Gate 3 |
| **Art. 9** | Interopérabilité | Phase 6 | APIs RESTful OpenAPI, standards ouverts | V&V Gate 6 |

---

## Matrice AI Act (UE 2024/1689) ↔ AFRS

| Article | Exigence | Phase AFRS | Implémentation | Vérification |
|---------|----------|------------|----------------|--------------|
| **Art. 6** | Classification systèmes IA | Phase 1, 13 | Documentation classification risque (minimal/limité/haut/inacceptable) | V&V Gate 1, 13 |
| **Art. 9** | Gestion des risques (haut risque) | Phase 8, 13 | Analyse risques IA, mesures atténuation, tests robustesse | V&V Gate 8, 13 |
| **Art. 10** | Données entraînement (haut risque) | Phase 13 | Gouvernance données, analyse biais, représentativité | V&V Gate 13 |
| **Art. 11** | Documentation technique (haut risque) | Phase 13 | Documentation complète Annexe IV | V&V Gate 13 |
| **Art. 12** | Journalisation (haut risque) | Phase 13 | Logs structurés, rétention ≥6 mois | V&V Gate 13 |
| **Art. 13** | Transparence (haut risque) | Phase 13 | Documentation limitations, usages interdits | V&V Gate 13 |
| **Art. 14** | Surveillance humaine (haut risque) | Phase 13 | Mécanismes intervention, override, formation opérateurs | V&V Gate 13 |
| **Art. 15** | Précision, robustesse (haut risque) | Phase 13 | Testing adversarial, métriques performance, cybersécurité IA | V&V Gate 13 |
| **Art. 52** | Transparence chatbots/IA générative | Phase 10, 15 | Disclaimer "Vous interagissez avec une IA" visible | V&V Gate 10, 15 |

---

## Matrice ERSP (UE 2024/1781) ↔ AFRS

| Obligation | Phase AFRS | Implémentation | Vérification |
|------------|------------|----------------|--------------|
| **Identifiant Unique Produit (UPI)** | Phase 7 | Champ `upi: string` dans modèle DPP | V&V Gate 7 |
| **Informations produit** | Phase 7 | Fabricant, modèle, date fabrication, n° série | V&V Gate 7 |
| **Traçabilité composants** | Phase 7 | Nomenclature mécatronique, électronique, logiciels, matériaux | V&V Gate 7 |
| **Empreinte carbone** | Phase 7 | Calcul cycle de vie (kg CO2eq) | V&V Gate 7 |
| **Recyclabilité** | Phase 7 | Taux recyclabilité (%), indice réparabilité (0-10) | V&V Gate 7 |
| **Jumeaux numériques** | Phase 6, 7 | Intégration PLM si applicable | V&V Gate 6, 7 |
| **Historique maintenance** | Phase 7 | Log interventions, pièces remplacées | V&V Gate 7 |
| **Parcours fin de vie** | Phase 7 | Routes recyclage, filières valorisation | V&V Gate 7 |

---

## Matrice Machine Regulation (UE 2023/1230) ↔ AFRS

| Exigence | Phase AFRS | Implémentation | Vérification |
|----------|------------|----------------|--------------|
| **Analyse de risques ISO 12100** | Phase 8 | Document analyse risques machine | V&V Gate 8 |
| **Déclaration conformité CE** | Phase 15 | Déclaration avant commercialisation | V&V Gate 15 |
| **Dossier technique construction** | Phase 7, 13 | Plans, calculs, documentation technique | V&V Gate 7, 13 |
| **Notice d'instructions** | Phase 15 | Manuel utilisateur, consignes sécurité | V&V Gate 15 |
| **Marquage CE** | Phase 15 | Apposition marquage physique produit | V&V Gate 15 |
| **Documentation IA embarquée** | Phase 13 | Description IA, modes défaillance, protocoles sécurité | V&V Gate 13 |
| **Formation opérateurs** | Phase 13 | Programme formation interaction homme-machine | V&V Gate 13 |

---

## Matrice CRA (UE 2024/2847) ↔ AFRS

| Article | Exigence | Phase AFRS | Implémentation | Vérification |
|---------|----------|------------|----------------|--------------|
| **Art. 10-11** | Secure by Design | Phase 7, 9 | Threat modeling, architecture sécurisée | V&V Gate 7, 9 |
| **Art. 13** | SBOM (Software Bill of Materials) | Phase 9 | Génération SBOM CycloneDX/SPDX | V&V Gate 9 |
| **Art. 14** | Gestion vulnérabilités | Phase 15 | Processus divulgation, SLA patching | V&V Gate 15 |
| **Art. 15** | Mises à jour sécurité | Phase 14, 15 | Pipeline CI/CD, updates réguliers 5 ans minimum | V&V Gate 14, 15 |
| **Art. 16** | Documentation cybersécurité | Phase 9, 15 | Menaces, contrôles, architecture sécurisée | V&V Gate 9, 15 |
| **Annexe I** | Exigences essentielles cybersécurité | Phase 9, 15 | Chiffrement, auth, logs, resilience | V&V Gate 9, 15 |

---

## Vue Consolidée: Phases AFRS ↔ Toutes Réglementations

| Phase AFRS | RGPD | Data Act | AI Act | ERSP | Machine | CRA | Total |
|------------|------|----------|--------|------|---------|-----|-------|
| **Phase 1** | Art. 5, 37 | - | Art. 6 | - | - | - | 3 |
| **Phase 2** | Art. 5, 6 | - | - | - | - | - | 2 |
| **Phase 3** | - | Art. 8 | - | - | - | - | 1 |
| **Phase 5** | Art. 7 | - | - | - | - | - | 1 |
| **Phase 6** | Art. 15, 20 | Art. 4, 5, 9 | - | DPP | - | - | 5 |
| **Phase 7** | Art. 5, 15-21, 30 | Art. 4, 5 | - | Tous champs DPP | Dossier tech | Art. 10-11 | 20+ |
| **Phase 8** | - | - | Art. 9 | - | ISO 12100 | - | 2 |
| **Phase 9** | Art. 5, 32 | - | - | - | - | Art. 13, 16 | 4 |
| **Phase 10** | - | - | Art. 52 | - | - | - | 1 |
| **Phase 13** | Art. 33-34 | - | Art. 9-15 | - | IA embarquée | - | 10 |
| **Phase 14** | - | - | - | - | - | Art. 15 | 1 |
| **Phase 15** | Art. 7, 13-14, 32 | - | Art. 52 | - | CE, marquage | Art. 14-16 | 8 |

**Total obligations couvertes**: 58+ articles/exigences

---

## Utilisation de cette Matrice

### Pour vérifier compliance

1. Identifier les réglementations applicables à votre projet
2. Pour chaque article applicable, consulter la phase AFRS correspondante
3. Vérifier que l'implémentation technique est complétée
4. Franchir le V&V Gate avec checklist compliance

### Pour audit

Utiliser cette matrice comme **checklist d'audit** avant déploiement :
- [ ] Tous articles RGPD applicables cochés
- [ ] Tous articles Data Act (si produits connectés) cochés
- [ ] Tous articles AI Act (si IA) cochés
- [ ] Etc.

### Pour traçabilité

Maintenir une **matrice de traçabilité projet** :

| Req ID | Réglementation | Article | Exigence | Phase | Implémenté | Testé | Statut |
|--------|----------------|---------|----------|-------|------------|-------|--------|
| REQ-RGPD-001 | RGPD | Art. 17 | Droit à l'oubli | 7 | ✅ | ✅ | Conforme |
| REQ-AI-001 | AI Act | Art. 52 | Transparence chatbot | 10 | ✅ | ✅ | Conforme |
| ... | | | | | | | |

---

**Fin du Document - AFRS EU Compliance Matrix v2.0**
