import { useLang } from "./LangContext";
import { C } from "./constants";

export default function ParcoursRD() {
    const { t } = useLang();

    const LINKEDIN_URL = "https://www.linkedin.com/in/jpcharles6918/";

    return (
        <section
            id="expertise"
            className="rounded-2xl px-6 py-10"
            style={{ backgroundColor: C.surface, boxShadow: C.shadowSoft }}
        >
            {/* Titre */}
            <div className="text-center mb-8">
                <h2
                    className="text-2xl lg:text-3xl font-bold tracking-tight"
                    style={{ color: C.text }}
                >
                    {t.parcoursTitle1}
                    <br />
                    <span style={{ color: C.copper }}>{t.parcoursTitle2}</span>
                </h2>
                <p className="text-sm mt-2 max-w-xl mx-auto" style={{ color: C.textMuted }}>
                    {t.parcoursSub}
                </p>
            </div>



            {/* Chaîne de valeur — conservée intégralement */}
            <div className="text-center mb-8">
                <div
                    className="text-[10px] font-bold tracking-widest mb-4"
                    style={{ color: C.textMuted }}
                >
                    {t.chainTitle}
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                    {t.chain.map((c, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium"
                            style={{
                                backgroundColor: C.surfaceAlt,
                                color: C.text,
                                border: `1px solid ${C.border}`,
                            }}
                        >
                            <span>{c.icon}</span>
                            <span>{c.step}</span>
                            {i < t.chain.length - 1 && (
                                <span className="ml-1" style={{ color: C.textMuted }}>→</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Photo + Badge LinkedIn -- layout horizontal */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
                <img
                    src="/jpc.jpg"
                    alt="Jean-Pierre Charles"
                    className="rounded-full object-cover"
                    style={{
                        width: 56,
                        height: 56,
                        border: `3px solid ${C.accent}30`,
                        boxShadow: C.shadowSoft,
                        flexShrink: 0,
                    }}
                />
                <a
                    href={LINKEDIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full transition-all hover:shadow-md"
                    style={{
                        backgroundColor: "#0A66C2",
                        color: "#ffffff",
                        textDecoration: "none",
                    }}
                    aria-label={t.parcoursLinkedIn}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    {t.parcoursLinkedIn}
                </a>
            </div>
        </section>
    );
}
