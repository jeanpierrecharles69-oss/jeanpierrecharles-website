# RECOMMANDATION MODÈLE AG — 14/02/2026
# ═══════════════════════════════════════════
# Par Claude Opus 4.6 · Pour Jean-Pierre Charles
# ═══════════════════════════════════════════

## QUESTION
Quel modèle utiliser dans Google Antigravity pour l'implémentation
de la homepage v3.0-alpha cet après-midi ?

## MODÈLES DISPONIBLES DANS AG

| Modèle | Type | Forces | Faiblesses |
|--------|------|--------|------------|
| **Gemini 2.0 Flash** | Rapide, multimodal | Très rapide, bon pour scaffolding, gratuit dans AG | Qualité code inférieure, validation superficielle (constatée v2.6.0) |
| **Gemini 2.5 Pro** | Reasoning avancé | Meilleur raisonnement, meilleur code | Plus lent, rate limits en "High thinking" |
| **Claude Opus 4.6** | Thinking + Planning | Meilleure qualité code, meilleur TypeScript/React, planning structuré | Plus lent, consomme plus de tokens |
| **Claude Sonnet 4.5** | Équilibré | Bon rapport qualité/vitesse | Moins profond qu'Opus pour l'architecture |

## ⭐ RECOMMANDATION : GEMINI 2.5 PRO

### Pourquoi PAS Opus 4.6 dans AG ?

1. **Vous payez déjà Claude Max.** Utiliser Opus dans AG = consommer des tokens Google pour un modèle que vous avez en illimité sur claude.ai. C'est du gaspillage.

2. **Claude Opus est votre REVIEWER, pas votre EXÉCUTANT.** La boucle AG→Claude→JP fonctionne parce que deux intelligences DIFFÉRENTES vérifient le travail. Si AG utilise Opus ET Claude utilise Opus, vous perdez la diversité de vérification. Un modèle ne corrige pas bien ses propres patterns.

3. **Rate limits Opus dans AG.** AG est un "preview" Google. Les modèles Anthropic y sont intégrés via API avec des quotas potentiellement restrictifs. Gemini est natif dans AG = meilleur throughput.

### Pourquoi Gemini 2.5 Pro (pas 2.0 Flash) ?

1. **Qualité code TypeScript/React.** L'implémentation de composants complexes (timeline ParcoursRD, responsive grid TrustBadges) nécessite du raisonnement structuré. Flash est trop superficiel pour ça — c'est ce qui a causé les problèmes OBS-1 à OBS-4 en v2.6.0.

2. **Meilleur suivi d'instructions.** Le BRIEF contient des contraintes précises (palette, typography, données CV, fichiers interdits). Gemini 2.5 Pro les respecte mieux que Flash.

3. **Natif dans AG.** Pas de latence API tierce. Meilleur throughput. Pas de risque de rate limiting.

4. **Gratuit dans AG Preview.** Pas de coût supplémentaire.

## CONFIGURATION AG RECOMMANDÉE

```
Modèle : Gemini 2.5 Pro
Thinking : High (pour le raisonnement architectural)
Temperature : 0.2 (code déterministe, pas créatif)
Context : Charger le wireframe R2 + BRIEF dans le "Brain" AG
```

## WORKFLOW CET APRÈS-MIDI

```
14h–14h30  JP charge le BRIEF + wireframe R2 dans AG
14h30–17h  AG Gemini 2.5 Pro implémente S0–S4
17h–17h30  JP upload les fichiers produits dans claude.ai
17h30–18h  Claude Opus 4.6 review V&V (sécurité, cohérence, qualité)
18h        JP décide : GO push / corrections / NO-GO
```

### Avantage clé de cette répartition :

| Rôle | Outil | Modèle | Force exploitée |
|------|-------|--------|-----------------|
| **EXÉCUTION** (code gen) | AG | Gemini 2.5 Pro | Vitesse, intégration IDE, throughput |
| **REVIEW** (V&V) | claude.ai | Claude Opus 4.6 | Profondeur analyse, sécurité, cohérence architecture |
| **DÉCISION** | JP | Humain | Jugement terrain, validation business |

> **Principe : Deux cerveaux différents valent mieux qu'un seul cerveau deux fois.**
> Gemini génère. Claude vérifie. JP décide. Chacun sa force.

## SI GEMINI 2.5 PRO N'EST PAS DISPONIBLE

Fallback : **Gemini 2.0 Flash** mais avec ces précautions :
- Découper le BRIEF en sous-tâches plus petites (1 composant à la fois)
- Demander à AG de vérifier chaque fichier avant de passer au suivant
- Prévoir plus de corrections lors de la review Claude
- Ne PAS utiliser le mode "auto" — garder le contrôle fichier par fichier
