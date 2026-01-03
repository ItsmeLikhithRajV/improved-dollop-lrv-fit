/**
 * Sentient OS - Research-Backed Types Index
 * 
 * Central export for all scientific types and constants.
 * Each module is backed by peer-reviewed research.
 */

// ============================================================================
// HRV (Heart Rate Variability)
// ============================================================================
export * from './hrv';

// ============================================================================
// SLEEP ARCHITECTURE
// ============================================================================
export * from './sleep-architecture';

// ============================================================================
// LOAD MANAGEMENT (ACWR)
// ============================================================================
export * from './load-management';

// ============================================================================
// CIRCADIAN RHYTHMS
// ============================================================================
export * from './circadian';

// ============================================================================
// BIOMARKERS
// ============================================================================
export * from './biomarkers';

// ============================================================================
// FUEL & NUTRITION
// ============================================================================
export * from './fuel';

// ============================================================================
// RECOVERY MATRIX
// ============================================================================
export * from './recovery-matrix';

// ============================================================================
// BREATHWORK
// ============================================================================
export * from './breathwork';

// ============================================================================
// BLUEPRINT (Bryan Johnson Protocol)
// ============================================================================
export * from './blueprint';

// ============================================================================
// LONGEVITY (Peter Attia / General)
// ============================================================================
export * from './longevity';

// ============================================================================
// QUICK REFERENCE: RESEARCH-BACKED THRESHOLDS
// ============================================================================

export const RESEARCH_THRESHOLDS = {
    // HRV
    hrv: {
        elite_rmssd_range: { low: 35, high: 107 },  // ms
        elite_sdnn_range: { low: 50, high: 100 },    // ms
        good_deviation: 0.5,  // CV from baseline
        concerning_deviation: -1.0
    },

    // ACWR (Gabbett)
    acwr: {
        sweet_spot: { low: 0.8, high: 1.3 },
        danger_zone: 1.5,
        injury_risk_multiplier: {
            optimal: 0.8,
            moderate: 1.5,
            high: 2.2,
            very_high: 4.0
        }
    },

    // Sleep
    sleep: {
        target_duration_hours: 8,
        target_deep_percentage: 20,
        target_rem_percentage: 22,
        debt_threshold_performance: 5,  // hours
        debt_threshold_injury: 10
    },

    // Protein
    protein: {
        leucine_threshold_grams: 2.5,
        per_meal_grams_per_kg: 0.25,
        daily_grams_per_kg: { min: 1.4, max: 2.0 }
    },

    // Circadian
    circadian: {
        performance_variation: 0.26,  // 26% throughout day
        peak_physical_time: { start: 16, end: 19 },  // 4-7 PM
        morning_light_minutes: { clear: 10, overcast: 20 }
    },

    // Sauna
    sauna: {
        temperature_c: { min: 80, optimal: 100 },
        duration_minutes: { min: 15, optimal: 20 },
        gh_increase_single_session: 2,  // x baseline
        gh_increase_double_session: 5
    },

    // Cold
    cold: {
        temperature_c: { min: 10, optimal: 12, max: 15 },
        duration_minutes: { min: 1, max: 5 },
        dopamine_increase: 2.5,  // 250%
        norepinephrine_increase: 2.0  // 200%
    },

    // Blueprint schedule
    blueprint: {
        bedtime: '20:30',
        wake_time: '05:00',
        eating_window_end: '11:00',
        daily_calories: 2250
    }
} as const;

// ============================================================================
// TYPE GUARDS
// ============================================================================

import { HRVZone } from './hrv';
import { ACWRZone } from './load-management';
import { SleepDebt } from './sleep-architecture';

export const isOptimalHRVZone = (zone: HRVZone): boolean =>
    zone === 'optimal' || zone === 'good';

export const isOptimalACWR = (acwr: number): boolean =>
    acwr >= 0.8 && acwr <= 1.3;

export const isDangerZoneACWR = (acwr: number): boolean =>
    acwr > 1.5;

export const hasSignificantSleepDebt = (debt: SleepDebt): boolean =>
    debt.debt_7d >= debt.chronic_debt_threshold;

export const isRecovered = (recoveryScore: number): boolean =>
    recoveryScore >= 70;
