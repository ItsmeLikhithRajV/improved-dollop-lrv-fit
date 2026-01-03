/**
 * Cross-System Integration Service
 * Connects Mission Phase to Timeline, Fuel, and Recovery
 */

import { GlobalState } from '../types';
import { Session } from '../types';

// Mission Phase Effects
export interface PhaseIntegrationEffect {
    timeline: {
        prioritizedSessionTypes: string[];
        volumeModifier: number; // 0.5 = 50% volume, 1.5 = 150%
        intensityFocus: 'low' | 'moderate' | 'high' | 'threshold';
    };
    fuel: {
        protocolName: string;
        proteinMultiplier: number;
        carbStrategy: 'low' | 'moderate' | 'high' | 'cycling';
        hydrationFocus: boolean;
    };
    recovery: {
        sleepPriority: 'normal' | 'high' | 'critical';
        recommendedModalities: string[];
        coldExposure: boolean;
        heatExposure: boolean;
    };
}

// Phase to Integration Mapping
const PHASE_EFFECTS: Record<string, PhaseIntegrationEffect> = {
    'base': {
        timeline: {
            prioritizedSessionTypes: ['zone2', 'aerobic', 'endurance'],
            volumeModifier: 1.0,
            intensityFocus: 'low'
        },
        fuel: {
            protocolName: 'Balanced Fuel',
            proteinMultiplier: 1.0,
            carbStrategy: 'moderate',
            hydrationFocus: false
        },
        recovery: {
            sleepPriority: 'normal',
            recommendedModalities: ['stretching', 'foam_rolling'],
            coldExposure: false,
            heatExposure: true
        }
    },
    'strength': {
        timeline: {
            prioritizedSessionTypes: ['strength', 'power', 'compound'],
            volumeModifier: 1.2,
            intensityFocus: 'high'
        },
        fuel: {
            protocolName: 'Strength Protocol',
            proteinMultiplier: 1.5,
            carbStrategy: 'moderate',
            hydrationFocus: false
        },
        recovery: {
            sleepPriority: 'high',
            recommendedModalities: ['massage', 'contrast_therapy', 'sleep_extension'],
            coldExposure: true,
            heatExposure: true
        }
    },
    'intensification': {
        timeline: {
            prioritizedSessionTypes: ['tempo', 'threshold', 'intervals'],
            volumeModifier: 1.1,
            intensityFocus: 'threshold'
        },
        fuel: {
            protocolName: 'Performance Fuel',
            proteinMultiplier: 1.2,
            carbStrategy: 'high',
            hydrationFocus: true
        },
        recovery: {
            sleepPriority: 'high',
            recommendedModalities: ['compression', 'cold_plunge', 'sleep_tracking'],
            coldExposure: true,
            heatExposure: false
        }
    },
    'taper': {
        timeline: {
            prioritizedSessionTypes: ['activation', 'strides', 'openers'],
            volumeModifier: 0.6,
            intensityFocus: 'moderate'
        },
        fuel: {
            protocolName: 'Carb Loading',
            proteinMultiplier: 1.0,
            carbStrategy: 'high',
            hydrationFocus: true
        },
        recovery: {
            sleepPriority: 'critical',
            recommendedModalities: ['sleep_banking', 'meditation', 'visualization'],
            coldExposure: false,
            heatExposure: false
        }
    },
    'deload': {
        timeline: {
            prioritizedSessionTypes: ['recovery', 'mobility', 'light_cardio'],
            volumeModifier: 0.5,
            intensityFocus: 'low'
        },
        fuel: {
            protocolName: 'Recovery Fuel',
            proteinMultiplier: 1.2,
            carbStrategy: 'moderate',
            hydrationFocus: true
        },
        recovery: {
            sleepPriority: 'high',
            recommendedModalities: ['sleep_extension', 'massage', 'sauna'],
            coldExposure: false,
            heatExposure: true
        }
    }
};

// Get integration effects for current phase
export const getPhaseIntegration = (phaseName: string): PhaseIntegrationEffect => {
    const normalized = phaseName.toLowerCase().replace(/[^a-z]/g, '');
    return PHASE_EFFECTS[normalized] || PHASE_EFFECTS['base'];
};

