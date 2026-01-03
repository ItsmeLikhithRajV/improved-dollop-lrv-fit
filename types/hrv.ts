/**
 * HRV Types - Research-Backed Heart Rate Variability Analysis
 * 
 * Based on:
 * - Plews et al. (2013) - HRV-guided training
 * - Buchheit (2014) - Monitoring training status with HR measures
 * - Elite athlete rMSSD range: 35-107 ms
 * - SDNN "gold standard" for long-term medical risk stratification
 */

// ============================================================================
// CORE HRV METRICS
// ============================================================================

export interface HRVReading {
    timestamp: string;
    rmssd: number;              // Root Mean Square of Successive Differences (ms)
    sdnn: number;               // Standard Deviation of NN intervals (ms)
    lf: number;                 // Low Frequency power (ms²)
    hf: number;                 // High Frequency power (ms²)
    lf_hf_ratio: number;        // Sympathetic/Parasympathetic balance
    hr_mean: number;            // Mean heart rate (bpm)
    measurement_duration: number; // Duration in seconds
    measurement_context: 'morning' | 'pre_training' | 'post_training' | 'evening' | 'night';
}

export interface HRVBaseline {
    rmssd_7d_avg: number;
    rmssd_30d_avg: number;
    rmssd_90d_avg: number;
    sdnn_7d_avg: number;
    sdnn_30d_avg: number;
    coefficient_of_variation_7d: number;  // CV = SD/Mean - consistency measure
    coefficient_of_variation_30d: number;
    personal_floor: number;     // Lowest healthy baseline
    personal_ceiling: number;   // Highest recorded
}

// ============================================================================
// ZONE CLASSIFICATION (Research-Based)
// ============================================================================

export type HRVZone = 'optimal' | 'good' | 'moderate' | 'compromised' | 'critical';

export interface HRVZoneThresholds {
    zone: HRVZone;
    deviation_from_baseline_min: number;  // In CV units
    deviation_from_baseline_max: number;
    color: string;
    label: string;
    recommendation: string;
}

/**
 * Zone thresholds based on Coefficient of Variation (CV) from baseline
 * Research: ±0.5 CV represents normal day-to-day variation
 */
export const HRV_ZONE_THRESHOLDS: HRVZoneThresholds[] = [
    {
        zone: 'optimal',
        deviation_from_baseline_min: 0.5,
        deviation_from_baseline_max: Infinity,
        color: 'hsl(140, 70%, 50%)',
        label: 'Optimal',
        recommendation: 'Full training capacity. Push if desired.'
    },
    {
        zone: 'good',
        deviation_from_baseline_min: -0.25,
        deviation_from_baseline_max: 0.5,
        color: 'hsl(160, 60%, 45%)',
        label: 'Good',
        recommendation: 'Normal capacity. Train as planned.'
    },
    {
        zone: 'moderate',
        deviation_from_baseline_min: -0.5,
        deviation_from_baseline_max: -0.25,
        color: 'hsl(45, 100%, 55%)',
        label: 'Moderate',
        recommendation: 'Slightly below baseline. Monitor fatigue.'
    },
    {
        zone: 'compromised',
        deviation_from_baseline_min: -1.0,
        deviation_from_baseline_max: -0.5,
        color: 'hsl(30, 100%, 50%)',
        label: 'Compromised',
        recommendation: 'Recovery needed. Reduce intensity by 30-50%.'
    },
    {
        zone: 'critical',
        deviation_from_baseline_min: -Infinity,
        deviation_from_baseline_max: -1.0,
        color: 'hsl(0, 80%, 55%)',
        label: 'Critical',
        recommendation: 'Rest day recommended. Focus on recovery protocols.'
    }
];

// ============================================================================
// HRV ANALYSIS OUTPUT
// ============================================================================

export interface HRVAnalysis {
    // Current reading
    current: HRVReading;

    // Baseline comparisons
    baseline: HRVBaseline;
    deviation_from_baseline: number;      // In CV units
    deviation_percentage: number;         // %

    // Zone classification
    zone: HRVZone;
    zone_info: HRVZoneThresholds;

    // Trends
    trend_7d: 'improving' | 'stable' | 'declining';
    trend_direction: number;               // Slope of regression
    trend_confidence: number;              // R² of regression

    // Derived metrics
    autonomic_balance: 'parasympathetic_dominant' | 'balanced' | 'sympathetic_dominant';
    recovery_readiness: number;            // 0-100 score
    training_recommendation: 'full' | 'moderate' | 'light' | 'rest';

    // Pattern detection
    patterns: HRVPattern[];

    // Historical for charts
    history_7d: HRVReading[];
    history_30d: HRVReading[];
}

export interface HRVPattern {
    type: 'improving_trend' | 'declining_trend' | 'high_variability' | 'chronically_low' | 'acute_drop' | 'post_training_recovery';
    confidence: number;
    description: string;
    recommendation?: string;
}

// ============================================================================
// ELITE ATHLETE REFERENCE RANGES
// ============================================================================

export const ELITE_REFERENCE_RANGES = {
    rmssd: {
        low: 35,
        optimal_low: 50,
        optimal_high: 80,
        high: 107,
        unit: 'ms',
        description: 'Parasympathetic activity marker'
    },
    sdnn: {
        low: 50,
        optimal_low: 60,
        optimal_high: 100,
        high: 150,
        unit: 'ms',
        description: 'Total autonomic variability'
    },
    lf_hf_ratio: {
        low: 0.5,
        optimal_low: 1.0,
        optimal_high: 2.0,
        high: 4.0,
        description: 'Sympathetic-parasympathetic balance'
    }
};

// ============================================================================
// HRV RECOVERY TIME ESTIMATES
// ============================================================================

export interface HRVRecoveryEstimate {
    hours_to_baseline: number;
    confidence: number;
    factors: string[];
}

// ============================================================================
// WEARABLE DATA SOURCES
// ============================================================================

export type HRVDataSource =
    | 'oura'
    | 'whoop'
    | 'garmin'
    | 'apple_watch'
    | 'polar'
    | 'hrvT'
    | 'eliteHRV'
    | 'manual';

export interface HRVDataImport {
    source: HRVDataSource;
    readings: HRVReading[];
    import_timestamp: string;
    quality_score: number;  // 0-100 based on measurement quality
}
