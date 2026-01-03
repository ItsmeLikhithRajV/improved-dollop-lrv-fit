import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlobalStyles } from "./styles/GlobalStyles";
import { LandingPage } from "./features/dashboard/LandingPage";
import { Dashboard } from "./features/dashboard/Dashboard";
import { SentientProvider, useSentient } from "./store/SentientContext";
// StrategyDeck removed - Strategy is now in Performance Tab
import { OnboardingFlow } from "./features/onboarding/OnboardingFlow";
import { useSentientLoop } from "./hooks/useSentientLoop";

const AppContent = () => {
  const [view, setView] = useState("landing");
  const { isFirstLaunch } = useSentient();
  const [showOnboarding, setShowOnboarding] = useState(true);

  // Activate Sentient Core Loop (Heartbeat)
  useSentientLoop(2000); // Check every 2 seconds for engine updates

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, hsl(var(--primary)), transparent 70%)" }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, hsl(var(--secondary)), transparent 70%)" }}
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.1, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Onboarding for first-time users */}
      {isFirstLaunch && showOnboarding && view === "dashboard" && (
        <OnboardingFlow onComplete={() => setShowOnboarding(false)} />
      )}

      <AnimatePresence mode="wait">
        {view === "landing" && (
          <motion.div key="landing" exit={{ opacity: 0, scale: 1.5, filter: "blur(10px)" }} transition={{ duration: 0.8 }}>
            <LandingPage onStart={() => setView("dashboard")} />
          </motion.div>
        )}
        {view === "dashboard" && (
          <motion.div key="dashboard">
            <Dashboard />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const App = () => {
  return (
    <SentientProvider>
      <GlobalStyles />
      <AppContent />
    </SentientProvider>
  );
};

export default App;