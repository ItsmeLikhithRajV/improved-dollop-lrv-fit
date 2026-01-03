
import { ProgressBarVM, UserProfile } from "../../types";
import { PCOSSubProfile, T1DSubProfile } from "../../types";

// =====================================================
// FUEL DOMAIN TYPES
// =====================================================

export type { ProgressBarVM }; // Re-export for convenience

export interface MacroProfile {
  protein: number;
  carbs: number;
  fat: number;
  sodium?: number;
  fluids?: number;
}

export interface MealItem {
  name: string;
  estimated_cal: number;
  macros: MacroProfile;
}

export interface Meal {
  id: string;
  time: string;
  type: string;
  items: MealItem[];
  image?: string;
  ai_extracted?: boolean;
}

export interface Supplement {
  id: string;
  name: string;
  tier: "essential" | "performance" | "experimental";
  taken: boolean;
  dosage?: string;
  reason?: string;
  cost_monthly?: number;
  timing?: string;
}

export interface FuelProtocol {
  name: string;
  description: string;
  color_theme: "red" | "blue" | "green" | "purple";
  timing_instruction: string;
  macronutrient_focus: {
    carbs_g: number;
    protein_g: number;
    sodium_mg: number;
    fluids_ml: number;
  };
  supplements: string[];
  clinical_tag?: string;
  suggested_sources?: {
    carbs: string[];
    protein: string[];
    hydration: string[];
  };
}

export interface FuelProtocolVM {
  name: string;
  description: string;
  themeClass: string;
  clinicalTag: string | null;
  timing: string | null;
  bars: ProgressBarVM[];
  suggestedSources?: {
    carbs: string[];
    protein: string[];
    hydration: string[];
  };
}

export type FuelContextType = 'idle' | 'pre_load' | 'immediate_prime' | 'intra_fuel' | 'post_recovery';

export interface ClinicalAction {
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  immediate_actions?: string[];
  educational_note?: string;
}

// GAP 1: PERIODIZATION
export interface NutritionalPeriodization {
  training_block: 'accumulation' | 'intensification' | 'realization' | 'deload';
  session_type: string;
  intensity_zone: number;
  duration_minutes: number;
  carbs_per_kg_body_weight: number;
  carbs_absolute_grams: number;
  protein_per_kg: number;
  fat_per_kg: number;
  gi_target: 'low' | 'medium' | 'high';
  rationale: string;
}

// GAP 2: BIOAVAILABILITY
export interface NutrientBioavailabilityProfile {
  dietary_pattern: string;
  gut_health_score: number;
  athletic_gut_microbiota_level: number;
  iron_heme_absorption_percent: number;
  iron_nonheme_absorption_percent: number;
  calcium_absorption_percent: number;
  magnesium_absorption_percent: number;
  vitamin_d_absorption_percent: number;
}

// GAP 9: MICROS
export interface MicronutrientStatus {
  name: string;
  current: number;
  target: number;
  unit: string;
  status: 'optimal' | 'low' | 'deficient' | 'excess';
  food_sources: string[];
  action?: string;
}

export interface FuelViewModel {
  status: {
    label: string;
    color: string;
    score: number;
  };
  tank: {
    level: number;
    label: string;
    drainRate: number;
  };
  context: {
    type: FuelContextType;
    message: string;
    nextSessionCountdown?: string;
    suggestedMacros?: { c: number, p: number, f: number, sodium: number };
  };
  hydration: {
    value: number;
    percentage: number;
    label: string;
    colorClass: string;
  };
  protocol: FuelProtocolVM | null;
  veto: {
    active: boolean;
    title: string;
    message: string;
  } | null;
  actionRequired: string | null;

  // NEW: Detailed Sub-Models
  periodization?: NutritionalPeriodization;
  bioavailability?: NutrientBioavailabilityProfile;
  micronutrients?: MicronutrientStatus[];
  genetic_rationale?: string;
}

export interface FuelState {
  entries: Meal[];
  macros_today: MacroProfile;
  hydration_liters: number;
  electrolytes_taken: boolean;
  caffeine_mg: number;
  supplements: Supplement[];
  fuel_score: number;
  fuel_tank_level?: number;
  hours_since_last_meal?: number;
  active_protocol?: FuelProtocol | null;

  // Updated Clinical State
  pcos_profile?: PCOSSubProfile;
  t1d_profile?: T1DSubProfile;
  clinical_state?: {
    condition: 'pcos' | 't1d' | 'none';
    current_status: 'safe' | 'warning' | 'critical';
    actions_required: ClinicalAction[];
    metabolic_insight?: string;
  };

  clinical_veto?: string | null; // Keep for legacy compat
  viewModel?: FuelViewModel;
}
