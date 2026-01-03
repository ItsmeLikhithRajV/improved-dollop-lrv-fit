
import React, { useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar, Loader2, Camera, Plus, Users, AlertTriangle, Zap, Sun, Moon, Coffee, Dumbbell,
    Target, Brain
} from "lucide-react";
import { GlassCard, Button, Badge, cn } from "../../components/ui";
import { useSentient } from "../../store/SentientContext";
import { Session, AnalysisPhase } from "../../types";
import { SessionEditorModal } from "./components/SessionEditorModal";
import { detectScheduleGroups, extractSessionsForContext } from "../../experts/orchestrator/ai";

import { TimelineProtocolCard } from "./TimelineProtocolCard";
import {
    getAdaptiveRecommendations
} from "../../experts/orchestrator/AdaptiveIntelligenceEngine";
import {
    ReadinessRing,
    CommanderActionCard,
    AlertBanner
} from "../commander/ActiveCommander";
import { ActionPriority } from "../../types/adaptive-intelligence";
import { generateUnifiedProtocol, UnifiedDayProtocol } from "../../experts/longevity/UnifiedTimelineProtocolEngine";
import { AdaptiveTimelineEngine, AdaptiveTimeline, ScheduledAction } from "../../experts/longevity/AdaptiveTimelineEngine";

// Import Expert Council
import { expertCouncil, CouncilRecommendation } from "../../experts";

