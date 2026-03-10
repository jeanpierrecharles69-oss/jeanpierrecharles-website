import { useLang } from "./LangContext";
import { C } from "./constants";

export default function ServicesSection() {
    const { t } = useLang();

    return (
        <section
            id="services"
            className="rounded-2xl px-6 py-10"
            style={{ backgroundColor: C.surface, boxShadow: C.shadowSoft }}
            aria-labelledby="services-heading"
        >
            <h2
                id="services-heading"
                className="text-2xl lg:text-3xl font-bold text-center mb-8 tracking-tight"
                style={{ color: C.text }}
            >
                {t.svcTitle}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {t.services.map((svc, i) => (
                    <div
                        key={i}
                        className="rounded-2xl p-6 flex flex-col gap-3 transition-all hover:shadow-lg"
                        style={{
                            backgroundColor: C.surfaceAlt,
                            border: `1px solid ${C.border}`,
                        }}
                    >
                        <div className="text-3xl">{svc.icon}</div>
                        <h3 className="text-base font-bold" style={{ color: C.text }}>{svc.title}</h3>
                        <p className="text-xs leading-relaxed flex-1" style={{ color: C.textSecondary }}>{svc.desc}</p>
                        <div
                            className="text-[11px] font-semibold mt-auto pt-3"
                            style={{ color: svc.color, borderTop: `1px solid ${C.border}` }}
                        >
                            {svc.tier}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
