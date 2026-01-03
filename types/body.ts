/**
 * Body Composition Types
 * For Profile body metrics and Fuel calculation integration
 */

// =====================================================
// BODY COMPOSITION DATA
// =====================================================

export interface BodyComposition {
    // Basic Required Metrics
    height_cm: number;
    weight_kg: number;
    age: number;
    gender: 'male' | 'female';

    // Smart Scale Metrics (Optional - from BIA or manual entry)
    body_fat_percent?: number;      // Body fat percentage
    muscle_mass_kg?: number;        // Skeletal muscle mass
    bone_mass_kg?: number;          // Bone mineral estimate
    body_water_percent?: number;    // Total body water percentage

    // Advanced Metrics (Optional - from DEXA or scale)
    visceral_fat_level?: number;    // 1-12 healthy, 13-59 elevated
    lean_body_mass_kg?: number;     // Total weight minus fat
    bmr_scale?: number;             // BMR reported by scale (if available)
    metabolic_age?: number;         // Metabolic age from scale

    // Metadata
    last_weigh_in?: string;         // ISO date string
    data_source: 'manual' | 'smart_scale' | 'dexa' | 'medical_report';
    last_updated: string;           // ISO date string
}

// =====================================================
// FUEL CALCULATION RESULTS
// =====================================================

export interface FuelCalculation {
    bmr: number;                    // Basal Metabolic Rate (kcal/day)
    tdee: number;                   // Total Daily Energy Expenditure (kcal/day)
    formula_used: 'mifflin-st-jeor' | 'katch-mcardle';
    activity_multiplier: number;    // The multiplier used (1.2 - 1.9)
    activity_level: 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extreme';

    macros: {
        protein_g: number;
        carbs_g: number;
        fat_g: number;
        calories: number;
    };

    // Per-kg targets for display
    per_kg_targets: {
        protein: { min: number; max: number };
        carbs: { min: number; max: number };
        fat: { min: number; max: number };
    };

    confidence: 'estimated' | 'measured';   // Based on data source
    last_calculated: string;                 // ISO date string
}

// =====================================================
// SMART SCALE REPORT ANALYSIS (AI)
// =====================================================

export interface ScaleReportAnalysis {
    weight_kg?: number;
    body_fat_percent?: number;
    muscle_mass_kg?: number;
    bone_mass_kg?: number;
    body_water_percent?: number;
    visceral_fat_level?: number;
    bmr?: number;
    metabolic_age?: number;

    // Metadata
    confidence: 'high' | 'medium' | 'low';
    detected_scale_brand?: string;
    raw_text?: string;  // OCR'd text for debugging
}

// =====================================================
// GOAL-SPECIFIC MACRO MULTIPLIERS
// =====================================================

export const GOAL_MACRO_MULTIPLIERS = {
    endurance: {
        protein: { min: 1.2, max: 1.6 },    // g/kg
        carbs: { min: 5, max: 10 },          // g/kg
        fat: { min: 1.0, max: 1.5 }          // g/kg
    },
    strength: {
        protein: { min: 1.6, max: 2.2 },
        carbs: { min: 3, max: 5 },
        fat: { min: 0.8, max: 1.2 }
    },
    hypertrophy: {
        protein: { min: 1.8, max: 2.4 },
        carbs: { min: 4, max: 6 },
        fat: { min: 0.8, max: 1.0 }
    },
    fat_loss: {
        protein: { min: 2.0, max: 2.4 },
        carbs: { min: 2, max: 4 },
        fat: { min: 0.5, max: 0.8 }
    },
    maintenance: {
        protein: { min: 1.4, max: 1.8 },
        carbs: { min: 4, max: 6 },
        fat: { min: 0.8, max: 1.0 }
    },
    athletic_performance: {
        protein: { min: 1.6, max: 2.0 },
        carbs: { min: 5, max: 8 },
        fat: { min: 1.0, max: 1.3 }
    }
} as const;

// =====================================================
// ACTIVITY LEVEL MULTIPLIERS
// =====================================================

export const ACTIVITY_MULTIPLIERS = {
    sedentary: 1.2,         // Desk job, no exercise
    light: 1.375,           // 1-3 days/week light exercise
    moderate: 1.55,         // 3-5 days/week moderate exercise
    very_active: 1.725,     // 6-7 days/week hard training
    extreme: 1.9            // 2x/day training or physical job + training
} as const;

// =====================================================
// BODY FAT PERCENTAGE RANGES (for context)
// =====================================================

export const BODY_FAT_RANGES = {
    male: {
        essential: { min: 2, max: 5 },
        athlete: { min: 6, max: 13 },
        fitness: { min: 14, max: 17 },
        average: { min: 18, max: 24 },
        obese: { min: 25, max: 100 }
    },
    female: {
        essential: { min: 10, max: 13 },
        athlete: { min: 14, max: 20 },
        fitness: { min: 21, max: 24 },
        average: { min: 25, max: 31 },
        obese: { min: 32, max: 100 }
    }
} as const;
