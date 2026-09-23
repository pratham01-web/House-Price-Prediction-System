import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, TrendingUp, MapPin, Activity, HelpCircle, Layers, Waves, Award } from "lucide-react";
import { api } from "../lib/api";
import { PriceDistributionResponse, FeatureCorrelation, LocationMetric } from "../types/api";
import { formatCurrency, formatNumber } from "../lib/utils";

export const AnalyticsTab: React.FC = () => {
  const [distData, setDistData] = useState<PriceDistributionResponse | null>(null);
  const [correlations, setCorrelations] = useState<FeatureCorrelation[]>([]);
  const [locations, setLocations] = useState<LocationMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const [dRes, cRes, lRes] = await Promise.all([
          api.getPriceDistribution(),
          api.getFeatureCorrelations(),
          api.getLocationBreakdown(),
        ]);
        setDistData(dRes);
        setCorrelations(cRes.correlations);
        setLocations(lRes.locations);
      } catch (err) {
        console.error("Failed to load analytics data", err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-mono">Aggregating 21,613 PostgreSQL records...</p>
      </div>
    );
  }

  // Prep top 8 expensive and affordable zips for display
  const topExpensive = locations.slice(0, 8);
  const topAffordable = [...locations].sort((a, b) => a.avg_price - b.avg_price).slice(0, 8);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Quantitative Benchmark Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "County Median", value: "$450,000", sub: "50th Percentile", color: "text-white" },
          { label: "Interquartile Range (IQR)", value: "$322k – $645k", sub: "25th to 75th Percentile", color: "text-indigo-400" },
          { label: "Peak Recorded Deed", value: "$7,700,000", sub: "Medina Waterfront (98039)", color: "text-emerald-400" },
          { label: "Floor Recorded Deed", value: "$75,000", sub: "Rural South County (98022)", color: "text-cyan-400" },
        ].map((item, idx) => (
          <div key={idx} className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">{item.label}</span>
            <p className={`text-xl font-bold font-mono tracking-tight ${item.color}`}>{item.value}</p>
            <p className="text-[10px] text-slate-500 font-mono">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* 2. Price Distribution Histogram */}
      <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-slate-800 space-y-4 shadow-terminal">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Authentic Closing Price Distribution (21,613 Deeds)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Empirical density across single-family residential transactions in King County ($100k to $1.6M+)
            </p>
          </div>
          <span className="px-3 py-1 text-xs font-mono rounded-lg bg-slate-900 border border-slate-800 text-indigo-300 font-semibold">
            Skewness: 4.02 · Right-Skewed Log-Normal
          </span>
        </div>

        <div className="h-80 w-full pt-4">
          {distData && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distData.bins} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="bin_range"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
                          <p className="font-bold text-white font-mono">{data.bin_range}</p>
                          <p className="text-indigo-400 font-mono font-semibold">
                            {formatNumber(data.count)} Recorded Sales
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {((data.count / 21613) * 100).toFixed(1)}% of total county volume
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 3. Feature Correlation Ranking */}
      <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-slate-800 space-y-4 shadow-terminal">
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Empirical Value Determinants (Pearson Correlation with Price)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Physical square footage (+0.70) and county construction grade (+0.67) govern primary price formation
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {correlations.map((item, idx) => {
            const widthPct = Math.min(100, Math.max(5, Math.abs(item.correlation) * 100));
            return (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-200">
                    {item.feature} <span className="text-slate-400 font-normal">({item.description})</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    +{item.correlation.toFixed(4)}
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-400 rounded-full"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Geographic Price Extremes (Zip Codes) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expensive Zips */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 shadow-terminal">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Top 8 Premium Sub-Markets (Highest Median)
              </h4>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Eastside Luxury Corridor</span>
          </div>
          <div className="space-y-2">
            {topExpensive.map((loc) => (
              <div
                key={loc.zipcode}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-white text-sm">ZIP {loc.zipcode}</span>
                  <p className="text-[11px] text-slate-400 font-mono">{loc.property_count} verified deeds</p>
                </div>
                <div className="text-right font-mono">
                  <span className="font-bold text-emerald-400 text-sm">
                    {formatCurrency(loc.avg_price)}
                  </span>
                  <p className="text-[11px] text-slate-300">${loc.avg_price_per_sqft}/SF</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Affordable Zips */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 shadow-terminal">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Top 8 High-Affordability Sub-Markets
              </h4>
            </div>
            <span className="text-[10px] font-mono text-slate-400">South County Accessible</span>
          </div>
          <div className="space-y-2">
            {topAffordable.map((loc) => (
              <div
                key={loc.zipcode}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-white text-sm">ZIP {loc.zipcode}</span>
                  <p className="text-[11px] text-slate-400 font-mono">{loc.property_count} verified deeds</p>
                </div>
                <div className="text-right font-mono">
                  <span className="font-bold text-cyan-400 text-sm">
                    {formatCurrency(loc.avg_price)}
                  </span>
                  <p className="text-[11px] text-slate-300">${loc.avg_price_per_sqft}/SF</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
