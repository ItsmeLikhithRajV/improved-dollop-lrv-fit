/**
 * LONGEVITY EXPERT
 * 
 * The unified longevity intelligence.
 * Uses: Circadian protocols, hormesis, sleep optimization, biomarker-aware recommendations
 * Wraps the AdaptiveTimelineEngine as internal knowledge.
 */

import { GlobalState, UserProfile } from "../../types";
import {
    Expert,
    ExpertAnalysis,
    ActionCandidate,
    ExpertContext,
    HandoffData,
    ExpertOpinion,
    CompromiseOption
} from "../types";
import { AdaptiveTimelineEngine } from "./AdaptiveTimelineEngine";
import { StatusClassificationEngine } from "../shared/StatusClassificationEngine";

// =====================================================
// BIOLOGICAL AGE TYPES
// =====================================================

/**
 * Scientific biological age calculation based on available data.
 * Uses HRV (RMSSD) age-normalized comparison, sleep quality, and recovery patterns.
 * 
 * Reference: Kubios HRV physiological age model, sleep research on aging acceleration.
 */
export interface BiologicalAgeMetrics {
    biologicalAge: number | null;          // Estimated bio age, null if insufficient data
    chronologicalAge: number;              // From user profile
    ageGap: number | null;                 // chronological - biological (positive = younger)
    paceOfAging: number | null;            // 1.0 = normal, <1 = slower aging
    healthspanScore: number | null;        // 0-100 composite score
    confidence: 'none' | 'low' | 'medium' | 'high';
    dataAvailability: {
        hrv: boolean;
        sleep: boolean;
        recovery: boolean;
        biomarkers: boolean;
    };
    breakdown: {
        hrvAge: number | null;             // Age based on HRV/RMSSD
        sleepAge: number | null;           // Age based on sleep quality
        recoveryAge: number | null;        // Age based on recovery patterns
        circadianScore: number | null;     // 0-100 circadian alignment
    };
    recommendations: string[];             // What data to add for better accuracy
}

/**
 * Population HRV norms by age (RMSSD in ms)
 * Based on Kubios research and published physiological studies
 */
const HRV_NORMS_BY_AGE: { age: number; rmssd: number }[] = [
    { age: 20, rmssd: 50 },
    { age: 25, rmssd: 45 },
    { age: 30, rmssd: 40 },
    { age: 35, rmssd: 35 },
    { age: 40, rmssd: 32 },
    { age: 45, rmssd: 28 },
    { age: 50, rmssd: 25 },
    { age: 55, rmssd: 22 },
    { age: 60, rmssd: 20 },
    { age: 65, rmssd: 18 },
    { age: 70, rmssd: 16 },
];

/**
 * Optimal sleep metrics by age
 */
const OPTIMAL_SLEEP_BY_AGE: { age: number; duration: number; efficiency: number }[] = [
    { age: 20, duration: 8.0, efficiency: 95 },
    { age: 30, duration: 7.5, efficiency: 92 },
    { age: 40, duration: 7.0, efficiency: 88 },
    { age: 50, duration: 7.0, efficiency: 85 },
    { age: 60, duration: 7.0, efficiency: 82 },
    { age: 70, duration: 7.0, efficiency: 78 },
];

// =====================================================
// LONGEVITY EXPERT
// =====================================================

export class LongevityExpert implements Expert {
    readonly name = "Longevity Specialist";
    readonly domain = "longevity";
    readonly emoji = "🧬";

    // Chronotype mapping
    private readonly chronotypeDescriptions: Record<string, string> = {
        'lion': 'Early riser - peak performance in morning',
        'bear': 'Follows solar schedule - peak performance mid-morning to early afternoon',
        'wolf': 'Night owl - peak performance in evening',
        'dolphin': 'Light sleeper - variable peak times'
    };

    // =====================================================
    // ANALYZE: Internal reasoning using all knowledge
    // =====================================================

