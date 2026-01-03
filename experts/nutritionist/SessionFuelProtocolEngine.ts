/**
 * Session Fuel Protocol Engine
 * 
 * Generates personalized fuel windows based on scheduled/logged sessions.
 * This is the bridge between Timeline → Fuel recommendations.
 * 
 * When a user logs a session:
 * 1. Calculate pre-workout fuel window (goal-specific timing)
 * 2. Calculate post-workout fuel window (goal-specific urgency)
 * 3. Generate specific food suggestions for each window
 * 4. Create action candidates for Command tab
 */

import { GoalType, GOAL_PROTOCOLS } from '../../types/goals';
import {
    FOOD_DATABASE,
    FoodItem,
    filterByDiet,
    getFoodsByTiming,
    DietType,
    Allergen
} from './foodDatabase';

// Local Session interface - flexible to work with different session formats
export interface Session {
    id?: string;
    type: string;
    start_time?: string | Date;  // ISO string or Date
    time?: string;  // Alternative time format "HH:mm"
    duration_minutes?: number;
    duration_min?: number;  // Alternative from PlannedSession
    name?: string;
}

// =====================================================
// TYPES
// =====================================================

export interface FuelWindow {
    id: string;
    type: 'pre_workout' | 'post_workout' | 'during_workout' | 'morning_start' | 'before_bed';
    session_id: string;
    session_type: string;
    session_time: Date;

    window_start: Date;
    window_end: Date;

    priority: 'critical' | 'high' | 'medium' | 'low';
    is_active: boolean;  // Currently within this window
    is_upcoming: boolean;  // Within 2 hours
    is_missed: boolean;  // Window has passed

    // Goal-specific recommendations
    macro_focus: 'carbs' | 'protein' | 'balanced';
    carbs_g: number;
    protein_g: number;
    fat_g: number;

    // Display
    title: string;
    subtitle: string;
    rationale: string;

    // Food suggestions
    food_suggestions: FoodSuggestion[];
}

export interface FoodSuggestion {
    foods: string[];
    emojis: string;
    covers: string;  // "25g carbs + 10g protein"
    prep_time: 'instant' | 'quick' | 'moderate';
}

export interface SessionFuelPlan {
    session: Session;
    pre_workout: FuelWindow | null;
    post_workout: FuelWindow | null;
    during_workout: FuelWindow | null;
}

export interface DayFuelProtocol {
    date: Date;
    sessions: SessionFuelPlan[];
    all_windows: FuelWindow[];
    active_window: FuelWindow | null;
    next_window: FuelWindow | null;
}

// =====================================================
// GOAL-SPECIFIC FUEL TIMING RULES
// =====================================================

interface GoalFuelTiming {
    pre_workout: {
        hours_before: number;
        window_duration_min: number;
        carbs_g_per_kg: number;
        protein_g: number;
        priority: 'critical' | 'high' | 'medium' | 'low';
        skip_if_fasted?: boolean;
    };
    post_workout: {
        minutes_after: number;
        window_duration_min: number;
        carbs_g_per_kg: number;
        protein_g: number;
        priority: 'critical' | 'high' | 'medium';
    };
    during_workout?: {
        threshold_minutes: number;
        carbs_g_per_hour: number;
    };
}

