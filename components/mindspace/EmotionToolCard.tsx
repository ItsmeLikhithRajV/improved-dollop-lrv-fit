/**
 * Emotion Tool Card Component
 * 
 * Quick-access cards for emotion regulation techniques
 * with guided steps and tracking.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check, X, Clock, Star, BookOpen } from 'lucide-react';
import { Button, GlassCard, Badge, cn } from '../ui';
import { EmotionRegulationTool } from '../../experts/mental/EmotionRegulationToolkit';

// =====================================================
// TYPES
// =====================================================

interface EmotionToolCardProps {
    tool: EmotionRegulationTool;
    onSelect?: (tool: EmotionRegulationTool) => void;
    onComplete?: (tool: EmotionRegulationTool, rating: number) => void;
    compact?: boolean;
}

interface ToolGuideModalProps {
    tool: EmotionRegulationTool;
    onClose: () => void;
    onComplete: (rating: number) => void;
}

// =====================================================
// TOOL GUIDE MODAL (Full Screen Guide)
// =====================================================

const ToolGuideModal: React.FC<ToolGuideModalProps> = ({ tool, onClose, onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [rating, setRating] = useState(0);

    const steps = tool.steps;
    const totalSteps = steps.length;

    const nextStep = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setIsComplete(true);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = () => {
        onComplete(rating);
    };

    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#0a0a1a] to-[#1a1a3a] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{tool.emoji}</span>
                    <div>
                        <h2 className="text-lg font-bold text-white">{tool.name}</h2>
                        <div className="flex items-center gap-2 text-xs text-white/50">
                            <Clock className="w-3 h-3" />
                            {tool.duration_minutes} min
                        </div>
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="w-5 h-5" />
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6">
                <AnimatePresence mode="wait">
                    {!isComplete ? (
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="text-center max-w-md"
                        >
                            {/* Step indicator */}
                            <div className="flex items-center justify-center gap-2 mb-8">
                                {steps.map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "w-2 h-2 rounded-full transition-colors",
                                            i === currentStep ? "bg-primary" :
                                                i < currentStep ? "bg-green-500" : "bg-white/20"
                                        )}
                                    />
                                ))}
                            </div>

                            {/* Step number */}
                            <div className="text-xs text-white/40 uppercase tracking-wider mb-4">
                                Step {currentStep + 1} of {totalSteps}
                            </div>

                            {/* Step content */}
                            <p className="text-xl text-white leading-relaxed mb-12">
                                {steps[currentStep]}
                            </p>

                            {/* Navigation */}
                            <div className="flex items-center justify-center gap-4">
                                {currentStep > 0 && (
                                    <Button variant="outline" onClick={prevStep}>
                                        Back
                                    </Button>
                                )}
                                <Button onClick={nextStep}>
                                    {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center max-w-md"
                        >
                            <div className="text-5xl mb-6">✨</div>
                            <h3 className="text-2xl font-bold text-white mb-2">Well Done</h3>
                            <p className="text-white/60 mb-8">
                                How helpful was this technique?
                            </p>

                            {/* Rating */}
                            <div className="flex items-center justify-center gap-2 mb-8">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className="p-2 hover:scale-110 transition-transform"
                                    >
                                        <Star
                                            className={cn(
                                                "w-8 h-8 transition-colors",
                                                star <= rating ? "text-yellow-400 fill-yellow-400" : "text-white/30"
                                            )}
                                        />
                                    </button>
                                ))}
                            </div>

                            <Button className="w-full" onClick={handleComplete}>
                                Done
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Science panel */}
            {!isComplete && (
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-start gap-2 text-xs text-white/40">
                        <BookOpen className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <p>{tool.science}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

// =====================================================
// EMOTION TOOL CARD
// =====================================================

export const EmotionToolCard: React.FC<EmotionToolCardProps> = ({
    tool,
    onSelect,
    onComplete,
    compact = false
}) => {
    const [showGuide, setShowGuide] = useState(false);

    const handleClick = () => {
        if (onSelect) {
            onSelect(tool);
        }
        setShowGuide(true);
    };

    const handleComplete = (rating: number) => {
        setShowGuide(false);
        if (onComplete) {
            onComplete(tool, rating);
        }
    };

    const strategyColors: Record<string, string> = {
        cognitive: 'bg-blue-500/20 text-blue-400',
        somatic: 'bg-green-500/20 text-green-400',
        behavioral: 'bg-orange-500/20 text-orange-400',
        interpersonal: 'bg-purple-500/20 text-purple-400',
        mindfulness: 'bg-cyan-500/20 text-cyan-400'
    };

    if (compact) {
        return (
            <>
                <button
                    onClick={handleClick}
                    className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border border-white/10",
                        "bg-white/5 hover:bg-white/10 transition-colors text-left w-full"
                    )}
                >
                    <span className="text-2xl">{tool.emoji}</span>
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">{tool.name}</div>
                        <div className="text-xs text-white/50">{tool.duration_minutes} min</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/30" />
                </button>

                <AnimatePresence>
                    {showGuide && (
                        <ToolGuideModal
                            tool={tool}
                            onClose={() => setShowGuide(false)}
                            onComplete={handleComplete}
                        />
                    )}
                </AnimatePresence>
            </>
        );
    }

    return (
        <>
            <GlassCard
                className="p-4 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={handleClick}
            >
                <div className="flex items-start gap-3">
                    <span className="text-3xl">{tool.emoji}</span>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-white">{tool.name}</h4>
                            <Badge className={cn("text-[10px]", strategyColors[tool.strategy])}>
                                {tool.strategy}
                            </Badge>
                        </div>
                        <p className="text-xs text-white/60 mb-2 line-clamp-2">
                            {tool.description}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-white/40">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {tool.duration_minutes} min
                            </span>
                            {tool.evidence_level === 'strong' && (
                                <span className="text-green-400">Strong evidence</span>
                            )}
                            {tool.can_do_publicly && (
                                <span>Can do anywhere</span>
                            )}
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/30 flex-shrink-0 mt-2" />
                </div>
            </GlassCard>

            <AnimatePresence>
                {showGuide && (
                    <ToolGuideModal
                        tool={tool}
                        onClose={() => setShowGuide(false)}
                        onComplete={handleComplete}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

// =====================================================
// QUICK EMOTION PICKER
// =====================================================

interface QuickEmotionPickerProps {
    onEmotionSelect: (emotion: string, intensity: number) => void;
}

export const QuickEmotionPicker: React.FC<QuickEmotionPickerProps> = ({ onEmotionSelect }) => {
    const emotions = [
        { id: 'anxiety', emoji: '😰', label: 'Anxious' },
        { id: 'anger', emoji: '😤', label: 'Frustrated' },
        { id: 'doubt', emoji: '😔', label: 'Doubting' },
        { id: 'overwhelm', emoji: '🤯', label: 'Overwhelmed' },
        { id: 'fear', emoji: '😨', label: 'Scared' },
        { id: 'shame', emoji: '😞', label: 'Down on self' }
    ];

    const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
    const [intensity, setIntensity] = useState(5);

    const handleEmotionClick = (emotionId: string) => {
        if (selectedEmotion === emotionId) {
            // Submit
            onEmotionSelect(emotionId, intensity);
            setSelectedEmotion(null);
        } else {
            setSelectedEmotion(emotionId);
        }
    };

    return (
        <div>
            <h4 className="text-xs text-white/50 uppercase tracking-wider mb-3">
                What are you feeling?
            </h4>

            <div className="grid grid-cols-3 gap-2 mb-4">
                {emotions.map(emotion => (
                    <button
                        key={emotion.id}
                        onClick={() => handleEmotionClick(emotion.id)}
                        className={cn(
                            "flex flex-col items-center p-3 rounded-lg border transition-all",
                            selectedEmotion === emotion.id
                                ? "border-primary bg-primary/20"
                                : "border-white/10 bg-white/5 hover:bg-white/10"
                        )}
                    >
                        <span className="text-2xl mb-1">{emotion.emoji}</span>
                        <span className="text-xs text-white/70">{emotion.label}</span>
                    </button>
                ))}
            </div>

            {selectedEmotion && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3"
                >
                    <div>
                        <label className="text-xs text-white/50 mb-2 block">
                            Intensity: {intensity}/10
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={intensity}
                            onChange={(e) => setIntensity(parseInt(e.target.value))}
                            className="w-full accent-primary"
                        />
                    </div>
                    <Button
                        className="w-full"
                        onClick={() => onEmotionSelect(selectedEmotion, intensity)}
                    >
                        Find a Tool
                    </Button>
                </motion.div>
            )}
        </div>
    );
};

export default EmotionToolCard;
