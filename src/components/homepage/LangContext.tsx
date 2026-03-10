import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Lang, i18n } from "./i18n";

interface LangContextType {
    lang: Lang;
    setLang: (lang: Lang) => void;
    t: typeof i18n.fr; // Using fr as base type
}

const LangContext = createContext<LangContextType | undefined>(undefined);

export const LangProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [lang, setLang] = useState<Lang>("fr");

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
