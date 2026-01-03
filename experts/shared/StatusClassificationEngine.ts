/**
 * STATUS CLASSIFICATION ENGINE
 * 
 * Centralized scientific classification for all health metrics.
 * All thresholds are based on peer-reviewed research and clinical guidelines.
 * 
 * Sources:
 * - HRV: Kubios Research, published physiological studies
 * - Sleep: NIH, Pittsburgh Sleep Quality Index (PSQI), Sleep Foundation
 * - Performance: Sports science research (Gabbett et al.), Garmin
 * - Cardiac: Mayo Clinic, American Heart Association
 * - Metabolic: American Diabetes Association
 * - Inflammation: AHA/CDC Guidelines
 * - Longevity: EWGSOP2 (European Sarcopenia Guidelines)
 */

import { ScientificStatus, StatusResult } from '../types';

// =====================================================
// THRESHOLD DATA TABLES
// =====================================================

/**
 * HRV/RMSSD thresholds by age (in milliseconds)
 * Source: Kubios research, published physiological studies
 */
const HRV_THRESHOLDS_BY_AGE: Array<{
    minAge: number;
    maxAge: number;
    optimal: number;
    good: number;
    fair: number;
}> = [
        { minAge: 18, maxAge: 25, optimal: 55, good: 40, fair: 25 },
        { minAge: 26, maxAge: 35, optimal: 45, good: 30, fair: 20 },
        { minAge: 36, maxAge: 45, optimal: 35, good: 25, fair: 18 },
        { minAge: 46, maxAge: 55, optimal: 28, good: 20, fair: 15 },
        { minAge: 56, maxAge: 65, optimal: 22, good: 16, fair: 12 },
        { minAge: 66, maxAge: 120, optimal: 18, good: 14, fair: 10 },
    ];

/**
 * VO2max thresholds by age and sex (ml/kg/min)
 * Source: Topend Sports, Garmin research
 */
const VO2MAX_THRESHOLDS = {
    male: [
        { minAge: 18, maxAge: 25, excellent: 60, good: 52, average: 42, belowAvg: 37 },
        { minAge: 26, maxAge: 35, excellent: 56, good: 49, average: 40, belowAvg: 35 },
        { minAge: 36, maxAge: 45, excellent: 51, good: 43, average: 35, belowAvg: 31 },
        { minAge: 46, maxAge: 55, excellent: 45, good: 39, average: 32, belowAvg: 29 },
        { minAge: 56, maxAge: 65, excellent: 41, good: 36, average: 30, belowAvg: 26 },
        { minAge: 66, maxAge: 120, excellent: 37, good: 33, average: 26, belowAvg: 22 },
    ],
    female: [
        { minAge: 18, maxAge: 25, excellent: 56, good: 47, average: 38, belowAvg: 33 },
        { minAge: 26, maxAge: 35, excellent: 52, good: 45, average: 35, belowAvg: 31 },
        { minAge: 36, maxAge: 45, excellent: 45, good: 38, average: 31, belowAvg: 27 },
        { minAge: 46, maxAge: 55, excellent: 40, good: 34, average: 28, belowAvg: 25 },
        { minAge: 56, maxAge: 65, excellent: 37, good: 32, average: 25, belowAvg: 22 },
        { minAge: 66, maxAge: 120, excellent: 32, good: 28, average: 22, belowAvg: 19 },
    ]
};

/**
 * Grip strength thresholds by age and sex (kg)
 * Source: EWGSOP2, clinical research
 */
const GRIP_STRENGTH_THRESHOLDS = {
    male: [
        { minAge: 25, maxAge: 34, good: 45, average: 38, low: 27 },
        { minAge: 35, maxAge: 44, good: 43, average: 36, low: 27 },
        { minAge: 45, maxAge: 54, good: 39, average: 33, low: 27 },
        { minAge: 55, maxAge: 64, good: 36, average: 30, low: 27 },
        { minAge: 65, maxAge: 120, good: 30, average: 25, low: 27 },
    ],
    female: [
        { minAge: 25, maxAge: 34, good: 28, average: 23, low: 16 },
        { minAge: 35, maxAge: 44, good: 26, average: 22, low: 16 },
        { minAge: 45, maxAge: 54, good: 24, average: 20, low: 16 },
        { minAge: 55, maxAge: 64, good: 22, average: 18, low: 16 },
        { minAge: 65, maxAge: 120, good: 18, average: 15, low: 16 },
    ]
};

