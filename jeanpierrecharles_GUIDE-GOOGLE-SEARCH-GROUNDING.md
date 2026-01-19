# 🔍 Google Search Grounding - Accès aux données récentes

## 🎯 Problème résolu

### Situation initiale

- **Problème** : Gemini répondait qu'il ne connaissait pas le règlement UE 2024/1781
- **Cause** : Knowledge cutoff (date de coupure des données d'entraînement)
- **Impact** : Impossible de répondre aux questions sur les règlements récents (2024+)

### Solution implémentée

- ✅ **Google Search Grounding** activé
- ✅ Gemini peut maintenant chercher des informations récentes sur le web
- ✅ Accès aux règlements européens les plus récents

---

## 🛠️ Ce qui a été modifié

### 1. Service Gemini amélioré (`services/geminiService.ts`)

#### Nouvelle configuration disponible

```typescript
// Google Search Grounding activé automatiquement
const groundingConfig = {
    googleSearchRetrieval: {
        dynamicRetrievalConfig: {
            mode: 'MODE_DYNAMIC',
            dynamicThreshold: 0.3, // Seuil de déclenchement
        }
    }
};
```

#### Nouvelles fonctions

| Fonction | Description | Google Search |
|----------|-------------|---------------|
| `runQuery(prompt, instruction, useGrounding)` | Requête simple | Optionnel (param 3) |
| `runQueryStream(prompt, instruction, useGrounding)` | Requête streaming | Optionnel (param 3) |
| `runComplianceQuery(prompt)` | ⭐ Spécialisée conformité | ✅ Activé par défaut |

---

### 2. Assistant Aegis mis à jour (`components/AiAssistant.tsx`)

**Avant** :

```typescript
for await (const chunk of runQueryStream(input, systemInstruction)) {
    // ...
}
```

**Après** :

```typescript
// Google Search activé pour accès aux règlements récents
for await (const chunk of runQueryStream(input, systemInstruction, true)) {
    // ...
}
```

✅ **Résultat** : L'assistant Aegis peut maintenant accéder aux règlements 2024 et suivants !

---

## 📊 Fonctionnement du Google Search Grounding

### Comment ça marche ?

```
1. Utilisateur pose une question
   ↓
2. Gemini analyse la question
   ↓
3. Si besoin d'infos récentes → Google Search activé 🔍
   ↓
4. Google recherche sur le web (officiellement)
   ↓
5. Gemini synthétise les résultats
   ↓
6. Réponse précise avec sources ✅
```

### Mode dynamique

**`dynamicThreshold: 0.3`** = Gemini décide automatiquement quand chercher

- Si la question porte sur des données dans ses connaissances → Réponse directe (rapide)
- Si la question porte sur des données récentes/inconnues → Google Search (précis)

---

## 🎯 Cas d'usage

### Questions qui bénéficient du grounding

✅ **Règlements récents**

- "Règlement UE 2024/1781"
- "Dernières mises à jour AI Act"
- "Nouvelles exigences CRA 2024"

✅ **Dates et deadlines**

- "Date d'entrée en vigueur de..."
- "Échéances RGPD 2026"

✅ **Actualités réglementaires**

- "Dernières décisions de la CNIL"
- "Nouvelles lignes directrices européennes"

### Questions qui n'en ont pas besoin

❌ **Connaissances générales**

- "Qu'est-ce que le RGPD ?" (dans les données d'entraînement)
- "Définition de la conformité" (connaissance générale)

---

## 🧪 Test

### Comment tester la fonction

1. **Démarrez le serveur** :

   ```powershell
   npm run dev
   ```

2. **Ouvrez l'assistant Aegis** sur <http://localhost:5173>

3. **Posez une question sur un règlement récent** :

   ```
   Rédiger un rapport concis sur les dernières mises à jour du règlement UE 2024/1781
   ```

4. **Vérifiez la réponse** :
   - ✅ Gemini devrait maintenant trouver des informations
   - ✅ La réponse devrait mentionner des sources web
   - ✅ Pas de message "ce numéro ne correspond pas..."

---

## ⚙️ Configuration avancée

### Ajuster le seuil de déclenchement

Dans `services/geminiService.ts` :

```typescript
dynamicThreshold: 0.3  // Valeur par défaut

// Plus bas (0.1-0.2) = Plus de recherches Google (précis mais lent)
// Plus haut (0.5-0.7) = Moins de recherches (rapide mais moins à jour)
```

**Recommandation actuelle** : `0.3` (bon équilibre)

---

### Désactiver pour certaines questions

Si vous voulez désactiver pour une question spécifique :

```typescript
// Juste les connaissances de Gemini (pas de Google Search)
await runQuery(prompt, systemInstruction, false);

// Avec Google Search
await runQuery(prompt, systemInstruction, true);
```

---

## 💰 Impact sur les coûts

### Token usage

⚠️ **Google Search Grounding consomme plus de tokens** :

- Requête normale : ~1000 tokens
- Avec grounding : ~2000-5000 tokens (selon les résultats de recherche)

### Recommandation

- ✅ **Activé par défaut pour Aegis** : Justifié car c'est un assistant conformité
- 🟡 **Désactiver si** : Application simple, moins critique
- ⚠️ **Surveiller** : Utilisation mensuelle dans Google Cloud Console

---

## 📚 Ressources

### Documentation Google

- [Grounding with Google Search](https://ai.google.dev/gemini-api/docs/grounding)
- [Dynamic Retrieval](https://ai.google.dev/gemini-api/docs/grounding#dynamic-retrieval)

### Monitoring

Vérifiez l'usage dans :

- **Google Cloud Console** → APIs & Services → Dashboard
- **Gemini API** → Quotas & limits

---

## ✅ Résumé des changements

| Fichier | Modification | Impact |
|---------|--------------|--------|
| `services/geminiService.ts` | + Google Search config | Nouvelles capacités |
| `services/geminiService.ts` | + Paramètre `useGrounding` | Contrôle fin |
| `services/geminiService.ts` | + `runComplianceQuery()` | Fonction spécialisée |
| `components/AiAssistant.tsx` | Grounding activé par défaut | Accès règlements 2024+ |

---

## 🎯 Prochaines étapes

### Pour valider la correction

1. **Testez localement** :

   ```powershell
   npm run dev
   ```

2. **Posez votre question** : "Règlement UE 2024/1781"

3. **Vérifiez que Gemini répond correctement**

### Si ça fonctionne

✅ Déployez sur Vercel (avec `VITE_GEMINI_API_KEY`)

### Si problème persiste

Vérifiez :

1. La clé API dans `.env.local` est correcte
2. L'API "Generative Language API" est activée
3. Pas d'erreur dans la console navigateur (F12)

---

**Date** : 17 janvier 2026  
**Problème résolu** : Knowledge cutoff / Règlements récents  
**Solution** : Google Search Grounding activé
