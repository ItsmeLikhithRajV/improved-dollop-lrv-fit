/**
 * Load Cockpit - ACWR & Injury Prevention Dashboard
 * 
 * Features:
 * - ACWR gauge with zone classification
 * - Gabbett's sweet spot visualization
 * - Injury risk indicator
 * - Load trajectory over time
 * - Training recommendations
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Gauge, TrendingUp, TrendingDown, Minus,
    AlertTriangle, Shield, Activity, Target, Info, Flame
} from 'lucide-react';
import { GlassCard, cn } from '../../components/ui';
import { analyzeLoad } from '../../services/LoadManagementEngine';
import { ACWR_ZONES } from '../../types/load-management';

// ============================================================================
// GAUGE COMPONENT
// ============================================================================

interface ACWRGaugeProps {
    value: number;
    size?: number;
}

const ACWRGauge: React.FC<ACWRGaugeProps> = ({ value, size = 200 }) => {
    // ACWR gauge shows 0 to 2.5 range
    const maxACWR = 2.5;
    const clampedValue = Math.min(maxACWR, Math.max(0, value));
    const percentage = clampedValue / maxACWR;

    // Arc parameters
    const strokeWidth = 20;
    const radius = (size - strokeWidth) / 2;
    const circumference = Math.PI * radius; // Half circle

    // Find current zone
    const currentZone = ACWR_ZONES.find(z => value >= z.min && value < z.max) || ACWR_ZONES[0];

    // Zone positions on gauge (as percentages)
    const zonePositions = ACWR_ZONES.map((z, i) => ({
        ...z,
        startAngle: (z.min / maxACWR) * 180,
        endAngle: (Math.min(z.max, maxACWR) / maxACWR) * 180
    }));

    return (
        <div className="relative" style={{ width: size, height: size / 2 + 40 }}>
            <svg width={size} height={size / 2 + 20} className="overflow-visible">
                {/* Zone arcs */}
                {zonePositions.map((zone, i) => {
                    const startAngle = 180 + zone.startAngle;
                    const endAngle = 180 + zone.endAngle;
                    const startRad = (startAngle * Math.PI) / 180;
                    const endRad = (endAngle * Math.PI) / 180;

                    const x1 = size / 2 + radius * Math.cos(startRad);
                    const y1 = size / 2 + radius * Math.sin(startRad);
                    const x2 = size / 2 + radius * Math.cos(endRad);
                    const y2 = size / 2 + radius * Math.sin(endRad);

                    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

                    return (
                        <path
                            key={zone.zone}
                            d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`}
                            fill="none"
                            stroke={zone.color}
                            strokeWidth={strokeWidth}
                            strokeOpacity={0.3}
                        />
                    );
                })}

                {/* Current value arc */}
                <motion.path
                    d={`M ${size / 2 - radius} ${size / 2} A ${radius} ${radius} 0 0 1 ${size / 2 + radius * Math.cos(Math.PI + percentage * Math.PI)
                        } ${size / 2 + radius * Math.sin(Math.PI + percentage * Math.PI)}`}
                    fill="none"
                    stroke={currentZone.color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                />

                {/* Needle */}
                <motion.g
                    initial={{ rotate: 0 }}
                    animate={{ rotate: percentage * 180 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    style={{ transformOrigin: `${size / 2}px ${size / 2}px` }}
                >
                    <line
                        x1={size / 2}
                        y1={size / 2}
                        x2={size / 2 - radius + 10}
                        y2={size / 2}
                        stroke="white"
                        strokeWidth={3}
                        strokeLinecap="round"
                    />
                    <circle cx={size / 2} cy={size / 2} r={8} fill={currentZone.color} />
                </motion.g>

                {/* Zone labels */}
                <text x={15} y={size / 2 + 15} className="text-[9px] fill-muted-foreground">0</text>
                <text x={size / 2 - 5} y={12} className="text-[9px] fill-muted-foreground">1.25</text>
                <text x={size - 25} y={size / 2 + 15} className="text-[9px] fill-muted-foreground">2.5</text>
            </svg>

            {/* Center value display */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                <div className="text-4xl font-bold" style={{ color: currentZone.color }}>
                    {value.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">ACWR</div>
            </div>
        </div>
    );
};

// ============================================================================
// ZONE BAR COMPONENT
// ============================================================================

const ZoneBar: React.FC<{ acwr: number }> = ({ acwr }) => {
    const maxACWR = 2.5;
    const position = Math.min(100, (acwr / maxACWR) * 100);
    const currentZone = ACWR_ZONES.find(z => acwr >= z.min && acwr < z.max) || ACWR_ZONES[0];

    return (
        <div className="w-full">
            <div className="flex h-3 rounded-full overflow-hidden mb-1">
                {ACWR_ZONES.map((zone, i) => {
                    const width = ((Math.min(zone.max, maxACWR) - zone.min) / maxACWR) * 100;
                    return (
                        <div
                            key={zone.zone}
                            className="h-full"
                            style={{
                                width: `${width}%`,
                                backgroundColor: zone.color,
                                opacity: acwr >= zone.min && acwr < zone.max ? 1 : 0.3
                            }}
                        />
                    );
                })}
            </div>
            {/* Position marker */}
            <div className="relative h-0">
                <motion.div
                    className="absolute -top-4 w-0.5 h-5 bg-white"
                    initial={{ left: 0 }}
                    animate={{ left: `${position}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>
            <div className="flex justify-between mt-2 text-[9px] text-muted-foreground">
                <span>Under</span>
                <span className="text-green-400">Sweet Spot</span>
                <span className="text-red-400">Danger</span>
            </div>
        </div>
    );
};

// ============================================================================
// TRAJECTORY CHART
// ============================================================================

const TrajectoryChart: React.FC<{ data: number[]; currentZone: string }> = ({ data, currentZone }) => {
    if (data.length < 2) return null;

    const min = 0;
    const max = 2.5;
    const range = max - min;

    const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((Math.min(v, max) - min) / range) * 100;
        return `${x},${y}`;
    }).join(' ');

    // Sweet spot zone (0.8 - 1.3)
    const sweetSpotTop = 100 - ((1.3 - min) / range) * 100;
    const sweetSpotBottom = 100 - ((0.8 - min) / range) * 100;

    // Danger zone (>1.5)
    const dangerTop = 100 - ((2.5 - min) / range) * 100;
    const dangerBottom = 100 - ((1.5 - min) / range) * 100;

    return (
        <svg className="w-full h-24" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Sweet spot zone */}
            <rect
                x={0}
                y={sweetSpotTop}
                width={100}
                height={sweetSpotBottom - sweetSpotTop}
                fill="hsl(140, 70%, 50%)"
                fillOpacity={0.15}
            />

            {/* Danger zone */}
            <rect
                x={0}
                y={dangerTop}
                width={100}
                height={dangerBottom - dangerTop}
                fill="hsl(0, 80%, 55%)"
                fillOpacity={0.15}
            />

            {/* 1.0 baseline */}
            <line
                x1={0}
                y1={100 - ((1.0 - min) / range) * 100}
                x2={100}
                y2={100 - ((1.0 - min) / range) * 100}
                stroke="white"
                strokeWidth={0.5}
                strokeOpacity={0.3}
                strokeDasharray="2,2"
            />

            {/* Trajectory line */}
            <polyline
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
            />

            {/* Current point */}
            <circle
                cx={100}
                cy={100 - ((Math.min(data[data.length - 1], max) - min) / range) * 100}
                r={4}
                fill="white"
            />
        </svg>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface LoadCockpitProps {
    className?: string;
    compact?: boolean;
}

export const LoadCockpit: React.FC<LoadCockpitProps> = ({
    className,
    compact = false
}) => {
    const analysis = useMemo(() => analyzeLoad(), []);

    const {
        acwr,
        chronic_profile,
        training_readiness,
        suggested_session_type,
        recommendations,
        injury_risk_level,
        contributing_factors
    } = analysis;

    // Build trajectory data (last 14 days of ACWR estimates)
    const trajectoryData = [
        acwr.acwr_14d_ago,
        (acwr.acwr_14d_ago + acwr.acwr_7d_ago) / 2,
        acwr.acwr_7d_ago,
        (acwr.acwr_7d_ago + acwr.acwr_rolling) / 2,
        acwr.acwr_rolling
    ];

    // Get readiness gradient
    const getReadinessGradient = () => {
        switch (training_readiness) {
            case 'green': return 'from-green-500/20 to-green-500/5';
            case 'amber': return 'from-yellow-500/20 to-yellow-500/5';
            case 'red': return 'from-red-500/20 to-red-500/5';
        }
    };

    if (compact) {
        return (
            <GlassCard className={cn('p-4', className)}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-orange-500/20">
                            <Gauge className="w-4 h-4 text-orange-400" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">ACWR</div>
                            <div className="text-xl font-bold" style={{ color: acwr.zone_info.color }}>
                                {acwr.acwr_rolling.toFixed(2)}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-muted-foreground">{acwr.zone_info.label}</div>
                        <div className={cn(
                            'text-xs',
                            injury_risk_level === 'low' ? 'text-green-400' :
                                injury_risk_level === 'moderate' ? 'text-yellow-400' : 'text-red-400'
                        )}>
                            {acwr.zone_info.injury_risk_multiplier}x risk
                        </div>
                    </div>
                </div>
                <ZoneBar acwr={acwr.acwr_rolling} />
            </GlassCard>
        );
    }

    return (
        <GlassCard className={cn('p-6', className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-orange-500/20">
                        <Gauge className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Load Cockpit</h3>
                        <p className="text-xs text-muted-foreground">Acute:Chronic Workload Ratio</p>
                    </div>
                </div>
                <div className={cn(
                    'px-3 py-1 rounded-full text-xs font-semibold',
                    training_readiness === 'green' ? 'bg-green-500/20 text-green-400' :
                        training_readiness === 'amber' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                )}>
                    {training_readiness.toUpperCase()}
                </div>
            </div>

            {/* Main Gauge */}
            <div className="flex justify-center mb-6">
                <ACWRGauge value={acwr.acwr_rolling} size={220} />
            </div>

            {/* Zone Info */}
            <div
                className="p-4 rounded-xl mb-6 border-l-4"
                style={{
                    backgroundColor: `${acwr.zone_info.color}15`,
                    borderColor: acwr.zone_info.color
                }}
            >
                <div className="flex items-center gap-2 mb-1">
                    {acwr.zone === 'optimal' ? (
                        <Shield className="w-4 h-4" style={{ color: acwr.zone_info.color }} />
                    ) : acwr.zone === 'high_risk' || acwr.zone === 'very_high_risk' ? (
                        <AlertTriangle className="w-4 h-4" style={{ color: acwr.zone_info.color }} />
                    ) : (
                        <Activity className="w-4 h-4" style={{ color: acwr.zone_info.color }} />
                    )}
                    <span className="font-semibold" style={{ color: acwr.zone_info.color }}>
                        {acwr.zone_info.label}
                    </span>
                </div>
                <p className="text-sm text-white/80">{acwr.zone_info.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{acwr.zone_info.recommendation}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-white/5 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Acute Load (7d)</div>
                    <div className="text-lg font-semibold text-white">{acwr.acute_load_7d.toLocaleString()} AU</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Chronic Load (28d)</div>
                    <div className="text-lg font-semibold text-white">{acwr.chronic_load_28d.toLocaleString()} AU</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Injury Risk</div>
                    <div className={cn(
                        'text-lg font-semibold',
                        injury_risk_level === 'low' ? 'text-green-400' :
                            injury_risk_level === 'moderate' ? 'text-yellow-400' :
                                injury_risk_level === 'elevated' ? 'text-orange-400' : 'text-red-400'
                    )}>
                        {acwr.zone_info.injury_risk_multiplier}x baseline
                    </div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Days in Danger Zone</div>
                    <div className={cn(
                        'text-lg font-semibold',
                        acwr.days_above_1_5 === 0 ? 'text-green-400' :
                            acwr.days_above_1_5 <= 3 ? 'text-yellow-400' : 'text-red-400'
                    )}>
                        {acwr.days_above_1_5} / 28d
                    </div>
                </div>
            </div>

            {/* Trajectory */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">14-Day Trajectory</span>
                    <div className="flex items-center gap-1 text-xs">
                        {acwr.trajectory === 'rising' && <TrendingUp className="w-3 h-3 text-red-400" />}
                        {acwr.trajectory === 'falling' && <TrendingDown className="w-3 h-3 text-green-400" />}
                        {acwr.trajectory === 'stable' && <Minus className="w-3 h-3 text-yellow-400" />}
                        <span className="text-muted-foreground capitalize">{acwr.trajectory}</span>
                    </div>
                </div>
                <div className="h-24 bg-white/5 rounded-lg p-2">
                    <TrajectoryChart data={trajectoryData} currentZone={acwr.zone} />
                </div>
                <div className="flex justify-between mt-1 text-[9px] text-muted-foreground">
                    <span>14d ago</span>
                    <span>Today</span>
                </div>
            </div>

            {/* Training Recommendation */}
            <div className={cn(
                'p-4 rounded-xl bg-gradient-to-br',
                getReadinessGradient()
            )}>
                <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-white/80" />
                    <span className="text-sm font-semibold text-white">Today's Recommendation</span>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-lg font-bold text-white capitalize">
                            {suggested_session_type.replace('_', ' ')}
                        </div>
                        <div className="text-xs text-white/60">
                            Target load: {acwr.recommended_load_today.toLocaleString()} - {acwr.max_safe_load_today.toLocaleString()} AU
                        </div>
                    </div>
                    <Flame className={cn(
                        'w-8 h-8',
                        suggested_session_type === 'high_intensity' ? 'text-red-400' :
                            suggested_session_type === 'moderate' ? 'text-orange-400' :
                                suggested_session_type === 'low_intensity' ? 'text-yellow-400' :
                                    suggested_session_type === 'recovery' ? 'text-blue-400' : 'text-gray-400'
                    )} />
                </div>
            </div>

            {/* Contributing Factors */}
            {contributing_factors.length > 0 && (
                <div className="mt-4 space-y-2">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Risk Factors</div>
                    {contributing_factors.map((factor, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-white/70">
                            <AlertTriangle className="w-3 h-3 text-yellow-400" />
                            {factor}
                        </div>
                    ))}
                </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <details className="mt-4">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-white transition-colors">
                        View {recommendations.length} recommendation{recommendations.length > 1 ? 's' : ''}
                    </summary>
                    <div className="mt-3 space-y-2">
                        {recommendations.map((rec, i) => (
                            <div
                                key={i}
                                className={cn(
                                    'p-3 rounded-lg border-l-2',
                                    rec.priority === 'critical' ? 'bg-red-500/10 border-red-500' :
                                        rec.priority === 'high' ? 'bg-orange-500/10 border-orange-500' :
                                            rec.priority === 'medium' ? 'bg-yellow-500/10 border-yellow-500' :
                                                'bg-blue-500/10 border-blue-500'
                                )}
                            >
                                <div className="text-sm font-medium text-white">{rec.title}</div>
                                <div className="text-xs text-white/70 mt-1">{rec.description}</div>
                                <div className="text-[10px] text-muted-foreground mt-1">{rec.rationale}</div>
                            </div>
                        ))}
                    </div>
                </details>
            )}
        </GlassCard>
    );
};

export default LoadCockpit;
