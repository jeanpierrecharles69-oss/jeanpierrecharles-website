import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import jsPDF from 'jspdf';
import { useLang } from '../homepage/LangContext';
import { C } from '../homepage/constants';

// AEGIS Invoice Generator — EI Art. 293 B CGI
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

const generateInvoiceNumber = (): string => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const h = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `AEGIS-${y}${m}${d}-${h}${min}`;
};

const content = {
    fr: {
        title: 'Merci pour votre commande',
        subtitle: 'Votre diagnostic AEGIS est en cours de pr\u00e9paration.',
        steps: [
            { icon: '\u2705', text: 'Paiement re\u00e7u \u2014 confirmation envoy\u00e9e par e-mail' },
            { icon: '\ud83d\udcdd', text: 'Votre facture est disponible ci-dessous' },
            { icon: '\ud83d\udd0d', text: 'Jean-Pierre analyse votre produit et vos r\u00e8glements applicables' },
            { icon: '\ud83d\udcc4', text: 'Rapport PDF premium livr\u00e9 le jour ouvr\u00e9 du paiement (avant 19h CET)' },
        ],
        invoiceBtn: 'T\u00e9l\u00e9charger ma facture PDF',
        invoiceBtnLoading: 'G\u00e9n\u00e9ration en cours...',
        contact: 'Une question ? Contactez-nous \u00e0',
        back: '\u2190 Retour \u00e0 l\'accueil',
        metaTitle: 'Merci \u2014 AEGIS Intelligence',
    },
    en: {
        title: 'Thank you for your order',
        subtitle: 'Your AEGIS diagnostic is being prepared.',
        steps: [
            { icon: '\u2705', text: 'Payment received \u2014 confirmation sent by email' },
            { icon: '\ud83d\udcdd', text: 'Your invoice is available below' },
            { icon: '\ud83d\udd0d', text: 'Jean-Pierre analyses your product and applicable regulations' },
            { icon: '\ud83d\udcc4', text: 'Premium PDF report delivered same business day (before 19:00 CET)' },
        ],
        invoiceBtn: 'Download my invoice PDF',
        invoiceBtnLoading: 'Generating...',
        contact: 'Any questions? Contact us at',
        back: '\u2190 Back to home',
        metaTitle: 'Thank you \u2014 AEGIS Intelligence',
    },
};

