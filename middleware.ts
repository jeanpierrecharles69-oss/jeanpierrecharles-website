/**
 * Vercel Edge Middleware — Bot detection for article OG tags
 *
 * Intercepts /insights/* requests from social media crawlers
 * and rewrites them to /api/og-render which serves proper OG meta tags.
 * Human browsers pass through to the SPA (index.html via vercel.json rewrite).
 *
 * Architecture (Pearl causal model):
 *   Bot  → middleware detects UA → fetch(/api/og-render) → HTML with article OG
 *   Human → middleware passes through → vercel.json rewrite → index.html → SPA + Helmet CSR
 *
 * @see api/og-render.ts for the OG HTML generation
 * @see vercel.json for the SPA fallback rewrite
 */

const BOT_USER_AGENTS = [
  'linkedinbot',
  'facebookexternalhit',
  'facebot',
  'twitterbot',
  'whatsapp',
  'telegrambot',
  'slackbot',
  'discordbot',
  'googlebot',
  'bingbot',
  'yandexbot',
  'baiduspider',
  'duckduckbot',
  'pinterestbot',
  'embedly',
  'redditbot',
  'applebot',
  'semrushbot',
  'ahrefsbot',
  'mj12bot',
  'petalbot',
  'seznambot',
];

function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot));
}

export default async function middleware(request: Request): Promise<Response | undefined> {
  const url = new URL(request.url);

  // Only match /insights/{slug} paths
  const match = url.pathname.match(/^\/insights\/([^/?#]+)/);
  if (!match) return undefined; // pass through to vercel.json rewrite

  const userAgent = request.headers.get('user-agent') || '';
  if (!isBot(userAgent)) return undefined; // humans get the SPA

  // Bot detected on article URL → fetch OG render from serverless function
  const slug = match[1];
  const apiUrl = new URL(`/api/og-render?slug=${encodeURIComponent(slug)}`, url.origin);

  return fetch(apiUrl.toString());
}

export const config = {
  matcher: '/insights/:path*',
};
