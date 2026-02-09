
import React, { useState } from 'react';
import { Language, t } from '../translations';
import { SparklesIcon } from './icons/SparklesIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XMarkIcon } from './icons/XMarkIcon';

interface PricingPageProps {
    lang: Language;
    onSelectPlan: (planId: string) => void;
    onClose?: () => void;
}

// Plans configuration
const PLANS = {
    starter: {
        id: 'starter',
        nameKey: { fr: 'Starter', en: 'Starter' },
        price: { monthly: 0, yearly: 0 },
        badge: null,
        features: {
            diagnostics: 1,
            products: 0,
            pdfExport: false,
            apiAccess: false,
            support: 'email',
            regulations: 2,
            historyDays: 7,
            aiTokens: 1000,
            multiUser: false,
            customLogo: false,
            alerts: false,
            trainings: 0
        }
    },
    solo: {
        id: 'solo',
        nameKey: { fr: 'Solo', en: 'Solo' },
        price: { monthly: 29, yearly: 249 },
        badge: { fr: 'Populaire', en: 'Popular' },
        features: {
            diagnostics: 5,
            products: 1,
            pdfExport: true,
            apiAccess: false,
            support: 'email',
            regulations: 4,
            historyDays: 90,
            aiTokens: 10000,
            multiUser: false,
            customLogo: false,
            alerts: true,
            trainings: 0
        }
    },
    business: {
        id: 'business',
        nameKey: { fr: 'Business', en: 'Business' },
        price: { monthly: 79, yearly: 699 },
        badge: { fr: 'PME', en: 'SME' },
        features: {
            diagnostics: -1, // unlimited
            products: 10,
            pdfExport: true,
            apiAccess: true,
            support: 'priority',
            regulations: 8,
            historyDays: -1, // unlimited
            aiTokens: 50000,
            multiUser: 3,
            customLogo: true,
            alerts: true,
            trainings: 2
        }
    },
    enterprise: {
        id: 'enterprise',
        nameKey: { fr: 'Enterprise', en: 'Enterprise' },
        price: { monthly: 299, yearly: 2699 },
        badge: { fr: 'ETI/Groupes', en: 'Mid-caps' },
        features: {
            diagnostics: -1,
            products: -1,
            pdfExport: true,
            apiAccess: true,
            support: 'dedicated',
            regulations: 8,
            historyDays: -1,
            aiTokens: -1,
            multiUser: -1,
            customLogo: true,
            alerts: true,
            trainings: -1
        }
    }
};

const FEATURE_LABELS = {
    fr: {
        diagnostics: 'Diagnostics/mois',
        products: 'Passeports Produits (DPP)',
        pdfExport: 'Export PDF professionnel',
        apiAccess: 'Accès API',
        support: 'Support',
        regulations: 'Règlements couverts',
        historyDays: 'Historique diagnostics',
        aiTokens: 'Tokens IA/mois',
        multiUser: 'Multi-utilisateurs',
        customLogo: 'Logo personnalisé',
        alerts: 'Alertes échéances',
        trainings: 'Formations incluses/an'
    },
    en: {
        diagnostics: 'Diagnostics/month',
        products: 'Product Passports (DPP)',
        pdfExport: 'Professional PDF export',
        apiAccess: 'API access',
        support: 'Support',
        regulations: 'Regulations covered',
        historyDays: 'Diagnostic history',
        aiTokens: 'AI tokens/month',
        multiUser: 'Multi-users',
        customLogo: 'Custom logo',
        alerts: 'Deadline alerts',
        trainings: 'Trainings included/year'
    }
};

const SUPPORT_LABELS = {
    fr: { email: 'Email', priority: 'Prioritaire', dedicated: 'Dédié' },
    en: { email: 'Email', priority: 'Priority', dedicated: 'Dedicated' }
};

