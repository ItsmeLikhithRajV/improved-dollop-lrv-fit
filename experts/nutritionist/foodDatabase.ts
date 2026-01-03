/**
 * Food Database
 * Comprehensive database of common foods with macro information
 * Used by FuelActionEngine for specific recommendations
 */

// =====================================================
// INTERFACES
// =====================================================

export interface FoodItem {
    id: string;
    name: string;
    emoji: string;

    // Macros per serving
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    calories: number;

    // Serving info
    serving_size: string;      // "1 egg", "100g", "1 cup"
    serving_grams: number;     // Actual weight in grams

    // Dietary info
    category: FoodCategory;
    tags: FoodTag[];
    allergens: Allergen[];
    diet_compatible: DietType[];

    // Prep info
    prep_time: 'instant' | 'quick' | 'cook';  // instant=0min, quick=5min, cook=15+min

    // Timing suitability
    timing_best: MealTiming[];
}

export type FoodCategory =
    | 'protein_animal'
    | 'protein_plant'
    | 'protein_dairy'
    | 'carbs_grain'
    | 'carbs_fruit'
    | 'carbs_vegetable'
    | 'fat_healthy'
    | 'fat_nuts'
    | 'mixed'
    | 'supplement';

export type FoodTag =
    | 'high_protein'
    | 'high_carb'
    | 'high_fat'
    | 'fast_digesting'
    | 'slow_digesting'
    | 'recovery'
    | 'pre_workout'
    | 'post_workout'
    | 'breakfast'
    | 'snack'
    | 'portable'
    | 'whole_food';

export type Allergen =
    | 'gluten'
    | 'dairy'
    | 'nuts'
    | 'shellfish'
    | 'eggs'
    | 'soy'
    | 'fish';

export type DietType =
    | 'omnivore'
    | 'vegetarian'
    | 'vegan'
    | 'pescatarian'
    | 'keto'
    | 'paleo';

export type MealTiming =
    | 'breakfast'
    | 'pre_workout'
    | 'post_workout'
    | 'lunch'
    | 'dinner'
    | 'snack'
    | 'evening';

// =====================================================
// FOOD DATABASE
// =====================================================

