/**
 * HeroCard Component
 * 
 * Premium single-metric hero display with:
 * - Large dominant number
 * - Status color gradient
 * - Trend indicator
 * - Expand-in-place for quick details
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../ui';

// =====================================================
// TYPES
// =====================================================

export interface HeroCardProps {
    value: number | string;
    unit?: '%' | 'ms' | 'kg' | 'min' | 'h' | '';
    label: string;
    sublabel?: string;
    trend?: 'up' | 'down' | 'flat';
    trendValue?: string;
    trendPeriod?: string;
    status?: 'excellent' | 'good' | 'warning' | 'critical';
    expandedContent?: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export const HeroCard: React.FC<HeroCardProps> = ({
    value,
    unit = '%',
    label,
    sublabel,
    trend,
    trendValue,
    trendPeriod,
    status = 'good',
    expandedContent,
    onClick,
    className
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Status-based gradients
    const statusStyles = {
        excellent: {
            gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
            border: 'border-emerald-500/30',
            glow: 'shadow-[0_0_60px_-15px_rgba(16,185,129,0.3)]',
            valueColor: 'text-emerald-400',
            ring: 'ring-emerald-500/20'
        },
        good: {
            gradient: 'from-cyan-500/20 via-cyan-500/5 to-transparent',
            border: 'border-cyan-500/30',
            glow: 'shadow-[0_0_60px_-15px_rgba(6,182,212,0.3)]',
            valueColor: 'text-cyan-400',
            ring: 'ring-cyan-500/20'
        },
        warning: {
            gradient: 'from-amber-500/20 via-amber-500/5 to-transparent',
            border: 'border-amber-500/30',
            glow: 'shadow-[0_0_60px_-15px_rgba(245,158,11,0.3)]',
            valueColor: 'text-amber-400',
            ring: 'ring-amber-500/20'
        },
        critical: {
            gradient: 'from-red-500/20 via-red-500/5 to-transparent',
            border: 'border-red-500/30',
            glow: 'shadow-[0_0_60px_-15px_rgba(239,68,68,0.3)]',
            valueColor: 'text-red-400',
            ring: 'ring-red-500/20'
        }
    };

    const style = statusStyles[status];

    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-white/40';

    const handleClick = () => {
        if (expandedContent) {
            setIsExpanded(!isExpanded);
        }
        onClick?.();
    };

    return (
        <motion.div
            className={cn(
                "relative overflow-hidden rounded-3xl",
                "bg-gradient-to-br",
                style.gradient,
                "border",
                style.border,
                style.glow,
                "backdrop-blur-xl",
                expandedContent && "cursor-pointer",
                "transition-all duration-300",
                className
            )}
            onClick={handleClick}
            whileTap={expandedContent ? { scale: 0.99 } : undefined}
        >
            {/* Main Content */}
            <div className="p-8 text-center">
                {/* Value */}
                <motion.div
                    className={cn(
                        "font-mono font-bold tracking-tighter",
                        style.valueColor
                    )}
                    style={{ fontSize: '64px', lineHeight: 1 }}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    {value}{unit}
                </motion.div>

                {/* Label */}
                <div className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-white/80">
                    {label}
                </div>

                {/* Sublabel */}
                {sublabel && (
                    <div className="mt-1 text-xs text-white/40">
                        {sublabel}
                    </div>
                )}

                {/* Trend */}
                {trend && trendValue && (
                    <div className={cn(
                        "mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
                        "bg-white/5 border border-white/10"
                    )}>
                        <TrendIcon className={cn("w-4 h-4", trendColor)} />
                        <span className={cn("text-sm font-medium", trendColor)}>
                            {trendValue}
                        </span>
                        {trendPeriod && (
                            <span className="text-xs text-white/40">
                                {trendPeriod}
                            </span>
                        )}
                    </div>
                )}

                {/* Expand Indicator */}
                {expandedContent && (
                    <motion.div
                        className="mt-4 flex justify-center"
                        animate={{ y: isExpanded ? 0 : [0, 3, 0] }}
                        transition={{ repeat: isExpanded ? 0 : Infinity, duration: 2 }}
                    >
                        {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-white/30" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-white/30" />
                        )}
                    </motion.div>
                )}
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && expandedContent && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-6 pt-2 border-t border-white/10">
                            {expandedContent}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Decorative Ring */}
            <div className={cn(
                "absolute inset-0 rounded-3xl ring-1 ring-inset pointer-events-none",
                style.ring
            )} />
        </motion.div>
    );
};

export default HeroCard;
