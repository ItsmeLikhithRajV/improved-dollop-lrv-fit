/**
 * EXPERT INSIGHT CARD
 * Contextual advice card from expert systems.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { cn } from '../core/primitives';

type ExpertType = 'recovery' | 'nutritionist' | 'mind' | 'performance' | 'longevity' | 'doctor';
type Urgency = 'low' | 'medium' | 'high' | 'critical';

interface ExpertInsightCardProps {
    expert: ExpertType;
    icon: LucideIcon;
    action: string;
    reason?: string;
    timing?: string;
    urgency?: Urgency;
    onClick?: () => void;
    className?: string;
}

const EXPERT_COLORS: Record<ExpertType, { bg: string; text: string; border: string }> = {
    recovery: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
    nutritionist: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
    mind: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30' },
    performance: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
    longevity: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    doctor: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
};

const URGENCY_STYLES: Record<Urgency, string> = {
    low: 'border-l-white/20',
    medium: 'border-l-blue-500',
    high: 'border-l-amber-500',
    critical: 'border-l-red-500',
};

const EXPERT_NAMES: Record<ExpertType, string> = {
    recovery: 'Recovery Expert',
    nutritionist: 'Nutritionist',
    mind: 'Mind Coach',
    performance: 'Performance Lab',
    longevity: 'Longevity',
    doctor: 'Health Alert',
};

export const ExpertInsightCard: React.FC<ExpertInsightCardProps> = ({
    expert,
    icon: Icon,
    action,
    reason,
    timing,
    urgency = 'medium',
    onClick,
    className,
}) => {
    const colors = EXPERT_COLORS[expert];

    return (
        <motion.div
            onClick={onClick}
            className={cn(
                'relative overflow-hidden rounded-xl p-4',
                'bg-white/5 backdrop-blur-sm border border-white/10',
                'border-l-4',
                URGENCY_STYLES[urgency],
                onClick && 'cursor-pointer hover:bg-white/10',
                'transition-colors',
                className
            )}
            whileTap={onClick ? { scale: 0.98 } : {}}
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={cn('p-2 rounded-xl', colors.bg, colors.border, 'border')}>
                    <Icon className={cn('w-4 h-4', colors.text)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-1">
                        <span className={cn('text-[10px] uppercase tracking-widest font-medium', colors.text)}>
                            {EXPERT_NAMES[expert]}
                        </span>
                        {timing && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50">
                                {timing}
                            </span>
                        )}
                    </div>

                    {/* Action */}
                    <h4 className="text-sm font-medium text-white mb-1">{action}</h4>

                    {/* Reason */}
                    {reason && (
                        <p className="text-xs text-white/50 leading-relaxed">{reason}</p>
                    )}
                </div>

                {/* Chevron */}
                {onClick && (
                    <ChevronRight className="w-4 h-4 text-white/30 self-center flex-shrink-0" />
                )}
            </div>
        </motion.div>
    );
};

export default ExpertInsightCard;
