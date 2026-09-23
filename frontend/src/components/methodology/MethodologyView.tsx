import React from "react";
import {
  Database,
  Filter,
  Layers,
  Cpu,
  BarChart,
  CheckCircle2,
  AlertTriangle,
  GitBranch,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { SectionHeader } from "../ui/SectionHeader";
import { Beams } from "../effects/Beams";

export const MethodologyView: React.FC = () => {
  const steps = [
    {
      num: "01",
      title: "Real Public Dataset Acquisition",
      icon: Database,
      desc: "21,613 authentic single-family and condominium transaction records sourced from the King County Department of Assessments and curated distribution OpenML (ID: 42092). Zero synthetic rows.",
      details: [
        "Time window: May 2014 through May 2015 residential transactions",
        "Geographic bounds: Greater Seattle metropolitan region across 70 ZIP codes",
        "Target variable: Recorded transaction closing price ($75k to $7.7M)",
      ],
    },
    {
      num: "02",
      title: "Data Hygiene & Typographical Remediation",
      icon: Filter,
      desc: "Deterministic cleaning pipeline implemented in ml/src/ingest_data.py to ensure zero database constraint violations and eliminate known public recording errors.",
      details: [
        "Typo fix: Parcel with bedrooms == 33 on 1,620 sqft living was corrected to 3 bedrooms",
        "Date parsing: ISO timestamp strings standardized to YYYY-MM-DD format",
        "Null integrity: Zero missing or null values across all 20 features",
      ],
    },
    {
      num: "03",
      title: "Deterministic Feature Engineering",
      icon: Layers,
      desc: "Domain-specific architectural ratios and temporal wear variables engineered strictly prior to estimator fitting.",
      details: [
        "effective_age: 2015 - max(yr_built, yr_renovated)",
        "living_to_lot_ratio: sqft_living / max(sqft_lot, 1.0)",
        "bed_bath_ratio: bedrooms / max(bathrooms, 0.5)",
        "total_sqft: sqft_living + sqft_basement",
        "basement_ratio: sqft_basement / max(sqft_living, 1.0)",
      ],
    },
    {
      num: "04",
      title: "Train / Test Splitting & Leakage Guards",
      icon: ShieldCheck,
      desc: "Strict featurization ordering adhering to ML Best Practices. The dataset is partitioned into 80% training (n=17,290) and 20% holdout test (n=4,323) sets with a deterministic seed (42).",
      details: [
        "All transformers (SimpleImputer, OneHotEncoder) are fitted strictly on the 80% training split",
        "Zero target encoding or summary leakage into the holdout test set",
        "5-Fold Cross-Validation on the training partition to assess generalization variance",
      ],
    },
    {
      num: "05",
      title: "Multi-Model Empirical Benchmarking",
      icon: Cpu,
      desc: "Rigorous head-to-head comparison across 5 candidate models to justify production selection based on out-of-sample predictive power and latency.",
      details: [
        "Linear Regression (Baseline): R² = 0.8109, MAE = $98,099.22, RMSE = $169,056.70",
        "Ridge Regression (L2): R² = 0.8078, MAE = $98,568.42, RMSE = $170,455.51",
        "Random Forest Regressor: R² = 0.8388, MAE = $73,837.05, RMSE = $156,114.63",
        "Gradient Boosting Regressor: R² = 0.8635, MAE = $71,057.80, RMSE = $143,629.54",
        "HistGradientBoosting (Winner): R² = 0.8777, MAE = $69,115.12, RMSE = $135,998.18",
      ],
    },
    {
      num: "06",
      title: "Model Serialization & PostgreSQL Registry",
      icon: GitBranch,
      desc: "The winning HistGradientBoosting pipeline is encapsulated into an immutable Scikit-learn Pipeline and persisted with comprehensive metadata.",
      details: [
        "Artifact: ml/models/v1.0.0/model.joblib compressed with Joblib level 3",
        "Metadata: JSON specification capturing feature names, hyperparameters, and test scores",
        "PostgreSQL model_versions table: Relational tracking with foreign keys to King County dataset",
      ],
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header with Subtle Beams Ambient Visual */}
      <div className="relative glass-panel rounded-2xl p-6 sm:p-8 overflow-hidden border border-indigo-500/20 shadow-glass">
        <Beams beamNumber={8} speed={0.3} noiseIntensity={0.2} />
        <div className="relative z-10 max-w-3xl space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            Phase 13: Technical Methodology & System Specification
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Engineering Transparency & Reproducibility
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Institutional real estate analytics requires absolute auditability.
            This document outlines the end-to-end data lifecycle from raw King County
            transaction records through relational persistence, deterministic feature
            engineering, and tree-based ensemble inference.
          </p>
        </div>
      </div>

      {/* 6-Stage Methodology Workflow Cards */}
      <div className="space-y-4">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <GlassCard key={step.num} padding="md" className="space-y-3 border-slate-800">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                    STAGE {step.num}
                  </span>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {step.title}
                  </h3>
                </div>
                <div className="p-2 rounded-xl bg-slate-800/80 text-slate-400">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pl-1">
                {step.desc}
              </p>

              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-850 space-y-1.5">
                {step.details.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-xs text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="font-mono text-[11px] leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Known Limitations & Model Boundaries */}
      <GlassCard padding="lg" className="border-amber-500/30 bg-amber-950/10 space-y-4">
        <div className="flex items-center space-x-2 text-amber-400">
          <AlertTriangle className="w-5 h-5" />
          <h4 className="text-sm font-bold uppercase tracking-wider">
            Documented Model Limitations & Operational Boundaries
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="font-semibold text-white">Temporal Frame (2014–2015 Baseline)</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Sales transactions represent historical closing valuations in 2014–2015. While spatial and physical relationships (e.g. waterfront multiplier, grade premiums) remain highly robust, absolute figures must be inflation-indexed for contemporary spot settlement.
            </p>
          </div>

          <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="font-semibold text-white">Top 0.5% Super-Luxury Variance</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              For properties exceeding $3.5M (primarily Lake Washington waterfront mansions), custom ultra-luxury finishes not recorded in standardized county tax assessments introduce wider residual error bands.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
