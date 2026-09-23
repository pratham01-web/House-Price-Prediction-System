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
    default: "text-slate-400 bg-slate-800/60 border-slate-700/60",
    primary: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
    success: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    warning: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  };

  return (
    <GlassCard padding="md" className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
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
          <p className="text-xs text-slate-400 font-mono mt-1">{subValue}</p>
        )}
      </div>

      {trend && (
        <div className="pt-2 border-t border-slate-800/60 flex items-center space-x-1.5 text-xs font-medium">
          <span
            className={trend.positive ? "text-emerald-400" : "text-rose-400"}
          >
            {trend.value}
          </span>
          <span className="text-slate-500 text-[11px]">vs. regional average</span>
        </div>
      )}
    </GlassCard>
  );
};
