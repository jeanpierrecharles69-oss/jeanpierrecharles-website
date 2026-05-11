import { jsPDF } from 'jspdf';
import { marked, type Token, type Tokens } from 'marked';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * AEGIS Intelligence -- Server-side DIAGNOSTIC Generator (S4 Mission N11)
 *
 * Voie B serverless : Opus API + markdown -> jsPDF, sans Pandoc/LaTeX.
 * Mirror du flux PS1 aegis-diagnostic-api.ps1 mais 100% Vercel Function.
 *
 * Pipeline :
 *   1. Build prompt utilisateur (langInstruction + clientRequest depuis Supabase row)
 *   2. POST api.anthropic.com/v1/messages avec system prompt cache_control:ephemeral
 *   3. Substitution {{invoice_number}} dans la sortie Opus (Patch A v1.5.2)
 *   4. Rendu markdown -> PDF jsPDF (cover + sections + footer invoice_number)
 *
 * Version : 1.0.0 -- 20260508 -- creation S4
 */

// === Constants ===

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const OPUS_MODEL = 'claude-opus-4-6';
const OPUS_MAX_TOKENS = 32768;
const SYSTEM_PROMPT_PATH = 'config/diagnostic-system-prompt-v1.5.3.txt';

const SELLER = {
    name: 'Jean-Pierre CHARLES',
    trade: 'AEGIS Intelligence',
    siret: '522 794 700 00032',
    web: 'jeanpierrecharles.com',
    email: 'contact@jeanpierrecharles.com',
};

const COLOR = {
    accent: '#3b82f6',
    accentDark: '#1d4ed8',
    text: '#0f172a',
    slate400: '#94a3b8',
    slate500: '#64748b',
    slate600: '#475569',
    slate200: '#e2e8f0',
    slate50: '#f8fafc',
    emerald: '#10b981',
};

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

// === Markdown -> PDF rendering ===

function rgb(h: string): [number, number, number] {
    const c = h.replace('#', '');
    return [
        parseInt(c.slice(0, 2), 16),
        parseInt(c.slice(2, 4), 16),
        parseInt(c.slice(4, 6), 16),
    ];
}

interface RenderState {
    doc: jsPDF;
    y: number;
    pageNum: number;
    invoiceNumber: string;
    lang: 'fr' | 'en';
}

const PAGE_W = 210;
const PAGE_H = 297;
const ML = 18;
const MR = 18;
const MT = 22;
const MB = 22;
const RIGHT = PAGE_W - MR;
const CW = PAGE_W - ML - MR;

function setText(doc: jsPDF, h: string) {
    const c = rgb(h);
    doc.setTextColor(c[0], c[1], c[2]);
}
function setDraw(doc: jsPDF, h: string) {
    const c = rgb(h);
    doc.setDrawColor(c[0], c[1], c[2]);
}
function setFill(doc: jsPDF, h: string) {
    const c = rgb(h);
    doc.setFillColor(c[0], c[1], c[2]);
}

