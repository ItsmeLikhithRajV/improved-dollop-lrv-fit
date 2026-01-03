/**
 * Longevity Tab - Bryan Johnson Blueprint & Longevity Protocols
 * 
 * Features:
 * - Blueprint Protocol Card
 * - Circadian Rhythm Visualization
 * - Recovery Matrix
 * - Pattern Discovery
 * 
 * Note: Daily protocols timeline moved to Commander tab for unified schedule
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Dna, Clock, Activity, Sparkles, Heart, Target, Calendar, Info } from 'lucide-react';
import { GlassCard, cn, Badge } from '../../components/ui';
import { BlueprintProtocolCard } from '../longevity/BlueprintProtocolCard';
import { CircadianClockCard } from '../circadian/CircadianClockCard';
import { RecoveryMatrixCard } from '../recovery/RecoveryMatrixCard';
import { PatternDiscoveryCard } from '../patterns/PatternDiscoveryCard';
import { useSentient } from '../../store/SentientContext';
import { longevityExpert } from '../../experts';
import { ConnectWearableCard, DataUnavailable } from '../../ui/shared/ConnectWearableCard';

// ============================================================================
// LONGEVITY SCORE CARD - Expert-Driven
// ============================================================================

const LongevityScoreCard: React.FC = () => {
    const { state } = useSentient();
    const profile = state.user_profile;

    // Get biological age metrics from expert
    const bioAge = useMemo(() =>
        longevityExpert.calculateBiologicalAge(state, profile),
        [state, profile]
    );

    // Show connect wearable prompt if no data available
    if (bioAge.confidence === 'none') {
        return (
            <ConnectWearableCard
                domain="longevity"
                customMessage="Connect a wearable or upload biomarkers to calculate your biological age."
            />
        );
    }

    return (
        <GlassCard className="p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-purple-500/20">
                            <Heart className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Longevity Score</h3>
                            <p className="text-xs text-muted-foreground">Healthspan optimization</p>
                        </div>
                    </div>
                    <Badge className={cn(
                        "text-[10px]",
                        bioAge.confidence === 'high' ? "bg-green-500/20 text-green-400" :
                            bioAge.confidence === 'medium' ? "bg-yellow-500/20 text-yellow-400" :
                                "bg-white/10 text-white/50"
                    )}>
                        {bioAge.confidence.toUpperCase()} CONFIDENCE
                    </Badge>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {/* Biological Age */}
                    <div className="text-center">
                        <div className="text-5xl font-black text-purple-400">
                            {bioAge.biologicalAge ?? '--'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Biological Age</div>
                        {bioAge.ageGap !== null && (
                            <div className={cn(
                                "text-xs mt-1",
                                bioAge.ageGap > 0 ? "text-green-400" : bioAge.ageGap < 0 ? "text-red-400" : "text-white/50"
                            )}>
                                {bioAge.ageGap > 0 ? `${bioAge.ageGap} years younger` :
                                    bioAge.ageGap < 0 ? `${Math.abs(bioAge.ageGap)} years older` :
                                        'Matches chronological age'}
                            </div>
                        )}
                    </div>

                    {/* Pace of Aging */}
                    <div className="text-center">
                        <div className="text-5xl font-black text-cyan-400">
                            {bioAge.paceOfAging ?? '--'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Pace of Aging</div>
                        {bioAge.paceOfAging !== null && (
                            <div className={cn(
                                "text-xs mt-1",
                                bioAge.paceOfAging < 1 ? "text-green-400" : bioAge.paceOfAging > 1 ? "text-red-400" : "text-white/50"
                            )}>
                                {bioAge.paceOfAging < 1
                                    ? `${Math.round((1 - bioAge.paceOfAging) * 100)}% slower than average`
                                    : bioAge.paceOfAging > 1
                                        ? `${Math.round((bioAge.paceOfAging - 1) * 100)}% faster than average`
                                        : 'Average pace'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Healthspan Score */}
                {bioAge.healthspanScore !== null && (
                    <div className="mt-6 space-y-3">
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Healthspan Score</span>
                                <span className="text-white">{bioAge.healthspanScore}%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                                    style={{ width: `${bioAge.healthspanScore}%` }}
                                />
                            </div>
                        </div>

                        {/* Data breakdown */}
                        <div className="flex flex-wrap gap-2 mt-3">
                            {bioAge.breakdown.hrvAge !== null && (
                                <span className="text-[10px] px-2 py-1 bg-white/5 rounded-full text-white/50">
                                    HRV Age: {bioAge.breakdown.hrvAge}
                                </span>
                            )}
                            {bioAge.breakdown.sleepAge !== null && (
                                <span className="text-[10px] px-2 py-1 bg-white/5 rounded-full text-white/50">
                                    Sleep Age: {bioAge.breakdown.sleepAge}
                                </span>
                            )}
                            {bioAge.breakdown.circadianScore !== null && (
                                <span className="text-[10px] px-2 py-1 bg-white/5 rounded-full text-white/50">
                                    Circadian: {bioAge.breakdown.circadianScore}%
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Recommendations for better accuracy */}
                {bioAge.recommendations.length > 0 && (
                    <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                            <Info className="w-4 h-4 text-white/40" />
                            <span className="text-xs text-white/60">Improve accuracy</span>
                        </div>
                        <ul className="text-[10px] text-white/40 space-y-1">
                            {bioAge.recommendations.slice(0, 2).map((rec, i) => (
                                <li key={i}>• {rec}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </GlassCard>
    );
};

// ============================================================================
// KEY METRICS ROW
// ============================================================================

const KeyMetricsRow: React.FC = () => {
    const metrics = [
        { label: 'Sleep Score', value: '92', unit: '%', color: 'text-indigo-400', icon: Clock },
        { label: 'HRV', value: '58', unit: 'ms', color: 'text-red-400', icon: Activity },
        { label: 'VO2 Max', value: '48', unit: 'ml/kg', color: 'text-green-400', icon: Heart },
        { label: 'Grip Strength', value: '52', unit: 'kg', color: 'text-orange-400', icon: Target },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map((metric, i) => {
                const Icon = metric.icon;
                return (
                    <GlassCard key={i} className="p-4 text-center">
                        <Icon className={cn('w-5 h-5 mx-auto mb-2', metric.color)} />
                        <div className={cn('text-2xl font-bold', metric.color)}>
                            {metric.value}
                            <span className="text-xs text-muted-foreground ml-1">{metric.unit}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                            {metric.label}
                        </div>
                    </GlassCard>
                );
            })}
        </div>
    );
};

// ============================================================================
// MAIN TAB
// ============================================================================

export const LongevityTab: React.FC = () => {
    // Note: Protocol timeline functionality moved to Commander tab
    // const { state } = useSentient();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="pb-24 space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
                        <Dna className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Longevity Lab</h2>
                        <p className="text-sm text-muted-foreground">Healthspan optimization & Blueprint protocol</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 rounded-lg border border-purple-500/30">
                    <span className="text-xs text-purple-400">Powered by</span>
                    <span className="text-xs font-bold text-white">Blueprint Protocol</span>
                </div>
            </div>

            {/* Key Metrics */}
            <KeyMetricsRow />

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Longevity Score */}
                    <LongevityScoreCard />

                    {/* Circadian Clock */}
                    <CircadianClockCard />
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Blueprint Protocol */}
                    <BlueprintProtocolCard />
                </div>
            </div>

            {/* Note: Timeline is now unified in Commander tab */}
            <GlassCard className="p-4 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 border-l-4 border-cyan-500">
                <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                    <div>
                        <h4 className="text-sm font-semibold text-white">Today's Protocols</h4>
                        <p className="text-xs text-muted-foreground">
                            Your daily longevity protocols are now integrated into the <span className="text-cyan-400 font-medium">Commander tab</span> timeline for a unified view.
                        </p>
                    </div>
                </div>
            </GlassCard>

            {/* Full Width: Recovery Matrix */}
            <RecoveryMatrixCard />

            {/* Full Width: Pattern Discovery */}
            <PatternDiscoveryCard />

            {/* Research Note */}
            <GlassCard className="p-4 bg-gradient-to-r from-purple-500/5 to-cyan-500/5 border-l-4 border-purple-500">
                <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-1">About This Tab</h4>
                        <p className="text-xs text-muted-foreground">
                            Longevity optimization is based on protocols from Bryan Johnson (Blueprint),
                            Peter Attia (Outlive), Andrew Huberman, and current longevity research.
                            Biological age estimation uses biomarker data, epigenetic signals, and
                            physiological metrics. Track adherence to maximize your healthspan.
                        </p>
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
};

export default LongevityTab;
