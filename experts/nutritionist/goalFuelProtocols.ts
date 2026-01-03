/**
 * Comprehensive Goal-Aware Fuel (Nutrition) Protocols
 * Deep research integration for all nutritional strategies
 */

import { GoalType } from '../../types/goals';

// Macro and Fuel Types
export interface MacroTargets {
    protein_g_per_kg: [number, number];  // min-max
    carbs_g_per_kg: [number, number];
    fat_g_per_kg: [number, number];
    fiber_g_per_day: [number, number];
    water_l_per_day: [number, number];
}

export interface CaloricStrategy {
    balance_kcal: number;  // negative = deficit, positive = surplus
    weekly_variation: 'none' | 'cycling' | 'refeed';
    refeed_frequency_days?: number;
    deficit_max_kcal?: number;
    surplus_max_kcal?: number;
}

export interface NutrientTiming {
    preworkout: {
        timing_min: [number, number];  // minutes before
        carbs_required: boolean;
        protein_required: boolean;
        fat_limit: boolean;  // Should fat be limited pre-workout?
        caffeine_ok: boolean;
        fasted_ok: boolean;
    };
    postworkout: {
        window_priority: 'critical' | 'important' | 'flexible';
        protein_g: [number, number];
        carbs_required: boolean;
        carb_g_per_kg: [number, number];
        timing_min: number;  // Within how many minutes
    };
    pre_sleep: {
        protein_recommended: boolean;
        carb_timing: 'avoid' | 'moderate' | 'ok';
        casein_recommended: boolean;
    };
    fasting: {
        intermittent_ok: boolean;
        max_fasting_hours: number;
        notes: string[];
    };
}

export interface SupplementProtocol {
    tier1_essential: string[];  // Always recommend
    tier2_beneficial: string[];  // Goal-specific
    tier3_optional: string[];   // Nice to have
    avoid: string[];            // Not recommended for this goal
    timing_notes: Record<string, string>;
}

export interface MealStrategy {
    meal_frequency: [number, number];  // meals per day
    meal_distribution: 'even' | 'front_loaded' | 'back_loaded' | 'around_training';
    largest_meal: 'breakfast' | 'lunch' | 'dinner' | 'post_workout' | 'flexible';
    snacking: 'encouraged' | 'allowed' | 'minimize';
}

export interface HydrationProtocol {
    base_ml_per_kg: number;
    training_addition_ml_per_hour: number;
    electrolyte_focus: boolean;
    sodium_mg_per_liter_training: number;
    timing_notes: string[];
}

export interface FoodFocus {
    prioritize: string[];
    moderate: string[];
    limit: string[];
    notes: string[];
}

// Complete Fuel Protocol
export interface GoalFuelProtocol {
    macros: MacroTargets;
    calories: CaloricStrategy;
    timing: NutrientTiming;
    supplements: SupplementProtocol;
    meals: MealStrategy;
    hydration: HydrationProtocol;
    foods: FoodFocus;
    scienceSummary: string;
}

