/**
 * Recovery Matrix Engine - Multi-System Recovery Analysis
 * 
 * Implements:
 * - 6-system recovery tracking
 * - Overreaching detection
 * - Recovery modality recommendations
 * - Training readiness assessment
 */

import {
    RecoverySystem,
    SystemRecoveryStatus,
    RecoveryModality,
    RecoveryModalityType,
    RECOVERY_MODALITIES,
    RecoveryRecommendation,
    OverreachingStatus,
    OverreachingAnalysis,
    RecoveryMatrixOutput,
    RecoveryMatrixWeighting,
    ForcePlateData
} from '../../types/recovery-matrix';

// ============================================================================
// MOCK DATA (Replace with real wearable/input integration)
// ============================================================================

interface RecoveryInputs {
    // HRV
    hrv_score: number;           // 0-100
    hrv_trend: 'improving' | 'stable' | 'declining';

    // Sleep
    sleep_quality: number;       // 0-100
    sleep_duration_hours: number;
    deep_sleep_percentage: number;

    // Load
    acwr: number;
    days_in_danger_zone: number;

    // Subjective
    perceived_fatigue: number;   // 1-10
    mood_score: number;          // 1-10
    motivation_score: number;    // 1-10
    muscle_soreness: number;     // 1-10

    // Biomarkers (if available)
    cortisol_status?: 'low' | 'normal' | 'high';
    testosterone_ratio?: number;  // T:C ratio
    creatine_kinase?: number;     // CK level

    // Recent modalities used
    modalities_used_today: RecoveryModalityType[];
}

const getDefaultInputs = (): RecoveryInputs => ({
    hrv_score: 65,
    hrv_trend: 'stable',
    sleep_quality: 70,
    sleep_duration_hours: 7,
    deep_sleep_percentage: 18,
    acwr: 1.1,
    days_in_danger_zone: 0,
    perceived_fatigue: 5,
    mood_score: 7,
    motivation_score: 7,
    muscle_soreness: 4,
    modalities_used_today: []
});

// ============================================================================
// SYSTEM SCORING
// ============================================================================

const calculateMuscularRecovery = (inputs: RecoveryInputs): number => {
    let score = 100;

    // Soreness impact
    score -= inputs.muscle_soreness * 5;

    // CK levels
    if (inputs.creatine_kinase) {
        if (inputs.creatine_kinase > 1000) score -= 30;
        else if (inputs.creatine_kinase > 500) score -= 15;
        else if (inputs.creatine_kinase > 200) score -= 5;
    }

    // Sleep quality affects muscle recovery (GH release)
    score += (inputs.deep_sleep_percentage - 15) * 2;

    // Load impact
    if (inputs.acwr > 1.5) score -= 20;
    else if (inputs.acwr > 1.3) score -= 10;

    return Math.max(0, Math.min(100, score));
};

const calculateNeuralRecovery = (inputs: RecoveryInputs): number => {
    let score = 100;

    // HRV is primary neural indicator
    score = Math.min(100, inputs.hrv_score * 1.2);

    // HRV trend adjustment
    if (inputs.hrv_trend === 'declining') score -= 15;
    else if (inputs.hrv_trend === 'improving') score += 5;

    // Sleep affects neural recovery
    if (inputs.sleep_duration_hours < 7) score -= 15;
    if (inputs.sleep_quality < 60) score -= 10;

    // Fatigue perception
    score -= (inputs.perceived_fatigue - 5) * 3;

    return Math.max(0, Math.min(100, score));
};

const calculateHormonalRecovery = (inputs: RecoveryInputs): number => {
    let score = 80; // Base

    // Cortisol status
    if (inputs.cortisol_status === 'high') score -= 25;
    else if (inputs.cortisol_status === 'low') score -= 15; // Adrenal fatigue
    else score += 10;

    // T:C ratio (if available)
    if (inputs.testosterone_ratio !== undefined) {
        if (inputs.testosterone_ratio > 0.3) score += 15;
        else if (inputs.testosterone_ratio < 0.1) score -= 20;
    }

    // Sleep is critical for hormones
    if (inputs.sleep_duration_hours >= 8) score += 10;
    else if (inputs.sleep_duration_hours < 6) score -= 20;

    // ACWR stress
    if (inputs.acwr > 1.5) score -= 15;

    return Math.max(0, Math.min(100, score));
};

