
import { EliteRecoveryState, RecoveryAction, GlobalState } from "../../../types";
import { 
    AutonomicEngine, MyokineEngine, NeuromuscularEngine, 
    LactateEngine, SleepEngine, MitochondrialEngine, 
    FascialEngine, VestibularEngine, HormonalEngine, 
    OverreachEngine, RippleEngine 
} from "./recoveryEngines";
import { BoneEngine } from "./recoveryEngines/boneEngine";
import { MicrobiomeEngine } from "./recoveryEngines/microbiomeEngine";

export class RecoveryEngine {

    public static evaluate(state: GlobalState): EliteRecoveryState {
        // 1. Run Core Engines
        const autonomic = AutonomicEngine.evaluate(state);
        const myokine = MyokineEngine.evaluate(state);
        const neuromuscular = NeuromuscularEngine.evaluate(state);
        const lactate = LactateEngine.evaluate(state);
        const sleepArch = SleepEngine.evaluate(state);
        const mito = MitochondrialEngine.evaluate(state, state.physical_load.acute_load);
        const fascial = FascialEngine.evaluate(state);
        const vestibular = VestibularEngine.evaluate(state);
        const hormonal = HormonalEngine.evaluate(state);
        const bone = BoneEngine.evaluate(state);
        const microbiome = MicrobiomeEngine.evaluate(state);

        // 2. Predict Overreach
        const overreach = OverreachEngine.predict(autonomic, neuromuscular, myokine, sleepArch);

        // 3. Calculate Ripple Effects
        const ripples = RippleEngine.apply(state, {
            myokine,
            neuromuscular,
            sleep: sleepArch,
            hormonal,
            bone,
            microbiome,
            autonomic,
            mitochondrial: mito
        });

        // 4. Generate Actions
        const actions: RecoveryAction[] = [];

        // Critical Actions
        if (overreach.risk_score >= 75) {
            actions.push({
                type: "critical",
                label: "MANDATORY DELOAD",
                description: "Overreach imminent. 72h active recovery only.",
                protocol_id: "active_rest"
            });
        }
        if (myokine.ferritin && myokine.ferritin < 30) {
            actions.push({
                type: "critical",
                label: "Iron Protocol",
                description: "Ferritin < 30ng/mL. Myogenesis blocked.",
                protocol_id: "nutrition_iron"
            });
        }

        // Essential Actions
        if (sleepArch.sleep_debt_hours_cumulative > 2) {
            actions.push({
                type: "essential",
                label: "Sleep Bank",
                description: "Extend sleep window by 90min tonight.",
                protocol_id: "sleep_extension"
            });
        }
        if (autonomic.car_blunted) {
            actions.push({
                type: "essential",
                label: "Adrenal Support",
                description: "Morning sunlight + No HIIT.",
                protocol_id: "nsdr_lite"
            });
        }
        // Active Recovery Prescription Logic
        if ((lactate.lactate_post_load || 0) > 6 && state.physical_load.acwr > 1.3) {
          actions.push({
            type: 'essential',
            label: `Active Recovery @ ${Math.round((lactate.lactate_threshold_hr || 160) * 0.4)}-${Math.round((lactate.lactate_threshold_hr || 160) * 0.5)}bpm`,
            description: `Personalized lactate shuttle activation (${lactate.lactate_clearance_rate})`,
            duration_min: lactate.estimated_clearance_min_50pct,
            priority: 'essential'
          });
        }
        // Microbiome actions  
        if (microbiome.endotoxemia_risk === 'high') {
          actions.push({
            type: 'essential',
            label: 'SCFA Restoration',
            description: '30g soluble fiber + Lactobacillus/Akkermansia',
            priority: 'essential'
          });
        }
        
        // Supercompensation Protocol (If safe)
        if (mito.protocol && mito.protocol.phase === 'phase1_active' && mito.protocol.ferritin_check) {
            actions.push({
                type: 'essential',
                label: 'Glycogen Supercomp',
                description: `Target ${mito.protocol.carb_target_g_per_kg}g/kg carbs. High GI for next ${mito.protocol.high_gi_window_hours}h.`,
                priority: 'high'
            });
        }

        // Mandatory/Yellow Actions
        if (fascial.collagen_turnover_phase === "synthesis_peak") {
            actions.push({
                type: "mandatory",
                label: "Collagen Mobility",
                description: "10m flow to guide fiber orientation.",
                protocol_id: "mobility_flow"
            });
        }
        // Bone actions
        if (bone.osteoporosis_risk) {
          actions.push({
            type: 'mandatory',
            label: 'High-Impact Protocol',
            description: `${bone.high_impact_volume}m sprinting OR 300 jumps/week minimum`,
            priority: 'mandatory'
          });
        }

        // Composite Score Calculation
        // Weighted average of domain health
        let score = 100;
        score -= (100 - autonomic.parasympathetic_score) * 0.3;
        score -= (overreach.risk_score) * 0.4; // Heavy weight on overreach
        if (neuromuscular.neuromuscular_status !== 'fresh') score -= 15;
        if (myokine.inflammation_resolution !== 'optimal') score -= 15;
        
        // New Scoring Updates
        score -= (100 - bone.bone_stimulus_score) * 0.1; // 10% weight
        score -= microbiome.endotoxemia_risk === 'high' ? 15 : 0;
        score *= hormonal.recovery_speed_modifier; // Female cycle multiplier
        
        score = Math.max(1, Math.min(100, Math.round(score)));

        // Return unified Elite State
        return {
            // New Engines
            autonomic,
            myokine,
            neuromuscular,
            lactate,
            sleep_architecture: sleepArch,
            mitochondrial: mito,
            fascial,
            vestibular,
            hormonal,
            bone,
            microbiome,
            ripple_effects: ripples,
            overreach_risk: overreach,
            actions,

            // Legacy mappings for backward compatibility
            soreness_map: state.recovery.soreness_map,
            fatigue_level: state.recovery.fatigue_level,
            muscle_tightness: state.recovery.muscle_tightness,
            joint_stress: state.recovery.joint_stress,
            injury_status: state.recovery.injury_status,
            recovery_score: score
        };
    }
}
