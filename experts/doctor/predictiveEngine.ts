
import { GlobalState, SimulationReport, ScheduleArchetype, LifestyleArchetype, DayResult, Session } from '../../types';
import { SentientLocalOrchestrator } from '../orchestrator/sentientLocalOrchestrator';
import { ScheduleGenerator } from '../../services/scheduleGenerator';

export class PredictiveEngine {

    public static runCampaign(
        startState: GlobalState,
        scheduleType: ScheduleArchetype,
        lifestyleType: LifestyleArchetype
    ): SimulationReport {

        const schedule = ScheduleGenerator.generate(scheduleType);
        let currentState = JSON.parse(JSON.stringify(startState));
        const results: DayResult[] = [];
        let failureDay: number | null = null;

        // Reset cumulative counters for the sim
        currentState.physical_load.acute_load = 500; // Normalized start

        for (let day = 0; day < 10; day++) {
            if (failureDay) break;

            // 1. Inject Day's Context (Schedule & Lifestyle)
            currentState.timeline.sessions = schedule[day];
            currentState = this.applyLifestyle(currentState, lifestyleType);

            // 2. Run Orchestrator (The Brain)
            const orchestrator = new SentientLocalOrchestrator(currentState);
            const output = orchestrator.runAll();

            // 3. Record Result
            const risk = output.injuryRisks.length > 0 ? 80 : Math.max(0, 100 - output.readinessScore);
            const stateLabel = output.readinessScore < 30 ? "Failed" : output.readinessScore < 50 ? "Strained" : "Operational";

            results.push({
                day: day + 1,
                readiness: output.readinessScore,
                fuel_score: output.fuelState.fuel_score || 50,
                recovery_score: output.recoveryScore,
                acwr: output.commanderDecision.acwr || 1.0,
                injury_risk: risk,
                dominant_signal: output.explanations[0] || "Stable",
                system_state: stateLabel
            });

            // 4. Check Failure
            if (output.readinessScore < 20 || output.commanderDecision.mode === "Systemic Overload") {
                failureDay = day + 1;
            }

            // 5. DEGRADE STATE (The Ripple Effect -> Next Day Inputs)
            currentState = this.degradeStateForNextDay(currentState, output, schedule[day], lifestyleType);
        }

        return {
            campaign_id: `camp-${Date.now()}`,
            schedule_name: scheduleType.toUpperCase(),
            lifestyle_name: lifestyleType.toUpperCase(),
            trajectory: results,
            failure_point: failureDay,
            survived: failureDay === null,
            recommendation: this.generateRecommendation(failureDay, scheduleType, lifestyleType)
        };
    }

    private static applyLifestyle(state: GlobalState, type: LifestyleArchetype): GlobalState {
        // Reset daily inputs based on lifestyle
        if (type === 'optimal') {
            state.sleep.duration = 8.5;
            state.sleep.efficiency = 95;
            state.fuel.fuel_score = 90;
            state.fuel.hydration_liters = 3.0;
            state.mindspace.stress = 2;
        } else if (type === 'sleep_deprived') {
            state.sleep.duration = 4.5;
            state.sleep.efficiency = 70;
            state.mindspace.stress = 7;
        } else if (type === 'high_stress') {
            state.sleep.duration = 6.0;
            state.mindspace.stress = 9;
            state.sleep.hrv = state.user_profile.baselines.hrv_baseline * 0.7; // Tank HRV
        } else if (type === 'poor_nutrition') {
            state.fuel.fuel_score = 30;
            state.fuel.hydration_liters = 0.5;
        }
        return state;
    }

    private static degradeStateForNextDay(
        state: GlobalState,
        output: any,
        todaysSessions: Session[],
        lifestyle: LifestyleArchetype
    ): GlobalState {
        const next = JSON.parse(JSON.stringify(state));

        // Load Accumulation
        const dayLoad = todaysSessions.reduce((acc, s) => {
            const intensity = s.intensity === 'high' ? 10 : s.intensity === 'medium' ? 6 : 2;
            return acc + (intensity * 60);
        }, 0);

        next.physical_load.acute_load = (state.physical_load.acute_load * 6 + dayLoad) / 7;

        // Fatigue Accumulation
        // If recovery was poor today, fatigue carries over and compounds
        if (output.recoveryScore < 50) {
            next.recovery.fatigue_level = Math.min(10, state.recovery.fatigue_level + 2);
            next.recovery.soreness_map.legs = 'sore'; // Naive soreness spread
        } else {
            next.recovery.fatigue_level = Math.max(1, state.recovery.fatigue_level - 1);
        }

        // HRV Drift
        // High load + Low sleep = HRV crash
        if (dayLoad > 600 && state.sleep.duration < 6) {
            next.sleep.hrv = state.sleep.hrv * 0.90; // 10% drop
        } else if (output.recoveryScore > 80) {
            next.sleep.hrv = Math.min(state.user_profile.baselines.hrv_baseline * 1.1, state.sleep.hrv * 1.05); // Rebound
        }

        // Fuel Depletion
        // If poor nutrition, tank empties day over day
        if (lifestyle === 'poor_nutrition') {
            next.fuel.fuel_score = Math.max(0, state.fuel.fuel_score - 20);
        }

        return next;
    }

    private static generateRecommendation(failureDay: number | null, schedule: string, lifestyle: string): string {
        if (!failureDay) return "System Resilient. You can handle this block.";

        if (lifestyle === 'sleep_deprived') return `Critical failure on Day ${failureDay}. Sleep is the bottleneck. Increase to 7h+ or reduce volume.`;
        if (lifestyle === 'poor_nutrition') return `Metabolic crash on Day ${failureDay}. Fuel tank depletion caused system shutdown.`;
        if (schedule === 'shock') return `Shock cycle rejected. Volume exceeds adaptive capacity on Day ${failureDay}. Insert rest day.`;

        return "Load exceeds capacity. Taper required.";
    }
}
