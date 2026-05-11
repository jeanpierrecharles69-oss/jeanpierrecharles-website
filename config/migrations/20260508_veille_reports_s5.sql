-- AEGIS Intelligence — Migration S5 Mission N11 (20260508)
-- Pipeline contenu VEILLE mensuel : tables `veille_reports` + `veille_distributions`.
--
-- Référence : 20260507T1730_BRIEF_SPRINT-DETTES-AUTOMATION-DIAG-VEILLE-ACDC-CODE.md §Sprint 5
-- À APPLIQUER PAR JP L3 via Supabase SQL Editor (UI Dashboard) AVANT déploiement S5.
-- Durée estimée : <3 secondes.
--
-- POURQUOI :
--  1. `veille_reports` : stockage des rapports mensuels générés via Opus + jsPDF.
--     Cycle de vie : draft → validated → distributed (workflow JP page admin).
--  2. `veille_distributions` : log par abonné (request_id, email, status sent/failed)
--     pour audit + reconciliation MRR.
--
-- IDEMPOTENCE : CREATE TABLE IF NOT EXISTS. Réexécution safe.
-- Stockage : pdf_base64 dans Postgres (décision JP MVP, brief §4.6).

BEGIN;

-- 1) `veille_reports` : artefact rapport mensuel
CREATE TABLE IF NOT EXISTS public.veille_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    edition TEXT NOT NULL,                        -- ex: "2026-05" ou "Mai 2026 N°1"
    lang TEXT NOT NULL DEFAULT 'fr' CHECK (lang IN ('fr', 'en')),
    pdf_base64 TEXT,                              -- contenu PDF base64 (peut être NULL en draft pré-génération)
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'validated', 'distributed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    validated_at TIMESTAMPTZ,
    distributed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_veille_reports_edition_lang
    ON public.veille_reports(edition, lang);

CREATE INDEX IF NOT EXISTS idx_veille_reports_status
    ON public.veille_reports(status);

CREATE INDEX IF NOT EXISTS idx_veille_reports_created_at
    ON public.veille_reports(created_at DESC);

ALTER TABLE public.veille_reports ENABLE ROW LEVEL SECURITY;

-- 2) `veille_distributions` : log envoi par abonné
CREATE TABLE IF NOT EXISTS public.veille_distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES public.veille_reports(id) ON DELETE CASCADE,
    subscriber_request_id TEXT,                   -- veille_requests.request_id (TEXT car colonne d'origine)
    email TEXT NOT NULL,
    lang TEXT NOT NULL DEFAULT 'fr' CHECK (lang IN ('fr', 'en')),
    sent_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'sent', 'failed')),
    error_message TEXT,                           -- raison échec si status='failed'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_veille_distributions_report_id
    ON public.veille_distributions(report_id);

CREATE INDEX IF NOT EXISTS idx_veille_distributions_status
    ON public.veille_distributions(status);

CREATE INDEX IF NOT EXISTS idx_veille_distributions_email
    ON public.veille_distributions(email);

-- Idempotence forte : un même rapport × abonné ne peut être loggé qu'une fois
CREATE UNIQUE INDEX IF NOT EXISTS uniq_veille_distributions_report_subscriber
    ON public.veille_distributions(report_id, subscriber_request_id)
    WHERE subscriber_request_id IS NOT NULL;

ALTER TABLE public.veille_distributions ENABLE ROW LEVEL SECURITY;

COMMIT;

-- Vérifications post-migration (SELECT manuel JP) :
--   SELECT column_name, data_type FROM information_schema.columns
--    WHERE table_name = 'veille_reports' ORDER BY ordinal_position;
--
--   SELECT column_name, data_type FROM information_schema.columns
--    WHERE table_name = 'veille_distributions' ORDER BY ordinal_position;
--
-- Smoke test attendu après déploiement S5 :
--   1) JP saisit signaux dans /admin/veille-content.html → "Générer"
--   2) generate-veille-report.ts → row dans veille_reports status='draft', pdf_base64 rempli
--   3) JP clique "Valider" → UPDATE status='validated', validated_at=NOW()
--   4) JP clique "Distribuer" → distribute-veille-report.ts → row par abonné dans veille_distributions
--      + email avec PJ PDF + UPDATE veille_reports.status='distributed', distributed_at=NOW()
