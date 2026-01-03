
import React from 'react';

export const GlobalStyles = () => (
  <style>{`
    :root {
      /* Core Theme */
      --background: 220 30% 5%;
      --foreground: 180 100% 95%;
      --glass: 180 50% 90%;
      --glass-border: 180 100% 80%;
      --primary: 180 100% 50%;
      --primary-foreground: 220 30% 5%;
      --primary-glow: 180 100% 60%;
      --secondary: 200 100% 48%;
      --secondary-foreground: 220 30% 5%;
      --secondary-glow: 200 100% 58%;
      --muted: 220 20% 15%;
      --muted-foreground: 180 30% 70%;
      --accent: 180 100% 50%;
      --accent-foreground: 220 30% 5%;
      --danger: 0 80% 60%;
      --radius: 1rem;
      --glow-primary: 0 0 40px hsla(180, 100%, 50%, 0.3);
      --glow-subtle: 0 0 20px hsla(180, 100%, 50%, 0.1);
      --blur: 24px;
      --blur-heavy: 40px;

      /* Nebula State System */
      --nebula-recharge: 265 80% 55%;    /* Deep Violet - Recovery Mode */
      --nebula-ignite: 160 100% 45%;     /* Electric Cyan - High Readiness */
      --nebula-warning: 15 100% 50%;     /* Amber/Orange - High Stress */
      --nebula-flow: 200 100% 50%;       /* Pure Blue - Flow State */
      --glow-nebula: 0 0 80px hsla(180, 100%, 50%, 0.2);

      /* Fuel Visualization */
      --fuel-glycogen: 35 100% 55%;      /* Honey/Amber for glycogen */
      --fuel-hydration: 200 100% 60%;    /* Clear blue for water */
      --fuel-reserve: 0 80% 50%;         /* Red glow for reserve mode */

      /* Autonomic Balance */
      --autonomic-balanced: 160 100% 50%;      /* Green - Balanced */
      --autonomic-sympathetic: 25 100% 55%;    /* Orange - Stress/Fight */
      --autonomic-parasympathetic: 220 100% 60%; /* Cool Blue - Rest */

      /* Glass Depth Tiers */
      --glass-tier-1: hsla(180, 50%, 90%, 0.04);  /* Panel - Deepest */
      --glass-tier-2: hsla(180, 50%, 90%, 0.08);  /* Card - Medium */
      --glass-tier-3: hsla(180, 50%, 90%, 0.12);  /* Action - Surface */
      --glass-tier-4: hsla(180, 50%, 90%, 0.18);  /* Focus - Prominent */
    }

    body {
      background-color: hsl(var(--background));
      color: hsl(var(--foreground));
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
      overflow-x: hidden;
    }
    
    .glass {
      background: var(--glass-tier-2);
      backdrop-filter: blur(var(--blur));
      border: 1px solid hsla(var(--glass-border), 0.15);
    }
    
    .glass-heavy {
      background: var(--glass-tier-3);
      backdrop-filter: blur(var(--blur-heavy));
      border: 1px solid hsla(var(--glass-border), 0.2);
    }

    /* Glass Depth Tier Utilities */
    .glass-tier-1 {
      background: var(--glass-tier-1);
      backdrop-filter: blur(24px);
      border: 1px solid hsla(180, 100%, 80%, 0.08);
    }
    .glass-tier-2 {
      background: var(--glass-tier-2);
      backdrop-filter: blur(32px);
      border: 1px solid hsla(180, 100%, 80%, 0.12);
    }
    .glass-tier-3 {
      background: var(--glass-tier-3);
      backdrop-filter: blur(48px);
      border: 1px solid hsla(180, 100%, 80%, 0.18);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    .glass-tier-4 {
      background: var(--glass-tier-4);
      backdrop-filter: blur(64px);
      border: 1px solid hsla(180, 100%, 80%, 0.25);
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4), var(--glow-subtle);
    }

    /* Nebula State Backgrounds */
    .nebula-recharge {
      background: radial-gradient(ellipse at 30% 20%, hsl(var(--nebula-recharge)) 0%, transparent 50%),
                  radial-gradient(ellipse at 70% 80%, hsl(220, 80%, 40%) 0%, transparent 50%),
                  hsl(var(--background));
    }
    .nebula-ignite {
      background: radial-gradient(ellipse at 50% 30%, hsl(var(--nebula-ignite)) 0%, transparent 40%),
                  radial-gradient(ellipse at 80% 70%, hsl(160, 100%, 35%) 0%, transparent 45%),
                  hsl(var(--background));
    }
    .nebula-warning {
      background: radial-gradient(ellipse at 30% 50%, hsl(var(--nebula-warning)) 0%, transparent 45%),
                  radial-gradient(ellipse at 70% 30%, hsl(0, 80%, 40%) 0%, transparent 40%),
                  hsl(var(--background));
    }
    .nebula-flow {
      background: radial-gradient(ellipse at 40% 40%, hsl(var(--nebula-flow)) 0%, transparent 50%),
                  radial-gradient(ellipse at 60% 60%, hsl(200, 100%, 40%) 0%, transparent 45%),
                  hsl(var(--background));
    }

    /* Fuel Tank Liquid Effect */
    .liquid-glycogen {
      background: linear-gradient(180deg, 
        hsla(var(--fuel-glycogen), 0.8) 0%,
        hsla(var(--fuel-glycogen), 0.6) 50%,
        hsla(var(--fuel-glycogen), 0.9) 100%);
      background-size: 200% 200%;
    }
    .liquid-hydration {
      background: linear-gradient(180deg,
        hsla(var(--fuel-hydration), 0.6) 0%,
        hsla(var(--fuel-hydration), 0.4) 100%);
    }

    /* Autonomic Gyro Glow */
    .gyro-balanced { box-shadow: 0 0 30px hsla(var(--autonomic-balanced), 0.5); }
    .gyro-stress { box-shadow: 0 0 40px hsla(var(--autonomic-sympathetic), 0.6); }
    .gyro-rest { box-shadow: 0 0 35px hsla(var(--autonomic-parasympathetic), 0.5); }
    
    .gradient-text {
      background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)));
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .font-mono { font-family: 'JetBrains Mono', monospace; }

    /* 3D Flip Utilities */
    .perspective-1000 { perspective: 1000px; }
    .preserve-3d { transform-style: preserve-3d; }
    .backface-hidden { backface-visibility: hidden; }
    .rotate-y-180 { transform: rotateY(180deg); }
    
    /* Scrollbar for Back of Card */
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
    }

    /* Micro-Interaction Utilities */
    .press-effect {
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .press-effect:active {
      transform: scale(0.97);
    }
    .hover-glow:hover {
      box-shadow: var(--glow-primary);
    }
  `}</style>
);
