/**
 * Sleep Architecture Card - Research-Backed Sleep Visualization
 * 
 * Features:
 * - Sleep stage breakdown with targets
 * - Radial chart for stage percentages
 * - Sleep debt tracking
 * - Quality scores for physical/cognitive recovery
 * - Trend analysis
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Moon, Sun, TrendingUp, TrendingDown, Minus,
    Brain, Dumbbell, AlertCircle, Clock, Target, Zap
} from 'lucide-react';
import { GlassCard, cn } from '../../components/ui';
import { analyzeSleep } from '../../services/SleepArchitectureEngine';
import { SLEEP_STAGE_TARGETS } from '../../types/sleep-architecture';
import { scoreToStatus, getStatusLabel, getStatusTextColor } from '../../ui/shared/statusUtils';
import { ConnectWearableCard } from '../../ui/shared/ConnectWearableCard';

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const StageBar = ({
    label,
    value,
    target,
    color,
    icon: Icon
}: {
    label: string;
    value: number;
    target: number;
    color: string;
    icon: React.ElementType;
}) => {
    const percentage = Math.min(100, (value / target) * 100);
    const isGood = value >= target * 0.9;

    return (
        <div className="relative">
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                    <Icon className="w-3 h-3" style={{ color }} />
                    <span className="text-xs text-white/80">{label}</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                    <span className={isGood ? 'text-green-400' : 'text-yellow-400'}>
                        {value.toFixed(0)}%
                    </span>
                    <span className="text-muted-foreground">/ {target}%</span>
                </div>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                {/* Target marker */}
                <div
                    className="absolute h-2 w-0.5 bg-white/50 z-10 rounded"
                    style={{ left: `${Math.min(98, target)}%` }}
                />
                <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>
        </div>
    );
};

