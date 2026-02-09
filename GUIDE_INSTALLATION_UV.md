# 🔧 Guide d'installation de uv - Résolution du problème Windows-MCP

## 📋 Problème identifié

Le serveur MCP "Windows-MCP" ne peut pas démarrer car la commande `uv` n'est pas installée sur votre système.

**Erreur exacte :**
```
'uv' n'est pas reconnu en tant que commande interne
```

## 🎯 Solution : Installer uv

### Option 1 : Utiliser le script automatique (RECOMMANDÉ)

1. **Ouvrez l'Explorateur Windows**
2. **Naviguez vers** : `C:\Projects\jeanpierrecharles`
3. **Double-cliquez sur** : `install-uv.bat`
4. **Suivez les instructions** à l'écran
5. **Fermez complètement Claude Desktop** (Alt+F4 ou Fichier > Quitter)
6. **Redémarrez Claude Desktop**

### Option 2 : Installation manuelle via PowerShell

1. **Ouvrez PowerShell en tant qu'administrateur**
   - Appuyez sur `Win + X`
   - Sélectionnez "Windows PowerShell (Admin)"

2. **Exécutez cette commande :**
   ```powershell
   irm https://astral.sh/uv/install.ps1 | iex
   ```

3. **Fermez et rouvrez PowerShell**

4. **Vérifiez l'installation :**
   ```powershell
   uv --version
   ```

5. **Redémarrez Claude Desktop**

### Option 3 : Installation via winget

```powershell
winget install --id=astral-sh.uv -e
```

## ✅ Vérification

Après l'installation et le redémarrage de Claude :

1. L'alerte rouge en haut de Claude devrait disparaître
2. Le serveur "Windows-MCP" devrait se connecter automatiquement
3. Claude pourra interagir avec votre système Windows

## ❓ Que fait Windows-MCP ?

Cette extension permet à Claude de :
- Lire et interagir avec votre système de fichiers Windows
- Exécuter des commandes système
- Automatiser des tâches sur votre ordinateur
- Accéder aux informations système

## 🆘 En cas de problème

Si après installation le problème persiste :

1. **Vérifiez que uv est dans le PATH**
   ```powershell
   $env:Path
   ```
   
2. **Consultez les logs de Claude**
   - Allez dans : `C:\Users\jpcha\AppData\Roaming\Claude\logs`
   - Ouvrez : `mcp-server-Windows-MCP.log`

3. **Redémarrez votre ordinateur** (parfois nécessaire pour mettre à jour le PATH)

## 📚 Ressources

- Documentation uv : https://docs.astral.sh/uv/
- Documentation MCP : https://modelcontextprotocol.io/
- Windows-MCP GitHub : https://github.com/CursorTouch/windows-mcp

---

**Créé le :** 2026-02-05  
**Statut :** ⏳ En attente d'installation
