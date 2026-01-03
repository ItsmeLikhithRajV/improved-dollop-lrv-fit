/**
 * Recovery Matrix Types - Multi-System Recovery Tracking
 * 
 * Based on:
 * - Multi-system athlete recovery modeling
 * - Training adaptation research
 * - Sauna/cold exposure protocols
 * - Sleep, nutrition, psychological recovery integration
 */

// ============================================================================
// RECOVERY SYSTEMS
// ============================================================================

export type RecoverySystem =
    | 'muscular'
    | 'neural'
    | 'hormonal'
    | 'metabolic'
    | 'immune'
    | 'psychological';

export interface SystemRecoveryStatus {
    system: RecoverySystem;
    score: number;               // 0-100
    trend: 'improving' | 'stable' | 'declining';
    estimated_full_recovery_hours: number;

    // What's impacting this system
    positive_factors: string[];
    negative_factors: string[];

    // Status
    status: 'recovered' | 'recovering' | 'fatigued' | 'overreached';

    // Display
    color: string;
    icon_name: string;
    description: string;
}

// ============================================================================
// RECOVERY MODALITIES
// ============================================================================

export type RecoveryModalityType =
    | 'sleep'
    | 'nutrition'
    | 'hydration'
    | 'active_recovery'
    | 'cold_therapy'
    | 'heat_therapy'
    | 'contrast_therapy'
    | 'compression'
    | 'massage'
    | 'foam_rolling'
    | 'stretching'
    | 'breathing'
    | 'meditation'
    | 'nap';

export interface RecoveryModality {
    type: RecoveryModalityType;
    name: string;
    description: string;

    // Timing
    duration_minutes: { min: number; optimal: number; max: number };
    frequency_per_week: { min: number; optimal: number };

    // Best timing
    optimal_timing: 'morning' | 'post_training' | 'evening' | 'anytime';
    avoid_timing?: string;

    // Systems impacted
    primary_systems: RecoverySystem[];
    secondary_systems: RecoverySystem[];

    // Expected benefit
    effectiveness: number;  // 0-100
    time_to_effect: string;

    // Contraindications
    contraindications?: string[];

    // Research backing
    evidence_level: 'strong' | 'moderate' | 'emerging' | 'anecdotal';
    research_note?: string;
}

// ============================================================================
// RECOVERY MODALITY LIBRARY
// ============================================================================

