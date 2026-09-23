"use client";

import React, { useState, useEffect } from "react";
import { Navbar, TabType } from "../components/Navbar";
import { OverviewTab } from "../components/OverviewTab";
import { ExplorerTab } from "../components/ExplorerTab";
import { PredictorTab } from "../components/PredictorTab";
import { AnalyticsTab } from "../components/AnalyticsTab";
import { HistoryTab } from "../components/HistoryTab";
import { ModelTab } from "../components/ModelTab";
import { api } from "../lib/api";
import { MarketSummary, ModelVersion } from "../types/api";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [systemHealthy, setSystemHealthy] = useState<boolean>(true);
  const [activeModel, setActiveModel] = useState<ModelVersion | null>(null);
  const [marketSummary, setMarketSummary] = useState<MarketSummary | null>(null);

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

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemHealthy={systemHealthy}
        activeModelVersion={activeModel?.version || "v1.0.0"}
      />

      {/* Main Tab View Container */}
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
      </main>

      {/* Institutional Real Estate Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-semibold text-slate-400">
              House Price Intelligence & Prediction Platform
            </p>
            <p className="text-[11px] text-slate-600 font-mono">
              Ground Truth: King County Department of Assessments · OpenML Dataset 42092 · 21,613 Records
            </p>
          </div>
          <div className="flex items-center space-x-4 text-[11px] font-mono">
            <span>FastAPI Backend</span>
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
  );
}
