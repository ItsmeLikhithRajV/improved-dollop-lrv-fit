/**
 * Access Check Popup Component
 * 
 * Dynamic popup that asks user if they have access to a recovery modality
 * right now. Supports:
 * - "Remember for today" option
 * - Fallback to alternatives when access denied
 * - Location context tracking
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, MapPin, Clock } from 'lucide-react';
import { RecoveryModality } from '../../experts/recovery/RecoveryModalityDatabase';
import { getAccessQuestion, findNextAlternative } from '../../experts/recovery/AdaptiveRecoveryEngine';
import { cn } from '../ui';

interface AccessCheckPopupProps {
    modality: RecoveryModality;
    onConfirmAccess: (hasAccess: boolean, rememberForToday: boolean) => void;
    onSelectAlternative?: (alternative: RecoveryModality) => void;
    onDismiss: () => void;
    deniedAccess?: string[];
}

export const AccessCheckPopup: React.FC<AccessCheckPopupProps> = ({
    modality,
    onConfirmAccess,
    onSelectAlternative,
    onDismiss,
    deniedAccess = []
}) => {
    const [rememberForToday, setRememberForToday] = useState(true);
    const [showAlternatives, setShowAlternatives] = useState(false);

    const accessQuestion = getAccessQuestion(modality);
    const alternative = findNextAlternative(modality.id, deniedAccess);

    const handleYes = useCallback(() => {
        onConfirmAccess(true, rememberForToday);
    }, [onConfirmAccess, rememberForToday]);

    const handleNo = useCallback(() => {
        if (alternative && onSelectAlternative) {
            setShowAlternatives(true);
        } else {
            onConfirmAccess(false, rememberForToday);
        }
    }, [alternative, onSelectAlternative, onConfirmAccess, rememberForToday]);

    const handleSelectAlternative = useCallback(() => {
        if (alternative && onSelectAlternative) {
            onSelectAlternative(alternative);
        }
    }, [alternative, onSelectAlternative]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onDismiss}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-sm w-full border border-white/10 shadow-2xl"
                    onClick={e => e.stopPropagation()}
                >
                    {!showAlternatives ? (
                        <>
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{modality.emoji}</span>
                                    <div>
                                        <h3 className="font-semibold text-white">{modality.name}</h3>
                                        <p className="text-xs text-white/50">Recommended</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onDismiss}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-white/50" />
                                </button>
                            </div>

                            {/* Question */}
                            <div className="bg-white/5 rounded-xl p-4 mb-4">
                                <p className="text-white text-center">
                                    {accessQuestion}
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 mb-4">
                                <button
                                    onClick={handleYes}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl font-medium transition-colors"
                                >
                                    <Check className="w-5 h-5" />
                                    Yes
                                </button>
                                <button
                                    onClick={handleNo}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-medium transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                    No
                                </button>
                            </div>

                            {/* Remember option */}
                            <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberForToday}
                                    onChange={e => setRememberForToday(e.target.checked)}
                                    className="w-4 h-4 rounded border-white/20 bg-white/10"
                                />
                                <Clock className="w-4 h-4" />
                                Remember for today
                            </label>
                        </>
                    ) : (
                        <>
                            {/* Alternative Suggestion */}
                            <div className="text-center mb-4">
                                <p className="text-white/60 text-sm mb-2">No access? Try this instead:</p>
                            </div>

                            {alternative && (
                                <div
                                    onClick={handleSelectAlternative}
                                    className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-white/10 rounded-xl p-4 cursor-pointer hover:border-cyan-500/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-3xl">{alternative.emoji}</span>
                                        <div>
                                            <h4 className="font-semibold text-white">{alternative.name}</h4>
                                            <p className="text-xs text-white/50">{alternative.duration_minutes} min</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-white/70">{alternative.description}</p>

                                    <button className="mt-3 w-full py-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-medium">
                                        Use This Instead
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={() => onConfirmAccess(false, rememberForToday)}
                                className="mt-4 w-full py-2 text-white/50 hover:text-white/70 text-sm"
                            >
                                Skip recovery for now
                            </button>
                        </>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// =====================================================
// LOCATION SELECTOR POPUP
// =====================================================

interface LocationSelectorProps {
    onSelectLocation: (location: 'home' | 'gym' | 'office' | 'travel' | 'other') => void;
    onDismiss: () => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
    onSelectLocation,
    onDismiss
}) => {
    const locations = [
        { id: 'home' as const, emoji: '🏠', label: 'Home' },
        { id: 'gym' as const, emoji: '🏋️', label: 'Gym' },
        { id: 'office' as const, emoji: '🏢', label: 'Office' },
        { id: 'travel' as const, emoji: '✈️', label: 'Traveling' },
        { id: 'other' as const, emoji: '📍', label: 'Other' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-sm w-full border border-white/10"
            >
                <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-semibold text-white">Where are you?</h3>
                </div>

                <p className="text-sm text-white/60 mb-4">
                    This helps us suggest recovery options you have access to right now.
                </p>

                <div className="grid grid-cols-2 gap-2">
                    {locations.map(loc => (
                        <button
                            key={loc.id}
                            onClick={() => onSelectLocation(loc.id)}
                            className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                        >
                            <span className="text-xl">{loc.emoji}</span>
                            <span className="text-sm text-white">{loc.label}</span>
                        </button>
                    ))}
                </div>

                <button
                    onClick={onDismiss}
                    className="mt-4 w-full py-2 text-white/50 hover:text-white/70 text-sm"
                >
                    Skip
                </button>
            </motion.div>
        </motion.div>
    );
};

export default AccessCheckPopup;
