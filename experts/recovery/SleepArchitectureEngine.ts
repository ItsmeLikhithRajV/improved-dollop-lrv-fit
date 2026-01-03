/**
 * Sleep Architecture Engine - Research-Backed Sleep Analysis
 * 
 * Implements:
 * - Sleep stage analysis (Deep, REM, Light)
 * - Sleep debt tracking and recovery estimation
 * - Quality scoring based on research targets
 * - Recommendations engine
 */

import {
    SleepArchitecture,
    SleepDebt,
    SleepStageSegment,
    SleepRecommendation,
    SleepAnalysisOutput,
    SLEEP_STAGE_TARGETS,
    SLEEP_DURATION_TARGETS,
    BLUEPRINT_SLEEP_PROTOCOL,
    SleepStage,
    SleepCycle
} from '../../types/sleep-architecture';

// ============================================================================
// MOCK DATA GENERATION
// ============================================================================

const generateMockSleepHistory = (days: number): SleepArchitecture[] => {
    const history: SleepArchitecture[] = [];

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        // Simulate typical sleep architecture
        const totalSleep = 6.5 + Math.random() * 2; // 6.5-8.5 hours
        const efficiency = 85 + Math.random() * 10; // 85-95%

        // Stage percentages (with some variation)
        const deepPct = 15 + Math.random() * 10; // 15-25%
        const remPct = 18 + Math.random() * 7; // 18-25%
        const awakePct = 3 + Math.random() * 5; // 3-8%
        const lightPct = 100 - deepPct - remPct - awakePct;

        const totalMinutes = totalSleep * 60;

        history.push({
            date: date.toISOString().split('T')[0],
            bedtime: '22:30',
            wake_time: '06:30',
            time_in_bed: totalMinutes / (efficiency / 100),
            total_sleep_time: totalMinutes,
            sleep_efficiency: efficiency,
            stages: {
                awake: {
                    duration: totalMinutes * (awakePct / 100),
                    percentage: awakePct,
                    target_percentage: SLEEP_STAGE_TARGETS.awake.optimal_percentage
                },
                light: {
                    duration: totalMinutes * (lightPct / 100),
                    percentage: lightPct,
                    target_percentage: SLEEP_STAGE_TARGETS.light.optimal_percentage
                },
                deep: {
                    duration: totalMinutes * (deepPct / 100),
                    percentage: deepPct,
                    target_percentage: SLEEP_STAGE_TARGETS.deep.optimal_percentage
                },
                rem: {
                    duration: totalMinutes * (remPct / 100),
                    percentage: remPct,
                    target_percentage: SLEEP_STAGE_TARGETS.rem.optimal_percentage
                }
            },
            stage_segments: [], // Simplified
            sleep_latency: 10 + Math.random() * 15,
            waso: 5 + Math.random() * 20,
            wake_events: Math.floor(1 + Math.random() * 4),
            wake_event_times: [],
            first_half_deep_percentage: 55 + Math.random() * 15,
            physical_recovery_score: Math.min(100, (deepPct / SLEEP_STAGE_TARGETS.deep.optimal_percentage) * 80),
            cognitive_recovery_score: Math.min(100, (remPct / SLEEP_STAGE_TARGETS.rem.optimal_percentage) * 80),
            overall_quality_score: efficiency * 0.3 +
                (deepPct / SLEEP_STAGE_TARGETS.deep.optimal_percentage) * 35 +
                (remPct / SLEEP_STAGE_TARGETS.rem.optimal_percentage) * 35,
            source: 'oura'
        });
    }

    return history;
};

// ============================================================================
// CALCULATION HELPERS
// ============================================================================

const mean = (values: number[]): number =>
    values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;

const getTrend = (values: number[]): 'improving' | 'stable' | 'declining' => {
    if (values.length < 3) return 'stable';

    const firstHalf = mean(values.slice(0, Math.floor(values.length / 2)));
    const secondHalf = mean(values.slice(Math.floor(values.length / 2)));

    const change = ((secondHalf - firstHalf) / firstHalf) * 100;

    if (change > 5) return 'improving';
    if (change < -5) return 'declining';
    return 'stable';
};

// ============================================================================
// MAIN ENGINE
// ============================================================================

export class SleepArchitectureEngine {
    private history: SleepArchitecture[] = [];
    private personalSleepNeed: number = 8; // Default
    private hasSyncedData: boolean = false; // Track if we have real wearable data

    constructor() {
        // Start with empty history - only real data from wearables
        this.history = [];
    }

    /**
     * Add real sleep data from wearable integration
     */
    addRealSleepData(records: SleepArchitecture[]): void {
        this.history = records;
        this.hasSyncedData = records.length > 0;
    }

    /**
     * Check if we have real wearable data
     */
    hasData(): boolean {
        return this.history.length > 0 && this.hasSyncedData;
    }

    /**
     * Add a new sleep record
     */
    addSleepRecord(record: SleepArchitecture): void {
        this.history.push(record);
        this.history = this.history.slice(-90); // Keep 90 days
    }

