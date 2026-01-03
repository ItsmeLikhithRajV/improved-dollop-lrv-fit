
export class StatisticsEngine {
    
    /**
     * Calculates the arithmetic mean of an array.
     */
    static calculateMean(values: number[]): number {
        if (values.length === 0) return 0;
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    /**
     * Calculates the Standard Deviation (Population).
     */
    static calculateSD(values: number[], mean: number): number {
        if (values.length < 2) return 0;
        const squareDiffs = values.map(value => Math.pow(value - mean, 2));
        const avgSquareDiff = this.calculateMean(squareDiffs);
        return Math.sqrt(avgSquareDiff);
    }

    /**
     * Calculates the Z-Score (Standard Score).
     * Indicates how many SDs an element is from the mean.
     * @returns number (e.g. -1.5, 0, 2.3)
     */
    static getZScore(current: number, mean: number, sd: number): number {
        if (sd === 0) return 0;
        return (current - mean) / sd;
    }

    /**
     * Helper to map a Z-Score to a 0-100 health scale.
     * @param zScore 
     * @param baselineScore The score at Z=0 (Mean). Usually 75.
     * @param sensitivity How many points to shift per 1 SD.
     */
    static mapZScoreToMetric(zScore: number, baselineScore: number = 75, sensitivity: number = 15): number {
        // e.g. Z = -2 (2 SD below mean) -> 75 + (-2 * 15) = 45.
        // e.g. Z = +1 (1 SD above mean) -> 75 + (1 * 15) = 90.
        const score = baselineScore + (zScore * sensitivity);
        return Math.max(0, Math.min(100, Math.round(score)));
    }
}
