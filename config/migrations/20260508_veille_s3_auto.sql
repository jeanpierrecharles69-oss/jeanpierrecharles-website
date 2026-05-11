-- AEGIS Intelligence — Migration S3 Mission N11 (20260508)
-- Automation VEILLE Mollie subscription + table `veille_payments`.
--
-- Référence : 20260507T1730_BRIEF_SPRINT-DETTES-AUTOMATION-DIAG-VEILLE-ACDC-CODE.md §Sprint 3
-- À APPLIQUER PAR JP L3 via Supabase SQL Editor (UI Dashboard) AVANT déploiement S3.
-- Durée estimée : <3 secondes.
--
-- POURQUOI :
--  1. `veille_requests` reçoit subscription_id + customer_id pour tracer le mandate Mollie
--     créé automatiquement post-paiement (au lieu du flux JP manuel Phase 1).
--  2. `veille_payments` log chaque prélèvement mensuel (sequenceType='recurring') pour
--     reconciliation comptable + dashboard MRR.
--
-- IDEMPOTENCE : ALTER ADD COLUMN IF NOT EXISTS, CREATE TABLE IF NOT EXISTS. Réexécution safe.

BEGIN;

-- 1) `veille_requests` : ajout colonnes subscription_id + customer_id
ALTER TABLE public.veille_requests
    ADD COLUMN IF NOT EXISTS subscription_id TEXT;

ALTER TABLE public.veille_requests
    ADD COLUMN IF NOT EXISTS customer_id TEXT;

-- Index recherche par subscription_id (lookup webhook recurring → request_id)
CREATE INDEX IF NOT EXISTS idx_veille_requests_subscription_id
    ON public.veille_requests(subscription_id);

-- 2) `veille_payments` : log historique prélèvements récurrents
CREATE TABLE IF NOT EXISTS public.veille_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id TEXT NOT NULL,
    payment_id TEXT NOT NULL UNIQUE,
    amount TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'paid',
    period TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_veille_payments_subscription_id
    ON public.veille_payments(subscription_id);

CREATE INDEX IF NOT EXISTS idx_veille_payments_created_at
    ON public.veille_payments(created_at DESC);

ALTER TABLE public.veille_payments ENABLE ROW LEVEL SECURITY;

COMMIT;

-- Vérifications post-migration (SELECT manuel JP) :
--   SELECT column_name, data_type, is_nullable
--     FROM information_schema.columns
--    WHERE table_name = 'veille_requests'
--    ORDER BY ordinal_position;
--
--   SELECT column_name, data_type, is_nullable
--     FROM information_schema.columns
--    WHERE table_name = 'veille_payments'
--    ORDER BY ordinal_position;
--
-- Smoke test attendu après migration + déploiement S3 :
--   1) Soumettre 1 abonnement VEILLE test → paid first → webhook
--   2) Webhook : POST /v2/customers/{cid}/subscriptions → sub_xxx créé Mollie
--   3) UPDATE veille_requests SET status='active', subscription_id=sub_xxx
--   4) Email client « Veille activée » + PJ facture + Email ops « Subscription auto »
--   5) Attendre 1 mois (ou trigger manuel test) : webhook recurring → INSERT veille_payments
