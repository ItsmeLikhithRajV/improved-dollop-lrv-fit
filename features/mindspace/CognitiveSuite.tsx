
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Zap, Grid3X3, X, Target, Play } from "lucide-react";
import { Button, cn } from "../../components/ui";

// =========================================================
// TYPES
// =========================================================

type TestType = "reaction" | "memory" | "focus";
interface TestResult { score: number; rating: string; metric: string; }

interface CognitiveSuiteProps {
  type: TestType;
  onComplete: (result: TestResult) => void;
  onExit: () => void;
}

// =========================================================
// 1. REACTION TEST (CNS Latency)
// =========================================================

const ReactionTest = ({ onComplete }: { onComplete: (r: TestResult) => void }) => {
  const [state, setState] = useState<'intro' | 'waiting' | 'ready' | 'early' | 'result'>('intro');
  const [startTime, setStartTime] = useState(0);
  const [result, setResult] = useState(0);
  // Fix: Initialize useRef with undefined to satisfy expected argument count for line 28
  const timerRef = useRef<number | undefined>(undefined);

  const startTest = () => {
    setState('waiting');
    const delay = 2000 + Math.random() * 3000; // 2-5s random delay
    timerRef.current = window.setTimeout(() => {
      setState('ready');
      setStartTime(Date.now());
    }, delay);
  };

  const handleClick = () => {
    if (state === 'intro') {
        startTest();
    } else if (state === 'waiting') {
        clearTimeout(timerRef.current);
        setState('early');
        setTimeout(startTest, 1500); // Retry
    } else if (state === 'ready') {
        const ms = Date.now() - startTime;
        setResult(ms);
        setState('result');
        const rating = ms < 200 ? "Elite" : ms < 300 ? "Normal" : "Fatigued";
        setTimeout(() => {
            onComplete({ score: ms, rating, metric: "ms" });
        }, 1500);
    }
  };

  return (
    <div 
        className={cn(
            "absolute inset-0 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 select-none",
            state === 'waiting' ? "bg-red-900" :
            state === 'ready' ? "bg-green-500" :
            state === 'early' ? "bg-orange-500" : "bg-black"
        )}
        onMouseDown={handleClick}
        onTouchStart={handleClick}
    >
        {state === 'intro' && (
            <div className="text-center">
                <Zap className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h2 className="text-2xl font-bold mb-2">Reaction Protocol</h2>
                <p className="text-muted-foreground mb-8">Tap INSTANTLY when screen turns GREEN.</p>
                <Button className="pointer-events-none">Tap to Start</Button>
            </div>
        )}
        {state === 'waiting' && <h2 className="text-4xl font-bold text-red-200 animate-pulse">WAIT...</h2>}
        {state === 'ready' && <h2 className="text-6xl font-bold text-white scale-125">CLICK!</h2>}
        {state === 'early' && <h2 className="text-2xl font-bold text-white">Too Early! Resetting...</h2>}
        {state === 'result' && (
            <div className="text-center">
                <div className="text-6xl font-mono font-bold mb-2">{result}ms</div>
                <div className="text-xl uppercase tracking-widest opacity-80">Latency Detected</div>
            </div>
        )}
    </div>
  );
};

// =========================================================
// 2. MEMORY TEST (Spatial Span)
// =========================================================

const MemoryTest = ({ onComplete }: { onComplete: (r: TestResult) => void }) => {
    const [sequence, setSequence] = useState<number[]>([]);
    const [userSequence, setUserSequence] = useState<number[]>([]);
    const [level, setLevel] = useState(1);
    const [phase, setPhase] = useState<'watch' | 'input' | 'fail' | 'intro'>('intro');
    const [flashIndex, setFlashIndex] = useState<number | null>(null);

    const GRID_SIZE = 9;

    const playLevel = (lvl: number) => {
        setPhase('watch');
        setUserSequence([]);
        const newSeq = Array.from({length: lvl + 2}, () => Math.floor(Math.random() * GRID_SIZE));
        setSequence(newSeq);

        // Flash sequence
        let i = 0;
        const interval = setInterval(() => {
            if (i >= newSeq.length) {
                clearInterval(interval);
                setFlashIndex(null);
                setPhase('input');
                return;
            }
            setFlashIndex(newSeq[i]);
            setTimeout(() => setFlashIndex(null), 400); // Flash duration
            i++;
        }, 800); // Time between flashes
    };

    const handleTap = (index: number) => {
        if (phase !== 'input') return;
        const nextUserSeq = [...userSequence, index];
        setUserSequence(nextUserSeq);

        // Check validity immediate
        const verifyIdx = nextUserSeq.length - 1;
        if (nextUserSeq[verifyIdx] !== sequence[verifyIdx]) {
            setPhase('fail');
            setTimeout(() => {
                onComplete({ 
                    score: level, 
                    rating: level > 6 ? "Elite" : level > 4 ? "Solid" : "Low", 
                    metric: "span" 
                });
            }, 1000);
            return;
        }

        // Check completion
        if (nextUserSeq.length === sequence.length) {
            setLevel(l => l + 1);
            setTimeout(() => playLevel(level + 1), 500);
        }
    };

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
            {phase === 'intro' ? (
                <div className="text-center">
                    <Grid3X3 className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                    <h2 className="text-2xl font-bold mb-2">Spatial Memory</h2>
                    <p className="text-muted-foreground mb-8">Repeat the pattern.</p>
                    <Button onClick={() => playLevel(1)}>Start</Button>
                </div>
            ) : (
                <>
                    <div className="mb-8 text-2xl font-mono text-purple-400">Level {level}</div>
                    <div className="grid grid-cols-3 gap-3">
                        {Array.from({length: GRID_SIZE}).map((_, i) => (
                            <motion.button
                                key={i}
                                className={cn(
                                    "w-20 h-20 rounded-xl border border-white/10 transition-all",
                                    flashIndex === i ? "bg-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.6)] border-purple-300 scale-105" : "bg-white/5",
                                    phase === 'input' ? "active:scale-95 hover:bg-white/10" : "cursor-default"
                                )}
                                onClick={() => handleTap(i)}
                                whileTap={phase === 'input' ? { scale: 0.9 } : {}}
                            />
                        ))}
                    </div>
                    <div className="mt-8 h-6 text-sm text-muted-foreground">
                        {phase === 'watch' ? "Watch sequence..." : phase === 'input' ? "Your turn" : "Incorrect"}
                    </div>
                </>
            )}
        </div>
    );
};

