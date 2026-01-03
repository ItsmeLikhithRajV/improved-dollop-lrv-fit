/**
 * Emotion Regulation Toolkit
 * 
 * Science-backed interventions for emotional regulation in sport
 * Based on CBT, ACT, and sport psychology research.
 * 
 * Research Sources:
 * - Kristin Neff (Self-Compassion)
 * - ACT Framework (Hayes)
 * - CBT techniques
 * - Sport psychology protocols
 */

// =====================================================
// TYPES
// =====================================================

export type EmotionCategory =
    | 'anxiety' | 'anger' | 'frustration' | 'doubt'
    | 'overwhelm' | 'disappointment' | 'fear' | 'shame';

export type RegulationStrategy =
    | 'cognitive' | 'somatic' | 'behavioral' | 'interpersonal' | 'mindfulness';

export interface EmotionRegulationTool {
    id: string;
    name: string;
    emoji: string;
    strategy: RegulationStrategy;

    // When to use
    trigger_emotions: EmotionCategory[];
    intensity_range: { min: number; max: number };  // 1-10 when effective

    // Content
    description: string;
    steps: string[];
    duration_minutes: number;

    // Science
    science: string;
    evidence_level: 'strong' | 'moderate' | 'emerging';

    // Context
    can_do_publicly: boolean;
    needs_quiet: boolean;
    sport_application: string;

    // Personalization
    difficulty: 1 | 2 | 3;
    requires_practice: boolean;
}

// =====================================================
// COGNITIVE STRATEGIES
// =====================================================

const COGNITIVE_TOOLS: EmotionRegulationTool[] = [
    {
        id: 'cognitive_reframe',
        name: 'Cognitive Reframe',
        emoji: '🔄',
        strategy: 'cognitive',
        trigger_emotions: ['anxiety', 'doubt', 'frustration', 'disappointment'],
        intensity_range: { min: 3, max: 7 },
        description: 'Challenge unhelpful thoughts with evidence and alternative perspectives.',
        steps: [
            'Identify the thought: "What am I telling myself right now?"',
            'Find evidence against it: "What proves this isn\'t 100% true?"',
            'Create a balanced thought: "A more helpful way to see this is..."',
            'Test the new thought: How does this perspective feel?'
        ],
        duration_minutes: 3,
        science: 'CBT core technique. Meta-analyses show large effects on anxiety and depression.',
        evidence_level: 'strong',
        can_do_publicly: true,
        needs_quiet: false,
        sport_application: 'Pre-competition negative thoughts, post-mistake rumination',
        difficulty: 2,
        requires_practice: true
    },
    {
        id: 'defusion',
        name: 'Thought Defusion',
        emoji: '☁️',
        strategy: 'mindfulness',
        trigger_emotions: ['anxiety', 'doubt', 'fear'],
        intensity_range: { min: 4, max: 8 },
        description: 'See thoughts as mental events, not facts. "I notice I\'m having the thought that..."',
        steps: [
            'Notice the thought that\'s bothering you',
            'Reframe it: "I\'m having the thought that..." (not "I am...")',
            'Visualize it: See the thought as a cloud passing, or words on a screen',
            'Thank your mind: "Thanks mind, but I\'ve got this"',
            'Return focus to what matters NOW'
        ],
        duration_minutes: 2,
        science: 'ACT technique. Creates psychological distance from unhelpful thoughts.',
        evidence_level: 'strong',
        can_do_publicly: true,
        needs_quiet: false,
        sport_application: 'Racing thoughts before competition, fear of failure',
        difficulty: 3,
        requires_practice: true
    },
    {
        id: 'values_anchor',
        name: 'Values Anchor',
        emoji: '⚓',
        strategy: 'cognitive',
        trigger_emotions: ['doubt', 'frustration', 'disappointment', 'fear'],
        intensity_range: { min: 2, max: 6 },
        description: 'Reconnect with WHY you do this. Your deeper purpose.',
        steps: [
            'Ask: "Why does this matter to me?"',
            'Go deeper: "And why does THAT matter?"',
            'Find the value: (e.g., growth, excellence, team, family)',
            'Commit: "I choose to act in line with [value] right now"',
            'Take one action aligned with that value'
        ],
        duration_minutes: 2,
        science: 'ACT values work. Increases intrinsic motivation and resilience.',
        evidence_level: 'strong',
        can_do_publicly: true,
        needs_quiet: false,
        sport_application: 'Loss of motivation, questioning commitment, pre-competition',
        difficulty: 2,
        requires_practice: true
    }
];

