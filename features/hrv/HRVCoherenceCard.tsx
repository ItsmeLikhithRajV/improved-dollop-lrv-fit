/**
 * HRV Coherence Card - Research-Backed HRV Visualization
 * 
 * Features:
 * - Current HRV with zone classification
 * - 7/30 day trends with sparkline
 * - Personal baseline comparison
 * - Plain English interpretation
 * - Training recommendation
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Heart, TrendingUp, TrendingDown, Minus,
    Activity, Zap, Moon, AlertTriangle, Info
} from 'lucide-react';
import { GlassCard, cn } from '../../components/ui';
import { analyzeHRV } from '../../experts/recovery/HRVAnalysisEngine';
import { HRVAnalysis, ELITE_REFERENCE_RANGES } from '../../types/hrv';

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const MiniSparkline = ({ data, color }: { data: number[]; color: string }) => {
    if (data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((v - min) / range) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg className="w-full h-8" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
            />
        </svg>
    );
};

const ZoneIndicator = ({ zone, color, label }: { zone: string; color: string; label: string }) => (
    <div className="flex items-center gap-2">
        <div
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ backgroundColor: color }}
        />
        <span className="text-sm font-medium" style={{ color }}>{label}</span>
    </div>
);

const TrendBadge = ({ trend }: { trend: 'improving' | 'stable' | 'declining' }) => {
    const config = {
        improving: { icon: TrendingUp, color: 'text-green-400', label: 'Improving' },
        stable: { icon: Minus, color: 'text-yellow-400', label: 'Stable' },
        declining: { icon: TrendingDown, color: 'text-red-400', label: 'Declining' }
    };

    const { icon: Icon, color, label } = config[trend];

    return (
        <div className={cn('flex items-center gap-1 text-xs', color)}>
            <Icon className="w-3 h-3" />
            <span>{label}</span>
        </div>
    );
};

const MetricRow = ({
    label,
    value,
    unit,
    baseline,
    status
}: {
    label: string;
    value: number;
    unit: string;
    baseline?: number;
    status?: 'good' | 'neutral' | 'warning';
}) => {
    const statusColors = {
        good: 'text-green-400',
        neutral: 'text-blue-400',
        warning: 'text-yellow-400'
    };

    const deviation = baseline ? ((value - baseline) / baseline * 100).toFixed(0) : null;

    return (
        <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-b-0">
            <span className="text-sm text-muted-foreground">{label}</span>
            <div className="flex items-center gap-2">
                <span className={cn('font-semibold', status ? statusColors[status] : 'text-white')}>
                    {value.toFixed(1)}{unit}
                </span>
                {deviation && (
                    <span className={cn(
                        'text-xs',
                        Number(deviation) >= 0 ? 'text-green-400' : 'text-red-400'
                    )}>
                        {Number(deviation) >= 0 ? '+' : ''}{deviation}%
                    </span>
                )}
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface HRVCoherenceCardProps {
    className?: string;
    compact?: boolean;
}

export const HRVCoherenceCard: React.FC<HRVCoherenceCardProps> = ({
    className,
    compact = false
}) => {
    const analysis = useMemo(() => analyzeHRV(), []);

    const {
        current,
        baseline,
        zone,
        zone_info,
        trend_7d,
        recovery_readiness,
        training_recommendation,
        autonomic_balance,
        deviation_percentage,
        history_7d,
        patterns
    } = analysis;

    // Prepare sparkline data
    const sparklineData = history_7d.map(h => h.rmssd);

    // Get interpretation text
    const getInterpretation = (): string => {
        if (zone === 'optimal' || zone === 'good') {
            return 'Your nervous system is well-recovered. Full training capacity available.';
        } else if (zone === 'moderate') {
            return 'Slightly below baseline. Monitor how you feel during training.';
        } else if (zone === 'compromised') {
            return 'Recovery is incomplete. Consider reducing intensity or adding recovery protocols.';
        } else {
            return 'Your body needs rest. Prioritize sleep, nutrition, and stress management.';
        }
    };

    // Get autonomic balance description
    const getBalanceDescription = (): string => {
        switch (autonomic_balance) {
            case 'parasympathetic_dominant':
                return 'Rest & Digest mode';
            case 'sympathetic_dominant':
                return 'Fight or Flight mode';
            default:
                return 'Balanced';
        }
    };

    if (compact) {
        return (
            <GlassCard className={cn('p-4', className)}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-red-500/20">
                            <Heart className="w-4 h-4 text-red-400" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">HRV (rMSSD)</div>
                            <div className="text-xl font-bold" style={{ color: zone_info.color }}>
                                {current.rmssd.toFixed(0)}ms
                            </div>
                        </div>
                    </div>
                    <ZoneIndicator zone={zone} color={zone_info.color} label={zone_info.label} />
                </div>
                <MiniSparkline data={sparklineData} color={zone_info.color} />
            </GlassCard>
        );
    }

    return (
        <GlassCard className={cn('p-6', className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-red-500/20">
                        <Heart className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">HRV Coherence</h3>
                        <p className="text-xs text-muted-foreground">Heart Rate Variability Analysis</p>
                    </div>
                </div>
                <TrendBadge trend={trend_7d} />
            </div>

            {/* Main HRV Display */}
            <div className="flex items-center gap-6 mb-6">
                {/* Current Value */}
                <div className="flex-shrink-0">
                    <motion.div
                        className="relative w-28 h-28 rounded-full flex items-center justify-center"
                        style={{
                            background: `conic-gradient(${zone_info.color} ${recovery_readiness}%, transparent ${recovery_readiness}%)`,
                            padding: '4px'
                        }}
                    >
                        <div className="w-full h-full rounded-full bg-background flex flex-col items-center justify-center">
                            <div className="text-3xl font-bold" style={{ color: zone_info.color }}>
                                {current.rmssd.toFixed(0)}
                            </div>
                            <div className="text-xs text-muted-foreground">ms</div>
                        </div>
                    </motion.div>
                </div>

                {/* Stats */}
                <div className="flex-1 space-y-1">
                    <ZoneIndicator zone={zone} color={zone_info.color} label={zone_info.label} />

                    <div className="text-sm text-white/70 mt-2">
                        <span className={cn(
                            deviation_percentage >= 0 ? 'text-green-400' : 'text-red-400'
                        )}>
                            {deviation_percentage >= 0 ? '+' : ''}{deviation_percentage.toFixed(0)}%
                        </span>
                        {' '}vs 7-day baseline ({baseline.rmssd_7d_avg.toFixed(0)}ms)
                    </div>

                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Activity className="w-3 h-3" />
                        {getBalanceDescription()}
                    </div>
                </div>
            </div>

            {/* 7-Day Trend Chart */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">7-Day Trend</span>
                    <span className="text-xs text-muted-foreground">
                        Range: {Math.min(...sparklineData).toFixed(0)} - {Math.max(...sparklineData).toFixed(0)}ms
                    </span>
                </div>
                <div className="h-12 bg-white/5 rounded-lg p-2">
                    <MiniSparkline data={sparklineData} color={zone_info.color} />
                </div>
            </div>

            {/* Baseline Comparison */}
            <div className="mb-6">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Baseline Comparison</div>
                <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                    {/* Baseline marker */}
                    <div
                        className="absolute top-0 h-full w-0.5 bg-white/50"
                        style={{
                            left: `${Math.min(100, (baseline.rmssd_7d_avg / ELITE_REFERENCE_RANGES.rmssd.high) * 100)}%`
                        }}
                    />
                    {/* Current position */}
                    <motion.div
                        className="absolute top-0 h-full rounded-full"
                        style={{ backgroundColor: zone_info.color }}
                        initial={{ width: 0 }}
                        animate={{
                            width: `${Math.min(100, (current.rmssd / ELITE_REFERENCE_RANGES.rmssd.high) * 100)}%`
                        }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                    <span>Low ({ELITE_REFERENCE_RANGES.rmssd.low})</span>
                    <span>Elite Range</span>
                    <span>High ({ELITE_REFERENCE_RANGES.rmssd.high})</span>
                </div>
            </div>

            {/* Interpretation */}
            <div className="p-4 bg-white/5 rounded-xl mb-4 border-l-2" style={{ borderColor: zone_info.color }}>
                <p className="text-sm text-white/90">{getInterpretation()}</p>
            </div>

            {/* Patterns */}
            {patterns.length > 0 && (
                <div className="space-y-2 mb-4">
                    {patterns.slice(0, 2).map((pattern, i) => (
                        <div
                            key={i}
                            className="flex items-start gap-2 text-xs p-2 bg-white/5 rounded-lg"
                        >
                            <Info className="w-3 h-3 mt-0.5 text-blue-400 flex-shrink-0" />
                            <div>
                                <div className="text-white/80">{pattern.description}</div>
                                {pattern.recommendation && (
                                    <div className="text-muted-foreground mt-1">{pattern.recommendation}</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Training Recommendation */}
            <div className="flex items-center justify-between p-3 glass rounded-lg">
                <div className="flex items-center gap-2">
                    <Zap className={cn(
                        'w-4 h-4',
                        training_recommendation === 'full' ? 'text-green-400' :
                            training_recommendation === 'moderate' ? 'text-yellow-400' :
                                training_recommendation === 'light' ? 'text-orange-400' : 'text-red-400'
                    )} />
                    <span className="text-sm text-white/80">Training Capacity</span>
                </div>
                <span className={cn(
                    'text-sm font-semibold uppercase',
                    training_recommendation === 'full' ? 'text-green-400' :
                        training_recommendation === 'moderate' ? 'text-yellow-400' :
                            training_recommendation === 'light' ? 'text-orange-400' : 'text-red-400'
                )}>
                    {training_recommendation.replace('_', ' ')}
                </span>
            </div>

            {/* Detailed Metrics (Expandable) */}
            <details className="mt-4">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-white transition-colors">
                    View detailed metrics
                </summary>
                <div className="mt-3 pt-3 border-t border-white/5">
                    <MetricRow
                        label="rMSSD"
                        value={current.rmssd}
                        unit="ms"
                        baseline={baseline.rmssd_7d_avg}
                        status={current.rmssd >= baseline.rmssd_7d_avg ? 'good' : 'warning'}
                    />
                    <MetricRow
                        label="SDNN"
                        value={current.sdnn}
                        unit="ms"
                        baseline={baseline.sdnn_7d_avg}
                        status="neutral"
                    />
                    <MetricRow
                        label="LF/HF Ratio"
                        value={current.lf_hf_ratio}
                        unit=""
                        status={current.lf_hf_ratio > 2.5 ? 'warning' : 'neutral'}
                    />
                    <MetricRow
                        label="Mean HR"
                        value={current.hr_mean}
                        unit="bpm"
                        status={current.hr_mean < 60 ? 'good' : 'neutral'}
                    />
                    <MetricRow
                        label="Recovery Score"
                        value={recovery_readiness}
                        unit="%"
                        status={recovery_readiness >= 70 ? 'good' : recovery_readiness >= 50 ? 'neutral' : 'warning'}
                    />
                </div>
            </details>
        </GlassCard>
    );
};

export default HRVCoherenceCard;