const calculateMetabolicRecovery = (inputs: RecoveryInputs): number => {
    let score = 75;

    // Sleep affects metabolic recovery
    score += (inputs.sleep_quality - 50) * 0.3;

    // Load management
    if (inputs.acwr >= 0.8 && inputs.acwr <= 1.3) score += 15;
    else if (inputs.acwr > 1.5) score -= 20;

    // Fatigue
    score -= (inputs.perceived_fatigue - 5) * 2;

    return Math.max(0, Math.min(100, score));
};

const calculateImmuneRecovery = (inputs: RecoveryInputs): number => {
    let score = 80;

    // Sleep is critical for immunity
    if (inputs.sleep_duration_hours >= 7.5) score += 10;
    else if (inputs.sleep_duration_hours < 6) score -= 25;

    // Chronic stress (ACWR)
    if (inputs.days_in_danger_zone > 3) score -= 20;
    else if (inputs.days_in_danger_zone > 0) score -= 10;

    // High cortisol suppresses immunity
    if (inputs.cortisol_status === 'high') score -= 15;

    // Cold exposure helps if used
    if (inputs.modalities_used_today.includes('cold_therapy')) score += 5;

    return Math.max(0, Math.min(100, score));
};

const calculatePsychologicalRecovery = (inputs: RecoveryInputs): number => {
    let score = 50;

    // Direct mood and motivation inputs
    score += inputs.mood_score * 2.5;
    score += inputs.motivation_score * 2.5;

    // Sleep affects mood
    if (inputs.sleep_quality >= 80) score += 10;
    else if (inputs.sleep_quality < 50) score -= 15;

    // HRV linked to mental state
    if (inputs.hrv_score >= 70) score += 5;
    else if (inputs.hrv_score < 50) score -= 10;

    // Meditation/breathing helps
    if (inputs.modalities_used_today.includes('meditation') ||
        inputs.modalities_used_today.includes('breathing')) {
        score += 10;
    }

    return Math.max(0, Math.min(100, score));
};

// ============================================================================
// MAIN ENGINE
// ============================================================================

export class RecoveryMatrixEngine {
    private inputs: RecoveryInputs | null = null; // Start with no data
    private hasSyncedData: boolean = false;

    /**
     * Set real inputs from wearable integration
     */
    setRealInputs(inputs: RecoveryInputs): void {
        this.inputs = inputs;
        this.hasSyncedData = true;
    }

    /**
     * Check if we have real wearable data
     */
    hasData(): boolean {
        return this.inputs !== null && this.hasSyncedData;
    }

    /**
     * Update recovery inputs (only if we have base data)
     */
    updateInputs(updates: Partial<RecoveryInputs>): void {
        if (this.inputs) {
            this.inputs = { ...this.inputs, ...updates };
        }
    }

    /**
     * Log a modality used
     */
    logModality(type: RecoveryModalityType): void {
        if (!this.inputs.modalities_used_today.includes(type)) {
            this.inputs.modalities_used_today.push(type);
        }
    }

