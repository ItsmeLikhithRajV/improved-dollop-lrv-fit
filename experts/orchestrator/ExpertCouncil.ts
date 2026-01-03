/**
 * EXPERT COUNCIL ORCHESTRATOR
 * 
 * The central brain that:
 * 1. Consults all experts
 * 2. Gathers recommendations
 * 3. Resolves conflicts
 * 4. Produces unified timeline
 */

import { GlobalState, UserProfile } from "../../types";
import {
    Expert,
    ActionCandidate,
    ExpertContext,
    ExpertAnalysis,
    createExpertContext,
    ExpertOpinion,
    CompromiseOption
} from "../types";

// Import all experts
import { nutritionistExpert } from "../nutritionist/NutritionistExpert";
import { recoveryExpert } from "../recovery/RecoveryExpert";
import { longevityExpert } from "../longevity/LongevityExpert";
import { mentalExpert } from "../mental/MentalExpert";
import { performanceExpert } from "../performance/PerformanceExpert";
import { doctorExpert } from "../doctor/DoctorExpert";

// =====================================================
// EXPERT COUNCIL
// =====================================================

export interface CouncilRecommendation extends ActionCandidate {
    expert_emoji: string;
    priority_score: number;  // Calculated based on urgency, impact, and expert weight
}

export interface UnifiedTimeline {
    date: Date;
    user_state: {
        [domain: string]: ExpertAnalysis;
    };
    recommendations: CouncilRecommendation[];
    today_focus: string;
    expert_weights: {
        [expert: string]: number;
    };
}

export class ExpertCouncil {
    private experts: Expert[] = [
        nutritionistExpert,
        recoveryExpert,
        longevityExpert,
        mentalExpert,
        performanceExpert,
        doctorExpert
    ];

    // =====================================================
    // CONVENE COUNCIL
    // =====================================================

    convene(state: GlobalState, profile: UserProfile): UnifiedTimeline {
        const context = createExpertContext(state, profile);

        // 1. Gather analyses and weights
        const analyses: { [domain: string]: ExpertAnalysis } = {};
        const weights: { [expert: string]: number } = {};

        for (const expert of this.experts) {
            analyses[expert.domain] = expert.analyze(state, profile);
            weights[expert.name] = expert.getPriorityWeight(state, profile);
        }

        // 2. Gather EXPERT OPINIONS (The Council)
        // Instead of just recommendations, we get their unified "vote"
        const opinions: ExpertOpinion[] = [];

        for (const expert of this.experts) {
            try {
                const opinion = expert.formOpinion(state, profile, context);
                opinions.push(opinion);
            } catch (e) {
                console.error(`Expert ${expert.name} failed to form opinion:`, e);
            }
        }

        // 3. Resolve Constraints & Conflicts (The Negotiation)
        const resolvedOps = this.negotiateOpinions(opinions, weights);

        // 4. Convert resolved opinions to CouncilRecommendations
        let allRecommendations: CouncilRecommendation[] = resolvedOps.map(op => {
            const action = op.primary_action; // This might be the compromise action after negotiation
            const weight = weights[op.expert_name] || 0.2;

            return {
                ...action,
                expert_emoji: this.getExpertEmoji(op.expert_name),
                priority_score: this.calculatePriority(action, weight)
            };
        });

        // 5. Filter inappropriate (Final safety check)
        allRecommendations = this.filterInappropriate(allRecommendations, context);

        // 6. Sort by priority
        allRecommendations.sort((a, b) => b.priority_score - a.priority_score);

        // 7. Determine today's focus
        const todayFocus = this.determineFocus(analyses, weights);

        return {
            date: new Date(),
            user_state: analyses,
            recommendations: allRecommendations,
            today_focus: todayFocus,
            expert_weights: weights
        };
    }

    private getExpertEmoji(name: string): string {
        const expert = this.experts.find(e => e.name === name);
        return expert ? expert.emoji : '🤖';
    }

    // =====================================================
    // NEGOTIATION LOGIC
    // =====================================================

    private negotiateOpinions(opinions: ExpertOpinion[], weights: { [name: string]: number }): ExpertOpinion[] {
        // Collect all active constraints from all experts
        const activeConstraints = new Set<string>();
        opinions.forEach(op => {
            if (op.urgency > 0) { // Only consider constraints from active opinions
                op.constraints.forEach(c => activeConstraints.add(c));
            }
        });

        const negotiated: ExpertOpinion[] = [];

        for (const op of opinions) {
            // If opinion has no action (maintenance), skip
            if (op.primary_action.impact === 0) continue;

            let finalAction = op.primary_action;
            let finalReasoning = op.reasoning;

            // Check if this action violates any active constraints
            // Example: "digestive_load_risk" vs Eating
            const violatesDigestive = activeConstraints.has("digestive_load_risk") &&
                (op.primary_action.id.includes("meal") || op.primary_action.id.includes("breakfast"));

            // Example: "injury_risk" vs Training
            const violatesInjury = activeConstraints.has("injury_risk") &&
                op.primary_action.id.includes("training");

            if (violatesDigestive || violatesInjury) {
                // VIOLATION DETECTED
                // Check if we have a compromise option
                if (op.compromise_options && op.compromise_options.length > 0) {
                    // Find best compromise
                    // For digestive, we want liquids or light
                    // For now, simpler logic: take the first compromise
                    const compromise = op.compromise_options[0];

                    // Downgrade to compromise
                    finalAction = {
                        ...compromise,
                        // Copy base action props if needed, but compromise usually has them
                        name: `(Compromise) ${compromise.name}`,
                        rationale: `${compromise.rationale}. Adjusted due to Council constraints.`
                    };
                    finalReasoning += ` (Downgraded due to constraints)`;
                } else {
                    // No compromise? If violation is strict, maybe drop it?
                    // For now, reduce urgency drastically
                    finalAction.urgency = Math.max(0, finalAction.urgency - 50);
                }
            }

            negotiated.push({
                ...op,
                primary_action: finalAction,
                reasoning: finalReasoning
            });
        }

        // Re-check for direct time conflicts (e.g. two actions at same time)
        // Similar to old resolveConflicts but on opinions
        // (Simplified for now - relying on priority sorting in main loop)

        return negotiated;
    }

