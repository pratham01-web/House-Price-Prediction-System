import React from "react";
import { Activity, ShieldCheck, Database, Menu, X, ArrowUpRight } from "lucide-react";
import { TabType } from "../Navbar";

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  systemHealthy: boolean;
  activeModelVersion: string;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  systemHealthy,
  activeModelVersion,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const titles: Record<TabType, string> = {
    overview: "Institutional Market Terminal & Core KPIs",
    explorer: "Verified Property Screener (21,613 Deeds)",
    predictor: "Machine Learning Appraisal & Valuation Studio",
    analytics: "Empirical Real Estate Analytics & Distributions",
    history: "PostgreSQL Prediction Audit History",
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 h-16 flex items-center justify-between px-4 sm:px-8">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div>
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
            {titles[activeTab] || "Real Estate Intelligence Platform"}
          </h1>
          <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
            King County Open Data · Verified Recorded Transactions
          </p>
        </div>
      </div>

      {/* Right Action & System Pills */}
      <div className="flex items-center space-x-3">
        <div
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono border ${
            systemHealthy
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-amber-500/10 border-amber-500/30 text-amber-400"
          }`}
        >
          <Activity className="w-3 h-3 animate-pulse" />
          <span>{systemHealthy ? "FastAPI & PostgreSQL Live" : "Connecting..."}</span>
        </div>

        <a
          href="http://127.0.0.1:8000/docs"
          target="_blank"
          rel="noreferrer"
          className="hidden md:flex items-center space-x-1 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 text-xs font-medium transition-all"
        >
          <span>Swagger API</span>
          <ArrowUpRight className="w-3 h-3 text-slate-400" />
        </a>
      </div>
    </header>
  );
};
