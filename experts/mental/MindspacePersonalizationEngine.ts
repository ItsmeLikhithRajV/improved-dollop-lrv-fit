/**
 * Mindspace Personalization Engine
 * 
 * Learns user preferences and effectiveness to deliver
 * personalized mental training recommendations.
 * 
 * Tracks:
 * - Protocol effectiveness per user
 * - Optimal times for mental training
 * - User skill levels
 * - Personal patterns
 */

import { BreathworkProtocol, getProtocolById, BREATHWORK_PROTOCOLS } from './BreathworkDatabase';
import { CognitiveTestConfig, COGNITIVE_TESTS } from './CognitiveTestDatabase';
import { EmotionRegulationTool, EMOTION_REGULATION_TOOLKIT } from './EmotionRegulationToolkit';

// =====================================================
// TYPES
// =====================================================

export interface ProtocolUsage {
    protocol_id: string;
    protocol_type: 'breathwork' | 'cognitive' | 'emotion';
    timestamp: Date;
    duration_minutes: number;
    completed: boolean;

    // Before/after metrics
    stress_before?: number;
    stress_after?: number;
    mood_before?: number;
    mood_after?: number;
    hrv_before?: number;
    hrv_after?: number;

    // Calculated
    effectiveness_score: number;  // 0-100
    user_rating?: number;  // 1-5 stars
}

export interface UserMindspaceProfile {
    user_id: string;

    // Experience levels
    breathwork_experience: 'novice' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
    cognitive_training_days: number;
    meditation_experience_months: number;

    // Preferences
    preferred_session_length_minutes: number;
    preferred_time_of_day: 'morning' | 'midday' | 'evening' | 'night';
    prefers_guided: boolean;
    prefers_audio: boolean;
    prefers_haptic: boolean;

    // Personal patterns
    stress_patterns: {
        typical_morning: number;
        typical_evening: number;
        high_stress_triggers: string[];
    };

    // Baselines
    hrv_baseline: number;
    optimal_breathing_rate: number;  // Discovered through training

    // Streaks & Progress
    current_streak_days: number;
    longest_streak_days: number;
    total_sessions: number;
    total_minutes: number;

    // Protocol history
    protocol_history: ProtocolUsage[];

    // Favorites
    favorite_breathwork_ids: string[];
    favorite_emotion_tools: string[];

    // Blocked/avoided
    blocked_protocol_ids: string[];  // Contraindicated
}

export interface PersonalizedRecommendation {
    type: 'breathwork' | 'cognitive' | 'emotion';
    item: BreathworkProtocol | CognitiveTestConfig | EmotionRegulationTool;
    reason: string;
    predicted_effectiveness: number;
    urgency: 'critical' | 'high' | 'medium' | 'low';
    personalization_factors: string[];
}

// =====================================================
// DEFAULT PROFILE
// =====================================================

export const createDefaultProfile = (user_id: string): UserMindspaceProfile => ({
    user_id,
    breathwork_experience: 'beginner',
    cognitive_training_days: 0,
    meditation_experience_months: 0,
    preferred_session_length_minutes: 5,
    preferred_time_of_day: 'morning',
    prefers_guided: true,
    prefers_audio: true,
    prefers_haptic: true,
    stress_patterns: {
        typical_morning: 4,
        typical_evening: 5,
        high_stress_triggers: []
    },
    hrv_baseline: 45,
    optimal_breathing_rate: 5.5,
    current_streak_days: 0,
    longest_streak_days: 0,
    total_sessions: 0,
    total_minutes: 0,
    protocol_history: [],
    favorite_breathwork_ids: [],
    favorite_emotion_tools: [],
    blocked_protocol_ids: []
});

// =====================================================
// PERSONALIZATION ENGINE
// =====================================================

export class MindspacePersonalizationEngine {
    private profile: UserMindspaceProfile;

    constructor(profile?: UserMindspaceProfile) {
        this.profile = profile || createDefaultProfile('default');
    }

