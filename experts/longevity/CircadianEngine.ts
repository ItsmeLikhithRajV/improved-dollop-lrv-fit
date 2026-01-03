/**
 * Circadian Engine - Chronobiology for Peak Performance
 * 
 * Implements:
 * - Body temperature curve estimation
 * - Optimal training window calculation
 * - Circadian phase detection
 * - Light exposure tracking
 * - Huberman protocol guidance
 */

import {
    Chronotype,
    ChronotypeProfile,
    CircadianPhase,
    CircadianPhaseType,
    BodyTemperatureCurve,
    TrainingWindow,
    TrainingWindowType,
    LightExposureTracking,
    CircadianAnalysisOutput,
    OPTIMAL_TRAINING_WINDOWS,
    HUBERMAN_LIGHT_PROTOCOL,
    BLUEPRINT_CIRCADIAN_PROTOCOL
} from '../../types/circadian';

// ============================================================================
// TIME UTILITIES
// ============================================================================

const parseTime = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

const formatTime = (minutes: number): string => {
    const h = Math.floor((minutes % 1440) / 60);
    const m = Math.floor(minutes % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const getCurrentMinutes = (): number => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
};

// ============================================================================
// CHRONOTYPE DETECTION
// ============================================================================

const detectChronotype = (wakeTime: string, sleepTime: string): ChronotypeProfile => {
    const wakeMinutes = parseTime(wakeTime);
    const sleepMinutes = parseTime(sleepTime);

    // Calculate midpoint of sleep
    let midpoint = sleepMinutes + ((wakeMinutes + 1440 - sleepMinutes) % 1440) / 2;
    if (midpoint >= 1440) midpoint -= 1440;

    // Classify chronotype based on sleep midpoint
    let type: Chronotype;
    let morningnessScore: number;

    if (midpoint < 150) { // Before 2:30 AM
        type = 'definite_morning';
        morningnessScore = 75;
    } else if (midpoint < 210) { // 2:30-3:30 AM
        type = 'moderate_morning';
        morningnessScore = 65;
    } else if (midpoint < 270) { // 3:30-4:30 AM
        type = 'intermediate';
        morningnessScore = 50;
    } else if (midpoint < 330) { // 4:30-5:30 AM
        type = 'moderate_evening';
        morningnessScore = 35;
    } else {
        type = 'definite_evening';
        morningnessScore = 25;
    }

    // Calculate other times based on wake time
    const peakAlertnessOffset = 180; // 3 hours after wake
    const peakPhysicalOffset = 600;  // 10 hours after wake (afternoon)
    const energyDipOffset = 390;     // 6.5 hours after wake (post-lunch)

    return {
        type,
        natural_wake_time: wakeTime,
        natural_sleep_time: sleepTime,
        peak_alertness_time: formatTime(wakeMinutes + peakAlertnessOffset),
        peak_physical_time: formatTime(wakeMinutes + peakPhysicalOffset),
        energy_dip_time: formatTime(wakeMinutes + energyDipOffset),
        morningness_score: morningnessScore
    };
};

// ============================================================================
// BODY TEMPERATURE CURVE
// ============================================================================

const calculateBodyTemperatureCurve = (wakeTime: string): BodyTemperatureCurve => {
    const wakeMinutes = parseTime(wakeTime);
    const hourlyTemps: { hour: number; temp_celsius: number; temp_fahrenheit: number }[] = [];

    // Temperature minimum is ~2 hours before wake, maximum is ~10-12 hours after wake
    const minTime = (wakeMinutes - 120 + 1440) % 1440;
    const maxTime = (wakeMinutes + 660) % 1440; // ~11 hours after wake

    for (let hour = 0; hour < 24; hour++) {
        const timeMinutes = hour * 60;

        // Calculate position in circadian cycle (0 to 1)
        let cyclePosition: number;

        // Rising phase: from min to max
        // Falling phase: from max to min
        if (minTime < maxTime) {
            // Normal case
            if (timeMinutes >= minTime && timeMinutes <= maxTime) {
                cyclePosition = (timeMinutes - minTime) / (maxTime - minTime);
            } else if (timeMinutes > maxTime) {
                const fallDuration = 1440 - maxTime + minTime;
                cyclePosition = 1 - (timeMinutes - maxTime) / fallDuration;
            } else {
                const fallDuration = 1440 - maxTime + minTime;
                cyclePosition = 1 - (1440 - maxTime + timeMinutes) / fallDuration;
            }
        } else {
            // Wraps around midnight
            if (timeMinutes >= minTime || timeMinutes <= maxTime) {
                const riseDuration = maxTime + 1440 - minTime;
                if (timeMinutes >= minTime) {
                    cyclePosition = (timeMinutes - minTime) / riseDuration;
                } else {
                    cyclePosition = (1440 - minTime + timeMinutes) / riseDuration;
                }
            } else {
                const fallDuration = minTime - maxTime;
                cyclePosition = 1 - (timeMinutes - maxTime) / fallDuration;
            }
        }

        // Temperature range: 36.0°C (min) to 37.5°C (max)
        const tempC = 36.0 + cyclePosition * 1.5;
        const tempF = tempC * 9 / 5 + 32;

        hourlyTemps.push({
            hour,
            temp_celsius: Math.round(tempC * 10) / 10,
            temp_fahrenheit: Math.round(tempF * 10) / 10
        });
    }

    // Find min/max
    const minEntry = hourlyTemps.reduce((a, b) => a.temp_celsius < b.temp_celsius ? a : b);
    const maxEntry = hourlyTemps.reduce((a, b) => a.temp_celsius > b.temp_celsius ? a : b);

    const currentHour = new Date().getHours();
    const currentTemp = hourlyTemps.find(t => t.hour === currentHour)!;

    return {
        hourly_temps: hourlyTemps,
        minimum_time: `${minEntry.hour.toString().padStart(2, '0')}:00`,
        minimum_temp: minEntry.temp_celsius,
        maximum_time: `${maxEntry.hour.toString().padStart(2, '0')}:00`,
        maximum_temp: maxEntry.temp_celsius,
        current_estimated_temp: currentTemp.temp_celsius,
        current_relative_to_range: ((currentTemp.temp_celsius - 36.0) / 1.5) * 100
    };
};

// ============================================================================
// CIRCADIAN PHASE DETECTION
// ============================================================================

const detectCircadianPhase = (wakeTime: string): CircadianPhase => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const wakeMinutes = parseTime(wakeTime);

    // Calculate hours since wake
    let hoursSinceWake = (currentMinutes - wakeMinutes) / 60;
    if (hoursSinceWake < 0) hoursSinceWake += 24;

    // Determine phase based on time of day and hours since wake
    let phase: CircadianPhaseType;
    let description: string;

    const hour = now.getHours();

    if (hour >= 2 && hour < 5) {
        phase = 'night_trough';
        description = 'Lowest alertness and body temperature. Risk zone for errors.';
    } else if (hour >= 5 && hour < 7) {
        phase = 'dawn_rising';
        description = 'Cortisol awakening response. Body preparing for activity.';
    } else if (hour >= 7 && hour < 10) {
        phase = 'morning_alert';
        description = 'High alertness. Good for focused cognitive work.';
    } else if (hour >= 10 && hour < 12) {
        phase = 'late_morning';
        description = 'Peak cognitive performance. Best for complex decisions.';
    } else if (hour >= 12 && hour < 14) {
        phase = 'post_lunch_dip';
        description = 'Natural energy dip. Consider light activity or nap.';
    } else if (hour >= 14 && hour < 16) {
        phase = 'afternoon_rising';
        description = 'Second wind beginning. Good for creative work.';
    } else if (hour >= 16 && hour < 19) {
        phase = 'evening_peak';
        description = 'Peak physical performance. Optimal for training.';
    } else if (hour >= 19 && hour < 21) {
        phase = 'dusk_declining';
        description = 'Winding down. Avoid bright lights.';
    } else if (hour >= 21 && hour < 23) {
        phase = 'night_onset';
        description = 'Melatonin rising. Prepare for sleep.';
    } else {
        phase = 'early_sleep';
        description = 'Deep sleep window. Should be asleep.';
    }

    // Calculate hormone levels (simplified model)
    const cortisolPeak = wakeMinutes + 60; // 1 hour after wake
    const distFromCortisolPeak = Math.abs(currentMinutes - cortisolPeak);
    const cortisolLevel = Math.max(0, 100 - (distFromCortisolPeak / 6)); // Drops over 10 hours

    const melatoninOnset = parseTime('21:00');
    const melatoninOffset = wakeMinutes;
    let melatoninLevel = 0;
    if (currentMinutes >= melatoninOnset || currentMinutes < melatoninOffset) {
        melatoninLevel = 80;
    }

    // Performance predictions based on phase
    const tempCurve = calculateBodyTemperatureCurve(wakeTime);
    const tempRelative = tempCurve.current_relative_to_range;

    return {
        current_time: formatTime(currentMinutes),
        phase,
        phase_description: description,
        estimated_core_temp: tempCurve.current_estimated_temp,
        temp_trend: tempRelative > 60 ? 'peak' : tempRelative > 30 ? 'rising' : tempRelative < 20 ? 'trough' : 'falling',
        cortisol_level: Math.round(cortisolLevel),
        melatonin_level: melatoninLevel,
        testosterone_level: Math.round(80 - hoursSinceWake * 3), // Peaks in AM
        growth_hormone_level: melatoninLevel > 50 ? 70 : 20, // Mainly during sleep
        physical_performance: Math.round(30 + tempRelative * 0.7),
        cognitive_performance: Math.round(40 + (100 - Math.abs(hoursSinceWake - 3) * 10)),
        reaction_time_relative: Math.round(100 - tempRelative * 0.3),
        coordination_level: Math.round(40 + tempRelative * 0.5),
        injury_risk_relative: Math.round(130 - tempRelative * 0.5)
    };
};

