/**
 * BASE EXPERT INTERFACE
 * 
 * Every expert (Nutritionist, Recovery, Performance, etc.) implements this.
 * Each expert is a UNIFIED brain that uses multiple internal knowledge bases.
 */

import { GlobalState, UserProfile, Session } from "../types";

// =====================================================
// SCIENTIFIC STATUS CLASSIFICATION
// Research-backed status types for health metrics
// =====================================================

/**
 * Scientific status classification
 * Based on peer-reviewed research and clinical guidelines
 */
export type ScientificStatus = 'optimal' | 'good' | 'fair' | 'poor' | 'unknown';

/**
 * Detailed status result with scientific justification
 */
export interface StatusResult {
    status: ScientificStatus;
    reason: string;                    // Human-readable explanation
    confidence: 'high' | 'medium' | 'low';
    thresholdUsed?: string;            // e.g., "RMSSD age 30-35: ≥45ms optimal"
    source?: string;                   // e.g., "Kubios HRV Research"
}

// =====================================================
// EXPERT OUTPUT TYPES
// =====================================================

export interface ExpertAnalysis {
    domain: string;
    current_state: string;           // "Fuel levels optimal" or "Fuel critically low"
    score: number;                   // 0-100 domain health
    status: ScientificStatus;        // Scientific classification from StatusClassificationEngine
    statusResult?: StatusResult;     // Detailed breakdown with threshold info
    concerns: string[];              // ["Dehydrated", "Missed breakfast"]
    opportunities: string[];         // ["Great time for training", "Recovery window"]
}

export interface ActionCandidate {
    id: string;
    expert: string;                  // Which expert suggested this
    name: string;
    description: string;
    urgency: number;                 // 0-100 how urgent
    impact: number;                  // 0-100 how impactful
    time_window?: {
        start: Date;
        end: Date;
    };
    duration_minutes: number;
    rationale: string;
    protocol?: string;               // Specific instructions
    conflicts_with?: string[];       // What this can't overlap
}

export interface CompromiseOption extends ActionCandidate {
    compromise_reason: string;       // Why is this a compromise?
    trade_off: string;               // e.g. "Less satiety but faster digestion"
}

export interface ExpertOpinion {
    expert_name: string;
    primary_action: ActionCandidate;
    urgency: number;                 // 0-100: How much the expert cares
    reasoning: string;               // The "Why" for the Orchestrator
    constraints: string[];           // Contextual constraints e.g. ["late_night", "post_training"]
    compromise_options?: CompromiseOption[]; // "Least Bad" alternatives
}

export interface ExpertContext {
    current_hour: number;
    is_training_day: boolean;
    training_time?: string;
    wake_time: string;
    bed_time: string;
    recovery_score: number;
    user_goals: string[];
}

export interface HandoffData {
    from_expert: string;
    type: 'alert' | 'request' | 'info';
    message: string;
    data: any;
}

// =====================================================
// BASE EXPERT INTERFACE
// =====================================================

export interface Expert {
    /** Expert identity */
    readonly name: string;
    readonly domain: string;
    readonly emoji: string;

    /**
     * INTERNAL REASONING
     * The expert analyzes the current state using ALL their internal knowledge.
     * This is where FoodDatabase, FuelCalculation, etc. are used internally.
     */
    analyze(state: GlobalState, profile: UserProfile): ExpertAnalysis;

    /**
     * GENERATE RECOMMENDATIONS
     * Based on analysis, produce actionable recommendations.
     * Uses context (time, training, goals) to be relevant.
     */
    getRecommendations(
        state: GlobalState,
        profile: UserProfile,
        context: ExpertContext
    ): ActionCandidate[];

    /**
     * RECEIVE HANDOFF FROM ANOTHER EXPERT
     * When another expert detects something in your domain.
     * E.g., Doctor detects low B12 → hands off to Nutritionist
     */
    receiveHandoff(handoff: HandoffData): ActionCandidate[];

    /**
     * GET PRIORITY WEIGHT
     * How important is this expert right now?
     * Changes based on state (e.g., Recovery expert more important when HRV is low)
     */
    /**
     * FORM OPINION (The "Sentient" Decision)
     * Returns the expert's primary demand, urgency, and compromise options.
     * This is used by the Council to negotiate.
     */
    formOpinion(
        state: GlobalState,
        profile: UserProfile,
        context: ExpertContext
    ): ExpertOpinion;

    getPriorityWeight(state: GlobalState, profile: UserProfile): number;
}

// =====================================================
// EXPERT REGISTRY
// =====================================================

export type ExpertName =
    | 'nutritionist'
    | 'recovery'
    | 'performance'
    | 'mental'
    | 'longevity'
    | 'doctor';

export interface ExpertRegistry {
    [key: string]: Expert;
}

// =====================================================
// HELPER: Create context from state
// =====================================================

export function createExpertContext(
    state: GlobalState,
    profile: UserProfile
): ExpertContext {
    const now = new Date();
    const sessions = state.timeline?.sessions || [];
    const todaySession = sessions.find(s => s.time_of_day);

    return {
        current_hour: now.getHours(),
        is_training_day: !!todaySession,
        training_time: todaySession?.time_of_day,
        wake_time: (profile as any)?.typical_wake_time || '07:30',
        bed_time: (profile as any)?.typical_bed_time || '23:00',
        recovery_score: state.recovery?.recovery_score || 80,
        user_goals: [String(profile?.user_goal || 'general_wellness')]
    };
}
