/**
 * CONTROLLED TEST SCENARIOS
 * 
 * Instead of random meaningless data, we now have:
 * - Named scenarios that represent real athlete states
 * - Logically connected data (low HRV = low recovery = high stress)
 * - Easy to switch scenarios for testing different app behaviors
 */

import { LongitudinalEntry, AdaptationMetrics } from '../types';

// =============================================================================
// TEST SCENARIOS - Meaningful, Connected Data
// =============================================================================

export type TestScenario =
  | 'well_rested_athlete'
  | 'overreached_state'
  | 'pre_competition'
  | 'building_fitness'
  | 'recovering_from_illness';

export interface ScenarioConfig {
  name: string;
  description: string;
  // Baseline vitals
  hrv: number;
  rhr: number;
  sleep_hours: number;
  sleep_quality: number;
  body_temperature: number; // NEW: Added body temp
  // Energy & load
  fuel_score: number;
  recovery_score: number;
  stress_level: number; // 1-10
  // Training state
  acwr: number;
  acute_load: number;
  chronic_load: number;
  // Context
  days_to_event?: number;
  is_sick?: boolean;
}

export const TEST_SCENARIOS: Record<TestScenario, ScenarioConfig> = {
  well_rested_athlete: {
    name: 'Well-Rested Athlete',
    description: 'Optimal state - good sleep, recovered, ready for high intensity',
    hrv: 65,
    rhr: 52,
    sleep_hours: 8.2,
    sleep_quality: 88,
    body_temperature: 36.5,
    fuel_score: 85,
    recovery_score: 92,
    stress_level: 2,
    acwr: 0.95,
    acute_load: 450,
    chronic_load: 475,
  },

  overreached_state: {
    name: 'Overreached State',
    description: 'Pushed too hard - low HRV, poor sleep, high fatigue',
    hrv: 32,
    rhr: 68,
    sleep_hours: 5.5,
    sleep_quality: 55,
    body_temperature: 36.9, // Slightly elevated = inflammation
    fuel_score: 40,
    recovery_score: 35,
    stress_level: 8,
    acwr: 1.45, // Danger zone
    acute_load: 680,
    chronic_load: 470,
  },

  pre_competition: {
    name: 'Pre-Competition (3 Days Out)',
    description: 'Tapering, somewhat nervous, moderate load',
    hrv: 55,
    rhr: 56,
    sleep_hours: 7.0,
    sleep_quality: 75,
    body_temperature: 36.6,
    fuel_score: 90, // Carb loading
    recovery_score: 78,
    stress_level: 5, // Pre-event nerves
    acwr: 0.75, // Tapering
    acute_load: 280,
    chronic_load: 375,
    days_to_event: 3,
  },

  building_fitness: {
    name: 'Building Fitness',
    description: 'Progressive overload phase - moderate fatigue, adapting',
    hrv: 48,
    rhr: 58,
    sleep_hours: 7.5,
    sleep_quality: 72,
    body_temperature: 36.6,
    fuel_score: 70,
    recovery_score: 65,
    stress_level: 4,
    acwr: 1.15, // Optimal training stress
    acute_load: 520,
    chronic_load: 450,
  },

  recovering_from_illness: {
    name: 'Recovering from Illness',
    description: 'Was sick recently, immune system still stressed',
    hrv: 38,
    rhr: 65,
    sleep_hours: 9.0, // Body craving sleep
    sleep_quality: 65,
    body_temperature: 37.2, // Slightly elevated
    fuel_score: 50,
    recovery_score: 45,
    stress_level: 6,
    acwr: 0.4, // Minimal training
    acute_load: 120,
    chronic_load: 300,
    is_sick: true,
  },
};

// =============================================================================
// ACTIVE SCENARIO SELECTOR
// =============================================================================

// Change this to test different states!
export let ACTIVE_SCENARIO: TestScenario = 'well_rested_athlete';

export const setActiveScenario = (scenario: TestScenario) => {
  ACTIVE_SCENARIO = scenario;
};

export const getActiveScenarioConfig = (): ScenarioConfig => {
  return TEST_SCENARIOS[ACTIVE_SCENARIO];
};

// =============================================================================
// GENERATE HISTORY FROM SCENARIO (Logical, Connected)
// =============================================================================

