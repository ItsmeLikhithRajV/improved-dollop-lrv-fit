/**
 * Biomarker Dashboard Card - Blood Work Visualization
 * 
 * Features:
 * - Panel overview with scores
 * - Individual marker cards
 * - Trend indicators
 * - Blueprint target comparison
 * - Critical alerts
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Heart, Flame, Shield, Droplets, TestTube,
    TrendingUp, TrendingDown, Minus, AlertTriangle,
    ChevronDown, Target, Calendar, Check, X
} from 'lucide-react';
import { GlassCard, cn } from '../../components/ui';
import { analyzeBiomarkers } from '../../services/BiomarkerEngine';
import { BiomarkerAnalysis, BiomarkerStatus, BiomarkerPanel } from '../../types/biomarkers';

// ============================================================================
// PANEL ICONS
// ============================================================================

const panelIcons: Record<string, React.ElementType> = {
    metabolic: Flame,
    cardiovascular: Heart,
    inflammation: Shield,
    hormones: Activity,
    recovery: Activity,
    nutrition: Droplets
};

// ============================================================================
// STATUS BADGE
// ============================================================================

const StatusBadge: React.FC<{ status: BiomarkerStatus }> = ({ status }) => {
    const config = {
        optimal: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Optimal' },
        normal: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Normal' },
        low: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Low' },
        high: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'High' },
        critical_low: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Critical Low' },
        critical_high: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Critical High' }
    };

    const c = config[status];

    return (
        <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium', c.bg, c.text)}>
            {c.label}
        </span>
    );
};

// ============================================================================
// MARKER CARD
// ============================================================================

const MarkerCard: React.FC<{ analysis: BiomarkerAnalysis }> = ({ analysis }) => {
    const { biomarker, current_value, status, percentile, trend, trend_percentage, previous_value } = analysis;

    const TrendIcon = trend === 'improving' ? TrendingUp :
        trend === 'worsening' ? TrendingDown : Minus;

    // Calculate position on range bar
    const { reference } = biomarker;
    const rangeSpan = reference.high - reference.low;
    const optimalStart = ((reference.optimal_low - reference.low) / rangeSpan) * 100;
    const optimalEnd = ((reference.optimal_high - reference.low) / rangeSpan) * 100;
    const currentPosition = Math.max(0, Math.min(100, percentile));

    return (
        <div className="p-3 bg-white/5 rounded-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div>
                    <div className="text-sm font-medium text-white">{biomarker.short_name}</div>
                    <div className="text-[10px] text-muted-foreground">{biomarker.name}</div>
                </div>
                <StatusBadge status={status} />
            </div>

            {/* Value and Trend */}
            <div className="flex items-end gap-3 mb-3">
                <div className="text-2xl font-bold text-white">
                    {current_value}
                    <span className="text-sm text-muted-foreground ml-1">{biomarker.unit}</span>
                </div>
                {trend !== 'stable' && trend_percentage !== undefined && (
                    <div className={cn(
                        'flex items-center gap-1 text-xs',
                        trend === 'improving' ? 'text-green-400' : 'text-red-400'
                    )}>
                        <TrendIcon className="w-3 h-3" />
                        {Math.abs(trend_percentage).toFixed(1)}%
                    </div>
                )}
            </div>

            {/* Range Bar */}
            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                {/* Optimal zone */}
                <div
                    className="absolute h-full bg-green-500/30"
                    style={{ left: `${optimalStart}%`, width: `${optimalEnd - optimalStart}%` }}
                />

                {/* Current position marker */}
                <motion.div
                    className={cn(
                        'absolute w-3 h-3 rounded-full -top-0.5 transform -translate-x-1/2',
                        status === 'optimal' ? 'bg-green-500' :
                            status === 'normal' ? 'bg-blue-500' :
                                status.includes('critical') ? 'bg-red-500' : 'bg-yellow-500'
                    )}
                    style={{ left: `${currentPosition}%` }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                />
            </div>

            {/* Range labels */}
            <div className="flex justify-between text-[9px] text-muted-foreground">
                <span>{reference.low} {biomarker.unit}</span>
                <span className="text-green-400">
                    Optimal: {reference.optimal_low}-{reference.optimal_high}
                </span>
                <span>{reference.high} {biomarker.unit}</span>
            </div>

            {/* Blueprint target */}
            {biomarker.blueprint_target && (
                <div className="mt-2 flex items-center gap-1 text-[10px] text-purple-400">
                    <Target className="w-3 h-3" />
                    Blueprint target: {biomarker.blueprint_target}
                </div>
            )}

            {/* Previous value comparison */}
            {previous_value !== undefined && (
                <div className="mt-2 text-[10px] text-muted-foreground">
                    Previous: {previous_value} {biomarker.unit}
                </div>
            )}
        </div>
    );
};

// ============================================================================
// PANEL SECTION
// ============================================================================

