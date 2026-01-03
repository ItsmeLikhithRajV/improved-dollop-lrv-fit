/**
 * Supplement Protocol Engine
 * 
 * Generates personalized supplement timing windows based on:
 * - User's supplement stack
 * - Today's sessions (from Timeline)
 * - User's goals
 * - Circadian rhythm optimization
 * 
 * Research-backed timing rules for optimal absorption and efficacy.
 */

import { GoalType } from '../../types/goals';
import { Session } from './SessionFuelProtocolEngine';

// =====================================================
// TYPES
// =====================================================

export type SupplementCategory =
    | 'performance'    // Creatine, caffeine, beta-alanine
    | 'recovery'       // Protein, BCAAs, glutamine
    | 'health'         // Vitamins, minerals, omega-3
    | 'sleep';         // Magnesium, melatonin, glycine

export type SupplementTiming =
    | 'wake'
    | 'with_breakfast'
    | 'pre_workout'
    | 'post_workout'
    | 'with_lunch'
    | 'with_dinner'
    | 'pre_sleep'
    | 'any_meal';

export interface Supplement {
    id: string;
    name: string;
    emoji: string;
    category: SupplementCategory;
    default_timing: SupplementTiming;
    dosage: string;
    take_with: string[];      // e.g., ["fat", "food"]
    avoid_with: string[];     // e.g., ["calcium", "iron"]
    goal_relevant: GoalType[];
    rationale: string;
}

export interface SupplementWindow {
    id: string;
    supplement: Supplement;
    timing: SupplementTiming;
    window_start: Date;
    window_end: Date;
    priority: 'essential' | 'recommended' | 'optional';
    is_active: boolean;
    is_upcoming: boolean;
    is_missed: boolean;
    session_relative: boolean;  // Is this timing relative to a session?
    session_id?: string;
    instructions: string;       // e.g., "Take with breakfast, include some fat"
}

export interface DaySupplementProtocol {
    date: Date;
    supplements: Supplement[];
    all_windows: SupplementWindow[];
    active_window: SupplementWindow | null;
    next_window: SupplementWindow | null;
}

// =====================================================
// SUPPLEMENT DATABASE (Research-Backed)
// =====================================================

