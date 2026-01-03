/**
 * QuickStatsRow Component
 * 
 * Compact row of 3-4 key metrics with:
 * - Mini sparklines/trends
 * - Status indicators
 * - Responsive layout
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../ui';

// =====================================================
// TYPES
// =====================================================

export interface QuickStat {
    id: string;
    label: string;
    value: string | number;
    unit?: string;
    trend?: 'up' | 'down' | 'flat';
    trendValue?: string;
    status?: 'good' | 'warning' | 'critical' | 'neutral';
    icon?: React.ReactNode;
}

export interface QuickStatsRowProps {
    stats: QuickStat[];
    className?: string;
    columns?: 2 | 3 | 4;
}

// =====================================================
// SINGLE STAT COMPONENT
// =====================================================

const StatCell: React.FC<{ stat: QuickStat; index: number }> = ({ stat, index }) => {
    const TrendIcon = stat.trend === 'up' ? TrendingUp
        : stat.trend === 'down' ? TrendingDown
            : Minus;

    const trendColor = stat.trend === 'up' ? 'text-emerald-400'
        : stat.trend === 'down' ? 'text-red-400'
            : 'text-white/30';

    const statusColor = {
        good: 'text-emerald-400',
        warning: 'text-amber-400',
        critical: 'text-red-400',
        neutral: 'text-white/80'
    }[stat.status || 'neutral'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
                "flex flex-col items-center justify-center py-4 px-3",
                "bg-white/[0.02] rounded-2xl",
                "border border-white/[0.06]"
            )}
        >
            {/* Icon */}
            {stat.icon && (
                <div className="text-white/30 mb-1">
                    {stat.icon}
                </div>
            )}

            {/* Label */}
            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">
                {stat.label}
            </div>

            {/* Value */}
            <div className={cn("text-xl font-bold font-mono", statusColor)}>
                {stat.value}
                {stat.unit && <span className="text-sm ml-0.5">{stat.unit}</span>}
            </div>

            {/* Trend */}
            {stat.trend && (
                <div className={cn("flex items-center gap-1 mt-1", trendColor)}>
                    <TrendIcon className="w-3 h-3" />
                    {stat.trendValue && (
                        <span className="text-[10px] font-medium">{stat.trendValue}</span>
                    )}
                </div>
            )}
        </motion.div>
    );
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export const QuickStatsRow: React.FC<QuickStatsRowProps> = ({
    stats,
    className,
    columns = 3
}) => {
    const gridCols = {
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4'
    }[columns];

    return (
        <div className={cn("grid gap-3", gridCols, className)}>
            {stats.map((stat, i) => (
                <StatCell key={stat.id} stat={stat} index={i} />
            ))}
        </div>
    );
};

export default QuickStatsRow;
