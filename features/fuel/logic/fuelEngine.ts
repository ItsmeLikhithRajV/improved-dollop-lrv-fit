
import { FuelState, FuelProtocol, FuelViewModel, FuelContextType, ProgressBarVM, FuelProtocolVM, ClinicalAction, NutritionalPeriodization, NutrientBioavailabilityProfile, MicronutrientStatus } from "../types";
import { UserProfile, Session, MedicalState, MindspaceState } from "../../../types";
import { FOOD_DATABASE } from "./foodMatrix";
import { PCOSEngine, T1DEngine } from "./clinicalEngines";
import { PeriodizationEngine } from "./periodizationEngine";
import { BioavailabilityEngine } from "./bioavailabilityEngine";
import { GeneticEngine } from "./geneticEngine";

export class FuelEngine {

    // ========================================================
    // MAIN EVALUATOR
    // ========================================================
    public static evaluate(
        fuel: FuelState, 
        profile: UserProfile, 
        medical: MedicalState,
        timeline: Session[],
        acwr: number,
        mindspace?: MindspaceState
    ) {
        
        // 1. Calculate Score (Standard)
        const scoreResult = this.calculateScore(fuel, profile);
        
        // 2. Determine Context
        const temporal = this.determineTemporalContext(timeline);
        
        // 3. CLINICAL ROUTING
        let activeProtocol: FuelProtocol | null = null;
        let clinicalAction: ClinicalAction | null = null;
        let clinicalMod = { veto: false, reason: null as string | null, overrideAction: null as string | null };

        if (profile.clinical?.conditions.includes('pcos') && profile.pcos_profile) {
            const pcosResult = PCOSEngine.evaluate(profile.pcos_profile, timeline, fuel.entries);
            activeProtocol = pcosResult.protocol;
            clinicalAction = pcosResult.action;
        } 
        else if (profile.clinical?.conditions.includes('t1d') && profile.t1d_profile) {
            const t1dResult = T1DEngine.evaluate(profile.t1d_profile, timeline);
            activeProtocol = t1dResult.protocol;
            clinicalAction = t1dResult.action;
            
            if (t1dResult.action?.severity === 'critical') {
                clinicalMod.veto = true;
                clinicalMod.reason = t1dResult.action.description;
            }
        } 
        else {
            clinicalMod = this.checkClinicalModifiers(profile, medical, timeline, fuel);
            activeProtocol = this.selectProtocol(temporal, clinicalMod, profile, timeline, acwr);
        }

        // 4. GAP 1: PERIODIZATION LOGIC
        const block = acwr > 1.3 ? 'intensification' : acwr < 0.8 ? 'deload' : 'accumulation';
        const periodization: NutritionalPeriodization | undefined = PeriodizationEngine.calculateSessionCarbs(
            profile,
            temporal.nextSession,
            { block, volume_hours: 8, days_until_competition: 90 }
        );

        // 5. NEURAL MODIFIERS (Brain-Fuel Link)
        if (mindspace && activeProtocol) {
            this.applyNeuralMetabolicLogic(activeProtocol, mindspace, periodization);
        }

        // 6. GAP 3: GENETIC OVERLAY
        let geneticRationale = "";
        if (profile.genetic_profile) {
            const geneRecs = GeneticEngine.deriveNutrientRecommendations(profile.genetic_profile, profile, temporal.nextSession);
            geneticRationale = geneRecs.rationale;
            if (periodization) {
                periodization.carbs_per_kg_body_weight = geneRecs.carbs_per_kg_adjusted;
                periodization.protein_per_kg = geneRecs.protein_per_kg_adjusted;
            }
        }

        // 7. GAP 2: BIOAVAILABILITY
        const bio: NutrientBioavailabilityProfile = BioavailabilityEngine.assessAthleteMicrobiota(
            profile,
            temporal.nextSession?.intensity || 'medium',
            8,
            fuel.entries
        );

        // 8. GAP 9: MICRONUTRIENTS
        const micros: MicronutrientStatus[] = [
            { name: "Iron", current: 12, target: 18, unit: "mg", status: "low", food_sources: ["Spinach + Lemon", "Liver", "Lentils"] },
            { name: "Vitamin D", current: 800, target: 2000, unit: "IU", status: "deficient", food_sources: ["Salmon", "Supplement"] },
            { name: "Magnesium", current: 340, target: 350, unit: "mg", status: "optimal", food_sources: ["Pumpkin Seeds"] }
        ];

        // 9. Generate Food Suggestions
        if (activeProtocol && !activeProtocol.suggested_sources) {
            activeProtocol.suggested_sources = this.getOptimalSources(
                activeProtocol.macronutrient_focus,
                profile,
                temporal.contextType === 'immediate_prime',
                mindspace
            );
        }

        // 10. Tank Math
        const tankLevel = this.calculateGlycogenTank(fuel, timeline, profile.weight);

        // 11. Build View Model
        const viewModel = this.buildViewModel(
            scoreResult.score, 
            tankLevel, 
            temporal, 
            fuel, 
            activeProtocol, 
            clinicalMod,
            clinicalAction?.description || scoreResult.action,
            periodization,
            bio,
            micros,
            geneticRationale
        );

        return {
            score: scoreResult.score,
            action: clinicalAction, 
            activeProtocol,
            viewModel,
            penalty: scoreResult.penalty,
            reasons: scoreResult.reasons
        };
    }