// Comprehensive Fuel Protocols by Goal
export const FUEL_PROTOCOLS: Record<GoalType, GoalFuelProtocol> = {
    muscle_gain: {
        macros: {
            protein_g_per_kg: [1.8, 2.2],
            carbs_g_per_kg: [4, 7],
            fat_g_per_kg: [0.8, 1.2],
            fiber_g_per_day: [25, 40],
            water_l_per_day: [3, 4.5]
        },
        calories: {
            balance_kcal: 300,
            weekly_variation: 'none',
            surplus_max_kcal: 500
        },
        timing: {
            preworkout: {
                timing_min: [60, 120],
                carbs_required: true,
                protein_required: true,
                fat_limit: true,
                caffeine_ok: true,
                fasted_ok: false
            },
            postworkout: {
                window_priority: 'critical',
                protein_g: [30, 50],
                carbs_required: true,
                carb_g_per_kg: [0.8, 1.2],
                timing_min: 30
            },
            pre_sleep: {
                protein_recommended: true,
                carb_timing: 'ok',
                casein_recommended: true
            },
            fasting: {
                intermittent_ok: false,
                max_fasting_hours: 12,
                notes: ['Fasting may impair muscle protein synthesis', 'Frequent feeding preferred']
            }
        },
        supplements: {
            tier1_essential: ['creatine_monohydrate', 'protein_powder', 'vitamin_d'],
            tier2_beneficial: ['hmb', 'leucine', 'citrulline', 'omega3'],
            tier3_optional: ['beta_alanine', 'ashwagandha', 'zma'],
            avoid: ['excessive_caffeine', 'fat_burners'],
            timing_notes: {
                creatine_monohydrate: '5g daily, timing flexible',
                protein_powder: 'Post-workout and between meals',
                hmb: '3g daily, especially during intensification',
                leucine: '2-3g per meal to trigger MPS threshold'
            }
        },
        meals: {
            meal_frequency: [4, 6],
            meal_distribution: 'around_training',
            largest_meal: 'post_workout',
            snacking: 'encouraged'
        },
        hydration: {
            base_ml_per_kg: 35,
            training_addition_ml_per_hour: 500,
            electrolyte_focus: true,
            sodium_mg_per_liter_training: 500,
            timing_notes: ['Hydration supports protein synthesis', 'Dehydration impairs performance']
        },
        foods: {
            prioritize: ['lean_meats', 'eggs', 'fish', 'dairy', 'rice', 'potatoes', 'oats', 'fruits'],
            moderate: ['nuts', 'oils', 'whole_grains', 'legumes'],
            limit: ['alcohol', 'processed_foods', 'excessive_fiber_pre_training'],
            notes: [
                'Protein distribution: 0.4g/kg per meal minimum',
                'Leucine threshold: 2.5-3g per meal for MPS',
                'Post-workout: fast-digesting carbs + protein',
                'Pre-sleep: slow-digesting protein (casein)'
            ]
        },
        scienceSummary: 'Muscle protein synthesis is maximized with adequate protein distribution (0.4g/kg per meal, 4-5 meals), caloric surplus (300-500kcal), and leucine threshold reached each meal. Post-workout anabolic window is real but extends 24-48 hours. Creatine is the most evidence-based ergogenic aid for hypertrophy.'
    },

    fat_loss: {
        macros: {
            protein_g_per_kg: [2.0, 2.4],
            carbs_g_per_kg: [2, 4],
            fat_g_per_kg: [0.6, 1.0],
            fiber_g_per_day: [30, 50],
            water_l_per_day: [3, 4]
        },
        calories: {
            balance_kcal: -400,
            weekly_variation: 'refeed',
            refeed_frequency_days: 7,
            deficit_max_kcal: 600
        },
        timing: {
            preworkout: {
                timing_min: [60, 180],
                carbs_required: false,
                protein_required: true,
                fat_limit: true,
                caffeine_ok: true,
                fasted_ok: true
            },
            postworkout: {
                window_priority: 'important',
                protein_g: [30, 50],
                carbs_required: false,
                carb_g_per_kg: [0.3, 0.8],
                timing_min: 60
            },
            pre_sleep: {
                protein_recommended: true,
                carb_timing: 'avoid',
                casein_recommended: true
            },
            fasting: {
                intermittent_ok: true,
                max_fasting_hours: 16,
                notes: ['16:8 IF can aid adherence', 'Preserve protein intake during eating window']
            }
        },
        supplements: {
            tier1_essential: ['protein_powder', 'caffeine', 'fiber_supplement'],
            tier2_beneficial: ['omega3', 'vitamin_d', 'green_tea_extract'],
            tier3_optional: ['l_carnitine', 'chromium'],
            avoid: ['mass_gainers', 'high_calorie_supplements'],
            timing_notes: {
                caffeine: '100-400mg pre-workout, avoid after 2pm',
                protein_powder: 'To hit protein targets without excess calories',
                fiber_supplement: 'Before meals for satiety'
            }
        },
        meals: {
            meal_frequency: [3, 4],
            meal_distribution: 'front_loaded',
            largest_meal: 'breakfast',
            snacking: 'minimize'
        },
        hydration: {
            base_ml_per_kg: 40,
            training_addition_ml_per_hour: 500,
            electrolyte_focus: true,
            sodium_mg_per_liter_training: 500,
            timing_notes: ['Water before meals aids satiety', 'Hydration can be mistaken for hunger']
        },
        foods: {
            prioritize: ['lean_protein', 'vegetables', 'berries', 'fish', 'egg_whites', 'greek_yogurt'],
            moderate: ['whole_grains', 'fruits', 'nuts', 'oils'],
            limit: ['refined_carbs', 'alcohol', 'liquid_calories', 'processed_foods'],
            notes: [
                'High protein preserves muscle mass in deficit',
                'High fiber increases satiety',
                'Volume eating: low calorie density foods',
                'Weekly refeed: high carb, moderate protein, low fat'
            ]
        },
        scienceSummary: 'Fat loss requires caloric deficit (300-600kcal). High protein (2.0-2.4g/kg) preserves lean mass. High fiber and water increase satiety. Intermittent fasting is a tool for adherence, not metabolic magic. Caffeine increases metabolic rate 3-11% and fat oxidation.'
    },

    weight_loss: {
        macros: {
            protein_g_per_kg: [1.6, 2.0],
            carbs_g_per_kg: [2, 4],
            fat_g_per_kg: [0.6, 1.0],
            fiber_g_per_day: [30, 45],
            water_l_per_day: [3, 4]
        },
        calories: {
            balance_kcal: -600,
            weekly_variation: 'refeed',
            refeed_frequency_days: 10,
            deficit_max_kcal: 750
        },
        timing: {
            preworkout: {
                timing_min: [60, 180],
                carbs_required: false,
                protein_required: false,
                fat_limit: false,
                caffeine_ok: true,
                fasted_ok: true
            },
            postworkout: {
                window_priority: 'flexible',
                protein_g: [25, 40],
                carbs_required: false,
                carb_g_per_kg: [0.3, 0.6],
                timing_min: 120
            },
            pre_sleep: {
                protein_recommended: true,
                carb_timing: 'avoid',
                casein_recommended: false
            },
            fasting: {
                intermittent_ok: true,
                max_fasting_hours: 18,
                notes: ['Extended fasting may be used', 'Monitor energy and recovery']
            }
        },
        supplements: {
            tier1_essential: ['protein_powder', 'fiber_supplement', 'multivitamin'],
            tier2_beneficial: ['caffeine', 'omega3'],
            tier3_optional: ['green_tea_extract'],
            avoid: ['mass_gainers'],
            timing_notes: {
                protein_powder: 'Helps meet protein targets',
                fiber_supplement: 'Increases fullness'
            }
        },
        meals: {
            meal_frequency: [2, 4],
            meal_distribution: 'front_loaded',
            largest_meal: 'breakfast',
            snacking: 'minimize'
        },
        hydration: {
            base_ml_per_kg: 40,
            training_addition_ml_per_hour: 500,
            electrolyte_focus: true,
            sodium_mg_per_liter_training: 400,
            timing_notes: ['Water before meals reduces intake']
        },
        foods: {
            prioritize: ['vegetables', 'lean_protein', 'low_calorie_dense_foods'],
            moderate: ['fruits', 'whole_grains', 'legumes'],
            limit: ['refined_carbs', 'sugar', 'alcohol', 'oils'],
            notes: [
                'Focus on food volume over calorie density',
                'Protein at every meal',
                'Half plate vegetables'
            ]
        },
        scienceSummary: 'Weight loss focuses on larger caloric deficit (500-750kcal) with moderate protein (1.6-2.0g/kg). Volume eating (low calorie density) is key. IF can simplify meal planning. Focus is total weight reduction rather than body composition optimization.'
    },

    weight_gain: {
        macros: {
            protein_g_per_kg: [1.6, 2.0],
            carbs_g_per_kg: [5, 8],
            fat_g_per_kg: [1.0, 1.5],
            fiber_g_per_day: [25, 35],
            water_l_per_day: [3, 4]
        },
        calories: {
            balance_kcal: 600,
            weekly_variation: 'none',
            surplus_max_kcal: 1000
        },
        timing: {
            preworkout: {
                timing_min: [60, 120],
                carbs_required: true,
                protein_required: true,
                fat_limit: false,
                caffeine_ok: true,
                fasted_ok: false
            },
            postworkout: {
                window_priority: 'critical',
                protein_g: [30, 50],
                carbs_required: true,
                carb_g_per_kg: [1.0, 1.5],
                timing_min: 30
            },
            pre_sleep: {
                protein_recommended: true,
                carb_timing: 'ok',
                casein_recommended: true
            },
            fasting: {
                intermittent_ok: false,
                max_fasting_hours: 10,
                notes: ['Never skip meals', 'Eating frequently is essential']
            }
        },
        supplements: {
            tier1_essential: ['mass_gainer', 'creatine_monohydrate', 'protein_powder'],
            tier2_beneficial: ['omega3', 'vitamin_d', 'digestive_enzymes'],
            tier3_optional: ['hmb', 'weight_gainer_bars'],
            avoid: ['appetite_suppressants', 'excessive_caffeine'],
            timing_notes: {
                mass_gainer: 'Between meals and post-workout',
                creatine_monohydrate: '5g daily',
                digestive_enzymes: 'With large meals'
            }
        },
        meals: {
            meal_frequency: [5, 7],
            meal_distribution: 'even',
            largest_meal: 'post_workout',
            snacking: 'encouraged'
        },
        hydration: {
            base_ml_per_kg: 35,
            training_addition_ml_per_hour: 500,
            electrolyte_focus: true,
            sodium_mg_per_liter_training: 500,
            timing_notes: ['Avoid drinking excess water before meals (reduces appetite)']
        },
        foods: {
            prioritize: ['calorie_dense_foods', 'nuts', 'nut_butters', 'oils', 'whole_milk', 'cheese', 'rice', 'pasta', 'avocado'],
            moderate: ['lean_meats', 'vegetables'],
            limit: ['excessive_fiber', 'low_calorie_fillers'],
            notes: [
                'Calorie density is key',
                'Blend foods for easier consumption',
                'Night eating: pre-bed shake',
                'Never train fasted'
            ]
        },
        scienceSummary: 'Weight gain requires consistent caloric surplus (500-1000kcal). Focus on calorie-dense foods, frequent meals (5-7/day), and never skipping eating opportunities. Blended meals (shakes) bypass satiety signals. Creatine adds 2-4lbs of water weight and supports strength.'
    },

    explosive_power: {
        macros: {
            protein_g_per_kg: [1.8, 2.2],
            carbs_g_per_kg: [4, 6],
            fat_g_per_kg: [0.8, 1.2],
            fiber_g_per_day: [25, 35],
            water_l_per_day: [3, 4]
        },
        calories: {
            balance_kcal: 100,
            weekly_variation: 'none'
        },
        timing: {
            preworkout: {
                timing_min: [90, 180],
                carbs_required: true,
                protein_required: true,
                fat_limit: true,
                caffeine_ok: true,
                fasted_ok: false
            },
            postworkout: {
                window_priority: 'important',
                protein_g: [30, 45],
                carbs_required: true,
                carb_g_per_kg: [0.8, 1.0],
                timing_min: 45
            },
            pre_sleep: {
                protein_recommended: true,
                carb_timing: 'moderate',
                casein_recommended: true
            },
            fasting: {
                intermittent_ok: false,
                max_fasting_hours: 12,
                notes: ['CNS requires consistent fuel', 'Never train depleted for power work']
            }
        },
        supplements: {
            tier1_essential: ['creatine_monohydrate', 'caffeine', 'protein_powder'],
            tier2_beneficial: ['beta_alanine', 'citrulline', 'tart_cherry'],
            tier3_optional: ['sodium_bicarbonate'],
            avoid: [],
            timing_notes: {
                creatine_monohydrate: '5g daily - essential for power output',
                caffeine: '3-6mg/kg 30-60min pre-training',
                beta_alanine: '3-5g daily for buffering'
            }
        },
        meals: {
            meal_frequency: [4, 5],
            meal_distribution: 'around_training',
            largest_meal: 'post_workout',
            snacking: 'allowed'
        },
        hydration: {
            base_ml_per_kg: 35,
            training_addition_ml_per_hour: 600,
            electrolyte_focus: true,
            sodium_mg_per_liter_training: 600,
            timing_notes: ['Hydration critical for CNS function', 'Dehydration impairs power output']
        },
        foods: {
            prioritize: ['quality_carbs', 'lean_protein', 'fruits', 'rice', 'potatoes'],
            moderate: ['nuts', 'oils', 'dairy'],
            limit: ['heavy_fatty_meals_pre_training', 'alcohol'],
            notes: [
                'Glycogen stores must be topped for power work',
                'CNS requires stable glucose',
                'Caffeine is ergogenic for power'
            ]
        },
        scienceSummary: 'Power output is glycogen-dependent. Creatine phosphate system fuels explosive movements. Caffeine enhances CNS output. Never train power work in glycogen-depleted state. Creatine supplementation increases phosphocreatine stores by 20%.'
    },

    endurance: {
        macros: {
            protein_g_per_kg: [1.4, 1.8],
            carbs_g_per_kg: [6, 10],
            fat_g_per_kg: [0.8, 1.2],
            fiber_g_per_day: [25, 40],
            water_l_per_day: [3, 5]
        },
        calories: {
            balance_kcal: 0,
            weekly_variation: 'cycling'
        },
        timing: {
            preworkout: {
                timing_min: [120, 240],
                carbs_required: true,
                protein_required: false,
                fat_limit: true,
                caffeine_ok: true,
                fasted_ok: false
            },
            postworkout: {
                window_priority: 'critical',
                protein_g: [20, 40],
                carbs_required: true,
                carb_g_per_kg: [1.0, 1.5],
                timing_min: 30
            },
            pre_sleep: {
                protein_recommended: true,
                carb_timing: 'ok',
                casein_recommended: true
            },
            fasting: {
                intermittent_ok: false,
                max_fasting_hours: 10,
                notes: ['Glycogen depletion impairs performance', 'Fuel around training']
            }
        },
        supplements: {
            tier1_essential: ['electrolytes', 'carb_gels', 'protein_powder'],
            tier2_beneficial: ['beet_juice', 'caffeine', 'tart_cherry', 'omega3'],
            tier3_optional: ['iron', 'b_vitamins'],
            avoid: ['excessive_fat_burners'],
            timing_notes: {
                electrolytes: 'During training: 500-1000mg sodium/hour',
                beet_juice: '300-500mg nitrate 2-3 hours pre-performance',
                carb_gels: '30-60g carbs/hour during long sessions'
            }
        },
        meals: {
            meal_frequency: [4, 6],
            meal_distribution: 'around_training',
            largest_meal: 'post_workout',
            snacking: 'encouraged'
        },
        hydration: {
            base_ml_per_kg: 40,
            training_addition_ml_per_hour: 800,
            electrolyte_focus: true,
            sodium_mg_per_liter_training: 800,
            timing_notes: [
                'Sweat rate testing recommended',
                '150% of sweat losses post-training',
                'Sodium is critical for long efforts'
            ]
        },
        foods: {
            prioritize: ['complex_carbs', 'rice', 'pasta', 'potatoes', 'oats', 'fruits', 'vegetables'],
            moderate: ['lean_protein', 'fish', 'eggs', 'nuts'],
            limit: ['high_fat_pre_training', 'fiber_race_day', 'alcohol'],
            notes: [
                'Carbohydrate periodization: high on training days, moderate on rest',
                'Train low (occasionally) to enhance fat oxidation',
                'Race high: full glycogen stores',
                'Gut training: practice race nutrition'
            ]
        },
        scienceSummary: 'Endurance performance is carbohydrate-limited. Glycogen stores support 60-90 minutes of hard effort. Exogenous carbs (30-90g/hour) extend performance. Nitrate supplementation (beet juice) improves efficiency 1-3%. Caffeine enhances endurance performance 3-5%.'
    },

    hybrid: {
        macros: {
            protein_g_per_kg: [1.8, 2.2],
            carbs_g_per_kg: [4, 7],
            fat_g_per_kg: [0.8, 1.2],
            fiber_g_per_day: [25, 40],
            water_l_per_day: [3, 4.5]
        },
        calories: {
            balance_kcal: 100,
            weekly_variation: 'cycling'
        },
        timing: {
            preworkout: {
                timing_min: [60, 150],
                carbs_required: true,
                protein_required: true,
                fat_limit: true,
                caffeine_ok: true,
                fasted_ok: false
            },
            postworkout: {
                window_priority: 'important',
                protein_g: [30, 45],
                carbs_required: true,
                carb_g_per_kg: [0.8, 1.2],
                timing_min: 45
            },
            pre_sleep: {
                protein_recommended: true,
                carb_timing: 'moderate',
                casein_recommended: true
            },
            fasting: {
                intermittent_ok: false,
                max_fasting_hours: 12,
                notes: ['Concurrent training requires consistent fuel']
            }
        },
        supplements: {
            tier1_essential: ['creatine_monohydrate', 'protein_powder', 'electrolytes'],
            tier2_beneficial: ['caffeine', 'omega3', 'vitamin_d'],
            tier3_optional: ['beta_alanine', 'citrulline'],
            avoid: [],
            timing_notes: {
                creatine_monohydrate: '5g daily - supports both strength and endurance',
                protein_powder: 'Post-workout and between meals',
                electrolytes: 'During longer sessions (60min+)'
            }
        },
        meals: {
            meal_frequency: [4, 5],
            meal_distribution: 'around_training',
            largest_meal: 'post_workout',
            snacking: 'allowed'
        },
        hydration: {
            base_ml_per_kg: 38,
            training_addition_ml_per_hour: 600,
            electrolyte_focus: true,
            sodium_mg_per_liter_training: 600,
            timing_notes: ['Hydration supports both strength and endurance performance']
        },
        foods: {
            prioritize: ['lean_protein', 'complex_carbs', 'fruits', 'vegetables', 'fish'],
            moderate: ['dairy', 'nuts', 'eggs', 'oils'],
            limit: ['processed_foods', 'alcohol', 'excess_sugar'],
            notes: [
                'Carb cycling: higher on cardio days, moderate on strength days',
                'Protein distribution: 4+ meals',
                'Post-strength: prioritize protein',
                'Post-cardio: prioritize glycogen replenishment'
            ]
        },
        scienceSummary: 'Concurrent training requires careful nutrition periodization. Carb cycling (high on cardio days) supports both adaptations. Creatine supports both strength and endurance. Protein needs are elevated due to dual demands. Recovery is the bottleneck - fuel accordingly.'
    },

    longevity: {
        macros: {
            protein_g_per_kg: [1.4, 1.8],
            carbs_g_per_kg: [3, 5],
            fat_g_per_kg: [0.8, 1.2],
            fiber_g_per_day: [35, 50],
            water_l_per_day: [2.5, 3.5]
        },
        calories: {
            balance_kcal: -100,
            weekly_variation: 'none'
        },
        timing: {
            preworkout: {
                timing_min: [60, 180],
                carbs_required: false,
                protein_required: false,
                fat_limit: false,
                caffeine_ok: true,
                fasted_ok: true
            },
            postworkout: {
                window_priority: 'flexible',
                protein_g: [25, 40],
                carbs_required: false,
                carb_g_per_kg: [0.5, 1.0],
                timing_min: 120
            },
            pre_sleep: {
                protein_recommended: true,
                carb_timing: 'avoid',
                casein_recommended: false
            },
            fasting: {
                intermittent_ok: true,
                max_fasting_hours: 16,
                notes: [
                    'Time-restricted eating (12-16 hour overnight fast) linked to longevity',
                    'Autophagy activation during fasting',
                    'Maintain adequate protein during eating windows'
                ]
            }
        },
        supplements: {
            tier1_essential: ['omega3', 'vitamin_d', 'magnesium'],
            tier2_beneficial: ['resveratrol', 'nmn_or_nr', 'curcumin', 'quercetin'],
            tier3_optional: ['coq10', 'alpha_lipoic_acid', 'green_tea_extract'],
            avoid: ['excessive_iron', 'high_dose_antioxidants'],
            timing_notes: {
                omega3: '2-3g EPA/DHA daily for cardiovascular and brain health',
                vitamin_d: '2000-5000 IU daily, test levels',
                nmn_or_nr: 'NAD+ precursors - emerging longevity research',
                resveratrol: '500-1000mg with fat for absorption'
            }
        },
        meals: {
            meal_frequency: [2, 4],
            meal_distribution: 'front_loaded',
            largest_meal: 'lunch',
            snacking: 'minimize'
        },
        hydration: {
            base_ml_per_kg: 35,
            training_addition_ml_per_hour: 500,
            electrolyte_focus: false,
            sodium_mg_per_liter_training: 400,
            timing_notes: ['Consistent hydration throughout day']
        },
        foods: {
            prioritize: [
                'leafy_greens', 'cruciferous_vegetables', 'berries',
                'fatty_fish', 'olive_oil', 'nuts', 'legumes',
                'whole_grains', 'fermented_foods', 'herbs_spices'
            ],
            moderate: ['lean_meat', 'eggs', 'dairy', 'fruits'],
            limit: ['red_meat', 'processed_meat', 'sugar', 'refined_grains', 'alcohol'],
            notes: [
                'Mediterranean diet pattern associated with longest life',
                'Polyphenol-rich foods support healthspan',
                'Fiber feeds healthy gut microbiome',
                'Omega-3 to Omega-6 ratio matters',
                'Minimize AGEs (advanced glycation end products)',
                'Cook low and slow, avoid charring'
            ]
        },
        scienceSummary: 'Longevity nutrition emphasizes caloric moderation (slight deficit or maintenance), high polyphenol intake, fiber for microbiome health, omega-3 fatty acids, and time-restricted eating. Mediterranean diet has strongest evidence. Protein remains important to prevent sarcopenia. Autophagy-promoting practices (fasting, exercise) may slow biological aging.'
    }
};

