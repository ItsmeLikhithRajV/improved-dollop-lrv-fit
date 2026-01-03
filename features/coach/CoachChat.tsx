import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Cpu, MessageSquare, Sparkles, Activity, Brain } from 'lucide-react';
import { Button, GlassCard, cn } from '../../components/ui';
import { askSentientCoach } from '../../experts/orchestrator/ai';
import { useSentient } from '../../store/SentientContext';
import { SentientOrbButton } from '../../components/SentientOrbButton';

export const NeuralInterface: React.FC = () => {
    const { state } = useSentient();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'chat' | 'cortex'>('chat');

    // --- CHAT STATE ---
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', text: string }>>([
        { role: 'assistant', text: "Systems online. Monitoring your bio-telemetry. How can I assist?" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // --- CORTEX STATE (Agent Logs) ---
    // Mocking live logs for now. In V5, we'd pull from AgentOrchestrator history
    const [agentLogs, setAgentLogs] = useState([
        { agent: 'Architect', action: 'Optimizing Dashboard Layout', time: 'Now', type: 'info' },
        { agent: 'Researcher', action: 'Analyzing Recovery/Load Ratio', time: '2m ago', type: 'success' },
        { agent: 'Analyst', action: 'Maintained Sleep Baseline (7.5h)', time: '1h ago', type: 'info' },
        { agent: 'Alchemist', action: 'Searching for correlation: Caffeine vs HRV', time: '3h ago', type: 'warning' },
    ]);

    // Scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsTyping(true);

        // AI Response
        setTimeout(async () => {
            const result = await askSentientCoach(userMsg, state);
            const responseText = result?.response || "I couldn't process that request.";
            setMessages(prev => [...prev, { role: 'assistant', text: responseText }]);
            setIsTyping(false);
        }, 1000);
    };

    return (
        <>
            {/* 1. THE FLOATING ORB (Trigger) */}
            <SentientOrbButton onClick={() => setIsOpen(!isOpen)} isOpen={isOpen} />

            {/* 2. THE INTERFACE MODAL */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 w-[400px] h-[600px] z-50 flex flex-col"
                    >
                        <GlassCard className="flex-1 flex flex-col overflow-hidden shadow-2xl border-primary/20 backdrop-blur-2xl">

                            {/* HEADER & TABS */}
                            <div className="p-4 border-b border-white/10 bg-black/20 flex items-center justify-between">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setActiveTab('chat')}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                                            activeTab === 'chat' ? "bg-primary text-black" : "bg-white/5 text-muted-foreground hover:bg-white/10"
                                        )}
                                    >
                                        <MessageSquare className="w-3 h-3" /> CHAT
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('cortex')}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                                            activeTab === 'cortex' ? "bg-purple-500 text-white" : "bg-white/5 text-muted-foreground hover:bg-white/10"
                                        )}
                                    >
                                        <Brain className="w-3 h-3" /> CORTEX
                                    </button>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* CONTENT: CHAT */}
                            {activeTab === 'chat' && (
                                <div className="flex-1 flex flex-col overflow-hidden">
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {messages.map((msg, i) => (
                                            <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                                                <div className={cn(
                                                    "max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed",
                                                    msg.role === 'user'
                                                        ? "bg-primary/20 text-white rounded-tr-sm"
                                                        : "bg-white/10 text-white/90 rounded-tl-sm border border-white/5"
                                                )}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        ))}
                                        {isTyping && (
                                            <div className="flex justify-start">
                                                <div className="bg-white/5 p-3 rounded-2xl rounded-tl-sm flex gap-1">
                                                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                                                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce delay-100" />
                                                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce delay-200" />
                                                </div>
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>
                                    <div className="p-4 bg-black/20 border-t border-white/10">
                                        <form
                                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                            className="flex gap-2"
                                        >
                                            <input
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                placeholder="Ask Sentient..."
                                                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 text-sm focus:outline-none focus:border-primary/50 text-white placeholder:text-white/20"
                                            />
                                            <Button size="icon" className="rounded-full w-10 h-10 shrink-0">
                                                <Send className="w-4 h-4" />
                                            </Button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {/* CONTENT: CORTEX */}
                            {activeTab === 'cortex' && (
                                <div className="flex-1 overflow-y-auto p-4">
                                    <div className="mb-6 text-center">
                                        <div className="w-16 h-16 mx-auto mb-3 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                                            <Brain className="w-8 h-8 text-purple-400 animate-pulse" />
                                        </div>
                                        <h3 className="text-white font-bold">Agent Swarm Active</h3>
                                        <p className="text-xs text-muted-foreground">Autonomous Intelligence Loop Running</p>
                                    </div>

                                    <div className="space-y-3">
                                        {agentLogs.map((log, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="p-3 rounded-lg bg-white/5 border border-white/5 flex items-start gap-3"
                                            >
                                                <div className={cn(
                                                    "mt-1 w-2 h-2 rounded-full",
                                                    log.type === 'info' ? "bg-blue-400" :
                                                        log.type === 'success' ? "bg-green-400" : "bg-purple-400"
                                                )} />
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-xs font-bold text-white/90 uppercase tracking-wider">{log.agent}</span>
                                                        <span className="text-[10px] text-white/40 font-mono">{log.time}</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                                        {log.action}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <div className="mt-8 p-4 rounded-xl border border-dashed border-white/10 text-center">
                                        <Activity className="w-5 h-5 text-green-400 mx-auto mb-2" />
                                        <p className="text-xs text-green-400">System Healthy</p>
                                        <p className="text-[10px] text-white/30">Next Cycle: 14s</p>
                                    </div>
                                </div>
                            )}

                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
