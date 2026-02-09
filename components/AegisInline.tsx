import React, { useState, useRef, useEffect } from 'react';
import { runQueryStream } from '../services/geminiService';
import { enrichPromptWithRegulation } from '../services/regulationKnowledgeService';
import { ChatMessage } from '../types';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { Language, t } from '../translations';
import { hasAIConsent } from './CookieBanner';

interface AegisInlineProps {
    lang: Language;
}

/**
 * AegisInline - Assistant IA intégré avec :
 * - 8 règlements EU (aligné Plateforme Aegis)
 * - Vérification du consentement RGPD
 * - Bandeau de transparence sur le traitement des données
 * - Architecture proxy (clé API jamais exposée côté client)
 */
const AegisInline: React.FC<AegisInlineProps> = ({ lang }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [consent, setConsent] = useState<boolean>(hasAIConsent());
    const [showTransparency, setShowTransparency] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const text = t[lang].assistant;

    // Écouter les changements de consentement
    useEffect(() => {
        const handler = () => setConsent(hasAIConsent());
        window.addEventListener('consentChanged', handler);
        return () => window.removeEventListener('consentChanged', handler);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading || !consent) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        const systemInstruction = text.systemPrompt;
        const { systemAddition } = enrichPromptWithRegulation(input);

        let finalPrompt = input;
        if (systemAddition) {
            finalPrompt = `CONTEXTE OBLIGATOIRE - Utilise UNIQUEMENT ces informations pour répondre :
${systemAddition}

QUESTION DE L'UTILISATEUR :
${input}

RÈGLE STRICTE : Ne jamais inventer d'informations. Utilise UNIQUEMENT le contexte ci-dessus.`;
        }

        const modelMessageIndex = messages.length + 1;
        setMessages((prev) => [...prev, { role: 'model', text: '' }]);

        try {
            let fullText = '';
            for await (const chunk of runQueryStream(finalPrompt, systemInstruction, false)) {
                fullText += chunk;
                setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[modelMessageIndex] = { role: 'model', text: fullText };
                    return newMessages;
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    // 8 règlements EU - aligné avec la Plateforme Aegis
    const regulationBadges = [
        { id: 'ai_act', label: '🤖 AI Act', color: 'bg-purple-500' },
        { id: 'machinery', label: '⚙️ Machines', color: 'bg-blue-500' },
        { id: 'espr', label: '♻️ ESPR', color: 'bg-green-500' },
        { id: 'cra', label: '🔒 CRA', color: 'bg-red-500' },
        { id: 'gdpr', label: '🛡️ RGPD', color: 'bg-indigo-500' },
        { id: 'batteries', label: '🔋 Batteries', color: 'bg-yellow-500' },
        { id: 'data_act', label: '📊 Data Act', color: 'bg-cyan-500' },
        { id: 'cpr', label: '🏗️ CPR', color: 'bg-orange-500' },
    ];

    const handleBadgeClick = (badge: typeof regulationBadges[0]) => {
        if (!consent) return;
        const questions: Record<string, string> = {
            ai_act: lang === 'fr' ? "Quelles sont les principales exigences de l'AI Act pour une PME industrielle ?" : "What are the main AI Act requirements for an industrial SME?",
            machinery: lang === 'fr' ? "Quelles exigences du Règlement Machines 2023/1230 concernent les systèmes automatisés ?" : "What Machinery Regulation 2023/1230 requirements apply to automated systems?",
            espr: lang === 'fr' ? "Comment l'ESPR 2024/1781 impacte-t-il les passeports numériques produits ?" : "How does ESPR 2024/1781 impact Digital Product Passports?",
            cra: lang === 'fr' ? "Quelles obligations de cybersécurité impose le CRA 2024/2847 ?" : "What cybersecurity obligations does CRA 2024/2847 impose?",
            gdpr: lang === 'fr' ? "Quelles sont les bases légales du RGPD pour le traitement de données industrielles ?" : "What are the GDPR legal bases for industrial data processing?",
            batteries: lang === 'fr' ? "Quelles exigences du Règlement Batteries 2023/1542 s'appliquent aux fabricants ?" : "What Batteries Regulation 2023/1542 requirements apply to manufacturers?",
            data_act: lang === 'fr' ? "Quelles obligations le Data Act 2023/2854 impose-t-il pour le partage de données industrielles ?" : "What obligations does Data Act 2023/2854 impose for industrial data sharing?",
            cpr: lang === 'fr' ? "Quelles exigences du Règlement Produits de Construction (CPR) 305/2011 s'appliquent aux fabricants ?" : "What Construction Products Regulation (CPR) 305/2011 requirements apply to manufacturers?",
        };
        setInput(questions[badge.id] || '');
    };

    return (
        <section id="aegis" className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="max-w-5xl mx-auto px-6">

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
                        <SparklesIcon className="h-4 w-4" />
                        {lang === 'fr' ? 'Assistant IA Réglementaire' : 'Regulatory AI Assistant'}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        {lang === 'fr' ? 'Aegis - Votre Expert Conformité' : 'Aegis - Your Compliance Expert'}
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        {lang === 'fr'
                            ? "Posez vos questions sur les 8 règlements européens. Réponses instantanées, citations exactes, diagnostic personnalisé."
                            : "Ask your questions about 8 EU regulations. Instant answers, exact citations, personalized diagnostic."}
                    </p>
                </div>

                {/* Regulation Badges */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {regulationBadges.map((badge) => (
                        <button
                            key={badge.id}
                            onClick={() => handleBadgeClick(badge)}
                            disabled={!consent}
                            className={`${badge.color} ${!consent ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 hover:scale-105'} text-white px-3 py-1.5 rounded-full text-sm font-medium transition-all`}
                        >
                            {badge.label}
                        </button>
                    ))}
                </div>

                {/* Chat Container */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">

                    {/* Messages Area */}
                    <div className="h-80 overflow-y-auto p-6 space-y-4">
                        {!consent ? (
                            /* État : pas de consentement */
                            <div className="text-center text-slate-400 py-12">
                                <div className="h-16 w-16 mx-auto mb-4 bg-slate-700/50 rounded-full flex items-center justify-center">
                                    <svg className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                    </svg>
                                </div>
                                <p className="text-base font-medium text-slate-300 mb-2">
                                    {lang === 'fr' ? "Assistant IA désactivé" : "AI Assistant disabled"}
                                </p>
                                <p className="text-sm text-slate-500 max-w-md mx-auto">
                                    {lang === 'fr'
                                        ? "Acceptez les cookies dans le bandeau ci-dessous pour activer l'assistant IA réglementaire."
                                        : "Accept cookies in the banner below to enable the regulatory AI assistant."}
                                </p>
                            </div>
                        ) : messages.length === 0 ? (
                            /* État : consenti, pas de messages */
                            <div className="text-center text-slate-400 py-12">
                                <SparklesIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>{lang === 'fr' ? 'Posez-moi une question sur les réglementations EU' : 'Ask me about EU regulations'}</p>
                            </div>
                        ) : (
                            /* État : messages */
                            messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-700 text-slate-100'
                                        }`}>
                                        <p className="text-sm whitespace-pre-wrap">{msg.text || (isLoading ? '...' : '')}</p>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-slate-700 p-4">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={consent ? text.placeholder : (lang === 'fr' ? 'Consentement requis pour utiliser l\'assistant' : 'Consent required to use assistant')}
                                className="flex-1 bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                                disabled={isLoading || !consent}
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim() || !consent}
                                className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl transition-colors flex items-center gap-2"
                            >
                                <PaperAirplaneIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Transparency Notice */}
                    {consent && (
                        <div className="border-t border-slate-700/50 px-4 py-2 bg-slate-800/30">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-slate-500">
                                    {lang === 'fr'
                                        ? '🔒 Vos questions sont traitées via un serveur proxy sécurisé. Aucune donnée personnelle n\'est collectée.'
                                        : '🔒 Your queries are processed through a secure proxy server. No personal data is collected.'}
                                </p>
                                <button
                                    onClick={() => setShowTransparency(!showTransparency)}
                                    className="text-xs text-blue-400 hover:text-blue-300 underline ml-2 flex-shrink-0"
                                >
                                    {showTransparency
                                        ? (lang === 'fr' ? 'Masquer' : 'Hide')
                                        : (lang === 'fr' ? 'Détails' : 'Details')}
                                </button>
                            </div>
                            {showTransparency && (
                                <div className="mt-2 p-3 bg-slate-900/50 rounded-lg text-xs text-slate-400 space-y-1">
                                    <p>{lang === 'fr'
                                        ? '• Moteur IA : Google Gemini (modèle génératif), configuration déterministe (seed:42, température:0)'
                                        : '• AI Engine: Google Gemini (generative model), deterministic config (seed:42, temperature:0)'}</p>
                                    <p>{lang === 'fr'
                                        ? '• Architecture : vos questions transitent via notre serveur proxy sécurisé — aucun contact direct entre votre navigateur et Google'
                                        : '• Architecture: your queries go through our secure proxy server — no direct contact between your browser and Google'}</p>
                                    <p>{lang === 'fr'
                                        ? '• Données : aucune donnée personnelle requise, aucun historique conservé, aucun cookie de tracking'
                                        : '• Data: no personal data required, no history stored, no tracking cookies'}</p>
                                    <p>{lang === 'fr'
                                        ? '• Base légale RGPD : consentement (Art. 6.1.a). Vous pouvez retirer votre consentement en supprimant vos cookies.'
                                        : '• GDPR legal basis: consent (Art. 6.1.a). You can withdraw consent by clearing your cookies.'}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </section>
    );
};
export default AegisInline;
