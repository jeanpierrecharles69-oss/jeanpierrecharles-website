import React, { useState, useRef, useEffect } from 'react';
import { useLang } from '../homepage/LangContext';
import { C } from '../homepage/constants';
import { runQueryStream } from '../../services/geminiService';
import { enrichPromptWithRegulation } from '../../services/regulationKnowledgeService';
import { hasAIConsent } from '../common/CookieBanner';
import { ChatMessage } from '../../types';
import { PaperAirplaneIcon } from '../icons/PaperAirplaneIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import DocumentReportView from '../documents/DocumentReportView';

// ── PDF Export Icon (inline SVG) ──
const DownloadIcon: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, ...style }}>
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

// System instructions — reprises de AegisChat.tsx (cohérence)
const SYSTEM_INSTRUCTIONS: Record<'fr' | 'en', string> = {
    fr: `Tu es AEGIS Intelligence, l'analyste IA de conformité réglementaire de Jean-Pierre Charles.
Tu es spécialisé dans la conformité industrielle européenne (AI Act, Règlement Machines 2023/1230, ESPR, CRA, RGPD, Batteries 2023/1542, Data Act, NIS2, DORA).
Réponds TOUJOURS en français, de manière précise et structurée, en citant les articles de loi pertinents.
Tu représentes 32 ans d'expertise R&D terrain (Autoliv, Saft, Faurecia, Forsee Power).
Si la question sort du périmètre réglementaire EU industriel, redirige poliment.`,
    en: `You are AEGIS Intelligence, the regulatory AI compliance analyst of Jean-Pierre Charles.
You specialize in European industrial compliance (AI Act, Machinery Regulation 2023/1230, ESPR, CRA, GDPR, Batteries 2023/1542, Data Act, NIS2, DORA).
ALWAYS respond in English, with precision and structure, citing relevant legal articles.
You represent 32 years of hands-on R&D expertise (Autoliv, Saft, Faurecia, Forsee Power).
If the question falls outside EU industrial regulatory scope, politely redirect.`,
};

interface AegisIntelligenceProps {
    mode?: 'hero' | 'full';
    onScrollToPricing?: () => void;
    onScrollToExpertise?: () => void;
}

