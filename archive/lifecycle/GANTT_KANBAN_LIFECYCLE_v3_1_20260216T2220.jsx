import { useState, useMemo } from "react";

const NOW_DAY = 3;

const C = {
  bg: "#f0f4f8", surface: "rgba(255,255,255,0.72)", card: "rgba(255,255,255,0.55)",
  glass: "rgba(255,255,255,0.6)", glassBorder: "rgba(255,255,255,0.85)",
  border: "rgba(148,163,184,0.25)", borderHi: "rgba(148,163,184,0.4)",
  text: "#1e293b", textMuted: "#475569", textDim: "#94a3b8",
  accent: "#d97706", accentBg: "rgba(217,119,6,0.08)", accentBorder: "rgba(217,119,6,0.25)",
  red: "#dc2626", redBg: "rgba(220,38,38,0.06)", redBorder: "rgba(220,38,38,0.2)",
  green: "#059669", greenBg: "rgba(5,150,105,0.06)", greenBorder: "rgba(5,150,105,0.2)",
  blue: "#2563eb", blueBg: "rgba(37,99,235,0.06)", blueBorder: "rgba(37,99,235,0.2)",
  purple: "#7c3aed", purpleBg: "rgba(124,58,237,0.06)", purpleBorder: "rgba(124,58,237,0.2)",
  gold: "#b45309", copper: "#92400e", rose: "#be123c",
  shadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
  shadowSm: "0 1px 8px rgba(0,0,0,0.04)",
  blur: "blur(16px)", blurSm: "blur(8px)",
};

const CALENDAR = [
  { idx:0,  date:"13/02", day:"Jeu", type:"work",    h:8, label:"J1" },
  { idx:1,  date:"14/02", day:"Ven", type:"work",    h:8, label:"J2" },
  { idx:2,  date:"15/02", day:"Sam", type:"weekend", h:5, label:"J3" },
  { idx:3,  date:"16/02", day:"Dim", type:"weekend", h:5, label:"J4" },
  { idx:4,  date:"17/02", day:"Lun", type:"work",    h:8, label:"J5" },
  { idx:5,  date:"18/02", day:"Mar", type:"work",    h:8, label:"J6" },
  { idx:6,  date:"19/02", day:"Mer", type:"work",    h:8, label:"J7" },
  { idx:7,  date:"20/02", day:"Jeu", type:"work",    h:8, label:"J8" },
  { idx:8,  date:"21/02", day:"Ven", type:"work",    h:8, label:"J9" },
  { idx:9,  date:"22/02", day:"Sam", type:"weekend", h:5, label:"J10" },
  { idx:10, date:"23/02", day:"Dim", type:"weekend", h:5, label:"J11" },
  { idx:11, date:"24/02", day:"Lun", type:"work",    h:8, label:"J12" },
  { idx:12, date:"25/02", day:"Mar", type:"work",    h:8, label:"J13" },
  { idx:13, date:"26/02", day:"Mer", type:"work",    h:8, label:"J14" },
];

