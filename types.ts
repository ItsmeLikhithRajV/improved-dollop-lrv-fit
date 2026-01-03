
import type { FuelState, FuelProtocol, FuelViewModel, Meal, ClinicalAction } from './features/fuel/types';
import type {
  RecoveryState, BodyZone, SorenessLevel, EliteRecoveryState, RecoveryAction,
  AutonomicProfile, MyokineSignaling, NeuromuscularProfile, LactateMetabolism,
  SleepArchitecture, MitochondrialProfile, FascialHealth, VestibularProfile,
  HormonalProfile, RippleEffect, OverreachRisk, BoneHealthProfile, MicrobiomeProfile
} from './features/recovery/types';
import type { SleepState } from './features/sleep/types';
import type { MindspaceState, PriorityLevel } from './features/mindspace/types';
import type { PhysicalLoadState, TrendDirection } from './features/physical_load/types';
import type { TimelineProtocol, ProtocolFeedback, SleepHygieneStack } from './types/longevity';

// =====================================================
// EXPORTS
// =====================================================
export type {
  RecoveryState, BodyZone, SorenessLevel, EliteRecoveryState, RecoveryAction,
  AutonomicProfile, MyokineSignaling, NeuromuscularProfile, LactateMetabolism,
  SleepArchitecture, MitochondrialProfile, FascialHealth, VestibularProfile,
  HormonalProfile, RippleEffect, OverreachRisk, BoneHealthProfile, MicrobiomeProfile,
  SleepState,
  MindspaceState, PriorityLevel,
  PhysicalLoadState, TrendDirection,
  FuelState, FuelProtocol, FuelViewModel, Meal, ClinicalAction,
  TimelineProtocol, ProtocolFeedback, SleepHygieneStack
};

// =====================================================
// PRIMITIVES
// =====================================================

export type MetricUnit = 'kg' | 'lbs' | 'km' | 'miles' | 'kcal' | 'min' | 'hours' | 'ms' | '%';

// =====================================================
// SHARED VIEW MODELS
// =====================================================

export interface ProgressBarVM {
  label: string;
  current: number;
  target: number;
  unit: string;
  percent: number;
  colorClass: string;
}

// =====================================================
// ORCHESTRATOR OUTPUT CONTRACT (SLO)
// =====================================================

export interface RecommendedAction {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  timing: 'immediate' | 'within_1h' | 'within_4h' | 'this_evening';
  impact: {
    metric: string;
    expected_change: number;
    confidence: number;
  };
  why: string;
  domain: 'fuel' | 'sleep' | 'parasympathetic' | 'mind';
}

export interface ActiveCommand {
  action: {
    id: string;
    name: string;
    description: string;
    instructions: string;
    duration_minutes: number;
  };
  rationale: {
    reason: string;
    metric: string;
    impact_if_done: string;
    impact_if_skipped: string;
  };
  timing: {
    start_now: boolean;
    deadline_minutes: number;
    suggested_completion_time: string;
  };
  status: 'upcoming' | 'active' | 'completed' | 'missed';
  progress: number;
  next_hint?: {
    name: string;
    when_minutes: number;
    why: string;
  };
}

export interface EngineRecommendation {
  engine: 'fuel' | 'sleep' | 'parasympathetic' | 'mind';
  status: {
    metric: number;
    target: number;
    deficit: number;
    urgency: 'critical' | 'high' | 'medium' | 'low' | 'normal';
  };
  actions: RecommendedAction[];
  priority_score: number; // 0-100
}

export interface SentientOutput {
  tags: string[];
  commanderDecision: {
    mode?: string;
    summary?: string;
    urgent?: boolean;
    reason?: string;
    action?: string;
    risk_signals?: string[];
    acwr?: number;
  };
  activeCommand?: ActiveCommand | null;
  timeline: {
    adjustments: any[];
    applied_timeline: Session[];
  };
  readinessScore: number;
  recoveryScore: number;
  fuelState: {
    fuel_score?: number;
    fuelLevel?: number;
    status?: string;
    action_required?: string | null;
    active_protocol?: FuelProtocol | null;
    clinical_veto?: string | null;
    viewModel?: FuelViewModel;
  };
  sessionAdjustments: any[];
  sleepPlan: {
    recommended_bedtime?: string;
    hygiene_action?: string | null;
  };
  environmentFlags: string[];
  injuryRisks: any[];
  supplementPlan: any[];
  mindspaceReadiness: {
    score: number;
    protocol?: string | null;
    mood?: number;
    stress?: number;
  };
  performanceLabs?: PerformanceLabsOutput;
  explanations: string[];
  butterflyEffects?: {
    fuel?: Partial<FuelState>;
    mindspace?: Partial<MindspaceState>;
    recovery?: Partial<RecoveryState>;
  };
}

