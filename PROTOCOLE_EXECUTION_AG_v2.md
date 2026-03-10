# PROTOCOLE EXÉCUTION AG — v2.0
# ═══════════════════════════════════════════
# AEGIS v3.0-alpha · Mis à jour 14/02/2026
# Applicable : sessions jour ET sessions nocturnes
# ═══════════════════════════════════════════

## PRINCIPE

AG exécute des tâches de code generation. Les fichiers restent **locaux**
(pas de push). Claude review avant tout push sur GitHub/Vercel.
La boucle **AG (exécution) → Claude (review) → JP (décision)** est
préservée en synchrone (jour) comme en asynchrone (nuit).

## MODÈLE AG RECOMMANDÉ

**Gemini 2.5 Pro** (natif AG, meilleur raisonnement que Flash)
- Thinking : High
- Temperature : 0.2 (code déterministe)
- Fallback : Gemini 2.0 Flash (découper en sous-tâches si utilisé)
- NE PAS utiliser Claude Opus dans AG (réservé pour review dans claude.ai)

---

## MODE A — SESSION JOUR (JP présent, ~3-4h)

### Phase 1 — Préparation (15 min)
1. Charger le BRIEF_[DATE].md dans le "Brain" AG
2. Charger le wireframe R2 comme input de référence
3. Configurer Gemini 2.5 Pro / High thinking / Temp 0.2
4. Vérifier que les garde-fous sont compris par AG

### Phase 2 — Exécution supervisée (~2-3h)
1. AG exécute le BRIEF composant par composant
2. JP supervise visuellement dans l'IDE AG
3. Corrections en temps réel si déviation du BRIEF
4. AG documente dans SESSION_REPORT_[DATE].md au fur et à mesure

### Phase 3 — Review Claude V&V (30 min)
1. JP upload les fichiers produits dans claude.ai
2. Claude exécute la grille V&V (voir ci-dessous)
3. Verdict : GO / GO CONDITIONNEL / NO-GO
4. Si GO → git add . && git commit -m "..." && git push main

---

## MODE B — SESSION NOCTURNE (JP dort, ~5h AG)

### Phase Soir — Préparation JP (15 min, avant coucher)
1. Rédiger NIGHT_BRIEF_[DATE].md (template ci-dessous)
2. Charger dans AG avec le wireframe R2
3. Lancer AG avec le prompt structuré :
   > "Lis NIGHT_BRIEF_[DATE].md. Exécute les tâches dans l'ordre.
   > À chaque fichier terminé, ajoute une entrée dans NIGHT_REPORT_[DATE].md.
   > Ne push PAS sur GitHub. Ne modifie PAS les fichiers hors scope.
   > Si tu rencontres un blocage, documente-le et passe à la tâche suivante.
   > Termine par un résumé dans NIGHT_REPORT."

### Phase Nuit — Exécution AG autonome
- AG travaille fichier par fichier
- Documente dans NIGHT_REPORT (structure obligatoire)
- NE push PAS — tout reste dans C:\Projects\jeanpierrecharles\

### Phase Matin — Review JP + Claude (30-45 min)
1. JP lit le NIGHT_REPORT (5 min)
2. JP sync vers Claude via Pipeline ou upload manuel
3. Claude exécute la REVIEW GATE V&V
4. JP décide : push / corrections / NO-GO

---

## 🛡️ GARDE-FOUS NON NÉGOCIABLES

| Règle | Raison |
|-------|--------|
| **JAMAIS git push** | Claude V&V d'abord |
| **JAMAIS toucher .env / api/** | Secrets et proxy sécurisé |
| **JAMAIS installer de dépendance** | JP valide les deps |
| **JAMAIS supprimer de fichier** | Créer ou modifier uniquement |
| **TOUJOURS produire un REPORT** | Traçabilité obligatoire |
| **TOUJOURS rester dans le SCOPE** | Pas de scope creep |

---

## 📋 GRILLE V&V CLAUDE (Review Gate)

| # | Vérification | Critère GO | Action NO-GO |
|---|-------------|------------|-------------|
| V1 | **SÉCURITÉ** | Pas de secrets exposés, pas de VITE_ prefix suspect, pas de clé API en dur | Supprimer et signaler |
| V2 | **COHÉRENCE** | Code aligné avec wireframe R2 et palette slate/navy | Corriger les écarts |
| V3 | **QUALITÉ** | Pas de code mort, imports corrects, TypeScript strict OK | Nettoyer |
| V4 | **RGPD** | Consentement, mentions légales si applicable | Ajouter |
| V5 | **RESPONSIVE** | Mobile-first, breakpoints sm/md/lg | Corriger |
| V6 | **BUILD** | npm run build sans erreur | Fix avant push |

**Verdicts possibles :**
- **GO** → git push main (Vercel auto-deploy)
- **GO CONDITIONNEL** → corrections mineures (15 min) puis push
- **NO-GO** → nouveau brief ou session correction avec Claude

---

## 📄 TEMPLATE BRIEF (jour ou nuit)

```markdown
# BRIEF_[DATE]_[SESSION].md

## OBJECTIF
[Ce que AG doit produire]

## SCOPE — Fichiers à créer
[Liste exhaustive avec chemin complet]

## SCOPE — Fichiers à modifier
[Liste avec description de la modification]

## NE PAS TOUCHER
[Liste des fichiers interdits]

## INPUTS DE RÉFÉRENCE
[Wireframe, palette, composants existants]

## CRITÈRES D'ACCEPTATION
- [ ] [Critère 1]
- [ ] [Critère 2]

## CONTRAINTES TECHNIQUES
[Stack, librairies autorisées/interdites]

## ORDRE D'EXÉCUTION
[Séquence recommandée]
```

## 📊 TEMPLATE REPORT

```markdown
# REPORT_[DATE]_[SESSION].md

## 1. RÉSUMÉ EXÉCUTIF (3 lignes max)
## 2. FICHIERS PRODUITS
| Fichier | Statut | Lignes | Notes |
## 3. DÉCISIONS AUTONOMES (à valider)
## 4. BLOCAGES (le cas échéant)
## 5. QUESTIONS POUR REVIEW
## 6. PROCHAINES ÉTAPES
```

---

## 📊 CAPACITÉ v3.0-alpha (14/02 → 27/02)

| Mode | Heures | Détail |
|------|--------|--------|
| JP jours ouvrés | ~64h | 8h/jour × 8 jours (lun-ven) |
| JP weekends | ~20h | 5h/jour × 4 jours (sam-dim) |
| AG nocturne | ~55h | ~5h/nuit × 11 nuits restantes |
| **TOTAL** | **~139h** | JP 84h + AG 55h |

ROI nocturne : 45 min JP (15 min brief + 30 min review) → 5h AG = **ratio 1:6.7**
