/**
 * Biomarker Engine - Blood Work Analysis
 * 
 * Implements:
 * - Range analysis with status classification
 * - Trend detection
 * - Priority ranking
 * - Blueprint target comparison
 */

import {
    Biomarker,
    BiomarkerReading,
    BiomarkerStatus,
    BiomarkerAnalysis,
    BiomarkerPanel,
    BIOMARKER_DEFINITIONS,
    BIOMARKER_PANELS,
    BiomarkerDashboardOutput
} from '../../types/biomarkers';

// ============================================================================
// STATUS CLASSIFICATION
// ============================================================================

const classifyStatus = (value: number, biomarker: Biomarker): BiomarkerStatus => {
    const { reference, action_thresholds } = biomarker;

    // Check critical thresholds first
    if (action_thresholds.critical_low !== undefined && value < action_thresholds.critical_low) {
        return 'critical_low';
    }
    if (action_thresholds.critical_high !== undefined && value > action_thresholds.critical_high) {
        return 'critical_high';
    }

    // Standard classification
    if (value < reference.normal_low) return 'low';
    if (value > reference.normal_high) return 'high';

    // Within normal - check if optimal
    if (value >= reference.optimal_low && value <= reference.optimal_high) return 'optimal';

    return 'normal';
};

const calculatePercentile = (value: number, biomarker: Biomarker): number => {
    const { reference } = biomarker;
    const range = reference.high - reference.low;
    if (range === 0) return 50;

    const percentile = ((value - reference.low) / range) * 100;
    return Math.max(0, Math.min(100, percentile));
};

// ============================================================================
// TREND ANALYSIS
// ============================================================================

type Trend = 'improving' | 'stable' | 'worsening';

const analyzeTrend = (
    current: number,
    previous: number | undefined,
    biomarker: Biomarker
): { trend: Trend; percentage?: number } => {
    if (previous === undefined) {
        return { trend: 'stable' };
    }

    const diff = current - previous;
    const percentChange = (diff / previous) * 100;

    // Determine if direction is good or bad
    const currentStatus = classifyStatus(current, biomarker);
    const previousStatus = classifyStatus(previous, biomarker);

    // If moved toward optimal, improving
    const optimalMid = (biomarker.reference.optimal_low + biomarker.reference.optimal_high) / 2;
    const currentDistFromOptimal = Math.abs(current - optimalMid);
    const previousDistFromOptimal = Math.abs(previous - optimalMid);

    if (currentDistFromOptimal < previousDistFromOptimal * 0.95) {
        return { trend: 'improving', percentage: percentChange };
    } else if (currentDistFromOptimal > previousDistFromOptimal * 1.05) {
        return { trend: 'worsening', percentage: percentChange };
    }

    return { trend: 'stable', percentage: percentChange };
};

// ============================================================================
// PRIORITY CALCULATION
// ============================================================================

const calculatePriority = (analysis: BiomarkerAnalysis): 'low' | 'medium' | 'high' | 'critical' => {
    if (analysis.status === 'critical_low' || analysis.status === 'critical_high') {
        return 'critical';
    }

    if (analysis.status === 'low' || analysis.status === 'high') {
        if (analysis.trend === 'worsening') {
            return 'high';
        }
        return 'medium';
    }

    if (analysis.status === 'normal' && analysis.trend === 'worsening') {
        return 'medium';
    }

    return 'low';
};

// ============================================================================
// MAIN ENGINE
// ============================================================================

interface StoredReading extends BiomarkerReading {
    id: string;
}

export class BiomarkerEngine {
    private readings: Map<string, StoredReading[]> = new Map();

    /**
     * Add a new biomarker reading
     */
    addReading(reading: BiomarkerReading): void {
        const id = `${reading.biomarker_id}_${reading.date}_${Date.now()}`;
        const storedReading = { ...reading, id };

        const existing = this.readings.get(reading.biomarker_id) || [];
        existing.push(storedReading);

        // Sort by date, most recent first
        existing.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        this.readings.set(reading.biomarker_id, existing);
    }

    /**
     * Get the biomarker definition
     */
    getBiomarker(id: string): Biomarker | undefined {
        return BIOMARKER_DEFINITIONS.find(b => b.id === id);
    }

