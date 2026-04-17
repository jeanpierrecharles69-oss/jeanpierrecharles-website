import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendDeliveryConfirmation } from './_lib/mailer.js';

/**
 * AEGIS Intelligence -- Send Delivery Email (FIX-03 + FIX-08)
 * POST /api/send-delivery
 * Protected by AEGIS_OPS_TOKEN (Bearer auth).
 * JP invokes via PowerShell after producing the DIAGNOSTIC report.
 *
 * Body JSON :
 *   { email, lang, invoice_number, download_url, customer_name, customer_company,
 *     approved_by (required), approved_at?, pdf_sha256?, signature_note? }
 *
 * FIX-08 : signature digitale CGI (Compliance Gouvernance Intégrée) eIDAS Art. 25 SES.
 *
 * Version : 1.1.0 -- 20260417 -- MISSION-EXEC-V346 FIX-08
 */

const OPS_TOKEN = process.env.AEGIS_OPS_TOKEN || '';

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
        } = req.body;

        if (!email || typeof email !== 'string') {
            return res.status(400).json({ error: 'Missing required field: email' });
        }
        if (!download_url || typeof download_url !== 'string') {
            return res.status(400).json({ error: 'Missing required field: download_url' });
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

        console.log(JSON.stringify({
            event: 'delivery_signed',
            invoice_number: invoice_number || null,
            approved_by: approvedByTrim,
            approved_at: approvedAt,
            pdf_sha256: sha256 || null,
            recipient_masked: maskEmail(email),
            severity: 'info',
            timestamp: new Date().toISOString(),
        }));

        await sendDeliveryConfirmation({
            payment_id: `delivery-${Date.now()}`,
            email,
            lang: lang || 'fr',
            invoice_number: invoice_number || undefined,
            download_url,
            customer_name: customer_name || undefined,
            customer_company: customer_company || undefined,
            approved_by: approvedByTrim,
            approved_at: approvedAt,
            pdf_sha256: sha256,
            signature_note: note,
        });

        return res.status(200).json({
            sent: true,
            approved_at: approvedAt,
        });

    } catch (error: any) {
        console.error('send-delivery error:', error.message);
        return res.status(500).json({ error: 'Send failed', message: error.message });
    }
}