// Helper Functions

// Get macro targets for a specific goal and body weight
export const getMacroTargets = (goal: GoalType, bodyWeightKg: number): {
    protein: { min: number; max: number };
    carbs: { min: number; max: number };
    fat: { min: number; max: number };
    calories: { target: number };
} => {
    const protocol = FUEL_PROTOCOLS[goal];
    const macros = protocol.macros;

    // Calculate calories from macros (using mid-range values)
    const proteinCal = ((macros.protein_g_per_kg[0] + macros.protein_g_per_kg[1]) / 2) * bodyWeightKg * 4;
    const carbsCal = ((macros.carbs_g_per_kg[0] + macros.carbs_g_per_kg[1]) / 2) * bodyWeightKg * 4;
    const fatCal = ((macros.fat_g_per_kg[0] + macros.fat_g_per_kg[1]) / 2) * bodyWeightKg * 9;
    const maintenanceCal = proteinCal + carbsCal + fatCal;

    return {
        protein: {
            min: Math.round(macros.protein_g_per_kg[0] * bodyWeightKg),
            max: Math.round(macros.protein_g_per_kg[1] * bodyWeightKg)
        },
        carbs: {
            min: Math.round(macros.carbs_g_per_kg[0] * bodyWeightKg),
            max: Math.round(macros.carbs_g_per_kg[1] * bodyWeightKg)
        },
        fat: {
            min: Math.round(macros.fat_g_per_kg[0] * bodyWeightKg),
            max: Math.round(macros.fat_g_per_kg[1] * bodyWeightKg)
        },
        calories: {
            target: Math.round(maintenanceCal + protocol.calories.balance_kcal)
        }
    };
};

