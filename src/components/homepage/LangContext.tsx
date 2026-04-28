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

    useEffect(() => {
        document.documentElement.lang = lang;
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
