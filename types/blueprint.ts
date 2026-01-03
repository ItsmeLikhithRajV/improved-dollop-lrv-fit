/**
 * Bryan Johnson Blueprint Protocol Types
 * 
 * Based on:
 * - bryanjohnson.com/blueprint
 * - BlueprintOS open-source initiative
 * - "Don't Die" protocol
 * - 100+ supplements, strict circadian schedule, biomarker tracking
 */

// ============================================================================
// BLUEPRINT CORE PROTOCOL
// ============================================================================

export interface BlueprintProtocol {
    version: string;
    last_updated: string;

    // Daily schedule
    schedule: BlueprintDailySchedule;

    // Nutrition
    nutrition: BlueprintNutrition;

    // Supplements
    supplements: BlueprintSupplement[];

    // Exercise
    exercise: BlueprintExercise;

    // Sleep
    sleep: BlueprintSleepProtocol;

    // Biomarkers
    biomarkers: BlueprintBiomarkerTargets;

    // Tracking
    daily_checklist: BlueprintChecklistItem[];
}

// ============================================================================
// DAILY SCHEDULE
// ============================================================================

export interface BlueprintDailySchedule {
    wake_time: '04:30';
    uv_light_start: '04:35';
    morning_drink: '05:25';
    workout_start: '05:30';
    workout_end: '06:45';
    breakfast: '06:45';
    eating_window_end: '11:00';
    wind_down_start: '19:30';
    screen_cutoff: '19:30';
    evening_skincare: '20:00';
    bedtime: '20:30';

    // Meal timing
    meals: {
        meal_1: { time: '06:45', name: 'Super Veggie + Supplements' };
        meal_2: { time: '09:00', name: 'Nutty Pudding' };
        meal_3: { time: '11:00', name: 'Third Meal (if needed)' };
    };
}

// ============================================================================
// NUTRITION PROTOCOL
// ============================================================================

export interface BlueprintNutrition {
    daily_calories: 2250;
    eating_window_hours: 6;         // 6 AM - 12 PM
    diet_type: 'vegan';

    macros: {
        protein_grams: number;        // ~130g
        carbs_grams: number;          // ~200g
        fat_grams: number;            // ~100g
        fiber_grams: number;          // ~60g
    };

    core_meals: BlueprintMeal[];
}

export interface BlueprintMeal {
    name: string;
    time: string;
    components: string[];
    calories: number;
    benefits: string[];
}

export const BLUEPRINT_MEALS: BlueprintMeal[] = [
    {
        name: 'Morning Longevity Drink',
        time: '05:25',
        components: [
            'Blueprint Longevity Mix',
            'Collagen protein (15g)',
            'Creatine (2.5g)',
            'Cocoa flavanols',
            'Prebiotic galacto-oligosaccharides'
        ],
        calories: 200,
        benefits: ['NAD+ support', 'Gut health', 'Muscle maintenance', 'Cognitive support']
    },
    {
        name: 'Super Veggie',
        time: '06:45',
        components: [
            'Black lentils (45g dry)',
            'Broccoli (250g)',
            'Cauliflower (150g)',
            'Shiitake or maitake mushrooms (50g)',
            'Garlic (1 clove)',
            'Ginger root (3g)',
            'Lime juice',
            'Cumin',
            'Apple cider vinegar',
            'Hemp seeds (1 tbsp)',
            'Extra virgin olive oil (15ml)',
            'Fermented foods (kimchi/sauerkraut)'
        ],
        calories: 500,
        benefits: ['Fiber', 'Polyphenols', 'Sulforaphane', 'Prebiotic', 'Anti-inflammatory']
    },
    {
        name: 'Nutty Pudding',
        time: '09:00',
        components: [
            'Macadamia nut milk (200ml)',
            'Macadamia nuts (10)',
            'Walnuts (10)',
            'Ground flaxseed (1 tbsp)',
            'Cocoa powder (6g)',
            'Chia seeds',
            'Blueberries (50g)',
            'Raspberries (50g)',
            'Pea protein or pumpkin seed protein (11g)'
        ],
        calories: 600,
        benefits: ['Omega-3s', 'Polyphenols', 'Complete protein', 'Antioxidants']
    },
    {
        name: 'Third Meal',
        time: '11:00',
        components: [
            'Sweet potato or lentils',
            'Avocado',
            'Leafy greens',
            'Vegetables',
            'Nuts/seeds',
            'Olive oil'
        ],
        calories: 500,
        benefits: ['Complex carbs', 'Healthy fats', 'Micronutrients']
    }
];

