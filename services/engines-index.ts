/**
 * Sentient OS - Analysis Engines Index
 * 
 * Central export for all analysis engines and utilities.
 * Each engine implements research-backed algorithms.
 * 
 * NOTE: Engines now live in experts/ folders - this file re-exports for compatibility.
 */

// ============================================================================
// HRV ANALYSIS
// ============================================================================
export {
    HRVAnalysisEngine,
    analyzeHRV
} from '../experts/recovery/HRVAnalysisEngine';

// ============================================================================
// LOAD MANAGEMENT (ACWR)
// ============================================================================
export {
    LoadManagementEngine,
    analyzeLoad
} from '../experts/performance/LoadManagementEngine';

// ============================================================================
// SLEEP ARCHITECTURE
// ============================================================================
export {
    SleepArchitectureEngine,
    analyzeSleep
} from '../experts/recovery/SleepArchitectureEngine';

// ============================================================================
// CIRCADIAN RHYTHMS
// ============================================================================
export {
    CircadianEngine,
    circadianEngine,
    analyzeCircadian
} from '../experts/longevity/CircadianEngine';

// ============================================================================
// FUEL & NUTRITION
// ============================================================================
export {
    FuelWindowEngine,
    fuelWindowEngine,
    analyzeFuel
} from '../experts/nutritionist/FuelWindowEngine';

// ============================================================================
// RECOVERY MATRIX
// ============================================================================
export {
    RecoveryMatrixEngine,
    recoveryMatrixEngine,
    analyzeRecovery
} from '../experts/recovery/RecoveryMatrixEngine';

// ============================================================================
// PATTERN DISCOVERY
// ============================================================================
export {
    PatternDiscoveryEngine,
    patternDiscoveryEngine,
    discoverPatterns
} from '../experts/orchestrator/PatternDiscoveryEngine';

// ============================================================================
// BIOMARKERS
// ============================================================================
export {
    BiomarkerEngine,
    biomarkerEngine,
    analyzeBiomarkers
} from '../experts/doctor/BiomarkerEngine';

// ============================================================================
// PERIODIZATION
// ============================================================================
export {
    PeriodizationEngine,
    periodizationEngine,
    analyzePeriodization
} from '../experts/performance/PeriodizationEngine';

// ============================================================================
// ADAPTIVE INTELLIGENCE
// ============================================================================
export {
    AdaptiveIntelligenceEngine,
    adaptiveIntelligence,
    getAdaptiveRecommendations
} from '../experts/orchestrator/AdaptiveIntelligenceEngine';

// ============================================================================
// QUICK ANALYSIS FACADE
// ============================================================================

import { analyzeHRV } from '../experts/recovery/HRVAnalysisEngine';
import { analyzeLoad } from '../experts/performance/LoadManagementEngine';
import { analyzeSleep } from '../experts/recovery/SleepArchitectureEngine';
import { analyzeCircadian } from '../experts/longevity/CircadianEngine';
import { analyzeFuel } from '../experts/nutritionist/FuelWindowEngine';
import { analyzeRecovery } from '../experts/recovery/RecoveryMatrixEngine';
import { discoverPatterns } from '../experts/orchestrator/PatternDiscoveryEngine';
import { analyzeBiomarkers } from '../experts/doctor/BiomarkerEngine';

/**
 * Run comprehensive analysis across all systems
 * Returns a unified view of athlete state
 */
export function runComprehensiveAnalysis() {
    return {
        hrv: analyzeHRV(),
        load: analyzeLoad(),
        sleep: analyzeSleep(),
        circadian: analyzeCircadian(),
        fuel: analyzeFuel(),
        recovery: analyzeRecovery(),
        patterns: discoverPatterns(),
        biomarkers: analyzeBiomarkers(),
        timestamp: new Date().toISOString()
    };
}

/**
 * Get training readiness summary
 * Combines key signals for a go/no-go decision
 */
