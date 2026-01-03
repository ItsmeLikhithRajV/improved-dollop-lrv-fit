/**
 * Enhanced Breathwork Session Component
 * 
 * Full-featured guided breathing experience with:
 * - Dynamic breathing orb animation
 * - Simulated HRV biofeedback
 * - Haptic feedback (on mobile)
 * - Progress tracking
 * - Session summary
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, RotateCcw, Heart, Activity, Zap, Check } from 'lucide-react';
import { Button, GlassCard, Badge, cn } from '../ui';
import { BreathingOrb } from '../BreathingOrb';
import {
    BreathworkProtocol,
    BreathPhase,
    getProtocolById,
    calculateSessionDuration
} from '../../experts/mental/BreathworkDatabase';
import {
    HRVSimulator,
    createHRVSimulator,
    getCoherenceColor,
    formatCoherenceForDisplay,
    HRVReading,
    CoherenceSession
} from '../../experts/recovery/HRVSimulator';

// =====================================================
// TYPES
// =====================================================

interface BreathworkSessionProps {
    protocolId: string;
    onClose: () => void;
    onComplete: (session: SessionSummary) => void;
    showBiofeedback?: boolean;
}

interface SessionSummary {
    protocol_id: string;
    duration_seconds: number;
    completed: boolean;
    average_coherence: number;
    peak_coherence: number;
    time_in_coherence: number;
    cycles_completed: number;
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export const BreathworkSession: React.FC<BreathworkSessionProps> = ({
    protocolId,
    onClose,
    onComplete,
    showBiofeedback = true
}) => {
    // Get protocol
    const protocol = useMemo(() => getProtocolById(protocolId), [protocolId]);

    // Session state
    const [isPlaying, setIsPlaying] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
    const [currentCycle, setCurrentCycle] = useState(0);
    const [currentSet, setCurrentSet] = useState(0);
    const [phaseProgress, setPhaseProgress] = useState(0);
    const [totalElapsed, setTotalElapsed] = useState(0);

    // HRV state
    const [hrvReading, setHrvReading] = useState<HRVReading | null>(null);
    const [coherenceHistory, setCoherenceHistory] = useState<number[]>([]);

    // Refs
    const hrvSimulator = useRef<HRVSimulator | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const phaseTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize HRV simulator
    useEffect(() => {
        hrvSimulator.current = createHRVSimulator();
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
        };
    }, []);

    // Current phase
    const currentPhase = protocol?.pattern[currentPhaseIndex];
    const totalDuration = protocol ? calculateSessionDuration(protocol) : 0;

    // Calculate orb animation values
    const orbValue = useMemo(() => {
        if (!currentPhase) return 0.5;
        if (currentPhase.instruction === 'inhale') {
            return 0.3 + (phaseProgress * 0.7);  // Grow from 0.3 to 1.0
        } else if (currentPhase.instruction === 'exhale') {
            return 1.0 - (phaseProgress * 0.7);  // Shrink from 1.0 to 0.3
        } else if (currentPhase.instruction === 'hold_full') {
            return 1.0;  // Stay expanded
        } else {
            return 0.3;  // Stay contracted
        }
    }, [currentPhase, phaseProgress]);

    // Session controls
    const startSession = useCallback(() => {
        if (!protocol || !hrvSimulator.current) return;

        setIsPlaying(true);
        hrvSimulator.current.startSession();

        // Start HRV reading every second
        intervalRef.current = setInterval(() => {
            if (!hrvSimulator.current) return;

            const reading = hrvSimulator.current.generateReading();
            setHrvReading(reading);
            setCoherenceHistory(prev => [...prev.slice(-60), reading.coherence_score]);
            setTotalElapsed(e => e + 1);
        }, 1000);

        // Start phase progression
        runPhaseSequence();
    }, [protocol]);

    const pauseSession = useCallback(() => {
        setIsPlaying(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    }, []);

    const resumeSession = useCallback(() => {
        startSession();
    }, [startSession]);

    const resetSession = useCallback(() => {
        pauseSession();
        setCurrentPhaseIndex(0);
        setCurrentCycle(0);
        setCurrentSet(0);
        setPhaseProgress(0);
        setTotalElapsed(0);
        setCoherenceHistory([]);
        setHrvReading(null);
        setIsComplete(false);
    }, [pauseSession]);

    // Phase progression logic
    const runPhaseSequence = useCallback(() => {
        if (!protocol) return;

        const advancePhase = () => {
            setCurrentPhaseIndex(prevIndex => {
                const nextIndex = prevIndex + 1;

                // Check if we've completed all phases in a cycle
                if (nextIndex >= protocol.pattern.length) {
                    setCurrentCycle(prevCycle => {
                        const nextCycle = prevCycle + 1;

                        // Check if we've completed all cycles in a set
                        if (nextCycle >= protocol.cycles_per_set) {
                            setCurrentSet(prevSet => {
                                const nextSet = prevSet + 1;

                                // Check if we've completed all sets
                                if (nextSet >= protocol.sets) {
                                    // Session complete!
                                    completeSession();
                                    return prevSet;
                                }

                                // Rest between sets
                                setTimeout(advancePhase, protocol.rest_between_sets_ms);
                                return nextSet;
                            });
                            return 0;  // Reset cycle
                        }
                        return nextCycle;
                    });
                    return 0;  // Reset phase index
                }

                return nextIndex;
            });

            setPhaseProgress(0);

            // Update HRV simulator with current breath phase
            if (hrvSimulator.current && protocol.pattern[0]) {
                const phase = protocol.pattern[0];
                hrvSimulator.current.setBreathPhase(
                    phase.instruction === 'inhale' ? 'inhale' :
                        phase.instruction === 'exhale' ? 'exhale' : 'hold'
                );
            }
        };

        // Animate through current phase
        const animatePhase = () => {
            if (!isPlaying) return;

            const phase = protocol.pattern[currentPhaseIndex];
            if (!phase) return;

            const stepDuration = 50;  // 50ms steps for smooth animation
            const steps = phase.duration_ms / stepDuration;
            let step = 0;

            const animate = () => {
                step++;
                setPhaseProgress(step / steps);

                if (step >= steps) {
                    advancePhase();
                    setTimeout(animatePhase, 100);
                } else {
                    phaseTimerRef.current = setTimeout(animate, stepDuration);
                }
            };

            animate();
        };

        animatePhase();
    }, [protocol, currentPhaseIndex, isPlaying]);

    // Complete session
    const completeSession = useCallback(() => {
        pauseSession();
        setIsComplete(true);

        const session = hrvSimulator.current?.endSession();

        const summary: SessionSummary = {
            protocol_id: protocolId,
            duration_seconds: totalElapsed,
            completed: true,
            average_coherence: session?.average_coherence || 0,
            peak_coherence: session?.peak_coherence || 0,
            time_in_coherence: session?.time_in_coherence_seconds || 0,
            cycles_completed: currentCycle + 1
        };

        onComplete(summary);
    }, [pauseSession, protocolId, totalElapsed, currentCycle, onComplete]);

    // Auto-start on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            startSession();
        }, 1500);  // Give user a moment to prepare

        return () => clearTimeout(timer);
    }, []);

    if (!protocol) {
        return (
            <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
                <p className="text-white">Protocol not found</p>
            </div>
        );
    }

    // Get coherence feedback
    const coherenceFeedback = hrvReading ?
        hrvSimulator.current?.getCoherenceFeedback(hrvReading) : null;

    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#0a0a1a] to-[#1a1a3a] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4">
                <div>
                    <h2 className="text-lg font-bold text-white">{protocol.emoji} {protocol.name}</h2>
                    <p className="text-xs text-white/50">{protocol.description}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="w-5 h-5" />
                </Button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-4">
                {/* Breathing Orb */}
                <motion.div
                    className="relative mb-8"
                    style={{ width: 200, height: 200 }}
                >
                    <BreathingOrb
                        mode={currentPhase?.instruction === 'hold_full' || currentPhase?.instruction === 'hold_empty' ? 'hold' : (isPlaying ? 'breathe' : 'idle')}
                        breathValue={orbValue}
                        customColor={getCoherenceColor(hrvReading?.coherence_score || 50)}
                        size={200}
                        text={currentPhase?.instruction}
                    />

                    {/* Phase instruction overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentPhase?.instruction}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center"
                            >
                                <div className="text-2xl font-bold text-white mb-1">
                                    {currentPhase?.instruction === 'inhale' && '🌬️ BREATHE IN'}
                                    {currentPhase?.instruction === 'exhale' && '💨 BREATHE OUT'}
                                    {currentPhase?.instruction === 'hold_full' && '⏸️ HOLD'}
                                    {currentPhase?.instruction === 'hold_empty' && '⏸️ HOLD'}
                                    {!currentPhase && '🧘 PREPARE'}
                                </div>
                                <div className="text-xs text-white/60">
                                    {currentPhase?.instruction === 'inhale' && 'Slow and deep through your nose'}
                                    {currentPhase?.instruction === 'exhale' && 'Slowly through your mouth'}
                                    {currentPhase?.instruction === 'hold_full' && 'Lungs full, stay relaxed'}
                                    {currentPhase?.instruction === 'hold_empty' && 'Lungs empty, stay calm'}
                                    {!currentPhase && 'Find a comfortable position'}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Progress Info */}
                <div className="text-center mb-6">
                    <div className="text-4xl font-mono text-white mb-2">
                        {Math.floor(totalElapsed / 60)}:{(totalElapsed % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs text-white/50">
                        Cycle {currentCycle + 1}/{protocol.cycles_per_set} • Set {currentSet + 1}/{protocol.sets}
                    </div>
                </div>

                {/* HRV Biofeedback Panel */}
                {showBiofeedback && hrvReading && (
                    <GlassCard className="w-full max-w-sm p-4 mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-white/50 uppercase tracking-wider">Coherence</span>
                            <Badge
                                className="text-[10px]"
                                style={{
                                    backgroundColor: `${getCoherenceColor(hrvReading.coherence_score)}20`,
                                    color: getCoherenceColor(hrvReading.coherence_score)
                                }}
                            >
                                {formatCoherenceForDisplay(hrvReading.coherence_score)}
                            </Badge>
                        </div>

                        {/* Coherence Bar */}
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                            <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: getCoherenceColor(hrvReading.coherence_score) }}
                                animate={{ width: `${hrvReading.coherence_score}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                                <div className="flex items-center justify-center gap-1 text-xs text-white/50 mb-1">
                                    <Heart className="w-3 h-3" />
                                    HR
                                </div>
                                <div className="text-lg font-mono text-white">{hrvReading.heart_rate}</div>
                            </div>
                            <div>
                                <div className="flex items-center justify-center gap-1 text-xs text-white/50 mb-1">
                                    <Activity className="w-3 h-3" />
                                    HRV
                                </div>
                                <div className="text-lg font-mono text-white">{Math.round(hrvReading.rmssd)}</div>
                            </div>
                            <div>
                                <div className="flex items-center justify-center gap-1 text-xs text-white/50 mb-1">
                                    <Zap className="w-3 h-3" />
                                    Score
                                </div>
                                <div className="text-lg font-mono text-white">{hrvReading.coherence_score}</div>
                            </div>
                        </div>

                        {/* Feedback message */}
                        {coherenceFeedback && (
                            <div className="mt-3 text-center text-sm text-white/70">
                                {coherenceFeedback.message}
                            </div>
                        )}
                    </GlassCard>
                )}

                {/* Controls */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={resetSession}
                        className="w-12 h-12 rounded-full"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </Button>

                    <Button
                        size="lg"
                        className={cn(
                            "w-16 h-16 rounded-full",
                            isPlaying ? "bg-orange-500" : "bg-primary"
                        )}
                        onClick={isPlaying ? pauseSession : resumeSession}
                    >
                        {isPlaying ? (
                            <Pause className="w-8 h-8" />
                        ) : (
                            <Play className="w-8 h-8 ml-1" />
                        )}
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={completeSession}
                        className="w-12 h-12 rounded-full"
                    >
                        <Check className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Session Complete Modal */}
            <AnimatePresence>
                {isComplete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <GlassCard className="w-full max-w-sm p-6 text-center">
                            <div className="text-5xl mb-4">✨</div>
                            <h3 className="text-xl font-bold text-white mb-2">Session Complete</h3>
                            <p className="text-white/60 mb-6">{protocol.name}</p>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-white/5 rounded-lg p-3">
                                    <div className="text-2xl font-bold text-primary">
                                        {Math.floor(totalElapsed / 60)}:{(totalElapsed % 60).toString().padStart(2, '0')}
                                    </div>
                                    <div className="text-xs text-white/50">Duration</div>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3">
                                    <div className="text-2xl font-bold text-green-400">
                                        {Math.round(coherenceHistory.reduce((a, b) => a + b, 0) / coherenceHistory.length || 0)}
                                    </div>
                                    <div className="text-xs text-white/50">Avg Coherence</div>
                                </div>
                            </div>

                            <Button className="w-full" onClick={onClose}>
                                Done
                            </Button>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BreathworkSession;
