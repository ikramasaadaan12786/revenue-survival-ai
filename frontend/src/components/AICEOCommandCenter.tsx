"use client";

import React, { useState, useEffect } from "react";
import { 
  Brain, 
  Sparkles, 
  Target, 
  TrendingUp, 
  Coins, 
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
  ArrowUpRight
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#0B101D] via-[#06080F] to-[#04060A] border border-[#D4AF37]/30 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#F3E5AB]/20 via-[#D4AF37]/10 to-transparent border border-[#D4AF37]/40 text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-serif text-xl font-bold text-[#F9F6EE] tracking-tight">
                AUTONOMOUS CEO BRAIN v4
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 uppercase tracking-wider">
                STRATEGY & SELF-OPTIMIZATION
              </span>
            </div>
            <p className="text-xs text-[#8C9BAE] mt-0.5">
              Continuous Performance Audit • Automated Revenue Gap Analysis • Dubai Cognitive Memory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowBriefModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#06080F] bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] hover:opacity-90 transition-opacity shadow-[0_2px_15px_rgba(212,175,55,0.3)]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Morning CEO Brief</span>
          </button>

          <button
            onClick={() => setShowWeeklyModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#D4AF37] bg-[#0B101D] hover:bg-[#D4AF37]/10 border border-[#D4AF37]/30 transition-all shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Weekly Executive Report</span>
          </button>

          <button
            onClick={fetchCEOMetrics}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-[#8C9BAE] hover:text-[#F9F6EE] bg-[#06080F] border border-white/[0.08] hover:border-[#D4AF37]/30 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#D4AF37] ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Hero CEO Recommendation Card */}
      {ceoDecision && (
        <div className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/40 bg-gradient-to-r from-[#0B101D]/90 via-[#06080F]/95 to-[#0B101D]/90 p-6 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-3xl">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 uppercase tracking-wider">
                  PRESCRIPTIVE CEO DECISION
                </span>
                <span className="text-xs text-[#8C9BAE]">
                  Confidence Rating: <strong className="text-emerald-400">{ceoDecision.confidence_score}%</strong>
                </span>
              </div>

              <h3 className="font-serif text-xl md:text-2xl font-bold text-[#F9F6EE] tracking-tight">
                &ldquo;{ceoDecision.decision}&rdquo;
              </h3>

              <p className="text-xs md:text-sm text-[#CBD5E1] leading-relaxed">
                <strong className="text-[#D4AF37]">Strategic Rationale:</strong> {ceoDecision.reason}
              </p>

              {ceoDecision.risk_alert && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>{ceoDecision.risk_alert}</span>
                </div>
              )}
            </div>

            <div className="p-5 rounded-xl bg-[#04060A]/90 border border-[#D4AF37]/30 text-center shrink-0 min-w-[220px] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              <span className="text-[10px] text-[#8C9BAE] uppercase tracking-wider block font-semibold">
                Projected Pipeline Gain
              </span>
              <div className="font-serif text-2xl font-bold text-emerald-400 mt-1">
                +{Number(ceoDecision.expected_impact_aed).toLocaleString()} AED
              </div>
              <span className="text-[10px] text-[#C5A059] mt-1 block font-medium">
                Targeted Revenue Impact
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Global Business KPIs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-xl bg-[#0B101D]/80 border border-[#D4AF37]/20 backdrop-blur-md">
          <div className="text-[10px] font-semibold text-[#8C9BAE] uppercase tracking-wider flex items-center justify-between">
            <span>Confirmed Revenue</span>
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="font-serif text-lg font-bold text-emerald-400 mt-1">
            {Number(summary?.revenue_achieved || 0).toLocaleString()} AED
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-0.5 font-medium">Cash In Escrow</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0B101D]/80 border border-[#D4AF37]/20 backdrop-blur-md">
          <div className="text-[10px] font-semibold text-[#8C9BAE] uppercase tracking-wider flex items-center justify-between">
            <span>Pipeline Value</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>
          <div className="font-serif text-lg font-bold text-[#F3E5AB] mt-1">
            {Number(summary?.pipeline_expected || 0).toLocaleString()} AED
          </div>
          <div className="text-[10px] text-[#D4AF37]/80 mt-0.5 font-medium">Active Deals</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0B101D]/80 border border-[#D4AF37]/20 backdrop-blur-md">
          <div className="text-[10px] font-semibold text-[#8C9BAE] uppercase tracking-wider flex items-center justify-between">
            <span>Best Industry</span>
            <Award className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xs font-bold text-[#F9F6EE] mt-1 truncate">
            {industries[0]?.industry || "AI Agents"}
          </div>
          <div className="text-[10px] text-amber-400 mt-0.5 font-medium">
            {industries[0]?.conversion_rate_pct || 25}% Conv Rate
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0B101D]/80 border border-[#D4AF37]/20 backdrop-blur-md">
          <div className="text-[10px] font-semibold text-[#8C9BAE] uppercase tracking-wider flex items-center justify-between">
            <span>Best Offer</span>
            <Zap className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xs font-bold text-purple-300 mt-1 truncate">
            {offers[0]?.product_name?.split(" ")[0] || "AI Agent"} Package
          </div>
          <div className="text-[10px] text-purple-400 mt-0.5 font-medium">Scale Priority</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0B101D]/80 border border-[#D4AF37]/20 backdrop-blur-md">
          <div className="text-[10px] font-semibold text-[#8C9BAE] uppercase tracking-wider flex items-center justify-between">
            <span>Best Source</span>
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xs font-bold text-cyan-300 mt-1">
            {sources[0]?.display_name || "Telegram"}
          </div>
          <div className="text-[10px] text-cyan-400 mt-0.5 font-medium">Top ROI Feed</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0B101D]/80 border border-[#D4AF37]/20 backdrop-blur-md">
          <div className="text-[10px] font-semibold text-[#8C9BAE] uppercase tracking-wider flex items-center justify-between">
            <span>Net Gap</span>
            <Target className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="font-serif text-lg font-bold text-rose-400 mt-1">
            {Number(gapData?.net_revenue_gap_aed || 0).toLocaleString()} AED
          </div>
          <div className="text-[10px] text-rose-400/80 mt-0.5 font-medium">Remaining Deficit</div>
        </div>
      </div>

      {/* 4. Revenue Gap Analysis Widget */}
      {gapData && (
        <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0B101D]/90 to-[#04060A]/95 border border-[#D4AF37]/25 space-y-3.5 backdrop-blur-xl shadow-[0_8px_25px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#D4AF37]/15">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#D4AF37]" />
              <h4 className="font-serif text-xs font-bold text-[#F9F6EE] uppercase tracking-wider">
                Autonomous Revenue Gap Analysis
              </h4>
            </div>
            <div className="text-xs text-[#8C9BAE]">
              Target: <strong className="text-[#F9F6EE]">{gapData.target_revenue_aed.toLocaleString()} AED</strong> | Deficit: <strong className="text-rose-400">{gapData.net_revenue_gap_aed.toLocaleString()} AED</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-[#06080F]/90 border border-white/[0.05] text-center">
              <div className="font-serif text-xl font-bold text-[#F9F6EE]">{gapData.required_qualified_leads}</div>
              <div className="text-[10px] text-[#8C9BAE] mt-0.5">Qualified Leads Needed</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#06080F]/90 border border-white/[0.05] text-center">
              <div className="font-serif text-xl font-bold text-cyan-300">{gapData.required_discovery_calls}</div>
              <div className="text-[10px] text-[#8C9BAE] mt-0.5">Discovery Calls Needed</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#06080F]/90 border border-white/[0.05] text-center">
              <div className="font-serif text-xl font-bold text-[#F3E5AB]">{gapData.required_proposals}</div>
              <div className="text-[10px] text-[#8C9BAE] mt-0.5">Proposals Required</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#06080F]/90 border border-white/[0.05] text-center">
              <div className="font-serif text-xl font-bold text-emerald-400">{gapData.required_closing_deals}</div>
              <div className="text-[10px] text-[#8C9BAE] mt-0.5">Deals to Close</div>
            </div>
          </div>

          <p className="text-xs text-[#CBD5E1] bg-[#06080F]/70 p-3 rounded-xl border border-white/[0.04]">
            {gapData.action_summary} <span className="text-[#D4AF37] font-semibold">(Pace: {gapData.required_velocity_aed_per_hour.toFixed(2)} AED/hour)</span>
          </p>
        </div>
      )}

      {/* 5. Industry Performance Intelligence Table */}
      <div className="rounded-2xl border border-[#D4AF37]/25 bg-gradient-to-b from-[#0B101D]/90 to-[#04060A]/95 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="p-4 sm:px-6 border-b border-[#D4AF37]/15 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="font-serif text-sm font-bold text-[#F9F6EE] uppercase tracking-wider">
              Industry Performance Intelligence Matrix
            </h3>
          </div>
          <span className="text-[10px] text-[#8C9BAE]">
            Real-Time Conversion Speed & Ranking across UAE Sectors
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#06080F]/80 text-[#8C9BAE] uppercase text-[9px] tracking-wider border-b border-white/[0.06]">
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
                <tr key={ind.industry} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-[#F9F6EE]">
                    {ind.industry}
                  </td>
                  <td className="py-3.5 px-4 text-center text-[#8C9BAE]">{ind.opportunities_generated}</td>
                  <td className="py-3.5 px-4 text-center text-cyan-300 font-bold">{ind.qualified_leads}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="text-emerald-400 font-bold">{ind.won_deals}</span>
                    <span className="text-[#64748B]"> / </span>
                    <span className="text-rose-400">{ind.lost_deals}</span>
                  </td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">
                    {ind.revenue_generated_aed.toLocaleString()} AED
                  </td>
                  <td className="py-3.5 px-4 text-[#F3E5AB]">
                    {ind.pipeline_value_aed.toLocaleString()} AED
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-[#F9F6EE]">
                    {ind.conversion_rate_pct}%
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider ${
                        ind.performance_tier === "BEST_PERFORMING"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : ind.performance_tier === "NEEDS_IMPROVEMENT"
                          ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                          : "bg-slate-800 text-[#8C9BAE]"
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
      <div className="rounded-2xl border border-[#D4AF37]/25 bg-gradient-to-b from-[#0B101D]/90 to-[#04060A]/95 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="p-4 sm:px-6 border-b border-[#D4AF37]/15 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <h3 className="font-serif text-sm font-bold text-[#F9F6EE] uppercase tracking-wider">
              Top 10 Daily High-Impact Actions
            </h3>
          </div>
          <span className="text-[10px] text-[#8C9BAE]">
            Ranked by Revenue Potential x Closing Probability x Urgency
          </span>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {priorities.map((item) => (
            <div key={item.lead_id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[#D4AF37] font-bold">#{item.rank}</span>
                  <span className="text-xs font-bold text-[#F9F6EE]">{item.prospect_name}</span>
                  <span className="text-xs text-[#8C9BAE]">({item.company})</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {item.channel}
                  </span>
                </div>
                <p className="text-xs text-[#CBD5E1]">
                  <strong className="text-[#F9F6EE]">{item.action_title}</strong>: {item.recommendation_reason}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-400">
                    {item.deal_value_aed.toLocaleString()} AED
                  </div>
                  <div className="text-[10px] text-[#8C9BAE]">
                    Prob: {Math.round(item.closing_probability * 100)}%
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                  SCORE: {item.priority_score.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Weekly Report Modal */}
      {showWeeklyModal && weeklyReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#06080F] border border-[#D4AF37]/30 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden font-sans">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/15 bg-[#0B101D]">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-serif text-base font-bold text-[#F9F6EE]">
                  EXECUTIVE WEEKLY BUSINESS REPORT
                </h3>
              </div>
              <button onClick={() => setShowWeeklyModal(false)} className="p-2 text-[#8C9BAE] hover:text-white">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-[#CBD5E1]">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#0B101D] border border-white/[0.06]">
                  <span className="text-[#8C9BAE] block mb-1 uppercase text-[10px]">Generated Revenue</span>
                  <div className="font-serif text-lg font-bold text-emerald-400">{weeklyReport.revenue.generated_aed.toLocaleString()} AED</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0B101D] border border-white/[0.06]">
                  <span className="text-[#8C9BAE] block mb-1 uppercase text-[10px]">Active Pipeline</span>
                  <div className="font-serif text-lg font-bold text-[#F3E5AB]">{weeklyReport.revenue.pipeline_aed.toLocaleString()} AED</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0B101D] border border-white/[0.06]">
                  <span className="text-[#8C9BAE] block mb-1 uppercase text-[10px]">Deals Won</span>
                  <div className="font-serif text-lg font-bold text-cyan-300">{weeklyReport.revenue.deals_won_count}</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#F9F6EE] uppercase tracking-wider">Performance Attribution:</h4>
                <div className="p-3.5 rounded-xl bg-[#0B101D]/70 border border-white/[0.06] space-y-1">
                  <div>Best Inbound Source: <strong className="text-cyan-400">{weeklyReport.performance.best_source}</strong></div>
                  <div>Best Converting Industry: <strong className="text-emerald-400">{weeklyReport.performance.best_industry}</strong></div>
                  <div>Top Commercial Offer: <strong className="text-[#D4AF37]">{weeklyReport.performance.best_offer}</strong></div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#F9F6EE] uppercase tracking-wider">Next Week Growth Directives:</h4>
                <div className="space-y-1.5">
                  {weeklyReport.next_week_strategy?.map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-[#D4AF37]/15 bg-[#0B101D] flex justify-end">
              <button onClick={() => setShowWeeklyModal(false)} className="px-4 py-1.5 rounded-lg bg-[#D4AF37] text-[#06080F] font-bold text-xs">
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Morning Briefing Modal */}
      {showBriefModal && morningBrief && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#06080F] border border-[#D4AF37]/30 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden font-sans">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/15 bg-[#0B101D]">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-serif text-base font-bold text-[#F9F6EE]">
                  MORNING CEO DAILY BRIEFING • {morningBrief.briefing_date}
                </h3>
              </div>
              <button onClick={() => setShowBriefModal(false)} className="p-2 text-[#8C9BAE] hover:text-white">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-[#CBD5E1]">
              <div className="p-3.5 rounded-xl bg-[#0B101D] border border-[#D4AF37]/30 text-[#F9F6EE]">
                <strong className="text-[#D4AF37]">Recommended CEO Directive:</strong> {morningBrief.recommended_strategy}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#0B101D] border border-white/[0.06]">
                  <span className="text-[#8C9BAE] block mb-1">Today&apos;s Remaining Target</span>
                  <div className="font-serif text-lg font-bold text-rose-400">{morningBrief.today_revenue_target_aed.toLocaleString()} AED</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0B101D] border border-white/[0.06]">
                  <span className="text-[#8C9BAE] block mb-1">Active Pipeline Deals</span>
                  <div className="font-serif text-lg font-bold text-[#F3E5AB]">{morningBrief.yesterday_performance.active_leads_in_pipeline}</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#F9F6EE] uppercase tracking-wider">Top 5 Action Priorities:</h4>
                <div className="space-y-1.5">
                  {morningBrief.top_actions?.map((act, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-[#0B101D]/60 border border-white/[0.04] flex items-center justify-between">
                      <span>{act.prospect_name} ({act.company}) - {act.action_title}</span>
                      <strong className="text-emerald-400 font-serif">{act.deal_value_aed.toLocaleString()} AED</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-[#D4AF37]/15 bg-[#0B101D] flex justify-end">
              <button onClick={() => setShowBriefModal(false)} className="px-4 py-1.5 rounded-lg bg-[#D4AF37] text-[#06080F] font-bold text-xs">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
