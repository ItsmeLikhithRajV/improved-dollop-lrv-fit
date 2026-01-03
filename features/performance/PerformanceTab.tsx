/**
 * PerformanceTab v3.0 - Premium Clean Layout
 * 
 * Redesigned with:
 * - Single HeroCard (Adaptation Score)
 * - Target acquisition (kept)
 * - Phase display (kept)
 * - Contextual alerts (only when issues)
 * - Deep Analytics (full-screen for charts)
 */

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Microscope, Trophy, Activity, TrendingUp, Target, PlusCircle,
    BarChart2, Flame, GitBranch, Dumbbell, Calendar, ChevronRight,
    Heart, Ghost, Swords, AlertCircle, LineChart, Compass, Award,
    Flag, Timer, Zap, Shield
} from "lucide-react";
import { GlassCard, Badge, cn, Button } from "../../components/ui";
import { useSentient } from "../../store/SentientContext";
import { LongitudinalEntry, PerformanceState } from "../../types";
import { GOAL_METADATA, UserGoal, DEFAULT_USER_GOAL } from "../../types/goals";

// Premium components
import { HeroCard, QuickStatsRow, ContextualCard, NavigationCard, DeepAnalyticsScreen } from "../../components/premium";

// Existing components we keep
import { DataEntryModal } from "./components/DataEntryModal";
import { PRWall } from "./components/PRWall";
import { PREntryModal } from "./components/PREntryModal";
import { TrainingHeatmap } from "./components/TrainingHeatmap";
import { GoalSelector } from "../goals/GoalSelector";
import { LoadCockpit } from "../load/LoadCockpit";
import { PatternDiscoveryCard } from "../patterns/PatternDiscoveryCard";
import { PersonalRecord, HeatmapDay } from "./types/prTypes";
import { loadPersonalRecords, addPersonalRecord as addPRToStore } from "../../services/prStore";
import { CompetitionFocusScreen } from "./CompetitionFocusScreen";
import { TargetAcquisitionModal } from "./components/TargetAcquisitionModal";
import { PeriodizationTab } from "../periodization/PeriodizationTab";
import { SimulatorTab } from "../simulator/SimulatorTab";

// =====================================================
// HELPER COMPONENTS (Kept Simple)
// =====================================================

const PhaseIndicator = ({ phase, totalPhases }: { phase: number; totalPhases: number }) => (
    <div className="flex items-center gap-2">
        {Array.from({ length: totalPhases }).map((_, i) => (
            <div
                key={i}
                className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    i < phase ? "bg-primary" : "bg-white/20"
                )}
            />
        ))}
        <span className="text-xs text-white/40 ml-1">Phase {phase}/{totalPhases}</span>
    </div>
);

// =====================================================
// TARGET CARD (Kept - User likes this)
// =====================================================

