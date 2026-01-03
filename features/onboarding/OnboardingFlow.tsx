
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, ArrowRight, ArrowLeft, Check, User, Target,
    Activity, Moon, Dumbbell, Brain, Heart
} from 'lucide-react';
import { Button, GlassCard, cn } from '../../components/ui';
import { useSentient } from '../../store/SentientContext';

interface OnboardingStep {
    id: string;
    title: string;
    subtitle: string;
    icon: React.FC<any>;
}

const STEPS: OnboardingStep[] = [
    { id: 'welcome', title: 'Welcome to Sentient', subtitle: 'Your intelligent performance system', icon: Sparkles },
    { id: 'profile', title: 'Your Profile', subtitle: 'Help us personalize your experience', icon: User },
    { id: 'goals', title: 'Your Goals', subtitle: 'What are you training for?', icon: Target },
    { id: 'baselines', title: 'Baseline Metrics', subtitle: 'Your starting point', icon: Activity },
    { id: 'complete', title: 'You\'re All Set!', subtitle: 'Start your journey', icon: Check }
];

const SPORT_OPTIONS = [
    'Football', 'Basketball', 'Running', 'Cycling', 'Swimming',
    'Tennis', 'CrossFit', 'Weightlifting', 'MMA', 'General Fitness'
];

const GOAL_OPTIONS = [
    { id: 'performance', label: 'Peak Performance', icon: Activity, description: 'Optimize for competition' },
    { id: 'longevity', label: 'Longevity', icon: Heart, description: 'Sustainable health' },
    { id: 'recovery', label: 'Better Recovery', icon: Moon, description: 'Bounce back faster' },
    { id: 'strength', label: 'Build Strength', icon: Dumbbell, description: 'Get stronger' },
    { id: 'mental', label: 'Mental Clarity', icon: Brain, description: 'Sharpen focus' }
];

