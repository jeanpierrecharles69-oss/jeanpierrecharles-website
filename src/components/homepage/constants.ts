/**
 * AEGIS v3.0-alpha · Design System — Light / Material Glass
 * Inspired by: antigravity.google, jeanpierrecharles.com (live)
 * Font: Inter (matching live site CSS)
 */

export const C = {
    /* ── Surfaces ─────────────────────────────────── */
    bg: "#f8fafc",             // page background (slate-50)
    surface: "#ffffff",        // card/container bg (white)
    surfaceAlt: "#f1f5f9",    // alternate section bg (slate-100)
    surfaceHover: "#e2e8f0",  // hover state

    /* ── Text ─────────────────────────────────────── */
    text: "#0f172a",           // primary text (slate-900)
    textSecondary: "#475569",  // secondary text (slate-600)
    textMuted: "#94a3b8",      // muted/tertiary (slate-400)

    /* ── Borders & Outlines ───────────────────────── */
    border: "rgba(15,23,42,0.08)",       // ultra-subtle (like AG)
    borderMed: "rgba(15,23,42,0.12)",    // medium borders
    borderStrong: "#e2e8f0",             // slate-200

    /* ── Glass / Material ─────────────────────────── */
    glassBg: "rgba(255,255,255,0.72)",
    glassBlur: "blur(16px)",
    glassBorder: "rgba(255,255,255,0.6)",

    /* ── Accents (kept from R3, proven B2B palette) ─ */
    accent: "#3b82f6",         // blue CTA
    accentGlow: "#60a5fa",     // blue glow
    emerald: "#10b981",        // success green
    emeraldDark: "#059669",    // deep green
    gold: "#f59e0b",           // gold/amber
    amber: "#d97706",          // deep gold
    rose: "#f43f5e",           // error/alert red
    copper: "#c2956a",         // career copper

    /* ── Gradients ────────────────────────────────── */
    gradientEuropean: "linear-gradient(135deg, #3b82f6, #1d4ed8, #eab308)",
    gradientBlue: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    gradientSoft: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f0fdf4 100%)",
    gradientHero: "linear-gradient(170deg, #ffffff 0%, #f0f4ff 40%, #f0fdf4 80%, #f8fafc 100%)",

    /* ── Shadows (3-tier like jpc live + AG) ──────── */
    shadowSoft: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
    shadowMed: "0 4px 12px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.03)",
    shadowLg: "0 12px 32px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)",
};

export const sectionColors = [
    C.textMuted,   // S0 NAV
    C.accent,      // S1 HERO
    C.emerald,     // S2 TRUST
    C.copper,      // S3 R&D
    C.gold,        // S4 COMPARATIVE
    C.accent,      // S5 SERVICES
    C.emeraldDark, // S6 PRICING
    C.gold,        // S7 REGS
    C.rose,        // S8 CTA
    C.textMuted,   // S9 FOOTER
];

export const FONT_LINK = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap";
