import type { MailerPaymentData } from './mailer';

/**
 * AEGIS Intelligence -- Email HTML Templates (FR/EN)
 * Functions TypeScript retournant du HTML string.
 * Pas de fichiers HTML externes = pas de file I/O serverless.
 *
 * SELLER constants = memes valeurs que MerciPage.tsx (DRY cross-module).
 *
 * Version : 1.1.0 -- 20260418 -- NIGHT-N5 DETTE18 (bloc piece jointe vs bouton lien)
 */

// --- Shared constants (mirror MerciPage.tsx SELLER) ---
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

// --- Brand colors ---
const BRAND = {
    blue: '#3b82f6',
    blueDark: '#1d4ed8',
    emerald: '#10b981',
    text: '#0f172a',
    textMuted: '#64748b',
    textLight: '#94a3b8',
    bg: '#ffffff',
    bgAlt: '#f8fafc',
    border: '#e2e8f0',
};

// --- Helpers ---
function generateInvoiceNumber(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const h = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `AEGIS-${y}${m}${d}-${h}${min}`;
}

function formatDate(lang: 'fr' | 'en'): string {
    return new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function emailWrapper(content: string): string {
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0;padding:0;background:${BRAND.bgAlt};font-family:'Segoe UI',system-ui,-apple-system,sans-serif;color:${BRAND.text};line-height:1.6}
.container{max-width:600px;margin:0 auto;background:${BRAND.bg}}
.header{background:linear-gradient(135deg,${BRAND.blue},${BRAND.blueDark});padding:32px 24px;text-align:center}
.header h1{margin:0;color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.02em}
.header p{margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px}
.body{padding:32px 24px}
.footer{padding:20px 24px;background:${BRAND.bgAlt};border-top:1px solid ${BRAND.border};text-align:center;font-size:11px;color:${BRAND.textLight}}
.btn{display:inline-block;padding:14px 32px;background:linear-gradient(135deg,${BRAND.blue},${BRAND.blueDark});color:#fff !important;text-decoration:none;border-radius:24px;font-weight:700;font-size:14px}
table.invoice{width:100%;border-collapse:collapse;margin:20px 0}
table.invoice th{text-align:left;padding:10px 12px;font-size:10px;font-weight:700;text-transform:uppercase;color:${BRAND.textMuted};background:${BRAND.bgAlt};border-bottom:2px solid ${BRAND.border}}
table.invoice td{padding:12px;font-size:13px;border-bottom:1px solid ${BRAND.border}}
.label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:${BRAND.textLight};margin-bottom:6px}
.success-badge{display:inline-block;padding:6px 16px;background:${BRAND.emerald}18;color:${BRAND.emerald};border-radius:20px;font-weight:700;font-size:13px}
</style></head><body>
<div class="container">${content}</div>
</body></html>`;
}

// --- Client confirmation email ---
export function clientConfirmationHtml(data: MailerPaymentData, lang: 'fr' | 'en'): string {
    const isFr = lang === 'fr';
    const invoiceNum = data.invoice_number || generateInvoiceNumber();
    const date = formatDate(lang);
    const reqShort = (data.request_id || 'N/A').slice(0, 8);
    const amount = data.amount || '250.00';
    const merciUrl = `https://jeanpierrecharles.com/merci?product=diagnostic&lang=${lang}&invoice=${encodeURIComponent(invoiceNum)}&ref=${encodeURIComponent(data.request_id || '')}`;

    const content = `
<div class="header">
    <h1>AEGIS Intelligence</h1>
    <p>${isFr ? 'Diagnostic de Conformité Industrielle EU' : 'EU Industrial Compliance Diagnostic'}</p>
</div>
<div class="body">
    <div style="text-align:center;margin-bottom:28px">
        <div class="success-badge">${isFr ? 'Paiement confirmé' : 'Payment confirmed'}</div>
        <h2 style="margin:16px 0 8px;font-size:20px;color:${BRAND.text}">${isFr ? 'Merci pour votre commande !' : 'Thank you for your order!'}</h2>
        <p style="margin:0;color:${BRAND.textMuted};font-size:14px">${isFr
            ? 'Votre diagnostic AEGIS est en cours de préparation.'
            : 'Your AEGIS diagnostic is being prepared.'}</p>
    </div>

    <table class="invoice">
        <thead><tr>
            <th>Description</th>
            <th style="text-align:right">${isFr ? 'Montant' : 'Amount'}</th>
        </tr></thead>
        <tbody>
            <tr>
                <td>
                    <strong>${isFr ? 'Diagnostic Technique de Conformité Industrielle EU' : 'EU Industrial Compliance Technical Diagnostic'}</strong><br>
                    <span style="font-size:11px;color:${BRAND.textMuted}">${isFr
                        ? 'Analyse multi-niveaux, graphe causal, feuille de route, rapport PDF premium'
                        : 'Multi-level analysis, causal graph, roadmap, premium PDF report'}</span>
                </td>
                <td style="text-align:right;font-weight:700;font-size:16px;white-space:nowrap">${amount} EUR</td>
            </tr>
        </tbody>
    </table>

    <div style="display:flex;justify-content:flex-end;margin-bottom:24px">
        <div style="width:220px">
            <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:12px;color:${BRAND.textMuted};border-bottom:1px solid ${BRAND.border}">
                <span>${isFr ? 'Sous-total HT' : 'Subtotal excl. VAT'}</span><span>${amount} EUR</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:11px;color:${BRAND.textLight};border-bottom:1px solid ${BRAND.border}">
                <span>TVA</span><span>0,00 EUR</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:10px 0;font-size:16px;font-weight:800;color:${BRAND.text}">
                <span>TOTAL</span><span>${amount} EUR</span>
            </div>
        </div>
    </div>

    <div style="background:${BRAND.bgAlt};border-radius:12px;padding:16px;margin-bottom:24px;border:1px solid ${BRAND.border}">
        <div class="label">${isFr ? 'DÉTAILS COMMANDE' : 'ORDER DETAILS'}</div>
        <div style="font-size:12px;line-height:1.8">
            <strong>${isFr ? 'Référence' : 'Reference'}:</strong> REQ-${escapeHtml(reqShort)}<br>
            <strong>Date:</strong> ${date}<br>
            <strong>${isFr ? 'Livraison' : 'Delivery'}:</strong> ${isFr ? 'Jour ouvré du paiement (avant 19h CET)' : 'Same business day (before 19:00 CET)'}
        </div>
    </div>

    <div style="text-align:center;margin:32px 0">
        <a href="${merciUrl}" class="btn">${isFr ? 'Télécharger votre facture' : 'Download your invoice'}</a>
    </div>

    <div style="background:${BRAND.bgAlt};border-radius:12px;padding:16px;margin-bottom:16px;border:1px solid ${BRAND.border}">
        <div class="label">${isFr ? 'ÉMETTEUR' : 'FROM'}</div>
        <div style="font-size:11px;line-height:1.7">
            <strong>${SELLER.name}</strong><br>
            ${SELLER.trade}<br>
            SIRET : ${SELLER.siret} | APE : ${SELLER.ape}<br>
            ${SELLER.address}<br>
            ${SELLER.email}
        </div>
        <div style="margin-top:8px;font-size:10px;color:${BRAND.textLight}">${SELLER.tva}</div>
    </div>

    <div style="text-align:center;margin-top:24px">
        <p style="font-size:13px;color:${BRAND.textMuted}">
            ${isFr ? 'Une question ?' : 'Any questions?'}
            <a href="mailto:${SELLER.email}" style="color:${BRAND.blue};font-weight:600">${SELLER.email}</a>
        </p>
    </div>
</div>
<div class="footer">
    AEGIS Intelligence | ${SELLER.web} | SIRET ${SELLER.siret}<br>
    ${SELLER.forme} | ${SELLER.tva}
</div>`;

    return emailWrapper(content);
}

