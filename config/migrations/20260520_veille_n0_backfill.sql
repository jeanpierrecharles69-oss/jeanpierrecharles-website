-- AEGIS Intelligence -- Migration N13 C1 backfill (20260520)
-- Backfill audit trail du VEILLE N°0 livre MANUELLEMENT (hors pipeline) le 19/05/2026.
--
-- Reference : 20260519T2030_PROPOSITION_CONVERGENCE-B2B-E2E-CLM-N13.md chantier C1
--             + bridge 20260519T1700_BRIDGE_CLOTURE (lecon L_T1635_01)
-- Decision JP : D-N13-01 = (a) backfill maintenant (amendement T0730).
--
-- POURQUOI : le N°0 a ete genere a la main (Chat Opus L2) puis envoye par email a 1 cobaye
-- Gmail, SANS passer par generate-veille-report.ts ni distribute-veille-report.ts.
-- Resultat : ZERO row dans veille_reports / veille_distributions => trou audit total sur la
-- premiere livraison VEILLE. Ce backfill cree les rows manquantes pour fermer le trou et
-- faire passer le noeud DAG V_RECEIVE de ROUGE (converge) a VERT (done, traçable).
--
-- A APPLIQUER PAR JP L3 via Supabase SQL Editor (UI Dashboard). Duree estimee : < 3 secondes.
-- IDEMPOTENCE : guards WHERE NOT EXISTS / SELECT INTO. Reexecution safe.
--
-- ====================================================================================
-- AVANT EXECUTION -- JP doit verifier la valeur ci-dessous :
--   1. v_cobaye_email : renseigne T1155 par JP L3 (email cobaye TEST Gmail). Verifier exactitude.
--   2. v_edition : confirmer la cle edition souhaitee pour le N°0 (defaut ASCII '2026-05-N0').
-- ====================================================================================

BEGIN;

DO $$
DECLARE
    v_report_id   UUID;
    v_edition     TEXT        := '2026-05-N0';                    -- cle edition N°0 (ASCII, confirmer JP)
    v_lang        TEXT        := 'fr';                            -- N°0 livre en FR
    v_cobaye_email TEXT       := 'jeanpierrecharles69+veille-cobaye@gmail.com';  -- email cobaye TEST (JP L3 T1155)
    v_sent_at     TIMESTAMPTZ := '2026-05-19T14:39:00Z';          -- 16:39 CEST = 14:39 UTC (bridge T1639)
BEGIN
    -- 1) veille_reports : artefact rapport N°0 (status=distributed car deja diffuse manuellement)
    SELECT id INTO v_report_id
      FROM public.veille_reports
     WHERE edition = v_edition AND lang = v_lang
     LIMIT 1;

    IF v_report_id IS NULL THEN
        INSERT INTO public.veille_reports
            (edition, lang, pdf_base64, status, created_at, validated_at, distributed_at)
        VALUES
            (v_edition, v_lang, NULL, 'distributed', v_sent_at, v_sent_at, v_sent_at)
        RETURNING id INTO v_report_id;
        RAISE NOTICE 'veille_reports : row N°0 creee id=%', v_report_id;
    ELSE
        RAISE NOTICE 'veille_reports : row N°0 deja presente id=% (skip)', v_report_id;
    END IF;
    -- Note : pdf_base64 = NULL volontairement (le PDF N°0 manuel n'est pas re-stocke ici ;
    -- le fichier source reste VEILLE-N0-MAI-2026-FR-AEGIS.pdf cote poste JP).

    -- 2) veille_distributions : log envoi cobaye (subscriber_request_id NULL car non-abonne)
    IF NOT EXISTS (
        SELECT 1 FROM public.veille_distributions
         WHERE report_id = v_report_id AND email = v_cobaye_email
    ) THEN
        INSERT INTO public.veille_distributions
            (report_id, subscriber_request_id, email, lang, sent_at, status)
        VALUES
            (v_report_id, NULL, v_cobaye_email, v_lang, v_sent_at, 'sent');
        RAISE NOTICE 'veille_distributions : row cobaye creee pour report_id=%', v_report_id;
    ELSE
        RAISE NOTICE 'veille_distributions : row cobaye deja presente (skip)';
    END IF;
END $$;

COMMIT;

-- ====================================================================================
-- VERIFICATION POST-MIGRATION (copier-coller dans SQL Editor) :
--   SELECT id, edition, lang, status, distributed_at, (pdf_base64 IS NULL) AS pdf_null
--     FROM public.veille_reports WHERE edition = '2026-05-N0';
--
--   SELECT d.email, d.lang, d.status, d.sent_at
--     FROM public.veille_distributions d
--     JOIN public.veille_reports r ON r.id = d.report_id
--    WHERE r.edition = '2026-05-N0';
--
-- ATTENDU : 1 row veille_reports (status=distributed, pdf_null=true)
--           + 1 row veille_distributions (status=sent) => audit trail N°0 ferme, V_RECEIVE VERT.
-- ====================================================================================
--
-- ROLLBACK (si besoin) :
--   DELETE FROM public.veille_distributions
--    WHERE report_id IN (SELECT id FROM public.veille_reports WHERE edition = '2026-05-N0');
--   DELETE FROM public.veille_reports WHERE edition = '2026-05-N0';
