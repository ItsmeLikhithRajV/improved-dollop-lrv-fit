/**
 * Circadian Rhythm Types - Chronobiology for Performance
 * 
 * Based on:
 * - Facer-Childs & Brandstaetter (2015) - Circadian phenotype and athletic performance
 * - Core body temperature rhythm peaks at 5-7 PM
 * - Performance variation up to 26% throughout the day
 * - Huberman Lab protocols for light exposure and dopamine
 */

// ============================================================================
// CHRONOTYPE
// ============================================================================

export type Chronotype = 'definite_morning' | 'moderate_morning' | 'intermediate' | 'moderate_evening' | 'definite_evening';

export interface ChronotypeProfile {
    type: Chronotype;
    natural_wake_time: string;    // Preferred wake time
    natural_sleep_time: string;   // Preferred sleep time
    peak_alertness_time: string;  // When most alert
    peak_physical_time: string;   // When physical performance peaks
    energy_dip_time: string;      // Afternoon slump
    morningness_score: number;    // MEQ score (16-86)
}

// ============================================================================
// CIRCADIAN PHASE
// ============================================================================

export interface CircadianPhase {
    current_time: string;
    phase: CircadianPhaseType;
    phase_description: string;

    // Core body temperature
    estimated_core_temp: number;  // Celsius
    temp_trend: 'rising' | 'peak' | 'falling' | 'trough';

    // Key hormone levels (relative 0-100)
    cortisol_level: number;
    melatonin_level: number;
    testosterone_level: number;
    growth_hormone_level: number;

    // Performance predictions
    physical_performance: number;     // 0-100
    cognitive_performance: number;    // 0-100
    reaction_time_relative: number;   // 100 = baseline, lower = faster
    coordination_level: number;       // 0-100

    // Risk assessment
    injury_risk_relative: number;     // 100 = baseline, higher = more risk
}

export type CircadianPhaseType =
    | 'night_trough'         // 2-5 AM - lowest alertness
    | 'dawn_rising'          // 5-7 AM - cortisol surge
    | 'morning_alert'        // 7-10 AM - high alertness
    | 'late_morning'         // 10-12 PM - cognitive peak
    | 'post_lunch_dip'       // 12-2 PM - natural dip
    | 'afternoon_rising'     // 2-4 PM - second wind
    | 'evening_peak'         // 4-7 PM - physical peak
    | 'dusk_declining'       // 7-9 PM - winding down
    | 'night_onset'          // 9-11 PM - melatonin rising
    | 'early_sleep';         // 11 PM - 2 AM - deep sleep window

// ============================================================================
// BODY TEMPERATURE RHYTHM
// ============================================================================

export interface BodyTemperatureCurve {
    // 24-hour curve (hourly estimates)
    hourly_temps: { hour: number; temp_celsius: number; temp_fahrenheit: number }[];

    // Key points
    minimum_time: string;      // ~4:30 AM typically
    minimum_temp: number;      // ~36.0°C
    maximum_time: string;      // ~5-7 PM typically
    maximum_temp: number;      // ~37.5°C

    // Current
    current_estimated_temp: number;
    current_relative_to_range: number;  // 0 = minimum, 100 = maximum
}

// ============================================================================
// OPTIMAL TRAINING WINDOWS
// ============================================================================

export interface TrainingWindow {
    type: TrainingWindowType;
    optimal_start: string;
    optimal_end: string;
    rationale: string;
    performance_boost: string;    // Expected improvement vs worst time
    current_availability: 'optimal' | 'good' | 'suboptimal' | 'avoid';
}

export type TrainingWindowType =
    | 'strength_power'        // 4-7 PM - peak body temp, reaction time
    | 'endurance'             // 4-7 PM - highest VO2max efficiency
    | 'skill_acquisition'     // 10 AM - 12 PM - high alertness, consolidation
    | 'recovery_session'      // Morning - lower intensity impact
    | 'hiit'                  // 4-7 PM - peak output
    | 'flexibility'           // Evening - muscles warmest
    | 'competition_prep';     // Match event timing

export const OPTIMAL_TRAINING_WINDOWS: Record<TrainingWindowType, { start: string; end: string; rationale: string }> = {
    strength_power: {
        start: '16:00',
        end: '19:00',
        rationale: 'Peak body temp (+1.5°C), fastest reaction time, highest coordination'
    },
    endurance: {
        start: '16:00',
        end: '19:00',
        rationale: 'VO2max highest, lung function peaks, lowest perceived exertion'
    },
    skill_acquisition: {
        start: '10:00',
        end: '12:00',
        rationale: 'High alertness, good consolidation, cortisol supports focus'
    },
    recovery_session: {
        start: '08:00',
        end: '11:00',
        rationale: 'Lower cortisol impact, gentle movement, doesn\'t disrupt circadian'
    },
    hiit: {
        start: '16:00',
        end: '19:00',
        rationale: 'Maximum power output, anaerobic capacity peaks'
    },
    flexibility: {
        start: '17:00',
        end: '20:00',
        rationale: 'Muscles warmest, joints most mobile, reduced injury risk'
    },
    competition_prep: {
        start: '00:00',
        end: '23:59',
        rationale: 'Train at actual competition time for circadian entrainment'
    }
};