    /**
     * Set personal sleep need (can be learned over time)
     */
    setPersonalSleepNeed(hours: number): void {
        this.personalSleepNeed = Math.max(6, Math.min(10, hours));
    }

    /**
     * Calculate sleep debt
     */
    calculateSleepDebt(): SleepDebt {
        const need = this.personalSleepNeed * 60; // Convert to minutes

        const last7d = this.history.slice(-7);
        const last14d = this.history.slice(-14);
        const last30d = this.history.slice(-30);

        const debt7d = last7d.reduce((acc, s) => acc + (need - s.total_sleep_time), 0) / 60;
        const debt14d = last14d.reduce((acc, s) => acc + (need - s.total_sleep_time), 0) / 60;
        const debt30d = last30d.reduce((acc, s) => acc + (need - s.total_sleep_time), 0) / 60;

        // Estimate recovery days (can only recover ~50% of debt per night with extra sleep)
        const extraSleepPerNight = 1; // hours
        const recoveryRate = 0.5;
        const recoveryDays = debt7d > 0 ? Math.ceil(debt7d / (extraSleepPerNight * recoveryRate)) : 0;

        // Determine status
        let status: SleepDebt['status'] = 'balanced';
        if (debt7d <= -3) status = 'surplus';
        else if (debt7d <= 3) status = 'balanced';
        else if (debt7d <= 5) status = 'mild_debt';
        else if (debt7d <= 10) status = 'chronic_debt';
        else status = 'severe_debt';

        // Trend
        const weeklyDebts = [
            last7d.slice(0, 3).reduce((a, s) => a + (need - s.total_sleep_time), 0) / 60,
            last7d.slice(-3).reduce((a, s) => a + (need - s.total_sleep_time), 0) / 60
        ];
        const trend = weeklyDebts[1] > weeklyDebts[0] + 1 ? 'worsening' :
            weeklyDebts[1] < weeklyDebts[0] - 1 ? 'improving' : 'stable';

        return {
            personal_sleep_need: this.personalSleepNeed,
            debt_7d: Math.max(0, debt7d),
            debt_14d: Math.max(0, debt14d),
            debt_30d: Math.max(0, debt30d),
            debt_payback_rate: 0.5,
            estimated_recovery_days: recoveryDays,
            chronic_debt_threshold: 5,
            severe_debt_threshold: 10,
            status,
            trend
        };
    }

    /**
     * Calculate weekly averages
     */
    calculateWeeklyAverage() {
        const last7d = this.history.slice(-7);

        return {
            duration: mean(last7d.map(s => s.total_sleep_time / 60)),
            efficiency: mean(last7d.map(s => s.sleep_efficiency)),
            deep_percentage: mean(last7d.map(s => s.stages.deep.percentage)),
            rem_percentage: mean(last7d.map(s => s.stages.rem.percentage)),
            quality_score: mean(last7d.map(s => s.overall_quality_score))
        };
    }

    /**
     * Calculate optimal bedtime based on wake time and sleep need
     */
    calculateOptimalBedtime(targetWakeTime: string): string {
        const sleepNeedMinutes = this.personalSleepNeed * 60;
        const sleepLatency = 15; // Average time to fall asleep
        const totalBedTime = sleepNeedMinutes + sleepLatency;

        const [wakeHour, wakeMinute] = targetWakeTime.split(':').map(Number);
        const wakeMinutes = wakeHour * 60 + wakeMinute;

        let bedMinutes = wakeMinutes - totalBedTime;
        if (bedMinutes < 0) bedMinutes += 24 * 60;

        const bedHour = Math.floor(bedMinutes / 60);
        const bedMin = bedMinutes % 60;

        return `${bedHour.toString().padStart(2, '0')}:${bedMin.toString().padStart(2, '0')}`;
    }

