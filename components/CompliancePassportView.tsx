
import React, { useState } from 'react';
import { RegulationModule, ComplianceStatus, AuditEvent } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { Language, t } from '../translations';

// Helper type to infer the structure of translation object
type TranslationText = typeof t['fr']['passport'];

const TransparencyToggle = ({ label, isPublic, text }: { label: string, isPublic: boolean, text: TranslationText }) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
        <span className="text-sm text-slate-600">{label}</span>
        <div className={`flex items-center px-2 py-1 rounded text-xs font-medium ${isPublic ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
            <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${isPublic ? 'bg-green-500' : 'bg-slate-400'}`}></span>
            {isPublic ? text.toggles.public : text.toggles.private}
        </div>
    </div>
);

const PassportSection: React.FC<{ module: RegulationModule }> = ({ module }) => {
    const isCompliant = module.complianceItems.every(i => i.status === ComplianceStatus.Compliant);
    const hasNonCompliant = module.complianceItems.some(i => i.status === ComplianceStatus.NonCompliant);
    const overallStatus = hasNonCompliant ? ComplianceStatus.NonCompliant : (isCompliant ? ComplianceStatus.Compliant : ComplianceStatus.AtRisk);

    return (
        <div className="bg-white border border-slate-200 rounded-lg p-5 hover:border-blue-300 transition-colors">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                    <div className="p-2 bg-slate-50 rounded-md mr-3">
                        <module.icon className="h-5 w-5 text-slate-600" />
                    </div>
                    <h4 className="font-semibold text-slate-800">{module.shortTitle}</h4>
                </div>
                {overallStatus === ComplianceStatus.Compliant ? (
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                ) : (
                    <XCircleIcon className="h-6 w-6 text-yellow-500" />
                )}
            </div>
            <ul className="space-y-2 text-sm">
                {module.complianceItems.map(item => (
                    <li key={item.id} className="flex justify-between items-start">
                        <span className="text-slate-600 flex-1">{item.name}</span>
                        <span className={`text-xs font-medium ml-2 px-2 py-0.5 rounded ${item.status === ComplianceStatus.Compliant ? 'bg-green-50 text-green-700' :
                            item.status === ComplianceStatus.AtRisk ? 'bg-yellow-50 text-yellow-700' :
                                'bg-red-50 text-red-700'
                            }`}>
                            {item.status === ComplianceStatus.Compliant ? 'OK' : 'Action'}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

interface CompliancePassportViewProps {
    lang: Language;
    modules: RegulationModule[];
}

const CompliancePassportView: React.FC<CompliancePassportViewProps> = ({ lang, modules }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'audit'>('overview');
    const text = t[lang].passport;

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Passeport Robot Industriel R-2000',
                    text: 'Consultez la conformité de cet actif sur Aegis Circular.',
                    url: window.location.href,
                });
            } catch (err) {
                console.error('Share failed:', err);
            }
        } else {
            await navigator.clipboard.writeText(window.location.href);
            alert('Lien copié dans le presse-papier !');
        }
    };

    const handleExport = async () => {
        const element = document.getElementById('passport-content');
        if (!element) {
            alert('Erreur : Impossible de générer le PDF');
            return;
        }

        // Dynamic import of html2pdf
        const html2pdf = (await import('html2pdf.js')).default;

        const opt = {
            margin: 10,
            filename: 'Passeport_Robot_R2000_Aegis.pdf',
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
        };

        html2pdf().set(opt).from(element).save();
    };

    const mockAuditTrail: AuditEvent[] = [
        { id: 'a1', timestamp: '26 Oct 2023 14:30', user: 'Jean Dupont', action: text.audit.validated, details: 'Module 1: EN ISO 12100.' },
        { id: 'a2', timestamp: '22 Oct 2023 09:00', user: 'System', action: text.audit.check, details: 'Blockchain verified.' },
        { id: 'a3', timestamp: '20 Oct 2023 11:45', user: 'Marie Martin', action: text.audit.alert, details: 'Module 1.' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Passport Header Card */}
            <div id="passport-content" className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 sm:p-8 text-white flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-6">
                        {/* QR Code Mock */}
                        <div className="bg-white p-2 rounded-lg shadow-lg">
                            <div className="h-24 w-24 bg-slate-900 flex items-center justify-center">
                                {/* Simplified visual QR pattern */}
                                <div className="grid grid-cols-4 gap-1 p-1 w-full h-full opacity-90">
                                    <div className="bg-white col-span-2 row-span-2"></div>
                                    <div className="bg-white"></div>
                                    <div className="bg-white"></div>
                                    <div className="bg-white"></div>
                                    <div className="bg-white row-span-2"></div>
                                    <div className="bg-white"></div>
                                    <div className="bg-white"></div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="inline-flex items-center px-2 py-1 rounded bg-blue-500/20 border border-blue-500/30 text-blue-100 text-xs font-semibold uppercase tracking-wider mb-2">
                                {text.verified}
                            </div>
                            <h1 className="text-2xl font-bold">Robot Industriel R-2000</h1>
                            <p className="text-slate-400 text-sm mt-1 font-mono">ID: eu-dpp-v5-892122</p>
                        </div>
                    </div>
                    <div className="mt-6 md:mt-0 flex space-x-3">
                        <button
                            onClick={handleShare}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg border border-white/10 transition-colors transform active:scale-95"
                        >
                            {text.share}
                        </button>
                        <button
                            onClick={handleExport}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg shadow-lg transition-colors flex items-center border border-slate-600 transform active:scale-95"
                        >
                            <ShieldCheckIcon className="h-4 w-4 mr-2" />
                            {text.export}
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-slate-200 px-6">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'overview' ? 'border-slate-800 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                        >
                            {text.tabs.overview}
                        </button>
                        <button
                            onClick={() => setActiveTab('audit')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'audit' ? 'border-slate-800 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                        >
                            {text.tabs.audit}
                        </button>
                    </nav>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 bg-slate-50/50">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Info Column */}
                            <div className="lg:col-span-2 space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800 mb-4">{text.status}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {modules.filter(m => m.id !== '4').map(module => (
                                            <PassportSection key={module.id} module={module} />
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-4">{text.composition}</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-slate-600">{text.recycledSteel}</span>
                                                <span className="font-medium text-slate-900">45%</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-slate-800 w-[45%]"></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-slate-600">{text.virginAlu}</span>
                                                <span className="font-medium text-slate-900">30%</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-400 w-[30%]"></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-slate-600">{text.plastics}</span>
                                                <span className="font-medium text-slate-900">15%</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-orange-400 w-[15%]"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Info Column */}
                            <div className="space-y-6">
                                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                                    <h4 className="font-semibold text-slate-800 mb-3 text-sm uppercase tracking-wide">{text.dataTransparency}</h4>
                                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">{text.smartQuestioning}</p>
                                    <TransparencyToggle label={text.toggles.carbon} isPublic={true} text={text} />
                                    <TransparencyToggle label={text.toggles.origin} isPublic={false} text={text} />
                                    <TransparencyToggle label={text.toggles.certs} isPublic={true} text={text} />
                                    <TransparencyToggle label={text.toggles.bom} isPublic={false} text={text} />
                                </div>

                                <div className="bg-slate-100 p-5 rounded-lg border border-slate-200">
                                    <h4 className="font-semibold text-slate-900 mb-2">{text.metrics}</h4>
                                    <div className="grid grid-cols-2 gap-4 mt-3">
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase">{text.totalWeight}</p>
                                            <p className="text-lg font-bold text-slate-800">1,240 kg</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase">{text.warranty}</p>
                                            <p className="text-lg font-bold text-slate-800">5 Ans</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase">{text.repairability}</p>
                                            <p className="text-lg font-bold text-slate-800">8.5/10</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'audit' && (
                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{text.audit.date}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{text.audit.actor}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{text.audit.action}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{text.audit.proof}</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {mockAuditTrail.map(event => (
                                        <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{event.timestamp}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{event.user}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                <p className="font-medium">{event.action}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{event.details}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-mono cursor-pointer hover:underline">
                                                0x{Math.random().toString(16).substr(2, 12)}...
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompliancePassportView;