// =====================================================
// PERFORMANCE LABS TYPES (V2 META-ENGINE)
// =====================================================

export type TrainingStateLabel = "adaptation" | "accumulation" | "plateau" | "maladaptation" | "taper" | "unknown";
export type RiskBand = "low" | "medium" | "high";
export type TrajectoryLabel = "on_track" | "lagging" | "fragile_progress" | "risk_profile" | "slow_positive";

export interface LabsMeta {
  history_days: number;
  data_coverage: Record<string, number>;
  has_tournaments: boolean;
  notes: string[];
}

export interface LongitudinalState {
  label: TrainingStateLabel;
  confidence_0_1: number;
  evidence: string[];
  days_in_state: number;
  secondary_labels?: string[];
}

export interface ResilienceProfile {
  resilience_score_0_100: number;
  trend: "improving" | "stable" | "declining";
  avg_recovery_time_days: number;
  recent_stress_events_analyzed: number;
  classification: string;
  evidence: string[];
}

export interface PlateauAnalysis {
  is_plateau: boolean;
  confidence_0_1: number;
  plateau_weeks?: number;
  stimulus_analysis?: {
    volume_trend: string;
    intensity_trend: string;
    notes: string[];
  };
  recommended_stimulus_levers: string[];
}

export interface TournamentIntelligence {
  next_competition?: {
    name: string;
    days_to_competition: number;
    priority_tier: string;
  } | null;
  current_phase: "build" | "peak" | "taper" | "competition" | "off_season";
  phase_evaluation: {
    message: string;
    risk_flags: string[];
  };
  recommended_competition_plan?: {
    high_level: string[];
  };
}

export interface TrajectoryAnalysis {
  metrics: {
    name: string;
    current_value: number;
    projected_value: number;
    projection_confidence_0_1: number;
    trend_label: string;
  }[];
  global_commentary: string;
  ceiling_estimate: number;
}

export interface BehaviorAnalysis {
  consistency_score_0_100: number;
  consistency_notes: string[];
}

export interface ConvergencePattern {
  name: string;
  active: boolean;
  confidence_0_1: number;
  evidence: string[];
  recommended_response: string[];
  overall_risk_score?: number;
}

export interface RippleOutputs {
  preferred_training_state_next_7d: string;
  focus_directive: string;
  risk_directive: {
    short_horizon_injury_risk_band: RiskBand;
    short_horizon_performance_risk_band: RiskBand;
  };
}

export interface LabsCommunication {
  tone_level: "calm" | "advisory" | "urgent" | "motivational";
  headline: string;
  summary: string[];
  recommended_actions_next_7d: string[];
}

export interface PerformanceLabsOutput {
  meta: LabsMeta;
  longitudinal_state: LongitudinalState;
  resilience_profile: ResilienceProfile;
  plateau_and_stimulus: PlateauAnalysis;
  tournament_intelligence: TournamentIntelligence;
  trajectory_and_ceiling: TrajectoryAnalysis;
  behavior_and_interventions: BehaviorAnalysis;
  convergence_patterns: {
    patterns_detected: ConvergencePattern[];
    overall_risk_score: number;
  };
  ripple_outputs: RippleOutputs;
  communication: LabsCommunication;

  // Legacy support fields (optional) to prevent UI breaks during migration
  state_classification?: any;
  resilience_block?: any;
  short_horizon_risk?: any;
  trajectory_block?: any;
  load_directives?: any;
}

// =====================================================
// CLINICAL SUB-PROFILES (ELITE METABOLIC)
// =====================================================

