/**
 * CompetitionFocusScreen - Full-Screen Competition Mode
 * 
 * A premium full-screen takeover for athletes approaching competition.
 * Shows countdown, taper checklist, mental prep protocols, and race-day timeline.
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Swords, Calendar, Brain, Timer, CheckCircle2, Circle,
    Zap, Moon, Utensils, Heart, Target, ChevronRight, Play,
    Clock, Flag, Award, Shield, Flame, Wind
} from 'lucide-react';
import { GlassCard, cn, Button } from '../../components/ui';

// =====================================================
// TYPES
// =====================================================

interface TaperTask {
    id: string;
    task: string;
    category: 'sleep' | 'fuel' | 'gear' | 'mind' | 'physical';
    completed: boolean;
    daysBeforeEvent: number;
    description?: string;
}

interface MentalPrepProtocol {
    id: string;
    name: string;
    duration: string;
    description: string;
    type: 'visualization' | 'breathing' | 'affirmation' | 'routine';
}

interface RaceTimelineItem {
    time: string;
    label: string;
    action: string;
    category: 'fuel' | 'mental' | 'physical' | 'logistics';
    completed?: boolean;
}

interface CompetitionFocusScreenProps {
    isOpen: boolean;
    onClose: () => void;
    eventName: string;
    eventDate: string;
    daysLeft: number;
    phase: string;
    taperChecklist?: TaperTask[];
    onToggleTaperTask?: (index: number) => void;
}

// =====================================================
// DEFAULT DATA
// =====================================================

const DEFAULT_MENTAL_PROTOCOLS: MentalPrepProtocol[] = [
    {
        id: 'viz-1',
        name: 'Race Visualization',
        duration: '10 min',
        description: 'Mentally rehearse your ideal race from start to finish',
        type: 'visualization'
    },
    {
        id: 'breath-1',
        name: 'Pre-Race Calm',
        duration: '5 min',
        description: 'Box breathing to center your nervous system',
        type: 'breathing'
    },
    {
        id: 'affirm-1',
        name: 'Power Statements',
        duration: '3 min',
        description: 'Reinforce your training and capability',
        type: 'affirmation'
    },
    {
        id: 'routine-1',
        name: 'Race Morning Routine',
        duration: '45 min',
        description: 'Your personalized pre-race activation sequence',
        type: 'routine'
    }
];

const generateRaceTimeline = (eventName: string): RaceTimelineItem[] => [
    { time: 'T-12h', label: 'Night Before', action: 'Prepare gear, lay out clothes, early dinner', category: 'logistics' },
    { time: 'T-10h', label: 'Sleep', action: 'Lights out by 9pm, prioritize 8+ hours', category: 'mental' },
    { time: 'T-3h', label: 'Wake Up', action: 'Gentle wake, hydrate, light movement', category: 'physical' },
    { time: 'T-2.5h', label: 'Breakfast', action: 'Familiar meal: carbs + light protein', category: 'fuel' },
    { time: 'T-1.5h', label: 'Arrive Venue', action: 'Check in, locate facilities, settle nerves', category: 'logistics' },
    { time: 'T-45m', label: 'Warm Up', action: 'Dynamic stretches, activation drills', category: 'physical' },
    { time: 'T-15m', label: 'Mental Prep', action: 'Visualization, breathing, power stance', category: 'mental' },
    { time: 'T-5m', label: 'Final Prep', action: 'Gel/nutrition, line up, focus cue', category: 'fuel' },
    { time: 'START', label: eventName, action: 'Execute your race plan!', category: 'physical' }
];

// =====================================================
// SUB-COMPONENTS
// =====================================================

const CountdownHero = ({ daysLeft, eventName, phase }: { daysLeft: number; eventName: string; phase: string }) => {
    const urgency = daysLeft <= 3 ? 'critical' : daysLeft <= 7 ? 'high' : 'medium';

    return (
        <div className="text-center py-8 relative">
            {/* Background glow */}
            <div className={cn(
                "absolute inset-0 opacity-20 blur-3xl",
                urgency === 'critical' ? "bg-red-500" :
                    urgency === 'high' ? "bg-amber-500" : "bg-blue-500"
            )} />

            <div className="relative z-10">
                <div className={cn(
                    "text-8xl font-black font-mono tracking-tighter",
                    urgency === 'critical' ? "text-red-400" :
                        urgency === 'high' ? "text-amber-400" : "text-blue-400"
                )}>
                    {daysLeft}
                </div>
                <div className="text-xl text-white/40 uppercase tracking-widest font-bold mt-1">
                    {daysLeft === 1 ? 'Day' : 'Days'} to Go
                </div>
                <div className="text-2xl font-bold text-white mt-4">{eventName}</div>
                <div className="text-sm text-white/50 mt-1">{phase} Phase</div>
            </div>
        </div>
    );
};

