# 🔄 Solution Automatique : Lecture Google Drive via OAuth

## 📋 Architecture Proposée

### Cas d'usage

Votre assistant Aegis peut accéder automatiquement à vos documents Drive privés pour :

- Lire les règlements PDF que vous stockez
- Analyser vos rapports de conformité
- Synchroniser la base de connaissances
- Extraire automatiquement les nouvelles publications EUR-Lex

---

## 🏗️ Implémentation

### Étape 1 : Configuration OAuth Google (Cloud Console)

**Services à activer** :

- Google Drive API
- Google Docs API
- (Optionnel) Google Sheets API pour export données

**Scopes OAuth nécessaires** :

```
https://www.googleapis.com/auth/drive.readonly
https://www.googleapis.com/auth/documents.readonly
```

### Étape 2 : Code d'intégration

```typescript
// services/googleDriveService.ts
import { google } from 'googleapis';

// Authentification OAuth stockée en session
const oauth2Client = new google.auth.OAuth2(
  process.env.VITE_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:5173/auth/callback'
);

// Lire un document Google Docs
export async function readGoogleDoc(documentId: string): Promise<string> {
  const docs = google.docs({ version: 'v1', auth: oauth2Client });
  
  const response = await docs.documents.get({
    documentId: documentId
  });
  
  // Extraire le texte du document
  const content = response.data.body?.content || [];
  let text = '';
  
  content.forEach(element => {
    if (element.paragraph) {
      element.paragraph.elements?.forEach(e => {
        if (e.textRun?.content) {
          text += e.textRun.content;
        }
      });
    }
  });
  
  return text;
}

// Lister les PDFs dans un dossier Drive
export async function listPDFsInFolder(folderId: string) {
  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  
  const response = await drive.files.list({
    q: `'${folderId}' in parents and mimeType='application/pdf'`,
    fields: 'files(id, name, modifiedTime)',
    orderBy: 'modifiedTime desc'
  });
  
  return response.data.files || [];
}

// Télécharger un PDF depuis Drive
export async function downloadPDFFromDrive(fileId: string): Promise<ArrayBuffer> {
  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  
  const response = await drive.files.get(
    { fileId: fileId, alt: 'media' },
    { responseType: 'arraybuffer' }
  );
  
  return response.data as ArrayBuffer;
}
```

### Étape 3 : Workflow automatisé

```typescript
// Synchronisation automatique des règlements depuis Drive
async function syncRegulationsFromDrive() {
  // 1. Lister les PDFs dans votre dossier "Règlements UE"
  const pdfFiles = await listPDFsInFolder('YOUR_DRIVE_FOLDER_ID');
  
  for (const file of pdfFiles) {
    console.log(`📄 Traitement : ${file.name}`);
    
    // 2. Télécharger le PDF
    const pdfData = await downloadPDFFromDrive(file.id);
    
    // 3. Extraire avec Gemini (comme dans extractRegulationsFromPDF.ts)
    const regulationData = await extractRegulationFromPDF(pdfData);
    
    // 4. Mettre à jour la base de connaissances
    if (regulationData) {
      await addRegulationToDatabase(regulationData);
      console.log(`✅ ${regulationData.numero} ajouté`);
    }
  }
}

// Exécuter automatiquement toutes les 24h
setInterval(syncRegulationsFromDrive, 24 * 60 * 60 * 1000);
```

---

## 🔐 Sécurité et Conformité

### RGPD

- ✅ Scope `readonly` minimal (principe du moindre privilège)
- ✅ Données stockées localement (pas de transfert tiers)
- ✅ Révocation OAuth possible à tout moment

### Avantages

1. **Automatisation** : Synchronisation auto des nouveaux règlements
2. **Sécurité** : Pas besoin de rendre les docs publics
3. **Traçabilité** : Logs d'accès via Google Cloud Console
4. **Scalabilité** : Peut gérer des centaines de documents

### Coûts

- **Google Drive API** : Gratuit (quota quotidien généreux)
- **Google Docs API** : Gratuit (quota quotidien généreux)

---

## 📌 Alternative Simple (Sans OAuth)

Si vous ne voulez pas OAuth tout de suite :

### Solution : Export automatique Drive → Local

**Script PowerShell** :

```powershell
# Synchroniser un dossier Drive vers local
# Utilise Google Drive Desktop (déjà installé)

$sourceDrive = "G:\Mon Drive\Règlements UE"
$destLocal = "C:\Projects\jeanpierrecharles\pdf-reglements"

# Copie incrémentale
robocopy "$sourceDrive" "$destLocal" *.pdf /MIR /LOG:sync.log

# Puis extraction automatique
npx tsx scripts/extractRegulationsFromPDF.ts ./pdf-reglements
```

**Avantage** : Pas besoin d'OAuth, utilise l'app Google Drive Desktop

---

## 🎯 Recommandation

### Court terme (cette semaine)

✅ Utilisez **Google Drive Desktop** + script PowerShell pour sync auto

### Moyen terme (mois prochain)

🔄 Implémentez **OAuth 2.0** + Drive API pour automatisation complète

### Long terme

🔄 Webhooks Drive pour notification temps réel des nouveaux PDF

---

**Date** : 17 janvier 2026  
**Auteur** : Configuration jeanpierrecharles.com
