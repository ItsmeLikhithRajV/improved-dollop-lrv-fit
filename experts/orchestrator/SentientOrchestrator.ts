import { GlobalState, UserProfile, Session, TimelineProtocol } from "../../types";
import { OrchestratorV7, ActionCandidate as V7Candidate } from "./orchestratorV7";
import { LongevityProtocolEngine } from "../longevity/longevityProtocolEngine";
import { PerformanceLabsEngine } from "../performance/performanceLabsEngine";
import { MindEngine } from "../mental/engines/mindEngine";
import { FuelEngine } from "../../features/fuel/logic/fuelEngine";
import { RedDayEngine } from '../performance/redDayEngine';
import { LearningEngine } from './learningEngine';
import { createExpertContext, ExpertOpinion, ActionCandidate as ExpertActionCandidate } from "../types";
import { nutritionistExpert } from "../nutritionist/NutritionistExpert";
import { recoveryExpert } from "../recovery/RecoveryExpert";

import {
    OrchestratorState,
    OrchestratorContext,
    ActionRecommendation,
    PriorityScore
} from './types';

import {
    getGoalAwareRecoverySuggestions,
    getGoalAwareFuelRecommendations,
    getGoalAwareActionPriorities
} from "./goalAwareHooks";
// import { DEFAULT_USER_GOAL } from '../../types/goals'; // If missing, we'll mock it or find correct path

import * as SuggestionEngine from "./suggestionEngine";
import { SessionAwareScheduler, DEFAULT_PATTERNS } from "../performance/SessionAwareScheduler";
import { generateUnifiedProtocol, UnifiedAction } from "../longevity/UnifiedTimelineProtocolEngine";
import { AdaptiveTimelineEngine, ScheduledAction } from "../longevity/AdaptiveTimelineEngine";

// Mock DEFAULT_USER_GOAL if not found
const DEFAULT_USER_GOAL = {
    primary: 'longevity',
    secondary: [],
    priority: {},
    setAt: Date.now()
} as any;

/**
 * SENTIENT ORCHESTRATOR - THE "ONE TRUE SENTIENT"
 * 
 * V2 UPGRADE:
 * - Time-awareness (circadian rhythm, hours since wake/meal)
 * - Engine delegation (getCandidates from each engine)
 * - Smart icon mapping
 * - Alert fatigue prevention
 * 
 * Integrates:
 * 1. Longevity (Baseline Health)
 * 2. Performance (Sport Goals)
 * 3. Mindspace (Neural State)
 * 4. Fuel (Metabolic State)
 * 
 * Output:
 * - Master Timeline
 * - Active Commander Directive
 */
export class SentientOrchestrator {

    /**
     * GENERATE MASTER TIMELINE
     * Merges all engine outputs into a coherent day plan.
     */
    static generateMasterTimeline(
        state: GlobalState,
        sessions: Session[],
        profile: UserProfile
    ): TimelineProtocol[] {
        // 1. Base Layer: Longevity & Routine
        const longevityPlan = generateUnifiedProtocol(sessions, {
            goal: profile.user_goal?.primary || 'longevity',
            weight_kg: profile.weight,
            wake_time: 7 // default
        });

        // Convert UnifiedDayProtocol actions to TimelineProtocol
        const baseProtocols: TimelineProtocol[] = longevityPlan.urgent_actions.map(action => ({
            id: action.id,
            category: "fuel", // "fuel" | "sleep" | "training" ...
            title: action.title,
            icon: action.emoji,
            description: 'Longevity Protocol',
            time_of_day: action.window_start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            duration_minutes: 15, // Default
            priority: action.priority > 85 ? 'critical' : action.priority > 65 ? 'high' : 'medium',
            rationale_string: "Base longevity requirement",
            // RichProtocol Requirements
            variant: 'rich',
            rationale: {
                primary_reason: action.rationale,
                supporting_signals: [],
                science_brief: action.rationale,
                impact_summary: 'Sets circadian rhythm'
            },
            longevity_focus: 'Base Protocol',
            tailoring_reason: 'Base protocol',
            specifics: {}
        }));

        // 2. Recommendations Layer: Ask all engines for "Candidates"
        const candidates = this.gatherCandidates(state, profile);
        const urgentCandidates = candidates.filter(c => c.urgency_score > 75);

        // 2.5 Red Day Override
        if (RedDayEngine.isRedDay(state, profile)) {
            urgentCandidates.unshift({
                id: 'red_day_alert',
                engine: 'recovery',
                name: 'RED DAY DETECTED',
                description: 'Systemic Fatigue High. Reduce Volume.',
                urgency_score: 100,
                enablement_score: 100,
                duration_minutes: 0,
                rationale: 'Red Day detected',
                impact_if_done: 'Prevents burnout',
                impact_if_skipped: 'High injury risk',
                protocol: 'REST'
            });
        }

        // Convert urgent candidates to TimelineProtocol
        const recommendationProtocols: TimelineProtocol[] = urgentCandidates.map(c => ({
            id: c.id,
            category: 'recovery', // simplified
            title: c.name,
            icon: '⚡',
            description: c.description,
            time_of_day: 'Any',
            duration_minutes: c.duration_minutes,
            priority: 'high',
            rationale_string: c.rationale,
            variant: 'rich',
            is_completed: false,
            // RichProtocol Fields
            rationale: {
                primary_reason: c.rationale,
                supporting_signals: [],
                science_brief: c.rationale,
                impact_summary: c.impact_if_done
            },
            longevity_focus: c.engine === 'recovery' ? 'Recovery' : 'Performance',
            tailoring_reason: 'Urgent active command',
            specifics: {}
        }));

        // 3. Merge & Dedup
        const allIds = new Set<string>();
        const merged: TimelineProtocol[] = [];

        for (const p of [...recommendationProtocols, ...baseProtocols]) {
            if (!allIds.has(p.id)) {
                allIds.add(p.id);
                merged.push(p);
            }
        }

        return merged.sort((a, b) => this.parseTime(a.time_of_day) - this.parseTime(b.time_of_day));
    }



