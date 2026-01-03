/**
 * Mind Protocol Engine
 * 
 * Generates session-aware breathwork and mindfulness protocols:
 * - Activating breathwork (Wim Hof, power breathing) - Morning / pre-session
 * - Calming breathwork (4-7-8, box breathing) - Evening / post-session / pre-sleep
 * - Focus protocols - Before demanding tasks
 * - Stress response - Acute stress situations
 * 
 * Timing based on circadian rhythm and session context.
 */

import { GoalType } from '../../types/goals';
import { Session, generateFuelWindows, DayFuelProtocol, FuelWindow } from '../nutritionist/SessionFuelProtocolEngine';

// =====================================================
// TYPES
// =====================================================

export type MindPracticeType =
    | 'breathwork_activating'    // Wim Hof, tummo, power breathing
    | 'breathwork_calming'       // 4-7-8, physiological sigh, box breathing
    | 'breathwork_focus'         // Box breathing for concentration
    | 'meditation'               // Mindfulness, body scan
    | 'visualization'            // Performance visualization
    | 'gratitude';               // Gratitude practice

export type MindContext =
    | 'wake'           // Morning routine
    | 'pre_session'    // Before workout/competition
    | 'post_session'   // Downregulation after workout
    | 'pre_sleep'      // Evening wind-down
    | 'acute_stress'   // Immediate stress response
    | 'focus';         // Before demanding task

export interface MindWindow {
    id: string;
    type: MindPracticeType;
    context: MindContext;
    title: string;
    description: string;
    emoji: string;
    technique: string;
    window_start: Date;
    window_end: Date;
    duration_minutes: number;
    priority: 'essential' | 'recommended' | 'optional';
    is_active: boolean;
    is_upcoming: boolean;
    is_missed: boolean;
    session_relative: boolean;
    session_id?: string;
    how_to: string;
    rationale: string;
    causal_effects: CausalEffect[];
}

export interface CausalEffect {
    domain: 'stress' | 'focus' | 'energy' | 'sleep' | 'performance' | 'recovery';
    effect: 'positive' | 'negative';
    description: string;
}

export interface DayMindProtocol {
    date: Date;
    sessions: Session[];
    all_windows: MindWindow[];
    active_window: MindWindow | null;
    next_window: MindWindow | null;
    stress_protocol: MindWindow;  // Always available for acute stress
}

// =====================================================
// MIND PRACTICE DATABASE
// =====================================================

interface MindPractice {
    type: MindPracticeType;
    context: MindContext[];
    title: string;
    emoji: string;
    technique: string;
    duration_minutes: number;
    how_to: string;
    rationale: string;
    causal_effects: CausalEffect[];
}

