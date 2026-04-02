# AEGIS Intelligence — Project Context

## Stack
- React 19 / TypeScript / Vite 6.2
- Deploy: Vercel auto-deploy via git push origin main
- AI Brain: Claude Haiku 4.5 via SSE proxy (api/claude-proxy.ts)
- AI Legacy: Gemini 2.0 Flash via SSE proxy (api/gemini-proxy.ts) — DEPRECIE, arret 01/06/2026

## Architecture
- SPA single-page, scroll-based (pas de routing actuellement)
- Homepage composants dans src/components/homepage/
- Brain IA dans src/components/brain/AegisIntelligence.tsx
- Brain IA (mini) dans src/components/brain/AegisChat.tsx
- i18n bilingue FR/EN via src/components/homepage/i18n.ts
- LangContext pour toggle langue

## Regles IMPERATIVES
1. JAMAIS modifier .env, .env.local, ou api/gemini-proxy.ts
2. JAMAIS afficher de cles API ou secrets
3. JAMAIS git push — JP fait tous les push manuellement
4. JAMAIS git commit sans validation JP
5. npm run build apres chaque modification = 0 erreurs TS
6. Preserver le design glass/light existant
7. BUG-01 RESOLU : react-markdown remplace par marked v17 + MarkdownRenderer

## API Claude (1P Anthropic)
- Proxy unifie : api/claude-proxy.ts (3 modes : brain/pulse/diagnostic)
- Cle : ANTHROPIC_API_KEY dans Vercel env vars (JAMAIS dans le code)
- Brain : Haiku 4.5 streaming SSE (remplace Gemini 2.0 Flash deprecie)
- PULSE : Sonnet 4.6 JSON (pre-diagnostic gratuit)
- DIAGNOSTIC : Opus 4.6 JSON (futur — actuellement via PowerShell aegis-ops/)
- Service client : src/services/claudeService.ts (parsing SSE Claude format)
- Prompt caching actif (cache_control top-level)
- Scripts PowerShell dans C:\Projects\aegis-ops\scripts\ (HORS repo git — JAMAIS modifier depuis ACDC)

## Pricing 4 tiers
- PULSE : 0 EUR, Sonnet via claude-proxy mode pulse, PulseForm.tsx (a venir)
- DIAGNOSTIC : 250 EUR/rapport, Opus via aegis-diagnostic-api.ps1 (PowerShell)
- VEILLE : 150 EUR/mois, Haiku+Sonnet (futur)
- EXPERTISE TERRAIN : 350 EUR/h ou 2500 EUR/mois, JP en personne

## Nommage
- "AEGIS Intelligence" = nom officiel
- Fondateur : Jean-Pierre Charles, 32 ans R&D, 6 groupes internationaux
