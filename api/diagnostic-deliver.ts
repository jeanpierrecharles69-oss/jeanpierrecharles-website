import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { supabase, SUPABASE_ENABLED } from './_lib/supabase.js';
import { sendClientDiagnostic } from './_lib/mailer.js';

/**
 * AEGIS Intelligence -- Diagnostic Deliver Endpoint (Phase C)
 * POST /api/diagnostic-deliver
 *   multipart/form-data : request_id + invoice_number + pdf_sha256 + pdf (file) + client_email_override?
 *
 * Protected by AEGIS_OPS_TOKEN_PROD (Bearer auth, scope PROD separe EA-10).
 * Consomme par C:\Projects\aegis-ops\scripts\aegis-deliver-diagnostic.ps1 (Phase C orchestrateur).
 *
 * Conformite Living Spec v1.1 SIGNEE :
 *   EA-02 Promise.race 3s UPDATE Supabase
 *   EA-05 Gandi SMTP 465 nodemailer (via sendClientDiagnostic)
 *   EA-06 Bearer Authorization endpoint
 *   EA-11 multipart/form-data 1 etape
 *   EA-20 Vercel Pro tier (maxDuration 15s)
 *   CE-01 idempotence triphasique Etats A/B/C/D
 *   CE-04 atomicite refondee (pas de rollback UPDATE)
 *   CR-02 emailLogIdentifier() hash SHA-256 tronque 8 chars pour logs
 *   R_T1340_01 : aucun err.message nodemailer dans logs (leak risk)
 *
 * Version : 1.0.0 -- 20260422 -- PHASE-C v1.1 arbitree (Devil's Advocate 4/4 A integrees)
 */

export const config = { maxDuration: 15 }; // Derogation D_T1040_02 scope strict Vercel Pro EA-20

const OPS_TOKEN_PROD = process.env.AEGIS_OPS_TOKEN_PROD || '';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SHA256_HEX = /^[0-9a-f]{64}$/i;
const INVOICE_REGEX = /^AEGIS-\d{8}-\d{4}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PDF_MAX_BYTES = 20 * 1024 * 1024;
const MULTIPART_MAX_BYTES = 25 * 1024 * 1024;

// --- Helper Obj.2 Cyber mitigation (D_T1040_01) ---
// Hash SHA-256 tronque 8 chars = ~1 collision sur 4 milliards pour correlation logs sans leak PII
function emailLogIdentifier(email: string | undefined | null): string {
    if (!email) return 'no_email';
    const hash = crypto.createHash('sha256').update(email).digest('hex');
    return `email_h_${hash.substring(0, 8)}`;
}

// --- Multipart parser minimal (Node stream natif, pas de dependance externe) ---
// L_T1602_01 : Vercel @vercel/node body handling varie selon Content-Type.
// Pour multipart : peut etre Buffer OU string (latin1/binary) OU undefined (stream non-consomme).
async function readRawBody(req: VercelRequest): Promise<{ buffer: Buffer; source: string }> {
    // Cas 1 : deja Buffer (Vercel auto-buffer pour multipart)
    if (req.body && Buffer.isBuffer(req.body)) {
        return { buffer: req.body, source: 'req.body_buffer' };
    }
    // Cas 2 : string (certains runtime deliver body as binary string)
    if (typeof req.body === 'string') {
        return { buffer: Buffer.from(req.body, 'binary'), source: 'req.body_string_binary' };
    }
    // Cas 3 : objet parse (Vercel a tente parse JSON/form-urlencoded par erreur)
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
        // Stream probablement consume, reconstruction impossible
        return { buffer: Buffer.alloc(0), source: 'req.body_object_consumed' };
    }
    // Cas 4 : undefined -> lecture stream natif
    return new Promise<{ buffer: Buffer; source: string }>((resolve, reject) => {
        const chunks: Buffer[] = [];
        let totalLen = 0;
        let eventCount = 0;
        req.on('data', (chunk: Buffer | string) => {
            eventCount++;
            const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, 'binary');
            chunks.push(buf);
            totalLen += buf.length;
            if (totalLen > MULTIPART_MAX_BYTES) {
                reject(new Error('multipart_body_too_large'));
            }
        });
        req.on('end', () => resolve({
            buffer: Buffer.concat(chunks),
            source: `stream_read_events=${eventCount}_bytes=${totalLen}`
        }));
        req.on('error', reject);
    });
}

