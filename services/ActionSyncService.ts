/**
 * ActionSyncService
 * 
 * Manages global action state for sync between Commander and Timeline.
 * When an action is completed in Commander, it updates everywhere.
 */

import { Session } from '../types';

export interface ActionStatus {
    id: string;
    status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'deferred';
    completedAt?: number;
    skippedAt?: number;
    deferredTo?: string;
    source: 'commander' | 'timeline' | 'auto';
}

// Storage key
const STORAGE_KEY = 'sentient_action_sync';

// In-memory cache
let actionCache: Map<string, ActionStatus> = new Map();
let listeners: Set<() => void> = new Set();

// Load from localStorage
const loadActions = (): Map<string, ActionStatus> => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return new Map(Object.entries(parsed));
        }
    } catch (e) {
        console.warn('Failed to load action sync state:', e);
    }
    return new Map();
};

// Save to localStorage
const saveActions = (actions: Map<string, ActionStatus>): void => {
    try {
        const obj = Object.fromEntries(actions);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
        console.warn('Failed to save action sync state:', e);
    }
};

// Initialize on load
actionCache = loadActions();

export const ActionSyncService = {
    /**
     * Mark an action as completed
     */
    complete(actionId: string, source: 'commander' | 'timeline' | 'auto' = 'commander'): void {
        const existing = actionCache.get(actionId) || {
            id: actionId,
            status: 'pending',
            source
        };

        actionCache.set(actionId, {
            ...existing,
            status: 'completed',
            completedAt: Date.now(),
            source
        });

        saveActions(actionCache);
        this.notifyListeners();
    },

    /**
     * Mark an action as skipped
     */
    skip(actionId: string, source: 'commander' | 'timeline' = 'commander'): void {
        const existing = actionCache.get(actionId) || {
            id: actionId,
            status: 'pending',
            source
        };

        actionCache.set(actionId, {
            ...existing,
            status: 'skipped',
            skippedAt: Date.now(),
            source
        });

        saveActions(actionCache);
        this.notifyListeners();
    },

    /**
     * Defer an action to another time
     */
    defer(actionId: string, deferTo: string): void {
        const existing = actionCache.get(actionId) || {
            id: actionId,
            status: 'pending',
            source: 'commander'
        };

        actionCache.set(actionId, {
            ...existing,
            status: 'deferred',
            deferredTo: deferTo,
            source: 'commander'
        });

        saveActions(actionCache);
        this.notifyListeners();
    },

    /**
     * Get status of an action
     */
    getStatus(actionId: string): ActionStatus | undefined {
        return actionCache.get(actionId);
    },

    /**
     * Check if action is completed
     */
    isCompleted(actionId: string): boolean {
        const status = actionCache.get(actionId);
        return status?.status === 'completed';
    },

    /**
     * Check if action is skipped
     */
    isSkipped(actionId: string): boolean {
        const status = actionCache.get(actionId);
        return status?.status === 'skipped';
    },

    /**
     * Get all completed action IDs for today
     */
    getTodayCompleted(): string[] {
        const today = new Date().toDateString();
        const completed: string[] = [];

        actionCache.forEach((status, id) => {
            if (status.status === 'completed' && status.completedAt) {
                const completedDate = new Date(status.completedAt).toDateString();
                if (completedDate === today) {
                    completed.push(id);
                }
            }
        });

        return completed;
    },

    /**
     * Get all deferred actions
     */
    getDeferred(): ActionStatus[] {
        const deferred: ActionStatus[] = [];

        actionCache.forEach(status => {
            if (status.status === 'deferred') {
                deferred.push(status);
            }
        });

        return deferred;
    },

    /**
     * Clear today's actions (for new day reset)
     */
    clearToday(): void {
        const today = new Date().toDateString();

        actionCache.forEach((status, id) => {
            if (status.completedAt) {
                const completedDate = new Date(status.completedAt).toDateString();
                if (completedDate !== today) {
                    // Old entry, can remove
                }
            }
        });

        // For now, keep history. Could add cleanup logic later.
    },

    /**
     * Subscribe to changes
     */
    subscribe(callback: () => void): () => void {
        listeners.add(callback);
        return () => listeners.delete(callback);
    },

    /**
     * Notify all listeners of changes
     */
    notifyListeners(): void {
        listeners.forEach(cb => cb());
    }
};

export default ActionSyncService;
