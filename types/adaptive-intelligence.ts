/**
 * Adaptive Intelligence Layer - Core Types
 * 
 * The brain that connects all analysis engines and provides
 * unified, context-aware, time-sensitive recommendations.
 * 
 * Key Principles:
 * 1. Safety First: Sleep and injury prevention always trump performance
 * 2. Context-Aware: Recommendations adapt to time, state, and scheduled sessions
 * 3. Learning: System adapts to user patterns over time
 * 4. Actionable: Every insight leads to a clear action
 */

// ============================================================================
// CONTEXT TYPES
// ============================================================================

/** Current temporal context */
export interface TemporalContext {
    current_time: Date;
    time_of_day: 'early_morning' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'night';
    hours_since_wake: number;
    hours_until_sleep: number;
    day_of_week: number; // 0-6
    is_weekend: boolean;
}

/** Scheduled session context */
export interface SessionContext {
    has_scheduled_session: boolean;
    next_session?: {
        time: Date;
        type: 'strength' | 'cardio' | 'hiit' | 'sport' | 'recovery' | 'other';
        duration_minutes: number;
        intensity: 'low' | 'moderate' | 'high' | 'max';
        hours_until: number;
    };
    last_session?: {
        time: Date;
        type: string;
        hours_since: number;
        recovery_status: 'recovered' | 'recovering' | 'fatigued';
    };
}

/** User's current physiological state - aggregated from all engines */
export interface PhysiologicalState {
    // From HRV Engine
    hrv: {
        current: number;
        zone: 'optimal' | 'good' | 'moderate' | 'compromised' | 'critical';
        trend: 'improving' | 'stable' | 'declining';
        recovery_readiness: number; // 0-100
    };

    // From Load Engine
    load: {
        acwr: number;
        zone: 'undertrained' | 'optimal' | 'moderate_risk' | 'high_risk' | 'very_high_risk';
        injury_risk: 'low' | 'moderate' | 'elevated' | 'high' | 'critical';
        recommended_intensity: 'high' | 'moderate' | 'low' | 'rest';
    };

    // From Recovery Engine
    recovery: {
        overall_score: number; // 0-100
        status: 'recovered' | 'recovering' | 'fatigued' | 'overreached';
        weakest_system: string;
        recommended_modalities: string[];
    };

    // From Circadian Engine
    circadian: {
        phase: string;
        physical_performance: number; // 0-100
        cognitive_performance: number; // 0-100
        optimal_for_training: boolean;
    };

    // From Sleep Engine
    sleep: {
        last_night_quality: number; // 0-100
        debt_hours: number;
        architecture_quality: 'optimal' | 'good' | 'poor' | 'critical';
    };

    // From Fuel Engine
    fuel: {
        glycogen_status: 'full' | 'moderate' | 'low' | 'depleted';
        hydration_status: 'optimal' | 'adequate' | 'low' | 'critical';
        current_window: string | null;
        protein_met: boolean;
    };
}

// ============================================================================
// ACTION TYPES
// ============================================================================

/** Priority levels for actions */
export type ActionPriority = 'critical' | 'high' | 'medium' | 'low' | 'optional';

/** Categories of actions */
export type ActionCategory =
    | 'safety'      // Sleep, injury prevention
    | 'training'    // Workout-related
    | 'recovery'    // Recovery modalities
    | 'fuel'        // Nutrition/hydration
    | 'mindspace'   // Mental/stress
    | 'circadian';  // Light, timing

/** Time sensitivity of actions */
export type TimeSensitivity =
    | 'immediate'      // Do now
    | 'within_30min'   // Time-critical window
    | 'within_hour'    // Soon
    | 'today'          // Sometime today
    | 'flexible';      // When convenient

/** A recommended action from the intelligence layer */
export interface AdaptiveAction {
    id: string;
    title: string;
    description: string;

    // Classification
    category: ActionCategory;
    priority: ActionPriority;
    time_sensitivity: TimeSensitivity;
    time_of_day?: string; // "08:00" format for timeline consistency

    // Context
    optimal_time?: Date;
    duration_minutes?: number;

    // Style & Visuals
    icon?: string;

    // Reasoning
    rationale: {
        primary_reason: string;
        supporting_signals: string[];
        science_brief?: string;
        impact_summary?: string;
    };

    // Rich Specifics (Salvaged from legacy)
    specifics?: {
        fuel?: { macros: { carbs: number; protein: number }; suggestions: string[] };
        sleep?: { bedtime: string; hygiene_stack?: any };
        mindspace?: { breathing_pattern: string };
    };

