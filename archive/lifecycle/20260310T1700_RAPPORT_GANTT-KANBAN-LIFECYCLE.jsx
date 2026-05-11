import { useState } from "react";

/* ═══════════════════════════════════════════════════════════════
   AEGIS Intelligence — GANTT / KANBAN / LIFECYCLE Dashboard
   Aligned: 20260310T1700 CET
   Last IDs: D119 / L106 / R43
   LIFECYCLE_MASTER: v2.4.0
   v3.1 EN PRODUCTION (commit 4837709)
   ═══════════════════════════════════════════════════════════════ */

const P = {
  bg: "#0c0f14",
  surface: "#151921",
  surfaceAlt: "#1a1f2b",
  card: "#1e2433",
  cardHover: "#242a3a",
  text: "#e8ecf4",
  textSec: "#8891a5",
  textMuted: "#5a6278",
  border: "rgba(255,255,255,0.06)",
  borderLight: "rgba(255,255,255,0.10)",
  accent: "#3b82f6",
  accentSoft: "rgba(59,130,246,0.12)",
  emerald: "#10b981",
  emeraldSoft: "rgba(16,185,129,0.12)",
  gold: "#f59e0b",
  goldSoft: "rgba(245,158,11,0.12)",
  rose: "#f43f5e",
  roseSoft: "rgba(244,63,94,0.12)",
  copper: "#c2956a",
  copperSoft: "rgba(194,149,106,0.12)",
  violet: "#8b5cf6",
  violetSoft: "rgba(139,92,246,0.12)",
  cyan: "#06b6d4",
  cyanSoft: "rgba(6,182,212,0.12)",
};

const STATUS = {
  DONE: { label: "FAIT", color: P.emerald, bg: P.emeraldSoft },
  LIVE: { label: "EN PRODUCTION", color: P.emerald, bg: P.emeraldSoft },
  ACTIVE: { label: "EN COURS", color: P.accent, bg: P.accentSoft },
  PLANNED: { label: "PLANIFIE", color: P.violet, bg: P.violetSoft },
  BACKLOG: { label: "BACKLOG", color: P.textMuted, bg: "rgba(90,98,120,0.12)" },
  BLOCKED: { label: "BLOQUE", color: P.rose, bg: P.roseSoft },
  DEFERRED: { label: "DEFERE", color: P.copper, bg: P.copperSoft },
  VALIDATE: { label: "A VALIDER JP", color: P.gold, bg: P.goldSoft },
};

/* ── GANTT Timeline Data ── */
const ganttData = [
  {
    id: "v3.1", label: "v3.1 Production", status: STATUS.LIVE,
    start: "2026-03-05", end: "2026-03-10", lane: 0,
    note: "EN PRODUCTION commit 4837709 — 95.4% Desktop, 93.8% Mobile",
  },
  {
    id: "v3.2", label: "v3.2 Stabilisation + Auth", status: STATUS.ACTIVE,
    start: "2026-03-11", end: "2026-04-06", lane: 1,
    note: "BUG-01/02, Hero, SSR/SSG, Supabase Auth, Stripe, Contact, polices",
  },
  {
    id: "gseo", label: "GSEO Q2 2026", status: STATUS.PLANNED,
    start: "2026-04-01", end: "2026-06-30", lane: 2,
    note: "Generative SEO — profondeur contextuelle par page (D47)",
  },
  {
    id: "v3.3", label: "v3.3 GCI", status: STATUS.PLANNED,
    start: "2026-04-07", end: "2026-05-18", lane: 1,
    note: "Gouvernance Cognitive Integree Pearl-Simon-Damasio (D65)",
  },
  {
    id: "cirsn", label: "CIRSN-V Pipeline", status: STATUS.PLANNED,
    start: "2026-04-15", end: "2026-06-15", lane: 3,
    note: "Collect-Index-RAG-Store-Notify-Validate (~830 lignes PS)",
  },
  {
    id: "v4.0", label: "v4.0 Multi-langue + DPP", status: STATUS.PLANNED,
    start: "2026-05-19", end: "2026-08-02", lane: 1,
    note: "Localisation EU (DE/ES/IT/PT/NL), EBW/eIDAS 2.0, DPP",
  },
  {
    id: "aiact", label: "EU AI Act Full Applicability", status: STATUS.BLOCKED,
    start: "2026-08-02", end: "2026-08-02", lane: 4,
    note: "DEADLINE REGLEMENTAIRE — fenetre commerciale critique",
  },
  {
    id: "linkedin", label: "Article LinkedIn Lucidite", status: STATUS.ACTIVE,
    start: "2026-03-09", end: "2026-03-20", lane: 2,
    note: "Tribune Les Echos reponse — fenetre editoriale ~20/03 (D57)",
  },
  {
    id: "claude-code", label: "Claude Code remplacement AG", status: STATUS.VALIDATE,
    start: "2026-03-11", end: "2026-03-17", lane: 3,
    note: "POC BUG-01 — meme IDE, zero context switching (C1 JP)",
  },
];

