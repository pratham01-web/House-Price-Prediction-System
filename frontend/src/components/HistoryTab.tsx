import React, { useState, useEffect } from "react";
import { History, ChevronLeft, ChevronRight, Clock, ShieldCheck, Database, Download, FileSpreadsheet, RefreshCw } from "lucide-react";
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
      const res = await api.getPredictionHistory(page, 12);
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

  const exportToCSV = () => {
    if (!items.length) return;
    const headers = [
      "Prediction_ID",
      "Timestamp_UTC",
      "Valuation_USD",
      "Model_Version",
      "Latency_MS",
      "ZIP_Code",
      "Bedrooms",
      "Bathrooms",
      "Living_SqFt",
      "Grade_Score",
    ];

    const rows = items.map((i) => {
      const f = i.input_features || {};
      return [
        `"${i.id}"`,
        `"${i.created_at}"`,
        i.predicted_price,
        `"${i.model_version}"`,
        i.latency_ms,
        `"${f.zipcode || ""}"`,
        f.bedrooms || "",
        f.bathrooms || "",
        f.sqft_living || "",
        f.grade_score || "",
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `king_county_valuations_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compute average valuation of current page items
  const avgValuation = items.length > 0 ? items.reduce((acc, curr) => acc + curr.predicted_price, 0) / items.length : 0;
  const maxValuation = items.length > 0 ? Math.max(...items.map((i) => i.predicted_price)) : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. History Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Total Valuations Audited</span>
          <p className="text-2xl font-bold font-mono text-white tracking-tight">{totalCount}</p>
          <p className="text-[10px] text-slate-500 font-mono">Persisted to PostgreSQL</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Page Avg Valuation</span>
          <p className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">{formatCurrency(avgValuation)}</p>
          <p className="text-[10px] text-slate-500 font-mono">{items.length} records in view</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Page Peak Valuation</span>
          <p className="text-2xl font-bold font-mono text-cyan-400 tracking-tight">{formatCurrency(maxValuation)}</p>
          <p className="text-[10px] text-slate-500 font-mono">Highest estimated property</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Audit Database</span>
          <p className="text-2xl font-bold font-mono text-indigo-400 tracking-tight">PostgreSQL 16</p>
          <p className="text-[10px] text-emerald-400 font-mono flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>ACID Compliant</span>
          </p>
        </div>
      </div>

      {/* 2. Main Relational Audit Trail Table */}
      <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-slate-800 space-y-5 shadow-terminal">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                PostgreSQL Relational Valuation Audit Trail
              </h3>
              <p className="text-xs text-slate-400">
                Immutable audit ledger recording every valuation inference with full input parameters
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={exportToCSV}
              disabled={items.length === 0}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-750 text-xs font-semibold transition-all disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={fetchHistory}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 text-xs transition-all"
              title="Refresh Audit Records"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-mono">Querying PostgreSQL predictions table...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Database className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No predictions recorded yet</p>
            <p className="text-xs text-slate-500">Run a prediction in the Valuation Studio to generate verifiable audit entries.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase font-mono bg-slate-900/40">
                  <th className="py-3 px-3">Timestamp (UTC)</th>
                  <th className="py-3 px-3">Valuation Output</th>
                  <th className="py-3 px-3">Model Tag</th>
                  <th className="py-3 px-3">Input Features Snapshot</th>
                  <th className="py-3 px-3">ZIP Code</th>
                  <th className="py-3 px-3 text-right">Inference Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-mono text-[11px]">
                {items.map((item) => {
                  const feats = item.input_features || {};
                  return (
                    <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap">
                        {new Date(item.created_at).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-emerald-400 text-sm whitespace-nowrap">
                        {formatCurrency(item.predicted_price)}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-bold">
                          {item.model_version}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-300 font-sans text-xs">
                        {feats.sqft_living?.toLocaleString()} SF · {feats.bedrooms}b/{feats.bathrooms}ba · Grade {feats.grade_score} · Condition {feats.condition_score}
                      </td>
                      <td className="py-3.5 px-3 text-slate-300">
                        {feats.zipcode}
                      </td>
                      <td className="py-3.5 px-3 text-right text-cyan-400">
                        {item.latency_ms} ms
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-800 pt-4 font-mono text-xs">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-850 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-slate-400">
              Page <span className="text-white font-bold">{page}</span> of <span className="text-white font-bold">{totalPages}</span>
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-850 transition-all"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
