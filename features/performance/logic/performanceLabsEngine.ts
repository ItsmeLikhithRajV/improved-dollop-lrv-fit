
import {
    PerformanceLabsOutput,
    LongitudinalEntry,
    UserProfile,
    RiskBand,
    TrainingStateLabel,
    LabsMeta,
    LongitudinalState,
    ResilienceProfile,
    PlateauAnalysis,
    TournamentIntelligence,
    TrajectoryAnalysis,
    BehaviorAnalysis,
    ConvergencePattern,
    RippleOutputs,
    LabsCommunication,
    MindspaceState
} from "../../../types";

interface Config {
    min_history_days: number;
    adaptation_window_days: number;
    plateau_min_weeks: number;
    core_low_threshold: number;
    core_suppressed_threshold: number;
    neural_stress_threshold: number;
}

export class PerformanceLabsEngine {

    private static config: Config = {
        min_history_days: 56,
        adaptation_window_days: 28,
        plateau_min_weeks: 4,
        core_low_threshold: 40,
        core_suppressed_threshold: 60,
        neural_stress_threshold: 6 // 3-day stress > 6 = Silent Load
    };

    public static evaluate(
        history: LongitudinalEntry[],
        profile: UserProfile,
        tournamentContext?: { countdown: number, phase: string },
        currentMindspace?: MindspaceState
    ): PerformanceLabsOutput {

        // 1. Meta Context
        const meta = this.computeMeta(history);

        // 2. Longitudinal State (Adaptation vs Accumulation) - Now with NEURAL PASS
        const longitudinalState = this.computeLongitudinalState(history, tournamentContext, currentMindspace);

        // 3. Resilience Profile
        const resilience = this.computeResilienceProfile(history);

        // 4. Plateau & Stimulus
        const plateau = this.analyzePlateauAndStimulus(history);

        // 5. Tournament Intelligence
        const tournament = this.analyzeTournamentIntelligence(history, tournamentContext);

        // 6. Trajectory & Ceiling
        const trajectory = this.computeTrajectoryAndCeiling(history);

        // 7. Behavior & Interventions
        const behavior = this.analyzeBehaviorAndInterventions(history);

        // 8. Convergence Patterns
        const convergence = this.detectConvergencePatterns(history, currentMindspace);

        // 9. Ripple Outputs
        const ripples = this.buildRippleOutputs(longitudinalState, tournament, convergence);

        // 10. Communication (Ghost Coach)
        const communication = this.buildCommunication(longitudinalState, resilience, convergence, tournament, currentMindspace);

        return {
            meta,
            longitudinal_state: longitudinalState,
            resilience_profile: resilience,
            plateau_and_stimulus: plateau,
            tournament_intelligence: tournament,
            trajectory_and_ceiling: trajectory,
            behavior_and_interventions: behavior,
            convergence_patterns: convergence,
            ripple_outputs: ripples,
            communication,

            // Legacy Mappings
            state_classification: {
                label: longitudinalState.label,
                confidence: longitudinalState.confidence_0_1,
                supporting_evidence: longitudinalState.evidence
            },
            resilience_block: {
                resilience_score: resilience.resilience_score_0_100,
                trend: resilience.trend,
                evidence: resilience.evidence,
                interpretation: resilience.classification
            },
            short_horizon_risk: {
                window_days: 14,
                injury_risk: {
                    band: ripples.risk_directive.short_horizon_injury_risk_band,
                    probability_pct: ripples.risk_directive.short_horizon_injury_risk_band === 'high' ? 70 : 20,
                    drivers: convergence.patterns_detected.map(p => p.name)
                },
                performance_drop_risk: { band: ripples.risk_directive.short_horizon_performance_risk_band, probability_pct: 30, drivers: [] }
            },
            load_directives: {
                recommendation: ripples.preferred_training_state_next_7d === "deload" ? "deload" : ripples.preferred_training_state_next_7d === "build_aggressively" ? "increase" : "maintain",
                rationale: communication.summary,
                action_items: communication.recommended_actions_next_7d
            },
            trajectory_block: {
                horizon_months: 6,
                label: trajectory.metrics[0]?.trend_label === "positive" ? "on_track" : "lagging",
                commentary: trajectory.global_commentary,
                projected_metric: { name: "Capacity", current: trajectory.metrics[0]?.current_value || 0, projected: trajectory.metrics[0]?.projected_value || 0 }
            }
        };
    }

