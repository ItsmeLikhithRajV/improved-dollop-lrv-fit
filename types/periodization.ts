/**
 * Competition Periodization Types
 * 
 * Research-backed periodization system based on:
 * - Tudor Bompa's periodization principles
 * - Issurin's block periodization
 * - Mujika/Padilla taper research
 * - Banister's fitness-fatigue model
 */

// ============================================================================
// TRAINING PHASES
// ============================================================================

/**
 * Macrocycle - Full training year or competition cycle
 */
export interface Macrocycle {
    id: string;
    name: string;
    sport: string;
    start_date: string; // ISO date
    end_date: string;
    target_event: TargetEvent;
    mesocycles: Mesocycle[];
    annual_plan: AnnualPlan;
}

/**
 * Mesocycle - 3-6 week training block
 */
export interface Mesocycle {
    id: string;
    name: string;
    type: MesocycleType;
    start_date: string;
    end_date: string;
    weeks: number;
    microcycles: Microcycle[];
    objectives: string[];
    key_workouts: KeyWorkout[];
    volume_target: VolumeTarget;
    intensity_distribution: IntensityDistribution;
}

export type MesocycleType =
    | 'general_preparation'   // GPP - Base building
    | 'specific_preparation'  // SPP - Sport-specific
    | 'pre_competition'       // Sharpening
    | 'competition'           // Race/event period
    | 'taper'                 // Peaking
    | 'transition'            // Recovery/off-season
    | 'accumulation'          // Block: Volume focus
    | 'transmutation'         // Block: Intensity focus
    | 'realization';          // Block: Performance expression

/**
 * Microcycle - Single training week
 */
export interface Microcycle {
    id: string;
    week_number: number;
    type: MicrocycleType;
    start_date: string;
    sessions: PlannedSession[];
    volume_load: number;
    intensity_avg: number;
    recovery_focus: boolean;
}

export type MicrocycleType =
    | 'loading'      // High load
    | 'development'  // Moderate-high load
    | 'recovery'     // Low load
    | 'competition'  // Race week
    | 'taper'        // Reduced load
    | 'deload';      // Very low load

// ============================================================================
// TARGET EVENT
// ============================================================================

export interface TargetEvent {
    id: string;
    name: string;
    date: string;
    priority: 'A' | 'B' | 'C';
    event_type: EventType;
    performance_goal?: PerformanceGoal;
    environmental_factors?: EnvironmentalFactors;
    competition_format?: CompetitionFormat;
}

export type EventType =
    | 'race'          // Single event
    | 'tournament'    // Multi-day
    | 'season_peak'   // Peak performance window
    | 'qualifier'     // Selection event
    | 'test_event';   // Training competition

export interface PerformanceGoal {
    target_time?: string;         // e.g., "3:15:00" for marathon
    target_pace?: number;         // min/km
    target_power?: number;        // watts
    target_placing?: number;
    finish_goal?: boolean;        // Just finish
    process_goals: string[];      // e.g., "Negative split"
}

export interface EnvironmentalFactors {
    expected_temperature_c: number;
    expected_humidity_percent: number;
    altitude_m: number;
    course_profile: 'flat' | 'rolling' | 'hilly' | 'mountainous';
    time_zone_difference?: number;
}

export interface CompetitionFormat {
    duration_hours: number;
    stages?: number;
    heats?: boolean;
    multi_sport?: boolean;
    disciplines?: string[];
}

// ============================================================================
// VOLUME AND INTENSITY
// ============================================================================

export interface VolumeTarget {
    weekly_hours: number;
    weekly_tss?: number;          // Training Stress Score
    total_distance_km?: number;
    session_count: number;
    key_session_count: number;
}

/**
 * Seiler's 80/20 or Polarized model
 * Zone 1: Easy (< LT1)
 * Zone 2: Moderate (LT1-LT2) - "Black hole"
 * Zone 3: Hard (> LT2)
 */
export interface IntensityDistribution {
    zone1_percent: number;  // Easy: 75-80%
    zone2_percent: number;  // Moderate: 5-10%
    zone3_percent: number;  // Hard: 15-20%
    model: 'polarized' | 'pyramidal' | 'threshold';
}

// Research reference:
// Polarized: 80% Z1, 0-5% Z2, 15-20% Z3 (Seiler)
// Pyramidal: 75% Z1, 15% Z2, 10% Z3
// Threshold: 60% Z1, 25% Z2, 15% Z3