export const FOOD_DATABASE: FoodItem[] = [
    // --- PROTEIN: ANIMAL ---
    {
        id: 'chicken_breast',
        name: 'Chicken Breast',
        emoji: '🍗',
        protein_g: 31,
        carbs_g: 0,
        fat_g: 3.6,
        calories: 165,
        serving_size: '100g',
        serving_grams: 100,
        category: 'protein_animal',
        tags: ['high_protein', 'recovery', 'post_workout', 'whole_food'],
        allergens: [],
        diet_compatible: ['omnivore', 'paleo', 'keto'],
        prep_time: 'cook',
        timing_best: ['lunch', 'dinner', 'post_workout']
    },
    {
        id: 'egg_whole',
        name: 'Whole Egg',
        emoji: '🥚',
        protein_g: 6,
        carbs_g: 0.6,
        fat_g: 5,
        calories: 78,
        serving_size: '1 large egg',
        serving_grams: 50,
        category: 'protein_animal',
        tags: ['high_protein', 'breakfast', 'whole_food'],
        allergens: ['eggs'],
        diet_compatible: ['omnivore', 'vegetarian', 'paleo', 'keto'],
        prep_time: 'quick',
        timing_best: ['breakfast', 'lunch', 'snack']
    },
    {
        id: 'egg_whites',
        name: 'Egg Whites',
        emoji: '🥚',
        protein_g: 11,
        carbs_g: 0.7,
        fat_g: 0.2,
        calories: 52,
        serving_size: '100g (3 whites)',
        serving_grams: 100,
        category: 'protein_animal',
        tags: ['high_protein', 'breakfast'],
        allergens: ['eggs'],
        diet_compatible: ['omnivore', 'vegetarian', 'keto'],
        prep_time: 'quick',
        timing_best: ['breakfast', 'post_workout']
    },
    {
        id: 'salmon',
        name: 'Salmon Fillet',
        emoji: '🐟',
        protein_g: 25,
        carbs_g: 0,
        fat_g: 13,
        calories: 208,
        serving_size: '100g',
        serving_grams: 100,
        category: 'protein_animal',
        tags: ['high_protein', 'high_fat', 'recovery', 'whole_food'],
        allergens: ['fish'],
        diet_compatible: ['omnivore', 'pescatarian', 'paleo', 'keto'],
        prep_time: 'cook',
        timing_best: ['lunch', 'dinner']
    },
    {
        id: 'tuna_canned',
        name: 'Tuna (canned)',
        emoji: '🐟',
        protein_g: 25,
        carbs_g: 0,
        fat_g: 1,
        calories: 116,
        serving_size: '1 can (100g)',
        serving_grams: 100,
        category: 'protein_animal',
        tags: ['high_protein', 'portable', 'post_workout'],
        allergens: ['fish'],
        diet_compatible: ['omnivore', 'pescatarian', 'paleo', 'keto'],
        prep_time: 'instant',
        timing_best: ['lunch', 'snack', 'post_workout']
    },
    {
        id: 'beef_lean',
        name: 'Lean Beef',
        emoji: '🥩',
        protein_g: 26,
        carbs_g: 0,
        fat_g: 11,
        calories: 217,
        serving_size: '100g',
        serving_grams: 100,
        category: 'protein_animal',
        tags: ['high_protein', 'recovery', 'whole_food'],
        allergens: [],
        diet_compatible: ['omnivore', 'paleo', 'keto'],
        prep_time: 'cook',
        timing_best: ['lunch', 'dinner']
    },
    {
        id: 'turkey_breast',
        name: 'Turkey Breast',
        emoji: '🦃',
        protein_g: 29,
        carbs_g: 0,
        fat_g: 1,
        calories: 135,
        serving_size: '100g',
        serving_grams: 100,
        category: 'protein_animal',
        tags: ['high_protein', 'recovery'],
        allergens: [],
        diet_compatible: ['omnivore', 'paleo', 'keto'],
        prep_time: 'cook',
        timing_best: ['lunch', 'dinner']
    },
    {
        id: 'shrimp',
        name: 'Shrimp',
        emoji: '🦐',
        protein_g: 24,
        carbs_g: 0.2,
        fat_g: 0.3,
        calories: 99,
        serving_size: '100g',
        serving_grams: 100,
        category: 'protein_animal',
        tags: ['high_protein', 'fast_digesting'],
        allergens: ['shellfish'],
        diet_compatible: ['omnivore', 'pescatarian', 'paleo', 'keto'],
        prep_time: 'quick',
        timing_best: ['lunch', 'dinner']
    },

    // --- PROTEIN: DAIRY ---
    {
        id: 'greek_yogurt',
        name: 'Greek Yogurt',
        emoji: '🥛',
        protein_g: 15,
        carbs_g: 5,
        fat_g: 0,
        calories: 80,
        serving_size: '1 cup (170g)',
        serving_grams: 170,
        category: 'protein_dairy',
        tags: ['high_protein', 'breakfast', 'snack', 'portable', 'recovery'],
        allergens: ['dairy'],
        diet_compatible: ['omnivore', 'vegetarian'],
        prep_time: 'instant',
        timing_best: ['breakfast', 'snack', 'post_workout']
    },
    {
        id: 'cottage_cheese',
        name: 'Cottage Cheese',
        emoji: '🧀',
        protein_g: 14,
        carbs_g: 3,
        fat_g: 4,
        calories: 98,
        serving_size: '100g',
        serving_grams: 100,
        category: 'protein_dairy',
        tags: ['high_protein', 'slow_digesting', 'snack'],
        allergens: ['dairy'],
        diet_compatible: ['omnivore', 'vegetarian'],
        prep_time: 'instant',
        timing_best: ['breakfast', 'snack', 'evening']
    },
    {
        id: 'milk',
        name: 'Milk',
        emoji: '🥛',
        protein_g: 8,
        carbs_g: 12,
        fat_g: 5,
        calories: 103,
        serving_size: '1 cup (240ml)',
        serving_grams: 240,
        category: 'protein_dairy',
        tags: ['recovery', 'post_workout'],
        allergens: ['dairy'],
        diet_compatible: ['omnivore', 'vegetarian'],
        prep_time: 'instant',
        timing_best: ['breakfast', 'post_workout']
    },
    {
        id: 'cheese_cheddar',
        name: 'Cheddar Cheese',
        emoji: '🧀',
        protein_g: 25,
        carbs_g: 1,
        fat_g: 33,
        calories: 403,
        serving_size: '100g',
        serving_grams: 100,
        category: 'protein_dairy',
        tags: ['high_protein', 'high_fat', 'snack'],
        allergens: ['dairy'],
        diet_compatible: ['omnivore', 'vegetarian', 'keto'],
        prep_time: 'instant',
        timing_best: ['snack', 'lunch']
    },

    // --- PROTEIN: PLANT ---
    {
        id: 'tofu',
        name: 'Tofu (firm)',
        emoji: '🫘',
        protein_g: 15,
        carbs_g: 2,
        fat_g: 9,
        calories: 144,
        serving_size: '100g',
        serving_grams: 100,
        category: 'protein_plant',
        tags: ['high_protein', 'whole_food'],
        allergens: ['soy'],
        diet_compatible: ['omnivore', 'vegetarian', 'vegan'],
        prep_time: 'cook',
        timing_best: ['lunch', 'dinner']
    },
    {
        id: 'tempeh',
        name: 'Tempeh',
        emoji: '🫘',
        protein_g: 19,
        carbs_g: 9,
        fat_g: 11,
        calories: 192,
        serving_size: '100g',
        serving_grams: 100,
        category: 'protein_plant',
        tags: ['high_protein', 'whole_food'],
        allergens: ['soy'],
        diet_compatible: ['omnivore', 'vegetarian', 'vegan'],
        prep_time: 'cook',
        timing_best: ['lunch', 'dinner']
    },
    {
        id: 'lentils',
        name: 'Lentils (cooked)',
        emoji: '🫘',
        protein_g: 9,
        carbs_g: 20,
        fat_g: 0.4,
        calories: 116,
        serving_size: '1 cup (200g)',
        serving_grams: 200,
        category: 'protein_plant',
        tags: ['high_protein', 'high_carb', 'whole_food', 'slow_digesting'],
        allergens: [],
        diet_compatible: ['omnivore', 'vegetarian', 'vegan'],
        prep_time: 'cook',
        timing_best: ['lunch', 'dinner']
    },
    {
        id: 'chickpeas',
        name: 'Chickpeas (cooked)',
        emoji: '🫘',
        protein_g: 15,
        carbs_g: 45,
        fat_g: 4,
        calories: 269,
        serving_size: '1 cup (164g)',
        serving_grams: 164,
        category: 'protein_plant',
        tags: ['high_protein', 'high_carb', 'whole_food'],
        allergens: [],
        diet_compatible: ['omnivore', 'vegetarian', 'vegan'],
        prep_time: 'cook',
        timing_best: ['lunch', 'dinner']
    },
    {
        id: 'edamame',
        name: 'Edamame',
        emoji: '🫛',
        protein_g: 11,
        carbs_g: 10,
        fat_g: 5,
        calories: 121,
        serving_size: '1 cup (155g)',
        serving_grams: 155,
        category: 'protein_plant',
        tags: ['high_protein', 'snack', 'portable'],
        allergens: ['soy'],
        diet_compatible: ['omnivore', 'vegetarian', 'vegan'],
        prep_time: 'quick',
        timing_best: ['snack', 'lunch']
    },

    // --- CARBS: GRAINS ---
    {
        id: 'rice_white',
        name: 'White Rice',
        emoji: '🍚',
        protein_g: 4,
        carbs_g: 45,
        fat_g: 0.4,
        calories: 206,
        serving_size: '1 cup cooked',
        serving_grams: 158,
        category: 'carbs_grain',
        tags: ['high_carb', 'fast_digesting', 'post_workout'],
        allergens: [],
        diet_compatible: ['omnivore', 'vegetarian', 'vegan'],
        prep_time: 'cook',
        timing_best: ['lunch', 'dinner', 'post_workout']
    },
    {
        id: 'rice_brown',
        name: 'Brown Rice',
        emoji: '🍚',
        protein_g: 5,
        carbs_g: 45,
        fat_g: 2,
        calories: 216,
        serving_size: '1 cup cooked',
        serving_grams: 195,
        category: 'carbs_grain',
        tags: ['high_carb', 'slow_digesting', 'whole_food'],
        allergens: [],
        diet_compatible: ['omnivore', 'vegetarian', 'vegan'],
        prep_time: 'cook',
        timing_best: ['lunch', 'dinner']
    },
    {
        id: 'oats',
        name: 'Oatmeal',
        emoji: '🥣',
        protein_g: 5,
        carbs_g: 27,
        fat_g: 3,
        calories: 158,
        serving_size: '1/2 cup dry (40g)',
        serving_grams: 40,
        category: 'carbs_grain',
        tags: ['high_carb', 'slow_digesting', 'breakfast', 'whole_food'],
        allergens: ['gluten'],
        diet_compatible: ['omnivore', 'vegetarian', 'vegan'],
        prep_time: 'quick',
        timing_best: ['breakfast', 'pre_workout']
    },
    {
        id: 'bread_whole',
        name: 'Whole Wheat Bread',
        emoji: '🍞',
        protein_g: 4,
        carbs_g: 12,
        fat_g: 1,
        calories: 69,
        serving_size: '1 slice',
        serving_grams: 28,
        category: 'carbs_grain',
        tags: ['high_carb', 'breakfast', 'portable'],
        allergens: ['gluten'],
        diet_compatible: ['omnivore', 'vegetarian', 'vegan'],
        prep_time: 'instant',
        timing_best: ['breakfast', 'snack']
    },
    {
        id: 'pasta',
        name: 'Pasta',
        emoji: '🍝',
        protein_g: 8,
        carbs_g: 43,
        fat_g: 1,
        calories: 221,
        serving_size: '1 cup cooked',
        serving_grams: 140,
        category: 'carbs_grain',
        tags: ['high_carb', 'slow_digesting'],
        allergens: ['gluten'],
        diet_compatible: ['omnivore', 'vegetarian', 'vegan'],
        prep_time: 'cook',
        timing_best: ['lunch', 'dinner', 'pre_workout']
    },
    {
        id: 'quinoa',
        name: 'Quinoa',
        emoji: '🥣',
        protein_g: 8,
        carbs_g: 39,
        fat_g: 4,
        calories: 222,
        serving_size: '1 cup cooked',
        serving_grams: 185,
        category: 'carbs_grain',
        tags: ['high_carb', 'high_protein', 'whole_food'],
        allergens: [],
        diet_compatible: ['omnivore', 'vegetarian', 'vegan', 'paleo'],
        prep_time: 'cook',
        timing_best: ['lunch', 'dinner']
    },
    {
        id: 'sweet_potato',
        name: 'Sweet Potato',
        emoji: '🍠',
        protein_g: 2,
        carbs_g: 27,
        fat_g: 0,
        calories: 103,
        serving_size: '1 medium',
        serving_grams: 130,
        category: 'carbs_vegetable',
        tags: ['high_carb', 'slow_digesting', 'whole_food'],
        allergens: [],
        diet_compatible: ['omnivore', 'vegetarian', 'vegan', 'paleo'],
        prep_time: 'cook',
        timing_best: ['lunch', 'dinner', 'pre_workout']
    },

    // --- CARBS: FRUIT ---
    {
        id: 'banana',
        name: 'Banana',
        emoji: '🍌',
        protein_g: 1,
        carbs_g: 27,
        fat_g: 0.3,
        calories: 105,
        serving_size: '1 medium',
        serving_grams: 118,
        category: 'carbs_fruit',
        tags: ['high_carb', 'fast_digesting', 'pre_workout', 'portable', 'snack'],
        allergens: [],
        diet_compatible: ['omnivore', 'vegetarian', 'vegan', 'paleo'],
        prep_time: 'instant',
        timing_best: ['breakfast', 'pre_workout', 'snack']
    },
    {
        id: 'apple',
        name: 'Apple',
        emoji: '🍎',
        protein_g: 0.3,
        carbs_g: 25,
        fat_g: 0.2,
        calories: 95,
        serving_size: '1 medium',
        serving_grams: 182,
        category: 'carbs_fruit',
        tags: ['snack', 'portable', 'whole_food'],
        allergens: [],
        diet_compatible: ['omnivore', 'vegetarian', 'vegan', 'paleo'],
        prep_time: 'instant',
        timing_best: ['snack']
    },
    {
        id: 'berries_mixed',
        name: 'Mixed Berries',
        emoji: '🫐',
        protein_g: 1,
        carbs_g: 14,
        fat_g: 0.5,
        calories: 57,
        serving_size: '1 cup',
        serving_grams: 140,
        category: 'carbs_fruit',
        tags: ['snack', 'breakfast', 'whole_food'],
        allergens: [],
        diet_compatible: ['omnivore', 'vegetarian', 'vegan', 'paleo', 'keto'],
        prep_time: 'instant',
        timing_best: ['breakfast', 'snack']
    },
    {
        id: 'orange',
        name: 'Orange',
        emoji: '🍊',
        protein_g: 1,
        carbs_g: 15,
        fat_g: 0.2,
        calories: 62,
        serving_size: '1 medium',
        serving_grams: 131,
        category: 'carbs_fruit',
        tags: ['snack', 'portable'],
        allergens: [],
        diet_compatible: ['omnivore', 'vegetarian', 'vegan', 'paleo'],
        prep_time: 'instant',
        timing_best: ['snack', 'breakfast']
    },
    {
        id: 'dates',
        name: 'Dates',
        emoji: '🫘',
        protein_g: 2,
        carbs_g: 75,
        fat_g: 0.4,
        calories: 282,
        serving_size: '100g (4-5 dates)',
        serving_grams: 100,
        category: 'carbs_fruit',
        tags: ['high_carb', 'fast_digesting', 'pre_workout', 'portable'],
        allergens: [],
        diet_compatible: ['omnivore', 'vegetarian', 'vegan', 'paleo'],
        prep_time: 'instant',
        timing_best: ['pre_workout', 'snack']
    },

    // --- FATS: HEALTHY ---
    {
        id: 'avocado',
        name: 'Avocado',
        emoji: '🥑',
        protein_g: 2,
        carbs_g: 9,
        fat_g: 15,
        calories: 160,
        serving_size: '1/2 medium',
        serving_grams: 100,
        category: 'fat_healthy',
        tags: ['high_fat', 'whole_food'],
        allergens: [],
        diet_compatible: ['omnivore', 'vegetarian', 'vegan', 'paleo', 'keto'],
        prep_time: 'instant',
        timing_best: ['breakfast', 'lunch', 'snack']
    },
    {
        id: 'olive_oil',
        name: 'Olive Oil',
        emoji: '🫒',
        protein_g: 0,
        carbs_g: 0,
        fat_g: 14,
        calories: 119,
        serving_size: '1 tbsp',
        serving_grams: 14,
        category: 'fat_healthy',
        tags: ['high_fat'],
        allergens: [],
        diet_compatible: ['omnivore', 'vegetarian', 'vegan', 'paleo', 'keto'],
        prep_time: 'instant',
        timing_best: ['lunch', 'dinner']
    },

    // --- FATS: NUTS ---
    {
        id: 'almonds',
        name: 'Almonds',
        emoji: '🥜',
        protein_g: 6,
        carbs_g: 6,
        fat_g: 14,
        calories: 164,
        serving_size: '1 oz (23 nuts)',
        serving_grams: 28,
        category: 'fat_nuts',
        tags: ['high_fat', 'snack', 'portable'],
        allergens: ['nuts'],
        diet_compatible: ['omnivore', 'vegetarian', 'vegan', 'paleo', 'keto'],
        prep_time: 'instant',
        timing_best: ['snack']
    },
    {
        id: 'peanut_butter',
        name: 'Peanut Butter',
        emoji: '🥜',
        protein_g: 8,
        carbs_g: 6,
        fat_g: 16,
        calories: 188,
        serving_size: '2 tbsp',
        serving_grams: 32,
        category: 'fat_nuts',
        tags: ['high_fat', 'high_protein', 'breakfast', 'snack'],
        allergens: ['nuts'],
        diet_compatible: ['omnivore', 'vegetarian', 'vegan'],
        prep_time: 'instant',
        timing_best: ['breakfast', 'snack']
    },
    {
        id: 'walnuts',
        name: 'Walnuts',
        emoji: '🥜',
        protein_g: 4,
        carbs_g: 4,
        fat_g: 18,
        calories: 185,
        serving_size: '1 oz (14 halves)',
        serving_grams: 28,
        category: 'fat_nuts',
        tags: ['high_fat', 'snack'],
        allergens: ['nuts'],
        diet_compatible: ['omnivore', 'vegetarian', 'vegan', 'paleo', 'keto'],
        prep_time: 'instant',
        timing_best: ['snack']
    },
    {
        id: 'cashews',
        name: 'Cashews',
        emoji: '🥜',
        protein_g: 5,
        carbs_g: 9,
        fat_g: 12,
        calories: 157,
        serving_size: '1 oz (18 nuts)',
        serving_grams: 28,
        category: 'fat_nuts',
        tags: ['snack', 'portable'],
        allergens: ['nuts'],
        diet_compatible: ['omnivore', 'vegetarian', 'vegan'],
        prep_time: 'instant',
        timing_best: ['snack']
    },

    // --- SUPPLEMENTS ---
    {
        id: 'whey_protein',
        name: 'Whey Protein Shake',
        emoji: '🥤',
        protein_g: 25,
        carbs_g: 3,
        fat_g: 1,
        calories: 120,
        serving_size: '1 scoop',
        serving_grams: 30,
        category: 'supplement',
        tags: ['high_protein', 'fast_digesting', 'post_workout', 'portable'],
        allergens: ['dairy'],
        diet_compatible: ['omnivore', 'vegetarian'],
        prep_time: 'instant',
        timing_best: ['post_workout', 'snack']
    },
    {
        id: 'casein_protein',
        name: 'Casein Protein',
        emoji: '🥤',
        protein_g: 24,
        carbs_g: 3,
        fat_g: 1,
        calories: 120,
        serving_size: '1 scoop',
        serving_grams: 30,
        category: 'supplement',
        tags: ['high_protein', 'slow_digesting'],
        allergens: ['dairy'],
        diet_compatible: ['omnivore', 'vegetarian'],
        prep_time: 'instant',
        timing_best: ['evening', 'snack']
    },
    {
        id: 'plant_protein',
        name: 'Plant Protein Shake',
        emoji: '🥤',
        protein_g: 20,
        carbs_g: 5,
        fat_g: 2,
        calories: 110,
        serving_size: '1 scoop',
        serving_grams: 35,
        category: 'supplement',
        tags: ['high_protein', 'post_workout', 'portable'],
        allergens: [],
        diet_compatible: ['omnivore', 'vegetarian', 'vegan'],
        prep_time: 'instant',
        timing_best: ['post_workout', 'snack']
    },

    // --- MIXED/COMBO FOODS ---
    {
        id: 'hummus',
        name: 'Hummus',
        emoji: '🫘',
        protein_g: 8,
        carbs_g: 14,
        fat_g: 10,
        calories: 166,
        serving_size: '1/3 cup',
        serving_grams: 80,
        category: 'mixed',
        tags: ['snack', 'portable'],
        allergens: [],
        diet_compatible: ['omnivore', 'vegetarian', 'vegan'],
        prep_time: 'instant',
        timing_best: ['snack', 'lunch']
    },
    {
        id: 'trail_mix',
        name: 'Trail Mix',
        emoji: '🥜',
        protein_g: 6,
        carbs_g: 22,
        fat_g: 18,
        calories: 260,
        serving_size: '1/4 cup',
        serving_grams: 40,
        category: 'mixed',
        tags: ['snack', 'portable', 'pre_workout'],
        allergens: ['nuts'],
        diet_compatible: ['omnivore', 'vegetarian', 'vegan'],
        prep_time: 'instant',
        timing_best: ['snack', 'pre_workout']
    }
];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Filter foods by dietary restrictions
 */
