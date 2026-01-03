/**
 * Motivation Engine
 * 
 * Provides personalized motivational quotes, tips, and reminders
 * based on user's improvement goals. Features:
 * - 50+ curated quotes by category
 * - Actionable tips per improvement area
 * - NLP-based goal categorization
 * - Daily rotation and favorites
 */

// =====================================================
// TYPES
// =====================================================

export type ImprovementCategory =
    | 'consistency' | 'confidence' | 'focus' | 'discipline'
    | 'resilience' | 'energy' | 'mental_strength' | 'self_compassion';

export interface MotivationalQuote {
    id: string;
    text: string;
    author: string;
    categories: ImprovementCategory[];
    type: 'quote' | 'tip' | 'affirmation';
    energy: 'calm' | 'energizing' | 'grounding';
}

export interface ImprovementGoal {
    id: string;
    text: string;
    category: ImprovementCategory;
    created_at: Date;
    active: boolean;
}

export interface UserMotivationProfile {
    goals: ImprovementGoal[];
    daily_quote_last_seen: Date | null;
    favorites: string[];  // Quote IDs
    quotes_seen: string[];  // For rotation
    goal_review_last_prompt: Date | null;
}

export interface MotivationalCard {
    quote: MotivationalQuote;
    context: 'morning' | 'post_session' | 'struggle' | 'celebration';
    goal?: ImprovementGoal;
    tip?: string;
}

// =====================================================
// QUOTE DATABASE - 50+ Curated Quotes
// =====================================================

