import React, { useState, useRef, useEffect } from 'react';
import { useLang } from '../homepage/LangContext';
import { C } from '../homepage/constants';
import { runQueryStream } from '../../services/claudeService';
import { enrichPromptWithRegulation } from '../../services/regulationKnowledgeService';
import { hasAIConsent } from '../common/CookieBanner';
import { ChatMessage } from '../../types';
import { PaperAirplaneIcon } from '../icons/PaperAirplaneIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import DocumentReportView from '../documents/DocumentReportView';
import MarkdownRenderer from '../common/MarkdownRenderer';

// ── PDF Export Icon (inline SVG) ──
const DownloadIcon: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, ...style }}>
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

// System instructions — reprises de AegisChat.tsx (coherence)
const SYSTEM_INSTRUCTIONS: Record<'fr' | 'en', string> = {
    fr: `Tu es AEGIS Intelligence, la plateforme d'expertise et d'intelligence reglementaire industrielle europeenne.
Tu es alimente par 32 ans d'expertise R&D terrain en conception, industrialisation et mise en conformite de produits et systemes mecatroniques complexes — automobile, batteries, ferroviaire, equipements industriels, aeronautique.
Tu couvres 10 reglements EU cles : AI Act (2024/1689), Reglement Machines (2023/1230), ESPR (2024/1781), CRA (2024/2847), RGPD (2016/679), Batteries (2023/1542), Data Act (2023/2854), NIS2 (2022/2555), DORA (2022/2554), CPR (produits de construction).
Reponds TOUJOURS en francais, de maniere precise et structuree, en citant les articles de loi pertinents.
Si un reglement hors de ton perimetre semble applicable (ex: MDR 2017/745 pour dispositifs medicaux, ATEX pour atmospheres explosives, PED pour equipements sous pression), mentionne son existence et recommande un diagnostic approfondi AEGIS plutot que d'improviser. Dis ce que tu sais et ce que tu ne sais pas.
Tu couvres tous les secteurs industriels EU : automobile, aeronautique, batteries/energie, equipements industriels, robotique, dispositifs medicaux, electronique/IoT, ferroviaire, construction/BTP, agroalimentaire, chimie, metallurgie, plasturgie, textile technique, defense.
Si la question sort du perimetre reglementaire EU industriel, redirige poliment vers un diagnostic AEGIS.`,
    en: `You are AEGIS Intelligence, the European industrial regulatory expertise and intelligence platform.
You are powered by 32 years of hands-on R&D expertise in design, industrialisation, and compliance of complex mechatronic products and systems — automotive, batteries, rail, industrial equipment, aerospace.
You cover 10 key EU regulations: AI Act (2024/1689), Machinery Regulation (2023/1230), ESPR (2024/1781), CRA (2024/2847), GDPR (2016/679), Batteries (2023/1542), Data Act (2023/2854), NIS2 (2022/2555), DORA (2022/2554), CPR (construction products).
ALWAYS respond in English, with precision and structure, citing relevant legal articles.
If a regulation outside your core scope appears applicable (e.g. MDR 2017/745 for medical devices, ATEX for explosive atmospheres, PED for pressure equipment), mention its existence and recommend an in-depth AEGIS diagnostic rather than improvising. State what you know and what you don't.
You cover all EU industrial sectors: automotive, aerospace, batteries/energy, industrial equipment, robotics, medical devices, electronics/IoT, rail, construction, food processing, chemicals, metallurgy, plastics, technical textiles, defence.
If the question falls outside EU industrial regulatory scope, politely redirect to an AEGIS diagnostic.`,
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
    const [showDiagForm, setShowDiagForm] = useState(false);
    const [diagSector, setDiagSector] = useState('');
    const [diagProduct, setDiagProduct] = useState('');
    const [diagRegs, setDiagRegs] = useState<string[]>([]);
    const [diagContext, setDiagContext] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const chatZoneRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = () => setConsent(hasAIConsent());
        window.addEventListener('consentChanged', handler);
        return () => window.removeEventListener('consentChanged', handler);
    }, []);

    // BUG-02 FIX: Clear messages when language changes
    useEffect(() => {
        const handleLangChange = () => {
            setMessages([]);
            setInput('');
        };
        window.addEventListener('langChanged', handleLangChange);
        return () => window.removeEventListener('langChanged', handleLangChange);
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

    const prefillDiagnostic = () => {
        const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
        const text = (lastUserMsg?.text || '').toLowerCase();

        const keywords: Record<string, { sector: string; regs: string[] }> = {
            'batterie|li-ion|pack|énergie|energy|battery': {
                sector: (t.diagSectors as string[])?.[2] ?? 'Batteries / Énergie',
                regs: ['Batteries', 'ESPR'],
            },
            'voiture|automobile|adas|véhicule|vehicle|automotive|car': {
                sector: (t.diagSectors as string[])?.[0] ?? 'Automobile',
                regs: ['AI Act', 'Machines', 'CRA'],
            },
            'machine|robot|automate|ligne|equipment': {
                sector: (t.diagSectors as string[])?.[3] ?? 'Équipements industriels',
                regs: ['Machines', 'CRA'],
            },
            'logiciel|software|iot|firmware|numérique|digital': {
                sector: (t.diagSectors as string[])?.[6] ?? 'Électronique / IoT',
                regs: ['CRA', 'AI Act', 'Data Act'],
            },
            'ferroviaire|train|tgv|rail': {
                sector: (t.diagSectors as string[])?.[7] ?? 'Ferroviaire',
                regs: ['Machines', 'CRA'],
            },
            'aéronautique|avion|drone|aerospace': {
                sector: (t.diagSectors as string[])?.[1] ?? 'Aéronautique',
                regs: ['AI Act', 'Machines', 'CRA'],
            },
            'fabri|produi|manufactur|usine|atelier|factory|plant': {
                sector: (t.diagSectors as string[])?.[3] ?? 'Équipements industriels',
                regs: ['Machines'],
            },
            'chauff|cheminée|insert|poêle|thermique|heating|stove|fireplace': {
                sector: (t.diagSectors as string[])?.[3] ?? 'Équipements industriels',
                regs: ['Machines', 'CPR'],
            },
            'construct|bâtiment|building|BTP|chantier|génie civil': {
                sector: (t.diagSectors as string[])?.[3] ?? 'Équipements industriels',
                regs: ['Machines', 'CPR'],
            },
            'médic|santé|health|implant|dispositif|medical|prosthes|prothès': {
                sector: (t.diagSectors as string[])?.[5] ?? 'Dispositifs médicaux',
                regs: ['AI Act', 'CRA'],
            },
            'aliment|food|agro|restauration|agroalimentaire|packaging alimentaire': {
                sector: (t.diagSectors as string[])?.[3] ?? 'Équipements industriels',
                regs: ['Machines'],
            },
            'chimie|chemical|pharma|cosmeti|peinture|solvant|petrochim': {
                sector: (t.diagSectors as string[])?.[3] ?? 'Équipements industriels',
                regs: ['Machines', 'CRA', 'ESPR'],
            },
            'metal|fonderie|acier|steel|alumin|sider|forge|soudure|usinage': {
                sector: (t.diagSectors as string[])?.[3] ?? 'Équipements industriels',
                regs: ['Machines'],
            },
            'plastiq|plast|polymer|compos|caoutchouc|rubber|moule|inject': {
                sector: (t.diagSectors as string[])?.[3] ?? 'Équipements industriels',
                regs: ['Machines', 'ESPR'],
            },
            'solaire|eolien|hydrog|photovolta|renouvelable|solar|wind|turbine': {
                sector: (t.diagSectors as string[])?.[2] ?? 'Batteries / Énergie',
                regs: ['Machines', 'CRA'],
            },
        };

        let matchedSector = '';
        let matchedRegs: string[] = [];

        // Phase 1 — Static: match keywords from last user message
        for (const [pattern, mapping] of Object.entries(keywords)) {
            const regex = new RegExp(pattern, 'i');
            if (regex.test(text)) {
                matchedSector = mapping.sector;
                matchedRegs = [...new Set([...matchedRegs, ...mapping.regs])];
            }
        }

        // Phase 2 — Dynamic: conversation memory (analyse ALL messages incl. Brain responses)
        const fullConversation = messages.map(m => m.text).join(' ');
        const regDetectors: Record<string, string> = {
            'ai act|intelligence artificielle|2024\\/1689|high.risk': 'AI Act',
            'machine|machinery|2023\\/1230|en iso 12100|marquage ce': 'Machines',
            'espr|ecodesign|\u00e9coconception|passeport num\u00e9rique|digital product passport|2024\\/1781': 'ESPR',
            'cra|cyber resilience|2024\\/2847|enisa|vuln\u00e9rabilit': 'CRA',
            'rgpd|gdpr|2016\\/679|donn\u00e9es personnelles': 'RGPD',
            'batter|2023\\/1542|lithium|li.ion|passeport.+batterie': 'Batteries',
            'data act|2023\\/2854|donn\u00e9es industrielles': 'Data Act',
            'cpr|construction product|produit.+construction|en 13229|en 13240': 'CPR',
            'nis2|2022\\/2555|entit\u00e9s essentielles|cybersecurity directive': 'NIS2',
            'dora|r\u00e9silience op\u00e9rationnelle|2022\\/2554': 'DORA',
        };
        for (const [pattern, regName] of Object.entries(regDetectors)) {
            if (new RegExp(pattern, 'i').test(fullConversation) && !matchedRegs.includes(regName)) {
                matchedRegs.push(regName);
            }
        }

        // Phase 3 — Dynamic sector fallback (if static missed)
        if (!matchedSector) {
            const sectorFallback: [RegExp, number][] = [
                [/automobile|automotive|v\u00e9hicule|vehicle|adas/i, 0],
                [/a\u00e9ro|aerospace|avion|drone/i, 1],
                [/batter|lithium|li.ion|\u00e9nergie|energy storage/i, 2],
                [/industriel|equipment|machine|usine|factory|chauff|chemin\u00e9e|insert|po\u00eale|construct|b\u00e2timent|BTP/i, 3],
                [/robot|automat/i, 4],
                [/m\u00e9dic|medical|sant\u00e9|health|implant|dispositif/i, 5],
                [/iot|\u00e9lectronique|electronic|firmware|software|connect\u00e9/i, 6],
                [/ferroviaire|rail|train|tgv/i, 7],
            ];
            for (const [regex, idx] of sectorFallback) {
                if (regex.test(fullConversation)) {
                    matchedSector = (t.diagSectors as string[])?.[idx] ?? '';
                    break;
                }
            }
        }

        setDiagSector(matchedSector);
        setDiagProduct('');
        setDiagRegs(matchedRegs);
        setDiagContext('');
        setShowDiagForm(true);
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
            footer.textContent = `AEGIS Intelligence v3.3 · jeanpierrecharles.com · ${lang === 'fr' ? 'Exporté le' : 'Exported on'} ${dateStr}`;
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
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                borderRadius: 20,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                width: '100%',
                maxWidth: mode === 'hero' ? 680 : '100%',
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

            {showDiagForm ? (
                /* ── FORMULAIRE DIAGNOSTIC ── */
                <div style={{ padding: '20px' }}>
                    {/* Header formulaire */}
                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                            {t.diagTitle as string}
                        </div>
                        <div style={{ fontSize: 11, color: C.textMuted }}>
                            {t.diagSub as string}
                        </div>
                    </div>

                    {/* Secteur industriel */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={{
                            display: 'block', fontSize: 10, fontWeight: 700,
                            textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                            color: C.textMuted, marginBottom: 6,
                        }}>
                            {t.diagSectorLabel as string}
                        </label>
                        <select
                            value={diagSector}
                            onChange={e => setDiagSector(e.target.value)}
                            style={{
                                width: '100%', padding: '10px 14px', fontSize: 13,
                                borderRadius: 10, border: `1px solid ${C.border}`,
                                background: C.surface, color: C.text,
                                fontFamily: 'inherit', outline: 'none',
                                appearance: 'none' as const,
                            }}
                        >
                            <option value="">{t.diagSectorPlaceholder as string}</option>
                            {(t.diagSectors as string[])?.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    {/* Type de produit */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={{
                            display: 'block', fontSize: 10, fontWeight: 700,
                            textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                            color: C.textMuted, marginBottom: 6,
                        }}>
                            {t.diagProductLabel as string}
                        </label>
                        <input
                            type="text"
                            value={diagProduct}
                            onChange={e => setDiagProduct(e.target.value)}
                            placeholder={t.diagProductPlaceholder as string}
                            style={{
                                width: '100%', padding: '10px 14px', fontSize: 13,
                                borderRadius: 10, border: `1px solid ${C.border}`,
                                background: C.surface, color: C.text,
                                fontFamily: 'inherit', outline: 'none',
                            }}
                        />
                    </div>

                    {/* Réglementations ciblées — chips */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={{
                            display: 'block', fontSize: 10, fontWeight: 700,
                            textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                            color: C.textMuted, marginBottom: 8,
                        }}>
                            {t.diagRegsLabel as string}
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {['AI Act', 'Machines', 'ESPR', 'CRA', 'RGPD', 'Batteries', 'Data Act', 'CPR', 'NIS2', 'DORA'].map(reg => {
                                const isSelected = diagRegs.includes(reg);
                                return (
                                    <button
                                        key={reg}
                                        onClick={() => {
                                            setDiagRegs(prev =>
                                                isSelected
                                                    ? prev.filter(r => r !== reg)
                                                    : [...prev, reg]
                                            );
                                        }}
                                        style={{
                                            fontSize: 11, fontWeight: 600,
                                            padding: '5px 12px', borderRadius: 16,
                                            border: `1px solid ${isSelected ? C.accent : C.border}`,
                                            background: isSelected ? `${C.accent}12` : C.surface,
                                            color: isSelected ? C.accent : C.textMuted,
                                            cursor: 'pointer', transition: 'all 0.15s ease',
                                        }}
                                    >
                                        {reg}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Contexte additionnel */}
                    <div style={{ marginBottom: 20 }}>
                        <label style={{
                            display: 'block', fontSize: 10, fontWeight: 700,
                            textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                            color: C.textMuted, marginBottom: 6,
                        }}>
                            {t.diagContextLabel as string}
                        </label>
                        <textarea
                            value={diagContext}
                            onChange={e => setDiagContext(e.target.value)}
                            placeholder={t.diagContextPlaceholder as string}
                            rows={3}
                            style={{
                                width: '100%', padding: '10px 14px', fontSize: 13,
                                borderRadius: 10, border: `1px solid ${C.border}`,
                                background: C.surface, color: C.text,
                                fontFamily: 'inherit', outline: 'none',
                                resize: 'vertical' as const,
                            }}
                        />
                    </div>

                    {/* Boutons : Générer + Retour */}
                    <div style={{ display: 'flex', gap: 10, flexDirection: 'column' as const }}>
                        <button
                            onClick={() => {
                                const diagData = {
                                    sector: diagSector,
                                    product: diagProduct,
                                    regs: diagRegs,
                                    context: diagContext,
                                    lang,
                                    timestamp: new Date().toISOString(),
                                };
                                try {
                                    sessionStorage.setItem('aegis_diag_request', JSON.stringify(diagData));
                                } catch { /* sessionStorage indisponible */ }

                                fetch('/api/mollie-checkout', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        product: 'diagnostic',
                                        lang,
                                    }),
                                })
                                    .then(res => {
                                        if (!res.ok) throw new Error(`Checkout HTTP ${res.status}`);
                                        return res.json();
                                    })
                                    .then(data => {
                                        if (data.checkoutUrl) {
                                            window.location.href = data.checkoutUrl;
                                        }
                                    })
                                    .catch(err => {
                                        console.error('Checkout error:', err);
                                        if (typeof onScrollToPricing === 'function') {
                                            onScrollToPricing();
                                        }
                                    });
                            }}
                            disabled={!diagSector || !diagProduct || diagRegs.length === 0}
                            style={{
                                width: '100%', padding: '12px 20px',
                                fontSize: 14, fontWeight: 700, borderRadius: 12,
                                background: (!diagSector || !diagProduct || diagRegs.length === 0)
                                    ? C.border : C.gradientBlue,
                                color: (!diagSector || !diagProduct || diagRegs.length === 0)
                                    ? C.textMuted : '#ffffff',
                                border: 'none',
                                cursor: (!diagSector || !diagProduct || diagRegs.length === 0)
                                    ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: 8,
                            }}
                        >
                            {t.diagSubmit as string}
                        </button>
                        <button
                            onClick={() => setShowDiagForm(false)}
                            style={{
                                width: '100%', padding: '8px 16px',
                                fontSize: 12, fontWeight: 500, borderRadius: 10,
                                background: 'transparent', color: C.textMuted,
                                border: `1px solid ${C.border}`, cursor: 'pointer',
                            }}
                        >
                            ← {t.diagBack as string}
                        </button>
                    </div>
                </div>
            ) : (
                /* ── CHAT BRAIN EXISTANT ── */
                <>
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
                                    whiteSpace: msg.role === 'user' ? 'pre-wrap' : 'normal',
                                    wordBreak: 'break-word',
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
                                    {msg.role === 'model' && msg.text ? (
                                        <MarkdownRenderer content={msg.text} className="brain-markdown" />
                                    ) : (
                                        msg.text || (isStreaming && i === messages.length - 1 ? '▋' : '')
                                    )}
                                </div>
                            ))
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* CTA DIAGNOSTIC — apparaît après au moins 1 réponse AEGIS */}
                    {messages.length >= 2 && !isStreaming && !showDiagForm && (
                        <div style={{
                            margin: '0 20px 8px',
                            padding: '12px 16px',
                            borderRadius: 12,
                            background: `linear-gradient(135deg, ${C.accent}08, ${C.emerald}08)`,
                            border: `1px solid ${C.accent}20`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 12,
                        }}>
                            <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>
                                <span style={{ fontWeight: 700 }}>{t.diagCta as string}</span>
                            </div>
                            <button
                                onClick={prefillDiagnostic}
                                style={{
                                    fontSize: 11, fontWeight: 700,
                                    padding: '6px 14px', borderRadius: 20,
                                    background: C.gradientBlue, color: '#ffffff',
                                    border: 'none', cursor: 'pointer',
                                    whiteSpace: 'nowrap', flexShrink: 0,
                                }}
                            >
                                {t.diagCtaBtn as string}
                            </button>
                        </div>
                    )}

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
                </>
            )}

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