// ============================================================================
// LIGHT EXPOSURE (HUBERMAN PROTOCOL)
// ============================================================================

export interface LightExposure {
    timestamp: string;
    duration_minutes: number;
    intensity: 'dim' | 'indoor' | 'bright_indoor' | 'outdoor_overcast' | 'outdoor_sunny';
    lux_estimated: number;
    type: 'beneficial_morning' | 'beneficial_afternoon' | 'neutral' | 'harmful_evening' | 'harmful_night';
    source: 'sunlight' | 'artificial' | 'screen' | 'unknown';
}

export interface LightExposureTracking {
    // Morning light (critical)
    morning_light_achieved: boolean;
    morning_light_duration: number;   // Minutes within 1h of waking
    morning_light_time: string;

    // Afternoon light (helpful)
    afternoon_light_duration: number; // Minutes 2-4 PM

    // Evening light (harmful)
    evening_bright_light_exposure: boolean;  // After 8 PM
    screen_time_after_sunset: number;        // Minutes

    // Score
    light_hygiene_score: number;      // 0-100

    // Recommendations
    recommendations: string[];
}

export const HUBERMAN_LIGHT_PROTOCOL = {
    morning: {
        timing: 'Within 30-60 minutes of waking',
        duration_clear_day: 10,     // minutes
        duration_overcast: 20,      // minutes
        method: 'Direct outdoor sunlight, no sunglasses',
        benefits: ['Cortisol pulse', 'Dopamine boost', 'Circadian anchor', 'Melatonin timer set']
    },
    afternoon: {
        timing: '2-4 PM',
        duration: 10,               // minutes
        method: 'Outdoor light exposure',
        benefits: ['Prevents evening melatonin delay', 'Maintains alertness']
    },
    evening: {
        timing: 'After sunset',
        avoid: ['Bright overhead lights', 'Blue light from screens', 'Bright bathroom lights'],
        alternatives: ['Dim warm lighting', 'Blue light blocking glasses', 'Candlelight']
    },
    night: {
        timing: '10 PM - 4 AM',
        rule: 'Zero bright light exposure',
        consequences: ['Damages dopamine', 'Impairs mood', 'Disrupts learning', 'Reduces melatonin']
    }
};

// ============================================================================
// CIRCADIAN DISRUPTION
// ============================================================================

export interface CircadianDisruption {
    type: 'jet_lag' | 'shift_work' | 'social_jet_lag' | 'irregular_schedule';
    severity: 'mild' | 'moderate' | 'severe';
    hours_of_shift: number;
    recovery_days_estimated: number;  // ~1 day per hour of shift
    current_phase_delay: number;      // Hours behind optimal
    recommendations: string[];
}

export interface SocialJetLag {
    weekday_midpoint: string;     // Midpoint of sleep on weekdays
    weekend_midpoint: string;     // Midpoint of sleep on weekends
    lag_hours: number;            // Difference
    impact: 'none' | 'mild' | 'moderate' | 'significant';
    // Research: >2 hours associated with metabolic dysfunction
}

// ============================================================================
// COMPLETE CIRCADIAN ANALYSIS OUTPUT
// ============================================================================

export interface CircadianAnalysisOutput {
    chronotype: ChronotypeProfile;
    current_phase: CircadianPhase;
    body_temp_curve: BodyTemperatureCurve;

    // Training recommendations
    optimal_windows_today: TrainingWindow[];
    best_training_time: string;
    avoid_training_times: string[];

    // Light exposure
    light_tracking: LightExposureTracking;

    // Disruptions
    disruptions: CircadianDisruption[];
    social_jet_lag: SocialJetLag;

    // Alignment score
    circadian_alignment_score: number;  // 0-100

    // Personalized schedule
    recommended_wake_time: string;
    recommended_light_exposure_time: string;
    recommended_training_time: string;
    recommended_last_meal_time: string;
    recommended_wind_down_time: string;
    recommended_sleep_time: string;
}

// ============================================================================
// BRYAN JOHNSON CIRCADIAN PROTOCOL
// ============================================================================

export const BLUEPRINT_CIRCADIAN_PROTOCOL = {
    wake_time: '04:30',
    uv_light_exposure: {
        time: '04:35',
        duration: 4,                // minutes
        purpose: 'Circadian anchor, cortisol pulse'
    },
    morning_light: {
        time: '05:30',
        duration: 60,               // During workout, outdoor if possible
    },
    last_meal: '11:00',           // 9.5h before bed
    wind_down_start: '19:30',
    screen_cutoff: '19:30',
    sleep_time: '20:30',
    consistency: true,            // Same schedule 7 days/week
    tolerance_minutes: 15         // Maximum deviation
};
