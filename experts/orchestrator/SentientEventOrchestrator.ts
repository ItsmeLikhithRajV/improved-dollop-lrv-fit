
/**
 * SentientEventOrchestrator.ts
 *
 * PURPOSE
 * -------
 * This file turns SentientOS from a set of separate tabs/engines
 * into one event-driven, causally-linked system.
 *
 * It does three core things:
 * 1) Defines the events that can happen in the app (sessions, fuel, sleep, stress, etc.).
 * 2) Provides a single `processEvent` function that:
 *      - takes the current GlobalState + one event,
 *      - runs all relevant engines in the correct order,
 *      - returns the new GlobalState + explanations.
 * 3) Gives a simple way for the UI (tabs) to send events and
 *    get back a fully updated, “butterfly-effect” day plan.
 */

import { GlobalState } from '../../types';
import { Session } from '../../types';
import { BodyZone, SorenessLevel, Meal } from '../../types';
import { SentientLocalOrchestrator } from "./sentientLocalOrchestrator";
import { PerformanceLabsEngine } from "../performance/performanceLabsEngine";

/* ============================================================
   1. EVENT MODEL
   ------------------------------------------------------------
   These are the “things that happen” in the SentientOS world.
   Extended to cover all existing UI interactions.
   ============================================================ */

export type SentientEvent =
  | {
    type: "SESSION_COMPLETED";
    payload: {
      sessionId: string;
      rpe: number;
      sorenessFeedback?: Record<string, string> | string;
      mood?: string;
      duration?: number;
      fatigue?: string;
    };
  }
  | {
    type: "SESSION_ADDED";
    payload: Session;
  }
  | {
    type: "SESSION_UPDATED";
    payload: { id: string; updates: Partial<Session> };
  }
  | {
    type: "SESSION_DELETED";
    payload: { id: string };
  }
  | {
    type: "MEAL_LOGGED";
    payload: Meal;
  }
  | {
    type: "HYDRATION_UPDATED";
    payload: { liters: number };
  }
  | {
    type: "SUPPLEMENT_TOGGLED";
    payload: { id: string; taken: boolean };
  }
  | {
    type: "WEARABLES_SYNCED";
    payload: {
      hrv: number;
      resting_hr: number;
      sleep_duration: number;
      sleep_efficiency: number;
    };
  }
  | {
    type: "SLEEP_LOGGED";
    payload: Partial<GlobalState['sleep']>;
  }
  | {
    type: "STRESS_UPDATED";
    payload: { stress: number; mood?: number };
  }
  | {
    type: "MOOD_UPDATED";
    payload: number;
  }
  | {
    type: "SORENESS_REPORTED";
    payload: { zones: Record<BodyZone, SorenessLevel> } | { zone: BodyZone };
  }
  | {
    type: "FATIGUE_UPDATED";
    payload: number;
  }
  | {
    type: "COGNITIVE_TEST_COMPLETED";
    payload: { testId: string; result: number };
  }
  | {
    type: "USER_PROFILE_UPDATED";
    payload: Partial<GlobalState['user_profile']>;
  }
  | {
    type: "ENVIRONMENT_UPDATED";
    payload: Partial<GlobalState['environment']>;
  }
  | {
    type: "SIMULATION_UPDATED";
    payload: Partial<GlobalState['simulation']>;
  }
  | {
    type: "TARGET_EVENT_SET";
    payload: any;
  }
  | {
    type: "PERFORMANCE_MODE_UPDATED";
    payload: 'competition' | 'adaptation';
  }
  | {
    type: "INIT_SYNC";
    payload?: any;
  };

/* ============================================================
   2. HIGH-LEVEL PROCESSOR
   ------------------------------------------------------------
   This is the single entry point:
   - Input:   current GlobalState + one SentientEvent
   - Output:  new GlobalState (with ripple effects applied)
   ============================================================ */

export interface SentientProcessResult {
  state: GlobalState;
  explanations: string[];
  debug?: any;
}

