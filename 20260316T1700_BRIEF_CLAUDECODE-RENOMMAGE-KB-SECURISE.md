# 20260316T1700_BRIEF_CLAUDECODE-RENOMMAGE-KB-SECURISE

**Timestamp** : 20260316T1700 CET
**Auteur** : Claude Opus 4.6 (claude.ai Web)
**Destinataire** : Claude Code CLI (execution locale Surface Pro 11 ARM64)
**Objet** : Renommage securise de 23 fichiers KB projet — convention D48/D80
**Derniers IDs definitifs** : D183, L137, R62

---

## 0. INSTRUCTIONS DE SECURITE — LIRE AVANT TOUTE EXECUTION

### REGLES ABSOLUES — ZERO EXCEPTION

1. **AUCUNE SUPPRESSION DE FICHIER.** Ni `rm`, ni `del`, ni `Remove-Item`, ni aucune commande destructive. Si un fichier existe deja avec le nom cible, STOP et signaler a JP.

2. **OPERATION UNIQUE AUTORISEE : RENOMMAGE (`mv` ou `Rename-Item`).** Rien d'autre. Pas de modification de contenu, pas de creation, pas de copie vers un autre repertoire.

3. **REPERTOIRE CIBLE UNIQUE** : le dossier KB du projet Claude.ai. Confirmer le chemin exact avec JP AVANT de commencer. Ne jamais operer sur un autre repertoire.

4. **EXECUTION FICHIER PAR FICHIER.** Pas de boucle automatisee. Chaque renommage doit etre une commande individuelle que JP peut valider visuellement.

5. **VERIFICATION PRE-RENOMMAGE OBLIGATOIRE** : avant chaque `mv`, executer `ls -la "FICHIER_SOURCE"` pour confirmer que le fichier existe et que la taille correspond au tableau ci-dessous.

6. **VERIFICATION POST-RENOMMAGE OBLIGATOIRE** : apres chaque `mv`, executer `ls -la "FICHIER_CIBLE"` pour confirmer que le fichier cible existe et que la taille est identique.

7. **AUCUNE INFERENCE.** Si un nom de fichier source ne correspond pas exactement a ce qui est liste ci-dessous (espace, underscore, casse), STOP et demander a JP.

8. **PAS DE GIT ADD / GIT COMMIT / GIT PUSH.** Ce brief concerne uniquement le renommage local des fichiers KB projet dans claude.ai. Aucune operation git.

9. **EN CAS DE DOUTE SUR QUOI QUE CE SOIT : STOP.** Demander a JP. Ne jamais presumer.

---

## 1. CONTEXTE

Les fichiers du KB projet AEGIS Intelligence dans claude.ai contiennent 23 fichiers dont le nommage ne respecte pas la convention D48/D80 :

**Convention D48/D80** : `YYYYMMDDTHHMM_TYPE_DESCRIPTION.md`
- YYYY = annee, MM = mois, DD = jour, T = separateur, HHMM = heure minute CET
- TYPE = BRIDGE | LIFECYCLE | DELTA | AUDIT | BRIEF | RAPPORT | SPEC | PRINCIPE
- DESCRIPTION = mots-cles separes par des tirets, ASCII-safe, pas d'espaces
- Si l'heure originale est inconnue, utiliser T0000

---

## 2. TABLEAU DE RENOMMAGE — 23 FICHIERS

### Lot 1 — Anciens CONVERSATION_BRIDGE_ (11 fichiers)

