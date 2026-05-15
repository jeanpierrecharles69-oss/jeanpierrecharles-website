import * as fs from 'node:fs';
import * as path from 'node:path';
import { renderPdfFromHtml } from './pdf-renderer.js';
import { renderDiagnosticHtml, type DiagnosticHtmlInput } from './diagnostic-html-template.js';

/**
 * AEGIS Intelligence -- Server-side DIAGNOSTIC Generator (S4 Mission N11 / N12.E migration)
 *
 * Voie B serverless : Opus API + markdown -> Puppeteer + Chromium serverless.
 * Mirror du flux PS1 aegis-diagnostic-api.ps1 mais 100% Vercel Function.
 *
 * Pipeline :
 *   1. Build prompt utilisateur (langInstruction + clientRequest depuis Supabase row)
 *   2. POST api.anthropic.com/v1/messages avec system prompt cache_control:ephemeral
 *   3. Substitution {{invoice_number}} dans la sortie Opus (Patch A v1.5.2)
 *   4. Rendu markdown -> HTML canonique (renderDiagnosticHtml) -> PDF (renderPdfFromHtml)
 *
 * Migration N12.E : remplacement rendu PDF jsPDF -> Puppeteer + Chromium serverless.
 * Decision parente : D_T2035_01 signe 11/05/2026. GO L3 JP T0825 14/05.
 * Etapes 1-3 inchangees ; etape 4 refondue. Helpers jsPDF supprimes (renderCoverPage,
 * renderTokens, drawFooter, RenderState, COLOR, PAGE_*, ML/MR/MT/MB, etc.).
 *
 * Version : 1.1.0 -- 20260514 -- N12.E migration prod jsPDF -> Puppeteer
 */

// === Constants ===

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const OPUS_MODEL = 'claude-opus-4-6';
const OPUS_MAX_TOKENS = 32768;
const SYSTEM_PROMPT_PATH = 'config/diagnostic-system-prompt-v1.5.5.txt';

// === Types ===

export interface DiagnosticInput {
    invoice_number: string;
    request_id: string;
    lang: 'fr' | 'en';
    customer_name: string;
    customer_company: string;
    customer_email: string;
    sector: string;
    product: string;
    regulations: string[];
    context?: string;
    country?: string;
    city?: string;
}

export interface DiagnosticOutput {
    markdown: string;
    pdfBuffer: Buffer;
    pdfBase64: string;
    pdfFilename: string;
    pdfSize: number;
    opusUsage?: {
        input_tokens?: number;
        output_tokens?: number;
        cache_read_input_tokens?: number;
        cache_creation_input_tokens?: number;
    };
}

// === Prompt builders ===

function loadSystemPrompt(): string {
    const p = path.join(process.cwd(), SYSTEM_PROMPT_PATH);
    return fs.readFileSync(p, 'utf-8');
}

function buildClientRequestBlock(data: DiagnosticInput): string {
    const isFr = data.lang === 'fr';
    const lines: string[] = [];
    lines.push(`${isFr ? 'Numero de facture' : 'Invoice number'} : ${data.invoice_number}`);
    lines.push(`${isFr ? 'Client' : 'Customer'} : ${data.customer_name}`);
    lines.push(`${isFr ? 'Entreprise' : 'Company'} : ${data.customer_company}`);
    if (data.country) lines.push(`${isFr ? 'Pays' : 'Country'} : ${data.country}`);
    if (data.city) lines.push(`${isFr ? 'Ville' : 'City'} : ${data.city}`);
    lines.push(`${isFr ? 'Secteur' : 'Sector'} : ${data.sector}`);
    lines.push(`${isFr ? 'Produit / systeme' : 'Product / system'} : ${data.product}`);
    lines.push(`${isFr ? 'Reglements applicables' : 'Applicable regulations'} : ${data.regulations.join(', ')}`);
    if (data.context) {
        lines.push('');
        lines.push(`${isFr ? 'Contexte additionnel' : 'Additional context'} :`);
        lines.push(data.context);
    }
    return lines.join('\n');
}

function buildUserPrompt(data: DiagnosticInput): string {
    const langInstruction = data.lang === 'en'
        ? 'LANG:EN\nAnswer in professional British English (EN-GB) per the OUTPUT LANGUAGE DIRECTIVE in the system prompt.'
        : 'Reponds en francais.';
    const clientRequest = buildClientRequestBlock(data);
    return `${langInstruction}

Voici la demande de diagnostic d'un client PME/ETI industrielle :

---
${clientRequest}
---

Produis le diagnostic complet selon le format AEGIS Intelligence (7 sections).
Sois precis sur les articles et annexes des reglements applicables.
Identifie les interactions croisees entre les reglements qui s'appliquent au produit/systeme decrit.
`;
}

// === Anthropic call ===

