"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { TabType } from "../components/Navbar";
import { OverviewTab } from "../components/OverviewTab";
import { ExplorerTab } from "../components/ExplorerTab";
import { PredictorTab } from "../components/PredictorTab";
import { AnalyticsTab } from "../components/AnalyticsTab";
import { HistoryTab } from "../components/HistoryTab";
import { ModelTab } from "../components/ModelTab";
import { MethodologyView } from "../components/methodology/MethodologyView";
import { api } from "../lib/api";
import { MarketSummary, ModelVersion } from "../types/api";
import {
  LayoutDashboard,
  Search,
  Calculator,
  BarChart3,
  History,
  Cpu,
  BookOpen,
  X,
  Building2,
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [systemHealthy, setSystemHealthy] = useState<boolean>(true);
  const [activeModel, setActiveModel] = useState<ModelVersion | null>(null);
  const [marketSummary, setMarketSummary] = useState<MarketSummary | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    async function initPlatform() {
      try {
        const [healthRes, modelRes, summaryRes] = await Promise.allSettled([
          api.getHealth(),
          api.getActiveModel(),
          api.getMarketSummary(),
        ]);

        if (healthRes.status === "fulfilled") {
          setSystemHealthy(healthRes.value.database_connected);
        }
        if (modelRes.status === "fulfilled") {
          setActiveModel(modelRes.value);
        }
        if (summaryRes.status === "fulfilled") {
          setMarketSummary(summaryRes.value);
        }
      } catch (err) {
        console.warn("API initialization check error", err);
      }
    }
    initPlatform();
  }, []);

  const mobileNavItems: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "explorer", label: "Property Explorer", icon: Search },
    { id: "analytics", label: "Market Analytics", icon: BarChart3 },
    { id: "predictor", label: "Valuation Studio", icon: Calculator },
    { id: "history", label: "Prediction History", icon: History },
    { id: "model", label: "Model Performance", icon: Cpu },
    { id: "methodology", label: "Methodology", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Desktop Persistent Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setMobileMenuOpen(false);
        }}
        systemHealthy={systemHealthy}
        activeModelVersion={activeModel?.version || "v1.0.0"}
      />

      {/* Mobile Slide-over Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col w-72 max-w-xs bg-slate-950 border-r border-slate-850 p-6 z-10 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-sm text-white tracking-tight">
                  RealEstate<span className="text-indigo-400">IQ</span>
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1">
              {mobileNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-900 text-[11px] font-mono text-slate-500">
              King County 21,613 Validated Sales
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          systemHealthy={systemHealthy}
          activeModelVersion={activeModel?.version || "v1.0.0"}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === "overview" && (
            <OverviewTab
              summary={marketSummary}
              activeModel={activeModel}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === "explorer" && <ExplorerTab />}

          {activeTab === "predictor" && <PredictorTab />}

          {activeTab === "analytics" && <AnalyticsTab />}

          {activeTab === "history" && <HistoryTab />}

          {activeTab === "model" && <ModelTab />}

          {activeTab === "methodology" && <MethodologyView />}
        </main>

        {/* Institutional Real Estate Footer */}
        <footer className="border-t border-slate-900 bg-slate-950/60 py-6 mt-12 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <p className="font-semibold text-slate-400">
                House Price Intelligence & Prediction Platform
              </p>
              <p className="text-[11px] text-slate-600 font-mono">
                King County Department of Assessments · OpenML Dataset 42092 · 21,613 Records
              </p>
            </div>
            <div className="flex items-center space-x-4 text-[11px] font-mono">
              <span>FastAPI 0.111+</span>
              <span>•</span>
              <span>PostgreSQL 16</span>
              <span>•</span>
              <span>HistGradientBoosting (R² 0.88)</span>
              <span>•</span>
              <span>Next.js 14 App Router</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
