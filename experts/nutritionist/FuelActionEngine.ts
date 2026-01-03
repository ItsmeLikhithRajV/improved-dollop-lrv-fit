/**
 * FuelActionEngine
 * 
 * Generates specific, actionable fuel recommendations based on:
 * - Calculated macro targets (from FuelCalculationEngine)
 * - Current intake (logged meals)
 * - Time of day context
 * - User allergies and diet preferences
 * - Upcoming/past training sessions
 * - User's meal history patterns
 * 
 * Outputs specific food suggestions, not generic "eat more protein"
 */

import {
    FOOD_DATABASE,
    FoodItem,
    filterByDiet,
    getFoodsByMacro,
    getFoodsByTiming,
    calculateServingsNeeded,
    DietType,
    Allergen,
    MealTiming
} from './foodDatabase';
import { GlobalState, UserProfile, Session } from '../../types';
import { calculateFuelTargets, FuelTargets } from './FuelCalculationEngine';
import { BodyComposition } from '../../types/body';

// =====================================================
// INTERFACES
// =====================================================

export interface FuelAction {
    // For Orchestrator ranking
    urgency: 'critical' | 'high' | 'medium' | 'low' | 'none';
    urgency_score: number;  // 0-100 for Orchestrator math

    // Time-aware context
    context: FuelContext;

    // Primary deficit (the main thing to address)
    primary_deficit: {
        macro: 'protein' | 'carbs' | 'fat' | 'calories' | 'hydration' | 'none';
        amount_g: number;
        percentage_of_target: number;  // How much of daily target is missing
    };

    // All deficits
    deficits: {
        protein_g: number;
        carbs_g: number;
        fat_g: number;
        calories: number;
    };

    // Category suggestion
    category: FuelCategory;

    // Specific food suggestions (THE KEY)
    suggestions: FoodSuggestion[];

    // Human-readable messages
    headline: string;
    subtext: string;

    // If it's too late in the day
    tomorrow_tip?: string;

    // Scientific timing info
    timing_window?: {
        name: string;
        reason: string;
        science: string;
    };
}

export type FuelContext =
    | 'morning_start'       // First meal window
    | 'pre_workout'         // 1-2h before session
    | 'intra_workout'       // During session (for long sessions)
    | 'post_workout'        // 0-45min after (anabolic window)
    | 'afternoon'           // Normal afternoon
    | 'evening_catchup'     // After 6pm with significant deficit
    | 'before_bed'          // Last eating window
    | 'on_track';           // No action needed

export type FuelCategory =
    | 'high_protein'
    | 'fast_carbs'
    | 'complex_carbs'
    | 'balanced'
    | 'recovery_shake'
    | 'light_snack'
    | 'hydration'
    | 'none';

export interface FoodSuggestion {
    foods: string[];           // Food names
    food_ids: string[];        // For looking up details
    emojis: string;            // Visual
    covers: string;            // "Covers ~42g protein"
    total_macros: {
        protein_g: number;
        carbs_g: number;
        fat_g: number;
        calories: number;
    };
    prep_time: 'instant' | 'quick' | 'cook';
}

// =====================================================
// TIMING WINDOWS (Science-Based)
// =====================================================

export const TIMING_WINDOWS = {
    post_workout: {
        name: 'Anabolic Window',
        duration_minutes: 45,
        reason: 'Muscle protein synthesis peaks 0-45min post-exercise',
        science: 'Nutrient timing for MPS per Schoenfeld et al. 2013',
        priority: 'protein'
    },
    pre_workout: {
        name: 'Fuel Loading',
        duration_minutes: 120,  // 2h before
        reason: 'Glycogen availability for performance',
        science: 'Pre-exercise carb intake per Burke et al. 2011',
        priority: 'carbs'
    },
    pre_bed: {
        name: 'Overnight Recovery',
        window_hours_before_bed: 2,
        reason: 'Casein/slow protein supports overnight MPS',
        science: 'Pre-sleep protein per Trommelen & van Loon 2016',
        priority: 'slow_protein'
    },
    morning: {
        name: 'Break the Fast',
        window_hours_after_wake: 2,
        reason: 'End catabolic state, kickstart metabolism',
        science: 'Protein distribution per Mamerow et al. 2014',
        priority: 'protein'
    }
};

// =====================================================
// URGENCY THRESHOLDS
// =====================================================

