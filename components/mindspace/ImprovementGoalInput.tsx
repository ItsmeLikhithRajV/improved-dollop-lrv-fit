/**
 * ImprovementGoalInput Component
 * 
 * Allows users to input their improvement goals as free text.
 * Auto-detects category and shows suggestions.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, X, Sparkles, Check } from 'lucide-react';
import { GlassCard, Button, Badge, cn } from '../ui';
import {
    MotivationEngine,
    ImprovementGoal,
    ImprovementCategory
} from '../../experts/mental/MotivationEngine';

// =====================================================
// TYPES
// =====================================================

interface ImprovementGoalInputProps {
    onGoalAdded: (goal: ImprovementGoal) => void;
    currentGoals: ImprovementGoal[];
    maxGoals?: number;
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export const ImprovementGoalInput: React.FC<ImprovementGoalInputProps> = ({
    onGoalAdded,
    currentGoals,
    maxGoals = 3
}) => {
    const [inputText, setInputText] = useState('');
    const [detectedCategory, setDetectedCategory] = useState<ImprovementCategory | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const categories = MotivationEngine.getCategories();
    const activeGoals = currentGoals.filter(g => g.active);
    const canAddMore = activeGoals.length < maxGoals;

    // Detect category as user types
    const handleTextChange = (text: string) => {
        setInputText(text);
        if (text.length > 5) {
            const category = MotivationEngine.parseGoalCategory(text);
            setDetectedCategory(category);
        } else {
            setDetectedCategory(null);
        }
    };

    const handleSubmit = () => {
        if (!inputText.trim() || !canAddMore) return;

        const goal = MotivationEngine.createGoal(inputText.trim());
        onGoalAdded(goal);
        setInputText('');
        setDetectedCategory(null);
        setIsExpanded(false);
    };

    const getCategoryInfo = (id: ImprovementCategory) => {
        return categories.find(c => c.id === id) || { label: id, emoji: '🎯' };
    };

    // Quick suggestions
    const suggestions = [
        "Be more consistent",
        "Build confidence",
        "Improve focus",
        "Stay disciplined",
        "Be more resilient",
        "Have more energy"
    ];

    return (
        <div className="space-y-3">
            {/* Current Goals */}
            {activeGoals.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {activeGoals.map(goal => {
                        const info = getCategoryInfo(goal.category);
                        return (
                            <Badge
                                key={goal.id}
                                className="px-3 py-1 bg-primary/20 text-primary"
                            >
                                {info.emoji} {goal.text}
                            </Badge>
                        );
                    })}
                </div>
            )}

            {/* Add Goal Button / Input */}
            <AnimatePresence mode="wait">
                {!isExpanded ? (
                    <motion.button
                        key="collapsed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => canAddMore && setIsExpanded(true)}
                        disabled={!canAddMore}
                        className={cn(
                            "w-full p-4 rounded-xl border border-dashed transition-all flex items-center justify-center gap-2",
                            canAddMore
                                ? "border-white/20 hover:border-primary/50 hover:bg-white/5 cursor-pointer"
                                : "border-white/10 text-white/30 cursor-not-allowed"
                        )}
                    >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">
                            {canAddMore
                                ? `Add improvement goal (${activeGoals.length}/${maxGoals})`
                                : `Maximum ${maxGoals} goals reached`
                            }
                        </span>
                    </motion.button>
                ) : (
                    <motion.div
                        key="expanded"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <GlassCard className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Target className="w-4 h-4 text-primary" />
                                <span className="text-sm font-bold text-white">What do you want to improve?</span>
                                <button
                                    onClick={() => setIsExpanded(false)}
                                    className="ml-auto p-1 hover:bg-white/10 rounded"
                                >
                                    <X className="w-4 h-4 text-white/50" />
                                </button>
                            </div>

                            {/* Input */}
                            <div className="relative mb-3">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => handleTextChange(e.target.value)}
                                    placeholder="I want to..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                    autoFocus
                                />

                                {/* Detected Category */}
                                {detectedCategory && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2"
                                    >
                                        <Badge className="bg-primary/20 text-primary text-[10px]">
                                            {getCategoryInfo(detectedCategory).emoji} {getCategoryInfo(detectedCategory).label}
                                        </Badge>
                                    </motion.div>
                                )}
                            </div>

                            {/* Quick Suggestions */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {suggestions.map((suggestion, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleTextChange(suggestion)}
                                        className="px-3 py-1 bg-white/5 rounded-full text-xs text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>

                            {/* Submit */}
                            <Button
                                size="sm"
                                className="w-full"
                                disabled={!inputText.trim()}
                                onClick={handleSubmit}
                            >
                                <Sparkles className="w-3 h-3 mr-2" />
                                Add Goal
                            </Button>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ImprovementGoalInput;
