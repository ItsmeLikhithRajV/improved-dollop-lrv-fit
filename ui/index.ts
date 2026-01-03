/**
 * UI SYSTEM - BARREL EXPORTS
 * The unified export point for all UI components.
 * Organized by category for clarity.
 */

// =====================================================
// CORE PRIMITIVES
// =====================================================
export { GlassCard, Button, cn } from './core/primitives';

// =====================================================
// AMBIENT (Background & Orbs)
// =====================================================
export { NebulaBackground, deriveNebulaState } from './ambient/NebulaBackground';
export type { NebulaState } from './ambient/NebulaBackground';
export { SentientOrb, deriveOrbState } from './ambient/SentientOrb';

// =====================================================
// VISUALIZATIONS (Data → Visual Metaphors)
// =====================================================
export { FuelTank } from './visualizations/FuelTank';
export { AutonomicGyro } from './visualizations/AutonomicGyro';
export { SleepDebtHourglass } from './visualizations/SleepDebtHourglass';

// =====================================================
// HUD (Heads-Up Display Components)
// =====================================================
export { MissionControl } from './hud/MissionControl';
export { ExpertFeedCard } from './hud/ExpertFeedCard';
export type { ExpertId } from './hud/ExpertFeedCard';
export { QuantumStatsRow } from './hud/QuantumStatsRow';
export type { QuantumStat } from './hud/QuantumStatsRow';

// =====================================================
// LEGACY (Existing components - migrate gradually)
// =====================================================
export { TrendChart } from '../components/TrendChart';
export { WeeklyReportCard } from '../components/WeeklyReportCard';
export { SentientInsightsCard } from '../components/SentientInsightsCard';
export { LearningInsightsCard } from '../components/LearningInsightsCard';
export { NotificationSystem } from '../components/NotificationSystem';

// =====================================================
// SHARED COMPONENTS (New unified design system)
// =====================================================
export { HeroMetricCard } from './shared/HeroMetricCard';
export { TrendSparkline } from './shared/TrendSparkline';
export { QuickStatsRow } from './shared/QuickStatsRow';
export { ThresholdGauge } from './shared/ThresholdGauge';
export { ExpertInsightCard } from './shared/ExpertInsightCard';
