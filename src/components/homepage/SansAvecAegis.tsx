import { useLang } from "./LangContext";
import { C } from "./constants";

export default function SansAvecAegis() {
    const { t } = useLang();

    return (
        <section
            className="rounded-2xl px-6 py-10"
            style={{ backgroundColor: C.surfaceAlt }}
        >
            <h2 className="text-xl lg:text-2xl font-bold text-center mb-6 tracking-tight" style={{ color: C.text }}>
                {t.compTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sans Aegis */}
                <div
                    className="rounded-2xl p-5"
                    style={{
                        backgroundColor: C.surface,
                        border: `1px solid ${C.rose}15`,
                        boxShadow: C.shadowSoft,
                    }}
                >
                    <h3 className="text-sm font-bold mb-3" style={{ color: C.rose }}>{t.compSans}</h3>
                    <ul className="space-y-2">
                        {t.compSansList.map((item, i) => (
                            <li key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: C.textSecondary }}>
                                <span style={{ color: C.rose }}>✕</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Avec Aegis */}
                <div
                    className="rounded-2xl p-5"
                    style={{
                        backgroundColor: C.surface,
                        border: `1px solid ${C.emerald}15`,
                        boxShadow: C.shadowSoft,
                    }}
                >
                    <h3 className="text-sm font-bold mb-3" style={{ color: C.emerald }}>{t.compAvec}</h3>
                    <ul className="space-y-2">
                        {t.compAvecList.map((item, i) => (
                            <li key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: C.textSecondary }}>
                                <span style={{ color: C.emerald }}>✓</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
