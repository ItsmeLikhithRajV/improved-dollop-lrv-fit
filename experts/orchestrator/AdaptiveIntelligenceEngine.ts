/**
 * Adaptive Intelligence Engine
 * 
 * The central brain that:
 * 1. Aggregates state from all analysis engines
 * 2. Applies decision rules based on context
 * 3. Generates prioritized, time-sensitive actions
 * 4. Learns from user patterns
 */

import {
    TemporalContext,
    SessionContext,
    PhysiologicalState,
    DecisionContext,
    UserPreferences,
    AdaptiveAction,
    AdaptiveIntelligenceOutput,
    Alert,
    TimelineSlot,
    ActionPriority,
    ActionCategory,
    TimeSensitivity,
    SAFETY_THRESHOLDS,
    TIME_WINDOWS
} from '../../types/adaptive-intelligence';

// Import all engines
import { analyzeHRV } from '../recovery/HRVAnalysisEngine';
import { analyzeLoad } from '../performance/LoadManagementEngine';
import { analyzeRecovery } from '../recovery/RecoveryMatrixEngine';
import { analyzeCircadian } from '../longevity/CircadianEngine';
import { analyzeFuel } from '../nutritionist/FuelWindowEngine';
import { analyzeSleep } from '../recovery/SleepArchitectureEngine';
import { analyzePeriodization } from '../performance/PeriodizationEngine';
import { discoverPatterns } from './PatternDiscoveryEngine';
import { evaluateFuelAction } from '../nutritionist/FuelActionEngine';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getTimeOfDay(hour: number): TemporalContext['time_of_day'] {
    if (hour < 5) return 'night';
    if (hour < 7) return 'early_morning';
    if (hour < 12) return 'morning';
    if (hour < 14) return 'midday';
    if (hour < 18) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
}

