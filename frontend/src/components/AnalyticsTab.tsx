import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { BarChart3, TrendingUp, MapPin, Activity, HelpCircle } from "lucide-react";
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
        <p className="text-xs text-slate-400 font-mono">Loading PostgreSQL market aggregations...</p>
      </div>
    );
  }

  // Prep top 7 expensive and affordable zips for display
  const topExpensive = locations.slice(0, 8);
  const topAffordable = [...locations].sort((a, b) => a.avg_price - b.avg_price).slice(0, 8);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Price Distribution Histogram */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4 shadow-glass">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Authentic Price Distribution (21,613 Sales)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Right-skewed residential property sales in King County between $100k and $1.6M
            </p>
          </div>
          <span className="px-2.5 py-1 text-[11px] font-mono rounded bg-slate-900 border border-slate-800 text-slate-300">
            Median: $450,000
          </span>
        </div>

        <div className="h-72 w-full pt-4">
          {distData && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distData.bins} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
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
                        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                          <p className="font-bold text-white">{data.bin_range}</p>
                          <p className="text-indigo-400">{formatNumber(data.count)} Recorded Sales</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2. Feature Correlation Ranking */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4 shadow-glass">
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Feature Correlation with Sale Price (Pearson Coefficient)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Living space (0.70) and building construction grade (0.67) demonstrate highest direct correlation
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {correlations.map((item, idx) => {
            const widthPct = Math.min(100, Math.max(5, Math.abs(item.correlation) * 100));
            return (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-200">
                    {item.feature} <span className="text-slate-500 font-normal">({item.description})</span>
                  </span>
                  <span className="font-mono font-bold text-indigo-400">
                    +{item.correlation.toFixed(4)}
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Geographic Price Extremes (Zip Codes) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expensive Zips */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 shadow-glass">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <MapPin className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Top 8 Premium Zip Codes
            </h4>
          </div>
          <div className="space-y-2">
            {topExpensive.map((loc) => (
              <div
                key={loc.zipcode}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-white">ZIP {loc.zipcode}</span>
                  <p className="text-[10px] text-slate-400">{loc.property_count} verified transactions</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-400 font-mono">
                    {formatCurrency(loc.avg_price)}
                  </span>
                  <p className="text-[10px] text-slate-400">${loc.avg_price_per_sqft}/sqft</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Affordable Zips */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 shadow-glass">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Top 8 High-Value / Accessible Zip Codes
            </h4>
          </div>
          <div className="space-y-2">
            {topAffordable.map((loc) => (
              <div
                key={loc.zipcode}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-white">ZIP {loc.zipcode}</span>
                  <p className="text-[10px] text-slate-400">{loc.property_count} verified transactions</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-cyan-400 font-mono">
                    {formatCurrency(loc.avg_price)}
                  </span>
                  <p className="text-[10px] text-slate-400">${loc.avg_price_per_sqft}/sqft</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
