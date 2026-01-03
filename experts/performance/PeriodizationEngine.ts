/**
 * Periodization Engine
 * 
 * Implements training periodization based on:
 * - Tudor Bompa's periodization principles
 * - Block periodization (Issurin)
 * - Taper research (Mujika/Padilla)
 * - Fitness-fatigue model (Banister)
 */

import {
    Macrocycle,
    Mesocycle,
    Microcycle,
    MesocycleType,
    MicrocycleType,
    TargetEvent,
    TaperProtocol,
    TaperPhase,
    FitnessFatigueState,
    PeriodizationAnalysis,
    PeriodizationRecommendation,
    WeeklySummary,
    PhaseProgress,
    PlannedSession,
    VolumeTarget,
    IntensityDistribution,
    OPTIMAL_TAPER,
    FITNESS_FATIGUE_CONSTANTS,
    INTENSITY_MODELS,
    ENDURANCE_KEY_WORKOUTS
} from '../../types/periodization';

// ============================================================================
// PERIODIZATION ENGINE
// ============================================================================

export class PeriodizationEngine {
    private macrocycle: Macrocycle | null = null;
    private trainingLog: { date: string; load: number }[] = [];

    // --------------------------------------------------------------------------
    // BUILD MACROCYCLE
    // --------------------------------------------------------------------------

    /**
     * Create a complete macrocycle from target event
     */
    buildMacrocycle(
        targetEvent: TargetEvent,
        weeksAvailable: number,
        sport: string = 'running'
    ): Macrocycle {
        const startDate = new Date();
        const eventDate = new Date(targetEvent.date);

        // Calculate phase durations based on available weeks
        const phases = this.calculatePhaseDurations(weeksAvailable, targetEvent.priority);

        // Build mesocycles
        const mesocycles = this.buildMesocycles(startDate, phases, sport);

        const macrocycle: Macrocycle = {
            id: `macro_${Date.now()}`,
            name: `${targetEvent.name} Build`,
            sport,
            start_date: startDate.toISOString(),
            end_date: eventDate.toISOString(),
            target_event: targetEvent,
            mesocycles,
            annual_plan: {
                periodization_model: 'block',
                competition_density: 'low',
                peak_count: 1,
                training_phases: {
                    general_prep_weeks: phases.general_prep,
                    specific_prep_weeks: phases.specific_prep,
                    competition_weeks: phases.competition,
                    transition_weeks: phases.transition
                },
                volume_periodization: {
                    peak_volume_week: Math.floor(weeksAvailable * 0.6),
                    peak_volume_hours: 15,
                    base_volume_hours: 8,
                    progression_percent_per_week: 5
                },
                key_metrics: {
                    total_hours: weeksAvailable * 10,
                    key_session_count: weeksAvailable * 2,
                    race_count: 1,
                    deload_weeks: Math.floor(weeksAvailable / 4)
                }
            }
        };

        this.macrocycle = macrocycle;
        return macrocycle;
    }

    /**
     * Calculate phase durations based on weeks until event
     */
    private calculatePhaseDurations(
        weeks: number,
        priority: 'A' | 'B' | 'C'
    ): {
        general_prep: number;
        specific_prep: number;
        competition: number;
        taper: number;
        transition: number;
    } {
        // A-race: Full build. B-race: Condensed. C-race: Minimal taper
        const taperWeeks = priority === 'A' ? 2 : priority === 'B' ? 1 : 0;
        const competitionWeeks = 1;
        const transitionWeeks = priority === 'A' ? 1 : 0;

        const buildWeeks = weeks - taperWeeks - competitionWeeks - transitionWeeks;

        // Split build into general (40%) and specific (60%)
        const generalPrepWeeks = Math.floor(buildWeeks * 0.4);
        const specificPrepWeeks = buildWeeks - generalPrepWeeks;

        return {
            general_prep: Math.max(generalPrepWeeks, 2),
            specific_prep: Math.max(specificPrepWeeks, 2),
            competition: competitionWeeks,
            taper: taperWeeks,
            transition: transitionWeeks
        };
    }