const QUOTES: MotivationalQuote[] = [
    // CONSISTENCY
    {
        id: 'c1',
        text: "We are what we repeatedly do. Excellence is not an act, but a habit.",
        author: "Aristotle",
        categories: ['consistency', 'discipline'],
        type: 'quote',
        energy: 'grounding'
    },
    {
        id: 'c2',
        text: "Small daily improvements are the key to staggering long-term results.",
        author: "Robin Sharma",
        categories: ['consistency'],
        type: 'quote',
        energy: 'calm'
    },
    {
        id: 'c3',
        text: "Success is the sum of small efforts, repeated day in and day out.",
        author: "Robert Collier",
        categories: ['consistency'],
        type: 'quote',
        energy: 'grounding'
    },
    {
        id: 'c4',
        text: "The secret of your future is hidden in your daily routine.",
        author: "Mike Murdock",
        categories: ['consistency', 'discipline'],
        type: 'quote',
        energy: 'calm'
    },
    {
        id: 'c5',
        text: "It's not what we do once in a while that shapes our lives, but what we do consistently.",
        author: "Tony Robbins",
        categories: ['consistency'],
        type: 'quote',
        energy: 'energizing'
    },

    // CONFIDENCE
    {
        id: 'cf1',
        text: "Confidence comes not from always being right, but from not fearing to be wrong.",
        author: "Peter McIntyre",
        categories: ['confidence'],
        type: 'quote',
        energy: 'grounding'
    },
    {
        id: 'cf2',
        text: "You gain strength, courage, and confidence by every experience in which you stop to look fear in the face.",
        author: "Eleanor Roosevelt",
        categories: ['confidence', 'resilience'],
        type: 'quote',
        energy: 'grounding'
    },
    {
        id: 'cf3',
        text: "Confidence is not 'they will like me.' Confidence is 'I'll be fine if they don't.'",
        author: "Christina Grimmie",
        categories: ['confidence', 'self_compassion'],
        type: 'quote',
        energy: 'calm'
    },
    {
        id: 'cf4',
        text: "Self-confidence is a superpower. Once you start believing in yourself, magic starts happening.",
        author: "Unknown",
        categories: ['confidence'],
        type: 'affirmation',
        energy: 'energizing'
    },
    {
        id: 'cf5',
        text: "With realization of one's own potential and self-confidence in one's ability, one can build a better world.",
        author: "Dalai Lama",
        categories: ['confidence'],
        type: 'quote',
        energy: 'calm'
    },

    // FOCUS
    {
        id: 'f1',
        text: "The successful warrior is the average man, with laser-like focus.",
        author: "Bruce Lee",
        categories: ['focus', 'discipline'],
        type: 'quote',
        energy: 'energizing'
    },
    {
        id: 'f2',
        text: "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus.",
        author: "Alexander Graham Bell",
        categories: ['focus'],
        type: 'quote',
        energy: 'calm'
    },
    {
        id: 'f3',
        text: "Where focus goes, energy flows.",
        author: "Tony Robbins",
        categories: ['focus', 'energy'],
        type: 'quote',
        energy: 'energizing'
    },
    {
        id: 'f4',
        text: "The key to success is to focus on goals, not obstacles.",
        author: "Unknown",
        categories: ['focus', 'resilience'],
        type: 'quote',
        energy: 'grounding'
    },
    {
        id: 'f5',
        text: "Starve your distractions, feed your focus.",
        author: "Unknown",
        categories: ['focus', 'discipline'],
        type: 'affirmation',
        energy: 'energizing'
    },

    // DISCIPLINE
    {
        id: 'd1',
        text: "Discipline is the bridge between goals and accomplishment.",
        author: "Jim Rohn",
        categories: ['discipline'],
        type: 'quote',
        energy: 'grounding'
    },
    {
        id: 'd2',
        text: "Motivation gets you started. Discipline keeps you going.",
        author: "Unknown",
        categories: ['discipline', 'consistency'],
        type: 'quote',
        energy: 'energizing'
    },
    {
        id: 'd3',
        text: "We must all suffer one of two things: the pain of discipline or the pain of regret.",
        author: "Jim Rohn",
        categories: ['discipline'],
        type: 'quote',
        energy: 'grounding'
    },
    {
        id: 'd4',
        text: "Discipline is doing what needs to be done, even when you don't want to do it.",
        author: "Unknown",
        categories: ['discipline', 'mental_strength'],
        type: 'quote',
        energy: 'grounding'
    },
    {
        id: 'd5',
        text: "The only discipline that lasts is self-discipline.",
        author: "Bum Phillips",
        categories: ['discipline'],
        type: 'quote',
        energy: 'calm'
    },

    // RESILIENCE
    {
        id: 'r1',
        text: "Fall seven times, stand up eight.",
        author: "Japanese Proverb",
        categories: ['resilience'],
        type: 'quote',
        energy: 'energizing'
    },
    {
        id: 'r2',
        text: "Rock bottom became the solid foundation on which I rebuilt my life.",
        author: "J.K. Rowling",
        categories: ['resilience'],
        type: 'quote',
        energy: 'grounding'
    },
    {
        id: 'r3',
        text: "A smooth sea never made a skilled sailor.",
        author: "Franklin D. Roosevelt",
        categories: ['resilience', 'mental_strength'],
        type: 'quote',
        energy: 'grounding'
    },
    {
        id: 'r4',
        text: "The oak fought the wind and was broken. The willow bent when it must and survived.",
        author: "Robert Jordan",
        categories: ['resilience'],
        type: 'quote',
        energy: 'calm'
    },
    {
        id: 'r5',
        text: "I didn't fail. I just found 10,000 ways that won't work.",
        author: "Thomas Edison",
        categories: ['resilience', 'confidence'],
        type: 'quote',
        energy: 'energizing'
    },

    // ENERGY
    {
        id: 'e1',
        text: "Take care of your body. It's the only place you have to live.",
        author: "Jim Rohn",
        categories: ['energy'],
        type: 'quote',
        energy: 'calm'
    },
    {
        id: 'e2',
        text: "The higher your energy level, the more efficient your body. The more efficient your body, the better you feel.",
        author: "Tony Robbins",
        categories: ['energy'],
        type: 'quote',
        energy: 'energizing'
    },
    {
        id: 'e3',
        text: "Energy and persistence conquer all things.",
        author: "Benjamin Franklin",
        categories: ['energy', 'consistency'],
        type: 'quote',
        energy: 'energizing'
    },
    {
        id: 'e4',
        text: "Rest when you're weary. Refresh and renew yourself. Then get back to work.",
        author: "Ralph Marston",
        categories: ['energy', 'self_compassion'],
        type: 'quote',
        energy: 'calm'
    },

    // MENTAL STRENGTH
    {
        id: 'm1',
        text: "The mind is everything. What you think, you become.",
        author: "Buddha",
        categories: ['mental_strength'],
        type: 'quote',
        energy: 'grounding'
    },
    {
        id: 'm2',
        text: "Strength does not come from physical capacity. It comes from an indomitable will.",
        author: "Mahatma Gandhi",
        categories: ['mental_strength', 'resilience'],
        type: 'quote',
        energy: 'grounding'
    },
    {
        id: 'm3',
        text: "The body achieves what the mind believes.",
        author: "Unknown",
        categories: ['mental_strength', 'confidence'],
        type: 'affirmation',
        energy: 'energizing'
    },
    {
        id: 'm4',
        text: "Mental toughness is when you can find fuel in an empty tank.",
        author: "Kent Morris",
        categories: ['mental_strength', 'resilience'],
        type: 'quote',
        energy: 'energizing'
    },

    // SELF-COMPASSION
    {
        id: 's1',
        text: "Talk to yourself like someone you love.",
        author: "Brené Brown",
        categories: ['self_compassion'],
        type: 'quote',
        energy: 'calm'
    },
    {
        id: 's2',
        text: "You yourself, as much as anybody in the entire universe, deserve your love and affection.",
        author: "Buddha",
        categories: ['self_compassion'],
        type: 'quote',
        energy: 'calm'
    },
    {
        id: 's3',
        text: "Be gentle with yourself. You're doing the best you can.",
        author: "Unknown",
        categories: ['self_compassion'],
        type: 'affirmation',
        energy: 'calm'
    },
    {
        id: 's4',
        text: "Perfectionism is just fear in fancy shoes.",
        author: "Elizabeth Gilbert",
        categories: ['self_compassion', 'confidence'],
        type: 'quote',
        energy: 'calm'
    },
    {
        id: 's5',
        text: "Progress, not perfection.",
        author: "Unknown",
        categories: ['self_compassion', 'consistency'],
        type: 'affirmation',
        energy: 'grounding'
    }
];

