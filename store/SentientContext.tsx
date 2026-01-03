
import React, { createContext, useContext, useReducer, useEffect, ReactNode, useState, useCallback } from 'react';
import { GlobalState, Session, Meal, RecoveryState, BodyZone, MindspaceState, FuelState, PhysicalLoadState, TimelineState, EnvironmentState, MedicalState, PerformanceState } from '../types';
import { SentientSyncLayer } from '../services/syncLayer';
// Note: Mock data removed - app should start with empty state until real data
import { SentientNotification } from '../components/NotificationSystem';
import { saveDataPoint, loadHistory, saveOutcome, getHistory, getAverages } from '../services/history/historyStore';
import { UserHistory, ActionOutcome } from '../services/history/types';
import { UserGoal, DEFAULT_USER_GOAL } from '../types/goals';

// --- INITIAL STATE (V5 SCHEMATA) ---
const initialState: GlobalState = {
  active_tab: "home",

  user_profile: {
    id: "u1",
    name: "User",
    age: 25,
    gender: "male",
    weight: 75,
    height: 180,
    salty_sweater: false,
    sport_type: "general",
    training_level: "advanced",
    chronotype: "neutral",
    clinical: { conditions: [] },
    allergies: [],
    gut_sensitivity: "low",
    diet_type: "omnivore",

    goals: ["Peak Performance", "Longevity"],
    user_goal: DEFAULT_USER_GOAL,
    baselines: {
      resting_hr: 0,
      hrv_baseline: 0,
      reaction_time: 0,
      sleep_need: 8.0,
      jump_height_cm: 0
    },
    preferences: { theme: "dark", units: "metric" }
  },

  sleep: {
    duration: 0,
    efficiency: 0,
    disturbances: 0,
    sleep_debt: 0,
    hrv: 0,
    resting_hr: 0,
    bedtime: "00:00",
    wake_time: "00:00",
    sleep_quality_score: 0
  },

  recovery: {
    soreness_map: {
      neck: 'none', shoulders: 'none', upper_back: 'none', lower_back: 'none',
      hips: 'none', knees: 'none', ankles: 'none', feet: 'none',
      elbows: 'none', wrists: 'none', quads: 'none', hamstrings: 'none', calves: 'none'
    },
    fatigue_level: 0,
    muscle_tightness: 0,
    joint_stress: 0,
    injury_status: { is_injured: false, active_injuries: [] },
    recovery_score: 0,
    autonomic: { rmssd: 0, tonic_vagal_tone: 0, car_blunted: false, parasympathetic_score: 0 },
    myokine: { muscle_damage_flag: false, inflammation_resolution: "optimal" },
    neuromuscular: { neuromuscular_status: "fresh" },
    lactate: { clearance_efficiency: "trained" },
    sleep_architecture: { sleep_debt_hours_cumulative: 0, adenosine_load: 0, chronotype_mismatch: false },
    mitochondrial: { glycogen_depletion_level: 0, pgc1a_activity: 0, supercompensation_ready: false },
    fascial: { collagen_turnover_phase: "stable", adhesion_risk: 0, mobility_priority: "maintenance" },
    vestibular: { balance_delta_percent: 0, vestibular_fatigue: false },
    hormonal: { cycle_phase: "none", injury_risk_multiplier: 1.0, recovery_speed_modifier: 1.0 },
    bone: { piezoelectric_load_stimulus: 0, high_impact_volume: 0, resistance_training_compliance: 0, bone_stimulus_score: 0, osteoporosis_risk: false, cofactor_optimization: { calcium_status: 'optimal', vitamin_d_status: 'optimal' } },
    microbiome: { firmicutes_bacteroidetes_ratio: 0, scfa_production_score: 0, barrier_integrity: 0, endotoxemia_risk: 'low', dysbiosis_flag: false },
    ripple_effects: [],
    overreach_risk: { risk_score: 0, probability: 0, days_to_symptomatic: 0, signals: [], status: "optimal" },
    actions: []
  },

  fuel: {
    entries: [],
    macros_today: { protein: 0, carbs: 0, fat: 0, sodium: 0, fluids: 0 },
    hydration_liters: 0,
    electrolytes_taken: false,
    caffeine_mg: 0,
    fuel_score: 0,
    active_protocol: null,
    supplements: []
  },

  mindspace: {
    mood: 0,
    stress: 0,
    motivation: 0,
    focus_quality: "neutral",
    confidence: 0,
    nerves: false,
    cognitive_scores: {},
    readiness_score: 0,
    state_vector: {
      stress: 0,
      mood: 0,
      cognitive_load: 0,
      autonomic_balance: 0,
      arousal: 0,
      emotional_valence: 0,
      attentional_stability: 0,
      resilience_state: "stable",
      resilience_velocity: 0,
      last_test_type: "none",
      last_test_grade: "B",
      last_test_delta: 0,
      journal_confidence: 0,
      last_journal_sentiment: "Neutral",
      state_age_minutes: 0,
      trend_direction: "stable"
    },
    cognitive_history: {},
    protocol_history: []
  },

  physical_load: {
    acwr: 0,
    acute_load: 0,
    chronic_load: 0,
    monotony: 0,
    strain: 0,
    weekly_volume: 0,
    load_history: [],
    metrics: []
  },

  timeline: {
    sessions: [],
    adjustments: [],
    today_sessions: [],
    ready: 0
  },

  environment: {
    temperature: 20,
    humidity: 50,
    altitude: 0,
    travel_status: "home",
    AQI: 0,
    heat_index_high: false
  },

  medical: {
    biomarkers: [],
    notes: "",
    glucose_mgdl: 0,
    ketones_mmol: 0,
    systolic_bp: 0,
    tsh_level: 0,
    ferritin: 0,
    vitamin_D: 0,
    ck_level: 0,
    il6_level: 0,
    cortisol_waking: 0,
    cortisol_30min: 0
  },

  performance: {
    // training_phases removed as per type definition
    macro_phase: "base", // Fixed: must be specific enum
    competition_countdown: null,
    history: [],
    target_event: undefined
  },

  simulation: {
    active: false,
    report: null,
    config: {},
    overrides: {}
  },

  learning: {
    tags: [],
    insights: []
  },

  communication: {
    tone: "stoic"
  },

  orchestrator: {
    readiness_summary: "System Initialized",
    explanation: "Waiting for data sync...",
    risk_signals: [],
    recommended_actions: [],
    active_command: {
      action: {
        id: 'empty',
        name: 'No Active Command',
        description: 'Connect your wearables',
        instructions: '',
        duration_minutes: 0
      },
      rationale: {
        reason: 'No data',
        metric: 'none',
        impact_if_done: '',
        impact_if_skipped: ''
      },
      timing: {
        start_now: false,
        deadline_minutes: 0,
        suggested_completion_time: ''
      },
      status: 'upcoming',
      progress: 0
    },
    last_sync: 0,
    is_thinking: false
  },
  notifications: [],
  ui_config: {
    show_mach_scores: true,
    expert_mode: false,
    demo_mode: false // When true, loads sample data for demonstration
  }
};

