import React, { useState, useRef, useEffect } from 'react';
import { useLang } from '../homepage/LangContext';
import { C } from '../homepage/constants';
import { runQueryStream } from '../../services/claudeService';
import { enrichPromptWithRegulation } from '../../services/regulationKnowledgeService';
import { hasAIConsent } from '../common/CookieBanner';
import { ChatMessage } from '../../types';
import { PaperAirplaneIcon } from '../icons/PaperAirplaneIcon';
import { SparklesIcon } from '../icons/SparklesIcon';

/**
 * AegisChat v3.1 — Brain IA Component (Light/Glass)
 * 
 * FUSION : AegisInline.tsx (254L) + AiAssistant.tsx (487L)
 * 
 * mode="mini" : intégré dans HeroSection (320px, pas de header)
 * mode="full" : pleine page (futur /platform)
 * 
 * RGPD : vérifie hasAIConsent() avant toute requête Claude API
 * Streaming : utilise runQueryStream (SSE via proxy sécurisé)
 * i18n : useLang() Context (pas de prop lang)
 * Design : tokens C.* (Light/Glass, pas Tailwind)
 * 
 * Migration : Gemini 2.0 Flash → Claude Haiku 4.5 (31/03/2026)
 */

interface AegisChatProps {
    mode?: 'mini' | 'full';
}

// ✅ FIX: System instruction i18n — répondre dans la langue de l'interface
const SYSTEM_INSTRUCTIONS: Record<'fr' | 'en', string> = {
    fr: `Tu es AEGIS Intelligence, l'analyste IA de conformité réglementaire de Jean-Pierre Charles.
Tu es spécialisé dans la conformité industrielle européenne (AI Act, Règlement Machines 2023/1230, ESPR, CRA, RGPD, REACH, CSRD, Batteries 2023/1542, Data Act, CPR, NIS2, DORA, UNECE R155/R156, EN 45545).
Réponds TOUJOURS en français, de manière précise et structurée, en citant les articles de loi pertinents.
Tu représentes 32 ans d'expertise R&D terrain dans l'industrie européenne (Autoliv, Saft, Faurecia, Forsee Power).
Si la question sort du périmètre réglementaire EU industriel, redirige poliment vers le périmètre couvert.`,
    en: `You are AEGIS Intelligence, the regulatory AI compliance analyst of Jean-Pierre Charles.
You specialize in European industrial compliance (AI Act, Machinery Regulation 2023/1230, ESPR, CRA, GDPR, REACH, CSRD, Batteries 2023/1542, Data Act, CPR, NIS2, DORA, UNECE R155/R156, EN 45545).
ALWAYS respond in English, with precision and structure, citing relevant legal articles.
You represent 32 years of hands-on R&D expertise in the European industry (Autoliv, Saft, Faurecia, Forsee Power).
If the question falls outside the EU industrial regulatory scope, politely redirect to the covered perimeter.`,
};

