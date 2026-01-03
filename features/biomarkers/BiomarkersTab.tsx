/**
 * Biomarkers Tab - Blood Work Analysis Dashboard
 * 
 * Displays comprehensive biomarker analysis with:
 * - Panel breakdown
 * - Individual marker cards
 * - Trend visualization
 * - Blueprint targets
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TestTube, TrendingUp, Target, Calendar } from 'lucide-react';
import { GlassCard } from '../../components/ui';
import { BiomarkerDashboardCard } from '../biomarkers/BiomarkerDashboardCard';

export const BiomarkersTab: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="pb-24 space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30">
                        <TestTube className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Biomarker Lab</h2>
                        <p className="text-sm text-muted-foreground">Blood work analysis & optimization</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button className="px-4 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Schedule Test
                    </button>
                    <button className="px-4 py-2 text-sm font-medium bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg border border-cyan-500/30 transition-colors flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Import Results
                    </button>
                </div>
            </div>

            {/* Main Dashboard Card */}
            <BiomarkerDashboardCard />

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GlassCard className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        <span className="text-sm font-medium text-white">Improvements</span>
                    </div>
                    <div className="text-3xl font-bold text-green-400">5</div>
                    <div className="text-xs text-muted-foreground">markers improved since last test</div>
                </GlassCard>

                <GlassCard className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <Target className="w-5 h-5 text-purple-400" />
                        <span className="text-sm font-medium text-white">Blueprint Alignment</span>
                    </div>
                    <div className="text-3xl font-bold text-purple-400">72%</div>
                    <div className="text-xs text-muted-foreground">markers at Bryan Johnson targets</div>
                </GlassCard>

                <GlassCard className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        <span className="text-sm font-medium text-white">Testing Cadence</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-400">90</div>
                    <div className="text-xs text-muted-foreground">days between full panels</div>
                </GlassCard>
            </div>

            {/* Educational Note */}
            <GlassCard className="p-4 bg-white/5">
                <h3 className="text-sm font-semibold text-white mb-2">About Optimal Ranges</h3>
                <p className="text-xs text-muted-foreground">
                    Our optimal ranges are based on longevity research, not just "normal" reference ranges from labs.
                    Being in the "normal" range doesn't mean optimal. We aim for ranges associated with the lowest
                    all-cause mortality and best healthspan outcomes. Blueprint protocol targets are included
                    where Bryan Johnson has shared his specific goals.
                </p>
            </GlassCard>
        </motion.div>
    );
};

export default BiomarkersTab;
