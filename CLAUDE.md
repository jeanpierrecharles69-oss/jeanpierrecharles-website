# AEGIS Intelligence — Claude Code Execution Context
# Contexte auto-charge par ACDC Code a l'ouverture du projet
# MAJ : 20260512T0600 CET

## GOUVERNANCE AEGIS — ENFORCEMENT OBLIGATOIRE

Lire `AEGIS.md` (gouvernance consolidee stable) AVANT toute mission d'execution.
Toute mission ACDC Code s'execute sous l'autorite de la gouvernance AEGIS.
En cas de conflit entre ce fichier et AEGIS.md, AEGIS.md prevaut.

Verifier `AEGIS_STATE.md` pour l'etat operationnel courant (HEAD, chantiers, bugs).

## REGLES IMPERATIVES EXECUTION

1. JAMAIS modifier .env, .env.local, ou fichiers secrets
2. JAMAIS afficher de cles API ou secrets en clair (reference par nom de variable uniquement)
3. JAMAIS git push — JP fait tous les push manuellement (R_ABS_NIGHT_01)
4. JAMAIS git commit sans validation JP (L3 HITL)
5. JAMAIS git add -A ou git add . — selectif par fichier (D204)
6. npm run build apres chaque modification = 0 erreurs TS
7. Convention D48 : ASCII strict pour code, accents en strings UI uniquement
8. Convention D80 : IDs temporaires D_THHMM_xx dans bridges, definitifs LIFECYCLE uniquement
9. Preserver le design glass/light existant
10. IEEV : Intention -> Engagement -> Execution -> Verification a chaque etape

## STACK

- React 19 / TypeScript 5.8 / Vite 6.4.1 / Tailwind v4 PostCSS
- Deploy : Vercel Pro cdg1 Paris EU (auto-deploy git push origin main)
- Backend : Supabase EU Frankfurt
- Paiements : Mollie LIVE Amsterdam (SEPA + CB 3DS, dual-key LIVE/TEST via VERCEL_ENV)
- DNS/SMTP : Gandi France port 465 (SPF/DKIM/DMARC)
- Brain + PULSE : Claude Haiku 4.5 via api/claude-proxy.ts mode brain/pulse
- DIAGNOSTIC : Claude Opus 4.6 API 1P (prompt caching ephemeral)
- PDF : migration N12 Puppeteer + Chromium serverless (decision D_T2035_01)

## ARCHITECTURE API (Vercel Functions)

Proxy unifie : api/claude-proxy.ts (3 modes : brain/pulse/diagnostic)
Paiement : api/mollie-checkout.ts (DIAGNOSTIC 250 EUR) + api/mollie-subscription.ts (VEILLE 150 EUR/mois)
Webhook : api/mollie-webhook.ts (paid/failed)
Livraison : api/send-delivery.ts + api/diagnostic-pdf.ts
Facturation : api/invoice-archive.ts (Art. 293 B CGI)
Admin : api/admin/ (generation-queue, trigger-generation, pending-list, pending-complete, veille-queue)
VEILLE : api/veille-request.ts

## PRICING 4 TIERS

- PULSE : 0 EUR, Haiku via claude-proxy mode pulse
- DIAGNOSTIC : 250 EUR/rapport, Opus via pipeline serverless fire-and-forget
- VEILLE : 150 EUR/mois, abonnement Mollie, rapport mensuel
- EXPERTISE TERRAIN : 350 EUR/h ou 2 500 EUR/mois, JP en personne

## GARDE-FOUS MISSION

- Blocage -> JP_INPUT_NEEDED:<question> puis continuer avec assumption documentee
- Bridge cloture mission obligatoire : YYYYMMDDTHHMM_BRIDGE_<DESC>.md
- V&V locale RC1 obligatoire avant bridge retour
- RC2 : HTML justificatif V&V autonome pour missions majeures
- R13 : zero confabulation — si impossible techniquement, le dire
- D277 : Compliance (processus vivant) != Conformite (etat audite instant T)

## SCRIPTS OPS (HORS REPO — JAMAIS COMMITER)

C:\Projects\aegis-ops\scripts\ contient les PS1 operationnels.
Ne jamais modifier depuis ACDC Code. Reference uniquement.

## IDs DEFINITIFS ACTUELS

D418 / L337 / R156 (LIFECYCLE v2.11.1 — 25/04/2026)
Source : 20260425T0815_LIFECYCLE_MASTER.md

## NOMMAGE

- Fondateur : Jean-Pierre Charles, 32 ans R&D, 6 groupes internationaux
- Produit : AEGIS Intelligence (EISaaS)
- 5 piliers : AI Act x CRA x Machinery Reg 2023/1230 x ESPR/DPP x Battery Reg