const URGENCY_THRESHOLDS = {
    // Critical: Immediate intervention needed
    critical: {
        deficit_percentage: 80,  // 80%+ of target still missing
        after_hour: 19,          // After 7pm
        or_pre_workout_carbs_low: true
    },
    // High: Should address soon
    high: {
        deficit_percentage: 50,
        after_hour: 17
    },
    // Medium: Address when convenient
    medium: {
        deficit_percentage: 30,
        after_hour: 14
    }
};

// =====================================================
// MAIN ENGINE
// =====================================================

export class FuelActionEngine {
    private foods: FoodItem[];
    private userHistory: any[];  // Logged meals for pattern learning

    constructor(
        private state: GlobalState,
        private currentTime: Date = new Date()
    ) {
        // Filter foods by user's diet and allergies
        const profile = state.user_profile;
        const dietType = (profile?.diet_type || 'omnivore') as DietType;
        const allergies = (profile?.allergies || []) as Allergen[];

        this.foods = filterByDiet(FOOD_DATABASE, dietType, allergies);
        this.userHistory = state.fuel?.entries || [];
    }

    /**
     * Main evaluation method
     */
    public evaluate(): FuelAction {
        const hour = this.currentTime.getHours();

        // 1. Calculate targets and current intake
        const targets = this.getTargets();
        const intake = this.getCurrentIntake();

        // 2. Calculate deficits
        const deficits = {
            protein_g: Math.max(0, targets.macros.protein_g - intake.protein),
            carbs_g: Math.max(0, targets.macros.carbs_g - intake.carbs),
            fat_g: Math.max(0, targets.macros.fat_g - intake.fat),
            calories: Math.max(0, targets.tdee - intake.calories)
        };

        // 3. Determine primary deficit
        const primaryDeficit = this.determinePrimaryDeficit(deficits, targets);

        // 4. Determine context
        const context = this.determineContext(hour, deficits, targets);

        // 5. If all good, return "on track"
        if (primaryDeficit.macro === 'none') {
            return this.createOnTrackAction(context, deficits);
        }

        // 6. Determine urgency
        const urgency = this.calculateUrgency(primaryDeficit, hour, context);

        // 7. Determine category and get suggestions
        const category = this.determineCategory(primaryDeficit, context);
        const suggestions = this.generateSuggestions(primaryDeficit, context, category);

        // 8. Generate messages
        const messages = this.generateMessages(primaryDeficit, context, hour);

        // 9. Check for timing windows
        const timingWindow = this.getActiveTimingWindow(context);

        return {
            urgency: urgency.level,
            urgency_score: urgency.score,
            context,
            primary_deficit: primaryDeficit,
            deficits,
            category,
            suggestions,
            headline: messages.headline,
            subtext: messages.subtext,
            tomorrow_tip: messages.tomorrow_tip,
            timing_window: timingWindow
        };
    }

    // =====================================================
    // PRIVATE METHODS
    // =====================================================

    private getTargets(): FuelTargets {
        const profile = this.state.user_profile;
        const bodyComp: BodyComposition = profile?.body_composition || {
            height_cm: 175,
            weight_kg: 70,
            age: 28,
            gender: 'male',
            data_source: 'manual',
            last_updated: new Date().toISOString()
        };

        return calculateFuelTargets({
            body: bodyComp,
            physicalLoad: this.state.physical_load,
            goalType: (profile?.user_goal?.primary || 'athletic_performance') as any
        });
    }

    private getCurrentIntake(): { protein: number; carbs: number; fat: number; calories: number } {
        const entries = this.state.fuel?.entries || [];
        const today = new Date().toDateString();

        const todayEntries = entries.filter((e: any) => {
            const entryDate = new Date(e.logged_at || e.time).toDateString();
            return entryDate === today;
        });

        return todayEntries.reduce((acc: any, meal: any) => {
            const items = meal.items || [];
            items.forEach((item: any) => {
                acc.protein += item.macros?.protein || 0;
                acc.carbs += item.macros?.carbs || 0;
                acc.fat += item.macros?.fat || 0;
                acc.calories += item.calories ||
                    (item.macros?.protein || 0) * 4 +
                    (item.macros?.carbs || 0) * 4 +
                    (item.macros?.fat || 0) * 9;
            });
            return acc;
        }, { protein: 0, carbs: 0, fat: 0, calories: 0 });
    }

