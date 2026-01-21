# 📱 Guide d'accès mobile à JeanPierreCharles.com

**Date de création** : 16 janvier 2026  
**Version** : 1.0  
**Pour** : Accéder à l'application depuis smartphone/tablette

---

## 🎯 Objectif

Accéder à votre site en développement local depuis votre smartphone ou tablette Android/iOS pour tester le responsive design et l'expérience utilisateur mobile.

---

## 📋 Prérequis

- ✅ Serveur de développement lancé sur votre PC (via `npm run dev` ou `start-dev.bat`)
- ✅ PC et appareil mobile connectés au **même réseau WiFi**
- ✅ Pare-feu Windows configuré pour autoriser les connexions (voir section Dépannage)

---

## 🚀 Procédure d'accès

### Étape 1 : Identifier l'adresse réseau

Lorsque le serveur Vite démarre, il affiche deux URL :

```
➜  Local:   http://localhost:3000/
➜  Network: http://192.168.1.125:3000/
```

**Retenez l'URL "Network"** (adresse réseau) : `http://192.168.1.125:3000/`

> 💡 **Note** : L'adresse IP (192.168.1.125) peut varier selon votre réseau et peut changer si votre PC redémarre.

**Raccourci** : Double-cliquez sur `show-mobile-url.bat` pour afficher automatiquement l'URL.

### Étape 2 : Vérifier la connexion réseau

Sur votre smartphone/tablette :

1. Ouvrir les **Paramètres**
2. Aller dans **WiFi**
3. Vérifier que vous êtes connecté au **même réseau WiFi** que votre PC

**Exemple** :
- ✅ PC sur "WiFi-Maison" ET téléphone sur "WiFi-Maison" → OK
- ❌ PC sur "WiFi-Maison" ET téléphone sur données mobiles 4G/5G → KO
- ❌ PC sur "WiFi-Maison" ET téléphone sur "WiFi-Invités" → KO

### Étape 3 : Accéder à l'application

Sur votre navigateur mobile (Chrome, Safari, Firefox, Edge) :

1. Ouvrir le **navigateur**
2. Taper dans la barre d'adresse : `http://192.168.1.125:3000/`
3. Appuyer sur **Entrée**

➡️ L'application devrait s'afficher ! 🎉

### Étape 4 : Ajouter un raccourci (optionnel)

**Sur Android (Chrome)** :
1. Ouvrir l'application dans Chrome
2. Appuyer sur le menu ⋮ (trois points)
3. Sélectionner **"Ajouter à l'écran d'accueil"**
4. Confirmer

**Sur iOS (Safari)** :
1. Ouvrir l'application dans Safari
2. Appuyer sur le bouton **Partager** 📤
3. Sélectionner **"Sur l'écran d'accueil"**
4. Confirmer

---

## 🔧 Dépannage

### ❌ Problème 1 : "Ce site est inaccessible"

**Causes possibles** :

1. **Réseaux WiFi différents**
   - **Vérification** : Confirmez que PC et mobile sont sur le même WiFi
   - **Solution** : Connectez les deux au même réseau

2. **Serveur non démarré**
   - **Vérification** : Vérifiez que le terminal affiche "ready in XXX ms"
   - **Solution** : Lancez `npm run dev` ou `start-dev.bat`

3. **Mauvaise adresse IP**
   - **Vérification** : Vérifiez l'URL "Network" dans le terminal du serveur
   - **Solution** : Utilisez exactement l'URL affichée

### ❌ Problème 2 : Pare-feu bloque la connexion

**Symptômes** : Connexion refuse, timeout

**Solution** : Autoriser le port dans le pare-feu Windows

1. **Ouvrir PowerShell en tant qu'administrateur** :
   - Clic droit sur menu Démarrer → "Terminal (Admin)"

2. **Autoriser le port Vite** :
   ```powershell
   netsh advfirewall firewall add rule name="Vite Dev Server" dir=in action=allow protocol=TCP localport=3000
   ```

3. **Si le port change** (ex: 3001, 3002), adapter la commande :
   ```powershell
   netsh advfirewall firewall add rule name="Vite Dev Server 3001" dir=in action=allow protocol=TCP localport=3001
   ```