const AegisChat: React.FC<AegisChatProps> = ({ mode = 'mini' }) => {
    const { t, lang } = useLang();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [consent, setConsent] = useState(hasAIConsent());
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Listen for consent changes
    useEffect(() => {
        const handler = () => setConsent(hasAIConsent());
        window.addEventListener('consentChanged', handler);
        return () => window.removeEventListener('consentChanged', handler);
    }, []);

    // Auto-scroll on new messages
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || isStreaming) return;

        if (!consent) {
            setMessages(prev => [...prev, {
                role: 'model',
                text: '⚠️ Veuillez accepter les cookies fonctionnels pour utiliser l\'assistant IA.'
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
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'model',
                text: '⚠️ Service momentanément indisponible. Veuillez réessayer.'
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

    const isMini = mode === 'mini';
    const containerHeight = isMini ? 350 : '100%';

    return (
        <div
            style={{
                padding: 14,
                background: 'rgba(255,255,255,0.88)',
                backdropFilter: C.glassBlur, WebkitBackdropFilter: C.glassBlur,
                border: `1px solid ${C.glassBorder}`,
                boxShadow: C.shadowLg,
                height: containerHeight,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 16,
                overflow: 'hidden',
            }}
            aria-label="AEGIS Intelligence IA Preview"
        >
            {/* JP Medallion */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{
                    width: 40, height: 40, borderRadius: '50%', background: C.gradientBlue,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 800, color: '#fff', border: '2px solid #fff',
                    boxShadow: C.shadowMed, flexShrink: 0,
                }}>JP</div>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>Jean-Pierre Charles</div>
                    <div style={{ fontSize: 9, color: C.textMuted }}>
                        {lang === 'en'
                            ? '32y R&D · 6 groups · 8 EU regulations'
                            : '32 ans R&D · 6 groupes · 8 règlements EU'}
                    </div>
                </div>
            </div>

            {/* Title */}
            <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 8, textAlign: 'center' }}>
                <SparklesIcon style={{ width: 14, height: 14, display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                {t.brainTitle}
            </div>

            {/* Chat area */}
            <div style={{
                flex: 1, overflowY: 'auto', marginBottom: 8,
                background: C.surfaceAlt, borderRadius: 10, padding: 10,
                border: `1px solid ${C.border}`,
                minHeight: isMini ? 100 : 200,
            }}>
                {messages.length === 0 ? (
                    <>
                        <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 4 }}>{t.brainExample}</div>
                        <div style={{
                            fontSize: 11, color: C.text, lineHeight: 1.5, padding: '6px 8px',
                            background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`,
                        }}>
                            "{t.brainResponse}"
                        </div>
                    </>
                ) : (
                    messages.map((msg, i) => (
                        <div key={i} style={{
                            marginBottom: 8, padding: '6px 10px', borderRadius: 10,
                            background: msg.role === 'user' ? `${C.accent}10` : C.surface,
                            border: `1px solid ${msg.role === 'user' ? `${C.accent}20` : C.border}`,
                            fontSize: 11, color: C.text, lineHeight: 1.5,
                            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                        }}>
                            <div style={{
                                fontSize: 9, fontWeight: 700, marginBottom: 3,
                                color: msg.role === 'user' ? C.accent : C.emerald,
                            }}>
                                {msg.role === 'user'
                                    ? (lang === 'en' ? '👤 You' : '👤 Vous')
                                    : '✨ AEGIS Intelligence'}
                            </div>
                            {msg.text || (isStreaming && i === messages.length - 1 ? '⏳' : '')}
                        </div>
                    ))
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Regulation badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', marginBottom: 8 }}>
                {t.brainRegs?.map((r: string, i: number) => (
                    <span
                        key={i}
                        onClick={() => { if (!isStreaming) setInput(r); }}
                        style={{
                            fontSize: 9, padding: '2px 6px', borderRadius: 10,
                            background: `${C.accent}10`, color: C.accent, fontWeight: 600,
                            border: `1px solid ${C.accent}20`, cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {r}
                    </span>
                ))}
            </div>

            {/* Input */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t.brainPlaceholder}
                    disabled={isStreaming}
                    style={{
                        flex: 1, fontSize: 11, color: C.text, padding: '8px 12px',
                        borderRadius: 20, background: C.surface, border: `1px solid ${C.borderStrong}`,
                        outline: 'none', fontFamily: 'inherit',
                    }}
                />
                <button
                    onClick={handleSend}
                    disabled={isStreaming || !input.trim()}
                    aria-label="Envoyer"
                    style={{
                        width: 32, height: 32, borderRadius: '50%', background: C.gradientBlue,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: 'none', cursor: isStreaming ? 'not-allowed' : 'pointer',
                        opacity: isStreaming || !input.trim() ? 0.5 : 1,
                        transition: 'opacity 0.2s ease',
                    }}
                >
                    <PaperAirplaneIcon style={{ width: 14, height: 14, color: '#fff' }} />
                </button>
            </div>

            {/* Status */}
            <div style={{ textAlign: 'center', marginTop: 8, fontSize: 10, color: C.emerald, fontWeight: 700 }}>
                {isStreaming ? '⏳ Analyse en cours...' : t.brainStatus}
            </div>
            <div style={{ fontSize: 9, color: C.textMuted, textAlign: 'center', marginTop: 4, fontStyle: 'italic' }}>
                {t.brainCaption}
            </div>
        </div>
    );
};

export default AegisChat;
