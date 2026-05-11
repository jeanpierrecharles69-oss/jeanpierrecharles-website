import { jsPDF } from 'jspdf';
import { marked, type Token, type Tokens } from 'marked';

/**
 * AEGIS Intelligence -- VEILLE Monthly Report PDF Template (S5 Mission N11)
 *
 * Pure renderer : prend markdown deja genere par Opus + metadata, produit un PDF.
 * Charte AEGIS dediee VEILLE :
 *   - Navy   #1e3a5f (couleur primaire)
 *   - Gold   #c9a84c (accent)
 *
 * Layout :
 *   - Page 1 : couverture (logo AEGIS + edition + sous-titre + date)
 *   - Pages suivantes : 6 sections (Exec Summary, Tableau bord, Analyse par pilier x5, Calendrier, Sources, Cloture)
 *   - Footer : edition + numero de page sur chaque page
 *
 * Bilingue FR/EN selon parametre lang.
 *
 * Version : 1.0.0 -- 20260508 -- creation S5
 */

// === Brand constants ===

const AEGIS_NAVY = '#1e3a5f';
const AEGIS_GOLD = '#c9a84c';

const COLOR = {
    navy: AEGIS_NAVY,
    gold: AEGIS_GOLD,
    text: '#0f172a',
    slate400: '#94a3b8',
    slate500: '#64748b',
    slate600: '#475569',
    slate200: '#e2e8f0',
    slate50: '#f8fafc',
};

const SELLER = {
    trade: 'AEGIS Intelligence',
    siret: '522 794 700 00032',
    web: 'jeanpierrecharles.com',
    email: 'contact@jeanpierrecharles.com',
};

// === Types ===

export interface VeilleReportInput {
    edition: string;       // ex: "Mai 2026 -- N°1" ou "2026-05-N1"
    lang: 'fr' | 'en';
    markdown: string;      // sortie Opus deja substitution {{edition}}
    month_label?: string;  // ex: "Mai 2026" pour la couverture
}

export interface VeilleReportOutput {
    pdfBuffer: Buffer;
    pdfBase64: string;
    pdfFilename: string;
    pdfSize: number;
}

// === Layout constants ===

const PAGE_W = 210;
const PAGE_H = 297;
const ML = 18;
const MR = 18;
const MT = 22;
const MB = 22;
const RIGHT = PAGE_W - MR;
const CW = PAGE_W - ML - MR;

