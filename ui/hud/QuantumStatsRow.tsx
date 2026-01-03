/**
 * QUANTUM STATS ROW
 * A row of floating, animated stat indicators.
 * Each stat has context (good/bad) baked in visually.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';

export interface QuantumStat {
    id: string;
    icon: LucideIcon;
    label: string;
    value: string | number;
    unit?: string;
    status: 'optimal' | 'good' | 'warning' | 'critical' | 'neutral';
    trend?: 'up' | 'down' | 'stable';
    subValue?: string;
}

interface QuantumStatsRowProps {
    stats: QuantumStat[];
    onStatClick?: (statId: string) => void;
}

const STATUS_CONFIGS = {
    optimal: {
        color: 'hsl(160, 100%, 50%)',
        bg: 'hsla(160, 100%, 50%, 0.1)',
        border: 'hsla(160, 100%, 50%, 0.2)',
    },
    good: {
        color: 'hsl(180, 100%, 50%)',
        bg: 'hsla(180, 100%, 50%, 0.1)',
        border: 'hsla(180, 100%, 50%, 0.15)',
    },
    warning: {
        color: 'hsl(45, 100%, 55%)',
        bg: 'hsla(45, 100%, 55%, 0.1)',
        border: 'hsla(45, 100%, 55%, 0.2)',
    },
    critical: {
        color: 'hsl(0, 80%, 55%)',
        bg: 'hsla(0, 80%, 55%, 0.15)',
        border: 'hsla(0, 80%, 55%, 0.25)',
    },
    neutral: {
        color: 'hsl(200, 40%, 60%)',
        bg: 'hsla(200, 40%, 60%, 0.08)',
        border: 'hsla(200, 40%, 60%, 0.1)',
    },
};

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
    const config = {
        up: { Icon: TrendingUp, color: 'text-green-400' },
        down: { Icon: TrendingDown, color: 'text-red-400' },
        stable: { Icon: Minus, color: 'text-muted-foreground' },
    };
    const { Icon, color } = config[trend];
    return <Icon className={`w-3 h-3 ${color}`} />;
};

export const QuantumStatsRow: React.FC<QuantumStatsRowProps> = ({
    stats,
    onStatClick,
}) => {
    return (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {stats.map((stat, index) => {
                const config = STATUS_CONFIGS[stat.status];
                const Icon = stat.icon;

                return (
                    <motion.div
                        key={stat.id}
                        className="flex-shrink-0 relative glass-tier-2 rounded-xl p-4 min-w-[120px] cursor-pointer overflow-hidden"
                        style={{
                            borderColor: config.border,
                            borderWidth: 1,
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.03, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onStatClick?.(stat.id)}
                    >
                        {/* Background Glow */}
                        <div
                            className="absolute inset-0 opacity-50"
                            style={{
                                background: `radial-gradient(circle at bottom left, ${config.bg}, transparent 70%)`,
                            }}
                        />

                        {/* Content */}
                        <div className="relative z-10">
                            {/* Icon and Trend */}
                            <div className="flex items-center justify-between mb-2">
                                <div
                                    className="p-1.5 rounded-lg"
                                    style={{ backgroundColor: config.bg }}
                                >
                                    <Icon className="w-4 h-4" style={{ color: config.color }} />
                                </div>
                                {stat.trend && <TrendIcon trend={stat.trend} />}
                            </div>

                            {/* Value */}
                            <div className="flex items-baseline gap-1">
                                <span
                                    className="text-2xl font-bold font-mono"
                                    style={{ color: config.color }}
                                >
                                    {stat.value}
                                </span>
                                {stat.unit && (
                                    <span className="text-xs text-muted-foreground">{stat.unit}</span>
                                )}
                            </div>

                            {/* Label */}
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                                {stat.label}
                            </div>

                            {/* Sub Value */}
                            {stat.subValue && (
                                <div className="text-[10px] text-muted-foreground/70 mt-0.5">
                                    {stat.subValue}
                                </div>
                            )}
                        </div>

                        {/* Critical Pulse Effect */}
                        {stat.status === 'critical' && (
                            <motion.div
                                className="absolute inset-0 rounded-xl"
                                style={{ boxShadow: `inset 0 0 20px ${config.color}40` }}
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            />
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
};

export default QuantumStatsRow;