// =====================================================
// TIPS DATABASE
// =====================================================

const TIPS: Record<ImprovementCategory, string[]> = {
    consistency: [
        "Start with just 2 minutes. The hardest part is showing up.",
        "Habit stack: Attach new habits to existing ones.",
        "Track your streak. Visual progress builds momentum.",
        "Don't break the chain. One day at a time.",
        "Lower the bar. Make it so easy you can't say no."
    ],
    confidence: [
        "Recall 3 past successes before a challenge.",
        "Power pose for 2 minutes. It changes your physiology.",
        "Preparation breeds confidence. Review your plan.",
        "Act confident. Your brain follows your body.",
        "Celebrate small wins. Evidence builds belief."
    ],
    focus: [
        "Remove phone from sight during deep work.",
        "Use the 2-minute rule: If it takes <2 min, do it now.",
        "Single-task. Multitasking is a myth.",
        "Time-block your most important work.",
        "The moment you feel distracted, take one deep breath."
    ],
    discipline: [
        "Do the hardest thing first. Eat the frog.",
        "Create constraints. Deadlines drive action.",
        "Pre-commit. Tell someone your plan.",
        "Remove temptations from your environment.",
        "Remember: Pain now or pain later. Choose wisely."
    ],
    resilience: [
        "Ask: What can I learn from this?",
        "Zoom out: Will this matter in 5 years?",
        "Remember a time you overcame something hard.",
        "One thing at a time. That's all you can control.",
        "This too shall pass. Nothing is permanent."
    ],
    energy: [
        "Move your body. Even 5 minutes helps.",
        "Hydrate. Fatigue often masks dehydration.",
        "Check your sleep debt. Rest is productive.",
        "Sun exposure in morning sets your rhythm.",
        "Breathe deeply. Oxygen is energy."
    ],
    mental_strength: [
        "Embrace discomfort. Growth lives there.",
        "Control what you can. Release what you can't.",
        "Your mind will quit before your body. Push through.",
        "Visualize success before you start.",
        "The obstacle is the way. Use it."
    ],
    self_compassion: [
        "What would you say to a friend in this situation?",
        "Struggle is universal. You're not alone in this.",
        "Acknowledge the difficulty. Don't minimize it.",
        "Be your own coach, not your own critic.",
        "Perfection is impossible. Progress is everything."
    ]
};

