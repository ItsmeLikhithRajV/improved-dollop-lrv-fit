/**
 * Goal Types and Scientific Protocols
 * Defines user goals and their impact on Recovery, Fuel, and Training
 */

// 8 Primary Goal Types
export type GoalType =
    | 'fat_loss'
    | 'muscle_gain'
    | 'weight_loss'
    | 'weight_gain'
    | 'explosive_power'
    | 'endurance'
    | 'hybrid'
    | 'longevity';

// User's goal configuration
export interface UserGoal {
    primary: GoalType;
    secondary: GoalType[];  // Up to 2
    priority: Record<GoalType, number>;  // 0-100 weight for blending
    setAt: number;  // Timestamp
    previousGoal?: GoalType;  // For transition tracking
}

// Goal metadata for UI
export interface GoalMeta {
    id: GoalType;
    name: string;
    shortName: string;
    description: string;
    icon: string;  // Lucide icon name
    color: string;  // Tailwind color class
}

export const GOAL_METADATA: Record<GoalType, GoalMeta> = {
    fat_loss: {
        id: 'fat_loss',
        name: 'Fat Loss',
        shortName: 'Cut',
        description: 'Reduce body fat while preserving muscle mass',
        icon: 'Flame',
        color: 'orange'
    },
    muscle_gain: {
        id: 'muscle_gain',
        name: 'Muscle Gain',
        shortName: 'Build',
        description: 'Maximize hypertrophy and strength gains',
        icon: 'Dumbbell',
        color: 'red'
    },
    weight_loss: {
        id: 'weight_loss',
        name: 'Weight Loss',
        shortName: 'Lose',
        description: 'Reduce total body weight through deficit',
        icon: 'TrendingDown',
        color: 'cyan'
    },
    weight_gain: {
        id: 'weight_gain',
        name: 'Weight Gain',
        shortName: 'Gain',
        description: 'Increase total mass with surplus nutrition',
        icon: 'TrendingUp',
        color: 'green'
    },
    explosive_power: {
        id: 'explosive_power',
        name: 'Explosive Power',
        shortName: 'Power',
        description: 'Speed, vertical, power output optimization',
        icon: 'Zap',
        color: 'yellow'
    },
    endurance: {
        id: 'endurance',
        name: 'Endurance',
        shortName: 'Endure',
        description: 'Aerobic capacity and stamina development',
        icon: 'Heart',
        color: 'pink'
    },
    hybrid: {
        id: 'hybrid',
        name: 'Hybrid Athlete',
        shortName: 'Hybrid',
        description: 'Balance strength and endurance together',
        icon: 'Activity',
        color: 'purple'
    },
    longevity: {
        id: 'longevity',
        name: 'Longevity',
        shortName: 'Health',
        description: 'Health span optimization and injury prevention',
        icon: 'Shield',
        color: 'emerald'
    }
};

// Scientific Protocol per Goal
export interface GoalProtocol {
    recovery: {
        iceBathPostStrength: 'avoid' | 'neutral' | 'recommend';
        iceBathPostCardio: 'avoid' | 'neutral' | 'recommend';
        iceBathMorning: 'avoid' | 'neutral' | 'recommend';
        saunaRecommend: boolean;
        sleepMinHours: number;
        sleepPriority: 'normal' | 'high' | 'critical';
        recommendedModalities: string[];
    };
    fuel: {
        proteinPerKg: [number, number];  // min-max g/kg
        carbStrategy: 'low' | 'moderate' | 'high' | 'very_high' | 'cycling';
        caloricBalance: number;  // negative = deficit, positive = surplus
        mealTiming: 'flexible' | 'structured' | 'strict';
        preworkoutCarbs: boolean;
        postworkoutWindow: 'critical' | 'important' | 'flexible';
        supplements: string[];
    };
    training: {
        primaryFocus: string[];
        secondaryFocus: string[];
        avoid: string[];
        volumeModifier: number;  // 0.5-1.5
        intensityFocus: 'low' | 'moderate' | 'high' | 'threshold';
        cardioLimit: 'minimal' | 'moderate' | 'high';
    };
}

