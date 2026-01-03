import { AgentModule, AgentContext, AgentResult } from "./types";

export const AlchemistAgent: AgentModule = {
    id: 'alchemist',
    name: 'The Alchemist',
    description: 'Finds hidden correlations between actions and outcomes.',
    schedule: 'weekly',

    evaluate: async ({ state, dispatch, logObservation }: AgentContext): Promise<AgentResult | null> => {

        // 1. OBSERVE: Look for "Wins"
        const hrv = state.sleep.hrv || 50;
        const baseline = state.user_profile.baselines?.hrv_baseline || 50;

        // Logic: Significant positive deviation
        if (hrv > baseline * 1.15) {
            // 2. ORIENT: Attribute cause
            // In real app: Scan history for common tags in last 24h
            // Mock: Attribute to "Magnesium" or "Breathwork"

            const insight = "Your HRV is 15% above baseline. Pattern matching suggests 'Late Night Breathwork' is a key driver.";

            const notificationId = `alchemist-win-${new Date().toDateString()}`;
            const alreadyNotified = state.notifications.some(n => n.id === notificationId);

            if (!alreadyNotified) {
                // 3. ACT: Reinforce behavior
                dispatch({
                    type: 'ADD_NOTIFICATION',
                    payload: {
                        id: notificationId,
                        title: "⚗️ New Correlation Discovered",
                        message: insight,
                        type: 'info',
                        timestamp: Date.now(),
                    }
                });

                return {
                    agentId: 'researcher', // temp ID until fix
                    actionsTaken: ["Identified positive HRV correlation."]
                };
            }
        }

        return null;
    }
};
