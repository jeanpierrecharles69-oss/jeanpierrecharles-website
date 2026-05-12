import type { VercelRequest, VercelResponse } from '@vercel/node';
import { timingSafeEqual } from 'node:crypto';
import { renderPdfFromHtml } from './_lib/pdf-renderer.js';
import { renderDiagnosticHtml, type DiagnosticHtmlInput } from './_lib/diagnostic-html-template.js';
import type { DiagnosticInput } from './_lib/diagnostic-generator.js';

/**
 * AEGIS Intelligence -- DIAGNOSTIC PDF endpoint (N12.C POC)
 *
 * Endpoint POC pour la chaine de rendu Puppeteer signee D_T2035_01 Option A.
 * NON cable en production : `api/generate-diagnostic.ts` continue de passer par jsPDF
 * (chaine `_lib/diagnostic-generator.ts`). Migration production = N12.E ulterieure.
 *
 * Usage :
 *   POST /api/diagnostic-pdf
 *   Headers : x-admin-key, content-type: application/json
 *   Body : { invoice_number, lang, customer:{first_name,last_name,company,email,country?,city?}, markdown_opus }
 *   Response 200 : Content-Type application/pdf, binary
 *   Response 4xx/5xx : JSON { error, reason }
 *
 * Version : 1.0.0 -- 20260512 -- creation N12.C
 */

export const config = { maxDuration: 800, memory: 1024 };

interface CustomerPayload {
    first_name?: string;
    last_name?: string;
    company?: string;
    email?: string;
    country?: string;
    city?: string;
}

interface RequestBody {
    invoice_number?: string;
    lang?: string;
    customer?: CustomerPayload;
    markdown_opus?: string;
}

function timingSafeStringEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    try {
        return timingSafeEqual(bufA, bufB);
    } catch {
        return false;
    }
}

function authorize(req: VercelRequest, res: VercelResponse): boolean {
    const expected = process.env.AEGIS_ADMIN_KEY;
    if (!expected) {
        console.error(JSON.stringify({
            event: 'diagnostic_pdf_misconfigured',
            reason: 'AEGIS_ADMIN_KEY not set',
            severity: 'critical',
            timestamp: new Date().toISOString(),
        }));
        res.status(401).json({ error: 'Unauthorized', reason: 'admin_key_not_configured' });
        return false;
    }
    const provided = req.headers['x-admin-key'];
    if (typeof provided !== 'string' || provided.length === 0) {
        res.status(401).json({ error: 'Unauthorized', reason: 'missing_admin_key' });
        return false;
    }
    if (!timingSafeStringEqual(provided, expected)) {
        res.status(403).json({ error: 'Forbidden', reason: 'invalid_admin_key' });
        return false;
    }
    return true;
}

function buildHtmlInput(body: RequestBody): DiagnosticHtmlInput {
    const invoice = body.invoice_number || 'AEGIS-POC-UNKNOWN';
    const lang: 'fr' | 'en' = body.lang === 'en' ? 'en' : 'fr';
    const c = body.customer || {};
    const customerName = [c.first_name, c.last_name].filter(Boolean).join(' ').trim() || 'Client';
    const company = c.company || 'AEGIS Test SAS';
    const email = c.email || 'test@jeanpierrecharles.com';
    const markdown = body.markdown_opus || '';

    const base: DiagnosticInput = {
        invoice_number: invoice,
        request_id: invoice,
        lang,
        customer_name: customerName,
        customer_company: company,
        customer_email: email,
        sector: '',
        product: '',
        regulations: [],
        country: c.country,
        city: c.city,
    };
    return { ...base, markdown_opus: markdown };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'method_not_allowed', reason: 'POST required' });
    }
    if (!authorize(req, res)) return;

    const body: RequestBody = req.body || {};
    if (typeof body.invoice_number !== 'string' || body.invoice_number.length === 0) {
        return res.status(400).json({ error: 'bad_request', reason: 'invoice_number required' });
    }
    if (typeof body.markdown_opus !== 'string' || body.markdown_opus.length === 0) {
        return res.status(400).json({ error: 'bad_request', reason: 'markdown_opus required' });
    }
    if (body.lang && body.lang !== 'fr' && body.lang !== 'en') {
        return res.status(400).json({ error: 'bad_request', reason: 'lang must be fr or en' });
    }

    const input = buildHtmlInput(body);
    const html = renderDiagnosticHtml(input);

    let result;
    try {
        result = await renderPdfFromHtml({
            html,
            invoice_number: input.invoice_number,
            format: 'A4',
            printBackground: true,
        });
    } catch (err: unknown) {
        const reason = (err as { message?: string })?.message || 'render_unknown_error';
        console.error(JSON.stringify({
            event: 'diagnostic_pdf_render_failed',
            invoice_number: input.invoice_number,
            error: reason,
            severity: 'critical',
            timestamp: new Date().toISOString(),
        }));
        return res.status(500).json({ error: 'render_failed', reason });
    }

    console.log(JSON.stringify({
        event: 'diagnostic_pdf_rendered',
        invoice_number: input.invoice_number,
        pdf_size_bytes: result.sizeBytes,
        pdf_page_count: result.pageCount,
        pdf_sha256_prefix: result.sha256.slice(0, 8),
        duration_ms: result.durationMs,
        timestamp: new Date().toISOString(),
    }));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="AEGIS-DIAGNOSTIC-${input.invoice_number}.pdf"`);
    res.setHeader('Content-Length', String(result.sizeBytes));
    res.setHeader('X-PDF-SHA256', result.sha256);
    res.setHeader('X-PDF-PageCount', String(result.pageCount));
    res.setHeader('X-PDF-DurationMs', String(result.durationMs));
    return res.status(200).send(result.pdf);
}
