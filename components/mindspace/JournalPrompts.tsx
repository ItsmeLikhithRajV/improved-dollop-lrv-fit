/**
 * Journal Prompts Component
 * 
 * Structured journaling with sport-specific prompts
 * for pre-session, post-session, daily, and competition contexts.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight, Send, Sparkles, BookOpen,
    Target, Sun, Moon, Trophy, RefreshCw
} from 'lucide-react';
import { Button, GlassCard, Badge, cn } from '../ui';

// =====================================================
// TYPES
// =====================================================

export type JournalContext = 'pre_session' | 'post_session' | 'daily_morning' | 'daily_evening' | 'competition';

interface JournalPromptsProps {
    context: JournalContext;
    onSubmit: (entries: JournalEntry[]) => void;
    onSkip?: () => void;
}

interface JournalEntry {
    prompt: string;
    response: string;
    timestamp: Date;
}

interface PromptSet {
    id: JournalContext;
    title: string;
    emoji: string;
    icon: React.ElementType;
    prompts: string[];
    optional_prompts: string[];
    analysis_focus: string;
}

// =====================================================
// PROMPT DATABASE
// =====================================================

const PROMPT_SETS: Record<JournalContext, PromptSet> = {
    pre_session: {
        id: 'pre_session',
        title: 'Pre-Session Check-In',
        emoji: '🎯',
        icon: Target,
        prompts: [
            'What\'s your intention for today\'s session?',
            'On a scale of 1-10, how ready do you feel physically?',
            'What\'s one thing you want to focus on improving?'
        ],
        optional_prompts: [
            'Is there anything on your mind that might distract you?',
            'How would you rate your motivation right now?',
            'What would make this session a success?'
        ],
        analysis_focus: 'intention_setting'
    },
    post_session: {
        id: 'post_session',
        title: 'Post-Session Reflection',
        emoji: '📝',
        icon: RefreshCw,
        prompts: [
            'What went well today?',
            'What surprised you about your performance?',
            'What\'s one thing you learned?'
        ],
        optional_prompts: [
            'How do you feel compared to before the session?',
            'What would you do differently next time?',
            'Rate your effort today (1-10)'
        ],
        analysis_focus: 'reflection'
    },
    daily_morning: {
        id: 'daily_morning',
        title: 'Morning Mindset',
        emoji: '☀️',
        icon: Sun,
        prompts: [
            'What are you grateful for today?',
            'What\'s your main focus for today?',
            'How are you feeling right now?'
        ],
        optional_prompts: [
            'What challenges might you face today?',
            'What would make today great?',
            'One word to describe your energy:'
        ],
        analysis_focus: 'morning_mindset'
    },
    daily_evening: {
        id: 'daily_evening',
        title: 'Evening Wind-Down',
        emoji: '🌙',
        icon: Moon,
        prompts: [
            'What are you proud of from today?',
            'What did you learn today?',
            'How do you feel right now?'
        ],
        optional_prompts: [
            'Is there anything you need to let go of?',
            'What are you looking forward to tomorrow?',
            'Rate your day overall (1-10)'
        ],
        analysis_focus: 'evening_reflection'
    },
    competition: {
        id: 'competition',
        title: 'Competition Prep',
        emoji: '🏆',
        icon: Trophy,
        prompts: [
            'What does success look like for you today (process, not outcome)?',
            'What\'s your focus cue for key moments?',
            'What would you tell yourself if nerves kick in?'
        ],
        optional_prompts: [
            'What are 3 things in your control today?',
            'What past success can you draw confidence from?',
            'Why are you ready for this?'
        ],
        analysis_focus: 'competition_mental_prep'
    }
};

// =====================================================
// JOURNAL PROMPTS COMPONENT
// =====================================================

export const JournalPrompts: React.FC<JournalPromptsProps> = ({
    context,
    onSubmit,
    onSkip
}) => {
    const promptSet = PROMPT_SETS[context];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [responses, setResponses] = useState<JournalEntry[]>([]);
    const [currentResponse, setCurrentResponse] = useState('');
    const [showOptional, setShowOptional] = useState(false);

    const allPrompts = showOptional
        ? [...promptSet.prompts, ...promptSet.optional_prompts]
        : promptSet.prompts;

    const currentPrompt = allPrompts[currentIndex];
    const isLastPrompt = currentIndex === allPrompts.length - 1;
    const Icon = promptSet.icon;

    const handleNext = () => {
        if (!currentResponse.trim()) return;

        const entry: JournalEntry = {
            prompt: currentPrompt,
            response: currentResponse.trim(),
            timestamp: new Date()
        };

        const newResponses = [...responses, entry];
        setResponses(newResponses);
        setCurrentResponse('');

        if (isLastPrompt) {
            onSubmit(newResponses);
        } else {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleNext();
        }
    };

    const progressPercent = ((currentIndex + 1) / allPrompts.length) * 100;

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h3 className="font-bold text-white flex items-center gap-2">
                        {promptSet.emoji} {promptSet.title}
                    </h3>
                    <p className="text-xs text-white/50">
                        {currentIndex + 1} of {allPrompts.length} prompts
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-white/10 rounded-full mb-8 overflow-hidden">
                <motion.div
                    className="h-full bg-primary rounded-full"
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Prompt */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex-1"
                >
                    <p className="text-xl text-white mb-6 leading-relaxed">
                        {currentPrompt}
                    </p>

                    <textarea
                        value={currentResponse}
                        onChange={(e) => setCurrentResponse(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className={cn(
                            "w-full h-40 bg-white/5 border border-white/10 rounded-xl p-4",
                            "text-white placeholder:text-white/30 resize-none",
                            "focus:outline-none focus:border-primary/50"
                        )}
                        placeholder="Type your response..."
                        autoFocus
                    />
                </motion.div>
            </AnimatePresence>

            {/* Actions */}
            <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-2">
                    {onSkip && (
                        <Button variant="ghost" size="sm" onClick={onSkip}>
                            Skip
                        </Button>
                    )}
                    {!showOptional && promptSet.optional_prompts.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowOptional(true)}
                            className="text-primary"
                        >
                            <Sparkles className="w-3 h-3 mr-1" />
                            More prompts
                        </Button>
                    )}
                </div>

                <Button
                    onClick={handleNext}
                    disabled={!currentResponse.trim()}
                >
                    {isLastPrompt ? 'Complete' : 'Next'}
                    {isLastPrompt ? <Sparkles className="w-4 h-4 ml-1" /> : <ChevronRight className="w-4 h-4 ml-1" />}
                </Button>
            </div>
        </div>
    );
};

