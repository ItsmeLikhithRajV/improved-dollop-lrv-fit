import { AgentModule, AgentContext, AgentResult } from "./types";

export const CriticAgent: AgentModule = {
    id: 'critic',
    name: 'The Critic',
    description: 'Prunes ignored protocols to reduce noise.',
    schedule: 'daily',

    evaluate: async ({ state, history, dispatch, logObservation }: AgentContext): Promise<AgentResult | null> => {

        // 1. OBSERVE: Look for "Ignored" outcomes in history
        // Real implementation would filter history array
        // Mock observation for now
        const ignoredCounts: Record<string, number> = {
            'cold_shower': 4, // Mock: User ignored this 4 times
            'meditation': 1
        };

        const actionsTaken: string[] = [];
        const currentDisabled = state.user_profile.preferences?.disabled_protocols || [];
        const newDisabled = [...currentDisabled];
        let changed = false;

        // 2. DECIDE
        Object.entries(ignoredCounts).forEach(([protocol, count]) => {
            if (count > 3 && !currentDisabled.includes(protocol)) {
                newDisabled.push(protocol);
                actionsTaken.push(`Disabled protocol '${protocol}' (Ignored ${count} times)`);
                changed = true;
            }
        });

        // 3. ACT
        if (changed) {
            dispatch({
                type: 'UPDATE_USER_PROFILE',
                payload: {
                    preferences: {
                        ...state.user_profile.preferences,
                        disabled_protocols: newDisabled
                    }
                }
            });
            return { agentId: 'critic', actionsTaken };
        }

        return null; // No action needed
    }
};
