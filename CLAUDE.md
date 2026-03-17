\# AEGIS Intelligence — Project Context

\#\# Stack  
\- React 19 / TypeScript / Vite 6.2  
\- Deploy: Vercel auto-deploy via git push origin main  
\- AI: Gemini 2.0 Flash via SSE proxy (api/gemini-proxy.ts)

\#\# Architecture  
\- SPA single-page, scroll-based (pas de routing actuellement)  
\- Homepage composants dans src/components/homepage/  
\- Brain IA dans src/components/brain/AegisIntelligence.tsx  
\- i18n bilingue FR/EN via src/components/homepage/i18n.ts  
\- LangContext pour toggle langue

\#\# Regles IMPERATIVES  
1\. JAMAIS modifier .env, .env.local, ou api/gemini-proxy.ts  
2\. JAMAIS afficher de cles API ou secrets  
3\. JAMAIS git push — JP fait tous les push manuellement  
4\. JAMAIS git commit sans validation JP  
5\. npm run build apres chaque modification \= 0 erreurs TS  
6\. Preserver le design glass/light existant  
7\. BUG-01 connu : react-markdown \= markdown brut dans Brain IA

\#\# Nommage  
\- "AEGIS Intelligence" \= nom officiel  
\- DIAGNOSTIC 250 EUR/rapport  
\- EXPERTISE TERRAIN 350 EUR/h ou 2500 EUR/mois  
\- Fondateur : Jean-Pierre Charles, 32 ans R\&D, 6 groupes internationaux