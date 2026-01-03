/**
 * Comprehensive Goal-Aware Recovery Protocols
 * Deep research integration for all recovery modalities
 */

import { GoalType } from '../../types/goals';

// Recovery Modality Types
export type RecoveryModality =
    | 'cold_water_immersion'
    | 'sauna'
    | 'contrast_therapy'
    | 'compression'
    | 'massage'
    | 'foam_rolling'
    | 'active_recovery'
    | 'sleep_extension'
    | 'stretching'
    | 'mobility_work'
    | 'electrostimulation'
    | 'breathing_work'
    | 'meditation'
    | 'napping'
    | 'nap'
    | 'float_tank'
    | 'infrared_therapy'
    | 'percussive_therapy'
    | 'epsom_bath'
    | 'red_light_therapy'
    | 'grounding'
    | 'cold_shower'
    | 'hot_tub';

export type ModalityRecommendation = 'highly_recommend' | 'recommend' | 'neutral' | 'caution' | 'avoid';
export type TimingContext = 'post_strength' | 'post_cardio' | 'post_hiit' | 'morning' | 'evening' | 'rest_day' | 'pre_training' | 'any';

export interface ModalityProtocol {
    recommendation: ModalityRecommendation;
    timing: TimingContext[];
    duration_minutes: [number, number];  // min-max
    frequency_per_week: [number, number];
    temperature?: [number, number];  // Celsius for cold/heat
    notes: string[];
    contraindications: string[];
    scienceNote: string;
}

