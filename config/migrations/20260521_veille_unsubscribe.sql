-- ============================================================================
-- AEGIS Intelligence -- Migration N15-B1 : desabonnement one-click (20260521)
-- A EXECUTER PAR JP L3 via Supabase SQL Editor AVANT le deploiement de l'endpoint.
-- Duree estimee : < 10 secondes. Rollback en bas.
-- Decision DEC-2 (L2/L3) : colonne dediee, PAS de modif de la CHECK constraint sur status.
-- ============================================================================

BEGIN;

ALTER TABLE veille_requests
ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN veille_requests.unsubscribed_at IS
'Desabonnement one-click VEILLE (N15-B1). NULL = abonne actif. Le status reste le cycle de paiement (paid/active/...). distribute-veille-report filtre status=active AND unsubscribed_at IS NULL.';

COMMIT;

-- ============================================================================
-- VERIFICATION POST-MIGRATION (copier-coller dans SQL Editor)
-- ============================================================================
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'veille_requests' AND column_name = 'unsubscribed_at';

-- ============================================================================
-- ROLLBACK (en cas de probleme)
-- ============================================================================
-- ALTER TABLE veille_requests DROP COLUMN IF EXISTS unsubscribed_at;