// =====================================================
// STATUS CLASSIFICATION ENGINE
// =====================================================

export class StatusClassificationEngine {

    // -------------------------------------------------
    // HRV / RMSSD (Age-Adjusted)
    // -------------------------------------------------

    static classifyHRV(rmssd: number, age: number): StatusResult {
        const thresholds = HRV_THRESHOLDS_BY_AGE.find(
            t => age >= t.minAge && age <= t.maxAge
        ) || HRV_THRESHOLDS_BY_AGE[HRV_THRESHOLDS_BY_AGE.length - 1];

        let status: ScientificStatus;
        if (rmssd >= thresholds.optimal) {
            status = 'optimal';
        } else if (rmssd >= thresholds.good) {
            status = 'good';
        } else if (rmssd >= thresholds.fair) {
            status = 'fair';
        } else {
            status = 'poor';
        }

        return {
            status,
            reason: `RMSSD ${rmssd}ms is ${status} for age ${age}`,
            confidence: 'high',
            thresholdUsed: `Age ${thresholds.minAge}-${thresholds.maxAge}: ≥${thresholds.optimal}ms optimal`,
            source: 'Kubios HRV Research'
        };
    }

    // -------------------------------------------------
    // Resting Heart Rate
    // -------------------------------------------------

    static classifyRHR(rhr: number, isAthlete: boolean = false): StatusResult {
        let status: ScientificStatus;

        if (isAthlete) {
            // Athletes have lower normal range
            if (rhr <= 50) status = 'optimal';
            else if (rhr <= 60) status = 'good';
            else if (rhr <= 70) status = 'fair';
            else status = 'poor';
        } else {
            // General population
            if (rhr <= 55) status = 'optimal';
            else if (rhr <= 65) status = 'good';
            else if (rhr <= 75) status = 'fair';
            else if (rhr <= 85) status = 'fair';
            else status = 'poor';
        }

        return {
            status,
            reason: `RHR ${rhr} bpm indicates ${status} cardiovascular fitness`,
            confidence: 'high',
            thresholdUsed: isAthlete ? 'Athlete: ≤50 optimal' : 'General: ≤55 optimal',
            source: 'Mayo Clinic, AHA'
        };
    }

    // -------------------------------------------------
    // Sleep Efficiency
    // -------------------------------------------------

    static classifySleepEfficiency(efficiency: number): StatusResult {
        let status: ScientificStatus;

        if (efficiency >= 90) status = 'optimal';
        else if (efficiency >= 85) status = 'good';
        else if (efficiency >= 75) status = 'fair';
        else status = 'poor';

        return {
            status,
            reason: `${efficiency}% sleep efficiency is ${status}`,
            confidence: 'high',
            thresholdUsed: '≥90% optimal, ≥85% good, ≥75% fair',
            source: 'Pittsburgh Sleep Quality Index'
        };
    }

    // -------------------------------------------------
    // Sleep Duration (Age-Adjusted)
    // -------------------------------------------------

    static classifySleepDuration(duration: number, age: number): StatusResult {
        let status: ScientificStatus;
        const isElderly = age >= 65;

        if (isElderly) {
            if (duration >= 7 && duration <= 8) status = 'optimal';
            else if ((duration >= 6 && duration < 7) || (duration > 8 && duration <= 9)) status = 'good';
            else if (duration >= 5 && duration < 6) status = 'fair';
            else status = 'poor';
        } else {
            if (duration >= 7 && duration <= 9) status = 'optimal';
            else if ((duration >= 6 && duration < 7) || (duration > 9 && duration <= 10)) status = 'good';
            else if (duration >= 5 && duration < 6) status = 'fair';
            else status = 'poor';
        }

        return {
            status,
            reason: `${duration}h sleep is ${status} for age ${age}`,
            confidence: 'high',
            thresholdUsed: isElderly ? '7-8h optimal (65+)' : '7-9h optimal (18-64)',
            source: 'National Sleep Foundation'
        };
    }

