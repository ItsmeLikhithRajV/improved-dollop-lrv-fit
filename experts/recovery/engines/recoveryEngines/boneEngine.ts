
import { GlobalState } from "../../../../types";
import { BoneHealthProfile } from "../../../../types";

export class BoneEngine {
  static evaluate(state: GlobalState): BoneHealthProfile {
    const age = state.user_profile.age;
    const weight = state.user_profile.weight;

    // PIEZOELECTRIC LOAD CALCULATION (bone converts mechanical stress → electrical signal)
    const high_impact_volume =
      (state.timeline.sessions.filter(s => s.type === 'sprint').reduce((sum, s) => sum + (s.distance_meters || 0), 0)) +
      (state.timeline.sessions.filter(s => s.type === 'plyometric').reduce((sum, s) => sum + (s.jumps || 0), 0));

    const resistance_sessions = state.timeline.sessions.filter(s =>
      s.type === 'strength' && s.intensity === 'high' && !s.is_interstitial
    ).length;

    const resistance_compliance = Math.min(1, resistance_sessions / 3); // 3x/week minimum

    const load_vector_diversity = new Set(
      state.timeline.sessions.map(s => s.primary_plane) // sagittal, frontal, transverse
    ).size;

    // Bone stimulus formula (piezoelectric activation)
    const piezoelectric_stimulus =
      (high_impact_volume / (age > 35 ? 1500 : 1000)) * 0.4 +  // Age-adjusted minimums
      (resistance_compliance) * 0.4 +
      (load_vector_diversity / 3) * 0.2;

    const bone_stimulus_score = Math.min(100, piezoelectric_stimulus * 100);

    // Cofactor status
    // Safely accessing deep properties with optionals
    const calcium_intake = 0; // Placeholder until macros_today has calcium. Assuming 0 if missing.
    const vit_d_intake = 0; // Placeholder.

    return {
      piezoelectric_load_stimulus: bone_stimulus_score,
      high_impact_volume,
      resistance_training_compliance: resistance_compliance,
      bone_stimulus_score,
      osteoporosis_risk: age > 35 && bone_stimulus_score < 60,
      cofactor_optimization: {
        calcium_status: calcium_intake >= (age > 50 ? 1200 : 1000) ? 'optimal' : 'deficient',
        vitamin_d_status: vit_d_intake >= 2000 ? 'optimal' : 'deficient'
      }
    };
  }
}
