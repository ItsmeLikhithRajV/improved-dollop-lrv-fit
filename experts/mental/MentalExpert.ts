/**
 * MENTAL EXPERT (Mental Coach)
 * 
 * The unified psychological intelligence.
 * Uses: Breathwork, emotion regulation, motivation, cognitive testing, competition prep
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
// MENTAL EXPERT
// =====================================================

export class MentalExpert implements Expert {
    readonly name = "Mental Coach";
    readonly domain = "mental";
    readonly emoji = "🧠";

    // =====================================================
    // ANALYZE: Internal reasoning
    // =====================================================

    analyze(state: GlobalState, profile: UserProfile): ExpertAnalysis {
        const mindspace = state.mindspace;
        const concerns: string[] = [];
        const opportunities: string[] = [];

        // Stress analysis
        const stressLevel = (mindspace as any)?.stress_level ?? 50;
        if (stressLevel > 70) {
            concerns.push("High stress detected - intervention needed");
        } else if (stressLevel > 50) {
            concerns.push("Moderate stress - consider stress management");
        }

        // Focus analysis
        const attentionalStability = mindspace?.state_vector?.attentional_stability ?? 70;
        if (attentionalStability < 50) {
            concerns.push("Low focus - cognitive performance impaired");
        }

        // Mood analysis
        const valence = mindspace?.state_vector?.emotional_valence ?? 0;
        if (valence < -0.3) {
            concerns.push("Low mood detected");
        }

        // Energy analysis
        const arousal = mindspace?.state_vector?.arousal ?? 0.5;
        if (arousal < 0.3) {
            concerns.push("Low mental energy");
        }

        // Opportunities
        const hour = new Date().getHours();
        if (hour >= 6 && hour <= 9) {
            opportunities.push("Morning - optimal for intention setting");
        }
        if (hour >= 14 && hour <= 16) {
            opportunities.push("Afternoon dip - good time for breathwork");
        }
        if (hour >= 20 && hour <= 22) {
            opportunities.push("Evening - reflection and gratitude time");
        }

        // Calculate score
        let score = 80;
        score -= stressLevel > 50 ? (stressLevel - 50) * 0.5 : 0;
        score -= attentionalStability < 70 ? (70 - attentionalStability) * 0.3 : 0;
        score = Math.max(0, Math.min(100, score));

        // Get scientific status classification based on stress
        const statusResult = StatusClassificationEngine.classifyStress(stressLevel);

        return {
            domain: this.domain,
            current_state: stressLevel > 60 ? "High stress - needs intervention" :
                attentionalStability < 50 ? "Low focus - support needed" :
                    "Mental state balanced",
            score,
            status: statusResult.status,
            statusResult,
            concerns,
            opportunities
        };
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
                    id: 'mental_maintenance',
                    expert: this.name,
                    name: 'Maintain Balance',
                    description: 'State vector within optimal range',
                    urgency: 0,
                    impact: 0,
                    duration_minutes: 0,
                    rationale: 'No intervention required'
                },
                urgency: 0,
                reasoning: 'Mental state stable.',
                constraints: []
            };
        }

        return {
            expert_name: this.name,
            primary_action: primary,
            urgency: primary.urgency,
            reasoning: analysis.concerns.length > 0 ? analysis.concerns[0] : 'Optimize mental state',
            constraints: [],
            compromise_options: candidates.slice(1).map(c => ({
                ...c,
                compromise_reason: 'Lower impact intervention',
                trade_off: 'Less effective for acute state adjustment'
            }))
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

        const stressLevel = (state.mindspace as any)?.stress_level ?? 50;
        const attentionalStability = state.mindspace?.state_vector?.attentional_stability ?? 70;

        // Morning intention setting
        const wakeHour = parseInt(context.wake_time.split(':')[0]);
        if (hour >= wakeHour && hour <= wakeHour + 1) {
            recommendations.push({
                id: 'mental_intention',
                expert: this.name,
                name: '🎯 Morning Intention',
                description: 'Set your focus for the day',
                urgency: 55,
                impact: 70,
                duration_minutes: 5,
                rationale: 'Starting with intention improves daily focus and achievement',
                protocol: 'Write 1-3 intentions for today. Be specific and achievable.'
            });
        }

        // High stress intervention
        if (stressLevel > 60) {
            recommendations.push({
                id: 'mental_stress_relief',
                expert: this.name,
                name: '😮‍💨 Stress Relief Breathwork',
                description: 'Reduce stress with controlled breathing',
                urgency: Math.min(stressLevel + 10, 95),
                impact: 85,
                duration_minutes: 5,
                rationale: `Stress at ${stressLevel}% - parasympathetic activation needed`,
                protocol: 'Box breathing: Inhale 4s, Hold 4s, Exhale 4s, Hold 4s. 10 cycles.'
            });
        }

        // Low focus intervention
        if (attentionalStability < 50 && hour >= 9 && hour <= 17) {
            recommendations.push({
                id: 'mental_focus_boost',
                expert: this.name,
                name: '🎯 Focus Recovery',
                description: 'Quick technique to restore attention',
                urgency: 65,
                impact: 75,
                duration_minutes: 10,
                rationale: `Attentional stability at ${attentionalStability}% - performance impaired`,
                protocol: 'Cold water on face, 5min walk, then 25min focused work block.'
            });
        }

        // Afternoon breathwork
        if (hour >= 14 && hour <= 16 && stressLevel > 40) {
            recommendations.push({
                id: 'mental_afternoon_reset',
                expert: this.name,
                name: '🌬️ Afternoon Reset',
                description: 'Combat afternoon energy dip',
                urgency: 45,
                impact: 65,
                duration_minutes: 5,
                rationale: 'Cortisol naturally dips 2-4pm, breathwork helps maintain energy',
                protocol: 'Energizing breath: 30 quick breaths, hold, repeat 3x.'
            });
        }

        // Pre-training visualization (if training coming)
        const trainingHour = context.training_time
            ? parseInt(context.training_time.split(':')[0])
            : null;
        if (trainingHour && hour >= trainingHour - 1 && hour < trainingHour) {
            recommendations.push({
                id: 'mental_pre_training',
                expert: this.name,
                name: '🧠 Pre-Training Visualization',
                description: 'Mental preparation for optimal performance',
                urgency: 50,
                impact: 70,
                duration_minutes: 5,
                rationale: 'Visualization activates motor patterns and reduces anxiety',
                protocol: 'Close eyes. Visualize perfect form, energy, strength. 3-5 minutes.'
            });
        }

        // Evening gratitude
        const bedHour = parseInt(context.bed_time.split(':')[0]);
        if (hour >= bedHour - 2 && hour < bedHour) {
            recommendations.push({
                id: 'mental_gratitude',
                expert: this.name,
                name: '🙏 Evening Gratitude',
                description: 'Shift to positive state before sleep',
                urgency: 40,
                impact: 65,
                duration_minutes: 5,
                rationale: 'Gratitude improves sleep quality and next-day mood',
                protocol: 'Write or think of 3 things you\'re grateful for today.'
            });
        }

        return recommendations;
    }

    // =====================================================
    // HANDOFF
    // =====================================================

    receiveHandoff(handoff: HandoffData): ActionCandidate[] {
        const recommendations: ActionCandidate[] = [];

        // Recovery says poor sleep
        if (handoff.from_expert === 'recovery' && handoff.data?.sleep_quality < 60) {
            recommendations.push({
                id: 'mental_sleep_support',
                expert: this.name,
                name: '😴 Sleep Anxiety Protocol',
                description: 'Mental techniques for better sleep',
                urgency: 60,
                impact: 70,
                duration_minutes: 10,
                rationale: 'Poor sleep often has mental components',
                protocol: 'Body scan meditation, cognitive shuffling, or 4-7-8 breathing.'
            });
        }

        // Performance says competition coming
        if (handoff.from_expert === 'performance' && handoff.data?.competition_soon) {
            recommendations.push({
                id: 'mental_competition_prep',
                expert: this.name,
                name: '🏆 Competition Mental Prep',
                description: 'Psychological readiness for performance',
                urgency: 70,
                impact: 85,
                duration_minutes: 15,
                rationale: 'Mental state is key differentiator in competition',
                protocol: 'Visualization, anxiety reframing, cue word activation.'
            });
        }

        return recommendations;
    }

    // =====================================================
    // PRIORITY
    // =====================================================

    getPriorityWeight(state: GlobalState, profile: UserProfile): number {
        const analysis = this.analyze(state, profile);

        let weight = 0.15; // 15% base

        // High stress = mental becomes priority
        const stressLevel = (state.mindspace as any)?.stress_level ?? 50;
        if (stressLevel > 70) {
            weight = 0.35;
        } else if (stressLevel > 50) {
            weight = 0.25;
        }

        // Low focus = mental more important
        const focus = state.mindspace?.state_vector?.attentional_stability ?? 70;
        if (focus < 50) {
            weight += 0.10;
        }

        return Math.min(weight, 0.40);
    }
}

// Export singleton
export const mentalExpert = new MentalExpert();
