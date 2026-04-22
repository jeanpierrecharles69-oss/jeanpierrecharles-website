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
    const subject = lang === 'fr'
        ? `[AEGIS] Votre rapport DIAGNOSTIC est prêt`
        : `[AEGIS] Your DIAGNOSTIC report is ready`;

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
        ? `[AEGIS] Votre rapport DIAGNOSTIC ${invoiceNumber}`
        : `[AEGIS] Your DIAGNOSTIC report ${invoiceNumber}`;

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
    });

    logMailer({
        event: 'mailer_sent',
        payment_id: data.payment_id || 'pre-checkout',
        request_id: data.request_id || null,
        recipient_type: 'ops_prenotify',
        timestamp: new Date().toISOString(),
    });
}
