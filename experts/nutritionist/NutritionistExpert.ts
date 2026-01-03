/**
 * NUTRITIONIST EXPERT
 * 
 * The unified nutritional intelligence.
 * Uses ALL fuel-related engines as internal knowledge.
 * Thinks as ONE coherent nutritionist, not 10 separate pieces.
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

// Import internal knowledge bases (the scattered files become TOOLS)
import { FuelEngine } from "../../features/fuel/logic/fuelEngine";
import { FuelWindowEngine } from "./FuelWindowEngine";
import { StatusClassificationEngine } from "../shared/StatusClassificationEngine";
// Note: Other imports will be added as we integrate more files

// =====================================================
// NUTRITIONIST EXPERT
// =====================================================

export class NutritionistExpert implements Expert {
    readonly name = "Nutritionist";
    readonly domain = "fuel";
    readonly emoji = "🍴";

    // =====================================================
    // ANALYZE: Internal reasoning using all knowledge
    // =====================================================

    analyze(state: GlobalState, profile: UserProfile): ExpertAnalysis {
        const fuel = state.fuel;
        const concerns: string[] = [];
        const opportunities: string[] = [];

        // Fuel score analysis
        const fuelScore = fuel?.fuel_score ?? 70;

        if (fuelScore < 40) {
            concerns.push("Fuel critically low - energy crash imminent");
        } else if (fuelScore < 60) {
            concerns.push("Fuel suboptimal - performance may suffer");
        }

        // Hydration analysis
        const hydration = fuel?.hydration_liters ?? 0;
        if (hydration < 1.5) {
            concerns.push(`Only ${hydration}L consumed - dehydrated`);
        }

        // Caffeine analysis
        const hour = new Date().getHours();
        const caffeine = fuel?.caffeine_mg ?? 0;
        if (hour > 14 && caffeine > 0) {
            concerns.push("Caffeine after 2pm may affect sleep");
        }

        // Meal timing analysis
        const lastMealHours = fuel?.hours_since_last_meal ?? 0;
        if (lastMealHours > 4) {
            concerns.push(`${lastMealHours}h since last meal - consider eating`);
        }

        // Opportunities
        if (hour >= 6 && hour <= 9) {
            opportunities.push("Morning - optimal breakfast window");
        }
        if (hour >= 12 && hour <= 14) {
            opportunities.push("Midday - lunch window");
        }

        // Training-aware opportunities
        const sessions = state.timeline?.sessions || [];
        const todayTraining = sessions.find(s => s.time_of_day);
        if (todayTraining) {
            const trainingHour = parseInt(todayTraining.time_of_day?.split(':')[0] || '0');
            if (hour >= trainingHour - 2 && hour < trainingHour) {
                opportunities.push("Pre-training fuel window is NOW");
            }
            if (hour >= trainingHour + 1 && hour <= trainingHour + 2) {
                opportunities.push("Anabolic window - post-training nutrition critical");
            }
        }

        // Determine current state description
        let current_state: string;
        if (concerns.length === 0) {
            current_state = "Nutrition optimal - well fueled and hydrated";
        } else if (concerns.length <= 2) {
            current_state = "Nutrition needs attention";
        } else {
            current_state = "Nutrition critically needs intervention";
        }

        // Get scientific status classification
        const statusResult = StatusClassificationEngine.classifyFuelScore(fuelScore);

        return {
            domain: this.domain,
            current_state,
            score: fuelScore,
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

        // Get goal-specific adjustments
        const isFatLoss = context.user_goals.some(g =>
            g.includes('fat') || g.includes('weight')
        );
        const isMuscleGain = context.user_goals.some(g =>
            g.includes('muscle') || g.includes('strength')
        );

        // Parse times
        const wakeHour = parseInt(context.wake_time.split(':')[0]);
        const bedHour = parseInt(context.bed_time.split(':')[0]);
        const trainingHour = context.training_time
            ? parseInt(context.training_time.split(':')[0])
            : null;

        // =========== PROACTIVE MEALS ===========

        // BREAKFAST (Wake + 30min to Wake + 2h)
        const breakfastStart = wakeHour;
        const breakfastEnd = wakeHour + 2;
        if (hour >= breakfastStart && hour <= breakfastEnd) {
            recommendations.push({
                id: 'nutritionist_breakfast',
                expert: this.name,
                name: '🍳 Breakfast',
                description: 'Start your day with balanced nutrition',
                urgency: hour >= wakeHour + 1 ? 75 : 60,
                impact: 85,
                time_window: {
                    start: this.timeToDate(breakfastStart),
                    end: this.timeToDate(breakfastEnd)
                },
                duration_minutes: 30,
                rationale: 'Break overnight fast, stabilize blood sugar',
                protocol: isFatLoss
                    ? 'High protein, moderate carbs (30g P, 25g C, 10g F)'
                    : isMuscleGain
                        ? 'High protein, high carbs (40g P, 50g C, 15g F)'
                        : 'Balanced: 30g protein, 40g carbs, 15g fat'
            });
        }

        // PRE-TRAINING (Training - 2h to Training - 30min)
        if (trainingHour && hour >= trainingHour - 2 && hour < trainingHour) {
            recommendations.push({
                id: 'nutritionist_pre_training',
                expert: this.name,
                name: '⚡ Pre-Training Fuel',
                description: 'Fuel for optimal performance',
                urgency: 85,
                impact: 90,
                time_window: {
                    start: this.timeToDate(trainingHour - 2),
                    end: this.timeToDate(trainingHour - 0.5)
                },
                duration_minutes: 20,
                rationale: `Training in ${Math.round((trainingHour - hour) * 60)} minutes`,
                protocol: 'Easy-digest carbs + light protein (40g C, 15g P)',
                conflicts_with: ['training']
            });
        }

        // POST-TRAINING (Training + 0 to Training + 1.5h)
        const trainingEnd = trainingHour ? trainingHour + 1 : null;
        if (trainingEnd && hour >= trainingEnd && hour <= trainingEnd + 1.5) {
            recommendations.push({
                id: 'nutritionist_post_training',
                expert: this.name,
                name: '🥤 Post-Training Nutrition',
                description: 'Critical recovery window',
                urgency: 95, // Highest urgency - time sensitive
                impact: 95,
                time_window: {
                    start: this.timeToDate(trainingEnd),
                    end: this.timeToDate(trainingEnd + 1)
                },
                duration_minutes: 15,
                rationale: 'Anabolic window for muscle protein synthesis',
                protocol: 'Fast protein + carbs (40g P, 50g C) - shake ideal'
            });
        }

        // LUNCH (12:00 - 14:00, unless training conflicts)
        const lunchConflict = trainingHour && trainingHour >= 11 && trainingHour <= 14;
        if (!lunchConflict && hour >= 12 && hour <= 14) {
            recommendations.push({
                id: 'nutritionist_lunch',
                expert: this.name,
                name: '🍽️ Lunch',
                description: 'Midday refuel for afternoon energy',
                urgency: hour >= 13 ? 70 : 55,
                impact: 75,
                time_window: {
                    start: this.timeToDate(12),
                    end: this.timeToDate(14)
                },
                duration_minutes: 30,
                rationale: 'Maintain stable energy through afternoon',
                protocol: 'Balanced meal with vegetables, protein, complex carbs'
            });
        }

        // DINNER (Bed - 4h to Bed - 2h)
        const dinnerStart = bedHour - 4;
        const dinnerEnd = bedHour - 2;
        if (hour >= dinnerStart && hour <= dinnerEnd) {
            recommendations.push({
                id: 'nutritionist_dinner',
                expert: this.name,
                name: '🍽️ Dinner',
                description: 'Final meal for overnight recovery',
                urgency: hour >= dinnerStart + 1 ? 65 : 50,
                impact: 70,
                time_window: {
                    start: this.timeToDate(dinnerStart),
                    end: this.timeToDate(dinnerEnd)
                },
                duration_minutes: 45,
                rationale: `Last meal before ${bedHour}:00 cutoff`,
                protocol: isFatLoss
                    ? 'Protein-focused, lower carbs (35g P, 20g C)'
                    : 'Protein + moderate carbs for recovery (35g P, 35g C)'
            });
        }

        // =========== REACTIVE ALERTS ===========

        // Critical fuel
        if (analysis.score < 40) {
            recommendations.push({
                id: 'nutritionist_fuel_critical',
                expert: this.name,
                name: '🚨 Critical: Eat NOW',
                description: 'Energy critically low - immediate action needed',
                urgency: 95,
                impact: 90,
                duration_minutes: 15,
                rationale: `Fuel at ${analysis.score}% - performance crash imminent`,
                protocol: 'Quick carbs + protein: fruit + nuts or shake'
            });
        }

        // Dehydration
        const hydration = state.fuel?.hydration_liters ?? 0;
        if (hydration < 1.5 && hour >= 10) {
            recommendations.push({
                id: 'nutritionist_hydrate',
                expert: this.name,
                name: '💧 Hydration Alert',
                description: `Only ${hydration}L today - drink water`,
                urgency: hour > 14 ? 80 : 60,
                impact: 85,
                duration_minutes: 2,
                rationale: '3% dehydration = 25% performance drop',
                protocol: 'Drink 500ml water now'
            });
        }

        // Caffeine cutoff
        if (hour >= 13 && hour <= 15) {
            const caffeine = state.fuel?.caffeine_mg ?? 0;
            if (caffeine < 400) { // Can still have some
                recommendations.push({
                    id: 'nutritionist_caffeine_cutoff',
                    expert: this.name,
                    name: '☕ Caffeine Cutoff Soon',
                    description: 'Last chance for caffeine today',
                    urgency: 40,
                    impact: 60,
                    duration_minutes: 5,
                    rationale: 'Caffeine half-life ~6h, cutoff protects sleep',
                    protocol: hour > 14 ? 'No more caffeine today' : 'Last coffee if needed'
                });
            }
        }

        return recommendations;
    }

    // =====================================================
    // HANDOFF: Receive info from other experts
    // =====================================================

    receiveHandoff(handoff: HandoffData): ActionCandidate[] {
        const recommendations: ActionCandidate[] = [];

        // Doctor detected low B12
        if (handoff.from_expert === 'doctor' && handoff.data?.marker === 'B12') {
            recommendations.push({
                id: 'nutritionist_b12_response',
                expert: this.name,
                name: '🥩 B12 Boost Needed',
                description: 'Doctor detected low B12 - dietary intervention',
                urgency: 70,
                impact: 75,
                duration_minutes: 0, // It's a dietary change, not a task
                rationale: 'Low B12 affects energy and cognition',
                protocol: 'Increase: red meat, eggs, dairy, or supplement'
            });
        }

        // Performance coach says heavy training coming
        if (handoff.from_expert === 'performance' && handoff.data?.intensity === 'high') {
            recommendations.push({
                id: 'nutritionist_carb_load',
                expert: this.name,
                name: '🍝 Carb Loading Suggested',
                description: 'Heavy training detected - fuel up',
                urgency: 65,
                impact: 80,
                duration_minutes: 0,
                rationale: 'High intensity training requires extra glycogen',
                protocol: 'Increase carb intake today (+20-30%)'
            });
        }

        return recommendations;
    }

    // =====================================================
    // PRIORITY: How important is nutrition right now?
    // =====================================================

    getPriorityWeight(state: GlobalState, profile: UserProfile): number {
        const analysis = this.analyze(state, profile);

        // Base weight
        let weight = 0.25; // 25% base

        // If fuel is critical, nutrition becomes most important
        if (analysis.score < 40) {
            weight = 0.45;
        } else if (analysis.score < 60) {
            weight = 0.35;
        }

        // If user goal is fat loss or muscle gain, nutrition is more important
        const goal = String(profile?.user_goal || '');
        if (goal.includes('fat') || goal.includes('muscle') || goal.includes('weight')) {
            weight += 0.10;
        }

        // Training day = nutrition more important
        const sessions = state.timeline?.sessions || [];
        if (sessions.length > 0) {
            weight += 0.05;
        }

        return Math.min(weight, 0.50); // Cap at 50%
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

        // If no recs, generate a maintenance one
        if (!primaryAction) {
            primaryAction = {
                id: 'nutritionist_maintenance',
                expert: this.name,
                name: '💧 Maintenance Hydration',
                description: 'Keep hydration steady',
                urgency: 30,
                impact: 40,
                duration_minutes: 1,
                rationale: 'Baseline maintenance',
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
        // CHAOS LOGIC: The 9 PM Training Scenario
        // ===========================================
        const hour = context.current_hour;
        const bedHour = parseInt(context.bed_time.split(':')[0]);
        const isLateNight = hour >= bedHour - 3;
        const isPostTraining = primaryAction.id === 'nutritionist_post_training';

        if (isLateNight && isPostTraining) {
            opinion.reasoning = "User trained late. Glycogen replenishment is CRITICAL for tomorrow's recovery, despite the late hour.";
            opinion.constraints.push("late_night_eating");
            opinion.urgency = 95; // Scream louder because of the conflict risk

            // THE COMPROMISE: Liquid Shake
            opinion.compromise_options = [{
                ...primaryAction,
                id: 'nutritionist_comp_liquid',
                name: '🥤 Liquid Recovery (Compromise)',
                description: 'Fast-digesting shake ONLY. No solid food.',
                urgency: 85, // Slightly less urgent than the ideal
                rationale: 'Liquid bypasses mechanical digestion. Spikes insulin fast for recovery but clears stomach before sleep.',
                compromise_reason: 'Sleep proximity requires minimal digestion tax.',
                trade_off: 'Less satiety, but preserves Sleep Quality while securing Recovery.',
                protocol: 'Whey Isolate + Dextrose/Banana blended with water. NO FATS/FIBER.'
            }];
        }

        return opinion;
    }
}

// Export singleton
export const nutritionistExpert = new NutritionistExpert();
