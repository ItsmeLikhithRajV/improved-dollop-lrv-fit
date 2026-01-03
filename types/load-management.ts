/**
 * Load Management Types - ACWR & Injury Prevention
 * 
 * Based on:
 * - Tim Gabbett's Training-Injury Prevention Paradox
 * - ACWR Sweet Spot: 0.8 - 1.3
 * - Danger Zone: >1.5 (2-4x injury risk)
 */

// ============================================================================
// WORKLOAD TYPES
// ============================================================================

export interface DailyLoad {
    date: string;
    session_rpe: number;          // 1-10 scale
    duration_minutes: number;
    load_au: number;              // Arbitrary Units = RPE × duration
    session_type: 'training' | 'competition' | 'recovery' | 'rest';
    intensity_zone: 'low' | 'moderate' | 'high' | 'very_high';
}

export interface WeeklyLoad {
    week_start: string;
    total_load: number;
    sessions: number;
    average_session_load: number;
    high_intensity_sessions: number;
    rest_days: number;
}

// ============================================================================
// ACWR CALCULATIONS
// ============================================================================

export interface ACWRMetrics {
    // Core metrics
    acute_load_7d: number;        // Sum of last 7 days
    chronic_load_28d: number;     // Rolling 28-day average (weekly)
    acwr_rolling: number;         // Acute / Chronic (rolling average method)
    acwr_ewma: number;            // Exponentially weighted moving average

    // Zone classification
    zone: ACWRZone;
    zone_info: ACWRZoneInfo;

    // Trajectory
    trajectory: 'rising' | 'stable' | 'falling';
    trajectory_rate: number;      // Units per day
    acwr_7d_ago: number;
    acwr_14d_ago: number;

    // Risk assessment
    injury_risk_multiplier: number;
    days_in_current_zone: number;
    days_above_1_5: number;       // Danger zone days in last 28

    // Recommendations
    recommended_load_today: number;
    max_safe_load_today: number;
    load_to_reach_optimal: number;
    days_to_safe_increase: number;
}

// ============================================================================
// ACWR ZONES (Gabbett Research)
// ============================================================================

export type ACWRZone = 'undertrained' | 'low_risk' | 'optimal' | 'moderate_risk' | 'high_risk' | 'very_high_risk';

export interface ACWRZoneInfo {
    zone: ACWRZone;
    min: number;
    max: number;
    injury_risk_multiplier: number;
    color: string;
    label: string;
    description: string;
    recommendation: string;
}

/**
 * Research-based ACWR zones from Gabbett et al.
 */
export const ACWR_ZONES: ACWRZoneInfo[] = [
    {
        zone: 'undertrained',
        min: 0,
        max: 0.8,
        injury_risk_multiplier: 1.2,
        color: 'hsl(200, 60%, 50%)',
        label: 'Under-trained',
        description: 'Below optimal workload. Reduced preparedness.',
        recommendation: 'Gradually increase training load by 10-15% per week.'
    },
    {
        zone: 'low_risk',
        min: 0.8,
        max: 1.0,
        injury_risk_multiplier: 1.0,
        color: 'hsl(160, 60%, 45%)',
        label: 'Low Risk',
        description: 'Conservative loading. Good for building phases.',
        recommendation: 'Safe to increase load. Room for progression.'
    },
    {
        zone: 'optimal',
        min: 1.0,
        max: 1.25,
        injury_risk_multiplier: 0.8,
        color: 'hsl(140, 70%, 50%)',
        label: 'Optimal (Sweet Spot)',
        description: 'Peak adaptation zone. Building fitness with minimal risk.',
        recommendation: 'Maintain this zone. Progressive overload is optimal here.'
    },
    {
        zone: 'moderate_risk',
        min: 1.25,
        max: 1.5,
        injury_risk_multiplier: 1.5,
        color: 'hsl(45, 100%, 55%)',
        label: 'Moderate Risk',
        description: 'Approaching danger. Monitor closely.',
        recommendation: 'Consider reducing load or adding recovery sessions.'
    },
    {
        zone: 'high_risk',
        min: 1.5,
        max: 2.0,
        injury_risk_multiplier: 2.2,
        color: 'hsl(30, 100%, 50%)',
        label: 'High Risk (Danger Zone)',
        description: 'Significant injury spike risk. Fatigued state.',
        recommendation: 'Reduce training load immediately. Add rest days.'
    },
    {
        zone: 'very_high_risk',
        min: 2.0,
        max: Infinity,
        injury_risk_multiplier: 4.0,
        color: 'hsl(0, 80%, 55%)',
        label: 'Very High Risk',
        description: 'Extreme injury risk. Body is overwhelmed.',
        recommendation: 'Rest required. Do not train at high intensity.'
    }
];

// ============================================================================
// EWMA CALCULATION PARAMETERS
// ============================================================================

export const EWMA_CONFIG = {
    acute_decay_constant: 7,      // Days
    chronic_decay_constant: 28,   // Days
    // Lambda = 2 / (N + 1)
    acute_lambda: 0.25,           // 2 / (7 + 1)
    chronic_lambda: 0.069         // 2 / (28 + 1)
};

// ============================================================================
// LOAD MANAGEMENT RECOMMENDATIONS
// ============================================================================

export interface LoadRecommendation {
    priority: 'critical' | 'high' | 'medium' | 'low';
    type: 'reduce' | 'maintain' | 'increase' | 'recover';
    title: string;
    description: string;
    target_load: number;
    rationale: string;
}

// ============================================================================
// CHRONIC LOAD BUILDING
// ============================================================================

export interface ChronicLoadProfile {
    current_chronic: number;
    target_chronic: number;       // For desired fitness level
    building_rate: number;        // AU per week increase
    estimated_weeks_to_target: number;

    // Historical
    chronic_3_months_ago: number;
    chronic_trend: 'building' | 'maintaining' | 'declining';
    chronic_change_percentage: number;
}

// ============================================================================
// COMBINED LOAD ANALYSIS OUTPUT
// ============================================================================

export interface LoadManagementOutput {
    acwr: ACWRMetrics;
    chronic_profile: ChronicLoadProfile;

    // Load history
    daily_loads_28d: DailyLoad[];
    weekly_loads_12w: WeeklyLoad[];

    // Readiness
    training_readiness: 'green' | 'amber' | 'red';
    suggested_session_type: 'high_intensity' | 'moderate' | 'low_intensity' | 'recovery' | 'rest';

    // Recommendations
    recommendations: LoadRecommendation[];

    // Injury risk summary
    injury_risk_level: 'low' | 'moderate' | 'elevated' | 'high' | 'critical';
    contributing_factors: string[];
}

// ============================================================================
// MONOTONY AND STRAIN (Advanced Metrics)
// ============================================================================

export interface MonotonyStrain {
    // Monotony = Weekly Mean / Weekly SD
    // High monotony = boring, uniform training = staleness risk
    weekly_load_mean: number;
    weekly_load_sd: number;
    monotony: number;

    // Strain = Weekly Load × Monotony  
    // High strain = injury/illness risk
    strain: number;

    // Thresholds
    monotony_threshold: 2.0;      // Above this = too uniform
    strain_threshold: number;     // Individual-specific

    // Status
    monotony_status: 'low' | 'moderate' | 'high';
    strain_status: 'low' | 'moderate' | 'high';
}
