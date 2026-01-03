/**
 * Insights Panel - Integrated overview of all analysis engines
 * 
 * Displays compact cards for:
 * - HRV Coherence
 * - Load Management
 * - Recovery Matrix
 * - Circadian Phase
 * - Fuel Status
 * - Pattern Discovery
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSentient } from '../../store/SentientContext';
import {
    Activity, Heart, Flame, Brain, Moon, Clock,
    Zap, AlertTriangle, TrendingUp, Sparkles, ChevronRight
} from 'lucide-react';
import { GlassCard, cn } from '../../components/ui';

// Import analysis engines from experts
import { analyzeHRV } from '../../experts/recovery/HRVAnalysisEngine';
import { analyzeRecovery } from '../../experts/recovery/RecoveryMatrixEngine';
import { analyzeCircadian } from '../../experts/longevity/CircadianEngine';
import { analyzeFuel } from '../../experts/nutritionist/FuelWindowEngine';
import { discoverPatterns } from '../../experts/orchestrator/PatternDiscoveryEngine';
import { analyzeLoad, getTrainingReadiness } from '../../services/engines-index';

// ============================================================================
// COMPACT METRIC CARD
// ============================================================================

interface MetricCardProps {
    icon: React.ElementType;
    label: string;
    value: string | number;
    subValue?: string;
    status: 'good' | 'warning' | 'danger' | 'neutral';
    trend?: 'up' | 'down' | 'stable';
    onClick?: () => void;
}

const CompactMetricCard: React.FC<MetricCardProps> = ({
    icon: Icon,
    label,
    value,
    subValue,
    status,
    trend,
    onClick
}) => {
    const statusColors = {
        good: 'text-green-400 bg-green-400/10',
        warning: 'text-yellow-400 bg-yellow-400/10',
        danger: 'text-red-400 bg-red-400/10',
        neutral: 'text-blue-400 bg-blue-400/10'
    };

    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingUp : null;

    return (
        <motion.div
            className="glass rounded-xl p-4 cursor-pointer hover:bg-white/10 transition-colors group"
            whileHover={{ scale: 1.02 }}
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div className={cn('p-2 rounded-lg', statusColors[status])}>
                    <Icon className="w-4 h-4" />
                </div>
                {TrendIcon && (
                    <TrendIcon className={cn(
                        'w-3 h-3',
                        trend === 'up' ? 'text-green-400' : 'text-red-400 rotate-180'
                    )} />
                )}
            </div>

            <div className="mt-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
                <div className="text-xl font-bold text-white mt-0.5">{value}</div>
                {subValue && (
                    <div className="text-[10px] text-white/50 mt-0.5">{subValue}</div>
                )}
            </div>

            <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2 flex items-center gap-1 text-[10px] text-primary">
                View details <ChevronRight className="w-3 h-3" />
            </div>
        </motion.div>
    );
};

// ============================================================================
// READINESS SUMMARY
// ============================================================================

const ReadinessSummary: React.FC<{ readiness: ReturnType<typeof getTrainingReadiness> }> = ({ readiness }) => {
    const statusConfig = {
        ready: { bg: 'bg-green-500/20', border: 'border-green-500', text: 'text-green-400', label: 'READY TO TRAIN' },
        modified: { bg: 'bg-yellow-500/20', border: 'border-yellow-500', text: 'text-yellow-400', label: 'MODIFY TRAINING' },
        rest: { bg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-400', label: 'REST RECOMMENDED' }
    };

    const config = statusConfig[readiness.readiness];

    return (
        <GlassCard className={cn('p-4 border-l-4', config.border, config.bg)}>
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Training Readiness</div>
                    <div className={cn('text-2xl font-bold tracking-tight', config.text)}>
                        {readiness.score}%
                    </div>
                    <div className={cn('text-sm font-semibold uppercase tracking-wider mt-1', config.text)}>
                        {config.label}
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-xs text-muted-foreground mb-1">Max Intensity</div>
                    <div className="text-lg font-bold text-white capitalize">
                        {readiness.max_intensity === 'none' ? 'None' : readiness.max_intensity}
                    </div>
                </div>
            </div>

            {readiness.primary_concern && (
                <div className="mt-3 flex items-center gap-2 text-xs text-yellow-400">
                    <AlertTriangle className="w-3 h-3" />
                    {readiness.primary_concern}
                </div>
            )}

            {/* Signal indicators */}
            <div className="mt-4 grid grid-cols-4 gap-2">
                {Object.entries(readiness.signals).map(([key, signal]) => {
                    // Get score based on signal type
                    const score = 'score' in signal ? signal.score :
                        'performance' in signal ? signal.performance :
                            'acwr' in signal ? (signal.acwr >= 0.8 && signal.acwr <= 1.3 ? 100 : signal.acwr < 1.5 ? 70 : 40) : 50;

                    return (
                        <div key={key} className="text-center">
                            <div className={cn(
                                'text-lg font-bold',
                                score >= 70 ? 'text-green-400' :
                                    score >= 40 ? 'text-yellow-400' : 'text-red-400'
                            )}>
                                {Math.round(score)}
                            </div>
                            <div className="text-[9px] text-muted-foreground uppercase">{key}</div>
                        </div>
                    );
                })}
            </div>
        </GlassCard>
    );
};