    /**
     * Build mesocycles for the macrocycle
     */
    private buildMesocycles(
        startDate: Date,
        phases: ReturnType<typeof this.calculatePhaseDurations>,
        sport: string
    ): Mesocycle[] {
        const mesocycles: Mesocycle[] = [];
        let currentDate = new Date(startDate);

        // General Preparation
        if (phases.general_prep > 0) {
            mesocycles.push(this.createMesocycle(
                'General Preparation',
                'general_preparation',
                currentDate,
                phases.general_prep,
                sport
            ));
            currentDate = this.addWeeks(currentDate, phases.general_prep);
        }

        // Specific Preparation
        if (phases.specific_prep > 0) {
            mesocycles.push(this.createMesocycle(
                'Specific Preparation',
                'specific_preparation',
                currentDate,
                phases.specific_prep,
                sport
            ));
            currentDate = this.addWeeks(currentDate, phases.specific_prep);
        }

        // Taper
        if (phases.taper > 0) {
            mesocycles.push(this.createMesocycle(
                'Taper',
                'taper',
                currentDate,
                phases.taper,
                sport
            ));
            currentDate = this.addWeeks(currentDate, phases.taper);
        }

        // Competition
        mesocycles.push(this.createMesocycle(
            'Competition',
            'competition',
            currentDate,
            phases.competition,
            sport
        ));

        return mesocycles;
    }

    /**
     * Create a single mesocycle
     */
    private createMesocycle(
        name: string,
        type: MesocycleType,
        startDate: Date,
        weeks: number,
        sport: string
    ): Mesocycle {
        const endDate = this.addWeeks(startDate, weeks);

        // Build microcycles
        const microcycles: Microcycle[] = [];
        let weekStart = new Date(startDate);

        for (let i = 0; i < weeks; i++) {
            const isDeload = (i + 1) % 4 === 0; // Every 4th week
            microcycles.push(this.createMicrocycle(
                i + 1,
                weekStart,
                type,
                isDeload ? 'recovery' : 'development'
            ));
            weekStart = this.addWeeks(weekStart, 1);
        }

        return {
            id: `meso_${type}_${Date.now()}`,
            name,
            type,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            weeks,
            microcycles,
            objectives: this.getPhaseObjectives(type),
            key_workouts: ENDURANCE_KEY_WORKOUTS.slice(0, 3),
            volume_target: this.getVolumeTarget(type),
            intensity_distribution: this.getIntensityDistribution(type)
        };
    }

    /**
     * Create a single microcycle (week)
     */
    private createMicrocycle(
        weekNumber: number,
        startDate: Date,
        phaseType: MesocycleType,
        microType: MicrocycleType
    ): Microcycle {
        return {
            id: `micro_${weekNumber}_${Date.now()}`,
            week_number: weekNumber,
            type: microType,
            start_date: startDate.toISOString(),
            sessions: this.generateWeekSessions(phaseType, microType),
            volume_load: this.calculateWeekLoad(phaseType, microType),
            intensity_avg: this.calculateWeekIntensity(phaseType, microType),
            recovery_focus: microType === 'recovery' || microType === 'deload'
        };
    }

