import { useState, useMemo } from "react";

const P = {
  bg:"#0c0f14",surface:"#151921",surfaceAlt:"#1a1f2b",card:"#1e2433",cardHover:"#242a3a",
  text:"#e8ecf4",textSec:"#8891a5",textMuted:"#5a6278",
  border:"rgba(255,255,255,0.06)",borderLight:"rgba(255,255,255,0.10)",
  accent:"#3b82f6",accentSoft:"rgba(59,130,246,0.12)",
  emerald:"#10b981",emeraldSoft:"rgba(16,185,129,0.12)",
  gold:"#f59e0b",goldSoft:"rgba(245,158,11,0.12)",
  rose:"#f43f5e",roseSoft:"rgba(244,63,94,0.12)",
  violet:"#8b5cf6",violetSoft:"rgba(139,92,246,0.12)",
  orange:"#f97316",orangeSoft:"rgba(249,115,22,0.12)",
  cyan:"#06b6d4",cyanSoft:"rgba(6,182,212,0.12)",
};

const ST={
  DONE:{label:"FAIT",color:P.emerald,bg:P.emeraldSoft},
  LIVE:{label:"EN PRODUCTION",color:P.emerald,bg:P.emeraldSoft},
  ACTIVE:{label:"EN COURS",color:P.accent,bg:P.accentSoft},
  PLANNED:{label:"PLANIFIE",color:P.violet,bg:P.violetSoft},
  BLOCKED:{label:"DEADLINE",color:P.rose,bg:P.roseSoft},
  VALIDATE:{label:"A VALIDER JP",color:P.gold,bg:P.goldSoft},
  ACTION:{label:"ACTION REQUISE",color:P.orange,bg:P.orangeSoft},
  COND:{label:"CONDITIONNEL",color:P.cyan,bg:P.cyanSoft},
  WAIT_JP:{label:"EN ATTENTE JP",color:P.orange,bg:P.orangeSoft},
};

/* ── GANTT DATA ── */
const ganttData=[
  {id:"v31",label:"v3.1 PRODUCTION",status:ST.DONE,start:"2026-03-05",end:"2026-03-10",lane:0,note:"commit 4837709 — 18/18 V-Gate"},
  {id:"v311",label:"v3.1.1 PRODUCTION",status:ST.LIVE,start:"2026-03-12",end:"2026-03-18",lane:0,note:"commit b8d4cb6 — Blog + OG tags"},
  {id:"v32",label:"v3.2 Sprint",status:ST.ACTIVE,start:"2026-03-24",end:"2026-04-06",lane:1,note:"BUG-01/02 resolus + Hero + campagne S13"},
  {id:"v33",label:"v3.3 GCI + Brain",status:ST.PLANNED,start:"2026-04-07",end:"2026-05-18",lane:1,note:"Pearl-Simon-Damasio + Brain migration + CIRSN-V"},
  {id:"v40",label:"v4.0 Supabase",status:ST.PLANNED,start:"2026-05-19",end:"2026-09-11",lane:1,note:"Multi-tenant + SecNumCloud + EBW"},
  {id:"api1p",label:"API 1P Phase 0",status:ST.DONE,start:"2026-03-29",end:"2026-03-29",lane:1,note:"D281 — Haiku test SUCCES"},
  {id:"diag",label:"DIAGNOSTIC v1.2",status:ST.ACTIVE,start:"2026-03-29",end:"2026-04-15",lane:1,note:"D282 — premier revenu cible 15/04"},
  {id:"llmo",label:"LinkedIn LLMO",status:ST.DONE,start:"2026-03-18",end:"2026-03-23",lane:2,note:"158→221/270 (82%) — 5/5 outils"},
  {id:"boost1",label:"LinkedIn Boost #1",status:ST.DONE,start:"2026-03-26",end:"2026-03-31",lane:2,note:"D270 — 50 EUR 16 industries"},
  {id:"mkt",label:"Campagne MKT S13-S14",status:ST.ACTIVE,start:"2026-03-24",end:"2026-04-09",lane:2,note:"Posts #3-#5 + reseaux + CRA"},
  {id:"boost2",label:"LinkedIn Boost #2 CRA",status:ST.PLANNED,start:"2026-04-04",end:"2026-04-09",lane:2,note:"D274 — conditionnel v3.2 deploye"},
  {id:"gseo",label:"GSEO Q2",status:ST.PLANNED,start:"2026-04-01",end:"2026-06-30",lane:2,note:"D47+D62 + articles blog"},
  {id:"cra_consult",label:"Consultation CRA",status:ST.DONE,start:"2026-03-23",end:"2026-03-31",lane:3,note:"Decision JP — deadline 31/03 passee"},
  {id:"cirsn_sys",label:"System prompt V&V",status:ST.PLANNED,start:"2026-04-15",end:"2026-05-01",lane:3,note:"D210"},
  {id:"cirsn_hub",label:"Regulatory Context Hub",status:ST.PLANNED,start:"2026-04-20",end:"2026-05-15",lane:3,note:"D165"},
  {id:"cirsn_iickg",label:"IICKG 5 couches",status:ST.PLANNED,start:"2026-05-01",end:"2026-06-01",lane:3,note:"D249 + GraphRAG"},
  {id:"cirsn_ckf",label:"Causal Knowledge Fabric",status:ST.PLANNED,start:"2026-05-10",end:"2026-06-10",lane:3,note:"D285"},
  {id:"cirsn_patent",label:"Patent-to-KG",status:ST.PLANNED,start:"2026-05-15",end:"2026-06-15",lane:3,note:"L175"},
  {id:"gemini_dep",label:"Gemini deprecie",status:ST.BLOCKED,start:"2026-06-01",end:"2026-06-01",lane:4,note:"Brain migration P0 CRITIQUE avant cette date"},
  {id:"cra",label:"CRA Signalement 24h",status:ST.BLOCKED,start:"2026-09-11",end:"2026-09-11",lane:4,note:"PREMIERE DEADLINE — D198"},
  {id:"mach",label:"Machinery 2023/1230",status:ST.BLOCKED,start:"2027-01-20",end:"2027-01-20",lane:4,note:"INCHANGE par Omnibus"},
  {id:"cra_full",label:"CRA Conformite complete",status:ST.BLOCKED,start:"2027-12-11",end:"2027-12-11",lane:4,note:"INCHANGE par Omnibus"},
  {id:"aiact",label:"AI Act Annexe III (Omnibus)",status:ST.COND,start:"2027-12-02",end:"2027-12-02",lane:4,note:"SI Omnibus adopte — etait 02/08/2026"},
  {id:"aiact2",label:"AI Act Annexe I (Omnibus)",status:ST.COND,start:"2028-08-02",end:"2028-08-02",lane:4,note:"SI Omnibus adopte — etait 02/08/2027"},
];

