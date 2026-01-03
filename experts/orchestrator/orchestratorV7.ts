
/**
 * SENTIENT UNIFIED ORCHESTRATOR V7 - LOGIC MODULE
 * 
 * Implements the Urgency x Enablement prioritization framework.
 * Grounded in 2019-2024 Sports Science.
 */

export interface DomainPenalty {
  engine: "recovery" | "fuel" | "mindspace" | "performance";
  penalty: number; // 0-100
  score: number;   // 100 - penalty
  reasons: string[];
}

export interface ActionCandidate {
  id: string;
  engine: "recovery" | "fuel" | "mindspace" | "performance" | "longevity";
  name: string;
  description: string;
  urgency_score: number; // 0-100
  enablement_score: number; // 0-100
  duration_minutes: number;
  protocol?: string;
  rationale: string;
  impact_if_done: string;
  impact_if_skipped: string;
}

export class OrchestratorV7 {
  /**
   * DYNAMIC WEIGHTING (V7 Logic)
   * Shifts priorities based on the severity of physiological penalties.
   */
  public static calculateDynamicWeights(penalties: Record<string, number>) {
    const { recovery, fuel, mindspace, performance } = penalties;

    // RED LINE 1: Recovery critically low (HRV drop 20%+, sleep <6h)
    if (recovery > 70) {
      return { recovery: 0.60, fuel: 0.20, mindspace: 0.15, performance: 0.05 };
    }

    // RED LINE 2: Metabolic crash (Glycogen <30% + Hydration <40%)
    if (fuel > 60) {
      return { fuel: 0.50, recovery: 0.25, mindspace: 0.15, performance: 0.10 };
    }

    // RED LINE 3: Severe neural drag (Stress 9/10, scattered focus)
    if (mindspace > 70 && recovery < 40 && fuel < 40) {
      return { mindspace: 0.55, recovery: 0.20, fuel: 0.15, performance: 0.10 };
    }

    // LOAD SPIKE: ACWR >1.5 combined with moderate recovery penalty
    if (performance > 50 && recovery > 30) {
      return { recovery: 0.40, fuel: 0.30, mindspace: 0.15, performance: 0.15 };
    }

    // BALANCED STATE: All systems nominal
    return { recovery: 0.35, fuel: 0.25, mindspace: 0.25, performance: 0.15 };
  }

  /**
   * PRIORITY MATH (V7 Logic)
   * Priority = (Urgency × 0.6) + (Enablement × 0.4)
   */
  public static calculatePriorityScore(urgency: number, enablement: number): number {
    return (urgency * 0.6) + (enablement * 0.4);
  }

  /**
   * ENABLEMENT SCORING (V7 Logic)
   * Measures how much an action unblocks the system.
   */
  public static getEnablementScore(actionType: string): number {
    switch (actionType) {
      case "fuel": return 70;           // Absorbs in 20min
      case "mindspace": return 80;      // Takes 2-5min
      case "recovery": return 50;       // Takes time
      case "performance": return 30;    // Coaching decision
      default: return 40;
    }
  }
}
