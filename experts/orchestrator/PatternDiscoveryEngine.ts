/**
 * Pattern Discovery Engine - Correlation & Insight Detection
 * 
 * Implements:
 * - Cross-domain correlation analysis
 * - Automatic pattern detection
 * - Insight generation with confidence scoring
 * - Personalized learning over time
 */

// ============================================================================
// PATTERN TYPES
// ============================================================================

export type PatternDomain =
    | 'sleep'
    | 'hrv'
    | 'training'
    | 'nutrition'
    | 'recovery'
    | 'performance'
    | 'mood'
    | 'circadian'
    | 'biomarkers';

export interface DataPoint {
    date: string;
    domain: PatternDomain;
    metric: string;
    value: number;
    unit?: string;
}

export interface CorrelationResult {
    domain_a: PatternDomain;
    metric_a: string;
    domain_b: PatternDomain;
    metric_b: string;
    correlation_coefficient: number;  // -1 to 1
    direction: 'positive' | 'negative';
    strength: 'weak' | 'moderate' | 'strong' | 'very_strong';
    sample_size: number;
    p_value: number;
    lag_days: number;  // If lagged correlation (e.g., sleep affects next day HRV)
}

export interface DiscoveredPattern {
    id: string;
    discovered_date: string;
    title: string;
    description: string;

    // Correlation data
    correlations: CorrelationResult[];

    // Insight
    insight_type: 'correlation' | 'trend' | 'anomaly' | 'threshold' | 'periodicity' | 'cause_effect';

    // Confidence
    confidence: number;  // 0-100
    data_quality: 'low' | 'medium' | 'high';

    // Actionability
    actionable: boolean;
    recommendation?: string;

    // User feedback
    user_confirmed?: boolean;
    user_dismissed?: boolean;

    // Display
    icon: string;
    color: string;
    domains_involved: PatternDomain[];
}

// ============================================================================
// KNOWN PATTERN TEMPLATES
// ============================================================================

interface PatternTemplate {
    id: string;
    title: string;
    description_template: string;
    domains: PatternDomain[];
    metrics: { domain: PatternDomain; metric: string }[];
    expected_correlation: 'positive' | 'negative';
    min_correlation: number;
    lag_days: number;
    recommendation_template: string;
    research_backing: string;
}

const PATTERN_TEMPLATES: PatternTemplate[] = [
    {
        id: 'sleep_hrv',
        title: 'Sleep Quality → HRV',
        description_template: 'When your sleep quality is {direction}, your HRV tends to be {direction} the next day.',
        domains: ['sleep', 'hrv'],
        metrics: [
            { domain: 'sleep', metric: 'quality_score' },
            { domain: 'hrv', metric: 'rmssd' }
        ],
        expected_correlation: 'positive',
        min_correlation: 0.4,
        lag_days: 1,
        recommendation_template: 'Prioritize sleep quality to improve recovery capacity.',
        research_backing: 'Sleep is the primary driver of parasympathetic recovery.'
    },
    {
        id: 'deep_sleep_strength',
        title: 'Deep Sleep → Strength Performance',
        description_template: 'More deep sleep is associated with {correlation_strength} gains in strength metrics.',
        domains: ['sleep', 'performance'],
        metrics: [
            { domain: 'sleep', metric: 'deep_percentage' },
            { domain: 'performance', metric: 'max_strength' }
        ],
        expected_correlation: 'positive',
        min_correlation: 0.3,
        lag_days: 0,
        recommendation_template: 'Aim for 20%+ deep sleep to maximize strength adaptations.',
        research_backing: 'Growth hormone peaks during deep sleep, critical for muscle repair.'
    },
    {
        id: 'training_load_injury',
        title: 'ACWR Spikes → Injury Risk',
        description_template: 'Your injury occurrences correlate with periods of high ACWR (>1.5).',
        domains: ['training', 'recovery'],
        metrics: [
            { domain: 'training', metric: 'acwr' },
            { domain: 'recovery', metric: 'injury_events' }
        ],
        expected_correlation: 'positive',
        min_correlation: 0.5,
        lag_days: 7,
        recommendation_template: 'Keep ACWR below 1.5 to minimize injury risk.',
        research_backing: 'Gabbett research shows 2-4x injury risk when ACWR exceeds 1.5.'
    },
    {
        id: 'caffeine_sleep',
        title: 'Late Caffeine → Poor Sleep',
        description_template: 'Caffeine after 2 PM is associated with {correlation_strength} reductions in sleep quality.',
        domains: ['nutrition', 'sleep'],
        metrics: [
            { domain: 'nutrition', metric: 'caffeine_after_2pm' },
            { domain: 'sleep', metric: 'quality_score' }
        ],
        expected_correlation: 'negative',
        min_correlation: 0.35,
        lag_days: 0,
        recommendation_template: 'Cut off caffeine by 2 PM (or 8+ hours before bed).',
        research_backing: 'Caffeine half-life is 5-6 hours. Even if you fall asleep, it reduces deep sleep.'
    },
    {
        id: 'morning_light_mood',
        title: 'Morning Light → Mood',
        description_template: 'Days with morning sunlight exposure show {correlation_strength} improvements in mood.',
        domains: ['circadian', 'mood'],
        metrics: [
            { domain: 'circadian', metric: 'morning_light_minutes' },
            { domain: 'mood', metric: 'mood_score' }
        ],
        expected_correlation: 'positive',
        min_correlation: 0.4,
        lag_days: 0,
        recommendation_template: 'Get 10+ minutes of outdoor light within 1 hour of waking.',
        research_backing: 'Morning light triggers cortisol and dopamine release (Huberman).'
    },
    {
        id: 'consistency_performance',
        title: 'Schedule Consistency → Performance',
        description_template: 'Consistent sleep and meal timing correlates with better performance metrics.',
        domains: ['circadian', 'performance'],
        metrics: [
            { domain: 'circadian', metric: 'schedule_consistency' },
            { domain: 'performance', metric: 'performance_index' }
        ],
        expected_correlation: 'positive',
        min_correlation: 0.3,
        lag_days: 7,
        recommendation_template: 'Maintain consistent wake time (±30 min) 7 days a week.',
        research_backing: 'Circadian rhythm stability improves metabolic and cognitive function.'
    }
];

