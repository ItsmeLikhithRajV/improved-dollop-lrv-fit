import React, { useMemo } from "react";
import { useSentient } from "../../store/SentientContext";
import { TimelineTab } from "../timeline/TimelineTab";
import { FuelTab } from "../fuel/FuelTab";
import { MindSpaceTab } from "../mindspace/MindSpaceTab";
import { PerformanceTab } from "../performance/PerformanceTab";
import { BodyTab } from "../body/BodyTab";
import { ProfileTab } from "../profile/ProfileTab";
import { NeuralInterface } from "../coach/CoachChat";
import { ActiveCommander } from "../commander/ActiveCommander";
import { WeeklyReportCard } from "../../components/WeeklyReportCard";
import { TrendChart } from "../../components/TrendChart";
import { SentientInsightsCard } from "../../components/SentientInsightsCard";
import { LearningInsightsCard } from "../../components/LearningInsightsCard";
import { getTrendData } from "../../services/weeklyReportService";
import { InsightsPanel } from "./InsightsPanel";
import {
  LayoutDashboard, Zap, Heart, Brain, BarChart2, Calendar,
  Activity, Moon, Flame, TrendingUp, Sparkles, ArrowRight, AlertTriangle, Check, FlaskConical, User, TestTube, Dna, Ghost, Target, Trophy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard, Button, cn } from "../../components/ui";
import { HeroCard, QuickStatsRow, ContextualCard, NavigationCard } from "../../components/premium";
import { NotificationSystem } from "../../components/NotificationSystem";
import { expertCouncil } from "../../experts";
import { ActionSyncService } from "../../services/ActionSyncService";

// --- DASHBOARD COMPONENTS ---

