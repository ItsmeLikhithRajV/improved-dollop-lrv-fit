/**
 * Fuel Types - Nutrition Periodization & Timing
 * 
 * Based on:
 * - Burke et al. (2011) - Carbohydrate for training and competition
 * - Thomas et al. (2016) - ACSM position stand on nutrition
 * - Glycogen supercompensation protocols
 * - Leucine threshold research (~2.5g per meal)
 */

// ============================================================================
// FUELING WINDOWS
// ============================================================================

export type FuelWindowType =
    | 'pre_session_full_meal'
    | 'pre_session_snack'
    | 'pre_session_simple'
    | 'during_session'
    | 'post_session_immediate'
    | 'post_session_extended'
    | 'recovery_day'
    | 'fasted_training';

export interface FuelWindow {
    type: FuelWindowType;
    name: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;

    // Targets
    carbs_grams_per_kg?: number;
    protein_grams?: number;
    fat_grams?: number;
    fluid_ml?: number;

    // Description
    purpose: string;
    examples: string[];

    // Priority
    priority: 'critical' | 'high' | 'medium' | 'low';

    // Related session
    session_id?: string;
    session_type?: string;
}

// ============================================================================
// PRE-DEFINED FUEL WINDOWS
// ============================================================================

export const FUEL_WINDOW_TEMPLATES: Record<FuelWindowType, Omit<FuelWindow, 'start_time' | 'end_time' | 'duration_minutes'>> = {
    pre_session_full_meal: {
        type: 'pre_session_full_meal',
        name: 'Pre-Training Meal',
        carbs_grams_per_kg: 1.0,
        protein_grams: 20,
        fat_grams: 10,
        fluid_ml: 500,
        purpose: 'Top off glycogen stores and provide sustained energy',
        examples: ['Oatmeal with banana', 'Toast with eggs', 'Rice with chicken'],
        priority: 'high'
    },
    pre_session_snack: {
        type: 'pre_session_snack',
        name: 'Pre-Training Snack',
        carbs_grams_per_kg: 0.5,
        protein_grams: 10,
        fluid_ml: 250,
        purpose: 'Quick energy top-up without GI distress',
        examples: ['Banana', 'Energy bar', 'Toast with honey'],
        priority: 'medium'
    },
    pre_session_simple: {
        type: 'pre_session_simple',
        name: 'Immediate Pre-Training',
        carbs_grams_per_kg: 0.3,
        fluid_ml: 200,
        purpose: 'Quick carbs right before session',
        examples: ['Sports drink', 'Gel', 'Dates'],
        priority: 'medium'
    },
    during_session: {
        type: 'during_session',
        name: 'Intra-Training Fuel',
        carbs_grams_per_kg: 0.5,
        fluid_ml: 500,
        purpose: 'Maintain blood glucose and hydration during exercise',
        examples: ['Sports drink', 'Gels', 'Banana', 'Energy chews'],
        priority: 'high'
    },
    post_session_immediate: {
        type: 'post_session_immediate',
        name: 'Recovery Window',
        carbs_grams_per_kg: 1.0,
        protein_grams: 30,
        fluid_ml: 500,
        purpose: 'Maximize glycogen resynthesis and muscle protein synthesis',
        examples: ['Recovery shake', 'Chocolate milk', 'Rice with protein'],
        priority: 'critical'
    },
    post_session_extended: {
        type: 'post_session_extended',
        name: 'Extended Recovery',
        carbs_grams_per_kg: 1.0,
        protein_grams: 30,
        purpose: 'Continue glycogen replenishment and recovery',
        examples: ['Full meal with carbs and protein', 'Pasta with meat sauce'],
        priority: 'high'
    },
    recovery_day: {
        type: 'recovery_day',
        name: 'Rest Day Nutrition',
        carbs_grams_per_kg: 3,
        protein_grams: 120,
        purpose: 'Support recovery without excess calories',
        examples: ['Moderate carbs, adequate protein, plenty of vegetables'],
        priority: 'medium'
    },
    fasted_training: {
        type: 'fasted_training',
        name: 'Train Low Strategy',
        fluid_ml: 300,
        purpose: 'Fat adaptation and metabolic flexibility',
        examples: ['Low intensity only', 'Caffeine optional', 'Electrolytes'],
        priority: 'low'
    }
};

// ============================================================================
// GLYCOGEN STATUS
// ============================================================================

export interface GlycogenStatus {
    muscle_glycogen_percent: number;  // 0-100 (100 = fully stocked)
    liver_glycogen_percent: number;

