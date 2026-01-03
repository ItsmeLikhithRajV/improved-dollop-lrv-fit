/**
 * HISTORY TYPES - Data structures for tracking user history
 */

// Snapshot of state at a moment in time
export interface HistoricalDataPoint {
    timestamp: number;
    date: string; // YYYY-MM-DD for easy grouping

    // Core metrics
    readiness: number;
    fuel_score: number;
    hrv: number;
    stress: number;
    mood: number;

    // Sleep metrics
    sleep_duration: number;
    sleep_efficiency: number;
    sleep_debt: number;

    // Physical metrics
    recovery_score: number;
    acwr: number;
    acute_load: number;
    chronic_load: number;

    // Context
    active_command_id?: string;
    sessions_completed?: number;
    time_of_day: 'morning' | 'midday' | 'afternoon' | 'evening' | 'night';
}

// Result of following a command
export interface ActionOutcome {
    command_id: string;
    command_name: string;
    engine: 'fuel' | 'recovery' | 'mindspace' | 'performance';

    started_at: number;
    completed_at?: number;
    skipped?: boolean;

    // User feedback
    perceived_impact: number; // 1-10
    notes?: string;

    // Measured delta (before -> after)
    readiness_delta?: number;
    fuel_delta?: number;
    stress_delta?: number;
}

// Collection of historical data
export interface UserHistory {
    dataPoints: HistoricalDataPoint[];
    outcomes: ActionOutcome[];

    // Meta
    firstSeen: number;
    lastUpdated: number;
    totalDays: number;
}

// Pattern detected by learning engine
export interface Pattern {
    id: string;
    type: 'correlation' | 'trend' | 'cycle' | 'anomaly';
    description: string;
    confidence: number; // 0-1
    metrics: string[];
    insight: string;
    actionable?: string;
}

// Insight generated for user
export interface Insight {
    id: string;
    category: 'sleep' | 'fuel' | 'training' | 'recovery' | 'mental';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    generated_at: number;
    based_on: string[]; // metric names
}

// Weekly report structure
export interface WeeklyReport {
    week_start: string; // YYYY-MM-DD
    week_end: string;

    // Aggregates
    avg_readiness: number;
    avg_fuel_score: number;
    avg_sleep_duration: number;
    avg_hrv: number;
    total_sessions: number;

    // Comparisons
    readiness_vs_prev_week: number; // percentage change
    hrv_trend: 'up' | 'down' | 'stable';

    // Highlights
    wins: string[];
    improvements: string[];

    // AI Summary
    ai_summary?: string;
}
