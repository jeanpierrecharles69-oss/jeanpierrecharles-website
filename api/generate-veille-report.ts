import type { VercelRequest, VercelResponse } from '@vercel/node';
import { timingSafeEqual } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { supabase, SUPABASE_ENABLED } from './_lib/supabase.js';
import { renderVeilleReport } from './_lib/veille-report-template.js';

/**
 * AEGIS Intelligence -- Generate VEILLE Monthly Report (S5 Mission N11)
 *
 * POST /api/generate-veille-report
 *   Headers : x-admin-key (timing-safe vs AEGIS_ADMIN_KEY)
 *   Body :
 *     {
 *       edition: "Mai 2026 -- N°1",
 *       month_label: "Mai 2026",
 *       lang: "fr" | "en",
 *       signals: {
 *         ai_act:    "...markdown ou prose libre par pilier...",
 *         cra:       "...",
 *         machinery: "...",
 *         espr_dpp:  "...",
 *         battery:   "..."
 *       }
 *     }
 *
 * Pipeline :
 *   1. Auth + validation input
 *   2. Build user prompt (system prompt depuis config/veille-system-prompt-v1.0.0.txt)
 *   3. Call Opus 4.6 (max_tokens 32768, cache_control:ephemeral)
 *   4. Substitution {{edition}} dans la sortie
 *   5. Render markdown -> PDF via renderVeilleReport
 *   6. UPSERT veille_reports : (edition, lang) unique de fait, status='draft'
 *   7. Return { report_id, edition, lang, status, pdf_size_bytes }
 *
 * Vercel : maxDuration 300s, memory 1024MB (vercel.json).
 *
 * Version : 1.0.0 -- 20260508 -- creation S5
 */

export const config = { maxDuration: 300 };

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const OPUS_MODEL = 'claude-opus-4-6';
const OPUS_MAX_TOKENS = 32768;
const SYSTEM_PROMPT_PATH = 'config/veille-system-prompt-v1.0.0.txt';

const PILLAR_LABELS: Record<string, { fr: string; en: string }> = {
    ai_act:    { fr: 'AI Act',                         en: 'AI Act' },
    cra:       { fr: 'CRA -- Cyber Resilience Act',    en: 'CRA -- Cyber Resilience Act' },
    machinery: { fr: 'Reglement Machines 2023/1230',   en: 'Machinery Regulation 2023/1230' },
    espr_dpp:  { fr: 'ESPR / DPP',                     en: 'ESPR / DPP' },
    battery:   { fr: 'Battery Regulation',             en: 'Battery Regulation' },
};

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
            event: 'generate_veille_report_misconfigured',
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

function loadSystemPrompt(): string {
    const p = path.join(process.cwd(), SYSTEM_PROMPT_PATH);
    return fs.readFileSync(p, 'utf-8');
}

function buildUserPrompt(input: {
    edition: string;
    lang: 'fr' | 'en';
    month_label: string;
    signals: Record<string, string>;
}): string {
    const isFr = input.lang === 'fr';
    const langInstruction = input.lang === 'en'
        ? 'LANG:EN\nWrite in professional British English (EN-GB) per the OUTPUT LANGUAGE DIRECTIVE in the system prompt.'
        : 'Reponds en francais.';

    const pillarBlocks: string[] = [];
    const order = ['ai_act', 'cra', 'machinery', 'espr_dpp', 'battery'] as const;
    for (const key of order) {
        const label = PILLAR_LABELS[key][input.lang];
        const raw = (input.signals[key] || '').trim();
        const noSignal = isFr ? '_(Aucun signal majeur ce mois -- veille passive.)_' : '_(No major signal this month -- passive watch.)_';
        const body = raw.length > 0 ? raw : noSignal;
        pillarBlocks.push(`### ${label}\n\n${body}`);
    }

    return `${langInstruction}

${isFr ? 'Voici les signaux du mois pour la veille reglementaire mensuelle AEGIS.' : 'Here are the signals of the month for the AEGIS monthly regulatory watch.'}

**${isFr ? 'Edition' : 'Edition'} :** ${input.edition}
**${isFr ? 'Mois' : 'Month'} :** ${input.month_label}
**${isFr ? 'Langue' : 'Language'} :** ${input.lang.toUpperCase()}

---

${pillarBlocks.join('\n\n')}

---

${isFr
    ? 'Produis le rapport mensuel complet selon le format AEGIS Intelligence (6 sections obligatoires : Executive Summary, Tableau de bord feux tricolores, Analyse par pilier, Calendrier echeances, Sources, Cloture). Utilise EXCLUSIVEMENT la valeur {{edition}} comme reference unique.'
    : 'Produce the full monthly report following the AEGIS Intelligence format (6 mandatory sections: Executive Summary, Traffic-light Dashboard, Per-pillar Analysis, Deadline Calendar, Sources, Closing). Use EXCLUSIVELY the value {{edition}} as the unique reference.'}
`;
}

