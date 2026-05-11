import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import {
    clientConfirmationHtml,
    opsNewOrderHtml,
    opsPreNotifyHtml,
    deliveryConfirmationHtml,
    veilleMonthlyReportHtml,
} from './email-templates.js';

/**
 * AEGIS Intelligence -- Shared Mailer Module
 * SMTP Gandi (port 465 SSL) — singleton transport, 4 fonctions envoi.
 *
 * SECURITE C0 :
 *  - TLS/SSL obligatoire (port 465, secure: true)
 *  - Aucun credential en logs/code (env vars Vercel uniquement)
 *  - Emails tronques dans logs (j***@gmail.com)
 *  - Validation format email avant envoi
 *  - Isolation erreurs : chaque envoi isole, jamais de throw non capture
 *
 * IDEMPOTENCE C3 :
 *  - Set<string> in-memory par instance warm
 *  - DETTE7 : Vercel KV pour persistance cross-instance (v3.4.6)
 *
 * Version : 1.3.0 -- 20260424 -- Mission N8 D_T2010_10 patches B + C :
 *   - Patch B (anti-spam subject) : retrait crochets [AEGIS] des subjects CLIENT
 *     (sendDeliveryConfirmation, sendClientDiagnostic). Subjects ops inchanges.
 *     Rationale : Gmail / Outlook flag les subjects crochetes comme spam ;
 *     observation empirique smoke InnovateMat T2010 (rejet silencieux delivery).
 *   - Patch C (multipart plain-text fallback) : ajout propriete `text` a cote
 *     de `html` sur les sendMail pour ameliorer la deliverabilite (score SpamAssassin
 *     ameliore, prevention "HTML only" flags). Helper htmlToPlainText local,
 *     sans nouvelle dependance npm.
 * Version : 1.2.0 -- 20260422 -- PHASE-C sendClientDiagnostic (Living Spec v1.1 §7 + EA-05)
 */

const PDF_MAX_BYTES = 20 * 1024 * 1024;

// --- Environment ---
const SMTP_HOST = process.env.SMTP_HOST || 'mail.gandi.net';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
const SMTP_SECURE = process.env.SMTP_SECURE !== 'false'; // default true
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || '';
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME || 'AEGIS Intelligence';
const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL || 'contact@jeanpierrecharles.com';
const OPS_NOTIFY_EMAIL = process.env.OPS_NOTIFY_EMAIL || 'contact@jeanpierrecharles.com';

// --- Transport singleton ---
let transport: Transporter | null = null;

function getTransport(): Transporter {
    if (!transport) {
        transport = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: SMTP_SECURE,
            auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
            connectionTimeout: 3000,
            socketTimeout: 3000,
            greetingTimeout: 3000,
        });
    }
    return transport;
}

// --- Idempotence (C3) ---
const processedPayments = new Set<string>();

export function isAlreadyProcessed(paymentId: string): boolean {
    return processedPayments.has(paymentId);
}

export function markProcessed(paymentId: string): void {
    processedPayments.add(paymentId);
}

// --- Helpers ---
function maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!local || !domain) return '***';
    return `${local[0]}***@${domain}`;
}

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function logMailer(data: Record<string, unknown>): void {
    console.log(JSON.stringify(data));
}

/**
 * Convertit un corps HTML email en plain-text simple pour le multipart fallback.
 * D_T2010_10 Patch C -- pas de dependance externe (html-to-text non requise).
 * Approche pragmatique : remplace br/p par newlines, strip balises, decode entites
 * usuelles, normalise les blancs. Suffisant pour les emails AEGIS courts / structures.
 */
function htmlToPlainText(html: string): string {
    return html
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<\/h[1-6]>/gi, '\n\n')
        .replace(/<\/tr>/gi, '\n')
        .replace(/<\/td>/gi, '\t')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;|&apos;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

// --- Data types ---
export interface MailerPaymentData {
    payment_id: string;
    request_id?: string;
    email?: string;
    customer_name?: string;
    customer_company?: string;
    product?: string;
    lang?: string;
    mode?: string;
    amount?: string;
    // diagnostic-request specific fields
    sector?: string;
    regulations?: string[];
    context?: string;
    // FIX-03 : delivery email
    download_url?: string;
    invoice_number?: string;
    // FIX-08 : signature digitale CGI eIDAS Art. 25 SES
    approved_by?: string;
    approved_at?: string;
    pdf_sha256?: string;
    signature_note?: string;
    // NIGHT-N5 DETTE18 : piece jointe PDF email (remplace hebergement serveur)
    pdf_base64?: string;
    pdf_filename?: string;
    // S3 Mission N11 : VEILLE subscription auto (Mollie sub_xxx) + periode prelevement
    subscription_id?: string;
    period?: string; // YYYY-MM (recurring debit)
    // S4 Mission N11 : rapport DIAGNOSTIC PDF (distinct de la facture pdf_base64)
    report_pdf_base64?: string;
    report_pdf_filename?: string;
    failure_reason?: string; // S4 ops failure alert
    // S5 Mission N11 : rapport VEILLE mensuel
    edition?: string;        // ex: "Mai 2026 -- N°1" / "2026-05-N1"
    month_label?: string;    // ex: "Mai 2026"
}

// --- Send functions ---

/**
 * Send confirmation email to client (HTML branded).
 * C1 : must arrive within 60s of payment.
 * C4 : failure logged, never thrown to caller if caught externally.
 *
 * S1 Mission N11 : si data.pdf_base64 present, attache la facture PDF (P0 legal Art. L441-10).
 */
