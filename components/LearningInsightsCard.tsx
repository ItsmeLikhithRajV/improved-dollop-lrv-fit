import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Sparkles, Target, Brain, Check, X, Lightbulb, ChevronRight } from 'lucide-react';
import { GlassCard, Button, Badge } from './ui';
import { useSentient } from '../store/SentientContext';
import { GOAL_METADATA } from '../types/goals';

// Agent Suggestion Type
interface AgentSuggestion {
    id: string;
    agentName: string;
    type: 'insight' | 'suggestion' | 'warning';
    title: string;
    description: string;
    action?: {
        label: string;
        data: any;
    };
}

/**
 * LearningInsightsCard
 * Surfaces learned patterns, agent discoveries, and actionable suggestions
 */
export const LearningInsightsCard: React.FC = () => {
    const { state, sync } = useSentient();
    const userGoal = state.user_profile?.user_goal;

    // Track dismissed suggestions
    const [dismissedIds, setDismissedIds] = useState<string[]>([]);

    // Generate insights based on current state
    const insights = useMemo(() => {
        const results: Array<{
            id: string;
            icon: any;
            trend: 'up' | 'down' | 'stable';
            title: string;
            value: string;
            description: string;
        }> = [];

        // Personal baseline insight
        const readiness = state.mindspace?.readiness_score || 50;
        const avgReadiness = 65;

        results.push({
            id: 'readiness_baseline',
            icon: Activity,
            trend: readiness > avgReadiness ? 'up' : readiness < avgReadiness - 10 ? 'down' : 'stable',
            title: 'Readiness vs Baseline',
            value: `${readiness}%`,
            description: readiness > avgReadiness
                ? `${Math.round(((readiness - avgReadiness) / avgReadiness) * 100)}% above your personal baseline`
                : readiness < avgReadiness - 10
                    ? `${Math.round(((avgReadiness - readiness) / avgReadiness) * 100)}% below baseline - recovery prioritized`
                    : 'Within normal range'
        });

        // Goal alignment insight
        if (userGoal) {
            const goalMeta = GOAL_METADATA[userGoal.primary];
            results.push({
                id: 'goal_alignment',
                icon: Target,
                trend: 'stable',
                title: 'Active Goal',
                value: goalMeta?.shortName || userGoal.primary,
                description: `All recommendations aligned to ${goalMeta?.name || userGoal.primary}`
            });
        }

        // Recovery pattern insight
        if (state.recovery?.recovery_score) {
            const recoveryScore = state.recovery.recovery_score;
            results.push({
                id: 'recovery_pattern',
                icon: Sparkles,
                trend: recoveryScore > 70 ? 'up' : 'down',
                title: 'Recovery Trend',
                value: `${recoveryScore}%`,
                description: recoveryScore > 70
                    ? 'Strong recovery - consider increasing training load'
                    : 'Recovery compromised - sauna/sleep recommended'
            });
        }

        return results;
    }, [state.mindspace?.readiness_score, state.recovery?.recovery_score, userGoal]);

    // Generate agent suggestions (in production, these come from AgentOrchestrator)
    const agentSuggestions = useMemo((): AgentSuggestion[] => {
        const suggestions: AgentSuggestion[] = [];

        // Analyst Agent: Pattern detection
        const hrv = state.sleep?.hrv || 0;
        const baseline = state.user_profile?.baselines?.hrv_baseline || 45;
        if (hrv > 0 && Math.abs(hrv - baseline) > baseline * 0.1) {
            suggestions.push({
                id: 'analyst_hrv_baseline',
                agentName: 'Analyst',
                type: 'suggestion',
                title: `HRV Baseline Update`,
                description: `Your HRV appears to be trending around ${hrv}ms (current baseline: ${baseline}ms). Update your baseline?`,
                action: {
                    label: 'Update Baseline',
                    data: { type: 'UPDATE_BASELINE', field: 'hrv_baseline', value: hrv }
                }
            });
        }

        // Critic Agent: Warning about overtraining
        const acwr = state.physical_load?.acwr || 1.0;
        if (acwr > 1.3) {
            suggestions.push({
                id: 'critic_acwr_warning',
                agentName: 'Critic',
                type: 'warning',
                title: 'Training Load Concern',
                description: `Your ACWR is ${acwr.toFixed(2)}. Consider lighter sessions this week to reduce injury risk.`
            });
        }

        // Researcher Agent: New insight
        const readiness = state.mindspace?.readiness_score || 50;
        if (readiness > 85) {
            suggestions.push({
                id: 'researcher_peak_window',
                agentName: 'Researcher',
                type: 'insight',
                title: 'Peak Performance Window',
                description: 'Your current readiness suggests today is optimal for high-intensity work or key sessions.'
            });
        }

        return suggestions.filter(s => !dismissedIds.includes(s.id));
    }, [state, dismissedIds]);

    const handleDismiss = (id: string) => {
        setDismissedIds(prev => [...prev, id]);
    };

    const handleApply = (suggestion: AgentSuggestion) => {
        if (suggestion.action) {
            sync('agent_suggestion_applied', suggestion.action.data);
        }
        setDismissedIds(prev => [...prev, suggestion.id]);
    };

    const getSuggestionStyle = (type: AgentSuggestion['type']) => {
        switch (type) {
            case 'warning': return 'border-l-orange-500 bg-orange-500/5';
            case 'suggestion': return 'border-l-primary bg-primary/5';
            case 'insight': return 'border-l-purple-500 bg-purple-500/5';
            default: return 'border-l-white/20';
        }
    };

    return (
        <div className="space-y-4">
            {/* Agent Discoveries Section */}
            <AnimatePresence>
                {agentSuggestions.length > 0 && (
                    <GlassCard className="p-4 border-t-2 border-t-primary">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Brain className="w-4 h-4 text-primary" />
                                <span className="text-sm font-semibold">Sentient Learns</span>
                            </div>
                            <Badge className="text-[9px] bg-primary/20 text-primary border-primary/30">
                                {agentSuggestions.length} New
                            </Badge>
                        </div>

                        <div className="space-y-3">
                            {agentSuggestions.map((suggestion, i) => (
                                <motion.div
                                    key={suggestion.id}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: 50 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`p-3 rounded-lg border-l-4 ${getSuggestionStyle(suggestion.type)}`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Lightbulb className="w-3 h-3 text-primary" />
                                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                                                    {suggestion.agentName}
                                                </span>
                                            </div>
                                            <div className="font-medium text-sm text-white mb-1">{suggestion.title}</div>
                                            <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            {suggestion.action && (
                                                <Button
                                                    size="sm"
                                                    className="h-7 px-2 text-[10px] bg-primary/20 hover:bg-primary/30 text-primary"
                                                    onClick={() => handleApply(suggestion)}
                                                >
                                                    <Check className="w-3 h-3 mr-1" /> Apply
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 w-7 p-0"
                                                onClick={() => handleDismiss(suggestion.id)}
                                            >
                                                <X className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </GlassCard>
                )}
            </AnimatePresence>

            {/* Personal Patterns Section */}
            {insights.length > 0 && (
                <GlassCard className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold">Personal Patterns</span>
                    </div>

                    <div className="space-y-3">
                        {insights.map((insight, i) => {
                            const Icon = insight.icon;
                            const trendColor = insight.trend === 'up' ? 'text-green-400' :
                                insight.trend === 'down' ? 'text-red-400' : 'text-blue-400';
                            const TrendIcon = insight.trend === 'up' ? TrendingUp :
                                insight.trend === 'down' ? TrendingDown : Activity;

                            return (
                                <motion.div
                                    key={insight.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className={`p-2 rounded-lg bg-white/5 ${trendColor}`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{insight.title}</span>
                                            <div className="flex items-center gap-1">
                                                <span className={`text-sm font-bold ${trendColor}`}>{insight.value}</span>
                                                <TrendIcon className={`w-3 h-3 ${trendColor}`} />
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{insight.description}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </GlassCard>
            )}
        </div>
    );
};

export default LearningInsightsCard;

