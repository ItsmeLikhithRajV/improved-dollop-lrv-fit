/**
 * Load Management Engine - ACWR & Injury Prevention
 * 
 * Implements:
 * - Tim Gabbett's ACWR methodology
 * - Rolling average and EWMA calculations
 * - Zone classification with injury risk multipliers
 * - Load recommendations
 */

import {
    DailyLoad,
    WeeklyLoad,
    ACWRMetrics,
    ACWRZone,
    ACWRZoneInfo,
    ACWR_ZONES,
    EWMA_CONFIG,
    LoadRecommendation,
    ChronicLoadProfile,
    LoadManagementOutput,
    MonotonyStrain
} from '../../types/load-management';

// ============================================================================
// MOCK DATA GENERATION
// ============================================================================

const generateMockLoadHistory = (days: number): DailyLoad[] => {
    const history: DailyLoad[] = [];

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        // Simulate training pattern: 5 days training, 2 rest
        const dayOfWeek = date.getDay();
        const isRestDay = dayOfWeek === 0 || dayOfWeek === 6;

        if (isRestDay) {
            history.push({
                date: date.toISOString().split('T')[0],
                session_rpe: 0,
                duration_minutes: 0,
                load_au: 0,
                session_type: 'rest',
                intensity_zone: 'low'
            });
        } else {
            const rpe = 5 + Math.floor(Math.random() * 4); // 5-8
            const duration = 45 + Math.floor(Math.random() * 45); // 45-90
            history.push({
                date: date.toISOString().split('T')[0],
                session_rpe: rpe,
                duration_minutes: duration,
                load_au: rpe * duration,
                session_type: 'training',
                intensity_zone: rpe >= 7 ? 'high' : rpe >= 5 ? 'moderate' : 'low'
            });
        }
    }

    return history;
};

// ============================================================================
// CALCULATION HELPERS
// ============================================================================

const sum = (values: number[]): number => values.reduce((a, b) => a + b, 0);
const mean = (values: number[]): number => values.length > 0 ? sum(values) / values.length : 0;
const standardDeviation = (values: number[]): number => {
    if (values.length === 0) return 0;
    const avg = mean(values);
    return Math.sqrt(mean(values.map(v => Math.pow(v - avg, 2))));
};

// ============================================================================
// MAIN ENGINE
// ============================================================================

export class LoadManagementEngine {
    private history: DailyLoad[] = [];

    constructor() {
        // Initialize with mock data
        this.history = generateMockLoadHistory(90);
    }

    /**
     * Add a new daily load entry
     */
    addDailyLoad(load: DailyLoad): void {
        this.history.push(load);
        // Keep last 90 days
        this.history = this.history.slice(-90);
    }

    /**
     * Calculate acute load (last 7 days sum)
     */
    calculateAcuteLoad(): number {
        const last7Days = this.history.slice(-7);
        return sum(last7Days.map(d => d.load_au));
    }

    /**
     * Calculate chronic load (28-day rolling weekly average)
     */
    calculateChronicLoad(): number {
        const last28Days = this.history.slice(-28);
        const totalLoad = sum(last28Days.map(d => d.load_au));
        // Chronic = average weekly load over 4 weeks
        return totalLoad / 4;
    }

    /**
     * Calculate ACWR using exponentially weighted moving average (EWMA)
     * More responsive to recent changes than rolling average
     */
    calculateACWR_EWMA(): number {
        if (this.history.length < 7) return 1.0;

        const loads = this.history.slice(-28).map(d => d.load_au);

        // Calculate EWMA for acute (7-day decay)
        let acuteEWMA = loads[0];
        for (let i = 1; i < Math.min(7, loads.length); i++) {
            acuteEWMA = loads[i] * EWMA_CONFIG.acute_lambda + acuteEWMA * (1 - EWMA_CONFIG.acute_lambda);
        }

        // Calculate EWMA for chronic (28-day decay)
        let chronicEWMA = loads[0];
        for (let i = 1; i < loads.length; i++) {
            chronicEWMA = loads[i] * EWMA_CONFIG.chronic_lambda + chronicEWMA * (1 - EWMA_CONFIG.chronic_lambda);
        }

        if (chronicEWMA === 0) return 1.0;

        // Scale to weekly for comparison
        return (acuteEWMA * 7) / (chronicEWMA * 7);
    }