    /**
     * Calculate all system recovery scores
     */
    calculateSystemScores(): SystemRecoveryStatus[] {
        const getStatus = (score: number): SystemRecoveryStatus['status'] => {
            if (score >= 80) return 'recovered';
            if (score >= 60) return 'recovering';
            if (score >= 40) return 'fatigued';
            return 'overreached';
        };

        const getRecoveryHours = (score: number): number => {
            if (score >= 80) return 0;
            if (score >= 60) return 24;
            if (score >= 40) return 48;
            return 72;
        };

        const muscularScore = calculateMuscularRecovery(this.inputs);
        const neuralScore = calculateNeuralRecovery(this.inputs);
        const hormonalScore = calculateHormonalRecovery(this.inputs);
        const metabolicScore = calculateMetabolicRecovery(this.inputs);
        const immuneScore = calculateImmuneRecovery(this.inputs);
        const psychScore = calculatePsychologicalRecovery(this.inputs);

        return [
            {
                system: 'muscular',
                score: Math.round(muscularScore),
                trend: this.inputs.muscle_soreness <= 3 ? 'improving' : this.inputs.muscle_soreness >= 7 ? 'declining' : 'stable',
                estimated_full_recovery_hours: getRecoveryHours(muscularScore),
                positive_factors: muscularScore >= 70 ? ['Good sleep', 'Adequate protein'] : [],
                negative_factors: this.inputs.muscle_soreness >= 6 ? ['High soreness'] : [],
                status: getStatus(muscularScore),
                color: 'hsl(0, 70%, 50%)',
                icon_name: 'Dumbbell',
                description: 'Muscle tissue repair and adaptation'
            },
            {
                system: 'neural',
                score: Math.round(neuralScore),
                trend: this.inputs.hrv_trend,
                estimated_full_recovery_hours: getRecoveryHours(neuralScore),
                positive_factors: this.inputs.hrv_score >= 70 ? ['Strong HRV'] : [],
                negative_factors: this.inputs.hrv_trend === 'declining' ? ['Declining HRV'] : [],
                status: getStatus(neuralScore),
                color: 'hsl(270, 70%, 50%)',
                icon_name: 'Brain',
                description: 'Central nervous system recovery'
            },
            {
                system: 'hormonal',
                score: Math.round(hormonalScore),
                trend: 'stable',
                estimated_full_recovery_hours: getRecoveryHours(hormonalScore),
                positive_factors: this.inputs.sleep_duration_hours >= 7.5 ? ['Adequate sleep'] : [],
                negative_factors: this.inputs.cortisol_status === 'high' ? ['Elevated cortisol'] : [],
                status: getStatus(hormonalScore),
                color: 'hsl(45, 80%, 50%)',
                icon_name: 'Activity',
                description: 'Hormone balance and adaptation'
            },
            {
                system: 'metabolic',
                score: Math.round(metabolicScore),
                trend: 'stable',
                estimated_full_recovery_hours: getRecoveryHours(metabolicScore),
                positive_factors: this.inputs.acwr >= 0.8 && this.inputs.acwr <= 1.3 ? ['Optimal load'] : [],
                negative_factors: this.inputs.acwr > 1.3 ? ['High training load'] : [],
                status: getStatus(metabolicScore),
                color: 'hsl(120, 60%, 45%)',
                icon_name: 'Flame',
                description: 'Energy systems and glycogen'
            },
            {
                system: 'immune',
                score: Math.round(immuneScore),
                trend: this.inputs.days_in_danger_zone > 0 ? 'declining' : 'stable',
                estimated_full_recovery_hours: getRecoveryHours(immuneScore),
                positive_factors: this.inputs.sleep_duration_hours >= 7.5 ? ['Good sleep'] : [],
                negative_factors: this.inputs.days_in_danger_zone > 3 ? ['Overload stress'] : [],
                status: getStatus(immuneScore),
                color: 'hsl(200, 70%, 50%)',
                icon_name: 'Shield',
                description: 'Immune function and resilience'
            },
            {
                system: 'psychological',
                score: Math.round(psychScore),
                trend: this.inputs.mood_score >= 7 ? 'improving' : this.inputs.mood_score <= 4 ? 'declining' : 'stable',
                estimated_full_recovery_hours: getRecoveryHours(psychScore),
                positive_factors: this.inputs.motivation_score >= 7 ? ['High motivation'] : [],
                negative_factors: this.inputs.mood_score <= 4 ? ['Low mood'] : [],
                status: getStatus(psychScore),
                color: 'hsl(320, 60%, 50%)',
                icon_name: 'Heart',
                description: 'Mental state and motivation'
            }
        ];
    }