const PHASES = [
  { id:"P0", name:"AUDIT & CONVERGENCE", color:C.red, bg:C.redBg, border:C.redBorder, days:[0],
    tasks: [
      { name:"Convergence Claude*AG - arbitrage JP", days:[0], owner:"Claude+AG+JP", critical:true, status:"done" },
      { name:"MAJ AEGIS_REGISTRE_TRACABILITE (entree v3.0)", days:[0], owner:"JP", critical:true, status:"done" },
      { name:"Architecture cible homepage B2B (wireframe R1)", days:[0], owner:"Claude+JP", critical:true, status:"done" },
      { name:"REX v2.6.0 - checklist formalisee", days:[0], owner:"Claude", critical:false, status:"done" },
      { name:"Convergence 3D (Unity/Unreal) - NO-GO v3.0", days:[0,1], owner:"Claude+JP", critical:false, status:"done" },
    ],
  },
  { id:"P1", name:"ARCHITECTURE & SPECS", color:C.accent, bg:C.accentBg, border:C.accentBorder, days:[1,2,3],
    tasks: [
      { name:"Wireframe R2 (focus R&D mecatronique)", days:[1], owner:"Claude+JP", critical:true, status:"done" },
      { name:"Wireframe R3 (bilingue enrichi)", days:[1,2], owner:"Claude", critical:true, status:"done" },
      { name:"Contre-expertise AG fichiers fondation", days:[1,2], owner:"Claude", critical:true, status:"done" },
      { name:"constants.ts + i18n.ts S0-S4 + LangContext.tsx", days:[2], owner:"AG", critical:true, status:"done" },
      { name:"Migration Dark-Light/Glass P1-P2-P3", days:[2,3], owner:"AG", critical:true, status:"done" },
      { name:"Audit V&V Phase 3 (13 fichiers)", days:[3], owner:"Claude", critical:true, status:"done" },
      { name:"i18n.ts S5-S9 + composants S5-S9", days:[2,3], owner:"AG nuit", critical:true, status:"done" },
      { name:"REGRESSION-1 role=presentation (wireframe R4)", days:[3], owner:"Claude+JP", critical:true, status:"done" },
      { name:"RAG ChatGPT - synthese executive CV", days:[2,3], owner:"Claude", critical:false, status:"done" },
      { name:"Scan visuel prod vs localhost + audit gap v2.6/v3.0", days:[3], owner:"Claude", critical:true, status:"done" },
      { name:"Proposition strategique v3.1 EISaaS + Brief AG", days:[3], owner:"Claude", critical:true, status:"done" },
      { name:"Integration feedback Nico (5 points traces)", days:[3], owner:"Claude", critical:true, status:"done" },
      { name:"Spec Stripe (produit, webhook, flow)", days:[3,4], owner:"Claude", critical:true, status:"todo" },
      { name:"Spec Supabase (schema DB, auth, RLS)", days:[3,4], owner:"Claude", critical:true, status:"todo" },
      { name:"Page /politique RGPD complete", days:[4], owner:"Claude", critical:false, status:"todo" },
    ],
  },
  { id:"P1B", name:"FUSION v2.6+v3.0 → v3.1", color:C.rose||C.red, bg:"rgba(190,18,60,0.06)", border:"rgba(190,18,60,0.2)", days:[3,4,5],
    tasks: [
      { name:"Copier services/ + data/ vers src/ (0 modif)", days:[3,4], owner:"AG nuit", critical:true, status:"doing" },
      { name:"Creer src/components/brain/AegisChat.tsx (Light/Glass)", days:[3,4], owner:"AG nuit", critical:true, status:"doing" },
      { name:"HeroSection v3.1 : 2 colonnes + Brain IA integre", days:[4], owner:"AG", critical:true, status:"todo" },
      { name:"TrustBadges : metriques ROI (<30s, -70%, 0, 27+)", days:[4], owner:"AG", critical:true, status:"todo" },
      { name:"ParcoursRD : reformulation angle 'apport' (Nico)", days:[4], owner:"AG", critical:false, status:"todo" },
      { name:"CookieBanner Light + import App.tsx", days:[4], owner:"AG", critical:true, status:"todo" },
      { name:"Photo JP medaillon dans carte Brain", days:[4,5], owner:"JP+AG", critical:false, status:"todo" },
      { name:"Logos clients /public/images/clients/", days:[4,5], owner:"JP+AG", critical:false, status:"todo" },
      { name:"i18n.ts extension Brain FR/EN", days:[4], owner:"AG", critical:true, status:"todo" },
      { name:"V&V fusion Claude Opus (10 criteres V-Gate)", days:[4,5], owner:"Claude", critical:true, status:"todo" },
    ],
  },
  { id:"P2", name:"IMPLEMENTATION CORE B2B", color:C.blue, bg:C.blueBg, border:C.blueBorder, days:[5,6,7,8],
    tasks: [
      { name:"Homepage v3.1 fusionnee - npm run build + deploy", days:[5], owner:"JP+AG", critical:true, status:"todo" },
      { name:"Supabase Auth (email + magic link)", days:[5,6], owner:"AG-Claude", critical:true, status:"todo" },
      { name:"Dashboard MVP DISCOVER (recherche basique)", days:[6,7], owner:"AG", critical:true, status:"todo" },
      { name:"Dashboard MVP STANDARD (Kanban + Gantt)", days:[7], owner:"AG", critical:true, status:"todo" },
      { name:"Stripe Checkout + Billing (3 tiers)", days:[7,8], owner:"AG-Claude", critical:true, status:"todo" },
      { name:"PDF generation (one-pager + rapport)", days:[8], owner:"AG", critical:false, status:"todo" },
      { name:"Webhooks Stripe - Supabase", days:[8], owner:"AG-Claude", critical:true, status:"todo" },
      { name:"Formulaire contact", days:[8], owner:"AG", critical:false, status:"todo" },
      { name:"SEO fondamental (sitemap, robots, Schema.org)", days:[8], owner:"AG", critical:false, status:"todo" },
    ],
  },
  { id:"P3", name:"V&V + POLISH", color:C.purple, bg:C.purpleBg, border:C.purpleBorder, days:[9,10,11],
    tasks: [
      { name:"V-Gate Build (0 erreur TS)", days:[9], owner:"JP+Claude", critical:true, status:"todo" },
      { name:"V-Gate Secrets (grep dist/)", days:[9], owner:"Claude", critical:true, status:"todo" },
      { name:"V-Gate Auth (inscription-login-logout)", days:[9], owner:"JP", critical:true, status:"todo" },
      { name:"V-Gate Stripe (checkout-webhook-abo test)", days:[9,10], owner:"JP+Claude", critical:true, status:"todo" },
      { name:"V-Gate Tier gating (DISCOVER vs STANDARD)", days:[10], owner:"JP", critical:true, status:"todo" },
      { name:"V-Gate PDF (one-pager + rapport)", days:[10], owner:"JP", critical:false, status:"todo" },
      { name:"V-Gate RGPD (bandeau + /politique + IA)", days:[10], owner:"Claude", critical:true, status:"todo" },
      { name:"V-Gate Brain IA (streaming + 8 badges + i18n)", days:[10], owner:"Claude+JP", critical:true, status:"todo" },
      { name:"V-Gate Multi-nav (Chrome/FF/Safari/Edge)", days:[11], owner:"JP", critical:false, status:"todo" },
      { name:"V-Gate Mobile (Lighthouse >=85)", days:[11], owner:"JP+Claude", critical:false, status:"todo" },
      { name:"Cross-validation AG*Claude finale", days:[11], owner:"Claude+AG", critical:true, status:"todo" },
      { name:"V-Gate Rollback Vercel teste", days:[11], owner:"JP", critical:false, status:"todo" },
    ],
  },
  { id:"P4", name:"DEPLOIEMENT PRODUCTION", color:C.green, bg:C.greenBg, border:C.greenBorder, days:[12,13],
    tasks: [
      { name:"Corrections issues V-Gate", days:[12], owner:"AG", critical:true, status:"todo" },
      { name:"Vercel env vars B2B (Supabase+Stripe+Gemini)", days:[12], owner:"JP", critical:true, status:"todo" },
      { name:"Stripe mode LIVE (cles production)", days:[12], owner:"JP", critical:true, status:"todo" },
      { name:"Build final + verification bundle", days:[12], owner:"JP+Claude", critical:true, status:"todo" },
      { name:"git push main - Vercel deploy v3.1-alpha", days:[13], owner:"JP", critical:true, status:"todo" },
      { name:"Smoke tests production LIVE (Brain IA + Pricing + RGPD)", days:[13], owner:"JP+Claude", critical:true, status:"todo" },
      { name:"Buffer corrections urgentes", days:[13], owner:"AG", critical:false, status:"todo" },
      { name:"MAJ REGISTRE + documentation finale", days:[13], owner:"JP", critical:false, status:"todo" },
    ],
  },
];

