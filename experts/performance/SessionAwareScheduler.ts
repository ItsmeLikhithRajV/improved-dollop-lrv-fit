/**
 * SessionAwareScheduler
 * 
 * Core service for adaptive protocol scheduling.
 * Training is the ANCHOR - everything else adapts around it.
 * 
 * Based on Huberman/Attia longevity protocols:
 * - Pre-fuel: 2-4h before (full meal), 1-2h (snack), 30-60min (simple carbs)
 * - Bedtime = sessionTime - wakeBuffer - sleepTarget
 * - Morning light within 30-60 min of waking
 * - Neural prep 30-60 min before session
 */

import { Session, GlobalState } from '../../types';
import { AdaptiveProtocol } from '../../types/longevity';

// Default user patterns (will be learned from actual behavior)
export interface UserPatterns {
    avgBedtime: string;           // "23:30"
    avgWakeTime: string;          // "07:00"
    avgSleepDuration: number;     // hours, e.g., 7.5
    chronotype: 'early_bird' | 'night_owl' | 'flexible';
    wakeBuffer: number;           // hours needed to prepare before session
    targetSleepHours: number;     // default 8
}

export const DEFAULT_PATTERNS: UserPatterns = {
    avgBedtime: '23:00',
    avgWakeTime: '07:00',
    avgSleepDuration: 8,
    chronotype: 'flexible',
    wakeBuffer: 2,           // 2 hours before session
    targetSleepHours: 8
};

export interface ProtocolSchedule {
    bedtime: string;
    windDown: string;
    wakeTime: string;
    morningLight: string;
    preFuel: string;
    neuralPrep: string;
    session: string;
    postSession: string;
}

// ScheduledProtocol removed - now using AdaptiveProtocol from types/longevity.ts

// Helper functions
const parseTime = (timeStr: string): { hours: number; minutes: number } => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours: hours || 0, minutes: minutes || 0 };
};

