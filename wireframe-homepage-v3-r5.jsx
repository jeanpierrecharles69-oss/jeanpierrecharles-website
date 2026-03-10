import { useState } from "react";

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap";

/* ═══════════════════════════════════════════════════════
   WIREFRAME v3.1-alpha — R5
   jeanpierrecharles.com — Homepage B2B
   20260216T2250 — Light/Glass + Brain IA Fusion
   Claude Opus → AG Execution
   
   DELTA R4→R5:
   ✅ Hero v3.1: 2 colonnes (proposition + Brain IA live)
   ✅ ROI metrics above-the-fold (<30s, -70%, 0 non-conf, 27+)
   ✅ Photo JP médaillon dans carte Brain
   ✅ CookieBanner RGPD réintégré (Light theme)
   ✅ TrustBadges: logos clients inline + badges tech
   ✅ ParcoursRD: angle 'apport' (feedback Nico #1)
   ✅ i18n étendu: Brain, ROI, CookieBanner
   ✅ Architecture: src/components/{homepage,brain,common}/

   ⚠ BLOCKER: NE PAS git push avant V-Gate Claude Opus
   ═══════════════════════════════════════════════════════ */

/* ═══ DESIGN SYSTEM — Light / Material Glass ═══
   Source: constants.ts AG P3 (16/02/2026 12:55)
   Aligned with: antigravity.google + jeanpierrecharles.com (live)
   ═══════════════════════════════════════════════ */
const C = {
  /* Surfaces */
  bg: "#f8fafc",
  surface: "#ffffff",
  surfaceAlt: "#f1f5f9",
  surfaceHover: "#e2e8f0",
  /* Text */
  text: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#94a3b8",
  /* Borders */
  border: "rgba(15,23,42,0.08)",
  borderMed: "rgba(15,23,42,0.12)",
  borderStrong: "#e2e8f0",
  /* Glass / Material */
  glassBg: "rgba(255,255,255,0.72)",
  glassBlur: "blur(16px)",
  glassBorder: "rgba(255,255,255,0.6)",
  /* Accents */
  accent: "#3b82f6",
  accentGlow: "#60a5fa",
  emerald: "#10b981",
  emeraldDark: "#059669",
  gold: "#f59e0b",
  amber: "#d97706",
  rose: "#f43f5e",
  copper: "#c2956a",
  /* Gradients */
  gradientBlue: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
  gradientSoft: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f0fdf4 100%)",
  gradientHero: "linear-gradient(170deg, #ffffff 0%, #f0f4ff 40%, #f0fdf4 80%, #f8fafc 100%)",
  /* Shadows 3-tier */
  shadowSoft: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMed: "0 4px 12px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.03)",
  shadowLg: "0 12px 32px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)",
};

/* ═══ i18n — FR / EN ═══
   Source of Truth for ALL text content
   v3.1: +Brain IA, +ROI metrics, +CookieBanner, +ParcoursRD angle apport
   ═══════════════════════════════════════════════ */
