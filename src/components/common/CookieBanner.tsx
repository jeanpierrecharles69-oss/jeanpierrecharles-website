import React, { useState, useEffect } from 'react';
import { useLang } from '../homepage/LangContext';
import { C } from '../homepage/constants';

/**
 * CookieBanner v3.1 — Light/Glass RGPD
 * 
 * Adapté de v2.6 components/CookieBanner.tsx
 * - Tailwind → inline styles avec tokens C.*
 * - prop lang → useLang() Context
 * - Export hasAIConsent() préservé (RGPD gate pour Brain IA)
 * 
 * Cookies utilisés :
 * - cookie_consent : choix utilisateur (fonctionnel, max-age 1 an)
 * - Aucun cookie de tracking, analytics ou publicitaire
 */
const CookieBanner: React.FC = () => {
    const { t } = useLang();
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
        <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
            background: C.glassBg, backdropFilter: C.glassBlur, WebkitBackdropFilter: C.glassBlur,
            borderTop: `1px solid ${C.borderStrong}`, boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
            padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
            justifyContent: 'center',
        }}>
            <div style={{ flex: '1 1 400px', maxWidth: 600 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 3 }}>
                    {t.cookieTitle}
                </div>
                <div style={{ fontSize: 11, color: C.textSecondary, lineHeight: 1.5 }}>
                    {t.cookieText}
                </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
                <button
                    onClick={handleAccept}
                    style={{
                        fontSize: 12, fontWeight: 700, padding: '8px 20px', borderRadius: 20,
                        border: 'none', background: C.gradientBlue, color: '#fff', cursor: 'pointer',
                        boxShadow: `0 2px 8px ${C.accent}30`,
                    }}
                >
                    {t.cookieAccept}
                </button>
                <button
                    onClick={handleRefuse}
                    style={{
                        fontSize: 12, fontWeight: 600, padding: '7px 16px', borderRadius: 20,
                        border: `1px solid ${C.borderStrong}`, background: C.surface,
                        color: C.textSecondary, cursor: 'pointer',
                    }}
                >
                    {t.cookieReject}
                </button>
                <button
                    onClick={() => {
                        // Dispatch event to open Privacy modal in FooterSection
                        window.dispatchEvent(new Event('openPrivacyModal'));
                    }}
                    style={{
                        fontSize: 11, fontWeight: 500, padding: '7px 12px', borderRadius: 20,
                        border: 'none', background: 'transparent', color: C.accent,
                        cursor: 'pointer', textDecoration: 'underline',
                    }}
                >
                    {t.cookieMore}
                </button>
            </div>
        </div>
    );
};

export default CookieBanner;

/** Helper : vérifie si l'utilisateur a consenti (RGPD gate pour Brain IA) */
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
