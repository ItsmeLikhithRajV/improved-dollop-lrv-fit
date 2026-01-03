import React from 'react';
import { motion } from 'framer-motion';
import { cn } from './ui';

interface BreathingOrbProps {
    mode: 'idle' | 'breathe' | 'hold';
    breathValue: number; // 0 to 1 (expansion level)
    size?: number;
    text?: string;
    colorTheme?: 'cyan' | 'green' | 'red' | 'purple';
    customColor?: string;
}

export const BreathingOrb = ({
    mode,
    breathValue,
    size = 300,
    text,
    colorTheme = 'cyan',
    customColor
}: BreathingOrbProps) => {

    const themes = {
        cyan: { core: "bg-cyan-500", glow: "shadow-cyan-500", ring: "border-cyan-400" },
        green: { core: "bg-emerald-500", glow: "shadow-emerald-500", ring: "border-emerald-400" },
        red: { core: "bg-red-500", glow: "shadow-red-500", ring: "border-red-400" },
        purple: { core: "bg-purple-500", glow: "shadow-purple-500", ring: "border-purple-400" },
    };
    const t = themes[colorTheme] || themes.cyan;

    // Custom color override
    const coreStyle = customColor ? { backgroundColor: customColor, boxShadow: `0 0 20px ${customColor}` } : undefined;
    const ringStyle = customColor ? { borderColor: customColor } : undefined;


    // Dynamic sizing
    const coreSize = size * 0.4; // Base core size
    const expansionScale = 1 + (breathValue * 0.8); // Expand up to 1.8x

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>

            {/* 1. OUTER RIPPLES (Echos of breath) */}
            <motion.div
                className={cn("absolute rounded-full border opacity-20", t.ring)}
                style={{ width: coreSize, height: coreSize }}
                animate={{
                    scale: mode === 'idle' ? [1, 1.1, 1] : expansionScale * 1.2,
                    opacity: 0.1 - (breathValue * 0.05)
                }}
                transition={{ duration: mode === 'idle' ? 3 : 0.1 }}
            />
            <motion.div
                className={cn("absolute rounded-full border border-dashed opacity-10", t.ring)}
                style={{ width: coreSize * 1.2, height: coreSize * 1.2 }}
                animate={{
                    rotate: 360,
                    scale: mode === 'idle' ? 1 : expansionScale * 1.1
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />

            {/* 2. THE CORE (Lungs) */}
            <motion.div
                className={cn("absolute rounded-full blur-[60px] opacity-40 mix-blend-screen", !customColor && t.core)}
                style={{ width: coreSize, height: coreSize, ...coreStyle }}
                animate={{ scale: expansionScale }}
                transition={{ type: "spring", damping: 15, stiffness: 50 }}
            />

            <motion.div
                className={cn("relative rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20", t.core, "bg-opacity-20")}
                style={{ width: coreSize, height: coreSize }}
                animate={{
                    scale: expansionScale,
                    boxShadow: `0 0 ${20 + (breathValue * 40)}px ${t.core.replace('bg-', '')}`
                }}
                transition={{ type: "spring", damping: 15, stiffness: 50 }} // Smooth physics-based movement
            >
                {/* Inner Texture */}
                <div className="absolute inset-0 rounded-full opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

                {/* Hold Indicator */}
                {mode === 'hold' && (
                    <motion.div
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="absolute inset-0 rounded-full border-2 border-white/50 animate-ping"
                    />
                )}

                {/* Text Instruction */}
                {text && (
                    <motion.div
                        key={text}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative z-10 text-white font-bold tracking-widest uppercase text-lg drop-shadow-lg"
                    >
                        {text}
                    </motion.div>
                )}
            </motion.div>

            {/* 3. PARTICLE FIELD (Life Force) */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Can add particle system here if needed for V4 */}
            </div>

        </div>
    );
};
