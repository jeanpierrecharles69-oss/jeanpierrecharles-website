# 🎨 RÉFÉRENCE RAPIDE - Harmonisation Design

## 📸 Captures d'écran analysées

Vous avez fourni 2 images identiques montrant la **page d'accueil**.

## 🔍 Résumé Exécutif

### ✅ Ce qui est DÉJÀ harmonisé

- ✅ Police `Inter` partout
- ✅ Boutons principaux: `bg-slate-900` sur accueil, plateforme, dashboard
- ✅ Textes: Cohérence slate-600/700/800/900
- ✅ Bordures: `border-slate-200` uniforme

### ❌ Ce qui DOIT être corrigé

- ❌ **Header Assistant AI**: Gradient `blue-600 → blue-700 → yellow-600` (trop flashy)
- ❌ **Bouton Send Assistant**: Gradient bleu au lieu de slate-900
- ❌ **Tonalité générale**: L'assistant se démarque trop visuellement

---

## 🎯 Solution Recommandée (Option A)

### **Fichier**: `components/AiAssistant.tsx`

#### Modification #1: Header (ligne ~362)

```tsx
// ❌ AVANT - Gradient européen coloré
<header className="... bg-gradient-to-r from-blue-600 via-blue-700 to-yellow-600 ...">
  <SparklesIcon className="h-5 w-5 text-yellow-200" />
  <p className="text-xs text-blue-100">Expert conformité européenne</p>
</header>

// ✅ APRÈS - Navy unifié
<header className="... bg-slate-900 ...">
  <SparklesIcon className="h-5 w-5 text-white" />
  <p className="text-xs text-slate-300">Expert conformité européenne</p>
</header>
```

#### Modification #2: Bouton Send (ligne ~454)

```tsx
// ❌ AVANT
className="... bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 ..."

// ✅ APRÈS
className="... bg-slate-900 hover:bg-slate-800 ..."
```

---

## 🎨 Charte Finale (Après Harmonisation)

| Zone | Couleur Fond | Couleur Texte | Notes |
|------|-------------|---------------|-------|
| **Page Accueil - Hero** | `white` | `slate-900` | Titres très contrastés |
| **Page Accueil - Navigation** | `white` + `slate-900` (logo) | `slate-600` | Minimaliste |
| **Plateforme - Dashboard** | `slate-50` | `slate-800` | Soft background |
| **Assistant - Header** | `slate-900` ✨ | `white` | Cohérent avec accueil |
| **Assistant - Messages** | `white` / `slate-800` | `slate-800` / `white` | Bon contraste |
| **Boutons CTA** | `slate-900` | `white` | **Uniforme partout** |

---

## 📊 Impact Visuel

### Avant (Actuel)

```
┌─────────────────────────────────────┐
│ Accueil: Navy sobre 🔵⚫           │
│ Plateforme: Blanc minimaliste ⚪    │
│ Assistant: Gradient EU 🔵🟡 ⚠️    │ <- Incohérent
└─────────────────────────────────────┘
```

### Après (Harmonisé)

```
┌─────────────────────────────────────┐
│ Accueil: Navy sobre 🔵⚫ ✅         │
│ Plateforme: Blanc minimaliste ⚪ ✅ │
│ Assistant: Navy sobre 🔵⚫ ✅      │ <- Cohérent!
└─────────────────────────────────────┘
```

---

## ⚡ Actions Immédiates

1️⃣ **Vous validez** Option A (recommandée) ou Option B  
2️⃣ **Je modifie** `AiAssistant.tsx` (2 remplacements)  
3️⃣ **Vous testez** `npm run dev` → localhost:3000  
4️⃣ **Validation visuelle** OK → commit  

**Temps estimé**: 5 minutes ⏱️

---

## 🤔 C'est clair?

**OUI** → Je procède aux modifications  
**NON** → Posez vos questions, je clarifie!