    // -------------------------------------------------
    // Deep Sleep Percentage (Age-Adjusted)
    // -------------------------------------------------

    static classifyDeepSleep(percent: number, age: number): StatusResult {
        // Deep sleep naturally declines ~2% per decade after 30
        const ageFactor = Math.max(0, (age - 30) / 10) * 2;
        const adjustedOptimal = Math.max(10, 20 - ageFactor);
        const adjustedGood = Math.max(8, 15 - ageFactor);

        let status: ScientificStatus;
        if (percent >= adjustedOptimal) status = 'optimal';
        else if (percent >= adjustedGood) status = 'good';
        else if (percent >= 10) status = 'fair';
        else status = 'poor';

        return {
            status,
            reason: `${percent}% deep sleep is ${status} for age ${age}`,
            confidence: 'medium',
            thresholdUsed: `Age-adjusted: ≥${adjustedOptimal.toFixed(0)}% optimal`,
            source: 'NIH Sleep Research'
        };
    }

    // -------------------------------------------------
    // REM Sleep Percentage
    // -------------------------------------------------

    static classifyREMSleep(percent: number): StatusResult {
        let status: ScientificStatus;

        if (percent >= 20 && percent <= 25) status = 'optimal';
        else if (percent >= 15 && percent < 20) status = 'good';
        else if (percent >= 10 && percent < 15) status = 'fair';
        else status = 'poor';

        return {
            status,
            reason: `${percent}% REM sleep is ${status}`,
            confidence: 'medium',
            thresholdUsed: '20-25% optimal, ≥15% good',
            source: 'NIH Sleep Research'
        };
    }

    // -------------------------------------------------
    // Recovery Score (Composite)
    // -------------------------------------------------

    static classifyRecovery(score: number): StatusResult {
        let status: ScientificStatus;

        if (score >= 85) status = 'optimal';
        else if (score >= 70) status = 'good';
        else if (score >= 50) status = 'fair';
        else status = 'poor';

        return {
            status,
            reason: `Recovery score ${score} indicates ${status} recovery`,
            confidence: 'high',
            thresholdUsed: '≥85 optimal, ≥70 good, ≥50 fair',
            source: 'Composite HRV/Sleep/Recovery'
        };
    }

    // -------------------------------------------------
    // ACWR (Acute:Chronic Workload Ratio)
    // -------------------------------------------------

    static classifyACWR(acwr: number): StatusResult {
        let status: ScientificStatus;
        let reason: string;

        if (acwr >= 0.8 && acwr <= 1.3) {
            status = 'optimal';
            reason = 'Training in sweet spot - low injury risk';
        } else if (acwr < 0.8) {
            status = 'fair';
            reason = 'Undertraining - may be underprepared';
        } else if (acwr <= 1.5) {
            status = 'fair';
            reason = 'Elevated workload - monitor recovery';
        } else {
            status = 'poor';
            reason = 'Danger zone - high injury risk';
        }

        return {
            status,
            reason: `ACWR ${acwr.toFixed(2)}: ${reason}`,
            confidence: 'high',
            thresholdUsed: '0.8-1.3 optimal (sweet spot)',
            source: 'Sports Science (Gabbett et al.)'
        };
    }

    // -------------------------------------------------
    // VO2max (Age & Sex Adjusted)
    // -------------------------------------------------

