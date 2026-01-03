
import { GlobalState } from "../../../types";
import {
    AutonomicProfile, MyokineSignaling, NeuromuscularProfile,
    LactateMetabolism, SleepArchitecture, MitochondrialProfile,
    FascialHealth, VestibularProfile, HormonalProfile, RippleEffect,
    OverreachRisk, BoneHealthProfile, MicrobiomeProfile
} from "../../../types";

// =================================================================
// 1. AUTONOMIC ENGINE
// =================================================================
export class AutonomicEngine {
    static evaluate(state: GlobalState): AutonomicProfile {
        const hrv = state.sleep.hrv;
        const baseline = state.user_profile.baselines.hrv_baseline;
        const rmssd = hrv;

        const lf_hf_ratio = 1.5;

        const cortisol_0 = state.medical.cortisol_waking || 10;
        const cortisol_30 = state.medical.cortisol_30min || 15;
        const car_magnitude = ((cortisol_30 - cortisol_0) / cortisol_0) * 100;
        const car_blunted = car_magnitude < 30;

        let paraScore = 50;
        const hrvDiff = ((hrv - baseline) / baseline) * 100;

        if (hrvDiff > 5) paraScore += 20;
        else if (hrvDiff < -10) paraScore -= 20;
        else if (hrvDiff < -20) paraScore -= 40;

        if (car_blunted) paraScore -= 30;

        return {
            rmssd,
            lf_hf_ratio,
            tonic_vagal_tone: Math.max(0, Math.min(100, paraScore + 50)),
            car_magnitude,
            car_blunted,
            parasympathetic_score: Math.max(0, Math.min(100, paraScore))
        };
    }
}

// =================================================================
// 2. MYOKINE ENGINE
// =================================================================
export class MyokineEngine {
    static evaluate(state: GlobalState): MyokineSignaling {
        const il6_acute = state.medical.il6_level || 5;
        const il6_24h = state.medical.il6_level || 2;
        const il6_decay_rate = il6_acute > 0 ? (il6_acute - il6_24h) / il6_acute : 1.0;

        const ck = state.medical.ck_level || 150;
        const ferritin = state.medical.ferritin || 50;

        let status: "optimal" | "delayed" | "chronic" = "optimal";
        if (il6_decay_rate < 0.60) status = "delayed";
        if (il6_decay_rate < 0.30) status = "chronic";

        return {
            il6_acute,
            il6_24h,
            il6_decay_rate,
            ck_level: ck,
            ferritin,
            muscle_damage_flag: ck > 400,
            inflammation_resolution: status
        };
    }
}

// =================================================================
// 3. NEUROMUSCULAR ENGINE
// =================================================================
export class NeuromuscularEngine {
    static evaluate(state: GlobalState): NeuromuscularProfile {
        const baseline = state.user_profile.baselines.jump_height_cm || 45;
        const current = baseline;

        const delta = ((current - baseline) / baseline) * 100;

        let status: "fresh" | "fatigued" | "cns_compromised" = "fresh";
        if (delta < -3) status = "fatigued";
        if (delta < -7) status = "cns_compromised";

        return {
            cmj_height_avg: current,
            cmj_height_baseline: baseline,
            cmj_height_delta: delta,
            neuromuscular_status: status
        };
    }
}

// =================================================================
// 4. LACTATE ENGINE
// =================================================================
export class LactateEngine {
    static evaluate(state: GlobalState): LactateMetabolism {
        // PERSONALIZED LACTATE THRESHOLD
        const vo2max_estimate = state.user_profile.vo2max || 50;
        const training_age_years = state.user_profile.training_age_years || 2;
        const max_hr = state.user_profile.max_hr || 190;

        // LT as % of VO2max/HRmax (trained athletes higher)
        const lt_percent_vo2max = training_age_years > 5 ? 0.82 :
            training_age_years > 2 ? 0.78 : 0.72;

        const lt_hr = max_hr * lt_percent_vo2max;

        // Clearance rate from recent lactate tests or estimate
        const recent_lactate_tests = state.performance.labs?.lactate || [];
        let clearance_rate = 'trained'; // Default

        if (recent_lactate_tests.length > 0) {
            const avg_clearance = recent_lactate_tests.reduce((sum, test) =>
                sum + test.clearance_50pct_minutes, 0
            ) / recent_lactate_tests.length;

            clearance_rate = avg_clearance < 8 ? 'elite' :
                avg_clearance < 15 ? 'trained' : 'developing';
        }

        return {
            lactate_threshold_hr: lt_hr,
            vo2_max: vo2max_estimate,
            lactate_post_load: state.performance.labs?.lactate?.[0]?.peak || 0,
            lactate_clearance_rate: clearance_rate as any,
            estimated_clearance_min_50pct: clearance_rate === 'elite' ? 7 :
                clearance_rate === 'trained' ? 12 : 25,
            clearance_efficiency: clearance_rate as any
        };
    }
}