    /**
     * Integrates MindSpace scores into Fuel protocols.
     */
    private static applyNeuralMetabolicLogic(protocol: FuelProtocol, mindspace: MindspaceState, periodization?: NutritionalPeriodization) {
        // CORTISOL GATING: Stress > 7
        if (mindspace.stress > 7) {
            protocol.name = `[Neural Shield] ${protocol.name}`;
            protocol.description = `[STRESS GATE] High cortisol detected. ${protocol.description}`;
            protocol.supplements = [...(protocol.supplements || []), "Magnesium Glycinate (400mg)", "Vitamin C (1g)"];
            // Remove stimulants
            protocol.supplements = protocol.supplements.filter(s => !s.toLowerCase().includes('caffeine') && !s.toLowerCase().includes('stimulant'));
            
            if (periodization) {
                periodization.gi_target = 'low'; // Shift to Low GI to stabilize insulin/cortisol
                periodization.rationale = `[Neural Override]: Slow CHO release prioritized to mitigate stress-induced glycemic volatility. ${periodization.rationale}`;
            }
        }

        // NEURO-PRECURSOR LOADING: Mood < 4
        if (mindspace.mood < 4) {
            protocol.description = `[Mood Support] Low affect detected. Increasing neuro-precursor co-factors. ${protocol.description}`;
            protocol.supplements = [...(protocol.supplements || []), "Omega-3 (High EPA)", "5-HTP (if permitted)"];
        }
    }

    private static calculateScore(fuel: FuelState, profile: UserProfile) {
        let penalty = 0;
        let score = Number(fuel.fuel_score);
        const reasons: string[] = [];
        let action = null;

        const minHydration = profile.weight * 0.035;
        if (fuel.hydration_liters < minHydration) {
            penalty = Math.max(penalty, 30);
            score -= 15;
            action = `Hydrate: Need ${minHydration.toFixed(1)}L total.`;
            reasons.push("Performance Impairment Risk (Dehydrated).");
        }

        if (fuel.entries.length === 0) {
            const currentHour = new Date().getHours();
            if (currentHour > 11) {
                penalty = Math.max(penalty, 20);
                score -= 10;
                action = action || "Catabolic Risk. Intake Fuel.";
                reasons.push("Fasted state prolonged.");
            }
        }

        return { score: Math.max(0, Math.min(100, score)), penalty, reasons, action };
    }

    private static checkClinicalModifiers(profile: UserProfile, medical: MedicalState, timeline: Session[], fuel: FuelState) {
        const conditions = profile.clinical?.conditions || [];
        let veto = false;
        let reason = null;
        let overrideAction = null;

        if (conditions.includes('t1d') && !profile.t1d_profile) {
            const bg = medical.glucose_mgdl || 100;
            if (bg > 250) {
                veto = true;
                reason = "Hyperglycemia.";
            }
        }

        return { veto, reason, overrideAction, conditions };
    }

    private static determineTemporalContext(sessions: Session[]): { contextType: FuelContextType, nextSession: Session | null, timeToNext: number } {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        
        const active = sessions.filter(s => !s.completed && !s.is_interstitial);
        let nextSession = null;
        let minDiff = Infinity;

        for (const s of active) {
            if (!s.time_of_day) continue;
            const [h, m] = s.time_of_day.split(':').map(Number);
            const sMins = h * 60 + m;
            const diff = sMins - currentMinutes;
            if (diff > 0 && diff < minDiff) {
                minDiff = diff;
                nextSession = s;
            }
        }
        
        let contextType: FuelContextType = 'idle';
        if (nextSession) {
            if (minDiff <= 60) contextType = 'immediate_prime'; 
            else if (minDiff <= 240) contextType = 'pre_load';
        } else {
            if (sessions.some(s => s.completed)) contextType = 'post_recovery'; 
        }

        return { contextType, nextSession, timeToNext: minDiff };
    }

