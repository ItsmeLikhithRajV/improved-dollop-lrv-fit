/**
 * NavigationCard Component
 * 
 * Simple card that links to a full-screen view.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn } from '../ui';

export interface NavigationCardProps {
    icon?: React.ReactNode;
    title: string;
    subtitle?: string;
    onClick: () => void;
    className?: string;
}

export const NavigationCard: React.FC<NavigationCardProps> = ({
    icon,
    title,
    subtitle,
    onClick,
    className
}) => {
    return (
        <motion.button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl",
                "bg-white/[0.03] border border-white/[0.08]",
                "hover:bg-white/[0.06] hover:border-white/[0.12]",
                "transition-all duration-200",
                "text-left group",
                className
            )}
            whileTap={{ scale: 0.99 }}
        >
            {/* Icon */}
            {icon && (
                <div className="flex-shrink-0 p-2 rounded-xl bg-white/5 text-white/60">
                    {icon}
                </div>
            )}

            {/* Text */}
            <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white">{title}</div>
                {subtitle && (
                    <div className="text-xs text-white/40 mt-0.5">{subtitle}</div>
                )}
            </div>

            {/* Arrow */}
            <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
        </motion.button>
    );
};

export default NavigationCard;
