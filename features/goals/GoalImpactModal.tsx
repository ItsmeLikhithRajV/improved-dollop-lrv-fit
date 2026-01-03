import React from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight, AlertTriangle, Snowflake, Utensils, Dumbbell, Check, X, Info
} from 'lucide-react';
import { GlassCard, Button, cn } from '../../components/ui';
import { GoalType, GOAL_METADATA, GOAL_PROTOCOLS } from '../../types/goals';

interface GoalImpactModalProps {
    currentGoal: GoalType;
    newGoal: GoalType;
    trigger: 'mission_change' | 'manual_change';
    missionName?: string;
    onImplement: () => void;
    onKeepCurrent: () => void;
    onClose: () => void;
}

export const GoalImpactModal: React.FC<GoalImpactModalProps> = ({
    currentGoal,
    newGoal,
    trigger,
    missionName,
    onImplement,
    onKeepCurrent,
    onClose
}) => {
    const currentMeta = GOAL_METADATA[currentGoal];
    const newMeta = GOAL_METADATA[newGoal];
    const currentProtocol = GOAL_PROTOCOLS[currentGoal];
    const newProtocol = GOAL_PROTOCOLS[newGoal];

    // Calculate key differences
    const recoveryChanges: string[] = [];
    const fuelChanges: string[] = [];
    const trainingChanges: string[] = [];

    // Recovery differences
    if (currentProtocol.recovery.iceBathPostStrength !== newProtocol.recovery.iceBathPostStrength) {
        const status = newProtocol.recovery.iceBathPostStrength;
        recoveryChanges.push(`Ice bath after strength: ${status === 'recommend' ? '✅ Recommended' : status === 'avoid' ? '❌ Avoid' : '⚠️ Neutral'}`);
    }
    if (currentProtocol.recovery.sleepPriority !== newProtocol.recovery.sleepPriority) {
        recoveryChanges.push(`Sleep priority: ${newProtocol.recovery.sleepPriority.toUpperCase()}`);
    }
    if (currentProtocol.recovery.saunaRecommend !== newProtocol.recovery.saunaRecommend) {
        recoveryChanges.push(`Sauna: ${newProtocol.recovery.saunaRecommend ? '✅ Recommended' : '⚠️ Optional'}`);
    }

    // Fuel differences
    if (currentProtocol.fuel.carbStrategy !== newProtocol.fuel.carbStrategy) {
        fuelChanges.push(`Carb strategy: ${newProtocol.fuel.carbStrategy.replace('_', ' ').toUpperCase()}`);
    }
    if (Math.abs(currentProtocol.fuel.caloricBalance - newProtocol.fuel.caloricBalance) > 100) {
        const balance = newProtocol.fuel.caloricBalance;
        fuelChanges.push(`Caloric target: ${balance > 0 ? '+' : ''}${balance} kcal ${balance > 0 ? '(surplus)' : balance < 0 ? '(deficit)' : '(maintenance)'}`);
    }
    if (currentProtocol.fuel.proteinPerKg[0] !== newProtocol.fuel.proteinPerKg[0]) {
        fuelChanges.push(`Protein: ${newProtocol.fuel.proteinPerKg[0]}-${newProtocol.fuel.proteinPerKg[1]} g/kg`);
    }

    // Training differences
    if (currentProtocol.training.cardioLimit !== newProtocol.training.cardioLimit) {
        trainingChanges.push(`Cardio: ${newProtocol.training.cardioLimit.toUpperCase()}`);
    }
    if (currentProtocol.training.intensityFocus !== newProtocol.training.intensityFocus) {
        trainingChanges.push(`Intensity focus: ${newProtocol.training.intensityFocus.toUpperCase()}`);
    }
    trainingChanges.push(`Priority: ${newProtocol.training.primaryFocus.slice(0, 2).join(', ')}`);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
            >
                <GlassCard className="max-w-lg w-full">
                    {/* Close */}
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full">
                        <X className="w-4 h-4" />
                    </button>

                    {/* Header */}
                    <div className="mb-6">
                        {trigger === 'mission_change' && (
                            <div className="text-xs uppercase tracking-widest text-yellow-400 mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-3 h-3" /> Goal Change Detected
                            </div>
                        )}
                        <h2 className="text-xl font-bold text-white">
                            {trigger === 'mission_change'
                                ? `"${missionName}" suggests a different goal`
                                : 'Changing Your Goal'}
                        </h2>
                    </div>

                    {/* Goal Transition Visual */}
                    <div className="flex items-center justify-center gap-4 mb-6 p-4 bg-white/5 rounded-xl">
                        <div className="text-center">
                            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2", `bg-${currentMeta.color}-500/20`)}>
                                <span className="text-2xl">{currentMeta.shortName[0]}</span>
                            </div>
                            <div className="text-sm font-bold">{currentMeta.name}</div>
                            <div className="text-xs text-muted-foreground">Current</div>
                        </div>
                        <ArrowRight className="w-6 h-6 text-white/40" />
                        <div className="text-center">
                            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2", `bg-${newMeta.color}-500/20`)}>
                                <span className="text-2xl">{newMeta.shortName[0]}</span>
                            </div>
                            <div className="text-sm font-bold">{newMeta.name}</div>
                            <div className="text-xs text-primary">New</div>
                        </div>
                    </div>

                    {/* Impact Breakdown */}
                    <div className="space-y-3 mb-6">
                        {recoveryChanges.length > 0 && (
                            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                                <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold mb-2">
                                    <Snowflake className="w-4 h-4" /> Recovery Impact
                                </div>
                                <ul className="text-xs text-white/80 space-y-1">
                                    {recoveryChanges.map((c, i) => <li key={i}>• {c}</li>)}
                                </ul>
                            </div>
                        )}

                        {fuelChanges.length > 0 && (
                            <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                                <div className="flex items-center gap-2 text-orange-400 text-sm font-bold mb-2">
                                    <Utensils className="w-4 h-4" /> Fuel Impact
                                </div>
                                <ul className="text-xs text-white/80 space-y-1">
                                    {fuelChanges.map((c, i) => <li key={i}>• {c}</li>)}
                                </ul>
                            </div>
                        )}

                        {trainingChanges.length > 0 && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <div className="flex items-center gap-2 text-red-400 text-sm font-bold mb-2">
                                    <Dumbbell className="w-4 h-4" /> Training Impact
                                </div>
                                <ul className="text-xs text-white/80 space-y-1">
                                    {trainingChanges.map((c, i) => <li key={i}>• {c}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Transition Tip */}
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10 mb-6 flex items-start gap-3">
                        <Info className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-white/60">
                            <strong>Tip:</strong> Major goal changes work best with a 1-week transition.
                            Sentient will gradually shift recommendations to avoid disruption.
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={onKeepCurrent}
                        >
                            Keep {currentMeta.shortName}
                        </Button>
                        <Button
                            className="flex-1 gap-2"
                            onClick={onImplement}
                        >
                            <Check className="w-4 h-4" /> Switch to {newMeta.shortName}
                        </Button>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
};