// Generate Timeline suggestions based on phase
export const suggestSessionsForPhase = (phase: string, existingSessions: Session[]): {
    add: Partial<Session>[];
    modify: { id: string; changes: Partial<Session> }[];
    remove: string[];
} => {
    const effects = getPhaseIntegration(phase);

    // This would be more sophisticated in production
    // For now, return suggestions based on phase
    return {
        add: effects.timeline.prioritizedSessionTypes.slice(0, 2).map((type, i) => ({
            type: type as any,
            title: `${phase} Focus: ${type.replace('_', ' ')}`,
            duration_min: 45,
            scheduled_time: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString()
        })),
        modify: existingSessions
            .filter(s => !effects.timeline.prioritizedSessionTypes.includes(s.type))
            .slice(0, 1)
            .map(s => ({
                id: s.id,
                changes: {
                    intensity: effects.timeline.intensityFocus === 'high' ? 'hard' : 'easy' as any
                }
            })),
        remove: [] // Could suggest removing sessions that conflict with phase
    };
};

// Generate Fuel recommendations based on phase
export const getFuelRecommendations = (phase: string, currentMacros: { protein: number; carbs: number; fat: number }): {
    proteinTarget: number;
    carbTarget: number;
    tips: string[];
} => {
    const effects = getPhaseIntegration(phase);

    // Assuming base targets are current macros
    const proteinTarget = Math.round(currentMacros.protein * effects.fuel.proteinMultiplier);

    let carbTarget = currentMacros.carbs;
    switch (effects.fuel.carbStrategy) {
        case 'high': carbTarget = Math.round(currentMacros.carbs * 1.3); break;
        case 'low': carbTarget = Math.round(currentMacros.carbs * 0.7); break;
        case 'cycling': carbTarget = currentMacros.carbs; break; // Would vary by day
    }

    const tips: string[] = [];
    if (effects.fuel.proteinMultiplier > 1.2) {
        tips.push('Prioritize protein within 30min post-workout');
    }
    if (effects.fuel.carbStrategy === 'high') {
        tips.push('Focus on complex carbs: sweet potato, rice, oats');
    }
    if (effects.fuel.hydrationFocus) {
        tips.push('Increase electrolyte intake, especially sodium');
    }

    return { proteinTarget, carbTarget, tips };
};

// Generate Recovery recommendations based on phase
export const getRecoveryRecommendations = (phase: string): {
    priority: 'normal' | 'high' | 'critical';
    modalities: string[];
    sleepTip: string;
} => {
    const effects = getPhaseIntegration(phase);

    let sleepTip = 'Maintain consistent sleep schedule';
    switch (effects.recovery.sleepPriority) {
        case 'high':
            sleepTip = 'Target 8+ hours, consider 30min earlier bedtime';
            break;
        case 'critical':
            sleepTip = 'Sleep banking: Add 1 hour to baseline for the week';
            break;
    }

    return {
        priority: effects.recovery.sleepPriority,
        modalities: effects.recovery.recommendedModalities,
        sleepTip
    };
};

// Competition Countdown Integration
export const getCompetitionCountdownEffects = (daysOut: number): {
    phase: string;
    urgentActions: string[];
    fuelProtocol: string;
} => {
    if (daysOut <= 1) {
        return {
            phase: 'race_day',
            urgentActions: ['Visualization', 'Warmup Protocol', 'Final Gear Check'],
            fuelProtocol: 'Race Day Nutrition'
        };
    } else if (daysOut <= 3) {
        return {
            phase: 'final_prep',
            urgentActions: ['Carb loading peak', 'Sleep optimization', 'Mental rehearsal'],
            fuelProtocol: 'Carb Loading Phase 2'
        };
    } else if (daysOut <= 7) {
        return {
            phase: 'taper_final',
            urgentActions: ['Reduce volume 50%', 'Maintain intensity', 'Travel logistics'],
            fuelProtocol: 'Carb Loading Phase 1'
        };
    } else if (daysOut <= 14) {
        return {
            phase: 'taper_start',
            urgentActions: ['Begin taper protocol', 'Sleep banking', 'Equipment testing'],
            fuelProtocol: 'Pre-Taper Nutrition'
        };
    } else {
        return {
            phase: 'normal_training',
            urgentActions: [],
            fuelProtocol: 'Standard Protocol'
        };
    }
};
