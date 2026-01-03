/**
 * Recovery Modality Database
 * 
 * Complete vocabulary of 30+ recovery modalities with:
 * - Tier system (0=Essential, 1=Premium, 2=Home, 3=Universal)
 * - Frequency limits (weekly caps based on research)
 * - Access requirements (dynamic - asked at recommendation time)
 * - Training blocks (e.g., cold blocked after strength)
 * - Science rationale for each modality
 * 
 * Based on research from: Huberman Lab, Finnish studies, NIH, Meta-analyses
 */

// =====================================================
// TYPES
// =====================================================

export type ModalityTier = 0 | 1 | 2 | 3;
// 0 = Essential (Sleep, Breathing) - Always recommend first
// 1 = Premium (Sauna, Ice bath, Massage) - Requires facility
// 2 = Home (Foam roller, Hot bath) - Common home equipment
// 3 = Universal (Walking, Stretching) - No equipment needed

export type ModalityCategory =
    | 'sleep'
    | 'cold'
    | 'heat'
    | 'contrast'
    | 'myofascial'
    | 'mobility'
    | 'compression'
    | 'neural'
    | 'active'
    | 'nutrition';

export type TrainingType = 'strength' | 'hypertrophy' | 'cardio' | 'hiit' | 'sport' | 'rest';

export interface RecoveryModality {
    id: string;
    name: string;
    emoji: string;
    category: ModalityCategory;
    tier: ModalityTier;

    // Timing
    duration_minutes: number | null;        // null = variable/continuous
    duration_range?: [number, number];      // For flexible modalities

    // Frequency limits
    frequency_cap_weekly: number | null;    // null = unlimited
    frequency_cap_daily: number;            // Max per day
    min_hours_between: number;              // Minimum gap between sessions

    // Access
    access_required: string | string[] | null;  // What equipment/facility needed
    alternatives: string[];                 // Fallback modality IDs

    // Training interactions
    blocked_after: TrainingType[];          // Don't use after these
    blocked_hours: number;                  // How long to wait
    optimal_after: TrainingType[];          // Best used after these

    // Effectiveness
    effectiveness_score: number;            // 1-10 based on research
    evidence_level: 'strong' | 'moderate' | 'emerging';

    // Display
    description: string;
    protocol?: string;                      // How to do it
    science: string;                        // Why it works
    causal_effects: CausalEffect[];
}

export interface CausalEffect {
    domain: 'hrv' | 'sleep' | 'soreness' | 'stress' | 'inflammation' | 'performance';
    effect: 'positive' | 'negative';
    magnitude: 'small' | 'medium' | 'large';
    description: string;
}

// =====================================================
// COMPLETE MODALITY DATABASE
// =====================================================