const TargetCard = ({
    target,
    onAcquire,
    onEdit
}: {
    target?: PerformanceState['target_event'];
    onAcquire: () => void;
    onEdit: () => void;
}) => {
    if (!target) {
        return (
            <GlassCard
                className="cursor-pointer hover:bg-white/[0.06] transition-all border-dashed"
                onClick={onAcquire}
            >
                <div className="flex items-center gap-4 p-2">
                    <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                        <Target className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-bold text-white">Acquire Target</div>
                        <div className="text-xs text-white/40">Set a competition or event goal</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/30" />
                </div>
            </GlassCard>
        );
    }

    const daysLeft = Math.ceil((new Date(target.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const isClose = daysLeft <= 14;

    return (
        <GlassCard
            className={cn(
                "cursor-pointer hover:bg-white/[0.06] transition-all",
                isClose && "border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent"
            )}
            onClick={onEdit}
        >
            <div className="flex items-center gap-4 p-2">
                <div className={cn(
                    "p-3 rounded-xl",
                    isClose ? "bg-amber-500/20 border border-amber-500/30" : "bg-primary/10 border border-primary/20"
                )}>
                    <Trophy className={cn("w-6 h-6", isClose ? "text-amber-400" : "text-primary")} />
                </div>
                <div className="flex-1">
                    <div className="text-sm font-bold text-white">{target.name}</div>
                    <div className="text-xs text-white/40">Priority: {target.priority}</div>
                </div>
                <div className="text-right">
                    <div className={cn(
                        "text-2xl font-bold font-mono",
                        isClose ? "text-amber-400" : "text-primary"
                    )}>
                        {daysLeft}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-white/40">days</div>
                </div>
            </div>
        </GlassCard>
    );
};

// =====================================================
// GHOST COACH (Supportive Insights - Not Commands)
// =====================================================

const GhostCoachCard = ({
    message,
    insight,
    onDismiss
}: {
    message: string;
    insight?: string;
    onDismiss?: () => void;
}) => {
    if (!message) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
        >
            <GlassCard className="bg-gradient-to-br from-purple-900/20 to-transparent border-purple-500/20">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
                        <Ghost className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] uppercase tracking-widest text-purple-400 font-bold">
                                Ghost Coach
                            </span>
                        </div>
                        <p className="text-sm text-white/80 leading-relaxed">
                            "{message}"
                        </p>
                        {insight && (
                            <div className="mt-2 text-xs text-white/50 flex items-center gap-2">
                                <Compass className="w-3 h-3" />
                                {insight}
                            </div>
                        )}
                    </div>
                    {onDismiss && (
                        <button
                            onClick={onDismiss}
                            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <ChevronRight className="w-4 h-4 text-white/30" />
                        </button>
                    )}
                </div>
            </GlassCard>
        </motion.div>
    );
};

// =====================================================
// COMPETITION COUNTDOWN BANNER
// =====================================================

const CompetitionBanner = ({
    eventName,
    daysLeft,
    phase,
    onViewCompetition
}: {
    eventName: string;
    daysLeft: number;
    phase: string;
    onViewCompetition: () => void;
}) => {
    const urgency = daysLeft <= 7 ? 'critical' : daysLeft <= 14 ? 'high' : 'medium';

    const urgencyStyles = {
        critical: 'from-red-900/30 to-transparent border-red-500/40 text-red-400',
        high: 'from-amber-900/30 to-transparent border-amber-500/40 text-amber-400',
        medium: 'from-blue-900/20 to-transparent border-blue-500/30 text-blue-400'
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <GlassCard
                className={cn(
                    "bg-gradient-to-r cursor-pointer hover:scale-[1.01] transition-transform",
                    urgencyStyles[urgency]
                )}
                onClick={onViewCompetition}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "p-3 rounded-xl border",
                            urgency === 'critical' ? "bg-red-500/20 border-red-500/30" :
                                urgency === 'high' ? "bg-amber-500/20 border-amber-500/30" :
                                    "bg-blue-500/20 border-blue-500/30"
                        )}>
                            <Swords className={cn(
                                "w-5 h-5",
                                urgency === 'critical' ? "text-red-400" :
                                    urgency === 'high' ? "text-amber-400" :
                                        "text-blue-400"
                            )} />
                        </div>
                        <div>
                            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-0.5">
                                Competition Mode
                            </div>
                            <div className="text-sm font-bold text-white">{eventName}</div>
                            <div className="text-xs text-white/50">{phase} Phase</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={cn("text-3xl font-bold font-mono", urgencyStyles[urgency])}>
                            {daysLeft}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-white/40">days</div>
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
};

// =====================================================
// MAIN TAB
// =====================================================