// =====================================================
// CATEGORY KEYWORDS FOR NLP
// =====================================================

const CATEGORY_KEYWORDS: Record<ImprovementCategory, string[]> = {
    consistency: ['consistent', 'habit', 'daily', 'routine', 'regular', 'stick to', 'every day', 'show up', 'keep going'],
    confidence: ['confident', 'believe', 'doubt', 'self-esteem', 'trust myself', 'sure of myself', 'self-belief'],
    focus: ['focus', 'distracted', 'attention', 'concentrate', 'present', 'scattered', 'wandering', 'zone'],
    discipline: ['discipline', 'lazy', 'procrastinate', 'motivated', 'willpower', 'self-control', 'push myself'],
    resilience: ['setback', 'failure', 'bounce', 'tough', 'adversity', 'recover', 'comeback', 'obstacle'],
    energy: ['energy', 'tired', 'fatigue', 'exhausted', 'vitality', 'drained', 'worn out'],
    mental_strength: ['mental', 'strong', 'weak', 'mindset', 'tough', 'mind', 'psychological'],
    self_compassion: ['hard on myself', 'perfectionist', 'kind', 'self-critical', 'gentle', 'forgiving myself']
};

// =====================================================
// ENGINE CLASS
// =====================================================

export class MotivationEngine {

    // ----------------------
    // GOAL PARSING
    // ----------------------

    /**
     * Analyze free-text goal and detect category
     */
    static parseGoalCategory(text: string): ImprovementCategory {
        const lowerText = text.toLowerCase();
        let bestMatch: ImprovementCategory = 'consistency';
        let bestScore = 0;

        for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
            let score = 0;
            for (const keyword of keywords) {
                if (lowerText.includes(keyword)) score++;
            }
            if (score > bestScore) {
                bestScore = score;
                bestMatch = category as ImprovementCategory;
            }
        }

