import { useLang } from "./LangContext";
import { C } from "./constants";
import AegisIntelligence from "../brain/AegisIntelligence";

const LINKEDIN_URL = "https://www.linkedin.com/in/jpcharles6918/";

export default function HeroSection() {
    const { t } = useLang();

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section
            id="hero"
            style={{
                background: C.gradientHero,
                boxShadow: C.shadowLg,
                borderRadius: 24,
                overflow: 'hidden',
                padding: 'clamp(20px, 3vh, 32px) 24px 48px',
                position: 'relative',
            }}
        >
            {/* Blobs décoratifs */}
            <div style={{
                position: 'absolute', top: -60, right: -60,
                width: 280, height: 280, borderRadius: '50%',
                backgroundColor: C.accent, opacity: 0.06, filter: 'blur(60px)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: -60, left: -60,
                width: 280, height: 280, borderRadius: '50%',
                backgroundColor: C.emerald, opacity: 0.05, filter: 'blur(60px)',
                pointerEvents: 'none',
            }} />

            {/* Contenu centré */}
            <div style={{ position: 'relative', maxWidth: 1100, margin: '0 auto' }}>

                {/* H1 compact */}
                <div style={{ textAlign: 'center', marginBottom: 12 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        fontSize: 11, fontWeight: 500, padding: '4px 12px',
                        borderRadius: 20, marginBottom: 16,
                        backgroundColor: `${C.accent}08`,
                        color: C.accent, border: `1px solid ${C.accent}20`,
                    }}>
                        🇪🇺 {t.euBadge}
                    </div>
                    <h1 style={{
                        fontSize: 'clamp(20px, 3vw, 32px)',
                        fontWeight: 800, lineHeight: 1.2,
                        color: C.text, margin: '0 0 8px',
                    }}>
                        {t.heroH1a}
                        {' '}
                        {t.heroH1b}
                        {' '}
                        <span style={{
                            backgroundImage: C.gradientBlue,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            {t.heroH1c}
                        </span>
                    </h1>
                </div>

                {/* === HERO SUB — Capital terrain + AEGIS Intelligence === */}
                <p style={{
                    textAlign: 'center',
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: C.textSecondary,
                    maxWidth: 800,
                    margin: '0 auto 12px',
                }}>
                    {t.heroSub}
                </p>

                {/* === BANDEAU CTA LINKEDIN avec photo JP === */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    marginBottom: 24,
                }}>
                    <img
                        src="/jpc.jpg"
                        alt="Jean-Pierre Charles"
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: `2px solid ${C.border}`,
                        }}
                    />
                    <a
                        href={LINKEDIN_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#ffffff',
                            background: '#0A66C2',
                            padding: '7px 18px',
                            borderRadius: 20,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        {t.heroLinkedInCta}
                    </a>
                </div>

                {/* === CONVERGENCE BLOCK v3.1 === */}
                <div style={{ marginBottom: 28 }}>
                    <p style={{
                        textAlign: 'center', fontSize: 11, fontWeight: 600,
                        letterSpacing: '0.08em', color: C.textMuted,
                        marginBottom: 12, textTransform: 'uppercase',
                    }}>
                        {t.trinityTitle}
                    </p>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 16,
                        maxWidth: 680,
                        margin: '0 auto',
                    }}>
                        {/* Bloc 1 -- 32 ans R&D */}
                        <div style={{
                            background: `linear-gradient(135deg, ${C.copper}20, ${C.copper}08)`,
                            border: `1px solid ${C.copper}18`,
                            borderRadius: 16, padding: '20px 18px',
                            textAlign: 'center', position: 'relative', overflow: 'hidden',
                        }}>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>🧠</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>{t.trinityItem1Title}</div>
                            <div style={{ fontSize: 10, fontWeight: 600, color: C.copper, marginBottom: 8, letterSpacing: '0.03em' }}>{t.trinityItem1Sub}</div>
                            <div style={{ fontSize: 11, color: C.textSecondary, lineHeight: 1.5 }}>{t.trinityItem1Desc}</div>
                        </div>
                        {/* Bloc 2 -- AEGIS Intelligence */}
                        <div style={{
                            background: `linear-gradient(135deg, ${C.emerald}20, ${C.emerald}08)`,
                            border: `1px solid ${C.emerald}18`,
                            borderRadius: 16, padding: '20px 18px',
                            textAlign: 'center', position: 'relative', overflow: 'hidden',
                        }}>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>✨</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>{t.trinityItem3Title}</div>
                            <div style={{ fontSize: 10, fontWeight: 600, color: C.emerald, marginBottom: 8, letterSpacing: '0.03em' }}>{t.trinityItem3Sub}</div>
                            <div style={{ fontSize: 11, color: C.textSecondary, lineHeight: 1.5 }}>{t.trinityItem3Desc}</div>
                        </div>
                    </div>
                    <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: C.accent, maxWidth: 700, margin: '12px auto 0' }}>
                        = {t.trinityResult}
                    </p>
                </div>
                {/* ========================= */}

                {/* === MAIEUTIQUE INTRO === */}
                <p style={{
                    textAlign: 'center',
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.accent,
                    margin: '0 0 16px',
                    letterSpacing: '0.02em',
                }}>
                    {t.maieutiqueIntro}
                </p>

                {/* AEGIS Intelligence — VUI principale */}
                <AegisIntelligence
                    mode="hero"
                    onScrollToPricing={() => scrollTo('pricing')}
                    onScrollToExpertise={() => scrollTo('expertise')}
                />

                {/* Trust mini-badges sous le Brain */}
                <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: 16,
                    justifyContent: 'center', marginTop: 20,
                }}>
                    {t.heroTrust.map((b, i) => (
                        <span key={i} style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            fontSize: 11, fontWeight: 500, color: C.textMuted,
                        }}>
                            <span>{b.icon}</span> {b.text}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}
