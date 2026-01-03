/**
 * Breathwork Protocol Database
 * 
 * Comprehensive library of 15+ scientifically researched breathing techniques
 * organized by tier, purpose, and physiological effect.
 * 
 * Research Sources:
 * - Huberman Lab (Stanford): Physiological sigh, cyclic sighing
 * - HeartMath Institute: Coherence breathing
 * - Wim Hof Method: Controlled hyperventilation
 * - Navy SEALs (Devine): Tactical/Box breathing
 * - Traditional Yoga: Pranayama techniques
 */

// =====================================================
// TYPES
// =====================================================

export type BreathworkTier = 0 | 1 | 2 | 3;
export type BreathworkEffect = 'calming' | 'activating' | 'balancing' | 'recovery' | 'focus';
export type BreathworkTarget = 'parasympathetic' | 'sympathetic' | 'coherence' | 'co2_tolerance';

export interface BreathPhase {
    label: string;
    duration_ms: number;
    instruction: 'inhale' | 'exhale' | 'hold_full' | 'hold_empty';
    intensity: number;  // 0-1 for animation
}

export interface BreathworkProtocol {
    id: string;
    name: string;
    emoji: string;
    tier: BreathworkTier;

    // Timing
    duration_minutes: number;
    min_duration_minutes: number;
    max_duration_minutes: number;

    // Pattern
    pattern: BreathPhase[];
    cycles_per_set: number;
    sets: number;
    rest_between_sets_ms: number;

    // Effects
    primary_effect: BreathworkEffect;
    nervous_system_target: BreathworkTarget;

    // Metadata
    description: string;
    science: string;
    best_for: string[];
    contraindications: string[];

    // Gating
    blocked_when: {
        stress_above?: number;
        stress_below?: number;
        fatigue_above?: number;
        hrv_below?: number;
        hours_before_sleep?: number;
    };

    // Personalization
    difficulty: 1 | 2 | 3 | 4 | 5;
    requires_experience: boolean;
    can_extend: boolean;

    // Audio/visual
    audio_cue: boolean;
    haptic_pattern?: 'gentle' | 'rhythmic' | 'intense';
}

// =====================================================
// TIER 0: EMERGENCY (1-2 min) - Instant regulation
// =====================================================

const TIER_0_EMERGENCY: BreathworkProtocol[] = [
    {
        id: 'physiological_sigh',
        name: 'Physiological Sigh',
        emoji: '😮‍💨',
        tier: 0,
        duration_minutes: 1,
        min_duration_minutes: 0.5,
        max_duration_minutes: 3,
        pattern: [
            { label: 'Inhale', duration_ms: 2000, instruction: 'inhale', intensity: 0.7 },
            { label: 'Sip', duration_ms: 500, instruction: 'inhale', intensity: 1.0 },
            { label: 'Long Exhale', duration_ms: 4000, instruction: 'exhale', intensity: 0.3 }
        ],
        cycles_per_set: 3,
        sets: 1,
        rest_between_sets_ms: 0,
        primary_effect: 'calming',
        nervous_system_target: 'parasympathetic',
        description: 'Double inhale + long exhale. The fastest way to calm down.',
        science: 'Huberman Lab (Stanford): Physiological sighs re-inflate collapsed alveoli and activate parasympathetic via vagal efferents. Single most effective real-time stress intervention.',
        best_for: ['Acute anxiety', 'Pre-competition nerves', 'Panic moments', 'Between sets'],
        contraindications: [],
        blocked_when: {},
        difficulty: 1,
        requires_experience: false,
        can_extend: true,
        audio_cue: true,
        haptic_pattern: 'gentle'
    },
    {
        id: '478_breathing',
        name: '4-7-8 Breathing',
        emoji: '🌙',
        tier: 0,
        duration_minutes: 2,
        min_duration_minutes: 1,
        max_duration_minutes: 5,
        pattern: [
            { label: 'Inhale', duration_ms: 4000, instruction: 'inhale', intensity: 0.8 },
            { label: 'Hold', duration_ms: 7000, instruction: 'hold_full', intensity: 0.5 },
            { label: 'Exhale', duration_ms: 8000, instruction: 'exhale', intensity: 0.2 }
        ],
        cycles_per_set: 4,
        sets: 1,
        rest_between_sets_ms: 0,
        primary_effect: 'calming',
        nervous_system_target: 'parasympathetic',
        description: 'Dr. Andrew Weil\'s relaxation breath. 4 seconds in, 7 hold, 8 out.',
        science: 'Extended exhale activates vagal brake. The 7-second hold increases CO2 tolerance and triggers relaxation response.',
        best_for: ['Sleep onset', 'Acute stress', 'Anxiety attack', 'Between events'],
        contraindications: ['Respiratory conditions'],
        blocked_when: { stress_below: 2 },
        difficulty: 2,
        requires_experience: false,
        can_extend: true,
        audio_cue: true,
        haptic_pattern: 'gentle'
    },
    {
        id: 'tactical_breathing',
        name: 'Tactical Breathing',
        emoji: '🎯',
        tier: 0,
        duration_minutes: 1,
        min_duration_minutes: 0.5,
        max_duration_minutes: 3,
        pattern: [
            { label: 'In', duration_ms: 4000, instruction: 'inhale', intensity: 0.8 },
            { label: 'Hold', duration_ms: 4000, instruction: 'hold_full', intensity: 0.6 },
            { label: 'Out', duration_ms: 4000, instruction: 'exhale', intensity: 0.4 },
            { label: 'Hold', duration_ms: 4000, instruction: 'hold_empty', intensity: 0.3 }
        ],
        cycles_per_set: 4,
        sets: 1,
        rest_between_sets_ms: 0,
        primary_effect: 'balancing',
        nervous_system_target: 'coherence',
        description: 'Military-grade stress control. Same as box breathing but faster.',
        science: 'Navy SEAL Commander Mark Divine. Rapid autonomic regulation under pressure.',
        best_for: ['Competition moment', 'High-pressure decision', 'Pre-penalty kick', 'Before speech'],
        contraindications: [],
        blocked_when: {},
        difficulty: 1,
        requires_experience: false,
        can_extend: false,
        audio_cue: true,
        haptic_pattern: 'rhythmic'
    }
];

