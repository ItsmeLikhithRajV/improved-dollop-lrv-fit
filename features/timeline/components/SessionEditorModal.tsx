
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Clock, Activity, Trash2, Save, X, 
    Dumbbell, Zap, Wind, RotateCcw, HeartPulse, Crosshair
} from 'lucide-react';
import { GlassCard, Button, cn } from '../../../components/ui';
import { Session } from '../../../types';

interface SessionEditorModalProps {
    session: Session;
    onSave: (id: string, updates: Partial<Session>) => void;
    onDelete: (id: string) => void;
    onClose: () => void;
}

export const SessionEditorModal: React.FC<SessionEditorModalProps> = ({ session, onSave, onDelete, onClose }) => {
    // Local State
    const [title, setTitle] = useState(session.title);
    const [time, setTime] = useState(session.time_of_day || "12:00");
    const [duration, setDuration] = useState(session.duration_minutes || 60);
    const [intensity, setIntensity] = useState(session.intensity);
    const [type, setType] = useState(session.type);
    
    // Type Options
    const typeOptions = [
        { id: 'sport', label: 'Sport', icon: Crosshair },
        { id: 'gym', label: 'Strength', icon: Dumbbell },
        { id: 'conditioning', label: 'Cardio', icon: Wind },
        { id: 'mobility', label: 'Mobility', icon: RotateCcw },
        { id: 'recovery', label: 'Recovery', icon: HeartPulse },
        { id: 'sprint', label: 'Speed', icon: Zap },
    ];

    const handleSave = () => {
        onSave(session.id, {
            title,
            time_of_day: time,
            duration_minutes: duration,
            intensity,
            type: type as any
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <GlassCard className="w-full max-w-md border-t-4 border-t-primary relative overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">Tactical Editor</div>
                        <h2 className="text-xl font-bold text-white">Modify Session</h2>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                    
                    {/* Title Input */}
                    <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Session Objective</label>
                        <input 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                            placeholder="e.g. Zone 2 Run"
                        />
                    </div>

                    {/* Time & Duration Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase mb-2 flex items-center gap-2">
                                <Clock className="w-3 h-3" /> Start Time
                            </label>
                            <input 
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase mb-2 flex items-center gap-2">
                                <Activity className="w-3 h-3" /> Duration (m)
                            </label>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setDuration(Math.max(15, duration - 15))} className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10">-</button>
                                <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 text-center text-white font-mono">
                                    {duration}
                                </div>
                                <button onClick={() => setDuration(duration + 15)} className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10">+</button>
                            </div>
                        </div>
                    </div>

                    {/* Intensity Selector */}
                    <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Planned Intensity</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['low', 'medium', 'high'].map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setIntensity(level as any)}
                                    className={cn(
                                        "py-2 rounded-lg text-xs font-bold uppercase transition-all border",
                                        intensity === level 
                                            ? level === 'high' ? "bg-red-500/20 border-red-500 text-red-400" 
                                            : level === 'medium' ? "bg-yellow-500/20 border-yellow-500 text-yellow-400" 
                                            : "bg-green-500/20 border-green-500 text-green-400"
                                            : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                                    )}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Type Selector Grid */}
                    <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Modality</label>
                        <div className="grid grid-cols-3 gap-2">
                            {typeOptions.map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => setType(opt.id as any)}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-3 rounded-lg border transition-all gap-1",
                                        type === opt.id 
                                            ? "bg-primary/20 border-primary text-primary"
                                            : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                                    )}
                                >
                                    <opt.icon className="w-4 h-4" />
                                    <span className="text-[9px] uppercase font-bold">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Actions Footer */}
                <div className="flex items-center gap-3 mt-8 pt-6 border-t border-white/10">
                    <button 
                        onClick={() => { onDelete(session.id); onClose(); }}
                        className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <Button className="flex-1 h-12 text-sm font-bold tracking-wider" onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" /> Confirm Updates
                    </Button>
                </div>

            </GlassCard>
        </div>
    );
};
