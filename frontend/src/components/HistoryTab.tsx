import React, { useState, useEffect } from "react";
import { History, ChevronLeft, ChevronRight, Clock, ShieldCheck, Database } from "lucide-react";
import { api } from "../lib/api";
import { PredictionHistoryItem } from "../types/api";
import { formatCurrency } from "../lib/utils";

export const HistoryTab: React.FC = () => {
  const [items, setItems] = useState<PredictionHistoryItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getPredictionHistory(page, 10);
      setItems(res.items);
      setTotalCount(res.total_count);
      setTotalPages(res.total_pages);
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page]);

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-glass animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2.5">
          <History className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              PostgreSQL Prediction Audit Trail
            </h3>
            <p className="text-xs text-slate-400">
              Live records persisted to the relational database with full input snapshots
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono">
          {totalCount} Total Valuations Logged
        </span>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Querying PostgreSQL predictions table...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center space-y-2">
          <Database className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No predictions recorded yet</p>
          <p className="text-xs text-slate-500">Run a prediction in the Valuation Studio to generate live audit records.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase">
                <th className="py-3 px-3">Timestamp (UTC)</th>
                <th className="py-3 px-3">Valuation Output</th>
                <th className="py-3 px-3">Model Tag</th>
                <th className="py-3 px-3">Key Features Snapshot</th>
                <th className="py-3 px-3 text-right">Inference Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {items.map((item) => {
                const feats = item.input_features || {};
                return (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-3 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-emerald-400 font-mono text-sm whitespace-nowrap">
                      {formatCurrency(item.predicted_price)}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono text-[10px]">
                        {item.model_version}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-300 text-[11px]">
                      {feats.sqft_living?.toLocaleString()} sqft · {feats.bedrooms}b/{feats.bathrooms}ba · Grade {feats.grade_score} · ZIP {feats.zipcode}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-400 text-[11px]">
                      {item.latency_ms} ms
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs font-mono text-slate-400">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-all"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
