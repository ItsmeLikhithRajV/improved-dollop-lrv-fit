import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, ArrowRight, X, Clock, Sparkles } from 'lucide-react';
import { GlassCard, Button, cn } from '../../../components/ui';
import { MissionSuggestion } from '../types/prTypes';

interface MissionSuggestionModalProps {
    suggestion: MissionSuggestion | null;
    onImplement: (id: string) => void;
    onIgnore: (id: string) => void;
    onRemindLater: (id: string) => void;
    onClose: () => void;
}

const SUGGESTION_COLORS: Record<MissionSuggestion['type'], { bg: string; border: string; icon: string }> = {
    phase_transition: { bg: 'from-purple-500/20', border: 'border-purple-500/30', icon: 'text-purple-400' },
    plateau_break: { bg: 'from-orange-500/20', border: 'border-orange-500/30', icon: 'text-orange-400' },
    deload: { bg: 'from-green-500/20', border: 'border-green-500/30', icon: 'text-green-400' },
    taper: { bg: 'from-cyan-500/20', border: 'border-cyan-500/30', icon: 'text-cyan-400' },
    load_increase: { bg: 'from-red-500/20', border: 'border-red-500/30', icon: 'text-red-400' },
};

export const MissionSuggestionModal: React.FC<MissionSuggestionModalProps> = ({
    suggestion,
    onImplement,
    onIgnore,
    onRemindLater,
    onClose,
}) => {
    if (!suggestion) return null;

    const colors = SUGGESTION_COLORS[suggestion.type];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
                <GlassCard className={cn(
                    "max-w-md w-full relative overflow-hidden border-t-4",
                    colors.border,
                    `bg-gradient-to-br ${colors.bg} to-transparent`
                )}>
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full z-10"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Header */}
                    <div className="flex items-start gap-4 mb-6">
                        <div className={cn("p-3 rounded-xl bg-white/10", colors.icon)}>
                            <Lightbulb className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1 flex items-center gap-2">
                                <Sparkles className="w-3 h-3" /> Agent Suggestion
                            </div>
                            <h2 className="text-xl font-bold text-white">{suggestion.title}</h2>
                        </div>
                    </div>

                    {/* Reasoning */}
                    <div className="mb-6">
                        <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Why This Suggestion?</div>
                        <p className="text-sm text-white/80 leading-relaxed bg-white/5 p-4 rounded-lg border border-white/10">
                            {suggestion.reasoning}
                        </p>
                    </div>

                    {/* Impact */}
                    <div className="mb-6">
                        <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Expected Impact</div>
                        <div className="flex items-center gap-2 text-sm text-white/80 bg-white/5 p-4 rounded-lg border border-white/10">
                            <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
                            {suggestion.impact}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                        <Button
                            className="w-full h-12 bg-primary hover:bg-primary/90"
                            onClick={() => onImplement(suggestion.id)}
                        >
                            ✓ Implement This
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1 h-10"
                                onClick={() => onRemindLater(suggestion.id)}
                            >
                                <Clock className="w-4 h-4 mr-2" /> Remind Later
                            </Button>
                            <Button
                                variant="ghost"
                                className="flex-1 h-10 text-white/40 hover:text-white"
                                onClick={() => onIgnore(suggestion.id)}
                            >
                                Ignore
                            </Button>
                        </div>
                    </div>

                    {/* Learning Note */}
                    <div className="mt-4 pt-4 border-t border-white/10 text-center">
                        <p className="text-[10px] text-white/30">
                            Your choices help Sentient learn your preferences and improve future suggestions.
                        </p>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
};