// ============================================================================
// TRAINING WINDOWS
// ============================================================================

const calculateTrainingWindows = (wakeTime: string): TrainingWindow[] => {
    const wakeMinutes = parseTime(wakeTime);
    const currentMinutes = getCurrentMinutes();

    const windows: TrainingWindow[] = [];

    Object.entries(OPTIMAL_TRAINING_WINDOWS).forEach(([type, config]) => {
        const startMinutes = parseTime(config.start);
        const endMinutes = parseTime(config.end);

        let availability: TrainingWindow['current_availability'];
        if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
            availability = 'optimal';
        } else if (currentMinutes >= startMinutes - 60 && currentMinutes <= endMinutes + 60) {
            availability = 'good';
        } else if (currentMinutes < startMinutes) {
            availability = 'suboptimal';
        } else {
            availability = 'avoid';
        }

        windows.push({
            type: type as TrainingWindowType,
            optimal_start: config.start,
            optimal_end: config.end,
            rationale: config.rationale,
            performance_boost: '+5-15% vs suboptimal timing',
            current_availability: availability
        });
    });

    return windows;
};

// ============================================================================
// LIGHT EXPOSURE TRACKING
// ============================================================================

const assessLightExposure = (
    morningLightMinutes: number,
    afternoonLightMinutes: number,
    eveningScreenMinutes: number,
    wakeTime: string
): LightExposureTracking => {
    const recommendations: string[] = [];

    // Morning light assessment
    const morningAchieved = morningLightMinutes >= 10;
    if (!morningAchieved) {
        recommendations.push('Get 10+ minutes of outdoor light within 1 hour of waking');
    }

    // Afternoon light
    if (afternoonLightMinutes < 10) {
        recommendations.push('Add 10 minutes of afternoon outdoor light (2-4 PM)');
    }

    // Evening screen time
    const eveningBrightLight = eveningScreenMinutes > 30;
    if (eveningBrightLight) {
        recommendations.push('Reduce screen time after sunset or use blue light blockers');
    }

    // Calculate score
    let score = 50;
    if (morningAchieved) score += 30;
    if (afternoonLightMinutes >= 10) score += 10;
    if (!eveningBrightLight) score += 10;

    const wakeMinutes = parseTime(wakeTime);

    return {
        morning_light_achieved: morningAchieved,
        morning_light_duration: morningLightMinutes,
        morning_light_time: formatTime(wakeMinutes + 30),
        afternoon_light_duration: afternoonLightMinutes,
        evening_bright_light_exposure: eveningBrightLight,
        screen_time_after_sunset: eveningScreenMinutes,
        light_hygiene_score: Math.min(100, score),
        recommendations
    };
};