export default function MerciPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { lang, setLang } = useLang();
    const [isGenerating, setIsGenerating] = useState(false);

    // CHANGE-07 : fallback invoice number from URL param (email link support)
    const urlInvoice = searchParams.get('invoice');
    const urlRef = searchParams.get('ref');
    const [invoiceNumber] = useState(() => {
        if (urlInvoice) return urlInvoice;
        try {
            const raw = sessionStorage.getItem('aegis_diag_request');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed?.invoice_number) return parsed.invoice_number;
            }
        } catch { /* sessionStorage unavailable */ }
        return generateInvoiceNumber();
    });

    const pageLang = (searchParams.get('lang') as 'fr' | 'en') || lang || 'fr';

    // V350 : lang sync handled by LangSync (App.tsx) — query param aware since V351 fix

    const t = content[pageLang] || content.fr;

    const getDiagData = () => {
        try {
            const raw = sessionStorage.getItem('aegis_diag_request');
            if (raw) return JSON.parse(raw);
        } catch { /* ignore parse errors */ }
        // Fallback : minimal data from URL params (CHANGE-07, email link support)
        if (urlRef) return { ref: urlRef };
        return null;
    };

    // V350 FIX P0 (D_T1700_01) : refonte jsPDF natif vectoriel.
    // Anciennement html2pdf.js + html2canvas scale=2 → CPU 100% main thread → freeze multi-tab Chrome (AMDEC C=900).
    // jsPDF natif = ~50-200ms render, texte vectoriel sélectionnable, bundle -450KB. Pas de rasterisation HTML.
    const handleDownloadInvoice = () => {
        if (isGenerating) return;
        setIsGenerating(true);
        try {
            const diag = getDiagData();
            const dateStr = new Date().toLocaleDateString(pageLang === 'fr' ? 'fr-FR' : 'en-GB', {
                year: 'numeric', month: 'long', day: 'numeric',
            });
            const dateISO = new Date().toISOString().split('T')[0];
            const isFr = pageLang === 'fr';

            const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

            // Hex → RGB tuple (jsPDF setTextColor/setDrawColor/setFillColor accept r,g,b numbers)
            const rgb = (h: string): [number, number, number] => {
                const c = h.replace('#', '');
                return [
                    parseInt(c.slice(0, 2), 16),
                    parseInt(c.slice(2, 4), 16),
                    parseInt(c.slice(4, 6), 16),
                ];
            };
            const setText = (h: string) => { const c = rgb(h); doc.setTextColor(c[0], c[1], c[2]); };
            const setDraw = (h: string) => { const c = rgb(h); doc.setDrawColor(c[0], c[1], c[2]); };
            const setFill = (h: string) => { const c = rgb(h); doc.setFillColor(c[0], c[1], c[2]); };

            // Layout : A4 portrait 210x297mm, marges 12mm latérales / 10mm haut-bas (brief §3.2)
            const PAGE_W = 210;
            const ML = 12;
            const MR = 12;
            const MT = 10;
            const RIGHT = PAGE_W - MR;
            const CW = PAGE_W - ML - MR; // content width = 186mm

            // === HEADER ===
            let y = MT + 8;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(20);
            setText(C.accent);
            doc.text('AEGIS Intelligence', ML, y);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            setText('#64748b'); // slate-500
            doc.text(`${SELLER.forme} | SIREN ${SELLER.siren}`, ML, y + 4.5);

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            setText(C.text);
            doc.text(isFr ? 'FACTURE' : 'INVOICE', RIGHT, y, { align: 'right' });

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            setText('#64748b');
            doc.text(invoiceNumber, RIGHT, y + 4.5, { align: 'right' });
            doc.text(dateStr, RIGHT, y + 9, { align: 'right' });

            // Accent line
            y += 14;
            setDraw(C.accent);
            doc.setLineWidth(0.6);
            doc.line(ML, y, RIGHT, y);
            y += 9;

            // === FROM / CUSTOMER blocks ===
            const colW = (CW - 8) / 2;
            const col2X = ML + colW + 8;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7);
            setText('#94a3b8'); // slate-400
            doc.text(isFr ? 'EMETTEUR' : 'FROM', ML, y);
            doc.text(isFr ? 'CLIENT' : 'CUSTOMER', col2X, y);

            // FROM block
            let fy = y + 5;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            setText(C.text);
            doc.text(SELLER.name, ML, fy);
            fy += 4.5;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            setText('#475569'); // slate-600
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

            // CUSTOMER block
            let cy = y + 5;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            setText('#475569');
            const custLines: string[] = [];
            if (diag?.sector) custLines.push(`${isFr ? 'Secteur' : 'Sector'} : ${diag.sector}`);
            if (diag?.product) custLines.push(`${isFr ? 'Produit' : 'Product'} : ${diag.product}`);
            if (diag?.regs?.length) custLines.push(`${isFr ? 'Règlements' : 'Regulations'} : ${diag.regs.join(', ')}`);
            if (diag?.context) custLines.push(`${isFr ? 'Contexte' : 'Context'} : ${diag.context}`);
            if (custLines.length === 0) {
                custLines.push(isFr ? 'Diagnostic Technique de Conformité' : 'Technical Compliance Diagnostic');
            }
            for (const line of custLines) {
                const wrapped = doc.splitTextToSize(line, colW) as string[];
                doc.text(wrapped, col2X, cy);
                cy += 4.2 * wrapped.length;
            }

            y = Math.max(fy, cy) + 6;

            // === TABLE ===
            const tableHdrH = 7;
            setFill('#f8fafc'); // slate-50
            doc.rect(ML, y, CW, tableHdrH, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            setText('#64748b');
            doc.text('DESCRIPTION', ML + 3, y + 4.7);
            doc.text(isFr ? 'MONTANT' : 'AMOUNT', RIGHT - 3, y + 4.7, { align: 'right' });
            y += tableHdrH;

            setDraw('#e2e8f0'); // slate-200
            doc.setLineWidth(0.3);
            doc.line(ML, y, RIGHT, y);

            // Row content
            y += 5;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            setText(C.text);
            doc.text(
                isFr
                    ? 'Diagnostic Technique de Conformité Industrielle EU'
                    : 'EU Industrial Compliance Technical Diagnostic',
                ML + 3, y
            );
            doc.setFontSize(13);
            doc.text('250,00 EUR', RIGHT - 3, y, { align: 'right' });

            y += 5;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            setText('#64748b');
            const rowDetail = isFr
                ? 'Analyse Pearl 3 niveaux, graphe causal, feuille de route Gantt, rapport PDF 40+ pages'
                : 'Pearl 3-level analysis, causal graph, Gantt roadmap, 40+ page PDF report';
            const rowDetailWrapped = doc.splitTextToSize(rowDetail, CW - 60) as string[];
            doc.text(rowDetailWrapped, ML + 3, y);
            y += 4 * rowDetailWrapped.length + 3;

            doc.line(ML, y, RIGHT, y);
            y += 8;

            // === TOTALS (right aligned) ===
            const totLabelX = RIGHT - 65;
            const totValueX = RIGHT;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            setText('#64748b');
            doc.text(isFr ? 'Sous-total HT' : 'Subtotal excl. VAT', totLabelX, y);
            doc.text('250,00 EUR', totValueX, y, { align: 'right' });
            y += 2;
            doc.line(totLabelX, y, totValueX, y);
            y += 4;

            doc.setFontSize(9);
            setText('#94a3b8');
            doc.text('TVA', totLabelX, y);
            doc.text('0,00 EUR', totValueX, y, { align: 'right' });
            y += 2;
            doc.line(totLabelX, y, totValueX, y);
            y += 5;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            setText(C.text);
            doc.text('TOTAL', totLabelX, y);
            doc.text('250,00 EUR', totValueX, y, { align: 'right' });

            y += 10;

            // === LEGAL BOX ===
            const legalH = 28;
            setFill('#f8fafc');
            setDraw('#e2e8f0');
            doc.setLineWidth(0.3);
            doc.roundedRect(ML, y, CW, legalH, 2, 2, 'FD');

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7);
            setText('#94a3b8');
            doc.text(isFr ? 'MENTIONS LÉGALES' : 'LEGAL NOTICES', ML + 4, y + 5);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            setText('#64748b');
            const legalLines = [
                SELLER.tva,
                isFr
                    ? 'Paiement effectué via Mollie (paiement sécurisé EU).'
                    : 'Payment processed via Mollie (secure EU payment).',
                isFr
                    ? 'Conditions : paiement comptant à la commande.'
                    : 'Terms: payment due upon order.',
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
            setDraw('#e2e8f0');
            doc.setLineWidth(0.3);
            doc.line(ML, y, RIGHT, y);
            y += 4.5;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            setText('#94a3b8');
            doc.text(
                `AEGIS Intelligence | ${SELLER.web} | ${SELLER.email} | SIRET ${SELLER.siret}`,
                PAGE_W / 2, y, { align: 'center' }
            );

            // === SAVE / DOWNLOAD ===
            const filename = `Facture_AEGIS_${invoiceNumber}_${dateISO}.pdf`;
            const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
            if (isMobile) {
                try {
                    const blob = doc.output('blob');
                    const blobUrl = URL.createObjectURL(blob);
                    window.open(blobUrl, '_blank');
                    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
                } catch {
                    doc.save(filename);
                }
            } else {
                doc.save(filename);
            }
        } catch (err) {
            console.error('Invoice generation error:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <>
            <Helmet>
                <title>{t.metaTitle}</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16" style={{ minHeight: '70vh' }}>
                {/* Success icon */}
                <div className="text-center mb-8">
                    <div style={{
                        width: 80, height: 80, borderRadius: '50%',
                        background: `${C.emerald}15`,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 36, marginBottom: 16,
                    }}>{'\ud83c\udf89'}</div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: C.text }}>
                        {t.title}
                    </h1>
                    <p className="text-sm mt-2" style={{ color: C.textMuted }}>{t.subtitle}</p>
                </div>

                {/* Steps */}
                <div className="rounded-2xl p-6 space-y-5" style={{
                    backgroundColor: C.surface, border: `1px solid ${C.border}`, boxShadow: C.shadowSoft,
                }}>
                    {t.steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-4">
                            <span className="text-xl flex-shrink-0 mt-0.5">{step.icon}</span>
                            <p className="text-sm font-medium" style={{ color: C.text }}>{step.text}</p>
                        </div>
                    ))}
                </div>

                {/* Invoice Download Button */}
                <div className="text-center mt-6" style={{
                    padding: 20, background: `${C.emerald}08`,
                    borderRadius: 16, border: `1px solid ${C.emerald}20`,
                }}>
                    <button
                        onClick={handleDownloadInvoice}
                        disabled={isGenerating}
                        style={{
                            background: isGenerating ? C.border : C.gradientBlue,
                            color: isGenerating ? C.textMuted : '#ffffff',
                            border: 'none',
                            cursor: isGenerating ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
                            padding: '12px 32px', borderRadius: 24,
                            opacity: isGenerating ? 0.6 : 1, transition: 'all 0.2s',
                        }}
                    >
                        {isGenerating ? t.invoiceBtnLoading : `\ud83d\udcc4 ${t.invoiceBtn}`}
                    </button>
                    <p className="text-xs mt-2" style={{ color: C.textMuted }}>
                        {pageLang === 'fr' ? `Facture n\u00b0 ${invoiceNumber}` : `Invoice # ${invoiceNumber}`}
                    </p>
                </div>

                {/* Contact + CTA */}
                <div className="text-center mt-8 space-y-4">
                    <p className="text-xs" style={{ color: C.textMuted }}>
                        {t.contact}{' '}
                        <a href="mailto:contact@jeanpierrecharles.com" style={{ color: C.accent, fontWeight: 600 }}>
                            contact@jeanpierrecharles.com
                        </a>
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm font-semibold px-6 py-2.5 rounded-full transition-all"
                        style={{
                            backgroundColor: `${C.accent}10`, color: C.accent,
                            border: `1px solid ${C.accent}25`, cursor: 'pointer', fontFamily: 'inherit',
                        }}
                    >
                        {t.back}
                    </button>
                </div>
            </main>
        </>
    );
}
