import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdminAuth } from '../_lib/admin-auth.js';
import { supabase, logSupabaseUnavailable } from '../_lib/supabase.js';

/**
 * AEGIS Intelligence -- Admin Pending Complete (Mission N8, D_T2010_07 partiel)
 * POST /api/admin/pending-complete
 * Body : {
 *   pending_generation_id: "uuid",
 *   pdf_sha256?: "hex string 64 char",   // optionnel, log uniquement (pas de colonne DB dédiée)
 *   delivered_at?: "iso8601 timestamp"   // optionnel, défaut = now() serveur
 * }
 * Effet : UPDATE pending_generations SET status='generated', completed_at=<delivered_at || now()>
 *         WHERE id=? AND status='generating'  (race-condition safe)
 * Retour 200 : { success:true, id, status:'generated', completed_at }
 * Retour 404 : { error:'pending_generation_not_found' }
 * Retour 409 : { error:'invalid_state_transition', current_status, expected:'generating' }
 *
 * Auth : Basic Auth (ADMIN_PASSWORD env var).
 *
 * ⚠ L'appel depuis le pipeline PS1 `aegis-deliver-diagnostic.ps1` étape 7 est HORS scope
 * Mission N8 (script PS1 dans C:\Projects\aegis-ops\scripts\, interdit CLAUDE.md §API Claude).
 * En attendant, l'endpoint est appelable manuellement par JP :
 *   curl -u admin:$ADMIN_PASSWORD -X POST https://jeanpierrecharles.com/api/admin/pending-complete \
 *        -H "Content-Type: application/json" \
 *        -d '{"pending_generation_id":"<uuid>","pdf_sha256":"<hex>","delivered_at":"<iso>"}'
 *
 * Version : 1.0.0 -- 20260424 -- Mission N8 D_T2010_07-partial
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SHA256_HEX = /^[0-9a-f]{64}$/i;

function isValidIso8601(value: string): boolean {
    const d = new Date(value);
    return !isNaN(d.getTime()) && d.toISOString().length > 0;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!requireAdminAuth(req, res)) return;

    if (!supabase) {
        logSupabaseUnavailable('admin-pending-complete');
        return res.status(503).json({ error: 'Database not configured' });
    }

    try {
        const body = (req.body || {}) as {
            pending_generation_id?: unknown;
            pdf_sha256?: unknown;
            delivered_at?: unknown;
        };

        const pendingGenerationId = typeof body.pending_generation_id === 'string'
            ? body.pending_generation_id.trim()
            : '';

        if (!pendingGenerationId) {
            return res.status(400).json({ error: 'Missing pending_generation_id' });
        }
        if (!UUID_REGEX.test(pendingGenerationId)) {
            return res.status(400).json({ error: 'Invalid pending_generation_id format' });
        }

        // pdf_sha256 optionnel -- si fourni, validation stricte format
        const pdfSha256 = typeof body.pdf_sha256 === 'string' ? body.pdf_sha256.trim().toLowerCase() : '';
        if (pdfSha256 && !SHA256_HEX.test(pdfSha256)) {
            return res.status(400).json({ error: 'Invalid pdf_sha256 format (expected 64 hex chars)' });
        }

        // delivered_at optionnel -- si fourni, validation ISO8601, sinon now()
        const deliveredAtInput = typeof body.delivered_at === 'string' ? body.delivered_at.trim() : '';
        if (deliveredAtInput && !isValidIso8601(deliveredAtInput)) {
            return res.status(400).json({ error: 'Invalid delivered_at format (expected ISO 8601)' });
        }
        const completedAt = deliveredAtInput || new Date().toISOString();

        // Race-safe UPDATE : bascule 'generating' -> 'generated' uniquement si etat attendu
        const { data: updated, error: updateError } = await supabase
            .from('pending_generations')
            .update({
                status: 'generated',
                completed_at: completedAt,
            })
            .eq('id', pendingGenerationId)
            .eq('status', 'generating')
            .select('id, request_id, status, completed_at')
            .single();

        if (updateError) {
            // PGRST116 = no rows matched (id introuvable OU status != 'generating')
            if ((updateError as { code?: string }).code === 'PGRST116') {
                // Fallback SELECT pour différencier 404 (introuvable) vs 409 (mauvais état)
                const { data: existing, error: selectError } = await supabase
                    .from('pending_generations')
                    .select('id, status')
                    .eq('id', pendingGenerationId)
                    .maybeSingle();

                if (selectError) {
                    console.error(JSON.stringify({
                        event: 'pending_complete_error',
                        pending_generation_id: pendingGenerationId,
                        reason: 'select_fallback_failed',
                        http_status: 500,
                        details: selectError.message,
                        timestamp: new Date().toISOString(),
                    }));
                    return res.status(500).json({ error: 'Database error on fallback select' });
                }

                if (!existing) {
                    console.warn(JSON.stringify({
                        event: 'pending_complete_error',
                        pending_generation_id: pendingGenerationId,
                        reason: 'pending_generation_not_found',
                        http_status: 404,
                        timestamp: new Date().toISOString(),
                    }));
                    return res.status(404).json({ error: 'pending_generation_not_found' });
                }

                console.warn(JSON.stringify({
                    event: 'pending_complete_error',
                    pending_generation_id: pendingGenerationId,
                    reason: 'invalid_state_transition',
                    http_status: 409,
                    current_status: existing.status,
                    expected: 'generating',
                    timestamp: new Date().toISOString(),
                }));
                return res.status(409).json({
                    error: 'invalid_state_transition',
                    current_status: existing.status,
                    expected: 'generating',
                });
            }

            // Autre erreur SQL
            console.error(JSON.stringify({
                event: 'pending_complete_error',
                pending_generation_id: pendingGenerationId,
                reason: 'update_failed',
                http_status: 500,
                details: updateError.message,
                timestamp: new Date().toISOString(),
            }));
            return res.status(500).json({ error: 'Update failed', details: updateError.message });
        }

        if (!updated) {
            // Filet de sécurité -- ne devrait pas survenir sans PGRST116
            console.error(JSON.stringify({
                event: 'pending_complete_error',
                pending_generation_id: pendingGenerationId,
                reason: 'update_returned_no_row_no_error',
                http_status: 500,
                timestamp: new Date().toISOString(),
            }));
            return res.status(500).json({ error: 'Unexpected empty update result' });
        }

        console.log(JSON.stringify({
            event: 'pending_complete_success',
            pending_generation_id: pendingGenerationId,
            request_id: updated.request_id,
            previous_status: 'generating',
            new_status: updated.status,
            completed_at: updated.completed_at,
            pdf_sha256: pdfSha256 || null,
            timestamp: new Date().toISOString(),
        }));

        return res.status(200).json({
            success: true,
            id: updated.id,
            status: updated.status,
            completed_at: updated.completed_at,
        });
    } catch (err: unknown) {
        const msg = (err as { message?: string })?.message || 'unknown';
        console.error(JSON.stringify({
            event: 'pending_complete_exception',
            error: msg,
            timestamp: new Date().toISOString(),
        }));
        return res.status(500).json({ error: 'Internal error' });
    }
}
