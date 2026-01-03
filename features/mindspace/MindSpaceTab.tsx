/**
 * MindspaceTab v2.0
 * 
 * Complete overhaul with:
 * - 15 breathwork protocols (4 tiers)
 * - 12 emotion regulation tools
 * - HRV biofeedback (simulated)
 * - Personalized recommendations
 * - Structured journaling
 * - Competition mental prep
 */

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Brain, Zap, Wind, AlertTriangle, ShieldAlert,
    Sparkles, Play, MessageSquare, Loader2,
    TrendingUp, Activity, HeartPulse, Moon,
    Target, Eye, Clock, Flame, ChevronRight,
    Heart, Trophy, RefreshCw, BookOpen, Star
} from "lucide-react";
import { GlassCard, Button, Badge, cn } from "../../components/ui";
import { useSentient } from "../../store/SentientContext";
import { MentalStateVector, StateDiagnosis } from "../../types";
import { JournalAnalysisEngine } from "../../experts/mental/engines/journalAnalysisEngine";

// New V2 Components
import { BreathworkSession } from "../../components/mindspace/BreathworkSession";
import { EmotionToolCard, QuickEmotionPicker } from "../../components/mindspace/EmotionToolCard";
import { JournalPrompts, JournalContextPicker, JournalContext } from "../../components/mindspace/JournalPrompts";
import { ImprovementGoalInput } from "../../components/mindspace/ImprovementGoalInput";
import { MotivationalCard } from "../../components/mindspace/MotivationalCard";

// New Engines
import {
    BREATHWORK_PROTOCOLS,
    getProtocolsByTier,
    getRecommendedProtocol,
    BreathworkProtocol,
    BreathworkTier
} from "../../experts/mental/BreathworkDatabase";
import {
    EMOTION_REGULATION_TOOLKIT,
    getRecommendedTool,
    getToolById,
    EmotionCategory,
    EmotionRegulationTool
} from "../../experts/mental/EmotionRegulationToolkit";
import {
    MindspacePersonalizationEngine,
    createDefaultProfile
} from "../../experts/mental/MindspacePersonalizationEngine";
import {
    CompetitionMentalPrepEngine
} from "../../experts/mental/CompetitionMentalPrepEngine";
import {
    MotivationEngine,
    ImprovementGoal,
    MotivationalCard as MotivationalCardType
} from "../../experts/mental/MotivationEngine";

// Legacy Components (still used)
import { CognitiveSuite } from "./CognitiveSuite";
import { WebGLNebula } from "./Nebula";

// Import shared design system components
import { HeroMetricCard } from "../../ui/shared/HeroMetricCard";
import { QuickStatsRow } from "../../ui/shared/QuickStatsRow";
// TYPES
// =====================================================

type TabView = 'dashboard' | 'breathwork' | 'emotions' | 'cognitive' | 'journal' | 'competition';

// =====================================================
// UTILS
// =====================================================

const diagnoseMentalState = (state: MentalStateVector): StateDiagnosis => {
    if (state.autonomic_balance < -5) return { primary_state: "overdrive", confidence: 0.9, root_cause: "Sympathetic Dominance", urgency: "high" };
    if (state.autonomic_balance > 7) return { primary_state: "collapse", confidence: 0.8, root_cause: "Parasympathetic Shut-down", urgency: "medium" };
    if (state.cognitive_load >= 8) return { primary_state: "overload", confidence: 0.75, root_cause: "Working Memory Saturation", urgency: "high" };
    return { primary_state: "optimal", confidence: 1.0, root_cause: "Balanced State", urgency: "low" };
};

// =====================================================
// BREATHWORK TIER CARD
// =====================================================