/* ── KANBAN DATA ── */
const kanbanCols=[
  {title:"FAIT / PROD",color:P.emerald,items:[
    {id:"K01",title:"v3.1 LIVE",p:"P0",tags:["D119"],detail:"commit 4837709 — 18/18 V-Gate — Brain IA FR+EN",deadline:null},
    {id:"K02",title:"v3.1.1 LIVE",p:"P0",tags:["D203"],detail:"commit b8d4cb6 — Blog + OG tags + Omnibus VII",deadline:null},
    {id:"K03",title:"LIFECYCLE v2.5.1",p:"P0",tags:["D240","L166","R75"],detail:"Integration 25 bridges 23/03/2026",deadline:null},
    {id:"K04",title:"Desktop v1.1.7053 D10r2",p:"P1",tags:["D184"],detail:"Build cc1949 — MCP stable — MODE RESTREINT",deadline:null},
    {id:"K05",title:"CLI v2.1.74 NO GO",p:"P0",tags:["D183"],detail:"Binaire dormant — pas sandbox OS Windows",deadline:null},
    {id:"K06",title:"LinkedIn LLMO 82%",p:"P0",tags:["D222"],detail:"158→221/270 — 5/5 outils triangulation",deadline:null},
    {id:"K07",title:"Post #1 Pearl + Post #2 Manifeste",p:"P1",tags:["D224"],detail:"Publies 18+23/03 — 208 impressions",deadline:null},
    {id:"K08",title:"Banniere LinkedIn D70",p:"P1",tags:["D223"],detail:"Machinery + Battery Reg + Regulatory Intelligence",deadline:null},
    {id:"K09",title:"aegis-desktop-vv.ps1 v2",p:"P1",tags:["D212","D288"],detail:"hash fix 9/9 PASS — auto-enrichissement",deadline:null},
    {id:"K10",title:"KB nettoyage 40 fichiers",p:"P1",tags:["D240"],detail:"5 lots supprimes 17/03",deadline:null},
    {id:"K11",title:"LIFECYCLE v2.6.0",p:"P0",tags:["D269"],detail:"Integration 8 bridges 26/03",deadline:null},
    {id:"K12",title:"Desktop v1.1.9493 (b58a0b)",p:"P1",tags:["D290"],detail:"MINOR — D10r2 MAINTENU",deadline:null},
    {id:"K13",title:"Script VV v2 hash fix",p:"P0",tags:["D288"],detail:"9/9 PASS — 3 modifications",deadline:null},
    {id:"K14",title:"API 1P Phase 0 SUCCES",p:"P0",tags:["D281"],detail:"Compte + cle + test Haiku",deadline:null},
    {id:"K15",title:"Diagnostic v1.2.0",p:"P0",tags:["D282"],detail:"7 sections completes 32K tokens",deadline:null},
    {id:"K16",title:"Boost #1 lance",p:"P1",tags:["D270"],detail:"50 EUR 5j 16 industries",deadline:null},
    {id:"K17",title:"PRINCIPE v1.1.0 §9",p:"P1",tags:["D276"],detail:"Comportement agentique GCI",deadline:null},
    {id:"K18",title:"Post #3 CRA 24h publie",p:"P1",tags:["D257"],detail:"LinkedIn CRA signalement",deadline:null},
    {id:"K19",title:"BUG-01 react-markdown",p:"P0",tags:["D320"],detail:"Raw bold fix — marked v17 + MarkdownRenderer",deadline:null},
    {id:"K20",title:"BUG-02 toggle langue",p:"P1",tags:["D321"],detail:"Language toggle reset fix — RESOLU",deadline:null},
    {id:"K21",title:"Hero messaging maieutique",p:"P1",tags:["D162"],detail:"Design Review PASS — Achats/BTP/Production/CAPEX",deadline:null},
    {id:"K22",title:".gitignore .md bridges",p:"P1",tags:["D322"],detail:"Fichiers non-tracked nettoyes",deadline:null},
    {id:"K23",title:"Navbar AEGIS Intelligence",p:"P1",tags:["D324"],detail:"Navigation mise a jour",deadline:null},
    {id:"K24",title:"DOMPurify sanitization",p:"P1",tags:["D325"],detail:"XSS protection Brain",deadline:null},
    {id:"K25",title:"4 composants archives",p:"P1",tags:["D327"],detail:"Nettoyage code mort — ParcoursRD, ReglementsSection, SansAvecAegis, ServicesSection",deadline:null},
    {id:"K26",title:"LIFECYCLE v2.8.0",p:"P0",tags:["D329","L225","R104"],detail:"Integration 72 IDs definitifs 31/03/2026",deadline:null},
  ]},
  {title:"SPRINT v3.2 ACTIF",color:P.accent,items:[
    {id:"K30",title:"Corrections JP + deploy",p:"P0",tags:["D329"],detail:"EN ATTENTE JP — NO GO deploy Vercel",deadline:"2026-04-06",assignee:"JP"},
    {id:"K31",title:"Consultation CRA XLSX",p:"P0",tags:["D258"],detail:"DEADLINE 31/03 — soumission EN",deadline:"2026-03-31",assignee:"JP"},
    {id:"K32",title:"SSR/SSG SEO",p:"P1",tags:["R5"],detail:"SPA invisible Google — prerender",deadline:"2026-04-06",assignee:"ACDC"},
    {id:"K33",title:"og:image par article",p:"P2",tags:["D207"],detail:"Pas jpc.jpg generique",deadline:"2026-04-06",assignee:"ACDC"},
    {id:"K34",title:"Boost #1 resultats",p:"P1",tags:["D270"],detail:"J+5 ANALYSE — 50 EUR 16 industries",deadline:"2026-04-01",assignee:"JP"},
    {id:"K35",title:"Seiri Phase 1 execution",p:"P1",tags:["D301"],detail:"EN ATTENTE JP — script aegis-5s-seiri-phase1.ps1 pret",deadline:"2026-04-06",assignee:"JP"},
  ]},
  {title:"CAMPAGNE S13-S14",color:P.orange,items:[
    {id:"A01",title:"Decision consultation CRA",p:"P0",tags:["D225"],detail:"JP tranche — irreversible",deadline:"2026-03-25",assignee:"JP"},
    {id:"A02",title:"Post #3 CRA signalement 24h",p:"P1",tags:["D224"],detail:"N1 pedagogique — publie",deadline:null},
    {id:"A03",title:"Post #4 SBOM CRA",p:"P1",tags:["D224"],detail:"N1 pedagogique — 26-28/03",deadline:"2026-03-28",assignee:"JP"},
    {id:"A04",title:"Commentaires leaders 3-5",p:"P1",tags:["D227"],detail:"Billois, Drouard, Scheelen",deadline:"2026-04-04",assignee:"JP"},
    {id:"A05",title:"Activation ex-collegues",p:"P1",tags:["D227"],detail:"WhatsApp+email personnalise",deadline:"2026-04-04",assignee:"JP"},
    {id:"A06",title:"Activation CCI DOM-TOM",p:"P1",tags:["D226"],detail:"Guadeloupe + Martinique",deadline:"2026-04-09",assignee:"JP"},
    {id:"A07",title:"Soumission CRA (si OUI)",p:"P1",tags:["D225"],detail:"2-3 pages EN avant 31/03",deadline:"2026-03-31",assignee:"JP"},
  ]},
  {title:"A VALIDER JP",color:P.gold,items:[
    {id:"V01",title:"Extension SMC <=750 emp",p:"P1",tags:["D200"],detail:"Omnibus elargit exemptions PME",deadline:null,assignee:"JP"},
    {id:"V02",title:"These fondatrice = one-liner About",p:"P1",tags:["D220"],detail:"PRINCIPE FONDATEUR",deadline:null,assignee:"JP"},
    {id:"V03",title:"Strategie 50/30/20 Pearl",p:"P1",tags:["D221"],detail:"Pedagogique/Expertise/Action",deadline:null,assignee:"JP"},
    {id:"V04",title:"Regulatory Compliance Layer",p:"P1",tags:["D238"],detail:"Positionnement ecosysteme souverain",deadline:null,assignee:"JP"},
    {id:"V05",title:"DryRun 87% actif MKT",p:"P2",tags:["D209"],detail:"Signal validation externe dette cognitive",deadline:null,assignee:"JP"},
    {id:"V06",title:"Funnel 4 tiers PULSE/DIAG/VEILLE/TERRAIN",p:"P1",tags:["D284"],detail:"Pricing + funnel lead magnet",deadline:null,assignee:"JP"},
    {id:"V07",title:"Causal Knowledge Fabric",p:"P1",tags:["D285"],detail:"Formalisation Flywheel D265",deadline:null,assignee:"JP"},
    {id:"V08",title:"Flywheel Compliance concept",p:"P1",tags:["D265"],detail:"Publier ASAP avant Big Consulting",deadline:null,assignee:"JP"},
  ]},
  {title:"BACKLOG v3.3+",color:P.violet,items:[
    {id:"B10",title:"Brain migration Gemini->Claude",p:"P0",tags:["CRITIQUE"],detail:"API 1P Haiku — arret Gemini 01/06 — brief T1200",deadline:"2026-06-01",assignee:"ACDC"},
    {id:"B11",title:"Proxy unifie claude-proxy.ts",p:"P0",tags:[],detail:"3 modes brain/pulse/diagnostic — semaine 15",deadline:"2026-04-13",assignee:"ACDC"},
    {id:"B12",title:"System prompt v1.3 integration",p:"P1",tags:[],detail:"Brief T0700 — semaine 15",deadline:"2026-04-13",assignee:"ACDC"},
    {id:"B13",title:"GANTT/KANBAN v4 Supabase",p:"P1",tags:["D305"],detail:"Realtime + notifications — semaine 17",deadline:"2026-04-27",assignee:"ACDC"},
    {id:"B14",title:"GCI spec v2 — 7 couches, 22 piliers",p:"P1",tags:["D294"],detail:"Pearl-Simon-Damasio enrichi — semaine 16",deadline:"2026-04-20",assignee:"ACDC"},
    {id:"B15",title:"Seiton arbre semantique",p:"P1",tags:["D303"],detail:"5S Phase 2 — semaine 15",deadline:"2026-04-13",assignee:"ACDC"},
    {id:"B16",title:"Seiso script audit",p:"P1",tags:["D304"],detail:"5S Phase 2 — semaine 16",deadline:"2026-04-20",assignee:"ACDC"},
    {id:"B17",title:"Boost #2 CRA couple deploy",p:"P1",tags:["D274"],detail:"Conditionnel v3.2 deploye — semaine 15",deadline:"2026-04-13",assignee:"JP"},
    {id:"B18",title:"GSEO article #2 World Models",p:"P2",tags:["D266"],detail:"Convergence AMI/AEGIS — semaine 17",deadline:"2026-04-27",assignee:"ACDC"},
    {id:"B19",title:"Notifications deadlines",p:"P2",tags:["D305"],detail:"Semaine 18",deadline:"2026-05-04",assignee:"ACDC"},
    {id:"B05",title:"CIRSN-V system prompt",p:"P1",tags:["D210"],detail:"JP human-V&V-approval-loop",deadline:"2026-05-01",assignee:"ACDC"},
    {id:"B08",title:"SecNumCloud v4.0",p:"P2",tags:["D233"],detail:"Cloud souverain",deadline:null,assignee:"ACDC"},
  ]},
];

