
import { 
    PCOSSubProfile, T1DSubProfile, Session, 
    UserProfile, FuelProtocol, ClinicalAction 
} from "../../../types";

// ============================================================================
// PCOS ENGINE (Elite V3)
// Logic: Low GI focus, Cycle Phase Gating, Inositol Ratios
// ============================================================================

export class PCOSEngine {
    
    static evaluate(
        pcos: PCOSSubProfile, 
        timeline: Session[],
        fuelEntries: any[]
    ): { protocol: FuelProtocol; action: ClinicalAction | null } {
        
        // 1. Determine Severity & Macros
        const ir_severity = pcos.homa_ir > 3.0 ? 'severe' : pcos.homa_ir > 2.0 ? 'moderate' : 'mild';
        const macros = this.getPCOSMacros(pcos.phenotype, ir_severity);
        
        // 2. Check for Luteal Phase HIIT Risk (Cortisol Spike)
        const nextSession = timeline.find(s => !s.completed && !s.is_interstitial);
        const isHIIT = nextSession?.intensity === 'high';
        
        if (isHIIT && pcos.current_phase === 'luteal') {
            return {
                protocol: {
                    name: "PCOS Luteal Cortisol Shield",
                    description: "Progesterone ↑ = Insulin Sensitivity ↓. High intensity triggers cortisol spike. Pre-fuel mandatory.",
                    color_theme: "purple",
                    timing_instruction: "30g Low-GI Carbs + 20g Protein 45m before",
                    macronutrient_focus: { carbs_g: 30, protein_g: 20, sodium_mg: 400, fluids_ml: 500 },
                    supplements: ["Magnesium", "Inositol"],
                    clinical_tag: "Hormone Defense",
                    suggested_sources: {
                        carbs: ["Oatmeal", "Berries", "Quinoa"],
                        protein: ["Whey", "Greek Yogurt"],
                        hydration: ["Water + Electrolytes"]
                    }
                },
                action: {
                    severity: 'warning',
                    title: "Luteal Phase + HIIT Warning",
                    description: "High intensity in luteal phase exacerbates hyperandrogenism via cortisol.",
                    immediate_actions: [
                        "Option A: Downgrade to Zone 2",
                        "Option B: Pre-fuel with 20g Protein + 30g Slow Carbs to buffer cortisol"
                    ],
                    educational_note: "PCOS ovaries hyper-respond to insulin & cortisol. Luteal phase is already insulin resistant."
                }
            };
        }

        // 3. Supplement Validation
        const supplementAction = this.validateSupplements(pcos);

        // 4. Standard Protocol
        return {
            protocol: this.getStandardProtocol(macros, ir_severity, pcos.current_phase),
            action: supplementAction
        };
    }

    private static getPCOSMacros(phenotype: string, ir_severity: string) {
        if (ir_severity === 'severe') {
            return { carbs_percent: 40, protein_percent: 30, fat_percent: 30 };
        } else if (ir_severity === 'moderate') {
            return { carbs_percent: 48, protein_percent: 25, fat_percent: 27 };
        }
        return { carbs_percent: 52, protein_percent: 20, fat_percent: 28 };
    }

    private static getStandardProtocol(macros: any, ir_severity: string, phase: string): FuelProtocol {
        const isLuteal = phase === 'luteal';
        return {
            name: ir_severity === 'severe' ? "Low-GI PCOS (Insulin-Resistant)" : "Low-GI PCOS (Standard)",
            description: `${macros.carbs_percent}% carbs (LOW GI), ${macros.protein_percent}% protein. ${isLuteal ? "Freq: 5-6 meals." : "Freq: 3-4 meals."}`,
            color_theme: "purple",
            timing_instruction: isLuteal ? "Eat every 3 hours (stabilize blood sugar)" : "Eat every 4 hours",
            macronutrient_focus: { carbs_g: 50, protein_g: 30, sodium_mg: 0, fluids_ml: 500 }, // Per meal approx
            supplements: ["Myo-Inositol (40:1)", "Vitamin D3"],
            clinical_tag: "Metabolic Restore",
            suggested_sources: {
                carbs: ["Lentils", "Chickpeas", "Sweet Potato", "Barley", "Steel-cut Oats"],
                protein: ["Salmon", "Chicken", "Tofu", "Eggs"],
                hydration: ["Green Tea", "Water"]
            }
        };
    }

    private static validateSupplements(pcos: PCOSSubProfile): ClinicalAction | null {
        if (!pcos.inositol_daily_mg || pcos.inositol_daily_mg < 2000) {
            return {
                severity: 'warning',
                title: "Inositol Undodose",
                description: "Therapeutic dose for PCOS is 2,000-4,000mg (40:1 ratio).",
                immediate_actions: ["Increase Myo-Inositol to 1g at breakfast, 1g at dinner."],
                educational_note: "Corrects the ovarian inositol deficiency (0.2:1 vs 100:1 normal), lowering LH and Testosterone."
            };
        }
        return null;
    }
}

// ============================================================================
// T1D ENGINE (Elite V3)
// Logic: Predictive Fueling, Insulin-on-board, Trend Arrows
// ============================================================================