interface ParsedMultipart {
    fields: Record<string, string>;
    files: Record<string, Buffer>;
}

function parseMultipart(body: Buffer, contentType: string): ParsedMultipart {
    const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;\s]+))/);
    if (!boundaryMatch) throw new Error('multipart_no_boundary');
    const boundary = boundaryMatch[1] || boundaryMatch[2];
    const boundaryBytes = Buffer.from(`--${boundary}`);

    const fields: Record<string, string> = {};
    const files: Record<string, Buffer> = {};

    const parts: Buffer[] = [];
    let start = body.indexOf(boundaryBytes);
    if (start === -1) throw new Error('multipart_boundary_not_found');
    start += boundaryBytes.length;

    while (true) {
        const next = body.indexOf(boundaryBytes, start);
        if (next === -1) break;
        // Strip leading \r\n after previous boundary + trailing \r\n before next boundary
        let partStart = start;
        if (body[partStart] === 0x0d && body[partStart + 1] === 0x0a) partStart += 2;
        let partEnd = next;
        if (body[partEnd - 2] === 0x0d && body[partEnd - 1] === 0x0a) partEnd -= 2;
        parts.push(body.slice(partStart, partEnd));
        start = next + boundaryBytes.length;
        // Check for trailing -- (end of multipart)
        if (body[start] === 0x2d && body[start + 1] === 0x2d) break;
    }

    for (const part of parts) {
        const headerEnd = part.indexOf('\r\n\r\n');
        if (headerEnd === -1) continue;
        const headers = part.slice(0, headerEnd).toString('utf8');
        const content = part.slice(headerEnd + 4);

        // L_T1609_01 : .NET MultipartFormDataContent produit name=fieldname SANS quotes
        //              curl / browsers produisent name="fieldname" AVEC quotes
        //              Accepter les 2 formats pour robustesse cross-clients
        const nameMatch = headers.match(/name=(?:"([^"]+)"|([^;\s\r\n]+))/);
        if (!nameMatch) continue;
        const name = nameMatch[1] || nameMatch[2];

        const filenameMatch = headers.match(/filename=(?:"([^"]*)"|([^;\s\r\n]*))/);
        const filename = filenameMatch ? (filenameMatch[1] || filenameMatch[2]) : null;
        if (filename && filename.length > 0) {
            files[name] = content;
        } else {
            fields[name] = content.toString('utf8');
        }
    }

    return { fields, files };
}