    /**
     * Calculate ACWR using rolling average method
     */
    calculateACWR_Rolling(): number {
        const acute = this.calculateAcuteLoad();
        const chronic = this.calculateChronicLoad();

        if (chronic === 0) return 1.0;
        return acute / chronic;
    }

    /**
     * Classify ACWR into zone
     */
    classifyZone(acwr: number): { zone: ACWRZone; info: ACWRZoneInfo } {
        const zoneInfo = ACWR_ZONES.find(z => acwr >= z.min && acwr < z.max)
            || ACWR_ZONES[ACWR_ZONES.length - 1];
        return { zone: zoneInfo.zone, info: zoneInfo };
    }

    /**
     * Calculate historical ACWR for trajectory analysis
     */
    calculateHistoricalACWR(daysAgo: number): number {
        if (this.history.length <= daysAgo + 7) return 1.0;

        const historicalIndex = this.history.length - daysAgo;
        const acute = sum(this.history.slice(historicalIndex - 7, historicalIndex).map(d => d.load_au));
        const chronicStart = Math.max(0, historicalIndex - 28);
        const chronic = sum(this.history.slice(chronicStart, historicalIndex).map(d => d.load_au)) / 4;

        if (chronic === 0) return 1.0;
        return acute / chronic;
    }

    /**
     * Get trajectory direction
     */
    getTrajectory(currentACWR: number, acwr7dAgo: number): 'rising' | 'stable' | 'falling' {
        const diff = currentACWR - acwr7dAgo;
        if (diff > 0.1) return 'rising';
        if (diff < -0.1) return 'falling';
        return 'stable';
    }

    /**
     * Calculate days in danger zone (>1.5) in last 28 days
     */
    calculateDaysInDangerZone(): number {
        let count = 0;
        for (let i = 0; i < 28 && i < this.history.length; i++) {
            const acwr = this.calculateHistoricalACWR(i);
            if (acwr > 1.5) count++;
        }
        return count;
    }

    /**
     * Calculate recommended load for today
     */
    calculateRecommendedLoad(currentACWR: number, chronic: number): { recommended: number; max: number } {
        // Target ACWR of 1.0-1.2 (optimal zone)
        const targetACWR = 1.1;
        const maxSafeACWR = 1.3;

        // Recommended daily load = (Target ACWR × Chronic) / 7 days
        const recommendedWeekly = targetACWR * chronic;
        const maxSafeWeekly = maxSafeACWR * chronic;

        // Account for already accumulated acute load (last 6 days)
        const last6Days = sum(this.history.slice(-6).map(d => d.load_au));

        const recommendedToday = Math.max(0, recommendedWeekly - last6Days);
        const maxToday = Math.max(0, maxSafeWeekly - last6Days);

        return { recommended: Math.round(recommendedToday), max: Math.round(maxToday) };
    }

    /**
     * Calculate load needed to reach optimal zone
     */
    calculateLoadToOptimal(currentACWR: number, chronic: number): number {
        if (currentACWR >= 0.8 && currentACWR <= 1.3) return 0; // Already optimal

        const targetACWR = currentACWR < 0.8 ? 0.9 : 1.2;
        const last6Days = sum(this.history.slice(-6).map(d => d.load_au));
        const neededWeekly = targetACWR * chronic;

        return Math.max(0, neededWeekly - last6Days);
    }

