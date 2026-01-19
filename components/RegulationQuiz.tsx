import React, { useState } from 'react';
import questionnaires from '../data/regulation-questionnaires.json';

interface RegulationQuizProps {
    regulationKey: 'ai_act' | 'machinery' | 'gdpr' | 'cra' | 'espr' | 'data_act' | 'batteries';
    onSubmit: (responses: Record<string, string | string[]>, context: string) => void;
    onClose: () => void;
}

const RegulationQuiz: React.FC<RegulationQuizProps> = ({ regulationKey, onSubmit, onClose }) => {
    const config = questionnaires[regulationKey];
    const [responses, setResponses] = useState<Record<string, string | string[]>>({});
    const [currentStep, setCurrentStep] = useState<'resume' | 'questions' | 'generating'>('resume');

    const handleResponse = (questionId: string, value: string | string[]) => {
        setResponses(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = () => {
        setCurrentStep('generating');

        // Générer le contexte enrichi
        const contextLines = [
            `Règlement : ${config.titre}`,
            `Secteur/Contexte utilisateur :`
        ];

        config.questions.forEach((q, idx) => {
            const response = responses[q.id];
            if (response) {
                const responseText = Array.isArray(response) ? response.join(', ') : response;
                contextLines.push(`- ${q.question} → ${responseText}`);
            }
        });

        const fullContext = contextLines.join('\n');
        onSubmit(responses, fullContext);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-4xl">{config.emoji}</span>
                            <div>
                                <h2 className="text-xl font-bold">{config.titre}</h2>
                                <p className="text-sm text-blue-100">
                                    Règlement (UE) {config.id} • <span className="text-xs">JOE UE</span>
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            aria-label="Fermer"
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {currentStep === 'resume' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <span className="text-2xl">⚡</span>
                                    {config.resume_critique.titre}
                                </h3>
                                <ul className="space-y-2">
                                    {config.resume_critique.points.map((point, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                            <span className="text-blue-600 font-bold mt-0.5">•</span>
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
                                <p className="text-sm text-blue-900">
                                    💡 <strong>Prochaine étape :</strong> Répondez à 3-5 questions rapides pour obtenir
                                    une analyse personnalisée de votre situation.
                                </p>
                            </div>

                            <button
                                onClick={() => setCurrentStep('questions')}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                            >
                                Commencer le questionnaire →
                            </button>
                        </div>
                    )}

                    {currentStep === 'questions' && (
                        <div className="space-y-6">
                            {config.questions.map((question, idx) => (
                                <div key={question.id} className="space-y-3">
                                    <label className="block">
                                        <span className="text-sm font-semibold text-slate-700">
                                            {idx + 1}. {question.question}
                                        </span>
                                    </label>

                                    {question.type === 'choice' && (
                                        <div className="space-y-2">
                                            {question.options.map((option) => (
                                                <label
                                                    key={option}
                                                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${responses[question.id] === option
                                                        ? 'border-blue-600 bg-blue-50'
                                                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={question.id}
                                                        value={option}
                                                        checked={responses[question.id] === option}
                                                        onChange={(e) => handleResponse(question.id, e.target.value)}
                                                        className="w-4 h-4 text-blue-600"
                                                    />
                                                    <span className="text-sm text-slate-700">{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {question.type === 'multiple' && (
                                        <div className="space-y-2">
                                            {question.options.map((option) => {
                                                const currentResponses = (responses[question.id] as string[]) || [];
                                                const isChecked = currentResponses.includes(option);

                                                return (
                                                    <label
                                                        key={option}
                                                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${isChecked
                                                            ? 'border-blue-600 bg-blue-50'
                                                            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={(e) => {
                                                                let newResponses = [...currentResponses];
                                                                if (e.target.checked) {
                                                                    newResponses.push(option);
                                                                } else {
                                                                    newResponses = newResponses.filter(r => r !== option);
                                                                }
                                                                handleResponse(question.id, newResponses);
                                                            }}
                                                            className="w-4 h-4 text-blue-600 rounded"
                                                        />
                                                        <span className="text-sm text-slate-700">{option}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setCurrentStep('resume')}
                                    className="flex-1 border-2 border-slate-300 text-slate-700 py-3 px-6 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                                >
                                    ← Retour
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={Object.keys(responses).length === 0}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Générer l'analyse →
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 'generating' && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                            </div>
                            <p className="text-slate-600 font-medium">Analyse de votre situation en cours...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegulationQuiz;