    private static computeMeta(history: LongitudinalEntry[]): LabsMeta {
        const days = history.length;
        const coverage = {
            core: history.filter(h => h.recovery_score > 0).length / days,
            load: history.filter(h => h.load_metric > 0).length / days
        };

        return {
            history_days: days,
            data_coverage: coverage,
            has_tournaments: false,
            notes: coverage.core < 0.8 ? ["Data gaps detected in Recovery stream."] : []
        };
    }

    private static computeLongitudinalState(history: LongitudinalEntry[], tournamentContext?: { phase: string }, currentMindspace?: MindspaceState): LongitudinalState {
        if (tournamentContext?.phase === 'taper') {
            return {
                label: 'taper',
                confidence_0_1: 1.0,
                evidence: ["Manual competition mode active.", "Volume shedding authorized."],
                days_in_state: 7 // Default for manually set taper
            };
        }

        const window = history.slice(-this.config.adaptation_window_days);
        if (window.length < 7) return { label: 'unknown', confidence_0_1: 0, evidence: [], days_in_state: 0 };

        const loadSlope = this.calculateSlope(window.map(h => h.load_metric));
        const recoverySlope = this.calculateSlope(window.map(h => h.recovery_score));
        const sleepSlope = this.calculateSlope(window.map(h => h.sleep_quality));

        // NEURAL SILENT LOAD CHECK
        const recentMindHistory = history.slice(-3);
        const avgRecentStress = recentMindHistory.length > 0
            ? this.calculateMean(recentMindHistory.map(h => h.mindspace_score < 50 ? 8 : 4)) // Proxy: low mindscore = high stress
            : (currentMindspace?.stress || 0);

        const isNeuralSilentLoad = avgRecentStress > this.config.neural_stress_threshold;

        let label: TrainingStateLabel = "plateau";
        const evidence: string[] = [];

        if (isNeuralSilentLoad) {
            label = "accumulation";
            evidence.push("[Neural Pass]: High cognitive load treated as Silent Load accumulation.");
        } else if (loadSlope > 5 && recoverySlope > -2) {
            label = "adaptation";
            evidence.push("Load increasing with stable recovery.");
        } else if (loadSlope > 5 && (recoverySlope < -5 || sleepSlope < -5)) {
            label = "accumulation";
            evidence.push("Load rising but recovery metrics degrading.");
        } else if (loadSlope > 10 && recoverySlope < -10) {
            label = "maladaptation";
            evidence.push("Aggressive load spike with recovery crash.");
        } else if (Math.abs(loadSlope) < 5) {
            label = "plateau";
            evidence.push("Load variance low for 4+ weeks.");
        }

        return {
            label,
            confidence_0_1: 0.85,
            evidence,
            secondary_labels: isNeuralSilentLoad ? ["neural_fatigue"] : [],
            days_in_state: 14 // Placeholder calculation
        };
    }

    private static computeResilienceProfile(history: LongitudinalEntry[]): ResilienceProfile {
        const avgLoad = this.calculateMean(history.map(h => h.load_metric));
        const spikes = history.filter((h, i) => h.load_metric > avgLoad * 1.5 && i < history.length - 2);

        let recoveryDaysSum = 0;
        let validSpikes = 0;

        spikes.forEach(spike => {
            const idx = history.indexOf(spike);
            for (let i = 1; i <= 5; i++) {
                if (history[idx + i] && history[idx + i].recovery_score > 70) {
                    recoveryDaysSum += i;
                    validSpikes++;
                    break;
                }
            }
        });

        const avgRecTime = validSpikes > 0 ? recoveryDaysSum / validSpikes : 2.5;
        const score = Math.max(0, 100 - (avgRecTime * 20));

        return {
            resilience_score_0_100: Math.round(score),
            trend: score > 70 ? "stable" : "declining",
            avg_recovery_time_days: parseFloat(avgRecTime.toFixed(1)),
            recent_stress_events_analyzed: validSpikes,
            classification: score > 80 ? "Robust" : score > 50 ? "Functional" : "Fragile",
            evidence: [`Returns to baseline in avg ${avgRecTime.toFixed(1)} days.`]
        };
    }

