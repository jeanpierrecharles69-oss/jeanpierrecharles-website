
import React from 'react';
import { RegulationModule, ComplianceStatus } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { GlobeAltIcon } from './icons/GlobeAltIcon';
import { Language, t } from '../translations';
import GamificationBadges from './GamificationBadges';


interface DashboardProps {
    setActiveView: (view: string) => void;
    lang: Language;
    modules: RegulationModule[];
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveView, lang, modules }) => {
    const text = t[lang].dashboard;

    // Calculate global stats
    const allItems = modules.flatMap(m => m.complianceItems);
    const compliantCount = allItems.filter(i => i.status === ComplianceStatus.Compliant).length;
    const totalItems = allItems.length;
    const complianceScore = totalItems > 0 ? Math.round((compliantCount / totalItems) * 100) : 100;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Banner */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col md:flex-row justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold text-slate-800">{text.welcome}</h2>
                    <p className="text-slate-500 mt-2 max-w-xl text-sm leading-relaxed">
                        {text.subtitle}
                    </p>
                </div>
                <div className="mt-6 md:mt-0 flex items-center space-x-8">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-slate-800">{complianceScore}%</div>
                        <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">{text.globalIndex}</div>
                    </div>
                    <div className="h-10 w-px bg-slate-200"></div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-blue-800">1</div>
                        <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">{text.activeProduct}</div>
                    </div>
                </div>
            </div>

            {/* Product Card (Main Asset) */}
            <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-4 px-1 uppercase tracking-wider">{text.portfolio}</h3>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                        {/* Image/Preview */}
                        <div className="md:col-span-3 bg-slate-50 flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-slate-200">
                            <div className="text-center">
                                <div className="h-20 w-20 bg-white rounded-full mx-auto shadow-sm flex items-center justify-center mb-3 border border-slate-100">
                                    <GlobeAltIcon className="h-10 w-10 text-slate-700" />
                                </div>
                                <h4 className="font-semibold text-slate-800">Robot Industriel R-2000</h4>
                                <p className="text-xs text-slate-500 font-mono">SN-A4B8-9Z7C</p>
                            </div>
                        </div>

                        {/* Status Grid */}
                        <div className="md:col-span-9 p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                            {text.production}
                                        </span>
                                        <span className="text-xs text-slate-400">{text.lastUpdate}: 26 Oct 2023</span>
                                    </div>
                                    <p className="mt-2 text-sm text-slate-600">
                                        {text.assetDesc}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setActiveView('passport')}
                                    className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
                                >
                                    {text.viewPassport}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                                    <p className="text-xs text-slate-500 mb-1 font-medium">{text.circularity}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-slate-700 text-sm">85% {text.recyclable}</span>
                                        <div className="h-1.5 w-16 bg-slate-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-slate-800 w-[85%]"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                                    <p className="text-xs text-slate-500 mb-1 font-medium">{text.carbon}</p>
                                    <div className="flex items-center">
                                        <span className="font-semibold text-slate-700 text-sm">450 kg CO2e</span>
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                                    <p className="text-xs text-slate-500 mb-1 font-medium">{text.compliance}</p>
                                    <div className="flex items-center">
                                        {complianceScore === 100 ? (
                                            <span className="flex items-center text-green-700 text-sm font-medium"><CheckCircleIcon className="h-4 w-4 mr-1" /> {text.validated}</span>
                                        ) : (
                                            <span className="flex items-center text-yellow-700 text-sm font-medium"><ExclamationTriangleIcon className="h-4 w-4 mr-1" /> {text.actionRequired}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gamification Badges */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <GamificationBadges
                    lang={lang}
                    complianceScore={complianceScore}
                    completedModules={modules.filter(m => m.complianceItems.every(i => i.status === ComplianceStatus.Compliant)).length}
                    totalModules={modules.length}
                />
            </div>

            {/* Quick Actions / Modules */}
            <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-4 px-1 uppercase tracking-wider">{text.pillars}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {modules.filter(m => m.id !== '4').map(module => (
                        <button
                            key={module.id}
                            onClick={() => setActiveView(`module-${module.id}`)}
                            className="text-left p-5 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group"
                        >
                            <module.icon className="h-6 w-6 text-slate-400 group-hover:text-blue-800 mb-3" />
                            <h4 className="font-semibold text-slate-800 text-sm">{module.shortTitle}</h4>
                            <div className="mt-2 flex items-center">
                                {module.complianceItems.some(i => i.status === ComplianceStatus.NonCompliant) ? (
                                    <span className="text-xs text-red-600 flex items-center">
                                        <XCircleIcon className="h-3 w-3 mr-1" /> {text.critical}
                                    </span>
                                ) : module.complianceItems.some(i => i.status === ComplianceStatus.AtRisk) ? (
                                    <span className="text-xs text-yellow-600 flex items-center">
                                        <ExclamationTriangleIcon className="h-3 w-3 mr-1" /> {text.attention}
                                    </span>
                                ) : (
                                    <span className="text-xs text-green-600 flex items-center">
                                        <CheckCircleIcon className="h-3 w-3 mr-1" /> {text.compliant}
                                    </span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