    /**
     * Analyze a single biomarker
     */
    analyzeBiomarker(biomarkerId: string): BiomarkerAnalysis | null {
        const biomarker = this.getBiomarker(biomarkerId);
        if (!biomarker) return null;

        const history = this.readings.get(biomarkerId) || [];
        if (history.length === 0) return null;

        const mostRecent = history[0];
        const previous = history.length > 1 ? history[1] : undefined;

        const status = classifyStatus(mostRecent.value, biomarker);
        const percentile = calculatePercentile(mostRecent.value, biomarker);
        const trendResult = analyzeTrend(mostRecent.value, previous?.value, biomarker);

        const analysis: BiomarkerAnalysis = {
            biomarker,
            current_value: mostRecent.value,
            date: mostRecent.date,
            status,
            percentile,
            previous_value: previous?.value,
            trend: trendResult.trend,
            trend_percentage: trendResult.percentage,
            recommendation: this.getRecommendation(biomarker, status),
            priority: 'low' // Will calculate after creation
        };

        analysis.priority = calculatePriority(analysis);

        return analysis;
    }

    /**
     * Get recommendation based on status
     */
    private getRecommendation(biomarker: Biomarker, status: BiomarkerStatus): string | undefined {
        if (status === 'optimal') {
            return undefined;
        }

        if (status === 'critical_low' || status === 'critical_high') {
            return 'Consult with a healthcare provider immediately.';
        }

        // Return relevant improvement tips
        const tips = biomarker.improvement_tips;
        if (!tips || tips.length === 0) return undefined;

        return tips.slice(0, 2).join('. ') + '.';
    }

    /**
     * Analyze a panel of biomarkers
     */
    analyzePanel(panelId: string): {
        panel: BiomarkerPanel;
        score: number;
        status: 'optimal' | 'good' | 'needs_attention' | 'critical';
        markers: BiomarkerAnalysis[];
    } | null {
        const panel = BIOMARKER_PANELS.find(p => p.id === panelId);
        if (!panel) return null;

        const markers: BiomarkerAnalysis[] = [];
        let totalScore = 0;
        let hasData = 0;

        panel.biomarkers.forEach(biomarkerId => {
            const analysis = this.analyzeBiomarker(biomarkerId);
            if (analysis) {
                markers.push(analysis);

                // Score based on status
                let markerScore = 0;
                switch (analysis.status) {
                    case 'optimal': markerScore = 100; break;
                    case 'normal': markerScore = 75; break;
                    case 'low': case 'high': markerScore = 40; break;
                    case 'critical_low': case 'critical_high': markerScore = 0; break;
                }

                totalScore += markerScore;
                hasData++;
            }
        });

        const averageScore = hasData > 0 ? Math.round(totalScore / hasData) : 0;

        let status: 'optimal' | 'good' | 'needs_attention' | 'critical';
        if (markers.some(m => m.status.includes('critical'))) {
            status = 'critical';
        } else if (averageScore >= 85) {
            status = 'optimal';
        } else if (averageScore >= 60) {
            status = 'good';
        } else {
            status = 'needs_attention';
        }

        return { panel, score: averageScore, status, markers };
    }

    /**
     * Get all critical alerts
     */
    getCriticalAlerts(): BiomarkerAnalysis[] {
        const alerts: BiomarkerAnalysis[] = [];

        BIOMARKER_DEFINITIONS.forEach(biomarker => {
            const analysis = this.analyzeBiomarker(biomarker.id);
            if (analysis && (analysis.status === 'critical_low' || analysis.status === 'critical_high')) {
                alerts.push(analysis);
            }
        });

        return alerts;
    }

    /**
     * Get improvement priorities
     */
    getImprovementPriorities(): {
        biomarker: Biomarker;
        current_status: BiomarkerStatus;
        recommendations: string[];
    }[] {
        const priorities: {
            biomarker: Biomarker;
            current_status: BiomarkerStatus;
            recommendations: string[];
        }[] = [];

        BIOMARKER_DEFINITIONS.forEach(biomarker => {
            const analysis = this.analyzeBiomarker(biomarker.id);
            if (analysis && analysis.status !== 'optimal') {
                priorities.push({
                    biomarker,
                    current_status: analysis.status,
                    recommendations: biomarker.improvement_tips
                });
            }
        });

        // Sort by priority
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        priorities.sort((a, b) => {
            const prioA = a.current_status.includes('critical') ? 'critical' :
                a.current_status === 'low' || a.current_status === 'high' ? 'medium' : 'low';
            const prioB = b.current_status.includes('critical') ? 'critical' :
                b.current_status === 'low' || b.current_status === 'high' ? 'medium' : 'low';
            return priorityOrder[prioA] - priorityOrder[prioB];
        });

        return priorities.slice(0, 5);
    }

