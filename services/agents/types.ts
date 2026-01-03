import { GlobalState } from "../../types";

export type AgentId = 'analyst' | 'architect' | 'critic' | 'researcher' | 'alchemist';

export interface AgentContext {
    state: GlobalState;
    history: any[]; // UserHistory entries
    dispatch: (action: any) => void;
    logObservation: (agentId: AgentId, observation: string) => void;
}

export interface AgentResult {
    agentId: AgentId;
    actionsTaken: string[]; // Descriptions of what was done
    changesProposed?: any; // For later approval systems
}

export interface AgentModule {
    id: AgentId;
    name: string;
    description: string;
    schedule: 'daily' | 'weekly' | 'always_on' | 'on_event';
    evaluate: (context: AgentContext) => Promise<AgentResult | null>;
}
