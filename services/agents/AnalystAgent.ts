import { AgentModule, AgentContext, AgentResult } from "./types";

export const AnalystAgent: AgentModule = {
    id: 'analyst',
    name: 'The Analyst',
    description: 'Optimizes baselines based on recent performance.',
    schedule: 'weekly', // In dev, we might hack this to 'daily' or 'always_on' to test

    evaluate: async ({ state, history, dispatch, logObservation }: AgentContext): Promise<AgentResult | null> => {

        // 1. OBSERVE: Gather Sleep Data from "Smart History" (mocked by using state for now or if history is empty)
        // In real app, we'd slice the last 7 entries from `history`
        const currentSleepGoal = state.user_profile.baselines?.sleep_goal || 8;

        // Mocking "Average Sleep" calculation from history (assuming history has some data)
        // logic: let's pretend we calculate average from last 5 logs
        const avgSleepDuration = 7.5; // Placeholder: This would be `history.reduce(...) / 7`

        const actionsTaken: string[] = [];
        let goalChanged = false;
        let newGoal = currentSleepGoal;

        logObservation('analyst', `Current Goal: ${currentSleepGoal}, Recent Avg: ${avgSleepDuration}`);

        // 2. DECIDE: logic to tune baselines
        // Scenario A: User is crushing it (Sleeping way more than goal) -> Raise the Bar
        if (avgSleepDuration > currentSleepGoal + 0.5) {
            newGoal = Math.min(10, currentSleepGoal + 0.5);
            actionsTaken.push(`Increased Sleep Goal to ${newGoal}h (User is consistently over-sleeping goal)`);
            goalChanged = true;
        }
        // Scenario B: User is failing (Way under goal) -> Lower the Bar (Reduce friction)
        else if (avgSleepDuration < currentSleepGoal - 1.0) {
            newGoal = Math.max(6, currentSleepGoal - 0.5);
            actionsTaken.push(`Decreased Sleep Goal to ${newGoal}h (User is struggling to hit target)`);
            goalChanged = true;
        }

        // 3. ACT
        if (goalChanged) {
            dispatch({
                type: 'UPDATE_USER_PROFILE',
                payload: {
                    baselines: {
                        ...state.user_profile.baselines,
                        sleep_goal: newGoal
                    }
                }
            });
            return { agentId: 'analyst', actionsTaken };
        }

        return null;
    }
};
