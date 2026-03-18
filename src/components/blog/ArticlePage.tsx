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
        <div
          className="prose prose-slate max-w-none
            prose-headings:font-bold prose-headings:tracking-tight
            prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
            prose-p:leading-relaxed prose-p:mb-4
            prose-li:leading-relaxed
            prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
            prose-hr:my-10 prose-hr:border-t prose-hr:border-gray-200"
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
