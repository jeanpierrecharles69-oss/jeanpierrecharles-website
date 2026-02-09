# 📊 Statut des Quotas - Mise à jour quotidienne

**Dernière mise à jour** : 29/01/2026 16:52

## Quotas actuels (à vérifier manuellement)

### Claude 4.5 Sonnet (Anthropic)

- **Limite mensuelle** : 1M tokens input / 100k tokens output
- **Consommé ce mois** : _À remplir après vérification sur console.anthropic.com_
- **Restant** : __%
- **Réinitialisation** : 01/02/2026
- **Statut** : 🟢 OK / 🟡 Attention / 🔴 Critique

### GPT-OSS (OpenAI)

- **Limite mensuelle** : _Selon votre plan_
- **Consommé ce mois** : _À remplir_
- **Restant** : __%
- **Réinitialisation** : _Date_
- **Statut** : 🟢 / 🟡 / 🔴

### Gemini (Google AI Pro)

- **Limite 5h** : Requêtes prioritaires
- **Limite hebdomadaire** : Requêtes standard
- **Consommé aujourd'hui** : _À remplir_
- **Prochain refresh** : _Heure_
- **Statut** : 🟢 / 🟡 / 🔴

### Autres modèles

- **Perplexity AI** : _Statut_
- **Mistral AI** : _Statut_
- **Autres** : _Statut_

---

## Stratégie du jour (29/01/2026)

**Modèle principal** : Gemini 2.5 Flash (quotas rechargés)
**Modèle secondaire** : Claude 4.5 (uniquement tâches critiques)
**Éviter** : GPT-OSS (quota épuisé jusqu'au ___)

### Tâches planifiées

- [ ] Tâche 1 → Gemini Flash
- [ ] Tâche 2 (complexe) → Claude (max 5k tokens)
- [ ] Documentation → Gemini 3 Pro (gratuit)

---

## Historique de consommation

| Date | Claude | GPT | Gemini | Notes |
|------|--------|-----|--------|-------|
| 24/01 | 85k | 120k | 50k | Dépassement GPT |
| 25/01 | 90k | ⛔ | 45k | Arrêt forcé |
| 29/01 | ___ | ___ | ___ | Reprise |

---

## Actions correctives prises

1. ✅ Workflow de monitoring créé
2. ✅ Règles de hiérarchisation définies
3. ⏳ Configuration `.antigravity/model-strategy.json` à tester
4. ⏳ Script d'alerte automatique (optionnel)
