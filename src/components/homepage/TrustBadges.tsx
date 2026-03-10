import { useLang } from "./LangContext";
import { C } from "./constants";

export default function TrustBadges() {
    const { t } = useLang();

    return (
        <section
            id="trust-badges"
            className="rounded-2xl px-6 py-8"
            style={{ backgroundColor: C.surface, boxShadow: C.shadowSoft }}
            aria-labelledby="trust-heading"
        >
            <h2 id="trust-heading" className="sr-only">
                Credibility Metrics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-5">
                {t.trustBadges.map((badge, i) => (
                    <div
                        key={i}
                        className="text-center p-4 rounded-xl transition-shadow hover:shadow-md"
                        style={{
                            backgroundColor: C.surfaceAlt,
                            border: `1px solid ${C.border}`,
                        }}
                    >
                        <div className="text-3xl font-extrabold" style={{ color: C.accent }}>
                            {badge.value}
                        </div>
                        <div className="text-xs font-semibold mt-1" style={{ color: C.text }}>
                            {badge.label}
                        </div>
                        <div className="text-[10px] mt-1" style={{ color: C.textMuted }}>
                            {badge.sub}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
                {t.trustCreds.map((cred, i) => (
                    <span
                        key={i}
                        className="text-[10px] px-3 py-1 rounded-full font-medium"
                        style={{
                            color: C.textSecondary,
                            backgroundColor: C.surfaceAlt,
                            border: `1px solid ${C.border}`,
                        }}
                    >
                        {cred}
                    </span>
                ))}
            </div>
        </section>
    );
}