// --- Handler ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

    // Etape 1 : Bearer validation (EA-06 + CR-05)
    if (!OPS_TOKEN_PROD) {
        console.error(JSON.stringify({
            event: 'diagnostic_deliver_misconfigured',
            reason: 'AEGIS_OPS_TOKEN_PROD_missing',
            timestamp: new Date().toISOString(),
        }));
        return res.status(500).json({ error: 'server_misconfigured' });
    }
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ') || authHeader.slice(7) !== OPS_TOKEN_PROD) {
        return res.status(401).json({ error: 'unauthorized' });
    }

    if (!SUPABASE_ENABLED || !supabase) {
        return res.status(503).json({ error: 'supabase_unavailable' });
    }

    // Etapes 2-3 : Parse multipart + extract fields (EA-11)
    let requestId = '';
    let invoiceNumber = '';
    let clientSha256 = '';
    let pdfBuffer: Buffer = Buffer.alloc(0);
    let clientEmailOverride: string | null = null;
    let bodyDebug = { source: 'unknown', raw_length: 0, parts_found: 0 };
    try {
        const { buffer: rawBody, source } = await readRawBody(req);
        bodyDebug.source = source;
        bodyDebug.raw_length = rawBody.length;
        const contentType = req.headers['content-type'] || '';
        if (!contentType.startsWith('multipart/form-data')) {
            return res.status(400).json({ error: 'invalid_content_type', expected: 'multipart/form-data' });
        }
        const parsed = parseMultipart(rawBody, contentType);
        bodyDebug.parts_found = Object.keys(parsed.fields).length + Object.keys(parsed.files).length;

        requestId = (parsed.fields['request_id'] || '').trim();
        invoiceNumber = (parsed.fields['invoice_number'] || '').trim();
        clientSha256 = (parsed.fields['pdf_sha256'] || '').trim().toLowerCase();
        clientEmailOverride = parsed.fields['client_email_override']
            ? parsed.fields['client_email_override'].trim()
            : null;
        pdfBuffer = parsed.files['pdf'] || Buffer.alloc(0);
    } catch (err) {
        return res.status(400).json({
            error: 'multipart_parse_failed',
            err_code: (err as Error).message,
            debug: bodyDebug,
        });
    }

    // Validation payload format (CR-05 injection prevention)
    // Obj.2 mitigation : NE PAS inclure client_email_override value dans body 422
    if (
        !UUID_REGEX.test(requestId) ||
        !SHA256_HEX.test(clientSha256) ||
        !INVOICE_REGEX.test(invoiceNumber) ||
        pdfBuffer.length === 0 ||
        pdfBuffer.length > PDF_MAX_BYTES
    ) {
        console.log(JSON.stringify({
            event: 'diagnostic_deliver_payload_invalid',
            request_id_prefix: requestId ? requestId.substring(0, 8) : 'empty',
            email_identifier: emailLogIdentifier(clientEmailOverride),
            timestamp: new Date().toISOString(),
        }));
        return res.status(422).json({
            error: 'invalid_payload_format',
            field_fails: {
                request_id: !UUID_REGEX.test(requestId),
                pdf_sha256: !SHA256_HEX.test(clientSha256),
                invoice_number: !INVOICE_REGEX.test(invoiceNumber),
                pdf_size_bytes: pdfBuffer.length,
            },
            debug: bodyDebug,
        });
    }

    // Validation email override si present (CR-05 + R_T0838_JP_01)
    if (clientEmailOverride && !EMAIL_REGEX.test(clientEmailOverride)) {
        return res.status(422).json({
            error: 'invalid_client_email_override',
            identifier: emailLogIdentifier(clientEmailOverride),
        });
    }

    // Etape 4 : SHA-256 server-side + match check (CE-02 + CR-03)
    const serverSha256 = crypto.createHash('sha256').update(pdfBuffer).digest('hex');
    if (serverSha256 !== clientSha256) {
        console.log(JSON.stringify({
            event: 'diagnostic_deliver_sha256_mismatch',
            request_id: requestId,
            client_sha256_prefix: clientSha256.substring(0, 8),
            server_sha256_prefix: serverSha256.substring(0, 8),
            timestamp: new Date().toISOString(),
        }));
        return res.status(409).json({ error: 'sha256_conflict', persistent_state: 'tampered_or_replay' });
    }

    // Etape 5 : SELECT Supabase row state (idempotence CE-01 triphasique)
    const { data: row, error: selectErr } = await supabase
        .from('diagnostic_requests')
        .select('email, delivered_at, pdf_sha256, email_sent_at, status, lang, invoice_number')
        .eq('request_id', requestId)
        .maybeSingle();

    if (selectErr) {
        console.error(JSON.stringify({
            event: 'diagnostic_deliver_select_fail',
            request_id: requestId,
            err_code: selectErr.code || 'unknown',
            timestamp: new Date().toISOString(),
        }));
        return res.status(500).json({ error: 'supabase_select_failed' });
    }
    if (!row) {
        return res.status(404).json({ error: 'request_not_found', request_id_prefix: requestId.substring(0, 8) });
    }
    if (row.status !== 'paid' && row.status !== 'generating' && row.status !== 'delivered') {
        return res.status(409).json({ error: 'request_not_payable_status', current_status: row.status });
    }

    const targetEmail = clientEmailOverride ?? row.email;
    if (!targetEmail || !EMAIL_REGEX.test(targetEmail)) {
        return res.status(422).json({
            error: 'no_valid_recipient',
            identifier: emailLogIdentifier(targetEmail),
        });
    }
    const lang: 'fr' | 'en' = row.lang === 'en' ? 'en' : 'fr';

    // ETAT A : livraison complete (delivered_at + sha match + email_sent_at) = succes idempotent strict
    if (row.delivered_at && row.pdf_sha256 === serverSha256 && row.email_sent_at) {
        console.log(JSON.stringify({
            event: 'diagnostic_deliver_idempotent',
            request_id: requestId,
            state: 'A_already_delivered',
            timestamp: new Date().toISOString(),
        }));
        return res.status(200).json({ status: 'already_delivered', email_sent_at: row.email_sent_at });
    }

    // ETAT C : conflit SHA-256 persistant (delivered_at + sha mismatch) = rejet strict
    if (row.delivered_at && row.pdf_sha256 !== serverSha256) {
        console.log(JSON.stringify({
            event: 'diagnostic_deliver_idempotent',
            request_id: requestId,
            state: 'C_sha256_persistent_conflict',
            timestamp: new Date().toISOString(),
        }));
        return res.status(409).json({ error: 'sha256_persistent_conflict' });
    }

    // ETAT B : UPDATE OK mais email pending (delivered_at + sha match + email_sent_at NULL)
    // Re-tenter email UNIQUEMENT, pas UPDATE delivered_at repete
    if (row.delivered_at && row.pdf_sha256 === serverSha256 && !row.email_sent_at) {
        try {
            await Promise.race([
                sendClientDiagnostic({ to: targetEmail, pdfBuffer, invoiceNumber, lang }),
                new Promise<never>((_, reject) => setTimeout(() => reject(new Error('email_timeout_7s')), 7000)),
            ]);
            await supabase
                .from('diagnostic_requests')
                .update({ email_sent_at: new Date().toISOString() })
                .eq('request_id', requestId);
            console.log(JSON.stringify({
                event: 'diagnostic_deliver_success',
                request_id: requestId,
                state: 'B_email_recovered',
                email_identifier: emailLogIdentifier(targetEmail),
                pdf_size_bytes: pdfBuffer.length,
                timestamp: new Date().toISOString(),
            }));
            return res.status(200).json({ status: 'email_recovered' });
        } catch (err) {
            // R_T1340_01 : log err.code + err.name UNIQUEMENT, JAMAIS err.message (risque leak email)
            console.error(JSON.stringify({
                event: 'diagnostic_deliver_email_retry_fail',
                request_id: requestId,
                email_identifier: emailLogIdentifier(targetEmail),
                err_code: (err as any).code ?? 'unknown',
                err_name: (err as any).name ?? 'Error',
                timestamp: new Date().toISOString(),
            }));
            return res.status(502).json({ error: 'email_retry_failed', state: 'update_ok_email_pending' });
        }
    }

    // ETAT D : nouvelle livraison complete
    // Etape 7 : UPDATE Supabase delivered_at + pdf_sha256 (EA-02 Promise.race 3s decouplage Obj.1)
    try {
        const updatePromise = supabase
            .from('diagnostic_requests')
            .update({
                delivered_at: new Date().toISOString(),
                pdf_sha256: serverSha256,
                status: 'delivered',
            })
            .eq('request_id', requestId);
        await Promise.race([
            updatePromise,
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('supabase_update_timeout_3s')), 3000)),
        ]);
    } catch (err) {
        console.error(JSON.stringify({
            event: 'diagnostic_deliver_update_fail',
            request_id: requestId,
            err_code: (err as any).message ?? 'unknown',
            timestamp: new Date().toISOString(),
        }));
        return res.status(502).json({ error: 'supabase_update_timeout' });
    }

    // Etape 8 : sendClientDiagnostic (DETTE6 C3-bis Promise.race 7s decouplage Obj.1)
    try {
        await Promise.race([
            sendClientDiagnostic({ to: targetEmail, pdfBuffer, invoiceNumber, lang }),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('email_timeout_7s')), 7000)),
        ]);
    } catch (err) {
        // CE-04 refondee : PAS de rollback UPDATE (Obj.3 A) - Etat B natif via email_sent_at NULL
        console.error(JSON.stringify({
            event: 'diagnostic_deliver_email_fail',
            request_id: requestId,
            email_identifier: emailLogIdentifier(targetEmail),
            err_code: (err as any).code ?? 'unknown',
            err_name: (err as any).name ?? 'Error',
            timestamp: new Date().toISOString(),
        }));
        return res.status(502).json({ error: 'email_delivery_failed', state: 'update_ok_email_pending' });
    }

    // Etape 9 : UPDATE email_sent_at (finalisation livraison complete)
    await supabase
        .from('diagnostic_requests')
        .update({ email_sent_at: new Date().toISOString() })
        .eq('request_id', requestId);

    console.log(JSON.stringify({
        event: 'diagnostic_deliver_success',
        request_id: requestId,
        state: 'D_delivered_complete',
        email_identifier: emailLogIdentifier(targetEmail),
        pdf_size_bytes: pdfBuffer.length,
        timestamp: new Date().toISOString(),
    }));
    return res.status(200).json({ status: 'delivered_complete' });
}
