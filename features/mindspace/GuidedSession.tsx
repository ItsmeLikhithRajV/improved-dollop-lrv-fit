
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, RotateCcw } from 'lucide-react';
import { BreathingOrb } from '../../components/BreathingOrb';
import { Button } from '../../components/ui';

interface GuidedSessionProps {
    protocolId: 'box_breathing' | 'super_ventilation' | 'nsdr_lite' | 'visualization';
    onClose: () => void;
    onComplete: () => void;
}

// Fixed configs defined OUTSIDE the component to ensure stability
const PROTOCOLS = {
    box_breathing: {
        title: "Box Breathing",
        desc: "4s In, 4s Hold, 4s Out, 4s Hold. Down-regulates stress.",
        duration: 120, // 2 mins
        pattern: [
            { label: "Inhale", dur: 4000, startVal: 0, endVal: 1, hold: false },
            { label: "Hold", dur: 4000, startVal: 1, endVal: 1, hold: true },
            { label: "Exhale", dur: 4000, startVal: 1, endVal: 0, hold: false },
            { label: "Hold", dur: 4000, startVal: 0, endVal: 0, hold: true }
        ]
    },
    super_ventilation: {
        title: "Super Ventilation",
        desc: "Fast, rhythmic inhales to alert the CNS.",
        duration: 60,
        pattern: [
            { label: "Inhale!", dur: 1500, startVal: 0, endVal: 1, hold: false },
            { label: "Let Go", dur: 1000, startVal: 1, endVal: 0, hold: false }
        ]
    },
    nsdr_lite: {
        title: "NSDR Lite",
        desc: "Non-Sleep Deep Rest. Just watch and drift.",
        duration: 300,
        pattern: [
            { label: "Relax", dur: 5000, startVal: 0.5, endVal: 0.6, hold: false },
            { label: "Release", dur: 5000, startVal: 0.6, endVal: 0.5, hold: false }
        ]
    },
    visualization: {
        title: "Visualization",
        desc: "Close your eyes. Visualize the perfect rep.",
        duration: 180,
        pattern: [
            { label: "Visualize", dur: 10000, startVal: 0.3, endVal: 0.7, hold: false }
        ]
    }
};

export const GuidedSession = ({ protocolId, onClose, onComplete }: GuidedSessionProps) => {
    const [phase, setPhase] = useState<'intro' | 'active' | 'complete'>('intro');
    const [breathState, setBreathState] = useState<'breathe' | 'hold'>('breathe');
    const [breathValue, setBreathValue] = useState(0); // 0-1 expansion
    const [instruction, setInstruction] = useState("Inhale");
    const [timeLeft, setTimeLeft] = useState(0);

    // useMemo for config just in case, though PROTOCOLS is static
    const config = useMemo(() => PROTOCOLS[protocolId], [protocolId]);

    // Refs for stable callbacks
    const onCompleteRef = useRef(onComplete);
    useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

    // --- ANIMATION LOOP ---
    useEffect(() => {
        if (phase !== 'active' || !config) return;

        let startTime = Date.now();
        let patternIdx = 0;
        let animationFrame: number;
        let sessionStart = Date.now();

        const loop = () => {
            const now = Date.now();
            const elapsedTotal = (now - sessionStart) / 1000;

            // Check completion
            if (elapsedTotal >= config.duration) {
                setPhase('complete');
                onCompleteRef.current(); // Use ref to avoid dependency issue
                return;
            }
            setTimeLeft(config.duration - elapsedTotal);

            const currentStep = config.pattern[patternIdx];
            const stepProgress = Math.min(1, (now - startTime) / currentStep.dur);

            // Update visuals
            const val = currentStep.startVal + (currentStep.endVal - currentStep.startVal) * stepProgress;
            setBreathValue(val);
            setInstruction(currentStep.label);
            setBreathState(currentStep.hold ? 'hold' : 'breathe');

            // Next step?
            if (stepProgress >= 1) {
                startTime = now;
                patternIdx = (patternIdx + 1) % config.pattern.length;
            }

            animationFrame = requestAnimationFrame(loop);
        };

        animationFrame = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationFrame);
    }, [phase, config]); // Removed onComplete from dependencies

    if (!config) return null;

    return (
        <div className="fixed inset-0 z-[90] bg-black flex flex-col items-center justify-center animate-in fade-in duration-500">
            {/* CLOSE BUTTON */}
            <button onClick={onClose} className="absolute top-6 right-6 z-50 p-2 text-white/50 hover:text-white transition-colors">
                <X className="w-8 h-8" />
            </button>

            {/* ORB LAYER */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-100 transition-opacity duration-1000">
                <BreathingOrb
                    mode={phase === 'active' ? breathState : 'idle'}
                    breathValue={breathValue}
                    size={400}
                    text={phase === 'active' ? instruction : undefined}
                    colorTheme={protocolId === 'super_ventilation' ? 'red' : protocolId === 'box_breathing' ? 'green' : 'cyan'}
                />
            </div>

            {/* UI LAYER */}
            <div className="relative z-10 text-center max-w-md w-full px-6">
                <AnimatePresence mode="wait">
                    {phase === 'intro' && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <h2 className="text-4xl font-bold font-mono">{config.title}</h2>
                            <p className="text-xl text-muted-foreground">{config.desc}</p>
                            <div className="text-sm font-mono text-primary border border-primary/30 inline-block px-3 py-1 rounded">
                                Duration: {Math.floor(config.duration / 60)}m {config.duration % 60}s
                            </div>
                            <div className="pt-8">
                                <Button size="lg" className="w-full text-lg h-14" onClick={() => setPhase('active')}>
                                    <Play className="w-5 h-5 mr-2" /> Begin Session
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {phase === 'active' && (
                        <motion.div
                            key="active"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute bottom-12 left-0 right-0 text-center"
                        >
                            <div className="text-2xl font-mono text-white/30">
                                {Math.floor(timeLeft / 60)}:{String(Math.floor(timeLeft % 60)).padStart(2, '0')}
                            </div>
                        </motion.div>
                    )}

                    {phase === 'complete' && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                            <h2 className="text-4xl font-bold text-green-400">Sequence Complete</h2>
                            <p className="text-muted-foreground">Neural state recalibrated.</p>
                            <div className="flex gap-4 pt-4">
                                <Button variant="outline" onClick={() => setPhase('intro')}>
                                    <RotateCcw className="w-4 h-4 mr-2" /> Repeat
                                </Button>
                                <Button onClick={onClose}>
                                    Return to Dashboard
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
