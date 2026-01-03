
import { ScheduleArchetype, Session } from "../types";

export class ScheduleGenerator {
    static generate(type: ScheduleArchetype): Session[][] {
        const schedule: Session[][] = [];
        for (let i = 0; i < 10; i++) {
            schedule.push(this.generateDay(i, type));
        }
        return schedule;
    }

    private static generateDay(day: number, type: ScheduleArchetype): Session[] {
        const sessions: Session[] = [];
        const isRest = type === 'shock' ? day % 4 === 3 : day % 3 === 2;
        
        if (!isRest) {
            sessions.push(this.createSession(day, 'mobility', 'Morning Flow', 'Activation', 'low', '08:00'));
            sessions.push(this.createSession(day, 'sport', 'Main Session', 'Primary stimulus', type === 'shock' ? 'high' : 'medium', '16:00'));
        } else {
            sessions.push(this.createSession(day, 'recovery', 'Active Recovery', 'Flush', 'low', '10:00'));
        }
        return sessions;
    }

    private static createSession(day: number, type: any, title: string, desc: string, intensity: any, time: string): Session {
        return {
            id: `sim-day-${day}-${Math.random()}`,
            type,
            title,
            description: desc,
            intensity,
            duration_minutes: 60,
            mandatory: true,
            completed: false,
            time_of_day: time,
            sequence_block: parseInt(time) < 12 ? "morning" : "afternoon"
        };
    }
}