export function getTrainingReadiness() {
    const hrv = analyzeHRV();
    const load = analyzeLoad();
    const recovery = analyzeRecovery();
    const circadian = analyzeCircadian();

    // Handle case where engines return null
    if (!recovery || !circadian) {
        return {
            score: 0,
            readiness: 'rest' as const,
            max_intensity: 'none' as const,
            signals: {
                hrv: { score: 0, zone: 'moderate' as const },
                recovery: { score: 0, status: 'unknown' },
                load: { acwr: 0, zone: 'unknown' },
                circadian: { performance: 0, phase: 'unknown' }
            },
            primary_concern: 'No data available - connect a wearable'
        };
    }

    // Calculate composite score
    const hrvWeight = 0.3;
    const recoveryWeight = 0.4;
    const loadWeight = 0.2;
    const circadianWeight = 0.1;

    const hrvScore = hrv.zone === 'optimal' ? 100 : hrv.zone === 'good' ? 80 : hrv.zone === 'compromised' ? 40 : 20;
    const recoveryScore = recovery.overall_recovery_score || 0;
    const loadScore = load.acwr.zone === 'optimal' ? 100 : load.acwr.zone === 'moderate_risk' ? 80 : 40;
    const circadianScore = circadian.current_phase?.physical_performance || 0;

    const compositeScore = Math.round(
        hrvScore * hrvWeight +
        recoveryScore * recoveryWeight +
        loadScore * loadWeight +
        circadianScore * circadianWeight
    );

    let readiness: 'ready' | 'modified' | 'rest';
    let maxIntensity: 'high' | 'moderate' | 'low' | 'none';

    if (compositeScore >= 70) {
        readiness = 'ready';
        maxIntensity = 'high';
    } else if (compositeScore >= 50) {
        readiness = 'modified';
        maxIntensity = 'moderate';
    } else {
        readiness = 'rest';
        maxIntensity = 'none';
    }

    // Override for danger signals
    if (load.acwr.zone === 'very_high_risk' || recovery.overreaching?.status === 'non_functional_overreaching') {
        readiness = 'rest';
        maxIntensity = 'none';
    }

    return {
        score: compositeScore,
        readiness,
        max_intensity: maxIntensity,
        signals: {
            hrv: { score: hrvScore, zone: hrv.zone },
            recovery: { score: recoveryScore, status: recovery.overall_status },
            load: { acwr: load.acwr.acwr_rolling, zone: load.acwr.zone },
            circadian: { performance: circadianScore, phase: circadian.current_phase?.phase }
        },
        primary_concern: compositeScore < 50 ?
            (hrvScore < 50 ? 'Low HRV - sympathetic overload' :
                recoveryScore < 50 ? 'Incomplete recovery' :
                    loadScore < 50 ? 'Training load concerns' : 'General fatigue') : null
    };
}

/**
 * Get immediate action recommendation
 * Based on current state and time of day
 */
export function getImmediateAction(): {
    action: string;
    category: 'training' | 'recovery' | 'fuel' | 'sleep' | 'mindspace';
    priority: 'high' | 'medium' | 'low';
    rationale: string;
} {
    const fuel = analyzeFuel();
    const recovery = analyzeRecovery();
    const circadian = analyzeCircadian();

    // Check fuel windows first
    if (fuel.current_window?.priority === 'critical') {
        return {
            action: fuel.immediate_action,
            category: 'fuel',
            priority: 'high',
            rationale: 'Time-sensitive nutrition window'
        };
    }

    // Check recovery needs
    if (recovery.overall_recovery_score < 50) {
        const modality = recovery.recommended_modalities[0];
        return {
            action: modality ? `${modality.modality.name} (${modality.suggested_duration}min)` : 'Rest and recover',
            category: 'recovery',
            priority: 'high',
            rationale: `Recovery score at ${recovery.overall_recovery_score}%`
        };
    }

    // Check circadian timing
    if (circadian.current_phase.phase === 'morning_alert' &&
        !circadian.light_tracking.morning_light_achieved) {
        return {
            action: 'Get 10+ minutes of outdoor light',
            category: 'recovery',
            priority: 'medium',
            rationale: 'Morning light exposure for circadian alignment'
        };
    }

    // Default
    return {
        action: 'Continue with planned activities',
        category: 'training',
        priority: 'low',
        rationale: 'All systems nominal'
    };
}
