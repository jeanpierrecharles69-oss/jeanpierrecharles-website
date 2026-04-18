import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * AEGIS Intelligence -- Supabase Server Client
 * Persistance EU Frankfurt des donnees diagnostic_requests.
 *
 * GRACEFUL DEGRADATION IMPERATIVE :
 *  - Si SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY absent -> client = null
 *  - Tous les appelants DOIVENT tester `if (supabase)` avant usage
 *  - Un Supabase down ne doit JAMAIS bloquer le flow checkout/paiement
 *
 * SECURITE :
 *  - SERVICE_ROLE_KEY uniquement server-side (bypass RLS)
 *  - JAMAIS utiliser ANON_KEY ici
 *  - JAMAIS exposer la cle dans les logs ou les reponses API
 *
 * Version : 1.0.0 -- 20260418 -- NIGHT-N5 FAI-FIX Phase B1
 */

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabase: SupabaseClient | null =
    SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
        ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
              auth: {
                  persistSession: false,
                  autoRefreshToken: false,
              },
          })
        : null;

export const SUPABASE_ENABLED = supabase !== null;

export function logSupabaseUnavailable(context: string): void {
    console.warn(JSON.stringify({
        event: 'supabase_unavailable',
        context,
        reason: 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured',
        severity: 'warning',
        timestamp: new Date().toISOString(),
    }));
}

export type DiagnosticStatus =
    | 'pending_payment'
    | 'paid'
    | 'generating'
    | 'delivered'
    | 'cancelled';

export interface DiagnosticRequestRow {
    request_id: string;
    invoice_number: string;
    status: DiagnosticStatus;
    email: string;
    first_name: string | null;
    last_name: string | null;
    company: string | null;
    country: string | null;
    city: string | null;
    sector: string | null;
    product: string | null;
    context: string | null;
    regulations: string[] | null;
    lang: string;
    payment_id: string | null;
    paid_at: string | null;
    pdf_sha256: string | null;
    delivered_at: string | null;
    created_at: string;
    updated_at: string;
}
