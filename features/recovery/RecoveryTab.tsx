
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Heart, Moon, Activity, Zap, Thermometer,
    AlertTriangle, Stethoscope, Droplets, Waves,
    Dna, Flame, Wind, Brain, Share2, Info, X, Microscope,
    Bone, Leaf, RotateCcw, Calendar, ArrowRight, ShieldCheck,
    Scan, LayoutDashboard, Hexagon, Target, Star, BarChart3
} from "lucide-react";
import { GlassCard, Badge, Button, cn } from "../../components/ui";
import { useSentient } from "../../store/SentientContext";
import { InteractiveBodyMap } from "./components/InteractiveBodyMap";
import { BodyZone, SorenessLevel } from "../../types";
import { getGoalAwareRecoverySuggestions, GoalAwareRecoveryRecommendation } from "../../experts/orchestrator/goalAwareHooks";
import { DEFAULT_USER_GOAL, GOAL_METADATA } from "../../types/goals";

// Import new analysis components
import { HRVCoherenceCard } from "../hrv/HRVCoherenceCard";
import { SleepArchitectureCard } from "../sleep/SleepArchitectureCard";
import { RecoveryMatrixCard } from "./RecoveryMatrixCard";
import { AdaptiveRecoveryCard } from "../../components/recovery/AdaptiveRecoveryCard";

// Import shared design system components
import { HeroMetricCard } from "../../ui/shared/HeroMetricCard";
import { TrendSparkline } from "../../ui/shared/TrendSparkline";
import { QuickStatsRow } from "../../ui/shared/QuickStatsRow";
import { ExpertInsightCard } from "../../ui/shared/ExpertInsightCard";

// REMOVED: AutonomicMonitor wave animation - replaced with clean HRV metrics
// The animated sine wave was decorative gimmick, not meaningful data visualization