| # | Fichier source (nom exact) | Fichier cible (nom exact) | Taille attendue |
|---|---------------------------|--------------------------|-----------------|
| 01 | `CONVERSATION-CONTEXT_DAILY-BRIDGE_202602181415.md` | `20260218T1415_BRIDGE_DAILY-CONTEXT.md` | 5.5K |
| 02 | `CONVERSATION-CONTEXT_DAILY-BRIDGE_202602181930.md` | `20260218T1930_BRIDGE_DAILY-CONTEXT.md` | 13K |
| 03 | `CONVERSATION_BRIDGE_20260219T0600.md` | `20260219T0600_BRIDGE_STREAMING-FIX-BRAIN.md` | 11K |
| 04 | `CONVERSATION_BRIDGE_20260222T1200.md` | `20260222T1200_BRIDGE_BENCHMARK-CONTREEXPERTISE.md` | 4.5K |
| 05 | `CONVERSATION_BRIDGE_20260223T1630.md` | `20260223T1630_BRIDGE_REPROMPT-CACHING.md` | 10K |
| 06 | `CONVERSATION_BRIDGE_20260224T1300.md` | `20260224T1300_BRIDGE_AEGIS-NAMING-TRINITE.md` | 9.5K |
| 07 | `CONVERSATION_BRIDGE_20260224T1500.md` | `20260224T1500_BRIDGE_MOCKUP-V31-TRINITY.md` | 5.5K |
| 08 | `CONVERSATION_BRIDGE_20260225T1125.md` | `20260225T1125_BRIDGE_H1-SUBTITLE-BRAIN.md` | 11K |
| 09 | `CONVERSATION_BRIDGE_20260226T1700.md` | `20260226T1700_BRIDGE_N8N-VS2026-RECAP.md` | 5.5K |
| 10 | `CONVERSATION_BRIDGE_20260227T0800.md` | `20260227T0800_BRIDGE_SECURITE-AUDIT-DEPLOY.md` | 6.5K |
| 11 | `CONVERSATION_BRIDGE_20260305T1930.md` | `20260305T1930_BRIDGE_COWORK-IAA-CONCURRENCE.md` | 17K |

### Lot 2 — Date sans THHMM ou TYPE manquant (8 fichiers)

| # | Fichier source (nom exact) | Fichier cible (nom exact) | Taille attendue |
|---|---------------------------|--------------------------|-----------------|
| 12 | `20260214_RAPPORT_CLAUDE_PROJETS_DECONSTRUIT.md` | `20260214T0000_RAPPORT_CLAUDE-PROJETS-DECONSTRUIT.md` | 19K |
| 13 | `20260215_SPEC_CONFIG_FILESYSTEM_MCP.md` | `20260215T0000_SPEC_CONFIG-FILESYSTEM-MCP.md` | 9.5K |
| 14 | `20260216_RAPPORT_GUIDE_ACTIVATION_SKILLS_P0.md` | `20260216T0000_RAPPORT_GUIDE-ACTIVATION-SKILLS-P0.md` | 11K |
| 15 | `20260223_RAPPORT_ADDENDUM_PERPLEXITY_v102.md` | `20260223T0000_RAPPORT_ADDENDUM-PERPLEXITY-V102.md` | 28K |
| 16 | `20260224_NOTES_JEANPIERRE_ANALYSE.md` | `20260224T0954_RAPPORT_NOTES-JP-ANALYSE.md` | 17K |
| 17 | `CONVERSATION_BRIDGE_NOTES_20260224T0954.md` | `20260224T0954_BRIDGE_NOTES-JP-FINDINGS.md` | 18K |
| 18 | `CONVERSATION_BRIDGE_POWERSHELL_20260220T2000.md` | `20260220T2000_BRIDGE_POWERSHELL-SYNC-HUB.md` | 12K |
| 19 | `CONVERSATION_BRIDGE_PROMPTCACHING_20260223T1530.md` | `20260223T1530_BRIDGE_PROMPT-CACHING.md` | 12K |

### Lot 3 — TYPE inversee ou format non standard (4 fichiers)

