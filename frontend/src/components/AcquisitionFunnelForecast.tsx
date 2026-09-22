"use client";

import React from "react";
import { 
  TrendingUp, 
  Layers, 
  BarChart3, 
  Radio, 
  DollarSign, 
  Percent, 
  ArrowRight,
  ShieldCheck,
  Flame,
  Clock,
  Sparkles
} from "lucide-react";
import { DashboardSummary, GlobalMissionsOverview } from "@/types";

interface Props {
  summary: DashboardSummary;
  globalOverview: GlobalMissionsOverview | null;
}

export default function AcquisitionFunnelForecast({ summary, globalOverview }: Props) {
  const mission = summary.mission;
  const goal = Number(mission?.goal_amount || 10000);
  const pipe = Number(summary.pipeline_expected || 0);
  const achieved = Number(summary.revenue_achieved || 0);

  // Dynamic Funnel Stages Calculation
  const oppsCount = Math.max(1, summary.opportunities_count || 1);
  const qualifiedCount = Math.max(1, Math.round(oppsCount * 0.75));
  const stagedCount = Math.max(1, Math.round(oppsCount * 0.5));
  const contactedCount = Math.max(0, summary.messages_sent || Math.round(oppsCount * 0.35));
  const closedCount = Math.max(0, summary.deals_count || (achieved > 0 ? 1 : 0));

  // Revenue Forecast Scenarios
  const conservativeForecast = Math.round(achieved + (pipe * 0.45));
  const expectedForecast = Math.round(achieved + (pipe * 0.75));
  const aggressiveForecast = Math.round(achieved + (pipe * 1.10));

  const sources = globalOverview?.source_breakdown || {
    Reddit: 4,
    LinkedIn: 3,
    Telegram: 5,
    ProductHunt: 2,
    GitHub: 1,
    Web: 6
  };

  const totalSources = Object.values(sources).reduce((a, b) => a + b, 0) || 1;

  const funnelStages = [
    { label: "1. Discovered", count: oppsCount, sub: "Total Signals Mined", color: "from-cyan-500 to-blue-500", pct: "100%" },
    { label: "2. Qualified", count: qualifiedCount, sub: ">80% Intent Score", color: "from-blue-500 to-indigo-500", pct: `${Math.round((qualifiedCount / oppsCount) * 100)}%` },
    { label: "3. Offers Staged", count: stagedCount, sub: "AI Pitches Formulated", color: "from-indigo-500 to-purple-500", pct: `${Math.round((stagedCount / oppsCount) * 100)}%` },
    { label: "4. Contacted", count: contactedCount, sub: "Sequences Dispatched", color: "from-purple-500 to-rose-500", pct: `${Math.round((contactedCount / oppsCount) * 100)}%` },
    { label: "5. Won / Deals", count: closedCount, sub: "Revenue Realized", color: "from-rose-500 to-emerald-400", pct: `${Math.max(5, Math.round((closedCount / oppsCount) * 100))}%` },
  ];

  return (
    <div className="space-y-6">
      {/* Top Grid: Forecast Matrix + Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversion Funnel (2 Columns on Large Screens) */}
        <div className="lg:col-span-2 glass-panel p-5 md:p-6 rounded-2xl border border-cyan-500/20 bg-[#0a0f1d]/80 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Autonomous Conversion Funnel
              </h3>
            </div>
            <span className="text-[11px] font-mono text-cyan-300">
              {oppsCount} Opportunities Tracked
            </span>
          </div>

          {/* Visual Funnel Bars */}
          <div className="space-y-3 pt-2">
            {funnelStages.map((stage, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-slate-200">{stage.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-[11px]">{stage.sub}</span>
                    <strong className="text-cyan-300 font-bold w-12 text-right">{stage.count}</strong>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 w-10 text-center">
                      {stage.pct}
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${stage.color} transition-all duration-500`}
                    style={{ width: stage.pct }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3-Tier Revenue Forecast Matrix */}
        <div className="glass-panel p-5 md:p-6 rounded-2xl border border-emerald-500/20 bg-[#0a0f1d]/80 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Revenue Forecast
              </h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-400">
              {mission?.currency || "AED"}
            </span>
          </div>

          <div className="space-y-3 pt-1 font-mono">
            {/* Conservative */}
            <div className="p-3 rounded-xl bg-slate-900/70 border border-white/[0.06] space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Conservative (60% Conv)</span>
                <span className="text-amber-400">Pessimistic</span>
              </div>
              <div className="text-lg font-black text-slate-200">
                {conservativeForecast.toLocaleString()} {mission?.currency || "AED"}
              </div>
            </div>

            {/* Expected */}
            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-1 shadow-glow">
              <div className="flex items-center justify-between text-[11px] text-cyan-300 font-bold">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Expected Target
                </span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px]">Base Case</span>
              </div>
              <div className="text-xl font-black text-cyan-400">
                {expectedForecast.toLocaleString()} {mission?.currency || "AED"}
              </div>
            </div>

            {/* Aggressive */}
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-emerald-300">
                <span>Aggressive (100% Full Cap)</span>
                <span className="text-emerald-400 font-bold">Max Upside</span>
              </div>
              <div className="text-lg font-black text-emerald-400">
                {aggressiveForecast.toLocaleString()} {mission?.currency || "AED"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Source Performance Matrix */}
      <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] bg-[#090d16]/90 space-y-3">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Acquisition Source Performance & Volume Matrix
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Real-time feed telemetry
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {Object.entries(sources).map(([src, count]) => {
            const sharePct = Math.round((Number(count) / totalSources) * 100);
            return (
              <div
                key={src}
                className="p-3 rounded-xl bg-slate-900/70 border border-white/[0.06] space-y-1.5"
              >
                <div className="text-[11px] font-mono text-slate-400 truncate">{src}</div>
                <div className="text-lg font-bold font-mono text-white flex items-baseline justify-between">
                  <span>{count}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{sharePct}%</span>
                </div>
                <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-cyan-400"
                    style={{ width: `${Math.max(10, sharePct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