    static classifyVO2max(vo2max: number, age: number, sex: 'male' | 'female'): StatusResult {
        const thresholds = VO2MAX_THRESHOLDS[sex].find(
            t => age >= t.minAge && age <= t.maxAge
        ) || VO2MAX_THRESHOLDS[sex][VO2MAX_THRESHOLDS[sex].length - 1];

        let status: ScientificStatus;
        if (vo2max >= thresholds.excellent) status = 'optimal';
        else if (vo2max >= thresholds.good) status = 'good';
        else if (vo2max >= thresholds.average) status = 'fair';
        else status = 'poor';

        return {
            status,
            reason: `VO2max ${vo2max} ml/kg/min is ${status} for ${sex} age ${age}`,
            confidence: 'high',
            thresholdUsed: `${sex} age ${thresholds.minAge}-${thresholds.maxAge}: >${thresholds.excellent} excellent`,
            source: 'Topend Sports, Garmin Research'
        };
    }

    // -------------------------------------------------
    // Fasting Glucose
    // -------------------------------------------------

    static classifyFastingGlucose(glucose: number): StatusResult {
        let status: ScientificStatus;

        if (glucose >= 70 && glucose <= 85) status = 'optimal';
        else if (glucose > 85 && glucose <= 99) status = 'good';
        else if (glucose >= 100 && glucose <= 125) status = 'fair'; // Prediabetic
        else status = 'poor'; // Diabetic range or hypoglycemia

        return {
            status,
            reason: `Fasting glucose ${glucose} mg/dL is ${status}`,
            confidence: 'high',
            thresholdUsed: '70-85 optimal, 86-99 normal, 100-125 prediabetic',
            source: 'American Diabetes Association'
        };
    }

    // -------------------------------------------------
    // HbA1c
    // -------------------------------------------------

    static classifyHbA1c(hba1c: number): StatusResult {
        let status: ScientificStatus;

        if (hba1c < 5.4) status = 'optimal';
        else if (hba1c <= 5.6) status = 'good';
        else if (hba1c <= 6.4) status = 'fair'; // Prediabetic
        else status = 'poor'; // Diabetic

        return {
            status,
            reason: `HbA1c ${hba1c}% indicates ${status} glycemic control`,
            confidence: 'high',
            thresholdUsed: '<5.4% optimal, ≤5.6% normal, 5.7-6.4% prediabetic',
            source: 'American Diabetes Association'
        };
    }

    // -------------------------------------------------
    // hs-CRP (Inflammation)
    // -------------------------------------------------

    static classifyCRP(crp: number): StatusResult {
        let status: ScientificStatus;

        if (crp < 1.0) status = 'optimal';
        else if (crp <= 3.0) status = 'fair';
        else status = 'poor';

        return {
            status,
            reason: `hs-CRP ${crp} mg/L indicates ${status === 'optimal' ? 'low' : status === 'fair' ? 'moderate' : 'high'} cardiovascular risk`,
            confidence: 'high',
            thresholdUsed: '<1.0 low risk, 1-3 moderate, >3 high risk',
            source: 'AHA/CDC Guidelines'
        };
    }

    // -------------------------------------------------
    // Grip Strength (Age & Sex Adjusted, Sarcopenia)
    // -------------------------------------------------

    static classifyGripStrength(kg: number, age: number, sex: 'male' | 'female'): StatusResult {
        const thresholds = GRIP_STRENGTH_THRESHOLDS[sex].find(
            t => age >= t.minAge && age <= t.maxAge
        ) || GRIP_STRENGTH_THRESHOLDS[sex][GRIP_STRENGTH_THRESHOLDS[sex].length - 1];

        let status: ScientificStatus;
        if (kg >= thresholds.good) status = 'optimal';
        else if (kg >= thresholds.average) status = 'good';
        else if (kg >= thresholds.low) status = 'fair';
        else status = 'poor'; // Sarcopenia risk

        const sarcopeniaRisk = kg < thresholds.low;

        return {
            status,
            reason: sarcopeniaRisk
                ? `Grip ${kg}kg below sarcopenia threshold - muscle weakness detected`
                : `Grip strength ${kg}kg is ${status} for ${sex} age ${age}`,
            confidence: 'high',
            thresholdUsed: `EWGSOP2 ${sex}: ${thresholds.low}kg sarcopenia cutoff`,
            source: 'EWGSOP2 Sarcopenia Guidelines'
        };
    }

