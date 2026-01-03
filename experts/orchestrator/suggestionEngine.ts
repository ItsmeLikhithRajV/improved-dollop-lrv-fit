/**
 * Suggestion Engine
 * Analyzes state and generates Mission Suggestions with learning
 */

import { GlobalState } from '../../types';
import { MissionSuggestion, AgentLearningState } from '../../features/performance/types/prTypes';

const STORAGE_KEY = 'sentient_suggestion_learning';

// Load learning state from localStorage
export const loadLearningState = (): AgentLearningState => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.warn('Failed to load suggestion learning state:', e);
    }
    return {
        suggestionHistory: [],
        preferenceScores: {
            phase_transition: { implementRate: 0.5, ignoreRate: 0.5, totalShown: 0 },
            plateau_break: { implementRate: 0.5, ignoreRate: 0.5, totalShown: 0 },
            deload: { implementRate: 0.5, ignoreRate: 0.5, totalShown: 0 },
            taper: { implementRate: 0.5, ignoreRate: 0.5, totalShown: 0 },
            load_increase: { implementRate: 0.5, ignoreRate: 0.5, totalShown: 0 },
        }
    };
};

// Save learning state to localStorage
export const saveLearningState = (state: AgentLearningState): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.warn('Failed to save suggestion learning state:', e);
    }
};

// Record user's choice and update learning
export const recordSuggestionChoice = (
    suggestionId: string,
    choice: 'implement' | 'ignore' | 'remind',
    learningState: AgentLearningState
): AgentLearningState => {
    const suggestion = learningState.suggestionHistory.find(s => s.id === suggestionId);
    if (!suggestion) return learningState;

    // Update the suggestion with user response
    const updatedHistory = learningState.suggestionHistory.map(s =>
        s.id === suggestionId
            ? { ...s, status: choice === 'implement' ? 'implemented' : choice === 'ignore' ? 'ignored' : 'reminded', userResponse: { action: choice, timestamp: Date.now() } }
            : s
    ) as MissionSuggestion[];

    // Update preference scores
    const type = suggestion.type;
    const currentScores = learningState.preferenceScores[type];
    const newTotal = currentScores.totalShown + 1;

    // Calculate new rates (decaying average)
    const decay = 0.9;
    let newImplementRate = currentScores.implementRate * decay;
    let newIgnoreRate = currentScores.ignoreRate * decay;

    if (choice === 'implement') {
        newImplementRate += (1 - decay);
    } else if (choice === 'ignore') {
        newIgnoreRate += (1 - decay);
    }
    // 'remind' doesn't affect rates

    const newState: AgentLearningState = {
        suggestionHistory: updatedHistory,
        preferenceScores: {
            ...learningState.preferenceScores,
            [type]: {
                implementRate: newImplementRate,
                ignoreRate: newIgnoreRate,
                totalShown: newTotal
            }
        }
    };

    saveLearningState(newState);
    return newState;
};

// Check if we should auto-apply (high implement rate)
export const shouldAutoApply = (type: MissionSuggestion['type'], learningState: AgentLearningState): boolean => {
    const scores = learningState.preferenceScores[type];
    // Auto-apply if implement rate > 80% AND totalShown > 5
    return scores.implementRate > 0.8 && scores.totalShown > 5;
};

// Check if we should suppress (high ignore rate)
export const shouldSuppress = (type: MissionSuggestion['type'], learningState: AgentLearningState): boolean => {
    const scores = learningState.preferenceScores[type];
    // Suppress if ignore rate > 70% AND totalShown > 5
    return scores.ignoreRate > 0.7 && scores.totalShown > 5;
};

