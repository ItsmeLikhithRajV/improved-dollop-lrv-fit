/**
 * Protocol Type System
 * 
 * Uses discriminated union pattern for type-safe protocol handling.
 * - BaseProtocol: Shared foundation for all protocols
 * - RichProtocol: Full display cards with science context
 * - AdaptiveProtocol: Lightweight scheduling protocols
 * - TimelineProtocol: Union type for timeline rendering
 */

import { SleepHygieneStack } from '../../features/sleep/types';

export type { SleepHygieneStack };

// ═══════════════════════════════════════════════════════════════════════════
// BASE PROTOCOL - Shared foundation for all protocol types
// ═══════════════════════════════════════════════════════════════════════════
export interface BaseProtocol {
  id: string;
  title: string;
  time_of_day: string;           // "08:00"
  duration_minutes: number;
  category: 'fuel' | 'sleep' | 'mindspace' | 'training' | 'recovery';
}

// ═══════════════════════════════════════════════════════════════════════════
// RICH PROTOCOL - Full display cards with science context
// ═══════════════════════════════════════════════════════════════════════════
export interface RichProtocol extends BaseProtocol {
  variant: 'rich';
  priority: 'critical' | 'high' | 'medium';
  icon: string;
  description: string;

  rationale: {
    primary_reason: string;
    supporting_signals: string[];
    science_brief: string;
    impact_summary: string;
  };

  longevity_focus: string;
  tailoring_reason: string;

  specifics: {
    fuel?: { macros: { carbs: number; protein: number }; suggestions: string[] };
    sleep?: { bedtime: string; hygiene_stack?: SleepHygieneStack };
    mindspace?: { breathing_pattern: string };
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ADAPTIVE PROTOCOL - Lightweight scheduling protocols
// ═══════════════════════════════════════════════════════════════════════════
export interface AdaptiveProtocol extends BaseProtocol {
  variant: 'adaptive';
  priority: 'adaptive';
  is_flexible: boolean;
  dependsOn: 'session' | 'wake' | 'bedtime' | 'independent';
  rationale: string;             // Simple string explanation
  originalReason: string;        // Why this was scheduled
}

// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE PROTOCOL - Union type for timeline rendering
// ═══════════════════════════════════════════════════════════════════════════
export type TimelineProtocol = RichProtocol | AdaptiveProtocol;

// ═══════════════════════════════════════════════════════════════════════════
// TYPE GUARDS - For safe type narrowing
// ═══════════════════════════════════════════════════════════════════════════
export const isRichProtocol = (p: TimelineProtocol): p is RichProtocol =>
  p.variant === 'rich';

export const isAdaptiveProtocol = (p: TimelineProtocol): p is AdaptiveProtocol =>
  p.variant === 'adaptive';

// ═══════════════════════════════════════════════════════════════════════════
// FEEDBACK - For protocol completion tracking
// ═══════════════════════════════════════════════════════════════════════════
export interface ProtocolFeedback {
  protocol_id: string;
  completed: boolean;
  timestamp: string;
  perceived_impact: number;      // 1-10
  notes?: string;
}