// --- Ops new order email ---
export function opsNewOrderHtml(data: MailerPaymentData): string {
    const reqFull = data.request_id || 'N/A';
    const reqShort = reqFull.slice(0, 8);
    const date = new Date().toISOString();

    const content = `
<div class="header">
    <h1>[AEGIS] Nouvelle Commande</h1>
    <p>DIAGNOSTIC #REQ-${escapeHtml(reqShort)}</p>
</div>
<div class="body">
    <div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:12px 16px;margin-bottom:24px">
        <strong style="color:#92400e">Action requise :</strong>
        <span style="color:#92400e"> Produire le rapport DIAGNOSTIC sous 24h ouvrées.</span>
    </div>

    <div style="margin-bottom:24px">
        <div class="label">CLIENT</div>
        <table style="width:100%;font-size:13px;line-height:1.8">
            <tr><td style="width:140px;color:${BRAND.textMuted};font-weight:600">Nom</td><td>${escapeHtml(data.customer_name || 'Non fourni')}</td></tr>
            <tr><td style="color:${BRAND.textMuted};font-weight:600">Email</td><td>${escapeHtml(data.email || 'Non fourni')}</td></tr>
            <tr><td style="color:${BRAND.textMuted};font-weight:600">Entreprise</td><td>${escapeHtml(data.customer_company || 'Non fourni')}</td></tr>
            <tr><td style="color:${BRAND.textMuted};font-weight:600">Secteur</td><td>${escapeHtml(data.sector || 'Non fourni')}</td></tr>
        </table>
    </div>

    <div style="margin-bottom:24px">
        <div class="label">PRODUIT / CONTEXTE</div>
        <div style="background:${BRAND.bgAlt};border-radius:8px;padding:12px 16px;font-size:13px;border:1px solid ${BRAND.border}">
            ${escapeHtml(data.product || 'Non fourni')}
        </div>
    </div>

    ${data.regulations && data.regulations.length > 0 ? `
    <div style="margin-bottom:24px">
        <div class="label">RÉGLEMENTATIONS</div>
        <div style="font-size:13px">${data.regulations.map(r => `<span style="display:inline-block;padding:4px 10px;margin:2px 4px 2px 0;background:${BRAND.blue}15;color:${BRAND.blue};border-radius:12px;font-size:11px;font-weight:600">${escapeHtml(r)}</span>`).join('')}</div>
    </div>` : ''}

    ${data.context ? `
    <div style="margin-bottom:24px">
        <div class="label">CONTEXTE ADDITIONNEL</div>
        <div style="background:${BRAND.bgAlt};border-radius:8px;padding:12px 16px;font-size:12px;border:1px solid ${BRAND.border};color:${BRAND.textMuted}">
            ${escapeHtml(data.context)}
        </div>
    </div>` : ''}

    <div style="margin-bottom:16px">
        <div class="label">PAIEMENT</div>
        <table style="width:100%;font-size:13px;line-height:1.8">
            <tr><td style="width:140px;color:${BRAND.textMuted};font-weight:600">Payment ID</td><td><code>${escapeHtml(data.payment_id)}</code></td></tr>
            <tr><td style="color:${BRAND.textMuted};font-weight:600">Request ID</td><td><code>${escapeHtml(reqFull)}</code></td></tr>
            <tr><td style="color:${BRAND.textMuted};font-weight:600">Montant</td><td><strong>${data.amount || '250.00'} EUR</strong></td></tr>
            <tr><td style="color:${BRAND.textMuted};font-weight:600">Mode</td><td>${escapeHtml(data.mode || 'N/A')}</td></tr>
            <tr><td style="color:${BRAND.textMuted};font-weight:600">Timestamp</td><td>${date}</td></tr>
        </table>
    </div>
</div>
<div class="footer">
    Email automatique AEGIS Intelligence Pipeline v3.4.5
</div>`;

    return emailWrapper(content);
}

