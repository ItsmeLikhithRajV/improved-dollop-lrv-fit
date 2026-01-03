/**
 * Competition Mental Prep Engine
 * 
 * Generates a comprehensive mental preparation timeline
 * from D-7 to D-Day for competition/event readiness.
 * 
 * Based on sport psychology best practices.
 */

import { BreathworkProtocol, getProtocolById } from './BreathworkDatabase';
import { EmotionRegulationTool, getToolById } from './EmotionRegulationToolkit';

// =====================================================
// TYPES
// =====================================================

export type CompetitionPhase =
    | 'week_before'
    | 'three_days'
    | 'day_before'
    | 'morning_of'
    | 'hours_before'
    | 'minutes_before'
    | 'during'
    | 'post_event';

export interface MentalPrepTask {
    id: string;
    phase: CompetitionPhase;
    title: string;
    emoji: string;
    description: string;

    // Timing
    days_before: number;
    hours_before?: number;
    minutes_before?: number;
    duration_minutes: number;

    // Type
    task_type: 'visualization' | 'breathwork' | 'journaling' | 'review' | 'ritual' | 'regulation';

    // Linked protocols
    protocol_id?: string;
    protocol_type?: 'breathwork' | 'emotion';

    // Content
    prompts?: string[];
    steps?: string[];
    science?: string;

    // Priority
    priority: 'essential' | 'recommended' | 'optional';

    // Personalization
    adjust_for_anxiety: boolean;  // Modify if athlete is anxious type
}

export interface CompetitionMentalPlan {
    event_name: string;
    event_date: Date;
    phases: Record<CompetitionPhase, MentalPrepTask[]>;
    today_focus: MentalPrepTask[];
    current_task: MentalPrepTask | null;
    next_task: MentalPrepTask | null;
    completion_status: Record<string, boolean>;
}

// =====================================================
// MENTAL PREP TASKS DATABASE
// =====================================================

const WEEK_BEFORE_TASKS: MentalPrepTask[] = [
    {
        id: 'week_visualization',
        phase: 'week_before',
        title: 'Course/Match Preview',
        emoji: '🗺️',
        description: 'Visualize the venue, key moments, and your performance.',
        days_before: 7,
        duration_minutes: 15,
        task_type: 'visualization',
        prompts: [
            'Close your eyes. Picture arriving at the venue.',
            'Walk through the space. What do you see, hear, smell?',
            'Imagine key moments going perfectly.',
            'Feel the confidence of a great performance.'
        ],
        priority: 'recommended',
        adjust_for_anxiety: false
    },
    {
        id: 'week_process_goals',
        phase: 'week_before',
        title: 'Set Process Goals',
        emoji: '🎯',
        description: 'Define what YOU control, not outcomes.',
        days_before: 7,
        duration_minutes: 10,
        task_type: 'journaling',
        prompts: [
            'What are 3 things I can CONTROL on the day?',
            'What will "my best effort" look like?',
            'What is my focus cue for key moments?',
            'What would make me proud regardless of result?'
        ],
        priority: 'essential',
        adjust_for_anxiety: true
    },
    {
        id: 'week_routine_check',
        phase: 'week_before',
        title: 'Routine Check',
        emoji: '📝',
        description: 'Review and lock in your pre-event routine.',
        days_before: 6,
        duration_minutes: 5,
        task_type: 'review',
        steps: [
            'Write down your warmup sequence',
            'Note your optimal arousal level (1-10)',
            'Plan your nutrition/hydration',
            'Identify your mental cues'
        ],
        priority: 'recommended',
        adjust_for_anxiety: false
    }
];

