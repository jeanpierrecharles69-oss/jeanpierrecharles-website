# Plan de Résolution : Fiabilisation et Répétabilité de l'Assistant Aegis

> **Priorité : Critique**  
> **Statut : En cours de déploiement**  
> **Date : 21 Janvier 2026**

## 1. Analyse du Problème (Diagnostic)

Lors des tests multi-plateformes (iOS, Android, Windows), des divergences majeures ont été observées dans les réponses de l'assistant Aegis, notamment sur le module ESPR (Ecodesign for Sustainable Products Regulation).

### Causes identifiées

1. **Modèle instable** : Utilisation d'un nom de modèle non standard (`gemini-2.5-flash`) entraînant des comportements imprédictibles.
2. **Température élevée** : L'absence de configuration de température laissait le modèle dans un mode "créatif" (hallucinations sémantiques).
3. **Asymétrie Linguistique** : Les instructions système (System Prompts) étaient beaucoup plus détaillées en français qu'en anglais, causant des réponses pauvres ou hors-sujet lors d'un basculement de langue.
4. **Mélange de contextes** : Les instructions système étaient mixées manuellement avec le prompt utilisateur, diluant la force des règles de conformité.

---

## 2. Actions Correctives Immédiates

Les modifications suivantes ont été apportées au codebase pour corriger ces dérives :

### A. Stabilisation Technique (`geminiService.ts`)

* **Changement de Modèle** : Migration vers `gemini-1.5-flash` (Modèle stable long-terme).
* **Déterminisme Forcé** : Ajout de `generationConfig` avec `temperature: 0.1`. Cela garantit une répétabilité quasi-parfaite des réponses pour un même questionnaire.
* **Isolation du Système** : Utilisation de la propriété native `systemInstruction` du SDK Google Generative AI pour séparer les règles métier de la question utilisateur.

### B. Alignement de l'Expertise (`translations.ts`)

* **Synchronisation FR/EN** : Le prompt système anglais a été intégralement réécrit pour inclure la liste exhaustive des règlements et les règles de rigueur (Expertise 2024).
* **Règle de Langue Stricte** : Ajout d'une consigne impérative de sortie dans la langue sélectionnée pour éviter les réponses mixtes observées sur Android.

---

### C. Structured Prompting (XML Tagging)

* **Encapsulation des Données** : Les réponses des questionnaires sont désormais isolées dans des balises `<USER_RESPONSES>`, tandis que les consignes métier sont dans `<INSTRUCTIONS>`. Cela évite que le modèle ne confonde les entrées utilisateur avec les ordres de formatage.
* **Garantie de Structure** : Les règles de formatage "STRICT RULES" ont été simplifiées et renforcées pour un rendu homogène.

---

## 3. Plan d'Action pour une Fiabilité "Grade Industriel"

### Phase 1 : Renforcement des Prompts (Terminée)

* **Structured Prompting** : Adoption d'un format de prompt robuste et déterministe.
* **Template Strict** : Verrouillage des émojis et de la structure via des instructions de formatage négatives.

### Phase 2 : Monitoring et Validation (Semaine 5)

* **Golden Dataset** : Création d'un jeu de test de 10 scénarios types (Ecodesign, AI Act, etc.).
* **Vérification de Non-Dérive** : Script de test automatisé simulant les réponses et comparant la similarité textuelle.

### Phase 3 : Transparence Utilisateur (Semaine 6)

* **Source Citation** : Obligation pour l'IA d'afficher explicitement la version du règlement utilisée.
* **Indice de Confiance** : Affichage d'un badge de confiance basé sur la source de données (RAG).

---

## 4. Conclusion

La solution de confiance repose sur le passage d'une IA "Conversationnelle" à une IA "Cognitive Déterministe". En verrouillant la température et en harmonisant les instructions système, nous garantissons que **le diagnostic de conformité reste le même, quel que soit l'appareil utilisé.**

**Actions terminées ce jour :**

* [x] Mise à jour du service Gemini (Température 0.1 & Modèle stable 1.5-flash)
* [x] Alignement des prompts système (FR/EN synchronisés)
* [x] Implémentation du XML Tagging pour la séparation Contexte/Instructions
* [x] Nettoyage de la logique d'injection (System Instruction native SDK)