    /**
     * Generate sleep recommendations
     */
    generateRecommendations(currentNight: SleepArchitecture, debt: SleepDebt): SleepRecommendation[] {
        const recommendations: SleepRecommendation[] = [];

        // Low deep sleep
        if (currentNight.stages.deep.percentage < SLEEP_STAGE_TARGETS.deep.min_percentage) {
            recommendations.push({
                priority: 'high',
                category: 'recovery',
                title: 'Increase Deep Sleep',
                description: 'Your deep sleep was below optimal. Consider: Earlier bedtime, cooler room (65°F), limiting alcohol.',
                expected_impact: '+15-30 minutes deep sleep',
                science_brief: 'Deep sleep is critical for physical recovery, GH release, and muscle repair.'
            });
        }

        // Low REM
        if (currentNight.stages.rem.percentage < SLEEP_STAGE_TARGETS.rem.min_percentage) {
            recommendations.push({
                priority: 'high',
                category: 'recovery',
                title: 'Protect REM Sleep',
                description: 'Your REM sleep was below optimal. Avoid alcohol and THC which suppress REM.',
                expected_impact: '+20-40 minutes REM sleep',
                science_brief: 'REM sleep is essential for motor memory consolidation and emotional regulation.'
            });
        }

        // High sleep latency
        if (currentNight.sleep_latency > 20) {
            recommendations.push({
                priority: 'medium',
                category: 'behavior',
                title: 'Improve Sleep Onset',
                description: 'You took longer than ideal to fall asleep. Try a wind-down routine 30-60 min before bed.',
                expected_impact: 'Fall asleep 10-15 minutes faster',
                science_brief: 'Extended sleep latency often indicates residual stress or poor sleep pressure.'
            });
        }

        // Low efficiency
        if (currentNight.sleep_efficiency < 85) {
            recommendations.push({
                priority: 'medium',
                category: 'environment',
                title: 'Improve Sleep Efficiency',
                description: 'Too much time awake in bed. Only use bed for sleep, not screens or worrying.',
                expected_impact: '+5-10% sleep efficiency',
                science_brief: 'Optimal sleep efficiency is >85%. Lower values suggest fragmented sleep.'
            });
        }

        // Sleep debt warning
        if (debt.status === 'chronic_debt' || debt.status === 'severe_debt') {
            recommendations.push({
                priority: 'critical',
                category: 'timing',
                title: 'Address Sleep Debt',
                description: `You have ${debt.debt_7d.toFixed(1)}h of sleep debt. Add 30-60 min to your sleep opportunity.`,
                expected_impact: `Recovery in ~${debt.estimated_recovery_days} days`,
                science_brief: 'Chronic sleep debt impairs performance, immunity, and injury risk.'
            });
        }

        // Too many wake events
        if (currentNight.wake_events > 4) {
            recommendations.push({
                priority: 'medium',
                category: 'environment',
                title: 'Reduce Night Wakings',
                description: 'Multiple wake events detected. Check room temperature, noise, and light exposure.',
                expected_impact: 'Improved sleep continuity',
                science_brief: 'Fragmented sleep reduces the restorative value of each sleep stage.'
            });
        }

        return recommendations.sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }

    /**
     * Main analysis method
     * Returns null if no real data is available
     */
    analyze(): SleepAnalysisOutput | null {
        // Return null if no real wearable data
        if (!this.hasData() || this.history.length === 0) {
            return null;
        }

        const currentNight = this.history[this.history.length - 1];
        const debt = this.calculateSleepDebt();
        const weeklyAverage = this.calculateWeeklyAverage();

        // Calculate trends
        const last7d = this.history.slice(-7);
        const durationTrend = getTrend(last7d.map(s => s.total_sleep_time));
        const qualityTrend = getTrend(last7d.map(s => s.overall_quality_score));
        const deepTrend = getTrend(last7d.map(s => s.stages.deep.percentage));

        const recommendations = this.generateRecommendations(currentNight, debt);

        return {
            current_night: currentNight,
            debt,
            weekly_average: weeklyAverage,
            trends: {
                duration: durationTrend,
                quality: qualityTrend,
                deep_sleep: deepTrend
            },
            recommendations,
            bedtime_recommendation: this.calculateOptimalBedtime('06:30'),
            wake_recommendation: '06:30'
        };
    }

    /**
     * Get last N nights of sleep data
     */
    getHistory(days: number): SleepArchitecture[] {
        return this.history.slice(-days);
    }

    /**
     * Compare current night to Blueprint protocol targets
     */
    compareToBlueprintProtocol(night: SleepArchitecture): {
        metric: string;
        current: string;
        target: string;
        status: 'achieved' | 'close' | 'needs_work';
    }[] {
        return [
            {
                metric: 'Bedtime',
                current: night.bedtime,
                target: BLUEPRINT_SLEEP_PROTOCOL.target_bedtime,
                status: night.bedtime <= '21:00' ? 'achieved' : night.bedtime <= '22:00' ? 'close' : 'needs_work'
            },
            {
                metric: 'Duration',
                current: `${(night.total_sleep_time / 60).toFixed(1)}h`,
                target: `${BLUEPRINT_SLEEP_PROTOCOL.target_duration}h`,
                status: night.total_sleep_time >= BLUEPRINT_SLEEP_PROTOCOL.target_duration * 60 ? 'achieved' :
                    night.total_sleep_time >= (BLUEPRINT_SLEEP_PROTOCOL.target_duration - 0.5) * 60 ? 'close' : 'needs_work'
            },
            {
                metric: 'Deep Sleep',
                current: `${night.stages.deep.percentage.toFixed(0)}%`,
                target: '20%+',
                status: night.stages.deep.percentage >= 20 ? 'achieved' :
                    night.stages.deep.percentage >= 15 ? 'close' : 'needs_work'
            },
            {
                metric: 'Efficiency',
                current: `${night.sleep_efficiency.toFixed(0)}%`,
                target: '90%+',
                status: night.sleep_efficiency >= 90 ? 'achieved' :
                    night.sleep_efficiency >= 85 ? 'close' : 'needs_work'
            }
        ];
    }
}

// Singleton instance
export const sleepArchitectureEngine = new SleepArchitectureEngine();

// Export convenience function
export function analyzeSleep(): SleepAnalysisOutput | null {
    return sleepArchitectureEngine.analyze();
}