const GOAL_FUEL_TIMING: Record<GoalType, GoalFuelTiming> = {
    fat_loss: {
        pre_workout: {
            hours_before: 2,
            window_duration_min: 60,
            carbs_g_per_kg: 0.5,  // Lower carbs
            protein_g: 20,
            priority: 'medium',
            skip_if_fasted: true
        },
        post_workout: {
            minutes_after: 0,
            window_duration_min: 60,
            carbs_g_per_kg: 0.5,
            protein_g: 40,  // High protein
            priority: 'high'
        }
    },
    muscle_gain: {
        pre_workout: {
            hours_before: 2,
            window_duration_min: 90,
            carbs_g_per_kg: 1.0,
            protein_g: 30,
            priority: 'high'
        },
        post_workout: {
            minutes_after: 0,
            window_duration_min: 45,
            carbs_g_per_kg: 1.2,
            protein_g: 40,
            priority: 'critical'  // Anabolic window matters most here
        }
    },
    endurance: {
        pre_workout: {
            hours_before: 3,
            window_duration_min: 90,
            carbs_g_per_kg: 1.5,
            protein_g: 15,
            priority: 'critical'
        },
        post_workout: {
            minutes_after: 0,
            window_duration_min: 30,
            carbs_g_per_kg: 1.2,
            protein_g: 25,
            priority: 'critical'  // Glycogen window
        },
        during_workout: {
            threshold_minutes: 60,
            carbs_g_per_hour: 45
        }
    },
    weight_loss: {
        pre_workout: {
            hours_before: 2,
            window_duration_min: 60,
            carbs_g_per_kg: 0.3,
            protein_g: 20,
            priority: 'low',
            skip_if_fasted: true
        },
        post_workout: {
            minutes_after: 0,
            window_duration_min: 90,
            carbs_g_per_kg: 0.3,
            protein_g: 35,
            priority: 'medium'
        }
    },
    weight_gain: {
        pre_workout: {
            hours_before: 2,
            window_duration_min: 90,
            carbs_g_per_kg: 1.5,
            protein_g: 30,
            priority: 'high'
        },
        post_workout: {
            minutes_after: 0,
            window_duration_min: 60,
            carbs_g_per_kg: 1.5,
            protein_g: 45,
            priority: 'critical'
        }
    },
    explosive_power: {
        pre_workout: {
            hours_before: 2,
            window_duration_min: 60,
            carbs_g_per_kg: 0.8,
            protein_g: 25,
            priority: 'high'
        },
        post_workout: {
            minutes_after: 0,
            window_duration_min: 60,
            carbs_g_per_kg: 0.8,
            protein_g: 35,
            priority: 'high'
        }
    },
    hybrid: {
        pre_workout: {
            hours_before: 2,
            window_duration_min: 60,
            carbs_g_per_kg: 1.0,
            protein_g: 25,
            priority: 'high'
        },
        post_workout: {
            minutes_after: 0,
            window_duration_min: 45,
            carbs_g_per_kg: 1.0,
            protein_g: 35,
            priority: 'high'
        }
    },
    longevity: {
        pre_workout: {
            hours_before: 2,
            window_duration_min: 90,
            carbs_g_per_kg: 0.5,
            protein_g: 20,
            priority: 'medium'
        },
        post_workout: {
            minutes_after: 0,
            window_duration_min: 90,
            carbs_g_per_kg: 0.5,
            protein_g: 30,
            priority: 'medium'
        }
    }
};

// =====================================================
// MAIN ENGINE CLASS
// =====================================================

export class SessionFuelProtocolEngine {
    private userWeight: number = 70;  // kg
    private userGoal: GoalType = 'hybrid';
    private dietType: DietType = 'omnivore';
    private allergies: Allergen[] = [];

    /**
     * Configure user parameters
     */
    configure(params: {
        weight_kg?: number;
        goal?: GoalType;
        diet_type?: DietType;
        allergies?: Allergen[];
    }): void {
        if (params.weight_kg) this.userWeight = params.weight_kg;
        if (params.goal) this.userGoal = params.goal;
        if (params.diet_type) this.dietType = params.diet_type;
        if (params.allergies) this.allergies = params.allergies;
    }

    /**
     * Parse session time from various formats
     */
    private getSessionTime(session: Session): Date {
        if (session.start_time) {
            return new Date(session.start_time);
        }
        if (session.time) {
            // Parse "HH:mm" format - assume today
            const [hours, minutes] = session.time.split(':').map(Number);
            const date = new Date();
            date.setHours(hours, minutes, 0, 0);
            return date;
        }
        // Default to now
        return new Date();
    }

    /**
     * Get session duration in minutes
     */
    private getSessionDuration(session: Session): number {
        return session.duration_minutes || session.duration_min || 60;
    }

    /**
     * Generate fuel windows for a single session
     */
    generateSessionFuelPlan(session: Session): SessionFuelPlan {
        const timing = GOAL_FUEL_TIMING[this.userGoal];
        const sessionTime = this.getSessionTime(session);

        const plan: SessionFuelPlan = {
            session,
            pre_workout: null,
            post_workout: null,
            during_workout: null
        };

        // Pre-workout window
        if (!timing.pre_workout.skip_if_fasted) {
            plan.pre_workout = this.createPreWorkoutWindow(session, sessionTime, timing);
        }

        // Post-workout window
        plan.post_workout = this.createPostWorkoutWindow(session, sessionTime, timing);

        // During-workout (for long sessions)
        const sessionDuration = this.getSessionDuration(session);
        if (timing.during_workout && sessionDuration >= timing.during_workout.threshold_minutes) {
            plan.during_workout = this.createDuringWorkoutWindow(session, sessionTime, timing);
        }

        return plan;
    }