export async function sendClientConfirmation(data: MailerPaymentData): Promise<void> {
    const recipient = data.email || '';
    if (!recipient || !isValidEmail(recipient)) {
        logMailer({
            event: 'mailer_skipped',
            reason: 'invalid_email',
            payment_id: data.payment_id,
            timestamp: new Date().toISOString(),
        });
        return;
    }

    const lang = (data.lang === 'en' ? 'en' : 'fr') as 'fr' | 'en';
    const html = clientConfirmationHtml(data, lang);
    const subject = lang === 'fr'
        ? `Confirmation de votre commande AEGIS Intelligence`
        : `Your AEGIS Intelligence order confirmation`;

    let attachments: { filename: string; content: Buffer; contentType: string }[] | undefined;
    let attachmentSize = 0;
    if (data.pdf_base64) {
        const buf = Buffer.from(data.pdf_base64, 'base64');
        attachmentSize = buf.byteLength;
        if (attachmentSize > PDF_MAX_BYTES) {
            throw new Error(`PDF attachment too large: ${attachmentSize} bytes (max ${PDF_MAX_BYTES})`);
        }
        const invoice = data.invoice_number || 'AEGIS';
        attachments = [{
            filename: data.pdf_filename || `Facture_AEGIS_${invoice}.pdf`,
            content: buf,
            contentType: 'application/pdf',
        }];
    }

    await getTransport().sendMail({
        from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
        to: recipient,
        subject,
        html,
        text: htmlToPlainText(html),
        attachments,
    });

    logMailer({
        event: 'mailer_sent',
        payment_id: data.payment_id,
        request_id: data.request_id || null,
        recipient_type: 'client',
        recipient_masked: maskEmail(recipient),
        has_attachment: attachments !== undefined,
        attachment_size_bytes: attachmentSize || null,
        timestamp: new Date().toISOString(),
    });
}

/**
 * Send structured order notification to ops JP.
 * C2 : must arrive within 60s for production trigger.
 */
export async function sendOpsNewOrder(data: MailerPaymentData): Promise<void> {
    const reqShort = (data.request_id || 'N/A').slice(0, 8);
    const html = opsNewOrderHtml(data);

    await getTransport().sendMail({
        from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
        to: OPS_NOTIFY_EMAIL,
        subject: `[AEGIS] Nouvelle commande DIAGNOSTIC #REQ-${reqShort}`,
        html,
        text: htmlToPlainText(html),
    });

    logMailer({
        event: 'mailer_sent',
        payment_id: data.payment_id,
        request_id: data.request_id || null,
        recipient_type: 'ops',
        timestamp: new Date().toISOString(),
    });
}

/**
 * Send delivery confirmation email to client (report ready).
 * FIX-03 : triggered manually by JP via /api/send-delivery.
 */
export async function sendDeliveryConfirmation(data: MailerPaymentData): Promise<void> {
    const recipient = data.email || '';
    if (!recipient || !isValidEmail(recipient)) {
        logMailer({
            event: 'mailer_skipped',
            reason: 'invalid_email',
            payment_id: data.payment_id,
            timestamp: new Date().toISOString(),
        });
        return;
    }

    const lang = (data.lang === 'en' ? 'en' : 'fr') as 'fr' | 'en';
    const html = deliveryConfirmationHtml(data, lang);
    const companyPart = data.customer_company ? ` — ${data.customer_company}` : '';
    const invoicePart = data.invoice_number ? ` (${data.invoice_number})` : '';
    const subject = lang === 'fr'
        ? `Votre diagnostic conformité industrielle${companyPart}${invoicePart}`
        : `Your industrial compliance diagnostic${companyPart}${invoicePart}`;

    let attachments: { filename: string; content: Buffer; contentType: string }[] | undefined;
    let attachmentSize = 0;
    if (data.pdf_base64) {
        const buf = Buffer.from(data.pdf_base64, 'base64');
        attachmentSize = buf.byteLength;
        if (attachmentSize > PDF_MAX_BYTES) {
            throw new Error(`PDF attachment too large: ${attachmentSize} bytes (max ${PDF_MAX_BYTES})`);
        }
        const invoice = data.invoice_number || 'diagnostic';
        attachments = [{
            filename: data.pdf_filename || `AEGIS-DIAGNOSTIC-${invoice}.pdf`,
            content: buf,
            contentType: 'application/pdf',
        }];
    }

    await getTransport().sendMail({
        from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
        to: recipient,
        subject,
        html,
        text: htmlToPlainText(html),
        attachments,
    });

    logMailer({
        event: 'mailer_sent',
        payment_id: data.payment_id,
        request_id: data.request_id || null,
        recipient_type: 'client_delivery',
        recipient_masked: maskEmail(recipient),
        has_attachment: attachments !== undefined,
        attachment_size_bytes: attachmentSize || null,
        timestamp: new Date().toISOString(),
    });
}

/**
 * Send DIAGNOSTIC PDF to client (Phase C endpoint diagnostic-deliver).
 * Pattern EA-05 Gandi SMTP 465 + EA-15 DETTE6 C3-bis timeout heritage.
 * Signature simplifiee (Buffer direct) distincte de sendDeliveryConfirmation (pdf_base64 legacy).
 *
 * R_T0838_JP_01 doctrinale : aucun email clair en log (maskEmail).
 * R_T1340_01 strict : aucun err.message nodemailer propagated (caller must catch via emailLogIdentifier).
 */
