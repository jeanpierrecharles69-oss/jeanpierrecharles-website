import type { VercelRequest, VercelResponse } from '@vercel/node';
import { timingSafeEqual } from 'node:crypto';

/**
 * AEGIS Intelligence -- Admin Basic Auth (Night N7 Option β)
 * Protection endpoints /api/admin/* : dashboard /admin/pending-diagnostics.html.
 *
 * Pattern : HTTP Basic Auth (RFC 7617) avec timingSafeEqual (resistance timing attacks).
 * Env var : ADMIN_PASSWORD (Production Vercel, à créer mission Night N7).
 * User fixe : 'admin'.
 *
 * R_T1155_01 : aucun log clair du password, uniquement booleen match.
 * R_T1340_01 strict : timingSafeEqual evite fuites via latence comparaison byte-a-byte.
 *
 * Usage :
 *   export default async function handler(req, res) {
 *     if (!requireAdminAuth(req, res)) return; // 401 emis avec WWW-Authenticate
 *     // ... logique endpoint ...
 *   }
 *
 * Version : 1.0.0 -- 20260422 -- Mission Night N7 Option β
 */

const ADMIN_USER = 'admin';
const REALM = 'AEGIS Admin';

function timingSafeStringEqual(a: string, b: string): boolean {
    // Normalise longueur (timingSafeEqual exige Buffers de même taille)
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    try {
        return timingSafeEqual(bufA, bufB);
    } catch {
        return false;
    }
}

/**
 * Vérifie Authorization Basic header contre ADMIN_PASSWORD env var.
 * Si invalide/manquant : répond 401 + WWW-Authenticate (prompt browser natif).
 * @returns true si auth OK (continuer handler), false si 401 émis (stop handler)
 */
export function requireAdminAuth(req: VercelRequest, res: VercelResponse): boolean {
    const expectedPassword = process.env.ADMIN_PASSWORD;

    // Fail-safe : si env var absente, refus systematique (ne jamais authoriser par defaut)
    if (!expectedPassword) {
        console.error(JSON.stringify({
            event: 'admin_auth_misconfigured',
            reason: 'ADMIN_PASSWORD env var not set',
            severity: 'critical',
            timestamp: new Date().toISOString(),
        }));
        res.setHeader('WWW-Authenticate', `Basic realm="${REALM}"`);
        return emit401(res, 'admin_password_not_configured');
    }

    const authHeader = req.headers.authorization || '';

    if (!authHeader.startsWith('Basic ')) {
        res.setHeader('WWW-Authenticate', `Basic realm="${REALM}"`);
        return emit401(res, 'missing_basic_auth');
    }

    let decoded: string;
    try {
        decoded = Buffer.from(authHeader.slice(6).trim(), 'base64').toString('utf8');
    } catch {
        res.setHeader('WWW-Authenticate', `Basic realm="${REALM}"`);
        return emit401(res, 'invalid_base64');
    }

    const sepIdx = decoded.indexOf(':');
    if (sepIdx === -1) {
        res.setHeader('WWW-Authenticate', `Basic realm="${REALM}"`);
        return emit401(res, 'malformed_credentials');
    }

    const providedUser = decoded.slice(0, sepIdx);
    const providedPassword = decoded.slice(sepIdx + 1);

    const userOk = timingSafeStringEqual(providedUser, ADMIN_USER);
    const passOk = timingSafeStringEqual(providedPassword, expectedPassword);

    // Evaluer les deux pour latence constante meme si user faux
    if (!userOk || !passOk) {
        console.warn(JSON.stringify({
            event: 'admin_auth_failed',
            reason: 'credentials_mismatch',
            ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown',
            timestamp: new Date().toISOString(),
        }));
        res.setHeader('WWW-Authenticate', `Basic realm="${REALM}"`);
        return emit401(res, 'invalid_credentials');
    }

    // Log success (sans password ni IP complet)
    console.log(JSON.stringify({
        event: 'admin_auth_success',
        timestamp: new Date().toISOString(),
    }));
    return true;
}

function emit401(res: VercelResponse, reason: string): false {
    res.status(401).json({ error: 'Unauthorized', reason });
    return false;
}
