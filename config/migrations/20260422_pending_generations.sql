-- AEGIS Intelligence — Migration Night N7 (20260422)
-- Table pending_generations : file d'attente déclenchements DIAGNOSTIC post-paiement
--
-- Scope : Option β (manuel pur) — déclencheur dashboard JP L3
-- Référence : 20260422T2055_SPEC_VV-MOLLIE-LIVE-PRODUCTION-END-TO-END.md §2
-- Référence : 20260422T2035_BRIEF_ACDC-CODE-MISSION-NIGHT-N7-MOLLIE-LIVE-VV.md §3.2
--
-- À APPLIQUER PAR JP L3 via Supabase SQL Editor (UI Dashboard)
-- Durée estimée : <5 secondes (table vide initialement)
-- Rollback : DROP TABLE pending_generations; (aucune dépendance hors ce fichier)
--
-- FK : pending_generations.request_id -> diagnostic_requests.request_id (TEXT, UUID format)
--
-- Statuts métier :
--   pending    : webhook Mollie paid reçu, attente action JP dashboard
--   generating : JP a cliqué "Générer & livrer", pipeline PowerShell en cours (côté poste JP)
--   generated  : pipeline PowerShell terminé, DIAGNOSTIC livré (email envoyé)
--   failed     : erreur pipeline, nécessite intervention JP manuelle

BEGIN;

CREATE TABLE IF NOT EXISTS pending_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id TEXT NOT NULL REFERENCES diagnostic_requests(request_id),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'generating', 'generated', 'failed')),
    triggered_by TEXT NULL
        CHECK (triggered_by IS NULL OR triggered_by IN ('jp_manual', 'auto_default_2h', 'system')),
    triggered_at TIMESTAMPTZ NULL,
    completed_at TIMESTAMPTZ NULL,
    error_message TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index consultation dashboard (filtrage status=pending + ORDER created_at DESC)
CREATE INDEX IF NOT EXISTS idx_pending_generations_status
    ON pending_generations(status);

CREATE INDEX IF NOT EXISTS idx_pending_generations_created_at
    ON pending_generations(created_at DESC);

-- Index recherche par request_id (idempotence webhook)
CREATE INDEX IF NOT EXISTS idx_pending_generations_request_id
    ON pending_generations(request_id);

-- Contrainte unicité : 1 seule ligne pending_generations par request_id
-- (empêche double-insert si webhook rejoué après cold start Vercel lambda)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_pending_generations_request_id
    ON pending_generations(request_id);

-- Trigger updated_at auto
CREATE OR REPLACE FUNCTION update_pending_generations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pending_generations_updated_at ON pending_generations;
CREATE TRIGGER trg_pending_generations_updated_at
    BEFORE UPDATE ON pending_generations
    FOR EACH ROW
    EXECUTE FUNCTION update_pending_generations_updated_at();

COMMIT;

-- Vérification post-migration (SELECT manuel JP) :
--   SELECT column_name, data_type, is_nullable
--     FROM information_schema.columns
--    WHERE table_name = 'pending_generations'
--    ORDER BY ordinal_position;
--
--   SELECT indexname, indexdef
--     FROM pg_indexes
--    WHERE tablename = 'pending_generations';
