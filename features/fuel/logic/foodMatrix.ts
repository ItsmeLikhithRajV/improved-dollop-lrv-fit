
export interface FoodItem {
    name: string;
    tags: string[]; 
    // New Rich Data
    category?: string;
    base_nutrient?: {
        carbs_g?: number;
        protein_g?: number;
        fat_g?: number;
        fiber_g?: number;
        iron_mg?: number;
        magnesium_mg?: number;
        calcium_mg?: number;
        zinc_mg?: number;
        vitamin_d_iu?: number;
    };
    antinutrients?: {
        phytates_mg?: number;
        oxalates_mg?: number;
    };
    bioavailability_multiplier?: Record<string, number>;
    synergy?: { nutrient: string, partner: string, boost: number }[];
    prebiotic_fiber_g?: number;
}

// GAP 4: DYNAMIC FOOD DATABASE
export const FOOD_DATABASE: FoodItem[] = [
    // --- RICH DATA ENTRIES (V2) ---
    {
        name: "Spinach (Cooked)",
        category: "micronutrient",
        tags: ["micronutrient", "iron", "magnesium", "vegan"],
        base_nutrient: { iron_mg: 6.4, magnesium_mg: 79, fiber_g: 2.5 },
        antinutrients: { oxalates_mg: 656 },
        bioavailability_multiplier: { 'raw': 0.5, 'steamed': 0.9, 'boiled': 1.0 },
        synergy: [{ nutrient: 'iron', partner: 'Vitamin C (Lemon)', boost: 150 }],
        prebiotic_fiber_g: 2.5
    },
    {
        name: "Beef Liver",
        category: "micronutrient_powerhouse",
        tags: ["protein", "iron", "b12"],
        base_nutrient: { iron_mg: 5.2, protein_g: 25, fat_g: 4 },
        bioavailability_multiplier: { 'cooked': 1.0 },
        synergy: []
    },
    {
        name: "Lentils (Sprouted)",
        category: "complex_carb",
        tags: ["complex_carb", "protein", "fiber", "vegan"],
        base_nutrient: { iron_mg: 6.6, fiber_g: 16, protein_g: 18, carbs_g: 40 },
        antinutrients: { phytates_mg: 1240 },
        bioavailability_multiplier: { 'sprouted_cooked': 1.0 },
        synergy: [{ nutrient: 'iron', partner: 'Bell Pepper', boost: 120 }],
        prebiotic_fiber_g: 10
    },
    {
        name: "Salmon",
        category: "protein_fat",
        tags: ["protein", "fat", "omega3"],
        base_nutrient: { protein_g: 25, fat_g: 13, vitamin_d_iu: 300 },
        bioavailability_multiplier: { 'cooked': 0.95 },
        synergy: []
    },
    {
        name: "Steel-Cut Oats",
        category: "complex_carb",
        tags: ["complex_carb", "fiber", "vegan"],
        base_nutrient: { carbs_g: 54, protein_g: 10, fiber_g: 8, iron_mg: 2 },
        prebiotic_fiber_g: 8,
        synergy: [{ nutrient: 'iron', partner: 'Berries', boost: 110 }]
    },

    // --- LEGACY ENTRIES (PRESERVED) ---
    { name: "Banana", tags: ['quick_carb', 'vegan', 'gluten_free', 'low_fodmap'] },
    { name: "Energy Gel", tags: ['quick_carb', 'vegan', 'gluten_free', 'processed'] },
    { name: "White Rice Cakes", tags: ['quick_carb', 'vegan', 'gluten_free', 'low_fodmap'] },
    { name: "Maple Syrup", tags: ['quick_carb', 'vegan', 'gluten_free', 'low_fodmap'] },
    { name: "Sports Drink", tags: ['quick_carb', 'hydration', 'vegan', 'gluten_free'] },
    { name: "Hydrogel Mix", tags: ['quick_carb', 'hydration', 'vegan', 'gluten_free', 'gut_friendly'] },
    { name: "Dried Mango", tags: ['quick_carb', 'vegan', 'gluten_free', 'high_fodmap'] },
    { name: "Honey", tags: ['quick_carb', 'gluten_free', 'high_fodmap'] },
    { name: "Sweet Potato", tags: ['complex_carb', 'vegan', 'gluten_free', 'low_fodmap'] },
    { name: "Quinoa", tags: ['complex_carb', 'vegan', 'gluten_free', 'low_fodmap'] },
    { name: "White Rice", tags: ['complex_carb', 'vegan', 'gluten_free', 'low_fodmap', 'gut_friendly'] },
    { name: "Whey Isolate", tags: ['protein', 'dairy', 'fast_absorb'] },
    { name: "Greek Yogurt", tags: ['protein', 'dairy', 'probiotic'] },
    { name: "Chicken Breast", tags: ['protein', 'gluten_free', 'low_fodmap'] },
    { name: "Almond Butter", tags: ['fat', 'protein', 'nuts', 'vegan', 'gluten_free'] },
    { name: "Avocado", tags: ['fat', 'vegan', 'gluten_free', 'high_fodmap'] },
    { name: "Water + Electrolytes", tags: ['hydration', 'vegan', 'gluten_free'] }
];
