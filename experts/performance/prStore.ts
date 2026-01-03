/**
 * PR Store
 * Persistence layer for Personal Records
 */

import { PersonalRecord, PRCategory } from '../../features/performance/types/prTypes';

const STORAGE_KEY = 'sentient_personal_records';

// Load PRs from localStorage
export const loadPersonalRecords = (): PersonalRecord[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.warn('Failed to load personal records:', e);
    }
    return [];
};

// Save PRs to localStorage
export const savePersonalRecords = (records: PersonalRecord[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
        console.warn('Failed to save personal records:', e);
    }
};

// Add a new PR (checks if it beats previous best)
export const addPersonalRecord = (
    newPR: Omit<PersonalRecord, 'id' | 'trend' | 'previousBest'>,
    existingRecords: PersonalRecord[]
): PersonalRecord[] => {
    // Find existing PR of same name
    const existing = existingRecords.find(r => r.name === newPR.name && r.category === newPR.category);

    let trend: PersonalRecord['trend'] = 'stable';
    let previousBest: number | undefined;

    if (existing) {
        previousBest = existing.value;
        // Determine if this is an improvement
        // For time-based PRs (lower is better), improvement means lower value
        const isTimeBased = ['min:sec', 'sec', 'seconds'].includes(newPR.unit.toLowerCase());
        if (isTimeBased) {
            trend = newPR.value < existing.value ? 'improving' : newPR.value > existing.value ? 'declining' : 'stable';
        } else {
            trend = newPR.value > existing.value ? 'improving' : newPR.value < existing.value ? 'declining' : 'stable';
        }
    } else {
        trend = 'improving'; // First record is always "improving"
    }

    const pr: PersonalRecord = {
        ...newPR,
        id: `pr_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        trend,
        previousBest
    };

    // Add new PR at the beginning
    const updated = [pr, ...existingRecords.filter(r => !(r.name === newPR.name && r.category === newPR.category))];
    savePersonalRecords(updated);

    return updated;
};

// Delete a PR
export const deletePersonalRecord = (id: string, existingRecords: PersonalRecord[]): PersonalRecord[] => {
    const updated = existingRecords.filter(r => r.id !== id);
    savePersonalRecords(updated);
    return updated;
};

// Get PRs by category
export const getPRsByCategory = (category: PRCategory, records: PersonalRecord[]): PersonalRecord[] => {
    return records.filter(r => r.category === category);
};

// Get recent PRs (last 30 days)
export const getRecentPRs = (records: PersonalRecord[], days: number = 30): PersonalRecord[] => {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    return records.filter(r => new Date(r.date).getTime() > cutoff);
};

// Mock: Auto-detect PRs from wearable data
export const detectPRsFromWearables = (): PersonalRecord[] => {
    // In a real app, this would query connected wearables (Garmin, Strava, Whoop, etc.)
    // For now, return empty - would be populated by API integrations
    return [];
};