/* ── SECURITE ── */
const secItems=[
  {l:"MCP externe",s:"PROTEGE",c:P.emerald,d:"INTERDIT D37+D10r2"},
  {l:"MCP Filesystem local",s:"AUTORISE",c:P.emerald,d:"4 repertoires — reconnect upstream fix"},
  {l:"AG Antigravity",s:"CONFINE",c:P.emerald,d:"Editing statique — sandbox-exec casse"},
  {l:"Secrets en clair",s:"ZERO TOL.",c:P.emerald,d:"D_SEC_01 — nom variable seulement"},
  {l:"Git push",s:"HUMAN-LOOP",c:P.emerald,d:"JP seul — git add <fichier> (D204)"},
  {l:"CLI v2.1.74",s:"INTERDIT",c:P.rose,d:"NO GO D183 — pas sandbox OS Windows"},
  {l:"DXT/Cowork/CU",s:"INTERDIT",c:P.rose,d:"LayerX CVSS 10 non patche — D10r2"},
  {l:"Desktop v1.1.9493",s:"D10r2 MAINT.",c:P.emerald,d:"b58a0b — D10r2 MAINTENU"},
  {l:"Script VV v2",s:"PASS 9/9",c:P.emerald,d:"auto-enrichissement hashs + guard anti-ecrasement"},
  {l:"API 1P Claude",s:"ACTIF",c:P.emerald,d:"Compte actif — cle DPAPI — auto-reload OFF"},
  {l:"CIRSN-V docs ext.",s:"GAP AMBRE",c:P.gold,d:"System prompt JP V&V a definir — D210"},
  {l:"RAG knowledge base",s:"A DEFINIR",c:P.gold,d:"Validation provenance — backlog v3.3"},
];

