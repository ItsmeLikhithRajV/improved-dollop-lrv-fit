/**
 * TargetAcquisitionModal - Set a competition or event goal
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Calendar, Flag, Trophy } from 'lucide-react';
import { GlassCard, cn, Button } from '../../../components/ui';

interface TargetAcquisitionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (target: {
        name: string;
        date: string;
        priority: 'A' | 'B' | 'C';
        start_date: string;
    }) => void;
    currentTarget?: {
        name: string;
        date: string;
        priority: 'A' | 'B' | 'C';
    } | null;
}

const EVENT_PRESETS = [
    { name: '5K Race', icon: '🏃' },
    { name: '10K Race', icon: '🏃' },
    { name: 'Half Marathon', icon: '🏃‍♂️' },
    { name: 'Marathon', icon: '🏃‍♀️' },
    { name: 'Triathlon', icon: '🏊' },
    { name: 'Cycling Event', icon: '🚴' },
    { name: 'CrossFit Competition', icon: '🏋️' },
    { name: 'Powerlifting Meet', icon: '💪' },
    { name: 'Football Match', icon: '⚽' },
    { name: 'Basketball Game', icon: '🏀' },
    { name: 'Tournament', icon: '🏆' },
    { name: 'Custom Event', icon: '🎯' },
];

export const TargetAcquisitionModal: React.FC<TargetAcquisitionModalProps> = ({
    isOpen,
    onClose,
    onSave,
    currentTarget
}) => {
    const [name, setName] = useState(currentTarget?.name || '');
    const [date, setDate] = useState(currentTarget?.date || '');
    const [priority, setPriority] = useState<'A' | 'B' | 'C'>(currentTarget?.priority || 'A');
    const [showPresets, setShowPresets] = useState(!currentTarget?.name);

    const handlePresetSelect = (preset: typeof EVENT_PRESETS[0]) => {
        setName(preset.name === 'Custom Event' ? '' : preset.name);
        setShowPresets(false);
    };

    const handleSubmit = () => {
        if (!name || !date) return;

        onSave({
            name,
            date,
            priority,
            start_date: new Date().toISOString().split('T')[0]
        });
    };

    const isValid = name.trim() && date;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="w-full max-w-md"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={e => e.stopPropagation()}
                >
                    <GlassCard className="relative overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-primary/20 border border-primary/30">
                                    <Target className="w-5 h-5 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold text-white">
                                    {currentTarget ? 'Edit Target' : 'Acquire Target'}
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5 text-white/60" />
                            </button>
                        </div>

                        {/* Presets */}
                        {showPresets && (
                            <div className="mb-6">
                                <div className="text-xs text-white/40 uppercase tracking-widest mb-3">
                                    Quick Select
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {EVENT_PRESETS.map(preset => (
                                        <button
                                            key={preset.name}
                                            onClick={() => handlePresetSelect(preset)}
                                            className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all text-center"
                                        >
                                            <div className="text-2xl mb-1">{preset.icon}</div>
                                            <div className="text-[10px] text-white/60 truncate">
                                                {preset.name}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Form */}
                        {!showPresets && (
                            <div className="space-y-4">
                                {/* Event Name */}
                                <div>
                                    <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">
                                        Event Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="e.g., City Marathon 2024"
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                    <button
                                        onClick={() => setShowPresets(true)}
                                        className="mt-2 text-xs text-primary hover:text-primary/80 transition-colors"
                                    >
                                        ← Choose from presets
                                    </button>
                                </div>

                                {/* Event Date */}
                                <div>
                                    <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">
                                        Event Date
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={e => setDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Priority */}
                                <div>
                                    <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">
                                        Priority
                                    </label>
                                    <div className="flex gap-2">
                                        {(['A', 'B', 'C'] as const).map(p => (
                                            <button
                                                key={p}
                                                onClick={() => setPriority(p)}
                                                className={cn(
                                                    "flex-1 py-3 rounded-xl border font-bold transition-all",
                                                    priority === p
                                                        ? p === 'A'
                                                            ? "bg-red-500/20 border-red-500/50 text-red-400"
                                                            : p === 'B'
                                                                ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                                                                : "bg-blue-500/20 border-blue-500/50 text-blue-400"
                                                        : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                                                )}
                                            >
                                                {p} {p === 'A' ? '(Main)' : p === 'B' ? '(Secondary)' : '(Fun)'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Submit */}
                                <button
                                    onClick={handleSubmit}
                                    disabled={!isValid}
                                    className={cn(
                                        "w-full py-4 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                                        isValid
                                            ? "bg-gradient-to-r from-primary to-cyan-500 text-primary-foreground hover:opacity-90"
                                            : "bg-white/5 text-white/30 cursor-not-allowed"
                                    )}
                                >
                                    <Flag className="w-4 h-4" />
                                    Lock In Target
                                </button>
                            </div>
                        )}

                        {/* Background decoration */}
                        <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                    </GlassCard>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default TargetAcquisitionModal;
