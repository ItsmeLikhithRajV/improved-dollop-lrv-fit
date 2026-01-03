
import { MentalStateVector, Session } from "../../../types";

export class ContextAwareGating {
  
  public static getAvailableProtocols(
    state: MentalStateVector,
    context: {
      time_until_event?: number; // minutes
      recent_test_result?: { grade: string, type: string, timestamp: number };
      sleep_hours?: number;
      fatigue_level?: number;
    }
  ): string[] {
    
    let available = ['box_breathing', 'super_ventilation', 'nsdr_lite', 'visualization', 'reaction', 'memory', 'focus'];
    const now = Date.now();

    // 1. Pre-Game Gating
    if (context.time_until_event !== undefined) {
      if (context.time_until_event < 20) {
        // 0-20 min: NO TESTING. Only activation/calming.
        available = available.filter(p => !['reaction', 'memory', 'focus', 'nsdr_lite'].includes(p));
      } else if (context.time_until_event < 60) {
        // 20-60 min: No memory (cognitive interference)
        available = available.filter(p => p !== 'memory');
      }
    }

    // 2. Post-Failure Gating
    if (context.recent_test_result) {
      const { grade, timestamp } = context.recent_test_result;
      const timeSince = (now - timestamp) / 1000 / 60; // mins
      
      if (grade === 'F' && timeSince < 5) {
        // Block retesting for 5 mins to prevent spiral
        available = available.filter(p => !['reaction', 'memory', 'focus'].includes(p));
      }
    }

    // 3. Sleep Deficit
    if (context.sleep_hours !== undefined && context.sleep_hours < 5) {
      // Severe sleep deficit: Cognitive tests unreliable
      available = available.filter(p => !['memory', 'focus'].includes(p));
    }

    // 4. Stress Gating
    if (state.stress > 9) {
      // Critical stress: Disable testing, force regulation
      available = available.filter(p => !['reaction', 'memory', 'focus', 'super_ventilation'].includes(p));
    }

    return available;
  }
}
