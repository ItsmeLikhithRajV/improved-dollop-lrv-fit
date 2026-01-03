/**
 * QUICK STATS ROW
 * Secondary metrics displayed in a row.
 * Clickable to navigate to relevant tabs.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '../core/primitives';

type MetricStatus = 'optimal' | 'good' | 'warning' | 'critical' | 'neutral';

interface QuickStat {
    id: string;
    icon: LucideIcon;
    label: string;
    value: string | number;
    unit?: string;
    status: MetricStatus;
    onClick?: () => void;
}

interface QuickStatsRowProps {
    stats: QuickStat[];
    columns?: 3 | 4 | 5;
    className?: string;
}

const STATUS_COLORS: Record<MetricStatus, string> = {
    optimal: 'text-green-400',
    good: 'text-teal-400',
    warning: 'text-amber-400',
    critical: 'text-red-400',
    neutral: 'text-white/60',
};

const STATUS_BG: Record<MetricStatus, string> = {
    optimal: 'bg-green-500/10',
    good: 'bg-teal-500/10',
    warning: 'bg-amber-500/10',
    critical: 'bg-red-500/10',
    neutral: 'bg-white/5',
};

export const QuickStatsRow: React.FC<QuickStatsRowProps> = ({
    stats,
    columns = 4,
    className,
}) => {
    return (
        <div className={cn(
            'grid gap-2',
            columns === 3 && 'grid-cols-3',
            columns === 4 && 'grid-cols-4',
            columns === 5 && 'grid-cols-5',
            className
        )}>
            {stats.map((stat) => (
                <motion.button
                    key={stat.id}
                    onClick={stat.onClick}
                    className={cn(
                        'flex flex-col items-center py-3 px-2 rounded-xl',
                        'bg-white/5 backdrop-blur-sm border border-white/10',
                        'hover:bg-white/10 transition-colors',
                        stat.onClick && 'cursor-pointer'
                    )}
                    whileTap={stat.onClick ? { scale: 0.95 } : {}}
                >
                    {/* Icon */}
                    <div className={cn('p-1.5 rounded-lg mb-1.5', STATUS_BG[stat.status])}>
                        <stat.icon className={cn('w-4 h-4', STATUS_COLORS[stat.status])} />
                    </div>

                    {/* Value */}
                    <div className={cn('text-sm font-semibold', STATUS_COLORS[stat.status])}>
                        {stat.value}{stat.unit}
                    </div>

                    {/* Label */}
                    <div className="text-[10px] text-white/40 uppercase tracking-wide mt-0.5">
                        {stat.label}
                    </div>
                </motion.button>
            ))}
        </div>
    );
};

export default QuickStatsRow;