const TaperChecklistSection = ({
    tasks,
    onToggle,
    daysLeft
}: {
    tasks: TaperTask[];
    onToggle?: (index: number) => void;
    daysLeft: number;
}) => {
    const categoryIcons = {
        sleep: Moon,
        fuel: Utensils,
        gear: Shield,
        mind: Brain,
        physical: Flame
    };

    const categoryColors = {
        sleep: 'text-indigo-400 bg-indigo-500/20',
        fuel: 'text-emerald-400 bg-emerald-500/20',
        gear: 'text-slate-400 bg-slate-500/20',
        mind: 'text-purple-400 bg-purple-500/20',
        physical: 'text-orange-400 bg-orange-500/20'
    };

    // Filter tasks relevant to current timeframe
    const relevantTasks = tasks.filter(t => t.daysBeforeEvent >= daysLeft - 1);
    const completedCount = relevantTasks.filter(t => t.completed).length;
    const progress = relevantTasks.length > 0 ? (completedCount / relevantTasks.length) * 100 : 0;

    return (
        <GlassCard>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white">Taper Checklist</h3>
                </div>
                <span className="text-xs text-white/50">{completedCount}/{relevantTasks.length}</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-4">
                <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            <div className="space-y-2">
                {relevantTasks.map((task, i) => {
                    const Icon = categoryIcons[task.category];
                    return (
                        <motion.div
                            key={task.id}
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
                                task.completed
                                    ? "bg-emerald-500/10 border border-emerald-500/20"
                                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                            )}
                            onClick={() => onToggle?.(i)}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className={cn(
                                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                task.completed
                                    ? "bg-emerald-500 border-emerald-500"
                                    : "border-white/30"
                            )}>
                                {task.completed && <CheckCircle2 className="w-4 h-4 text-emerald-950" />}
                            </div>

                            <div className={cn("p-1.5 rounded-lg", categoryColors[task.category])}>
                                <Icon className="w-4 h-4" />
                            </div>

                            <div className="flex-1">
                                <div className={cn(
                                    "text-sm font-medium",
                                    task.completed ? "text-white/50 line-through" : "text-white"
                                )}>
                                    {task.task}
                                </div>
                                {task.description && (
                                    <div className="text-xs text-white/40 mt-0.5">{task.description}</div>
                                )}
                            </div>

                            <span className="text-[10px] text-white/30 uppercase">
                                T-{task.daysBeforeEvent}d
                            </span>
                        </motion.div>
                    );
                })}
            </div>
        </GlassCard>
    );
};

const MentalPrepSection = ({ protocols }: { protocols: MentalPrepProtocol[] }) => {
    const typeIcons = {
        visualization: Target,
        breathing: Wind,
        affirmation: Zap,
        routine: Clock
    };

    const typeColors = {
        visualization: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30',
        breathing: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
        affirmation: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
        routine: 'text-purple-400 bg-purple-500/20 border-purple-500/30'
    };

    return (
        <GlassCard>
            <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-white">Mental Prep</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {protocols.map(protocol => {
                    const Icon = typeIcons[protocol.type];
                    return (
                        <motion.div
                            key={protocol.id}
                            className={cn(
                                "p-4 rounded-xl border cursor-pointer hover:scale-[1.02] transition-transform",
                                typeColors[protocol.type]
                            )}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <Icon className="w-5 h-5" />
                                <span className="text-[10px] uppercase tracking-wider opacity-60">
                                    {protocol.duration}
                                </span>
                            </div>
                            <div className="text-sm font-bold text-white">{protocol.name}</div>
                            <div className="text-xs text-white/50 mt-1">{protocol.description}</div>

                            <button className="mt-3 flex items-center gap-1 text-xs font-bold uppercase tracking-wider opacity-70 hover:opacity-100 transition-opacity">
                                <Play className="w-3 h-3" /> Start
                            </button>
                        </motion.div>
                    );
                })}
            </div>
        </GlassCard>
    );
};