export const RECOVERY_MODALITIES: RecoveryModality[] = [
    // =========================================
    // CATEGORY: SLEEP (Tier 0 - Essential)
    // =========================================
    {
        id: 'sleep_earlier',
        name: 'Earlier Bedtime',
        emoji: '😴',
        category: 'sleep',
        tier: 0,
        duration_minutes: null,
        duration_range: [15, 60],
        frequency_cap_weekly: null,
        frequency_cap_daily: 1,
        min_hours_between: 24,
        access_required: null,
        alternatives: [],
        blocked_after: [],
        blocked_hours: 0,
        optimal_after: ['strength', 'hypertrophy', 'hiit'],
        effectiveness_score: 10,
        evidence_level: 'strong',
        description: 'Go to bed earlier to recover sleep debt',
        protocol: 'Reduce bedtime by 15-30 min increments. Avoid screens 1h before.',
        science: 'Most effective recovery tool. Growth hormone peaks during deep sleep. HRV improves overnight.',
        causal_effects: [
            { domain: 'hrv', effect: 'positive', magnitude: 'large', description: 'HRV +15-20% overnight' },
            { domain: 'soreness', effect: 'positive', magnitude: 'medium', description: 'Muscle repair during sleep' },
            { domain: 'performance', effect: 'positive', magnitude: 'large', description: 'Next-day performance +10-15%' }
        ]
    },
    {
        id: 'power_nap',
        name: 'Power Nap',
        emoji: '💤',
        category: 'sleep',
        tier: 0,
        duration_minutes: 20,
        frequency_cap_weekly: 7,
        frequency_cap_daily: 1,
        min_hours_between: 0,
        access_required: 'quiet_space',
        alternatives: ['diaphragmatic_breathing', 'meditation'],
        blocked_after: [],
        blocked_hours: 0,
        optimal_after: ['strength', 'cardio'],
        effectiveness_score: 8,
        evidence_level: 'strong',
        description: 'Short recovery sleep to restore alertness',
        protocol: '20 min max. Before 3 PM to not affect night sleep. Dark, quiet environment.',
        science: 'Restores alertness without sleep inertia. Reduces cortisol. Enhances motor learning.',
        causal_effects: [
            { domain: 'performance', effect: 'positive', magnitude: 'medium', description: 'Alertness restored for 2-3h' },
            { domain: 'stress', effect: 'positive', magnitude: 'small', description: 'Cortisol reduction' }
        ]
    },
    {
        id: 'sleep_extension',
        name: 'Extended Sleep',
        emoji: '🛌',
        category: 'sleep',
        tier: 0,
        duration_minutes: 60,
        frequency_cap_weekly: 2,
        frequency_cap_daily: 1,
        min_hours_between: 24,
        access_required: null,
        alternatives: ['sleep_earlier'],
        blocked_after: [],
        blocked_hours: 0,
        optimal_after: [],
        effectiveness_score: 9,
        evidence_level: 'strong',
        description: 'Sleep in to pay back accumulated sleep debt',
        protocol: 'Best on weekends. Add 1-2 hours max. Stay consistent with wake time.',
        science: 'Helps pay back sleep debt gradually. Better than oversleeping which disrupts circadian rhythm.',
        causal_effects: [
            { domain: 'hrv', effect: 'positive', magnitude: 'medium', description: 'HRV +10-15%' },
            { domain: 'performance', effect: 'positive', magnitude: 'medium', description: 'Reduced fatigue' }
        ]
    },

    // =========================================
    // CATEGORY: COLD THERAPY
    // =========================================
    {
        id: 'ice_bath',
        name: 'Ice Bath / Cold Plunge',
        emoji: '🧊',
        category: 'cold',
        tier: 1,
        duration_minutes: 10,
        duration_range: [3, 15],
        frequency_cap_weekly: 3,
        frequency_cap_daily: 1,
        min_hours_between: 24,
        access_required: 'ice_bath',
        alternatives: ['cold_shower', 'cold_face_immersion'],
        blocked_after: ['strength', 'hypertrophy'],
        blocked_hours: 4,
        optimal_after: ['cardio', 'hiit'],
        effectiveness_score: 8,
        evidence_level: 'strong',
        description: 'Full body cold water immersion',
        protocol: '10-15°C (50-59°F) for 10-15 min. Submerge to neck. Focus on slow breathing.',
        science: 'Reduces inflammation, speeds recovery. But avoid within 4h of strength training - blunts hypertrophy.',
        causal_effects: [
            { domain: 'inflammation', effect: 'positive', magnitude: 'large', description: 'Acute inflammation reduced' },
            { domain: 'soreness', effect: 'positive', magnitude: 'medium', description: 'DOMS reduced 20-30%' },
            { domain: 'performance', effect: 'negative', magnitude: 'medium', description: 'Blunts muscle adaptation if too soon after strength' }
        ]
    },
    {
        id: 'cold_shower',
        name: 'Cold Shower',
        emoji: '🚿',
        category: 'cold',
        tier: 2,
        duration_minutes: 5,
        duration_range: [2, 10],
        frequency_cap_weekly: 7,
        frequency_cap_daily: 2,
        min_hours_between: 4,
        access_required: 'shower',
        alternatives: ['cold_face_immersion', 'cold_compress'],
        blocked_after: ['strength', 'hypertrophy'],
        blocked_hours: 4,
        optimal_after: ['cardio'],
        effectiveness_score: 6,
        evidence_level: 'moderate',
        description: 'Accessible cold exposure via shower',
        protocol: '2-5 min cold as tolerable. End workout shower with 30s-2min cold.',
        science: '70% as effective as ice bath. Accessible alternative. Same timing rules apply.',
        causal_effects: [
            { domain: 'inflammation', effect: 'positive', magnitude: 'medium', description: 'Moderate inflammation reduction' },
            { domain: 'stress', effect: 'positive', magnitude: 'small', description: 'Mental resilience benefit' }
        ]
    },
    {
        id: 'cold_face_immersion',
        name: 'Face Cold Immersion',
        emoji: '🥶',
        category: 'cold',
        tier: 3,
        duration_minutes: 2,
        frequency_cap_weekly: null,
        frequency_cap_daily: 3,
        min_hours_between: 0,
        access_required: 'bowl_with_cold_water',
        alternatives: ['cold_compress', 'diaphragmatic_breathing'],
        blocked_after: [],
        blocked_hours: 0,
        optimal_after: [],
        effectiveness_score: 5,
        evidence_level: 'moderate',
        description: 'Face immersion in cold water to trigger dive reflex',
        protocol: 'Bowl of cold water with ice. Submerge face for 15-30 seconds. Repeat 3-5x.',
        science: 'Activates mammalian dive reflex. Instant parasympathetic activation. Reduces heart rate and stress.',
        causal_effects: [
            { domain: 'stress', effect: 'positive', magnitude: 'medium', description: 'Immediate calm via dive reflex' },
            { domain: 'hrv', effect: 'positive', magnitude: 'small', description: 'Acute HRV improvement' }
        ]
    },
    {
        id: 'cold_compress',
        name: 'Cold Compress',
        emoji: '🧊',
        category: 'cold',
        tier: 3,
        duration_minutes: 15,
        frequency_cap_weekly: null,
        frequency_cap_daily: 4,
        min_hours_between: 2,
        access_required: null,
        alternatives: [],
        blocked_after: [],
        blocked_hours: 0,
        optimal_after: [],
        effectiveness_score: 4,
        evidence_level: 'strong',
        description: 'Localized cold application to specific areas',
        protocol: 'Ice pack or frozen bag wrapped in cloth. Apply to sore area 15-20 min.',
        science: 'Localized inflammation reduction. Good for acute injuries or targeted relief.',
        causal_effects: [
            { domain: 'inflammation', effect: 'positive', magnitude: 'small', description: 'Localized reduction' },
            { domain: 'soreness', effect: 'positive', magnitude: 'small', description: 'Pain relief in specific area' }
        ]
    },

    // =========================================
    // CATEGORY: HEAT THERAPY
    // =========================================
    {
        id: 'sauna',
        name: 'Sauna Session',
        emoji: '🧖',
        category: 'heat',
        tier: 1,
        duration_minutes: 20,
        duration_range: [15, 25],
        frequency_cap_weekly: 4,
        frequency_cap_daily: 1,
        min_hours_between: 24,
        access_required: 'sauna',
        alternatives: ['steam_room', 'hot_bath'],
        blocked_after: [],
        blocked_hours: 0,
        optimal_after: ['strength', 'hypertrophy', 'cardio'],
        effectiveness_score: 9,
        evidence_level: 'strong',
        description: 'Traditional or infrared sauna session',
        protocol: '80-100°C (176-212°F) for 15-20 min. Hydrate before/after. Cool down slowly.',
        science: 'Growth hormone release up to 200-300%. Cardiovascular benefits. 4-7x/week = 70% reduced CV risk.',
        causal_effects: [
            { domain: 'performance', effect: 'positive', magnitude: 'large', description: 'GH release enhances recovery' },
            { domain: 'inflammation', effect: 'positive', magnitude: 'medium', description: 'Reduced systemic inflammation' },
            { domain: 'sleep', effect: 'positive', magnitude: 'medium', description: 'Better sleep if done evening' }
        ]
    },
    {
        id: 'steam_room',
        name: 'Steam Room',
        emoji: '♨️',
        category: 'heat',
        tier: 1,
        duration_minutes: 15,
        frequency_cap_weekly: 4,
        frequency_cap_daily: 1,
        min_hours_between: 24,
        access_required: 'steam_room',
        alternatives: ['sauna', 'hot_bath'],
        blocked_after: [],
        blocked_hours: 0,
        optimal_after: ['strength', 'cardio'],
        effectiveness_score: 7,
        evidence_level: 'moderate',
        description: 'Humid heat therapy',
        protocol: '40-50°C (104-122°F), high humidity. 10-15 min. Stay hydrated.',
        science: 'Similar to sauna but better for respiratory health. Opens airways. Promotes relaxation.',
        causal_effects: [
            { domain: 'stress', effect: 'positive', magnitude: 'medium', description: 'Muscle relaxation' },
            { domain: 'inflammation', effect: 'positive', magnitude: 'small', description: 'Mild inflammation reduction' }
        ]
    },
    {
        id: 'hot_bath',
        name: 'Hot Bath',
        emoji: '🛁',
        category: 'heat',
        tier: 2,
        duration_minutes: 20,
        frequency_cap_weekly: null,
        frequency_cap_daily: 1,
        min_hours_between: 8,
        access_required: 'bathtub',
        alternatives: ['hot_shower'],
        blocked_after: [],
        blocked_hours: 0,
        optimal_after: ['strength', 'cardio'],
        effectiveness_score: 6,
        evidence_level: 'moderate',
        description: 'Relaxing hot water immersion at home',
        protocol: '38-40°C (100-104°F) for 15-20 min. Add epsom salts for magnesium.',
        science: 'Promotes blood flow, muscle relaxation. Evening baths improve sleep onset. Accessible alternative to sauna.',
        causal_effects: [
            { domain: 'stress', effect: 'positive', magnitude: 'medium', description: 'Parasympathetic activation' },
            { domain: 'sleep', effect: 'positive', magnitude: 'medium', description: 'Improved sleep onset if 1-2h before bed' }
        ]
    },
    {
        id: 'hot_shower',
        name: 'Hot Shower',
        emoji: '🚿',
        category: 'heat',
        tier: 2,
        duration_minutes: 10,
        frequency_cap_weekly: null,
        frequency_cap_daily: 2,
        min_hours_between: 4,
        access_required: 'shower',
        alternatives: [],
        blocked_after: [],
        blocked_hours: 0,
        optimal_after: [],
        effectiveness_score: 4,
        evidence_level: 'moderate',
        description: 'Basic heat therapy via hot shower',
        protocol: 'Hot water on sore muscles for 5-10 min. Focus on tension areas.',
        science: 'Basic muscle relaxation. Increases blood flow. Best combined with stretching after.',
        causal_effects: [
            { domain: 'soreness', effect: 'positive', magnitude: 'small', description: 'Temporary relief' }
        ]
    },

    // =========================================
    // CATEGORY: CONTRAST THERAPY
    // =========================================
    {
        id: 'contrast_therapy',
        name: 'Contrast Therapy',
        emoji: '🔥❄️',
        category: 'contrast',
        tier: 1,
        duration_minutes: 20,
        frequency_cap_weekly: 3,
        frequency_cap_daily: 1,
        min_hours_between: 24,
        access_required: ['sauna', 'cold_plunge'],
        alternatives: ['contrast_shower'],
        blocked_after: ['strength', 'hypertrophy'],
        blocked_hours: 4,
        optimal_after: ['cardio'],
        effectiveness_score: 8,
        evidence_level: 'moderate',
        description: 'Alternating hot and cold exposure',
        protocol: '3 min hot → 1 min cold, repeat 4-5 rounds. End on cold.',
        science: 'Pumping effect improves circulation. Combines benefits of both modalities.',
        causal_effects: [
            { domain: 'inflammation', effect: 'positive', magnitude: 'medium', description: 'Enhanced circulation' },
            { domain: 'soreness', effect: 'positive', magnitude: 'medium', description: 'DOMS reduction' }
        ]
    },
    {
        id: 'contrast_shower',
        name: 'Contrast Shower',
        emoji: '🚿',
        category: 'contrast',
        tier: 2,
        duration_minutes: 10,
        frequency_cap_weekly: 7,
        frequency_cap_daily: 1,
        min_hours_between: 12,
        access_required: 'shower',
        alternatives: [],
        blocked_after: ['strength', 'hypertrophy'],
        blocked_hours: 4,
        optimal_after: ['cardio'],
        effectiveness_score: 6,
        evidence_level: 'moderate',
        description: 'Alternating hot and cold shower',
        protocol: '2 min hot → 30s cold, repeat 3 rounds. End on cold.',
        science: 'Accessible contrast therapy. Same pumping effect, less intense.',
        causal_effects: [
            { domain: 'inflammation', effect: 'positive', magnitude: 'small', description: 'Improved circulation' }
        ]
    },

    // =========================================
    // CATEGORY: MYOFASCIAL RELEASE
    // =========================================
    {
        id: 'foam_rolling',
        name: 'Foam Rolling',
        emoji: '🧘',
        category: 'myofascial',
        tier: 2,
        duration_minutes: 15,
        frequency_cap_weekly: null,
        frequency_cap_daily: 2,
        min_hours_between: 4,
        access_required: 'foam_roller',
        alternatives: ['self_massage', 'massage_ball'],
        blocked_after: [],
        blocked_hours: 0,
        optimal_after: ['strength', 'cardio', 'hiit'],
        effectiveness_score: 8,
        evidence_level: 'strong',
        description: 'Self-myofascial release with foam roller',
        protocol: '30-60s per muscle group. Slow rolls. Pause on tender spots.',
        science: 'Most effective for DOMS reduction. Improves blood flow. Can be done daily.',
        causal_effects: [
            { domain: 'soreness', effect: 'positive', magnitude: 'large', description: 'DOMS reduced 30-50%' },
            { domain: 'performance', effect: 'positive', magnitude: 'small', description: 'Improved ROM' }
        ]
    },
    {
        id: 'massage_gun',
        name: 'Percussion Therapy',
        emoji: '🔫',
        category: 'myofascial',
        tier: 2,
        duration_minutes: 10,
        frequency_cap_weekly: null,
        frequency_cap_daily: 2,
        min_hours_between: 4,
        access_required: 'massage_gun',
        alternatives: ['foam_rolling', 'self_massage'],
        blocked_after: [],
        blocked_hours: 0,
        optimal_after: ['strength', 'cardio'],
        effectiveness_score: 7,
        evidence_level: 'moderate',
        description: 'Deep tissue release with percussion device',
        protocol: '30-60s per muscle. Move slowly. Avoid bones and joints.',
        science: 'Deep tissue release. Increases blood flow. Good for specific tight spots.',
        causal_effects: [
            { domain: 'soreness', effect: 'positive', magnitude: 'medium', description: 'Targeted relief' }
        ]
    },
    {
        id: 'professional_massage',
        name: 'Professional Massage',
        emoji: '💆',
        category: 'myofascial',
        tier: 1,
        duration_minutes: 60,
        frequency_cap_weekly: 1,
        frequency_cap_daily: 1,
        min_hours_between: 48,
        access_required: 'massage_therapist',
        alternatives: ['foam_rolling', 'massage_gun'],
        blocked_after: [],
        blocked_hours: 0,
        optimal_after: [],
        effectiveness_score: 10,
        evidence_level: 'strong',
        description: 'Professional massage therapy session',
        protocol: 'Schedule with licensed therapist. Communicate problem areas.',
        science: 'Most powerful technique for DOMS and fatigue (meta-analysis). Reduces cortisol 30%.',
        causal_effects: [
            { domain: 'soreness', effect: 'positive', magnitude: 'large', description: 'DOMS dramatically reduced' },
            { domain: 'stress', effect: 'positive', magnitude: 'large', description: 'Cortisol -30%' }
        ]
    },
    {
        id: 'massage_ball',
        name: 'Trigger Point Ball',
        emoji: '⚾',
        category: 'myofascial',
        tier: 2,
        duration_minutes: 10,
        frequency_cap_weekly: null,
        frequency_cap_daily: 2,
        min_hours_between: 2,
        access_required: 'massage_ball',
        alternatives: ['foam_rolling', 'self_massage'],
        blocked_after: [],
        blocked_hours: 0,
        optimal_after: [],
        effectiveness_score: 6,
        evidence_level: 'moderate',
        description: 'Deep release with lacrosse/trigger point ball',
        protocol: 'Place ball on tight spot. Apply pressure 30-90s. Breathe through it.',
        science: 'Precise trigger point release. Good for hard-to-reach areas like feet, glutes.',
        causal_effects: [
            { domain: 'soreness', effect: 'positive', magnitude: 'medium', description: 'Targeted knot release' }
        ]
    },
    {
        id: 'self_massage',
        name: 'Self Massage',
        emoji: '🤲',
        category: 'myofascial',
        tier: 3,
        duration_minutes: 10,
        frequency_cap_weekly: null,
        frequency_cap_daily: 4,
        min_hours_between: 0,
        access_required: null,
        alternatives: [],
        blocked_after: [],
        blocked_hours: 0,
        optimal_after: [],
        effectiveness_score: 4,
        evidence_level: 'moderate',
        description: 'Manual self-massage with hands',
        protocol: 'Use fingers and palms on accessible areas. Focus on calves, forearms, neck.',
        science: 'Basic relief for accessible areas. Better than nothing. Universal access.',
        causal_effects: [
            { domain: 'soreness', effect: 'positive', magnitude: 'small', description: 'Basic relief' }
        ]
    },

    // =========================================
    // CATEGORY: MOBILITY & STRETCHING
    // =========================================
    {
        id: 'deep_stretching',
        name: 'Deep Stretching',
        emoji: '🧘',
        category: 'mobility',
        tier: 2,
        duration_minutes: 15,
        frequency_cap_weekly: null,
        frequency_cap_daily: 2,
        min_hours_between: 4,
        access_required: 'floor_space',
        alternatives: ['yoga_flow'],
        blocked_after: [],
        blocked_hours: 0,
        optimal_after: ['strength', 'cardio'],
        effectiveness_score: 7,
        evidence_level: 'strong',
        description: 'Static stretching session targeting tight muscles',
        protocol: 'Hold each stretch 45-60s. Breathe deeply. Target workout areas.',
        science: 'Improves ROM. Reduces muscle stiffness. Best after workout when muscles are warm.',
        causal_effects: [
            { domain: 'soreness', effect: 'positive', magnitude: 'small', description: 'Reduced stiffness' },
            { domain: 'performance', effect: 'positive', magnitude: 'small', description: 'Improved flexibility' }
        ]
    },
    {
        id: 'yoga_flow',
        name: 'Recovery Yoga',
        emoji: '🧘',
        category: 'mobility',
        tier: 2,
        duration_minutes: 20,
        frequency_cap_weekly: null,
        frequency_cap_daily: 1,
        min_hours_between: 8,
        access_required: 'floor_space',
        alternatives: ['deep_stretching'],
        blocked_after: [],
        blocked_hours: 0,
        optimal_after: [],
        effectiveness_score: 7,
        evidence_level: 'moderate',
        description: 'Gentle yoga flow combining stretching and breathwork',
        protocol: 'Gentle flow sequence. Focus on breath. Child\'s pose, downward dog, pigeon.',
        science: 'Combines mobility with parasympathetic activation. Great for stress + flexibility.',
        causal_effects: [
            { domain: 'stress', effect: 'positive', magnitude: 'medium', description: 'Calming effect' },
            { domain: 'soreness', effect: 'positive', magnitude: 'small', description: 'Improved mobility' }
        ]
    },
    {
        id: 'mobility_routine',
        name: 'Mobility Drills',
        emoji: '🔄',
        category: 'mobility',
        tier: 2,
        duration_minutes: 10,
        frequency_cap_weekly: null,
        frequency_cap_daily: 2,
        min_hours_between: 4,
        access_required: 'floor_space',
        alternatives: ['deep_stretching'],
        blocked_after: [],
        blocked_hours: 0,
        optimal_after: [],
        effectiveness_score: 6,
        evidence_level: 'moderate',
        description: 'Dynamic joint mobility exercises',
        protocol: 'Controlled articular rotations (CARs). Circle each joint slowly through full ROM.',
        science: 'Maintains joint health. Improves movement quality. Good for warm-up or recovery.',
        causal_effects: [
            { domain: 'performance', effect: 'positive', magnitude: 'small', description: 'Better movement' }
        ]
    },
    {
        id: 'hanging',
        name: 'Dead Hang',
        emoji: '🏋️',
        category: 'mobility',
        tier: 2,
        duration_minutes: 3,
        frequency_cap_weekly: null,
        frequency_cap_daily: 3,
        min_hours_between: 2,
        access_required: 'pull_up_bar',
        alternatives: [],
        blocked_after: [],
        blocked_hours: 0,
        optimal_after: ['strength'],
        effectiveness_score: 5,
        evidence_level: 'emerging',
        description: 'Passive hang from bar for spinal decompression',
        protocol: 'Hang for 30-60s. Relax shoulders. Breathe. Repeat 2-3 sets.',
        science: 'Spinal decompression. Grip strength. Shoulder health.',
        causal_effects: [
            { domain: 'soreness', effect: 'positive', magnitude: 'small', description: 'Spinal relief' }
        ]
    },

    // =========================================
    // CATEGORY: COMPRESSION
    // =========================================
    {
        id: 'compression_boots',
        name: 'Compression Boots',
        emoji: '🦵',
        category: 'compression',
        tier: 1,
        duration_minutes: 20,
        frequency_cap_weekly: null,
        frequency_cap_daily: 2,
        min_hours_between: 4,
        access_required: 'compression_boots',
        alternatives: ['legs_up_wall', 'compression_garments'],
        blocked_after: [],
        blocked_hours: 0,
        optimal_after: ['cardio', 'strength'],
        effectiveness_score: 7,
        evidence_level: 'moderate',
        description: 'Pneumatic compression therapy for legs',
        protocol: '20-30 min session. Use after workouts. Moderate pressure setting.',
        science: 'Lymphatic drainage. Reduces swelling. Clears metabolic waste faster.',
        causal_effects: [
            { domain: 'soreness', effect: 'positive', magnitude: 'medium', description: 'Reduced leg fatigue' },
            { domain: 'inflammation', effect: 'positive', magnitude: 'small', description: 'Improved drainage' }
        ]
    },
    {
        id: 'compression_garments',
        name: 'Compression Wear',
        emoji: '🩱',
        category: 'compression',
        tier: 2,
        duration_minutes: null,
        frequency_cap_weekly: null,
        frequency_cap_daily: 1,
        min_hours_between: 0,
        access_required: 'compression_clothing',
        alternatives: ['legs_up_wall'],
        blocked_after: [],
        blocked_hours: 0,
        optimal_after: ['strength', 'cardio'],
        effectiveness_score: 5,
        evidence_level: 'moderate',
        description: 'Wear compression clothing post-workout',
        protocol: 'Wear for 2-4 hours after workout. Moderate compression.',
        science: 'Reduces muscle fatigue and soreness. Improves blood flow. Perception of recovery.',
        causal_effects: [
            { domain: 'soreness', effect: 'positive', magnitude: 'small', description: 'Reduced fatigue perception' }
        ]
    },
    {
        id: 'legs_up_wall',
        name: 'Legs Up Wall',
        emoji: '🦶',
        category: 'compression',
        tier: 3,
        duration_minutes: 10,
        frequency_cap_weekly: null,
        frequency_cap_daily: 3,
        min_hours_between: 0,
        access_required: 'wall',
        alternatives: [],
        blocked_after: [],
        blocked_hours: 0,
        optimal_after: ['cardio', 'hiit'],
        effectiveness_score: 5,
        evidence_level: 'moderate',
        description: 'Passive inversion against wall',
        protocol: 'Lie on back, legs vertical against wall. Relax 10-15 min.',
        science: 'Passive lymphatic drainage. Zero equipment. Promotes venous return.',
        causal_effects: [
            { domain: 'soreness', effect: 'positive', magnitude: 'small', description: 'Reduced leg heaviness' }
        ]
    },

    // =========================================
    // CATEGORY: NEURAL / NERVOUS SYSTEM
    // =========================================
    {
        id: 'diaphragmatic_breathing',
        name: 'Deep Breathing',
        emoji: '🌬️',
        category: 'neural',
        tier: 0,
        duration_minutes: 5,
        frequency_cap_weekly: null,
        frequency_cap_daily: 10,
        min_hours_between: 0,
        access_required: null,
        alternatives: [],
        blocked_after: [],
        blocked_hours: 0,
        optimal_after: [],
        effectiveness_score: 8,
        evidence_level: 'strong',
        description: 'Slow diaphragmatic breathing for parasympathetic activation',
        protocol: '6 breaths/min. 4s inhale, 6s exhale. Focus on belly expansion.',
        science: 'Activates parasympathetic. HRV improvement within 5 min. Universal, always available.',
        causal_effects: [
            { domain: 'hrv', effect: 'positive', magnitude: 'medium', description: 'Immediate HRV improvement' },
            { domain: 'stress', effect: 'positive', magnitude: 'medium', description: 'Cortisol reduction' }
        ]
    },
    {
        id: 'meditation',
        name: 'Meditation',
        emoji: '🧘',
        category: 'neural',
        tier: 3,
        duration_minutes: 10,
        frequency_cap_weekly: null,
        frequency_cap_daily: 2,
        min_hours_between: 4,
        access_required: 'quiet_space',
        alternatives: ['diaphragmatic_breathing', 'body_scan'],
        blocked_after: [],
        blocked_hours: 0,
        optimal_after: [],
        effectiveness_score: 7,
        evidence_level: 'strong',
        description: 'Mindfulness meditation practice',
        protocol: 'Sit comfortably. Focus on breath. Notice and release thoughts.',
        science: 'Lowers cortisol. Improves HRV baseline over time. Stress resilience.',
        causal_effects: [
            { domain: 'stress', effect: 'positive', magnitude: 'large', description: 'Long-term stress reduction' },
            { domain: 'hrv', effect: 'positive', magnitude: 'medium', description: 'Baseline HRV improvement' }
        ]
    },
    {
        id: 'body_scan',
        name: 'Body Scan Relaxation',
        emoji: '🧠',
        category: 'neural',
        tier: 3,
        duration_minutes: 10,
        frequency_cap_weekly: null,
        frequency_cap_daily: 2,
        min_hours_between: 0,
        access_required: null,
        alternatives: ['meditation', 'diaphragmatic_breathing'],
        blocked_after: [],
        blocked_hours: 0,
        optimal_after: ['strength'],
        effectiveness_score: 6,
        evidence_level: 'moderate',
        description: 'Progressive muscle relaxation through body awareness',
        protocol: 'Lie down. Sequentially focus on each body part. Release tension.',
        science: 'Progressive relaxation. Identifies tension areas. Good for sleep prep.',
        causal_effects: [
            { domain: 'stress', effect: 'positive', magnitude: 'medium', description: 'Physical tension release' },
            { domain: 'sleep', effect: 'positive', magnitude: 'small', description: 'Better sleep onset' }
        ]
    },

    // =========================================
    // CATEGORY: ACTIVE RECOVERY
    // =========================================
    {
        id: 'active_recovery_walk',
        name: 'Recovery Walk',
        emoji: '🚶',
        category: 'active',
        tier: 3,
        duration_minutes: 20,
        frequency_cap_weekly: null,
        frequency_cap_daily: 3,
        min_hours_between: 2,
        access_required: null,
        alternatives: [],
        blocked_after: [],
        blocked_hours: 0,
        optimal_after: ['strength', 'hiit'],
        effectiveness_score: 6,
        evidence_level: 'strong',
        description: 'Light walking to promote blood flow',
        protocol: '15-30 min at conversational pace. Ideally outdoors for light exposure.',
        science: 'Promotes blood flow. Clears metabolic waste. Low stress. Universal.',
        causal_effects: [
            { domain: 'soreness', effect: 'positive', magnitude: 'small', description: 'Improved circulation' },
            { domain: 'stress', effect: 'positive', magnitude: 'small', description: 'Mental clarity' }
        ]
    },
    {
        id: 'light_swimming',
        name: 'Easy Swim',
        emoji: '🏊',
        category: 'active',
        tier: 2,
        duration_minutes: 20,
        frequency_cap_weekly: null,
        frequency_cap_daily: 1,
        min_hours_between: 8,
        access_required: 'pool',
        alternatives: ['active_recovery_walk'],
        blocked_after: [],
        blocked_hours: 0,
        optimal_after: ['strength'],
        effectiveness_score: 7,
        evidence_level: 'moderate',
        description: 'Low-intensity swimming for full-body blood flow',
        protocol: 'Easy pace. Focus on long strokes. No intensity.',
        science: 'Low impact. Full body blood flow. Good for joint health.',
        causal_effects: [
            { domain: 'soreness', effect: 'positive', magnitude: 'medium', description: 'Full body relief' }
        ]
    },
    {
        id: 'gentle_cycling',
        name: 'Easy Spin',
        emoji: '🚴',
        category: 'active',
        tier: 2,
        duration_minutes: 20,
        frequency_cap_weekly: null,
        frequency_cap_daily: 1,
        min_hours_between: 8,
        access_required: 'bike',
        alternatives: ['active_recovery_walk'],
        blocked_after: [],
        blocked_hours: 0,
        optimal_after: ['strength'],
        effectiveness_score: 6,
        evidence_level: 'moderate',
        description: 'Low-intensity cycling for active recovery',
        protocol: '15-30 min at very easy effort. No resistance.',
        science: 'Active recovery without load. Promotes leg blood flow.',
        causal_effects: [
            { domain: 'soreness', effect: 'positive', magnitude: 'small', description: 'Leg circulation' }
        ]
    },

    // =========================================
    // CATEGORY: HYDRATION & NUTRITION
    // =========================================
    {
        id: 'hydration_protocol',
        name: 'Hydration Focus',
        emoji: '💧',
        category: 'nutrition',
        tier: 0,
        duration_minutes: null,
        frequency_cap_weekly: null,
        frequency_cap_daily: 1,
        min_hours_between: 0,
        access_required: null,
        alternatives: [],
        blocked_after: [],
        blocked_hours: 0,
        optimal_after: ['strength', 'cardio', 'hiit'],
        effectiveness_score: 8,
        evidence_level: 'strong',
        description: 'Focused rehydration protocol',
        protocol: '500ml within 30 min post-workout. Sip throughout day. Target 3L+ daily.',
        science: 'Fundamental for recovery. Often overlooked. Affects all bodily functions.',
        causal_effects: [
            { domain: 'performance', effect: 'positive', magnitude: 'medium', description: 'Maintained function' },
            { domain: 'soreness', effect: 'positive', magnitude: 'small', description: 'Better nutrient delivery' }
        ]
    },
    {
        id: 'electrolyte_replenish',
        name: 'Electrolytes',
        emoji: '⚡',
        category: 'nutrition',
        tier: 2,
        duration_minutes: null,
        frequency_cap_weekly: null,
        frequency_cap_daily: 2,
        min_hours_between: 4,
        access_required: 'electrolytes',
        alternatives: ['hydration_protocol'],
        blocked_after: [],
        blocked_hours: 0,
        optimal_after: ['cardio', 'hiit'],
        effectiveness_score: 6,
        evidence_level: 'strong',
        description: 'Replace minerals lost through sweat',
        protocol: 'Electrolyte drink or tablet. Post-workout or during long sessions.',
        science: 'Replaces sodium, potassium, magnesium lost in sweat. Prevents cramping.',
        causal_effects: [
            { domain: 'performance', effect: 'positive', magnitude: 'small', description: 'Prevented cramping' }
        ]
    },
    {
        id: 'recovery_protein',
        name: 'Recovery Protein',
        emoji: '🥛',
        category: 'nutrition',
        tier: 2,
        duration_minutes: null,
        frequency_cap_weekly: null,
        frequency_cap_daily: 3,
        min_hours_between: 3,
        access_required: 'protein_source',
        alternatives: [],
        blocked_after: [],
        blocked_hours: 0,
        optimal_after: ['strength', 'hypertrophy'],
        effectiveness_score: 9,
        evidence_level: 'strong',
        description: 'Protein intake for muscle repair',
        protocol: '30-40g protein within 2 hours post-workout. Whey, casein, or whole food.',
        science: 'Essential for muscle protein synthesis. 1.6-2.2g/kg body weight daily for athletes.',
        causal_effects: [
            { domain: 'performance', effect: 'positive', magnitude: 'large', description: 'Muscle repair accelerated' },
            { domain: 'soreness', effect: 'positive', magnitude: 'small', description: 'Faster recovery' }
        ]
    }
];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export function getModalityById(id: string): RecoveryModality | undefined {
    return RECOVERY_MODALITIES.find(m => m.id === id);
}

