
import { CognitiveTrajectory, UserProfile } from "../../../types";

export class CognitiveTrajectoryEngine {

  public static calculateTrajectory(
    metric: "focus_density" | "reaction_time" | "impulse_control" | "memory_span",
    history: Array<{score: number, timestamp: string}>,
    baselines: UserProfile['baselines']
  ): CognitiveTrajectory {
    
    const sorted = history.sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const scores_7d = sorted.slice(-7);
    
    const trend = this.calculateTrend(scores_7d.map(s => s.score));
    const prediction = this.generatePredictions(trend, metric);
    
    return {
      metric,
      scores_7d: scores_7d.map(s => ({
          ...s,
          grade: this.gradeScore(s.score, metric, baselines)
      })),
      trend,
      predictions: prediction,
      alerts: this.generateAlerts(trend, metric)
    };
  }

  private static calculateTrend(scores: number[]) {
    if (scores.length < 2) return { direction: "stable" as const, velocity: 0, acceleration: 0, volatility: 0 };

    // 1. Velocity (Linear Regression Slope)
    const n = scores.length;
    const sumX = scores.reduce((acc, _, i) => acc + i, 0);
    const sumY = scores.reduce((acc, val) => acc + val, 0);
    const sumXY = scores.reduce((acc, val, i) => acc + (i * val), 0);
    const sumXX = scores.reduce((acc, _, i) => acc + (i * i), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    // 2. Volatility (CV)
    const mean = sumY / n;
    const variance = scores.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    const volatility = mean === 0 ? 0 : (stdDev / mean) * 100;

    return {
      direction: slope > 0.5 ? "rising" as const : slope < -0.5 ? "declining" as const : "stable" as const,
      velocity: parseFloat(slope.toFixed(2)),
      acceleration: 0, // Requires 2nd derivative, simplified for now
      volatility: parseFloat(volatility.toFixed(2))
    };
  }

  private static generatePredictions(trend: any, metric: string) {
    // Simple heuristic
    let risk = 0;
    if (trend.direction === 'declining' && Math.abs(trend.velocity) > 2) risk += 0.4;
    if (trend.volatility > 10) risk += 0.3;
    
    return {
      breakdown_risk: parseFloat(risk.toFixed(2)),
      breakdown_date_prediction: risk > 0.7 ? new Date(Date.now() + 4 * 86400000).toISOString() : null,
      confidence: 0.6
    };
  }

  private static generateAlerts(trend: any, metric: string): string[] {
    const alerts: string[] = [];
    if (metric === 'focus_density' && trend.velocity < -3) alerts.push("Focus declining rapidly.");
    if (metric === 'reaction_time' && trend.velocity > 15) alerts.push("CNS Latency increasing (Slowing).");
    if (trend.volatility > 15) alerts.push("Performance unstable.");
    return alerts;
  }

  private static gradeScore(score: number, metric: string, baselines: any): "S" | "A" | "B" | "C" | "F" {
    // Naive grading relative to generic elite standards if baseline missing
    // Real impl would use Z-score vs baseline
    if (metric === 'reaction_time') {
       if (score < 200) return 'S';
       if (score < 230) return 'A';
       if (score < 270) return 'B';
       if (score < 350) return 'C';
       return 'F';
    }
    // Default
    return 'B';
  }
}
