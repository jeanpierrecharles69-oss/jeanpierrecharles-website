import type { VercelRequest, VercelResponse } from '@vercel/node';
import { timingSafeEqual } from 'node:crypto';
import { supabase, logSupabaseUnavailable } from '../_lib/supabase.js';

/**
 * AEGIS Intelligence -- Admin Veille Queue (Phase C auto-queue)
 *
 * GET  /api/admin/veille-queue  -> liste VEILLE paid non actives (queue)
 * POST /api/admin/veille-queue  -> mute statut (activating/active/failed)
 *
 * Auth : header `x-admin-key` compare en timing-safe a process.env.AEGIS_ADMIN_KEY.
 * Scope : ops server-to-server (PS1 watchdog, n8n W4) -- pas browser, pas CORS.
 *
 * Calque generation-queue.ts (DIAGNOSTIC) avec adaptations VEILLE :
 *   - Table : veille_requests
 *   - Champs : sector, regulations, context, lang
 *   - Statuts cibles : 'activating' | 'active' | 'failed'
 *
 * Version : 1.0.0 -- 20260505T1645 -- Mission MISSION-EXEC WP3
 */

const RATE_LIMIT = 30;
const RATE_WINDOW = 60 * 1000;
const SUPABASE_TIMEOUT_MS = 5000;
const VALID_STATUSES = new Set(['activating', 'active', 'failed']);

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now > entry.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
        return false;
    }
    entry.count++;
    return entry.count > RATE_LIMIT;
}

function timingSafeStringEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    try {
        return timingSafeEqual(bufA, bufB);
    } catch {
        return false;
    }
}

function maskEmail(email: string | null | undefined): string {
    if (!email || typeof email !== 'string') return '***';
    const [local, domain] = email.split('@');
    if (!local || !domain) return '***';
    return `${local[0]}***@${domain}`;
}

function authorize(req: VercelRequest, res: VercelResponse): boolean {
    const expected = process.env.AEGIS_ADMIN_KEY;
    if (!expected) {
        console.error(JSON.stringify({
            event: 'admin_queue_misconfigured',
            context: 'veille-queue',
            reason: 'AEGIS_ADMIN_KEY not set',
            severity: 'critical',
            timestamp: new Date().toISOString(),
        }));
        res.status(401).json({ error: 'Unauthorized', reason: 'admin_key_not_configured' });
        return false;
    }
    const provided = req.headers['x-admin-key'];
    if (typeof provided !== 'string' || provided.length === 0) {
        res.status(401).json({ error: 'Unauthorized', reason: 'missing_admin_key' });
        return false;
    }
    if (!timingSafeStringEqual(provided, expected)) {
        console.warn(JSON.stringify({
            event: 'admin_queue_forbidden',
            context: 'veille-queue',
            ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown',
            timestamp: new Date().toISOString(),
        }));
        res.status(403).json({ error: 'Forbidden', reason: 'invalid_admin_key' });
        return false;
    }
    return true;
}

async function withTimeout<T>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> {
    const timeout = new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`${label}_timeout_${ms}ms`)), ms)
    );
    return Promise.race([promise as Promise<T>, timeout]);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
        || req.socket?.remoteAddress || 'unknown';
    if (isRateLimited(clientIp)) {
        return res.status(429).json({ error: 'Too many requests' });
    }

    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!authorize(req, res)) return;

    if (!supabase) {
        logSupabaseUnavailable('admin-veille-queue');
        return res.status(503).json({ error: 'Database not configured' });
    }

    if (req.method === 'GET') {
        try {
            const query = supabase
                .from('veille_requests')
                .select('request_id, email, invoice_number, sector, regulations, context, lang, paid_at')
                .eq('status', 'paid')
                .order('paid_at', { ascending: true })
                .limit(100);

            const { data, error } = await withTimeout(query, SUPABASE_TIMEOUT_MS, 'supabase_select');

            if (error) {
                console.error(JSON.stringify({
                    event: 'admin_veille_queue_error',
                    error: error.message,
                    timestamp: new Date().toISOString(),
                }));
                return res.status(500).json({ error: 'Query failed' });
            }

            const queue = (data || []).map((row: Record<string, unknown>) => ({
                request_id: row.request_id,
                email: row.email,
                invoice_number: row.invoice_number,
                sector: row.sector,
                regulations: row.regulations,
                context: row.context,
                lang: row.lang,
                paid_at: row.paid_at,
            }));

            console.log(JSON.stringify({
                event: 'admin_veille_queue_listed',
                count: queue.length,
                first_email_masked: queue.length > 0 ? maskEmail(queue[0].email as string) : null,
                timestamp: new Date().toISOString(),
            }));

            return res.status(200).json({ queue, count: queue.length });
        } catch (err: unknown) {
            const msg = (err as { message?: string })?.message || 'unknown';
            console.error(JSON.stringify({
                event: 'admin_veille_queue_exception',
                error: msg,
                timestamp: new Date().toISOString(),
            }));
            return res.status(500).json({ error: 'Internal error' });
        }
    }

    // POST
    try {
        const body = req.body || {};
        const requestId = typeof body.request_id === 'string' ? body.request_id.trim() : '';
        const status = typeof body.status === 'string' ? body.status.trim() : '';
        const errMsg = typeof body.error === 'string' ? body.error.slice(0, 500) : null;

        if (!requestId) {
            return res.status(400).json({ error: 'Missing request_id' });
        }
        if (!VALID_STATUSES.has(status)) {
            return res.status(400).json({
                error: 'Invalid status',
                allowed: Array.from(VALID_STATUSES),
            });
        }

        const updatePayload: Record<string, unknown> = {
            status,
            updated_at: new Date().toISOString(),
        };
        if (status === 'failed' && errMsg) {
            updatePayload.last_error = errMsg;
        }
        if (status === 'active') {
            updatePayload.activated_at = new Date().toISOString();
        }

        const updateQuery = supabase
            .from('veille_requests')
            .update(updatePayload)
            .eq('request_id', requestId)
            .select('request_id')
            .single();

        const { data, error } = await withTimeout(updateQuery, SUPABASE_TIMEOUT_MS, 'supabase_update');

        if (error) {
            const code = (error as { code?: string }).code;
            if (code === 'PGRST116' || !data) {
                console.warn(JSON.stringify({
                    event: 'admin_veille_queue_not_found',
                    request_id: requestId,
                    timestamp: new Date().toISOString(),
                }));
                return res.status(404).json({ ok: false, error: 'not_found' });
            }
            const errMessage = (error as { message?: string }).message || 'unknown';
            console.error(JSON.stringify({
                event: 'admin_veille_queue_update_error',
                request_id: requestId,
                error: errMessage,
                timestamp: new Date().toISOString(),
            }));
            return res.status(500).json({ ok: false, error: 'update_failed' });
        }

        console.log(JSON.stringify({
            event: 'admin_veille_queue_updated',
            request_id: requestId,
            status,
            timestamp: new Date().toISOString(),
        }));

        return res.status(200).json({ ok: true, request_id: requestId, status });
    } catch (err: unknown) {
        const msg = (err as { message?: string })?.message || 'unknown';
        console.error(JSON.stringify({
            event: 'admin_veille_queue_post_exception',
            error: msg,
            timestamp: new Date().toISOString(),
        }));
        return res.status(500).json({ error: 'Internal error' });
    }
}
