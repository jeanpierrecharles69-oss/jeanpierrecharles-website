# Guide de Démarrage Rapide - Linting Automatique AFRS

**Temps requis**: 10 minutes  
**Prérequis**: Aucun (tout sera installé)

---

## 🚀 Installation en 3 Étapes

### Étape 1 : Installer Node.js (3 min)

1. Ouvrir le navigateur web
2. Aller sur : **<https://nodejs.org/>**
3. Cliquer sur le gros bouton vert "**LTS**" (Télécharger)
4. Exécuter le fichier téléchargé (`.msi`)
5. Suivre l'assistant (laisser tous les paramètres par défaut)
6. Cliquer sur "Installer"

**Vérification** :

- Ouvrir PowerShell (touche Windows + X, puis "Windows PowerShell")
- Taper : `node --version`
- Résultat attendu : `v18.x.x` ou supérieur

---

### Étape 2 : Installer Markdownlint (2 min)

Dans PowerShell (clic droit → "Exécuter en tant qu'administrateur") :

```powershell
npm install -g markdownlint-cli
```

Attendre la fin de l'installation (environ 30 secondes).

**Vérification** :

```powershell
markdownlint --version
```

Résultat attendu : Un numéro de version (ex: `0.33.0`)

---

### Étape 3 : Activer les Scripts (1 min)

Dans PowerShell (toujours en administrateur) :

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Taper `O` puis Entrée pour confirmer.

---

## ✅ Utilisation

### Vérifier les Erreurs

1. Ouvrir l'Explorateur Windows
2. Aller dans : `G:\Mon Drive\Google AI Studio`
3. Clic droit sur **`lint-check.ps1`**
4. Choisir "**Exécuter avec PowerShell**"

→ Une fenêtre s'ouvre et affiche les résultats

### Corriger Automatiquement

1. Dans le même dossier
2. Clic droit sur **`lint-fix.ps1`**
3. Choisir "**Exécuter avec PowerShell**"
4. Taper `O` puis Entrée pour confirmer

→ Les erreurs sont corrigées automatiquement

---

## 📅 Routine Recommandée

**Tous les matins avant de travailler** :

1. Double-clic sur `lint-check.ps1`
2. Si "✅ SUCCÈS" → Commencer à travailler
3. Si "⚠️ ATTENTION" → Double-clic sur `lint-fix.ps1`

**Le soir avant de quitter** :

1. Double-clic sur `lint-check.ps1`
2. Si nécessaire, double-clic sur `lint-fix.ps1`

---

## ❓ Problèmes Fréquents

### "markdownlint n'est pas reconnu"

**Solution** : Réinstaller markdownlint

```powershell
npm install -g markdownlint-cli --force
```

### "Impossible de charger le fichier lint-check.ps1"

**Solution** : Réactiver les scripts

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "Accès refusé"

**Solution** : Ouvrir PowerShell en tant qu'administrateur

- Touche Windows + X
- Choisir "Windows PowerShell (admin)"

---

## 📚 Pour Aller Plus Loin

- **Guide complet** : `jeanpierrecharles_AFRS_GUIDE-LINTING.md`
- **Procédure détaillée** : `jeanpierrecharles_AFRS_PROCEDURE-LINTING-AUTO.md`

---

**C'est tout ! Vous êtes prêt à utiliser le linting automatique. 🎉**