const THREE_DAYS_TASKS: MentalPrepTask[] = [
    {
        id: 'd3_confidence_build',
        phase: 'three_days',
        title: 'Confidence Building',
        emoji: '💪',
        description: 'Review past successes and your training.',
        days_before: 3,
        duration_minutes: 10,
        task_type: 'journaling',
        prompts: [
            'List 5 training sessions where you performed well',
            'What qualities have you developed?',
            'What challenges have you already overcome?',
            'Why are you ready for this event?'
        ],
        priority: 'essential',
        adjust_for_anxiety: true
    },
    {
        id: 'd3_detailed_viz',
        phase: 'three_days',
        title: 'Detailed Visualization',
        emoji: '🧠',
        description: 'Full mental rehearsal of the event.',
        days_before: 3,
        duration_minutes: 20,
        task_type: 'visualization',
        prompts: [
            'Start from waking up on event day',
            'Walk through every phase: travel, arrival, warmup',
            'Visualize each key moment in FIRST PERSON',
            'Include how you\'ll handle challenges',
            'End with your post-event celebration'
        ],
        priority: 'essential',
        adjust_for_anxiety: false
    },
    {
        id: 'd3_contingency',
        phase: 'three_days',
        title: 'Contingency Planning',
        emoji: '🛡️',
        description: 'Plan for "what ifs" to reduce surprise anxiety.',
        days_before: 2,
        duration_minutes: 10,
        task_type: 'journaling',
        prompts: [
            'What could go wrong? (Be specific)',
            'For each: What would I do if this happens?',
            'What\'s my reset ritual if I make a mistake?',
            'Who is my support system on the day?'
        ],
        priority: 'recommended',
        adjust_for_anxiety: true
    }
];

const DAY_BEFORE_TASKS: MentalPrepTask[] = [
    {
        id: 'd1_preparation',
        phase: 'day_before',
        title: 'Physical Preparation',
        emoji: '🎒',
        description: 'Pack everything. Remove logistical stress.',
        days_before: 1,
        duration_minutes: 15,
        task_type: 'review',
        steps: [
            'Pack all gear (checklist)',
            'Prepare nutrition/hydration',
            'Set multiple alarms',
            'Lay out clothes'
        ],
        priority: 'essential',
        adjust_for_anxiety: false
    },
    {
        id: 'd1_early_bed',
        phase: 'day_before',
        title: 'Early Wind-Down',
        emoji: '🌙',
        description: 'Start sleep routine 30min earlier than usual.',
        days_before: 1,
        hours_before: 24,
        duration_minutes: 5,
        task_type: 'breathwork',
        protocol_id: 'sleep_onset',
        protocol_type: 'breathwork',
        priority: 'essential',
        adjust_for_anxiety: true
    },
    {
        id: 'd1_brief_viz',
        phase: 'day_before',
        title: 'Quick Success Visualization',
        emoji: '✨',
        description: 'Brief positive visualization before sleep.',
        days_before: 1,
        duration_minutes: 5,
        task_type: 'visualization',
        prompts: [
            'See yourself performing at your best',
            'Feel the satisfaction of a great effort',
            'Trust your preparation',
            'Drift off with confidence'
        ],
        priority: 'recommended',
        adjust_for_anxiety: true
    }
];

const MORNING_OF_TASKS: MentalPrepTask[] = [
    {
        id: 'morning_breath',
        phase: 'morning_of',
        title: 'Morning Breathing',
        emoji: '🌅',
        description: 'Set your nervous system for the day.',
        days_before: 0,
        hours_before: 8,
        duration_minutes: 5,
        task_type: 'breathwork',
        protocol_id: 'box_breathing',
        protocol_type: 'breathwork',
        priority: 'essential',
        adjust_for_anxiety: true
    },
    {
        id: 'morning_affirmation',
        phase: 'morning_of',
        title: 'Affirmation/Intention',
        emoji: '🗣️',
        description: 'Set your intention for the day.',
        days_before: 0,
        hours_before: 7,
        duration_minutes: 3,
        task_type: 'ritual',
        prompts: [
            'Today I choose to focus on [process]',
            'I am prepared and ready',
            'I trust my body and my training',
            'Whatever happens, I give my best'
        ],
        priority: 'essential',
        adjust_for_anxiety: true
    }
];

const HOURS_BEFORE_TASKS: MentalPrepTask[] = [
    {
        id: 'h2_activation',
        phase: 'hours_before',
        title: 'Activation Protocol',
        emoji: '🔥',
        description: 'Build to optimal arousal level.',
        days_before: 0,
        hours_before: 2,
        duration_minutes: 5,
        task_type: 'breathwork',
        protocol_id: 'activation_ladder',
        protocol_type: 'breathwork',
        priority: 'essential',
        adjust_for_anxiety: true
    },
    {
        id: 'h1_focus',
        phase: 'hours_before',
        title: 'Focus Narrowing',
        emoji: '🎯',
        description: 'Narrow attention to task-relevant cues.',
        days_before: 0,
        hours_before: 1,
        duration_minutes: 5,
        task_type: 'ritual',
        steps: [
            'Put away phone/distractions',
            'Reduce social interaction',
            'Focus on physical warmup',
            'Review your 3 process goals'
        ],
        priority: 'recommended',
        adjust_for_anxiety: false
    }
];

