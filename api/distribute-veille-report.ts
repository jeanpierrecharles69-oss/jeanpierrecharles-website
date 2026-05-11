import type { VercelRequest, VercelResponse } from '@vercel/node';
import { timingSafeEqual } from 'node:crypto';
import { supabase, SUPABASE_ENABLED } from './_lib/supabase.js';
import { sendVeilleMonthlyReport } from './_lib/mailer.js';

/**
 * AEGIS Intelligence -- Distribute VEILLE Monthly Report (S5 Mission N11)
 *
 * POST /api/distribute-veille-report
 *   Headers : x-admin-key (timing-safe vs AEGIS_ADMIN_KEY)
 *   Body : { report_id: "uuid" }
 *
 * Pipeline :
 *   1. Auth + lookup veille_reports (must be status='validated')
 *   2. SELECT veille_requests WHERE status='active' AND lang = report.lang
 *   3. Pour chaque abonne :
 *      a. INSERT (or skip) veille_distributions row (idempotence via UNIQUE INDEX)
 *      b. sendVeilleMonthlyReport (email + PJ PDF)
 *      c. UPDATE distribution status='sent' ou 'failed' + sent_at + error_message
 *   4. UPDATE veille_reports : status='distributed', distributed_at=NOW()
 *      (uniquement si au moins 1 envoi ok ; si 100% failed, status reste 'validated')
 *   5. Return { distributed: ok_count, failed: fail_count, skipped: already_sent_count }
 *
 * Vercel : maxDuration 300s (vercel.json) — N abonnes x ~1s/email.
 *
 * Re-execution : safe via UNIQUE INDEX uniq_veille_distributions_report_subscriber.
 * Si une distribution etait failed, on re-tente (UPDATE). Si etait sent, on skip.
 *
 * Version : 1.0.0 -- 20260508 -- creation S5
 */

export const config = { maxDuration: 300, memory: 512 };

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
            event: 'distribute_veille_report_misconfigured',
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

interface VeilleReportRow {
    id: string;
    edition: string;
    lang: 'fr' | 'en';
    pdf_base64: string | null;
    status: 'draft' | 'validated' | 'distributed';
}

interface VeilleSubscriberRow {
    request_id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    company: string | null;
    lang: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
    if (!authorize(req, res)) return;

    if (!SUPABASE_ENABLED || !supabase) {
        return res.status(503).json({ error: 'supabase_unavailable' });
    }

    const body = req.body || {};
    const reportId = typeof body.report_id === 'string' ? body.report_id : '';
    if (!UUID_REGEX.test(reportId)) {
        return res.status(400).json({ error: 'invalid_report_id' });
    }

    // 1. SELECT report
    const { data: reportData, error: reportErr } = await supabase
        .from('veille_reports')
        .select('id, edition, lang, pdf_base64, status')
        .eq('id', reportId)
        .maybeSingle();

    if (reportErr) {
        console.error(JSON.stringify({
            event: 'distribute_veille_report_select_failed',
            report_id: reportId,
            error: reportErr.message || 'unknown',
            timestamp: new Date().toISOString(),
        }));
        return res.status(500).json({ error: 'supabase_select_failed' });
    }
    if (!reportData) {
        return res.status(404).json({ error: 'report_not_found' });
    }

    const report = reportData as VeilleReportRow;
    if (report.status !== 'validated' && report.status !== 'distributed') {
        return res.status(409).json({
            error: 'invalid_status',
            current: report.status,
            message: 'Le rapport doit etre status=validated avant distribution.',
        });
    }
    if (!report.pdf_base64) {
        return res.status(409).json({ error: 'pdf_missing', message: 'pdf_base64 vide dans veille_reports.' });
    }

