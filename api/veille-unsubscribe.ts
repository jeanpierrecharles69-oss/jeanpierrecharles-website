import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, SUPABASE_ENABLED } from './_lib/supabase.js';
import { verifyUnsubscribe } from './_lib/veille-unsubscribe-token.js';

/**
 * AEGIS Intelligence -- VEILLE unsubscribe endpoint (N15-B1).
 *
 * GET  /api/veille-unsubscribe?rid=<request_id>&t=<token> -> desabo + page HTML confirmation
 * POST (List-Unsubscribe-Post one-click RFC 8058, rid+t en query)  -> desabo + 200 JSON
 *
 * Effet : veille_requests.unsubscribed_at = now() (status INCHANGE = cycle paiement).
 * distribute-veille-report filtre status='active' AND unsubscribed_at IS NULL.
 * Idempotent. Token HMAC verifie (anti-forge). Aucun secret en log, email masque.
 *
 * Note prefetch : un GET peut etre pre-charge (Outlook Safe Links / gmail) -> desabo accidentel
 * possible (risque MVP accepte, re-abonnement possible ; cf. admin-approve). Durcissement futur :
 * page de confirmation + bouton POST.
 *
 * Version : 1.0.0 -- 20260521 -- N15-B1 desabo one-click
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function maskEmail(e: string | null | undefined): string {
    if (!e) return '(none)';
    const [l, d] = e.split('@');
    return l && d ? `${l[0]}***@${d}` : '***';
}

function htmlPage(title: string, body: string, color: string): string {
    return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="font-family:'Segoe UI',system-ui,sans-serif;background:#f8fafc;margin:0;padding:48px 20px;color:#1e293b">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;text-align:center;border-top:4px solid ${color};box-shadow:0 1px 3px rgba(0,0,0,0.08)">
<div style="font-family:Georgia,serif;font-size:20px;font-weight:700;color:#1a2332;margin-bottom:6px">AEGIS Intelligence</div>
<h1 style="font-size:17px;margin:14px 0;color:#1a2332">${title}</h1>
<p style="font-size:14px;color:#64748b;line-height:1.6">${body}</p>
</div></body></html>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const isPost = req.method === 'POST';
    if (req.method !== 'GET' && !isPost) {
        return res.status(405).json({ error: 'method_not_allowed' });
    }

    const rid = String(req.query.rid ?? '').trim();
    const token = String(req.query.t ?? '').trim();

    const fail = (code: number, jsonReason: string, pageTitle: string, pageBody: string, color: string) => {
        if (isPost) return res.status(code).json({ error: jsonReason });
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(code).send(htmlPage(pageTitle, pageBody, color));
    };

    if (!UUID_REGEX.test(rid) || !verifyUnsubscribe(rid, token)) {
        return fail(400, 'invalid_token', 'Lien invalide', 'Ce lien de desabonnement est invalide ou incomplet. Pour toute demande : contact@jeanpierrecharles.com', '#dc2626');
    }
    if (!SUPABASE_ENABLED || !supabase) {
        return fail(503, 'unavailable', 'Service indisponible', 'Reessayez plus tard, ou ecrivez a contact@jeanpierrecharles.com', '#d97706');
    }

    let email: string | null = null;
    try {
        const { data, error } = await supabase
            .from('veille_requests')
            .update({ unsubscribed_at: new Date().toISOString() })
            .eq('request_id', rid)
            .is('unsubscribed_at', null)
            .select('email')
            .maybeSingle();
        if (error) {
            console.error(JSON.stringify({ event: 'veille_unsubscribe_update_error', request_id_prefix: rid.slice(0, 8), error: error.message || 'unknown', timestamp: new Date().toISOString() }));
            return fail(500, 'update_failed', 'Erreur', 'Une erreur est survenue. Ecrivez a contact@jeanpierrecharles.com', '#dc2626');
        }
        email = data?.email ?? null; // null = deja desabonne ou rid inconnu (idempotent)
    } catch (e: unknown) {
        console.error(JSON.stringify({ event: 'veille_unsubscribe_exception', request_id_prefix: rid.slice(0, 8), error: (e as { message?: string })?.message || 'unknown', timestamp: new Date().toISOString() }));
        return fail(500, 'exception', 'Erreur', 'Une erreur est survenue.', '#dc2626');
    }

    console.log(JSON.stringify({ event: 'veille_unsubscribe_ok', request_id_prefix: rid.slice(0, 8), recipient_masked: maskEmail(email), already_or_unknown: email === null, method: req.method, timestamp: new Date().toISOString() }));

    if (isPost) return res.status(200).json({ ok: true });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(htmlPage('Desabonnement confirme', 'Vous etes desabonne de la VEILLE reglementaire AEGIS Intelligence. Vous ne recevrez plus de rapports mensuels.<br><br>Pour vous reabonner : <a href="https://jeanpierrecharles.com" style="color:#2563eb">jeanpierrecharles.com</a>', '#059669'));
}
