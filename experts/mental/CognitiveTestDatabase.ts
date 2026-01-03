/**
 * Cognitive Test Database
 * 
 * Comprehensive library of cognitive assessments and training modes
 * with sport-specific variations, adaptive difficulty, and tracking.
 * 
 * Research Sources:
 * - Cambridge Brain Sciences
 * - Lumosity research
 * - Sport psychology literature
 * - Dual N-Back research (Jaeggi et al.)
 */

// =====================================================
// TYPES
// =====================================================

export type CognitiveTestCategory = 'reaction' | 'memory' | 'attention' | 'executive' | 'spatial' | 'processing';
export type TestMode = 'assessment' | 'training' | 'game';

export interface CognitiveTestConfig {
    id: string;
    name: string;
    emoji: string;
    category: CognitiveTestCategory;

    // Timing
    duration_seconds: number;
    trials_per_session: number;

    // Description
    description: string;
    sport_relevance: string;
    science: string;
    measures: string[];

    // Difficulty
    base_difficulty: 1 | 2 | 3 | 4 | 5;
    has_adaptive: boolean;
    levels: number;

    // Training
    training_benefit: string;
    recommended_frequency: string;

    // Sport mapping
    best_for_sports: string[];

    // Scoring
    scoring_type: 'time_lower_better' | 'accuracy_higher_better' | 'composite';
    baseline_range: { poor: number; average: number; good: number; elite: number };
}

export interface TestResult {
    test_id: string;
    timestamp: Date;
    score: number;
    accuracy: number;
    reaction_time_ms?: number;
    level_reached?: number;
    personal_best: boolean;
    comparison_to_baseline: 'below' | 'at' | 'above' | 'elite';
}

export interface UserCognitiveProfile {
    reaction_baseline_ms: number;
    memory_span_baseline: number;
    focus_score_baseline: number;
    test_history: TestResult[];
    strengths: CognitiveTestCategory[];
    weaknesses: CognitiveTestCategory[];
    streak_days: number;
    total_training_minutes: number;
}

// =====================================================
// COGNITIVE TESTS
// =====================================================

