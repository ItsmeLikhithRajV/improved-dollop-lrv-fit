/**
 * Adaptive Recovery Engine
 * 
 * Smart recovery recommendation system that:
 * 1. Prioritizes sleep as #1 recovery tool
 * 2. Uses wearable metrics (HRV, sleep, RHR) to inform recommendations
 * 3. Respects training blocks (no cold after strength)
 * 4. Tracks weekly frequency limits
 * 5. Provides fallback alternatives based on access
 * 
 * Based on research from: Huberman Lab, Finnish studies, NIH, Mayo Clinic
 */

import {
    RECOVERY_MODALITIES,
    RecoveryModality,
    getModalityById,
    getAlternatives,
    isBlockedAfterTraining,
    getBlockedReason,
    TrainingType,
    ModalityTier
} from './RecoveryModalityDatabase';
import { Session } from '../../types';

// =====================================================
// TYPES
// =====================================================

export interface WearableMetrics {
    // HRV
    hrv_current: number;              // ms (RMSSD)
    hrv_baseline: number;             // 7-day average
    hrv_trend: 'rising' | 'falling' | 'stable';

    // Sleep
    sleep_score: number;              // 0-100
    sleep_hours_last_night: number;
    deep_sleep_minutes: number;
    rem_sleep_minutes: number;
    sleep_debt_hours: number;         // Accumulated over past week

    // Heart
    rhr_current: number;              // bpm
    rhr_baseline: number;             // 7-day average
    rhr_elevated: boolean;            // > baseline + 5bpm

    // Activity
    strain_yesterday: number;         // 0-21 (WHOOP style)
    recovery_score: number;           // 0-100

    // Readiness
    readiness_overall: number;        // 0-100 composite
}

export interface UserCondition {
    last_training_type: TrainingType | null;
    hours_since_last_session: number;
    current_soreness: number;         // 0-10
    current_stress: number;           // 0-10
    goal: 'hypertrophy' | 'strength' | 'endurance' | 'longevity' | 'general';
}

export interface AccessContext {
    date: Date;
    location: 'home' | 'gym' | 'office' | 'travel' | 'other';
    confirmed_access: string[];       // Modality access_required values confirmed today
    denied_access: string[];          // Access denied today (skip asking again)
}

export interface RecoveryLog {
    modality_id: string;
    timestamp: Date;
    duration_minutes: number;
    access_context: string;
    effectiveness_rating?: 1 | 2 | 3 | 4 | 5;
}

export type RecommendationUrgency = 'critical' | 'high' | 'medium' | 'low' | 'optional';

export interface RecoveryRecommendation {
    modality: RecoveryModality;
    urgency: RecommendationUrgency;
    reason: string;
    science: string;

    // Access handling
    needs_access_check: boolean;
    access_required: string | string[] | null;
    alternatives: RecoveryModality[];

    // Timing
    suggested_time?: string;          // e.g., "Now", "Before bed", "After 2:30 PM"
    duration_recommendation: number;   // minutes

    // Blocking
    is_blocked: boolean;
    blocked_reason?: string;
    available_after?: string;         // Time when unblocked

    // Frequency
    weekly_usage: number;
    weekly_cap: number | null;
    can_do_today: boolean;
}

export interface AdaptiveRecoveryProtocol {
    mode: 'critical' | 'recovery_focus' | 'maintenance' | 'optimal';
    summary: string;

    // Priority recommendations
    priority_actions: RecoveryRecommendation[];

    // Sleep specific
    sleep_recommendation?: {
        recommended_bedtime: string;
        minutes_earlier: number;
        reason: string;
    };

    // Blocked modalities
    blocked_modalities: {
        modality: RecoveryModality;
        reason: string;
        available_after: string;
    }[];

    // Metrics summary
    metrics_summary: {
        hrv_status: 'optimal' | 'low' | 'critical';
        sleep_debt_status: 'none' | 'moderate' | 'severe';
        recovery_status: 'optimal' | 'need_rest' | 'critical';
    };
}

// =====================================================
// DEFAULT VALUES
// =====================================================

