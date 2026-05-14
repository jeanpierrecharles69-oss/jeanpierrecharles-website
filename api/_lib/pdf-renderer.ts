import puppeteer, { type PaperFormat } from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';
import crypto from 'node:crypto';
import * as fs from 'node:fs';

/**
 * AEGIS Intelligence -- PDF renderer Puppeteer (N12.C POC)
 *
 * Logique : HTML/CSS -> PDF via Puppeteer + Chromium serverless.
 * Decision parente : D_T2035_01 signee 11/05/2026 T2210 (Option A).
 *
 * Runtime dual :
 *   - production (process.env.VERCEL) : @sparticuz/chromium-min via tarball CDN
 *   - local Surface ARM64 / x86_64    : Edge ou Chrome installe (executablePath direct)
 *
 * Reutilisation cross-pipeline future : DIAG (N12.C) + VEILLE (N12.F).
 *
 * Version : 1.0.0 -- 20260512 -- creation N12.C
 */

export interface PdfRenderInput {
    html: string;
    invoice_number: string;
    format?: PaperFormat;
    margin?: { top?: string; bottom?: string; left?: string; right?: string };
    printBackground?: boolean;
    headerTemplate?: string;
    footerTemplate?: string;
}

export interface PdfRenderResult {
    pdf: Buffer;
    pageCount: number;
    sha256: string;
    sizeBytes: number;
    durationMs: number;
}

const CHROMIUM_VERSION = '148.0.0';
const CHROMIUM_REMOTE_TARBALL = `https://github.com/Sparticuz/chromium/releases/download/v${CHROMIUM_VERSION}/chromium-v${CHROMIUM_VERSION}-pack.x64.tar`;

// Edge prioritaire (presence garantie sur la Surface Pro JP cf. bridge T0715 sec 5.6).
// Chrome fallback secondaire si Edge absent (machine alternative).
const LOCAL_BROWSER_PATHS = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
];

interface BrowserConfig {
    executablePath: string;
    args: string[];
    headless: 'shell' | boolean;
}

function findLocalBrowser(): string | null {
    for (const p of LOCAL_BROWSER_PATHS) {
        try {
            fs.accessSync(p, fs.constants.R_OK);
            return p;
        } catch {
            // continue
        }
    }
    return null;
}

async function getBrowserConfig(): Promise<BrowserConfig> {
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    if (isServerless) {
        const executablePath = await chromium.executablePath(CHROMIUM_REMOTE_TARBALL);
        return {
            executablePath,
            args: chromium.args,
            headless: true,
        };
    }

    const local = findLocalBrowser();
    if (!local) {
        throw new Error('pdf_renderer_no_local_browser: install Microsoft Edge or Google Chrome');
    }
    return {
        executablePath: local,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--font-render-hinting=none',
        ],
        headless: true,
    };
}

// PDF spec : chaque page concrete est un objet `/Type /Page`. La racine `/Type /Pages`
// est le tree node (pluriel). Lookahead negatif `(?!s)` evite le faux positif.
function countPdfPages(buffer: Buffer): number {
    const text = buffer.toString('latin1');
    const matches = text.match(/\/Type\s*\/Page(?!s)/g);
    return matches ? matches.length : 0;
}

function buildDefaultFooter(invoiceNumber: string): string {
    const safeId = invoiceNumber.replace(/[<>&"']/g, '');
    return `
        <div style="font-family:'Segoe UI',Arial,sans-serif;font-size:8pt;color:#4A5568;width:100%;padding:0 18mm;display:flex;justify-content:space-between;align-items:center;border-top:0.3pt solid #E2E8F0;padding-top:4pt;-webkit-print-color-adjust:exact;print-color-adjust:exact;">
            <span style="font-family:Consolas,'Courier New',monospace;font-size:7.5pt;">${safeId}</span>
            <span>&copy; AEGIS Intelligence</span>
            <span>Page <span class="pageNumber"></span> / <span class="totalPages"></span></span>
        </div>
    `;
}

export async function renderPdfFromHtml(input: PdfRenderInput): Promise<PdfRenderResult> {
    const startedAt = Date.now();
    const config = await getBrowserConfig();

    const browser = await puppeteer.launch({
        executablePath: config.executablePath,
        args: config.args,
        headless: config.headless,
        defaultViewport: { width: 1240, height: 1754 },
    });

    try {
        const page = await browser.newPage();
        await page.setContent(input.html, {
            waitUntil: ['load', 'domcontentloaded'],
            timeout: 60_000,
        });
        await page.emulateMediaType('print');

        const pdfData = await page.pdf({
            format: input.format ?? 'A4',
            printBackground: input.printBackground ?? true,
            margin: input.margin ?? { top: '18mm', bottom: '20mm', left: '18mm', right: '18mm' },
            displayHeaderFooter: true,
            headerTemplate: input.headerTemplate ?? '<div></div>',
            footerTemplate: input.footerTemplate ?? buildDefaultFooter(input.invoice_number),
            preferCSSPageSize: false,
            // N12.D F1 (P0) correctif T2125 : signets PDF (bookmarks) navigables Adobe/Edge.
            // tagged: true active accessibilite PDF/UA. outline: true (Puppeteer >=22.7) genere
            // les bookmarks panneau lateral depuis la structure headings HTML (h1, h2, h3).
            // outline requires tagged. Cf. brief 20260513T2110 F1.
            tagged: true,
            outline: true,
        });

        const pdf = Buffer.from(pdfData);
        const sha256 = crypto.createHash('sha256').update(pdf).digest('hex');
        const pageCount = countPdfPages(pdf);

        return {
            pdf,
            pageCount,
            sha256,
            sizeBytes: pdf.byteLength,
            durationMs: Date.now() - startedAt,
        };
    } finally {
        await browser.close();
    }
}
