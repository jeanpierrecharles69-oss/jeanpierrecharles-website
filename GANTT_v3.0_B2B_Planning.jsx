import { useState, useEffect } from "react";

const PHASES = [
  {
    id: "P0",
    name: "AUDIT & CAPITALISATION",
    color: "#ef4444",
    start: 0, // Day offset from Feb 13
    duration: 2,
    tasks: [
      { name: "REX v2.6.0 — extraction lessons learned", day: 0, dur: 1, owner: "Claude+JP", critical: true },
      { name: "Audit sécurité post-déploiement (cross-validation AG)", day: 0, dur: 1, owner: "AG+Claude", critical: true },
      { name: "Intégrer feedback Perplexity/ChatGPT/utilisateurs", day: 0, dur: 2, owner: "JP", critical: false },
      { name: "Mise à jour AEGIS_REGISTRE_TRACABILITE", day: 0, dur: 1, owner: "JP", critical: true },
      { name: "Convergence recommandations AG vs Claude", day: 1, dur: 1, owner: "Claude+AG", critical: true },
    ],
  },
  {
    id: "P1",
    name: "ARCHITECTURE B2B",
    color: "#f59e0b",
    start: 2,
    duration: 3,
    tasks: [
      { name: "Spécification Supabase (auth, RLS, schéma DB)", day: 2, dur: 2, owner: "Claude→AG", critical: true },
      { name: "Spécification Stripe (plans, webhooks, facturation)", day: 2, dur: 2, owner: "Claude→AG", critical: true },
      { name: "Architecture multi-tenant & isolation données", day: 3, dur: 2, owner: "AG+Claude", critical: true },
      { name: "Spécification API routes backend (/api/*)", day: 3, dur: 1, owner: "Claude", critical: false },
      { name: "Design system B2B (dashboard, onboarding)", day: 4, dur: 1, owner: "AG", critical: false },
    ],
  },
  {
    id: "P2",
    name: "IMPLÉMENTATION CORE",
    color: "#3b82f6",
    start: 5,
    duration: 4,
    tasks: [
      { name: "Supabase: auth + RLS + tables métier", day: 5, dur: 2, owner: "AG", critical: true },
      { name: "Stripe: intégration checkout + webhooks", day: 5, dur: 2, owner: "AG", critical: true },
      { name: "Tailwind compilé (exit CDN) + bundle optimization", day: 6, dur: 1, owner: "AG", critical: false },
      { name: "Dashboard B2B client (React components)", day: 7, dur: 2, owner: "AG", critical: true },
      { name: "Aegis AI: base de connaissances étendue", day: 7, dur: 2, owner: "AG+Claude", critical: false },
      { name: "Pages légales B2B (CGV, mentions, DPA)", day: 8, dur: 1, owner: "Claude", critical: true },
    ],
  },
  {
    id: "P3",
    name: "V&V / TESTS",
    color: "#8b5cf6",
    start: 9,
    duration: 3,
    tasks: [
      { name: "Tests unitaires composants critiques", day: 9, dur: 1, owner: "AG", critical: false },
      { name: "Test intégration Supabase↔Stripe↔Frontend", day: 9, dur: 2, owner: "AG+Claude", critical: true },
      { name: "Audit sécurité complet (OWASP Top 10)", day: 10, dur: 1, owner: "Claude", critical: true },
      { name: "Tests RGPD & conformité (cookie, DPA, Art.6)", day: 10, dur: 1, owner: "Claude", critical: true },
      { name: "Tests mobile/responsive + accessibilité WCAG", day: 11, dur: 1, owner: "JP", critical: false },
      { name: "Cross-validation AG vs Claude (divergences)", day: 11, dur: 1, owner: "AG+Claude", critical: true },
    ],
  },
  {
    id: "P4",
    name: "PRÉ-PROD & DEPLOY",
    color: "#10b981",
    start: 12,
    duration: 2,
    tasks: [
      { name: "Build final + vérification bundle (no secrets)", day: 12, dur: 1, owner: "JP+Claude", critical: true },
      { name: "Checklist pré-déploiement (REX v2.6.0)", day: 12, dur: 1, owner: "Claude", critical: true },
      { name: "Vercel env vars B2B (Supabase, Stripe keys)", day: 12, dur: 1, owner: "JP", critical: true },
      { name: "git push main → Vercel auto-deploy v3.0", day: 13, dur: 1, owner: "JP", critical: true },
      { name: "Smoke tests production live", day: 13, dur: 1, owner: "JP+Claude", critical: true },
      { name: "Rollback plan validé si échec", day: 13, dur: 1, owner: "Claude", critical: true },
    ],
  },
];

