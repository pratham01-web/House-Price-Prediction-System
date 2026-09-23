import React from "react";
import {
  LayoutDashboard,
  Search,
  Calculator,
  BarChart3,
  History,
  Building2,
  Activity,
  Layers,
  LogOut,
} from "lucide-react";
import { TabType } from "../Navbar";

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  systemHealthy: boolean;
  activeModelVersion: string;
  user?: { name: string; email: string; role?: string } | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  systemHealthy,
  activeModelVersion,
  user,
  onLogout,
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
    <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col border-r border-neutral-850 bg-black/95 backdrop-blur-2xl min-h-screen p-5 space-y-6 select-none shadow-terminal">
      {/* Brand Header */}
      <div className="flex items-center space-x-3 px-2">
        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-black flex-shrink-0 shadow-sm">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="font-extrabold text-sm tracking-tight text-white">
              RealEstate<span className="text-neutral-400">IQ</span>
            </span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-white/10 text-neutral-200 border border-white/20">
              PRO
            </span>
          </div>
          <p className="text-[10px] text-neutral-400 font-mono">
            Institutional Terminal
          </p>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 space-y-6">
        {navSections.map((sec, idx) => (
          <div key={idx} className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 px-2.5">
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
                        ? "bg-white/10 text-white border border-white/20 shadow-sm font-semibold"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? "text-white"
                            : "text-neutral-400 group-hover:text-neutral-200"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.highlight && !isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Institutional License & System Footprint Card */}
      <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 space-y-3 text-xs shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">
            Terminal License
          </span>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse" />
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">LIVE</span>
          </div>
        </div>
        <div className="space-y-1.5 font-mono text-[11px]">
          <div className="flex justify-between text-neutral-300">
            <span className="text-neutral-500">Deed Stream:</span>
            <span className="text-white">PostgreSQL 16</span>
          </div>
          <div className="flex justify-between text-neutral-300">
            <span className="text-neutral-500">ML Engine:</span>
            <span className="text-neutral-300">{activeModelVersion} (R² 0.88)</span>
          </div>
          <div className="flex justify-between text-neutral-300">
            <span className="text-neutral-500">Audited Deeds:</span>
            <span className="text-neutral-200">21,613 Sales</span>
          </div>
        </div>
        <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
          <span>Enterprise License</span>
          <span>v1.0.0</span>
        </div>
      </div>

      {/* Analyst Profile & Sign Out Action */}
      {user && (
        <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white font-mono font-bold text-xs flex-shrink-0">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-white block truncate">{user.name}</span>
              <span className="text-[10px] text-neutral-400 font-mono block truncate">{user.role || "Analyst"}</span>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Lock Terminal & Sign Out"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors flex-shrink-0 ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </aside>
  );
};