const HRVMetricsDisplay = ({ rmssd, parasympatheticScore, hrvTrend }: {
    rmssd: number;
    parasympatheticScore: number;
    hrvTrend?: number[];
}) => {
    const status = rmssd > 50 ? 'good' : rmssd > 35 ? 'moderate' : 'warning';
    const statusColors = {
        good: 'text-green-400 bg-green-500/10',
        moderate: 'text-amber-400 bg-amber-500/10',
        warning: 'text-red-400 bg-red-500/10'
    };

    return (
        <div className="space-y-4">
            {/* Main HRV Display */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">HRV (rMSSD)</div>
                    <div className={cn("text-3xl font-bold font-mono", statusColors[status].split(' ')[0])}>
                        {rmssd}<span className="text-lg text-white/40 ml-1">ms</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Parasympathetic</div>
                    <div className={cn("text-3xl font-bold font-mono",
                        parasympatheticScore > 60 ? "text-green-400" : "text-amber-400"
                    )}>
                        {parasympatheticScore}<span className="text-lg text-white/40 ml-1">/100</span>
                    </div>
                </div>
            </div>

            {/* 7-Day Trend */}
            {hrvTrend && hrvTrend.length > 0 && (
                <div>
                    <div className="text-[9px] uppercase tracking-widest text-white/40 mb-2">7-Day HRV Trend</div>
                    <TrendSparkline
                        data={hrvTrend}
                        color={status === 'good' ? 'green' : status === 'moderate' ? 'amber' : 'red'}
                        height={40}
                    />
                </div>
            )}

            {/* Status Bar */}
            <div className={cn("p-2 rounded-lg text-center text-xs", statusColors[status])}>
                {status === 'good'
                    ? '✓ ANS in parasympathetic dominance - recovered'
                    : status === 'moderate'
                        ? '⚠ ANS balanced - moderate readiness'
                        : '⚡ ANS in sympathetic dominance - stressed'}
            </div>
        </div>
    );
};

const DataRow = ({ label, value, sub, status }: { label: string, value: string | number, sub?: string, status: 'good' | 'warn' | 'bad' | 'neutral' }) => (
    <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        <div className="text-right">
            <div className={cn("text-sm font-bold",
                status === 'good' ? "text-green-400" :
                    status === 'warn' ? "text-yellow-400" :
                        status === 'bad' ? "text-red-400" : "text-white"
            )}>{value}</div>
            {sub && <div className="text-[9px] text-white/40 uppercase tracking-wider">{sub}</div>}
        </div>
    </div>
);

// --- MAIN RECOVERY TAB ---

export const RecoveryTab = () => {
    const { state, sync } = useSentient();
    const { recovery } = state;
    const elite = recovery;
    const [subTab, setSubTab] = useState<'system' | 'analytics' | 'somatic'>('system');

    const handleZoneToggle = (zone: BodyZone) => {
        sync('soreness_toggled', { zone });
    };

    // Get active protocols based on soreness
    const activeSoreness = Object.entries(recovery.soreness_map)
        .filter(([_, level]) => level !== 'none')
        .map(([zone, level]) => ({ zone, level }));

    // Goal-based recovery suggestions
    const userGoal = state.user_profile?.user_goal || DEFAULT_USER_GOAL;
    const goalMeta = GOAL_METADATA[userGoal.primary];

    const goalSuggestions = useMemo(() => {
        return getGoalAwareRecoverySuggestions(userGoal, 'any', 5);
    }, [userGoal]);

    const getPriorityColor = (priority: 'essential' | 'recommended' | 'optional') => {
        switch (priority) {
            case 'essential': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'recommended': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'optional': return 'bg-white/10 text-white/60 border-white/20';
        }
    };

    return (
        <div className="pb-24 animate-in fade-in duration-500 relative">

            {/* HEADER & NAV */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <Dna className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold gradient-text">Bio-Digital Twin</h2>
                </div>

                <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 self-start md:self-auto">
                    <button
                        onClick={() => setSubTab('system')}
                        className={cn(
                            "px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all",
                            subTab === 'system' ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-white"
                        )}
                    >
                        <LayoutDashboard className="w-4 h-4" /> System Status
                    </button>
                    <button
                        onClick={() => setSubTab('analytics')}
                        className={cn(
                            "px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all",
                            subTab === 'analytics' ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-white"
                        )}
                    >
                        <BarChart3 className="w-4 h-4" /> Deep Analytics
                    </button>
                    <button
                        onClick={() => setSubTab('somatic')}
                        className={cn(
                            "px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all",
                            subTab === 'somatic' ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-white"
                        )}
                    >
                        <Scan className="w-4 h-4" /> Somatic Interface
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">

                {/* VIEW A: ELITE SYSTEM DASHBOARD */}
                {subTab === 'system' && (
                    <motion.div
                        key="system"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                    >
                        {/* 1. ADAPTIVE RECOVERY - NEW WEARABLE-DRIVEN SYSTEM */}
                        <AdaptiveRecoveryCard className="mb-6" />

                        {/* 2. TOP ROW: INTEGRITY & RISK */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* SYSTEM INTEGRITY SCORE - Using Unified HeroMetricCard */}
                            <HeroMetricCard
                                icon={ShieldCheck}
                                label="Recovery Score"
                                value={elite.recovery_score}
                                unit="%"
                                status={
                                    elite.recovery_score > 80 ? 'excellent' :
                                        elite.recovery_score > 60 ? 'good' :
                                            elite.recovery_score > 40 ? 'moderate' : 'warning'
                                }
                                trend={elite.recovery_score > 70 ? 'up' : 'stable'}
                                trendValue={`${elite.overreach_risk.probability}% overreach risk`}
                                insight={
                                    elite.recovery_score > 80
                                        ? "Fully recovered. Ready for high intensity."
                                        : elite.recovery_score > 60
                                            ? "Good recovery. Moderate intensity recommended."
                                            : "Recovery needed. Consider rest or light activity."
                                }
                            />

                            {/* HRV METRICS DISPLAY (Replaced AutonomicMonitor wave gimmick) */}
                            <div className="lg:col-span-2">
                                <GlassCard className="h-full flex flex-col">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Brain className="w-4 h-4 text-purple-400" />
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Autonomic Nervous System</h3>
                                    </div>
                                    <HRVMetricsDisplay
                                        rmssd={elite.autonomic.rmssd}
                                        parasympatheticScore={elite.autonomic.parasympathetic_score}
                                        hrvTrend={[45, 48, 52, 50, 55, 58, elite.autonomic.rmssd]}
                                    />
                                </GlassCard>
                            </div>
                        </div>

                        {/* 2. BIOLOGICAL ENGINE GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                            {/* Metabolic / Myokine */}
                            <GlassCard className="border-t-4 border-t-red-500/50">
                                <div className="flex items-center gap-2 mb-4 text-red-400">
                                    <Flame className="w-4 h-4" />
                                    <h3 className="text-xs font-bold uppercase tracking-widest">Metabolic</h3>
                                </div>
                                <div className="space-y-1">
                                    <DataRow label="IL-6 Clearance" value={`${Math.round(elite.myokine.il6_decay_rate! * 100)}%`} status={elite.myokine.inflammation_resolution === 'optimal' ? 'good' : 'warn'} />
                                    <DataRow label="Glycogen" value={`${100 - elite.mitochondrial.glycogen_depletion_level}%`} status={elite.mitochondrial.glycogen_depletion_level > 60 ? 'warn' : 'good'} />
                                    <DataRow label="Lactate Eff." value={elite.lactate.clearance_efficiency} sub={`~${elite.lactate.estimated_clearance_min_50pct}m half-life`} status="neutral" />
                                </div>
                            </GlassCard>

                            {/* Structural / Fascial */}
                            <GlassCard className="border-t-4 border-t-blue-500/50">
                                <div className="flex items-center gap-2 mb-4 text-blue-400">
                                    <Bone className="w-4 h-4" />
                                    <h3 className="text-xs font-bold uppercase tracking-widest">Structural</h3>
                                </div>
                                <div className="space-y-1">
                                    <DataRow label="Fascial Phase" value={elite.fascial.collagen_turnover_phase.replace('_', ' ')} status="neutral" />
                                    <DataRow label="Bone Load" value={elite.bone.bone_stimulus_score} sub="Piezoelectric" status={elite.bone.bone_stimulus_score > 60 ? 'good' : 'warn'} />
                                    <DataRow label="Adhesion Risk" value={`${(elite.fascial.adhesion_risk * 100).toFixed(0)}%`} status={elite.fascial.adhesion_risk > 0.3 ? 'warn' : 'good'} />
                                </div>
                            </GlassCard>

                            {/* Neuromuscular */}
                            <GlassCard className="border-t-4 border-t-yellow-500/50">
                                <div className="flex items-center gap-2 mb-4 text-yellow-400">
                                    <Zap className="w-4 h-4" />
                                    <h3 className="text-xs font-bold uppercase tracking-widest">CNS & Neural</h3>
                                </div>
                                <div className="space-y-1">
                                    <DataRow label="CNS Status" value={elite.neuromuscular.neuromuscular_status.replace('_', ' ')} status={elite.neuromuscular.neuromuscular_status === 'fresh' ? 'good' : 'bad'} />
                                    <DataRow label="CMJ Delta" value={`${elite.neuromuscular.cmj_height_delta?.toFixed(1)}%`} status={elite.neuromuscular.cmj_height_delta! < -5 ? 'warn' : 'good'} />
                                    <DataRow label="Vestibular" value={elite.vestibular.vestibular_fatigue ? "Fatigued" : "Optimal"} status={elite.vestibular.vestibular_fatigue ? 'warn' : 'good'} />
                                </div>
                            </GlassCard>

                            {/* Hormonal / Endocrine */}
                            <GlassCard className="border-t-4 border-t-pink-500/50">
                                <div className="flex items-center gap-2 mb-4 text-pink-400">
                                    <Dna className="w-4 h-4" />
                                    <h3 className="text-xs font-bold uppercase tracking-widest">Endocrine</h3>
                                </div>
                                <div className="space-y-1">
                                    <DataRow label="Cycle Phase" value={elite.hormonal.cycle_phase} status="neutral" />
                                    <DataRow label="Injury Risk" value={`x${elite.hormonal.injury_risk_multiplier}`} status={elite.hormonal.injury_risk_multiplier > 1.5 ? 'warn' : 'good'} />
                                    <DataRow label="Cortisol (CAR)" value={elite.autonomic.car_blunted ? "Blunted" : "Optimal"} status={elite.autonomic.car_blunted ? 'bad' : 'good'} />
                                </div>
                            </GlassCard>
                        </div>

                        {/* 3. ACTIVE RIPPLE EFFECTS & INTERVENTIONS */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Ripple Effects (The Butterfly Effect) */}
                            <GlassCard className="bg-white/5">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                    <Waves className="w-4 h-4 text-cyan-400" /> Active Cascades
                                </h3>
                                {elite.ripple_effects.length === 0 ? (
                                    <div className="text-sm text-white/30 italic text-center py-4">No systemic cascades detected.</div>
                                ) : (
                                    <div className="space-y-3">
                                        {elite.ripple_effects.map((ripple, i) => (
                                            <div key={i} className="flex items-start gap-3 p-2 rounded bg-black/20 border border-white/5">
                                                <div className="mt-1">
                                                    <AlertTriangle className={cn("w-4 h-4", ripple.severity === 'high' ? "text-red-400" : "text-yellow-400")} />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-white">
                                                        {ripple.source} <ArrowRight className="w-3 h-3 inline opacity-50 mx-1" /> {ripple.target}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground mt-0.5">{ripple.description}</div>
                                                </div>
                                                <Badge className="ml-auto text-[9px] bg-white/5 text-white/70 border-white/10">{ripple.impact}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </GlassCard>

                            {/* Prescribed Actions */}
                            <GlassCard className="bg-white/5">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-yellow-400" /> Intervention Protocol
                                </h3>
                                {elite.actions.length === 0 ? (
                                    <div className="text-sm text-white/30 italic text-center py-4">System nominal. No interventions required.</div>
                                ) : (
                                    <div className="space-y-2">
                                        {elite.actions.map((action, i) => (
                                            <div key={i} className={cn(
                                                "p-3 rounded border flex justify-between items-center group cursor-pointer transition-all",
                                                action.type === 'critical' ? "bg-red-950/20 border-red-500/50 hover:bg-red-950/30" :
                                                    action.type === 'essential' ? "bg-amber-950/20 border-amber-500/50 hover:bg-amber-950/30" :
                                                        "bg-white/5 border-white/10 hover:bg-white/10"
                                            )}>
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-1.5 h-full self-stretch rounded-full",
                                                        action.type === 'critical' ? "bg-red-500" : action.type === 'essential' ? "bg-amber-500" : "bg-blue-500"
                                                    )} />
                                                    <div>
                                                        <div className="text-xs font-bold text-white">{action.label}</div>
                                                        <div className="text-[10px] text-muted-foreground">{action.description}</div>
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-full border border-white/20">
                                                    <ArrowRight className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </GlassCard>
                        </div>

                        {/* 4. GOAL-PRIORITIZED RECOVERY */}
                        <GlassCard className="bg-gradient-to-br from-violet-500/5 to-transparent">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Target className="w-4 h-4 text-violet-400" />
                                    {goalMeta.name} Recovery Priority
                                </h3>
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                                    goalMeta.color.replace('bg-', 'text-')
                                )}>
                                    Primary Goal
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {goalSuggestions.map((rec, i) => (
                                    <motion.div
                                        key={rec.modality}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-white capitalize">
                                                {rec.modality.replace(/_/g, ' ')}
                                            </span>
                                            <Badge className={cn("text-[8px] border", getPriorityColor(rec.priority))}>
                                                {rec.priority === 'essential' && <Star className="w-2 h-2 mr-1" />}
                                                {rec.priority}
                                            </Badge>
                                        </div>

                                        <div className="space-y-1 text-[10px] text-white/50">
                                            <div className="flex justify-between">
                                                <span>Duration</span>
                                                <span className="text-white/70">{rec.duration}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Frequency</span>
                                                <span className="text-white/70">{rec.frequency}</span>
                                            </div>
                                        </div>

                                        <div className="mt-2 pt-2 border-t border-white/5">
                                            <p className="text-[9px] text-white/40 line-clamp-2">
                                                {rec.goalBenefit}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-4 pt-3 border-t border-white/5 text-center">
                                <p className="text-[9px] text-white/30">
                                    Recovery modalities prioritized based on your <span className="text-violet-400">{goalMeta.name}</span> goal
                                </p>
                            </div>
                        </GlassCard>

                    </motion.div>
                )}

                {/* VIEW B: DEEP ANALYTICS - HRV, Sleep, Recovery Matrix */}
                {subTab === 'analytics' && (
                    <motion.div
                        key="analytics"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                    >
                        {/* HRV and Sleep side by side */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <HRVCoherenceCard />
                            <SleepArchitectureCard />
                        </div>

                        {/* Recovery Matrix */}
                        <RecoveryMatrixCard />

                        {/* Research Note */}
                        <GlassCard className="p-4 bg-white/5 border-l-4 border-primary">
                            <div className="flex items-start gap-3">
                                <Brain className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-semibold text-white mb-1">About These Metrics</h4>
                                    <p className="text-xs text-muted-foreground">
                                        HRV analysis uses rMSSD with coefficient of variation (CV) methodology.
                                        Sleep architecture targets are based on research: 20%+ deep sleep for physical recovery,
                                        22%+ REM for cognitive consolidation. Recovery matrix assesses 6 physiological systems
                                        with evidence-based modality recommendations.
                                    </p>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {/* VIEW C: SOMATIC INTERFACE (UNCHANGED) */}
                {subTab === 'somatic' && (
                    <motion.div
                        key="somatic"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    >
                        <GlassCard className="lg:col-span-2 flex flex-col relative overflow-hidden min-h-[600px]">
                            <div className="absolute top-0 left-0 w-full p-4 z-10 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-white/70 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-cyan-400" /> Somatic Integrity
                                </h3>
                                <p className="text-[10px] text-muted-foreground">Tap zones to log sensation.</p>
                            </div>

                            <div className="flex-1 -mt-10">
                                <InteractiveBodyMap
                                    soreness={recovery.soreness_map}
                                    onToggle={handleZoneToggle}
                                />
                            </div>
                        </GlassCard>

                        <div className="space-y-4">
                            <GlassCard className="h-full">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Local Protocols</h3>
                                {activeSoreness.length === 0 ? (
                                    <div className="text-sm text-white/30 italic text-center py-12 flex flex-col items-center">
                                        <ShieldCheck className="w-8 h-8 mb-2 opacity-50" />
                                        System integrity nominal.<br />No pain signals.
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                                        {activeSoreness.map(({ zone, level }) => (
                                            <div key={zone} className="flex flex-col p-3 bg-white/5 rounded border border-white/5 hover:bg-white/10 transition-colors">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className={cn("w-2 h-2 rounded-full", level === 'pain' ? 'bg-red-500' : 'bg-orange-500')} />
                                                    <span className="text-sm font-bold capitalize text-white">{zone.replace('_', ' ')}</span>
                                                </div>

                                                <div className="text-[10px] text-muted-foreground mb-2">
                                                    Suggested Treatment:
                                                </div>

                                                <div className="flex items-center justify-between bg-black/20 p-2 rounded">
                                                    <span className="text-xs text-cyan-400 font-bold uppercase">
                                                        {zone === 'quads' ? 'Percussion Gun' : zone.includes('back') ? 'Heat Therapy' : 'Voodoo Floss'}
                                                    </span>
                                                    <Button size="sm" className="h-6 text-[10px]">Start</Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </GlassCard>
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
};