const DEFAULT_WEARABLE_METRICS: WearableMetrics = {
    hrv_current: 50,
    hrv_baseline: 50,
    hrv_trend: 'stable',
    sleep_score: 80,
    sleep_hours_last_night: 7,
    deep_sleep_minutes: 60,
    rem_sleep_minutes: 90,
    sleep_debt_hours: 0,
    rhr_current: 55,
    rhr_baseline: 55,
    rhr_elevated: false,
    strain_yesterday: 10,
    recovery_score: 75,
    readiness_overall: 75
};

const DEFAULT_USER_CONDITION: UserCondition = {
    last_training_type: null,
    hours_since_last_session: 24,
    current_soreness: 3,
    current_stress: 3,
    goal: 'general'
};

// =====================================================
// WEEKLY USAGE TRACKING
// =====================================================

// In-memory storage (in production, this would be persisted)
let recoveryLogs: RecoveryLog[] = [];

export function logRecoverySession(log: RecoveryLog): void {
    recoveryLogs.push(log);
}

export function getWeeklyUsage(modalityId: string): number {
    const weekStart = getStartOfWeek();
    return recoveryLogs.filter(
        log => log.modality_id === modalityId && new Date(log.timestamp) >= weekStart
    ).length;
}

function getStartOfWeek(): Date {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
}

function canUseModality(modality: RecoveryModality): { canUse: boolean; reason?: string } {
    if (!modality.frequency_cap_weekly) {
        return { canUse: true };
    }

    const usage = getWeeklyUsage(modality.id);
    if (usage >= modality.frequency_cap_weekly) {
        return {
            canUse: false,
            reason: `Weekly limit reached (${usage}/${modality.frequency_cap_weekly})`
        };
    }

    return { canUse: true };
}

// =====================================================
// SLEEP DEBT CALCULATOR
// =====================================================

function calculateSleepRecommendation(metrics: WearableMetrics): {
    recommended_bedtime: string;
    minutes_earlier: number;
    reason: string;
} | null {
    // Calculate how much earlier to sleep based on metrics
    let minutesEarlier = 0;
    let reasons: string[] = [];

    // Sleep debt contribution (max 45 min)
    if (metrics.sleep_debt_hours > 0) {
        const sleepDebtContribution = Math.min(metrics.sleep_debt_hours * 15, 45);
        minutesEarlier += sleepDebtContribution;
        if (metrics.sleep_debt_hours > 2) {
            reasons.push(`${metrics.sleep_debt_hours}h sleep debt`);
        }
    }

    // HRV contribution (max 30 min)
    const hrvRatio = metrics.hrv_current / metrics.hrv_baseline;
    if (hrvRatio < 0.8) {
        const hrvContribution = Math.min((1 - hrvRatio) * 60, 30);
        minutesEarlier += hrvContribution;
        reasons.push(`HRV ${Math.round((1 - hrvRatio) * 100)}% below baseline`);
    }

    // RHR elevated contribution (15 min)
    if (metrics.rhr_elevated) {
        minutesEarlier += 15;
        reasons.push('RHR elevated');
    }

    // Low recovery score contribution (max 20 min)
    if (metrics.recovery_score < 50) {
        const recoveryContribution = Math.min((50 - metrics.recovery_score) * 0.5, 20);
        minutesEarlier += recoveryContribution;
        reasons.push('Low recovery score');
    }

    // Cap at 60 minutes earlier
    minutesEarlier = Math.min(Math.round(minutesEarlier), 60);

    if (minutesEarlier < 15) {
        return null; // Not significant enough to recommend
    }

    // Calculate recommended bedtime (assuming 10 PM default)
    const defaultBedtime = new Date();
    defaultBedtime.setHours(22, 0, 0, 0);
    const recommendedBedtime = new Date(defaultBedtime.getTime() - minutesEarlier * 60000);

    return {
        recommended_bedtime: recommendedBedtime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        minutes_earlier: minutesEarlier,
        reason: reasons.join(', ')
    };
}

// =====================================================
// CORE RECOMMENDATION ENGINE
// =====================================================

