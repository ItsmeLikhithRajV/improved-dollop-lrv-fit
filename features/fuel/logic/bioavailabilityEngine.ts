
import { UserProfile, Meal } from "../../../types";
import { NutrientBioavailabilityProfile } from "../types";

export class BioavailabilityEngine {
  static assessAthleteMicrobiota(
    profile: UserProfile,
    training_intensity: string, // high/med/low
    weekly_volume: number,
    dietary_intake: Meal[]
  ): NutrientBioavailabilityProfile {
    
    let microbiota_score = 50; 
    
    // Training Stimulus
    if (training_intensity === 'high') microbiota_score += 15;
    if (weekly_volume > 10) microbiota_score += 10;
    
    // Diet (Simulated)
    // Real logic would parse logs for fiber
    microbiota_score += 10; 
    
    microbiota_score = Math.min(100, microbiota_score);
    const mod = 0.8 + (microbiota_score / 100) * 0.4;
    
    return {
      dietary_pattern: profile.diet_type || 'omnivore',
      gut_health_score: microbiota_score,
      athletic_gut_microbiota_level: Math.round(50 + (microbiota_score - 50) * 1.5),
      iron_heme_absorption_percent: parseFloat((20 * mod).toFixed(1)),
      iron_nonheme_absorption_percent: parseFloat((6 * mod).toFixed(1)),
      calcium_absorption_percent: parseFloat((30 * mod).toFixed(1)),
      magnesium_absorption_percent: parseFloat((45 * mod).toFixed(1)),
      vitamin_d_absorption_percent: 70
    };
  }
}