// --- ACTIONS ---
type Action =
  | { type: 'SET_TAB'; payload: string }
  | { type: 'UPDATE_MINDSPACE_STATE_VECTOR'; payload: Partial<MindspaceState> }
  | { type: 'UPDATE_FUEL_STATE'; payload: Partial<FuelState> }
  | { type: 'UPDATE_RECOVERY_STATE'; payload: Partial<RecoveryState> }
  | { type: 'UPDATE_MINDSPACE_STATE'; payload: Partial<MindspaceState> }
  | { type: 'UPDATE_PERFORMANCE_STATE'; payload: Partial<PerformanceState> }
  | { type: 'START_COGNITIVE_TEST'; payload: any }
  | { type: 'START_PROTOCOL'; payload: any }
  | { type: 'FOCUS_JOURNAL' }
  | { type: 'COMPLETE_SESSION'; payload: { id: string; feedback: Session['feedback'] } }
  | { type: 'TOGGLE_TAPER_TASK'; payload: number }
  | { type: 'ORCHESTRATOR_START' }
  | { type: 'ORCHESTRATOR_SUCCESS'; payload: Partial<GlobalState> }
  | { type: 'ADD_NOTIFICATION'; payload: SentientNotification }
  | { type: 'DISMISS_NOTIFICATION'; payload: string }
  | { type: 'UPDATE_TIMELINE'; payload: Session[] }
  | { type: 'LOAD_CACHE'; payload: GlobalState }
  | { type: 'SET_THEME'; payload: 'dark' | 'light' | 'auto' }
  | { type: 'UPDATE_UI_CONFIG'; payload: any }
  | { type: 'UPDATE_USER_PROFILE'; payload: any }
  | { type: 'RECORD_OUTCOME'; payload: ActionOutcome }
  | { type: 'SET_USER_GOAL'; payload: UserGoal }
  | { type: 'TOGGLE_DEMO_MODE' };