// Check if a food/meal fits the goal
export const checkMealForGoal = (
    goal: GoalType,
    context: 'pre_workout' | 'post_workout' | 'pre_sleep' | 'general',
    meal: { protein_g: number; carbs_g: number; fat_g: number }
): { ok: boolean; warnings: string[] } => {
    const protocol = FUEL_PROTOCOLS[goal];
    const warnings: string[] = [];

    if (context === 'pre_workout') {
        if (protocol.timing.preworkout.fat_limit && meal.fat_g > 15) {
            warnings.push('High fat may slow digestion pre-workout');
        }
        if (protocol.timing.preworkout.carbs_required && meal.carbs_g < 30) {
            warnings.push(`${goal} goal requires carbs before training`);
        }
    }

    if (context === 'post_workout') {
        if (protocol.timing.postworkout.window_priority === 'critical' && meal.protein_g < 25) {
            warnings.push('Post-workout protein is critical for your goal');
        }
        if (protocol.timing.postworkout.carbs_required && meal.carbs_g < 40) {
            warnings.push('Post-workout carbs recommended');
        }
    }

    if (context === 'pre_sleep') {
        if (protocol.timing.pre_sleep.carb_timing === 'avoid' && meal.carbs_g > 30) {
            warnings.push('Consider reducing carbs before sleep for your goal');
        }
    }

    return { ok: warnings.length === 0, warnings };
};

