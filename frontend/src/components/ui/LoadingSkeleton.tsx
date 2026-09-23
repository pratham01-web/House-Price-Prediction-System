import React from "react";
import { cn } from "../../lib/utils";

interface SkeletonProps {
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "animate-pulse bg-slate-800/60 rounded-xl",
        className
      )}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-3 w-48" />
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full rounded-xl" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-xl" />
      ))}
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="h-72 w-full flex items-end space-x-3 p-4 bg-slate-900/40 rounded-2xl border border-slate-800/80 animate-pulse">
      {[40, 65, 30, 85, 95, 50, 70, 35, 60, 80, 45, 90].map((h, i) => (
        <div
          key={i}
          className="flex-1 bg-slate-800/60 rounded-t-lg"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
};