// --- Delivery confirmation email ---
export function deliveryConfirmationHtml(data: MailerPaymentData, lang: 'fr' | 'en'): string {
    const isFr = lang === 'fr';
    const invoiceNum = data.invoice_number || generateInvoiceNumber();
    const date = formatDate(lang);
    const hasAttachment = Boolean(data.pdf_base64);
    const downloadUrl = data.download_url || '';

    const deliveryBlock = hasAttachment
        ? `
    <div style="background:${BRAND.emerald}10;border:1px solid ${BRAND.emerald}40;border-radius:12px;padding:18px 20px;margin:28px 0;text-align:center">
        <div style="font-size:13px;color:${BRAND.text};line-height:1.6">
            <strong style="color:${BRAND.emerald}">${isFr ? 'Pièce jointe PDF' : 'PDF attachment'}</strong><br>
            ${isFr
                ? 'Votre rapport DIAGNOSTIC est joint à cet email en pièce jointe (PDF).'
                : 'Your DIAGNOSTIC report is attached to this email (PDF).'}
        </div>
    </div>

    <div style="text-align:center;margin-bottom:24px">
        <p style="font-size:12px;color:${BRAND.textMuted}">${isFr
            ? 'Conservez cet email, votre rapport y est attaché durablement.'
            : 'Keep this email — your report is permanently attached.'}</p>
    </div>`
        : `
    <div style="text-align:center;margin:32px 0">
        <a href="${downloadUrl || '#'}" class="btn">${isFr ? 'Télécharger votre rapport' : 'Download your report'}</a>
    </div>

    <div style="text-align:center;margin-bottom:24px">
        <p style="font-size:12px;color:${BRAND.textMuted}">${isFr
            ? 'Ce lien est valable 30 jours. Contactez-nous pour toute question.'
            : 'This link is valid for 30 days. Contact us with any questions.'}</p>
    </div>`;

    const content = `
<div class="header">
    <h1>AEGIS Intelligence</h1>
    <p>${isFr ? 'Diagnostic de Conformité Industrielle EU' : 'EU Industrial Compliance Diagnostic'}</p>
</div>
<div class="body">
    <div style="text-align:center;margin-bottom:28px">
        <div class="success-badge">${isFr ? 'Rapport livré' : 'Report delivered'}</div>
        <h2 style="margin:16px 0 8px;font-size:20px;color:${BRAND.text}">${isFr
            ? 'Votre rapport DIAGNOSTIC est prêt !'
            : 'Your DIAGNOSTIC report is ready!'}</h2>
        <p style="margin:0;color:${BRAND.textMuted};font-size:14px">${isFr
            ? (hasAttachment
                ? 'Votre analyse de conformité industrielle EU est jointe à cet email.'
                : 'Votre analyse de conformité industrielle EU est disponible au téléchargement.')
            : (hasAttachment
                ? 'Your EU industrial compliance analysis is attached to this email.'
                : 'Your EU industrial compliance analysis is available for download.')}</p>
    </div>

    <div style="background:${BRAND.bgAlt};border-radius:12px;padding:16px;margin-bottom:24px;border:1px solid ${BRAND.border}">
        <div class="label">${isFr ? 'RAPPEL COMMANDE' : 'ORDER SUMMARY'}</div>
        <div style="font-size:12px;line-height:1.8">
            <strong>${isFr ? 'Facture' : 'Invoice'}:</strong> ${escapeHtml(invoiceNum)}<br>
            <strong>Date:</strong> ${date}<br>
            ${data.customer_company ? `<strong>${isFr ? 'Entreprise' : 'Company'}:</strong> ${escapeHtml(data.customer_company)}<br>` : ''}
            ${data.customer_name ? `<strong>${isFr ? 'Client' : 'Customer'}:</strong> ${escapeHtml(data.customer_name)}<br>` : ''}
        </div>
    </div>
${deliveryBlock}

    ${data.approved_by ? `
    <div style="background:${BRAND.bgAlt};border-radius:8px;padding:14px 18px;margin-bottom:20px;border-left:3px solid ${BRAND.emerald}">
        <div class="label">${isFr ? 'SIGNATURE NUMÉRIQUE' : 'DIGITAL SIGNATURE'}</div>
        <div style="font-size:12px;line-height:1.7;margin-top:6px">
            <strong>${isFr ? 'Approuvé par' : 'Approved by'}</strong> : ${escapeHtml(data.approved_by)}<br>
            <strong>${isFr ? 'Horodatage' : 'Timestamp'}</strong> : ${escapeHtml(data.approved_at || '')}
            ${data.pdf_sha256 ? `<br><strong>${isFr ? 'Empreinte PDF (SHA-256)' : 'PDF fingerprint (SHA-256)'}</strong> : <code style="font-size:10px;word-break:break-all;font-family:Consolas,'Courier New',monospace">${escapeHtml(data.pdf_sha256)}</code>` : ''}
            ${data.signature_note ? `<br><strong>${isFr ? 'Note' : 'Note'}</strong> : ${escapeHtml(data.signature_note)}` : ''}
        </div>
        <div style="font-size:10px;color:${BRAND.textLight};margin-top:8px;font-style:italic">
            ${isFr
                ? 'Signature électronique simple eIDAS Article 25. L\'empreinte SHA-256 permet de vérifier l\'intégrité du rapport reçu.'
                : 'Simple electronic signature eIDAS Article 25. The SHA-256 fingerprint enables verification of the received report integrity.'}
        </div>
    </div>` : ''}

    <div style="background:${BRAND.bgAlt};border-radius:12px;padding:16px;margin-bottom:16px;border:1px solid ${BRAND.border}">
        <div class="label">${isFr ? 'ÉMETTEUR' : 'FROM'}</div>
        <div style="font-size:11px;line-height:1.7">
            <strong>${SELLER.name}</strong><br>
            ${SELLER.trade}<br>
            SIRET : ${SELLER.siret} | APE : ${SELLER.ape}<br>
            ${SELLER.address}<br>
            ${SELLER.email}
        </div>
        <div style="margin-top:8px;font-size:10px;color:${BRAND.textLight}">${SELLER.tva}</div>
    </div>

    <div style="text-align:center;margin-top:24px">
        <p style="font-size:13px;color:${BRAND.textMuted}">
            ${isFr ? 'Une question ?' : 'Any questions?'}
            <a href="mailto:${SELLER.email}" style="color:${BRAND.blue};font-weight:600">${SELLER.email}</a>
        </p>
    </div>
</div>
<div class="footer">
    AEGIS Intelligence | ${SELLER.web} | SIRET ${SELLER.siret}<br>
    ${SELLER.forme} | ${SELLER.tva}
</div>`;

    return emailWrapper(content);
}

