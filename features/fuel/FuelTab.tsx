
import React, { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Flame, Utensils, Camera, Zap, ShieldAlert, Droplets, Check, AlertTriangle,
    X, ArrowDownRight, Activity, Target, Loader2, Beaker, Lock, Plus, BookOpen,
    ChevronDown, ChevronUp, Award, Lightbulb
} from "lucide-react";
import { GlassCard, Button, Badge, cn } from "../../components/ui";
import { useSentient } from "../../store/SentientContext";
import { getGoalAwareFuelRecommendations } from "../../services/goalAwareHooks";
import { DEFAULT_USER_GOAL, GOAL_METADATA, GOAL_PROTOCOLS } from "../../types/goals";
import { analyzeFoodImage } from "../../experts/orchestrator/ai";
import { calculateFuelTargets, formatActivityLevel } from "../../experts/nutritionist/FuelCalculationEngine";
import { BodyComposition } from "../../types/body";
import { getGoalFuelScience } from "../../experts/nutritionist/goalFuelScience";
import { generateFuelWindows, DayFuelProtocol } from "../../experts/nutritionist/SessionFuelProtocolEngine";
import { generateSupplementProtocol, getRecommendedSupplements, SUPPLEMENT_DATABASE, DaySupplementProtocol, Supplement } from "../../experts/nutritionist/SupplementProtocolEngine";
import { Pill, Clock } from "lucide-react";

// ============================================================================
// COMPONENT: REACTOR CORE (COMPACT VERSION)
// ============================================================================

