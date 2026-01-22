# 🌍 PLAN DE TRADUCTION AEGIS - Questionnaires Bilingues

## FR/EN - Moteur d'AI, Risques & Compliance

**Date** : 18 janvier 2026  
**Version** : v2.4.0-EU

---

## 📊 État Actuel

### Fichiers à Traduire

1. **`data/regulation-questionnaires.json`** (421 lignes)
   - 6 règlements : AI Act, Machinery, GDPR, CRA, ESPR, Data Act
   - ~24 questions total
   - Templates de réponses

### Stratégie de Traduction

**Option A : Fichier Unique Bilingue** (Recommandée)

```json
{
  "ai_act": {
    "id": "2024/1689",
    "fr": {
      "titre": "AI Act - Règlement sur l'Intelligence Artificielle",
      "questions": [...]
    },
    "en": {
      "title": "AI Act - Artificial Intelligence Regulation",
      "questions": [...]
    }
  }
}
```

**Option B : Deux Fichiers Séparés**

- `regulation-questionnaires.fr.json`
- `regulation-questionnaires.en.json`

**Choix** : **Option A** (maintenance plus facile)

---

## 🚀 Implémentation

### Étape 1 : Restructuration du JSON (30 min)

- Wrapper chaque réglement avec `fr` et `en`
- Conserver IDs identiques

### Étape 2 : Traduction Questions (60 min)

- 24 questions × 2 langues
- Terminologie technique précise

### Étape 3 : Traduction Templates Réponses (30 min)

- Templates d'analyse par règlement

### Étape 4 : Update Code TypeScript (15 min)

- Adapter `RegulationQuiz.tsx` pour supporter bilingue
- Modifier service de chargement

### Étape 5 : Tests (15 min)

- Vérifier FR et EN
- Cohérence terminologique

**Durée totale estimée** : **2h30**

---

## 📝 Glossaire Technique FR → EN

| Français | Anglais | Contexte |
|----------|---------|----------|
| Intelligence Artificielle | Artificial Intelligence | Général |
| Système à haut risque | High-Risk System | AI Act |
| Marquage CE | CE Marking | Conformité EU |
| Notice d'instructions | Instruction Manual | Machinery |
| Données à caractère personnel | Personal Data | GDPR |
| Cyberrésilience | Cyber Resilience | CRA |
| Écoconception | Ecodesign | ESPR |
| Passeport Numérique Produit | Digital Product Passport | DPP |
| Durabilité | Sustainability | ESPR |
| Traçabilité | Traceability | DPP |
| Circularité | Circularity | ESPR |
| Réparabilité | Repairability | ESPR |

---

## ⏱️ Timeline

| Phase | Tâche | Durée | Délai |
|-------|-------|-------|-------|
| **Phase 1** | Restructuration JSON | 30 min | Immédiat |
| **Phase 2** | Traduction AI Act + Machinery | 30 min | +30 min |
| **Phase 3** | Traduction GDPR + CRA | 30 min | +1h |
| **Phase 4** | Traduction ESPR + Data Act | 30 min | +1h30 |
| **Phase 5** | Update Code TS | 15 min | +1h45 |
| **Phase 6** | Tests & Validation | 15 min | +2h |

**Prêt dans** : **2 heures**

---

## ✅ Actions Immédiates

**Dois-je lancer la traduction complète maintenant ?**

Si OUI, je procède dans l'ordre suivant :

1. Créer `regulation-questionnaires-bilingual.json`
2. Traduire AI Act (questions + templates)
3. Traduire Machinery
4. Traduire GDPR
5. Traduire CRA
6. Traduire ESPR
7. Traduire Data Act
8. Update `RegulationQuiz.tsx` pour supporter langue
9. Tests FR/EN

---

**Confirmation requise** : Voulez-vous que je commence la traduction du fichier complet maintenant ? 🚀
