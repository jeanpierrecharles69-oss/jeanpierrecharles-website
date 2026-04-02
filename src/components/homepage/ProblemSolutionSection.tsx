import { useLang } from "./LangContext";
import { C } from "./constants";

export default function ProblemSolutionSection() {
    const { t } = useLang();
    const data = t.problemSolutions;

    if (!data) return null;

    const scrollToPricing = () => {
        document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <section
            id="problem-solution"
            className="rounded-2xl px-6 py-10"
            style={{ backgroundColor: C.surface }}
            aria-labelledby="ps-heading"
        >
            <div className="text-center mb-8">
                <h2
                    id="ps-heading"
                    className="text-2xl lg:text-3xl font-bold tracking-tight"
                    style={{ color: C.text }}
                >
                    {t.problemSolutionTitle}
                </h2>
                <p className="text-sm mt-2" style={{ color: C.textMuted }}>
                    {t.problemSolutionSub}
                </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-5">
                {data.map((item, i) => (
                    <div
                        key={i}
                        className="rounded-xl p-5 flex flex-col md:flex-row items-center gap-4"
                        style={{
                            backgroundColor: C.surfaceAlt,
                            border: `1px solid ${C.border}`,
                            boxShadow: C.shadowSoft,
                        }}
                    >
                        {/* Problem */}
                        <div className="flex-1 flex items-start gap-3">
                            <span
                                className="text-lg flex-shrink-0 mt-0.5"
                                aria-hidden="true"
                            >
                                &#10060;
                            </span>
                            <div>
                                <div
                                    className="text-xs font-bold mb-1"
                                    style={{ color: C.rose }}
                                >
                                    {item.problem}
                                </div>
                            </div>
                        </div>

                        {/* Arrow */}
                        <div
                            className="hidden md:flex items-center justify-center flex-shrink-0"
                            style={{ color: item.color, fontSize: 20, fontWeight: 800 }}
                        >
                            →
                        </div>
                        <div
                            className="md:hidden flex items-center justify-center"
                            style={{ color: item.color, fontSize: 20, fontWeight: 800 }}
                        >
                            ↓
                        </div>

                        {/* Solution */}
                        <div className="flex-1 flex items-start gap-3">
                            <span
                                className="text-lg flex-shrink-0 mt-0.5"
                                aria-hidden="true"
                            >
                                &#9989;
                            </span>
                            <div>
                                <div
                                    className="text-xs font-bold mb-1"
                                    style={{ color: C.emerald }}
                                >
                                    {item.solution}
                                </div>
                                <div
                                    className="text-[10px]"
                                    style={{ color: C.textMuted }}
                                >
                                    {item.service}
                                </div>
                            </div>
                        </div>

                        {/* CTA tier */}
                        <button
                            onClick={scrollToPricing}
                            className="flex-shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full"
                            style={{
                                backgroundColor: `${item.color}10`,
                                color: item.color,
                                border: `1px solid ${item.color}25`,
                                cursor: "pointer",
                                fontFamily: "inherit",
                            }}
                        >
                            {item.tier} · {item.tierPrice}
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}
