/**
 * Breathwork Types - Evidence-Based Breathing Protocols
 * 
 * Based on:
 * - Huberman Lab research on physiological sigh
 * - Stanford study on cyclic sighing (2023)
 * - Box breathing used by Navy SEALs
 * - Autonomic nervous system regulation research
 */

// ============================================================================
// BREATHWORK PROTOCOLS
// ============================================================================

export type BreathworkType =
    | 'physiological_sigh'
    | 'cyclic_sighing'
    | 'box_breathing'
    | 'resonance_breathing'
    | 'wim_hof'
    | 'coherence_breathing'
    | '4_7_8_breathing'
    | 'nsdr';

export interface BreathworkProtocol {
    type: BreathworkType;
    name: string;
    description: string;

    // Structure
    structure: {
        inhale_seconds?: number;
        inhale_2_seconds?: number;    // For double inhale
        hold_full_seconds?: number;
        exhale_seconds?: number;
        hold_empty_seconds?: number;
        special_instruction?: string;
    };

    // Duration
    cycles?: number;
    duration_minutes?: number;

    // Effects
    primary_effect: 'calm' | 'energize' | 'focus' | 'sleep_prep' | 'recovery';
    nervous_system_shift: 'parasympathetic' | 'sympathetic' | 'balanced';

    // Use cases
    use_cases: string[];
    best_timing: string[];

    // Expected outcomes
    expected_outcomes: string[];
    onset_time: string;
    duration_of_effect: string;

    // Evidence
    evidence_level: 'strong' | 'moderate' | 'emerging';
    research_note?: string;
}

// ============================================================================
// PROTOCOL LIBRARY
// ============================================================================