// =====================================================
// SOMATIC STRATEGIES
// =====================================================

const SOMATIC_TOOLS: EmotionRegulationTool[] = [
    {
        id: 'grounding_54321',
        name: '5-4-3-2-1 Grounding',
        emoji: '🌍',
        strategy: 'somatic',
        trigger_emotions: ['anxiety', 'overwhelm', 'fear'],
        intensity_range: { min: 5, max: 10 },
        description: 'Use your senses to anchor to the present moment.',
        steps: [
            '5 things you can SEE (name them)',
            '4 things you can TOUCH (feel them)',
            '3 things you can HEAR (listen)',
            '2 things you can SMELL (notice)',
            '1 thing you can TASTE',
            'Take a deep breath. You\'re here, now.'
        ],
        duration_minutes: 2,
        science: 'Activates prefrontal cortex, interrupts amygdala hijack. Rapid grounding.',
        evidence_level: 'strong',
        can_do_publicly: true,
        needs_quiet: false,
        sport_application: 'Panic moments, dissociation, pre-event anxiety',
        difficulty: 1,
        requires_practice: false
    },
    {
        id: 'body_release',
        name: 'Tension Release',
        emoji: '💪',
        strategy: 'somatic',
        trigger_emotions: ['anxiety', 'anger', 'frustration'],
        intensity_range: { min: 4, max: 8 },
        description: 'Progressive muscle tension and release. Physical anxiety outlet.',
        steps: [
            'Scan your body: Where is the tension?',
            'Clench that area HARD for 5 seconds',
            'Release completely and breathe out',
            'Notice the contrast (tension → relaxation)',
            'Repeat for each tense area'
        ],
        duration_minutes: 3,
        science: 'Jacobson\'s PMR. Reduces cortisol, muscle tension, promotes relaxation response.',
        evidence_level: 'strong',
        can_do_publicly: false,
        needs_quiet: false,
        sport_application: 'High arousal before event, physical manifestation of stress',
        difficulty: 1,
        requires_practice: false
    },
    {
        id: 'cold_exposure_face',
        name: 'Dive Reflex',
        emoji: '🧊',
        strategy: 'somatic',
        trigger_emotions: ['anxiety', 'anger', 'overwhelm'],
        intensity_range: { min: 6, max: 10 },
        description: 'Cold water on face triggers mammalian dive reflex. Instant calm.',
        steps: [
            'Get cold water (as cold as possible)',
            'Hold breath and submerge face for 15-30 seconds',
            'OR: Hold ice/cold pack to forehead and cheeks',
            'Feel heart rate drop (vagal response)',
            'Breathe normally'
        ],
        duration_minutes: 1,
        science: 'Mammalian dive reflex. Immediate parasympathetic activation, reduces heart rate 10-25%.',
        evidence_level: 'strong',
        can_do_publicly: false,
        needs_quiet: false,
        sport_application: 'Intense pre-competition anxiety, panic, anger reset between sets',
        difficulty: 1,
        requires_practice: false
    }
];

// =====================================================
// SELF-COMPASSION STRATEGIES
// =====================================================