const MINUTES_BEFORE_TASKS: MentalPrepTask[] = [
    {
        id: 'm30_final_viz',
        phase: 'minutes_before',
        title: 'Final Visualization',
        emoji: '👁️',
        description: 'Quick mental rehearsal of start.',
        days_before: 0,
        minutes_before: 30,
        duration_minutes: 2,
        task_type: 'visualization',
        prompts: [
            'See the first 30 seconds perfectly',
            'Feel your rhythm and flow',
            'Trust your body to execute'
        ],
        priority: 'recommended',
        adjust_for_anxiety: false
    },
    {
        id: 'm5_sigh',
        phase: 'minutes_before',
        title: 'Reset Breath',
        emoji: '😮‍💨',
        description: 'Physiological sigh to calibrate arousal.',
        days_before: 0,
        minutes_before: 5,
        duration_minutes: 1,
        task_type: 'breathwork',
        protocol_id: 'physiological_sigh',
        protocol_type: 'breathwork',
        priority: 'essential',
        adjust_for_anxiety: true
    },
    {
        id: 'm1_cue',
        phase: 'minutes_before',
        title: 'Activation Cue',
        emoji: '⚡',
        description: 'Your personal trigger word/action.',
        days_before: 0,
        minutes_before: 1,
        duration_minutes: 0.5,
        task_type: 'ritual',
        steps: [
            'Say your power word internally',
            'One focused exhale',
            'GO!'
        ],
        priority: 'optional',
        adjust_for_anxiety: false
    }
];

const POST_EVENT_TASKS: MentalPrepTask[] = [
    {
        id: 'post_decompress',
        phase: 'post_event',
        title: 'Decompression',
        emoji: '🧘',
        description: 'Bring nervous system back down.',
        days_before: -1,
        duration_minutes: 5,
        task_type: 'breathwork',
        protocol_id: 'coherence_breathing',
        protocol_type: 'breathwork',
        priority: 'recommended',
        adjust_for_anxiety: false
    },
    {
        id: 'post_self_compassion',
        phase: 'post_event',
        title: 'Self-Compassion',
        emoji: '💙',
        description: 'Process the experience with kindness.',
        days_before: -1,
        duration_minutes: 5,
        task_type: 'regulation',
        protocol_id: 'self_compassion_break',
        protocol_type: 'emotion',
        priority: 'essential',
        adjust_for_anxiety: true
    },
    {
        id: 'post_debrief',
        phase: 'post_event',
        title: 'Brief Debrief',
        emoji: '📝',
        description: 'Quick reflection (not analysis).',
        days_before: -1,
        duration_minutes: 5,
        task_type: 'journaling',
        prompts: [
            'What am I proud of?',
            'What felt good?',
            'One thing to remember for next time',
            'What do I need right now? (rest, food, connection)'
        ],
        priority: 'recommended',
        adjust_for_anxiety: true
    }
];

// =====================================================
// COMPLETE TASK DATABASE
// =====================================================

export const ALL_MENTAL_PREP_TASKS: MentalPrepTask[] = [
    ...WEEK_BEFORE_TASKS,
    ...THREE_DAYS_TASKS,
    ...DAY_BEFORE_TASKS,
    ...MORNING_OF_TASKS,
    ...HOURS_BEFORE_TASKS,
    ...MINUTES_BEFORE_TASKS,
    ...POST_EVENT_TASKS
];

// =====================================================
// ENGINE CLASS
// =====================================================

export class CompetitionMentalPrepEngine {

