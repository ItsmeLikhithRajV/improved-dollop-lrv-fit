/**
 * Unified Timeline Protocol Engine
 * 
 * The Master Orchestrator that:
 * 1. Reads user's Timeline (sessions)
 * 2. Calls each sub-engine (Fuel, Supplement, Recovery, Mind, Longevity)
 * 3. Resolves conflicts between protocols
 * 4. Generates a unified day protocol with priority actions
 * 5. Tracks causal effects across domains
 * 
 * This is the central brain of Sentient's context-aware system.
 */

import { GoalType } from '../../types/goals';
import { Session, generateFuelWindows, DayFuelProtocol, FuelWindow } from '../nutritionist/SessionFuelProtocolEngine';
import { generateSupplementProtocol, DaySupplementProtocol, SupplementWindow } from '../nutritionist/SupplementProtocolEngine';
import { generateLongevityProtocol, DayLongevityProtocol, LongevityAction, LongevityProtocolEngine } from './longevityProtocolEngine';
import { generateRecoveryProtocol, DayRecoveryProtocol, RecoveryWindow } from '../recovery/RecoveryProtocolEngine';
import { generateMindProtocol, DayMindProtocol, MindWindow } from '../mental/MindProtocolEngine';

// =====================================================
// TYPES
// =====================================================

export type ProtocolDomain = 'fuel' | 'supplement' | 'recovery' | 'mind' | 'longevity';

export interface UnifiedAction {
    id: string;
    domain: ProtocolDomain;
    title: string;
    description: string;
    emoji: string;
    window_start: Date;
    window_end: Date;
    duration_minutes: number;
    priority: number;           // 1-10 score
    priority_label: 'critical' | 'high' | 'medium' | 'low';
    is_active: boolean;
    is_upcoming: boolean;
    is_missed: boolean;
    is_blocked: boolean;
    blocked_reason?: string;
    rationale: string;
    how_to?: string;
    session_relative: boolean;
    session_id?: string;
    causal_effects: CausalEffect[];

    // Original window reference
    original_window: FuelWindow | SupplementWindow | RecoveryWindow | MindWindow | LongevityAction;
}

export interface CausalEffect {
    domain: string;
    effect: 'positive' | 'negative' | 'neutral';
    description: string;
}

export interface UnifiedDayProtocol {
    date: Date;
    mode: 'longevity' | 'performance';
    has_sessions: boolean;
    sessions: Session[];

    // All actions sorted by time
    all_actions: UnifiedAction[];

    // Priority actions
    current_action: UnifiedAction | null;   // What to do NOW
    next_action: UnifiedAction | null;      // What's coming up
    urgent_actions: UnifiedAction[];        // Critical/high priority

    // Conflicts and vetos
    conflicts: string[];

    // Domain-specific protocols
    fuel_protocol: DayFuelProtocol;
    supplement_protocol: DaySupplementProtocol;
    recovery_protocol: DayRecoveryProtocol;
    mind_protocol: DayMindProtocol;
    longevity_protocol: DayLongevityProtocol;

    // Summary
    summary: string;
}

// =====================================================
// PRIORITY SCORING
// =====================================================

const DOMAIN_BASE_PRIORITY: Record<ProtocolDomain, number> = {
    fuel: 8,        // Fuel windows are time-sensitive
    supplement: 5,  // Supplements have wider windows
    recovery: 6,    // Recovery has specific timing rules
    mind: 4,        // Mind practices are flexible
    longevity: 3    // Longevity is background guidance
};

const PRIORITY_MODIFIERS = {
    is_active: 3,           // Currently in window
    is_upcoming_30min: 2,   // Within 30 minutes
    is_upcoming_1h: 1,      // Within 1 hour
    session_relative: 1,    // Tied to a session
    essential_priority: 2,  // Marked essential
    critical_priority: 3,   // Marked critical
    is_blocked: -10         // Blocked by conflict
};