const COMPASSION_TOOLS: EmotionRegulationTool[] = [
    {
        id: 'self_compassion_break',
        name: 'Self-Compassion Break',
        emoji: '💙',
        strategy: 'cognitive',
        trigger_emotions: ['shame', 'disappointment', 'frustration', 'doubt'],
        intensity_range: { min: 3, max: 8 },
        description: 'Kristin Neff\'s 3-step self-compassion practice.',
        steps: [
            'ACKNOWLEDGE: "This is a moment of suffering/difficulty"',
            'COMMON HUMANITY: "Suffering is part of being an athlete. I\'m not alone."',
            'KINDNESS: "May I be kind to myself right now" (or: What would I say to a friend?)',
            'Place hand on heart if it helps'
        ],
        duration_minutes: 2,
        science: 'Kristin Neff research: Self-compassion reduces cortisol, increases resilience, improves performance under pressure.',
        evidence_level: 'strong',
        can_do_publicly: true,
        needs_quiet: false,
        sport_application: 'After mistakes, poor performance, injury setback',
        difficulty: 2,
        requires_practice: true
    },
    {
        id: 'perspective_taking',
        name: 'Time Perspective',
        emoji: '🔮',
        strategy: 'cognitive',
        trigger_emotions: ['disappointment', 'frustration', 'overwhelm'],
        intensity_range: { min: 3, max: 6 },
        description: 'Zoom out in time. Will this matter in a week? A year?',
        steps: [
            'Ask: "Will this matter in 1 week?"',
            'Ask: "Will this matter in 1 year?"',
            'Ask: "What will I learn from this?"',
            'Ask: "What would my future self thank me for doing now?"'
        ],
        duration_minutes: 2,
        science: 'Temporal distancing reduces emotional intensity. Used in CBT and DBT.',
        evidence_level: 'moderate',
        can_do_publicly: true,
        needs_quiet: false,
        sport_application: 'Bad game, loss, missed opportunity',
        difficulty: 2,
        requires_practice: false
    }
];

// =====================================================
// BEHAVIORAL STRATEGIES
// =====================================================

const BEHAVIORAL_TOOLS: EmotionRegulationTool[] = [
    {
        id: 'opposite_action',
        name: 'Opposite Action',
        emoji: '↔️',
        strategy: 'behavioral',
        trigger_emotions: ['fear', 'anger', 'shame'],
        intensity_range: { min: 4, max: 8 },
        description: 'Act OPPOSITE to what the emotion tells you to do.',
        steps: [
            'Identify what the emotion wants you to do (e.g., hide, attack, avoid)',
            'Ask: "Is this action helpful for my goals?"',
            'Choose the OPPOSITE action (e.g., approach, speak calmly, engage)',
            'Commit to one opposite action RIGHT NOW',
            'Notice how the emotion changes'
        ],
        duration_minutes: 2,
        science: 'DBT technique (Linehan). Acting opposite changes the emotion over time.',
        evidence_level: 'strong',
        can_do_publicly: true,
        needs_quiet: false,
        sport_application: 'Fear of taking shots, avoiding challenges, anger at teammates',
        difficulty: 3,
        requires_practice: true
    },
    {
        id: 'reset_ritual',
        name: 'Reset Ritual',
        emoji: '🔄',
        strategy: 'behavioral',
        trigger_emotions: ['frustration', 'anger', 'disappointment'],
        intensity_range: { min: 2, max: 6 },
        description: 'Physical ritual to mark the transition. Leave the last moment behind.',
        steps: [
            'Choose a physical action (e.g., touch line, adjust gear, specific breath)',
            'As you do it, say internally: "Reset. Next play."',
            'Visualize a "mental delete" of the previous moment',
            'Set ONE focus point for the next moment',
            'Go'
        ],
        duration_minutes: 0.5,
        science: 'Behavioral rituals create psychological separation. Used by elite athletes.',
        evidence_level: 'moderate',
        can_do_publicly: true,
        needs_quiet: false,
        sport_application: 'Between points, after mistakes, between reps',
        difficulty: 1,
        requires_practice: true
    }
];

// =====================================================
// MINDFULNESS STRATEGIES
// =====================================================

