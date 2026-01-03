/**
 * THRESHOLD GAUGE
 * For metrics with optimal ranges (ACWR, etc.)
 * Shows colored zones and current position.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../core/primitives';

interface Zone {
    min: number;
    max: number;
    color: 'red' | 'amber' | 'green' | 'blue';
    label?: string;
}

interface ThresholdGaugeProps {
    value: number;
    min: number;
    max: number;
    zones: Zone[];
    label?: string;
    unit?: string;
    insight?: string;
    className?: string;
}

const ZONE_COLORS = {
    red: 'bg-red-500',
    amber: 'bg-amber-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
};

const ZONE_TEXT_COLORS = {
    red: 'text-red-400',
    amber: 'text-amber-400',
    green: 'text-green-400',
    blue: 'text-blue-400',
};

export const ThresholdGauge: React.FC<ThresholdGaugeProps> = ({
    value,
    min,
    max,
    zones,
    label,
    unit,
    insight,
    className,
}) => {
    const range = max - min;
    const position = ((value - min) / range) * 100;
    const clampedPosition = Math.max(0, Math.min(100, position));

    // Determine current zone
    const currentZone = zones.find(z => value >= z.min && value < z.max) || zones[zones.length - 1];

    return (
        <div className={cn('space-y-3', className)}>
            {/* Label */}
            {label && (
                <div className="text-xs uppercase tracking-widest text-white/40">{label}</div>
            )}

            {/* Gauge */}
            <div className="relative h-3 rounded-full overflow-hidden bg-white/10">
                {/* Zone segments */}
                {zones.map((zone, index) => {
                    const startPercent = ((zone.min - min) / range) * 100;
                    const widthPercent = ((zone.max - zone.min) / range) * 100;

                    return (
                        <div
                            key={index}
                            className={cn('absolute top-0 h-full opacity-60', ZONE_COLORS[zone.color])}
                            style={{
                                left: `${startPercent}%`,
                                width: `${widthPercent}%`,
                            }}
                        />
                    );
                })}

                {/* Current position indicator */}
                <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg border-2"
                    style={{
                        borderColor: currentZone ? `var(--${currentZone.color}-500)` : 'white',
                    }}
                    initial={{ left: '0%' }}
                    animate={{ left: `calc(${clampedPosition}% - 8px)` }}
                    transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                />
            </div>

            {/* Zone labels */}
            <div className="flex justify-between text-[10px]">
                {zones.map((zone, index) => (
                    <span key={index} className={cn(ZONE_TEXT_COLORS[zone.color], 'opacity-60')}>
                        {zone.label || `${zone.min}-${zone.max}`}
                    </span>
                ))}
            </div>

            {/* Current value + insight */}
            <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1">
                    <span className={cn('text-2xl font-bold', ZONE_TEXT_COLORS[currentZone.color])}>
                        {value.toFixed(2)}
                    </span>
                    {unit && <span className="text-sm text-white/40">{unit}</span>}
                </div>

                {insight && (
                    <span className="text-xs text-white/50 text-right max-w-[60%]">
                        {insight}
                    </span>
                )}
            </div>
        </div>
    );
};

export default ThresholdGauge;
