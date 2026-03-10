import { useState } from "react";
import { useLang } from "./LangContext";
import { C } from "./constants";
import ContactModal from "../common/ContactModal";

export default function PricingSection() {
    const { t, lang } = useLang();
    const [activeTier, setActiveTier] = useState(0);
    const [showContact, setShowContact] = useState(false);

    return (
        <>
        <section
            id="pricing"
            className="rounded-2xl px-6 py-10"
            style={{ backgroundColor: C.surfaceAlt }}
            aria-labelledby="pricing-heading"
        >
            <div className="text-center mb-8">
                <h2
                    id="pricing-heading"
                    className="text-2xl lg:text-3xl font-bold tracking-tight"
                    style={{ color: C.text }}
                >
                    {t.pricingTitle}
                </h2>
                <p className="text-sm mt-2" style={{ color: C.textMuted }}>{t.pricingSub}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-3xl mx-auto">
                {t.tiers.map((tier, i) => {
                    const isActive = activeTier === i;
                    return (
                        <div
                            key={i}
                            onClick={() => setActiveTier(i)}
                            className="relative rounded-2xl p-6 cursor-pointer flex flex-col transition-all"
                            style={{
                                backgroundColor: C.surface,
                                border: isActive ? `2px solid ${tier.color}` : `1px solid ${C.border}`,
                                boxShadow: isActive ? C.shadowLg : C.shadowSoft,
                                transform: isActive ? "translateY(-4px)" : "translateY(0)",
                            }}
                            role="button"
                            tabIndex={0}
                            aria-label={`${tier.name} — ${tier.price}${tier.period}`}
                            aria-pressed={isActive}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setActiveTier(i); }}
                        >
                            {/* Badge */}
                            {tier.badge && (
                                <div
                                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-extrabold px-3 py-0.5 rounded-full tracking-wider text-white"
                                    style={{ backgroundColor: tier.color }}
                                >
                                    {tier.badge}
                                </div>
                            )}

                            <div className="text-[10px] font-extrabold tracking-widest mb-1" style={{ color: tier.color }}>
                                {tier.name}
                            </div>

                            <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-3xl font-extrabold" style={{ color: C.text }}>{tier.price}</span>
                                {tier.period && <span className="text-sm" style={{ color: C.textMuted }}>{tier.period}</span>}
                            </div>
                            {"annual" in tier && tier.annual && (
                                <div className="text-[10px] mb-2" style={{ color: C.emerald }}>
                                    {tier.period?.includes('heure') || tier.period?.includes('hr')
                                        ? <>{lang === 'fr' ? 'ou ' : 'or '}{tier.annual}</>
                                        : <>{tier.annual} <span style={{ color: C.textMuted }}>(-17%)</span></>
                                    }
                                </div>
                            )}

                            <div className="text-xs mb-4" style={{ color: C.textMuted }}>{tier.tagline}</div>

                            <ul className="space-y-2 mb-4 flex-1">
                                {tier.features.map((f, j) => (
                                    <li key={j} className="flex gap-2 text-xs" style={{ color: C.textSecondary }}>
                                        <span style={{ color: C.emerald }}>✓</span>
                                        <span>{f}</span>
                                    </li>
                                ))}
                                {tier.notIncluded.map((f, j) => (
                                    <li key={`no-${j}`} className="flex gap-2 text-xs" style={{ color: C.textMuted }}>
                                        <span>—</span>
                                        <span className="line-through">{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                className="w-full text-xs font-bold py-2.5 rounded-full mt-auto transition-all"
                                style={{
                                    backgroundColor: isActive ? tier.color : "transparent",
                                    color: isActive ? "#fff" : tier.color,
                                    border: isActive ? "none" : `1px solid ${tier.color}30`,
                                }}
                                aria-label={tier.cta}
                                onClick={() => setShowContact(true)}
                            >
                                {tier.cta}
                            </button>
                        </div>
                    );
                })}
            </div>
        </section>

            {showContact && <ContactModal onClose={() => setShowContact(false)} lang={lang} />}
        </>
    );
}
