/**
 * Fuel Timeline Card - Session-Synced Nutrition Visualization
 * 
 * Features:
 * - Visual timeline with training sessions
 * - Fuel windows with status
 * - Glycogen gauge
 * - Protein distribution
 * - Hydration tracker
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Utensils, Droplets, Flame, Apple, Clock,
    AlertCircle, CheckCircle, TrendingUp, Zap
} from 'lucide-react';
import { GlassCard, cn } from '../../components/ui';
import { analyzeFuel } from '../../services/FuelWindowEngine';
import { FuelWindow } from '../../types/fuel';

// ============================================================================
// TIMELINE VISUALIZATION
// ============================================================================

const TimelineView: React.FC<{ windows: FuelWindow[]; currentTime: number }> = ({ windows, currentTime }) => {
    const parseTime = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    };

    // Timeline from 6 AM to 10 PM
    const startMinutes = 6 * 60;
    const endMinutes = 22 * 60;
    const totalMinutes = endMinutes - startMinutes;

    const getPosition = (time: string) => {
        const minutes = parseTime(time);
        return ((minutes - startMinutes) / totalMinutes) * 100;
    };

    const currentPosition = ((currentTime - startMinutes) / totalMinutes) * 100;

    // Color by window type
    const getWindowColor = (type: string) => {
        if (type.includes('pre_session')) return 'bg-yellow-500/60';
        if (type.includes('during')) return 'bg-orange-500/60';
        if (type.includes('post_session')) return 'bg-green-500/60';
        return 'bg-blue-500/40';
    };

    return (
        <div className="relative h-16 bg-white/5 rounded-lg overflow-hidden">
            {/* Time markers */}
            {[6, 9, 12, 15, 18, 21].map(hour => (
                <div
                    key={hour}
                    className="absolute top-0 h-full border-l border-white/10"
                    style={{ left: `${((hour * 60 - startMinutes) / totalMinutes) * 100}%` }}
                >
                    <span className="text-[8px] text-muted-foreground ml-1">{hour}:00</span>
                </div>
            ))}

            {/* Fuel windows */}
            {windows.map((window, i) => {
                const start = getPosition(window.start_time);
                const end = getPosition(window.end_time);
                const width = Math.max(2, end - start);

                return (
                    <div
                        key={i}
                        className={cn(
                            'absolute top-6 h-6 rounded-sm flex items-center justify-center overflow-hidden',
                            getWindowColor(window.type),
                            window.priority === 'critical' && 'ring-1 ring-green-400'
                        )}
                        style={{ left: `${start}%`, width: `${width}%` }}
                        title={`${window.name}: ${window.start_time} - ${window.end_time}`}
                    >
                        {width > 10 && (
                            <span className="text-[8px] text-white font-medium truncate px-1">
                                {window.name.split(' ')[0]}
                            </span>
                        )}
                    </div>
                );
            })}

            {/* Current time marker */}
            <motion.div
                className="absolute top-0 h-full w-0.5 bg-white z-10"
                style={{ left: `${Math.min(100, Math.max(0, currentPosition))}%` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-white" />
            </motion.div>
        </div>
    );
};

// ============================================================================
// GLYCOGEN GAUGE
// ============================================================================