async function callOpus(systemPrompt: string, userPrompt: string): Promise<{ text: string; usage?: DiagnosticOutput['opusUsage'] }> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY not configured');
    }

    // P0 fix T1930 : passage en streaming SSE (stream: true).
    // Cause racine "fetch failed" a 300_226ms exact = Node.js undici headersTimeout
    // par defaut = 300_000ms. Opus 4.6 met ~6 min a generer 32k tokens en mode
    // non-streaming -> undici coupe la connexion AVANT que les headers de reponse
    // ne soient totalement recus. En mode streaming SSE chaque event keep-alive
    // la connexion et undici ne coupe jamais.
    // Garde-fou supplementaire : AbortSignal.timeout(700_000) (< 800s Vercel maxDuration).
    const requestBody = {
        model: OPUS_MODEL,
        max_tokens: OPUS_MAX_TOKENS,
        stream: true,
        system: [
            {
                type: 'text',
                text: systemPrompt,
                cache_control: { type: 'ephemeral' },
            },
        ],
        messages: [{ role: 'user', content: userPrompt }],
    };

    const response = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
            'x-api-key': apiKey,
            'anthropic-version': ANTHROPIC_VERSION,
            'content-type': 'application/json',
            'accept': 'text/event-stream',
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(700_000),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`anthropic_${response.status}: ${errText.slice(0, 300)}`);
    }

    if (!response.body) {
        throw new Error('opus_no_response_body');
    }

    // Parsing SSE manuel : on accumule les content_block_delta.text_delta dans collectedText
    // et on lit l'usage final depuis message_start + message_delta.usage.
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let collectedText = '';
    let usage: DiagnosticOutput['opusUsage'] | undefined;

    try {
        for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            // Les events SSE sont separes par \n\n ; chaque event a une ligne "data: {...}".
            let nlIdx = buffer.indexOf('\n');
            while (nlIdx !== -1) {
                const line = buffer.slice(0, nlIdx).trim();
                buffer = buffer.slice(nlIdx + 1);
                nlIdx = buffer.indexOf('\n');
                if (!line.startsWith('data:')) continue;
                const dataStr = line.slice(5).trim();
                if (!dataStr || dataStr === '[DONE]') continue;
                try {
                    const ev = JSON.parse(dataStr) as {
                        type?: string;
                        message?: { usage?: DiagnosticOutput['opusUsage'] };
                        delta?: { type?: string; text?: string };
                        usage?: { output_tokens?: number };
                    };
                    if (ev.type === 'message_start' && ev.message?.usage) {
                        usage = ev.message.usage;
                    } else if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta' && typeof ev.delta.text === 'string') {
                        collectedText += ev.delta.text;
                    } else if (ev.type === 'message_delta' && ev.usage && usage) {
                        // message_delta apporte output_tokens final
                        usage = { ...usage, output_tokens: ev.usage.output_tokens };
                    } else if (ev.type === 'error') {
                        const errEv = ev as unknown as { error?: { type?: string; message?: string } };
                        throw new Error(`anthropic_stream_error: ${errEv.error?.type || 'unknown'} ${errEv.error?.message || ''}`.trim());
                    }
                } catch (parseErr) {
                    // Une seule event mal-formed ne doit pas tuer le parsing ; on ne re-throw
                    // que les anthropic_stream_error explicites.
                    if (parseErr instanceof Error && parseErr.message.startsWith('anthropic_stream_error')) {
                        throw parseErr;
                    }
                    // sinon, skip silencieusement (ligne SSE corrompue rare)
                }
            }
        }
    } finally {
        try { reader.releaseLock(); } catch { /* ignore */ }
    }

    if (!collectedText || collectedText.trim().length === 0) {
        throw new Error('opus_empty_response');
    }

    return { text: collectedText, usage };
}

// === Public entry ===

export async function generateDiagnosticReport(data: DiagnosticInput): Promise<DiagnosticOutput> {
    // 1. Load system prompt + build user prompt
    const systemPrompt = loadSystemPrompt();
    const userPrompt = buildUserPrompt(data);

    // 2. Call Opus
    const { text: rawMarkdown, usage } = await callOpus(systemPrompt, userPrompt);

    // 3. Substitute {{invoice_number}} (Patch A v1.5.2)
    const markdown = rawMarkdown.replace(/\{\{invoice_number\}\}/g, data.invoice_number);

    // 4. Render markdown -> PDF via Puppeteer (N12.E migration)
    const htmlInput: DiagnosticHtmlInput = {
        ...data,
        markdown_opus: markdown,
    };
    const html = renderDiagnosticHtml(htmlInput);
    const renderResult = await renderPdfFromHtml({
        html,
        invoice_number: data.invoice_number,
        format: 'A4',
        printBackground: true,
    });

    // 5. Output
    const buffer = Buffer.from(renderResult.pdf);
    const base64 = buffer.toString('base64');
    const filename = `AEGIS-DIAGNOSTIC-${data.invoice_number}.pdf`;

    return {
        markdown,
        pdfBuffer: buffer,
        pdfBase64: base64,
        pdfFilename: filename,
        pdfSize: renderResult.sizeBytes,
        opusUsage: usage,
    };
}