// =====================================================
// JOURNAL ENTRY CARD (For History)
// =====================================================

interface JournalEntryCardProps {
    entries: JournalEntry[];
    context: JournalContext;
    date: Date;
}

export const JournalEntryCard: React.FC<JournalEntryCardProps> = ({
    entries,
    context,
    date
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const promptSet = PROMPT_SETS[context];

    return (
        <GlassCard className="p-4">
            <button
                className="w-full flex items-center justify-between"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{promptSet.emoji}</span>
                    <div className="text-left">
                        <div className="font-medium text-white">{promptSet.title}</div>
                        <div className="text-xs text-white/50">
                            {date.toLocaleDateString()} • {entries.length} entries
                        </div>
                    </div>
                </div>
                <ChevronRight className={cn(
                    "w-5 h-5 text-white/30 transition-transform",
                    isExpanded && "rotate-90"
                )} />
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-4 mt-4 border-t border-white/10 space-y-4">
                            {entries.map((entry, i) => (
                                <div key={i}>
                                    <p className="text-xs text-white/40 mb-1">{entry.prompt}</p>
                                    <p className="text-sm text-white/80">{entry.response}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </GlassCard>
    );
};

// =====================================================
// CONTEXT PICKER
// =====================================================

interface JournalContextPickerProps {
    onSelect: (context: JournalContext) => void;
    suggestedContext?: JournalContext;
}

export const JournalContextPicker: React.FC<JournalContextPickerProps> = ({
    onSelect,
    suggestedContext
}) => {
    const contexts: JournalContext[] = ['pre_session', 'post_session', 'daily_morning', 'daily_evening', 'competition'];

    return (
        <div className="space-y-3">
            <h4 className="text-xs text-white/50 uppercase tracking-wider mb-3">
                Choose your journal type
            </h4>

            {contexts.map(contextId => {
                const promptSet = PROMPT_SETS[contextId];
                const Icon = promptSet.icon;
                const isSuggested = contextId === suggestedContext;

                return (
                    <button
                        key={contextId}
                        onClick={() => onSelect(contextId)}
                        className={cn(
                            "w-full flex items-center gap-3 p-4 rounded-xl border transition-all",
                            isSuggested
                                ? "border-primary bg-primary/10"
                                : "border-white/10 bg-white/5 hover:bg-white/10"
                        )}
                    >
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            isSuggested ? "bg-primary/30" : "bg-white/10"
                        )}>
                            <Icon className={cn(
                                "w-5 h-5",
                                isSuggested ? "text-primary" : "text-white/70"
                            )} />
                        </div>
                        <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                                <span className="text-white font-medium">{promptSet.title}</span>
                                {isSuggested && (
                                    <Badge className="text-[10px] bg-primary/20 text-primary">
                                        Suggested
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-white/50">
                                {promptSet.prompts.length} prompts
                            </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/30" />
                    </button>
                );
            })}
        </div>
    );
};

export default JournalPrompts;
