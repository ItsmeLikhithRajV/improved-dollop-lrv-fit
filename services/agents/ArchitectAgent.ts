import { AgentModule, AgentContext, AgentResult } from "./types";

export const ArchitectAgent: AgentModule = {
    id: 'architect',
    name: 'The Architect (V2)',
    description: 'Optimizes UI layout based on biological state and time.',
    schedule: 'always_on',

    evaluate: async ({ state, dispatch, logObservation }: AgentContext): Promise<AgentResult | null> => {

        const hour = new Date().getHours();
        const currentHero = state.ui_config?.dashboard_hero || 'default';
        const recoveryScore = state.recovery.recovery_score || 50;

        // 1. OBSERVE (State First, Time Second)
        let optimalHero = 'default';

        // RULE 1: ZEN MODE (Biological Protection)
        // If system is crashed, force Recovery focus to reduce cognitive load/anxiety
        if (recoveryScore < 30) {
            optimalHero = 'recovery';
        }
        // RULE 2: Time Context (Standard Flow)
        else {
            if (hour >= 5 && hour < 10) {
                optimalHero = 'mindspace'; // Morning Priming
            } else if (hour >= 17 && hour < 20) {
                optimalHero = 'recovery'; // Evening Wind-down
            } else {
                optimalHero = 'fuel'; // Day Execution
            }
        }

        // 2. DECIDE
        if (currentHero !== optimalHero) {
            logObservation('architect', `Switching Layout to ${optimalHero} (Rec: ${recoveryScore}, Hour: ${hour})`);

            // 3. ACT
            dispatch({
                type: 'UPDATE_UI_CONFIG',
                payload: {
                    dashboard_hero: optimalHero
                }
            });
            return {
                agentId: 'architect',
                actionsTaken: [`Updated Dashboard Hero to '${optimalHero}'`]
            };
        }

        return null;
    }
};
