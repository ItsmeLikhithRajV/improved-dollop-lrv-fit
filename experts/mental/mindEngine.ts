import { MindspaceState, MentalStateVector, JournalAnalysisV2 } from "../../types";
import { UserProfile } from "../../types";

export class MindEngine {

    public static evaluateStateVector(
        currentVector: MentalStateVector,
        inputs: {
            stress_slider?: number;
            mood_slider?: number;
            journal_analysis?: JournalAnalysisV2;
            last_test?: { type: string, score: number, timestamp: number };
            hrv?: number;
            sleep_hours?: number;
        },
        baseline: UserProfile['baselines']
    ): MentalStateVector {

        const newVector = { ...currentVector };
        const now = Date.now();

        // 1. Core Updates
        if (inputs.stress_slider !== undefined) newVector.stress = inputs.stress_slider;
        if (inputs.mood_slider !== undefined) newVector.mood = inputs.mood_slider;

        // 2. Autonomic Balance Calculation (Deep Science V3)
        // Formula: HRV (Golden Source) > Stress/Mood (Proxy)
        // Range: -10 (Sympathetic/Freeze) to +10 (Parasympathetic/Rest)
        let autoBal = 0;

        if (inputs.hrv && baseline.hrv_baseline) {
            const z = (inputs.hrv - baseline.hrv_baseline) / 10;
            // Weighted blend: 70% HRV, 30% Subjective Stress
            autoBal = (z * 3 * 0.7) + (((5 - newVector.stress) / 5) * 5 * 0.3);
        } else {
            // Proxy: Stress acts as "Accelerator", Mood as "Context"
            // High Stress (8+) = Sympathetic (-5 to -8)
            // Low Stress (2-) = Parasympathetic (+5 to +8)
            const stressComponent = ((5 - newVector.stress) / 5) * 8;
            autoBal = stressComponent;
        }

        // Apply "State Scanner" Modifiers (Heuristics)
        if (newVector.cognitive_load > 8) autoBal -= 2; // Analysis Paralysis pushes Symp
        if (newVector.mood > 8) autoBal += 1; // Positive affect buffers stress

        newVector.autonomic_balance = Math.max(-10, Math.min(10, autoBal));

        // 3. Emotional Valence
        // Derived from Journal + Mood
        let valence = (newVector.mood - 5) * 2; // Base from mood
        if (inputs.journal_analysis) {
            const j = inputs.journal_analysis;
            const defusion = j.psychological_flexibility.cognitive_defusion;
            const catastrophizing = j.risk_signals.catastrophizing;
            // Adjustment
            valence += (defusion * 0.5) - (catastrophizing * 0.5);

            // Update Journal Confidence
            newVector.journal_confidence = j.analysis_confidence;
            newVector.last_journal_sentiment = j.sentiment;
        }
        newVector.emotional_valence = Math.max(-10, Math.min(10, valence));

        // 4. Test Updates
        if (inputs.last_test) {
            newVector.last_test_type = inputs.last_test.type;
            // Simple delta
            // Note: Reaction time lower is better, others higher is better
            // We need a standard way to store delta. Let's assume + is better for vector.
            let delta = 0;
            if (inputs.last_test.type === 'reaction') {
                delta = baseline.reaction_time - inputs.last_test.score; // Positive if faster
            } else {
                delta = 0; // Default for now
            }
            newVector.last_test_delta = delta;
            newVector.last_test_grade = this.gradeTest(inputs.last_test.score, inputs.last_test.type);
        }

        // 5. Resilience State (Simplified)
        // If recovery time from failure is low -> Rising. 
        // We'll update this via Trajectory Engine usually, but here is immediate update:
        if (newVector.mood > 7 && newVector.stress < 4) newVector.resilience_state = "rising";
        else if (newVector.stress > 8) newVector.resilience_state = "declining";
        else newVector.resilience_state = "stable";

        // 6. Meta
        newVector.state_age_minutes = 0; // Just updated

        return newVector;
    }

    private static gradeTest(score: number, type: string): "S" | "A" | "B" | "C" | "F" {
        // Placeholder simple grading
        return "B";
    }

    public static calculateReadiness(vector: MentalStateVector): number {
        let score = 80; // Base

        // 1. Autonomic Impact (+/- 10)
        score += vector.autonomic_balance * 1.5;

        // 2. Mood Impact
        if (vector.mood > 7) score += 5;
        else if (vector.mood < 4) score -= 10;

        // 3. Stress Penalty
        if (vector.stress > 7) score -= 15;
        else if (vector.stress < 3) score += 5;

        // 4. Cognitive Load Penalty
        if (vector.cognitive_load > 8) score -= 10;

        return Math.max(10, Math.min(100, Math.round(score)));
    }
}