    /**
     * Generate complete day fuel protocol from all sessions
     */
    generateDayProtocol(sessions: Session[], now: Date = new Date()): DayFuelProtocol {
        const todaysSessions = sessions.filter(s => {
            const sessionDate = this.getSessionTime(s);
            return sessionDate.toDateString() === now.toDateString();
        });

        const sessionPlans = todaysSessions.map(s => this.generateSessionFuelPlan(s));
        const allWindows: FuelWindow[] = [];

        for (const plan of sessionPlans) {
            if (plan.pre_workout) allWindows.push(plan.pre_workout);
            if (plan.during_workout) allWindows.push(plan.during_workout);
            if (plan.post_workout) allWindows.push(plan.post_workout);
        }

        // Sort by window start time
        allWindows.sort((a, b) => a.window_start.getTime() - b.window_start.getTime());

        // Update active/upcoming status
        for (const window of allWindows) {
            window.is_active = now >= window.window_start && now <= window.window_end;
            window.is_upcoming = !window.is_active &&
                window.window_start > now &&
                (window.window_start.getTime() - now.getTime()) <= 2 * 60 * 60 * 1000;
            window.is_missed = now > window.window_end;
        }

        return {
            date: now,
            sessions: sessionPlans,
            all_windows: allWindows,
            active_window: allWindows.find(w => w.is_active) || null,
            next_window: allWindows.find(w => w.is_upcoming && !w.is_missed) || null
        };
    }

    /**
     * Get the most urgent fuel action for Command tab
     */
    getUrgentFuelAction(sessions: Session[], now: Date = new Date()): FuelWindow | null {
        const protocol = this.generateDayProtocol(sessions, now);

        // Priority: active critical > active high > upcoming critical
        if (protocol.active_window) {
            return protocol.active_window;
        }

        if (protocol.next_window &&
            (protocol.next_window.priority === 'critical' || protocol.next_window.priority === 'high')) {
            return protocol.next_window;
        }

        return protocol.next_window;
    }

    // =========================================
    // PRIVATE HELPERS
    // =========================================

    private createPreWorkoutWindow(
        session: Session,
        sessionTime: Date,
        timing: GoalFuelTiming
    ): FuelWindow {
        const pre = timing.pre_workout;
        const windowStart = new Date(sessionTime.getTime() - pre.hours_before * 60 * 60 * 1000);
        const windowEnd = new Date(windowStart.getTime() + pre.window_duration_min * 60 * 1000);

        const carbsG = Math.round(pre.carbs_g_per_kg * this.userWeight);
        const proteinG = pre.protein_g;

        return {
            id: `pre_${session.id || Date.now()}`,
            type: 'pre_workout',
            session_id: session.id || '',
            session_type: session.type,
            session_time: sessionTime,
            window_start: windowStart,
            window_end: windowEnd,
            priority: pre.priority,
            is_active: false,
            is_upcoming: false,
            is_missed: false,
            macro_focus: carbsG > proteinG ? 'carbs' : 'balanced',
            carbs_g: carbsG,
            protein_g: proteinG,
            fat_g: 10,
            title: `Pre-${this.formatSessionType(session.type)} Fuel`,
            subtitle: `${pre.hours_before}h before ${this.formatTime(sessionTime)}`,
            rationale: this.getPreWorkoutRationale(),
            food_suggestions: this.generateFoodSuggestions(carbsG, proteinG, 'pre_workout')
        };
    }

    private createPostWorkoutWindow(
        session: Session,
        sessionTime: Date,
        timing: GoalFuelTiming
    ): FuelWindow {
        const post = timing.post_workout;
        const sessionEndTime = new Date(sessionTime.getTime() + this.getSessionDuration(session) * 60 * 1000);
        const windowStart = new Date(sessionEndTime.getTime() + post.minutes_after * 60 * 1000);
        const windowEnd = new Date(windowStart.getTime() + post.window_duration_min * 60 * 1000);

        const carbsG = Math.round(post.carbs_g_per_kg * this.userWeight);
        const proteinG = post.protein_g;

        return {
            id: `post_${session.id || Date.now()}`,
            type: 'post_workout',
            session_id: session.id || '',
            session_type: session.type,
            session_time: sessionTime,
            window_start: windowStart,
            window_end: windowEnd,
            priority: post.priority,
            is_active: false,
            is_upcoming: false,
            is_missed: false,
            macro_focus: 'balanced',
            carbs_g: carbsG,
            protein_g: proteinG,
            fat_g: 5,  // Keep fat low post-workout
            title: `Post-${this.formatSessionType(session.type)} Recovery`,
            subtitle: `Within ${post.window_duration_min}min of finishing`,
            rationale: this.getPostWorkoutRationale(),
            food_suggestions: this.generateFoodSuggestions(carbsG, proteinG, 'post_workout')
        };
    }

