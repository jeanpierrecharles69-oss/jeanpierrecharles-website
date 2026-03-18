import { Helmet } from "react-helmet-async";
import type { BlogArticle } from "../../data/blogData";

interface Props {
  article: BlogArticle;
  lang: "fr" | "en";
}

export default function ArticleJsonLd({ article, lang }: Props) {
  const localized = article[lang];
  const canonicalUrl = `https://jeanpierrecharles.com/insights/${article.id}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: localized.title,
    description: localized.metaDescription,
    datePublished: article.publishDate,
    author: {
      "@type": "Person",
      name: "Jean-Pierre Charles",
      jobTitle: "R&D Expert",
      knowsAbout: [
        "EU AI Act",
        "Cyber Resilience Act",
        "Machinery Regulation",
        "Battery Regulation",
        "ESPR",
        "NIS2",
      ],
    },
    publisher: {
      "@type": "Organization",
      name: "AEGIS Intelligence",
      url: "https://jeanpierrecharles.com",
    },
    keywords: article.tags.join(", "),
    inLanguage: lang === "fr" ? "fr-FR" : "en-US",
    mainEntityOfPage: canonicalUrl,
  };

  return (
    <Helmet>
      <title>{localized.title} | AEGIS Intelligence</title>
      <meta name="description" content={localized.metaDescription} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:type" content="article" />
      <meta property="og:title" content={localized.title} />
      <meta property="og:description" content={localized.metaDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="AEGIS Intelligence" />
      <meta property="article:published_time" content={article.publishDate} />
      <meta property="article:author" content="Jean-Pierre Charles" />
      {article.tags.map((tag) => (
        <meta property="article:tag" content={tag} key={tag} />
      ))}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}
