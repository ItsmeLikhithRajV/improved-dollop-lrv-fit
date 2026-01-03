
import {
  GlobalState,
  SentientOutput,
  Session,
  TimelineState,
  EnvironmentState,
  MedicalState,
  SimulationState
} from '../types';
import { Meal, FuelState } from '../features/fuel/types';
import { RecoveryState, BodyZone } from '../features/recovery/types';
import { MindspaceState } from '../features/mindspace/types';
import { PhysicalLoadState } from '../features/physical_load/types';
import { SentientLocalOrchestrator } from '../experts/orchestrator/sentientLocalOrchestrator';
import { PerformanceLabsEngine } from '../features/performance/logic/performanceLabsEngine';

export class SentientSyncLayer {

  public static handleEvent(
    currentState: GlobalState,
    eventType: string,
    payload: any
  ): Partial<GlobalState> {

    // 1. APPLY MUTATION
    const nextState = this.applyImmediateMutations(currentState, eventType, payload);
    const simulatedState = this.applySimulationOverrides(nextState);

    // 2. ORCHESTRATE (THE BRAIN)
    // v8.1: Every event triggers a Causal Ripple check
    const orchestrator = new SentientLocalOrchestrator(simulatedState);
    const sentientOutput = orchestrator.runAll();

    // 3. RUN META ENGINES
    const performanceLabsOutput = PerformanceLabsEngine.evaluate(
      nextState.performance.history || [],
      nextState.user_profile,
      nextState.performance.target_event ? {
        countdown: nextState.performance.competition_countdown || 90,
        phase: nextState.performance.macro_phase
      } : undefined
    );

    sentientOutput.performanceLabs = performanceLabsOutput;

    // 4. MERGE & RETURN
    return this.mergeStateWithInsights(nextState, sentientOutput, eventType);
  }

  private static applyImmediateMutations(state: GlobalState, event: string, payload: any): GlobalState {
    const draft: GlobalState = JSON.parse(JSON.stringify(state));

    switch (event) {
      case 'meal_logged':
        if (payload) {
          draft.fuel.entries = [payload, ...draft.fuel.entries];
          const macros = draft.fuel.entries.reduce((acc, meal) => {
            meal.items.forEach(item => {
              acc.protein += item.macros.protein || 0;
              acc.carbs += item.macros.carbs || 0;
              acc.fat += item.macros.fat || 0;
            });
            return acc;
          }, { protein: 0, carbs: 0, fat: 0, sodium: 0, fluids: 0 });
          draft.fuel.macros_today = macros;
        }
        break;

      case 'session_completed':
        draft.timeline.sessions = draft.timeline.sessions.map(s =>
          s.id === payload.id ? { ...s, completed: true, feedback: payload.feedback } : s
        );
        break;

      case 'stress_updated':
        draft.mindspace.stress = payload;
        break;

      case 'sleep_logged':
        draft.sleep = { ...draft.sleep, ...payload };
        break;

      case 'environment_updated':
        draft.environment = { ...draft.environment, ...payload };
        break;

      case 'travel_status_changed':
        draft.environment.travel_status = payload;
        break;

      case 'performance_mode_updated':
        draft.performance.view_mode = payload;
        break;

      case 'set_target_event':
        draft.performance.target_event = payload;
        break;

      default:
        // Handle other standard mutations (soreness, fatigue, etc.)
        if (event === 'soreness_toggled') {
          const zone = payload.zone as BodyZone;
          const currentLevel = draft.recovery.soreness_map[zone];
          const nextLevel = currentLevel === 'none' ? 'tight' : currentLevel === 'tight' ? 'sore' : currentLevel === 'sore' ? 'pain' : 'none';
          draft.recovery.soreness_map[zone] = nextLevel;
        }
        break;
    }

    return draft;
  }

  private static applySimulationOverrides(state: GlobalState): GlobalState {
    if (!state.simulation.active) return state;
    const sim = state.simulation.overrides;
    const overrides = JSON.parse(JSON.stringify(state));
    if (sim.sleep_hours !== undefined) overrides.sleep.duration = sim.sleep_hours;
    if (sim.hrv_score !== undefined) overrides.sleep.hrv = sim.hrv_score;
    if (sim.stress_level !== undefined) overrides.mindspace.stress = sim.stress_level;
    return overrides;
  }

  private static mergeStateWithInsights(
    nextState: GlobalState,
    output: SentientOutput,
    triggerEvent: string
  ): Partial<GlobalState> {

    const orchestratorUpdate = {
      readiness_summary: output.commanderDecision.summary || output.commanderDecision.mode || "Ready",
      explanation: output.explanations[0] || "Systems nominal.",
      risk_signals: output.commanderDecision.risk_signals || [],
      recommended_actions: [
        output.commanderDecision.action,
        ...output.timeline.adjustments.map((a: any) => typeof a === 'string' ? a : `Adjust: ${a.sessionId}`)
      ].filter(Boolean),
      last_sync: Date.now(),
      is_thinking: false,
      active_command: output.activeCommand || null
    };

    // Apply Causal Ripples (Butterfly Overrides) from SLO
    const fuelUpdate = {
      ...nextState.fuel,
      ...(output.butterflyEffects?.fuel || {}),
      fuel_score: output.fuelState.fuel_score || nextState.fuel.fuel_score,
      viewModel: output.fuelState.viewModel
    };

    const recoveryUpdate = {
      ...nextState.recovery,
      ...(output.butterflyEffects?.recovery || {}),
      recovery_score: output.recoveryScore
    };

    const mindUpdate = {
      ...nextState.mindspace,
      ...(output.butterflyEffects?.mindspace || {}),
      readiness_score: output.readinessScore
    };

    return {
      fuel: fuelUpdate,
      recovery: recoveryUpdate,
      mindspace: mindUpdate,
      timeline: {
        ...nextState.timeline,
        sessions: output.timeline.applied_timeline,
        adjustments: output.timeline.adjustments
      },
      performance: {
        ...nextState.performance,
        labs_output: output.performanceLabs
      },
      orchestrator: orchestratorUpdate,
      last_sentient_output: output,
      user_profile: nextState.user_profile,
      sleep: nextState.sleep,
      medical: nextState.medical,
      environment: nextState.environment
    };
  }
}
