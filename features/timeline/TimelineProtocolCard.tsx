
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, Button, Badge, cn } from '../../components/ui';
import {
    Clock, Flame, Brain, Check, ChevronRight, Activity,
    Moon, Zap, Utensils, Thermometer, Dumbbell, Wind,
    RotateCcw, HeartPulse, Info, Edit2, X, Microscope, ArrowRight
} from 'lucide-react';
import { TimelineProtocol, ProtocolFeedback } from '../../types';

interface Props {
    protocol: TimelineProtocol;
    onComplete: (feedback: ProtocolFeedback) => void;
    onEdit?: () => void;
}

export const TimelineProtocolCard: React.FC<Props> = ({ protocol, onComplete, onEdit }) => {
    const [showIntel, setShowIntel] = useState(false);

    // --- STYLE MAPPING (Matching TimelineSessionCard Logic) ---
    const getCardStyles = (type: string, priority: string) => {
        // Base colors for border/bg logic
        let color = "hsl(var(--primary))"; // Default

        switch (type) {
            case 'training': color = "hsl(180, 100%, 50%)"; break; // Cyan
            case 'fuel': color = "hsl(45, 100%, 55%)"; break; // Amber
            case 'recovery': color = "hsl(140, 70%, 50%)"; break; // Green
            case 'mindspace': color = "hsl(270, 70%, 60%)"; break; // Purple
            case 'sleep': color = "hsl(220, 80%, 60%)"; break; // Indigo
            default: color = "hsl(var(--primary))";
        }

        if (priority === 'critical') color = "hsl(0, 80%, 60%)"; // Red override

        return {
            borderColor: color,
            iconColor: color,
            bgTint: `${color}15` // 5-10% opacity hex approximation
        };
    };

    const getIcon = (iconName: string, className?: string) => {
        const props = { className: className || "w-5 h-5" };
        switch (iconName) {
            case 'Flame': return <Flame {...props} />;
            case 'Brain': return <Brain {...props} />;
            case 'Moon': return <Moon {...props} />;
            case 'Zap': return <Zap {...props} />;
            case 'Utensils': return <Utensils {...props} />;
            case 'Thermometer': return <Thermometer {...props} />;
            case 'Dumbbell': return <Dumbbell {...props} />;
            case 'RotateCcw': return <RotateCcw {...props} />;
            case 'Activity': return <Activity {...props} />;
            case 'AlertTriangle': return <Info {...props} />;
            default: return <Activity {...props} />;
        }
    };

    const { borderColor, iconColor, bgTint } = getCardStyles(protocol.category, protocol.priority);
    const isCritical = protocol.priority === 'critical';
    const isTraining = protocol.category === 'training';

    // Union type guards/defaults
    const icon = 'icon' in protocol ? protocol.icon : 'Activity';
    const description = 'description' in protocol ? protocol.description : protocol.title;
    const rationaleObj = typeof protocol.rationale === 'object' ? protocol.rationale : {
        primary_reason: protocol.rationale,
        supporting_signals: [],
        science_brief: 'Adaptive recommendation based on current state.',
        impact_summary: 'Optimizes daily flow.'
    };
    const specifics = 'specifics' in protocol ? protocol.specifics : {};

    return (
        <>
            {/* CARD DESIGN - REPLICATED FROM TimelineSessionCard */}
            <motion.div
                onClick={() => setShowIntel(true)}
                className={cn(
                    "glass rounded-lg p-4 border-l-4 relative overflow-hidden cursor-pointer group transition-all mb-3",
                    isCritical && "border-red-500/50"
                )}
                style={{ borderLeftColor: isCritical ? "#ef4444" : borderColor }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.01, x: 4, backgroundColor: "hsla(180, 50%, 90%, 0.1)" }}
            >
                {/* Ambient Background Tint */}
                <div className="absolute inset-0 opacity-5" style={{ background: borderColor }} />

                {/* Pulse Effect for Critical Items */}
                {isCritical && (<div className="absolute inset-0 opacity-10 animate-pulse bg-red-500" />)}

                <div className="relative z-10">
                    {/* Header Row: Time & Badges */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                                {protocol.time_of_day}
                            </span>

                            {/* Type Badge */}
                            <Badge className="bg-white/5 text-muted-foreground border-white/10 text-[9px] py-0">
                                {protocol.category.toUpperCase()}
                            </Badge>

                            {/* Critical Badge */}
                            {isCritical && (
                                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 flex items-center gap-1 text-[9px] py-0">
                                    MANDATORY
                                </Badge>
                            )}
                        </div>
                        {/* Duration Badge */}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider font-mono">
                            {protocol.duration_minutes}m
                        </span>
                    </div>

                    {/* Content Row: Icon, Title, Description */}
                    <div className="flex items-start gap-3">
                        {/* Icon Box */}
                        <div
                            className="p-2 rounded-lg"
                            style={{ background: bgTint }}
                        >
                            {getIcon(icon, `w-5 h-5`)}
                        </div>

                        {/* Text Block */}
                        <div className="flex-1">
                            <div className="font-semibold text-foreground">{protocol.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                                {description}
                            </div>
                        </div>

                        {/* Action Arrow */}
                        <div className="flex flex-col gap-2 items-end">
                            <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* DETAILED INTEL POPUP (Modal Overlay) */}
            <AnimatePresence>
                {showIntel && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-lg glass-heavy border-t-4 rounded-xl overflow-hidden shadow-2xl relative"
                            style={{ borderTopColor: borderColor }}
                        >
                            {/* Background Noise */}
                            <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none" />

                            {/* Modal Header */}
                            <div className="p-6 border-b border-white/5 relative z-10 flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className="p-3 rounded-lg border" style={{ backgroundColor: bgTint, borderColor: `${borderColor}30` }}>
                                        {getIcon(icon, "w-6 h-6")}
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Protocol Intelligence</div>
                                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">{protocol.title}</h2>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge className="bg-white/5 border-white/10 text-white/60">{protocol.category}</Badge>
                                            <Badge className="bg-white/5 border-white/10 text-white/60 font-mono">{protocol.duration_minutes} min</Badge>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setShowIntel(false)} className="text-white/40 hover:text-white transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Deep Explanation Content */}
                            <div className="p-6 space-y-6 relative z-10 overflow-y-auto max-h-[60vh]">

                                {/* Primary Rationale */}
                                <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                                        <Activity className="w-3 h-3 text-cyan-400" /> Strategic Objective
                                    </div>
                                    <p className="text-sm font-medium text-white/90 leading-relaxed">
                                        {rationaleObj.primary_reason}
                                    </p>
                                </div>

                                {/* Science & Impact Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                                            <Microscope className="w-3 h-3" /> Mechanism
                                        </div>
                                        <p className="text-xs text-white/70 leading-relaxed">
                                            {rationaleObj.science_brief}
                                        </p>
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                                            <Zap className="w-3 h-3" /> System Impact
                                        </div>
                                        <p className="text-xs text-white/70 leading-relaxed">
                                            {rationaleObj.impact_summary}
                                        </p>
                                    </div>
                                </div>

                                {/* Specifics / Macros */}
                                {specifics.fuel && (
                                    <div className="bg-black/40 rounded-lg p-4 border border-white/10">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Macro Targets</div>
                                            <div className="flex gap-3 text-xs font-mono">
                                                <span className="text-orange-400">CHO: {specifics.fuel.macros.carbs}g</span>
                                                <span className="text-blue-400">PRO: {specifics.fuel.macros.protein}g</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {specifics.fuel.suggestions.map((s, i) => (
                                                <span key={i} className="text-[10px] px-2 py-1 rounded bg-white/5 border border-white/10 text-white/60">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Session Edit (If applicable) */}
                                {isTraining && onEdit && (
                                    <div className="flex justify-end pt-4 border-t border-white/5">
                                        <Button variant="outline" size="sm" onClick={() => { setShowIntel(false); onEdit(); }}>
                                            <Edit2 className="w-3 h-3 mr-2" /> Modify Session Parameters
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 bg-black/40 border-t border-white/10 flex gap-3">
                                <Button
                                    className="flex-1 h-12 font-bold uppercase tracking-wider text-black"
                                    style={{ backgroundColor: borderColor }}
                                    onClick={() => { setShowIntel(false); onComplete({ protocol_id: protocol.id, completed: true, timestamp: new Date().toISOString(), perceived_impact: 8 }); }}
                                >
                                    Mark Complete
                                </Button>
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
