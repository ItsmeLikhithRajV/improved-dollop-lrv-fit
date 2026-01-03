/**
 * Adaptive Recovery Card
 * 
 * Main UI component that displays:
 * - Recovery mode indicator (critical/recovery_focus/maintenance/optimal)
 * - Sleep recommendations with earlier bedtime calculation
 * - Priority recovery actions with access checks
 * - Blocked modalities with reasons
 * - Wearable metrics summary
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, Moon, Activity, AlertTriangle, CheckCircle,
    ChevronRight, Clock, Zap, Info, X, TrendingDown,
    TrendingUp, Minus
} from 'lucide-react';
import { GlassCard, cn, Badge } from '../ui';
import { useSentient } from '../../store/SentientContext';
import {
    generateAdaptiveRecoveryProtocol,
    AdaptiveRecoveryProtocol,
    RecoveryRecommendation,
    WearableMetrics,
    UserCondition,
    logRecoverySession
} from '../../experts/recovery/AdaptiveRecoveryEngine';
import { RecoveryModality } from '../../experts/recovery/RecoveryModalityDatabase';
import { AccessCheckPopup } from './AccessCheckPopup';

// =====================================================
// SUB-COMPONENTS
// =====================================================

const ModeIndicator: React.FC<{ mode: AdaptiveRecoveryProtocol['mode'] }> = ({ mode }) => {
    const config = {
        critical: {
            color: 'bg-red-500/20 text-red-400 border-red-500/30',
            icon: '🚨',
            label: 'CRITICAL'
        },
        recovery_focus: {
            color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
            icon: '⚠️',
            label: 'RECOVERY FOCUS'
        },
        maintenance: {
            color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            icon: '📊',
            label: 'MAINTENANCE'
        },
        optimal: {
            color: 'bg-green-500/20 text-green-400 border-green-500/30',
            icon: '✅',
            label: 'OPTIMAL'
        }
    };

    const { color, icon, label } = config[mode];

    return (
        <Badge className={cn("text-xs font-bold border", color)}>
            {icon} {label}
        </Badge>
    );
};

const MetricsSummary: React.FC<{ metrics: AdaptiveRecoveryProtocol['metrics_summary'] }> = ({ metrics }) => {
    const getStatusIcon = (status: string) => {
        if (status === 'optimal' || status === 'none') {
            return <TrendingUp className="w-4 h-4 text-green-400" />;
        }
        if (status === 'low' || status === 'moderate' || status === 'need_rest') {
            return <Minus className="w-4 h-4 text-yellow-400" />;
        }
        return <TrendingDown className="w-4 h-4 text-red-400" />;
    };

    return (
        <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                {getStatusIcon(metrics.hrv_status)}
                <div>
                    <div className="text-[10px] text-white/50">HRV</div>
                    <div className="text-xs text-white capitalize">{metrics.hrv_status}</div>
                </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                {getStatusIcon(metrics.sleep_debt_status)}
                <div>
                    <div className="text-[10px] text-white/50">Sleep Debt</div>
                    <div className="text-xs text-white capitalize">{metrics.sleep_debt_status}</div>
                </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                {getStatusIcon(metrics.recovery_status)}
                <div>
                    <div className="text-[10px] text-white/50">Recovery</div>
                    <div className="text-xs text-white capitalize">{metrics.recovery_status.replace('_', ' ')}</div>
                </div>
            </div>
        </div>
    );
};

const SleepRecommendationCard: React.FC<{
    recommendation: NonNullable<AdaptiveRecoveryProtocol['sleep_recommendation']>
}> = ({ recommendation }) => {
    return (
        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">😴</span>
                <div className="flex-1">
                    <div className="font-semibold text-white">Sleep Earlier Tonight</div>
                    <div className="text-xs text-white/60">{recommendation.reason}</div>
                </div>
            </div>
            <div className="flex items-center justify-between mt-3 p-3 bg-indigo-500/10 rounded-lg">
                <div>
                    <div className="text-xs text-white/50">Recommended bedtime</div>
                    <div className="text-xl font-bold text-indigo-400">{recommendation.recommended_bedtime}</div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-white/50">Earlier by</div>
                    <div className="text-lg font-bold text-white">{recommendation.minutes_earlier} min</div>
                </div>
            </div>
        </div>
    );
};

const RecoveryActionCard: React.FC<{
    recommendation: RecoveryRecommendation;
    onStart: (rec: RecoveryRecommendation) => void;
}> = ({ recommendation, onStart }) => {
    const { modality, urgency, reason, is_blocked, blocked_reason, available_after, weekly_usage, weekly_cap } = recommendation;

    const urgencyColors = {
        critical: 'border-red-500/30 bg-red-500/5',
        high: 'border-orange-500/30 bg-orange-500/5',
        medium: 'border-cyan-500/30 bg-cyan-500/5',
        low: 'border-white/10 bg-white/5',
        optional: 'border-white/5 bg-white/[0.02]'
    };

    const urgencyBadge = {
        critical: 'bg-red-500/20 text-red-400',
        high: 'bg-orange-500/20 text-orange-400',
        medium: 'bg-cyan-500/20 text-cyan-400',
        low: 'bg-white/10 text-white/60',
        optional: 'bg-white/5 text-white/40'
    };

    return (
        <div className={cn(
            "border rounded-xl p-4 transition-all",
            urgencyColors[urgency],
            is_blocked && "opacity-50"
        )}>
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{modality.emoji}</span>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{modality.name}</span>
                            <Badge className={cn("text-[10px]", urgencyBadge[urgency])}>
                                {urgency.toUpperCase()}
                            </Badge>
                        </div>
                        <div className="text-xs text-white/50 mt-0.5">{reason}</div>
                    </div>
                </div>

                {!is_blocked ? (
                    <button
                        onClick={() => onStart(recommendation)}
                        className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg text-xs font-medium transition-colors"
                    >
                        Start
                    </button>
                ) : (
                    <div className="text-right">
                        <div className="text-xs text-red-400">Blocked</div>
                        {available_after && (
                            <div className="text-[10px] text-white/40">Until {available_after}</div>
                        )}
                    </div>
                )}
            </div>

            {/* Duration & Frequency */}
            <div className="flex items-center gap-4 mt-3 text-xs text-white/50">
                {modality.duration_minutes && (
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {modality.duration_minutes} min
                    </div>
                )}
                {weekly_cap && (
                    <div className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        {weekly_usage}/{weekly_cap} this week
                    </div>
                )}
            </div>

            {/* Blocked reason */}
            {is_blocked && blocked_reason && (
                <div className="mt-2 p-2 bg-red-500/10 rounded-lg">
                    <div className="text-xs text-red-400">{blocked_reason}</div>
                </div>
            )}

            {/* Science note */}
            <div className="mt-3 flex items-start gap-2 text-xs text-white/40">
                <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <span>{modality.science}</span>
            </div>
        </div>
    );
};