const PanelSection: React.FC<{
    panel: BiomarkerPanel;
    score: number;
    status: 'optimal' | 'good' | 'needs_attention' | 'critical';
    markers: BiomarkerAnalysis[];
}> = ({ panel, score, status, markers }) => {
    const [expanded, setExpanded] = useState(false);
    const Icon = panelIcons[panel.id] || TestTube;

    const statusColors = {
        optimal: 'text-green-400',
        good: 'text-blue-400',
        needs_attention: 'text-yellow-400',
        critical: 'text-red-400'
    };

    return (
        <div className="border border-white/10 rounded-lg overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <Icon className={cn('w-5 h-5', statusColors[status])} />
                    <div className="text-left">
                        <div className="text-sm font-medium text-white">{panel.name}</div>
                        <div className="text-[10px] text-muted-foreground">{markers.length} markers</div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className={cn('text-lg font-bold', statusColors[status])}>
                        {score}%
                    </div>
                    <ChevronDown className={cn(
                        'w-4 h-4 text-muted-foreground transition-transform',
                        expanded && 'rotate-180'
                    )} />
                </div>
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-3 pt-0 border-t border-white/10">
                            {markers.length === 0 ? (
                                <div className="text-sm text-muted-foreground text-center py-4">
                                    No data available. Add blood test results to see analysis.
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {markers.map((analysis, i) => (
                                        <MarkerCard key={i} analysis={analysis} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface BiomarkerDashboardCardProps {
    className?: string;
    compact?: boolean;
}

export const BiomarkerDashboardCard: React.FC<BiomarkerDashboardCardProps> = ({
    className,
    compact = false
}) => {
    const analysis = useMemo(() => analyzeBiomarkers(), []);

    const {
        last_test_date,
        next_recommended_test,
        panels,
        critical_alerts,
        improvement_priorities,
        overall_score
    } = analysis;

    const getOverallColor = () => {
        if (overall_score >= 85) return 'text-green-400';
        if (overall_score >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    if (compact) {
        return (
            <GlassCard className={cn('p-4', className)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-cyan-500/20">
                            <TestTube className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Biomarkers</div>
                            <div className={cn('text-lg font-bold', getOverallColor())}>
                                {overall_score}%
                            </div>
                        </div>
                    </div>
                    {critical_alerts.length > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 rounded text-red-400 text-xs">
                            <AlertTriangle className="w-3 h-3" />
                            {critical_alerts.length} alert{critical_alerts.length > 1 ? 's' : ''}
                        </div>
                    )}
                </div>
            </GlassCard>
        );
    }

    return (
        <GlassCard className={cn('p-6', className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-cyan-500/20">
                        <TestTube className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Biomarker Dashboard</h3>
                        <p className="text-xs text-muted-foreground">Blood work analysis</p>
                    </div>
                </div>

                <div className="text-right">
                    <div className={cn('text-2xl font-bold', getOverallColor())}>
                        {overall_score}%
                    </div>
                    <div className="text-xs text-muted-foreground">Overall</div>
                </div>
            </div>

            {/* Last Test Info */}
            <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>Last test: {last_test_date}</span>
                <span>•</span>
                <span>Next recommended: {next_recommended_test}</span>
            </div>

            {/* Critical Alerts */}
            {critical_alerts.length > 0 && (
                <div className="mb-4 p-3 bg-red-500/10 rounded-lg border-l-2 border-red-500">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-medium text-red-400">Critical Alerts</span>
                    </div>
                    {critical_alerts.map((alert, i) => (
                        <div key={i} className="text-xs text-white/80 mb-1">
                            <span className="font-medium">{alert.biomarker.short_name}:</span>{' '}
                            {alert.current_value} {alert.biomarker.unit} ({alert.status.replace('_', ' ')})
                        </div>
                    ))}
                </div>
            )}

            {/* Panel Breakdown */}
            <div className="space-y-3 mb-6">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    Panel Breakdown
                </div>
                {panels.map((p, i) => (
                    <PanelSection
                        key={i}
                        panel={p.panel}
                        score={p.score}
                        status={p.status}
                        markers={p.markers}
                    />
                ))}
            </div>

            {/* Improvement Priorities */}
            {improvement_priorities.length > 0 && (
                <div className="mb-4">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                        Top Priorities for Improvement
                    </div>
                    <div className="space-y-2">
                        {improvement_priorities.slice(0, 3).map((priority, i) => (
                            <div key={i} className="p-3 bg-white/5 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-white">
                                        {priority.biomarker.short_name}
                                    </span>
                                    <StatusBadge status={priority.current_status} />
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    {priority.recommendations.slice(0, 2).join(' • ')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add Results Button */}
            <button className="w-full py-3 border border-white/20 rounded-lg text-sm text-white/70 hover:bg-white/5 transition-colors">
                + Add Blood Test Results
            </button>

            {/* Blueprint Note */}
            <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border-l-2 border-purple-500">
                <div className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-white/70">
                        Optimal ranges shown are based on research for longevity and performance.
                        Some markers include Bryan Johnson's Blueprint protocol targets.
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};

export default BiomarkerDashboardCard;