export const generateMockHistory = (): LongitudinalEntry[] => {
  const scenario = getActiveScenarioConfig();
  const history: LongitudinalEntry[] = [];
  const today = new Date();

  // Generate 90 days of history that LEADS TO current scenario
  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Progress factor: 0 = oldest, 1 = today
    const progress = (90 - i) / 90;

    // Simulate trajectory toward current state
    let load: number;
    let recovery: number;
    let hrv: number;
    let rhr: number;

    if (ACTIVE_SCENARIO === 'overreached_state') {
      // Overtraining trajectory: load increasing, recovery dropping
      load = 300 + progress * 400;
      recovery = 85 - progress * 50;
      hrv = 60 - progress * 28;
      rhr = 52 + progress * 16;
    } else if (ACTIVE_SCENARIO === 'well_rested_athlete') {
      // Healthy adaptation: stable load, good recovery
      load = 400 + Math.sin(progress * Math.PI * 6) * 100; // Wave pattern
      recovery = 75 + progress * 15;
      hrv = 50 + progress * 15;
      rhr = 58 - progress * 6;
    } else if (ACTIVE_SCENARIO === 'pre_competition') {
      // Taper: load dropping in final 2 weeks
      const taperStart = 0.8;
      if (progress > taperStart) {
        const taperProgress = (progress - taperStart) / (1 - taperStart);
        load = 450 - taperProgress * 200;
      } else {
        load = 350 + progress * 150;
      }
      recovery = 65 + progress * 15;
      hrv = 48 + progress * 8;
      rhr = 58 - progress * 2;
    } else {
      // Default: building fitness
      load = 350 + progress * 200;
      recovery = 70 + Math.sin(progress * Math.PI * 4) * 10;
      hrv = 45 + progress * 5;
      rhr = 60 - progress * 3;
    }

    // Add small daily noise (real data isn't perfectly smooth)
    const noise = 0.05;
    load *= (1 + (Math.random() - 0.5) * noise);
    recovery *= (1 + (Math.random() - 0.5) * noise);

    history.push({
      date: date.toISOString().split('T')[0],
      load_metric: Math.round(Math.max(100, load)),
      recovery_score: Math.round(Math.min(100, Math.max(20, recovery))),
      mindspace_score: Math.round(recovery * 0.8 + Math.random() * 20),
      sleep_quality: Math.round(scenario.sleep_quality + (Math.random() - 0.5) * 15),
      compliance: Math.random() > 0.1, // 90% compliance
      baselines_snapshot: {
        rhr: Math.round(rhr),
        hrv: Math.round(hrv)
      }
    });
  }
  return history;
};

// =============================================================================
// CALCULATE ADAPTATION METRICS
// =============================================================================

export const calculateAdaptationMetrics = (history: LongitudinalEntry[]): AdaptationMetrics => {
  if (history.length === 0) return { consistency_score: 0, resilience_index: 0, adaptation_rate: 0 };

  const complianceCount = history.filter(h => h.compliance).length;
  const consistency_score = Math.round((complianceCount / history.length) * 100);

  // Resilience: Average recovery during high load days
  const highLoadDays = history.filter(h => h.load_metric > 500);
  const avgRecoveryUnderLoad = highLoadDays.length > 0
    ? highLoadDays.reduce((a, b) => a + b.recovery_score, 0) / highLoadDays.length
    : 80;
  const resilience_index = parseFloat((avgRecoveryUnderLoad / 100).toFixed(2));

  // Adaptation: RHR change from start to end
  const startRHR = history[0]?.baselines_snapshot?.rhr || 60;
  const endRHR = history[history.length - 1]?.baselines_snapshot?.rhr || 55;
  const weeksOfData = history.length / 7;
  const adaptation_rate = parseFloat(((startRHR - endRHR) / weeksOfData).toFixed(2));

  return { consistency_score, resilience_index, adaptation_rate };
};

// =============================================================================
// SCENARIO-AWARE STATE GETTER (For components to use)
// =============================================================================

export const getScenarioBasedState = () => {
  const config = getActiveScenarioConfig();
  return {
    sleep: {
      hrv: config.hrv,
      resting_hr: config.rhr,
      duration: config.sleep_hours,
      efficiency: config.sleep_quality,
      sleep_quality_score: config.sleep_quality,
      sleep_debt: config.sleep_hours < 7 ? (7 - config.sleep_hours) : 0,
    },
    fuel: {
      fuel_score: config.fuel_score,
      fuel_tank_level: config.fuel_score,
      hydration_liters: config.fuel_score > 70 ? 2.5 : 1.5,
    },
    recovery: {
      recovery_score: config.recovery_score,
      body_temperature: config.body_temperature,
    },
    physical_load: {
      acwr: config.acwr,
      acute_load: config.acute_load,
      chronic_load: config.chronic_load,
    },
    mindspace: {
      stress: config.stress_level,
    },
    performance: {
      days_to_event: config.days_to_event,
    }
  };
};