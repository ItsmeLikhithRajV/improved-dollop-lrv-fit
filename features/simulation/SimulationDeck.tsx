import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Flag, X, Target, Calendar, TrendingUp, Lock, Unlock,
    Compass, ChevronRight, Trophy, BarChart2, Map as MapIcon
} from 'lucide-react';
import { GlassCard, Button, cn } from '../../components/ui';
import { useSentient } from '../../store/SentientContext';

// --- PRESET MISSIONS ---
const MISSIONS = [
    { id: 'hybrid', name: 'Hybrid Athlete', description: 'Strength + Endurance Balance', phases: 4 },
    { id: 'marathon', name: 'Marathon Prep', description: 'Build to 42km', phases: 5 },
    { id: 'strength', name: 'Strength Peak', description: 'Max Strength Focus', phases: 3 },
    { id: 'longevity', name: 'Longevity Protocol', description: 'Health Span Optimization', phases: 6 },
];

export const StrategyDeck = () => {
    const { state } = useSentient();
    const [isOpen, setIsOpen] = useState(false);
    const [currentMission, setCurrentMission] = useState(MISSIONS[0]);
    const [currentPhase, setCurrentPhase] = useState(1);

    return (
        <>
            {/* FLOATING TRIGGER BUTTON (Bottom-Left) */}
            <div className="fixed bottom-6 left-6 z-[90]">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className={cn(
                        "w-14 h-14 rounded-full flex items-center justify-center border shadow-lg transition-all",
                        "bg-gradient-to-br from-purple-600 to-indigo-700 border-purple-400/30 text-white hover:shadow-purple-500/30"
                    )}
                >
                    <Compass className="w-7 h-7" />
                </motion.button>
            </div>

            {/* STRATEGY ROOM MODAL */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
                    >
                        <GlassCard className="max-w-3xl w-full border-t-4 border-t-purple-500 shadow-2xl relative overflow-hidden">
                            {/* Ambient Glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full" />

                            <div className="relative z-10">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <MapIcon className="w-5 h-5 text-purple-400" />
                                            <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Strategy Room</span>
                                        </div>
                                        <h2 className="text-3xl font-bold text-white">Current Mission</h2>
                                    </div>
                                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* CURRENT MISSION CARD */}
                                <div className="p-6 rounded-xl bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/20 mb-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-2xl font-bold text-white">{currentMission.name}</h3>
                                            <p className="text-sm text-white/60">{currentMission.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-4xl font-black text-purple-400/30">PHASE {currentPhase}</div>
                                        </div>
                                    </div>

                                    {/* Phase Progress */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-white/70">Phase {currentPhase} of {currentMission.phases}</span>
                                            <span className="text-purple-400 font-mono">Week 3 of 8</span>
                                        </div>
                                        <div className="h-3 bg-black/30 rounded-full overflow-hidden border border-white/10">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(currentPhase / currentMission.phases) * 100}%` }}
                                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="p-3 bg-black/20 rounded-lg border border-white/5 text-center">
                                            <Target className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                                            <div className="text-lg font-bold">4.2</div>
                                            <div className="text-[10px] uppercase text-white/40">Adherence</div>
                                        </div>
                                        <div className="p-3 bg-black/20 rounded-lg border border-white/5 text-center">
                                            <TrendingUp className="w-4 h-4 text-green-400 mx-auto mb-1" />
                                            <div className="text-lg font-bold">High</div>
                                            <div className="text-[10px] uppercase text-white/40">Momentum</div>
                                        </div>
                                        <div className="p-3 bg-black/20 rounded-lg border border-white/5 text-center">
                                            <Calendar className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                                            <div className="text-lg font-bold">34</div>
                                            <div className="text-[10px] uppercase text-white/40">Days Left</div>
                                        </div>
                                    </div>
                                </div>

                                {/* CHANGE MISSION */}
                                <div className="mb-6">
                                    <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Switch Mission</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {MISSIONS.map((m) => (
                                            <button
                                                key={m.id}
                                                onClick={() => { setCurrentMission(m); setCurrentPhase(1); }}
                                                className={cn(
                                                    "p-3 rounded-lg border text-left transition-all flex items-center gap-3",
                                                    currentMission.id === m.id
                                                        ? "bg-purple-500/20 border-purple-500 text-white"
                                                        : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                                                )}
                                            >
                                                <Flag className="w-4 h-4" />
                                                <div>
                                                    <div className="font-bold text-sm">{m.name}</div>
                                                    <div className="text-[10px] opacity-60">{m.phases} Phases</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* ACTIONS */}
                                <div className="flex gap-3">
                                    <Button variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>
                                        Close
                                    </Button>
                                    <Button className="flex-1 bg-purple-600 hover:bg-purple-500">
                                        <Trophy className="w-4 h-4 mr-2" /> View Full Roadmap
                                    </Button>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
