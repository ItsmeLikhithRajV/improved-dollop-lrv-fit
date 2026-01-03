/**
 * MotivationalCard Component
 * 
 * Displays inspirational quotes, tips, and affirmations
 * based on user's improvement goals.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, RefreshCw, X, Quote, Lightbulb, Target } from 'lucide-react';
import { GlassCard, Button, cn } from '../ui';
import {
    MotivationalCard as MotivationalCardType,
    MotivationalQuote,
    MotivationEngine
} from '../../experts/mental/MotivationEngine';

// =====================================================
// TYPES
// =====================================================

interface MotivationalCardProps {
    card: MotivationalCardType;
    onDismiss?: () => void;
    onRefresh?: () => void;
    onFavorite?: (quoteId: string) => void;
    isFavorite?: boolean;
    showTip?: boolean;
    variant?: 'default' | 'compact' | 'celebration';
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export const MotivationalCard: React.FC<MotivationalCardProps> = ({
    card,
    onDismiss,
    onRefresh,
    onFavorite,
    isFavorite = false,
    showTip = true,
    variant = 'default'
}) => {
    const [showingTip, setShowingTip] = useState(false);

    // Energy-based gradients
    const energyGradients = {
        calm: 'from-blue-900/40 to-indigo-900/40',
        energizing: 'from-orange-900/40 to-red-900/40',
        grounding: 'from-green-900/40 to-teal-900/40'
    };

    const gradient = energyGradients[card.quote.energy];

    if (variant === 'compact') {
        return (
            <GlassCard className={cn("p-4 bg-gradient-to-br", gradient)}>
                <div className="flex items-start gap-3">
                    <Quote className="w-5 h-5 text-white/30 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/90 italic mb-1 line-clamp-2">
                            "{card.quote.text}"
                        </p>
                        <p className="text-xs text-white/50">— {card.quote.author}</p>
                    </div>
                </div>
            </GlassCard>
        );
    }

    if (variant === 'celebration') {
        return (
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
            >
                <GlassCard className="p-6 text-center border-2 border-primary/30 bg-gradient-to-br from-primary/20 to-purple-900/20">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-5xl mb-4"
                    >
                        🎉
                    </motion.div>

                    <h3 className="text-xl font-bold text-white mb-2">
                        {card.quote.text}
                    </h3>

                    {card.goal && (
                        <p className="text-sm text-white/60 mb-4">
                            Your goal: <span className="text-primary">{card.goal.text}</span>
                        </p>
                    )}

                    {onDismiss && (
                        <Button variant="outline" size="sm" onClick={onDismiss}>
                            Keep Going!
                        </Button>
                    )}
                </GlassCard>
            </motion.div>
        );
    }

    // Default full card
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <GlassCard className={cn("p-6 bg-gradient-to-br relative overflow-hidden", gradient)}>
                {/* Background decoration */}
                <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
                    <Quote className="w-32 h-32 -rotate-12" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-[10px] uppercase tracking-wider text-white/50">
                            {card.context === 'morning' && 'Daily Motivation'}
                            {card.context === 'post_session' && 'Well Done'}
                            {card.context === 'struggle' && 'Remember'}
                            {card.context === 'celebration' && 'Milestone!'}
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        {onRefresh && (
                            <button
                                onClick={onRefresh}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <RefreshCw className="w-4 h-4 text-white/40" />
                            </button>
                        )}
                        {onFavorite && (
                            <button
                                onClick={() => onFavorite(card.quote.id)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <Heart className={cn(
                                    "w-4 h-4",
                                    isFavorite ? "fill-red-500 text-red-500" : "text-white/40"
                                )} />
                            </button>
                        )}
                        {onDismiss && (
                            <button
                                onClick={onDismiss}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4 text-white/40" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Quote */}
                <blockquote className="relative z-10 mb-4">
                    <p className="text-lg md:text-xl font-medium text-white leading-relaxed mb-2">
                        "{card.quote.text}"
                    </p>
                    <footer className="text-sm text-white/60">
                        — {card.quote.author}
                    </footer>
                </blockquote>

                {/* Goal tag */}
                {card.goal && (
                    <div className="flex items-center gap-2 mb-4">
                        <Target className="w-3 h-3 text-white/40" />
                        <span className="text-xs text-white/50">For your goal: </span>
                        <span className="text-xs text-primary font-medium">{card.goal.text}</span>
                    </div>
                )}

                {/* Tip section */}
                {showTip && card.tip && (
                    <AnimatePresence>
                        {!showingTip ? (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={() => setShowingTip(true)}
                                className="flex items-center gap-2 text-xs text-primary/70 hover:text-primary transition-colors"
                            >
                                <Lightbulb className="w-3 h-3" />
                                Show tip
                            </motion.button>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-4 pt-4 border-t border-white/10"
                            >
                                <div className="flex items-start gap-2">
                                    <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-white/70">{card.tip}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </GlassCard>
        </motion.div>
    );
};

// =====================================================
// SIMPLE QUOTE DISPLAY
// =====================================================

export const SimpleQuote: React.FC<{ quote: MotivationalQuote }> = ({ quote }) => (
    <div className="text-center">
        <p className="text-sm italic text-white/80 mb-1">"{quote.text}"</p>
        <p className="text-xs text-white/40">— {quote.author}</p>
    </div>
);

export default MotivationalCard;
