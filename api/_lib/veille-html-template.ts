import { marked } from 'marked';

/**
 * AEGIS Intelligence -- VEILLE HTML template (DIVA-02, N13 20260520)
 *
 * Convertit le markdown produit par Opus (prompt v1.1.0) en HTML AEGIS brande,
 * destine au rendu Puppeteer HTML->PDF (remplace le renderer jsPDF austere).
 *
 * Design : reference VEILLE-N0-MAI-2026-FR-AEGIS.html (valide JP L3 19/05 + Chat L2 20/05).
 * Tokens : Source Serif 4 (titres), DM Sans (corps), JetBrains Mono (labels), palette navy/gold.
 *
 * Robustesse prod : les emoji feux (vert/jaune/orange/rouge) sont convertis en PASTILLES CSS
 * car @sparticuz/chromium serverless n'embarque pas de police emoji couleur (tofu sinon).
 *
 * Version : 1.0.0 -- 20260520 -- creation DIVA-02
 */

export interface VeilleHtmlInput {
    edition: string;
    lang: 'fr' | 'en';
    markdown: string;
    month_label?: string;
}

// === CSS (reference template AEGIS, ASCII) ===
const TEMPLATE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
@page { size: A4; margin: 16mm 16mm 18mm 16mm; }
@page cover { margin: 0; }
:root { --aegis-dark:#1a2332; --aegis-blue:#2563eb; --aegis-blue-light:#3b82f6; --aegis-gold:#d4a843; --aegis-green:#059669; --aegis-red:#dc2626; --aegis-orange:#d97706; --text:#1e293b; --text-light:#64748b; --bg:#ffffff; --bg-warm:#faf8f5; --bg-blue:#f0f4ff; --border:#e2e8f0; }
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'DM Sans',-apple-system,sans-serif; color:var(--text); background:var(--bg); line-height:1.7; font-size:11pt; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.cover { page:cover; min-height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center; background:linear-gradient(160deg,var(--aegis-dark) 0%,#0f172a 60%,#1e3a5f 100%); color:white; text-align:center; padding:60px 40px; position:relative; overflow:hidden; page-break-after:always; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.cover::before { content:''; position:absolute; top:-50%; right:-30%; width:80%; height:200%; background:radial-gradient(ellipse,rgba(37,99,235,0.10) 0%,transparent 70%); }
.cover-badge { font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:3px; text-transform:uppercase; color:var(--aegis-gold); border:1px solid rgba(212,168,67,0.4); padding:6px 20px; border-radius:3px; margin-bottom:40px; }
.cover h1 { font-family:'Source Serif 4',Georgia,serif; font-size:38px; font-weight:700; line-height:1.2; max-width:700px; margin-bottom:16px; }
.cover .subtitle { font-size:18px; color:rgba(255,255,255,0.7); margin-bottom:50px; max-width:560px; }
.cover-author { margin-top:40px; font-size:14px; color:rgba(255,255,255,0.8); }
.cover-author strong { color:white; }
.cover-series { margin-top:20px; font-size:12px; color:var(--aegis-gold); font-style:italic; }
.cover-meta { margin-top:36px; font-family:'JetBrains Mono',monospace; font-size:10px; color:rgba(255,255,255,0.5); letter-spacing:1px; }
.cover-meta span { margin:0 12px; }
.content { max-width:760px; margin:0 auto; padding:8px 0 0; }
.editorial-note { background:var(--bg-warm); border-left:3px solid var(--aegis-gold); padding:18px 22px; margin:0 0 36px 0; font-size:10.5pt; color:var(--text-light); font-style:italic; line-height:1.7; }
.editorial-note a { color:var(--aegis-blue); }
h2 { font-family:'Source Serif 4',Georgia,serif; font-size:20pt; font-weight:700; color:var(--aegis-dark); margin:42px 0 18px 0; padding-bottom:8px; border-bottom:2px solid var(--aegis-blue); page-break-after:avoid; }
h3 { font-family:'Source Serif 4',Georgia,serif; font-size:14pt; font-weight:600; color:var(--aegis-blue); margin:28px 0 12px 0; page-break-after:avoid; }
p { margin-bottom:14px; }
a { color:var(--aegis-blue); }
strong { color:var(--aegis-dark); }
.signal-title { font-weight:700; color:var(--aegis-dark); font-size:11pt; margin:20px 0 8px 0; }
.impact { background:var(--bg-blue); border-radius:6px; padding:12px 16px; margin:10px 0 20px 0; font-size:10pt; color:#1e40af; page-break-inside:avoid; }
.impact em { font-style:normal; font-weight:600; }
table { width:100%; border-collapse:collapse; font-size:9.5pt; margin:16px 0 24px 0; page-break-inside:avoid; }
th { background:var(--aegis-dark); color:white; text-align:left; padding:8px 10px; font-family:'JetBrains Mono',monospace; font-size:8pt; text-transform:uppercase; letter-spacing:0.5px; }
td { padding:8px 10px; border-bottom:1px solid var(--border); vertical-align:top; }
tr:nth-child(even) { background:#f8fafc; }
td strong { color:var(--aegis-dark); }
.eclairage { background:var(--bg-warm); border:1px solid #e8e0d0; border-radius:8px; padding:28px; margin:30px 0; }
.eclairage h2 { border-bottom-color:var(--aegis-gold); margin-top:0; }
.cf-title { font-weight:600; font-style:italic; color:var(--aegis-dark); }
.eclairage-conclusion { font-weight:600; color:var(--aegis-dark); }
.value-section { background:linear-gradient(135deg,#0f172a,#1e3a5f); color:white; border-radius:8px; padding:30px; margin:30px 0; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.value-section h2 { color:white; border-bottom-color:var(--aegis-gold); margin-top:0; }
.value-section p { color:rgba(255,255,255,0.85); }
.value-section strong { color:white; }
.value-punchline { font-family:'Source Serif 4',Georgia,serif; font-size:14pt; font-weight:600; color:var(--aegis-gold); text-align:center; margin:24px 0 0 0; padding-top:18px; border-top:1px solid rgba(255,255,255,0.15); }
.reco-item { margin-bottom:14px; padding:12px 16px; border-left:3px solid var(--aegis-blue); background:#f8fafc; border-radius:0 6px 6px 0; page-break-inside:avoid; }
.reco-item.structural { border-left-color:var(--aegis-gold); background:var(--bg-warm); }
.reco-label { font-family:'JetBrains Mono',monospace; font-size:9pt; font-weight:600; color:var(--aegis-blue); }
.reco-item.structural .reco-label { color:var(--aegis-gold); }
.cta-box { background:linear-gradient(135deg,#0f172a,#1e3a5f); color:white; border-radius:8px; padding:22px 24px; margin:18px 0; -webkit-print-color-adjust:exact; print-color-adjust:exact; page-break-inside:avoid; }
.cta-box p { color:rgba(255,255,255,0.88); font-size:10pt; margin-bottom:6px; }
.cta-box strong { color:var(--aegis-gold); }
.cta-box a { color:var(--aegis-gold); }
.sources-table td { font-size:9pt; word-break:break-word; }
.sources-table td:first-child { font-family:'JetBrains Mono',monospace; color:var(--aegis-blue); white-space:nowrap; }
.acronyms td:first-child { font-family:'JetBrains Mono',monospace; font-weight:600; color:var(--aegis-dark); white-space:nowrap; }
.about { background:var(--bg-warm); border-top:2px solid var(--aegis-gold); padding:24px; margin-top:24px; font-size:9.5pt; color:var(--text-light); }
.about strong { color:var(--text); }
.dot { display:inline-block; width:9px; height:9px; border-radius:50%; margin-right:5px; vertical-align:middle; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.dot-green { background:var(--aegis-green); } .dot-amber { background:var(--aegis-gold); } .dot-orange { background:var(--aegis-orange); } .dot-red { background:var(--aegis-red); }
`;

// === Helpers ===
function esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function norm(s: string): string {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}
function mdToHtml(src: string): string {
    return marked.parse(src, { async: false, gfm: true, breaks: false }) as string;
}

// Emoji feux -> pastilles CSS (robustesse serverless : pas de police emoji couleur)
const DOT_CLASS: Record<string, string> = {
    '\u{1F7E2}': 'dot-green',
    '\u{1F7E1}': 'dot-amber',
    '\u{1F7E0}': 'dot-orange',
    '\u{1F534}': 'dot-red',
};
function emojiToDots(html: string): string {
    return html.replace(/\u{1F7E2}|\u{1F7E1}|\u{1F7E0}|\u{1F534}/gu, (m) => `<span class="dot ${DOT_CLASS[m]}"></span>`);
}

type SectionType = 'eclairage' | 'value' | 'reco' | 'cta' | 'about' | 'sources' | 'glossaire' | 'standard';
function sectionType(headingText: string): SectionType {
    const h = norm(headingText);
    if (h.startsWith('eclairage')) return 'eclairage';
    if (h.startsWith('pourquoi cette veille')) return 'value';
    if (h.startsWith('recommandations')) return 'reco';
    if (h.startsWith('aller plus loin')) return 'cta';
    if (h.startsWith('a propos')) return 'about';
    if (h.startsWith('sources')) return 'sources';
    if (h.includes('glossaire')) return 'glossaire';
    return 'standard';
}

// Enhancers (defensifs : si le motif n'existe pas, le HTML reste valide tel quel)
function enhanceImpact(html: string): string {
    return html.replace(/<p>(<em>Impact[\s\S]*?)<\/p>/g, '<div class="impact">$1</div>');
}
function enhanceSignal(html: string): string {
    return html.replace(/<p><strong>(Signal[\s\S]*?)<\/strong><\/p>/g, '<p class="signal-title">$1</p>');
}

function renderSection(headingText: string, bodyMd: string, _lang: 'fr' | 'en'): string {
    const type = sectionType(headingText);
    const h2 = `<h2>${esc(headingText)}</h2>`;

    if (type === 'eclairage') {
        let inner = mdToHtml(bodyMd);
        inner = inner.replace(/<p><em>(Contrefactuel[\s\S]*?)<\/em>/g, '<p><span class="cf-title">$1</span>');
        return `<section class="eclairage">${h2}${inner}</section>`;
    }
    if (type === 'value') {
        let inner = mdToHtml(bodyMd);
        // Derniere ligne avec guillemets « » -> punchline
        inner = inner.replace(/<p>([^<]*«[\s\S]*?»[^<]*)<\/p>/g, '<p class="value-punchline">$1</p>');
        return `<section class="value-section">${h2}${inner}</section>`;
    }
    if (type === 'reco') {
        let inner = mdToHtml(bodyMd);
        inner = inner.replace(/<p><strong>(R\d+)\s*[—-]\s*([\s\S]*?)<\/strong>([\s\S]*?)<\/p>/g,
            (_m, label, title, rest) => {
                const structural = label === 'R7' ? ' structural' : '';
                return `<div class="reco-item${structural}"><span class="reco-label">${label}</span> &mdash; <strong>${title}</strong>${rest}</div>`;
            });
        return `${h2}${inner}`;
    }
    if (type === 'cta') {
        let inner = mdToHtml(bodyMd);
        inner = inner.replace(/<blockquote>([\s\S]*?)<\/blockquote>/g, '<div class="cta-box">$1</div>');
        return `${h2}${inner}`;
    }
    if (type === 'about') {
        return `${h2}<div class="about">${mdToHtml(bodyMd)}</div>`;
    }
    if (type === 'sources') {
        return `${h2}${mdToHtml(bodyMd).replace(/<table>/g, '<table class="sources-table">')}`;
    }
    if (type === 'glossaire') {
        return `${h2}${mdToHtml(bodyMd).replace(/<table>/g, '<table class="acronyms">')}`;
    }
    // standard
    return `${h2}${enhanceSignal(enhanceImpact(mdToHtml(bodyMd)))}`;
}

function renderCover(edition: string, monthLabel: string, lang: 'fr' | 'en'): string {
    const isFr = lang === 'fr';
    const h1 = isFr ? 'VEILLE R&eacute;glementaire<br>Industrielle EU' : 'EU Industrial<br>Regulatory Watch';
    const subtitle = isFr
        ? `${esc(edition)} &mdash; Cinq piliers r&eacute;glementaires, un seul radar`
        : `${esc(edition)} &mdash; Five regulatory pillars, one radar`;
    const role = isFr ? 'Expert Industrie 5.0 &amp; Conformit&eacute; EU' : 'Industry 5.0 &amp; EU Compliance Expert';
    const series = isFr ? 'S&eacute;rie &laquo; Analyses &amp; D&eacute;cryptages &raquo;' : 'Series &laquo; Analyses &amp; D&eacute;cryptages &raquo;';
    return `<div class="cover">
  <div class="cover-badge">Analyses &amp; D&eacute;cryptages</div>
  <h1>${h1}</h1>
  <div class="subtitle">${subtitle}</div>
  <div class="cover-author"><strong>Jean-Pierre Charles</strong><br>${role}</div>
  <div class="cover-series">${series}</div>
  <div class="cover-meta"><span>AEGIS Intelligence</span><span>&bull;</span><span>jeanpierrecharles.com</span><span>&bull;</span><span>${esc(monthLabel)}</span></div>
</div>`;
}

/**
 * Construit le HTML complet brande a partir du markdown Opus.
 */
export function renderVeilleHTML(input: VeilleHtmlInput): string {
    const lang: 'fr' | 'en' = input.lang === 'en' ? 'en' : 'fr';
    const monthLabel = input.month_label || input.edition;
    const md = input.markdown.replace(/\r\n/g, '\n');

    // Decoupe : preambule (avant 1er "## ") + sections H2
    const parts = md.split(/\n(?=## )/);
    const preamble = parts[0] || '';
    const sectionParts = parts.slice(1);

    // Editorial note = blockquotes du preambule (chapo). En prod = 1 chapo ; en V&V peut inclure note Statut.
    const quoteLines = preamble.split('\n').filter((l) => /^\s*>/.test(l)).map((l) => l.replace(/^\s*>\s?/, ''));
    const editorialHTML = quoteLines.length
        ? `<div class="editorial-note">${mdToHtml(quoteLines.join('\n'))}</div>`
        : '';

    let bodyHTML = '';
    for (const part of sectionParts) {
        const nl = part.indexOf('\n');
        const headingLine = (nl === -1 ? part : part.slice(0, nl)).replace(/^##\s*/, '').trim();
        const bodyMd = nl === -1 ? '' : part.slice(nl + 1);
        try {
            bodyHTML += renderSection(headingLine, bodyMd, lang);
        } catch {
            // Fallback defensif : rendu standard brut
            bodyHTML += `<h2>${esc(headingLine)}</h2>${mdToHtml(bodyMd)}`;
        }
    }

    const inner = emojiToDots(editorialHTML + bodyHTML);

    return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<title>VEILLE ${esc(edition_short(input.edition))} - AEGIS Intelligence</title>
<style>${TEMPLATE_CSS}</style>
</head>
<body>
${renderCover(input.edition, monthLabel, lang)}
<div class="content">
${inner}
</div>
</body>
</html>`;
}

function edition_short(edition: string): string {
    return edition.replace(/[<>]/g, '').slice(0, 40);
}
