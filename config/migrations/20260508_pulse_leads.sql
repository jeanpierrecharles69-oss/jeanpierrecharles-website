-- AEGIS Intelligence — Migration S2 Mission N11 (20260508)
-- Table `pulse_leads` : capture email avant export PDF Brain (M3.5).
--
-- Référence : 20260507T1730_BRIEF_SPRINT-DETTES-AUTOMATION-DIAG-VEILLE-ACDC-CODE.md §Sprint 2
-- À APPLIQUER PAR JP L3 via Supabase SQL Editor (UI Dashboard) AVANT déploiement S2.
-- Durée estimée : <2 secondes.
-- Rollback : DROP TABLE public.pulse_leads;
--
-- POURQUOI : avant S2 le PDF s'exporte en lead anonyme. Email gate = lead traçable
-- pour funnel PULSE → DIAGNOSTIC + futur nurturing.
--
-- RGPD : email = donnée personnelle. Mention légale + finalité affichées dans la modal
-- (cf. AegisIntelligence.tsx). Conservation : pas de purge auto pour l'instant (lead B2B).
--
-- RLS : service_role uniquement (bypass via SUPABASE_SERVICE_ROLE_KEY server-side).

BEGIN;

CREATE TABLE IF NOT EXISTS public.pulse_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    query_context TEXT,
    lang TEXT NOT NULL DEFAULT 'fr' CHECK (lang IN ('fr', 'en')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pulse_leads_email
    ON public.pulse_leads(email);

CREATE INDEX IF NOT EXISTS idx_pulse_leads_created_at
    ON public.pulse_leads(created_at DESC);

ALTER TABLE public.pulse_leads ENABLE ROW LEVEL SECURITY;

COMMIT;

-- Vérifications post-migration (SELECT manuel JP) :
--   SELECT column_name, data_type, is_nullable
--     FROM information_schema.columns
--    WHERE table_name = 'pulse_leads'
--    ORDER BY ordinal_position;
--
--   SELECT indexname FROM pg_indexes WHERE tablename = 'pulse_leads';
--
-- Smoke test attendu après migration + déploiement S2 :
--   1) Brain → poser une question → cliquer « PDF »
--   2) Modal email gate apparaît → renseigner email → submit
--   3) Row dans pulse_leads + export PDF déclenché
--   4) Re-cliquer « PDF » → pas de modal (sessionStorage memorise email)
