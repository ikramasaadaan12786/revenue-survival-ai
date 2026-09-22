"use client";

import React, { useState, useEffect } from "react";
import { 
  Brain, 
  Sparkles, 
  Target, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  Award, 
  Flame, 
  Layers, 
  Radio, 
  Zap, 
  ChevronRight, 
  RefreshCw, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  BarChart3, 
  FlaskConical,
  ArrowUpRight,
  HelpCircle
} from "lucide-react";
import { 
  CEODailyDecision, 
  IndustryPerformanceItem, 
  OfferOptimizationItem, 
  SourcePerformanceItem, 
  RevenueGapAnalysis, 
  TopPriorityAction, 
  WeeklyBusinessReport, 
  CEOBriefing,
  DashboardSummary 
} from "@/types";
import { api } from "@/lib/api";

interface Props {
  missionId: number;
  summary: DashboardSummary | null;
  onRefresh?: () => void;
}

export default function AICEOCommandCenter({ missionId, summary, onRefresh }: Props) {
  const [ceoDecision, setCeoDecision] = useState<CEODailyDecision | null>(null);
  const [industries, setIndustries] = useState<IndustryPerformanceItem[]>([]);
  const [offers, setOffers] = useState<OfferOptimizationItem[]>([]);
  const [sources, setSources] = useState<SourcePerformanceItem[]>([]);
  const [gapData, setGapData] = useState<RevenueGapAnalysis | null>(null);
  const [priorities, setPriorities] = useState<TopPriorityAction[]>([]);
  const [experiments, setExperiments] = useState<any[]>([]);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyBusinessReport | null>(null);
  const [morningBrief, setMorningBrief] = useState<CEOBriefing | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [showBriefModal, setShowBriefModal] = useState(false);

  const fetchCEOMetrics = async () => {
    try {
      setLoading(true);
      const [dec, ind, off, src, gap, pri, exp, rep, brf] = await Promise.all([
        api.getCEODailyDecision(missionId).catch(() => null),
        api.getIndustryIntelligence(missionId).catch(() => []),
        api.getOfferOptimization(missionId).catch(() => []),
        api.getSourceIntelligence(missionId).catch(() => []),
        api.getRevenueGapAnalysis(missionId).catch(() => null),
        api.getTopPriorities(missionId).catch(() => []),
        api.getCEOExperiments(missionId).catch(() => []),
        api.getExecutiveWeeklyReport(missionId).catch(() => null),
        api.getMorningCEOBriefing(missionId).catch(() => null)
      ]);

      if (dec) setCeoDecision(dec);
      if (ind) setIndustries(ind);
      if (off) setOffers(off);
      if (src) setSources(src);
      if (gap) setGapData(gap);
      if (pri) setPriorities(pri);
      if (exp) setExperiments(exp);
      if (rep) setWeeklyReport(rep);
      if (brf) setMorningBrief(brf);
    } catch (err) {
      console.error("Failed fetching CEO telemetry", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (missionId) {
      fetchCEOMetrics();
    }
  }, [missionId]);

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Header Banner with Briefing & Weekly Report Triggers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#0b1329] via-[#080e1e] to-[#040810] border border-cyan-500/30 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/40 text-cyan-400">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight font-mono">
                AUTONOMOUS CEO BRAIN v4
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                STRATEGY & SELF-OPTIMIZATION
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Continuous Performance Audit • Automated Revenue Gap Analysis • Cognitive Memory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowBriefModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-amber-300 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/40 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Morning CEO Brief</span>
          </button>

          <button
            onClick={() => setShowWeeklyModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/70 border border-cyan-500/40 transition-all shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Weekly Executive Report</span>
          </button>

          <button
            onClick={fetchCEOMetrics}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Hero CEO Recommendation Card */}
      {ceoDecision && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-cyan-500/40 bg-gradient-to-r from-cyan-950/30 via-slate-900/90 to-indigo-950/30 p-6 backdrop-blur-xl shadow-cardGlow">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  PRESCRIPTIVE CEO DECISION
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Confidence Rating: <strong className="text-emerald-400">{ceoDecision.confidence_score}%</strong>
                </span>
              </div>

              <h3 className="text-xl md:text-2xl font-black text-white font-mono tracking-tight">
                "{ceoDecision.decision}"
              </h3>

              <p className="text-sm text-slate-300 font-mono leading-relaxed">
                <strong>Strategic Rationale:</strong> {ceoDecision.reason}
              </p>

              {ceoDecision.risk_alert && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs font-mono">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{ceoDecision.risk_alert}</span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 text-center shrink-0 min-w-[200px]">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Projected Pipeline Gain
              </span>
              <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                +{Number(ceoDecision.expected_impact_aed).toLocaleString()} AED
              </div>
              <span className="text-[10px] font-mono text-cyan-300/80 mt-1 block">
                Targeted Revenue Impact
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Global Business KPIs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-cyan-500/20">
          <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center justify-between">
            <span>Confirmed Revenue</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-black font-mono text-emerald-400 mt-1">
            {Number(summary?.revenue_achieved || 0).toLocaleString()} AED
          </div>
          <div className="text-[10px] text-emerald-400/80 font-mono mt-0.5">Cash In Escrow</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-indigo-500/20">
          <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center justify-between">
            <span>Pipeline Value</span>
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-black font-mono text-indigo-300 mt-1">
            {Number(summary?.pipeline_expected || 0).toLocaleString()} AED
          </div>
          <div className="text-[10px] text-indigo-400 font-mono mt-0.5">Active Deals</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-amber-500/20">
          <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center justify-between">
            <span>Best Industry</span>
            <Award className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-sm font-bold font-mono text-white mt-1 truncate">
            {industries[0]?.industry || "AI Agents"}
          </div>
          <div className="text-[10px] text-amber-400 font-mono mt-0.5">
            {industries[0]?.conversion_rate_pct || 25}% Conv Rate
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-purple-500/20">
          <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center justify-between">
            <span>Best Offer</span>
            <Zap className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-sm font-bold font-mono text-purple-300 mt-1 truncate">
            {offers[0]?.product_name?.split(" ")[0] || "AI Agent"} Package
          </div>
          <div className="text-[10px] text-purple-400 font-mono mt-0.5">Scale Priority</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-cyan-500/20">
          <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center justify-between">
            <span>Best Source</span>
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-sm font-bold font-mono text-cyan-300 mt-1">
            {sources[0]?.display_name || "Telegram"}
          </div>
          <div className="text-[10px] text-cyan-400 font-mono mt-0.5">Top ROI Feed</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-rose-500/20">
          <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center justify-between">
            <span>Net Gap</span>
            <Target className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-black font-mono text-rose-400 mt-1">
            {Number(gapData?.net_revenue_gap_aed || 0).toLocaleString()} AED
          </div>
          <div className="text-[10px] text-rose-400/80 font-mono mt-0.5">Remaining Deficit</div>
        </div>
      </div>

      {/* 4. Revenue Gap Analysis Widget */}
      {gapData && (
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-cyan-500/20 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-wider">
                Autonomous Revenue Gap Analysis
              </h4>
            </div>
            <div className="text-xs font-mono text-slate-300">
              Target: <strong className="text-white">{gapData.target_revenue_aed.toLocaleString()} AED</strong> | Deficit: <strong className="text-rose-400">{gapData.net_revenue_gap_aed.toLocaleString()} AED</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-white/[0.06] text-center">
              <div className="text-xl font-black font-mono text-white">{gapData.required_qualified_leads}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Qualified Leads Needed</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-white/[0.06] text-center">
              <div className="text-xl font-black font-mono text-indigo-300">{gapData.required_discovery_calls}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Discovery Calls Needed</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-white/[0.06] text-center">
              <div className="text-xl font-black font-mono text-amber-300">{gapData.required_proposals}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Proposals Required</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-white/[0.06] text-center">
              <div className="text-xl font-black font-mono text-emerald-400">{gapData.required_closing_deals}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Deals to Close</div>
            </div>
          </div>

          <p className="text-xs font-mono text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-white/[0.04]">
            {gapData.action_summary} (Pace: {gapData.required_velocity_aed_per_hour.toFixed(2)} AED/hour)
          </p>
        </div>
      )}

      {/* 5. Industry Performance Intelligence Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-slate-900/70 overflow-hidden shadow-xl">
        <div className="p-4 sm:px-6 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
              Industry Performance Intelligence Matrix
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Real-Time Conversion Speed & Ranking across 7 UAE Sectors
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/[0.06]">
              <tr>
                <th className="py-3 px-4">Industry Sector</th>
                <th className="py-3 px-4 text-center">Opps</th>
                <th className="py-3 px-4 text-center">Qualified</th>
                <th className="py-3 px-4 text-center">Won / Lost</th>
                <th className="py-3 px-4">Revenue Won</th>
                <th className="py-3 px-4">Pipeline</th>
                <th className="py-3 px-4 text-center">Conv %</th>
                <th className="py-3 px-4">Performance Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {industries.map((ind) => (
                <tr key={ind.industry} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    {ind.industry}
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-300">{ind.opportunities_generated}</td>
                  <td className="py-3.5 px-4 text-center text-cyan-300 font-bold">{ind.qualified_leads}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="text-emerald-400 font-bold">{ind.won_deals}</span>
                    <span className="text-slate-500"> / </span>
                    <span className="text-rose-400">{ind.lost_deals}</span>
                  </td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">
                    {ind.revenue_generated_aed.toLocaleString()} AED
                  </td>
                  <td className="py-3.5 px-4 text-indigo-300">
                    {ind.pipeline_value_aed.toLocaleString()} AED
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-white">
                    {ind.conversion_rate_pct}%
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ind.performance_tier === "BEST_PERFORMING"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : ind.performance_tier === "NEEDS_IMPROVEMENT"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {ind.performance_tier}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Top 10 Daily Autonomous Priorities */}
      <div className="rounded-2xl border border-white/[0.08] bg-slate-900/70 overflow-hidden shadow-xl">
        <div className="p-4 sm:px-6 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
              Top 10 Daily High-Impact Actions
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Ranked by Revenue Potential x Closing Probability x Urgency
          </span>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {priorities.map((item) => (
            <div key={item.lead_id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-cyan-400 font-bold font-mono">#{item.rank}</span>
                  <span className="text-xs font-bold text-white font-mono">{item.prospect_name}</span>
                  <span className="text-xs text-slate-400 font-mono">({item.company})</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {item.channel}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-300">
                  <strong className="text-white">{item.action_title}</strong>: {item.recommendation_reason}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-xs font-bold font-mono text-emerald-400">
                    {item.deal_value_aed.toLocaleString()} AED
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Prob: {Math.round(item.closing_probability * 100)}%
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  SCORE: {item.priority_score.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Weekly Report Modal */}
      {showWeeklyModal && weeklyReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#0b101b] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden font-sans">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-mono">
                  EXECUTIVE WEEKLY BUSINESS REPORT
                </h3>
              </div>
              <button onClick={() => setShowWeeklyModal(false)} className="p-2 text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 font-mono text-xs text-slate-300">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/[0.06]">
                  <span className="text-slate-400 block mb-1 uppercase">Generated Revenue</span>
                  <div className="text-lg font-black text-emerald-400">{weeklyReport.revenue.generated_aed.toLocaleString()} AED</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/[0.06]">
                  <span className="text-slate-400 block mb-1 uppercase">Active Pipeline</span>
                  <div className="text-lg font-black text-indigo-300">{weeklyReport.revenue.pipeline_aed.toLocaleString()} AED</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/[0.06]">
                  <span className="text-slate-400 block mb-1 uppercase">Deals Won</span>
                  <div className="text-lg font-black text-cyan-400">{weeklyReport.revenue.deals_won_count}</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white uppercase">Performance Attribution:</h4>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-1">
                  <div>Best Inbound Source: <strong className="text-cyan-400">{weeklyReport.performance.best_source}</strong></div>
                  <div>Best Converting Industry: <strong className="text-emerald-400">{weeklyReport.performance.best_industry}</strong></div>
                  <div>Top Commercial Offer: <strong className="text-indigo-300">{weeklyReport.performance.best_offer}</strong></div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white uppercase">Next Week Growth Directives:</h4>
                <div className="space-y-1.5">
                  {weeklyReport.next_week_strategy?.map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-white/[0.08] bg-slate-900/80 flex justify-end">
              <button onClick={() => setShowWeeklyModal(false)} className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-mono">
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Morning Briefing Modal */}
      {showBriefModal && morningBrief && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#0b101b] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden font-sans">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white font-mono">
                  MORNING CEO DAILY BRIEFING • {morningBrief.briefing_date}
                </h3>
              </div>
              <button onClick={() => setShowBriefModal(false)} className="p-2 text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 font-mono text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200">
                <strong>Recommended CEO Directive:</strong> {morningBrief.recommended_strategy}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/[0.06]">
                  <span className="text-slate-400 block mb-1">Today's Remaining Target</span>
                  <div className="text-lg font-black text-rose-400">{morningBrief.today_revenue_target_aed.toLocaleString()} AED</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/[0.06]">
                  <span className="text-slate-400 block mb-1">Active Pipeline Deals</span>
                  <div className="text-lg font-black text-indigo-300">{morningBrief.yesterday_performance.active_leads_in_pipeline}</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white uppercase">Top 5 Action Priorities:</h4>
                <div className="space-y-1.5">
                  {morningBrief.top_actions?.map((act, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-950/60 border border-white/[0.04] flex items-center justify-between">
                      <span>{act.prospect_name} ({act.company}) - {act.action_title}</span>
                      <strong className="text-emerald-400">{act.deal_value_aed.toLocaleString()} AED</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-white/[0.08] bg-slate-900/80 flex justify-end">
              <button onClick={() => setShowBriefModal(false)} className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-mono">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