export function processEvent(
  prevState: GlobalState,
  event: SentientEvent
): SentientProcessResult {
  // Deep copy to avoid mutating the incoming state directly
  let state: GlobalState = JSON.parse(JSON.stringify(prevState));
  const explanations: string[] = [];

  // ----------------------------------------------------------
  // STEP 1: Apply the raw event to GlobalState (The "Write")
  // ----------------------------------------------------------

  switch (event.type) {
    case "SESSION_COMPLETED": {
      const { sessionId, rpe, duration } = event.payload;
      state.timeline.sessions = state.timeline.sessions.map((s) =>
        s.id === sessionId
          ? {
            ...s,
            completed: true,
            feedback: {
              rpe,
              soreness: (event.payload.sorenessFeedback as any) || s.feedback?.soreness || "none",
              mood: (event.payload.mood as any) || s.feedback?.mood || "neutral",
              fatigue: (event.payload.fatigue as any) || s.feedback?.fatigue || "normal",
              notes: s.feedback?.notes,
            },
          }
          : s
      );

      // Update Acute Load (Simple proxy: Duration * RPE)
      const dur = duration || 60;
      const load = dur * rpe;
      state.physical_load.acute_load = (state.physical_load.acute_load * 6 + load) / 7;

      explanations.push(
        `Session marked complete (RPE ${rpe}, Load +${load}).`
      );
      break;
    }

    case "SESSION_ADDED": {
      const newSession = { ...event.payload, id: event.payload.id || `local-${Date.now()}` };
      const existing = state.timeline.sessions || [];
      const updated = [...existing, newSession].sort((a, b) =>
        (a.time_of_day || "12:00").localeCompare(b.time_of_day || "12:00")
      );
      state.timeline.sessions = updated;
      explanations.push(`New session "${newSession.title}" added to timeline.`);
      break;
    }

    case "SESSION_UPDATED": {
      const { id, updates } = event.payload;
      state.timeline.sessions = state.timeline.sessions.map(s =>
        s.id === id ? { ...s, ...updates } : s
      ).sort((a, b) => (a.time_of_day || "12:00").localeCompare(b.time_of_day || "12:00"));
      explanations.push(`Session updated.`);
      break;
    }

    case "SESSION_DELETED": {
      state.timeline.sessions = state.timeline.sessions.filter(s => s.id !== event.payload.id);
      explanations.push(`Session removed from timeline.`);
      break;
    }

    case "MEAL_LOGGED": {
      // Logic handles both raw payload and structured Meal object
      const meal = event.payload;
      state.fuel.entries = [meal, ...(state.fuel.entries || [])];

      // Update daily macro tally
      const addedMacros = meal.items.reduce((acc, item) => ({
        p: acc.p + item.macros.protein,
        c: acc.c + item.macros.carbs,
        f: acc.f + item.macros.fat
      }), { p: 0, c: 0, f: 0 });

      state.fuel.macros_today.protein += addedMacros.p;
      state.fuel.macros_today.carbs += addedMacros.c;
      state.fuel.macros_today.fat += addedMacros.f;

      explanations.push(
        `Meal logged. +${addedMacros.c}g CHO.`
      );
      break;
    }

    case "HYDRATION_UPDATED": {
      state.fuel.hydration_liters = event.payload.liters;
      explanations.push(
        `Hydration updated to ${event.payload.liters.toFixed(1)}L.`
      );
      break;
    }

    case "SUPPLEMENT_TOGGLED": {
      state.fuel.supplements = state.fuel.supplements.map(s =>
        s.id === event.payload.id ? { ...s, taken: event.payload.taken } : s
      );
      explanations.push("Supplement status updated.");
      break;
    }

    case "WEARABLES_SYNCED": {
      const { hrv, resting_hr, sleep_duration, sleep_efficiency } =
        event.payload;
      state.sleep.hrv = hrv;
      state.sleep.resting_hr = resting_hr;
      state.sleep.duration = sleep_duration;
      state.sleep.efficiency = sleep_efficiency;

      explanations.push(
        `Wearables synced: HRV ${hrv} ms, RHR ${resting_hr} bpm.`
      );
      break;
    }

    case "SLEEP_LOGGED": {
      state.sleep = { ...state.sleep, ...event.payload };
      explanations.push("Manual sleep data updated.");
      break;
    }

    case "STRESS_UPDATED": {
      state.mindspace.stress = event.payload.stress;
      if (typeof event.payload.mood === "number") {
        state.mindspace.mood = event.payload.mood;
      }
      explanations.push(
        `Stress updated to ${event.payload.stress}.`
      );
      break;
    }

    case "MOOD_UPDATED": {
      state.mindspace.mood = event.payload;
      break;
    }

    case "FATIGUE_UPDATED": {
      state.recovery.fatigue_level = event.payload;
      break;
    }

    case "SORENESS_REPORTED": {
      if ('zones' in event.payload) {
        state.recovery.soreness_map = {
          ...state.recovery.soreness_map,
          ...event.payload.zones,
        };
      } else if ('zone' in event.payload) {
        // Toggle Logic
        const z = event.payload.zone;
        const current = state.recovery.soreness_map[z];
        const next = current === 'none' ? 'tight' : current === 'tight' ? 'sore' : current === 'sore' ? 'pain' : 'none';
        state.recovery.soreness_map[z] = next;
      }
      explanations.push(`Soreness map updated.`);
      break;
    }

    case "COGNITIVE_TEST_COMPLETED": {
      const { testId, result } = event.payload;
      if (testId === 'reaction') state.mindspace.cognitive_scores.reaction_time = result;
      if (testId === 'focus') state.mindspace.cognitive_scores.focus_density = result;
      if (testId === 'memory') state.mindspace.cognitive_scores.memory_span = result;
      explanations.push(`Cognitive test (${testId}) recorded.`);
      break;
    }

    case "USER_PROFILE_UPDATED": {
      state.user_profile = { ...state.user_profile, ...event.payload };
      explanations.push("User profile updated.");
      break;
    }

    case "ENVIRONMENT_UPDATED": {
      state.environment = { ...state.environment, ...event.payload };
      break;
    }

    case "SIMULATION_UPDATED": {
      state.simulation = { ...state.simulation, ...event.payload };

      // Apply overrides immediately to the state copy so Orchestrator sees them
      if (state.simulation.active && state.simulation.overrides) {
        const sim = state.simulation.overrides;
        if (sim.sleep_hours !== undefined) state.sleep.duration = sim.sleep_hours;
        if (sim.hrv_score !== undefined) state.sleep.hrv = sim.hrv_score;
        if (sim.stress_level !== undefined) state.mindspace.stress = sim.stress_level;
        if (sim.hydration_level !== undefined) state.fuel.hydration_liters = sim.hydration_level;
      }
      break;
    }

    case "TARGET_EVENT_SET": {
      state.performance.target_event = event.payload;
      state.performance.view_mode = 'competition';
      explanations.push("New target event locked.");
      break;
    }

    case "PERFORMANCE_MODE_UPDATED": {
      state.performance.view_mode = event.payload;
      break;
    }
  }

  // ----------------------------------------------------------
  // STEP 2: Run the "Brain" (Orchestration & Labs)
  // ----------------------------------------------------------

  // A. Run SLO (Short-term readiness & adjustments)
  const brain = new SentientLocalOrchestrator(state);
  const output = brain.runAll();

  // B. Run Performance Labs (Long-term trends)
  const performanceLabsOutput = PerformanceLabsEngine.evaluate(
    state.performance.history || [],
    state.user_profile,
    state.performance.target_event ? {
      countdown: state.performance.competition_countdown || 90,
      phase: state.performance.macro_phase
    } : undefined
  );
  output.performanceLabs = performanceLabsOutput;

  // ----------------------------------------------------------
  // STEP 3: Merge & Return
  // ----------------------------------------------------------

  // Merge orchestrator output into state
  state = {
    ...state,
    // Fuel: Explicit merge to keep ViewModel
    fuel: {
      ...state.fuel,
      fuel_score: output.fuelState.fuelLevel || state.fuel.fuel_score,
      active_protocol: output.fuelState.active_protocol,
      viewModel: output.fuelState.viewModel
    },
    // Recovery
    recovery: {
      ...state.recovery,
      recovery_score: output.recoveryScore
    },
    // Mindspace
    mindspace: {
      ...state.mindspace,
      readiness_score: output.mindspaceReadiness.score
    },
    // Performance
    performance: {
      ...state.performance,
      labs_output: performanceLabsOutput
    },
    // Timeline
    timeline: {
      sessions: output.timeline.applied_timeline,
      adjustments: output.timeline.adjustments,
    },
    // Orchestrator Meta
    orchestrator: {
      ...state.orchestrator,
      readiness_summary: output.commanderDecision.mode || state.orchestrator.readiness_summary,
      explanation: output.commanderDecision.reason || state.orchestrator.explanation,
      risk_signals: output.commanderDecision.risk_signals || [],
      recommended_actions: [
        output.commanderDecision.action,
        ...(output.timeline.adjustments.map(a => typeof a === 'string' ? a : 'Schedule adjusted') || [])
      ].filter(Boolean),
      last_sync: Date.now(),
      is_thinking: false,
    },
    last_sentient_output: output
  };

  // Add orchestrator explanations to our narrative
  if (output.explanations && output.explanations.length > 0) {
    explanations.push(...output.explanations);
  }

  return {
    state,
    explanations,
    debug: {
      event: event.type,
      readinessScore: output.readinessScore,
      recoveryScore: output.recoveryScore,
      fuelScore: output.fuelState.fuel_score,
      acwr: output.commanderDecision.acwr,
    },
  };
}

