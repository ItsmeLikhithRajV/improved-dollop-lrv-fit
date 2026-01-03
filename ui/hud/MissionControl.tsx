/**
 * MISSION CONTROL HUD
 * The "Active Commander" reimagined as a Mission Control interface.
 * Shows current objective, countdowns, and blockers at a glance.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target, Clock, AlertTriangle, Check, ArrowRight,
    Zap, Coffee, Moon, Dumbbell, Brain
} from 'lucide-react';

interface MissionControlProps {
    /** Current active command/objective */
    objective: {
        name: string;
        description: string;
        domain: 'fuel' | 'sleep' | 'mind' | 'performance' | 'recovery';
        progress: number; // 0-100
        deadline?: string;
    } | null;
    /** Active countdowns */
    countdowns: Array<{
        id: string;
        label: string;
        timeRemaining: string;
        type: 'deadline' | 'window' | 'cutoff';
        icon?: 'coffee' | 'moon' | 'dumbbell' | 'brain';
    }>;
    /** Current blockers/warnings */
    blockers: string[];
    /** Handler for completing the objective */
    onComplete?: () => void;
    /** Handler for viewing objective details */
    onViewDetails?: () => void;
}

const DOMAIN_CONFIGS = {
    fuel: { color: 'hsl(35, 100%, 55%)', Icon: Zap },
    sleep: { color: 'hsl(265, 80%, 60%)', Icon: Moon },
    mind: { color: 'hsl(280, 80%, 60%)', Icon: Brain },
    performance: { color: 'hsl(160, 100%, 45%)', Icon: Dumbbell },
    recovery: { color: 'hsl(0, 80%, 60%)', Icon: Target },
};

const COUNTDOWN_ICONS = {
    coffee: Coffee,
    moon: Moon,
    dumbbell: Dumbbell,
    brain: Brain,
};

export const MissionControl: React.FC<MissionControlProps> = ({
    objective,
    countdowns,
    blockers,
    onComplete,
    onViewDetails,
}) => {
    const domainConfig = objective ? DOMAIN_CONFIGS[objective.domain] : null;

    return (
        <motion.div
            className="relative glass-tier-3 rounded-2xl p-5 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Mission Status Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-glow-pulse" />
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">
                        Mission Control
                    </span>
                </div>
                {objective && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Progress</span>
                        <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: domainConfig?.color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${objective.progress}%` }}
                            />
                        </div>
                        <span className="text-xs font-mono" style={{ color: domainConfig?.color }}>
                            {objective.progress}%
                        </span>
                    </div>
                )}
            </div>

            {/* Active Objective */}
            <AnimatePresence mode="wait">
                {objective ? (
                    <motion.div
                        key={objective.name}
                        className="mb-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className="p-3 rounded-xl"
                                style={{ backgroundColor: `${domainConfig?.color}20` }}
                            >
                                {domainConfig && <domainConfig.Icon className="w-6 h-6" style={{ color: domainConfig.color }} />}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-foreground mb-1">
                                    {objective.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {objective.description}
                                </p>
                                {objective.deadline && (
                                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                        <Clock className="w-3 h-3" />
                                        <span>Complete by {objective.deadline}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-4">
                            {onComplete && (
                                <motion.button
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl glass-tier-4 press-effect hover-glow"
                                    style={{ color: domainConfig?.color }}
                                    onClick={onComplete}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Check className="w-4 h-4" />
                                    <span className="text-sm font-medium">Mark Complete</span>
                                </motion.button>
                            )}
                            {onViewDetails && (
                                <motion.button
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl glass-tier-2 text-muted-foreground hover:text-foreground"
                                    onClick={onViewDetails}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        className="text-center py-8 text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <Target className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No active objective</p>
                        <p className="text-xs mt-1">System is monitoring your state</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Countdowns Row */}
            {countdowns.length > 0 && (
                <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
                    {countdowns.map((countdown) => {
                        const CountdownIcon = countdown.icon ? COUNTDOWN_ICONS[countdown.icon] : Clock;
                        const isDeadline = countdown.type === 'deadline';

                        return (
                            <motion.div
                                key={countdown.id}
                                className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg ${isDeadline ? 'bg-red-500/10 border border-red-500/20' : 'glass-tier-2'
                                    }`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <CountdownIcon className={`w-4 h-4 ${isDeadline ? 'text-red-400' : 'text-muted-foreground'}`} />
                                <div>
                                    <div className={`text-xs ${isDeadline ? 'text-red-400' : 'text-muted-foreground'}`}>
                                        {countdown.label}
                                    </div>
                                    <div className={`text-sm font-mono font-bold ${isDeadline ? 'text-red-400' : 'text-foreground'}`}>
                                        {countdown.timeRemaining}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Blockers/Warnings */}
            {blockers.length > 0 && (
                <div className="border-t border-white/5 pt-3">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs uppercase tracking-wider text-yellow-400">Blockers</span>
                    </div>
                    <div className="space-y-1">
                        {blockers.map((blocker, i) => (
                            <motion.div
                                key={i}
                                className="text-xs text-yellow-400/80 pl-5"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                • {blocker}
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Ambient Glow based on domain */}
            {domainConfig && (
                <div
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                        background: `radial-gradient(circle at top right, ${domainConfig.color}40, transparent 60%)`,
                    }}
                />
            )}
        </motion.div>
    );
};

export default MissionControl;
