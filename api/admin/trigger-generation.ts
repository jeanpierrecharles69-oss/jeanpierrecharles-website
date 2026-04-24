import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdminAuth } from '../_lib/admin-auth.js';
import { supabase, logSupabaseUnavailable } from '../_lib/supabase.js';

/**
 * AEGIS Intelligence -- Admin Trigger Generation (Night N7 Option β)
 * POST /api/admin/trigger-generation
 * Body : { pending_generation_id: "uuid" }
 * Effet : UPDATE pending_generations.status='generating' + triggered_by + triggered_at.
 * Retour : { ok, message avec commande PowerShell locale JP à exécuter }.
 *
 * Auth : Basic Auth (ADMIN_PASSWORD env var).
 * Transactionnel : race-condition safe via UPDATE ... WHERE status='pending'
 *   (Option β manuel : seul JP opère, collision improbable ; garde-fou défensif).
 *
 * ⚠ Ce endpoint NE déclenche PAS le pipeline PS (sous autorité JP).
 * Il marque l'intention JP + fournit la commande à exécuter localement.
 * PowerShell script `aegis-deliver-diagnostic.ps1` reste HORS repo (C:\Projects\aegis-ops\scripts\).
 *
 * Version : 1.1.0 -- 20260424 -- D_T2010_01 (Mission N8) :
 *           local_command émet désormais `-RequestId <uuid>` au lieu de
 *           `-PendingGenerationId <uuid>` pour aligner sur le contrat
 *           consommé par le script PS1 `aegis-deliver-diagnostic.ps1` v1.0.1
 *           (hors repo, non modifiable depuis ACDC -- cf. CLAUDE.md §API Claude).
 * Version : 1.0.0 -- 20260422 -- Mission Night N7
 */

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

        return res.status(200).json({
            ok: true,
            pending_generation_id: pendingGenerationId,
            request_id: data.request_id,
            triggered_at: data.triggered_at,
            message: 'Intention enregistrée. Exécutez localement :',
            local_command: `aegis-deliver-diagnostic.ps1 -RequestId ${data.request_id}`,
            note: 'Le script PowerShell est dans C:\\Projects\\aegis-ops\\scripts\\ (hors repo git, cf. CLAUDE.md §API Claude). Contrat PS1 v1.0.1 consomme -RequestId ; pending_generation_id reste tracé côté logs/UPDATE dashboard.',
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
