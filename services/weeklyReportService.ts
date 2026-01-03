/**
 * WEEKLY REPORT SERVICE
 * Aggregates and generates weekly performance reports
 */

import { UserHistory, WeeklyReport } from './history/types';
import { getHistory, getAverages } from './history/historyStore';

/**
 * Generate a weekly report from history data
 */
export function generateWeeklyReport(history: UserHistory): WeeklyReport | null {
    // Get last 7 days and previous 7 days for comparison
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeek = history.dataPoints.filter(
        dp => dp.timestamp >= weekAgo.getTime()
    );

    const prevWeek = history.dataPoints.filter(
        dp => dp.timestamp >= twoWeeksAgo.getTime() && dp.timestamp < weekAgo.getTime()
    );

    if (thisWeek.length < 3) {
        return null; // Not enough data
    }

    // Calculate averages
    const avg = (arr: number[]) => arr.length > 0
        ? arr.reduce((a, b) => a + b, 0) / arr.length
        : 0;

    const thisWeekAvg = {
        readiness: avg(thisWeek.map(d => d.readiness)),
        fuel: avg(thisWeek.map(d => d.fuel_score)),
        sleep: avg(thisWeek.map(d => d.sleep_duration)),
        hrv: avg(thisWeek.map(d => d.hrv))
    };

    const prevWeekAvg = {
        readiness: avg(prevWeek.map(d => d.readiness)),
        fuel: avg(prevWeek.map(d => d.fuel_score)),
        sleep: avg(prevWeek.map(d => d.sleep_duration)),
        hrv: avg(prevWeek.map(d => d.hrv))
    };

    // Calculate comparison
    const readinessChange = prevWeekAvg.readiness > 0
        ? ((thisWeekAvg.readiness - prevWeekAvg.readiness) / prevWeekAvg.readiness) * 100
        : 0;

    // Determine HRV trend
    let hrvTrend: 'up' | 'down' | 'stable' = 'stable';
    if (prevWeekAvg.hrv > 0) {
        const hrvChange = ((thisWeekAvg.hrv - prevWeekAvg.hrv) / prevWeekAvg.hrv) * 100;
        if (hrvChange > 5) hrvTrend = 'up';
        else if (hrvChange < -5) hrvTrend = 'down';
    }

    // Identify wins
    const wins: string[] = [];
    if (readinessChange > 5) wins.push('Readiness improved this week');
    if (thisWeekAvg.sleep >= 7.5) wins.push('Consistent sleep above 7.5 hours');
    if (thisWeekAvg.fuel >= 70) wins.push('Solid nutrition maintained');
    if (hrvTrend === 'up') wins.push('HRV trending upward');

    // Identify improvements
    const improvements: string[] = [];
    if (readinessChange < -5) improvements.push('Readiness declined - consider recovery focus');
    if (thisWeekAvg.sleep < 7) improvements.push('Sleep below optimal - prioritize rest');
    if (thisWeekAvg.fuel < 60) improvements.push('Fuel consistency could improve');
    if (hrvTrend === 'down') improvements.push('HRV declining - monitor stress levels');

    // Count sessions
    const totalSessions = thisWeek.reduce(
        (sum, dp) => sum + (dp.sessions_completed || 0),
        0
    );

    return {
        week_start: weekAgo.toISOString().split('T')[0],
        week_end: now.toISOString().split('T')[0],
        avg_readiness: Math.round(thisWeekAvg.readiness),
        avg_fuel_score: Math.round(thisWeekAvg.fuel),
        avg_sleep_duration: Math.round(thisWeekAvg.sleep * 10) / 10,
        avg_hrv: Math.round(thisWeekAvg.hrv),
        total_sessions: totalSessions,
        readiness_vs_prev_week: Math.round(readinessChange),
        hrv_trend: hrvTrend,
        wins,
        improvements
    };
}

/**
 * Get trend data for charts
 */
export function getTrendData(
    history: UserHistory,
    metric: 'readiness' | 'fuel_score' | 'hrv' | 'sleep_duration' | 'stress',
    days: number = 7
): { date: string; value: number }[] {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    // Group by date and take latest value for each day
    const byDate: Record<string, number> = {};

    history.dataPoints
        .filter(dp => dp.timestamp >= cutoff)
        .sort((a, b) => a.timestamp - b.timestamp)
        .forEach(dp => {
            byDate[dp.date] = dp[metric] as number;
        });

    return Object.entries(byDate).map(([date, value]) => ({
        date,
        value: Math.round(value * 10) / 10
    }));
}

/**
 * Compare two periods
 */
export function comparePeriods(
    history: UserHistory,
    periodDays: number = 7
): {
    current: Record<string, number>;
    previous: Record<string, number>;
    changes: Record<string, number>;
} {
    const now = Date.now();
    const periodMs = periodDays * 24 * 60 * 60 * 1000;

    const currentPeriod = history.dataPoints.filter(
        dp => dp.timestamp >= now - periodMs
    );
    const previousPeriod = history.dataPoints.filter(
        dp => dp.timestamp >= now - 2 * periodMs && dp.timestamp < now - periodMs
    );

    const metrics = ['readiness', 'fuel_score', 'hrv', 'sleep_duration', 'stress'] as const;

    const avg = (points: typeof currentPeriod, metric: typeof metrics[number]) =>
        points.length > 0
            ? points.reduce((s, p) => s + (p[metric] as number || 0), 0) / points.length
            : 0;

    const current: Record<string, number> = {};
    const previous: Record<string, number> = {};
    const changes: Record<string, number> = {};

    for (const metric of metrics) {
        current[metric] = Math.round(avg(currentPeriod, metric) * 10) / 10;
        previous[metric] = Math.round(avg(previousPeriod, metric) * 10) / 10;
        changes[metric] = previous[metric] > 0
            ? Math.round(((current[metric] - previous[metric]) / previous[metric]) * 100)
            : 0;
    }

    return { current, previous, changes };
}