const VGATE = [
  { test:"Build", pass:"npm run build 0 erreur", fail:"Toute erreur" },
  { test:"Secrets", pass:"0 AIzaSy|supabase|sk_live dans dist/", fail:">=1 secret" },
  { test:"Brain IA", pass:"Chat streaming + 8 badges + mini/full", fail:"Pas de reponse" },
  { test:"Auth", pass:"Inscription-login-session-logout", fail:"Echec auth" },
  { test:"Tier gating", pass:"DISCOVER != STANDARD != PREMIUM", fail:"Pas de difference" },
  { test:"Stripe", pass:"Checkout-webhook-abo actif (test)", fail:"Echec paiement" },
  { test:"PDF", pass:"One-pager + rapport generes", fail:"PDF casse" },
  { test:"RGPD", pass:"Bandeau cookie + /politique + proxy IA", fail:"Absent" },
  { test:"Contact", pass:"Formulaire-reception email", fail:"Email non recu" },
  { test:"ROI Metrics", pass:"4 metriques visibles above-the-fold", fail:"Absentes" },
  { test:"Homepage", pass:"Offre EISaaS claire, CTA, Brain live, 0 placeholder", fail:"Placeholder visible" },
  { test:"Mobile", pass:"Lighthouse >= 85 (4 metriques)", fail:"< 85" },
  { test:"Multi-nav", pass:"Chrome + Firefox + Safari + Edge", fail:"Regression" },
  { test:"Rollback", pass:"Vercel instant rollback teste", fail:"Non teste" },
];

const RISKS = [
  { id:"R1", risk:"Supabase Auth integration complexe", proba:"MOYENNE", impact:"Critique", mitigation:"Magic link d'abord, email/password ensuite. Single-tenant v3.0" },
  { id:"R2", risk:"Stripe webhooks - sync DB", proba:"MOYENNE", impact:"Critique", mitigation:"Mode test exhaustif. Stripe CLI local. Signature verification" },
  { id:"R3", risk:"AG regressions lors des refactors", proba:"ELEVEE", impact:"Majeur", mitigation:"V&V systematique Claude. REGRESSION-1 = pattern confirme. Brief AG detaille" },
  { id:"R4", risk:"Bundle trop gros (html2pdf 1MB)", proba:"FAIBLE", impact:"Mineur", mitigation:"Lazy loading + code splitting. Reportable v3.1" },
  { id:"R5", risk:"SEO invisible (React SPA)", proba:"ELEVEE", impact:"Majeur", mitigation:"SSR/SSG en v3.1. SEO basique (meta, sitemap) en v3.0" },
  { id:"R6", risk:"Deadline 27/02 marge reduite", proba:"MOYENNE", impact:"Critique", mitigation:"Scope strict. P1B fusion prioritaire. Tout non-essentiel -> v3.2" },
  { id:"R7", risk:"git push tue le Brain IA en production", proba:"ELEVEE", impact:"Critique", mitigation:"REGLE : 0 git push avant V-Gate fusion Claude Opus. Brief AG explicite." },
  { id:"R8", risk:"Fusion v2.6+v3.0 casse le streaming Gemini", proba:"MOYENNE", impact:"Critique", mitigation:"Copier services EXACT (0 modif). Tester streaming avant toute modif UI." },
];