    analyze(state: GlobalState, profile: UserProfile): ExpertAnalysis {
        const concerns: string[] = [];
        const opportunities: string[] = [];

        const hour = new Date().getHours();
        const sleep = state.sleep;

        // Detect chronotype
        const profileExt = profile as any;
        const wakeTime = profileExt?.typical_wake_time || '07:30';
        const bedTime = profileExt?.typical_bed_time || '23:00';
        const chronotype = AdaptiveTimelineEngine.detectChronotype(wakeTime, bedTime, 15);

        // Circadian alignment
        const wakeHour = parseInt(wakeTime.split(':')[0]);
        const bedHour = parseInt(bedTime.split(':')[0]);

        // Morning light exposure
        if (hour >= wakeHour && hour <= wakeHour + 2) {
            opportunities.push("Morning light window - cortisol awakening response");
        }

        // Caffeine cutoff
        if (hour >= 14 && hour <= 16) {
            concerns.push("Approaching caffeine cutoff - last chance for coffee");
        } else if (hour > 16) {
            const caffeine = state.fuel?.caffeine_mg ?? 0;
            if (caffeine > 0) {
                concerns.push("Caffeine consumed after cutoff may affect sleep");
            }
        }

        // Evening light exposure concerns
        if (hour >= bedHour - 2) {
            concerns.push("Blue light exposure now will delay melatonin");
        }

        // Sleep timing
        const sleepDuration = sleep?.duration_hours ?? 7;
        if (sleepDuration < 7) {
            concerns.push(`Only ${sleepDuration}h sleep - longevity impact`);
        }

        // Temperature protocol windows
        if (hour >= 10 && hour <= 18) {
            opportunities.push("Temperature stress window - cold/heat available");
        }

        // Calculate score based on circadian alignment
        let score = 80;
        if (concerns.length > 0) score -= concerns.length * 10;
        if (opportunities.length > 0) score += opportunities.length * 5;
        score = Math.max(0, Math.min(100, score));

        // Get scientific status classification (using circadian score)
        const statusResult = StatusClassificationEngine.classifyCircadian(score);

        return {
            domain: this.domain,
            current_state: `Chronotype: ${chronotype} - ${this.chronotypeDescriptions[chronotype]}`,
            score,
            status: statusResult.status,
            statusResult,
            concerns,
            opportunities
        };
    }

    // =====================================================
    // BIOLOGICAL AGE CALCULATION
    // Scientific estimation from available wearable/biomarker data
    // =====================================================

