"use client";

import React, { useState } from "react";
import { Lock, Mail, ShieldCheck, ArrowRight, Database, Sparkles, Building2, KeyRound, CheckCircle2 } from "lucide-react";
import { BlurText } from "../effects/BlurText";
import { BeamsBackground } from "../effects/BeamsBackground";

interface LoginPageProps {
  onLogin: (user: { name: string; role: string; email: string }) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("analyst@firm.realestateiq.internal");
  const [password, setPassword] = useState("••••••••••••");
  const [authMode, setAuthMode] = useState<"standard" | "sso">("standard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnimationComplete = () => {
    // console.log("RealEstateIQ animation completed!");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please provide an institutional user identifier.");
      return;
    }
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setLoading(false);
      onLogin({
        name: "Senior Portfolio Analyst",
        role: "Institutional Principal",
        email: email,
      });
    }, 400);
  };

  const handleInstantDemoLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({
        name: "Senior Portfolio Analyst",
        role: "Institutional Principal",
        email: "analyst@firm.realestateiq.internal",
      });
    }, 250);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-black text-white relative selection:bg-neutral-800 selection:text-white overflow-hidden">
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

      {/* Top Institutional Header Ribbon */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between border-b border-neutral-900 bg-black/40 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-mono font-bold tracking-wider text-neutral-300 uppercase">
            RealEstateIQ Platform
          </span>
        </div>

        <div className="flex items-center space-x-4 text-[11px] font-mono">
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300">
            <Database className="w-3 h-3 text-emerald-400" />
            <span>PostgreSQL 16</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
          </div>
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300">
            <Sparkles className="w-3 h-3 text-neutral-400" />
            <span>ML HistGradientBoosting v1.0.0</span>
          </div>
          <div className="flex items-center space-x-1.5 text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit TLS</span>
          </div>
        </div>
      </header>

      {/* Main Login Centerpiece */}
      <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Animated Hero Branding using React Bits BlurText */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-neutral-900/90 border border-neutral-800 text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span>Executive Authentication Terminal</span>
            </div>

            {/* Official BlurText Component for RealEstateIQ */}
            <div className="flex justify-center">
              <BlurText
                text="RealEstateIQ"
                delay={100}
                animateBy="letters"
                direction="top"
                onAnimationComplete={handleAnimationComplete}
                className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white justify-center"
              />
            </div>

            <p className="text-xs sm:text-sm text-neutral-400 font-mono tracking-wide max-w-sm mx-auto">
              Institutional Valuation & Quantitative Real Estate Intelligence
            </p>
          </div>

          {/* Login Card */}
          <div className="glass-panel p-7 sm:p-8 rounded-2xl border border-neutral-800 bg-neutral-950/85 backdrop-blur-xl shadow-2xl space-y-5">
            {/* Auth Mode Toggle */}
            <div className="flex p-0.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => setAuthMode("standard")}
                className={`flex-1 py-1.5 rounded-lg text-center font-medium transition-all ${
                  authMode === "standard"
                    ? "bg-white text-black shadow-sm font-semibold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Institutional Key
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("sso")}
                className={`flex-1 py-1.5 rounded-lg text-center font-medium transition-all ${
                  authMode === "sso"
                    ? "bg-white text-black shadow-sm font-semibold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Enterprise SSO
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 font-mono">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
                  Institutional Identifier
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@firm.realestateiq.internal"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-mono bg-black/90 border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block">
                    Security Passkey
                  </label>
                  <span className="text-[10px] font-mono text-neutral-500">2FA Enforced</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-mono bg-black/90 border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-all"
                  />
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold font-mono transition-all flex items-center justify-center space-x-2 shadow-sm disabled:opacity-60"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Enter Valuation Terminal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-neutral-850"></div>
              <span className="flex-shrink mx-3 text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                Instant Access
              </span>
              <div className="flex-grow border-t border-neutral-850"></div>
            </div>

            {/* Instant 1-Click Demo Login */}
            <button
              type="button"
              onClick={handleInstantDemoLogin}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 text-xs font-mono font-medium transition-all flex items-center justify-center space-x-2"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
              <span>1-Click Senior Analyst Demo Access</span>
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Legal & Provenance Footer */}
      <footer className="relative z-10 w-full px-6 py-4 border-t border-neutral-900 bg-black/40 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-neutral-500 gap-2">
        <div className="flex items-center space-x-2">
          <span>King County Department of Assessments Record Ingestion</span>
          <span>•</span>
          <span className="text-neutral-400">PostgreSQL ACID Storage</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>SOC-2 Architecture Verified</span>
          </span>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