    /**
     * Calculate monotony and strain
     */
    calculateMonotonyStrain(): MonotonyStrain {
        const last7Days = this.history.slice(-7);
        const loads = last7Days.map(d => d.load_au);

        const weeklyMean = mean(loads);
        const weeklySD = standardDeviation(loads);

        // Monotony = Mean / SD (high monotony = boring, uniform training)
        const monotony = weeklySD > 0 ? weeklyMean / weeklySD : 0;

        // Strain = Weekly Load × Monotony
        const weeklyLoad = sum(loads);
        const strain = weeklyLoad * monotony;

        // Typical strain threshold is 4000-6000 AU depending on athlete
        const strainThreshold = 5000;

        return {
            weekly_load_mean: weeklyMean,
            weekly_load_sd: weeklySD,
            monotony,
            strain,
            monotony_threshold: 2.0,
            strain_threshold: strainThreshold,
            monotony_status: monotony > 2.0 ? 'high' : monotony > 1.5 ? 'moderate' : 'low',
            strain_status: strain > strainThreshold * 1.2 ? 'high' : strain > strainThreshold * 0.8 ? 'moderate' : 'low'
        };
    }

    /**
     * Build chronic load profile
     */
    buildChronicProfile(): ChronicLoadProfile {
        const currentChronic = this.calculateChronicLoad();

        // Calculate chronic from 3 months ago
        const chronic3MonthsAgo = this.history.length >= 90
            ? sum(this.history.slice(0, 28).map(d => d.load_au)) / 4
            : currentChronic;

        const changePercentage = chronic3MonthsAgo > 0
            ? ((currentChronic - chronic3MonthsAgo) / chronic3MonthsAgo) * 100
            : 0;

        return {
            current_chronic: currentChronic,
            target_chronic: currentChronic * 1.2, // 20% higher as example target
            building_rate: currentChronic * 0.1 / 4, // ~10% over 4 weeks
            estimated_weeks_to_target: 4,
            chronic_3_months_ago: chronic3MonthsAgo,
            chronic_trend: changePercentage > 5 ? 'building' : changePercentage < -5 ? 'declining' : 'maintaining',
            chronic_change_percentage: changePercentage
        };
    }

    /**
     * Generate recommendations based on current state
     */
    generateRecommendations(acwr: number, zone: ACWRZone, monotony: MonotonyStrain): LoadRecommendation[] {
        const recommendations: LoadRecommendation[] = [];

        if (zone === 'undertrained') {
            recommendations.push({
                priority: 'high',
                type: 'increase',
                title: 'Increase Training Load',
                description: 'Your training load is below optimal. Gradually increase by 10-15% per week.',
                target_load: this.calculateChronicLoad() * 0.9 / 7,
                rationale: 'Low chronic load reduces preparedness and may increase injury risk.'
            });
        }

        if (zone === 'high_risk' || zone === 'very_high_risk') {
            recommendations.push({
                priority: 'critical',
                type: 'reduce',
                title: 'Reduce Training Load Immediately',
                description: 'You are in the danger zone. Add rest days or reduce intensity.',
                target_load: this.calculateChronicLoad() * 1.2 / 7,
                rationale: 'ACWR above 1.5 increases injury risk by 2-4x.'
            });
        }

        if (monotony.monotony_status === 'high') {
            recommendations.push({
                priority: 'medium',
                type: 'maintain',
                title: 'Increase Training Variety',
                description: 'Your training is too uniform. Add variety in intensity and volume.',
                target_load: mean(this.history.slice(-7).map(d => d.load_au)),
                rationale: 'High monotony (>2.0) is associated with staleness and overtraining.'
            });
        }

        return recommendations;
    }

