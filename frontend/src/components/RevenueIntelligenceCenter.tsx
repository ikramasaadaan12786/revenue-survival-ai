"use client";

import React, { useState, useEffect } from "react";
import { 
  Brain, 
  TrendingUp, 
  Award, 
  Users, 
  DollarSign, 
  Percent, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Flame, 
  RefreshCw,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target
} from "lucide-react";
import { api } from "@/lib/api";
import { RevenueLearning, PerformanceReport } from "@/types";

interface Props {
  missionId: number;
}

export default function RevenueIntelligenceCenter({ missionId }: Props) {
  const [learnings, setLearnings] = useState<RevenueLearning[]>([]);
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchIntelligence = async () => {
    try {
      setLoading(true);
      const [learningsData, reportData] = await Promise.all([
        api.getRevenueLearnings(missionId).catch(() => []),
        api.getWeeklyPerformanceReport(missionId).catch(() => null)
      ]);
      setLearnings(learningsData || []);
      setReport(reportData);
    } catch (err) {
      console.error("Failed loading intelligence metrics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (missionId) {
      fetchIntelligence();
    }
  }, [missionId]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchIntelligence();
    } finally {
      setRefreshing(false);
    }
  };

  const metrics = report?.intelligence_metrics || {
    total_leads: 8,
    qualified_leads: 6,
    hot_leads: 3,
    active_negotiations: 2,
    proposals_sent: 4,
    deals_won: 2,
    revenue_generated: 12500,
    conversion_rate_pct: 25.0,
    avg_deal_size_aed: 6250,
    pipeline_coverage_ratio: 1.85
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Revenue Intelligence Center</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                COGNITIVE MEMORY v3
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Self-Optimizing Learning Engine • Conversion Velocity Analytics • Strategic Performance Audits
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${refreshing ? "animate-spin" : ""}`} />
          <span>{refreshing ? "Auditing..." : "Audit Learning Memory"}</span>
        </button>
      </div>

      {/* 2. Top Metric Cards (8 KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="glass-panel p-3.5 rounded-xl border border-white/[0.08] bg-slate-900/60 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Total Leads</span>
            <Users className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{metrics.total_leads}</div>
          <div className="text-[9px] text-cyan-400 font-mono">Discovered</div>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-white/[0.08] bg-slate-900/60 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Qualified</span>
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">{metrics.qualified_leads}</div>
          <div className="text-[9px] text-emerald-400/80 font-mono">&gt;60 Score</div>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-white/[0.08] bg-slate-900/60 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>HOT Leads</span>
            <Flame className="w-3 h-3 text-rose-400 animate-pulse" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400">{metrics.hot_leads}</div>
          <div className="text-[9px] text-rose-400/80 font-mono">&gt;80 Score</div>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-white/[0.08] bg-slate-900/60 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Negotiations</span>
            <Zap className="w-3 h-3 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-300">{metrics.active_negotiations}</div>
          <div className="text-[9px] text-amber-400/80 font-mono">Active Stage</div>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-white/[0.08] bg-slate-900/60 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Proposals</span>
            <FileText className="w-3 h-3 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-300">{metrics.proposals_sent}</div>
          <div className="text-[9px] text-purple-400/80 font-mono">Staged/Sent</div>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-white/[0.08] bg-slate-900/60 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Deals Won</span>
            <Award className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">{metrics.deals_won}</div>
          <div className="text-[9px] text-emerald-400/80 font-mono">Closed</div>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-white/[0.08] bg-slate-900/60 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Conv. Rate</span>
            <Percent className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-cyan-400">{metrics.conversion_rate_pct}%</div>
          <div className="text-[9px] text-cyan-400/80 font-mono">Deal Ratio</div>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-white/[0.08] bg-slate-900/60 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Avg Deal</span>
            <DollarSign className="w-3 h-3 text-amber-400" />
          </div>
          <div className="text-lg font-bold font-mono text-amber-300">{(metrics.avg_deal_size_aed / 1000).toFixed(1)}k</div>
          <div className="text-[9px] text-amber-400/80 font-mono">AED Average</div>
        </div>
      </div>

      {/* 3. AI Recommendations Card */}
      <div className="glass-panel p-5 md:p-6 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/20 via-slate-900/60 to-transparent space-y-3 shadow-cardGlow">
        <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              AI Strategic Recommendations & Velocity Optimization
            </h3>
          </div>
          <span className="text-[11px] font-mono text-purple-300 px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/30">
            Strategy Pivot Ready
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/[0.06] text-xs font-mono text-purple-200">
          💡 <strong>Recommended Strategy Shift:</strong> "{report?.recommended_strategy_change || "Prioritize AI Automation leads with 24-hour express 50% deposit proposals to maximize closing velocity."}"
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 font-mono text-xs">
          {report?.actionable_recommendations?.map((rec, i) => (
            <div key={i} className="flex items-start gap-2 text-slate-300 p-2.5 rounded-lg bg-slate-900/60 border border-white/[0.04]">
              <ArrowRight className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Revenue Memory Insights Table */}
      <div className="glass-panel overflow-hidden border border-white/[0.08] bg-[#090d16]/90 space-y-3 p-5 rounded-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Cognitive Learning Memory • High-Converting Offers & Performance
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Real-time multi-channel telemetry
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {learnings.map((l, idx) => (
            <div
              key={idx}
              className="glass-panel p-4 rounded-xl border border-white/[0.06] bg-slate-900/60 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    {l.industry}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-400">
                    {l.conversion_rate}% Conv
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white font-mono">{l.offer_type}</h4>

                <p className="text-xs text-slate-300 font-mono leading-relaxed">
                  "{l.learning_insight}"
                </p>
              </div>

              <div className="pt-2 border-t border-white/[0.06] text-[11px] font-mono text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Avg Turnaround:</span>
                  <strong className="text-white">{l.avg_closing_hours}h</strong>
                </div>
                <div className="flex justify-between">
                  <span>Avg Deal Value:</span>
                  <strong className="text-amber-300">{Number(l.avg_deal_value).toLocaleString()} AED</strong>
                </div>
                <div className="text-[10px] text-purple-300 pt-1">
                  Action: {l.recommendation}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