    private static analyzePlateauAndStimulus(history: LongitudinalEntry[]): PlateauAnalysis {
        const recent = history.slice(-28);
        const loadStdDev = this.calculateStdDev(recent.map(h => h.load_metric));
        const isPlateau = loadStdDev < 50;

        return {
            is_plateau: isPlateau,
            confidence_0_1: 0.7,
            stimulus_analysis: {
                volume_trend: "stable",
                intensity_trend: "stable",
                notes: isPlateau ? ["Stimulus monotony detected."] : []
            },
            recommended_stimulus_levers: isPlateau ? ["Introduce high-intensity shock microcycle.", "Change modality."] : []
        };
    }

    private static analyzeTournamentIntelligence(history: LongitudinalEntry[], context?: { countdown: number, phase: string }): TournamentIntelligence {
        const daysToComp = context?.countdown || null;
        const currentPhase = (context?.phase as any) || "off_season";

        let message = "No active tournament horizon.";
        const risk_flags = [];

        if (currentPhase === 'taper') {
            const recentLoad = history.slice(-7).reduce((a, b) => a + b.load_metric, 0);
            const prevLoad = history.slice(-14, -7).reduce((a, b) => a + b.load_metric, 0);
            if (recentLoad > prevLoad * 1.1) {
                message = "Taper Warning: Volume is increasing instead of decreasing.";
                risk_flags.push("taper_violation");
            } else {
                message = "Taper compliance looks good. Shedding fatigue.";
            }
        }

        return {
            next_competition: daysToComp ? { name: "Upcoming Event", days_to_competition: daysToComp, priority_tier: "A" } : null,
            current_phase: currentPhase,
            phase_evaluation: {
                message,
                risk_flags
            },
            recommended_competition_plan: {
                high_level: daysToComp && daysToComp < 14 ? ["Prioritize sleep banking", "Reduce volume 40%"] : ["Maintain build"]
            }
        };
    }

    private static computeTrajectoryAndCeiling(history: LongitudinalEntry[]): TrajectoryAnalysis {
        const loads = history.map(h => h.load_metric);
        const slope = this.calculateSlope(loads);
        const current = loads[loads.length - 1] || 0;

        return {
            metrics: [{
                name: "Work Capacity",
                current_value: current,
                projected_value: current + (slope * 30),
                projection_confidence_0_1: 0.6,
                trend_label: slope > 0 ? "positive" : "negative"
            }],
            global_commentary: slope > 0 ? "Capacity trending upward." : "Capacity stagnant or regressing.",
            ceiling_estimate: 85 // Mock placeholder
        };
    }

    private static analyzeBehaviorAndInterventions(history: LongitudinalEntry[]): BehaviorAnalysis {
        const compliance = history.filter(h => h.compliance).length / Math.max(1, history.length);
        return {
            consistency_score_0_100: Math.round(compliance * 100),
            consistency_notes: [compliance > 0.8 ? "High adherence to plan." : "Frequent missed sessions."]
        };
    }

    private static detectConvergencePatterns(history: LongitudinalEntry[], currentMindspace?: MindspaceState): { patterns_detected: ConvergencePattern[]; overall_risk_score: number; } {
        const patterns: ConvergencePattern[] = [];
        const recent = history.slice(-14);

        const avgRec = this.calculateMean(recent.map(h => h.recovery_score));
        const avgLoad = this.calculateMean(recent.map(h => h.load_metric));
        const loadSlope = this.calculateSlope(recent.map(h => h.load_metric));

        // COGNITIVE VETO: mindspace_score drops 20% below 7d avg
        if (currentMindspace) {
            const mindHistory7d = history.slice(-7).map(h => h.mindspace_score);
            const avgMind7d = mindHistory7d.length > 0 ? this.calculateMean(mindHistory7d) : 80;
            if (currentMindspace.readiness_score < (avgMind7d * 0.8)) {
                patterns.push({
                    name: "neural_crash_cluster",
                    active: true,
                    confidence_0_1: 0.95,
                    evidence: ["Cognitive Veto: MindSpace score >20% below 7-day average.", "Psychological resilience depleted."],
                    recommended_response: ["Mandatory Mental Deload.", "Escalate Risk Band to HIGH."]
                });
            }
        }

        if (loadSlope > 10 && avgRec > 60) {
            patterns.push({
                name: "silent_overload_cluster",
                active: true,
                confidence_0_1: 0.75,
                evidence: ["Load spiking rapidly.", "Subjective recovery lagging behind tissue stress."],
                recommended_response: ["Pre-emptive volume cut."]
            });
        }

        if (avgRec < 40 && avgLoad > 500) {
            patterns.push({
                name: "true_red_cluster",
                active: true,
                confidence_0_1: 0.9,
                evidence: ["Systemic failure.", "High load + Low Recovery."],
                recommended_response: ["Immediate deload."]
            });
        }

        return { patterns_detected: patterns, overall_risk_score: patterns.length * 20 };
    }

