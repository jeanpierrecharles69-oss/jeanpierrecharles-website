import { useState } from "react";

const C = {
  bg: "#f8fafc",
  surface: "#ffffff",
  surfaceAlt: "#f1f5f9",
  text: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#94a3b8",
  border: "rgba(15,23,42,0.08)",
  borderMed: "rgba(15,23,42,0.12)",
  glassBg: "rgba(255,255,255,0.72)",
  glassBlur: "blur(16px)",
  accent: "#3b82f6",
  accentGlow: "#60a5fa",
  emerald: "#10b981",
  gold: "#f59e0b",
  rose: "#f43f5e",
  copper: "#c2956a",
  gradientHero: "linear-gradient(170deg, #ffffff 0%, #f0f4ff 40%, #f0fdf4 80%, #f8fafc 100%)",
  gradientBlue: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
  shadowSoft: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMed: "0 4px 12px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.03)",
  shadowLg: "0 12px 32px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)",
};

const trinityItems = [
  {
    icon: "🧠",
    title: "32 ans d'expertise R&D",
    sub: "Patrimoine intellectuel industriel",
    desc: "De la conception à la série — automobile, batteries, ferroviaire, défense",
    color: C.copper,
    gradient: "linear-gradient(135deg, #c2956a20, #c2956a08)",
  },
  {
    icon: "🛡️",
    title: "AEGIS Circular",
    sub: "Plateforme Compliance EU",
    desc: "SaaS B2B couvrant 27+ États membres — veille, roadmap, ingénierie",
    color: C.accent,
    gradient: "linear-gradient(135deg, #3b82f620, #3b82f608)",
  },
  {
    icon: "✨",
    title: "AEGIS Intelligence",
    sub: "Moteur IA réglementaire",
    desc: "Analyse d'impact en <30s — alimentée par 32 ans de terrain",
    color: C.emerald,
    gradient: "linear-gradient(135deg, #10b98120, #10b98108)",
  },
];

const trinityEN = [
  { ...trinityItems[0], title: "32 years of R&D expertise", sub: "Industrial intellectual capital", desc: "From design to production — automotive, batteries, rail, defence" },
  { ...trinityItems[1], title: "AEGIS Circular", sub: "EU Compliance Platform", desc: "B2B SaaS covering 27+ Member States — watch, roadmap, engineering" },
  { ...trinityItems[2], title: "AEGIS Intelligence", sub: "Regulatory AI Engine", desc: "Impact analysis in <30s — powered by 32 years on the ground" },
];

const roiMetrics = [
  { value: "<30s", label: "Analyse d'impact", sub: "vs 2-4 semaines consultant" },
  { value: "-70%", label: "Temps conformité", sub: "automatisation veille + Kanban" },
  { value: "0", label: "Non-conformité", sub: "anticipée dès la conception" },
  { value: "27+", label: "États membres", sub: "couverture réglementaire EU" },
];

const roiEN = [
  { value: "<30s", label: "Impact analysis", sub: "vs 2-4 weeks consultant" },
  { value: "-70%", label: "Compliance time", sub: "automated watch + Kanban" },
  { value: "0", label: "Non-compliance", sub: "anticipated from design" },
  { value: "27+", label: "Member States", sub: "EU regulatory coverage" },
];

/* ─── Neuro-inclusive design principles (10 rules) ─── */
const neuroRules = [
  { id: "NI-01", label: "Fond", value: "Blanc pur ou gradient ultra-subtil — zéro pattern décoratif", status: "APPLIED" },
  { id: "NI-02", label: "Palette couleurs", value: "Maximum 3 couleurs fonctionnelles — pas de surcharge chromatique", status: "APPLIED" },
  { id: "NI-03", label: "Pictogrammes", value: "Icônes explicites et univoques — chaque icône = 1 concept unique", status: "APPLIED" },
  { id: "NI-04", label: "Typographie", value: "Inter sans-serif — hiérarchie par taille (pas par couleur seule)", status: "APPLIED" },
  { id: "NI-05", label: "Animations", value: "Réduites au strict minimum — pas de mouvement automatique ni clignotement", status: "TARGET v3.2" },
  { id: "NI-06", label: "Espacement", value: "Généreux — 1 concept = 1 bloc visuel isolé avec marge suffisante", status: "APPLIED" },
  { id: "NI-07", label: "Langage", value: "Littéral, concis, factuel — zéro métaphore, zéro jargon inutile", status: "APPLIED" },
  { id: "NI-08", label: "Layout", value: "Prévisible et cohérent — lecture naturelle haut vers bas, pas de surprise", status: "APPLIED" },
  { id: "NI-09", label: "Navigation", value: "Labels explicites sur chaque bouton — 1 CTA = 1 action clairement nommée", status: "APPLIED" },
  { id: "NI-10", label: "Charge cognitive", value: "Maximum 3-4 éléments par groupe visuel — pas de surcharge d'information", status: "APPLIED" },
];