export const COGNITIVE_TESTS: CognitiveTestConfig[] = [
    // ==========================================
    // REACTION TESTS
    // ==========================================
    {
        id: 'simple_reaction',
        name: 'Simple Reaction',
        emoji: '⚡',
        category: 'reaction',
        duration_seconds: 60,
        trials_per_session: 20,
        description: 'Tap as fast as possible when the color changes. Measures pure CNS speed.',
        sport_relevance: 'Sprint starts, goalkeeper saves, return of serve',
        science: 'Simple reaction time reflects neural transmission speed. Affected by fatigue, arousal, sleep.',
        measures: ['CNS latency', 'Alertness', 'Fatigue detection'],
        base_difficulty: 1,
        has_adaptive: false,
        levels: 1,
        training_benefit: 'Limited trainability (5-10% improvement). Best as diagnostic.',
        recommended_frequency: '2-3x per week for monitoring',
        best_for_sports: ['Sprinting', 'Tennis', 'Goalkeeper', 'Boxing'],
        scoring_type: 'time_lower_better',
        baseline_range: { poor: 300, average: 250, good: 200, elite: 170 }
    },
    {
        id: 'choice_reaction',
        name: 'Choice Reaction',
        emoji: '🎯',
        category: 'reaction',
        duration_seconds: 90,
        trials_per_session: 40,
        description: 'Multiple targets, tap the correct one. Measures decision-reaction speed.',
        sport_relevance: 'Reading play, pass/shoot decisions, tackle timing',
        science: 'Hick\'s Law: Choice RT increases with options. Sport expertise reduces this.',
        measures: ['Decision speed', 'Selective attention', 'Sport-specific processing'],
        base_difficulty: 2,
        has_adaptive: true,
        levels: 5,
        training_benefit: 'Moderate trainability. Sport-specific practice transfers.',
        recommended_frequency: '3-4x per week',
        best_for_sports: ['Basketball', 'Soccer', 'Hockey', 'MMA'],
        scoring_type: 'composite',
        baseline_range: { poor: 450, average: 380, good: 320, elite: 270 }
    },
    {
        id: 'go_nogo',
        name: 'Go/No-Go',
        emoji: '🛑',
        category: 'executive',
        duration_seconds: 120,
        trials_per_session: 50,
        description: 'Tap on green, withhold on red. Measures impulse control.',
        sport_relevance: 'Not committing to fake, discipline under pressure, penalty decisions',
        science: 'Prefrontal cortex inhibition test. Impaired by fatigue, stress.',
        measures: ['Impulse control', 'Response inhibition', 'Executive function'],
        base_difficulty: 2,
        has_adaptive: true,
        levels: 5,
        training_benefit: 'Good trainability. Transfers to decision-making in sport.',
        recommended_frequency: '3x per week',
        best_for_sports: ['Defending sports', 'Combat sports', 'Referee training'],
        scoring_type: 'accuracy_higher_better',
        baseline_range: { poor: 70, average: 85, good: 93, elite: 98 }
    },

    // ==========================================
    // MEMORY TESTS
    // ==========================================
    {
        id: 'spatial_span',
        name: 'Spatial Memory',
        emoji: '🧠',
        category: 'memory',
        duration_seconds: 180,
        trials_per_session: 15,
        description: 'Remember and repeat the sequence of lit squares. Tests spatial working memory.',
        sport_relevance: 'Play patterns, set pieces, court awareness',
        science: 'Corsi block-tapping task. Capacity ~7±2 items. Trainable with practice.',
        measures: ['Spatial working memory', 'Sequence encoding', 'Pattern recognition'],
        base_difficulty: 2,
        has_adaptive: true,
        levels: 12,
        training_benefit: 'High trainability. 15-20% improvement possible.',
        recommended_frequency: '4-5x per week',
        best_for_sports: ['Team sports', 'Chess', 'Snooker', 'Motorsport'],
        scoring_type: 'accuracy_higher_better',
        baseline_range: { poor: 4, average: 5.5, good: 7, elite: 9 }
    },
    {
        id: 'dual_nback',
        name: 'Dual N-Back',
        emoji: '🔢',
        category: 'memory',
        duration_seconds: 300,
        trials_per_session: 20,
        description: 'Track position AND sound N steps back. Ultimate working memory challenge.',
        sport_relevance: 'Multi-tasking, processing multiple game variables',
        science: 'Jaeggi et al.: May improve fluid intelligence. Controversial but well-studied.',
        measures: ['Working memory capacity', 'Divided attention', 'Fluid intelligence'],
        base_difficulty: 5,
        has_adaptive: true,
        levels: 9,
        training_benefit: 'Debated. Some studies show transfer, others don\'t.',
        recommended_frequency: '5x per week for maximum effect',
        best_for_sports: ['Esports', 'Motorsport', 'Air sports'],
        scoring_type: 'accuracy_higher_better',
        baseline_range: { poor: 40, average: 60, good: 80, elite: 95 }
    },

    // ==========================================
    // ATTENTION TESTS
    // ==========================================
    {
        id: 'focus_tracking',
        name: 'Focus Tracking',
        emoji: '👁️',
        category: 'attention',
        duration_seconds: 120,
        trials_per_session: 1,
        description: 'Keep your gaze on the moving target. Measures sustained attention.',
        sport_relevance: 'Ball tracking, opponent tracking, concentration under fatigue',
        science: 'Smooth pursuit eye movements + sustained attention. Degraded by fatigue.',
        measures: ['Sustained attention', 'Eye-hand coordination', 'Focus endurance'],
        base_difficulty: 2,
        has_adaptive: true,
        levels: 5,
        training_benefit: 'Moderate. Transfers to sport tracking tasks.',
        recommended_frequency: '3x per week',
        best_for_sports: ['Ball sports', 'Archery', 'Shooting', 'Golf'],
        scoring_type: 'accuracy_higher_better',
        baseline_range: { poor: 60, average: 75, good: 88, elite: 95 }
    },
    {
        id: 'stroop_test',
        name: 'Stroop Test',
        emoji: '🔤',
        category: 'attention',
        duration_seconds: 90,
        trials_per_session: 40,
        description: 'Word says "RED" but color is blue. Tap the COLOR, not the word.',
        sport_relevance: 'Focus under conflict, ignoring distractions, pressure situations',
        science: 'Golden standard for selective attention and cognitive interference.',
        measures: ['Selective attention', 'Cognitive flexibility', 'Interference control'],
        base_difficulty: 3,
        has_adaptive: true,
        levels: 5,
        training_benefit: 'Moderate trainability. Good for focus training.',
        recommended_frequency: '3x per week',
        best_for_sports: ['All sports', 'Especially high-pressure moments'],
        scoring_type: 'composite',
        baseline_range: { poor: 65, average: 80, good: 90, elite: 97 }
    },
    {
        id: 'peripheral_vision',
        name: 'Peripheral Vision',
        emoji: '👀',
        category: 'spatial',
        duration_seconds: 120,
        trials_per_session: 30,
        description: 'Keep eyes on center. Tap targets appearing in periphery.',
        sport_relevance: 'Field awareness, seeing teammates, peripheral threats',
        science: 'Useful field of view (UFOV). Trainable component of visual attention.',
        measures: ['Peripheral awareness', 'Divided attention', 'Visual field'],
        base_difficulty: 3,
        has_adaptive: true,
        levels: 6,
        training_benefit: 'High trainability. Significant performance transfer.',
        recommended_frequency: '4x per week',
        best_for_sports: ['Team sports', 'Driving', 'Cycling', 'Combat sports'],
        scoring_type: 'composite',
        baseline_range: { poor: 55, average: 70, good: 85, elite: 95 }
    },

    // ==========================================
    // EXECUTIVE FUNCTION
    // ==========================================
    {
        id: 'task_switching',
        name: 'Task Switching',
        emoji: '🔄',
        category: 'executive',
        duration_seconds: 120,
        trials_per_session: 40,
        description: 'Rules change mid-task. Adapt quickly to new instructions.',
        sport_relevance: 'Tactical changes, coach instructions, game situations',
        science: 'Measures cognitive flexibility and mental set shifting.',
        measures: ['Cognitive flexibility', 'Adaptability', 'Mental switching cost'],
        base_difficulty: 4,
        has_adaptive: true,
        levels: 5,
        training_benefit: 'Moderate trainability. Useful for tactical sports.',
        recommended_frequency: '3x per week',
        best_for_sports: ['Team sports', 'Racket sports', 'Combat sports'],
        scoring_type: 'composite',
        baseline_range: { poor: 60, average: 75, good: 88, elite: 95 }
    },
    {
        id: 'decision_speed',
        name: 'Decision Speed',
        emoji: '⚖️',
        category: 'processing',
        duration_seconds: 90,
        trials_per_session: 30,
        description: 'Sport-specific scenarios. Choose the best option fast.',
        sport_relevance: 'Direct transfer to game decisions',
        science: 'Pattern recognition + decision making. Expert-novice differences.',
        measures: ['Decision quality', 'Pattern recognition', 'Anticipation'],
        base_difficulty: 3,
        has_adaptive: true,
        levels: 5,
        training_benefit: 'High trainability with sport-specific content.',
        recommended_frequency: '4x per week',
        best_for_sports: ['All sports'],
        scoring_type: 'composite',
        baseline_range: { poor: 60, average: 75, good: 87, elite: 95 }
    }
];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export const getTestById = (id: string): CognitiveTestConfig | undefined =>
    COGNITIVE_TESTS.find(t => t.id === id);