// =====================================================
// TIER 1: FOUNDATION (3-5 min) - Daily practice
// =====================================================

const TIER_1_FOUNDATION: BreathworkProtocol[] = [
    {
        id: 'box_breathing',
        name: 'Box Breathing',
        emoji: '📦',
        tier: 1,
        duration_minutes: 4,
        min_duration_minutes: 2,
        max_duration_minutes: 10,
        pattern: [
            { label: 'Inhale', duration_ms: 4000, instruction: 'inhale', intensity: 0.8 },
            { label: 'Hold Full', duration_ms: 4000, instruction: 'hold_full', intensity: 0.6 },
            { label: 'Exhale', duration_ms: 4000, instruction: 'exhale', intensity: 0.4 },
            { label: 'Hold Empty', duration_ms: 4000, instruction: 'hold_empty', intensity: 0.3 }
        ],
        cycles_per_set: 6,
        sets: 1,
        rest_between_sets_ms: 0,
        primary_effect: 'balancing',
        nervous_system_target: 'coherence',
        description: 'Equal 4-phase breathing. Foundation for autonomic control.',
        science: 'Increases CO2 tolerance, activates both branches of ANS in controlled alternation. Used by Navy SEALs, first responders.',
        best_for: ['Morning routine', 'Pre-training', 'Focus', 'Stress reset'],
        contraindications: [],
        blocked_when: {},
        difficulty: 2,
        requires_experience: false,
        can_extend: true,
        audio_cue: true,
        haptic_pattern: 'rhythmic'
    },
    {
        id: 'coherence_breathing',
        name: 'Coherence Breathing',
        emoji: '💚',
        tier: 1,
        duration_minutes: 5,
        min_duration_minutes: 3,
        max_duration_minutes: 20,
        pattern: [
            { label: 'Inhale', duration_ms: 5500, instruction: 'inhale', intensity: 0.7 },
            { label: 'Exhale', duration_ms: 5500, instruction: 'exhale', intensity: 0.3 }
        ],
        cycles_per_set: 5,
        sets: 2,
        rest_between_sets_ms: 5000,
        primary_effect: 'balancing',
        nervous_system_target: 'coherence',
        description: '5.5 breaths per minute. Optimal HRV coherence frequency.',
        science: 'HeartMath Institute: This specific frequency maximizes heart-brain coherence. Improves emotional regulation, cognitive performance.',
        best_for: ['HRV training', 'Daily practice', 'Emotional balance', 'Focus enhancement'],
        contraindications: [],
        blocked_when: {},
        difficulty: 2,
        requires_experience: false,
        can_extend: true,
        audio_cue: true,
        haptic_pattern: 'gentle'
    },
    {
        id: 'triangle_breathing',
        name: 'Triangle Breathing',
        emoji: '🔺',
        tier: 1,
        duration_minutes: 4,
        min_duration_minutes: 2,
        max_duration_minutes: 8,
        pattern: [
            { label: 'Inhale', duration_ms: 4000, instruction: 'inhale', intensity: 0.8 },
            { label: 'Hold', duration_ms: 4000, instruction: 'hold_full', intensity: 0.5 },
            { label: 'Exhale', duration_ms: 8000, instruction: 'exhale', intensity: 0.2 }
        ],
        cycles_per_set: 5,
        sets: 1,
        rest_between_sets_ms: 0,
        primary_effect: 'calming',
        nervous_system_target: 'parasympathetic',
        description: 'Exhale-emphasized breathing. 4-4-8 pattern.',
        science: 'Extended exhale shifts autonomic balance toward parasympathetic. The 2:1 exhale:inhale ratio maximizes vagal tone.',
        best_for: ['Pre-sleep', 'Anxiety reduction', 'Post-competition', 'Recovery'],
        contraindications: [],
        blocked_when: { hours_before_sleep: 1 },
        difficulty: 2,
        requires_experience: false,
        can_extend: true,
        audio_cue: true,
        haptic_pattern: 'gentle'
    },
    {
        id: 'resonance_breathing',
        name: 'Resonance Breathing',
        emoji: '🎵',
        tier: 1,
        duration_minutes: 5,
        min_duration_minutes: 3,
        max_duration_minutes: 15,
        pattern: [
            { label: 'Inhale', duration_ms: 6000, instruction: 'inhale', intensity: 0.6 },
            { label: 'Exhale', duration_ms: 6000, instruction: 'exhale', intensity: 0.4 }
        ],
        cycles_per_set: 5,
        sets: 2,
        rest_between_sets_ms: 0,
        primary_effect: 'balancing',
        nervous_system_target: 'coherence',
        description: 'Personalized breathing rate for YOUR optimal HRV.',
        science: 'Resonance frequency varies 4.5-7 breaths/min. Finding your personal frequency maximizes HRV amplitude.',
        best_for: ['HRV optimization', 'Personalized practice', 'Long-term training'],
        contraindications: [],
        blocked_when: {},
        difficulty: 3,
        requires_experience: true,
        can_extend: true,
        audio_cue: true,
        haptic_pattern: 'gentle'
    }
];