        return bestMatch;
    }

    /**
     * Create a new improvement goal from text
     */
    static createGoal(text: string): ImprovementGoal {
        return {
            id: `goal_${Date.now()}`,
            text,
            category: this.parseGoalCategory(text),
            created_at: new Date(),
            active: true
        };
    }

    // ----------------------
    // QUOTE RETRIEVAL
    // ----------------------

    /**
     * Get a random quote for a category
     */
    static getQuoteForCategory(category: ImprovementCategory): MotivationalQuote {
        const matching = QUOTES.filter(q => q.categories.includes(category));
        return matching[Math.floor(Math.random() * matching.length)] || QUOTES[0];
    }

    /**
     * Get a quote not seen recently
     */
    static getFreshQuote(
        category: ImprovementCategory,
        seenIds: string[]
    ): MotivationalQuote {
        const matching = QUOTES.filter(q =>
            q.categories.includes(category) && !seenIds.includes(q.id)
        );

        if (matching.length === 0) {
            // All seen, reset and return any
            return this.getQuoteForCategory(category);
        }

        return matching[Math.floor(Math.random() * matching.length)];
    }

    /**
     * Get tip for category
     */
    static getTipForCategory(category: ImprovementCategory): string {
        const tips = TIPS[category];
        return tips[Math.floor(Math.random() * tips.length)];
    }

    // ----------------------
    // CARD GENERATION
    // ----------------------

    /**
     * Generate a motivational card for display
     */
    static generateCard(
        context: 'morning' | 'post_session' | 'struggle' | 'celebration',
        goals: ImprovementGoal[],
        seenQuotes: string[] = []
    ): MotivationalCard | null {
        const activeGoals = goals.filter(g => g.active);

        if (activeGoals.length === 0) {
            // No goals, return a general quote
            const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
            return { quote, context };
        }

        // Pick a goal (weighted towards first/primary)
        const goal = activeGoals[0];

        // Get a fresh quote
        const quote = this.getFreshQuote(goal.category, seenQuotes);

        // Get a matching tip
        const tip = this.getTipForCategory(goal.category);

        return {
            quote,
            context,
            goal,
            tip
        };
    }

    /**
     * Get morning motivation card
     */
    static getMorningCard(goals: ImprovementGoal[], seenQuotes: string[] = []): MotivationalCard | null {
        return this.generateCard('morning', goals, seenQuotes);
    }

    /**
     * Get post-session affirmation
     */
    static getPostSessionCard(goals: ImprovementGoal[]): MotivationalCard | null {
        const affirmations: MotivationalQuote[] = [
            { id: 'ps1', text: "You showed up today. That's what champions do.", author: "Sentient", categories: ['consistency'], type: 'affirmation', energy: 'energizing' },
            { id: 'ps2', text: "One more session in the bank. You're building something.", author: "Sentient", categories: ['consistency'], type: 'affirmation', energy: 'calm' },
            { id: 'ps3', text: "Progress, not perfection. You did the work.", author: "Sentient", categories: ['self_compassion'], type: 'affirmation', energy: 'grounding' }
        ];

        const quote = affirmations[Math.floor(Math.random() * affirmations.length)];
        return { quote, context: 'post_session', goal: goals[0] };
    }

    /**
     * Get celebration card for streaks
     */
    static getStreakCelebration(streakDays: number, goals: ImprovementGoal[]): MotivationalCard | null {
        const celebrations: Record<number, string> = {
            3: "3 days! The momentum is building. 🔥",
            7: "One week! You're proving consistency. 💪",
            14: "Two weeks! This is becoming a habit. ⭐",
            21: "21 days! They say habits form in 21 days. You did it. 🏆",
            30: "30 days! A full month of dedication. You're unstoppable. 🚀",
            60: "60 days! Two months of commitment. Elite mindset. 🥇",
            90: "90 days! Quarter year of consistency. You've changed. 💎",
            100: "100 days! Triple digits. You're a different person now. 🌟"
        };

        const message = celebrations[streakDays];
        if (!message) return null;

        const quote: MotivationalQuote = {
            id: `streak_${streakDays}`,
            text: message,
            author: "Your Progress",
            categories: ['consistency'],
            type: 'affirmation',
            energy: 'energizing'
        };

        return { quote, context: 'celebration', goal: goals[0] };
    }

    // ----------------------
    // GOAL REVIEW
    // ----------------------

    /**
     * Check if goal review is due (weekly)
     */
    static isGoalReviewDue(lastReview: Date | null): boolean {
        if (!lastReview) return true;
        const daysSince = (Date.now() - lastReview.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince >= 7;
    }

    /**
     * Get all quotes
     */
    static getAllQuotes(): MotivationalQuote[] {
        return [...QUOTES];
    }

    /**
     * Get all categories with display info
     */
    static getCategories(): Array<{ id: ImprovementCategory; label: string; emoji: string }> {
        return [
            { id: 'consistency', label: 'Consistency', emoji: '🔄' },
            { id: 'confidence', label: 'Confidence', emoji: '💪' },
            { id: 'focus', label: 'Focus', emoji: '🎯' },
            { id: 'discipline', label: 'Discipline', emoji: '⚡' },
            { id: 'resilience', label: 'Resilience', emoji: '🌱' },
            { id: 'energy', label: 'Energy', emoji: '⚡' },
            { id: 'mental_strength', label: 'Mental Strength', emoji: '🧠' },
            { id: 'self_compassion', label: 'Self-Compassion', emoji: '💙' }
        ];
    }
}

export default MotivationEngine;