export const SUPPLEMENT_DATABASE: Supplement[] = [
    // --- PERFORMANCE ---
    {
        id: 'creatine',
        name: 'Creatine Monohydrate',
        emoji: '💪',
        category: 'performance',
        default_timing: 'post_workout',
        dosage: '5g daily',
        take_with: ['carbs', 'protein'],
        avoid_with: [],
        goal_relevant: ['muscle_gain', 'explosive_power', 'hybrid'],
        rationale: 'Better absorbed post-workout with insulin spike from carbs. Consistency matters more than timing.'
    },
    {
        id: 'caffeine',
        name: 'Caffeine',
        emoji: '☕',
        category: 'performance',
        default_timing: 'pre_workout',
        dosage: '100-200mg',
        take_with: [],
        avoid_with: ['after_2pm'],
        goal_relevant: ['endurance', 'explosive_power', 'fat_loss', 'hybrid'],
        rationale: 'Peak effect 60min after consumption. Avoid within 8-10h of bedtime.'
    },
    {
        id: 'beta_alanine',
        name: 'Beta-Alanine',
        emoji: '⚡',
        category: 'performance',
        default_timing: 'any_meal',
        dosage: '3-6g split doses',
        take_with: ['food'],
        avoid_with: [],
        goal_relevant: ['endurance', 'hybrid'],
        rationale: 'Timing irrelevant - chronic loading. Split doses to avoid tingling.'
    },

    // --- RECOVERY ---
    {
        id: 'whey_protein',
        name: 'Whey Protein',
        emoji: '🥛',
        category: 'recovery',
        default_timing: 'post_workout',
        dosage: '25-40g',
        take_with: ['carbs'],
        avoid_with: [],
        goal_relevant: ['muscle_gain', 'fat_loss', 'weight_loss', 'hybrid', 'longevity'],
        rationale: 'Fast-digesting for rapid MPS. Post-workout window maximizes absorption.'
    },
    {
        id: 'casein',
        name: 'Casein Protein',
        emoji: '🌙',
        category: 'recovery',
        default_timing: 'pre_sleep',
        dosage: '25-40g',
        take_with: [],
        avoid_with: [],
        goal_relevant: ['muscle_gain', 'weight_gain'],
        rationale: 'Slow-release protein for overnight MPS. Take 30min before bed.'
    },

    // --- HEALTH ---
    {
        id: 'vitamin_d',
        name: 'Vitamin D3',
        emoji: '☀️',
        category: 'health',
        default_timing: 'with_breakfast',
        dosage: '2000-5000 IU',
        take_with: ['fat'],
        avoid_with: ['evening'],
        goal_relevant: ['longevity', 'muscle_gain', 'fat_loss', 'endurance', 'hybrid'],
        rationale: 'Fat-soluble, needs dietary fat. Morning aligns with sunlight, may disrupt melatonin if PM.'
    },
    {
        id: 'omega_3',
        name: 'Omega-3 (Fish Oil)',
        emoji: '🐟',
        category: 'health',
        default_timing: 'with_dinner',
        dosage: '2-3g EPA+DHA',
        take_with: ['fat', 'food'],
        avoid_with: [],
        goal_relevant: ['longevity', 'muscle_gain', 'endurance', 'hybrid'],
        rationale: 'Fat-soluble, take with meal. Evening may support sleep via melatonin production.'
    },
    {
        id: 'multivitamin',
        name: 'Multivitamin',
        emoji: '💊',
        category: 'health',
        default_timing: 'with_lunch',
        dosage: '1 daily',
        take_with: ['food', 'fat'],
        avoid_with: [],
        goal_relevant: ['longevity', 'fat_loss', 'weight_loss', 'endurance'],
        rationale: 'Take with largest meal for absorption of fat-soluble vitamins.'
    },
    {
        id: 'calcium',
        name: 'Calcium',
        emoji: '🦴',
        category: 'health',
        default_timing: 'with_breakfast',
        dosage: '500mg max per dose',
        take_with: ['vitamin_d', 'food'],
        avoid_with: ['magnesium', 'iron', 'zinc'],
        goal_relevant: ['longevity'],
        rationale: 'Competes with magnesium for absorption. Take morning, magnesium evening. Max 500mg per dose.'
    },

    // --- SLEEP ---
    {
        id: 'magnesium',
        name: 'Magnesium Glycinate',
        emoji: '😴',
        category: 'sleep',
        default_timing: 'pre_sleep',
        dosage: '200-400mg',
        take_with: [],
        avoid_with: ['calcium'],
        goal_relevant: ['longevity', 'muscle_gain', 'endurance', 'hybrid'],
        rationale: 'Promotes GABA and melatonin. Take 1-2h before bed. Separate from calcium by 4h.'
    },
    {
        id: 'glycine',
        name: 'Glycine',
        emoji: '💤',
        category: 'sleep',
        default_timing: 'pre_sleep',
        dosage: '3g',
        take_with: [],
        avoid_with: [],
        goal_relevant: ['longevity'],
        rationale: 'Improves sleep quality, lowers core body temperature. Take 30-60min before bed.'
    }
];

// =====================================================
// TIMING RULES
// =====================================================

interface TimingRule {
    timing: SupplementTiming;
    base_hour: number;      // 24h format
    window_duration_min: number;
    session_relative?: {
        relative_to: 'pre' | 'post';
        minutes_offset: number;
    };
}

