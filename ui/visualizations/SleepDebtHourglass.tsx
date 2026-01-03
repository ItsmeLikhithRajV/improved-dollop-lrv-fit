/**
 * SLEEP DEBT HOURGLASS
 * Visual metaphor for sleep debt - sand stuck at the top that falls as you rest.
 * Makes the abstract concept of "sleep debt" instantly tangible.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Clock } from 'lucide-react';

interface SleepDebtHourglassProps {
    /** Sleep debt in minutes */
    debtMinutes: number;
    /** Maximum debt to visualize (default 180min = 3h) */
    maxDebt?: number;
    /** Whether the user is currently sleeping/resting */
    isResting?: boolean;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
}

const SIZE_CONFIGS = {
    sm: { container: 'w-16 h-24', text: 'text-xs' },
    md: { container: 'w-24 h-36', text: 'text-sm' },
    lg: { container: 'w-32 h-48', text: 'text-base' },
};

export const SleepDebtHourglass: React.FC<SleepDebtHourglassProps> = ({
    debtMinutes,
    maxDebt = 180,
    isResting = false,
    size = 'md',
}) => {
    const sizeConfig = SIZE_CONFIGS[size];
    const debtPercent = Math.min(100, (debtMinutes / maxDebt) * 100);
    const bottomFill = 100 - debtPercent;

    // Format debt display
    const formatDebt = (mins: number) => {
        if (mins < 60) return `${mins}m`;
        const hours = Math.floor(mins / 60);
        const remaining = mins % 60;
        return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
    };

    // Determine severity
    const severity = debtMinutes < 30 ? 'low' : debtMinutes < 90 ? 'medium' : 'high';
    const severityColors = {
        low: { sand: 'hsl(265, 80%, 60%)', glow: 'hsla(265, 80%, 60%, 0.3)' },
        medium: { sand: 'hsl(45, 100%, 55%)', glow: 'hsla(45, 100%, 55%, 0.3)' },
        high: { sand: 'hsl(0, 80%, 55%)', glow: 'hsla(0, 80%, 55%, 0.4)' },
    };

    const colors = severityColors[severity];

    return (
        <div className={`relative ${sizeConfig.container} flex flex-col items-center`}>
            {/* Hourglass Container */}
            <div className="relative w-full h-full">
                {/* Glass Frame */}
                <div className="absolute inset-0 glass-tier-3 rounded-lg overflow-hidden">
                    {/* Top Bulb (Debt = sand stuck here) */}
                    <div className="relative h-[45%] overflow-hidden">
                        <motion.div
                            className="absolute bottom-0 left-[10%] right-[10%] rounded-t-full"
                            style={{
                                background: `linear-gradient(180deg, ${colors.sand} 0%, ${colors.sand}dd 100%)`,
                                height: `${debtPercent}%`,
                            }}
                            animate={
                                isResting
                                    ? { height: [`${debtPercent}%`, `${Math.max(0, debtPercent - 5)}%`] }
                                    : {}
                            }
                            transition={{ duration: 2, repeat: isResting ? Infinity : 0 }}
                        />
                    </div>

                    {/* Neck (the narrow passage) */}
                    <div className="relative h-[10%] flex items-center justify-center">
                        <div className="w-[15%] h-full bg-white/10" />
                        {/* Falling sand particles when resting */}
                        {isResting && debtMinutes > 0 && (
                            <motion.div
                                className="absolute w-1 h-1 rounded-full"
                                style={{ backgroundColor: colors.sand, left: '50%' }}
                                animate={{
                                    y: [0, 20],
                                    opacity: [1, 0],
                                }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                            />
                        )}
                    </div>

                    {/* Bottom Bulb (Recovered time = sand accumulated here) */}
                    <div className="relative h-[45%] overflow-hidden">
                        <motion.div
                            className="absolute bottom-0 left-[10%] right-[10%] rounded-b-full"
                            style={{
                                background: `linear-gradient(0deg, hsla(160, 100%, 50%, 0.8) 0%, hsla(160, 100%, 50%, 0.6) 100%)`,
                                height: `${bottomFill}%`,
                            }}
                            animate={
                                isResting
                                    ? { height: [`${bottomFill}%`, `${Math.min(100, bottomFill + 5)}%`] }
                                    : {}
                            }
                            transition={{ duration: 2, repeat: isResting ? Infinity : 0 }}
                        />
                    </div>
                </div>

                {/* Glow Effect for high debt */}
                {severity === 'high' && (
                    <motion.div
                        className="absolute inset-0 rounded-lg"
                        style={{ boxShadow: `0 0 20px ${colors.glow}` }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                )}

                {/* Frame Overlays */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 rounded-t-lg" />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-lg" />
            </div>

            {/* Labels */}
            <div className="mt-3 text-center">
                <div className="flex items-center justify-center gap-1">
                    <Moon className="w-3 h-3" style={{ color: colors.sand }} />
                    <span className={`${sizeConfig.text} font-mono font-bold`} style={{ color: colors.sand }}>
                        {formatDebt(debtMinutes)}
                    </span>
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                    {debtMinutes === 0 ? 'Fully Rested' : 'Sleep Debt'}
                </div>
            </div>

            {/* Resting Indicator */}
            {isResting && (
                <motion.div
                    className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 glass-tier-4 px-2 py-0.5 rounded-full"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <Clock className="w-3 h-3 text-green-400" />
                    <span className="text-[10px] text-green-400">Recovering</span>
                </motion.div>
            )}
        </div>
    );
};

export default SleepDebtHourglass;
