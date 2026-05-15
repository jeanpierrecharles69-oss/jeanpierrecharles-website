import { jsPDF } from 'jspdf';

/**
 * AEGIS Intelligence -- Server-side Invoice Generator (S1 Mission N11)
 *
 * P0 LEGAL Art. L441-10 : facture serveur-side (Supabase invoices) — la version
 * client MerciPage reste en place comme UX de telechargement immediat, mais
 * l'autorite legale est cote serveur (cette fabrique).
 *
 * Mirror visuel strict de MerciPage.tsx (~lines 130-440) : meme palette, meme
 * mise en page A4 12mm, meme blocs FROM/CUSTOMER/TABLE/TOTALS/LEGAL/FOOTER.
 *
 * Bilingue FR/EN, deux produits :
 *   - DIAGNOSTIC 250,00 EUR (one-shot)
 *   - VEILLE 150,00 EUR / mois (1er pct, abonnement)
 *
 * Version : 1.0.0 -- 20260508 -- creation S1
 */

// --- Mirror MerciPage SELLER (DRY-violation pragmatique : module serveur isole, pas d'import cross src/) ---
const SELLER = {
    name: 'Jean-Pierre CHARLES',
    trade: 'AEGIS Intelligence',
    siren: '522 794 700',
    siret: '522 794 700 00032',
    ape: '7112B - Ingénierie, études techniques',
    address: '10 La Bertinière, 86800 Tercé, FRANCE',
    email: 'contact@jeanpierrecharles.com',
    web: 'jeanpierrecharles.com',
    tva: 'TVA non applicable, article 293 B du Code général des impôts',
    forme: 'Entrepreneur individuel',
};

// Palette mirror C (homepage/constants.ts)
const COLOR = {
    accent: '#3b82f6',
    text: '#0f172a',
    slate400: '#94a3b8',
    slate500: '#64748b',
    slate600: '#475569',
    slate200: '#e2e8f0',
    slate50: '#f8fafc',
};

export interface InvoiceData {
    invoice_number: string;
    product: 'diagnostic' | 'veille';
    lang: 'fr' | 'en';
    amount: string;
    customer_name?: string;
    customer_company?: string;
    customer_email?: string;
    sector?: string;
    regulations?: string[];
    context?: string;
    issued_at?: Date;
}

export interface InvoiceOutput {
    buffer: Buffer;
    base64: string;
    filename: string;
    size: number;
}

function rgb(h: string): [number, number, number] {
    const c = h.replace('#', '');
    return [
        parseInt(c.slice(0, 2), 16),
        parseInt(c.slice(2, 4), 16),
        parseInt(c.slice(4, 6), 16),
    ];
}

function formatAmount(amount: string, lang: 'fr' | 'en'): string {
    const num = parseFloat(amount);
    if (Number.isNaN(num)) return `${amount} EUR`;
    const formatted = num.toFixed(2).replace('.', lang === 'fr' ? ',' : '.');
    return `${formatted} EUR`;
}

function formatDate(date: Date, lang: 'fr' | 'en'): string {
    return date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
}