    estimated_depletion_time: string; // For current activity level
    estimated_refill_hours: number;   // Time to full if eating

    status: 'depleted' | 'low' | 'moderate' | 'full' | 'supercompensated';

    // Recommendations
    carb_need_grams: number;
    recommended_timing: string;
}

// ============================================================================
// PROTEIN TIMING
// ============================================================================

export interface ProteinDistribution {
    daily_target_grams: number;
    per_meal_target_grams: number;
    leucine_per_meal_grams: 2.5;

    meals: {
        name: string;
        time: string;
        protein_grams: number;
        leucine_achieved: boolean;
    }[];

    total_consumed_grams: number;
    remaining_grams: number;

    // Is distribution optimal?
    distribution_quality: 'even' | 'front_loaded' | 'back_loaded' | 'uneven';
}

// ============================================================================
// HYDRATION
// ============================================================================

export interface HydrationStatus {
    estimated_hydration_percent: number;  // 0-100
    fluid_consumed_ml: number;
    fluid_target_ml: number;

    // Sweat rate estimation
    estimated_sweat_rate_ml_per_hour: number;

    // Electrolyte needs
    sodium_mg_needed: number;

    status: 'dehydrated' | 'slightly_low' | 'adequate' | 'well_hydrated';

    // Next action
    recommendation: string;
}

// ============================================================================
// TRAIN LOW / TRAIN HIGH PERIODIZATION
// ============================================================================

export type FuelAvailability = 'high' | 'moderate' | 'low';

export interface NutritionPeriodization {
    strategy: 'train_high' | 'train_low' | 'sleep_low' | 'recover_high';
    session_type: string;
    carb_availability: FuelAvailability;

    pre_session: {
        carbs: FuelAvailability;
        when: string;
    };

    during_session: {
        carbs_per_hour_g: number;
    };

    post_session: {
        carbs: FuelAvailability;
        when: string;
    };

    rationale: string;
    expected_adaptation: string;
}

// ============================================================================
// COMPETITION FUELING PLAN
// ============================================================================

export interface CompetitionFuelPlan {
    event_date: string;
    event_duration_hours: number;

    // Carb loading protocol
    carb_loading: {
        days_before: number;
        carbs_per_kg_per_day: number;
        taper_training: boolean;
        expected_glycogen_increase: string;
    };

    // Race day
    pre_race_meal: {
        hours_before: number;
        carbs_grams: number;
        avoid: string[];
    };

    during_race: {
        carbs_per_hour: number;
        fluid_per_hour_ml: number;
        sodium_per_hour_mg: number;
        products: string[];
    };

    // Post race
    post_race: {
        immediate_priority: string;
        carbs_grams: number;
        protein_grams: number;
    };
}

// ============================================================================
// MEAL PLAN
// ============================================================================

export interface PlannedMeal {
    id: string;
    name: string;
    time: string;

    // Macros
    calories: number;
    carbs_grams: number;
    protein_grams: number;
    fat_grams: number;
    fiber_grams: number;

    // Micro focus
    key_nutrients?: string[];

    // Type
    meal_type: 'breakfast' | 'snack' | 'lunch' | 'dinner' | 'pre_workout' | 'post_workout' | 'supplement';

    // Fuel window relation
    fuel_window_type?: FuelWindowType;

    // Status
    consumed: boolean;
    actual_time?: string;
}

export interface DailyFuelPlan {
    date: string;
    training_day: boolean;
    session_times: string[];

    // Targets
    calorie_target: number;
    carb_target_grams: number;
    protein_target_grams: number;
    fat_target_grams: number;
    fluid_target_ml: number;

    // Meals
    meals: PlannedMeal[];

    // Fuel windows
    fuel_windows: FuelWindow[];

    // Progress
    calories_consumed: number;
    macros_consumed: {
        carbs: number;
        protein: number;
        fat: number;
    };
    fluid_consumed: number;

    // Score
    adherence_score: number;
}

// ============================================================================
// FUEL ANALYSIS OUTPUT
// ============================================================================

export interface FuelAnalysisOutput {
    current_window: FuelWindow | null;
    next_window: FuelWindow | null;

    glycogen_status: GlycogenStatus;
    protein_distribution: ProteinDistribution;
    hydration_status: HydrationStatus;

    today_plan: DailyFuelPlan;

    // Recommendations
    immediate_action: string;
    upcoming_actions: { time: string; action: string }[];

    // Periodization
    current_strategy: NutritionPeriodization;
}