const DAYS = Array.from({ length: 15 }, (_, i) => {
  const d = new Date(2026, 1, 13 + i);
  return {
    num: i,
    date: d,
    label: d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" }),
    isWeekend: d.getDay() === 0 || d.getDay() === 6,
    isDeadline: i === 14,
    isToday: i === 0,
  };
});

const LESSONS = [
  { id: "L1", title: "Confusion Vercel vs GitHub env vars", impact: "Critique", fix: "Checklist séparée Vercel/GitHub, vérification post-deploy obligatoire", applies: "P4" },
  { id: "L2", title: "Hallucination Claude sur procédures (vercel --prod)", impact: "Haute", fix: "Toujours chercher l'historique avant de proposer une procédure. Cross-validation obligatoire", applies: "Tous" },
  { id: "L3", title: "API key exposée dans bundle VITE_", impact: "Critique", fix: "Scan automatique bundle pré-push: Select-String -Pattern 'AIzaSy|supabase|sk_'. Proxy-only architecture", applies: "P2,P4" },
  { id: "L4", title: "RGPD: cookie banner mélangé avec consentement IA", impact: "Haute", fix: "Séparation systématique des consentements. Audit CNIL checklist", applies: "P2,P3" },
  { id: "L5", title: "Commit massif (70+ fichiers) sans review", impact: "Moyenne", fix: "Commits atomiques par domaine (SEC, RGPD, FEAT, DOCS). Review pre-push", applies: "P2,P4" },
  { id: "L6", title: "Divergence assessment sécurité Claude vs AG", impact: "Haute", fix: "Cross-validation systématique sur implémentations critiques (auth, paiement, données)", applies: "P3" },
  { id: "L7", title: "Absence de tests automatisés", impact: "Haute", fix: "Tests unitaires composants critiques + tests intégration avant deploy", applies: "P3" },
  { id: "L8", title: "Dette documentaire (70 fichiers AFRS obsolètes)", impact: "Moyenne", fix: "Documentation vivante dans PRJ pillars, archivage immédiat des obsolètes", applies: "P0" },
];

const STRATEGY = [
  {
    tool: "Claude.ai",
    icon: "🧠",
    color: "#d97706",
    strengths: "Analyse critique, sécurité, conformité RGPD, architecture, documentation stratégique, cross-validation",
    tasks: "Spécifications, audits sécurité, pages légales, REX, planning, review code critique, REGISTRE",
    workflow: "Analyse → recommandation → validation JP → sync AG pour implémentation",
  },
  {
    tool: "Google Antigravity (Gemini)",
    icon: "⚡",
    color: "#3b82f6",
    strengths: "Génération code rapide avec contexte projet, itération UI, implémentation bulk, prototypage",
    tasks: "Composants React, intégration Supabase/Stripe, Tailwind, dashboard B2B, tests unitaires",
    workflow: "Spec Claude/JP → implémentation AG → review Claude → validation JP → git push",
  },
  {
    tool: "Pipeline Sync (PowerShell)",
    icon: "🔄",
    color: "#8b5cf6",
    strengths: "Continuité entre outils, traçabilité, synchronisation automatique 15min",
    tasks: "Transfert fichiers AG→Drive→Claude, export specs Claude→Drive→AG, logs sync",
    workflow: "AG génère → sync Drive (15min) → Claude review → feedback Drive → AG itère",
  },
  {
    tool: "Jean-Pierre (Décideur)",
    icon: "👤",
    color: "#10b981",
    strengths: "Expertise métier 32 ans, validation décisions, tests utilisateur réel, connaissance réglementaire",
    tasks: "Arbitrage convergence AG/Claude, tests prod, validation UX, décisions architecture",
    workflow: "Review recommandations → décision → REGISTRE → exécution",
  },
];