const PricingPage: React.FC<PricingPageProps> = ({ lang, onSelectPlan, onClose }) => {
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');

    const formatFeatureValue = (key: string, value: any): string | React.ReactNode => {
        if (value === -1) return '∞';
        if (value === true) return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
        if (value === false) return <XMarkIcon className="h-5 w-5 text-slate-300" />;
        if (key === 'support') return SUPPORT_LABELS[lang][value as keyof typeof SUPPORT_LABELS['fr']];
        if (key === 'historyDays' && value > 0) return `${value} ${lang === 'fr' ? 'jours' : 'days'}`;
        if (key === 'aiTokens') return value.toLocaleString();
        return value;
    };

    const calculateSavings = (plan: typeof PLANS.solo) => {
        const monthlyCost = plan.price.monthly * 12;
        const yearlyCost = plan.price.yearly;
        if (monthlyCost === 0) return 0;
        return Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-4 border border-blue-100">
                        <SparklesIcon className="h-4 w-4" />
                        {lang === 'fr' ? 'Offre lancement : -30% avec le code LAUNCH30' : 'Launch offer: -30% with code LAUNCH30'}
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">
                        {lang === 'fr' ? 'Choisissez votre plan Aegis Pro' : 'Choose your Aegis Pro plan'}
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        {lang === 'fr'
                            ? 'Conformité industrielle simplifiée. Commencez gratuitement, évoluez selon vos besoins.'
                            : 'Simplified industrial compliance. Start free, scale as you grow.'}
                    </p>
                </div>

                {/* Billing Toggle */}
                <div className="flex justify-center mb-10">
                    <div className="bg-slate-100 p-1 rounded-xl inline-flex border border-slate-200">
                        <button
                            onClick={() => setBillingPeriod('monthly')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${billingPeriod === 'monthly'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            {lang === 'fr' ? 'Mensuel' : 'Monthly'}
                        </button>
                        <button
                            onClick={() => setBillingPeriod('yearly')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${billingPeriod === 'yearly'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            {lang === 'fr' ? 'Annuel' : 'Yearly'}
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                -30%
                            </span>
                        </button>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {Object.values(PLANS).map((plan) => {
                        const isPopular = plan.id === 'solo';
                        const isBusiness = plan.id === 'business';
                        const price = billingPeriod === 'monthly' ? plan.price.monthly : Math.round(plan.price.yearly / 12);
                        const savings = calculateSavings(plan);

                        return (
                            <div
                                key={plan.id}
                                className={`relative bg-white rounded-2xl border-2 transition-all hover:shadow-xl ${isBusiness
                                        ? 'border-blue-500 shadow-lg scale-105 z-10'
                                        : 'border-slate-200 hover:border-blue-300'
                                    }`}
                            >
                                {/* Badge */}
                                {plan.badge && (
                                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold ${isBusiness
                                            ? 'bg-blue-500 text-white'
                                            : isPopular
                                                ? 'bg-amber-500 text-white'
                                                : 'bg-slate-700 text-white'
                                        }`}>
                                        {plan.badge[lang]}
                                    </div>
                                )}

                                <div className="p-6">
                                    {/* Plan Name */}
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                                        {plan.nameKey[lang]}
                                    </h3>

                                    {/* Price */}
                                    <div className="mb-6">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-bold text-slate-900">
                                                {price === 0 ? (lang === 'fr' ? 'Gratuit' : 'Free') : `${price}€`}
                                            </span>
                                            {price > 0 && (
                                                <span className="text-slate-500 text-sm">
                                                    /{lang === 'fr' ? 'mois' : 'mo'}
                                                </span>
                                            )}
                                        </div>
                                        {billingPeriod === 'yearly' && plan.price.yearly > 0 && (
                                            <p className="text-xs text-slate-500 mt-1">
                                                {plan.price.yearly}€/{lang === 'fr' ? 'an' : 'year'}
                                                {savings > 0 && (
                                                    <span className="text-green-600 font-medium ml-1">
                                                        ({lang === 'fr' ? 'économisez' : 'save'} {savings}%)
                                                    </span>
                                                )}
                                            </p>
                                        )}
                                    </div>

                                    {/* CTA Button */}
                                    <button
                                        onClick={() => onSelectPlan(plan.id)}
                                        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${isBusiness
                                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                                                : plan.id === 'starter'
                                                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                    : 'bg-slate-900 text-white hover:bg-slate-800'
                                            }`}
                                    >
                                        {plan.id === 'starter'
                                            ? (lang === 'fr' ? 'Commencer gratuitement' : 'Start free')
                                            : plan.id === 'enterprise'
                                                ? (lang === 'fr' ? 'Contacter' : 'Contact us')
                                                : (lang === 'fr' ? 'Choisir ce plan' : 'Choose plan')
                                        }
                                    </button>

                                    {/* Features */}
                                    <div className="mt-6 pt-6 border-t border-slate-100">
                                        <ul className="space-y-3">
                                            {Object.entries(plan.features).slice(0, 6).map(([key, value]) => (
                                                <li key={key} className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-600">
                                                        {FEATURE_LABELS[lang][key as keyof typeof FEATURE_LABELS['fr']]}
                                                    </span>
                                                    <span className="font-medium text-slate-900">
                                                        {formatFeatureValue(key, value)}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Feature Comparison Table */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-200">
                        <h2 className="text-2xl font-bold text-slate-900">
                            {lang === 'fr' ? 'Comparaison détaillée' : 'Detailed comparison'}
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="text-left py-4 px-6 font-semibold text-slate-700">
                                        {lang === 'fr' ? 'Fonctionnalité' : 'Feature'}
                                    </th>
                                    {Object.values(PLANS).map(plan => (
                                        <th key={plan.id} className="text-center py-4 px-6 font-semibold text-slate-700">
                                            {plan.nameKey[lang]}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(FEATURE_LABELS[lang]).map((featureKey, idx) => (
                                    <tr key={featureKey} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                        <td className="py-4 px-6 text-sm text-slate-600">
                                            {FEATURE_LABELS[lang][featureKey as keyof typeof FEATURE_LABELS['fr']]}
                                        </td>
                                        {Object.values(PLANS).map(plan => (
                                            <td key={`${plan.id}-${featureKey}`} className="text-center py-4 px-6">
                                                <span className="inline-flex items-center justify-center">
                                                    {formatFeatureValue(featureKey, plan.features[featureKey as keyof typeof plan.features])}
                                                </span>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FAQ or Trust Signals */}
                <div className="mt-16 text-center">
                    <div className="inline-flex flex-wrap justify-center gap-8 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            {lang === 'fr' ? 'Annulation à tout moment' : 'Cancel anytime'}
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            {lang === 'fr' ? 'Paiement sécurisé Stripe' : 'Secure Stripe payment'}
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            {lang === 'fr' ? 'Satisfait ou remboursé 14 jours' : '14-day money-back guarantee'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