    private static selectProtocol(
        temporal: { contextType: FuelContextType, nextSession: Session | null, timeToNext: number },
        clinical: any,
        profile: UserProfile,
        timeline: Session[],
        acwr: number
    ): FuelProtocol | null {
        
        const isSaltySweater = profile.salty_sweater;
        const isGutSensitive = profile.gut_sensitivity === 'high';

        if (temporal.contextType === 'immediate_prime' && temporal.nextSession) {
            const isLiquidPreferred = isGutSensitive || temporal.timeToNext < 30;
            return {
                name: isLiquidPreferred ? "Liquid Fuel Injection" : "High-Octane Primer",
                description: isLiquidPreferred ? "Fast gastric emptying required." : "Fast-acting glycogen top-up.",
                color_theme: isGutSensitive ? "blue" : "red",
                timing_instruction: "Consume immediately",
                clinical_tag: isGutSensitive ? "Gut Guard" : null,
                macronutrient_focus: { 
                    carbs_g: 45, 
                    protein_g: 0, 
                    sodium_mg: isSaltySweater ? 1000 : 500, 
                    fluids_ml: 500 
                },
                supplements: ["Caffeine", "Nitrates"]
            };
        }

        if (temporal.contextType === 'post_recovery') {
            const isHighLoad = acwr > 1.3;
            return {
                name: isHighLoad ? "Hyper-Restoration" : "Anabolic Window",
                description: isHighLoad ? "Aggressive load buffering." : "Replenish glycogen & initiate repair.",
                color_theme: "green",
                timing_instruction: "Within 60m of finish",
                macronutrient_focus: { 
                    carbs_g: isHighLoad ? 80 : 60, 
                    protein_g: 30, 
                    sodium_mg: isSaltySweater ? 1200 : 800, 
                    fluids_ml: 750 
                },
                supplements: ["Whey Isolate", "Creatine"]
            };
        }

        if (temporal.contextType === 'pre_load') {
            return {
                name: "Loading Phase",
                description: "Slow release energy.",
                color_theme: "blue",
                timing_instruction: "Meal 3-4h Pre-Session",
                macronutrient_focus: { carbs_g: 80, protein_g: 40, sodium_mg: 600, fluids_ml: 500 },
                supplements: []
            };
        }

        return null;
    }

    private static getOptimalSources(
        macros: { carbs_g: number, protein_g: number }, 
        profile: UserProfile,
        needFastActing: boolean,
        mindspace?: MindspaceState
    ) {
        const allergies = profile.allergies || [];
        const isGutSensitive = profile.gut_sensitivity === 'high';
        
        const suggestions = { carbs: [] as string[], protein: [] as string[], hydration: [] as string[] };

        const isSafe = (item: any) => {
            if (allergies.includes('gluten') && item.tags.includes('gluten')) return false;
            if (allergies.includes('dairy') && item.tags.includes('dairy')) return false;
            if (allergies.includes('nuts') && item.tags.includes('nuts')) return false;
            if (isGutSensitive && item.tags.includes('high_fodmap')) return false;
            return true;
        };

        // Mood-based priority logic (Neuro-Precursor Loading)
        const moodMod = mindspace?.mood && mindspace.mood < 4;

        FOOD_DATABASE.forEach(item => {
            if (!isSafe(item)) return;
            
            // Influence based on mood
            if (moodMod) {
                if (item.tags.includes('omega3') || item.tags.includes('probiotic')) {
                    suggestions.protein.push(`[Mood Boost] ${item.name}`);
                }
            }

            if (needFastActing && item.tags.includes('quick_carb')) suggestions.carbs.push(item.name);
            else if (!needFastActing && item.tags.includes('complex_carb')) suggestions.carbs.push(item.name);
        });

        FOOD_DATABASE.forEach(item => {
            if (!isSafe(item)) return;
            if (item.tags.includes('protein')) suggestions.protein.push(item.name);
        });

        FOOD_DATABASE.forEach(item => {
            if (!isSafe(item)) return;
            if (item.tags.includes('hydration')) suggestions.hydration.push(item.name);
        });

        if (suggestions.carbs.length === 0) suggestions.carbs.push("Rice (Safe fallback)");
        if (suggestions.protein.length === 0) suggestions.protein.push("Chicken/Tofu (Safe fallback)");

        suggestions.carbs = suggestions.carbs.slice(0, 4);
        suggestions.protein = suggestions.protein.slice(0, 4);
        suggestions.hydration = suggestions.hydration.slice(0, 2);

        return suggestions;
    }