function drawFooter(state: RenderState) {
    const { doc, invoiceNumber, lang } = state;
    setDraw(doc, COLOR.slate200);
    doc.setLineWidth(0.2);
    doc.line(ML, PAGE_H - MB + 6, RIGHT, PAGE_H - MB + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    setText(doc, COLOR.slate400);
    doc.text(`AEGIS Intelligence — ${SELLER.web}`, ML, PAGE_H - MB + 11);
    const refLabel = lang === 'fr' ? 'Reference' : 'Reference';
    doc.text(`${refLabel} : ${invoiceNumber}`, PAGE_W / 2, PAGE_H - MB + 11, { align: 'center' });
    doc.text(`p. ${state.pageNum}`, RIGHT, PAGE_H - MB + 11, { align: 'right' });
}

function newPage(state: RenderState) {
    drawFooter(state);
    state.doc.addPage();
    state.pageNum += 1;
    state.y = MT;
}

function ensureSpace(state: RenderState, needed: number) {
    if (state.y + needed > PAGE_H - MB) {
        newPage(state);
    }
}

// Convertit les inline tokens marked en chunks {text, bold, italic, code} pour rendu jsPDF
interface InlineChunk { text: string; bold: boolean; italic: boolean; code: boolean }

function flattenInline(tokens: Token[] | undefined): InlineChunk[] {
    const out: InlineChunk[] = [];
    if (!tokens) return out;
    const walk = (toks: Token[], bold: boolean, italic: boolean, code: boolean) => {
        for (const t of toks) {
            if (t.type === 'text') {
                const inner = (t as Tokens.Text).tokens;
                if (inner && inner.length > 0) {
                    walk(inner, bold, italic, code);
                } else {
                    out.push({ text: (t as Tokens.Text).text, bold, italic, code });
                }
            } else if (t.type === 'strong') {
                walk((t as Tokens.Strong).tokens, true, italic, code);
            } else if (t.type === 'em') {
                walk((t as Tokens.Em).tokens, bold, true, code);
            } else if (t.type === 'codespan') {
                out.push({ text: (t as Tokens.Codespan).text, bold, italic, code: true });
            } else if (t.type === 'link') {
                walk((t as Tokens.Link).tokens, bold, italic, code);
            } else if (t.type === 'br') {
                out.push({ text: '\n', bold, italic, code });
            } else if (t.type === 'del') {
                walk((t as Tokens.Del).tokens, bold, italic, code);
            } else if (t.type === 'escape') {
                out.push({ text: (t as Tokens.Escape).text, bold, italic, code });
            } else if ((t as { text?: string }).text) {
                out.push({ text: (t as { text: string }).text, bold, italic, code });
            }
        }
    };
    walk(tokens, false, false, false);
    return out;
}

function chunkFontSet(doc: jsPDF, c: InlineChunk) {
    const style = c.bold && c.italic ? 'bolditalic' : c.bold ? 'bold' : c.italic ? 'italic' : 'normal';
    if (c.code) {
        doc.setFont('courier', c.bold ? 'bold' : 'normal');
    } else {
        doc.setFont('helvetica', style);
    }
}

// Rendu d'un paragraphe avec word-wrap respectant inline styles
function renderInlineLine(state: RenderState, chunks: InlineChunk[], opts: { fontSize: number; lineHeight: number; color?: string }) {
    const { doc } = state;
    const fontSize = opts.fontSize;
    const lineHeight = opts.lineHeight;
    setText(doc, opts.color || COLOR.text);
    doc.setFontSize(fontSize);

    // Tokenize chunks in words preserving styles
    type Word = { text: string; bold: boolean; italic: boolean; code: boolean; spaceAfter: boolean };
    const words: Word[] = [];
    for (const c of chunks) {
        const parts = c.text.split(/(\s+)/);
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (!part) continue;
            if (/^\s+$/.test(part)) {
                if (words.length > 0) words[words.length - 1].spaceAfter = true;
                if (part.includes('\n')) {
                    words.push({ text: '\n', bold: c.bold, italic: c.italic, code: c.code, spaceAfter: false });
                }
                continue;
            }
            words.push({ text: part, bold: c.bold, italic: c.italic, code: c.code, spaceAfter: false });
        }
    }

    let xCursor = ML;
    for (const w of words) {
        if (w.text === '\n') {
            state.y += lineHeight;
            xCursor = ML;
            ensureSpace(state, lineHeight);
            continue;
        }
        chunkFontSet(doc, w);
        const txt = w.text + (w.spaceAfter ? ' ' : '');
        const width = doc.getTextWidth(txt);
        if (xCursor + width > RIGHT && xCursor !== ML) {
            state.y += lineHeight;
            xCursor = ML;
            ensureSpace(state, lineHeight);
        }
        ensureSpace(state, lineHeight);
        doc.text(txt, xCursor, state.y);
        xCursor += width;
    }
    state.y += lineHeight;
}

