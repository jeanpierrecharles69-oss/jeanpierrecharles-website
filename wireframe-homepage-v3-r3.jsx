import { useState } from "react";

const FONT_LINK = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=Playfair+Display:wght@400;600;700&display=swap";

const C = {
  navy: "#0f172a", navyLight: "#1e293b", navyMid: "#162032",
  slate: "#334155", slateLight: "#64748b", slateMuted: "#94a3b8",
  white: "#f8fafc", accent: "#3b82f6", accentGlow: "#60a5fa",
  gold: "#f59e0b", amber: "#d97706", emerald: "#10b981",
  emeraldDark: "#059669", rose: "#f43f5e", copper: "#c2956a", bg: "#080e1a",
};

/* ═══════════════════════════════════════════════════
   i18n — FR / EN
   ═══════════════════════════════════════════════════ */
const i18n = {
  fr: {
    // NAV
    navSub: "R&D M\u00c9CATRONIQUE \u00b7 COMPLIANCE IA \u00b7 INDUSTRIE EU",
    navItems: ["Expertise", "Services", "Tarifs", "Contact"],
    navCta: "Essai gratuit", navLogin: "Connexion",
    // HERO
    euBadge: "27 \u00c9tats membres UE + R\u00e9gions ultrap\u00e9riph\u00e9riques",
    heroH1a: "L\u2019ing\u00e9nieur R&D", heroH1b: "qui a con\u00e7u vos syst\u00e8mes,",
    heroH1c: "pilote votre conformit\u00e9 EU.",
    heroSub: "32 ans de d\u00e9veloppement produit m\u00e9catronique \u2014 des volants airbag Toyota aux batteries TGV 1500V \u2014 combin\u00e9s \u00e0 l\u2019intelligence artificielle r\u00e9glementaire pour accompagner vos ETI industrielles de la veille normative \u00e0 la mise en conformit\u00e9 op\u00e9rationnelle.",
    heroCta1: "Essayer gratuitement \u2192", heroCta2: "Voir les tarifs",
    heroTrust: [
      { icon: "\ud83d\udd12", text: "RGPD natif" },
      { icon: "\u26a1", text: "R\u00e9sultats en <30s" },
      { icon: "\ud83c\udfaf", text: "0\u20ac pour commencer" },
    ],
    heroPreviewTitle: "AEGIS \u2014 Analyse d\u2019impact r\u00e9glementaire",
    heroPreviewSector: "Secteur : Batteries & Stockage \u00c9nergie",
    heroPreviewProduct: "Produit : Pack batterie Li-ion v\u00e9hicule \u00e9lectrique",
    heroPreviewLines: [
      { text: "EU Battery Regulation 2023/1542 \u2014 Impact CRITIQUE", color: C.rose },
      { text: "REACH Annexe XVII \u2014 Substances restreintes : 3 alertes", color: C.gold },
      { text: "UN 38.3 \u2014 Tests transport : conformit\u00e9 \u00e0 v\u00e9rifier", color: C.gold },
      { text: "Passeport num\u00e9rique batterie \u2014 Deadline : F\u00e9v 2027", color: C.accent },
      { text: "Actions recommand\u00e9es : 7 items prioritaires", color: C.emerald },
    ],
    heroPreviewCta: "\ud83d\udcE5 T\u00e9l\u00e9charger le rapport PDF",
    heroPreviewCaption: "Aper\u00e7u r\u00e9el \u2014 recherche batteries Li-ion",
    // TRUST
    trustBadges: [
      { value: "32", label: "ans de R&D industrielle", sub: "Conception \u2192 Industrialisation \u2192 S\u00e9rie" },
      { value: "6", label: "groupes internationaux", sub: "Autoliv \u00b7 Faurecia \u00b7 Saft \u00b7 Forsee \u00b7 Bombardier \u00b7 Emerson" },
      { value: "27+", label: "\u00c9tats membres UE couverts", sub: "+ DOM-TOM, Canaries, A\u00e7ores, Mad\u00e8re, R\u00e9union" },
      { value: "5", label: "secteurs m\u00e9catroniques", sub: "Auto \u00b7 Batteries \u00b7 Ferroviaire \u00b7 MedTech \u00b7 D\u00e9fense" },
      { value: "50+", label: "programmes v\u00e9hicules", sub: "Toyota \u00b7 BMW \u00b7 DS7 \u00b7 Renault \u00b7 Volvo \u00b7 Peugeot\u2026" },
    ],
    trustCreds: [
      "\ud83c\udf93 MSc Advanced Manufacturing (Coventry UK)",
      "\ud83c\udf93 Management Tech. (Centrale Paris)",
      "\ud83c\udf93 Digital Transformation (EIT Digital 2025)",
      "\ud83d\udd12 RGPD natif", "\ud83c\uddea\ud83c\uddfa Serveurs EU",
    ],
    // PARCOURS
    parcoursTitle1: "Du bureau d\u2019\u00e9tudes au lancement s\u00e9rie.",
    parcoursTitle2: "32 ans de convergence produit-process.",
    parcoursSub: "Chaque r\u00e9glementation que je ma\u00eetrise, je l\u2019ai d\u2019abord v\u00e9cue sur le terrain \u2014 en concevant les produits qu\u2019elle encadre.",
    parcours: [
      { period: "2020\u20132025", company: "Autoliv", sector: "Automobile / ADAS",
        role: "Ing\u00e9nieur R&D M\u00e9catronique S\u00e9nior",
        programs: "Programmes Toyota, BMW \u2014 Volants airbag nouvelle g\u00e9n\u00e9ration, syst\u00e8mes ADAS, cybers\u00e9curit\u00e9 UNECE R155/R156", color: C.accent },
      { period: "2017\u20132020", company: "Saft (TotalEnergies)", sector: "\u00c9nergie / Batteries",
        role: "Ing\u00e9nieur Syst\u00e8mes Batteries",
        programs: "Batteries TGV M (1500V), batteries marines (3MWh) \u2014 Cycle de vie complet, conformit\u00e9 ferroviaire EN 45545", color: C.emerald },
      { period: "2015\u20132017", company: "Forsee Power", sector: "Mobilit\u00e9 \u00c9lectrique",
        role: "Ing\u00e9nieur D\u00e9veloppement Produit",
        programs: "Batteries bus \u00e9lectriques ZEN \u2014 R&D cellule-\u00e0-pack, validation thermique, certification UN 38.3", color: C.gold },
      { period: "1999\u20132015", company: "Faurecia", sector: "Automobile / Int\u00e9rieurs",
        role: "Responsable D\u00e9veloppement & Industrialisation",
        programs: "16 ans \u2014 Planches de bord m\u00e9catroniques pour Renault, Peugeot, Citro\u00ebn, DS7, Volvo, Ford, Opel", color: C.rose },
      { period: "1995\u20131999", company: "Bombardier Transport", sector: "Ferroviaire",
        role: "Ing\u00e9nieur M\u00e9thodes & Industrialisation",
        programs: "Lignes d\u2019assemblage trains r\u00e9gionaux \u2014 Lean manufacturing, optimisation process", color: C.copper },
      { period: "1993\u20131995", company: "Emerson (Branson)", sector: "\u00c9quipements Industriels",
        role: "Responsable Bureau d\u2019\u00c9tudes",
        programs: "Direction R&D soudage ultrasons industriel \u2014 Conception machines sp\u00e9ciales", color: C.slateMuted },
    ],
    chainTitle: "CHA\u00ceNE DE VALEUR MA\u00ceTRIS\u00c9E DE BOUT EN BOUT",
    chain: [
      { step: "R&D Concept", icon: "\ud83d\udca1" }, { step: "Design M\u00e9catronique", icon: "\u2699\ufe0f" },
      { step: "Prototypage", icon: "\ud83d\udd2c" }, { step: "Validation (AMDEC/DVP&R)", icon: "\u2705" },
      { step: "Industrialisation", icon: "\ud83c\udfed" }, { step: "Lancement S\u00e9rie", icon: "\ud83d\ude80" },
      { step: "Cycle de Vie", icon: "\u267b\ufe0f" },
    ],
    // SANS/AVEC
    compTitle: "Pourquoi vos concurrents avancent plus vite",
    compSans: "\u274c Sans Aegis",
    compSansList: [
      "Veille manuelle sur +50 sources r\u00e9glementaires",
      "Consultants sans culture R&D m\u00e9catronique",
      "Rapports d\u2019impact g\u00e9n\u00e9ralistes apr\u00e8s 2\u20134 semaines",
      "Aucune convergence produit/process/conformit\u00e9",
      "Non-conformit\u00e9 d\u00e9tect\u00e9e en production = rappels + amendes",
    ],
    compAvec: "\u2705 Avec Aegis",
    compAvecList: [
      "IA scanne et synth\u00e9tise en temps r\u00e9el",
      "Ing\u00e9nieur R&D 32 ans + IA = expertise in\u00e9gal\u00e9e",
      "Analyse d\u2019impact sp\u00e9cifique produit/secteur en <30s",
      "AMDEC r\u00e9glementaire int\u00e9gr\u00e9e au cycle de d\u00e9veloppement",
      "Conformit\u00e9 anticip\u00e9e d\u00e8s la phase de conception",
    ],
    // SERVICES
    svcTitle: "De la veille normative \u00e0 l\u2019industrialisation conforme",
    services: [
      { icon: "\ud83d\udd0d", title: "Veille r\u00e9glementaire IA",
        desc: "Scan automatis\u00e9 de tous les r\u00e8glements EU impactant vos produits m\u00e9catroniques. Filtrage par secteur, par composant, par mat\u00e9riau. Alertes proactives.",
        tier: "\u2192 DISCOVER (0\u20ac)", color: C.accent },
      { icon: "\ud83d\udcca", title: "Feuille de route conformit\u00e9",
        desc: "Kanban d\u2019actions prioris\u00e9es par criticit\u00e9 + Gantt d\u2019impl\u00e9mentation cal\u00e9 sur vos jalons de d\u00e9veloppement produit (APQP/PPAP, DVP&R).",
        tier: "\u2192 STANDARD (50\u20ac/mois)", color: C.emerald },
      { icon: "\ud83e\udd1d", title: "Ing\u00e9nierie de conformit\u00e9 R&D",
        desc: "AMDEC r\u00e9glementaire, audits produit/process, convergence conception-conformit\u00e9. Interventions sur site, revues de design, accompagnement lancement s\u00e9rie.",
        tier: "\u2192 PREMIUM (500\u20ac/mois)", color: C.gold },
    ],
    // PRICING
    pricingTitle: "Transparence totale. Pas de devis cach\u00e9.",
    pricingSub: "Commencez gratuitement. \u00c9voluez quand vous \u00eates pr\u00eat.",
    tiers: [
      { name: "DISCOVER", price: "0\u20ac", period: "", badge: null, color: C.slateMuted,
        tagline: "Cr\u00e9er un compte gratuit",
        features: ["Recherche r\u00e9glementaire basique", "1 secteur industriel", "Synth\u00e8se en ligne + PDF one-pager", "Fil d\u2019actualit\u00e9s sectoriel"],
        notIncluded: ["Kanban actions strat\u00e9giques", "Feuille de route Gantt", "Accompagnement expert"],
        cta: "Commencer gratuitement" },
      { name: "STANDARD", price: "50\u20ac", period: "/mois", badge: "POPULAIRE", annual: "500\u20ac/an", color: C.accent,
        tagline: "Conformit\u00e9 pilot\u00e9e par l\u2019IA",
        features: ["Recherche r\u00e9glementaire d\u00e9taill\u00e9e", "Tous secteurs industriels", "Kanban recommandations strat\u00e9giques", "Feuille de route Gantt PDF complet", "Fil d\u2019actualit\u00e9s multi-secteurs", "Rapports PDF premium"],
        notIncluded: ["Accompagnement expert d\u00e9di\u00e9"],
        cta: "D\u00e9marrer l\u2019essai" },
      { name: "PREMIUM", price: "500\u20ac", period: "/mois", badge: "EXPERTISE", annual: "5 000\u20ac/an", color: C.gold,
        tagline: "Ing\u00e9nieur R&D s\u00e9nior + IA",
        features: ["Tout STANDARD inclus", "Accompagnement ing\u00e9nieur R&D d\u00e9di\u00e9", "Conf-calls & interventions sur site", "Audit conformit\u00e9 m\u00e9catronique personnalis\u00e9", "AMDEC r\u00e9glementaire produit/process", "Feuille de route industrialisation sur mesure"],
        notIncluded: [],
        cta: "Prendre rendez-vous" },
    ],
    funnelTitle: "TUNNEL DE CONVERSION",
    funnel: ["SEO / LinkedIn", "Homepage", "DISCOVER 0\u20ac", "STANDARD 50\u20ac", "PREMIUM 500\u20ac"],
    // REGLEMENTS
    regTitle: "Chaque r\u00e8glement, v\u00e9cu de l\u2019int\u00e9rieur",
    regSub: "Pas de la th\u00e9orie. De l\u2019exp\u00e9rience d\u2019impl\u00e9mentation sur des programmes r\u00e9els.",
    regs: [
      { reg: "EU Battery Regulation", ref: "2023/1542", xp: "Saft \u2014 TGV M, Forsee \u2014 bus ZEN", sectors: "Batteries \u00b7 Mobilit\u00e9", color: C.emerald },
      { reg: "EU AI Act", ref: "2024/1689", xp: "Autoliv \u2014 syst\u00e8mes ADAS Toyota/BMW", sectors: "Auto \u00b7 ADAS", color: C.accent },
      { reg: "UNECE R155/R156", ref: "Cybers\u00e9curit\u00e9 v\u00e9hicule", xp: "Autoliv \u2014 homologation type", sectors: "Auto \u00b7 Cybersec", color: C.accent },
      { reg: "REACH", ref: "1907/2006", xp: "Faurecia \u2014 mat\u00e9riaux planches de bord", sectors: "Auto \u00b7 Chimie", color: C.gold },
      { reg: "CSRD", ref: "2022/2464", xp: "Reporting ESG cha\u00eene de valeur", sectors: "Transversal", color: C.emerald },
      { reg: "Ecodesign ESPR", ref: "2024/1781", xp: "Passeport num\u00e9rique produit", sectors: "Transversal", color: C.copper },
      { reg: "Cyber Resilience Act", ref: "2024/2847", xp: "Produits connect\u00e9s industriels", sectors: "IoT \u00b7 Industrie", color: C.accent },
      { reg: "EN 45545", ref: "S\u00e9curit\u00e9 incendie ferroviaire", xp: "Saft \u2014 batteries TGV", sectors: "Ferroviaire", color: C.rose },
    ],
    // CTA
    ctaTitle1: "Pr\u00eat \u00e0 piloter votre conformit\u00e9 EU",
    ctaTitle2: "avec un vrai ing\u00e9nieur R&D ?",
    ctaSub: "Cr\u00e9ez votre compte gratuit en 30 secondes. Pas de carte bancaire requise.",
    ctaBtn1: "Cr\u00e9er mon compte gratuit \u2192", ctaBtn2: "Nous contacter",
    // FOOTER
    footerLegal: "L\u00c9GAL", footerPlatform: "PLATEFORME", footerContact: "CONTACT",
    footerDesc: "Ing\u00e9nierie de conformit\u00e9 R&D \u00d7 IA\n27 \u00c9tats membres UE + ultrap\u00e9riph\u00e9riques",
    footerLegalItems: ["Politique de confidentialit\u00e9", "CGV", "DPA (Art. 28 RGPD)", "Mentions l\u00e9gales"],
    footerPlatItems: ["Dashboard", "Tarifs", "Documentation", "Status"],
    footerContactItems: ["contact@jeanpierrecharles.com", "LinkedIn", "Formulaire"],
    // SECTION LABELS
    sectionLabels: [
      { id: "nav", label: "NAVIGATION" }, { id: "hero", label: "HERO \u2014 R&D \u00d7 IA" },
      { id: "trust", label: "CR\u00c9DIBILIT\u00c9 TECHNIQUE" }, { id: "parcours", label: "PARCOURS R&D" },
      { id: "problem", label: "SANS / AVEC AEGIS" }, { id: "services", label: "SERVICES" },
      { id: "pricing", label: "PRICING 3 TIERS" }, { id: "reglements", label: "R\u00c8GLEMENTS MA\u00ceTRIS\u00c9S" },
      { id: "cta", label: "CTA FINAL" }, { id: "footer", label: "FOOTER" },
    ],
  },
  en: {
    navSub: "R&D MECHATRONICS \u00b7 AI COMPLIANCE \u00b7 EU INDUSTRY",
    navItems: ["Expertise", "Services", "Pricing", "Contact"],
    navCta: "Free trial", navLogin: "Sign in",
    euBadge: "27 EU Member States + Outermost Regions",
    heroH1a: "The R&D engineer", heroH1b: "who designed your systems,",
    heroH1c: "pilots your EU compliance.",
    heroSub: "32 years of mechatronic product development \u2014 from Toyota airbag steering wheels to TGV 1500V batteries \u2014 combined with regulatory AI to support your industrial mid-market companies from regulatory watch to operational compliance.",
    heroCta1: "Try for free \u2192", heroCta2: "View pricing",
    heroTrust: [
      { icon: "\ud83d\udd12", text: "GDPR native" },
      { icon: "\u26a1", text: "Results in <30s" },
      { icon: "\ud83c\udfaf", text: "\u20ac0 to start" },
    ],
    heroPreviewTitle: "AEGIS \u2014 Regulatory Impact Analysis",
    heroPreviewSector: "Sector: Batteries & Energy Storage",
    heroPreviewProduct: "Product: EV Li-ion battery pack",
    heroPreviewLines: [
      { text: "EU Battery Regulation 2023/1542 \u2014 CRITICAL Impact", color: C.rose },
      { text: "REACH Annex XVII \u2014 Restricted substances: 3 alerts", color: C.gold },
      { text: "UN 38.3 \u2014 Transport tests: compliance to verify", color: C.gold },
      { text: "Digital Battery Passport \u2014 Deadline: Feb 2027", color: C.accent },
      { text: "Recommended actions: 7 priority items", color: C.emerald },
    ],
    heroPreviewCta: "\ud83d\udcE5 Download PDF report",
    heroPreviewCaption: "Live preview \u2014 Li-ion battery search",
    trustBadges: [
      { value: "32", label: "years of industrial R&D", sub: "Design \u2192 Industrialisation \u2192 Production" },
      { value: "6", label: "international groups", sub: "Autoliv \u00b7 Faurecia \u00b7 Saft \u00b7 Forsee \u00b7 Bombardier \u00b7 Emerson" },
      { value: "27+", label: "EU Member States covered", sub: "+ DOM-TOM, Canaries, Azores, Madeira, R\u00e9union" },
      { value: "5", label: "mechatronic sectors", sub: "Auto \u00b7 Batteries \u00b7 Rail \u00b7 MedTech \u00b7 Defence" },
      { value: "50+", label: "vehicle programmes", sub: "Toyota \u00b7 BMW \u00b7 DS7 \u00b7 Renault \u00b7 Volvo \u00b7 Peugeot\u2026" },
    ],
    trustCreds: [
      "\ud83c\udf93 MSc Advanced Manufacturing (Coventry UK)",
      "\ud83c\udf93 Tech. Management (Centrale Paris)",
      "\ud83c\udf93 Digital Transformation (EIT Digital 2025)",
      "\ud83d\udd12 GDPR native", "\ud83c\uddea\ud83c\uddfa EU Servers",
    ],
    parcoursTitle1: "From engineering office to production launch.",
    parcoursTitle2: "32 years of product-process convergence.",
    parcoursSub: "Every regulation I master, I first experienced in the field \u2014 by designing the products it governs.",
    parcours: [
      { period: "2020\u20132025", company: "Autoliv", sector: "Automotive / ADAS",
        role: "Senior Mechatronics R&D Engineer",
        programs: "Toyota, BMW programmes \u2014 Next-gen airbag steering wheels, ADAS systems, UNECE R155/R156 cybersecurity", color: C.accent },
      { period: "2017\u20132020", company: "Saft (TotalEnergies)", sector: "Energy / Batteries",
        role: "Battery Systems Engineer",
        programs: "TGV M batteries (1500V), marine batteries (3MWh) \u2014 Full lifecycle, EN 45545 rail compliance", color: C.emerald },
      { period: "2015\u20132017", company: "Forsee Power", sector: "Electric Mobility",
        role: "Product Development Engineer",
        programs: "ZEN electric bus batteries \u2014 Cell-to-pack R&D, thermal validation, UN 38.3 certification", color: C.gold },
      { period: "1999\u20132015", company: "Faurecia", sector: "Automotive / Interiors",
        role: "Development & Industrialisation Manager",
        programs: "16 years \u2014 Mechatronic dashboards for Renault, Peugeot, Citro\u00ebn, DS7, Volvo, Ford, Opel", color: C.rose },
      { period: "1995\u20131999", company: "Bombardier Transport", sector: "Rail",
        role: "Methods & Industrialisation Engineer",
        programs: "Regional train assembly lines \u2014 Lean manufacturing, process optimisation", color: C.copper },
      { period: "1993\u20131995", company: "Emerson (Branson)", sector: "Industrial Equipment",
        role: "Design Office Manager",
        programs: "Industrial ultrasonic welding R&D \u2014 Special-purpose machine design", color: C.slateMuted },
    ],
    chainTitle: "END-TO-END VALUE CHAIN MASTERY",
    chain: [
      { step: "R&D Concept", icon: "\ud83d\udca1" }, { step: "Mechatronic Design", icon: "\u2699\ufe0f" },
      { step: "Prototyping", icon: "\ud83d\udd2c" }, { step: "Validation (FMEA/DVP&R)", icon: "\u2705" },
      { step: "Industrialisation", icon: "\ud83c\udfed" }, { step: "Production Launch", icon: "\ud83d\ude80" },
      { step: "Lifecycle", icon: "\u267b\ufe0f" },
    ],
    compTitle: "Why your competitors move faster",
    compSans: "\u274c Without Aegis",
    compSansList: [
      "Manual monitoring of 50+ regulatory sources",
      "Consultants with no mechatronic R&D culture",
      "Generic impact reports after 2\u20134 weeks",
      "No product/process/compliance convergence",
      "Non-compliance detected in production = recalls + fines",
    ],
    compAvec: "\u2705 With Aegis",
    compAvecList: [
      "AI scans and synthesises in real-time",
      "32-year R&D engineer + AI = unmatched expertise",
      "Product/sector-specific impact analysis in <30s",
      "Regulatory FMEA integrated into dev cycle",
      "Compliance anticipated from the design phase",
    ],
    svcTitle: "From regulatory watch to compliant industrialisation",
    services: [
      { icon: "\ud83d\udd0d", title: "AI Regulatory Watch",
        desc: "Automated scan of all EU regulations impacting your mechatronic products. Filtering by sector, component, material. Proactive alerts.",
        tier: "\u2192 DISCOVER (\u20ac0)", color: C.accent },
      { icon: "\ud83d\udcca", title: "Compliance Roadmap",
        desc: "Criticality-prioritised action Kanban + Gantt implementation plan aligned with your product development milestones (APQP/PPAP, DVP&R).",
        tier: "\u2192 STANDARD (\u20ac50/mo)", color: C.emerald },
      { icon: "\ud83e\udd1d", title: "R&D Compliance Engineering",
        desc: "Regulatory FMEA, product/process audits, design-compliance convergence. On-site interventions, design reviews, production launch support.",
        tier: "\u2192 PREMIUM (\u20ac500/mo)", color: C.gold },
    ],
    pricingTitle: "Full transparency. No hidden quotes.",
    pricingSub: "Start free. Scale when you\u2019re ready.",
    tiers: [
      { name: "DISCOVER", price: "\u20ac0", period: "", badge: null, color: C.slateMuted,
        tagline: "Create a free account",
        features: ["Basic regulatory search", "1 industrial sector", "Online summary + PDF one-pager", "Sector news feed"],
        notIncluded: ["Strategic action Kanban", "Gantt roadmap", "Expert support"],
        cta: "Start for free" },
      { name: "STANDARD", price: "\u20ac50", period: "/mo", badge: "POPULAR", annual: "\u20ac500/yr", color: C.accent,
        tagline: "AI-powered compliance",
        features: ["Detailed regulatory search", "All industrial sectors", "Strategic recommendations Kanban", "Full Gantt PDF roadmap", "Multi-sector news feed", "Premium PDF reports"],
        notIncluded: ["Dedicated expert support"],
        cta: "Start trial" },
      { name: "PREMIUM", price: "\u20ac500", period: "/mo", badge: "EXPERTISE", annual: "\u20ac5,000/yr", color: C.gold,
        tagline: "Senior R&D Engineer + AI",
        features: ["Everything in STANDARD", "Dedicated R&D engineer support", "Conf-calls & on-site interventions", "Custom mechatronic compliance audit", "Regulatory FMEA product/process", "Bespoke industrialisation roadmap"],
        notIncluded: [],
        cta: "Book a call" },
    ],
    funnelTitle: "CONVERSION FUNNEL",
    funnel: ["SEO / LinkedIn", "Homepage", "DISCOVER \u20ac0", "STANDARD \u20ac50", "PREMIUM \u20ac500"],
    regTitle: "Every regulation, lived from the inside",
    regSub: "Not theory. Implementation experience on real programmes.",
    regs: [
      { reg: "EU Battery Regulation", ref: "2023/1542", xp: "Saft \u2014 TGV M, Forsee \u2014 ZEN bus", sectors: "Batteries \u00b7 Mobility", color: C.emerald },
      { reg: "EU AI Act", ref: "2024/1689", xp: "Autoliv \u2014 Toyota/BMW ADAS systems", sectors: "Auto \u00b7 ADAS", color: C.accent },
      { reg: "UNECE R155/R156", ref: "Vehicle Cybersecurity", xp: "Autoliv \u2014 type approval", sectors: "Auto \u00b7 Cybersec", color: C.accent },
      { reg: "REACH", ref: "1907/2006", xp: "Faurecia \u2014 dashboard materials", sectors: "Auto \u00b7 Chemistry", color: C.gold },
      { reg: "CSRD", ref: "2022/2464", xp: "Value chain ESG reporting", sectors: "Cross-sector", color: C.emerald },
      { reg: "Ecodesign ESPR", ref: "2024/1781", xp: "Digital Product Passport", sectors: "Cross-sector", color: C.copper },
      { reg: "Cyber Resilience Act", ref: "2024/2847", xp: "Connected industrial products", sectors: "IoT \u00b7 Industry", color: C.accent },
      { reg: "EN 45545", ref: "Rail fire safety", xp: "Saft \u2014 TGV batteries", sectors: "Rail", color: C.rose },
    ],
    ctaTitle1: "Ready to pilot your EU compliance",
    ctaTitle2: "with a real R&D engineer?",
    ctaSub: "Create your free account in 30 seconds. No credit card required.",
    ctaBtn1: "Create my free account \u2192", ctaBtn2: "Contact us",
    footerLegal: "LEGAL", footerPlatform: "PLATFORM", footerContact: "CONTACT",
    footerDesc: "R&D Compliance Engineering \u00d7 AI\n27 EU Member States + outermost regions",
    footerLegalItems: ["Privacy Policy", "T&Cs", "DPA (Art. 28 GDPR)", "Legal Notice"],
    footerPlatItems: ["Dashboard", "Pricing", "Documentation", "Status"],
    footerContactItems: ["contact@jeanpierrecharles.com", "LinkedIn", "Contact form"],
    sectionLabels: [
      { id: "nav", label: "NAVIGATION" }, { id: "hero", label: "HERO \u2014 R&D \u00d7 AI" },
      { id: "trust", label: "TECHNICAL CREDIBILITY" }, { id: "parcours", label: "R&D CAREER" },
      { id: "problem", label: "WITHOUT / WITH AEGIS" }, { id: "services", label: "SERVICES" },
      { id: "pricing", label: "PRICING 3 TIERS" }, { id: "reglements", label: "REGULATIONS MASTERED" },
      { id: "cta", label: "FINAL CTA" }, { id: "footer", label: "FOOTER" },
    ],
  },
};