// =====================================================
// ENGINE CLASS
// =====================================================

export class UnifiedTimelineProtocolEngine {
    private userGoal: GoalType = 'hybrid';
    private wakeTime: number = 7;
    private bedTime: number = 22;
    private userWeight: number = 70;
    private supplementIds: string[] = [];
    private lastTrainingDate: Date | null = null;

    /**
     * Configure user parameters
     */
    configure(params: {
        goal?: GoalType;
        wake_time?: number;
        bed_time?: number;
        weight_kg?: number;
        supplement_ids?: string[];
        last_training_date?: Date;
    }): void {
        if (params.goal) this.userGoal = params.goal;
        if (params.wake_time) this.wakeTime = params.wake_time;
        if (params.bed_time) this.bedTime = params.bed_time;
        if (params.weight_kg) this.userWeight = params.weight_kg;
        if (params.supplement_ids) this.supplementIds = params.supplement_ids;
        if (params.last_training_date) this.lastTrainingDate = params.last_training_date;
    }

    /**
     * Generate unified day protocol
     */
    generateDayProtocol(sessions: Session[], now: Date = new Date()): UnifiedDayProtocol {
        // Get protocols from each engine
        const fuelProtocol = generateFuelWindows(sessions, this.userGoal, this.userWeight);
        const supplementProtocol = generateSupplementProtocol(this.supplementIds, sessions, this.userGoal);
        const recoveryProtocol = generateRecoveryProtocol(sessions, this.userGoal);
        const mindProtocol = generateMindProtocol(sessions, this.wakeTime, this.bedTime);
        const longevityProtocol = generateLongevityProtocol(sessions, this.lastTrainingDate || undefined);

        // Collect all actions
        const allActions: UnifiedAction[] = [];

        // Convert fuel windows
        for (const window of fuelProtocol.all_windows) {
            allActions.push(this.fuelToUnified(window, now));
        }

        // Convert supplement windows
        for (const window of supplementProtocol.all_windows) {
            allActions.push(this.supplementToUnified(window, now));
        }

        // Convert recovery windows (available only)
        for (const window of recoveryProtocol.available_modalities) {
            allActions.push(this.recoveryToUnified(window, now, false));
        }
        // Add blocked recovery as blocked actions
        for (const window of recoveryProtocol.blocked_modalities) {
            allActions.push(this.recoveryToUnified(window, now, true));
        }

        // Convert mind windows
        for (const window of mindProtocol.all_windows) {
            allActions.push(this.mindToUnified(window, now));
        }

        // Convert longevity actions (only if no sessions / longevity mode)
        if (!longevityProtocol.has_sessions) {
            for (const action of longevityProtocol.actions) {
                allActions.push(this.longevityToUnified(action, now));
            }
        }

        // Sort by time, then by priority
        allActions.sort((a, b) => {
            if (a.window_start.getTime() !== b.window_start.getTime()) {
                return a.window_start.getTime() - b.window_start.getTime();
            }
            return b.priority - a.priority; // Higher priority first
        });

        // Find current and next actions
        const activeActions = allActions.filter(a => a.is_active && !a.is_blocked);
        const upcomingActions = allActions.filter(a => a.is_upcoming && !a.is_blocked);
        const urgentActions = allActions.filter(a =>
            (a.is_active || a.is_upcoming) &&
            !a.is_blocked &&
            a.priority >= 7
        );

        // Collect conflicts
        const conflicts = recoveryProtocol.conflicts;

        // Generate summary
        const summary = this.generateSummary(
            longevityProtocol.has_sessions,
            activeActions.length,
            upcomingActions.length,
            conflicts.length
        );

        return {
            date: now,
            mode: longevityProtocol.has_sessions ? 'performance' : 'longevity',
            has_sessions: longevityProtocol.has_sessions,
            sessions,
            all_actions: allActions,
            current_action: activeActions[0] || null,
            next_action: upcomingActions[0] || null,
            urgent_actions: urgentActions,
            conflicts,
            fuel_protocol: fuelProtocol,
            supplement_protocol: supplementProtocol,
            recovery_protocol: recoveryProtocol,
            mind_protocol: mindProtocol,
            longevity_protocol: longevityProtocol,
            summary
        };
    }

