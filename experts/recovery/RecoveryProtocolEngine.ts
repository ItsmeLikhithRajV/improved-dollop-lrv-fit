/**
 * Recovery Protocol Engine
 * 
 * Generates session-aware recovery modality timing:
 * - Cold exposure (ice bath, cold shower) - AVOID within 4h of strength training
 * - Heat exposure (sauna) - OK post-workout, enhances recovery
 * - Contrast therapy - Best on rest days
 * 
 * Research-backed timing rules to avoid interference with training adaptations.
 */

import { UserGoal, GoalType } from '../../types/goals';
import { SessionFuelProtocolEngine, Session } from '../nutritionist/SessionFuelProtocolEngine';

// =====================================================
// TYPES
// =====================================================

export type RecoveryModality =
    | 'cold_exposure'     // Ice bath, cold shower, cold plunge
    | 'sauna'             // Dry sauna, infrared sauna
    | 'contrast'          // Hot-cold alternating
    | 'stretching'        // Static stretching, mobility
    | 'massage'           // Self-massage, foam rolling
    | 'compression';      // Compression boots, garments

export type SessionCategory = 'strength' | 'cardio' | 'hiit' | 'skill' | 'rest';

export interface RecoveryWindow {
    id: string;
    modality: RecoveryModality;
    title: string;
    description: string;
    emoji: string;
    window_start: Date;
    window_end: Date;
    duration_minutes: number;
    priority: 'optimal' | 'acceptable' | 'blocked';
    is_active: boolean;
    is_upcoming: boolean;
    session_relative: boolean;
    session_id?: string;
    veto_reason?: string;      // Why it's blocked
    rationale: string;
    protocol?: string;         // Specific protocol (temp, duration)
    causal_effects: CausalEffect[];
}

export interface CausalEffect {
    domain: 'hypertrophy' | 'recovery' | 'performance' | 'sleep' | 'inflammation';
    effect: 'positive' | 'negative' | 'neutral';
    description: string;
}

export interface DayRecoveryProtocol {
    date: Date;
    sessions: Session[];
    available_modalities: RecoveryWindow[];
    blocked_modalities: RecoveryWindow[];
    optimal_window: RecoveryWindow | null;
    conflicts: string[];
}

// =====================================================
// RECOVERY MODALITY RULES (Research-Backed)
// =====================================================

interface ModalityRule {
    modality: RecoveryModality;
    name: string;
    emoji: string;
    default_duration_min: number;
    protocol: string;

    // Timing rules relative to sessions
    strength_timing: {
        min_hours_after: number;
        priority_if_within: 'blocked' | 'acceptable';
        reason: string;
    };
    cardio_timing: {
        min_hours_after: number;
        priority: 'optimal' | 'acceptable';
    };
    rest_day: {
        priority: 'optimal' | 'acceptable';
        best_time: number; // 24h hour
    };

    causal_effects: {
        after_strength: CausalEffect[];
        after_cardio: CausalEffect[];
        rest_day: CausalEffect[];
    };
}