export async function sendClientDiagnostic(params: {
    to: string;
    pdfBuffer: Buffer;
    invoiceNumber: string;
    lang?: 'fr' | 'en';
}): Promise<void> {
    const { to, pdfBuffer, invoiceNumber, lang = 'fr' } = params;

    if (!isValidEmail(to)) {
        throw new Error('invalid_recipient_email');
    }
    if (pdfBuffer.length > PDF_MAX_BYTES) {
        throw new Error(`pdf_too_large_${pdfBuffer.length}_bytes`);
    }

    const subject = lang === 'fr'
        ? `Votre diagnostic conformité industrielle (${invoiceNumber})`
        : `Your industrial compliance diagnostic (${invoiceNumber})`;

    const html = lang === 'fr'
        ? `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#0f172a;">
<p>Bonjour,</p>
<p>Veuillez trouver en pièce jointe votre rapport <strong>DIAGNOSTIC AEGIS Intelligence</strong> (référence <code>${invoiceNumber}</code>).</p>
<p>Ce rapport est signé numériquement (eIDAS Art. 25 SES) avec empreinte SHA-256 d'intégrité apposée en bloc signature.</p>
<p>Pour toute question ou suivi, répondez directement à cet email.</p>
<p>Cordialement,<br><strong>Jean-Pierre CHARLES</strong><br>AEGIS Intelligence — <a href="https://jeanpierrecharles.com">jeanpierrecharles.com</a></p>
</body></html>`
        : `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#0f172a;">
<p>Hello,</p>
<p>Please find attached your <strong>AEGIS Intelligence DIAGNOSTIC report</strong> (reference <code>${invoiceNumber}</code>).</p>
<p>This report is digitally signed (eIDAS Art. 25 SES) with SHA-256 integrity hash embedded in the signature block.</p>
<p>For any question or follow-up, reply directly to this email.</p>
<p>Regards,<br><strong>Jean-Pierre CHARLES</strong><br>AEGIS Intelligence — <a href="https://jeanpierrecharles.com">jeanpierrecharles.com</a></p>
</body></html>`;

    await getTransport().sendMail({
        from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
        to,
        subject,
        html,
        text: htmlToPlainText(html),
        attachments: [{
            filename: `AEGIS-DIAGNOSTIC-${invoiceNumber}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
        }],
    });

    logMailer({
        event: 'mailer_sent',
        recipient_type: 'client_diagnostic',
        recipient_masked: maskEmail(to),
        invoice_number: invoiceNumber,
        pdf_size_bytes: pdfBuffer.length,
        timestamp: new Date().toISOString(),
    });
}

/**
 * V360 — VEILLE client confirmation email (Phase 1 MVP).
 * Inline HTML simple (pas de template lib touch). Calque emailWrapper visuel.
 */
export async function sendVeilleClientConfirmation(data: MailerPaymentData): Promise<void> {
    const recipient = data.email || '';
    if (!recipient || !isValidEmail(recipient)) {
        logMailer({
            event: 'mailer_skipped',
            reason: 'invalid_email',
            payment_id: data.payment_id,
            timestamp: new Date().toISOString(),
        });
        return;
    }

    const isFr = data.lang !== 'en';
    const amount = data.amount || '150.00';
    const invoice = data.invoice_number || '';
    const subject = isFr
        ? `Confirmation de votre abonnement VEILLE AEGIS Intelligence`
        : `Your AEGIS Intelligence VEILLE subscription confirmation`;

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:'Segoe UI',system-ui,sans-serif;color:#0f172a;background:#f8fafc;margin:0;padding:20px">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
<div style="background:linear-gradient(135deg,#3b82f6,#1d4ed8);padding:28px 24px;text-align:center;color:#fff">
<h1 style="margin:0;font-size:20px;font-weight:800">AEGIS Intelligence</h1>
<p style="margin:6px 0 0;font-size:13px;opacity:0.85">${isFr ? 'Veille réglementaire EU continue' : 'EU continuous regulatory watch'}</p>
</div>
<div style="padding:28px 24px">
<p style="font-size:14px">${isFr ? 'Bonjour,' : 'Hello,'}</p>
<p style="font-size:14px">${isFr
    ? 'Merci pour votre abonnement à la <strong>VEILLE AEGIS Intelligence</strong>. Votre 1er paiement de <strong>' + amount + ' EUR</strong> est confirmé.'
    : 'Thank you for subscribing to the <strong>AEGIS Intelligence regulatory WATCH</strong>. Your 1st payment of <strong>EUR ' + amount + '</strong> is confirmed.'}</p>
<div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:14px;margin:18px 0;font-size:13px">
<strong>${isFr ? 'Démarrage immédiat' : 'Immediate start'}</strong><br>
${isFr
    ? 'Votre veille démarre dès aujourd\'hui. Première alerte sous 48h selon vos secteurs et règlements ciblés.'
    : 'Your watch starts today. First alert within 48h based on your selected sectors and regulations.'}
</div>
<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;font-size:12px;line-height:1.7">
<strong>${isFr ? 'Référence facture' : 'Invoice reference'} :</strong> ${escapeBasicHtml(invoice)}<br>
<strong>${isFr ? 'Montant' : 'Amount'} :</strong> ${amount} EUR/${isFr ? 'mois' : 'month'}<br>
<strong>TVA :</strong> ${isFr ? 'Non applicable, art. 293 B CGI' : 'Not applicable, art. 293 B CGI'}
</div>
<p style="font-size:13px;color:#64748b;margin-top:24px">${isFr
    ? 'Pour toute question : '
    : 'Any questions : '}<a href="mailto:contact@jeanpierrecharles.com" style="color:#3b82f6;font-weight:600">contact@jeanpierrecharles.com</a></p>
</div>
<div style="padding:16px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;font-size:11px;color:#94a3b8">
AEGIS Intelligence | jeanpierrecharles.com | SIRET 522 794 700 00032<br>
Entrepreneur individuel | TVA non applicable, art. 293 B du CGI
</div>
</div></body></html>`;

    let attachments: { filename: string; content: Buffer; contentType: string }[] | undefined;
    let attachmentSize = 0;
    if (data.pdf_base64) {
        const buf = Buffer.from(data.pdf_base64, 'base64');
        attachmentSize = buf.byteLength;
        if (attachmentSize > PDF_MAX_BYTES) {
            throw new Error(`PDF attachment too large: ${attachmentSize} bytes (max ${PDF_MAX_BYTES})`);
        }
        const invoiceRef = data.invoice_number || 'AEGIS-VEILLE';
        attachments = [{
            filename: data.pdf_filename || `Facture_AEGIS_${invoiceRef}.pdf`,
            content: buf,
            contentType: 'application/pdf',
        }];
    }

    await getTransport().sendMail({
        from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
        to: recipient,
        subject,
        html,
        text: htmlToPlainText(html),
        attachments,
    });

    logMailer({
        event: 'mailer_sent',
        payment_id: data.payment_id,
        request_id: data.request_id || null,
        recipient_type: 'client_veille',
        recipient_masked: maskEmail(recipient),
        has_attachment: attachments !== undefined,
        attachment_size_bytes: attachmentSize || null,
        timestamp: new Date().toISOString(),
    });
}

/**
 * S3 Mission N11 — VEILLE ops new order notification (subscription créée automatiquement).
 * Mise à jour template : remplace les 4 étapes manuelles JP par confirmation auto.
 * Si subscription_id absent → fallback "subscription pending" (creation Mollie a échoué).
 */
export async function sendVeilleOpsNewOrder(data: MailerPaymentData): Promise<void> {
    const reqShort = (data.request_id || 'N/A').slice(0, 8);
    const amount = data.amount || '150.00';
    const hasSub = Boolean(data.subscription_id);
    const subject = hasSub
        ? `[AEGIS] VEILLE auto activée #REQ-${reqShort} (sub ${(data.subscription_id || '').slice(0, 12)})`
        : `[AEGIS] VEILLE paid mais subscription FAIL #REQ-${reqShort} — Action manuelle requise`;

    const banner = hasSub
        ? `<div style="background:#dcfce7;border:1px solid #16a34a;border-radius:8px;padding:14px;margin-bottom:18px;color:#14532d;font-size:13px;line-height:1.6">
<strong>Subscription créée automatiquement ✓</strong><br>
ID Mollie : <code>${escapeBasicHtml(data.subscription_id || '')}</code><br>
Prélèvement mensuel ${amount} EUR/mois activé. Le client a reçu l'email d'activation avec facture PDF.<br>
Aucune action manuelle requise.
</div>`
        : `<div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:14px;margin-bottom:18px;color:#92400e;font-size:13px;line-height:1.6">
<strong>⚠ Création subscription Mollie a échoué</strong><br>
Le client a payé ${amount} EUR mais la subscription récurrente n'a pas pu être créée automatiquement.<br>
<strong>Action manuelle :</strong> Mollie dashboard → Customer ${escapeBasicHtml(data.payment_id)} → créer subscription mensuelle ${amount} EUR.
</div>`;

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:'Segoe UI',system-ui,sans-serif;color:#0f172a;background:#f8fafc;margin:0;padding:20px">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
<div style="background:linear-gradient(135deg,${hasSub ? '#16a34a,#15803d' : '#f59e0b,#d97706'});padding:24px;text-align:center;color:#fff">
<h1 style="margin:0;font-size:18px;font-weight:800">[AEGIS] ${hasSub ? 'Abonnement VEILLE activé' : 'VEILLE paid — sub manuelle'}</h1>
<p style="margin:6px 0 0;font-size:12px;opacity:0.9">#REQ-${escapeBasicHtml(reqShort)}</p>
</div>
<div style="padding:24px">
${banner}
<table style="width:100%;font-size:13px;line-height:1.8">
<tr><td style="width:140px;color:#64748b;font-weight:600">Client</td><td>${escapeBasicHtml(data.customer_name || 'Non fourni')}</td></tr>
<tr><td style="color:#64748b;font-weight:600">Email</td><td>${escapeBasicHtml(data.email || 'Non fourni')}</td></tr>
<tr><td style="color:#64748b;font-weight:600">Entreprise</td><td>${escapeBasicHtml(data.customer_company || 'Non fourni')}</td></tr>
<tr><td style="color:#64748b;font-weight:600">Secteurs</td><td>${escapeBasicHtml(data.sector || 'Non fourni')}</td></tr>
<tr><td style="color:#64748b;font-weight:600">Règlements</td><td>${escapeBasicHtml(Array.isArray(data.regulations) ? data.regulations.join(', ') : (data.regulations || 'Non fourni'))}</td></tr>
<tr><td style="color:#64748b;font-weight:600">Montant</td><td><strong>${amount} EUR / mois</strong></td></tr>
${hasSub ? `<tr><td style="color:#64748b;font-weight:600">Subscription</td><td><code>${escapeBasicHtml(data.subscription_id || '')}</code></td></tr>` : ''}
<tr><td style="color:#64748b;font-weight:600">Payment ID</td><td><code>${escapeBasicHtml(data.payment_id)}</code></td></tr>
<tr><td style="color:#64748b;font-weight:600">Request ID</td><td><code>${escapeBasicHtml(data.request_id || 'N/A')}</code></td></tr>
<tr><td style="color:#64748b;font-weight:600">Mode</td><td>${escapeBasicHtml(data.mode || 'N/A')}</td></tr>
<tr><td style="color:#64748b;font-weight:600">Facture</td><td>${escapeBasicHtml(data.invoice_number || 'N/A')}</td></tr>
</table>
</div>
<div style="padding:14px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;font-size:11px;color:#94a3b8">
Email automatique AEGIS Intelligence Pipeline — VEILLE S3 auto
</div>
</div></body></html>`;

    await getTransport().sendMail({
        from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
        to: OPS_NOTIFY_EMAIL,
        subject,
        html,
        text: htmlToPlainText(html),
    });

    logMailer({
        event: 'mailer_sent',
        payment_id: data.payment_id,
        request_id: data.request_id || null,
        recipient_type: 'ops_veille',
        subscription_id: data.subscription_id || null,
        activation_ok: hasSub,
        timestamp: new Date().toISOString(),
    });
}

/**
 * S3 Mission N11 — VEILLE client activation confirmation (subscription créée).
 * Variante de sendVeilleClientConfirmation : message explicite "Veille activée"
 * + PJ facture PDF (héritée de S1) + reference subscription_id.
 */
export async function sendVeilleActivationConfirmation(data: MailerPaymentData): Promise<void> {
    const recipient = data.email || '';
    if (!recipient || !isValidEmail(recipient)) {
        logMailer({
            event: 'mailer_skipped',
            reason: 'invalid_email',
            payment_id: data.payment_id,
            timestamp: new Date().toISOString(),
        });
        return;
    }

    const isFr = data.lang !== 'en';
    const amount = data.amount || '150.00';
    const invoice = data.invoice_number || '';
    const subSuffix = data.subscription_id ? ` (${data.subscription_id.slice(0, 12)}…)` : '';
    const subject = isFr
        ? `Votre veille AEGIS est activée${subSuffix}`
        : `Your AEGIS regulatory watch is active${subSuffix}`;

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:'Segoe UI',system-ui,sans-serif;color:#0f172a;background:#f8fafc;margin:0;padding:20px">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
<div style="background:linear-gradient(135deg,#10b981,#059669);padding:28px 24px;text-align:center;color:#fff">
<h1 style="margin:0;font-size:20px;font-weight:800">${isFr ? 'Veille AEGIS activée' : 'AEGIS Watch active'}</h1>
<p style="margin:6px 0 0;font-size:13px;opacity:0.9">${isFr ? 'Surveillance réglementaire EU continue' : 'EU continuous regulatory watch'}</p>
</div>
<div style="padding:28px 24px">
<p style="font-size:14px">${isFr ? 'Bonjour,' : 'Hello,'}</p>
<p style="font-size:14px">${isFr
    ? 'Votre abonnement <strong>VEILLE AEGIS Intelligence</strong> est <strong>actif</strong>. Le mandate de prélèvement mensuel a été enregistré, votre périmètre de veille est en cours de configuration.'
    : 'Your <strong>AEGIS Intelligence WATCH</strong> subscription is <strong>active</strong>. The monthly direct-debit mandate is registered, your watch perimeter is being configured.'}</p>

<div style="background:#ecfdf5;border:1px solid #6ee7b7;border-radius:10px;padding:14px;margin:18px 0;font-size:13px;line-height:1.7">
<strong>${isFr ? 'Ce qui se passe maintenant' : 'What happens now'}</strong><br>
${isFr
    ? '1. Votre périmètre de veille (secteurs + règlements) est configuré sous 24h.<br>2. 1ère alerte personnalisée sous 48h.<br>3. Rapport mensuel synthétique livré chaque début de mois.<br>4. Prélèvement automatique de ' + amount + ' EUR le ' + (new Date().getDate()) + ' de chaque mois.'
    : '1. Your watch perimeter (sectors + regulations) is set up within 24h.<br>2. 1st personalised alert within 48h.<br>3. Monthly synthesis report delivered at the start of each month.<br>4. Automatic debit of EUR ' + amount + ' on day ' + (new Date().getDate()) + ' of each month.'}
</div>

<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;font-size:12px;line-height:1.7">
<strong>${isFr ? 'Référence facture' : 'Invoice reference'} :</strong> ${escapeBasicHtml(invoice)}<br>
<strong>${isFr ? 'Montant' : 'Amount'} :</strong> ${amount} EUR/${isFr ? 'mois' : 'month'}<br>
${data.subscription_id ? `<strong>${isFr ? 'Référence abonnement' : 'Subscription ref'} :</strong> <code>${escapeBasicHtml(data.subscription_id)}</code><br>` : ''}
<strong>TVA :</strong> ${isFr ? 'Non applicable, art. 293 B CGI' : 'Not applicable, art. 293 B CGI'}
</div>

<p style="font-size:13px;color:#64748b;margin-top:24px">${isFr
    ? 'La facture PDF du 1er mois est jointe à cet email. Pour toute question : '
    : 'The 1st month PDF invoice is attached. Any questions : '}<a href="mailto:contact@jeanpierrecharles.com" style="color:#10b981;font-weight:600">contact@jeanpierrecharles.com</a></p>

<p style="font-size:12px;color:#94a3b8;margin-top:16px">${isFr
    ? 'Vous pouvez résilier à tout moment en répondant à cet email. La résiliation prend effet à la fin du mois en cours.'
    : 'You can cancel at any time by replying to this email. Cancellation takes effect at the end of the current month.'}</p>
</div>
<div style="padding:16px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;font-size:11px;color:#94a3b8">
AEGIS Intelligence | jeanpierrecharles.com | SIRET 522 794 700 00032<br>
Entrepreneur individuel | TVA non applicable, art. 293 B du CGI
</div>
</div></body></html>`;

    let attachments: { filename: string; content: Buffer; contentType: string }[] | undefined;
    let attachmentSize = 0;
    if (data.pdf_base64) {
        const buf = Buffer.from(data.pdf_base64, 'base64');
        attachmentSize = buf.byteLength;
        if (attachmentSize > PDF_MAX_BYTES) {
            throw new Error(`PDF attachment too large: ${attachmentSize} bytes (max ${PDF_MAX_BYTES})`);
        }
        const invoiceRef = data.invoice_number || 'AEGIS-VEILLE';
        attachments = [{
            filename: data.pdf_filename || `Facture_AEGIS_${invoiceRef}.pdf`,
            content: buf,
            contentType: 'application/pdf',
        }];
    }

    await getTransport().sendMail({
        from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
        to: recipient,
        subject,
        html,
        text: htmlToPlainText(html),
        attachments,
    });

    logMailer({
        event: 'mailer_sent',
        payment_id: data.payment_id,
        request_id: data.request_id || null,
        recipient_type: 'client_veille_activation',
        recipient_masked: maskEmail(recipient),
        subscription_id: data.subscription_id || null,
        has_attachment: attachments !== undefined,
        attachment_size_bytes: attachmentSize || null,
        timestamp: new Date().toISOString(),
    });
}

/**
 * S4 Mission N11 — DIAGNOSTIC delivery (auto, Voie B serverless).
 * Email client avec 2 PJ : rapport PDF (Opus) + facture PDF (S1 invoices).
 * Calque sendDeliveryConfirmation mais bilingue propre + double PJ.
 */
export async function sendDiagnosticDelivery(data: MailerPaymentData): Promise<void> {
    const recipient = data.email || '';
    if (!recipient || !isValidEmail(recipient)) {
        logMailer({
            event: 'mailer_skipped',
            reason: 'invalid_email',
            payment_id: data.payment_id,
            timestamp: new Date().toISOString(),
        });
        return;
    }

    const lang = (data.lang === 'en' ? 'en' : 'fr') as 'fr' | 'en';
    const isFr = lang === 'fr';
    const invoiceNum = data.invoice_number || '';
    const company = data.customer_company ? ` — ${data.customer_company}` : '';
    const subject = isFr
        ? `Votre diagnostic conformité industrielle${company} (${invoiceNum})`
        : `Your industrial compliance diagnostic${company} (${invoiceNum})`;

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:'Segoe UI',system-ui,sans-serif;color:#0f172a;background:#f8fafc;margin:0;padding:20px">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
<div style="background:linear-gradient(135deg,#10b981,#059669);padding:28px 24px;text-align:center;color:#fff">
<h1 style="margin:0;font-size:20px;font-weight:800">${isFr ? 'Diagnostic AEGIS prêt' : 'AEGIS Diagnostic ready'}</h1>
<p style="margin:6px 0 0;font-size:13px;opacity:0.9">${isFr ? 'Conformité industrielle EU' : 'EU industrial compliance'}</p>
</div>
<div style="padding:28px 24px">
<p style="font-size:14px">${isFr ? 'Bonjour,' : 'Hello,'}</p>
<p style="font-size:14px">${isFr
    ? 'Votre <strong>diagnostic AEGIS Intelligence</strong> est joint à cet email. Vous trouverez en pièces jointes :'
    : 'Your <strong>AEGIS Intelligence diagnostic</strong> is attached to this email. You will find:'}</p>

<div style="background:#ecfdf5;border:1px solid #6ee7b7;border-radius:10px;padding:14px 18px;margin:18px 0;font-size:13px;line-height:1.7">
<strong>${isFr ? '📄 Rapport diagnostic complet' : '📄 Full diagnostic report'}</strong> — ${isFr ? 'analyse 7 sections, graphe causal, feuille de route' : '7-section analysis, causal graph, roadmap'}<br>
<strong>${isFr ? '🧾 Facture' : '🧾 Invoice'}</strong> — ${escapeBasicHtml(invoiceNum)} (${isFr ? 'conservation 10 ans Art. 293 B CGI' : 'kept 10 years per Art. 293 B CGI'})
</div>

<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;font-size:12px;line-height:1.7">
<strong>${isFr ? 'Référence' : 'Reference'} :</strong> ${escapeBasicHtml(invoiceNum)}<br>
${data.customer_name ? `<strong>${isFr ? 'Client' : 'Customer'} :</strong> ${escapeBasicHtml(data.customer_name)}<br>` : ''}
${data.customer_company ? `<strong>${isFr ? 'Entreprise' : 'Company'} :</strong> ${escapeBasicHtml(data.customer_company)}<br>` : ''}
<strong>Date :</strong> ${new Date().toLocaleDateString(isFr ? 'fr-FR' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
</div>

<p style="font-size:13px;color:#64748b;margin-top:24px">${isFr
    ? 'Pour toute question ou suivi : '
    : 'For any question or follow-up : '}<a href="mailto:contact@jeanpierrecharles.com" style="color:#10b981;font-weight:600">contact@jeanpierrecharles.com</a></p>
</div>
<div style="padding:16px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;font-size:11px;color:#94a3b8">
AEGIS Intelligence | jeanpierrecharles.com | SIRET 522 794 700 00032<br>
Entrepreneur individuel | TVA non applicable, art. 293 B du CGI
</div>
</div></body></html>`;

    const attachments: { filename: string; content: Buffer; contentType: string }[] = [];
    let totalSize = 0;

    if (data.report_pdf_base64) {
        const buf = Buffer.from(data.report_pdf_base64, 'base64');
        if (buf.byteLength > PDF_MAX_BYTES) {
            throw new Error(`Report PDF too large: ${buf.byteLength} bytes`);
        }
        totalSize += buf.byteLength;
        attachments.push({
            filename: data.report_pdf_filename || `AEGIS-DIAGNOSTIC-${invoiceNum}.pdf`,
            content: buf,
            contentType: 'application/pdf',
        });
    }
    if (data.pdf_base64) {
        const buf = Buffer.from(data.pdf_base64, 'base64');
        if (buf.byteLength > PDF_MAX_BYTES) {
            throw new Error(`Invoice PDF too large: ${buf.byteLength} bytes`);
        }
        totalSize += buf.byteLength;
        attachments.push({
            filename: data.pdf_filename || `Facture_AEGIS_${invoiceNum}.pdf`,
            content: buf,
            contentType: 'application/pdf',
        });
    }

    await getTransport().sendMail({
        from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
        to: recipient,
        subject,
        html,
        text: htmlToPlainText(html),
        attachments: attachments.length > 0 ? attachments : undefined,
    });

    logMailer({
        event: 'mailer_sent',
        payment_id: data.payment_id,
        request_id: data.request_id || null,
        recipient_type: 'client_diagnostic_delivery',
        recipient_masked: maskEmail(recipient),
        attachments_count: attachments.length,
        total_attachments_bytes: totalSize || null,
        timestamp: new Date().toISOString(),
    });
}

/**
 * S4 Mission N11 — DIAGNOSTIC failure ops alert (Voie B Opus/PDF a echoue).
 * Email JP pour intervention manuelle (relance generate-diagnostic ou fallback PS1).
 */
export async function sendDiagnosticFailureOps(data: MailerPaymentData): Promise<void> {
    const reqShort = (data.request_id || 'N/A').slice(0, 8);
    const subject = `[AEGIS] DIAGNOSTIC generation FAIL #REQ-${reqShort} — Action manuelle`;
    const reason = data.failure_reason || 'unknown';

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:'Segoe UI',system-ui,sans-serif;color:#0f172a;background:#f8fafc;margin:0;padding:20px">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
<div style="background:linear-gradient(135deg,#dc2626,#991b1b);padding:24px;text-align:center;color:#fff">
<h1 style="margin:0;font-size:18px;font-weight:800">[AEGIS] DIAGNOSTIC generation FAIL</h1>
<p style="margin:6px 0 0;font-size:12px;opacity:0.9">#REQ-${escapeBasicHtml(reqShort)}</p>
</div>
<div style="padding:24px">
<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px;margin-bottom:18px;color:#7f1d1d;font-size:13px;line-height:1.6">
<strong>⚠ Generation auto Voie B a echoue</strong><br>
Le client a paye ${data.amount || '250.00'} EUR, le rapport DIAGNOSTIC n'a pas pu etre genere automatiquement.<br>
<strong>Cause :</strong> <code>${escapeBasicHtml(reason)}</code><br>
<strong>Status Supabase :</strong> <code>failed</code> — manuel requis.<br><br>
<strong>Actions possibles :</strong><br>
1. Verifier les logs Vercel (function generate-diagnostic) pour le detail.<br>
2. Relancer manuellement : <code>POST /api/generate-diagnostic</code> avec header <code>x-admin-key</code> + body <code>{"request_id":"${escapeBasicHtml(data.request_id || '')}"}</code>.<br>
3. Fallback PS1 manuel : <code>aegis-diagnostic-api.ps1</code> + dashboard <code>/admin/pending-list.html</code>.
</div>
<table style="width:100%;font-size:13px;line-height:1.8">
<tr><td style="width:140px;color:#64748b;font-weight:600">Client</td><td>${escapeBasicHtml(data.customer_name || 'Non fourni')}</td></tr>
<tr><td style="color:#64748b;font-weight:600">Email</td><td>${escapeBasicHtml(data.email || 'Non fourni')}</td></tr>
<tr><td style="color:#64748b;font-weight:600">Entreprise</td><td>${escapeBasicHtml(data.customer_company || 'Non fourni')}</td></tr>
<tr><td style="color:#64748b;font-weight:600">Secteur</td><td>${escapeBasicHtml(data.sector || 'Non fourni')}</td></tr>
<tr><td style="color:#64748b;font-weight:600">Payment ID</td><td><code>${escapeBasicHtml(data.payment_id)}</code></td></tr>
<tr><td style="color:#64748b;font-weight:600">Request ID</td><td><code>${escapeBasicHtml(data.request_id || 'N/A')}</code></td></tr>
<tr><td style="color:#64748b;font-weight:600">Facture</td><td>${escapeBasicHtml(data.invoice_number || 'N/A')}</td></tr>
</table>
</div>
<div style="padding:14px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;font-size:11px;color:#94a3b8">
Email automatique AEGIS Intelligence Pipeline — DIAGNOSTIC S4 failure
</div>
</div></body></html>`;

    await getTransport().sendMail({
        from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
        to: OPS_NOTIFY_EMAIL,
        subject,
        html,
        text: htmlToPlainText(html),
    });

    logMailer({
        event: 'mailer_sent',
        payment_id: data.payment_id,
        request_id: data.request_id || null,
        recipient_type: 'ops_diagnostic_failure',
        failure_reason: reason,
        timestamp: new Date().toISOString(),
    });
}

/**
 * S3 Mission N11 — VEILLE recurring debit ops notification.
 * Email simple à JP pour log mensuel des prélèvements récurrents (sequenceType='recurring').
 * Pas de notification client : le client a déjà connaissance du prélèvement automatique.
 */
export async function sendVeilleRecurringOps(data: MailerPaymentData): Promise<void> {
    const subShort = (data.subscription_id || 'N/A').slice(0, 12);
    const amount = data.amount || '150.00';
    const period = data.period || new Date().toISOString().slice(0, 7);
    const subject = `[AEGIS] VEILLE prélèvement mensuel ${period} (${amount} EUR) sub ${subShort}`;

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:'Segoe UI',system-ui,sans-serif;color:#0f172a;background:#f8fafc;margin:0;padding:20px">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
<div style="background:linear-gradient(135deg,#3b82f6,#1d4ed8);padding:20px;text-align:center;color:#fff">
<h1 style="margin:0;font-size:16px;font-weight:800">[AEGIS] VEILLE prélèvement mensuel</h1>
<p style="margin:4px 0 0;font-size:11px;opacity:0.85">Période ${escapeBasicHtml(period)}</p>
</div>
<div style="padding:20px">
<p style="font-size:13px;margin:0 0 14px">Prélèvement automatique reçu sur abonnement VEILLE.</p>
<table style="width:100%;font-size:12px;line-height:1.7">
<tr><td style="width:130px;color:#64748b;font-weight:600">Subscription</td><td><code>${escapeBasicHtml(data.subscription_id || 'N/A')}</code></td></tr>
<tr><td style="color:#64748b;font-weight:600">Payment ID</td><td><code>${escapeBasicHtml(data.payment_id)}</code></td></tr>
<tr><td style="color:#64748b;font-weight:600">Montant</td><td><strong>${amount} EUR</strong></td></tr>
<tr><td style="color:#64748b;font-weight:600">Période</td><td>${escapeBasicHtml(period)}</td></tr>
<tr><td style="color:#64748b;font-weight:600">Mode</td><td>${escapeBasicHtml(data.mode || 'N/A')}</td></tr>
</table>
<p style="font-size:11px;color:#94a3b8;margin-top:14px">Logué dans Supabase <code>veille_payments</code>. Aucune action requise.</p>
</div>
<div style="padding:12px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;font-size:10px;color:#94a3b8">
Email automatique AEGIS Intelligence Pipeline — VEILLE S3 recurring
</div>
</div></body></html>`;

    await getTransport().sendMail({
        from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
        to: OPS_NOTIFY_EMAIL,
        subject,
        html,
        text: htmlToPlainText(html),
    });

    logMailer({
        event: 'mailer_sent',
        payment_id: data.payment_id,
        recipient_type: 'ops_veille_recurring',
        subscription_id: data.subscription_id || null,
        period,
        timestamp: new Date().toISOString(),
    });
}

/**
 * S5 Mission N11 — VEILLE monthly report delivery (per-subscriber).
 * Email a chaque abonne actif avec PJ PDF (rapport mensuel rendu via veille-report-template).
 * Bilingue FR/EN. Filename = data.report_pdf_filename (deja calcule par le template).
 */
export async function sendVeilleMonthlyReport(data: MailerPaymentData): Promise<void> {
    const recipient = data.email || '';
    if (!recipient || !isValidEmail(recipient)) {
        logMailer({
            event: 'mailer_skipped',
            reason: 'invalid_email',
            context: 'veille_monthly_report',
            timestamp: new Date().toISOString(),
        });
        return;
    }

    const lang = (data.lang === 'en' ? 'en' : 'fr') as 'fr' | 'en';
    const isFr = lang === 'fr';
    const edition = data.edition || 'N/A';
    const monthLabel = data.month_label || edition;
    const subject = isFr
        ? `[AEGIS] Veille reglementaire EU -- ${monthLabel}`
        : `[AEGIS] EU Regulatory Watch -- ${monthLabel}`;

    const html = veilleMonthlyReportHtml(data, lang);

    let attachments: { filename: string; content: Buffer; contentType: string }[] | undefined;
    let attachmentSize = 0;
    if (data.report_pdf_base64) {
        const buf = Buffer.from(data.report_pdf_base64, 'base64');
        attachmentSize = buf.byteLength;
        if (attachmentSize > PDF_MAX_BYTES) {
            throw new Error(`Report PDF too large: ${attachmentSize} bytes (max ${PDF_MAX_BYTES})`);
        }
        const editionSafe = edition.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60);
        attachments = [{
            filename: data.report_pdf_filename || `AEGIS-VEILLE-${editionSafe}-${lang}.pdf`,
            content: buf,
            contentType: 'application/pdf',
        }];
    }

    await getTransport().sendMail({
        from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
        to: recipient,
        subject,
        html,
        text: htmlToPlainText(html),
        attachments,
    });

    logMailer({
        event: 'mailer_sent',
        recipient_type: 'subscriber_veille_monthly',
        recipient_masked: maskEmail(recipient),
        edition,
        lang,
        has_attachment: attachments !== undefined,
        attachment_size_bytes: attachmentSize || null,
        timestamp: new Date().toISOString(),
    });
}

function escapeBasicHtml(str: string): string {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Send pre-checkout notification to ops JP (best-effort).
 * Never blocks caller — caller must .catch(() => {}).
 */
export async function sendOpsPreNotify(data: MailerPaymentData): Promise<void> {
    const html = opsPreNotifyHtml(data);

    await getTransport().sendMail({
        from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
        to: OPS_NOTIFY_EMAIL,
        subject: `[AEGIS] Tentative checkout — ${data.customer_company || data.sector || 'N/A'}`,
        html,
        text: htmlToPlainText(html),
    });

    logMailer({
        event: 'mailer_sent',
        payment_id: data.payment_id || 'pre-checkout',
        request_id: data.request_id || null,
        recipient_type: 'ops_prenotify',
        timestamp: new Date().toISOString(),
    });
}
