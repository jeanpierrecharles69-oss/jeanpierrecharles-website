import { useState } from "react";

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
};

const ganttData=[
  {id:"v31",label:"v3.1 PRODUCTION",status:ST.DONE,start:"2026-03-05",end:"2026-03-10",lane:0,note:"commit 4837709 — 18/18 V-Gate"},
  {id:"v311",label:"v3.1.1 PRODUCTION",status:ST.LIVE,start:"2026-03-12",end:"2026-03-18",lane:0,note:"commit b8d4cb6 — Blog + OG tags"},
  {id:"v32",label:"v3.2 Sprint",status:ST.ACTIVE,start:"2026-03-24",end:"2026-04-06",lane:1,note:"BUG-01/02 + SSR/SSG + campagne S13"},
  {id:"v33",label:"v3.3 GCI",status:ST.PLANNED,start:"2026-04-07",end:"2026-05-18",lane:1,note:"Pearl-Simon-Damasio + CIRSN-V spec"},
  {id:"v40",label:"v4.0",status:ST.PLANNED,start:"2026-05-19",end:"2026-09-11",lane:1,note:"Multi-tenant + SecNumCloud + EBW"},
  {id:"llmo",label:"LinkedIn LLMO",status:ST.DONE,start:"2026-03-18",end:"2026-03-23",lane:2,note:"158→221/270 (82%) — 5/5 outils"},
  {id:"mkt",label:"Campagne MKT S13",status:ST.ACTIVE,start:"2026-03-24",end:"2026-04-04",lane:2,note:"Posts #3-#5 + reseaux + CRA"},
  {id:"gseo",label:"GSEO Q2",status:ST.PLANNED,start:"2026-04-01",end:"2026-06-30",lane:2,note:"D47+D62 + articles blog"},
  {id:"cra_consult",label:"Consultation CRA",status:ST.ACTION,start:"2026-03-23",end:"2026-03-31",lane:3,note:"Decision JP 25/03 — deadline 31/03"},
  {id:"cirsn",label:"CIRSN-V Pipeline",status:ST.PLANNED,start:"2026-04-15",end:"2026-06-15",lane:3,note:"Context Hub + Prompt Library"},
  {id:"cra",label:"CRA Signalement 24h",status:ST.BLOCKED,start:"2026-09-11",end:"2026-09-11",lane:4,note:"PREMIERE DEADLINE — D198"},
  {id:"mach",label:"Machinery 2023/1230",status:ST.BLOCKED,start:"2027-01-20",end:"2027-01-20",lane:4,note:"INCHANGE par Omnibus"},
  {id:"cra_full",label:"CRA Conformite complete",status:ST.BLOCKED,start:"2027-12-11",end:"2027-12-11",lane:4,note:"INCHANGE par Omnibus"},
  {id:"aiact",label:"AI Act Annexe III (Omnibus)",status:ST.COND,start:"2027-12-02",end:"2027-12-02",lane:4,note:"SI Omnibus adopte — etait 02/08/2026"},
  {id:"aiact2",label:"AI Act Annexe I (Omnibus)",status:ST.COND,start:"2028-08-02",end:"2028-08-02",lane:4,note:"SI Omnibus adopte — etait 02/08/2027"},
];

