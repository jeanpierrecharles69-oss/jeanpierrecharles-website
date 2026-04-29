import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Lang, i18n } from "./i18n";

interface LangContextType {
    lang: Lang;
    setLang: (lang: Lang) => void;
    t: typeof i18n.fr; // Using fr as base type
}

const LangContext = createContext<LangContextType | undefined>(undefined);

// Patch P14 (14/04 T1005) : init lang depuis URL pour supporter deep-link /en
// Si pathname commence par /en -> lang initial 'en', sinon 'fr'
const getInitialLang = (): Lang => {
    if (typeof window === "undefined") return "fr";
    // P15 (25/04) : support ?lang=en query param pour redirect Mollie post-paiement
    const params = new URLSearchParams(window.location.search);
    const qLang = params.get("lang");
    if (qLang === "en") return "en";
    if (window.location.pathname.startsWith("/en")) return "en";
    return "fr";
};

export const LangProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [lang, setLangState] = useState<Lang>(getInitialLang);

    const setLang = (newLang: Lang) => {
        setLangState(newLang);
        // BUG-02 FIX: Notify dependent components (Brain IA) of language change
        window.dispatchEvent(new CustomEvent('langChanged', { detail: { lang: newLang } }));
    };

    // FIX P1-B v348 : sync document.title + meta description avec lang (SEO EN)
    useEffect(() => {
        document.documentElement.lang = lang;
        const head = document.head;
        if (lang === 'en') {
            document.title = 'Jean-Pierre Charles | Industry 5.0 & EU Compliance Expert';
        } else {
            document.title = 'Jean-Pierre Charles | Expert Industrie 5.0 & Conformité UE';
        }
        const desc = lang === 'en'
            ? 'R&D engineer expert in Industry 5.0 transformation, AI Act, mechatronics and EU regulatory compliance. 32 years of industrial experience across 6 international groups.'
            : 'Ingénieur expert en transformation Industrie 5.0, IA Act, mécatronique et conformité réglementaire européenne. 32 ans d\'expérience industrielle dans 6 groupes internationaux.';
        let metaDesc = head.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', desc);
    }, [lang]);

    const value = {
        lang,
        setLang,
        t: i18n[lang],
    };

    return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
};

export const useLang = () => {
    const context = useContext(LangContext);
    if (!context) {
        throw new Error("useLang must be used within a LangProvider");
    }
    return context;
};
