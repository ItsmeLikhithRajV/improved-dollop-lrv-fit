import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Target, ChevronRight,
    Shield, Zap, Heart, Brain, Calendar, Info,
    Scale, Check, X, Loader2, Upload, AlertTriangle
} from 'lucide-react';
import { GlassCard, Button, cn } from '../../components/ui';
import { useSentient } from '../../store/SentientContext';
import { GoalSelector } from '../goals/GoalSelector';
import { GoalImpactModal } from '../goals/GoalImpactModal';
import { GOAL_METADATA, UserGoal, DEFAULT_USER_GOAL } from '../../types/goals';
import { analyzeScaleReport } from '../../experts/orchestrator/ai';
import { BodyComposition } from '../../types/body';
import { getDaysSinceWeighIn, getWeighInMessage } from '../../services/WeeklyReminderService';

// --- PROFILE TAB: User Goals & Body Metrics ---
export const ProfileTab = () => {
    const { state, dispatch, sync } = useSentient();
    const [isGoalSelectorOpen, setIsGoalSelectorOpen] = useState(false);
    const [pendingGoal, setPendingGoal] = useState<UserGoal | null>(null);
    const [isImpactModalOpen, setIsImpactModalOpen] = useState(false);

    // Body Metrics State
    const [isScanning, setIsScanning] = useState(false);
    const [showScanModal, setShowScanModal] = useState(false);
    const [scanResult, setScanResult] = useState<any>(null);
    const scaleInputRef = useRef<HTMLInputElement>(null);

    const userGoal = state.user_profile?.user_goal || DEFAULT_USER_GOAL;
    const primaryMeta = GOAL_METADATA[userGoal.primary];

    // Body composition from state (or defaults)
    const bodyComp: BodyComposition = state.user_profile?.body_composition || {
        height_cm: 175,
        weight_kg: 70,
        age: 28,
        gender: 'male' as const,
        data_source: 'manual' as const,
        last_updated: new Date().toISOString()
    };

    // Weekly weigh-in reminder
    const weighInStatus = useMemo(() => {
        const daysSince = getDaysSinceWeighIn(state);
        return { ...getWeighInMessage(daysSince), daysSince };
    }, [state.user_profile?.body_composition?.last_updated]);

    const handleGoalComplete = (newGoal: UserGoal) => {
        setIsGoalSelectorOpen(false);
        if (newGoal.primary !== userGoal.primary) {
            setPendingGoal(newGoal);
            setIsImpactModalOpen(true);
        } else {
            dispatch({ type: 'SET_USER_GOAL', payload: newGoal });
        }
    };

    const confirmGoalChange = () => {
        if (pendingGoal) {
            dispatch({ type: 'SET_USER_GOAL', payload: pendingGoal });
            setPendingGoal(null);
            setIsImpactModalOpen(false);
        }
    };

    const cancelGoalChange = () => {
        setPendingGoal(null);
        setIsImpactModalOpen(false);
    };

    // Body metrics handlers
    const updateBodyMetric = (field: keyof BodyComposition, value: any) => {
        const updated = { ...bodyComp, [field]: value, last_updated: new Date().toISOString() };
        sync('update_body_composition', updated);
    };

    const handleScaleAnalysis = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        setShowScanModal(true);

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = (reader.result as string).replace("data:", "").replace(/^.+,/, "");
            const result = await analyzeScaleReport(base64String, file.type);
            setScanResult(result || { error: true, message: "Could not analyze image" });
            setIsScanning(false);
        };
        reader.readAsDataURL(file);
    };

    const applyScaleData = () => {
        if (scanResult && !scanResult.error) {
            const updated: Partial<BodyComposition> = {
                ...bodyComp,
                data_source: 'smart_scale',
                last_weigh_in: new Date().toISOString(),
                last_updated: new Date().toISOString()
            };
            if (scanResult.weight_kg) updated.weight_kg = scanResult.weight_kg;
            if (scanResult.body_fat_percent) updated.body_fat_percent = scanResult.body_fat_percent;
            if (scanResult.muscle_mass_kg) updated.muscle_mass_kg = scanResult.muscle_mass_kg;
            if (scanResult.bone_mass_kg) updated.bone_mass_kg = scanResult.bone_mass_kg;
            if (scanResult.body_water_percent) updated.body_water_percent = scanResult.body_water_percent;
            if (scanResult.visceral_fat_level) updated.visceral_fat_level = scanResult.visceral_fat_level;
            if (scanResult.bmr) updated.bmr_scale = scanResult.bmr;
            if (scanResult.metabolic_age) updated.metabolic_age = scanResult.metabolic_age;

            sync('update_body_composition', updated);
            setShowScanModal(false);
            setScanResult(null);
        }
    };

    return (
        <div className="space-y-6 pb-24 overflow-y-auto max-h-[calc(100vh-120px)]">
            {/* Hidden File Input */}
            <input type="file" ref={scaleInputRef} className="hidden" accept="image/*" onChange={handleScaleAnalysis} />

            {/* SCALE SCAN MODAL */}
            <AnimatePresence>
                {showScanModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-md bg-background border border-cyan-500/30 rounded-2xl overflow-hidden">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-cyan-500/20"><Scale className="w-5 h-5 text-cyan-400" /></div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white">Scale Report Analysis</h3>
                                        <p className="text-[10px] text-white/40 uppercase tracking-widest">AI-Powered Extraction</p>
                                    </div>
                                </div>
                                <button onClick={() => { setShowScanModal(false); setScanResult(null); }} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="p-6">
                                {isScanning ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
                                        <p className="text-sm text-white/60">Analyzing your scale report...</p>
                                    </div>
                                ) : scanResult?.error ? (
                                    <div className="text-center py-8">
                                        <X className="w-10 h-10 text-red-400 mx-auto mb-3" />
                                        <p className="text-sm text-red-300">Could not analyze image</p>
                                    </div>
                                ) : scanResult ? (
                                    <div className="space-y-4">
                                        {scanResult.detected_scale_brand && (
                                            <div className="text-xs text-cyan-400 mb-2">Detected: {scanResult.detected_scale_brand}</div>
                                        )}
                                        <div className="grid grid-cols-2 gap-3">
                                            {scanResult.weight_kg && <div className="p-3 bg-white/5 rounded-lg"><div className="text-xs text-white/40">Weight</div><div className="text-lg font-bold text-white">{scanResult.weight_kg} kg</div></div>}
                                            {scanResult.body_fat_percent && <div className="p-3 bg-white/5 rounded-lg"><div className="text-xs text-white/40">Body Fat</div><div className="text-lg font-bold text-orange-400">{scanResult.body_fat_percent}%</div></div>}
                                            {scanResult.muscle_mass_kg && <div className="p-3 bg-white/5 rounded-lg"><div className="text-xs text-white/40">Muscle Mass</div><div className="text-lg font-bold text-blue-400">{scanResult.muscle_mass_kg} kg</div></div>}
                                            {scanResult.bmr && <div className="p-3 bg-white/5 rounded-lg"><div className="text-xs text-white/40">BMR</div><div className="text-lg font-bold text-green-400">{scanResult.bmr} kcal</div></div>}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                            {scanResult && !scanResult.error && (
                                <div className="p-4 border-t border-white/10 flex gap-3">
                                    <Button variant="outline" className="flex-1" onClick={() => { setShowScanModal(false); setScanResult(null); }}>Cancel</Button>
                                    <Button className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black" onClick={applyScaleData}><Check className="w-4 h-4 mr-2" /> Apply Data</Button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                        <User className="w-6 h-6 text-violet-400" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">
                            Profile Builder
                        </h2>
                        <p className="text-xs text-white/40 mt-1">
                            Configure your metrics, goals and preferences
                        </p>
                    </div>
                </div>
            </div>

            {/* BODY METRICS SECTION */}
            <GlassCard className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent" />
                <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white/80 flex items-center gap-2">
                            <Scale className="w-4 h-4 text-cyan-400" />
                            Body Metrics
                        </h3>
                        <Button size="sm" variant="outline" onClick={() => scaleInputRef.current?.click()}>
                            <Upload className="w-3 h-3 mr-2" /> Scan Scale Report
                        </Button>
                    </div>

                    {/* Basic Inputs */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div>
                            <label className="text-[10px] uppercase tracking-widest text-white/40 block mb-2">Height (cm)</label>
                            <input type="number" value={bodyComp.height_cm} onChange={(e) => updateBodyMetric('height_cm', parseFloat(e.target.value))}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-lg font-mono" />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-widest text-white/40 block mb-2">Weight (kg)</label>
                            <input type="number" value={bodyComp.weight_kg} onChange={(e) => updateBodyMetric('weight_kg', parseFloat(e.target.value))}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-lg font-mono" />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-widest text-white/40 block mb-2">Age</label>
                            <input type="number" value={bodyComp.age} onChange={(e) => updateBodyMetric('age', parseInt(e.target.value))}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-lg font-mono" />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-widest text-white/40 block mb-2">Gender</label>
                            <select value={bodyComp.gender} onChange={(e) => updateBodyMetric('gender', e.target.value)}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-lg">
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                    </div>

                    {/* Smart Scale Data (if available) */}
                    {bodyComp.body_fat_percent && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-cyan-500/5 rounded-lg border border-cyan-500/20">
                            <div><div className="text-[10px] text-cyan-400 uppercase">Body Fat</div><div className="text-xl font-bold text-white">{bodyComp.body_fat_percent}%</div></div>
                            {bodyComp.muscle_mass_kg && <div><div className="text-[10px] text-cyan-400 uppercase">Muscle</div><div className="text-xl font-bold text-white">{bodyComp.muscle_mass_kg} kg</div></div>}
                            {bodyComp.bone_mass_kg && <div><div className="text-[10px] text-cyan-400 uppercase">Bone</div><div className="text-xl font-bold text-white">{bodyComp.bone_mass_kg} kg</div></div>}
                            {bodyComp.body_water_percent && <div><div className="text-[10px] text-cyan-400 uppercase">Water</div><div className="text-xl font-bold text-white">{bodyComp.body_water_percent}%</div></div>}
                        </div>
                    )}

                    {/* Weekly Weigh-in Reminder */}
                    {weighInStatus.urgency !== 'low' && (
                        <div className={cn(
                            "mt-4 p-4 rounded-lg border-l-4 flex items-start gap-3",
                            weighInStatus.urgency === 'high' ? "bg-red-950/20 border-l-red-500" : "bg-yellow-950/20 border-l-yellow-500"
                        )}>
                            <AlertTriangle className={cn(
                                "w-5 h-5 mt-0.5",
                                weighInStatus.urgency === 'high' ? "text-red-400" : "text-yellow-400"
                            )} />
                            <div className="flex-1">
                                <div className="font-bold text-white text-sm">{weighInStatus.title}</div>
                                <p className="text-xs text-white/60 mt-1">{weighInStatus.message}</p>
                                <div className="mt-3">
                                    <Button size="sm" onClick={() => scaleInputRef.current?.click()}>
                                        <Scale className="w-3 h-3 mr-2" /> Update Weight
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Last Updated */}
                    {bodyComp.last_updated && (
                        <div className="mt-4 text-xs text-white/30">
                            Last updated: {new Date(bodyComp.last_updated).toLocaleDateString()} · {weighInStatus.daysSince} days ago
                        </div>
                    )}
                </div>
            </GlassCard>

            {/* PRIMARY GOAL SECTION */}
            <GlassCard className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-transparent" />

                <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white/80 flex items-center gap-2">
                            <Target className="w-4 h-4 text-violet-400" />
                            Active Goal
                        </h3>
                        <button
                            onClick={() => setIsGoalSelectorOpen(true)}
                            className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
                        >
                            Change <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>

                    {/* Primary Goal Card */}
                    <motion.div
                        className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-white/5 to-transparent border border-white/10"
                        whileHover={{ scale: 1.01 }}
                    >
                        <div className={cn(
                            "p-3 rounded-xl",
                            primaryMeta.color.replace('500', '500/20')
                        )}>
                            {React.createElement(
                                {
                                    'fat_loss': Zap,
                                    'muscle_gain': Shield,
                                    'endurance': Heart,
                                    'strength': Target,
                                    'performance': Brain,
                                    'longevity': Calendar,
                                    'cognitive': Brain,
                                    'hybrid': Target
                                }[userGoal.primary] || Target,
                                { className: cn("w-6 h-6", primaryMeta.color.replace('bg-', 'text-')) }
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-lg text-white">{primaryMeta.name}</div>
                            <div className="text-xs text-white/50 line-clamp-2">{primaryMeta.description}</div>
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-violet-400 px-2 py-1 bg-violet-500/20 rounded-full">
                            PRIMARY
                        </div>
                    </motion.div>

                    {/* Secondary Goals */}
                    {userGoal.secondary.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/5">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">
                                Secondary Goals
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {userGoal.secondary.map(goalId => {
                                    const meta = GOAL_METADATA[goalId];
                                    return (
                                        <span
                                            key={goalId}
                                            className={cn(
                                                "px-3 py-1 rounded-full text-xs font-medium border",
                                                meta.color.replace('bg-', 'bg-') + '/10',
                                                meta.color.replace('bg-', 'border-') + '/30',
                                                meta.color.replace('bg-', 'text-')
                                            )}
                                        >
                                            {meta.name}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Goal Info Note */}
                    <div className="mt-6 p-3 rounded-lg bg-white/5 border border-white/5 flex items-start gap-3">
                        <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <p className="text-[10px] text-white/50 leading-relaxed">
                            Your goals affect <span className="text-cyan-400">Recovery protocols</span>,
                            <span className="text-green-400"> Fuel recommendations</span>, and
                            <span className="text-violet-400"> Training suggestions</span> across the entire system.
                        </p>
                    </div>
                </div>
            </GlassCard>

            {/* GOAL SELECTOR MODAL */}
            {isGoalSelectorOpen && (
                <GoalSelector
                    currentGoal={userGoal}
                    onComplete={handleGoalComplete}
                    onCancel={() => setIsGoalSelectorOpen(false)}
                />
            )}

            {/* IMPACT MODAL */}
            {isImpactModalOpen && pendingGoal && (
                <GoalImpactModal
                    currentGoal={userGoal.primary}
                    newGoal={pendingGoal.primary}
                    trigger="manual_change"
                    onImplement={confirmGoalChange}
                    onKeepCurrent={cancelGoalChange}
                    onClose={cancelGoalChange}
                />
            )}

            {/* SETTINGS SECTION */}
            <GlassCard className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent" />
                <div className="relative">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/80 flex items-center gap-2 mb-4">
                        <Zap className="w-4 h-4 text-emerald-400" />
                        App Settings
                    </h3>

                    {/* Demo Mode Toggle */}
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/20">
                                <Zap className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                                <div className="font-bold text-white text-sm">Demo Mode</div>
                                <div className="text-[10px] text-white/50">Load sample data to explore app features</div>
                            </div>
                        </div>
                        <button
                            onClick={() => dispatch({ type: 'TOGGLE_DEMO_MODE' })}
                            className={cn(
                                "relative w-12 h-6 rounded-full transition-colors duration-200",
                                state.ui_config?.demo_mode
                                    ? "bg-emerald-500"
                                    : "bg-white/20"
                            )}
                        >
                            <motion.div
                                className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                                animate={{ left: state.ui_config?.demo_mode ? 28 : 4 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        </button>
                    </div>

                    {state.ui_config?.demo_mode && (
                        <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2">
                            <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-emerald-300">
                                Demo Mode is active. Viewing sample data for demonstration purposes.
                            </p>
                        </div>
                    )}
                </div>
            </GlassCard>
        </div>
    );
};

