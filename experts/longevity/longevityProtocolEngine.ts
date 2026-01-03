/**
 * Longevity Protocol Engine
 * 
 * For users without scheduled sessions, generates proactive health recommendations:
 * - Training suggestions (strength, cardio)
 * - Sleep optimization
 * - Movement prompts for sedentary behavior
 * - Daily wellness routines
 * 
 * This is the "empty timeline" mode - Sentient becomes a proactive health coach.
 */

import { GoalType } from '../../types/goals';
import { GlobalState, UserProfile } from '../../types';
import { Session, generateFuelWindows, DayFuelProtocol, FuelWindow } from '../nutritionist/SessionFuelProtocolEngine';

// =====================================================
// TYPES
// =====================================================

export type LongevityActionType =
    | 'training'        // Recommended workout
    | 'movement'        // Movement break/walk
    | 'nutrition'       // Meal timing
    | 'hydration'       // Water intake
    | 'sleep_prep'      // Wind-down routine
    | 'wake_routine'    // Morning routine
    | 'sunlight'        // Light exposure
    | 'social';         // Connection reminder

export interface LongevityAction {
    id: string;
    type: LongevityActionType;
    title: string;
    description: string;
    emoji: string;
    window_start: Date;
    window_end: Date;
    duration_minutes: number;
    priority: 'essential' | 'recommended' | 'optional';
    is_active: boolean;
    is_upcoming: boolean;
    is_missed: boolean;
    rationale: string;
    how_to?: string;
    causal_effects: CausalEffect[];
}

export interface CausalEffect {
    domain: 'sleep' | 'energy' | 'recovery' | 'performance' | 'mood' | 'longevity';
    effect: 'positive' | 'negative';
    description: string;
}

export interface DayLongevityProtocol {
    date: Date;
    mode: 'longevity' | 'performance';
    has_sessions: boolean;
    training_deficit_days: number;
    actions: LongevityAction[];
    active_action: LongevityAction | null;
    next_action: LongevityAction | null;
    daily_summary: string;
}

// =====================================================
// DAILY TEMPLATES
// =====================================================

interface DailyTemplate {
    type: LongevityActionType;
    title: string;
    description: string;
    emoji: string;
    hour: number;
    duration_minutes: number;
    priority: 'essential' | 'recommended' | 'optional';
    rationale: string;
    how_to?: string;
    causal_effects: CausalEffect[];
    days?: number[];
}

const LONGEVITY_DAILY_TEMPLATE: DailyTemplate[] = [
    {
        type: 'wake_routine',
        title: 'Morning Light Exposure',
        description: 'Get 10-15min natural light within 1h of waking',
        emoji: '☀️',
        hour: 7,
        duration_minutes: 15,
        priority: 'essential',
        rationale: 'Sets circadian rhythm, boosts cortisol awakening response',
        how_to: 'Step outside or sit by bright window. No sunglasses.',
        causal_effects: [
            { domain: 'sleep', effect: 'positive', description: '+15% sleep quality tonight' },
            { domain: 'energy', effect: 'positive', description: 'Peak alertness in 2h' }
        ]
    },
    {
        type: 'hydration',
        title: 'Morning Hydration',
        description: 'Drink 500ml water upon waking',
        emoji: '💧',
        hour: 7,
        duration_minutes: 5,
        priority: 'essential',
        rationale: 'Rehydrate after overnight fast, kickstarts metabolism',
        causal_effects: [
            { domain: 'energy', effect: 'positive', description: 'Improved cognitive function' }
        ]
    },
    {
        type: 'nutrition',
        title: 'Protein-Rich Breakfast',
        description: 'Aim for 30-40g protein at first meal',
        emoji: '🍳',
        hour: 8,
        duration_minutes: 30,
        priority: 'essential',
        rationale: 'Muscle protein synthesis, blood sugar stability',
        causal_effects: [
            { domain: 'energy', effect: 'positive', description: 'Stable energy until lunch' },
            { domain: 'longevity', effect: 'positive', description: 'Preserves muscle mass' }
        ]
    },
    {
        type: 'movement',
        title: 'Midday Movement',
        description: '10-15min walk after sitting 2+ hours',
        emoji: '🚶',
        hour: 12,
        duration_minutes: 15,
        priority: 'recommended',
        rationale: 'Breaks sedentary pattern, improves insulin sensitivity',
        causal_effects: [
            { domain: 'longevity', effect: 'positive', description: 'Reduces mortality risk' },
            { domain: 'mood', effect: 'positive', description: 'Mental clarity boost' }
        ]
    },
    {
        type: 'sleep_prep',
        title: 'Wind-Down Routine',
        description: 'Dim lights, no screens, calming activity',
        emoji: '🌙',
        hour: 21,
        duration_minutes: 60,
        priority: 'essential',
        rationale: 'Signals melatonin production for restorative sleep',
        how_to: 'Dim lights to 50%, read or stretch',
        causal_effects: [
            { domain: 'sleep', effect: 'positive', description: 'Faster sleep onset' },
            { domain: 'recovery', effect: 'positive', description: 'Better overnight recovery' }
        ]
    }
];

