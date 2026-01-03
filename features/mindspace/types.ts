
import { MentalStateVector, CognitiveTrajectory, PsychologicalFlexibility, StateDiagnosis } from "../../types";

// =====================================================
// MINDSPACE DOMAIN TYPES
// =====================================================

export type PriorityLevel = 'urgent' | 'high' | 'medium' | 'low' | 'optional';

export interface MindspaceState {
  mood: number; // 1-10
  stress: number; // 1-10
  motivation: number; // 1-10
  focus_quality: "tunnel" | "scattered" | "neutral" | "flow";
  confidence: number; // 1-10
  nerves: boolean;
  journal_last_entry?: string;
  cognitive_scores: {
    reaction_time?: number; // ms
    memory_span?: number; // count
    focus_density?: number; // %
    impulse_control?: number; // %
  };
  readiness_score: number; 
  suggested_protocol?: {
    id: 'reaction' | 'focus' | 'memory' | 'gonogo' | 'box_breathing' | 'nsdr_lite' | 'visualization';
    title: string;
    reason: string;
    priority: PriorityLevel;
  } | null;

  // ELITE V2 FIELDS
  state_vector: MentalStateVector;
  cognitive_history: Record<string, number[]>;
  protocol_history: Array<{
    protocol: string;
    stress_before: number;
    stress_after: number;
    effectiveness: number;
    timestamp: string;
  }>;
  psychological_flexibility?: PsychologicalFlexibility;
  trajectories?: Record<string, CognitiveTrajectory>;
  diagnosis?: StateDiagnosis;
}