/* ── MILESTONES ── */
const milestones=[
  {date:"10/03/2026",label:"v3.1 PRODUCTION commit 4837709",c:P.emerald,icon:"\u2705",done:true},
  {date:"11/03/2026",label:"LIFECYCLE v2.5.0 (D167/L120/R58)",c:P.emerald,icon:"\u2705",done:true},
  {date:"17/03/2026",label:"v3.1.1 PRODUCTION commit b8d4cb6",c:P.emerald,icon:"\u2705",done:true},
  {date:"18/03/2026",label:"OG tags fix + Post #1 LinkedIn",c:P.emerald,icon:"\u2705",done:true},
  {date:"23/03/2026",label:"LinkedIn LLMO 82% + LIFECYCLE v2.5.1",c:P.emerald,icon:"\u2705",done:true},
  {date:"25/03/2026",label:"Decision consultation CRA (JP)",c:P.orange,icon:"\u2705",done:true},
  {date:"26/03/2026",label:"LIFECYCLE v2.6.0 (D269/L180/R85)",c:P.emerald,icon:"\u2705",done:true},
  {date:"29/03/2026",label:"API 1P Phase 0 SUCCES",c:P.accent,icon:"\u2705",done:true},
  {date:"30/03/2026",label:"Script VV v2 PASS 9/9",c:P.emerald,icon:"\u2705",done:true},
  {date:"31/03/2026",label:"LIFECYCLE v2.8.0 (D329/L225/R104)",c:P.emerald,icon:"\u2705",done:true},
  {date:"31/03/2026",label:"Deadline consultation CRA",c:P.rose,icon:"\u2705",done:true},
  {date:"06/04/2026",label:"v3.2 target",c:P.accent,icon:"\ud83c\udfaf",done:false},
  {date:"15/04/2026",label:"Premier clic revenu DIAGNOSTIC",c:P.gold,icon:"\ud83d\udcb6",done:false},
  {date:"18/05/2026",label:"v3.3 GCI Pearl-Simon-Damasio + Brain migration",c:P.violet,icon:"\ud83e\udde0",done:false},
  {date:"01/06/2026",label:"Gemini deprecie — Brain migration P0 CRITIQUE",c:P.rose,icon:"\u26a0\ufe0f",done:false},
  {date:"11/09/2026",label:"CRA Signalement 24h — PREMIERE DEADLINE",c:P.rose,icon:"\u2696\ufe0f",done:false},
  {date:"20/01/2027",label:"Machinery Reg 2023/1230 (INCHANGE)",c:P.rose,icon:"\u2699\ufe0f",done:false},
  {date:"02/12/2027",label:"AI Act Annexe III (SI Omnibus)",c:P.cyan,icon:"\ud83d\udce6",done:false},
];

/* ── 5S INDICATORS ── */
const fiveSData=[
  {s:"S1",name:"Seiri (Trier)",value:"~220 fichiers racine",target:"Cible: <=60",pct:100,color:P.rose,status:"SCRIPT PRET",detail:"Script aegis-5s-seiri-phase1.ps1 pret — execution JP requise — cold storage bridges"},
  {s:"S2",name:"Seiton (Ranger)",value:"Structure arborescente",target:"Conformite requise",pct:0,color:P.rose,status:"NON CONFORME",detail:"Arbre semantique a implementer — script Phase 2 pret"},
  {s:"S3",name:"Seiso (Nettoyer)",value:"~10 bridges en attente",target:"Alerte si >5",pct:50,color:P.gold,status:"ALERTE",detail:"10 IDs temporaires T1200 en attente integration v2.9.0"},
  {s:"S4",name:"Seiketsu (Standardiser)",value:"Types non-D48 : 0",target:"Cible: 0",pct:0,color:P.emerald,status:"PASS",detail:"Convention D48 evoluee ASCII-safe respectee — 0 non-conformites"},
  {s:"S5",name:"Shitsuke (Discipline)",value:"Score audit : 1/5",target:"Dernier audit: jamais",pct:20,color:P.rose,status:"1/5",detail:"Aucun audit 5S complet realise — script seiso pret pour Phase 2"},
];