/* ── KANBAN Columns ── */
const kanbanColumns = [
  {
    title: "FAIT / EN PRODUCTION",
    color: P.emerald,
    items: [
      { id: "K01", title: "v3.1 Homepage DEPLOYED (commit 4837709)", priority: "P0", tags: ["D119"], detail: "Build OK 58 modules, 95.4% Desktop, 93.8% Mobile, V&V JP confirmee" },
      { id: "K02", title: "6 MODs AG + 4 ANO + 11 corrections V&V JP", priority: "P0", tags: ["D52-D54","D109-D118"], detail: "Stats, CTA, regs, Trinity, pricing, TrustBadges, nav, modal, prompt" },
      { id: "K03", title: "System prompt 14 reglements", priority: "P0", tags: ["D94"], detail: "REACH+CSRD+UNECE+EN45545 ajoutes par Opus MCP" },
      { id: "K04", title: "Tier DIAGNOSTIC 250 EUR/rapport", priority: "P0", tags: ["D110"], detail: "Remplace PILOTAGE 50eur/mois. Positionnement expert." },
      { id: "K05", title: "Claude Desktop v1.1.5749 D10r2", priority: "P1", tags: ["D98"], detail: "Correctif DST. Computer use HORS PERIMETRE." },
      { id: "K06", title: "LIFECYCLE v2.4.0", priority: "P0", tags: ["D119","L106","R43"], detail: "Integration 4 bridges. Sprint v3.1 CLOS." },
      { id: "K07", title: "createPortal modal rapport", priority: "P0", tags: ["D117","L103"], detail: "Fix stacking context CSS transform" },
      { id: "K08", title: "Navigation 4 boutons scroll smooth", priority: "P0", tags: ["D116"], detail: "Mapping explicite label -> section id" },
    ],
  },
  {
    title: "EN COURS",
    color: P.gold,
    items: [
      { id: "K10", title: "Article LinkedIn Lucidite", priority: "P0", tags: ["D57"], detail: "Tribune Les Echos reponse — deadline ~20/03" },
      { id: "K11", title: "MAJ REGISTRE Google Drive", priority: "P1", tags: ["#20-34"], detail: "Rapport MAJ pret, JP a appliquer" },
      { id: "K12", title: "Routine synthese memoire hors-Projet", priority: "P1", tags: ["D101"], detail: "Solution B, 2-3 min/jour quotidien" },
    ],
  },
  {
    title: "SPRINT v3.2 (11/03 — 06/04)",
    color: P.accent,
    items: [
      { id: "K20", title: "BUG-01 react-markdown Brain IA", priority: "P0", tags: ["D96","R42"], detail: "Markdown raw *bold* # headers — POC Claude Code (C1)" },
      { id: "K21", title: "BUG-02 Brain EN repond en FR", priority: "P1", tags: ["D96","R36"], detail: "Reset messages[] au toggle langue" },
      { id: "K22", title: "Hero messaging supply chain", priority: "P1", tags: ["D97"], detail: "Sous-titres achats/BTP/production" },
      { id: "K23", title: "Aligner reglements PME (retirer DORA?)", priority: "P1", tags: [], detail: "Feedback JP post-deploy" },
      { id: "K24", title: "Polices + contraste couleurs", priority: "P1", tags: [], detail: "Feedback JP post-deploy" },
      { id: "K25", title: "SSR/SSG (SEO invisible SPA)", priority: "P1", tags: ["L6","R5"], detail: "React SPA = invisible Google" },
      { id: "K26", title: "Code-splitting html2pdf", priority: "P2", tags: [], detail: "Chunk 984 kB > 500 kB warning" },
      { id: "K27", title: "Supabase Auth + Dashboard MVP", priority: "P2", tags: [], detail: "Authentification utilisateurs" },
      { id: "K28", title: "Stripe Checkout DIAGNOSTIC+EXPERTISE", priority: "P2", tags: ["D110"], detail: "DIAGNOSTIC 250 EUR/rapport + EXPERTISE tarif custom" },
      { id: "K29", title: "Nettoyage code mort i18n + props", priority: "P2", tags: ["D107","R43"], detail: "Footer cles, onScrollToPricing, heroCta1/2" },
      { id: "K30", title: "Claude Code POC remplacement AG", priority: "P1", tags: ["C1"], detail: "Test BUG-01 — meme IDE, V&V integree" },
    ],
  },
  {
    title: "BACKLOG v3.3 / v4.0+",
    color: P.violet,
    items: [
      { id: "K40", title: "GCI Pearl-Simon-Damasio", priority: "P1", tags: ["D65"], detail: "Gouvernance Cognitive Integree v3.3" },
      { id: "K41", title: "Localisation multi-langue EU", priority: "P2", tags: ["v4.0"], detail: "DE/ES/IT/PT/NL — 1 sprint/paire" },
      { id: "K42", title: "CIRSN-V Pipeline", priority: "P1", tags: [], detail: "Veille reglementaire automatisee ~830 lignes PS" },
      { id: "K43", title: "EBW / eIDAS 2.0", priority: "P2", tags: [], detail: "European Business Wallet integration" },
      { id: "K44", title: "DPP Battery Regulation", priority: "P1", tags: ["D75-D76"], detail: "Passeport numerique batteries — obligation 2025" },
      { id: "K45", title: "GitHub Actions CI/CD", priority: "P2", tags: [], detail: "Lint/type-check/build after git push" },
      { id: "K46", title: "IAA (EU Industrial Accelerator Act)", priority: "P1", tags: ["D56"], detail: "10e verticale AEGIS — COM(2026)100" },
    ],
  },
];

