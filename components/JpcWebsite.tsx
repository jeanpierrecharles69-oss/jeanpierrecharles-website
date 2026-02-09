import React, { useState } from 'react';
import { Language, t } from '../translations';
import { SparklesIcon } from './icons/SparklesIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { PuzzlePieceIcon } from './icons/PuzzlePieceIcon';
import { GlobeAltIcon } from './icons/GlobeAltIcon';
import { XMarkIcon } from './icons/XMarkIcon';
import TrustSection from './TrustSection';
import AegisInline from './AegisInline';
import CookieBanner from './CookieBanner';


// Images des expériences professionnelles
const experienceImages = [
    '/images/experiences/ai_journey.png',
    '/images/experiences/autoliv.png',
    '/images/experiences/forsee.png',
    '/images/experiences/thales.png',
    '/images/experiences/faurecia.png',
    '/images/experiences/branson.png'
];

interface JpcWebsiteProps {
    lang: Language;
    setLang: (lang: Language) => void;
    onEnterApp: () => void;
}

const JpcWebsite: React.FC<JpcWebsiteProps> = ({ lang, setLang, onEnterApp }) => {
    const text = t[lang].jpc;
    const [isLegalOpen, setIsLegalOpen] = useState(false);
    const [emailCopied, setEmailCopied] = useState(false);
    const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
    const [showDiagnosticForm, setShowDiagnosticForm] = useState(false);

    const copyEmailToClipboard = async () => {
        try {
            // Méthode moderne (navigator.clipboard)
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text.contact.email);
                console.log('✅ Email copié:', text.contact.email);
            } else {
                // Fallback pour navigateurs anciens
                const textArea = document.createElement('textarea');
                textArea.value = text.contact.email;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                console.log('✅ Email copié (fallback):', text.contact.email);
            }
            setEmailCopied(true);
            setTimeout(() => setEmailCopied(false), 3000);
        } catch (err) {
            console.error('❌ Erreur copie:', err);
            alert(`Email: ${text.contact.email}\n\n(Copiez manuellement)`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col selection:bg-blue-100">

            {/* Navigation */}
            <nav className="w-full bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-3 flex justify-between items-center z-50 sticky top-0 transition-all">
                <div className="flex items-center cursor-pointer gap-4" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    {/* Initials Bubble Navigation */}
                    <div className="h-10 w-10 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold shadow-md shadow-slate-200 text-xs tracking-wider">
                        JPC
                    </div>
                    <div>
                        <h1 className="text-lg font-medium text-slate-800 leading-none tracking-tight">Jean-Pierre Charles</h1>
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">{lang === 'fr' ? 'Industrie Transformation 5.0' : 'Industrial Transformation 5.0'}</span>
                    </div>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-500">
                    <a href="#vision" className="hover:text-slate-800 transition-colors">{text.nav.vision}</a>
                    <a href="#services" className="hover:text-slate-800 transition-colors">{text.nav.services}</a>
                    <a href="#contact" className="hover:text-slate-800 transition-colors">{text.nav.contact}</a>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex bg-slate-100 rounded-full p-1 border border-slate-200">
                        <button
                            onClick={() => setLang('fr')}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${lang === 'fr' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            FR
                        </button>
                        <button
                            onClick={() => setLang('en')}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${lang === 'en' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            EN
                        </button>
                    </div>
                    <button
                        onClick={onEnterApp}
                        className="hidden sm:flex items-center px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-full transition-all shadow-md hover:shadow-lg"
                    >
                        <SparklesIcon className="h-4 w-4 mr-2 text-blue-200" />
                        {text.nav.aegis}
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-20 pb-32 px-6 overflow-hidden bg-slate-50">
                {/* Subtle background blobs */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-slate-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-500 text-xs font-medium uppercase tracking-wider mb-8">
                        <GlobeAltIcon className="h-3.5 w-3.5 mr-2 text-slate-500" />
                        <span>{lang === 'fr' ? 'Expertise Certifiée | Conformité UE' : 'Certified Expert | EU Compliance'}</span>
                    </div>
                    {/* Typography reduced and lighter */}
                    <h1 className="text-3xl md:text-5xl font-medium text-slate-800 tracking-tight leading-tight mb-8">
                        {text.hero.title}
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                        {text.hero.subtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button onClick={() => setShowDiagnosticForm(true)} className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-base font-medium rounded-full shadow-lg hover:shadow-xl transition-all w-full sm:w-auto">
                            {text.hero.cta_talk}
                        </button>
                        <button onClick={onEnterApp} className="px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-blue-300 text-base font-medium rounded-full shadow-sm hover:shadow-md transition-all w-full sm:w-auto flex items-center justify-center">
                            <SparklesIcon className="h-4 w-4 mr-2 text-slate-500" />
                            {text.hero.cta_app}
                        </button>
                    </div>
                </div>
            </header>

            {/* Aegis Inline Section - Integrated AI Assistant */}
            <AegisInline lang={lang} />

            {/* Vision Section */}
            <section id="vision" className="py-24 bg-slate-50/50">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-slate-200 to-slate-100 rounded-3xl transform rotate-3 opacity-40"></div>
                            <div className="relative bg-white rounded-3xl p-6 h-auto flex flex-col items-center justify-center border border-slate-100 shadow-lg overflow-hidden group">
                                <div className="text-center w-full">
                                    {/* Profile Image — photo locale */}
                                    <div className="h-64 w-64 mx-auto shadow-2xl flex items-center justify-center mb-6 border-4 border-white transition-transform duration-500 hover:scale-105 rounded-2xl overflow-hidden bg-slate-100">
                                        <img
                                            src="/jpc.jpg"
                                            alt="Jean-Pierre Charles"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <h3 className="text-2xl font-medium text-slate-800 mb-2">Jean-Pierre Charles</h3>
                                    <p className="font-serif italic text-lg text-slate-500 mb-6 font-medium">"L'excellence par l'humain"</p>

                                    <div className="flex justify-center space-x-4 mb-2">
                                        <a href={text.contact.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile" title="Visitez mon profil LinkedIn" className="p-3 bg-white text-slate-500 rounded-full hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-slate-200">
                                            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                                        </a>
                                        <a href={text.contact.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Contact" title="Contactez-moi sur WhatsApp" className="p-3 bg-white text-slate-500 rounded-full hover:bg-green-600 hover:text-white transition-all shadow-sm border border-slate-200">
                                            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.417-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.305 1.652zm6.599-3.835c1.52.909 3.197 1.389 4.908 1.39h.005c5.334 0 9.673-4.34 9.675-9.674.002-2.586-1.006-5.017-2.839-6.85s-4.264-2.841-6.853-2.842c-5.337 0-9.674 4.337-9.677 9.671-.001 1.841.522 3.635 1.509 5.204l-.994 3.628 3.719-.975zm11.233-7.514c-.244-.122-1.442-.712-1.666-.794-.223-.082-.387-.122-.549.122-.162.244-.63.794-.772.957-.142.163-.284.183-.528.061-.244-.122-1.029-.379-1.961-1.211-.724-.646-1.214-1.444-1.356-1.688-.142-.244-.015-.376.107-.497.111-.11.244-.284.366-.427.122-.142.162-.244.244-.406.082-.163.041-.305-.021-.427-.061-.122-.549-1.322-.752-1.81-.197-.474-.397-.411-.548-.418l-.466-.008c-.163 0-.427.061-.65.305-.224.244-.854.834-.854 2.035 0 1.201.874 2.36 1.057 2.053-.183.142-1.611 3.559-1.323 5.422.311-.122.183-.244.183-2.228 1.484.224.224.162.463-.224.244-.386 2.134-2.108 2.134-2.108.12 0 .15-.05.18-.08s.03-.06.05-.09c.28-.4 1.25-.4 1.25-.4z" /></svg>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-medium text-slate-800 mb-6">{text.vision.title}</h2>
                            <p className="text-lg text-slate-500 leading-loose font-medium">
                                {text.vision.text}
                            </p>
                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <div className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 shadow-sm transition-all hover:-translate-y-1">
                                    <h4 className="font-medium text-slate-800 text-base mb-1">{lang === 'fr' ? 'Autonomie' : 'Empowerment'}</h4>
                                    <p className="text-sm text-slate-500 font-medium tracking-tight">{lang === 'fr' ? "Redonner le pouvoir aux équipes par l'intelligence collective." : "Empowering teams through collective intelligence."}</p>
                                </div>
                                <div className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 shadow-sm transition-all hover:-translate-y-1">
                                    <h4 className="font-medium text-slate-800 text-base mb-1">{lang === 'fr' ? 'Robustesse' : 'Reliability'}</h4>
                                    <p className="text-sm text-slate-500 font-medium tracking-tight">{lang === 'fr' ? 'Des systèmes mécatroniques fiables et durables.' : 'Reliable and sustainable mechatronic systems.'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="experience" className="py-24 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row gap-12">
                        <div className="md:w-1/3">
                            <h2 className="text-3xl font-medium text-slate-800 mb-4 sticky top-24">{text.experience.title}</h2>
                            <p className="text-slate-500 mb-4 leading-relaxed font-medium text-sm italic">{text.experience.subtitle}</p>
                            <a
                                href={text.contact.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-all shadow-md mb-8"
                            >
                                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                                Voir profil/parcours
                            </a>

                            <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-xl">
                                <h3 className="text-xl font-bold mb-4">{text.education.title}</h3>
                                <div className="space-y-6">
                                    {text.education.items.map((item, idx) => (
                                        <div key={idx} className="border-l-2 border-blue-400 pl-4">
                                            <p className="text-xs font-bold text-blue-300 uppercase mb-1">{item.year}</p>
                                            <p className="text-sm font-bold leading-tight mb-1">{item.school}</p>
                                            <p className="text-xs text-slate-400">{item.degree}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="md:w-2/3 space-y-12">
                            {text.experience.items.map((item, idx) => (
                                <div key={idx} className="relative pl-8 border-l border-slate-200 group">
                                    <div className="absolute left-[-1px] top-0 h-4 w-4 bg-white border-2 border-slate-900 rounded-full group-hover:bg-slate-900 transition-colors"></div>

                                    {/* Image Badge + Titre */}
                                    <div className="flex items-center gap-4 mb-2">
                                        <img
                                            src={experienceImages[idx]}
                                            alt={item.company}
                                            className="h-14 w-14 rounded-full object-cover border-2 border-blue-400 shadow-md hover:scale-110 transition-transform cursor-pointer"
                                            onClick={() => setSelectedImage({ src: experienceImages[idx], alt: item.company })}
                                            title="Cliquez pour agrandir"
                                        />
                                        <div className="flex-1 flex flex-col sm:flex-row sm:items-baseline justify-between">
                                            <h3 className="text-xl font-medium text-slate-800">{item.company}</h3>
                                            <span className="text-sm font-medium text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full">{item.period}</span>
                                        </div>
                                    </div>

                                    {item.project && (
                                        <p className="text-sm font-semibold text-blue-600 mb-2 italic">{item.project}</p>
                                    )}
                                    <p className="text-lg font-medium text-blue-900 mb-3">{item.role}</p>
                                    <p className="text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust & Social Proof Section */}
            <TrustSection lang={lang} />

            {/* Services Section */}
            <section id="services" className="py-24 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-medium text-slate-800 mb-4">{text.services.title}</h2>
                        <div className="h-1 w-20 bg-slate-800 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Service 1 */}
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
                            <div className="h-14 w-14 bg-slate-50 rounded-xl flex items-center justify-center mb-6 text-slate-800 shadow-sm border border-slate-200">
                                <GlobeAltIcon className="h-7 w-7" />
                            </div>
                            <h3 className="text-xl font-medium text-slate-800 mb-3">{text.services.consulting.title}</h3>
                            <p className="text-slate-500 leading-relaxed text-base mb-6 font-medium">{text.services.consulting.desc}</p>
                        </div>

                        {/* Service 2 */}
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
                            <div className="h-14 w-14 bg-slate-50 rounded-xl flex items-center justify-center mb-6 text-slate-800 shadow-sm border border-slate-200">
                                <PuzzlePieceIcon className="h-7 w-7" />
                            </div>
                            <h3 className="text-xl font-medium text-slate-800 mb-3">{text.services.expertise.title}</h3>
                            <p className="text-slate-500 leading-relaxed text-base mb-6 font-medium">{text.services.expertise.desc}</p>
                        </div>

                        {/* Service 3: Aegis (Special Card) - Navy Theme */}
                        <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl text-white transform md:scale-105 relative overflow-hidden group border border-slate-800">
                            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-900 rounded-full mix-blend-overlay filter blur-3xl opacity-50"></div>

                            {/* Development Badge */}
                            <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                                <div className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full border border-blue-300 shadow-lg">
                                    v2.5.0-EU
                                </div>
                                <div className="px-3 py-1 bg-amber-500 text-slate-900 text-xs font-bold rounded-full animate-pulse">
                                    {lang === 'fr' ? '🚧 En développement' : '🚧 Work in Progress'}
                                </div>
                            </div>

                            <div className="h-14 w-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 text-blue-200">
                                <SparklesIcon className="h-7 w-7" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 flex items-center">
                                {text.services.aegis_card.title}
                            </h3>
                            <p className="text-slate-300 leading-relaxed text-base mb-8 border-b border-slate-700 pb-6 font-medium">
                                {text.services.aegis_card.desc}
                            </p>
                            <button
                                onClick={onEnterApp}
                                className="w-full py-3.5 bg-white text-slate-900 font-bold rounded-lg transition-colors flex items-center justify-center hover:bg-blue-50"
                            >
                                {text.services.aegis_card.action}
                                <ShieldCheckIcon className="h-5 w-5 ml-2" />
                            </button>

                            {/* Copyright Footer */}
                            <div className="mt-4 pt-4 border-t border-slate-800 text-center">
                                <p className="text-xs text-slate-500">© 2026 Aegis Circular™ | Jean-Pierre Charles</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-3xl font-bold mb-8">{text.contact.title}</h2>
                    <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto font-medium">{text.contact.text}</p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a href={`mailto:${text.contact.email}`} className="inline-flex items-center justify-center px-10 py-5 bg-white text-slate-900 text-xl font-bold rounded-full hover:bg-slate-100 transition-transform transform hover:-translate-y-1 shadow-2xl">
                            <DocumentTextIcon className="h-6 w-6 mr-3" />
                            {text.contact.email}
                        </a>

                        <div className="flex gap-2">
                            <button
                                onClick={copyEmailToClipboard}
                                aria-label="Copier l'email dans le presse-papier"
                                className="inline-flex items-center justify-center px-6 py-4 bg-slate-800 text-white text-base font-bold rounded-full hover:bg-slate-700 transition-all shadow-lg"
                            >
                                {emailCopied ? (lang === 'fr' ? '✓ Copié !' : '✓ Copied!') : (lang === 'fr' ? '📋 Copier' : '📋 Copy')}
                            </button>

                            <a href={text.contact.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile" title="Visitez mon profil LinkedIn" className="inline-flex items-center justify-center px-5 py-4 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all shadow-lg">
                                <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                            </a>
                        </div>
                    </div>

                    <div className="mt-16 text-center">
                        <p className="text-xs text-slate-500 mb-4">{text.footer.rights}</p>
                        <button
                            id="legal-link"
                            onClick={() => setIsLegalOpen(true)}
                            className="text-xs text-slate-400 hover:text-white underline underline-offset-4 transition-colors font-medium"
                        >
                            {text.footer.legal}
                        </button>
                    </div>
                </div>
            </section>

            {/* Legal Notice Modal */}
            {isLegalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-scale-up">
                        <button
                            onClick={() => setIsLegalOpen(false)}
                            title={lang === 'fr' ? 'Fermer' : 'Close'}
                            aria-label={lang === 'fr' ? 'Fermer' : 'Close'}
                            className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                        <div className="p-8">
                            <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">{text.legalModal.title}</h2>
                            <div className="space-y-4 text-slate-500 text-sm leading-relaxed font-medium">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <p className="font-bold text-slate-800 mb-1">{text.legalModal.companyName}</p>
                                        <p>{text.legalModal.status}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <p className="font-bold text-slate-800 mb-1">{text.legalModal.commercialName}</p>
                                        <p>{text.legalModal.director}</p>
                                    </div>
                                </div>

                                <div className="p-4 border border-slate-200 rounded-lg">
                                    <h3 className="font-bold text-slate-900 mb-2">Identification</h3>
                                    <ul className="space-y-2">
                                        <li>{text.legalModal.siren}</li>
                                        <li>{text.legalModal.siret}</li>
                                        <li>{text.legalModal.ape}</li>
                                    </ul>
                                </div>

                                <div className="p-4 border border-slate-200 rounded-lg">
                                    <h3 className="font-bold text-slate-900 mb-2">Coordonnées</h3>
                                    <p className="mb-2">{text.legalModal.address}</p>
                                </div>

                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                    <h3 className="font-bold text-slate-900 mb-2">Activité</h3>
                                    <p>{text.legalModal.activity}</p>
                                </div>
                            </div>
                            <div className="mt-8 pt-4 border-t border-slate-100 text-center">
                                <button
                                    onClick={() => setIsLegalOpen(false)}
                                    className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Agrandissement Image */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-4 right-4 text-white hover:text-slate-300 transition-colors"
                        aria-label="Fermer"
                    >
                        <XMarkIcon className="h-10 w-10" />
                    </button>
                    <img
                        src={selectedImage.src}
                        alt={selectedImage.alt}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm font-medium">
                        {selectedImage.alt}
                    </div>
                </div>
            )}

            {/* Modal Formulaire Diagnostic */}
            {showDiagnosticForm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
                    onClick={() => setShowDiagnosticForm(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowDiagnosticForm(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                            aria-label="Fermer"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>

                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                            {lang === 'fr' ? 'Demande de Diagnostic Transformation Industrie 5.0' : 'Industry 5.0 Transformation Diagnostic Request'}
                        </h2>
                        <p className="text-slate-500 mb-6">
                            {lang === 'fr'
                                ? 'Cliquez sur le bouton ci-dessous pour envoyer votre demande par email. Le formulaire sera pré-rempli avec l\'objet.'
                                : 'Click the button below to send your request by email. The form will be pre-filled with the subject.'}
                        </p>

                        <div className="bg-slate-50 rounded-lg p-6 mb-6 border border-slate-200">
                            <p className="text-sm font-semibold text-slate-800 mb-3">
                                {lang === 'fr' ? 'Informations pré-remplies :' : 'Pre-filled information:'}
                            </p>
                            <div className="space-y-2 text-sm text-slate-500">
                                <p><strong>{lang === 'fr' ? 'À :' : 'To:'}</strong> contact@jeanpierrecharles.com</p>
                                <p><strong>{lang === 'fr' ? 'Objet :' : 'Subject:'}</strong> Demande de Diagnostic Transformation Industrie 5.0</p>
                            </div>
                        </div>

                        <a
                            href={`mailto:contact@jeanpierrecharles.com?subject=${encodeURIComponent('Demande de Diagnostic Transformation Industrie 5.0')}&body=${encodeURIComponent('Bonjour,\n\nJe souhaiterais obtenir un diagnostic pour la transformation Industrie 5.0 de mon organisation.\n\nNom de l\'entreprise :\nSecteur d\'activité :\nPrincipaux enjeux :\n\nCordialement,')}`}
                            className="w-full px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white text-base font-bold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                        >
                            <DocumentTextIcon className="h-5 w-5 mr-2" />
                            {lang === 'fr' ? 'Ouvrir Mon Client Email' : 'Open My Email Client'}
                        </a>

                        <p className="text-xs text-slate-500 text-center mt-4">
                            {lang === 'fr'
                                ? 'Votre client email par défaut sera ouvert avec le formulaire pré-rempli'
                                : 'Your default email client will open with the pre-filled form'}
                        </p>
                    </div>
                </div>
            )}
            <CookieBanner lang={lang} />
        </div>
    );
};

export default JpcWebsite;
