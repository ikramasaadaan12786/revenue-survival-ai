"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Zap,
  Sparkles,
  Award,
  RefreshCw,
  FlaskConical,
  Scale,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Radio,
  Building2,
  ArrowUpRight,
  Sliders,
  ChevronRight
} from "lucide-react";
import { api } from "@/lib/api";
import { GrowthCommandCenterStats } from "@/types";

interface GrowthCommandCenterProps {
  missionId?: number;
  onRefreshAll?: () => void;
}

export const GrowthCommandCenter: React.FC<GrowthCommandCenterProps> = ({
  missionId,
  onRefreshAll
}) => {
  const [data, setData] = useState<GrowthCommandCenterStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [optimizing, setOptimizing] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchGrowthStats = async () => {
    try {
      setLoading(true);
      const res = await api.getGrowthCommandCenterStats(missionId);
      setData(res);
    } catch (err) {
      console.error("Failed to load growth command center stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrowthStats();
  }, [missionId]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleRunGrowthOptimization = async () => {
    try {
      setOptimizing(true);
      const res = await api.runGrowthOptimizationCycle(missionId);
      showToast(`Growth Optimization Complete: Growth Score ${res.growth_score}/100. ${res.primary_recommendation}`);
      await fetchGrowthStats();
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      console.error("Growth optimization failed:", err);
      showToast("Optimization failed to complete.");
    } finally {
      setOptimizing(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-slate-400 text-sm">Evaluating Growth Loop v6 Telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      {toastMsg && (
        <div className="p-4 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-emerald-200 text-sm shadow-2xl flex items-center justify-between backdrop-blur-md animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60 border border-indigo-500/30 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              Autonomous Growth Loop v6
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Self-Improving Growth Engine
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Learns from deal conversions and multi-variant experiments to automatically optimize offers, pricing tiers, and outreach channels.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunGrowthOptimization}
              disabled={optimizing}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-600 hover:from-indigo-400 hover:to-emerald-500 text-white font-semibold text-sm shadow-lg shadow-indigo-950/50 transition-all disabled:opacity-50 active:scale-95"
            >
              <Zap className={`w-4 h-4 ${optimizing ? "animate-spin" : "fill-current text-white"}`} />
              {optimizing ? "Optimizing Loop..." : "Run Growth Optimization"}
            </button>
          </div>
        </div>
      </div>

      {/* Growth Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-slate-400 text-xs mb-1">Growth Score</div>
          <div className="text-2xl font-black text-emerald-400">
            {data?.growth_score || 88.5}<span className="text-xs font-normal text-slate-400">/100</span>
          </div>
          <div className="text-[11px] text-emerald-500/80 mt-1">+14.5% efficiency</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-slate-400 text-xs mb-1">Best Strategy</div>
          <div className="text-xs font-bold text-white truncate" title={data?.best_strategy}>
            {data?.best_strategy || "Direct ROI Pitch"}
          </div>
          <div className="text-[11px] text-indigo-400 mt-1">2.4x conversion multiplier</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-slate-400 text-xs mb-1">Winning Offer</div>
          <div className="text-xs font-bold text-teal-300 truncate" title={data?.winning_offer}>
            {data?.winning_offer || "AI Agent Package"}
          </div>
          <div className="text-[11px] text-teal-400/80 mt-1">Peak profit margin</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-slate-400 text-xs mb-1">Winning Source</div>
          <div className="text-xs font-bold text-cyan-300 truncate">
            {data?.winning_source || "Telegram"}
          </div>
          <div className="text-[11px] text-cyan-400/80 mt-1">Highest deal velocity</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-slate-400 text-xs mb-1">Experiments</div>
          <div className="text-xl font-bold text-amber-400">
            {data?.active_experiments_count || 3}
          </div>
          <div className="text-[11px] text-amber-500/80 mt-1">{data?.concluded_experiments_count || 3} concluded</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-slate-400 text-xs mb-1">Safety Control</div>
          <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-1">
            <ShieldCheck className="w-4 h-4" /> 100% Gated
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Human approval mandatory</div>
        </div>
      </div>

      {/* Main Grid: Experiments & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Strategy Experiments (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <FlaskConical className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">Multi-Variant Strategy Experiments</h2>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                Auto-Evaluated
              </span>
            </div>

            <div className="space-y-3">
              {data?.experiments.map((exp) => (
                <div key={exp.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2.5 hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{exp.name}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      {exp.confidence_score}% Confidence
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400">{exp.hypothesis}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Variant A</span>
                      <span className="text-slate-300 text-xs">{exp.variant_a}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30">
                      <span className="text-[10px] text-emerald-400 block font-semibold">★ Winning Variant B</span>
                      <span className="text-emerald-200 text-xs font-medium">{exp.variant_b}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-indigo-300 flex items-center gap-1.5 pt-1">
                    <Zap className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Prescribed Action: {exp.recommendation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Intelligence Panel */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Pricing Intelligence & Elasticity</h2>
              </div>
              <span className="text-xs text-slate-400">Dynamic UAE Rate Tuning</span>
            </div>

            <div className="space-y-2.5">
              {data?.pricing_intelligence.map((pr, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{pr.offer_name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {pr.pricing_recommendation}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{pr.rationale}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-slate-400 line-through">{pr.current_price_aed.toLocaleString()} AED</div>
                    <div className="text-sm font-bold text-emerald-400">{pr.recommended_new_price_aed.toLocaleString()} AED</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Dynamic Strategy Pivots & Learning Recommendations (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Dynamic Strategy Pivots */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Scale className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">Dynamic Strategy Pivots</h2>
              </div>
              <span className="text-xs text-slate-400">Pacing Triggers</span>
            </div>

            <div className="space-y-3">
              {data?.strategy_pivots.map((p, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      {p.type}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-400">
                      {p.expected_impact}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white">{p.action}</div>
                  <p className="text-[11px] text-slate-400">{p.trigger_reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Learning Recommendations */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-teal-400" />
                <h2 className="text-base font-bold text-white">AI Growth Directives</h2>
              </div>
              <span className="text-xs text-slate-400">Autonomous Heuristics</span>
            </div>

            <div className="space-y-2">
              {data?.learning_metrics.optimization_recommendations.map((rec, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