/* ── CAUSAL GRAPH LAYERS ── */
const causalLayers=[
  {name:"INFRASTRUCTURE",color:P.rose,concepts:["Memory bottleneck","V_INFRA","V_TOKEN","Claude API 1P"]},
  {name:"FOND. OPERATIONNELLE",color:P.orange,concepts:["Flywheel IA","Agile Robots","TOM","Paradoxe Suleyman"]},
  {name:"FOND. RECHERCHE",color:P.gold,concepts:["AMI Labs / JEPA","World Models","Physical AI"]},
  {name:"ORCHESTRATION",color:P.accent,concepts:["Craft AI","S3NS","PCC","CIRSN-V"]},
  {name:"METHODOLOGIE",color:P.violet,concepts:["5S Digital","LEAN R12","ARI","Kaizen","GCI 22 piliers"]},
  {name:"EXPERTISE",color:P.emerald,concepts:["Flywheel Compliance","PRINCIPE v1.3","32 ans R&D","6 groupes"]},
];

/* ── COMPONENTS ── */
const Badge=({children,color,bg})=>(
  <span style={{display:"inline-block",padding:"2px 7px",borderRadius:4,fontSize:10,fontWeight:600,letterSpacing:"0.03em",color,backgroundColor:bg,lineHeight:"16px"}}>{children}</span>
);
const Dot=({p})=>{
  const c=p==="P0"?P.rose:p==="P1"?P.gold:P.textMuted;
  return <span style={{display:"inline-block",width:6,height:6,borderRadius:3,backgroundColor:c,marginRight:6,marginTop:3,flexShrink:0}}/>;
};

