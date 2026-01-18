
import React, { useState, useRef, useEffect } from 'react';
import { runQueryStream } from '../services/geminiService';
import { enrichPromptWithRegulation } from '../services/regulationKnowledgeService';
import { ChatMessage } from '../types';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { XMarkIcon } from './icons/XMarkIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { Language, t } from '../translations';
import RegulationQuiz from './RegulationQuiz';

interface AiAssistantProps {
  onClose: () => void;
  lang: Language;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ onClose, lang }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<'ai_act' | 'machinery' | 'gdpr' | 'cra' | 'espr' | 'data_act' | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const text = t[lang].assistant;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages((prev: ChatMessage[]) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const systemInstruction = text.systemPrompt;

    // Enrichir le prompt avec les connaissances réglementaires locales
    const { enrichedPrompt, systemAddition } = enrichPromptWithRegulation(input);

    // IMPORTANT : Injecter les connaissances DANS le prompt utilisateur, pas juste le system
    // Cela force Gemini à les prendre en compte
    let finalPrompt = input;
    if (systemAddition) {
      finalPrompt = `CONTEXTE OBLIGATOIRE - Utilise UNIQUEMENT ces informations pour répondre :
${systemAddition}

QUESTION DE L'UTILISATEUR :
${input}

RÈGLE STRICTE : Ne jamais inventer d'informations. Utilise UNIQUEMENT le contexte ci-dessus.`;
    }

    // Initial empty model message
    const modelMessageIndex = messages.length + 1;
    setMessages((prev: ChatMessage[]) => [...prev, { role: 'model', text: '' }]);

    try {
      let fullText = '';
      // Grounding désactivé (non supporté par cette clé API)
      // Utilise la base de connaissances locale pour les règlements 2024
      for await (const chunk of runQueryStream(finalPrompt, systemInstruction, false)) {
        fullText += chunk;
        setMessages((prev: ChatMessage[]) => {
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

  const handleQuizSubmit = async (responses: Record<string, string | string[]>, context: string) => {
    // Fermer le quiz
    setActiveQuiz(null);

    // Créer le prompt enrichi avec le contexte du questionnaire
    // FORMAT COMPACT PROFESSIONNEL (250 mots MAX)
    const enrichedPrompt = `${context}

FORMAT PROFESSIONNEL COMPACT (250 mots MAXIMUM) :

**🎯 [NIVEAU PRIORITÉ + Emoji]**
[2 phrases de diagnostic direct - pas de formules creuses]

**📊 SITUATION :**
- ❌ [Point manquant 1]
- ❌ [Point manquant 2]
- ✅ [Point positif si applicable]
- ⚠️ [Risque principal]

**📋 PLAN D'ACTION (TOP 3) :**

**1. [Action #1 en 3-4 mots]**
Objectif : [1 phrase]. Démarche : [2-3 étapes en 1 phrase compacte]. Résultat : [1 phrase].

**2. [Action #2 en 3-4 mots]**
Objectif : [1 phrase]. Démarche : [2-3 étapes en 1 phrase compacte]. Résultat : [1 phrase].

**3. [Action #3 en 3-4 mots]**  
Objectif : [1 phrase]. Démarche : [2-3 étapes en 1 phrase compacte]. Résultat : [1 phrase].

**⏰ TIMELINE :**
Urgent (< 6 mois) : [Actions]
Court terme (6-18 mois) : [Actions]

**💡 CONSEIL :**
[1-2 phrases concrètes pour démarrer rapidement]

RÈGLES STRICTES :
- MAXIMUM 250 mots (pas 300, pas 370)
- Ton DIRECT et factuel
- PAS de sous-bullets (●, -, 1., 2., 3.)
- PAS de phrases "creuses" style consulting
- Démarches en 1 phrase compacte, pas liste numérotée
- Émojis simples : ✅ ❌ ⚠️ uniquement`;




    // Ajouter le message utilisateur
    const userMessage: ChatMessage = {
      role: 'user',
      text: `Analyse personnalisée pour ${activeQuiz?.replace('_', ' ').toUpperCase()}`
    };
    setMessages((prev: ChatMessage[]) => [...prev, userMessage]);

    setIsLoading(true);
    const modelMessageIndex = messages.length + 1;
    setMessages((prev: ChatMessage[]) => [...prev, { role: 'model', text: '' }]);

    const systemInstruction = text.systemPrompt;

    try {
      let fullText = '';
      for await (const chunk of runQueryStream(enrichedPrompt, systemInstruction, false)) {
        fullText += chunk;
        setMessages((prev: ChatMessage[]) => {
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Message d'accueil enrichi et personnalisé
  const WelcomeMessage = () => (
    <div className="text-center px-4 py-8 max-w-md mx-auto">
      {/* Icône premium avec animation */}
      <div className="relative inline-block mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-yellow-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="relative bg-gradient-to-br from-blue-50 to-yellow-50 p-4 rounded-full border-2 border-blue-100">
          <SparklesIcon className="h-10 w-10 text-blue-600" />
        </div>
      </div>

      {/* Titre  */}
      <h3 className="text-xl font-bold text-slate-900 mb-3">
        {lang === 'fr' ? 'Bonjour !' : 'Hello!'} 👋
      </h3>

      {/* Message personnalisé */}
      <p className="text-sm text-slate-600 leading-relaxed mb-6">
        {lang === 'fr'
          ? "Je suis votre assistant IA spécialisé dans la conformité industrielle européenne."
          : "I'm your AI assistant specialized in European industrial compliance."
        }
      </p>

      {/* Badges de spécialisation - Cliquables */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        <button
          onClick={() => setActiveQuiz('ai_act')}
          className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all cursor-pointer transform hover:scale-105"
        >
          🤖 AI Act
        </button>
        <button
          onClick={() => setActiveQuiz('machinery')}
          className="px-3 py-1.5 bg-yellow-50 text-yellow-700 text-xs font-semibold rounded-full border border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300 transition-all cursor-pointer transform hover:scale-105"
        >
          ⚙️ Machinery
        </button>
        <button
          onClick={() => setActiveQuiz('gdpr')}
          className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200 hover:bg-green-100 hover:border-green-300 transition-all cursor-pointer transform hover:scale-105"
        >
          🔒 GDPR
        </button>
        <button
          onClick={() => setActiveQuiz('cra')}
          className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-200 hover:bg-purple-100 hover:border-purple-300 transition-all cursor-pointer transform hover:scale-105"
        >
          🛡️ CRA
        </button>
        <button
          onClick={() => setActiveQuiz('espr')}
          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-all cursor-pointer transform hover:scale-105"
        >
          ♻️ ESPR
        </button>
        <button
          onClick={() => setActiveQuiz('data_act')}
          className="px-3 py-1.5 bg-pink-50 text-pink-700 text-xs font-semibold rounded-full border border-pink-200 hover:bg-pink-100 hover:border-pink-300 transition-all cursor-pointer transform hover:scale-105"
        >
          📊 Data Act
        </button>
      </div>

      {/* Suggestions de questions */}
      <div className="text-left bg-slate-50 rounded-xl p-4 border border-slate-200">
        <p className="text-xs font-semibold text-slate-700 mb-2">
          {lang === 'fr' ? '💡 Exemples de questions :' : '💡 Example questions:'}
        </p>
        <ul className="text-xs text-slate-600 space-y-1.5">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>{lang === 'fr'
              ? "Quelles sont les exigences de l'AI Act pour mon produit ?"
              : "What are the AI Act requirements for my product?"
            }</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>{lang === 'fr'
              ? "Comment se conformer au règlement Machines 2023/1230 ?"
              : "How to comply with Machinery Regulation 2023/1230?"
            }</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>{lang === 'fr'
              ? "Quelle est la différence entre ESPR et RGPD ?"
              : "What's the difference between ESPR and GDPR?"
            }</span>
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden border border-slate-200 animate-scale-up">
        {/* Header avec gradient européen */}
        <header className="relative flex items-center justify-between p-5 bg-gradient-to-r from-blue-600 via-blue-700 to-yellow-600 text-white overflow-hidden">
          {/* Effet de fond supérieur */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

          <div className="flex items-center relative z-10">
            <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl border border-white/30 shadow-lg">
              <SparklesIcon className="h-5 w-5 text-yellow-200" />
            </div>
            <div className="ml-3">
              <h2 className="text-lg font-bold">{text.title}</h2>
              <p className="text-xs text-blue-100">
                {lang === 'fr' ? 'Expert conformité européenne' : 'European compliance expert'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            title={lang === 'fr' ? 'Fermer' : 'Close'}
            aria-label={lang === 'fr' ? 'Fermer' : 'Close'}
            className="relative z-10 p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all"
          >
            <XMarkIcon className="h-6 w-6 text-white" />
          </button>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-slate-50 to-white">
          {messages.length === 0 && <WelcomeMessage />}

          {messages.map((msg: ChatMessage, index: number) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm shadow-md transition-all hover:shadow-lg ${msg.role === 'user'
                ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-br-sm'
                : 'bg-white text-slate-800 rounded-bl-sm border border-slate-200'
                }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.text === '' && (
            <div className="flex justify-start">
              <div className="p-4 rounded-2xl bg-white text-slate-800 rounded-bl-sm border border-slate-200 shadow-md">
                <div className="flex items-center space-x-2">
                  <div className="h-2.5 w-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-2.5 w-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-2.5 w-2.5 bg-blue-500 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer input avec design premium */}
        <footer className="p-4 bg-white border-t border-slate-200 shadow-lg">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={text.placeholder}
              className="w-full pl-5 pr-14 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              title={lang === 'fr' ? 'Envoyer le message' : 'Send message'}
              aria-label={lang === 'fr' ? 'Envoyer le message' : 'Send message'}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Indicateur de statut */}
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center">
              <span className={`h-2 w-2 rounded-full mr-2 ${isLoading ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></span>
              {isLoading
                ? (lang === 'fr' ? 'En cours de rédaction...' : 'Generating response...')
                : (lang === 'fr' ? 'Prêt' : 'Ready')
              }
            </span>
            <span className="text-slate-400">
              {lang === 'fr' ? 'Entrée pour envoyer' : 'Press Enter to send'}
            </span>
          </div>
        </footer>
      </div>

      {/* Questionnaire modal */}
      {activeQuiz && (
        <RegulationQuiz
          regulationKey={activeQuiz}
          onSubmit={handleQuizSubmit}
          onClose={() => setActiveQuiz(null)}
        />
      )}
    </div>
  );
};

export default AiAssistant;