    /**
     * Generate planned sessions for a week
     */
    private generateWeekSessions(phase: MesocycleType, microType: MicrocycleType): PlannedSession[] {
        const isRecovery = microType === 'recovery' || microType === 'deload';
        const sessions: PlannedSession[] = [];

        // Monday: Easy or Off
        if (!isRecovery) {
            sessions.push({
                id: `session_0`,
                day: 0,
                type: 'recovery',
                name: 'Easy Run',
                description: 'Active recovery',
                duration_min: 40,
                intensity: 'easy',
                key_workout: false
            });
        }

        // Tuesday: Key Session
        sessions.push({
            id: `session_1`,
            day: 1,
            type: phase === 'general_preparation' ? 'tempo' : 'threshold',
            name: phase === 'general_preparation' ? 'Tempo Run' : 'Threshold Intervals',
            description: 'Key quality session',
            duration_min: isRecovery ? 45 : 60,
            intensity: isRecovery ? 'moderate' : 'threshold',
            key_workout: true,
            intervals: phase !== 'general_preparation' ? [{
                reps: 4,
                work_duration_sec: 300,
                rest_duration_sec: 120,
                intensity: 'threshold'
            }] : undefined
        });

        // Wednesday: Easy
        sessions.push({
            id: `session_2`,
            day: 2,
            type: 'recovery',
            name: 'Recovery Run',
            description: 'Easy pace, aerobic maintenance',
            duration_min: 35,
            intensity: 'easy',
            key_workout: false
        });

        // Thursday: Moderate or VO2max
        sessions.push({
            id: `session_3`,
            day: 3,
            type: phase === 'specific_preparation' ? 'vo2max' : 'endurance',
            name: phase === 'specific_preparation' ? 'VO2max Intervals' : 'Steady Run',
            description: phase === 'specific_preparation' ? 'High intensity development' : 'Aerobic base',
            duration_min: isRecovery ? 40 : 55,
            intensity: phase === 'specific_preparation' ? 'hard' : 'moderate',
            key_workout: phase === 'specific_preparation',
            intervals: phase === 'specific_preparation' ? [{
                reps: 5,
                work_duration_sec: 180,
                rest_duration_sec: 180,
                intensity: 'hard'
            }] : undefined
        });

        // Friday: Rest or Easy
        if (!isRecovery && phase !== 'taper') {
            sessions.push({
                id: `session_4`,
                day: 4,
                type: 'recovery',
                name: 'Easy Run',
                description: 'Pre-long run legs',
                duration_min: 30,
                intensity: 'easy',
                key_workout: false
            });
        }

        // Saturday: Long Run (Key)
        sessions.push({
            id: `session_5`,
            day: 5,
            type: 'endurance',
            name: 'Long Run',
            description: 'Aerobic endurance, fat adaptation',
            duration_min: isRecovery ? 60 : (phase === 'general_preparation' ? 90 : 120),
            intensity: 'easy',
            key_workout: true
        });

        // Sunday: Rest
        // No session

        return sessions;
    }

    // --------------------------------------------------------------------------
    // FITNESS-FATIGUE MODEL
    // --------------------------------------------------------------------------

    /**
     * Calculate fitness-fatigue state using Banister model
     */
    calculateFitnessFatigue(trainingLog: { date: string; load: number }[]): FitnessFatigueState {
        const { fitness_time_constant, fatigue_time_constant } = FITNESS_FATIGUE_CONSTANTS;

        let fitness = 0;
        let fatigue = 0;

        const now = new Date();

        trainingLog.forEach(entry => {
            const entryDate = new Date(entry.date);
            const daysAgo = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

            // Exponential decay
            const fitnessDecay = Math.exp(-daysAgo / fitness_time_constant);
            const fatigueDecay = Math.exp(-daysAgo / fatigue_time_constant);

            fitness += entry.load * fitnessDecay;
            fatigue += entry.load * fatigueDecay;
        });

        // Normalize
        fitness = Math.round(fitness / fitness_time_constant);
        fatigue = Math.round(fatigue / fatigue_time_constant);

        const form = fitness - fatigue;
        const predicted_performance = Math.round(50 + form / 2); // Simplified

        return {
            fitness,
            fatigue,
            form,
            fitness_tau_days: fitness_time_constant,
            fatigue_tau_days: fatigue_time_constant,
            predicted_performance
        };
    }

    // --------------------------------------------------------------------------
    // TAPER GENERATION
    // --------------------------------------------------------------------------

