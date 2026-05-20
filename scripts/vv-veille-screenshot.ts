/**
 * V&V comparaison HTML vs PDF -- capture les composants signature du HTML (rendu navigateur)
 * en PNG, pour comparaison cote a cote avec le rendu PDF (render_pdf_page outil PDF).
 * Lancer (PowerShell) : npx tsx scripts/vv-veille-screenshot.ts
 */
import puppeteer from 'puppeteer-core';
import * as fs from 'node:fs';

const PATHS = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
];

async function main(): Promise<void> {
    const exe = PATHS.find((p) => fs.existsSync(p));
    if (!exe) throw new Error('no_local_browser');
    const html = fs.readFileSync('C:/Users/jpcha/Downloads/VV-veille-puppeteer.html', 'utf-8');
    const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--no-sandbox', '--disable-gpu'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 820, height: 1160, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: ['load', 'networkidle0'] });
    try { await page.evaluate(() => (document as { fonts?: { ready?: Promise<unknown> } }).fonts?.ready); } catch { /* best effort */ }

    const shots: Array<[string, string]> = [
        ['.cover', 'C:/Users/jpcha/Downloads/VV-html-1-cover.png'],
        ['table', 'C:/Users/jpcha/Downloads/VV-html-2-dashboard.png'],
        ['.value-section', 'C:/Users/jpcha/Downloads/VV-html-3-value.png'],
        ['.cta-box', 'C:/Users/jpcha/Downloads/VV-html-4-cta.png'],
    ];
    const done: string[] = [];
    for (const [sel, file] of shots) {
        const el = await page.$(sel);
        if (el) { await el.screenshot({ path: file }); done.push(`${sel} -> ${file}`); }
    }
    await browser.close();
    console.log(JSON.stringify({ event: 'vv_html_shots_ok', browser: exe, shots: done }, null, 2));
}
main().catch((e) => { console.error('SHOT_FAIL', e); process.exit(1); });