function generateId(): string {
    return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// CONTEXT BUILDERS
// ============================================================================

function buildTemporalContext(now: Date, preferences: UserPreferences): TemporalContext {
    const hour = now.getHours();

    // Parse wake/sleep times
    const [wakeHour] = preferences.wake_time.split(':').map(Number);
    const [sleepHour] = preferences.sleep_time.split(':').map(Number);

    const hoursSinceWake = hour >= wakeHour ? hour - wakeHour : 24 - wakeHour + hour;
    const hoursUntilSleep = hour < sleepHour ? sleepHour - hour : 24 - hour + sleepHour;

    return {
        current_time: now,
        time_of_day: getTimeOfDay(hour),
        hours_since_wake: hoursSinceWake,
        hours_until_sleep: hoursUntilSleep,
        day_of_week: now.getDay(),
        is_weekend: now.getDay() === 0 || now.getDay() === 6
    };
}

function buildPhysiologicalState(): PhysiologicalState {
    const hrv = analyzeHRV();
    const load = analyzeLoad();
    const recovery = analyzeRecovery();
    const circadian = analyzeCircadian();
    const fuel = analyzeFuel();
    const sleep = analyzeSleep();

    // Provide safe defaults when engines return null
    return {
        hrv: {
            current: hrv?.current?.rmssd || 0,
            zone: hrv?.zone || 'moderate',
            trend: hrv?.trend_7d || 'stable',
            recovery_readiness: hrv?.recovery_readiness || 0
        },
        load: {
            acwr: load?.acwr?.acwr_rolling || 0,
            zone: load?.acwr?.zone === 'low_risk' ? 'optimal' : (load?.acwr?.zone || 'optimal'),
            injury_risk: load?.injury_risk_level || 'low',
            recommended_intensity: load?.suggested_session_type === 'rest' ? 'rest' :
                load?.suggested_session_type === 'low_intensity' ? 'low' :
                    load?.suggested_session_type === 'moderate' ? 'moderate' : 'high'
        },
        recovery: {
            overall_score: recovery?.overall_recovery_score || 0,
            status: (recovery?.overall_status || 'fatigued') as 'recovered' | 'recovering' | 'fatigued' | 'overreached',
            weakest_system: recovery?.weakest_system || 'unknown',
            recommended_modalities: recovery?.recommended_modalities?.map(m => m.modality.name) || []
        },
        circadian: {
            phase: circadian?.current_phase?.phase || 'unknown',
            physical_performance: circadian?.current_phase?.physical_performance || 0,
            cognitive_performance: circadian?.current_phase?.cognitive_performance || 0,
            optimal_for_training: (circadian?.current_phase?.physical_performance || 0) >= 70
        },
        sleep: {
            last_night_quality: sleep?.current_night?.overall_quality_score || 0,
            debt_hours: sleep?.debt?.debt_7d || 0,
            architecture_quality: (sleep?.current_night?.overall_quality_score || 0) >= 80 ? 'optimal' :
                (sleep?.current_night?.overall_quality_score || 0) >= 60 ? 'good' :
                    (sleep?.current_night?.overall_quality_score || 0) >= 40 ? 'poor' : 'critical'
        },
        fuel: {
            glycogen_status: fuel?.glycogen_status?.status === 'supercompensated' ? 'full' : (fuel?.glycogen_status?.status as any || 'moderate'),
            hydration_status: fuel?.hydration_status?.status === 'well_hydrated' ? 'optimal' :
                fuel?.hydration_status?.status === 'adequate' ? 'adequate' :
                    fuel?.hydration_status?.status === 'slightly_low' ? 'low' : 'critical',
            current_window: fuel?.current_window?.name || null,
            protein_met: (fuel?.protein_distribution?.total_consumed_grams || 0) >= (fuel?.protein_distribution?.daily_target_grams || 1) * 0.8
        }
    };
}

// ============================================================================
// DECISION RULES
// ============================================================================

interface RuleResult {
    action: AdaptiveAction | null;
    alerts: Alert[];
}

/**
 * Safety Rules - Always evaluated first, can veto other actions
 */
function evaluateSafetyRules(ctx: DecisionContext): RuleResult {
    const { physiological: state, temporal } = ctx;
    const alerts: Alert[] = [];
    let action: AdaptiveAction | null = null;

    // Rule 1: Critical HRV - Mandatory rest
    if (state.hrv.current < SAFETY_THRESHOLDS.hrv_critical_floor) {
        action = {
            id: generateId(),
            title: '⚠️ Recovery Day Required',
            description: 'Your HRV indicates significant stress. Skip intense training today.',
            category: 'safety',
            priority: 'critical',
            time_sensitivity: 'immediate',
            time_of_day: temporal.current_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            icon: 'AlertTriangle',
            rationale: {
                primary_reason: `HRV at ${Math.round(state.hrv.current)}ms is critically low`,
                supporting_signals: ['Sympathetic nervous system overload', 'High injury risk'],
                science_brief: 'HRV below 30ms indicates autonomic imbalance requiring recovery',
                impact_summary: 'Prevents systemic breakdown and overtraining syndrome.'
            },
            dismissable: false,
            source_engine: 'HRVAnalysis',
            confidence: 0.95
        };
        alerts.push({
            id: 'alert_hrv_critical',
            severity: 'critical',
            title: 'Critical HRV Alert',
            message: 'Your body needs rest. Training today could lead to injury or illness.',
            action_id: action.id
        });
    }

    // Rule 2: ACWR Danger Zone
    if (state.load.acwr > SAFETY_THRESHOLDS.acwr_danger_ceiling) {
        action = action || {
            id: generateId(),
            title: 'Reduce Training Load',
            description: 'Your training load ratio is in the injury danger zone.',
            category: 'safety',
            priority: 'critical',
            time_sensitivity: 'today',
            rationale: {
                primary_reason: `ACWR at ${state.load.acwr.toFixed(2)} exceeds 1.5 danger threshold`,
                supporting_signals: [`Injury risk elevated ${state.load.injury_risk}`],
                science_brief: 'ACWR >1.5 increases injury risk by 2-4x (Gabbett research)'
            },
            dismissable: false,
            source_engine: 'LoadManagement',
            confidence: 0.9
        };
        alerts.push({
            id: 'alert_acwr_danger',
            severity: 'critical',
            title: 'Injury Risk Warning',
            message: 'Your training spike is too high. Add rest days to reduce injury risk.'
        });
    }

    // Rule 3: Sleep debt critical
    if (state.sleep.debt_hours > SAFETY_THRESHOLDS.sleep_debt_critical) {
        alerts.push({
            id: 'alert_sleep_debt',
            severity: 'warning',
            title: 'Significant Sleep Debt',
            message: `You've accumulated ${state.sleep.debt_hours.toFixed(1)} hours of sleep debt.`
        });
    }

    // Rule 4: Overreaching detected
    if (state.recovery.status === 'overreached') {
        action = action || {
            id: generateId(),
            title: 'Overreaching Intervention',
            description: 'Multiple signals indicate overreaching. Implement recovery block.',
            category: 'safety',
            priority: 'critical',
            time_sensitivity: 'today',
            rationale: {
                primary_reason: 'Overreaching status detected',
                supporting_signals: [
                    `Recovery score: ${state.recovery.overall_score}%`,
                    `HRV trend: ${state.hrv.trend}`,
                    `Weakest system: ${state.recovery.weakest_system}`
                ]
            },
            dismissable: false,
            source_engine: 'RecoveryMatrix',
            confidence: 0.85
        };
    }

    return { action, alerts };
}

/**
 * Circadian Rules - Time-sensitive recommendations
 */
function evaluateCircadianRules(ctx: DecisionContext): RuleResult {
    const { temporal, physiological: state, user_preferences: prefs } = ctx;
    const alerts: Alert[] = [];
    let action: AdaptiveAction | null = null;
    const hour = temporal.current_time.getHours();

    // Rule: Morning light exposure
    if (temporal.time_of_day === 'early_morning' || temporal.time_of_day === 'morning') {
        if (hour >= TIME_WINDOWS.morning_light.start && hour <= TIME_WINDOWS.morning_light.end) {
            action = {
                id: generateId(),
                title: 'Morning Light Exposure',
                description: 'Get 10+ minutes of outdoor light to set your circadian clock.',
                category: 'circadian',
                priority: state.circadian.phase === 'morning_alert' ? 'high' : 'medium',
                time_sensitivity: 'within_hour',
                time_of_day: '08:00', // Template time
                icon: 'Sun',
                optimal_time: temporal.current_time,
                duration_minutes: 10,
                rationale: {
                    primary_reason: 'Morning light anchors circadian rhythm',
                    supporting_signals: ['Enhances alertness', 'Improves sleep quality tonight'],
                    science_brief: 'Huberman: Morning sunlight triggers cortisol pulse and sets circadian phase',
                    impact_summary: 'Optimizes dopamine and melatonin production cycles.'
                },
                dismissable: true,
                snooze_options: [30, 60],
                source_engine: 'Circadian',
                confidence: 0.9
            };
        }
    }

    // Rule: Avoid caffeine before bed
    if (temporal.hours_until_sleep <= TIME_WINDOWS.no_caffeine_before_bed &&
        temporal.hours_until_sleep > 0) {
        alerts.push({
            id: 'alert_caffeine_cutoff',
            severity: 'info',
            title: 'Caffeine Cutoff',
            message: 'Consider avoiding caffeine to protect sleep quality.'
        });
    }

    // Rule: Wind down reminder
    if (temporal.hours_until_sleep <= 2 && temporal.hours_until_sleep > 0) {
        action = action || {
            id: generateId(),
            title: 'Begin Wind-Down Routine',
            description: 'Dim lights, avoid screens, prepare for sleep.',
            category: 'circadian',
            priority: 'medium',
            time_sensitivity: 'within_hour',
            duration_minutes: 60,
            rationale: {
                primary_reason: 'Sleep onset in ~2 hours',
                supporting_signals: ['Melatonin release begins', 'Blue light disrupts sleep']
            },
            dismissable: true,
            source_engine: 'Circadian',
            confidence: 0.8
        };
    }

    return { action, alerts };
}

/**
 * Training Rules - Session-aware recommendations
 */
function evaluateTrainingRules(ctx: DecisionContext): RuleResult {
    const { temporal, session, physiological: state } = ctx;
    const alerts: Alert[] = [];
    let action: AdaptiveAction | null = null;

    // If session is scheduled within 2 hours
    if (session.has_scheduled_session && session.next_session &&
        session.next_session.hours_until <= 2) {

        const sessionType = session.next_session.type;

        // Pre-session fuel
        if (session.next_session.hours_until >= 0.5 && session.next_session.hours_until <= 2) {
            action = {
                id: generateId(),
                title: 'Pre-Workout Fuel',
                description: `Session in ${Math.round(session.next_session.hours_until * 60)} minutes. Time for pre-workout nutrition.`,
                category: 'fuel',
                priority: 'high',
                time_sensitivity: 'within_30min',
                icon: 'Flame',
                duration_minutes: 15,
                rationale: {
                    primary_reason: 'Optimize performance for upcoming session',
                    supporting_signals: [
                        `Glycogen: ${state.fuel.glycogen_status}`,
                        `Session type: ${sessionType}`
                    ],
                    science_brief: 'Pre-workout carbs maintain blood glucose and spare muscle glycogen.',
                    impact_summary: 'Maintains higher power output for duration of session.'
                },
                specifics: {
                    fuel: {
                        macros: { carbs: 30, protein: 15 },
                        suggestions: ['Banana + Whey', 'Rice cakes + Honey']
                    }
                },
                dismissable: true,
                source_engine: 'FuelWindow',
                confidence: 0.85
            };
        }

        // Readiness check
        if (state.load.recommended_intensity === 'rest') {
            alerts.push({
                id: 'alert_training_not_recommended',
                severity: 'warning',
                title: 'Training Not Recommended',
                message: 'Your body signals suggest rest. Consider modifying or skipping today\'s session.'
            });
        }
    }

    // Post-session recovery window
    if (session.last_session && session.last_session.hours_since <= TIME_WINDOWS.post_workout_fuel) {
        action = action || {
            id: generateId(),
            title: 'Post-Workout Recovery',
            description: 'You\'re in the recovery window. Prioritize protein and rehydration.',
            category: 'fuel',
            priority: 'high',
            time_sensitivity: 'within_30min',
            rationale: {
                primary_reason: 'Anabolic window for muscle protein synthesis',
                supporting_signals: [`${session.last_session.hours_since.toFixed(1)}h since training`],
                science_brief: 'Post-exercise MPS elevated for 24-48h, but immediate nutrition optimizes response'
            },
            dismissable: true,
            source_engine: 'FuelWindow',
            confidence: 0.9
        };
    }

    return { action, alerts };
}

/**
 * Recovery Rules - Modality recommendations
 */
function evaluateRecoveryRules(ctx: DecisionContext): RuleResult {
    const { temporal, physiological: state, user_preferences: prefs } = ctx;
    const alerts: Alert[] = [];
    let action: AdaptiveAction | null = null;

    // If recovery score is low
    if (state.recovery.overall_score < 60) {
        const topModality = state.recovery.recommended_modalities[0];

        action = {
            id: generateId(),
            title: `Recovery: ${topModality || 'Active Recovery'}`,
            description: `Your recovery score is ${state.recovery.overall_score}%. Focus on restoration.`,
            category: 'recovery',
            priority: state.recovery.overall_score < 40 ? 'high' : 'medium',
            time_sensitivity: 'today',
            duration_minutes: 20,
            rationale: {
                primary_reason: `Weakest system: ${state.recovery.weakest_system}`,
                supporting_signals: state.recovery.recommended_modalities.slice(0, 3)
            },
            dismissable: true,
            source_engine: 'RecoveryMatrix',
            confidence: 0.8
        };
    }

    // Nap recommendation if tired and early enough
    const hour = temporal.current_time.getHours();
    if (state.sleep.debt_hours > 2 &&
        hour < TIME_WINDOWS.nap_latest &&
        hour > 12) {
        action = action || {
            id: generateId(),
            title: 'Power Nap',
            description: 'You have sleep debt. A 20-min nap can help.',
            category: 'recovery',
            priority: 'medium',
            time_sensitivity: 'within_hour',
            duration_minutes: 20,
            rationale: {
                primary_reason: `Sleep debt: ${state.sleep.debt_hours.toFixed(1)} hours`,
                supporting_signals: ['Enhances afternoon performance', 'Reduces cortisol']
            },
            dismissable: true,
            snooze_options: [30, 60, 120],
            source_engine: 'SleepArchitecture',
            confidence: 0.75
        };
    }

    return { action, alerts };
}

/**
 * Fuel Rules - Nutrition timing
 */
function evaluateFuelRules(ctx: DecisionContext): RuleResult {
    const { physiological: state, temporal, user_preferences: prefs } = ctx;
    const alerts: Alert[] = [];
    let action: AdaptiveAction | null = null;

    // Active fuel window
    if (state.fuel.current_window) {
        action = {
            id: generateId(),
            title: state.fuel.current_window,
            description: 'You\'re in an active nutrition window.',
            category: 'fuel',
            priority: 'medium',
            time_sensitivity: 'within_30min',
            rationale: {
                primary_reason: 'Time-sensitive nutrition opportunity',
                supporting_signals: [
                    `Glycogen: ${state.fuel.glycogen_status}`,
                    state.fuel.protein_met ? 'Protein on track' : 'Protein needed'
                ]
            },
            dismissable: true,
            source_engine: 'FuelWindow',
            confidence: 0.8
        };
    }

    // Hydration check
    if (state.fuel.hydration_status === 'low' || state.fuel.hydration_status === 'critical') {
        action = action || {
            id: generateId(),
            title: 'Hydrate Now',
            description: 'Your hydration is low. Drink 500ml with electrolytes.',
            category: 'fuel',
            priority: state.fuel.hydration_status === 'critical' ? 'high' : 'medium',
            time_sensitivity: 'immediate',
            rationale: {
                primary_reason: `Hydration status: ${state.fuel.hydration_status}`,
                supporting_signals: ['Affects performance', 'Impacts recovery']
            },
            dismissable: false,
            source_engine: 'FuelWindow',
            confidence: 0.9
        };
    }

    return { action, alerts };
}

// ============================================================================
// MAIN ENGINE
// ============================================================================

export class AdaptiveIntelligenceEngine {
    private preferences: UserPreferences;
    private lastSessionTime: Date | null = null;
    private nextSessionTime: Date | null = null;
    private nextSessionType: string | null = null;

    constructor() {
        // Default preferences
        this.preferences = {
            wake_time: '06:30',
            sleep_time: '22:30',
            training_days: [1, 2, 3, 5, 6], // Mon-Wed, Fri-Sat
            preferred_training_time: 'morning',
            has_sauna_access: true,
            has_cold_exposure_access: true,
            meditation_experience: 'beginner',
            dietary_restrictions: [],
            intermittent_fasting: false
        };

        // Mock last session (yesterday)
        this.lastSessionTime = new Date();
        this.lastSessionTime.setDate(this.lastSessionTime.getDate() - 1);
        this.lastSessionTime.setHours(7, 0, 0, 0);
    }

    /**
     * Set user preferences
     */
    setPreferences(prefs: Partial<UserPreferences>): void {
        this.preferences = { ...this.preferences, ...prefs };
    }

    /**
     * Set next scheduled session
     */
    setNextSession(time: Date, type: string): void {
        this.nextSessionTime = time;
        this.nextSessionType = type;
    }

    /**
     * Record a completed session
     */
    recordSession(time: Date, type: string): void {
        this.lastSessionTime = time;
    }

    /**
     * Build session context
     */
    private buildSessionContext(now: Date, sessions: any[] = []): SessionContext {
        // Use provided sessions if available, otherwise fallback to mock
        const upcomingSessions = sessions
            .filter(s => !s.completed)
            .sort((a, b) => (a.time_of_day || "").localeCompare(b.time_of_day || ""));

        const nextSess = upcomingSessions[0];

        const lastSess = sessions
            .filter(s => s.completed)
            .sort((a, b) => (b.time_of_day || "").localeCompare(a.time_of_day || ""))[0];

        const lastSession = lastSess ? {
            time: new Date(`${now.toDateString()} ${lastSess.time_of_day}`),
            type: lastSess.type,
            hours_since: (now.getTime() - new Date(`${now.toDateString()} ${lastSess.time_of_day}`).getTime()) / (1000 * 60 * 60),
            recovery_status: 'recovered' as const
        } : undefined;

        const nextSession = nextSess ? {
            time: new Date(`${now.toDateString()} ${nextSess.time_of_day}`),
            type: nextSess.type as any,
            duration_minutes: nextSess.duration_minutes || 60,
            intensity: nextSess.intensity as any,
            hours_until: (new Date(`${now.toDateString()} ${nextSess.time_of_day}`).getTime() - now.getTime()) / (1000 * 60 * 60)
        } : undefined;

        return {
            has_scheduled_session: !!nextSession,
            next_session: nextSession,
            last_session: lastSession
        };
    }

    /**
     * Main analysis - generates full adaptive intelligence output
     */
    analyze(sessions: any[] = [], now: Date = new Date()): AdaptiveIntelligenceOutput {
        // Build context
        const ctx: DecisionContext = {
            temporal: buildTemporalContext(now, this.preferences),
            session: this.buildSessionContext(now, sessions),
            physiological: buildPhysiologicalState(),
            user_goal: 'hybrid', // Would come from user state
            user_preferences: this.preferences
        };

        // Evaluate all rules
        const safetyResult = evaluateSafetyRules(ctx);
        const circadianResult = evaluateCircadianRules(ctx);
        const trainingResult = evaluateTrainingRules(ctx);
        const recoveryResult = evaluateRecoveryRules(ctx);
        const fuelResult = evaluateFuelRules(ctx);

        // Collect all actions
        const allActions: AdaptiveAction[] = [
            safetyResult.action,
            circadianResult.action,
            trainingResult.action,
            recoveryResult.action,
            fuelResult.action
        ].filter((a): a is AdaptiveAction => a !== null);

        // Collect all alerts
        const alerts: Alert[] = [
            ...safetyResult.alerts,
            ...circadianResult.alerts,
            ...trainingResult.alerts,
            ...recoveryResult.alerts,
            ...fuelResult.alerts
        ];

        // Sort by priority
        const priorityOrder: Record<ActionPriority, number> = {
            critical: 0,
            high: 1,
            medium: 2,
            low: 3,
            optional: 4
        };

        allActions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        // Commander action is the top priority
        const commanderAction = allActions[0] || this.getDefaultAction(ctx);

        // Calculate overall readiness
        const readinessScore = this.calculateReadiness(ctx.physiological);

        // Build timeline
        const timeline = this.buildTimeline(now, allActions, ctx);

        // Get patterns
        const patterns = discoverPatterns();

        return {
            state_summary: {
                overall_readiness: readinessScore,
                status: readinessScore >= 80 ? 'thriving' :
                    readinessScore >= 65 ? 'good' :
                        readinessScore >= 50 ? 'fair' :
                            readinessScore >= 35 ? 'caution' : 'rest',
                headline: this.generateHeadline(ctx, readinessScore),
                subheadline: this.generateSubheadline(ctx, commanderAction)
            },
            commander_action: commanderAction,
            upcoming_actions: allActions.slice(1, 4),
            all_actions: allActions,
            alerts,
            timeline,
            patterns_detected: patterns.patterns.slice(0, 3).map(p => p.title),
            personalization_notes: []
        };
    }

    private calculateReadiness(state: PhysiologicalState): number {
        const weights = {
            hrv: 0.25,
            load: 0.2,
            recovery: 0.25,
            sleep: 0.2,
            circadian: 0.1
        };

        const scores = {
            hrv: state.hrv.recovery_readiness,
            load: state.load.zone === 'optimal' ? 90 : state.load.zone === 'moderate_risk' ? 60 : 30,
            recovery: state.recovery.overall_score,
            sleep: state.sleep.last_night_quality,
            circadian: state.circadian.physical_performance
        };

        return Math.round(
            scores.hrv * weights.hrv +
            scores.load * weights.load +
            scores.recovery * weights.recovery +
            scores.sleep * weights.sleep +
            scores.circadian * weights.circadian
        );
    }

    private generateHeadline(ctx: DecisionContext, readiness: number): string {
        const { physiological: state, temporal } = ctx;

        if (state.recovery.status === 'overreached') {
            return 'Recovery Day - Your Body Needs Rest';
        }
        if (readiness >= 80) {
            return 'You\'re Ready to Perform';
        }
        if (readiness >= 65) {
            return 'Good to Go with Awareness';
        }
        if (readiness >= 50) {
            return 'Modify Today\'s Approach';
        }
        return 'Prioritize Recovery Today';
    }

    private generateSubheadline(ctx: DecisionContext, action: AdaptiveAction): string {
        return `Next: ${action.title}`;
    }

    private getDefaultAction(ctx: DecisionContext): AdaptiveAction {
        return {
            id: generateId(),
            title: 'Continue as Planned',
            description: 'No specific actions needed right now. Stay the course.',
            category: 'training',
            priority: 'low',
            time_sensitivity: 'flexible',
            rationale: {
                primary_reason: 'All systems nominal',
                supporting_signals: []
            },
            dismissable: true,
            source_engine: 'AdaptiveIntelligence',
            confidence: 0.5
        };
    }

    private buildTimeline(now: Date, actions: AdaptiveAction[], ctx: DecisionContext): TimelineSlot[] {
        const slots: TimelineSlot[] = [];
        const currentHour = now.getHours();

        // Build hourly slots for rest of day
        for (let h = currentHour; h < 23; h++) {
            const slotTime = new Date(now);
            slotTime.setHours(h, 0, 0, 0);

            // Find action for this hour
            const action = actions.find(a => {
                if (a.optimal_time) {
                    return a.optimal_time.getHours() === h;
                }
                return false;
            });

            slots.push({
                time: slotTime,
                label: `${h}:00`,
                type: action ? 'action' : 'rest',
                action,
                is_current: h === currentHour,
                is_optimal: ctx.physiological.circadian.optimal_for_training && h >= 9 && h <= 11
            });
        }

        return slots;
    }
}

// ============================================================================
// SINGLETON & EXPORTS
// ============================================================================

export const adaptiveIntelligence = new AdaptiveIntelligenceEngine();

export function getAdaptiveRecommendations(sessions: any[] = []): AdaptiveIntelligenceOutput {
    return adaptiveIntelligence.analyze(sessions);
}
