
import { EliteRecoveryState, UserProfile } from "../../../types";

export const generateCoachReport = (profile: UserProfile, recovery: EliteRecoveryState) => {
    const date = new Date().toISOString().split('T')[0];
    
    return {
        meta: {
            athlete: profile.name,
            date: date,
            sport: profile.sport_type,
            level: profile.training_level
        },
        readiness_snapshot: {
            score: recovery.recovery_score,
            status: recovery.recovery_score > 80 ? "GREEN" : recovery.recovery_score > 50 ? "YELLOW" : "RED",
            overreach_probability: `${recovery.overreach_risk.probability}%`
        },
        physiological_markers: {
            autonomic: {
                rmssd: recovery.autonomic.rmssd,
                parasympathetic_index: recovery.autonomic.parasympathetic_score,
                cortisol_awakening_blunted: recovery.autonomic.car_blunted
            },
            metabolic: {
                lactate_clearance: recovery.lactate.clearance_efficiency,
                glycogen_depletion: `${recovery.mitochondrial.glycogen_depletion_level}%`,
                supercompensation_ready: recovery.mitochondrial.supercompensation_ready
            },
            structural: {
                fascial_phase: recovery.fascial.collagen_turnover_phase,
                bone_stimulus: recovery.bone?.bone_stimulus_score || 0,
                soreness: recovery.soreness_map
            },
            endocrine: profile.gender === 'female' ? {
                cycle_phase: recovery.hormonal.cycle_phase,
                injury_risk_multiplier: recovery.hormonal.injury_risk_multiplier
            } : "N/A"
        },
        action_plan: {
            immediate_interventions: recovery.actions.filter(a => a.type === 'critical' || a.type === 'essential'),
            recommended_protocols: recovery.actions.filter(a => a.type === 'mandatory' || a.type === 'recommended')
        },
        active_cascades: recovery.ripple_effects.map(r => `${r.source} -> ${r.target} (${r.impact})`)
    };
};