    calculateBiologicalAge(state: GlobalState, profile: UserProfile): BiologicalAgeMetrics {
        const chronologicalAge = profile.age || 30;
        const recommendations: string[] = [];

        // Check data availability
        const hasHRV = !!(state.recovery?.autonomic?.rmssd && state.recovery.autonomic.rmssd > 0);
        const hasSleep = !!(state.sleep?.duration && state.sleep.duration > 0);
        const hasRecovery = !!(state.recovery?.recovery_score && state.recovery.recovery_score > 0);
        const hasBiomarkers = !!(state.medical?.biomarkers && state.medical.biomarkers.length > 0);

        const dataAvailability = {
            hrv: hasHRV,
            sleep: hasSleep,
            recovery: hasRecovery,
            biomarkers: hasBiomarkers
        };

        // Count available data sources
        const dataPoints = [hasHRV, hasSleep, hasRecovery].filter(Boolean).length;

        // If no data at all, return empty metrics
        if (dataPoints === 0) {
            recommendations.push('Connect a wearable to track HRV for accurate biological age');
            recommendations.push('Enable sleep tracking for sleep quality analysis');

            return {
                biologicalAge: null,
                chronologicalAge,
                ageGap: null,
                paceOfAging: null,
                healthspanScore: null,
                confidence: 'none',
                dataAvailability,
                breakdown: {
                    hrvAge: null,
                    sleepAge: null,
                    recoveryAge: null,
                    circadianScore: null
                },
                recommendations
            };
        }

        // Calculate HRV-based age
        let hrvAge: number | null = null;
        if (hasHRV) {
            const rmssd = state.recovery!.autonomic!.rmssd;
            hrvAge = this.calculateHRVAge(rmssd);
        } else {
            recommendations.push('Add HRV monitoring for more accurate biological age');
        }

        // Calculate sleep-based age impact
        let sleepAge: number | null = null;
        if (hasSleep) {
            const duration = state.sleep!.duration || 7;
            const efficiency = state.sleep!.efficiency || 85;
            sleepAge = this.calculateSleepAge(chronologicalAge, duration, efficiency);
        } else {
            recommendations.push('Enable sleep tracking for sleep quality analysis');
        }

        // Calculate recovery-based age
        let recoveryAge: number | null = null;
        if (hasRecovery) {
            const recoveryScore = state.recovery!.recovery_score!;
            // Higher recovery score = younger biological age
            // Recovery score of 100 = 5 years younger, 50 = 5 years older
            recoveryAge = chronologicalAge - ((recoveryScore - 75) / 5);
        }

        // Calculate circadian score
        const circadianScore = this.calculateCircadianScore(state, profile);

        // Weighted average of available age estimates
        const ageEstimates: { age: number; weight: number }[] = [];
        if (hrvAge !== null) ageEstimates.push({ age: hrvAge, weight: 0.5 }); // HRV is most reliable
        if (sleepAge !== null) ageEstimates.push({ age: sleepAge, weight: 0.3 });
        if (recoveryAge !== null) ageEstimates.push({ age: recoveryAge, weight: 0.2 });

        let biologicalAge: number | null = null;
        if (ageEstimates.length > 0) {
            const totalWeight = ageEstimates.reduce((sum, e) => sum + e.weight, 0);
            biologicalAge = Math.round(
                ageEstimates.reduce((sum, e) => sum + (e.age * e.weight), 0) / totalWeight
            );
        }

        // Calculate derived metrics
        const ageGap = biologicalAge !== null ? chronologicalAge - biologicalAge : null;

        // Pace of aging: if you're 30 but bio age is 28, pace = 28/30 = 0.93
        const paceOfAging = biologicalAge !== null
            ? Math.round((biologicalAge / chronologicalAge) * 100) / 100
            : null;

        // Healthspan score: composite of all factors (0-100)
        let healthspanScore: number | null = null;
        if (biologicalAge !== null) {
            // Base score from age gap (max +/- 20 points)
            const ageGapScore = Math.min(20, Math.max(-20, ageGap! * 2));
            // Add circadian alignment
            const circadianContrib = (circadianScore ?? 50) * 0.3;
            // Add recovery contribution
            const recoveryContrib = hasRecovery ? (state.recovery!.recovery_score! - 50) * 0.5 : 0;

            healthspanScore = Math.round(Math.min(100, Math.max(0,
                50 + ageGapScore + circadianContrib / 10 + recoveryContrib
            )));
        }

        // Determine confidence level
        let confidence: 'none' | 'low' | 'medium' | 'high' = 'none';
        if (dataPoints >= 3 && hasBiomarkers) confidence = 'high';
        else if (dataPoints >= 2) confidence = 'medium';
        else if (dataPoints >= 1) confidence = 'low';

        if (!hasBiomarkers) {
            recommendations.push('Upload blood biomarkers for epigenetic age analysis');
        }

        return {
            biologicalAge,
            chronologicalAge,
            ageGap,
            paceOfAging,
            healthspanScore,
            confidence,
            dataAvailability,
            breakdown: {
                hrvAge,
                sleepAge,
                recoveryAge,
                circadianScore
            },
            recommendations
        };
    }

