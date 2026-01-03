import React from "react";
import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "lg" | "sm" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = "default", size = "default", ...props }, ref) => {
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-primary",
    outline: "border border-primary/30 bg-transparent text-foreground hover:bg-primary/10",
    ghost: "hover:bg-accent/10 hover:text-accent-foreground",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    lg: "h-12 px-8 text-base",
    sm: "h-8 px-3 text-xs",
    icon: "h-10 w-10",
  };
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-300 focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
Button.displayName = "Button";

export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  glow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className, onClick }) => (
  <motion.div
    onClick={onClick}
    className={cn("glass rounded-xl p-6 relative overflow-hidden", className)}
    whileHover={onClick ? { scale: 1.02, backgroundColor: "hsla(180, 50%, 90%, 0.12)" } : {}}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
);

export const Badge: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ children, className, ...props }) => (
  <span className={cn("inline-flex items-center rounded-full border border-primary/30 px-2.5 py-0.5 text-xs font-semibold text-primary bg-primary/5", className)} {...props}>
    {children}
  </span>
);

export const Switch: React.FC<{ checked: boolean; onCheckedChange: (c: boolean) => void; className?: string }> = ({ checked, onCheckedChange, className }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange(!checked)}
    className={cn(
      "peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
      checked ? "bg-primary" : "bg-white/10",
      className
    )}
  >
    <span
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-foreground shadow-lg ring-0 transition-transform",
        checked ? "translate-x-5" : "translate-x-0"
      )}
    />
  </button>
);