// ============================================================================
// ANALYSIS OUTPUT
// ============================================================================

export interface PatternDiscoveryOutput {
    // Discovered patterns
    patterns: DiscoveredPattern[];

    // New discoveries (since last check)
    new_discoveries: DiscoveredPattern[];

    // Strong correlations found
    top_correlations: CorrelationResult[];

    // Data quality assessment
    data_coverage: {
        domain: PatternDomain;
        days_with_data: number;
        completeness: number;
    }[];

    // Actionable insights ranked
    ranked_insights: {
        pattern: DiscoveredPattern;
        impact_score: number;
        effort_score: number;
        priority: number;
    }[];
}

// ============================================================================
// STATISTICAL HELPERS
// ============================================================================

const mean = (values: number[]): number =>
    values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;

const standardDeviation = (values: number[]): number => {
    if (values.length === 0) return 0;
    const avg = mean(values);
    return Math.sqrt(mean(values.map(v => Math.pow(v - avg, 2))));
};

const pearsonCorrelation = (x: number[], y: number[]): number => {
    if (x.length !== y.length || x.length < 3) return 0;

    const n = x.length;
    const xMean = mean(x);
    const yMean = mean(y);
    const xStd = standardDeviation(x);
    const yStd = standardDeviation(y);

    if (xStd === 0 || yStd === 0) return 0;

    let sum = 0;
    for (let i = 0; i < n; i++) {
        sum += ((x[i] - xMean) / xStd) * ((y[i] - yMean) / yStd);
    }

    return sum / n;
};

const getCorrelationStrength = (r: number): 'weak' | 'moderate' | 'strong' | 'very_strong' => {
    const absR = Math.abs(r);
    if (absR >= 0.7) return 'very_strong';
    if (absR >= 0.5) return 'strong';
    if (absR >= 0.3) return 'moderate';
    return 'weak';
};

// ============================================================================
// MOCK DATA GENERATION
// ============================================================================