/* ── Milestones ── */
const milestones = [
  { date: "10/03/2026", label: "Deploy v3.1 PRODUCTION", color: P.emerald, icon: "\u2705" },
  { date: "~20/03/2026", label: "Article LinkedIn Lucidite", color: P.accent, icon: "\uD83D\uDCDD" },
  { date: "06/04/2026", label: "v3.2 target", color: P.accent, icon: "\uD83C\uDFAF" },
  { date: "18/05/2026", label: "v3.3 GCI target", color: P.violet, icon: "\uD83E\uDDE0" },
  { date: "02/08/2026", label: "EU AI Act Full", color: P.rose, icon: "\u2696\uFE0F" },
];

/* ── Metrics ── */
const metrics = [
  { label: "Decisions", value: "D119", sub: "derniere: deploy v3.1 prod" },
  { label: "Lecons", value: "L106", sub: "derniere: prompt Gemini latence" },
  { label: "Risques actifs", value: "R43", sub: "5 nouveaux: R39-R43" },
  { label: "Production", value: "v3.1", sub: "commit 4837709 — 10/03" },
];

/* ════════════════ Component ════════════════ */

const Badge = ({ children, color, bg }) => (
  <span style={{
    display: "inline-block", padding: "2px 7px", borderRadius: 4,
    fontSize: 10, fontWeight: 600, letterSpacing: "0.03em",
    color, backgroundColor: bg, lineHeight: "16px",
  }}>{children}</span>
);

