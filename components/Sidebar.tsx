
import React from 'react';
import { RegulationModule } from '../types';
import { ChartPieIcon } from './icons/ChartPieIcon';
import { Language, t } from '../translations';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  lang: Language;
  modules: RegulationModule[];
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, lang, modules, isOpen }) => {
  const text = t[lang].sidebar;

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl 
        transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="h-16 flex items-center px-6 bg-slate-950 border-b border-slate-800 shrink-0">
        <div className="h-8 w-8 rounded bg-gradient-to-br from-blue-600 to-slate-800 mr-3 flex items-center justify-center font-bold text-white">A</div>
        <h1 className="text-lg font-semibold text-white tracking-wide">Aegis<span className="text-slate-400 font-light">Circular</span></h1>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); setActiveView('dashboard'); }}
          className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${activeView === 'dashboard'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
        >
          <ChartPieIcon className={`h-5 w-5 mr-3 transition-colors ${activeView === 'dashboard' ? 'text-blue-400' : 'text-slate-500 group-hover:text-white'}`} />
          {text.overview}
        </a>

        <div className="pt-6 pb-2">
          <h2 className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{text.complianceHeader}</h2>
          <div className="space-y-1">
            {modules.map(module => (
              <a
                key={module.id}
                href="#"
                onClick={(e) => { e.preventDefault(); setActiveView(module.id === '4' ? 'passport' : `module-${module.id}`); }}
                className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${(activeView === `module-${module.id}` || (activeView === 'passport' && module.id === '4'))
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <module.icon className={`h-5 w-5 mr-3 transition-colors ${(activeView === `module-${module.id}` || (activeView === 'passport' && module.id === '4'))
                    ? 'text-blue-400'
                    : 'text-slate-500 group-hover:text-slate-300'
                  }`} />
                {module.shortTitle}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <div className="p-4 bg-slate-950 border-t border-slate-800 shrink-0">
        <div className="flex items-center mb-3">
          <div className="h-8 w-8 rounded-full bg-slate-700 border border-slate-600"></div>
          <div className="ml-3">
            <p className="text-xs font-medium text-white">{text.admin}</p>
            <p className="text-[10px] text-slate-500">{text.edition}</p>
          </div>
        </div>
        <p className="text-[10px] text-slate-600 text-center mt-2">© 2026 Aegis Circular EU</p>
      </div>
    </aside>
  );
};

export default Sidebar;
