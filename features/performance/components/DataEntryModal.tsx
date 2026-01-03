
import React, { useState } from 'react';
import { X, Save, Activity, Moon, Battery, Calendar } from 'lucide-react';
import { GlassCard, Button } from '../../../components/ui';
import { LongitudinalEntry } from '../../../types';

interface DataEntryModalProps {
    onSave: (entry: LongitudinalEntry) => void;
    onClose: () => void;
}

export const DataEntryModal: React.FC<DataEntryModalProps> = ({ onSave, onClose }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [load, setLoad] = useState(500);
    const [recovery, setRecovery] = useState(75);
    const [sleep, setSleep] = useState(85);

    const handleSubmit = () => {
        const entry: LongitudinalEntry = {
            date,
            load_metric: Number(load),
            recovery_score: Number(recovery),
            mindspace_score: Number(recovery), // Proxy
            sleep_quality: Number(sleep),
            compliance: true,
            baselines_snapshot: { rhr: 55, hrv: 65 } // Defaults
        };
        onSave(entry);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <GlassCard className="w-full max-w-sm border-t-4 border-t-cyan-500 relative">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-cyan-400" />
                        <h3 className="text-lg font-bold text-white">Log Performance Data</h3>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-white"><X className="w-5 h-5"/></button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase block mb-2 flex items-center gap-2">
                            <Calendar className="w-3 h-3" /> Date
                        </label>
                        <input 
                            type="date" 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-colors"
                        />
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs font-bold uppercase mb-2">
                                <span className="flex items-center gap-2 text-orange-400"><Activity className="w-3 h-3"/> Load Metric</span>
                                <span className="text-white font-mono">{load}</span>
                            </div>
                            <input 
                                type="range" min="0" max="2000" step="50"
                                value={load} 
                                onChange={(e) => setLoad(Number(e.target.value))}
                                className="w-full accent-orange-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between text-xs font-bold uppercase mb-2">
                                <span className="flex items-center gap-2 text-green-400"><Battery className="w-3 h-3"/> Recovery Score</span>
                                <span className="text-white font-mono">{recovery}%</span>
                            </div>
                            <input 
                                type="range" min="0" max="100" 
                                value={recovery} 
                                onChange={(e) => setRecovery(Number(e.target.value))}
                                className="w-full accent-green-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between text-xs font-bold uppercase mb-2">
                                <span className="flex items-center gap-2 text-purple-400"><Moon className="w-3 h-3"/> Sleep Quality</span>
                                <span className="text-white font-mono">{sleep}%</span>
                            </div>
                            <input 
                                type="range" min="0" max="100" 
                                value={sleep} 
                                onChange={(e) => setSleep(Number(e.target.value))}
                                className="w-full accent-purple-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>

                    <Button className="w-full h-12 text-sm font-bold" onClick={handleSubmit}>
                        <Save className="w-4 h-4 mr-2" /> Save Entry
                    </Button>
                </div>
            </GlassCard>
        </div>
    );
};
