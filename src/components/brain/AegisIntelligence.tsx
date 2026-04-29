import React, { useState, useRef, useEffect } from 'react';
import { useLang } from '../homepage/LangContext';
import { C } from '../homepage/constants';
import { runQueryStream } from '../../services/claudeService';
import { enrichPromptWithRegulation } from '../../services/regulationKnowledgeService';
import { hasAIConsent } from '../common/CookieBanner';
import { ChatMessage } from '../../types';
import { PaperAirplaneIcon } from '../icons/PaperAirplaneIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import MarkdownRenderer from '../common/MarkdownRenderer';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import QRCode from 'qrcode';

// ── PDF Export Icon (inline SVG) ──
const DownloadIcon: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, ...style }}>
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const AEGIS_VERSION = '3.4.2';

// CHANGE-09: System prompt is now server-side in config/brain-system-prompt.txt
// The proxy enforces the prompt; client only sends lang hint.
// Kept empty constant for backward compat if AegisChat references it.
const SYSTEM_INSTRUCTIONS_DEPRECATED = '(server-side enforced)';

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
    const [isExporting, setIsExporting] = useState(false);
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
            // CHANGE-09: system prompt is server-side; only enrichment context sent
            const contextHint = systemAddition || '';

            let responseText = '';
            setMessages(prev => [...prev, { role: 'model', text: '' }]);

            for await (const chunk of runQueryStream(trimmed, contextHint)) {
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

        // FIX P0 v348 : fusion vers PricingSection.DiagnosticCheckoutForm via sessionStorage
        // (l'ancien chemin Brain envoyait un payload Mollie incomplet — root cause cobaye β)
        const prefill = {
            sector: matchedSector,
            product: '',
            regs: matchedRegs,
            context: '',
            lang,
            timestamp: new Date().toISOString(),
        };
        try {
            sessionStorage.setItem('aegis_brain_prefill', JSON.stringify(prefill));
        } catch { /* sessionStorage indisponible */ }
        window.dispatchEvent(new CustomEvent('aegis:openDiagForm'));
        if (typeof onScrollToPricing === 'function') {
            onScrollToPricing();
        }
    };

    const handleExportConversationPDF = async () => {
        if (messages.length === 0 || isExporting) return;
        setIsExporting(true);

        try {
            const html2pdf = (await import('html2pdf.js')).default;

            const dateStr = new Date().toISOString().split('T')[0];
            const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

            const wrapper = document.createElement('div');
            wrapper.style.fontFamily = "'Inter', 'Segoe UI', system-ui, sans-serif";
            wrapper.style.fontSize = '12px';
            wrapper.style.color = '#1e293b';
            wrapper.style.padding = '0';

            // Reference ID for traceability (U2)
            const refId = `AEGIS-CONV-${dateStr.replace(/-/g, '')}-${timeStr.replace(/:/g, '')}`;

            // QR code generation (U3)
            const qrTarget = `https://jeanpierrecharles.com?src=pdf-conv&ref=${refId}`;
            let qrDataUrl = '';
            try {
                qrDataUrl = await QRCode.toDataURL(qrTarget, {
                    width: 120,
                    margin: 1,
                    color: { dark: '#0A3D62', light: '#ffffff' },
                });
            } catch {
                // QR generation failed — continue without it
            }

            // Cover header AEGIS branded (U1 + U2 + U3)
            wrapper.innerHTML = `
                <div style="position:relative;padding:20px 0 16px 0;border-bottom:2px solid #0A3D62;margin-bottom:24px">
                    ${qrDataUrl ? `<img src="${qrDataUrl}" style="position:absolute;top:12px;right:0;width:60px;height:60px" />` : ''}
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
                        <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#0A3D62,#1e5a8a);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:22px">Ae</div>
                        <div>
                            <div style="font-size:22px;font-weight:700;color:#0A3D62;letter-spacing:0.05em">AEGIS INTELLIGENCE</div>
                            <div style="font-size:9px;color:#5a6578;text-transform:uppercase;letter-spacing:0.08em">Compliance by Design &middot; EU Regulatory Expertise</div>
                        </div>
                    </div>
                    <div style="font-size:16px;font-weight:600;color:#2c3e50;margin-top:12px">
                        ${lang === 'fr' ? 'Historique de conversation IA' : 'AI Conversation History'}
                    </div>
                    <div style="font-size:10px;color:#5a6578;margin-top:2px">
                        ${dateStr} &middot; ${timeStr} &middot; ${messages.length} messages
                    </div>
                    <div style="font-family:'DejaVu Sans Mono',monospace;font-size:10px;color:#0A3D62;margin-top:6px">
                        ${refId}
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
                if (isUser) {
                    label.textContent = lang === 'en' ? '👤 You' : '👤 Vous';
                } else {
                    label.innerHTML = '<span style="display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;border-radius:50%;background:linear-gradient(135deg,#0A3D62,#1e5a8a);color:white;font-size:8px;font-weight:800;margin-right:4px;vertical-align:middle">Ae</span> AEGIS Intelligence';
                }
                msgDiv.appendChild(label);

                const content = document.createElement('div');
                content.style.fontSize = '11px';
                content.style.lineHeight = '1.7';
                content.style.wordBreak = 'break-word';

                if (isUser) {
                    content.style.whiteSpace = 'pre-wrap';
                    content.textContent = msg.text;
                } else {
                    // R1: Convert markdown -> HTML for AEGIS responses (P0 fix v3.3.5)
                    const rawHtml = marked.parse(msg.text) as string;
                    content.innerHTML = DOMPurify.sanitize(rawHtml);
                    // Inline styles for html2canvas PDF rendering
                    content.querySelectorAll('table').forEach(tbl => {
                        tbl.style.borderCollapse = 'collapse';
                        tbl.style.width = '100%';
                        tbl.style.margin = '8px 0';
                        tbl.style.fontSize = '10px';
                    });
                    content.querySelectorAll('th, td').forEach(c => {
                        (c as HTMLElement).style.border = '1px solid #cbd5e1';
                        (c as HTMLElement).style.padding = '5px 8px';
                        (c as HTMLElement).style.textAlign = 'left';
                    });
                    content.querySelectorAll('th').forEach(h => {
                        (h as HTMLElement).style.background = '#f1f5f9';
                        (h as HTMLElement).style.fontWeight = '700';
                        (h as HTMLElement).style.color = '#334155';
                    });
                    content.querySelectorAll('ul, ol').forEach(l => {
                        (l as HTMLElement).style.paddingLeft = '20px';
                        (l as HTMLElement).style.margin = '4px 0';
                    });
                    content.querySelectorAll('blockquote').forEach(bq => {
                        (bq as HTMLElement).style.borderLeft = '3px solid #0A3D62';
                        (bq as HTMLElement).style.paddingLeft = '12px';
                        (bq as HTMLElement).style.margin = '8px 0';
                        (bq as HTMLElement).style.color = '#475569';
                    });
                }
                msgDiv.appendChild(content);

                wrapper.appendChild(msgDiv);
            });

            // R3: Banner "analyse preliminaire" (conserve de v3.3.5)
            const banner = document.createElement('div');
            banner.style.textAlign = 'center';
            banner.style.fontSize = '10px';
            banner.style.color = '#0A3D62';
            banner.style.marginTop = '16px';
            banner.style.padding = '10px 16px';
            banner.style.background = '#eff6ff';
            banner.style.borderRadius = '8px';
            banner.style.border = '1px solid #bfdbfe';
            banner.textContent = lang === 'fr'
                ? 'Analyse préliminaire — Poursuivez la conversation sur jeanpierrecharles.com'
                : 'Preliminary analysis — Continue the conversation at jeanpierrecharles.com';
            wrapper.appendChild(banner);

            // U4: Bandeau CTA DIAGNOSTIC 250 EUR
            const ctaBanner = document.createElement('div');
            ctaBanner.style.marginTop = '12px';
            ctaBanner.style.padding = '14px 18px';
            ctaBanner.style.background = '#eef6ff';
            ctaBanner.style.borderLeft = '4px solid #0A3D62';
            ctaBanner.style.borderRadius = '2px';
            ctaBanner.style.pageBreakInside = 'avoid';
            ctaBanner.innerHTML = lang === 'fr'
                ? `<div style="font-size:11px;color:#1a1a1a;line-height:1.5;text-align:center">
                    <strong>Ce pre-diagnostic vous a ete utile ?</strong><br>
                    Pour une analyse approfondie — graphe causal inter-reglements, scenarios de non-conformite chiffres, feuille de route CAPEX/OPEX, sources juridiques sourcees — passez au <strong>DIAGNOSTIC AEGIS complet, 250 EUR</strong>.
                   </div>
                   <div style="margin-top:10px;text-align:center">
                    <div style="display:inline-block;padding:8px 20px;background:#0A3D62;color:white;font-size:11px;font-weight:600;border-radius:20px">Demander le Diagnostic &rarr;</div>
                    <div style="font-size:9px;color:#5a6578;margin-top:4px">jeanpierrecharles.com/#pricing</div>
                   </div>`
                : `<div style="font-size:11px;color:#1a1a1a;line-height:1.5;text-align:center">
                    <strong>Was this pre-diagnosis useful?</strong><br>
                    For a deep analysis — inter-regulation dependency graph, quantified non-compliance scenarios, CAPEX/OPEX roadmap, sourced legal references — upgrade to the <strong>full AEGIS DIAGNOSTIC, 250 EUR</strong>.
                   </div>
                   <div style="margin-top:10px;text-align:center">
                    <div style="display:inline-block;padding:8px 20px;background:#0A3D62;color:white;font-size:11px;font-weight:600;border-radius:20px">Request the Diagnostic &rarr;</div>
                    <div style="font-size:9px;color:#5a6578;margin-top:4px">jeanpierrecharles.com/#pricing</div>
                   </div>`;
            wrapper.appendChild(ctaBanner);

            // Footer (R5: dynamic version)
            const footer = document.createElement('div');
            footer.style.textAlign = 'center';
            footer.style.fontSize = '9px';
            footer.style.color = '#94a3b8';
            footer.style.marginTop = '24px';
            footer.style.paddingTop = '12px';
            footer.style.borderTop = '1px solid #e2e8f0';
            footer.textContent = `AEGIS Intelligence v${AEGIS_VERSION} · jeanpierrecharles.com · ${lang === 'fr' ? 'Exporté le' : 'Exported on'} ${dateStr}`;
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

    // Banniere MODE TEST visible uniquement sur Preview/Development
    // Permet d'identifier visuellement qu'on n'est pas en production
    const isTestMode = typeof window !== 'undefined' && !window.location.hostname.endsWith('jeanpierrecharles.com');

    return (
        <>
            {isTestMode && (
                <div
                    style={{
                        background: '#fef3c7',
                        border: '2px solid #f59e0b',
                        color: '#78350f',
                        padding: '8px 16px',
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: 600,
                        position: 'sticky',
                        top: 0,
                        zIndex: 9999,
                    }}
                >
                    MODE TEST — environnement Preview/Development. Aucun debit carte reel. Mollie cle TEST active.
                </div>
            )}
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

            {/* ── CHAT BRAIN ── (FIX P0 v348 : formulaire interne supprimé, fusion DiagnosticCheckoutForm via sessionStorage) */}
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
                    {messages.length >= 2 && !isStreaming && (
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

            {/* ── CTA + SCROLL ── (FIX P1-A v348 : modal "Diagnostic Technique" Hero supprimée — duplique PULSE) */}
            <div style={{
                borderTop: `1px solid ${C.border}`,
                padding: '10px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                flexWrap: 'wrap', gap: 8,
                background: `${C.accent}04`,
            }}>
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

        </div>
        </>
    );
};

export default AegisIntelligence;