    const monthLabel = report.edition.replace(/^(\d{4})-(\d{2}).*/, (_, y, m) => `${m}/${y}`);
    const editionSafe = report.edition.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60);
    const filename = `AEGIS-VEILLE-${editionSafe}-${report.lang}.pdf`;

    // 2. SELECT subscribers actifs avec lang matching
    const { data: subs, error: subsErr } = await supabase
        .from('veille_requests')
        .select('request_id, email, first_name, last_name, company, lang')
        .eq('status', 'active')
        .eq('lang', report.lang);

    if (subsErr) {
        console.error(JSON.stringify({
            event: 'distribute_veille_report_subs_select_failed',
            report_id: reportId,
            error: subsErr.message || 'unknown',
            timestamp: new Date().toISOString(),
        }));
        return res.status(500).json({ error: 'subscribers_select_failed' });
    }

    const subscribers = (subs as VeilleSubscriberRow[] | null) || [];

    console.log(JSON.stringify({
        event: 'distribute_veille_report_start',
        report_id: reportId,
        edition: report.edition,
        lang: report.lang,
        subscribers_count: subscribers.length,
        timestamp: new Date().toISOString(),
    }));

    if (subscribers.length === 0) {
        return res.status(200).json({
            report_id: reportId,
            distributed: 0,
            failed: 0,
            skipped: 0,
            message: 'no_active_subscribers_for_lang',
        });
    }

    // 3. Distribution sequentielle (1/sub, simple, robuste, max ~5min total < 300s budget)
    let okCount = 0;
    let failCount = 0;
    let skippedCount = 0;
    const startedAt = Date.now();

    for (const sub of subscribers) {
        try {
            // 3a. SELECT existing distribution
            const { data: existingDist } = await supabase
                .from('veille_distributions')
                .select('id, status')
                .eq('report_id', reportId)
                .eq('subscriber_request_id', sub.request_id)
                .maybeSingle();

            if (existingDist && existingDist.status === 'sent') {
                skippedCount++;
                continue;
            }

            // 3b. INSERT or UPDATE pending
            let distributionId: string | null = existingDist?.id || null;
            if (!distributionId) {
                const { data: newDist, error: insErr } = await supabase
                    .from('veille_distributions')
                    .insert({
                        report_id: reportId,
                        subscriber_request_id: sub.request_id,
                        email: sub.email,
                        lang: sub.lang === 'en' ? 'en' : 'fr',
                        status: 'pending',
                    })
                    .select('id')
                    .single();
                if (insErr) {
                    // 23505 = unique_violation : row already inserted concurrent → re-fetch
                    const code = (insErr as { code?: string }).code;
                    if (code === '23505') {
                        const { data: refetch } = await supabase
                            .from('veille_distributions')
                            .select('id, status')
                            .eq('report_id', reportId)
                            .eq('subscriber_request_id', sub.request_id)
                            .maybeSingle();
                        if (refetch?.status === 'sent') {
                            skippedCount++;
                            continue;
                        }
                        distributionId = refetch?.id || null;
                    } else {
                        throw new Error(`dist_insert_failed: ${insErr.message || 'unknown'}`);
                    }
                } else {
                    distributionId = newDist?.id || null;
                }
            } else {
                // Update existing failed → pending pour retry
                await supabase
                    .from('veille_distributions')
                    .update({ status: 'pending', error_message: null })
                    .eq('id', distributionId);
            }

            if (!distributionId) {
                failCount++;
                continue;
            }

            // 3c. Send email
            try {
                await sendVeilleMonthlyReport({
                    payment_id: 'veille_monthly',
                    request_id: sub.request_id,
                    email: sub.email,
                    customer_name: [sub.first_name, sub.last_name].filter(Boolean).join(' ') || undefined,
                    customer_company: sub.company || undefined,
                    lang: report.lang,
                    edition: report.edition,
                    month_label: monthLabel,
                    report_pdf_base64: report.pdf_base64,
                    report_pdf_filename: filename,
                });

                await supabase
                    .from('veille_distributions')
                    .update({
                        status: 'sent',
                        sent_at: new Date().toISOString(),
                        error_message: null,
                    })
                    .eq('id', distributionId);
                okCount++;
            } catch (mailErr: unknown) {
                const reason = (mailErr as { message?: string })?.message || 'mail_unknown_error';
                await supabase
                    .from('veille_distributions')
                    .update({
                        status: 'failed',
                        error_message: reason.slice(0, 500),
                    })
                    .eq('id', distributionId);
                failCount++;
                console.warn(JSON.stringify({
                    event: 'distribute_veille_report_mail_failed',
                    report_id: reportId,
                    subscriber_request_id: sub.request_id,
                    error: reason,
                    severity: 'warning',
                    timestamp: new Date().toISOString(),
                }));
            }
        } catch (subErr: unknown) {
            failCount++;
            console.error(JSON.stringify({
                event: 'distribute_veille_report_sub_loop_error',
                report_id: reportId,
                subscriber_request_id: sub.request_id,
                error: (subErr as { message?: string })?.message || 'unknown',
                severity: 'warning',
                timestamp: new Date().toISOString(),
            }));
        }
    }

    // 4. UPDATE veille_reports : status='distributed' si au moins 1 envoi OK ou si tous ont skipped (re-run)
    const totalSucceeded = okCount + skippedCount;
    if (totalSucceeded > 0 && report.status !== 'distributed') {
        const { error: finalErr } = await supabase
            .from('veille_reports')
            .update({
                status: 'distributed',
                distributed_at: new Date().toISOString(),
            })
            .eq('id', reportId);
        if (finalErr) {
            console.warn(JSON.stringify({
                event: 'distribute_veille_report_status_update_failed',
                report_id: reportId,
                error: finalErr.message || 'unknown',
                severity: 'warning',
                timestamp: new Date().toISOString(),
            }));
        }
    }

    const elapsedMs = Date.now() - startedAt;
    console.log(JSON.stringify({
        event: 'distribute_veille_report_done',
        report_id: reportId,
        edition: report.edition,
        lang: report.lang,
        subscribers_total: subscribers.length,
        distributed: okCount,
        failed: failCount,
        skipped: skippedCount,
        elapsed_ms: elapsedMs,
        timestamp: new Date().toISOString(),
    }));

    return res.status(200).json({
        report_id: reportId,
        edition: report.edition,
        lang: report.lang,
        subscribers_total: subscribers.length,
        distributed: okCount,
        failed: failCount,
        skipped: skippedCount,
        elapsed_ms: elapsedMs,
    });
}
