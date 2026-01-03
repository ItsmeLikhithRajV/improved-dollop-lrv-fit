/**
 * Goal-Aware Hooks
 * Connects user goals to Recovery, Fuel, and Training engines
 */

import { GoalType, UserGoal } from '../../types/goals';
import {
    getRecoveryRecommendationAdapter as getRecoveryRecommendation,
    getRecoveryPriorities,
    RecoveryModality,
    TimingContext
} from '../recovery/goalRecoveryProtocols';
import {
    getFuelProtocol,
    getPreWorkoutProtocol,
    getPostWorkoutProtocol
} from '../nutritionist/goalFuelProtocols';

// --- RECOVERY INTEGRATION ---

export interface GoalAwareRecoveryRecommendation {
    modality: RecoveryModality;
    priority: 'essential' | 'recommended' | 'optional';
    timing: string;
    duration: string;
    frequency: string;
    goalBenefit: string;
    contraindications?: string[];
}

/**
 * Get recovery suggestions filtered and prioritized by user's goal
 */
export function getGoalAwareRecoverySuggestions(
    userGoal: UserGoal,
    context: TimingContext = 'any',
    limit: number = 5
): GoalAwareRecoveryRecommendation[] {
    const priorities = getRecoveryPriorities(userGoal.primary);
    const allModalities: RecoveryModality[] = [
        'cold_water_immersion', 'sauna', 'massage', 'sleep_extension',
        'active_recovery', 'stretching', 'foam_rolling', 'compression',
        'breathing_work', 'meditation', 'nap', 'contrast_therapy',
        'epsom_bath', 'red_light_therapy', 'grounding', 'cold_shower', 'hot_tub'
    ];

    const recommendations: GoalAwareRecoveryRecommendation[] = [];

    // Sort modalities by priority for this goal
    const sortedModalities = [...allModalities].sort((a, b) => {
        const aIsEssential = priorities.essential.includes(a);
        const bIsEssential = priorities.essential.includes(b);
        const aIsRecommended = priorities.recommended.includes(a);
        const bIsRecommended = priorities.recommended.includes(b);

        if (aIsEssential && !bIsEssential) return -1;
        if (!aIsEssential && bIsEssential) return 1;
        if (aIsRecommended && !bIsRecommended) return -1;
        if (!aIsRecommended && bIsRecommended) return 1;
        return 0;
    });

    for (const modality of sortedModalities.slice(0, limit)) {
        const rec = getRecoveryRecommendation(userGoal.primary, modality, context);
        if (!rec) continue;

        let priority: 'essential' | 'recommended' | 'optional' = 'optional';
        if (priorities.essential.includes(modality)) priority = 'essential';
        else if (priorities.recommended.includes(modality)) priority = 'recommended';

        recommendations.push({
            modality,
            priority,
            timing: rec.timing,
            duration: rec.duration,
            frequency: rec.frequency,
            goalBenefit: rec.goal_specific_notes,
            contraindications: rec.contraindications
        });
    }

    return recommendations;
}

// --- FUEL INTEGRATION ---

export interface GoalAwareFuelRecommendation {
    macros: {
        protein: { min: number; max: number; unit: string };
        carbs: { min: number; max: number; unit: string };
        fats: { min: number; max: number; unit: string };
    };
    calories: string;
    mealTiming: string[];
    supplements: {
        tier1: string[];
        tier2: string[];
    };
    hydration: string;
    foodFocus: string[];
}

/**
 * Get fuel recommendations based on user's goal
 */
export function getGoalAwareFuelRecommendations(
    userGoal: UserGoal
): GoalAwareFuelRecommendation {
    const protocol = getFuelProtocol(userGoal.primary);

    return {
        macros: protocol.macros,
        calories: protocol.caloric_strategy,
        mealTiming: [
            ...protocol.nutrient_timing.pre_workout.recommendations.slice(0, 2),
            ...protocol.nutrient_timing.post_workout.recommendations.slice(0, 2)
        ],
        supplements: {
            tier1: protocol.supplement_stack.tier_1.map(s => s.item),
            tier2: protocol.supplement_stack.tier_2.map(s => s.item)
        },
        hydration: protocol.hydration.daily,
        foodFocus: protocol.food_focus.prioritize
    };
}

// --- WORKOUT TIMING INTEGRATION ---

export interface PreWorkoutFuelPlan {
    timing: string;
    recommendations: string[];
    carbs: string;
    protein: string;
    fats: string;
}

export interface PostWorkoutFuelPlan {
    timing: string;
    recommendations: string[];
    carbs: string;
    protein: string;
    fats: string;
    window: string;
}

export function getGoalAwarePreWorkoutPlan(userGoal: UserGoal): PreWorkoutFuelPlan {
    const protocol = getPreWorkoutProtocol(userGoal.primary);
    return {
        timing: protocol.timing,
        recommendations: protocol.recommendations,
        carbs: protocol.carbs,
        protein: protocol.protein,
        fats: protocol.fats
    };
}

export function getGoalAwarePostWorkoutPlan(userGoal: UserGoal): PostWorkoutFuelPlan {
    const protocol = getPostWorkoutProtocol(userGoal.primary);
    return {
        timing: protocol.timing,
        recommendations: protocol.recommendations,
        carbs: protocol.carbs,
        protein: protocol.protein,
        fats: protocol.fats,
        window: protocol.anabolic_window
    };
}