const kanbanCols=[
  {title:"FAIT / PROD",color:P.emerald,items:[
    {id:"K01",title:"v3.1 LIVE",p:"P0",tags:["D119"],detail:"commit 4837709 — 18/18 V-Gate — Brain IA FR+EN"},
    {id:"K02",title:"v3.1.1 LIVE",p:"P0",tags:["D203"],detail:"commit b8d4cb6 — Blog + OG tags + Omnibus VII"},
    {id:"K03",title:"LIFECYCLE v2.5.1",p:"P0",tags:["D240","L166","R75"],detail:"Integration 25 bridges 23/03/2026"},
    {id:"K04",title:"Desktop v1.1.7053 D10r2",p:"P1",tags:["D184"],detail:"Build cc1949 — MCP stable — MODE RESTREINT"},
    {id:"K05",title:"CLI v2.1.74 NO GO",p:"P0",tags:["D183"],detail:"Binaire dormant — pas sandbox OS Windows"},
    {id:"K06",title:"LinkedIn LLMO 82%",p:"P0",tags:["D222"],detail:"158→221/270 — 5/5 outils triangulation"},
    {id:"K07",title:"Post #1 Pearl + Post #2 Manifeste",p:"P1",tags:["D224"],detail:"Publies 18+23/03 — 208 impressions"},
    {id:"K08",title:"Banniere LinkedIn D70",p:"P1",tags:["D223"],detail:"Machinery + Battery Reg + Regulatory Intelligence"},
    {id:"K09",title:"aegis-desktop-vv.ps1",p:"P1",tags:["D212"],detail:"V&V automatisee PASS 10/10"},
    {id:"K10",title:"KB nettoyage 40 fichiers",p:"P1",tags:["D240"],detail:"5 lots supprimes 17/03"},
  ]},
  {title:"SPRINT v3.2 ACTIF",color:P.accent,items:[
    {id:"K20",title:"BUG-01 react-markdown Brain",p:"P0",tags:["R10"],detail:"Raw **bold** visible — P0"},
    {id:"K21",title:"BUG-02 Brain EN→FR",p:"P1",tags:["R36"],detail:"Language toggle ne reset pas messages[]"},
    {id:"K22",title:"Hero messaging Anti-Agent Drift",p:"P1",tags:["D162"],detail:"Achats/BTP/Production/CAPEX"},
    {id:"K23",title:"SSR/SSG SEO",p:"P1",tags:["R5"],detail:"SPA invisible Google — prerender"},
    {id:"K24",title:".gitignore .md bridges",p:"P1",tags:["R66"],detail:"Fichiers non-tracked en racine"},
    {id:"K25",title:"og:image par article",p:"P2",tags:["D207"],detail:"Pas jpc.jpg generique"},
  ]},
  {title:"CAMPAGNE S13 (24-31/03)",color:P.orange,items:[
    {id:"A01",title:"Decision consultation CRA",p:"P0",tags:["D225"],detail:"JP tranche AVANT 25/03 — irreversible"},
    {id:"A02",title:"Post #3 CRA signalement 24h",p:"P1",tags:["D224"],detail:"N1 pedagogique — 24-25/03"},
    {id:"A03",title:"Post #4 SBOM CRA",p:"P1",tags:["D224"],detail:"N1 pedagogique — 26-28/03"},
    {id:"A04",title:"Commentaires leaders 3-5",p:"P1",tags:["D227"],detail:"Billois, Drouard, Scheelen"},
    {id:"A05",title:"Activation ex-collegues",p:"P1",tags:["D227"],detail:"WhatsApp+email personnalise"},
    {id:"A06",title:"Activation CCI DOM-TOM",p:"P1",tags:["D226"],detail:"Guadeloupe + Martinique"},
    {id:"A07",title:"Soumission CRA (si OUI)",p:"P1",tags:["D225"],detail:"2-3 pages EN avant 31/03"},
  ]},
  {title:"A VALIDER JP",color:P.gold,items:[
    {id:"V01",title:"Extension SMC <=750 emp",p:"P1",tags:["D200"],detail:"Omnibus elargit exemptions PME"},
    {id:"V02",title:"These fondatrice = one-liner About",p:"P1",tags:["D220"],detail:"PRINCIPE FONDATEUR"},
    {id:"V03",title:"Strategie 50/30/20 Pearl",p:"P1",tags:["D221"],detail:"Pedagogique/Expertise/Action"},
    {id:"V04",title:"Regulatory Compliance Layer",p:"P1",tags:["D238"],detail:"Positionnement ecosysteme souverain"},
    {id:"V05",title:"DryRun 87% actif MKT",p:"P2",tags:["D209"],detail:"Signal validation externe dette cognitive"},
  ]},
  {title:"BACKLOG v3.3+",color:P.violet,items:[
    {id:"B01",title:"GCI Pearl-Simon-Damasio",p:"P1",tags:["D65"],detail:"10 piliers epistemologiques v3.3"},
    {id:"B02",title:"GSEO anti-substitution",p:"P1",tags:["D62"],detail:"Profondeur > volume Q2 2026"},
    {id:"B03",title:"Regulatory Prompt Library",p:"P1",tags:["D231"],detail:"CIRSN-V spec — tokens seuils"},
    {id:"B04",title:"Article GSEO #2 World Models",p:"P1",tags:["D239"],detail:"Convergence AMI/AEGIS"},
    {id:"B05",title:"CIRSN-V system prompt",p:"P1",tags:["D210"],detail:"JP human-V&V-approval-loop"},
    {id:"B06",title:"Contact de Sarthe Q2",p:"P2",tags:["D237"],detail:"Craft AI partenariat potentiel"},
    {id:"B07",title:"Page entreprise LinkedIn",p:"P2",tags:["D228"],detail:"AEGIS Intelligence"},
    {id:"B08",title:"SecNumCloud v4.0",p:"P2",tags:["D233"],detail:"Cloud souverain"},
  ]},
];

