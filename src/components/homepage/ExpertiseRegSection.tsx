import { useLang } from "./LangContext";
import { C } from "./constants";

export default function ExpertiseRegSection() {
    const { t } = useLang();
    const data = t.expertiseRegs;

    if (!data) return null;

    return (
        <section
            id="expertise-regs"
            className="rounded-2xl px-6 py-10"
            style={{ backgroundColor: C.surfaceAlt }}
            aria-labelledby="expertise-reg-heading"
        >
            <div className="text-center mb-8">
                <h2
                    id="expertise-reg-heading"
                    className="text-2xl lg:text-3xl font-bold tracking-tight"
                    style={{ color: C.text }}
                >
                    {t.expertiseRegTitle}
                </h2>
                <p className="text-sm mt-2" style={{ color: C.textMuted }}>
                    {t.expertiseRegSub}
                </p>
            </div>

            {/* Grille matrice : lignes = entreprises, colonnes = reglements */}
            <div className="max-w-5xl mx-auto overflow-x-auto">
                <div className="space-y-4">
                    {data.map((exp, i) => (
                        <div
                            key={i}
                            className="rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start"
                            style={{
                                backgroundColor: C.surface,
                                border: `1px solid ${C.border}`,
                                boxShadow: C.shadowSoft,
                            }}
                        >
                            {/* Left: Company info */}
                            <div className="flex-shrink-0 md:w-60">
                                <div
                                    className="text-[10px] font-extrabold tracking-wider mb-1"
                                    style={{ color: exp.color }}
                                >
                                    {exp.period}
                                </div>
                                <div className="text-sm font-bold" style={{ color: C.text }}>
                                    {exp.company}
                                </div>
                                <div className="text-xs" style={{ color: C.textMuted }}>
                                    {exp.role}
                                </div>
                                <div className="text-xs mt-1" style={{ color: C.textSecondary }}>
                                    {exp.highlight}
                                </div>
                            </div>

                            {/* Right: Regulation badges */}
                            <div className="flex-1 flex flex-wrap gap-2 items-start">
                                {exp.regs.map((reg, j) => (
                                    <div
                                        key={j}
                                        className="rounded-lg px-3 py-2"
                                        style={{
                                            backgroundColor: `${exp.color}08`,
                                            border: `1px solid ${exp.color}20`,
                                        }}
                                    >
                                        <div
                                            className="text-[10px] font-bold"
                                            style={{ color: exp.color }}
                                        >
                                            {reg.name}
                                        </div>
                                        <div
                                            className="text-[9px]"
                                            style={{ color: C.textMuted }}
                                        >
                                            {reg.ref}
                                        </div>
                                        <div
                                            className="text-[10px] mt-0.5"
                                            style={{ color: C.textSecondary }}
                                        >
                                            {reg.context}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