export interface PCOSSubProfile {
  phenotype: 'typeA' | 'typeB' | 'typeC' | 'typeD';
  homa_ir: number;
  fasting_insulin_mu_ml: number;
  cycle_length_days: number;
  testosterone_ng_ml: number;
  lh_fsh_ratio: number;
  current_phase: 'follicular' | 'luteal' | 'unknown';
  days_into_cycle: number;
  inositol_daily_mg: number;
  vitamin_d_level_ng_ml: number;
  magnesium_daily_mg: number;
  chromium_daily_mcg?: number;
}

export interface T1DSubProfile {
  delivery_method: 'pump' | 'pens' | 'closed_loop';
  pump_type?: string;
  total_daily_insulin_units: number;
  insulin_to_carb_ratios: { breakfast: number; lunch: number; dinner: number; };
  correction_factors: { breakfast: number; lunch: number; dinner: number; };
  current_glucose_mg_dl?: number;
  glucose_trend?: 'rising_fast' | 'rising' | 'flat' | 'falling' | 'falling_fast';
  active_insulin_units?: number;
  cgm_device?: 'Dexcom-G7' | 'Freestyle-Libre' | 'Medtronic' | 'none';
  hba1c_percent: number;
  time_in_range_percent: number;
  glucagon_response: 'normal' | 'blunted' | 'absent';
  hypoglycemia_awareness: 'normal' | 'reduced' | 'absent';
}

// =====================================================
// GENETIC PROFILE (GAP 3)
// =====================================================
export interface GeneticProfile {
  fto_variant: 'AA' | 'AT' | 'TT'; // Carb efficiency
  actn3_variant: 'RR' | 'RX' | 'XX'; // Fiber type
  ppargc1a_rs8192678: 'GG' | 'GA' | 'AA'; // Mitochondrial biogenesis
  mthfr_c677t: 'CC' | 'CT' | 'TT'; // Folate metabolism
  vdr_rs2228570: 'ff' | 'fF' | 'FF'; // Vitamin D receptor

  // Derived
  carbohydrate_utilization_coefficient?: number;
  protein_mps_ceiling?: number;
  mitochondrial_biogenesis_rate?: number;
  vitamin_d_sensitivity?: number;
}

// =====================================================
// USER PROFILE (IDENTITY ENGINE)
// =====================================================
export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female";
  weight: number; // kg
  height: number; // cm
  salty_sweater: boolean;
  sport_type: "general" | "running" | "football" | "strength" | "hybrid";
  training_level: "beginner" | "intermediate" | "advanced" | "elite";
  chronotype?: "early" | "late" | "neutral";

  vo2max?: number;
  max_hr?: number;
  training_age_years?: number;
  menstrual_cycle_day?: number; // 1-28

  allergies: ("gluten" | "dairy" | "nuts" | "shellfish")[];
  gut_sensitivity: "low" | "moderate" | "high";
  diet_type?: 'omnivore' | 'vegetarian' | 'vegan';

  clinical: {
    conditions: ("t1d" | "pcos" | "hypertension" | "ibs" | "hypothyroid" | "red_s")[];
    insulin_sensitivity_factor?: number;
    carb_tolerance_cap?: number;
  };

  pcos_profile?: PCOSSubProfile;
  t1d_profile?: T1DSubProfile;
  genetic_profile?: GeneticProfile; // NEW: Gap 3

  goals: string[];
  user_goal?: import('./types/goals').UserGoal;  // V2: Scientific goal-based system
  baselines: {
    resting_hr: number;
    hrv_baseline: number;
    reaction_time: number;
    sleep_need: number;
    sleep_goal?: number; // Target hours
    jump_height_cm?: number;
  };
  preferences: {
    theme: "dark" | "light" | "auto";
    units: "metric" | "imperial";
    disabled_protocols?: string[];
  };
  body_composition?: import('./types/body').BodyComposition;  // NEW: Body metrics for fuel calculations
}

// =====================================================
// TIMELINE STATE (ENGINE 06)
// =====================================================
export interface Session {
  id: string;
  date?: string; // ISO string
  type: "sport" | "gym" | "conditioning" | "mobility" | "recovery" | "other" | "sprint" | "plyometric" | "strength";
  time_of_day: string | null;
  sequence_block: "morning" | "midday" | "afternoon" | "evening";
  title: string;
  description: string;
  intensity: "low" | "medium" | "high";
  activity_type?: "aerobic" | "anaerobic" | "mixed" | "strength" | "endurance" | "hybrid" | "deload" | "competition";
  duration_minutes: number;
  distance_meters?: number;
  jumps?: number;
  primary_plane?: "sagittal" | "frontal" | "transverse";
  rpe_planned?: number;
  mandatory: boolean;
  completed: boolean;
  coach_planned?: boolean;
  ai_extracted?: boolean;
  notes?: string;
  expected_intensity?: string | null;
  is_competition_simulation?: boolean;

