
export type Language = 'fr' | 'en';

export const t = {
  fr: {
    jpc: {
      nav: {
        home: "Accueil",
        vision: "Vision Industrie 5.0",
        services: "Mes Services",
        aegis: "Plateforme Aegis",
        contact: "Contact"
      },
      hero: {
        title: "L'Humain au cœur de la Performance Industrielle",
        subtitle: "Jean-Pierre Charles. Expert en transformation Industrie 5.0, robustesse mécatronique et intelligence collective.",
        cta_talk: "Échanger ensemble",
        cta_app: "Accéder à Aegis"
      },
      vision: {
        title: "Vers une Industrie Bienveillante et Résiliente",
        text: "L'Industrie 5.0 n'est pas une simple évolution technologique. C'est la réconciliation entre la puissance de l'automatisation et la créativité unique de l'être humain. Ma mission est d'accompagner les PME et ETI européennes vers cette harmonie, en garantissant des systèmes robustes, durables et éthiques."
      },
      services: {
        title: "Services & Expertises",
        consulting: {
            title: "Stratégie & Transformation",
            desc: "Planification stratégique, transformation digitale et changement organisationnel. Formation du personnel opérationnel et adaptation neurocognitive."
        },
        expertise: {
            title: "Ingénierie & Écoconception",
            desc: "Expertise technique industrielle, décarbonation, circularité et conception de systèmes cyberphysiques robustes et durables."
        },
        aegis_card: {
            title: "IA, Risques & Compliance",
            desc: "Intégration d'IA, agents copilotes, maîtrise de la complexité des écosystèmes et gestion de la conformité réglementaire.",
            action: "Plateforme Aegis"
        }
      },
      contact: {
        title: "Parlons de votre futur",
        text: "Chaque projet commence par une écoute attentive. Je suis à votre disposition.",
        email: "contact@jeanpierrecharles.com"
      },
      footer: {
        legal: "Mentions Légales",
        rights: "© 2026 JeanPierreCharles. Tous droits réservés."
      },
      legalModal: {
        title: "Mentions Légales & Identité",
        companyName: "Identité : CHARLES Jean-Pierre",
        commercialName: "Nom commercial : JeanPierreCharles",
        status: "Forme Juridique : Entrepreneur individuel (Libéral non règlementé)",
        siren: "SIREN : 522 794 700",
        siret: "SIRET : 522 794 700 00032",
        ape: "Code APE : 7112B - Ingénierie, études techniques",
        address: "Siège social : 10 La Bertinière, 86800 Tercé, FRANCE",
        activity: "Activité : Ingénierie, expertise technique industrielle, planification stratégique, transformation digitale, décarbonation, écoconception produits, systèmes cyberphysiques, intégration IA, agents copilotes, gestion compliance et risques.",
        director: "Directeur de la publication : Jean-Pierre Charles"
      }
    },
    dashboard: {
      welcome: "Bienvenue sur Aegis Circular",
      subtitle: "Plateforme de gestion de la conformité industrielle et des passeports numériques produits (DPP) pour le marché européen.",
      globalIndex: "Indice Global",
      activeProduct: "Produit Actif",
      portfolio: "Portefeuille Produits",
      viewPassport: "Voir le Passeport",
      pillars: "Piliers de Conformité",
      critical: "Critique",
      attention: "Attention",
      compliant: "Conforme",
      production: "Production",
      lastUpdate: "Dernière maj",
      assetDesc: "Actif industriel soumis aux Règlements Machine, IA Act et ESPR.",
      circularity: "Circularité",
      recyclable: "Recyclable",
      carbon: "Carbone (Cradle-to-Gate)",
      compliance: "Conformité Réglementaire",
      validated: "Validée",
      actionRequired: "Action requise"
    },
    sidebar: {
      overview: "Vue d'Ensemble",
      complianceHeader: "Conformité & Passeports",
      admin: "Admin TPE",
      edition: "Edition Enterprise"
    },
    passport: {
      verified: "Passeport Vérifié",
      share: "Partager",
      export: "Exporter Certificat",
      tabs: {
        overview: "Vue d'ensemble & Conformité",
        audit: "Traçabilité & Blockchain"
      },
      status: "Statut Réglementaire UE",
      composition: "Composition & Matériaux (Circularité)",
      recycledSteel: "Acier Recyclé",
      virginAlu: "Aluminium (Vierge)",
      plastics: "Plastiques Techniques",
      dataTransparency: "Transparence des Données",
      smartQuestioning: "Configurez la visibilité des données pour les partenaires de la chaîne de valeur (Smart Questioning).",
      metrics: "Métriques Clés",
      totalWeight: "Poids Total",
      warranty: "Garantie",
      repairability: "Score Réparabilité",
      audit: {
        date: "Date & Heure",
        actor: "Acteur",
        action: "Action",
        proof: "Preuve Blockchain",
        validated: "Analyse Risques Validée",
        check: "Check Composants",
        alert: "Alerte : Modification"
      },
      toggles: {
        carbon: "Empreinte Carbone",
        origin: "Origine Fournisseurs",
        certs: "Certificats Sécurité",
        bom: "BOM Complète",
        public: "Public",
        private: "Privé"
      }
    },
    module: {
      controls: "Points de Contrôle & Certifications",
      verified: "Vérifié",
      none: "Aucun point de contrôle défini pour ce module.",
      moduleNotFound: "Module non trouvé"
    },
    assistant: {
      title: "Assistant Aegis",
      placeholder: "Posez votre question réglementaire...",
      emptyState: "Posez-moi une question sur le \nRèglement Machine ou l'IA Act.",
      systemPrompt: "Tu es Aegis, un assistant expert en conformité industrielle pour les TPE/PME européennes. Tu maîtrises le Règlement Machine (2023/1230), l'IA Act, le Cyber Resilience Act (CRA), le RGPD, et les Passeports Numériques de Produits (DPP/ESPR). Tes réponses doivent être en français, professionnelles, concises et orientées vers l'action pratique pour des industriels."
    },
    landing: {
      heroTitle: "Conformité Industrielle & Passeport Numérique",
      heroSubtitle: "La plateforme IA pour les PME/ETI européennes. Transformez la réglementation (IA Act, ESPR, Machine) en avantage compétitif.",
      cta: "Accéder à la Plateforme",
      features: {
        dpp: "Passeport Numérique (DPP)",
        dppDesc: "Traçabilité complète et transparence pour l'économie circulaire.",
        ai: "Conformité IA Act",
        aiDesc: "Classification et gestion des risques pour vos systèmes intelligents.",
        security: "Cyber Résilience",
        securityDesc: "Gestion des vulnérabilités (CRA) et protection des données."
      }
    }
  },
  en: {
    jpc: {
      nav: {
        home: "Home",
        vision: "Industry 5.0 Vision",
        services: "My Services",
        aegis: "Aegis Platform",
        contact: "Contact"
      },
      hero: {
        title: "Putting Humans at the Heart of Industrial Performance",
        subtitle: "Jean-Pierre Charles. Expert in Industry 5.0 transformation, mechatronic robustness, and collective intelligence.",
        cta_talk: "Let's Talk",
        cta_app: "Access Aegis"
      },
      vision: {
        title: "Towards a Benevolent and Resilient Industry",
        text: "Industry 5.0 is not just a technological evolution. It is the reconciliation between the power of automation and the unique creativity of human beings. My mission is to guide European SMEs and Mid-caps towards this harmony, ensuring robust, sustainable, and ethical systems."
      },
      services: {
        title: "Services & Expertise",
        consulting: {
            title: "Strategy & Transformation",
            desc: "Strategic planning, digital transformation, and organizational change. Operational personnel training and neurocognitive adaptation."
        },
        expertise: {
            title: "Engineering & Ecodesign",
            desc: "Industrial technical expertise, decarbonization, circularity, and design of robust and sustainable cyber-physical systems."
        },
        aegis_card: {
            title: "AI, Risk & Compliance",
            desc: "AI integration, copilot agents, ecosystem complexity mastery, and regulatory compliance management.",
            action: "Aegis Platform"
        }
      },
      contact: {
        title: "Let's discuss your future",
        text: "Every project starts with attentive listening. I am at your disposal.",
        email: "contact@jeanpierrecharles.com"
      },
      footer: {
        legal: "Legal Notice",
        rights: "© 2026 JeanPierreCharles. All rights reserved."
      },
      legalModal: {
        title: "Legal Notice & Identity",
        companyName: "Identity: CHARLES Jean-Pierre",
        commercialName: "Commercial Name: JeanPierreCharles",
        status: "Legal Form: Sole Proprietorship",
        siren: "SIREN: 522 794 700",
        siret: "SIRET: 522 794 700 00032",
        ape: "APE Code: 7112B - Engineering, technical studies",
        address: "Headquarters: 10 La Bertinière, 86800 Tercé, FRANCE",
        activity: "Activity: Engineering, industrial technical expertise, strategic planning, digital transformation, decarbonization, product ecodesign, cyber-physical systems, AI integration, copilot agents, compliance and risk management.",
        director: "Publication Director: Jean-Pierre Charles"
      }
    },
    dashboard: {
      welcome: "Welcome to Aegis Circular",
      subtitle: "Industrial compliance management platform and Digital Product Passports (DPP) for the European market.",
      globalIndex: "Global Index",
      activeProduct: "Active Product",
      portfolio: "Product Portfolio",
      viewPassport: "View Passport",
      pillars: "Compliance Pillars",
      critical: "Critical",
      attention: "Warning",
      compliant: "Compliant",
      production: "Production",
      lastUpdate: "Last update",
      assetDesc: "Industrial asset subject to Machinery Regulation, AI Act, and ESPR.",
      circularity: "Circularity",
      recyclable: "Recyclable",
      carbon: "Carbon (Cradle-to-Gate)",
      compliance: "Regulatory Compliance",
      validated: "Validated",
      actionRequired: "Action Required"
    },
    sidebar: {
      overview: "Overview",
      complianceHeader: "Compliance & Passports",
      admin: "SME Admin",
      edition: "Enterprise Edition"
    },
    passport: {
      verified: "Verified Passport",
      share: "Share",
      export: "Export Certificate",
      tabs: {
        overview: "Overview & Compliance",
        audit: "Traceability & Blockchain"
      },
      status: "EU Regulatory Status",
      composition: "Composition & Materials (Circularity)",
      recycledSteel: "Recycled Steel",
      virginAlu: "Aluminum (Virgin)",
      plastics: "Technical Plastics",
      dataTransparency: "Data Transparency",
      smartQuestioning: "Configure data visibility for value chain partners (Smart Questioning).",
      metrics: "Key Metrics",
      totalWeight: "Total Weight",
      warranty: "Warranty",
      repairability: "Repairability Score",
      audit: {
        date: "Date & Time",
        actor: "Actor",
        action: "Action",
        proof: "Blockchain Proof",
        validated: "Risk Analysis Validated",
        check: "Component Check",
        alert: "Alert: Modification"
      },
      toggles: {
        carbon: "Carbon Footprint",
        origin: "Supplier Origin",
        certs: "Security Certificates",
        bom: "Full BOM",
        public: "Public",
        private: "Private"
      }
    },
    module: {
      controls: "Control Points & Certifications",
      verified: "Verified",
      none: "No control points defined for this module.",
      moduleNotFound: "Module not found"
    },
    assistant: {
      title: "Aegis Assistant",
      placeholder: "Ask your regulatory question...",
      emptyState: "Ask me a question about the \nMachinery Regulation or AI Act.",
      systemPrompt: "You are Aegis, an expert industrial compliance assistant for European SMEs. You master the Machinery Regulation (2023/1230), AI Act, Cyber Resilience Act (CRA), GDPR, and Digital Product Passports (DPP/ESPR). Your answers must be in English, professional, concise, and oriented towards practical action for industrialists."
    },
    landing: {
      heroTitle: "Industrial Compliance & Digital Passport",
      heroSubtitle: "The AI platform for European SMEs/Mid-caps. Turn regulation (AI Act, ESPR, Machinery) into a competitive advantage.",
      cta: "Access Platform",
      features: {
        dpp: "Digital Passport (DPP)",
        dppDesc: "Full traceability and transparency for the circular economy.",
        ai: "AI Act Compliance",
        aiDesc: "Classification and risk management for your intelligent systems.",
        security: "Cyber Resilience",
        securityDesc: "Vulnerability management (CRA) and data protection."
      }
    }
  }
};