// =====================================================
// TIER 2: PERFORMANCE (5-10 min) - Pre/post training
// =====================================================

const TIER_2_PERFORMANCE: BreathworkProtocol[] = [
    {
        id: 'wim_hof_basic',
        name: 'Wim Hof Basic',
        emoji: '🧊',
        tier: 2,
        duration_minutes: 8,
        min_duration_minutes: 5,
        max_duration_minutes: 15,
        pattern: [
            { label: 'Power Inhale', duration_ms: 1500, instruction: 'inhale', intensity: 1.0 },
            { label: 'Let Go', duration_ms: 1500, instruction: 'exhale', intensity: 0.5 }
        ],
        cycles_per_set: 30,
        sets: 3,
        rest_between_sets_ms: 90000, // 90s retention
        primary_effect: 'activating',
        nervous_system_target: 'sympathetic',
        description: '30 power breaths + retention hold. Controlled hyperventilation.',
        science: 'Wim Hof Method: Increases adrenaline, reduces inflammation markers (Kox et al. 2014). Improves cold tolerance and immune function.',
        best_for: ['Morning activation', 'Pre-cold exposure', 'Energy boost', 'Immune priming'],
        contraindications: ['Pregnancy', 'Epilepsy', 'High blood pressure', 'Heart conditions'],
        blocked_when: { hours_before_sleep: 4, stress_above: 8 },
        difficulty: 4,
        requires_experience: true,
        can_extend: false,
        audio_cue: true,
        haptic_pattern: 'intense'
    },
    {
        id: 'activation_ladder',
        name: 'Activation Ladder',
        emoji: '🚀',
        tier: 2,
        duration_minutes: 5,
        min_duration_minutes: 3,
        max_duration_minutes: 8,
        pattern: [
            { label: 'Level 1', duration_ms: 2000, instruction: 'inhale', intensity: 0.5 },
            { label: 'Out', duration_ms: 2000, instruction: 'exhale', intensity: 0.3 },
            { label: 'Level 2', duration_ms: 1500, instruction: 'inhale', intensity: 0.7 },
            { label: 'Out', duration_ms: 1500, instruction: 'exhale', intensity: 0.3 },
            { label: 'Level 3', duration_ms: 1000, instruction: 'inhale', intensity: 0.9 },
            { label: 'Out', duration_ms: 1000, instruction: 'exhale', intensity: 0.3 }
        ],
        cycles_per_set: 5,
        sets: 2,
        rest_between_sets_ms: 10000,
        primary_effect: 'activating',
        nervous_system_target: 'sympathetic',
        description: 'Progressive arousal increase. Builds to competition readiness.',
        science: 'Graduated sympathetic activation prevents overshooting optimal arousal zone. Used in sport psychology.',
        best_for: ['Pre-competition', 'Before max effort', 'Wake-up', 'Before key meeting'],
        contraindications: ['Anxiety disorders'],
        blocked_when: { hours_before_sleep: 3, stress_above: 7 },
        difficulty: 2,
        requires_experience: false,
        can_extend: false,
        audio_cue: true,
        haptic_pattern: 'intense'
    },
    {
        id: 'diaphragmatic_reset',
        name: 'Diaphragmatic Reset',
        emoji: '🫁',
        tier: 2,
        duration_minutes: 5,
        min_duration_minutes: 3,
        max_duration_minutes: 10,
        pattern: [
            { label: 'Belly Inhale', duration_ms: 5000, instruction: 'inhale', intensity: 0.6 },
            { label: 'Pause', duration_ms: 2000, instruction: 'hold_full', intensity: 0.4 },
            { label: 'Belly Exhale', duration_ms: 6000, instruction: 'exhale', intensity: 0.2 }
        ],
        cycles_per_set: 6,
        sets: 1,
        rest_between_sets_ms: 0,
        primary_effect: 'calming',
        nervous_system_target: 'parasympathetic',
        description: 'Deep belly breathing. Restores natural breathing pattern.',
        science: 'Diaphragmatic breathing activates vagal afferents, reduces cortisol, improves respiratory efficiency.',
        best_for: ['Post-workout', 'Recovery day', 'Stress reset', 'Before sleep'],
        contraindications: [],
        blocked_when: {},
        difficulty: 1,
        requires_experience: false,
        can_extend: true,
        audio_cue: true,
        haptic_pattern: 'gentle'
    },
    {
        id: 'alternate_nostril',
        name: 'Alternate Nostril',
        emoji: '👃',
        tier: 2,
        duration_minutes: 6,
        min_duration_minutes: 3,
        max_duration_minutes: 15,
        pattern: [
            { label: 'Left In', duration_ms: 4000, instruction: 'inhale', intensity: 0.6 },
            { label: 'Hold', duration_ms: 4000, instruction: 'hold_full', intensity: 0.4 },
            { label: 'Right Out', duration_ms: 4000, instruction: 'exhale', intensity: 0.3 },
            { label: 'Right In', duration_ms: 4000, instruction: 'inhale', intensity: 0.6 },
            { label: 'Hold', duration_ms: 4000, instruction: 'hold_full', intensity: 0.4 },
            { label: 'Left Out', duration_ms: 4000, instruction: 'exhale', intensity: 0.3 }
        ],
        cycles_per_set: 5,
        sets: 1,
        rest_between_sets_ms: 0,
        primary_effect: 'balancing',
        nervous_system_target: 'coherence',
        description: 'Nadi Shodhana. Alternate nostril breathing for balance.',
        science: 'Yoga research shows hemispheric balancing, improved spatial memory, reduced blood pressure.',
        best_for: ['Pre-meditation', 'Focus', 'Anxiety', 'Mental clarity'],
        contraindications: ['Nasal congestion'],
        blocked_when: {},
        difficulty: 3,
        requires_experience: true,
        can_extend: true,
        audio_cue: true,
        haptic_pattern: 'gentle'
    },
    {
        id: 'cyclic_sighing',
        name: 'Cyclic Sighing',
        emoji: '🌊',
        tier: 2,
        duration_minutes: 5,
        min_duration_minutes: 3,
        max_duration_minutes: 10,
        pattern: [
            { label: 'Inhale', duration_ms: 3000, instruction: 'inhale', intensity: 0.7 },
            { label: 'Sip', duration_ms: 1000, instruction: 'inhale', intensity: 1.0 },
            { label: 'Long Exhale', duration_ms: 6000, instruction: 'exhale', intensity: 0.2 }
        ],
        cycles_per_set: 6,
        sets: 2,
        rest_between_sets_ms: 5000,
        primary_effect: 'calming',
        nervous_system_target: 'parasympathetic',
        description: 'Extended physiological sigh practice. Strongest calming effect.',
        science: 'Huberman Lab 2023 study: 5 min daily cyclic sighing improved mood and reduced anxiety more than mindfulness meditation.',
        best_for: ['Daily practice', 'Anxiety management', 'Mood improvement', 'Stress reduction'],
        contraindications: [],
        blocked_when: {},
        difficulty: 1,
        requires_experience: false,
        can_extend: true,
        audio_cue: true,
        haptic_pattern: 'gentle'
    }
];

