
import React from 'react';
import { RegulationModule, ComplianceStatus } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { Language, t } from '../translations';

interface ModuleViewProps {
  module: RegulationModule;
  lang: Language;
}

const statusStyles: { [key in ComplianceStatus]: { icon: React.FC<React.SVGProps<SVGSVGElement>>, text: string, bg: string, border: string } } = {
  [ComplianceStatus.Compliant]: { icon: CheckCircleIcon, text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
  [ComplianceStatus.AtRisk]: { icon: ExclamationTriangleIcon, text: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  [ComplianceStatus.NonCompliant]: { icon: XCircleIcon, text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
};

const ModuleView: React.FC<ModuleViewProps> = ({ module, lang }) => {
  const text = t[lang].module;
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center">
          <div className="p-4 bg-slate-100 rounded-lg">
            <module.icon className="h-8 w-8 text-slate-800" />
          </div>
          <div className="ml-6">
            <h2 className="text-2xl font-semibold text-slate-800">{module.title}</h2>
            <p className="text-slate-500 mt-2 max-w-3xl leading-relaxed">{module.description}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-semibold text-slate-800">{text.controls}</h3>
        </div>
        <ul className="divide-y divide-slate-100">
          {module.complianceItems.length > 0 ? module.complianceItems.map(item => {
            const styles = statusStyles[item.status];
            const Icon = styles.icon;
            return (
              <li key={item.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <p className="font-semibold text-slate-800 text-base">{item.name}</p>
                    <p className="text-sm text-slate-500 mt-1">{item.details}</p>
                  </div>
                  <div className="flex items-center space-x-6">
                    <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded">{text.verified}: {item.lastChecked}</span>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${styles.bg} ${styles.text} ${styles.border}`}>
                      <Icon className={`-ml-0.5 mr-2 h-4 w-4`} />
                      {item.status}
                    </span>
                  </div>
                </div>
              </li>
            );
          }) : (
            <li className="p-8 text-center text-slate-500 italic">{text.none}</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ModuleView;
