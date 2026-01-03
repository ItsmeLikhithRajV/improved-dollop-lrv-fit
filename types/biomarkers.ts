/**
 * Biomarker Types - Comprehensive Athlete Blood Work Tracking
 * 
 * Based on:
 * - Bryan Johnson Blueprint biomarker targets
 * - InsideTracker and similar platforms
 * - Overtraining syndrome research
 */

// ============================================================================
// BIOMARKER CATEGORIES
// ============================================================================

export type BiomarkerCategory =
    | 'metabolic'
    | 'cardiovascular'
    | 'inflammatory'
    | 'hormonal'
    | 'performance'
    | 'organ_function'
    | 'nutritional'
    | 'recovery';

// ============================================================================
// INDIVIDUAL BIOMARKER
// ============================================================================

export interface Biomarker {
    id: string;
    name: string;
    short_name: string;
    category: BiomarkerCategory;
    unit: string;

    // Reference ranges
    reference: {
        low: number;
        normal_low: number;
        optimal_low: number;
        optimal_high: number;
        normal_high: number;
        high: number;
    };

    // Blueprint protocol targets (if applicable)
    blueprint_target?: string;

    // When value is concerning
    action_thresholds: {
        critical_low?: number;
        critical_high?: number;
        retest_if_outside?: boolean;
    };

    // Context
    description: string;
    impact_low: string;
    impact_high: string;
    improvement_tips: string[];

    // Athlete-specific considerations
    athlete_notes?: string;
}

// ============================================================================
// BIOMARKER READING
// ============================================================================

export interface BiomarkerReading {
    biomarker_id: string;
    value: number;
    date: string;
    fasting: boolean;
    post_exercise_hours?: number;
    lab_name?: string;
    notes?: string;
}

export type BiomarkerStatus = 'critical_low' | 'low' | 'normal' | 'optimal' | 'high' | 'critical_high';

export interface BiomarkerAnalysis {
    biomarker: Biomarker;
    current_value: number;
    date: string;
    status: BiomarkerStatus;
    percentile: number;  // Where in the range (0-100)

    // Trends
    previous_value?: number;
    trend: 'improving' | 'stable' | 'worsening';
    trend_percentage?: number;

    // Recommendations
    recommendation?: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
}

// ============================================================================
// BIOMARKER PANEL (GROUP OF RELATED MARKERS)
// ============================================================================

export interface BiomarkerPanel {
    id: string;
    name: string;
    description: string;
    biomarkers: string[];  // biomarker IDs
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually';
}

// ============================================================================
// PREDEFINED BIOMARKERS
// ============================================================================