    /**
     * Detect overreaching
     */
    detectOverreaching(): OverreachingAnalysis {
        const signals: OverreachingAnalysis['signals'] = [];

        // HRV signal
        signals.push({
            signal: 'HRV Score',
            value: this.inputs.hrv_score,
            threshold: 50,
            concerning: this.inputs.hrv_score < 50
        });

        // HRV trend
        signals.push({
            signal: 'HRV Trend',
            value: this.inputs.hrv_trend,
            threshold: 'stable or improving',
            concerning: this.inputs.hrv_trend === 'declining'
        });

        // Sleep
        signals.push({
            signal: 'Sleep Quality',
            value: this.inputs.sleep_quality,
            threshold: 60,
            concerning: this.inputs.sleep_quality < 60
        });

        // ACWR
        signals.push({
            signal: 'ACWR',
            value: this.inputs.acwr.toFixed(2),
            threshold: 1.5,
            concerning: this.inputs.acwr > 1.5
        });

        // Danger zone days
        signals.push({
            signal: 'Days in Danger Zone (28d)',
            value: this.inputs.days_in_danger_zone,
            threshold: 3,
            concerning: this.inputs.days_in_danger_zone > 3
        });

        // Fatigue
        signals.push({
            signal: 'Perceived Fatigue',
            value: this.inputs.perceived_fatigue,
            threshold: 7,
            concerning: this.inputs.perceived_fatigue >= 7
        });

        // Motivation
        signals.push({
            signal: 'Motivation',
            value: this.inputs.motivation_score,
            threshold: 5,
            concerning: this.inputs.motivation_score < 5
        });

        // Count concerning signals
        const concerningCount = signals.filter(s => s.concerning).length;

        // Determine status
        let status: OverreachingStatus;
        let recoveryDays: number;

        if (concerningCount === 0) {
            status = 'fresh';
            recoveryDays = 0;
        } else if (concerningCount <= 2) {
            status = 'normal';
            recoveryDays = 1;
        } else if (concerningCount <= 4) {
            status = 'functional_overreaching';
            recoveryDays = 7;
        } else if (concerningCount <= 6) {
            status = 'non_functional_overreaching';
            recoveryDays = 21;
        } else {
            status = 'overtraining';
            recoveryDays = 60;
        }

        return {
            status,
            confidence: Math.min(100, 50 + concerningCount * 10),
            days_in_current_state: 1, // Would need history
            signals,
            estimated_recovery_days: recoveryDays,
            training_adjustment: status === 'fresh' || status === 'normal'
                ? 'Continue as planned'
                : status === 'functional_overreaching'
                    ? 'Reduce intensity by 20%, add recovery day'
                    : 'Significant deload required. Consider 1-2 weeks easy.',
            recovery_focus: status === 'fresh' || status === 'normal'
                ? []
                : ['neural', 'hormonal', 'psychological']
        };
    }

    /**
     * Generate modality recommendations
     */
    generateRecommendations(systems: SystemRecoveryStatus[]): RecoveryRecommendation[] {
        const recommendations: RecoveryRecommendation[] = [];
        const weakestSystems = systems
            .sort((a, b) => a.score - b.score)
            .slice(0, 3);

        // Find modalities that help weakest systems
        RECOVERY_MODALITIES.forEach(modality => {
            weakestSystems.forEach(system => {
                if (modality.primary_systems.includes(system.system) && system.score < 70) {
                    // Check if not already used today
                    if (!this.inputs.modalities_used_today.includes(modality.type)) {
                        const existing = recommendations.find(r => r.modality.type === modality.type);
                        if (!existing) {
                            recommendations.push({
                                modality,
                                priority: system.score < 50 ? 'high' : system.score < 60 ? 'medium' : 'low',
                                reason: `Support ${system.system} recovery (currently ${system.score}%)`,
                                suggested_duration: modality.duration_minutes.optimal,
                                suggested_time: modality.optimal_timing === 'morning' ? '07:00' :
                                    modality.optimal_timing === 'post_training' ? 'After training' :
                                        modality.optimal_timing === 'evening' ? '19:00' : 'Anytime',
                                target_systems: modality.primary_systems
                            });
                        }
                    }
                }
            });
        });

        // Sort by priority
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        return recommendations.slice(0, 5);
    }

