import React, { useState, useEffect } from 'react';
import { Language } from '../translations';

interface CookieBannerProps {
    lang: Language;
}

/**
 * CookieBanner — Conformité RGPD
 * 
 * Gère le consentement cookies + assistant IA.
 * Ne mentionne PAS Google/Gemini ici (la transparence IA
 * est gérée dans le composant AegisInline avec détail technique).
 * 
 * Cookies utilisés :
 * - cookie_consent : choix utilisateur (fonctionnel)
 * - Aucun cookie de tracking, analytics ou publicitaire
 */
const CookieBanner: React.FC<CookieBannerProps> = ({ lang }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        try {
            const consent = document.cookie
                .split('; ')
                .find(row => row.startsWith('cookie_consent='));
            if (!consent) {
                setIsVisible(true);
            }
        } catch {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        document.cookie = 'cookie_consent=accepted; max-age=31536000; path=/; SameSite=Lax';
        setIsVisible(false);
        window.dispatchEvent(new Event('consentChanged'));
    };

    const handleRefuse = () => {
        document.cookie = 'cookie_consent=refused; max-age=31536000; path=/; SameSite=Lax';
        setIsVisible(false);
        window.dispatchEvent(new Event('consentChanged'));
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] bg-slate-900/95 backdrop-blur-md border-t border-slate-700 p-4 animate-slide-in">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-300 leading-relaxed">
                    {lang === 'fr'
                        ? <>
                            Ce site utilise uniquement des <strong className="text-white">cookies fonctionnels</strong> (aucun tracking, aucune publicité).
                            L'assistant IA réglementaire nécessite votre consentement pour fonctionner.
                        </>
                        : <>
                            This site uses only <strong className="text-white">functional cookies</strong> (no tracking, no advertising).
                            The regulatory AI assistant requires your consent to operate.
                        </>
                    }
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    <button
                        onClick={handleRefuse}
                        className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-slate-600 rounded-lg transition-colors"
                    >
                        {lang === 'fr' ? 'Refuser' : 'Decline'}
                    </button>
                    <button
                        onClick={handleAccept}
                        className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
                    >
                        {lang === 'fr' ? 'Accepter' : 'Accept'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieBanner;

/** Helper : vérifie si l'utilisateur a consenti */
export function hasAIConsent(): boolean {
    try {
        const consent = document.cookie
            .split('; ')
            .find(row => row.startsWith('cookie_consent='));
        return consent?.split('=')[1] === 'accepted';
    } catch {
        return false;
    }
}
