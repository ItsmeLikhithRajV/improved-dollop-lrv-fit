/**
 * Pattern Discovery Card - Insights & Correlations Visualization
 * 
 * Features:
 * - Discovered patterns display
 * - Correlation strength indicators
 * - Actionable recommendations
 * - Data quality indicators
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, TrendingUp, TrendingDown, Link, Brain,
    Moon, Activity, Flame, Heart, Eye, CheckCircle, X,
    ChevronRight, AlertCircle, BarChart3
} from 'lucide-react';
import { GlassCard, cn } from '../../components/ui';
import { discoverPatterns, DiscoveredPattern, CorrelationResult, PatternDomain } from '../../services/PatternDiscoveryEngine';

// ============================================================================
// DOMAIN ICONS
// ============================================================================

const domainIcons: Record<PatternDomain, React.ElementType> = {
    sleep: Moon,
    hrv: Activity,
    training: Flame,
    nutrition: Flame,
    recovery: Activity,
    performance: TrendingUp,
    mood: Heart,
    circadian: Eye,
    biomarkers: BarChart3
};

const domainColors: Record<PatternDomain, string> = {
    sleep: 'text-indigo-400',
    hrv: 'text-red-400',
    training: 'text-orange-400',
    nutrition: 'text-green-400',
    recovery: 'text-blue-400',
    performance: 'text-yellow-400',
    mood: 'text-pink-400',
    circadian: 'text-purple-400',
    biomarkers: 'text-cyan-400'
};

// ============================================================================
// CORRELATION BADGE
// ============================================================================

const CorrelationBadge: React.FC<{ correlation: CorrelationResult }> = ({ correlation }) => {
    const absR = Math.abs(correlation.correlation_coefficient);
    const width = Math.round(absR * 100);

    return (
        <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1">
                {React.createElement(domainIcons[correlation.domain_a], {
                    className: cn('w-3 h-3', domainColors[correlation.domain_a])
                })}
                <span className="text-white/70 capitalize">{correlation.metric_a.replace('_', ' ')}</span>
            </div>

            <div className="flex items-center gap-1">
                <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className={cn(
                            'h-full rounded-full',
                            correlation.direction === 'positive' ? 'bg-green-400' : 'bg-red-400'
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${width}%` }}
                    />
                </div>
                {correlation.direction === 'positive' ? (
                    <TrendingUp className="w-3 h-3 text-green-400" />
                ) : (
                    <TrendingDown className="w-3 h-3 text-red-400" />
                )}
            </div>

            <div className="flex items-center gap-1">
                {React.createElement(domainIcons[correlation.domain_b], {
                    className: cn('w-3 h-3', domainColors[correlation.domain_b])
                })}
                <span className="text-white/70 capitalize">{correlation.metric_b.replace('_', ' ')}</span>
            </div>

            {correlation.lag_days > 0 && (
                <span className="text-muted-foreground text-[10px]">
                    (+{correlation.lag_days}d)
                </span>
            )}
        </div>
    );
};

// ============================================================================
// PATTERN CARD
// ============================================================================

const PatternCard: React.FC<{
    pattern: DiscoveredPattern;
    onConfirm?: (id: string) => void;
    onDismiss?: (id: string) => void;
}> = ({ pattern, onConfirm, onDismiss }) => {
    const [expanded, setExpanded] = useState(false);

    const confidenceColor =
        pattern.confidence >= 70 ? 'text-green-400' :
            pattern.confidence >= 50 ? 'text-yellow-400' : 'text-orange-400';

    return (
        <motion.div
            layout
            className={cn(
                'p-4 rounded-lg border-l-4 cursor-pointer transition-colors',
                'bg-white/5 hover:bg-white/10',
                pattern.actionable ? 'border-purple-500' : 'border-blue-500'
            )}
            onClick={() => setExpanded(!expanded)}
        >
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20 mt-0.5">
                        <Link className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-white">{pattern.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                            {pattern.domains_involved.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(' → ')}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className={cn('text-xs font-semibold', confidenceColor)}>
                        {pattern.confidence}%
                    </span>
                    <ChevronRight className={cn(
                        'w-4 h-4 text-muted-foreground transition-transform',
                        expanded && 'rotate-90'
                    )} />
                </div>
            </div>

            {/* Expanded content */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-sm text-white/80 mb-3">{pattern.description}</p>

                            {/* Correlations */}
                            {pattern.correlations.length > 0 && (
                                <div className="mb-3">
                                    <div className="text-[10px] text-muted-foreground uppercase mb-2">Correlation</div>
                                    <CorrelationBadge correlation={pattern.correlations[0]} />
                                </div>
                            )}

                            {/* Recommendation */}
                            {pattern.recommendation && (
                                <div className="p-3 bg-purple-500/10 rounded-lg mb-3">
                                    <div className="text-[10px] text-muted-foreground uppercase mb-1">Action</div>
                                    <p className="text-xs text-white/80">{pattern.recommendation}</p>
                                </div>
                            )}

                            {/* Data quality */}
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                <span>Data quality:</span>
                                <span className={cn(
                                    'px-1.5 py-0.5 rounded',
                                    pattern.data_quality === 'high' ? 'bg-green-500/20 text-green-400' :
                                        pattern.data_quality === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-red-500/20 text-red-400'
                                )}>
                                    {pattern.data_quality}
                                </span>
                                {pattern.correlations.length > 0 && (
                                    <span>• {pattern.correlations[0].sample_size} data points</span>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-3">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onConfirm?.(pattern.id); }}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/30 transition-colors"
                                >
                                    <CheckCircle className="w-3 h-3" />
                                    Helpful
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDismiss?.(pattern.id); }}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-white/10 text-white/60 rounded text-xs hover:bg-white/20 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ============================================================================
// DATA COVERAGE BAR
// ============================================================================

