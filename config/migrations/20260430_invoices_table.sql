-- AEGIS Intelligence — Migration V352 (20260430)
-- Table invoices : archive factures fiscales Art. 293 B CGI conservation 10 ans minimum.
--
-- Référence : 20260429T2035_BRIEF_ACDC-CODE-V352-INVOICE-ARCHIVE-FISCAL.md §5
-- À APPLIQUER PAR JP L3 via Supabase SQL Editor (UI Dashboard) AVANT smoke test
-- Durée estimée : <5 secondes (table vide initialement)
-- Rollback : DROP TABLE public.invoices;
--
-- FK : invoices.request_id -> diagnostic_requests.request_id (UUID, nullable)
--   request_id NULL accepté car flux email-link peut ne pas propager le ref
--   (api/invoice-archive.ts retry NULL si FK violation, archive préservée)
--
-- RLS : service_role uniquement (bypass via SUPABASE_SERVICE_ROLE_KEY server-side)
--   Aucune policy anon/authenticated → table invisible côté client.
--
-- Volumétrie estimée : ~100KB base64 par facture × 1000 clients/an = ~100MB/an Supabase FREE tier.

BEGIN;

CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE,
    request_id UUID NULL REFERENCES public.diagnostic_requests(request_id),
    pdf_base64 TEXT NOT NULL,
    lang TEXT NOT NULL DEFAULT 'fr' CHECK (lang IN ('fr', 'en')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index recherche par request_id (rapprochement diagnostic_requests si besoin)
CREATE INDEX IF NOT EXISTS idx_invoices_request_id
    ON public.invoices(request_id);

-- Index tri chronologique (consultation comptable récente d'abord)
CREATE INDEX IF NOT EXISTS idx_invoices_created_at
    ON public.invoices(created_at DESC);

-- RLS : service_role uniquement (pas d'accès anon/authenticated)
-- L'INSERT depuis api/invoice-archive.ts utilise SUPABASE_SERVICE_ROLE_KEY → bypass RLS.
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

COMMIT;

-- Vérifications post-migration (SELECT manuel JP) :
--   SELECT column_name, data_type, is_nullable
--     FROM information_schema.columns
--    WHERE table_name = 'invoices'
--    ORDER BY ordinal_position;
--
--   SELECT indexname, indexdef
--     FROM pg_indexes
--    WHERE tablename = 'invoices';
--
--   SELECT relrowsecurity FROM pg_class WHERE relname = 'invoices';