const ReadinessOrb = ({ readiness, fuel }: { readiness: number, fuel: number }) => {
  const coreColor = readiness > 80 ? "hsl(140, 70%, 50%)" : readiness > 50 ? "hsl(45, 100%, 55%)" : "hsl(0, 80%, 60%)";
  const fuelScale = Math.max(0.5, fuel / 100);

  return (
    <div className="relative flex items-center justify-center w-80 h-80 mx-auto my-8">
      <motion.div
        className="absolute inset-0 opacity-20 blur-3xl rounded-full"
        style={{ background: coreColor }}
        animate={{ scale: [0.8 * fuelScale, 1.2 * fuelScale, 0.8 * fuelScale], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <div className="absolute inset-0 border border-white/10 rounded-full flex items-center justify-center opacity-30">
        <div className="w-[85%] h-[85%] border border-white/10 rounded-full border-dashed animate-[spin_60s_linear_infinite]" />
      </div>
      <motion.div
        className="absolute w-56 h-56 opacity-50 mix-blend-screen blur-md"
        style={{ background: coreColor }}
        animate={{
          borderRadius: ["60% 40% 30% 70% / 60% 30% 70% 40%", "30% 60% 70% 40% / 50% 60% 30% 60%", "60% 40% 30% 70% / 60% 30% 70% 40%"],
          rotate: [0, 360]
        }}
        transition={{ duration: 20, ease: "linear", repeat: Infinity }}
      />
      <motion.div
        className="relative z-10 w-40 h-40 rounded-full glass-heavy flex flex-col items-center justify-center border border-white/20 shadow-glow-primary backdrop-blur-xl"
      >
        <Activity className="w-8 h-8 mb-1" style={{ color: coreColor }} />
        <div className="text-5xl font-bold mb-1 tracking-tighter" style={{ color: coreColor }}>{readiness}</div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Readiness</div>
      </motion.div>
    </div>
  );
};

const MetricCard = ({ icon: Icon, label, value, sub, status = "good" }: any) => {
  const statusColors: any = {
    good: "text-green-400 bg-green-400/10",
    warning: "text-yellow-400 bg-yellow-400/10",
    danger: "text-red-400 bg-red-400/10",
    neutral: "text-blue-400 bg-blue-400/10"
  };
  const colorClass = statusColors[status] || statusColors.neutral;

  return (
    <motion.div
      className="glass rounded-xl p-4 flex items-center gap-4 relative overflow-hidden"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className={cn("p-3 rounded-full", colorClass)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className="text-xl font-bold text-foreground">{value}</div>
        {sub && <div className="text-[10px] opacity-50">{sub}</div>}
      </div>
    </motion.div>
  );
};

// Enhanced Commander Card with Active Command Integration
const CommanderCard = ({ mode, reason, action, risks, inputs, activeCommand, onCompleteCommand }: any) => {
  // If we have an active command, use its data; otherwise fall back to legacy summary
  const displayTitle = activeCommand ? activeCommand.action.name : mode;
  const displayReason = activeCommand ? activeCommand.rationale.reason : reason;
  const displayAction = activeCommand ? "Mark Complete" : action;

  return (
    <GlassCard className="relative overflow-hidden border-t-4 border-t-primary">
      <motion.div
        className="absolute inset-0 opacity-10"
        style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))" }}
        animate={{ opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">

        {/* Primary Directive */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/20"><Zap className="w-5 h-5 text-primary" /></div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Active Commander</div>
              <div className="text-2xl font-bold gradient-text">{displayTitle}</div>
            </div>
          </div>

          {/* Logic Visualizer */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <span className={cn(inputs.recovery < 50 ? "text-red-400" : "text-green-400")}>Recovery {inputs.recovery}%</span>
            <ArrowRight className="w-3 h-3 opacity-50" />
            <span className={cn(inputs.fuel < 50 ? "text-yellow-400" : "text-green-400")}>Fuel {inputs.fuel}%</span>
            <ArrowRight className="w-3 h-3 opacity-50" />
            <span className="text-white font-bold">{activeCommand ? activeCommand.rationale.metric : "System"}</span>
          </div>

          <p className="text-sm text-white/80 mb-4 max-w-xl italic border-l-2 border-primary/30 pl-3">
            "{displayReason}"
          </p>

          <div className="flex flex-wrap gap-2">
            {risks.map((risk: string, i: number) => (
              <span key={i} className="text-[10px] px-2 py-1 rounded border border-red-500/30 text-red-400 bg-red-500/10 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {risk}
              </span>
            ))}
          </div>
        </div>

        {/* Action Module */}
        <div className="w-full md:w-auto">
          <div className="glass-heavy rounded-lg p-6 border border-primary/20 min-w-[200px] text-center flex flex-col items-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Prime Directive</div>
            <div className="text-sm font-bold text-foreground mb-3">{activeCommand ? activeCommand.action.description : action}</div>

            {activeCommand && (
              <Button
                size="sm"
                className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50"
                onClick={() => onCompleteCommand(activeCommand.action.id)}
              >
                <Check className="w-4 h-4 mr-2" /> {displayAction}
              </Button>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

// --- MAIN DASHBOARD LAYOUT ---

export const Dashboard = () => {
  const { state, dispatch, sync } = useSentient();
  const { active_tab, mindspace, fuel, sleep, physical_load, orchestrator, notifications } = state;

  const tabs = [
    { id: "home", label: "Home", icon: LayoutDashboard },
    { id: "commander", label: "Commander", icon: Zap },
    { id: "performance", label: "Perf Labs", icon: BarChart2 },
    { id: "body", label: "Body", icon: Heart },
    { id: "fuel", label: "Fuel", icon: Flame },
    { id: "mindspace", label: "Mindspace", icon: Brain },
  ];

  // Profile/settings are now accessed via header button, not a tab
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  // Derive Metrics for Home View
  const metrics = useMemo(() => [
    {
      icon: Heart,
      label: "HRV Status",
      value: `${sleep.hrv}ms`,
      status: sleep.hrv < 40 ? 'danger' : 'good'
    },
    {
      icon: Moon,
      label: "Sleep Bank",
      value: `${sleep.duration}h`,
      sub: `${sleep.efficiency}% Eff`,
      status: sleep.duration < 6 ? 'danger' : 'good'
    },
    {
      icon: Flame,
      label: "Fuel Tank",
      value: `${Math.round(fuel.fuel_score)}%`,
      status: fuel.fuel_score < 40 ? 'warning' : 'good'
    },
    {
      icon: TrendingUp,
      label: "Acute Load",
      value: physical_load.acute_load,
      sub: `ACWR ${physical_load.acwr.toFixed(2)}`,
      status: physical_load.acwr > 1.3 ? 'warning' : 'neutral'
    }
  ], [sleep, fuel, physical_load]);

  const handleDismissNotification = (id: string) => {
    dispatch({ type: 'DISMISS_NOTIFICATION', payload: id });
  };

  const handleCompleteCommand = (id: string) => {
    // Sync action completion globally
    ActionSyncService.complete(id, 'commander');
    // Trigger re-evaluation
    sync('INIT_SYNC', { completedCommand: id });
  };

  // SENTIENT ORCHESTRATION LAYER
  // Calculate the "One True Action" dynamically using Expert Council
  const unifiedTimeline = useMemo(() => {
    try {
      return expertCouncil.convene(state, state.user_profile);
    } catch {
      return { recommendations: [] };
    }
  }, [state]);
  const activeCommand = unifiedTimeline.recommendations[0] ?? null;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">

      {/* THE NERVOUS SYSTEM HUD */}
      <NotificationSystem notifications={notifications} onDismiss={handleDismissNotification} />

      {/* HEADER - Logo + Profile Button */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="container max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo - tap to go home */}
            <button
              onClick={() => dispatch({ type: 'SET_TAB', payload: 'home' })}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Sparkles className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-bold tracking-widest font-mono">SENTIENT<span className="text-primary">OS</span></h1>
            </button>

            {/* Profile Button */}
            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <User className="w-4 h-4 text-white/60" />
              <span className="text-sm font-medium text-white/80 hidden md:block">Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* VISION PRO GLASS HUD - Floating Navigation */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={cn(
            // Glass morphism
            "flex items-center gap-1 px-2 py-2 rounded-full",
            "bg-white/[0.08] backdrop-blur-[40px] saturate-[180%]",
            // Border and glow
            "border border-white/[0.15]",
            "shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05),inset_0_1px_0_rgba(255,255,255,0.1)]",
            // Subtle ambient glow
            "after:absolute after:inset-0 after:rounded-full after:bg-gradient-to-t after:from-primary/5 after:to-transparent after:pointer-events-none"
          )}
        >
          {tabs.map((tab) => {
            const isActive = active_tab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => dispatch({ type: 'SET_TAB', payload: tab.id })}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200",
                  isActive
                    ? "bg-white/15 text-white shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                )}
              >
                <tab.icon className={cn(
                  "w-5 h-5 transition-transform",
                  isActive && "scale-110"
                )} />
                {isActive && (
                  <motion.div
                    layoutId="glassHudIndicator"
                    className="absolute inset-0 rounded-full bg-primary/20 border border-primary/30"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* MAIN CONTENT STAGE */}
      <div className="flex-1 container max-w-6xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">

          {/* HOME VIEW: THE AGGREGATOR */}
          {active_tab === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 pb-24"
            >
              {/* 1. Greeting */}
              <div className="text-center pt-4">
                <h2 className="text-2xl font-bold text-white">
                  {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening'}
                </h2>
                <p className="text-sm text-white/40">Your biological command center</p>
              </div>

              {/* 2. Readiness Hero */}
              <HeroCard
                value={mindspace?.readiness_score ?? 0}
                unit="%"
                label="Today's Readiness"
                sublabel={orchestrator?.readiness_summary || ''}
                trend={(mindspace?.readiness_score ?? 0) > 75 ? 'up' : (mindspace?.readiness_score ?? 0) > 60 ? 'flat' : 'down'}
                trendValue={(mindspace?.readiness_score ?? 0) > 75 ? 'Optimal' : (mindspace?.readiness_score ?? 0) > 60 ? 'Moderate' : 'Low'}
                trendPeriod="vs baseline"
                status={(mindspace?.readiness_score ?? 0) >= 80 ? 'excellent' : (mindspace?.readiness_score ?? 0) >= 60 ? 'good' : (mindspace?.readiness_score ?? 0) >= 40 ? 'warning' : 'critical'}
                expandedContent={
                  <QuickStatsRow
                    stats={[
                      { id: 'recovery', label: 'Recovery', value: `${state.recovery?.recovery_score ?? 0}%`, trend: 'up' as const },
                      { id: 'sleep', label: 'Sleep', value: `${sleep?.duration ?? 0}h`, trend: (sleep?.duration ?? 0) >= 7 ? 'up' as const : 'down' as const },
                      { id: 'hrv', label: 'HRV', value: `${sleep?.hrv ?? 0}ms`, trend: 'flat' as const },
                      { id: 'fuel', label: 'Fuel', value: `${Math.round(fuel?.fuel_score ?? 0)}%`, trend: (fuel?.fuel_score ?? 0) > 60 ? 'up' as const : 'down' as const }
                    ]}
                    columns={4}
                  />
                }
              />

              {/* 3. Today's Priority (The ONE thing) */}
              <ContextualCard
                type="action"
                title="Today's Priority"
                description={activeCommand ? activeCommand.name : (orchestrator?.recommended_actions?.[0] || "Focus on quality over volume today.")}
                action={{
                  label: "Open Commander",
                  onClick: () => dispatch({ type: 'SET_TAB', payload: 'commander' })
                }}
              />

              {/* 4. Ghost Coach (if insights available) */}
              {state.performance?.labs?.pattern_discovery?.active_patterns?.length > 0 && (
                <GlassCard className="border-l-4 border-l-purple-500/50">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30">
                      <Ghost className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-1">Ghost Coach</div>
                      <div className="text-sm text-white/80">
                        {state.performance.labs.pattern_discovery.active_patterns[0]?.name || "Watching for patterns in your training..."}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* 5. Quick Navigation */}
              <div className="grid grid-cols-2 gap-3">
                <NavigationCard
                  icon={<Zap className="w-5 h-5" />}
                  title="Commander"
                  subtitle="Today's timeline"
                  onClick={() => dispatch({ type: 'SET_TAB', payload: 'commander' })}
                />
                <NavigationCard
                  icon={<Heart className="w-5 h-5" />}
                  title="Body"
                  subtitle="Recovery & bio"
                  onClick={() => dispatch({ type: 'SET_TAB', payload: 'body' })}
                />
                <NavigationCard
                  icon={<BarChart2 className="w-5 h-5" />}
                  title="Perf Labs"
                  subtitle="Training"
                  onClick={() => dispatch({ type: 'SET_TAB', payload: 'performance' })}
                />
                <NavigationCard
                  icon={<Brain className="w-5 h-5" />}
                  title="Mindspace"
                  subtitle="Mental state"
                  onClick={() => dispatch({ type: 'SET_TAB', payload: 'mindspace' })}
                />
              </div>

              {/* 6. Insights Panel (collapsed by default) */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Deep Insights</span>
                </div>
                <InsightsPanel onNavigate={(tab) => dispatch({ type: 'SET_TAB', payload: tab })} />
              </div>
            </motion.div>
          )}

          {active_tab === "commander" && <TimelineTab />}
          {active_tab === "fuel" && <FuelTab />}
          {active_tab === "body" && <BodyTab />}
          {active_tab === "mindspace" && <MindSpaceTab />}
          {active_tab === "performance" && <PerformanceTab />}
        </AnimatePresence>
      </div>

      {/* Floating Coach Chat */}
      <NeuralInterface />

      {/* Profile Panel Slide-in */}
      <AnimatePresence>
        {isProfileOpen && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsProfileOpen(false)}
          >
            <motion.div
              className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-white/10"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ProfileTab />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