// =================================================================
// 5. SLEEP ARCHITECTURE ENGINE
// =================================================================
export class SleepEngine {
    static evaluate(state: GlobalState): SleepArchitecture {
        const sleep = state.sleep;
        const baseline = state.user_profile.baselines.sleep_need;
        const debt = Math.max(0, baseline - sleep.duration);

        const timeAwake = 24 - sleep.duration;
        const cnsLoad = state.mindspace.stress;
        const adenosine = (timeAwake * 0.5) + (cnsLoad * 0.3);

        const chrono = state.user_profile.chronotype || 'neutral';
        let mismatch = false;
        if (state.timeline.sessions.length > 0) {
            const firstSession = state.timeline.sessions[0];
            const hour = parseInt(firstSession.time_of_day?.split(':')[0] || "12");
            if (chrono === 'late' && hour < 8) mismatch = true;
            if (chrono === 'early' && hour > 18) mismatch = true;
        }

        return {
            sleep_debt_hours_cumulative: debt,
            adenosine_load: adenosine,
            chronotype_mismatch: mismatch
        };
    }
}

// =================================================================
// 6. MITOCHONDRIAL ENGINE
// =================================================================
export class MitochondrialEngine {
    static evaluate(state: GlobalState, lastLoad: number): MitochondrialProfile {
        const glycogen = state.fuel.fuel_score;
        const depletion = 100 - glycogen;
        const ferritin = state.medical.ferritin || 50; // Default safe if unknown

        // PGC-1a Activity estimation
        let pgc1a = 0.2;
        if (glycogen < 40 && lastLoad > 500) pgc1a = 0.8;

        // Supercompensation Protocol Definition
        const acwr = state.physical_load.acwr;
        const protocol = {
            phase: depletion > 60 ? 'phase1_active' : 'maintenance' as 'phase1_active' | 'maintenance',
            carb_target_g_per_kg: 8 + (acwr > 1.5 ? 2 : 0), // 8-10g/kg
            high_gi_window_hours: 2, // 0-2h post: glucose, rice cakes
            moderate_gi_window_hours: 48, // 2-48h: oats, sweet potato
            ferritin_check: ferritin >= 30 // Skip if low
        };

        const supercomp = glycogen > 90 && pgc1a > 0.6 && protocol.ferritin_check;

        return {
            glycogen_depletion_level: depletion,
            pgc1a_activity: pgc1a,
            supercompensation_ready: supercomp,
            protocol
        };
    }
}

// =================================================================
// 7. FASCIAL ENGINE
// =================================================================
export class FascialEngine {
    static evaluate(state: GlobalState): FascialHealth {
        const timeSinceLoad = 12;

        let phase: "breakdown" | "synthesis_peak" | "remodeling" | "stable" = "stable";
        if (timeSinceLoad < 6) phase = "breakdown";
        else if (timeSinceLoad < 24) phase = "synthesis_peak";
        else if (timeSinceLoad < 48) phase = "remodeling";

        const immobility = 0;
        const inflammation = (state.medical.il6_level || 0) > 5 ? 0.5 : 0;
        const risk = (state.recovery.joint_stress * 0.1) + inflammation;

        return {
            collagen_turnover_phase: phase,
            adhesion_risk: risk,
            mobility_priority: phase === 'synthesis_peak' ? "Essential" : "Maintenance"
        };
    }
}

// =================================================================
// 9. VESTIBULAR ENGINE
// =================================================================
export class VestibularEngine {
    static evaluate(state: GlobalState): VestibularProfile {
        const sport = state.user_profile.sport_type;
        const isHighDirectional = sport === 'football' || sport === 'hybrid';

        const fatigue = isHighDirectional && state.mindspace.cognitive_scores.reaction_time ?
            state.mindspace.cognitive_scores.reaction_time > 300 : false;

        return {
            balance_delta_percent: 0,
            vestibular_fatigue: fatigue
        };
    }
}

// =================================================================
// 10. HORMONAL ENGINE (FEMALE SPECIFIC)
// =================================================================
export class HormonalEngine {
    static evaluate(state: GlobalState): HormonalProfile {
        if (state.user_profile.gender !== 'female') {
            return { cycle_phase: "none", injury_risk_multiplier: 1.0, recovery_speed_modifier: 1.0 };
        }

        const cycle_day = state.user_profile.menstrual_cycle_day || 15;

        let phase: HormonalProfile['cycle_phase'];
        if (cycle_day <= 5) phase = 'menstrual';
        else if (cycle_day <= 14) phase = 'follicular';
        else if (cycle_day <= 17) phase = 'ovulatory';
        else phase = 'luteal';

        const adjustments: HormonalProfile = {
            cycle_phase: phase,
            injury_risk_multiplier: ['follicular', 'ovulatory'].includes(phase) ? 2.5 : 1.2,
            recovery_speed_modifier: phase === 'follicular' ? 1.15 :
                phase === 'luteal' ? 0.85 : 1.0
        };

        return adjustments;
    }
}