const CRITICAL_ELEMENTS = [
  { category: "Sécurité", items: ["OWASP Top 10 audit complet", "Supabase RLS (Row Level Security) impératif", "Stripe webhook signature verification", "CSP headers pour Supabase/Stripe domains", "Secret scanning pré-commit (pas de clés dans bundle)"] },
  { category: "Juridique B2B", items: ["CGV (Conditions Générales de Vente)", "DPA (Data Processing Agreement) — RGPD Art.28", "Mentions légales B2B mises à jour", "Politique de confidentialité B2B", "SLA (Service Level Agreement) si applicable"] },
  { category: "Performance", items: ["Tailwind compilé (exit CDN) — gain ~200ms", "Lazy loading html2pdf + composants lourds", "Bundle splitting par route", "Lighthouse score > 90 sur les 4 métriques"] },
  { category: "Observabilité", items: ["Analytics (Plausible/Umami RGPD-friendly)", "Monitoring uptime Vercel", "Error tracking (Sentry ou équivalent)", "Logs API proxy structurés"] },
  { category: "UX/Accessibilité", items: ["Menu hamburger mobile", "WCAG 2.1 AA minimum", "Logos SVG clients (vs PNG)", "Onboarding B2B flow", "SEO: meta tags, sitemap, robots.txt"] },
  { category: "Résilience", items: ["Rollback automatique Vercel (instant rollback)", "Backup Supabase DB automatique", "Plan de continuité si API Gemini down", "Tests de charge basiques"] },
];

