/**
 * DOCTOR EXPERT (Medical Advisor)
 * 
 * The unified medical intelligence.
 * Uses: Biomarker analysis, health predictions, supplement recommendations
 * Acts as safety layer and hands off to other experts when needed.
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
// DOCTOR EXPERT
// =====================================================

export class DoctorExpert implements Expert {
    readonly name = "Medical Advisor";
    readonly domain = "doctor";
    readonly emoji = "👨‍⚕️";

    // =====================================================
    // ANALYZE
    // =====================================================

    analyze(state: GlobalState, profile: UserProfile): ExpertAnalysis {
        const concerns: string[] = [];
        const opportunities: string[] = [];

        // Check biomarkers if available
        const biomarkers = (state as any).biomarkers;

        // Inflammation markers
        if (biomarkers?.crp > 3) {
            concerns.push("Elevated CRP - inflammation detected");
        }

        // Vitamin levels
        if (biomarkers?.vitamin_d < 30) {
            concerns.push("Low Vitamin D - supplementation recommended");
        }
        if (biomarkers?.b12 < 300) {
            concerns.push("Low B12 - dietary intervention needed");
        }

        // Iron levels
        if (biomarkers?.ferritin < 50) {
            concerns.push("Low ferritin - iron levels suboptimal");
        }

        // Check for concerning patterns
        const recovery = state.recovery?.recovery_score ?? 80;
        if (recovery < 40 && !biomarkers) {
            concerns.push("Persistent low recovery - consider bloodwork");
        }

        // Opportunities
        if (!biomarkers || !biomarkers.last_check) {
            opportunities.push("Schedule bloodwork for full picture");
        }

        // Overall health score
        let score = 80;
        score -= concerns.length * 10;

        // Get scientific status classification
        const finalScore = Math.max(0, Math.min(100, score));
        const statusResult = StatusClassificationEngine.classifyScore(finalScore, 'health');

        return {
            domain: this.domain,
            current_state: concerns.length === 0 ? "No health concerns detected" :
                concerns.length <= 2 ? "Minor health optimization possible" :
                    "Health markers need attention",
            score: finalScore,
            status: statusResult.status,
            statusResult,
            concerns,
            opportunities
        };
    }

    // =====================================================
    // RECOMMENDATIONS
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
                    id: 'doctor_maintenance',
                    expert: this.name,
                    name: 'Medical Check Normal',
                    description: 'No immediate medical actions',
                    urgency: 0,
                    impact: 0,
                    duration_minutes: 0,
                    rationale: 'Health markers acceptable'
                },
                urgency: 0,
                reasoning: 'No medical concerns detected.',
                constraints: []
            };
        }

        return {
            expert_name: this.name,
            primary_action: primary,
            urgency: primary.urgency,
            reasoning: analysis.concerns.length > 0 ? analysis.concerns[0] : 'Health optimization',
            constraints: [],
            compromise_options: candidates.slice(1).map(c => ({
                ...c,
                compromise_reason: 'Alternative intervention',
                trade_off: 'Less targeted'
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

        const biomarkers = (state as any).biomarkers;

        // Low Vitamin D
        if (biomarkers?.vitamin_d < 30) {
            recommendations.push({
                id: 'doctor_vitamin_d',
                expert: this.name,
                name: '☀️ Vitamin D Protocol',
                description: 'Low vitamin D detected',
                urgency: 60,
                impact: 75,
                duration_minutes: 0,
                rationale: `Vitamin D at ${biomarkers.vitamin_d}ng/ml - optimal is 50-80`,
                protocol: 'Supplement 4000-5000 IU Vitamin D3 daily with fat. Get sunlight.'
            });
        }

        // Low B12
        if (biomarkers?.b12 < 300) {
            recommendations.push({
                id: 'doctor_b12',
                expert: this.name,
                name: '🥩 B12 Intervention',
                description: 'Low B12 affects energy and cognition',
                urgency: 65,
                impact: 70,
                duration_minutes: 0,
                rationale: `B12 at ${biomarkers.b12}pg/ml - optimal is >500`,
                protocol: 'Increase red meat, eggs, dairy. Consider methylcobalamin supplement.'
            });
        }

        // High inflammation
        if (biomarkers?.crp > 3) {
            recommendations.push({
                id: 'doctor_inflammation',
                expert: this.name,
                name: '🔥 Inflammation Alert',
                description: 'Elevated inflammatory markers',
                urgency: 75,
                impact: 85,
                duration_minutes: 0,
                rationale: `CRP at ${biomarkers.crp}mg/L - should be <1`,
                protocol: 'Anti-inflammatory diet, omega-3s, reduce sugar/alcohol, check for infection.'
            });
        }

        // Low ferritin
        if (biomarkers?.ferritin < 50) {
            recommendations.push({
                id: 'doctor_iron',
                expert: this.name,
                name: '🩸 Iron Optimization',
                description: 'Ferritin levels suboptimal',
                urgency: 55,
                impact: 65,
                duration_minutes: 0,
                rationale: `Ferritin at ${biomarkers.ferritin}ng/ml - optimal is 100+`,
                protocol: 'Iron-rich foods with vitamin C. Consider iron supplement if <30.'
            });
        }

        // General bloodwork reminder
        const lastCheck = biomarkers?.last_check ?
            Math.floor((Date.now() - new Date(biomarkers.last_check).getTime()) / (1000 * 60 * 60 * 24)) : 180;
        if (lastCheck > 90) {
            recommendations.push({
                id: 'doctor_bloodwork',
                expert: this.name,
                name: '🩺 Schedule Bloodwork',
                description: 'Regular testing optimizes health',
                urgency: 35,
                impact: 70,
                duration_minutes: 0,
                rationale: `${lastCheck} days since last check - quarterly is ideal`,
                protocol: 'Full panel: CBC, CMP, lipids, hormones, vitamins, inflammatory markers.'
            });
        }

        return recommendations;
    }

    // =====================================================
    // HANDOFF
    // =====================================================

    receiveHandoff(handoff: HandoffData): ActionCandidate[] {
        const recommendations: ActionCandidate[] = [];

        // Any expert detecting persistent issues
        if (handoff.data?.persistent_issue) {
            recommendations.push({
                id: 'doctor_investigate',
                expert: this.name,
                name: '🔬 Medical Investigation',
                description: 'Persistent issue reported by system',
                urgency: 70,
                impact: 80,
                duration_minutes: 0,
                rationale: `${handoff.from_expert} detected persistent ${handoff.data.issue}`,
                protocol: 'Schedule appointment with physician for evaluation.'
            });
        }

        return recommendations;
    }

    // =====================================================
    // PRIORITY
    // =====================================================

    getPriorityWeight(state: GlobalState, profile: UserProfile): number {
        const analysis = this.analyze(state, profile);

        // Doctor is normally background
        let weight = 0.10;

        // But if health concerns exist, priority increases
        if (analysis.concerns.length > 2) {
            weight = 0.30;
        } else if (analysis.concerns.length > 0) {
            weight = 0.20;
        }

        return weight;
    }
}

// Export singleton
export const doctorExpert = new DoctorExpert();