// Comprehensive Recovery Protocols by Goal
export const RECOVERY_PROTOCOLS: Record<GoalType, Partial<Record<RecoveryModality, ModalityProtocol>>> = {
    muscle_gain: {
        cold_water_immersion: {
            recommendation: 'avoid',
            timing: ['rest_day'],  // Never post-strength
            duration_minutes: [0, 0],
            frequency_per_week: [0, 1],
            temperature: [10, 15],
            notes: [
                'Cold exposure blunts mTOR signaling pathway',
                'Reduces muscle protein synthesis by 20-30% (Roberts et al., 2015)',
                'Attenuates satellite cell activity',
                'If used, separate from strength by 4+ hours'
            ],
            contraindications: ['Within 4 hours of strength training'],
            scienceNote: 'Cold-induced vasoconstriction reduces inflammatory signaling necessary for hypertrophy adaptation.'
        },
        sauna: {
            recommendation: 'highly_recommend',
            timing: ['evening', 'rest_day'],
            duration_minutes: [15, 25],
            frequency_per_week: [3, 5],
            temperature: [80, 100],
            notes: [
                'Increases growth hormone up to 16x (Leppäluoto et al., 1986)',
                'Enhances heat shock protein expression',
                'Improves insulin sensitivity',
                'Best used after training but not immediately after (30+ min gap)'
            ],
            contraindications: ['Immediately pre-strength (depletes glycogen)'],
            scienceNote: 'Heat stress triggers hormetic adaptation, boosting anabolic hormone production.'
        },
        contrast_therapy: {
            recommendation: 'neutral',
            timing: ['rest_day', 'evening'],
            duration_minutes: [15, 20],
            frequency_per_week: [1, 2],
            notes: [
                'Less hypertrophy-blunting than pure cold',
                'May enhance blood flow without full cold exposure',
                'Best reserved for rest days'
            ],
            contraindications: ['Same day as heavy lifting'],
            scienceNote: 'Alternating temperatures creates vascular pumping without sustained cold exposure.'
        },
        compression: {
            recommendation: 'highly_recommend',
            timing: ['post_strength', 'evening'],
            duration_minutes: [20, 40],
            frequency_per_week: [3, 7],
            notes: [
                'Reduces DOMS without blunting adaptation',
                'Enhances lymphatic drainage',
                'Pneumatic compression boots highly effective',
                'Can use during sleep (compression sleeves)'
            ],
            contraindications: [],
            scienceNote: 'Mechanical compression enhances metabolic waste clearance without affecting anabolic signaling.'
        },
        massage: {
            recommendation: 'highly_recommend',
            timing: ['post_strength', 'rest_day'],
            duration_minutes: [30, 60],
            frequency_per_week: [1, 3],
            notes: [
                'Reduces inflammation via mechanotransduction',
                'Does NOT blunt muscle growth',
                'Enhances recovery of force production',
                'Deep tissue post-session OK'
            ],
            contraindications: [],
            scienceNote: 'Massage activates PGC-1α and mitochondrial biogenesis while reducing inflammatory cytokines.'
        },
        foam_rolling: {
            recommendation: 'recommend',
            timing: ['post_strength', 'morning'],
            duration_minutes: [10, 20],
            frequency_per_week: [3, 7],
            notes: [
                'Enhances range of motion',
                'Reduces perceived soreness',
                'Pre-workout: brief (30-60s per muscle)',
                'Post-workout: extended (90-120s per muscle)'
            ],
            contraindications: [],
            scienceNote: 'Self-myofascial release improves tissue hydration and fascial glide.'
        },
        active_recovery: {
            recommendation: 'recommend',
            timing: ['rest_day', 'morning'],
            duration_minutes: [20, 40],
            frequency_per_week: [1, 3],
            notes: [
                'Light movement (walking, swimming, cycling)',
                'Keep HR below 120bpm / Zone 1',
                'Enhances blood flow without stress',
                'Do NOT turn into a workout'
            ],
            contraindications: ['High intensity on "rest" day'],
            scienceNote: 'Low-intensity movement enhances nutrient delivery without creating additional training stress.'
        },
        sleep_extension: {
            recommendation: 'highly_recommend',
            timing: ['evening'],
            duration_minutes: [480, 600],  // 8-10 hours
            frequency_per_week: [7, 7],
            notes: [
                'Growth hormone peaks during deep sleep',
                'Muscle protein synthesis elevated during sleep',
                'Sleep debt reduces testosterone by 10-15%',
                'Target 8-10 hours during heavy training blocks'
            ],
            contraindications: [],
            scienceNote: 'Sleep is the primary anabolic window; 95% of GH release occurs during N3 sleep.'
        },
        stretching: {
            recommendation: 'neutral',
            timing: ['post_strength', 'evening'],
            duration_minutes: [10, 20],
            frequency_per_week: [3, 5],
            notes: [
                'Static stretching post-workout OK',
                'Avoid aggressive static pre-workout (reduces force)',
                'Focus on tight/shortened muscles',
                'Hold 30-60 seconds per stretch'
            ],
            contraindications: ['Long static holds pre-strength work'],
            scienceNote: 'Post-exercise stretching may slightly reduce DOMS but has minimal effect on hypertrophy.'
        },
        mobility_work: {
            recommendation: 'recommend',
            timing: ['morning', 'post_strength'],
            duration_minutes: [15, 30],
            frequency_per_week: [3, 7],
            notes: [
                'Dynamic mobility preferred pre-workout',
                'Controlled articular rotations (CARs)',
                'Focus on joints involved in training',
                'Maintains movement quality'
            ],
            contraindications: [],
            scienceNote: 'Joint health and movement quality are prerequisites for progressive overload.'
        },
        electrostimulation: {
            recommendation: 'neutral',
            timing: ['rest_day', 'evening'],
            duration_minutes: [20, 30],
            frequency_per_week: [1, 3],
            notes: [
                'EMS can enhance recovery blood flow',
                'TENS for pain management',
                'Not a replacement for training',
                'Useful for isolated muscle activation'
            ],
            contraindications: ['Pacemaker', 'Pregnancy'],
            scienceNote: 'Electrical stimulation may enhance local blood flow and reduce perceived soreness.'
        },
        breathing_work: {
            recommendation: 'recommend',
            timing: ['post_strength', 'evening'],
            duration_minutes: [5, 15],
            frequency_per_week: [3, 7],
            notes: [
                'Box breathing for parasympathetic activation',
                '4-7-8 breathing for sleep',
                'Helps transition to recovery state',
                'Reduces cortisol post-training'
            ],
            contraindications: [],
            scienceNote: 'Controlled breathing activates vagal tone, shifting from sympathetic to parasympathetic dominance.'
        },
        meditation: {
            recommendation: 'recommend',
            timing: ['morning', 'evening'],
            duration_minutes: [10, 20],
            frequency_per_week: [3, 7],
            notes: [
                'Reduces cortisol chronically',
                'Improves sleep quality',
                'Enhances mind-muscle connection',
                'Supports long-term adherence'
            ],
            contraindications: [],
            scienceNote: 'Regular meditation practice reduces chronic cortisol, which can be catabolic at elevated levels.'
        },
        napping: {
            recommendation: 'highly_recommend',
            timing: ['post_strength'],
            duration_minutes: [20, 90],
            frequency_per_week: [2, 5],
            notes: [
                '20-30min power nap if sleep-deprived',
                '90min full cycle if possible',
                'Avoid napping after 3pm (sleep disruption)',
                'Napping enhances recovery markers'
            ],
            contraindications: ['Insomnia patients'],
            scienceNote: 'Napping allows additional sleep cycles for growth hormone release and neural recovery.'
        },
        float_tank: {
            recommendation: 'neutral',
            timing: ['rest_day'],
            duration_minutes: [60, 90],
            frequency_per_week: [0, 1],
            notes: [
                'Reduces cortisol and muscle tension',
                'Magnesium absorption through skin',
                'Deep relaxation state',
                'Not directly anabolic but reduces stress'
            ],
            contraindications: ['Claustrophobia'],
            scienceNote: 'Sensory deprivation reduces sympathetic nervous system activity.'
        },
        infrared_therapy: {
            recommendation: 'recommend',
            timing: ['post_strength', 'rest_day'],
            duration_minutes: [20, 40],
            frequency_per_week: [2, 4],
            notes: [
                'Penetrates deeper than traditional sauna',
                'Lower ambient temperature (40-60°C)',
                'May enhance mitochondrial function',
                'Gentle heat without dehydration stress'
            ],
            contraindications: [],
            scienceNote: 'Near-infrared light may stimulate cytochrome c oxidase, enhancing cellular ATP production.'
        },
        percussive_therapy: {
            recommendation: 'recommend',
            timing: ['post_strength', 'morning'],
            duration_minutes: [10, 20],
            frequency_per_week: [3, 7],
            notes: [
                'Theragun, Hypervolt, etc.',
                'Reduces muscle stiffness',
                '30-60 seconds per muscle group',
                'Effective for acute soreness'
            ],
            contraindications: ['Over bones', 'Open wounds'],
            scienceNote: 'Rapid percussion increases local blood flow and reduces perceived muscle tension.'
        }
    },

    // Fat Loss - Different priorities
    fat_loss: {
        cold_water_immersion: {
            recommendation: 'highly_recommend',
            timing: ['morning', 'rest_day'],
            duration_minutes: [2, 10],
            frequency_per_week: [3, 7],
            temperature: [10, 15],
            notes: [
                'Activates brown adipose tissue (BAT)',
                'Increases metabolic rate for hours post-exposure',
                'Enhances insulin sensitivity',
                'Morning cold exposure synergizes with fasting',
                'Avoid immediately post-strength if preserving muscle'
            ],
            contraindications: ['Within 2 hours of strength training'],
            scienceNote: 'Cold activates UCP1 in brown fat, increasing thermogenesis and caloric expenditure.'
        },
        sauna: {
            recommendation: 'highly_recommend',
            timing: ['post_cardio', 'evening'],
            duration_minutes: [15, 30],
            frequency_per_week: [3, 5],
            temperature: [80, 100],
            notes: [
                'Mimics cardiovascular exercise effects',
                'Increases caloric expenditure',
                'Enhances endothelial function',
                'Supports detoxification pathways',
                'Hydrate adequately'
            ],
            contraindications: [],
            scienceNote: 'Sauna use increases heart rate and metabolic rate, contributing to energy expenditure.'
        },
        contrast_therapy: {
            recommendation: 'recommend',
            timing: ['post_cardio', 'rest_day'],
            duration_minutes: [15, 25],
            frequency_per_week: [2, 4],
            notes: [
                'Vascular gymnastics improves circulation',
                'Combines benefits of cold and heat',
                'Enhances metabolic flexibility'
            ],
            contraindications: [],
            scienceNote: 'Alternating temperatures challenge thermoregulation, increasing metabolic demand.'
        },
        compression: {
            recommendation: 'recommend',
            timing: ['post_hiit', 'evening'],
            duration_minutes: [20, 40],
            frequency_per_week: [2, 5],
            notes: [
                'Reduces soreness from high-intensity work',
                'Maintains training frequency capability'
            ],
            contraindications: [],
            scienceNote: 'Compression aids recovery to maintain training volume, which drives fat loss.'
        },
        massage: {
            recommendation: 'recommend',
            timing: ['rest_day'],
            duration_minutes: [30, 60],
            frequency_per_week: [1, 2],
            notes: [
                'Reduces cortisol (which promotes fat storage)',
                'Stress management tool',
                'Lymphatic drainage benefits'
            ],
            contraindications: [],
            scienceNote: 'Chronic stress elevates cortisol, promoting visceral fat storage; massage reduces stress.'
        },
        foam_rolling: {
            recommendation: 'recommend',
            timing: ['morning', 'post_hiit'],
            duration_minutes: [10, 20],
            frequency_per_week: [3, 7],
            notes: [
                'Maintains movement quality for training',
                'Low time investment, good return'
            ],
            contraindications: [],
            scienceNote: 'Tissue quality supports training consistency, which is key for fat loss.'
        },
        active_recovery: {
            recommendation: 'highly_recommend',
            timing: ['rest_day', 'morning'],
            duration_minutes: [30, 60],
            frequency_per_week: [2, 4],
            notes: [
                'LISS contributes to caloric deficit',
                'Walking is highly underrated',
                '8,000-12,000 steps daily',
                'Enhances fat oxidation'
            ],
            contraindications: [],
            scienceNote: 'Low-intensity steady-state preferentially uses fat as fuel.'
        },
        sleep_extension: {
            recommendation: 'highly_recommend',
            timing: ['evening'],
            duration_minutes: [450, 540],  // 7.5-9 hours
            frequency_per_week: [7, 7],
            notes: [
                'Sleep debt increases ghrelin (hunger)',
                'Sleep debt decreases leptin (satiety)',
                'Poor sleep increases cravings',
                'Prioritize sleep to control appetite'
            ],
            contraindications: [],
            scienceNote: 'Sleep deprivation disrupts hunger hormones, making caloric deficit harder to maintain.'
        },
        stretching: {
            recommendation: 'neutral',
            timing: ['evening'],
            duration_minutes: [10, 20],
            frequency_per_week: [2, 4],
            notes: [
                'Stress reduction benefit',
                'Maintains flexibility for training'
            ],
            contraindications: [],
            scienceNote: 'Stretching has minimal direct fat loss benefit but supports training capacity.'
        },
        mobility_work: {
            recommendation: 'recommend',
            timing: ['morning'],
            duration_minutes: [15, 30],
            frequency_per_week: [3, 5],
            notes: [
                'Maintains movement quality',
                'Morning routine energizes the day'
            ],
            contraindications: [],
            scienceNote: 'Movement quality enables training intensity, which drives fat loss.'
        },
        electrostimulation: {
            recommendation: 'neutral',
            timing: ['rest_day'],
            duration_minutes: [20, 30],
            frequency_per_week: [0, 2],
            notes: [
                'Minor caloric benefit',
                'Recovery support'
            ],
            contraindications: ['Pacemaker'],
            scienceNote: 'EMS has minimal direct fat loss benefit.'
        },
        breathing_work: {
            recommendation: 'recommend',
            timing: ['morning', 'evening'],
            duration_minutes: [5, 15],
            frequency_per_week: [5, 7],
            notes: [
                'Reduces stress-driven eating',
                'Wim Hof method may enhance metabolism',
                'Supports sleep quality'
            ],
            contraindications: [],
            scienceNote: 'Stress management through breathwork reduces cortisol-driven fat storage.'
        },
        meditation: {
            recommendation: 'recommend',
            timing: ['morning', 'evening'],
            duration_minutes: [10, 20],
            frequency_per_week: [5, 7],
            notes: [
                'Mindful eating practices',
                'Reduces emotional eating',
                'Improves adherence to diet protocols'
            ],
            contraindications: [],
            scienceNote: 'Mindfulness reduces impulsive eating behaviors and improves dietary adherence.'
        },
        napping: {
            recommendation: 'neutral',
            timing: [],
            duration_minutes: [20, 30],
            frequency_per_week: [0, 2],
            notes: [
                'Only if sleep-deprived',
                'Avoid excessive daytime sleep',
                'May reduce NEAT if overused'
            ],
            contraindications: [],
            scienceNote: 'Excessive napping may reduce non-exercise activity thermogenesis.'
        },
        float_tank: {
            recommendation: 'neutral',
            timing: ['rest_day'],
            duration_minutes: [60, 90],
            frequency_per_week: [0, 1],
            notes: [
                'Stress reduction',
                'Not directly metabolically beneficial'
            ],
            contraindications: [],
            scienceNote: 'Primarily a stress management tool.'
        },
        infrared_therapy: {
            recommendation: 'recommend',
            timing: ['evening'],
            duration_minutes: [30, 45],
            frequency_per_week: [2, 4],
            notes: [
                'Gentle metabolic boost',
                'Supports detoxification',
                'Better tolerated than traditional sauna'
            ],
            contraindications: [],
            scienceNote: 'Infrared exposure increases metabolic rate with less thermal stress.'
        },
        percussive_therapy: {
            recommendation: 'recommend',
            timing: ['post_hiit'],
            duration_minutes: [10, 15],
            frequency_per_week: [2, 5],
            notes: [
                'Maintains training frequency',
                'Quick recovery support'
            ],
            contraindications: [],
            scienceNote: 'Percussion therapy supports training consistency.'
        }
    },

    // Endurance - Prioritize inflammation management and glycogen recovery
    endurance: {
        cold_water_immersion: {
            recommendation: 'highly_recommend',
            timing: ['post_cardio', 'post_hiit'],
            duration_minutes: [8, 15],
            frequency_per_week: [3, 5],
            temperature: [10, 15],
            notes: [
                'Reduces exercise-induced inflammation',
                'Accelerates recovery between sessions',
                'Enables higher training volume',
                'Particularly useful after long runs/rides',
                'OK to use post-cardio (different adaptation pathway)'
            ],
            contraindications: [],
            scienceNote: 'Cold water immersion reduces inflammatory markers and perceived fatigue in endurance athletes.'
        },
        sauna: {
            recommendation: 'highly_recommend',
            timing: ['post_cardio', 'evening'],
            duration_minutes: [20, 30],
            frequency_per_week: [3, 5],
            temperature: [80, 100],
            notes: [
                'Heat acclimation improves performance',
                'Increases plasma volume by 7-12%',
                'Enhances VO2max by 3-5%',
                'Improves thermoregulation efficiency',
                '3-4 weeks of consistent use for adaptation'
            ],
            contraindications: [],
            scienceNote: 'Sauna training triggers plasma volume expansion and heat shock protein upregulation.'
        },
        contrast_therapy: {
            recommendation: 'recommend',
            timing: ['post_cardio'],
            duration_minutes: [15, 25],
            frequency_per_week: [2, 4],
            notes: [
                'Vascular flushing enhances recovery',
                'Less intense than pure cold',
                'Good for moderate recovery needs'
            ],
            contraindications: [],
            scienceNote: 'Alternating temperatures enhance circulatory flushing of metabolites.'
        },
        compression: {
            recommendation: 'highly_recommend',
            timing: ['post_cardio', 'evening', 'morning'],
            duration_minutes: [30, 60],
            frequency_per_week: [4, 7],
            notes: [
                'Compression socks/sleeves during travel',
                'Pneumatic boots post-long sessions',
                'Reduces DOMS and perceived fatigue',
                'Wear during sleep after hard days'
            ],
            contraindications: [],
            scienceNote: 'Compression enhances venous return and reduces lower limb edema.'
        },
        massage: {
            recommendation: 'highly_recommend',
            timing: ['rest_day', 'post_cardio'],
            duration_minutes: [45, 90],
            frequency_per_week: [1, 3],
            notes: [
                'Sports massage essential for high-volume athletes',
                'Reduces muscle adhesions',
                'Enhances tissue pliability',
                'Weekly schedule during build phases'
            ],
            contraindications: [],
            scienceNote: 'Massage reduces muscle stiffness and improves running economy.'
        },
        foam_rolling: {
            recommendation: 'highly_recommend',
            timing: ['post_cardio', 'morning'],
            duration_minutes: [15, 30],
            frequency_per_week: [5, 7],
            notes: [
                'Daily maintenance for high-volume athletes',
                'Focus on IT band, quads, calves',
                'Pre-run: brief, dynamic',
                'Post-run: extended, slow'
            ],
            contraindications: [],
            scienceNote: 'Self-myofascial release maintains tissue quality for repetitive motion.'
        },
        active_recovery: {
            recommendation: 'highly_recommend',
            timing: ['rest_day'],
            duration_minutes: [30, 60],
            frequency_per_week: [1, 3],
            notes: [
                'Easy spin, swim, or walk',
                'Zone 1 only (conversational)',
                'Enhances blood flow without stress',
                'Critical for adaptation'
            ],
            contraindications: [],
            scienceNote: 'Active recovery maintains aerobic enzyme activity while allowing tissue repair.'
        },
        sleep_extension: {
            recommendation: 'highly_recommend',
            timing: ['evening'],
            duration_minutes: [480, 600],
            frequency_per_week: [7, 7],
            notes: [
                'Sleep banking before key events',
                'Mitochondrial repair during sleep',
                'Glycogen replenishment enhanced',
                'Immune function critical for training load'
            ],
            contraindications: [],
            scienceNote: 'Sleep deprivation impairs glycogen resynthesis and immune function.'
        },
        stretching: {
            recommendation: 'recommend',
            timing: ['post_cardio', 'evening'],
            duration_minutes: [15, 30],
            frequency_per_week: [5, 7],
            notes: [
                'Focus on hip flexors, hamstrings, calves',
                'Maintain running/cycling ROM',
                'PNF stretching effective'
            ],
            contraindications: [],
            scienceNote: 'Flexibility maintenance supports efficient movement patterns.'
        },
        mobility_work: {
            recommendation: 'highly_recommend',
            timing: ['morning', 'post_cardio'],
            duration_minutes: [20, 40],
            frequency_per_week: [5, 7],
            notes: [
                'Hip mobility essential for runners',
                'Thoracic mobility for swimmers',
                'Ankle mobility for all',
                'Daily practice recommended'
            ],
            contraindications: [],
            scienceNote: 'Joint mobility enables efficient mechanics and reduces injury risk.'
        },
        electrostimulation: {
            recommendation: 'recommend',
            timing: ['rest_day', 'evening'],
            duration_minutes: [20, 40],
            frequency_per_week: [2, 4],
            notes: [
                'EMS recovery programs available',
                'Enhances blood flow',
                'Useful during taper'
            ],
            contraindications: ['Pacemaker'],
            scienceNote: 'EMS may enhance recovery through increased local circulation.'
        },
        breathing_work: {
            recommendation: 'highly_recommend',
            timing: ['morning', 'post_cardio'],
            duration_minutes: [10, 20],
            frequency_per_week: [5, 7],
            notes: [
                'Nasal breathing training',
                'CO2 tolerance work',
                'Diaphragmatic breathing',
                'Enhances breathing efficiency during exercise'
            ],
            contraindications: [],
            scienceNote: 'Respiratory muscle training improves ventilatory efficiency and reduces perceived exertion.'
        },
        meditation: {
            recommendation: 'recommend',
            timing: ['morning', 'evening'],
            duration_minutes: [10, 20],
            frequency_per_week: [3, 7],
            notes: [
                'Race visualization',
                'Pain tolerance training',
                'Focus and concentration'
            ],
            contraindications: [],
            scienceNote: 'Mental training enhances pain tolerance and race execution.'
        },
        napping: {
            recommendation: 'highly_recommend',
            timing: ['post_cardio'],
            duration_minutes: [20, 90],
            frequency_per_week: [3, 7],
            notes: [
                'Napping after long sessions accelerates recovery',
                '20min if time-limited',
                '90min for full sleep cycle',
                'Part of elite athlete protocols'
            ],
            contraindications: [],
            scienceNote: 'Post-exercise napping enhances recovery hormone release and tissue repair.'
        },
        float_tank: {
            recommendation: 'recommend',
            timing: ['rest_day'],
            duration_minutes: [60, 90],
            frequency_per_week: [0, 2],
            notes: [
                'Deep muscle relaxation',
                'Mental reset',
                'Useful during taper'
            ],
            contraindications: [],
            scienceNote: 'Sensory deprivation enhances parasympathetic recovery.'
        },
        infrared_therapy: {
            recommendation: 'recommend',
            timing: ['evening'],
            duration_minutes: [30, 45],
            frequency_per_week: [2, 4],
            notes: [
                'Gentle recovery option',
                'Less dehydrating than sauna',
                'Good for injury prevention'
            ],
            contraindications: [],
            scienceNote: 'Infrared may enhance mitochondrial function and tissue repair.'
        },
        percussive_therapy: {
            recommendation: 'highly_recommend',
            timing: ['post_cardio', 'morning'],
            duration_minutes: [15, 25],
            frequency_per_week: [5, 7],
            notes: [
                'Essential for high-volume training',
                'Focus on legs for runners/cyclists',
                'Quick, effective maintenance'
            ],
            contraindications: [],
            scienceNote: 'Percussion therapy reduces muscle stiffness and maintains tissue pliability.'
        }
    },

    // Add remaining goals with similar comprehensive protocols
    explosive_power: {
        cold_water_immersion: {
            recommendation: 'caution',
            timing: ['rest_day'],
            duration_minutes: [0, 5],
            frequency_per_week: [0, 2],
            temperature: [12, 15],
            notes: [
                'May impair neural adaptations',
                'CNS recovery is paramount',
                'Use sparingly and only on rest days',
                'Never after power/speed work'
            ],
            contraindications: ['Same day as power work'],
            scienceNote: 'Cold exposure may interfere with neural pathway potentiation required for power development.'
        },
        sauna: {
            recommendation: 'recommend',
            timing: ['evening', 'rest_day'],
            duration_minutes: [15, 25],
            frequency_per_week: [2, 4],
            temperature: [80, 95],
            notes: [
                'Supports neural recovery',
                'Enhances tissue pliability',
                'Do not use pre-power work'
            ],
            contraindications: [],
            scienceNote: 'Heat exposure aids in neural recovery and tissue relaxation.'
        },
        contrast_therapy: { recommendation: 'neutral', timing: ['rest_day'], duration_minutes: [10, 15], frequency_per_week: [0, 2], notes: ['Optional recovery modality'], contraindications: [], scienceNote: 'Minimal direct benefit for power athletes.' },
        compression: { recommendation: 'recommend', timing: ['evening'], duration_minutes: [20, 40], frequency_per_week: [2, 5], notes: ['Supports recovery between sessions'], contraindications: [], scienceNote: 'Compression aids tissue recovery.' },
        massage: { recommendation: 'highly_recommend', timing: ['rest_day'], duration_minutes: [45, 75], frequency_per_week: [1, 3], notes: ['Deep tissue for power athletes', 'Focus on hip flexors, glutes'], contraindications: [], scienceNote: 'Massage maintains tissue quality for explosive movements.' },
        foam_rolling: { recommendation: 'highly_recommend', timing: ['morning', 'post_strength'], duration_minutes: [15, 25], frequency_per_week: [5, 7], notes: ['Essential for tissue quality'], contraindications: [], scienceNote: 'Tissue quality is critical for power output.' },
        active_recovery: { recommendation: 'recommend', timing: ['rest_day'], duration_minutes: [20, 30], frequency_per_week: [1, 2], notes: ['Very light - walking, swimming'], contraindications: ['Anything that fatigues CNS'], scienceNote: 'CNS recovery is paramount for power athletes.' },
        sleep_extension: { recommendation: 'highly_recommend', timing: ['evening'], duration_minutes: [480, 600], frequency_per_week: [7, 7], notes: ['CNS recovery requires quality sleep', 'Neural consolidation during sleep'], contraindications: [], scienceNote: 'Sleep is critical for neural adaptation and motor learning.' },
        stretching: { recommendation: 'caution', timing: ['evening'], duration_minutes: [10, 15], frequency_per_week: [2, 4], notes: ['Avoid excessive static stretching pre-power work', 'Dynamic only before training'], contraindications: ['Long static holds pre-training'], scienceNote: 'Excessive static stretching reduces power output.' },
        mobility_work: { recommendation: 'highly_recommend', timing: ['morning', 'pre_training'], duration_minutes: [20, 40], frequency_per_week: [5, 7], notes: ['Dynamic mobility essential', 'Hip and ankle mobility critical'], contraindications: [], scienceNote: 'Full ROM required for maximal power expression.' },
        electrostimulation: { recommendation: 'recommend', timing: ['rest_day'], duration_minutes: [20, 30], frequency_per_week: [1, 3], notes: ['EMS for recovery, not training'], contraindications: ['Pacemaker'], scienceNote: 'EMS supports recovery between power sessions.' },
        breathing_work: { recommendation: 'recommend', timing: ['evening'], duration_minutes: [10, 15], frequency_per_week: [3, 7], notes: ['Parasympathetic activation for recovery', 'Supports CNS downregulation'], contraindications: [], scienceNote: 'Breathing work enhances recovery from CNS-intensive training.' },
        meditation: { recommendation: 'recommend', timing: ['evening'], duration_minutes: [10, 20], frequency_per_week: [3, 5], notes: ['Visualization of movements', 'Focus training'], contraindications: [], scienceNote: 'Mental rehearsal enhances motor pattern development.' },
        napping: { recommendation: 'highly_recommend', timing: ['post_strength'], duration_minutes: [30, 90], frequency_per_week: [3, 5], notes: ['Neural recovery enhanced during sleep'], contraindications: [], scienceNote: 'Napping supports CNS recovery and motor learning consolidation.' },
        float_tank: { recommendation: 'recommend', timing: ['rest_day'], duration_minutes: [60, 90], frequency_per_week: [0, 1], notes: ['Deep relaxation for CNS recovery'], contraindications: [], scienceNote: 'Sensory deprivation enhances CNS recovery.' },
        infrared_therapy: { recommendation: 'recommend', timing: ['evening'], duration_minutes: [25, 40], frequency_per_week: [2, 4], notes: ['Tissue quality support'], contraindications: [], scienceNote: 'Infrared supports tissue pliability.' },
        percussive_therapy: { recommendation: 'highly_recommend', timing: ['morning', 'post_strength'], duration_minutes: [15, 25], frequency_per_week: [5, 7], notes: ['Essential for tissue maintenance'], contraindications: [], scienceNote: 'Percussion maintains tissue quality for power movements.' }
    },

    // Add simplified versions for remaining goals (weight_loss, weight_gain, hybrid, longevity)
    // These follow similar patterns with goal-specific adjustments
    weight_loss: {
        cold_water_immersion: { recommendation: 'recommend', timing: ['morning'], duration_minutes: [2, 8], frequency_per_week: [3, 5], temperature: [10, 15], notes: ['BAT activation', 'Morning exposure preferred'], contraindications: [], scienceNote: 'Cold activates brown fat for thermogenesis.' },
        sauna: { recommendation: 'highly_recommend', timing: ['post_cardio', 'evening'], duration_minutes: [20, 30], frequency_per_week: [3, 5], temperature: [80, 100], notes: ['Caloric expenditure', 'Cardiovascular benefits'], contraindications: [], scienceNote: 'Sauna increases metabolic rate.' },
        contrast_therapy: { recommendation: 'recommend', timing: ['post_cardio'], duration_minutes: [15, 25], frequency_per_week: [2, 3], notes: ['Metabolic challenge'], contraindications: [], scienceNote: 'Temperature regulation increases energy expenditure.' },
        compression: { recommendation: 'recommend', timing: ['post_hiit'], duration_minutes: [20, 40], frequency_per_week: [2, 4], notes: ['Recovery for training consistency'], contraindications: [], scienceNote: 'Supports training frequency.' },
        massage: { recommendation: 'recommend', timing: ['rest_day'], duration_minutes: [30, 60], frequency_per_week: [1, 2], notes: ['Stress reduction'], contraindications: [], scienceNote: 'Reduces cortisol.' },
        foam_rolling: { recommendation: 'recommend', timing: ['morning', 'post_hiit'], duration_minutes: [10, 20], frequency_per_week: [3, 7], notes: ['Movement quality'], contraindications: [], scienceNote: 'Supports training.' },
        active_recovery: { recommendation: 'highly_recommend', timing: ['rest_day', 'morning'], duration_minutes: [30, 60], frequency_per_week: [3, 5], notes: ['Walking is key', '10,000+ steps'], contraindications: [], scienceNote: 'NEAT is major caloric contributor.' },
        sleep_extension: { recommendation: 'highly_recommend', timing: ['evening'], duration_minutes: [450, 540], frequency_per_week: [7, 7], notes: ['Hunger hormone regulation'], contraindications: [], scienceNote: 'Sleep controls ghrelin and leptin.' },
        stretching: { recommendation: 'neutral', timing: ['evening'], duration_minutes: [10, 20], frequency_per_week: [2, 4], notes: ['Stress relief'], contraindications: [], scienceNote: 'Minimal direct benefit.' },
        mobility_work: { recommendation: 'recommend', timing: ['morning'], duration_minutes: [15, 25], frequency_per_week: [3, 5], notes: ['Movement quality'], contraindications: [], scienceNote: 'Supports training ability.' },
        electrostimulation: { recommendation: 'neutral', timing: ['rest_day'], duration_minutes: [20, 30], frequency_per_week: [0, 2], notes: ['Optional'], contraindications: [], scienceNote: 'Minimal direct benefit.' },
        breathing_work: { recommendation: 'recommend', timing: ['morning', 'evening'], duration_minutes: [10, 15], frequency_per_week: [5, 7], notes: ['Stress management'], contraindications: [], scienceNote: 'Reduces stress eating.' },
        meditation: { recommendation: 'recommend', timing: ['morning', 'evening'], duration_minutes: [10, 20], frequency_per_week: [5, 7], notes: ['Mindful eating'], contraindications: [], scienceNote: 'Reduces impulsive eating.' },
        napping: { recommendation: 'neutral', timing: [], duration_minutes: [20, 30], frequency_per_week: [0, 2], notes: ['Only if sleep-deprived'], contraindications: [], scienceNote: 'May reduce NEAT.' },
        float_tank: { recommendation: 'neutral', timing: ['rest_day'], duration_minutes: [60, 90], frequency_per_week: [0, 1], notes: ['Stress reduction'], contraindications: [], scienceNote: 'Stress management tool.' },
        infrared_therapy: { recommendation: 'recommend', timing: ['evening'], duration_minutes: [30, 45], frequency_per_week: [2, 4], notes: ['Gentle metabolic boost'], contraindications: [], scienceNote: 'Increases metabolic rate.' },
        percussive_therapy: { recommendation: 'recommend', timing: ['post_hiit'], duration_minutes: [10, 15], frequency_per_week: [2, 4], notes: ['Quick recovery'], contraindications: [], scienceNote: 'Supports training consistency.' }
    },

    weight_gain: {
        cold_water_immersion: { recommendation: 'avoid', timing: ['rest_day'], duration_minutes: [0, 0], frequency_per_week: [0, 1], temperature: [12, 15], notes: ['Avoid - cold increases caloric expenditure'], contraindications: ['Trying to gain weight'], scienceNote: 'Cold exposure burns extra calories and may blunt anabolic signals.' },
        sauna: { recommendation: 'recommend', timing: ['evening'], duration_minutes: [15, 25], frequency_per_week: [2, 4], temperature: [80, 95], notes: ['GH release', 'Do not overdo - dehydration'], contraindications: [], scienceNote: 'Moderate sauna supports recovery without excessive caloric cost.' },
        contrast_therapy: { recommendation: 'neutral', timing: ['rest_day'], duration_minutes: [10, 15], frequency_per_week: [0, 1], notes: ['Optional'], contraindications: [], scienceNote: 'Minimal impact on weight gain.' },
        compression: { recommendation: 'recommend', timing: ['post_strength', 'evening'], duration_minutes: [20, 40], frequency_per_week: [3, 5], notes: ['Recovery support'], contraindications: [], scienceNote: 'Supports training capacity.' },
        massage: { recommendation: 'highly_recommend', timing: ['rest_day'], duration_minutes: [30, 60], frequency_per_week: [1, 2], notes: ['Recovery without caloric cost'], contraindications: [], scienceNote: 'Enhances recovery.' },
        foam_rolling: { recommendation: 'recommend', timing: ['post_strength'], duration_minutes: [10, 20], frequency_per_week: [3, 5], notes: ['Tissue quality'], contraindications: [], scienceNote: 'Supports training.' },
        active_recovery: { recommendation: 'caution', timing: ['rest_day'], duration_minutes: [15, 25], frequency_per_week: [1, 2], notes: ['Keep minimal - preserve calories'], contraindications: ['Excessive activity'], scienceNote: 'Minimize NEAT to maintain surplus.' },
        sleep_extension: { recommendation: 'highly_recommend', timing: ['evening'], duration_minutes: [480, 600], frequency_per_week: [7, 7], notes: ['GH release', 'Anabolic window'], contraindications: [], scienceNote: 'Sleep is primary anabolic window.' },
        stretching: { recommendation: 'neutral', timing: ['evening'], duration_minutes: [10, 15], frequency_per_week: [2, 4], notes: ['Movement maintenance'], contraindications: [], scienceNote: 'Minimal caloric cost.' },
        mobility_work: { recommendation: 'recommend', timing: ['morning'], duration_minutes: [15, 25], frequency_per_week: [3, 5], notes: ['Joint health'], contraindications: [], scienceNote: 'Supports heavy lifting.' },
        electrostimulation: { recommendation: 'neutral', timing: ['rest_day'], duration_minutes: [20, 30], frequency_per_week: [0, 2], notes: ['Optional recovery'], contraindications: [], scienceNote: 'Minimal impact.' },
        breathing_work: { recommendation: 'recommend', timing: ['evening'], duration_minutes: [10, 15], frequency_per_week: [3, 5], notes: ['Sleep quality'], contraindications: [], scienceNote: 'Supports sleep.' },
        meditation: { recommendation: 'recommend', timing: ['evening'], duration_minutes: [10, 20], frequency_per_week: [3, 5], notes: ['Stress management'], contraindications: [], scienceNote: 'Chronic stress is catabolic.' },
        napping: { recommendation: 'highly_recommend', timing: ['post_strength'], duration_minutes: [30, 90], frequency_per_week: [3, 7], notes: ['Anabolic window', 'Additional GH release'], contraindications: [], scienceNote: 'Napping adds anabolic opportunity.' },
        float_tank: { recommendation: 'neutral', timing: ['rest_day'], duration_minutes: [60, 90], frequency_per_week: [0, 1], notes: ['Deep relaxation'], contraindications: [], scienceNote: 'Stress reduction.' },
        infrared_therapy: { recommendation: 'recommend', timing: ['evening'], duration_minutes: [20, 35], frequency_per_week: [2, 3], notes: ['Gentle recovery'], contraindications: [], scienceNote: 'Supports tissue repair.' },
        percussive_therapy: { recommendation: 'recommend', timing: ['post_strength'], duration_minutes: [10, 20], frequency_per_week: [3, 5], notes: ['Recovery support'], contraindications: [], scienceNote: 'Maintains tissue quality.' }
    },

    hybrid: {
        cold_water_immersion: { recommendation: 'caution', timing: ['post_cardio'], duration_minutes: [5, 10], frequency_per_week: [1, 3], temperature: [12, 15], notes: ['OK after cardio, avoid after strength', 'Periodize usage'], contraindications: ['Post-strength training'], scienceNote: 'Strategic use after endurance, avoid after strength.' },
        sauna: { recommendation: 'highly_recommend', timing: ['evening', 'rest_day'], duration_minutes: [15, 25], frequency_per_week: [3, 5], temperature: [80, 100], notes: ['Benefits both strength and endurance', 'GH + heat acclimation'], contraindications: [], scienceNote: 'Sauna benefits are goal-agnostic.' },
        contrast_therapy: { recommendation: 'recommend', timing: ['post_cardio', 'rest_day'], duration_minutes: [15, 20], frequency_per_week: [2, 3], notes: ['Versatile recovery tool'], contraindications: [], scienceNote: 'Good all-around recovery modality.' },
        compression: { recommendation: 'highly_recommend', timing: ['post_strength', 'post_cardio', 'evening'], duration_minutes: [30, 60], frequency_per_week: [4, 7], notes: ['Essential for high-frequency training'], contraindications: [], scienceNote: 'Supports recovery for mixed training.' },
        massage: { recommendation: 'highly_recommend', timing: ['rest_day'], duration_minutes: [45, 75], frequency_per_week: [1, 2], notes: ['Weekly maintenance'], contraindications: [], scienceNote: 'Critical for managing mixed training stress.' },
        foam_rolling: { recommendation: 'highly_recommend', timing: ['morning', 'post_cardio', 'post_strength'], duration_minutes: [15, 25], frequency_per_week: [5, 7], notes: ['Daily maintenance for hybrid athletes'], contraindications: [], scienceNote: 'High training frequency requires daily tissue work.' },
        active_recovery: { recommendation: 'recommend', timing: ['rest_day'], duration_minutes: [25, 45], frequency_per_week: [1, 2], notes: ['Light movement on rest days'], contraindications: [], scienceNote: 'Enhances recovery without adding stress.' },
        sleep_extension: { recommendation: 'highly_recommend', timing: ['evening'], duration_minutes: [480, 570], frequency_per_week: [7, 7], notes: ['Critical for managing concurrent training', '8+ hours minimum'], contraindications: [], scienceNote: 'Mixed training requires extra recovery.' },
        stretching: { recommendation: 'recommend', timing: ['evening', 'post_cardio'], duration_minutes: [15, 25], frequency_per_week: [4, 7], notes: ['Maintain flexibility across modalities'], contraindications: [], scienceNote: 'Flexibility supports diverse training.' },
        mobility_work: { recommendation: 'highly_recommend', timing: ['morning'], duration_minutes: [20, 35], frequency_per_week: [5, 7], notes: ['Daily practice for hybrid athletes'], contraindications: [], scienceNote: 'Movement quality critical for mixed training.' },
        electrostimulation: { recommendation: 'recommend', timing: ['rest_day', 'evening'], duration_minutes: [25, 40], frequency_per_week: [2, 4], notes: ['Recovery support for high volume'], contraindications: ['Pacemaker'], scienceNote: 'Additional recovery modality.' },
        breathing_work: { recommendation: 'recommend', timing: ['morning', 'evening'], duration_minutes: [10, 20], frequency_per_week: [5, 7], notes: ['Balance sympathetic/parasympathetic'], contraindications: [], scienceNote: 'Critical for managing training stress.' },
        meditation: { recommendation: 'recommend', timing: ['evening'], duration_minutes: [10, 20], frequency_per_week: [3, 7], notes: ['Mental recovery'], contraindications: [], scienceNote: 'Manages training complexity.' },
        napping: { recommendation: 'highly_recommend', timing: ['post_strength', 'post_cardio'], duration_minutes: [20, 90], frequency_per_week: [3, 5], notes: ['Support high training load'], contraindications: [], scienceNote: 'Additional recovery opportunity.' },
        float_tank: { recommendation: 'recommend', timing: ['rest_day'], duration_minutes: [60, 90], frequency_per_week: [0, 1], notes: ['Deep reset'], contraindications: [], scienceNote: 'Complete nervous system recovery.' },
        infrared_therapy: { recommendation: 'recommend', timing: ['evening'], duration_minutes: [25, 40], frequency_per_week: [2, 4], notes: ['Gentle recovery option'], contraindications: [], scienceNote: 'Supports tissue repair.' },
        percussive_therapy: { recommendation: 'highly_recommend', timing: ['morning', 'post_strength', 'post_cardio'], duration_minutes: [20, 30], frequency_per_week: [5, 7], notes: ['Daily maintenance essential'], contraindications: [], scienceNote: 'Critical for high-frequency training.' }
    },

    longevity: {
        cold_water_immersion: { recommendation: 'highly_recommend', timing: ['morning'], duration_minutes: [2, 5], frequency_per_week: [3, 7], temperature: [10, 15], notes: ['Cold exposure linked to longevity', 'Hormesis benefits', 'Start gradually'], contraindications: ['Cardiovascular conditions - check with doctor'], scienceNote: 'Cold stress triggers hormetic adaptation pathways associated with longevity.' },
        sauna: { recommendation: 'highly_recommend', timing: ['evening'], duration_minutes: [20, 30], frequency_per_week: [4, 7], temperature: [80, 100], notes: ['20-year Finnish study: 4-7x/week reduces all-cause mortality 40%', 'Cardiovascular benefits', 'Heat shock proteins'], contraindications: [], scienceNote: 'Regular sauna use is one of the strongest longevity interventions.' },
        contrast_therapy: { recommendation: 'recommend', timing: ['morning', 'evening'], duration_minutes: [15, 25], frequency_per_week: [2, 4], notes: ['Vascular health', 'Immune function'], contraindications: [], scienceNote: 'Temperature variation trains cardiovascular system.' },
        compression: { recommendation: 'recommend', timing: ['evening'], duration_minutes: [20, 40], frequency_per_week: [2, 4], notes: ['Circulation support', 'Especially during travel'], contraindications: [], scienceNote: 'Supports vascular health.' },
        massage: { recommendation: 'highly_recommend', timing: ['rest_day'], duration_minutes: [45, 75], frequency_per_week: [1, 2], notes: ['Stress reduction', 'Social touch benefits'], contraindications: [], scienceNote: 'Massage reduces chronic inflammation.' },
        foam_rolling: { recommendation: 'recommend', timing: ['morning'], duration_minutes: [10, 20], frequency_per_week: [3, 7], notes: ['Maintain tissue quality', 'Prevent adhesions'], contraindications: [], scienceNote: 'Tissue quality maintains movement ability.' },
        active_recovery: { recommendation: 'highly_recommend', timing: ['rest_day', 'morning', 'evening'], duration_minutes: [30, 60], frequency_per_week: [5, 7], notes: ['Daily movement is key', 'Walking is medicine', 'Zone 2 training'], contraindications: [], scienceNote: 'Regular low-intensity movement is among the strongest longevity predictors.' },
        sleep_extension: { recommendation: 'highly_recommend', timing: ['evening'], duration_minutes: [450, 540], frequency_per_week: [7, 7], notes: ['7-8 hours optimal for longevity', 'Consistent schedule', 'Circadian alignment'], contraindications: [], scienceNote: 'Sleep quality is a primary longevity factor.' },
        stretching: { recommendation: 'recommend', timing: ['morning', 'evening'], duration_minutes: [15, 30], frequency_per_week: [5, 7], notes: ['Maintain mobility', 'Prevent falls'], contraindications: [], scienceNote: 'Flexibility prevents injury and maintains independence.' },
        mobility_work: { recommendation: 'highly_recommend', timing: ['morning'], duration_minutes: [20, 40], frequency_per_week: [5, 7], notes: ['Joint health is longevity', 'Full ROM maintenance', 'Balance training included'], contraindications: [], scienceNote: 'Mobility is critical for maintaining independence.' },
        electrostimulation: { recommendation: 'neutral', timing: ['rest_day'], duration_minutes: [20, 30], frequency_per_week: [0, 2], notes: ['Optional recovery'], contraindications: ['Pacemaker'], scienceNote: 'Minimal direct longevity benefit.' },
        breathing_work: { recommendation: 'highly_recommend', timing: ['morning', 'evening'], duration_minutes: [15, 30], frequency_per_week: [7, 7], notes: ['Daily practice', 'Stress reduction', 'HRV improvement'], contraindications: [], scienceNote: 'Breathwork improves HRV, a longevity biomarker.' },
        meditation: { recommendation: 'highly_recommend', timing: ['morning', 'evening'], duration_minutes: [15, 30], frequency_per_week: [7, 7], notes: ['Daily practice', 'Reduces biological aging', 'Telomere preservation'], contraindications: [], scienceNote: 'Meditation has been shown to slow biological aging markers.' },
        napping: { recommendation: 'recommend', timing: [], duration_minutes: [20, 30], frequency_per_week: [1, 3], notes: ['Short naps only', 'Mediterranean siesta association with longevity'], contraindications: [], scienceNote: 'Brief naps associated with cardiovascular health in some populations.' },
        float_tank: { recommendation: 'recommend', timing: ['rest_day'], duration_minutes: [60, 90], frequency_per_week: [0, 2], notes: ['Deep relaxation', 'Stress reduction'], contraindications: [], scienceNote: 'Stress reduction supports longevity.' },
        infrared_therapy: { recommendation: 'recommend', timing: ['evening'], duration_minutes: [30, 45], frequency_per_week: [3, 5], notes: ['Gentle heat benefits', 'Joint health'], contraindications: [], scienceNote: 'Infrared supports cellular health.' },
        percussive_therapy: { recommendation: 'recommend', timing: ['morning'], duration_minutes: [10, 20], frequency_per_week: [3, 5], notes: ['Tissue maintenance', 'Circulation'], contraindications: [], scienceNote: 'Maintains tissue quality for continued activity.' }
    }
};

