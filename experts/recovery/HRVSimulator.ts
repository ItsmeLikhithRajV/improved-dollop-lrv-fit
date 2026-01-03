/**
 * HRV Simulator
 * 
 * Simulates realistic HRV coherence data for biofeedback during
 * breathing sessions. Will be replaced with real wearable integration later.
 * 
 * Based on HeartMath research on coherence patterns.
 */

// =====================================================
// TYPES
// =====================================================

export interface HRVReading {
    timestamp: Date;
    rmssd: number;              // Root mean square of successive differences
    sdnn: number;               // Standard deviation of NN intervals
    coherence_score: number;    // 0-100 coherence metric
    heart_rate: number;         // BPM
    respiratory_rate: number;   // Breaths per minute
    lf_hf_ratio: number;       // Low freq / High freq power ratio
    pnn50: number;             // % of successive intervals differing by >50ms
}

export interface CoherenceSession {
    start_time: Date;
    readings: HRVReading[];
    average_coherence: number;
    peak_coherence: number;
    time_in_coherence_seconds: number;  // Coherence > 50
    time_in_high_coherence_seconds: number;  // Coherence > 75
}

export interface UserHRVBaseline {
    resting_hr: number;
    rmssd_baseline: number;
    coherence_baseline: number;
    optimal_breathing_rate: number;  // Breaths per minute for max coherence
}

// =====================================================
// SIMULATOR CLASS
// =====================================================

export class HRVSimulator {
    private baseline: UserHRVBaseline;
    private currentSession: CoherenceSession | null = null;
    private isBreathing: boolean = false;
    private breathPhase: 'inhale' | 'exhale' | 'hold' = 'exhale';
    private breathingRate: number = 6;  // Breaths per minute
    private stressLevel: number = 5;    // 1-10

    constructor(baseline?: Partial<UserHRVBaseline>) {
        this.baseline = {
            resting_hr: baseline?.resting_hr || 65,
            rmssd_baseline: baseline?.rmssd_baseline || 45,
            coherence_baseline: baseline?.coherence_baseline || 40,
            optimal_breathing_rate: baseline?.optimal_breathing_rate || 5.5
        };
    }

    /**
     * Configure simulator based on user profile
     */
    configure(params: {
        resting_hr?: number;
        fitness_level?: 'beginner' | 'intermediate' | 'advanced' | 'elite';
        stress_level?: number;
        sleep_quality?: number;  // 0-100
        caffeine_mg?: number;
    }): void {
        if (params.resting_hr) {
            this.baseline.resting_hr = params.resting_hr;
        }

        // Fitness affects HRV baseline
        if (params.fitness_level) {
            const fitnessMultiplier = {
                beginner: 0.8,
                intermediate: 1.0,
                advanced: 1.2,
                elite: 1.5
            };
            this.baseline.rmssd_baseline *= fitnessMultiplier[params.fitness_level];
        }

        if (params.stress_level !== undefined) {
            this.stressLevel = params.stress_level;
        }

        // Poor sleep reduces HRV
        if (params.sleep_quality !== undefined && params.sleep_quality < 70) {
            const sleepPenalty = (70 - params.sleep_quality) / 100;
            this.baseline.rmssd_baseline *= (1 - sleepPenalty * 0.3);
        }

        // Caffeine increases HR, decreases HRV
        if (params.caffeine_mg !== undefined && params.caffeine_mg > 100) {
            const caffeinePenalty = Math.min(0.2, (params.caffeine_mg - 100) / 500);
            this.baseline.resting_hr += params.caffeine_mg / 50;
            this.baseline.rmssd_baseline *= (1 - caffeinePenalty);
        }
    }

    /**
     * Start a coherence session
     */
    startSession(): void {
        this.currentSession = {
            start_time: new Date(),
            readings: [],
            average_coherence: 0,
            peak_coherence: 0,
            time_in_coherence_seconds: 0,
            time_in_high_coherence_seconds: 0
        };
    }

    /**
     * End session and return summary
     */
    endSession(): CoherenceSession | null {
        if (!this.currentSession) return null;

        const session = { ...this.currentSession };

        // Calculate summary stats
        if (session.readings.length > 0) {
            session.average_coherence =
                session.readings.reduce((sum, r) => sum + r.coherence_score, 0) / session.readings.length;
            session.peak_coherence = Math.max(...session.readings.map(r => r.coherence_score));

            // Count time in coherence (assuming 1-second readings)
            session.time_in_coherence_seconds =
                session.readings.filter(r => r.coherence_score > 50).length;
            session.time_in_high_coherence_seconds =
                session.readings.filter(r => r.coherence_score > 75).length;
        }

        this.currentSession = null;
        return session;
    }

    /**
     * Set current breath phase for coherence calculation
     */
    setBreathPhase(phase: 'inhale' | 'exhale' | 'hold'): void {
        this.breathPhase = phase;
        this.isBreathing = true;
    }

    /**
     * Set breathing rate for coherence optimization
     */
    setBreathingRate(bpm: number): void {
        this.breathingRate = bpm;
    }