// ============================================================================
// SUPPLEMENT STACK
// ============================================================================

export interface BlueprintSupplement {
    name: string;
    dose: string;
    timing: 'morning' | 'with_meal' | 'afternoon' | 'evening' | 'before_bed';
    category: 'longevity' | 'cardiovascular' | 'cognitive' | 'metabolic' | 'immune' | 'skin' | 'gut' | 'sleep' | 'hormone';
    mechanism: string;
    evidence_level: 'strong' | 'moderate' | 'emerging';
}

export const BLUEPRINT_SUPPLEMENT_STACK: BlueprintSupplement[] = [
    // Longevity Core
    { name: 'NMN (Nicotinamide Mononucleotide)', dose: '1000mg', timing: 'morning', category: 'longevity', mechanism: 'NAD+ precursor, cellular energy', evidence_level: 'moderate' },
    { name: 'Ca-AKG (Calcium Alpha-Ketoglutarate)', dose: '1000mg', timing: 'morning', category: 'longevity', mechanism: 'Mitochondrial health, epigenetic', evidence_level: 'emerging' },
    { name: 'Spermidine', dose: '10mg', timing: 'morning', category: 'longevity', mechanism: 'Autophagy activation', evidence_level: 'moderate' },
    { name: 'Fisetin', dose: '500mg', timing: 'with_meal', category: 'longevity', mechanism: 'Senolytic, clears zombie cells', evidence_level: 'emerging' },

    // Cardiovascular
    { name: 'EPA Fish Oil', dose: '800mg', timing: 'with_meal', category: 'cardiovascular', mechanism: 'Omega-3, anti-inflammatory', evidence_level: 'strong' },
    { name: 'CoQ10 (Ubiquinol)', dose: '100mg', timing: 'with_meal', category: 'cardiovascular', mechanism: 'Mitochondrial energy, heart health', evidence_level: 'strong' },
    { name: 'Garlic (1.2g extract)', dose: '1200mg', timing: 'with_meal', category: 'cardiovascular', mechanism: 'Blood pressure, lipids', evidence_level: 'strong' },

    // Metabolic
    { name: 'Metformin', dose: '500mg', timing: 'evening', category: 'metabolic', mechanism: 'Glucose control, AMPK activation', evidence_level: 'moderate' },
    { name: 'Berberine', dose: '500mg', timing: 'with_meal', category: 'metabolic', mechanism: 'Blood sugar, microbiome', evidence_level: 'moderate' },
    { name: 'Acarbose', dose: '50mg', timing: 'with_meal', category: 'metabolic', mechanism: 'Slows carb absorption', evidence_level: 'moderate' },

    // Cognitive
    { name: 'Lithium (microdose)', dose: '1mg', timing: 'morning', category: 'cognitive', mechanism: 'Neuroprotection, mood stability', evidence_level: 'emerging' },
    { name: 'Ashwagandha', dose: '600mg', timing: 'morning', category: 'cognitive', mechanism: 'Cortisol reduction, adaptogen', evidence_level: 'strong' },
    { name: 'Creatine', dose: '2.5g', timing: 'morning', category: 'cognitive', mechanism: 'Brain energy, muscle ATP', evidence_level: 'strong' },

    // Vitamins & Minerals
    { name: 'Vitamin D3', dose: '2000 IU', timing: 'with_meal', category: 'immune', mechanism: 'Immune function, bone health', evidence_level: 'strong' },
    { name: 'Vitamin K2 (MK-4)', dose: '1000mcg', timing: 'with_meal', category: 'cardiovascular', mechanism: 'Calcium routing, arterial health', evidence_level: 'moderate' },
    { name: 'Vitamin K2 (MK-7)', dose: '600mcg', timing: 'with_meal', category: 'cardiovascular', mechanism: 'Long-acting K2', evidence_level: 'moderate' },
    { name: 'Vitamin C', dose: '500mg', timing: 'morning', category: 'immune', mechanism: 'Antioxidant, collagen synthesis', evidence_level: 'strong' },
    { name: 'Zinc', dose: '15mg', timing: 'with_meal', category: 'immune', mechanism: 'Immune function, testosterone', evidence_level: 'strong' },
    { name: 'Magnesium', dose: '400mg', timing: 'evening', category: 'sleep', mechanism: 'Relaxation, sleep quality', evidence_level: 'strong' },

    // Gut Health
    { name: 'GOS (Galacto-oligosaccharides)', dose: '3g', timing: 'morning', category: 'gut', mechanism: 'Prebiotic, gut microbiome', evidence_level: 'moderate' },
    { name: 'Inulin', dose: '3g', timing: 'morning', category: 'gut', mechanism: 'Prebiotic fiber', evidence_level: 'moderate' },

    // Collagen & Skin
    { name: 'Collagen Peptides', dose: '15g', timing: 'morning', category: 'skin', mechanism: 'Skin elasticity, joint health', evidence_level: 'moderate' },

    // Anti-inflammatory
    { name: 'Curcumin', dose: '500mg', timing: 'with_meal', category: 'longevity', mechanism: 'Anti-inflammatory, antioxidant', evidence_level: 'strong' },
    { name: 'Ginger', dose: '1g', timing: 'with_meal', category: 'longevity', mechanism: 'Anti-inflammatory, digestion', evidence_level: 'moderate' }
];

