/**
 * NEBULA BACKGROUND
 * A living, breathing background that reflects the user's physiological state.
 * The ambiance changes based on Recovery, Stress, and Readiness levels.
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export type NebulaState = 'recharge' | 'ignite' | 'warning' | 'flow' | 'neutral';

interface NebulaBackgroundProps {
    /** The current system state determining the color palette */
    state: NebulaState;
    /** Intensity of the effect (0-1). Higher = more vivid */
    intensity?: number;
    /** Optional className for the container */
    className?: string;
    children?: React.ReactNode;
}

/**
 * Determines the nebula state from GlobalState analysis
 */
export function deriveNebulaState(
    readiness: number,
    stress: number,
    recoveryScore: number
): NebulaState {
    // High stress or low recovery = Warning
    if (stress > 70 || recoveryScore < 30) return 'warning';

    // High readiness and good recovery = Ignite (ready to perform)
    if (readiness > 75 && recoveryScore > 60) return 'ignite';

    // Low readiness but good recovery = Recharge (recovery mode)
    if (readiness < 50 && recoveryScore > 50) return 'recharge';

    // Balanced state = Flow
    if (readiness > 60 && stress < 40) return 'flow';

    return 'neutral';
}

const NEBULA_CONFIGS: Record<NebulaState, {
    primary: string;
    secondary: string;
    tertiary: string;
    pulseSpeed: number;
}> = {
    recharge: {
        primary: 'hsla(265, 80%, 55%, 0.4)',
        secondary: 'hsla(220, 80%, 45%, 0.3)',
        tertiary: 'hsla(280, 70%, 40%, 0.2)',
        pulseSpeed: 10,
    },
    ignite: {
        primary: 'hsla(160, 100%, 45%, 0.4)',
        secondary: 'hsla(140, 100%, 40%, 0.3)',
        tertiary: 'hsla(180, 100%, 50%, 0.2)',
        pulseSpeed: 6,
    },
    warning: {
        primary: 'hsla(15, 100%, 50%, 0.4)',
        secondary: 'hsla(0, 80%, 45%, 0.3)',
        tertiary: 'hsla(30, 100%, 45%, 0.2)',
        pulseSpeed: 3,
    },
    flow: {
        primary: 'hsla(200, 100%, 50%, 0.35)',
        secondary: 'hsla(180, 100%, 45%, 0.25)',
        tertiary: 'hsla(220, 100%, 55%, 0.2)',
        pulseSpeed: 8,
    },
    neutral: {
        primary: 'hsla(180, 50%, 40%, 0.2)',
        secondary: 'hsla(200, 40%, 35%, 0.15)',
        tertiary: 'hsla(220, 30%, 30%, 0.1)',
        pulseSpeed: 12,
    },
};

export const NebulaBackground: React.FC<NebulaBackgroundProps> = ({
    state,
    intensity = 0.7,
    className = '',
    children,
}) => {
    const config = NEBULA_CONFIGS[state];

    const adjustedOpacity = useMemo(() => {
        return (baseColor: string) => {
            // Extract and multiply opacity by intensity
            const match = baseColor.match(/hsla\(([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/);
            if (match) {
                const newOpacity = parseFloat(match[4]) * intensity;
                return `hsla(${match[1]}, ${match[2]}, ${match[3]}, ${newOpacity})`;
            }
            return baseColor;
        };
    }, [intensity]);

    return (
        <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}>
            {/* Base dark layer */}
            <div className="absolute inset-0 bg-background" />

            {/* Primary Nebula Orb */}
            <motion.div
                className="absolute w-[800px] h-[800px] rounded-full blur-3xl"
                style={{
                    background: `radial-gradient(circle, ${adjustedOpacity(config.primary)} 0%, transparent 70%)`,
                    left: '20%',
                    top: '10%',
                }}
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                }}
                transition={{
                    duration: config.pulseSpeed,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* Secondary Nebula Orb */}
            <motion.div
                className="absolute w-[600px] h-[600px] rounded-full blur-3xl"
                style={{
                    background: `radial-gradient(circle, ${adjustedOpacity(config.secondary)} 0%, transparent 70%)`,
                    right: '10%',
                    bottom: '20%',
                }}
                animate={{
                    scale: [1.1, 0.9, 1.1],
                    x: [0, -40, 0],
                    y: [0, -20, 0],
                }}
                transition={{
                    duration: config.pulseSpeed * 1.3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* Tertiary Accent */}
            <motion.div
                className="absolute w-[400px] h-[400px] rounded-full blur-2xl"
                style={{
                    background: `radial-gradient(circle, ${adjustedOpacity(config.tertiary)} 0%, transparent 60%)`,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
                animate={{
                    scale: [0.8, 1.1, 0.8],
                    rotate: [0, 180, 360],
                }}
                transition={{
                    duration: config.pulseSpeed * 2,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            />

            {/* Noise/Grain Overlay for texture */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
            />

            {/* Content Layer */}
            {children && (
                <div className="relative z-10 pointer-events-auto">
                    {children}
                </div>
            )}
        </div>
    );
};

export default NebulaBackground;