export const PerformanceTab = () => {
    const { state, dispatch, sync } = useSentient();
    const { performance, mindspace } = state;

    // Labs analysis from state
    const labs = performance.labs_output;

    // UI States
    const [isDataModalOpen, setIsDataModalOpen] = useState(false);
    const [isPRModalOpen, setIsPRModalOpen] = useState(false);
    const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
    const [isGoalSelectorOpen, setIsGoalSelectorOpen] = useState(false);
    const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
    const [isCompetitionModeOpen, setIsCompetitionModeOpen] = useState(false);

    // User's goal
    const [userGoal, setUserGoal] = useState<UserGoal>(
        state.user_profile?.user_goal || DEFAULT_USER_GOAL
    );
    const goalMeta = GOAL_METADATA[userGoal.primary];

    // Personal records (persisted)
    const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>(() => loadPersonalRecords());

    // Heatmap data
    const heatmapData = useMemo((): HeatmapDay[] => {
        const now = new Date();
        return Array.from({ length: 84 }, (_, i) => {
            const date = new Date(now);
            date.setDate(date.getDate() - (83 - i));
            const entries = (performance.history || []).filter(
                h => new Date(h.date).toDateString() === date.toDateString()
            );
            const sessionCount = entries.length;
            const avgLoad = sessionCount > 0 ? entries.reduce((sum, e) => sum + e.load_metric, 0) / sessionCount : 0;

            let intensity: HeatmapDay['intensity'] = 'none';
            if (sessionCount > 0) {
                if (avgLoad > 80) intensity = 'high';
                else if (avgLoad > 50) intensity = 'medium';
                else intensity = 'low';
            }

            return {
                date: date.toISOString().split('T')[0],
                intensity,
                sessionCount,
                domain: 'mixed' as const
            };
        });
    }, [performance.history]);

    // Calculate adaptation score
    const adaptationScore = useMemo(() => {
        const resilienceScore = labs?.resilience_profile?.resilience_score_0_100 || 70;
        const recoveryScore = state.recovery?.recovery_score || 75;
        const consistencyScore = labs?.behavior_and_interventions?.consistency_score_0_100 || 70;

        return Math.round((resilienceScore * 0.4 + recoveryScore * 0.3 + consistencyScore * 0.3));
    }, [labs, state.recovery]);

    // Determine status
    const getAdaptationStatus = (score: number) => {
        if (score >= 85) return 'excellent';
        if (score >= 70) return 'good';
        if (score >= 55) return 'warning';
        return 'critical';
    };

    // Quick stats
    const quickStats = useMemo(() => [
        {
            id: 'resilience',
            label: 'Resilience',
            value: Math.round(labs?.resilience_profile?.resilience_score_0_100 || 70),
            unit: '%',
            trend: labs?.resilience_profile?.trend === 'improving' ? 'up' as const : 'flat' as const,
            trendValue: labs?.resilience_profile?.trend === 'improving' ? '+5%' : '',
            status: 'good' as const
        },
        {
            id: 'recovery',
            label: 'Recovery',
            value: Math.round(state.recovery?.recovery_score || 78),
            unit: '%',
            trend: 'flat' as const,
            status: 'good' as const
        },
        {
            id: 'sessions',
            label: 'Sessions',
            value: performance.history?.length || 0,
            trend: undefined,
            trendValue: undefined,
            status: 'neutral' as const
        }
    ], [labs, state.recovery, performance.history]);

    // Handlers
    const handleGoalComplete = useCallback((newGoal: UserGoal) => {
        setUserGoal(newGoal);
        dispatch({ type: 'UPDATE_USER_PROFILE', payload: { user_goal: newGoal } });
        setIsGoalSelectorOpen(false);
        sync('goal_updated', { goal: newGoal });
    }, [dispatch, sync]);

    const handleLogData = useCallback((entry: LongitudinalEntry) => {
        const currentHistory = performance.history || [];
        dispatch({
            type: 'UPDATE_PERFORMANCE_STATE',
            payload: { history: [...currentHistory, entry] }
        });
        setIsDataModalOpen(false);
        sync('training_logged', entry);
    }, [dispatch, sync, performance.history]);

    const handleAddPR = useCallback((pr: Omit<PersonalRecord, 'id' | 'trend' | 'previousBest'>) => {
        const updatedRecords = addPRToStore(pr, personalRecords);
        setPersonalRecords(updatedRecords);
        setIsPRModalOpen(false);
        sync('pr_added', updatedRecords[0]);
    }, [sync, personalRecords]);

    const handleTargetSave = useCallback((target: {
        name: string;
        date: string;
        priority: 'A' | 'B' | 'C';
        start_date: string;
    }) => {
        dispatch({
            type: 'UPDATE_PERFORMANCE_STATE',
            payload: {
                target_event: target
            }
        });
        setIsTargetModalOpen(false);
        sync('target_acquired', target);
    }, [dispatch, sync]);

    // =====================================================
    // CONTEXTUAL FEATURES - Show based on state
    // =====================================================

    // Ghost Coach message (from labs communication)
    const ghostMessage = useMemo(() => {
        const insights = labs?.communication?.summary || [];
        if (insights.length > 0) {
            return {
                message: insights[0],
                insight: labs?.behavior_and_interventions?.consistency_notes?.[0]
            };
        }
        return null;
    }, [labs]);

    // Competition countdown (show when target exists and < 21 days)
    const competitionData = useMemo(() => {
        if (!performance.target_event) return null;
        const daysLeft = Math.ceil(
            (new Date(performance.target_event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        if (daysLeft > 21 || daysLeft < 0) return null;
        return {
            eventName: performance.target_event.name,
            daysLeft,
            phase: labs?.tournament_intelligence?.current_phase || performance.macro_phase
        };
    }, [performance.target_event, performance.macro_phase, labs]);

    // Convergence patterns (show when patterns detected)
    const activePatterns = useMemo(() => {
        return labs?.convergence_patterns?.patterns_detected?.filter(p => p.active) || [];
    }, [labs]);

    // =====================================================
    // DEEP ANALYTICS - 6 TABS
    // =====================================================

    const analyticsTabs = useMemo(() => [
        {
            id: 'overview',
            label: 'Overview',
            icon: <BarChart2 className="w-4 h-4" />,
            content: (
                <div className="space-y-6">
                    {/* Resilience Profile Summary */}
                    <GlassCard>
                        <div className="flex items-center gap-2 mb-4">
                            <Shield className="w-4 h-4 text-emerald-400" />
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                Resilience Profile
                            </h3>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-emerald-400">
                                    {labs?.resilience_profile?.resilience_score_0_100 || 70}
                                </div>
                                <div className="text-[10px] text-white/40 uppercase">Score</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {labs?.resilience_profile?.avg_recovery_time_days?.toFixed(1) || '2.0'}d
                                </div>
                                <div className="text-[10px] text-white/40 uppercase">Avg Recovery</div>
                            </div>
                            <div>
                                <div className={cn(
                                    "text-2xl font-bold",
                                    labs?.resilience_profile?.trend === 'improving' ? "text-green-400" :
                                        labs?.resilience_profile?.trend === 'declining' ? "text-red-400" : "text-white"
                                )}>
                                    {labs?.resilience_profile?.trend === 'improving' ? '↗' :
                                        labs?.resilience_profile?.trend === 'declining' ? '↘' : '→'}
                                </div>
                                <div className="text-[10px] text-white/40 uppercase">Trend</div>
                            </div>
                        </div>
                    </GlassCard>

                    <LoadCockpit />
                    <PatternDiscoveryCard />
                </div>
            )
        },
        {
            id: 'load',
            label: 'Load',
            icon: <LineChart className="w-4 h-4" />,
            content: (
                <div className="space-y-6">
                    <LoadCockpit />
                    {/* Could add BiPhasicChart here if available */}
                    <GlassCard>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                            Load vs Integrity Analysis
                        </h3>
                        <div className="text-sm text-white/60 text-center py-8">
                            Detailed bi-phasic charts available after 14+ sessions logged.
                        </div>
                    </GlassCard>
                </div>
            )
        },
        {
            id: 'training',
            label: 'Training',
            icon: <Activity className="w-4 h-4" />,
            content: (
                <div className="space-y-6">
                    <TrainingHeatmap data={heatmapData} weeks={12} />
                </div>
            )
        },
        {
            id: 'records',
            label: 'Records',
            icon: <Trophy className="w-4 h-4" />,
            content: (
                <div className="space-y-6">
                    <PRWall
                        records={personalRecords}
                        onAddNew={() => setIsPRModalOpen(true)}
                    />
                </div>
            )
        },
        {
            id: 'forecast',
            label: 'Forecast',
            icon: <TrendingUp className="w-4 h-4" />,
            content: (
                <div className="space-y-6">
                    <GlassCard>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                            <Compass className="w-4 h-4 text-cyan-400" />
                            Trajectory Analysis
                        </h3>
                        <div className="space-y-3">
                            {labs?.trajectory_and_ceiling?.metrics?.map((metric, i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                    <span className="text-sm text-white/60">{metric.name}</span>
                                    <div className="text-right">
                                        <span className="text-sm font-bold text-white">{metric.current_value}</span>
                                        <span className="text-xs text-white/40 ml-2">→ {metric.projected_value}</span>
                                    </div>
                                </div>
                            )) || (
                                    <div className="text-sm text-white/50 text-center py-4">
                                        Trajectory data builds over time.
                                    </div>
                                )}
                        </div>
                        {labs?.trajectory_and_ceiling?.global_commentary && (
                            <div className="mt-4 p-3 bg-white/5 rounded-lg text-sm text-white/70">
                                {labs.trajectory_and_ceiling.global_commentary}
                            </div>
                        )}
                    </GlassCard>
                </div>
            )
        },
        {
            id: 'events',
            label: 'Events',
            icon: <Flag className="w-4 h-4" />,
            content: (
                <div className="space-y-6">
                    {/* Tournament Intelligence */}
                    {labs?.tournament_intelligence?.next_competition && (
                        <GlassCard className="border-t-4 border-t-amber-500">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-4 flex items-center gap-2">
                                <Swords className="w-4 h-4" />
                                Next Competition
                            </h3>
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-lg font-bold text-white">
                                        {labs.tournament_intelligence.next_competition.name}
                                    </div>
                                    <div className="text-sm text-white/50">
                                        {labs.tournament_intelligence.current_phase} phase
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-amber-400 font-mono">
                                        {labs.tournament_intelligence.next_competition.days_to_competition}
                                    </div>
                                    <div className="text-[10px] text-white/40 uppercase">days</div>
                                </div>
                            </div>
                        </GlassCard>
                    )}

                    {/* Taper Checklist */}
                    {performance.taper_checklist && performance.taper_checklist.length > 0 && (
                        <GlassCard>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                                Taper Checklist
                            </h3>
                            <div className="space-y-2">
                                {performance.taper_checklist.map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 py-2">
                                        <div className={cn(
                                            "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                            item.completed
                                                ? "bg-emerald-500/20 border-emerald-500"
                                                : "border-white/30"
                                        )}>
                                            {item.completed && <Award className="w-3 h-3 text-emerald-400" />}
                                        </div>
                                        <span className={cn(
                                            "text-sm",
                                            item.completed ? "text-white/50 line-through" : "text-white"
                                        )}>
                                            {item.task}
                                        </span>
                                        <span className="text-[10px] text-white/30 uppercase ml-auto">
                                            {item.category}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    )}

                    {!labs?.tournament_intelligence?.next_competition && !performance.taper_checklist?.length && (
                        <div className="text-center py-12">
                            <Swords className="w-12 h-12 text-white/20 mx-auto mb-4" />
                            <div className="text-sm text-white/50">No upcoming events</div>
                            <div className="text-xs text-white/30 mt-1">Set a target to see competition planning</div>
                        </div>
                    )}
                </div>
            )
        },
        {
            id: 'season',
            label: 'Season',
            icon: <Calendar className="w-4 h-4" />,
            content: (
                <div className="space-y-6">
                    <PeriodizationTab />
                </div>
            )
        },
        {
            id: 'simulator',
            label: 'Simulator',
            icon: <Flame className="w-4 h-4" />,
            content: (
                <div className="space-y-6">
                    <SimulatorTab />
                </div>
            )
        }
    ], [heatmapData, personalRecords, labs, performance.taper_checklist]);

    // Check for alerts
    const hasLoadAlert = labs?.ripple_outputs?.risk_directive?.short_horizon_injury_risk_band === 'high';
    const hasPlateauAlert = labs?.plateau_and_stimulus?.is_plateau;

    return (
        <div className="pb-24 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                        <Microscope className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">
                            Performance Labs
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className={cn(
                                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border",
                                labs?.longitudinal_state?.label === 'adaptation'
                                    ? "bg-green-500/10 text-green-400 border-green-500/30"
                                    : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                            )}>
                                {labs?.longitudinal_state?.label || 'Building'} Phase
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setIsDataModalOpen(true)}
                    className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 transition-all active:scale-95"
                >
                    <div className="p-1 rounded-full bg-cyan-500/20 group-hover:bg-cyan-500 transition-colors">
                        <PlusCircle className="w-3 h-3 text-cyan-400 group-hover:text-cyan-950" />
                    </div>
                    <span className="text-xs font-bold text-white/80 group-hover:text-white uppercase tracking-wider">
                        Log Session
                    </span>
                </button>
            </div>

            {/* HERO CARD */}
            <HeroCard
                value={adaptationScore}
                unit="%"
                label="Adaptation Score"
                sublabel={`${goalMeta.name} Protocol • ${labs?.longitudinal_state?.label || 'Building'} Phase`}
                trend={adaptationScore > 75 ? 'up' : adaptationScore > 60 ? 'flat' : 'down'}
                trendValue={adaptationScore > 75 ? '+3%' : adaptationScore > 60 ? 'stable' : '-2%'}
                trendPeriod="vs last week"
                status={getAdaptationStatus(adaptationScore)}
                expandedContent={
                    <div className="space-y-4">
                        <QuickStatsRow stats={quickStats} columns={3} />
                        <div className="text-xs text-white/50 text-center">
                            Tap "Deep Analytics" for detailed charts and history
                        </div>
                    </div>
                }
                className="mb-6"
            />

            {/* TARGET CARD */}
            <div className="mb-6">
                <TargetCard
                    target={performance.target_event}
                    onAcquire={() => setIsTargetModalOpen(true)}
                    onEdit={() => setIsTargetModalOpen(true)}
                />
            </div>

            {/* SEASON PLANNING - PROMOTED FROM DEEP ANALYTICS */}
            <NavigationCard
                icon={<Calendar className="w-5 h-5" />}
                title="Season Planning"
                subtitle={`${performance.macro_phase || 'Build Phase'} • Periodization & Taper`}
                onClick={() => setIsAnalyticsOpen(true)}
                className="mb-6 border-l-4 border-l-indigo-500"
            />

            {/* TODAY'S PRIORITY */}
            <ContextualCard
                type="action"
                title="Today's Priority"
                description={labs?.communication?.headline || "Focus on quality over volume. Listen to your body."}
                action={{
                    label: "Log Session",
                    onClick: () => setIsDataModalOpen(true)
                }}
                className="mb-6"
            />

            {/* ALERTS (Only if issues exist) */}
            <AnimatePresence>
                {hasLoadAlert && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4"
                    >
                        <ContextualCard
                            type="alert"
                            title="High Load Detected"
                            description="ACWR approaching threshold. Consider a recovery day."
                            action={{
                                label: "View Recovery Options",
                                onClick: () => setIsAnalyticsOpen(true)
                            }}
                            onDismiss={() => { }}
                        />
                    </motion.div>
                )}

                {hasPlateauAlert && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4"
                    >
                        <ContextualCard
                            type="insight"
                            title="Plateau Detected"
                            description="Progress stalling. Time to change stimulus."
                            action={{
                                label: "View Suggestions",
                                onClick: () => setIsAnalyticsOpen(true)
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* COMPETITION BANNER (when < 21 days to event) */}
            {competitionData && (
                <div className="mb-6">
                    <CompetitionBanner
                        eventName={competitionData.eventName}
                        daysLeft={competitionData.daysLeft}
                        phase={competitionData.phase}
                        onViewCompetition={() => setIsCompetitionModeOpen(true)}
                    />
                </div>
            )}

            {/* GHOST COACH (Supportive insights - not commands) */}
            <AnimatePresence>
                {ghostMessage && (
                    <div className="mb-6">
                        <GhostCoachCard
                            message={ghostMessage.message}
                            insight={ghostMessage.insight}
                        />
                    </div>
                )}
            </AnimatePresence>

            {/* CONVERGENCE PATTERNS (when detected) */}
            <AnimatePresence>
                {activePatterns.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-6 space-y-3"
                    >
                        {activePatterns.slice(0, 2).map((pattern, i) => (
                            <ContextualCard
                                key={i}
                                type="insight"
                                title={pattern.name}
                                description={pattern.recommended_response?.[0] || "Pattern detected in your training."}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* NAVIGATION TO DEEP ANALYTICS */}
            <NavigationCard
                icon={<BarChart2 className="w-5 h-5" />}
                title="Deep Analytics"
                subtitle="Load, training, records, forecast, events"
                onClick={() => setIsAnalyticsOpen(true)}
                className="mb-4"
            />

            {/* Competition Mode (when target exists) */}
            {performance.target_event && (
                <NavigationCard
                    icon={<Swords className="w-5 h-5" />}
                    title="Competition Mode"
                    subtitle={`${performance.target_event.name} prep`}
                    onClick={() => setIsCompetitionModeOpen(true)}
                    className="mb-4"
                />
            )}

            {/* Goal Change */}
            <NavigationCard
                icon={<Target className="w-5 h-5" />}
                title="Change Goal"
                subtitle={`Current: ${goalMeta.name}`}
                onClick={() => setIsGoalSelectorOpen(true)}
            />

            {/* DEEP ANALYTICS FULL SCREEN */}
            <DeepAnalyticsScreen
                isOpen={isAnalyticsOpen}
                onClose={() => setIsAnalyticsOpen(false)}
                title="Deep Analytics"
                tabs={analyticsTabs}
            />

            {/* MODALS */}
            {isDataModalOpen && (
                <DataEntryModal
                    onSave={handleLogData}
                    onClose={() => setIsDataModalOpen(false)}
                />
            )}

            <PREntryModal
                isOpen={isPRModalOpen}
                onClose={() => setIsPRModalOpen(false)}
                onSave={handleAddPR}
            />

            <TargetAcquisitionModal
                isOpen={isTargetModalOpen}
                onClose={() => setIsTargetModalOpen(false)}
                onSave={handleTargetSave}
                currentTarget={performance.target_event}
            />

            {isGoalSelectorOpen && (
                <GoalSelector
                    currentGoal={userGoal}
                    onComplete={handleGoalComplete}
                    onCancel={() => setIsGoalSelectorOpen(false)}
                />
            )}

            {/* COMPETITION FOCUS MODE */}
            {competitionData && (
                <CompetitionFocusScreen
                    isOpen={isCompetitionModeOpen}
                    onClose={() => setIsCompetitionModeOpen(false)}
                    eventName={competitionData.eventName}
                    eventDate={performance.target_event?.date || ''}
                    daysLeft={competitionData.daysLeft}
                    phase={competitionData.phase}
                    taperChecklist={performance.taper_checklist?.map((t, i) => ({
                        id: `taper-${i}`,
                        task: t.task,
                        category: t.category,
                        completed: t.completed,
                        daysBeforeEvent: competitionData.daysLeft
                    }))}
                    onToggleTaperTask={(index) => {
                        dispatch({ type: 'TOGGLE_TAPER_TASK', payload: index });
                    }}
                />
            )}
        </div>
    );
};

export default PerformanceTab;