async function callOpus(systemPrompt: string, userPrompt: string): Promise<{ text: string; usage?: Record<string, number> }> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const requestBody = {
        model: OPUS_MODEL,
        max_tokens: OPUS_MAX_TOKENS,
        system: [
            {
                type: 'text',
                text: systemPrompt,
                cache_control: { type: 'ephemeral' },
            },
        ],
        messages: [{ role: 'user', content: userPrompt }],
    };

    const response = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
            'x-api-key': apiKey,
            'anthropic-version': ANTHROPIC_VERSION,
            'content-type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`anthropic_${response.status}: ${errText.slice(0, 300)}`);
    }

    const data = await response.json() as {
        content?: Array<{ type: string; text?: string }>;
        usage?: Record<string, number>;
    };
    const text = (data.content || [])
        .filter((c) => c.type === 'text')
        .map((c) => c.text || '')
        .join('\n');

    if (!text || text.trim().length === 0) {
        throw new Error('opus_empty_response');
    }

    return { text, usage: data.usage };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
    if (!authorize(req, res)) return;

    if (!SUPABASE_ENABLED || !supabase) {
        return res.status(503).json({ error: 'supabase_unavailable' });
    }

    const body = req.body || {};
    const edition = typeof body.edition === 'string' ? body.edition.trim() : '';
    const monthLabel = typeof body.month_label === 'string' ? body.month_label.trim() : edition;
    const lang: 'fr' | 'en' = body.lang === 'en' ? 'en' : 'fr';
    const signals = (body.signals && typeof body.signals === 'object') ? body.signals : {};

    if (!edition || edition.length < 3 || edition.length > 80) {
        return res.status(400).json({ error: 'invalid_edition' });
    }

    // Sanitize signals : 5 piliers, chacun string max 4000 chars
    const cleanSignals: Record<string, string> = {};
    for (const key of ['ai_act', 'cra', 'machinery', 'espr_dpp', 'battery']) {
        const raw = signals[key];
        cleanSignals[key] = (typeof raw === 'string' ? raw : '').slice(0, 4000);
    }

    console.log(JSON.stringify({
        event: 'generate_veille_report_start',
        edition, lang, month_label: monthLabel,
        signals_lengths: Object.fromEntries(Object.entries(cleanSignals).map(([k, v]) => [k, v.length])),
        timestamp: new Date().toISOString(),
    }));

    const startedAt = Date.now();
    const systemPrompt = loadSystemPrompt();
    const userPrompt = buildUserPrompt({ edition, lang, month_label: monthLabel, signals: cleanSignals });

    let opusResult: { text: string; usage?: Record<string, number> };
    try {
        opusResult = await callOpus(systemPrompt, userPrompt);
    } catch (e: unknown) {
        const reason = (e as { message?: string })?.message || 'opus_unknown_error';
        console.error(JSON.stringify({
            event: 'generate_veille_report_opus_failed',
            edition, lang,
            error: reason,
            elapsed_ms: Date.now() - startedAt,
            severity: 'warning',
            timestamp: new Date().toISOString(),
        }));
        return res.status(502).json({ error: 'opus_call_failed', reason });
    }

    const markdown = opusResult.text.replace(/\{\{edition\}\}/g, edition);

    let report;
    try {
        report = renderVeilleReport({
            edition,
            lang,
            markdown,
            month_label: monthLabel,
        });
    } catch (e: unknown) {
        const reason = (e as { message?: string })?.message || 'pdf_render_unknown_error';
        console.error(JSON.stringify({
            event: 'generate_veille_report_pdf_failed',
            edition, lang,
            error: reason,
            severity: 'warning',
            timestamp: new Date().toISOString(),
        }));
        return res.status(500).json({ error: 'pdf_render_failed', reason });
    }

    // UPSERT veille_reports : SELECT existing draft for (edition, lang), UPDATE if exists, else INSERT
    let reportId: string | null = null;
    try {
        const { data: existing, error: selErr } = await supabase
            .from('veille_reports')
            .select('id, status')
            .eq('edition', edition)
            .eq('lang', lang)
            .maybeSingle();

        if (selErr) {
            console.warn(JSON.stringify({
                event: 'generate_veille_report_select_failed',
                edition, lang,
                error: selErr.message || 'unknown',
                timestamp: new Date().toISOString(),
            }));
        }

        if (existing && existing.id) {
            // UPDATE (re-generation autorisee tant que status != 'distributed')
            if (existing.status === 'distributed') {
                return res.status(409).json({
                    error: 'already_distributed',
                    message: 'Cette edition a deja ete distribuee. Creer une nouvelle edition pour regenerer.',
                });
            }
            const { error: upErr } = await supabase
                .from('veille_reports')
                .update({
                    pdf_base64: report.pdfBase64,
                    status: 'draft',
                    validated_at: null, // reset si on regenere
                })
                .eq('id', existing.id);
            if (upErr) {
                throw new Error(`update_failed: ${upErr.message}`);
            }
            reportId = existing.id;
        } else {
            const { data: ins, error: insErr } = await supabase
                .from('veille_reports')
                .insert({
                    edition,
                    lang,
                    pdf_base64: report.pdfBase64,
                    status: 'draft',
                })
                .select('id')
                .single();
            if (insErr) {
                throw new Error(`insert_failed: ${insErr.message}`);
            }
            reportId = ins?.id || null;
        }
    } catch (e: unknown) {
        const reason = (e as { message?: string })?.message || 'supabase_unknown_error';
        console.error(JSON.stringify({
            event: 'generate_veille_report_persist_failed',
            edition, lang,
            error: reason,
            severity: 'critical',
            timestamp: new Date().toISOString(),
        }));
        return res.status(500).json({ error: 'persist_failed', reason });
    }

    const elapsedMs = Date.now() - startedAt;
    console.log(JSON.stringify({
        event: 'generate_veille_report_ok',
        edition, lang,
        report_id: reportId,
        pdf_size_bytes: report.pdfSize,
        markdown_length: markdown.length,
        opus_usage: opusResult.usage || null,
        elapsed_ms: elapsedMs,
        timestamp: new Date().toISOString(),
    }));

    const includePdf = body.include_pdf === true;

    return res.status(200).json({
        report_id: reportId,
        edition,
        lang,
        status: 'draft',
        pdf_size_bytes: report.pdfSize,
        pdf_filename: report.pdfFilename,
        elapsed_ms: elapsedMs,
        opus_usage: opusResult.usage || null,
        // include_pdf=true (admin preview) : retourne le base64 dans la reponse pour iframe blob.
        pdf_base64: includePdf ? report.pdfBase64 : undefined,
    });
}
