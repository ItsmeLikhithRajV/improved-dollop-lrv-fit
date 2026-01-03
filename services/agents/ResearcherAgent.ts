import { AgentModule, AgentContext, AgentResult } from "./types";

export const ResearcherAgent: AgentModule = {
    id: 'researcher',
    name: 'The Researcher',
    description: 'Detects patterns of overreaching and burnout.',
    schedule: 'daily',

    evaluate: async ({ state, dispatch, logObservation }: AgentContext): Promise<AgentResult | null> => {

        // 1. OBSERVE
        // In a real app, we would look at 7-day trends of ACWR (Acute Chronic Workload Ratio)
        // Here we use a heuristic based on current snapshot
        const recoveryScore = state.recovery.recovery_score || 50;
        const acuteLoad = state.physical_load?.strain || 0;
        const isTired = state.mindspace.readiness_score < 40;

        // 2. ORIENT (Burnout Radar)
        // Condition: High Load (>14) AND Low Recovery (<35) AND Low Mental Readiness
        const isOverreaching = acuteLoad > 14 && recoveryScore < 35 && isTired;

        if (isOverreaching) {
            logObservation('researcher', `Detected Overreaching: Strain ${acuteLoad}, Recovery ${recoveryScore}`);

            // 3. DECIDE & ACT (Sovereignty First: Suggest, Don't Force)
            // We do NOT change the plan automatically. We just notify.

            const notificationId = `burnout-warning-${new Date().toDateString()}`;

            // Check if we already warned today (mock check via actionsTaken logic or just unique ID)
            // In this simple loop, we just dispatch. The reducer should handle dupes if ID matches? 
            // Our reducer adds to array, so we might want to check existing notifications in state?
            const alreadyWarned = state.notifications.some(n => n.id === notificationId);

            if (!alreadyWarned) {
                dispatch({
                    type: 'ADD_NOTIFICATION',
                    payload: {
                        id: notificationId,
                        title: "⚠️ High System Load Detected",
                        message: "Your neural and physical load is high relative to recovery. Consider a 'Taper Day' to protect long-term progress.",
                        type: 'warning',
                        timestamp: Date.now(),
                        actionLabel: "View Recovery",
                        actionLink: "recovery"
                    }
                });

                return {
                    agentId: 'researcher',
                    actionsTaken: ["Sent 'Overreaching' warning notification."],
                    changesProposed: { recommended_protocol: "nsdr_lite" }
                };
            }
        }

        return null;
    }
};