// Get supplement recommendations for a goal
export const getSupplementRecommendations = (goal: GoalType): {
    essential: string[];
    beneficial: string[];
    avoid: string[];
} => {
    const protocol = FUEL_PROTOCOLS[goal];
    return {
        essential: protocol.supplements.tier1_essential,
        beneficial: protocol.supplements.tier2_beneficial,
        avoid: protocol.supplements.avoid
    };
};

// Get fueling guidance for training
export const getTrainingFuelGuidance = (
    goal: GoalType,
    sessionType: 'strength' | 'cardio' | 'hiit',
    durationMin: number
): {
    preworkout: string[];
    during: string[];
    postworkout: string[];
} => {
    const protocol = FUEL_PROTOCOLS[goal];
    const guidance = {
        preworkout: [] as string[],
        during: [] as string[],
        postworkout: [] as string[]
    };

    // Pre-workout
    if (protocol.timing.preworkout.carbs_required) {
        guidance.preworkout.push('Consume 30-60g carbs 1-2 hours before');
    }
    if (protocol.timing.preworkout.protein_required) {
        guidance.preworkout.push('Include 20-30g protein pre-workout');
    }
    if (protocol.timing.preworkout.fasted_ok) {
        guidance.preworkout.push('Fasted training is acceptable for your goal');
    }
    if (protocol.timing.preworkout.caffeine_ok) {
        guidance.preworkout.push('Caffeine 30-60 min before if desired');
    }

    // During
    if (durationMin > 60 && (goal === 'endurance' || goal === 'hybrid')) {
        guidance.during.push('Consume 30-60g carbs per hour');
        guidance.during.push('Electrolytes: 500-1000mg sodium per hour');
    }
    if (durationMin > 90) {
        guidance.during.push('Consider intra-workout protein for sessions >90min');
    }

    // Post-workout
    const pw = protocol.timing.postworkout;
    if (pw.window_priority === 'critical') {
        guidance.postworkout.push(`Consume ${pw.protein_g[0]}-${pw.protein_g[1]}g protein within ${pw.timing_min} min`);
    } else {
        guidance.postworkout.push(`Protein: ${pw.protein_g[0]}-${pw.protein_g[1]}g within ${pw.timing_min} min`);
    }
    if (pw.carbs_required) {
        guidance.postworkout.push('Prioritize fast-digesting carbs for glycogen');
    }

    return guidance;
};