/* ── MAIN COMPONENT ── */
export default function GanttKanbanMaster(){
  const [view,setView]=useState("kanban");
  const [exp,setExp]=useState(null);
  const [selectedItem,setSelectedItem]=useState(null);
  const [completedOverrides,setCompletedOverrides]=useState({});
  const [showNotifs,setShowNotifs]=useState(false);

  const TODAY="2026-03-31";
  const gs=new Date("2026-02-15"), ge=new Date("2028-10-01");
  const total=(ge-gs)/86400000;
  const todayOff=((new Date(TODAY)-gs)/86400000)/total*100;
  const getBar=item=>{
    const s=new Date(item.start),e=new Date(item.end);
    return{left:`${Math.max(0,((s-gs)/86400000)/total*100)}%`,width:`${Math.max(0.5,((e-s)/86400000)/total*100)}%`};
  };
  const months=["FEV 26","MAR","AVR","MAI","JUN","JUL","AOU","SEP","OCT","NOV","DEC","JAN 27","FEV","MAR","AVR","MAI","JUN","JUL","AOU 28"];
  const mpos=months.map((_,i)=>{
    const yr=i<11?2026:i<23?2027:2028;
    const mo=i<11?(1+i):(i<23?(i-11):(i-23));
    return((new Date(yr,mo,1)-gs)/86400000)/total*100;
  });
  const lanes=["Production","Sprints","Marketing","Pipeline","Reglementaire"];
  const views=["kanban","gantt","securite","milestones","5s","causal"];

  // Notifications: auto-computed from tasks with deadlines
  const notifications=useMemo(()=>{
    const today=new Date(TODAY);
    const notifs=[];
    kanbanCols.forEach(col=>{
      col.items.forEach(item=>{
        if(!item.deadline) return;
        const dl=new Date(item.deadline);
        const diff=Math.ceil((dl-today)/(86400000));
        if(diff<=7){
          const overdue=diff<0;
          const dueToday=diff===0;
          notifs.push({
            id:item.id,
            title:item.title,
            deadline:item.deadline,
            diff,
            overdue,
            dueToday,
            priority:item.p,
            assignee:item.assignee||"—",
            color:overdue?P.rose:dueToday?P.orange:P.gold,
            label:overdue?`EN RETARD (${Math.abs(diff)}j)`:dueToday?"AUJOURD'HUI":`J-${diff}`,
          });
        }
      });
    });
    return notifs.sort((a,b)=>a.diff-b.diff);
  },[]);

  const toggleComplete=(itemId)=>{
    setCompletedOverrides(prev=>({...prev,[itemId]:!prev[itemId]}));
  };

  const isCompleted=(itemId)=>!!completedOverrides[itemId];

  // Find item across all kanban columns for detail panel
  const findItem=(id)=>{
    for(const col of kanbanCols){
      const found=col.items.find(i=>i.id===id);
      if(found) return{...found,column:col.title};
    }
    return null;
  };

  const detailItem=selectedItem?findItem(selectedItem):null;

  const criticalDeadlines=[
    {d:"01/06/2026",l:"Gemini deprecie",color:P.rose},
    {d:"sept 2026",l:"CRA Signalement 24h",color:P.rose},
    {d:"jan 2027",l:"Machinery 2023/1230",color:P.rose},
    {d:"dec 2027",l:"AI Act Annexe III (si Omnibus)",color:P.cyan},
  ];

  return(
    <div style={{fontFamily:"'JetBrains Mono','SF Mono',monospace",backgroundColor:P.bg,color:P.text,minHeight:"100vh",position:"relative"}}>

      {/* HEADER */}
      <div style={{padding:"20px 24px 16px",borderBottom:`1px solid ${P.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{fontSize:10,color:P.textMuted,letterSpacing:"0.1em",marginBottom:4}}>AEGIS INTELLIGENCE — LIFECYCLE MASTER TRACKER v2.8.0</div>
            <div style={{fontSize:18,fontWeight:700}}>Governance Dashboard</div>
            <div style={{fontSize:11,color:P.textSec,marginTop:4}}>
              IDs: D329 / L225 / R104 — v3.2 Sprint — Desktop v1.1.9493 D10r2 — LinkedIn LLMO 82%
            </div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {/* Notification bell */}
            <div style={{position:"relative"}}>
              <button onClick={()=>setShowNotifs(!showNotifs)} style={{
                padding:"6px 10px",borderRadius:6,border:`1px solid ${notifications.length>0?P.rose:P.border}`,
                backgroundColor:notifications.length>0?P.roseSoft:"transparent",color:notifications.length>0?P.rose:P.textSec,
                fontSize:14,cursor:"pointer",fontFamily:"inherit",position:"relative"
              }}>
                {"\ud83d\udd14"}
                {notifications.length>0&&(
                  <span style={{position:"absolute",top:-4,right:-4,width:16,height:16,borderRadius:8,backgroundColor:P.rose,color:"#fff",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{notifications.length}</span>
                )}
              </button>
              {/* Notification dropdown */}
              {showNotifs&&(
                <div style={{position:"absolute",right:0,top:36,width:360,maxHeight:400,overflowY:"auto",backgroundColor:P.surface,border:`1px solid ${P.border}`,borderRadius:10,zIndex:100,boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}}>
                  <div style={{padding:"12px 16px",borderBottom:`1px solid ${P.border}`,fontSize:11,fontWeight:700,color:P.rose,letterSpacing:"0.05em"}}>
                    NOTIFICATIONS ({notifications.length})
                  </div>
                  {notifications.length===0&&(
                    <div style={{padding:16,fontSize:11,color:P.textMuted,textAlign:"center"}}>Aucune notification active</div>
                  )}
                  {notifications.map(n=>(
                    <div key={n.id} style={{padding:"10px 16px",borderBottom:`1px solid ${P.border}`,display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:18,animation:n.overdue?"pulse 1.5s infinite":"none"}}>{n.overdue?"\ud83d\udd34":n.dueToday?"\ud83d\udfe0":"\ud83d\udfe1"}</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:11,fontWeight:600,color:P.text}}>{n.title}</div>
                        <div style={{fontSize:10,color:n.color,fontWeight:700}}>{n.label} — {n.deadline} — {n.assignee}</div>
                      </div>
                      <div style={{display:"flex",gap:4,flexDirection:"column"}}>
                        <button onClick={(e)=>{e.stopPropagation();toggleComplete(n.id);}} style={{padding:"3px 8px",borderRadius:4,border:`1px solid ${P.emerald}`,backgroundColor:P.emeraldSoft,color:P.emerald,fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Marquer FAIT</button>
                        <button onClick={(e)=>{e.stopPropagation();setSelectedItem(n.id);setShowNotifs(false);}} style={{padding:"3px 8px",borderRadius:4,border:`1px solid ${P.accent}`,backgroundColor:P.accentSoft,color:P.accent,fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Voir detail</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* View tabs */}
            {views.map(v=>(
              <button key={v} onClick={()=>setView(v)} style={{
                padding:"6px 14px",borderRadius:6,border:`1px solid ${view===v?P.accent:P.border}`,
                backgroundColor:view===v?P.accentSoft:"transparent",color:view===v?P.accent:P.textSec,
                fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"
              }}>{v.toUpperCase()}</button>
            ))}
          </div>
        </div>
      </div>

      {/* NOTIFICATION BAR — urgent items */}
      {notifications.filter(n=>n.overdue||n.dueToday).length>0&&(
        <div style={{backgroundColor:P.roseSoft,borderBottom:`1px solid ${P.rose}40`,padding:"8px 24px",display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
          <span style={{fontSize:10,fontWeight:700,color:P.rose,letterSpacing:"0.05em",animation:"pulse 2s infinite"}}>URGENT</span>
          {notifications.filter(n=>n.overdue||n.dueToday).map(n=>(
            <span key={n.id} style={{fontSize:10,color:P.rose}}>
              <span style={{fontWeight:700}}>{n.title}</span> — {n.label}
            </span>
          ))}
        </div>
      )}

      <div style={{display:"flex",minHeight:"calc(100vh - 140px)"}}>
        {/* MAIN CONTENT */}
        <div style={{flex:1,padding:"16px 24px 80px",overflow:"auto"}}>

          {/* KANBAN */}
          {view==="kanban"&&(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:12}}>
              {kanbanCols.map((col,ci)=>{
                const activeCount=col.items.filter(i=>!isCompleted(i.id)).length;
                return(
                  <div key={ci} style={{backgroundColor:P.surface,borderRadius:10,border:`1px solid ${P.border}`,overflow:"hidden"}}>
                    <div style={{padding:"12px 14px 10px",borderBottom:`1px solid ${P.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:11,fontWeight:700,color:col.color,letterSpacing:"0.05em"}}>{col.title}</span>
                      <Badge color={col.color} bg={`${col.color}18`}>{activeCount}/{col.items.length}</Badge>
                    </div>
                    <div style={{padding:8,display:"flex",flexDirection:"column",gap:6}}>
                      {col.items.map(item=>{
                        const done=isCompleted(item.id);
                        const isOverdue=item.deadline&&new Date(item.deadline)<new Date(TODAY);
                        return(
                          <div key={item.id} style={{
                            backgroundColor:P.card,borderRadius:8,padding:"10px 12px",cursor:"pointer",
                            border:`1px solid ${selectedItem===item.id?P.accent:done?P.emerald+"60":isOverdue?P.rose+"40":P.border}`,
                            transition:"all 0.2s",opacity:done?0.5:1,
                            borderLeft:done?`3px solid ${P.emerald}`:isOverdue?`3px solid ${P.rose}`:"3px solid transparent",
                            position:"relative"
                          }} onClick={()=>setSelectedItem(selectedItem===item.id?null:item.id)}>
                            {done&&(
                              <div style={{position:"absolute",top:4,right:8,fontSize:14,color:P.emerald}}>✓</div>
                            )}
                            {isOverdue&&!done&&(
                              <div style={{position:"absolute",top:4,right:8,width:8,height:8,borderRadius:4,backgroundColor:P.rose,animation:"pulse 1.5s infinite"}}/>
                            )}
                            <div style={{display:"flex",alignItems:"flex-start"}}>
                              <Dot p={item.p}/>
                              <div style={{flex:1}}>
                                <div style={{fontSize:12,fontWeight:600,lineHeight:"16px",textDecoration:done?"line-through":"none",color:done?P.textMuted:P.text}}>{item.title}</div>
                                {exp===item.id&&(
                                  <div style={{fontSize:10,color:P.textSec,marginTop:6,lineHeight:"15px"}}>{item.detail}</div>
                                )}
                              </div>
                              <span style={{fontSize:9,color:P.textMuted,fontWeight:600,marginLeft:6}}>{item.p}</span>
                            </div>
                            {item.tags.length>0&&(
                              <div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap"}}>
                                {item.tags.map(t=><Badge key={t} color={P.textSec} bg={P.surfaceAlt}>{t}</Badge>)}
                              </div>
                            )}
                            {item.deadline&&(
                              <div style={{marginTop:6,fontSize:9,color:isOverdue?P.rose:P.textMuted,fontWeight:600}}>
                                {"\u23f0"} {item.deadline}{item.assignee?` — ${item.assignee}`:""}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* GANTT */}
          {view==="gantt"&&(
            <>
              {/* Critical Deadlines bar */}
              <div style={{backgroundColor:P.roseSoft,borderRadius:8,padding:"10px 16px",marginBottom:12,border:`1px solid ${P.rose}30`,display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
                <span style={{fontSize:10,fontWeight:700,color:P.rose,letterSpacing:"0.05em"}}>DEADLINES CRITIQUES</span>
                {criticalDeadlines.map((dl,i)=>(
                  <span key={i} style={{fontSize:10,color:dl.color}}>
                    <span style={{fontWeight:700}}>{dl.d}</span>{" "}{dl.l}
                    {i<criticalDeadlines.length-1?" \u2022 ":""}
                  </span>
                ))}
              </div>
              <div style={{backgroundColor:P.surface,borderRadius:10,border:`1px solid ${P.border}`,overflow:"hidden"}}>
                <div style={{position:"relative",padding:"10px 0 0 110px",overflowX:"auto"}}>
                  {/* Month headers */}
                  <div style={{display:"flex",position:"relative",height:24,borderBottom:`1px solid ${P.border}`}}>
                    {months.map((m,i)=>(
                      <div key={i} style={{position:"absolute",left:`${mpos[i]}%`,fontSize:9,color:P.textMuted,fontWeight:600}}>{m}</div>
                    ))}
                  </div>
                  {/* Today line */}
                  <div style={{position:"absolute",left:`calc(110px + ${todayOff}%)`,top:0,bottom:0,width:2,backgroundColor:P.rose,zIndex:10,opacity:0.6}}/>
                  <div style={{position:"absolute",left:`calc(110px + ${todayOff}% - 28px)`,top:2,fontSize:8,color:P.rose,fontWeight:700,zIndex:11}}>31/03</div>
                  {/* Lanes */}
                  {lanes.map((lane,li)=>(
                    <div key={li} style={{position:"relative",height:42,borderBottom:`1px solid ${P.border}`,display:"flex",alignItems:"center"}}>
                      <div style={{position:"absolute",left:-106,width:100,fontSize:9,color:P.textMuted,textAlign:"right",fontWeight:600}}>{lane}</div>
                      {ganttData.filter(d=>d.lane===li).map(item=>{
                        const bar=getBar(item);
                        return(
                          <div key={item.id} title={`${item.label}\n${item.note}`} style={{
                            position:"absolute",left:bar.left,width:bar.width,minWidth:item.start===item.end?10:undefined,
                            height:24,borderRadius:4,backgroundColor:item.status.bg,border:`1px solid ${item.status.color}40`,
                            display:"flex",alignItems:"center",padding:"0 6px",overflow:"hidden",cursor:"pointer",
                            transition:"transform 0.15s"
                          }} onClick={()=>setExp(exp===item.id?null:item.id)}>
                            <span style={{fontSize:9,fontWeight:600,color:item.status.color,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* SECURITE */}
          {view==="securite"&&(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:10}}>
              {secItems.map((item,i)=>(
                <div key={i} style={{backgroundColor:P.surface,borderRadius:8,padding:"12px 16px",border:`1px solid ${P.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:600}}>{item.l}</div>
                    <div style={{fontSize:10,color:P.textSec,marginTop:2}}>{item.d}</div>
                  </div>
                  <Badge color={item.c} bg={`${item.c}18`}>{item.s}</Badge>
                </div>
              ))}
            </div>
          )}

          {/* MILESTONES */}
          {view==="milestones"&&(
            <div style={{position:"relative",paddingLeft:20}}>
              <div style={{position:"absolute",left:9,top:0,bottom:0,width:2,backgroundColor:P.border}}/>
              {milestones.map((m,i)=>(
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:16,marginBottom:16,position:"relative"}}>
                  <div style={{width:20,height:20,borderRadius:10,backgroundColor:m.done?m.c:`${m.c}30`,border:`2px solid ${m.c}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,flexShrink:0,zIndex:1}}>{m.icon}</div>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:m.c}}>{m.date}</div>
                    <div style={{fontSize:12,color:m.done?P.textSec:P.text,fontWeight:m.done?400:600}}>{m.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 5S VIEW */}
          {view==="5s"&&(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12}}>
              {fiveSData.map((item,i)=>(
                <div key={i} style={{backgroundColor:P.surface,borderRadius:10,border:`1px solid ${P.border}`,padding:"16px 20px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <span style={{fontSize:13,fontWeight:700,color:item.color}}>{item.s} — {item.name}</span>
                    <Badge color={item.color} bg={`${item.color}18`}>{item.status}</Badge>
                  </div>
                  <div style={{fontSize:12,color:P.text,marginBottom:4,fontWeight:600}}>{item.value}</div>
                  <div style={{fontSize:10,color:P.textSec,marginBottom:8}}>{item.target}</div>
                  <div style={{height:6,backgroundColor:P.surfaceAlt,borderRadius:3,overflow:"hidden",marginBottom:8}}>
                    <div style={{width:`${item.pct}%`,height:"100%",backgroundColor:item.color,borderRadius:3,transition:"width 0.3s"}}/>
                  </div>
                  <div style={{fontSize:10,color:P.textMuted,lineHeight:"15px"}}>{item.detail}</div>
                </div>
              ))}
            </div>
          )}

          {/* CAUSAL GRAPH */}
          {view==="causal"&&(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:0,padding:"20px 0"}}>
              <div style={{fontSize:11,color:P.textMuted,letterSpacing:"0.1em",marginBottom:20,fontWeight:600}}>GRAPHE CAUSAL SIMPLIFIE — 6 COUCHES</div>
              {causalLayers.map((layer,i)=>(
                <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                  <div style={{
                    backgroundColor:P.surface,border:`2px solid ${layer.color}`,borderRadius:10,
                    padding:"16px 28px",minWidth:320,textAlign:"center",transition:"transform 0.15s",cursor:"default"
                  }}>
                    <div style={{fontSize:12,fontWeight:700,color:layer.color,letterSpacing:"0.05em"}}>{layer.name}</div>
                    <div style={{fontSize:10,color:P.textSec,marginTop:6,lineHeight:"16px"}}>
                      {layer.concepts.join(" \u00b7 ")}
                    </div>
                  </div>
                  {i<causalLayers.length-1&&(
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",margin:"2px 0"}}>
                      <div style={{width:2,height:16,backgroundColor:P.border}}/>
                      <div style={{fontSize:10,color:P.textMuted}}>{"\u25bc"}</div>
                      <div style={{width:2,height:4,backgroundColor:P.border}}/>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DETAIL PANEL — slide-out right */}
        {detailItem&&(
          <div style={{
            width:360,minHeight:"100%",backgroundColor:P.surface,borderLeft:`1px solid ${P.border}`,
            padding:"20px",flexShrink:0,position:"relative",
            animation:"slideIn 0.2s ease-out"
          }}>
            <button onClick={()=>setSelectedItem(null)} style={{
              position:"absolute",top:12,right:12,width:28,height:28,borderRadius:14,
              border:`1px solid ${P.border}`,backgroundColor:P.card,color:P.textSec,
              fontSize:14,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center"
            }}>{"\u2715"}</button>

            <div style={{fontSize:10,color:P.textMuted,letterSpacing:"0.1em",marginBottom:8}}>DETAIL — {detailItem.column}</div>
            <div style={{fontSize:16,fontWeight:700,color:P.text,marginBottom:12,paddingRight:32}}>{detailItem.title}</div>

            <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
              <Dot p={detailItem.p}/>
              <Badge color={detailItem.p==="P0"?P.rose:detailItem.p==="P1"?P.gold:P.textMuted} bg={detailItem.p==="P0"?P.roseSoft:detailItem.p==="P1"?P.goldSoft:P.surfaceAlt}>{detailItem.p}</Badge>
              {detailItem.tags.map(t=><Badge key={t} color={P.textSec} bg={P.surfaceAlt}>{t}</Badge>)}
            </div>

            <div style={{fontSize:11,color:P.textSec,lineHeight:"18px",marginBottom:16,padding:"12px",backgroundColor:P.card,borderRadius:8,border:`1px solid ${P.border}`}}>
              {detailItem.detail}
            </div>

            {detailItem.deadline&&(
              <div style={{marginBottom:16}}>
                <div style={{fontSize:10,color:P.textMuted,fontWeight:600,marginBottom:4}}>DEADLINE</div>
                <div style={{fontSize:12,color:new Date(detailItem.deadline)<new Date(TODAY)?P.rose:P.text,fontWeight:600}}>
                  {"\u23f0"} {detailItem.deadline}
                </div>
              </div>
            )}

            {detailItem.assignee&&(
              <div style={{marginBottom:16}}>
                <div style={{fontSize:10,color:P.textMuted,fontWeight:600,marginBottom:4}}>RESPONSABLE</div>
                <Badge color={detailItem.assignee==="JP"?P.gold:P.accent} bg={detailItem.assignee==="JP"?P.goldSoft:P.accentSoft}>{detailItem.assignee}</Badge>
              </div>
            )}

            {/* CTA buttons */}
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:20}}>
              <button onClick={()=>toggleComplete(detailItem.id)} style={{
                padding:"8px 16px",borderRadius:6,border:`1px solid ${isCompleted(detailItem.id)?P.textMuted:P.emerald}`,
                backgroundColor:isCompleted(detailItem.id)?P.surfaceAlt:P.emeraldSoft,
                color:isCompleted(detailItem.id)?P.textMuted:P.emerald,
                fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"
              }}>{isCompleted(detailItem.id)?"\u21a9 Restaurer":"✓ Marquer FAIT"}</button>
            </div>
          </div>
        )}
      </div>

      {/* 5S FOOTER — always visible */}
      <div style={{
        position:"fixed",bottom:0,left:0,right:0,
        backgroundColor:P.surface,borderTop:`1px solid ${P.border}`,
        padding:"8px 24px",display:"flex",gap:20,alignItems:"center",
        justifyContent:"space-between",zIndex:20,flexWrap:"wrap"
      }}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:9,color:P.textMuted,fontWeight:700,letterSpacing:"0.1em"}}>5S</span>
        </div>
        {/* S1 Seiri */}
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:9,color:P.textMuted,fontWeight:600}}>S1</span>
          <div style={{width:60,height:5,backgroundColor:P.surfaceAlt,borderRadius:3,overflow:"hidden"}}>
            <div style={{width:"100%",height:"100%",backgroundColor:P.rose,borderRadius:3}}/>
          </div>
          <span style={{fontSize:9,color:P.rose,fontWeight:600}}>220/60</span>
        </div>
        {/* S2 Seiton */}
        <div style={{display:"flex",alignItems:"center",gap:4}}>
          <span style={{fontSize:9,color:P.textMuted,fontWeight:600}}>S2</span>
          <Badge color={P.rose} bg={P.roseSoft}>NON CONF.</Badge>
        </div>
        {/* S3 Seiso */}
        <div style={{display:"flex",alignItems:"center",gap:4}}>
          <span style={{fontSize:9,color:P.textMuted,fontWeight:600}}>S3</span>
          <span style={{fontSize:10,fontWeight:700,color:P.gold}}>~10</span>
          <span style={{fontSize:9,color:P.textMuted}}>bridges</span>
        </div>
        {/* S4 Seiketsu */}
        <div style={{display:"flex",alignItems:"center",gap:4}}>
          <span style={{fontSize:9,color:P.textMuted,fontWeight:600}}>S4</span>
          <Badge color={P.emerald} bg={P.emeraldSoft}>0 PASS</Badge>
        </div>
        {/* S5 Shitsuke */}
        <div style={{display:"flex",alignItems:"center",gap:4}}>
          <span style={{fontSize:9,color:P.textMuted,fontWeight:600}}>S5</span>
          <span style={{fontSize:10,fontWeight:700,color:P.rose}}>1/5</span>
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes slideIn {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
