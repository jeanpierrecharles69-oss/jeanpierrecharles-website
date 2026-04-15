import { useState, useEffect } from "react";
import { useLang } from "./LangContext";
import { C } from "./constants";
import ContactModal from "../common/ContactModal";
import { CGVModal, PrivacyModal, MentionsLegalesModalV2 } from "../common/LegalModals";

export default function FooterSection() {
    const { t, lang } = useLang();
    const [showMentions, setShowMentions] = useState(false);
    const [showCGV, setShowCGV] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showContact, setShowContact] = useState(false);
    const isFR = lang === "fr";

    // Listen for CookieBanner "Learn more" event
    useEffect(() => {
        const handler = () => setShowPrivacy(true);
        window.addEventListener('openPrivacyModal', handler);
        return () => window.removeEventListener('openPrivacyModal', handler);
    }, []);

    return (
        <>
            <footer
                className="px-6 py-10 mt-6"
                style={{
                    backgroundColor: C.surfaceAlt,
                    borderTop: `1px solid ${C.border}`,
                }}
            >
                <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-extrabold text-white"
                                style={{ background: C.gradientBlue }}
                            >
                                AE
                            </div>
                            <span className="text-sm font-bold" style={{ color: C.text }}>AEGIS CIRCULAR</span>
                        </div>
                        <p className="text-xs whitespace-pre-line leading-relaxed" style={{ color: C.textSecondary }}>
                            {t.footerDesc}
                        </p>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-[10px] font-bold tracking-widest mb-3" style={{ color: C.textMuted }}>
                            {isFR ? "L\u00c9GAL" : "LEGAL"}
                        </h3>
                        <ul className="space-y-1.5">
                            {([
                                { label: isFR ? "Mentions l\u00e9gales" : "Legal notice", action: () => setShowMentions(true) },
                                { label: isFR ? "CGV" : "T&Cs", action: () => setShowCGV(true) },
                                { label: isFR ? "Confidentialit\u00e9" : "Privacy", action: () => setShowPrivacy(true) },
                            ] as const).map((item) => (
                                <li key={item.label}>
                                    <button
                                        onClick={item.action}
                                        className="text-xs transition-colors hover:opacity-70"
                                        style={{
                                            color: C.textSecondary,
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            padding: 0,
                                            fontFamily: "inherit",
                                        }}
                                    >
                                        {item.label}
                                    </button>
                                </li>
                            ))}
                            <li>
                                <a
                                    href="#pricing"
                                    className="text-xs transition-colors hover:opacity-70"
                                    style={{ color: C.textSecondary }}
                                >
                                    {isFR ? "Tarifs" : "Pricing"}
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-[10px] font-bold tracking-widest mb-3" style={{ color: C.textMuted }}>
                            CONTACT
                        </h3>
                        <ul className="space-y-1.5">
                            <li>
                                <a
                                    href="mailto:contact@jeanpierrecharles.com"
                                    className="text-xs transition-colors hover:opacity-70"
                                    style={{ color: C.textSecondary }}
                                >
                                    contact@jeanpierrecharles.com
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://www.linkedin.com/in/jpcharles6918/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs transition-colors hover:opacity-70"
                                    style={{ color: C.textSecondary }}
                                >
                                    LinkedIn
                                </a>
                            </li>
                            <li>
                                <button
                                    onClick={() => setShowContact(true)}
                                    className="text-xs transition-colors hover:opacity-70"
                                    style={{
                                        color: C.textSecondary,
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: 0,
                                        fontFamily: "inherit",
                                    }}
                                >
                                    {isFR ? "Formulaire de contact" : "Contact form"}
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div
                    className="text-center text-[10px] mt-8 pt-4"
                    style={{ color: C.textMuted, borderTop: `1px solid ${C.border}` }}
                >
                    &copy; {new Date().getFullYear()} Jean-Pierre Charles &mdash; AEGIS CIRCULAR
                </div>
            </footer>

            {showMentions && <MentionsLegalesModalV2 onClose={() => setShowMentions(false)} lang={lang} />}
            {showCGV && <CGVModal onClose={() => setShowCGV(false)} lang={lang} />}
            {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} lang={lang} />}
            {showContact && <ContactModal onClose={() => setShowContact(false)} lang={lang} />}
        </>
    );
}
