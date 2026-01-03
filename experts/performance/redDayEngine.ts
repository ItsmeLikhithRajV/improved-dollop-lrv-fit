
import { GlobalState, UserProfile } from '../../types';

export interface RedDaySignal {
  id: string;   // e.g. 'HRV_DEPRESSION'
  label: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  rationale: string;
}

export interface RedDayAssessment {
  isRedDay: boolean;
  signals: RedDaySignal[];
  recommendedLoadMultiplier: number; // 0.4–0.6 on Red Day; 1.0 otherwise
  narrativeSummary: string;          // 1–2 sentences
  actionPlan: string[];              // Specific interventions
}

export class RedDayEngine {

  /**
   * Main Assessment Loop
   * Checks for convergence of 3+ physiological failure signals.
   */
  static assess(state: GlobalState, profile: UserProfile): RedDayAssessment {
    const signals: RedDaySignal[] = [];

    // 1. HRV Depression (<80% baseline)
    const hrvSignal = this.detectHRVDepression(state, profile);
    if (hrvSignal) signals.push(hrvSignal);

    // 2. Sleep Debt (>2h accumulated or <5h acute)
    const sleepSignal = this.detectSleepDebt(state, profile);
    if (sleepSignal) signals.push(sleepSignal);

    // 3. ACWR Overload (>1.5)
    // NOW PERSONALIZED BY LEVEL & ENVIRONMENT (Phase 4)
    const acwrSignal = this.detectACWROverload(state, profile);
    if (acwrSignal) signals.push(acwrSignal);

    // 4. Cortisol / RHR Spike (>8bpm over baseline)
    const rhrSignal = this.detectElevatedRHR(state, profile);
    if (rhrSignal) signals.push(rhrSignal);

    // 5. Musculoskeletal Systemic Pain (2+ Pain Zones)
    const painSignal = this.detectSorenessAccumulation(state);
    if (painSignal) signals.push(painSignal);

    // 6. Psycho-Somatic Convergence (Mood < 4 + High Stress)
    const moodSignal = this.detectMoodStressConvergence(state);
    if (moodSignal) signals.push(moodSignal);

    // 7. Environmental Stress (Phase 4: AQI, Travel)
    const envSignal = this.detectEnvironmentalStress(state);
    if (envSignal) signals.push(envSignal);

    // DETERMINATION LOGIC
    // Red Day = 3+ Signals OR 1 Critical Signal
    // Elite athletes might tolerate 3 mild signals better, but Critical is always Critical.
    const criticalCount = signals.filter(s => s.severity === 'critical').length;
    const isRedDay = signals.length >= 3 || criticalCount >= 1;

    const multiplier = this.computeLoadMultiplier(signals, isRedDay);

    return {
      isRedDay,
      signals,
      recommendedLoadMultiplier: multiplier,
      narrativeSummary: this.buildNarrative(signals, isRedDay),
      actionPlan: this.buildActionPlan(signals, isRedDay)
    };
  }

  // --- SIGNAL DETECTORS ---

  private static detectHRVDepression(state: GlobalState, profile: UserProfile): RedDaySignal | null {
    if (!profile.baselines.hrv_baseline) return null;
    const ratio = state.sleep.hrv / profile.baselines.hrv_baseline;

    if (ratio < 0.70) return { id: 'HRV_CRITICAL', label: 'Autonomic Crash', severity: 'critical', rationale: `HRV is ${Math.round(ratio * 100)}% of baseline. Severe sympathetic dominance.` };
    if (ratio < 0.85) return { id: 'HRV_DEPRESSION', label: 'Low HRV', severity: 'high', rationale: `HRV suppressed (${Math.round(ratio * 100)}% baseline). Recovery capacity limited.` };
    return null;
  }

  private static detectSleepDebt(state: GlobalState, profile: UserProfile): RedDaySignal | null {
    const debt = state.sleep.sleep_debt || 0;
    const duration = state.sleep.duration;

    // Tolerance thresholds (Elites might have tighter or looser bounds depending on philosophy, sticking to standard physiology here)
    if (duration < 5) return { id: 'SLEEP_ACUTE', label: 'Acute Sleep Deprivation', severity: 'critical', rationale: 'Sleep < 5h. Cognitive & Motor failure risk.' };
    if (debt > 2) return { id: 'SLEEP_DEBT', label: 'Accumulated Sleep Debt', severity: 'high', rationale: `Sleep debt > 2h (${debt.toFixed(1)}h). Allostatic load high.` };
    return null;
  }

  private static detectACWROverload(state: GlobalState, profile: UserProfile): RedDaySignal | null {
    const acwr = state.physical_load.acwr;

    // Dynamic Thresholds based on Training Level
    let limit = 1.5;
    let criticalLimit = 1.8;

    if (profile.training_level === 'beginner') { limit = 1.3; criticalLimit = 1.5; }
    if (profile.training_level === 'elite') { limit = 1.6; criticalLimit = 2.0; } // Elites tolerate higher spikes

    // Phase 4: Hypoxic Load Modifier (Altitude lowers the safe ceiling)
    if (state.environment.altitude && state.environment.altitude > 1500) {
      limit -= 0.2; // e.g. 1.5 becomes 1.3
      criticalLimit -= 0.2;
    }

    if (acwr > criticalLimit) return { id: 'ACWR_CRITICAL', label: 'Load Spike', severity: 'critical', rationale: `ACWR ${acwr.toFixed(2)} (Dangerous). Injury risk > 300%.` };
    if (acwr > limit) return { id: 'ACWR_HIGH', label: 'Overreaching', severity: 'high', rationale: `ACWR ${acwr.toFixed(2)}. Exceeds ${profile.training_level} capacity ${state.environment.altitude && state.environment.altitude > 1500 ? '@ Altitude' : ''}.` };
    return null;
  }