    /**
     * Update profile with new data
     */
    updateProfile(updates: Partial<UserMindspaceProfile>): void {
        this.profile = { ...this.profile, ...updates };
    }

    /**
     * Log a protocol usage
     */
    logProtocolUsage(usage: ProtocolUsage): void {
        this.profile.protocol_history.push(usage);

        if (usage.completed) {
            this.profile.total_sessions++;
            this.profile.total_minutes += usage.duration_minutes;

            // Update streak
            const today = new Date().toDateString();
            const lastSession = this.profile.protocol_history
                .filter(p => p.completed)
                .slice(-2)[0];

            if (lastSession) {
                const lastDate = new Date(lastSession.timestamp).toDateString();
                const yesterday = new Date(Date.now() - 86400000).toDateString();

                if (lastDate === yesterday || lastDate === today) {
                    this.profile.current_streak_days++;
                    this.profile.longest_streak_days = Math.max(
                        this.profile.longest_streak_days,
                        this.profile.current_streak_days
                    );
                } else if (lastDate !== today) {
                    this.profile.current_streak_days = 1;
                }
            } else {
                this.profile.current_streak_days = 1;
            }
        }

        // Update experience level
        this.updateExperienceLevel();
    }

    /**
     * Update experience level based on history
     */
    private updateExperienceLevel(): void {
        const breathworkSessions = this.profile.protocol_history
            .filter(p => p.protocol_type === 'breathwork' && p.completed).length;

        if (breathworkSessions >= 100) {
            this.profile.breathwork_experience = 'expert';
        } else if (breathworkSessions >= 50) {
            this.profile.breathwork_experience = 'advanced';
        } else if (breathworkSessions >= 20) {
            this.profile.breathwork_experience = 'intermediate';
        } else if (breathworkSessions >= 5) {
            this.profile.breathwork_experience = 'beginner';
        }

        this.profile.cognitive_training_days = new Set(
            this.profile.protocol_history
                .filter(p => p.protocol_type === 'cognitive')
                .map(p => new Date(p.timestamp).toDateString())
        ).size;
    }

    /**
     * Get effectiveness rating for a specific protocol
     */
    getProtocolEffectiveness(protocol_id: string): number | null {
        const usages = this.profile.protocol_history
            .filter(p => p.protocol_id === protocol_id && p.completed);

        if (usages.length === 0) return null;

        const scores = usages.map(u => u.effectiveness_score);
        return scores.reduce((a, b) => a + b, 0) / scores.length;
    }