// =====================================================
// TIER 3: DEEP RECOVERY (10-20 min) - Rest/sleep
// =====================================================

const TIER_3_RECOVERY: BreathworkProtocol[] = [
    {
        id: 'nsdr_full',
        name: 'NSDR (Yoga Nidra)',
        emoji: '🧘',
        tier: 3,
        duration_minutes: 15,
        min_duration_minutes: 10,
        max_duration_minutes: 30,
        pattern: [
            { label: 'Natural Breath', duration_ms: 6000, instruction: 'inhale', intensity: 0.3 },
            { label: 'Release', duration_ms: 6000, instruction: 'exhale', intensity: 0.1 }
        ],
        cycles_per_set: 10,
        sets: 3,
        rest_between_sets_ms: 30000,
        primary_effect: 'recovery',
        nervous_system_target: 'parasympathetic',
        description: 'Non-Sleep Deep Rest. Deep relaxation without sleeping.',
        science: 'Huberman: NSDR replenishes dopamine, improves neuroplasticity, recovers from sleep debt. 20 min = equivalent to 2h recovery.',
        best_for: ['Afternoon reset', 'Sleep debt', 'Post-travel', 'Deep recovery'],
        contraindications: [],
        blocked_when: {},
        difficulty: 2,
        requires_experience: false,
        can_extend: true,
        audio_cue: true,
        haptic_pattern: 'gentle'
    },
    {
        id: 'body_scan_breath',
        name: 'Body Scan Relaxation',
        emoji: '🧬',
        tier: 3,
        duration_minutes: 12,
        min_duration_minutes: 8,
        max_duration_minutes: 20,
        pattern: [
            { label: 'Inhale & Scan', duration_ms: 5000, instruction: 'inhale', intensity: 0.4 },
            { label: 'Exhale & Release', duration_ms: 7000, instruction: 'exhale', intensity: 0.1 }
        ],
        cycles_per_set: 8,
        sets: 2,
        rest_between_sets_ms: 10000,
        primary_effect: 'recovery',
        nervous_system_target: 'parasympathetic',
        description: 'Breathe into each body part. Progressive tension release.',
        science: 'Jacobson\'s PMR combined with breath awareness. Reduces muscle tension, cortisol, promotes recovery.',
        best_for: ['Post-workout recovery', 'Muscle tension', 'Sleep preparation', 'Injury healing'],
        contraindications: [],
        blocked_when: {},
        difficulty: 2,
        requires_experience: false,
        can_extend: true,
        audio_cue: true,
        haptic_pattern: 'gentle'
    },
    {
        id: 'sleep_onset',
        name: 'Sleep Onset Protocol',
        emoji: '😴',
        tier: 3,
        duration_minutes: 10,
        min_duration_minutes: 5,
        max_duration_minutes: 15,
        pattern: [
            { label: 'Gentle In', duration_ms: 4000, instruction: 'inhale', intensity: 0.3 },
            { label: 'Soft Hold', duration_ms: 7000, instruction: 'hold_full', intensity: 0.1 },
            { label: 'Long Release', duration_ms: 8000, instruction: 'exhale', intensity: 0.05 }
        ],
        cycles_per_set: 8,
        sets: 1,
        rest_between_sets_ms: 0,
        primary_effect: 'recovery',
        nervous_system_target: 'parasympathetic',
        description: 'Designed to drift into sleep. Progressively slower.',
        science: 'Combines 4-7-8 with progressive slowing. Reduces sleep latency by 50% in studies.',
        best_for: ['Bedtime', 'Insomnia', 'Jet lag recovery', 'Night anxiety'],
        contraindications: [],
        blocked_when: {},
        difficulty: 1,
        requires_experience: false,
        can_extend: false,
        audio_cue: false, // Quiet for sleep
        haptic_pattern: 'gentle'
    },
    {
        id: 'pmr_breathing',
        name: 'Progressive Muscle Relaxation',
        emoji: '💆',
        tier: 3,
        duration_minutes: 15,
        min_duration_minutes: 10,
        max_duration_minutes: 25,
        pattern: [
            { label: 'Tense + Inhale', duration_ms: 5000, instruction: 'inhale', intensity: 0.9 },
            { label: 'Release + Exhale', duration_ms: 10000, instruction: 'exhale', intensity: 0.1 }
        ],
        cycles_per_set: 6,
        sets: 2,
        rest_between_sets_ms: 10000,
        primary_effect: 'recovery',
        nervous_system_target: 'parasympathetic',
        description: 'Tense muscle groups on inhale, release on exhale.',
        science: 'Edmund Jacobson\'s technique. Systematic tension-release reduces muscle tone, anxiety, and promotes recovery.',
        best_for: ['Post-heavy training', 'Chronic tension', 'Competition recovery', 'Injury rehab'],
        contraindications: ['Active injury (skip that area)'],
        blocked_when: {},
        difficulty: 2,
        requires_experience: false,
        can_extend: true,
        audio_cue: true,
        haptic_pattern: 'gentle'
    }
];

