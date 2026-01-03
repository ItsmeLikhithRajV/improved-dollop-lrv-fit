
export interface HistoricalDataPoint {
    timestamp: number;
    readiness: number;
    sleep_debt: number;
    stress: number;
    fuel_score: number;
    recovery_score: number;

    // Optional metrics used in analysis
    sleep_duration: number;
    sessions_completed?: number;
    [key: string]: number | undefined;
}

export interface ActionOutcome {
    id: string;
    engine: string;
    completed_at: number; // or string based on usage, likely number if comparing time
    skipped: boolean;
    perceived_impact: number;
}

export interface UserHistory {
    dataPoints: HistoricalDataPoint[];
    outcomes: ActionOutcome[];
}

export interface Pattern {
    id: string;
    type: 'correlation' | 'cycle' | 'anomaly' | 'trend';
    description: string;
    confidence: number;
    metrics: string[];
    insight: string;
    actionable?: string;
}

export type InsightCategory = 'training' | 'recovery' | 'sleep' | 'fuel' | 'mind';

export interface Insight {
    id: string;
    category: InsightCategory;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    generated_at: number;
    based_on: string[];
}
