
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ModuleView from './components/ModuleView';
import CompliancePassportView from './components/CompliancePassportView';
import AiAssistant from './components/AiAssistant';
import JpcWebsite from './components/JpcWebsite';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { getModules } from './constants';
import { Language, t } from './translations';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  // ViewState: 'website' (JPC Portfolio) or 'app' (Aegis Platform)
  const [viewState, setViewState] = useState<'website' | 'app'>('website');
  const [lang, setLang] = useState<Language>('fr');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const modules = getModules(lang);

  const renderActiveView = () => {
    if (activeView === 'dashboard') {
      return <Dashboard setActiveView={setActiveView} lang={lang} modules={modules} />;
    }
    if (activeView.startsWith('module-')) {
      const moduleId = activeView.split('-')[1];
      const module = modules.find(m => m.id === moduleId);
      return module ? <ModuleView module={module} lang={lang} /> : <div>{t[lang].module.moduleNotFound}</div>;
    }
    if (activeView === 'passport') {
      return <CompliancePassportView lang={lang} modules={modules} />;
    }
    return <Dashboard setActiveView={setActiveView} lang={lang} modules={modules} />;
  };

  const getHeaderTitle = () => {
    if (activeView === 'dashboard') return t[lang].dashboard.welcome;
    if (activeView.startsWith('module-')) {
      const moduleId = activeView.split('-')[1];
      const module = modules.find(m => m.id === moduleId);
      return module ? module.title : 'Module';
    }
    if (activeView === 'passport') return t[lang].passport.verified;
    return 'Aegis Circular';
  };

  // If in Website mode, show JPC Website
  if (viewState === 'website') {
    return <JpcWebsite lang={lang} setLang={setLang} onEnterApp={() => setViewState('app')} />;
  }

  // Else, show Aegis App
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 relative">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <Sidebar 
        activeView={activeView} 
        setActiveView={(view) => {
          setActiveView(view);
          setIsMobileMenuOpen(false);
        }} 
        lang={lang} 
        modules={modules} 
        isOpen={isMobileMenuOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={getHeaderTitle()} 
          lang={lang} 
          setLang={setLang} 
          onOpenMenu={() => setIsMobileMenuOpen(true)}
          onBackToSite={() => setViewState('website')}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>
      <button
        onClick={() => setIsAssistantOpen(true)}
        className="fixed bottom-8 right-8 bg-slate-900 text-white p-4 rounded-full shadow-lg hover:bg-slate-800 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 z-40"
        aria-label={t[lang].assistant.title}
      >
        <SparklesIcon className="h-6 w-6" />
      </button>
      {isAssistantOpen && <AiAssistant onClose={() => setIsAssistantOpen(false)} lang={lang} />}
    </div>
  );
};

export default App;