const SCOPE = {
  inScope: [
    { item:"Homepage B2B transformee (10 sections S0-S9)", status:"done", note:"13 composants valides Light/Glass" },
    { item:"Light/Glass design system", status:"done", note:"Migration P1-P2-P3 complete" },
    { item:"Bilingue FR/EN complet", status:"done", note:"i18n.ts S0-S9 valide" },
    { item:"FUSION Brain IA dans homepage v3.1", status:"doing", note:"P1B — Brief AG nuit 16/02" },
    { item:"Metriques ROI above-the-fold (Nico)", status:"doing", note:"P1B — 4 metriques definies" },
    { item:"CookieBanner RGPD reintegre Light", status:"todo", note:"P1B Phase 3" },
    { item:"Supabase Auth (email + magic link)", status:"todo", note:"J6-J7" },
    { item:"Dashboard Executif MVP (3 tiers)", status:"todo", note:"J7-J8" },
    { item:"Stripe Checkout + Billing", status:"todo", note:"J8-J9" },
    { item:"Page /politique RGPD complete", status:"todo", note:"J5" },
    { item:"Formulaire contact", status:"todo", note:"J9" },
    { item:"SEO fondamental (meta, sitemap, robots)", status:"todo", note:"J9" },
    { item:"V-Gate complet (14 criteres)", status:"todo", note:"J10-J12" },
  ],
  outScope: [
    "Tailwind CDN -> compile (perf v3.2)",
    "Multi-tenant RLS complet (v3.2)",
    "Analytics Plausible.io (v3.2)",
    "Strategie Outre-mer pages dediees (v3.2)",
    "3D visualization STEP viewer (v3.1 mars-avril — NO-GO 14/02)",
    "Formations certifiantes (v3.2)",
    "PWA + Offline (v3.2)",
    "API B2B publique (v4.0)",
    "SSR/SSG pour SEO (v3.2)",
    "React Router multi-pages /platform (v3.2 — homepage SPA d'abord)",
    "Photo IA retouchee (decision JP pendante)",
  ],
};

const LESSONS = [
  { id:"L1", severity:"red", title:"AG ne preserve pas les corrections ponctuelles lors des refactors", detail:"Pattern confirme : BUG-1 (15/02) + REGRESSION-1 (16/02).", action:"Documenter TOUS les fixes dans le wireframe R4. V&V systematique post-AG." },
  { id:"L2", severity:"red", title:"SESSION_REPORT AG optimiste", detail:"AG marque V2 OK alors que des regressions existent.", action:"Claude = validateur obligatoire. Jamais de deploy sans V&V Claude." },
  { id:"L3", severity:"amber", title:"La securite repose sur des accidents heureux", detail:"v2.6.0 : cle API protegee par tree-shaking accidentel.", action:"Security-by-design : proxy-only, env vars Vercel, grep dist/, CSP headers." },
  { id:"L4", severity:"amber", title:"React SPA = SEO invisible", detail:"UX test 09/02 : contenu inaccessible aux crawlers.", action:"v3.0 : meta tags + sitemap. v3.2 : SSR/SSG migration." },
  { id:"L5", severity:"green", title:"Multi-IA workflow = qualite superieure", detail:"Gemini 3 Flash + Sonnet 4.5 + Claude Opus = bugs cross-file detectes.", action:"Maintenir le triangle Claude-AG-JP avec V&V systematique." },
  { id:"L6", severity:"green", title:"Pipeline sync 15min operationnel", detail:"AG-Google Drive-Claude via PowerShell. 122 fichiers convertis.", action:"Etendre a Perplexity + Mistral en v3.2." },
  { id:"L7", severity:"red", title:"Migration par substitution tue le produit", detail:"v2.6->v3.0 : App.tsx bascule sur wireframe, Brain IA orphelin. components/ v2.6 debranche.", action:"Toute migration ADDITIVE (ajouter) puis SOUSTRACTIVE (retirer apres V&V). Jamais de switch brutal." },
  { id:"L8", severity:"red", title:"Conversation supprimee = intelligence perdue", detail:"Audit v2.6/v3.0 gap perdu. Reconstruit par scan + search 20260216T2000.", action:"REGISTRE doit capturer snapshot de chaque audit conversation, pas seulement les actions." },
  { id:"L9", severity:"amber", title:"Feedback utilisateur non formalise en tickets", detail:"5 retours Nico (10/02) influences wireframe sans tracabilite.", action:"Chaque retour = citation + action + section + statut. Fait dans STRATEGIC_PROPOSAL v3.1." },
  { id:"L10", severity:"amber", title:"Double arborescence sans contrat d'interface", detail:"components/ (v2.6) vs src/components/ (v3.0) — 0 partage de tokens, routing, state.", action:"v3.1 definit arbo unique : src/components/{homepage,brain,platform,common}/ + src/services/ + src/data/" },
];

const ownerIcon = (o) => { let r=""; if(o.includes("Claude")) r+="\u{1F536}"; if(o.includes("AG")) r+="\u{1F537}"; if(o.includes("JP")) r+="\u{1F7E2}"; return r; };
const statusIcon = (s) => { if(s==="done") return "\u2705"; if(s==="doing") return "\u{1F504}"; if(s==="blocked") return "\u{1F534}"; return "\u25CB"; };