    private static calculateGlycogenTank(fuel: FuelState, sessions: Session[], weight: number): number {
        const maxCapacity = weight * 6; 
        let current = maxCapacity * 0.8; 

        const now = new Date();
        const awakeHours = Math.max(0, now.getHours() - 7);
        current -= (awakeHours * 5);

        const intake = fuel.entries.reduce((acc, m) => acc + m.items.reduce((a,b) => a + b.macros.carbs || 0, 0), 0);
        current += intake;

        const completed = sessions.filter(s => s.completed);
        completed.forEach(s => {
            const dur = s.duration_minutes || 60;
            const rate = s.intensity === 'high' ? 1.5 : s.intensity === 'medium' ? 1.0 : 0.5;
            current -= (dur * rate);
        });

        const pct = Math.max(0, Math.min(100, (current / maxCapacity) * 100));
        return Math.round(pct);
    }

    private static buildViewModel(
        score: number, 
        tankLevel: number, 
        temporal: any, 
        fuel: FuelState, 
        protocol: FuelProtocol | null, 
        clinical: any,
        action: string | null,
        periodization?: NutritionalPeriodization,
        bio?: NutrientBioavailabilityProfile,
        micros?: MicronutrientStatus[],
        genetic_rationale?: string
    ): FuelViewModel {
        
        let protocolVM: FuelProtocolVM | null = null;
        
        if (protocol) {
            const targets = protocol.macronutrient_focus;
            const themes: Record<string, string> = {
                red: "border-red-500/50 bg-red-500/10 text-red-100",
                blue: "border-blue-500/50 bg-blue-500/10 text-blue-100",
                purple: "border-purple-500/50 bg-purple-500/10 text-purple-100",
                green: "border-green-500/50 bg-green-500/10 text-green-100"
            };
            
            const bars: ProgressBarVM[] = [
                {
                    label: "Carbohydrates",
                    current: fuel.macros_today.carbs,
                    target: targets.carbs_g,
                    unit: "g",
                    percent: Math.min(100, (fuel.macros_today.carbs / (targets.carbs_g || 1)) * 100),
                    colorClass: protocol.color_theme === 'red' ? 'bg-red-400' : 'bg-orange-400'
                },
                {
                    label: "Protein",
                    current: fuel.macros_today.protein,
                    target: targets.protein_g,
                    unit: "g",
                    percent: Math.min(100, (fuel.macros_today.protein / (targets.protein_g || 1)) * 100),
                    colorClass: "bg-blue-400"
                }
            ];

            protocolVM = {
                name: protocol.name,
                description: protocol.description,
                themeClass: themes[protocol.color_theme] || themes.green,
                clinicalTag: protocol.clinical_tag || null,
                timing: protocol.timing_instruction,
                bars,
                suggestedSources: protocol.suggested_sources
            };
        }

        return {
            status: {
                label: score > 70 ? 'Optimal' : score > 40 ? 'Moderate' : 'Low',
                color: score > 70 ? "hsl(140, 70%, 50%)" : score > 40 ? "hsl(45, 100%, 55%)" : "hsl(0, 80%, 60%)",
                score
            },
            tank: {
                level: tankLevel,
                label: tankLevel < 30 ? "Bonk Risk" : tankLevel > 90 ? "Full" : "Optimal",
                drainRate: 1
            },
            context: {
                type: temporal.contextType,
                message: action || "Maintain hydration.",
                nextSessionCountdown: temporal.nextSession ? `${temporal.nextSession.title} in ${Math.round(temporal.timeToNext)}m` : undefined,
                suggestedMacros: protocol ? {
                    c: protocol.macronutrient_focus.carbs_g,
                    p: protocol.macronutrient_focus.protein_g,
                    f: 0,
                    sodium: protocol.macronutrient_focus.sodium_mg
                } : undefined
            },
            hydration: {
                value: fuel.hydration_liters,
                percentage: Math.min(100, (fuel.hydration_liters / 4) * 100),
                label: fuel.hydration_liters < 1.0 ? "Dehydrated" : fuel.hydration_liters < 2.5 ? "Optimal" : "Excess",
                colorClass: fuel.hydration_liters < 1.0 ? "text-red-400" : fuel.hydration_liters < 3.0 ? "text-blue-400" : "text-yellow-400"
            },
            protocol: protocolVM,
            veto: clinical.veto ? {
                active: true,
                title: "Clinical Hold",
                message: clinical.reason || "Clinical contraindication active."
            } : null,
            actionRequired: action,
            periodization,
            bioavailability: bio,
            micronutrients: micros,
            genetic_rationale: genetic_rationale
        };
    }
}