const formatTime = (hours: number, minutes: number = 0): string => {
    // Handle negative hours (previous day)
    while (hours < 0) hours += 24;
    // Handle overflow (next day)
    hours = hours % 24;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const subtractHours = (timeStr: string, hoursToSubtract: number): string => {
    const { hours, minutes } = parseTime(timeStr);
    const totalMinutes = hours * 60 + minutes - (hoursToSubtract * 60);
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    return formatTime(newHours, newMinutes);
};

const subtractMinutes = (timeStr: string, minsToSubtract: number): string => {
    const { hours, minutes } = parseTime(timeStr);
    const totalMinutes = hours * 60 + minutes - minsToSubtract;
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    return formatTime(newHours, newMinutes);
};

const addHours = (timeStr: string, hoursToAdd: number): string => {
    const { hours, minutes } = parseTime(timeStr);
    const totalMinutes = hours * 60 + minutes + (hoursToAdd * 60);
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    return formatTime(newHours, newMinutes);
};

export class SessionAwareScheduler {

    /**
     * Calculate protocol schedule based on session time
     * Training is the ANCHOR - everything adapts around it
     */
    static calculateProtocolTimings(
        sessionTime: string,
        patterns: UserPatterns = DEFAULT_PATTERNS
    ): ProtocolSchedule {
        const { wakeBuffer, targetSleepHours } = patterns;

        // Work backwards from session
        const wakeTime = subtractHours(sessionTime, wakeBuffer);
        const bedtime = subtractHours(wakeTime, targetSleepHours);
        const windDown = subtractMinutes(bedtime, 30);

        // Morning protocols
        const morningLight = addHours(wakeTime, 0.5); // 30 min after wake

        // Pre-session protocols
        const preFuel = subtractHours(sessionTime, 2);      // 2h before
        const neuralPrep = subtractMinutes(sessionTime, 45); // 45 min before

        // Post-session
        const postSession = addHours(sessionTime, 1.5); // 1.5h after (post-workout window)

        return {
            bedtime,
            windDown,
            wakeTime,
            morningLight,
            preFuel,
            neuralPrep,
            session: sessionTime,
            postSession
        };
    }

    /**
     * Generate adaptive protocol stack for a session
     * Returns TimelineProtocols that depend on the session
     */
    static generateSessionProtocolStack(
        session: Session,
        patterns: UserPatterns = DEFAULT_PATTERNS
    ): AdaptiveProtocol[] {
        const schedule = this.calculateProtocolTimings(
            session.time_of_day || '09:00',
            patterns
        );

        const protocols: AdaptiveProtocol[] = [];

        // Wind-down protocol
        protocols.push({
            id: `adaptive_winddown_${session.id}`,
            title: '🌙 Wind-Down Protocol',
            time_of_day: schedule.windDown,
            duration_minutes: 30,
            category: 'recovery',
            variant: 'adaptive',
            priority: 'adaptive',
            is_flexible: false,
            dependsOn: 'bedtime',
            originalReason: `Preparing for ${schedule.bedtime} bedtime to support ${session.title} session`,
            rationale: 'Dim lights, no screens. Body temperature drop initiates sleep.'
        });

        // Bedtime reminder
        protocols.push({
            id: `adaptive_bedtime_${session.id}`,
            title: '🛏️ Optimal Bedtime',
            time_of_day: schedule.bedtime,
            duration_minutes: 0,
            category: 'recovery',
            variant: 'adaptive',
            priority: 'adaptive',
            is_flexible: false,
            dependsOn: 'session',
            originalReason: `${patterns.targetSleepHours}h sleep before ${session.time_of_day} session`,
            rationale: `Sleep is the foundation. ${patterns.targetSleepHours}h gives you optimal recovery.`
        });

        // Wake protocol
        protocols.push({
            id: `adaptive_wake_${session.id}`,
            title: '☀️ Wake + Light Exposure',
            time_of_day: schedule.wakeTime,
            duration_minutes: 15,
            category: 'mindspace',
            variant: 'adaptive',
            priority: 'adaptive',
            is_flexible: false,
            dependsOn: 'session',
            originalReason: `${patterns.wakeBuffer}h buffer before ${session.time_of_day} ${session.title}`,
            rationale: 'Morning light within 30 min calibrates circadian clock. Boosts cortisol for alertness.'
        });

        // Pre-fuel protocol
        protocols.push({
            id: `adaptive_prefuel_${session.id}`,
            title: '🍳 Pre-Session Fuel',
            time_of_day: schedule.preFuel,
            duration_minutes: 30,
            category: 'fuel',
            variant: 'adaptive',
            priority: 'adaptive',
            is_flexible: true,
            dependsOn: 'session',
            originalReason: `2h before ${session.title} for complete digestion`,
            rationale: 'Complex carbs + protein + fat. Glycogen loading for performance.'
        });

        // Neural prep
        protocols.push({
            id: `adaptive_neuralprep_${session.id}`,
            title: '🧠 Neural Prep',
            time_of_day: schedule.neuralPrep,
            duration_minutes: 10,
            category: 'mindspace',
            variant: 'adaptive',
            priority: 'adaptive',
            is_flexible: true,
            dependsOn: 'session',
            originalReason: `Mental priming for ${session.title}`,
            rationale: 'Breathwork + visualization. Activates focus without CNS fatigue.'
        });

        // Post-session fuel window
        protocols.push({
            id: `adaptive_postfuel_${session.id}`,
            title: '🥤 Post-Session Refuel',
            time_of_day: schedule.postSession,
            duration_minutes: 30,
            category: 'fuel',
            variant: 'adaptive',
            priority: 'adaptive',
            is_flexible: true,
            dependsOn: 'session',
            originalReason: `Anabolic window after ${session.title}`,
            rationale: 'Protein + fast carbs within 90 min. Peak muscle protein synthesis.'
        });

        return protocols;
    }

    /**
     * Check if current time makes an action inappropriate
     * Returns deferral recommendation if needed
     */
    static shouldDeferAction(
        action: { id: string; category: string },
        currentHour: number,
        patterns: UserPatterns = DEFAULT_PATTERNS
    ): { shouldDefer: boolean; reason?: string; suggestedTime?: string } {
        const bedtimeHour = parseTime(patterns.avgBedtime).hours;
        const wakeHour = parseTime(patterns.avgWakeTime).hours;

        // Sleep window detection
        const inSleepWindow = currentHour >= bedtimeHour || currentHour < wakeHour;

        if (inSleepWindow) {
            // Block active modalities during sleep window
            if (['sauna', 'cold_exposure', 'training', 'high_intensity'].includes(action.category)) {
                return {
                    shouldDefer: true,
                    reason: 'Sleep window active. This would disrupt recovery.',
                    suggestedTime: addHours(patterns.avgWakeTime, 2) // Suggest 2h after usual wake
                };
            }
        }

        // Early morning - block heavy training if too early
        if (currentHour >= wakeHour && currentHour < wakeHour + 2) {
            if (action.category === 'heavy_training') {
                return {
                    shouldDefer: true,
                    reason: 'Body temperature still low. Injury risk elevated.',
                    suggestedTime: formatTime(wakeHour + 3, 0)
                };
            }
        }

        return { shouldDefer: false };
    }

    /**
     * Detect fatigue and suggest reactive protocols
     */
    static getStateReactiveRecommendations(
        state: GlobalState,
        currentHour: number
    ): { action: string; urgency: number; reason: string }[] {
        const recommendations: { action: string; urgency: number; reason: string }[] = [];

        const readiness = state.mindspace?.readiness_score || 50;
        const stress = state.mindspace?.stress || 5;
        const recoveryScore = state.recovery?.recovery_score || 50;

        // Midday fatigue detection (1 PM - 4 PM)
        if (currentHour >= 13 && currentHour <= 16) {
            if (readiness < 40 || stress > 7) {
                recommendations.push({
                    action: 'Power Nap (20 min)',
                    urgency: 85,
                    reason: `Readiness at ${readiness}%. A 20-min nap improves alertness by 100%.`
                });
            }
        }

        // Evening recovery suggestion
        if (currentHour >= 17 && currentHour <= 21) {
            if (recoveryScore < 50) {
                recommendations.push({
                    action: 'Evening Sauna (15 min)',
                    urgency: 70,
                    reason: `Recovery at ${recoveryScore}%. Sauna boosts growth hormone 16x.`
                });
            }
        }

        // High stress any time
        if (stress > 8) {
            recommendations.push({
                action: 'Box Breathing (5 min)',
                urgency: 90,
                reason: `Stress at ${stress}/10. Parasympathetic activation needed.`
            });
        }

        return recommendations;
    }
}

export default SessionAwareScheduler;
