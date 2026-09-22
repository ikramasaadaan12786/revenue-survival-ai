"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  FileText, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Flame, 
  Target, 
  Clock, 
  Download,
  Share2,
  Calendar,
  Layers,
  Building2,
  Cpu,
  Globe
} from "lucide-react";
import { DailySurvivalReport } from "@/types";
import { api } from "@/lib/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  missionId: number;
}

export default function DailySurvivalReportModal({ isOpen, onClose, missionId }: Props) {
  const [report, setReport] = useState<DailySurvivalReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && missionId) {
      loadReport();
    }
  }, [isOpen, missionId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDailySurvivalReport(missionId);
      setReport(data);
    } catch (err: any) {
      console.error("Failed loading daily report", err);
      setError("Unable to generate live survival report. Please verify connection.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#0b101b] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight font-mono">
                  REVENUE SURVIVAL DAILY REPORT
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  MORNING INTELLIGENCE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Mission #{missionId} • Date: {report?.report_date || new Date().toISOString().split("T")[0]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const text = JSON.stringify(report, null, 2);
                const blob = new Blob([text], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `revenue_survival_report_mission_${missionId}.json`;
                a.click();
              }}
              disabled={!report}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors disabled:opacity-40"
              title="Download JSON Report"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <p className="text-sm font-mono text-slate-300">Compiling Morning Revenue Intelligence...</p>
              <p className="text-xs font-mono text-slate-500">Synthesizing signals from Telegram, LinkedIn, Instagram, Reddit, YouTube & Web</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-sm font-mono">
              {error}
            </div>
          ) : report ? (
            <div className="space-y-6">
              
              {/* 1. High Level Executive KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08]">
                  <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">Signals Found</span>
                  <div className="text-2xl font-black font-mono text-cyan-400">{report.signals_found}</div>
                  <span className="text-[10px] text-slate-500 font-mono">Multi-source Radar</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08]">
                  <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">Qualified Leads</span>
                  <div className="text-2xl font-black font-mono text-indigo-300">{report.qualified_leads}</div>
                  <span className="text-[10px] text-indigo-400 font-mono">Quality Filter Passed</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08]">
                  <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">Expected Revenue</span>
                  <div className="text-2xl font-black font-mono text-emerald-400">
                    {Number(report.expected_revenue_aed || 0).toLocaleString()} AED
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">Target Probability Weighted</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08]">
                  <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">Pipeline Total</span>
                  <div className="text-2xl font-black font-mono text-amber-300">
                    {Number(report.pipeline_value_aed || 0).toLocaleString()} AED
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono">Active Deal Value</span>
                </div>
              </div>

              {/* 2. Target Funnel Reverse-Math Breakdown */}
              {report.target_math && (
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-xs font-bold font-mono text-cyan-300 uppercase">
                        Target Acquisition Reverse-Math
                      </h4>
                    </div>
                    <span className="text-xs font-mono text-slate-300">
                      Target: <strong className="text-white">{report.target_math.target_amount.toLocaleString()} AED</strong> in {report.target_math.deadline_hours}h
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-cyan-500/20">
                    <div className="p-2.5 rounded-lg bg-slate-900/80 text-center">
                      <div className="text-lg font-black font-mono text-white">{report.target_math.required_qualified_leads}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Qualified Leads Needed</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/80 text-center">
                      <div className="text-lg font-black font-mono text-indigo-300">{report.target_math.required_conversations}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Conversations Needed</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/80 text-center">
                      <div className="text-lg font-black font-mono text-amber-300">{report.target_math.required_proposals}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Proposals Needed</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/80 text-center">
                      <div className="text-lg font-black font-mono text-emerald-400">{report.target_math.required_deals}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Closings Required</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-900/40 p-2.5 rounded-lg">
                    {report.target_math.target_summary}
                  </p>
                </div>
              )}

              {/* 3. Industry Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Industry Distribution of Discovered Signals</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(report.industries_breakdown || {}).map(([industry, count]) => (
                    <div
                      key={industry}
                      className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-white/[0.08] text-xs font-mono flex items-center gap-2"
                    >
                      <span className="text-slate-300">{industry}:</span>
                      <strong className="text-cyan-400">{count}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Top 10 High-Intent Opportunities */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>Top High-Intent Revenue Opportunities</span>
                </h4>

                <div className="space-y-2">
                  {report.top_10_opportunities?.length === 0 ? (
                    <p className="text-xs text-slate-400 font-mono py-4 text-center">No opportunities discovered yet today.</p>
                  ) : (
                    report.top_10_opportunities?.map((opp, idx) => (
                      <div
                        key={opp.id || idx}
                        className="p-3.5 rounded-xl bg-slate-900/70 border border-white/[0.08] hover:border-cyan-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        <div className="space-y-1 max-w-xl">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-white font-mono">{opp.name}</span>
                            {opp.company && <span className="text-xs text-slate-400 font-mono">@{opp.company}</span>}
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                              {opp.industry}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                              {opp.source}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 line-clamp-1">{opp.requirement_snippet}</p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <div className="text-xs font-bold font-mono text-emerald-400">
                              {opp.estimated_value_aed.toLocaleString()} AED
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">
                              Intent: {opp.intent_score}% • Urgency: {opp.urgency_score}%
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              opp.priority === "HOT"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                            }`}
                          >
                            {opp.priority}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 5. Recommended Actions */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08] space-y-2">
                <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Recommended Strategic Actions</span>
                </h4>
                <div className="space-y-1.5">
                  {report.recommended_actions?.map((action, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs font-mono text-slate-300">
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/[0.08] bg-slate-900/80 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400">
            Autonomous Daily Engine • Synchronized with UAE Buyer Radar
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close Report
          </button>
        </div>

      </div>
    </div>
  );
}
