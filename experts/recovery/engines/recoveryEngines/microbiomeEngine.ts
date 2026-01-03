
import { GlobalState } from "../../../../types";
import { MicrobiomeProfile } from "../../../../types";

export class MicrobiomeEngine {
  static evaluate(state: GlobalState): MicrobiomeProfile {
    // SCFA production from fiber intake
    // Assuming macros_today might be extended in future, currently using dummy values if missing
    const soluble_fiber_g = 0;
    const resistant_starch_g = 0;
    const polyphenol_score = 0;

    const scfa_production =
      (soluble_fiber_g / 30) * 0.4 +      // 30g soluble fiber minimum
      (resistant_starch_g / 20) * 0.3 +   // Cooled rice/potatoes
      (polyphenol_score / 500) * 0.3;     // mg polyphenols

    const scfa_score = Math.min(100, scfa_production * 100);

    // Barrier integrity (fiber + probiotics)
    const probiotic_compliance = state.fuel.supplements?.some(s =>
      s.taken && ['Lactobacillus', 'Akkermansia'].includes(s.name)
    ) ? 1 : 0;

    const barrier_integrity =
      (soluble_fiber_g / 40) * 0.5 +
      probiotic_compliance * 0.3 +
      (polyphenol_score / 1000) * 0.2;

    // Default to low risk if no data
    const endotoxemia_risk = barrier_integrity < 0.5 ? 'high' :
      barrier_integrity < 0.7 ? 'moderate' : 'low';

    return {
      firmicutes_bacteroidetes_ratio: 0.6, // Placeholder - needs stool test
      scfa_production_score: scfa_score,
      barrier_integrity,
      endotoxemia_risk,
      dysbiosis_flag: scfa_score < 50
    };
  }
}