    /**
     * Get personalized breathwork recommendations
     */
    getBreathworkRecommendations(
        context: {
            stress_level: number;
            time_available_minutes: number;
            goal: 'calming' | 'activating' | 'focus' | 'recovery';
            hours_to_event?: number;
            hours_to_sleep?: number;
        }
    ): PersonalizedRecommendation[] {
        const { stress_level, time_available_minutes, goal, hours_to_event, hours_to_sleep } = context;

        const recommendations: PersonalizedRecommendation[] = [];

        // Filter by context
        const candidates = BREATHWORK_PROTOCOLS.filter(protocol => {
            // Time filter
            if (protocol.min_duration_minutes > time_available_minutes) return false;

            // Experience filter
            if (protocol.requires_experience &&
                ['novice', 'beginner'].includes(this.profile.breathwork_experience)) {
                return false;
            }

            // Difficulty filter
            const expLevel = {
                novice: 1, beginner: 2, intermediate: 3, advanced: 4, expert: 5
            }[this.profile.breathwork_experience];
            if (protocol.difficulty > expLevel + 1) return false;

            // Blocked filter
            if (this.profile.blocked_protocol_ids.includes(protocol.id)) return false;

            // Sleep proximity filter
            if (hours_to_sleep !== undefined && protocol.blocked_when.hours_before_sleep &&
                hours_to_sleep < protocol.blocked_when.hours_before_sleep) {
                return false;
            }

            // Stress level filter
            if (protocol.blocked_when.stress_above && stress_level > protocol.blocked_when.stress_above) {
                return false;
            }

            return true;
        });

        // Score candidates
        for (const protocol of candidates) {
            let score = 50;  // Base score
            const factors: string[] = [];

            // Goal alignment
            if (goal === 'calming' && protocol.primary_effect === 'calming') {
                score += 20;
                factors.push('Matches calming goal');
            }
            if (goal === 'activating' && protocol.primary_effect === 'activating') {
                score += 20;
                factors.push('Matches activation goal');
            }
            if (goal === 'focus' && protocol.primary_effect === 'focus') {
                score += 20;
                factors.push('Matches focus goal');
            }
            if (goal === 'recovery' && protocol.primary_effect === 'recovery') {
                score += 20;
                factors.push('Matches recovery goal');
            }

            // Past effectiveness
            const pastEffectiveness = this.getProtocolEffectiveness(protocol.id);
            if (pastEffectiveness !== null) {
                score += (pastEffectiveness - 50) / 2;
                if (pastEffectiveness > 70) {
                    factors.push('High personal effectiveness');
                }
            }

            // Favorites bonus
            if (this.profile.favorite_breathwork_ids.includes(protocol.id)) {
                score += 10;
                factors.push('A favorite of yours');
            }

            // Recency penalty (don't repeat too often)
            const recentUsage = this.profile.protocol_history
                .filter(p => p.protocol_id === protocol.id)
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
            if (recentUsage) {
                const hoursSince = (Date.now() - recentUsage.timestamp.getTime()) / (1000 * 60 * 60);
                if (hoursSince < 4) score -= 15;
            }

            // Pre-event boost
            if (hours_to_event !== undefined && hours_to_event < 2) {
                if (protocol.id === 'activation_ladder' || protocol.id === 'tactical_breathing') {
                    score += 15;
                    factors.push('Pre-event optimal');
                }
            }

            // Determine urgency
            let urgency: 'critical' | 'high' | 'medium' | 'low' = 'medium';
            if (stress_level >= 8) urgency = 'critical';
            else if (stress_level >= 6) urgency = 'high';
            else if (stress_level <= 3) urgency = 'low';

            recommendations.push({
                type: 'breathwork',
                item: protocol,
                reason: factors[0] || 'Recommended for you',
                predicted_effectiveness: Math.round(Math.min(100, Math.max(0, score))),
                urgency,
                personalization_factors: factors
            });
        }

        // Sort by predicted effectiveness
        return recommendations
            .sort((a, b) => b.predicted_effectiveness - a.predicted_effectiveness)
            .slice(0, 5);
    }

    /**
     * Get emotion regulation recommendations
     */
    getEmotionToolRecommendations(
        context: {
            emotion: string;
            intensity: number;
            can_be_private: boolean;
            time_available_minutes: number;
        }
    ): PersonalizedRecommendation[] {
        const { emotion, intensity, can_be_private, time_available_minutes } = context;

        const recommendations: PersonalizedRecommendation[] = [];

        for (const tool of EMOTION_REGULATION_TOOLKIT) {
            // Filter
            if (!tool.trigger_emotions.includes(emotion as any)) continue;
            if (intensity < tool.intensity_range.min || intensity > tool.intensity_range.max) continue;
            if (!can_be_private && !tool.can_do_publicly) continue;
            if (tool.duration_minutes > time_available_minutes) continue;

            // Skip if requires practice and user is new
            if (tool.requires_practice && this.profile.total_sessions < 10) continue;

            let score = 60;
            const factors: string[] = [];

            // Evidence level
            if (tool.evidence_level === 'strong') {
                score += 15;
                factors.push('Strong research support');
            }

            // Past effectiveness
            const pastEffectiveness = this.getProtocolEffectiveness(tool.id);
            if (pastEffectiveness !== null && pastEffectiveness > 70) {
                score += 20;
                factors.push('Works well for you');
            }

            // Favorites
            if (this.profile.favorite_emotion_tools.includes(tool.id)) {
                score += 10;
                factors.push('A go-to tool for you');
            }

            recommendations.push({
                type: 'emotion',
                item: tool,
                reason: factors[0] || `For ${emotion} at intensity ${intensity}`,
                predicted_effectiveness: Math.round(Math.min(100, score)),
                urgency: intensity >= 7 ? 'high' : 'medium',
                personalization_factors: factors
            });
        }

        return recommendations
            .sort((a, b) => b.predicted_effectiveness - a.predicted_effectiveness)
            .slice(0, 3);
    }