    // Conflicts/Dependencies
    blocks?: string[];           // Actions this blocks
    blocked_by?: string[];       // Actions that block this
    synergizes_with?: string[];  // Actions that enhance this

    // User interaction
    dismissable: boolean;
    snooze_options?: number[];   // Minutes to snooze

    // Source tracking
    source_engine: string;
    confidence: number; // 0-1
}

// ============================================================================
// DECISION FRAMEWORK
// ============================================================================

/** Decision context for the intelligence layer */
export interface DecisionContext {
    temporal: TemporalContext;
    session: SessionContext;
    physiological: PhysiologicalState;
    user_goal: string;
    user_preferences: UserPreferences;
}

/** User preferences that affect recommendations */
export interface UserPreferences {
    wake_time: string;           // "06:00"
    sleep_time: string;          // "22:00"
    training_days: number[];     // [1,2,3,5] = Mon,Tue,Wed,Fri
    preferred_training_time: 'morning' | 'midday' | 'evening';

    // Modality preferences
    has_sauna_access: boolean;
    has_cold_exposure_access: boolean;
    meditation_experience: 'none' | 'beginner' | 'intermediate' | 'advanced';

    // Dietary
    dietary_restrictions: string[];
    intermittent_fasting: boolean;
    fasting_window?: { start: string; end: string };
}

/** The output of the intelligence layer */
export interface AdaptiveIntelligenceOutput {
    // Current state summary
    state_summary: {
        overall_readiness: number; // 0-100
        status: 'thriving' | 'good' | 'fair' | 'caution' | 'rest';
        headline: string;
        subheadline: string;
    };

    // Prioritized actions
    commander_action: AdaptiveAction;     // The ONE thing to do now
    upcoming_actions: AdaptiveAction[];   // Next 2-3 actions
    all_actions: AdaptiveAction[];        // Full list

    // Active alerts
    alerts: Alert[];

    // Time-based view
    timeline: TimelineSlot[];

    // Learning insights
    patterns_detected: string[];
    personalization_notes: string[];
}

/** System alerts */
export interface Alert {
    id: string;
    severity: 'info' | 'warning' | 'critical';
    title: string;
    message: string;
    action_id?: string;
    expires_at?: Date;
}

/** Timeline slot for daily view */
export interface TimelineSlot {
    time: Date;
    label: string;
    type: 'action' | 'session' | 'window' | 'rest';
    action?: AdaptiveAction;
    is_current: boolean;
    is_optimal: boolean;
}

// ============================================================================
// RULE TYPES
// ============================================================================

/** A decision rule for the intelligence layer */
export interface DecisionRule {
    id: string;
    name: string;
    description: string;

    // Conditions
    condition: (ctx: DecisionContext) => boolean;

    // Priority (lower = higher priority)
    priority_order: number;

    // Action generation
    generate_action: (ctx: DecisionContext) => AdaptiveAction | null;

    // Category for organization
    category: ActionCategory;

    // Whether this rule can be overridden
    is_veto: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Safety thresholds that trigger rest recommendations */
export const SAFETY_THRESHOLDS = {
    hrv_critical_floor: 30,        // Below this = mandatory rest
    acwr_danger_ceiling: 1.5,      // Above this = injury risk
    sleep_debt_critical: 10,       // Hours of accumulated debt
    recovery_score_floor: 30,      // Below this = rest
    overreaching_days: 7           // Days before intervention
};

/** Time windows for recommendations */
export const TIME_WINDOWS = {
    morning_light: { start: 6, end: 10 },        // Hours for light exposure
    no_caffeine_before_bed: 8,                   // Hours before sleep
    no_intense_before_bed: 4,                    // Hours before sleep
    post_workout_fuel: 2,                        // Hours window
    nap_latest: 15,                              // 3 PM latest for nap
    sauna_after_workout_min: 0.5                 // Hours after workout
};

/** Action templates */
export const ACTION_TEMPLATES = {
    rest_day: {
        title: 'Rest Day',
        description: 'Your body needs recovery. Focus on gentle movement and restoration.',
        category: 'safety' as ActionCategory,
        priority: 'critical' as ActionPriority
    },
    morning_light: {
        title: 'Morning Light Exposure',
        description: 'Get 10+ minutes of outdoor light to anchor your circadian rhythm.',
        category: 'circadian' as ActionCategory,
        priority: 'high' as ActionPriority
    },
    hydration_check: {
        title: 'Hydration Check',
        description: 'Drink 500ml of water with electrolytes.',
        category: 'fuel' as ActionCategory,
        priority: 'medium' as ActionPriority
    }
};