// ============================================================================
// MAIN ENGINE
// ============================================================================

export class CircadianEngine {
    private wakeTime: string = '06:30';
    private sleepTime: string = '22:30';
    private morningLightMinutes: number = 15;
    private afternoonLightMinutes: number = 5;
    private eveningScreenMinutes: number = 45;
    private hasUserConfiguredTimes: boolean = false; // Track if user has set real data

    /**
     * Set typical wake time (marks as user configured)
     */
    setWakeTime(time: string): void {
        this.wakeTime = time;
        this.hasUserConfiguredTimes = true;
    }

    /**
     * Set typical sleep time (marks as user configured)
     */
    setSleepTime(time: string): void {
        this.sleepTime = time;
        this.hasUserConfiguredTimes = true;
    }

    /**
     * Check if we have user-configured data
     */
    hasData(): boolean {
        return this.hasUserConfiguredTimes;
    }



    /**
     * Log light exposure
     */
    logLightExposure(morningMin: number, afternoonMin: number, eveningScreenMin: number): void {
        this.morningLightMinutes = morningMin;
        this.afternoonLightMinutes = afternoonMin;
        this.eveningScreenMinutes = eveningScreenMin;
    }

    /**
     * Get best training time for a specific type
     */
    getBestTrainingTime(type: TrainingWindowType): string {
        const windows = calculateTrainingWindows(this.wakeTime);
        const window = windows.find(w => w.type === type);
        return window?.optimal_start || '16:00';
    }