    /**
     * Get cognitive test recommendations
     */
    getCognitiveTestRecommendations(
        available_minutes: number
    ): PersonalizedRecommendation[] {
        const recommendations: PersonalizedRecommendation[] = [];

        // Find tests not done recently
        const recentTests = new Set(
            this.profile.protocol_history
                .filter(p => p.protocol_type === 'cognitive' &&
                    Date.now() - p.timestamp.getTime() < 24 * 60 * 60 * 1000)
                .map(p => p.protocol_id)
        );

        for (const test of COGNITIVE_TESTS) {
            if (test.duration_seconds / 60 > available_minutes) continue;
            if (recentTests.has(test.id)) continue;

            let score = 50;
            const factors: string[] = [];

            // Variety bonus
            if (!recentTests.has(test.id)) {
                score += 10;
            }

            // Category balance - prioritize underutilized categories
            const categoryUsage = this.profile.protocol_history
                .filter(p => p.protocol_type === 'cognitive')
                .reduce((acc, p) => {
                    const cat = COGNITIVE_TESTS.find(t => t.id === p.protocol_id)?.category;
                    if (cat) acc[cat] = (acc[cat] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);

            const thisUsage = categoryUsage[test.category] || 0;
            const avgUsage = Object.values(categoryUsage).reduce((a, b) => a + b, 0) /
                Object.keys(categoryUsage).length || 0;

            if (thisUsage < avgUsage) {
                score += 15;
                factors.push('Train this less often');
            }

            // Training days bonus
            if (this.profile.cognitive_training_days >= 7) {
                score += 10;
                factors.push('Building consistency');
            }

            recommendations.push({
                type: 'cognitive',
                item: test,
                reason: factors[0] || 'Recommended test',
                predicted_effectiveness: score,
                urgency: 'low',
                personalization_factors: factors
            });
        }

        return recommendations
            .sort((a, b) => b.predicted_effectiveness - a.predicted_effectiveness)
            .slice(0, 3);
    }

    /**
     * Get the profile for saving
     */
    getProfile(): UserMindspaceProfile {
        return { ...this.profile };
    }

    /**
     * Calculate next optimal breathing rate based on coherence data
     */
    updateOptimalBreathingRate(coherence_readings: Array<{ rate: number; score: number }>): void {
        if (coherence_readings.length < 5) return;

        // Find rate with highest average coherence
        const byRate = coherence_readings.reduce((acc, r) => {
            const key = Math.round(r.rate * 2) / 2;  // Round to 0.5
            if (!acc[key]) acc[key] = [];
            acc[key].push(r.score);
            return acc;
        }, {} as Record<number, number[]>);

        let bestRate = this.profile.optimal_breathing_rate;
        let bestScore = 0;

        for (const [rate, scores] of Object.entries(byRate)) {
            const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
            if (avg > bestScore) {
                bestScore = avg;
                bestRate = parseFloat(rate);
            }
        }

        // Gradual adjustment
        this.profile.optimal_breathing_rate =
            this.profile.optimal_breathing_rate * 0.7 + bestRate * 0.3;
    }
}

// =====================================================
// SINGLETON EXPORT
// =====================================================

export const mindspacePersonalization = new MindspacePersonalizationEngine();