// =====================================================
// MAIN COMPONENT
// =====================================================

interface AdaptiveRecoveryCardProps {
    className?: string;
}

export const AdaptiveRecoveryCard: React.FC<AdaptiveRecoveryCardProps> = ({ className }) => {
    const { state } = useSentient();
    const [accessPopup, setAccessPopup] = useState<RecoveryRecommendation | null>(null);
    const [deniedAccess, setDeniedAccess] = useState<string[]>([]);
    const [activeAction, setActiveAction] = useState<RecoveryModality | null>(null);

    // Get wearable metrics from state (or use defaults)
    const wearableMetrics: WearableMetrics = useMemo(() => ({
        hrv_current: state.sleep?.hrv || state.recovery?.autonomic?.rmssd || 50,
        hrv_baseline: state.user_profile?.baselines?.hrv_baseline || 50,
        hrv_trend: 'stable',
        sleep_score: state.sleep?.sleep_quality_score || 80,
        sleep_hours_last_night: state.sleep?.duration || 7,
        deep_sleep_minutes: 60, // Not in current state
        rem_sleep_minutes: 90,  // Not in current state
        sleep_debt_hours: state.sleep?.sleep_debt || 0,
        rhr_current: state.sleep?.resting_hr || 55,
        rhr_baseline: state.user_profile?.baselines?.resting_hr || 55,
        rhr_elevated: (state.sleep?.resting_hr || 55) > (state.user_profile?.baselines?.resting_hr || 55) + 5,
        strain_yesterday: 10,
        recovery_score: state.recovery?.recovery_score || 75,
        readiness_overall: state.mindspace?.readiness_score || 75
    }), [state.sleep, state.recovery, state.user_profile, state.mindspace]);

    // Get user condition from sessions
    const userCondition: UserCondition = useMemo(() => {
        const sessions = state.timeline?.sessions || [];
        const now = new Date();

        // Find most recent completed session
        const recentSession = sessions
            .filter((s: any) => {
                // Parse time_of_day to check if session is in the past
                const [hours, mins] = (s.time_of_day || '00:00').split(':').map(Number);
                const sessionTime = new Date();
                sessionTime.setHours(hours, mins, 0, 0);
                return sessionTime <= now;
            })
            .sort((a: any, b: any) => {
                const [aH, aM] = (a.time_of_day || '00:00').split(':').map(Number);
                const [bH, bM] = (b.time_of_day || '00:00').split(':').map(Number);
                return (bH * 60 + bM) - (aH * 60 + aM);
            })[0];

        let lastTrainingType: UserCondition['last_training_type'] = null;
        let hoursSince = 24;

        if (recentSession) {
            const [hours, mins] = (recentSession.time_of_day || '00:00').split(':').map(Number);
            const sessionTime = new Date();
            sessionTime.setHours(hours, mins, 0, 0);
            hoursSince = (now.getTime() - sessionTime.getTime()) / (1000 * 60 * 60);

            // Map session type to training type
            const sessionType = (recentSession.type || '').toLowerCase();
            if (sessionType.includes('strength') || sessionType.includes('weight')) {
                lastTrainingType = 'strength';
            } else if (sessionType.includes('hypertrophy') || sessionType.includes('muscle')) {
                lastTrainingType = 'hypertrophy';
            } else if (sessionType.includes('cardio') || sessionType.includes('run') || sessionType.includes('bike')) {
                lastTrainingType = 'cardio';
            } else if (sessionType.includes('hiit') || sessionType.includes('interval')) {
                lastTrainingType = 'hiit';
            } else if (sessionType.includes('sport')) {
                lastTrainingType = 'sport';
            }
        }

        return {
            last_training_type: lastTrainingType,
            hours_since_last_session: hoursSince,
            current_soreness: state.recovery?.fatigue_level || 3,
            current_stress: state.mindspace?.stress || 3,
            goal: (state.user_profile?.user_goal?.primary as any) || 'general'
        };
    }, [state.timeline?.sessions, state.mindspace?.stress, state.user_profile?.user_goal, state.recovery?.fatigue_level]);

    // Generate protocol
    const protocol = useMemo(() => {
        return generateAdaptiveRecoveryProtocol(
            state.timeline?.sessions || [],
            wearableMetrics,
            userCondition
        );
    }, [state.timeline?.sessions, wearableMetrics, userCondition]);

    // Handle starting a recovery action
    const handleStartAction = useCallback((rec: RecoveryRecommendation) => {
        if (rec.needs_access_check && rec.access_required) {
            setAccessPopup(rec);
        } else {
            setActiveAction(rec.modality);
            // Log the session
            logRecoverySession({
                modality_id: rec.modality.id,
                timestamp: new Date(),
                duration_minutes: rec.duration_recommendation,
                access_context: 'unknown'
            });
        }
    }, []);

    // Handle access confirmation
    const handleAccessConfirm = useCallback((hasAccess: boolean, remember: boolean) => {
        if (!accessPopup) return;

        if (hasAccess) {
            setActiveAction(accessPopup.modality);
            logRecoverySession({
                modality_id: accessPopup.modality.id,
                timestamp: new Date(),
                duration_minutes: accessPopup.duration_recommendation,
                access_context: 'confirmed'
            });
        } else if (accessPopup.access_required) {
            const accessReq = accessPopup.access_required;
            if (Array.isArray(accessReq)) {
                setDeniedAccess(prev => [...prev, ...accessReq]);
            } else {
                setDeniedAccess(prev => [...prev, accessReq]);
            }
        }

        setAccessPopup(null);
    }, [accessPopup]);

    // Handle selecting alternative
    const handleSelectAlternative = useCallback((alt: RecoveryModality) => {
        setActiveAction(alt);
        logRecoverySession({
            modality_id: alt.id,
            timestamp: new Date(),
            duration_minutes: alt.duration_minutes || 15,
            access_context: 'alternative'
        });
        setAccessPopup(null);
    }, []);

    return (
        <>
            <GlassCard className={cn("p-6", className)}>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
                            <Heart className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Adaptive Recovery</h3>
                            <p className="text-xs text-white/50">Based on your metrics</p>
                        </div>
                    </div>
                    <ModeIndicator mode={protocol.mode} />
                </div>

                {/* Summary */}
                <p className="text-sm text-white/70 mb-4">{protocol.summary}</p>

                {/* Metrics Summary */}
                <MetricsSummary metrics={protocol.metrics_summary} />

                {/* Sleep Recommendation */}
                {protocol.sleep_recommendation && (
                    <div className="mt-4">
                        <SleepRecommendationCard recommendation={protocol.sleep_recommendation} />
                    </div>
                )}

                {/* Priority Actions */}
                <div className="mt-6">
                    <h4 className="text-sm font-medium text-white mb-3">Recovery Actions</h4>
                    <div className="space-y-3">
                        {protocol.priority_actions.slice(0, 5).map((rec, i) => (
                            <RecoveryActionCard
                                key={rec.modality.id}
                                recommendation={rec}
                                onStart={handleStartAction}
                            />
                        ))}
                    </div>
                </div>

                {/* Blocked Modalities */}
                {protocol.blocked_modalities.length > 0 && (
                    <div className="mt-4 p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                        <div className="flex items-center gap-2 text-red-400 text-xs font-bold mb-2">
                            <AlertTriangle className="w-4 h-4" />
                            Blocked Modalities
                        </div>
                        {protocol.blocked_modalities.map((blocked, i) => (
                            <div key={i} className="text-xs text-white/60 mb-1">
                                {blocked.modality.emoji} {blocked.modality.name} - {blocked.reason}
                            </div>
                        ))}
                    </div>
                )}
            </GlassCard>

            {/* Access Check Popup */}
            {accessPopup && (
                <AccessCheckPopup
                    modality={accessPopup.modality}
                    onConfirmAccess={handleAccessConfirm}
                    onSelectAlternative={handleSelectAlternative}
                    onDismiss={() => setAccessPopup(null)}
                    deniedAccess={deniedAccess}
                />
            )}

            {/* Active Action Modal */}
            <AnimatePresence>
                {activeAction && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-sm w-full border border-cyan-500/30"
                        >
                            <div className="text-center">
                                <span className="text-5xl">{activeAction.emoji}</span>
                                <h3 className="text-xl font-bold text-white mt-3">{activeAction.name}</h3>
                                <p className="text-white/60 text-sm mt-2">{activeAction.protocol}</p>

                                {activeAction.duration_minutes && (
                                    <div className="mt-4 p-4 bg-cyan-500/10 rounded-xl">
                                        <div className="text-3xl font-bold text-cyan-400">
                                            {activeAction.duration_minutes} min
                                        </div>
                                        <div className="text-xs text-white/50">Recommended duration</div>
                                    </div>
                                )}

                                <button
                                    onClick={() => setActiveAction(null)}
                                    className="mt-6 w-full py-3 bg-green-500/20 text-green-400 rounded-xl font-medium"
                                >
                                    <CheckCircle className="w-5 h-5 inline mr-2" />
                                    Complete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AdaptiveRecoveryCard;
