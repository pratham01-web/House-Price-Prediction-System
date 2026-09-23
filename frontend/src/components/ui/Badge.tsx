import React from "react";
import { cn } from "../../lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "neutral" | "primary" | "success" | "warning" | "danger" | "cyan";
  size?: "sm" | "md";
  className?: string;
  icon?: React.ElementType;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  size = "sm",
  className,
  icon: Icon,
}) => {
  const variantStyles = {
    neutral: "bg-neutral-900 text-neutral-300 border-neutral-800",
    primary: "bg-white/10 text-white border-white/20",
    success: "bg-emerald-950/50 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-950/50 text-amber-400 border-amber-500/30",
    danger: "bg-rose-950/50 text-rose-400 border-rose-500/30",
    cyan: "bg-neutral-900 text-neutral-200 border-neutral-700",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center space-x-1 rounded-full font-mono font-medium border",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
      <span>{children}</span>
    </span>
  );
};