const i18n = {
  fr: {
    navSub: "R&D MÉCATRONIQUE · COMPLIANCE IA · INDUSTRIE EU",
    navItems: ["Expertise", "Services", "Tarifs", "Contact"],
    navCta: "Essai gratuit", navLogin: "Connexion",
    euBadge: "27 États membres UE + Régions ultrapériphériques",
    heroH1a: "L\u2019ingénieur R&D", heroH1b: "qui a conçu vos systèmes,",
    heroH1c: "pilote votre conformité EU.",
    heroSub: "32 ans de développement produit mécatronique — des volants airbag Toyota aux batteries TGV 1500V — combinés à l\u2019intelligence artificielle réglementaire pour accompagner vos ETI industrielles de la veille normative à la mise en conformité opérationnelle.",
    heroCta1: "Essayer gratuitement →", heroCta2: "Voir les tarifs",
    heroTrust: [
      { icon: "🔐", text: "RGPD natif" },
      { icon: "⚡", text: "Résultats en <30s" },
      { icon: "🎯", text: "0€ pour commencer" },
    ],
    // v3.1 — Brain IA in Hero (right column)
    brainTitle: "🧠 ASSISTANT AEGIS — EN DIRECT",
    brainPlaceholder: "Posez votre question réglementaire...",
    brainExample: "Exemple : Battery Regulation 2023/1542",
    brainResponse: "Votre pack Li-ion est soumis à 4 obligations : passeport numérique (déc 2027), due diligence chaîne approvisionnement, taux recyclage 65%, déclaration empreinte carbone.",
    brainRegs: ["Battery Reg.", "AI Act", "REACH", "CRA", "Machinery", "CSRD", "ESPR", "EN 45545"],
    brainStatus: "● Prêt — Posez votre question",
    brainCaption: "IA réglementaire — 8 règlements EU maîtrisés",
    // v3.1 — ROI Metrics above-the-fold (Nico #4)
    roiMetrics: [
      { value: "<30s", label: "Analyse d\u2019impact réglementaire", sub: "vs 2-4 semaines cabinet" },
      { value: "-70%", label: "Coût veille réglementaire", sub: "50€/mois vs 1500€/jour" },
      { value: "0", label: "Non-conformité en production", sub: "Anticipée dès la conception" },
      { value: "27+", label: "États EU couverts", sub: "+ DOM-TOM, Canaries, Açores" },
    ],
    // Trust
    trustBadges: [
      { value: "32", label: "ans de R&D industrielle", sub: "Conception → Industrialisation → Série" },
      { value: "6", label: "groupes internationaux", sub: "Autoliv · Faurecia · Saft · Forsee · Bombardier · Emerson" },
      { value: "27+", label: "États membres UE couverts", sub: "+ DOM-TOM, Canaries, Açores, Madère, Réunion" },
      { value: "5", label: "secteurs mécatroniques", sub: "Auto · Batteries · Ferroviaire · MedTech · Défense" },
      { value: "50+", label: "programmes véhicules", sub: "Toyota · BMW · DS7 · Renault · Volvo · Peugeot…" },
    ],
    trustCreds: [
      "🎓 MSc Advanced Manufacturing (Coventry UK)",
      "🎓 Management Tech. (Centrale Paris)",
      "🎓 Digital Transformation (EIT Digital 2025)",
      "🔐 RGPD natif", "🇪🇺 Serveurs EU", "🤖 Config IA Déterministe",
    ],
    // v3.1 — Logos clients (TrustBadges inline)
    clientLogos: ["Autoliv", "Saft", "Faurecia", "Forsee Power", "Bombardier", "Emerson"],
    // v3.1 — Parcours angle 'apport' (Nico #1)
    parcoursTitle1: "Du bureau d\u2019études au lancement série.",
    parcoursTitle2: "32 ans de convergence produit-process.",
    parcoursSub: "Chaque réglementation que je maîtrise, je l\u2019ai d\u2019abord vécue sur le terrain — en concevant les produits qu\u2019elle encadre.",
    parcours: [
      { period: "2020–2025", company: "Autoliv", sector: "Automobile / ADAS",
        role: "Ingénieur R&D Mécatronique Sénior",
        apport: "Industrialisé les volants airbag nouvelle gen pour Toyota CH-R Europe 2024 et BMW X1 (New Klass). Piloté la cybersécurité UNECE R155/R156.",
        programs: "Toyota, BMW — Volants airbag, systèmes ADAS, cybersécurité véhicule", color: C.accent },
      { period: "2017–2020", company: "Saft (TotalEnergies)", sector: "Énergie / Batteries",
        role: "Ingénieur Systèmes Batteries",
        apport: "Conçu les systèmes batteries TGV M 1500V et batteries marines 3MWh. Assuré la conformité EN 45545 ferroviaire.",
        programs: "TGV M, batteries marines — Cycle complet, EN 45545", color: C.emerald },
      { period: "2015–2017", company: "Forsee Power", sector: "Mobilité Électrique",
        role: "Ingénieur Développement Produit",
        apport: "Développé les packs batteries bus électriques ZEN. R&D cellule-à-pack, validation thermique, certification UN 38.3.",
        programs: "Bus ZEN — Cell-to-pack, validation, certification", color: C.gold },
      { period: "1999–2015", company: "Faurecia", sector: "Automobile / Intérieurs",
        role: "Responsable Développement & Industrialisation",
        apport: "16 ans — Industrialisé les planches de bord mécatroniques pour Renault Mégane, Peugeot 308, DS7, Volvo XC40, Ford Focus.",
        programs: "50+ programmes véhicules — 7 constructeurs", color: C.rose },
      { period: "1995–1999", company: "Bombardier Transport", sector: "Ferroviaire",
        role: "Ingénieur Méthodes & Industrialisation",
        apport: "Optimisé les lignes d\u2019assemblage trains régionaux. Lean manufacturing appliqué à la production ferroviaire.",
        programs: "Trains régionaux — Lean, process", color: C.copper },
      { period: "1993–1995", company: "Emerson (Branson)", sector: "Équipements Industriels",
        role: "Responsable Bureau d\u2019Études",
        apport: "Dirigé la R&D soudage ultrasons industriel. Conception de machines spéciales pour l\u2019industrie automobile.",
        programs: "Soudage ultrasons — Machines spéciales", color: C.textMuted },
    ],
    chainTitle: "CHAÎNE DE VALEUR MAÎTRISÉE DE BOUT EN BOUT",
    chain: [
      { step: "R&D Concept", icon: "💡" }, { step: "Design Mécatronique", icon: "⚙️" },
      { step: "Prototypage", icon: "🔬" }, { step: "Validation (AMDEC/DVP&R)", icon: "✅" },
      { step: "Industrialisation", icon: "🏭" }, { step: "Lancement Série", icon: "🚀" },
      { step: "Cycle de Vie", icon: "♻️" },
    ],
    compTitle: "Pourquoi vos concurrents avancent plus vite",
    compSans: "❌ Sans Aegis",
    compSansList: [
      "Veille manuelle sur +50 sources réglementaires",
      "Consultants sans culture R&D mécatronique",
      "Rapports d\u2019impact généralistes après 2–4 semaines",
      "Aucune convergence produit/process/conformité",
      "Non-conformité détectée en production = rappels + amendes",
    ],
    compAvec: "✅ Avec Aegis",
    compAvecList: [
      "IA scanne et synthétise en temps réel",
      "Ingénieur R&D 32 ans + IA = expertise inégalée",
      "Analyse d\u2019impact spécifique produit/secteur en <30s",
      "AMDEC réglementaire intégrée au cycle de développement",
      "Conformité anticipée dès la phase de conception",
    ],
    svcTitle: "De la veille normative à l\u2019industrialisation conforme",
    services: [
      { icon: "🔍", title: "Veille réglementaire IA",
        desc: "Scan automatisé de tous les règlements EU impactant vos produits mécatroniques. Filtrage par secteur, par composant, par matériau. Alertes proactives.",
        result: "Résultat : détection d\u2019impact en <30s vs 2-4 semaines",
        tier: "→ DISCOVER (0€)", color: C.accent },
      { icon: "📊", title: "Feuille de route conformité",
        desc: "Kanban d\u2019actions priorisées par criticité + Gantt d\u2019implémentation calé sur vos jalons de développement produit (APQP/PPAP, DVP&R).",
        result: "Résultat : -70% coût veille réglementaire",
        tier: "→ STANDARD (50€/mois)", color: C.emerald },
      { icon: "🤝", title: "Ingénierie de conformité R&D",
        desc: "AMDEC réglementaire, audits produit/process, convergence conception-conformité. Interventions sur site, revues de design, accompagnement lancement série.",
        result: "Résultat : 0 non-conformité détectée en production",
        tier: "→ PREMIUM (500€/mois)", color: C.gold },
    ],
    pricingTitle: "Transparence totale. Pas de devis caché.",
    pricingSub: "Commencez gratuitement. Évoluez quand vous êtes prêt.",
    tiers: [
      { name: "DISCOVER", price: "0€", period: "", badge: null, color: C.textMuted,
        tagline: "Créer un compte gratuit",
        features: ["Recherche réglementaire basique", "1 secteur industriel", "Synthèse en ligne + PDF one-pager", "Fil d\u2019actualités sectoriel"],
        notIncluded: ["Kanban actions stratégiques", "Feuille de route Gantt", "Accompagnement expert"],
        cta: "Commencer gratuitement" },
      { name: "STANDARD", price: "50€", period: "/mois", badge: "POPULAIRE", annual: "500€/an", color: C.accent,
        tagline: "Conformité pilotée par l\u2019IA",
        features: ["Recherche réglementaire détaillée", "Tous secteurs industriels", "Kanban recommandations stratégiques", "Feuille de route Gantt PDF complet", "Fil d\u2019actualités multi-secteurs", "Rapports PDF premium"],
        notIncluded: ["Accompagnement expert dédié"],
        cta: "Démarrer l\u2019essai" },
      { name: "PREMIUM", price: "500€", period: "/mois", badge: "EXPERTISE", annual: "5 000€/an", color: C.gold,
        tagline: "Ingénieur R&D sénior + IA",
        features: ["Tout STANDARD inclus", "Accompagnement ingénieur R&D dédié", "Conf-calls & interventions sur site", "Audit conformité mécatronique personnalisé", "AMDEC réglementaire produit/process", "Feuille de route industrialisation sur mesure"],
        notIncluded: [],
        cta: "Prendre rendez-vous" },
    ],
    funnelTitle: "TUNNEL DE CONVERSION",
    funnel: ["SEO / LinkedIn", "Homepage", "DISCOVER 0€", "STANDARD 50€", "PREMIUM 500€"],
    regTitle: "Chaque règlement, vécu de l\u2019intérieur",
    regSub: "Pas de la théorie. De l\u2019expérience d\u2019implémentation sur des programmes réels.",
    regs: [
      { reg: "EU Battery Regulation", ref: "2023/1542", xp: "Saft — TGV M, Forsee — bus ZEN", sectors: "Batteries · Mobilité", color: C.emerald },
      { reg: "EU AI Act", ref: "2024/1689", xp: "Autoliv — systèmes ADAS Toyota/BMW", sectors: "Auto · ADAS", color: C.accent },
      { reg: "UNECE R155/R156", ref: "Cybersécurité véhicule", xp: "Autoliv — homologation type", sectors: "Auto · Cybersec", color: C.accent },
      { reg: "REACH", ref: "1907/2006", xp: "Faurecia — matériaux planches de bord", sectors: "Auto · Chimie", color: C.gold },
      { reg: "CSRD", ref: "2022/2464", xp: "Reporting ESG chaîne de valeur", sectors: "Transversal", color: C.emerald },
      { reg: "Ecodesign ESPR", ref: "2024/1781", xp: "Passeport numérique produit", sectors: "Transversal", color: C.copper },
      { reg: "Cyber Resilience Act", ref: "2024/2847", xp: "Produits connectés industriels", sectors: "IoT · Industrie", color: C.accent },
      { reg: "EN 45545", ref: "Sécurité incendie ferroviaire", xp: "Saft — batteries TGV", sectors: "Ferroviaire", color: C.rose },
    ],
    ctaTitle1: "Prêt à piloter votre conformité EU",
    ctaTitle2: "avec un vrai ingénieur R&D ?",
    ctaSub: "Créez votre compte gratuit en 30 secondes. Pas de carte bancaire requise.",
    ctaBtn1: "Créer mon compte gratuit →", ctaBtn2: "Nous contacter",
    // v3.1 — CookieBanner RGPD
    cookieTitle: "🔐 Respect de votre vie privée",
    cookieText: "Ce site utilise des cookies techniques essentiels et une IA hébergée sur serveurs proxy sécurisés (UE). Aucune donnée personnelle n\u2019est partagée avec des tiers.",
    cookieAccept: "Accepter", cookieReject: "Refuser", cookieMore: "En savoir plus",
    footerLegal: "LÉGAL", footerPlatform: "PLATEFORME", footerContact: "CONTACT",
    footerDesc: "Ingénierie de conformité R&D × IA\n27 États membres UE + ultrapériphériques",
    footerLegalItems: ["Politique de confidentialité", "CGV", "DPA (Art. 28 RGPD)", "Mentions légales"],
    footerPlatItems: ["Dashboard", "Tarifs", "Documentation", "Status"],
    footerContactItems: ["contact@jeanpierrecharles.com", "LinkedIn", "Formulaire"],
    sectionLabels: [
      { id: "nav", label: "NAVIGATION" }, { id: "hero", label: "HERO — R&D × IA" },
      { id: "trust", label: "CRÉDIBILITÉ TECHNIQUE" }, { id: "parcours", label: "PARCOURS R&D" },
      { id: "problem", label: "SANS / AVEC AEGIS" }, { id: "services", label: "SERVICES" },
      { id: "pricing", label: "PRICING 3 TIERS" }, { id: "reglements", label: "RÈGLEMENTS MAÎTRISÉS" },
      { id: "cta", label: "CTA FINAL" }, { id: "footer", label: "FOOTER + COOKIE" },
    ],
  },
  en: {
    navSub: "R&D MECHATRONICS · AI COMPLIANCE · EU INDUSTRY",
    navItems: ["Expertise", "Services", "Pricing", "Contact"],
    navCta: "Free trial", navLogin: "Sign in",
    euBadge: "27 EU Member States + Outermost Regions",
    heroH1a: "The R&D engineer", heroH1b: "who designed your systems,",
    heroH1c: "pilots your EU compliance.",
    heroSub: "32 years of mechatronic product development — from Toyota airbag steering wheels to TGV 1500V batteries — combined with regulatory AI to support your industrial mid-market companies from regulatory watch to operational compliance.",
    heroCta1: "Try for free →", heroCta2: "View pricing",
    heroTrust: [
      { icon: "🔐", text: "GDPR native" },
      { icon: "⚡", text: "Results in <30s" },
      { icon: "🎯", text: "€0 to start" },
    ],
    brainTitle: "🧠 AEGIS ASSISTANT — LIVE",
    brainPlaceholder: "Ask your regulatory question...",
    brainExample: "Example: Battery Regulation 2023/1542",
    brainResponse: "Your Li-ion pack is subject to 4 obligations: digital passport (Dec 2027), supply chain due diligence, 65% recycling rate, carbon footprint declaration.",
    brainRegs: ["Battery Reg.", "AI Act", "REACH", "CRA", "Machinery", "CSRD", "ESPR", "EN 45545"],
    brainStatus: "● Ready — Ask your question",
    brainCaption: "Regulatory AI — 8 EU regulations mastered",
    roiMetrics: [
      { value: "<30s", label: "Regulatory impact analysis", sub: "vs 2-4 weeks consulting" },
      { value: "-70%", label: "Regulatory watch cost", sub: "€50/mo vs €1,500/day" },
      { value: "0", label: "Non-compliance in production", sub: "Anticipated from design phase" },
      { value: "27+", label: "EU States covered", sub: "+ DOM-TOM, Canaries, Azores" },
    ],
    trustBadges: [
      { value: "32", label: "years of industrial R&D", sub: "Design → Industrialisation → Production" },
      { value: "6", label: "international groups", sub: "Autoliv · Faurecia · Saft · Forsee · Bombardier · Emerson" },
      { value: "27+", label: "EU Member States covered", sub: "+ DOM-TOM, Canaries, Azores, Madeira, Réunion" },
      { value: "5", label: "mechatronic sectors", sub: "Auto · Batteries · Rail · MedTech · Defence" },
      { value: "50+", label: "vehicle programmes", sub: "Toyota · BMW · DS7 · Renault · Volvo · Peugeot…" },
    ],
    trustCreds: [
      "🎓 MSc Advanced Manufacturing (Coventry UK)",
      "🎓 Tech. Management (Centrale Paris)",
      "🎓 Digital Transformation (EIT Digital 2025)",
      "🔐 GDPR native", "🇪🇺 EU Servers", "🤖 Deterministic AI Config",
    ],
    clientLogos: ["Autoliv", "Saft", "Faurecia", "Forsee Power", "Bombardier", "Emerson"],
    parcoursTitle1: "From engineering office to production launch.",
    parcoursTitle2: "32 years of product-process convergence.",
    parcoursSub: "Every regulation I master, I first experienced in the field — by designing the products it governs.",
    parcours: [
      { period: "2020–2025", company: "Autoliv", sector: "Automotive / ADAS",
        role: "Senior Mechatronics R&D Engineer",
        apport: "Industrialised next-gen airbag steering wheels for Toyota CH-R Europe 2024 and BMW X1 (New Klass). Led UNECE R155/R156 cybersecurity.",
        programs: "Toyota, BMW — Airbag wheels, ADAS, vehicle cybersecurity", color: C.accent },
      { period: "2017–2020", company: "Saft (TotalEnergies)", sector: "Energy / Batteries",
        role: "Battery Systems Engineer",
        apport: "Designed TGV M 1500V battery systems and 3MWh marine batteries. Ensured EN 45545 rail compliance.",
        programs: "TGV M, marine batteries — Full lifecycle, EN 45545", color: C.emerald },
      { period: "2015–2017", company: "Forsee Power", sector: "Electric Mobility",
        role: "Product Development Engineer",
        apport: "Developed ZEN electric bus battery packs. Cell-to-pack R&D, thermal validation, UN 38.3 certification.",
        programs: "ZEN bus — Cell-to-pack, validation, certification", color: C.gold },
      { period: "1999–2015", company: "Faurecia", sector: "Automotive / Interiors",
        role: "Development & Industrialisation Manager",
        apport: "16 years — Industrialised mechatronic dashboards for Renault Mégane, Peugeot 308, DS7, Volvo XC40, Ford Focus.",
        programs: "50+ vehicle programmes — 7 OEMs", color: C.rose },
      { period: "1995–1999", company: "Bombardier Transport", sector: "Rail",
        role: "Methods & Industrialisation Engineer",
        apport: "Optimised regional train assembly lines. Applied lean manufacturing to rail production.",
        programs: "Regional trains — Lean, process", color: C.copper },
      { period: "1993–1995", company: "Emerson (Branson)", sector: "Industrial Equipment",
        role: "Design Office Manager",
        apport: "Led industrial ultrasonic welding R&D. Designed special-purpose machines for automotive industry.",
        programs: "Ultrasonic welding — Special machines", color: C.textMuted },
    ],
    chainTitle: "END-TO-END VALUE CHAIN MASTERY",
    chain: [
      { step: "R&D Concept", icon: "💡" }, { step: "Mechatronic Design", icon: "⚙️" },
      { step: "Prototyping", icon: "🔬" }, { step: "Validation (FMEA/DVP&R)", icon: "✅" },
      { step: "Industrialisation", icon: "🏭" }, { step: "Production Launch", icon: "🚀" },
      { step: "Lifecycle", icon: "♻️" },
    ],
    compTitle: "Why your competitors move faster",
    compSans: "❌ Without Aegis",
    compSansList: [
      "Manual monitoring of 50+ regulatory sources",
      "Consultants with no mechatronic R&D culture",
      "Generic impact reports after 2–4 weeks",
      "No product/process/compliance convergence",
      "Non-compliance detected in production = recalls + fines",
    ],
    compAvec: "✅ With Aegis",
    compAvecList: [
      "AI scans and synthesises in real-time",
      "32-year R&D engineer + AI = unmatched expertise",
      "Product/sector-specific impact analysis in <30s",
      "Regulatory FMEA integrated into dev cycle",
      "Compliance anticipated from the design phase",
    ],
    svcTitle: "From regulatory watch to compliant industrialisation",
    services: [
      { icon: "🔍", title: "AI Regulatory Watch",
        desc: "Automated scan of all EU regulations impacting your mechatronic products. Filtering by sector, component, material. Proactive alerts.",
        result: "Result: impact detection in <30s vs 2-4 weeks",
        tier: "→ DISCOVER (€0)", color: C.accent },
      { icon: "📊", title: "Compliance Roadmap",
        desc: "Criticality-prioritised action Kanban + Gantt implementation plan aligned with your product development milestones (APQP/PPAP, DVP&R).",
        result: "Result: -70% regulatory watch cost",
        tier: "→ STANDARD (€50/mo)", color: C.emerald },
      { icon: "🤝", title: "R&D Compliance Engineering",
        desc: "Regulatory FMEA, product/process audits, design-compliance convergence. On-site interventions, design reviews, production launch support.",
        result: "Result: 0 non-compliance detected in production",
        tier: "→ PREMIUM (€500/mo)", color: C.gold },
    ],
    pricingTitle: "Full transparency. No hidden quotes.",
    pricingSub: "Start free. Scale when you\u2019re ready.",
    tiers: [
      { name: "DISCOVER", price: "€0", period: "", badge: null, color: C.textMuted,
        tagline: "Create a free account",
        features: ["Basic regulatory search", "1 industrial sector", "Online summary + PDF one-pager", "Sector news feed"],
        notIncluded: ["Strategic action Kanban", "Gantt roadmap", "Expert support"],
        cta: "Start for free" },
      { name: "STANDARD", price: "€50", period: "/mo", badge: "POPULAR", annual: "€500/yr", color: C.accent,
        tagline: "AI-powered compliance",
        features: ["Detailed regulatory search", "All industrial sectors", "Strategic recommendations Kanban", "Full Gantt PDF roadmap", "Multi-sector news feed", "Premium PDF reports"],
        notIncluded: ["Dedicated expert support"],
        cta: "Start trial" },
      { name: "PREMIUM", price: "€500", period: "/mo", badge: "EXPERTISE", annual: "€5,000/yr", color: C.gold,
        tagline: "Senior R&D Engineer + AI",
        features: ["Everything in STANDARD", "Dedicated R&D engineer support", "Conf-calls & on-site interventions", "Custom mechatronic compliance audit", "Regulatory FMEA product/process", "Bespoke industrialisation roadmap"],
        notIncluded: [],
        cta: "Book a call" },
    ],
    funnelTitle: "CONVERSION FUNNEL",
    funnel: ["SEO / LinkedIn", "Homepage", "DISCOVER €0", "STANDARD €50", "PREMIUM €500"],
    regTitle: "Every regulation, lived from the inside",
    regSub: "Not theory. Implementation experience on real programmes.",
    regs: [
      { reg: "EU Battery Regulation", ref: "2023/1542", xp: "Saft — TGV M, Forsee — ZEN bus", sectors: "Batteries · Mobility", color: C.emerald },
      { reg: "EU AI Act", ref: "2024/1689", xp: "Autoliv — Toyota/BMW ADAS systems", sectors: "Auto · ADAS", color: C.accent },
      { reg: "UNECE R155/R156", ref: "Vehicle Cybersecurity", xp: "Autoliv — type approval", sectors: "Auto · Cybersec", color: C.accent },
      { reg: "REACH", ref: "1907/2006", xp: "Faurecia — dashboard materials", sectors: "Auto · Chemistry", color: C.gold },
      { reg: "CSRD", ref: "2022/2464", xp: "Value chain ESG reporting", sectors: "Cross-sector", color: C.emerald },
      { reg: "Ecodesign ESPR", ref: "2024/1781", xp: "Digital Product Passport", sectors: "Cross-sector", color: C.copper },
      { reg: "Cyber Resilience Act", ref: "2024/2847", xp: "Connected industrial products", sectors: "IoT · Industry", color: C.accent },
      { reg: "EN 45545", ref: "Rail fire safety", xp: "Saft — TGV batteries", sectors: "Rail", color: C.rose },
    ],
    ctaTitle1: "Ready to pilot your EU compliance",
    ctaTitle2: "with a real R&D engineer?",
    ctaSub: "Create your free account in 30 seconds. No credit card required.",
    ctaBtn1: "Create my free account →", ctaBtn2: "Contact us",
    cookieTitle: "🔐 Respecting your privacy",
    cookieText: "This site uses essential technical cookies and AI hosted on secured proxy servers (EU). No personal data is shared with third parties.",
    cookieAccept: "Accept", cookieReject: "Decline", cookieMore: "Learn more",
    footerLegal: "LEGAL", footerPlatform: "PLATFORM", footerContact: "CONTACT",
    footerDesc: "R&D Compliance Engineering × AI\n27 EU Member States + outermost regions",
    footerLegalItems: ["Privacy Policy", "T&Cs", "DPA (Art. 28 GDPR)", "Legal Notice"],
    footerPlatItems: ["Dashboard", "Pricing", "Documentation", "Status"],
    footerContactItems: ["contact@jeanpierrecharles.com", "LinkedIn", "Contact form"],
    sectionLabels: [
      { id: "nav", label: "NAVIGATION" }, { id: "hero", label: "HERO — R&D × AI" },
      { id: "trust", label: "TECHNICAL CREDIBILITY" }, { id: "parcours", label: "R&D CAREER" },
      { id: "problem", label: "WITHOUT / WITH AEGIS" }, { id: "services", label: "SERVICES" },
      { id: "pricing", label: "PRICING 3 TIERS" }, { id: "reglements", label: "REGULATIONS MASTERED" },
      { id: "cta", label: "FINAL CTA" }, { id: "footer", label: "FOOTER + COOKIE" },
    ],
  },
};

