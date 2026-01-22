# ⚡ QUICK REFERENCE : Modèles Gemini pour Aegis

**TL;DR** : Utilisez `models/gemini-2.0-flash` ✅

---

## 🎯 RÉSULTAT DU TEST (2026-01-22)

| Modèle | Statut | Temps | Qualité | Recommandation |
|--------|--------|-------|---------|----------------|
| **models/gemini-2.0-flash** | ✅ | 4.2s | 6/6 | ⭐ **OPTIMAL** |
| models/gemini-2.5-flash | ✅ | 5.8s | 5/6 | ⚠️ Réponses trop courtes |
| models/gemini-2.5-pro | ✅ | 10.5s | 0/6 | ❌ Dysfonctionnel |
| models/gemini-3.x-* | ❌ | N/A | N/A | ❌ N'existe pas encore |
| models/gemini-1.5-* | ❌ | N/A | N/A | ❌ Non supporté API v1beta |

---

## 💡 POURQUOI gemini-2.0-flash ?

✅ **Le plus rapide** (4.2 sec)  
✅ **Qualité parfaite** (6/6)  
✅ **Réponses complètes** (393 mots vs 25)  
✅ **Expertise conformité EU** (RGPD, AI Act, ESPR)  
✅ **Adapté PME** françaises  
✅ **Stable** (version 2.0, pas preview)

---

## ⚙️ CONFIG ACTUELLE

```typescript
const MODEL_NAME = 'models/gemini-2.0-flash';
```

**Statut** : ✅ Déjà en place, opérationnel

---

## 📊 BENCHMARK EXPRESS

```
Performance (ms)     Qualité (/6)
2.0-flash  4178 ⭐   2.0-flash  6/6 ⭐
2.5-flash  5825      2.5-flash  5/6
2.5-pro   10502      2.5-pro    0/6
```

---

**Conclusion** : Aucun changement nécessaire. Configuration actuelle = optimale.

**Docs complètes** :

- `SYNTHESE-COMPARATIVE-MODELES-GEMINI.md`
- `DASHBOARD-TESTS-MODELES-GEMINI.md`