// Helper function to get recommendations for a specific goal and context
export const getRecoveryRecommendation = (
    goal: GoalType,
    modality: RecoveryModality,
    context?: TimingContext
): ModalityProtocol & { applicableNow: boolean } => {
    const protocol = RECOVERY_PROTOCOLS[goal][modality];
    const applicableNow = context ? protocol.timing.includes(context) : true;
    return { ...protocol, applicableNow };
};

// Get all highly recommended modalities for a goal
export const getHighlyRecommendedModalities = (goal: GoalType): RecoveryModality[] => {
    return Object.entries(RECOVERY_PROTOCOLS[goal])
        .filter(([_, protocol]) => protocol.recommendation === 'highly_recommend')
        .map(([modality]) => modality as RecoveryModality);
};

// Get modalities to avoid for a goal
export const getModalitesToAvoid = (goal: GoalType): RecoveryModality[] => {
    return Object.entries(RECOVERY_PROTOCOLS[goal])
        .filter(([_, protocol]) => protocol.recommendation === 'avoid')
        .map(([modality]) => modality as RecoveryModality);
};

// Check if a modality should be suggested/filtered
export const shouldSuggestModality = (
    goal: GoalType,
    modality: RecoveryModality,
    lastSessionType?: 'strength' | 'cardio' | 'hiit' | 'rest'
): { suggest: boolean; reason: string } => {
    const protocol = RECOVERY_PROTOCOLS[goal][modality];

    if (protocol.recommendation === 'avoid') {
        return { suggest: false, reason: `${modality} is not recommended for ${goal} goals` };
    }

    // Special case: Ice bath after strength for muscle gain
    if (modality === 'cold_water_immersion' && goal === 'muscle_gain' && lastSessionType === 'strength') {
        return { suggest: false, reason: 'Ice bath blunts muscle protein synthesis after strength training' };
    }

    // Special case: Active recovery should be minimal for weight gain
    if (modality === 'active_recovery' && goal === 'weight_gain') {
        return { suggest: true, reason: 'Keep active recovery brief to preserve caloric surplus' };
    }

    if (protocol.recommendation === 'highly_recommend') {
        return { suggest: true, reason: `Highly recommended for ${goal} goals` };
    }

    if (protocol.recommendation === 'recommend') {
        return { suggest: true, reason: `Recommended for ${goal} goals` };
    }

    return { suggest: true, reason: 'Neutral - use as preferred' };
};

