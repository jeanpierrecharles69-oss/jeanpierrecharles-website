import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import {
    clientConfirmationHtml,
    opsNewOrderHtml,
    opsPreNotifyHtml,
} from './email-templates.js';

/**
 * AEGIS Intelligence -- Shared Mailer Module
 * SMTP Gandi (port 465 SSL) — singleton transport, 3 fonctions envoi.
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
 * Version : 1.0.0 -- 20260416 -- MISSION-EXEC-DETTE6 CHANGE-02
 */

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