const TIMING_RULES: Record<SupplementTiming, TimingRule> = {
    wake: { timing: 'wake', base_hour: 7, window_duration_min: 60 },
    with_breakfast: { timing: 'with_breakfast', base_hour: 8, window_duration_min: 90 },
    pre_workout: { timing: 'pre_workout', base_hour: 9, window_duration_min: 60, session_relative: { relative_to: 'pre', minutes_offset: -60 } },
    post_workout: { timing: 'post_workout', base_hour: 11, window_duration_min: 60, session_relative: { relative_to: 'post', minutes_offset: 30 } },
    with_lunch: { timing: 'with_lunch', base_hour: 13, window_duration_min: 90 },
    with_dinner: { timing: 'with_dinner', base_hour: 19, window_duration_min: 90 },
    pre_sleep: { timing: 'pre_sleep', base_hour: 21, window_duration_min: 90 },
    any_meal: { timing: 'any_meal', base_hour: 8, window_duration_min: 720 } // Wide window
};

// =====================================================
// MAIN ENGINE CLASS
// =====================================================

export class SupplementProtocolEngine {
    private userSupplements: Supplement[] = [];
    private userGoal: GoalType = 'longevity';
    private wakeTime: number = 7;   // 24h format
    private bedTime: number = 22;   // 24h format

    /**
     * Configure user parameters
     */
    configure(params: {
        supplements?: Supplement[];
        supplement_ids?: string[];
        goal?: GoalType;
        wake_time?: number;
        bed_time?: number;
    }): void {
        if (params.supplements) {
            this.userSupplements = params.supplements;
        }
        if (params.supplement_ids) {
            this.userSupplements = SUPPLEMENT_DATABASE.filter(s =>
                params.supplement_ids!.includes(s.id)
            );
        }
        if (params.goal) this.userGoal = params.goal;
        if (params.wake_time) this.wakeTime = params.wake_time;
        if (params.bed_time) this.bedTime = params.bed_time;
    }

    /**
     * Get recommended supplements for a goal
     */
    getRecommendedForGoal(goal: GoalType): Supplement[] {
        return SUPPLEMENT_DATABASE.filter(s => s.goal_relevant.includes(goal));
    }

    /**
     * Generate supplement windows for a day
     */
    generateDayProtocol(sessions: Session[], now: Date = new Date()): DaySupplementProtocol {
        const allWindows: SupplementWindow[] = [];

        for (const supplement of this.userSupplements) {
            const window = this.createSupplementWindow(supplement, sessions, now);
            if (window) {
                allWindows.push(window);
            }
        }

        // Sort by window start time
        allWindows.sort((a, b) => a.window_start.getTime() - b.window_start.getTime());

        // Update active/upcoming status
        for (const window of allWindows) {
            window.is_active = now >= window.window_start && now <= window.window_end;
            window.is_upcoming = !window.is_active &&
                window.window_start > now &&
                (window.window_start.getTime() - now.getTime()) <= 2 * 60 * 60 * 1000;
            window.is_missed = now > window.window_end;
        }

        return {
            date: now,
            supplements: this.userSupplements,
            all_windows: allWindows,
            active_window: allWindows.find(w => w.is_active) || null,
            next_window: allWindows.find(w => w.is_upcoming && !w.is_missed) || null
        };
    }

    /**
     * Get the most urgent supplement action
     */
    getUrgentSupplementAction(sessions: Session[], now: Date = new Date()): SupplementWindow | null {
        const protocol = this.generateDayProtocol(sessions, now);
        return protocol.active_window || protocol.next_window;
    }

    // =========================================
    // PRIVATE HELPERS
    // =========================================

