/**
 * Goal Fuel Science
 * 
 * Scientific research references and explanations for goal-specific
 * nutrition protocols. Used in FuelTab to explain "why" behind recommendations.
 */

import { GoalType, GOAL_PROTOCOLS } from '../../types/goals';

// =====================================================
// SCIENTIFIC RESEARCH FOR EACH GOAL
// =====================================================

export interface GoalScienceData {
    title: string;
    summary: string;
    keyPrinciples: string[];
    macroRationale: {
        protein: string;
        carbs: string;
        fat: string;
    };
    timingStrategy: string;
    studyReferences: StudyReference[];
    supplementScience: SupplementInfo[];
    practicalTips: string[];
}

export interface StudyReference {
    title: string;
    authors: string;
    year: number;
    key_finding: string;
}

export interface SupplementInfo {
    name: string;
    dosage: string;
    timing: string;
    evidence_level: 'strong' | 'moderate' | 'promising';
    mechanism: string;
}

export const GOAL_FUEL_SCIENCE: Record<GoalType, GoalScienceData> = {
    fat_loss: {
        title: 'Fat Loss Nutrition Protocol',
        summary: 'Maximize fat oxidation while preserving lean muscle mass through strategic protein intake and moderate caloric deficit.',
        keyPrinciples: [
            'Preserve muscle with high protein (2.0-2.4g/kg)',
            'Moderate deficit (-400 kcal) to avoid metabolic adaptation',
            'Lower carbs to increase fat utilization',
            'Protein timing at each meal to maintain MPS'
        ],
        macroRationale: {
            protein: 'High protein (2.0-2.4g/kg) prevents muscle loss during deficit. Research shows protein needs INCREASE during caloric restriction to maintain nitrogen balance.',
            carbs: 'Lower carbohydrate intake (2-4g/kg) improves metabolic flexibility and fat oxidation. Consider carb cycling around training days.',
            fat: 'Moderate fat (0.8-1.2g/kg) maintains hormonal function. Don\'t go too low or testosterone/estrogen production suffers.'
        },
        timingStrategy: 'Fasted training optional for enhanced fat oxidation. Protein distribution: 4-5 meals of 30-40g protein. Consider time-restricted eating (16:8) if sustainable.',
        studyReferences: [
            { title: 'Higher protein intake preserves lean mass in energy deficit', authors: 'Helms et al.', year: 2014, key_finding: 'Protein at 2.3-3.1 g/kg preserves FFM during hypocaloric periods' },
            { title: 'Slow weight loss preserves muscle mass', authors: 'Garthe et al.', year: 2011, key_finding: '0.7% BW loss/week vs 1.4% resulted in more LBM retention' },
            { title: 'Protein distribution and muscle synthesis', authors: 'Mamerow et al.', year: 2014, key_finding: 'Even protein distribution across meals increases MPS by 25%' }
        ],
        supplementScience: [
            { name: 'Caffeine', dosage: '3-6mg/kg', timing: '30-60min pre-workout', evidence_level: 'strong', mechanism: 'Increases lipolysis and fat oxidation during exercise' },
            { name: 'Protein Powder', dosage: 'To hit protein targets', timing: 'Post-workout or meal replacement', evidence_level: 'strong', mechanism: 'Convenient high-quality protein to hit targets in deficit' },
            { name: 'Fiber/Psyllium', dosage: '10-15g/day', timing: 'With meals', evidence_level: 'moderate', mechanism: 'Increases satiety, reduces caloric intake' }
        ],
        practicalTips: [
            'Prioritize protein at breakfast to control hunger',
            'Refeed days (higher carbs) every 7-14 days',
            'High-volume, low-cal foods: veggies, broth-based soups',
            'Prep protein snacks: boiled eggs, Greek yogurt'
        ]
    },

    muscle_gain: {
        title: 'Muscle Gain Nutrition Protocol',
        summary: 'Maximize muscle protein synthesis through caloric surplus, optimal protein timing, and strategic carbohydrate intake around training.',
        keyPrinciples: [
            'Moderate surplus (+300 kcal) for lean gains',
            'Protein threshold: 1.8-2.2g/kg',
            'High carbs to fuel training and MPS',
            'Post-workout window is CRITICAL'
        ],
        macroRationale: {
            protein: 'Target 1.8-2.2g/kg. Beyond 2.2g/kg shows diminishing returns. Focus on leucine-rich sources (whey, eggs, meat).',
            carbs: 'High carbohydrate intake (5-7g/kg) for glycogen replenishment, insulin spike for MPS, and training performance.',
            fat: 'Moderate fat (0.8-1.2g/kg) for hormonal support. Too low impairs testosterone production.'
        },
        timingStrategy: 'Pre-workout: 20-40g protein + carbs 2h before. CRITICAL 30-minute post-workout window: 40g protein + 60-80g fast carbs. Protein every 3-4 hours (4-5 meals).',
        studyReferences: [
            { title: 'Muscle protein synthesis and protein dose', authors: 'Moore et al.', year: 2009, key_finding: '20-40g protein maximally stimulates MPS post-workout' },
            { title: 'Post-exercise nutrient timing', authors: 'Aragon & Schoenfeld', year: 2013, key_finding: 'Anabolic window exists but is larger than previously thought (~4-6h)' },
            { title: 'Creatine and muscle mass', authors: 'Kreider et al.', year: 2017, key_finding: 'Creatine increases lean mass by 1-2kg over 4-12 weeks' },
            { title: 'Progressive overload and nutrition', authors: 'Schoenfeld', year: 2010, key_finding: 'Mechanical tension + adequate nutrition = hypertrophy' }
        ],
        supplementScience: [
            { name: 'Creatine Monohydrate', dosage: '3-5g/day', timing: 'Any time (consistency matters)', evidence_level: 'strong', mechanism: 'Increases phosphocreatine, power output, and cell volumization' },
            { name: 'HMB', dosage: '3g/day', timing: 'Split doses with meals', evidence_level: 'moderate', mechanism: 'Anti-catabolic, may enhance recovery in trained individuals' },
            { name: 'Leucine', dosage: '2-3g per meal', timing: 'With each protein meal', evidence_level: 'strong', mechanism: 'Key trigger for mTOR activation and MPS' }
        ],
        practicalTips: [
            'Pre-bed casein or cottage cheese for overnight MPS',
            'Post-workout shake within 30min: whey + banana',
            'Leucine-rich foods: eggs, chicken, whey, beef',
            'Eat protein every 3-4 hours (4-5 meals)'
        ]
    },

    endurance: {
        title: 'Endurance Nutrition Protocol',
        summary: 'Maximize glycogen stores, optimize substrate utilization, and support recovery for high-volume aerobic training.',
        keyPrinciples: [
            'Very high carbs (6-10g/kg depending on volume)',
            'Moderate protein (1.4-1.8g/kg)',
            'Periodize nutrition with training phases',
            'Glycogen window post-workout is CRITICAL'
        ],
        macroRationale: {
            protein: 'Target 1.4-1.8g/kg for repair and enzyme synthesis. Endurance athletes often UNDER-eat protein - prioritize post-workout.',
            carbs: 'THE primary fuel source. 6-10g/kg depending on training volume. Low-carb approaches impair high-intensity performance.',
            fat: 'Train low, compete high strategy: occasional low-carb sessions for metabolic flexibility, but race on full glycogen.'
        },
        timingStrategy: 'Pre-workout (3-4h): Large carb meal. During (>60min): 30-60g carbs/hour. Post-workout: IMMEDIATE carbs + protein (1.2g carbs/kg + 0.3g protein/kg) within 30min.',
        studyReferences: [
            { title: 'Glycogen resynthesis post-exercise', authors: 'Ivy et al.', year: 1988, key_finding: 'Glycogen synthesis 2x faster when carbs consumed immediately post-exercise' },
            { title: 'Carbohydrate periodization', authors: 'Impey et al.', year: 2018, key_finding: '"Train low, compete high" improves metabolic flexibility' },
            { title: 'Beet juice and endurance', authors: 'Jones et al.', year: 2018, key_finding: 'Dietary nitrates improve time trial performance by 1-3%' }
        ],
        supplementScience: [
            { name: 'Beetroot Juice (Nitrates)', dosage: '500ml or 400mg nitrates', timing: '2-3h pre-exercise', evidence_level: 'strong', mechanism: 'Reduces oxygen cost, improves efficiency' },
            { name: 'Caffeine', dosage: '3-6mg/kg', timing: '60min pre-exercise', evidence_level: 'strong', mechanism: 'Reduces perceived exertion, spares glycogen' },
            { name: 'Sodium/Electrolytes', dosage: 'To match sweat losses', timing: 'During and post', evidence_level: 'strong', mechanism: 'Maintain fluid balance and muscle function' }
        ],
        practicalTips: [
            'Carb-load 36-48h before key races (8-12g/kg/day)',
            'Practice race nutrition in training',
            'Post-long-run: prioritize carbs > protein (ratio 3:1)',
            'During sessions >60min: 30-60g carbs/hour'
        ]
    },

    weight_loss: {
        title: 'Weight Loss Nutrition Protocol',
        summary: 'Create sustainable caloric deficit for total body weight reduction while maintaining essential nutrients.',
        keyPrinciples: [
            'Larger deficit (-600 kcal) sustainable short-term',
            'Protein remains high to preserve muscle',
            'Low-to-moderate carbs for appetite control',
            'Focus on food volume (vegetables, lean protein)'
        ],
        macroRationale: {
            protein: 'Protein (1.6-2.0g/kg) is ESSENTIAL even in aggressive deficit. Preserves muscle and increases satiety.',
            carbs: 'Lower carbs help control appetite. Focus on fiber-rich sources (vegetables, legumes, whole grains).',
            fat: 'Moderate fat for satiety and hormone function. Avoid very low fat diets.'
        },
        timingStrategy: 'Flexible meal timing works for weight loss. Some benefit from intermittent fasting (simplifies calorie control). Prioritize protein at each eating occasion.',
        studyReferences: [
            { title: 'Protein and satiety', authors: 'Paddon-Jones et al.', year: 2008, key_finding: 'Higher protein diets increase satiety hormones' },
            { title: 'Rate of weight loss and muscle retention', authors: 'Garthe et al.', year: 2011, key_finding: 'Slower weight loss (0.7%/week) preserves more muscle' },
            { title: 'Fiber and weight management', authors: 'Slavin et al.', year: 2005, key_finding: 'Increased fiber intake associated with lower body weight' }
        ],
        supplementScience: [
            { name: 'Protein Powder', dosage: 'As needed for targets', timing: 'Meal replacement or snack', evidence_level: 'strong', mechanism: 'Helps hit protein in reduced calories' },
            { name: 'Fiber Supplement', dosage: '5-10g', timing: 'Before meals', evidence_level: 'moderate', mechanism: 'Increases fullness, reduces meal size' },
            { name: 'Caffeine', dosage: '100-200mg', timing: 'Morning, before workouts', evidence_level: 'moderate', mechanism: 'Mild appetite suppression, metabolic boost' }
        ],
        practicalTips: [
            'Track food intake (apps like MyFitnessPal)',
            'Eat protein first at each meal',
            'Plan for social situations (don\'t wing it)',
            'Weekly weigh-ins, monthly progress photos'
        ]
    },

    weight_gain: {
        title: 'Weight Gain Nutrition Protocol',
        summary: 'Maximize caloric surplus with clean, nutrient-dense foods to support mass gain.',
        keyPrinciples: [
            'Large surplus (+600 kcal)',
            'Very high carbs and adequate protein',
            'Frequent meals to hit calorie targets',
            'Post-workout nutrition critical'
        ],
        macroRationale: {
            protein: 'Protein (1.6-2.0g/kg) supports tissue growth. Beyond this, extra calories should come from carbs.',
            carbs: 'Very high carbs (6-8g/kg) for energy and anabolic insulin response.',
            fat: 'Moderate-to-high fat adds calories efficiently without excessive food volume.'
        },
        timingStrategy: '5-6 meals per day. Never skip breakfast. Large post-workout meal. Pre-bed snack (casein, cottage cheese, nut butter).',
        studyReferences: [
            { title: 'Energy surplus for muscle gain', authors: 'Slater et al.', year: 2019, key_finding: 'Surplus of 350-500 kcal optimal for lean mass gains' },
            { title: 'Meal frequency and anabolism', authors: 'Areta et al.', year: 2013, key_finding: '20g protein every 3h optimizes daily MPS' }
        ],
        supplementScience: [
            { name: 'Creatine', dosage: '5g/day', timing: 'Any time', evidence_level: 'strong', mechanism: 'Adds water weight and supports training intensity' },
            { name: 'Mass Gainer', dosage: 'As needed', timing: 'Between meals', evidence_level: 'moderate', mechanism: 'Convenient way to add calories' }
        ],
        practicalTips: [
            'Eat even when not hungry (schedule meals)',
            'Liquid calories are easier (shakes, milk)',
            'Add healthy fats: olive oil, avocado, nut butter',
            'Pre-bed snack: cottage cheese, peanut butter'
        ]
    },

    explosive_power: {
        title: 'Power Athlete Nutrition Protocol',
        summary: 'Fuel explosive movements with adequate carbs and protein while maintaining optimal body composition.',
        keyPrinciples: [
            'Maintenance calories with quality nutrition',
            'Moderate-high protein for CNS recovery',
            'Adequate carbs for fast-twitch fiber performance',
            'CNS recovery prioritized'
        ],
        macroRationale: {
            protein: 'Protein (1.8-2.2g/kg) for neuromuscular recovery and tissue repair.',
            carbs: 'Moderate carbs (4-6g/kg) to fuel power output without excess mass.',
            fat: 'Moderate fat supports hormones. Omega-3s for inflammation.'
        },
        timingStrategy: 'Pre-workout carbs (2h before) for glycogen. Post-workout protein + carbs within 1 hour.',
        studyReferences: [
            { title: 'Creatine and power output', authors: 'Rawson & Volek', year: 2003, key_finding: 'Creatine improves peak power by 5-15%' },
            { title: 'Sleep and athletic performance', authors: 'Mah et al.', year: 2011, key_finding: 'Sleep extension improves sprint times and reaction time' }
        ],
        supplementScience: [
            { name: 'Creatine', dosage: '5g/day', timing: 'Daily', evidence_level: 'strong', mechanism: 'Improves phosphocreatine regeneration for repeated power efforts' },
            { name: 'Caffeine', dosage: '3-6mg/kg', timing: '60min pre-performance', evidence_level: 'strong', mechanism: 'Enhances CNS activation and power output' },
            { name: 'Beta-Alanine', dosage: '3-6g/day', timing: 'Split doses', evidence_level: 'moderate', mechanism: 'Buffers lactic acid in repeated sprints' }
        ],
        practicalTips: [
            'Light, easily digestible pre-competition meal',
            'Caffeine 60min before explosive work',
            'Post-session: protein + moderate carbs',
            'Stay hydrated - dehydration kills power output'
        ]
    },

    hybrid: {
        title: 'Hybrid Athlete Nutrition Protocol',
        summary: 'Balance the conflicting demands of strength and endurance through periodized nutrition.',
        keyPrinciples: [
            'Carb cycling based on training type',
            'High protein consistently',
            'Slight surplus for concurrent training',
            'Periodize nutrition with training blocks'
        ],
        macroRationale: {
            protein: 'Higher protein (1.8-2.2g/kg) due to dual training demands.',
            carbs: 'CYCLE carbs: Higher on cardio days (6-8g/kg), moderate on strength days (4-5g/kg).',
            fat: 'Moderate fat provides sustained energy for varied training.'
        },
        timingStrategy: 'Match nutrition to the day\'s primary workout. If morning cardio + evening strength: carbs breakfast, moderate lunch, protein-focused dinner.',
        studyReferences: [
            { title: 'Concurrent training and nutrition', authors: 'Fyfe et al.', year: 2018, key_finding: 'Adequate carbs and protein partially offset interference effect' },
            { title: 'AMPK/mTOR interference', authors: 'Baar et al.', year: 2014, key_finding: 'Timing nutrition strategically can mitigate pathway interference' }
        ],
        supplementScience: [
            { name: 'Creatine', dosage: '5g/day', timing: 'Daily', evidence_level: 'strong', mechanism: 'Supports both strength and repeated sprint performance' },
            { name: 'Protein', dosage: 'High quality, 2g/kg+', timing: 'Distributed', evidence_level: 'strong', mechanism: 'Supports dual recovery demands' },
            { name: 'Electrolytes', dosage: 'As needed', timing: 'During/post cardio', evidence_level: 'moderate', mechanism: 'Replace sweat losses from cardio volume' }
        ],
        practicalTips: [
            'Higher carbs on cardio days (6-8g/kg)',
            'Lower carbs on strength days (4-5g/kg)',
            'Post-cardio: prioritize carbs for glycogen',
            'Post-strength: prioritize protein for MPS'
        ]
    },

    longevity: {
        title: 'Longevity Nutrition Protocol',
        summary: 'Optimize healthspan through anti-inflammatory nutrition, moderate restriction, and nutrient density.',
        keyPrinciples: [
            'Slight caloric restriction for longevity benefits',
            'Anti-inflammatory food choices',
            'Adequate protein for age-related muscle preservation',
            'Nutrient density over calorie density'
        ],
        macroRationale: {
            protein: 'Protein (1.4-1.8g/kg) prevents sarcopenia. Prioritize plant + fish sources.',
            carbs: 'Moderate carbs from whole sources. Avoid processed/refined carbs.',
            fat: 'Emphasize omega-3s and monounsaturated fats. Minimize saturated and trans fats.'
        },
        timingStrategy: 'Consider time-restricted eating (12-14h eating window). Avoid eating 2-3 hours before bed.',
        studyReferences: [
            { title: 'Caloric restriction and longevity', authors: 'Mattison et al.', year: 2017, key_finding: 'CR without malnutrition extends healthspan in primates' },
            { title: 'Mediterranean diet and mortality', authors: 'Estruch et al.', year: 2013, key_finding: 'Mediterranean diet reduces cardiovascular events by 30%' },
            { title: 'Omega-3 and inflammation', authors: 'Calder et al.', year: 2017, key_finding: 'EPA/DHA reduce inflammatory markers in healthy adults' }
        ],
        supplementScience: [
            { name: 'Omega-3 (Fish Oil)', dosage: '2-3g EPA+DHA', timing: 'With meals', evidence_level: 'strong', mechanism: 'Anti-inflammatory, cardiovascular and brain health' },
            { name: 'Vitamin D', dosage: '2000-5000 IU', timing: 'Morning with fat', evidence_level: 'strong', mechanism: 'Immune function, bone health, mood' },
            { name: 'Protein', dosage: '1.4-1.8g/kg', timing: 'Evenly distributed', evidence_level: 'strong', mechanism: 'Prevents age-related muscle loss' }
        ],
        practicalTips: [
            'Eat the rainbow (diverse plant colors)',
            'Prioritize fish 2-3x per week',
            'Minimize ultra-processed foods',
            'Consider periodic fasting (16:8 or 5:2)',
            'Stay active - movement enhances nutrition benefits'
        ]
    }
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get the science data for a specific goal
 */
export const getGoalFuelScience = (goal: GoalType): GoalScienceData => {
    return GOAL_FUEL_SCIENCE[goal];
};

/**
 * Get protocol specifics from GOAL_PROTOCOLS
 */
export const getGoalFuelProtocol = (goal: GoalType) => {
    return GOAL_PROTOCOLS[goal].fuel;
};

/**
 * Get a summary suitable for display
 */
export const getGoalFuelSummary = (goal: GoalType): {
    title: string;
    carbStrategy: string;
    proteinRange: string;
    caloricTarget: string;
    keyFocus: string;
} => {
    const protocol = GOAL_PROTOCOLS[goal].fuel;
    const science = GOAL_FUEL_SCIENCE[goal];

    return {
        title: science.title,
        carbStrategy: protocol.carbStrategy,
        proteinRange: `${protocol.proteinPerKg[0]}-${protocol.proteinPerKg[1]} g/kg`,
        caloricTarget: protocol.caloricBalance > 0
            ? `+${protocol.caloricBalance} kcal (surplus)`
            : protocol.caloricBalance < 0
                ? `${protocol.caloricBalance} kcal (deficit)`
                : 'Maintenance',
        keyFocus: science.keyPrinciples[0]
    };
};