    /**
     * Generate a complete mental prep plan for an event
     */
    static generatePlan(
        event_name: string,
        event_date: Date,
        completion_status: Record<string, boolean> = {}
    ): CompetitionMentalPlan {
        const now = new Date();
        const daysUntil = Math.floor((event_date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const hoursUntil = Math.floor((event_date.getTime() - now.getTime()) / (1000 * 60 * 60));
        const minutesUntil = Math.floor((event_date.getTime() - now.getTime()) / (1000 * 60));

        // Get current phase
        const currentPhase = this.getCurrentPhase(daysUntil, hoursUntil, minutesUntil);

        // Group tasks by phase
        const phases: Record<CompetitionPhase, MentalPrepTask[]> = {
            week_before: WEEK_BEFORE_TASKS,
            three_days: THREE_DAYS_TASKS,
            day_before: DAY_BEFORE_TASKS,
            morning_of: MORNING_OF_TASKS,
            hours_before: HOURS_BEFORE_TASKS,
            minutes_before: MINUTES_BEFORE_TASKS,
            during: [],
            post_event: POST_EVENT_TASKS
        };

        // Get today's tasks
        const today_focus = this.getTodaysTasks(daysUntil, hoursUntil, minutesUntil);

        // Find current and next task
        let current_task: MentalPrepTask | null = null;
        let next_task: MentalPrepTask | null = null;

        for (const task of today_focus) {
            if (completion_status[task.id]) continue;

            if (!current_task) {
                current_task = task;
            } else if (!next_task) {
                next_task = task;
                break;
            }
        }

        return {
            event_name,
            event_date,
            phases,
            today_focus,
            current_task,
            next_task,
            completion_status
        };
    }

    /**
     * Get current phase based on time to event
     */
    private static getCurrentPhase(
        daysUntil: number,
        hoursUntil: number,
        minutesUntil: number
    ): CompetitionPhase {
        if (daysUntil >= 4) return 'week_before';
        if (daysUntil >= 2) return 'three_days';
        if (daysUntil === 1) return 'day_before';
        if (hoursUntil >= 3) return 'morning_of';
        if (hoursUntil >= 1) return 'hours_before';
        if (minutesUntil > 0) return 'minutes_before';
        if (minutesUntil >= -120) return 'during';
        return 'post_event';
    }

    /**
     * Get tasks relevant for today
     */
    private static getTodaysTasks(
        daysUntil: number,
        hoursUntil: number,
        minutesUntil: number
    ): MentalPrepTask[] {
        const relevant: MentalPrepTask[] = [];

        for (const task of ALL_MENTAL_PREP_TASKS) {
            // Check if task is for today
            if (task.days_before === daysUntil) {
                relevant.push(task);
            }
            // For day-of tasks, check hours/minutes
            if (task.days_before === 0) {
                if (task.hours_before !== undefined && hoursUntil <= task.hours_before) {
                    if (!relevant.includes(task)) relevant.push(task);
                }
                if (task.minutes_before !== undefined && minutesUntil <= task.minutes_before) {
                    if (!relevant.includes(task)) relevant.push(task);
                }
            }
            // Post-event tasks
            if (task.days_before === -1 && daysUntil < 0) {
                relevant.push(task);
            }
        }

        // Sort by timing
        return relevant.sort((a, b) => {
            const aTime = (a.hours_before || 0) * 60 + (a.minutes_before || 0);
            const bTime = (b.hours_before || 0) * 60 + (b.minutes_before || 0);
            return bTime - aTime;  // Earlier tasks first
        });
    }

    /**
     * Get countdown display
     */
    static getCountdownDisplay(event_date: Date): {
        display: string;
        urgency: 'calm' | 'focused' | 'intense';
        phase_name: string;
    } {
        const now = new Date();
        const diff = event_date.getTime() - now.getTime();

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 3) {
            return {
                display: `${days} days`,
                urgency: 'calm',
                phase_name: 'Preparation Week'
            };
        } else if (days > 0) {
            return {
                display: `${days}d ${hours}h`,
                urgency: 'focused',
                phase_name: 'Final Days'
            };
        } else if (hours > 0) {
            return {
                display: `${hours}h ${minutes}m`,
                urgency: 'focused',
                phase_name: 'Event Day'
            };
        } else if (minutes > 0) {
            return {
                display: `${minutes} min`,
                urgency: 'intense',
                phase_name: 'Final Prep'
            };
        } else {
            return {
                display: 'NOW',
                urgency: 'intense',
                phase_name: 'Showtime'
            };
        }
    }

    /**
     * Adjust plan for anxious athlete type
     */
    static adjustForAnxiety(
        plan: CompetitionMentalPlan,
        anxiety_level: 'low' | 'moderate' | 'high'
    ): CompetitionMentalPlan {
        if (anxiety_level === 'low') return plan;

        const adjusted = { ...plan };

        // Filter today's tasks to emphasize calming ones
        adjusted.today_focus = adjusted.today_focus.map(task => {
            if (task.adjust_for_anxiety && anxiety_level === 'high') {
                // Add calming elements
                return {
                    ...task,
                    prompts: [
                        ...(task.prompts || []),
                        'Remember: Anxiety is excitement without breath.',
                        'You\'ve done this before. Trust yourself.'
                    ]
                };
            }
            return task;
        });

        return adjusted;
    }
}
