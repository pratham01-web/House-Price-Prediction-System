import React from "react";
import { cn } from "../../lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "flat" | "elevated";
  padding?: "none" | "sm" | "md" | "lg";
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  variant = "default",
  padding = "md",
  ...props
}) => {
  const paddingStyles = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const variantStyles = {
    default:
      "bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 shadow-glass rounded-2xl",
    interactive:
      "bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 shadow-glass rounded-2xl transition-all duration-200 hover:bg-slate-850/80 hover:border-indigo-500/30 hover:shadow-glow cursor-pointer",
    flat: "bg-slate-900/50 border border-slate-800/60 rounded-xl",
    elevated:
      "bg-slate-900/90 backdrop-blur-2xl border border-slate-700/80 shadow-2xl rounded-2xl",
  };

  return (
    <div
      className={cn(variantStyles[variant], paddingStyles[padding], className)}
      {...props}
    >
      {children}
    </div>
  );
};
