/**
 * HISTORY STORE - LocalStorage-backed persistence for user history
 * 
 * Features:
 * - Auto-persist state snapshots
 * - Track action outcomes
 * - 90-day retention policy
 * - Efficient retrieval by date range
 */

import { HistoricalDataPoint, ActionOutcome, UserHistory } from './types';
import { GlobalState } from '../../types';

const STORAGE_KEY = 'sentient_history';
const MAX_DAYS = 90;
const MAX_OUTCOMES = 500;

// Get time of day from hour
function getTimeOfDay(hour: number): HistoricalDataPoint['time_of_day'] {
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 14) return 'midday';
    if (hour < 18) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
}

// Create data point snapshot from current state
export function createDataPoint(state: GlobalState): HistoricalDataPoint {
    const now = new Date();

    return {
        timestamp: now.getTime(),
        date: now.toISOString().split('T')[0],
        time_of_day: getTimeOfDay(now.getHours()),

        // Core metrics
        readiness: state.mindspace.readiness_score,
        fuel_score: state.fuel.fuel_score,
        hrv: state.sleep.hrv,
        stress: state.mindspace.stress,
        mood: state.mindspace.mood,

        // Sleep metrics
        sleep_duration: state.sleep.duration,
        sleep_efficiency: state.sleep.efficiency,
        sleep_debt: state.sleep.sleep_debt,

        // Physical metrics
        recovery_score: state.recovery.recovery_score,
        acwr: state.physical_load.acwr,
        acute_load: state.physical_load.acute_load,
        chronic_load: state.physical_load.chronic_load,

        // Context
        sessions_completed: state.timeline.sessions.filter(s => s.completed).length
    };
}

// Load history from LocalStorage
export function loadHistory(): UserHistory {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.warn('[HistoryStore] Failed to load history:', e);
    }

    return {
        dataPoints: [],
        outcomes: [],
        firstSeen: Date.now(),
        lastUpdated: Date.now(),
        totalDays: 0
    };
}

// Save history to LocalStorage
function saveHistory(history: UserHistory): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
        console.warn('[HistoryStore] Failed to save history:', e);
    }
}

// Clean old data beyond retention period
function cleanOldData(history: UserHistory): UserHistory {
    const cutoff = Date.now() - (MAX_DAYS * 24 * 60 * 60 * 1000);

    return {
        ...history,
        dataPoints: history.dataPoints.filter(dp => dp.timestamp > cutoff),
        outcomes: history.outcomes.slice(-MAX_OUTCOMES)
    };
}

// Save a data point snapshot
export function saveDataPoint(state: GlobalState): void {
    const history = loadHistory();
    const point = createDataPoint(state);

    // Only save if different date or significant time has passed (>1 hour)
    const lastPoint = history.dataPoints[history.dataPoints.length - 1];
    if (lastPoint) {
        const timeDiff = point.timestamp - lastPoint.timestamp;
        if (timeDiff < 60 * 60 * 1000 && point.date === lastPoint.date) {
            // Update existing point instead of adding new
            history.dataPoints[history.dataPoints.length - 1] = point;
            history.lastUpdated = Date.now();
            saveHistory(history);
            return;
        }
    }

    history.dataPoints.push(point);
    history.lastUpdated = Date.now();

    // Count unique days
    const uniqueDays = new Set(history.dataPoints.map(dp => dp.date));
    history.totalDays = uniqueDays.size;

    // Clean and save
    const cleanedHistory = cleanOldData(history);
    saveHistory(cleanedHistory);
}

// Save an action outcome
export function saveOutcome(outcome: ActionOutcome): void {
    const history = loadHistory();

    // Check if outcome for this command already exists
    const existingIdx = history.outcomes.findIndex(o => o.command_id === outcome.command_id);
    if (existingIdx >= 0) {
        history.outcomes[existingIdx] = outcome;
    } else {
        history.outcomes.push(outcome);
    }

    history.lastUpdated = Date.now();

    const cleanedHistory = cleanOldData(history);
    saveHistory(cleanedHistory);
}

// Get history for last N days
export function getHistory(days: number = 30): UserHistory {
    const history = loadHistory();
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);

    return {
        ...history,
        dataPoints: history.dataPoints.filter(dp => dp.timestamp > cutoff),
        outcomes: history.outcomes.filter(o => o.started_at > cutoff)
    };
}

// Get data points for a specific date
export function getDataPointsForDate(date: string): HistoricalDataPoint[] {
    const history = loadHistory();
    return history.dataPoints.filter(dp => dp.date === date);
}

// Get average metrics for last N days
export function getAverages(days: number = 7): Record<string, number> {
    const history = getHistory(days);

    if (history.dataPoints.length === 0) {
        return {};
    }

    const sum = history.dataPoints.reduce((acc, dp) => ({
        readiness: acc.readiness + dp.readiness,
        fuel_score: acc.fuel_score + dp.fuel_score,
        hrv: acc.hrv + dp.hrv,
        stress: acc.stress + dp.stress,
        sleep_duration: acc.sleep_duration + dp.sleep_duration,
        recovery_score: acc.recovery_score + dp.recovery_score
    }), {
        readiness: 0,
        fuel_score: 0,
        hrv: 0,
        stress: 0,
        sleep_duration: 0,
        recovery_score: 0
    });

    const count = history.dataPoints.length;

    return {
        readiness: Math.round(sum.readiness / count),
        fuel_score: Math.round(sum.fuel_score / count),
        hrv: Math.round(sum.hrv / count),
        stress: Math.round((sum.stress / count) * 10) / 10,
        sleep_duration: Math.round((sum.sleep_duration / count) * 10) / 10,
        recovery_score: Math.round(sum.recovery_score / count)
    };
}

// Clear all history
export function clearHistory(): void {
    localStorage.removeItem(STORAGE_KEY);
}

// Export history as JSON
export function exportHistory(): string {
    const history = loadHistory();
    return JSON.stringify(history, null, 2);
}

// Import history from JSON
export function importHistory(json: string): boolean {
    try {
        const history = JSON.parse(json) as UserHistory;
        saveHistory(history);
        return true;
    } catch (e) {
        console.error('[HistoryStore] Failed to import history:', e);
        return false;
    }
}
