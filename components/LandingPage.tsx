
import React from 'react';
import { Language, t } from '../translations';
import { SparklesIcon } from './icons/SparklesIcon';
import { GlobeAltIcon } from './icons/GlobeAltIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';

interface LandingPageProps {
    lang: Language;
    setLang: (lang: Language) => void;
    onEnterApp: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ lang, setLang, onEnterApp }) => {
    const text = t[lang].landing;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
            {/* Navigation */}
            <nav className="w-full bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center z-10">
                <div className="flex items-center">
                    <div className="h-8 w-8 rounded bg-gradient-to-br from-teal-400 to-emerald-600 mr-3 flex items-center justify-center font-bold text-white">A</div>
                    <h1 className="text-xl font-bold text-white tracking-wide">Aegis<span className="text-teal-400 font-light">Circular</span></h1>
                </div>
                <div className="flex items-center space-x-6">
                    <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                        <button
                            onClick={() => setLang('fr')}
                            className={`px-3 py-1 rounded text-xs font-bold transition-all ${lang === 'fr' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            FR
                        </button>
                        <button
                            onClick={() => setLang('en')}
                            className={`px-3 py-1 rounded text-xs font-bold transition-all ${lang === 'en' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            EN
                        </button>
                    </div>
                    <button
                        onClick={onEnterApp}
                        className="hidden sm:block px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-lg transition-colors shadow-lg"
                    >
                        {text.cta}
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative flex-1 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 -left-4 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
                </div>

                <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-sm font-medium mb-8">
                        <SparklesIcon className="h-4 w-4 mr-2" />
                        <span>v2.5.0-EU • Compliance AI</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                        {text.heroTitle.split('&').map((part, i) => (
                            <span key={i} className="block">{part.trim()} {i === 0 && <span className="text-teal-600">&</span>}</span>
                        ))}
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                        {text.heroSubtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={onEnterApp}
                            className="px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 w-full sm:w-auto"
                        >
                            {text.cta}
                        </button>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="bg-white py-20 border-t border-slate-200">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
                            <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                                <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3">{text.features.dpp}</h3>
                            <p className="text-slate-600 leading-relaxed">{text.features.dppDesc}</p>
                        </div>
                        <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
                            <div className="h-12 w-12 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                                <SparklesIcon className="h-6 w-6 text-teal-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3">{text.features.ai}</h3>
                            <p className="text-slate-600 leading-relaxed">{text.features.aiDesc}</p>
                        </div>
                        <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
                            <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                                <ShieldCheckIcon className="h-6 w-6 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3">{text.features.security}</h3>
                            <p className="text-slate-600 leading-relaxed">{text.features.securityDesc}</p>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="bg-slate-900 py-8 text-center text-slate-500 text-sm">
                <p>© 2026 Aegis Circular EU. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
