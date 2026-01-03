/**
 * NUTRITIONIST EXPERT - BARREL EXPORTS
 * 
 * Import everything from this index instead of individual files.
 */

// Main Expert
export { NutritionistExpert, nutritionistExpert } from "./NutritionistExpert";

// Engines & Logic (re-export from local copies)
export * from "./FuelCalculationEngine";
export { FuelActionEngine } from "./FuelActionEngine";
export { SessionFuelProtocolEngine } from "./SessionFuelProtocolEngine";
export { FuelWindowEngine } from "./FuelWindowEngine";
export { SupplementProtocolEngine } from "./SupplementProtocolEngine";
export * from "./goalFuelScience";
export * from "./goalFuelProtocols";
export { FuelEngine } from "./fuelEngine";

// Data
export * from "./foodDatabase";

// Types
export * from "./fuel";
