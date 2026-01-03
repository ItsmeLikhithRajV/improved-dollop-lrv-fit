/**
 * SENTIENT HOME - REFINED EDITION
 * Glass HUD design with Sentient Orb and Expert-driven insights.
 * 
 * Design Principles:
 * - Orb = Visual anchor, readiness at a glance
 * - Quick Stats = Clickable, navigate to tabs
 * - Active Command = THE one thing from Expert Council
 * - Expert Feed = Contextual, only when urgent
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, Heart, Moon, Flame, Brain, Droplets,
    ChevronRight, Sparkles, AlertTriangle, Zap, Clock
} from 'lucide-react';
import { useSentient } from '../../store/SentientContext';
import { GlassCard } from '../../components/ui';
import { expertCouncil, CouncilRecommendation } from '../../experts';
import { scoreToStatus, getStatusLabel } from '../../ui/shared/statusUtils';

// Types
type OrbState = 'optimal' | 'good' | 'warning' | 'critical' | 'resting';
type MetricStatus = 'optimal' | 'good' | 'fair' | 'poor' | 'warning' | 'critical' | 'neutral' | 'unknown';

interface QuickStat {
    id: string;
    label: string;
    value: string | number;
    unit?: string;
    status: MetricStatus;
    icon: React.ElementType;
    tab: string; // Which tab to navigate to
}

interface ExpertInsight {
    id: string;
    expert: string;
    action: string;
    reason: string;
    urgency: number;
    timing?: string;
}

// Status colors
const STATUS_COLORS: Record<MetricStatus, string> = {
    optimal: 'text-green-400',
    good: 'text-teal-400',
    warning: 'text-amber-400',
    critical: 'text-red-400',
    neutral: 'text-white/60',
    unknown: 'text-white/40',
    fair: 'text-yellow-400',
    poor: 'text-red-400',
};

const STATUS_BG: Record<MetricStatus, string> = {
    optimal: 'bg-green-500/20 border-green-500/30',
    good: 'bg-teal-500/20 border-teal-500/30',
    warning: 'bg-amber-500/20 border-amber-500/30',
    critical: 'bg-red-500/20 border-red-500/30',
    neutral: 'bg-white/10 border-white/20',
    unknown: 'bg-white/5 border-white/10',
    fair: 'bg-yellow-500/20 border-yellow-500/30',
    poor: 'bg-red-500/20 border-red-500/30',
};

// Orb state derivation - uses scientific status thresholds
const deriveOrbState = (readiness: number, isNightMode: boolean): OrbState => {
    if (isNightMode) return 'resting';
    const status = scoreToStatus(readiness);
    switch (status) {
        case 'optimal': return 'optimal';
        case 'good': return 'good';
        case 'fair': return 'warning';
        case 'poor': return 'critical';
        default: return 'good';
    }
};

const ORB_GRADIENTS: Record<OrbState, string> = {
    optimal: 'from-green-400 via-emerald-500 to-teal-600',
    good: 'from-teal-400 via-cyan-500 to-blue-500',
    warning: 'from-amber-400 via-orange-500 to-red-500',
    critical: 'from-red-500 via-rose-600 to-pink-600',
    resting: 'from-indigo-400 via-purple-500 to-violet-600',
};

export const SentientHome: React.FC = () => {
    const { state, dispatch } = useSentient();

    // Derive readiness score - default to null if no data
    const readinessScore = state.last_sentient_output?.readinessScore ?? null;
    const hour = new Date().getHours();
    const isNightMode = hour >= 22 || hour < 6;

    // If no score, use 'resting' state or 'null' state, don't fake it
    const orbState = readinessScore !== null ? deriveOrbState(readinessScore, isNightMode) : 'resting';

    // Use scientific status for label (capitalizes first letter)
    const readinessStatus = readinessScore !== null ? scoreToStatus(readinessScore) : 'unknown';
    const readinessLabel = readinessScore !== null ? getStatusLabel(readinessStatus) : 'Gathering Data...';

    // Build quick stats - clickable to navigate
    // Build quick stats - clickable to navigate
    const quickStats: QuickStat[] = useMemo(() => [
        {
            id: 'hrv',
            label: 'HRV',
            value: state.sleep?.hrv ?? '--',
            unit: 'ms',
            status: state.sleep?.hrv ? scoreToStatus(state.sleep.hrv) : 'unknown',
            icon: Activity,
            tab: 'body',
        },
        {
            id: 'sleep',
            label: 'Sleep',
            value: state.sleep?.duration ? state.sleep.duration.toFixed(1) : '--',
            unit: 'h',
            status: state.sleep?.duration ? (state.sleep.duration >= 7 ? 'optimal' : 'poor') : 'unknown',
            icon: Moon,
            tab: 'body',
        },
        {
            id: 'fuel',
            label: 'Fuel',
            value: state.fuel?.fuel_score ?? '--',
            unit: '%',
            status: state.fuel?.fuel_score ? scoreToStatus(state.fuel.fuel_score) : 'unknown',
            icon: Flame,
            tab: 'fuel',
        },
        {
            id: 'stress',
            label: 'Stress',
            value: state.mindspace?.stress ?? '--',
            unit: '%',
            status: state.mindspace?.stress ? scoreToStatus(state.mindspace.stress) : 'unknown',
            icon: Brain,
            tab: 'mindspace',
        },
    ], [state.sleep, state.fuel, state.mindspace]);

    // Get active command from orchestrator
    const activeCommand = state.orchestrator?.active_command;

    // Get expert insights from the Expert Council (NOT inline logic)
    const councilOutput = useMemo(() =>
        expertCouncil.convene(state, state.user_profile || {} as any),
        [state]
    );

    // Map council recommendations to ExpertInsight format for UI
    const expertInsights: ExpertInsight[] = useMemo(() => {
        return councilOutput.recommendations.slice(0, 5).map((rec: CouncilRecommendation) => ({
            id: rec.id,
            expert: rec.expert,
            action: rec.name,
            reason: rec.rationale,
            urgency: rec.urgency,
            timing: rec.duration_minutes > 0 ? `${rec.duration_minutes}min` : undefined
        }));
    }, [councilOutput.recommendations]);

    // Primary insight (highest urgency)
    const primaryInsight = expertInsights[0];

    // Time-based greeting
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="space-y-6 py-2">
            {/* Header */}
            <header className="flex items-center justify-between px-1">
                <div>
                    <h1 className="text-xl font-semibold text-white">{greeting}</h1>
                    <p className="text-xs text-white/40">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass">
                    <Clock className="w-3.5 h-3.5 text-white/50" />
                    <span className="text-xs font-mono text-white/70">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </header>

            {/* Sentient Orb - Central Element */}
            <motion.div
                className="flex flex-col items-center py-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Orb Container */}
                <div className="relative">
                    {/* Glow Effect */}
                    <motion.div
                        className={`absolute inset-0 rounded-full bg-gradient-to-br ${ORB_GRADIENTS[orbState]} blur-2xl opacity-40`}
                        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    {/* Main Orb */}
                    <motion.div
                        className={`relative w-36 h-36 rounded-full bg-gradient-to-br ${ORB_GRADIENTS[orbState]} flex items-center justify-center shadow-2xl cursor-pointer`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        onClick={() => dispatch({ type: 'SET_TAB', payload: 'commander' })}
                    >
                        {/* Glass overlay */}
                        <div className="absolute inset-2 rounded-full bg-white/10 backdrop-blur-sm" />

                        {/* Score */}
                        <div className="relative z-10 text-center">
                            <span className="text-4xl font-bold text-white drop-shadow-lg">{readinessScore}</span>
                            <div className="text-[10px] uppercase tracking-widest text-white/80 mt-0.5">Readiness</div>
                        </div>
                    </motion.div>
                </div>

                {/* Status Label */}
                <div className={`mt-4 px-4 py-1 rounded-full border ${STATUS_BG[orbState === 'resting' ? 'good' : orbState]}`}>
                    <span className={`text-xs font-medium ${STATUS_COLORS[orbState === 'resting' ? 'good' : orbState]}`}>
                        {isNightMode ? '🌙 Rest Mode' : readinessLabel}
                    </span>
                </div>
            </motion.div>

            {/* Quick Stats - Clickable */}
            <div className="grid grid-cols-4 gap-2">
                {quickStats.map((stat) => (
                    <motion.button
                        key={stat.id}
                        onClick={() => dispatch({ type: 'SET_TAB', payload: stat.tab })}
                        className="flex flex-col items-center py-3 px-2 rounded-xl glass hover:bg-white/10 transition-colors"
                        whileTap={{ scale: 0.95 }}
                    >
                        <stat.icon className={`w-4 h-4 ${STATUS_COLORS[stat.status]} mb-1`} />
                        <div className={`text-sm font-semibold ${STATUS_COLORS[stat.status]}`}>
                            {stat.value}{stat.unit}
                        </div>
                        <div className="text-[10px] text-white/40 uppercase">{stat.label}</div>
                    </motion.button>
                ))}
            </div>

            {/* Active Command - From Expert Council */}
            {(activeCommand || primaryInsight) && (
                <GlassCard
                    className="border-l-4 border-l-primary cursor-pointer"
                    onClick={() => dispatch({ type: 'SET_TAB', payload: 'commander' })}
                >
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-xl bg-primary/20">
                            <Zap className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] uppercase tracking-widest text-white/40">
                                    {activeCommand ? 'Active Command' : primaryInsight?.expert + ' Expert'}
                                </span>
                                {(activeCommand?.timing?.suggested_completion_time || primaryInsight?.timing) && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50">
                                        {primaryInsight?.timing}
                                    </span>
                                )}
                            </div>
                            <h3 className="text-base font-semibold text-white">
                                {activeCommand?.action?.name || primaryInsight?.action}
                            </h3>
                            <p className="text-sm text-white/50 mt-1">
                                {activeCommand?.action?.description || primaryInsight?.reason}
                            </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/30 self-center" />
                    </div>
                </GlassCard>
            )}

            {/* Secondary Insights (max 2) */}
            {expertInsights.length > 1 && (
                <div className="space-y-2">
                    <h2 className="text-[10px] uppercase tracking-widest text-white/30 px-1">Also on your radar</h2>
                    {expertInsights.slice(1, 3).map((insight) => (
                        <motion.div
                            key={insight.id}
                            onClick={() => dispatch({ type: 'SET_TAB', payload: 'commander' })}
                            className="flex items-center gap-3 p-3 rounded-xl glass cursor-pointer hover:bg-white/10 transition-colors"
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className={`w-1.5 h-8 rounded-full ${insight.urgency > 75 ? 'bg-amber-500' : 'bg-white/20'}`} />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-white/40">{insight.expert}</span>
                                    {insight.timing && <span className="text-[10px] text-white/30">• {insight.timing}</span>}
                                </div>
                                <p className="text-sm text-white/80">{insight.action}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/20" />
                        </motion.div>
                    ))}
                </div>
            )}

            {/* All Clear State */}
            {expertInsights.length === 0 && !activeCommand && (
                <GlassCard className="text-center py-8">
                    <Sparkles className="w-8 h-8 text-green-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-white mb-1">All systems optimal</h3>
                    <p className="text-sm text-white/50">No urgent actions. Stay the course.</p>
                </GlassCard>
            )}

            {/* Bottom spacer for tab bar */}
            <div className="h-20" />
        </div>
    );
};

export default SentientHome;