    /**
     * Generate a simulated HRV reading
     * Call this every second during a session
     */
    generateReading(): HRVReading {
        const now = new Date();

        // Base values with some noise
        const noise = () => (Math.random() - 0.5) * 10;

        // Calculate coherence based on breathing pattern
        let coherenceBonus = 0;

        if (this.isBreathing) {
            // Breathing at optimal rate gives max coherence
            const rateDeviation = Math.abs(this.breathingRate - this.baseline.optimal_breathing_rate);
            coherenceBonus = Math.max(0, 40 - rateDeviation * 10);

            // Exhale phase has higher coherence than inhale
            if (this.breathPhase === 'exhale') {
                coherenceBonus += 15;
            } else if (this.breathPhase === 'hold') {
                coherenceBonus += 5;
            }

            // Lower stress = higher coherence potential
            coherenceBonus *= (1 - (this.stressLevel - 5) * 0.05);
        }

        // Time in session improves coherence (entrainment)
        const sessionDuration = this.currentSession ?
            (now.getTime() - this.currentSession.start_time.getTime()) / 1000 : 0;
        const entrainmentBonus = Math.min(20, sessionDuration / 30);

        // Calculate final values
        const coherence_score = Math.max(0, Math.min(100,
            this.baseline.coherence_baseline + coherenceBonus + entrainmentBonus + noise() * 0.5
        ));

        // HRV improves with coherence
        const hrvMultiplier = 1 + (coherence_score - 50) / 200;
        const rmssd = Math.max(10, this.baseline.rmssd_baseline * hrvMultiplier + noise());

        // Heart rate varies inversely with coherence
        const hrVariation = (50 - coherence_score) / 10;
        const heart_rate = Math.round(this.baseline.resting_hr + hrVariation + noise() * 0.3);

        // LF/HF ratio (lower = more parasympathetic)
        const lf_hf_ratio = this.isBreathing ?
            Math.max(0.5, 2 - coherence_score / 50) :
            2 + this.stressLevel / 5;

        const reading: HRVReading = {
            timestamp: now,
            rmssd: Math.round(rmssd * 10) / 10,
            sdnn: Math.round(rmssd * 1.2 * 10) / 10,  // Approximate
            coherence_score: Math.round(coherence_score),
            heart_rate,
            respiratory_rate: this.breathingRate,
            lf_hf_ratio: Math.round(lf_hf_ratio * 100) / 100,
            pnn50: Math.round(Math.max(0, Math.min(100, coherence_score * 0.6 + noise())))
        };

        // Add to session
        if (this.currentSession) {
            this.currentSession.readings.push(reading);
        }

        return reading;
    }

    /**
     * Get real-time coherence feedback message
     */
    getCoherenceFeedback(reading: HRVReading): {
        level: 'low' | 'medium' | 'high' | 'optimal';
        message: string;
        suggestion: string;
    } {
        if (reading.coherence_score >= 80) {
            return {
                level: 'optimal',
                message: '✨ Optimal Coherence!',
                suggestion: 'Perfect rhythm. Maintain this pace.'
            };
        } else if (reading.coherence_score >= 60) {
            return {
                level: 'high',
                message: '💚 Good Coherence',
                suggestion: 'You\'re doing great. Keep breathing smoothly.'
            };
        } else if (reading.coherence_score >= 40) {
            return {
                level: 'medium',
                message: '🟡 Building Coherence',
                suggestion: 'Deepen your breath. Relax your shoulders.'
            };
        } else {
            return {
                level: 'low',
                message: '🔴 Low Coherence',
                suggestion: 'Slow down. Focus on smooth, even breaths.'
            };
        }
    }

    /**
     * Simulate what happens if user follows a specific protocol
     */
    simulateProtocolEffect(
        protocol_type: 'calming' | 'activating' | 'balancing',
        duration_minutes: number
    ): {
        predicted_coherence: number;
        predicted_stress_reduction: number;
        predicted_hrv_change: number;
    } {
        let coherenceGain = 0;
        let stressReduction = 0;

        switch (protocol_type) {
            case 'calming':
                coherenceGain = Math.min(30, duration_minutes * 6);
                stressReduction = Math.min(3, duration_minutes * 0.5);
                break;
            case 'activating':
                coherenceGain = Math.min(15, duration_minutes * 3);
                stressReduction = 0;  // May increase arousal
                break;
            case 'balancing':
                coherenceGain = Math.min(25, duration_minutes * 5);
                stressReduction = Math.min(2, duration_minutes * 0.4);
                break;
        }

        return {
            predicted_coherence: Math.min(100, this.baseline.coherence_baseline + coherenceGain),
            predicted_stress_reduction: stressReduction,
            predicted_hrv_change: coherenceGain * 0.5  // % improvement
        };
    }
}

// =====================================================
// SINGLETON EXPORT
// =====================================================

export const hrvSimulator = new HRVSimulator();

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export const createHRVSimulator = (baseline?: Partial<UserHRVBaseline>): HRVSimulator =>
    new HRVSimulator(baseline);

export const getCoherenceColor = (score: number): string => {
    if (score >= 80) return '#22c55e';  // Green
    if (score >= 60) return '#84cc16';  // Lime
    if (score >= 40) return '#eab308';  // Yellow
    return '#ef4444';  // Red
};

export const formatCoherenceForDisplay = (score: number): string => {
    if (score >= 80) return 'OPTIMAL';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
};
