/**
 * Macro Timeline Card - Season Overview Visualization
 * 
 * Features:
 * - Full macrocycle timeline
 * - Phase progression bars
 * - Target event countdown
 * - Current position indicator
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Target, Calendar, TrendingUp, Flag, Clock, ChevronRight,
    Zap, Activity, Heart, Timer
} from 'lucide-react';
import { GlassCard, cn } from '../../../components/ui';
import { analyzePeriodization } from '../../../services/PeriodizationEngine';
import { MesocycleType } from '../../../types/periodization';

// ============================================================================
// PHASE COLORS
// ============================================================================

const phaseColors: Record<MesocycleType, { bg: string; border: string; text: string }> = {
    general_preparation: { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-400' },
    specific_preparation: { bg: 'bg-purple-500/20', border: 'border-purple-500', text: 'text-purple-400' },
    pre_competition: { bg: 'bg-yellow-500/20', border: 'border-yellow-500', text: 'text-yellow-400' },
    competition: { bg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-400' },
    taper: { bg: 'bg-green-500/20', border: 'border-green-500', text: 'text-green-400' },
    transition: { bg: 'bg-gray-500/20', border: 'border-gray-500', text: 'text-gray-400' },
    accumulation: { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-400' },
    transmutation: { bg: 'bg-orange-500/20', border: 'border-orange-500', text: 'text-orange-400' },
    realization: { bg: 'bg-pink-500/20', border: 'border-pink-500', text: 'text-pink-400' }
};

const phaseLabels: Record<MesocycleType, string> = {
    general_preparation: 'Base',
    specific_preparation: 'Build',
    pre_competition: 'Peak',
    competition: 'Race',
    taper: 'Taper',
    transition: 'Recovery',
    accumulation: 'Accumulate',
    transmutation: 'Transmute',
    realization: 'Realize'
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface MacroTimelineCardProps {
    className?: string;
    compact?: boolean;
}

export const MacroTimelineCard: React.FC<MacroTimelineCardProps> = ({
    className,
    compact = false
}) => {
    const analysis = useMemo(() => analyzePeriodization(), []);

    const {
        current_macrocycle: macro,
        current_mesocycle: currentMeso,
        current_microcycle: currentMicro,
        days_to_target: daysToTarget,
        current_phase: phase,
        phase_progress: progress
    } = analysis;

    // Calculate timeline positions
    const totalDays = Math.ceil(
        (new Date(macro.end_date).getTime() - new Date(macro.start_date).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const daysSinceStart = Math.ceil(
        (Date.now() - new Date(macro.start_date).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const progressPercent = Math.min(100, Math.max(0, (daysSinceStart / totalDays) * 100));

    const phaseColor = phaseColors[phase];

    if (compact) {
        return (
            <GlassCard className={cn('p-4', className)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn('p-2 rounded-lg', phaseColor.bg)}>
                            <Target className={cn('w-4 h-4', phaseColor.text)} />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Current Phase</div>
                            <div className={cn('text-sm font-bold', phaseColor.text)}>
                                {phaseLabels[phase]}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-white">{daysToTarget}</div>
                        <div className="text-[10px] text-muted-foreground uppercase">days to race</div>
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
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                        <Calendar className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">{macro.name}</h3>
                        <p className="text-xs text-muted-foreground">Season periodization</p>
                    </div>
                </div>

                {/* Target Event Badge */}
                <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30">
                    <div className="flex items-center gap-2">
                        <Flag className="w-4 h-4 text-red-400" />
                        <div>
                            <div className="text-xs text-red-400 font-medium">
                                {macro.target_event.name}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                                {new Date(macro.target_event.date).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Countdown */}
            <div className="flex items-center justify-center gap-8 mb-6 p-4 bg-black/30 rounded-xl">
                <div className="text-center">
                    <div className="text-4xl font-bold text-white">{daysToTarget}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Days</div>
                </div>
                <div className="text-center">
                    <div className="text-4xl font-bold text-white">{Math.floor(daysToTarget / 7)}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Weeks</div>
                </div>
                <div className="text-center">
                    <div className={cn('text-2xl font-bold', phaseColor.text)}>
                        {phaseLabels[phase]}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Phase</div>
                </div>
            </div>

            {/* Phase Timeline */}
            <div className="mb-6">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                    Season Timeline
                </div>
                <div className="relative">
                    {/* Background track */}
                    <div className="h-8 bg-white/5 rounded-lg overflow-hidden flex">
                        {macro.mesocycles.map((meso, i) => {
                            const mesoStart = new Date(meso.start_date).getTime();
                            const mesoEnd = new Date(meso.end_date).getTime();
                            const macroStart = new Date(macro.start_date).getTime();
                            const macroEnd = new Date(macro.end_date).getTime();

                            const startPercent = ((mesoStart - macroStart) / (macroEnd - macroStart)) * 100;
                            const widthPercent = ((mesoEnd - mesoStart) / (macroEnd - macroStart)) * 100;

                            const colors = phaseColors[meso.type];
                            const isCurrent = meso.id === currentMeso.id;

                            return (
                                <div
                                    key={meso.id}
                                    className={cn(
                                        'h-full flex items-center justify-center border-r border-white/10 last:border-r-0',
                                        colors.bg,
                                        isCurrent && 'ring-2 ring-white/50'
                                    )}
                                    style={{ width: `${widthPercent}%` }}
                                >
                                    <span className={cn('text-[10px] font-bold truncate px-1', colors.text)}>
                                        {phaseLabels[meso.type]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Current position indicator */}
                    <motion.div
                        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_white]"
                        style={{ left: `${progressPercent}%` }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    />
                </div>

                {/* Phase labels */}
                <div className="flex justify-between mt-2 text-[9px] text-muted-foreground">
                    <span>{new Date(macro.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span>Today</span>
                    <span>{new Date(macro.target_event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
            </div>

            {/* Current Phase Info */}
            <div className={cn('p-4 rounded-lg border-l-4', phaseColor.bg, phaseColor.border)}>
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <span className={cn('text-sm font-bold', phaseColor.text)}>
                            {currentMeso.name}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                            Week {progress.current_week} of {progress.total_weeks}
                        </span>
                    </div>
                    <span className={cn(
                        'px-2 py-1 rounded text-xs font-medium',
                        currentMicro.type === 'recovery' ? 'bg-green-500/20 text-green-400' :
                            currentMicro.type === 'loading' ? 'bg-red-500/20 text-red-400' :
                                'bg-blue-500/20 text-blue-400'
                    )}>
                        {currentMicro.type.replace('_', ' ')}
                    </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                    <motion.div
                        className={cn('h-full', phaseColor.border.replace('border', 'bg'))}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress.percent_complete}%` }}
                    />
                </div>

                {/* Objectives */}
                <div className="text-xs text-muted-foreground">
                    <span className="font-medium text-white">Focus: </span>
                    {currentMeso.objectives.slice(0, 2).join(' • ')}
                </div>
            </div>

            {/* Key Sessions This Week */}
            <div className="mt-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                    Key Sessions This Week
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {currentMicro.sessions.filter(s => s.key_workout).map((session, i) => (
                        <div
                            key={i}
                            className="p-2 bg-white/5 rounded-lg flex items-center gap-2"
                        >
                            <div className="p-1.5 rounded bg-yellow-500/20">
                                <Zap className="w-3 h-3 text-yellow-400" />
                            </div>
                            <div>
                                <div className="text-xs font-medium text-white">{session.name}</div>
                                <div className="text-[10px] text-muted-foreground">{session.duration_min}min</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Volume & Intensity */}
            <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-3 h-3 text-blue-400" />
                        <span className="text-xs text-muted-foreground">Weekly Volume</span>
                    </div>
                    <div className="text-lg font-bold text-white">
                        {currentMeso.volume_target.weekly_hours}h
                    </div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-3 h-3 text-red-400" />
                        <span className="text-xs text-muted-foreground">Intensity Model</span>
                    </div>
                    <div className="text-lg font-bold text-white capitalize">
                        {currentMeso.intensity_distribution.model}
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};

export default MacroTimelineCard;
