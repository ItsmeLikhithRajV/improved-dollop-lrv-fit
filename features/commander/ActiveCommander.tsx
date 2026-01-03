/**
 * Active Commander - The Unified Action Dashboard
 * 
 * Displays the adaptive intelligence output in a clear, actionable format.
 * Shows the ONE thing to do next, with context and upcoming actions.
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSentient } from '../../store/SentientContext';
import {
    Zap, Clock, AlertTriangle, ChevronRight, ChevronDown,
    Play, Pause, SkipForward, Coffee, Moon, Sun,
    Flame, Heart, Activity, Brain, Droplets, Target, Utensils
} from 'lucide-react';
import { GlassCard, cn } from '../../components/ui';
import { getAdaptiveRecommendations } from '../../experts/orchestrator/AdaptiveIntelligenceEngine';
import { evaluateFuelAction, FuelAction } from '../../experts/nutritionist/FuelActionEngine';
import { generateUnifiedProtocol, UnifiedAction, UnifiedDayProtocol } from '../../experts/longevity/UnifiedTimelineProtocolEngine';
import { DEFAULT_USER_GOAL } from '../../types/goals';
import type { AdaptiveAction, Alert, ActionCategory, ActionPriority } from '../../types/adaptive-intelligence';
import { Pill, Snowflake, Wind } from 'lucide-react';

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const CategoryIcon: React.FC<{ category: ActionCategory; className?: string }> = ({ category, className }) => {
    const icons: Record<ActionCategory, React.ElementType> = {
        safety: AlertTriangle,
        training: Activity,
        recovery: Zap,
        fuel: Flame,
        mindspace: Brain,
        circadian: Sun
    };
    const Icon = icons[category];
    return <Icon className={className} />;
};

const PriorityBadge: React.FC<{ priority: ActionPriority }> = ({ priority }) => {
    const config: Record<ActionPriority, { bg: string; text: string; label: string }> = {
        critical: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'CRITICAL' },
        high: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'HIGH' },
        medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'MEDIUM' },
        low: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'LOW' },
        optional: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'OPTIONAL' }
    };
    const c = config[priority];

    return (
        <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase', c.bg, c.text)}>
            {c.label}
        </span>
    );
};

const TimeSensitivityBadge: React.FC<{ sensitivity: string }> = ({ sensitivity }) => {
    const labels: Record<string, string> = {
        immediate: 'NOW',
        within_30min: '30 MIN',
        within_hour: '1 HOUR',
        today: 'TODAY',
        flexible: 'FLEXIBLE'
    };

    return (
        <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] text-white/70">
            {labels[sensitivity] || sensitivity}
        </span>
    );
};

// ============================================================================
// FOOD SUGGESTION CARD (from FuelActionEngine)
// ============================================================================

interface FoodSuggestionCardProps {
    fuelAction: FuelAction;
}

const FoodSuggestionCard: React.FC<FoodSuggestionCardProps> = ({ fuelAction }) => {
    if (fuelAction.urgency === 'none') return null;

    const urgencyColors = {
        critical: 'border-l-red-500 bg-red-950/20',
        high: 'border-l-orange-500 bg-orange-950/20',
        medium: 'border-l-yellow-500 bg-yellow-950/20',
        low: 'border-l-blue-500 bg-blue-950/20',
        none: 'border-l-gray-500 bg-gray-950/20'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                'rounded-2xl border-l-4 p-4 backdrop-blur-sm',
                urgencyColors[fuelAction.urgency]
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/20">
                        <Utensils className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">{fuelAction.headline}</h3>
                        <p className="text-sm text-white/60">{fuelAction.subtext}</p>
                    </div>
                </div>
                <PriorityBadge priority={fuelAction.urgency === 'critical' ? 'critical' :
                    fuelAction.urgency === 'high' ? 'high' : 'medium'} />
            </div>

            {/* Deficit Info */}
            {fuelAction.primary_deficit.macro !== 'none' && (
                <div className="mb-3 p-2 bg-black/30 rounded-lg flex items-center justify-between">
                    <span className="text-xs text-white/50 uppercase">
                        {fuelAction.primary_deficit.macro} deficit
                    </span>
                    <span className="text-lg font-bold text-orange-400">
                        {fuelAction.primary_deficit.amount_g}g
                    </span>
                </div>
            )}

            {/* Food Suggestions */}
            {fuelAction.suggestions.length > 0 && (
                <div className="space-y-2">
                    <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">
                        Quick Options
                    </div>
                    {fuelAction.suggestions.map((suggestion, i) => (
                        <div
                            key={i}
                            className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-lg">{suggestion.emojis}</span>
                                <span className={cn(
                                    "text-[10px] px-2 py-0.5 rounded",
                                    suggestion.prep_time === 'instant' ? 'bg-green-500/20 text-green-400' :
                                        suggestion.prep_time === 'quick' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-orange-500/20 text-orange-400'
                                )}>
                                    {suggestion.prep_time === 'instant' ? '⚡ Ready' :
                                        suggestion.prep_time === 'quick' ? '🕐 5min' : '🍳 15min+'}
                                </span>
                            </div>
                            <div className="text-sm text-white font-medium">
                                {suggestion.foods.join(' + ')}
                            </div>
                            <div className="text-xs text-green-400 mt-1">
                                {suggestion.covers}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Timing Window */}
            {fuelAction.timing_window && (
                <div className="mt-3 p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <div className="flex items-center gap-2 text-purple-400 text-xs">
                        <Target className="w-3 h-3" />
                        <span className="font-bold">{fuelAction.timing_window.name}</span>
                    </div>
                    <p className="text-[10px] text-white/50 mt-1">
                        {fuelAction.timing_window.reason}
                    </p>
                </div>
            )}

            {/* Tomorrow Tip */}
            {fuelAction.tomorrow_tip && (
                <div className="mt-3 p-2 bg-blue-500/10 rounded-lg text-xs text-blue-300">
                    💡 {fuelAction.tomorrow_tip}
                </div>
            )}
        </motion.div>
    );
};

// ============================================================================
// COMMANDER ACTION CARD
// ============================================================================

interface CommanderActionCardProps {
    action: AdaptiveAction;
    isMain?: boolean;
    onComplete?: () => void;
    onSnooze?: (minutes: number) => void;
    onDismiss?: () => void;
}

export const CommanderActionCard: React.FC<CommanderActionCardProps> = ({
    action,
    isMain = false,
    onComplete,
    onSnooze,
    onDismiss
}) => {
    const [expanded, setExpanded] = useState(isMain);

    const categoryColors: Record<ActionCategory, string> = {
        safety: 'from-red-500/30 to-red-600/10 border-red-500',
        training: 'from-green-500/30 to-green-600/10 border-green-500',
        recovery: 'from-purple-500/30 to-purple-600/10 border-purple-500',
        fuel: 'from-orange-500/30 to-orange-600/10 border-orange-500',
        mindspace: 'from-blue-500/30 to-blue-600/10 border-blue-500',
        circadian: 'from-yellow-500/30 to-yellow-600/10 border-yellow-500'
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                'rounded-2xl overflow-hidden',
                isMain ? 'border-l-4' : 'border-l-2',
                categoryColors[action.category].split(' ')[2]
            )}
        >
            <div className={cn(
                'p-4 bg-gradient-to-r',
                categoryColors[action.category].split(' ').slice(0, 2).join(' ')
            )}>
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className={cn(
                            'p-2 rounded-lg bg-black/20',
                            isMain ? 'p-3' : 'p-2'
                        )}>
                            {action.icon ? (
                                <CategoryIcon
                                    category={action.category}
                                    className={cn('text-white', isMain ? 'w-6 h-6' : 'w-4 h-4')}
                                />
                            ) : (
                                <CategoryIcon
                                    category={action.category}
                                    className={cn('text-white', isMain ? 'w-6 h-6' : 'w-4 h-4')}
                                />
                            )}
                        </div>
                        <div>
                            <h3 className={cn(
                                'font-bold text-white',
                                isMain ? 'text-xl' : 'text-base'
                            )}>
                                {action.title}
                            </h3>
                            <p className={cn(
                                'text-white/70 mt-0.5',
                                isMain ? 'text-sm' : 'text-xs'
                            )}>
                                {action.description}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                        <PriorityBadge priority={action.priority} />
                        <TimeSensitivityBadge sensitivity={action.time_sensitivity} />
                    </div>
                </div>

                {/* Expandable Content */}
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-4 pt-4 border-t border-white/10">
                                {/* Rationale */}
                                <div className="space-y-2">
                                    <div>
                                        <div className="text-xs text-white/50 uppercase tracking-wider mb-1">Why</div>
                                        <p className="text-sm text-white">{action.rationale.primary_reason}</p>
                                    </div>

                                    {action.rationale.supporting_signals.length > 0 && (
                                        <div>
                                            <div className="text-xs text-white/50 uppercase tracking-wider mb-1">Signals</div>
                                            <div className="flex flex-wrap gap-1">
                                                {action.rationale.supporting_signals.map((signal, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-white/10 rounded text-xs text-white/80">
                                                        {signal}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {action.rationale.science_brief && (
                                        <div className="mt-2 p-3 bg-white/5 rounded-lg border border-white/5">
                                            <div className="text-[10px] text-primary uppercase tracking-[0.2em] mb-1 flex items-center gap-1">
                                                <Target className="w-3 h-3" /> Science Brief
                                            </div>
                                            <p className="text-xs text-white/70 leading-relaxed italic">{action.rationale.science_brief}</p>
                                        </div>
                                    )}

                                    {action.rationale.impact_summary && (
                                        <div className="mt-2">
                                            <div className="text-[10px] text-white/50 uppercase tracking-wider mb-1">System Impact</div>
                                            <p className="text-xs text-secondary">{action.rationale.impact_summary}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Rich Specifics (Salvaged from Legacy) */}
                                {action.specifics?.fuel && (
                                    <div className="mt-3 p-3 bg-black/40 rounded-lg border border-white/10">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="text-[10px] uppercase tracking-widest text-white/50">Macro Targets</div>
                                            <div className="flex gap-3 text-xs font-mono">
                                                <span className="text-orange-400">CHO: {action.specifics.fuel.macros.carbs}g</span>
                                                <span className="text-blue-400">PRO: {action.specifics.fuel.macros.protein}g</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {action.specifics.fuel.suggestions.map((s, i) => (
                                                <span key={i} className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/60">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Duration */}
                                {action.duration_minutes && (
                                    <div className="mt-3 flex items-center gap-2 text-sm text-white/70">
                                        <Clock className="w-4 h-4" />
                                        <span>{action.duration_minutes} minutes</span>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="mt-4 flex items-center gap-2">
                                    <button
                                        onClick={onComplete}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors"
                                    >
                                        <Play className="w-4 h-4" />
                                        Start
                                    </button>

                                    {action.snooze_options && action.snooze_options.length > 0 && (
                                        <button
                                            onClick={() => onSnooze?.(action.snooze_options![0])}
                                            className="flex items-center justify-center gap-2 py-2 px-4 bg-white/10 hover:bg-white/20 rounded-lg text-white/70 transition-colors"
                                        >
                                            <Pause className="w-4 h-4" />
                                            Later
                                        </button>
                                    )}

                                    {action.dismissable && (
                                        <button
                                            onClick={onDismiss}
                                            className="flex items-center justify-center gap-2 py-2 px-4 bg-white/10 hover:bg-white/20 rounded-lg text-white/70 transition-colors"
                                        >
                                            <SkipForward className="w-4 h-4" />
                                            Skip
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Expand Toggle */}
                {!isMain && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="w-full mt-3 flex items-center justify-center text-white/50 hover:text-white/80"
                    >
                        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                )}
            </div>
        </motion.div>
    );
};

// ============================================================================
// READINESS RING
// ============================================================================

export const ReadinessRing: React.FC<{ score: number; status: string }> = ({ score, status }) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;

    const statusColors: Record<string, string> = {
        thriving: '#10B981',
        good: '#84CC16',
        fair: '#F59E0B',
        caution: '#F97316',
        rest: '#EF4444'
    };

    const color = statusColors[status] || statusColors.fair;

    return (
        <div className="relative w-28 h-28">
            <svg className="w-full h-full transform -rotate-90">
                {/* Background ring */}
                <circle
                    cx="56"
                    cy="56"
                    r="45"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                />
                {/* Progress ring */}
                <circle
                    cx="56"
                    cy="56"
                    r="45"
                    fill="none"
                    stroke={color}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{score}</span>
                <span className="text-[10px] text-white/50 uppercase tracking-wider">{status}</span>
            </div>
        </div>
    );
};

// ============================================================================
// ALERT BANNER
// ============================================================================

export const AlertBanner: React.FC<{ alert: Alert }> = ({ alert }) => {
    const config = {
        info: { bg: 'bg-blue-500/20', border: 'border-blue-500', icon: Coffee, text: 'text-blue-400' },
        warning: { bg: 'bg-yellow-500/20', border: 'border-yellow-500', icon: AlertTriangle, text: 'text-yellow-400' },
        critical: { bg: 'bg-red-500/20', border: 'border-red-500', icon: AlertTriangle, text: 'text-red-400' }
    };

    const c = config[alert.severity];
    const Icon = c.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('flex items-center gap-3 p-3 rounded-xl border-l-4', c.bg, c.border)}
        >
            <Icon className={cn('w-5 h-5', c.text)} />
            <div className="flex-1">
                <div className={cn('text-sm font-semibold', c.text)}>{alert.title}</div>
                <div className="text-xs text-white/70">{alert.message}</div>
            </div>
        </motion.div>
    );
};

// ============================================================================
// MAIN COMMANDER COMPONENT
// ============================================================================

interface ActiveCommanderProps {
    className?: string;
}

export const ActiveCommander: React.FC<ActiveCommanderProps> = ({ className }) => {
    const { state } = useSentient();
    const intelligence = useMemo(() => getAdaptiveRecommendations(state.timeline.sessions), [state.timeline.sessions]);
    const { state_summary, commander_action, upcoming_actions, alerts, patterns_detected } = intelligence;

    // Evaluate FuelActionEngine for specific food suggestions
    const fuelAction = useMemo(() => evaluateFuelAction(state), [state]);

    // Unified Protocol - All engines combined
    const userGoal = state.user_profile?.user_goal || DEFAULT_USER_GOAL;
    const bodyWeight = state.user_profile?.body_composition?.weight_kg || 70;
    const unifiedProtocol: UnifiedDayProtocol = useMemo(() => {
        const sessions = state.timeline?.sessions || [];
        return generateUnifiedProtocol(sessions, {
            goal: userGoal.primary,
            weight_kg: bodyWeight,
            supplement_ids: ['vitamin_d', 'omega_3', 'magnesium', 'creatine', 'whey_protein']
        });
    }, [state.timeline?.sessions, userGoal.primary, bodyWeight]);

    const handleComplete = (actionId: string) => {
        console.log('Completing action:', actionId);
        // Would update state and record completion
    };

    const handleSnooze = (actionId: string, minutes: number) => {
        console.log('Snoozing action:', actionId, 'for', minutes, 'minutes');
    };

    const handleDismiss = (actionId: string) => {
        console.log('Dismissing action:', actionId);
    };

    return (
        <div className={cn('space-y-6', className)}>
            {/* Header with Readiness */}
            <GlassCard className="p-6">
                <div className="flex items-center gap-6">
                    <ReadinessRing score={state_summary.overall_readiness} status={state_summary.status} />

                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white">{state_summary.headline}</h2>
                        <p className="text-sm text-white/60 mt-1">{state_summary.subheadline}</p>

                        {patterns_detected.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {patterns_detected.map((pattern, i) => (
                                    <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                                        💡 {pattern}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </GlassCard>

            {/* Active Alerts */}
            {alerts.length > 0 && (
                <div className="space-y-2">
                    {alerts.map(alert => (
                        <AlertBanner key={alert.id} alert={alert} />
                    ))}
                </div>
            )}

            {/* FOOD SUGGESTION CARD - Show when fuel is a priority */}
            {fuelAction.urgency !== 'none' && fuelAction.urgency_score > 30 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Flame className="w-5 h-5 text-orange-400" />
                        <h3 className="text-lg font-semibold text-white">Fuel Priority</h3>
                    </div>
                    <FoodSuggestionCard fuelAction={fuelAction} />
                </div>
            )}

            {/* UNIFIED PROTOCOL ACTIONS - All domains */}
            {unifiedProtocol.urgent_actions.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-5 h-5 text-cyan-400" />
                        <h3 className="text-lg font-semibold text-white">Priority Actions</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-400">
                            {unifiedProtocol.mode === 'performance' ? 'SESSION MODE' : 'LONGEVITY MODE'}
                        </span>
                    </div>
                    <div className="space-y-2">
                        {unifiedProtocol.urgent_actions.slice(0, 4).map((action) => (
                            <GlassCard key={action.id} className={cn(
                                "p-4 border-l-4",
                                action.domain === 'fuel' ? "border-l-orange-500" :
                                    action.domain === 'supplement' ? "border-l-emerald-500" :
                                        action.domain === 'recovery' ? "border-l-cyan-500" :
                                            action.domain === 'mind' ? "border-l-purple-500" :
                                                "border-l-blue-500"
                            )}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{action.emoji}</span>
                                        <div>
                                            <div className="text-sm font-bold text-white">{action.title}</div>
                                            <div className="text-xs text-white/50">{action.description}</div>
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                        action.priority_label === 'critical' ? "bg-red-500/20 text-red-400" :
                                            action.priority_label === 'high' ? "bg-orange-500/20 text-orange-400" :
                                                action.priority_label === 'medium' ? "bg-yellow-500/20 text-yellow-400" :
                                                    "bg-blue-500/20 text-blue-400"
                                    )}>
                                        {action.is_active ? '🔥 NOW' : action.is_upcoming ? 'SOON' : action.priority_label}
                                    </span>
                                </div>
                                {action.how_to && (
                                    <div className="text-xs text-white/40 mt-2 pl-9">
                                        💡 {action.how_to}
                                    </div>
                                )}
                                {action.is_blocked && (
                                    <div className="text-xs text-red-400 mt-2 pl-9">
                                        ❌ {action.blocked_reason}
                                    </div>
                                )}
                                {action.causal_effects.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2 pl-9">
                                        {action.causal_effects.slice(0, 2).map((effect, i) => (
                                            <span key={i} className={cn(
                                                "text-[9px] px-1.5 py-0.5 rounded",
                                                effect.effect === 'positive' ? "bg-green-500/20 text-green-400" :
                                                    effect.effect === 'negative' ? "bg-red-500/20 text-red-400" :
                                                        "bg-gray-500/20 text-gray-400"
                                            )}>
                                                {effect.effect === 'positive' ? '↑' : '↓'} {effect.description}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </GlassCard>
                        ))}
                    </div>

                    {/* Conflicts Warning */}
                    {unifiedProtocol.conflicts.length > 0 && (
                        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <div className="text-xs font-bold text-red-400 mb-1">⚠️ Active Conflicts</div>
                            {unifiedProtocol.conflicts.map((conflict, i) => (
                                <div key={i} className="text-xs text-red-400/80">{conflict}</div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Commander Action */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-white">Do This Now</h3>
                </div>
                <CommanderActionCard
                    action={commander_action}
                    isMain
                    onComplete={() => handleComplete(commander_action.id)}
                    onSnooze={(mins) => handleSnooze(commander_action.id, mins)}
                    onDismiss={() => handleDismiss(commander_action.id)}
                />
            </div>

            {/* Upcoming Actions */}
            {upcoming_actions.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-5 h-5 text-white/50" />
                        <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">Coming Up</h3>
                    </div>
                    <div className="space-y-3">
                        {upcoming_actions.map(action => (
                            <CommanderActionCard
                                key={action.id}
                                action={action}
                                onComplete={() => handleComplete(action.id)}
                                onSnooze={(mins) => handleSnooze(action.id, mins)}
                                onDismiss={() => handleDismiss(action.id)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActiveCommander;
