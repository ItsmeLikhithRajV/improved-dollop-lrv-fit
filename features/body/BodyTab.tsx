/**
 * BodyTab - Unified biological state view
 * 
 * Contains sub-tabs:
 * - Recovery (Adaptive Recovery, System Status)
 * - Biomarkers (Blood work, metabolic)
 * - Longevity (Epigenetic age)
 * 
 * Note: Season/Periodization moved to Performance Labs
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Dna, TestTube } from 'lucide-react';
import { cn } from '../../components/ui';

// Import existing tabs as sub-components
import { RecoveryTab } from '../recovery/RecoveryTab';
import { BiomarkersTab } from '../biomarkers/BiomarkersTab';
import { LongevityTab } from '../longevity/LongevityTab';

type BodySubTab = 'recovery' | 'biomarkers' | 'longevity';

const subTabs = [
    { id: 'recovery' as const, label: 'Recovery', icon: Heart, color: 'text-red-400' },
    { id: 'biomarkers' as const, label: 'Biomarkers', icon: TestTube, color: 'text-emerald-400' },
    { id: 'longevity' as const, label: 'Longevity', icon: Dna, color: 'text-purple-400' },
];

export const BodyTab: React.FC = () => {
    const [activeSubTab, setActiveSubTab] = useState<BodySubTab>('recovery');

    return (
        <div className="pb-24 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                    <Dna className="w-6 h-6 text-red-400" />
                </div>
                <div>
                    <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">
                        Body
                    </h2>
                    <p className="text-sm text-white/40">Your biological state</p>
                </div>
            </div>

            {/* Sub-Tab Navigation */}
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 mb-6 overflow-x-auto no-scrollbar">
                {subTabs.map((tab) => {
                    const isActive = activeSubTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                                isActive
                                    ? "bg-white/10 text-white"
                                    : "text-white/40 hover:text-white/60"
                            )}
                        >
                            <tab.icon className={cn("w-4 h-4", isActive && tab.color)} />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Sub-Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeSubTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeSubTab === 'recovery' && <RecoveryTab />}
                    {activeSubTab === 'biomarkers' && <BiomarkersTab />}
                    {activeSubTab === 'longevity' && <LongevityTab />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default BodyTab;