const DataCoverageBar: React.FC<{ coverage: { domain: PatternDomain; completeness: number }[] }> = ({ coverage }) => {
    return (
        <div className="flex gap-1">
            {coverage.map(c => {
                const Icon = domainIcons[c.domain];
                return (
                    <div
                        key={c.domain}
                        className="group relative flex-1 h-8 bg-white/5 rounded flex items-center justify-center"
                        title={`${c.domain}: ${c.completeness}% data coverage`}
                    >
                        <div
                            className={cn(
                                'absolute bottom-0 left-0 right-0 rounded-b transition-all',
                                c.completeness >= 70 ? 'bg-green-500/40' :
                                    c.completeness >= 40 ? 'bg-yellow-500/40' : 'bg-red-500/40'
                            )}
                            style={{ height: `${c.completeness}%` }}
                        />
                        <Icon className={cn('w-3 h-3 relative z-10', domainColors[c.domain])} />
                    </div>
                );
            })}
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface PatternDiscoveryCardProps {
    className?: string;
    compact?: boolean;
}

export const PatternDiscoveryCard: React.FC<PatternDiscoveryCardProps> = ({
    className,
    compact = false
}) => {
    const analysis = useMemo(() => discoverPatterns(), []);

    const {
        patterns,
        new_discoveries,
        top_correlations,
        data_coverage,
        ranked_insights
    } = analysis;

    const handleConfirm = (id: string) => {
        console.log('Pattern confirmed:', id);
        // Would update user preferences
    };

    const handleDismiss = (id: string) => {
        console.log('Pattern dismissed:', id);
        // Would hide pattern in future
    };

    if (compact) {
        return (
            <GlassCard className={cn('p-4', className)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/20">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Patterns</div>
                            <div className="text-lg font-bold text-white">
                                {patterns.length} discovered
                            </div>
                        </div>
                    </div>
                    {new_discoveries.length > 0 && (
                        <div className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                            {new_discoveries.length} new
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
                    <div className="p-3 rounded-xl bg-purple-500/20">
                        <Sparkles className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Pattern Discovery</h3>
                        <p className="text-xs text-muted-foreground">AI-detected correlations</p>
                    </div>
                </div>

                {new_discoveries.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
                        </span>
                        <span className="text-xs text-purple-400">{new_discoveries.length} new insights</span>
                    </div>
                )}
            </div>

            {/* Data Coverage */}
            <div className="mb-6">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                    Data Coverage (60 days)
                </div>
                <DataCoverageBar coverage={data_coverage} />
                <div className="flex justify-between mt-1 text-[9px] text-muted-foreground">
                    <span>More data = better insights</span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500/40 rounded-sm" /> &gt;70%
                        <span className="w-2 h-2 bg-yellow-500/40 rounded-sm" /> 40-70%
                        <span className="w-2 h-2 bg-red-500/40 rounded-sm" /> &lt;40%
                    </span>
                </div>
            </div>

            {/* Patterns */}
            <div className="space-y-3 mb-6">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    Discovered Patterns ({patterns.length})
                </div>

                {patterns.length === 0 ? (
                    <div className="p-4 bg-white/5 rounded-lg text-center">
                        <Brain className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                            Keep logging data to discover patterns
                        </p>
                    </div>
                ) : (
                    patterns.slice(0, 5).map(pattern => (
                        <PatternCard
                            key={pattern.id}
                            pattern={pattern}
                            onConfirm={handleConfirm}
                            onDismiss={handleDismiss}
                        />
                    ))
                )}

                {patterns.length > 5 && (
                    <button className="w-full py-2 text-center text-xs text-purple-400 hover:text-purple-300 transition-colors">
                        View {patterns.length - 5} more patterns
                    </button>
                )}
            </div>

            {/* Top Correlations */}
            {top_correlations.length > 0 && (
                <details>
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-white transition-colors">
                        View raw correlations ({top_correlations.length})
                    </summary>
                    <div className="mt-3 space-y-2">
                        {top_correlations.slice(0, 5).map((corr, i) => (
                            <div key={i} className="p-2 bg-white/5 rounded-lg">
                                <CorrelationBadge correlation={corr} />
                                <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                                    <span>r = {corr.correlation_coefficient.toFixed(2)}</span>
                                    <span>{corr.strength}</span>
                                    <span>{corr.sample_size} samples</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </details>
            )}

            {/* Info */}
            <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border-l-2 border-blue-500">
                <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-white/70">
                        Patterns are discovered through statistical correlation. Correlation ≠ causation,
                        but these insights can help you identify what works for you.
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};

export default PatternDiscoveryCard;
