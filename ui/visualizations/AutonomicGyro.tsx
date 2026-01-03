/**
 * AUTONOMIC GYROSCOPE
 * Visual representation of the autonomic nervous system balance.
 * Sympathetic (Stress) vs Parasympathetic (Rest) shown as a tilting gyroscope.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Moon, Zap } from 'lucide-react';

interface AutonomicGyroProps {
    /** Sympathetic activation (0-100) - Fight/Flight */
    sympathetic: number;
    /** Parasympathetic activation (0-100) - Rest/Digest */
    parasympathetic: number;
    /** HRV value for display */
    hrv?: number;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
}

const SIZE_CONFIGS = {
    sm: { container: 'w-24 h-24', ring: 'w-20 h-20', core: 'w-10 h-10', text: 'text-sm' },
    md: { container: 'w-36 h-36', ring: 'w-28 h-28', core: 'w-14 h-14', text: 'text-lg' },
    lg: { container: 'w-48 h-48', ring: 'w-40 h-40', core: 'w-20 h-20', text: 'text-2xl' },
};

export const AutonomicGyro: React.FC<AutonomicGyroProps> = ({
    sympathetic,
    parasympathetic,
    hrv,
    size = 'md',
}) => {
    const sizeConfig = SIZE_CONFIGS[size];

    // Calculate balance (-1 = full para, 0 = balanced, 1 = full symp)
    const balance = (sympathetic - parasympathetic) / 100;
    const tiltAngle = balance * 25; // Max 25 degrees tilt

    // Determine dominant state
    const state = Math.abs(balance) < 0.15 ? 'balanced' : balance > 0 ? 'sympathetic' : 'parasympathetic';

    const stateConfig = {
        balanced: {
            color: 'hsl(160, 100%, 50%)',
            glow: 'hsla(160, 100%, 50%, 0.4)',
            label: 'Balanced',
            Icon: Activity,
            spinSpeed: 10,
            vibration: 0,
        },
        sympathetic: {
            color: 'hsl(25, 100%, 55%)',
            glow: 'hsla(25, 100%, 55%, 0.5)',
            label: 'Activated',
            Icon: Zap,
            spinSpeed: 6,
            vibration: Math.abs(balance) * 3,
        },
        parasympathetic: {
            color: 'hsl(220, 100%, 60%)',
            glow: 'hsla(220, 100%, 60%, 0.4)',
            label: 'Resting',
            Icon: Moon,
            spinSpeed: 15,
            vibration: 0,
        },
    };

    const config = stateConfig[state];
    const Icon = config.Icon;

    return (
        <div className={`relative ${sizeConfig.container} flex items-center justify-center`}>
            {/* Outer Glow */}
            <motion.div
                className="absolute inset-0 rounded-full blur-2xl"
                style={{ background: config.glow }}
                animate={{ opacity: [0.3, 0.5, 0.3], scale: [0.9, 1.1, 0.9] }}
                transition={{ duration: 4, repeat: Infinity }}
            />

            {/* Gyroscope Container (tilts based on balance) */}
            <motion.div
                className={`relative ${sizeConfig.ring} flex items-center justify-center perspective-1000`}
                animate={{
                    rotateX: tiltAngle,
                    rotateZ: balance * 5,
                }}
                transition={{ type: 'spring', stiffness: 50, damping: 20 }}
            >
                {/* Outer Ring */}
                <motion.div
                    className="absolute inset-0 rounded-full border-2"
                    style={{ borderColor: config.color }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: config.spinSpeed, repeat: Infinity, ease: 'linear' }}
                />

                {/* Middle Ring */}
                <motion.div
                    className="absolute inset-2 rounded-full border"
                    style={{ borderColor: `${config.color}80` }}
                    animate={{ rotate: -360 }}
                    transition={{ duration: config.spinSpeed * 1.5, repeat: Infinity, ease: 'linear' }}
                />

                {/* Inner Ring */}
                <motion.div
                    className="absolute inset-4 rounded-full border border-dashed"
                    style={{ borderColor: `${config.color}50` }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: config.spinSpeed * 2, repeat: Infinity, ease: 'linear' }}
                />

                {/* Core (vibrates if stressed) */}
                <motion.div
                    className={`relative ${sizeConfig.core} rounded-full glass-tier-4 flex flex-col items-center justify-center`}
                    style={{ boxShadow: `0 0 30px ${config.glow}` }}
                    animate={
                        config.vibration > 0
                            ? { x: [0, config.vibration, -config.vibration, 0] }
                            : {}
                    }
                    transition={{ duration: 0.1, repeat: Infinity }}
                >
                    <Icon className="w-4 h-4 mb-1" style={{ color: config.color }} />
                    {hrv && (
                        <div className={`${sizeConfig.text} font-mono font-bold`} style={{ color: config.color }}>
                            {hrv}
                        </div>
                    )}
                </motion.div>
            </motion.div>

            {/* Labels on sides */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-2">
                <div className="text-[10px] text-blue-400 uppercase tracking-wider">Para</div>
                <div className="text-xs text-blue-400 font-mono">{parasympathetic}%</div>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full pl-2">
                <div className="text-[10px] text-orange-400 uppercase tracking-wider">Symp</div>
                <div className="text-xs text-orange-400 font-mono">{sympathetic}%</div>
            </div>

            {/* State Label */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                <span className="text-[10px] uppercase tracking-wider" style={{ color: config.color }}>
                    {config.label}
                </span>
            </div>
        </div>
    );
};

export default AutonomicGyro;
