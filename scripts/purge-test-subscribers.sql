-- ============================================================================
-- AEGIS Intelligence -- N15-B5 : purge abonne test doublon (REVIEW-ONLY)
-- Produit par Code (L1a). A EXECUTER PAR JP dans Supabase SQL Editor apres revue.
-- DEC-5 (JP L3) : SUPPRIMER 'jeanpierrecharles69@gmail.com' (doublon),
--                 GARDER 'jeanpierrecharles69+veille-cobaye@gmail.com' (canari SOP).
-- Le DELETE est COMMENTE : verifier l'etape 1, puis decommenter l'etape 2.
-- ============================================================================

-- 1. VERIFIER AVANT (abonnes actifs) :
SELECT id, request_id, email, status, lang, unsubscribed_at, created_at
FROM veille_requests
WHERE status = 'active'
ORDER BY created_at;

-- 2a. DELETE du doublon -- option demandee par JP (decommenter APRES verif etape 1) :
--     ATTENTION FK : si veille_payments / veille_distributions referencent ce request_id,
--     le DELETE peut echouer ou cascader. Verifier avant ; sinon preferer 2b (soft).
-- DELETE FROM veille_requests
-- WHERE email = 'jeanpierrecharles69@gmail.com' AND status = 'active';

-- 2b. ALTERNATIVE SOFT (non destructive, garde l'audit + evite les FK) :
-- UPDATE veille_requests SET unsubscribed_at = now()
-- WHERE email = 'jeanpierrecharles69@gmail.com' AND status = 'active' AND unsubscribed_at IS NULL;

-- 3. VERIFIER APRES (doit rester '+veille-cobaye' uniquement) :
-- SELECT id, request_id, email, status, lang, unsubscribed_at
-- FROM veille_requests WHERE status = 'active';
-- ============================================================================
