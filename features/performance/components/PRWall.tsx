import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Minus, Plus, Medal, Star } from 'lucide-react';
import { GlassCard, Button, cn } from '../../../components/ui';
import { PersonalRecord, PRCategory } from '../types/prTypes';

interface PRWallProps {
    records: PersonalRecord[];
    onAddNew: () => void;
}

const CATEGORY_COLORS: Record<PRCategory, string> = {
    running: 'border-cyan-500/30 bg-cyan-500/5',
    cycling: 'border-orange-500/30 bg-orange-500/5',
    swimming: 'border-blue-500/30 bg-blue-500/5',
    strength: 'border-red-500/30 bg-red-500/5',
    power: 'border-yellow-500/30 bg-yellow-500/5',
    recovery: 'border-green-500/30 bg-green-500/5',
    custom: 'border-purple-500/30 bg-purple-500/5',
};

const TrendIcon = ({ trend }: { trend: PersonalRecord['trend'] }) => {
    if (trend === 'improving') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend === 'declining') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-white/40" />;
};

const PRCard = ({ pr }: { pr: PersonalRecord }) => {
    const daysSince = Math.floor((Date.now() - new Date(pr.date).getTime()) / (1000 * 60 * 60 * 24));
    const isRecent = daysSince < 30;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "relative p-4 rounded-xl border transition-all hover:scale-[1.02]",
                CATEGORY_COLORS[pr.category],
                isRecent && "ring-2 ring-yellow-500/30"
            )}
        >
            {/* Recent Badge */}
            {isRecent && (
                <div className="absolute -top-2 -right-2 bg-yellow-500 text-yellow-950 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" /> NEW
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{pr.category}</div>
                    <div className="font-bold text-white">{pr.name}</div>
                </div>
                <TrendIcon trend={pr.trend} />
            </div>

            {/* Value */}
            <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-black text-white">{pr.value}</span>
                <span className="text-sm text-white/50 font-mono">{pr.unit}</span>
            </div>

            {/* Meta */}
            <div className="flex items-center justify-between text-[10px] text-white/40">
                <span>{new Date(pr.date).toLocaleDateString()}</span>
                <span>{daysSince === 0 ? 'Today' : `${daysSince}d ago`}</span>
            </div>

            {/* Previous Best (if exists) */}
            {pr.previousBest && (
                <div className="mt-2 pt-2 border-t border-white/10 text-xs text-white/40">
                    Previous: {pr.previousBest} {pr.unit}
                    <span className="text-green-400 ml-2">
                        (+{((pr.value - pr.previousBest) / pr.previousBest * 100).toFixed(1)}%)
                    </span>
                </div>
            )}
        </motion.div>
    );
};

export const PRWall: React.FC<PRWallProps> = ({ records, onAddNew }) => {
    const [filter, setFilter] = useState<PRCategory | 'all'>('all');

    const filteredRecords = filter === 'all'
        ? records
        : records.filter(r => r.category === filter);

    const categories = ['all', ...new Set(records.map(r => r.category))] as (PRCategory | 'all')[];

    return (
        <GlassCard className="mb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-500/20">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">Personal Records</h3>
                        <p className="text-xs text-muted-foreground">{records.length} records tracked</p>
                    </div>
                </div>
                <Button size="sm" variant="outline" onClick={onAddNew} className="gap-2">
                    <Plus className="w-4 h-4" /> Add PR
                </Button>
            </div>

            {/* Category Filter */}
            {records.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={cn(
                                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all",
                                filter === cat
                                    ? "bg-white text-black"
                                    : "bg-white/5 text-white/60 hover:bg-white/10"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {/* Records Grid */}
            {filteredRecords.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredRecords.map((pr) => (
                        <PRCard key={pr.id} pr={pr} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                    <Trophy className="w-12 h-12 text-white/10 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No personal records yet</p>
                    <Button size="sm" onClick={onAddNew}>Log Your First PR</Button>
                </div>
            )}
        </GlassCard>
    );
};