const sectionColors = [C.slateLight, C.accent, C.emerald, C.copper, C.gold, C.accent, C.emeraldDark, C.gold, C.rose, C.slateLight];

const sectionTag = (label, color) => ({
  position: "absolute", top: -12, left: 16, fontSize: 9, fontWeight: 700,
  letterSpacing: 2, textTransform: "uppercase", color: "#fff",
  background: color || C.accent, padding: "2px 10px", borderRadius: 4,
  fontFamily: "'DM Sans', sans-serif",
});

/* ═══════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════ */
export default function WireframeHomepageR3() {
  const [activeSection, setActiveSection] = useState(null);
  const [activeTier, setActiveTier] = useState(1);
  const [lang, setLang] = useState("fr");
  const t = i18n[lang];

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "24px 12px", fontFamily: "'DM Sans', sans-serif", color: C.white }}>
      <link href={FONT_LINK} rel="stylesheet" />

      {/* ══ TITLE BAR ══ */}
      <div style={{ maxWidth: 920, margin: "0 auto 20px", padding: "16px 20px",
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        borderRadius: 12, border: `1px solid ${C.slate}`,
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.5 }}>
            WIREFRAME v3.0-alpha <span style={{ color: C.gold, fontSize: 12 }}>R3</span>
          </div>
          <div style={{ fontSize: 11, color: C.slateMuted, marginTop: 2 }}>
            jeanpierrecharles.com {"\u2014"} Homepage B2B {"\u2014"} 14/02/2026 {"\u2014"} i18n FR/EN
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* LANG TOGGLE */}
          <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", border: `1px solid ${C.slate}` }}>
            {["fr", "en"].map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                fontSize: 10, fontWeight: 700, padding: "4px 10px", border: "none", cursor: "pointer",
                background: lang === l ? C.accent : "transparent", color: lang === l ? "#fff" : C.slateMuted,
                textTransform: "uppercase", letterSpacing: 1, transition: "all 0.2s",
              }}>{l}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {t.sectionLabels.map((s, i) => (
              <button key={s.id} onClick={() => {
                setActiveSection(activeSection === s.id ? null : s.id);
                if (activeSection !== s.id) document.getElementById(`section-${s.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
              }} style={{
                fontSize: 7, fontWeight: 700, padding: "2px 6px", borderRadius: 3,
                border: `1px solid ${activeSection === s.id ? sectionColors[i] : C.slate}`,
                background: activeSection === s.id ? sectionColors[i] + "22" : "transparent",
                color: activeSection === s.id ? sectionColors[i] : C.slateMuted,
                cursor: "pointer", textTransform: "uppercase", letterSpacing: 0.8, transition: "all 0.2s",
              }}>{s.label.split("\u2014")[0].trim()}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ══ SECTIONS ══ */}
      <div style={{ maxWidth: 920, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ─── S0: NAV ─── */}
        <div id="section-nav" style={{ position: "relative", padding: "28px 20px 16px", background: C.navy, borderRadius: 12, border: `1px solid ${C.navyLight}` }}>
          <div style={sectionTag("S0 \u00b7 NAV", C.slateLight)}>S0 \u00b7 NAV</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${C.accent}, ${C.emerald})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800 }}>{"\u00c6"}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: -0.3 }}>AEGIS CIRCULAR</div>
                <div style={{ fontSize: 7, color: C.slateMuted, letterSpacing: 1.5 }}>{t.navSub}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
              {t.navItems.map(item => <span key={item} style={{ fontSize: 11, color: C.slateMuted, cursor: "pointer" }}>{item}</span>)}
              <div style={{ fontSize: 10, fontWeight: 700, padding: "6px 14px", borderRadius: 6, background: C.accent, color: "#fff", cursor: "pointer" }}>{t.navCta}</div>
              <div style={{ fontSize: 10, fontWeight: 600, padding: "5px 12px", borderRadius: 6, border: `1px solid ${C.slate}`, color: C.slateMuted, cursor: "pointer" }}>{t.navLogin}</div>
              {/* Lang switch in nav */}
              <div style={{ display: "flex", gap: 2 }}>
                {["fr","en"].map(l => (
                  <button key={l} onClick={() => setLang(l)} style={{
                    fontSize: 9, fontWeight: lang===l?800:400, padding: "3px 6px", borderRadius: 4, border: "none", cursor: "pointer",
                    background: lang===l ? C.accent+"33" : "transparent", color: lang===l ? C.accent : C.slate,
                  }}>{l.toUpperCase()}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── S1: HERO ─── */}
        <div id="section-hero" style={{ position: "relative", padding: "32px 24px 28px",
          background: `linear-gradient(170deg, ${C.navyMid} 0%, ${C.bg} 60%, ${C.accent}08 100%)`,
          borderRadius: 16, border: `1px solid ${C.accent}33`, boxShadow: `0 0 60px ${C.accent}08` }}>
          <div style={sectionTag("S1 \u00b7 HERO", C.accent)}>S1 \u00b7 HERO</div>
          <div style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 420px", minWidth: 300 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.accent+"15", border: `1px solid ${C.accent}33`, borderRadius: 20, padding: "4px 12px", marginBottom: 14 }}>
                <span style={{ fontSize: 12 }}>{"\ud83c\uddea\ud83c\uddfa"}</span>
                <span style={{ fontSize: 9, color: C.accentGlow, fontWeight: 600 }}>{t.euBadge}</span>
              </div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, lineHeight: 1.15, color: C.white, margin: "0 0 12px", letterSpacing: -0.5 }}>
                {t.heroH1a}<br />{t.heroH1b}<br /><span style={{ color: C.accent }}>{t.heroH1c}</span>
              </h1>
              <p style={{ fontSize: 13, color: C.slateMuted, lineHeight: 1.65, maxWidth: 440, margin: "0 0 10px" }}>{t.heroSub}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                {["Autoliv", "Faurecia", "Saft", "Forsee Power", "Bombardier"].map((co, i) => (
                  <span key={i} style={{ fontSize: 8, padding: "2px 8px", borderRadius: 3, background: C.navyLight, border: `1px solid ${C.slate}33`, color: C.slateLight, fontWeight: 600 }}>{co}</span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <div style={{ fontSize: 13, fontWeight: 700, padding: "12px 24px", borderRadius: 8, background: `linear-gradient(135deg, ${C.accent}, #2563eb)`, color: "#fff", cursor: "pointer", boxShadow: `0 4px 20px ${C.accent}44` }}>{t.heroCta1}</div>
                <div style={{ fontSize: 13, fontWeight: 600, padding: "11px 22px", borderRadius: 8, border: `1px solid ${C.slate}`, color: C.slateMuted, cursor: "pointer" }}>{t.heroCta2}</div>
              </div>
              <div style={{ display: "flex", gap: 14, marginTop: 14, flexWrap: "wrap" }}>
                {t.heroTrust.map((tr, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 11 }}>{tr.icon}</span>
                    <span style={{ fontSize: 9, color: C.slateLight, fontWeight: 600 }}>{tr.text}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Dashboard preview */}
            <div style={{ flex: "0 0 310px", minWidth: 270, background: C.navyLight, borderRadius: 12, border: `1px solid ${C.slate}44`, padding: 12, boxShadow: `0 8px 40px ${C.bg}` }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444" }} />
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#eab308" }} />
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }} />
              </div>
              <div style={{ background: C.navy, borderRadius: 8, padding: 12, border: `1px solid ${C.slate}33` }}>
                <div style={{ fontSize: 9, color: C.accent, fontWeight: 700, marginBottom: 6 }}>{t.heroPreviewTitle}</div>
                <div style={{ background: C.navyMid, borderRadius: 6, padding: 8, border: `1px solid ${C.slate}22`, marginBottom: 8 }}>
                  <div style={{ fontSize: 8, color: C.slateLight, marginBottom: 3 }}>{t.heroPreviewSector}</div>
                  <div style={{ fontSize: 8, color: C.slateLight }}>{t.heroPreviewProduct}</div>
                </div>
                {t.heroPreviewLines.map((line, i) => (
                  <div key={i} style={{ fontSize: 8, color: line.color, fontWeight: i===0?700:500, padding: "3px 0", display: "flex", gap: 4, alignItems: "flex-start" }}>
                    <span style={{ color: line.color, fontSize: 7, marginTop: 2 }}>{"\u25cf"}</span> {line.text}
                  </div>
                ))}
                <div style={{ marginTop: 8, fontSize: 8, fontWeight: 700, color: C.accent, textAlign: "center", padding: "6px", background: C.accent+"11", borderRadius: 4 }}>{t.heroPreviewCta}</div>
              </div>
              <div style={{ fontSize: 8, color: C.slate, textAlign: "center", marginTop: 6, fontStyle: "italic" }}>{t.heroPreviewCaption}</div>
            </div>
          </div>
        </div>

        {/* ─── S2: TRUST ─── */}
        <div id="section-trust" style={{ position: "relative", padding: "28px 20px 16px", background: C.navy, borderRadius: 12, border: `1px solid ${C.emerald}22` }}>
          <div style={sectionTag("S2 \u00b7 TRUST", C.emerald)}>S2 \u00b7 TRUST</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            {t.trustBadges.map((b, i) => (
              <div key={i} style={{ textAlign: "center", padding: "12px 14px", minWidth: 130, flex: "1 1 130px", background: C.navyMid, borderRadius: 10, border: `1px solid ${C.navyLight}` }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: C.emerald }}>{b.value}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.white, margin: "4px 0" }}>{b.label}</div>
                <div style={{ fontSize: 7, color: C.slateLight }}>{b.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
            {t.trustCreds.map((b, i) => (
              <span key={i} style={{ fontSize: 7, color: C.slateMuted, background: C.navyLight, padding: "3px 8px", borderRadius: 4, border: `1px solid ${C.slate}33` }}>{b}</span>
            ))}
          </div>
        </div>

        {/* ─── S3: PARCOURS R&D ─── */}
        <div id="section-parcours" style={{ position: "relative", padding: "28px 20px 16px",
          background: `linear-gradient(170deg, ${C.navy} 0%, ${C.navyMid} 100%)`, borderRadius: 16, border: `1px solid ${C.copper}22` }}>
          <div style={sectionTag("S3 \u00b7 R&D", C.copper)}>S3 \u00b7 R&D</div>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: C.white }}>
              {t.parcoursTitle1}<br /><span style={{ color: C.copper }}>{t.parcoursTitle2}</span>
            </div>
            <div style={{ fontSize: 11, color: C.slateMuted, marginTop: 6 }}>{t.parcoursSub}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {t.parcours.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "12px 14px", background: C.navyMid, borderRadius: 10, border: `1px solid ${p.color}18`, borderLeft: `3px solid ${p.color}` }}>
                <div style={{ flexShrink: 0, width: 80 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: p.color }}>{p.period}</div>
                  <div style={{ fontSize: 8, color: C.slateLight, marginTop: 2 }}>{p.sector}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{p.company}</span>
                    <span style={{ fontSize: 9, color: C.slateMuted }}>{"\u2014"} {p.role}</span>
                  </div>
                  <div style={{ fontSize: 9, color: C.slateLight, marginTop: 4, lineHeight: 1.5 }}>{p.programs}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Value chain */}
          <div style={{ marginTop: 16, padding: 12, background: C.navy, borderRadius: 10, border: `1px solid ${C.copper}22` }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.copper, textAlign: "center", marginBottom: 8, letterSpacing: 1 }}>{t.chainTitle}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, flexWrap: "wrap" }}>
              {t.chain.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ fontSize: 8, fontWeight: 600, padding: "4px 8px", borderRadius: 5, background: C.copper+"15", border: `1px solid ${C.copper}25`, color: C.copper, textAlign: "center" }}>
                    <div style={{ fontSize: 12 }}>{s.icon}</div>
                    <div style={{ marginTop: 2 }}>{s.step}</div>
                  </div>
                  {i < 6 && <span style={{ color: C.slate, fontSize: 10 }}>{"\u2192"}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── S4: SANS / AVEC ─── */}
        <div id="section-problem" style={{ position: "relative", padding: "28px 20px 16px", background: C.navy, borderRadius: 12, border: `1px solid ${C.gold}22` }}>
          <div style={sectionTag("S4 \u00b7 COMPARATIF", C.gold)}>S4</div>
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: C.white }}>{t.compTitle}</div>
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 260, background: `${C.rose}08`, borderRadius: 10, padding: 14, border: `1px solid ${C.rose}22` }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.rose, marginBottom: 8 }}>{t.compSans}</div>
              {t.compSansList.map((item, i) => (
                <div key={i} style={{ fontSize: 10, color: "#fca5a5", padding: "3px 0", display: "flex", gap: 5 }}>
                  <span style={{ color: C.rose, fontSize: 9 }}>{"\u2717"}</span> {item}
                </div>
              ))}
            </div>
            <div style={{ flex: 1, minWidth: 260, background: `${C.emerald}08`, borderRadius: 10, padding: 14, border: `1px solid ${C.emerald}22` }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.emerald, marginBottom: 8 }}>{t.compAvec}</div>
              {t.compAvecList.map((item, i) => (
                <div key={i} style={{ fontSize: 10, color: "#6ee7b7", padding: "3px 0", display: "flex", gap: 5 }}>
                  <span style={{ color: C.emerald, fontSize: 9 }}>{"\u2714"}</span> {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── S5: SERVICES ─── */}
        <div id="section-services" style={{ position: "relative", padding: "28px 20px 16px", background: C.navy, borderRadius: 12, border: `1px solid ${C.accent}22` }}>
          <div style={sectionTag("S5 \u00b7 SERVICES", C.accent)}>S5</div>
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: C.white }}>{t.svcTitle}</div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            {t.services.map((svc, i) => (
              <div key={i} style={{ flex: "1 1 240px", maxWidth: 280, padding: 14, background: C.navyMid, borderRadius: 10, border: `1px solid ${svc.color}22` }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{svc.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: svc.color, marginBottom: 5 }}>{svc.title}</div>
                <div style={{ fontSize: 9, color: C.slateMuted, lineHeight: 1.6, marginBottom: 8 }}>{svc.desc}</div>
                <div style={{ fontSize: 8, fontWeight: 700, color: svc.color, opacity: 0.7 }}>{svc.tier}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── S6: PRICING ─── */}
        <div id="section-pricing" style={{ position: "relative", padding: "28px 20px 16px",
          background: `linear-gradient(170deg, ${C.navy} 0%, ${C.navyMid} 100%)`, borderRadius: 16, border: `1px solid ${C.emerald}22` }}>
          <div style={sectionTag("S6 \u00b7 PRICING", C.emeraldDark)}>S6</div>
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: C.white }}>{t.pricingTitle}</div>
            <div style={{ fontSize: 11, color: C.slateMuted, marginTop: 4 }}>{t.pricingSub}</div>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {t.tiers.map((tier, i) => (
              <div key={i} onClick={() => setActiveTier(i)} style={{
                flex: "1 1 220px", maxWidth: 265, padding: "18px 14px", background: C.navyMid, borderRadius: 12, cursor: "pointer",
                border: `2px solid ${activeTier===i ? tier.color : C.navyLight}`,
                boxShadow: activeTier===i ? `0 0 24px ${tier.color}20` : "none",
                transition: "all 0.3s", position: "relative", transform: activeTier===i ? "scale(1.02)" : "scale(1)" }}>
                {tier.badge && <div style={{ position: "absolute", top: -10, right: 14, fontSize: 8, fontWeight: 800, padding: "2px 10px", borderRadius: 10, background: tier.color, color: "#fff", letterSpacing: 1 }}>{tier.badge}</div>}
                <div style={{ fontSize: 10, color: tier.color, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 5 }}>{tier.name}</div>
                <div style={{ fontSize: 30, fontWeight: 800, color: C.white, marginBottom: 2 }}>
                  {tier.price}<span style={{ fontSize: 12, color: C.slateLight, fontWeight: 400 }}>{tier.period}</span>
                </div>
                {tier.annual && <div style={{ fontSize: 9, color: C.emerald, marginBottom: 6 }}>{lang==="fr" ? "ou" : "or"} {tier.annual} ({"\u221217%"})</div>}
                <div style={{ fontSize: 9, color: C.slateMuted, marginBottom: 10, fontStyle: "italic" }}>{tier.tagline}</div>
                {tier.features.map((f, fi) => (
                  <div key={fi} style={{ fontSize: 9, color: "#cbd5e1", padding: "3px 0", display: "flex", gap: 5 }}>
                    <span style={{ color: C.emerald, fontSize: 9, flexShrink: 0 }}>{"\u2714"}</span> {f}
                  </div>
                ))}
                {tier.notIncluded.map((f, fi) => (
                  <div key={fi} style={{ fontSize: 9, color: C.slate, padding: "3px 0", display: "flex", gap: 5 }}>
                    <span style={{ color: C.slate, fontSize: 9, flexShrink: 0 }}>{"\u2717"}</span> {f}
                  </div>
                ))}
                <div style={{ marginTop: 12, textAlign: "center", fontSize: 10, fontWeight: 700, padding: "9px 14px", borderRadius: 8, cursor: "pointer",
                  background: i===1 ? `linear-gradient(135deg, ${tier.color}, #2563eb)` : "transparent",
                  border: i===1 ? "none" : `1px solid ${tier.color}44`, color: i===1 ? "#fff" : tier.color,
                  boxShadow: i===1 ? `0 4px 16px ${tier.color}33` : "none" }}>{tier.cta}</div>
              </div>
            ))}
          </div>
          {/* Funnel */}
          <div style={{ marginTop: 16, background: C.navy, borderRadius: 10, padding: 12, border: `1px solid ${C.navyLight}` }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.slateMuted, textAlign: "center", marginBottom: 6, letterSpacing: 1 }}>{t.funnelTitle}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, flexWrap: "wrap" }}>
              {t.funnel.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ fontSize: 8, fontWeight: 700, padding: "3px 8px", borderRadius: 5, background: [C.slateLight, C.slateMuted, C.slateMuted, C.accent, C.gold][i]+"18", border: `1px solid ${[C.slateLight, C.slateMuted, C.slateMuted, C.accent, C.gold][i]}33`, color: [C.slateLight, C.slateMuted, C.slateMuted, C.accent, C.gold][i] }}>{s}</div>
                  {i < 4 && <span style={{ color: C.slate, fontSize: 11 }}>{"\u2192"}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── S7: REGLEMENTS ─── */}
        <div id="section-reglements" style={{ position: "relative", padding: "28px 20px 16px", background: C.navy, borderRadius: 12, border: `1px solid ${C.gold}22` }}>
          <div style={sectionTag("S7 \u00b7 REGS", C.gold)}>S7</div>
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: C.white }}>{t.regTitle}</div>
            <div style={{ fontSize: 10, color: C.slateMuted, marginTop: 4 }}>{t.regSub}</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {t.regs.map((r, i) => (
              <div key={i} style={{ flex: "1 1 200px", maxWidth: 220, padding: 10, background: C.navyMid, borderRadius: 8, border: `1px solid ${r.color}18`, borderLeft: `3px solid ${r.color}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: r.color }}>{r.reg}</div>
                <div style={{ fontSize: 8, color: C.slateLight, marginTop: 2 }}>{r.ref}</div>
                <div style={{ fontSize: 8, color: C.slateMuted, marginTop: 4, fontStyle: "italic" }}>{"\ud83c\udfed"} {r.xp}</div>
                <div style={{ fontSize: 7, color: C.slate, marginTop: 3 }}>{r.sectors}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── S8: CTA FINAL ─── */}
        <div id="section-cta" style={{ position: "relative", padding: "28px 24px",
          background: `linear-gradient(135deg, ${C.accent}15 0%, ${C.emerald}10 100%)`,
          borderRadius: 16, border: `1px solid ${C.accent}33`, textAlign: "center" }}>
          <div style={sectionTag("S8 \u00b7 CTA", C.rose)}>S8</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 8 }}>
            {t.ctaTitle1}<br />{t.ctaTitle2}
          </div>
          <div style={{ fontSize: 12, color: C.slateMuted, marginBottom: 16 }}>{t.ctaSub}</div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <div style={{ fontSize: 14, fontWeight: 700, padding: "14px 32px", borderRadius: 10, background: `linear-gradient(135deg, ${C.accent}, #2563eb)`, color: "#fff", cursor: "pointer", boxShadow: `0 6px 30px ${C.accent}44` }}>{t.ctaBtn1}</div>
            <div style={{ fontSize: 14, fontWeight: 600, padding: "13px 28px", borderRadius: 10, border: `1px solid ${C.slate}`, color: C.slateMuted, cursor: "pointer" }}>{t.ctaBtn2}</div>
          </div>
        </div>

        {/* ─── S9: FOOTER ─── */}
        <div id="section-footer" style={{ position: "relative", padding: "28px 20px 16px", background: C.navy, borderRadius: 12, border: `1px solid ${C.navyLight}` }}>
          <div style={sectionTag("S9 \u00b7 FOOTER", C.slateLight)}>S9</div>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.white, marginBottom: 5 }}>AEGIS CIRCULAR</div>
              <div style={{ fontSize: 8, color: C.slateLight, lineHeight: 1.8, whiteSpace: "pre-line" }}>
                {"\u00a9"} 2026 Jean-Pierre Charles{"\n"}{t.footerDesc}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 8, fontWeight: 700, color: C.slateMuted, marginBottom: 5, letterSpacing: 1 }}>{t.footerLegal}</div>
              <div style={{ fontSize: 8, color: C.slateLight, lineHeight: 2 }}>
                {t.footerLegalItems.map((item, i) => <div key={i}>{item}</div>)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 8, fontWeight: 700, color: C.slateMuted, marginBottom: 5, letterSpacing: 1 }}>{t.footerPlatform}</div>
              <div style={{ fontSize: 8, color: C.slateLight, lineHeight: 2 }}>
                {t.footerPlatItems.map((item, i) => <div key={i}>{item}</div>)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 8, fontWeight: 700, color: C.slateMuted, marginBottom: 5, letterSpacing: 1 }}>{t.footerContact}</div>
              <div style={{ fontSize: 8, color: C.slateLight, lineHeight: 2 }}>
                {t.footerContactItems.map((item, i) => <div key={i}>{item}</div>)}
              </div>
            </div>
          </div>
        </div>

        {/* ─── DELTA R2→R3 ─── */}
        <div style={{ padding: "16px 20px", background: C.navyMid, borderRadius: 12, border: `2px dashed ${C.gold}33`, marginTop: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.gold, marginBottom: 10 }}>
            {"\ud83d\udcdd"} DELTA R2 {"\u2192"} R3 {"\u2014"} Changements
          </div>
          <div style={{ fontSize: 10, color: C.slateMuted, lineHeight: 2 }}>
            <strong style={{ color: C.accent }}>i18n FR/EN :</strong> Toutes les sections sont bilingues avec toggle FR/EN dans la barre de titre ET dans la nav. Dictionnaire i18n centralis{"\u00e9"} (objet unique). Switch instantan{"\u00e9"} sans rechargement.<br />
            <strong style={{ color: C.rose }}>Encodage UTF-8 :</strong> Tous les caract{"\u00e8"}res fran{"\u00e7"}ais corrig{"\u00e9"}s ({"\u00e9\u00e8\u00ea\u00eb\u00e0\u00e7\u00f9\u00ee\u00f4"} etc.) via unicode escapes pour {"\u00e9"}viter tout probl{"\u00e8"}me d{"\u2019"}encodage.<br />
            <strong style={{ color: C.white }}>March{"\u00e9"} cible :</strong> PME/ETI industrielles europ{"\u00e9"}ennes ET internationales vendant dans l{"\u2019"}UE. Le EN couvre les entreprises UK post-Brexit, scandinaves, DACH, et extra-EU exportant vers le march{"\u00e9"} unique.<br />
            <strong style={{ color: C.white }}>Architecture :</strong> Donn{"\u00e9"}es s{"\u00e9"}par{"\u00e9"}es de la pr{"\u00e9"}sentation. Le dictionnaire i18n est la source de v{"\u00e9"}rit{"\u00e9"} pour tous les textes. Facilite l{"\u2019"}ajout futur de DE/ES/IT.
          </div>
        </div>

      </div>
    </div>
  );
}