const sectionColors = [C.textMuted, C.accent, C.emerald, C.copper, C.gold, C.accent, C.emeraldDark, C.gold, C.rose, C.textMuted];

const sectionTag = (label, color) => ({
  position: "absolute", top: -12, left: 16, fontSize: 9, fontWeight: 700,
  letterSpacing: 2, textTransform: "uppercase", color: "#fff",
  background: color || C.accent, padding: "2px 10px", borderRadius: 4,
  fontFamily: "'Inter', sans-serif",
});

const glassCard = (extra = {}) => ({
  background: C.glassBg, backdropFilter: C.glassBlur, WebkitBackdropFilter: C.glassBlur,
  borderRadius: 16, border: `1px solid ${C.borderStrong}`, boxShadow: C.shadowMed, ...extra,
});

/* ═══════════════════════════════════════════════════════
   COMPONENT — R5 v3.1 Light/Glass + Brain IA Fusion
   ═══════════════════════════════════════════════════════ */
export default function WireframeHomepageR5() {
  const [activeSection, setActiveSection] = useState(null);
  const [activeTier, setActiveTier] = useState(1);
  const [lang, setLang] = useState("fr");
  const [cookieVisible, setCookieVisible] = useState(true);
  const t = i18n[lang];

  return (
    <div style={{ background: C.gradientSoft, minHeight: "100vh", padding: "24px 12px", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: C.text, WebkitFontSmoothing: "antialiased" }}>
      <link href={FONT_LINK} rel="stylesheet" />

      {/* ══ TITLE BAR ══ */}
      <div style={{ maxWidth: 920, margin: "0 auto 20px", padding: "16px 20px",
        ...glassCard(), display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.5, color: C.text }}>
            WIREFRAME v3.1-alpha <span style={{ color: C.gold, fontSize: 12 }}>R5</span>
            <span style={{ fontSize: 9, color: C.rose, marginLeft: 8, fontWeight: 700 }}>FUSION Brain+Marketing</span>
          </div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
            jeanpierrecharles.com — Homepage B2B — 16/02/2026 22h50 — Light/Glass + Brain IA — i18n FR/EN
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ display: "flex", borderRadius: 20, overflow: "hidden", border: `1px solid ${C.borderStrong}` }}>
            {["fr", "en"].map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                fontSize: 10, fontWeight: 700, padding: "4px 12px", border: "none", cursor: "pointer",
                background: lang === l ? C.accent : C.surface, color: lang === l ? "#fff" : C.textMuted,
                textTransform: "uppercase", letterSpacing: 1, transition: "all 0.2s", borderRadius: 20,
              }}>{l}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {t.sectionLabels.map((s, i) => (
              <button key={s.id} onClick={() => {
                setActiveSection(activeSection === s.id ? null : s.id);
                if (activeSection !== s.id) document.getElementById(`section-${s.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
              }} style={{
                fontSize: 7, fontWeight: 700, padding: "2px 6px", borderRadius: 10,
                border: `1px solid ${activeSection === s.id ? sectionColors[i] : C.borderStrong}`,
                background: activeSection === s.id ? sectionColors[i] + "15" : C.surface,
                color: activeSection === s.id ? sectionColors[i] : C.textMuted,
                cursor: "pointer", textTransform: "uppercase", letterSpacing: 0.8, transition: "all 0.2s",
              }}>{s.label.split("—")[0].trim()}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ══ SECTIONS ══ */}
      <div style={{ maxWidth: 920, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ─── S0: NAV ─── */}
        <div id="section-nav" style={{ position: "relative", padding: "28px 20px 16px", ...glassCard() }}>
          <div style={sectionTag("S0 · NAV", C.textMuted)}>S0 · NAV</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: C.gradientBlue, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff" }}>Æ</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: -0.3, color: C.text }}>AEGIS CIRCULAR</div>
                <div style={{ fontSize: 7, color: C.textMuted, letterSpacing: 1.5 }}>{t.navSub}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
              {t.navItems.map(item => <span key={item} style={{ fontSize: 11, color: C.textSecondary, cursor: "pointer" }}>{item}</span>)}
              <div style={{ fontSize: 10, fontWeight: 700, padding: "6px 16px", borderRadius: 20, background: C.gradientBlue, color: "#fff", cursor: "pointer", boxShadow: `0 2px 8px ${C.accent}30` }}>{t.navCta}</div>
              <div style={{ fontSize: 10, fontWeight: 600, padding: "5px 14px", borderRadius: 20, border: `1px solid ${C.borderStrong}`, color: C.textSecondary, cursor: "pointer", background: C.surface }}>{t.navLogin}</div>
            </div>
          </div>
        </div>

        {/* ─── S1: HERO v3.1 — 2 COLONNES (Proposition + Brain IA) ─── */}
        <div id="section-hero" style={{ position: "relative", padding: "32px 24px 28px",
          background: C.gradientHero, borderRadius: 20, boxShadow: C.shadowLg, overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -80, right: -80, width: 280, height: 280, borderRadius: "50%", background: C.accent, opacity: 0.06, filter: "blur(60px)" }} />
          <div style={{ position: "absolute", bottom: -80, left: -80, width: 280, height: 280, borderRadius: "50%", background: C.emerald, opacity: 0.05, filter: "blur(60px)" }} />
          <div style={sectionTag("S1 · HERO v3.1", C.accent)}>S1 · HERO v3.1</div>
          <div style={{ position: "relative", display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* LEFT COLUMN — Proposition de valeur */}
            <div style={{ flex: "1 1 380px", minWidth: 280 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${C.accent}08`, border: `1px solid ${C.accent}20`, borderRadius: 20, padding: "4px 12px", marginBottom: 14 }}>
                <span style={{ fontSize: 12 }}>🇪🇺</span>
                <span style={{ fontSize: 9, color: C.accent, fontWeight: 600 }}>{t.euBadge}</span>
              </div>
              <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: 28, fontWeight: 800, lineHeight: 1.15, color: C.text, margin: "0 0 12px", letterSpacing: -1 }}>
                {t.heroH1a}<br />
                <span style={{ color: C.textSecondary }}>{t.heroH1b}</span><br />
                <span style={{ backgroundImage: C.gradientBlue, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{t.heroH1c}</span>
              </h1>
              <p style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.65, maxWidth: 400, margin: "0 0 10px" }}>{t.heroSub}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                {t.clientLogos.map((co, i) => (
                  <span key={i} style={{ fontSize: 8, padding: "2px 8px", borderRadius: 8, background: C.surface, border: `1px solid ${C.borderStrong}`, color: C.textSecondary, fontWeight: 600 }}>{co}</span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <div style={{ fontSize: 13, fontWeight: 700, padding: "12px 24px", borderRadius: 20, background: C.gradientBlue, color: "#fff", cursor: "pointer", boxShadow: `0 4px 14px ${C.accent}30` }}>{t.heroCta1}</div>
                <div style={{ fontSize: 13, fontWeight: 600, padding: "11px 22px", borderRadius: 20, border: `1px solid ${C.borderStrong}`, color: C.textSecondary, cursor: "pointer", background: C.surface }}>{t.heroCta2}</div>
              </div>
              <div style={{ display: "flex", gap: 14, marginTop: 14, flexWrap: "wrap" }}>
                {t.heroTrust.map((tr, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 11 }}>{tr.icon}</span>
                    <span style={{ fontSize: 9, color: C.textMuted, fontWeight: 600 }}>{tr.text}</span>
                  </div>
                ))}
              </div>
              {/* v3.1 — ROI Metrics inline */}
              <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                {t.roiMetrics.map((m, i) => (
                  <div key={i} style={{ textAlign: "center", padding: "8px 10px", background: C.surface, borderRadius: 10, border: `1px solid ${C.borderStrong}`, flex: "1 1 80px", boxShadow: C.shadowSoft }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: [C.accent, C.emerald, "#7c3aed", C.amber][i] }}>{m.value}</div>
                    <div style={{ fontSize: 7, fontWeight: 700, color: C.text, marginTop: 2 }}>{m.label}</div>
                    <div style={{ fontSize: 6, color: C.textMuted, marginTop: 1 }}>{m.sub}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* RIGHT COLUMN — Brain IA Live (v3.1 AegisChat) */}
            <div style={{ flex: "0 0 320px", minWidth: 280, ...glassCard({ padding: 14 }), background: "rgba(255,255,255,0.88)", boxShadow: C.shadowLg }}
                 aria-label="AEGIS Brain IA Preview">
              {/* v3.1 — Photo JP médaillon */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", background: C.gradientBlue,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 800, color: "#fff", border: "2px solid #fff",
                  boxShadow: C.shadowMed,
                }}>JP</div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: C.text }}>Jean-Pierre Charles</div>
                  <div style={{ fontSize: 7, color: C.textMuted }}>32 ans R&D · 6 groupes · 8 règlements EU</div>
                </div>
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.accent, marginBottom: 8, textAlign: "center" }}>
                {t.brainTitle}
              </div>
              {/* Chat simulation */}
              <div style={{ background: C.surfaceAlt, borderRadius: 10, padding: 10, marginBottom: 8, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 8, color: C.textMuted, marginBottom: 4 }}>{t.brainExample}</div>
                <div style={{ fontSize: 9, color: C.text, lineHeight: 1.5, padding: "6px 8px", background: C.surface, borderRadius: 8, border: `1px solid ${C.border}` }}>
                  "{t.brainResponse}"
                </div>
              </div>
              {/* Regulation badges */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3, justifyContent: "center", marginBottom: 8 }}>
                {t.brainRegs.map((r, i) => (
                  <span key={i} style={{ fontSize: 7, padding: "2px 6px", borderRadius: 10, background: `${C.accent}10`, color: C.accent, fontWeight: 600, border: `1px solid ${C.accent}20` }}>{r}</span>
                ))}
              </div>
              {/* Input placeholder */}
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <div style={{ flex: 1, fontSize: 8, color: C.textMuted, padding: "7px 10px", borderRadius: 20, background: C.surface, border: `1px solid ${C.borderStrong}` }}>
                  {t.brainPlaceholder}
                </div>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.gradientBlue, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", cursor: "pointer" }}>→</div>
              </div>
              <div style={{ textAlign: "center", marginTop: 8, fontSize: 8, color: C.emerald, fontWeight: 700 }}>{t.brainStatus}</div>
              <div style={{ fontSize: 7, color: C.textMuted, textAlign: "center", marginTop: 4, fontStyle: "italic" }}>{t.brainCaption}</div>
            </div>
          </div>
        </div>

        {/* ─── S2: TRUST + Client Logos ─── */}
        <div id="section-trust" style={{ position: "relative", padding: "28px 20px 16px", ...glassCard({ borderLeft: `3px solid ${C.emerald}` }) }}>
          <div style={sectionTag("S2 · TRUST", C.emerald)}>S2 · TRUST</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            {t.trustBadges.map((b, i) => (
              <div key={i} style={{ textAlign: "center", padding: "12px 14px", minWidth: 130, flex: "1 1 130px", background: C.surface, borderRadius: 14, border: `1px solid ${C.borderStrong}`, boxShadow: C.shadowSoft }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: C.emerald }}>{b.value}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.text, margin: "4px 0" }}>{b.label}</div>
                <div style={{ fontSize: 7, color: C.textMuted }}>{b.sub}</div>
              </div>
            ))}
          </div>
          {/* v3.1 — Client logos inline */}
          <div style={{ marginTop: 12, display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", padding: "8px 0", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
            {t.clientLogos.map((logo, i) => (
              <span key={i} style={{ fontSize: 9, fontWeight: 600, color: C.textMuted, padding: "4px 12px", borderRadius: 8, background: C.surfaceAlt, border: `1px solid ${C.borderStrong}` }}>{logo}</span>
            ))}
          </div>
          <div style={{ marginTop: 10, display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
            {t.trustCreds.map((b, i) => (
              <span key={i} style={{ fontSize: 7, color: C.textSecondary, background: C.surfaceAlt, padding: "3px 10px", borderRadius: 10, border: `1px solid ${C.borderStrong}` }}>{b}</span>
            ))}
          </div>
        </div>

        {/* ─── S3: PARCOURS R&D — angle 'apport' (v3.1 Nico #1) ─── */}
        <div id="section-parcours" style={{ position: "relative", padding: "28px 20px 16px",
          background: C.surface, borderRadius: 20, border: `1px solid ${C.borderStrong}`, boxShadow: C.shadowMed }}>
          <div style={sectionTag("S3 · R&D", C.copper)}>S3 · R&D</div>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>
              {t.parcoursTitle1}<br /><span style={{ color: C.copper }}>{t.parcoursTitle2}</span>
            </div>
            <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 6 }}>{t.parcoursSub}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {t.parcours.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "12px 14px", background: C.surfaceAlt, borderRadius: 12, border: `1px solid ${C.borderStrong}`, borderLeft: `3px solid ${p.color}`, boxShadow: C.shadowSoft }}>
                <div style={{ flexShrink: 0, width: 80 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: p.color }}>{p.period}</div>
                  <div style={{ fontSize: 8, color: C.textMuted, marginTop: 2 }}>{p.sector}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{p.company}</span>
                    <span style={{ fontSize: 9, color: C.textSecondary }}>— {p.role}</span>
                  </div>
                  {/* v3.1 — Angle 'apport' mis en avant */}
                  <div style={{ fontSize: 10, color: C.text, marginTop: 4, lineHeight: 1.5, fontWeight: 600, padding: "4px 8px", background: `${p.color}08`, borderRadius: 6, border: `1px solid ${p.color}15` }}>
                    💪 {p.apport}
                  </div>
                  <div style={{ fontSize: 8, color: C.textMuted, marginTop: 3 }}>{p.programs}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: 12, background: C.surfaceAlt, borderRadius: 12, border: `1px solid ${C.borderStrong}` }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.copper, textAlign: "center", marginBottom: 8, letterSpacing: 1 }}>{t.chainTitle}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, flexWrap: "wrap" }}>
              {t.chain.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ fontSize: 8, fontWeight: 600, padding: "4px 8px", borderRadius: 8, background: `${C.copper}08`, border: `1px solid ${C.copper}18`, color: C.copper, textAlign: "center" }}>
                    <div style={{ fontSize: 12 }}>{s.icon}</div>
                    <div style={{ marginTop: 2 }}>{s.step}</div>
                  </div>
                  {i < 6 && <span style={{ color: C.textMuted, fontSize: 10 }}>→</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── S4: SANS / AVEC ─── */}
        <div id="section-problem" style={{ position: "relative", padding: "28px 20px 16px", background: C.surfaceAlt, borderRadius: 16, border: `1px solid ${C.borderStrong}` }}>
          <div style={sectionTag("S4 · COMPARATIF", C.gold)}>S4</div>
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{t.compTitle}</div>
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 260, background: C.surface, borderRadius: 14, padding: 14, border: `1px solid ${C.rose}18`, boxShadow: C.shadowSoft }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.rose, marginBottom: 8 }}>{t.compSans}</div>
              {t.compSansList.map((item, i) => (
                <div key={i} style={{ fontSize: 10, color: C.textSecondary, padding: "3px 0", display: "flex", gap: 5 }}>
                  <span style={{ color: C.rose, fontSize: 9 }}>✗</span> {item}
                </div>
              ))}
            </div>
            <div style={{ flex: 1, minWidth: 260, background: C.surface, borderRadius: 14, padding: 14, border: `1px solid ${C.emerald}18`, boxShadow: C.shadowSoft }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.emerald, marginBottom: 8 }}>{t.compAvec}</div>
              {t.compAvecList.map((item, i) => (
                <div key={i} style={{ fontSize: 10, color: C.textSecondary, padding: "3px 0", display: "flex", gap: 5 }}>
                  <span style={{ color: C.emerald, fontSize: 9 }}>✔</span> {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── S5: SERVICES (v3.1 +result quantifié) ─── */}
        <div id="section-services" style={{ position: "relative", padding: "28px 20px 16px", ...glassCard() }}>
          <div style={sectionTag("S5 · SERVICES", C.accent)}>S5</div>
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{t.svcTitle}</div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            {t.services.map((svc, i) => (
              <div key={i} style={{ flex: "1 1 240px", maxWidth: 280, padding: 14, background: C.surface, borderRadius: 14, border: `1px solid ${C.borderStrong}`, boxShadow: C.shadowSoft }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{svc.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: svc.color, marginBottom: 5 }}>{svc.title}</div>
                <div style={{ fontSize: 9, color: C.textSecondary, lineHeight: 1.6, marginBottom: 6 }}>{svc.desc}</div>
                <div style={{ fontSize: 8, fontWeight: 700, color: svc.color, padding: "3px 8px", background: `${svc.color}08`, borderRadius: 6, marginBottom: 6 }}>{svc.result}</div>
                <div style={{ fontSize: 8, fontWeight: 700, color: svc.color, opacity: 0.7 }}>{svc.tier}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── S6: PRICING ─── */}
        <div id="section-pricing" style={{ position: "relative", padding: "28px 20px 16px",
          background: C.surface, borderRadius: 20, border: `1px solid ${C.borderStrong}`, boxShadow: C.shadowMed }}>
          <div style={sectionTag("S6 · PRICING", C.emeraldDark)}>S6</div>
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{t.pricingTitle}</div>
            <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 4 }}>{t.pricingSub}</div>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {t.tiers.map((tier, i) => (
              <div key={i} onClick={() => setActiveTier(i)} style={{
                flex: "1 1 220px", maxWidth: 265, padding: "18px 14px", background: C.surface, borderRadius: 16, cursor: "pointer",
                border: `2px solid ${activeTier===i ? tier.color : C.borderStrong}`,
                boxShadow: activeTier===i ? C.shadowLg : C.shadowSoft,
                transition: "all 0.3s", position: "relative", transform: activeTier===i ? "scale(1.02)" : "scale(1)" }}>
                {tier.badge && <div style={{ position: "absolute", top: -10, right: 14, fontSize: 8, fontWeight: 800, padding: "2px 10px", borderRadius: 10, background: tier.color, color: "#fff", letterSpacing: 1 }}>{tier.badge}</div>}
                <div style={{ fontSize: 10, color: tier.color, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 5 }}>{tier.name}</div>
                <div style={{ fontSize: 30, fontWeight: 800, color: C.text, marginBottom: 2 }}>
                  {tier.price}<span style={{ fontSize: 12, color: C.textMuted, fontWeight: 400 }}>{tier.period}</span>
                </div>
                {tier.annual && <div style={{ fontSize: 9, color: C.emerald, marginBottom: 6 }}>{lang==="fr" ? "ou" : "or"} {tier.annual} (−17%)</div>}
                <div style={{ fontSize: 9, color: C.textMuted, marginBottom: 10, fontStyle: "italic" }}>{tier.tagline}</div>
                {tier.features.map((f, fi) => (
                  <div key={fi} style={{ fontSize: 9, color: C.textSecondary, padding: "3px 0", display: "flex", gap: 5 }}>
                    <span style={{ color: C.emerald, fontSize: 9, flexShrink: 0 }}>✔</span> {f}
                  </div>
                ))}
                {tier.notIncluded.map((f, fi) => (
                  <div key={fi} style={{ fontSize: 9, color: C.textMuted, padding: "3px 0", display: "flex", gap: 5 }}>
                    <span style={{ color: C.textMuted, fontSize: 9, flexShrink: 0 }}>✗</span> {f}
                  </div>
                ))}
                <div style={{ marginTop: 12, textAlign: "center", fontSize: 10, fontWeight: 700, padding: "9px 14px", borderRadius: 20, cursor: "pointer",
                  background: i===1 ? C.gradientBlue : C.surface,
                  border: i===1 ? "none" : `1px solid ${tier.color}33`, color: i===1 ? "#fff" : tier.color,
                  boxShadow: i===1 ? `0 4px 14px ${tier.color}30` : "none" }}>{tier.cta}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, background: C.surfaceAlt, borderRadius: 12, padding: 12, border: `1px solid ${C.borderStrong}` }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.textMuted, textAlign: "center", marginBottom: 6, letterSpacing: 1 }}>{t.funnelTitle}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, flexWrap: "wrap" }}>
              {t.funnel.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ fontSize: 8, fontWeight: 700, padding: "3px 8px", borderRadius: 8, background: [C.textMuted, C.textMuted, C.textMuted, C.accent, C.gold][i]+"10", border: `1px solid ${[C.textMuted, C.textMuted, C.textMuted, C.accent, C.gold][i]}20`, color: [C.textMuted, C.textMuted, C.textMuted, C.accent, C.gold][i] }}>{s}</div>
                  {i < 4 && <span style={{ color: C.textMuted, fontSize: 11 }}>→</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── S7: REGLEMENTS ─── */}
        <div id="section-reglements" style={{ position: "relative", padding: "28px 20px 16px", ...glassCard({ borderLeft: `3px solid ${C.gold}` }) }}>
          <div style={sectionTag("S7 · REGS", C.gold)}>S7</div>
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{t.regTitle}</div>
            <div style={{ fontSize: 10, color: C.textSecondary, marginTop: 4 }}>{t.regSub}</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {t.regs.map((r, i) => (
              <div key={i} style={{ flex: "1 1 200px", maxWidth: 220, padding: 10, background: C.surface, borderRadius: 10, border: `1px solid ${C.borderStrong}`, borderLeft: `3px solid ${r.color}`, boxShadow: C.shadowSoft }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: r.color }}>{r.reg}</div>
                <div style={{ fontSize: 8, color: C.textSecondary, marginTop: 2 }}>{r.ref}</div>
                <div style={{ fontSize: 8, color: C.textMuted, marginTop: 4, fontStyle: "italic" }}>🏭 {r.xp}</div>
                <div style={{ fontSize: 7, color: C.textMuted, marginTop: 3 }}>{r.sectors}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── S8: CTA FINAL ─── */}
        <div id="section-cta" style={{ position: "relative", padding: "28px 24px", overflow: "hidden",
          background: C.gradientSoft, borderRadius: 20, border: `1px solid ${C.accent}20`, textAlign: "center", boxShadow: C.shadowLg }}>
          <div style={{ position: "absolute", top: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: C.accent, opacity: 0.04, filter: "blur(40px)" }} />
          <div style={{ position: "absolute", bottom: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: C.emerald, opacity: 0.04, filter: "blur(40px)" }} />
          <div style={sectionTag("S8 · CTA", C.rose)}>S8</div>
          <div style={{ position: "relative", fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 8 }}>
            {t.ctaTitle1}<br /><span style={{ backgroundImage: C.gradientBlue, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{t.ctaTitle2}</span>
          </div>
          <div style={{ fontSize: 12, color: C.textSecondary, marginBottom: 16 }}>{t.ctaSub}</div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <div style={{ fontSize: 14, fontWeight: 700, padding: "14px 32px", borderRadius: 20, background: C.gradientBlue, color: "#fff", cursor: "pointer", boxShadow: `0 6px 24px ${C.accent}30` }}>{t.ctaBtn1}</div>
            <div style={{ fontSize: 14, fontWeight: 600, padding: "13px 28px", borderRadius: 20, border: `1px solid ${C.borderStrong}`, color: C.textSecondary, cursor: "pointer", background: C.surface }}>{t.ctaBtn2}</div>
          </div>
        </div>

        {/* ─── S9: FOOTER ─── */}
        <div id="section-footer" style={{ position: "relative", padding: "28px 20px 16px", background: C.surfaceAlt, borderRadius: 16, borderTop: `1px solid ${C.borderStrong}` }}>
          <div style={sectionTag("S9 · FOOTER", C.textMuted)}>S9</div>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 5 }}>AEGIS CIRCULAR</div>
              <div style={{ fontSize: 8, color: C.textSecondary, lineHeight: 1.8, whiteSpace: "pre-line" }}>
                © 2026 Jean-Pierre Charles{"\n"}{t.footerDesc}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 8, fontWeight: 700, color: C.textMuted, marginBottom: 5, letterSpacing: 1 }}>{t.footerLegal}</div>
              <div style={{ fontSize: 8, color: C.textSecondary, lineHeight: 2 }}>
                {t.footerLegalItems.map((item, i) => <div key={i}>{item}</div>)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 8, fontWeight: 700, color: C.textMuted, marginBottom: 5, letterSpacing: 1 }}>{t.footerPlatform}</div>
              <div style={{ fontSize: 8, color: C.textSecondary, lineHeight: 2 }}>
                {t.footerPlatItems.map((item, i) => <div key={i}>{item}</div>)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 8, fontWeight: 700, color: C.textMuted, marginBottom: 5, letterSpacing: 1 }}>{t.footerContact}</div>
              <div style={{ fontSize: 8, color: C.textSecondary, lineHeight: 2 }}>
                {t.footerContactItems.map((item, i) => <div key={i}>{item}</div>)}
              </div>
            </div>
          </div>
        </div>

        {/* ─── v3.1 COOKIE BANNER RGPD ─── */}
        {cookieVisible && (
          <div style={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1000,
            background: C.glassBg, backdropFilter: C.glassBlur, WebkitBackdropFilter: C.glassBlur,
            borderTop: `1px solid ${C.borderStrong}`, boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
            padding: "14px 24px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
            justifyContent: "center",
          }}>
            <div style={{ flex: "1 1 400px", maxWidth: 600 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 3 }}>{t.cookieTitle}</div>
              <div style={{ fontSize: 9, color: C.textSecondary, lineHeight: 1.5 }}>{t.cookieText}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setCookieVisible(false)} style={{ fontSize: 10, fontWeight: 700, padding: "8px 20px", borderRadius: 20, border: "none", background: C.gradientBlue, color: "#fff", cursor: "pointer", boxShadow: `0 2px 8px ${C.accent}30` }}>{t.cookieAccept}</button>
              <button onClick={() => setCookieVisible(false)} style={{ fontSize: 10, fontWeight: 600, padding: "7px 16px", borderRadius: 20, border: `1px solid ${C.borderStrong}`, background: C.surface, color: C.textSecondary, cursor: "pointer" }}>{t.cookieReject}</button>
              <button style={{ fontSize: 9, fontWeight: 500, padding: "7px 12px", borderRadius: 20, border: "none", background: "transparent", color: C.accent, cursor: "pointer", textDecoration: "underline" }}>{t.cookieMore}</button>
            </div>
          </div>
        )}

        {/* ─── DELTA R4→R5 ─── */}
        <div style={{ padding: "16px 20px", background: C.surface, borderRadius: 12, border: `2px dashed ${C.gold}30`, marginTop: 8, boxShadow: C.shadowSoft }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.gold, marginBottom: 10 }}>
            📝 DELTA R4 → R5 — 16/02/2026 22h50
          </div>
          <div style={{ fontSize: 10, color: C.textSecondary, lineHeight: 2 }}>
            <strong style={{ color: C.accent }}>Hero v3.1 — 2 colonnes :</strong> GAUCHE = proposition de valeur + CTA + ROI metrics inline. DROITE = Brain IA live (AegisChat) avec chat simulation, 8 badges règlements, input placeholder. Médaillon photo JP en haut de la carte Brain.<br />
            <strong style={{ color: C.emerald }}>ROI Metrics above-the-fold (Nico #4) :</strong> 4 métriques {'<'}30s / -70% / 0 non-conf / 27+ États visibles dans le Hero, non plus dans une section séparée. Répond directement à "que leur apportes-tu? Combien?"<br />
            <strong style={{ color: C.rose }}>ParcoursRD angle 'apport' (Nico #1) :</strong> Champ `apport` ajouté à chaque expérience — mis en avant visuellement avec fond coloré. Montre ce que JP a apporté, pas juste où il a travaillé.<br />
            <strong style={{ color: "#7c3aed" }}>CookieBanner RGPD :</strong> Réintégré depuis v2.6, adapté Light/Glass theme. Position fixed bottom, glass blur. Texte corrigé : "IA hébergée sur serveurs proxy sécurisés" (pas Google).<br />
            <strong style={{ color: C.copper }}>TrustBadges — Logos clients :</strong> Ligne de logos inline (Autoliv, Saft, Faurecia, Forsee, Bombardier, Emerson) + badge "Config IA Déterministe".<br />
            <strong style={{ color: C.text }}>Services — Résultats quantifiés :</strong> Champ `result` ajouté par service avec résultat concret chiffré.<br />
            <strong style={{ color: C.text }}>i18n v3.1 :</strong> +brain*, +roiMetrics, +cookie*, +clientLogos, +apport (parcours), +result (services). FR + EN complet.<br />
            <strong style={{ color: C.rose }}>⚠ REGRESSION-1 :</strong> aria-label préservé sur Brain card (pas role=presentation). Même pattern que R4.<br />
            <strong style={{ color: C.rose }}>⚠ BLOCKER :</strong> NE PAS git push main avant V-Gate fusion Claude Opus.
          </div>
        </div>

        {/* ─── ARCHITECTURE v3.1 MAPPING ─── */}
        <div style={{ padding: "16px 20px", background: C.surface, borderRadius: 12, border: `1px solid ${C.borderStrong}`, marginTop: 4, boxShadow: C.shadowSoft }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.accent, marginBottom: 8 }}>
            📁 Architecture v3.1 — Mapping fichiers
          </div>
          <div style={{ fontSize: 9, color: C.textSecondary, lineHeight: 2, fontFamily: "monospace" }}>
            src/components/homepage/ — S0-S9 (base v3.0 = GARDER)<br />
            src/components/brain/AegisChat.tsx — NOUVEAU (fusion AegisInline + AiAssistant Light/Glass)<br />
            src/components/common/CookieBanner.tsx — NOUVEAU (adapté v2.6 → Light theme)<br />
            src/services/geminiService.ts — COPIÉ tel quel depuis services/<br />
            src/services/regulationKnowledgeService.ts — COPIÉ tel quel<br />
            src/data/reglements-europeens-2024.json — COPIÉ tel quel<br />
            src/components/homepage/i18n.ts — ÉTENDU (+brain, +roi, +cookie, +apport, +result)<br />
            src/components/homepage/constants.ts — INCHANGÉ (design system Light/Glass)<br />
            public/jpc.jpg — Photo JP (à fournir)<br />
            public/images/clients/ — Logos SVG/PNG (placeholder si pas dispo)
          </div>
        </div>

      </div>
    </div>
  );
}