export default function GanttPlanning() {
  const [activeTab, setActiveTab] = useState("gantt");
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [hoveredTask, setHoveredTask] = useState(null);

  const tabs = [
    { id: "gantt", label: "Planning Gantt", icon: "📊" },
    { id: "strategy", label: "Stratégie Outils", icon: "🔧" },
    { id: "lessons", label: "REX v2.6.0", icon: "📚" },
    { id: "critical", label: "Éléments Critiques", icon: "⚠️" },
  ];

  const dayWidth = 58;
  const headerH = 36;

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", background: "#0f172a", color: "#e2e8f0", minHeight: "100vh", padding: "20px" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Aegis Circular — Commit c2c532b</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, background: "linear-gradient(135deg, #f59e0b, #ef4444, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          v2.6.0 → v3.0 B2B — Planning Gantt
        </h1>
        <div style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>
          13 février → <span style={{ color: "#ef4444", fontWeight: 700 }}>27 février 2026</span> — 14 jours calendaires · Deadline production
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, justifyContent: "center", flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: "8px 16px", borderRadius: 8, border: "1px solid",
            borderColor: activeTab === t.id ? "#f59e0b" : "#334155",
            background: activeTab === t.id ? "rgba(245,158,11,0.15)" : "transparent",
            color: activeTab === t.id ? "#f59e0b" : "#94a3b8",
            fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* === GANTT TAB === */}
      {activeTab === "gantt" && (
        <div>
          {/* Legend */}
          <div style={{ display: "flex", gap: 16, marginBottom: 16, justifyContent: "center", flexWrap: "wrap", fontSize: 11 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "#ef4444", display: "inline-block" }} /> Chemin critique</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "#334155", border: "1px solid #475569", display: "inline-block" }} /> Tâche standard</span>
            <span style={{ color: "#fbbf24" }}>🔶 = Claude</span>
            <span style={{ color: "#60a5fa" }}>🔷 = AG Gemini</span>
            <span style={{ color: "#34d399" }}>🟢 = JP</span>
          </div>

          {/* Gantt Chart */}
          <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid #1e293b", background: "#0f172a" }}>
            {/* Day headers */}
            <div style={{ display: "flex", position: "sticky", top: 0, zIndex: 10 }}>
              <div style={{ width: 240, minWidth: 240, background: "#1e293b", padding: "8px 12px", fontSize: 11, fontWeight: 600, color: "#94a3b8", borderBottom: "1px solid #334155" }}>
                PHASE / TÂCHE
              </div>
              <div style={{ display: "flex" }}>
                {DAYS.map(d => (
                  <div key={d.num} style={{
                    width: dayWidth, minWidth: dayWidth, textAlign: "center", padding: "6px 0",
                    fontSize: 10, fontWeight: 600, borderBottom: "1px solid #334155", borderLeft: "1px solid #1e293b",
                    background: d.isDeadline ? "rgba(239,68,68,0.2)" : d.isToday ? "rgba(245,158,11,0.15)" : d.isWeekend ? "#1a1f2e" : "#1e293b",
                    color: d.isDeadline ? "#ef4444" : d.isToday ? "#f59e0b" : d.isWeekend ? "#475569" : "#94a3b8",
                  }}>
                    {d.label}
                    {d.isToday && <div style={{ fontSize: 8, color: "#f59e0b" }}>AUJOURD'HUI</div>}
                    {d.isDeadline && <div style={{ fontSize: 8, color: "#ef4444" }}>DEADLINE</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Phases and tasks */}
            {PHASES.map(phase => (
              <div key={phase.id}>
                {/* Phase header row */}
                <div style={{ display: "flex", cursor: "pointer", background: selectedPhase === phase.id ? "rgba(255,255,255,0.05)" : "transparent" }}
                  onClick={() => setSelectedPhase(selectedPhase === phase.id ? null : phase.id)}>
                  <div style={{
                    width: 240, minWidth: 240, padding: "8px 12px", fontSize: 12, fontWeight: 700,
                    borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", gap: 8,
                    color: phase.color, borderLeft: `3px solid ${phase.color}`
                  }}>
                    <span style={{ fontSize: 10, background: phase.color, color: "#fff", padding: "1px 6px", borderRadius: 4, fontFamily: "'JetBrains Mono', monospace" }}>{phase.id}</span>
                    {phase.name}
                  </div>
                  <div style={{ display: "flex", position: "relative", flex: 1 }}>
                    {DAYS.map(d => (
                      <div key={d.num} style={{
                        width: dayWidth, minWidth: dayWidth, borderBottom: "1px solid #1e293b", borderLeft: "1px solid #0f172a",
                        background: d.isWeekend ? "#141825" : "transparent",
                        position: "relative"
                      }}>
                        {d.num >= phase.start && d.num < phase.start + phase.duration && (
                          <div style={{
                            position: "absolute", top: 4, left: d.num === phase.start ? 4 : 0,
                            right: d.num === phase.start + phase.duration - 1 ? 4 : 0,
                            height: 24, borderRadius: d.num === phase.start ? "6px 0 0 6px" : d.num === phase.start + phase.duration - 1 ? "0 6px 6px 0" : 0,
                            background: `${phase.color}33`, borderTop: `2px solid ${phase.color}`, borderBottom: `2px solid ${phase.color}`,
                            borderLeft: d.num === phase.start ? `2px solid ${phase.color}` : "none",
                            borderRight: d.num === phase.start + phase.duration - 1 ? `2px solid ${phase.color}` : "none",
                          }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Task rows */}
                {phase.tasks.map((task, ti) => (
                  <div key={ti} style={{ display: "flex", background: hoveredTask === `${phase.id}-${ti}` ? "rgba(255,255,255,0.03)" : "transparent" }}
                    onMouseEnter={() => setHoveredTask(`${phase.id}-${ti}`)} onMouseLeave={() => setHoveredTask(null)}>
                    <div style={{
                      width: 240, minWidth: 240, padding: "5px 12px 5px 28px", fontSize: 11,
                      borderBottom: "1px solid #0f172a", color: task.critical ? "#fbbf24" : "#94a3b8",
                      display: "flex", alignItems: "center", gap: 6, lineHeight: 1.3
                    }}>
                      {task.critical && <span style={{ fontSize: 8, color: "#ef4444" }}>●</span>}
                      <span style={{ flex: 1 }}>{task.name}</span>
                      <span style={{ fontSize: 9, color: "#64748b", whiteSpace: "nowrap", fontFamily: "'JetBrains Mono', monospace" }}>
                        {task.owner.includes("Claude") ? "🔶" : ""}{task.owner.includes("AG") ? "🔷" : ""}{task.owner.includes("JP") ? "🟢" : ""}
                      </span>
                    </div>
                    <div style={{ display: "flex" }}>
                      {DAYS.map(d => (
                        <div key={d.num} style={{
                          width: dayWidth, minWidth: dayWidth, borderBottom: "1px solid #0f172a", borderLeft: "1px solid #0a0f1a",
                          background: d.isWeekend ? "#0d1117" : "transparent", position: "relative", height: 28,
                        }}>
                          {d.num >= task.day && d.num < task.day + task.dur && (
                            <div style={{
                              position: "absolute", top: 6, bottom: 6,
                              left: d.num === task.day ? 4 : 0,
                              right: d.num === task.day + task.dur - 1 ? 4 : 0,
                              borderRadius: d.num === task.day ? "4px 0 0 4px" : d.num === task.day + task.dur - 1 ? "0 4px 4px 0" : 0,
                              background: task.critical
                                ? `linear-gradient(90deg, ${phase.color}88, ${phase.color}cc)`
                                : `${phase.color}44`,
                              border: task.critical ? `1px solid ${phase.color}` : "none",
                            }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Critical path summary */}
          <div style={{ marginTop: 20, background: "#1e1a1a", borderRadius: 12, padding: 16, border: "1px solid #7f1d1d" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#ef4444", marginTop: 0, marginBottom: 10 }}>⚡ Chemin Critique — 14 jours</h3>
            <div style={{ fontSize: 12, color: "#fca5a5", lineHeight: 1.8 }}>
              REX v2.6.0 (J0) → Convergence AG/Claude (J1) → Spec Supabase+Stripe (J2-3) → Architecture multi-tenant (J3-4) → Impl. Supabase+Stripe (J5-6) → Dashboard B2B (J7-8) → Pages légales (J8) → Tests intégration (J9-10) → Audit OWASP (J10) → Build final (J12) → Deploy prod (J13) → Smoke tests (J13)
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 8 }}>
              ⚠️ <strong style={{ color: "#fbbf24" }}>Alerte délai :</strong> 14 jours calendaires dont 4 jours de week-end = <strong>10 jours ouvrés effectifs</strong>. Marge quasi nulle. Tout retard sur le chemin critique décale le déploiement.
            </div>
          </div>
        </div>
      )}

      {/* === STRATEGY TAB === */}
      {activeTab === "strategy" && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: "#f8fafc" }}>Stratégie d'exploitation opérationnelle</h2>
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 0, marginBottom: 20 }}>Répartition des rôles Claude ↔ AG Gemini ↔ Pipeline Sync ↔ Jean-Pierre</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
            {STRATEGY.map(s => (
              <div key={s.tool} style={{ background: "#1e293b", borderRadius: 12, padding: 16, border: `1px solid ${s.color}33`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -20, right: -10, fontSize: 60, opacity: 0.06 }}>{s.icon}</div>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: s.color, margin: "0 0 10px" }}>{s.tool}</h3>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Forces</div>
                  <div style={{ fontSize: 11, color: "#cbd5e1", lineHeight: 1.5 }}>{s.strengths}</div>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Tâches assignées</div>
                  <div style={{ fontSize: 11, color: "#cbd5e1", lineHeight: 1.5 }}>{s.tasks}</div>
                </div>
                <div style={{ background: "#0f172a", borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 10, color: s.color, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Workflow</div>
                  <div style={{ fontSize: 11, color: "#e2e8f0", lineHeight: 1.5, fontFamily: "'JetBrains Mono', monospace" }}>{s.workflow}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Operational flow */}
          <div style={{ marginTop: 20, background: "#1e293b", borderRadius: 12, padding: 16, border: "1px solid #334155" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f59e0b", marginTop: 0 }}>🔄 Flux opérationnel quotidien recommandé</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginTop: 12 }}>
              {[
                { time: "Matin", icon: "🌅", steps: "1. JP ouvre Claude.ai → brief du jour\n2. Claude analyse priorités + risques\n3. JP valide plan → sync Drive\n4. AG récupère specs (sync 15min)" },
                { time: "Dev (AG)", icon: "⚡", steps: "5. AG implémente (code gen)\n6. Sync auto → Drive toutes les 15min\n7. Commits intermédiaires Git\n8. JP teste en local (npm run dev)" },
                { time: "Review (Claude)", icon: "🔍", steps: "9. JP partage output AG → Claude\n10. Claude review sécurité + conformité\n11. Cross-validation divergences\n12. Corrections si nécessaire" },
                { time: "Fin de journée", icon: "🌙", steps: "13. git add + commit atomique\n14. git push → Vercel preview\n15. MAJ REGISTRE_TRACABILITE\n16. Brief J+1 dans Claude" },
              ].map(block => (
                <div key={block.time} style={{ background: "#0f172a", borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc", marginBottom: 6 }}>{block.icon} {block.time}</div>
                  <pre style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap", fontFamily: "'JetBrains Mono', monospace" }}>{block.steps}</pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === LESSONS TAB === */}
      {activeTab === "lessons" && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: "#f8fafc" }}>REX v2.6.0 — Lessons Learned</h2>
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 0, marginBottom: 20 }}>Capitalisation sur le retour d'expérience du déploiement v2.6.0 (commit c2c532b)</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {LESSONS.map(l => (
              <div key={l.id} style={{
                background: "#1e293b", borderRadius: 10, padding: 14,
                borderLeft: `3px solid ${l.impact === "Critique" ? "#ef4444" : l.impact === "Haute" ? "#f59e0b" : "#3b82f6"}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>{l.id}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#f8fafc" }}>{l.title}</span>
                  </div>
                  <span style={{
                    fontSize: 10, padding: "2px 8px", borderRadius: 12, fontWeight: 600,
                    background: l.impact === "Critique" ? "#7f1d1d" : l.impact === "Haute" ? "#78350f" : "#1e3a5f",
                    color: l.impact === "Critique" ? "#fca5a5" : l.impact === "Haute" ? "#fbbf24" : "#60a5fa",
                  }}>
                    {l.impact}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "#10b981", lineHeight: 1.5, marginBottom: 4 }}>
                  ✅ <strong>Mesure corrective v3.0 :</strong> {l.fix}
                </div>
                <div style={{ fontSize: 10, color: "#64748b" }}>Appliqué en phase : {l.applies}</div>
              </div>
            ))}
          </div>

          {/* Skills & Knowledge Learned */}
          <div style={{ marginTop: 20, background: "#1a2332", borderRadius: 12, padding: 16, border: "1px solid #1e3a5f" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#60a5fa", marginTop: 0 }}>🎓 Skills & Knowledge Acquis</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 10 }}>
              {[
                { cat: "DevOps", skills: "Pipeline Git→GitHub→Vercel, env vars management, auto-deploy, rollback" },
                { cat: "Sécurité", skills: "Proxy API architecture, CORS, rate limiting, secret scanning, security headers" },
                { cat: "RGPD", skills: "Cookie banner séparé, consentement IA Art.6.1.a, DPA, transparence algorithmique" },
                { cat: "Multi-IA", skills: "Cross-validation Claude/AG, détection hallucinations, workflow hybride, sync pipeline" },
                { cat: "React/Vite", skills: "React 19, Vite build, Gemini API integration, composants modulaires" },
                { cat: "Gestion de projet", skills: "REGISTRE traçabilité, REX systématique, commits atomiques, checklist deploy" },
              ].map(s => (
                <div key={s.cat} style={{ background: "#0f172a", borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa", marginBottom: 4 }}>{s.cat}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.5 }}>{s.skills}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === CRITICAL ELEMENTS TAB === */}
      {activeTab === "critical" && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: "#f8fafc" }}>Éléments Critiques Existentiels</h2>
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 0, marginBottom: 20 }}>Facteurs non mentionnés dans la requête initiale mais essentiels à la réussite du chantier v3.0 B2B</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
            {CRITICAL_ELEMENTS.map(cat => (
              <div key={cat.category} style={{ background: "#1e293b", borderRadius: 12, padding: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fbbf24", margin: "0 0 10px" }}>
                  {cat.category === "Sécurité" ? "🛡️" : cat.category === "Juridique B2B" ? "⚖️" : cat.category === "Performance" ? "⚡" : cat.category === "Observabilité" ? "📡" : cat.category === "UX/Accessibilité" ? "♿" : "🔁"} {cat.category}
                </h3>
                {cat.items.map((item, i) => (
                  <div key={i} style={{ fontSize: 11, color: "#cbd5e1", padding: "4px 0", borderBottom: i < cat.items.length - 1 ? "1px solid #0f172a" : "none", display: "flex", alignItems: "flex-start", gap: 6 }}>
                    <span style={{ color: "#f59e0b", fontSize: 8, marginTop: 4 }}>▸</span>
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Risk assessment */}
          <div style={{ marginTop: 20, background: "#1e1a1a", borderRadius: 12, padding: 16, border: "1px solid #7f1d1d" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#ef4444", marginTop: 0 }}>🚨 Évaluation Risques Majeurs</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 10, marginTop: 10 }}>
              {[
                { risk: "Délai 14 jours trop serré pour B2B complet", proba: "ÉLEVÉE", impact: "Critique", mitigation: "Scope v3.0-alpha : auth + dashboard + paiement uniquement. Features secondaires en v3.1" },
                { risk: "Intégration Supabase/Stripe complexité sous-estimée", proba: "MOYENNE", impact: "Haute", mitigation: "Commencer par auth Supabase seul (J5), Stripe en J6-7. Si retard → Stripe en v3.1" },
                { risk: "Régression sécurité lors du refactoring", proba: "MOYENNE", impact: "Critique", mitigation: "Audit OWASP obligatoire P3, cross-validation AG/Claude, scan secrets pré-push" },
                { risk: "Divergence AG/Claude non détectée", proba: "FAIBLE", impact: "Haute", mitigation: "Cross-validation systématique sur auth, paiement, RLS. JP arbitre les divergences" },
              ].map((r, i) => (
                <div key={i} style={{ background: "#0f172a", borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#fca5a5", marginBottom: 6 }}>{r.risk}</div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 8, background: r.proba === "ÉLEVÉE" ? "#7f1d1d" : r.proba === "MOYENNE" ? "#78350f" : "#1e3a5f", color: r.proba === "ÉLEVÉE" ? "#fca5a5" : r.proba === "MOYENNE" ? "#fbbf24" : "#60a5fa" }}>P: {r.proba}</span>
                    <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 8, background: r.impact === "Critique" ? "#7f1d1d" : "#78350f", color: r.impact === "Critique" ? "#fca5a5" : "#fbbf24" }}>I: {r.impact}</span>
                  </div>
                  <div style={{ fontSize: 10, color: "#10b981" }}>↳ {r.mitigation}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation for AG comparison */}
          <div style={{ marginTop: 20, background: "#1a2332", borderRadius: 12, padding: 16, border: "1px solid #1e3a5f" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#60a5fa", marginTop: 0 }}>🔄 Points de convergence à valider avec AG Gemini 3.0 Flash</h3>
            <div style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.7 }}>
              Lors de la comparaison des réponses Claude vs AG, concentrez-vous sur ces points de divergence potentielle :
            </div>
            <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                "Architecture Supabase RLS — modèle multi-tenant",
                "Workflow Stripe — checkout vs invoicing",
                "Priorité Tailwind compilé vs Supabase d'abord",
                "Estimation charge en jours (optimisme AG vs réalisme Claude)",
                "Approche tests : TDD vs tests post-implémentation",
                "Sécurité : couverture OWASP complète ou ciblée",
              ].map((pt, i) => (
                <div key={i} style={{ fontSize: 11, color: "#94a3b8", padding: "4px 8px", background: "#0f172a", borderRadius: 6 }}>
                  🔍 {pt}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