    /**
     * Generate taper protocol for target event
     */
    generateTaperProtocol(
        daysToEvent: number,
        eventPriority: 'A' | 'B' | 'C'
    ): TaperProtocol {
        if (eventPriority === 'C' || daysToEvent < 7) {
            return {
                type: 'step',
                duration_days: Math.min(daysToEvent, 3),
                volume_reduction_percent: 30,
                intensity_maintained: true,
                frequency_reduction_percent: 0,
                phases: [
                    { name: 'Mini-Taper', days: 3, volume_percent: 70, intensity_percent: 100, focus: 'Maintain sharpness' }
                ]
            };
        }

        if (eventPriority === 'B' || daysToEvent < 14) {
            return {
                type: 'linear',
                duration_days: 7,
                volume_reduction_percent: 40,
                intensity_maintained: true,
                frequency_reduction_percent: 10,
                phases: [
                    { name: 'Reduction', days: 4, volume_percent: 60, intensity_percent: 100, focus: 'Volume drop' },
                    { name: 'Freshening', days: 3, volume_percent: 40, intensity_percent: 95, focus: 'Final preparation' }
                ]
            };
        }

        // A-race: Full optimal taper
        return OPTIMAL_TAPER;
    }

    // --------------------------------------------------------------------------
    // ANALYSIS
    // --------------------------------------------------------------------------

    /**
     * Analyze current periodization state
     */
    analyze(now: Date = new Date()): PeriodizationAnalysis {
        const macrocycle = this.macrocycle || this.loadSampleMacrocycle();

        // Find current mesocycle and microcycle
        const currentMeso = this.findCurrentMesocycle(macrocycle, now);
        const currentMicro = this.findCurrentMicrocycle(currentMeso, now);

        // Days to target
        const targetDate = new Date(macrocycle.target_event.date);
        const daysToTarget = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Fitness-fatigue
        const fitnessFatigue = this.calculateFitnessFatigue(this.trainingLog);

        // Taper protocol if close to event
        const taperProtocol = daysToTarget <= 21 ?
            this.generateTaperProtocol(daysToTarget, macrocycle.target_event.priority) : undefined;

        // Recommendations
        const recommendations = this.generateRecommendations(
            currentMeso,
            currentMicro,
            daysToTarget,
            fitnessFatigue
        );

        return {
            current_macrocycle: macrocycle,
            current_mesocycle: currentMeso,
            current_microcycle: currentMicro,
            days_to_target: daysToTarget,
            current_phase: currentMeso.type,
            fitness_fatigue: fitnessFatigue,
            taper_protocol: taperProtocol,
            recommendations,
            weekly_summary: this.getWeeklySummary(currentMicro),
            phase_progress: this.getPhaseProgress(currentMeso, currentMicro)
        };
    }

    /**
     * Generate periodization recommendations
     */
    private generateRecommendations(
        meso: Mesocycle,
        micro: Microcycle,
        daysToEvent: number,
        fitnessFatigue: FitnessFatigueState
    ): PeriodizationRecommendation[] {
        const recs: PeriodizationRecommendation[] = [];

        // Form-based recommendations
        if (fitnessFatigue.form < 0) {
            recs.push({
                type: 'recovery',
                priority: 'high',
                message: 'Fatigue exceeds fitness',
                action: 'Prioritize recovery this week',
                rationale: `Form is ${fitnessFatigue.form}, indicating accumulated fatigue`
            });
        }

        if (fitnessFatigue.form > 30 && daysToEvent > 14) {
            recs.push({
                type: 'volume',
                priority: 'medium',
                message: 'High form window',
                action: 'Consider a bigger week',
                rationale: 'Form is high, good opportunity for a loading block'
            });
        }

        // Taper recommendations
        if (daysToEvent <= 14) {
            recs.push({
                type: 'taper',
                priority: 'high',
                message: 'Taper phase active',
                action: 'Reduce volume by 40-50%, maintain intensity',
                rationale: 'Research shows optimal taper is 2 weeks with 50% volume reduction'
            });
        }

        // Phase transition
        if (micro.week_number === meso.weeks) {
            recs.push({
                type: 'phase_transition',
                priority: 'medium',
                message: 'End of mesocycle approaching',
                action: 'Plan recovery week and next phase',
                rationale: 'Transitions benefit from intentional recovery'
            });
        }

        return recs;
    }

