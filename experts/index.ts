/**
 * EXPERTS INDEX
 * 
 * Central registry of all unified experts.
 * Each expert is a coherent brain for their domain.
 */

// Types
export type {
    Expert,
    ExpertAnalysis,
    ExpertContext,
    HandoffData,
    ExpertRegistry,
    ExpertName
} from "./types";

export type { ActionCandidate as ExpertActionCandidate } from "./types";
export { createExpertContext } from "./types";

// All Experts
export { NutritionistExpert, nutritionistExpert } from "./nutritionist/NutritionistExpert";
export { RecoveryExpert, recoveryExpert } from "./recovery/RecoveryExpert";
export { LongevityExpert, longevityExpert } from "./longevity/LongevityExpert";
export { MentalExpert, mentalExpert } from "./mental/MentalExpert";
export { PerformanceExpert, performanceExpert } from "./performance/PerformanceExpert";
export { DoctorExpert, doctorExpert } from "./doctor/DoctorExpert";

// Expert Council - the orchestrator
export { ExpertCouncil, expertCouncil } from "./orchestrator/ExpertCouncil";
export type { CouncilRecommendation, UnifiedTimeline } from "./orchestrator/ExpertCouncil";