// ============================================================================
// ADAPTER FUNCTIONS FOR goalAwareHooks.ts
// ============================================================================

export interface FuelProtocolAdapter {
    macros: {
        protein: { min: number; max: number; unit: string };
        carbs: { min: number; max: number; unit: string };
        fats: { min: number; max: number; unit: string };
    };
    caloric_strategy: string;
    nutrient_timing: {
        pre_workout: { timing: string; recommendations: string[]; };
        post_workout: { timing: string; recommendations: string[]; anabolic_window: string; };
    };
    supplement_stack: {
        tier_1: { item: string }[];
        tier_2: { item: string }[];
    };
    hydration: { daily: string };
    food_focus: { prioritize: string[] };
}

export const getFuelProtocol = (goal: GoalType): FuelProtocolAdapter => {
    const p = FUEL_PROTOCOLS[goal];
    if (!p) {
        // Fallback to hybrid if goal doesn't exist
        return getFuelProtocol('hybrid');
    }

    const calorieBalance = p.calories.balance_kcal;
    const calorieStrategy = calorieBalance > 0
        ? `+${calorieBalance} kcal surplus`
        : calorieBalance < 0
            ? `${calorieBalance} kcal deficit`
            : 'Maintenance calories';

    return {
        macros: {
            protein: { min: p.macros.protein_g_per_kg[0], max: p.macros.protein_g_per_kg[1], unit: 'g/kg' },
            carbs: { min: p.macros.carbs_g_per_kg[0], max: p.macros.carbs_g_per_kg[1], unit: 'g/kg' },
            fats: { min: p.macros.fat_g_per_kg[0], max: p.macros.fat_g_per_kg[1], unit: 'g/kg' }
        },
        caloric_strategy: calorieStrategy,
        nutrient_timing: {
            pre_workout: {
                timing: `${p.timing.preworkout.timing_min[0]}-${p.timing.preworkout.timing_min[1]} min before`,
                recommendations: [
                    p.timing.preworkout.carbs_required ? 'Carbs recommended' : 'Carbs optional',
                    p.timing.preworkout.protein_required ? 'Protein recommended' : 'Protein optional',
                    p.timing.preworkout.fasted_ok ? 'Fasted training OK' : 'Avoid training fasted',
                    p.timing.preworkout.caffeine_ok ? 'Caffeine OK' : 'Limit caffeine'
                ]
            },
            post_workout: {
                timing: `Within ${p.timing.postworkout.timing_min} min`,
                recommendations: [
                    `Protein: ${p.timing.postworkout.protein_g[0]}-${p.timing.postworkout.protein_g[1]}g`,
                    p.timing.postworkout.carbs_required ? 'Carbs for glycogen' : 'Carbs optional',
                    `Window priority: ${p.timing.postworkout.window_priority}`
                ],
                anabolic_window: `${p.timing.postworkout.timing_min} minutes`
            }
        },
        supplement_stack: {
            tier_1: p.supplements.tier1_essential.map(s => ({ item: s.replace(/_/g, ' ') })),
            tier_2: p.supplements.tier2_beneficial.map(s => ({ item: s.replace(/_/g, ' ') }))
        },
        hydration: {
            daily: `${p.hydration.base_ml_per_kg}ml/kg + ${p.hydration.training_addition_ml_per_hour}ml/hour training`
        },
        food_focus: {
            prioritize: p.foods.prioritize.map(f => f.replace(/_/g, ' '))
        }
    };
};

