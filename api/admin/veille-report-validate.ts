import type { VercelRequest, VercelResponse } from '@vercel/node';
import { timingSafeEqual } from 'node:crypto';
import { supabase, SUPABASE_ENABLED } from '../_lib/supabase.js';

/**
 * AEGIS Intelligence -- VEILLE Report Validate (S5 Mission N11)
 *
 * POST /api/admin/veille-report-validate
 *   Headers : x-admin-key
 *   Body : { report_id: "uuid" }
 *
 * Action : UPDATE veille_reports SET status='validated', validated_at=NOW()
 * Pre-requis : status courant = 'draft'.
 *
 * Step 3 du workflow JP page admin : entre "Generer" et "Distribuer".
 *
 * Version : 1.0.0 -- 20260508 -- creation S5
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

function authorize(req: VercelRequest, res: VercelResponse): boolean {
    const expected = process.env.AEGIS_ADMIN_KEY;
    if (!expected) {
        console.error(JSON.stringify({
            event: 'veille_validate_misconfigured',
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
        res.status(403).json({ error: 'Forbidden', reason: 'invalid_admin_key' });
        return false;
    }
    return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
    if (!authorize(req, res)) return;
    if (!SUPABASE_ENABLED || !supabase) return res.status(503).json({ error: 'supabase_unavailable' });

    const body = req.body || {};
    const reportId = typeof body.report_id === 'string' ? body.report_id : '';
    if (!UUID_REGEX.test(reportId)) {
        return res.status(400).json({ error: 'invalid_report_id' });
    }

    const { data: row, error: selErr } = await supabase
        .from('veille_reports')
        .select('id, status, edition, lang')
        .eq('id', reportId)
        .maybeSingle();

    if (selErr) {
        console.error(JSON.stringify({
            event: 'veille_validate_select_failed',
            report_id: reportId,
            error: selErr.message || 'unknown',
            timestamp: new Date().toISOString(),
        }));
        return res.status(500).json({ error: 'supabase_select_failed' });
    }
    if (!row) return res.status(404).json({ error: 'report_not_found' });

    const status = (row as { status: string }).status;
    if (status === 'validated' || status === 'distributed') {
        // Idempotent : already validated, return ok
        return res.status(200).json({
            report_id: reportId,
            status,
            already: true,
        });
    }
    if (status !== 'draft') {
        return res.status(409).json({ error: 'invalid_status', current: status });
    }

    const { error: upErr } = await supabase
        .from('veille_reports')
        .update({ status: 'validated', validated_at: new Date().toISOString() })
        .eq('id', reportId)
        .eq('status', 'draft');

    if (upErr) {
        console.error(JSON.stringify({
            event: 'veille_validate_update_failed',
            report_id: reportId,
            error: upErr.message || 'unknown',
            timestamp: new Date().toISOString(),
        }));
        return res.status(500).json({ error: 'update_failed' });
    }

    console.log(JSON.stringify({
        event: 'veille_validate_ok',
        report_id: reportId,
        edition: (row as { edition?: string }).edition || null,
        lang: (row as { lang?: string }).lang || null,
        timestamp: new Date().toISOString(),
    }));

    return res.status(200).json({
        report_id: reportId,
        status: 'validated',
    });
}
