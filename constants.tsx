
import React from 'react';
import { RegulationModule, ComplianceStatus } from './types';
import { ShieldCheckIcon } from './components/icons/ShieldCheckIcon';
import { CpuChipIcon } from './components/icons/CpuChipIcon';
import { LockClosedIcon } from './components/icons/LockClosedIcon';
import { DocumentTextIcon } from './components/icons/DocumentTextIcon';
import { GlobeAltIcon } from './components/icons/GlobeAltIcon';
import { PuzzlePieceIcon } from './components/icons/PuzzlePieceIcon';
import { Language } from './translations';

export const getModules = (lang: Language): RegulationModule[] => {
  const isFr = lang === 'fr';

  return [
  {
    id: '4',
    title: isFr ? 'Passeport Numérique (DPP)' : 'Digital Product Passport (DPP)',
    shortTitle: isFr ? 'Mon Passeport Produit' : 'My Product Passport',
    icon: DocumentTextIcon,
    description: isFr 
      ? 'Visualisez et gérez le Passeport Numérique de Produit (DPP) pour votre actif principal, incluant la traçabilité et les données circulaires.'
      : 'Visualize and manage the Digital Product Passport (DPP) for your main asset, including traceability and circular data.',
    complianceItems: [],
  },
  {
    id: '1',
    title: isFr ? 'Sécurité Machines & Risques' : 'Machinery Safety & Risks',
    shortTitle: isFr ? 'Sécurité Machines' : 'Machinery Safety',
    icon: ShieldCheckIcon,
    description: isFr 
      ? 'Conformité au Règlement Machines (UE) 2023/1230 & ISO 13849. Gestion des analyses de risques et modifications substantielles.'
      : 'Compliance with Machinery Regulation (EU) 2023/1230 & ISO 13849. Management of risk analyses and substantial modifications.',
    complianceItems: [
      { 
        id: '1-1', 
        name: isFr ? 'Analyse de Risque EN ISO 12100' : 'Risk Analysis EN ISO 12100', 
        status: ComplianceStatus.Compliant, 
        details: isFr ? 'Validé pour le prototype V5.' : 'Validated for V5 prototype.', 
        lastChecked: '2023-10-15' 
      },
      { 
        id: '1-2', 
        name: isFr ? 'Analyse Modification Substantielle' : 'Substantial Modification Analysis', 
        status: ComplianceStatus.AtRisk, 
        details: isFr ? 'Mise à jour logicielle v2.3 en attente de revue.' : 'Software update v2.3 pending review.', 
        lastChecked: '2023-10-20' 
      },
      { 
        id: '1-3', 
        name: isFr ? 'Traçabilité Composants Sécurité' : 'Safety Components Traceability', 
        status: ComplianceStatus.Compliant, 
        details: isFr ? 'Base de données composants à jour.' : 'Component database up to date.', 
        lastChecked: '2023-10-22' 
      },
    ],
  },
  {
    id: '2',
    title: isFr ? 'Gouvernance IA (AI Act)' : 'AI Governance (AI Act)',
    shortTitle: isFr ? 'Gouvernance IA' : 'AI Governance',
    icon: CpuChipIcon,
    description: isFr
      ? "Conformité au Règlement IA de l'UE. Classification des systèmes, gestion des risques et documentation technique."
      : "Compliance with the EU AI Act. System classification, risk management, and technical documentation.",
    complianceItems: [
      { 
        id: '2-1', 
        name: isFr ? 'Classification Système IA' : 'AI System Classification', 
        status: ComplianceStatus.Compliant, 
        details: isFr ? 'Module prédictif classé Haut-Risque.' : 'Predictive module classified High-Risk.', 
        lastChecked: '2023-09-01' 
      },
      { 
        id: '2-2', 
        name: isFr ? 'Conformité IA Haut-Risque' : 'High-Risk AI Compliance', 
        status: ComplianceStatus.Compliant, 
        details: isFr ? 'Framework de gestion des risques activé.' : 'Risk management framework activated.', 
        lastChecked: '2023-09-30' 
      },
      { 
        id: '2-3', 
        name: isFr ? 'Documentation Technique IA' : 'AI Technical Documentation', 
        status: ComplianceStatus.NonCompliant, 
        details: isFr ? 'La fiche de transparence est incomplète.' : 'Transparency sheet is incomplete.', 
        lastChecked: '2023-08-12' 
      },
    ],
  },
  {
    id: '3',
    title: isFr ? 'Cybersécurité & Données (CRA)' : 'Cybersecurity & Data (CRA)',
    shortTitle: isFr ? 'Cyber Résilience' : 'Cyber Resilience',
    icon: LockClosedIcon,
    description: isFr
      ? 'Conformité RGPD, Data Act et Cyber Resilience Act (CRA). Gestion des vulnérabilités (SBOM).'
      : 'Compliance with GDPR, Data Act, and Cyber Resilience Act (CRA). Vulnerability management (SBOM).',
    complianceItems: [
      { 
        id: '3-1', 
        name: isFr ? 'Gestion Vulnérabilités CRA' : 'CRA Vulnerability Management', 
        status: ComplianceStatus.Compliant, 
        details: isFr ? 'Aucune CVE critique ouverte.' : 'No critical CVEs open.', 
        lastChecked: '2023-10-25' 
      },
      { 
        id: '3-2', 
        name: isFr ? 'Registre Traitement RGPD' : 'GDPR Processing Registry', 
        status: ComplianceStatus.AtRisk, 
        details: isFr ? 'Données opérateurs : revue nécessaire.' : 'Operator data: review necessary.', 
        lastChecked: '2023-10-05' 
      },
    ],
  },
  {
    id: '6',
    title: isFr ? 'Expertise Technique & Qualité Mécatronique' : 'Technical Expertise & Mechatronic Quality',
    shortTitle: isFr ? 'Qualité & Robustesse' : 'Quality & Robustness',
    icon: PuzzlePieceIcon,
    description: isFr
      ? "Évaluation de la performance, robustesse et qualité de conception intégrée (Mécatronique & Logiciel) versus standards (ISO/IEC 25010, IEEE 1012, IEC 61508)."
      : "Evaluation of performance, robustness, and integrated design quality (Mechatronics & Software) versus standards (ISO/IEC 25010, IEEE 1012, IEC 61508).",
    complianceItems: [
      { 
        id: '6-1', 
        name: isFr ? 'Qualité Logicielle (ISO/IEC 25010)' : 'Software Quality (ISO/IEC 25010)', 
        status: ComplianceStatus.AtRisk, 
        details: isFr ? 'Dette technique identifiée sur le module de contrôle temps-réel.' : 'Technical debt identified on real-time control module.', 
        lastChecked: '2023-10-28' 
      },
      { 
        id: '6-2', 
        name: isFr ? 'Architecture Système (ISO/IEC/IEEE 42010)' : 'System Architecture (ISO/IEC/IEEE 42010)', 
        status: ComplianceStatus.Compliant, 
        details: isFr ? 'Interface mécatronique validée et documentée.' : 'Mechatronic interface validated and documented.', 
        lastChecked: '2023-10-10' 
      },
      { 
        id: '6-3', 
        name: isFr ? 'Validation V&V (IEEE 1012)' : 'V&V Validation (IEEE 1012)', 
        status: ComplianceStatus.Compliant, 
        details: isFr ? 'Tests de robustesse en charge validés.' : 'Load robustness tests validated.', 
        lastChecked: '2023-10-30' 
      },
    ],
  },
  {
    id: '5',
    title: isFr ? 'Durabilité & Écodesign (ESPR)' : 'Sustainability & Ecodesign (ESPR)',
    shortTitle: isFr ? 'Durabilité' : 'Sustainability',
    icon: GlobeAltIcon,
    description: isFr
      ? 'Exigences ESPR, Règlement Batteries et CRMA. Empreinte carbone et circularité des matériaux.'
      : 'ESPR requirements, Batteries Regulation, and CRMA. Carbon footprint and material circularity.',
    complianceItems: [
      { 
        id: '5-1', 
        name: isFr ? 'Traçabilité Matériaux Critiques' : 'Critical Materials Traceability', 
        status: ComplianceStatus.AtRisk, 
        details: isFr ? 'Collecte données fournisseurs à 85%.' : 'Supplier data collection at 85%.', 
        lastChecked: '2023-10-18' 
      },
      { 
        id: '5-2', 
        name: isFr ? 'Passeport Batterie' : 'Battery Passport', 
        status: ComplianceStatus.Compliant, 
        details: isFr ? 'Conforme aux normes 2024.' : 'Compliant with 2024 standards.', 
        lastChecked: '2023-10-24' 
      },
      { 
        id: '5-3', 
        name: isFr ? 'Analyse Cycle de Vie (ACV)' : 'Life Cycle Assessment (LCA)', 
        status: ComplianceStatus.Compliant, 
        details: isFr ? 'Audit annuel finalisé.' : 'Annual audit finalized.', 
        lastChecked: '2023-07-11' 
      },
    ],
  },
];
};
