
import { UserProfile, Session } from "../../../types";
import { NutritionalPeriodization } from "../types";

export class PeriodizationEngine {
  static calculateSessionCarbs(
    profile: UserProfile,
    session: Session | null,
    training_context: { block: string, volume_hours: number, days_until_competition: number }
  ): NutritionalPeriodization | undefined {
    
    if (!session) return undefined;

    const weight = profile.weight; // kg
    const training_block = training_context.block as any;
    const intensity = session.intensity === 'high' ? 5 : session.intensity === 'medium' ? 3 : 1;
    const duration = session.duration_minutes || 60;
    const volume_this_week = training_context.volume_hours;
    
    let carbs_per_kg = 5.0;
    let gi_target: 'low' | 'medium' | 'high' = 'medium';
    let protein_per_kg = 1.6;
    
    // ============ BLOCK-LEVEL ALLOCATION ============
    
    if (training_block === 'accumulation') {
      if (intensity >= 4 || (intensity === 3 && duration > 90)) {
        carbs_per_kg = 8.0;
        gi_target = 'high';
        protein_per_kg = 1.6;
      } else if (intensity <= 2) {
        carbs_per_kg = 3.0; // Low carb availability
        gi_target = 'low';
        protein_per_kg = 1.4;
      } else {
        carbs_per_kg = 5.5;
        gi_target = 'medium';
        protein_per_kg = 1.5;
      }
      
    } else if (training_block === 'intensification') {
      if (intensity >= 4) {
        carbs_per_kg = 10.0;
        gi_target = 'high';
        protein_per_kg = 1.8;
      } else if (intensity <= 2) {
        carbs_per_kg = 3.5;
        gi_target = 'low';
        protein_per_kg = 1.5;
      } else {
        carbs_per_kg = 6.0;
        gi_target = 'medium';
        protein_per_kg = 1.6;
      }
      
    } else if (training_block === 'taper' || training_block === 'realization') {
      if (session.is_competition_simulation || intensity === 5) {
        carbs_per_kg = 11.0;
        gi_target = 'high';
        protein_per_kg = 1.7;
      } else if (intensity <= 2) {
        carbs_per_kg = 3.0;
        gi_target = 'low';
        protein_per_kg = 1.4;
      } else {
        carbs_per_kg = 5.5;
        gi_target = 'medium';
        protein_per_kg = 1.5;
      }
    }
    
    // ============ MODIFIERS ============
    if (duration > 120) carbs_per_kg *= 1.15;
    if (volume_this_week > 15 && intensity <= 2) carbs_per_kg *= 0.9;
    
    // Pre-competition taper
    if (training_context.days_until_competition <= 3 && training_context.days_until_competition > 0) {
      if (intensity <= 2) {
        carbs_per_kg = 10.0; // Carboload
        gi_target = 'high';
      }
    }
    
    // Calculate absolute values
    const carbs_absolute = carbs_per_kg * weight;
    const protein_absolute = protein_per_kg * weight;
    const fat_absolute = 1.1 * weight; 
    
    return {
      training_block,
      session_type: session.type,
      intensity_zone: intensity,
      duration_minutes: duration,
      carbs_per_kg_body_weight: parseFloat(carbs_per_kg.toFixed(1)),
      carbs_absolute_grams: Math.round(carbs_absolute),
      protein_per_kg,
      fat_per_kg: 1.1,
      gi_target,
      rationale: this.generateRationale(training_block, intensity, carbs_per_kg)
    };
  }
  
  private static generateRationale(block: string, intensity: number, carbs: number): string {
    if (block === 'accumulation' && intensity <= 2) {
      return `Low-carb availability training (${carbs.toFixed(1)}g/kg). Triggers mitochondrial adaptation.`;
    }
    if (block === 'intensification' && intensity >= 4) {
      return `High-intensity session (${carbs.toFixed(1)}g/kg). Max glycogen needed for power output.`;
    }
    if (block === 'taper' || block === 'realization') {
      return `Competition phase. Taper carbs on easy days, but fuel race simulations.`;
    }
    return `Balanced approach for this session. Carbs support intensity.`;
  }
}
