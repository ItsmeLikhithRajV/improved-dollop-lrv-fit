import React from "react";
import { motion } from "framer-motion";
import { Button } from "../../components/ui";

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage = ({ onStart }: LandingPageProps) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-background">
      <motion.div
        className="relative w-64 h-64 mb-12 cursor-pointer group"
        onClick={onStart}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-primary"
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.1, 1],
            boxShadow: [
              "0 0 40px hsla(180, 100%, 50%, 0.2)",
              "0 0 80px hsla(180, 100%, 50%, 0.4)",
              "0 0 40px hsla(180, 100%, 50%, 0.2)"
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-4 rounded-full bg-background z-10 flex items-center justify-center border border-primary/20"
        >
          <div className="w-full h-full rounded-full bg-primary/5 flex items-center justify-center">
             <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          </div>
        </motion.div>
        <motion.div 
          className="absolute inset-[-20px] rounded-full border border-primary/20 border-t-primary/60"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <h1 className="text-6xl font-bold tracking-widest text-foreground mb-4 font-mono">SENTIENT</h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
          Accessible Intelligence. System Optimization.
        </p>
        <Button size="lg" onClick={onStart} className="text-lg px-12 h-14">
          Initiate Sequence
        </Button>
      </motion.div>
    </div>
  );
};
