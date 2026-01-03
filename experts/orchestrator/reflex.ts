
import { SentientLocalOrchestrator } from '../performance/slo';
import { GlobalState } from '../../types';

// Backward compatibility wrapper if any component still imports runReflexAnalysis directly
// though we prefer using the new Class.

export const runReflexAnalysis = (state: GlobalState): Partial<GlobalState> => {
    const sloOutput = SentientLocalOrchestrator.evaluate(state);

    return {
        orchestrator: {
            readiness_summary: sloOutput.commanderDecision.mode || "Ready",
            explanation: sloOutput.commanderDecision.reason || "Analysis complete",
            risk_signals: sloOutput.commanderDecision.risk_signals || [],
            recommended_actions: [sloOutput.commanderDecision.action, ...sloOutput.timeline.adjustments],
            last_sync: Date.now(),
            is_thinking: false,
            active_command: sloOutput.activeCommand || null
        },
        recovery: {
            ...state.recovery,
            recovery_score: sloOutput.recoveryScore
        },
        mindspace: {
            ...state.mindspace,
            readiness_score: sloOutput.mindspaceReadiness.score,
            suggested_protocol: sloOutput.mindspaceReadiness.protocol ? {
                id: sloOutput.mindspaceReadiness.protocol as any,
                title: "Neural Primer",
                reason: "Optimization",
                priority: 'high'
            } : null
        }
    };
};

export { SentientLocalOrchestrator };
