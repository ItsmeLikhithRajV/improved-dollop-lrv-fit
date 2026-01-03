/**
 * RECOVERY EXPERT
 * 
 * The unified recovery intelligence.
 * Uses ALL recovery-related engines as internal knowledge.
 * Handles: HRV, Sleep, Muscle Recovery, Red Day signals
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
import { StatusClassificationEngine } from "../shared/StatusClassificationEngine";

// =====================================================
// RECOVERY EXPERT
// =====================================================

export class RecoveryExpert implements Expert {
    readonly name = "Recovery Specialist";
    readonly domain = "recovery";
    readonly emoji = "🔄";

    // =====================================================
    // ANALYZE: Internal reasoning using all knowledge
    // =====================================================

    analyze(state: GlobalState, profile: UserProfile): ExpertAnalysis {
        const recovery = state.recovery;
        const sleep = state.sleep;
        const concerns: string[] = [];
        const opportunities: string[] = [];

        // Recovery score analysis
        const recoveryScore = recovery?.recovery_score ?? 80;

        if (recoveryScore < 30) {
            concerns.push("Recovery critically low - rest is mandatory");
        } else if (recoveryScore < 50) {
            concerns.push("Recovery suboptimal - reduce training load");
        } else if (recoveryScore < 70) {
            concerns.push("Recovery moderate - consider lighter training");
        }

        // HRV analysis
        const hrv = recovery?.hrv_trend;
        if (hrv === 'declining') {
            concerns.push("HRV trending down - accumulated fatigue");
        } else if (hrv === 'low') {
            concerns.push("HRV below baseline - stress or under-recovery");
        }

        // Sleep analysis
        const sleepQuality = sleep?.quality ?? 80;
        const sleepDuration = sleep?.duration_hours ?? 7;

        if (sleepQuality < 60) {
            concerns.push(`Sleep quality only ${sleepQuality}% - poor recovery overnight`);
        }
        if (sleepDuration < 6) {
            concerns.push(`Only ${sleepDuration}h sleep - significant debt`);
        }

        // Muscle soreness
        const soreness = recovery?.muscle_soreness ?? 0;
        if (soreness > 7) {
            concerns.push("High muscle soreness - active recovery recommended");
        }

        // Opportunities
        const hour = new Date().getHours();
        if (recoveryScore >= 80) {
            opportunities.push("High recovery - optimal for intense training");
        }
        if (hour >= 13 && hour <= 15 && recoveryScore < 70) {
            opportunities.push("Midday - good window for a power nap");
        }
        if (hour >= 19 && hour <= 21) {
            opportunities.push("Evening - wind-down protocols available");
        }

        // Determine current state description
        let current_state: string;
        if (recoveryScore >= 80 && sleepQuality >= 70) {
            current_state = "Recovery excellent - ready for high performance";
        } else if (recoveryScore >= 60) {
            current_state = "Recovery adequate - moderate activity OK";
        } else if (recoveryScore >= 40) {
            current_state = "Recovery impaired - prioritize rest";
        } else {
            current_state = "Recovery critical - mandatory rest day";
        }

        // Get scientific status classification
        const statusResult = StatusClassificationEngine.classifyRecovery(recoveryScore);

        return {
            domain: this.domain,
            current_state,
            score: recoveryScore,
            status: statusResult.status,
            statusResult,
            concerns,
            opportunities
        };
    }

    // =====================================================
    // RECOMMENDATIONS: Generate actionable advice
    // =====================================================

    getRecommendations(
        state: GlobalState,
        profile: UserProfile,
        context: ExpertContext
    ): ActionCandidate[] {
        const recommendations: ActionCandidate[] = [];
        const analysis = this.analyze(state, profile);
        const hour = context.current_hour;

        const recovery = state.recovery;
        const sleep = state.sleep;
        const recoveryScore = analysis.score;

        // =========== RED DAY PROTOCOLS ===========

        if (recoveryScore < 40) {
            recommendations.push({
                id: 'recovery_red_day',
                expert: this.name,
                name: '🚨 Red Day Protocol',
                description: 'Recovery critically low - mandatory rest',
                urgency: 100,
                impact: 95,
                duration_minutes: 0, // All day
                rationale: `Recovery at ${recoveryScore}% - training would be counterproductive`,
                protocol: 'No intense training. Light movement only. Focus on nutrition and sleep.'
            });
        }

        // =========== SLEEP RECOMMENDATIONS ===========

        // Poor sleep last night
        const sleepQuality = sleep?.quality ?? 80;
        if (sleepQuality < 60 && hour >= 13 && hour <= 16) {
            recommendations.push({
                id: 'recovery_nap',
                expert: this.name,
                name: '💤 Power Nap Suggested',
                description: 'Poor sleep detected - nap will help recovery',
                urgency: 65,
                impact: 70,
                time_window: {
                    start: this.timeToDate(13),
                    end: this.timeToDate(16)
                },
                duration_minutes: 20,
                rationale: `Sleep quality was ${sleepQuality}% - cognitive and physical recovery impaired`,
                protocol: '20-minute nap. Set alarm. Dark, quiet room.'
            });
        }

        // Evening wind-down
        const bedHour = parseInt(context.bed_time.split(':')[0]);
        if (hour >= bedHour - 2 && hour < bedHour) {
            recommendations.push({
                id: 'recovery_wind_down',
                expert: this.name,
                name: '🌙 Wind Down for Sleep',
                description: 'Prepare your body for quality sleep',
                urgency: 60,
                impact: 80,
                time_window: {
                    start: this.timeToDate(bedHour - 2),
                    end: this.timeToDate(bedHour)
                },
                duration_minutes: 30,
                rationale: 'Wind-down routine improves sleep onset and quality',
                protocol: 'Dim lights. No screens. Light stretching or reading.'
            });
        }

        // =========== ACTIVE RECOVERY ===========

        // Sore muscles + moderate recovery
        const soreness = recovery?.muscle_soreness ?? 0;
        if (soreness > 5 && recoveryScore >= 40 && hour >= 8 && hour <= 18) {
            recommendations.push({
                id: 'recovery_active',
                expert: this.name,
                name: '🚶 Active Recovery',
                description: 'Light movement to reduce soreness',
                urgency: 50,
                impact: 65,
                duration_minutes: 30,
                rationale: `Muscle soreness at ${soreness}/10 - active recovery accelerates healing`,
                protocol: 'Light walk, easy swimming, or gentle yoga. Keep HR under 120bpm.'
            });
        }

        // =========== MODALITIES ===========

        // Cold exposure (if recovery is moderate-low)
        if (recoveryScore < 70 && recoveryScore >= 40 && hour >= 10 && hour <= 18) {
            recommendations.push({
                id: 'recovery_cold',
                expert: this.name,
                name: '🧊 Cold Exposure',
                description: 'Reduce inflammation and boost recovery',
                urgency: 45,
                impact: 70,
                duration_minutes: 10,
                rationale: 'Cold exposure reduces inflammation and improves mood',
                protocol: 'Cold shower 2-3min or ice bath 5-10min at 10-15°C'
            });
        }

        // Sauna (if not too close to bed)
        if (recoveryScore >= 50 && hour >= 14 && hour <= 19) {
            recommendations.push({
                id: 'recovery_heat',
                expert: this.name,
                name: '♨️ Heat Therapy',
                description: 'Sauna or hot bath for recovery',
                urgency: 35,
                impact: 60,
                duration_minutes: 20,
                rationale: 'Heat therapy increases blood flow and relaxation',
                protocol: 'Sauna 15-20min at 80-90°C. Hydrate well before and after.'
            });
        }

        // =========== HRV ALERTS ===========

        const hrvTrend = recovery?.hrv_trend;
        if (hrvTrend === 'declining' || hrvTrend === 'low') {
            recommendations.push({
                id: 'recovery_hrv_alert',
                expert: this.name,
                name: '📉 HRV Alert',
                description: 'Heart rate variability below baseline',
                urgency: 70,
                impact: 85,
                duration_minutes: 0, // Awareness
                rationale: 'Low HRV indicates accumulated stress or fatigue',
                protocol: 'Reduce training intensity. Prioritize sleep. Consider rest day tomorrow.'
            });
        }

        return recommendations;
    }

    // =====================================================
    // HANDOFF: Receive info from other experts
    // =====================================================

    receiveHandoff(handoff: HandoffData): ActionCandidate[] {
        const recommendations: ActionCandidate[] = [];

        // Performance coach detected overreaching
        if (handoff.from_expert === 'performance' && handoff.data?.acwr > 1.5) {
            recommendations.push({
                id: 'recovery_overreach_response',
                expert: this.name,
                name: '⚠️ Overreaching Alert',
                description: 'Training load spike detected - recovery priority',
                urgency: 80,
                impact: 90,
                duration_minutes: 0,
                rationale: `ACWR at ${handoff.data.acwr} - injury risk elevated`,
                protocol: 'Reduce training volume 30-40%. Extra sleep. Recovery modalities.'
            });
        }

        // Mental coach detected high stress
        if (handoff.from_expert === 'mental' && handoff.data?.stress > 7) {
            recommendations.push({
                id: 'recovery_stress_response',
                expert: this.name,
                name: '🧘 Stress-Recovery Protocol',
                description: 'High mental stress affecting recovery',
                urgency: 70,
                impact: 75,
                duration_minutes: 15,
                rationale: 'Psychological stress impairs physical recovery',
                protocol: 'Breathwork session. Light stretching. Nature walk if possible.'
            });
        }

        return recommendations;
    }

    // =====================================================
    // PRIORITY: How important is recovery right now?
    // =====================================================

    getPriorityWeight(state: GlobalState, profile: UserProfile): number {
        const analysis = this.analyze(state, profile);

        // Base weight
        let weight = 0.25; // 25% base

        // If recovery is critical, it becomes top priority
        if (analysis.score < 40) {
            weight = 0.50; // Half of all priority
        } else if (analysis.score < 60) {
            weight = 0.40;
        } else if (analysis.score < 80) {
            weight = 0.30;
        }

        // HRV trending down increases priority
        const hrvTrend = state.recovery?.hrv_trend;
        if (hrvTrend === 'declining' || hrvTrend === 'low') {
            weight += 0.10;
        }

        // Poor sleep increases priority
        const sleepQuality = state.sleep?.quality ?? 80;
        if (sleepQuality < 60) {
            weight += 0.05;
        }

        return Math.min(weight, 0.55); // Cap at 55%
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

    // =====================================================
    // FORM OPINION: The "Sentient" output
    // =====================================================

    formOpinion(
        state: GlobalState,
        profile: UserProfile,
        context: ExpertContext
    ): ExpertOpinion {
        const analysis = this.analyze(state, profile);
        const recommendations = this.getRecommendations(state, profile, context);

        // Default to the highest urgency recommendation
        let primaryAction = recommendations.sort((a, b) => b.urgency - a.urgency)[0];

        if (!primaryAction) {
            primaryAction = {
                id: 'recovery_monitor',
                expert: this.name,
                name: '📉 HRV Monitoring',
                description: 'Passive recovery monitoring',
                urgency: 20,
                impact: 20,
                duration_minutes: 0,
                rationale: 'Monitoring baseline',
                time_window: { start: new Date(), end: new Date() }
            };
        }

        const opinion: ExpertOpinion = {
            expert_name: this.name,
            primary_action: primaryAction,
            urgency: primaryAction.urgency,
            reasoning: primaryAction.rationale,
            constraints: [],
            compromise_options: []
        };

        // ===========================================
        // CHAOS LOGIC: Protecting Sleep
        // ===========================================
        const hour = context.current_hour;
        const bedHour = parseInt(context.bed_time.split(':')[0]);

        // If it's close to bed, Recovery Expert becomes defensive about digestion
        if (hour >= bedHour - 3) {
            opinion.constraints.push("digestive_load_risk");

            // If the primary action isn't already about wind-down, we push a constraint opinion
            if (opinion.urgency < 50) {
                opinion.urgency = 75;
                opinion.reasoning = "Approaching sleep window. Digestion must be minimized for GH release.";
                // We don't propose an action here, we just set the constraint high
                // This tells the Orchestrator "I will fight high-load actions"
            }
        }

        return opinion;
    }
}

// Export singleton
export const recoveryExpert = new RecoveryExpert();
