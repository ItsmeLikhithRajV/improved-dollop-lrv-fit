/**
 * Demo Data Service
 * 
 * Provides realistic sample data for demonstration purposes.
 * This data simulates a real user who has been tracking for several weeks.
 * 
 * Used when ui_config.demo_mode === true
 */

import { GlobalState } from '../types';

/**
 * Demo user profile - represents an active fitness enthusiast
 */
const demoUserProfile = {
    id: "demo_user",
    name: "Demo User",
    age: 32,
    gender: "male" as const,
    weight: 78,
    height: 178,
    salty_sweater: false,
    sport_type: "endurance",
    training_level: "intermediate",
    chronotype: "neutral" as const,
    clinical: { conditions: [] },
    allergies: [],
    gut_sensitivity: "low" as const,
    diet_type: "omnivore" as const,
    goals: ["Peak Performance", "Longevity"],
    baselines: {
        resting_hr: 58,
        hrv_baseline: 65,
        reaction_time: 280,
        sleep_need: 7.5,
        jump_height_cm: 42
    },
    preferences: { theme: "dark" as const, units: "metric" as const }
};

/**
 * Demo sleep data - showing a good night's sleep
 */
const demoSleep = {
    duration: 7.5,
    efficiency: 91,
    disturbances: 2,
    sleep_debt: 0.5,
    hrv: 68,
    resting_hr: 56,
    bedtime: "22:30",
    wake_time: "06:00",
    sleep_quality_score: 85
};

/**
 * Demo recovery data - moderately recovered state
 */
const demoRecovery = {
    soreness_map: {
        neck: 'none' as const, shoulders: 'light' as const, upper_back: 'none' as const, lower_back: 'light' as const,
        hips: 'none' as const, knees: 'none' as const, ankles: 'none' as const, feet: 'none' as const,
        elbows: 'none' as const, wrists: 'none' as const, quads: 'moderate' as const, hamstrings: 'light' as const, calves: 'none' as const
    },
    fatigue_level: 35,
    muscle_tightness: 30,
    joint_stress: 15,
    injury_status: { is_injured: false, active_injuries: [] },
    recovery_score: 78,
    autonomic: { rmssd: 68, tonic_vagal_tone: 0.72, car_blunted: false, parasympathetic_score: 75 },
    myokine: { muscle_damage_flag: false, inflammation_resolution: "optimal" as const },
    neuromuscular: { neuromuscular_status: "fresh" as const },
    lactate: { clearance_efficiency: "trained" as const },
    sleep_architecture: { sleep_debt_hours_cumulative: 0.5, adenosine_load: 20, chronotype_mismatch: false },
    mitochondrial: { glycogen_depletion_level: 25, pgc1a_activity: 0.8, supercompensation_ready: false },
    fascial: { collagen_turnover_phase: "stable" as const, adhesion_risk: 10, mobility_priority: "maintenance" as const },
    vestibular: { balance_delta_percent: 2, vestibular_fatigue: false },
    hormonal: { cycle_phase: "none" as const, injury_risk_multiplier: 1.0, recovery_speed_modifier: 1.0 },
    bone: { piezoelectric_load_stimulus: 65, high_impact_volume: 30, resistance_training_compliance: 80, bone_stimulus_score: 70, osteoporosis_risk: false, cofactor_optimization: { calcium_status: 'optimal' as const, vitamin_d_status: 'optimal' as const } },
    microbiome: { firmicutes_bacteroidetes_ratio: 1.2, scfa_production_score: 75, barrier_integrity: 85, endotoxemia_risk: 'low' as const, dysbiosis_flag: false },
    ripple_effects: [],
    overreach_risk: { risk_score: 15, probability: 0.1, days_to_symptomatic: 14, signals: [], status: "optimal" as const },
    actions: []
};

/**
 * Demo mindspace data - good mental state
 */
const demoMindspace = {
    mood: 75,
    stress: 30,
    motivation: 80,
    focus_quality: "high" as const,
    confidence: 70,
    nerves: false,
    cognitive_scores: { reaction_time: 275, accuracy: 94 },
    readiness_score: 82,
    state_vector: {
        stress: 30,
        mood: 75,
        cognitive_load: 35,
        autonomic_balance: 0.65,
        arousal: 60,
        emotional_valence: 70,
        attentional_stability: 80,
        resilience_state: "stable" as const,
        resilience_velocity: 0.1,
        last_test_type: "reaction" as const,
        last_test_grade: "A" as const,
        last_test_delta: 5,
        journal_confidence: 0.8,
        last_journal_sentiment: "Positive" as const,
        state_age_minutes: 120,
        trend_direction: "improving" as const
    },
    cognitive_history: {},
    protocol_history: []
};

/**
 * Demo physical load - moderate training load
 */
const demoPhysicalLoad = {
    acwr: 1.15,
    acute_load: 320,
    chronic_load: 280,
    monotony: 1.4,
    strain: 450,
    weekly_volume: 8,
    load_history: [
        { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), load: 45, type: 'run' },
        { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), load: 30, type: 'strength' },
        { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), load: 55, type: 'run' },
        { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), load: 0, type: 'rest' },
        { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), load: 50, type: 'run' },
        { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), load: 40, type: 'strength' },
        { date: new Date().toISOString(), load: 60, type: 'run' }
    ],
    metrics: []
};

/**
 * Demo fuel data - well-fueled state
 */
const demoFuel = {
    entries: [],
    macros_today: { protein: 120, carbs: 280, fat: 70, sodium: 2200, fluids: 2.5 },
    hydration_liters: 2.5,
    electrolytes_taken: true,
    caffeine_mg: 150,
    fuel_score: 75,
    active_protocol: null,
    supplements: []
};

/**
 * Demo orchestrator state
 */
const demoOrchestrator = {
    readiness_summary: "Good to go! You're well-recovered.",
    explanation: "Your HRV is 5% above baseline and sleep quality was excellent. Consider a moderate intensity session today.",
    risk_signals: [],
    recommended_actions: [
        "Moderate intensity run (45-60 min)",
        "Hydrate with electrolytes",
        "Evening mobility session"
    ],
    active_command: {
        action: {
            id: 'demo_action_1',
            name: 'Morning Run',
            description: 'Easy to moderate effort, focus on form',
            instructions: 'Start with 10 min warmup, main set at Zone 2-3',
            duration_minutes: 45
        },
        rationale: {
            reason: 'Recovery is optimal and weather conditions are favorable',
            metric: 'HRV +5%',
            impact_if_done: 'Build aerobic base, maintain consistency',
            impact_if_skipped: 'Minor - adequate fitness buffer'
        },
        timing: {
            start_now: false,
            deadline_minutes: 180,
            suggested_completion_time: '09:00'
        },
        status: 'upcoming' as const,
        progress: 0
    },
    last_sync: Date.now(),
    is_thinking: false
};

/**
 * Returns demo data overlay for GlobalState
 * Merges with existing state to preserve structure
 */
export function getDemoData(): Partial<GlobalState> {
    return {
        user_profile: demoUserProfile as any,
        sleep: demoSleep,
        recovery: demoRecovery as any,
        mindspace: demoMindspace as any,
        physical_load: demoPhysicalLoad as any,
        fuel: demoFuel,
        orchestrator: demoOrchestrator as any
    };
}

/**
 * Check if demo mode is enabled in state
 */
export function isDemoMode(state: GlobalState): boolean {
    return (state as any).ui_config?.demo_mode === true;
}