function renderHeading(state: RenderState, depth: number, chunks: InlineChunk[]) {
    const { doc } = state;

    if (depth === 1) {
        // H1 = page break (sauf premiere)
        if (state.pageNum > 1 || state.y > MT + 5) {
            newPage(state);
        }
        ensureSpace(state, 30);
        setFill(doc, COLOR.accent);
        doc.rect(ML, state.y - 4, 4, 16, 'F');
        state.y += 4;
        renderInlineLine(state, chunks, { fontSize: 18, lineHeight: 7, color: COLOR.text });
        setDraw(doc, COLOR.slate200);
        doc.setLineWidth(0.4);
        doc.line(ML, state.y, RIGHT, state.y);
        state.y += 6;
        return;
    }
    if (depth === 2) {
        ensureSpace(state, 18);
        state.y += 4;
        renderInlineLine(state, chunks, { fontSize: 14, lineHeight: 6.5, color: COLOR.accentDark });
        state.y += 2;
        return;
    }
    if (depth === 3) {
        ensureSpace(state, 14);
        state.y += 3;
        renderInlineLine(state, chunks, { fontSize: 12, lineHeight: 5.5, color: COLOR.text });
        return;
    }
    // depth >= 4
    ensureSpace(state, 12);
    state.y += 2;
    renderInlineLine(state, chunks, { fontSize: 10.5, lineHeight: 5, color: COLOR.slate600 });
}

function renderParagraph(state: RenderState, chunks: InlineChunk[]) {
    state.y += 1;
    renderInlineLine(state, chunks, { fontSize: 10, lineHeight: 5, color: COLOR.text });
    state.y += 2;
}

function renderListItem(state: RenderState, chunks: InlineChunk[], ordered: boolean, idx: number, depth: number) {
    const { doc } = state;
    const indent = depth * 5;
    const bullet = ordered ? `${idx + 1}.` : '•';

    ensureSpace(state, 6);
    setText(doc, COLOR.slate500);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(bullet, ML + indent, state.y);

    // Render text with offset
    const savedML = ML;
    // Inline temporary indent — render text on the same line, manual layout
    setText(doc, COLOR.text);
    doc.setFontSize(10);

    // Compose word list w/ word-wrap, indented
    type Word = { text: string; bold: boolean; italic: boolean; code: boolean; spaceAfter: boolean };
    const words: Word[] = [];
    for (const c of chunks) {
        const parts = c.text.split(/(\s+)/);
        for (const part of parts) {
            if (!part) continue;
            if (/^\s+$/.test(part)) {
                if (words.length > 0) words[words.length - 1].spaceAfter = true;
                continue;
            }
            words.push({ text: part, bold: c.bold, italic: c.italic, code: c.code, spaceAfter: false });
        }
    }

    const startX = savedML + indent + 4;
    const lineHeight = 5;
    let xCursor = startX;
    for (const w of words) {
        chunkFontSet(doc, w);
        const txt = w.text + (w.spaceAfter ? ' ' : '');
        const width = doc.getTextWidth(txt);
        if (xCursor + width > RIGHT && xCursor !== startX) {
            state.y += lineHeight;
            xCursor = startX;
            ensureSpace(state, lineHeight);
        }
        ensureSpace(state, lineHeight);
        doc.text(txt, xCursor, state.y);
        xCursor += width;
    }
    state.y += lineHeight;
}

function renderTable(state: RenderState, header: string[], rows: string[][]) {
    const { doc } = state;
    const colCount = Math.max(header.length, ...rows.map(r => r.length));
    if (colCount === 0) return;
    const colW = CW / colCount;
    const cellPad = 1.5;
    const lineH = 4.4;

    const renderRow = (cells: string[], isHeader: boolean) => {
        // Compute heights
        const lines = cells.map((cell, i) => doc.splitTextToSize(cell || '', colW - 2 * cellPad) as string[]);
        const rowH = Math.max(...lines.map(l => l.length)) * lineH + cellPad * 2;
        ensureSpace(state, rowH);

        if (isHeader) {
            setFill(doc, COLOR.slate50);
            doc.rect(ML, state.y - lineH + 1, CW, rowH, 'F');
        }
        setDraw(doc, COLOR.slate200);
        doc.setLineWidth(0.2);
        for (let i = 0; i <= colCount; i++) {
            const x = ML + i * colW;
            doc.line(x, state.y - lineH + 1, x, state.y + rowH - lineH + 1);
        }
        doc.line(ML, state.y - lineH + 1, ML + colCount * colW, state.y - lineH + 1);
        doc.line(ML, state.y + rowH - lineH + 1, ML + colCount * colW, state.y + rowH - lineH + 1);

        doc.setFont('helvetica', isHeader ? 'bold' : 'normal');
        doc.setFontSize(8.5);
        setText(doc, isHeader ? COLOR.text : COLOR.slate600);

        for (let i = 0; i < colCount; i++) {
            const cellLines = lines[i] || [''];
            for (let j = 0; j < cellLines.length; j++) {
                doc.text(cellLines[j], ML + i * colW + cellPad, state.y + j * lineH);
            }
        }
        state.y += rowH;
    };

    renderRow(header, true);
    for (const row of rows) {
        renderRow(row, false);
    }
    state.y += 3;
}