function determineRecoveryMode(metrics: WearableMetrics): 'critical' | 'recovery_focus' | 'maintenance' | 'optimal' {
    // Critical: Multiple severe signals
    const criticalSignals = [
        metrics.hrv_current < metrics.hrv_baseline * 0.7,
        metrics.sleep_debt_hours > 4,
        metrics.recovery_score < 30,
        metrics.rhr_elevated && metrics.sleep_score < 60
    ].filter(Boolean).length;

    if (criticalSignals >= 2) return 'critical';

    // Recovery focus: Moderate signals
    const recoverySignals = [
        metrics.hrv_current < metrics.hrv_baseline * 0.85,
        metrics.sleep_debt_hours > 2,
        metrics.recovery_score < 50,
        metrics.rhr_elevated
    ].filter(Boolean).length;

    if (recoverySignals >= 2) return 'recovery_focus';

    // Maintenance: Minor signals
    const maintenanceSignals = [
        metrics.hrv_current < metrics.hrv_baseline * 0.95,
        metrics.sleep_debt_hours > 1,
        metrics.recovery_score < 70
    ].filter(Boolean).length;

    if (maintenanceSignals >= 1) return 'maintenance';

    return 'optimal';
}

function getMetricsSummary(metrics: WearableMetrics): {
    hrv_status: 'optimal' | 'low' | 'critical';
    sleep_debt_status: 'none' | 'moderate' | 'severe';
    recovery_status: 'optimal' | 'need_rest' | 'critical';
} {
    const hrvRatio = metrics.hrv_current / metrics.hrv_baseline;

    return {
        hrv_status: hrvRatio >= 0.9 ? 'optimal' : hrvRatio >= 0.75 ? 'low' : 'critical',
        sleep_debt_status: metrics.sleep_debt_hours < 1 ? 'none' : metrics.sleep_debt_hours < 3 ? 'moderate' : 'severe',
        recovery_status: metrics.recovery_score >= 70 ? 'optimal' : metrics.recovery_score >= 40 ? 'need_rest' : 'critical'
    };
}