export default function LifecycleManager() {
  const [tab, setTab] = useState("gantt");
  const [hover, setHover] = useState(null);
  const colW = 50;

  const stats = useMemo(() => {
    const all = PHASES.flatMap(p => p.tasks);
    const done = all.filter(t => t.status==="done").length;
    const doing = all.filter(t => t.status==="doing").length;
    const blocked = all.filter(t => t.status==="blocked").length;
    const total = all.length;
    const totalH = CALENDAR.reduce((s,d) => s+d.h, 0);
    const usedH = CALENDAR.filter(d => d.idx<=NOW_DAY).reduce((s,d) => s+d.h, 0);
    const currentPhase = doing > 0 ? "P1+P1B" : "P1";
    return { done, doing, blocked, total, pct:Math.round(done/total*100), totalH, usedH, remainH:totalH-usedH, daysLeft:14-(NOW_DAY+1), currentPhase };
  }, []);

  const tabs_list = [
    { id:"gantt", label:"Gantt", icon:"\u{1F4CA}" },
    { id:"kanban", label:"Kanban", icon:"\u{1F4CB}" },
    { id:"vgate", label:"V-Gate", icon:"\u{1F6E1}\uFE0F" },
    { id:"scope", label:"Scope", icon:"\u{1F3AF}" },
    { id:"risks", label:"Risques", icon:"\u26A0\uFE0F" },
    { id:"rex", label:"REX", icon:"\u{1F4DA}" },
  ];

  const glassCard = (extra={}) => ({
    background: C.glass, backdropFilter: C.blurSm, WebkitBackdropFilter: C.blurSm,
    borderRadius: 14, border: `1px solid ${C.glassBorder}`, boxShadow: C.shadowSm, ...extra,
  });

  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif", background:`linear-gradient(145deg, #e8edf5 0%, #f0f4f8 30%, #f5f0eb 60%, #eef2f7 100%)`, color:C.text, minHeight:"100vh", padding:16 }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div style={{ textAlign:"center", marginBottom:16 }}>
        <div style={{ fontSize:10, letterSpacing:2.5, color:C.textDim, textTransform:"uppercase" }}>Aegis Circular — Lifecycle Management — EISaaS</div>
        <h1 style={{ fontSize:24, fontWeight:700, margin:"4px 0", background:`linear-gradient(135deg,${C.accent},${C.red},${C.purple})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>v3.1 Fusion — Gantt * Kanban * V-Gate</h1>
        <div style={{ fontSize:11, color:C.textDim }}>13/02 - <span style={{ color:C.red, fontWeight:700 }}>27/02/2026</span> · MAJ : <span style={{ color:C.accent, fontWeight:600 }}>16/02 22h20 (J4)</span></div>
      </div>

      {/* KPI */}
      <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:14, flexWrap:"wrap" }}>
        {[
          { label:"Avancement", value:`${stats.pct}%`, sub:`${stats.done}/${stats.total} taches`, color:stats.pct>=30?C.accent:C.red },
          { label:"En cours", value:stats.doing, sub:"fusion v3.1 lancee", color:C.blue },
          { label:"Bloquants", value:stats.blocked, sub:stats.blocked>0?"a resoudre":"aucun", color:stats.blocked>0?C.red:C.green },
          { label:"Jours restants", value:stats.daysLeft, sub:`${stats.remainH}h capacite`, color:stats.daysLeft<=5?C.red:C.accent },
          { label:"Phase actuelle", value:stats.currentPhase, sub:"Specs + Fusion", color:C.accent },
        ].map((k,i) => (
          <div key={i} style={{ ...glassCard({ padding:"10px 16px", textAlign:"center", minWidth:100 }) }}>
            <div style={{ fontSize:20, fontWeight:700, color:k.color }}>{k.value}</div>
            <div style={{ fontSize:10, color:C.textMuted, fontWeight:600 }}>{k.label}</div>
            <div style={{ fontSize:9, color:C.textDim }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* PROGRESS */}
      <div style={{ ...glassCard({ padding:"8px 14px", marginBottom:14 }) }}>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, color:C.textDim, marginBottom:4 }}>
          <span>13/02 J1</span>
          <span style={{ color:C.accent, fontWeight:700 }}>AUJOURD'HUI J4 22h20</span>
          <span style={{ color:C.red, fontWeight:700 }}>27/02 {"\u{1F680}"}</span>
        </div>
        <div style={{ height:7, background:"rgba(148,163,184,0.15)", borderRadius:4, overflow:"hidden" }}>
          <div style={{ width:`${((NOW_DAY+0.9)/14)*100}%`, height:"100%", background:`linear-gradient(90deg,${C.green},${C.accent})`, borderRadius:4 }} />
        </div>
      </div>

      {/* TABS */}
      <div style={{ display:"flex", gap:4, justifyContent:"center", marginBottom:14, flexWrap:"wrap" }}>
        {tabs_list.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:"7px 14px", borderRadius:10,
            border:`1px solid ${tab===t.id? C.accent:"rgba(148,163,184,0.2)"}`,
            background:tab===t.id?"rgba(217,119,6,0.1)":C.glass,
            backdropFilter:C.blurSm, WebkitBackdropFilter:C.blurSm,
            color:tab===t.id?C.accent:C.textMuted, fontSize:12, fontWeight:600, cursor:"pointer",
            boxShadow:tab===t.id?"0 2px 8px rgba(217,119,6,0.12)":C.shadowSm,
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* ═══ GANTT ═══ */}
      {tab === "gantt" && (
        <div>
          <div style={{ display:"flex", gap:12, marginBottom:10, justifyContent:"center", flexWrap:"wrap", fontSize:9, color:C.textDim }}>
            <span>{"\u{1F536}"} Claude</span><span>{"\u{1F537}"} AG</span><span>{"\u{1F7E2}"} JP</span><span>{"\u2705"} Done</span><span>{"\u{1F504}"} En cours</span><span>{"\u{1F534}"} Bloque</span><span>{"\u25CB"} A faire</span>
          </div>
          <div style={{ ...glassCard({ overflow:"hidden" }) }}>
            <div style={{ display:"flex", position:"sticky", top:0, zIndex:10 }}>
              <div style={{ width:250, minWidth:250, background:"rgba(241,245,249,0.95)", backdropFilter:C.blur, padding:"5px 8px", fontSize:9, fontWeight:700, color:C.textDim, borderBottom:`1px solid ${C.border}` }}>PHASE / TACHE</div>
              <div style={{ display:"flex" }}>
                {CALENDAR.map(d => (
                  <div key={d.idx} style={{ width:colW, minWidth:colW, textAlign:"center", padding:"3px 0", fontSize:8, fontWeight:600, borderBottom:`1px solid ${C.border}`, borderLeft:"1px solid rgba(255,255,255,0.5)", background:d.idx===NOW_DAY?"rgba(217,119,6,0.12)":d.type==="weekend"?"rgba(217,119,6,0.04)":"rgba(241,245,249,0.9)", color:d.idx===NOW_DAY?C.accent:d.type==="weekend"?C.gold:C.textDim }}>
                    <div style={{ fontWeight:700 }}>{d.label}</div>
                    <div style={{ fontSize:7 }}>{d.date}</div>
                    <div style={{ fontSize:7 }}>{d.day} {d.h}h</div>
                  </div>
                ))}
              </div>
            </div>
            {PHASES.map(phase => (
              <div key={phase.id}>
                <div style={{ display:"flex", background:phase.bg, borderBottom:`1px solid ${C.border}` }}>
                  <div style={{ width:250, minWidth:250, padding:"5px 8px", fontSize:10, fontWeight:700, color:phase.color }}>{phase.id} · {phase.name}</div>
                  <div style={{ display:"flex" }}>{CALENDAR.map(d => <div key={d.idx} style={{ width:colW, minWidth:colW, borderLeft:"1px solid rgba(255,255,255,0.3)", background:phase.days.includes(d.idx)?`${phase.color}08`:"transparent" }} />)}</div>
                </div>
                {phase.tasks.map((task,ti) => (
                  <div key={ti} style={{ display:"flex", borderBottom:`1px solid ${C.border}` }} onMouseEnter={()=>setHover(`${phase.id}-${ti}`)} onMouseLeave={()=>setHover(null)}>
                    <div style={{ width:250, minWidth:250, padding:"3px 8px", fontSize:9, color:task.status==="done"?C.green:task.status==="doing"?C.blue:task.status==="blocked"?C.red:C.textMuted, background:hover===`${phase.id}-${ti}`?"rgba(148,163,184,0.08)":"transparent", display:"flex", alignItems:"center", gap:4, textDecoration:task.status==="done"?"line-through":"none", opacity:task.status==="done"?0.65:1 }}>
                      <span style={{ fontSize:8 }}>{statusIcon(task.status)}</span>
                      <span style={{ fontSize:8 }}>{ownerIcon(task.owner)}</span>
                      <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{task.name}</span>
                      {task.critical && <span style={{ fontSize:7, color:C.red, fontWeight:700 }}>{"\u25C9"}</span>}
                    </div>
                    <div style={{ display:"flex" }}>
                      {CALENDAR.map(d => (
                        <div key={d.idx} style={{ width:colW, minWidth:colW, borderLeft:"1px solid rgba(255,255,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", background:d.idx===NOW_DAY?"rgba(217,119,6,0.05)":"transparent" }}>
                          {task.days.includes(d.idx) && <div style={{ height:6, width:"88%", borderRadius:d.idx===task.days[0]?"4px 0 0 4px":d.idx===task.days[task.days.length-1]?"0 4px 4px 0":0, background:task.status==="done"?C.green:task.status==="doing"?C.blue:task.status==="blocked"?C.red:task.critical?phase.color:`${phase.color}88`, opacity:task.status==="done"?0.5:0.85, boxShadow:task.critical&&task.status!=="done"?`0 1px 4px ${phase.color}44`:"none" }} />}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* CRITICAL PATH */}
          <div style={{ ...glassCard({ marginTop:12, padding:14, borderLeft:`3px solid ${C.red}` }) }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.red, marginBottom:4 }}>Chemin critique actualise — 20260216T2220</div>
            <div style={{ fontSize:10, color:C.textMuted, lineHeight:1.8 }}>
              <s style={{ opacity:0.4 }}>Convergence (J1) → Wireframe R3 (J2-J3) → Fichiers fondation AG (J3) → Audit V&V (J4) → Scan visuel + Prop. strategique (J4)</s> →
              <span style={{ color:C.blue, fontWeight:700, background:C.blueBg, padding:"1px 6px", borderRadius:4 }}> FUSION Brain IA v3.1 (J4 nuit-J5) </span> →
              <span style={{ color:C.accent, fontWeight:600 }}> V&V fusion Claude (J5) </span> →
              Homepage deploy v3.1 (J6) → Auth (J6-J7) → Dashboard (J7-J8) → Stripe (J8-J9) → V-Gate (J10-J12) → Deploy (J14)
            </div>
          </div>

          {/* STATUS */}
          <div style={{ ...glassCard({ marginTop:10, padding:14, borderLeft:`3px solid ${C.accent}` }) }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.accent, marginBottom:4 }}>Etat actuel — 16/02 22h20 (J4 fin)</div>
            <div style={{ fontSize:10, color:C.textMuted, lineHeight:1.8 }}>
              <strong style={{ color:C.green }}>P0 termine (5/5).</strong>{" "}
              <strong style={{ color:C.green }}>P1 a 80% (12/15).</strong>{" "}
              <strong style={{ color:C.blue }}>P1B lance (2/10 en cours).</strong>{" "}
              <strong style={{ color:C.green }}>0 bloquant.</strong>{" "}
              REGRESSION-1 resolue dans wireframe R4. Scan visuel prod vs localhost complete. Proposition strategique v3.1 EISaaS validee. Brief AG nuit emis. Fusion Brain IA demarree (services copie en cours).
              <strong style={{ color:C.red }}> 2 specs critiques restantes</strong> : Supabase + Stripe (decalees J5).
            </div>
          </div>
        </div>
      )}

      {/* ═══ KANBAN ═══ */}
      {tab === "kanban" && (
        <div>
          {PHASES.map(phase => {
            const done=phase.tasks.filter(t=>t.status==="done"), blocked=phase.tasks.filter(t=>t.status==="blocked"), doing=phase.tasks.filter(t=>t.status==="doing"), todo=phase.tasks.filter(t=>t.status==="todo");
            const pct=phase.tasks.length>0?Math.round(done.length/phase.tasks.length*100):0;
            return (
              <div key={phase.id} style={{ marginBottom:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <span style={{ fontSize:10, fontWeight:700, color:phase.color, background:phase.bg, padding:"3px 10px", borderRadius:8, border:`1px solid ${phase.border}` }}>{phase.id}</span>
                  <span style={{ fontSize:13, fontWeight:600, color:C.text }}>{phase.name}</span>
                  <div style={{ flex:1 }} />
                  <span style={{ fontSize:12, fontWeight:700, color:pct===100?C.green:pct>0?C.accent:C.textDim }}>{pct}%</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:8 }}>
                  {[
                    { label:`${"\u{1F534}"} BLOQUE`, items:blocked, bg:C.redBg, border:C.redBorder, hc:C.red },
                    { label:`${"\u{1F504}"} EN COURS`, items:doing, bg:C.blueBg, border:C.blueBorder, hc:C.blue },
                    { label:`${"\u25CB"} A FAIRE`, items:todo, bg:"rgba(255,255,255,0.4)", border:C.border, hc:C.textDim },
                    { label:`${"\u2705"} TERMINE`, items:done, bg:C.greenBg, border:C.greenBorder, hc:C.green },
                  ].map((col,ci) => (
                    <div key={ci} style={{ ...glassCard({ padding:8, minHeight:48 }), background:col.bg, borderColor:col.border }}>
                      <div style={{ fontSize:9, fontWeight:700, color:col.hc, marginBottom:6, textAlign:"center" }}>{col.label} ({col.items.length})</div>
                      {col.items.map((t,ti) => (
                        <div key={ti} style={{ background:"rgba(255,255,255,0.7)", borderRadius:8, padding:"5px 8px", marginBottom:4, borderLeft:`3px solid ${t.critical?C.red:phase.color}`, fontSize:9, color:C.textMuted, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                          <div style={{ display:"flex", justifyContent:"space-between" }}>
                            <span style={{ color:C.text }}>{t.name}</span>
                            {t.critical && <span style={{ color:C.red, fontSize:7, fontWeight:700, marginLeft:4 }}>CRIT</span>}
                          </div>
                          <div style={{ fontSize:8, color:C.textDim, marginTop:2 }}>{ownerIcon(t.owner)} {t.owner}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ V-GATE ═══ */}
      {tab === "vgate" && (
        <div>
          <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:10 }}>V-Gate — 14 criteres de validation</div>
          <div style={{ display:"grid", gap:6 }}>
            {VGATE.map((v,i) => (
              <div key={i} style={{ ...glassCard({ padding:"8px 12px" }), display:"grid", gridTemplateColumns:"110px 1fr 1fr 50px", gap:8, alignItems:"center" }}>
                <div style={{ fontSize:11, fontWeight:600, color:C.text }}>{v.test}</div>
                <div style={{ fontSize:9, color:C.green }}>{"\u2705"} {v.pass}</div>
                <div style={{ fontSize:9, color:C.red }}>{"\u274C"} {v.fail}</div>
                <div style={{ fontSize:10, color:C.textDim, textAlign:"center" }}>{"\u25CB"}</div>
              </div>
            ))}
          </div>
          <div style={{ ...glassCard({ marginTop:14, padding:14, borderLeft:`3px solid ${C.blue}` }) }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.blue, marginBottom:6 }}>Stack technique v3.1-alpha</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, fontSize:10, color:C.textMuted }}>
              {[["Frontend","React 19 + Vite + TS"],["Design","Light/Glass (constants.ts)"],["Auth","Supabase Auth"],["DB","Supabase PostgreSQL"],["Paiement","Stripe Checkout + Billing"],["IA Brain","Gemini 2.0 Flash (proxy Vercel)"],["PDF","html2pdf.js"],["Hosting","Vercel (auto-deploy)"],["DNS","Gandi.net"],["i18n","FR/EN natif (i18n.ts)"]].map(([k,v],i) => (
                <div key={i}><span style={{ color:C.accent, fontWeight:600 }}>{k} :</span> {v}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ SCOPE ═══ */}
      {tab === "scope" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:C.green, marginBottom:10 }}>{"\u2705"} IN SCOPE v3.1-alpha</div>
            {SCOPE.inScope.map((s,i) => (
              <div key={i} style={{ ...glassCard({ padding:"8px 12px", marginBottom:6 }), borderLeft:`3px solid ${s.status==="done"?C.green:s.status==="doing"?C.blue:C.accent}` }}>
                <div style={{ fontSize:10, color:C.text, display:"flex", gap:6, alignItems:"center" }}>{statusIcon(s.status)} {s.item}</div>
                <div style={{ fontSize:8, color:C.textDim, marginTop:2 }}>{s.note}</div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:C.textDim, marginBottom:10 }}>OUT SCOPE (reporte)</div>
            {SCOPE.outScope.map((s,i) => (
              <div key={i} style={{ ...glassCard({ padding:"8px 12px", marginBottom:6, opacity:0.55 }) }}>
                <div style={{ fontSize:10, color:C.textDim }}>{s}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ RISKS ═══ */}
      {tab === "risks" && (
        <div>
          <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:10 }}>Matrice des risques — 8 risques identifies</div>
          {RISKS.map(r => (
            <div key={r.id} style={{ ...glassCard({ padding:12, marginBottom:8 }), borderLeft:`3px solid ${r.proba==="ELEVEE"?C.red:r.proba==="MOYENNE"?C.accent:C.green}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:C.textDim }}>{r.id}</span>
                  <span style={{ fontSize:11, fontWeight:600, color:C.text }}>{r.risk}</span>
                </div>
                <div style={{ display:"flex", gap:4 }}>
                  <span style={{ fontSize:9, padding:"2px 8px", borderRadius:6, background:r.proba==="ELEVEE"?C.redBg:r.proba==="MOYENNE"?C.accentBg:C.greenBg, color:r.proba==="ELEVEE"?C.red:r.proba==="MOYENNE"?C.accent:C.green, fontWeight:600, border:`1px solid ${r.proba==="ELEVEE"?C.redBorder:r.proba==="MOYENNE"?C.accentBorder:C.greenBorder}` }}>P: {r.proba}</span>
                  <span style={{ fontSize:9, padding:"2px 8px", borderRadius:6, background:r.impact==="Critique"?C.redBg:C.accentBg, color:r.impact==="Critique"?C.red:C.accent, fontWeight:600, border:`1px solid ${r.impact==="Critique"?C.redBorder:C.accentBorder}` }}>I: {r.impact}</span>
                </div>
              </div>
              <div style={{ fontSize:10, color:C.green, fontWeight:500 }}>Mitigation : {r.mitigation}</div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ REX ═══ */}
      {tab === "rex" && (
        <div>
          <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:10 }}>Retour d'experience consolide — v2.6.0 + J1-J4</div>
          {LESSONS.map(l => (
            <div key={l.id} style={{ ...glassCard({ padding:12, marginBottom:8 }), borderLeft:`3px solid ${l.severity==="red"?C.red:l.severity==="amber"?C.accent:C.green}` }}>
              <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:4 }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:C.textDim }}>{l.id}</span>
                <span style={{ fontSize:11, fontWeight:600, color:l.severity==="red"?C.red:l.severity==="amber"?C.accent:C.green }}>{l.title}</span>
              </div>
              <div style={{ fontSize:10, color:C.textMuted, marginBottom:4 }}>{l.detail}</div>
              <div style={{ fontSize:10, color:C.green, fontWeight:500 }}>Action : {l.action}</div>
            </div>
          ))}
          <div style={{ ...glassCard({ marginTop:14, padding:14 }) }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.accent, marginBottom:8 }}>Repartition outils</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
              {[
                { icon:"\u{1F536}", tool:"Claude Opus 4.6", role:"Cerveau critique", tasks:"V&V, contre-expertise, securite, specs, architecture, scan visuel, propositions strategiques, documentation REGISTRE", color:C.accent },
                { icon:"\u{1F537}", tool:"AG Gemini 3 Flash", role:"Bras d'execution", tasks:"Code gen, composants React/TS, fusion Brain v3.1, integration Supabase/Stripe, migrations UI", color:C.blue },
                { icon:"\u{1F7E2}", tool:"Jean-Pierre", role:"Decideur & testeur", tasks:"Arbitrage convergence, tests prod, validation UX, decisions architecture, git push, photo", color:C.green },
              ].map((t,i) => (
                <div key={i} style={{ background:"rgba(255,255,255,0.65)", borderRadius:10, padding:10, border:`1px solid ${C.border}`, boxShadow:C.shadowSm }}>
                  <div style={{ fontSize:12, fontWeight:700, color:t.color, marginBottom:4 }}>{t.icon} {t.tool}</div>
                  <div style={{ fontSize:10, color:C.text, fontWeight:600, marginBottom:3 }}>{t.role}</div>
                  <div style={{ fontSize:9, color:C.textDim, lineHeight:1.6 }}>{t.tasks}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div style={{ marginTop:18, borderTop:`1px solid ${C.border}`, paddingTop:10, textAlign:"center" }}>
        <div style={{ fontSize:8, color:C.textDim }}>AEGIS CIRCULAR · Lifecycle Management v3.1 Fusion · 20260216T2220 · AEGIS_REGISTRE_TRACABILITE</div>
        <div style={{ fontSize:8, color:C.textDim }}>Sources : Planning V5 (13/02) · Contre-expertise (14/02) · Audit V&V P3 (16/02) · RAG ChatGPT (15/02) · Scan visuel + Prop. strategique (16/02 22h)</div>
      </div>
    </div>
  );
}