    /**
     * Calculate physiological age from RMSSD using population norms
     * Based on Kubios HRV research
     */
    private calculateHRVAge(rmssd: number): number {
        // Find where this RMSSD falls in the age norms
        // Higher RMSSD = younger biological age

        if (rmssd >= 50) return 20;
        if (rmssd <= 16) return 70;

        // Interpolate between norm points
        for (let i = 0; i < HRV_NORMS_BY_AGE.length - 1; i++) {
            const current = HRV_NORMS_BY_AGE[i];
            const next = HRV_NORMS_BY_AGE[i + 1];

            if (rmssd <= current.rmssd && rmssd > next.rmssd) {
                // Linear interpolation
                const ratio = (current.rmssd - rmssd) / (current.rmssd - next.rmssd);
                return Math.round(current.age + ratio * (next.age - current.age));
            }
        }

        return 45; // Fallback
    }

    /**
     * Calculate sleep impact on biological age
     * Sub-optimal sleep accelerates aging
     */
    private calculateSleepAge(chronoAge: number, duration: number, efficiency: number): number {
        // Find optimal sleep for this age
        let optimal = OPTIMAL_SLEEP_BY_AGE.find(s => s.age >= chronoAge)
            || OPTIMAL_SLEEP_BY_AGE[OPTIMAL_SLEEP_BY_AGE.length - 1];

        // Duration impact: each hour below optimal adds 1 year
        const durationDelta = optimal.duration - duration;
        const durationImpact = Math.max(0, durationDelta) * 1;

        // Efficiency impact: each 5% below optimal adds 0.5 years
        const efficiencyDelta = optimal.efficiency - efficiency;
        const efficiencyImpact = Math.max(0, efficiencyDelta / 5) * 0.5;

        return Math.round(chronoAge + durationImpact + efficiencyImpact);
    }

    /**
     * Calculate circadian alignment score (0-100)
     */
    private calculateCircadianScore(state: GlobalState, profile: UserProfile): number {
        const hour = new Date().getHours();
        let score = 70; // Base score

        const profileExt = profile as any;
        const wakeTime = profileExt?.typical_wake_time || '07:30';
        const bedTime = profileExt?.typical_bed_time || '23:00';
        const wakeHour = parseInt(wakeTime.split(':')[0]);
        const bedHour = parseInt(bedTime.split(':')[0]);

        // Morning light bonus
        if (hour >= wakeHour && hour <= wakeHour + 2) score += 10;

        // Consistent wake time bonus
        if (state.sleep?.wake_time) {
            const actualWakeHour = parseInt(state.sleep.wake_time.split(':')[0]);
            if (Math.abs(actualWakeHour - wakeHour) <= 1) score += 10;
        }

        // Late caffeine penalty
        const caffeine = state.fuel?.caffeine_mg ?? 0;
        if (hour > 14 && caffeine > 0) score -= 10;

        // Blue light penalty (evening)
        if (hour >= bedHour - 2) score -= 5;

        return Math.min(100, Math.max(0, score));
    }

    // =====================================================
    // RECOMMENDATIONS: Generate actionable advice
    // =====================================================

    // =====================================================
    // FORM OPINION
    // =====================================================

    formOpinion(state: GlobalState, profile: UserProfile, context: ExpertContext): ExpertOpinion {
        const analysis = this.analyze(state, profile);
        const candidates = this.getRecommendations(state, profile, context);

        const primary = candidates.sort((a, b) => b.urgency - a.urgency)[0];

        if (!primary) {
            return {
                expert_name: this.name,
                primary_action: {
                    id: 'longevity_maintenance',
                    expert: this.name,
                    name: 'Longevity Protocols',
                    description: 'Routine longevity maintenance',
                    urgency: 0,
                    impact: 0,
                    duration_minutes: 0,
                    rationale: 'Adhering to baseline protocols'
                },
                urgency: 0,
                reasoning: 'No acute interventions needed.',
                constraints: []
            };
        }

        return {
            expert_name: this.name,
            primary_action: primary,
            urgency: primary.urgency,
            reasoning: analysis.concerns.length > 0 ? analysis.concerns[0] : 'Maximize healthspan',
            constraints: [],
            compromise_options: candidates.slice(1).map(c => ({
                ...c,
                compromise_reason: 'Alternative protocol',
                trade_off: 'Different pathway target'
            }))
        };
    }

    // =====================================================
    // RECOMMENDATIONS
    // =====================================================

