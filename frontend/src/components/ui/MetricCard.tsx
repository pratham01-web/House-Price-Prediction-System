import React from "react";
import { GlassCard } from "./GlassCard";
import { cn } from "../../lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ElementType;
  trend?: {
    value: string;
    positive?: boolean;
  };
  variant?: "default" | "primary" | "success" | "warning";
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  trend,
  variant = "default",
  className,
}) => {
  const iconColors = {
    default: "text-neutral-400 bg-neutral-900 border-neutral-800",
    primary: "text-white bg-white/10 border-white/20",
    success: "text-emerald-400 bg-emerald-950/50 border-emerald-500/30",
    warning: "text-amber-400 bg-amber-950/50 border-amber-500/30",
  };

  return (
    <GlassCard padding="md" className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          {label}
        </span>
        <div className={cn("p-2.5 rounded-xl border", iconColors[variant])}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div>
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono tabular-nums">
          {value}
        </div>
        {subValue && (
          <p className="text-xs text-neutral-400 font-mono mt-1">{subValue}</p>
        )}
      </div>

      {trend && (
        <div className="pt-2 border-t border-neutral-800/80 flex items-center space-x-1.5 text-xs font-medium">
          <span
            className={trend.positive ? "text-emerald-400" : "text-rose-400"}
          >
            {trend.value}
          </span>
          <span className="text-neutral-500 text-[11px]">vs. regional average</span>
        </div>
      )}
    </GlassCard>
  );
};
