/**
 * ORCHESTRATOR - BARREL EXPORTS
 */

// Main Orchestrator
export { ExpertCouncil, expertCouncil } from "./ExpertCouncil";
export type { CouncilRecommendation, UnifiedTimeline } from "./ExpertCouncil";

// Legacy orchestrators (for backward compatibility)
export * from "./SentientOrchestrator";
export * from "./orchestratorV7";
export * from "./SentientEventOrchestrator";
export * from "./sentientLocalOrchestrator";

// Intelligence engines
export * from "./AdaptiveIntelligenceEngine";
export * from "./PatternDiscoveryEngine";
export * from "./learningEngine";
export * from "./suggestionEngine";
export * from "./goalAwareHooks";