    getRecommendations(
        state: GlobalState,
        profile: UserProfile,
        context: ExpertContext
    ): ActionCandidate[] {
        const recommendations: ActionCandidate[] = [];
        const hour = context.current_hour;

        const profileExt = profile as any;
        const wakeHour = parseInt(context.wake_time.split(':')[0]);
        const bedHour = parseInt(context.bed_time.split(':')[0]);

        // =========== MORNING PROTOCOLS ===========

        // Morning light (Wake to Wake + 2h)
        if (hour >= wakeHour && hour <= wakeHour + 2) {
            recommendations.push({
                id: 'longevity_morning_light',
                expert: this.name,
                name: '☀️ Morning Sunlight',
                description: 'Get 10-30min of morning light exposure',
                urgency: hour <= wakeHour + 1 ? 80 : 60,
                impact: 90,
                time_window: {
                    start: this.timeToDate(wakeHour),
                    end: this.timeToDate(wakeHour + 2)
                },
                duration_minutes: 15,
                rationale: 'Morning light sets circadian rhythm, boosts cortisol awakening',
                protocol: 'Face east. No sunglasses. 10min direct, 30min indirect.'
            });
        }

        // Morning movement (Wake + 30min to Wake + 2h)
        if (hour >= wakeHour + 0.5 && hour <= wakeHour + 2) {
            recommendations.push({
                id: 'longevity_morning_movement',
                expert: this.name,
                name: '🏃 Morning Movement',
                description: 'Light movement to activate metabolism',
                urgency: 50,
                impact: 65,
                time_window: {
                    start: this.timeToDate(wakeHour + 0.5),
                    end: this.timeToDate(wakeHour + 2)
                },
                duration_minutes: 15,
                rationale: 'Morning movement increases core temp, enhances wakefulness',
                protocol: 'Walk, light yoga, or mobility work. Nothing intense.'
            });
        }

        // =========== MIDDAY PROTOCOLS ===========

        // Caffeine cutoff warning
        if (hour >= 13 && hour <= 15) {
            recommendations.push({
                id: 'longevity_caffeine_cutoff',
                expert: this.name,
                name: '☕ Caffeine Cutoff Approaching',
                description: 'Last window for caffeine today',
                urgency: hour > 14 ? 65 : 45,
                impact: 75,
                duration_minutes: 0,
                rationale: 'Caffeine half-life ~6h. After 14:00 affects sleep quality.',
                protocol: hour > 14 ? 'No more caffeine today' : 'OK to have coffee before 14:00'
            });
        }

        // Cold exposure (not too close to bed)
        const recoveryScore = context.recovery_score;
        if (recoveryScore < 80 && hour >= 10 && hour <= 17) {
            recommendations.push({
                id: 'longevity_cold_exposure',
                expert: this.name,
                name: '🧊 Cold Exposure',
                description: 'Hormetic stress for longevity and recovery',
                urgency: 40,
                impact: 70,
                time_window: {
                    start: this.timeToDate(10),
                    end: this.timeToDate(17)
                },
                duration_minutes: 10,
                rationale: 'Cold exposure: dopamine +250%, reduces inflammation, builds resilience',
                protocol: 'Cold shower 2-3min OR ice bath 5-10min at 10-15°C'
            });
        }

        // =========== EVENING PROTOCOLS ===========

        // Dim lights (Bed - 2h)
        if (hour >= bedHour - 2 && hour < bedHour) {
            recommendations.push({
                id: 'longevity_dim_lights',
                expert: this.name,
                name: '🌙 Dim Lights',
                description: 'Reduce light exposure for melatonin production',
                urgency: hour >= bedHour - 1 ? 75 : 55,
                impact: 85,
                time_window: {
                    start: this.timeToDate(bedHour - 2),
                    end: this.timeToDate(bedHour)
                },
                duration_minutes: 0, // Ongoing
                rationale: 'Blue light suppresses melatonin. Dim lights 2h before bed.',
                protocol: 'Use warm/red lights. Blue light glasses. Dim screens to 20%.'
            });
        }

        // Wind-down breathing
        if (hour >= bedHour - 1 && hour < bedHour) {
            recommendations.push({
                id: 'longevity_breathwork',
                expert: this.name,
                name: '😮‍💨 Evening Breathwork',
                description: 'Activate parasympathetic system for sleep',
                urgency: 60,
                impact: 75,
                time_window: {
                    start: this.timeToDate(bedHour - 1),
                    end: this.timeToDate(bedHour)
                },
                duration_minutes: 10,
                rationale: 'Slow breathing activates vagus nerve, prepares body for sleep',
                protocol: '4-7-8 breathing: Inhale 4s, Hold 7s, Exhale 8s. 8-10 cycles.'
            });
        }

        // Target bedtime
        if (hour === bedHour || hour === bedHour - 1) {
            recommendations.push({
                id: 'longevity_bedtime',
                expert: this.name,
                name: '💤 Target Bedtime',
                description: `Aim to be asleep by ${bedHour}:30`,
                urgency: hour === bedHour ? 85 : 60,
                impact: 95,
                duration_minutes: 0,
                rationale: 'Consistent sleep time is the #1 longevity protocol',
                protocol: 'In bed 30min before target sleep time. Room cool (18-20°C).'
            });
        }

        return recommendations;
    }

