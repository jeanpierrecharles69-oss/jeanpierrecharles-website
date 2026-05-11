import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdminAuth } from '../_lib/admin-auth.js';
import { supabase, logSupabaseUnavailable } from '../_lib/supabase.js';

/**
 * AEGIS Intelligence -- Admin Trigger Generation (Night N7 Option β + S4 N11 serverless)
 * POST /api/admin/trigger-generation
 * Body : { pending_generation_id: "uuid" }
 * Effet :
 *   1. UPDATE pending_generations.status='generating' + triggered_by + triggered_at (race-safe).
 *   2. Fire-and-forget POST /api/generate-diagnostic avec request_id (voie B serverless S4).
 * Retour : { ok, request_id, triggered_at, local_command (fallback PS1) }.
 *
 * Auth : Basic Auth (ADMIN_PASSWORD env var) pour ce endpoint admin.
 * Fire-and-forget interne : header x-admin-key (AEGIS_ADMIN_KEY) attendu par generate-diagnostic.ts.
 *
 * Transactionnel : race-condition safe via UPDATE ... WHERE status='pending'.
 *
 * Pipeline post-N11 S4 : trigger dashboard -> UPDATE pending_generations -> fire-and-forget
 * -> generate-diagnostic (paid->generating->Opus+jsPDF->mail->delivered).
 * Le PS1 `aegis-deliver-diagnostic.ps1` reste documente en fallback (`local_command` retourne)
 * pour cas degrade (lambda generate-diagnostic indispo).
 *
 * Version : 1.2.0 -- 20260511T1300 -- P0 fix : pipeline DIAGNOSTIC bloque, ajout
 *           fire-and-forget vers /api/generate-diagnostic (pattern mollie-webhook.ts:519-558).
 *           Avant : seul l'UPDATE Supabase etait fait, generate-diagnostic n'etait JAMAIS
 *           invoque depuis le dashboard -> client paye 250 EUR sans recevoir rapport.
 * Version : 1.1.0 -- 20260424 -- D_T2010_01 (Mission N8) :
 *           local_command emet desormais `-RequestId <uuid>` au lieu de
 *           `-PendingGenerationId <uuid>` pour aligner sur le contrat
 *           consomme par le script PS1 `aegis-deliver-diagnostic.ps1` v1.0.1
 *           (hors repo, non modifiable depuis ACDC -- cf. CLAUDE.md §API Claude).
 * Version : 1.0.0 -- 20260422 -- Mission Night N7
 */

