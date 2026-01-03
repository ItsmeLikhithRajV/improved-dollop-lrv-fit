
import React from 'react';
import { motion } from 'framer-motion';
import { BodyZone, SorenessLevel } from '../../../types';
import { cn } from '../../../components/ui';

interface InteractiveBodyMapProps {
    soreness: Record<BodyZone, SorenessLevel>;
    onToggle: (zone: BodyZone) => void;
}

const ZONE_COLORS: Record<SorenessLevel, string> = {
    none: 'fill-white/5 hover:fill-white/20',
    tight: 'fill-yellow-500/40 hover:fill-yellow-500/60 animate-pulse',
    sore: 'fill-orange-500/60 hover:fill-orange-500/80 animate-pulse',
    pain: 'fill-red-600/80 hover:fill-red-600 animate-pulse',
    injured: 'fill-red-900 stroke-red-500 stroke-2'
};

const MusclePath = ({ d, zone, level, onClick }: { d: string, zone: string, level: SorenessLevel, onClick: () => void }) => (
    <motion.path
        d={d}
        className={cn("cursor-pointer transition-all duration-300 stroke-white/10 stroke-1", ZONE_COLORS[level])}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
    />
);

export const InteractiveBodyMap: React.FC<InteractiveBodyMapProps> = ({ soreness, onToggle }) => {
    
    // Simplified Geometric Muscle Map (Front/Back split implicitly or abstracted)
    // Using a stylized "Tech-Man" silhouette
    
    const renderZone = (zone: BodyZone, d: string) => (
        <MusclePath 
            zone={zone}
            d={d}
            level={soreness[zone] || 'none'}
            onClick={() => onToggle(zone)}
        />
    );

    return (
        <div className="relative w-full h-[500px] flex items-center justify-center">
            {/* Holographic Glow Base */}
            <div className="absolute inset-0 bg-cyan-500/5 blur-[100px] rounded-full" />
            
            <svg viewBox="0 0 200 450" className="h-full w-auto drop-shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                {/* HEAD (Non-interactive visual anchor) */}
                <path d="M85,30 Q100,10 115,30 Q115,55 100,65 Q85,55 85,30" className="fill-white/10 stroke-white/20" />
                
                {/* NECK */}
                {renderZone('neck', "M92,65 L108,65 L112,75 L88,75 Z")}

                {/* SHOULDERS (Delts) */}
                {renderZone('shoulders', "M70,80 L88,75 L112,75 L130,80 L135,95 L115,95 L115,100 L85,100 L85,95 L65,95 Z")}

                {/* UPPER BACK / CHEST AREA (Abstracted) */}
                {renderZone('upper_back', "M85,100 L115,100 L110,140 L90,140 Z")}

                {/* ELBOWS (Joints) */}
                {renderZone('elbows', "M60,135 Q55,145 60,155 L70,155 Q75,145 70,135 Z M140,135 Q145,145 140,155 L130,155 Q125,145 130,135 Z")}

                {/* WRISTS */}
                {renderZone('wrists', "M55,190 L65,190 L63,200 L57,200 Z M135,190 L145,190 L143,200 L137,200 Z")}

                {/* LOWER BACK / CORE */}
                {renderZone('lower_back', "M90,140 L110,140 L108,170 L92,170 Z")}

                {/* HIPS / GLUTES */}
                {renderZone('hips', "M92,170 L108,170 L115,190 L85,190 Z")}

                {/* QUADS (Thighs Front) */}
                {renderZone('quads', "M85,190 L100,190 L100,260 L85,250 Z M100,190 L115,190 L115,250 L100,260 Z")}

                {/* HAMSTRINGS (Thighs Back - Visualized as outer edge/wrap) */}
                {renderZone('hamstrings', "M85,190 L75,200 L80,240 L85,250 Z M115,190 L125,200 L120,240 L115,250 Z")}

                {/* KNEES */}
                {renderZone('knees', "M85,250 L100,260 L100,280 L85,280 Z M100,260 L115,250 L115,280 L100,280 Z")}

                {/* CALVES */}
                {renderZone('calves', "M85,280 L100,280 L95,360 L88,360 Z M100,280 L115,280 L112,360 L105,360 Z")}

                {/* ANKLES */}
                {renderZone('ankles', "M90,360 L98,360 L98,375 L90,375 Z M102,360 L110,360 L110,375 L102,375 Z")}

                {/* FEET */}
                {renderZone('feet', "M88,375 L98,375 L102,395 L85,390 Z M102,375 L112,375 L115,390 L98,395 Z")}
            </svg>

            {/* Legend Overlay */}
            <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[9px] text-muted-foreground uppercase tracking-wider">
                    <div className="w-2 h-2 rounded-full bg-white/20" /> Healthy
                </div>
                <div className="flex items-center gap-2 text-[9px] text-yellow-400 uppercase tracking-wider">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" /> Tight
                </div>
                <div className="flex items-center gap-2 text-[9px] text-orange-400 uppercase tracking-wider">
                    <div className="w-2 h-2 rounded-full bg-orange-500" /> Sore
                </div>
                <div className="flex items-center gap-2 text-[9px] text-red-400 uppercase tracking-wider">
                    <div className="w-2 h-2 rounded-full bg-red-600" /> Pain
                </div>
            </div>
        </div>
    );
};