// ============================================================================
// MAIN INSIGHTS PANEL
// ============================================================================

interface InsightsPanelProps {
    onNavigate?: (tab: string) => void;
    compact?: boolean;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ onNavigate, compact = false }) => {
    const { state } = useSentient();

    // Run all analyses with error protection - pass state so engines use real/demo data
    const analysis = useMemo(() => {
        try {
            return {
                hrv: analyzeHRV(state),
                load: analyzeLoad(),
                recovery: analyzeRecovery(state),
                circadian: analyzeCircadian(state),
                fuel: analyzeFuel(state),
                patterns: discoverPatterns(state),
                readiness: getTrainingReadiness()
            };
        } catch (e) {
            console.warn('InsightsPanel: One or more analysis engines failed:', e);
            return null;
        }
    }, [state]); // Re-run when state changes (e.g. Demo Mode toggle)

    // If analysis failed, show a fallback UI
    if (!analysis) {
        return (
            <GlassCard className="p-6 text-center">
                <div className="text-muted-foreground text-sm">
                    Insights loading... Connect a wearable for data.
                </div>
            </GlassCard>
        );
    }

    const { hrv, load, recovery, circadian, fuel, patterns, readiness } = analysis;

    // Derive status from each system
    const getHRVStatus = () => {
        if (hrv.zone === 'optimal') return 'good';
        if (hrv.zone === 'good') return 'good';
        if (hrv.zone === 'compromised') return 'warning';
        return 'danger';
    };

    const getLoadStatus = () => {
        if (load.acwr.zone === 'optimal') return 'good';
        if (load.acwr.zone === 'moderate_risk') return 'neutral';
        if (load.acwr.zone === 'undertrained') return 'warning';
        return 'danger';
    };

    const getRecoveryStatus = () => {
        const score = recovery?.overall_recovery_score ?? 0;
        if (score >= 70) return 'good';
        if (score >= 50) return 'warning';
        return 'danger';
    };

    if (compact) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <CompactMetricCard
                    icon={Heart}
                    label="HRV"
                    value={`${Math.round(hrv.current.rmssd)}ms`}
                    subValue={hrv.zone}
                    status={getHRVStatus()}
                    trend={hrv.trend_7d === 'improving' ? 'up' : hrv.trend_7d === 'declining' ? 'down' : 'stable'}
                    onClick={() => onNavigate?.('recovery')}
                />
                <CompactMetricCard
                    icon={Activity}
                    label="ACWR"
                    value={load.acwr.acwr_rolling.toFixed(2)}
                    subValue={load.acwr.zone}
                    status={getLoadStatus()}
                    onClick={() => onNavigate?.('performance')}
                />
                <CompactMetricCard
                    icon={Zap}
                    label="Recovery"
                    value={`${recovery.overall_recovery_score}%`}
                    subValue={recovery.overall_status}
                    status={getRecoveryStatus()}
                    onClick={() => onNavigate?.('recovery')}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Training Readiness Summary */}
            <ReadinessSummary readiness={readiness} />

            {/* Primary Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <CompactMetricCard
                    icon={Heart}
                    label="HRV"
                    value={`${Math.round(hrv.current.rmssd)}ms`}
                    subValue={`${hrv.zone} • ${hrv.trend_7d}`}
                    status={getHRVStatus()}
                    trend={hrv.trend_7d === 'improving' ? 'up' : hrv.trend_7d === 'declining' ? 'down' : 'stable'}
                    onClick={() => onNavigate?.('recovery')}
                />

                <CompactMetricCard
                    icon={Activity}
                    label="Load"
                    value={load.acwr.acwr_rolling.toFixed(2)}
                    subValue={`${load.acwr.zone} zone`}
                    status={getLoadStatus()}
                    onClick={() => onNavigate?.('performance')}
                />

                <CompactMetricCard
                    icon={Zap}
                    label="Recovery"
                    value={`${recovery?.overall_recovery_score ?? 0}%`}
                    subValue={recovery?.weakest_system ? `${recovery.weakest_system} needs attention` : 'No data'}
                    status={getRecoveryStatus()}
                    onClick={() => onNavigate?.('recovery')}
                />

                <CompactMetricCard
                    icon={Clock}
                    label="Circadian"
                    value={`${circadian?.current_phase?.physical_performance ?? 0}%`}
                    subValue={(circadian?.current_phase?.phase ?? 'unknown').replace(/_/g, ' ')}
                    status={(circadian?.current_phase?.physical_performance ?? 0) >= 70 ? 'good' : 'neutral'}
                    onClick={() => onNavigate?.('timeline')}
                />

                <CompactMetricCard
                    icon={Flame}
                    label="Fuel"
                    value={`${fuel.glycogen_status.muscle_glycogen_percent}%`}
                    subValue={fuel.current_window?.name || 'No active window'}
                    status={fuel.glycogen_status.status === 'full' ? 'good' :
                        fuel.glycogen_status.status === 'moderate' ? 'warning' : 'danger'}
                    onClick={() => onNavigate?.('fuel')}
                />

                <CompactMetricCard
                    icon={Sparkles}
                    label="Patterns"
                    value={patterns?.patterns?.length ?? 0}
                    subValue={`${patterns?.new_discoveries?.length ?? 0} new insights`}
                    status={(patterns?.new_discoveries?.length ?? 0) > 0 ? 'good' : 'neutral'}
                    onClick={() => onNavigate?.('performance')}
                />
            </div>

            {/* Active Alerts */}
            {recovery?.overreaching && recovery.overreaching.status !== 'fresh' && recovery.overreaching.status !== 'normal' && (
                <GlassCard className="p-4 bg-yellow-500/10 border-l-4 border-yellow-500">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        <div>
                            <div className="text-sm font-semibold text-yellow-400 capitalize">
                                {recovery.overreaching.status.replace(/_/g, ' ')} Detected
                            </div>
                            <div className="text-xs text-white/70">{recovery.overreaching.training_adjustment}</div>
                        </div>
                    </div>
                </GlassCard>
            )}

            {/* Pattern Highlights */}
            {(patterns?.new_discoveries?.length ?? 0) > 0 && (
                <GlassCard className="p-4 bg-purple-500/10 border-l-4 border-purple-500">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <div className="flex-1">
                            <div className="text-sm font-semibold text-purple-400">
                                New Pattern Discovered
                            </div>
                            <div className="text-xs text-white/70">{patterns?.new_discoveries?.[0]?.title ?? 'Unknown'}</div>
                        </div>
                        <button
                            onClick={() => onNavigate?.('performance')}
                            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                        >
                            View <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                </GlassCard>
            )}
        </div>
    );
};

export default InsightsPanel;
