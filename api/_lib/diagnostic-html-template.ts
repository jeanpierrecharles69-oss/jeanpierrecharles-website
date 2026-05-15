import { marked, Marked, type Token, type Tokens } from 'marked';
import type { DiagnosticInput } from './diagnostic-generator.js';

/**
 * AEGIS Intelligence -- HTML template DIAGNOSTIC (N12.C POC)
 *
 * Produit un document HTML/CSS canonique reprise visuelle baseline LaTeX 29/04
 * (aegis-fr.tex v1.0.5). Palette empirique LaTeX :
 *   aegisblue       #0A3D62  (titres, cover emblem outer, accents)
 *   aegisbluelight  #1E5A8A  (cover emblem inner, headings sub)
 *   aegisgrey       #4A5568  (corps secondaire, tagline)
 *   aegislightgrey  #E2E8F0  (separateurs, identification block bg)
 *   shadecolor      #F5F7FA  (code blocks)
 *
 * Sections produites :
 *   1. Cover page (cercle radial Ae + titre + tagline + cartouche + bloc id + bandeau)
 *   2. Sommaire (TOC) genere depuis H2/H3 markdown_opus
 *   3. Corps (marked.parse du markdown_opus)
 *   4. Page signature finale (cartouche fin)
 *
 * Pieds de page rendus par Puppeteer footerTemplate (pdf-renderer.ts).
 *
 * Version : 1.0.0 -- 20260512 -- creation N12.C
 */

export interface DiagnosticHtmlInput extends DiagnosticInput {
    markdown_opus: string;
    issue_date?: Date;
}

interface HeadingEntry {
    depth: 2 | 3;
    text: string;
    slug: string;
}

function htmlEscape(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function slugify(text: string, used: Map<string, number>): string {
    const base = text
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Mn}/gu, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'section';
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
}

function flattenInlineText(tokens: Token[] | undefined): string {
    if (!tokens) return '';
    let out = '';
    for (const t of tokens) {
        if (t.type === 'text') {
            const inner = (t as Tokens.Text).tokens;
            out += inner && inner.length > 0 ? flattenInlineText(inner) : (t as Tokens.Text).text;
        } else if (t.type === 'strong') {
            out += flattenInlineText((t as Tokens.Strong).tokens);
        } else if (t.type === 'em') {
            out += flattenInlineText((t as Tokens.Em).tokens);
        } else if (t.type === 'codespan') {
            out += (t as Tokens.Codespan).text;
        } else if (t.type === 'link') {
            out += flattenInlineText((t as Tokens.Link).tokens);
        } else if (t.type === 'escape') {
            out += (t as Tokens.Escape).text;
        } else if ((t as { text?: string }).text) {
            out += (t as { text: string }).text;
        }
    }
    return out;
}

function collectHeadings(markdown: string): HeadingEntry[] {
    const tokens = marked.lexer(markdown);
    const used = new Map<string, number>();
    const headings: HeadingEntry[] = [];
    for (const tok of tokens) {
        if (tok.type === 'heading') {
            const h = tok as Tokens.Heading;
            if (h.depth === 2 || h.depth === 3) {
                const text = flattenInlineText(h.tokens) || h.text;
                const slug = slugify(text, used);
                headings.push({ depth: h.depth as 2 | 3, text, slug });
            }
        }
    }
    return headings;
}

function renderTocHtml(headings: HeadingEntry[], lang: 'fr' | 'en'): string {
    if (headings.length === 0) return '';
    const tocTitle = lang === 'fr' ? 'Sommaire' : 'Contents';
    const items = headings.map((h) => {
        const cls = h.depth === 2 ? 'toc-h2' : 'toc-h3';
        return `<li class="${cls}"><a href="#${h.slug}"><span class="toc-text">${htmlEscape(h.text)}</span></a></li>`;
    }).join('\n');
    return `
<section class="toc-page">
    <h1 class="toc-title">${tocTitle}</h1>
    <ul class="toc-list">
${items}
    </ul>
</section>`;
}