const BreathworkTierSection = ({
    tier,
    title,
    protocols,
    onSelect
}: {
    tier: BreathworkTier;
    title: string;
    protocols: BreathworkProtocol[];
    onSelect: (id: string) => void;
}) => {
    const tierColors = {
        0: 'border-red-500/50',
        1: 'border-green-500/50',
        2: 'border-cyan-500/50',
        3: 'border-purple-500/50'
    };

    return (
        <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                <Wind className="w-3 h-3" />
                {title}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {protocols.map(protocol => (
                    <GlassCard
                        key={protocol.id}
                        className={cn(
                            "p-4 cursor-pointer hover:bg-white/10 transition-all border-l-4",
                            tierColors[tier]
                        )}
                        onClick={() => onSelect(protocol.id)}
                    >
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">{protocol.emoji}</span>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-white truncate">{protocol.name}</div>
                                <div className="text-xs text-white/50 line-clamp-1">{protocol.description}</div>
                                <div className="flex items-center gap-2 mt-2 text-[10px] text-white/40">
                                    <Clock className="w-3 h-3" />
                                    {protocol.duration_minutes} min
                                    <Badge className={cn(
                                        "text-[8px] ml-auto",
                                        protocol.primary_effect === 'calming' ? 'bg-green-500/20 text-green-400' :
                                            protocol.primary_effect === 'activating' ? 'bg-orange-500/20 text-orange-400' :
                                                'bg-cyan-500/20 text-cyan-400'
                                    )}>
                                        {protocol.primary_effect}
                                    </Badge>
                                </div>
                            </div>
                            <Play className="w-4 h-4 text-white/30 flex-shrink-0 mt-2" />
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};

// =====================================================
// QUICK ACTION BUTTONS
// =====================================================

const QuickActions = ({
    stressLevel,
    onBreathwork,
    onEmotion
}: {
    stressLevel: number;
    onBreathwork: (id: string) => void;
    onEmotion: (emotion: string) => void;
}) => {
    const actions = [
        { id: 'stressed', emoji: '😤', label: 'Stressed', action: () => onBreathwork('physiological_sigh'), color: 'bg-red-500/20' },
        { id: 'tired', emoji: '😴', label: 'Tired', action: () => onBreathwork('activation_ladder'), color: 'bg-purple-500/20' },
        { id: 'anxious', emoji: '😰', label: 'Anxious', action: () => onEmotion('anxiety'), color: 'bg-orange-500/20' },
        { id: 'focus', emoji: '🎯', label: 'Need Focus', action: () => onBreathwork('coherence_breathing'), color: 'bg-cyan-500/20' }
    ];

    return (
        <div className="grid grid-cols-4 gap-2 mb-8">
            {actions.map(action => (
                <button
                    key={action.id}
                    onClick={action.action}
                    className={cn(
                        "flex flex-col items-center p-3 rounded-xl border border-white/10",
                        action.color, "hover:scale-105 transition-transform"
                    )}
                >
                    <span className="text-2xl mb-1">{action.emoji}</span>
                    <span className="text-[10px] text-white/70">{action.label}</span>
                </button>
            ))}
        </div>
    );
};

// =====================================================
// TAB NAVIGATION
// =====================================================

const TabNav = ({
    active,
    onChange
}: {
    active: TabView;
    onChange: (tab: TabView) => void;
}) => {
    const tabs: { id: TabView; label: string; icon: React.ElementType }[] = [
        { id: 'dashboard', label: 'Dashboard', icon: Brain },
        { id: 'breathwork', label: 'Breathwork', icon: Wind },
        { id: 'emotions', label: 'Emotions', icon: Heart },
        { id: 'cognitive', label: 'Training', icon: Zap },
        { id: 'journal', label: 'Journal', icon: BookOpen },
        { id: 'competition', label: 'Event Prep', icon: Trophy }
    ];

    return (
        <div className="flex gap-1 mb-6 overflow-x-auto pb-2 -mx-4 px-4">
            {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                            active === tab.id
                                ? "bg-primary text-black"
                                : "bg-white/5 text-white/60 hover:bg-white/10"
                        )}
                    >
                        <Icon className="w-3 h-3" />
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
};

// =====================================================
// RECOMMENDED PROTOCOL CARD
// =====================================================

const RecommendedProtocolCard = ({
    protocol,
    reason,
    onStart
}: {
    protocol: BreathworkProtocol | null;
    reason: string;
    onStart: () => void;
}) => {
    if (!protocol) return null;

    return (
        <GlassCard className="p-5 border-l-4 border-l-primary mb-6 bg-primary/5">
            <div className="flex items-start gap-4">
                <div className="text-4xl">{protocol.emoji}</div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-primary uppercase tracking-wider">Recommended Now</span>
                        <Sparkles className="w-3 h-3 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg text-white mb-1">{protocol.name}</h3>
                    <p className="text-sm text-white/60 mb-3">{reason}</p>
                    <Button size="sm" onClick={onStart}>
                        <Play className="w-3 h-3 mr-2" />
                        Start {protocol.duration_minutes} min session
                    </Button>
                </div>
            </div>
        </GlassCard>
    );
};

// =====================================================
// STREAK & STATS CARD
// =====================================================

const StatsCard = ({
    streak,
    totalSessions,
    totalMinutes
}: {
    streak: number;
    totalSessions: number;
    totalMinutes: number;
}) => (
    <GlassCard className="p-4 mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
            <div>
                <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                    <Flame className="w-5 h-5" />
                    {streak}
                </div>
                <div className="text-[10px] text-white/50 uppercase">Day Streak</div>
            </div>
            <div>
                <div className="text-2xl font-bold text-white">{totalSessions}</div>
                <div className="text-[10px] text-white/50 uppercase">Sessions</div>
            </div>
            <div>
                <div className="text-2xl font-bold text-white">{totalMinutes}</div>
                <div className="text-[10px] text-white/50 uppercase">Minutes</div>
            </div>
        </div>
    </GlassCard>
);

// =====================================================
// MAIN COMPONENT
// =====================================================

export const MindSpaceTab = () => {
    const { state, dispatch, sync } = useSentient();
    const { mindspace } = state;

    // Tab state
    const [activeTab, setActiveTab] = useState<TabView>('dashboard');

    // Session states
    const [activeBreathwork, setActiveBreathwork] = useState<string | null>(null);
    const [activeTest, setActiveTest] = useState<string | null>(null);
    const [journalContext, setJournalContext] = useState<JournalContext | null>(null);
    const [showEmotionPicker, setShowEmotionPicker] = useState(false);
    const [activeEmotionTool, setActiveEmotionTool] = useState<EmotionRegulationTool | null>(null);

    // Motivation state
    const [improvementGoals, setImprovementGoals] = useState<ImprovementGoal[]>([]);
    const [motivationCard, setMotivationCard] = useState<MotivationalCardType | null>(() =>
        MotivationEngine.getMorningCard([], [])
    );

    // Personalization (in real app, would be persisted)
    const [personalization] = useState(() => {
        const engine = new MindspacePersonalizationEngine(createDefaultProfile('user'));
        return engine;
    });
    const profile = personalization.getProfile();

    // Derived state
    const mentalState = mindspace.state_vector;
    const diagnosis = useMemo(() => diagnoseMentalState(mentalState), [mentalState]);

    // Recommended protocol based on current state
    const recommendedProtocol = useMemo(() => {
        const hoursToSleep = 8; // Would come from timeline
        return getRecommendedProtocol({
            stress: mentalState.stress,
            fatigue: mentalState.cognitive_load,
            arousal_needed: mentalState.stress > 7 ? 'low' : 'medium',
            time_available_minutes: 10,
            hours_to_event: state.performance.competition_countdown > 0
                ? state.performance.competition_countdown * 24 : undefined
        });
    }, [mentalState, state.performance.competition_countdown]);

    // Get protocols by tier
    const emergencyProtocols = useMemo(() => getProtocolsByTier(0), []);
    const foundationProtocols = useMemo(() => getProtocolsByTier(1), []);
    const performanceProtocols = useMemo(() => getProtocolsByTier(2), []);
    const recoveryProtocols = useMemo(() => getProtocolsByTier(3), []);

    // Handlers
    const handleBreathworkComplete = useCallback((summary: any) => {
        // Update state after session
        const newVector = { ...mentalState };
        newVector.autonomic_balance = Math.min(10, newVector.autonomic_balance + 2);
        newVector.stress = Math.max(1, newVector.stress - 2);
        dispatch({ type: 'UPDATE_MINDSPACE_STATE_VECTOR', payload: { state_vector: newVector } });

        // Log for personalization
        personalization.logProtocolUsage({
            protocol_id: summary.protocol_id,
            protocol_type: 'breathwork',
            timestamp: new Date(),
            duration_minutes: summary.duration_seconds / 60,
            completed: summary.completed,
            effectiveness_score: summary.average_coherence,
            stress_before: mentalState.stress,
            stress_after: Math.max(1, mentalState.stress - 2)
        });

        setActiveBreathwork(null);
        sync('breathwork_session_completed', summary);
    }, [mentalState, dispatch, personalization, sync]);

    const handleEmotionSelect = useCallback((emotion: string, intensity: number) => {
        const tool = getRecommendedTool(
            emotion as EmotionCategory,
            intensity,
            true,  // can be private
            profile.total_sessions >= 10
        );

        if (tool) {
            setShowEmotionPicker(false);
            setActiveEmotionTool(tool);  // Open the tool!
        }
    }, [profile.total_sessions]);

    const handleGoalAdded = useCallback((goal: ImprovementGoal) => {
        setImprovementGoals(prev => [...prev, goal].slice(-3));  // Max 3 goals
        // Refresh motivation card
        setMotivationCard(MotivationEngine.getMorningCard([...improvementGoals, goal], []));
    }, [improvementGoals]);

    const handleRefreshMotivation = useCallback(() => {
        setMotivationCard(MotivationEngine.getMorningCard(improvementGoals,
            motivationCard ? [motivationCard.quote.id] : []
        ));
    }, [improvementGoals, motivationCard]);

    const handleJournalComplete = useCallback((entries: any[]) => {
        // Analyze the combined text
        const fullText = entries.map(e => e.response).join(' ');
        const analysis = JournalAnalysisEngine.analyze(fullText);

        if (analysis) {
            const newVector = { ...mentalState };
            const sentimentMod = analysis.sentiment === 'Positive' ? 1 : analysis.sentiment === 'Negative' ? -1 : 0;
            newVector.autonomic_balance = Math.max(-10, Math.min(10,
                newVector.autonomic_balance + sentimentMod
            ));
            dispatch({
                type: 'UPDATE_MINDSPACE_STATE_VECTOR',
                payload: { state_vector: newVector, journal_last_entry: fullText }
            });
        }

        setJournalContext(null);
    }, [mentalState, dispatch]);

    const handleTestComplete = useCallback((result: any) => {
        const updatedScores = {
            ...mindspace.cognitive_scores,
            [activeTest === 'reaction' ? 'reaction_time' : activeTest === 'memory' ? 'memory_span' : 'focus_density']: result.score
        };

        dispatch({
            type: 'UPDATE_MINDSPACE_STATE_VECTOR',
            payload: { cognitive_scores: updatedScores }
        });

        setActiveTest(null);
        sync('cognitive_test_completed', { testId: activeTest, result: result.score });
    }, [activeTest, mindspace.cognitive_scores, dispatch, sync]);

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="relative pb-24 min-h-[600px] animate-in fade-in duration-500">
            {/* Background */}
            <div className="absolute inset-0 -z-10 opacity-20 pointer-events-none">
                <WebGLNebula state={diagnosis.primary_state === 'overdrive' ? 'anxious' : 'idle'} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Brain className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold gradient-text">MindSpace</h2>
                </div>
                <Badge className={cn("text-[10px]",
                    diagnosis.primary_state === 'optimal' ? "bg-primary/20 text-primary" : "bg-red-500/20 text-red-400"
                )}>
                    {diagnosis.primary_state.toUpperCase()}
                </Badge>
            </div>

            {/* Tab Navigation */}
            <TabNav active={activeTab} onChange={setActiveTab} />

            {/* =====================================================
                DASHBOARD VIEW
            ===================================================== */}
            {activeTab === 'dashboard' && (
                <>
                    {/* MENTAL CLARITY - HERO CARD */}
                    <HeroMetricCard
                        icon={Brain}
                        label="Mental Clarity"
                        value={Math.round(100 - mentalState.stress * 8 - mentalState.cognitive_load * 3)}
                        unit="%"
                        status={
                            diagnosis.primary_state === 'optimal' ? 'excellent' :
                                diagnosis.urgency === 'low' ? 'good' :
                                    diagnosis.urgency === 'medium' ? 'moderate' : 'warning'
                        }
                        trend={mentalState.stress < 5 ? 'up' : 'stable'}
                        trendValue={diagnosis.root_cause}
                        insight={
                            diagnosis.primary_state === 'optimal'
                                ? "Mind is clear. Great conditions for focus work."
                                : diagnosis.urgency === 'high'
                                    ? "High stress detected. Regulation recommended."
                                    : "Some mental load. Consider a breathing session."
                        }
                        className="mb-6"
                    />

                    {/* Quick Actions */}
                    <QuickActions
                        stressLevel={mentalState.stress}
                        onBreathwork={setActiveBreathwork}
                        onEmotion={(emotion) => {
                            setShowEmotionPicker(true);
                        }}
                    />

                    {/* Diagnosis Alert */}
                    {diagnosis.primary_state !== 'optimal' && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="mb-6"
                        >
                            <GlassCard className="border-l-4 border-l-red-500 bg-red-950/10">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-red-500/20 rounded-full">
                                        <ShieldAlert className="w-6 h-6 text-red-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white">{diagnosis.root_cause}</h3>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            Performance may be impacted. Immediate regulation recommended.
                                        </p>
                                        <Button
                                            size="sm"
                                            className="bg-red-600 hover:bg-red-500 text-white"
                                            onClick={() => setActiveBreathwork('physiological_sigh')}
                                        >
                                            <Play className="w-4 h-4 mr-2" /> Quick Reset (1 min)
                                        </Button>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}

                    {/* Recommended Protocol */}
                    <RecommendedProtocolCard
                        protocol={recommendedProtocol}
                        reason="Based on your current stress level and time of day"
                        onStart={() => recommendedProtocol && setActiveBreathwork(recommendedProtocol.id)}
                    />

                    {/* Stats */}
                    <StatsCard
                        streak={profile.current_streak_days}
                        totalSessions={profile.total_sessions}
                        totalMinutes={profile.total_minutes}
                    />

                    {/* Motivational Card */}
                    {motivationCard && (
                        <MotivationalCard
                            card={motivationCard}
                            onDismiss={() => setMotivationCard(null)}
                            onRefresh={handleRefreshMotivation}
                            showTip={true}
                        />
                    )}

                    {/* Quick Protocol Access */}
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                        <Sparkles className="w-3 h-3" />
                        Emergency Protocols
                    </h3>
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {emergencyProtocols.map(protocol => (
                            <GlassCard
                                key={protocol.id}
                                className="p-3 cursor-pointer hover:bg-white/10 transition-all text-center"
                                onClick={() => setActiveBreathwork(protocol.id)}
                            >
                                <span className="text-2xl block mb-1">{protocol.emoji}</span>
                                <span className="text-xs text-white/80">{protocol.name}</span>
                                <span className="text-[10px] text-white/40 block">{protocol.duration_minutes} min</span>
                            </GlassCard>
                        ))}
                    </div>
                </>
            )}

            {/* =====================================================
                BREATHWORK VIEW
            ===================================================== */}
            {activeTab === 'breathwork' && (
                <>
                    <BreathworkTierSection
                        tier={0}
                        title="Tier 0: Emergency (1-2 min)"
                        protocols={emergencyProtocols}
                        onSelect={setActiveBreathwork}
                    />
                    <BreathworkTierSection
                        tier={1}
                        title="Tier 1: Foundation (3-5 min)"
                        protocols={foundationProtocols}
                        onSelect={setActiveBreathwork}
                    />
                    <BreathworkTierSection
                        tier={2}
                        title="Tier 2: Performance (5-10 min)"
                        protocols={performanceProtocols}
                        onSelect={setActiveBreathwork}
                    />
                    <BreathworkTierSection
                        tier={3}
                        title="Tier 3: Deep Recovery (10+ min)"
                        protocols={recoveryProtocols}
                        onSelect={setActiveBreathwork}
                    />
                </>
            )}

            {/* =====================================================
                EMOTIONS VIEW
            ===================================================== */}
            {activeTab === 'emotions' && (
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                        <Heart className="w-3 h-3" />
                        How are you feeling?
                    </h3>

                    <QuickEmotionPicker onEmotionSelect={handleEmotionSelect} />

                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-8 mb-4 flex items-center gap-2">
                        <BookOpen className="w-3 h-3" />
                        Regulation Toolkit
                    </h3>

                    <div className="space-y-3">
                        {EMOTION_REGULATION_TOOLKIT.slice(0, 6).map(tool => (
                            <EmotionToolCard
                                key={tool.id}
                                tool={tool}
                                compact
                                onComplete={(tool, rating) => {
                                    personalization.logProtocolUsage({
                                        protocol_id: tool.id,
                                        protocol_type: 'emotion',
                                        timestamp: new Date(),
                                        duration_minutes: tool.duration_minutes,
                                        completed: true,
                                        effectiveness_score: rating * 20,
                                        user_rating: rating
                                    });
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* =====================================================
                COGNITIVE VIEW
            ===================================================== */}
            {activeTab === 'cognitive' && (
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        Cognitive Training
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {['reaction', 'memory', 'focus'].map(testId => {
                            const testInfo: any = {
                                reaction: { emoji: '⚡', name: 'Reaction Test', desc: 'CNS Speed' },
                                memory: { emoji: '🧠', name: 'Memory Test', desc: 'Working Memory' },
                                focus: { emoji: '👁️', name: 'Focus Test', desc: 'Sustained Attention' }
                            };
                            const info = testInfo[testId];

                            return (
                                <GlassCard
                                    key={testId}
                                    className="p-4 cursor-pointer hover:bg-white/10 transition-all"
                                    onClick={() => setActiveTest(testId)}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{info.emoji}</span>
                                        <div className="flex-1">
                                            <div className="font-medium text-white">{info.name}</div>
                                            <div className="text-xs text-white/50">{info.desc}</div>
                                        </div>
                                        <Play className="w-4 h-4 text-white/30" />
                                    </div>
                                </GlassCard>
                            );
                        })}
                    </div>

                    {/* Scores */}
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-8 mb-4">
                        Your Baselines
                    </h4>
                    <GlassCard className="p-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-mono text-cyan-400">
                                    {mindspace.cognitive_scores.reaction_time || '—'}
                                </div>
                                <div className="text-[10px] text-white/50">Reaction (ms)</div>
                            </div>
                            <div>
                                <div className="text-2xl font-mono text-purple-400">
                                    {mindspace.cognitive_scores.memory_span || '—'}
                                </div>
                                <div className="text-[10px] text-white/50">Memory Span</div>
                            </div>
                            <div>
                                <div className="text-2xl font-mono text-amber-400">
                                    {mindspace.cognitive_scores.focus_density ? `${mindspace.cognitive_scores.focus_density}%` : '—'}
                                </div>
                                <div className="text-[10px] text-white/50">Focus</div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* =====================================================
                JOURNAL VIEW
            ===================================================== */}
            {activeTab === 'journal' && !journalContext && (
                <JournalContextPicker
                    onSelect={setJournalContext}
                    suggestedContext={
                        new Date().getHours() < 12 ? 'daily_morning' :
                            new Date().getHours() > 20 ? 'daily_evening' :
                                'pre_session'
                    }
                />
            )}

            {activeTab === 'journal' && journalContext && (
                <JournalPrompts
                    context={journalContext}
                    onSubmit={handleJournalComplete}
                    onSkip={() => setJournalContext(null)}
                />
            )}

            {/* =====================================================
                COMPETITION VIEW
            ===================================================== */}
            {activeTab === 'competition' && (
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                        <Trophy className="w-3 h-3" />
                        Event Mental Prep
                    </h3>

                    {state.performance.competition_countdown > 0 ? (
                        <div>
                            <GlassCard className="p-6 text-center mb-6 border-l-4 border-l-primary">
                                <div className="text-5xl font-bold text-primary mb-2">
                                    {state.performance.competition_countdown}
                                </div>
                                <div className="text-sm text-white/60">Days to Event</div>
                            </GlassCard>

                            {/* Would show competition prep timeline here */}
                            <p className="text-sm text-white/50 text-center">
                                Mental prep timeline available when event is set.
                            </p>
                        </div>
                    ) : (
                        <GlassCard className="p-6 text-center">
                            <Trophy className="w-12 h-12 text-white/20 mx-auto mb-4" />
                            <h4 className="font-bold text-white mb-2">No Event Scheduled</h4>
                            <p className="text-sm text-white/50 mb-4">
                                Add an event to your timeline to unlock D-7 to D-Day mental prep.
                            </p>
                            <Button variant="outline" size="sm">
                                Add Event
                            </Button>
                        </GlassCard>
                    )}
                </div>
            )}

            {/* =====================================================
                MODALS
            ===================================================== */}
            <AnimatePresence>
                {activeBreathwork && (
                    <BreathworkSession
                        protocolId={activeBreathwork}
                        onClose={() => setActiveBreathwork(null)}
                        onComplete={handleBreathworkComplete}
                        showBiofeedback={true}
                    />
                )}

                {activeTest && (
                    <CognitiveSuite
                        type={activeTest as any}
                        onExit={() => setActiveTest(null)}
                        onComplete={handleTestComplete}
                    />
                )}

                {activeEmotionTool && (
                    <EmotionToolCard
                        tool={activeEmotionTool}
                        onComplete={(tool, rating) => {
                            personalization.logProtocolUsage({
                                protocol_id: tool.id,
                                protocol_type: 'emotion',
                                timestamp: new Date(),
                                duration_minutes: tool.duration_minutes,
                                completed: true,
                                effectiveness_score: rating * 20,
                                user_rating: rating
                            });
                            setActiveEmotionTool(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default MindSpaceTab;