    /**
     * Get the single most important action right now
     */
    getCurrentPriorityAction(sessions: Session[], now: Date = new Date()): UnifiedAction | null {
        const protocol = this.generateDayProtocol(sessions, now);
        return protocol.current_action || protocol.next_action;
    }

    // =========================================
    // CONVERTERS
    // =========================================

    private fuelToUnified(window: FuelWindow, now: Date): UnifiedAction {
        const priority = this.calculatePriority('fuel', window, now);

        return {
            id: window.id,
            domain: 'fuel',
            title: window.title,
            description: window.subtitle,
            emoji: window.type === 'pre_workout' ? '🍽️' : window.type === 'post_workout' ? '🥤' : '⚡',
            window_start: window.window_start,
            window_end: window.window_end,
            duration_minutes: 30,
            priority: priority.score,
            priority_label: priority.label,
            is_active: window.is_active,
            is_upcoming: window.is_upcoming,
            is_missed: window.is_missed,
            is_blocked: false,
            rationale: window.rationale,
            how_to: window.food_suggestions?.[0] ?
                `${window.food_suggestions[0].emojis} ${window.food_suggestions[0].foods.join(' + ')}` : undefined,
            session_relative: true,
            session_id: window.session_id,
            causal_effects: [
                { domain: 'performance', effect: 'positive', description: 'Optimal fueling for session' },
                { domain: 'recovery', effect: 'positive', description: 'Faster post-workout recovery' }
            ],
            original_window: window
        };
    }

    private supplementToUnified(window: SupplementWindow, now: Date): UnifiedAction {
        const priority = this.calculatePriority('supplement', window, now);

        return {
            id: window.id,
            domain: 'supplement',
            title: `${window.supplement.emoji} ${window.supplement.name}`,
            description: window.instructions,
            emoji: window.supplement.emoji,
            window_start: window.window_start,
            window_end: window.window_end,
            duration_minutes: 5,
            priority: priority.score,
            priority_label: priority.label,
            is_active: window.is_active,
            is_upcoming: window.is_upcoming,
            is_missed: window.is_missed,
            is_blocked: false,
            rationale: window.supplement.rationale,
            session_relative: window.session_relative,
            session_id: window.session_id,
            causal_effects: [],
            original_window: window
        };
    }

    private recoveryToUnified(window: RecoveryWindow, now: Date, isBlocked: boolean): UnifiedAction {
        const priority = this.calculatePriority('recovery', window, now, isBlocked);

        return {
            id: window.id,
            domain: 'recovery',
            title: `${window.emoji} ${window.title}`,
            description: window.protocol || window.description,
            emoji: window.emoji,
            window_start: window.window_start,
            window_end: window.window_end,
            duration_minutes: window.duration_minutes,
            priority: priority.score,
            priority_label: priority.label,
            is_active: window.is_active && !isBlocked,
            is_upcoming: window.is_upcoming && !isBlocked,
            is_missed: false,
            is_blocked: isBlocked,
            blocked_reason: window.veto_reason,
            rationale: window.rationale,
            how_to: window.protocol,
            session_relative: window.session_relative,
            session_id: window.session_id,
            causal_effects: window.causal_effects,
            original_window: window
        };
    }

