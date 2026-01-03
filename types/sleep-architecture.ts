/**
 * Sleep Architecture Types - Research-Backed Sleep Stage Analysis
 * 
 * Based on:
 * - Mah et al. (2011) - Sleep extension in athletes
 * - Fullagar et al. (2015) - Sleep and athletic performance
 * - Deep sleep target: 15-25% (1.5-2.0h for 8h night)
 * - REM target: 20-25% (1.5-2.0h for 8h night)
 */

// ============================================================================
// SLEEP STAGE TYPES
// ============================================================================

export type SleepStage = 'awake' | 'light' | 'deep' | 'rem';

export interface SleepStageSegment {
    stage: SleepStage;
    start_time: string;
    end_time: string;
    duration_minutes: number;
}

export interface SleepCycle {
    start_time: string;
    end_time: string;
    duration_minutes: number;
    peak_stage: SleepStage;
}

// ============================================================================
// NIGHTLY SLEEP ANALYSIS
// ============================================================================

export interface SleepArchitecture {
    date: string;
    bedtime: string;
    wake_time: string;

    // Duration metrics
    time_in_bed: number;          // Total time in bed (minutes)
    total_sleep_time: number;     // Actual sleep time (minutes)
    sleep_efficiency: number;     // TST / TIB * 100 (%)

    // Stage breakdown
    stages: {
        awake: { duration: number; percentage: number; target_percentage: number };
        light: { duration: number; percentage: number; target_percentage: number };
        deep: { duration: number; percentage: number; target_percentage: number };
        rem: { duration: number; percentage: number; target_percentage: number };
    };

    // Stage timeline
    stage_segments: SleepStageSegment[];

    // Quality metrics
    sleep_latency: number;        // Time to fall asleep (minutes)
    waso: number;                 // Wake After Sleep Onset (minutes)
    wake_events: number;          // Number of awakenings
    wake_event_times: string[];   // Timestamps of wake events

    // First-half analysis (critical for deep sleep)
    first_half_deep_percentage: number;  // Should be >60% of total deep

    // Derived scores
    physical_recovery_score: number;     // 0-100 based on deep sleep
    cognitive_recovery_score: number;    // 0-100 based on REM
    overall_quality_score: number;       // 0-100 combined

    // Data source
    source: 'oura' | 'whoop' | 'garmin' | 'apple_watch' | 'eight_sleep' | 'manual';
}

// ============================================================================
// SLEEP DEBT TRACKING
// ============================================================================

export interface SleepDebt {
    // Individual sleep need (personalized)
    personal_sleep_need: number;   // Hours (typically 7-9)

    // Debt calculations
    debt_7d: number;               // Hours owed (last 7 days)
    debt_14d: number;              // Hours owed (last 14 days)
    debt_30d: number;              // Hours owed (last 30 days)

    // Recovery estimates
    // Research: Can only recover ~50% of debt
    debt_payback_rate: 0.5;
    estimated_recovery_days: number;

    // Thresholds
    chronic_debt_threshold: 5;     // Hours - performance impact begins
    severe_debt_threshold: 10;     // Hours - injury risk elevated

    // Status
    status: 'surplus' | 'balanced' | 'mild_debt' | 'chronic_debt' | 'severe_debt';

    // Trend
    trend: 'improving' | 'stable' | 'worsening';
}

// ============================================================================
// SLEEP TARGETS (Research-Based)
// ============================================================================

export const SLEEP_STAGE_TARGETS = {
    deep: {
        min_percentage: 15,
        optimal_percentage: 20,
        max_percentage: 25,
        min_duration_hours: 1.2,
        optimal_duration_hours: 1.8,
        function: 'Physical recovery, GH release, muscle repair, glycogen replenishment',
        impact_if_low: 'Impaired physical recovery, reduced adaptation, elevated cortisol'
    },
    rem: {
        min_percentage: 18,
        optimal_percentage: 22,
        max_percentage: 25,
        min_duration_hours: 1.2,
        optimal_duration_hours: 1.5,
        function: 'Motor memory consolidation, emotional regulation, cognitive restoration',
        impact_if_low: 'Impaired skill learning, emotional instability, reduced creativity'
    },
    light: {
        min_percentage: 45,
        optimal_percentage: 50,
        max_percentage: 55,
        function: 'Memory consolidation, transition stage',
        impact_if_low: 'Generally not a concern if deep/REM are adequate'
    },
    awake: {
        max_percentage: 10,
        optimal_percentage: 5,
        function: 'Natural microawakenings',
        impact_if_high: 'Fragmented sleep, reduced recovery efficiency'
    }
};

export const SLEEP_DURATION_TARGETS = {
    minimum: 7,
    optimal: 8,
    extended_for_athletes: 9,
    nap_optimal: 0.33,  // 20 minutes
    nap_max: 1.5        // 90 minutes (full cycle)
};

// ============================================================================
// SLEEP QUALITY FACTORS
// ============================================================================

export interface SleepQualityFactors {
    // Environment
    room_temperature: number;      // Optimal: 60-67°F / 15-19°C
    darkness_level: 'complete' | 'dim' | 'light';
    noise_level: 'silent' | 'low' | 'moderate' | 'high';

    // Behaviors
    last_meal_hours_before: number;  // Optimal: 3-4+
    last_caffeine_hours_before: number;  // Optimal: 8-10+
    alcohol_consumed: boolean;
    screen_time_before_bed: number;  // Minutes

    // Pre-sleep routine
    wind_down_duration: number;    // Minutes
    relaxation_technique_used: boolean;

    // Sleep timing
    consistency_score: number;     // How consistent vs usual bed/wake times
    circadian_alignment: boolean;  // Sleeping during natural sleep window
}

// ============================================================================
// SLEEP RECOMMENDATIONS
// ============================================================================

export interface SleepRecommendation {
    priority: 'critical' | 'high' | 'medium' | 'low';
    category: 'timing' | 'environment' | 'behavior' | 'recovery';
    title: string;
    description: string;
    expected_impact: string;
    science_brief: string;
}

export interface SleepAnalysisOutput {
    current_night: SleepArchitecture;
    debt: SleepDebt;
    weekly_average: {
        duration: number;
        efficiency: number;
        deep_percentage: number;
        rem_percentage: number;
        quality_score: number;
    };
    trends: {
        duration: 'improving' | 'stable' | 'declining';
        quality: 'improving' | 'stable' | 'declining';
        deep_sleep: 'improving' | 'stable' | 'declining';
    };
    recommendations: SleepRecommendation[];
    bedtime_recommendation: string;
    wake_recommendation: string;
}

// ============================================================================
// BRYAN JOHNSON SLEEP PROTOCOL
// ============================================================================

export const BLUEPRINT_SLEEP_PROTOCOL = {
    target_bedtime: "20:30",  // 8:30 PM
    target_wake: "05:00",     // 5:00 AM
    target_duration: 8.5,     // hours
    last_meal: "11:00",       // 11 AM (9.5h before bed)
    room_temperature_f: { min: 60, max: 67 },
    room_temperature_c: { min: 15, max: 19 },
    wind_down_start: "19:30", // 7:30 PM (1h before bed)
    screen_cutoff: "19:30",
    light_blocking: true,
    mattress_cooling: {
        deep_sleep_temp_f: 71,
        rem_temp_f: 73
    }
};
