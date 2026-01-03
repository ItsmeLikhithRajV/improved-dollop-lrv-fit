/**
 * AdaptiveTimelineEngine
 * 
 * Generates personalized daily timeline based on:
 * - User's actual wake/sleep patterns (not fixed times)
 * - Chronotype (Lion/Bear/Wolf/Dolphin)
 * - Relative timing (Wake+Xh, Sleep-Xh)
 * - Training schedule (if athlete)
 * - Learning from behavior patterns
 * 
 * Core principle: The timeline adapts to the USER, not the other way around.
 */

// =====================================================
// TYPES
// =====================================================

export type Chronotype = 'lion' | 'bear' | 'wolf' | 'dolphin';

export type ProtocolDomain =
    | 'longevity'
    | 'recovery'
    | 'fuel'
    | 'mind'
    | 'training'
    | 'sleep';

export type RelativeAnchor = 'wake' | 'sleep' | 'training' | 'first_meal' | 'last_meal';

export interface UserTimeAnchors {
    // Current day
    wake_time_today: Date | null;
    target_bed_time: Date;

    // Patterns (7-day averages)
    typical_wake_time: string;      // "07:30"
    typical_bed_time: string;       // "23:00"

    // Work/life constraints
    work_start_time?: string;
    work_end_time?: string;

    // Training (if athlete)
    training_time?: string;
    has_training_today: boolean;

    // Eating window
    first_meal_time: string;
    last_meal_time: string;

    // Detected from patterns
    chronotype: Chronotype;
}

export interface AdaptiveProtocol {
    id: string;
    name: string;
    description: string;
    domain: ProtocolDomain;
    emoji: string;

    // Relative timing
    relative_to: RelativeAnchor;
    offset_minutes: number;        // Positive = after anchor, Negative = before anchor
    window_minutes: number;        // How long the window is open

    // Priority and flexibility
    priority: 'critical' | 'high' | 'medium' | 'low';
    is_skippable: boolean;

    // Conditions
    only_if_training?: boolean;
    only_if_no_training?: boolean;
    min_recovery_score?: number;

    // Duration
    duration_minutes: number;
}

export interface ScheduledAction {
    id: string;
    protocol: AdaptiveProtocol;
    scheduled_time: Date;
    window_end: Date;
    is_active: boolean;
    is_completed: boolean;
    is_skipped: boolean;
    relative_label: string;  // "Wake +2h" or "Sleep -3h"
}

export interface AdaptiveTimeline {
    date: Date;
    anchors: UserTimeAnchors;

    // Grouped by time of day
    morning: ScheduledAction[];    // Wake to Wake+4h
    midday: ScheduledAction[];     // Wake+4h to Sleep-6h
    evening: ScheduledAction[];    // Sleep-6h to Sleep-2h
    wind_down: ScheduledAction[];  // Sleep-2h to Sleep

    // Flat sorted list
    all_actions: ScheduledAction[];

    // Current context
    current_action: ScheduledAction | null;
    next_action: ScheduledAction | null;
}

// =====================================================
// PROTOCOL LIBRARY (Relative Timing)
// =====================================================

const LONGEVITY_PROTOCOLS: AdaptiveProtocol[] = [
    {
        id: 'morning_light',
        name: 'Morning Sunlight',
        description: 'Get 10-15 min of natural light to set circadian rhythm',
        domain: 'longevity',
        emoji: '☀️',
        relative_to: 'wake',
        offset_minutes: 0,
        window_minutes: 60,
        priority: 'critical',
        is_skippable: false,
        duration_minutes: 15
    },
    {
        id: 'morning_movement',
        name: 'Morning Movement',
        description: 'Light movement to activate the body',
        domain: 'longevity',
        emoji: '🚶',
        relative_to: 'wake',
        offset_minutes: 30,
        window_minutes: 60,
        priority: 'medium',
        is_skippable: true,
        duration_minutes: 10
    },
    {
        id: 'caffeine_cutoff',
        name: 'Caffeine Cutoff',
        description: 'No caffeine after this point for quality sleep',
        domain: 'longevity',
        emoji: '☕',
        relative_to: 'sleep',
        offset_minutes: -600, // 10 hours before bed
        window_minutes: 0,
        priority: 'high',
        is_skippable: true,
        duration_minutes: 0
    },
    {
        id: 'cold_exposure',
        name: 'Cold Exposure',
        description: 'Cold shower or plunge for hormesis',
        domain: 'longevity',
        emoji: '🧊',
        relative_to: 'wake',
        offset_minutes: 120, // 2 hours after wake
        window_minutes: 240, // 4 hour window
        priority: 'medium',
        is_skippable: true,
        duration_minutes: 5
    },
    {
        id: 'dim_lights',
        name: 'Dim Lights',
        description: 'Reduce blue light exposure, dim screens',
        domain: 'longevity',
        emoji: '🌙',
        relative_to: 'sleep',
        offset_minutes: -120, // 2 hours before bed
        window_minutes: 0,
        priority: 'high',
        is_skippable: false,
        duration_minutes: 0
    },
    {
        id: 'wind_down',
        name: 'Wind Down Routine',
        description: 'Begin relaxation routine for sleep',
        domain: 'longevity',
        emoji: '😌',
        relative_to: 'sleep',
        offset_minutes: -60, // 1 hour before bed
        window_minutes: 30,
        priority: 'high',
        is_skippable: false,
        duration_minutes: 30
    },
    {
        id: 'sleep_supplements',
        name: 'Sleep Stack',
        description: 'Magnesium, glycine, or other sleep support',
        domain: 'longevity',
        emoji: '💊',
        relative_to: 'sleep',
        offset_minutes: -45,
        window_minutes: 30,
        priority: 'medium',
        is_skippable: true,
        duration_minutes: 5
    }
];

