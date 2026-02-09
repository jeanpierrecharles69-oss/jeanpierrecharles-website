import React, { useState, useEffect } from 'react';
import { Language } from '../translations';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface Badge {
    id: string;
    nameKey: { fr: string; en: string };
    descKey: { fr: string; en: string };
    icon: string;
    unlocked: boolean;
    progress?: number;
    target?: number;
    color: string;
}

interface GamificationBadgesProps {
    lang: Language;
    complianceScore: number;
    completedModules: number;
    totalModules: number;
}

const GamificationBadges: React.FC<GamificationBadgesProps> = ({
    lang,
    complianceScore,
    completedModules,
    totalModules
}) => {
    const [showConfetti, setShowConfetti] = useState(false);
    const [newlyUnlocked, setNewlyUnlocked] = useState<string | null>(null);

    // Badge definitions
    const badges: Badge[] = [
        {
            id: 'first_steps',
            nameKey: { fr: 'Premiers Pas', en: 'First Steps' },
            descKey: { fr: 'Complétez votre premier module', en: 'Complete your first module' },
            icon: '🎯',
            unlocked: completedModules >= 1,
            progress: completedModules,
            target: 1,
            color: 'from-blue-400 to-blue-600'
        },
        {
            id: 'compliance_novice',
            nameKey: { fr: 'Novice Conformité', en: 'Compliance Novice' },
            descKey: { fr: 'Atteignez 50% de conformité', en: 'Reach 50% compliance' },
            icon: '🌱',
            unlocked: complianceScore >= 50,
            progress: complianceScore,
            target: 50,
            color: 'from-green-400 to-green-600'
        },
        {
            id: 'compliance_expert',
            nameKey: { fr: 'Expert Conformité', en: 'Compliance Expert' },
            descKey: { fr: 'Atteignez 75% de conformité', en: 'Reach 75% compliance' },
            icon: '🏆',
            unlocked: complianceScore >= 75,
            progress: complianceScore,
            target: 75,
            color: 'from-yellow-400 to-yellow-600'
        },
        {
            id: 'compliance_master',
            nameKey: { fr: 'Maître Conformité', en: 'Compliance Master' },
            descKey: { fr: 'Atteignez 90% de conformité', en: 'Reach 90% compliance' },
            icon: '👑',
            unlocked: complianceScore >= 90,
            progress: complianceScore,
            target: 90,
            color: 'from-purple-400 to-purple-600'
        },
        {
            id: 'module_collector',
            nameKey: { fr: 'Collectionneur', en: 'Module Collector' },
            descKey: { fr: 'Complétez 5 modules', en: 'Complete 5 modules' },
            icon: '📚',
            unlocked: completedModules >= 5,
            progress: completedModules,
            target: 5,
            color: 'from-indigo-400 to-indigo-600'
        },
        {
            id: 'perfect_score',
            nameKey: { fr: 'Perfection', en: 'Perfect Score' },
            descKey: { fr: 'Atteignez 100% de conformité', en: 'Reach 100% compliance' },
            icon: '⭐',
            unlocked: complianceScore >= 100,
            progress: complianceScore,
            target: 100,
            color: 'from-pink-400 to-pink-600'
        },
        {
            id: 'all_modules',
            nameKey: { fr: 'Complétiste', en: 'Completionist' },
            descKey: { fr: 'Complétez tous les modules', en: 'Complete all modules' },
            icon: '💎',
            unlocked: completedModules >= totalModules && totalModules > 0,
            progress: completedModules,
            target: totalModules,
            color: 'from-teal-400 to-teal-600'
        },
        {
            id: 'aegis_pro',
            nameKey: { fr: 'Aegis Pro', en: 'Aegis Pro' },
            descKey: { fr: 'Débloquez toutes les fonctionnalités premium', en: 'Unlock all premium features' },
            icon: '🚀',
            unlocked: false, // Unlocked via subscription
            color: 'from-orange-400 to-orange-600'
        }
    ];

    // Check for newly unlocked badges
    useEffect(() => {
        const unlockedBadges = badges.filter(b => b.unlocked);
        const lastUnlocked = unlockedBadges[unlockedBadges.length - 1];

        if (lastUnlocked && lastUnlocked.id !== newlyUnlocked) {
            setNewlyUnlocked(lastUnlocked.id);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
        }
    }, [complianceScore, completedModules]);

    const unlockedCount = badges.filter(b => b.unlocked).length;
    const totalBadges = badges.length;

    return (
        <div className="space-y-6">

            {/* Header with Progress */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <SparklesIcon className="h-6 w-6 text-yellow-500" />
                        {lang === 'fr' ? 'Vos Achievements' : 'Your Achievements'}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                        {unlockedCount} / {totalBadges} {lang === 'fr' ? 'débloqués' : 'unlocked'}
                    </p>
                </div>

                {/* Overall Progress Bar */}
                <div className="hidden sm:block w-32">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                            style={{ width: `${(unlockedCount / totalBadges) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badges.map((badge) => {
                    const isNewlyUnlocked = badge.id === newlyUnlocked;
                    const progressPercent = badge.target ? Math.min((badge.progress || 0) / badge.target * 100, 100) : 0;

                    return (
                        <div
                            key={badge.id}
                            className={`
                relative p-4 rounded-2xl border-2 transition-all duration-300
                ${badge.unlocked
                                    ? 'bg-white border-slate-200 shadow-md hover:shadow-lg hover:-translate-y-1'
                                    : 'bg-slate-50 border-slate-100 opacity-60'
                                }
                ${isNewlyUnlocked ? 'animate-bounce-slow ring-4 ring-yellow-400' : ''}
              `}
                        >
                            {/* Badge Icon */}
                            <div className={`
                relative h-16 w-16 mx-auto mb-3 rounded-2xl flex items-center justify-center text-4xl
                bg-gradient-to-br ${badge.color}
                ${badge.unlocked ? 'shadow-lg' : 'grayscale opacity-50'}
              `}>
                                <span className="filter drop-shadow-md">{badge.icon}</span>

                                {/* Checkmark for unlocked */}
                                {badge.unlocked && (
                                    <div className="absolute -top-1 -right-1 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                                        <CheckCircleIcon className="h-4 w-4 text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Badge Name */}
                            <h4 className={`
                text-sm font-bold text-center mb-1
                ${badge.unlocked ? 'text-slate-900' : 'text-slate-500'}
              `}>
                                {badge.nameKey[lang]}
                            </h4>

                            {/* Badge Description */}
                            <p className="text-xs text-slate-600 text-center mb-2 leading-tight">
                                {badge.descKey[lang]}
                            </p>

                            {/* Progress Bar (if not unlocked and has target) */}
                            {!badge.unlocked && badge.target && (
                                <div className="mt-2">
                                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full bg-gradient-to-r ${badge.color} rounded-full transition-all duration-500`}
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 text-center mt-1">
                                        {badge.progress || 0} / {badge.target}
                                    </p>
                                </div>
                            )}

                            {/* "New!" Badge */}
                            {isNewlyUnlocked && (
                                <div className="absolute -top-2 -right-2 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full shadow-lg animate-pulse">
                                    {lang === 'fr' ? 'Nouveau !' : 'New!'}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Confetti Effect (simple CSS animation) */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                    {[...Array(30)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: '-10%',
                                animationDelay: `${Math.random() * 0.5}s`,
                                animationDuration: `${2 + Math.random() * 2}s`
                            }}
                        >
                            <div
                                className="h-3 w-3 rounded-full"
                                style={{
                                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)]
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Next Badge Hint */}
            {unlockedCount < totalBadges && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <p className="text-sm text-blue-900 font-medium">
                        💡 {lang === 'fr'
                            ? `Prochain objectif : ${badges.find(b => !b.unlocked)?.nameKey[lang]}`
                            : `Next goal: ${badges.find(b => !b.unlocked)?.nameKey[lang]}`
                        }
                    </p>
                </div>
            )}
        </div>
    );
};

export default GamificationBadges;