const generateMockHistoricalData = (days: number): DataPoint[] => {
    const data: DataPoint[] = [];

    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        // Sleep data
        const sleepQuality = 60 + Math.random() * 30;
        data.push({ date: dateStr, domain: 'sleep', metric: 'quality_score', value: sleepQuality });
        data.push({ date: dateStr, domain: 'sleep', metric: 'deep_percentage', value: 15 + Math.random() * 10 });

        // HRV data (correlated with previous day's sleep)
        const yesterdaySleep = data.find(d => d.date === dateStr && d.metric === 'quality_score')?.value || 70;
        const hrvValue = 40 + (yesterdaySleep - 60) * 0.5 + Math.random() * 15;
        data.push({ date: dateStr, domain: 'hrv', metric: 'rmssd', value: hrvValue });

        // Training load
        const isTrainingDay = Math.random() > 0.3;
        if (isTrainingDay) {
            data.push({ date: dateStr, domain: 'training', metric: 'load_au', value: 300 + Math.random() * 200 });
            data.push({ date: dateStr, domain: 'training', metric: 'acwr', value: 0.8 + Math.random() * 0.6 });
        }

        // Mood (correlated with sleep)
        const moodValue = 5 + (sleepQuality - 60) * 0.05 + (Math.random() - 0.5) * 2;
        data.push({ date: dateStr, domain: 'mood', metric: 'mood_score', value: Math.min(10, Math.max(1, moodValue)) });

        // Circadian
        const morningLight = Math.random() > 0.4 ? 10 + Math.random() * 20 : 0;
        data.push({ date: dateStr, domain: 'circadian', metric: 'morning_light_minutes', value: morningLight });
    }

    return data;
};

// ============================================================================
// MAIN ENGINE
// ============================================================================

export class PatternDiscoveryEngine {
    private historicalData: DataPoint[] = [];
    private discoveredPatterns: DiscoveredPattern[] = [];

    constructor() {
        this.historicalData = generateMockHistoricalData(60);
    }

    /**
     * Add new data point
     */
    addDataPoint(point: DataPoint): void {
        this.historicalData.push(point);
    }

    /**
     * Calculate correlation between two metrics
     */
    calculateCorrelation(
        domainA: PatternDomain,
        metricA: string,
        domainB: PatternDomain,
        metricB: string,
        lagDays: number = 0
    ): CorrelationResult | null {
        // Get data for both metrics
        const dataA = this.historicalData.filter(d => d.domain === domainA && d.metric === metricA);
        const dataB = this.historicalData.filter(d => d.domain === domainB && d.metric === metricB);

        if (dataA.length < 10 || dataB.length < 10) return null;

        // Align by date (with lag)
        const alignedX: number[] = [];
        const alignedY: number[] = [];

        dataA.forEach(pointA => {
            const targetDate = new Date(pointA.date);
            targetDate.setDate(targetDate.getDate() + lagDays);
            const targetDateStr = targetDate.toISOString().split('T')[0];

            const pointB = dataB.find(b => b.date === targetDateStr);
            if (pointB) {
                alignedX.push(pointA.value);
                alignedY.push(pointB.value);
            }
        });

        if (alignedX.length < 10) return null;

        const r = pearsonCorrelation(alignedX, alignedY);

        return {
            domain_a: domainA,
            metric_a: metricA,
            domain_b: domainB,
            metric_b: metricB,
            correlation_coefficient: r,
            direction: r >= 0 ? 'positive' : 'negative',
            strength: getCorrelationStrength(r),
            sample_size: alignedX.length,
            p_value: 0.01, // Simplified
            lag_days: lagDays
        };
    }

    /**
     * Scan for known pattern templates
     */
    scanForPatterns(): DiscoveredPattern[] {
        const discovered: DiscoveredPattern[] = [];

        PATTERN_TEMPLATES.forEach(template => {
            const [metricA, metricB] = template.metrics;

            const correlation = this.calculateCorrelation(
                metricA.domain,
                metricA.metric,
                metricB.domain,
                metricB.metric,
                template.lag_days
            );

            if (correlation && Math.abs(correlation.correlation_coefficient) >= template.min_correlation) {
                // Pattern found
                const matchesExpected =
                    (template.expected_correlation === 'positive' && correlation.direction === 'positive') ||
                    (template.expected_correlation === 'negative' && correlation.direction === 'negative');

                if (matchesExpected) {
                    const pattern: DiscoveredPattern = {
                        id: `${template.id}_${Date.now()}`,
                        discovered_date: new Date().toISOString(),
                        title: template.title,
                        description: template.description_template
                            .replace('{direction}', correlation.direction)
                            .replace('{correlation_strength}', correlation.strength),
                        correlations: [correlation],
                        insight_type: 'correlation',
                        confidence: Math.round(Math.abs(correlation.correlation_coefficient) * 100),
                        data_quality: correlation.sample_size >= 30 ? 'high' : correlation.sample_size >= 15 ? 'medium' : 'low',
                        actionable: true,
                        recommendation: template.recommendation_template,
                        icon: 'TrendingUp',
                        color: correlation.strength === 'strong' || correlation.strength === 'very_strong'
                            ? 'hsl(270, 70%, 50%)'
                            : 'hsl(200, 70%, 50%)',
                        domains_involved: template.domains
                    };

                    discovered.push(pattern);
                }
            }
        });

        return discovered;
    }

