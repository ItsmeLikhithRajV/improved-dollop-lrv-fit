/**
 * Fitness Fatigue Card - Banister Model Visualization
 * 
 * Features:
 * - Form (TSB) gauge
 * - Fitness vs Fatigue chart
 * - Performance prediction
 * - Training recommendations
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, TrendingDown, Activity, Battery, Zap,
    AlertTriangle, Target, ChevronRight
} from 'lucide-react';
import { GlassCard, cn } from '../../../components/ui';
import { analyzePeriodization } from '../../../services/PeriodizationEngine';
import { FITNESS_FATIGUE_CONSTANTS } from '../../../types/periodization';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface FitnessFatigueCardProps {
    className?: string;
    compact?: boolean;
}

export const FitnessFatigueCard: React.FC<FitnessFatigueCardProps> = ({
    className,
    compact = false
}) => {
    const analysis = useMemo(() => analyzePeriodization(), []);
    const { fitness_fatigue: ff, recommendations, days_to_target: daysToEvent } = analysis;

    const { optimal_form_range: optimalForm } = FITNESS_FATIGUE_CONSTANTS;
    const formIsOptimal = ff.form >= optimalForm.min && ff.form <= optimalForm.max;
    const formIsTooHigh = ff.form > optimalForm.max;
    const formIsTooLow = ff.form < optimalForm.min;

    // Determine status
    const getFormStatus = () => {
        if (formIsOptimal) return { label: 'Peak Form', color: 'text-green-400', bg: 'bg-green-500/20' };
        if (ff.form > 0) return { label: 'Building', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
        if (ff.form > -10) return { label: 'Fatigued', color: 'text-orange-400', bg: 'bg-orange-500/20' };
        return { label: 'Overreached', color: 'text-red-400', bg: 'bg-red-500/20' };
    };

    const formStatus = getFormStatus();

    if (compact) {
        return (
            <GlassCard className={cn('p-4', className)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn('p-2 rounded-lg', formStatus.bg)}>
                            <Battery className={cn('w-4 h-4', formStatus.color)} />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Form (TSB)</div>
                            <div className={cn('text-lg font-bold', formStatus.color)}>{ff.form}</div>
                        </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase">
                        {formStatus.label}
                    </div>
                </div>
            </GlassCard>
        );
    }

    return (
        <GlassCard className={cn('p-6', className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                        <Activity className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Fitness-Fatigue Model</h3>
                        <p className="text-xs text-muted-foreground">Banister impulse-response</p>
                    </div>
                </div>

                <div className={cn('px-3 py-1 rounded-lg text-xs font-medium', formStatus.bg, formStatus.color)}>
                    {formStatus.label}
                </div>
            </div>

            {/* Main Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-white/5 rounded-xl text-center">
                    <TrendingUp className="w-5 h-5 mx-auto mb-2 text-blue-400" />
                    <div className="text-2xl font-bold text-blue-400">{ff.fitness}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Fitness (CTL)
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-1">
                        τ = {ff.fitness_tau_days} days
                    </div>
                </div>

                <div className="p-4 bg-white/5 rounded-xl text-center">
                    <TrendingDown className="w-5 h-5 mx-auto mb-2 text-red-400" />
                    <div className="text-2xl font-bold text-red-400">{ff.fatigue}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Fatigue (ATL)
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-1">
                        τ = {ff.fatigue_tau_days} days
                    </div>
                </div>

                <div className="p-4 bg-white/5 rounded-xl text-center">
                    <Battery className={cn('w-5 h-5 mx-auto mb-2', formStatus.color)} />
                    <div className={cn('text-2xl font-bold', formStatus.color)}>{ff.form}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Form (TSB)
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-1">
                        Fitness - Fatigue
                    </div>
                </div>
            </div>

            {/* Form Gauge */}
            <div className="mb-6 p-4 bg-black/30 rounded-xl">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                    Form Gauge
                </div>

                <div className="relative h-6 bg-white/10 rounded-full overflow-hidden">
                    {/* Zones */}
                    <div className="absolute inset-0 flex">
                        <div className="bg-red-500/30 h-full" style={{ width: '20%' }} />
                        <div className="bg-orange-500/20 h-full" style={{ width: '20%' }} />
                        <div className="bg-green-500/30 h-full" style={{ width: '30%' }} />
                        <div className="bg-yellow-500/20 h-full" style={{ width: '30%' }} />
                    </div>

                    {/* Current position */}
                    <motion.div
                        className={cn(
                            'absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-lg',
                            formStatus.bg.replace('/20', '')
                        )}
                        style={{ left: `${Math.max(5, Math.min(95, (ff.form + 30) / 60 * 100))}%` }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                    />
                </div>

                {/* Labels */}
                <div className="flex justify-between mt-2 text-[9px]">
                    <span className="text-red-400">Overreached</span>
                    <span className="text-orange-400">Fatigued</span>
                    <span className="text-green-400">Optimal</span>
                    <span className="text-yellow-400">Fresh/Detrained</span>
                </div>
            </div>

            {/* Performance Prediction */}
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/30">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                            Predicted Performance
                        </div>
                        <div className="text-3xl font-bold text-white">{ff.predicted_performance}%</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            of theoretical maximum
                        </div>
                    </div>

                    <div className="text-right">
                        <Target className="w-8 h-8 text-purple-400 mb-2" />
                        <div className="text-xs text-muted-foreground">
                            {daysToEvent} days to event
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <div className="space-y-2">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                        Recommendations
                    </div>
                    {recommendations.slice(0, 2).map((rec, i) => (
                        <div
                            key={i}
                            className={cn(
                                'p-3 rounded-lg flex items-start gap-3',
                                rec.priority === 'high' ? 'bg-red-500/10 border-l-2 border-red-500' :
                                    rec.priority === 'medium' ? 'bg-yellow-500/10 border-l-2 border-yellow-500' :
                                        'bg-blue-500/10 border-l-2 border-blue-500'
                            )}
                        >
                            <AlertTriangle className={cn(
                                'w-4 h-4 flex-shrink-0 mt-0.5',
                                rec.priority === 'high' ? 'text-red-400' :
                                    rec.priority === 'medium' ? 'text-yellow-400' :
                                        'text-blue-400'
                            )} />
                            <div>
                                <div className="text-sm font-medium text-white">{rec.message}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">{rec.action}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Model Description */}
            <div className="mt-4 p-3 bg-white/5 rounded-lg">
                <div className="text-[10px] text-muted-foreground">
                    <span className="text-white font-medium">Banister Model: </span>
                    Performance = Fitness - Fatigue. Fitness builds slowly (τ≈42d) while fatigue
                    dissipates quickly (τ≈7d). Optimal form for competition: +{optimalForm.min} to +{optimalForm.max}.
                </div>
            </div>
        </GlassCard>
    );
};

export default FitnessFatigueCard;