    private determinePrimaryDeficit(
        deficits: { protein_g: number; carbs_g: number; fat_g: number; calories: number },
        targets: FuelTargets
    ): FuelAction['primary_deficit'] {
        // Calculate percentage of target remaining
        const proteinPct = (deficits.protein_g / targets.macros.protein_g) * 100;
        const carbsPct = (deficits.carbs_g / targets.macros.carbs_g) * 100;
        const fatPct = (deficits.fat_g / targets.macros.fat_g) * 100;

        // Threshold for "no action needed" - less than 15% remaining
        const threshold = 15;

        if (proteinPct < threshold && carbsPct < threshold && fatPct < threshold) {
            return { macro: 'none', amount_g: 0, percentage_of_target: 0 };
        }

        // Find biggest relative deficit
        const deficitMap = [
            { macro: 'protein' as const, amount: deficits.protein_g, pct: proteinPct },
            { macro: 'carbs' as const, amount: deficits.carbs_g, pct: carbsPct },
            { macro: 'fat' as const, amount: deficits.fat_g, pct: fatPct }
        ];

        // Sort by percentage (biggest gap first)
        deficitMap.sort((a, b) => b.pct - a.pct);
        const primary = deficitMap[0];

        return {
            macro: primary.macro,
            amount_g: Math.round(primary.amount),
            percentage_of_target: Math.round(primary.pct)
        };
    }

    private determineContext(
        hour: number,
        deficits: { protein_g: number; carbs_g: number; fat_g: number },
        targets: FuelTargets
    ): FuelContext {
        const sessions = this.state.timeline?.sessions || [];
        const now = this.currentTime;

        // Check for upcoming session within 2 hours
        const upcomingSession = sessions.find((s: Session) => {
            if (s.completed || !s.time_of_day) return false;
            const [h, m] = s.time_of_day.split(':').map(Number);
            const sessionTime = new Date(now);
            sessionTime.setHours(h, m, 0, 0);
            const diffMinutes = (sessionTime.getTime() - now.getTime()) / 60000;
            return diffMinutes > 0 && diffMinutes <= 120;
        });

        if (upcomingSession) return 'pre_workout';

        // Check for just-finished session (within 45 min)
        const recentSession = sessions.find((s: Session) => {
            if (!s.completed || !s.time_of_day) return false;
            const [h, m] = s.time_of_day.split(':').map(Number);
            const sessionTime = new Date(now);
            sessionTime.setHours(h, m, 0, 0);
            // Add estimated duration
            const endTime = new Date(sessionTime.getTime() + (s.duration_minutes || 60) * 60000);
            const diffMinutes = (now.getTime() - endTime.getTime()) / 60000;
            return diffMinutes >= 0 && diffMinutes <= 45;
        });

        if (recentSession) return 'post_workout';

        // Check total deficit percentage
        const totalDeficit = (deficits.protein_g / targets.macros.protein_g) +
            (deficits.carbs_g / targets.macros.carbs_g) +
            (deficits.fat_g / targets.macros.fat_g);
        const avgDeficitPct = (totalDeficit / 3) * 100;

        // Time-based context
        if (hour < 10) return 'morning_start';
        if (hour >= 21) return 'before_bed';
        if (hour >= 18 && avgDeficitPct > 30) return 'evening_catchup';
        if (avgDeficitPct < 15) return 'on_track';

        return 'afternoon';
    }

    private calculateUrgency(
        deficit: FuelAction['primary_deficit'],
        hour: number,
        context: FuelContext
    ): { level: FuelAction['urgency']; score: number } {
        if (deficit.macro === 'none') {
            return { level: 'none', score: 0 };
        }

        const pct = deficit.percentage_of_target;

        // Post-workout is always high priority if protein deficit
        if (context === 'post_workout' && deficit.macro === 'protein') {
            return { level: 'critical', score: 90 };
        }

        // Pre-workout is high priority if carb deficit
        if (context === 'pre_workout' && deficit.macro === 'carbs') {
            return { level: 'high', score: 75 };
        }

        // Evening with big deficit
        if (hour >= 19 && pct >= 50) {
            return { level: 'critical', score: 85 };
        }

        if (hour >= 17 && pct >= 40) {
            return { level: 'high', score: 70 };
        }

        if (pct >= 30) {
            return { level: 'medium', score: 50 };
        }

        return { level: 'low', score: 25 };
    }

    private determineCategory(
        deficit: FuelAction['primary_deficit'],
        context: FuelContext
    ): FuelCategory {
        if (deficit.macro === 'none') return 'none';

        if (context === 'post_workout') return 'recovery_shake';
        if (context === 'pre_workout') return 'fast_carbs';
        if (context === 'before_bed') return 'light_snack';

        if (deficit.macro === 'protein') return 'high_protein';
        if (deficit.macro === 'carbs') return 'complex_carbs';

        return 'balanced';
    }

