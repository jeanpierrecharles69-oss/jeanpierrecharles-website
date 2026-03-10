import { useLang } from "./LangContext";
import { C } from "./constants";

export default function ReglementsSection() {
    const { t } = useLang();

    return (
        <section
            className="rounded-2xl px-6 py-10"
            style={{ backgroundColor: C.surface, boxShadow: C.shadowSoft }}
            aria-labelledby="reglements-heading"
        >
            <div className="text-center mb-6">
                <h2
                    id="reglements-heading"
                    className="text-2xl lg:text-3xl font-bold tracking-tight"
                    style={{ color: C.text }}
                >
                    {t.regTitle}
                </h2>
                <p className="text-sm mt-2" style={{ color: C.textMuted }}>{t.regSub}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {t.regs.map((r, i) => (
                    <div
                        key={i}
                        className="rounded-xl p-4 transition-shadow hover:shadow-md"
                        style={{
                            backgroundColor: C.surfaceAlt,
                            borderLeft: `4px solid ${r.color}`,
                            border: `1px solid ${C.border}`,
                            borderLeftWidth: "4px",
                            borderLeftColor: r.color,
                        }}
                    >
                        <div className="text-sm font-bold mb-1" style={{ color: r.color }}>{r.reg}</div>
                        <div className="text-[10px] font-semibold mb-2" style={{ color: C.textMuted }}>{r.ref}</div>
                        <div className="text-xs mb-2" style={{ color: C.textSecondary }}>{r.xp}</div>
                        <div
                            className="text-[10px] px-2 py-0.5 rounded-full inline-block font-medium"
                            style={{ backgroundColor: `${r.color}10`, color: r.color }}
                        >
                            {r.sectors}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