const ReactorCore: React.FC<{ level: number, status: string, drainRate: number }> = ({ level, status, drainRate }) => {
    let color = "#10b981"; // Green
    if (level < 20) color = "#ef4444";
    else if (level < 40) color = "#f59e0b";
    else if (level > 90) color = "#3b82f6";

    return (
        <div className="relative flex justify-center items-center py-4">
            <div className="relative w-32 h-32 bg-black/40 rounded-full border-4 border-white/10 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-md">
                <motion.div
                    className="absolute bottom-0 left-0 right-0"
                    style={{ background: `linear-gradient(to top, ${color}, ${color}00)` }}
                    initial={{ height: 0 }}
                    animate={{ height: `${level}%` }}
                    transition={{ type: "spring", stiffness: 20, damping: 10 }}
                >
                    <div className="absolute top-0 w-full h-1 bg-white/50 shadow-[0_0_15px_white]" />
                </motion.div>
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                    <div className="text-[8px] uppercase tracking-widest text-white/50 font-bold">Glycogen</div>
                    <div className="text-3xl font-mono font-bold text-white">{Math.round(level)}%</div>
                    <div className={cn("flex items-center gap-1 text-[9px] font-bold uppercase mt-1 px-2 py-0.5 rounded border bg-black/50",
                        drainRate > 1 ? "text-orange-400 border-orange-500/30" : "text-emerald-400 border-emerald-500/30"
                    )}>
                        {drainRate > 1 ? <ArrowDownRight className="w-2 h-2" /> : <Activity className="w-2 h-2" />}
                        {status}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// COMPONENT: MACRO PROGRESS BAR
// ============================================================================

const MacroBar: React.FC<{ label: string, current: number, target: number, color: string }> = ({ label, current, target, color }) => {
    const percentage = Math.min(100, (current / target) * 100);
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs">
                <span className="text-white/60">{label}</span>
                <span className={color}>{current}g <span className="text-white/30">/ {target}g</span></span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full rounded-full ${color.replace('text-', 'bg-')}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT: FUEL TAB (STREAMLINED SINGLE VIEW)
// ============================================================================

export const FuelTab = () => {
    const { state, sync } = useSentient();
    const { fuel } = state;

    // Food Scanner State
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<any | null>(null);
    const [showScanModal, setShowScanModal] = useState(false);
    const foodInputRef = useRef<HTMLInputElement>(null);

    // Science panel expansion state
    const [showScience, setShowScience] = useState(false);

    // Goal-based fuel recommendations
    const userGoal = state.user_profile?.user_goal || DEFAULT_USER_GOAL;
    const goalMeta = GOAL_METADATA[userGoal.primary];
    const goalFuel = useMemo(() => getGoalAwareFuelRecommendations(userGoal), [userGoal]);
    const goalProtocol = GOAL_PROTOCOLS[userGoal.primary].fuel;
    const goalScience = useMemo(() => getGoalFuelScience(userGoal.primary), [userGoal.primary]);

    // Body composition from profile (or defaults)
    const bodyComp: BodyComposition = state.user_profile?.body_composition || {
        height_cm: 175,
        weight_kg: 70,
        age: 28,
        gender: 'male' as const,
        data_source: 'manual' as const,
        last_updated: new Date().toISOString()
    };

    // Calculate personalized fuel targets from body composition
    const fuelCalc = useMemo(() => {
        return calculateFuelTargets({
            body: bodyComp,
            physicalLoad: state.physical_load,
            goalType: userGoal.primary as any
        });
    }, [bodyComp, state.physical_load, userGoal.primary]);

    // Session-aware fuel windows from Timeline
    const sessionFuelWindows: DayFuelProtocol = useMemo(() => {
        const sessions = state.timeline?.sessions || [];
        return generateFuelWindows(sessions, userGoal.primary, bodyComp.weight_kg);
    }, [state.timeline?.sessions, userGoal.primary, bodyComp.weight_kg]);

    // Supplement stack - user's selected supplements with session-aware timing
    const [userSupplementIds, setUserSupplementIds] = useState<string[]>(['vitamin_d', 'omega_3', 'magnesium']);
    const supplementProtocol: DaySupplementProtocol = useMemo(() => {
        const sessions = state.timeline?.sessions || [];
        return generateSupplementProtocol(userSupplementIds, sessions, userGoal.primary);
    }, [state.timeline?.sessions, userGoal.primary, userSupplementIds]);

    // Safe Fallback VM
    const viewModel = fuel.viewModel || {
        tank: { level: 50, label: 'Calibrating', drainRate: 0 },
        hydration: { value: 0, percentage: 0 },
        protocol: null,
        veto: null
    };

    // Handlers
    const handleLogHydration = () => sync("hydration_logged", (fuel.hydration_liters || 0) + 0.5);

    const handleFoodScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsScanning(true);
        setShowScanModal(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = (reader.result as string).replace("data:", "").replace(/^.+,/, "");
            const result = await analyzeFoodImage(base64String, file.type);
            setScanResult(result || { error: true, message: "Could not analyze image" });
            setIsScanning(false);
        };
        reader.readAsDataURL(file);
    };

    const handleLogScannedMeal = () => {
        if (scanResult?.items) {
            const now = new Date();
            sync("meal_logged", {
                time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
                items: scanResult.items,
                meal_type: scanResult.meal_type || 'meal',
                logged_at: now.toISOString()
            });
            setShowScanModal(false);
            setScanResult(null);
        }
    };

    // Mock daily intake (would come from logged meals)
    const dailyIntake = useMemo(() => {
        const meals = fuel.entries || [];
        return meals.reduce((acc, meal) => {
            (meal.items || []).forEach((item: any) => {
                acc.carbs += item.macros?.carbs || 0;
                acc.protein += item.macros?.protein || 0;
                acc.fat += item.macros?.fat || 0;
            });
            return acc;
        }, { carbs: 0, protein: 0, fat: 0 });
    }, [fuel.entries]);

    // Goal-linked micro priorities
    const microPriorities = useMemo(() => {
        const micros = [
            { name: 'Iron', reason: 'Oxygen transport for endurance', icon: '🩸', goalLinked: ['endurance', 'ultra_endurance'] },
            { name: 'Vitamin D', reason: 'Bone health & immunity', icon: '☀️', goalLinked: ['all'] },
            { name: 'Magnesium', reason: 'Muscle function & recovery', icon: '💪', goalLinked: ['strength', 'power', 'hypertrophy'] },
            { name: 'Omega-3', reason: 'Anti-inflammatory for recovery', icon: '🐟', goalLinked: ['all'] },
            { name: 'B12', reason: 'Energy metabolism', icon: '⚡', goalLinked: ['all'] }
        ];
        // Filter by goal relevance, show top 3
        return micros.filter(m => m.goalLinked.includes('all') || m.goalLinked.includes(userGoal.primary)).slice(0, 3);
    }, [userGoal.primary]);

    return (
        <div className="pb-24 animate-in fade-in duration-300 space-y-6">

            {/* Hidden File Input for Food Scanning */}
            <input type="file" ref={foodInputRef} className="hidden" accept="image/*" onChange={handleFoodScan} />

            {/* FOOD SCAN MODAL */}
            <AnimatePresence>
                {showScanModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-md bg-background border border-green-500/30 rounded-2xl overflow-hidden shadow-glow-primary">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-green-500/20"><Utensils className="w-5 h-5 text-green-400" /></div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white">Food Analysis</h3>
                                        <p className="text-[10px] text-white/40 uppercase tracking-widest">AI-Powered Macro Estimation</p>
                                    </div>
                                </div>
                                <button onClick={() => { setShowScanModal(false); setScanResult(null); }} className="text-white/40 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6">
                                {isScanning ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Loader2 className="w-12 h-12 text-green-400 animate-spin mb-4" />
                                        <p className="text-sm text-white/60">Analyzing your meal...</p>
                                    </div>
                                ) : scanResult?.error ? (
                                    <div className="text-center py-8">
                                        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                                        <p className="text-sm text-red-300">{scanResult.message}</p>
                                    </div>
                                ) : scanResult?.items ? (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            {scanResult.items.map((item: any, i: number) => (
                                                <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                                                    <div>
                                                        <div className="font-bold text-white">{item.name}</div>
                                                        <div className="text-[10px] text-white/40">{item.estimated_cal || '—'} kcal</div>
                                                    </div>
                                                    <div className="flex gap-3 text-[10px] font-mono">
                                                        <span className="text-orange-400">C: {item.macros?.carbs || 0}g</span>
                                                        <span className="text-blue-400">P: {item.macros?.protein || 0}g</span>
                                                        <span className="text-pink-400">F: {item.macros?.fat || 0}g</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20 grid grid-cols-3 gap-4 text-center">
                                            <div><div className="text-xl font-bold text-orange-400">{scanResult.items.reduce((s: number, i: any) => s + (i.macros?.carbs || 0), 0)}g</div><div className="text-[10px] text-white/40">Carbs</div></div>
                                            <div><div className="text-xl font-bold text-blue-400">{scanResult.items.reduce((s: number, i: any) => s + (i.macros?.protein || 0), 0)}g</div><div className="text-[10px] text-white/40">Protein</div></div>
                                            <div><div className="text-xl font-bold text-pink-400">{scanResult.items.reduce((s: number, i: any) => s + (i.macros?.fat || 0), 0)}g</div><div className="text-[10px] text-white/40">Fat</div></div>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                            {scanResult && !scanResult.error && (
                                <div className="p-4 border-t border-white/10 flex gap-3">
                                    <Button variant="outline" className="flex-1" onClick={() => { setShowScanModal(false); setScanResult(null); }}>Cancel</Button>
                                    <Button className="flex-1 bg-green-500 hover:bg-green-600 text-black" onClick={handleLogScannedMeal}><Check className="w-4 h-4 mr-2" /> Log Meal</Button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* VETO ALERT */}
            {viewModel.veto && (
                <GlassCard className="bg-red-950/20 border-l-4 border-l-red-500 flex items-start gap-4">
                    <ShieldAlert className="w-6 h-6 text-red-500 shrink-0" />
                    <div>
                        <h3 className="font-bold text-red-400 uppercase tracking-widest text-sm">{viewModel.veto.title}</h3>
                        <p className="text-red-200/80 text-sm">{viewModel.veto.message}</p>
                    </div>
                </GlassCard>
            )}

            {/* 1. GOAL PROTOCOL HEADER with CALCULATED TARGETS */}
            <GlassCard className={cn("border-t-4", goalMeta.color.replace('bg-', 'border-t-'))}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Target className={cn("w-6 h-6", goalMeta.color.replace('bg-', 'text-'))} />
                        <div>
                            <h2 className="text-xl font-bold text-white">{goalMeta.name} Fuel Protocol</h2>
                            <p className="text-xs text-white/40">Personalized for your body metrics</p>
                        </div>
                    </div>
                    <Badge className={cn("text-[10px]", goalMeta.color, "text-black")}>{formatActivityLevel(fuelCalc.activity_level)}</Badge>
                </div>

                {/* BMR and TDEE Row */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-2xl font-bold text-white">{fuelCalc.bmr}</div>
                        <div className="text-[10px] text-white/40 uppercase">BMR (kcal/day)</div>
                        <div className="text-[9px] text-green-400">{fuelCalc.formula_used}</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-2xl font-bold text-white">{fuelCalc.tdee}</div>
                        <div className="text-[10px] text-white/40 uppercase">TDEE (kcal/day)</div>
                        <div className="text-[9px] text-green-400">Target intake</div>
                    </div>
                </div>

                {/* Macro Targets Row */}
                <div className="grid grid-cols-3 gap-4 text-center text-xs">
                    <div className="p-3 bg-white/5 rounded-lg">
                        <div className="text-xl font-bold text-orange-400">{fuelCalc.macros.carbs_g}g</div>
                        <div className="text-white/40">Carbs</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                        <div className="text-xl font-bold text-blue-400">{fuelCalc.macros.protein_g}g</div>
                        <div className="text-white/40">Protein</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                        <div className="text-xl font-bold text-pink-400">{fuelCalc.macros.fat_g}g</div>
                        <div className="text-white/40">Fat</div>
                    </div>
                </div>

                {/* Caloric Balance Badge */}
                <div className="mt-4 flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-xs text-white/60">Caloric Target:</span>
                    <Badge className={cn(
                        "text-xs font-bold",
                        goalProtocol.caloricBalance > 0 ? "bg-green-500/20 text-green-400" :
                            goalProtocol.caloricBalance < 0 ? "bg-orange-500/20 text-orange-400" :
                                "bg-blue-500/20 text-blue-400"
                    )}>
                        {goalProtocol.caloricBalance > 0 ? `+${goalProtocol.caloricBalance}` : goalProtocol.caloricBalance} kcal
                        {goalProtocol.caloricBalance > 0 ? ' (surplus)' : goalProtocol.caloricBalance < 0 ? ' (deficit)' : ' (maintenance)'}
                    </Badge>
                </div>

                {/* Science Toggle Button */}
                <button
                    onClick={() => setShowScience(!showScience)}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg transition-colors"
                >
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-purple-400 font-medium">
                        {showScience ? 'Hide' : 'Show'} Science & Research
                    </span>
                    {showScience ? <ChevronUp className="w-4 h-4 text-purple-400" /> : <ChevronDown className="w-4 h-4 text-purple-400" />}
                </button>
            </GlassCard>

            {/* SCIENCE CARD (Expandable) */}
            <AnimatePresence>
                {showScience && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <GlassCard className="border-l-4 border-l-purple-500 overflow-hidden">
                            {/* Header */}
                            <div className="p-4 bg-purple-500/10 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-purple-500/20">
                                        <BookOpen className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{goalScience.title}</h3>
                                        <p className="text-xs text-white/50">{goalScience.summary}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 space-y-4">
                                {/* Key Principles */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Award className="w-4 h-4 text-amber-400" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-white/60">Key Principles</span>
                                    </div>
                                    <div className="space-y-2">
                                        {goalScience.keyPrinciples.map((p, i) => (
                                            <div key={i} className="flex items-start gap-2 text-sm text-white/80">
                                                <span className="text-purple-400 mt-0.5">•</span>
                                                {p}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Macro Rationale */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="p-3 bg-orange-500/5 rounded-lg border border-orange-500/20">
                                        <div className="text-[10px] text-orange-400 uppercase font-bold mb-1">Carbs Strategy</div>
                                        <p className="text-xs text-white/60">{goalScience.macroRationale.carbs}</p>
                                    </div>
                                    <div className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
                                        <div className="text-[10px] text-blue-400 uppercase font-bold mb-1">Protein Rationale</div>
                                        <p className="text-xs text-white/60">{goalScience.macroRationale.protein}</p>
                                    </div>
                                    <div className="p-3 bg-pink-500/5 rounded-lg border border-pink-500/20">
                                        <div className="text-[10px] text-pink-400 uppercase font-bold mb-1">Fat Strategy</div>
                                        <p className="text-xs text-white/60">{goalScience.macroRationale.fat}</p>
                                    </div>
                                </div>

                                {/* Session Fuel Windows - Dynamic from Timeline */}
                                <div className="p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/20">
                                    <div className="text-[10px] text-cyan-400 uppercase font-bold mb-2">⏱️ Today's Fuel Windows</div>
                                    {sessionFuelWindows.all_windows.length > 0 ? (
                                        <div className="space-y-2">
                                            {sessionFuelWindows.all_windows.slice(0, 3).map((window: any) => (
                                                <div key={window.id} className={cn(
                                                    "p-2 rounded border",
                                                    window.is_active ? "bg-green-500/10 border-green-500/30" :
                                                        window.is_upcoming ? "bg-yellow-500/10 border-yellow-500/30" :
                                                            window.is_missed ? "bg-red-500/10 border-red-500/20" :
                                                                "bg-white/5 border-white/10"
                                                )}>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-bold text-white">{window.title}</span>
                                                        <Badge className={cn(
                                                            "text-[9px]",
                                                            window.is_active ? "bg-green-500/20 text-green-400" :
                                                                window.is_upcoming ? "bg-yellow-500/20 text-yellow-400" :
                                                                    window.is_missed ? "bg-red-500/20 text-red-400" :
                                                                        "bg-white/10 text-white/50"
                                                        )}>
                                                            {window.is_active ? '🔥 NOW' : window.is_upcoming ? '⏰ SOON' : window.is_missed ? 'MISSED' : 'SCHEDULED'}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-[10px] text-white/50 mt-1">{window.subtitle}</div>
                                                    <div className="text-[10px] text-cyan-400 mt-1">
                                                        {window.carbs_g}g carbs + {window.protein_g}g protein
                                                    </div>
                                                    {window.food_suggestions?.[0] && (
                                                        <div className="text-[10px] text-white/40 mt-1">
                                                            {window.food_suggestions[0].emojis} {window.food_suggestions[0].foods.join(' + ')}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-white/50 italic">
                                            No sessions logged for today. Add a session in Timeline to see fuel windows.
                                        </p>
                                    )}
                                </div>

                                {/* Supplements */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Beaker className="w-4 h-4 text-violet-400" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-white/60">Evidence-Based Supplements</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                        {goalScience.supplementScience.slice(0, 3).map((supp, i) => (
                                            <div key={i} className="p-2 bg-violet-500/5 rounded border border-violet-500/20">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-bold text-white">{supp.name}</span>
                                                    <Badge className={cn(
                                                        "text-[9px]",
                                                        supp.evidence_level === 'strong' ? "bg-green-500/20 text-green-400" :
                                                            supp.evidence_level === 'moderate' ? "bg-yellow-500/20 text-yellow-400" :
                                                                "bg-blue-500/20 text-blue-400"
                                                    )}>
                                                        {supp.evidence_level}
                                                    </Badge>
                                                </div>
                                                <div className="text-[10px] text-white/40">{supp.dosage} • {supp.timing}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Practical Tips */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Lightbulb className="w-4 h-4 text-amber-400" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-white/60">Practical Tips</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {goalScience.practicalTips.slice(0, 4).map((tip, i) => (
                                            <div key={i} className="p-2 bg-amber-500/5 rounded border border-amber-500/20 text-xs text-white/60">
                                                💡 {tip}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 2. REACTOR + HYDRATION ROW */}
            <div className="grid grid-cols-2 gap-4">
                <GlassCard className="p-4">
                    <ReactorCore level={viewModel.tank.level} status={viewModel.tank.label} drainRate={viewModel.tank.drainRate} />
                </GlassCard>
                <GlassCard className="p-4 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-blue-400 mb-2">
                            <Droplets className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase">Hydration</span>
                        </div>
                        <div className="text-3xl font-mono font-bold text-white mb-2">{viewModel.hydration.value || fuel.hydration_liters || 0}L</div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div className="h-full bg-blue-400 rounded-full" animate={{ width: `${viewModel.hydration.percentage || 0}%` }} />
                        </div>
                    </div>
                    <Button size="sm" variant="outline" className="mt-4 w-full" onClick={handleLogHydration}>
                        <Plus className="w-3 h-3 mr-2" /> 500ml
                    </Button>
                </GlassCard>
            </div>

            {/* 3. TODAY'S PROTOCOL + SCAN */}
            <GlassCard>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white/60 flex items-center gap-2">
                        <Utensils className="w-4 h-4" /> Today's Protocol
                    </h3>
                    <Button size="sm" onClick={() => foodInputRef.current?.click()}>
                        <Camera className="w-4 h-4 mr-2" /> Scan Food
                    </Button>
                </div>
                {viewModel.protocol ? (
                    <div className="space-y-3">
                        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                            <div className="text-xs text-white/40 uppercase mb-1">{viewModel.protocol.timing}</div>
                            <div className="text-sm font-bold text-white">{viewModel.protocol.name}</div>
                            <p className="text-xs text-white/60 mt-1">{viewModel.protocol.rationale}</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6 text-white/30">
                        <Check className="w-8 h-8 mx-auto mb-2 text-green-500" />
                        <p className="text-sm">System stable. Log meals to track progress.</p>
                    </div>
                )}
            </GlassCard>

            {/* 4. DAILY MACRO PROGRESS */}
            <GlassCard>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white/60 mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Daily Macro Progress
                </h3>
                <div className="space-y-4">
                    <MacroBar label="Carbs" current={dailyIntake.carbs} target={fuelCalc.macros.carbs_g} color="text-orange-400" />
                    <MacroBar label="Protein" current={dailyIntake.protein} target={fuelCalc.macros.protein_g} color="text-blue-400" />
                    <MacroBar label="Fat" current={dailyIntake.fat} target={fuelCalc.macros.fat_g} color="text-pink-400" />
                </div>
            </GlassCard>

            {/* 5. MICRO PRIORITIES */}
            <GlassCard>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white/60 mb-4 flex items-center gap-2">
                    <Beaker className="w-4 h-4" /> Micro Priorities
                    <Badge className="text-[9px] bg-purple-500/20 text-purple-400 border-purple-500/30">Goal-Linked</Badge>
                </h3>
                <div className="space-y-2">
                    {microPriorities.map((micro, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex items-center gap-3">
                                <span className="text-lg">{micro.icon}</span>
                                <div>
                                    <div className="text-sm font-bold text-white">{micro.name}</div>
                                    <div className="text-[10px] text-white/40">{micro.reason}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>

            {/* 6. SUPPLEMENT STACK */}
            <GlassCard className="border-l-4 border-l-emerald-500">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white/60 mb-4 flex items-center gap-2">
                    <Pill className="w-4 h-4 text-emerald-400" /> Supplement Stack
                    <Badge className="text-[9px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Session-Aware</Badge>
                </h3>

                {/* Active/Upcoming Supplement Windows */}
                {supplementProtocol.all_windows.length > 0 ? (
                    <div className="space-y-3 mb-4">
                        {supplementProtocol.all_windows.slice(0, 4).map((window) => (
                            <div key={window.id} className={cn(
                                "p-3 rounded-lg border",
                                window.is_active ? "bg-emerald-500/10 border-emerald-500/30" :
                                    window.is_upcoming ? "bg-yellow-500/10 border-yellow-500/30" :
                                        window.is_missed ? "bg-red-500/10 border-red-500/20" :
                                            "bg-white/5 border-white/10"
                            )}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="flex items-center gap-2">
                                        <span className="text-lg">{window.supplement.emoji}</span>
                                        <span className="text-sm font-bold text-white">{window.supplement.name}</span>
                                    </span>
                                    <Badge className={cn(
                                        "text-[9px]",
                                        window.is_active ? "bg-emerald-500/20 text-emerald-400" :
                                            window.is_upcoming ? "bg-yellow-500/20 text-yellow-400" :
                                                window.is_missed ? "bg-red-500/20 text-red-400" :
                                                    "bg-white/10 text-white/50"
                                    )}>
                                        {window.is_active ? '⏰ NOW' :
                                            window.is_upcoming ? 'SOON' :
                                                window.is_missed ? 'MISSED' :
                                                    window.window_start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-white/50">
                                    <Clock className="w-3 h-3" />
                                    <span>{window.instructions}</span>
                                </div>
                                {window.session_relative && (
                                    <div className="text-[10px] text-emerald-400 mt-1">
                                        ⚡ Timed for your session
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4 text-white/30 text-sm">
                        Add supplements to your stack to see timing protocol
                    </div>
                )}

                {/* Recommended Supplements for Goal */}
                <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="text-[10px] text-white/40 uppercase mb-2">Recommended for {goalMeta.name}</div>
                    <div className="flex flex-wrap gap-2">
                        {getRecommendedSupplements(userGoal.primary).slice(0, 5).map((supp) => (
                            <button
                                key={supp.id}
                                onClick={() => {
                                    if (!userSupplementIds.includes(supp.id)) {
                                        setUserSupplementIds([...userSupplementIds, supp.id]);
                                    }
                                }}
                                className={cn(
                                    "px-2 py-1 rounded text-[10px] border transition-colors",
                                    userSupplementIds.includes(supp.id)
                                        ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                                        : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                                )}
                            >
                                {supp.emoji} {supp.name}
                            </button>
                        ))}
                    </div>
                </div>
            </GlassCard>

            {/* 6. BIOMARKER ALERT (PLACEHOLDER) */}
            <GlassCard className="border border-dashed border-white/20 bg-transparent">
                <div className="flex items-center gap-4 text-white/40">
                    <Lock className="w-5 h-5" />
                    <div>
                        <div className="text-sm font-bold">Connect Biomarkers</div>
                        <div className="text-xs">Upload blood test or connect health app to unlock personalized micronutrient recommendations.</div>
                    </div>
                </div>
            </GlassCard>

        </div>
    );
};