const MINDFULNESS_TOOLS: EmotionRegulationTool[] = [
    {
        id: 'rain_technique',
        name: 'RAIN Technique',
        emoji: '🌧️',
        strategy: 'mindfulness',
        trigger_emotions: ['anxiety', 'shame', 'doubt', 'fear'],
        intensity_range: { min: 4, max: 7 },
        description: 'Recognize, Allow, Investigate, Nurture. Full emotional processing.',
        steps: [
            'R - RECOGNIZE: "What am I feeling right now?" (name it)',
            'A - ALLOW: "It\'s okay to feel this. I don\'t have to fight it."',
            'I - INVESTIGATE: "Where do I feel this in my body? What does it need?"',
            'N - NURTURE: "What would help right now?" (often: kindness, breath, movement)'
        ],
        duration_minutes: 4,
        science: 'Tara Brach\'s RAIN. Combines mindfulness with self-compassion.',
        evidence_level: 'moderate',
        can_do_publicly: false,
        needs_quiet: true,
        sport_application: 'Deep processing after difficult events, recurring emotional patterns',
        difficulty: 3,
        requires_practice: true
    },
    {
        id: 'present_moment',
        name: 'Present Moment Focus',
        emoji: '⏱️',
        strategy: 'mindfulness',
        trigger_emotions: ['anxiety', 'overwhelm', 'fear'],
        intensity_range: { min: 3, max: 6 },
        description: 'Anchor to THIS moment. "What can I control right now?"',
        steps: [
            'Notice your feet on the ground',
            'Take one conscious breath',
            'Ask: "What is the ONE thing I can control right now?"',
            'Focus ONLY on that one thing',
            'Repeat when mind wanders: "Just this. Just now."'
        ],
        duration_minutes: 1,
        science: 'Core mindfulness practice. Reduces anticipatory anxiety.',
        evidence_level: 'strong',
        can_do_publicly: true,
        needs_quiet: false,
        sport_application: 'Pre-competition anxiety, overwhelming moments, choking prevention',
        difficulty: 2,
        requires_practice: true
    }
];

// =====================================================
// COMPLETE TOOLKIT
// =====================================================

export const EMOTION_REGULATION_TOOLKIT: EmotionRegulationTool[] = [
    ...COGNITIVE_TOOLS,
    ...SOMATIC_TOOLS,
    ...COMPASSION_TOOLS,
    ...BEHAVIORAL_TOOLS,
    ...MINDFULNESS_TOOLS
];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export const getToolById = (id: string): EmotionRegulationTool | undefined =>
    EMOTION_REGULATION_TOOLKIT.find(t => t.id === id);

export const getToolsByEmotion = (emotion: EmotionCategory): EmotionRegulationTool[] =>
    EMOTION_REGULATION_TOOLKIT.filter(t => t.trigger_emotions.includes(emotion));

export const getToolsByStrategy = (strategy: RegulationStrategy): EmotionRegulationTool[] =>
    EMOTION_REGULATION_TOOLKIT.filter(t => t.strategy === strategy);

export const getQuickTools = (): EmotionRegulationTool[] =>
    EMOTION_REGULATION_TOOLKIT.filter(t => t.duration_minutes <= 2 && t.can_do_publicly);

export const getToolsForIntensity = (intensity: number): EmotionRegulationTool[] =>
    EMOTION_REGULATION_TOOLKIT.filter(t =>
        intensity >= t.intensity_range.min && intensity <= t.intensity_range.max
    );

export const getRecommendedTool = (
    emotion: EmotionCategory,
    intensity: number,
    can_be_private: boolean,
    has_experience: boolean
): EmotionRegulationTool | null => {
    const candidates = EMOTION_REGULATION_TOOLKIT.filter(t => {
        if (!t.trigger_emotions.includes(emotion)) return false;
        if (intensity < t.intensity_range.min || intensity > t.intensity_range.max) return false;
        if (!can_be_private && !t.can_do_publicly) return false;
        if (t.requires_practice && !has_experience) return false;
        return true;
    });

    if (candidates.length === 0) return null;

    // Sort by evidence level, then by simplicity
    candidates.sort((a, b) => {
        const evidenceOrder = { strong: 0, moderate: 1, emerging: 2 };
        if (evidenceOrder[a.evidence_level] !== evidenceOrder[b.evidence_level]) {
            return evidenceOrder[a.evidence_level] - evidenceOrder[b.evidence_level];
        }
        return a.difficulty - b.difficulty;
    });

    return candidates[0];
};

export const getEmergencyTool = (): EmotionRegulationTool =>
    getToolById('grounding_54321') || EMOTION_REGULATION_TOOLKIT[0];