const MODALITY_RULES: ModalityRule[] = [
    {
        modality: 'cold_exposure',
        name: 'Cold Exposure',
        emoji: '🧊',
        default_duration_min: 11,
        protocol: '11 min/week total, 50-59°F (10-15°C)',
        strength_timing: {
            min_hours_after: 4,
            priority_if_within: 'blocked',
            reason: 'Blunts mTOR signaling and muscle protein synthesis. Wait ≥4h after strength.'
        },
        cardio_timing: {
            min_hours_after: 0,
            priority: 'optimal'
        },
        rest_day: {
            priority: 'optimal',
            best_time: 10
        },
        causal_effects: {
            after_strength: [
                { domain: 'hypertrophy', effect: 'negative', description: 'Reduces muscle growth by 20-30%' },
                { domain: 'inflammation', effect: 'positive', description: 'Reduces inflammation (counterproductive for gains)' }
            ],
            after_cardio: [
                { domain: 'recovery', effect: 'positive', description: 'Accelerates cardiovascular recovery' },
                { domain: 'inflammation', effect: 'positive', description: 'Reduces exercise-induced inflammation' }
            ],
            rest_day: [
                { domain: 'recovery', effect: 'positive', description: 'Hormetic stress adaptation' },
                { domain: 'performance', effect: 'positive', description: 'Enhanced resilience' }
            ]
        }
    },
    {
        modality: 'sauna',
        name: 'Sauna',
        emoji: '🧖',
        default_duration_min: 20,
        protocol: '15-20 min at 176-212°F (80-100°C), 2-4x/week',
        strength_timing: {
            min_hours_after: 0,
            priority_if_within: 'acceptable',
            reason: 'Safe post-strength. Boosts GH up to 500%. Wait 10-15min for HR to normalize.'
        },
        cardio_timing: {
            min_hours_after: 0,
            priority: 'optimal'
        },
        rest_day: {
            priority: 'optimal',
            best_time: 18
        },
        causal_effects: {
            after_strength: [
                { domain: 'hypertrophy', effect: 'positive', description: 'Growth hormone spike enhances recovery' },
                { domain: 'recovery', effect: 'positive', description: 'Increased blood flow aids repair' }
            ],
            after_cardio: [
                { domain: 'recovery', effect: 'positive', description: 'Enhanced cardiovascular adaptation' },
                { domain: 'performance', effect: 'positive', description: 'Heat shock protein activation' }
            ],
            rest_day: [
                { domain: 'recovery', effect: 'positive', description: 'Active recovery, detoxification' },
                { domain: 'sleep', effect: 'positive', description: 'Evening sauna improves sleep quality' }
            ]
        }
    },
    {
        modality: 'contrast',
        name: 'Contrast Therapy',
        emoji: '🔄',
        default_duration_min: 15,
        protocol: '3min hot / 1min cold, repeat 3-4 cycles',
        strength_timing: {
            min_hours_after: 4,
            priority_if_within: 'blocked',
            reason: 'Cold component may interfere with hypertrophy adaptations.'
        },
        cardio_timing: {
            min_hours_after: 0,
            priority: 'optimal'
        },
        rest_day: {
            priority: 'optimal',
            best_time: 10
        },
        causal_effects: {
            after_strength: [
                { domain: 'hypertrophy', effect: 'negative', description: 'Cold component may reduce gains' }
            ],
            after_cardio: [
                { domain: 'recovery', effect: 'positive', description: 'Accelerates metabolic waste removal' }
            ],
            rest_day: [
                { domain: 'recovery', effect: 'positive', description: 'Optimal for hormetic adaptation' }
            ]
        }
    },
    {
        modality: 'stretching',
        name: 'Stretching & Mobility',
        emoji: '🧘',
        default_duration_min: 15,
        protocol: '10-15min static stretching or mobility work',
        strength_timing: {
            min_hours_after: 0,
            priority_if_within: 'acceptable',
            reason: 'Light stretching OK post-strength. Avoid intense static stretching pre-workout.'
        },
        cardio_timing: {
            min_hours_after: 0,
            priority: 'optimal'
        },
        rest_day: {
            priority: 'optimal',
            best_time: 9
        },
        causal_effects: {
            after_strength: [
                { domain: 'recovery', effect: 'positive', description: 'Reduces DOMS, maintains ROM' }
            ],
            after_cardio: [
                { domain: 'recovery', effect: 'positive', description: 'Promotes relaxation' }
            ],
            rest_day: [
                { domain: 'recovery', effect: 'positive', description: 'Active recovery' }
            ]
        }
    }
];

// =====================================================
// ENGINE CLASS
// =====================================================

export class RecoveryProtocolEngine {
    private userGoal: GoalType = 'hybrid';

    configure(params: { goal?: GoalType }): void {
        if (params.goal) this.userGoal = params.goal;
    }

    /**
     * Categorize session type
     */
    private categorizeSession(session: Session): SessionCategory {
        const type = session.type.toLowerCase();
        if (type.includes('strength') || type.includes('weight') || type.includes('resistance')) {
            return 'strength';
        }
        if (type.includes('hiit') || type.includes('interval') || type.includes('crossfit')) {
            return 'hiit';
        }
        if (type.includes('cardio') || type.includes('run') || type.includes('bike') || type.includes('swim')) {
            return 'cardio';
        }
        if (type.includes('skill') || type.includes('technique') || type.includes('sport')) {
            return 'skill';
        }
        return 'strength'; // Default to strength for safety
    }

    /**
     * Get session end time
     */
    private getSessionEndTime(session: Session): Date {
        const startTime = session.start_time ? new Date(session.start_time) : new Date();
        const duration = session.duration_minutes || session.duration_min || 60;
        return new Date(startTime.getTime() + duration * 60 * 1000);
    }

