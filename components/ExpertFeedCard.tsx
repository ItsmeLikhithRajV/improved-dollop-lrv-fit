/**
 * EXPERT FEED CARD
 * A dynamic, context-aware card from an Expert.
 * Each expert has a distinct visual identity.
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
    Utensils, Heart, Brain, Dumbbell, Moon, FlaskConical,
    AlertTriangle, Clock, ArrowRight, Sparkles
} from 'lucide-react';

export type ExpertId = 'nutritionist' | 'recovery' | 'mind' | 'performance' | 'longevity' | 'doctor';

interface ExpertFeedCardProps {
    /** Which expert is speaking */
    expert: ExpertId;
    /** Main message/insight */
    message: string;
    /** Urgency level (0-100) affects styling */
    urgency: number;
    /** Optional action the user can take */
    action?: {
        label: string;
        onClick: () => void;
    };
    /** When this insight was generated */
    timestamp?: Date;
    /** Optional sub-insight or reasoning */
    reason?: string;
}

const EXPERT_CONFIGS: Record<ExpertId, {
    name: string;
    Icon: React.ElementType;
    color: string;
    gradient: string;
    bgGlow: string;
}> = {
    nutritionist: {
        name: 'Nutritionist',
        Icon: Utensils,
        color: 'hsl(35, 100%, 55%)',
        gradient: 'from-amber-500/20 to-orange-500/10',
        bgGlow: 'hsla(35, 100%, 55%, 0.1)',
    },
    recovery: {
        name: 'Recovery',
        Icon: Heart,
        color: 'hsl(0, 80%, 60%)',
        gradient: 'from-red-500/20 to-rose-500/10',
        bgGlow: 'hsla(0, 80%, 60%, 0.1)',
    },
    mind: {
        name: 'Mind',
        Icon: Brain,
        color: 'hsl(280, 80%, 60%)',
        gradient: 'from-purple-500/20 to-violet-500/10',
        bgGlow: 'hsla(280, 80%, 60%, 0.1)',
    },
    performance: {
        name: 'Performance',
        Icon: Dumbbell,
        color: 'hsl(160, 100%, 45%)',
        gradient: 'from-emerald-500/20 to-green-500/10',
        bgGlow: 'hsla(160, 100%, 45%, 0.1)',
    },
    longevity: {
        name: 'Longevity',
        Icon: FlaskConical,
        color: 'hsl(200, 100%, 50%)',
        gradient: 'from-cyan-500/20 to-blue-500/10',
        bgGlow: 'hsla(200, 100%, 50%, 0.1)',
    },
    doctor: {
        name: 'Doctor',
        Icon: Sparkles,
        color: 'hsl(180, 100%, 50%)',
        gradient: 'from-teal-500/20 to-cyan-500/10',
        bgGlow: 'hsla(180, 100%, 50%, 0.1)',
    },
};

export const ExpertFeedCard: React.FC<ExpertFeedCardProps> = ({
    expert,
    message,
    urgency,
    action,
    timestamp,
    reason,
}) => {
    const config = EXPERT_CONFIGS[expert];
    const Icon = config.Icon;

    // High urgency = more prominent styling
    const isUrgent = urgency > 70;
    const isCritical = urgency > 85;

    return (
        <motion.div
            className={`relative overflow-hidden rounded-xl glass-tier-2 p-4 border-l-4`}
            style={{
                borderLeftColor: config.color,
                background: isCritical ? config.bgGlow : undefined,
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.01, x: 5 }}
            transition={{ duration: 0.2 }}
        >
            {/* Urgent Pulse Effect */}
            {isUrgent && (
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: `radial-gradient(circle at left, ${config.bgGlow}, transparent 50%)`,
                    }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            )}

            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
                <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${config.color}20` }}
                >
                    <Icon className="w-4 h-4" style={{ color: config.color }} />
                </div>
                <div className="flex-1">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">
                        {config.name}
                    </span>
                    {timestamp && (
                        <span className="text-[10px] text-muted-foreground/60 ml-2">
                            <Clock className="w-2 h-2 inline-block mr-0.5" />
                            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                </div>
                {isUrgent && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20">
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                        <span className="text-[10px] text-red-400 uppercase">Urgent</span>
                    </div>
                )}
            </div>

            {/* Message */}
            <p className="text-sm text-foreground leading-relaxed mb-2">
                {message}
            </p>

            {/* Reason (if provided) */}
            {reason && (
                <p className="text-xs text-muted-foreground mb-3 italic">
                    "{reason}"
                </p>
            )}

            {/* Action Button */}
            {action && (
                <motion.button
                    className="flex items-center gap-2 text-sm font-medium press-effect hover-glow px-3 py-1.5 rounded-lg glass-tier-3"
                    style={{ color: config.color }}
                    onClick={action.onClick}
                    whileHover={{ x: 3 }}
                >
                    {action.label}
                    <ArrowRight className="w-4 h-4" />
                </motion.button>
            )}

            {/* Urgency Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
                <motion.div
                    className="h-full"
                    style={{ backgroundColor: config.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${urgency}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>
        </motion.div>
    );
};

export default ExpertFeedCard;
