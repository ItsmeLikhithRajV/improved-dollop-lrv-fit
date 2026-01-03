
// =====================================================
// RECOVERY DOMAIN TYPES
// =====================================================

export type BodyZone = 'neck' | 'shoulders' | 'upper_back' | 'lower_back' | 'hips' | 'knees' | 'ankles' | 'feet' | 'elbows' | 'wrists' | 'quads' | 'hamstrings' | 'calves';
export type SorenessLevel = 'none' | 'tight' | 'sore' | 'pain' | 'injured';

export interface AutonomicProfile {
    rmssd: number;
    hf_power?: number;
    lf_hf_ratio?: number;
    tonic_vagal_tone: number; // 0-100
    phasic_hrv?: number;
    car_magnitude?: number; // Cortisol Awakening Response %
    car_blunted: boolean;
    parasympathetic_score: number; // 0-100
}

export interface MyokineSignaling {
    il6_acute?: number;
    il6_24h?: number;
    il6_decay_rate?: number; // Percentage 0.0-1.0
    ck_level?: number;
    ferritin?: number;
    muscle_damage_flag: boolean;
    inflammation_resolution: "optimal" | "delayed" | "chronic";
}

export interface NeuromuscularProfile {
    cmj_height_avg?: number;
    cmj_height_baseline?: number;
    cmj_height_delta?: number; // %
    rsi?: number;
    force_eccentric?: number;
    force_concentric?: number;
    neuromuscular_status: "fresh" | "fatigued" | "cns_compromised";
}

export interface LactateMetabolism {
    lactate_threshold_hr?: number;
    lactate_post_load?: number;
    lactate_clearance_rate?: number;
    clearance_efficiency: "elite" | "trained" | "developing";
    vo2_max?: number;
    estimated_clearance_min_50pct?: number;
}

export interface SleepArchitecture {
    n1_percent?: number;
    n2_percent?: number;
    n3_percent?: number;
    rem_percent?: number;
    sleep_debt_hours_cumulative: number;
    adenosine_load: number;
    chronotype_mismatch: boolean;
}

export interface MitochondrialProfile {
    glycogen_depletion_level: number; // 0-100
    pgc1a_activity: number; // 0-1 estimated
    supercompensation_ready: boolean;
    protocol?: {
        phase: 'phase1_active' | 'maintenance';
        carb_target_g_per_kg: number;
        high_gi_window_hours: number;
        moderate_gi_window_hours: number;
        ferritin_check: boolean;
    };
}

export interface FascialHealth {
    collagen_turnover_phase: "breakdown" | "synthesis_peak" | "remodeling" | "stable";
    adhesion_risk: number; // 0-1.0
    mobility_priority: string;
}

export interface VestibularProfile {
    balance_delta_percent: number;
    vestibular_fatigue: boolean;
}

export interface HormonalProfile {
    cycle_phase: "menstrual" | "follicular" | "ovulatory" | "luteal" | "none";
    injury_risk_multiplier: number;
    recovery_speed_modifier: number;
}

export interface BoneHealthProfile {
    piezoelectric_load_stimulus: number; // 0-100 (mechanical → electrical signal strength)
    high_impact_volume: number; // meters sprinting OR jumps/week
    resistance_training_compliance: number; // 0-1 (3x/week progressive overload)
    bone_stimulus_score: number; // 0-100 composite
    osteoporosis_risk: boolean; // age>35 + low stimulus
    cofactor_optimization: {
        calcium_status: 'optimal' | 'deficient'; // 1000-1200mg
        vitamin_d_status: 'optimal' | 'deficient'; // 2000-4000 IU
    };
}

export interface MicrobiomeProfile {
    firmicutes_bacteroidetes_ratio: number; // Target: 0.6 (60:40)
    scfa_production_score: number; // 0-100 (butyrate, propionate, acetate)
    barrier_integrity: number; // 0-1 (tight junction health)
    endotoxemia_risk: 'low' | 'moderate' | 'high';
    dysbiosis_flag: boolean;
}

export interface RippleEffect {
    source: string;
    target: string;
    impact: string;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
}

export interface OverreachRisk {
    risk_score: number; // 0-100
    probability: number; // %
    days_to_symptomatic: number;
    signals: string[];
    status: "optimal" | "functional_overreach" | "non_functional_overreach" | "burnout";
}

export interface RecoveryAction {
    type: "critical" | "essential" | "mandatory" | "recommended" | "optional";
    label: string;
    description: string;
    protocol_id?: string;
    timing?: string;
    duration_min?: number;
    priority?: string;
}

export interface EliteRecoveryState {
    autonomic: AutonomicProfile;
    myokine: MyokineSignaling;
    neuromuscular: NeuromuscularProfile;
    lactate: LactateMetabolism;
    sleep_architecture: SleepArchitecture;
    mitochondrial: MitochondrialProfile;
    fascial: FascialHealth;
    vestibular: VestibularProfile;
    hormonal: HormonalProfile;
    bone: BoneHealthProfile;
    microbiome: MicrobiomeProfile;
    ripple_effects: RippleEffect[];
    overreach_risk: OverreachRisk;
    actions: RecoveryAction[];

    // Legacy support
    soreness_map: Record<BodyZone, SorenessLevel>;
    fatigue_level: number;
    muscle_tightness: number;
    joint_stress: number;
    injury_status: {
        is_injured: boolean;
        active_injuries: string[];
    };
    recovery_score: number;
    muscle_soreness?: number; // Legacy field
    hrv_trend?: "increase" | "decrease" | "stable" | "improving" | "declining" | "low"; // Legacy field
}

// Re-export as RecoveryState for backward compatibility, but it is now the Elite version
export type RecoveryState = EliteRecoveryState;