export const getTestsByCategory = (category: CognitiveTestCategory): CognitiveTestConfig[] =>
    COGNITIVE_TESTS.filter(t => t.category === category);

export const getTestsForSport = (sport: string): CognitiveTestConfig[] =>
    COGNITIVE_TESTS.filter(t =>
        t.best_for_sports.some(s =>
            s.toLowerCase().includes(sport.toLowerCase()) ||
            s.toLowerCase() === 'all sports'
        )
    );

export const getRecommendedTests = (
    profile: UserCognitiveProfile,
    available_minutes: number
): CognitiveTestConfig[] => {
    // Prioritize weaknesses and tests not done recently
    const recentTestIds = profile.test_history
        .filter(t => Date.now() - t.timestamp.getTime() < 24 * 60 * 60 * 1000)
        .map(t => t.test_id);

    return COGNITIVE_TESTS
        .filter(t => !recentTestIds.includes(t.id))
        .filter(t => t.duration_seconds / 60 <= available_minutes)
        .sort((a, b) => {
            // Prioritize weaknesses
            const aIsWeak = profile.weaknesses.includes(a.category) ? -1 : 0;
            const bIsWeak = profile.weaknesses.includes(b.category) ? -1 : 0;
            return aIsWeak - bIsWeak;
        })
        .slice(0, 3);
};

export const calculatePerformanceRating = (
    test: CognitiveTestConfig,
    score: number
): 'poor' | 'average' | 'good' | 'elite' => {
    const { baseline_range, scoring_type } = test;

    if (scoring_type === 'time_lower_better') {
        if (score <= baseline_range.elite) return 'elite';
        if (score <= baseline_range.good) return 'good';
        if (score <= baseline_range.average) return 'average';
        return 'poor';
    } else {
        if (score >= baseline_range.elite) return 'elite';
        if (score >= baseline_range.good) return 'good';
        if (score >= baseline_range.average) return 'average';
        return 'poor';
    }
};

export const getAdaptiveDifficulty = (
    test_id: string,
    recent_scores: number[]
): number => {
    if (recent_scores.length < 3) return 1;

    const avg = recent_scores.slice(-5).reduce((a, b) => a + b, 0) / Math.min(5, recent_scores.length);

    // If consistently scoring above 85%, increase difficulty
    if (avg > 85) return Math.min(5, Math.floor(avg / 17));
    // If struggling below 60%, decrease
    if (avg < 60) return Math.max(1, Math.floor(avg / 30));

    return Math.round(avg / 20);
};