const RaceTimelineSection = ({ timeline, eventName }: { timeline: RaceTimelineItem[]; eventName: string }) => {
    const categoryColors = {
        fuel: 'border-emerald-500 bg-emerald-500',
        mental: 'border-purple-500 bg-purple-500',
        physical: 'border-orange-500 bg-orange-500',
        logistics: 'border-slate-500 bg-slate-500'
    };

    return (
        <GlassCard>
            <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-white">Race Day Timeline</h3>
            </div>

            <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 via-purple-500 to-orange-500" />

                <div className="space-y-4 pl-10">
                    {timeline.map((item, i) => (
                        <motion.div
                            key={i}
                            className="relative"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            {/* Dot */}
                            <div className={cn(
                                "absolute -left-[26px] top-1 w-3 h-3 rounded-full border-2",
                                categoryColors[item.category],
                                item.time === 'START' && "w-4 h-4 -left-[28px]"
                            )} />

                            <div className="flex items-start gap-3">
                                <div className="w-16 text-right">
                                    <span className={cn(
                                        "text-xs font-mono font-bold",
                                        item.time === 'START' ? "text-emerald-400" : "text-white/50"
                                    )}>
                                        {item.time}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <div className={cn(
                                        "text-sm font-bold",
                                        item.time === 'START' ? "text-emerald-400" : "text-white"
                                    )}>
                                        {item.label}
                                    </div>
                                    <div className="text-xs text-white/50">{item.action}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </GlassCard>
    );
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export const CompetitionFocusScreen: React.FC<CompetitionFocusScreenProps> = ({
    isOpen,
    onClose,
    eventName,
    eventDate,
    daysLeft,
    phase,
    taperChecklist = [],
    onToggleTaperTask
}) => {
    const [activeTab, setActiveTab] = useState<'checklist' | 'mental' | 'timeline'>('checklist');

    const mentalProtocols = DEFAULT_MENTAL_PROTOCOLS;
    const raceTimeline = useMemo(() => generateRaceTimeline(eventName), [eventName]);

    // Generate default taper checklist if none provided
    const effectiveChecklist = taperChecklist.length > 0 ? taperChecklist : [
        { id: '1', task: 'Reduce training volume by 40%', category: 'physical' as const, completed: false, daysBeforeEvent: 7 },
        { id: '2', task: 'Increase sleep by 1 hour', category: 'sleep' as const, completed: false, daysBeforeEvent: 7 },
        { id: '3', task: 'Prepare race-day nutrition', category: 'fuel' as const, completed: false, daysBeforeEvent: 3 },
        { id: '4', task: 'Pack all gear and lay out kit', category: 'gear' as const, completed: false, daysBeforeEvent: 2 },
        { id: '5', task: 'Practice visualization 2x', category: 'mind' as const, completed: false, daysBeforeEvent: 3 },
        { id: '6', task: 'Carb load begins', category: 'fuel' as const, completed: false, daysBeforeEvent: 2 },
        { id: '7', task: 'Complete race morning routine rehearsal', category: 'mind' as const, completed: false, daysBeforeEvent: 1 }
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 bg-black"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-red-950/30 via-black to-black" />

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-red-500/20 border border-red-500/30">
                                <Swords className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Competition Mode</h2>
                                <p className="text-xs text-white/40">{eventDate}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                        >
                            <X className="w-6 h-6 text-white/60" />
                        </button>
                    </div>

                    {/* Countdown Hero */}
                    <CountdownHero daysLeft={daysLeft} eventName={eventName} phase={phase} />

                    {/* Tab Navigation */}
                    <div className="flex bg-white/5 mx-4 p-1 rounded-xl border border-white/10">
                        {[
                            { id: 'checklist', label: 'Checklist', icon: CheckCircle2 },
                            { id: 'mental', label: 'Mental', icon: Brain },
                            { id: 'timeline', label: 'Race Day', icon: Clock }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                                    activeTab === tab.id
                                        ? "bg-white/10 text-white"
                                        : "text-white/40 hover:text-white/60"
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <AnimatePresence mode="wait">
                            {activeTab === 'checklist' && (
                                <motion.div
                                    key="checklist"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <TaperChecklistSection
                                        tasks={effectiveChecklist}
                                        onToggle={onToggleTaperTask}
                                        daysLeft={daysLeft}
                                    />
                                </motion.div>
                            )}

                            {activeTab === 'mental' && (
                                <motion.div
                                    key="mental"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <MentalPrepSection protocols={mentalProtocols} />
                                </motion.div>
                            )}

                            {activeTab === 'timeline' && (
                                <motion.div
                                    key="timeline"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <RaceTimelineSection timeline={raceTimeline} eventName={eventName} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CompetitionFocusScreen;
