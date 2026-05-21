import type { VercelRequest, VercelResponse } from '@vercel/node';
import { timingSafeEqual } from 'node:crypto';
import { supabase, SUPABASE_ENABLED } from './_lib/supabase.js';
import { sendDiagnosticDelivery } from './_lib/mailer.js';

/**
 * AEGIS Intelligence -- G3 QA Gate Admin Approve (D_T0955_G3_01).
 *
 * Endpoint GET cliquable depuis email JP de notification QA :
 *   GET /api/admin-approve?token=<UUID>&action=approve|reject&key=<AEGIS_ADMIN_KEY>
 *
 * Pipeline :
 *   1. Valider key (timingSafeEqual vs AEGIS_ADMIN_KEY) + action (approve|reject) + token (UUID)
 *   2. SELECT diagnostic_requests WHERE qa_token=token AND qa_status='pending'
 *   3. approve : SELECT facture, sendDiagnosticDelivery client, UPDATE qa_status='approved'
 *                + status='delivered' + delivered_at + vider pdf_base64
 *   4. reject  : UPDATE qa_status='rejected' + status='failed' + vider pdf_base64
 *   5. Page HTML responsive (succes / erreur / deja traite)
 *
 * Securite double : token UUID imprevisible + AEGIS_ADMIN_KEY query param.
 *
 * Edge case crawler email : Outlook safe-links pourrait pre-fetch GET et
 * declencher approval involontaire. Risque accepte pour MVP G3 (boite JP perso).
 *
 * Version : 1.1.0 -- 20260521 -- N14 Phase 2 C1 : parite livraison DIAG -- SELECT pdf_url + pass download_url a sendDiagnosticDelivery (lien Storage en complement de la PJ)
 * Version : 1.0.0 -- 20260515 -- Mission G3 QA Gate Approbation
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

function htmlPage(opts: {
    title: string;
    headline: string;
    body: string;
    color: 'green' | 'red' | 'amber';
}): string {
    const palette = {
        green: { bg: '#16a34a', soft: '#ecfdf5', border: '#6ee7b7', text: '#14532d' },
        red: { bg: '#dc2626', soft: '#fef2f2', border: '#fecaca', text: '#7f1d1d' },
        amber: { bg: '#f59e0b', soft: '#fef3c7', border: '#fbbf24', text: '#92400e' },
    }[opts.color];
    return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${opts.title} &mdash; AEGIS QA Gate</title></head>
<body style="font-family:'Segoe UI',system-ui,sans-serif;color:#0f172a;background:#f8fafc;margin:0;padding:40px 20px">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
<div style="background:${palette.bg};padding:28px 24px;text-align:center;color:#fff">
<h1 style="margin:0;font-size:20px;font-weight:800">${opts.headline}</h1>
<p style="margin:6px 0 0;font-size:12px;opacity:0.9">AEGIS Intelligence &mdash; G3 QA Gate</p>
</div>
<div style="padding:28px 24px">
<div style="background:${palette.soft};border:1px solid ${palette.border};border-radius:10px;padding:16px;color:${palette.text};font-size:14px;line-height:1.6">
${opts.body}
</div>
<p style="font-size:12px;color:#94a3b8;margin-top:24px;text-align:center">Vous pouvez fermer cette page.</p>
</div>
</div></body></html>`;
}

function escape(str: string): string {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function sendHtml(res: VercelResponse, status: number, html: string): void {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.status(status).send(html);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return sendHtml(res, 405, htmlPage({
            title: 'Methode non autorisee',
            headline: 'Methode HTTP non autorisee',
            body: 'Seul GET est accepte sur cet endpoint.',
            color: 'red',
        }));
    }

    // 1. Valider AEGIS_ADMIN_KEY
    const expectedKey = process.env.AEGIS_ADMIN_KEY;
    if (!expectedKey) {
        console.error(JSON.stringify({
            event: 'admin_approve_misconfigured',
            reason: 'AEGIS_ADMIN_KEY not set',
            severity: 'critical',
            timestamp: new Date().toISOString(),
        }));
        return sendHtml(res, 500, htmlPage({
            title: 'Configuration manquante',
            headline: 'Erreur de configuration',
            body: 'AEGIS_ADMIN_KEY non configure cote serveur.',
            color: 'red',
        }));
    }

    const providedKey = typeof req.query.key === 'string' ? req.query.key : '';
    if (!providedKey || !timingSafeStringEqual(providedKey, expectedKey)) {
        console.warn(JSON.stringify({
            event: 'admin_approve_forbidden',
            reason: 'invalid_admin_key',
            ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown',
            timestamp: new Date().toISOString(),
        }));
        return sendHtml(res, 403, htmlPage({
            title: 'Acces refuse',
            headline: 'Acces refuse',
            body: 'Cle d\'administration invalide ou manquante.',
            color: 'red',
        }));
    }

    // 2. Valider action + token
    const action = typeof req.query.action === 'string' ? req.query.action : '';
    const token = typeof req.query.token === 'string' ? req.query.token : '';
    if (action !== 'approve' && action !== 'reject') {
        return sendHtml(res, 400, htmlPage({
            title: 'Action invalide',
            headline: 'Action invalide',
            body: 'Le parametre <code>action</code> doit valoir <code>approve</code> ou <code>reject</code>.',
            color: 'red',
        }));
    }
    if (!UUID_REGEX.test(token)) {
        return sendHtml(res, 400, htmlPage({
            title: 'Token invalide',
            headline: 'Token invalide',
            body: 'Le parametre <code>token</code> n\'est pas un UUID valide.',
            color: 'red',
        }));
    }

    if (!SUPABASE_ENABLED || !supabase) {
        return sendHtml(res, 503, htmlPage({
            title: 'Base indisponible',
            headline: 'Base de donnees indisponible',
            body: 'Supabase n\'est pas configure cote serveur.',
            color: 'red',
        }));
    }

    // 3. SELECT diagnostic_requests WHERE qa_token=token AND qa_status='pending'
    const { data: row, error: selErr } = await supabase
        .from('diagnostic_requests')
        .select('request_id, invoice_number, status, qa_status, qa_token, email, first_name, last_name, company, lang, payment_id, pdf_base64, pdf_url')
        .eq('qa_token', token)
        .maybeSingle();

    if (selErr) {
        console.error(JSON.stringify({
            event: 'admin_approve_select_failed',
            error: selErr.message || 'unknown',
            timestamp: new Date().toISOString(),
        }));
        return sendHtml(res, 500, htmlPage({
            title: 'Erreur SQL',
            headline: 'Erreur lors de la recherche',
            body: `Erreur SQL : <code>${escape(selErr.message || 'unknown')}</code>`,
            color: 'red',
        }));
    }
    if (!row) {
        return sendHtml(res, 404, htmlPage({
            title: 'Token introuvable',
            headline: 'Token introuvable',
            body: 'Aucune demande DIAGNOSTIC n\'est associee a ce token.',
            color: 'amber',
        }));
    }

    type Row = {
        request_id: string;
        invoice_number: string;
        status: string;
        qa_status: string;
        qa_token: string;
        email: string;
        first_name: string | null;
        last_name: string | null;
        company: string | null;
        lang: string;
        payment_id: string | null;
        pdf_base64: string | null;
        pdf_url: string | null;
    };
    const requestRow = row as Row;

    if (requestRow.qa_status !== 'pending') {
        return sendHtml(res, 409, htmlPage({
            title: 'Deja traite',
            headline: 'Demande deja traitee',
            body: `Cette demande est deja en statut <strong>${escape(requestRow.qa_status)}</strong>. Aucune action effectuee.<br>Facture : <code>${escape(requestRow.invoice_number)}</code>`,
            color: 'amber',
        }));
    }

    const customerName = [requestRow.first_name, requestRow.last_name].filter(Boolean).join(' ') || 'Client';
    const lang = (requestRow.lang === 'en' ? 'en' : 'fr') as 'fr' | 'en';

    // 4a. action=reject
    if (action === 'reject') {
        const { error: rejErr } = await supabase
            .from('diagnostic_requests')
            .update({
                qa_status: 'rejected',
                status: 'failed',
                pdf_base64: null,
                updated_at: new Date().toISOString(),
            })
            .eq('request_id', requestRow.request_id);

        if (rejErr) {
            console.error(JSON.stringify({
                event: 'admin_approve_reject_update_failed',
                request_id: requestRow.request_id,
                error: rejErr.message || 'unknown',
                timestamp: new Date().toISOString(),
            }));
            return sendHtml(res, 500, htmlPage({
                title: 'Erreur rejet',
                headline: 'Erreur lors du rejet',
                body: `Erreur SQL : <code>${escape(rejErr.message || 'unknown')}</code>`,
                color: 'red',
            }));
        }

        console.log(JSON.stringify({
            event: 'admin_approve_rejected',
            request_id: requestRow.request_id,
            invoice_number: requestRow.invoice_number,
            timestamp: new Date().toISOString(),
        }));

        return sendHtml(res, 200, htmlPage({
            title: 'DIAGNOSTIC rejete',
            headline: 'DIAGNOSTIC rejete',
            body: `La demande <code>${escape(requestRow.invoice_number)}</code> a ete <strong>rejetee</strong>. Aucun email n'a ete envoye au client.<br><br>Action manuelle requise : contacter le client (${escape(requestRow.email)}) pour notification ou re-generation.`,
            color: 'red',
        }));
    }

    // 4b. action=approve
    if (!requestRow.pdf_base64) {
        return sendHtml(res, 500, htmlPage({
            title: 'PDF manquant',
            headline: 'PDF manquant',
            body: `Le rapport PDF n'est pas stocke pour <code>${escape(requestRow.invoice_number)}</code>. Re-generer via /api/generate-diagnostic.`,
            color: 'red',
        }));
    }

    // SELECT facture pour PJ
    let invoicePdfBase64: string | undefined;
    let invoicePdfFilename: string | undefined;
    {
        const { data: invRow, error: invErr } = await supabase
            .from('invoices')
            .select('pdf_base64, invoice_number')
            .eq('invoice_number', requestRow.invoice_number)
            .maybeSingle();
        if (invErr) {
            console.warn(JSON.stringify({
                event: 'admin_approve_invoice_select_failed',
                request_id: requestRow.request_id,
                invoice_number: requestRow.invoice_number,
                error: invErr.message || 'unknown',
                severity: 'warning',
                timestamp: new Date().toISOString(),
            }));
        } else if (invRow && invRow.pdf_base64) {
            invoicePdfBase64 = invRow.pdf_base64;
            invoicePdfFilename = `Facture_AEGIS_${invRow.invoice_number}.pdf`;
        }
    }

    // sendDiagnosticDelivery au client
    try {
        await sendDiagnosticDelivery({
            payment_id: requestRow.payment_id || 'N/A',
            request_id: requestRow.request_id,
            email: requestRow.email,
            customer_name: customerName,
            customer_company: requestRow.company || undefined,
            invoice_number: requestRow.invoice_number,
            amount: '250.00',
            lang,
            report_pdf_base64: requestRow.pdf_base64,
            report_pdf_filename: `AEGIS-DIAGNOSTIC-${requestRow.invoice_number}.pdf`,
            pdf_base64: invoicePdfBase64,
            pdf_filename: invoicePdfFilename,
            download_url: requestRow.pdf_url || undefined, // N14 C1 : lien Storage en complement de la PJ (parite VEILLE)
        });
    } catch (mailErr: unknown) {
        const reason = (mailErr as { message?: string })?.message || 'mail_unknown_error';
        console.error(JSON.stringify({
            event: 'admin_approve_delivery_mail_failed',
            request_id: requestRow.request_id,
            error: reason,
            severity: 'critical',
            timestamp: new Date().toISOString(),
        }));
        return sendHtml(res, 502, htmlPage({
            title: 'Echec email client',
            headline: 'Echec envoi email client',
            body: `Le rapport n'a pas pu etre envoye au client : <code>${escape(reason)}</code><br><br>qa_status reste <strong>pending</strong>. Reessayer en cliquant a nouveau APPROUVER.`,
            color: 'red',
        }));
    }

    // UPDATE qa_status='approved' + status='delivered' + email_sent_at + vider pdf_base64
    // P2-PIPE-03 fix (20260518T1625) : email_sent_at pose ici car sendDiagnosticDelivery
    // a reussi L291-304 (try/catch + early return 502 si echec). Sans cette ligne,
    // diagnostic-deliver.ts L280-303 (idempotence CE-01 v1.1 triphasique ETAT B) verrait
    // email_sent_at NULL malgre delivered_at OK et renverrait l'email en double sur retry.
    const nowIso = new Date().toISOString();
    const { error: appErr } = await supabase
        .from('diagnostic_requests')
        .update({
            qa_status: 'approved',
            qa_approved_at: nowIso,
            status: 'delivered',
            delivered_at: nowIso,
            email_sent_at: nowIso,
            pdf_base64: null,
            updated_at: nowIso,
        })
        .eq('request_id', requestRow.request_id);

    if (appErr) {
        console.warn(JSON.stringify({
            event: 'admin_approve_final_update_failed',
            request_id: requestRow.request_id,
            error: appErr.message || 'unknown',
            severity: 'warning',
            timestamp: new Date().toISOString(),
        }));
        // Email envoye OK : ne pas faire echouer l'UI pour un bug UPDATE
    }

    console.log(JSON.stringify({
        event: 'admin_approve_delivered',
        request_id: requestRow.request_id,
        invoice_number: requestRow.invoice_number,
        timestamp: new Date().toISOString(),
    }));

    return sendHtml(res, 200, htmlPage({
        title: 'DIAGNOSTIC livre',
        headline: 'DIAGNOSTIC livre au client',
        body: `Le rapport <code>${escape(requestRow.invoice_number)}</code> a ete <strong>envoye au client</strong> (${escape(requestRow.email)}) avec rapport et facture en pieces jointes.<br><br>Statut Supabase : <code>delivered</code> &mdash; <code>qa_status: approved</code>.`,
        color: 'green',
    }));
}
