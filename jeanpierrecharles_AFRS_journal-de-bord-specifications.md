# Journal de Bord - Spécifications Standards pour Projets Web

**Date de création** : 14 janvier 2026  
**Dernière mise à jour** : 14 janvier 2026  
**Projet de référence** : Aegis - AI Compliance Platform  
**Auteur** : Antigravity AI Assistant  
**Profil utilisateur** : Ingénieur en sciences des matériaux, technologies et conception/production de systèmes industriels (non-développeur)

---

## Table des Matières

### Partie A - Configuration Technique
1. [Configuration de l'environnement de développement](#1-configuration-de-lenvironnement-de-développement)
2. [Structure de projet React + Vite](#2-structure-de-projet-react--vite)
3. [Implémentation de l'export PDF](#3-implémentation-de-lexport-pdf)
4. [Résolution des problèmes courants](#4-résolution-des-problèmes-courants)
5. [Bonnes pratiques techniques](#5-bonnes-pratiques)

### Partie B - Conformité Réglementaire Européenne
6. [RGPD - Règlement Général sur la Protection des Données](#6-rgpd---règlement-général-sur-la-protection-des-données)
7. [Data Act - Règlement sur les Données](#7-data-act---règlement-sur-les-données)
8. [AI Act - Règlement sur l'Intelligence Artificielle](#8-ai-act---règlement-sur-lintelligence-artificielle)

### Partie C - Exigences Non-Fonctionnelles
9. [Sécurité des Applications](#9-sécurité-des-applications)
10. [Accessibilité (WCAG/RGAA)](#10-accessibilité-wcagrgaa)
11. [Performance et Robustesse](#11-performance-et-robustesse)
12. [Tests et Qualité](#12-tests-et-qualité)
13. [Déploiement en Europe](#13-déploiement-en-europe)

### Annexes
- [A. Commandes PowerShell utiles](#a-commandes-powershell-utiles)
- [B. Dépendances npm recommandées](#b-dépendances-npm-recommandées)
- [C. Checklist de conformité avant déploiement](#c-checklist-de-conformité-avant-déploiement)
- [D. Glossaire pour non-développeurs](#d-glossaire-pour-non-développeurs)
- [E. Ressources et références officielles](#e-ressources-et-références-officielles)

---

# PARTIE A - CONFIGURATION TECHNIQUE

---

## 1. Configuration de l'environnement de développement

### 1.1 Installation de Node.js sur Windows

#### Via Windows Package Manager (winget) - Recommandé

```powershell
# Installer Node.js LTS (x64 pour compatibilité maximale)
winget install OpenJS.NodeJS.LTS --architecture x64 --accept-package-agreements --accept-source-agreements

# Rafraîchir les variables d'environnement dans PowerShell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Vérifier l'installation
node --version
npm --version
```

#### Note importante pour Windows ARM64
- Sur Windows ARM64, utiliser l'architecture **x64** (émulée) plutôt que ARM64 native
- Cela évite les problèmes de compatibilité avec les modules natifs comme `rollup`

### 1.2 Configuration du projet local

#### Problème avec Google Drive
Les projets Node.js ne fonctionnent pas correctement dans les dossiers synchronisés Google Drive à cause des conflits de fichiers (erreurs `EBADF`, `EPERM`, `ENOTEMPTY`).

#### Solution Définitive (Best Practice Industrie)

**Principe**: Séparer le code source (cloud) du développement (local)

```powershell
# 1. Copier le projet vers un dossier local (une seule fois)
New-Item -ItemType Directory -Force -Path "C:\Projects"
robocopy "G:\Mon Drive\Google AI Studio\projet" "C:\Projects\projet" /E /XD node_modules .next dist build

# 2. Installer les dépendances dans le dossier local
cd C:\Projects\projet
npm install  # ✅ Fonctionne parfaitement

# 3. Développer TOUJOURS dans C:\Projects\projet
npm run dev

# 4. Synchroniser les changements (choisir UNE méthode):

## Option A: Git (Recommandé)
git init
git add .
git commit -m "Save changes"
git push origin main

## Option B: Script de sync manuel
robocopy "C:\Projects\projet" "G:\Mon Drive\Google AI Studio\projet" /MIR /XD node_modules .next dist build
```

**Script automatique créé**: `setup-aegis-local.ps1` dans Google Drive

#### Pourquoi c'est la solution définitive

| Aspect | Google Drive ❌ | Local (C:\Projects\) ✅ |
|--------|----------------|------------------------|
| npm install | Échoue (EBADF) | Fonctionne |
| Performance | Lent (I/O réseau) | Rapide (SSD local) |
| Hot reload | Retardé | Instantané |
| Fiabilité | Conflits sync | Aucun conflit |

**Règle d'or**: Le code source va dans le cloud, le développement se fait en local.

#### Solution recommandée
```powershell
# Copier le projet vers un dossier local (hors Google Drive)
New-Item -ItemType Directory -Force -Path "C:\Projects\nom-du-projet"
Copy-Item -Path "G:\Mon Drive\...\projet\*" -Destination "C:\Projects\nom-du-projet" -Recurse -Exclude "node_modules","package-lock.json"

# Installer les dépendances dans le dossier local
Set-Location "C:\Projects\nom-du-projet"
npm install
```

### 1.3 Démarrage du serveur de développement

```powershell
# Démarrer le serveur Vite
npm run dev

# Le serveur sera accessible sur :
# - Local: http://localhost:3000
# - Réseau: http://[IP-locale]:3000
```

---

## 2. Structure de projet React + Vite

### 2.1 Fichiers essentiels

```
projet/
├── index.html          # Point d'entrée HTML
├── index.tsx           # Point d'entrée React
├── App.tsx             # Composant principal
├── vite.config.ts      # Configuration Vite
├── tsconfig.json       # Configuration TypeScript
├── package.json        # Dépendances et scripts
├── .env.local          # Variables d'environnement
├── components/         # Composants React
│   └── *.tsx
├── services/           # Services (API, etc.)
│   └── *.ts
└── types.ts            # Définitions de types TypeScript
```

### 2.2 Configuration Vite (vite.config.ts)

```typescript
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0', // Permet l'accès réseau
      },
      plugins: [react()],
      define: {
        // Exposer les variables d'environnement au client
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
```

### 2.3 Variables d'environnement (.env.local)

```bash
# Clés API (ne jamais committer en production)
GEMINI_API_KEY=votre_clé_api_ici
```

---

## 3. Implémentation de l'export PDF

### 3.1 Installation de la bibliothèque

```powershell
npm install html2pdf.js
```

### 3.2 Implémentation complète du composant

```tsx
import React, { useRef } from 'react';
import html2pdf from 'html2pdf.js';

const MonComposant: React.FC = () => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = React.useState(false);

    const handleExportPDF = async () => {
        console.log('handleExportPDF called');
        const element = contentRef.current;
        if (!element) {
            console.error('contentRef.current is null');
            return;
        }

        setIsExporting(true);
        const filename = `document-${new Date().toISOString().split('T')[0]}.pdf`;

        const opt = {
            margin: 10,                                    // Marge en mm
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },        // Qualité d'image
            html2canvas: { 
                scale: 2,                                  // Résolution (2x pour HD)
                useCORS: true,                             // Permettre les images externes
                logging: true                              // Logs de debug
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait' 
            }
        };

        try {
            console.log('Generating PDF blob...');
            
            // Générer le PDF comme blob (plus fiable)
            const pdfBlob = await html2pdf()
                .set(opt)
                .from(element)
                .output('blob');
            
            console.log('PDF blob generated, size:', pdfBlob.size);

            // Créer l'URL du blob
            const url = URL.createObjectURL(pdfBlob);
            console.log('Blob URL created:', url);

            // Créer et déclencher le lien de téléchargement
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            
            // Délai pour s'assurer que le lien est dans le DOM
            await new Promise(resolve => setTimeout(resolve, 100));
            
            link.click();
            console.log('Download link clicked');

            // Nettoyage après téléchargement
            setTimeout(() => {
                if (document.body.contains(link)) {
                    document.body.removeChild(link);
                }
                URL.revokeObjectURL(url);
                console.log('Cleanup completed');
            }, 1000);

        } catch (error) {
            console.error('PDF export failed:', error);
            alert('Erreur lors de l\'export PDF. Veuillez réessayer.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div ref={contentRef}>
            {/* Contenu à exporter en PDF */}
            <h1>Mon Document</h1>
            <p>Contenu...</p>
            
            {/* Bouton d'export */}
            <button 
                onClick={handleExportPDF} 
                disabled={isExporting}
                className={isExporting ? 'loading' : ''}
            >
                {isExporting ? 'Export en cours...' : 'Exporter au format PDF'}
            </button>
        </div>
    );
};

export default MonComposant;
```

### 3.3 Points clés de l'implémentation

| Élément | Description |
|---------|-------------|
| `useRef` | Référence au conteneur HTML à convertir en PDF |
| `output('blob')` | Génère un blob au lieu d'un téléchargement direct (plus fiable) |
| `URL.createObjectURL` | Crée une URL temporaire pour le blob |
| `link.click()` | Déclenche le téléchargement |
| `URL.revokeObjectURL` | Libère la mémoire après téléchargement |
| `isExporting` | État pour afficher un indicateur de chargement |

### 3.4 Personnalisation du PDF

```typescript
// Options disponibles pour html2pdf
const options = {
    margin: [10, 10, 10, 10],     // [haut, droite, bas, gauche] en mm
    filename: 'document.pdf',
    image: { 
        type: 'jpeg',             // 'jpeg' ou 'png'
        quality: 0.98             // 0 à 1
    },
    html2canvas: { 
        scale: 2,                 // 1 = 72dpi, 2 = 144dpi, 3 = 216dpi
        useCORS: true,            // Pour les images externes
        logging: false,           // Désactiver en production
        letterRendering: true,    // Meilleur rendu du texte
        allowTaint: true          // Permettre les images sans CORS
    },
    jsPDF: { 
        unit: 'mm',               // 'mm', 'cm', 'in', 'px'
        format: 'a4',             // 'a4', 'letter', [largeur, hauteur]
        orientation: 'portrait'   // 'portrait' ou 'landscape'
    },
    pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.page-break-before',
        after: '.page-break-after',
        avoid: '.no-break'
    }
};
```

---

## 4. Résolution des problèmes courants

### 4.1 Erreurs npm dans Google Drive

**Symptômes** :
- `TAR_ENTRY_ERROR EBADF: bad file descriptor`
- `EPERM: operation not permitted`
- `ENOTEMPTY: directory not empty`

**Solution** :
```powershell
# Travailler dans un dossier local (C:\Projects\)
# Ne JAMAIS exécuter npm install dans Google Drive
```

### 4.2 Erreur rollup sur Windows ARM64

**Symptôme** :
```
Error: Cannot find module @rollup/rollup-win32-arm64-msvc
```

**Solution** :
```powershell
# Désinstaller Node.js ARM64
winget uninstall OpenJS.NodeJS.LTS

# Réinstaller en x64
winget install OpenJS.NodeJS.LTS --architecture x64

# Supprimer node_modules et package-lock.json
Remove-Item -Recurse -Force "node_modules"
Remove-Item -Force "package-lock.json"

# Réinstaller les dépendances
npm install
```

### 4.3 Le PDF ne se télécharge pas

**Causes possibles** :
1. Navigateur headless/automatisé (ne supporte pas les téléchargements)
2. Pop-up blocker
3. Paramètres de sécurité du navigateur

**Solution** :
- Utiliser la méthode `output('blob')` au lieu de `.save()`
- Créer manuellement le lien `<a>` avec l'attribut `download`
- Ajouter le lien au DOM avant de cliquer

### 4.4 PowerShell - npm non reconnu

**Symptôme** :
```
npm : Le terme «npm» n'est pas reconnu
```

**Solution** :
```powershell
# Rafraîchir le PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Utiliser npm.cmd au lieu de npm (contourne la restriction d'exécution de scripts)
npm.cmd install
npm.cmd run dev
```

---

## 5. Bonnes pratiques

### 5.1 Gestion des fichiers

- ✅ Toujours travailler dans un dossier local pour le développement
- ✅ Synchroniser le code source vers Google Drive après les modifications
- ✅ Exclure `node_modules` de la synchronisation (via `.gitignore`)

### 5.2 Sécurité

- ✅ Ne jamais committer les fichiers `.env.local` contenant des clés API
- ✅ Utiliser des variables d'environnement pour les données sensibles
- ✅ Valider les entrées utilisateur avant l'export PDF

### 5.3 Performance

- ✅ Utiliser `scale: 2` pour un bon compromis qualité/taille
- ✅ Désactiver `logging: true` en production
- ✅ Nettoyer les URL blob avec `URL.revokeObjectURL()`

### 5.4 UX

- ✅ Afficher un état de chargement pendant l'export
- ✅ Désactiver le bouton pendant l'export pour éviter les doubles clics
- ✅ Afficher un message d'erreur explicite en cas d'échec

---

## Annexes

### A. Commandes PowerShell utiles

```powershell
# Vérifier l'architecture Windows
[System.Environment]::GetEnvironmentVariable("PROCESSOR_ARCHITECTURE")

# Lister les fichiers PDF récents dans Downloads
Get-ChildItem "$env:USERPROFILE\Downloads" -Filter "*.pdf" | 
    Sort-Object LastWriteTime -Descending | 
    Select-Object Name, LastWriteTime, Length -First 10

# Ouvrir une URL dans le navigateur par défaut
Start-Process "http://localhost:3000"

# Copier un projet en excluant node_modules
Copy-Item -Path "source\*" -Destination "destination" -Recurse -Exclude "node_modules","package-lock.json"
```

### B. Dépendances npm recommandées

```json
{
  "dependencies": {
    "react": "^19.x",
    "react-dom": "^19.x",
    "html2pdf.js": "^0.10.x"
  },
  "devDependencies": {
    "@types/node": "^22.x",
    "@vitejs/plugin-react": "^5.x",
    "typescript": "~5.8.x",
    "vite": "^6.x"
  }
}
```

---

**Fin de la Partie A**

---

# PARTIE B - CONFORMITÉ RÉGLEMENTAIRE EUROPÉENNE

---

## 6. RGPD - Règlement Général sur la Protection des Données

> **Règlement (UE) 2016/679** - Applicable depuis le 25 mai 2018

### 6.1 Principes fondamentaux à respecter

| Principe | Description | Implémentation technique |
|----------|-------------|-------------------------|
| **Licéité** | Base légale pour chaque traitement | Documenter la base légale (consentement, contrat, intérêt légitime) |
| **Limitation des finalités** | Collecter uniquement pour des finalités déterminées | Définir clairement les finalités dans la politique de confidentialité |
| **Minimisation** | Collecter uniquement les données nécessaires | Auditer chaque champ de formulaire |
| **Exactitude** | Maintenir les données à jour | Permettre la modification par l'utilisateur |
| **Limitation de conservation** | Ne pas conserver au-delà du nécessaire | Implémenter une politique de purge automatique |
| **Intégrité et confidentialité** | Sécuriser les données | Chiffrement, contrôle d'accès |

### 6.2 Droits des personnes concernées - Implémentation obligatoire

```typescript
// Interface pour les droits RGPD
interface RGPDUserRights {
    // Droit d'accès (Art. 15) - Délai: 1 mois
    exportUserData(): Promise<UserDataExport>;
    
    // Droit de rectification (Art. 16)
    updateUserData(data: Partial<UserData>): Promise<void>;
    
    // Droit à l'effacement / "Droit à l'oubli" (Art. 17)
    deleteUserAccount(): Promise<void>;
    
    // Droit à la portabilité (Art. 20) - Format: JSON ou CSV
    downloadDataPortable(): Promise<Blob>;
    
    // Droit d'opposition (Art. 21)
    optOutFromProcessing(processingType: string): Promise<void>;
    
    // Droit de retirer le consentement (Art. 7)
    withdrawConsent(consentType: string): Promise<void>;
}
```

### 6.3 Consentement - Exigences techniques

```tsx
// Composant de bannière de consentement conforme RGPD
const CookieConsentBanner: React.FC = () => {
    const [consent, setConsent] = useState<ConsentState>({
        necessary: true,      // Toujours actif, non désactivable
        analytics: false,     // Opt-in par défaut
        marketing: false,     // Opt-in par défaut
        preferences: false    // Opt-in par défaut
    });

    return (
        <div role="dialog" aria-labelledby="consent-title">
            <h2 id="consent-title">Gestion des cookies</h2>
            <p>Nous utilisons des cookies pour améliorer votre expérience.</p>
            
            {/* Boutons équivalents - pas de dark patterns */}
            <button onClick={() => acceptAll()}>Tout accepter</button>
            <button onClick={() => rejectAll()}>Tout refuser</button>
            <button onClick={() => showDetails()}>Personnaliser</button>
            
            {/* Lien vers politique de confidentialité */}
            <a href="/politique-confidentialite">En savoir plus</a>
        </div>
    );
};
```

### 6.4 Registre des traitements (Article 30)

Chaque application doit maintenir un registre des traitements :

```json
{
    "registre_traitements": [
        {
            "nom_traitement": "Gestion des comptes utilisateurs",
            "responsable": "Nom de l'entreprise",
            "dpo_contact": "dpo@entreprise.com",
            "finalites": ["Authentification", "Personnalisation"],
            "categories_personnes": ["Clients", "Prospects"],
            "categories_donnees": ["Identité", "Coordonnées", "Connexion"],
            "destinataires": ["Service client", "Hébergeur"],
            "transferts_hors_ue": false,
            "duree_conservation": "3 ans après dernière activité",
            "mesures_securite": ["Chiffrement AES-256", "Hachage bcrypt"]
        }
    ]
}
```

### 6.5 Notification de violation de données

```typescript
// Processus de notification en cas de violation (Article 33-34)
interface DataBreachNotification {
    // Notification CNIL: max 72 heures
    notifyAuthority: {
        deadline: "72 heures",
        authority: "CNIL (France)",
        content: [
            "Nature de la violation",
            "Catégories et nombre de personnes concernées",
            "Coordonnées du DPO",
            "Conséquences probables",
            "Mesures prises"
        ]
    };
    
    // Notification aux personnes: "dans les meilleurs délais"
    notifyUsers: {
        condition: "Risque élevé pour les droits et libertés",
        content: "Description claire et en langage simple"
    };
}
```

---

## 7. Data Act - Règlement sur les Données

> **Règlement (UE) 2023/2854** - Applicable à partir du 12 septembre 2025

### 7.1 Obligations pour les produits connectés (IoT)

Le Data Act s'applique aux **systèmes industriels connectés** et impose :

| Obligation | Description | Implémentation |
|-----------|-------------|----------------|
| **Accès aux données** | L'utilisateur doit pouvoir accéder aux données générées | API d'export, tableaux de bord |
| **Portabilité** | Transfert vers un autre fournisseur | Format standard (JSON, CSV) |
| **Interopérabilité** | Compatibilité entre services | APIs standardisées, formats ouverts |
| **Équité contractuelle** | Clauses non-abusives | Audit juridique des CGU |

### 7.2 Données générées par les produits

```typescript
// Structure de données pour produits industriels
interface IndustrialProductData {
    // Métadonnées obligatoires
    productId: string;
    manufacturer: string;
    dataGenerationTimestamp: Date;
    
    // Catégorisation des données
    dataCategories: {
        operational: OperationalData[];      // Données de fonctionnement
        usage: UsageData[];                  // Données d'utilisation
        performance: PerformanceData[];      // Données de performance
        maintenance: MaintenanceData[];      // Données de maintenance prédictive
    };
    
    // Droits d'accès
    accessRights: {
        user: "full";                        // Accès complet obligatoire
        manufacturer: "limited";             // Accès limité aux données techniques
        thirdParty: "with_consent";          // Uniquement avec consentement
    };
}
```

### 7.3 APIs ouvertes obligatoires

```typescript
// API d'accès aux données conforme Data Act
interface DataActCompliantAPI {
    // Accès aux données en temps réel
    GET: "/api/v1/data/realtime";
    
    // Export des données historiques
    GET: "/api/v1/data/export?format=json|csv&period=YYYY-MM";
    
    // Transfert vers tiers autorisé
    POST: "/api/v1/data/transfer";
    body: {
        recipientId: string;
        dataScope: string[];
        consentProof: string;
    };
    
    // Métadonnées sur les données disponibles
    GET: "/api/v1/data/catalog";
}
```

### 7.4 Protection des secrets d'affaires

Le Data Act permet de protéger les secrets d'affaires tout en garantissant l'accès :

```typescript
// Filtrage des données sensibles
function filterTradeSecrets(data: ProductData): FilteredData {
    return {
        ...data,
        // Exposer les résultats, pas les algorithmes
        predictiveMaintenance: {
            nextMaintenanceDate: data.predictiveMaintenance.result,
            // Algorithme interne NON exposé
            // algorithm: data.predictiveMaintenance.algorithm ❌
        }
    };
}
```

---

## 8. AI Act - Règlement sur l'Intelligence Artificielle

> **Règlement (UE) 2024/1689** - Entrée en vigueur progressive 2024-2027

### 8.1 Classification des systèmes d'IA

```
┌─────────────────────────────────────────────────────────────────┐
│                    PYRAMIDE DES RISQUES AI ACT                   │
├─────────────────────────────────────────────────────────────────┤
│  🚫 RISQUE INACCEPTABLE (INTERDIT)                              │
│     - Notation sociale par l'État                                │
│     - Manipulation subliminale                                   │
│     - Exploitation des vulnérabilités                            │
├─────────────────────────────────────────────────────────────────┤
│  ⚠️  HAUT RISQUE (OBLIGATIONS STRICTES)                         │
│     - Sécurité des produits industriels                          │
│     - Infrastructures critiques                                  │
│     - Recrutement, éducation, crédit                            │
├─────────────────────────────────────────────────────────────────┤
│  ⚡ RISQUE LIMITÉ (TRANSPARENCE)                                │
│     - Chatbots (indiquer que c'est une IA)                      │
│     - Génération de contenu (watermarking)                      │
│     - Deepfakes (étiquetage obligatoire)                        │
├─────────────────────────────────────────────────────────────────┤
│  ✅ RISQUE MINIMAL (PAS D'OBLIGATIONS)                          │
│     - Filtres anti-spam                                          │
│     - Jeux vidéo                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Systèmes industriels à haut risque

Pour les applications industrielles utilisant l'IA :

| Catégorie | Exemples | Classification |
|-----------|----------|----------------|
| Sécurité des machines | IA de maintenance prédictive, détection de défauts | **Haut risque** |
| Contrôle qualité | Vision par ordinateur pour inspection | **Haut risque** |
| Optimisation de production | Planification automatisée | Risque limité |
| Chatbots d'assistance | Support technique IA | Risque limité |

### 8.3 Obligations pour les systèmes à haut risque

```typescript
// Documentation technique obligatoire (Annexe IV)
interface HighRiskAIDocumentation {
    // 1. Description générale
    systemDescription: {
        purpose: string;
        intendedUse: string;
        limitations: string[];
        prohibitedUses: string[];
    };
    
    // 2. Gestion des risques (Article 9)
    riskManagement: {
        identifiedRisks: Risk[];
        mitigationMeasures: Measure[];
        residualRisks: Risk[];
        testingResults: TestResult[];
    };
    
    // 3. Données d'entraînement (Article 10)
    trainingData: {
        sources: DataSource[];
        dataGovernance: GovernancePolicy;
        biasAnalysis: BiasReport;
        representativeness: string;
    };
    
    // 4. Surveillance humaine (Article 14)
    humanOversight: {
        interventionMechanisms: string[];
        overrideCapabilities: string[];
        trainingRequirements: string[];
    };
    
    // 5. Précision et robustesse (Article 15)
    technicalSpecifications: {
        accuracy: number;           // Ex: 99.5%
        precision: number;
        recall: number;
        robustnessTests: string[];
        cybersecurityMeasures: string[];
    };
    
    // 6. Journalisation (Article 12)
    logging: {
        retentionPeriod: "minimum 6 mois";
        eventsLogged: string[];
        accessControl: string;
    };
}
```

### 8.4 Transparence pour les chatbots et IA génératives

```tsx
// Obligation de transparence pour les systèmes d'IA
const AIAssistant: React.FC = () => {
    return (
        <div>
            {/* Notification obligatoire (Article 52) */}
            <div className="ai-disclosure" role="alert">
                <span aria-label="Information importante">ℹ️</span>
                <p>
                    Vous interagissez avec un <strong>assistant virtuel 
                    alimenté par l'intelligence artificielle</strong>. 
                    Les réponses sont générées automatiquement et peuvent 
                    contenir des erreurs.
                </p>
            </div>
            
            {/* Interface du chatbot */}
            <ChatInterface />
        </div>
    );
};
```

### 8.5 AI Bill of Materials (AIBOM)

```json
{
    "aibom": {
        "system_name": "Aegis Predictive Maintenance",
        "version": "2.1.0",
        "provider": "Société XYZ",
        "classification": "high-risk",
        "model": {
            "type": "Machine Learning - Random Forest",
            "framework": "scikit-learn 1.3.0",
            "training_date": "2025-06-15",
            "training_data_size": "1.2M samples",
            "accuracy": 0.97,
            "last_validation": "2025-12-01"
        },
        "dependencies": [
            {"name": "TensorFlow", "version": "2.15.0", "license": "Apache-2.0"},
            {"name": "NumPy", "version": "1.26.0", "license": "BSD-3"}
        ],
        "known_limitations": [
            "Performance dégradée pour les équipements < 1 an",
            "Nécessite recalibration trimestrielle"
        ],
        "conformity_assessment": {
            "status": "completed",
            "notified_body": "TÜV SÜD",
            "certificate_number": "AI-2025-12345"
        }
    }
}
```

---

# PARTIE C - EXIGENCES NON-FONCTIONNELLES

---

## 9. Sécurité des Applications

### 9.1 OWASP Top 10 - Vulnérabilités à prévenir

| Rang | Vulnérabilité | Prévention |
|------|---------------|------------|
| A01 | Broken Access Control | Implémenter RBAC, vérifier chaque endpoint |
| A02 | Cryptographic Failures | TLS 1.3, AES-256, clés sécurisées |
| A03 | Injection | Requêtes paramétrées, validation entrées |
| A04 | Insecure Design | Threat modeling, Security by Design |
| A05 | Security Misconfiguration | Hardening, audits réguliers |
| A06 | Vulnerable Components | Scan des dépendances, mises à jour |
| A07 | Authentication Failures | MFA, gestion sessions sécurisée |
| A08 | Software Integrity Failures | Signature du code, CI/CD sécurisé |
| A09 | Logging Failures | Journalisation centralisée, alertes |
| A10 | SSRF | Validation URLs, whitelist |

### 9.2 Headers de sécurité HTTP obligatoires

```typescript
// Configuration des headers de sécurité (vite.config.ts ou serveur)
const securityHeaders = {
    // Protection XSS
    "Content-Security-Policy": 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self' https://api.example.com;",
    
    // Protection clickjacking
    "X-Frame-Options": "DENY",
    
    // Protection MIME sniffing
    "X-Content-Type-Options": "nosniff",
    
    // Force HTTPS
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    
    // Contrôle des référents
    "Referrer-Policy": "strict-origin-when-cross-origin",
    
    // Désactiver les API dangereuses
    "Permissions-Policy": 
        "geolocation=(), microphone=(), camera=(), payment=()"
};
```

### 9.3 Gestion sécurisée des secrets

```typescript
// ❌ INTERDIT - Secrets dans le code
const API_KEY = "sk-1234567890abcdef"; // JAMAIS !

// ✅ CORRECT - Variables d'environnement
const API_KEY = process.env.API_KEY;

// ✅ CORRECT - Validation au démarrage
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is required");
}

// Structure recommandée pour .env.local (JAMAIS commité)
/*
# .env.local - NE PAS COMMITTER
API_KEY=sk-xxxx
DATABASE_URL=postgresql://...
JWT_SECRET=random-32-char-string
*/
```

### 9.4 Audit des dépendances

```powershell
# Vérifier les vulnérabilités des dépendances
npm audit

# Corriger automatiquement les vulnérabilités
npm audit fix

# Rapport détaillé
npm audit --json > audit-report.json
```

---

## 10. Accessibilité (WCAG/RGAA)

### 10.1 Obligations légales en France

| Contexte | Obligation | Standard |
|----------|------------|----------|
| Services publics | Obligatoire | RGAA 4.1 (basé sur WCAG 2.1 AA) |
| Entreprises > 250M€ CA | Obligatoire | RGAA 4.1 |
| E-commerce | Obligatoire 2025 | European Accessibility Act |
| Autres | Recommandé | WCAG 2.1 AA minimum |

### 10.2 Implémentation technique

```tsx
// Composant accessible - Bonnes pratiques
const AccessibleButton: React.FC<{
    onClick: () => void;
    isLoading: boolean;
    children: React.ReactNode;
}> = ({ onClick, isLoading, children }) => {
    return (
        <button
            onClick={onClick}
            disabled={isLoading}
            aria-busy={isLoading}
            aria-describedby="button-help"
        >
            {isLoading ? (
                <>
                    <span className="sr-only">Chargement en cours</span>
                    <LoadingSpinner aria-hidden="true" />
                </>
            ) : (
                children
            )}
        </button>
    );
};

// Classe utilitaire pour texte invisible mais accessible
// .sr-only { position: absolute; width: 1px; height: 1px; 
//            padding: 0; margin: -1px; overflow: hidden; 
//            clip: rect(0,0,0,0); border: 0; }
```

### 10.3 Checklist WCAG rapide

```markdown
## Checklist Accessibilité Minimale

### Perceptible
- [ ] Images avec attribut `alt` descriptif
- [ ] Contraste texte/fond ≥ 4.5:1 (texte normal)
- [ ] Contraste texte/fond ≥ 3:1 (grand texte > 18px)
- [ ] Ne pas transmettre d'info uniquement par la couleur
- [ ] Sous-titres pour les vidéos

### Utilisable
- [ ] Tout accessible au clavier (Tab, Entrée, Espace)
- [ ] Focus visible sur tous les éléments interactifs
- [ ] Pas de piège clavier
- [ ] Skip links pour navigation rapide

### Compréhensible
- [ ] Langue de la page déclarée (`<html lang="fr">`)
- [ ] Labels explicites sur les formulaires
- [ ] Messages d'erreur clairs et associés aux champs
- [ ] Navigation cohérente entre les pages

### Robuste
- [ ] HTML valide et sémantique
- [ ] Attributs ARIA utilisés correctement
- [ ] Compatible avec les lecteurs d'écran (NVDA, VoiceOver)
```

---

## 11. Performance et Robustesse

### 11.1 Core Web Vitals - Seuils à respecter

| Métrique | Description | Bon | À améliorer | Mauvais |
|----------|-------------|-----|-------------|---------|
| **LCP** | Largest Contentful Paint | ≤ 2.5s | ≤ 4s | > 4s |
| **INP** | Interaction to Next Paint | ≤ 200ms | ≤ 500ms | > 500ms |
| **CLS** | Cumulative Layout Shift | ≤ 0.1 | ≤ 0.25 | > 0.25 |

### 11.2 Optimisation du bundle

```typescript
// vite.config.ts - Optimisation production
export default defineConfig({
    build: {
        // Diviser le code par route
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    utils: ['lodash', 'date-fns']
                }
            }
        },
        // Compression gzip
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,  // Supprimer console.log en prod
                drop_debugger: true
            }
        }
    }
});
```

### 11.3 Gestion des erreurs robuste

```tsx
// Error Boundary pour capturer les erreurs React
class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error?: Error }
> {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Envoyer à un service de monitoring (Sentry, etc.)
        console.error('Application error:', error, errorInfo);
        // reportErrorToService(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div role="alert">
                    <h1>Une erreur est survenue</h1>
                    <p>Nous avons été notifiés et travaillons à la résoudre.</p>
                    <button onClick={() => window.location.reload()}>
                        Rafraîchir la page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
```

### 11.4 Service Worker pour mode hors-ligne

```typescript
// Enregistrement du Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered:', registration);
            })
            .catch(error => {
                console.error('SW registration failed:', error);
            });
    });
}
```

---

## 12. Tests et Qualité

### 12.1 Pyramide des tests

```
           ╱╲
          ╱  ╲           E2E Tests (Cypress, Playwright)
         ╱────╲          10% - Parcours utilisateur critiques
        ╱      ╲
       ╱────────╲        Integration Tests
      ╱          ╲       20% - Composants + API
     ╱────────────╲
    ╱              ╲     Unit Tests (Vitest, Jest)
   ╱────────────────╲    70% - Fonctions, hooks, utils
  ╱                  ╲
```

### 12.2 Configuration Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            thresholds: {
                global: {
                    branches: 80,
                    functions: 80,
                    lines: 80,
                    statements: 80
                }
            }
        }
    }
});
```

### 12.3 Exemple de test unitaire

```typescript
// __tests__/exportPDF.test.ts
import { describe, it, expect, vi } from 'vitest';
import { handleExportPDF } from '../utils/exportPDF';

describe('Export PDF', () => {
    it('should generate a valid filename with current date', () => {
        const filename = generateFilename('document');
        expect(filename).toMatch(/^document-\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    it('should handle null element gracefully', async () => {
        const result = await handleExportPDF(null);
        expect(result).toEqual({ success: false, error: 'Element is null' });
    });
});
```

### 12.4 Test de conformité RGPD automatisé

```typescript
// __tests__/rgpd.test.ts
describe('RGPD Compliance', () => {
    it('should have a cookie consent banner', () => {
        render(<App />);
        expect(screen.getByRole('dialog', { name: /cookies/i })).toBeVisible();
    });

    it('should allow rejecting all cookies', async () => {
        render(<App />);
        await userEvent.click(screen.getByText(/tout refuser/i));
        expect(getAnalyticsCookies()).toHaveLength(0);
    });

    it('should export user data in portable format', async () => {
        const data = await exportUserData(userId);
        expect(data).toHaveProperty('personal');
        expect(data).toHaveProperty('activity');
        expect(data).toHaveProperty('exportedAt');
    });
});
```

---

## 13. Déploiement en Europe

### 13.1 Hébergement des données

| Critère | Exigence | Solutions conformes |
|---------|----------|---------------------|
| **Localisation** | Données UE dans l'UE | OVHcloud, Scaleway, Hetzner, Azure EU |
| **Certification** | ISO 27001, SOC 2 | Vérifier certifications hébergeur |
| **SecNumCloud** | Pour données sensibles France | OVHcloud SecNumCloud, Outscale |
| **Transferts hors UE** | Clauses contractuelles types | Éviter si possible |

### 13.2 Configuration HTTPS obligatoire

```powershell
# Certificat Let's Encrypt gratuit avec certbot
certbot certonly --standalone -d monapp.example.com

# Renouvellement automatique
certbot renew --dry-run
```

### 13.3 Structure de déploiement recommandée

```
┌─────────────────────────────────────────────────────────────────┐
│                          CDN (CloudFlare EU)                     │
│                     Cache statique, DDoS protection              │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Load Balancer (nginx)                       │
│                     SSL termination, routing                     │
└─────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
               ┌────────┐   ┌────────┐   ┌────────┐
               │ App 1  │   │ App 2  │   │ App 3  │
               │(Docker)│   │(Docker)│   │(Docker)│
               └────────┘   └────────┘   └────────┘
                    │             │             │
                    └─────────────┼─────────────┘
                                  ▼
                         ┌───────────────┐
                         │   Database    │
                         │ (PostgreSQL)  │
                         │   EU Region   │
                         └───────────────┘
```

### 13.4 Checklist pré-production

```markdown
## Checklist Déploiement Production

### Infrastructure
- [ ] Hébergement dans l'UE (certificat de localisation)
- [ ] HTTPS activé (certificat valide)
- [ ] Backups automatisés et testés
- [ ] Monitoring en place (uptime, erreurs, performance)
- [ ] Plan de reprise d'activité (PRA) documenté

### Sécurité
- [ ] Audit de sécurité réalisé
- [ ] Headers de sécurité configurés
- [ ] Scan des vulnérabilités npm audit clean
- [ ] Secrets en variables d'environnement (jamais dans le code)
- [ ] WAF activé (Web Application Firewall)

### Conformité
- [ ] Politique de confidentialité à jour
- [ ] CGU/CGV validées juridiquement
- [ ] Mentions légales présentes
- [ ] Bannière cookies conforme RGPD
- [ ] DPO désigné (si applicable)

### Performance
- [ ] Core Web Vitals validés
- [ ] Tests de charge réalisés
- [ ] CDN configuré pour les assets statiques
- [ ] Compression gzip/brotli activée
```

---

# ANNEXES

---

## A. Commandes PowerShell utiles

```powershell
# Vérifier l'architecture Windows
[System.Environment]::GetEnvironmentVariable("PROCESSOR_ARCHITECTURE")

# Lister les fichiers PDF récents dans Downloads
Get-ChildItem "$env:USERPROFILE\Downloads" -Filter "*.pdf" | 
    Sort-Object LastWriteTime -Descending | 
    Select-Object Name, LastWriteTime, Length -First 10

# Ouvrir une URL dans le navigateur par défaut
Start-Process "http://localhost:3000"

# Copier un projet en excluant node_modules
Copy-Item -Path "source\*" -Destination "destination" -Recurse -Exclude "node_modules","package-lock.json"

# Vérifier les vulnérabilités npm
npm audit --json | ConvertFrom-Json | Select-Object -ExpandProperty vulnerabilities
```

---

## B. Dépendances npm recommandées

```json
{
    "dependencies": {
        "react": "^19.x",
        "react-dom": "^19.x",
        "html2pdf.js": "^0.10.x"
    },
    "devDependencies": {
        "@types/node": "^22.x",
        "@vitejs/plugin-react": "^5.x",
        "typescript": "~5.8.x",
        "vite": "^6.x",
        "vitest": "^2.x",
        "@testing-library/react": "^16.x"
    },
    "optionalDependencies": {
        "@sentry/react": "^8.x"
    }
}
```

---

## C. Checklist de conformité avant déploiement

### RGPD
- [ ] Politique de confidentialité rédigée et accessible
- [ ] Bannière de consentement cookies conforme
- [ ] Formulaire de contact DPO fonctionnel
- [ ] Export des données utilisateur implémenté
- [ ] Suppression de compte implémentée
- [ ] Registre des traitements à jour

### Data Act (si produit connecté)
- [ ] API d'accès aux données opérationnelle
- [ ] Format d'export standardisé (JSON/CSV)
- [ ] Documentation des données disponibles
- [ ] Mécanisme de transfert vers tiers

### AI Act (si utilisation de l'IA)
- [ ] Classification du système effectuée
- [ ] Documentation technique complète (si haut risque)
- [ ] Notification IA visible aux utilisateurs
- [ ] AIBOM à jour
- [ ] Tests de biais réalisés (si haut risque)

### Sécurité
- [ ] npm audit sans vulnérabilités critiques
- [ ] Headers de sécurité configurés
- [ ] HTTPS activé
- [ ] Authentification sécurisée
- [ ] Logs et monitoring en place

### Accessibilité
- [ ] Score Lighthouse Accessibility ≥ 90
- [ ] Navigation clavier testée
- [ ] Contrastes vérifiés
- [ ] Test avec lecteur d'écran

---

## D. Glossaire pour non-développeurs

| Terme | Définition |
|-------|------------|
| **API** | Interface permettant à deux logiciels de communiquer |
| **Backend** | Partie serveur d'une application (invisible pour l'utilisateur) |
| **Blob** | Fichier binaire stocké temporairement en mémoire |
| **CDN** | Réseau de serveurs distribuant le contenu plus rapidement |
| **CI/CD** | Automatisation des tests et du déploiement |
| **Composant** | Bloc de code réutilisable (bouton, formulaire, etc.) |
| **CORS** | Politique de sécurité limitant les requêtes entre sites |
| **DPO** | Délégué à la Protection des Données (obligatoire dans certains cas) |
| **Endpoint** | Adresse URL d'une API |
| **Frontend** | Partie visible de l'application (interface utilisateur) |
| **Hash/Hachage** | Transformation irréversible d'un mot de passe |
| **Headless** | Navigateur sans interface graphique (pour les tests) |
| **Hook** | Fonction React pour gérer l'état et les effets |
| **HTTPS** | Version sécurisée (chiffrée) du protocole HTTP |
| **npm** | Gestionnaire de paquets pour JavaScript |
| **OWASP** | Organisation définissant les bonnes pratiques de sécurité web |
| **Responsive** | Design qui s'adapte à toutes les tailles d'écran |
| **REST** | Style d'architecture pour les APIs |
| **SSL/TLS** | Protocoles de chiffrement pour HTTPS |
| **Token** | Jeton d'authentification temporaire |
| **TypeScript** | JavaScript avec typage statique (détecte plus d'erreurs) |
| **UI/UX** | Interface utilisateur / Expérience utilisateur |
| **Webhook** | Notification automatique envoyée par un service |

---

## E. Ressources et références officielles

### Réglementations

| Document | Lien |
|----------|------|
| RGPD (texte officiel) | [eur-lex.europa.eu/RGPD](https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32016R0679) |
| Data Act | [eur-lex.europa.eu/DataAct](https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32023R2854) |
| AI Act | [eur-lex.europa.eu/AIAct](https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32024R1689) |
| CNIL - Guides pratiques | [cnil.fr](https://www.cnil.fr/) |

### Standards techniques

| Standard | Lien |
|----------|------|
| OWASP Top 10 | [owasp.org/Top10](https://owasp.org/www-project-top-ten/) |
| WCAG 2.1 | [w3.org/WAI/WCAG21](https://www.w3.org/WAI/WCAG21/quickref/) |
| RGAA 4.1 | [accessibilite.numerique.gouv.fr](https://accessibilite.numerique.gouv.fr/) |
| Core Web Vitals | [web.dev/vitals](https://web.dev/vitals/) |

### Outils de conformité

| Outil | Usage |
|-------|-------|
| [Lighthouse](https://developers.google.com/web/tools/lighthouse) | Audit automatisé (Performance, Accessibilité, SEO) |
| [WAVE](https://wave.webaim.org/) | Évaluation accessibilité |
| [Tanaguru](https://www.tanaguru.com/) | Audit RGAA français |
| [CookieYes](https://www.cookieyes.com/) | Gestion consentement cookies |
| [Snyk](https://snyk.io/) | Scan vulnérabilités dépendances |

---

**Fin du journal de bord**

*Document de référence pour le développement d'applications web conformes aux réglementations européennes.*

*Dernière mise à jour : 14 janvier 2026*