// =====================================================
// COMPLETE DATABASE
// =====================================================

export const BREATHWORK_PROTOCOLS: BreathworkProtocol[] = [
    ...TIER_0_EMERGENCY,
    ...TIER_1_FOUNDATION,
    ...TIER_2_PERFORMANCE,
    ...TIER_3_RECOVERY
];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export const getProtocolById = (id: string): BreathworkProtocol | undefined =>
    BREATHWORK_PROTOCOLS.find(p => p.id === id);

export const getProtocolsByTier = (tier: BreathworkTier): BreathworkProtocol[] =>
    BREATHWORK_PROTOCOLS.filter(p => p.tier === tier);

export const getProtocolsByEffect = (effect: BreathworkEffect): BreathworkProtocol[] =>
    BREATHWORK_PROTOCOLS.filter(p => p.primary_effect === effect);

export const getProtocolsByTarget = (target: BreathworkTarget): BreathworkProtocol[] =>
    BREATHWORK_PROTOCOLS.filter(p => p.nervous_system_target === target);

export const getEmergencyProtocols = (): BreathworkProtocol[] =>
    getProtocolsByTier(0);

export const getProtocolsForSituation = (
    stress_level: number,
    fatigue_level: number,
    hours_to_sleep: number,
    experience_level: number = 2
): BreathworkProtocol[] => {
    return BREATHWORK_PROTOCOLS.filter(protocol => {
        const { blocked_when, difficulty, requires_experience } = protocol;

        // Check blocked conditions
        if (blocked_when.stress_above && stress_level > blocked_when.stress_above) return false;
        if (blocked_when.stress_below && stress_level < blocked_when.stress_below) return false;
        if (blocked_when.fatigue_above && fatigue_level > blocked_when.fatigue_above) return false;
        if (blocked_when.hours_before_sleep && hours_to_sleep < blocked_when.hours_before_sleep) return false;

        // Check experience
        if (requires_experience && experience_level < 3) return false;
        if (difficulty > experience_level + 1) return false;

        return true;
    });
};