function buildRecommendation(
    modality: RecoveryModality,
    urgency: RecommendationUrgency,
    reason: string,
    condition: UserCondition
): RecoveryRecommendation {
    const weeklyUsage = getWeeklyUsage(modality.id);
    const { canUse, reason: blockReason } = canUseModality(modality);

    // Check training blocks
    let isBlocked = false;
    let blockedReason: string | undefined;
    let availableAfter: string | undefined;

    if (condition.last_training_type && condition.hours_since_last_session < modality.blocked_hours) {
        if (modality.blocked_after.includes(condition.last_training_type)) {
            isBlocked = true;
            blockedReason = getBlockedReason(modality.id, condition.last_training_type) || undefined;
            const unblockTime = new Date();
            unblockTime.setHours(unblockTime.getHours() + (modality.blocked_hours - condition.hours_since_last_session));
            availableAfter = unblockTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }

    if (!canUse) {
        isBlocked = true;
        blockedReason = blockReason;
    }

    return {
        modality,
        urgency,
        reason,
        science: modality.science,
        needs_access_check: modality.access_required !== null,
        access_required: modality.access_required,
        alternatives: getAlternatives(modality.id),
        duration_recommendation: modality.duration_minutes || 15,
        is_blocked: isBlocked,
        blocked_reason: blockedReason,
        available_after: availableAfter,
        weekly_usage: weeklyUsage,
        weekly_cap: modality.frequency_cap_weekly,
        can_do_today: !isBlocked
    };
}

// =====================================================
// MAIN GENERATOR FUNCTION
// =====================================================

export function generateAdaptiveRecoveryProtocol(
    sessions: Session[],
    metrics: WearableMetrics = DEFAULT_WEARABLE_METRICS,
    condition: UserCondition = DEFAULT_USER_CONDITION,
    accessContext?: AccessContext
): AdaptiveRecoveryProtocol {
    const now = new Date();
    const mode = determineRecoveryMode(metrics);
    const metricsSummary = getMetricsSummary(metrics);

    const recommendations: RecoveryRecommendation[] = [];
    const blockedModalities: { modality: RecoveryModality; reason: string; available_after: string }[] = [];

    // =========================================
    // PRIORITY 1: SLEEP RECOMMENDATIONS
    // =========================================
    const sleepRecommendation = calculateSleepRecommendation(metrics);

    if (sleepRecommendation) {
        const sleepModality = getModalityById('sleep_earlier')!;
        recommendations.push(buildRecommendation(
            sleepModality,
            sleepRecommendation.minutes_earlier >= 45 ? 'critical' :
                sleepRecommendation.minutes_earlier >= 30 ? 'high' : 'medium',
            `Sleep ${sleepRecommendation.minutes_earlier} min earlier (${sleepRecommendation.reason})`,
            condition
        ));
    }

    // =========================================
    // PRIORITY 2: HRV CRASHED - IMMEDIATE ACTION
    // =========================================
    if (metrics.hrv_current < metrics.hrv_baseline * 0.8) {
        const breathing = getModalityById('diaphragmatic_breathing')!;
        recommendations.push(buildRecommendation(
            breathing,
            'high',
            'HRV significantly below baseline - activate parasympathetic now',
            condition
        ));

        const nap = getModalityById('power_nap')!;
        if (now.getHours() < 15) { // Only suggest nap before 3 PM
            recommendations.push(buildRecommendation(
                nap,
                'medium',
                'Low HRV indicates need for additional rest',
                condition
            ));
        }
    }

    // =========================================
    // PRIORITY 3: RHR ELEVATED - BODY UNDER STRESS
    // =========================================
    if (metrics.rhr_elevated) {
        const meditation = getModalityById('meditation')!;
        recommendations.push(buildRecommendation(
            meditation,
            'medium',
            'Elevated RHR indicates systemic stress',
            condition
        ));

        const hotBath = getModalityById('hot_bath')!;
        recommendations.push(buildRecommendation(
            hotBath,
            'medium',
            'Heat therapy promotes parasympathetic activation',
            condition
        ));
    }

    // =========================================
    // PRIORITY 4: POST-TRAINING RECOVERY
    // =========================================
    if (condition.last_training_type && condition.hours_since_last_session < 6) {
        // Foam rolling always good
        const foamRolling = getModalityById('foam_rolling')!;
        recommendations.push(buildRecommendation(
            foamRolling,
            'medium',
            `Post-${condition.last_training_type} recovery`,
            condition
        ));

        // Protein intake
        if (condition.hours_since_last_session < 2) {
            const protein = getModalityById('recovery_protein')!;
            recommendations.push(buildRecommendation(
                protein,
                'high',
                'Anabolic window - protein intake critical',
                condition
            ));
        }

        // Sauna after strength (OK, unlike cold)
        if (['strength', 'hypertrophy'].includes(condition.last_training_type)) {
            const sauna = getModalityById('sauna')!;
            const saunaRec = buildRecommendation(
                sauna,
                'medium',
                'GH release benefits - safe after strength training',
                condition
            );
            recommendations.push(saunaRec);

            // Block cold modalities
            const iceBath = getModalityById('ice_bath')!;
            const coldRec = buildRecommendation(iceBath, 'low', '', condition);
            if (coldRec.is_blocked && coldRec.blocked_reason && coldRec.available_after) {
                blockedModalities.push({
                    modality: iceBath,
                    reason: coldRec.blocked_reason,
                    available_after: coldRec.available_after
                });
            }
        }

        // Cold OK after cardio
        if (['cardio', 'hiit'].includes(condition.last_training_type)) {
            const coldShower = getModalityById('cold_shower')!;
            recommendations.push(buildRecommendation(
                coldShower,
                'medium',
                'Cold exposure effective after cardio - no adaptation interference',
                condition
            ));
        }
    }

    // =========================================
    // PRIORITY 5: HIGH SORENESS
    // =========================================
    if (condition.current_soreness >= 6) {
        const massageGun = getModalityById('massage_gun')!;
        recommendations.push(buildRecommendation(
            massageGun,
            'medium',
            'High soreness - myofascial release recommended',
            condition
        ));

        const stretching = getModalityById('deep_stretching')!;
        recommendations.push(buildRecommendation(
            stretching,
            'low',
            'Stretching helps reduce muscle stiffness',
            condition
        ));
    }

    // =========================================
    // PRIORITY 6: HIGH STRESS
    // =========================================
    if (condition.current_stress >= 7) {
        const yoga = getModalityById('yoga_flow')!;
        recommendations.push(buildRecommendation(
            yoga,
            'medium',
            'High stress - yoga combines movement with breathwork',
            condition
        ));

        const walk = getModalityById('active_recovery_walk')!;
        recommendations.push(buildRecommendation(
            walk,
            'low',
            'Walking outdoors reduces cortisol',
            condition
        ));
    }

    // =========================================
    // PRIORITY 7: MAINTENANCE (OPTIMAL DAYS)
    // =========================================
    if (mode === 'optimal' || mode === 'maintenance') {
        // Suggest sauna if quota available
        const sauna = getModalityById('sauna')!;
        const saunaUsage = getWeeklyUsage('sauna');
        if (saunaUsage < (sauna.frequency_cap_weekly || 4)) {
            recommendations.push(buildRecommendation(
                sauna,
                'optional',
                `Maintenance - ${saunaUsage}/${sauna.frequency_cap_weekly} this week`,
                condition
            ));
        }

        // Always suggest hydration
        const hydration = getModalityById('hydration_protocol')!;
        recommendations.push(buildRecommendation(
            hydration,
            'low',
            'Fundamental recovery support',
            condition
        ));
    }

    // =========================================
    // SORT BY URGENCY
    // =========================================
    const urgencyOrder: RecommendationUrgency[] = ['critical', 'high', 'medium', 'low', 'optional'];
    recommendations.sort((a, b) => {
        return urgencyOrder.indexOf(a.urgency) - urgencyOrder.indexOf(b.urgency);
    });

    // Remove duplicates (keep highest urgency)
    const seen = new Set<string>();
    const uniqueRecommendations = recommendations.filter(rec => {
        if (seen.has(rec.modality.id)) return false;
        seen.add(rec.modality.id);
        return true;
    });

    // =========================================
    // BUILD SUMMARY
    // =========================================
    let summary = '';
    switch (mode) {
        case 'critical':
            summary = '🚨 Your body needs significant recovery. Prioritize sleep and rest.';
            break;
        case 'recovery_focus':
            summary = '⚠️ Recovery metrics are below optimal. Focus on restorative activities.';
            break;
        case 'maintenance':
            summary = '📊 Minor recovery needs detected. Light recovery recommended.';
            break;
        case 'optimal':
            summary = '✅ Recovery metrics look good! Maintenance activities suggested.';
            break;
    }

    return {
        mode,
        summary,
        priority_actions: uniqueRecommendations.slice(0, 8), // Top 8 recommendations
        sleep_recommendation: sleepRecommendation || undefined,
        blocked_modalities: blockedModalities,
        metrics_summary: metricsSummary
    };
}

// =====================================================
// ACCESS CHECK HELPERS
// =====================================================

export function getAccessQuestion(modality: RecoveryModality): string {
    const accessReq = modality.access_required;
    if (!accessReq) return '';

    if (Array.isArray(accessReq)) {
        return `Do you have access to ${accessReq.join(' and ')} right now?`;
    }

    const accessLabels: Record<string, string> = {
        'ice_bath': 'an ice bath or cold plunge',
        'sauna': 'a sauna',
        'steam_room': 'a steam room',
        'bathtub': 'a bathtub',
        'shower': 'a shower',
        'foam_roller': 'a foam roller',
        'massage_gun': 'a massage gun',
        'massage_ball': 'a massage or lacrosse ball',
        'massage_therapist': 'a massage therapist',
        'compression_boots': 'compression boots',
        'compression_clothing': 'compression clothing',
        'pull_up_bar': 'a pull-up bar',
        'floor_space': 'floor space',
        'quiet_space': 'a quiet space',
        'pool': 'a pool',
        'bike': 'a bike',
        'electrolytes': 'electrolytes',
        'protein_source': 'a protein source',
        'wall': 'a wall',
        'bowl_with_cold_water': 'a bowl with cold water'
    };

    return `Do you have access to ${accessLabels[accessReq] || accessReq} right now?`;
}

export function findNextAlternative(
    modalityId: string,
    deniedAccess: string[]
): RecoveryModality | null {
    const alternatives = getAlternatives(modalityId);

    for (const alt of alternatives) {
        // Check if this alternative's access requirement has been denied
        const altAccess = alt.access_required;
        if (!altAccess) {
            return alt; // No access required, can use
        }

        if (Array.isArray(altAccess)) {
            if (!altAccess.some(a => deniedAccess.includes(a))) {
                return alt;
            }
        } else {
            if (!deniedAccess.includes(altAccess)) {
                return alt;
            }
        }
    }

    return null;
}