export function getModalitiesByCategory(category: ModalityCategory): RecoveryModality[] {
    return RECOVERY_MODALITIES.filter(m => m.category === category);
}

export function getModalitiesByTier(tier: ModalityTier): RecoveryModality[] {
    return RECOVERY_MODALITIES.filter(m => m.tier === tier);
}

export function getEssentialModalities(): RecoveryModality[] {
    return RECOVERY_MODALITIES.filter(m => m.tier === 0);
}

export function getAlternatives(modalityId: string): RecoveryModality[] {
    const modality = getModalityById(modalityId);
    if (!modality) return [];
    return modality.alternatives
        .map(altId => getModalityById(altId))
        .filter((m): m is RecoveryModality => m !== undefined);
}

export function isBlockedAfterTraining(modalityId: string, trainingType: TrainingType, hoursSince: number): boolean {
    const modality = getModalityById(modalityId);
    if (!modality) return false;
    if (!modality.blocked_after.includes(trainingType)) return false;
    return hoursSince < modality.blocked_hours;
}

export function getBlockedReason(modalityId: string, trainingType: TrainingType): string | null {
    const modality = getModalityById(modalityId);
    if (!modality) return null;
    if (!modality.blocked_after.includes(trainingType)) return null;
    return `${modality.name} is blocked for ${modality.blocked_hours}h after ${trainingType} training to avoid interfering with muscle adaptation.`;
}