export const TimelineTab = () => {
    const { state, sync, dispatch } = useSentient();
    const today = new Date();

    // Editor State
    const [editingSession, setEditingSession] = useState<Session | null>(null);

    // AI Upload State
    const [analysisPhase, setAnalysisPhase] = useState<AnalysisPhase>('idle');
    const [detectedGroups, setDetectedGroups] = useState<string[]>([]);
    const [scannedImage, setScannedImage] = useState<{ data: string, type: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- 1. INTELLIGENCE ENGINE INTEGRATION ---
    const intelligence = useMemo(() => {
        try {
            return getAdaptiveRecommendations(state.timeline.sessions);
        } catch (err) {
            console.warn('Adaptive Recommendations failed:', err);
            return undefined;
        }
    }, [state.timeline.sessions]);

    // --- NEW: UNIFIED PROTOCOL INTEGRATION ---
    const unifiedProtocol = useMemo(() => {
        try {
            return generateUnifiedProtocol(
                state.timeline?.sessions || [],
                {
                    goal: state.user_profile?.user_goal?.primary || 'longevity',
                    weight_kg: state.user_profile?.weight
                }
            );
        } catch (err) {
            console.warn('Unified Protocol generation failed:', err);
            return undefined;
        }
    }, [state.timeline?.sessions, state.user_profile, state.mindspace?.state_vector]);

    // --- NEW: ADAPTIVE TIMELINE (Relative Timing + Merged Sessions) ---
    const adaptiveTimeline = useMemo(() => {
        try {
            // Get today's training sessions
            const sessions = state.timeline?.sessions || [];
            const todaySession = sessions.find(s => s.time_of_day); // First session with time

            const anchors = AdaptiveTimelineEngine.getDefaultAnchors(
                state.user_profile,
                state.sleep,
                todaySession
            );

            // Pass ALL sessions to merge into unified timeline
            return AdaptiveTimelineEngine.generateTimeline(
                anchors,
                state.recovery?.recovery_score || 80,
                sessions // <-- Sessions now merged!
            );
        } catch (err) {
            console.warn('Adaptive Timeline generation failed:', err);
            return {
                anchors: {
                    chronotype: 'neutral',
                    typical_wake_time: '--:--',
                    typical_bed_time: '--:--',
                    has_training_today: false,
                    training_time: undefined
                },
                morning: [],
                midday: [],
                evening: [],
                wind_down: []
            };
        }
    }, [state.timeline?.sessions, state.user_profile, state.sleep, state.recovery?.recovery_score]);

    // --- NEW: EXPERT COUNCIL INTEGRATION ---
    // --- NEW: EXPERT COUNCIL INTEGRATION ---
    const expertTimeline = useMemo(() => {
        try {
            return expertCouncil.convene(state, state.user_profile || {} as any);
        } catch (err) {
            console.warn('Expert Council failed to convene:', err);
            return {
                recommendations: [],
                conflicts: [],
                unified_protocol: [],
                nutrition_plan: { meals: [] }
            };
        }
    }, [state, state.user_profile]);

    // Safely destructure intelligence with defaults for empty state
    const {
        state_summary = {
            overall_readiness: 0,
            status: 'unknown' as const,
            headline: 'Connect Your Data',
            subheadline: 'Sync wearables to see your readiness analysis'
        },
        commander_action = {
            id: 'empty',
            title: 'No Active Command',
            description: 'Connect your wearables to receive personalized recommendations',
            action_type: 'rest' as const,
            priority: 'low' as const,
            domain: 'recovery' as const,
            category: 'recovery' as const,
            suggested_time: '',
            duration_minutes: 0,
            impact: 'Connect wearables to see impact predictions',
            time_sensitivity: 'flexible' as const,
            rationale: {
                primary_reason: 'No data synced yet',
                supporting_signals: []
            },
            dismissable: true,
            source_expert: 'system' as const,
            protocols: [],
            source_engine: 'adaptive_intelligence',
            confidence: 0
        },
        upcoming_actions = [],
        alerts = [],
        timeline = []
    } = intelligence || {};

    // Map priority for colors
    const getPriorityColor = (priority: ActionPriority) => {
        switch (priority) {
            case 'critical': return 'text-red-400';
            case 'high': return 'text-orange-400';
            case 'medium': return 'text-primary';
            default: return 'text-white/40';
        }
    };

    // 2. Action Handlers (Legacy + New)
    const handleDeleteSession = (id: string) => {
        sync('session_deleted', { id });
        setEditingSession(null);
    };

    const handleAddSession = () => {
        const newSession: Session = {
            id: `manual-${Date.now()}`,
            type: 'sport',
            time_of_day: '09:00',
            sequence_block: 'morning',
            title: 'New Session',
            description: '',
            intensity: 'medium',
            duration_minutes: 60,
            mandatory: false,
            completed: false,
            notes: ''
        };
        setEditingSession(newSession);
    };

    const handleSaveNewOrUpdate = (id: string, updates: Partial<Session>) => {
        if (id.startsWith('manual-')) {
            const fullSession = { ...editingSession, ...updates } as Session;
            sync('session_added', fullSession);
        } else {
            sync('session_updated', { id, updates });
        }
        setEditingSession(null);
    };

    const handleEditProtocol = (protocolId: string) => {
        const session = state.timeline.sessions.find(s => s.id === protocolId);
        if (session) {
            setEditingSession(session);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAnalysisPhase('analyzing_structure');
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = (reader.result as string).replace("data:", "").replace(/^.+,/, "");
            setScannedImage({ data: base64String, type: file.type });
            const detectionResult = await detectScheduleGroups(base64String, file.type);
            if (detectionResult.hasMultipleGroups && detectionResult.groups.length > 0) {
                setDetectedGroups(detectionResult.groups);
                setAnalysisPhase('selecting_group');
            } else {
                await finalizeExtraction(base64String, file.type, "Default");
            }
        };
        reader.readAsDataURL(file);
    };

    const finalizeExtraction = async (base64Data: string, mimeType: string, group: string) => {
        setAnalysisPhase('extracting_sessions');
        const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const extractedSessions = await extractSessionsForContext(base64Data, mimeType, group, todayName);
        if (extractedSessions && extractedSessions.length > 0) {
            const newSessions = extractedSessions.map((s: any, idx: number) => ({ ...s, id: `ai-${Date.now()}-${idx}`, mandatory: false, completed: false, ai_extracted: true }));
            const updated = [...state.timeline.sessions, ...newSessions].sort((a, b) => (a.time_of_day || "").localeCompare(b.time_of_day || ""));
            dispatch({ type: 'UPDATE_TIMELINE', payload: updated });
            sync("schedule_uploaded");
        } else {
            alert("Sentient could not extract the schedule.");
        }
        setAnalysisPhase('idle');
        setScannedImage(null);
    };

    return (
        <div className="pb-24 animate-in fade-in duration-500 min-h-[600px] relative">

            {/* COMMANDER HEADER */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                        <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">
                            Commander
                        </h2>
                        <p className="text-sm text-white/40">Your day's mission control</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-mono font-bold text-white">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-xs text-white/40 uppercase">
                        {new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                </div>
            </div>

            <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleImageUpload} />

            <AnimatePresence>
                {editingSession && (
                    <SessionEditorModal
                        session={editingSession}
                        onSave={handleSaveNewOrUpdate}
                        onDelete={handleDeleteSession}
                        onClose={() => setEditingSession(null)}
                    />
                )}
                {analysisPhase === 'selecting_group' && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm bg-background border border-primary/30 rounded-2xl p-6 shadow-glow-primary text-center">
                            <Users className="w-10 h-10 text-primary mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">Select Your Track</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {detectedGroups.map(group => (
                                    <Button key={group} onClick={() => scannedImage && finalizeExtraction(scannedImage.data, scannedImage.type, group)} className="w-full justify-between" variant="outline">
                                        {group}
                                    </Button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 1. COMMANDER BRIEFING (TOP MOUNT) */}
            <div className="space-y-6 mb-8 mt-2">
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 flex-shrink-0">
                        <ReadinessRing
                            score={state_summary.overall_readiness}
                            status={state_summary.status}
                        />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">{state_summary.headline}</h3>
                        <p className="text-sm text-white/50">{state_summary.subheadline}</p>
                    </div>
                </div>

                {/* Main Commander Action */}
                <CommanderActionCard
                    action={commander_action}
                    onComplete={() => sync('protocol_completed', { id: commander_action.id })}
                    onSnooze={() => { }}
                    isMain={true}
                />

                {/* Active Alerts */}
                {alerts.length > 0 && (
                    <div className="space-y-2">
                        {alerts.map(alert => (
                            <AlertBanner key={alert.id} alert={alert} />
                        ))}
                    </div>
                )}

                {/* Note: Expert Council and Unified Protocol sections removed for cleaner UX */}
                {/* Command flow simplified: Readiness -> Main Action -> Alerts -> Day Timeline */}

                {/* UNIFIED PROTOCOL PREVIEW (NEW) */}
                {unifiedProtocol?.urgent_actions?.length > 0 && (
                    <GlassCard className="p-4 border-t-4 border-t-cyan-500/50">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 flex items-center gap-2">
                                <Zap className="w-3 h-3 text-cyan-400" />
                                Today's Protocols
                            </h4>
                            <Badge className={cn(
                                "text-[9px]",
                                unifiedProtocol?.mode === 'performance' ? "bg-orange-500/20 text-orange-400" : "bg-green-500/20 text-green-400"
                            )}>
                                {unifiedProtocol?.mode?.toUpperCase() || 'RECOVERY'} MODE
                            </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {unifiedProtocol?.urgent_actions?.slice(0, 4).map((action, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "p-2 rounded-lg border transition-colors",
                                        action.is_active ? "bg-cyan-500/10 border-cyan-500/30" : "bg-white/5 border-white/10"
                                    )}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">{action.emoji}</span>
                                        <span className="text-[10px] text-white/50 uppercase">{action.domain}</span>
                                    </div>
                                    <div className="text-xs font-medium text-white truncate">{action.title}</div>
                                    <div className="text-[10px] text-white/40">
                                        {action.window_start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {unifiedProtocol?.conflicts?.length > 0 && (
                            <div className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
                                ⚠️ {unifiedProtocol?.conflicts?.length} conflict(s) detected - {unifiedProtocol?.conflicts?.[0]}
                            </div>
                        )}
                    </GlassCard>
                )}

                {/* ADAPTIVE TIMELINE - Relative Timing */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-primary" />
                            Your Day (Personalized)
                        </h4>
                        <Badge className="text-[9px] bg-emerald-500/20 text-emerald-400">
                            {adaptiveTimeline.anchors.chronotype.toUpperCase()} TYPE
                        </Badge>
                    </div>

                    {/* Time Anchors Summary */}
                    <div className="flex items-center gap-4 text-xs text-white/40">
                        <span className="flex items-center gap-1">
                            <Sun className="w-3 h-3 text-amber-400" />
                            Wake: {adaptiveTimeline.anchors.typical_wake_time}
                        </span>
                        {adaptiveTimeline.anchors.has_training_today && (
                            <span className="flex items-center gap-1">
                                <Dumbbell className="w-3 h-3 text-orange-400" />
                                Train: {adaptiveTimeline.anchors.training_time || 'Scheduled'}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Moon className="w-3 h-3 text-indigo-400" />
                            Sleep: {adaptiveTimeline.anchors.typical_bed_time}
                        </span>
                    </div>

                    {/* Day Segments */}
                    {[
                        { label: 'Morning', icon: Sun, color: 'text-amber-400', items: adaptiveTimeline.morning },
                        { label: 'Midday', icon: Coffee, color: 'text-cyan-400', items: adaptiveTimeline.midday },
                        { label: 'Evening', icon: Moon, color: 'text-indigo-400', items: adaptiveTimeline.evening },
                        { label: 'Wind Down', icon: Moon, color: 'text-purple-400', items: adaptiveTimeline.wind_down }
                    ].map(segment => segment.items.length > 0 && (
                        <div key={segment.label} className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                                <segment.icon className={cn("w-3 h-3", segment.color)} />
                                {segment.label}
                            </div>
                            <div className="space-y-1">
                                {segment.items.map((action: ScheduledAction) => (
                                    <div
                                        key={action.id}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-xl border transition-all",
                                            action.is_active
                                                ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20"
                                                : action.is_completed
                                                    ? "bg-emerald-500/10 border-emerald-500/20 opacity-60"
                                                    : "bg-white/5 border-white/10 hover:bg-white/10"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{action.protocol.emoji}</span>
                                            <div>
                                                <div className="text-sm font-medium text-white">
                                                    {action.protocol.name}
                                                </div>
                                                <div className="text-[10px] text-white/40">
                                                    {action.relative_label} • {action.protocol.domain}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-mono text-white/70">
                                                {action.scheduled_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            {action.protocol.duration_minutes > 0 && (
                                                <div className="text-[10px] text-white/30">
                                                    {action.protocol.duration_minutes}min
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sessions now merged into adaptive timeline above */}
            {state.timeline.sessions.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-white/30 mb-4">
                    <Dumbbell className="w-3 h-3" />
                    <span>{state.timeline.sessions.length} training session(s) integrated into your day above</span>
                </div>
            )}

            {/* Note: Adaptive Recommendations Slots section removed - redundant with Adaptive Timeline above */}
            {/* If users need raw slot view, we can re-enable this later or move to a debug mode */}

            {/* ACTION BUTTONS */}
            <div className="fixed bottom-12 right-6 flex flex-col gap-4 z-40">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-14 h-14 rounded-full bg-secondary text-secondary-foreground shadow-glow-primary flex items-center justify-center border border-white/20"
                >
                    {analysisPhase !== 'idle' ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleAddSession}
                    className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-glow-primary flex items-center justify-center border border-white/20"
                >
                    <Plus className="w-6 h-6" />
                </motion.button>
            </div>

            <div className="mt-8 text-center opacity-30 pb-12">
                <div className="w-1 h-8 bg-gradient-to-b from-white/20 to-transparent mx-auto" />
                <div className="text-[10px] uppercase tracking-widest mt-2">End of Stream</div>
            </div>
        </div>
    );
};
