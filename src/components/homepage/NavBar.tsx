import { useNavigate, useLocation } from "react-router-dom";
import { useLang } from "./LangContext";
import { C } from "./constants";

export default function NavBar() {
    const { lang, setLang, t } = useLang();
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <nav
            className="sticky top-0 z-50"
            style={{
                backgroundColor: C.glassBg,
                backdropFilter: C.glassBlur,
                WebkitBackdropFilter: C.glassBlur,
                borderBottom: `1px solid ${C.border}`,
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-extrabold text-white"
                        style={{ background: C.gradientBlue }}
                    >
                        Æ
                    </div>
                    <div>
                        <span className="text-sm font-bold tracking-tight" style={{ color: C.text }}>
                            AEGIS CIRCULAR
                        </span>
                        <div className="text-[9px] tracking-widest font-medium" style={{ color: C.textMuted }}>
                            {t.navSub}
                        </div>
                    </div>
                </div>

                {/* Nav Links -- mapping explicite label -> section id */}
                <div className="hidden md:flex items-center gap-8">
                    {t.navItems.map((item) => {
                        const targetMap: Record<string, string> = {
                            "Expertise": "expertise",
                            "Services": "services",
                            "Tarifs": "pricing",
                            "Pricing": "pricing",
                            "Insights": "insights",
                            "Contact": "contact",
                        };
                        const target = targetMap[item] ?? item.toLowerCase();
                        return (
                            <a
                                key={item}
                                href={`#${target}`}
                                className="text-sm font-medium transition-colors hover:opacity-70"
                                style={{ color: C.textSecondary }}
                                aria-label={`Navigate to ${item}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (location.pathname === "/") {
                                        document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
                                    } else {
                                        navigate("/", { state: { scrollTo: target } });
                                    }
                                }}
                            >
                                {item}
                            </a>
                        );
                    })}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <div
                        className="flex rounded-full overflow-hidden"
                        style={{ border: `1px solid ${C.borderStrong}` }}
                    >
                        {(["fr", "en"] as const).map((l) => (
                            <button
                                key={l}
                                onClick={() => setLang(l)}
                                className="text-[10px] font-bold px-2.5 py-1.5 uppercase tracking-wide transition-all"
                                style={{
                                    backgroundColor: lang === l ? `${C.accent}12` : "transparent",
                                    color: lang === l ? C.accent : C.textMuted,
                                }}
                                aria-label={`Switch to ${l === "fr" ? "French" : "English"}`}
                                aria-pressed={lang === l}
                            >
                                {l}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
}
