
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Sparkles, RefreshCw } from 'lucide-react';
import { GlassCard, Button, cn } from './ui';
import { WeeklyReport } from '../services/history/types';
import { generateWeeklyInsights } from '../experts/orchestrator/ai';
import { useSentient } from '../store/SentientContext';
import { getAverages } from '../services/history/historyStore';

interface WeeklyReportCardProps {
    className?: string;
}

export const WeeklyReportCard: React.FC<WeeklyReportCardProps> = ({ className }) => {
    const { history, state } = useSentient();
    const [report, setReport] = useState<{
        summary: string;
        patterns: string[];
        recommendations: string[];
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [weeklyStats, setWeeklyStats] = useState<Record<string, number>>({});

    // Calculate weekly stats on mount
    useEffect(() => {
        const stats = getAverages(7);
        setWeeklyStats(stats);
    }, [history]);

    const handleGenerateInsights = async () => {
        setIsLoading(true);
        try {
            const insights = await generateWeeklyInsights(history, state.user_profile);
            setReport(insights);
        } catch (error) {
            console.error('Failed to generate insights:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getTrendIcon = (metric: string) => {
        // Compare current to 7-day average
        const current = state.mindspace.readiness_score;
        const avg = weeklyStats.readiness || current;
        const diff = current - avg;

        if (diff > 5) return <TrendingUp className="w-4 h-4 text-green-400" />;
        if (diff < -5) return <TrendingDown className="w-4 h-4 text-red-400" />;
        return <Minus className="w-4 h-4 text-yellow-400" />;
    };

    return (
        <GlassCard className={cn("p-6", className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                        <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Weekly Insights</h3>
                        <p className="text-xs text-muted-foreground">Last 7 days</p>
                    </div>
                </div>
                {getTrendIcon('readiness')}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                        {weeklyStats.readiness || '--'}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Avg Readiness
                    </div>
                </div>
                <div className="text-center border-x border-white/10">
                    <div className="text-2xl font-bold text-green-400">
                        {weeklyStats.sleep_duration || '--'}h
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Avg Sleep
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                        {weeklyStats.fuel_score || '--'}%
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Avg Fuel
                    </div>
                </div>
            </div>

            {/* AI Insights Section */}
            {!report ? (
                <Button
                    onClick={handleGenerateInsights}
                    disabled={isLoading}
                    className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
                >
                    {isLoading ? (
                        <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate AI Insights
                        </>
                    )}
                </Button>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    {/* Summary */}
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-sm text-white/90 leading-relaxed">
                            {report.summary}
                        </p>
                    </div>

                    {/* Patterns */}
                    {report.patterns.length > 0 && (
                        <div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                                Patterns Detected
                            </div>
                            <div className="space-y-2">
                                {report.patterns.map((pattern, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm text-white/70">
                                        <span className="text-primary">•</span>
                                        {pattern}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommendations */}
                    {report.recommendations.length > 0 && (
                        <div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                                Recommendations
                            </div>
                            <div className="space-y-2">
                                {report.recommendations.map((rec, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm text-white/70">
                                        <span className="text-green-400">→</span>
                                        {rec}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Refresh Button */}
                    <Button
                        onClick={handleGenerateInsights}
                        disabled={isLoading}
                        variant="outline"
                        size="sm"
                        className="w-full"
                    >
                        <RefreshCw className={cn("w-3 h-3 mr-2", isLoading && "animate-spin")} />
                        Refresh Insights
                    </Button>
                </motion.div>
            )}
        </GlassCard>
    );
};