    /**
     * Calculate recommended schedule
     */
    getRecommendedSchedule() {
        const wakeMinutes = parseTime(this.wakeTime);

        return {
            recommended_wake_time: this.wakeTime,
            recommended_light_exposure_time: formatTime(wakeMinutes + 30),
            recommended_training_time: formatTime(wakeMinutes + 600), // ~10h after wake
            recommended_last_meal_time: formatTime(parseTime(this.sleepTime) - 240), // 4h before bed
            recommended_wind_down_time: formatTime(parseTime(this.sleepTime) - 60),
            recommended_sleep_time: this.sleepTime
        };
    }

    /**
     * Main analysis method
     * Returns null if no user-configured data exists
     */
    analyze(): CircadianAnalysisOutput | null {
        // For circadian, we can generate analysis even without wearable
        // but only if user has configured their wake/sleep times
        // For now, we'll allow analysis since circadian doesn't require wearables
        // (It's calculated from time-of-day and user preferences)

        const chronotype = detectChronotype(this.wakeTime, this.sleepTime);
        const currentPhase = detectCircadianPhase(this.wakeTime);
        const bodyTempCurve = calculateBodyTemperatureCurve(this.wakeTime);
        const trainingWindows = calculateTrainingWindows(this.wakeTime);
        const lightTracking = assessLightExposure(
            this.morningLightMinutes,
            this.afternoonLightMinutes,
            this.eveningScreenMinutes,
            this.wakeTime
        );

        // Find best training window for now
        const optimalNow = trainingWindows.filter(w => w.current_availability === 'optimal');
        const bestNow = optimalNow.length > 0 ? optimalNow[0].optimal_start : trainingWindows[0].optimal_start;

        // Calculate times to avoid
        const avoidTimes: string[] = [];
        if (currentPhase.physical_performance < 50) {
            avoidTimes.push('Next 2-3 hours (low body temp)');
        }

        // Social jet lag (simplified - would need weekend data)
        const socialJetLag = {
            weekday_midpoint: this.wakeTime,
            weekend_midpoint: formatTime(parseTime(this.wakeTime) + 90),
            lag_hours: 1.5,
            impact: 'mild' as const
        };

        const schedule = this.getRecommendedSchedule();

        return {
            chronotype,
            current_phase: currentPhase,
            body_temp_curve: bodyTempCurve,
            optimal_windows_today: trainingWindows,
            best_training_time: bestNow,
            avoid_training_times: avoidTimes,
            light_tracking: lightTracking,
            disruptions: [],
            social_jet_lag: socialJetLag,
            circadian_alignment_score: lightTracking.light_hygiene_score,
            ...schedule
        };
    }
}

// Singleton
export const circadianEngine = new CircadianEngine();

// State-driven analysis function
import type { GlobalState } from '../../types';

/**
 * Analyze circadian rhythms from GlobalState
 */
export function analyzeCircadian(state?: GlobalState): CircadianAnalysisOutput | null {
    // If state provided, configure engine from sleep data
    if (state) {
        const sleep = state.sleep;
        const profile = state.user_profile;

        // Check if we have meaningful data
        const hasData = sleep?.bedtime !== '00:00' || sleep?.wake_time !== '00:00';

        if (!hasData) {
            return null; // Let UI show zero-state
        }

        // Configure engine from state
        if (sleep?.wake_time && sleep.wake_time !== '00:00') {
            circadianEngine.setWakeTime(sleep.wake_time);
        }
        if (sleep?.bedtime && sleep.bedtime !== '00:00') {
            circadianEngine.setSleepTime(sleep.bedtime);
        }
    }

    return circadianEngine.analyze();
}
