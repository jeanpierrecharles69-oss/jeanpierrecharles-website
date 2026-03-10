import { useState } from "react";
import { C } from "../homepage/constants";

interface ContactModalProps {
    onClose: () => void;
    lang: string;
}

export default function ContactModal({ onClose, lang }: ContactModalProps) {
    const isFR = lang === "fr";
    const [copied, setCopied] = useState<"" | "email" | "template">("");

    const emailAddr = "contact@jeanpierrecharles.com";

    const subjectText = isFR
        ? "Demande de Diagnostic Transformation Industrie 5.0"
        : "Request for Industry 5.0 Transformation Diagnostic";

    const bodyText = isFR
        ? "Bonjour,\n\nJe souhaiterais obtenir un diagnostic pour la transformation Industrie 5.0 de mon organisation.\n\nNom de l'entreprise :\nSecteur d'activit\u00e9 :\nPrincipaux enjeux :\n\nCordialement,"
        : "Hello,\n\nI would like to request a diagnostic for the Industry 5.0 transformation of my organisation.\n\nCompany name:\nIndustry sector:\nMain challenges:\n\nBest regards,";

    const subject = encodeURIComponent(subjectText);
    const body = encodeURIComponent(bodyText);
    const mailtoHref = `mailto:${emailAddr}?subject=${subject}&body=${body}`;

    const handleCopy = async (text: string, type: "email" | "template") => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(type);
            setTimeout(() => setCopied(""), 2000);
        } catch {
            // Fallback for older browsers
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            setCopied(type);
            setTimeout(() => setCopied(""), 2000);
        }
    };

    const handleOpenEmail = () => {
        // Primary: location.href (works on most browsers)
        window.location.href = mailtoHref;
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                background: "rgba(0,0,0,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: "#fff",
                    borderRadius: 20,
                    maxWidth: 520,
                    width: "100%",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    padding: "32px 28px",
                    position: "relative",
                    boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        background: "none",
                        border: "none",
                        fontSize: 22,
                        cursor: "pointer",
                        color: "#94a3b8",
                        lineHeight: 1,
                    }}
                    aria-label={isFR ? "Fermer" : "Close"}
                >
                    &times;
                </button>

                {/* Title */}
                <h2
                    style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#1e293b",
                        marginBottom: 8,
                    }}
                >
                    {isFR
                        ? "Demande de Diagnostic Transformation Industrie 5.0"
                        : "Request for Industry 5.0 Transformation Diagnostic"}
                </h2>

                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20, lineHeight: 1.6 }}>
                    {isFR
                        ? "Cliquez sur le bouton ci-dessous pour envoyer votre demande par email. Le formulaire sera pr\u00e9-rempli."
                        : "Click the button below to send your request by email. The form will be pre-filled."}
                </p>

                {/* Info block */}
                <div
                    style={{
                        background: "#f8fafc",
                        borderRadius: 12,
                        padding: "14px 18px",
                        border: "1px solid #e2e8f0",
                        marginBottom: 20,
                    }}
                >
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 8 }}>
                        {isFR ? "Informations pr\u00e9-remplies :" : "Pre-filled information:"}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                        <strong style={{ color: "#475569" }}>{isFR ? "\u00c0" : "To"} :</strong>{" "}
                        {emailAddr}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>
                        <strong style={{ color: "#475569" }}>{isFR ? "Objet" : "Subject"} :</strong>{" "}
                        {subjectText}
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "pre-line", lineHeight: 1.6, borderTop: "1px solid #e2e8f0", paddingTop: 8 }}>
                        {bodyText}
                    </div>
                </div>

                {/* Primary CTA — Open email client */}
                <button
                    onClick={handleOpenEmail}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        width: "100%",
                        padding: "14px 24px",
                        borderRadius: 12,
                        background: C.gradientBlue || "#1e293b",
                        color: "#fff",
                        fontSize: 14,
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "opacity 0.2s",
                    }}
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ width: 18, height: 18 }}
                    >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                    </svg>
                    {isFR ? "Ouvrir Mon Client Email" : "Open My Email Client"}
                </button>

                {/* Separator */}
                <div style={{
                    display: "flex", alignItems: "center", gap: 12,
                    margin: "16px 0", color: "#cbd5e1", fontSize: 11,
                }}>
                    <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                    {isFR ? "ou copiez les informations" : "or copy the information"}
                    <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                </div>

                {/* Fallback — Copy buttons */}
                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        onClick={() => handleCopy(emailAddr, "email")}
                        style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            padding: "10px 16px",
                            borderRadius: 10,
                            background: copied === "email" ? "#ecfdf5" : "#f8fafc",
                            color: copied === "email" ? "#059669" : "#475569",
                            fontSize: 12,
                            fontWeight: 600,
                            border: `1px solid ${copied === "email" ? "#a7f3d0" : "#e2e8f0"}`,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            transition: "all 0.2s",
                        }}
                    >
                        {copied === "email" ? "\u2705" : "\ud83d\udccb"}{" "}
                        {copied === "email"
                            ? (isFR ? "Copi\u00e9 !" : "Copied!")
                            : (isFR ? "Copier l'email" : "Copy email")}
                    </button>
                    <button
                        onClick={() => handleCopy(
                            `${isFR ? "Objet" : "Subject"}: ${subjectText}\n\n${bodyText}`,
                            "template",
                        )}
                        style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            padding: "10px 16px",
                            borderRadius: 10,
                            background: copied === "template" ? "#ecfdf5" : "#f8fafc",
                            color: copied === "template" ? "#059669" : "#475569",
                            fontSize: 12,
                            fontWeight: 600,
                            border: `1px solid ${copied === "template" ? "#a7f3d0" : "#e2e8f0"}`,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            transition: "all 0.2s",
                        }}
                    >
                        {copied === "template" ? "\u2705" : "\ud83d\udccb"}{" "}
                        {copied === "template"
                            ? (isFR ? "Copi\u00e9 !" : "Copied!")
                            : (isFR ? "Copier le message" : "Copy message")}
                    </button>
                </div>

                <p
                    style={{
                        fontSize: 11,
                        color: "#94a3b8",
                        textAlign: "center",
                        marginTop: 12,
                    }}
                >
                    {isFR
                        ? "Si votre client email ne s'ouvre pas, copiez les informations ci-dessus et collez-les dans votre messagerie."
                        : "If your email client doesn't open, copy the information above and paste it into your email application."}
                </p>
            </div>
        </div>
    );
}
