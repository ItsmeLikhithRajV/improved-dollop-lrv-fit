/**
 * LEARNING ENGINE - ML utilities for personalized insights
 * 
 * Features:
 * - EMA-based personal baselines
 * - Regression-based predictions
 * - Action effectiveness scoring
 * - Pattern detection
 * - Personal insight generation
 */

import { HistoricalDataPoint, ActionOutcome, UserHistory, Pattern, Insight } from './history/types';

// EMA smoothing factor (0.15 = responsive to recent changes)
const EMA_ALPHA = 0.15;

// Minimum data points needed for analysis
const MIN_DATA_POINTS = 7;

export class LearningEngine {

    /**
     * Calculate personal baseline using Exponential Moving Average
     * More weight on recent values, adapts to personal trends
     */
    static calculatePersonalBaseline(
        dataPoints: HistoricalDataPoint[],
        metric: keyof HistoricalDataPoint
    ): { baseline: number; variance: number; trend: 'up' | 'down' | 'stable' } {
        if (dataPoints.length < MIN_DATA_POINTS) {
            return { baseline: 0, variance: 0, trend: 'stable' };
        }

        // Sort by timestamp ascending
        const sorted = [...dataPoints].sort((a, b) => a.timestamp - b.timestamp);

        // Calculate EMA
        let ema = sorted[0][metric] as number || 0;
        const values: number[] = [];

        for (const dp of sorted) {
            const value = dp[metric] as number || 0;
            values.push(value);
            ema = EMA_ALPHA * value + (1 - EMA_ALPHA) * ema;
        }

        // Calculate variance
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;

        // Calculate trend (compare first third to last third)
        const thirdLen = Math.floor(values.length / 3);
        const firstThird = values.slice(0, thirdLen);
        const lastThird = values.slice(-thirdLen);
        const firstAvg = firstThird.reduce((a, b) => a + b, 0) / firstThird.length;
        const lastAvg = lastThird.reduce((a, b) => a + b, 0) / lastThird.length;

        const changePct = ((lastAvg - firstAvg) / firstAvg) * 100;
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (changePct > 5) trend = 'up';
        else if (changePct < -5) trend = 'down';

        return {
            baseline: Math.round(ema * 10) / 10,
            variance: Math.round(variance * 10) / 10,
            trend
        };
    }

