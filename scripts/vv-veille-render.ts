/**
 * V&V rendu VEILLE production -- N13 DIVA-02 (20260520)
 *
 * Chaine de production : markdown Opus -> renderVeilleHTML (HTML AEGIS) -> renderPdfFromHtml
 * (Puppeteer). Identique a api/generate-veille-report.ts. En local, renderPdfFromHtml utilise
 * Edge/Chrome installe ; en serverless, @sparticuz/chromium. Conforme L_T1645_01 / L_T1620_01.
 *
 * Sorties : HTML (a ouvrir dans Chrome pour comparaison) + PDF (rendu Puppeteer).
 * Lancer (PowerShell) : npx tsx scripts/vv-veille-render.ts
 */
import * as fs from 'node:fs';
import { renderVeilleHTML } from '../api/_lib/veille-html-template.ts';
import { renderPdfFromHtml } from '../api/_lib/pdf-renderer.ts';

const MD_PATH = 'C:/Projects/jeanpierrecharles/20260520T0735_VEILLE-N0-MAI-2026-FR-FINAL.md';
const OUT_HTML = 'C:/Users/jpcha/Downloads/VV-veille-clean.html';
const OUT_PDF = 'C:/Users/jpcha/Downloads/VV-veille-clean.pdf';

async function main(): Promise<void> {
    const markdown = fs.readFileSync(MD_PATH, 'utf-8');
    const edition = 'Mai 2026 -- N°1';

    const html = renderVeilleHTML({ edition, lang: 'fr', markdown, month_label: 'Mai 2026' });
    fs.writeFileSync(OUT_HTML, html);

    const footer = `<div style="font-family:'DM Sans',Arial,sans-serif;font-size:8pt;color:#94a3b8;width:100%;padding:0 16mm;display:flex;justify-content:space-between;align-items:center;-webkit-print-color-adjust:exact;print-color-adjust:exact;"><span>AEGIS Intelligence &mdash; jeanpierrecharles.com</span><span>${edition}</span><span>p. <span class="pageNumber"></span>/<span class="totalPages"></span></span></div>`;

    const r = await renderPdfFromHtml({
        html,
        invoice_number: edition,
        format: 'A4',
        printBackground: true,
        waitForFonts: true,
        useCssPageSize: true,
        footerTemplate: footer,
    });
    fs.writeFileSync(OUT_PDF, r.pdf);

    console.log(JSON.stringify({
        event: 'vv_veille_puppeteer_ok',
        out_html: OUT_HTML,
        out_pdf: OUT_PDF,
        pdf_size_bytes: r.sizeBytes,
        page_count: r.pageCount,
        render_ms: r.durationMs,
        sha256: r.sha256,
    }, null, 2));
}

main().catch((e) => { console.error('VV_FAIL', e); process.exit(1); });