    private createDuringWorkoutWindow(
        session: Session,
        sessionTime: Date,
        timing: GoalFuelTiming
    ): FuelWindow {
        const during = timing.during_workout!;
        const durationMin = this.getSessionDuration(session);
        const durationHours = durationMin / 60;
        const carbsG = Math.round(during.carbs_g_per_hour * durationHours);

        return {
            id: `during_${session.id || Date.now()}`,
            type: 'during_workout',
            session_id: session.id || '',
            session_type: session.type,
            session_time: sessionTime,
            window_start: sessionTime,
            window_end: new Date(sessionTime.getTime() + durationMin * 60 * 1000),
            priority: 'high',
            is_active: false,
            is_upcoming: false,
            is_missed: false,
            macro_focus: 'carbs',
            carbs_g: carbsG,
            protein_g: 0,
            fat_g: 0,
            title: `During ${this.formatSessionType(session.type)} Fueling`,
            subtitle: `${carbsG}g carbs over ${durationMin}min`,
            rationale: 'Maintain blood glucose and spare glycogen during extended efforts.',
            food_suggestions: [
                { foods: ['Sports drink', 'Banana'], emojis: '🥤🍌', covers: `${carbsG}g fast carbs`, prep_time: 'instant' },
                { foods: ['Energy gel', 'Water'], emojis: '⚡💧', covers: `${carbsG}g quick energy`, prep_time: 'instant' }
            ]
        };
    }

    private generateFoodSuggestions(
        carbsG: number,
        proteinG: number,
        timing: 'pre_workout' | 'post_workout'
    ): FoodSuggestion[] {
        const suggestions: FoodSuggestion[] = [];
        const availableFoods = filterByDiet(FOOD_DATABASE, this.dietType, this.allergies);
        const timingFoods = getFoodsByTiming(availableFoods, timing);

        // Find high-carb and high-protein foods
        const carbFoods = timingFoods.filter(f => f.carbs_g > 15).slice(0, 3);
        const proteinFoods = timingFoods.filter(f => f.protein_g > 15).slice(0, 3);

        if (carbFoods.length > 0 && proteinFoods.length > 0) {
            suggestions.push({
                foods: [carbFoods[0].name, proteinFoods[0].name],
                emojis: `${carbFoods[0].emoji || '🍞'}${proteinFoods[0].emoji || '🍗'}`,
                covers: `~${carbsG}g carbs + ${proteinG}g protein`,
                prep_time: 'quick'
            });
        }

        // Simple options
        if (timing === 'post_workout') {
            suggestions.push({
                foods: ['Whey protein shake', 'Banana'],
                emojis: '🥛🍌',
                covers: `25g protein + 25g carbs`,
                prep_time: 'instant'
            });
        } else {
            suggestions.push({
                foods: ['Oatmeal', 'Greek yogurt'],
                emojis: '🥣🥛',
                covers: `35g carbs + 15g protein`,
                prep_time: 'quick'
            });
        }

        return suggestions.slice(0, 3);
    }

    private getPreWorkoutRationale(): string {
        switch (this.userGoal) {
            case 'muscle_gain':
                return 'Pre-load with carbs + protein to maximize training performance and reduce muscle breakdown.';
            case 'endurance':
                return 'Top off glycogen stores for optimal endurance performance.';
            case 'fat_loss':
                return 'Light fuel to maintain training intensity without excess calories.';
            default:
                return 'Fuel your upcoming session with the right nutrients.';
        }
    }

    private getPostWorkoutRationale(): string {
        switch (this.userGoal) {
            case 'muscle_gain':
                return 'Critical anabolic window - protein triggers MPS, carbs spike insulin for nutrient delivery.';
            case 'endurance':
                return 'Rapid glycogen resynthesis - carbs within 30min restore 2x faster.';
            case 'fat_loss':
                return 'High protein preserves muscle, moderate carbs support recovery without excess.';
            default:
                return 'Optimize recovery with targeted post-workout nutrition.';
        }
    }

    private formatSessionType(type: string): string {
        return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
    }

    private formatTime(date: Date): string {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
}

// =====================================================
// SINGLETON INSTANCE
// =====================================================

export const sessionFuelEngine = new SessionFuelProtocolEngine();

// =====================================================
// CONVENIENCE FUNCTIONS
// =====================================================

/**
 * Quick access to generate fuel windows for sessions
 */
export const generateFuelWindows = (
    sessions: Session[],
    goal: GoalType,
    weight_kg: number
): DayFuelProtocol => {
    sessionFuelEngine.configure({ goal, weight_kg });
    return sessionFuelEngine.generateDayProtocol(sessions);
};

/**
 * Get the most urgent fuel action for Command tab
 */
export const getUrgentSessionFuel = (
    sessions: Session[],
    goal: GoalType,
    weight_kg: number
): FuelWindow | null => {
    sessionFuelEngine.configure({ goal, weight_kg });
    return sessionFuelEngine.getUrgentFuelAction(sessions);
};