// OB5 (P1) correctif T0905 14/05 : injecter des liens EUR-Lex cliquables sur les
// references reglementaires formelles "Reglement/Regulation/Directive (UE/EU) YYYY/NNNN"
// detectees dans le HTML genere par marked. Post-traitement deterministe zero-regression
// sur la sortie Opus (aucune modification du system prompt v1.5.3).
// Brief 20260514T0900_BRIEF_ACDC-CODE-OB5-OB6-SOURCES-EURLEX-CTA-PULSE.md sec 1.
const EUR_LEX_LINKS: Record<string, string> = {
    '2024/1689': 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32024R1689',  // AI Act
    '2024/2847': 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32024R2847',  // CRA
    '2023/1230': 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32023R1230',  // Machinery Reg
    '2024/1781': 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32024R1781',  // ESPR
    '2023/1542': 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32023R1542',  // Battery Reg
    '2016/679':  'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32016R0679',  // RGPD
    '2023/2854': 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32023R2854',  // Data Act
    '2024/2853': 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32024L2853',  // PLD
};

function injectEurLexLinks(html: string): string {
    let result = html;
    for (const [ref, url] of Object.entries(EUR_LEX_LINKS)) {
        // Pattern : "Reglement (UE) 2024/1689" ou "Regulation (EU) 2024/1689" ou "Directive (UE) 2024/2853".
        // Lookbehinds negatifs : pas deja dans href="..." et pas deja entre <a...> tags.
        // Lookahead negatif : pas suivi de </a> (double-wrap prevention).
        const pattern = new RegExp(
            `(?<!href="[^"]*?)(?<!<a[^>]*>)((?:R[eè]glement|Regulation|Directive)\\s*\\(?(?:UE|EU)\\)?\\s*${ref.replace('/', '\\/')})(?!</a>)`,
            'gi'
        );
        result = result.replace(pattern, `<a href="${url}" target="_blank" rel="noopener" style="color:#2563eb;text-decoration:underline">$1</a>`);
    }
    return result;
}

function renderBodyHtml(markdown: string): string {
    const used = new Map<string, number>();
    const localMarked = new Marked();
    localMarked.use({
        renderer: {
            heading({ tokens, depth }: Tokens.Heading) {
                const text = flattenInlineText(tokens) || '';
                const inlineHtml = (this as { parser: { parseInline: (toks: Token[]) => string } }).parser.parseInline(tokens);
                if (depth === 2 || depth === 3) {
                    const slug = slugify(text, used);
                    // C7 fix T1600 OBS10 (bookmarks doubles) : ancre `id` sur un `<a>` sibling
                    // au lieu d'etre directement sur le `<h2>`/`<h3>`. Cause originelle Puppeteer
                    // `tagged: true + outline: true` indexait deux entrees pour un meme heading
                    // avec id (heading element + link target), affichage Adobe = "TextText" concatene.
                    // L'ancre `<a id="">` est inline sans contenu visuel, scroll TOC reste fonctionnel.
                    return `<a id="${slug}" class="anchor"></a><h${depth}>${inlineHtml}</h${depth}>`;
                }
                return `<h${depth}>${inlineHtml}</h${depth}>`;
            },
        },
    });
    const rawHtml = localMarked.parse(markdown, { async: false }) as string;
    return injectEurLexLinks(rawHtml);
}

