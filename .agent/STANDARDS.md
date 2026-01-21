# Standards Projet JeanPierreCharles.com

## Langue de Rédaction
>
> **RÈGLE ABSOLUE** : Tous les documents projet (spécifications, plans d'implémentation, walkthroughs, rapports d'analyse, documentation technique) doivent être rédigés **exclusivement en français**.

### Justification

- Le commanditaire (Jean-Pierre Charles) est francophone
- Les clients cibles sont principalement européens francophones
- La conformité réglementaire (AI Act, RGPD) nécessite une documentation en langue locale
- Cohérence avec l'identité de marque « Excellence par l'Humain » orientée Europe

### Application

- ✅ **Autorisé en anglais** : Analyse de sources externes, code source, noms de variables, commentaires techniques inline
- ❌ **Interdit en anglais** : Tous les fichiers `.md` dans `.gemini/antigravity/brain/`, spécifications fonctionnelles, rapports d'étape, walkthroughs

### Mise en Application Technique

Cette règle s'applique **quel que soit le modèle d'IA utilisé** (Claude, Gemini, GPT, etc.).

**Pour les développeurs IA** : Avant de générer un document projet (artifact), vérifiez systématiquement ce fichier `STANDARDS.md`.

---

## Architecture & Conventions de Code

- **Framework** : Next.js 14+ (App Router si applicable, sinon Pages Router)
- **Styles** : Vanilla CSS avec variables CSS personnalisées (éviter Tailwind sauf demande explicite)
- **TypeScript** : Mode strict activé
- **Accessibilité** : WCAG 2.1 AA minimum (attributs `aria-label`, `title` sur tous les éléments interactifs)

## Conformité Réglementaire

Tous les développements doivent respecter :

- 🇪🇺 **RGPD** (Règlement Général sur la Protection des Données)
- 🇪🇺 **AI Act** (Règlement sur l'Intelligence Artificielle)
- 🇪🇺 **Data Act** (Règlement sur les Données)

Référence : Utiliser le composant `Aegis` comme standard de conformité.

---

## Processus de Validation

1. Tout document produit doit être soumis pour révision via `notify_user` avec `PathsToReview`
2. Les modifications majeures nécessitent un `implementation_plan.md` préalable
3. Les vérifications post-implémentation doivent produire un `walkthrough.md`

---

**Dernière mise à jour** : 2026-01-20  
**Responsable** : Jean-Pierre Charles  
**Applicabilité** : Tous les agents IA et développeurs contributeurs
