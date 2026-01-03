
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Play, RotateCcw, TrendingUp, TrendingDown, AlertTriangle,
    Calendar, Flame, Moon, Activity, Dumbbell
} from 'lucide-react';
import { GlassCard, Button, Badge, cn } from '../../components/ui';
import { useSentient } from '../../store/SentientContext';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine, Area, AreaChart
} from 'recharts';

// Schedule archetypes
const SCHEDULE_ARCHETYPES = [
    {
        id: 'maintenance',
        name: 'Maintenance',
        description: 'Steady load, balanced recovery',
        icon: Activity,
        loadMultiplier: 1.0,
        recoveryFocus: 1.0
    },
    {
        id: 'build',
        name: 'Build Phase',
        description: 'Progressive overload',
        icon: TrendingUp,
        loadMultiplier: 1.2,
        recoveryFocus: 0.9
    },
    {
        id: 'shock',
        name: 'Shock Week',
        description: 'High volume, high intensity',
        icon: Flame,
        loadMultiplier: 1.5,
        recoveryFocus: 0.7
    },
    {
        id: 'taper',
        name: 'Taper',
        description: 'Reduced load for competition',
        icon: TrendingDown,
        loadMultiplier: 0.6,
        recoveryFocus: 1.3
    },
    {
        id: 'deload',
        name: 'Deload Week',
        description: 'Active recovery focus',
        icon: RotateCcw,
        loadMultiplier: 0.4,
        recoveryFocus: 1.5
    }
];

// Lifestyle scenarios
const LIFESTYLE_SCENARIOS = [
    { id: 'optimal', name: 'Optimal', sleepMod: 1.1, stressMod: 0.8, fuelMod: 1.1 },
    { id: 'normal', name: 'Normal', sleepMod: 1.0, stressMod: 1.0, fuelMod: 1.0 },
    { id: 'busy', name: 'Busy Period', sleepMod: 0.85, stressMod: 1.3, fuelMod: 0.9 },
    { id: 'travel', name: 'Travel Week', sleepMod: 0.8, stressMod: 1.2, fuelMod: 0.85 },
    { id: 'sick', name: 'Fighting Illness', sleepMod: 0.7, stressMod: 1.4, fuelMod: 0.8 }
];

interface SimulationDay {
    day: number;
    readiness: number;
    acwr: number;
    fatigue: number;
    isCritical: boolean;
}

