
import type { GlobalState, SentientOutput, Session, BodyZone, ActiveCommand, FuelState, MindspaceState, RecoveryState } from '../../types';
import { RedDayEngine } from '../performance/redDayEngine';
import { FuelEngine } from '../../features/fuel/logic/fuelEngine';
import { RecoveryEngine } from '../recovery/engines/recoveryEngine';
import { MindEngine } from '../mental/engines/mindEngine';
import { OrchestratorV7, ActionCandidate } from './orchestratorV7';
import { evaluateFuelAction, FuelAction } from '../nutritionist/FuelActionEngine';

// Extended ActionCandidate with food suggestions
interface ExtendedActionCandidate extends ActionCandidate {
  food_suggestions?: FuelAction['suggestions'];
  timing_window?: FuelAction['timing_window'];
  context?: string;
}

export class SentientLocalOrchestrator {
  state: GlobalState;
  private butterflyOverrides: {
    fuel: Partial<FuelState>;
    mindspace: Partial<MindspaceState>;
    recovery: Partial<RecoveryState>;
  } = { fuel: {}, mindspace: {}, recovery: {} };

  constructor(state: GlobalState) {
    this.state = JSON.parse(JSON.stringify(state));
  }

  public runAll(): SentientOutput {
    this.normalizeTimeline();

    // 1. DOMAIN PENALTY EXTRACTION (System 1 Experts)
    const recoveryRec = RecoveryEngine.evaluate(this.state);

    // Recovery Penalty Calculation
    const recoveryPenalty = 100 - recoveryRec.recovery_score;

    // OLD Fuel Engine (for compatibility)
    const fuelEval = FuelEngine.evaluate(
      this.state.fuel,
      this.state.user_profile,
      this.state.medical,
      this.state.timeline.sessions,
      this.state.physical_load.acwr,
      this.state.mindspace
    );

    // NEW: FuelActionEngine for specific recommendations
    const fuelAction = evaluateFuelAction(this.state);
    const fuelPenalty = fuelAction.urgency_score || fuelEval.penalty;

    const mindScore = Math.round(100 - (this.state.mindspace.stress * 10));
    const mindPenalty = 100 - mindScore;

    const acwr = this.state.physical_load.acwr;
    const perfPenalty = acwr > 1.5 ? 70 : acwr > 1.3 ? 40 : 0;

    // 2. V7 DYNAMIC WEIGHTING
    const weights = OrchestratorV7.calculateDynamicWeights({
      recovery: recoveryPenalty,
      fuel: fuelPenalty,
      mindspace: mindPenalty,
      performance: perfPenalty
    });

    // 3. READINESS COMPOSITE (V7 Weighted Formula)
    const compositeReadiness = Math.round(
      (recoveryRec.recovery_score * weights.recovery) +
      (fuelEval.score * weights.fuel) +
      (mindScore * weights.mindspace) +
      ((100 - perfPenalty) * weights.performance)
    );

    // 4. ACTION CANDIDATE POOL (Ranking by Urgency x Enablement)
    const candidates: ExtendedActionCandidate[] = [];

    // Recovery Candidate
    if (recoveryPenalty > 30) {
      candidates.push({
        id: 'v7_recovery',
        engine: 'recovery',
        name: 'System Restoration',
        description: recoveryRec.actions[0]?.label || 'Recovery Protocol',
        urgency_score: recoveryPenalty,
        enablement_score: OrchestratorV7.getEnablementScore('recovery'),
        duration_minutes: 30,
        rationale: 'Autonomic or tissue stress detected exceeding adaptive limits.',
        impact_if_done: 'Stable HRV and reduced injury risk.',
        impact_if_skipped: 'Systemic overreach and tissue failure risk.'
      });
    }

    // NEW: Fuel Candidate with specific food suggestions
    if (fuelAction.urgency !== 'none' && fuelAction.urgency_score > 20) {
      const topSuggestion = fuelAction.suggestions[0];
      candidates.push({
        id: 'v7_fuel',
        engine: 'fuel',
        name: this.getFuelActionName(fuelAction),
        description: fuelAction.headline,
        urgency_score: fuelAction.urgency_score,
        enablement_score: OrchestratorV7.getEnablementScore('fuel'),
        duration_minutes: topSuggestion?.prep_time === 'cook' ? 20 : 5,
        rationale: fuelAction.subtext + (fuelAction.timing_window ? ` (${fuelAction.timing_window.name})` : ''),
        impact_if_done: `Cover ${fuelAction.primary_deficit.amount_g}g ${fuelAction.primary_deficit.macro} deficit`,
        impact_if_skipped: 'Continued macro deficit, suboptimal recovery/performance',
        food_suggestions: fuelAction.suggestions,
        timing_window: fuelAction.timing_window,
        context: fuelAction.context
      });
    }

    // MindSpace Candidate
    if (mindPenalty > 30) {
      candidates.push({
        id: 'v7_mind',
        engine: 'mindspace',
        name: 'Neural Regulation',
        description: 'Vagal Reset Protocol',
        urgency_score: mindPenalty,
        enablement_score: OrchestratorV7.getEnablementScore('mindspace'),
        duration_minutes: 5,
        rationale: 'High stress or mood crash impairing motor control.',
        impact_if_done: 'Improved reaction time and decision making.',
        impact_if_skipped: 'Form breakdown and sympathetic burnout.'
      });
    }

    // 5. RANK AND SELECT ACTIVE COMMAND (V7 Priority Math)
    candidates.sort((a, b) => {
      const scoreA = OrchestratorV7.calculatePriorityScore(a.urgency_score, a.enablement_score);
      const scoreB = OrchestratorV7.calculatePriorityScore(b.urgency_score, b.enablement_score);
      return scoreB - scoreA;
    });

    const topCandidate = candidates[0];
    const redDaySignals = this.detectRedDaySignals(recoveryRec, fuelEval);
    const isRedDay = redDaySignals.length > 0 || recoveryPenalty > 70;

    // 6. CAUSAL RIPPLES (Causal Logic)
    this.applyCausalRipples(isRedDay, redDaySignals, recoveryRec, fuelEval);

    // 7. TIMELINE ADAPTATION
    const timelineResult = this.adaptTimelineForLongevity(compositeReadiness, isRedDay, redDaySignals);

    const output: SentientOutput = {
      tags: isRedDay ? ["RED_DAY", "RESTORE"] : ["OPTIMAL"],
      commanderDecision: {
        mode: topCandidate?.name.toUpperCase() || 'OPERATIONAL',
        summary: `Composite Readiness: ${compositeReadiness}% via V7 Orchestration.`,
        urgent: isRedDay,
        reason: topCandidate?.rationale || 'Systems nominal.',
        action: topCandidate?.description || 'Execute as planned.',
        risk_signals: redDaySignals,
        acwr: acwr
      },
      activeCommand: topCandidate ? {
        action: {
          id: topCandidate.id,
          name: topCandidate.name,
          description: topCandidate.description,
          instructions: `Execute ${topCandidate.name} protocol. Duration: ${topCandidate.duration_minutes}m.`,
          duration_minutes: topCandidate.duration_minutes
        },
        rationale: {
          reason: topCandidate.rationale,
          metric: topCandidate.engine.toUpperCase(),
          impact_if_done: topCandidate.impact_if_done,
          impact_if_skipped: topCandidate.impact_if_skipped
        },
        timing: { start_now: true, deadline_minutes: 60, suggested_completion_time: 'ASAP' },
        status: 'active',
        progress: 0
      } : null,
      timeline: {
        adjustments: timelineResult.adjustments,
        applied_timeline: timelineResult.appliedTimeline
      },
      readinessScore: compositeReadiness,
      recoveryScore: recoveryRec.recovery_score,
      fuelState: {
        fuel_score: fuelEval.score,
        viewModel: fuelEval.viewModel
      },
      sessionAdjustments: timelineResult.adjustments,
      sleepPlan: {
        recommended_bedtime: this.calculateLongevityBedtime(isRedDay, recoveryRec),
        hygiene_action: isRedDay ? "90 min Warm Shower -> 18°C Environment" : null
      },
      environmentFlags: this.evaluateEnvironmentFlags(),
      injuryRisks: redDaySignals,
      supplementPlan: this.supplementPlanFromMedical(),
      explanations: [
        `Readiness ${compositeReadiness}% (V7 Weighting: R:${Math.round(weights.recovery * 100)} F:${Math.round(weights.fuel * 100)} M:${Math.round(weights.mindspace * 100)})`,
        topCandidate ? `Top Priority: ${topCandidate.name} (Urgency: ${topCandidate.urgency_score})` : "All systems balanced."
      ],
      mindspaceReadiness: {
        score: mindScore,
        mood: this.state.mindspace.mood,
        stress: this.state.mindspace.stress
      },
      butterflyEffects: this.butterflyOverrides
    };

    return output;
  }

