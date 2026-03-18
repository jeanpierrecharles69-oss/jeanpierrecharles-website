import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * OG Render — Serverless function for social media crawlers
 *
 * Serves minimal HTML with correct OG meta tags for article pages.
 * Called only by bots (LinkedIn, Facebook, Twitter, Google, etc.)
 * via conditional rewrite in vercel.json.
 *
 * Human visitors never hit this endpoint — they get the SPA via index.html.
 *
 * Article metadata must be kept in sync with src/data/blogData.ts.
 * When adding a new article to blogData, add its metadata here too.
 */

interface ArticleMeta {
  fr: { title: string; metaDescription: string };
  en: { title: string; metaDescription: string };
  publishDate: string;
  author: string;
  image: string;
}

const SITE_URL = "https://jeanpierrecharles.com";
const DEFAULT_IMAGE = `${SITE_URL}/jpc.jpg`;

// --- Article metadata registry (sync with src/data/blogData.ts) ---
const articles: Record<string, ArticleMeta> = {
  "cra-ai-act-reglements-meres-industrie-5": {
    fr: {
      title: "AI Act + CRA : les règlements-mères de l'Industrie 5.0",
      metaDescription:
        "Comment l'EU AI Act, le CRA et le Machinery Regulation convergent après le Digital Omnibus : calendrier réel, risques et opportunités pour les PME et ETI industrielles européennes.",
    },
    en: {
      title: "AI Act + CRA: The Parent Regulations of Industry 5.0",
      metaDescription:
        "How the EU AI Act, CRA and Machinery Regulation converge after the Digital Omnibus: real calendar, risks and opportunities for European industrial SMEs and mid-caps.",
    },
    publishDate: "2026-03-17",
    author: "Jean-Pierre Charles",
    image: DEFAULT_IMAGE,
  },
};

// --- Homepage fallback metadata ---
const HOMEPAGE_META = {
  title: "Jean-Pierre Charles | Expert Industrie 5.0 & Conformité IA",
  description:
    "Découvrez une approche humaine de la performance industrielle et de la conformité européenne.",
  image: DEFAULT_IMAGE,
  url: `${SITE_URL}/`,
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const slug = (req.query.slug as string) || "";
  const article = articles[slug];

  if (!article) {
    // Unknown slug — serve homepage OG as fallback
    const h = HOMEPAGE_META;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
    return res.status(200).send(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(h.title)}</title>
  <meta name="description" content="${escapeHtml(h.description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${escapeHtml(h.url)}" />
  <meta property="og:title" content="${escapeHtml(h.title)}" />
  <meta property="og:description" content="${escapeHtml(h.description)}" />
  <meta property="og:image" content="${escapeHtml(h.image)}" />
  <meta property="og:locale" content="fr_FR" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(h.title)}" />
  <meta name="twitter:description" content="${escapeHtml(h.description)}" />
  <meta name="twitter:image" content="${escapeHtml(h.image)}" />
</head>
<body></body>
</html>`);
  }

  // Serve article OG (default: FR for social sharing in EU market)
  const lang = "fr";
  const loc = article[lang];
  const canonicalUrl = `${SITE_URL}/insights/${slug}`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
  return res.status(200).send(`<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(loc.title)} | AEGIS Intelligence</title>
  <meta name="description" content="${escapeHtml(loc.metaDescription)}" />
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHtml(loc.title)}" />
  <meta property="og:description" content="${escapeHtml(loc.metaDescription)}" />
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
  <meta property="og:site_name" content="AEGIS Intelligence" />
  <meta property="og:image" content="${escapeHtml(article.image)}" />
  <meta property="og:locale" content="fr_FR" />
  <meta property="article:published_time" content="${article.publishDate}" />
  <meta property="article:author" content="${escapeHtml(article.author)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(loc.title)}" />
  <meta name="twitter:description" content="${escapeHtml(loc.metaDescription)}" />
  <meta name="twitter:image" content="${escapeHtml(article.image)}" />
</head>
<body>
  <h1>${escapeHtml(loc.title)}</h1>
  <p>${escapeHtml(loc.metaDescription)}</p>
  <p><a href="${escapeHtml(canonicalUrl)}">Lire l'article complet</a></p>
</body>
</html>`);
}
