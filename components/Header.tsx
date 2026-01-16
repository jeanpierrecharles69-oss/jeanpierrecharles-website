
import React from 'react';
import { Language } from '../translations';
import { Bars3Icon } from './icons/Bars3Icon';

interface HeaderProps {
  title: string;
  lang: Language;
  setLang: (lang: Language) => void;
  onOpenMenu: () => void;
  onBackToSite?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, lang, setLang, onOpenMenu, onBackToSite }) => {
  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 sticky top-0">
      <div className="flex items-center">
        <button 
          onClick={onOpenMenu}
          className="mr-4 p-2 -ml-2 rounded-md text-slate-500 hover:bg-slate-100 md:hidden focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-500"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold text-slate-800 tracking-tight truncate max-w-[200px] sm:max-w-none">{title}</h1>
      </div>
      <div className="flex items-center space-x-4">
        {onBackToSite && (
            <button 
                onClick={onBackToSite}
                className="hidden sm:inline-block text-xs font-medium text-slate-500 hover:text-slate-900 mr-2 transition-colors"
            >
                ← Jean-Pierre Charles
            </button>
        )}
        <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-100">
            <button 
                onClick={() => setLang('fr')}
                className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${lang === 'fr' ? 'bg-white shadow text-slate-900' : 'text-slate-400'}`}
            >
                FR
            </button>
            <button 
                onClick={() => setLang('en')}
                className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${lang === 'en' ? 'bg-white shadow text-slate-900' : 'text-slate-400'}`}
            >
                EN
            </button>
        </div>
        <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded hidden sm:inline-block">v2.4.0-EU</span>
        <div className="h-8 w-8 bg-gradient-to-tr from-slate-700 to-slate-900 rounded-full ring-2 ring-white shadow-sm cursor-pointer hover:shadow-md transition-shadow"></div>
      </div>
    </header>
  );
};

export default Header;
