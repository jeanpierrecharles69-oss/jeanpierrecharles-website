# 📚 Alimenter la Base de Connaissances Réglementaires

## 🎯 Objectif

Alimenter automatiquement la base de données `data/reglements-europeens-2024.json` avec vos PDFs de règlements européens.

---

## 📖 Option 1 : Upload Local + Extraction Automatique (MAINTENANT)

### Étape 1 : Préparer vos PDFs

1. **Téléchargez vos PDFs depuis Google Drive** vers votre ordinateur
2. **Créez un dossier** dans votre projet :

   ```powershell
   mkdir C:\Projects\jeanpierrecharles\pdf-reglements
   ```

3. **Copiez vos PDFs** dans ce dossier

### Étape 2 : Installer les dépendances (si nécessaire)

```powershell
cd C:\Projects\jeanpierrecharles
npm install --save-dev tsx
```

### Étape 3 : Exécuter l'extraction automatique

```powershell
npx tsx scripts/extractRegulationsFromPDF.ts ./pdf-reglements
```

**Ce que fait le script** :

- ✅ Lit tous les PDFs du dossier
- ✅ Utilise Gemini pour extraire automatiquement :
  - Numéro du règlement
  - Titre complet
  - Dates (adoption, publication, entrée en vigueur)
  - Sujet et description
  - Champ d'application
  - Mots-clés
- ✅ Met à jour `data/reglements-europeens-2024.json`
- ✅ L'assistant Aegis utilise automatiquement ces nouvelles données !

### Exemple de sortie

```
🚀 Extraction automatique des règlements depuis PDFs
📂 Dossier : ./pdf-reglements

📄 Traitement de reglement-2024-1781.pdf...
✅ Règlement 2024/1781 ajouté
   Règlement sur l'écoconception des produits durables

📄 Traitement de reglement-2023-1230.pdf...
✅ Règlement 2023/1230 mis à jour
   Règlement relatif aux machines

✨ Done!
```

---

## 🚀 Option 2 : Intégration Google Drive (FUTUR - OAuth requis)

### Pourquoi pas maintenant ?

Cette option nécessite **OAuth 2.0 configuré** (voir `GUIDE-OAUTH-2.0-COMPLET.md`).

### Quand l'utiliser ?

**Si vous activez OAuth** (Phase 2), vous pourrez :

1. Se connecter à votre Google Drive
2. Sélectionner un dossier contenant vos règlements PDF
3. Synchronisation automatique des nouveaux règlements

### Architecture Google Drive Auto-Sync

```typescript
// Service futur (avec OAuth)
import { google } from 'googleapis';

async function syncFromGoogleDrive() {
    // 1. Authentification OAuth
    const drive = google.drive({ version: 'v3', auth: oauthClient });
    
    // 2. Lister les PDFs dans un dossier Drive
    const response = await drive.files.list({
        q: "mimeType='application/pdf' and 'FOLDER_ID' in parents",
        fields: 'files(id, name, modifiedTime)'
    });
    
    // 3. Télécharger et extraire
    for (const file of response.data.files) {
        const pdfData = await drive.files.get({
            fileId: file.id,
            alt: 'media'
        });
        
        // 4. Extraire avec Gemini
        const regulationData = await extractRegulationFromPDF(pdfData);
        
        // 5. Mettre à jour la base
        await addRegulationToDatabase(regulationData);
    }
}
```

---

## 📝 Méthode Manuelle (Alternative)

Si vous préférez contrôler manuellement :

1. **Ouvrez** : `data/reglements-europeens-2024.json`

2. **Ajoutez** votre règlement :

   ```json
   {
     "numero": "2024/XXXX",
     "nom_complet": "Règlement (UE) 2024/XXXX...",
     "nom_court": "Acronyme",
     "nom_francais": "Nom en français",
     "date_adoption": "2024-MM-DD",
     "date_publication": "2024-MM-DD",
     "date_entree_vigueur": "2024-MM-DD",
     "sujet": "Sujet principal",
     "description": "Description détaillée",
     "champ_application": "À quoi ça s'applique",
     "mots_cles": ["mot1", "mot2"],
     "source": "Source officielle"
   }
   ```

3. **Enregistrez**

4. **Redémarrez** le serveur : `npm run dev`

---

## 🔄 Workflow Recommandé

### Pour maintenir votre base à jour

```
1. Nouveau règlement publié
   ↓
2. Téléchargez le PDF officiel (EUR-Lex)
   ↓
3. Copiez dans ./pdf-reglements/
   ↓
4. Exécutez : npx tsx scripts/extractRegulationsFromPDF.ts
   ↓
5. Vérifiez data/reglements-europeens-2024.json
   ↓
6. L'assistant Aegis est automatiquement mis à jour !
```

---

## 📦 Structure des dossiers

```
jeanpierrecharles/
│
├── data/
│   └── reglements-europeens-2024.json    ← Base de connaissances
│
├── pdf-reglements/                        ← Vos PDFs sources
│   ├── reglement-2024-1781.pdf
│   ├── reglement-2023-1230.pdf
│   └── ...
│
├── scripts/
│   └── extractRegulationsFromPDF.ts      ← Script d'extraction
│
└── services/
    └── regulationKnowledgeService.ts     ← Service de lecture
```

---

## 🧪 Test

Après avoir ajouté un règlement :

1. **Redémarrez** : `npm run dev`
2. **Ouvrez** : <http://localhost:5173>
3. **Testez** : "Explique-moi le règlement 2024/XXXX"

L'assistant devrait utiliser vos données exactes ! ✅

---

## 💡 Conseils

### Sources fiables pour les PDFs

- **EUR-Lex** : <https://eur-lex.europa.eu/> (officiel)
- Journal officiel de l'UE

### Vérification de qualité

Après extraction automatique :

1. Ouvrez `data/reglements-europeens-2024.json`
2. Vérifiez les dates et numéros
3. Corrigez manuellement si nécessaire

### Limites Gemini PDF

- Taille max : 100MB par fichier
- Fonctionne mieux avec des PDFs bien structurés
- Peut nécessiter des corrections manuelles pour des formats complexes

---

## 🔮 Roadmap

### Phase 1 (Maintenant)

- ✅ Base de données JSON locale
- ✅ Extraction automatique depuis PDFs locaux
- ✅ Intégration dans l'assistant Aegis

### Phase 2 (Futur - avec OAuth)

- 🔄 Synchronisation Google Drive automatique
- 🔄 Interface web pour uploader des PDFs
- 🔄 Notification de nouveaux règlements

### Phase 3 (Avancé)

- 🔄 Veille automatique EUR-Lex
- 🔄 Notifications par email
- 🔄 Historique des versions de règlements

---

**Date** : 17 janvier 2026  
**Auteur** : Configuration jeanpierrecharles.com