  mutation_source?: 'recovery' | 'mind' | 'performance' | 'fuel';
  mutation_reason?: string;
  original_intensity?: "low" | "medium" | "high";

  feedback?: {
    rpe: number;
    soreness: "none" | "low" | "moderate" | "high";
    fatigue: "fresh" | "normal" | "drained" | "exhausted";
    mood: "great" | "good" | "neutral" | "stressed" | "down";
    notes?: string;
  };
  is_interstitial?: boolean;
  interstitial_type?: 'fuel_prime' | 'fuel_recovery' | 'prep_tissue' | 'mind_prime' | 'mind_reset';
  interstitial_data?: {
    action: string;
    details: string;
    linked_session_id?: string;
  }
}

export interface TimelineState {
  sessions: Session[];
  today_sessions?: Session[];
  adjustments: string[];
  ready?: number;
}

// =====================================================
// ENVIRONMENT & MEDICAL (ENGINES 07-08)
// =====================================================
export interface EnvironmentState {
  temperature?: number;
  humidity?: number;
  altitude?: number;
  travel_status: "home" | "traveling" | "hotel";
  AQI?: number;
  heat_index_high?: boolean;
}

export interface MedicalState {
  biomarkers: {
    name: string;
    value: string;
    date: string;
    status: "optimal" | "warning" | "critical";
  }[];
  notes: string;
  ferritin?: number;
  vitamin_D?: number;
  ck_level?: number;
  il6_level?: number;
  cortisol_waking?: number;
  cortisol_30min?: number;
  glucose_mgdl?: number;
  glucose_trend?: "up" | "down" | "stable" | "rapid_up" | "rapid_down";
  ketones_mmol?: number;
  systolic_bp?: number;
  tsh_level?: number;
}

// =====================================================
// SIMULATION & PREDICTIVE ENGINE (NEW)
// =====================================================
export type ScheduleArchetype = 'shock' | 'taper' | 'maintenance' | 'rehab';
export type LifestyleArchetype = 'optimal' | 'sleep_deprived' | 'high_stress' | 'poor_nutrition';

export interface DayResult {
  day: number;
  readiness: number;
  fuel_score: number;
  recovery_score: number;
  acwr: number;
  injury_risk: number; // 0-100
  dominant_signal: string;
  system_state: "Operational" | "Strained" | "Failed";
}

export interface SimulationReport {
  campaign_id: string;
  schedule_name: string;
  lifestyle_name: string;
  trajectory: DayResult[];
  failure_point: number | null; // Day number or null
  recommendation: string;
  survived: boolean;
}

export interface SimulationState {
  active: boolean;
  report: SimulationReport | null;
  config: {
    schedule?: ScheduleArchetype;
    lifestyle?: LifestyleArchetype;
  };
  overrides: {
    sleep_hours?: number;
    hrv_score?: number;
    stress_level?: number;
    hydration_level?: number;
    glucose_level?: number;
    active_condition?: string;
  };
}

// =====================================================
// PERFORMANCE & FORECAST (ENGINES 09-21)
// =====================================================

export interface LongitudinalEntry {
  date: string;
  load_metric: number;
  recovery_score: number;
  mindspace_score: number;
  sleep_quality: number;
  compliance: boolean;
  baselines_snapshot: {
    rhr: number;
    hrv: number;
  }
}

export interface AdaptationMetrics {
  consistency_score: number;
  resilience_index: number;
  adaptation_rate: number;
}

