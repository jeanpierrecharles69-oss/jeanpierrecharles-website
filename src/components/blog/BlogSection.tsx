import { useNavigate } from "react-router-dom";
import { useLang } from "../homepage/LangContext";
import { C } from "../homepage/constants";
import { blogArticles } from "../../data/blogData";

export default function BlogSection() {
  const { lang, t } = useLang();
  const navigate = useNavigate();

  return (
    <section
      id="insights"
      className="rounded-2xl px-6 py-10"
      style={{ backgroundColor: C.surface, boxShadow: C.shadowSoft }}
      aria-labelledby="insights-heading"
    >
      <div className="text-center mb-6">
        <h2
          id="insights-heading"
          className="text-2xl lg:text-3xl font-bold tracking-tight"
          style={{ color: C.text }}
        >
          {t.blogSectionTitle}
        </h2>
        <p className="text-sm mt-2" style={{ color: C.textMuted }}>
          {t.blogSectionSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {blogArticles.map((article) => {
          const localized = article[lang];
          return (
            <div
              key={article.id}
              role="button"
              tabIndex={0}
              className="rounded-xl p-5 transition-shadow hover:shadow-md cursor-pointer"
              style={{
                backgroundColor: C.surfaceAlt,
                border: `1px solid ${C.border}`,
                borderLeftWidth: "4px",
                borderLeftColor: C.accent,
              }}
              onClick={() => navigate(`/insights/${article.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter") navigate(`/insights/${article.id}`);
              }}
            >
              <div className="flex flex-wrap gap-1.5 mb-3">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: `${C.accent}10`,
                      color: C.accent,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h3
                className="text-sm font-bold mb-1"
                style={{ color: C.text }}
              >
                {localized.title}
              </h3>
              <p
                className="text-xs mb-3 line-clamp-2"
                style={{ color: C.textSecondary }}
              >
                {localized.subtitle}
              </p>

              <div
                className="flex items-center justify-between text-[10px]"
                style={{ color: C.textMuted }}
              >
                <span>{article.publishDate}</span>
                <span>
                  {article.readingTime} min {t.blogReadingTime}
                </span>
              </div>

              <div
                className="mt-3 text-xs font-semibold"
                style={{ color: C.accent }}
              >
                {t.blogReadMore} →
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
