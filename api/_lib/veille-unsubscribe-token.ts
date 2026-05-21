import crypto from 'node:crypto';

/**
 * AEGIS Intelligence -- VEILLE unsubscribe token (HMAC-SHA256).
 *
 * Token = HMAC(request_id, AEGIS_ADMIN_KEY) tronque 32 hex. Anti-forge suffisant pour un lien
 * de desabonnement (pas un secret haute securite). Secret server-side, jamais expose/logge.
 * DETTE : un VEILLE_UNSUB_SECRET dedie pourra remplacer AEGIS_ADMIN_KEY plus tard.
 *
 * BASE_URL : PUBLIC_BASE_URL (Vercel env) sinon prod. Sur Preview, fixer PUBLIC_BASE_URL a l'URL
 * de la Preview pour tester l'endpoint localement a ce deploiement.
 *
 * Version : 1.0.0 -- 20260521 -- N15-B1 desabo one-click (RFC 8058 + 2369)
 */

const SECRET = process.env.AEGIS_ADMIN_KEY || '';
const BASE_URL = (process.env.PUBLIC_BASE_URL || 'https://jeanpierrecharles.com').replace(/\/$/, '');

export function signUnsubscribe(requestId: string): string {
    return crypto.createHmac('sha256', SECRET).update(requestId).digest('hex').slice(0, 32);
}

export function verifyUnsubscribe(requestId: string, token: string): boolean {
    if (!SECRET || !requestId || !token) return false;
    const expected = signUnsubscribe(requestId);
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    try {
        return crypto.timingSafeEqual(a, b);
    } catch {
        return false;
    }
}

export function unsubscribeUrl(requestId: string): string {
    return `${BASE_URL}/api/veille-unsubscribe?rid=${encodeURIComponent(requestId)}&t=${signUnsubscribe(requestId)}`;
}

/**
 * Headers RFC 8058 (one-click https) + RFC 2369 (mailto fallback). Si request_id absent -> mailto seul.
 */
export function unsubscribeHeaders(requestId: string | undefined, opsEmail: string): Record<string, string> {
    const mailto = `<mailto:${opsEmail}?subject=unsubscribe%20VEILLE>`;
    if (!requestId) return { 'List-Unsubscribe': mailto };
    return {
        'List-Unsubscribe': `<${unsubscribeUrl(requestId)}>, ${mailto}`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    };
}