export interface PerformanceState {
  macro_phase: "build" | "peak" | "taper" | "off_season" | "base" | "race";
  competition_countdown: number | null;
  target_event: {
    name: string;
    date: string;
    priority: 'A' | 'B' | 'C';
    start_date: string;
  } | null;
  sport_profile?: string;
  acwr_current?: number;
  taper_checklist?: {
    task: string;
    completed: boolean;
    category: "sleep" | "fuel" | "gear" | "mind";
  }[];
  history?: LongitudinalEntry[];
  adaptation_stats?: AdaptationMetrics;
  view_mode?: 'competition' | 'adaptation';
  labs_output?: PerformanceLabsOutput;
  labs?: {
    lactate?: {
      clearance_50pct_minutes: number;
      peak: number;
      date: string;
    }[];
    pattern_discovery?: {
      active_patterns: any[];
    };
  }
}

export interface LearningState {
  tags: string[];
  insights: string[];
}

export interface CommunicationState {
  tone: "stoic" | "hyped" | "analytical" | "empathetic";
  last_message?: string;
}

export interface OrchestratorState {
  readiness_summary: string;
  explanation: string;
  risk_signals: string[];
  recommended_actions: string[];
  active_command: ActiveCommand | null; // NEW: The unified voice
  last_sync: number;
  is_thinking: boolean;
}

// =====================================================
// ELITE MENTAL PERFORMANCE TYPES (MindSpace V3)
// =====================================================

export interface MentalStateVector {
  stress: number;
  mood: number;
  cognitive_load: number;
  autonomic_balance: number;
  arousal: number;
  emotional_valence: number;
  attentional_stability: number;
  resilience_state: "rising" | "stable" | "declining";
  resilience_velocity: number;
  last_test_type: string;
  last_test_grade: "S" | "A" | "B" | "C" | "F";
  last_test_delta: number;
  journal_confidence: number;
  last_journal_sentiment: "Positive" | "Negative" | "Neutral";
  state_age_minutes: number;
  trend_direction: "improving" | "stable" | "declining";
}

export interface CognitiveTrajectory {
  metric: "focus_density" | "reaction_time" | "impulse_control" | "memory_span";
  scores_7d: Array<{
    score: number;
    timestamp: string;
    grade: "S" | "A" | "B" | "C" | "F";
  }>;
  trend: {
    direction: "rising" | "stable" | "declining";
    velocity: number;
    acceleration: number;
    volatility: number;
  };
  predictions: {
    breakdown_risk: number;
    breakdown_date_prediction: string | null;
    confidence: number;
  };
  alerts: string[];
}

export interface PsychologicalFlexibility {
  acceptance_level: number;
  cognitive_defusion: number;
  values_alignment: number;
  present_moment: number;
  committed_action: number;
}

export interface StateDiagnosis {
  primary_state: "overdrive" | "collapse" | "overload" | "optimal";
  confidence: number;
  root_cause: string;
  urgency: "low" | "medium" | "high" | "critical";
}

export interface JournalAnalysisV2 {
  sentiment: "Positive" | "Negative" | "Neutral";
  psychological_flexibility: PsychologicalFlexibility;
  risk_signals: {
    catastrophizing: number;
    avoidance: number;
    rumination: number;
    isolation: number;
    perfectionism: number;
  };
  resilience_markers: {
    self_compassion: number;
    reframing: number;
    growth_mindset: number;
    perspective_taking: number;
    agency: number;
  };
  sentiment_evolution: {
    start_sentiment: number;
    end_sentiment: number;
    trajectory: "improving" | "declining" | "flat";
  };
  analysis_confidence: number;
}

// =====================================================
// GLOBAL STATE ROOT
// =====================================================
export interface GlobalState {
  user_profile: UserProfile;
  sleep: SleepState;
  recovery: RecoveryState;
  fuel: FuelState;
  mindspace: MindspaceState;
  physical_load: PhysicalLoadState;
  timeline: TimelineState;
  environment: EnvironmentState;
  medical: MedicalState;
  performance: PerformanceState;
  simulation: SimulationState;
  learning: LearningState;
  communication: CommunicationState;
  orchestrator: OrchestratorState;
  active_tab: string;
  last_sentient_output?: SentientOutput;
  notifications: any[]; // Using any for now to avoid circular deps
  ui_config: {
    show_mach_scores: boolean;
    expert_mode: boolean;
    demo_mode: boolean;
    dashboard_hero?: string;
  };
}

export type AnalysisPhase = 'idle' | 'analyzing_structure' | 'selecting_group' | 'extracting_sessions';