export interface PreWorkoutProtocol {
    timing: string;
    recommendations: string[];
    carbs: string;
    protein: string;
    fats: string;
}

export const getPreWorkoutProtocol = (goal: GoalType): PreWorkoutProtocol => {
    const p = FUEL_PROTOCOLS[goal] || FUEL_PROTOCOLS['hybrid'];
    const pre = p.timing.preworkout;

    return {
        timing: `${pre.timing_min[0]}-${pre.timing_min[1]} minutes before`,
        recommendations: [
            pre.carbs_required ? 'Consume 30-60g carbs' : 'Carbs optional',
            pre.protein_required ? 'Include 20-30g protein' : 'Protein optional',
            pre.fasted_ok ? 'Fasted training acceptable' : 'Eat before training',
            pre.caffeine_ok ? 'Caffeine OK (3-6mg/kg)' : 'Limit caffeine'
        ],
        carbs: pre.carbs_required ? '30-60g' : 'Optional',
        protein: pre.protein_required ? '20-30g' : 'Optional',
        fats: pre.fat_limit ? 'Limit to <15g' : 'Moderate OK'
    };
};

export interface PostWorkoutProtocol {
    timing: string;
    recommendations: string[];
    carbs: string;
    protein: string;
    fats: string;
    anabolic_window: string;
}

export const getPostWorkoutProtocol = (goal: GoalType): PostWorkoutProtocol => {
    const p = FUEL_PROTOCOLS[goal] || FUEL_PROTOCOLS['hybrid'];
    const post = p.timing.postworkout;

    return {
        timing: `Within ${post.timing_min} minutes`,
        recommendations: [
            `Protein: ${post.protein_g[0]}-${post.protein_g[1]}g`,
            post.carbs_required ? `Carbs: ${post.carb_g_per_kg[0]}-${post.carb_g_per_kg[1]}g/kg` : 'Carbs optional',
            `Priority: ${post.window_priority}`
        ],
        carbs: post.carbs_required ? `${post.carb_g_per_kg[0]}-${post.carb_g_per_kg[1]}g/kg` : 'Optional',
        protein: `${post.protein_g[0]}-${post.protein_g[1]}g`,
        fats: 'Moderate OK',
        anabolic_window: `${post.timing_min} minutes`
    };
};

