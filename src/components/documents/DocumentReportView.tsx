/**
 * DocumentReportView — AEGIS v3.1-alpha · Phase 4 F1
 *
 * Formulaire de saisie + rendu structuré + export PDF
 * Tier STANDARD — Rapport Écarts/Risques/Non-Conformités
 *
 * Design : inline styles C.* uniquement (cohérent AegisIntelligence)
 */

import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLang } from '../homepage/LangContext';
import { C } from '../homepage/constants';
import {
    generateGapRiskReport,
    AVAILABLE_REGULATIONS,
    type GeneratedReport,
    type ReportInput,
} from '../../services/documentGenerationService';

// ── i18n labels ──

const labels = {
    fr: {
        title: '📄 Diagnostic Technique de Conformité',
        subtitle: 'Génération automatique IA — AEGIS Intelligence',
        sector: 'Secteur industriel',
        sectorPlaceholder: 'ex: Automobile, Aéronautique, Batteries, Ferroviaire…',
        product: 'Type de produit',
        productPlaceholder: 'ex: Système de freinage ABS, Module batterie Li-ion…',
        regulations: 'Réglementations ciblées',
        context: 'Contexte additionnel (optionnel)',
        contextPlaceholder: 'Précisez toute contrainte spécifique…',
        generate: '🔍 Générer le rapport',
        generating: '⏳ Analyse en cours…',
        export: '📥 Exporter PDF',
        close: '✕ Fermer',
        summary: 'Synthèse',
        gaps: 'Écarts Réglementaires',
        risks: 'Risques Identifiés',
        nonConf: 'Non-Conformités',
        recs: 'Recommandations Prioritaires',
        critical: 'CRITIQUE',
        major: 'MAJEUR',
        minor: 'MINEUR',
        noItems: 'Aucun élément identifié',
        error: 'Erreur lors de la génération. Vérifiez la connexion et réessayez.',
        premiumBanner: '🔒 Dossier des Charges, SBOM, AMEC/FMEA — disponibles en tier PREMIUM',
    },
    en: {
        title: '📄 Technical Compliance Diagnostic',
        subtitle: 'AI-Powered Auto-Generation — AEGIS Intelligence',
        sector: 'Industrial sector',
        sectorPlaceholder: 'e.g. Automotive, Aerospace, Batteries, Railway…',
        product: 'Product type',
        productPlaceholder: 'e.g. ABS braking system, Li-ion battery module…',
        regulations: 'Target regulations',
        context: 'Additional context (optional)',
        contextPlaceholder: 'Specify any specific constraints…',
        generate: '🔍 Generate report',
        generating: '⏳ Analysis in progress…',
        export: '📥 Export PDF',
        close: '✕ Close',
        summary: 'Summary',
        gaps: 'Regulatory Gaps',
        risks: 'Identified Risks',
        nonConf: 'Non-Conformities',
        recs: 'Priority Recommendations',
        critical: 'CRITICAL',
        major: 'MAJOR',
        minor: 'MINOR',
        noItems: 'No items identified',
        error: 'Generation error. Please check connection and retry.',
        premiumBanner: '🔒 Spec Sheet, SBOM, AMEC/FMEA — available in PREMIUM tier',
    },
};

// ── Severity colors ──

const severityColors: Record<string, string> = {
    critical: '#ef4444',
    major: '#f59e0b',
    minor: '#3b82f6',
};

// ── Component ──

interface DocumentReportViewProps {
    onClose: () => void;
}