    private generateSuggestions(
        deficit: FuelAction['primary_deficit'],
        context: FuelContext,
        category: FuelCategory
    ): FoodSuggestion[] {
        if (deficit.macro === 'none') return [];

        const suggestions: FoodSuggestion[] = [];
        const targetAmount = deficit.amount_g;

        // Get foods suitable for this context
        const timingMap: Record<FuelContext, MealTiming> = {
            'morning_start': 'breakfast',
            'pre_workout': 'pre_workout',
            'intra_workout': 'snack',
            'post_workout': 'post_workout',
            'afternoon': 'snack',
            'evening_catchup': 'dinner',
            'before_bed': 'evening',
            'on_track': 'snack'
        };

        const timing = timingMap[context];
        let relevantFoods = getFoodsByTiming(this.foods, timing);

        // Also filter by macro type
        const macroFoods = getFoodsByMacro(this.foods, deficit.macro as any);

        // Prioritize foods that match both timing and macro
        const priorityFoods = relevantFoods.filter(f => macroFoods.includes(f));
        const otherFoods = macroFoods.filter(f => !priorityFoods.includes(f));

        const allCandidates = [...priorityFoods, ...otherFoods];

        // Generate 2-3 suggestions
        // Suggestion 1: Single food option (if possible)
        const singleFood = this.findSingleFoodOption(allCandidates, targetAmount, deficit.macro as any);
        if (singleFood) suggestions.push(singleFood);

        // Suggestion 2: Combo option
        const combo = this.findComboOption(allCandidates, targetAmount, deficit.macro as any);
        if (combo) suggestions.push(combo);

        // Suggestion 3: Quick/instant option if others require cooking
        const quickOption = this.findQuickOption(allCandidates, targetAmount, deficit.macro as any);
        if (quickOption && !suggestions.some(s => s.prep_time === 'instant')) {
            suggestions.push(quickOption);
        }

        return suggestions.slice(0, 3);
    }

    private findSingleFoodOption(
        foods: FoodItem[],
        targetAmount: number,
        macro: 'protein' | 'carbs' | 'fat'
    ): FoodSuggestion | null {
        // Find a single food that can cover most of the deficit
        for (const food of foods) {
            const calc = calculateServingsNeeded(food, targetAmount, macro);
            if (calc.servings <= 2 && calc.actual_g >= targetAmount * 0.8) {
                return {
                    foods: [`${calc.description} ${food.name}`],
                    food_ids: [food.id],
                    emojis: food.emoji,
                    covers: `Covers ${calc.actual_g}g ${macro}`,
                    total_macros: {
                        protein_g: food.protein_g * calc.servings,
                        carbs_g: food.carbs_g * calc.servings,
                        fat_g: food.fat_g * calc.servings,
                        calories: food.calories * calc.servings
                    },
                    prep_time: food.prep_time
                };
            }
        }
        return null;
    }

    private findComboOption(
        foods: FoodItem[],
        targetAmount: number,
        macro: 'protein' | 'carbs' | 'fat'
    ): FoodSuggestion | null {
        // Find a 2-food combo
        if (foods.length < 2) return null;

        const getMacroValue = (f: FoodItem) =>
            macro === 'protein' ? f.protein_g : macro === 'carbs' ? f.carbs_g : f.fat_g;

        // Sort by macro content
        const sorted = [...foods].sort((a, b) => getMacroValue(b) - getMacroValue(a));

        // Take top 2 different foods
        const food1 = sorted[0];
        const food2 = sorted.find(f => f.id !== food1.id && f.category !== food1.category);

        if (!food2) return null;

        const total = getMacroValue(food1) + getMacroValue(food2);
        if (total < targetAmount * 0.6) return null;

        return {
            foods: [`${food1.serving_size} ${food1.name}`, `${food2.serving_size} ${food2.name}`],
            food_ids: [food1.id, food2.id],
            emojis: `${food1.emoji}${food2.emoji}`,
            covers: `Covers ~${total}g ${macro}`,
            total_macros: {
                protein_g: food1.protein_g + food2.protein_g,
                carbs_g: food1.carbs_g + food2.carbs_g,
                fat_g: food1.fat_g + food2.fat_g,
                calories: food1.calories + food2.calories
            },
            prep_time: food1.prep_time === 'cook' || food2.prep_time === 'cook' ? 'cook' :
                food1.prep_time === 'quick' || food2.prep_time === 'quick' ? 'quick' : 'instant'
        };
    }