export const filterByDiet = (
    foods: FoodItem[],
    dietType: DietType,
    allergies: Allergen[]
): FoodItem[] => {
    return foods.filter(food => {
        // Check diet compatibility
        if (!food.diet_compatible.includes(dietType)) return false;

        // Check allergen conflicts
        if (allergies.some(allergy => food.allergens.includes(allergy))) return false;

        return true;
    });
};

/**
 * Get foods by macro priority
 */
export const getFoodsByMacro = (
    foods: FoodItem[],
    macro: 'protein' | 'carbs' | 'fat'
): FoodItem[] => {
    const sorted = [...foods].sort((a, b) => {
        const aVal = macro === 'protein' ? a.protein_g : macro === 'carbs' ? a.carbs_g : a.fat_g;
        const bVal = macro === 'protein' ? b.protein_g : macro === 'carbs' ? b.carbs_g : b.fat_g;
        return bVal - aVal;
    });
    const tagMap: Record<typeof macro, FoodTag> = {
        protein: 'high_protein',
        carbs: 'high_carb',
        fat: 'high_fat'
    };
    return sorted.filter(f => f.tags.includes(tagMap[macro]));
};

/**
 * Get foods suitable for specific meal timing
 */
export const getFoodsByTiming = (
    foods: FoodItem[],
    timing: MealTiming
): FoodItem[] => {
    return foods.filter(f => f.timing_best.includes(timing));
};

/**
 * Calculate how many servings needed to hit a macro target
 */
export const calculateServingsNeeded = (
    food: FoodItem,
    target_g: number,
    macro: 'protein' | 'carbs' | 'fat'
): { servings: number; actual_g: number; description: string } => {
    const per_serving = macro === 'protein' ? food.protein_g :
        macro === 'carbs' ? food.carbs_g : food.fat_g;

    if (per_serving === 0) return { servings: 0, actual_g: 0, description: 'Not a significant source' };

    const servings = Math.ceil(target_g / per_serving);
    const actual_g = servings * per_serving;

    // Create human-readable description
    let description = '';
    if (servings === 1) {
        description = food.serving_size;
    } else {
        // Handle plural forms
        if (food.serving_size.includes('1 ')) {
            description = food.serving_size.replace('1 ', `${servings} `);
            // Fix pluralization
            if (servings > 1 && description.includes('egg')) description = description.replace('egg', 'eggs');
            if (servings > 1 && description.includes('slice')) description = description.replace('slice', 'slices');
            if (servings > 1 && description.includes('scoop')) description = description.replace('scoop', 'scoops');
        } else {
            description = `${servings} × ${food.serving_size}`;
        }
    }

    return { servings, actual_g, description };
};