    private createSupplementWindow(
        supplement: Supplement,
        sessions: Session[],
        now: Date
    ): SupplementWindow | null {
        const rule = TIMING_RULES[supplement.default_timing];
        let windowStart: Date;
        let windowEnd: Date;
        let sessionRelative = false;
        let sessionId: string | undefined;

        // Check if this supplement timing is relative to a session
        if (rule.session_relative && sessions.length > 0) {
            const todaysSessions = this.getTodaysSessions(sessions, now);
            if (todaysSessions.length > 0) {
                const session = todaysSessions[0]; // Use first session
                const sessionTime = this.getSessionTime(session);

                if (rule.session_relative.relative_to === 'pre') {
                    windowStart = new Date(sessionTime.getTime() + rule.session_relative.minutes_offset * 60 * 1000);
                } else {
                    const sessionDuration = session.duration_minutes || session.duration_min || 60;
                    const sessionEnd = new Date(sessionTime.getTime() + sessionDuration * 60 * 1000);
                    windowStart = new Date(sessionEnd.getTime() + rule.session_relative.minutes_offset * 60 * 1000);
                }

                windowEnd = new Date(windowStart.getTime() + rule.window_duration_min * 60 * 1000);
                sessionRelative = true;
                sessionId = session.id;
            } else {
                // No session today - use default timing
                windowStart = this.getTimeToday(rule.base_hour, now);
                windowEnd = new Date(windowStart.getTime() + rule.window_duration_min * 60 * 1000);
            }
        } else {
            // Regular timing based on daily schedule
            windowStart = this.getTimeToday(rule.base_hour, now);
            windowEnd = new Date(windowStart.getTime() + rule.window_duration_min * 60 * 1000);
        }

        // Special case: pre_sleep should use user's bedtime
        if (supplement.default_timing === 'pre_sleep') {
            windowEnd = this.getTimeToday(this.bedTime, now);
            windowStart = new Date(windowEnd.getTime() - 90 * 60 * 1000); // 1.5h before bed
        }

        // Generate instructions
        const instructions = this.generateInstructions(supplement);

        return {
            id: `${supplement.id}_${now.toDateString()}`,
            supplement,
            timing: supplement.default_timing,
            window_start: windowStart,
            window_end: windowEnd,
            priority: this.getPriority(supplement),
            is_active: false,
            is_upcoming: false,
            is_missed: false,
            session_relative: sessionRelative,
            session_id: sessionId,
            instructions
        };
    }

    private getTodaysSessions(sessions: Session[], now: Date): Session[] {
        return sessions.filter(s => {
            const sessionDate = this.getSessionTime(s);
            return sessionDate.toDateString() === now.toDateString();
        });
    }

    private getSessionTime(session: Session): Date {
        if (session.start_time) {
            return new Date(session.start_time);
        }
        if (session.time) {
            const [hours, minutes] = session.time.split(':').map(Number);
            const date = new Date();
            date.setHours(hours, minutes, 0, 0);
            return date;
        }
        return new Date();
    }

    private getTimeToday(hour: number, reference: Date): Date {
        const date = new Date(reference);
        date.setHours(hour, 0, 0, 0);
        return date;
    }

    private getPriority(supplement: Supplement): 'essential' | 'recommended' | 'optional' {
        // Goal-relevant supplements are essential
        if (supplement.goal_relevant.includes(this.userGoal)) {
            if (supplement.category === 'performance' || supplement.category === 'recovery') {
                return 'essential';
            }
            return 'recommended';
        }
        return 'optional';
    }

    private generateInstructions(supplement: Supplement): string {
        const parts: string[] = [`Take ${supplement.dosage}`];

        if (supplement.take_with.length > 0) {
            parts.push(`with ${supplement.take_with.join(' and ')}`);
        }

        if (supplement.avoid_with.length > 0) {
            parts.push(`(avoid with ${supplement.avoid_with.join(', ')})`);
        }

        return parts.join(' ');
    }
}

// =====================================================
// SINGLETON INSTANCE
// =====================================================

export const supplementEngine = new SupplementProtocolEngine();

// =====================================================
// CONVENIENCE FUNCTIONS
// =====================================================

export const generateSupplementProtocol = (
    supplement_ids: string[],
    sessions: Session[],
    goal: GoalType
): DaySupplementProtocol => {
    supplementEngine.configure({ supplement_ids, goal });
    return supplementEngine.generateDayProtocol(sessions);
};

export const getRecommendedSupplements = (goal: GoalType): Supplement[] => {
    return supplementEngine.getRecommendedForGoal(goal);
};