    /**
     * Get last test date
     */
    getLastTestDate(): string | null {
        let lastDate: string | null = null;

        this.readings.forEach(history => {
            if (history.length > 0) {
                const date = history[0].date;
                if (!lastDate || date > lastDate) {
                    lastDate = date;
                }
            }
        });

        return lastDate;
    }

    /**
     * Main analysis method
     */
    analyze(): BiomarkerDashboardOutput {
        const panels = BIOMARKER_PANELS.map(panel => {
            const result = this.analyzePanel(panel.id);
            if (result) {
                return result;
            }
            return {
                panel,
                score: 0,
                status: 'needs_attention' as const,
                markers: []
            };
        });

        const criticalAlerts = this.getCriticalAlerts();
        const improvementPriorities = this.getImprovementPriorities();

        // Overall score
        const panelsWithData = panels.filter(p => p.markers.length > 0);
        const overallScore = panelsWithData.length > 0
            ? Math.round(panelsWithData.reduce((acc, p) => acc + p.score, 0) / panelsWithData.length)
            : 0;

        // Last test date
        const lastTestDate = this.getLastTestDate() || new Date().toISOString().split('T')[0];

        // Next recommended test (3 months from last)
        const lastDate = new Date(lastTestDate);
        lastDate.setMonth(lastDate.getMonth() + 3);
        const nextRecommendedTest = lastDate.toISOString().split('T')[0];

        return {
            last_test_date: lastTestDate,
            next_recommended_test: nextRecommendedTest,
            panels,
            critical_alerts: criticalAlerts,
            improvement_priorities: improvementPriorities,
            overall_score: overallScore
        };
    }

    /**
     * Load sample data for demo
     */
    loadSampleData(): void {
        const today = new Date().toISOString().split('T')[0];
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const previousDate = threeMonthsAgo.toISOString().split('T')[0];

        // Sample current readings
        const currentReadings: BiomarkerReading[] = [
            { biomarker_id: 'glucose_fasting', value: 85, date: today, fasting: true },
            { biomarker_id: 'hba1c', value: 5.1, date: today, fasting: true },
            { biomarker_id: 'fasting_insulin', value: 4.5, date: today, fasting: true },
            { biomarker_id: 'apob', value: 75, date: today, fasting: true },
            { biomarker_id: 'ldl', value: 95, date: today, fasting: true },
            { biomarker_id: 'hdl', value: 65, date: today, fasting: true },
            { biomarker_id: 'triglycerides', value: 60, date: today, fasting: true },
            { biomarker_id: 'hscrp', value: 0.4, date: today, fasting: true },
            { biomarker_id: 'testosterone_total', value: 650, date: today, fasting: true },
            { biomarker_id: 'cortisol_am', value: 15, date: today, fasting: true },
            { biomarker_id: 'creatine_kinase', value: 180, date: today, fasting: false },
            { biomarker_id: 'ferritin', value: 85, date: today, fasting: true },
            { biomarker_id: 'vitamin_d', value: 55, date: today, fasting: true }
        ];

        // Sample previous readings
        const previousReadings: BiomarkerReading[] = [
            { biomarker_id: 'glucose_fasting', value: 92, date: previousDate, fasting: true },
            { biomarker_id: 'hba1c', value: 5.3, date: previousDate, fasting: true },
            { biomarker_id: 'apob', value: 82, date: previousDate, fasting: true },
            { biomarker_id: 'hscrp', value: 0.8, date: previousDate, fasting: true },
            { biomarker_id: 'vitamin_d', value: 35, date: previousDate, fasting: true }
        ];

        // Load previous first (so current becomes most recent)
        previousReadings.forEach(r => this.addReading(r));
        currentReadings.forEach(r => this.addReading(r));
    }
}

// Singleton with sample data
export const biomarkerEngine = new BiomarkerEngine();
biomarkerEngine.loadSampleData();

// Convenience export
export function analyzeBiomarkers(): BiomarkerDashboardOutput {
    return biomarkerEngine.analyze();
}