export const OnboardingFlow: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const { state, dispatch, sync } = useSentient();
    const [currentStep, setCurrentStep] = useState(0);

    // Form state
    const [name, setName] = useState(state.user_profile.name || '');
    const [sport, setSport] = useState<string>(state.user_profile.sport_type || 'general');
    const [selectedGoals, setSelectedGoals] = useState<string[]>(state.user_profile.goals || []);
    const [sleepNeed, setSleepNeed] = useState(state.user_profile.baselines?.sleep_need || 8);
    const [hrvBaseline, setHrvBaseline] = useState(state.user_profile.baselines?.hrv_baseline || 65);

    const step = STEPS[currentStep];
    const isLastStep = currentStep === STEPS.length - 1;
    const isFirstStep = currentStep === 0;

    const handleNext = () => {
        if (isLastStep) {
            // Save profile and complete onboarding
            sync('profile_updated', {
                user_profile: {
                    ...state.user_profile,
                    name,
                    sport_type: sport,
                    goals: selectedGoals,
                    baselines: {
                        ...state.user_profile.baselines,
                        sleep_need: sleepNeed,
                        hrv_baseline: hrvBaseline
                    }
                }
            });
            onComplete();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (!isFirstStep) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const toggleGoal = (goalId: string) => {
        setSelectedGoals(prev =>
            prev.includes(goalId)
                ? prev.filter(g => g !== goalId)
                : [...prev, goalId]
        );
    };

    return (
        <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-4">
            {/* Background Effects */}
            <motion.div
                className="absolute inset-0 opacity-30"
                style={{
                    background: 'radial-gradient(circle at 30% 20%, hsl(var(--primary)) 0%, transparent 50%), radial-gradient(circle at 70% 80%, hsl(var(--secondary)) 0%, transparent 50%)'
                }}
                animate={{ opacity: [0.2, 0.3, 0.2] }}
                transition={{ duration: 8, repeat: Infinity }}
            />

            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-lg"
            >
                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mb-6">
                    {STEPS.map((s, i) => (
                        <div
                            key={s.id}
                            className={cn(
                                "w-2 h-2 rounded-full transition-all",
                                i === currentStep
                                    ? "w-8 bg-primary"
                                    : i < currentStep
                                        ? "bg-primary/50"
                                        : "bg-white/20"
                            )}
                        />
                    ))}
                </div>

                <GlassCard className="p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                                    <step.icon className="w-8 h-8 text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">{step.title}</h2>
                                <p className="text-muted-foreground">{step.subtitle}</p>
                            </div>

                            {/* Step Content */}
                            <div className="min-h-[200px]">
                                {step.id === 'welcome' && (
                                    <div className="text-center space-y-4">
                                        <p className="text-white/80 leading-relaxed">
                                            Sentient learns your patterns, predicts your needs, and guides you toward peak performance.
                                        </p>
                                        <div className="grid grid-cols-3 gap-4 mt-6">
                                            <div className="p-4 rounded-lg bg-white/5">
                                                <Activity className="w-6 h-6 text-primary mx-auto mb-2" />
                                                <div className="text-xs text-muted-foreground">Track</div>
                                            </div>
                                            <div className="p-4 rounded-lg bg-white/5">
                                                <Brain className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                                                <div className="text-xs text-muted-foreground">Learn</div>
                                            </div>
                                            <div className="p-4 rounded-lg bg-white/5">
                                                <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
                                                <div className="text-xs text-muted-foreground">Optimize</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step.id === 'profile' && (
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                                                Your Name
                                            </label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Enter your name"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                                                Primary Sport
                                            </label>
                                            <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                                                {SPORT_OPTIONS.map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => setSport(s.toLowerCase())}
                                                        className={cn(
                                                            "px-3 py-2 rounded-lg border text-sm transition-all",
                                                            sport === s.toLowerCase()
                                                                ? "border-primary bg-primary/10 text-white"
                                                                : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                                                        )}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step.id === 'goals' && (
                                    <div className="space-y-3">
                                        {GOAL_OPTIONS.map(goal => (
                                            <button
                                                key={goal.id}
                                                onClick={() => toggleGoal(goal.label)}
                                                className={cn(
                                                    "w-full flex items-center gap-4 p-4 rounded-lg border text-left transition-all",
                                                    selectedGoals.includes(goal.label)
                                                        ? "border-primary bg-primary/10"
                                                        : "border-white/10 bg-white/5 hover:bg-white/10"
                                                )}
                                            >
                                                <goal.icon className={cn(
                                                    "w-5 h-5",
                                                    selectedGoals.includes(goal.label) ? "text-primary" : "text-muted-foreground"
                                                )} />
                                                <div className="flex-1">
                                                    <div className="font-medium text-white">{goal.label}</div>
                                                    <div className="text-xs text-muted-foreground">{goal.description}</div>
                                                </div>
                                                {selectedGoals.includes(goal.label) && (
                                                    <Check className="w-5 h-5 text-primary" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {step.id === 'baselines' && (
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex justify-between">
                                                <span>Sleep Need</span>
                                                <span className="text-white font-mono">{sleepNeed}h</span>
                                            </label>
                                            <input
                                                type="range"
                                                min={5}
                                                max={10}
                                                step={0.5}
                                                value={sleepNeed}
                                                onChange={(e) => setSleepNeed(Number(e.target.value))}
                                                className="w-full accent-primary"
                                            />
                                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                <span>5h</span>
                                                <span>10h</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex justify-between">
                                                <span>HRV Baseline</span>
                                                <span className="text-white font-mono">{hrvBaseline}ms</span>
                                            </label>
                                            <input
                                                type="range"
                                                min={20}
                                                max={120}
                                                value={hrvBaseline}
                                                onChange={(e) => setHrvBaseline(Number(e.target.value))}
                                                className="w-full accent-primary"
                                            />
                                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                <span>20ms</span>
                                                <span>120ms</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground text-center">
                                            Tip: You can update these later as you learn more about your body.
                                        </p>
                                    </div>
                                )}

                                {step.id === 'complete' && (
                                    <div className="text-center space-y-4">
                                        <div className="w-24 h-24 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                                            <Check className="w-12 h-12 text-green-400" />
                                        </div>
                                        <p className="text-white/80 leading-relaxed">
                                            Your profile is set up. Sentient will learn more about you over time and provide increasingly personalized recommendations.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={isFirstStep}
                            className={cn(isFirstStep && "invisible")}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <Button onClick={handleNext}>
                            {isLastStep ? 'Start Using Sentient' : 'Continue'}
                            {!isLastStep && <ArrowRight className="w-4 h-4 ml-2" />}
                        </Button>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
};
