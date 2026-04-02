import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLang } from '../homepage/LangContext';
import { C } from '../homepage/constants';

const content = {
    fr: {
        title: 'Merci pour votre commande',
        subtitle: 'Votre diagnostic AEGIS est en cours de préparation.',
        steps: [
            { icon: '✅', text: 'Paiement reçu — confirmation envoyée par e-mail' },
            { icon: '🔍', text: 'Jean-Pierre analyse votre produit et vos réglements applicables' },
            { icon: '📄', text: 'Rapport PDF premium livré sous 48h ouvrées' },
            { icon: '📞', text: 'Un appel de restitution de 30 min est inclus' },
        ],
        contact: 'Une question ? Contactez-nous à',
        back: '← Retour à l\'accueil',
        metaTitle: 'Merci — AEGIS Intelligence',
    },
    en: {
        title: 'Thank you for your order',
        subtitle: 'Your AEGIS diagnostic is being prepared.',
        steps: [
            { icon: '✅', text: 'Payment received — confirmation sent by email' },
            { icon: '🔍', text: 'Jean-Pierre analyses your product and applicable regulations' },
            { icon: '📄', text: 'Premium PDF report delivered within 48 business hours' },
            { icon: '📞', text: 'A 30-min debrief call is included' },
        ],
        contact: 'Any questions? Contact us at',
        back: '← Back to home',
        metaTitle: 'Thank you — AEGIS Intelligence',
    },
};

export default function MerciPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { lang } = useLang();

    const pageLang = (searchParams.get('lang') as 'fr' | 'en') || lang || 'fr';
    const t = content[pageLang] || content.fr;

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <Helmet>
                <title>{t.metaTitle}</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            <main
                className="max-w-2xl mx-auto px-4 sm:px-6 py-16"
                style={{ minHeight: '70vh' }}
            >
                {/* Success icon */}
                <div className="text-center mb-8">
                    <div
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: `${C.emerald}15`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 36,
                            marginBottom: 16,
                        }}
                    >
                        🎉
                    </div>
                    <h1
                        className="text-2xl sm:text-3xl font-extrabold tracking-tight"
                        style={{ color: C.text }}
                    >
                        {t.title}
                    </h1>
                    <p
                        className="text-sm mt-2"
                        style={{ color: C.textMuted }}
                    >
                        {t.subtitle}
                    </p>
                </div>

                {/* Steps */}
                <div
                    className="rounded-2xl p-6 space-y-5"
                    style={{
                        backgroundColor: C.surface,
                        border: `1px solid ${C.border}`,
                        boxShadow: C.shadowSoft,
                    }}
                >
                    {t.steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-4">
                            <span className="text-xl flex-shrink-0 mt-0.5">{step.icon}</span>
                            <div>
                                <p className="text-sm font-medium" style={{ color: C.text }}>
                                    {step.text}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact + CTA */}
                <div className="text-center mt-8 space-y-4">
                    <p className="text-xs" style={{ color: C.textMuted }}>
                        {t.contact}{' '}
                        <a
                            href="mailto:contact@jeanpierrecharles.com"
                            style={{ color: C.accent, fontWeight: 600 }}
                        >
                            contact@jeanpierrecharles.com
                        </a>
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm font-semibold px-6 py-2.5 rounded-full transition-all"
                        style={{
                            backgroundColor: `${C.accent}10`,
                            color: C.accent,
                            border: `1px solid ${C.accent}25`,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                        }}
                    >
                        {t.back}
                    </button>
                </div>
            </main>
        </>
    );
}
