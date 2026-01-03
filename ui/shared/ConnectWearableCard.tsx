/**
 * Connect Wearable Card
 * 
 * Displayed when a feature requires wearable/biomarker data that isn't available.
 * Provides context-aware messaging and prompts users to connect their device.
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
    Watch, Heart, Dna, Flame, Brain, Activity,
    Link, ArrowRight
} from 'lucide-react';
import { GlassCard, Button, cn } from '../../components/ui';

// Domain configurations with contextual messaging
const DOMAIN_CONFIG = {
    recovery: {
        icon: Heart,
        title: 'Recovery Data Needed',
        message: 'Connect a wearable to track HRV, heart rate, and recovery metrics.',
        color: 'text-rose-400',
        gradient: 'from-rose-500/10 to-transparent',
        borderColor: 'border-rose-500/30'
    },
    longevity: {
        icon: Dna,
        title: 'Longevity Metrics Unavailable',
        message: 'Connect a wearable and/or upload biomarker data to calculate biological age.',
        color: 'text-purple-400',
        gradient: 'from-purple-500/10 to-transparent',
        borderColor: 'border-purple-500/30'
    },
    fuel: {
        icon: Flame,
        title: 'Nutrition Tracking Needed',
        message: 'Log meals or connect a CGM to track your fuel state.',
        color: 'text-orange-400',
        gradient: 'from-orange-500/10 to-transparent',
        borderColor: 'border-orange-500/30'
    },
    mindspace: {
        icon: Brain,
        title: 'Mental State Data Needed',
        message: 'Complete a check-in or connect HRV monitoring for stress analysis.',
        color: 'text-cyan-400',
        gradient: 'from-cyan-500/10 to-transparent',
        borderColor: 'border-cyan-500/30'
    },
    performance: {
        icon: Activity,
        title: 'Training Data Needed',
        message: 'Log sessions or connect a wearable to track performance metrics.',
        color: 'text-emerald-400',
        gradient: 'from-emerald-500/10 to-transparent',
        borderColor: 'border-emerald-500/30'
    },
    sleep: {
        icon: Watch,
        title: 'Sleep Data Needed',
        message: 'Connect a wearable that tracks sleep to see sleep analytics.',
        color: 'text-indigo-400',
        gradient: 'from-indigo-500/10 to-transparent',
        borderColor: 'border-indigo-500/30'
    }
} as const;

export type WearableDomain = keyof typeof DOMAIN_CONFIG;

interface ConnectWearableCardProps {
    domain: WearableDomain;
    compact?: boolean;
    onConnect?: () => void;
    className?: string;
    customMessage?: string;
}

export const ConnectWearableCard: React.FC<ConnectWearableCardProps> = ({
    domain,
    compact = false,
    onConnect,
    className,
    customMessage
}) => {
    const config = DOMAIN_CONFIG[domain];
    const Icon = config.icon;

    if (compact) {
        return (
            <div className={cn(
                "flex items-center gap-3 p-3 rounded-xl border border-dashed",
                config.borderColor,
                "bg-white/5",
                className
            )}>
                <Icon className={cn("w-5 h-5", config.color)} />
                <span className="text-sm text-white/60">
                    {customMessage || 'Data unavailable'}
                </span>
                <button
                    onClick={onConnect}
                    className={cn("ml-auto text-xs font-medium", config.color, "hover:underline")}
                >
                    Connect
                </button>
            </div>
        );
    }

    return (
        <GlassCard className={cn(
            "relative overflow-hidden border-dashed",
            config.borderColor,
            className
        )}>
            {/* Background gradient */}
            <div className={cn(
                "absolute inset-0 bg-gradient-to-br",
                config.gradient
            )} />

            <div className="relative z-10 p-6 text-center space-y-4">
                {/* Icon */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mx-auto w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"
                >
                    <Icon className={cn("w-8 h-8", config.color)} />
                </motion.div>

                {/* Content */}
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">
                        {config.title}
                    </h3>
                    <p className="text-sm text-white/60 max-w-xs mx-auto">
                        {customMessage || config.message}
                    </p>
                </div>

                {/* Action Button */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Button
                        onClick={onConnect}
                        className={cn(
                            "gap-2 bg-white/10 hover:bg-white/15 border",
                            config.borderColor
                        )}
                    >
                        <Link className="w-4 h-4" />
                        Connect Device
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </motion.div>

                {/* Skip option */}
                <p className="text-[10px] text-white/40 uppercase tracking-wider">
                    Or enter data manually in profile
                </p>
            </div>
        </GlassCard>
    );
};

/**
 * Inline placeholder for when a single metric is unavailable
 */
export const DataUnavailable: React.FC<{
    label?: string;
    className?: string;
}> = ({ label, className }) => (
    <div className={cn("text-center", className)}>
        <div className="text-3xl font-bold text-white/30">--</div>
        {label && <div className="text-xs text-white/40">{label}</div>}
    </div>
);

export default ConnectWearableCard;