  private static detectElevatedRHR(state: GlobalState, profile: UserProfile): RedDaySignal | null {
    const delta = state.sleep.resting_hr - profile.baselines.resting_hr;
    if (delta > 10) return { id: 'RHR_SPIKE', label: 'Metabolic Stress', severity: 'critical', rationale: `RHR +${delta}bpm. Potential infection or extreme fatigue.` };
    if (delta > 6) return { id: 'RHR_ELEVATED', label: 'Elevated RHR', severity: 'moderate', rationale: `RHR +${delta}bpm. Incomplete recovery.` };
    return null;
  }

  private static detectSorenessAccumulation(state: GlobalState): RedDaySignal | null {
    const zones = Object.values(state.recovery.soreness_map);
    const painCount = zones.filter(z => z === 'pain').length;
    const soreCount = zones.filter(z => z === 'sore').length;

    if (painCount >= 2) return { id: 'PAIN_SYSTEMIC', label: 'Systemic Pain', severity: 'high', rationale: 'Multiple zones reporting pain (VAS > 5).' };
    if (soreCount >= 4) return { id: 'DOMS_HIGH', label: 'Heavy DOMS', severity: 'moderate', rationale: 'Widespread soreness limits mechanical efficiency.' };
    return null;
  }

  private static detectMoodStressConvergence(state: GlobalState): RedDaySignal | null {
    if (state.mindspace.mood < 4 && state.mindspace.stress > 7) {
      return { id: 'PSYCH_FAIL', label: 'Psychological Fatigue', severity: 'high', rationale: 'Low Mood + High Stress. CNS burnout risk.' };
    }
    return null;
  }

  // Phase 4: Environmental Stress Detector
  private static detectEnvironmentalStress(state: GlobalState): RedDaySignal | null {
    // Travel Logic
    if (state.environment.travel_status === 'traveling') {
      return { id: 'TRAVEL_FATIGUE', label: 'Travel Strain', severity: 'high', rationale: 'Circadian desynchronization & travel load.' };
    }
    // Air Quality
    if (state.environment.AQI && state.environment.AQI > 150) {
      return { id: 'AQI_TOXIC', label: 'Toxic Air Load', severity: 'high', rationale: `AQI ${state.environment.AQI}. Cardiovascular stress elevated.` };
    }
    if (state.environment.AQI && state.environment.AQI > 100) {
      return { id: 'AQI_WARN', label: 'Respiratory Stress', severity: 'moderate', rationale: `AQI ${state.environment.AQI}. Performance dampening likely.` };
    }
    return null;
  }

  // --- OUTPUT BUILDERS ---

  private static computeLoadMultiplier(signals: RedDaySignal[], isRedDay: boolean): number {
    if (!isRedDay) return 1.0;

    // If critical signals exist, shut it down.
    if (signals.some(s => s.severity === 'critical')) return 0.2; // Active recovery only

    // If just high signals, mitigate.
    return 0.5; // 50% volume reduction
  }

  private static buildNarrative(signals: RedDaySignal[], isRedDay: boolean): string {
    if (!isRedDay) return "Systems nominal. Proceed with planned adaptation.";
    const critical = signals.filter(s => s.severity === 'critical').map(s => s.label);
    const high = signals.filter(s => s.severity === 'high').map(s => s.label);

    const culprits = [...critical, ...high].join(", ");
    return `RED DAY DETECTED. Convergence of ${signals.length} fatigue vectors (${culprits}). Physiological capacity compromised.`;
  }

  private static buildActionPlan(signals: RedDaySignal[], isRedDay: boolean): string[] {
    if (!isRedDay) return [];

    const actions = ["Reduce Training Volume by 50-80%."];

    if (signals.some(s => s.id.includes('HRV'))) actions.push("Prioritize Parasympathetic Reset (Breathing/NSDR).");
    if (signals.some(s => s.id.includes('SLEEP'))) actions.push("Sleep Extension Protocol (+90min).");
    if (signals.some(s => s.id.includes('ACWR'))) actions.push("Zero-Impact Activity Only (Swim/Bike).");
    if (signals.some(s => s.id.includes('PAIN'))) actions.push("Anti-Inflammatory Nutrition Protocol.");
    if (signals.some(s => s.id.includes('TRAVEL'))) actions.push("Hydration + Grounding immediately.");
    if (signals.some(s => s.id.includes('AQI'))) actions.push("Indoor training mandatory (HEPA).");

    return actions;
  }

  // --- LEGACY HELPERS (For compatibility with existing TimelineTab) ---

  static detectRedDay(state: GlobalState, profile: UserProfile): string[] {
    const assessment = this.assess(state, profile);
    return assessment.signals.map(s => `${s.label}: ${s.rationale}`);
  }

  static isRedDay(state: GlobalState, profile: UserProfile): boolean {
    return this.assess(state, profile).isRedDay;
  }
}