const PriorityDot = ({ p }) => {
  const c = p === "P0" ? P.rose : p === "P1" ? P.gold : P.textMuted;
  return <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: 3, backgroundColor: c, marginRight: 6 }} />;
};

export default function GanttKanbanLifecycle() {
  const [view, setView] = useState("kanban");
  const [expandedCard, setExpandedCard] = useState(null);

  /* ── GANTT rendering helpers ── */
  const ganttStartDate = new Date("2026-02-15");
  const ganttEndDate = new Date("2026-08-15");
  const totalDays = (ganttEndDate - ganttStartDate) / (1000 * 60 * 60 * 24);
  const todayOffset = ((new Date("2026-03-10") - ganttStartDate) / (1000 * 60 * 60 * 24)) / totalDays * 100;

  const getBarStyle = (item) => {
    const start = new Date(item.start);
    const end = new Date(item.end);
    const left = Math.max(0, ((start - ganttStartDate) / (1000 * 60 * 60 * 24)) / totalDays * 100);
    const width = Math.max(1, ((end - start) / (1000 * 60 * 60 * 24)) / totalDays * 100);
    return { left: `${left}%`, width: `${width}%` };
  };

  const months = ["FEV", "MAR", "AVR", "MAI", "JUN", "JUL", "AOU"];
  const monthPositions = months.map((_, i) => {
    const d = new Date(2026, 1 + i, 1);
    return ((d - ganttStartDate) / (1000 * 60 * 60 * 24)) / totalDays * 100;
  });

  const lanes = ["Production", "Sprints", "Marketing", "Pipeline", "Reglementaire"];

  return (
    <div style={{ fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace", backgroundColor: P.bg, color: P.text, minHeight: "100vh", padding: 0 }}>

      {/* ── Header ── */}
      <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${P.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: P.textMuted, letterSpacing: "0.1em", marginBottom: 4 }}>AEGIS INTELLIGENCE</div>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: P.text }}>
              GANTT / KANBAN / LIFECYCLE
            </h1>
            <div style={{ fontSize: 11, color: P.textSec, marginTop: 4 }}>
              Aligne 20260310T1700 CET — LIFECYCLE v2.4.0 — IDs D119 / L106 / R43 — v3.1 PRODUCTION
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["kanban", "gantt", "milestones"].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: "6px 14px", borderRadius: 6, border: `1px solid ${view === v ? P.accent : P.border}`,
                backgroundColor: view === v ? P.accentSoft : "transparent",
                color: view === v ? P.accent : P.textSec, cursor: "pointer",
                fontSize: 11, fontWeight: 600, letterSpacing: "0.03em",
                fontFamily: "inherit", textTransform: "uppercase",
              }}>{v}</button>
            ))}
          </div>
        </div>

        {/* ── Metrics strip ── */}
        <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          {metrics.map((m, i) => (
            <div key={i} style={{
              flex: "1 1 140px", padding: "10px 14px", borderRadius: 8,
              backgroundColor: P.surface, border: `1px solid ${P.border}`,
            }}>
              <div style={{ fontSize: 10, color: P.textMuted, letterSpacing: "0.05em" }}>{m.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: P.accent, marginTop: 2 }}>{m.value}</div>
              <div style={{ fontSize: 9, color: P.textMuted, marginTop: 2 }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── KANBAN View ── */}
      {view === "kanban" && (
        <div style={{ padding: "16px 24px", overflowX: "auto" }}>
          <div style={{ display: "flex", gap: 14, minWidth: 1000 }}>
            {kanbanColumns.map((col, ci) => (
              <div key={ci} style={{ flex: "1 1 240px", minWidth: 240 }}>
                <div style={{
                  padding: "8px 12px", marginBottom: 10, borderRadius: 8,
                  backgroundColor: P.surface, borderLeft: `3px solid ${col.color}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: col.color, letterSpacing: "0.04em" }}>{col.title}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: P.textMuted,
                    backgroundColor: P.surfaceAlt, padding: "2px 8px", borderRadius: 10,
                  }}>{col.items.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {col.items.map(item => {
                    const isExpanded = expandedCard === item.id;
                    return (
                      <div key={item.id}
                        onClick={() => setExpandedCard(isExpanded ? null : item.id)}
                        style={{
                          padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                          backgroundColor: isExpanded ? P.cardHover : P.card,
                          border: `1px solid ${isExpanded ? P.borderLight : P.border}`,
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                          <PriorityDot p={item.priority} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: P.text, lineHeight: 1.4 }}>{item.title}</div>
                            {isExpanded && (
                              <div style={{ fontSize: 10, color: P.textSec, marginTop: 6, lineHeight: 1.5 }}>{item.detail}</div>
                            )}
                            <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                              <Badge color={P.textMuted} bg={P.surfaceAlt}>{item.priority}</Badge>
                              {item.tags.map((t, ti) => (
                                <Badge key={ti} color={P.accent} bg={P.accentSoft}>{t}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── GANTT View ── */}
      {view === "gantt" && (
        <div style={{ padding: "16px 24px", overflowX: "auto" }}>
          <div style={{ minWidth: 900 }}>
            {/* Month headers */}
            <div style={{ position: "relative", height: 28, marginLeft: 130, marginBottom: 4 }}>
              {months.map((m, i) => (
                <div key={m} style={{
                  position: "absolute", left: `${monthPositions[i]}%`,
                  fontSize: 10, fontWeight: 600, color: P.textMuted, letterSpacing: "0.08em",
                }}>{m} 2026</div>
              ))}
            </div>

            {/* Lanes */}
            {lanes.map((lane, li) => {
              const laneItems = ganttData.filter(d => d.lane === li);
              if (laneItems.length === 0) return null;
              return (
                <div key={li} style={{ display: "flex", marginBottom: 6, alignItems: "center" }}>
                  <div style={{
                    width: 120, flexShrink: 0, fontSize: 10, fontWeight: 600,
                    color: P.textMuted, letterSpacing: "0.04em", paddingRight: 10, textAlign: "right",
                  }}>{lane}</div>
                  <div style={{
                    flex: 1, position: "relative", height: laneItems.length * 32 + 8,
                    backgroundColor: P.surface, borderRadius: 6, border: `1px solid ${P.border}`,
                    overflow: "hidden",
                  }}>
                    {/* Today line */}
                    <div style={{
                      position: "absolute", left: `${todayOffset}%`, top: 0, bottom: 0,
                      width: 1, backgroundColor: P.rose, opacity: 0.5, zIndex: 2,
                    }} />
                    <div style={{
                      position: "absolute", left: `${todayOffset}%`, top: -1,
                      transform: "translateX(-50%)", fontSize: 8, fontWeight: 700,
                      color: P.rose, backgroundColor: P.roseSoft, padding: "1px 5px",
                      borderRadius: "0 0 4px 4px", zIndex: 3,
                    }}>10/03</div>

                    {/* Month grid lines */}
                    {monthPositions.map((pos, i) => (
                      <div key={i} style={{
                        position: "absolute", left: `${pos}%`, top: 0, bottom: 0,
                        width: 1, backgroundColor: P.border,
                      }} />
                    ))}

                    {/* Bars */}
                    {laneItems.map((item, idx) => {
                      const barStyle = getBarStyle(item);
                      const isPoint = item.start === item.end;
                      return (
                        <div key={item.id} title={`${item.label}\n${item.note}`} style={{
                          position: "absolute",
                          top: idx * 32 + 6,
                          left: barStyle.left,
                          width: isPoint ? 12 : barStyle.width,
                          height: 22,
                          backgroundColor: item.status.bg,
                          border: `1px solid ${item.status.color}40`,
                          borderRadius: isPoint ? "50%" : 4,
                          display: "flex", alignItems: "center",
                          paddingLeft: isPoint ? 0 : 8,
                          cursor: "default", zIndex: 1,
                          justifyContent: isPoint ? "center" : "flex-start",
                        }}>
                          {!isPoint && (
                            <span style={{
                              fontSize: 9, fontWeight: 600, color: item.status.color,
                              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            }}>{item.label}</span>
                          )}
                          {isPoint && (
                            <span style={{ fontSize: 10, color: item.status.color }}>{"\u25C6"}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Legend */}
            <div style={{ display: "flex", gap: 16, marginTop: 14, marginLeft: 130, flexWrap: "wrap" }}>
              {[STATUS.LIVE, STATUS.ACTIVE, STATUS.PLANNED, STATUS.BLOCKED, STATUS.VALIDATE].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: s.bg, border: `1px solid ${s.color}40` }} />
                  <span style={{ fontSize: 9, color: P.textMuted }}>{s.label}</span>
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 10, height: 1, backgroundColor: P.rose }} />
                <span style={{ fontSize: 9, color: P.textMuted }}>AUJOURD'HUI</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Milestones View ── */}
      {view === "milestones" && (
        <div style={{ padding: "20px 24px" }}>
          <div style={{ maxWidth: 600 }}>
            {milestones.map((m, i) => (
              <div key={i} style={{
                display: "flex", gap: 16, padding: "14px 0",
                borderBottom: i < milestones.length - 1 ? `1px solid ${P.border}` : "none",
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  backgroundColor: P.surface, border: `1px solid ${P.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, flexShrink: 0,
                }}>{m.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: P.text }}>{m.label}</div>
                  <div style={{ fontSize: 11, color: m.color, fontWeight: 600, marginTop: 2 }}>{m.date}</div>
                </div>
              </div>
            ))}

            {/* Key deadlines */}
            <div style={{
              marginTop: 20, padding: 16, borderRadius: 10,
              backgroundColor: P.roseSoft, border: `1px solid ${P.rose}30`,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: P.rose, letterSpacing: "0.05em" }}>
                DEADLINES REGLEMENTAIRES CRITIQUES
              </div>
              <div style={{ fontSize: 11, color: P.text, marginTop: 8, lineHeight: 1.8 }}>
                <div><strong style={{ color: P.gold }}>2025</strong> — Battery Regulation 2023/1542 : obligation passeport numerique</div>
                <div><strong style={{ color: P.rose }}>02/08/2026</strong> — EU AI Act : applicabilite complete</div>
                <div><strong style={{ color: P.accent }}>Q4 2026</strong> — CRA (Cyber Resilience Act) : premieres obligations</div>
                <div><strong style={{ color: P.violet }}>2027</strong> — ESPR (Ecodesign) : DPP obligations etendues</div>
              </div>
            </div>

            {/* Claude Code decision */}
            <div style={{
              marginTop: 14, padding: 16, borderRadius: 10,
              backgroundColor: P.accentSoft, border: `1px solid ${P.accent}30`,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: P.accent, letterSpacing: "0.05em" }}>
                DECISION C1 — CLAUDE CODE REMPLACEMENT AG
              </div>
              <div style={{ fontSize: 11, color: P.text, marginTop: 8, lineHeight: 1.8 }}>
                <div><strong>POC</strong> : Sprint v3.2 — test BUG-01 react-markdown via Claude Code Desktop</div>
                <div><strong>Benefices</strong> : Meme IDE, zero context switching, V&V integree, KB Projet accessible</div>
                <div><strong>Securite</strong> : D10r2 maintenu, MCP Filesystem local autorise, git diff obligatoire avant push</div>
                <div><strong>Statut</strong> : A VALIDER JP — POC planifie semaine 11</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div style={{
        padding: "12px 24px", borderTop: `1px solid ${P.border}`,
        marginTop: 20, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
      }}>
        <div style={{ fontSize: 9, color: P.textMuted }}>
          AEGIS Intelligence — 20260310T1700 — LIFECYCLE v2.4.0 — D119/L106/R43 — v3.1 PRODUCTION — ASCII-safe
        </div>
        <div style={{ fontSize: 9, color: P.textMuted }}>
          Convention : YYYYMMDDTHHMM_TYPE_DESCRIPTION — IDs temporaires D_THHMM_xx (D80)
        </div>
      </div>
    </div>
  );
}