// ============================================================================
// EXERCISE PROTOCOL
// ============================================================================

export interface BlueprintExercise {
    duration_minutes: 60;
    time: '05:30';
    frequency: 'daily';

    components: BlueprintExerciseComponent[];
}

export interface BlueprintExerciseComponent {
    type: string;
    duration_minutes: number;
    intensity: 'low' | 'moderate' | 'high';
    description: string;
}

export const BLUEPRINT_EXERCISE_COMPONENTS: BlueprintExerciseComponent[] = [
    { type: 'Cardio Warmup', duration_minutes: 10, intensity: 'low', description: 'Stationary bike, light jog' },
    { type: 'HIIT / Cardio', duration_minutes: 15, intensity: 'high', description: 'High intensity intervals or steady-state' },
    { type: 'Strength Training', duration_minutes: 25, intensity: 'moderate', description: 'Full body resistance training' },
    { type: 'Flexibility / Core', duration_minutes: 10, intensity: 'low', description: 'Stretching, core stability' }
];

// ============================================================================
// SLEEP PROTOCOL
// ============================================================================

export interface BlueprintSleepProtocol {
    target_bedtime: '20:30';
    target_wake: '05:00';
    target_duration: 8.5;
    target_sleep_score: 100;      // WHOOP or similar

    environment: {
        temperature_f: { min: 60, max: 67 };
        temperature_c: { min: 15, max: 19 };
        darkness: 'complete';
        noise: 'silent';
        mattress_cooling: true;
    };

    pre_sleep: {
        last_meal_hours_before: 9.5;
        wind_down_start: '19:30';
        screen_cutoff: '19:30';
        activities: ['Reading', 'Time with family', 'Light stretching'];
        avoid: ['Screens', 'Bright lights', 'Stimulating content', 'Alcohol', 'Caffeine'];
    };

    devices: {
        eight_sleep_mattress: true;
        sleep_tracking: 'whoop';
    };
}

// ============================================================================
// BIOMARKER TARGETS
// ============================================================================

export interface BlueprintBiomarkerTargets {
    biological_age: {
        chronological: number;
        biological: number;
        pace_of_aging: number;      // <1.0 means aging slower
    };

    core_markers: BlueprintBiomarkerTarget[];
}

export interface BlueprintBiomarkerTarget {
    name: string;
    current: number | null;
    target: number | string;
    unit: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
    category: 'metabolic' | 'cardiovascular' | 'inflammatory' | 'hormonal' | 'organ' | 'performance';
}