// Science-backed protocols for each goal
export const GOAL_PROTOCOLS: Record<GoalType, GoalProtocol> = {
    fat_loss: {
        recovery: {
            iceBathPostStrength: 'neutral',
            iceBathPostCardio: 'recommend',
            iceBathMorning: 'recommend',  // Brown fat activation
            saunaRecommend: true,
            sleepMinHours: 7.5,
            sleepPriority: 'high',
            recommendedModalities: ['sauna', 'walking', 'stretching']
        },
        fuel: {
            proteinPerKg: [2.0, 2.4],  // High to preserve muscle
            carbStrategy: 'low',
            caloricBalance: -400,  // Moderate deficit
            mealTiming: 'structured',
            preworkoutCarbs: false,  // Fasted training OK
            postworkoutWindow: 'important',
            supplements: ['caffeine', 'protein', 'fiber']
        },
        training: {
            primaryFocus: ['strength', 'hiit'],
            secondaryFocus: ['liss'],
            avoid: ['excessive_volume'],
            volumeModifier: 0.9,
            intensityFocus: 'high',
            cardioLimit: 'moderate'
        }
    },
    muscle_gain: {
        recovery: {
            iceBathPostStrength: 'avoid',  // Blunts mTOR, reduces MPS
            iceBathPostCardio: 'neutral',
            iceBathMorning: 'neutral',
            saunaRecommend: true,  // GH release
            sleepMinHours: 8,
            sleepPriority: 'critical',
            recommendedModalities: ['massage', 'sauna', 'sleep_extension']
        },
        fuel: {
            proteinPerKg: [1.8, 2.2],
            carbStrategy: 'high',
            caloricBalance: 300,  // Moderate surplus
            mealTiming: 'strict',
            preworkoutCarbs: true,
            postworkoutWindow: 'critical',  // 30min window
            supplements: ['creatine', 'hmb', 'leucine']
        },
        training: {
            primaryFocus: ['hypertrophy', 'compound', 'progressive_overload'],
            secondaryFocus: ['isolation'],
            avoid: ['excessive_cardio', 'endurance'],
            volumeModifier: 1.2,
            intensityFocus: 'high',
            cardioLimit: 'minimal'
        }
    },
    weight_loss: {
        recovery: {
            iceBathPostStrength: 'neutral',
            iceBathPostCardio: 'recommend',
            iceBathMorning: 'recommend',
            saunaRecommend: true,
            sleepMinHours: 7,
            sleepPriority: 'high',
            recommendedModalities: ['walking', 'stretching']
        },
        fuel: {
            proteinPerKg: [1.6, 2.0],
            carbStrategy: 'low',
            caloricBalance: -600,  // Larger deficit
            mealTiming: 'structured',
            preworkoutCarbs: false,
            postworkoutWindow: 'flexible',
            supplements: ['protein', 'fiber', 'caffeine']
        },
        training: {
            primaryFocus: ['cardio', 'hiit', 'circuit'],
            secondaryFocus: ['strength'],
            avoid: ['overtraining'],
            volumeModifier: 1.0,
            intensityFocus: 'moderate',
            cardioLimit: 'high'
        }
    },
    weight_gain: {
        recovery: {
            iceBathPostStrength: 'avoid',
            iceBathPostCardio: 'neutral',
            iceBathMorning: 'neutral',
            saunaRecommend: true,
            sleepMinHours: 8,
            sleepPriority: 'critical',
            recommendedModalities: ['rest', 'massage', 'sleep_extension']
        },
        fuel: {
            proteinPerKg: [1.6, 2.0],
            carbStrategy: 'very_high',
            caloricBalance: 600,  // Large surplus
            mealTiming: 'strict',
            preworkoutCarbs: true,
            postworkoutWindow: 'critical',
            supplements: ['creatine', 'mass_gainer']
        },
        training: {
            primaryFocus: ['strength', 'compound'],
            secondaryFocus: ['hypertrophy'],
            avoid: ['excessive_cardio', 'endurance'],
            volumeModifier: 1.1,
            intensityFocus: 'high',
            cardioLimit: 'minimal'
        }
    },
    explosive_power: {
        recovery: {
            iceBathPostStrength: 'avoid',  // Preserve neural adaptations
            iceBathPostCardio: 'neutral',
            iceBathMorning: 'neutral',
            saunaRecommend: true,
            sleepMinHours: 8,
            sleepPriority: 'critical',  // CNS recovery
            recommendedModalities: ['contrast_therapy', 'massage', 'mobility']
        },
        fuel: {
            proteinPerKg: [1.8, 2.2],
            carbStrategy: 'moderate',
            caloricBalance: 0,  // Maintenance
            mealTiming: 'structured',
            preworkoutCarbs: true,
            postworkoutWindow: 'important',
            supplements: ['creatine', 'caffeine', 'beta_alanine']
        },
        training: {
            primaryFocus: ['plyometrics', 'olympic_lifts', 'sprints'],
            secondaryFocus: ['strength'],
            avoid: ['fatigue_before_power', 'excessive_volume'],
            volumeModifier: 0.9,
            intensityFocus: 'high',
            cardioLimit: 'minimal'
        }
    },
    endurance: {
        recovery: {
            iceBathPostStrength: 'neutral',
            iceBathPostCardio: 'recommend',  // Reduce inflammation
            iceBathMorning: 'neutral',
            saunaRecommend: true,  // Heat acclimation
            sleepMinHours: 7.5,
            sleepPriority: 'high',
            recommendedModalities: ['compression', 'cold_plunge', 'stretching']
        },
        fuel: {
            proteinPerKg: [1.4, 1.8],
            carbStrategy: 'very_high',  // Glycogen critical
            caloricBalance: 0,  // Periodized
            mealTiming: 'strict',
            preworkoutCarbs: true,
            postworkoutWindow: 'critical',  // Glycogen window
            supplements: ['beet_juice', 'sodium', 'carb_gels']
        },
        training: {
            primaryFocus: ['zone2', 'tempo', 'long_steady'],
            secondaryFocus: ['intervals', 'threshold'],
            avoid: ['heavy_legs_pre_key'],
            volumeModifier: 1.3,
            intensityFocus: 'threshold',
            cardioLimit: 'high'
        }
    },
    hybrid: {
        recovery: {
            iceBathPostStrength: 'avoid',  // Periodize
            iceBathPostCardio: 'recommend',
            iceBathMorning: 'neutral',
            saunaRecommend: true,
            sleepMinHours: 8,
            sleepPriority: 'high',
            recommendedModalities: ['contrast_therapy', 'mobility', 'massage']
        },
        fuel: {
            proteinPerKg: [1.8, 2.2],
            carbStrategy: 'cycling',  // Higher on cardio days
            caloricBalance: 100,  // Slight surplus
            mealTiming: 'structured',
            preworkoutCarbs: true,
            postworkoutWindow: 'important',
            supplements: ['creatine', 'protein', 'electrolytes']
        },
        training: {
            primaryFocus: ['strength', 'conditioning'],
            secondaryFocus: ['endurance', 'power'],
            avoid: ['conflicting_stimuli'],
            volumeModifier: 1.0,
            intensityFocus: 'moderate',
            cardioLimit: 'moderate'
        }
    },
    longevity: {
        recovery: {
            iceBathPostStrength: 'neutral',
            iceBathPostCardio: 'recommend',
            iceBathMorning: 'recommend',  // Health benefits
            saunaRecommend: true,  // Cardiovascular health
            sleepMinHours: 7.5,
            sleepPriority: 'high',
            recommendedModalities: ['mobility', 'stretching', 'walking', 'meditation']
        },
        fuel: {
            proteinPerKg: [1.4, 1.8],
            carbStrategy: 'moderate',
            caloricBalance: -100,  // Slight deficit
            mealTiming: 'flexible',
            preworkoutCarbs: false,
            postworkoutWindow: 'flexible',
            supplements: ['omega3', 'vitamin_d', 'protein']
        },
        training: {
            primaryFocus: ['mobility', 'zone2', 'functional'],
            secondaryFocus: ['strength'],
            avoid: ['extreme_intensity', 'injury_risk'],
            volumeModifier: 0.8,
            intensityFocus: 'low',
            cardioLimit: 'moderate'
        }
    }
};

// Mission to Goal mapping (for auto-suggestion)
export const MISSION_GOAL_MAP: Record<string, GoalType> = {
    'hybrid': 'hybrid',
    'marathon': 'endurance',
    'strength': 'muscle_gain',
    'longevity': 'longevity',
    'cut': 'fat_loss',
    'bulk': 'weight_gain',
    'power': 'explosive_power',
    'triathlon': 'endurance'
};

// Default user goal
export const DEFAULT_USER_GOAL: UserGoal = {
    primary: 'hybrid',
    secondary: [],
    priority: {
        fat_loss: 0,
        muscle_gain: 0,
        weight_loss: 0,
        weight_gain: 0,
        explosive_power: 0,
        endurance: 0,
        hybrid: 100,
        longevity: 0
    },
    setAt: Date.now()
};
