import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdminAuth } from '../_lib/admin-auth.js';
import { supabase, logSupabaseUnavailable } from '../_lib/supabase.js';

/**
 * AEGIS Intelligence -- Admin Pending List (Night N7 Option β)
 * GET /api/admin/pending-list
 * Retourne la liste pending_generations status=pending joint diagnostic_requests.
 *
 * Auth : Basic Auth (ADMIN_PASSWORD env var).
 * Scope : dashboard JP /admin/pending-diagnostics.html.
 *
 * Response shape :
 *   {
 *     pending: [
 *       {
 *         id: "uuid-pending-gen",
 *         request_id: "uuid-diagnostic",
 *         created_at: "2026-04-23T...",
 *         diagnostic: { email, company, country, sector, paid_at, payment_id, invoice_number, lang }
 *       }
 *     ],
 *     count: number
 *   }
 *
 * Version : 1.0.0 -- 20260422 -- Mission Night N7
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!requireAdminAuth(req, res)) return;

    if (!supabase) {
        logSupabaseUnavailable('admin-pending-list');
        return res.status(503).json({ error: 'Database not configured' });
    }

    try {
        // Selection status pending uniquement, joint aux colonnes metier essentielles
        const { data, error } = await supabase
            .from('pending_generations')
            .select(`
                id,
                request_id,
                status,
                created_at,
                diagnostic_requests!inner (
                    request_id,
                    invoice_number,
                    email,
                    first_name,
                    last_name,
                    company,
                    country,
                    sector,
                    lang,
                    payment_id,
                    paid_at
                )
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error(JSON.stringify({
                event: 'admin_pending_list_error',
                error: error.message,
                timestamp: new Date().toISOString(),
            }));
            return res.status(500).json({ error: 'Query failed', details: error.message });
        }

        const pending = (data || []).map((row: unknown) => {
            const r = row as {
                id: string;
                request_id: string;
                status: string;
                created_at: string;
                diagnostic_requests: {
                    invoice_number: string;
                    email: string;
                    first_name: string | null;
                    last_name: string | null;
                    company: string | null;
                    country: string | null;
                    sector: string | null;
                    lang: string;
                    payment_id: string | null;
                    paid_at: string | null;
                };
            };
            return {
                id: r.id,
                request_id: r.request_id,
                status: r.status,
                created_at: r.created_at,
                diagnostic: {
                    invoice_number: r.diagnostic_requests.invoice_number,
                    email: r.diagnostic_requests.email,
                    first_name: r.diagnostic_requests.first_name,
                    last_name: r.diagnostic_requests.last_name,
                    company: r.diagnostic_requests.company,
                    country: r.diagnostic_requests.country,
                    sector: r.diagnostic_requests.sector,
                    lang: r.diagnostic_requests.lang,
                    payment_id: r.diagnostic_requests.payment_id,
                    paid_at: r.diagnostic_requests.paid_at,
                },
            };
        });

        return res.status(200).json({ pending, count: pending.length });
    } catch (err: unknown) {
        const msg = (err as { message?: string })?.message || 'unknown';
        console.error(JSON.stringify({
            event: 'admin_pending_list_exception',
            error: msg,
            timestamp: new Date().toISOString(),
        }));
        return res.status(500).json({ error: 'Internal error' });
    }
}
