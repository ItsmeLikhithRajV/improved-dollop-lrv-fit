/**
 * ContextualCard Component
 * 
 * Smart cards that show based on context:
 * - Alerts (issues)
 * - Insights (discoveries)
 * - Actions (things to do)
 * - Celebrations (achievements)
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
    AlertTriangle, Lightbulb, Target, Trophy,
    ChevronRight, X, Sparkles
} from 'lucide-react';
import { cn } from '../ui';

// =====================================================
// TYPES
// =====================================================

export type ContextualCardType = 'alert' | 'insight' | 'action' | 'celebration';

export interface ContextualCardProps {
    type: ContextualCardType;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
    onDismiss?: () => void;
    priority?: 'high' | 'medium' | 'low';
    icon?: React.ReactNode;
    className?: string;
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export const ContextualCard: React.FC<ContextualCardProps> = ({
    type,
    title,
    description,
    action,
    secondaryAction,
    onDismiss,
    priority = 'medium',
    icon,
    className
}) => {
    // Type-based styles
    const typeStyles = {
        alert: {
            bg: 'bg-gradient-to-r from-amber-500/10 to-transparent',
            border: 'border-l-4 border-l-amber-500 border-t-0 border-r-0 border-b-0',
            outerBorder: 'border border-amber-500/20',
            iconBg: 'bg-amber-500/20',
            iconColor: 'text-amber-400',
            defaultIcon: <AlertTriangle className="w-5 h-5" />
        },
        insight: {
            bg: 'bg-gradient-to-r from-cyan-500/10 to-transparent',
            border: 'border-l-4 border-l-cyan-500 border-t-0 border-r-0 border-b-0',
            outerBorder: 'border border-cyan-500/20',
            iconBg: 'bg-cyan-500/20',
            iconColor: 'text-cyan-400',
            defaultIcon: <Lightbulb className="w-5 h-5" />
        },
        action: {
            bg: 'bg-gradient-to-r from-primary/10 to-transparent',
            border: 'border-l-4 border-l-primary border-t-0 border-r-0 border-b-0',
            outerBorder: 'border border-primary/20',
            iconBg: 'bg-primary/20',
            iconColor: 'text-primary',
            defaultIcon: <Target className="w-5 h-5" />
        },
        celebration: {
            bg: 'bg-gradient-to-r from-emerald-500/10 to-transparent',
            border: 'border-l-4 border-l-emerald-500 border-t-0 border-r-0 border-b-0',
            outerBorder: 'border border-emerald-500/20',
            iconBg: 'bg-emerald-500/20',
            iconColor: 'text-emerald-400',
            defaultIcon: <Trophy className="w-5 h-5" />
        }
    };

    const style = typeStyles[type];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className={cn(
                "relative overflow-hidden rounded-2xl",
                style.bg,
                style.border,
                style.outerBorder,
                "backdrop-blur-sm",
                className
            )}
        >
            <div className="p-5">
                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={cn(
                        "flex-shrink-0 p-2.5 rounded-xl",
                        style.iconBg
                    )}>
                        <div className={style.iconColor}>
                            {icon || style.defaultIcon}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="text-base font-bold text-white">
                                {title}
                            </h3>

                            {/* Dismiss button */}
                            {onDismiss && (
                                <button
                                    onClick={onDismiss}
                                    className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-4 h-4 text-white/40" />
                                </button>
                            )}
                        </div>

                        {/* Description */}
                        {description && (
                            <p className="mt-1.5 text-sm text-white/60 leading-relaxed">
                                {description}
                            </p>
                        )}

                        {/* Actions */}
                        {(action || secondaryAction) && (
                            <div className="flex items-center gap-3 mt-4">
                                {action && (
                                    <button
                                        onClick={action.onClick}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-xl",
                                            "bg-white/10 hover:bg-white/15",
                                            "text-sm font-semibold text-white",
                                            "transition-all active:scale-95"
                                        )}
                                    >
                                        {action.label}
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                )}

                                {secondaryAction && (
                                    <button
                                        onClick={secondaryAction.onClick}
                                        className="text-sm text-white/50 hover:text-white/80 transition-colors"
                                    >
                                        {secondaryAction.label}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Celebration sparkles */}
            {type === 'celebration' && (
                <Sparkles className="absolute top-3 right-3 w-4 h-4 text-emerald-400/50" />
            )}
        </motion.div>
    );
};

export default ContextualCard;
