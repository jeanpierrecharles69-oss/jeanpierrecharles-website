import { useState } from "react";
import { useLang } from "./LangContext";
import { C } from "./constants";
import ContactModal from "../common/ContactModal";

export default function CTASection() {
    const { t, lang } = useLang();
    const [showContact, setShowContact] = useState(false);

    return (
        <>
            <section
                id="contact"
                className="relative rounded-2xl px-6 py-12 text-center overflow-hidden"
                style={{
                    background: C.gradientSoft,
                    boxShadow: C.shadowMed,
                }}
            >
                {/* Decorative accents */}
                <div
                    className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 blur-3xl"
                    style={{ backgroundColor: C.accent }}
                />
                <div
                    className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 blur-3xl"
                    style={{ backgroundColor: C.emerald }}
                />

                <div className="relative">
                    <h2
                        className="text-2xl lg:text-3xl font-bold mb-2 tracking-tight"
                        style={{ color: C.text }}
                    >
                        {t.ctaTitle1}
                        <br />
                        <span
                            className="bg-clip-text text-transparent"
                            style={{ backgroundImage: C.gradientBlue }}
                        >
                            {t.ctaTitle2}
                        </span>
                    </h2>
                    <p className="text-sm mb-6" style={{ color: C.textMuted }}>{t.ctaSub}</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button
                            className="text-sm font-semibold px-8 py-3 rounded-full text-white transition-all hover:shadow-lg"
                            style={{
                                background: C.gradientBlue,
                                boxShadow: `0 4px 14px ${C.accent}30`,
                            }}
                            aria-label={t.ctaBtn2}
                            onClick={() => setShowContact(true)}
                        >
                            {t.ctaBtn2}
                        </button>
                    </div>
                </div>
            </section>

            {showContact && <ContactModal onClose={() => setShowContact(false)} lang={lang} />}
        </>
    );
}
