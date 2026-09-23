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
      "bg-neutral-950/80 backdrop-blur-xl border border-neutral-800/80 shadow-2xl rounded-2xl",
    interactive:
      "bg-neutral-950/80 backdrop-blur-xl border border-neutral-800/80 shadow-2xl rounded-2xl transition-all duration-200 hover:bg-neutral-900/80 hover:border-neutral-600 cursor-pointer",
    flat: "bg-neutral-950/60 border border-neutral-800/60 rounded-xl",
    elevated:
      "bg-black/95 backdrop-blur-2xl border border-neutral-700 shadow-2xl rounded-2xl",
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