// =========================================================
// 3. FOCUS TEST (Smooth Pursuit)
// =========================================================

const FocusTest = ({ onComplete }: { onComplete: (r: TestResult) => void }) => {
    const [active, setActive] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [score, setScore] = useState(0); // Time on target
    const [totalTime, setTotalTime] = useState(0);
    const targetRef = useRef<HTMLDivElement>(null);
    
    // Animation refs
    // Fix: Initialize useRef with undefined to satisfy expected argument count for line 196 (relative within file)
    const requestRef = useRef<number | undefined>(undefined);
    const posRef = useRef({ x: 50, y: 50 }); // %
    const velocityRef = useRef({ x: 0.5, y: 0.5 });
    const isHovering = useRef(false);

    const animate = () => {
        if (!containerRef.current) return;
        
        // Brownian-ish Motion
        if (Math.random() < 0.05) velocityRef.current.x += (Math.random() - 0.5) * 0.5;
        if (Math.random() < 0.05) velocityRef.current.y += (Math.random() - 0.5) * 0.5;
        
        // Bounds bounce
        let nextX = posRef.current.x + velocityRef.current.x;
        let nextY = posRef.current.y + velocityRef.current.y;
        
        if (nextX < 5 || nextX > 95) velocityRef.current.x *= -1;
        if (nextY < 5 || nextY > 95) velocityRef.current.y *= -1;
        
        posRef.current = { x: Math.max(5, Math.min(95, nextX)), y: Math.max(5, Math.min(95, nextY)) };
        
        if (targetRef.current) {
            targetRef.current.style.left = `${posRef.current.x}%`;
            targetRef.current.style.top = `${posRef.current.y}%`;
        }

        setTotalTime(t => t + 16);
        if (isHovering.current) setScore(s => s + 16);

        // End after 10s
        if (totalTime > 10000) {
            const percentage = Math.round((score / totalTime) * 100);
            onComplete({ score: percentage, rating: percentage > 80 ? "Laser" : "Scattered", metric: "%" });
            cancelAnimationFrame(requestRef.current!);
        } else {
            requestRef.current = requestAnimationFrame(animate);
        }
    };

    useEffect(() => {
        if (active) {
            requestRef.current = requestAnimationFrame(animate);
        }
        return () => cancelAnimationFrame(requestRef.current!);
    }, [active, totalTime]); // Re-bind on tick isn't efficient but works for simple logic, optimizing out for brevity

    return (
        <div className="absolute inset-0 bg-black overflow-hidden touch-none" ref={containerRef}>
            {!active ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
                    <Target className="w-12 h-12 mb-4 text-cyan-400" />
                    <h2 className="text-2xl font-bold mb-2">Focus Tracking</h2>
                    <p className="text-muted-foreground mb-8">Keep your cursor/finger on the dot.</p>
                    <Button onClick={() => setActive(true)}>Begin</Button>
                </div>
            ) : (
                <>
                    <div 
                        ref={targetRef}
                        className="absolute w-12 h-12 rounded-full bg-cyan-500 shadow-[0_0_30px_cyan] transform -translate-x-1/2 -translate-y-1/2 cursor-crosshair"
                        onMouseEnter={() => isHovering.current = true}
                        onMouseLeave={() => isHovering.current = false}
                        onTouchStart={() => isHovering.current = true}
                        onTouchEnd={() => isHovering.current = false}
                    />
                    <div className="absolute top-4 right-4 font-mono text-cyan-400">
                        {Math.min(100, Math.round((score / Math.max(16, totalTime)) * 100))}%
                    </div>
                </>
            )}
        </div>
    );
};

// =========================================================
// MAIN EXPORT
// =========================================================

export const CognitiveSuite = ({ type, onComplete, onExit }: CognitiveSuiteProps) => {
    return (
        <div className="fixed inset-0 z-[100] bg-black text-white font-sans animate-in fade-in duration-300">
            <button 
                onClick={onExit}
                className="absolute top-4 left-4 z-50 p-2 text-white/50 hover:text-white"
            >
                <X className="w-6 h-6" />
            </button>
            
            {type === 'reaction' && <ReactionTest onComplete={onComplete} />}
            {type === 'memory' && <MemoryTest onComplete={onComplete} />}
            {type === 'focus' && <FocusTest onComplete={onComplete} />}
        </div>
    );
};
