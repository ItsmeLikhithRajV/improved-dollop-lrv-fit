/**
 * Circadian Clock Card - Visual Chronobiology Display
 * 
 * Features:
 * - 24-hour clock visualization
 * - Body temperature curve overlay
 * - Optimal training windows
 * - Hormone timing indicators
 * - Current phase highlighting
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Sun, Moon, Activity, Brain, Dumbbell, Coffee,
    Eye, Utensils, BedDouble, AlertCircle, Clock
} from 'lucide-react';
import { GlassCard, cn } from '../../components/ui';
import { analyzeCircadian } from '../../services/CircadianEngine';
import { scoreToStatus, getStatusTextColor } from '../../ui/shared/statusUtils';
import { ConnectWearableCard } from '../../ui/shared/ConnectWearableCard';

// ============================================================================
// 24-HOUR CLOCK VISUALIZATION
// ============================================================================

const CircadianClock: React.FC<{
    currentHour: number;
    currentMinute: number;
    bodyTempCurve: { hour: number; temp_celsius: number }[];
    optimalTrainingStart: number;
    optimalTrainingEnd: number;
    wakeTime: number;
    sleepTime: number;
}> = ({ currentHour, currentMinute, bodyTempCurve, optimalTrainingStart, optimalTrainingEnd, wakeTime, sleepTime }) => {
    const size = 220;
    const center = size / 2;
    const radius = (size - 40) / 2;

    // Convert hour to angle (0 = top, clockwise)
    const hourToAngle = (hour: number) => ((hour / 24) * 360 - 90) * (Math.PI / 180);

    // Current time position
    const currentAngle = hourToAngle(currentHour + currentMinute / 60);
    const currentX = center + radius * 0.7 * Math.cos(currentAngle);
    const currentY = center + radius * 0.7 * Math.sin(currentAngle);

    // Body temperature path (normalized to radius)
    const tempMin = Math.min(...bodyTempCurve.map(t => t.temp_celsius));
    const tempMax = Math.max(...bodyTempCurve.map(t => t.temp_celsius));
    const tempRange = tempMax - tempMin || 1;

    const tempPath = bodyTempCurve.map((point, i) => {
        const angle = hourToAngle(point.hour);
        const normalizedTemp = (point.temp_celsius - tempMin) / tempRange;
        const r = radius * 0.4 + normalizedTemp * radius * 0.35;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ') + ' Z';

    // Optimal training arc
    const trainingStartAngle = hourToAngle(optimalTrainingStart);
    const trainingEndAngle = hourToAngle(optimalTrainingEnd);

    const trainingArcStart = {
        x: center + radius * Math.cos(trainingStartAngle),
        y: center + radius * Math.sin(trainingStartAngle)
    };
    const trainingArcEnd = {
        x: center + radius * Math.cos(trainingEndAngle),
        y: center + radius * Math.sin(trainingEndAngle)
    };

    // Sleep arc
    const sleepStartAngle = hourToAngle(sleepTime);
    const sleepEndAngle = hourToAngle(wakeTime);

    return (
        <svg width={size} height={size}>
            {/* Background circle */}
            <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="white"
                strokeOpacity={0.1}
                strokeWidth={2}
            />

            {/* Hour markers */}
            {Array.from({ length: 24 }).map((_, i) => {
                const angle = hourToAngle(i);
                const isMainHour = i % 6 === 0;
                const innerR = radius - (isMainHour ? 12 : 6);
                const x1 = center + innerR * Math.cos(angle);
                const y1 = center + innerR * Math.sin(angle);
                const x2 = center + radius * Math.cos(angle);
                const y2 = center + radius * Math.sin(angle);

                return (
                    <g key={i}>
                        <line
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="white"
                            strokeOpacity={isMainHour ? 0.5 : 0.2}
                            strokeWidth={isMainHour ? 2 : 1}
                        />
                        {isMainHour && (
                            <text
                                x={center + (radius - 22) * Math.cos(angle)}
                                y={center + (radius - 22) * Math.sin(angle)}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-[10px] fill-white/60"
                            >
                                {i === 0 ? '00' : i}
                            </text>
                        )}
                    </g>
                );
            })}

            {/* Sleep zone arc */}
            <path
                d={`M ${center + radius * Math.cos(sleepStartAngle)} ${center + radius * Math.sin(sleepStartAngle)}
            A ${radius} ${radius} 0 ${sleepTime > wakeTime ? 0 : 1} 1 
            ${center + radius * Math.cos(sleepEndAngle)} ${center + radius * Math.sin(sleepEndAngle)}`}
                fill="none"
                stroke="hsl(270, 70%, 50%)"
                strokeWidth={8}
                strokeOpacity={0.3}
                strokeLinecap="round"
            />

            {/* Optimal training arc */}
            <path
                d={`M ${trainingArcStart.x} ${trainingArcStart.y}
            A ${radius} ${radius} 0 0 1 ${trainingArcEnd.x} ${trainingArcEnd.y}`}
                fill="none"
                stroke="hsl(120, 70%, 50%)"
                strokeWidth={8}
                strokeOpacity={0.4}
                strokeLinecap="round"
            />

            {/* Body temperature curve */}
            <path
                d={tempPath}
                fill="url(#tempGradient)"
                fillOpacity={0.3}
                stroke="hsl(30, 80%, 50%)"
                strokeWidth={2}
                strokeOpacity={0.6}
            />

            {/* Gradient definition */}
            <defs>
                <radialGradient id="tempGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="hsl(30, 80%, 50%)" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="hsl(30, 80%, 50%)" stopOpacity={0.4} />
                </radialGradient>
            </defs>

            {/* Current time hand */}
            <motion.line
                x1={center}
                y1={center}
                x2={currentX}
                y2={currentY}
                stroke="white"
                strokeWidth={3}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
            />

            {/* Center dot */}
            <circle cx={center} cy={center} r={6} fill="white" />

            {/* Current time indicator */}
            <circle
                cx={currentX}
                cy={currentY}
                r={8}
                fill="white"
                stroke="hsl(200, 70%, 50%)"
                strokeWidth={2}
            />

            {/* Icons at key positions */}
            {/* Sun at noon */}
            <g transform={`translate(${center + radius * 0.85 * Math.cos(hourToAngle(12)) - 8}, ${center + radius * 0.85 * Math.sin(hourToAngle(12)) - 8})`}>
                <Sun className="w-4 h-4 text-yellow-400" />
            </g>

            {/* Moon at midnight */}
            <g transform={`translate(${center + radius * 0.85 * Math.cos(hourToAngle(0)) - 8}, ${center + radius * 0.85 * Math.sin(hourToAngle(0)) - 8})`}>
                <Moon className="w-4 h-4 text-indigo-400" />
            </g>
        </svg>
    );
};