const DocumentReportView: React.FC<DocumentReportViewProps> = ({ onClose }) => {
    const { lang } = useLang();
    const t = labels[lang];

    const [sector, setSector] = useState('');
    const [productType, setProductType] = useState('');
    const [selectedRegs, setSelectedRegs] = useState<string[]>([]);
    const [additionalContext, setAdditionalContext] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [report, setReport] = useState<GeneratedReport | null>(null);
    const [error, setError] = useState('');

    const reportRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const toggleReg = (id: string) => {
        setSelectedRegs(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    const handleGenerate = async () => {
        if (!sector.trim() || !productType.trim() || selectedRegs.length === 0) return;

        setIsGenerating(true);
        setError('');
        setReport(null);

        try {
            const input: ReportInput = {
                sector: sector.trim(),
                productType: productType.trim(),
                regulations: selectedRegs.map(id =>
                    AVAILABLE_REGULATIONS.find(r => r.id === id)?.label ?? id
                ),
                additionalContext: additionalContext.trim() || undefined,
                lang,
            };
            const result = await generateGapRiskReport(input);
            setReport(result);
            // Scroll panel to top so user sees full report from title
            requestAnimationFrame(() => {
                if (panelRef.current) panelRef.current.scrollTop = 0;
            });
        } catch {
            setError(t.error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExportPDF = async () => {
        const el = reportRef.current;
        if (!el) return;

        const html2pdf = (await import('html2pdf.js')).default;
        const filename = `AEGIS_Report_${sector.replace(/\s+/g, '_')}_${report?.date ?? 'draft'}.pdf`;
        const opt = {
            margin: 10,
            filename,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
        };

        // Chrome mobile blocks blob downloads — use window.open fallback
        const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
        if (isMobile) {
            try {
                const blob: Blob = await html2pdf().set(opt).from(el).output('blob');
                const blobUrl = URL.createObjectURL(blob);
                window.open(blobUrl, '_blank');
                setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
            } catch {
                // Fallback: try direct save
                html2pdf().set(opt).from(el).save();
            }
        } else {
            html2pdf().set(opt).from(el).save();
        }
    };

    const canGenerate = sector.trim() && productType.trim() && selectedRegs.length > 0 && !isGenerating;

    // ── Styles ──

    const overlay: React.CSSProperties = {
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: report ? 'center' : 'flex-end',
        justifyContent: 'center',
        padding: report ? 20 : 0,
    };

    const panel: React.CSSProperties = {
        background: C.bg,
        borderRadius: report ? 20 : '20px 20px 0 0',
        maxWidth: 780,
        width: '100%',
        maxHeight: report ? '92vh' : '88vh',
        overflowY: 'auto',
        boxShadow: C.shadowLg, border: `1px solid ${C.border}`,
        position: 'relative',
        WebkitOverflowScrolling: 'touch',
    };

    const header: React.CSSProperties = {
        padding: '16px 16px 0', position: 'sticky', top: 0,
        background: C.bg, zIndex: 1, borderBottom: `1px solid ${C.border}`,
        paddingBottom: 12,
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '12px 14px', borderRadius: 12,
        border: `1px solid ${C.borderStrong}`, background: C.surface,
        color: C.text, fontSize: 16, fontFamily: 'inherit',
        outline: 'none',
    };

    const labelStyle: React.CSSProperties = {
        fontSize: 11, fontWeight: 700, color: C.textSecondary,
        marginBottom: 4, display: 'block', textTransform: 'uppercase',
        letterSpacing: '0.5px',
    };

    return createPortal(
        <div style={overlay} onClick={onClose}>
            <div ref={panelRef} style={panel} onClick={e => e.stopPropagation()}>

                {/* ── Header ── */}
                <div style={header}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <h2 style={{ fontSize: 15, fontWeight: 800, color: C.text, margin: 0 }}>
                                {t.title}
                            </h2>
                            {!report && (
                                <p style={{ fontSize: 11, color: C.textMuted, margin: '4px 0 0' }}>
                                    {t.subtitle}
                                </p>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
                            {report && (
                                <>
                                    <button
                                        onClick={() => setReport(null)}
                                        style={{
                                            fontSize: 10, padding: '6px 10px', borderRadius: 10,
                                            background: C.surface, border: `1px solid ${C.border}`,
                                            color: C.textSecondary, cursor: 'pointer', fontFamily: 'inherit',
                                        }}
                                    >
                                        ← {lang === 'fr' ? 'Nouveau' : 'New'}
                                    </button>
                                    <button
                                        onClick={handleExportPDF}
                                        style={{
                                            fontSize: 10, padding: '6px 12px', borderRadius: 10,
                                            background: C.gradientBlue, border: 'none',
                                            color: '#fff', cursor: 'pointer', fontWeight: 700,
                                            fontFamily: 'inherit',
                                        }}
                                    >
                                        {t.export}
                                    </button>
                                </>
                            )}
                            <button
                                onClick={onClose}
                                style={{
                                    background: 'none', border: 'none', fontSize: 14,
                                    color: C.textMuted, cursor: 'pointer', fontFamily: 'inherit',
                                    padding: '4px 8px',
                                }}
                            >
                                {t.close}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Body ── */}
                <div style={{ padding: '16px 16px 20px' }}>

                    {/* Form — only show when no report yet */}
                    {!report && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                            {/* Sector */}
                            <div>
                                <label style={labelStyle}>{t.sector}</label>
                                <input
                                    style={inputStyle}
                                    value={sector}
                                    onChange={e => setSector(e.target.value)}
                                    placeholder={t.sectorPlaceholder}
                                />
                            </div>

                            {/* Product type */}
                            <div>
                                <label style={labelStyle}>{t.product}</label>
                                <input
                                    style={inputStyle}
                                    value={productType}
                                    onChange={e => setProductType(e.target.value)}
                                    placeholder={t.productPlaceholder}
                                />
                            </div>

                            {/* Regulations */}
                            <div>
                                <label style={labelStyle}>{t.regulations}</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {AVAILABLE_REGULATIONS.map(reg => {
                                        const isActive = selectedRegs.includes(reg.id);
                                        return (
                                            <button
                                                key={reg.id}
                                                onClick={() => toggleReg(reg.id)}
                                                style={{
                                                    fontSize: 10, padding: '5px 10px', borderRadius: 16,
                                                    border: `1px solid ${isActive ? C.accent : C.border}`,
                                                    background: isActive ? `${C.accent}12` : C.surface,
                                                    color: isActive ? C.accent : C.textSecondary,
                                                    fontWeight: isActive ? 700 : 500, cursor: 'pointer',
                                                    fontFamily: 'inherit', transition: 'all 0.2s',
                                                }}
                                            >
                                                {reg.short}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Additional context */}
                            <div>
                                <label style={labelStyle}>{t.context}</label>
                                <textarea
                                    style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
                                    value={additionalContext}
                                    onChange={e => setAdditionalContext(e.target.value)}
                                    placeholder={t.contextPlaceholder}
                                />
                            </div>

                            {/* Error */}
                            {error && (
                                <div style={{
                                    fontSize: 12, color: '#ef4444', padding: '8px 12px',
                                    borderRadius: 8, background: '#ef444410',
                                    border: '1px solid #ef444425',
                                }}>
                                    {error}
                                </div>
                            )}

                            {/* Generate button */}
                            <button
                                onClick={handleGenerate}
                                disabled={!canGenerate}
                                style={{
                                    padding: '12px 20px', borderRadius: 14,
                                    background: canGenerate ? C.gradientBlue : C.surface,
                                    color: canGenerate ? '#fff' : C.textMuted,
                                    border: canGenerate ? 'none' : `1px solid ${C.border}`,
                                    fontSize: 13, fontWeight: 700, cursor: canGenerate ? 'pointer' : 'not-allowed',
                                    fontFamily: 'inherit', transition: 'all 0.2s',
                                }}
                            >
                                {isGenerating ? t.generating : t.generate}
                            </button>


                        </div>
                    )}

                    {/* ── Report Render ── */}
                    {report && (
                        <div>
                            {/* PDF-renderable content */}
                            <div ref={reportRef} style={{ fontSize: 12, color: C.text }}>
                                {/* Report header */}
                                <div style={{
                                    textAlign: 'center', marginBottom: 24,
                                    paddingBottom: 16, borderBottom: `2px solid ${C.accent}`,
                                }}>
                                    <div style={{
                                        fontSize: 9, fontWeight: 700, letterSpacing: 2,
                                        color: C.accent, marginBottom: 6, textTransform: 'uppercase',
                                    }}>
                                        AEGIS INTELLIGENCE · COMPLIANCE REPORT
                                    </div>
                                    <h3 style={{
                                        fontSize: 16, fontWeight: 800, color: C.text,
                                        margin: '0 0 6px',
                                    }}>
                                        {report.title}
                                    </h3>
                                    <div style={{ fontSize: 10, color: C.textMuted }}>
                                        {report.date} · {report.input.regulations.join(' · ')}
                                    </div>
                                </div>

                                {/* Summary */}
                                <ReportBlock title={t.summary} color={C.accent}>
                                    <p style={{ lineHeight: 1.7, color: C.textSecondary }}>
                                        {report.summary || '—'}
                                    </p>
                                </ReportBlock>

                                {/* Gaps */}
                                <ReportBlock title={t.gaps} color={severityColors.critical}>
                                    <ItemList items={report.gaps.items} t={t} />
                                </ReportBlock>

                                {/* Risks */}
                                <ReportBlock title={t.risks} color={severityColors.major}>
                                    <ItemList items={report.risks.items} t={t} />
                                </ReportBlock>

                                {/* Non-Conformities */}
                                <ReportBlock title={t.nonConf} color={severityColors.minor}>
                                    <ItemList items={report.nonConformities.items} t={t} />
                                </ReportBlock>

                                {/* Recommendations */}
                                <ReportBlock title={t.recs} color={C.emerald}>
                                    {report.recommendations.length > 0 ? (
                                        <ol style={{ margin: 0, paddingLeft: 18 }}>
                                            {report.recommendations.map((rec, i) => (
                                                <li key={i} style={{
                                                    marginBottom: 6, lineHeight: 1.6,
                                                    color: C.textSecondary,
                                                }}>
                                                    {rec}
                                                </li>
                                            ))}
                                        </ol>
                                    ) : (
                                        <p style={{ color: C.textMuted }}>{t.noItems}</p>
                                    )}
                                </ReportBlock>

                                {/* Footer */}
                                <div style={{
                                    textAlign: 'center', fontSize: 9, color: C.textMuted,
                                    marginTop: 24, paddingTop: 12,
                                    borderTop: `1px solid ${C.border}`,
                                }}>
                                    AEGIS Intelligence v3.1 · jeanpierrecharles.com ·{' '}
                                    {lang === 'fr' ? 'Généré automatiquement par IA' : 'AI-generated report'}
                                </div>
                            </div>

                            {/* ── Sticky footer bar — always visible ── */}
                            <div style={{
                                display: 'flex', justifyContent: 'center', gap: 8,
                                padding: '12px 16px',
                                position: 'sticky', bottom: 0,
                                background: C.bg,
                                borderTop: `1px solid ${C.border}`,
                                marginTop: 20,
                                marginLeft: -16, marginRight: -16,
                                borderRadius: '0 0 20px 20px',
                            }}>
                                <button
                                    onClick={() => setReport(null)}
                                    style={{
                                        fontSize: 12, padding: '10px 20px', borderRadius: 12,
                                        background: C.surface, border: `1px solid ${C.border}`,
                                        color: C.textSecondary, cursor: 'pointer', fontFamily: 'inherit',
                                        fontWeight: 600,
                                    }}
                                >
                                    ← {lang === 'fr' ? 'Nouveau rapport' : 'New report'}
                                </button>
                                <button
                                    onClick={handleExportPDF}
                                    style={{
                                        fontSize: 12, padding: '10px 24px', borderRadius: 12,
                                        background: C.gradientBlue, border: 'none',
                                        color: '#fff', cursor: 'pointer', fontWeight: 700,
                                        fontFamily: 'inherit', boxShadow: C.shadowMed,
                                    }}
                                >
                                    {t.export}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

// ── Sub-components ──

const ReportBlock: React.FC<{
    title: string;
    color: string;
    children: React.ReactNode;
}> = ({ title, color, children }) => (
    <div style={{ marginBottom: 20 }}>
        <h4 style={{
            fontSize: 12, fontWeight: 800, color, margin: '0 0 10px',
            textTransform: 'uppercase', letterSpacing: '0.5px',
            paddingBottom: 6, borderBottom: `2px solid ${color}20`,
        }}>
            {title}
        </h4>
        {children}
    </div>
);

const ItemList: React.FC<{
    items: GeneratedReport['gaps']['items'];
    t: typeof labels['fr'];
}> = ({ items, t }) => {
    if (items.length === 0) {
        return <p style={{ fontSize: 11, color: C.textMuted }}>{t.noItems}</p>;
    }

    const severityLabel = (s: string) => {
        const map: Record<string, string> = {
            critical: t.critical,
            major: t.major,
            minor: t.minor,
        };
        return map[s] || s;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((item, i) => (
                <div key={i} style={{
                    padding: '10px 14px', borderRadius: 10,
                    background: `${severityColors[item.severity]}06`,
                    border: `1px solid ${severityColors[item.severity]}18`,
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        marginBottom: 4,
                    }}>
                        <span style={{
                            fontSize: 9, fontWeight: 800, padding: '2px 6px',
                            borderRadius: 4, color: '#fff',
                            background: severityColors[item.severity],
                        }}>
                            {item.id}
                        </span>
                        <span style={{
                            fontSize: 9, fontWeight: 700,
                            color: severityColors[item.severity],
                        }}>
                            {severityLabel(item.severity)}
                        </span>
                    </div>
                    <p style={{
                        fontSize: 11, color: C.text, lineHeight: 1.6,
                        margin: '0 0 4px',
                    }}>
                        {item.description}
                    </p>
                    <div style={{
                        fontSize: 9, color: C.textMuted, lineHeight: 1.5,
                    }}>
                        <strong>Réf :</strong> {item.reference} · <strong>Action :</strong> {item.recommendation}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DocumentReportView;