  // --- LOGIC HELPERS ---

  private detectRedDaySignals(rec: any, fuel: any): string[] {
    const signals: string[] = [];
    const baselineHRV = this.state.user_profile.baselines.hrv_baseline;
    const currentHRV = this.state.sleep.hrv;
    if (currentHRV / baselineHRV < 0.75) signals.push('HRV_CRITICAL');
    if (this.state.physical_load.acwr > 1.8) signals.push('ACWR_OVERLOAD');
    if (rec.sleep_architecture.sleep_debt_hours_cumulative > 2) signals.push('SLEEP_DEBT');
    if (this.state.mindspace.stress > 8) signals.push('CNS_DRAG');
    return signals;
  }

  private applyCausalRipples(isRedDay: boolean, signals: string[], rec: any, fuel: any) {
    if (isRedDay) {
      this.butterflyOverrides.mindspace.suggested_protocol = {
        id: 'box_breathing',
        title: 'Vagal Reset',
        reason: 'Systemic Overload',
        priority: 'urgent'
      };
      if (this.state.mindspace.stress > 7) {
        this.butterflyOverrides.fuel.supplements = this.state.fuel.supplements.map(s =>
          s.name.includes('Caffeine') ? { ...s, taken: false, reason: 'Stress Gating' } : s
        );
      }
    }

    const baselineHRV = this.state.user_profile.baselines.hrv_baseline;
    if (this.state.sleep.hrv < baselineHRV * 0.85) {
      this.butterflyOverrides.fuel.active_protocol = {
        ...fuel.activeProtocol,
        name: "Oxidative Stress Buffer",
        description: "Increasing antioxidant co-factors due to HRV suppression.",
        macronutrient_focus: { ...fuel.activeProtocol?.macronutrient_focus, carbs_g: (fuel.activeProtocol?.macronutrient_focus?.carbs_g || 40) + 10 },
        supplements: [...(fuel.activeProtocol?.supplements || []), "Curcumin", "Vitamin C"],
        color_theme: 'purple',
        timing_instruction: 'With next meal'
      };
    }
  }

