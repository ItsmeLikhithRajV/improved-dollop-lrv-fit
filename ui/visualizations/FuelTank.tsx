/**
 * FUEL TANK VISUALIZATION
 * A viscous liquid simulation showing Glycogen and Hydration levels.
 * Visual metaphor: The body's energy reserve as a literal fuel tank.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, Flame, Zap, AlertTriangle } from 'lucide-react';

interface FuelTankProps {
    /** Glycogen level (0-100%) */
    glycogen: number;
    /** Hydration level (0-100%) */
    hydration: number;
    /** Whether reserves are critically low */
    isReserveMode?: boolean;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Optional click handler */
    onClick?: () => void;
}

const SIZE_CONFIGS = {
    sm: { container: 'w-20 h-32', labelSize: 'text-xs' },
    md: { container: 'w-28 h-44', labelSize: 'text-sm' },
    lg: { container: 'w-36 h-56', labelSize: 'text-base' },
};

export const FuelTank: React.FC<FuelTankProps> = ({
    glycogen,
    hydration,
    isReserveMode = false,
    size = 'md',
    onClick,
}) => {
    const sizeConfig = SIZE_CONFIGS[size];
    const glycogenHeight = Math.max(5, Math.min(100, glycogen));
    const hydrationHeight = Math.max(5, Math.min(100, hydration));

    // Determine tank state for visual treatment
    const tankState = isReserveMode ? 'reserve' : glycogen < 30 ? 'low' : glycogen > 70 ? 'full' : 'normal';

    const stateColors = {
        reserve: { glow: 'shadow-glow-warning', border: 'border-red-500/40' },
        low: { glow: '', border: 'border-yellow-500/30' },
        normal: { glow: '', border: 'border-white/10' },
        full: { glow: 'shadow-glow-ignite', border: 'border-green-500/30' },
    };

    return (
        <motion.div
            className={`relative ${sizeConfig.container} cursor-pointer`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
        >
            {/* Tank Container */}
            <div
                className={`relative w-full h-full rounded-2xl glass-tier-3 overflow-hidden border-2 ${stateColors[tankState].border} ${stateColors[tankState].glow}`}
            >
                {/* Glycogen Layer (Amber/Honey) */}
                <motion.div
                    className="absolute bottom-0 left-0 right-0 rounded-b-xl"
                    style={{
                        background: `linear-gradient(180deg, 
              hsla(35, 100%, 55%, 0.7) 0%,
              hsla(35, 100%, 45%, 0.85) 50%,
              hsla(30, 100%, 40%, 0.95) 100%)`,
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: `${glycogenHeight}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                >
                    {/* Liquid Surface Wave */}
                    <motion.div
                        className="absolute top-0 left-0 right-0 h-3"
                        style={{
                            background: 'linear-gradient(180deg, hsla(35, 100%, 70%, 0.8) 0%, transparent 100%)',
                            borderRadius: '100% 100% 0 0',
                        }}
                        animate={{
                            scaleY: [1, 0.7, 1],
                            y: [0, 2, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />

                    {/* Bubbles */}
                    {glycogen > 20 && (
                        <>
                            <motion.div
                                className="absolute w-2 h-2 rounded-full bg-white/30"
                                style={{ left: '20%', bottom: '20%' }}
                                animate={{ y: [0, -40], opacity: [0.6, 0] }}
                                transition={{ duration: 3, repeat: Infinity, delay: 0 }}
                            />
                            <motion.div
                                className="absolute w-1.5 h-1.5 rounded-full bg-white/25"
                                style={{ left: '60%', bottom: '30%' }}
                                animate={{ y: [0, -50], opacity: [0.5, 0] }}
                                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                            />
                        </>
                    )}
                </motion.div>

                {/* Hydration Layer (Blue, on top) */}
                <motion.div
                    className="absolute left-0 right-0 rounded-t-xl"
                    style={{
                        background: `linear-gradient(180deg, 
              hsla(200, 100%, 60%, 0.3) 0%,
              hsla(200, 100%, 50%, 0.5) 100%)`,
                        bottom: `${glycogenHeight}%`,
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: `${(hydrationHeight * (100 - glycogenHeight)) / 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                />

                {/* Reserve Mode Warning Overlay */}
                {isReserveMode && (
                    <motion.div
                        className="absolute inset-0 bg-red-500/10"
                        animate={{ opacity: [0.1, 0.3, 0.1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    >
                        <div className="absolute top-2 left-1/2 -translate-x-1/2">
                            <AlertTriangle className="w-5 h-5 text-red-400 animate-warning-flash" />
                        </div>
                    </motion.div>
                )}

                {/* Level Markers */}
                <div className="absolute right-1 top-0 bottom-0 flex flex-col justify-between py-2">
                    {[100, 75, 50, 25].map((level) => (
                        <div key={level} className="flex items-center gap-1">
                            <div className="w-2 h-[1px] bg-white/20" />
                            <span className="text-[8px] text-muted-foreground">{level}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Labels */}
            <div className="absolute -bottom-6 left-0 right-0 flex justify-between px-1">
                <div className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" />
                    <span className={`${sizeConfig.labelSize} text-amber-400 font-mono`}>{glycogen}%</span>
                </div>
                <div className="flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-blue-400" />
                    <span className={`${sizeConfig.labelSize} text-blue-400 font-mono`}>{hydration}%</span>
                </div>
            </div>
        </motion.div>
    );
};

export default FuelTank;