const SleepDonut = ({ stages }: { stages: any }) => {
    const size = 120;
    const strokeWidth = 20;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // Order: Deep, REM, Light, Awake
    const stageData = [
        { name: 'Deep', pct: stages.deep.percentage, color: 'hsl(270, 70%, 50%)' },
        { name: 'REM', pct: stages.rem.percentage, color: 'hsl(340, 70%, 50%)' },
        { name: 'Light', pct: stages.light.percentage, color: 'hsl(200, 70%, 50%)' },
        { name: 'Awake', pct: stages.awake.percentage, color: 'hsl(0, 0%, 50%)' }
    ];

    let offset = 0;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                {stageData.map((stage, i) => {
                    const dashLength = (stage.pct / 100) * circumference;
                    const dashOffset = offset;
                    offset -= dashLength;

                    return (
                        <circle
                            key={stage.name}
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={stage.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                            strokeDashoffset={dashOffset}
                            strokeLinecap="butt"
                        />
                    );
                })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <Moon className="w-6 h-6 text-indigo-400" />
            </div>
        </div>
    );
};

const TrendBadge = ({ trend, label }: { trend: 'improving' | 'stable' | 'declining'; label: string }) => {
    const config = {
        improving: { icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
        stable: { icon: Minus, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
        declining: { icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-500/10' }
    };

    const { icon: Icon, color, bg } = config[trend];

    return (
        <div className={cn('flex items-center gap-1 px-2 py-1 rounded text-xs', bg, color)}>
            <Icon className="w-3 h-3" />
            <span>{label}</span>
        </div>
    );
};

const RecoveryMeter = ({
    label,
    value,
    icon: Icon,
    color
}: {
    label: string;
    value: number;
    icon: React.ElementType;
    color: string;
}) => {
    // Use scientific status classification
    const status = scoreToStatus(value);
    const statusText = getStatusLabel(status);
    const statusColor = getStatusTextColor(status);

    return (
        <div className="p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color }} />
                <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <div className="flex items-end justify-between">
                <div className="text-2xl font-bold text-white">{value.toFixed(0)}</div>
                <span className={cn('text-xs', statusColor)}>{statusText}</span>
            </div>
            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>
        </div>
    );
};

const DebtIndicator = ({ debt, trend }: { debt: number; trend: 'improving' | 'stable' | 'worsening' }) => {
    const getColor = () => {
        if (debt <= 0) return 'text-green-400';
        if (debt <= 3) return 'text-blue-400';
        if (debt <= 5) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getMessage = () => {
        if (debt <= 0) return 'No sleep debt';
        if (debt <= 3) return 'Minor debt';
        if (debt <= 5) return 'Moderate debt';
        return 'Significant debt';
    };

    return (
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
                <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    debt <= 0 ? 'bg-green-500/20' :
                        debt <= 3 ? 'bg-blue-500/20' :
                            debt <= 5 ? 'bg-yellow-500/20' : 'bg-red-500/20'
                )}>
                    <Clock className={cn('w-5 h-5', getColor())} />
                </div>
                <div>
                    <div className="text-sm text-white/80">Sleep Debt (7d)</div>
                    <div className="text-xs text-muted-foreground">{getMessage()}</div>
                </div>
            </div>
            <div className="text-right">
                <div className={cn('text-2xl font-bold', getColor())}>
                    {debt > 0 ? '+' : ''}{debt.toFixed(1)}h
                </div>
                <div className="text-xs text-muted-foreground">
                    {trend === 'improving' ? '↓ Recovering' : trend === 'worsening' ? '↑ Growing' : '→ Stable'}
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface SleepArchitectureCardProps {
    className?: string;
    compact?: boolean;
}

export const SleepArchitectureCard: React.FC<SleepArchitectureCardProps> = ({
    className,
    compact = false
}) => {
    const analysis = useMemo(() => analyzeSleep(), []);

    // Show connect wearable card if no real data
    if (!analysis) {
        return (
            <ConnectWearableCard
                domain="sleep"
                className={className}
                compact={compact}
            />
        );
    }

    const {
        current_night,
        debt,
        weekly_average,
        trends,
        recommendations,
        bedtime_recommendation
    } = analysis;

    if (compact) {
        return (
            <GlassCard className={cn('p-4', className)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/20">
                            <Moon className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Last Night</div>
                            <div className="text-xl font-bold text-white">
                                {(current_night.total_sleep_time / 60).toFixed(1)}h
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-1 text-xs">
                            <span className="text-purple-400">{current_night.stages.deep.percentage.toFixed(0)}% Deep</span>
                            <span className="text-muted-foreground">|</span>
                            <span className="text-pink-400">{current_night.stages.rem.percentage.toFixed(0)}% REM</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                            {current_night.sleep_efficiency.toFixed(0)}% efficient
                        </div>
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
                    <div className="p-3 rounded-xl bg-indigo-500/20">
                        <Moon className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Sleep Architecture</h3>
                        <p className="text-xs text-muted-foreground">Last night's breakdown</p>
                    </div>
                </div>
                <TrendBadge trend={trends.quality} label="Quality" />
            </div>

            {/* Main Display */}
            <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Donut Chart */}
                <div className="flex flex-col items-center justify-center">
                    <SleepDonut stages={current_night.stages} />
                    <div className="mt-3 text-center">
                        <div className="text-2xl font-bold text-white">
                            {(current_night.total_sleep_time / 60).toFixed(1)}h
                        </div>
                        <div className="text-xs text-muted-foreground">Total Sleep</div>
                    </div>
                </div>

                {/* Legend & Stats */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(270, 70%, 50%)' }} />
                        <span className="text-white/70">Deep</span>
                        <span className="ml-auto text-white font-medium">
                            {current_night.stages.deep.duration.toFixed(0)}m
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(340, 70%, 50%)' }} />
                        <span className="text-white/70">REM</span>
                        <span className="ml-auto text-white font-medium">
                            {current_night.stages.rem.duration.toFixed(0)}m
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(200, 70%, 50%)' }} />
                        <span className="text-white/70">Light</span>
                        <span className="ml-auto text-white font-medium">
                            {current_night.stages.light.duration.toFixed(0)}m
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(0, 0%, 50%)' }} />
                        <span className="text-white/70">Awake</span>
                        <span className="ml-auto text-white font-medium">
                            {current_night.stages.awake.duration.toFixed(0)}m
                        </span>
                    </div>

                    <div className="pt-2 mt-2 border-t border-white/10">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Efficiency</span>
                            <span className="text-white font-medium">{current_night.sleep_efficiency.toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                            <span className="text-muted-foreground">Latency</span>
                            <span className="text-white font-medium">{current_night.sleep_latency.toFixed(0)}m</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stage Progress Bars */}
            <div className="space-y-4 mb-6">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Stage Analysis</div>
                <StageBar
                    label="Deep Sleep"
                    value={current_night.stages.deep.percentage}
                    target={SLEEP_STAGE_TARGETS.deep.optimal_percentage}
                    color="hsl(270, 70%, 50%)"
                    icon={Dumbbell}
                />
                <StageBar
                    label="REM Sleep"
                    value={current_night.stages.rem.percentage}
                    target={SLEEP_STAGE_TARGETS.rem.optimal_percentage}
                    color="hsl(340, 70%, 50%)"
                    icon={Brain}
                />
            </div>

            {/* Recovery Scores */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <RecoveryMeter
                    label="Physical Recovery"
                    value={current_night.physical_recovery_score}
                    icon={Dumbbell}
                    color="hsl(270, 70%, 50%)"
                />
                <RecoveryMeter
                    label="Cognitive Recovery"
                    value={current_night.cognitive_recovery_score}
                    icon={Brain}
                    color="hsl(340, 70%, 50%)"
                />
            </div>

            {/* Sleep Debt */}
            <DebtIndicator debt={debt.debt_7d} trend={debt.trend} />

            {/* Bedtime Recommendation */}
            <div className="mt-4 p-3 bg-indigo-500/10 rounded-lg border-l-2 border-indigo-500">
                <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-medium text-white">Tonight's Target</span>
                </div>
                <div className="text-xs text-white/70">
                    Aim for bed by <span className="font-semibold text-indigo-400">{bedtime_recommendation}</span> to
                    get {8}h sleep and address any debt.
                </div>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <details className="mt-4">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-white transition-colors">
                        View {recommendations.length} improvement{recommendations.length > 1 ? 's' : ''}
                    </summary>
                    <div className="mt-3 space-y-2">
                        {recommendations.slice(0, 3).map((rec, i) => (
                            <div
                                key={i}
                                className={cn(
                                    'p-3 rounded-lg border-l-2',
                                    rec.priority === 'critical' ? 'bg-red-500/10 border-red-500' :
                                        rec.priority === 'high' ? 'bg-orange-500/10 border-orange-500' :
                                            'bg-blue-500/10 border-blue-500'
                                )}
                            >
                                <div className="text-sm font-medium text-white">{rec.title}</div>
                                <div className="text-xs text-white/70 mt-1">{rec.description}</div>
                                <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                    <Zap className="w-3 h-3" />
                                    {rec.expected_impact}
                                </div>
                            </div>
                        ))}
                    </div>
                </details>
            )}

            {/* Weekly Average */}
            <details className="mt-4">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-white transition-colors">
                    View 7-day averages
                </summary>
                <div className="mt-3 grid grid-cols-3 gap-3">
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                        <div className="text-lg font-bold text-white">{weekly_average.duration.toFixed(1)}h</div>
                        <div className="text-[10px] text-muted-foreground">Avg Duration</div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                        <div className="text-lg font-bold text-white">{weekly_average.deep_percentage.toFixed(0)}%</div>
                        <div className="text-[10px] text-muted-foreground">Avg Deep</div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                        <div className="text-lg font-bold text-white">{weekly_average.efficiency.toFixed(0)}%</div>
                        <div className="text-[10px] text-muted-foreground">Avg Efficiency</div>
                    </div>
                </div>
            </details>
        </GlassCard>
    );
};

export default SleepArchitectureCard;
