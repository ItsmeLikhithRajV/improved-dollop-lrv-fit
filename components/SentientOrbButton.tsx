import React from 'react';
import { motion } from 'framer-motion';
import { BreathingOrb } from './BreathingOrb';
import { cn } from './ui';

interface SentientOrbButtonProps {
    onClick: () => void;
    isOpen: boolean;
}

export const SentientOrbButton: React.FC<SentientOrbButtonProps> = ({ onClick, isOpen }) => {
    return (
        <motion.button
            onClick={onClick}
            className="fixed bottom-6 right-6 z-50 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <div className={cn(
                "relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-500",
                isOpen ? "bg-black/80 backdrop-blur-xl border border-white/20" : "bg-transparent"
            )}>
                {/* The Living Orb */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <BreathingOrb
                        mode="idle"
                        breathValue={0}
                        size={isOpen ? 40 : 60}
                        colorTheme="cyan"
                    />
                </div>

                {/* Status Indicator (Brain Activity) */}
                {!isOpen && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-black animate-pulse" />
                )}
            </div>
        </motion.button>
    );
};
