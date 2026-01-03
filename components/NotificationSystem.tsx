
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Brain, Zap, Heart, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { cn } from './ui';

export interface SentientNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'critical';
  source: 'fuel' | 'recovery' | 'mind' | 'system' | 'orchestrator';
  message: string;
  timestamp: number;
}

interface NotificationSystemProps {
  notifications: SentientNotification[];
  onDismiss: (id: string) => void;
}

interface NotificationItemProps {
  notification: SentientNotification;
  onDismiss: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onDismiss }) => {
  
  // Auto-dismiss
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  const getIcon = () => {
    switch(notification.source) {
        case 'fuel': return Zap;
        case 'recovery': return Heart;
        case 'mind': return Brain;
        case 'orchestrator': return Activity;
        default: return Sparkles;
    }
  };

  const Icon = getIcon();

  const getColors = () => {
      switch(notification.type) {
          case 'critical': return "bg-red-950/80 border-red-500 text-red-200";
          case 'warning': return "bg-amber-950/80 border-amber-500 text-amber-200";
          case 'success': return "bg-green-950/80 border-green-500 text-green-200";
          default: return "bg-[#0a0a0a]/80 border-white/10 text-white";
      }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.9 }}
      layout
      className={cn(
        "pointer-events-auto backdrop-blur-md border rounded-lg p-3 shadow-2xl flex items-start gap-3 overflow-hidden relative",
        getColors()
      )}
    >
      {/* Scanline effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_2px] pointer-events-none" />
      
      <div className={cn("p-2 rounded-full bg-white/5 border border-white/5 shrink-0")}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-0.5">
                {notification.source} Link
            </span>
        </div>
        <p className="text-xs font-medium leading-snug">{notification.message}</p>
      </div>
    </motion.div>
  );
};

export const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, onDismiss }) => {
  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none w-full max-w-sm">
      <AnimatePresence>
        {notifications.map((n) => (
          <NotificationItem key={n.id} notification={n} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
};