const FUEL_PROTOCOLS: AdaptiveProtocol[] = [
    {
        id: 'first_meal',
        name: 'First Meal Window',
        description: 'Break fast with protein-focused meal',
        domain: 'fuel',
        emoji: '🍳',
        relative_to: 'first_meal',
        offset_minutes: 0,
        window_minutes: 60,
        priority: 'high',
        is_skippable: false,
        duration_minutes: 30
    },
    {
        id: 'last_meal',
        name: 'Last Meal',
        description: 'Final meal of the day',
        domain: 'fuel',
        emoji: '🍽️',
        relative_to: 'sleep',
        offset_minutes: -180, // 3 hours before bed
        window_minutes: 60,
        priority: 'high',
        is_skippable: false,
        duration_minutes: 30
    },
    {
        id: 'pre_training_fuel',
        name: 'Pre-Training Fuel',
        description: 'Carbs and protein before training',
        domain: 'fuel',
        emoji: '⚡',
        relative_to: 'training',
        offset_minutes: -90, // 90 min before training
        window_minutes: 30,
        priority: 'high',
        is_skippable: false,
        only_if_training: true,
        duration_minutes: 20
    },
    {
        id: 'post_training_fuel',
        name: 'Post-Training Nutrition',
        description: 'Protein and carbs for recovery',
        domain: 'fuel',
        emoji: '🥤',
        relative_to: 'training',
        offset_minutes: 30, // 30 min after training
        window_minutes: 90,
        priority: 'critical',
        is_skippable: false,
        only_if_training: true,
        duration_minutes: 15
    }
];

const RECOVERY_PROTOCOLS: AdaptiveProtocol[] = [
    {
        id: 'breathwork_morning',
        name: 'Morning Breathwork',
        description: '5-10 min breathing to activate parasympathetic',
        domain: 'recovery',
        emoji: '🧘',
        relative_to: 'wake',
        offset_minutes: 45,
        window_minutes: 60,
        priority: 'medium',
        is_skippable: true,
        duration_minutes: 10
    },
    {
        id: 'post_training_recovery',
        name: 'Recovery Protocol',
        description: 'Stretching, foam rolling, or mobility',
        domain: 'recovery',
        emoji: '🔄',
        relative_to: 'training',
        offset_minutes: 60,
        window_minutes: 120,
        priority: 'high',
        is_skippable: true,
        only_if_training: true,
        duration_minutes: 15
    }
];

const MIND_PROTOCOLS: AdaptiveProtocol[] = [
    {
        id: 'journaling',
        name: 'Journal / Reflect',
        description: 'Morning pages or evening reflection',
        domain: 'mind',
        emoji: '📝',
        relative_to: 'wake',
        offset_minutes: 60,
        window_minutes: 120,
        priority: 'low',
        is_skippable: true,
        duration_minutes: 10
    },
    {
        id: 'evening_gratitude',
        name: 'Gratitude Practice',
        description: 'Reflect on 3 things from the day',
        domain: 'mind',
        emoji: '🙏',
        relative_to: 'sleep',
        offset_minutes: -90,
        window_minutes: 30,
        priority: 'low',
        is_skippable: true,
        duration_minutes: 5
    }
];

// =====================================================
// CORE ENGINE
// =====================================================

export class AdaptiveTimelineEngine {

