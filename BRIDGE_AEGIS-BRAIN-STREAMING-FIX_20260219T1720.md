# BRIDGE — AEGIS Brain IA · Correctifs Streaming & i18n
**Session :** 20260219T1645  
**Projet :** jeanpierrecharles.com · `localhost:5173`  
**Statut :** ✅ Corrigé · Testé · Prêt pour `git push main`

---

## Contexte

Deux bugs bloquants identifiés avant push main, diagnostiqués et corrigés en session live via Claude Desktop + Chrome.

---

## Bug 1 — Streaming cassé : bloc unique après ~3sec

**Fichier :** `api/gemini-proxy.ts`

**Cause :** Double buffering côté proxy Vercel.
- `res.flushHeaders()` absent → le client ne reçoit pas le signal SSE immédiatement
- Pas de `flush()` après chaque `res.write()` → Vercel accumule tous les chunks jusqu'à `res.end()`

**Correctif appliqué :**
```typescript
res.setHeader('X-Accel-Buffering', 'no');  // Désactive Nginx si présent
res.flushHeaders();                          // Envoie les headers SSE immédiatement

// Dans la boucle de lecture :
res.write(chunk);
(res as any).flush?.();                      // Force le flush TCP après chaque chunk
```

**Résultat :** Streaming token-par-token confirmé ✅

---

## Bug 2 — Q/R EN → réponse en FR

**Fichier :** `src/components/brain/AegisChat.tsx`

**Cause :** `SYSTEM_INSTRUCTION` hardcodée en français quelle que soit la langue de l'interface. Gemini ignorait parfois la langue de la question et répondait en français.

**Correctif appliqué :**
```typescript
// AVANT : string statique FR
const SYSTEM_INSTRUCTION = `Tu es AEGIS Brain...`;

// APRÈS : dictionnaire i18n
const SYSTEM_INSTRUCTIONS: Record<'fr' | 'en', string> = {
  fr: `Tu es AEGIS Brain... Réponds TOUJOURS en français...`,
  en: `You are AEGIS Brain... ALWAYS respond in English...`,
};

// Usage dans handleSend() :
const { t, lang } = useLang();
const baseSystem = SYSTEM_INSTRUCTIONS[lang] ?? SYSTEM_INSTRUCTIONS.fr;
```

**Résultat :**
- EN → question AI Act → réponse 100% anglais ✅
- FR → question NIS2 → réponse 100% français ✅

---

## Points ouverts (session suivante)

| # | Item | Responsable |
|---|------|-------------|
| 1 | Supprimer référence CDN Tailwind | AG |
| 2 | AEGIS Brain = VUI principale B2B (cf. EXECUTIVE REPORT 20260218) | AG + JP |
| 3 | Confirmer modèle : migrer `gemini-2.0-flash` → `gemini-2.5-flash` ? | JP décide |
| 4 | Ajouter formulaire de contact + génération docs (formules payantes) | AG |
| 5 | Ajouter formule mise en relation / expertise sur mesure | AG |

---

## Stack impactée

`Vite 5 · React 19 · TypeScript · Vercel Serverless · Gemini 2.0 Flash · SSE`