###  Problème 3 : L'adresse IP a changé

**Cause** : Le PC a redémarré ou changé de réseau

**Solution** : Retrouver la nouvelle adresse IP

**Méthode 1** : Double-cliquer sur `show-mobile-url.bat`

**Méthode 2** : Lire l'output du serveur Vite
```
➜  Network: http://192.168.1.125:3000/
```

**Méthode 3** : Commande PowerShell
```powershell
ipconfig
```
Cherchez "Adresse IPv4" sous votre carte WiFi (ex: `192.168.1.125`)

---

## 🔍 Comprendre localhost vs adresse réseau

### Concept

| Type | Adresse | Accessible depuis | Usage |
|------|---------|-------------------|-------|
| **Local** | `localhost` ou `127.0.0.1` | Uniquement sur le PC lui-même | Développement solo sur PC |
| **Réseau** | `192.168.x.x` | Tous les appareils du même réseau WiFi | Test multi-appareils |

### Pourquoi localhost ne marche pas sur mobile ?

`localhost` sur votre téléphone pointe **vers votre téléphone**, pas vers votre PC !

**Analogie** : 
- `localhost` = "chez moi"
- Quand vous êtes chez vous (PC) et dites "chez moi", c'est votre maison
- Quand votre ami (téléphone) dit "chez moi", c'est SA maison, pas la vôtre !

**Solution** : Utiliser l'adresse postale réelle (l'IP réseau) : "123 rue Example"

---

## 🎨 Cas d'usage : Tester le responsive design

L'accès mobile est essentiel pour :

1. **Portfolio JPC Website** :
   - ✅ Navigation responsive
   - ✅ Timeline sur mobile
   - ✅ Boutons tactiles (taille suffisante)
   - ✅ Images optimisées

2. **Aegis Platform** :
   - ✅ Dashboard sur mobile
   - ✅ AI Assistant utilisable sur tablette
   - ✅ Compliance Passport lisible sur smartphone
   - ✅ Formulaires tactiles

3. **Tests généraux** :
   - ✅ Performance sur vrais appareils
   - ✅ Gestes tactiles (swipe, pinch, scroll)
   - ✅ Clavier mobile
   - ✅ Orientation portrait/paysage

---

## 📊 Checklist de vérification

Avant de tester sur mobile, vérifiez :

- [ ] Serveur de développement lancé (`npm run dev`)
- [ ] Terminal affiche "ready in XXX ms"
- [ ] URL Network notée : `http://192.168.x.x:PORT/`
- [ ] PC et mobile sur le même WiFi
- [ ] Pare-feu configuré (si première fois)
- [ ] URL Network testée dans le navigateur mobile
- [ ] Test en mode Website (portfolio JPC)
- [ ] Test en mode App (Aegis Platform)

---

## 🔐 Sécurité

⚠️ **Notes de sécurité importantes** :

1. **Réseau de confiance uniquement** : N'utilisez cette méthode QUE sur votre WiFi personnel
2. **Développement local** : Cette méthode est pour le développement uniquement
3. **Production** : Le site en production sur jeanpierrecharles.com sera automatiquement accessible partout
4. **Pare-feu** : Après développement, vous pouvez fermer le port pour la sécurité

---

## 📝 Bonnes pratiques

1. **Tester systématiquement** : Vérifiez sur mobile après chaque modification visuelle importante
2. **Multi-appareils** : Testez sur Android ET iOS si possible (Samsung S24 Plus ✅, iPhone ✅)
3. **Multi-navigateurs** : Chrome, Safari, Firefox, Edge
4. **DevTools d'abord** : Chrome → F12 → Mode responsive avant de tester sur vrai appareil
5. **Documentation** : Notez les bugs spécifiques mobile dans un fichier dédié

---

## 🆘 Support

Si aucune solution ne fonctionne :

1. Vérifiez que votre routeur n'a pas de restriction de communication inter-appareils (isolation AP)
2. Sur certains réseaux d'entreprise/école, la communication entre appareils est bloquée
3. Essayez de créer un hotspot WiFi depuis votre PC et connectez-y votre mobile

---

**Document maintenu par** : Jean-Pierre Charles avec Antigravity AI  
**Dernière révision** : 16 janvier 2026