    // =====================================================
    // PRIORITY CALCULATION
    // =====================================================

    private calculatePriority(rec: ActionCandidate, expertWeight: number): number {
        // Priority = (urgency * 0.4 + impact * 0.4) * expertWeight + time_relevance * 0.2
        const baseScore = rec.urgency * 0.4 + rec.impact * 0.4;
        const weightedScore = baseScore * (1 + expertWeight);  // Expert weight boosts score

        // Time relevance bonus - if recommendation has a time window and we're in it
        let timeBonus = 0;
        if (rec.time_window) {
            const now = new Date();
            if (now >= rec.time_window.start && now <= rec.time_window.end) {
                timeBonus = 20;  // +20 if currently in window
            }
        }

        return weightedScore + timeBonus;
    }

    // =====================================================
    // FILTER INAPPROPRIATE
    // =====================================================

    private filterInappropriate(
        recs: CouncilRecommendation[],
        context: ExpertContext
    ): CouncilRecommendation[] {
        const hour = context.current_hour;
        const wakeHour = parseInt(context.wake_time.split(':')[0]);
        const bedHour = parseInt(context.bed_time.split(':')[0]);

        return recs.filter(rec => {
            // No activities during sleep hours (unless urgent)
            if ((hour < wakeHour - 1 || hour > bedHour + 1) && rec.urgency < 90) {
                // Allow only high urgency during sleep
                return false;
            }

            // No caffeine after cutoff (already handled by experts, but double check)
            if (rec.id.includes('caffeine') && hour > 16) {
                return false;
            }

            // No intense training on red days
            if (context.recovery_score < 40 && rec.id.includes('training') && rec.urgency < 85) {
                // Only allow if it's a "cancel training" recommendation
                return rec.id.includes('rest') || rec.id.includes('cancel');
            }

            return true;
        });
    }

    // =====================================================
    // CONFLICT RESOLUTION
    // =====================================================

    private resolveConflicts(recs: CouncilRecommendation[]): CouncilRecommendation[] {
        // Group by time window overlaps
        const resolved: CouncilRecommendation[] = [];
        const processedIds = new Set<string>();

        for (const rec of recs) {
            if (processedIds.has(rec.id)) continue;

            // Find overlapping recommendations
            const overlapping = recs.filter(other => {
                if (other.id === rec.id) return false;
                if (!rec.time_window || !other.time_window) return false;

                // Check overlap
                return rec.time_window.start < other.time_window.end &&
                    rec.time_window.end > other.time_window.start;
            });

            if (overlapping.length === 0) {
                resolved.push(rec);
            } else {
                // Keep highest priority among overlapping
                const candidates = [rec, ...overlapping];
                candidates.sort((a, b) => b.priority_score - a.priority_score);

                // Keep top one, mark others as processed
                resolved.push(candidates[0]);
                for (const c of candidates) {
                    processedIds.add(c.id);
                }
            }

            processedIds.add(rec.id);
        }

        return resolved;
    }

    // =====================================================
    // DETERMINE TODAY'S FOCUS
    // =====================================================

    private determineFocus(
        analyses: { [domain: string]: ExpertAnalysis },
        weights: { [expert: string]: number }
    ): string {
        // Find domain with most concerns or lowest score
        let lowestScore = 100;
        let focusDomain = 'general';
        let focusConcerns: string[] = [];

        for (const [domain, analysis] of Object.entries(analyses)) {
            if (analysis.score < lowestScore) {
                lowestScore = analysis.score;
                focusDomain = domain;
                focusConcerns = analysis.concerns;
            }
        }

        // Generate focus statement
        if (lowestScore >= 80) {
            return "All systems optimal - maintain current routines";
        }

        const focusMessages: { [domain: string]: string } = {
            fuel: "Nutrition Priority - focus on meal timing and hydration",
            recovery: "Recovery Priority - rest and modalities today",
            longevity: "Circadian Priority - protect sleep and light exposure",
            mental: "Mental Wellness Priority - stress management needed",
            performance: "Training Optimization - adjust load based on readiness",
            doctor: "Health Markers - consider bloodwork or supplements"
        };

        return focusMessages[focusDomain] || `Focus on ${focusDomain} today`;
    }

    // =====================================================
    // GET SCHEDULED ACTIONS (sorted by time)
    // =====================================================

    getScheduledActions(timeline: UnifiedTimeline): CouncilRecommendation[] {
        // Filter to only recommendations with time windows
        const scheduled = timeline.recommendations.filter(r => r.time_window);

        // Sort by start time
        scheduled.sort((a, b) => {
            if (!a.time_window || !b.time_window) return 0;
            return a.time_window.start.getTime() - b.time_window.start.getTime();
        });

        return scheduled;
    }

    // =====================================================
    // GET ALERTS (high urgency, no specific time)
    // =====================================================

    getAlerts(timeline: UnifiedTimeline): CouncilRecommendation[] {
        return timeline.recommendations.filter(
            r => r.urgency >= 70 && !r.time_window
        );
    }
}

// Export singleton
export const expertCouncil = new ExpertCouncil();
