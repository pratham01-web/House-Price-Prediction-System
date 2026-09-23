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
  activeTab: TabType | "methodology";
  setActiveTab: (tab: any) => void;
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
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "explorer", label: "Property Explorer", icon: Search },
        { id: "analytics", label: "Market Analytics", icon: BarChart3 },
      ],
    },
    {
      title: "Machine Learning",
      items: [
        { id: "predictor", label: "Valuation Studio", icon: Calculator, highlight: true },
        { id: "history", label: "Prediction History", icon: History },
        { id: "model", label: "Model Performance", icon: Cpu },
      ],
    },
    {
      title: "Transparency",
      items: [
        { id: "methodology", label: "Methodology", icon: BookOpen },
      ],
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col border-r border-slate-800/80 bg-slate-950/80 backdrop-blur-xl min-h-screen p-5 space-y-6 select-none">
      {/* Brand Header */}
      <div className="flex items-center space-x-3 px-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-glow flex-shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="font-extrabold text-sm tracking-tight text-white">
              RealEstate<span className="text-indigo-400">IQ</span>
            </span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              PRO
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            King County ML Analytics
          </p>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 space-y-6">
        {navSections.map((sec, idx) => (
          <div key={idx} className="space-y-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-2.5">
              {sec.title}
            </span>
            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                      isActive
                        ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? "text-indigo-400"
                            : "text-slate-400 group-hover:text-slate-300"
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

      {/* System Status Footprint Card */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">
            Backend Architecture
          </span>
          <div
            className={`w-2 h-2 rounded-full ${
              systemHealthy ? "bg-emerald-400 shadow-[0_0_8px_#10b981]" : "bg-amber-400"
            }`}
          />
        </div>
        <div className="space-y-1 font-mono text-[11px]">
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-500">PostgreSQL:</span>
            <span className="text-emerald-400">Connected</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-500">Model:</span>
            <span className="text-indigo-400">{activeModelVersion}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-500">Dataset:</span>
            <span>21,613 Sales</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
