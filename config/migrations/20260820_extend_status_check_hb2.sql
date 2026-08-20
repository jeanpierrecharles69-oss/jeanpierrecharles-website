-- AEGIS Intelligence -- Migration HB-2 (20260820, mission HA/HB serie D_T2159_xx)
-- Etend diagnostic_requests_status_check : +'delivering' (claim de livraison HB-2 F-05)
-- et +'failed' (ecrit par le code depuis N12 mais ABSENT de la contrainte d'origine ->
-- toute ecriture status='failed' etait refusee silencieusement par PostgREST ;
-- cause racine probable du pattern P2-PIPE-01 "silent fail generate-diagnostic",
-- dossiers bloques en 'generating' -- 3 occurrences mai 2026).
--
-- Decouverte en Preview N2 HB-6 le 20/08/2026 : le claim POST admin-approve a echoue
-- fail-visible ("violates check constraint diagnostic_requests_status_check").
-- La contrainte d'origine n'existait dans AUCUNE migration versionnee (F-13) :
-- liste constatee en prod = pending_payment, paid, generating, delivered, cancelled.
--
-- APPLIQUEE en production le 20/08/2026 ~03:35 UTC via MCP Supabase apply_migration
-- (migration tracee "extend_diagnostic_requests_status_check_hb2", GO L3 nominatif JP,
-- override RA2 ponctuel borne a cette action). Verif post : pg_get_constraintdef = 7 valeurs.
-- Non destructif : elargissement strict, aucune ligne modifiee.
-- Rollback : recreer la contrainte avec l'ancienne liste (exige zero row delivering/failed).

ALTER TABLE public.diagnostic_requests
  DROP CONSTRAINT diagnostic_requests_status_check;

ALTER TABLE public.diagnostic_requests
  ADD CONSTRAINT diagnostic_requests_status_check
  CHECK (status = ANY (ARRAY[
    'pending_payment'::text,
    'paid'::text,
    'generating'::text,
    'delivering'::text,
    'delivered'::text,
    'failed'::text,
    'cancelled'::text
  ]));