export const SimulatorTab: React.FC = () => {
    const { state } = useSentient();
    const [selectedSchedule, setSelectedSchedule] = useState('maintenance');
    const [selectedLifestyle, setSelectedLifestyle] = useState('normal');
    const [simulationDays, setSimulationDays] = useState(14);
    const [hasRun, setHasRun] = useState(false);

    // Simulate trajectory
    const simulation = useMemo(() => {
        if (!hasRun) return null;

        const schedule = SCHEDULE_ARCHETYPES.find(s => s.id === selectedSchedule)!;
        const lifestyle = LIFESTYLE_SCENARIOS.find(l => l.id === selectedLifestyle)!;

        const days: SimulationDay[] = [];
        let readiness = state.mindspace.readiness_score;
        let acwr = state.physical_load.acwr;
        let fatigue = 0;
        let failurePoint: number | null = null;

        for (let i = 1; i <= simulationDays; i++) {
            // Daily load effect
            const dailyLoad = schedule.loadMultiplier * (1 + Math.random() * 0.2 - 0.1);

            // Recovery effect (influenced by lifestyle)
            const dailyRecovery = schedule.recoveryFocus * lifestyle.sleepMod * 0.15;

            // Stress impact
            const stressImpact = (lifestyle.stressMod - 1) * 5;

            // Update fatigue
            fatigue = Math.max(0, fatigue + (dailyLoad * 10) - (dailyRecovery * 15));

            // Update ACWR (simplified)
            acwr = acwr * 0.9 + dailyLoad * 0.15;

            // Update readiness
            const readinessChange = dailyRecovery * 20 - (fatigue * 0.3) - stressImpact;
            readiness = Math.max(20, Math.min(100, readiness + readinessChange));

            // Check for critical state
            const isCritical = readiness < 40 || acwr > 1.5;

            if (isCritical && failurePoint === null) {
                failurePoint = i;
            }

            days.push({
                day: i,
                readiness: Math.round(readiness),
                acwr: Math.round(acwr * 100) / 100,
                fatigue: Math.round(fatigue),
                isCritical
            });
        }

        // Generate recommendation
        let recommendation = '';
        if (failurePoint) {
            recommendation = `Warning: System stress reaches critical levels around day ${failurePoint}. Consider adding recovery days or reducing volume.`;
        } else if (days[days.length - 1].readiness > state.mindspace.readiness_score) {
            recommendation = `This approach should improve readiness by ${days[days.length - 1].readiness - state.mindspace.readiness_score} points over ${simulationDays} days.`;
        } else {
            recommendation = `Readiness may decline slightly. Ensure adequate recovery between sessions.`;
        }

        return {
            days,
            failurePoint,
            recommendation,
            finalReadiness: days[days.length - 1].readiness,
            avgReadiness: Math.round(days.reduce((s, d) => s + d.readiness, 0) / days.length)
        };
    }, [hasRun, selectedSchedule, selectedLifestyle, simulationDays, state]);

    const handleRunSimulation = () => {
        setHasRun(true);
    };

    const handleReset = () => {
        setHasRun(false);
    };

    return (
        <div className="pb-24 animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold gradient-text">What-If Simulator</h2>
                <p className="text-sm text-muted-foreground">
                    Predict how different training approaches affect your readiness
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuration Panel */}
                <GlassCard className="p-6">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        Configure Scenario
                    </h3>

                    {/* Schedule Selector */}
                    <div className="mb-6">
                        <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                            Training Schedule
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            {SCHEDULE_ARCHETYPES.map((sched) => (
                                <button
                                    key={sched.id}
                                    onClick={() => { setSelectedSchedule(sched.id); setHasRun(false); }}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                                        selectedSchedule === sched.id
                                            ? "border-primary bg-primary/10 text-white"
                                            : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                                    )}
                                >
                                    <sched.icon className="w-5 h-5" />
                                    <div>
                                        <div className="font-medium">{sched.name}</div>
                                        <div className="text-xs opacity-60">{sched.description}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Lifestyle Selector */}
                    <div className="mb-6">
                        <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                            Lifestyle Context
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {LIFESTYLE_SCENARIOS.map((life) => (
                                <button
                                    key={life.id}
                                    onClick={() => { setSelectedLifestyle(life.id); setHasRun(false); }}
                                    className={cn(
                                        "px-3 py-2 rounded-lg border text-sm transition-all",
                                        selectedLifestyle === life.id
                                            ? "border-primary bg-primary/10 text-white"
                                            : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                                    )}
                                >
                                    {life.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Days Slider */}
                    <div className="mb-6">
                        <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                            Simulation Duration: {simulationDays} days
                        </label>
                        <input
                            type="range"
                            min={7}
                            max={28}
                            value={simulationDays}
                            onChange={(e) => { setSimulationDays(Number(e.target.value)); setHasRun(false); }}
                            className="w-full accent-primary"
                        />
                    </div>

                    {/* Run Button */}
                    <Button
                        onClick={hasRun ? handleReset : handleRunSimulation}
                        className="w-full"
                    >
                        {hasRun ? (
                            <>
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reset Simulation
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4 mr-2" />
                                Run Simulation
                            </>
                        )}
                    </Button>
                </GlassCard>

                {/* Results Panel */}
                <GlassCard className="p-6">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        Predicted Trajectory
                    </h3>

                    {!hasRun ? (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                                <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>Configure scenario and run simulation</p>
                            </div>
                        </div>
                    ) : simulation && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {/* Chart */}
                            <div className="h-[250px] mb-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={simulation.days}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis
                                            dataKey="day"
                                            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            domain={[0, 100]}
                                            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                background: 'rgba(0,0,0,0.9)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <ReferenceLine y={40} stroke="rgba(239,68,68,0.5)" strokeDasharray="5 5" />
                                        <ReferenceLine y={state.mindspace.readiness_score} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
                                        <Area
                                            type="monotone"
                                            dataKey="readiness"
                                            stroke="hsl(var(--primary))"
                                            fill="url(#readinessGradient)"
                                            strokeWidth={2}
                                        />
                                        <defs>
                                            <linearGradient id="readinessGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="text-center p-3 bg-white/5 rounded-lg">
                                    <div className="text-2xl font-bold text-primary">{simulation.finalReadiness}</div>
                                    <div className="text-[10px] text-muted-foreground uppercase">Final</div>
                                </div>
                                <div className="text-center p-3 bg-white/5 rounded-lg">
                                    <div className="text-2xl font-bold text-white">{simulation.avgReadiness}</div>
                                    <div className="text-[10px] text-muted-foreground uppercase">Average</div>
                                </div>
                                <div className="text-center p-3 bg-white/5 rounded-lg">
                                    <div className={cn(
                                        "text-2xl font-bold",
                                        simulation.failurePoint ? "text-red-400" : "text-green-400"
                                    )}>
                                        {simulation.failurePoint ? `Day ${simulation.failurePoint}` : 'None'}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground uppercase">Risk Point</div>
                                </div>
                            </div>

                            {/* Recommendation */}
                            <div className={cn(
                                "p-4 rounded-lg border",
                                simulation.failurePoint
                                    ? "bg-red-500/10 border-red-500/30"
                                    : "bg-green-500/10 border-green-500/30"
                            )}>
                                <div className="flex items-start gap-3">
                                    {simulation.failurePoint ? (
                                        <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                                    ) : (
                                        <TrendingUp className="w-5 h-5 text-green-400 mt-0.5" />
                                    )}
                                    <p className="text-sm text-white/80">{simulation.recommendation}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </GlassCard>
            </div>
        </div>
    );
};