function renderBlockquote(state: RenderState, tokens: Token[]) {
    const { doc } = state;
    setDraw(doc, COLOR.accent);
    const startY = state.y;
    const targetY = state.y + 4;
    state.y = targetY;

    // Render inner tokens but indent
    for (const t of tokens) {
        if (t.type === 'paragraph') {
            const chunks = flattenInline((t as Tokens.Paragraph).tokens);
            // Indent: temporarily shift ML by 6 — easier to just re-implement inline render with offset
            // Quick path: render as italic paragraph slightly indented
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(9.5);
            setText(doc, COLOR.slate600);
            const text = chunks.map(c => c.text).join('');
            const wrapped = doc.splitTextToSize(text, CW - 8) as string[];
            for (const line of wrapped) {
                ensureSpace(state, 5);
                doc.text(line, ML + 6, state.y);
                state.y += 5;
            }
        }
    }
    const endY = state.y;
    setDraw(doc, COLOR.accent);
    doc.setLineWidth(1);
    doc.line(ML + 2, startY + 1, ML + 2, endY - 1);
    state.y += 2;
}

function renderCodeBlock(state: RenderState, code: string) {
    const { doc } = state;
    const lines = code.split('\n');
    const lineH = 4.2;
    const padY = 2;
    const blockH = lines.length * lineH + padY * 2;
    ensureSpace(state, blockH);

    setFill(doc, COLOR.slate50);
    setDraw(doc, COLOR.slate200);
    doc.setLineWidth(0.2);
    doc.roundedRect(ML, state.y - lineH + 1, CW, blockH, 1.5, 1.5, 'FD');

    doc.setFont('courier', 'normal');
    doc.setFontSize(8.5);
    setText(doc, COLOR.slate600);
    let cy = state.y + padY;
    for (const line of lines) {
        const wrapped = doc.splitTextToSize(line, CW - 6) as string[];
        for (const wline of wrapped) {
            doc.text(wline, ML + 3, cy);
            cy += lineH;
        }
    }
    state.y = cy + 1;
}

function renderTokens(state: RenderState, tokens: Token[], listDepth = 0) {
    for (const tok of tokens) {
        if (tok.type === 'heading') {
            const h = tok as Tokens.Heading;
            const chunks = flattenInline(h.tokens);
            renderHeading(state, h.depth, chunks);
        } else if (tok.type === 'paragraph') {
            const p = tok as Tokens.Paragraph;
            const chunks = flattenInline(p.tokens);
            renderParagraph(state, chunks);
        } else if (tok.type === 'list') {
            const list = tok as Tokens.List;
            for (let i = 0; i < list.items.length; i++) {
                const item = list.items[i];
                const chunks = flattenInline(item.tokens.filter(t => t.type === 'text' || t.type === 'paragraph')
                    .flatMap((t) => {
                        if (t.type === 'paragraph') return (t as Tokens.Paragraph).tokens || [];
                        return (t as Tokens.Text).tokens || [{ type: 'text', text: (t as Tokens.Text).text } as Token];
                    }));
                renderListItem(state, chunks, list.ordered, i, listDepth);
                // Nested lists
                const nested = item.tokens.filter(t => t.type === 'list') as Tokens.List[];
                for (const n of nested) {
                    renderTokens(state, [n], listDepth + 1);
                }
            }
            state.y += 2;
        } else if (tok.type === 'table') {
            const t = tok as Tokens.Table;
            const header = t.header.map(h => h.text);
            const rows = t.rows.map(r => r.map(cell => cell.text));
            renderTable(state, header, rows);
        } else if (tok.type === 'blockquote') {
            renderBlockquote(state, (tok as Tokens.Blockquote).tokens);
        } else if (tok.type === 'code') {
            renderCodeBlock(state, (tok as Tokens.Code).text);
        } else if (tok.type === 'hr') {
            ensureSpace(state, 6);
            setDraw(state.doc, COLOR.slate200);
            state.doc.setLineWidth(0.3);
            state.doc.line(ML, state.y, RIGHT, state.y);
            state.y += 4;
        } else if (tok.type === 'space') {
            state.y += 2;
        }
    }
}

