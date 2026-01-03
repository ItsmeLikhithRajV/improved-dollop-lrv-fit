/**
 * Weekly Reminder Service
 * 
 * Manages weekly reminders for:
 * - Weigh-in prompts
 * - Weekly progress reviews
 * - Periodic health check-ins
 */

import { GlobalState } from '../types';

// =====================================================
// TYPES
// =====================================================

export interface WeeklyReminder {
    id: string;
    type: 'weigh_in' | 'progress_review' | 'health_checkin';
    title: string;
    message: string;
    dayOfWeek: number;  // 0 = Sunday, 1 = Monday, etc.
    preferredTime: string;  // "08:00"
    lastCompleted?: string;  // ISO date
    snoozeUntil?: string;  // ISO date
    enabled: boolean;
}

export interface ReminderCheck {
    shouldShow: boolean;
    reminder: WeeklyReminder | null;
    daysSinceLastWeighIn: number;
    isOverdue: boolean;
}

// =====================================================
// DEFAULT REMINDERS
// =====================================================

export const DEFAULT_REMINDERS: WeeklyReminder[] = [
    {
        id: 'weekly_weigh_in',
        type: 'weigh_in',
        title: 'Weekly Weigh-in',
        message: 'Time for your weekly weigh-in! Track your progress to keep your fuel calculations accurate.',
        dayOfWeek: 1,  // Monday
        preferredTime: '08:00',
        enabled: true
    },
    {
        id: 'weekly_progress',
        type: 'progress_review',
        title: 'Weekly Progress',
        message: 'Review your week: training volume, recovery patterns, and fuel compliance.',
        dayOfWeek: 0,  // Sunday
        preferredTime: '10:00',
        enabled: true
    }
];

// =====================================================
// REMINDER SERVICE
// =====================================================

export class WeeklyReminderService {
    private reminders: WeeklyReminder[];

    constructor(initialReminders: WeeklyReminder[] = DEFAULT_REMINDERS) {
        this.reminders = initialReminders;
    }

    /**
     * Check if any reminders should be shown now
     */
    checkReminders(state: GlobalState, now: Date = new Date()): ReminderCheck[] {
        const results: ReminderCheck[] = [];

        for (const reminder of this.reminders) {
            if (!reminder.enabled) continue;

            const result = this.checkSingleReminder(reminder, state, now);
            if (result.shouldShow) {
                results.push(result);
            }
        }

        return results;
    }

    /**
     * Check a single reminder
     */
    private checkSingleReminder(
        reminder: WeeklyReminder,
        state: GlobalState,
        now: Date
    ): ReminderCheck {
        const dayOfWeek = now.getDay();
        const hour = now.getHours();
        const preferredHour = parseInt(reminder.preferredTime.split(':')[0]);

        // Check if snoozed
        if (reminder.snoozeUntil) {
            const snoozeDate = new Date(reminder.snoozeUntil);
            if (now < snoozeDate) {
                return { shouldShow: false, reminder: null, daysSinceLastWeighIn: 0, isOverdue: false };
            }
        }

        // Check last completed
        const lastWeighIn = state.user_profile?.body_composition?.last_updated;
        const daysSinceLastWeighIn = lastWeighIn
            ? Math.floor((now.getTime() - new Date(lastWeighIn).getTime()) / (1000 * 60 * 60 * 24))
            : 999;  // Never weighed in

        const isOverdue = daysSinceLastWeighIn >= 7;

        // Show if it's the right day and time, OR if overdue
        const isRightDay = dayOfWeek === reminder.dayOfWeek;
        const isRightTime = hour >= preferredHour && hour < preferredHour + 2;
        const shouldShow = (isRightDay && isRightTime) || isOverdue;

        // Don't show if already completed today
        if (reminder.lastCompleted) {
            const lastCompletedDate = new Date(reminder.lastCompleted).toDateString();
            const todayDate = now.toDateString();
            if (lastCompletedDate === todayDate) {
                return { shouldShow: false, reminder: null, daysSinceLastWeighIn, isOverdue };
            }
        }

        return {
            shouldShow,
            reminder,
            daysSinceLastWeighIn,
            isOverdue
        };
    }

    /**
     * Get weigh-in reminder specifically
     */
    getWeighInReminder(state: GlobalState, now: Date = new Date()): ReminderCheck {
        const weighInReminder = this.reminders.find(r => r.type === 'weigh_in');
        if (!weighInReminder) {
            return { shouldShow: false, reminder: null, daysSinceLastWeighIn: 0, isOverdue: false };
        }
        return this.checkSingleReminder(weighInReminder, state, now);
    }

    /**
     * Mark reminder as completed
     */
    completeReminder(reminderId: string, now: Date = new Date()): void {
        const reminder = this.reminders.find(r => r.id === reminderId);
        if (reminder) {
            reminder.lastCompleted = now.toISOString();
        }
    }

    /**
     * Snooze a reminder
     */
    snoozeReminder(reminderId: string, hours: number = 24): void {
        const reminder = this.reminders.find(r => r.id === reminderId);
        if (reminder) {
            const snoozeUntil = new Date();
            snoozeUntil.setHours(snoozeUntil.getHours() + hours);
            reminder.snoozeUntil = snoozeUntil.toISOString();
        }
    }

    /**
     * Update reminder settings
     */
    updateReminder(reminderId: string, updates: Partial<WeeklyReminder>): void {
        const reminder = this.reminders.find(r => r.id === reminderId);
        if (reminder) {
            Object.assign(reminder, updates);
        }
    }

    /**
     * Get all reminders
     */
    getReminders(): WeeklyReminder[] {
        return [...this.reminders];
    }
}

// =====================================================
// SINGLETON INSTANCE
// =====================================================

export const weeklyReminderService = new WeeklyReminderService();

// =====================================================
// CONVENIENCE FUNCTIONS
// =====================================================

/**
 * Check if user should see a weigh-in reminder
 */
export const shouldShowWeighInReminder = (state: GlobalState): ReminderCheck => {
    return weeklyReminderService.getWeighInReminder(state);
};

/**
 * Get days since last weigh-in
 */
export const getDaysSinceWeighIn = (state: GlobalState): number => {
    const lastWeighIn = state.user_profile?.body_composition?.last_updated;
    if (!lastWeighIn) return 999;
    return Math.floor((Date.now() - new Date(lastWeighIn).getTime()) / (1000 * 60 * 60 * 24));
};

/**
 * Generate weigh-in reminder message based on days
 */
export const getWeighInMessage = (daysSince: number): { title: string; message: string; urgency: 'low' | 'medium' | 'high' } => {
    if (daysSince >= 14) {
        return {
            title: '⚠️ Weigh-in Overdue',
            message: `It's been ${daysSince} days since your last weigh-in. Your fuel calculations may be inaccurate.`,
            urgency: 'high'
        };
    }
    if (daysSince >= 7) {
        return {
            title: '📊 Weekly Weigh-in',
            message: 'Time for your weekly weigh-in! Keep your fuel calculations accurate.',
            urgency: 'medium'
        };
    }
    return {
        title: '✓ Weight Tracked',
        message: `Last weighed ${daysSince} days ago.`,
        urgency: 'low'
    };
};