// --- TRAINING INTEGRATION ---

export interface GoalAwareTrainingGuidance {
    loadManagement: string;
    intensityFocus: 'high' | 'moderate' | 'varied';
    volumeApproach: 'high' | 'moderate' | 'low';
    frequencyGuidance: string;
    periodizationNote: string;
}

/**
 * Get training guidance based on user's goal
 */
export function getGoalAwareTrainingGuidance(
    userGoal: UserGoal
): GoalAwareTrainingGuidance {
    const goal = userGoal.primary;

    const guidanceMap: Record<GoalType, GoalAwareTrainingGuidance> = {
        fat_loss: {
            loadManagement: 'Maintain intensity, volume as tolerable',
            intensityFocus: 'moderate',
            volumeApproach: 'moderate',
            frequencyGuidance: '4-6 sessions/week, mix strength and cardio',
            periodizationNote: 'Caloric deficit limits recovery capacity'
        },
        muscle_gain: {
            loadManagement: 'Progressive overload priority',
            intensityFocus: 'high',
            volumeApproach: 'high',
            frequencyGuidance: '4-6 sessions/week, body part splits',
            periodizationNote: 'Volume accumulation phases with deloads'
        },
        endurance: {
            loadManagement: 'Build aerobic base, manage total load',
            intensityFocus: 'varied',
            volumeApproach: 'high',
            frequencyGuidance: '5-7 sessions/week, polarized training',
            periodizationNote: 'Base building → intensity blocks → taper'
        },
        weight_loss: {
            loadManagement: 'Maintain muscle while in deficit',
            intensityFocus: 'moderate',
            volumeApproach: 'moderate',
            frequencyGuidance: '4-5 sessions/week, cardio focus',
            periodizationNote: 'Preserve strength while losing weight'
        },
        weight_gain: {
            loadManagement: 'Progressive overload with surplus support',
            intensityFocus: 'high',
            volumeApproach: 'high',
            frequencyGuidance: '4-6 sessions/week, compound focus',
            periodizationNote: 'Caloric surplus supports volume tolerance'
        },
        explosive_power: {
            loadManagement: 'CNS priority, manage fatigue',
            intensityFocus: 'high',
            volumeApproach: 'low',
            frequencyGuidance: '3-5 sessions/week, power emphasis',
            periodizationNote: 'Fresh CNS for power output'
        },
        longevity: {
            loadManagement: 'Consistency over intensity',
            intensityFocus: 'moderate',
            volumeApproach: 'moderate',
            frequencyGuidance: '3-5 sessions/week, full body',
            periodizationNote: 'Focus on movement quality and joint health'
        },
        hybrid: {
            loadManagement: 'Balance strength and conditioning',
            intensityFocus: 'varied',
            volumeApproach: 'moderate',
            frequencyGuidance: '5-6 sessions/week, concurrent training',
            periodizationNote: 'Manage interference effect'
        }
    };

    return guidanceMap[goal];
}

// --- TIMELINE/COMMANDER INTEGRATION ---

export interface GoalAwareAction {
    action: string;
    reason: string;
    priority: number;
    source: 'recovery' | 'fuel' | 'training' | 'mindspace';
}

/**
 * Get goal-aware action priorities for Active Commander
 */
export function getGoalAwareActionPriorities(
    userGoal: UserGoal,
    context: {
        timeOfDay: 'morning' | 'afternoon' | 'evening';
        lastWorkout?: Date;
        nextWorkout?: Date;
        currentFuelScore: number;
        currentRecoveryScore: number;
    }
): GoalAwareAction[] {
    const actions: GoalAwareAction[] = [];
    const goal = userGoal.primary;

    // Recovery-based actions
    const recoveryPriorities = getRecoveryPriorities(goal);
    if (context.currentRecoveryScore < 60) {
        const topModality = recoveryPriorities.essential[0];
        if (topModality) {
            actions.push({
                action: `${topModality.replace(/_/g, ' ')} session`,
                reason: `Critical for ${goal.replace(/_/g, ' ')} goal`,
                priority: 90,
                source: 'recovery'
            });
        }
    }

    // Fuel-based actions
    if (context.currentFuelScore < 50) {
        const fuelProtocol = getFuelProtocol(goal);
        actions.push({
            action: `Focus on ${fuelProtocol.food_focus.prioritize[0]}`,
            reason: 'Fuel score is low',
            priority: 85,
            source: 'fuel'
        });
    }

    // Training-based actions based on goal
    const trainingGuidance = getGoalAwareTrainingGuidance(userGoal);
    if (context.lastWorkout) {
        const hoursSinceWorkout = (Date.now() - context.lastWorkout.getTime()) / (1000 * 60 * 60);
        if (hoursSinceWorkout > 48 && goal !== 'longevity') {
            actions.push({
                action: 'Schedule training session',
                reason: trainingGuidance.frequencyGuidance,
                priority: 70,
                source: 'training'
            });
        }
    }

    return actions.sort((a, b) => b.priority - a.priority);
}
