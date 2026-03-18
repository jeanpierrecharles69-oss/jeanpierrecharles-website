import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { marked } from "marked";
import { useLang } from "../homepage/LangContext";
import { C } from "../homepage/constants";
import { blogArticles } from "../../data/blogData";
import ArticleJsonLd from "./ArticleJsonLd";

export default function ArticlePage() {
  const { articleId } = useParams<{ articleId: string }>();
  const { lang, t } = useLang();
  const navigate = useNavigate();

  const article = blogArticles.find((a) => a.id === articleId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [articleId]);

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4" style={{ color: C.text }}>
          Article not found
        </h1>
        <button
          onClick={() => navigate("/")}
          className="text-sm font-semibold"
          style={{ color: C.accent }}
        >
          ← {t.blogBackToInsights}
        </button>
      </div>
    );
  }

  const localized = article[lang];
  const htmlContent = marked.parse(localized.content) as string;

  return (
    <>
      <ArticleJsonLd article={article} lang={lang} />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="mb-8 text-sm font-semibold inline-flex items-center gap-1 transition-colors"
          style={{ color: C.accent }}
        >
          ← {t.blogBackToInsights}
        </button>

        {/* Header */}
        <header className="mb-10">
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3"
            style={{ color: C.text }}
          >
            {localized.title}
          </h1>
          <p
            className="text-base sm:text-lg mb-5"
            style={{ color: C.textSecondary }}
          >
            {localized.subtitle}
          </p>

          <div
            className="flex flex-wrap items-center gap-3 text-xs mb-4"
            style={{ color: C.textMuted }}
          >
            <span className="font-semibold" style={{ color: C.text }}>
              {article.author}
            </span>
            <span>·</span>
            <span>
              {t.blogPublishedOn}{" "}
              {new Date(article.publishDate).toLocaleDateString(
                lang === "fr" ? "fr-FR" : "en-US",
                { year: "numeric", month: "long", day: "numeric" }
              )}
            </span>
            <span>·</span>
            <span>
              {article.readingTime} min {t.blogReadingTime}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2.5 py-1 rounded-full font-medium"
                style={{
                  backgroundColor: `${C.accent}10`,
                  color: C.accent,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* Body — Markdown rendered via marked */}
        <style>{`
          .article-body h2 {
            font-size: 1.5rem;
            font-weight: 700;
            margin-top: 3rem;
            margin-bottom: 1.5rem;
            line-height: 1.25;
            letter-spacing: -0.025em;
            color: ${C.text};
          }
          @media (min-width: 640px) {
            .article-body h2 {
              font-size: 1.875rem;
            }
          }
          .article-body h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-top: 2rem;
            margin-bottom: 0.75rem;
            color: ${C.text};
          }
          .article-body p {
            margin-bottom: 1rem;
            line-height: 1.75;
          }
          .article-body strong {
            font-weight: 700;
            color: ${C.text};
          }
          .article-body ul, .article-body ol {
            margin: 1rem 0;
            padding-left: 1.5rem;
          }
          .article-body li {
            margin-bottom: 0.5rem;
            line-height: 1.75;
          }
          .article-body a {
            color: ${C.accent};
            font-weight: 600;
            text-decoration: none;
          }
          .article-body a:hover {
            text-decoration: underline;
          }
          .article-body hr {
            margin: 2.5rem 0;
            border: none;
            border-top: 1px solid ${C.border};
          }
        `}</style>
        <div
          className="article-body max-w-none"
          style={{ color: C.text }}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Bottom back button */}
        <div className="mt-16 pt-8" style={{ borderTop: `1px solid ${C.border}` }}>
          <button
            onClick={() => navigate("/")}
            className="text-sm font-semibold inline-flex items-center gap-1 transition-colors"
            style={{ color: C.accent }}
          >
            ← {t.blogBackToInsights}
          </button>
        </div>
      </article>
    </>
  );
}
