/**
 * DeepAnalyticsScreen Component
 * 
 * Full-screen analytics panel with:
 * - Tab navigation for different sections
 * - Scrollable content area
 * - Back button
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, BarChart2, Activity, Trophy, GitBranch } from 'lucide-react';
import { cn } from '../ui';

// =====================================================
// TYPES
// =====================================================

export interface AnalyticsTab {
    id: string;
    label: string;
    icon?: React.ReactNode;
    content: React.ReactNode;
}

export interface DeepAnalyticsScreenProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    tabs: AnalyticsTab[];
    defaultTab?: string;
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export const DeepAnalyticsScreen: React.FC<DeepAnalyticsScreenProps> = ({
    isOpen,
    onClose,
    title = 'Deep Analytics',
    tabs,
    defaultTab
}) => {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');

    const activeTabContent = tabs.find(t => t.id === activeTab)?.content;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl"
                >
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="absolute inset-0 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex-shrink-0 px-6 py-4 border-b border-white/10 bg-black/50 backdrop-blur-xl">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={onClose}
                                    className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    <span className="text-sm font-medium">Back</span>
                                </button>

                                <h2 className="text-lg font-bold text-white">{title}</h2>

                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-5 h-5 text-white/60" />
                                </button>
                            </div>

                            {/* Tabs */}
                            {tabs.length > 1 && (
                                <div className="flex gap-2 mt-4 overflow-x-auto pb-1 -mx-2 px-2">
                                    {tabs.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={cn(
                                                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                                                activeTab === tab.id
                                                    ? "bg-primary/20 text-primary border border-primary/30"
                                                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-transparent"
                                            )}
                                        >
                                            {tab.icon}
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-6 max-w-4xl mx-auto">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        {activeTabContent}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DeepAnalyticsScreen;