export const INTENSITY_MODELS: Record<string, IntensityDistribution> = {
    polarized: { zone1_percent: 80, zone2_percent: 5, zone3_percent: 15, model: 'polarized' },
    pyramidal: { zone1_percent: 75, zone2_percent: 15, zone3_percent: 10, model: 'pyramidal' },
    threshold: { zone1_percent: 60, zone2_percent: 25, zone3_percent: 15, model: 'threshold' }
};

// ============================================================================
// TAPER PROTOCOLS
// ============================================================================

/**
 * Mujika & Padilla (2003) taper research:
 * - Volume reduction: 40-60%
 * - Maintain intensity
 * - Maintain frequency (slight reduction ok)
 * - Duration: 8-14 days optimal
 */
export interface TaperProtocol {
    type: TaperType;
    duration_days: number;
    volume_reduction_percent: number;
    intensity_maintained: boolean;
    frequency_reduction_percent: number;
    phases: TaperPhase[];
}

export type TaperType =
    | 'step'          // Sudden drop
    | 'linear'        // Gradual decline
    | 'exponential'   // Fast initial drop, then plateau
    | 'progressive';  // Multi-step

export interface TaperPhase {
    name: string;
    days: number;
    volume_percent: number;  // Of normal
    intensity_percent: number;
    focus: string;
}

// Research-backed taper protocol (Mujika)
export const OPTIMAL_TAPER: TaperProtocol = {
    type: 'exponential',
    duration_days: 14,
    volume_reduction_percent: 50,
    intensity_maintained: true,
    frequency_reduction_percent: 20,
    phases: [
        { name: 'Initial Reduction', days: 4, volume_percent: 70, intensity_percent: 100, focus: 'Maintain quality' },
        { name: 'Primary Taper', days: 7, volume_percent: 50, intensity_percent: 100, focus: 'Super-compensation' },
        { name: 'Race Week', days: 3, volume_percent: 30, intensity_percent: 90, focus: 'Activation' }
    ]
};

// ============================================================================
// FITNESS-FATIGUE MODEL
// ============================================================================

/**
 * Banister's Impulse-Response Model
 * Performance = Fitness - Fatigue
 * 
 * Fitness: τ = 42 days (slow decay)
 * Fatigue: τ = 7 days (fast decay)
 */
export interface FitnessFatigueState {
    fitness: number;           // CTL-like (chronic training load)
    fatigue: number;           // ATL-like (acute training load)
    form: number;              // TSB-like (form = fitness - fatigue)
    fitness_tau_days: number;  // ~ 42 days
    fatigue_tau_days: number;  // ~ 7 days
    predicted_performance: number;
}

export const FITNESS_FATIGUE_CONSTANTS = {
    fitness_time_constant: 42,  // days
    fatigue_time_constant: 7,   // days
    fitness_weight: 1.0,
    fatigue_weight: 2.0,        // Fatigue impacts more per unit
    optimal_form_range: { min: 10, max: 30 } // TSB for peak performance
};

// ============================================================================
// ANNUAL PLAN
// ============================================================================

export interface AnnualPlan {
    periodization_model: 'linear' | 'block' | 'undulating' | 'conjugate';
    competition_density: 'low' | 'moderate' | 'high';
    peak_count: number;
    training_phases: {
        general_prep_weeks: number;
        specific_prep_weeks: number;
        competition_weeks: number;
        transition_weeks: number;
    };
    volume_periodization: VolumePattern;
    key_metrics: AnnualMetrics;
}

export interface VolumePattern {
    peak_volume_week: number;     // Week number
    peak_volume_hours: number;
    base_volume_hours: number;
    progression_percent_per_week: number;
}

export interface AnnualMetrics {
    total_hours: number;
    total_distance_km?: number;
    total_tss?: number;
    key_session_count: number;
    race_count: number;
    deload_weeks: number;
}

// ============================================================================
// PLANNED SESSIONS
// ============================================================================

export interface PlannedSession {
    id: string;
    day: number;  // 0-6
    type: SessionType;
    name: string;
    description: string;
    duration_min: number;
    intensity: IntensityLevel;
    key_workout: boolean;
    intervals?: IntervalSet[];
    target_metrics?: TargetMetrics;
}

export type SessionType =
    | 'endurance'       // Long easy
    | 'tempo'           // LT1 work
    | 'threshold'       // LT2 work
    | 'vo2max'          // High intensity intervals
    | 'sprint'          // Neuromuscular
    | 'strength'        // Gym work
    | 'recovery'        // Easy/active recovery
    | 'race_simulation' // Rehearsal
    | 'skills';         // Technical

