import Link from "next/link";
import {
  Building2,
  Database,
  BrainCircuit,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  GitBranch,
} from "lucide-react";

export default function Home() {
  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col justify-center">
      {/* Top Header / Status Banner */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6 mb-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              House Price Intelligence & Prediction Platform
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              King County Housing Dataset · 21,613 Validated Sales · Enterprise ML Architecture
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Phase 01: Project Foundation Ready</span>
        </div>
      </div>

      {/* Hero Presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
        <div className="lg:col-span-7 space-y-4">
          <span className="text-xs font-semibold tracking-wider uppercase text-indigo-400">
            Real Estate Intelligence System
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Valuation Intelligence Grounded in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200">
              Verified Real Data
            </span>
          </h2>
          <p className="text-base text-slate-300 leading-relaxed">
            Eliminating synthetic placeholders and ungrounded heuristics. Every
            insight, feature contribution, and prediction traces directly to
            audited county transactions, PostgreSQL persistence, and versioned
            statistical models.
          </p>
        </div>

        {/* Foundation Architecture Card */}
        <div className="lg:col-span-5">
          <div className="glass-panel rounded-2xl p-6 space-y-4 shadow-glass">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-3">
              <span className="flex items-center space-x-1.5 text-indigo-400">
                <GitBranch className="w-4 h-4" />
                <span>Architecture Health</span>
              </span>
              <span>v1.0.0-rc</span>
            </div>

            <div className="space-y-3">
              {[
                {
                  label: "Dataset Provenance",
                  val: "King County OpenML 42092",
                  icon: Database,
                  status: "Verified",
                },
                {
                  label: "Persistence Store",
                  val: "PostgreSQL 16 Relational Schema",
                  icon: ShieldCheck,
                  status: "Configured",
                },
                {
                  label: "Inference Engine",
                  val: "FastAPI + Scikit-Learn Ensembles",
                  icon: BrainCircuit,
                  status: "Structured",
                },
                {
                  label: "Executive Analytics",
                  val: "Next.js 14+ / Recharts / Motion",
                  icon: BarChart3,
                  status: "Initialized",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    <item.icon className="w-4 h-4 text-indigo-400" />
                    <span className="text-slate-300 font-medium">{item.label}</span>
                  </div>
                  <span className="text-emerald-400 font-mono flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{item.status}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 14-Phase Implementation Progress Track */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
          Master Engineering Roadmap
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
          {[
            { phase: "01", name: "Foundation", status: "completed" },
            { phase: "02", name: "Database", status: "next" },
            { phase: "03", name: "Data Ingestion", status: "queued" },
            { phase: "04", name: "EDA Analysis", status: "queued" },
            { phase: "05", name: "ML Experiments", status: "queued" },
            { phase: "06", name: "Model Registry", status: "queued" },
            { phase: "07", name: "FastAPI Backend", status: "queued" },
            { phase: "08", name: "Premium Frontend", status: "queued" },
            { phase: "09", name: "Integration", status: "queued" },
            { phase: "10", name: "Testing Suite", status: "queued" },
            { phase: "11", name: "Security & Perf", status: "queued" },
            { phase: "12", name: "Containerization", status: "queued" },
            { phase: "13", name: "Documentation", status: "queued" },
            { phase: "14", name: "Final Audit", status: "queued" },
          ].map((item) => (
            <div
              key={item.phase}
              className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 ${
                item.status === "completed"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : item.status === "next"
                  ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-300 ring-1 ring-indigo-500/50"
                  : "bg-slate-900/40 border-slate-800/60 text-slate-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[10px]">P-{item.phase}</span>
                {item.status === "completed" && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                {item.status === "next" && <ArrowRight className="w-3 h-3 text-indigo-400 animate-pulse" />}
              </div>
              <span className="font-medium text-slate-200 text-[11px] leading-tight">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