function renderCoverHtml(input: DiagnosticHtmlInput): string {
    const isFr = input.lang === 'fr';
    const dateObj = input.issue_date ?? new Date();
    const dateStr = dateObj.toLocaleDateString(isFr ? 'fr-FR' : 'en-GB', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
    const tagline = isFr
        ? 'Conformit&eacute; par Conception &bull; Expertise R&eacute;glementaire EU'
        : 'Compliance by Design &bull; EU Regulatory Expertise';
    const titleMain = isFr ? 'Diagnostic de compliance r&eacute;glementaire' : 'Regulatory compliance diagnostic';
    const subtitle = isFr ? 'Analyse 5 piliers symbiotiques EU' : 'EU 5 symbiotic pillars analysis';
    const labelReference = isFr ? 'R&eacute;f&eacute;rence diagnostic' : 'Diagnostic reference';
    const labelClient = isFr ? 'Destinataire' : 'Recipient';
    const labelDate = isFr ? "Date d'&eacute;mission" : 'Issue date';
    const labelClassif = isFr ? 'Classification' : 'Classification';
    const classifValue = isFr
        ? 'Diagnostic de compliance r&eacute;glementaire europ&eacute;enne &mdash; Niveau Expert'
        : 'European regulatory compliance diagnostic &mdash; Expert level';
    const bandTop = isFr
        ? 'AEGIS Intelligence &bull; Engineering Intelligence as a Service &bull; UE-27 + r&eacute;gions ultrap&eacute;riph&eacute;riques'
        : 'AEGIS Intelligence &bull; Engineering Intelligence as a Service &bull; EU-27 + outermost regions';
    const bandPillars = isFr
        ? '<strong>5 piliers r&eacute;glementaires symbiotiques</strong> : AI Act &bull; CRA &bull; Machinery Regulation 2023/1230 &bull; ESPR/DPP &bull; Battery Regulation'
        : '<strong>5 symbiotic regulatory pillars</strong>: AI Act &bull; CRA &bull; Machinery Regulation 2023/1230 &bull; ESPR/DPP &bull; Battery Regulation';
    const bandFooter = isFr
        ? '<em>Document confidentiel &mdash; reproduction et diffusion soumises &agrave; autorisation &eacute;crite pr&eacute;alable</em>'
        : '<em>Confidential document &mdash; reproduction and dissemination subject to prior written authorization</em>';

    const customerLine = htmlEscape(input.customer_company || input.customer_name || '');
    const customerSub = htmlEscape(input.customer_name || '');
    const location = [input.city, input.country].filter((s): s is string => Boolean(s)).map(htmlEscape).join(', ');

    return `
<section class="cover-page">
    <div class="cover-spacer-top"></div>

    <div class="cover-emblem-wrapper">
        <div class="cover-emblem">
            <span class="cover-emblem-letter">&AElig;</span>
        </div>
    </div>

    <h1 class="cover-brand">AEGIS INTELLIGENCE</h1>
    <p class="cover-tagline">${tagline}</p>

    <div class="cover-cartouche">
        <div class="cover-cartouche-title">${titleMain}</div>
        <div class="cover-cartouche-subtitle">${subtitle}</div>
    </div>

    <div class="cover-identity">
        <div class="cover-identity-row">
            <span class="cover-identity-label">${labelReference}</span>
            <span class="cover-identity-value mono">${htmlEscape(input.invoice_number)}</span>
        </div>
        ${customerLine ? `
        <div class="cover-identity-row">
            <span class="cover-identity-label">${labelClient}</span>
            <span class="cover-identity-value">${customerLine}${customerSub && customerSub !== customerLine ? ` &mdash; ${customerSub}` : ''}${location ? `<br><span class="cover-identity-sub">${location}</span>` : ''}</span>
        </div>` : ''}
        <div class="cover-identity-row">
            <span class="cover-identity-label">${labelDate}</span>
            <span class="cover-identity-value">${dateStr}</span>
        </div>
        <div class="cover-identity-row">
            <span class="cover-identity-label">${labelClassif}</span>
            <span class="cover-identity-value">${classifValue}</span>
        </div>
    </div>

    <div class="cover-band">
        <p>${bandTop}</p>
        <p>${bandPillars}</p>
        <p>${bandFooter}</p>
    </div>
</section>`;
}

function renderSignatureHtml(input: DiagnosticHtmlInput): string {
    const isFr = input.lang === 'fr';
    const title = isFr ? 'Fin du diagnostic' : 'End of diagnostic';
    const rights = isFr
        ? '&copy; AEGIS Intelligence &mdash; Tous droits r&eacute;serv&eacute;s'
        : '&copy; AEGIS Intelligence &mdash; All rights reserved';
    const coprod = isFr
        ? '<em>Document co-produit par la collaboration entre un humain expert et des technologies d\'intelligence artificielle appliqu&eacute;es</em>'
        : '<em>Document co-produced through collaboration between a human expert and applied AI technologies</em>';
    const sla = isFr
        ? '<em>Document livr&eacute; dans le cadre du service DIAGNOSTIC &bull; Livr&eacute; le jour ouvr&eacute; du paiement avant 19h CET (paiements jusqu\'&agrave; 17h CET) ou avant 12h CET le jour ouvr&eacute; suivant</em>'
        : '<em>Document delivered as part of the DIAGNOSTIC service &bull; Delivered on the business day of payment before 7 PM CET (payments until 5 PM CET) or before noon CET the following business day</em>';
    return `
<section class="signature-page">
    <div class="signature-card">
        <h2 class="signature-title">${title}</h2>
        <div class="signature-id mono">${htmlEscape(input.invoice_number)}</div>
        <p class="signature-rights">${rights}</p>
        <p class="signature-coprod">${coprod}</p>
        <p class="signature-sla">${sla}</p>
    </div>
</section>`;
}

// N12.D F2 (P0) correctif T2125 : bloc SIGNATURE NUMERIQUE eIDAS Article 25.
// Insere AVANT la signature-page "Fin du diagnostic" existante.
// SHA-256 du PDF = placeholder (paradoxe auto-reference resolu par sidecar metadata.json
// L2 Option A roadmap N13 = Option B 2-pass).
// Cf. brief 20260513T2110 F2 + reference baseline LaTeX p.28 AEGIS-20260421-1222.pdf.
function renderDigitalSignatureHtml(input: DiagnosticHtmlInput): string {
    const isFr = input.lang === 'fr';
    const title = isFr ? 'Signature num&eacute;rique' : 'Digital signature';
    const subtitle = isFr
        ? 'Compliance Gouvernance Int&eacute;gr&eacute;e &mdash; eIDAS Article 25'
        : 'Integrated Compliance Governance &mdash; eIDAS Article 25';
    const labelApprover = isFr ? 'Approuv&eacute; par' : 'Approved by';
    const labelTimestamp = isFr ? 'Horodatage' : 'Timestamp';
    const labelHash = isFr ? 'Empreinte PDF (SHA-256)' : 'PDF fingerprint (SHA-256)';
    const placeholder = isFr
        ? '[Empreinte disponible dans le sidecar metadata.json apr&egrave;s g&eacute;n&eacute;ration]'
        : '[Fingerprint available in metadata.json sidecar after generation]';
    const note = isFr
        ? 'Signature &eacute;lectronique simple &mdash; eIDAS Article 25. L\'empreinte SHA-256 permet de v&eacute;rifier l\'int&eacute;grit&eacute; du rapport par recalcul ind&eacute;pendant.'
        : 'Simple electronic signature &mdash; eIDAS Article 25. The SHA-256 fingerprint allows verification of the report\'s integrity via independent recalculation.';
    const approver = 'Jean-Pierre CHARLES';
    const dateObj = input.issue_date ?? new Date();
    // ISO 8601 UTC pour archivage machine et reproductibilite (bloc UTC: bas de carte).
    const isoTimestamp = dateObj.toISOString().replace('Z', '+00:00');
    // C3 correctif T1345 15/05 : horodatage principal affiche localise selon langue.
    // FR -> CET Paris (Intl Europe/Paris + locale fr-FR). EN -> UTC ISO 8601.
    // Vercel Lambda runtime TZ=UTC : getTimezoneOffset() retourne 0 -> on s'appuie sur
    // Intl.DateTimeFormat (timeZone explicite) plutot que sur l'offset machine.
    const displayTimestamp = isFr
        ? dateObj
              .toLocaleString('fr-FR', {
                  timeZone: 'Europe/Paris',
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false,
              })
              .replace(',', '') + ' CET'
        : isoTimestamp + ' UTC';
    return `
<section class="digital-signature-page">
    <div class="digital-signature-card">
        <h2 class="digital-signature-title">${title}</h2>
        <p class="digital-signature-subtitle">${subtitle}</p>
        <div class="digital-signature-grid">
            <div class="digital-signature-row">
                <span class="digital-signature-label">${labelApprover}</span>
                <span class="digital-signature-value">${approver}</span>
            </div>
            <div class="digital-signature-row">
                <span class="digital-signature-label">${labelTimestamp}</span>
                <span class="digital-signature-value mono">${htmlEscape(displayTimestamp)}</span>
            </div>
        </div>
        <div class="digital-signature-hash-block">
            <div class="digital-signature-hash-label">${labelHash}</div>
            <div class="digital-signature-hash-value mono">${placeholder}</div>
        </div>
        <p class="digital-signature-note"><em>${note}</em></p>
    </div>
</section>`;
}

function buildCss(): string {
    return `
:root {
    --aegis-blue: #0A3D62;
    --aegis-blue-light: #1E5A8A;
    --aegis-grey: #4A5568;
    --aegis-light-grey: #E2E8F0;
    --aegis-shade: #F5F7FA;
    --aegis-text: #1A202C;
}

* { box-sizing: border-box; }

html, body {
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', 'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.28;
    color: var(--aegis-text);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}

a { color: var(--aegis-blue); text-decoration: none; }
a:hover { text-decoration: underline; }

.mono { font-family: Consolas, 'Courier New', monospace; }

/* ===== COVER PAGE ===== */
.cover-page {
    page-break-after: always;
    break-after: page;
    text-align: center;
    padding: 0 1cm;
    min-height: 25cm;
    position: relative;
}
.cover-spacer-top { height: 1.2cm; }

.cover-emblem-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 0.6cm;
}
.cover-emblem {
    width: 3.2cm;
    height: 3.2cm;
    border-radius: 50%;
    background: radial-gradient(circle at center, var(--aegis-blue-light) 0%, var(--aegis-blue) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(10, 61, 98, 0.20);
}
.cover-emblem-letter {
    color: #ffffff;
    font-size: 42pt;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -2pt;
    transform: translateY(-2pt);
}

.cover-brand {
    font-size: 26pt;
    font-weight: 700;
    color: var(--aegis-blue);
    letter-spacing: 1pt;
    margin: 1.0cm 0 0.4cm 0;
}
.cover-tagline {
    font-size: 13pt;
    font-style: italic;
    color: var(--aegis-grey);
    margin: 0 0 1.6cm 0;
}

.cover-cartouche {
    border: 1pt solid var(--aegis-blue);
    border-radius: 6pt;
    padding: 0.8cm 0.6cm;
    max-width: 16cm;
    margin: 0 auto 1.4cm auto;
    background: #ffffff;
}
.cover-cartouche-title {
    font-size: 18pt;
    font-weight: 700;
    color: var(--aegis-blue);
    line-height: 1.25;
}
.cover-cartouche-subtitle {
    font-size: 13pt;
    color: var(--aegis-grey);
    margin-top: 0.4cm;
}

.cover-identity {
    background: var(--aegis-light-grey);
    border-radius: 4pt;
    padding: 0.6cm 0.7cm;
    max-width: 12cm;
    margin: 0 auto 1.2cm auto;
    text-align: left;
}
.cover-identity-row {
    display: flex;
    align-items: baseline;
    margin-bottom: 0.35cm;
    line-height: 1.35;
}
.cover-identity-row:last-child { margin-bottom: 0; }
.cover-identity-label {
    font-weight: 700;
    color: var(--aegis-blue);
    font-size: 9.5pt;
    min-width: 4.2cm;
    flex-shrink: 0;
}
.cover-identity-value {
    font-size: 10pt;
    color: var(--aegis-text);
    flex: 1;
}
.cover-identity-value.mono {
    font-family: Consolas, 'Courier New', monospace;
    color: var(--aegis-blue);
}
.cover-identity-sub {
    color: var(--aegis-grey);
    font-size: 9pt;
}

.cover-band {
    margin-top: 1.4cm;
    padding-top: 0.6cm;
    font-size: 9pt;
    color: var(--aegis-grey);
    line-height: 1.45;
}
.cover-band p { margin: 0.25cm 0; }
.cover-band strong { color: var(--aegis-blue); font-weight: 700; }

/* ===== TOC PAGE ===== */
.toc-page {
    page-break-before: always;
    page-break-after: always;
    break-before: page;
    break-after: page;
    padding-top: 0.4cm;
}
.toc-title {
    font-size: 22pt;
    font-weight: 700;
    color: var(--aegis-blue);
    border-bottom: 0.6pt solid var(--aegis-light-grey);
    padding-bottom: 0.3cm;
    margin: 0 0 0.6cm 0;
}
.toc-list {
    list-style: none;
    padding: 0;
    margin: 0;
}
.toc-list li {
    margin: 0.15cm 0;
    padding: 0.08cm 0;
    border-bottom: 0.3pt dotted var(--aegis-light-grey);
}
.toc-list li.toc-h2 {
    font-size: 11pt;
    font-weight: 600;
    color: var(--aegis-blue);
    padding-left: 0;
}
.toc-list li.toc-h3 {
    font-size: 10pt;
    color: var(--aegis-grey);
    padding-left: 0.7cm;
    font-weight: 400;
}
.toc-list li a { color: inherit; display: block; }

/* ===== BODY CONTENT ===== */
.body-content {
    page-break-before: always;
    break-before: page;
}
.body-content h1 {
    font-size: 19pt;
    font-weight: 700;
    color: var(--aegis-blue);
    margin: 0.5cm 0 0.3cm 0;
    padding-bottom: 0.15cm;
    border-bottom: 0.6pt solid var(--aegis-light-grey);
    page-break-after: avoid;
}
.body-content h2 {
    font-size: 14.5pt;
    font-weight: 700;
    color: var(--aegis-blue);
    margin: 0.5cm 0 0.22cm 0;
    page-break-after: avoid;
}
.body-content h3 {
    font-size: 12pt;
    font-weight: 700;
    color: var(--aegis-blue-light);
    margin: 0.35cm 0 0.18cm 0;
    page-break-after: avoid;
}
.body-content h4 {
    font-size: 10.8pt;
    font-weight: 700;
    color: var(--aegis-grey);
    margin: 0.28cm 0 0.14cm 0;
    page-break-after: avoid;
}
.body-content p {
    margin: 0.18cm 0;
    text-align: justify;
    hyphens: auto;
    orphans: 3;
    widows: 3;
}
.body-content ul, .body-content ol {
    margin: 0.18cm 0 0.28cm 0;
    padding-left: 0.65cm;
}
.body-content li {
    margin: 0.08cm 0;
    line-height: 1.32;
}
.body-content blockquote {
    border-left: 2.5pt solid var(--aegis-blue);
    padding: 0.15cm 0.4cm;
    margin: 0.25cm 0;
    color: var(--aegis-grey);
    font-style: italic;
    background: var(--aegis-shade);
}
.body-content code {
    background: var(--aegis-shade);
    padding: 1pt 3pt;
    border-radius: 2pt;
    font-family: Consolas, 'Courier New', monospace;
    font-size: 9.5pt;
    color: var(--aegis-blue);
}
.body-content pre {
    background: var(--aegis-shade);
    border: 0.3pt solid var(--aegis-light-grey);
    border-radius: 3pt;
    padding: 0.3cm 0.4cm;
    font-family: Consolas, 'Courier New', monospace;
    font-size: 9pt;
    overflow-x: auto;
    line-height: 1.4;
    page-break-inside: avoid;
}
.body-content pre code {
    background: transparent;
    padding: 0;
    color: var(--aegis-text);
}
.body-content hr {
    border: none;
    border-top: 0.3pt solid var(--aegis-light-grey);
    margin: 0.6cm 0;
}
.body-content strong { font-weight: 700; color: var(--aegis-text); }
.body-content em { font-style: italic; }
/* ===== TABLES OB3 (P1) correctif T2125 ===== */
/* table-layout fixed = colonnes uniformes (vs auto = decalage marked-generated).
   Padding accru + marge generique pour respiration. */
.body-content table {
    width: 100%;
    table-layout: auto;
    border-collapse: collapse;
    margin: 0.45cm 0 0.55cm 0;
    font-size: 9.2pt;
    page-break-inside: avoid;
    border: 0.3pt solid var(--aegis-light-grey);
}
.body-content table th {
    background: var(--aegis-blue);
    color: #ffffff;
    text-align: left;
    padding: 0.22cm 0.30cm;
    font-weight: 600;
    border-bottom: 1pt solid var(--aegis-blue);
    border-right: 0.3pt solid var(--aegis-blue-light);
    vertical-align: middle;
    line-height: 1.30;
}
.body-content table th:last-child { border-right: 0; }
.body-content table td {
    padding: 0.20cm 0.30cm;
    border-bottom: 0.3pt solid var(--aegis-light-grey);
    border-right: 0.3pt solid var(--aegis-light-grey);
    vertical-align: top;
    line-height: 1.35;
}
.body-content table td:last-child { border-right: 0; }
.body-content table tr:last-child td { border-bottom: 0; }
.body-content table tr:nth-child(even) td { background: var(--aegis-shade); }
.body-content table strong { font-weight: 700; color: var(--aegis-blue); }

/* ===== DIGITAL SIGNATURE PAGE (F2) ===== */
.digital-signature-page {
    page-break-before: always;
    break-before: page;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 22cm;
    padding: 0 1cm;
}
.digital-signature-card {
    border: 1.2pt solid var(--aegis-blue);
    border-radius: 8pt;
    padding: 1.2cm 1.4cm;
    max-width: 16cm;
    width: 100%;
    text-align: center;
    background: var(--aegis-shade);
}
.digital-signature-title {
    font-size: 18pt;
    font-weight: 700;
    color: var(--aegis-blue);
    margin: 0 0 0.25cm 0;
    text-transform: uppercase;
    letter-spacing: 1.5pt;
}
.digital-signature-subtitle {
    font-size: 10.5pt;
    color: var(--aegis-blue-light);
    margin: 0 0 0.9cm 0;
    font-style: italic;
}
.digital-signature-grid {
    border-top: 0.4pt solid var(--aegis-light-grey);
    border-bottom: 0.4pt solid var(--aegis-light-grey);
    padding: 0.45cm 0.5cm;
    margin-bottom: 0.6cm;
    text-align: left;
}
.digital-signature-row {
    display: flex;
    align-items: baseline;
    margin-bottom: 0.25cm;
    line-height: 1.4;
}
.digital-signature-row:last-child { margin-bottom: 0; }
.digital-signature-label {
    font-weight: 700;
    color: var(--aegis-blue);
    font-size: 9.5pt;
    min-width: 4cm;
    flex-shrink: 0;
}
.digital-signature-value {
    font-size: 10pt;
    color: var(--aegis-text);
    flex: 1;
}
.digital-signature-value.mono {
    font-family: Consolas, 'Courier New', monospace;
    color: var(--aegis-blue);
    font-size: 9.5pt;
}
.digital-signature-hash-block {
    background: #ffffff;
    border: 0.5pt solid var(--aegis-light-grey);
    border-radius: 4pt;
    padding: 0.45cm 0.4cm;
    margin: 0 0 0.6cm 0;
}
.digital-signature-hash-label {
    font-size: 8.5pt;
    color: var(--aegis-grey);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5pt;
    margin-bottom: 0.2cm;
}
.digital-signature-hash-value {
    font-family: Consolas, 'Courier New', monospace;
    font-size: 9pt;
    color: var(--aegis-blue);
    word-break: break-all;
    line-height: 1.5;
}
.digital-signature-note {
    font-size: 8.5pt;
    color: var(--aegis-grey);
    line-height: 1.45;
    margin: 0.2cm 0;
}
.digital-signature-iso-utc {
    font-size: 7.5pt;
    color: var(--aegis-grey);
    margin: 0.6cm 0 0 0;
}

/* ===== SIGNATURE PAGE ===== */
.signature-page {
    page-break-before: always;
    break-before: page;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 22cm;
}
.signature-card {
    border: 1.2pt solid var(--aegis-blue);
    border-radius: 8pt;
    padding: 1.4cm 1.2cm;
    max-width: 14cm;
    text-align: center;
    background: #ffffff;
}
.signature-title {
    font-size: 18pt;
    font-weight: 700;
    color: var(--aegis-blue);
    margin: 0 0 0.5cm 0;
}
.signature-id {
    font-family: Consolas, 'Courier New', monospace;
    font-size: 13pt;
    color: var(--aegis-blue-light);
    margin-bottom: 0.8cm;
}
.signature-rights {
    font-size: 10pt;
    color: var(--aegis-grey);
    margin: 0.3cm 0;
}
.signature-coprod, .signature-sla {
    font-size: 8.5pt;
    color: var(--aegis-grey);
    margin: 0.3cm 0;
    line-height: 1.4;
}
`;
}

export function renderDiagnosticHtml(input: DiagnosticHtmlInput): string {
    const isFr = input.lang === 'fr';
    const pdfTitle = isFr
        ? `DIAGNOSTIC AEGIS Intelligence -- ${input.invoice_number}`
        : `AEGIS Intelligence DIAGNOSTIC -- ${input.invoice_number}`;
    const headings = collectHeadings(input.markdown_opus);
    const tocHtml = renderTocHtml(headings, input.lang);
    const bodyHtml = renderBodyHtml(input.markdown_opus);
    const coverHtml = renderCoverHtml(input);
    const digitalSignatureHtml = renderDigitalSignatureHtml(input);
    const signatureHtml = renderSignatureHtml(input);
    const css = buildCss();

    return `<!DOCTYPE html>
<html lang="${input.lang}">
<head>
<meta charset="UTF-8" />
<title>${htmlEscape(pdfTitle)}</title>
<meta name="author" content="AEGIS Intelligence" />
<meta name="subject" content="Diagnostic de compliance reglementaire EU" />
<meta name="keywords" content="AEGIS, compliance, EU, AI Act, CRA, Machinery Regulation, ESPR, Battery Regulation" />
<style>
${css}
</style>
</head>
<body>
${coverHtml}
${tocHtml}
<main class="body-content">
${bodyHtml}
</main>
${digitalSignatureHtml}
${signatureHtml}
</body>
</html>`;
}
