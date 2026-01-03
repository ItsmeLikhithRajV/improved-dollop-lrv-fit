import { MindspaceState } from '../../../types';

interface MindBaselines {
    reaction_time: number;
}

export class MindEngine {

    public static evaluate(state: MindspaceState, baselines: MindBaselines) {
        let penalty = 0;
        const reasons: string[] = [];
        let protocol: string | null = null;

        const stressVal = Number(state.stress);
        const moodVal = Number(state.mood);
        const baselineReaction = baselines.reaction_time || 250;

        // 1. Stress Penalty (Non-linear)
        // 1-3: Negligible. 4-6: Moderate. 7-10: Exponential impact on CNS.
        if (stressVal > 6) {
            penalty += Math.pow(stressVal - 4, 2) * 1.5; // e.g. Stress 8 = 4^2 * 1.5 = 24pt penalty
        } else {
            penalty += (stressVal - 1) * 3;
        }

        // 2. Mood Bonus/Penalty
        // Mood < 5 adds penalty, > 5 reduces it (bonus)
        if (moodVal < 5) {
            penalty += (5 - moodVal) * 3;
        } else {
            penalty = Math.max(0, penalty - ((moodVal - 5) * 3));
        }

        // 3. Focus Quality & Psych-Cognitive Interaction
        if (state.focus_quality === 'scattered') {
            // Multiplicative penalty: High stress + Scattered focus = Sympathetic Overload
            if (stressVal > 5) {
                penalty += 15;
            } else {
                penalty += 8;
            }
        } else if (state.focus_quality === 'tunnel') {
            // Tunnel vision is detrimental if driven by anxiety (stress > 6)
            if (stressVal > 6) penalty += 10;
        } else if (state.focus_quality === 'flow') {
            penalty = Math.max(0, penalty - 5);
        }

        // 4. CNS Latency Banding (Reaction Time vs Baseline)
        if (state.cognitive_scores.reaction_time) {
            const rt = state.cognitive_scores.reaction_time;
            const delta = rt - baselineReaction;

            if (delta > 100) {
                penalty += 25; // Severe Neural Fatigue (0.1s slowdown is massive)
                reasons.push(`Severe CNS Latency(+${Math.round(delta)}ms).`);
            } else if (delta > 50) {
                penalty += 10; // Moderate Latency
                reasons.push("Neural Fatigue Confirmed (>50ms delay).");
            } else if (delta < -20) {
                penalty = Math.max(0, penalty - 5); // Primed / Potentiated
            }
        }

        // 5. Impulse Control / Executive Function
        if (state.cognitive_scores.impulse_control !== undefined) {
            if (state.cognitive_scores.impulse_control < 50) {
                penalty += 10;
                reasons.push("Executive Function (Inhibition) Low.");
            }
        }

        // Clamp Penalty to calculate Score
        const score = Math.max(1, Math.min(100, Math.round(100 - penalty)));

        // 6. Protocol Selection Logic
        if (stressVal > 7 || (state.focus_quality === 'scattered' && stressVal > 5)) {
            protocol = 'box_breathing'; // Down-regulate sympathetic NS
            reasons.push("Excessive Internal Load (Stress > 8).");
        } else if (state.cognitive_scores.reaction_time && state.cognitive_scores.reaction_time > baselineReaction + 50) {
            protocol = 'super_ventilation'; // Up-regulate CNS
        } else if (state.cognitive_scores.memory_span && state.cognitive_scores.memory_span < 5) {
            protocol = 'nsdr_lite'; // Clear cognitive buffers
        } else if (score < 60) {
            protocol = 'visualization'; // General neural prep
        }

        return { score, penalty, reasons, protocol };
    }
}
