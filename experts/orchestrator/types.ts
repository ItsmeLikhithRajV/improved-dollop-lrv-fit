
import { GlobalState, UserProfile } from "../../types";
import { ActionCandidate, ExpertOpinion } from "../types";

export interface OrchestratorState {
    status: 'idle' | 'analyzing' | 'resolving' | 'complete';
    active_opinions: ExpertOpinion[];
    final_plan: ActionCandidate[];
    conflicts_detected: ConflictEvent[];
    last_run: number;
}

export interface ConflictEvent {
    id: string;
    experts_involved: string[];
    description: string;
    winning_expert: string;
    compromise_used?: boolean;
    timestamp: number;
}

export interface OrchestratorContext {
    user_goal: string;
    current_time: Date;
    is_training_block: boolean;
}

export interface ActionRecommendation extends ActionCandidate {
    priority_score: number;
    source: string;
}

export interface PriorityScore {
    action_id: string;
    score: number;
    factors: string[];
}