// --- REDUCER ---
const reducer = (state: GlobalState & { notifications: SentientNotification[] }, action: Action): GlobalState & { notifications: SentientNotification[] } => {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, active_tab: action.payload };
    case 'LOAD_CACHE':
      return { ...state, ...action.payload, notifications: [] };

    case 'ORCHESTRATOR_START':
      return { ...state, orchestrator: { ...state.orchestrator, is_thinking: true } };

    case 'ORCHESTRATOR_SUCCESS':
      return {
        ...state,
        ...action.payload,
        active_tab: state.active_tab,
        notifications: state.notifications
      };

    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };

    case 'DISMISS_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };

    case 'UPDATE_MINDSPACE_STATE_VECTOR':
      return {
        ...state,
        mindspace: {
          ...state.mindspace,
          ...action.payload,
          state_vector: { ...state.mindspace.state_vector, ...(action.payload.state_vector || {}) }
        }
      };

    case 'UPDATE_FUEL_STATE':
      return { ...state, fuel: { ...state.fuel, ...action.payload } };

    case 'UPDATE_RECOVERY_STATE':
      return { ...state, recovery: { ...state.recovery, ...action.payload } };

    case 'UPDATE_MINDSPACE_STATE':
      return { ...state, mindspace: { ...state.mindspace, ...action.payload } };

    case 'UPDATE_PERFORMANCE_STATE':
      return { ...state, performance: { ...state.performance, ...action.payload } };

    case 'TOGGLE_TAPER_TASK':
      if (!state.performance.taper_checklist) return state;
      const newChecklist = [...state.performance.taper_checklist];
      newChecklist[action.payload].completed = !newChecklist[action.payload].completed;
      return { ...state, performance: { ...state.performance, taper_checklist: newChecklist } };

    case 'SET_THEME':
      return {
        ...state,
        user_profile: {
          ...state.user_profile,
          preferences: { ...state.user_profile.preferences, theme: action.payload }
        }
      };

    case 'UPDATE_UI_CONFIG':
      return { ...state, ui_config: { ...state.ui_config, ...action.payload } };

    case 'UPDATE_USER_PROFILE':
      return {
        ...state,
        user_profile: {
          ...state.user_profile,
          ...action.payload,
          // Handle nested updates carefully if needed, but payload merge works for now
          // deeply merging specific fields if payload is partial
          baselines: { ...state.user_profile.baselines, ...(action.payload.baselines || {}) },
          preferences: { ...state.user_profile.preferences, ...(action.payload.preferences || {}) }
        }
      };

    case 'RECORD_OUTCOME':
      // Outcome is saved to history store via side effect, no state change needed
      return state;

    case 'SET_USER_GOAL':
      return {
        ...state,
        user_profile: {
          ...state.user_profile,
          user_goal: action.payload
        }
      };

    case 'TOGGLE_DEMO_MODE':
      const newDemoMode = !(state as any).ui_config?.demo_mode;

      // Clear cached state so demo data takes full effect
      localStorage.removeItem('sentient_state_v5');
      console.log('[DEMO MODE] Cleared localStorage cache');

      if (newDemoMode) {
        // Load demo data with error protection
        try {
          const { getDemoData } = require('../services/demoData');
          const demoData = getDemoData();
          console.log('[DEMO MODE] Loaded demo data:', Object.keys(demoData));

          // Return fresh state with demo data - this will trigger re-renders and engine re-analysis
          return {
            ...initialState,
            ...demoData,
            notifications: [],
            ui_config: { ...initialState.ui_config, demo_mode: true },
            orchestrator: {
              ...demoData.orchestrator,
              is_thinking: false,
              last_sync: Date.now()
            }
          };
        } catch (e) {
          console.error('[DEMO MODE] Failed to load demo data:', e);
          return {
            ...state,
            ui_config: { ...state.ui_config, demo_mode: true }
          };
        }
      } else {
        // Clear to initial empty state
        return {
          ...initialState,
          notifications: [],
          ui_config: { ...initialState.ui_config, demo_mode: false }
        };
      }

    default:
      return state;
  }
};

