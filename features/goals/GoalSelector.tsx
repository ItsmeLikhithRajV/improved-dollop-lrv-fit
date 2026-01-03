import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Flame, Dumbbell, TrendingDown, TrendingUp, Zap, Heart, Activity, Shield,
    ChevronRight, Check, X
} from 'lucide-react';
import { GlassCard, Button, cn } from '../../components/ui';
import { GoalType, GOAL_METADATA, UserGoal, DEFAULT_USER_GOAL } from '../../types/goals';

const ICON_MAP: Record<string, any> = {
    Flame, Dumbbell, TrendingDown, TrendingUp, Zap, Heart, Activity, Shield
};

interface GoalSelectorProps {
    currentGoal?: UserGoal;
    onComplete: (goal: UserGoal) => void;
    onCancel?: () => void;
    isOnboarding?: boolean;
}

export const GoalSelector: React.FC<GoalSelectorProps> = ({
    currentGoal,
    onComplete,
    onCancel,
    isOnboarding = false
}) => {
    const [step, setStep] = useState<'primary' | 'secondary' | 'confirm'>('primary');
    const [primary, setPrimary] = useState<GoalType | null>(currentGoal?.primary || null);
    const [secondary, setSecondary] = useState<GoalType[]>(currentGoal?.secondary || []);

    const goals = Object.values(GOAL_METADATA);

    const handlePrimarySelect = (goal: GoalType) => {
        setPrimary(goal);
        setStep('secondary');
    };

    const handleSecondaryToggle = (goal: GoalType) => {
        if (goal === primary) return; // Can't select primary as secondary

        setSecondary(prev => {
            if (prev.includes(goal)) {
                return prev.filter(g => g !== goal);
            }
            if (prev.length >= 2) {
                return [prev[1], goal]; // Replace oldest
            }
            return [...prev, goal];
        });
    };

    const handleConfirm = () => {
        if (!primary) return;

        const priority: Record<GoalType, number> = {} as any;
        goals.forEach(g => {
            if (g.id === primary) priority[g.id] = 100;
            else if (secondary.includes(g.id)) priority[g.id] = 50;
            else priority[g.id] = 0;
        });

        onComplete({
            primary,
            secondary,
            priority,
            setAt: Date.now(),
            previousGoal: currentGoal?.primary
        });
    };

    const GoalCard = ({ goal, selected, onClick, disabled }: {
        goal: typeof GOAL_METADATA[GoalType];
        selected: boolean;
        onClick: () => void;
        disabled?: boolean;
    }) => {
        const Icon = ICON_MAP[goal.icon];
        return (
            <motion.button
                whileHover={disabled ? {} : { scale: 1.02 }}
                whileTap={disabled ? {} : { scale: 0.98 }}
                onClick={disabled ? undefined : onClick}
                className={cn(
                    "p-4 rounded-xl border text-left transition-all relative overflow-hidden",
                    selected
                        ? `bg-${goal.color}-500/20 border-${goal.color}-500 ring-2 ring-${goal.color}-500/50`
                        : "bg-white/5 border-white/10 hover:bg-white/10",
                    disabled && "opacity-40 cursor-not-allowed"
                )}
            >
                {selected && (
                    <div className="absolute top-2 right-2">
                        <Check className="w-4 h-4 text-green-400" />
                    </div>
                )}
                <Icon className={cn("w-6 h-6 mb-2", `text-${goal.color}-400`)} />
                <div className="font-bold text-white">{goal.name}</div>
                <div className="text-xs text-white/60 mt-1">{goal.description}</div>
            </motion.button>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <GlassCard className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            {step === 'primary' && 'Choose Your Primary Goal'}
                            {step === 'secondary' && 'Add Secondary Goals (Optional)'}
                            {step === 'confirm' && 'Confirm Your Goals'}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {step === 'primary' && 'This will optimize all your Recovery, Fuel, and Training recommendations'}
                            {step === 'secondary' && 'Select up to 2 additional goals to balance your training'}
                            {step === 'confirm' && 'Your entire Sentient experience will adapt to these goals'}
                        </p>
                    </div>
                    {!isOnboarding && onCancel && (
                        <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Step Indicator */}
                <div className="flex items-center gap-2 mb-6">
                    {['primary', 'secondary', 'confirm'].map((s, i) => (
                        <div key={s} className="flex items-center">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                                step === s ? "bg-primary text-white" :
                                    ['secondary', 'confirm'].indexOf(step) > i - 1 ? "bg-green-500/20 text-green-400" :
                                        "bg-white/10 text-white/40"
                            )}>
                                {['secondary', 'confirm'].indexOf(step) > i - 1 ? <Check className="w-4 h-4" /> : i + 1}
                            </div>
                            {i < 2 && <div className="w-8 h-0.5 bg-white/10 mx-1" />}
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* Step 1: Primary Goal */}
                    {step === 'primary' && (
                        <motion.div
                            key="primary"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="grid grid-cols-2 gap-3"
                        >
                            {goals.map(goal => (
                                <GoalCard
                                    key={goal.id}
                                    goal={goal}
                                    selected={primary === goal.id}
                                    onClick={() => handlePrimarySelect(goal.id)}
                                />
                            ))}
                        </motion.div>
                    )}

                    {/* Step 2: Secondary Goals */}
                    {step === 'secondary' && (
                        <motion.div
                            key="secondary"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
                                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Primary Goal</div>
                                <div className="font-bold text-white flex items-center gap-2">
                                    {primary && GOAL_METADATA[primary].name}
                                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Active</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {goals.filter(g => g.id !== primary).map(goal => (
                                    <GoalCard
                                        key={goal.id}
                                        goal={goal}
                                        selected={secondary.includes(goal.id)}
                                        onClick={() => handleSecondaryToggle(goal.id)}
                                    />
                                ))}
                            </div>

                            <div className="flex justify-between mt-6">
                                <Button variant="ghost" onClick={() => setStep('primary')}>← Back</Button>
                                <Button onClick={() => setStep('confirm')}>
                                    {secondary.length > 0 ? 'Continue' : 'Skip Secondary'} →
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Confirm */}
                    {step === 'confirm' && (
                        <motion.div
                            key="confirm"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <div className="space-y-4 mb-6">
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Primary Goal</div>
                                    <div className="flex items-center gap-3">
                                        {primary && (
                                            <>
                                                {React.createElement(ICON_MAP[GOAL_METADATA[primary].icon], {
                                                    className: `w-8 h-8 text-${GOAL_METADATA[primary].color}-400`
                                                })}
                                                <div>
                                                    <div className="font-bold text-xl text-white">{GOAL_METADATA[primary].name}</div>
                                                    <div className="text-sm text-white/60">{GOAL_METADATA[primary].description}</div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {secondary.length > 0 && (
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Secondary Goals</div>
                                        <div className="flex gap-2">
                                            {secondary.map(s => (
                                                <div key={s} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full">
                                                    {React.createElement(ICON_MAP[GOAL_METADATA[s].icon], {
                                                        className: `w-4 h-4 text-${GOAL_METADATA[s].color}-400`
                                                    })}
                                                    <span className="text-sm font-medium">{GOAL_METADATA[s].name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl mb-6">
                                <div className="font-bold text-white mb-2">What This Means</div>
                                <ul className="text-sm text-white/80 space-y-1">
                                    <li>• <strong>Recovery:</strong> Protocols optimized for {primary && GOAL_METADATA[primary].shortName}</li>
                                    <li>• <strong>Fuel:</strong> Macros and timing adjusted for your goals</li>
                                    <li>• <strong>Training:</strong> Session priorities rebalanced</li>
                                </ul>
                            </div>

                            <div className="flex justify-between">
                                <Button variant="ghost" onClick={() => setStep('secondary')}>← Back</Button>
                                <Button onClick={handleConfirm} className="gap-2">
                                    <Check className="w-4 h-4" /> Confirm Goals
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </GlassCard>
        </div>
    );
};