    // --------------------------------------------------------------------------
    // HELPERS
    // --------------------------------------------------------------------------

    private addWeeks(date: Date, weeks: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + weeks * 7);
        return result;
    }

    private findCurrentMesocycle(macro: Macrocycle, now: Date): Mesocycle {
        for (const meso of macro.mesocycles) {
            const start = new Date(meso.start_date);
            const end = new Date(meso.end_date);
            if (now >= start && now <= end) {
                return meso;
            }
        }
        return macro.mesocycles[0];
    }

    private findCurrentMicrocycle(meso: Mesocycle, now: Date): Microcycle {
        for (const micro of meso.microcycles) {
            const start = new Date(micro.start_date);
            const end = new Date(start);
            end.setDate(end.getDate() + 7);
            if (now >= start && now <= end) {
                return micro;
            }
        }
        return meso.microcycles[0];
    }

    private getPhaseObjectives(type: MesocycleType): string[] {
        const objectives: Record<MesocycleType, string[]> = {
            general_preparation: [
                'Build aerobic base',
                'Develop movement efficiency',
                'Strengthen tendons and ligaments',
                'Establish training habits'
            ],
            specific_preparation: [
                'Develop race-specific fitness',
                'Increase threshold power',
                'Practice race nutrition',
                'Build mental resilience'
            ],
            pre_competition: [
                'Sharpen race pace',
                'Fine-tune tactics',
                'Test equipment',
                'Mental preparation'
            ],
            competition: [
                'Execute race plan',
                'Manage energy',
                'Stay present'
            ],
            taper: [
                'Allow super-compensation',
                'Maintain neuromuscular activation',
                'Rest and recover',
                'Mental visualization'
            ],
            transition: [
                'Physical recovery',
                'Mental refresh',
                'Cross-training',
                'Address injuries'
            ],
            accumulation: ['Volume accumulation', 'Work capacity'],
            transmutation: ['Intensity development', 'Lactate tolerance'],
            realization: ['Performance expression', 'Race readiness']
        };
        return objectives[type] || [];
    }

    private getVolumeTarget(type: MesocycleType): VolumeTarget {
        const targets: Record<MesocycleType, VolumeTarget> = {
            general_preparation: { weekly_hours: 10, session_count: 6, key_session_count: 2 },
            specific_preparation: { weekly_hours: 12, session_count: 6, key_session_count: 3 },
            pre_competition: { weekly_hours: 10, session_count: 5, key_session_count: 2 },
            competition: { weekly_hours: 6, session_count: 3, key_session_count: 1 },
            taper: { weekly_hours: 6, session_count: 4, key_session_count: 1 },
            transition: { weekly_hours: 4, session_count: 3, key_session_count: 0 },
            accumulation: { weekly_hours: 14, session_count: 7, key_session_count: 2 },
            transmutation: { weekly_hours: 10, session_count: 5, key_session_count: 3 },
            realization: { weekly_hours: 8, session_count: 4, key_session_count: 2 }
        };
        return targets[type] || targets.general_preparation;
    }

    private getIntensityDistribution(type: MesocycleType): IntensityDistribution {
        if (type === 'general_preparation' || type === 'transition') {
            return { ...INTENSITY_MODELS.pyramidal };
        }
        return { ...INTENSITY_MODELS.polarized };
    }

    private calculateWeekLoad(phase: MesocycleType, microType: MicrocycleType): number {
        const baseLoad = this.getVolumeTarget(phase).weekly_hours * 10;
        const multipliers: Record<MicrocycleType, number> = {
            loading: 1.2,
            development: 1.0,
            recovery: 0.6,
            competition: 0.5,
            taper: 0.5,
            deload: 0.5
        };
        return Math.round(baseLoad * multipliers[microType]);
    }

    private calculateWeekIntensity(phase: MesocycleType, microType: MicrocycleType): number {
        const baseIntensity = phase === 'specific_preparation' ? 75 :
            phase === 'taper' ? 85 : 65;
        return microType === 'recovery' ? baseIntensity - 10 : baseIntensity;
    }

    private getWeeklySummary(micro: Microcycle): WeeklySummary {
        const keySessions = micro.sessions.filter(s => s.key_workout).length;
        return {
            planned_volume_hours: micro.volume_load / 10,
            completed_volume_hours: micro.volume_load / 10 * 0.9, // Mock 90% adherence
            adherence_percent: 90,
            key_sessions_completed: keySessions,
            key_sessions_planned: keySessions,
            load_vs_plan: 'on_track'
        };
    }

    private getPhaseProgress(meso: Mesocycle, micro: Microcycle): PhaseProgress {
        return {
            current_week: micro.week_number,
            total_weeks: meso.weeks,
            percent_complete: Math.round((micro.week_number / meso.weeks) * 100),
            objectives_met: meso.objectives.slice(0, Math.floor(meso.objectives.length / 2)),
            objectives_remaining: meso.objectives.slice(Math.ceil(meso.objectives.length / 2)),
            readiness_for_next_phase: micro.week_number === meso.weeks ? 85 : 60
        };
    }

    /**
     * Calculate nutritional periodization strategy
     */
    static getNutritionalStrategy(
        profile: any, // UserProfile
        session: any, // Session
        context: { block: string; volume_hours: number; days_until_competition: number }
    ): any { // Returns NutritionalPeriodization

        const duration = session?.duration || 60;
        const intensity = session?.intensity || 'moderate';

        let carbsPerKg = 4;
        let giTarget = 'medium';

        // Basic Logic based on block and session
        if (context.block === 'intensification' || intensity === 'hard') {
            carbsPerKg = 6;
            giTarget = 'high';
        } else if (context.block === 'deload') {
            carbsPerKg = 3;
            giTarget = 'low';
        }

        const weight = profile?.weight || 70;
        const absoluteCarbs = Math.round(weight * carbsPerKg);

        return {
            training_block: context.block as any,
            session_type: session?.type || 'training',
            intensity_zone: intensity === 'easy' ? 2 : 4,
            duration_minutes: duration,
            carbs_per_kg_body_weight: carbsPerKg,
            carbs_absolute_grams: absoluteCarbs,
            protein_per_kg: 2.0,
            fat_per_kg: 1.0,
            gi_target: giTarget as any,
            rationale: `Adjusted for ${context.block} phase and ${intensity} session`
        };
    }

    // --------------------------------------------------------------------------
    // SAMPLE DATA
    // --------------------------------------------------------------------------

    loadSampleMacrocycle(): Macrocycle {
        const targetEvent: TargetEvent = {
            id: 'event_1',
            name: 'City Marathon',
            date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
            priority: 'A',
            event_type: 'race',
            performance_goal: {
                target_time: '3:30:00',
                process_goals: ['Negative split', 'Strong last 10K', 'Stay relaxed']
            }
        };

        // Generate sample training log
        this.trainingLog = [];
        for (let i = 60; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            // Vary load: base 50-80 with some rest days
            const isRest = date.getDay() === 0; // Sunday rest
            const load = isRest ? 0 : 50 + Math.random() * 30;
            this.trainingLog.push({ date: date.toISOString(), load: Math.round(load) });
        }

        return this.buildMacrocycle(targetEvent, 12, 'running');
    }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const periodizationEngine = new PeriodizationEngine();

/**
 * Convenience function for analysis
 */
export function analyzePeriodization(): PeriodizationAnalysis {
    return periodizationEngine.analyze();
}