const secItems=[
  {l:"MCP externe",s:"PROTEGE",c:P.emerald,d:"INTERDIT D37+D10r2"},
  {l:"MCP Filesystem local",s:"AUTORISE",c:P.emerald,d:"4 repertoires — reconnect upstream fix"},
  {l:"AG Antigravity",s:"CONFINE",c:P.emerald,d:"Editing statique — sandbox-exec casse"},
  {l:"Secrets en clair",s:"ZERO TOL.",c:P.emerald,d:"D_SEC_01 — nom variable seulement"},
  {l:"Git push",s:"HUMAN-LOOP",c:P.emerald,d:"JP seul — git add <fichier> (D204)"},
  {l:"CLI v2.1.74",s:"INTERDIT",c:P.rose,d:"NO GO D183 — pas sandbox OS Windows"},
  {l:"DXT/Cowork/CU",s:"INTERDIT",c:P.rose,d:"LayerX CVSS 10 non patche — D10r2"},
  {l:"CIRSN-V docs ext.",s:"GAP AMBRE",c:P.gold,d:"System prompt JP V&V a definir — D210"},
  {l:"RAG knowledge base",s:"A DEFINIR",c:P.gold,d:"Validation provenance — backlog v3.3"},
];

const milestones=[
  {date:"10/03/2026",label:"v3.1 PRODUCTION commit 4837709",c:P.emerald,icon:"\u2705",done:true},
  {date:"11/03/2026",label:"LIFECYCLE v2.5.0 (D167/L120/R58)",c:P.emerald,icon:"\u2705",done:true},
  {date:"17/03/2026",label:"v3.1.1 PRODUCTION commit b8d4cb6",c:P.emerald,icon:"\u2705",done:true},
  {date:"18/03/2026",label:"OG tags fix + Post #1 LinkedIn",c:P.emerald,icon:"\u2705",done:true},
  {date:"23/03/2026",label:"LinkedIn LLMO 82% + LIFECYCLE v2.5.1",c:P.emerald,icon:"\u2705",done:true},
  {date:"25/03/2026",label:"Decision consultation CRA (JP)",c:P.orange,icon:"\u26a0\ufe0f",done:false},
  {date:"31/03/2026",label:"Deadline consultation CRA",c:P.rose,icon:"\u23f0",done:false},
  {date:"06/04/2026",label:"v3.2 target",c:P.accent,icon:"\ud83c\udfaf",done:false},
  {date:"18/05/2026",label:"v3.3 GCI Pearl-Simon-Damasio",c:P.violet,icon:"\ud83e\udde0",done:false},
  {date:"11/09/2026",label:"CRA Signalement 24h — PREMIERE DEADLINE",c:P.rose,icon:"\u2696\ufe0f",done:false},
  {date:"20/01/2027",label:"Machinery Reg 2023/1230 (INCHANGE)",c:P.rose,icon:"\u2699\ufe0f",done:false},
  {date:"02/12/2027",label:"AI Act Annexe III (SI Omnibus)",c:P.cyan,icon:"\ud83d\udce6",done:false},
];

const Badge=({children,color,bg})=>(
  <span style={{display:"inline-block",padding:"2px 7px",borderRadius:4,fontSize:10,fontWeight:600,letterSpacing:"0.03em",color,backgroundColor:bg,lineHeight:"16px"}}>{children}</span>
);
const Dot=({p})=>{
  const c=p==="P0"?P.rose:p==="P1"?P.gold:P.textMuted;
  return <span style={{display:"inline-block",width:6,height:6,borderRadius:3,backgroundColor:c,marginRight:6,marginTop:3,flexShrink:0}}/>;
};