const GlycogenGauge: React.FC<{ muscle: number; liver: number }> = ({ muscle, liver }) => {
    const getColor = (value: number) => {
        if (value >= 70) return 'bg-green-500';
        if (value >= 40) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="space-y-2">
            <div>
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Muscle Glycogen</span>
                    <span className="text-white">{muscle}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className={cn('h-full rounded-full', getColor(muscle))}
                        initial={{ width: 0 }}
                        animate={{ width: `${muscle}%` }}
                    />
                </div>
            </div>
            <div>
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Liver Glycogen</span>
                    <span className="text-white">{liver}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className={cn('h-full rounded-full', getColor(liver))}
                        initial={{ width: 0 }}
                        animate={{ width: `${liver}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// PROTEIN DISTRIBUTION
// ============================================================================

const ProteinDistribution: React.FC<{
    meals: { name: string; time: string; protein_grams: number; leucine_achieved: boolean }[];
    target: number;
    consumed: number;
}> = ({ meals, target, consumed }) => {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Protein Progress</span>
                <span className="text-white">{consumed}g / {target}g</span>
            </div>

            <div className="flex gap-1">
                {meals.map((meal, i) => (
                    <div
                        key={i}
                        className={cn(
                            'flex-1 h-8 rounded flex flex-col items-center justify-center relative',
                            meal.protein_grams > 0 ? 'bg-green-500/30' : 'bg-white/10'
                        )}
                        title={`${meal.name}: ${meal.protein_grams}g protein`}
                    >
                        {meal.protein_grams > 0 && (
                            <>
                                <span className="text-[10px] text-white font-bold">{meal.protein_grams}g</span>
                                {meal.leucine_achieved && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-2 h-2 text-white" />
                                    </div>
                                )}
                            </>
                        )}
                        <span className="text-[8px] text-muted-foreground mt-0.5">
                            {meal.name.slice(0, 4)}
                        </span>
                    </div>
                ))}
            </div>

            <div className="text-[10px] text-muted-foreground">
                <CheckCircle className="w-3 h-3 inline mr-1 text-green-400" />
                = Leucine threshold (2.5g) achieved
            </div>
        </div>
    );
};

// ============================================================================
// HYDRATION STATUS
// ============================================================================

const HydrationStatus: React.FC<{ consumed: number; target: number; status: string }> = ({
    consumed,
    target,
    status
}) => {
    const percentage = Math.min(100, (consumed / target) * 100);

    const getStatusColor = () => {
        if (status === 'well_hydrated') return 'text-green-400';
        if (status === 'adequate') return 'text-blue-400';
        if (status === 'slightly_low') return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="flex items-center gap-4">
            <div className="relative w-14 h-14">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="28"
                        cy="28"
                        r="24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="text-white/10"
                    />
                    <motion.circle
                        cx="28"
                        cy="28"
                        r="24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        className="text-blue-400"
                        strokeDasharray={2 * Math.PI * 24}
                        initial={{ strokeDashoffset: 2 * Math.PI * 24 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 24 * (1 - percentage / 100) }}
                    />
                </svg>
                <Droplets className="absolute inset-0 m-auto w-5 h-5 text-blue-400" />
            </div>

            <div>
                <div className="text-sm font-medium text-white">{consumed}ml / {target}ml</div>
                <div className={cn('text-xs capitalize', getStatusColor())}>{status.replace('_', ' ')}</div>
            </div>
        </div>
    );
};

// ============================================================================
// CURRENT WINDOW CARD
// ============================================================================

const CurrentWindowCard: React.FC<{ window: FuelWindow | null; nextWindow: FuelWindow | null }> = ({
    window,
    nextWindow
}) => {
    if (!window && !nextWindow) {
        return (
            <div className="p-4 bg-white/5 rounded-lg text-center">
                <span className="text-sm text-muted-foreground">No active fuel windows</span>
            </div>
        );
    }

    const activeWindow = window || nextWindow;
    const isActive = !!window;

    return (
        <div className={cn(
            'p-4 rounded-lg border-l-4',
            isActive ? 'bg-green-500/10 border-green-500' : 'bg-blue-500/10 border-blue-500'
        )}>
            <div className="flex items-center gap-2 mb-2">
                {isActive ? (
                    <Zap className="w-4 h-4 text-green-400" />
                ) : (
                    <Clock className="w-4 h-4 text-blue-400" />
                )}
                <span className="text-xs text-muted-foreground uppercase">
                    {isActive ? 'Active Window' : 'Next Window'}
                </span>
            </div>

            <div className="text-lg font-semibold text-white mb-1">
                {activeWindow!.name}
            </div>

            <div className="text-xs text-white/70 mb-2">
                {activeWindow!.start_time} - {activeWindow!.end_time}
            </div>

            <div className="text-sm text-white/80">
                {activeWindow!.purpose}
            </div>

            {activeWindow!.examples && (
                <div className="mt-3">
                    <div className="text-[10px] text-muted-foreground uppercase mb-1">Examples</div>
                    <div className="flex flex-wrap gap-1">
                        {activeWindow!.examples.slice(0, 3).map((example, i) => (
                            <span
                                key={i}
                                className="text-xs px-2 py-0.5 bg-white/10 rounded"
                            >
                                {example}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Targets */}
            {(activeWindow!.carbs_grams_per_kg || activeWindow!.protein_grams) && (
                <div className="mt-3 flex gap-3 text-xs">
                    {activeWindow!.carbs_grams_per_kg && (
                        <div className="flex items-center gap-1">
                            <Flame className="w-3 h-3 text-orange-400" />
                            <span className="text-white/70">{activeWindow!.carbs_grams_per_kg}g/kg carbs</span>
                        </div>
                    )}
                    {activeWindow!.protein_grams && (
                        <div className="flex items-center gap-1">
                            <Apple className="w-3 h-3 text-red-400" />
                            <span className="text-white/70">{activeWindow!.protein_grams}g protein</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface FuelTimelineCardProps {
    className?: string;
    compact?: boolean;
}

export const FuelTimelineCard: React.FC<FuelTimelineCardProps> = ({
    className,
    compact = false
}) => {
    const analysis = useMemo(() => analyzeFuel(), []);

    const {
        current_window,
        next_window,
        glycogen_status,
        protein_distribution,
        hydration_status,
        today_plan,
        immediate_action,
        current_strategy
    } = analysis;

    const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes();

    if (compact) {
        return (
            <GlassCard className={cn('p-4', className)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/20">
                            <Utensils className="w-4 h-4 text-orange-400" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Fuel</div>
                            <div className="text-sm font-medium text-white">
                                {current_window?.name || 'No active window'}
                            </div>
                        </div>
                    </div>
                    <div className={cn(
                        'text-xs px-2 py-1 rounded',
                        glycogen_status.status === 'full' || glycogen_status.status === 'supercompensated'
                            ? 'bg-green-500/20 text-green-400'
                            : glycogen_status.status === 'moderate'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-red-500/20 text-red-400'
                    )}>
                        {glycogen_status.muscle_glycogen_percent}% glycogen
                    </div>
                </div>
            </GlassCard>
        );
    }

    return (
        <GlassCard className={cn('p-6', className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-orange-500/20">
                        <Utensils className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Fuel Timeline</h3>
                        <p className="text-xs text-muted-foreground">Session-synced nutrition</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-muted-foreground">Strategy</div>
                    <div className="text-sm font-medium text-white capitalize">
                        {current_strategy.strategy.replace('_', ' ')}
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="mb-6">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Today's Windows</div>
                <TimelineView windows={today_plan.fuel_windows} currentTime={currentMinutes} />
                <div className="flex justify-between mt-1 text-[9px] text-muted-foreground">
                    <span>🟡 Pre-session</span>
                    <span>🟠 During</span>
                    <span>🟢 Recovery</span>
                </div>
            </div>

            {/* Current/Next Window */}
            <div className="mb-6">
                <CurrentWindowCard window={current_window} nextWindow={next_window} />
            </div>

            {/* Immediate Action */}
            {immediate_action && (
                <div className="p-3 bg-orange-500/10 rounded-lg border-l-2 border-orange-500 mb-6">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-400" />
                        <span className="text-sm text-white">{immediate_action}</span>
                    </div>
                </div>
            )}

            {/* Three-column stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Glycogen */}
                <div className="p-3 bg-white/5 rounded-lg">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Glycogen</div>
                    <GlycogenGauge
                        muscle={glycogen_status.muscle_glycogen_percent}
                        liver={glycogen_status.liver_glycogen_percent}
                    />
                    {glycogen_status.status !== 'full' && glycogen_status.status !== 'supercompensated' && (
                        <div className="mt-2 text-[10px] text-orange-400">
                            Need {glycogen_status.carb_need_grams}g carbs to refill
                        </div>
                    )}
                </div>

                {/* Protein */}
                <div className="p-3 bg-white/5 rounded-lg">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Protein</div>
                    <ProteinDistribution
                        meals={protein_distribution.meals}
                        target={protein_distribution.daily_target_grams}
                        consumed={protein_distribution.total_consumed_grams}
                    />
                </div>

                {/* Hydration */}
                <div className="p-3 bg-white/5 rounded-lg">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Hydration</div>
                    <HydrationStatus
                        consumed={hydration_status.fluid_consumed_ml}
                        target={hydration_status.fluid_target_ml}
                        status={hydration_status.status}
                    />
                    <div className="mt-2 text-[10px] text-muted-foreground">
                        {hydration_status.recommendation}
                    </div>
                </div>
            </div>

            {/* Macro Progress */}
            <details>
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-white transition-colors">
                    View macro targets ({today_plan.calorie_target} kcal target)
                </summary>
                <div className="mt-3 grid grid-cols-3 gap-3">
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                        <div className="text-lg font-bold text-orange-400">{today_plan.carb_target_grams}g</div>
                        <div className="text-[10px] text-muted-foreground">Carbs</div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                        <div className="text-lg font-bold text-red-400">{today_plan.protein_target_grams}g</div>
                        <div className="text-[10px] text-muted-foreground">Protein</div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                        <div className="text-lg font-bold text-yellow-400">{today_plan.fat_target_grams}g</div>
                        <div className="text-[10px] text-muted-foreground">Fat</div>
                    </div>
                </div>
            </details>
        </GlassCard>
    );
};

export default FuelTimelineCard;
