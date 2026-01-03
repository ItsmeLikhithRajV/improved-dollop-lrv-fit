
import { UserProfile, GeneticProfile, Session } from "../../../types";

export class GeneticEngine {
  static deriveNutrientRecommendations(
    genetic: GeneticProfile,
    profile: UserProfile,
    session: Session | null
  ): {
    carbs_per_kg_adjusted: number;
    protein_per_kg_adjusted: number;
    fat_per_kg_adjusted: number;
    rationale: string;
  } {
    
    let carbs = 6.0;
    let protein = 1.6;
    let fat = 1.1;
    let rationale = "Genetic Overlay:\n";
    
    // FTO (Carb Tolerance)
    if (genetic.fto_variant === 'AA') {
      carbs *= 1.15;
      rationale += "• FTO (AA): Carb-efficient. Slightly higher CHO recommended.\n";
    } else if (genetic.fto_variant === 'TT') {
      carbs *= 0.85; 
      fat *= 1.2;
      rationale += "• FTO (TT): Fat-preferring. Lower CHO, higher Fat.\n";
    }
    
    // ACTN3 (Fiber Type)
    if (genetic.actn3_variant === 'RR') {
      protein *= 1.12; 
      if (session?.intensity === 'high') carbs *= 1.2; else carbs *= 0.95;
      rationale += "• ACTN3 (RR): Power-biased. Higher protein needs.\n";
    } else if (genetic.actn3_variant === 'XX') {
      protein *= 0.95; 
      carbs *= 1.2; 
      fat *= 0.95;
      rationale += "• ACTN3 (XX): Endurance phenotype. High carb responder.\n";
    }
    
    // PPARGC1A (Mitochondrial)
    if (genetic.ppargc1a_rs8192678 === 'GG') {
      if (session?.intensity === 'low') carbs *= 1.05;
      rationale += "• PPARGC1A (GG): Fast adapter. Handles volume well.\n";
    }

    return {
      carbs_per_kg_adjusted: parseFloat(carbs.toFixed(1)),
      protein_per_kg_adjusted: parseFloat(protein.toFixed(1)),
      fat_per_kg_adjusted: parseFloat(fat.toFixed(1)),
      rationale
    };
  }
}