    /**
     * Main analysis method
     */
    analyze(): LoadManagementOutput {
        const acwr = this.calculateACWR_Rolling();
        const acwrEWMA = this.calculateACWR_EWMA();
        const acute = this.calculateAcuteLoad();
        const chronic = this.calculateChronicLoad();

        const { zone, info: zoneInfo } = this.classifyZone(acwr);
        const acwr7dAgo = this.calculateHistoricalACWR(7);
        const acwr14dAgo = this.calculateHistoricalACWR(14);

        const { recommended, max } = this.calculateRecommendedLoad(acwr, chronic);

        const monotonyStrain = this.calculateMonotonyStrain();
        const chronicProfile = this.buildChronicProfile();
        const recommendations = this.generateRecommendations(acwr, zone, monotonyStrain);

        // Weekly load aggregation
        const weeklyLoads: WeeklyLoad[] = [];
        for (let w = 0; w < 12; w++) {
            const weekStart = this.history.length - (w + 1) * 7;
            if (weekStart < 0) break;

            const weekData = this.history.slice(Math.max(0, weekStart), weekStart + 7);
            weeklyLoads.push({
                week_start: weekData[0]?.date || '',
                total_load: sum(weekData.map(d => d.load_au)),
                sessions: weekData.filter(d => d.load_au > 0).length,
                average_session_load: mean(weekData.filter(d => d.load_au > 0).map(d => d.load_au)),
                high_intensity_sessions: weekData.filter(d => d.intensity_zone === 'high').length,
                rest_days: weekData.filter(d => d.load_au === 0).length
            });
        }

        // Determine overall readiness
        let trainingReadiness: 'green' | 'amber' | 'red' = 'green';
        if (zone === 'high_risk' || zone === 'very_high_risk') trainingReadiness = 'red';
        else if (zone === 'moderate_risk' || zone === 'undertrained') trainingReadiness = 'amber';

        // Suggested session type
        let suggestedSession: LoadManagementOutput['suggested_session_type'] = 'moderate';
        if (trainingReadiness === 'red') suggestedSession = 'rest';
        else if (zone === 'optimal') suggestedSession = 'high_intensity';
        else if (zone === 'moderate_risk') suggestedSession = 'low_intensity';

        // Injury risk level
        let injuryRiskLevel: LoadManagementOutput['injury_risk_level'] = 'low';
        if (zoneInfo.injury_risk_multiplier >= 4.0) injuryRiskLevel = 'critical';
        else if (zoneInfo.injury_risk_multiplier >= 2.0) injuryRiskLevel = 'high';
        else if (zoneInfo.injury_risk_multiplier >= 1.5) injuryRiskLevel = 'elevated';
        else if (zoneInfo.injury_risk_multiplier >= 1.1) injuryRiskLevel = 'moderate';

        const contributingFactors: string[] = [];
        if (acwr > 1.3) contributingFactors.push('ACWR above optimal range');
        if (this.calculateDaysInDangerZone() > 3) contributingFactors.push('Multiple days in danger zone recently');
        if (monotonyStrain.monotony_status === 'high') contributingFactors.push('High training monotony');
        if (monotonyStrain.strain_status === 'high') contributingFactors.push('Elevated training strain');

        return {
            acwr: {
                acute_load_7d: acute,
                chronic_load_28d: chronic,
                acwr_rolling: acwr,
                acwr_ewma: acwrEWMA,
                zone,
                zone_info: zoneInfo,
                trajectory: this.getTrajectory(acwr, acwr7dAgo),
                trajectory_rate: (acwr - acwr7dAgo) / 7,
                acwr_7d_ago: acwr7dAgo,
                acwr_14d_ago: acwr14dAgo,
                injury_risk_multiplier: zoneInfo.injury_risk_multiplier,
                days_in_current_zone: 1, // Simplified
                days_above_1_5: this.calculateDaysInDangerZone(),
                recommended_load_today: recommended,
                max_safe_load_today: max,
                load_to_reach_optimal: this.calculateLoadToOptimal(acwr, chronic),
                days_to_safe_increase: acwr > 1.3 ? Math.ceil((acwr - 1.2) / 0.05) : 0
            },
            chronic_profile: chronicProfile,
            daily_loads_28d: this.history.slice(-28),
            weekly_loads_12w: weeklyLoads,
            training_readiness: trainingReadiness,
            suggested_session_type: suggestedSession,
            recommendations,
            injury_risk_level: injuryRiskLevel,
            contributing_factors: contributingFactors
        };
    }

    /**
     * Get raw history
     */
    getHistory(): DailyLoad[] {
        return this.history;
    }
}

// Singleton instance
export const loadManagementEngine = new LoadManagementEngine();

// Export convenience function
export function analyzeLoad(): LoadManagementOutput {
    return loadManagementEngine.analyze();
}
