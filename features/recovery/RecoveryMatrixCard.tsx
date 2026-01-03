/**
 * Recovery Matrix Card - Multi-System Recovery Visualization
 * 
 * Features:
 * - 6-system radar/hexagon chart
 * - Individual system bars
 * - Overreaching status
 * - Modality recommendations
 * - Training readiness indicator
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, Brain, Dumbbell, Flame, Heart, Shield,
    TrendingUp, TrendingDown, Minus, AlertTriangle,
    Clock, Zap, ThermometerSun, Droplets, Moon
} from 'lucide-react';
import { GlassCard, cn } from '../../components/ui';
import { analyzeRecovery } from '../../services/RecoveryMatrixEngine';
import { RecoverySystem, SystemRecoveryStatus } from '../../types/recovery-matrix';
import { scoreToStatus, getStatusTextColor } from '../../ui/shared/statusUtils';
import { ConnectWearableCard } from '../../ui/shared/ConnectWearableCard';

// ============================================================================
// SYSTEM ICONS
// ============================================================================

const systemIcons: Record<RecoverySystem, React.ElementType> = {
    muscular: Dumbbell,
    neural: Brain,
    hormonal: Activity,
    metabolic: Flame,
    immune: Shield,
    psychological: Heart
};

const modalityIcons: Record<string, React.ElementType> = {
    sleep: Moon,
    cold_therapy: Droplets,
    heat_therapy: ThermometerSun,
    contrast_therapy: ThermometerSun,
    active_recovery: Activity,
    breathing: Activity,
    nap: Moon,
    massage: Activity,
    foam_rolling: Activity,
    meditation: Brain
};

// ============================================================================
// HEXAGON RADAR CHART
// ============================================================================

const HexagonRadar: React.FC<{ systems: SystemRecoveryStatus[] }> = ({ systems }) => {
    const size = 180;
    const center = size / 2;
    const maxRadius = (size / 2) - 20;

    // Calculate points for each system
    const getPoint = (index: number, value: number) => {
        const angle = (index * 60 - 90) * (Math.PI / 180);
        const radius = (value / 100) * maxRadius;
        return {
            x: center + radius * Math.cos(angle),
            y: center + radius * Math.sin(angle)
        };
    };

    // Create polygon points
    const polygonPoints = systems.map((s, i) => {
        const point = getPoint(i, s.score);
        return `${point.x},${point.y}`;
    }).join(' ');

    // Background hexagon levels
    const levels = [25, 50, 75, 100];

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size}>
                {/* Background hexagons */}
                {levels.map((level, levelIdx) => {
                    const levelPoints = systems.map((_, i) => {
                        const point = getPoint(i, level);
                        return `${point.x},${point.y}`;
                    }).join(' ');

                    return (
                        <polygon
                            key={level}
                            points={levelPoints}
                            fill="none"
                            stroke="white"
                            strokeOpacity={0.1}
                            strokeWidth={1}
                        />
                    );
                })}

                {/* Axis lines */}
                {systems.map((_, i) => {
                    const outerPoint = getPoint(i, 100);
                    return (
                        <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={outerPoint.x}
                            y2={outerPoint.y}
                            stroke="white"
                            strokeOpacity={0.1}
                            strokeWidth={1}
                        />
                    );
                })}

                {/* Data polygon */}
                <motion.polygon
                    points={polygonPoints}
                    fill="url(#recoveryGradient)"
                    fillOpacity={0.3}
                    stroke="url(#recoveryGradient)"
                    strokeWidth={2}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                />

                {/* Data points */}
                {systems.map((system, i) => {
                    const point = getPoint(i, system.score);
                    return (
                        <circle
                            key={system.system}
                            cx={point.x}
                            cy={point.y}
                            r={4}
                            fill={system.color}
                        />
                    );
                })}

                {/* Gradient definition */}
                <defs>
                    <linearGradient id="recoveryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(270, 70%, 50%)" />
                        <stop offset="50%" stopColor="hsl(200, 70%, 50%)" />
                        <stop offset="100%" stopColor="hsl(120, 60%, 50%)" />
                    </linearGradient>
                </defs>
            </svg>

            {/* System labels */}
            {systems.map((system, i) => {
                const point = getPoint(i, 115);
                const Icon = systemIcons[system.system];

                return (
                    <div
                        key={system.system}
                        className="absolute flex flex-col items-center"
                        style={{
                            left: point.x,
                            top: point.y,
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        <Icon className="w-4 h-4" style={{ color: system.color }} />
                        <span className="text-[9px] text-muted-foreground capitalize mt-0.5">
                            {system.system.slice(0, 4)}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

// ============================================================================
// SYSTEM BAR
// ============================================================================

const SystemBar: React.FC<{ system: SystemRecoveryStatus }> = ({ system }) => {
    const Icon = systemIcons[system.system];
    const TrendIcon = system.trend === 'improving' ? TrendingUp :
        system.trend === 'declining' ? TrendingDown : Minus;

    // Use scientific status classification
    const statusColor = getStatusTextColor(scoreToStatus(system.score));

    return (
        <div className="group">
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                    <Icon className="w-3 h-3" style={{ color: system.color }} />
                    <span className="text-xs text-white/80 capitalize">{system.system}</span>
                </div>
                <div className="flex items-center gap-2">
                    <TrendIcon className={cn(
                        'w-3 h-3',
                        system.trend === 'improving' ? 'text-green-400' :
                            system.trend === 'declining' ? 'text-red-400' : 'text-yellow-400'
                    )} />
                    <span className={cn('text-xs font-semibold', statusColor)}>
                        {system.score}%
                    </span>
                </div>
            </div>

            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: system.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${system.score}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            {/* Hover details */}
            <div className="hidden group-hover:block mt-1 text-[10px] text-muted-foreground">
                {system.description}
                {system.estimated_full_recovery_hours > 0 && (
                    <span className="ml-2 text-white/50">
                        Est. {system.estimated_full_recovery_hours}h to full
                    </span>
                )}
            </div>
        </div>
    );
};

// ============================================================================
// READINESS BADGE
// ============================================================================

const ReadinessBadge: React.FC<{ readiness: 'ready' | 'modified' | 'rest'; maxIntensity: string }> = ({
    readiness,
    maxIntensity
}) => {
    const config = {
        ready: { color: 'bg-green-500/20 text-green-400 border-green-500/50', label: 'READY' },
        modified: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50', label: 'MODIFIED' },
        rest: { color: 'bg-red-500/20 text-red-400 border-red-500/50', label: 'REST' }
    };

    const { color, label } = config[readiness];

    return (
        <div className={cn('px-3 py-1 rounded-full text-xs font-bold border', color)}>
            {label}
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface RecoveryMatrixCardProps {
    className?: string;
    compact?: boolean;
}

export const RecoveryMatrixCard: React.FC<RecoveryMatrixCardProps> = ({
    className,
    compact = false
}) => {
    const analysis = useMemo(() => analyzeRecovery(), []);

    // Show connect wearable card if no real data
    if (!analysis) {
        return (
            <ConnectWearableCard
                domain="recovery"
                className={className}
                compact={compact}
            />
        );
    }

    const {
        overall_recovery_score,
        overall_status,
        systems,
        weakest_system,
        weakest_system_score,
        overreaching,
        recommended_modalities,
        training_readiness,
        max_intensity_recommended,
        estimated_full_recovery_hours
    } = analysis;

    // Use scientific status classification
    const overallColor = getStatusTextColor(scoreToStatus(overall_recovery_score));

    if (compact) {
        return (
            <GlassCard className={cn('p-4', className)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/20">
                            <Activity className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Recovery</div>
                            <div className={cn('text-xl font-bold', overallColor)}>
                                {overall_recovery_score}%
                            </div>
                        </div>
                    </div>
                    <ReadinessBadge readiness={training_readiness} maxIntensity={max_intensity_recommended} />
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
                        <Activity className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Recovery Matrix</h3>
                        <p className="text-xs text-muted-foreground">Multi-system analysis</p>
                    </div>
                </div>
                <ReadinessBadge readiness={training_readiness} maxIntensity={max_intensity_recommended} />
            </div>

            {/* Main Display: Radar + Score */}
            <div className="flex items-center justify-between mb-6">
                <HexagonRadar systems={systems} />

                <div className="text-center">
                    <div className={cn('text-5xl font-bold', overallColor)}>
                        {overall_recovery_score}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                        Overall
                    </div>
                    <div className={cn(
                        'text-xs mt-2 capitalize',
                        overall_status === 'recovered' ? 'text-green-400' :
                            overall_status === 'recovering' ? 'text-blue-400' :
                                overall_status === 'fatigued' ? 'text-yellow-400' : 'text-red-400'
                    )}>
                        {overall_status}
                    </div>
                </div>
            </div>

            {/* System Bars */}
            <div className="space-y-3 mb-6">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">System Breakdown</div>
                {systems.map(system => (
                    <SystemBar key={system.system} system={system} />
                ))}
            </div>

            {/* Weakest System Alert */}
            <div className="p-3 bg-white/5 rounded-lg mb-4 border-l-2" style={{
                borderColor: systems.find(s => s.system === weakest_system)?.color
            }}>
                <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-white">Focus Area</span>
                </div>
                <p className="text-xs text-white/70">
                    <span className="capitalize font-medium">{weakest_system}</span> recovery at {weakest_system_score}%.
                    {estimated_full_recovery_hours > 0 && ` Estimated ${estimated_full_recovery_hours}h to full recovery.`}
                </p>
            </div>

            {/* Overreaching Status */}
            {overreaching.status !== 'fresh' && overreaching.status !== 'normal' && (
                <div className={cn(
                    'p-3 rounded-lg mb-4 border-l-2',
                    overreaching.status === 'functional_overreaching' ? 'bg-yellow-500/10 border-yellow-500' :
                        'bg-red-500/10 border-red-500'
                )}>
                    <div className="text-sm font-medium text-white capitalize mb-1">
                        {overreaching.status.replace(/_/g, ' ')}
                    </div>
                    <p className="text-xs text-white/70">{overreaching.training_adjustment}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                        Est. recovery: {overreaching.estimated_recovery_days} days
                    </p>
                </div>
            )}

            {/* Training Recommendation */}
            <div className={cn(
                'p-4 rounded-xl mb-4',
                training_readiness === 'ready' ? 'bg-green-500/10' :
                    training_readiness === 'modified' ? 'bg-yellow-500/10' :
                        'bg-red-500/10'
            )}>
                <div className="flex items-center gap-2 mb-2">
                    <Zap className={cn(
                        'w-4 h-4',
                        training_readiness === 'ready' ? 'text-green-400' :
                            training_readiness === 'modified' ? 'text-yellow-400' : 'text-red-400'
                    )} />
                    <span className="text-sm font-semibold text-white">Training Capacity</span>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-lg font-bold text-white capitalize">
                            {max_intensity_recommended === 'none' ? 'Rest Day' : `${max_intensity_recommended} Intensity`}
                        </div>
                        <div className="text-xs text-white/60">
                            {training_readiness === 'ready' ? 'All systems go' :
                                training_readiness === 'modified' ? 'Reduce load or intensity' :
                                    'Recovery priority today'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommended Modalities */}
            {recommended_modalities.length > 0 && (
                <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                        Recommended Actions
                    </div>
                    <div className="space-y-2">
                        {recommended_modalities.slice(0, 3).map((rec, i) => {
                            const Icon = modalityIcons[rec.modality.type] || Activity;
                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        'flex items-center gap-3 p-2 rounded-lg',
                                        rec.priority === 'high' ? 'bg-orange-500/10' : 'bg-white/5'
                                    )}
                                >
                                    <Icon className="w-4 h-4 text-blue-400" />
                                    <div className="flex-1">
                                        <div className="text-xs font-medium text-white">{rec.modality.name}</div>
                                        <div className="text-[10px] text-muted-foreground">{rec.reason}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-white/70">{rec.suggested_duration}m</div>
                                        <div className="text-[10px] text-muted-foreground">{rec.suggested_time}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Evidence Note */}
            <details className="mt-4">
                <summary className="text-[10px] text-muted-foreground cursor-pointer hover:text-white transition-colors">
                    About this analysis
                </summary>
                <p className="mt-2 text-[10px] text-muted-foreground">
                    Recovery is estimated from HRV, sleep, training load, and subjective markers.
                    Each system has different recovery timelines. True recovery assessment requires
                    biomarker data and performance testing.
                </p>
            </details>
        </GlassCard>
    );
};

export default RecoveryMatrixCard;
