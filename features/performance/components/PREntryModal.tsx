import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Plus, ChevronRight, Dumbbell, Timer, Bike, Heart } from 'lucide-react';
import { GlassCard, Button, cn } from '../../../components/ui';
import { PRCategory, PR_TEMPLATES, PersonalRecord } from '../types/prTypes';

interface PREntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (pr: Omit<PersonalRecord, 'id' | 'trend'>) => void;
}

const CATEGORY_ICONS: Record<PRCategory, any> = {
    running: Timer,
    cycling: Bike,
    swimming: Timer,
    strength: Dumbbell,
    power: Dumbbell,
    recovery: Heart,
    custom: Plus,
};

const CATEGORY_COLORS: Record<PRCategory, string> = {
    running: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
    cycling: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
    swimming: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    strength: 'text-red-400 bg-red-400/10 border-red-400/30',
    power: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    recovery: 'text-green-400 bg-green-400/10 border-green-400/30',
    custom: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
};

export const PREntryModal: React.FC<PREntryModalProps> = ({ isOpen, onClose, onSave }) => {
    const [step, setStep] = useState<'category' | 'type' | 'value'>('category');
    const [selectedCategory, setSelectedCategory] = useState<PRCategory | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<{ name: string; unit: string } | null>(null);
    const [value, setValue] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    const [customName, setCustomName] = useState('');
    const [customUnit, setCustomUnit] = useState('');

    const reset = () => {
        setStep('category');
        setSelectedCategory(null);
        setSelectedTemplate(null);
        setValue('');
        setDate(new Date().toISOString().split('T')[0]);
        setNotes('');
        setCustomName('');
        setCustomUnit('');
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleSave = () => {
        if (!selectedCategory) return;

        const prName = selectedCategory === 'custom' ? customName : selectedTemplate?.name || '';
        const prUnit = selectedCategory === 'custom' ? customUnit : selectedTemplate?.unit || '';

        if (!prName || !value) return;

        onSave({
            category: selectedCategory,
            name: prName,
            value: parseFloat(value),
            unit: prUnit,
            date,
            source: 'manual',
            conditions: notes ? { fresh: true, notes } : { fresh: true }
        });

        handleClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <GlassCard className="max-w-lg w-full relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-yellow-500/20">
                            <Trophy className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Log Personal Record</h2>
                            <p className="text-xs text-muted-foreground">
                                {step === 'category' && 'Select category'}
                                {step === 'type' && 'Select PR type'}
                                {step === 'value' && 'Enter your record'}
                            </p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {/* Step 1: Category Selection */}
                    {step === 'category' && (
                        <motion.div
                            key="category"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="grid grid-cols-2 gap-3"
                        >
                            {(Object.keys(PR_TEMPLATES) as PRCategory[]).map((cat) => {
                                const Icon = CATEGORY_ICONS[cat];
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => {
                                            setSelectedCategory(cat);
                                            setStep(cat === 'custom' ? 'value' : 'type');
                                        }}
                                        className={cn(
                                            "p-4 rounded-xl border text-left transition-all hover:scale-[1.02]",
                                            CATEGORY_COLORS[cat]
                                        )}
                                    >
                                        <Icon className="w-5 h-5 mb-2" />
                                        <div className="font-bold capitalize">{cat}</div>
                                        <div className="text-[10px] opacity-60">
                                            {PR_TEMPLATES[cat].length || 'Custom'} types
                                        </div>
                                    </button>
                                );
                            })}
                        </motion.div>
                    )}

                    {/* Step 2: Type Selection */}
                    {step === 'type' && selectedCategory && (
                        <motion.div
                            key="type"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-2 max-h-80 overflow-y-auto"
                        >
                            <button
                                onClick={() => setStep('category')}
                                className="text-xs text-muted-foreground hover:text-white flex items-center gap-1 mb-4"
                            >
                                ← Back to categories
                            </button>
                            {PR_TEMPLATES[selectedCategory].map((template) => (
                                <button
                                    key={template.name}
                                    onClick={() => {
                                        setSelectedTemplate(template);
                                        setStep('value');
                                    }}
                                    className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-all flex items-center justify-between"
                                >
                                    <div>
                                        <div className="font-bold text-white">{template.name}</div>
                                        <div className="text-xs text-muted-foreground">{template.description}</div>
                                    </div>
                                    <div className="text-xs text-white/40 font-mono">{template.unit}</div>
                                </button>
                            ))}
                        </motion.div>
                    )}

                    {/* Step 3: Value Entry */}
                    {step === 'value' && (
                        <motion.div
                            key="value"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            <button
                                onClick={() => setStep(selectedCategory === 'custom' ? 'category' : 'type')}
                                className="text-xs text-muted-foreground hover:text-white flex items-center gap-1 mb-4"
                            >
                                ← Back
                            </button>

                            {/* Custom Name/Unit (if custom category) */}
                            {selectedCategory === 'custom' && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-muted-foreground block mb-2">PR Name</label>
                                        <input
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-foreground"
                                            placeholder="e.g. Plank Hold"
                                            value={customName}
                                            onChange={(e) => setCustomName(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-muted-foreground block mb-2">Unit</label>
                                        <input
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-foreground"
                                            placeholder="e.g. seconds"
                                            value={customUnit}
                                            onChange={(e) => setCustomUnit(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Value Input */}
                            <div>
                                <label className="text-xs font-bold text-muted-foreground block mb-2">
                                    {selectedTemplate?.name || customName || 'Value'}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 text-foreground text-2xl font-bold text-center"
                                        placeholder="0"
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="px-4 flex items-center bg-white/5 border border-white/10 rounded-lg text-muted-foreground font-mono">
                                        {selectedTemplate?.unit || customUnit}
                                    </div>
                                </div>
                            </div>

                            {/* Date */}
                            <div>
                                <label className="text-xs font-bold text-muted-foreground block mb-2">Date Achieved</label>
                                <input
                                    type="date"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-foreground"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="text-xs font-bold text-muted-foreground block mb-2">Notes (optional)</label>
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-foreground"
                                    placeholder="e.g. After deload week, felt fresh"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            {/* Save Button */}
                            <Button className="w-full h-12 mt-4" onClick={handleSave}>
                                <Trophy className="w-4 h-4 mr-2" /> Save Personal Record
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </GlassCard>
        </div>
    );
};
