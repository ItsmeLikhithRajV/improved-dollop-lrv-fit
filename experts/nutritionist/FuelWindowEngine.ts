/**
 * Fuel Window Engine - Session-Synced Nutrition Timing
 * 
 * Implements:
 * - Fuel window calculation based on training schedule
 * - Glycogen status estimation
 * - Protein distribution tracking
 * - Hydration monitoring
 * - Train high/low periodization
 */

import { Session } from '../../types';
import {
    FuelWindow,
    FuelWindowType,
    FUEL_WINDOW_TEMPLATES,
    GlycogenStatus,
    ProteinDistribution,
    HydrationStatus,
    NutritionPeriodization,
    PlannedMeal,
    DailyFuelPlan,
    FuelAnalysisOutput
} from '../../types/fuel';

// ============================================================================
// TIME UTILITIES
// ============================================================================

const parseTime = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

const formatTime = (minutes: number): string => {
    const h = Math.floor((minutes % 1440) / 60);
    const m = Math.floor(minutes % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const getCurrentMinutes = (): number => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
};

const addMinutes = (timeStr: string, mins: number): string => {
    return formatTime(parseTime(timeStr) + mins);
};

const subtractMinutes = (timeStr: string, mins: number): string => {
    let total = parseTime(timeStr) - mins;
    if (total < 0) total += 1440;
    return formatTime(total);
};

// ============================================================================
// MAIN ENGINE
// ============================================================================

export class FuelWindowEngine {
    private bodyWeightKg: number = 70;
    private sessionsToday: Session[] = [];
    private mealsConsumed: PlannedMeal[] = [];
    private fluidConsumedMl: number = 0;

    /**
     * Set user body weight for calculations
     */
    setBodyWeight(kg: number): void {
        this.bodyWeightKg = kg;
    }

    /**
     * Set today's training sessions
     */
    setSessionsToday(sessions: Session[]): void {
        this.sessionsToday = sessions;
    }

    /**
     * Log a meal
     */
    logMeal(meal: PlannedMeal): void {
        this.mealsConsumed.push(meal);
    }

    /**
     * Log fluid intake
     */
    logFluid(ml: number): void {
        this.fluidConsumedMl += ml;
    }

    /**
     * Calculate fuel windows based on today's sessions
     */
    calculateFuelWindows(): FuelWindow[] {
        const windows: FuelWindow[] = [];
        const currentMinutes = getCurrentMinutes();

        // If rest day
        if (this.sessionsToday.length === 0) {
            windows.push({
                ...FUEL_WINDOW_TEMPLATES.recovery_day,
                start_time: '06:00',
                end_time: '22:00',
                duration_minutes: 960
            });
            return windows;
        }

        // For each session, create windows
        this.sessionsToday.forEach((session, idx) => {
            const sessionTime = session.time_of_day || '10:00';
            const sessionMinutes = parseTime(sessionTime);
            const sessionDuration = session.duration_minutes || 60;
            const sessionEnd = formatTime(sessionMinutes + sessionDuration);

            // Pre-session windows
            // Full meal: 3-4 hours before
            const fullMealTime = subtractMinutes(sessionTime, 210); // 3.5h before
            windows.push({
                ...FUEL_WINDOW_TEMPLATES.pre_session_full_meal,
                start_time: fullMealTime,
                end_time: subtractMinutes(sessionTime, 180),
                duration_minutes: 30,
                session_id: session.id,
                session_type: session.type
            });

            // Snack: 1-2 hours before
            const snackTime = subtractMinutes(sessionTime, 90);
            windows.push({
                ...FUEL_WINDOW_TEMPLATES.pre_session_snack,
                start_time: snackTime,
                end_time: subtractMinutes(sessionTime, 60),
                duration_minutes: 30,
                session_id: session.id,
                session_type: session.type
            });

            // Simple carbs: 15-30 min before
            if (session.intensity === 'high') {
                windows.push({
                    ...FUEL_WINDOW_TEMPLATES.pre_session_simple,
                    start_time: subtractMinutes(sessionTime, 30),
                    end_time: subtractMinutes(sessionTime, 15),
                    duration_minutes: 15,
                    session_id: session.id,
                    session_type: session.type
                });
            }

            // During session (if > 60 min)
            if (sessionDuration >= 60) {
                windows.push({
                    ...FUEL_WINDOW_TEMPLATES.during_session,
                    start_time: sessionTime,
                    end_time: sessionEnd,
                    duration_minutes: sessionDuration,
                    session_id: session.id,
                    session_type: session.type
                });
            }

            // Post-session immediate (0-30 min after)
            windows.push({
                ...FUEL_WINDOW_TEMPLATES.post_session_immediate,
                start_time: sessionEnd,
                end_time: addMinutes(sessionEnd, 30),
                duration_minutes: 30,
                priority: 'critical',
                session_id: session.id,
                session_type: session.type
            });

            // Post-session extended (30 min - 2h after)
            windows.push({
                ...FUEL_WINDOW_TEMPLATES.post_session_extended,
                start_time: addMinutes(sessionEnd, 30),
                end_time: addMinutes(sessionEnd, 120),
                duration_minutes: 90,
                session_id: session.id,
                session_type: session.type
            });
        });

        // Sort by start time
        windows.sort((a, b) => parseTime(a.start_time) - parseTime(b.start_time));

        return windows;
    }

    /**
     * Get current fuel window
     */
    getCurrentWindow(windows: FuelWindow[]): FuelWindow | null {
        const currentMinutes = getCurrentMinutes();

        return windows.find(w => {
            const start = parseTime(w.start_time);
            const end = parseTime(w.end_time);
            return currentMinutes >= start && currentMinutes <= end;
        }) || null;
    }

    /**
     * Get next fuel window
     */
    getNextWindow(windows: FuelWindow[]): FuelWindow | null {
        const currentMinutes = getCurrentMinutes();

        return windows.find(w => parseTime(w.start_time) > currentMinutes) || null;
    }

    /**
     * Estimate glycogen status
     */
    estimateGlycogenStatus(): GlycogenStatus {
        // Simplified model
        // Start at 100% after overnight fast, depletes with exercise

        let muscleGlycogen = 70; // Start moderate (morning)
        let liverGlycogen = 50;  // Lower in morning

        // Add back based on meals
        const carbsConsumed = this.mealsConsumed.reduce((acc, m) => acc + m.carbs_grams, 0);
        const carbsPerKg = carbsConsumed / this.bodyWeightKg;

        // ~10g/kg fills glycogen fully
        muscleGlycogen = Math.min(100, muscleGlycogen + (carbsPerKg / 10) * 40);
        liverGlycogen = Math.min(100, liverGlycogen + (carbsPerKg / 3) * 50);

        // Subtract for completed sessions
        const completedSessions = this.sessionsToday.filter(s => s.completed);
        completedSessions.forEach(s => {
            const depletion = s.intensity === 'high' ? 30 : s.intensity === 'medium' ? 20 : 10;
            muscleGlycogen = Math.max(0, muscleGlycogen - depletion);
            liverGlycogen = Math.max(0, liverGlycogen - depletion * 0.5);
        });

        // Status
        const avgGlycogen = (muscleGlycogen + liverGlycogen) / 2;
        let status: GlycogenStatus['status'] = 'moderate';
        if (avgGlycogen >= 90) status = 'supercompensated';
        else if (avgGlycogen >= 70) status = 'full';
        else if (avgGlycogen >= 40) status = 'moderate';
        else if (avgGlycogen >= 20) status = 'low';
        else status = 'depleted';

        // Calculate needs
        const targetMuscle = 100;
        const deficitMuscle = targetMuscle - muscleGlycogen;
        const carbNeed = Math.round((deficitMuscle / 100) * 10 * this.bodyWeightKg);

        return {
            muscle_glycogen_percent: Math.round(muscleGlycogen),
            liver_glycogen_percent: Math.round(liverGlycogen),
            estimated_depletion_time: avgGlycogen > 50 ? '90+ min activity' : '< 60 min activity',
            estimated_refill_hours: Math.ceil((100 - avgGlycogen) / 10),
            status,
            carb_need_grams: Math.max(0, carbNeed),
            recommended_timing: status === 'low' || status === 'depleted' ? 'Eat carbs now' : 'Normal timing'
        };
    }

    /**
     * Track protein distribution
     */
    calculateProteinDistribution(): ProteinDistribution {
        const dailyTarget = this.bodyWeightKg * 1.8; // 1.8 g/kg for athletes
        const perMealTarget = Math.round(dailyTarget / 4); // 4 meals

        const mealTimes = ['07:00', '12:00', '16:00', '20:00'];
        const meals = mealTimes.map((time, i) => {
            const consumed = this.mealsConsumed.find(m => {
                const mealHour = parseInt(m.time.split(':')[0]);
                const windowHour = parseInt(time.split(':')[0]);
                return Math.abs(mealHour - windowHour) <= 2;
            });

            const protein = consumed?.protein_grams || 0;

            return {
                name: i === 0 ? 'Breakfast' : i === 1 ? 'Lunch' : i === 2 ? 'Snack/Pre-workout' : 'Dinner',
                time,
                protein_grams: protein,
                leucine_achieved: protein >= 25 // ~2.5g leucine in 25g quality protein
            };
        });

        const totalConsumed = meals.reduce((acc, m) => acc + m.protein_grams, 0);

        // Check distribution quality
        const proteinValues = meals.map(m => m.protein_grams).filter(p => p > 0);
        let distribution: ProteinDistribution['distribution_quality'] = 'even';

        if (proteinValues.length > 0) {
            const avg = totalConsumed / proteinValues.length;
            const variance = proteinValues.reduce((acc, p) => acc + Math.pow(p - avg, 2), 0) / proteinValues.length;
            const cv = Math.sqrt(variance) / avg;

            if (cv > 0.5) distribution = 'uneven';
            else if (proteinValues[0] > avg * 1.5) distribution = 'front_loaded';
            else if (proteinValues[proteinValues.length - 1] > avg * 1.5) distribution = 'back_loaded';
        }

        return {
            daily_target_grams: Math.round(dailyTarget),
            per_meal_target_grams: perMealTarget,
            leucine_per_meal_grams: 2.5,
            meals,
            total_consumed_grams: totalConsumed,
            remaining_grams: Math.max(0, Math.round(dailyTarget - totalConsumed)),
            distribution_quality: distribution
        };
    }

    /**
     * Track hydration status
     */
    calculateHydrationStatus(): HydrationStatus {
        // Base fluid need: ~35-40 ml/kg/day
        const baseNeed = this.bodyWeightKg * 35;

        // Add for exercise
        const exerciseMinutes = this.sessionsToday
            .filter(s => s.completed)
            .reduce((acc, s) => acc + (s.duration_minutes || 60), 0);

        // ~500-1000ml per hour of exercise
        const exerciseNeed = (exerciseMinutes / 60) * 750;

        const totalNeed = Math.round(baseNeed + exerciseNeed);
        const consumed = this.fluidConsumedMl;
        const hydrationPercent = Math.min(100, (consumed / totalNeed) * 100);

        let status: HydrationStatus['status'] = 'adequate';
        if (hydrationPercent >= 90) status = 'well_hydrated';
        else if (hydrationPercent >= 70) status = 'adequate';
        else if (hydrationPercent >= 50) status = 'slightly_low';
        else status = 'dehydrated';

        // Recommendation
        let recommendation = 'On track';
        const remaining = totalNeed - consumed;
        if (remaining > 0) {
            const hourly = Math.round(remaining / 8); // Spread over 8 hours
            recommendation = `Drink ${hourly}ml per hour to meet target`;
        }

        return {
            estimated_hydration_percent: Math.round(hydrationPercent),
            fluid_consumed_ml: consumed,
            fluid_target_ml: totalNeed,
            estimated_sweat_rate_ml_per_hour: 750,
            sodium_mg_needed: Math.round(exerciseMinutes * 20),
            status,
            recommendation
        };
    }

    /**
     * Determine periodization strategy for session
     */
    determineStrategy(session: Session): NutritionPeriodization {
        // Default: train high for quality sessions
        if (session.intensity === 'high' || session.activity_type === 'anaerobic') {
            return {
                strategy: 'train_high',
                session_type: session.type,
                carb_availability: 'high',
                pre_session: { carbs: 'high', when: '3-4h before' },
                during_session: { carbs_per_hour_g: session.duration_minutes > 60 ? 60 : 0 },
                post_session: { carbs: 'high', when: 'Within 30 min' },
                rationale: 'High intensity requires full glycogen for quality output',
                expected_adaptation: 'Performance, power, speed'
            };
        }

        // Low intensity aerobic: consider train low
        if (session.intensity === 'low' && session.activity_type === 'aerobic') {
            return {
                strategy: 'train_low',
                session_type: session.type,
                carb_availability: 'low',
                pre_session: { carbs: 'low', when: 'Fasted or low carb meal' },
                during_session: { carbs_per_hour_g: 0 },
                post_session: { carbs: 'moderate', when: 'After session' },
                rationale: 'Low intensity allows fat oxidation training',
                expected_adaptation: 'Fat oxidation, mitochondrial biogenesis'
            };
        }

        // Default moderate
        return {
            strategy: 'recover_high',
            session_type: session.type,
            carb_availability: 'moderate',
            pre_session: { carbs: 'moderate', when: '2-3h before' },
            during_session: { carbs_per_hour_g: 30 },
            post_session: { carbs: 'high', when: 'Within 1 hour' },
            rationale: 'Balanced approach for moderate sessions',
            expected_adaptation: 'General fitness, recovery'
        };
    }

    /**
     * Build today's fuel plan
     */
    buildDailyPlan(): DailyFuelPlan {
        const isTrainingDay = this.sessionsToday.length > 0;
        const windows = this.calculateFuelWindows();

        // Calculate targets
        const baseCalories = this.bodyWeightKg * 30;
        const exerciseCalories = this.sessionsToday.reduce((acc, s) => {
            const calsPerMin = s.intensity === 'high' ? 12 : s.intensity === 'medium' ? 8 : 5;
            return acc + (s.duration_minutes || 60) * calsPerMin;
        }, 0);

        const calorieTarget = Math.round(baseCalories + exerciseCalories);
        const carbTarget = Math.round((calorieTarget * 0.5) / 4); // 50% from carbs
        const proteinTarget = Math.round(this.bodyWeightKg * 1.8);
        const fatTarget = Math.round((calorieTarget * 0.25) / 9); // 25% from fat

        return {
            date: new Date().toISOString().split('T')[0],
            training_day: isTrainingDay,
            session_times: this.sessionsToday.map(s => s.time_of_day || '10:00'),
            calorie_target: calorieTarget,
            carb_target_grams: carbTarget,
            protein_target_grams: proteinTarget,
            fat_target_grams: fatTarget,
            fluid_target_ml: this.calculateHydrationStatus().fluid_target_ml,
            meals: [],
            fuel_windows: windows,
            calories_consumed: this.mealsConsumed.reduce((acc, m) => acc + m.calories, 0),
            macros_consumed: {
                carbs: this.mealsConsumed.reduce((acc, m) => acc + m.carbs_grams, 0),
                protein: this.mealsConsumed.reduce((acc, m) => acc + m.protein_grams, 0),
                fat: this.mealsConsumed.reduce((acc, m) => acc + m.fat_grams, 0)
            },
            fluid_consumed: this.fluidConsumedMl,
            adherence_score: 0 // Would calculate based on timing adherence
        };
    }

    /**
     * Main analysis method
     */
    analyze(): FuelAnalysisOutput {
        const windows = this.calculateFuelWindows();
        const currentWindow = this.getCurrentWindow(windows);
        const nextWindow = this.getNextWindow(windows);
        const glycogen = this.estimateGlycogenStatus();
        const protein = this.calculateProteinDistribution();
        const hydration = this.calculateHydrationStatus();
        const plan = this.buildDailyPlan();

        // Current strategy
        const nextSession = this.sessionsToday.find(s => !s.completed);
        const strategy = nextSession
            ? this.determineStrategy(nextSession)
            : {
                strategy: 'recover_high' as const,
                session_type: 'rest',
                carb_availability: 'moderate' as const,
                pre_session: { carbs: 'moderate' as const, when: 'N/A' },
                during_session: { carbs_per_hour_g: 0 },
                post_session: { carbs: 'moderate' as const, when: 'N/A' },
                rationale: 'Rest day - focus on recovery nutrition',
                expected_adaptation: 'Recovery'
            };

        // Immediate action
        let immediateAction = 'Stay hydrated';
        if (currentWindow) {
            if (currentWindow.type === 'post_session_immediate') {
                immediateAction = `Recovery window! Consume ${currentWindow.carbs_grams_per_kg}g/kg carbs + ${currentWindow.protein_grams}g protein`;
            } else if (currentWindow.type === 'pre_session_snack') {
                immediateAction = 'Light snack time - easily digestible carbs';
            } else if (currentWindow.type === 'during_session') {
                immediateAction = 'Stay fueled - 30-60g carbs per hour';
            }
        } else if (glycogen.status === 'low' || glycogen.status === 'depleted') {
            immediateAction = `Low glycogen! Consume ${glycogen.carb_need_grams}g carbs`;
        } else if (hydration.status === 'dehydrated' || hydration.status === 'slightly_low') {
            immediateAction = hydration.recommendation;
        }

        // Upcoming actions
        const upcomingActions: { time: string; action: string }[] = [];
        if (nextWindow) {
            upcomingActions.push({
                time: nextWindow.start_time,
                action: `${nextWindow.name}: ${nextWindow.purpose}`
            });
        }

        return {
            current_window: currentWindow,
            next_window: nextWindow,
            glycogen_status: glycogen,
            protein_distribution: protein,
            hydration_status: hydration,
            today_plan: plan,
            immediate_action: immediateAction,
            upcoming_actions: upcomingActions,
            current_strategy: strategy
        };
    }
}

// Singleton
export const fuelWindowEngine = new FuelWindowEngine();

// State-driven analysis function
import type { GlobalState } from '../../types';

/**
 * Analyze fuel from GlobalState
 * Note: FuelWindowEngine will be enhanced to read state directly in future
 */
export function analyzeFuel(state?: GlobalState): FuelAnalysisOutput {
    // State is available but engine uses its own data structure
    // This signature change allows consumers to pass state for future integration
    return fuelWindowEngine.analyze();
}