    /**
     * Detect chronotype from sleep patterns
     */
    static detectChronotype(
        avgWakeTime: string,
        avgSleepTime: string,
        sleepOnset: number // minutes to fall asleep
    ): Chronotype {
        const wakeHour = parseInt(avgWakeTime.split(':')[0]);
        const sleepHour = parseInt(avgSleepTime.split(':')[0]);

        // Lion: Wakes before 6:30, sleeps before 22:00
        if (wakeHour < 6 || (wakeHour === 6 && parseInt(avgWakeTime.split(':')[1]) < 30)) {
            return 'lion';
        }

        // Wolf: Wakes after 9:00, sleeps after midnight
        if (wakeHour >= 9 || sleepHour >= 24 || sleepHour < 6) {
            return 'wolf';
        }

        // Dolphin: Light sleeper, takes long to fall asleep
        if (sleepOnset > 30) {
            return 'dolphin';
        }

        // Bear: Everyone else (majority)
        return 'bear';
    }

    /**
     * Calculate actual time from relative anchor + offset
     */
    static calculateAbsoluteTime(
        anchor: RelativeAnchor,
        offsetMinutes: number,
        anchors: UserTimeAnchors
    ): Date {
        let baseTime: Date;

        switch (anchor) {
            case 'wake':
                baseTime = anchors.wake_time_today || this.parseTimeToday(anchors.typical_wake_time);
                break;
            case 'sleep':
                baseTime = anchors.target_bed_time;
                break;
            case 'training':
                baseTime = anchors.training_time
                    ? this.parseTimeToday(anchors.training_time)
                    : new Date();
                break;
            case 'first_meal':
                baseTime = this.parseTimeToday(anchors.first_meal_time);
                break;
            case 'last_meal':
                baseTime = this.parseTimeToday(anchors.last_meal_time);
                break;
            default:
                baseTime = new Date();
        }

        return new Date(baseTime.getTime() + offsetMinutes * 60 * 1000);
    }

    /**
     * Parse time string to today's date
     */
    static parseTimeToday(timeStr: string): Date {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const today = new Date();
        today.setHours(hours, minutes, 0, 0);
        return today;
    }

    /**
     * Generate relative label (e.g., "Wake +2h" or "Sleep -3h")
     */
    static generateRelativeLabel(
        anchor: RelativeAnchor,
        offsetMinutes: number
    ): string {
        const hours = Math.abs(offsetMinutes) / 60;
        const sign = offsetMinutes >= 0 ? '+' : '-';

        const anchorLabel = anchor === 'wake' ? 'Wake' :
            anchor === 'sleep' ? 'Sleep' :
                anchor === 'training' ? 'Train' : anchor;

        if (hours < 1) {
            return `${anchorLabel} ${sign}${Math.abs(offsetMinutes)}m`;
        }

        return `${anchorLabel} ${sign}${hours.toFixed(hours % 1 === 0 ? 0 : 1)}h`;
    }

    /**
     * Convert a user Session to an AdaptiveProtocol
     */
    static convertSessionToProtocol(session: any): AdaptiveProtocol {
        // Determine emoji based on session type
        const emojiMap: Record<string, string> = {
            sport: '💪',
            training: '💪',
            strength: '🏋️',
            cardio: '🏃',
            recovery: '🔄',
            yoga: '🧘',
            mobility: '🤸',
            swimming: '🏊',
            cycling: '🚴',
            running: '🏃',
            default: '⚡'
        };

        const emoji = emojiMap[session.type?.toLowerCase()] || emojiMap.default;

        return {
            id: `session_${session.id}`,
            name: session.title || 'Training Session',
            description: session.description || `${session.type} session`,
            domain: 'training' as ProtocolDomain,
            emoji,
            relative_to: 'wake' as RelativeAnchor, // Will be overridden with absolute time
            offset_minutes: 0,
            window_minutes: 30, // 30 min flexibility
            priority: session.mandatory ? 'critical' : 'high',
            is_skippable: !session.mandatory,
            duration_minutes: session.duration_minutes || 60
        };
    }

