
import { UserProfile } from '../types';

export interface ReadinessWeights {
    sleep: number;    // Duration & Quality
    hrv: number;      // Autonomic Balance
    recovery: number; // Somatic/Muscular
    mind: number;     // Cognitive/Stress
    fuel: number;     // Metabolic
}

export class ProfileWeighter {

    static calculateWeights(profile: UserProfile): ReadinessWeights {
        // 1. Default Balanced Profile
        let weights: ReadinessWeights = {
            sleep: 0.30,
            hrv: 0.30,
            recovery: 0.20,
            mind: 0.10,
            fuel: 0.10
        };

        const conditions = profile.clinical?.conditions || [];
        const sport = profile.sport_type;
        const level = profile.training_level;

        // 2. Clinical Overrides (Metabolic Fragility)
        if (conditions.includes('t1d') || conditions.includes('pcos') || conditions.includes('red_s')) {
            // Metabolic stability becomes the bottleneck
            weights.fuel = 0.30;
            weights.hrv = 0.20;
            weights.sleep = 0.20;
            weights.recovery = 0.15;
            weights.mind = 0.15;
        }

        // 3. High-Output Adjustments (Elite Level)
        if (level === 'elite' || level === 'advanced') {
            // Recovery & HRV dominate because volume is assumed high
            weights.hrv = 0.35;
            weights.recovery = 0.25;
            weights.sleep = 0.20;
            weights.fuel = 0.15;
            weights.mind = 0.05; // Assumes high mental resilience
        }

        // 4. Sport Specifics
        if (sport === 'strength' || sport === 'football') {
            // Muscular system priority
            weights.recovery = Math.max(weights.recovery, 0.30);
            weights.hrv -= 0.05; 
            weights.sleep -= 0.05;
        } else if (sport === 'running' || sport === 'hybrid') {
            // Energy system priority
            weights.fuel = Math.max(weights.fuel, 0.20);
            weights.recovery -= 0.05;
        }

        // 5. Normalization (Ensure sum = 1.0)
        const sum = weights.sleep + weights.hrv + weights.recovery + weights.mind + weights.fuel;
        return {
            sleep: weights.sleep / sum,
            hrv: weights.hrv / sum,
            recovery: weights.recovery / sum,
            mind: weights.mind / sum,
            fuel: weights.fuel / sum
        };
    }
}