export default function GanttKanbanMaster(){
  const [view,setView]=useState("kanban");
  const [exp,setExp]=useState(null);

  const TODAY="2026-03-23";
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
  const views=["kanban","gantt","securite","milestones"];

  return(
    <div style={{fontFamily:"'JetBrains Mono','SF Mono',monospace",backgroundColor:P.bg,color:P.text,minHeight:"100vh"}}>

      {/* HEADER */}
      <div style={{padding:"20px 24px 16px",borderBottom:`1px solid ${P.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{fontSize:10,color:P.textMuted,letterSpacing:"0.1em",marginBottom:4}}>AEGIS INTELLIGENCE — LIFECYCLE MASTER TRACKER v2.5.1</div>
            <div style={{fontSize:18,fontWeight:700}}>Governance Dashboard</div>
            <div style={{fontSize:11,color:P.textSec,marginTop:4}}>
              IDs: D240 / L166 / R75 — v3.1.1 PROD (b8d4cb6) — Desktop v1.1.7053 D10r2 — LinkedIn LLMO 82%
            </div>
          </div>
          <div style={{display:"flex",gap:6}}>
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

      <div style={{padding:"16px 24px 40px"}}>

        {/* KANBAN */}
        {view==="kanban"&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:12}}>
            {kanbanCols.map((col,ci)=>(
              <div key={ci} style={{backgroundColor:P.surface,borderRadius:10,border:`1px solid ${P.border}`,overflow:"hidden"}}>
                <div style={{padding:"12px 14px 10px",borderBottom:`1px solid ${P.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:11,fontWeight:700,color:col.color,letterSpacing:"0.05em"}}>{col.title}</span>
                  <Badge color={col.color} bg={`${col.color}18`}>{col.items.length}</Badge>
                </div>
                <div style={{padding:8,display:"flex",flexDirection:"column",gap:6}}>
                  {col.items.map(item=>(
                    <div key={item.id} onClick={()=>setExp(exp===item.id?null:item.id)} style={{
                      backgroundColor:P.card,borderRadius:8,padding:"10px 12px",cursor:"pointer",
                      border:`1px solid ${exp===item.id?P.accent:P.border}`,transition:"border-color 0.15s"
                    }}>
                      <div style={{display:"flex",alignItems:"flex-start"}}>
                        <Dot p={item.p}/>
                        <div style={{flex:1}}>
                          <div style={{fontSize:12,fontWeight:600,lineHeight:"16px"}}>{item.title}</div>
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
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* GANTT */}
        {view==="gantt"&&(
          <div style={{backgroundColor:P.surface,borderRadius:10,border:`1px solid ${P.border}`,overflow:"hidden"}}>
            <div style={{position:"relative",padding:"10px 0 0 110px",overflowX:"auto"}}>
              {/* Month headers */}
              <div style={{display:"flex",position:"relative",height:24,borderBottom:`1px solid ${P.border}`}}>
                {months.map((m,i)=>(
                  <div key={i} style={{position:"absolute",left:`${mpos[i]}%`,fontSize:9,color:P.textMuted,fontWeight:600}}>{m}</div>
                ))}
              </div>
              {/* Today line */}
              <div style={{position:"absolute",left:`calc(110px + ${todayOff}%)`,top:0,bottom:0,width:1,backgroundColor:P.rose,zIndex:10,opacity:0.5}}/>
              <div style={{position:"absolute",left:`calc(110px + ${todayOff}% - 28px)`,top:2,fontSize:8,color:P.rose,fontWeight:700,zIndex:11}}>23/03</div>
              {/* Lanes */}
              {lanes.map((lane,li)=>(
                <div key={li} style={{position:"relative",height:38,borderBottom:`1px solid ${P.border}`,display:"flex",alignItems:"center"}}>
                  <div style={{position:"absolute",left:-106,width:100,fontSize:9,color:P.textMuted,textAlign:"right",fontWeight:600}}>{lane}</div>
                  {ganttData.filter(d=>d.lane===li).map(item=>{
                    const bar=getBar(item);
                    return(
                      <div key={item.id} title={`${item.label}\n${item.note}`} style={{
                        position:"absolute",left:bar.left,width:bar.width,minWidth:item.start===item.end?8:undefined,
                        height:22,borderRadius:4,backgroundColor:item.status.bg,border:`1px solid ${item.status.color}40`,
                        display:"flex",alignItems:"center",padding:"0 6px",overflow:"hidden",cursor:"default"
                      }}>
                        <span style={{fontSize:9,fontWeight:600,color:item.status.color,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
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
      </div>
    </div>
  );
}
