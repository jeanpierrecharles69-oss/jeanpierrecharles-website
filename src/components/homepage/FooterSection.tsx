import { useState } from "react";
import { useLang } from "./LangContext";
import { C } from "./constants";
import ContactModal from "../common/ContactModal";

/* -- Mentions Legales Modal -- */
function MentionsLegalesModal({ onClose, lang }: { onClose: () => void; lang: string }) {
    const isFR = lang === "fr";
    return (
        <div
            style={{
                position: "fixed", inset: 0, zIndex: 9999,
                background: "rgba(0,0,0,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: 20,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: "#fff", borderRadius: 16, maxWidth: 600,
                    width: "100%", maxHeight: "80vh", overflowY: "auto",
                    padding: "32px 28px", position: "relative",
                    boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute", top: 16, right: 16,
                        background: "none", border: "none", fontSize: 20,
                        cursor: "pointer", color: "#64748b", lineHeight: 1,
                    }}
                    aria-label="Fermer"
                >
                    &times;
                </button>

                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", marginBottom: 20 }}>
                    {isFR ? "Mentions L\u00e9gales & Identit\u00e9" : "Legal Notice & Identity"}
                </h2>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                    <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 16px", border: "1px solid #e2e8f0" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
                            {isFR ? "Identit\u00e9 : CHARLES Jean-Pierre" : "Identity: CHARLES Jean-Pierre"}
                        </div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>
                            {isFR ? "Forme Juridique : Entrepreneur individuel (Lib\u00e9ral non r\u00e8glement\u00e9)" : "Legal form: Sole proprietor (Unregulated liberal)"}
                        </div>
                    </div>
                    <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 16px", border: "1px solid #e2e8f0" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
                            {isFR ? "Nom commercial : JeanPierreCharles" : "Trade name: JeanPierreCharles"}
                        </div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>
                            {isFR ? "Directeur de la publication : Jean-Pierre Charles" : "Publication director: Jean-Pierre Charles"}
                        </div>
                    </div>
                </div>

                <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 16px", border: "1px solid #e2e8f0", marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>Identification</div>
                    <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.8 }}>
                        SIREN : 522 794 700<br />
                        SIRET : 522 794 700 00032<br />
                        Code APE : 7112B - Ingénierie, études techniques
                    </div>
                </div>

                <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 16px", border: "1px solid #e2e8f0", marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
                        {isFR ? "Coordonn\u00e9es" : "Registered office"}
                    </div>
                    <div style={{ fontSize: 11, color: "#475569" }}>
                        {isFR ? "Si\u00e8ge social : 10 La Bertini\u00e8re, 86800 Terc\u00e9, FRANCE" : "Registered office: 10 La Bertini\u00e8re, 86800 Terc\u00e9, FRANCE"}
                    </div>
                </div>

                <div style={{ background: "#f0f9ff", borderRadius: 10, padding: "12px 16px", border: "1px solid #bae6fd", marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
                        {isFR ? "Activit\u00e9" : "Activity"}
                    </div>
                    <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.6 }}>
                        {isFR
                            ? "Ing\u00e9nierie, expertise technique industrielle, planification strat\u00e9gique, transformation digitale, d\u00e9carbonation, \u00e9coconception produits, syst\u00e8mes cyberphysiques, int\u00e9gration IA, agents copilotes, gestion compliance et risques."
                            : "Engineering, industrial technical expertise, strategic planning, digital transformation, decarbonisation, product ecodesign, cyberphysical systems, AI integration, copilot agents, compliance and risk management."}
                    </div>
                </div>

                <div style={{ textAlign: "center" }}>
                    <button
                        onClick={onClose}
                        style={{
                            fontSize: 13, fontWeight: 600, padding: "10px 32px",
                            borderRadius: 10, background: "#1e293b", color: "#fff",
                            border: "none", cursor: "pointer",
                        }}
                    >
                        {isFR ? "Fermer" : "Close"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function FooterSection() {
    const { t, lang } = useLang();
    const [showMentions, setShowMentions] = useState(false);
    const [showContact, setShowContact] = useState(false);
    const isFR = lang === "fr";

    return (
        <>
            <footer
                className="px-6 py-10 mt-6"
                style={{
                    backgroundColor: C.surfaceAlt,
                    borderTop: `1px solid ${C.border}`,
                }}
            >
                <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-extrabold text-white"
                                style={{ background: C.gradientBlue }}
                            >
                                AE
                            </div>
                            <span className="text-sm font-bold" style={{ color: C.text }}>AEGIS CIRCULAR</span>
                        </div>
                        <p className="text-xs whitespace-pre-line leading-relaxed" style={{ color: C.textSecondary }}>
                            {t.footerDesc}
                        </p>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h3 className="text-[10px] font-bold tracking-widest mb-3" style={{ color: C.textMuted }}>
                            {isFR ? "NAVIGATION" : "NAVIGATION"}
                        </h3>
                        <ul className="space-y-1.5">
                            <li>
                                <a
                                    href="#pricing"
                                    className="text-xs transition-colors hover:opacity-70"
                                    style={{ color: C.textSecondary }}
                                >
                                    {isFR ? "Tarifs" : "Pricing"}
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#expertise"
                                    className="text-xs transition-colors hover:opacity-70"
                                    style={{ color: C.textSecondary }}
                                >
                                    {isFR ? "Expertise" : "Expertise"}
                                </a>
                            </li>
                            <li>
                                <button
                                    onClick={() => setShowMentions(true)}
                                    className="text-xs transition-colors hover:opacity-70"
                                    style={{
                                        color: C.textSecondary,
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: 0,
                                        fontFamily: "inherit",
                                    }}
                                >
                                    {isFR ? "Mentions l\u00e9gales" : "Legal notice"}
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-[10px] font-bold tracking-widest mb-3" style={{ color: C.textMuted }}>
                            CONTACT
                        </h3>
                        <ul className="space-y-1.5">
                            <li>
                                <a
                                    href="mailto:contact@jeanpierrecharles.com"
                                    className="text-xs transition-colors hover:opacity-70"
                                    style={{ color: C.textSecondary }}
                                >
                                    contact@jeanpierrecharles.com
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://www.linkedin.com/in/jpcharles6918/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs transition-colors hover:opacity-70"
                                    style={{ color: C.textSecondary }}
                                >
                                    LinkedIn
                                </a>
                            </li>
                            <li>
                                <button
                                    onClick={() => setShowContact(true)}
                                    className="text-xs transition-colors hover:opacity-70"
                                    style={{
                                        color: C.textSecondary,
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: 0,
                                        fontFamily: "inherit",
                                    }}
                                >
                                    {isFR ? "Formulaire de contact" : "Contact form"}
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div
                    className="text-center text-[10px] mt-8 pt-4"
                    style={{ color: C.textMuted, borderTop: `1px solid ${C.border}` }}
                >
                    &copy; {new Date().getFullYear()} Jean-Pierre Charles &mdash; AEGIS CIRCULAR
                </div>
            </footer>

            {showMentions && <MentionsLegalesModal onClose={() => setShowMentions(false)} lang={lang} />}
            {showContact && <ContactModal onClose={() => setShowContact(false)} lang={lang} />}
        </>
    );
}