// ============================================================================
// ADAPTER FUNCTIONS FOR goalAwareHooks.ts
// ============================================================================

export interface RecoveryPriorities {
    essential: RecoveryModality[];
    recommended: RecoveryModality[];
    optional: RecoveryModality[];
    avoid: RecoveryModality[];
}

export const getRecoveryPriorities = (goal: GoalType): RecoveryPriorities => {
    const protocols = RECOVERY_PROTOCOLS[goal];
    if (!protocols) {
        return getRecoveryPriorities('hybrid');
    }

    const essential: RecoveryModality[] = [];
    const recommended: RecoveryModality[] = [];
    const optional: RecoveryModality[] = [];
    const avoid: RecoveryModality[] = [];

    for (const [modality, protocol] of Object.entries(protocols)) {
        switch (protocol.recommendation) {
            case 'highly_recommend':
                essential.push(modality as RecoveryModality);
                break;
            case 'recommend':
                recommended.push(modality as RecoveryModality);
                break;
            case 'neutral':
            case 'caution':
                optional.push(modality as RecoveryModality);
                break;
            case 'avoid':
                avoid.push(modality as RecoveryModality);
                break;
        }
    }

    return { essential, recommended, optional, avoid };
};

export interface RecoveryRecommendationAdapter {
    timing: string;
    duration: string;
    frequency: string;
    goal_specific_notes: string;
    contraindications: string[];
}

export const getRecoveryRecommendationAdapter = (
    goal: GoalType,
    modality: RecoveryModality,
    context?: TimingContext
): RecoveryRecommendationAdapter | null => {
    const protocols = RECOVERY_PROTOCOLS[goal];
    if (!protocols || !protocols[modality]) {
        return null;
    }

    const protocol = protocols[modality];

    return {
        timing: protocol.timing.join(', ').replace(/_/g, ' '),
        duration: `${protocol.duration_minutes[0]}-${protocol.duration_minutes[1]} min`,
        frequency: `${protocol.frequency_per_week[0]}-${protocol.frequency_per_week[1]}x per week`,
        goal_specific_notes: protocol.notes.join(' '),
        contraindications: protocol.contraindications
    };
};