export type IntensityLevel = 'easy' | 'moderate' | 'tempo' | 'threshold' | 'hard' | 'max';

export interface IntervalSet {
    reps: number;
    work_duration_sec: number;
    rest_duration_sec: number;
    intensity: IntensityLevel;
    target_hr?: number;
    target_power?: number;
    target_pace?: string;
}

export interface TargetMetrics {
    hr_zone?: number;
    power_zone?: number;
    pace_zone?: number;
    rpe?: number;
    cadence?: number;
}

// ============================================================================
// KEY WORKOUTS
// ============================================================================

export interface KeyWorkout {
    id: string;
    name: string;
    purpose: string;
    type: SessionType;
    structure: string;
    frequency: string;  // e.g., "1x per week"
    progression: KeyWorkoutProgression[];
}

export interface KeyWorkoutProgression {
    mesocycle: string;
    modification: string;
}

// Common key workouts by sport
export const ENDURANCE_KEY_WORKOUTS: KeyWorkout[] = [
    {
        id: 'long_run',
        name: 'Long Run',
        purpose: 'Aerobic base, fat oxidation, mental endurance',
        type: 'endurance',
        structure: '60-150min at easy pace',
        frequency: '1x per week',
        progression: [
            { mesocycle: 'Base', modification: 'Duration +10min/week' },
            { mesocycle: 'Build', modification: 'Add tempo finish' },
            { mesocycle: 'Peak', modification: 'Race simulation' }
        ]
    },
    {
        id: 'tempo_run',
        name: 'Tempo Run',
        purpose: 'Lactate threshold improvement',
        type: 'tempo',
        structure: '20-40min at LT1 pace',
        frequency: '1x per week',
        progression: [
            { mesocycle: 'Base', modification: '20min continuous' },
            { mesocycle: 'Build', modification: '30-40min or cruise intervals' },
            { mesocycle: 'Peak', modification: 'Race-specific tempo' }
        ]
    },
    {
        id: 'intervals',
        name: 'VO2max Intervals',
        purpose: 'Maximal aerobic capacity',
        type: 'vo2max',
        structure: '4-6 x 3-5min at 95-100% VO2max',
        frequency: '1x per week (in build phase)',
        progression: [
            { mesocycle: 'Base', modification: 'Fartlek introduction' },
            { mesocycle: 'Build', modification: 'Structured intervals' },
            { mesocycle: 'Peak', modification: 'Shorter, sharper' }
        ]
    }
];

// ============================================================================
// PERIODIZATION ANALYSIS OUTPUT
// ============================================================================

export interface PeriodizationAnalysis {
    current_macrocycle: Macrocycle;
    current_mesocycle: Mesocycle;
    current_microcycle: Microcycle;
    days_to_target: number;
    current_phase: MesocycleType;
    fitness_fatigue: FitnessFatigueState;
    taper_protocol?: TaperProtocol;
    recommendations: PeriodizationRecommendation[];
    weekly_summary: WeeklySummary;
    phase_progress: PhaseProgress;
}

export interface PeriodizationRecommendation {
    type: 'volume' | 'intensity' | 'recovery' | 'taper' | 'phase_transition';
    priority: 'high' | 'medium' | 'low';
    message: string;
    action: string;
    rationale: string;
}

export interface WeeklySummary {
    planned_volume_hours: number;
    completed_volume_hours: number;
    adherence_percent: number;
    key_sessions_completed: number;
    key_sessions_planned: number;
    load_vs_plan: 'under' | 'on_track' | 'over';
}

export interface PhaseProgress {
    current_week: number;
    total_weeks: number;
    percent_complete: number;
    objectives_met: string[];
    objectives_remaining: string[];
    readiness_for_next_phase: number; // 0-100
}

// ============================================================================
// TRAINING CALENDAR
// ============================================================================

export interface TrainingCalendar {
    year: number;
    months: CalendarMonth[];
    events: TargetEvent[];
    training_camps?: TrainingCamp[];
}

export interface CalendarMonth {
    month: number; // 1-12
    weeks: CalendarWeek[];
    phase: MesocycleType;
    volume_target_hours: number;
}

export interface CalendarWeek {
    week_number: number;
    start_date: string;
    type: MicrocycleType;
    sessions: PlannedSession[];
    notes?: string;
}

export interface TrainingCamp {
    name: string;
    start_date: string;
    end_date: string;
    location: string;
    focus: string;
    volume_multiplier: number;  // e.g., 1.5x normal volume
}