const AegisIntelligence: React.FC<AegisIntelligenceProps> = ({
    mode = 'hero',
    onScrollToPricing,
    onScrollToExpertise,
}) => {
    const { t, lang } = useLang();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [consent, setConsent] = useState(hasAIConsent());
    const [showReport, setShowReport] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const chatZoneRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = () => setConsent(hasAIConsent());
        window.addEventListener('consentChanged', handler);
        return () => window.removeEventListener('consentChanged', handler);
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (questionOverride?: string) => {
        const trimmed = (questionOverride ?? input).trim();
        if (!trimmed || isStreaming) return;

        if (!consent) {
            setMessages(prev => [...prev, {
                role: 'model',
                text: lang === 'en'
                    ? '⚠️ Please accept functional cookies to use the AI assistant.'
                    : '⚠️ Veuillez accepter les cookies fonctionnels pour utiliser l\'assistant IA.'
            }]);
            return;
        }

        const userMessage: ChatMessage = { role: 'user', text: trimmed };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsStreaming(true);

        try {
            const { systemAddition } = enrichPromptWithRegulation(trimmed);
            const baseSystem = SYSTEM_INSTRUCTIONS[lang] ?? SYSTEM_INSTRUCTIONS.fr;
            const fullSystem = systemAddition
                ? `${baseSystem}\n\n--- REGULATORY CONTEXT ---\n${systemAddition}`
                : baseSystem;

            let responseText = '';
            setMessages(prev => [...prev, { role: 'model', text: '' }]);

            for await (const chunk of runQueryStream(trimmed, fullSystem)) {
                responseText += chunk;
                setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { role: 'model', text: responseText };
                    return updated;
                });
            }
        } catch {
            setMessages(prev => [...prev, {
                role: 'model',
                text: lang === 'en'
                    ? '⚠️ Service temporarily unavailable. Please try again.'
                    : '⚠️ Service momentanément indisponible. Veuillez réessayer.'
            }]);
        } finally {
            setIsStreaming(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleExportConversationPDF = async () => {
        if (messages.length === 0 || isExporting) return;
        setIsExporting(true);

        try {
            const html2pdf = (await import('html2pdf.js')).default;

            // Build a clean HTML version for PDF rendering
            const dateStr = new Date().toISOString().split('T')[0];
            const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

            const wrapper = document.createElement('div');
            wrapper.style.fontFamily = "'Inter', 'Segoe UI', system-ui, sans-serif";
            wrapper.style.fontSize = '12px';
            wrapper.style.color = '#1e293b';
            wrapper.style.padding = '0';

            // Header
            wrapper.innerHTML = `
                <div style="text-align:center;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid ${C.accent}">
                    <div style="font-size:9px;font-weight:700;letter-spacing:2px;color:${C.accent};margin-bottom:6px;text-transform:uppercase">
                        AEGIS INTELLIGENCE · CONVERSATION EXPORT
                    </div>
                    <h3 style="font-size:16px;font-weight:800;color:${C.text};margin:0 0 6px">
                        ${lang === 'fr' ? 'Historique de conversation IA' : 'AI Conversation History'}
                    </h3>
                    <div style="font-size:10px;color:${C.textMuted}">
                        ${dateStr} · ${timeStr} · ${messages.length} ${lang === 'fr' ? 'messages' : 'messages'}
                    </div>
                </div>
            `;

            // Messages
            messages.forEach(msg => {
                const isUser = msg.role === 'user';
                const msgDiv = document.createElement('div');
                msgDiv.style.marginBottom = '12px';
                msgDiv.style.padding = '10px 14px';
                msgDiv.style.borderRadius = '10px';
                msgDiv.style.background = isUser ? '#eff6ff' : '#f8fafc';
                msgDiv.style.border = isUser ? '1px solid #bfdbfe' : '1px solid #e2e8f0';
                msgDiv.style.pageBreakInside = 'avoid';

                const label = document.createElement('div');
                label.style.fontSize = '9px';
                label.style.fontWeight = '700';
                label.style.marginBottom = '4px';
                label.style.color = isUser ? C.accent : C.emerald;
                label.textContent = isUser
                    ? (lang === 'en' ? '👤 You' : '👤 Vous')
                    : '✨ AEGIS Intelligence';
                msgDiv.appendChild(label);

                const content = document.createElement('div');
                content.style.fontSize = '11px';
                content.style.lineHeight = '1.7';
                content.style.whiteSpace = 'pre-wrap';
                content.style.wordBreak = 'break-word';
                content.textContent = msg.text;
                msgDiv.appendChild(content);

                wrapper.appendChild(msgDiv);
            });

            // Footer
            const footer = document.createElement('div');
            footer.style.textAlign = 'center';
            footer.style.fontSize = '9px';
            footer.style.color = '#94a3b8';
            footer.style.marginTop = '24px';
            footer.style.paddingTop = '12px';
            footer.style.borderTop = '1px solid #e2e8f0';
            footer.textContent = `AEGIS Intelligence v3.1 · jeanpierrecharles.com · ${lang === 'fr' ? 'Exporté le' : 'Exported on'} ${dateStr}`;
            wrapper.appendChild(footer);

            const filename = `AEGIS_Conversation_${dateStr}_${timeStr.replace(/:/g, 'h')}.pdf`;
            const opt = {
                margin: 10,
                filename,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
            };

            // Mobile fallback (same pattern as DocumentReportView)
            const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
            if (isMobile) {
                try {
                    const blob: Blob = await html2pdf().set(opt).from(wrapper).output('blob');
                    const blobUrl = URL.createObjectURL(blob);
                    window.open(blobUrl, '_blank');
                    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
                } catch {
                    html2pdf().set(opt).from(wrapper).save();
                }
            } else {
                html2pdf().set(opt).from(wrapper).save();
            }
        } catch (err) {
            console.error('PDF export error:', err);
        } finally {
            setIsExporting(false);
        }
    };

    const starters: string[] = (t.brainStarters as string[]) ?? [];

    return (
        <div
            style={{
                background: 'rgba(255,255,255,0.97)',
                border: `1px solid ${C.glassBorder}`,
                boxShadow: C.shadowLg,
                borderRadius: 20,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                width: '100%',
                maxWidth: mode === 'hero' ? 780 : '100%',
                margin: '0 auto',
                willChange: 'transform',
                transform: 'translateZ(0)',
            }}
            aria-label="AEGIS Intelligence — Analyste IA Conformité EU"
            role="region"
        >
            {/* ── HEADER ── */}
            <div style={{
                padding: '14px 20px',
                borderBottom: `1px solid ${C.border}`,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: `linear-gradient(135deg, ${C.accent}08, ${C.emerald}05)`,
            }}>
                {/* Médaillon JP */}
                <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: C.gradientBlue,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, color: '#fff',
                    border: '2px solid #fff', boxShadow: C.shadowMed, flexShrink: 0,
                }}>JP</div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <SparklesIcon style={{ width: 14, height: 14, color: C.accent }} />
                        {t.brainTitle}
                    </div>
                    <div style={{ fontSize: 9, color: C.textMuted, marginTop: 2 }}>
                        {lang === 'en'
                            ? '6 international groups · 8 EU regulations · Deterministic AI config'
                            : '6 groupes internationaux · 8 règlements EU · Config IA déterministe'}
                    </div>
                </div>
                {/* Indicateur live */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {messages.length > 0 && (
                        <button
                            id="aegis-export-pdf-btn"
                            onClick={handleExportConversationPDF}
                            disabled={isExporting || isStreaming}
                            title={lang === 'en' ? 'Export conversation as PDF' : 'Exporter la conversation en PDF'}
                            aria-label={lang === 'en' ? 'Export PDF' : 'Exporter PDF'}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                fontSize: 9, fontWeight: 700, padding: '4px 10px',
                                borderRadius: 16,
                                background: isExporting ? `${C.accent}15` : `${C.accent}08`,
                                color: C.accent,
                                border: `1px solid ${C.accent}25`,
                                cursor: isExporting || isStreaming ? 'not-allowed' : 'pointer',
                                fontFamily: 'inherit',
                                opacity: isExporting || isStreaming ? 0.5 : 1,
                                transition: 'all 0.25s ease',
                            }}
                        >
                            <DownloadIcon style={{ color: C.accent }} />
                            {isExporting
                                ? (lang === 'en' ? 'Exporting…' : 'Export…')
                                : 'PDF'}
                        </button>
                    )}
                    <div style={{ fontSize: 9, color: C.emerald, fontWeight: 700 }}>
                        {isStreaming ? '⏳ ' : '● '}{isStreaming
                            ? (lang === 'en' ? 'Analysing...' : 'Analyse...')
                            : (lang === 'en' ? 'Online · AI ready' : 'En ligne · IA prête')}
                    </div>
                </div>
            </div>

            {/* ── STARTERS (si aucun message) ── */}
            {messages.length === 0 && starters.length > 0 && (
                <div style={{ padding: '12px 20px 0', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {starters.map((q, i) => (
                        <button
                            key={i}
                            onClick={() => handleSend(q)}
                            disabled={isStreaming}
                            style={{
                                fontSize: 11, padding: '6px 12px', borderRadius: 20,
                                background: `${C.accent}08`, color: C.accent,
                                border: `1px solid ${C.accent}20`,
                                cursor: isStreaming ? 'not-allowed' : 'pointer',
                                fontFamily: 'inherit', fontWeight: 500,
                                transition: 'all 0.2s',
                                textAlign: 'left', lineHeight: 1.4,
                            }}
                        >
                            💬 {q}
                        </button>
                    ))}
                </div>
            )}

            {/* ── ZONE MESSAGES ── */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px 20px',
                minHeight: mode === 'hero' ? 220 : 320,
                maxHeight: mode === 'hero' ? 320 : 480,
                background: C.surfaceAlt,
                margin: '12px',
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                WebkitOverflowScrolling: 'touch',
            }}>
                {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 8 }}>
                            {lang === 'en'
                                ? '🇪🇺 Ask your EU regulatory compliance question'
                                : '🇪🇺 Posez votre question de conformité réglementaire EU'}
                        </div>
                        <div style={{
                            fontSize: 11, color: C.text, lineHeight: 1.6,
                            padding: '10px 14px', background: C.surface,
                            borderRadius: 10, border: `1px solid ${C.border}`,
                            textAlign: 'left', maxWidth: 420, margin: '0 auto',
                        }}>
                            "{t.brainResponse}"
                        </div>
                    </div>
                ) : (
                    messages.map((msg, i) => (
                        <div key={i} style={{
                            marginBottom: 10, padding: '8px 12px', borderRadius: 12,
                            background: msg.role === 'user' ? `${C.accent}10` : C.surface,
                            border: `1px solid ${msg.role === 'user' ? `${C.accent}25` : C.border}`,
                            fontSize: 12, color: C.text, lineHeight: 1.6,
                            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                            marginLeft: msg.role === 'user' ? 'auto' : 0,
                            marginRight: msg.role === 'user' ? 0 : 'auto',
                            maxWidth: '88%',
                        }}>
                            <div style={{
                                fontSize: 9, fontWeight: 700, marginBottom: 4,
                                color: msg.role === 'user' ? C.accent : C.emerald,
                            }}>
                                {msg.role === 'user'
                                    ? (lang === 'en' ? '👤 You' : '👤 Vous')
                                    : '✨ AEGIS Intelligence'}
                            </div>
                            {msg.text || (isStreaming && i === messages.length - 1 ? '▋' : '')}
                        </div>
                    ))
                )}
                <div ref={chatEndRef} />
            </div>

            {/* ── BADGES RÈGLEMENTS ── */}
            <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 4,
                justifyContent: 'center', padding: '0 20px 10px',
            }}>
                {(t.brainRegs as string[])?.map((r: string, i: number) => (
                    <span
                        key={i}
                        onClick={() => { if (!isStreaming) setInput(r); }}
                        style={{
                            fontSize: 9, padding: '2px 8px', borderRadius: 10,
                            background: `${C.accent}08`, color: C.accent,
                            border: `1px solid ${C.accent}18`,
                            fontWeight: 600, cursor: 'pointer',
                        }}
                    >
                        {r}
                    </span>
                ))}
            </div>

            {/* ── INPUT ── */}
            <div style={{
                display: 'flex', gap: 8, alignItems: 'center',
                padding: '0 20px 14px',
            }}>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t.brainPlaceholder}
                    disabled={isStreaming}
                    style={{
                        flex: 1, fontSize: 12, color: C.text,
                        padding: '10px 16px', borderRadius: 24,
                        background: C.surface,
                        border: `1px solid ${C.borderStrong}`,
                        outline: 'none', fontFamily: 'inherit',
                    }}
                />
                <button
                    onClick={() => handleSend()}
                    disabled={isStreaming || !input.trim()}
                    aria-label={lang === 'en' ? 'Send' : 'Envoyer'}
                    style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: C.gradientBlue, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: 'none', cursor: isStreaming || !input.trim() ? 'not-allowed' : 'pointer',
                        opacity: isStreaming || !input.trim() ? 0.4 : 1,
                        transition: 'opacity 0.2s',
                    }}
                >
                    <PaperAirplaneIcon style={{ width: 16, height: 16, color: '#fff' }} />
                </button>
            </div>

            {/* ── CTA + SCROLL ── */}
            <div style={{
                borderTop: `1px solid ${C.border}`,
                padding: '10px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 8,
                background: `${C.accent}04`,
            }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setShowReport(true)}
                        style={{
                            fontSize: 10, fontWeight: 700, padding: '6px 14px',
                            borderRadius: 20,
                            background: `${C.emerald}12`,
                            color: C.emerald,
                            border: `1px solid ${C.emerald}30`,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            transition: 'all 0.2s',
                        }}
                    >
                        {lang === 'en' ? '📄 Technical Compliance Diagnostic' : '📄 Diagnostic Technique de Conformité'}
                    </button>
                </div>
                <button
                    onClick={onScrollToExpertise}
                    style={{
                        fontSize: 10, color: C.textMuted, background: 'none',
                        border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    }}
                >
                    {t.brainScrollCta ?? (lang === 'en' ? '↓ Discover Jean-Pierre\'s expertise' : '↓ Découvrir l\'expertise de Jean-Pierre')}
                </button>
            </div>

            {/* ── REPORT MODAL ── */}
            {showReport && <DocumentReportView onClose={() => setShowReport(false)} />}
        </div>
    );
};

export default AegisIntelligence;