export const getRecommendedProtocol = (
    current_state: {
        stress: number;
        fatigue: number;
        arousal_needed: 'low' | 'medium' | 'high';
        time_available_minutes: number;
        hours_to_event?: number;
    }
): BreathworkProtocol | null => {
    const { stress, fatigue, arousal_needed, time_available_minutes, hours_to_event } = current_state;

    // Priority logic
    if (stress > 8) {
        // Emergency: Use physiological sigh
        return getProtocolById('physiological_sigh') || null;
    }

    if (arousal_needed === 'high' && hours_to_event && hours_to_event < 2) {
        // Pre-competition activation
        return getProtocolById('activation_ladder') || null;
    }

    if (arousal_needed === 'low' || fatigue > 7) {
        // Recovery mode
        if (time_available_minutes > 10) {
            return getProtocolById('nsdr_full') || null;
        }
        return getProtocolById('coherence_breathing') || null;
    }

    // Default: Coherence breathing
    return getProtocolById('coherence_breathing') || null;
};

export const calculateSessionDuration = (
    protocol: BreathworkProtocol
): number => {
    const phaseTotal = protocol.pattern.reduce((sum, p) => sum + p.duration_ms, 0);
    const setDuration = phaseTotal * protocol.cycles_per_set;
    const totalWithRest = (setDuration * protocol.sets) +
        (protocol.rest_between_sets_ms * (protocol.sets - 1));
    return totalWithRest;
};