export const BLUEPRINT_BIOMARKER_TARGETS: BlueprintBiomarkerTarget[] = [
    // Metabolic
    { name: 'Fasting Glucose', current: null, target: '70-90', unit: 'mg/dL', frequency: 'daily', category: 'metabolic' },
    { name: 'HbA1c', current: null, target: '<5.4', unit: '%', frequency: 'quarterly', category: 'metabolic' },
    { name: 'Fasting Insulin', current: null, target: '<6', unit: 'μIU/mL', frequency: 'quarterly', category: 'metabolic' },
    { name: 'HOMA-IR', current: null, target: '<1.0', unit: '', frequency: 'quarterly', category: 'metabolic' },

    // Cardiovascular
    { name: 'LDL Cholesterol', current: null, target: '<100', unit: 'mg/dL', frequency: 'quarterly', category: 'cardiovascular' },
    { name: 'HDL Cholesterol', current: null, target: '>60', unit: 'mg/dL', frequency: 'quarterly', category: 'cardiovascular' },
    { name: 'Triglycerides', current: null, target: '<70', unit: 'mg/dL', frequency: 'quarterly', category: 'cardiovascular' },
    { name: 'ApoB', current: null, target: '<80', unit: 'mg/dL', frequency: 'quarterly', category: 'cardiovascular' },
    { name: 'Lp(a)', current: null, target: '<30', unit: 'nmol/L', frequency: 'annually', category: 'cardiovascular' },

    // Inflammatory
    { name: 'hsCRP', current: null, target: '<0.5', unit: 'mg/L', frequency: 'quarterly', category: 'inflammatory' },
    { name: 'Homocysteine', current: null, target: '<7', unit: 'μmol/L', frequency: 'quarterly', category: 'inflammatory' },

    // Hormonal
    { name: 'Free Testosterone', current: null, target: 'Optimal for age', unit: 'pg/mL', frequency: 'quarterly', category: 'hormonal' },
    { name: 'DHEA-S', current: null, target: 'Optimal for age', unit: 'μg/dL', frequency: 'quarterly', category: 'hormonal' },
    { name: 'IGF-1', current: null, target: '100-150', unit: 'ng/mL', frequency: 'quarterly', category: 'hormonal' },

    // Organ Function
    { name: 'ALT', current: null, target: '<25', unit: 'U/L', frequency: 'quarterly', category: 'organ' },
    { name: 'AST', current: null, target: '<25', unit: 'U/L', frequency: 'quarterly', category: 'organ' },
    { name: 'GGT', current: null, target: '<20', unit: 'U/L', frequency: 'quarterly', category: 'organ' },
    { name: 'Cystatin-C (eGFR)', current: null, target: '>90', unit: 'mL/min', frequency: 'quarterly', category: 'organ' },

    // Performance
    { name: 'VO2 Max', current: null, target: 'Top 5% for age', unit: 'mL/kg/min', frequency: 'annually', category: 'performance' },
    { name: 'Grip Strength', current: null, target: 'Top 10% for age', unit: 'kg', frequency: 'monthly', category: 'performance' },
    { name: 'Resting HRV (rMSSD)', current: null, target: '>70', unit: 'ms', frequency: 'daily', category: 'performance' }
];

// ============================================================================
// DAILY CHECKLIST
// ============================================================================

export interface BlueprintChecklistItem {
    id: string;
    category: 'sleep' | 'nutrition' | 'supplements' | 'exercise' | 'light' | 'skincare' | 'metrics';
    title: string;
    time: string;
    completed: boolean;
    impact: string;
}

export const BLUEPRINT_DAILY_CHECKLIST: Omit<BlueprintChecklistItem, 'completed'>[] = [
    // Morning
    { id: 'wake', category: 'sleep', title: 'Wake naturally without alarm', time: '04:30', impact: 'Circadian optimization' },
    { id: 'metrics', category: 'metrics', title: 'Check morning metrics (HRV, HR, RHR)', time: '04:32', impact: 'Recovery assessment' },
    { id: 'uv_light', category: 'light', title: 'UV light exposure (3-4 min)', time: '04:35', impact: 'Circadian anchor' },
    { id: 'oral_care', category: 'skincare', title: 'Morning oral care routine', time: '05:00', impact: 'Oral microbiome' },
    { id: 'longevity_drink', category: 'supplements', title: 'Longevity drink + morning supplements', time: '05:25', impact: 'NAD+, collagen, creatine' },
    { id: 'workout', category: 'exercise', title: 'Complete 60-min workout', time: '05:30', impact: 'Cardio, strength, flexibility' },
    { id: 'meal_1', category: 'nutrition', title: 'Super Veggie meal', time: '06:45', impact: 'Fiber, polyphenols, nutrients' },
    { id: 'meal_2', category: 'nutrition', title: 'Nutty Pudding', time: '09:00', impact: 'Healthy fats, protein' },
    { id: 'last_meal', category: 'nutrition', title: 'Final meal (if eating)', time: '11:00', impact: 'Eating window closes' },

    // Evening
    { id: 'wind_down', category: 'sleep', title: 'Begin wind-down (no screens)', time: '19:30', impact: 'Melatonin protection' },
    { id: 'skincare_pm', category: 'skincare', title: 'Evening skincare routine', time: '20:00', impact: 'Skin repair' },
    { id: 'sleep', category: 'sleep', title: 'In bed, lights out', time: '20:30', impact: '8.5h sleep opportunity' }
];