// Base URL pour fire-and-forget interne (symetrique mollie-webhook.ts L46-52).
const WEBHOOK_BASE_URL = (() => {
    const env = process.env.VERCEL_ENV || 'development';
    if (env === 'production') return 'https://jeanpierrecharles.com';
    if (env === 'preview' && process.env.VERCEL_BRANCH_URL) {
        return `https://${process.env.VERCEL_BRANCH_URL}`;
    }
    return 'https://jeanpierrecharles.com';
})();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!requireAdminAuth(req, res)) return;

    if (!supabase) {
        logSupabaseUnavailable('admin-trigger-generation');
        return res.status(503).json({ error: 'Database not configured' });
    }

    try {
        const body = req.body || {};
        const pendingGenerationId = typeof body.pending_generation_id === 'string'
            ? body.pending_generation_id.trim()
            : '';

        if (!pendingGenerationId) {
            return res.status(400).json({ error: 'Missing pending_generation_id' });
        }

        // UUID format check defensif (regex relache, validation stricte cote DB)
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pendingGenerationId)) {
            return res.status(400).json({ error: 'Invalid pending_generation_id format' });
        }

        // Race-condition safe : update seulement si encore 'pending'
        const nowIso = new Date().toISOString();
        const { data, error } = await supabase
            .from('pending_generations')
            .update({
                status: 'generating',
                triggered_by: 'jp_manual',
                triggered_at: nowIso,
            })
            .eq('id', pendingGenerationId)
            .eq('status', 'pending')
            .select('id, request_id, status, triggered_at')
            .single();

        if (error) {
            // PGRST116 = no rows (deja triggered ou id invalide)
            if ((error as { code?: string }).code === 'PGRST116') {
                return res.status(409).json({
                    error: 'Already triggered or not found',
                    message: 'Cette génération a déjà été déclenchée ou l\'ID est invalide.',
                });
            }
            console.error(JSON.stringify({
                event: 'admin_trigger_generation_error',
                pending_generation_id: pendingGenerationId,
                error: error.message,
                timestamp: new Date().toISOString(),
            }));
            return res.status(500).json({ error: 'Update failed', details: error.message });
        }

        if (!data) {
            return res.status(409).json({
                error: 'Already triggered or not found',
                message: 'Cette génération a déjà été déclenchée ou l\'ID est invalide.',
            });
        }

        console.log(JSON.stringify({
            event: 'admin_trigger_generation_ok',
            pending_generation_id: pendingGenerationId,
            request_id: data.request_id,
            triggered_at: data.triggered_at,
            timestamp: nowIso,
        }));

        // S4 Mission N11 (P0 fix T1300) : fire-and-forget POST /api/generate-diagnostic.
        // generate-diagnostic.ts transitionne diagnostic_requests.status paid->generating->delivered,
        // genere le rapport Opus + jsPDF (~30-90s), envoie email PJ rapport+facture.
        // Pattern identique a mollie-webhook.ts L519-558 (AbortController 1500ms).
        const fireAndForgetRequestId = data.request_id;
        let fireAndForgetDispatched = false;
        if (process.env.AEGIS_ADMIN_KEY && fireAndForgetRequestId) {
            const triggerUrl = `${WEBHOOK_BASE_URL}/api/generate-diagnostic`;
            try {
                const ac = new AbortController();
                const abortTimer = setTimeout(() => ac.abort(), 1500);
                await fetch(triggerUrl, {
                    method: 'POST',
                    headers: {
                        'x-admin-key': process.env.AEGIS_ADMIN_KEY,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ request_id: fireAndForgetRequestId }),
                    signal: ac.signal,
                }).catch((fetchErr) => {
                    const errMsg = (fetchErr as Error)?.message || 'unknown';
                    const isAbort = (fetchErr as Error)?.name === 'AbortError'
                        || errMsg.includes('aborted');
                    console.log(JSON.stringify({
                        event: isAbort
                            ? 'admin_trigger_generation_fire_and_forget'
                            : 'admin_trigger_generation_network_error',
                        pending_generation_id: pendingGenerationId,
                        request_id: fireAndForgetRequestId,
                        target: triggerUrl,
                        error: isAbort ? null : errMsg,
                        timestamp: new Date().toISOString(),
                    }));
                });
                clearTimeout(abortTimer);
                fireAndForgetDispatched = true;
            } catch (te: unknown) {
                console.warn(JSON.stringify({
                    event: 'admin_trigger_generation_fire_and_forget_failed',
                    pending_generation_id: pendingGenerationId,
                    request_id: fireAndForgetRequestId,
                    error: (te as Error)?.message || 'unknown',
                    severity: 'warning',
                    timestamp: new Date().toISOString(),
                }));
            }
        } else if (!process.env.AEGIS_ADMIN_KEY) {
            console.warn(JSON.stringify({
                event: 'admin_trigger_generation_skipped_no_admin_key',
                pending_generation_id: pendingGenerationId,
                request_id: fireAndForgetRequestId,
                severity: 'critical',
                timestamp: new Date().toISOString(),
            }));
        }

        return res.status(200).json({
            ok: true,
            pending_generation_id: pendingGenerationId,
            request_id: data.request_id,
            triggered_at: data.triggered_at,
            serverless_dispatched: fireAndForgetDispatched,
            message: fireAndForgetDispatched
                ? 'Pipeline serverless declenche (fire-and-forget vers /api/generate-diagnostic). Rapport en cours de generation ~30-90s.'
                : 'Intention enregistree. Pipeline serverless NON declenche (AEGIS_ADMIN_KEY manquante). Fallback PS1 :',
            local_command: `aegis-deliver-diagnostic.ps1 -RequestId ${data.request_id}`,
            note: 'Pipeline normal : generate-diagnostic.ts (serverless 300s/1024MB) gere paid->generating->delivered + email. Fallback PS1 dans C:\\Projects\\aegis-ops\\scripts\\ uniquement si lambda indispo.',
        });
    } catch (err: unknown) {
        const msg = (err as { message?: string })?.message || 'unknown';
        console.error(JSON.stringify({
            event: 'admin_trigger_generation_exception',
            error: msg,
            timestamp: new Date().toISOString(),
        }));
        return res.status(500).json({ error: 'Internal error' });
    }
}
