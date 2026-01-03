
import { useEffect, useRef } from 'react';
import { useSentient } from '../store/SentientContext';
import { FuelEngine } from '../features/fuel/logic/fuelEngine';
import { MindEngine } from '../experts/mental/engines/mindEngine';
import { RecoveryEngine } from '../experts/recovery/engines/recoveryEngine';
import { EliteRecoveryState } from '../types';
import { AgentOrchestrator } from '../services/agents/AgentOrchestrator';

/**
 * useSentientLoop
 * 
 * The Heartbeat of Sentient.
 * This hook runs the evaluation loop for all engines to ensure the Global State
 * is always in sync with the complex logic of each engine.
 */
export const useSentientLoop = (intervalMs: number = 5000) => {
    const { state, dispatch } = useSentient();
    const ProcessingRef = useRef(false);

    useEffect(() => {
        // Initial Run on Mount
        runLoop();

        // Loop
        const interval = setInterval(runLoop, intervalMs);
        return () => clearInterval(interval);
    }, []); // Run on mount and keep interval running

    // We need a ref to access latest state inside interval without resetting the interval
    const stateRef = useRef(state);
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    const runLoop = async () => {
        if (ProcessingRef.current) return;
        ProcessingRef.current = true;

        // Use the ref to get fresh state without closure staleness
        const currentState = stateRef.current;

        try {
            // 1. EVALUATE FUEL
            // ----------------
            const fuelResult = FuelEngine.evaluate(
                currentState.fuel,
                currentState.user_profile,
                currentState.medical,
                currentState.timeline.sessions,
                currentState.physical_load.acwr,
                currentState.mindspace
            );

            // Simple check (comparing score and active protocol name)
            const currentProtocolName = currentState.fuel.active_protocol?.name;
            const newProtocolName = fuelResult.activeProtocol?.name;

            if (fuelResult.score !== currentState.fuel.fuel_score ||
                currentProtocolName !== newProtocolName ||
                fuelResult.viewModel?.tank.level !== currentState.fuel.viewModel?.tank.level) {

                dispatch({
                    type: 'UPDATE_FUEL_STATE',
                    payload: {
                        fuel_score: fuelResult.score,
                        active_protocol: fuelResult.activeProtocol,
                        viewModel: fuelResult.viewModel,
                        // Also update hydration status if needed, but viewModel covers visual
                    }
                });
            }


            // 2. EVALUATE MINDSPACE
            // ---------------------
            // Update Vector
            const newVector = MindEngine.evaluateStateVector(
                currentState.mindspace.state_vector,
                {
                    stress_slider: currentState.mindspace.stress,
                    mood_slider: currentState.mindspace.mood,
                    hrv: currentState.sleep.hrv
                },
                currentState.user_profile.baselines
            );

            // Calculate Readiness
            const readiness = MindEngine.calculateReadiness(newVector);

            if (readiness !== currentState.mindspace.readiness_score ||
                newVector.autonomic_balance !== currentState.mindspace.state_vector.autonomic_balance) {

                dispatch({
                    type: 'UPDATE_MINDSPACE_STATE',
                    payload: {
                        readiness_score: readiness,
                        state_vector: newVector
                    }
                });
            }


            // 3. EVALUATE RECOVERY
            // --------------------
            const recoveryResult: EliteRecoveryState = RecoveryEngine.evaluate(currentState);

            if (recoveryResult.recovery_score !== currentState.recovery.recovery_score) {
                dispatch({
                    type: 'UPDATE_RECOVERY_STATE',
                    payload: {
                        recovery_score: recoveryResult.recovery_score,
                        // Update specific sub-states if needed, e.g. actions
                        // actions: recoveryResult.actions (need to check if recovery state has actions property)
                        // For now just score is critical for the dashboard
                    }
                });
            }

            // ... inside runLoop ...

            // 4. AGENTS (New V4 Layer)
            // -------------------------
            // Run the squad. Orchestrator handles scheduling (daily/weekly/etc) internally.
            // We assume 'history' is available in state (or fetched separately)
            // Note: Passing empty history [] for now until history read is fully linked, 
            // but Agents work on state mostly.
            await AgentOrchestrator.runAgents(currentState, [], dispatch);

        } catch (e) {
            console.error("Sentient Loop Error:", e);
        } finally {
            ProcessingRef.current = false;
        }
    };
};