| # | Fichier source (nom exact) | Fichier cible (nom exact) | Taille attendue |
|---|---------------------------|--------------------------|-----------------|
| 20 | `AG_BRIEF_EXECUTION_FINAL_20260219T2000.md` | `20260219T2000_BRIEF_AG-EXECUTION-FINAL.md` | 45K |
| 21 | `BRIDGE_AEGIS-BRAIN-STREAMING-FIX_20260219.md` | `20260219T0000_BRIDGE_AEGIS-BRAIN-STREAMING-FIX.md` | 2.5K |
| 22 | `BRIDGE_T1700_20260225_Ladybird_Rust_ClaudeCode.md` | `20260225T1700_BRIDGE_LADYBIRD-RUST-CLAUDECODE.md` | 14K |
| 23 | `BRIEF_AG_TRINITY_20260224T1500.md` | `20260224T1500_BRIEF_AG-TRINITY.md` | 6.5K |

---

## 3. PROCEDURE D'EXECUTION RECOMMANDEE

### Etape 1 — Confirmer le repertoire

```bash
# Demander a JP le chemin exact du dossier KB projet
# NE PAS PRESUMER le chemin
ls -la "CHEMIN_CONFIRME_PAR_JP/"
```

Verifier que le nombre de fichiers correspond (~96 fichiers).

### Etape 2 — Dry run (verification sans execution)

Pour chaque fichier, verifier d'abord qu'il existe :

```bash
# Exemple pour fichier #01
ls -la "CONVERSATION-CONTEXT_DAILY-BRIDGE_202602181415.md"
# Verifier taille ~ 5.5K
# Verifier qu'aucun fichier cible n'existe deja :
ls -la "20260218T1415_BRIDGE_DAILY-CONTEXT.md" 2>&1
# Doit retourner "No such file or directory"
```

### Etape 3 — Renommage fichier par fichier

```bash
# Exemple pour fichier #01 (PowerShell)
Rename-Item -Path "CONVERSATION-CONTEXT_DAILY-BRIDGE_202602181415.md" -NewName "20260218T1415_BRIDGE_DAILY-CONTEXT.md"

# OU en bash
mv "CONVERSATION-CONTEXT_DAILY-BRIDGE_202602181415.md" "20260218T1415_BRIDGE_DAILY-CONTEXT.md"
```

### Etape 4 — Verification post-renommage

```bash
ls -la "20260218T1415_BRIDGE_DAILY-CONTEXT.md"
# Confirmer taille identique
```

### Etape 5 — Passer au fichier suivant

Repeter etapes 2-4 pour chaque fichier, dans l'ordre du tableau.

---

## 4. GESTION DES ERREURS

| Situation | Action |
|-----------|--------|
| Fichier source introuvable | STOP — signaler a JP. Ne pas chercher d'alternative. |
| Fichier cible existe deja | STOP — signaler a JP. Ne pas ecraser. |
| Taille fichier source != taille attendue (ecart > 20%) | SIGNALER a JP, mais continuer si JP valide. |
| Erreur permission | STOP — signaler a JP. |
| Doute sur quoi que ce soit | STOP — demander a JP. |

---

## 5. CHECKLIST POST-EXECUTION

A la fin des 23 renommages :

```bash
# Lister tous les fichiers et verifier qu'aucun ancien nom ne subsiste
ls -la | grep "CONVERSATION_BRIDGE_"
ls -la | grep "CONVERSATION-CONTEXT_"
# Ces deux commandes doivent retourner ZERO resultat

# Compter le nombre total de fichiers (doit etre identique au depart)
ls | wc -l
```

---

## 6. CE QUE CE BRIEF NE COUVRE PAS

- **Les 28 suppressions** : elles seront faites manuellement par JP dans l'interface Claude.ai apres validation du renommage.
- **Toute modification de contenu** : aucun fichier ne doit etre edite, uniquement renomme.
- **Toute operation git** : ce brief concerne uniquement les fichiers KB projet, pas le repo jeanpierrecharles.com.

---

*Brief Claude Code — Renommage KB securise*
*Opus 4.6 — 20260316T1700 CET*
*23 fichiers a renommer — 0 fichier a supprimer — 0 fichier a modifier*
