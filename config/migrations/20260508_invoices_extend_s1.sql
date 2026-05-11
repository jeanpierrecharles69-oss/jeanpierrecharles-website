-- AEGIS Intelligence — Migration S1 Mission N11 (20260508)
-- Extension table `invoices` : ajout colonnes `product` + `amount` et relaxation FK.
--
-- Référence : 20260507T1730_BRIEF_SPRINT-DETTES-AUTOMATION-DIAG-VEILLE-ACDC-CODE.md §Sprint 1
-- À APPLIQUER PAR JP L3 via Supabase SQL Editor (UI Dashboard) AVANT déploiement S1.
-- Durée estimée : <2 secondes (alteration de schéma simple).
-- Rollback : voir bloc « ROLLBACK » en bas de fichier.
--
-- POURQUOI :
--  1. Le webhook serveur-side va archiver factures DIAGNOSTIC ET VEILLE :
--     l'ancienne FK `invoices.request_id -> diagnostic_requests` bloque les VEILLE
--     (request_id pointe vers `veille_requests`).
--  2. Les colonnes `product` (diagnostic|veille) + `amount` sont nécessaires pour
--     analytics + reconciliation comptable cross-produit.
--
-- IDEMPOTENCE : tous les ALTER sont guardés (ADD COLUMN IF NOT EXISTS,
-- conditional FK drop). Réexécution safe.

BEGIN;

-- 1) Ajout colonne product (diagnostic | veille). NULL pour les rangs préexistants.
ALTER TABLE public.invoices
    ADD COLUMN IF NOT EXISTS product TEXT;

-- 2) Ajout colonne amount (texte décimal '250.00' / '150.00').
ALTER TABLE public.invoices
    ADD COLUMN IF NOT EXISTS amount TEXT;

-- 3) Relaxation FK request_id : auparavant -> diagnostic_requests uniquement.
--    Désormais : peut pointer vers diagnostic_requests OU veille_requests OU NULL.
--    Solution simple : drop la FK. Le request_id reste un UUID stocké, pas garanti existant.
--    Justification fiscale : la facture est un artefact comptable autonome (pdf_base64 + invoice_number),
--    le request_id est un lien optionnel de réconciliation.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'invoices'
          AND constraint_type = 'FOREIGN KEY'
          AND constraint_name = 'invoices_request_id_fkey'
    ) THEN
        ALTER TABLE public.invoices DROP CONSTRAINT invoices_request_id_fkey;
    END IF;
END$$;

-- 4) Contrainte CHECK sur product (idempotent, ignore si déjà présente).
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage
        WHERE table_schema = 'public'
          AND table_name = 'invoices'
          AND constraint_name = 'invoices_product_check'
    ) THEN
        ALTER TABLE public.invoices
            ADD CONSTRAINT invoices_product_check
            CHECK (product IS NULL OR product IN ('diagnostic', 'veille'));
    END IF;
END$$;

COMMIT;

-- Vérifications post-migration (SELECT manuel JP) :
--   SELECT column_name, data_type, is_nullable
--     FROM information_schema.columns
--    WHERE table_name = 'invoices'
--    ORDER BY ordinal_position;
--
--   SELECT constraint_name, constraint_type
--     FROM information_schema.table_constraints
--    WHERE table_name = 'invoices';
--
-- Smoke test attendu après migration + déploiement S1 :
--   1) Soumettre 1 paiement DIAGNOSTIC test → row dans invoices avec product='diagnostic', amount='250.00'
--   2) Soumettre 1 paiement VEILLE test    → row dans invoices avec product='veille',      amount='150.00'
--   3) Email client reçu avec PJ Facture_AEGIS_*.pdf dans les deux cas

-- ROLLBACK (si besoin de revenir à l'état pré-S1) :
-- BEGIN;
--   ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_product_check;
--   ALTER TABLE public.invoices DROP COLUMN IF EXISTS amount;
--   ALTER TABLE public.invoices DROP COLUMN IF EXISTS product;
--   ALTER TABLE public.invoices
--     ADD CONSTRAINT invoices_request_id_fkey
--     FOREIGN KEY (request_id) REFERENCES public.diagnostic_requests(request_id);
-- COMMIT;
