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
import { BeamsBackground } from "../components/effects/BeamsBackground";
import { LoginPage } from "../components/auth/LoginPage";
import { api } from "../lib/api";
import { MarketSummary, ModelVersion, Property } from "../types/api";
import {
  LayoutDashboard,
  Search,
  Calculator,
  BarChart3,
  History,
  X,
  Building2,
  LogOut,
} from "lucide-react";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [systemHealthy, setSystemHealthy] = useState<boolean>(true);
  const [activeModel, setActiveModel] = useState<ModelVersion | null>(null);
  const [marketSummary, setMarketSummary] = useState<MarketSummary | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [selectedPropertyForValuation, setSelectedPropertyForValuation] = useState<Property | null>(null);

  useEffect(() => {
    // Check if session exists in sessionStorage
    try {
      const saved = sessionStorage.getItem("realestateiq_session");
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        setIsAuthenticated(true);
      }
    } catch (e) {
      // ignore
    }
  }, []);

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

  const handleLogin = (userData: { name: string; role: string; email: string }) => {
    setUser(userData);
    setIsAuthenticated(true);
    try {
      sessionStorage.setItem("realestateiq_session", JSON.stringify(userData));
    } catch (e) {
      // ignore
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    try {
      sessionStorage.removeItem("realestateiq_session");
    } catch (e) {
      // ignore
    }
  };

  const mobileNavItems: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Executive Overview", icon: LayoutDashboard },
    { id: "explorer", label: "Property Explorer", icon: Search },
    { id: "analytics", label: "Market Analytics", icon: BarChart3 },
    { id: "predictor", label: "Valuation Studio", icon: Calculator },
    { id: "history", label: "Prediction History", icon: History },
  ];

  const handleSendToPredictor = (property: Property) => {
    setSelectedPropertyForValuation(property);
    setActiveTab("predictor");
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex bg-black text-white selection:bg-neutral-800 selection:text-white relative">
      {/* React Bits Ambient Three.js Beams Background Canvas */}
      <BeamsBackground
        beamWidth={2}
        beamHeight={15}
        beamNumber={12}
        lightColor="#ffffff"
        speed={2}
        noiseIntensity={1.75}
        scale={0.2}
        rotation={0}
      />

      {/* Desktop Persistent Sidebar */}
      <div className="relative z-20 flex-shrink-0">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setMobileMenuOpen(false);
          }}
          systemHealthy={systemHealthy}
          activeModelVersion={activeModel?.version || "v1.0.0"}
          user={user}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile Slide-over Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative flex flex-col w-72 max-w-xs bg-black border-r border-neutral-800 p-6 z-10 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-sm text-white tracking-tight">
                  RealEstate<span className="text-neutral-400">IQ</span>
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900"
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
                        ? "bg-white/10 text-white border border-white/20 font-semibold"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-neutral-400"}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-neutral-900 space-y-3">
              {user && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono">
                  <div className="truncate">
                    <span className="text-white block font-semibold truncate">{user.name}</span>
                    <span className="text-neutral-500 block text-[10px] truncate">{user.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-neutral-400 hover:text-white"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="text-[11px] font-mono text-neutral-500">
                King County 21,613 Validated Deeds
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          systemHealthy={systemHealthy}
          activeModelVersion={activeModel?.version || "v1.0.0"}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          user={user}
          onLogout={handleLogout}
        />

        <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {activeTab === "overview" && (
            <OverviewTab
              summary={marketSummary}
              activeModel={activeModel}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === "explorer" && (
            <ExplorerTab onSendToPredictor={handleSendToPredictor} />
          )}

          {activeTab === "predictor" && (
            <PredictorTab prefilledProperty={selectedPropertyForValuation} />
          )}

          {activeTab === "analytics" && <AnalyticsTab />}

          {activeTab === "history" && <HistoryTab />}
        </main>

        {/* Institutional Minimalist Pure Black Footer */}
        <footer className="border-t border-neutral-850 bg-black/80 backdrop-blur-xl py-6 mt-12 text-xs text-neutral-500">
          <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <p className="font-semibold text-neutral-300">
                House Price Intelligence & Prediction Platform
              </p>
              <p className="text-[11px] text-neutral-500 font-mono">
                King County Department of Assessments · OpenML 42092 · 21,613 Verified Transaction Deeds
              </p>
            </div>
            <div className="flex items-center space-x-4 text-[11px] font-mono text-neutral-400">
              <span>FastAPI 0.111+</span>
              <span>•</span>
              <span>PostgreSQL 16</span>
              <span>•</span>
              <span className="text-white font-semibold">HistGradientBoosting (R² 0.88)</span>
              <span>•</span>
              <span>Next.js 14 App Router</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