    private findQuickOption(
        foods: FoodItem[],
        targetAmount: number,
        macro: 'protein' | 'carbs' | 'fat'
    ): FoodSuggestion | null {
        const quickFoods = foods.filter(f => f.prep_time === 'instant' || f.prep_time === 'quick');
        return this.findSingleFoodOption(quickFoods, targetAmount, macro);
    }

    private generateMessages(
        deficit: FuelAction['primary_deficit'],
        context: FuelContext,
        hour: number
    ): { headline: string; subtext: string; tomorrow_tip?: string } {
        if (deficit.macro === 'none') {
            return {
                headline: '✓ Fuel targets on track',
                subtext: 'Great job hitting your macros today!'
            };
        }

        const macroName = deficit.macro.charAt(0).toUpperCase() + deficit.macro.slice(1);
        const amount = deficit.amount_g;

        // Context-specific headlines
        const headlines: Record<FuelContext, string> = {
            'morning_start': `Start strong: ${amount}g ${macroName} to hit`,
            'pre_workout': `Pre-fuel: ${amount}g ${macroName} needed`,
            'intra_workout': `Mid-session: Quick ${macroName.toLowerCase()} boost`,
            'post_workout': `Recovery window: ${amount}g ${macroName} now`,
            'afternoon': `You're ${amount}g ${macroName.toLowerCase()} behind`,
            'evening_catchup': `Evening catch-up: ${amount}g ${macroName} gap`,
            'before_bed': `Light option: ${amount}g ${macroName} to close`,
            'on_track': '✓ Macros balanced'
        };

        const subtexts: Record<FuelContext, string> = {
            'morning_start': 'Breakfast is key for daily protein distribution',
            'pre_workout': 'Fuel up for optimal performance',
            'intra_workout': 'Keep energy stable during training',
            'post_workout': 'Maximize muscle protein synthesis',
            'afternoon': 'Quick fix options:',
            'evening_catchup': 'Time to catch up before bed:',
            'before_bed': 'Last chance for today:',
            'on_track': 'Keep up the good work!'
        };

        let tomorrow_tip: string | undefined;

        // If it's late and deficit is big, add tomorrow tip
        if (hour >= 21 && deficit.percentage_of_target > 30) {
            tomorrow_tip = `Start tomorrow with ${Math.round(amount * 0.4)}g ${macroName.toLowerCase()} at breakfast to stay ahead.`;
        }

        return {
            headline: headlines[context],
            subtext: subtexts[context],
            tomorrow_tip
        };
    }

    private getActiveTimingWindow(context: FuelContext): FuelAction['timing_window'] | undefined {
        if (context === 'post_workout') {
            return {
                name: TIMING_WINDOWS.post_workout.name,
                reason: TIMING_WINDOWS.post_workout.reason,
                science: TIMING_WINDOWS.post_workout.science
            };
        }
        if (context === 'pre_workout') {
            return {
                name: TIMING_WINDOWS.pre_workout.name,
                reason: TIMING_WINDOWS.pre_workout.reason,
                science: TIMING_WINDOWS.pre_workout.science
            };
        }
        if (context === 'before_bed') {
            return {
                name: TIMING_WINDOWS.pre_bed.name,
                reason: TIMING_WINDOWS.pre_bed.reason,
                science: TIMING_WINDOWS.pre_bed.science
            };
        }
        if (context === 'morning_start') {
            return {
                name: TIMING_WINDOWS.morning.name,
                reason: TIMING_WINDOWS.morning.reason,
                science: TIMING_WINDOWS.morning.science
            };
        }
        return undefined;
    }

    private createOnTrackAction(context: FuelContext, deficits: any): FuelAction {
        return {
            urgency: 'none',
            urgency_score: 0,
            context,
            primary_deficit: { macro: 'none', amount_g: 0, percentage_of_target: 0 },
            deficits,
            category: 'none',
            suggestions: [],
            headline: '✓ Fuel targets on track',
            subtext: 'Great job hitting your macros today!'
        };
    }
}

// =====================================================
// CONVENIENCE EXPORT
// =====================================================

export const evaluateFuelAction = (state: GlobalState, currentTime?: Date): FuelAction => {
    const engine = new FuelActionEngine(state, currentTime);
    return engine.evaluate();
};
