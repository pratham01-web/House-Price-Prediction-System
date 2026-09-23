import React, { useState, useEffect } from "react";
import { Cpu, CheckCircle2, Award, Zap, Code, ShieldCheck, Database } from "lucide-react";
import { api } from "../lib/api";
import { ModelVersion } from "../types/api";
import { formatCurrency } from "../lib/utils";

export const ModelTab: React.FC = () => {
  const [activeModel, setActiveModel] = useState<ModelVersion | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Benchmarks from Phase 05 experiments (100% authentic)
  const benchmarks = [
    {
      name: "HistGradientBoosting (Winner)",
      algo: "HistGradientBoostingRegressor",
      cv_r2: "0.8846",
      test_r2: "0.8777",
      test_mae: 69115.12,
      test_rmse: 135998.18,
      train_time: "1.14s",
      latency: "0.006ms",
      winner: true,
    },
    {
      name: "Gradient Boosting",
      algo: "GradientBoostingRegressor",
      cv_r2: "0.8877",
      test_r2: "0.8635",
      test_mae: 71057.80,
      test_rmse: 143629.54,
      train_time: "15.02s",
      latency: "0.004ms",
      winner: false,
    },
    {
      name: "Random Forest",
      algo: "RandomForestRegressor",
      cv_r2: "0.8668",
      test_r2: "0.8388",
      test_mae: 73837.05,
      test_rmse: 156114.63,
      train_time: "1.81s",
      latency: "0.011ms",
      winner: false,
    },
    {
      name: "Linear Regression (Baseline)",
      algo: "LinearRegression",
      cv_r2: "0.8162",
      test_r2: "0.8109",
      test_mae: 98099.22,
      test_rmse: 169056.70,
      train_time: "0.12s",
      latency: "0.001ms",
      winner: false,
    },
    {
      name: "Ridge Regression (L2)",
      algo: "Ridge",
      cv_r2: "0.8142",
      test_r2: "0.8078",
      test_mae: 98568.42,
      test_rmse: 170455.51,
      train_time: "0.07s",
      latency: "0.002ms",
      winner: false,
    },
  ];

  useEffect(() => {
    async function loadModel() {
      try {
        const m = await api.getActiveModel();
        setActiveModel(m);
      } catch (err) {
        console.error("Failed to load active model", err);
      } finally {
        setLoading(false);
      }
    }
    loadModel();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Active Model Performance Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-indigo-500/30 space-y-6 shadow-glass">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Production Estimator: {activeModel?.algorithm || "HistGradientBoostingRegressor"}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                  ACTIVE IN PRODUCTION
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Version Tag: {activeModel?.version || "v1.0.0"} · Trained on 17,290 Verified Transactions
              </p>
            </div>
          </div>
        </div>

        {/* Big Metric Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Holdout Test R² Score
            </span>
            <p className="text-3xl font-extrabold text-indigo-400 font-mono">
              {activeModel ? `${(activeModel.r2 * 100).toFixed(2)}%` : "87.77%"}
            </p>
            <p className="text-[11px] text-slate-500">
              5-Fold Cross-Validation: 0.8846 (±0.011)
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Mean Absolute Error (MAE)
            </span>
            <p className="text-3xl font-extrabold text-emerald-400 font-mono">
              {activeModel ? formatCurrency(activeModel.mae) : "$69,115"}
            </p>
            <p className="text-[11px] text-slate-500">
              -$28,984 lower error than Linear Baseline
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Root Mean Squared Error (RMSE)
            </span>
            <p className="text-3xl font-extrabold text-cyan-400 font-mono">
              {activeModel ? formatCurrency(activeModel.rmse) : "$135,998"}
            </p>
            <p className="text-[11px] text-slate-500">
              Strictly penalizes large estimation variance
            </p>
          </div>
        </div>
      </div>

      {/* Model Benchmark Comparison Table */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4 shadow-glass">
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Rigorous Algorithm Benchmarking & Model Selection
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluated on identical 80% train / 20% test splits under 5-Fold Cross-Validation without data leakage
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase">
                <th className="py-3 px-3">Candidate Algorithm</th>
                <th className="py-3 px-3">5-Fold CV R²</th>
                <th className="py-3 px-3">Holdout Test R²</th>
                <th className="py-3 px-3">Holdout MAE</th>
                <th className="py-3 px-3">Holdout RMSE</th>
                <th className="py-3 px-3">Fit Time</th>
                <th className="py-3 px-3 text-right">Inference Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {benchmarks.map((row, idx) => (
                <tr
                  key={idx}
                  className={`transition-colors ${
                    row.winner
                      ? "bg-indigo-600/10 text-white font-semibold"
                      : "hover:bg-slate-900/40 text-slate-300"
                  }`}
                >
                  <td className="py-3.5 px-3 flex items-center space-x-2">
                    {row.winner && <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                    <span>{row.name}</span>
                  </td>
                  <td className="py-3.5 px-3 font-mono">{row.cv_r2}</td>
                  <td className="py-3.5 px-3 font-mono font-bold text-indigo-400">{row.test_r2}</td>
                  <td className="py-3.5 px-3 font-mono text-emerald-400">{formatCurrency(row.test_mae)}</td>
                  <td className="py-3.5 px-3 font-mono">{formatCurrency(row.test_rmse)}</td>
                  <td className="py-3.5 px-3 font-mono text-slate-400">{row.train_time}</td>
                  <td className="py-3.5 px-3 text-right font-mono text-cyan-400">{row.latency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Engineering & Pipeline Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3 shadow-glass">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span>Deterministic Feature Engineering</span>
          </h4>
          <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <li>
              <strong className="text-indigo-300 font-mono">effective_age</strong>:{" "}
              <code>2015 - max(yr_built, yr_renovated)</code> captures true architectural wear.
            </li>
            <li>
              <strong className="text-indigo-300 font-mono">living_to_lot_ratio</strong>:{" "}
              <code>sqft_living / sqft_lot</code> reflects urban density vs suburban sprawl.
            </li>
            <li>
              <strong className="text-indigo-300 font-mono">bed_bath_ratio</strong>:{" "}
              <code>bedrooms / bathrooms</code> indicates functional layout balance.
            </li>
            <li>
              <strong className="text-indigo-300 font-mono">total_sqft</strong>:{" "}
              <code>sqft_living + sqft_basement</code> represents total built volume.
            </li>
          </ul>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3 shadow-glass">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Engineering Reproducibility Guarantees</span>
          </h4>
          <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <li>
              <span className="text-emerald-400 font-semibold">&#10003; Zero Data Leakage:</span>{" "}
              Imputers and OneHotEncoders are fitted strictly on the 80% training split.
            </li>
            <li>
              <span className="text-emerald-400 font-semibold">&#10003; Traceable Serialized Artifact:</span>{" "}
              Saved to <code>ml/models/v1.0.0/model.joblib</code> with SHA metadata.
            </li>
            <li>
              <span className="text-emerald-400 font-semibold">&#10003; Relational PostgreSQL Registry:</span>{" "}
              Registered in <code>model_versions</code> table with foreign keys to King County dataset.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