const MIND_PRACTICES: MindPractice[] = [
    // --- ACTIVATING ---
    {
        type: 'breathwork_activating',
        context: ['wake', 'pre_session'],
        title: 'Activating Breathwork',
        emoji: '🔥',
        technique: 'Wim Hof Method or Power Breathing',
        duration_minutes: 10,
        how_to: '30 deep breaths, hold on exhale for 1-2min, repeat 3 rounds',
        rationale: 'Increases alertness, releases adrenaline, prepares body for action',
        causal_effects: [
            { domain: 'energy', effect: 'positive', description: '+40% alertness for 2h' },
            { domain: 'stress', effect: 'positive', description: 'Controlled stress inoculation' },
            { domain: 'performance', effect: 'positive', description: 'Enhanced exercise readiness' }
        ]
    },

    // --- CALMING ---
    {
        type: 'breathwork_calming',
        context: ['post_session', 'pre_sleep'],
        title: 'Calming Breathwork',
        emoji: '🌊',
        technique: '4-7-8 Breathing or Physiological Sigh',
        duration_minutes: 5,
        how_to: 'Inhale 4s → Hold 7s → Exhale 8s. Or: Double inhale → Long exhale',
        rationale: 'Activates parasympathetic, lowers cortisol, promotes relaxation',
        causal_effects: [
            { domain: 'stress', effect: 'positive', description: 'Immediate cortisol reduction' },
            { domain: 'recovery', effect: 'positive', description: 'Faster post-workout recovery' },
            { domain: 'sleep', effect: 'positive', description: 'Improved sleep onset' }
        ]
    },
    {
        type: 'breathwork_calming',
        context: ['acute_stress'],
        title: 'Stress Reset',
        emoji: '🆘',
        technique: 'Cyclic Sighing',
        duration_minutes: 3,
        how_to: 'Double inhale through nose → Long slow exhale through mouth. Repeat 3-5 min.',
        rationale: 'Fastest method to reduce acute stress and lower heart rate',
        causal_effects: [
            { domain: 'stress', effect: 'positive', description: 'Acute stress relief in <5min' },
            { domain: 'focus', effect: 'positive', description: 'Restored cognitive function' }
        ]
    },

    // --- FOCUS ---
    {
        type: 'breathwork_focus',
        context: ['focus', 'pre_session'],
        title: 'Focus Breathwork',
        emoji: '🎯',
        technique: 'Box Breathing',
        duration_minutes: 5,
        how_to: 'Inhale 4s → Hold 4s → Exhale 4s → Hold 4s. Repeat 5-10 min.',
        rationale: 'Balances nervous system, enhances concentration and calm alertness',
        causal_effects: [
            { domain: 'focus', effect: 'positive', description: 'Enhanced concentration for 1-2h' },
            { domain: 'stress', effect: 'positive', description: 'Anxiety reduction' },
            { domain: 'performance', effect: 'positive', description: 'Optimal arousal for performance' }
        ]
    },

    // --- MEDITATION ---
    {
        type: 'meditation',
        context: ['wake', 'pre_sleep'],
        title: 'Mindfulness Meditation',
        emoji: '🧘',
        technique: 'Breath-focused or Body Scan',
        duration_minutes: 10,
        how_to: 'Sit comfortably, focus on breath, gently return attention when mind wanders',
        rationale: 'Builds metacognition, reduces baseline stress, improves emotional regulation',
        causal_effects: [
            { domain: 'stress', effect: 'positive', description: 'Lower baseline cortisol' },
            { domain: 'focus', effect: 'positive', description: 'Improved attention span' },
            { domain: 'sleep', effect: 'positive', description: 'Better sleep quality over time' }
        ]
    },

    // --- VISUALIZATION ---
    {
        type: 'visualization',
        context: ['pre_session'],
        title: 'Performance Visualization',
        emoji: '🏆',
        technique: 'Mental Rehearsal',
        duration_minutes: 5,
        how_to: 'Close eyes, vividly imagine successful execution of upcoming session',
        rationale: 'Neural activation without physical fatigue, enhances skill execution',
        causal_effects: [
            { domain: 'performance', effect: 'positive', description: 'Improved motor pattern execution' },
            { domain: 'focus', effect: 'positive', description: 'Enhanced session focus' }
        ]
    }
];

// =====================================================
// ENGINE CLASS
// =====================================================

export class MindProtocolEngine {
    private wakeTime: number = 7;
    private bedTime: number = 22;
    private userGoal: GoalType = 'hybrid';

    configure(params: {
        wake_time?: number;
        bed_time?: number;
        goal?: GoalType;
    }): void {
        if (params.wake_time) this.wakeTime = params.wake_time;
        if (params.bed_time) this.bedTime = params.bed_time;
        if (params.goal) this.userGoal = params.goal;
    }

    /**
     * Get session start time
     */
    private getSessionTime(session: Session): Date {
        if (session.start_time) return new Date(session.start_time);
        if (session.time) {
            const [h, m] = session.time.split(':').map(Number);
            const d = new Date();
            d.setHours(h, m, 0, 0);
            return d;
        }
        return new Date();
    }

    /**
     * Get session end time
     */
    private getSessionEndTime(session: Session): Date {
        const start = this.getSessionTime(session);
        const duration = session.duration_minutes || session.duration_min || 60;
        return new Date(start.getTime() + duration * 60 * 1000);
    }