export class T1DEngine {

    static evaluate(
        t1d: T1DSubProfile,
        timeline: Session[]
    ): { protocol: FuelProtocol; action: ClinicalAction | null } {
        
        const nextSession = timeline.find(s => !s.completed && !s.is_interstitial);
        
        // 1. Safety Check (No Exercise)
        if (!nextSession) {
            return {
                protocol: {
                    name: "T1D Maintenance",
                    description: "Focus on Time-in-Range (70-180 mg/dL).",
                    color_theme: "blue",
                    timing_instruction: "Standard Bolus Timing",
                    macronutrient_focus: { carbs_g: 60, protein_g: 30, sodium_mg: 0, fluids_ml: 0 },
                    supplements: [],
                    clinical_tag: "Euglycemia"
                },
                action: null
            };
        }

        // 2. Exercise Readiness Check
        const readiness = this.assessReadiness(t1d);
        if (readiness.status === 'HOLD') {
            return {
                protocol: {
                    name: "SAFETY HOLD",
                    description: "Metabolic state unsafe for exercise.",
                    color_theme: "red",
                    timing_instruction: "Immediate Action Required",
                    macronutrient_focus: { carbs_g: 15, protein_g: 0, sodium_mg: 0, fluids_ml: 250 },
                    supplements: [],
                    clinical_tag: "Critical"
                },
                action: {
                    severity: 'critical',
                    title: "EXERCISE CONTRAINDICATED",
                    description: readiness.reason,
                    immediate_actions: readiness.actions
                }
            };
        }

        // 3. Insulin & Fuel Adjustment
        const adjustment = this.calculateAdjustment(t1d, nextSession);
        
        return {
            protocol: {
                name: `T1D ${nextSession.activity_type?.toUpperCase() || 'AEROBIC'} Protocol`,
                description: adjustment.summary,
                color_theme: "blue",
                timing_instruction: "60 min Pre-Ex: Apply Insulin Reduction",
                macronutrient_focus: { 
                    carbs_g: adjustment.carbs, 
                    protein_g: 0, 
                    sodium_mg: 500, 
                    fluids_ml: 500 
                },
                supplements: [],
                clinical_tag: "Glucoregulation",
                suggested_sources: {
                    carbs: ["Sports Drink", "Glucose Tabs", "Banana", "Gels"],
                    protein: [],
                    hydration: ["Water + Electrolytes"]
                }
            },
            action: {
                severity: readiness.status === 'CAUTION' ? 'warning' : 'info',
                title: "Insulin Adjustment Required",
                description: adjustment.description,
                immediate_actions: adjustment.actions,
                educational_note: "Aerobic exercise increases insulin sensitivity & glucose uptake. Without reduction, hypoglycemia is likely."
            }
        };
    }

    private static assessReadiness(t1d: T1DSubProfile): { status: 'OK' | 'CAUTION' | 'HOLD', reason: string, actions: string[] } {
        const bg = t1d.current_glucose_mg_dl || 100;
        const trend = t1d.glucose_trend || 'flat';

        if (bg < 70) return { status: 'HOLD', reason: "Hypoglycemia (<70 mg/dL)", actions: ["Eat 15g fast carbs", "Wait 15m", "Retest"] };
        if (bg < 100 && trend.includes('falling')) return { status: 'HOLD', reason: "Dropping into Low", actions: ["Eat 15g carbs", "Monitor"] };
        if (bg > 250) return { status: 'HOLD', reason: "Hyperglycemia (>250 mg/dL)", actions: ["Check Ketones", "Hydrate", "Correct only if ketones negative"] };
        
        if (bg < 100) return { status: 'CAUTION', reason: "Low-Normal Start", actions: ["Eat 15g buffer carb"] };
        
        return { status: 'OK', reason: "Safe range", actions: [] };
    }

    private static calculateAdjustment(t1d: T1DSubProfile, session: Session) {
        const intensity = session.intensity;
        const type = session.activity_type || 'aerobic';
        const duration = session.duration_minutes || 60;

        let basalRed = 0;
        let carbRate = 0;

        if (type === 'aerobic') {
            basalRed = intensity === 'high' ? 50 : intensity === 'medium' ? 30 : 10;
            carbRate = intensity === 'high' ? 45 : intensity === 'medium' ? 30 : 10;
        } else if (type === 'anaerobic') {
            // Anaerobic can raise BG initially
            basalRed = 0; 
            carbRate = intensity === 'high' ? 15 : 0;
        } else {
            // Mixed
            basalRed = 20;
            carbRate = 25;
        }

        // Duration modifier
        if (duration > 90) basalRed += 10;

        return {
            summary: `Basal -${basalRed}% | Fuel ${carbRate}g/hr`,
            description: `Target ${basalRed}% basal reduction 60m before start. Fuel at ${carbRate}g carbs/hour during.`,
            carbs: 15, // Pre-ex buffer
            actions: [
                `Reduce Temp Basal by ${basalRed}%`,
                `Prepare ${carbRate}g carbs per hour of activity`,
                `Monitor CGM every 20 min`
            ]
        };
    }
}
