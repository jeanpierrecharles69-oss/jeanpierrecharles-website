import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, SUPABASE_ENABLED } from './_lib/supabase.js';

/**
 * AEGIS Intelligence -- Diagnostic Status Endpoint
 * GET /api/diagnostic-status?request_id=<uuid>
 *   or  /api/diagnostic-status?invoice_number=AEGIS-YYYYMMDD-HHMM
 *
 * Protected by AEGIS_OPS_TOKEN (Bearer auth, meme pattern que send-delivery).
 * Consomme par C:\Projects\aegis-ops\scripts\aegis-deliver-diagnostic.ps1 (Phase C).
 *
 * SECURITE :
 *  - Bearer AEGIS_OPS_TOKEN obligatoire (jamais d'acces anon)
 *  - JP operator only (pas exposure client)
 *  - Log masque de l'email dans les sorties
 *
 * Version : 1.0.0 -- 20260418 -- NIGHT-N5 FAI-FIX Phase B4
 */

const OPS_TOKEN = process.env.AEGIS_OPS_TOKEN || '';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const INVOICE_REGEX = /^AEGIS-\d{8}-\d{4}$/;

function maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!local || !domain) return '***';
    return `${local[0]}***@${domain}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!OPS_TOKEN) {
        console.error('diagnostic-status: AEGIS_OPS_TOKEN not configured');
        return res.status(500).json({ error: 'Server misconfigured' });
    }

    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ') || authHeader.slice(7) !== OPS_TOKEN) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!SUPABASE_ENABLED || !supabase) {
        return res.status(503).json({
            error: 'Supabase not configured',
            hint: 'Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY on Vercel',
        });
    }

    const requestId = typeof req.query.request_id === 'string' ? req.query.request_id.trim() : '';
    const invoiceNumber = typeof req.query.invoice_number === 'string' ? req.query.invoice_number.trim() : '';

    if (!requestId && !invoiceNumber) {
        return res.status(400).json({ error: 'Missing query param: request_id or invoice_number' });
    }
    if (requestId && !UUID_REGEX.test(requestId)) {
        return res.status(400).json({ error: 'Invalid request_id (UUID expected)' });
    }
    if (invoiceNumber && !INVOICE_REGEX.test(invoiceNumber)) {
        return res.status(400).json({ error: 'Invalid invoice_number (format AEGIS-YYYYMMDD-HHMM)' });
    }

    try {
        const query = supabase.from('diagnostic_requests').select('*').limit(1);
        const { data, error } = requestId
            ? await query.eq('request_id', requestId)
            : await query.eq('invoice_number', invoiceNumber);

        if (error) {
            console.error(JSON.stringify({
                event: 'diagnostic_status_error',
                error: error.message,
                timestamp: new Date().toISOString(),
            }));
            return res.status(500).json({ error: 'Database error', message: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Not found' });
        }

        const row = data[0];

        console.log(JSON.stringify({
            event: 'diagnostic_status_read',
            request_id: row.request_id,
            invoice_number: row.invoice_number,
            status: row.status,
            recipient_masked: row.email ? maskEmail(row.email) : null,
            timestamp: new Date().toISOString(),
        }));

        return res.status(200).json({ data: row });

    } catch (error: any) {
        console.error('diagnostic-status error:', error?.message);
        return res.status(500).json({ error: 'Internal error' });
    }
}
