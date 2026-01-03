
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Info, RotateCcw } from 'lucide-react';
import { cn } from './ui';

interface FlipCardProps {
    children?: React.ReactNode;
    backContent: React.ReactNode;
    className?: string;
    label?: string;
}

export const FlipCard = ({ children, backContent, className, label = "SYSTEM ARCHITECTURE" }: FlipCardProps) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div className={cn("relative group perspective-1000", className)} style={{ minHeight: 'fit-content' }}>
            <motion.div
                className="relative w-full h-full transition-all duration-500 preserve-3d"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: "backOut" }}
            >
                {/* FRONT FACE */}
                <div className="backface-hidden relative z-10 h-full">
                    {children}
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 text-white/40 hover:text-cyan-400 hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 z-50 backdrop-blur-md border border-white/10"
                    >
                        <Info className="w-3 h-3" />
                    </button>
                </div>

                {/* BACK FACE */}
                <div 
                    className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl overflow-hidden bg-[#050505] border border-cyan-900/30 shadow-[inset_0_0_20px_rgba(34,211,238,0.05)] z-20"
                >
                    {/* Blueprint Grid Background */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" 
                        style={{ 
                            backgroundImage: 'linear-gradient(rgba(34,211,238,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.3) 1px, transparent 1px)', 
                            backgroundSize: '20px 20px' 
                        }} 
                    />
                    
                    <div className="relative z-10 h-full p-4 flex flex-col">
                        <div className="flex justify-between items-start mb-3 border-b border-cyan-900/30 pb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
                                <span className="text-[9px] font-mono text-cyan-500 uppercase tracking-widest">{label}</span>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
                                className="text-cyan-500/50 hover:text-cyan-400 p-1 hover:bg-cyan-500/10 rounded"
                            >
                                <RotateCcw className="w-3 h-3" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-xs leading-relaxed text-cyan-100/70">
                            {backContent}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