// --- CONTEXT ---
interface SentientContextValue {
  state: GlobalState & { notifications: SentientNotification[] };
  dispatch: React.Dispatch<Action>;
  sync: (trigger?: string, payload?: any) => void;
  history: UserHistory;
  refreshHistory: () => void;
  recordOutcome: (outcome: ActionOutcome) => void;
  getAverages: (days?: number) => Record<string, number>;
  setTheme: (theme: 'dark' | 'light' | 'auto') => void;
  isFirstLaunch: boolean;
}

const SentientContext = createContext<SentientContextValue | undefined>(undefined);

export const SentientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, { ...initialState, notifications: [] });
  const [history, setHistory] = useState<UserHistory>(loadHistory());
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);

  // Load cached state and check for first launch
  useEffect(() => {
    const cached = localStorage.getItem('sentient_state_v5');
    const hasLaunched = localStorage.getItem('sentient_launched');

    if (!hasLaunched) {
      setIsFirstLaunch(true);
      localStorage.setItem('sentient_launched', 'true');
    }

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (!parsed.recovery.autonomic) parsed.recovery = { ...initialState.recovery, ...parsed.recovery };
        // Note: Don't use mock data as fallback - show empty state instead
        if (!parsed.performance.history) {
          parsed.performance.history = [];
        }
        dispatch({ type: 'LOAD_CACHE', payload: parsed });
        setTimeout(() => sync('init'), 100);
      } catch (e) {
        console.error("Cache corrupted, resetting.");
        sync('init');
      }
    } else {
      sync("init");
    }
  }, []);

  // Save state to LocalStorage and log history data point
  useEffect(() => {
    const timer = setTimeout(() => {
      const { notifications, ...stateToSave } = state;
      const saveable = { ...stateToSave, orchestrator: { ...stateToSave.orchestrator, is_thinking: false } };
      localStorage.setItem('sentient_state_v5', JSON.stringify(saveable));

      // Log data point to history store
      saveDataPoint(stateToSave as GlobalState);
      setHistory(loadHistory());
    }, 1000);
    return () => clearTimeout(timer);
  }, [state]);

  // Apply theme to document
  useEffect(() => {
    const theme = state.user_profile.preferences?.theme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  }, [state.user_profile.preferences?.theme]);

  // Refresh history from storage
  const refreshHistory = useCallback(() => {
    setHistory(loadHistory());
  }, []);

  // Record action outcome
  const recordOutcome = useCallback((outcome: ActionOutcome) => {
    saveOutcome(outcome);
    refreshHistory();
  }, [refreshHistory]);

  // Set theme
  const setTheme = useCallback((theme: 'dark' | 'light' | 'auto') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);

  const sync = (trigger: string = "manual", payload?: any) => {
    const newStateUpdate = SentientSyncLayer.handleEvent(state, trigger, payload);
    dispatch({ type: 'ORCHESTRATOR_SUCCESS', payload: newStateUpdate });

    // Notification Logic (Simplified for integration)
    if (newStateUpdate.orchestrator?.explanation) {
      // Optional: Add logging here
    }
  };

  const contextValue: SentientContextValue = {
    state,
    dispatch,
    sync,
    history,
    refreshHistory,
    recordOutcome,
    getAverages,
    setTheme,
    isFirstLaunch
  };

  return (
    <SentientContext.Provider value={contextValue}>
      {children}
    </SentientContext.Provider>
  );
};

export const useSentient = () => {
  const context = useContext(SentientContext);
  if (!context) throw new Error("useSentient must be used within a SentientProvider");
  return context;
};