    private static parseTime(timeString: string): number {
        if (timeString === 'Any') return 24 * 60; // Put 'Any' at the end
        const [hourStr, minuteStr] = timeString.split(':');
        return parseInt(hourStr) * 60 + parseInt(minuteStr);
    }

    /**
     * DETERMINE ACTIVE COMMAND
     * The single most important thing to do RIGHT NOW.
     * Includes time-awareness and goal-awareness for context-appropriate recommendations.
     */
    static determineActiveCommand(state: GlobalState, profile: UserProfile): V7Candidate | null {
        const candidates = this.gatherCandidates(state, profile);

        if (candidates.length === 0) return null;

        // Apply time-based urgency modifiers
        const now = new Date();
        const hour = now.getHours();
        const timeContext = this.getTimeContext(hour);
        const userGoal = state.user_profile?.user_goal || DEFAULT_USER_GOAL;

        const adjusted = candidates.map(c => ({
            ...c,
            urgency_score: this.applyTimeModifier(c, timeContext, hour)
        }));

        // Sort by V7 Priority Score (Urgency x Enablement)
        const sorted = adjusted.sort((a, b) => {
            // Check if urgency_score exists (it should for V7Candidate)
            const scoreA = OrchestratorV7.calculatePriorityScore(a.urgency_score || 0, a.enablement_score || 0);
            const scoreB = OrchestratorV7.calculatePriorityScore(b.urgency_score || 0, b.enablement_score || 0);
            return scoreB - scoreA;
        });

        const topCandidate = sorted[0];

        // Enhance rationale with multi-factor "Why" explanation
        if (topCandidate) {
            const whyFactors: string[] = [];

            // Goal context
            if (topCandidate.id.startsWith('goal_')) {
                whyFactors.push(`Aligned with your ${userGoal.primary.replace(/_/g, ' ')} goal`);
            }

            // Time context
            whyFactors.push(`Optimal for ${timeContext} (${hour}:00)`);

            // State context
            const readiness = state.mindspace?.readiness_score || 50;
            if (readiness < 50) {
                whyFactors.push(`Readiness is low (${readiness}%) - recovery prioritized`);
            }

            // RedDay context
            if (topCandidate.id.startsWith('red_')) {
                whyFactors.push('Fatigue signal detected - address before training');
            }

            // Build enhanced rationale
            topCandidate.rationale = `${topCandidate.rationale || topCandidate.description}\n\nWhy now:\n• ${whyFactors.join('\n• ')}`;
        }

        return topCandidate;
    }