// --- Ops pre-notify email ---
export function opsPreNotifyHtml(data: MailerPaymentData): string {
    const content = `
<div class="header" style="background:linear-gradient(135deg,${BRAND.textMuted},${BRAND.text})">
    <h1>[AEGIS] Tentative Checkout</h1>
    <p>${escapeHtml(data.customer_company || data.sector || 'Client')}</p>
</div>
<div class="body">
    <p style="font-size:14px;color:${BRAND.textMuted}">
        Un utilisateur vient de soumettre le formulaire pré-checkout DIAGNOSTIC.
        Si le paiement aboutit, un email de commande suivra.
    </p>

    <table style="width:100%;font-size:13px;line-height:1.8">
        <tr><td style="width:140px;color:${BRAND.textMuted};font-weight:600">Request ID</td><td><code>${escapeHtml(data.request_id || 'N/A')}</code></td></tr>
        <tr><td style="color:${BRAND.textMuted};font-weight:600">Email</td><td>${escapeHtml(data.email || 'Non fourni')}</td></tr>
        <tr><td style="color:${BRAND.textMuted};font-weight:600">Entreprise</td><td>${escapeHtml(data.customer_company || 'Non fourni')}</td></tr>
        <tr><td style="color:${BRAND.textMuted};font-weight:600">Secteur</td><td>${escapeHtml(data.sector || 'Non fourni')}</td></tr>
        <tr><td style="color:${BRAND.textMuted};font-weight:600">Produit</td><td>${escapeHtml((data.product || '').slice(0, 200))}${(data.product || '').length > 200 ? '...' : ''}</td></tr>
    </table>
</div>
<div class="footer">
    Email automatique AEGIS Intelligence Pipeline v3.4.5 | Pre-notification checkout
</div>`;

    return emailWrapper(content);
}
