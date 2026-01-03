import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Lightbulb, TrendingUp, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import { GlassCard } from './ui';
import { useSentient } from '../store/SentientContext';
import { AgentOrchestrator } from '../services/agents/AgentOrchestrator';
import { LearningEngine } from '../experts/orchestrator/learningEngine';
import { AgentResult } from '../services/agents/types';

interface SentientInsight {
    id: string;
    type: 'pattern' | 'correlation' | 'warning' | 'optimization' | 'discovery';
    title: string;
    description: string;
    confidence: number;
    source: string;
    timestamp: number;
    actionable?: string;
}

const INSIGHT_ICONS = {
    pattern: TrendingUp,
    correlation: Sparkles,
    warning: AlertTriangle,
    optimization: RefreshCw,
    discovery: Lightbulb
};

const INSIGHT_COLORS = {
    pattern: 'text-purple-400 bg-purple-400/10',
    correlation: 'text-cyan-400 bg-cyan-400/10',
    warning: 'text-yellow-400 bg-yellow-400/10',
    optimization: 'text-green-400 bg-green-400/10',
    discovery: 'text-pink-400 bg-pink-400/10'
};

export const SentientInsightsCard: React.FC = () => {
    const { state, dispatch } = useSentient();
    const [insights, setInsights] = useState<SentientInsight[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [lastRunTime, setLastRunTime] = useState<number | null>(null);

    // Generate insights from notifications that agents have created
    const agentInsights = useMemo(() => {
        const results: SentientInsight[] = [];

        // Convert agent-generated notifications to insights
        state.notifications
            .filter(n => n.id.includes('alchemist') || n.id.includes('researcher') || n.id.includes('analyst'))
            .slice(-5)
            .forEach(n => {
                results.push({
                    id: n.id,
                    type: n.type === 'warning' ? 'warning' : 'discovery',
                    title: n.title,
                    description: n.message,
                    confidence: 0.85,
                    source: n.id.split('-')[0],
                    timestamp: n.timestamp,
                    actionable: n.action_label
                });
            });

        return results;
    }, [state.notifications]);

    // Run agents periodically or on demand
    const runAgentAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            const results = await AgentOrchestrator.runAgents(
                state,
                [], // History would come from historyStore
                dispatch
            );

            // Convert agent results to insights
            const newInsights: SentientInsight[] = results.map((r: AgentResult) => ({
                id: `insight_${r.agentId}_${Date.now()}`,
                type: r.agentId === 'researcher' ? 'warning' :
                    r.agentId === 'alchemist' ? 'correlation' :
                        r.agentId === 'analyst' ? 'optimization' : 'pattern',
                title: `${r.agentId.charAt(0).toUpperCase() + r.agentId.slice(1)} Insight`,
                description: r.actionsTaken.join('. '),
                confidence: 0.8,
                source: r.agentId,
                timestamp: Date.now()
            }));

            if (newInsights.length > 0) {
                setInsights(prev => [...newInsights, ...prev].slice(0, 5));
            }
            setLastRunTime(Date.now());
        } catch (e) {
            console.error('Agent analysis failed:', e);
        }
        setIsAnalyzing(false);
    };

    // Auto-run on mount
    useEffect(() => {
        // Delay initial run to not block UI
        const timer = setTimeout(() => {
            runAgentAnalysis();
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    // Combine agent insights with notification-based insights
    const allInsights = useMemo(() => {
        const combined = [...insights, ...agentInsights];
        // Dedupe by id
        const seen = new Set<string>();
        return combined.filter(i => {
            if (seen.has(i.id)) return false;
            seen.add(i.id);
            return true;
        }).slice(0, 5);
    }, [insights, agentInsights]);

    if (allInsights.length === 0 && !isAnalyzing) {
        return null; // Don't show empty card
    }

    return (
        <GlassCard className="relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    <span className="text-sm font-semibold">Sentient Insights</span>
                </div>
                <motion.button
                    onClick={runAgentAnalysis}
                    disabled={isAnalyzing}
                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <RefreshCw className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    {isAnalyzing ? 'Analyzing...' : 'Refresh'}
                </motion.button>
            </div>

            <AnimatePresence mode="popLayout">
                {allInsights.map((insight, i) => {
                    const Icon = INSIGHT_ICONS[insight.type];
                    const colorClass = INSIGHT_COLORS[insight.type];

                    return (
                        <motion.div
                            key={insight.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: i * 0.05 }}
                            className="mb-3 last:mb-0"
                        >
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                <div className={`p-2 rounded-lg ${colorClass}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium truncate">{insight.title}</span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {Math.round(insight.confidence * 100)}% confident
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {insight.description}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] text-muted-foreground">
                                            via {insight.source}
                                        </span>
                                        {insight.actionable && (
                                            <button className="text-[10px] text-primary hover:underline">
                                                {insight.actionable}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {lastRunTime && (
                <div className="text-[10px] text-muted-foreground mt-3 text-center">
                    Last analysis: {new Date(lastRunTime).toLocaleTimeString()}
                </div>
            )}
        </GlassCard>
    );
};

export default SentientInsightsCard;
