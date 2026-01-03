/**
 * SENTIENT ORB
 * The central visual element of the home screen.
 * It pulses with the user's state, changes color based on readiness,
 * and serves as the primary interaction point.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, Moon, AlertTriangle, Heart } from 'lucide-react';

interface SentientOrbProps {
    /** Primary metric (0-100), typically Readiness Score */
    value: number;
    /** Label for the metric */
    label?: string;
    /** Current state affects color and animation */
    state: 'optimal' | 'good' | 'warning' | 'critical' | 'resting';
    /** Heart rate for pulse sync (optional) */
    heartRate?: number;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Click handler */
    onClick?: () => void;
}

const STATE_CONFIGS = {
    optimal: {
        coreColor: 'hsl(160, 100%, 50%)',
        glowColor: 'hsla(160, 100%, 50%, 0.4)',
        ringColor: 'hsla(160, 100%, 50%, 0.2)',
        Icon: Zap,
        pulseIntensity: 1.08,
    },
    good: {
        coreColor: 'hsl(180, 100%, 50%)',
        glowColor: 'hsla(180, 100%, 50%, 0.35)',
        ringColor: 'hsla(180, 100%, 50%, 0.15)',
        Icon: Activity,
        pulseIntensity: 1.05,
    },
    warning: {
        coreColor: 'hsl(45, 100%, 55%)',
        glowColor: 'hsla(45, 100%, 55%, 0.4)',
        ringColor: 'hsla(45, 100%, 55%, 0.2)',
        Icon: AlertTriangle,
        pulseIntensity: 1.03,
    },
    critical: {
        coreColor: 'hsl(0, 80%, 55%)',
        glowColor: 'hsla(0, 80%, 55%, 0.5)',
        ringColor: 'hsla(0, 80%, 55%, 0.25)',
        Icon: AlertTriangle,
        pulseIntensity: 1.1,
    },
    resting: {
        coreColor: 'hsl(265, 80%, 60%)',
        glowColor: 'hsla(265, 80%, 60%, 0.3)',
        ringColor: 'hsla(265, 80%, 60%, 0.15)',
        Icon: Moon,
        pulseIntensity: 1.02,
    },
};

const SIZE_CONFIGS = {
    sm: { container: 'w-32 h-32', core: 'w-20 h-20', text: 'text-3xl', icon: 'w-5 h-5' },
    md: { container: 'w-56 h-56', core: 'w-36 h-36', text: 'text-5xl', icon: 'w-7 h-7' },
    lg: { container: 'w-80 h-80', core: 'w-48 h-48', text: 'text-6xl', icon: 'w-9 h-9' },
};

export const SentientOrb: React.FC<SentientOrbProps> = ({
    value,
    label = 'Readiness',
    state,
    heartRate,
    size = 'lg',
    onClick,
}) => {
    const config = STATE_CONFIGS[state];
    const sizeConfig = SIZE_CONFIGS[size];
    const Icon = config.Icon;

    // Calculate pulse duration based on heart rate (if provided)
    const pulseDuration = heartRate ? 60 / heartRate : 4;

    return (
        <motion.div
            className={`relative flex items-center justify-center ${sizeConfig.container} mx-auto cursor-pointer`}
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Outer Glow Ring */}
            <motion.div
                className="absolute inset-0 rounded-full opacity-30 blur-3xl"
                style={{ background: config.coreColor }}
                animate={{
                    scale: [0.85, 1.15, 0.85],
                    opacity: [0.15, 0.35, 0.15],
                }}
                transition={{
                    duration: pulseDuration * 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* Middle Ring (Orbital) */}
            <div
                className="absolute inset-0 border rounded-full opacity-30"
                style={{ borderColor: config.ringColor }}
            >
                <motion.div
                    className="absolute w-[90%] h-[90%] border border-dashed rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ borderColor: config.ringColor }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                />
            </div>

            {/* Nebula Core Effect */}
            <motion.div
                className="absolute w-[70%] h-[70%] rounded-full blur-xl opacity-60 mix-blend-screen"
                style={{ background: config.coreColor }}
                animate={{
                    borderRadius: [
                        '60% 40% 30% 70% / 60% 30% 70% 40%',
                        '30% 60% 70% 40% / 50% 60% 30% 60%',
                        '60% 40% 30% 70% / 60% 30% 70% 40%',
                    ],
                    rotate: [0, 180, 360],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            />

            {/* Core Display */}
            <motion.div
                className={`relative z-10 ${sizeConfig.core} rounded-full glass-tier-4 flex flex-col items-center justify-center border border-white/20`}
                style={{
                    boxShadow: `0 0 60px ${config.glowColor}, inset 0 0 30px ${config.glowColor}`,
                }}
                animate={{
                    scale: [1, config.pulseIntensity, 1],
                }}
                transition={{
                    duration: pulseDuration,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            >
                <Icon className={`${sizeConfig.icon} mb-1`} style={{ color: config.coreColor }} />
                <motion.div
                    className={`${sizeConfig.text} font-bold tracking-tighter font-mono`}
                    style={{ color: config.coreColor }}
                >
                    {value}
                </motion.div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                    {label}
                </div>
            </motion.div>

            {/* Heart Rate Indicator (if provided) */}
            {heartRate && (
                <motion.div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 glass-tier-3 px-3 py-1 rounded-full"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: pulseDuration, repeat: Infinity }}
                >
                    <Heart className="w-3 h-3 text-red-400" />
                    <span className="text-xs font-mono text-red-400">{heartRate}</span>
                </motion.div>
            )}
        </motion.div>
    );
};

/**
 * Helper function to derive orb state from scores
 */
export function deriveOrbState(
    readiness: number,
    stress?: number,
    isNightMode?: boolean
): 'optimal' | 'good' | 'warning' | 'critical' | 'resting' {
    if (isNightMode) return 'resting';
    if (readiness >= 80) return 'optimal';
    if (readiness >= 60) return 'good';
    if (readiness >= 40) return 'warning';
    return 'critical';
}

export default SentientOrb;