// =================================================================
// 12. OVERREACH PREDICTOR
// =================================================================
export class OverreachEngine {
    static predict(
        autonomic: AutonomicProfile,
        neuromuscular: NeuromuscularProfile,
        myokine: MyokineSignaling,
        sleep: SleepArchitecture
    ): OverreachRisk {
        let riskScore = 0;
        const signals: string[] = [];

        if (autonomic.parasympathetic_score < 30) {
            riskScore += 25;
            signals.push("Autonomic Collapse");
        }

        if (neuromuscular.neuromuscular_status === "cns_compromised") {
            riskScore += 30;
            signals.push("CNS Failure");
        }

        if (myokine.inflammation_resolution === "chronic") {
            riskScore += 20;
            signals.push("Systemic Inflammation");
        }

        if (sleep.sleep_debt_hours_cumulative > 2) {
            riskScore += 15;
            signals.push("Sleep Bankruptcy");
        }

        if (autonomic.car_blunted) {
            riskScore += 25;
            signals.push("HPA Axis Dysregulation");
        }

        let status: any = "optimal";
        if (riskScore > 75) status = "non_functional_overreach";
        else if (riskScore > 50) status = "functional_overreach";

        return {
            risk_score: riskScore,
            probability: Math.min(99, riskScore),
            days_to_symptomatic: riskScore > 75 ? 5 : 10,
            signals,
            status
        };
    }
}

// =================================================================
// RIPPLE ENGINE (CROSS-DOMAIN CASCADES)
// =================================================================
export class RippleEngine {
    static apply(
        state: GlobalState,
        outputs: {
            myokine: MyokineSignaling,
            neuromuscular: NeuromuscularProfile,
            sleep: SleepArchitecture,
            hormonal: HormonalProfile,
            bone: BoneHealthProfile,
            microbiome: MicrobiomeProfile,
            autonomic: AutonomicProfile,
            mitochondrial: MitochondrialProfile
        }
    ): RippleEffect[] {
        const effects: RippleEffect[] = [];

        // 1. Ferritin -> Myogenesis & Bone
        if (outputs.myokine.ferritin && outputs.myokine.ferritin < 30) {
            effects.push({
                source: "Low Ferritin",
                target: "Myogenesis",
                impact: "Blocked (-25%)",
                severity: "high",
                description: "Muscle repair stalled. Myogenin transcription inhibited."
            });
            effects.push({
                source: 'LOW_FERRITIN',
                target: 'BONE_REMODELING',
                impact: '-20% piezoelectric signal',
                severity: 'high',
                description: 'Iron deficiency impairs osteoblast function'
            });
        }

        // Supercompensation Check (Managed by Mito Engine now)
        if (outputs.mitochondrial.protocol && !outputs.mitochondrial.protocol.ferritin_check) {
            effects.push({
                source: 'LOW_FERRITIN',
                target: 'GLYCOGEN_SUPERCOMPENSATION',
                impact: 'ABORT - Iron blocks glycogen synthase',
                severity: 'critical',
                description: 'Glycogen synthase activity is iron-dependent.'
            });
        }

        // 2. CNS Fatigue -> Sleep Pressure
        if (outputs.neuromuscular.neuromuscular_status === "cns_compromised") {
            effects.push({
                source: "CNS Fatigue",
                target: "Adenosine Load",
                impact: "Increased (+30%)",
                severity: "high",
                description: "Brain requires extra SWA (Deep Sleep) to clear metabolites."
            });
        }

        // 3. Chronotype Mismatch
        if (outputs.sleep.chronotype_mismatch) {
            effects.push({
                source: "Circadian Misalignment",
                target: "Injury Risk",
                impact: "Elevated (+30%)",
                severity: "medium",
                description: "Coordination reduced during non-optimal window."
            });
        }

        // 4. Luteal Phase
        if (outputs.hormonal.cycle_phase === 'luteal') {
            effects.push({
                source: "Luteal Phase",
                target: "Protein Need",
                impact: "Increased (+15%)",
                severity: "medium",
                description: "Catabolic state elevated by progesterone."
            });
        }

        // 5. Hormonal -> Mobility (Estrogen Peak)
        if (outputs.hormonal.cycle_phase === 'follicular' || outputs.hormonal.cycle_phase === 'ovulatory') {
            effects.push({
                source: 'ESTROGEN_PEAK',
                target: 'ACL_INJURY_RISK',
                impact: 'x2.5 multiplier',
                severity: 'high',
                description: 'Knee ligament laxity elevated. Knee stability required.'
            });
        }

        // 6. Microbiome -> Inflammation (Endotoxemia)
        if (outputs.microbiome.endotoxemia_risk === 'high') {
            effects.push({
                source: 'ENDOTOXEMIA',
                target: 'IL6_RESOLUTION',
                impact: '-40% cytokine decay rate',
                severity: 'high',
                description: 'LPS leakage sustaining systemic inflammation'
            });
            // Ripple to autonomic
            outputs.autonomic.parasympathetic_score *= 0.85; // Vagal suppression
        }

        return effects;
    }
}
