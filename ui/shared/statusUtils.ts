/**
 * STATUS UI UTILITIES
 * 
 * Shared utilities for rendering scientific status in UI components.
 * Use these instead of inline threshold logic.
 */

import { ScientificStatus } from '../../experts/types';

// =====================================================
// STATUS COLOR MAPPING
// =====================================================

export const STATUS_TEXT_COLORS: Record<ScientificStatus, string> = {
    optimal: 'text-green-400',
    good: 'text-teal-400',
    fair: 'text-yellow-400',
    poor: 'text-red-400',
    unknown: 'text-white/50'
};

export const STATUS_BG_COLORS: Record<ScientificStatus, string> = {
    optimal: 'bg-green-500/20 border-green-500/30',
    good: 'bg-teal-500/20 border-teal-500/30',
    fair: 'bg-yellow-500/20 border-yellow-500/30',
    poor: 'bg-red-500/20 border-red-500/30',
    unknown: 'bg-white/10 border-white/20'
};

export const STATUS_GRADIENT_COLORS: Record<ScientificStatus, string> = {
    optimal: 'from-green-500/20 to-green-500/5',
    good: 'from-teal-500/20 to-teal-500/5',
    fair: 'from-yellow-500/20 to-yellow-500/5',
    poor: 'from-red-500/20 to-red-500/5',
    unknown: 'from-white/10 to-white/5'
};

export const STATUS_LABELS: Record<ScientificStatus, string> = {
    optimal: 'Optimal',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
    unknown: 'Unknown'
};

// =====================================================
// STATUS HELPER FUNCTIONS
// =====================================================

/**
 * Get text color class for a status
 */
export function getStatusTextColor(status: ScientificStatus): string {
    return STATUS_TEXT_COLORS[status] || STATUS_TEXT_COLORS.unknown;
}

/**
 * Get background color class for a status
 */
export function getStatusBgColor(status: ScientificStatus): string {
    return STATUS_BG_COLORS[status] || STATUS_BG_COLORS.unknown;
}

/**
 * Get gradient color class for a status
 */
export function getStatusGradient(status: ScientificStatus): string {
    return STATUS_GRADIENT_COLORS[status] || STATUS_GRADIENT_COLORS.unknown;
}

/**
 * Get human-readable label for a status
 */
export function getStatusLabel(status: ScientificStatus): string {
    return STATUS_LABELS[status] || STATUS_LABELS.unknown;
}

/**
 * Convert a score (0-100) to a status using standard thresholds.
 * Use this ONLY when you don't have access to expert status.
 * Prefer using the status directly from ExpertAnalysis.
 */
export function scoreToStatus(score: number): ScientificStatus {
    if (score >= 85) return 'optimal';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    return 'poor';
}

/**
 * Maps OrbState to ScientificStatus for compatibility
 */
export function orbStateToStatus(orbState: 'optimal' | 'good' | 'warning' | 'critical' | 'resting'): ScientificStatus {
    switch (orbState) {
        case 'optimal': return 'optimal';
        case 'good': return 'good';
        case 'warning': return 'fair';
        case 'critical': return 'poor';
        case 'resting': return 'good';
        default: return 'unknown';
    }
}