function renderCoverPage(state: RenderState, data: DiagnosticInput) {
    const { doc } = state;
    const isFr = data.lang === 'fr';

    // Logo bloc
    setFill(doc, COLOR.accent);
    doc.rect(ML, MT + 5, 8, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    setText(doc, '#ffffff');
    doc.text('AE', ML + 4, MT + 11, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    setText(doc, COLOR.accent);
    doc.text('AEGIS Intelligence', ML + 12, MT + 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    setText(doc, COLOR.slate500);
    doc.text(isFr ? 'Diagnostic Conformite Industrielle EU' : 'EU Industrial Compliance Diagnostic', ML + 12, MT + 16);

    // Centered title block
    let cy = 90;
    setText(doc, COLOR.text);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    const title = isFr ? 'DIAGNOSTIC' : 'DIAGNOSTIC';
    doc.text(title, PAGE_W / 2, cy, { align: 'center' });
    cy += 10;
    doc.setFontSize(14);
    setText(doc, COLOR.slate600);
    doc.text(isFr ? 'Analyse de conformite reglementaire' : 'Regulatory compliance analysis', PAGE_W / 2, cy, { align: 'center' });

    cy += 30;
    setDraw(doc, COLOR.accent);
    doc.setLineWidth(0.6);
    doc.line(PAGE_W / 2 - 30, cy, PAGE_W / 2 + 30, cy);

    // Client block
    cy += 20;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    setText(doc, COLOR.slate400);
    doc.text(isFr ? 'CLIENT' : 'CUSTOMER', PAGE_W / 2, cy, { align: 'center' });
    cy += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    setText(doc, COLOR.text);
    doc.text(data.customer_company, PAGE_W / 2, cy, { align: 'center' });
    cy += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    setText(doc, COLOR.slate600);
    doc.text(data.customer_name, PAGE_W / 2, cy, { align: 'center' });

    // Reference + date block
    cy += 20;
    doc.setFontSize(9);
    setText(doc, COLOR.slate400);
    doc.text(isFr ? 'REFERENCE' : 'REFERENCE', PAGE_W / 2, cy, { align: 'center' });
    cy += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    setText(doc, COLOR.accent);
    doc.text(data.invoice_number, PAGE_W / 2, cy, { align: 'center' });

    cy += 12;
    const dateStr = new Date().toLocaleDateString(isFr ? 'fr-FR' : 'en-GB', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    setText(doc, COLOR.slate500);
    doc.text(dateStr, PAGE_W / 2, cy, { align: 'center' });

    // Footer cover
    setText(doc, COLOR.slate400);
    doc.setFontSize(8);
    doc.text(`${SELLER.trade} | ${SELLER.web} | SIRET ${SELLER.siret}`, PAGE_W / 2, PAGE_H - 20, { align: 'center' });
    doc.text(isFr ? 'Document confidentiel — Usage interne client' : 'Confidential document — Customer internal use', PAGE_W / 2, PAGE_H - 15, { align: 'center' });
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

    // 4. Render markdown -> PDF
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    const state: RenderState = {
        doc,
        y: MT,
        pageNum: 1,
        invoiceNumber: data.invoice_number,
        lang: data.lang,
    };

    // Cover page
    renderCoverPage(state, data);
    drawFooter(state);

    // Body
    doc.addPage();
    state.pageNum = 2;
    state.y = MT;

    const tokens = marked.lexer(markdown);
    renderTokens(state, tokens);
    drawFooter(state);

    // 5. Output
    const arrayBuffer = doc.output('arraybuffer') as ArrayBuffer;
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const filename = `AEGIS-DIAGNOSTIC-${data.invoice_number}.pdf`;

    return {
        markdown,
        pdfBuffer: buffer,
        pdfBase64: base64,
        pdfFilename: filename,
        pdfSize: buffer.byteLength,
        opusUsage: usage,
    };
}
