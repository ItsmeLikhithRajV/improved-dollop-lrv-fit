import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Flame, Heart, Dumbbell } from 'lucide-react';
import { GlassCard, cn } from '../../../components/ui';
import { HeatmapDay } from '../types/prTypes';

interface TrainingHeatmapProps {
    data: HeatmapDay[];
    weeks?: number;
}

const INTENSITY_COLORS = {
    none: 'bg-white/5',
    low: 'bg-green-500/60',
    medium: 'bg-orange-500/60',
    high: 'bg-red-500/80',
    missed: 'bg-white/10 border border-dashed border-white/20',
};

const DOMAIN_ICONS = {
    strength: Dumbbell,
    cardio: Flame,
    recovery: Heart,
    mixed: Calendar,
};

const DayCell = ({ day, index }: { day: HeatmapDay | null; index: number }) => {
    if (!day) {
        return <div className="w-3 h-3 rounded-sm bg-white/5" />;
    }

    const DomainIcon = day.domain ? DOMAIN_ICONS[day.domain] : null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.002 }}
            className={cn(
                "w-3 h-3 rounded-sm cursor-pointer transition-all hover:scale-150 hover:ring-2 hover:ring-white/50 relative group",
                INTENSITY_COLORS[day.intensity]
            )}
            title={`${day.date}: ${day.intensity} intensity${day.domain ? ` (${day.domain})` : ''}`}
        >
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none z-50">
                <div className="bg-black/90 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap border border-white/10">
                    <div className="font-bold">{new Date(day.date).toLocaleDateString()}</div>
                    <div className="text-white/60 capitalize">{day.intensity} • {day.domain || 'Rest'}</div>
                    {day.rpe && <div className="text-white/60">RPE: {day.rpe}</div>}
                </div>
            </div>
        </motion.div>
    );
};

export const TrainingHeatmap: React.FC<TrainingHeatmapProps> = ({ data, weeks = 12 }) => {
    // Generate grid data (7 rows x N weeks)
    const gridData = useMemo(() => {
        const today = new Date();
        const days = weeks * 7;
        const grid: (HeatmapDay | null)[][] = Array.from({ length: 7 }, () => []);

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayOfWeek = date.getDay();

            const dataPoint = data.find(d => d.date === dateStr) || null;
            grid[dayOfWeek].push(dataPoint);
        }

        return grid;
    }, [data, weeks]);

    // Calculate stats
    const stats = useMemo(() => {
        const completed = data.filter(d => d.intensity !== 'none' && d.intensity !== 'missed').length;
        const missed = data.filter(d => d.intensity === 'missed').length;
        const highIntensity = data.filter(d => d.intensity === 'high').length;
        const streak = calculateStreak(data);
        return { completed, missed, highIntensity, streak };
    }, [data]);

    return (
        <GlassCard className="mb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/20">
                        <Calendar className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">Training Activity</h3>
                        <p className="text-xs text-muted-foreground">Last {weeks} weeks</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex gap-4">
                    <div className="text-center">
                        <div className="text-xl font-bold text-white">{stats.completed}</div>
                        <div className="text-[9px] uppercase text-muted-foreground">Sessions</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-orange-400">{stats.highIntensity}</div>
                        <div className="text-[9px] uppercase text-muted-foreground">High Int.</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-green-400">{stats.streak}</div>
                        <div className="text-[9px] uppercase text-muted-foreground">Streak</div>
                    </div>
                </div>
            </div>

            {/* Heatmap Grid */}
            <div className="overflow-x-auto pb-2">
                <div className="flex gap-1">
                    {/* Day Labels */}
                    <div className="flex flex-col gap-1 mr-2 text-[9px] text-muted-foreground justify-between py-0.5">
                        <span>Sun</span>
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                    </div>

                    {/* Grid */}
                    <div className="flex">
                        {Array.from({ length: weeks }).map((_, weekIdx) => (
                            <div key={weekIdx} className="flex flex-col gap-1">
                                {gridData.map((row, dayIdx) => (
                                    <DayCell
                                        key={`${weekIdx}-${dayIdx}`}
                                        day={row[weekIdx]}
                                        index={weekIdx * 7 + dayIdx}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-4 text-[10px]">
                    <span className="text-muted-foreground">Intensity:</span>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-sm bg-white/5" />
                        <span className="text-muted-foreground">Rest</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-sm bg-green-500/60" />
                        <span className="text-muted-foreground">Low</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-sm bg-orange-500/60" />
                        <span className="text-muted-foreground">Med</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-sm bg-red-500/80" />
                        <span className="text-muted-foreground">High</span>
                    </div>
                </div>
                <div className="text-[10px] text-muted-foreground">
                    ⚫ = Missed planned session
                </div>
            </div>
        </GlassCard>
    );
};

// Helper function to calculate current streak
function calculateStreak(data: HeatmapDay[]): number {
    const sorted = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let streak = 0;
    for (const day of sorted) {
        if (day.intensity !== 'none' && day.intensity !== 'missed') {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}
