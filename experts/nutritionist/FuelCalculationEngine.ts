/**
 * Fuel Calculation Engine
 * Calculates BMR, TDEE, and personalized macro targets
 * based on body composition and training data
 */

import {
    BodyComposition,
    FuelCalculation,
    GOAL_MACRO_MULTIPLIERS,
    ACTIVITY_MULTIPLIERS
} from '../../types/body';
import { PhysicalLoadState } from '../../types';

// =====================================================
// BMR CALCULATIONS
// =====================================================

/**
 * Mifflin-St Jeor Formula (for general population)
 * Use when body fat % is unknown
 */
export const calculateBMR_MifflinStJeor = (body: BodyComposition): number => {
    const { weight_kg, height_cm, age, gender } = body;

    if (gender === 'male') {
        return (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5;
    } else {
        return (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161;
    }
};

/**
 * Katch-McArdle Formula (for athletes with known body fat)
 * More accurate when lean body mass is known
 */
export const calculateBMR_KatchMcArdle = (body: BodyComposition): number | null => {
    const { weight_kg, body_fat_percent, lean_body_mass_kg } = body;

    // If LBM is directly provided (from DEXA), use it
    if (lean_body_mass_kg) {
        return 370 + (21.6 * lean_body_mass_kg);
    }

    // Otherwise calculate from body fat %
    if (body_fat_percent !== undefined) {
        const lbm = weight_kg * (1 - body_fat_percent / 100);
        return 370 + (21.6 * lbm);
    }

    return null;
};

// =====================================================
// ACTIVITY LEVEL FROM TRAINING DATA
// =====================================================

/**
 * Auto-detect activity level from training load data
 */
export const getActivityLevelFromLoad = (
    physicalLoad: PhysicalLoadState
): { level: keyof typeof ACTIVITY_MULTIPLIERS; multiplier: number } => {
    const weeklyLoad = physicalLoad.weekly_volume || 0;
    const acwr = physicalLoad.acwr || 1.0;

    // Based on typical training patterns:
    // 0-200 AU/week = sedentary
    // 200-400 AU/week = light
    // 400-700 AU/week = moderate
    // 700-1000 AU/week = very active
    // 1000+ AU/week = extreme

    if (weeklyLoad < 200) {
        return { level: 'sedentary', multiplier: ACTIVITY_MULTIPLIERS.sedentary };
    } else if (weeklyLoad < 400) {
        return { level: 'light', multiplier: ACTIVITY_MULTIPLIERS.light };
    } else if (weeklyLoad < 700) {
        return { level: 'moderate', multiplier: ACTIVITY_MULTIPLIERS.moderate };
    } else if (weeklyLoad < 1000) {
        return { level: 'very_active', multiplier: ACTIVITY_MULTIPLIERS.very_active };
    } else {
        return { level: 'extreme', multiplier: ACTIVITY_MULTIPLIERS.extreme };
    }
};

// =====================================================
// MAIN CALCULATION ENGINE
// =====================================================

export interface FuelCalculationInput {
    body: BodyComposition;
    physicalLoad: PhysicalLoadState;
    goalType: keyof typeof GOAL_MACRO_MULTIPLIERS;
    manualActivityLevel?: keyof typeof ACTIVITY_MULTIPLIERS;  // Override auto-detect
}

export const calculateFuelTargets = (input: FuelCalculationInput): FuelCalculation => {
    const { body, physicalLoad, goalType, manualActivityLevel } = input;

    // 1. Calculate BMR
    let bmr: number;
    let formulaUsed: 'mifflin-st-jeor' | 'katch-mcardle';
    let confidence: 'estimated' | 'measured';

    // Prefer Katch-McArdle if we have body fat data
    const katchBMR = calculateBMR_KatchMcArdle(body);

    // If scale provides BMR directly, use that
    if (body.bmr_scale) {
        bmr = body.bmr_scale;
        formulaUsed = 'katch-mcardle';  // Assume scale uses something similar
        confidence = 'measured';
    } else if (katchBMR !== null) {
        bmr = katchBMR;
        formulaUsed = 'katch-mcardle';
        confidence = body.data_source === 'dexa' ? 'measured' : 'estimated';
    } else {
        bmr = calculateBMR_MifflinStJeor(body);
        formulaUsed = 'mifflin-st-jeor';
        confidence = 'estimated';
    }

    // 2. Determine activity level
    let activityLevel: keyof typeof ACTIVITY_MULTIPLIERS;
    let activityMultiplier: number;

    if (manualActivityLevel) {
        activityLevel = manualActivityLevel;
        activityMultiplier = ACTIVITY_MULTIPLIERS[manualActivityLevel];
    } else {
        const autoLevel = getActivityLevelFromLoad(physicalLoad);
        activityLevel = autoLevel.level;
        activityMultiplier = autoLevel.multiplier;
    }

    // 3. Calculate TDEE
    const tdee = Math.round(bmr * activityMultiplier);

    // 4. Get macro multipliers for goal
    const goalMultipliers = GOAL_MACRO_MULTIPLIERS[goalType] || GOAL_MACRO_MULTIPLIERS.maintenance;

    // 5. Calculate macro targets (using mid-range for display)
    const weight = body.weight_kg;
    const protein_g = Math.round(((goalMultipliers.protein.min + goalMultipliers.protein.max) / 2) * weight);
    const carbs_g = Math.round(((goalMultipliers.carbs.min + goalMultipliers.carbs.max) / 2) * weight);
    const fat_g = Math.round(((goalMultipliers.fat.min + goalMultipliers.fat.max) / 2) * weight);

    // Protein = 4 cal/g, Carbs = 4 cal/g, Fat = 9 cal/g
    const macroCalories = (protein_g * 4) + (carbs_g * 4) + (fat_g * 9);

    return {
        bmr: Math.round(bmr),
        tdee,
        formula_used: formulaUsed,
        activity_multiplier: activityMultiplier,
        activity_level: activityLevel,
        macros: {
            protein_g,
            carbs_g,
            fat_g,
            calories: macroCalories
        },
        per_kg_targets: {
            protein: { min: goalMultipliers.protein.min, max: goalMultipliers.protein.max },
            carbs: { min: goalMultipliers.carbs.min, max: goalMultipliers.carbs.max },
            fat: { min: goalMultipliers.fat.min, max: goalMultipliers.fat.max }
        },
        confidence,
        last_calculated: new Date().toISOString()
    };
};

// Type alias for external usage
export type FuelTargets = FuelCalculation;

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Calculate Lean Body Mass from weight and body fat %
 */
export const calculateLBM = (weight_kg: number, body_fat_percent: number): number => {
    return weight_kg * (1 - body_fat_percent / 100);
};

/**
 * Calculate BMI (for reference, not primary metric)
 */
export const calculateBMI = (weight_kg: number, height_cm: number): number => {
    const height_m = height_cm / 100;
    return weight_kg / (height_m * height_m);
};

/**
 * Get body fat category
 */
export const getBodyFatCategory = (
    body_fat_percent: number,
    gender: 'male' | 'female'
): 'essential' | 'athlete' | 'fitness' | 'average' | 'obese' => {
    const ranges = gender === 'male' ? {
        athlete: 13, fitness: 17, average: 24
    } : {
        athlete: 20, fitness: 24, average: 31
    };

    if (body_fat_percent <= (gender === 'male' ? 5 : 13)) return 'essential';
    if (body_fat_percent <= ranges.athlete) return 'athlete';
    if (body_fat_percent <= ranges.fitness) return 'fitness';
    if (body_fat_percent <= ranges.average) return 'average';
    return 'obese';
};

/**
 * Format activity level for display
 */
export const formatActivityLevel = (level: keyof typeof ACTIVITY_MULTIPLIERS): string => {
    const labels = {
        sedentary: 'Sedentary',
        light: 'Lightly Active',
        moderate: 'Moderately Active',
        very_active: 'Very Active',
        extreme: 'Extremely Active'
    };
    return labels[level];
};