const WEEKLY_TRAINING: DailyTemplate[] = [
    {
        type: 'training',
        title: 'Strength Training',
        description: 'Full-body resistance training',
        emoji: '🏋️',
        hour: 10,
        duration_minutes: 45,
        priority: 'essential',
        rationale: 'Builds muscle, strengthens bones, boosts metabolism',
        how_to: 'Squats, deadlifts, presses, rows',
        causal_effects: [
            { domain: 'longevity', effect: 'positive', description: 'Muscle preservation' },
            { domain: 'performance', effect: 'positive', description: 'Strength gains' }
        ],
        days: [1, 3, 5]
    },
    {
        type: 'training',
        title: 'Zone 2 Cardio',
        description: '30-45min aerobic at conversational pace',
        emoji: '🚴',
        hour: 10,
        duration_minutes: 40,
        priority: 'essential',
        rationale: 'Cardiovascular health, mitochondrial biogenesis',
        how_to: 'Walking, cycling at conversational pace',
        causal_effects: [
            { domain: 'longevity', effect: 'positive', description: 'Heart health' },
            { domain: 'energy', effect: 'positive', description: 'Increased stamina' }
        ],
        days: [2, 4, 6]
    }
];

// =====================================================
// ENGINE CLASS
// =====================================================

export class LongevityProtocolEngine {
    private wakeTime: number = 7;
    private bedTime: number = 22;
    private lastTrainingDate: Date | null = null;

    configure(params: {
        wake_time?: number;
        bed_time?: number;
        last_training_date?: Date;
    }): void {
        if (params.wake_time) this.wakeTime = params.wake_time;
        if (params.bed_time) this.bedTime = params.bed_time;
        if (params.last_training_date) this.lastTrainingDate = params.last_training_date;
    }

    private hasSessions(sessions: Session[], date: Date): boolean {
        return sessions.some(s => {
            const sessionDate = s.start_time ? new Date(s.start_time) : null;
            return sessionDate && sessionDate.toDateString() === date.toDateString();
        });
    }

    private getTrainingDeficit(now: Date): number {
        if (!this.lastTrainingDate) return 7;
        const diff = now.getTime() - this.lastTrainingDate.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }

    generateDayProtocol(sessions: Session[], now: Date = new Date()): DayLongevityProtocol {
        const hasSessions = this.hasSessions(sessions, now);
        const deficit = this.getTrainingDeficit(now);
        const actions: LongevityAction[] = [];
        const dayOfWeek = now.getDay();

        if (hasSessions) {
            // Performance mode - minimal prompts
            const essentials = LONGEVITY_DAILY_TEMPLATE.filter(t =>
                t.priority === 'essential' &&
                ['wake_routine', 'sleep_prep', 'hydration'].includes(t.type)
            );
            essentials.forEach(t => actions.push(this.createAction(t, now)));
        } else {
            // Longevity mode - full protocol
            LONGEVITY_DAILY_TEMPLATE.forEach(t => {
                if (!t.days || t.days.includes(dayOfWeek)) {
                    actions.push(this.createAction(t, now));
                }
            });

            // Training recommendation
            if (deficit >= 2) {
                const training = WEEKLY_TRAINING.find(t => t.days?.includes(dayOfWeek));
                if (training) {
                    const action = this.createAction(training, now);
                    if (deficit >= 3) {
                        action.title = `⚠️ ${action.title} (${deficit} days since training)`;
                    }
                    actions.push(action);
                }
            }
        }

        // Sort and update status
        actions.sort((a, b) => a.window_start.getTime() - b.window_start.getTime());
        for (const action of actions) {
            action.is_active = now >= action.window_start && now <= action.window_end;
            action.is_upcoming = !action.is_active && action.window_start > now &&
                (action.window_start.getTime() - now.getTime()) <= 2 * 60 * 60 * 1000;
            action.is_missed = now > action.window_end;
        }

        return {
            date: now,
            mode: hasSessions ? 'performance' : 'longevity',
            has_sessions: hasSessions,
            training_deficit_days: deficit,
            actions,
            active_action: actions.find(a => a.is_active) || null,
            next_action: actions.find(a => a.is_upcoming) || null,
            daily_summary: hasSessions
                ? "Performance mode - focus on your session"
                : `Longevity mode - ${deficit >= 3 ? '⚠️ Training overdue' : 'Follow your protocols'}`
        };
    }

    private createAction(template: DailyTemplate, now: Date): LongevityAction {
        const start = new Date(now);
        start.setHours(template.hour, 0, 0, 0);
        const end = new Date(start.getTime() + (template.duration_minutes + 60) * 60 * 1000);

        return {
            id: `${template.type}_${template.hour}`,
            type: template.type,
            title: template.title,
            description: template.description,
            emoji: template.emoji,
            window_start: start,
            window_end: end,
            duration_minutes: template.duration_minutes,
            priority: template.priority,
            is_active: false,
            is_upcoming: false,
            is_missed: false,
            rationale: template.rationale,
            how_to: template.how_to,
            causal_effects: template.causal_effects
        };
    }
    public static evaluate(state: GlobalState, profile: UserProfile): LongevityAction[] {
        const engine = new LongevityProtocolEngine();
        // Extract sessions from state if possible, or pass empty
        const sessions = state.timeline?.sessions || [];
        const protocol = engine.generateDayProtocol(sessions);
        return protocol.actions;
    }
}

export const longevityEngine = new LongevityProtocolEngine();

export const generateLongevityProtocol = (
    sessions: Session[],
    lastTraining?: Date
): DayLongevityProtocol => {
    longevityEngine.configure({ last_training_date: lastTraining });
    return longevityEngine.generateDayProtocol(sessions);
};
