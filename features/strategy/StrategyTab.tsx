import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Flag, Target, Calendar, BarChart2, Map as MapIcon,
    Trophy, TrendingUp, History, Lock, Unlock, Brain, Activity, Flame
} from 'lucide-react';
import { GlassCard, Button, cn } from '../../components/ui';
import { useSentient } from '../../store/SentientContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export const StrategyTab: React.FC = () => {
    const { state } = useSentient();
    const [view, setView] = useState<'warmap' | 'vault'>('warmap');

    return (
        <div className="pb-24 animate-in fade-in duration-500">
            {/* Header / Toggle */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
                        {view === 'warmap' ? <MapIcon className="w-6 h-6" /> : <History className="w-6 h-6" />}
                        {view === 'warmap' ? 'The Strategy Room' : 'The Data Vault'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {view === 'warmap' ? 'Macro-Cycle Planning & Objectives' : 'Deep Analytics & Performance Archives'}
                    </p>
                </div>

                <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                    <button
                        onClick={() => setView('warmap')}
                        className={cn(
                            "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                            view === 'warmap' ? "bg-primary text-black shadow-lg" : "text-muted-foreground hover:text-white"
                        )}
                    >
                        <Flag className="w-4 h-4" /> War Map
                    </button>
                    <button
                        onClick={() => setView('vault')}
                        className={cn(
                            "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                            view === 'vault' ? "bg-purple-500 text-white shadow-lg" : "text-muted-foreground hover:text-white"
                        )}
                    >
                        <BarChart2 className="w-4 h-4" /> The Vault
                    </button>
                </div>
            </div>

            {/* --- VIEW: THE WAR MAP --- */}
            {view === 'warmap' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 1. CURRENT OBJECTIVE CARD */}
                    <GlassCard className="lg:col-span-2 relative overflow-hidden border-t-4 border-t-primary">
                        <div className="absolute top-0 right-0 p-32 bg-primary/20 blur-[100px] rounded-full" />

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="text-xs text-primary font-bold tracking-widest uppercase mb-1">Current Mission</div>
                                    <h3 className="text-3xl font-bold text-white">Hybrid Athlete Protocol</h3>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-black text-white/20">PHASE 1</div>
                                </div>
                            </div>

                            {/* Phase Progress */}
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-white">Phase 1: Base Building</span>
                                        <span className="text-primary font-mono">Week 3 of 8</span>
                                    </div>
                                    <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '37%' }}
                                            className="h-full bg-gradient-to-r from-primary to-green-400"
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Focus: Aerobic capacity, connective tissue strength, sleep hygiene.
                                    </p>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                                        <Target className="w-5 h-5 text-primary mb-2" />
                                        <div className="text-xl font-bold">4.2<span className="text-sm opacity-50">/5</span></div>
                                        <div className="text-[10px] uppercase text-muted-foreground">Adherence</div>
                                    </div>
                                    <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                                        <TrendingUp className="w-5 h-5 text-green-400 mb-2" />
                                        <div className="text-xl font-bold">High</div>
                                        <div className="text-[10px] uppercase text-muted-foreground">Momentum</div>
                                    </div>
                                    <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                                        <Calendar className="w-5 h-5 text-purple-400 mb-2" />
                                        <div className="text-xl font-bold">34</div>
                                        <div className="text-[10px] uppercase text-muted-foreground">Days Left</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* 2. NEXT PHASES */}
                    <div className="space-y-4">
                        <GlassCard className="opacity-50 border-dashed border-white/20">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-white/50">Phase 2: Strength Peak</h4>
                                <Lock className="w-4 h-4 text-white/30" />
                            </div>
                            <p className="text-xs text-muted-foreground">Unlock by completing Base Building with &gt;80% adherence.</p>
                        </GlassCard>
                        <GlassCard className="opacity-50 border-dashed border-white/20">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-white/50">Phase 3: Realization</h4>
                                <Lock className="w-4 h-4 text-white/30" />
                            </div>
                            <p className="text-xs text-muted-foreground">Unlock by completing Strength Peak.</p>
                        </GlassCard>
                        <Button variant="outline" className="w-full text-xs opacity-70">
                            View Full Macro-Cycle
                        </Button>
                    </div>
                </div>
            )}

            {/* --- VIEW: THE VAULT --- */}
            {view === 'vault' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
                            <Trophy className="w-8 h-8 text-yellow-400 mb-2" />
                            <div className="text-2xl font-bold">14</div>
                            <div className="text-[10px] uppercase text-muted-foreground">Personal Records</div>
                        </GlassCard>
                        <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
                            <Flame className="w-8 h-8 text-orange-400 mb-2" />
                            <div className="text-2xl font-bold">88%</div>
                            <div className="text-[10px] uppercase text-muted-foreground">Avg Consistency</div>
                        </GlassCard>
                        <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
                            <Activity className="w-8 h-8 text-primary mb-2" />
                            <div className="text-2xl font-bold">4.2M</div>
                            <div className="text-[10px] uppercase text-muted-foreground">Total Volume</div>
                        </GlassCard>
                        <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
                            <Brain className="w-8 h-8 text-cyan-400 mb-2" />
                            <div className="text-2xl font-bold">42h</div>
                            <div className="text-[10px] uppercase text-muted-foreground">Mindspace Time</div>
                        </GlassCard>
                    </div>

                    <GlassCard className="p-6">
                        <h3 className="font-semibold text-white mb-6">Yearly Performance Heatmap</h3>
                        <div className="h-[200px]">
                            {/* Mock Chart Area */}
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { month: 'Jan', val: 60 }, { month: 'Feb', val: 75 },
                                    { month: 'Mar', val: 85 }, { month: 'Apr', val: 65 },
                                    { month: 'May', val: 90 }, { month: 'Jun', val: 88 },
                                    { month: 'Jul', val: 92 }, { month: 'Aug', val: 50 },
                                    { month: 'Sep', val: 70 }, { month: 'Oct', val: 80 },
                                    { month: 'Nov', val: 85 }, { month: 'Dec', val: 95 },
                                ]}>
                                    <XAxis dataKey="month" tick={{ fill: 'white', opacity: 0.3, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'white', opacity: 0.05 }}
                                        contentStyle={{ background: '#000', border: '1px solid #333' }}
                                    />
                                    <Bar dataKey="val" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};