    /**
     * Generate recovery protocol for the day
     */
    generateDayProtocol(sessions: Session[], now: Date = new Date()): DayRecoveryProtocol {
        const todaysSessions = sessions.filter(s => {
            const sessionDate = s.start_time ? new Date(s.start_time) : null;
            return sessionDate && sessionDate.toDateString() === now.toDateString();
        });

        const available: RecoveryWindow[] = [];
        const blocked: RecoveryWindow[] = [];
        const conflicts: string[] = [];

        const isRestDay = todaysSessions.length === 0;
        const hasStrength = todaysSessions.some(s => this.categorizeSession(s) === 'strength');
        const hasCardio = todaysSessions.some(s => this.categorizeSession(s) === 'cardio');

        // Find latest strength session end time (for cold timing)
        let latestStrengthEnd: Date | null = null;
        for (const session of todaysSessions) {
            if (this.categorizeSession(session) === 'strength') {
                const endTime = this.getSessionEndTime(session);
                if (!latestStrengthEnd || endTime > latestStrengthEnd) {
                    latestStrengthEnd = endTime;
                }
            }
        }

        // Evaluate each modality
        for (const rule of MODALITY_RULES) {
            const window = this.evaluateModality(rule, todaysSessions, latestStrengthEnd, now, isRestDay);

            if (window.priority === 'blocked') {
                blocked.push(window);
                conflicts.push(`❌ ${window.title}: ${window.veto_reason}`);
            } else {
                available.push(window);
            }
        }

        // Sort available by priority
        available.sort((a, b) => {
            const priorityOrder = { optimal: 0, acceptable: 1, blocked: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

        return {
            date: now,
            sessions: todaysSessions,
            available_modalities: available,
            blocked_modalities: blocked,
            optimal_window: available.find(w => w.priority === 'optimal') || null,
            conflicts
        };
    }

    /**
     * Evaluate a specific modality for the day
     */
    private evaluateModality(
        rule: ModalityRule,
        sessions: Session[],
        latestStrengthEnd: Date | null,
        now: Date,
        isRestDay: boolean
    ): RecoveryWindow {
        let windowStart: Date;
        let windowEnd: Date;
        let priority: 'optimal' | 'acceptable' | 'blocked' = 'optimal';
        let vetoReason: string | undefined;
        let effects: CausalEffect[];
        let sessionRelative = false;
        let sessionId: string | undefined;

        if (isRestDay) {
            // Rest day - use default best time
            windowStart = new Date(now);
            windowStart.setHours(rule.rest_day.best_time, 0, 0, 0);
            windowEnd = new Date(windowStart.getTime() + 4 * 60 * 60 * 1000);
            priority = rule.rest_day.priority;
            effects = rule.causal_effects.rest_day;
        } else if (latestStrengthEnd && rule.strength_timing.min_hours_after > 0) {
            // Has strength session - check timing constraint
            const safeTime = new Date(latestStrengthEnd.getTime() + rule.strength_timing.min_hours_after * 60 * 60 * 1000);

            if (now < safeTime) {
                // Currently within blocked window
                windowStart = safeTime;
                windowEnd = new Date(safeTime.getTime() + 4 * 60 * 60 * 1000);
                priority = rule.strength_timing.priority_if_within;
                vetoReason = rule.strength_timing.reason;
                effects = rule.causal_effects.after_strength;
                sessionRelative = true;
            } else {
                windowStart = now;
                windowEnd = new Date(now.getTime() + 4 * 60 * 60 * 1000);
                priority = 'acceptable';
                effects = rule.causal_effects.after_strength;
            }
        } else {
            // Cardio day or no timing restriction
            windowStart = now;
            windowEnd = new Date(now.getTime() + 4 * 60 * 60 * 1000);
            priority = rule.cardio_timing.priority;
            effects = rule.causal_effects.after_cardio;
        }

        return {
            id: `${rule.modality}_${now.toDateString()}`,
            modality: rule.modality,
            title: rule.name,
            description: rule.protocol,
            emoji: rule.emoji,
            window_start: windowStart,
            window_end: windowEnd,
            duration_minutes: rule.default_duration_min,
            priority,
            is_active: now >= windowStart && now <= windowEnd && priority !== 'blocked',
            is_upcoming: windowStart > now && priority !== 'blocked',
            session_relative: sessionRelative,
            session_id: sessionId,
            veto_reason: vetoReason,
            rationale: priority === 'blocked' ? vetoReason! :
                `${rule.name} is ${priority} at this time.`,
            protocol: rule.protocol,
            causal_effects: effects
        };
    }

    /**
     * Check if cold exposure is safe now
     */
    isColdSafe(sessions: Session[], now: Date = new Date()): { safe: boolean; reason: string; safe_after?: Date } {
        const protocol = this.generateDayProtocol(sessions, now);
        const coldWindow = protocol.available_modalities.find(w => w.modality === 'cold_exposure') ||
            protocol.blocked_modalities.find(w => w.modality === 'cold_exposure');

        if (!coldWindow) {
            return { safe: true, reason: 'No timing restrictions today.' };
        }

        if (coldWindow.priority === 'blocked') {
            return {
                safe: false,
                reason: coldWindow.veto_reason || 'Too close to strength training.',
                safe_after: coldWindow.window_start
            };
        }

        return { safe: true, reason: 'Cold exposure is safe now.' };
    }
}

// =====================================================
// SINGLETON & EXPORTS
// =====================================================

export const recoveryEngine = new RecoveryProtocolEngine();

export const generateRecoveryProtocol = (
    sessions: Session[],
    goal?: GoalType
): DayRecoveryProtocol => {
    if (goal) recoveryEngine.configure({ goal });
    return recoveryEngine.generateDayProtocol(sessions);
};

export const isColdExposureSafe = (sessions: Session[]): { safe: boolean; reason: string; safe_after?: Date } => {
    return recoveryEngine.isColdSafe(sessions);
};