export const BIOMARKER_DEFINITIONS: Biomarker[] = [
    // METABOLIC
    {
        id: 'glucose_fasting',
        name: 'Fasting Glucose',
        short_name: 'Glucose',
        category: 'metabolic',
        unit: 'mg/dL',
        reference: {
            low: 50,
            normal_low: 70,
            optimal_low: 70,
            optimal_high: 90,
            normal_high: 100,
            high: 126
        },
        blueprint_target: '70-90',
        action_thresholds: {
            critical_low: 50,
            critical_high: 126,
            retest_if_outside: true
        },
        description: 'Primary energy source. Indicates metabolic health.',
        impact_low: 'Hypoglycemia, fatigue, poor concentration',
        impact_high: 'Insulin resistance, pre-diabetes risk',
        improvement_tips: ['Reduce refined carbs', 'Increase fiber', 'Regular exercise', 'Adequate sleep'],
        athlete_notes: 'Can be transiently elevated 24-48h after intense training'
    },
    {
        id: 'hba1c',
        name: 'Hemoglobin A1c',
        short_name: 'HbA1c',
        category: 'metabolic',
        unit: '%',
        reference: {
            low: 3.5,
            normal_low: 4.0,
            optimal_low: 4.5,
            optimal_high: 5.4,
            normal_high: 5.7,
            high: 6.5
        },
        blueprint_target: '<5.4',
        action_thresholds: {
            critical_high: 6.5,
            retest_if_outside: true
        },
        description: '3-month average blood sugar. Gold standard for glucose control.',
        impact_low: 'Rare, possible frequent hypoglycemia',
        impact_high: 'Increased diabetes risk, accelerated aging',
        improvement_tips: ['Carbohydrate timing', 'Zone 2 training', 'Sleep optimization', 'Stress management']
    },
    {
        id: 'fasting_insulin',
        name: 'Fasting Insulin',
        short_name: 'Insulin',
        category: 'metabolic',
        unit: 'μIU/mL',
        reference: {
            low: 1,
            normal_low: 2,
            optimal_low: 2,
            optimal_high: 6,
            normal_high: 15,
            high: 25
        },
        blueprint_target: '<6',
        action_thresholds: {
            critical_high: 25,
            retest_if_outside: true
        },
        description: 'Hormone regulating blood sugar. Marker of insulin sensitivity.',
        impact_low: 'Uncommon, possible type 1 diabetes',
        impact_high: 'Insulin resistance, fat storage, inflammation',
        improvement_tips: ['Intermittent fasting', 'Reduce refined carbs', 'Strength training', 'Sleep 7-9h']
    },

    // CARDIOVASCULAR
    {
        id: 'apob',
        name: 'Apolipoprotein B',
        short_name: 'ApoB',
        category: 'cardiovascular',
        unit: 'mg/dL',
        reference: {
            low: 40,
            normal_low: 50,
            optimal_low: 50,
            optimal_high: 80,
            normal_high: 100,
            high: 130
        },
        blueprint_target: '<80',
        action_thresholds: {
            critical_high: 130,
            retest_if_outside: true
        },
        description: 'Best predictor of cardiovascular risk. Each particle carries one ApoB.',
        impact_low: 'Rare, not typically concerning',
        impact_high: 'Increased atherosclerosis and heart disease risk',
        improvement_tips: ['Reduce saturated fat', 'Increase fiber', 'Consider statin if needed', 'PCSK9 inhibitors']
    },
    {
        id: 'ldl',
        name: 'LDL Cholesterol',
        short_name: 'LDL',
        category: 'cardiovascular',
        unit: 'mg/dL',
        reference: {
            low: 40,
            normal_low: 50,
            optimal_low: 50,
            optimal_high: 100,
            normal_high: 130,
            high: 190
        },
        blueprint_target: '<100',
        action_thresholds: {
            critical_high: 190,
            retest_if_outside: true
        },
        description: 'Primary cholesterol carrier. Associated with plaque buildup.',
        impact_low: 'Very low may impact hormone production',
        impact_high: 'Atherosclerosis, cardiovascular disease risk',
        improvement_tips: ['Mediterranean diet', 'Reduce saturated fat', 'Increase soluble fiber', 'Plant sterols'],
        athlete_notes: 'Endurance athletes often have favorable HDL that offsets moderate LDL'
    },
    {
        id: 'hdl',
        name: 'HDL Cholesterol',
        short_name: 'HDL',
        category: 'cardiovascular',
        unit: 'mg/dL',
        reference: {
            low: 30,
            normal_low: 40,
            optimal_low: 60,
            optimal_high: 90,
            normal_high: 100,
            high: 120
        },
        blueprint_target: '>60',
        action_thresholds: {
            critical_low: 30,
            retest_if_outside: true
        },
        description: 'Protective cholesterol. Removes LDL from arteries.',
        impact_low: 'Reduced cardiovascular protection',
        impact_high: 'Generally beneficial, very high may have diminishing returns',
        improvement_tips: ['Regular aerobic exercise', 'Moderate alcohol', 'Omega-3 fats', 'Quit smoking'],
        athlete_notes: 'Athletes typically have elevated HDL due to exercise'
    },
    {
        id: 'triglycerides',
        name: 'Triglycerides',
        short_name: 'TG',
        category: 'cardiovascular',
        unit: 'mg/dL',
        reference: {
            low: 30,
            normal_low: 40,
            optimal_low: 40,
            optimal_high: 70,
            normal_high: 150,
            high: 500
        },
        blueprint_target: '<70',
        action_thresholds: {
            critical_high: 500,
            retest_if_outside: true
        },
        description: 'Fat in blood from diet. Reflects recent carb/fat intake.',
        impact_low: 'Uncommon, not concerning',
        impact_high: 'Cardiovascular risk, metabolic dysfunction, pancreatitis if very high',
        improvement_tips: ['Reduce sugar and refined carbs', 'Limit alcohol', 'Omega-3 supplementation', 'Aerobic exercise']
    },

    // INFLAMMATORY
    {
        id: 'hscrp',
        name: 'High-Sensitivity C-Reactive Protein',
        short_name: 'hsCRP',
        category: 'inflammatory',
        unit: 'mg/L',
        reference: {
            low: 0,
            normal_low: 0,
            optimal_low: 0,
            optimal_high: 0.5,
            normal_high: 1.0,
            high: 3.0
        },
        blueprint_target: '<0.5',
        action_thresholds: {
            critical_high: 10, // May indicate infection
            retest_if_outside: true
        },
        description: 'Marker of systemic inflammation. Correlates with cardiovascular risk.',
        impact_low: 'Not applicable',
        impact_high: 'Chronic inflammation, increased disease risk',
        improvement_tips: ['Anti-inflammatory diet', 'Omega-3s', 'Sleep optimization', 'Stress reduction', 'Weight management'],
        athlete_notes: 'Transiently elevated 24-72h after intense exercise. Test >72h post-training.'
    },
    {
        id: 'homocysteine',
        name: 'Homocysteine',
        short_name: 'Hcy',
        category: 'inflammatory',
        unit: 'μmol/L',
        reference: {
            low: 4,
            normal_low: 5,
            optimal_low: 5,
            optimal_high: 7,
            normal_high: 12,
            high: 15
        },
        blueprint_target: '<7',
        action_thresholds: {
            critical_high: 15,
            retest_if_outside: true
        },
        description: 'Amino acid linked to cardiovascular and neurological health.',
        impact_low: 'Not typically concerning',
        impact_high: 'Cardiovascular risk, cognitive decline, B-vitamin deficiency',
        improvement_tips: ['B12 supplementation', 'Folate-rich foods', 'B6 supplementation', 'Reduce alcohol']
    },

    // HORMONAL
    {
        id: 'testosterone_total',
        name: 'Total Testosterone',
        short_name: 'T',
        category: 'hormonal',
        unit: 'ng/dL',
        reference: {
            low: 200,
            normal_low: 300,
            optimal_low: 500,
            optimal_high: 900,
            normal_high: 1000,
            high: 1200
        },
        action_thresholds: {
            critical_low: 200,
            retest_if_outside: true
        },
        description: 'Primary male hormone. Key for muscle, mood, energy, and recovery.',
        impact_low: 'Fatigue, muscle loss, mood issues, decreased recovery',
        impact_high: 'Usually only with supplementation. Can affect cardiovascular risk.',
        improvement_tips: ['Adequate sleep', 'Strength training', 'Healthy fats', 'Zinc supplementation', 'Stress management'],
        athlete_notes: 'Can be suppressed by overtraining, caloric deficit, or poor sleep'
    },
    {
        id: 'cortisol_am',
        name: 'Cortisol (Morning)',
        short_name: 'Cortisol',
        category: 'hormonal',
        unit: 'μg/dL',
        reference: {
            low: 5,
            normal_low: 10,
            optimal_low: 10,
            optimal_high: 20,
            normal_high: 25,
            high: 30
        },
        action_thresholds: {
            critical_low: 3,
            critical_high: 35,
            retest_if_outside: true
        },
        description: 'Stress hormone. Should be high in AM, low in PM.',
        impact_low: 'Adrenal fatigue, chronic fatigue, overtraining',
        impact_high: 'Chronic stress, muscle breakdown, impaired recovery',
        improvement_tips: ['Stress management', 'Adequate sleep', 'Adaptogenic herbs', 'Proper training periodization'],
        athlete_notes: 'Chronically elevated = overtraining. Blunted response = advanced overtraining.'
    },

    // PERFORMANCE/RECOVERY
    {
        id: 'creatine_kinase',
        name: 'Creatine Kinase',
        short_name: 'CK',
        category: 'recovery',
        unit: 'U/L',
        reference: {
            low: 20,
            normal_low: 30,
            optimal_low: 50,
            optimal_high: 200,
            normal_high: 500,
            high: 1000
        },
        action_thresholds: {
            critical_high: 10000, // Rhabdomyolysis risk
            retest_if_outside: true
        },
        description: 'Enzyme released with muscle damage. Indicates recovery status.',
        impact_low: 'Low training stimulus',
        impact_high: 'Muscle damage, insufficient recovery, overtraining',
        improvement_tips: ['Adequate recovery between sessions', 'Protein intake', 'Sleep', 'Gradual load progression'],
        athlete_notes: 'Normally elevated 2-7 days post-intense training. Chronic elevation is concerning.'
    },
    {
        id: 'ferritin',
        name: 'Ferritin',
        short_name: 'Ferritin',
        category: 'nutritional',
        unit: 'ng/mL',
        reference: {
            low: 15,
            normal_low: 30,
            optimal_low: 50,
            optimal_high: 150,
            normal_high: 300,
            high: 400
        },
        action_thresholds: {
            critical_low: 12,
            critical_high: 500,
            retest_if_outside: true
        },
        description: 'Iron storage protein. Key for oxygen transport and energy.',
        impact_low: 'Fatigue, decreased performance, anemia risk',
        impact_high: 'Iron overload, inflammation (unless acute stress)',
        improvement_tips: ['Iron-rich foods', 'Vitamin C with iron', 'Consider supplementation if deficient', 'Avoid tea/coffee with iron meals'],
        athlete_notes: 'Female and endurance athletes at higher risk of deficiency. Falsely elevated after intense exercise.'
    },
    {
        id: 'vitamin_d',
        name: 'Vitamin D (25-OH)',
        short_name: 'Vit D',
        category: 'nutritional',
        unit: 'ng/mL',
        reference: {
            low: 10,
            normal_low: 30,
            optimal_low: 40,
            optimal_high: 60,
            normal_high: 80,
            high: 100
        },
        blueprint_target: '40-60',
        action_thresholds: {
            critical_low: 10,
            critical_high: 100,
            retest_if_outside: true
        },
        description: 'Actually a hormone. Critical for bones, immunity, mood, and performance.',
        impact_low: 'Bone weakness, decreased immunity, depression, muscle weakness',
        impact_high: 'Possible toxicity, hypercalcemia (rare)',
        improvement_tips: ['Sun exposure', 'Vitamin D3 supplementation (2000-5000 IU)', 'Fatty fish', 'Fortified foods'],
        athlete_notes: 'Many athletes are deficient, especially in winter or indoor sports'
    }
];