export const BREATHWORK_PROTOCOLS: BreathworkProtocol[] = [
    {
        type: 'physiological_sigh',
        name: 'Physiological Sigh',
        description: 'Double inhale through nose, long exhale through mouth. The fastest way to calm down.',
        structure: {
            inhale_seconds: 3,
            inhale_2_seconds: 1,
            exhale_seconds: 6,
            special_instruction: 'Two inhales through nose (full + short top-up), then long exhale through mouth'
        },
        cycles: 1,
        primary_effect: 'calm',
        nervous_system_shift: 'parasympathetic',
        use_cases: ['Acute stress', 'Pre-competition nerves', 'Anger management', 'Sleep onset'],
        best_timing: ['When stressed', 'Before sleep', 'Between sets'],
        expected_outcomes: ['Immediate calm', 'Lower heart rate', 'Reduced anxiety'],
        onset_time: 'Immediate (one breath)',
        duration_of_effect: 'Minutes to hours depending on repetition',
        evidence_level: 'strong',
        research_note: 'Double inhale re-inflates collapsed alveoli. Long exhale activates vagus nerve.'
    },
    {
        type: 'cyclic_sighing',
        name: 'Cyclic Sighing (5 min)',
        description: 'Repeated physiological sighs for 5 minutes. Proven stress reduction protocol.',
        structure: {
            inhale_seconds: 3,
            inhale_2_seconds: 1,
            exhale_seconds: 6,
            special_instruction: 'Continuous repetition for 5 minutes'
        },
        duration_minutes: 5,
        primary_effect: 'calm',
        nervous_system_shift: 'parasympathetic',
        use_cases: ['Daily stress reduction', 'Mood improvement', 'Sleep enhancement'],
        best_timing: ['Morning', 'Before bed', 'After stressful event'],
        expected_outcomes: ['Reduced overall stress', 'Improved mood', 'Lower resting heart rate', 'Better sleep'],
        onset_time: 'Effects build over session',
        duration_of_effect: 'All-day improvement with daily practice',
        evidence_level: 'strong',
        research_note: 'Stanford 2023 study: More effective than meditation for stress reduction.'
    },
    {
        type: 'box_breathing',
        name: 'Box Breathing',
        description: 'Equal-length inhale, hold, exhale, hold. Used by Navy SEALs for focus and calm.',
        structure: {
            inhale_seconds: 4,
            hold_full_seconds: 4,
            exhale_seconds: 4,
            hold_empty_seconds: 4
        },
        cycles: 4,
        duration_minutes: 4,
        primary_effect: 'focus',
        nervous_system_shift: 'balanced',
        use_cases: ['Pre-competition focus', 'Stress management', 'Mental preparation', 'Winding down'],
        best_timing: ['Pre-training', 'Before competition', 'Before meetings', 'Before sleep'],
        expected_outcomes: ['Mental clarity', 'Reduced anxiety', 'Improved focus', 'Lower cortisol'],
        onset_time: '2-3 minutes',
        duration_of_effect: '30-60 minutes',
        evidence_level: 'moderate',
        research_note: 'Stimulates vagus nerve. The holds give time for CO2 exchange balance.'
    },
    {
        type: 'resonance_breathing',
        name: 'Resonance Breathing',
        description: '5-6 breaths per minute to maximize HRV. Optimal for heart-brain coherence.',
        structure: {
            inhale_seconds: 5,
            exhale_seconds: 5,
            special_instruction: '5-6 full breaths per minute, no holds'
        },
        duration_minutes: 5,
        primary_effect: 'calm',
        nervous_system_shift: 'parasympathetic',
        use_cases: ['HRV training', 'Pre-sleep', 'Anxiety reduction', 'Recovery'],
        best_timing: ['Morning', 'Before bed', 'During recovery sessions'],
        expected_outcomes: ['Maximized HRV', 'Deep relaxation', 'Improved vagal tone'],
        onset_time: '3-5 minutes',
        duration_of_effect: 'Cumulative with practice',
        evidence_level: 'strong',
        research_note: '~0.1 Hz breathing rate resonates with baroreceptor feedback loops, maximizing HRV.'
    },
    {
        type: 'wim_hof',
        name: 'Wim Hof Method',
        description: 'Controlled hyperventilation followed by breath retention. Energizing and immunity boosting.',
        structure: {
            inhale_seconds: 2,
            exhale_seconds: 1,
            special_instruction: '30-40 deep breaths, then exhale fully and hold as long as possible, then inhale and hold 15s'
        },
        cycles: 3,
        duration_minutes: 15,
        primary_effect: 'energize',
        nervous_system_shift: 'sympathetic',
        use_cases: ['Morning energizer', 'Cold tolerance training', 'Immune boost', 'Mental resilience'],
        best_timing: ['Morning only', 'Before cold exposure'],
        expected_outcomes: ['Increased energy', 'Adrenaline release', 'Improved cold tolerance', 'Mental clarity'],
        onset_time: 'Immediate during practice',
        duration_of_effect: '1-2 hours',
        evidence_level: 'moderate',
        research_note: 'Proven to reduce inflammatory response. Increases adrenaline and alertness.'
    },
    {
        type: '4_7_8_breathing',
        name: '4-7-8 Breathing',
        description: 'Inhale 4s, hold 7s, exhale 8s. Natural tranquilizer for the nervous system.',
        structure: {
            inhale_seconds: 4,
            hold_full_seconds: 7,
            exhale_seconds: 8
        },
        cycles: 4,
        primary_effect: 'sleep_prep',
        nervous_system_shift: 'parasympathetic',
        use_cases: ['Falling asleep', 'Anxiety relief', 'Managing cravings', 'Reducing anger'],
        best_timing: ['Before bed', 'When anxious', 'During stressful moments'],
        expected_outcomes: ['Drowsiness', 'Deep relaxation', 'Reduced anxiety'],
        onset_time: '1-2 minutes',
        duration_of_effect: '30+ minutes',
        evidence_level: 'moderate',
        research_note: 'Developed by Dr. Andrew Weil. Long exhale and hold activate parasympathetic system.'
    },
    {
        type: 'nsdr',
        name: 'NSDR (Non-Sleep Deep Rest)',
        description: 'Guided relaxation protocol (Yoga Nidra style) for dopamine restoration and recovery.',
        structure: {
            special_instruction: 'Follow guided audio. Body scanning with slow, natural breathing.'
        },
        duration_minutes: 20,
        primary_effect: 'recovery',
        nervous_system_shift: 'parasympathetic',
        use_cases: ['Afternoon energy dip', 'Dopamine restoration', 'Sleep debt recovery', 'Learning enhancement'],
        best_timing: ['Afternoon', 'After intense cognitive work', 'Instead of coffee'],
        expected_outcomes: ['Restored energy', 'Replenished dopamine', 'Enhanced learning retention', 'Deep relaxation'],
        onset_time: 'During and after session',
        duration_of_effect: 'Several hours',
        evidence_level: 'moderate',
        research_note: 'Huberman: NSDR restores dopamine levels. 20 min = significant cognitive benefit.'
    }
];

// ============================================================================
// BREATHWORK SESSION
// ============================================================================

export interface BreathworkSession {
    protocol: BreathworkType;
    started_at: string;
    ended_at: string;
    duration_seconds: number;
    cycles_completed: number;

    // Pre/post metrics (if available)
    pre_hrv?: number;
    post_hrv?: number;
    pre_stress_level?: number;  // 1-10
    post_stress_level?: number;

    // User feedback
    difficulty: 'easy' | 'moderate' | 'challenging';
    effectiveness_rating: 1 | 2 | 3 | 4 | 5;
    notes?: string;
}

// ============================================================================
// BREATHWORK RECOMMENDATION
// ============================================================================

export interface BreathworkRecommendation {
    protocol: BreathworkProtocol;
    reason: string;
    suggested_duration: number;
    priority: 'high' | 'medium' | 'low';
}

// ============================================================================
// ANALYSIS OUTPUT
// ============================================================================

export interface BreathworkAnalysisOutput {
    // Current state
    current_state: 'stressed' | 'neutral' | 'calm' | 'fatigued';
    recommended_protocol: BreathworkRecommendation;

    // Recent activity
    sessions_this_week: number;
    total_minutes_this_week: number;

    // Streaks
    daily_streak: number;

    // All protocols available
    all_protocols: BreathworkProtocol[];
}