    /**
     * Generate day mind protocol
     */
    generateDayProtocol(sessions: Session[], now: Date = new Date()): DayMindProtocol {
        const todaysSessions = sessions.filter(s => {
            const d = this.getSessionTime(s);
            return d.toDateString() === now.toDateString();
        });

        const windows: MindWindow[] = [];

        // Morning activating breathwork (always)
        const morningPractice = MIND_PRACTICES.find(p =>
            p.type === 'breathwork_activating' && p.context.includes('wake')
        );
        if (morningPractice) {
            windows.push(this.createWindow(morningPractice, 'wake', this.wakeTime, now));
        }

        // Morning meditation (optional)
        const morningMed = MIND_PRACTICES.find(p =>
            p.type === 'meditation' && p.context.includes('wake')
        );
        if (morningMed) {
            windows.push(this.createWindow(morningMed, 'wake', this.wakeTime + 0.5, now));
        }

        // Session-relative protocols
        for (const session of todaysSessions) {
            const sessionStart = this.getSessionTime(session);
            const sessionEnd = this.getSessionEndTime(session);

            // Pre-session: Focus breathwork or visualization
            const preFocus = MIND_PRACTICES.find(p => p.type === 'breathwork_focus');
            if (preFocus) {
                const preWindow = this.createWindowRelative(preFocus, 'pre_session', sessionStart, -15, now);
                preWindow.session_id = session.id;
                preWindow.session_relative = true;
                windows.push(preWindow);
            }

            // Post-session: Calming breathwork
            const postCalm = MIND_PRACTICES.find(p =>
                p.type === 'breathwork_calming' && p.context.includes('post_session')
            );
            if (postCalm) {
                const postWindow = this.createWindowRelative(postCalm, 'post_session', sessionEnd, 10, now);
                postWindow.session_id = session.id;
                postWindow.session_relative = true;
                windows.push(postWindow);
            }
        }

        // Pre-sleep calming (always)
        const preSleep = MIND_PRACTICES.find(p =>
            p.type === 'breathwork_calming' && p.context.includes('pre_sleep')
        );
        if (preSleep) {
            windows.push(this.createWindow(preSleep, 'pre_sleep', this.bedTime - 1, now));
        }

        // Sort and update status
        windows.sort((a, b) => a.window_start.getTime() - b.window_start.getTime());
        for (const w of windows) {
            w.is_active = now >= w.window_start && now <= w.window_end;
            w.is_upcoming = !w.is_active && w.window_start > now &&
                (w.window_start.getTime() - now.getTime()) <= 60 * 60 * 1000;
            w.is_missed = now > w.window_end;
        }

        // Stress protocol (always available)
        const stressProtocol = this.createStressProtocol(now);

        return {
            date: now,
            sessions: todaysSessions,
            all_windows: windows,
            active_window: windows.find(w => w.is_active) || null,
            next_window: windows.find(w => w.is_upcoming) || null,
            stress_protocol: stressProtocol
        };
    }

    /**
     * Create a mind window at a specific hour
     */
    private createWindow(practice: MindPractice, context: MindContext, hour: number, now: Date): MindWindow {
        const start = new Date(now);
        start.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0);
        const end = new Date(start.getTime() + (practice.duration_minutes + 30) * 60 * 1000);

        return {
            id: `${practice.type}_${context}_${hour}`,
            type: practice.type,
            context,
            title: practice.title,
            description: practice.technique,
            emoji: practice.emoji,
            technique: practice.technique,
            window_start: start,
            window_end: end,
            duration_minutes: practice.duration_minutes,
            priority: context === 'wake' || context === 'pre_sleep' ? 'essential' : 'recommended',
            is_active: false,
            is_upcoming: false,
            is_missed: false,
            session_relative: false,
            how_to: practice.how_to,
            rationale: practice.rationale,
            causal_effects: practice.causal_effects
        };
    }

    /**
     * Create a window relative to a session time
     */
    private createWindowRelative(
        practice: MindPractice,
        context: MindContext,
        referenceTime: Date,
        offsetMinutes: number,
        now: Date
    ): MindWindow {
        const start = new Date(referenceTime.getTime() + offsetMinutes * 60 * 1000);
        const end = new Date(start.getTime() + (practice.duration_minutes + 15) * 60 * 1000);

        return {
            id: `${practice.type}_${context}_${start.getTime()}`,
            type: practice.type,
            context,
            title: practice.title,
            description: practice.technique,
            emoji: practice.emoji,
            technique: practice.technique,
            window_start: start,
            window_end: end,
            duration_minutes: practice.duration_minutes,
            priority: 'recommended',
            is_active: false,
            is_upcoming: false,
            is_missed: false,
            session_relative: true,
            how_to: practice.how_to,
            rationale: practice.rationale,
            causal_effects: practice.causal_effects
        };
    }

    /**
     * Create stress protocol (always available)
     */
    private createStressProtocol(now: Date): MindWindow {
        const practice = MIND_PRACTICES.find(p => p.context.includes('acute_stress'))!;

        return {
            id: 'stress_reset',
            type: practice.type,
            context: 'acute_stress',
            title: practice.title,
            description: 'Available anytime for acute stress',
            emoji: practice.emoji,
            technique: practice.technique,
            window_start: now,
            window_end: new Date(now.getTime() + 24 * 60 * 60 * 1000),
            duration_minutes: practice.duration_minutes,
            priority: 'essential',
            is_active: true,
            is_upcoming: false,
            is_missed: false,
            session_relative: false,
            how_to: practice.how_to,
            rationale: practice.rationale,
            causal_effects: practice.causal_effects
        };
    }
}

// =====================================================
// SINGLETON & EXPORTS
// =====================================================

export const mindEngine = new MindProtocolEngine();

export const generateMindProtocol = (
    sessions: Session[],
    wakeTime?: number,
    bedTime?: number
): DayMindProtocol => {
    mindEngine.configure({ wake_time: wakeTime, bed_time: bedTime });
    return mindEngine.generateDayProtocol(sessions);
};