/* ============================================================
   3. UTILITY: TRIGGER MAPPER
   ------------------------------------------------------------
   Bridges legacy UI string triggers to Typed Events.
   Takes currentState optionally to handle toggle logic.
   ============================================================ */
export const mapTriggerToEvent = (trigger: string, payload: any, currentState?: GlobalState): SentientEvent | null => {
  switch (trigger) {
    case 'session_completed': return { type: "SESSION_COMPLETED", payload: { sessionId: payload.id, rpe: payload.feedback?.rpe || 5, sorenessFeedback: payload.feedback?.soreness, duration: payload.duration } };
    case 'session_added': return { type: "SESSION_ADDED", payload };
    case 'session_updated': return { type: "SESSION_UPDATED", payload: { id: payload.id, updates: payload.updates } };
    case 'session_deleted': return { type: "SESSION_DELETED", payload };

    case 'meal_logged': return { type: "MEAL_LOGGED", payload };
    case 'meal_added': return { type: "MEAL_LOGGED", payload };
    case 'hydration_logged': return { type: "HYDRATION_UPDATED", payload: { liters: payload } };
    case 'supplement_logged': return { type: "SUPPLEMENT_TOGGLED", payload };

    case 'sleep_logged': return { type: "SLEEP_LOGGED", payload };

    case 'stress_updated': return { type: "STRESS_UPDATED", payload: { stress: payload } };
    case 'mood_updated': return { type: "MOOD_UPDATED", payload };
    case 'cognitive_test_completed': return { type: "COGNITIVE_TEST_COMPLETED", payload };

    case 'soreness_toggled': return { type: "SORENESS_REPORTED", payload: { zone: payload.zone } };
    case 'soreness_updated': return { type: "SORENESS_REPORTED", payload: { zones: payload.soreness_map } };
    case 'fatigue_updated': return { type: "FATIGUE_UPDATED", payload };
    case 'fatigue_set': return { type: "FATIGUE_UPDATED", payload: payload.level };

    case 'update_user_profile': return { type: "USER_PROFILE_UPDATED", payload };

    case 'environment_updated': return { type: "ENVIRONMENT_UPDATED", payload };
    case 'simulation_updated': return { type: "SIMULATION_UPDATED", payload };

    case 'set_target_event': return { type: "TARGET_EVENT_SET", payload };
    case 'performance_mode_updated': return { type: "PERFORMANCE_MODE_UPDATED", payload };

    case 'init': return { type: "INIT_SYNC" };

    // Complex Toggles requiring State (Handled here to keep Context clean if state provided)
    case 'toggle_clinical_condition': {
      if (!currentState) return null; // Safety fallback
      const condition = payload;
      const current = currentState.user_profile.clinical?.conditions || [];
      const conditions = current.includes(condition)
        ? current.filter(c => c !== condition)
        : [...current, condition];
      return { type: "USER_PROFILE_UPDATED", payload: { clinical: { ...currentState.user_profile.clinical, conditions } } };
    }
    case 'toggle_allergy': {
      if (!currentState) return null;
      const allergy = payload;
      const current = currentState.user_profile.allergies || [];
      const allergies = current.includes(allergy)
        ? current.filter(a => a !== allergy)
        : [...current, allergy];
      return { type: "USER_PROFILE_UPDATED", payload: { allergies } };
    }
    case 'toggle_gut_sensitivity': {
      if (!currentState) return null;
      const gut_sensitivity = currentState.user_profile.gut_sensitivity === 'high' ? 'low' : 'high';
      return { type: "USER_PROFILE_UPDATED", payload: { gut_sensitivity } };
    }
    case 'toggle_salty_sweater': {
      if (!currentState) return null;
      return { type: "USER_PROFILE_UPDATED", payload: { salty_sweater: !currentState.user_profile.salty_sweater } };
    }

    default:
      console.warn(`Unknown trigger: ${trigger}`);
      return null;
  }
};