    /**
     * Main analysis method
     * Returns null if no real data is available
     */
    analyze(): RecoveryMatrixOutput | null {
        // Return null if no real wearable data
        if (!this.hasData() || this.inputs === null) {
            return null;
        }

        const systems = this.calculateSystemScores();
        const overreaching = this.detectOverreaching();
        const recommendations = this.generateRecommendations(systems);

        // Overall score (weighted average)
        const overallScore = Math.round(systems.reduce((acc, s) => acc + s.score, 0) / systems.length);

        // Weakest system
        const weakest = systems.reduce((a, b) => a.score < b.score ? a : b);

        // Overall status
        let overallStatus: RecoveryMatrixOutput['overall_status'];
        if (overallScore >= 80) overallStatus = 'recovered';
        else if (overallScore >= 60) overallStatus = 'recovering';
        else if (overallScore >= 40) overallStatus = 'fatigued';
        else overallStatus = 'overreached';

        // Training readiness
        let trainingReadiness: RecoveryMatrixOutput['training_readiness'];
        let maxIntensity: RecoveryMatrixOutput['max_intensity_recommended'];

        if (overallScore >= 70 && weakest.score >= 50) {
            trainingReadiness = 'ready';
            maxIntensity = 'high';
        } else if (overallScore >= 50) {
            trainingReadiness = 'modified';
            maxIntensity = weakest.score >= 40 ? 'moderate' : 'low';
        } else {
            trainingReadiness = 'rest';
            maxIntensity = 'none';
        }

        // Override for overreaching
        if (overreaching.status === 'non_functional_overreaching' || overreaching.status === 'overtraining') {
            trainingReadiness = 'rest';
            maxIntensity = 'none';
        }

        return {
            overall_recovery_score: overallScore,
            overall_status: overallStatus,
            systems,
            weakest_system: weakest.system,
            weakest_system_score: weakest.score,
            overreaching,
            recommended_modalities: recommendations,
            training_readiness: trainingReadiness,
            max_intensity_recommended: maxIntensity,
            estimated_full_recovery_hours: Math.max(...systems.map(s => s.estimated_full_recovery_hours)),
            next_assessment_time: 'Tomorrow morning'
        };
    }
}

// Singleton
export const recoveryMatrixEngine = new RecoveryMatrixEngine();

// State-driven analysis function
import type { GlobalState } from '../../types';

/**
 * Map GlobalState to RecoveryInputs
 */
function stateToRecoveryInputs(state: GlobalState): RecoveryInputs {
    const recovery = state.recovery;
    const sleep = state.sleep;
    const mindspace = state.mindspace;
    const physical_load = state.physical_load;

    return {
        hrv_score: recovery?.autonomic?.parasympathetic_score || 0,
        hrv_trend: 'stable', // Would need history for real trend
        sleep_quality: sleep?.sleep_quality_score || 0,
        sleep_duration_hours: sleep?.duration || 0,
        deep_sleep_percentage: 20, // Estimate if not available
        acwr: physical_load?.acwr || 0,
        days_in_danger_zone: 0,
        perceived_fatigue: recovery?.fatigue_level || 0,
        mood_score: Math.round((mindspace?.mood || 0) / 10),
        motivation_score: Math.round((mindspace?.motivation || 0) / 10),
        muscle_soreness: recovery?.muscle_tightness || 0,
        modalities_used_today: []
    };
}

/**
 * Analyze recovery from GlobalState
 * Returns hasData: false if insufficient data
 */
export function analyzeRecovery(state?: GlobalState): RecoveryMatrixOutput | null {
    // If state provided, use state-driven analysis
    if (state) {
        const inputs = stateToRecoveryInputs(state);

        // Check if we have meaningful data
        const hasData = inputs.hrv_score > 0 || inputs.sleep_quality > 0 || inputs.sleep_duration_hours > 0;

        if (!hasData) {
            return null; // Let UI show zero-state
        }

        // Inject state inputs into engine
        recoveryMatrixEngine.setRealInputs(inputs);
    }

    return recoveryMatrixEngine.analyze();
}
