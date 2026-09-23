import React from "react";
import {
  LayoutDashboard,
  Search,
  Calculator,
  BarChart3,
  History,
  Cpu,
  BookOpen,
  Building2,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";
import { TabType } from "../Navbar";

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  systemHealthy: boolean;
  activeModelVersion: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  systemHealthy,
  activeModelVersion,
}) => {
  const navSections = [
    {
      title: "Market Intelligence",
      items: [
        { id: "overview" as TabType, label: "Executive Overview", icon: LayoutDashboard },
        { id: "explorer" as TabType, label: "Property Explorer", icon: Search },
        { id: "analytics" as TabType, label: "Market Analytics", icon: BarChart3 },
      ],
    },
    {
      title: "Valuation Terminal",
      items: [
        { id: "predictor" as TabType, label: "Valuation Studio", icon: Calculator, highlight: true },
        { id: "history" as TabType, label: "Prediction History", icon: History },
      ],
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col border-r border-slate-800/80 bg-slate-950/90 backdrop-blur-2xl min-h-screen p-5 space-y-6 select-none shadow-terminal">
      {/* Brand Header */}
      <div className="flex items-center space-x-3 px-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-glow flex-shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="font-extrabold text-sm tracking-tight text-white">
              RealEstate<span className="text-indigo-400">IQ</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              ENTERPRISE
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            King County Institutional Terminal
          </p>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 space-y-6">
        {navSections.map((sec, idx) => (
          <div key={idx} className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2.5">
              {sec.title}
            </span>
            <div className="space-y-1">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-600/20 to-indigo-500/5 text-indigo-200 border border-indigo-500/30 shadow-sm font-semibold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? "text-indigo-400"
                            : "text-slate-400 group-hover:text-slate-200"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.highlight && !isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Institutional License & System Footprint Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950/80 border border-slate-800/80 space-y-3 text-xs shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            Terminal License
          </span>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse" />
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">LIVE</span>
          </div>
        </div>
        <div className="space-y-1.5 font-mono text-[11px]">
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-500">Deed Stream:</span>
            <span className="text-emerald-400">PostgreSQL 16</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-500">ML Engine:</span>
            <span className="text-indigo-400">{activeModelVersion} (R² 0.88)</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-500">Audit Count:</span>
            <span className="text-slate-200">21,613 Deeds</span>
          </div>
        </div>
        <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Tier 1 Real Estate SaaS</span>
          <span>v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};
