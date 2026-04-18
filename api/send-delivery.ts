import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendDeliveryConfirmation } from './_lib/mailer.js';

/**
 * AEGIS Intelligence -- Send Delivery Email (FIX-03 + FIX-08 + NIGHT-N5 DETTE18)
 * POST /api/send-delivery
 * Protected by AEGIS_OPS_TOKEN (Bearer auth).
 * JP invokes via PowerShell after producing the DIAGNOSTIC report.
 *
 * Body JSON :
 *   { email, lang, invoice_number, download_url?, customer_name, customer_company,
 *     approved_by (required), approved_at?, pdf_sha256?, signature_note?,
 *     pdf_base64?, pdf_filename? }
 *
 * FIX-08 : signature digitale CGI (Compliance Gouvernance Intégrée) eIDAS Art. 25 SES.
 * NIGHT-N5 DETTE18 : piece jointe PDF directe (download_url devient optionnel).
 *   Mode PJ prefere ; download_url = fallback legacy.
 *
 * Version : 1.2.0 -- 20260418 -- NIGHT-N5 FAI-FIX DETTE18
 */

const OPS_TOKEN = process.env.AEGIS_OPS_TOKEN || '';
const PDF_MAX_BYTES = 20 * 1024 * 1024;
const BASE64_REGEX = /^[A-Za-z0-9+/]+=*$/;

function maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!local || !domain) return '***';
    return `${local[0]}***@${domain}`;
}

function sanitizeText(s: string, max: number): string {
    return s.replace(/[<>]/g, '').slice(0, max);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    if (!OPS_TOKEN) {
        console.error('send-delivery: AEGIS_OPS_TOKEN not configured');
        return res.status(500).json({ error: 'Server misconfigured' });
    }

    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ') || authHeader.slice(7) !== OPS_TOKEN) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const {
            email,
            lang,
            invoice_number,
            download_url,
            customer_name,
            customer_company,
            approved_by,
            approved_at,
            pdf_sha256,
            signature_note,
            pdf_base64,
            pdf_filename,
        } = req.body;

        if (!email || typeof email !== 'string') {
            return res.status(400).json({ error: 'Missing required field: email' });
        }
        // NIGHT-N5 DETTE18 : soit pdf_base64 (mode PJ prefere), soit download_url (fallback legacy)
        const hasBase64 = typeof pdf_base64 === 'string' && pdf_base64.length > 0;
        const hasUrl = typeof download_url === 'string' && download_url.length > 0;
        if (!hasBase64 && !hasUrl) {
            return res.status(400).json({ error: 'Missing delivery payload: pdf_base64 or download_url required' });
        }
        if (!approved_by || typeof approved_by !== 'string') {
            return res.status(400).json({ error: 'Missing required field: approved_by' });
        }
        const approvedByTrim = approved_by.trim();
        if (approvedByTrim.length < 2 || approvedByTrim.length > 100) {
            return res.status(400).json({ error: 'Invalid approved_by length (2-100)' });
        }

        let approvedAt = new Date().toISOString();
        if (approved_at !== undefined) {
            if (typeof approved_at !== 'string') {
                return res.status(400).json({ error: 'Invalid approved_at type' });
            }
            const parsed = Date.parse(approved_at);
            if (Number.isNaN(parsed)) {
                return res.status(400).json({ error: 'Invalid approved_at (ISO 8601 expected)' });
            }
            approvedAt = new Date(parsed).toISOString();
        }

        let sha256: string | undefined;
        if (pdf_sha256 !== undefined) {
            if (typeof pdf_sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(pdf_sha256)) {
                return res.status(400).json({ error: 'Invalid pdf_sha256 (64 hex chars)' });
            }
            sha256 = pdf_sha256.toLowerCase();
        }

        let note: string | undefined;
        if (signature_note !== undefined) {
            if (typeof signature_note !== 'string') {
                return res.status(400).json({ error: 'Invalid signature_note type' });
            }
            note = sanitizeText(signature_note, 200);
        }

        // NIGHT-N5 DETTE18 : validation base64 + taille
        let attachmentSize = 0;
        let pdfFilenameClean: string | undefined;
        if (hasBase64) {
            if (!BASE64_REGEX.test(pdf_base64)) {
                return res.status(400).json({ error: 'Invalid pdf_base64 (not base64)' });
            }
            attachmentSize = Math.floor((pdf_base64.length * 3) / 4) - (pdf_base64.endsWith('==') ? 2 : pdf_base64.endsWith('=') ? 1 : 0);
            if (attachmentSize > PDF_MAX_BYTES) {
                return res.status(400).json({ error: `PDF attachment too large (max ${PDF_MAX_BYTES} bytes, received ${attachmentSize})` });
            }
            if (pdf_filename !== undefined) {
                if (typeof pdf_filename !== 'string') {
                    return res.status(400).json({ error: 'Invalid pdf_filename type' });
                }
                // Sanitize: keep alnum, dash, underscore, dot, space; strip path separators
                pdfFilenameClean = pdf_filename.replace(/[^\w\-. ]/g, '').slice(0, 120);
                if (!pdfFilenameClean.toLowerCase().endsWith('.pdf')) {
                    pdfFilenameClean += '.pdf';
                }
            }
        }

        console.log(JSON.stringify({
            event: 'delivery_signed',
            invoice_number: invoice_number || null,
            approved_by: approvedByTrim,
            approved_at: approvedAt,
            pdf_sha256: sha256 || null,
            recipient_masked: maskEmail(email),
            has_attachment: hasBase64,
            attachment_size_bytes: attachmentSize || null,
            severity: 'info',
            timestamp: new Date().toISOString(),
        }));

        await sendDeliveryConfirmation({
            payment_id: `delivery-${Date.now()}`,
            email,
            lang: lang || 'fr',
            invoice_number: invoice_number || undefined,
            download_url: hasUrl ? download_url : undefined,
            customer_name: customer_name || undefined,
            customer_company: customer_company || undefined,
            approved_by: approvedByTrim,
            approved_at: approvedAt,
            pdf_sha256: sha256,
            signature_note: note,
            pdf_base64: hasBase64 ? pdf_base64 : undefined,
            pdf_filename: pdfFilenameClean,
        });

        return res.status(200).json({
            sent: true,
            approved_at: approvedAt,
            mode: hasBase64 ? 'attachment' : 'download_url',
        });

    } catch (error: any) {
        console.error('send-delivery error:', error.message);
        return res.status(500).json({ error: 'Send failed', message: error.message });
    }
}