    // -------------------------------------------------
    // Hydration (Urine Specific Gravity)
    // -------------------------------------------------

    static classifyHydration(usg: number): StatusResult {
        let status: ScientificStatus;

        if (usg < 1.010) status = 'optimal';
        else if (usg <= 1.020) status = 'good';
        else if (usg <= 1.030) status = 'fair';
        else status = 'poor';

        return {
            status,
            reason: `USG ${usg.toFixed(3)} indicates ${status} hydration`,
            confidence: 'medium',
            thresholdUsed: '<1.010 euhydrated, 1.010-1.020 minimal dehydration',
            source: 'NATA Sports Science'
        };
    }

    // -------------------------------------------------
    // HRV Coherence (HeartMath)
    // -------------------------------------------------

    static classifyHRVCoherence(coherenceRatio: number): StatusResult {
        let status: ScientificStatus;

        if (coherenceRatio >= 0.8) status = 'optimal';
        else if (coherenceRatio >= 0.5) status = 'good';
        else if (coherenceRatio >= 0.3) status = 'fair';
        else status = 'poor';

        return {
            status,
            reason: `Coherence ratio ${coherenceRatio.toFixed(2)} indicates ${status} autonomic balance`,
            confidence: 'medium',
            thresholdUsed: '≥0.8 optimal, ≥0.5 good',
            source: 'HeartMath Institute'
        };
    }

    // -------------------------------------------------
    // Stress Level (0-100 scale)
    // -------------------------------------------------

    static classifyStress(stress: number): StatusResult {
        let status: ScientificStatus;

        if (stress <= 25) status = 'optimal';
        else if (stress <= 50) status = 'good';
        else if (stress <= 75) status = 'fair';
        else status = 'poor';

        return {
            status,
            reason: `Stress level ${stress} is ${status}`,
            confidence: 'medium',
            thresholdUsed: '≤25 optimal, ≤50 good, ≤75 fair',
            source: 'Composite stress assessment'
        };
    }

    // -------------------------------------------------
    // Fuel/Nutrition Score (% of targets)
    // -------------------------------------------------

    static classifyFuelScore(percentOfTarget: number): StatusResult {
        let status: ScientificStatus;

        if (percentOfTarget >= 85) status = 'optimal';
        else if (percentOfTarget >= 70) status = 'good';
        else if (percentOfTarget >= 50) status = 'fair';
        else status = 'poor';

        return {
            status,
            reason: `${percentOfTarget}% of nutrition targets met - ${status}`,
            confidence: 'medium',
            thresholdUsed: '≥85% optimal, ≥70% good, ≥50% fair',
            source: 'Nutritional guidelines'
        };
    }

    // -------------------------------------------------
    // Circadian Alignment Score
    // -------------------------------------------------

    static classifyCircadian(score: number): StatusResult {
        let status: ScientificStatus;

        if (score >= 85) status = 'optimal';
        else if (score >= 70) status = 'good';
        else if (score >= 50) status = 'fair';
        else status = 'poor';

        return {
            status,
            reason: `Circadian alignment ${score}% - ${status}`,
            confidence: 'medium',
            thresholdUsed: '≥85% optimal alignment',
            source: 'Circadian rhythm research'
        };
    }

    // -------------------------------------------------
    // Generic Score Classification (0-100)
    // -------------------------------------------------

    static classifyScore(score: number, domain: string = 'general'): StatusResult {
        let status: ScientificStatus;

        if (score >= 85) status = 'optimal';
        else if (score >= 70) status = 'good';
        else if (score >= 50) status = 'fair';
        else status = 'poor';

        return {
            status,
            reason: `${domain} score ${score} is ${status}`,
            confidence: 'medium',
            thresholdUsed: '≥85 optimal, ≥70 good, ≥50 fair'
        };
    }
}

// Export singleton-like access
export const classifyStatus = StatusClassificationEngine;