    /**
     * Generate the full adaptive timeline for today
     * Now accepts user sessions to merge into the unified timeline
     */
    static generateTimeline(
        anchors: UserTimeAnchors,
        recoveryScore: number = 80,
        userSessions: any[] = [],
        customProtocols: AdaptiveProtocol[] = []
    ): AdaptiveTimeline {
        const now = new Date();

        // Collect all protocols
        const allProtocols = [
            ...LONGEVITY_PROTOCOLS,
            ...FUEL_PROTOCOLS,
            ...RECOVERY_PROTOCOLS,
            ...MIND_PROTOCOLS,
            ...customProtocols
        ];

        // Filter based on conditions
        const applicableProtocols = allProtocols.filter(p => {
            if (p.only_if_training && !anchors.has_training_today) return false;
            if (p.only_if_no_training && anchors.has_training_today) return false;
            if (p.min_recovery_score && recoveryScore < p.min_recovery_score) return false;
            return true;
        });

        // Schedule each protocol
        const scheduledActions: ScheduledAction[] = applicableProtocols.map(protocol => {
            const scheduledTime = this.calculateAbsoluteTime(
                protocol.relative_to,
                protocol.offset_minutes,
                anchors
            );

            const windowEnd = new Date(scheduledTime.getTime() + protocol.window_minutes * 60 * 1000);

            const isActive = now >= scheduledTime && now <= windowEnd;

            return {
                id: `${protocol.id}_${now.toDateString()}`,
                protocol,
                scheduled_time: scheduledTime,
                window_end: windowEnd,
                is_active: isActive,
                is_completed: false,
                is_skipped: false,
                relative_label: this.generateRelativeLabel(protocol.relative_to, protocol.offset_minutes)
            };
        });

        // MERGE USER SESSIONS into the timeline
        userSessions.forEach(session => {
            if (!session.time_of_day) return; // Skip sessions without time

            const sessionProtocol = this.convertSessionToProtocol(session);
            const sessionTime = this.parseTimeToday(session.time_of_day);
            const sessionEnd = new Date(sessionTime.getTime() + (session.duration_minutes || 60) * 60 * 1000);

            const isActive = now >= sessionTime && now <= sessionEnd;

            scheduledActions.push({
                id: `session_${session.id}_${now.toDateString()}`,
                protocol: sessionProtocol,
                scheduled_time: sessionTime,
                window_end: sessionEnd,
                is_active: isActive,
                is_completed: session.completed || false,
                is_skipped: false,
                relative_label: 'Scheduled'
            });
        });

        // Sort by scheduled time
        scheduledActions.sort((a, b) => a.scheduled_time.getTime() - b.scheduled_time.getTime());

        // Categorize into time blocks
        const wakeTime = anchors.wake_time_today || this.parseTimeToday(anchors.typical_wake_time);
        const sleepTime = anchors.target_bed_time;

        const morning: ScheduledAction[] = [];
        const midday: ScheduledAction[] = [];
        const evening: ScheduledAction[] = [];
        const wind_down: ScheduledAction[] = [];

        const morningEnd = new Date(wakeTime.getTime() + 4 * 60 * 60 * 1000);
        const eveningStart = new Date(sleepTime.getTime() - 6 * 60 * 60 * 1000);
        const windDownStart = new Date(sleepTime.getTime() - 2 * 60 * 60 * 1000);

        scheduledActions.forEach(action => {
            const time = action.scheduled_time;
            if (time >= windDownStart) {
                wind_down.push(action);
            } else if (time >= eveningStart) {
                evening.push(action);
            } else if (time <= morningEnd) {
                morning.push(action);
            } else {
                midday.push(action);
            }
        });

        // Find current and next actions
        const currentAction = scheduledActions.find(a => a.is_active) || null;
        const nextAction = scheduledActions.find(a =>
            a.scheduled_time > now && !a.is_completed && !a.is_skipped
        ) || null;

        return {
            date: now,
            anchors,
            morning,
            midday,
            evening,
            wind_down,
            all_actions: scheduledActions,
            current_action: currentAction,
            next_action: nextAction
        };
    }

    /**
     * Get default anchors based on user profile and patterns
     */
    static getDefaultAnchors(
        userProfile: any,
        sleepData: any,
        trainingSession: any
    ): UserTimeAnchors {
        // Default to Bear chronotype patterns
        const typicalWake = userProfile?.typical_wake_time || '07:30';
        const typicalSleep = userProfile?.typical_bed_time || '23:00';

        const chronotype = this.detectChronotype(
            typicalWake,
            typicalSleep,
            sleepData?.sleep_onset_minutes || 15
        );

        return {
            wake_time_today: sleepData?.wake_time ? new Date(sleepData.wake_time) : null,
            target_bed_time: this.parseTimeToday(typicalSleep),
            typical_wake_time: typicalWake,
            typical_bed_time: typicalSleep,
            work_start_time: userProfile?.work_start_time,
            work_end_time: userProfile?.work_end_time,
            training_time: trainingSession?.time_of_day,
            has_training_today: !!trainingSession,
            first_meal_time: userProfile?.first_meal_time || '08:00',
            last_meal_time: userProfile?.last_meal_time || '20:00',
            chronotype
        };
    }
}

export default AdaptiveTimelineEngine;
