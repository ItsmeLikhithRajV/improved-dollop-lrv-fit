import { GlobalState } from "../../types";
import { AgentModule, AgentResult, AgentId } from "./types";
import { AnalystAgent } from "./AnalystAgent";
import { CriticAgent } from "./CriticAgent";
import { ArchitectAgent } from "./ArchitectAgent";
import { ResearcherAgent } from "./ResearcherAgent";
import { AlchemistAgent } from "./AlchemistAgent";

// Registry
const AGENTS: AgentModule[] = [
    AnalystAgent,
    CriticAgent,
    ArchitectAgent,
    ResearcherAgent,
    AlchemistAgent
];

// Memory of when agents last ran (could be persisted to LocalStorage)
let agentRunLog: Record<AgentId, number> = {
    analyst: 0,
    architect: 0,
    critic: 0,
    researcher: 0,
    alchemist: 0
};

export const AgentOrchestrator = {
    /**
     * Main entry point. Called periodically or on app load.
     */
    runAgents: async (
        state: GlobalState,
        history: any[],
        dispatch: (action: any) => void
    ): Promise<AgentResult[]> => {

        const now = Date.now();
        const results: AgentResult[] = [];

        // Context available to all agents
        const context = {
            state,
            history,
            dispatch,
            logObservation: (id: AgentId, obs: string) => console.log(`[AGENT: ${id}] ${obs}`)
        };

        for (const agent of AGENTS) {
            if (shouldRun(agent, now)) {
                console.log(`[ORCHESTRATOR] Activating ${agent.name}...`);
                try {
                    const result = await agent.evaluate(context);
                    if (result) {
                        results.push(result);
                        console.log(`[AGENT: ${agent.id}] Result:`, result.actionsTaken);
                    }
                    agentRunLog[agent.id] = now;
                } catch (e) {
                    console.error(`[AGENT ERROR] ${agent.id} failed:`, e);
                }
            }
        }

        return results;
    }
};

const shouldRun = (agent: AgentModule, now: number): boolean => {
    const lastRun = agentRunLog[agent.id] || 0;
    const elapsed = now - lastRun;

    switch (agent.schedule) {
        case 'always_on': return elapsed > 5000; // Run every 5s max
        case 'daily': return elapsed > 24 * 60 * 60 * 1000;
        case 'weekly': return elapsed > 7 * 24 * 60 * 60 * 1000;
        case 'on_event': return false; // Triggered manually
        default: return false;
    }
};
