/**
 * Periodization Tab - Competition Planning & Training Phases
 * 
 * Features:
 * - Macro timeline overview
 * - Fitness-fatigue model
 * - Taper protocol
 * - Phase details
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Target, TrendingUp, Info, ChevronRight } from 'lucide-react';
import { GlassCard, cn } from '../../components/ui';
import { MacroTimelineCard } from './components/MacroTimelineCard';
import { TaperProtocolCard } from './components/TaperProtocolCard';
import { FitnessFatigueCard } from './components/FitnessFatigueCard';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface PeriodizationTabProps {
    className?: string;
}

export const PeriodizationTab: React.FC<PeriodizationTabProps> = ({ className }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn('pb-24 space-y-6', className)}
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                        <Calendar className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Periodization</h2>
                        <p className="text-sm text-muted-foreground">Training phases & competition planning</p>
                    </div>
                </div>

                <button className="px-4 py-2 text-sm font-medium bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-lg border border-indigo-500/30 transition-colors flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Set Target Event
                </button>
            </div>

            {/* Macro Timeline - Full Width */}
            <MacroTimelineCard />

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Fitness-Fatigue */}
                <FitnessFatigueCard />

                {/* Taper Protocol */}
                <TaperProtocolCard />
            </div>

            {/* Research & Education */}
            <GlassCard className="p-6 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
                <div className="flex items-start gap-4">
                    <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="font-semibold text-white mb-2">About Periodization</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            This system implements research-backed periodization principles from leading sports scientists
                            to optimize your training across the competitive season.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div className="p-3 bg-white/5 rounded-lg">
                                <div className="text-xs font-medium text-blue-400 mb-1">Tudor Bompa</div>
                                <div className="text-[10px] text-muted-foreground">
                                    Classical periodization with general → specific progression
                                </div>
                            </div>
                            <div className="p-3 bg-white/5 rounded-lg">
                                <div className="text-xs font-medium text-purple-400 mb-1">Vladimir Issurin</div>
                                <div className="text-[10px] text-muted-foreground">
                                    Block periodization for advanced athletes
                                </div>
                            </div>
                            <div className="p-3 bg-white/5 rounded-lg">
                                <div className="text-xs font-medium text-green-400 mb-1">Mujika & Padilla</div>
                                <div className="text-[10px] text-muted-foreground">
                                    Taper research for peak performance
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'View Full Calendar', icon: Calendar },
                    { label: 'Weekly Plan', icon: TrendingUp },
                    { label: 'Key Workouts', icon: Target },
                    { label: 'Phase History', icon: Info }
                ].map((action, i) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={i}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors flex items-center gap-2"
                        >
                            <Icon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs text-white">{action.label}</span>
                            <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto" />
                        </button>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default PeriodizationTab;