export const RECOVERY_MODALITIES: RecoveryModality[] = [
    {
        type: 'sleep',
        name: 'Quality Sleep',
        description: 'The foundation of all recovery. 7-9 hours with good sleep architecture.',
        duration_minutes: { min: 420, optimal: 480, max: 540 },
        frequency_per_week: { min: 7, optimal: 7 },
        optimal_timing: 'evening',
        primary_systems: ['muscular', 'neural', 'hormonal', 'immune'],
        secondary_systems: ['metabolic', 'psychological'],
        effectiveness: 100,
        time_to_effect: 'Immediate (next day)',
        evidence_level: 'strong',
        research_note: 'GH peaks during deep sleep. REM critical for motor learning.'
    },
    {
        type: 'cold_therapy',
        name: 'Cold Exposure',
        description: 'Cold water immersion or cold shower for inflammation and dopamine.',
        duration_minutes: { min: 1, optimal: 3, max: 5 },
        frequency_per_week: { min: 2, optimal: 4 },
        optimal_timing: 'morning',
        avoid_timing: 'Immediately after strength training (within 4 hours)',
        primary_systems: ['immune', 'psychological'],
        secondary_systems: ['neural'],
        effectiveness: 70,
        time_to_effect: 'Dopamine + norepinephrine boost within minutes, lasts 2-3 hours',
        contraindications: ['Immediately post-strength training', 'Cardiovascular conditions'],
        evidence_level: 'moderate',
        research_note: 'Dopamine +250%, norepinephrine +200-300%. May blunt hypertrophy if done immediately after strength training.'
    },
    {
        type: 'heat_therapy',
        name: 'Sauna',
        description: 'Heat exposure for GH release, cardiovascular benefits, and relaxation.',
        duration_minutes: { min: 15, optimal: 20, max: 30 },
        frequency_per_week: { min: 2, optimal: 4 },
        optimal_timing: 'evening',
        primary_systems: ['muscular', 'hormonal'],
        secondary_systems: ['psychological', 'immune'],
        effectiveness: 75,
        time_to_effect: 'GH peaks during and immediately after. Relaxation immediate.',
        contraindications: ['Dehydration', 'Immediately before intense exercise'],
        evidence_level: 'moderate',
        research_note: 'GH increases 2-16x depending on protocol. Heat shock proteins aid muscle repair.'
    },
    {
        type: 'contrast_therapy',
        name: 'Contrast Therapy',
        description: 'Alternating hot and cold for circulation and recovery.',
        duration_minutes: { min: 20, optimal: 30, max: 45 },
        frequency_per_week: { min: 1, optimal: 3 },
        optimal_timing: 'post_training',
        primary_systems: ['muscular', 'immune'],
        secondary_systems: ['hormonal', 'psychological'],
        effectiveness: 80,
        time_to_effect: 'Immediate circulation boost. Full recovery benefit over 24-48h.',
        contraindications: ['Cardiovascular conditions', 'Open wounds'],
        evidence_level: 'moderate',
        research_note: 'Vascular pumping action. Combines benefits of both modalities.'
    },
    {
        type: 'active_recovery',
        name: 'Active Recovery',
        description: 'Light movement to promote blood flow without adding stress.',
        duration_minutes: { min: 15, optimal: 30, max: 45 },
        frequency_per_week: { min: 2, optimal: 3 },
        optimal_timing: 'anytime',
        primary_systems: ['muscular', 'metabolic'],
        secondary_systems: ['psychological'],
        effectiveness: 65,
        time_to_effect: 'Immediate blood flow, soreness reduction over 24h',
        evidence_level: 'strong',
        research_note: 'Light activity (Zone 1) clears lactate and enhances nutrient delivery.'
    },
    {
        type: 'breathing',
        name: 'Breathwork',
        description: 'Controlled breathing for nervous system regulation.',
        duration_minutes: { min: 3, optimal: 5, max: 20 },
        frequency_per_week: { min: 3, optimal: 7 },
        optimal_timing: 'anytime',
        primary_systems: ['neural', 'psychological'],
        secondary_systems: ['hormonal'],
        effectiveness: 70,
        time_to_effect: 'Immediate shift to parasympathetic state',
        evidence_level: 'strong',
        research_note: 'Physiological sigh (double inhale, long exhale) proven by Stanford research'
    },
    {
        type: 'nap',
        name: 'Power Nap',
        description: 'Short sleep for cognitive and physical recovery.',
        duration_minutes: { min: 10, optimal: 20, max: 30 },
        frequency_per_week: { min: 0, optimal: 3 },
        optimal_timing: 'post_training',
        avoid_timing: 'After 3 PM (may disrupt night sleep)',
        primary_systems: ['neural', 'psychological'],
        secondary_systems: ['muscular'],
        effectiveness: 60,
        time_to_effect: 'Immediate upon waking',
        evidence_level: 'strong',
        research_note: '20-30 min optimal. 90 min for full cycle if severely sleep deprived.'
    },
    {
        type: 'massage',
        name: 'Massage Therapy',
        description: 'Manual therapy for muscle tension and recovery.',
        duration_minutes: { min: 30, optimal: 60, max: 90 },
        frequency_per_week: { min: 1, optimal: 2 },
        optimal_timing: 'post_training',
        primary_systems: ['muscular'],
        secondary_systems: ['psychological', 'neural'],
        effectiveness: 70,
        time_to_effect: 'Immediate relaxation, full benefit over 24-48h',
        evidence_level: 'moderate'
    },
    {
        type: 'foam_rolling',
        name: 'Foam Rolling / SMR',
        description: 'Self-myofascial release for mobility and recovery.',
        duration_minutes: { min: 5, optimal: 15, max: 20 },
        frequency_per_week: { min: 3, optimal: 5 },
        optimal_timing: 'anytime',
        primary_systems: ['muscular'],
        secondary_systems: ['neural'],
        effectiveness: 55,
        time_to_effect: 'Immediate increase in range of motion',
        evidence_level: 'moderate',
        research_note: 'Temporary ROM increase. Best combined with stretching.'
    },
    {
        type: 'meditation',
        name: 'Meditation / NSDR',
        description: 'Mental recovery and dopamine restoration.',
        duration_minutes: { min: 10, optimal: 20, max: 30 },
        frequency_per_week: { min: 3, optimal: 7 },
        optimal_timing: 'anytime',
        primary_systems: ['psychological', 'neural'],
        secondary_systems: ['hormonal'],
        effectiveness: 65,
        time_to_effect: 'Immediate calm. Cumulative benefits over weeks.',
        evidence_level: 'strong',
        research_note: 'NSDR (Yoga Nidra) restores dopamine levels after depletion.'
    }
];

// ============================================================================
// RECOVERY RECOMMENDATION
// ============================================================================

export interface RecoveryRecommendation {
    modality: RecoveryModality;
    priority: 'critical' | 'high' | 'medium' | 'low';
    reason: string;
    suggested_duration: number;
    suggested_time: string;
    target_systems: RecoverySystem[];
}

// ============================================================================
// OVERREACHING DETECTION
// ============================================================================

export type OverreachingStatus =
    | 'fresh'
    | 'normal'
    | 'functional_overreaching'
    | 'non_functional_overreaching'
    | 'overtraining';

export interface OverreachingAnalysis {
    status: OverreachingStatus;
    confidence: number;
    days_in_current_state: number;

    // Contributing signals
    signals: {
        signal: string;
        value: number | string;
        threshold: number | string;
        concerning: boolean;
    }[];

    // Recovery timeline
    estimated_recovery_days: number;

    // Recommendations
    training_adjustment: string;
    recovery_focus: RecoverySystem[];
}

// ============================================================================
// RECOVERY MATRIX OUTPUT
// ============================================================================

export interface RecoveryMatrixOutput {
    // Overall
    overall_recovery_score: number;
    overall_status: 'recovered' | 'recovering' | 'fatigued' | 'overreached';

    // System breakdown
    systems: SystemRecoveryStatus[];

    // Weakest system (focus area)
    weakest_system: RecoverySystem;
    weakest_system_score: number;

    // Overreaching detection
    overreaching: OverreachingAnalysis;

    // Recommendations
    recommended_modalities: RecoveryRecommendation[];

    // Training readiness
    training_readiness: 'ready' | 'modified' | 'rest';
    max_intensity_recommended: 'high' | 'moderate' | 'low' | 'none';

    // Time estimates
    estimated_full_recovery_hours: number;
    next_assessment_time: string;
}

// ============================================================================
// CONFIGURATION & INPUTS
// ============================================================================

export interface RecoveryMatrixWeighting {
    muscular: number;
    neural: number;
    hormonal: number;
    metabolic: number;
    immune: number;
    psychological: number;
}

export interface ForcePlateData {
    jump_height_cm: number;
    rsi: number; // Reactive Strength Index
    concentric_impulse: number;
    eccentric_braking_rate: number;
    asymmetry_percent: number;
}