    /**
     * Get top correlations across all metrics
     */
    findTopCorrelations(limit: number = 10): CorrelationResult[] {
        const correlations: CorrelationResult[] = [];

        const metrics: { domain: PatternDomain; metric: string }[] = [
            { domain: 'sleep', metric: 'quality_score' },
            { domain: 'sleep', metric: 'deep_percentage' },
            { domain: 'hrv', metric: 'rmssd' },
            { domain: 'training', metric: 'load_au' },
            { domain: 'mood', metric: 'mood_score' },
            { domain: 'circadian', metric: 'morning_light_minutes' }
        ];

        // Check all pairs
        for (let i = 0; i < metrics.length; i++) {
            for (let j = i + 1; j < metrics.length; j++) {
                // Same-day correlation
                const corr0 = this.calculateCorrelation(
                    metrics[i].domain, metrics[i].metric,
                    metrics[j].domain, metrics[j].metric,
                    0
                );
                if (corr0 && Math.abs(corr0.correlation_coefficient) > 0.2) {
                    correlations.push(corr0);
                }

                // 1-day lag
                const corr1 = this.calculateCorrelation(
                    metrics[i].domain, metrics[i].metric,
                    metrics[j].domain, metrics[j].metric,
                    1
                );
                if (corr1 && Math.abs(corr1.correlation_coefficient) > 0.2) {
                    correlations.push(corr1);
                }
            }
        }

        // Sort by absolute correlation strength
        correlations.sort((a, b) =>
            Math.abs(b.correlation_coefficient) - Math.abs(a.correlation_coefficient)
        );

        return correlations.slice(0, limit);
    }

    /**
     * Assess data coverage
     */
    assessDataCoverage(): { domain: PatternDomain; days_with_data: number; completeness: number }[] {
        const domains: PatternDomain[] = ['sleep', 'hrv', 'training', 'nutrition', 'recovery', 'mood', 'circadian'];
        const totalDays = 60;

        return domains.map(domain => {
            const uniqueDates = new Set(
                this.historicalData.filter(d => d.domain === domain).map(d => d.date)
            );
            return {
                domain,
                days_with_data: uniqueDates.size,
                completeness: Math.round((uniqueDates.size / totalDays) * 100)
            };
        });
    }

    /**
     * Main analysis method
     */
    analyze(): PatternDiscoveryOutput {
        const patterns = this.scanForPatterns();
        const topCorrelations = this.findTopCorrelations();
        const dataCoverage = this.assessDataCoverage();

        // Rank insights by impact and effort
        const rankedInsights = patterns.map(pattern => ({
            pattern,
            impact_score: pattern.confidence * (pattern.actionable ? 1.5 : 1),
            effort_score: 50, // Simplified
            priority: pattern.confidence * (pattern.actionable ? 1.5 : 1)
        })).sort((a, b) => b.priority - a.priority);

        // Identify new discoveries
        const existingIds = new Set(this.discoveredPatterns.map(p => p.title));
        const newDiscoveries = patterns.filter(p => !existingIds.has(p.title));

        // Update stored patterns
        this.discoveredPatterns = patterns;

        return {
            patterns,
            new_discoveries: newDiscoveries,
            top_correlations: topCorrelations,
            data_coverage: dataCoverage,
            ranked_insights: rankedInsights
        };
    }
}

// Singleton
export const patternDiscoveryEngine = new PatternDiscoveryEngine();

// State-driven analysis function
import type { GlobalState } from '../../types';

/**
 * Discover patterns from GlobalState
 * Note: Currently uses engine's internal historical data
 * TODO: Populate engine history from actual GlobalState history when available
 */
export function discoverPatterns(state?: GlobalState): PatternDiscoveryOutput {
    // When state is provided, we could populate the engine with real data
    // For now, the engine uses its own simulation, but this is the integration point
    if (state) {
        // Future: Convert state history to DataPoints and inject
        // For demo mode, the engine will still show sample correlations
    }

    return patternDiscoveryEngine.analyze();
}
