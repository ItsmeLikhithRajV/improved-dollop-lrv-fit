
import { PhysicalLoadState } from "../types";

export class LoadEngine {

    public static evaluate(state: PhysicalLoadState) {
        // Ensure values exist to prevent NaN
        const acute = state.acute_load || 1;
        const chronic = Math.max(1, state.chronic_load || 1);
        
        // 1. ACWR Calculation
        const acwr = acute / chronic;
        const risks: string[] = [];

        // 2. Risk Flags
        if (acwr > 1.5) {
            risks.push("ACWR Spike (>1.5) - Injury Risk High");
        } else if (acwr > 1.3) {
            // Warning zone, maybe handled by Orchestrator context
        } else if (acwr < 0.8) {
            risks.push("Detraining Status (<0.8)");
        }

        // 3. Monotony Check
        if (state.monotony > 2.0) {
            risks.push("High Monotony - Variation Required");
        }

        return { acwr, risks };
    }
}
