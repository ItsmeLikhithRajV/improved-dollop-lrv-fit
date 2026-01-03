/**
 * Blueprint Protocol Card - Bryan Johnson Longevity Tracking
 * 
 * Features:
 * - Daily checklist with visual progress
 * - Supplement stack tracking
 * - Protocol adherence score
 * - Biomarker targets comparison
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Dna, Check, X, Clock, Sun, Moon, Utensils,
    Pill, Dumbbell, Brain, Heart, Sparkles, ChevronDown,
    Target, TrendingUp, AlertCircle, Info
} from 'lucide-react';
import { GlassCard, cn } from '../../components/ui';
import { scoreToStatus, getStatusTextColor } from '../../ui/shared/statusUtils';
import {
    BLUEPRINT_DAILY_CHECKLIST,
    BLUEPRINT_MEALS,
    BLUEPRINT_SUPPLEMENT_STACK,
    BLUEPRINT_BIOMARKER_TARGETS,
    BlueprintChecklistItem
} from '../../types/blueprint';

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const ChecklistItem: React.FC<{
    item: Omit<BlueprintChecklistItem, 'completed'>;
    completed: boolean;
    onToggle: () => void;
}> = ({ item, completed, onToggle }) => {
    const categoryIcons = {
        sleep: Moon,
        nutrition: Utensils,
        supplements: Pill,
        exercise: Dumbbell,
        light: Sun,
        skincare: Sparkles,
        metrics: Heart
    };

    const Icon = categoryIcons[item.category];

    return (
        <motion.button
            onClick={onToggle}
            className={cn(
                'flex items-center gap-3 w-full p-3 rounded-lg transition-all text-left',
                completed ? 'bg-green-500/10' : 'bg-white/5 hover:bg-white/10'
            )}
            whileTap={{ scale: 0.98 }}
        >
            <div className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                completed ? 'border-green-500 bg-green-500' : 'border-white/30'
            )}>
                {completed && <Check className="w-3 h-3 text-white" />}
            </div>
            <Icon className={cn('w-4 h-4', completed ? 'text-green-400' : 'text-muted-foreground')} />
            <div className="flex-1">
                <div className={cn('text-sm', completed ? 'text-green-400' : 'text-white/80')}>
                    {item.title}
                </div>
                <div className="text-xs text-muted-foreground">{item.time}</div>
            </div>
        </motion.button>
    );
};

const SupplementCard: React.FC<{ supplements: typeof BLUEPRINT_SUPPLEMENT_STACK }> = ({ supplements }) => {
    const [expanded, setExpanded] = useState(false);

    const byCategory = supplements.reduce((acc, supp) => {
        if (!acc[supp.category]) acc[supp.category] = [];
        acc[supp.category].push(supp);
        return acc;
    }, {} as Record<string, typeof supplements>);

    const displayedSupps = expanded ? supplements : supplements.slice(0, 6);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Supplement Stack</span>
                <span className="text-xs text-blue-400">{supplements.length} items</span>
            </div>

            <div className="space-y-2">
                {displayedSupps.map((supp, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Pill className="w-3 h-3 text-purple-400" />
                            <span className="text-xs text-white/80">{supp.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{supp.dose}</span>
                            <span className={cn(
                                'text-[10px] px-1.5 py-0.5 rounded',
                                supp.timing === 'morning' ? 'bg-yellow-500/20 text-yellow-400' :
                                    supp.timing === 'with_meal' ? 'bg-green-500/20 text-green-400' :
                                        supp.timing === 'evening' ? 'bg-purple-500/20 text-purple-400' :
                                            'bg-blue-500/20 text-blue-400'
                            )}>
                                {supp.timing.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {supplements.length > 6 && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                    <ChevronDown className={cn('w-3 h-3 transition-transform', expanded && 'rotate-180')} />
                    {expanded ? 'Show less' : `Show ${supplements.length - 6} more`}
                </button>
            )}
        </div>
    );
};

const BiomarkerTargetsCard: React.FC = () => {
    const keyMarkers = BLUEPRINT_BIOMARKER_TARGETS.slice(0, 6);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Key Biomarker Targets</span>
                <span className="text-xs text-blue-400">Blueprint</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {keyMarkers.map((marker, i) => (
                    <div key={i} className="p-2 bg-white/5 rounded-lg">
                        <div className="text-xs text-muted-foreground">{marker.name}</div>
                        <div className="text-sm font-semibold text-white">{marker.target}</div>
                        <div className="text-[10px] text-muted-foreground">{marker.unit}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ScheduleTimeline: React.FC = () => {
    const events = [
        { time: '04:30', label: 'Wake', icon: Sun, color: 'text-yellow-400' },
        { time: '05:30', label: 'Workout', icon: Dumbbell, color: 'text-red-400' },
        { time: '06:45', label: 'Meal 1', icon: Utensils, color: 'text-green-400' },
        { time: '09:00', label: 'Meal 2', icon: Utensils, color: 'text-green-400' },
        { time: '11:00', label: 'Eating Window Ends', icon: X, color: 'text-orange-400' },
        { time: '19:30', label: 'Wind Down', icon: Moon, color: 'text-purple-400' },
        { time: '20:30', label: 'Sleep', icon: Moon, color: 'text-indigo-400' }
    ];

    return (
        <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-yellow-400 via-blue-400 to-indigo-400 opacity-30" />

            <div className="space-y-3">
                {events.map((event, i) => {
                    const Icon = event.icon;
                    return (
                        <div key={i} className="flex items-center gap-3 pl-6 relative">
                            <div className={cn(
                                'absolute left-1.5 w-3 h-3 rounded-full border-2',
                                event.color.replace('text-', 'border-').replace('-400', '-500'),
                                'bg-background'
                            )} />
                            <span className="text-xs font-mono text-muted-foreground w-12">{event.time}</span>
                            <Icon className={cn('w-3 h-3', event.color)} />
                            <span className="text-xs text-white/80">{event.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface BlueprintProtocolCardProps {
    className?: string;
}

export const BlueprintProtocolCard: React.FC<BlueprintProtocolCardProps> = ({
    className
}) => {
    // Local state for checklist
    const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

    const toggleItem = (id: string) => {
        setCompletedItems(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const adherenceScore = useMemo(() => {
        return Math.round((completedItems.size / BLUEPRINT_DAILY_CHECKLIST.length) * 100);
    }, [completedItems.size]);

    // Use scientific status classification
    const adherenceColor = getStatusTextColor(scoreToStatus(adherenceScore));

    return (
        <GlassCard className={cn('p-6', className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                        <Dna className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Blueprint Protocol</h3>
                        <p className="text-xs text-muted-foreground">Bryan Johnson's Longevity Stack</p>
                    </div>
                </div>

                {/* Adherence Score */}
                <div className="text-right">
                    <div className={cn('text-2xl font-bold', adherenceColor)}>
                        {adherenceScore}%
                    </div>
                    <div className="text-xs text-muted-foreground">Adherence</div>
                </div>
            </div>

            {/* Progress Ring */}
            <div className="flex items-center justify-center mb-6">
                <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="64"
                            cy="64"
                            r="56"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-white/10"
                        />
                        <motion.circle
                            cx="64"
                            cy="64"
                            r="56"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 56}
                            initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - adherenceScore / 100) }}
                            transition={{ duration: 0.5 }}
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="hsl(270, 70%, 50%)" />
                                <stop offset="100%" stopColor="hsl(200, 70%, 50%)" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-xl font-bold text-white">
                            {completedItems.size}/{BLUEPRINT_DAILY_CHECKLIST.length}
                        </div>
                        <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                </div>
            </div>

            {/* Daily Checklist */}
            <div className="space-y-2 mb-6">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                    Today's Protocol
                </div>
                {BLUEPRINT_DAILY_CHECKLIST.map((item) => (
                    <ChecklistItem
                        key={item.id}
                        item={item}
                        completed={completedItems.has(item.id)}
                        onToggle={() => toggleItem(item.id)}
                    />
                ))}
            </div>

            {/* Schedule Timeline */}
            <details className="mb-6">
                <summary className="text-xs text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-white transition-colors mb-3">
                    Daily Schedule
                </summary>
                <div className="mt-3 p-4 bg-white/5 rounded-lg">
                    <ScheduleTimeline />
                </div>
            </details>

            {/* Supplements */}
            <details className="mb-6">
                <summary className="text-xs text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-white transition-colors">
                    Supplement Stack ({BLUEPRINT_SUPPLEMENT_STACK.length})
                </summary>
                <div className="mt-3">
                    <SupplementCard supplements={BLUEPRINT_SUPPLEMENT_STACK} />
                </div>
            </details>

            {/* Biomarker Targets */}
            <details>
                <summary className="text-xs text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-white transition-colors">
                    Biomarker Targets
                </summary>
                <div className="mt-3">
                    <BiomarkerTargetsCard />
                </div>
            </details>

            {/* Info Footer */}
            <div className="mt-6 p-3 bg-blue-500/10 rounded-lg border-l-2 border-blue-500">
                <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-white/70">
                        Based on Bryan Johnson's open-source Blueprint protocol.
                        Consult a healthcare professional before adopting any longevity interventions.
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};

export default BlueprintProtocolCard;