    private mindToUnified(window: MindWindow, now: Date): UnifiedAction {
        const priority = this.calculatePriority('mind', window, now);

        return {
            id: window.id,
            domain: 'mind',
            title: `${window.emoji} ${window.title}`,
            description: window.technique,
            emoji: window.emoji,
            window_start: window.window_start,
            window_end: window.window_end,
            duration_minutes: window.duration_minutes,
            priority: priority.score,
            priority_label: priority.label,
            is_active: window.is_active,
            is_upcoming: window.is_upcoming,
            is_missed: window.is_missed,
            is_blocked: false,
            rationale: window.rationale,
            how_to: window.how_to,
            session_relative: window.session_relative,
            session_id: window.session_id,
            causal_effects: window.causal_effects,
            original_window: window
        };
    }

    private longevityToUnified(action: LongevityAction, now: Date): UnifiedAction {
        const priority = this.calculatePriority('longevity', action, now);

        return {
            id: action.id,
            domain: 'longevity',
            title: `${action.emoji} ${action.title}`,
            description: action.description,
            emoji: action.emoji,
            window_start: action.window_start,
            window_end: action.window_end,
            duration_minutes: action.duration_minutes,
            priority: priority.score,
            priority_label: priority.label,
            is_active: action.is_active,
            is_upcoming: action.is_upcoming,
            is_missed: action.is_missed,
            is_blocked: false,
            rationale: action.rationale,
            how_to: action.how_to,
            session_relative: false,
            causal_effects: action.causal_effects,
            original_window: action
        };
    }

    // =========================================
    // PRIORITY CALCULATION
    // =========================================

    private calculatePriority(
        domain: ProtocolDomain,
        window: any,
        now: Date,
        isBlocked: boolean = false
    ): { score: number; label: 'critical' | 'high' | 'medium' | 'low' } {
        let score = DOMAIN_BASE_PRIORITY[domain];

        // Apply modifiers
        if (isBlocked) {
            score += PRIORITY_MODIFIERS.is_blocked;
        }
        if (window.is_active) {
            score += PRIORITY_MODIFIERS.is_active;
        }
        if (window.is_upcoming) {
            const minutesUntil = (window.window_start.getTime() - now.getTime()) / (60 * 1000);
            if (minutesUntil <= 30) {
                score += PRIORITY_MODIFIERS.is_upcoming_30min;
            } else if (minutesUntil <= 60) {
                score += PRIORITY_MODIFIERS.is_upcoming_1h;
            }
        }
        if (window.session_relative) {
            score += PRIORITY_MODIFIERS.session_relative;
        }
        if (window.priority === 'essential' || window.priority === 'critical') {
            score += PRIORITY_MODIFIERS.essential_priority;
        }

        // Determine label
        let label: 'critical' | 'high' | 'medium' | 'low';
        if (score >= 10) label = 'critical';
        else if (score >= 7) label = 'high';
        else if (score >= 4) label = 'medium';
        else label = 'low';

        return { score: Math.max(0, Math.min(10, score)), label };
    }

    private generateSummary(
        hasSessions: boolean,
        activeCount: number,
        upcomingCount: number,
        conflictCount: number
    ): string {
        if (hasSessions) {
            return `Performance mode: ${activeCount} active, ${upcomingCount} upcoming protocols. ${conflictCount} conflicts.`;
        }
        return `Longevity mode: ${activeCount + upcomingCount} protocols scheduled. Focus on fundamentals.`;
    }
}

// =====================================================
// SINGLETON & EXPORTS
// =====================================================

export const unifiedEngine = new UnifiedTimelineProtocolEngine();

export const generateUnifiedProtocol = (
    sessions: Session[],
    config?: {
        goal?: GoalType;
        weight_kg?: number;
        supplement_ids?: string[];
        wake_time?: number;
        bed_time?: number;
    }
): UnifiedDayProtocol => {
    if (config) {
        unifiedEngine.configure(config);
    }
    return unifiedEngine.generateDayProtocol(sessions);
};

export const getCurrentAction = (
    sessions: Session[],
    goal?: GoalType
): UnifiedAction | null => {
    if (goal) unifiedEngine.configure({ goal });
    return unifiedEngine.getCurrentPriorityAction(sessions);
};
