/**
 * HERO METRIC CARD
 * Primary score display for each expert tab.
 * Shows the ONE number that matters most.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { cn } from '../core/primitives';

type MetricStatus = 'excellent' | 'optimal' | 'good' | 'moderate' | 'warning' | 'critical';
type Trend = 'up' | 'down' | 'stable';

interface HeroMetricCardProps {
    icon: LucideIcon;
    label: string;
    value: number | string;
    unit?: string;
    status: MetricStatus;
    trend?: Trend;
    trendValue?: string;
    insight?: string;
    onClick?: () => void;
    className?: string;
}

const STATUS_STYLES: Record<MetricStatus, { bg: string; text: string; glow: string }> = {
    excellent: { bg: 'bg-green-500/20', text: 'text-green-400', glow: 'shadow-green-500/20' },
    optimal: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
    good: { bg: 'bg-teal-500/20', text: 'text-teal-400', glow: 'shadow-teal-500/20' },
    moderate: { bg: 'bg-amber-500/20', text: 'text-amber-400', glow: 'shadow-amber-500/20' },
    warning: { bg: 'bg-orange-500/20', text: 'text-orange-400', glow: 'shadow-orange-500/20' },
    critical: { bg: 'bg-red-500/20', text: 'text-red-400', glow: 'shadow-red-500/20' },
};

const TrendIcon: Record<Trend, LucideIcon> = {
    up: TrendingUp,
    down: TrendingDown,
    stable: Minus,
};

export const HeroMetricCard: React.FC<HeroMetricCardProps> = ({
    icon: Icon,
    label,
    value,
    unit,
    status,
    trend,
    trendValue,
    insight,
    onClick,
    className,
}) => {
    const styles = STATUS_STYLES[status];
    const TrendIconComponent = trend ? TrendIcon[trend] : null;

    return (
        <motion.div
            onClick={onClick}
            className={cn(
                'relative overflow-hidden rounded-2xl p-6',
                'bg-white/5 backdrop-blur-xl border border-white/10',
                'shadow-xl',
                styles.glow,
                onClick && 'cursor-pointer',
                className
            )}
            whileHover={onClick ? { scale: 1.01 } : {}}
            whileTap={onClick ? { scale: 0.99 } : {}}
        >
            {/* Background glow */}
            <div className={cn('absolute inset-0 opacity-30', styles.bg)} />

            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                    <div className={cn('p-2 rounded-xl', styles.bg)}>
                        <Icon className={cn('w-5 h-5', styles.text)} />
                    </div>
                    <span className="text-xs uppercase tracking-widest text-white/50 font-medium">
                        {label}
                    </span>
                </div>

                {/* Main Value */}
                <div className="flex items-baseline gap-2 mb-2">
                    <span className={cn('text-5xl font-bold', styles.text)}>
                        {value}
                    </span>
                    {unit && (
                        <span className="text-xl text-white/40">{unit}</span>
                    )}
                </div>

                {/* Trend */}
                {trend && (
                    <div className="flex items-center gap-2 mb-3">
                        {TrendIconComponent && (
                            <TrendIconComponent className={cn(
                                'w-4 h-4',
                                trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-white/40'
                            )} />
                        )}
                        {trendValue && (
                            <span className="text-sm text-white/60">{trendValue}</span>
                        )}
                    </div>
                )}

                {/* Insight */}
                {insight && (
                    <p className="text-sm text-white/70 leading-relaxed">
                        "{insight}"
                    </p>
                )}
            </div>
        </motion.div>
    );
};

export default HeroMetricCard;