// ============================================================================
// PREDEFINED PANELS
// ============================================================================

export const BIOMARKER_PANELS: BiomarkerPanel[] = [
    {
        id: 'metabolic',
        name: 'Metabolic Health',
        description: 'Blood sugar control and insulin sensitivity',
        biomarkers: ['glucose_fasting', 'hba1c', 'fasting_insulin'],
        frequency: 'quarterly'
    },
    {
        id: 'cardiovascular',
        name: 'Cardiovascular Risk',
        description: 'Heart disease and lipid markers',
        biomarkers: ['apob', 'ldl', 'hdl', 'triglycerides'],
        frequency: 'quarterly'
    },
    {
        id: 'inflammation',
        name: 'Inflammation',
        description: 'Systemic inflammation markers',
        biomarkers: ['hscrp', 'homocysteine'],
        frequency: 'quarterly'
    },
    {
        id: 'hormones',
        name: 'Hormonal Balance',
        description: 'Key anabolic and stress hormones',
        biomarkers: ['testosterone_total', 'cortisol_am'],
        frequency: 'quarterly'
    },
    {
        id: 'recovery',
        name: 'Recovery Status',
        description: 'Overtraining and recovery markers',
        biomarkers: ['creatine_kinase', 'cortisol_am', 'testosterone_total'],
        frequency: 'monthly'
    },
    {
        id: 'nutrition',
        name: 'Nutritional Status',
        description: 'Key micronutrients',
        biomarkers: ['ferritin', 'vitamin_d'],
        frequency: 'quarterly'
    }
];

// ============================================================================
// COMPLETE ANALYSIS OUTPUT
// ============================================================================

export interface BiomarkerDashboardOutput {
    last_test_date: string;
    next_recommended_test: string;
    panels: {
        panel: BiomarkerPanel;
        score: number;
        status: 'optimal' | 'good' | 'needs_attention' | 'critical';
        markers: BiomarkerAnalysis[];
    }[];
    critical_alerts: BiomarkerAnalysis[];
    improvement_priorities: {
        biomarker: Biomarker;
        current_status: BiomarkerStatus;
        recommendations: string[];
    }[];
    overall_score: number;
}