  private adaptTimelineForLongevity(readiness: number, isRedDay: boolean, signals: string[]) {
    const adjustments: string[] = [];
    const sessions = this.state.timeline.sessions.map(s => {
      if (!s.completed && isRedDay && (s.intensity === 'high' || s.intensity === 'medium')) {
        s.intensity = 'low';
        s.mutation_source = 'recovery';
        s.mutation_reason = 'V7 Red Day Longevity Override';
        adjustments.push(`V7 OVERRIDE: '${s.title}' -> Zone 1`);
      }
      if (!s.completed && readiness < 60 && s.intensity === 'high') {
        adjustments.push(`READINESS GATE: CNS Prep req for '${s.title}'`);
      }
      return s;
    });
    return { appliedTimeline: sessions, adjustments };
  }

  private calculateLongevityBedtime(isRedDay: boolean, rec: any) {
    const wake = this.state.sleep.wake_time || "07:00";
    const [h, m] = wake.split(':').map(Number);
    const need = isRedDay ? 10 : 8.5;
    let bh = h - need;
    if (bh < 0) bh += 24;
    return `${String(Math.floor(bh)).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  private normalizeTimeline() {
    const sessions = this.state.timeline?.sessions || [];
    sessions.forEach((s: any) => {
      if (!s.sequence_block && s.time_of_day) {
        const [h] = s.time_of_day.split(':').map(Number);
        if (h < 10) s.sequence_block = 'morning';
        else if (h < 14) s.sequence_block = 'midday';
        else if (h < 18) s.sequence_block = 'afternoon';
        else s.sequence_block = 'evening';
      } else if (!s.sequence_block) {
        s.sequence_block = 'midday';
      }
    });
  }

  private getFuelActionName(fuelAction: FuelAction): string {
    const contextNames: Record<string, string> = {
      'morning_start': 'Morning Fuel',
      'pre_workout': 'Pre-Workout Fuel',
      'post_workout': 'Recovery Nutrition',
      'afternoon': 'Fuel Catch-up',
      'evening_catchup': 'Evening Catch-up',
      'before_bed': 'Light Fuel',
      'on_track': 'Fuel Optimal'
    };
    const categoryNames: Record<string, string> = {
      'high_protein': 'Protein Priority',
      'fast_carbs': 'Quick Carbs',
      'complex_carbs': 'Sustained Energy',
      'recovery_shake': 'Recovery Shake',
      'balanced': 'Balanced Meal',
      'light_snack': 'Light Snack'
    };
    return categoryNames[fuelAction.category] || contextNames[fuelAction.context] || 'Fuel Action';
  }

  private evaluateEnvironmentFlags() {
    const flags: string[] = [];
    if ((this.state.environment?.AQI ?? 0) > 150) flags.push('env_aqi_poor');
    if (this.state.environment?.travel_status === 'traveling') flags.push('travel_fatigue');
    return flags;
  }

  private supplementPlanFromMedical() {
    const med = this.state.medical;
    const out: any[] = [];
    if (med && med.ferritin && med.ferritin < 30) out.push({ name: 'iron_foods', reason: 'low_ferritin' });
    return out;
  }
}