// ============================================================================
// PHASE INDICATOR
// ============================================================================

const PhaseIndicator: React.FC<{ phase: string; description: string; performance: number }> = ({
    phase,
    description,
    performance
}) => {
    const phaseLabels: Record<string, { icon: React.ElementType; color: string }> = {
        'night_trough': { icon: Moon, color: 'text-indigo-400' },
        'dawn_rising': { icon: Sun, color: 'text-orange-400' },
        'morning_alert': { icon: Coffee, color: 'text-yellow-400' },
        'late_morning': { icon: Brain, color: 'text-green-400' },
        'post_lunch_dip': { icon: Utensils, color: 'text-red-400' },
        'afternoon_rising': { icon: Activity, color: 'text-blue-400' },
        'evening_peak': { icon: Dumbbell, color: 'text-green-400' },
        'dusk_declining': { icon: Eye, color: 'text-purple-400' },
        'night_onset': { icon: Moon, color: 'text-indigo-400' },
        'early_sleep': { icon: BedDouble, color: 'text-indigo-400' }
    };

    const config = phaseLabels[phase] || { icon: Clock, color: 'text-white' };
    const Icon = config.icon;

    return (
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <Icon className={cn('w-5 h-5', config.color)} />
            <div className="flex-1">
                <div className="text-sm font-medium text-white capitalize">
                    {phase.replace(/_/g, ' ')}
                </div>
                <div className="text-xs text-muted-foreground">{description}</div>
            </div>
            <div className="text-right">
                <div className={cn(
                    'text-lg font-bold',
                    getStatusTextColor(scoreToStatus(performance))
                )}>
                    {performance}%
                </div>
                <div className="text-[10px] text-muted-foreground">Performance</div>
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface CircadianClockCardProps {
    className?: string;
    compact?: boolean;
}

export const CircadianClockCard: React.FC<CircadianClockCardProps> = ({
    className,
    compact = false
}) => {
    const analysis = useMemo(() => analyzeCircadian(), []);

    // Show connect wearable card if no real data
    if (!analysis) {
        return (
            <ConnectWearableCard
                domain="longevity"
                className={className}
                compact={compact}
            />
        );
    }

    const {
        chronotype,
        current_phase,
        body_temp_curve,
        optimal_windows_today,
        best_training_time,
        light_tracking,
        recommended_sleep_time,
        recommended_wake_time,
        circadian_alignment_score
    } = analysis;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Find optimal training window
    const strengthWindow = optimal_windows_today.find(w => w.type === 'strength_power');
    const optimalTrainingStart = strengthWindow ? parseInt(strengthWindow.optimal_start.split(':')[0]) : 16;
    const optimalTrainingEnd = strengthWindow ? parseInt(strengthWindow.optimal_end.split(':')[0]) : 19;

    // Wake/sleep times
    const wakeHour = parseInt(recommended_wake_time.split(':')[0]);
    const sleepHour = parseInt(recommended_sleep_time.split(':')[0]);

    if (compact) {
        return (
            <GlassCard className={cn('p-4', className)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/20">
                            <Clock className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Circadian Phase</div>
                            <div className="text-sm font-medium text-white capitalize">
                                {current_phase.phase.replace(/_/g, ' ')}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-bold text-white">
                            {current_phase.physical_performance}%
                        </div>
                        <div className="text-[10px] text-muted-foreground">Performance</div>
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
                    <div className="p-3 rounded-xl bg-purple-500/20">
                        <Clock className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Circadian Rhythm</h3>
                        <p className="text-xs text-muted-foreground capitalize">{chronotype.type.replace(/_/g, ' ')}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className={cn(
                        'text-xl font-bold',
                        getStatusTextColor(scoreToStatus(circadian_alignment_score))
                    )}>
                        {circadian_alignment_score}%
                    </div>
                    <div className="text-xs text-muted-foreground">Alignment</div>
                </div>
            </div>

            {/* Clock Display */}
            <div className="flex justify-center mb-6">
                <CircadianClock
                    currentHour={currentHour}
                    currentMinute={currentMinute}
                    bodyTempCurve={body_temp_curve.hourly_temps}
                    optimalTrainingStart={optimalTrainingStart}
                    optimalTrainingEnd={optimalTrainingEnd}
                    wakeTime={wakeHour}
                    sleepTime={sleepHour}
                />
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-4 mb-6 text-[10px]">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-1 bg-green-500/60 rounded" />
                    <span className="text-muted-foreground">Training</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-1 bg-purple-500/60 rounded" />
                    <span className="text-muted-foreground">Sleep</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-1 bg-orange-500/60 rounded" />
                    <span className="text-muted-foreground">Body Temp</span>
                </div>
            </div>

            {/* Current Phase */}
            <PhaseIndicator
                phase={current_phase.phase}
                description={current_phase.phase_description}
                performance={current_phase.physical_performance}
            />

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-3 bg-white/5 rounded-lg text-center">
                    <div className="text-xs text-muted-foreground">Body Temp</div>
                    <div className="text-lg font-bold text-orange-400">
                        {current_phase.estimated_core_temp.toFixed(1)}°C
                    </div>
                    <div className="text-[10px] text-muted-foreground capitalize">{current_phase.temp_trend}</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg text-center">
                    <div className="text-xs text-muted-foreground">Best Training</div>
                    <div className="text-lg font-bold text-green-400">{best_training_time}</div>
                    <div className="text-[10px] text-muted-foreground">Peak performance</div>
                </div>
            </div>

            {/* Light Exposure */}
            <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border-l-2 border-yellow-500">
                <div className="flex items-center gap-2 mb-1">
                    <Sun className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-white">Light Exposure</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-white/70">
                        Morning: {light_tracking.morning_light_achieved ? '✅' : '❌'} {light_tracking.morning_light_duration} min
                    </span>
                    <span className="text-white/70">
                        Score: {light_tracking.light_hygiene_score}%
                    </span>
                </div>
                {light_tracking.recommendations.length > 0 && (
                    <div className="mt-2 text-[10px] text-yellow-400">
                        {light_tracking.recommendations[0]}
                    </div>
                )}
            </div>

            {/* Schedule */}
            <details className="mt-4">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-white transition-colors">
                    View recommended schedule
                </summary>
                <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-xs p-2 bg-white/5 rounded">
                        <span className="text-muted-foreground">Wake</span>
                        <span className="text-white">{recommended_wake_time}</span>
                    </div>
                    <div className="flex justify-between text-xs p-2 bg-white/5 rounded">
                        <span className="text-muted-foreground">Training</span>
                        <span className="text-white">{best_training_time}</span>
                    </div>
                    <div className="flex justify-between text-xs p-2 bg-white/5 rounded">
                        <span className="text-muted-foreground">Bedtime</span>
                        <span className="text-white">{recommended_sleep_time}</span>
                    </div>
                </div>
            </details>
        </GlassCard>
    );
};

export default CircadianClockCard;
