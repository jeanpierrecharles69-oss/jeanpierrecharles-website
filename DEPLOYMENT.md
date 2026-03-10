# DEPLOYMENT.md — Pipeline de déploiement

## Projet jeanpierrecharles.com | Aegis Circular

> **Dernière mise à jour :** 2026-02-11  
> **Auteur :** Jean-Pierre Charles + Claude  
> **Version :** 1.0

---

## Architecture du pipeline

```
C:\Projects\jeanpierrecharles\  (développement local)
    │
    ├── npm run build            (build Vite → dossier dist/)
    │
    ├── git push origin main     (push vers GitHub)
    │       │
    │       ▼
    │   GitHub: jeanpierrecharles69-oss/jeanpierrecharles-website
    │       │
    │       ▼  (auto-deploy déclenché par push)
    │   Vercel: jean-pierre-charles-projects
    │       │
    │       ▼  (DNS CNAME)
    └── Production: jeanpierrecharles.com (hébergé chez Gandi.net)
```

---

## Procédure de déploiement standard

### Étape 1 — Build local

```powershell
cd C:\Projects\jeanpierrecharles
npm run build
```

Vérifier :
- Build réussi sans erreurs
- `[dotenv] injecting env from .env.local` visible dans les logs

### Étape 2 — Audit sécurité pré-déploiement

```powershell
# Vérifier qu'aucune clé API n'est dans le bundle
Select-String -Path "dist\assets\*.js" -Pattern "AIzaSy" -SimpleMatch

# RÉSULTAT ATTENDU : aucune ligne retournée
# Si une clé est trouvée → STOP, ne pas déployer
```

### Étape 3 — Git commit et push

```powershell
# Vérifier les fichiers modifiés
git status

# VÉRIFICATION CRITIQUE :
# .env.local NE DOIT PAS apparaître dans la liste
# Si .env.local apparaît → vérifier .gitignore

# Ajouter les changements
git add -A

# Vérifier ce qui sera commité
git diff --cached --stat

# Commit
git commit -m "vX.Y.Z: Description courte"

# Push → déclenche auto-deploy Vercel
git push origin main
```

### Étape 4 — Vérification Vercel

1. Ouvrir **vercel.com/jean-pierre-charles-projects**
2. Vérifier que le build est **Ready** (vert)
3. Si erreur → lire les **Build Logs**

### Étape 5 — Vérification production

1. Ouvrir **jeanpierrecharles.com**
2. Tester l'assistant Aegis (poser une question réglementaire)
3. Vérifier l'affichage mobile (DevTools → responsive)

### Étape 6 — Vérification Gandi.net

1. Vérifier que le build est aussi à jour côté hébergeur Gandi
2. Tester depuis une navigation privée

---

## Variables d'environnement

### Local (.env.local — NON versionné)

```
VITE_GEMINI_API_KEY=<clé API Gemini>
```

> ⚠️ La variable préfixée VITE_ est embarquée dans le bundle client.  
> Objectif Semaine 2 : migration vers proxy serveur (suppression du préfixe VITE_).

### Vercel (Settings → Environment Variables)

```
GEMINI_API_KEY=<clé API Gemini côté serveur>
```

> ✅ Cette variable alimente le proxy API /api/gemini-proxy  
> Elle n'est PAS exposée dans le bundle client

### Rotation de clé API

En cas de rotation de la clé Gemini :

1. Créer nouvelle clé sur **aistudio.google.com/apikey**
2. Supprimer l'ancienne clé
3. Mettre à jour **.env.local** (local)
4. Mettre à jour **Vercel Dashboard** → Settings → Environment Variables
5. `npm run build` + `git push origin main`
6. Vérifier le déploiement sur **Vercel** et **Gandi.net**
7. Tester l'assistant Aegis en production

---

## Convention de commit

```
Format : "vX.Y.Z: Description courte"

Corps (optionnel) :
  [SECURITY] — Correctifs de sécurité
  [RGPD]     — Conformité données personnelles
  [FIX]      — Correction de bug
  [UX]       — Amélioration interface
  [CONFIG]   — Configuration infrastructure
  [PERF]     — Optimisation performance
```

---

## Fichiers critiques

| Fichier | Rôle | Sécurité |
|---------|------|----------|
| `.env.local` | Clé API locale | Exclu de Git, NE JAMAIS commiter |
| `api/gemini-proxy.ts` | Proxy serverless Vercel | Clé côté serveur UNIQUEMENT |
| `services/geminiService.ts` | Client-side API call | AUCUNE clé ici |
| `vercel.json` | Routing API + headers sécurité | CORS restreint |
| `components/TrustSection.tsx` | Logos clients | Logos VÉRIFIÉS uniquement |

---

## Contacts et accès

| Service | URL | Compte |
|---------|-----|--------|
| GitHub | github.com/jeanpierrecharles69-oss | jeanpierrecharles69-oss |
| Vercel | vercel.com/jean-pierre-charles-projects | Jean-Pierre Charles |
| Gandi.net | gandi.net | Domaine jeanpierrecharles.com |
| Google AI Studio | aistudio.google.com/apikey | Compte Google personnel |

---

## Dépannage

### Erreur API 400 en production

→ La clé API est invalide ou manquante côté Vercel.  
→ Vérifier Settings → Environment Variables → GEMINI_API_KEY

### Build Vercel en erreur

→ Lire les Build Logs dans le dashboard Vercel  
→ Vérifier que `npm run build` passe en local d'abord

### Site non mis à jour après push

→ Vérifier que le push est bien sur la branche `main`  
→ Vérifier que l'auto-deploy est activé dans Vercel (Deployments → Git)  
→ Vérifier aussi côté Gandi.net
