/**
 * Taper Protocol Card - Pre-Competition Optimization
 * 
 * Features:
 * - Taper phase visualization
 * - Volume/intensity trends
 * - Research-backed recommendations
 * - Form prediction chart
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingDown, Zap, Timer, AlertTriangle, CheckCircle,
    Activity, Target, Brain, Flame, ChevronRight
} from 'lucide-react';
import { GlassCard, cn } from '../../../components/ui';
import { analyzePeriodization } from '../../../services/PeriodizationEngine';
import { FITNESS_FATIGUE_CONSTANTS } from '../../../types/periodization';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface TaperProtocolCardProps {
    className?: string;
}

export const TaperProtocolCard: React.FC<TaperProtocolCardProps> = ({
    className
}) => {
    const analysis = useMemo(() => analyzePeriodization(), []);

    const {
        days_to_target: daysToEvent,
        fitness_fatigue: ff,
        taper_protocol: taper,
        current_macrocycle: macro
    } = analysis;

    // Not in taper phase
    if (!taper || daysToEvent > 21) {
        return (
            <GlassCard className={cn('p-6', className)}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gray-500/20">
                        <TrendingDown className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Taper Protocol</h3>
                        <p className="text-xs text-muted-foreground">Not yet active</p>
                    </div>
                </div>

                <div className="text-center py-8 text-muted-foreground">
                    <Timer className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Taper begins {daysToEvent - 14} days from now</p>
                    <p className="text-xs mt-1">Focus on building fitness until then</p>
                </div>
            </GlassCard>
        );
    }

    // Calculate taper progress
    const taperProgress = Math.min(100, ((taper.duration_days - daysToEvent) / taper.duration_days) * 100);

    // Form prediction
    const optimalForm = FITNESS_FATIGUE_CONSTANTS.optimal_form_range;
    const formIsOptimal = ff.form >= optimalForm.min && ff.form <= optimalForm.max;

    return (
        <GlassCard className={cn('p-6', className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-green-500/20">
                        <TrendingDown className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Taper Protocol</h3>
                        <p className="text-xs text-muted-foreground capitalize">{taper.type} taper • {taper.duration_days} days</p>
                    </div>
                </div>

                <div className={cn(
                    'px-3 py-1 rounded-lg text-xs font-medium',
                    formIsOptimal
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                )}>
                    {formIsOptimal ? 'Form Optimal' : 'Building Form'}
                </div>
            </div>

            {/* Taper Progress */}
            <div className="mb-6">
                <div className="flex justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Taper Progress</span>
                    <span className="text-white">{Math.round(taperProgress)}%</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${taperProgress}%` }}
                        transition={{ duration: 1 }}
                    />
                </div>
            </div>

            {/* Phase Cards */}
            <div className="space-y-3 mb-6">
                {taper.phases.map((phase, i) => {
                    const phaseDaysFromEnd = taper.phases.slice(i + 1).reduce((acc, p) => acc + p.days, 0);
                    const isActive = daysToEvent <= (phaseDaysFromEnd + phase.days) && daysToEvent > phaseDaysFromEnd;
                    const isComplete = daysToEvent <= phaseDaysFromEnd;

                    return (
                        <div
                            key={i}
                            className={cn(
                                'p-3 rounded-lg border flex items-center gap-3',
                                isActive ? 'bg-green-500/10 border-green-500/50' :
                                    isComplete ? 'bg-white/5 border-white/10 opacity-50' :
                                        'bg-white/5 border-white/10'
                            )}
                        >
                            <div className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center',
                                isComplete ? 'bg-green-500/20' :
                                    isActive ? 'bg-green-500/20' :
                                        'bg-white/5'
                            )}>
                                {isComplete ? (
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                ) : (
                                    <span className={cn(
                                        'text-sm font-bold',
                                        isActive ? 'text-green-400' : 'text-muted-foreground'
                                    )}>
                                        {i + 1}
                                    </span>
                                )}
                            </div>

                            <div className="flex-1">
                                <div className={cn(
                                    'text-sm font-medium',
                                    isActive ? 'text-green-400' : 'text-white'
                                )}>
                                    {phase.name}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    {phase.days} days • {phase.focus}
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-xs text-muted-foreground">Volume</div>
                                <div className="text-sm font-bold text-white">{phase.volume_percent}%</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Key Taper Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 bg-white/5 rounded-lg text-center">
                    <Activity className="w-4 h-4 mx-auto mb-1 text-red-400" />
                    <div className="text-lg font-bold text-white">-{taper.volume_reduction_percent}%</div>
                    <div className="text-[9px] text-muted-foreground uppercase">Volume</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg text-center">
                    <Zap className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
                    <div className="text-lg font-bold text-white">100%</div>
                    <div className="text-[9px] text-muted-foreground uppercase">Intensity</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg text-center">
                    <Flame className="w-4 h-4 mx-auto mb-1 text-orange-400" />
                    <div className="text-lg font-bold text-white">-{taper.frequency_reduction_percent}%</div>
                    <div className="text-[9px] text-muted-foreground uppercase">Frequency</div>
                </div>
            </div>

            {/* Form Chart (Simplified) */}
            <div className="p-4 bg-black/30 rounded-lg mb-6">
                <div className="flex items-center justify-between mb-3">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                        Form Projection
                    </div>
                    <div className="text-xs">
                        <span className="text-muted-foreground">Current: </span>
                        <span className={cn('font-bold', formIsOptimal ? 'text-green-400' : 'text-yellow-400')}>
                            {ff.form}
                        </span>
                        <span className="text-muted-foreground"> (optimal: {optimalForm.min}-{optimalForm.max})</span>
                    </div>
                </div>

                {/* Simple form visualization */}
                <div className="relative h-16">
                    {/* Optimal zone */}
                    <div
                        className="absolute bg-green-500/10 rounded"
                        style={{
                            left: `${(optimalForm.min + 30) / 60 * 100}%`,
                            right: `${100 - (optimalForm.max + 30) / 60 * 100}%`,
                            top: 0,
                            bottom: 0
                        }}
                    />

                    {/* Current form marker */}
                    <motion.div
                        className="absolute top-1/2 transform -translate-y-1/2 flex flex-col items-center"
                        style={{ left: `${Math.max(0, Math.min(100, (ff.form + 30) / 60 * 100))}%` }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                    >
                        <div className={cn(
                            'w-4 h-4 rounded-full border-2',
                            formIsOptimal ? 'bg-green-500 border-green-300' : 'bg-yellow-500 border-yellow-300'
                        )} />
                        <div className="text-[10px] text-white mt-1">{ff.form}</div>
                    </motion.div>

                    {/* Scale */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[9px] text-muted-foreground">
                        <span>-30</span>
                        <span>0</span>
                        <span>+30</span>
                    </div>
                </div>
            </div>

            {/* Research Note */}
            <div className="p-3 bg-purple-500/10 rounded-lg border-l-2 border-purple-500">
                <div className="flex items-start gap-2">
                    <Brain className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-white/70">
                        <span className="text-purple-400 font-medium">Mujika Research: </span>
                        Optimal taper reduces volume 40-60% while maintaining intensity.
                        This allows fitness to remain elevated while fatigue dissipates,
                        resulting in super-compensation (peak form).
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};

export default TaperProtocolCard;
