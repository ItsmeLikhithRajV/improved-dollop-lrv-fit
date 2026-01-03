/**
 * TREND SPARKLINE
 * 7-day mini trend chart for showing metric patterns.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../core/primitives';

interface TrendSparklineProps {
    data: number[];
    color?: 'green' | 'blue' | 'amber' | 'red' | 'purple';
    height?: number;
    showDots?: boolean;
    showCurrentValue?: boolean;
    currentValue?: number;
    unit?: string;
    className?: string;
}

const COLOR_CLASSES = {
    green: { stroke: 'stroke-green-400', fill: 'fill-green-400/20', dot: 'bg-green-400' },
    blue: { stroke: 'stroke-blue-400', fill: 'fill-blue-400/20', dot: 'bg-blue-400' },
    amber: { stroke: 'stroke-amber-400', fill: 'fill-amber-400/20', dot: 'bg-amber-400' },
    red: { stroke: 'stroke-red-400', fill: 'fill-red-400/20', dot: 'bg-red-400' },
    purple: { stroke: 'stroke-purple-400', fill: 'fill-purple-400/20', dot: 'bg-purple-400' },
};

export const TrendSparkline: React.FC<TrendSparklineProps> = ({
    data,
    color = 'blue',
    height = 48,
    showDots = true,
    showCurrentValue = false,
    currentValue,
    unit,
    className,
}) => {
    const colors = COLOR_CLASSES[color];

    if (data.length === 0) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const width = 100;
    const padding = 4;
    const usableWidth = width - padding * 2;
    const usableHeight = height - padding * 2;

    // Generate path points
    const points = data.map((value, index) => {
        const x = padding + (index / (data.length - 1)) * usableWidth;
        const y = padding + usableHeight - ((value - min) / range) * usableHeight;
        return { x, y, value };
    });

    // Create SVG path
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    // Create area path
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

    return (
        <div className={cn('relative', className)}>
            {/* Current value badge */}
            {showCurrentValue && currentValue !== undefined && (
                <div className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-white/10 text-xs font-medium text-white/70">
                    {currentValue}{unit}
                </div>
            )}

            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full"
                style={{ height }}
                preserveAspectRatio="none"
            >
                {/* Gradient fill */}
                <defs>
                    <linearGradient id={`sparkline-gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" className={colors.fill.replace('fill-', 'stop-color-')} stopOpacity="0.3" />
                        <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Area fill */}
                <motion.path
                    d={areaPath}
                    className={colors.fill}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                />

                {/* Line */}
                <motion.path
                    d={linePath}
                    className={cn(colors.stroke, 'fill-none')}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                />

                {/* Dots */}
                {showDots && points.map((point, index) => (
                    <motion.circle
                        key={index}
                        cx={point.x}
                        cy={point.y}
                        r={index === points.length - 1 ? 4 : 2}
                        className={cn(colors.dot.replace('bg-', 'fill-'), index === points.length - 1 ? 'opacity-100' : 'opacity-50')}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.05 }}
                    />
                ))}
            </svg>

            {/* Day labels */}
            <div className="flex justify-between mt-1 px-1">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].slice(0, data.length).map((day, i) => (
                    <span key={i} className="text-[9px] text-white/30">{day}</span>
                ))}
            </div>
        </div>
    );
};

export default TrendSparkline;