    /**
     * Predict tomorrow's readiness using linear regression
     * Returns predicted value and confidence (0-1)
     */
    static predictTomorrowReadiness(
        dataPoints: HistoricalDataPoint[]
    ): { value: number; confidence: number; factors: string[] } {
        if (dataPoints.length < MIN_DATA_POINTS) {
            return { value: 70, confidence: 0, factors: ['Insufficient data'] };
        }

        const sorted = [...dataPoints].sort((a, b) => a.timestamp - b.timestamp);
        const recent = sorted.slice(-14); // Last 2 weeks

        // Simple linear regression on readiness
        const n = recent.length;
        const xs = recent.map((_, i) => i);
        const ys = recent.map(dp => dp.readiness);

        const sumX = xs.reduce((a, b) => a + b, 0);
        const sumY = ys.reduce((a, b) => a + b, 0);
        const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
        const sumXX = xs.reduce((acc, x) => acc + x * x, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Predict for next day
        let predicted = intercept + slope * n;

        // Clamp to reasonable range
        predicted = Math.max(30, Math.min(100, predicted));

        // Calculate R-squared for confidence
        const yMean = sumY / n;
        const ssTotal = ys.reduce((acc, y) => acc + Math.pow(y - yMean, 2), 0);
        const ssRes = ys.reduce((acc, y, i) => acc + Math.pow(y - (intercept + slope * xs[i]), 2), 0);
        const rSquared = 1 - (ssRes / ssTotal);

        // Identify factors affecting prediction
        const factors: string[] = [];
        const lastDp = recent[recent.length - 1];

        if (lastDp.sleep_debt > 2) factors.push('High sleep debt');
        if (lastDp.stress > 7) factors.push('Elevated stress');
        if (lastDp.fuel_score < 50) factors.push('Low fuel');
        if (lastDp.recovery_score < 60) factors.push('Poor recovery');
        if (slope > 2) factors.push('Strong upward trend');
        if (slope < -2) factors.push('Declining trend');

        return {
            value: Math.round(predicted),
            confidence: Math.max(0, Math.min(1, rSquared)),
            factors: factors.length > 0 ? factors : ['Stable pattern']
        };
    }

    /**
     * Score effectiveness of each action type based on outcomes
     * Returns score 0-100 for each command type
     */
    static scoreActionEffectiveness(
        outcomes: ActionOutcome[]
    ): Record<string, { score: number; count: number; avgImpact: number }> {
        const scores: Record<string, { totalImpact: number; count: number }> = {};

        for (const outcome of outcomes) {
            if (!outcome.completed_at || outcome.skipped) continue;

            const key = outcome.engine;
            if (!scores[key]) {
                scores[key] = { totalImpact: 0, count: 0 };
            }

            scores[key].totalImpact += outcome.perceived_impact;
            scores[key].count++;
        }

        const result: Record<string, { score: number; count: number; avgImpact: number }> = {};

        for (const [key, data] of Object.entries(scores)) {
            const avgImpact = data.totalImpact / data.count;
            result[key] = {
                score: Math.round(avgImpact * 10), // Scale 1-10 to 10-100
                count: data.count,
                avgImpact: Math.round(avgImpact * 10) / 10
            };
        }

        return result;
    }

    /**
     * Detect patterns in historical data
     * Looks for correlations, cycles, and anomalies
     */
    static detectPatterns(dataPoints: HistoricalDataPoint[]): Pattern[] {
        if (dataPoints.length < MIN_DATA_POINTS * 2) {
            return [];
        }

        const patterns: Pattern[] = [];
        const sorted = [...dataPoints].sort((a, b) => a.timestamp - b.timestamp);

        // Pattern 1: Sleep-Readiness correlation
        const sleepReadinessCorr = this.calculateCorrelation(
            sorted.map(dp => dp.sleep_duration),
            sorted.map(dp => dp.readiness)
        );

        if (Math.abs(sleepReadinessCorr) > 0.5) {
            patterns.push({
                id: 'sleep-readiness-corr',
                type: 'correlation',
                description: sleepReadinessCorr > 0
                    ? 'More sleep correlates with higher readiness'
                    : 'Sleep duration inversely affects readiness (unusual)',
                confidence: Math.abs(sleepReadinessCorr),
                metrics: ['sleep_duration', 'readiness'],
                insight: 'Your readiness responds strongly to sleep quality.',
                actionable: sleepReadinessCorr > 0.7 ? 'Prioritize sleep for performance gains' : undefined
            });
        }

        // Pattern 2: Stress-Recovery correlation
        const stressRecoveryCorr = this.calculateCorrelation(
            sorted.map(dp => dp.stress),
            sorted.map(dp => dp.recovery_score)
        );

        if (Math.abs(stressRecoveryCorr) > 0.4) {
            patterns.push({
                id: 'stress-recovery-corr',
                type: 'correlation',
                description: 'High stress days show reduced recovery',
                confidence: Math.abs(stressRecoveryCorr),
                metrics: ['stress', 'recovery_score'],
                insight: 'Mental load is impacting your physical recovery.',
                actionable: 'Consider stress management protocols on high-stress days'
            });
        }

        // Pattern 3: Weekly cycle detection
        const dayAverages = this.calculateDayOfWeekAverages(sorted, 'readiness');
        const maxDay = Object.entries(dayAverages).reduce((a, b) => a[1] > b[1] ? a : b);
        const minDay = Object.entries(dayAverages).reduce((a, b) => a[1] < b[1] ? a : b);

        if (maxDay[1] - minDay[1] > 10) {
            patterns.push({
                id: 'weekly-cycle',
                type: 'cycle',
                description: `Readiness peaks on ${maxDay[0]}s, lowest on ${minDay[0]}s`,
                confidence: 0.7,
                metrics: ['readiness'],
                insight: `Your energy follows a weekly pattern. Plan demanding work for ${maxDay[0]}s.`,
                actionable: `Schedule recovery on ${minDay[0]}s`
            });
        }

        // Pattern 4: Fuel-Performance relationship
        const fuelReadinessCorr = this.calculateCorrelation(
            sorted.map(dp => dp.fuel_score),
            sorted.map(dp => dp.readiness)
        );

        if (fuelReadinessCorr > 0.4) {
            patterns.push({
                id: 'fuel-readiness-corr',
                type: 'correlation',
                description: 'Nutrition strongly affects your readiness',
                confidence: fuelReadinessCorr,
                metrics: ['fuel_score', 'readiness'],
                insight: 'You are fuel-sensitive. Proper nutrition gives you an edge.',
                actionable: 'Maintain consistent fueling, especially before key sessions'
            });
        }

        return patterns;
    }

    /**
     * Generate personalized insights based on history
     */
    static generatePersonalInsights(history: UserHistory): Insight[] {
        const insights: Insight[] = [];
        const now = Date.now();

        if (history.dataPoints.length < MIN_DATA_POINTS) {
            insights.push({
                id: 'need-more-data',
                category: 'training',
                title: 'Building Your Profile',
                description: `Keep logging! ${MIN_DATA_POINTS - history.dataPoints.length} more days needed for personalized insights.`,
                priority: 'low',
                generated_at: now,
                based_on: []
            });
            return insights;
        }

        const recent = history.dataPoints.slice(-14);
        const baseline = this.calculatePersonalBaseline(history.dataPoints, 'readiness');
        const prediction = this.predictTomorrowReadiness(history.dataPoints);

        // Insight 1: Trend alert
        if (baseline.trend === 'down') {
            insights.push({
                id: 'trend-declining',
                category: 'recovery',
                title: 'Readiness Declining',
                description: 'Your readiness has been trending down. Consider a recovery focus.',
                priority: 'high',
                generated_at: now,
                based_on: ['readiness']
            });
        } else if (baseline.trend === 'up') {
            insights.push({
                id: 'trend-improving',
                category: 'training',
                title: 'Building Momentum',
                description: 'Your readiness is trending up. Good time to push training intensity.',
                priority: 'medium',
                generated_at: now,
                based_on: ['readiness']
            });
        }

        // Insight 2: Prediction-based
        if (prediction.confidence > 0.6 && prediction.value < 60) {
            insights.push({
                id: 'tomorrow-warning',
                category: 'training',
                title: 'Low Readiness Predicted',
                description: `Tomorrow's predicted readiness: ${prediction.value}. Consider lighter training.`,
                priority: 'high',
                generated_at: now,
                based_on: ['readiness', ...prediction.factors]
            });
        }

        // Insight 3: Sleep debt accumulation
        const avgSleepDebt = recent.reduce((sum, dp) => sum + dp.sleep_debt, 0) / recent.length;
        if (avgSleepDebt > 3) {
            insights.push({
                id: 'sleep-debt-high',
                category: 'sleep',
                title: 'Sleep Debt Accumulating',
                description: `Average sleep debt: ${avgSleepDebt.toFixed(1)}h. Prioritize 8+ hours tonight.`,
                priority: 'high',
                generated_at: now,
                based_on: ['sleep_debt', 'sleep_duration']
            });
        }

        // Insight 4: Action effectiveness
        const effectiveness = this.scoreActionEffectiveness(history.outcomes);
        const bestAction = Object.entries(effectiveness)
            .filter(([_, data]) => data.count >= 3)
            .sort((a, b) => b[1].score - a[1].score)[0];

        if (bestAction) {
            insights.push({
                id: 'best-action',
                category: bestAction[0] as any,
                title: `${bestAction[0]} Works Best For You`,
                description: `${bestAction[0]} actions have an average impact of ${bestAction[1].avgImpact}/10. Keep it up!`,
                priority: 'low',
                generated_at: now,
                based_on: ['action_outcomes']
            });
        }

        // Insight 5: Consistency check
        const completedSessions = recent.reduce((sum, dp) => sum + (dp.sessions_completed || 0), 0);
        if (completedSessions > 20) {
            insights.push({
                id: 'consistency-win',
                category: 'training',
                title: 'Great Consistency!',
                description: `${completedSessions} sessions completed in 2 weeks. Consistency is your superpower.`,
                priority: 'low',
                generated_at: now,
                based_on: ['sessions_completed']
            });
        }

        return insights.slice(0, 5); // Return top 5 insights
    }

    // --- Helper Methods ---

    private static calculateCorrelation(xs: number[], ys: number[]): number {
        const n = xs.length;
        if (n === 0) return 0;

        const sumX = xs.reduce((a, b) => a + b, 0);
        const sumY = ys.reduce((a, b) => a + b, 0);
        const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
        const sumXX = xs.reduce((acc, x) => acc + x * x, 0);
        const sumYY = ys.reduce((acc, y) => acc + y * y, 0);

        const num = n * sumXY - sumX * sumY;
        const den = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

        return den === 0 ? 0 : num / den;
    }

    private static calculateDayOfWeekAverages(
        dataPoints: HistoricalDataPoint[],
        metric: keyof HistoricalDataPoint
    ): Record<string, number> {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const daySums: Record<string, { sum: number; count: number }> = {};

        for (const dp of dataPoints) {
            const date = new Date(dp.timestamp);
            const dayName = dayNames[date.getDay()];

            if (!daySums[dayName]) {
                daySums[dayName] = { sum: 0, count: 0 };
            }

            daySums[dayName].sum += dp[metric] as number || 0;
            daySums[dayName].count++;
        }

        const result: Record<string, number> = {};
        for (const [day, data] of Object.entries(daySums)) {
            result[day] = Math.round(data.sum / data.count);
        }

        return result;
    }
}