// Generate suggestions based on current state
export const generateSuggestions = (state: GlobalState, learningState: AgentLearningState): MissionSuggestion[] => {
    const suggestions: MissionSuggestion[] = [];

    // 1. Phase Transition Check
    // (Would analyze mission progress and suggest transition)
    const missionProgress = 0.85; // Mock: 85% through current phase
    if (missionProgress > 0.8 && !shouldSuppress('phase_transition', learningState)) {
        suggestions.push({
            id: `suggestion_phase_${Date.now()}`,
            type: 'phase_transition',
            title: 'Ready for Phase 2',
            reasoning: 'You have completed 85% of your current phase with consistent adherence. Your adaptation metrics indicate readiness for increased stimulus.',
            impact: 'This will shift focus from base-building to intensity work, increasing tempo sessions by 30%.',
            suggestedAt: Date.now(),
            status: 'pending'
        });
    }

    // 2. Plateau Detection
    const readinessTrend = analyzeReadinessTrend(state);
    if (readinessTrend === 'stagnant' && !shouldSuppress('plateau_break', learningState)) {
        suggestions.push({
            id: `suggestion_plateau_${Date.now()}`,
            type: 'plateau_break',
            title: 'Break the Plateau',
            reasoning: 'Your readiness score has been flat for 14 days despite consistent training. This suggests adaptation has stalled.',
            impact: 'Introducing a shock microcycle to stimulate new adaptation. Expect increased intensity for 3-5 days.',
            suggestedAt: Date.now(),
            status: 'pending'
        });
    }

    // 3. Deload Detection
    const fatigueAccumulation = analyzeFatigue(state);
    if (fatigueAccumulation > 0.7 && !shouldSuppress('deload', learningState)) {
        suggestions.push({
            id: `suggestion_deload_${Date.now()}`,
            type: 'deload',
            title: 'Deload Recommended',
            reasoning: 'Fatigue accumulation is high (70%+). Your HRV has dropped 15% this week and recovery scores are trending down.',
            impact: 'Reducing training volume by 40% for 3-5 days to allow supercompensation.',
            suggestedAt: Date.now(),
            status: 'pending'
        });
    }

    // 4. Taper Check (Competition Countdown)
    if (state.performance.target_event && state.performance.competition_countdown) {
        const daysOut = state.performance.competition_countdown;
        if (daysOut <= 14 && daysOut > 7 && !shouldSuppress('taper', learningState)) {
            suggestions.push({
                id: `suggestion_taper_${Date.now()}`,
                type: 'taper',
                title: 'Begin Taper Protocol',
                reasoning: `You are ${daysOut} days from ${state.performance.target_event.name}. Optimal taper window is 10-14 days out.`,
                impact: 'Reducing volume while maintaining intensity. Sleep and nutrition protocols will be prioritized.',
                suggestedAt: Date.now(),
                status: 'pending'
            });
        }
    }

    // 5. Load Increase (High HRV Streak)
    const hrvTrend = analyzeHRVTrend(state);
    if (hrvTrend === 'improving' && !shouldSuppress('load_increase', learningState)) {
        suggestions.push({
            id: `suggestion_load_${Date.now()}`,
            type: 'load_increase',
            title: 'Increase Training Load',
            reasoning: 'Your HRV has improved 20% over the past week with strong recovery scores. You have capacity for additional stimulus.',
            impact: 'Increasing training volume by 15-20% this week to capitalize on adaptation window.',
            suggestedAt: Date.now(),
            status: 'pending'
        });
    }

    return suggestions;
};

// Helper: Analyze readiness trend
function analyzeReadinessTrend(state: GlobalState): 'improving' | 'stagnant' | 'declining' {
    // Mock analysis - would use real historical data
    const readiness = state.mindspace.readiness_score;
    if (readiness > 75) return 'improving';
    if (readiness > 50) return 'stagnant';
    return 'declining';
}

// Helper: Analyze fatigue accumulation
function analyzeFatigue(state: GlobalState): number {
    // Mock: Calculate fatigue from sleep debt, recovery, stress
    const sleepFatigue = state.sleep.sleep_debt / 10; // 0-1
    const recoveryFatigue = 1 - (state.recovery.recovery_score / 100); // 0-1
    const stressFatigue = state.mindspace.stress / 10; // 0-1
    return Math.min(1, (sleepFatigue + recoveryFatigue + stressFatigue) / 3);
}

// Helper: Analyze HRV trend
function analyzeHRVTrend(state: GlobalState): 'improving' | 'stable' | 'declining' {
    // Mock analysis - would compare current HRV to baseline
    const hrv = state.sleep.hrv || 50;
    if (hrv > 60) return 'improving';
    if (hrv > 40) return 'stable';
    return 'declining';
}

// Get the most relevant suggestion (highest priority, not suppressed)
export const getTopSuggestion = (state: GlobalState, learningState: AgentLearningState): MissionSuggestion | null => {
    const suggestions = generateSuggestions(state, learningState);
    if (suggestions.length === 0) return null;

    // Priority order: taper > deload > plateau_break > phase_transition > load_increase
    const priority: MissionSuggestion['type'][] = ['taper', 'deload', 'plateau_break', 'phase_transition', 'load_increase'];

    for (const type of priority) {
        const match = suggestions.find(s => s.type === type);
        if (match) {
            // Check if should auto-apply
            if (shouldAutoApply(type, learningState)) {
                console.log(`Auto-applying suggestion type: ${type} (high implement rate)`);
                match.status = 'implemented';
                return null; // Auto-applied, no modal needed
            }
            return match;
        }
    }

    return suggestions[0];
};
