// Personal Records Types

export type PRCategory = 'running' | 'cycling' | 'swimming' | 'strength' | 'power' | 'recovery' | 'custom';
export type PRSource = 'manual' | 'wearable' | 'calculated';

export interface PersonalRecord {
    id: string;
    category: PRCategory;
    name: string;
    value: number;
    unit: string;
    date: string;
    source: PRSource;
    conditions?: {
        fresh: boolean;
        altitude_m?: number;
        temperature_c?: number;
        notes?: string;
    };
    previousBest?: number;
    trend: 'improving' | 'stable' | 'declining';
}

// Preset PR Templates
export const PR_TEMPLATES: Record<PRCategory, Array<{ name: string; unit: string; description: string }>> = {
    running: [
        { name: 'Fastest 1K', unit: 'min:sec', description: 'Best 1 kilometer time' },
        { name: 'Fastest 5K', unit: 'min:sec', description: 'Best 5 kilometer time' },
        { name: 'Fastest 10K', unit: 'min:sec', description: 'Best 10 kilometer time' },
        { name: 'Fastest Half Marathon', unit: 'min:sec', description: 'Best 21.1km time' },
        { name: 'Fastest Marathon', unit: 'min:sec', description: 'Best 42.2km time' },
        { name: 'Longest Run', unit: 'km', description: 'Longest single run distance' },
    ],
    cycling: [
        { name: 'Best 20-min Power', unit: 'watts', description: 'Highest 20-minute average power' },
        { name: 'Best FTP', unit: 'watts', description: 'Functional Threshold Power' },
        { name: 'Longest Ride', unit: 'km', description: 'Longest single ride distance' },
        { name: 'Most Elevation', unit: 'm', description: 'Most climbing in a ride' },
    ],
    swimming: [
        { name: 'Fastest 100m', unit: 'min:sec', description: 'Best 100m pool time' },
        { name: 'Fastest 400m', unit: 'min:sec', description: 'Best 400m pool time' },
        { name: 'Fastest 1500m', unit: 'min:sec', description: 'Best 1500m time' },
    ],
    strength: [
        { name: '1RM Squat', unit: 'kg', description: 'One rep max back squat' },
        { name: '1RM Bench Press', unit: 'kg', description: 'One rep max bench press' },
        { name: '1RM Deadlift', unit: 'kg', description: 'One rep max deadlift' },
        { name: '1RM Overhead Press', unit: 'kg', description: 'One rep max OHP' },
        { name: 'Max Pull-ups', unit: 'reps', description: 'Maximum consecutive pull-ups' },
        { name: 'Max Push-ups', unit: 'reps', description: 'Maximum consecutive push-ups' },
        { name: 'Max Dips', unit: 'reps', description: 'Maximum consecutive dips' },
    ],
    power: [
        { name: 'Vertical Jump', unit: 'cm', description: 'Highest vertical jump' },
        { name: 'Broad Jump', unit: 'cm', description: 'Longest standing broad jump' },
        { name: 'Sprint 40m', unit: 'sec', description: 'Fastest 40m sprint' },
    ],
    recovery: [
        { name: 'Best HRV Score', unit: 'ms', description: 'Highest resting HRV' },
        { name: 'Lowest Resting HR', unit: 'bpm', description: 'Lowest resting heart rate' },
        { name: 'Best Sleep Score', unit: '%', description: 'Highest sleep quality score' },
    ],
    custom: []
};

// Heatmap Types
export interface HeatmapDay {
    date: string;
    intensity: 'none' | 'low' | 'medium' | 'high' | 'missed';
    domain?: 'strength' | 'cardio' | 'recovery' | 'mixed';
    sessionCount: number;
    rpe?: number;
}

// Mission Suggestion Types
export interface MissionSuggestion {
    id: string;
    type: 'phase_transition' | 'plateau_break' | 'deload' | 'taper' | 'load_increase';
    title: string;
    reasoning: string;
    impact: string;
    suggestedAt: number;
    status: 'pending' | 'implemented' | 'ignored' | 'reminded';
    userResponse?: {
        action: 'implement' | 'ignore' | 'remind';
        timestamp: number;
    };
}

export interface AgentLearningState {
    suggestionHistory: MissionSuggestion[];
    preferenceScores: Record<MissionSuggestion['type'], {
        implementRate: number;
        ignoreRate: number;
        totalShown: number;
    }>;
}
