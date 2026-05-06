import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import {
    clientConfirmationHtml,
    opsNewOrderHtml,
    opsPreNotifyHtml,
    deliveryConfirmationHtml,
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
}

// --- Send functions ---

/**
 * Send confirmation email to client (HTML branded).
 * C1 : must arrive within 60s of payment.
 * C4 : failure logged, never thrown to caller if caught externally.
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

    await getTransport().sendMail({
        from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
        to: recipient,
        subject,
        html,
        text: htmlToPlainText(html),
    });

    logMailer({
        event: 'mailer_sent',
        payment_id: data.payment_id,
        request_id: data.request_id || null,
        recipient_type: 'client',
        recipient_masked: maskEmail(recipient),
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

    await getTransport().sendMail({
        from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
        to: recipient,
        subject,
        html,
        text: htmlToPlainText(html),
    });

    logMailer({
        event: 'mailer_sent',
        payment_id: data.payment_id,
        request_id: data.request_id || null,
        recipient_type: 'client_veille',
        recipient_masked: maskEmail(recipient),
        timestamp: new Date().toISOString(),
    });
}

/**
 * V360 — VEILLE ops new order notification (Phase 1 MVP).
 * Action requise JP : créer subscription récurrente manuellement dans Mollie dashboard.
 */
export async function sendVeilleOpsNewOrder(data: MailerPaymentData): Promise<void> {
    const reqShort = (data.request_id || 'N/A').slice(0, 8);
    const amount = data.amount || '150.00';
    const subject = `[AEGIS] Nouvel abonnement VEILLE #REQ-${reqShort} — Action: créer subscription Mollie`;

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:'Segoe UI',system-ui,sans-serif;color:#0f172a;background:#f8fafc;margin:0;padding:20px">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
<div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:24px;text-align:center;color:#fff">
<h1 style="margin:0;font-size:18px;font-weight:800">[AEGIS] Nouvel abonnement VEILLE</h1>
<p style="margin:6px 0 0;font-size:12px;opacity:0.9">#REQ-${escapeBasicHtml(reqShort)}</p>
</div>
<div style="padding:24px">
<div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:14px;margin-bottom:18px;color:#92400e;font-size:13px;line-height:1.6">
<strong>Action requise (Phase 1 manuelle) :</strong><br>
1. Ouvrir Mollie dashboard → Customers<br>
2. Créer customer + mandate via le payment ${escapeBasicHtml(data.payment_id)}<br>
3. Créer subscription récurrente : ${amount} EUR / mois<br>
4. Email client : configuration veille effective + 1ère alerte sous 48h
</div>
<table style="width:100%;font-size:13px;line-height:1.8">
<tr><td style="width:140px;color:#64748b;font-weight:600">Client</td><td>${escapeBasicHtml(data.customer_name || 'Non fourni')}</td></tr>
<tr><td style="color:#64748b;font-weight:600">Email</td><td>${escapeBasicHtml(data.email || 'Non fourni')}</td></tr>
<tr><td style="color:#64748b;font-weight:600">Entreprise</td><td>${escapeBasicHtml(data.customer_company || 'Non fourni')}</td></tr>
<tr><td style="color:#64748b;font-weight:600">Secteurs</td><td>${escapeBasicHtml(data.sector || 'Non fourni')}</td></tr>
<tr><td style="color:#64748b;font-weight:600">Règlements</td><td>${escapeBasicHtml(Array.isArray(data.regulations) ? data.regulations.join(', ') : (data.regulations || 'Non fourni'))}</td></tr>
<tr><td style="color:#64748b;font-weight:600">Montant</td><td><strong>${amount} EUR / mois</strong></td></tr>
<tr><td style="color:#64748b;font-weight:600">Payment ID</td><td><code>${escapeBasicHtml(data.payment_id)}</code></td></tr>
<tr><td style="color:#64748b;font-weight:600">Request ID</td><td><code>${escapeBasicHtml(data.request_id || 'N/A')}</code></td></tr>
<tr><td style="color:#64748b;font-weight:600">Mode</td><td>${escapeBasicHtml(data.mode || 'N/A')}</td></tr>
<tr><td style="color:#64748b;font-weight:600">Facture</td><td>${escapeBasicHtml(data.invoice_number || 'N/A')}</td></tr>
</table>
</div>
<div style="padding:14px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;font-size:11px;color:#94a3b8">
Email automatique AEGIS Intelligence Pipeline V360 — VEILLE Phase 1 manuelle
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