    /**
     * GET TIME CONTEXT
     * Determines current phase of day for circadian-aware recommendations
     */
    private static getTimeContext(hour: number): 'morning' | 'midday' | 'afternoon' | 'evening' | 'night' {
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 14) return 'midday';
        if (hour >= 14 && hour < 18) return 'afternoon';
        if (hour >= 18 && hour < 22) return 'evening';
        return 'night';
    }

    /**
     * APPLY TIME MODIFIER
     * Adjusts urgency based on circadian appropriateness
     */
    private static applyTimeModifier(
        candidate: V7Candidate,
        timeContext: string,
        hour: number
    ): number {
        let modifier = 0;

        // Handle missing engine/urgency gracefully
        if (!candidate.engine || typeof candidate.urgency_score !== 'number') return 0;

        // Fuel urgency increases in morning (fasted) and around meal times
        if (candidate.engine === 'fuel') {
            if (timeContext === 'morning' && hour < 9) modifier += 15; // Pre-breakfast boost
            if (hour >= 11 && hour <= 13) modifier += 10; // Lunch window
            if (hour >= 17 && hour <= 19) modifier += 10; // Dinner window
        }

        // Mindspace interventions more urgent in work hours
        if (candidate.engine === 'mindspace') {
            if (hour >= 9 && hour <= 17) modifier += 10; // Work hours
            if (timeContext === 'night') modifier -= 20; // Don't stress at night
        }

        // Recovery suggestions less urgent during peak performance hours
        if (candidate.engine === 'recovery') {
            if (timeContext === 'afternoon') modifier -= 10; // Training time
            if (timeContext === 'evening') modifier += 15; // Recovery time
            if (timeContext === 'night') modifier += 20; // Optimal recovery
        }

        // Performance alerts less relevant at night
        if (candidate.engine === 'performance') {
            if (timeContext === 'night') modifier -= 30;
            if (timeContext === 'morning') modifier += 5;
        }

        return Math.max(0, Math.min(100, candidate.urgency_score + modifier));
    }

    /**
     * GATHER CANDIDATES FROM ALL ENGINES
     * Delegates to individual engine getCandidates when available,
     * falls back to threshold-based logic otherwise
     */
    private static gatherCandidates(state: GlobalState, profile: UserProfile): V7Candidate[] {
        let candidates: V7Candidate[] = [];

        const now = new Date();
        const hour = now.getHours();
        const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
        const sessions = state.timeline?.sessions || [];

        // 1. MINDSPACE CANDIDATES (Mental Coach)
        candidates.push(...this.getMindspaceCandidates(state, hour));

        // 2. FUEL CANDIDATES (Nutritionist - Reactive)
        candidates.push(...this.getFuelCandidates(state, profile, hour));

        // 3. MEAL CANDIDATES (Nutritionist - Proactive) ← NEW
        candidates.push(...this.getMealCandidates(state, profile, hour, sessions));

        // 4. LONGEVITY CANDIDATES (Longevity Expert) ← NEW
        candidates.push(...this.getLongevityCandidates(state, profile, sessions));

        // 5. RECOVERY / SLEEP CANDIDATES (Recovery Expert)
        candidates.push(...this.getRecoveryCandidates(state, hour));

        // 6. PERFORMANCE CANDIDATES (Performance Coach)
        candidates.push(...this.getPerformanceCandidates(state));

        // 7. TIME-BASED CONTEXTUAL CANDIDATES
        candidates.push(...this.getTimeBasedCandidates(state, hour));

        // 8. GOAL-AWARE CANDIDATES
        candidates.push(...this.getGoalAwareCandidates(state, profile, timeOfDay));

        // 9. RED DAY SIGNAL CANDIDATES
        candidates.push(...this.getRedDaySignalCandidates(state, profile));

        // 10. MISSION SUGGESTION CANDIDATES (ADAPTIVE LEARNING)
        candidates.push(...this.getMissionSuggestionCandidates(state));

        // 11. STATE-REACTIVE CANDIDATES (NAP, STRESS RELIEF)
        candidates.push(...this.getStateReactiveCandidates(state, hour));

        // 10. LEARNING ENGINE ADJUSTMENTS
        // Adjust urgency scores based on action effectiveness for this user
        candidates = this.applyLearningAdjustments(candidates, state);

        // 11. DEFERRAL CHECK
        // Filter out candidates that should be deferred to another time
        candidates = this.applyDeferralLogic(candidates, hour);

        return candidates;
    }

    /**
     * STATE-REACTIVE CANDIDATES
     * Detects fatigue, stress, and suggests immediate interventions
     */
    private static getStateReactiveCandidates(state: GlobalState, hour: number): V7Candidate[] {
        const recommendations = SessionAwareScheduler.getStateReactiveRecommendations(state, hour);

        return recommendations.map(rec => ({
            id: `reactive_${rec.action.replace(/\s/g, '_').toLowerCase()}`,
            engine: 'recovery' as const,
            name: `⚡ ${rec.action}`,
            description: rec.reason,
            urgency_score: rec.urgency,
            enablement_score: 95,
            duration_minutes: 20,
            rationale: rec.reason,
            impact_if_done: 'Immediate state improvement',
            impact_if_skipped: 'Fatigue may compound',
            protocol: rec.action
        }));
    }

    /**
     * DEFERRAL LOGIC
     * Removes candidates inappropriate for current time window
     * Adds deferred versions for tomorrow
     */
    private static applyDeferralLogic(
        candidates: V7Candidate[],
        hour: number
    ): V7Candidate[] {
        const filtered: V7Candidate[] = [];

        for (const candidate of candidates) {
            const deferral = SessionAwareScheduler.shouldDeferAction(
                { id: candidate.id, category: candidate.engine },
                hour
            );

            if (deferral.shouldDefer) {
                // Don't add now - silently defer
                // In future: add to "tomorrow" queue
                console.log(`[DEFER] ${candidate.name}: ${deferral.reason}`);
            } else {
                filtered.push(candidate);
            }
        }

        return filtered;
    }

    /**
     * MISSION SUGGESTION CANDIDATES
     * Uses the suggestionEngine to generate adaptive mission-level suggestions
     * based on learned user preferences and state analysis
     */
    private static getMissionSuggestionCandidates(state: GlobalState): V7Candidate[] {
        const candidates: V7Candidate[] = [];

        try {
            // 6. Learning System / Suggestion Engine
            const learningState = SuggestionEngine.loadLearningState();
            const suggestions = SuggestionEngine.generateSuggestions(state, learningState);

            // Filter out suppressed
            const activeSuggestions = suggestions.filter(s => !SuggestionEngine.shouldSuppress(s.type, learningState));

            // Auto-apply if needed (mock logic)
            // activeSuggestions.forEach(s => { if (SuggestionEngine.shouldAutoApply(s.type, learningState)) ... })

            activeSuggestions.forEach(suggestion => {
                // Skip if should auto-apply (high implement rate)
                if (SuggestionEngine.shouldAutoApply(suggestion.type, learningState)) {
                    return; // Already auto-applied
                }

                const urgency = suggestion.type === 'taper' ? 90 :
                    suggestion.type === 'deload' ? 85 :
                        suggestion.type === 'plateau_break' ? 75 :
                            suggestion.type === 'phase_transition' ? 70 : 60;

                candidates.push({
                    id: `mission_${suggestion.id}`,
                    engine: 'performance',
                    name: `🎯 ${suggestion.title}`,
                    description: suggestion.impact,
                    urgency_score: urgency,
                    enablement_score: 80,
                    duration_minutes: 0,
                    rationale: suggestion.reasoning,
                    impact_if_done: suggestion.impact,
                    impact_if_skipped: 'May delay progress or risk overtraining',
                    protocol: `Mission: ${suggestion.type}`
                });
            });
        } catch (e) {
            console.warn('Failed to generate mission suggestions:', e);
        }

        return candidates;
    }

    /**
     * GOAL-AWARE CANDIDATES
     * Generates candidates based on user's primary goal
     */
    private static getGoalAwareCandidates(
        state: GlobalState,
        profile: UserProfile,
        timeOfDay: 'morning' | 'afternoon' | 'evening'
    ): V7Candidate[] {
        const candidates: V7Candidate[] = [];
        const userGoal = state.user_profile?.user_goal || DEFAULT_USER_GOAL;

        // Get goal-prioritized actions
        const goalActions = getGoalAwareActionPriorities(userGoal, {
            timeOfDay,
            currentFuelScore: state.fuel?.fuel_score || 50,
            currentRecoveryScore: state.recovery?.recovery_score || 50
        });

        goalActions.forEach(ga => {
            candidates.push({
                id: `goal_${ga.action.replace(/\s/g, '_')}`,
                engine: ga.source === 'training' ? 'performance' : ga.source as 'recovery' | 'fuel' | 'mindspace' | 'performance',
                name: ga.action,
                description: `${ga.reason} (Goal: ${userGoal.primary.replace(/_/g, ' ')})`,
                urgency_score: ga.priority,
                enablement_score: 80,
                duration_minutes: 15,
                rationale: `Prioritized for your ${userGoal.primary.replace(/_/g, ' ')} goal`,
                impact_if_done: 'Supports goal achievement',
                impact_if_skipped: 'May slow progress',
                protocol: ga.action
            });
        });

        // Add goal-specific recovery if recovery is low
        if ((state.recovery?.recovery_score || 50) < 60) {
            const goalRecovery = getGoalAwareRecoverySuggestions(userGoal, undefined, 2);
            goalRecovery
                .filter(r => r.priority === 'essential')
                .forEach(r => {
                    candidates.push({
                        id: `goal_recovery_${r.modality}`,
                        engine: 'recovery',
                        name: r.modality.replace(/_/g, ' '),
                        description: r.goalBenefit,
                        urgency_score: 75,
                        enablement_score: 85,
                        duration_minutes: parseInt(r.duration) || 20,
                        rationale: `Essential for ${userGoal.primary.replace(/_/g, ' ')} goal`,
                        impact_if_done: r.goalBenefit,
                        impact_if_skipped: 'Recovery may be suboptimal',
                        protocol: `${r.modality}: ${r.duration}, ${r.frequency}`
                    });
                });
        }

        return candidates;
    }

    /**
     * RED DAY SIGNAL CANDIDATES
     * Surfaces all individual fatigue signals, not just binary isRedDay
     */
    private static getRedDaySignalCandidates(state: GlobalState, profile: UserProfile): V7Candidate[] {
        const candidates: V7Candidate[] = [];

        // Get full assessment with all signals
        const assessment = RedDayEngine.assess(state, profile);

        // Surface each individual signal as a candidate
        assessment.signals.forEach(signal => {
            const urgency = signal.severity === 'critical' ? 95 :
                signal.severity === 'high' ? 85 :
                    signal.severity === 'moderate' ? 70 : 55;

            candidates.push({
                id: `red_signal_${signal.id}`,
                engine: 'recovery',
                name: `⚠️ ${signal.label}`,
                description: signal.rationale,
                urgency_score: urgency,
                enablement_score: 90,
                duration_minutes: 0,
                rationale: signal.rationale,
                impact_if_done: 'Address fatigue signal',
                impact_if_skipped: 'Risk of overtraining or injury',
                protocol: 'See Recovery Tab for protocol'
            });
        });

        // If true Red Day, add the action plan items
        if (assessment.isRedDay && assessment.actionPlan.length > 0) {
            assessment.actionPlan.slice(0, 3).forEach((action, i) => {
                candidates.push({
                    id: `red_action_${i}`,
                    engine: 'recovery',
                    name: `🔴 ${action}`,
                    description: 'Red Day Protocol',
                    urgency_score: 98 - i,
                    enablement_score: 95,
                    duration_minutes: 30,
                    rationale: assessment.narrativeSummary,
                    impact_if_done: 'Prevent burnout and injury',
                    impact_if_skipped: 'High risk of overtraining',
                    protocol: action
                });
            });
        }

        return candidates;
    }

    /**
     * LEARNING ENGINE ADJUSTMENTS
     * Adjusts candidate urgency based on what works for this specific user
     */
    private static applyLearningAdjustments(
        candidates: V7Candidate[],
        state: GlobalState
    ): V7Candidate[] {
        // This would use historical action outcomes to adjust priority
        // For actions that consistently help this user, boost urgency
        // For actions they ignore or that don't help, reduce urgency

        // Placeholder: In production, this would call:
        // const effectiveness = LearningEngine.scoreActionEffectiveness(outcomes);

        // For now, apply time-based personal baseline check
        // If readiness is below personal baseline, boost recovery actions
        const readiness = state.mindspace?.readiness_score || 50;
        const avgReadiness = 65; // Would come from LearningEngine.calculatePersonalBaseline

        if (readiness < avgReadiness - 10) {
            // User is significantly below their personal baseline
            candidates = candidates.map(c => {
                if (c.engine === 'recovery') {
                    return { ...c, urgency_score: Math.min(100, c.urgency_score + 15) };
                }
                if (c.engine === 'performance') {
                    return { ...c, urgency_score: Math.max(0, c.urgency_score - 20) };
                }
                return c;
            });
        }

        return candidates;
    }

    /**
     * MINDSPACE CANDIDATES
     */
    private static getMindspaceCandidates(state: GlobalState, hour: number): V7Candidate[] {
        const candidates: V7Candidate[] = [];
        const { stress, mood, state_vector } = state.mindspace;

        // Emergency decompression
        if (stress > 7) {
            candidates.push({
                id: 'mind_emergency',
                engine: 'mindspace',
                name: 'Emergency Decompression',
                description: 'Neural overload detected.',
                urgency_score: 90,
                enablement_score: 85,
                duration_minutes: 5,
                rationale: `Stress at ${stress}/10`,
                impact_if_done: 'Restores vagal tone immediately.',
                impact_if_skipped: 'Cognitive crash risk, poor decisions.',
                protocol: 'Box Breathing (4-4-4-4)'
            });
        }

        // Moderate stress with low mood
        if (stress > 5 && mood < 5) {
            candidates.push({
                id: 'mind_reset',
                engine: 'mindspace',
                name: 'Neural Reset',
                description: 'Negative state detected.',
                urgency_score: 70,
                enablement_score: 75,
                duration_minutes: 10,
                rationale: `Stress ${stress}/10 + Mood ${mood}/10`,
                impact_if_done: 'Breaks negative thought patterns.',
                impact_if_skipped: 'Rumination risk.',
                protocol: 'Gratitude Journal or Walk'
            });
        }

        // Focus issues during work hours
        if (state_vector?.attentional_stability < 60 && hour >= 9 && hour <= 17) {
            candidates.push({
                id: 'mind_focus',
                engine: 'mindspace',
                name: 'Focus Protocol',
                description: 'Attention scattered.',
                urgency_score: 65,
                enablement_score: 80,
                duration_minutes: 3,
                rationale: `Attention stability at ${state_vector?.attentional_stability}%`,
                impact_if_done: 'Sharpens focus for 90 minutes.',
                impact_if_skipped: 'Productivity loss.',
                protocol: 'NSDR or Focus Music'
            });
        }

        return candidates;
    }

    /**
     * FUEL CANDIDATES
     */
    private static getFuelCandidates(state: GlobalState, profile: UserProfile, hour: number): V7Candidate[] {
        const candidates: V7Candidate[] = [];
        const { fuel_score, hydration_liters, caffeine_mg } = state.fuel;

        // Critical fuel
        if (fuel_score < 40) {
            candidates.push({
                id: 'fuel_critical',
                engine: 'fuel',
                name: 'Rapid Glucose Restore',
                description: 'System running on fumes.',
                urgency_score: 85,
                enablement_score: 70,
                duration_minutes: 15,
                rationale: `Fuel Score at ${fuel_score}%`,
                impact_if_done: 'Prevents catabolism, restores energy.',
                impact_if_skipped: 'Performance degradation, muscle loss.',
                protocol: 'Fruit + Whey (40g carbs, 25g protein)'
            });
        }

        // Low fuel warning
        if (fuel_score >= 40 && fuel_score < 60) {
            candidates.push({
                id: 'fuel_low',
                engine: 'fuel',
                name: 'Top Up Fuel',
                description: 'Fuel levels suboptimal.',
                urgency_score: 55,
                enablement_score: 65,
                duration_minutes: 20,
                rationale: `Fuel Score at ${fuel_score}%`,
                impact_if_done: 'Optimizes substrate availability.',
                impact_if_skipped: 'May feel sluggish later.',
                protocol: 'Balanced snack (carbs + protein)'
            });
        }

        // Dehydration
        if (hydration_liters < 1.5 && hour >= 10) {
            const urgency = hour > 14 ? 75 : 60;
            candidates.push({
                id: 'fuel_hydrate',
                engine: 'fuel',
                name: 'Hydration Alert',
                description: `Only ${hydration_liters}L consumed today.`,
                urgency_score: urgency,
                enablement_score: 90,
                duration_minutes: 2,
                rationale: `Hydration at ${hydration_liters}L (target: 3L)`,
                impact_if_done: 'Maintains cognitive function.',
                impact_if_skipped: '3% dehydration = 25% performance drop.',
                protocol: 'Drink 500ml water now'
            });
        }

        // Caffeine timing (don't suggest after 2pm)
        if (caffeine_mg < 100 && hour >= 6 && hour <= 14 && state.mindspace.state_vector?.attentional_stability < 70) {
            candidates.push({
                id: 'fuel_caffeine',
                engine: 'fuel',
                name: 'Strategic Caffeine',
                description: 'Energy dip detected.',
                urgency_score: 50,
                enablement_score: 85,
                duration_minutes: 5,
                rationale: 'Low caffeine + low focus',
                impact_if_done: 'Adenosine blocked, alertness restored.',
                impact_if_skipped: 'Afternoon slump risk.',
                protocol: '100-200mg caffeine (coffee/tea)'
            });
        }

        return candidates;
    }

    /**
     * PROACTIVE MEAL CANDIDATES (NEW)
     * Schedules breakfast, lunch, dinner, and training-aware meals
     */
    private static getMealCandidates(
        state: GlobalState,
        profile: UserProfile,
        hour: number,
        sessions: Session[]
    ): V7Candidate[] {
        const candidates: V7Candidate[] = [];

        // Get user meal preferences or defaults (cast to any for extended profile fields)
        const profileExt = profile as any;
        const firstMealHour = parseInt(profileExt?.first_meal_time?.split(':')[0] || '8');
        const lastMealHour = parseInt(profileExt?.last_meal_time?.split(':')[0] || '20');
        const wakeHour = parseInt(profileExt?.typical_wake_time?.split(':')[0] || '7');

        // Find training sessions today
        const todayTraining = sessions.find(s => s.time_of_day);
        const trainingHour = todayTraining
            ? parseInt(todayTraining.time_of_day?.split(':')[0] || '0')
            : null;

        // Check if user goal is fat loss (cast to string for safety)
        const goalStr = String(profile?.user_goal || '');
        const isFatLossGoal = goalStr.includes('fat') || goalStr.includes('weight');

        // BREAKFAST (within 1 hour of first meal time)
        if (hour >= firstMealHour - 0.5 && hour <= firstMealHour + 1.5) {
            candidates.push({
                id: 'meal_breakfast',
                engine: 'fuel',
                name: '🍳 Breakfast',
                description: 'First meal - protein + complex carbs to fuel your day',
                urgency_score: hour >= firstMealHour ? 70 : 50,
                enablement_score: 85,
                duration_minutes: 30,
                rationale: `Optimal breakfast window: ${firstMealHour}:00 - ${firstMealHour + 1}:30`,
                impact_if_done: 'Stable blood sugar, sustained morning energy',
                impact_if_skipped: 'Energy crash by 10am, impaired focus',
                protocol: isFatLossGoal
                    ? 'High protein, moderate carbs (30g P, 25g C)'
                    : 'Balanced macro meal (30g P, 40g C, 15g F)'
            });
        }

        // PRE-TRAINING FUEL (90-120min before training)
        if (trainingHour && hour >= trainingHour - 2 && hour < trainingHour - 0.5) {
            candidates.push({
                id: 'meal_pre_training',
                engine: 'fuel',
                name: '⚡ Pre-Training Fuel',
                description: 'Light meal to fuel your upcoming session',
                urgency_score: 80,
                enablement_score: 90,
                duration_minutes: 20,
                rationale: `Training in ${Math.round((trainingHour - hour) * 60)} minutes`,
                impact_if_done: 'Glycogen topped up, optimal energy for training',
                impact_if_skipped: 'Reduced performance, early fatigue',
                protocol: 'Easily digestible carbs + small protein (40g C, 15g P)'
            });
        }

        // POST-TRAINING NUTRITION (within 30-90min after training)
        const trainingEndHour = trainingHour ? trainingHour + 1 : null; // Assume 1hr session
        if (trainingEndHour && hour >= trainingEndHour && hour <= trainingEndHour + 1.5) {
            candidates.push({
                id: 'meal_post_training',
                engine: 'fuel',
                name: '🥤 Post-Training Nutrition',
                description: 'Protein + carbs for recovery within anabolic window',
                urgency_score: 90, // Critical timing!
                enablement_score: 95,
                duration_minutes: 15,
                rationale: 'Anabolic window - maximize muscle protein synthesis',
                impact_if_done: 'Optimal recovery, muscle repair begins immediately',
                impact_if_skipped: 'Missed anabolic window, slower recovery',
                protocol: 'Protein shake + fast carbs (40g P, 50g C)'
            });
        }

        // LUNCH (12:00-14:00, unless training conflicts)
        const lunchHour = 12;
        const lunchConflict = trainingHour && trainingHour >= 11 && trainingHour <= 14;
        if (!lunchConflict && hour >= lunchHour && hour <= 14) {
            candidates.push({
                id: 'meal_lunch',
                engine: 'fuel',
                name: '🍽️ Lunch',
                description: 'Midday meal for sustained afternoon energy',
                urgency_score: hour >= 13 ? 65 : 55,
                enablement_score: 80,
                duration_minutes: 30,
                rationale: 'Refuel for afternoon productivity',
                impact_if_done: 'Stable energy through afternoon',
                impact_if_skipped: 'Afternoon slump, poor focus',
                protocol: 'Balanced meal with protein, complex carbs, vegetables'
            });
        }

        // DINNER (2-3 hours before bed)
        const dinnerHour = lastMealHour - 2;
        if (hour >= dinnerHour && hour <= lastMealHour) {
            candidates.push({
                id: 'meal_dinner',
                engine: 'fuel',
                name: '🍽️ Dinner',
                description: 'Final meal - recovery-focused nutrition',
                urgency_score: hour >= dinnerHour + 1 ? 60 : 50,
                enablement_score: 75,
                duration_minutes: 45,
                rationale: `Last meal window closes at ${lastMealHour}:00`,
                impact_if_done: 'Overnight recovery supported',
                impact_if_skipped: 'Poor sleep, muscle catabolism',
                protocol: 'Protein-rich, moderate carbs for recovery (35g P, 30g C)'
            });
        }

        return candidates;
    }

    /**
     * LONGEVITY CANDIDATES (NEW)
     * Integrates AdaptiveTimelineEngine protocols into orchestrator
     */
    private static getLongevityCandidates(state: GlobalState, profile: UserProfile, sessions: Session[]): V7Candidate[] {
        // Wrapper for Longevity Engine
        const actions = LongevityProtocolEngine.evaluate(state, profile);
        // Map UnifiedAction to V7Candidate (Approximate)
        return actions.map(a => ({
            id: a.id,
            engine: 'recovery', // approx
            name: a.title,
            description: a.description,
            urgency_score: a.priority === 'essential' ? 90 : 70,
            enablement_score: 80,
            duration_minutes: a.duration_minutes,
            rationale: a.rationale,
            impact_if_done: 'Improved longevity',
            impact_if_skipped: 'Missed protocol',
            protocol: a.how_to || 'Generic Protocol'
        }));
    }

    /**
     * RECOVERY CANDIDATES
     */
    private static getRecoveryCandidates(state: GlobalState, hour: number): V7Candidate[] {
        const candidates: V7Candidate[] = [];
        if (!state.sleep || !state.recovery) return [];
        const { sleep_debt, hrv } = state.sleep;
        const { recovery_score, fatigue_level } = state.recovery;

        // High sleep debt
        if (sleep_debt > 2) {
            candidates.push({
                id: 'recovery_sleep_debt',
                engine: 'recovery',
                name: 'NSDR (Non-Sleep Deep Rest)',
                description: 'Clear neurological fatigue.',
                urgency_score: 80,
                enablement_score: 90,
                duration_minutes: 20,
                rationale: `Sleep debt: ${sleep_debt.toFixed(1)} hours`,
                impact_if_done: 'Equivalent to 90m actual sleep.',
                impact_if_skipped: 'Reaction time slows, injury risk up.',
                protocol: 'Yoga Nidra or NSDR protocol'
            });
        }

        // Low HRV
        if (hrv < 45 && state.user_profile.baselines.hrv_baseline > 50) {
            candidates.push({
                id: 'recovery_hrv_low',
                engine: 'recovery',
                name: 'Parasympathetic Activation',
                description: 'Autonomic imbalance detected.',
                urgency_score: 75,
                enablement_score: 80,
                duration_minutes: 10,
                rationale: `HRV at ${hrv}ms(baseline: ${state.user_profile.baselines.hrv_baseline}ms)`,
                impact_if_done: 'Shifts nervous system to recovery mode.',
                impact_if_skipped: 'Chronic stress accumulation.',
                protocol: 'Slow breathing (5.5 breaths/min)'
            });
        }

        // High fatigue in evening
        if (fatigue_level > 7 && hour >= 18) {
            candidates.push({
                id: 'recovery_evening_wind',
                engine: 'recovery',
                name: 'Evening Wind-Down',
                description: 'High fatigue detected.',
                urgency_score: 65,
                enablement_score: 85,
                duration_minutes: 30,
                rationale: `Fatigue level: ${fatigue_level} / 10`,
                impact_if_done: 'Optimizes sleep onset.',
                impact_if_skipped: 'Poor sleep quality likely.',
                protocol: 'Dim lights, no screens, stretch'
            });
        }

        // Low recovery score
        if (recovery_score < 50) {
            candidates.push({
                id: 'recovery_low_score',
                engine: 'recovery',
                name: 'Active Recovery',
                description: 'System needs repair time.',
                urgency_score: 70,
                enablement_score: 75,
                duration_minutes: 30,
                rationale: `Recovery score: ${recovery_score} % `,
                impact_if_done: 'Enhances tissue repair.',
                impact_if_skipped: 'Training adaptation blocked.',
                protocol: 'Light walk or mobility work'
            });
        }

        return candidates;
    }

    private static getRedDayCandidates(state: GlobalState): V7Candidate[] {
        const candidates: V7Candidate[] = [];

        if (RedDayEngine.isRedDay(state, {} as UserProfile)) {
            candidates.push({
                id: 'red_day_alert',
                engine: 'recovery',
                name: 'RED DAY DETECTED',
                description: 'Systemic Fatigue High. Reduce Volume.',
                urgency_score: 100,
                enablement_score: 100,
                duration_minutes: 0,
                rationale: 'Red Day detected',
                impact_if_done: 'Prevents burnout',
                impact_if_skipped: 'High injury risk',
                protocol: 'REST'
            });
        }
        return candidates;
    }

    /**
     * PERFORMANCE CANDIDATES
     */
    private static getPerformanceCandidates(state: GlobalState): V7Candidate[] {
        const candidates: V7Candidate[] = [];
        const { acwr, monotony } = state.physical_load;

        // ACWR spike
        if (acwr > 1.4) {
            candidates.push({
                id: 'perf_acwr_high',
                engine: 'performance',
                name: 'Load Management Alert',
                description: 'Acute load spike detected.',
                urgency_score: 70,
                enablement_score: 60,
                duration_minutes: 30,
                rationale: `ACWR at ${acwr.toFixed(2)}(safe: 0.8 - 1.3)`,
                impact_if_done: 'Prevents soft tissue overload.',
                impact_if_skipped: 'Injury risk increases 2-5x.',
                protocol: 'Zone 1 flush or rest day'
            });
        }

        // Very high ACWR
        if (acwr > 1.6) {
            candidates.push({
                id: 'perf_acwr_critical',
                engine: 'performance',
                name: 'CRITICAL: Deload Required',
                description: 'Training load dangerous.',
                urgency_score: 90,
                enablement_score: 50,
                duration_minutes: 0,
                rationale: `ACWR at ${acwr.toFixed(2)} - RED ZONE`,
                impact_if_done: 'Prevents injury.',
                impact_if_skipped: 'High probability of breakdown.',
                protocol: 'Mandatory rest or very light activity'
            });
        }

        // High monotony (lack of variation)
        if (monotony > 1.5) {
            candidates.push({
                id: 'perf_monotony',
                engine: 'performance',
                name: 'Variation Needed',
                description: 'Training too repetitive.',
                urgency_score: 50,
                enablement_score: 55,
                duration_minutes: 0,
                rationale: `Monotony index: ${monotony.toFixed(2)}`,
                impact_if_done: 'Reduces staleness.',
                impact_if_skipped: 'Plateau and overtraining risk.',
                protocol: 'Add variety to next session'
            });
        }

        return candidates;
    }

    /**
     * TIME-BASED CONTEXTUAL CANDIDATES
     * Proactive suggestions based on time of day
     */
    private static getTimeBasedCandidates(state: GlobalState, hour: number): V7Candidate[] {
        const candidates: V7Candidate[] = [];

        // Morning sunlight (if before 10am and not already done)
        if (hour >= 6 && hour <= 10) {
            candidates.push({
                id: 'time_morning_light',
                engine: 'recovery',
                name: 'Morning Light Exposure',
                description: 'Set circadian rhythm.',
                urgency_score: 45,
                enablement_score: 95,
                duration_minutes: 10,
                rationale: 'Early light locks in circadian timing',
                impact_if_done: 'Better sleep tonight, higher AM cortisol.',
                impact_if_skipped: 'Delayed sleep phase risk.',
                protocol: '10-30min outdoor light (no sunglasses)'
            });
        }

        // Evening wind-down reminder
        if (hour >= 20 && hour <= 22 && state.mindspace.stress > 4) {
            candidates.push({
                id: 'time_wind_down',
                engine: 'mindspace',
                name: 'Pre-Sleep Protocol',
                description: 'Prepare for optimal sleep.',
                urgency_score: 55,
                enablement_score: 85,
                duration_minutes: 20,
                rationale: 'Evening stress can delay sleep onset',
                impact_if_done: 'Faster sleep, better quality.',
                impact_if_skipped: 'May take longer to fall asleep.',
                protocol: 'Dim lights, cold shower, journal'
            });
        }

        // Afternoon slump prevention
        if (hour >= 13 && hour <= 15 && state.fuel.fuel_score < 70) {
            candidates.push({
                id: 'time_afternoon_slump',
                engine: 'fuel',
                name: 'Post-Lunch Energy',
                description: 'Prevent afternoon slump.',
                urgency_score: 50,
                enablement_score: 75,
                duration_minutes: 15,
                rationale: 'Natural circadian dip + incomplete fueling',
                impact_if_done: 'Maintains afternoon productivity.',
                impact_if_skipped: 'Energy crash likely.',
                protocol: 'Light walk + green tea'
            });
        }

        return candidates;
    }

    // --- HELPERS ---

    /**
     * Convert ActionCandidate (New or Legacy V7) to TimelineProtocol
     */
    private static candidateToProtocol(c: ExpertActionCandidate | V7Candidate): TimelineProtocol {
        // Handle Legacy V7 Candidate
        if ('urgency_score' in c) {
            return {
                id: c.id,
                category: c.engine === 'performance' ? 'training' : c.engine as any,
                title: c.name,
                icon: this.getIconForEngine(c.engine, c.id),
                description: c.description,
                time_of_day: 'Now',
                duration_minutes: c.duration_minutes,
                priority: c.urgency_score > 85 ? 'critical' : 'high',
                // RichProtocol Requirements
                variant: 'rich',
                rationale: {
                    primary_reason: c.rationale,
                    supporting_signals: [],
                    science_brief: c.rationale,
                    impact_summary: c.impact_if_done
                },
                longevity_focus: c.engine === 'recovery' ? 'Recovery Priority' : 'Performance Priority',
                tailoring_reason: 'Urgent active command',
                specifics: {}
            };
        }

        // Handle New ActionCandidate
        return {
            id: c.id,
            category: 'mindspace', // Default fallthrough, safe bet
            title: c.name,
            icon: 'Zap', // varying based on expert?
            description: c.description,
            time_of_day: 'Now',
            duration_minutes: c.duration_minutes,
            priority: c.urgency > 0.8 ? 'critical' : 'high',
            variant: 'rich',
            rationale: {
                primary_reason: c.rationale,
                supporting_signals: [],
                science_brief: '',
                impact_summary: ''
            },
            longevity_focus: 'General Health',
            tailoring_reason: 'Expert Recommendation',
            specifics: {}
        };
    }

    /**
     * Get appropriate icon for engine/action type
     */
    private static getIconForEngine(engine: string, id: string): string {
        // Specific icons for specific actions
        if (id.includes('hydrat')) return 'Droplets';
        if (id.includes('caffeine')) return 'Coffee';
        if (id.includes('sleep') || id.includes('nsdr')) return 'Moon';
        if (id.includes('breath')) return 'Wind';
        if (id.includes('light')) return 'Sun';

        // Engine-based defaults
        switch (engine) {
            case 'mindspace': return 'Brain';
            case 'fuel': return 'Utensils';
            case 'recovery': return 'Heart';
            case 'performance': return 'Activity';
            default: return 'Zap';
        }
    }

}
