---
description: Valider que tous les documents projet sont rédigés en français
---

# Workflow : Validation Linguistique des Documents

## Objectif

S'assurer que tous les documents projet (spécifications, plans, walkthroughs, rapports) respectent la règle de rédaction **exclusivement en français**.

## Quand l'exécuter ?

- Avant de finaliser tout artifact (fichier `.md` dans `.gemini/antigravity/brain/`)
- Après génération de documentation technique
- Lors d'une revue de code/documents avant commit
- Quand on change de modèle d'IA (Claude → Gemini → GPT)

## Étapes de Validation

### 1. Identifier les Documents à Valider

```bash
# Lister tous les fichiers markdown récemment modifiés
git diff --name-only HEAD~1 | grep -E '\.md$'
```

### 2. Vérifier la Langue des Artifacts

**Pour chaque fichier `.md` dans `.gemini/antigravity/brain/` :**

- Ouvrir le fichier
- Vérifier que :
  - ✅ Les titres et sections sont en français
  - ✅ Le contenu descriptif est en français
  - ✅ Les exemples de code peuvent rester en anglais (noms de variables, commentaires techniques)

### 3. Vérifier les Documents Racine du Projet

**Pour les fichiers `jeanpierrecharles_*.md` :**

- Ces documents DOIVENT être en français (ils sont destinés au client final ou à l'équipe francophone)

### 4. Exceptions Autorisées

- Code source (`.ts`, `.tsx`, `.js`, etc.) → peut rester en anglais
- Commentaires inline techniques → peuvent être en anglais si nécessaire
- Citations ou références externes → peuvent être en langue originale avec traduction

### 5. Correction si Non-Conforme

Si un document est trouvé en anglais :

1. Notifier l'utilisateur
2. Demander confirmation pour traduction
3. Réécrire le document en français en conservant la structure et le contenu technique
4. Sauvegarder avec le même nom de fichier

### 6. Documentation de la Validation

Créer un fichier `VALIDATION-LANGUE-[DATE].md` récapitulant :

- Documents vérifiés ✅
- Documents corrigés 🔧
- Documents conformes dès le départ ✅

## Commande Rapide

```bash
# Rechercher des patterns anglais typiques dans les fichiers markdown
grep -r "Requirements\|Implementation\|Specifications\|Overview" --include="*.md" .gemini/antigravity/brain/
```

Si cette commande retourne des résultats, vérifier manuellement si ce sont des titres de section (à traduire) ou du code/citations (acceptable).

## Checklist de Validation

- [ ] Tous les artifacts (`.gemini/antigravity/brain/*.md`) sont en français
- [ ] Tous les documents `jeanpierrecharles_*.md` sont en français
- [ ] Le fichier `STANDARDS.md` est bien présent et à jour
- [ ] Les exceptions (code, citations) sont identifiées et justifiées
- [ ] Validation documentée dans un rapport

## Notes Importantes

⚠️ **Cette validation doit être systématique**, quel que soit le modèle d'IA utilisé pour générer le contenu.

📌 **En cas de doute** : privilégier TOUJOURS le français pour les documents destinés au client ou à l'équipe projet.