// === Helpers ===

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
    edition: string;
    lang: 'fr' | 'en';
}

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
    const { doc, edition, lang } = state;
    setDraw(doc, COLOR.slate200);
    doc.setLineWidth(0.2);
    doc.line(ML, PAGE_H - MB + 6, RIGHT, PAGE_H - MB + 6);

    // Pastille gold
    setFill(doc, COLOR.gold);
    doc.rect(ML, PAGE_H - MB + 8, 2.5, 2.5, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    setText(doc, COLOR.slate400);
    doc.text(`AEGIS Intelligence -- ${SELLER.web}`, ML + 5, PAGE_H - MB + 11);
    const refLabel = lang === 'fr' ? 'Edition' : 'Edition';
    doc.text(`${refLabel} : ${edition}`, PAGE_W / 2, PAGE_H - MB + 11, { align: 'center' });
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

// === Inline tokens flattening ===

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

function renderInlineLine(state: RenderState, chunks: InlineChunk[], opts: { fontSize: number; lineHeight: number; color?: string; startX?: number }) {
    const { doc } = state;
    const fontSize = opts.fontSize;
    const lineHeight = opts.lineHeight;
    const startX = opts.startX ?? ML;
    setText(doc, opts.color || COLOR.text);
    doc.setFontSize(fontSize);

    type Word = { text: string; bold: boolean; italic: boolean; code: boolean; spaceAfter: boolean };
    const words: Word[] = [];
    for (const c of chunks) {
        const parts = c.text.split(/(\s+)/);
        for (const part of parts) {
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

    let xCursor = startX;
    for (const w of words) {
        if (w.text === '\n') {
            state.y += lineHeight;
            xCursor = startX;
            ensureSpace(state, lineHeight);
            continue;
        }
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

// === Block renderers ===

function renderHeading(state: RenderState, depth: number, chunks: InlineChunk[]) {
    const { doc } = state;

    if (depth === 1 || depth === 2) {
        // H1/H2 : page break si pas en debut de page + bandeau navy
        if (state.pageNum >= 2 && state.y > MT + 5) {
            // garder sur la meme page si tres haut, sinon page break
            if (state.y > 60) newPage(state);
        }
        ensureSpace(state, 22);
        // Barre verticale gold
        setFill(doc, COLOR.gold);
        doc.rect(ML, state.y - 5, 3, 18, 'F');
        state.y += 4;
        renderInlineLine(state, chunks, {
            fontSize: depth === 1 ? 18 : 16,
            lineHeight: 7,
            color: COLOR.navy,
            startX: ML + 6,
        });
        // Soulignement subtil
        setDraw(doc, COLOR.slate200);
        doc.setLineWidth(0.4);
        doc.line(ML, state.y, RIGHT, state.y);
        state.y += 6;
        return;
    }
    if (depth === 3) {
        ensureSpace(state, 14);
        state.y += 3;
        renderInlineLine(state, chunks, { fontSize: 12.5, lineHeight: 6, color: COLOR.navy });
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
    setText(doc, COLOR.gold);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(bullet, ML + indent, state.y);

    setText(doc, COLOR.text);
    doc.setFontSize(10);
    const startX = ML + indent + 5;
    const lineHeight = 5;

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
    const cellPad = 1.8;
    const lineH = 4.6;

    const renderRow = (cells: string[], isHeader: boolean) => {
        const lines = cells.map((cell) => doc.splitTextToSize(cell || '', colW - 2 * cellPad) as string[]);
        const rowH = Math.max(...lines.map(l => l.length)) * lineH + cellPad * 2;
        ensureSpace(state, rowH);

        if (isHeader) {
            setFill(doc, COLOR.navy);
            doc.rect(ML, state.y - lineH + 1, CW, rowH, 'F');
        } else {
            setFill(doc, COLOR.slate50);
            // Alternance subtile : pas necessaire ici
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
        setText(doc, isHeader ? '#ffffff' : COLOR.slate600);

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
    const startY = state.y;
    state.y += 4;

    for (const t of tokens) {
        if (t.type === 'paragraph') {
            const chunks = flattenInline((t as Tokens.Paragraph).tokens);
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
    setDraw(doc, COLOR.gold);
    doc.setLineWidth(1);
    doc.line(ML + 2, startY + 1, ML + 2, state.y - 1);
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
                const chunks = flattenInline(
                    item.tokens
                        .filter((t) => t.type === 'text' || t.type === 'paragraph')
                        .flatMap((t) => {
                            if (t.type === 'paragraph') return (t as Tokens.Paragraph).tokens || [];
                            return (t as Tokens.Text).tokens || [{ type: 'text', text: (t as Tokens.Text).text } as Token];
                        })
                );
                renderListItem(state, chunks, list.ordered, i, listDepth);
                const nested = item.tokens.filter((t) => t.type === 'list') as Tokens.List[];
                for (const n of nested) {
                    renderTokens(state, [n], listDepth + 1);
                }
            }
            state.y += 2;
        } else if (tok.type === 'table') {
            const t = tok as Tokens.Table;
            const header = t.header.map((h) => h.text);
            const rows = t.rows.map((r) => r.map((cell) => cell.text));
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

// === Cover page ===

function renderCoverPage(state: RenderState, data: VeilleReportInput) {
    const { doc } = state;
    const isFr = data.lang === 'fr';

    // Bandeau navy haut
    setFill(doc, COLOR.navy);
    doc.rect(0, 0, PAGE_W, 60, 'F');

    // Logo AEGIS
    setFill(doc, COLOR.gold);
    doc.rect(ML, 22, 10, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    setText(doc, COLOR.navy);
    doc.text('AE', ML + 5, 29, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    setText(doc, '#ffffff');
    doc.text('AEGIS Intelligence', ML + 14, 29);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    setText(doc, COLOR.gold);
    doc.text(isFr ? 'Veille Reglementaire EU' : 'EU Regulatory Watch', ML + 14, 35);

    // Centered title block
    let cy = 100;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(34);
    setText(doc, COLOR.navy);
    doc.text(isFr ? 'VEILLE' : 'WATCH', PAGE_W / 2, cy, { align: 'center' });
    cy += 14;
    doc.setFontSize(16);
    setText(doc, COLOR.slate600);
    doc.text(isFr ? 'Rapport mensuel des 5 piliers' : 'Monthly report of the 5 pillars', PAGE_W / 2, cy, { align: 'center' });

    cy += 22;
    setDraw(doc, COLOR.gold);
    doc.setLineWidth(1.2);
    doc.line(PAGE_W / 2 - 25, cy, PAGE_W / 2 + 25, cy);

    // Edition + month
    cy += 22;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    setText(doc, COLOR.slate400);
    doc.text(isFr ? 'EDITION' : 'EDITION', PAGE_W / 2, cy, { align: 'center' });
    cy += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    setText(doc, COLOR.navy);
    doc.text(data.edition, PAGE_W / 2, cy, { align: 'center' });

    if (data.month_label) {
        cy += 9;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(13);
        setText(doc, COLOR.gold);
        doc.text(data.month_label, PAGE_W / 2, cy, { align: 'center' });
    }

    // Date generation
    cy += 18;
    const dateStr = new Date().toLocaleDateString(isFr ? 'fr-FR' : 'en-GB', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    setText(doc, COLOR.slate500);
    doc.text(`${isFr ? 'Genere le' : 'Generated on'} ${dateStr}`, PAGE_W / 2, cy, { align: 'center' });

    // 5 piliers visuel
    cy = 195;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setText(doc, COLOR.slate400);
    doc.text(isFr ? 'COUVERTURE' : 'COVERAGE', PAGE_W / 2, cy, { align: 'center' });
    cy += 8;

    const pillars = [
        'AI Act',
        'CRA',
        'Machinery Reg.',
        'ESPR / DPP',
        'Battery Reg.',
    ];
    const pillarW = 32;
    const totalW = pillarW * pillars.length;
    let px = (PAGE_W - totalW) / 2;
    for (const p of pillars) {
        setFill(doc, COLOR.slate50);
        setDraw(doc, COLOR.gold);
        doc.setLineWidth(0.4);
        doc.roundedRect(px, cy, pillarW - 2, 14, 2, 2, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        setText(doc, COLOR.navy);
        doc.text(p, px + (pillarW - 2) / 2, cy + 9, { align: 'center' });
        px += pillarW;
    }

    // Footer cover
    const footY = PAGE_H - 28;
    setDraw(doc, COLOR.gold);
    doc.setLineWidth(0.5);
    doc.line(ML, footY, RIGHT, footY);

    setText(doc, COLOR.slate400);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`${SELLER.trade} | ${SELLER.web} | SIRET ${SELLER.siret}`, PAGE_W / 2, footY + 6, { align: 'center' });
    doc.text(
        isFr
            ? 'Document confidentiel -- Reserve aux abonnes VEILLE AEGIS Intelligence'
            : 'Confidential document -- For AEGIS Intelligence WATCH subscribers only',
        PAGE_W / 2, footY + 11, { align: 'center' }
    );
}

// === Public entry ===

export function renderVeilleReport(data: VeilleReportInput): VeilleReportOutput {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    const state: RenderState = {
        doc,
        y: MT,
        pageNum: 1,
        edition: data.edition,
        lang: data.lang,
    };

    // Cover page (no footer call : couverture a son propre footer)
    renderCoverPage(state, data);

    // Body
    doc.addPage();
    state.pageNum = 2;
    state.y = MT;

    const tokens = marked.lexer(data.markdown);
    renderTokens(state, tokens);
    drawFooter(state);

    // Output
    const arrayBuffer = doc.output('arraybuffer') as ArrayBuffer;
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const editionSafe = data.edition.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60);
    const filename = `AEGIS-VEILLE-${editionSafe}-${data.lang}.pdf`;

    return {
        pdfBuffer: buffer,
        pdfBase64: base64,
        pdfFilename: filename,
        pdfSize: buffer.byteLength,
    };
}