    // =====================================================
    // HANDOFF: Receive info from other experts
    // =====================================================

    receiveHandoff(handoff: HandoffData): ActionCandidate[] {
        const recommendations: ActionCandidate[] = [];

        // Doctor detected inflammation markers
        if (handoff.from_expert === 'doctor' && handoff.data?.inflammation) {
            recommendations.push({
                id: 'longevity_inflammation_response',
                expert: this.name,
                name: '🧊 Anti-Inflammatory Protocol',
                description: 'Inflammation detected - intervention needed',
                urgency: 70,
                impact: 80,
                duration_minutes: 0,
                rationale: 'Chronic inflammation accelerates aging',
                protocol: 'Cold exposure, omega-3s, curcumin, reduce sugar/alcohol'
            });
        }

        // Recovery expert detected poor sleep
        if (handoff.from_expert === 'recovery' && handoff.data?.sleep_quality < 60) {
            recommendations.push({
                id: 'longevity_sleep_protocol',
                expert: this.name,
                name: '😴 Sleep Optimization',
                description: 'Poor sleep detected - longevity at risk',
                urgency: 75,
                impact: 90,
                duration_minutes: 0,
                rationale: 'Sleep is the foundation of longevity',
                protocol: 'Consistent bed/wake. No screens 1h before. Cool room. Magnesium.'
            });
        }

        return recommendations;
    }

    // =====================================================
    // PRIORITY: How important is longevity right now?
    // =====================================================

    getPriorityWeight(state: GlobalState, profile: UserProfile): number {
        // Base weight
        let weight = 0.15; // 15% base (longevity is background optimization)

        // User goal focused on longevity
        const goal = String(profile?.user_goal || '');
        if (goal.includes('longevity') || goal.includes('health')) {
            weight = 0.30;
        }

        // Evening = longevity protocols more important (sleep prep)
        const hour = new Date().getHours();
        const bedHour = parseInt((profile as any)?.typical_bed_time?.split(':')[0] || '23');
        if (hour >= bedHour - 3) {
            weight += 0.10;
        }

        // Morning = light protocol important
        const wakeHour = parseInt((profile as any)?.typical_wake_time?.split(':')[0] || '7');
        if (hour >= wakeHour && hour <= wakeHour + 2) {
            weight += 0.10;
        }

        return Math.min(weight, 0.35); // Cap at 35%
    }

    // =====================================================
    // HELPER: Convert hour to Date
    // =====================================================

    private timeToDate(hour: number): Date {
        const now = new Date();
        const date = new Date(now);
        date.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0);
        return date;
    }
}

// Export singleton
export const longevityExpert = new LongevityExpert();