export default function AegisIntelligenceMockup() {
  const [lang, setLang] = useState("fr");
  const [showNeuro, setShowNeuro] = useState(false);

  const items = lang === "fr" ? trinityItems : trinityEN;
  const metrics = lang === "fr" ? roiMetrics : roiEN;

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: C.bg, minHeight: "100vh", padding: 0 }}>
      {/* ─── Header Bar ─── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.border}`, padding: "12px 24px",
        display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
          AEGIS Intelligence Mockup v3.1
        </span>
        <span style={{ fontSize: 11, color: C.textMuted }}>20260224T1500 CET</span>
        <div style={{ display: "flex", gap: 6, marginLeft: 12 }}>
          {["fr", "en"].map(l => (
            <button key={l} onClick={() => setLang(l)} style={{
              padding: "4px 12px", borderRadius: 16, fontSize: 11, fontWeight: 600, cursor: "pointer",
              background: lang === l ? C.text : "transparent",
              color: lang === l ? "#fff" : C.textMuted,
              border: lang === l ? "none" : `1px solid ${C.borderMed}`,
            }}>{l.toUpperCase()}</button>
          ))}
        </div>
        <button onClick={() => setShowNeuro(!showNeuro)} style={{
          marginLeft: "auto", padding: "5px 14px", borderRadius: 20, fontSize: 11, fontWeight: 600,
          cursor: "pointer", border: `1px solid ${showNeuro ? C.emerald : C.borderMed}`,
          background: showNeuro ? `${C.emerald}10` : "transparent",
          color: showNeuro ? C.emerald : C.textSecondary,
        }}>
          {showNeuro ? "✓ " : ""}Grille Neuro-inclusive (10 règles)
        </button>
      </div>

      {/* ─── Hero Section ─── */}
      <section style={{
        background: C.gradientHero, borderRadius: 24, overflow: "hidden",
        padding: "40px 24px 48px", position: "relative",
        margin: 16, maxWidth: 900, marginLeft: "auto", marginRight: "auto",
      }}>
        {/* Decorative blobs */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", backgroundColor: C.accent, opacity: 0.06, filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 280, height: 280, borderRadius: "50%", backgroundColor: C.emerald, opacity: 0.05, filter: "blur(60px)", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 860, margin: "0 auto" }}>
          {/* EU Badge */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 11, fontWeight: 500, padding: "4px 12px",
              borderRadius: 20, marginBottom: 16,
              backgroundColor: `${C.accent}08`, color: C.accent, border: `1px solid ${C.accent}20`,
            }}>
              🇪🇺 {lang === "fr" ? "27 États membres UE + Régions ultrapériphériques" : "27 EU Member States + Outermost Regions"}
            </div>

            {/* H1 — full visible, no truncation (A8 fix) */}
            <h1 style={{ fontSize: "clamp(22px, 4vw, 36px)", fontWeight: 800, lineHeight: 1.2, color: C.text, margin: "0 0 8px" }}>
              {lang === "fr" ? "L'ingénieur R&D" : "The R&D engineer"}{" "}
              <span style={{ backgroundImage: C.gradientBlue, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {lang === "fr" ? "qui a conçu vos systèmes," : "who designed your systems,"}
              </span>
              <br />
              {lang === "fr" ? "pilote votre conformité EU." : "pilots your EU compliance."}
            </h1>
            <p style={{ fontSize: 14, color: C.textSecondary, maxWidth: 640, margin: "0 auto", lineHeight: 1.6 }}>
              {lang === "fr"
                ? "32 ans de développement produit mécatronique — des volants airbag Toyota aux batteries TGV 1500V — combinés à l'intelligence artificielle réglementaire."
                : "32 years of mechatronic product development — from Toyota airbag steering wheels to TGV 1500V batteries — combined with regulatory AI."
              }
            </p>
          </div>

          {/* ═══════════════════════════════════════ */}
          {/* TRINITY — Variante A (3 cards horiz.)  */}
          {/* ═══════════════════════════════════════ */}
          <div style={{ marginBottom: 28, marginTop: 28 }}>
            <p style={{
              textAlign: "center", fontSize: 11, fontWeight: 600,
              letterSpacing: "0.08em", color: C.textMuted,
              marginBottom: 12, textTransform: "uppercase",
            }}>
              {lang === "fr" ? "La force de la convergence" : "The power of convergence"}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {items.map((item, i) => (
                <div key={i} style={{
                  background: item.gradient, border: `1px solid ${item.color}18`,
                  borderRadius: 16, padding: "16px 14px", textAlign: "center",
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{item.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: item.color, marginBottom: 6, letterSpacing: "0.03em" }}>{item.sub}</div>
                  <div style={{ fontSize: 11, color: C.textSecondary, lineHeight: 1.4 }}>{item.desc}</div>
                  {i < 2 && (
                    <div style={{
                      position: "absolute", right: -8, top: "50%", transform: "translateY(-50%)",
                      fontSize: 16, color: C.textMuted, opacity: 0.4,
                    }}>+</div>
                  )}
                </div>
              ))}
            </div>
            <p style={{ textAlign: "center", fontSize: 12, fontWeight: 600, color: C.accent, marginTop: 10 }}>
              = {lang === "fr" ? "Expert Intelligence as a Service (EISaaS)" : "Expert Intelligence as a Service (EISaaS)"}
            </p>
          </div>

          {/* AEGIS Intelligence VUI Preview */}
          <div style={{
            background: C.surface, borderRadius: 16, padding: "20px 18px",
            border: `1px solid ${C.border}`, boxShadow: C.shadowMed, marginBottom: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: C.gradientBlue, display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 14, fontWeight: 700,
              }}>JP</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                  ✨ AEGIS Intelligence — {lang === "fr" ? "Analyste Conformité UE" : "EU Compliance Analyst"}
                </div>
                <div style={{ fontSize: 10, color: C.textMuted }}>32 ans R&D · 6 groupes · 8 règlements EU</div>
              </div>
              <div style={{ marginLeft: "auto", fontSize: 10, color: C.emerald, fontWeight: 600 }}>
                ● {lang === "fr" ? "En ligne" : "Online"}
              </div>
            </div>
            {[
              lang === "fr" ? "Quels impacts de l'AI Act sur mon système ADAS ?" : "What AI Act impacts on my ADAS system?",
              lang === "fr" ? "Obligations Règlement Batteries 2023/1542 pour un pack EV ?" : "Battery Regulation 2023/1542 obligations for an EV pack?",
            ].map((q, i) => (
              <div key={i} style={{
                background: `${C.accent}06`, border: `1px solid ${C.accent}15`,
                borderRadius: 12, padding: "8px 14px", fontSize: 12, color: C.accent,
                marginBottom: 6, cursor: "pointer",
              }}>💬 {q}</div>
            ))}
          </div>

          {/* ROI Metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
            {metrics.map((m, i) => (
              <div key={i} style={{ textAlign: "center", padding: "8px 4px" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.accent }}>{m.value}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{m.label}</div>
                <div style={{ fontSize: 9, color: C.textMuted }}>{m.sub}</div>
              </div>
            ))}
          </div>

          {/* Trust mini */}
          <div style={{ display: "flex", justifyContent: "center", gap: 16, fontSize: 11, color: C.textMuted }}>
            <span>🔐 {lang === "fr" ? "RGPD natif" : "GDPR native"}</span>
            <span>⚡ {lang === "fr" ? "Résultats en <30s" : "Results in <30s"}</span>
            <span>🎯 {lang === "fr" ? "0€ pour commencer" : "€0 to start"}</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* GRILLE NEURO-INCLUSIVE — 10 RÈGLES (toggle panel)  */}
      {/* ═══════════════════════════════════════════════════ */}
      {showNeuro && (
        <section style={{
          maxWidth: 900, margin: "0 auto 16px", padding: "0 16px",
        }}>
          <div style={{
            background: C.surface, borderRadius: 16,
            border: `1px solid ${C.border}`, overflow: "hidden",
          }}>
            {/* Header */}
            <div style={{
              padding: "16px 20px", borderBottom: `1px solid ${C.border}`,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%", background: C.emerald,
              }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                  Principes Neuro-inclusifs — Grille de conformité UX
                </div>
                <div style={{ fontSize: 11, color: C.textMuted }}>
                  Source : UK Gov Accessibility (Autism) · WCAG 2.2 Cognitive · Neurodiversity Design System · Feedback Mme Charles
                </div>
              </div>
              <div style={{
                marginLeft: "auto", fontSize: 11, fontWeight: 600,
                color: C.emerald, background: `${C.emerald}10`,
                padding: "3px 10px", borderRadius: 12,
              }}>
                9/10 APPLIED
              </div>
            </div>

            {/* Rules table */}
            <div style={{ padding: "4px 0" }}>
              {neuroRules.map((rule, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "60px 100px 1fr 100px",
                  alignItems: "center", gap: 12,
                  padding: "10px 20px", fontSize: 12,
                  borderBottom: i < neuroRules.length - 1 ? `1px solid ${C.border}` : "none",
                  background: rule.status === "TARGET v3.2" ? "#fefce810" : "transparent",
                }}>
                  <span style={{ fontFamily: "monospace", fontSize: 10, color: C.textMuted, fontWeight: 600 }}>
                    {rule.id}
                  </span>
                  <span style={{ fontWeight: 600, color: C.text }}>{rule.label}</span>
                  <span style={{ color: C.textSecondary, lineHeight: 1.4 }}>{rule.value}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 600, textAlign: "right",
                    color: rule.status === "APPLIED" ? C.emerald : C.gold,
                  }}>
                    {rule.status === "APPLIED" ? "✓ " : "◎ "}{rule.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{
              padding: "12px 20px", borderTop: `1px solid ${C.border}`,
              fontSize: 11, color: C.textMuted, lineHeight: 1.5,
              background: C.surfaceAlt,
            }}>
              <strong style={{ color: C.text }}>NI-05 (Animations)</strong> — Marqué TARGET v3.2 :
              le toggle prefers-reduced-motion et la désactivation des transitions CSS seront
              implémentés dans le sprint v3.2 (mars 2026). Toutes les autres règles sont déjà
              appliquées dans cette maquette v3.1.
            </div>
          </div>
        </section>
      )}

      {/* ─── Brief AG panel ─── */}
      <section style={{
        maxWidth: 900, margin: "0 auto", padding: "0 16px 24px",
      }}>
        <div style={{
          background: C.surface, borderRadius: 16,
          border: `1px solid ${C.border}`, padding: "20px 24px",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>
            📋 Brief AG — Modifications v3.1 Homepage
          </div>
          <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.7 }}>
            <strong>AG-1 : Trinity Block</strong> — Insérer entre subtitle H1 et AegisIntelligence VUI dans HeroSection.tsx.
            3 cards horizontales grid 3 colonnes. Ajouter clés i18n : trinityTitle, trinityItem1/2/3 (title, sub, desc) FR+EN.
            Message résultant "= Expert Intelligence as a Service (EISaaS)" centré en dessous.<br/><br/>
            <strong>AG-2 : Fix H1 overflow (A8)</strong> — Ajuster padding-top HeroSection pour que le H1 complet soit visible
            sans scroll au chargement initial. Tester sur 1366×768 minimum.<br/><br/>
            <strong>NE PAS toucher :</strong> constants.ts · AegisIntelligence.tsx · PricingSection.tsx ·
            proxy Vercel · config déploiement · structure fichiers/dossiers.<br/><br/>
            <strong>Règles NI obligatoires :</strong> respecter les 10 principes neuro-inclusifs ci-dessus.
            En particulier NI-06 (espacement généreux), NI-07 (langage littéral), NI-10 (max 3-4 éléments par groupe).
          </div>
        </div>
      </section>
    </div>
  );
}
