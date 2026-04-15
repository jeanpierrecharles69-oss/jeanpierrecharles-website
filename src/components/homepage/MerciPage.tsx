import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLang } from '../homepage/LangContext';
import { C } from '../homepage/constants';

// AEGIS Invoice Generator — EI Art. 293 B CGI
const SELLER = {
    name: 'Jean-Pierre CHARLES',
    trade: 'AEGIS Intelligence',
    siren: '522 794 700',
    siret: '522 794 700 00032',
    ape: '7112B - Ingenierie, etudes techniques',
    address: '10 La Bertiniere, 86800 Terce, FRANCE',
    email: 'contact@jeanpierrecharles.com',
    web: 'jeanpierrecharles.com',
    tva: 'TVA non applicable, article 293 B du Code general des impots',
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
            { icon: '\ud83d\udd0d', text: 'Jean-Pierre analyse votre produit et vos r\u00e9glements applicables' },
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
    const { lang } = useLang();
    const [isGenerating, setIsGenerating] = useState(false);
    const [invoiceNumber] = useState(() => generateInvoiceNumber());

    const pageLang = (searchParams.get('lang') as 'fr' | 'en') || lang || 'fr';
    const t = content[pageLang] || content.fr;

    const getDiagData = () => {
        try {
            const raw = sessionStorage.getItem('aegis_diag_request');
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    };

    const handleDownloadInvoice = async () => {
        if (isGenerating) return;
        setIsGenerating(true);
        try {
            const html2pdf = (await import('html2pdf.js')).default;
            const diag = getDiagData();
            const dateStr = new Date().toLocaleDateString(pageLang === 'fr' ? 'fr-FR' : 'en-GB', {
                year: 'numeric', month: 'long', day: 'numeric',
            });
            const dateISO = new Date().toISOString().split('T')[0];

            const isFr = pageLang === 'fr';
            const wrapper = document.createElement('div');
            wrapper.style.cssText = "font-family:'Inter','Segoe UI',system-ui,sans-serif;font-size:12px;color:#1e293b;max-width:700px";

            wrapper.innerHTML = [
                '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:16px;border-bottom:2px solid ' + C.accent + '">',
                '  <div>',
                '    <div style="font-size:20px;font-weight:800;color:' + C.accent + ';letter-spacing:-0.02em">AEGIS Intelligence</div>',
                '    <div style="font-size:9px;color:#64748b;margin-top:4px">' + SELLER.forme + ' | SIREN ' + SELLER.siren + '</div>',
                '  </div>',
                '  <div style="text-align:right">',
                '    <div style="font-size:16px;font-weight:700;color:' + C.text + '">' + (isFr ? 'FACTURE' : 'INVOICE') + '</div>',
                '    <div style="font-size:10px;color:#64748b;margin-top:2px">' + invoiceNumber + '</div>',
                '    <div style="font-size:10px;color:#64748b">' + dateStr + '</div>',
                '  </div>',
                '</div>',
                '<div style="display:flex;justify-content:space-between;margin-bottom:28px;gap:40px">',
                '  <div style="flex:1">',
                '    <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#94a3b8;margin-bottom:6px">' + (isFr ? 'EMETTEUR' : 'FROM') + '</div>',
                '    <div style="font-size:11px;line-height:1.6">',
                '      <strong>' + SELLER.name + '</strong><br>',
                '      ' + SELLER.trade + '<br>',
                '      SIRET : ' + SELLER.siret + '<br>',
                '      APE : ' + SELLER.ape + '<br>',
                '      ' + SELLER.address + '<br>',
                '      ' + SELLER.email,
                '    </div>',
                '  </div>',
                '  <div style="flex:1">',
                '    <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#94a3b8;margin-bottom:6px">' + (isFr ? 'CLIENT' : 'CUSTOMER') + '</div>',
                '    <div style="font-size:11px;line-height:1.6;color:#475569">',
                      (diag?.sector ? (isFr ? 'Secteur' : 'Sector') + ' : ' + diag.sector + '<br>' : ''),
                      (diag?.product ? (isFr ? 'Produit' : 'Product') + ' : ' + diag.product + '<br>' : ''),
                      (diag?.regs?.length ? (isFr ? 'Reglements' : 'Regulations') + ' : ' + diag.regs.join(', ') + '<br>' : ''),
                      (diag?.context ? (isFr ? 'Contexte' : 'Context') + ' : ' + diag.context : ''),
                '    </div>',
                '  </div>',
                '</div>',
                '<table style="width:100%;border-collapse:collapse;margin-bottom:24px">',
                '  <thead><tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0">',
                '    <th style="text-align:left;padding:10px 12px;font-size:10px;font-weight:700;text-transform:uppercase;color:#64748b">Description</th>',
                '    <th style="text-align:right;padding:10px 12px;font-size:10px;font-weight:700;text-transform:uppercase;color:#64748b">' + (isFr ? 'Montant' : 'Amount') + '</th>',
                '  </tr></thead>',
                '  <tbody><tr style="border-bottom:1px solid #e2e8f0">',
                '    <td style="padding:12px;font-size:12px">',
                '      <strong>' + (isFr ? 'Diagnostic Technique de Conformite Industrielle EU' : 'EU Industrial Compliance Technical Diagnostic') + '</strong><br>',
                '      <span style="font-size:10px;color:#64748b">' + (isFr
                    ? 'Analyse Pearl 3 niveaux, graphe causal, feuille de route Gantt, rapport PDF 40+ pages'
                    : 'Pearl 3-level analysis, causal graph, Gantt roadmap, 40+ page PDF report') + '</span>',
                '    </td>',
                '    <td style="padding:12px;font-size:14px;font-weight:700;text-align:right;white-space:nowrap">250,00 EUR</td>',
                '  </tr></tbody>',
                '</table>',
                '<div style="display:flex;justify-content:flex-end;margin-bottom:24px">',
                '  <div style="width:240px">',
                '    <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:11px;color:#64748b;border-bottom:1px solid #e2e8f0">',
                '      <span>' + (isFr ? 'Sous-total HT' : 'Subtotal excl. VAT') + '</span><span>250,00 EUR</span>',
                '    </div>',
                '    <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:10px;color:#94a3b8;border-bottom:1px solid #e2e8f0">',
                '      <span>TVA</span><span>0,00 EUR</span>',
                '    </div>',
                '    <div style="display:flex;justify-content:space-between;padding:10px 0;font-size:14px;font-weight:800;color:' + C.text + '">',
                '      <span>TOTAL</span><span>250,00 EUR</span>',
                '    </div>',
                '  </div>',
                '</div>',
                '<div style="background:#f8fafc;border-radius:8px;padding:14px 16px;margin-bottom:20px;border:1px solid #e2e8f0">',
                '  <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#94a3b8;margin-bottom:6px">' + (isFr ? 'MENTIONS LEGALES' : 'LEGAL NOTICES') + '</div>',
                '  <div style="font-size:9px;color:#64748b;line-height:1.6">',
                '    ' + SELLER.tva + '<br>',
                '    ' + (isFr ? 'Paiement effectue via Mollie (paiement securise EU).' : 'Payment processed via Mollie (secure EU payment).') + '<br>',
                '    ' + (isFr ? 'Conditions : paiement comptant a la commande.' : 'Terms: payment due upon order.') + '<br>',
                '    ' + (isFr ? 'Penalites de retard : 3x taux interet legal (Art. L.441-10 C. com.).' : 'Late penalty: 3x legal interest rate (Art. L.441-10 C. com.).'),
                '  </div>',
                '</div>',
                '<div style="text-align:center;font-size:9px;color:#94a3b8;padding-top:12px;border-top:1px solid #e2e8f0">',
                '  AEGIS Intelligence | ' + SELLER.web + ' | ' + SELLER.email + ' | SIRET ' + SELLER.siret,
                '</div>',
            ].join('\n');

            const filename = 'Facture_AEGIS_' + invoiceNumber + '_' + dateISO + '.pdf';
            const opt = {
                margin: [10, 12, 10, 12],
                filename,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
            };

            const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
            if (isMobile) {
                try {
                    const blob: Blob = await html2pdf().set(opt).from(wrapper).output('blob');
                    const blobUrl = URL.createObjectURL(blob);
                    window.open(blobUrl, '_blank');
                    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
                } catch {
                    html2pdf().set(opt).from(wrapper).save();
                }
            } else {
                html2pdf().set(opt).from(wrapper).save();
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