    private static buildRippleOutputs(
        state: LongitudinalState,
        tournament: TournamentIntelligence,
        convergence: { patterns_detected: ConvergencePattern[] }
    ): RippleOutputs {

        let trainingState = "maintain";
        if (state.label === 'adaptation') trainingState = "build_aggressively";
        if (state.label === 'accumulation') trainingState = "slightly_reduced_load";
        if (state.label === 'maladaptation') trainingState = "deload";
        if (state.label === 'taper') trainingState = "taper";

        const hasRedCluster = convergence.patterns_detected.some(p => p.name === 'true_red_cluster');
        const hasNeuralCrash = convergence.patterns_detected.some(p => p.name === 'neural_crash_cluster');

        return {
            preferred_training_state_next_7d: (hasRedCluster || hasNeuralCrash) ? "deload" : trainingState,
            focus_directive: (hasRedCluster || hasNeuralCrash) ? "inflammation_control" : "performance_build",
            risk_directive: {
                short_horizon_injury_risk_band: (hasRedCluster || hasNeuralCrash) ? "high" : "low",
                short_horizon_performance_risk_band: state.label === 'accumulation' ? "medium" : "low"
            }
        };
    }

    private static buildCommunication(
        state: LongitudinalState,
        resilience: ResilienceProfile,
        convergence: any,
        tournament: TournamentIntelligence,
        currentMindspace?: MindspaceState
    ): LabsCommunication {

        const hasRed = convergence.patterns_detected.some((p: any) => p.name === 'true_red_cluster');
        const hasNeuralCrash = convergence.patterns_detected.some((p: any) => p.name === 'neural_crash_cluster');

        let tone: "calm" | "advisory" | "urgent" = "calm";
        let headline = "Systems Nominal.";
        let summary = ["Adaptation is proceeding."];
        let actions = ["Maintain course."];

        if (hasNeuralCrash) {
            tone = "urgent";
            headline = "NEURAL VETO: Cognitive Integrity Low.";
            summary = ["Nervous system cannot support intended physical load.", "Psychological markers indicate fragility."];
            actions = ["Cancel high CNS sessions.", "Execute Vagal Reset protocols."];
        } else if (hasRed) {
            tone = "urgent";
            headline = "CRITICAL: Maladaptation Detected.";
            summary = ["Load has outpaced recovery capacity significantly.", "Risk of tissue failure is high."];
            actions = ["Immediate volume reduction.", "Prioritize sleep extension."];
        } else if (state.label === 'accumulation') {
            tone = "advisory";
            headline = "Accumulating Fatigue.";
            summary = ["You are absorbing load, but recovery debt is growing."];
            actions = ["Slight intensity trim.", "Focus on post-session fueling."];
        }

        return {
            tone_level: tone,
            headline,
            summary,
            recommended_actions_next_7d: actions
        };
    }

    private static calculateMean(vals: number[]) {
        if (!vals.length) return 0;
        return vals.reduce((a, b) => a + b, 0) / vals.length;
    }

    private static calculateSlope(vals: number[]) {
        if (vals.length < 2) return 0;
        const n = vals.length;
        const indices = Array.from({ length: n }, (_, i) => i);
        const sumX = indices.reduce((a, b) => a + b, 0);
        const sumY = vals.reduce((a, b) => a + b, 0);
        const sumXY = indices.reduce((a, i) => a + (i * vals[i]), 0);
        const sumXX = indices.reduce((a, i) => a + (i * i), 0);
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        return slope;
    }

    private static calculateStdDev(vals: number[]) {
        const mean = this.calculateMean(vals);
        const squareDiffs = vals.map(v => Math.pow(v - mean, 2));
        const avgSquareDiff = this.calculateMean(squareDiffs);
        return Math.sqrt(avgSquareDiff);
    }
}