export function generateInvoicePdf(data: InvoiceData): InvoiceOutput {
    const isFr = data.lang === 'fr';
    const isVeille = data.product === 'veille';
    const issuedAt = data.issued_at || new Date();
    const dateStr = formatDate(issuedAt, data.lang);
    const dateISO = issuedAt.toISOString().split('T')[0];
    const amountLabel = formatAmount(data.amount, data.lang);

    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    const setText = (h: string) => { const c = rgb(h); doc.setTextColor(c[0], c[1], c[2]); };
    const setDraw = (h: string) => { const c = rgb(h); doc.setDrawColor(c[0], c[1], c[2]); };
    const setFill = (h: string) => { const c = rgb(h); doc.setFillColor(c[0], c[1], c[2]); };

    // Layout A4 portrait 210x297mm, marges 12mm laterales / 10mm haut
    const PAGE_W = 210;
    const ML = 12;
    const MR = 12;
    const MT = 10;
    const RIGHT = PAGE_W - MR;
    const CW = PAGE_W - ML - MR;

    // === HEADER ===
    let y = MT + 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    setText(COLOR.accent);
    doc.text('AEGIS Intelligence', ML, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    setText(COLOR.slate500);
    doc.text(`${SELLER.forme} | SIREN ${SELLER.siren}`, ML, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    setText(COLOR.text);
    doc.text(isFr ? 'FACTURE' : 'INVOICE', RIGHT, y, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    setText(COLOR.slate500);
    doc.text(data.invoice_number, RIGHT, y + 4.5, { align: 'right' });
    doc.text(dateStr, RIGHT, y + 9, { align: 'right' });

    // Accent line
    y += 14;
    setDraw(COLOR.accent);
    doc.setLineWidth(0.6);
    doc.line(ML, y, RIGHT, y);
    y += 9;

    // === FROM / CUSTOMER ===
    const colW = (CW - 8) / 2;
    const col2X = ML + colW + 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    setText(COLOR.slate400);
    doc.text(isFr ? 'EMETTEUR' : 'FROM', ML, y);
    doc.text(isFr ? 'CLIENT' : 'CUSTOMER', col2X, y);

    // FROM block
    let fy = y + 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    setText(COLOR.text);
    doc.text(SELLER.name, ML, fy);
    fy += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    setText(COLOR.slate600);
    const fromLines = [
        SELLER.trade,
        `SIRET : ${SELLER.siret}`,
        `APE : ${SELLER.ape}`,
        SELLER.address,
        SELLER.email,
    ];
    for (const line of fromLines) {
        doc.text(line, ML, fy);
        fy += 4.2;
    }

    // CUSTOMER block (logique identique MerciPage)
    let cy = y + 5;
    const custLines: string[] = [];

    if (isVeille) {
        // VEILLE : nom + entreprise + email (format facture B2B standard)
        if (data.customer_name) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            setText(COLOR.text);
            doc.text(data.customer_name, col2X, cy);
            cy += 4.5;
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        setText(COLOR.slate600);
        if (data.customer_company) custLines.push(data.customer_company);
        if (data.customer_email) custLines.push(data.customer_email);
        if (custLines.length === 0 && !data.customer_name) {
            custLines.push(isFr ? 'Client veille AEGIS' : 'AEGIS Watch customer');
        }
    } else {
        // DIAGNOSTIC : scope diagnostic (secteur / produit / reglements / contexte)
        if (data.customer_name) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            setText(COLOR.text);
            doc.text(data.customer_name, col2X, cy);
            cy += 4.5;
        }
        if (data.customer_company) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            setText(COLOR.slate600);
            doc.text(data.customer_company, col2X, cy);
            cy += 4.2;
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        setText(COLOR.slate600);
        if (data.sector) custLines.push(`${isFr ? 'Secteur' : 'Sector'} : ${data.sector}`);
        if (data.regulations && data.regulations.length > 0) {
            custLines.push(`${isFr ? 'Règlements' : 'Regulations'} : ${data.regulations.join(', ')}`);
        }
        if (data.context) custLines.push(`${isFr ? 'Contexte' : 'Context'} : ${data.context}`);
        if (custLines.length === 0 && !data.customer_name && !data.customer_company) {
            custLines.push(isFr ? 'Diagnostic Technique de Conformité' : 'Technical Compliance Diagnostic');
        }
    }

    for (const line of custLines) {
        const wrapped = doc.splitTextToSize(line, colW) as string[];
        doc.text(wrapped, col2X, cy);
        cy += 4.2 * wrapped.length;
    }

    y = Math.max(fy, cy) + 6;

    // === TABLE ===
    const tableHdrH = 7;
    setFill(COLOR.slate50);
    doc.rect(ML, y, CW, tableHdrH, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    setText(COLOR.slate500);
    doc.text('DESCRIPTION', ML + 3, y + 4.7);
    doc.text(isFr ? 'MONTANT' : 'AMOUNT', RIGHT - 3, y + 4.7, { align: 'right' });
    y += tableHdrH;

    setDraw(COLOR.slate200);
    doc.setLineWidth(0.3);
    doc.line(ML, y, RIGHT, y);

    const rowTitle = isVeille
        ? (isFr ? 'Veille Réglementaire EU (1er mois)' : 'EU Regulatory Watch (1st month)')
        : (isFr ? 'Diagnostic Technique de Conformité Industrielle EU' : 'EU Industrial Compliance Technical Diagnostic');
    const rowDetailTxt = isVeille
        ? (isFr
            ? 'Monitoring expert 5+ règlements, alertes personnalisées, rapport mensuel'
            : 'Expert monitoring of 5+ regulations, personalised alerts, monthly report')
        : (isFr
            ? 'Diagnostic expert 5 piliers EU, cartographie risques, feuille de route, rapport PDF'
            : 'Expert 5-pillar EU diagnostic, risk mapping, roadmap, PDF report');

    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    setText(COLOR.text);
    doc.text(rowTitle, ML + 3, y);
    doc.setFontSize(13);
    doc.text(amountLabel, RIGHT - 3, y, { align: 'right' });

    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    setText(COLOR.slate500);
    const rowDetailWrapped = doc.splitTextToSize(rowDetailTxt, CW - 60) as string[];
    doc.text(rowDetailWrapped, ML + 3, y);
    y += 4 * rowDetailWrapped.length + 3;

    doc.line(ML, y, RIGHT, y);
    y += 8;

    // === TOTALS ===
    const totLabelX = RIGHT - 65;
    const totValueX = RIGHT;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    setText(COLOR.slate500);
    doc.text(isFr ? 'Sous-total HT' : 'Subtotal excl. VAT', totLabelX, y);
    doc.text(amountLabel, totValueX, y, { align: 'right' });
    y += 2;
    doc.line(totLabelX, y, totValueX, y);
    y += 4;

    doc.setFontSize(9);
    setText(COLOR.slate400);
    doc.text('TVA', totLabelX, y);
    doc.text(isFr ? '0,00 EUR' : '0.00 EUR', totValueX, y, { align: 'right' });
    y += 2;
    doc.line(totLabelX, y, totValueX, y);
    y += 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    setText(COLOR.text);
    doc.text('TOTAL', totLabelX, y);
    doc.text(amountLabel, totValueX, y, { align: 'right' });

    y += 10;

    // === LEGAL BOX ===
    const legalH = 28;
    setFill(COLOR.slate50);
    setDraw(COLOR.slate200);
    doc.setLineWidth(0.3);
    doc.roundedRect(ML, y, CW, legalH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    setText(COLOR.slate400);
    doc.text(isFr ? 'MENTIONS LÉGALES' : 'LEGAL NOTICES', ML + 4, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    setText(COLOR.slate500);
    const legalLines = [
        SELLER.tva,
        isFr
            ? 'Paiement effectué via Mollie (paiement sécurisé EU).'
            : 'Payment processed via Mollie (secure EU payment).',
        isVeille
            ? (isFr ? 'Conditions : abonnement mensuel renouvelable par prélèvement.' : 'Terms: renewable monthly subscription by direct debit.')
            : (isFr ? 'Conditions : paiement comptant à la commande.' : 'Terms: payment due upon order.'),
        isFr
            ? 'Pénalités de retard : 3x taux intérêt légal (Art. L.441-10 C. com.).'
            : 'Late penalty: 3x legal interest rate (Art. L.441-10 C. com.).',
    ];
    let ly = y + 10;
    for (const line of legalLines) {
        const wrapped = doc.splitTextToSize(line, CW - 8) as string[];
        doc.text(wrapped, ML + 4, ly);
        ly += 4 * wrapped.length;
    }

    y += legalH + 5;

    // === FOOTER ===
    setDraw(COLOR.slate200);
    doc.setLineWidth(0.3);
    doc.line(ML, y, RIGHT, y);
    y += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    setText(COLOR.slate400);
    doc.text(
        `AEGIS Intelligence | ${SELLER.web} | ${SELLER.email} | SIRET ${SELLER.siret}`,
        PAGE_W / 2, y, { align: 'center' }
    );

    // === OUTPUT ===
    // jsPDF server-side : output('arraybuffer') retourne ArrayBuffer compatible Node Buffer.from
    const arrayBuffer = doc.output('arraybuffer') as ArrayBuffer;
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const filename = `Facture_AEGIS_${data.invoice_number}_${dateISO}.pdf`;

    return {
        buffer,
        base64,
        filename,
        size: buffer.byteLength,
    };
}
