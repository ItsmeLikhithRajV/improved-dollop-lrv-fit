
import { SleepState } from "../types";

interface Baselines {
    hrv: number;
    rhr: number;
    sleep: number;
}

export class SleepEngine {

    public static evaluate(state: SleepState, baselines: Baselines) {
        let penalty = 0;
        const reasons: string[] = [];
        let hygieneAction: string | null = null;
        let hrvFactor = 70; // Default Neutral
        let sleepFactor = 100; // Default Full

        // 1. Sleep Duration Factor (vs Baseline)
        const sleepRatio = state.duration / baselines.sleep;
        sleepFactor = Math.min(100, sleepRatio * 100);
        
        if (sleepRatio < 0.75) {
            sleepFactor *= 0.8; // Heavy penalty for < 6h (assuming 8h baseline)
            penalty += 25;
            reasons.push("Critical Sleep Debt. Cognitive risk.");
        }

        // 2. Sleep Efficiency
        if (state.efficiency < 80) {
            penalty += 15;
            hygieneAction = "Cool room to 18°C + Dim lights 1h before bed";
            reasons.push("Sleep Architecture Fragmented.");
        }

        // 3. HRV Factor (Autonomic Balance)
        // Compare current to baseline. 
        const hrvRatio = state.hrv / baselines.hrv;
        
        if (hrvRatio > 1.05) {
            hrvFactor = 85 + (hrvRatio - 1.05) * 50; // Bonus
        } else if (hrvRatio < 0.85) {
            hrvFactor = Math.max(0, 70 - (0.85 - hrvRatio) * 200); // Steep drop
            penalty += 20;
            reasons.push("HRV Depressed (Sympathetic Strain).");
        } else {
            hrvFactor = 70 + (hrvRatio - 0.85) * 75; // Linear mid-range
        }

        // 4. Acute HRV Crash (High Signal)
        const hrvDrop = (baselines.hrv - state.hrv) / baselines.hrv;
        if (hrvDrop >= 0.20) { 
            penalty += 40;
            reasons.push("Acute Systemic Overload (HRV -20%).");
        }

        // 5. Resting HR Check (Penalty Only)
        let rhrPenalty = 0;
        if (Number(state.resting_hr) > Number(baselines.rhr) + 5) rhrPenalty = 5;
        if (Number(state.resting_hr) > Number(baselines.rhr) + 10) {
            rhrPenalty = 15;
            reasons.push("Elevated RHR (Metabolic Stress).");
        }
        penalty += rhrPenalty;

        // Calculate Recommended Bedtime
        const recommendedBedtime = this.calculateBedtime(state.wake_time, baselines.sleep);

        return { 
            sleepFactor, 
            hrvFactor, 
            penalty, 
            rhrPenalty,
            reasons, 
            hygieneAction,
            recommendedBedtime,
            isAcuteOverload: hrvDrop >= 0.20
        };
    }

    private static calculateBedtime(wakeTime: string, need: number): string {
        if (!wakeTime) return "22:00";
        const [hours, mins] = wakeTime.split(':').map(Number);
        let bedHour = hours - need;
        if (bedHour < 0) bedHour += 24;
        return `${String(Math.floor(bedHour)).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }
}
