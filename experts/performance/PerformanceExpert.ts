/**
 * PERFORMANCE EXPERT (Athletic Coach)
 * 
 * The unified performance/training intelligence.
 * Uses: Load management, periodization, ACWR, red day detection, session planning
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
// PERFORMANCE EXPERT
// =====================================================

export class PerformanceExpert implements Expert {
    readonly name = "Performance Coach";
    readonly domain = "performance";
    readonly emoji = "🏋️";

    // =====================================================
    // ANALYZE: Internal reasoning
    // =====================================================

    analyze(state: GlobalState, profile: UserProfile): ExpertAnalysis {
        const concerns: string[] = [];
        const opportunities: string[] = [];

        // Get training load data
        const physicalLoad = state.physical_load;
        const sessions = state.timeline?.sessions || [];

        // ACWR analysis
        const acwr = (physicalLoad as any)?.acwr ?? 1.0;
        if (acwr > 1.5) {
            concerns.push("ACWR spike - injury risk elevated");
        } else if (acwr > 1.3) {
            concerns.push("Training load increasing rapidly - monitor closely");
        } else if (acwr < 0.8) {
            concerns.push("Training load low - detraining possible");
        }

        // Check for red day signals
        const recovery = state.recovery?.recovery_score ?? 80;
        if (recovery < 40) {
            concerns.push("Recovery critical - training contraindicated");
        } else if (recovery < 60) {
            concerns.push("Recovery suboptimal - reduce intensity");
        }

        // Training today?
        const todaySession = sessions.find(s => s.time_of_day);
        if (todaySession) {
            opportunities.push(`Training scheduled: ${todaySession.title}`);
        } else {
            opportunities.push("No training scheduled - active recovery day");
        }

        // Optimal windows
        const hour = new Date().getHours();
        if (hour >= 9 && hour <= 11) {
            opportunities.push("Morning window - good for strength work");
        } else if (hour >= 15 && hour <= 18) {
            opportunities.push("Afternoon window - optimal body temperature for performance");
        }

        // Calculate score based on readiness
        let score = recovery; // Performance readiness linked to recovery
        if (acwr > 1.5) score -= 15;
        if (acwr > 1.3) score -= 10;

        // Get scientific status classification based on ACWR
        const statusResult = StatusClassificationEngine.classifyACWR(acwr);

        return {
            domain: this.domain,
            current_state: recovery >= 80 ? "Ready for high performance" :
                recovery >= 60 ? "Moderate training OK" :
                    recovery >= 40 ? "Light training only" :
                        "Rest day - no training",
            score: Math.max(0, Math.min(100, score)),
            status: statusResult.status,
            statusResult,
            concerns,
            opportunities
        };
    }

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
                    id: 'performance_maintain',
                    expert: this.name,
                    name: 'Continue Training Plan',
                    description: 'Follow scheduled programming',
                    urgency: 0,
                    impact: 0,
                    duration_minutes: 0,
                    rationale: 'No deviations needed'
                },
                urgency: 0,
                reasoning: 'Plan is on track.',
                constraints: []
            };
        }

        return {
            expert_name: this.name,
            primary_action: primary,
            urgency: primary.urgency,
            reasoning: analysis.concerns.length > 0
                ? `Performance Risk: ${analysis.concerns[0]}`
                : `Performance Opportunity: ${analysis.opportunities[0] || 'Optimize training'}`,
            constraints: [],
            compromise_options: candidates.slice(1).map(c => ({
                ...c,
                compromise_reason: 'Lower impact alternative',
                trade_off: 'Less optimal stimulus'
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
        const analysis = this.analyze(state, profile);
        const hour = context.current_hour;

        const sessions = state.timeline?.sessions || [];
        const todaySession = sessions.find(s => s.time_of_day);
        const recovery = context.recovery_score;

        // Training scheduled today
        if (todaySession) {
            const trainingHour = parseInt(todaySession.time_of_day?.split(':')[0] || '0');

            // Upcoming training reminder
            if (hour >= trainingHour - 1 && hour < trainingHour) {
                recommendations.push({
                    id: 'performance_upcoming',
                    expert: this.name,
                    name: `💪 ${todaySession.title}`,
                    description: 'Training session coming up',
                    urgency: 80,
                    impact: 90,
                    time_window: {
                        start: this.timeToDate(trainingHour),
                        end: this.timeToDate(trainingHour + 1.5)
                    },
                    duration_minutes: (todaySession as any).duration_minutes || 60,
                    rationale: `Session scheduled at ${todaySession.time_of_day}`,
                    protocol: 'Warm up properly. Execute planned session.'
                });
            }

            // Intensity adjustment based on recovery
            if (recovery < 60 && hour < trainingHour) {
                recommendations.push({
                    id: 'performance_adjust_intensity',
                    expert: this.name,
                    name: '⚠️ Reduce Intensity',
                    description: 'Recovery suggests lighter session',
                    urgency: 70,
                    impact: 80,
                    duration_minutes: 0,
                    rationale: `Recovery at ${recovery}% - max intensity not advised`,
                    protocol: 'Reduce volume 20-30% or swap to technique/skill work.'
                });
            }
        }

        // No training but recovery is high
        if (!todaySession && recovery >= 80 && hour >= 9 && hour <= 18) {
            recommendations.push({
                id: 'performance_capacity_available',
                expert: this.name,
                name: '🎯 Training Capacity Available',
                description: 'High recovery - could add a session',
                urgency: 40,
                impact: 60,
                duration_minutes: 0,
                rationale: `Recovery at ${recovery}% - capacity for training exists`,
                protocol: 'Consider light skill work or active session if desired.'
            });
        }

        // Red day - no training
        if (recovery < 40) {
            recommendations.push({
                id: 'performance_rest_day',
                expert: this.name,
                name: '🛑 Mandatory Rest Day',
                description: 'Skip training today',
                urgency: 95,
                impact: 95,
                duration_minutes: 0,
                rationale: `Recovery at ${recovery}% - training would be counterproductive`,
                protocol: 'Complete rest or light walking only. Focus on nutrition and sleep.'
            });
        }

        // Warm-up reminder before training
        if (todaySession && context.training_time) {
            const trainingHour = parseInt(context.training_time.split(':')[0]);
            if (hour >= trainingHour - 0.5 && hour < trainingHour) {
                recommendations.push({
                    id: 'performance_warmup',
                    expert: this.name,
                    name: '🔥 Warm-Up Time',
                    description: 'Prepare body for training',
                    urgency: 75,
                    impact: 80,
                    duration_minutes: 15,
                    rationale: 'Proper warm-up reduces injury risk and improves performance',
                    protocol: '5min light cardio, dynamic stretches, activation drills.'
                });
            }
        }

        return recommendations;
    }

    // =====================================================
    // HANDOFF
    // =====================================================

    receiveHandoff(handoff: HandoffData): ActionCandidate[] {
        const recommendations: ActionCandidate[] = [];

        // Doctor detected injury risk markers
        if (handoff.from_expert === 'doctor' && handoff.data?.injury_risk) {
            recommendations.push({
                id: 'performance_injury_response',
                expert: this.name,
                name: '⚠️ Modify Training',
                description: 'Injury risk markers detected',
                urgency: 85,
                impact: 90,
                duration_minutes: 0,
                rationale: 'Biomarkers suggest elevated injury risk',
                protocol: 'Reduce load 30-50%, focus on mobility and recovery.'
            });
        }

        // Recovery expert says overreaching
        if (handoff.from_expert === 'recovery' && handoff.data?.hrv === 'declining') {
            recommendations.push({
                id: 'performance_deload',
                expert: this.name,
                name: '📉 Deload Week Suggested',
                description: 'HRV trending down - reduce training',
                urgency: 75,
                impact: 85,
                duration_minutes: 0,
                rationale: 'Sustained HRV decline indicates accumulated fatigue',
                protocol: 'Reduce volume 40-50% this week. Maintain intensity on key lifts.'
            });
        }

        return recommendations;
    }

    // =====================================================
    // PRIORITY
    // =====================================================

    getPriorityWeight(state: GlobalState, profile: UserProfile): number {
        let weight = 0.20; // 20% base

        // Training day = performance more important
        const sessions = state.timeline?.sessions || [];
        if (sessions.length > 0) {
            weight = 0.30;
        }

        // Athlete goal
        const goal = String(profile?.user_goal || '');
        if (goal.includes('performance') || goal.includes('athlete') || goal.includes('competition')) {
            weight += 0.15;
        }

        // ACWR issues increase importance
        const acwr = (state.physical_load as any)?.acwr ?? 1.0;
        if (acwr > 1.3 || acwr < 0.8) {
            weight += 0.10;
        }

        return Math.min(weight, 0.45);
    }

    private timeToDate(hour: number): Date {
        const now = new Date();
        const date = new Date(now);
        date.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0);
        return date;
    }
}

// Export singleton
export const performanceExpert = new PerformanceExpert();
