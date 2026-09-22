"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Flame, 
  Target, 
  Clock, 
  TrendingUp, 
  Coins, 
  Sparkles, 
  PhoneCall, 
  FileText, 
  Send, 
  ShieldCheck, 
  RefreshCw, 
  ChevronRight, 
  Layers, 
  UserCheck, 
  ArrowUpRight,
  MessageSquare,
  AlertCircle
} from "lucide-react";
import { DailyExecutionPlan, PrioritizedOpportunity, SalesCopilotSequence } from "@/types";
import { api } from "@/lib/api";

interface Props {
  missionId: number;
  onRefresh?: () => void;
}

export default function AutonomousClosingCenter({ missionId, onRefresh }: Props) {
  const [plan, setPlan] = useState<DailyExecutionPlan | null>(null);
  const [pipelineOverview, setPipelineOverview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [runningClosingCycle, setRunningClosingCycle] = useState(false);
  const [selectedLead, setSelectedLead] = useState<PrioritizedOpportunity | null>(null);
  const [copilotSequence, setCopilotSequence] = useState<SalesCopilotSequence | null>(null);
  const [loadingCopilot, setLoadingCopilot] = useState(false);
  const [recordingOutcome, setRecordingOutcome] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [planData, pipelineData] = await Promise.all([
        api.getDailyExecutionPlan(missionId).catch(() => null),
        api.getDealPipelineOverview(missionId).catch(() => null)
      ]);
      if (planData) setPlan(planData);
      if (pipelineData) setPipelineOverview(pipelineData);
    } catch (err) {
      console.error("Failed fetching closing center telemetry", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (missionId) {
      fetchData();
    }
  }, [missionId]);

  const handleRunFullClosingCycle = async () => {
    try {
      setRunningClosingCycle(true);
      await api.runFullClosingCycle(missionId);
      await fetchData();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed running closing cycle", err);
    } finally {
      setRunningClosingCycle(false);
    }
  };

  const handleInspectSalesCopilot = async (lead: PrioritizedOpportunity) => {
    try {
      setSelectedLead(lead);
      setLoadingCopilot(true);
      const seq = await api.getSalesCopilotSequence({
        mission_id: missionId,
        lead_id: lead.lead_id
      });
      setCopilotSequence(seq);
    } catch (err) {
      console.error("Failed generating sales copilot sequence", err);
    } finally {
      setLoadingCopilot(false);
    }
  };

  const handleRecordOutcome = async (leadId: number, outcome: "WON" | "LOST") => {
    try {
      setRecordingOutcome(leadId);
      await api.recordDealOutcome({
        mission_id: missionId,
        lead_id: leadId,
        outcome: outcome,
        reason: outcome === "WON" ? "Verified client payment & milestone kickoff" : "Price or timing friction"
      });
      await fetchData();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed recording deal outcome", err);
    } finally {
      setRecordingOutcome(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#0B101D] via-[#06080F] to-[#04060A] border border-[#D4AF37]/30 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#F3E5AB]/20 via-[#D4AF37]/10 to-transparent border border-[#D4AF37]/40 text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-serif text-xl font-bold text-[#F9F6EE] tracking-tight">
                AUTONOMOUS REVENUE CLOSING ENGINE
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                DEAL ACQUISITION
              </span>
            </div>
            <p className="text-xs text-[#8C9BAE] mt-0.5">
              AI Deal Qualification • High-Ticket Offer Matcher • Sovereign Sales Copilot • 10-Stage Pipeline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-[#8C9BAE] hover:text-[#F9F6EE] bg-[#06080F] border border-white/[0.08] hover:border-[#D4AF37]/30 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#D4AF37] ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleRunFullClosingCycle}
            disabled={runningClosingCycle}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#06080F] bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] hover:opacity-95 shadow-[0_2px_15px_rgba(212,175,55,0.3)] transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${runningClosingCycle ? "animate-spin" : ""}`} />
            <span>{runningClosingCycle ? "Executing Closing Cycle..." : "Run Autonomous Closing Cycle"}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards: Revenue Forecast & Velocity */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-xl bg-[#0B101D]/80 border border-[#D4AF37]/20 backdrop-blur-md">
          <div className="text-[10px] font-semibold text-[#8C9BAE] uppercase tracking-wider flex items-center justify-between">
            <span>Remaining Target</span>
            <Target className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>
          <div className="font-serif text-lg font-bold text-[#F3E5AB] mt-1">
            {Number(plan?.remaining_target_aed || 5000).toLocaleString()} AED
          </div>
          <div className="text-[10px] text-[#8C9BAE] mt-0.5">Goal: {Number(plan?.target_amount_aed || 5000).toLocaleString()} AED</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0B101D]/80 border border-[#D4AF37]/20 backdrop-blur-md">
          <div className="text-[10px] font-semibold text-[#8C9BAE] uppercase tracking-wider flex items-center justify-between">
            <span>Forecasted Won</span>
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="font-serif text-lg font-bold text-cyan-300 mt-1">
            {Number(plan?.expected_revenue_forecast_aed || 0).toLocaleString()} AED
          </div>
          <div className="text-[10px] text-cyan-400/80 mt-0.5">Probability-Weighted</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0B101D]/80 border border-[#D4AF37]/20 backdrop-blur-md">
          <div className="text-[10px] font-semibold text-[#8C9BAE] uppercase tracking-wider flex items-center justify-between">
            <span>Confirmed Won</span>
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="font-serif text-lg font-bold text-emerald-400 mt-1">
            {Number(plan?.revenue_achieved_aed || 0).toLocaleString()} AED
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-0.5 font-medium">Cash In Bank</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0B101D]/80 border border-[#D4AF37]/20 backdrop-blur-md">
          <div className="text-[10px] font-semibold text-[#8C9BAE] uppercase tracking-wider flex items-center justify-between">
            <span>Calls Needed</span>
            <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="font-serif text-lg font-bold text-amber-300 mt-1">
            {plan?.calls_needed || 4}
          </div>
          <div className="text-[10px] text-amber-400 mt-0.5">Discovery Briefings</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0B101D]/80 border border-[#D4AF37]/20 backdrop-blur-md">
          <div className="text-[10px] font-semibold text-[#8C9BAE] uppercase tracking-wider flex items-center justify-between">
            <span>Proposals Needed</span>
            <FileText className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="font-serif text-lg font-bold text-purple-300 mt-1">
            {plan?.proposals_needed || 2}
          </div>
          <div className="text-[10px] text-purple-400 mt-0.5">Commercial Quotes</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0B101D]/80 border border-[#D4AF37]/20 backdrop-blur-md">
          <div className="text-[10px] font-semibold text-[#8C9BAE] uppercase tracking-wider flex items-center justify-between">
            <span>Target Pace</span>
            <Clock className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="font-serif text-lg font-bold text-rose-400 mt-1">
            {Number(plan?.hourly_velocity_required_aed || 69.44).toFixed(0)} AED/h
          </div>
          <div className="text-[10px] text-rose-400/80 mt-0.5 font-medium">Velocity Pace</div>
        </div>
      </div>

      {/* 3. AI Daily Execution Plan & Who to Contact First */}
      {plan && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Tactical Plan Overview */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-gradient-to-b from-[#0B101D]/90 to-[#04060A]/95 border border-[#D4AF37]/25 space-y-4 backdrop-blur-xl shadow-md">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/15 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-serif text-sm font-bold text-[#F9F6EE] uppercase tracking-wider">
                  Today&apos;s Execution Briefing • {plan.plan_date}
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                ACTIVE
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#06080F]/80 border border-[#D4AF37]/20 text-xs text-[#CBD5E1]">
              <strong className="text-[#D4AF37]">Daily Objective:</strong> {plan.todays_goal}
            </div>

            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-[#8C9BAE] uppercase tracking-wider">Recommended Actions:</h4>
              <div className="space-y-1.5">
                {plan.recommended_actions?.map((act, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-[#CBD5E1]">
                    <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Who to Contact First */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0B101D]/90 to-[#04060A]/95 border border-[#D4AF37]/25 space-y-3 backdrop-blur-xl shadow-md">
            <div className="flex items-center gap-2 border-b border-[#D4AF37]/15 pb-3">
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              <h3 className="font-serif text-sm font-bold text-[#F9F6EE] uppercase tracking-wider">
                Who to Contact First
              </h3>
            </div>

            <div className="space-y-2.5">
              {plan.who_to_contact_first?.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#06080F]/80 border border-white/[0.04] hover:border-[#D4AF37]/40 transition-all cursor-pointer group"
                  onClick={() => {
                    const matchedOpp = plan.top_20_opportunities?.find(o => o.lead_id === item.lead_id);
                    if (matchedOpp) handleInspectSalesCopilot(matchedOpp);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F9F6EE] group-hover:text-[#D4AF37] transition-colors">{item.name}</span>
                    <span className="text-xs font-bold font-serif text-emerald-400">
                      {item.deal_value_aed.toLocaleString()} AED
                    </span>
                  </div>
                  <div className="text-[11px] text-[#8C9BAE] mt-0.5">
                    {item.company} • <span className="text-cyan-400">{item.channel}</span>
                  </div>
                  <div className="text-[10px] text-[#64748B] mt-1 line-clamp-1">
                    {item.reason}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Top 20 Prioritized Opportunities Table */}
      <div className="rounded-2xl border border-[#D4AF37]/25 bg-gradient-to-b from-[#0B101D]/90 to-[#04060A]/95 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="p-4 sm:px-6 border-b border-[#D4AF37]/15 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="font-serif text-sm font-bold text-[#F9F6EE] uppercase tracking-wider">
              Top Prioritized Revenue Opportunities ({plan?.top_20_opportunities?.length || 0})
            </h3>
          </div>
          <span className="text-[10px] text-[#8C9BAE]">
            Ranked by Weighted Closing Probability & Deal Value
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#06080F]/80 text-[#8C9BAE] uppercase text-[9px] tracking-wider border-b border-white/[0.06]">
              <tr>
                <th className="py-3 px-4">Rank / Name</th>
                <th className="py-3 px-4">Requirement</th>
                <th className="py-3 px-4">Deal Value</th>
                <th className="py-3 px-4 text-center">Score / Tier</th>
                <th className="py-3 px-4 text-center">Probability</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {plan?.top_20_opportunities?.map((opp) => (
                <tr key={opp.lead_id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-[#F9F6EE]">
                    <div className="flex items-center gap-2">
                      <span className="text-[#D4AF37] font-bold">#{opp.priority_rank}</span>
                      <span>{opp.name}</span>
                    </div>
                    <div className="text-[10px] text-[#8C9BAE] font-normal">
                      {opp.company} • {opp.country}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-[#CBD5E1] max-w-[220px]">
                    <p className="line-clamp-1">{opp.interest}</p>
                  </td>

                  <td className="py-3.5 px-4 text-emerald-400 font-bold font-serif">
                    {opp.deal_value_aed.toLocaleString()} AED
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        opp.classification === "HOT BUYER"
                          ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                          : "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                      }`}
                    >
                      {opp.qualification_score}% • {opp.classification}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center text-[#F9F6EE] font-bold">
                    {Math.round(opp.closing_probability * 100)}%
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#06080F] text-[#8C9BAE] border border-white/[0.06]">
                      {opp.pipeline_stage}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleInspectSalesCopilot(opp)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] border border-[#D4AF37]/30 transition-all flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Sales Copilot</span>
                      </button>

                      <button
                        onClick={() => handleRecordOutcome(opp.lead_id, "WON")}
                        disabled={recordingOutcome === opp.lead_id}
                        className="p-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-500/30 transition-colors"
                        title="Mark Deal WON (Record Cash & Learn)"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleRecordOutcome(opp.lead_id, "LOST")}
                        disabled={recordingOutcome === opp.lead_id}
                        className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-500/30 transition-colors"
                        title="Mark Deal LOST (Record Reason & Learn)"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Sales Copilot Modal / Sequence Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#06080F] border border-[#D4AF37]/30 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden font-sans">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/15 bg-[#0B101D]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-[#F9F6EE]">
                    SALES COPILOT: {selectedLead.name}
                  </h3>
                  <p className="text-xs text-[#8C9BAE]">
                    {selectedLead.company} • {selectedLead.country} • Channel: {selectedLead.channel}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedLead(null);
                  setCopilotSequence(null);
                }}
                className="p-2 rounded-lg bg-[#06080F] text-[#8C9BAE] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingCopilot ? (
                <div className="py-16 text-center space-y-2">
                  <Sparkles className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto" />
                  <p className="text-xs text-[#8C9BAE]">Generating tailored 4-touch closing sequence...</p>
                </div>
              ) : copilotSequence ? (
                <div className="space-y-5 text-xs">
                  {/* Diagnosis */}
                  <div className="p-4 rounded-xl bg-[#0B101D] border border-white/[0.06] space-y-2">
                    <div className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                      Pain Point & Diagnosis
                    </div>
                    <p className="text-xs text-[#CBD5E1] leading-relaxed">
                      {copilotSequence.pain_point}
                    </p>
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider pt-2 border-t border-white/[0.06]">
                      Recommended Solution
                    </div>
                    <p className="text-xs text-[#CBD5E1] leading-relaxed">
                      {copilotSequence.recommended_solution}
                    </p>
                  </div>

                  {/* 4 Multi-Touch Messages */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-[#8C9BAE] uppercase tracking-wider flex items-center justify-between">
                      <span>4-Touch Staged Closing Sequence ({copilotSequence.channel}):</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold">
                        SAFETY QUEUE: PENDING APPROVAL
                      </span>
                    </h4>

                    {/* Step 1 */}
                    <div className="p-3.5 rounded-xl bg-[#0B101D]/70 border border-[#D4AF37]/20 space-y-1.5">
                      <div className="text-[11px] font-bold text-[#D4AF37] uppercase">
                        Touch 1: Opening Message
                      </div>
                      <p className="text-xs text-[#F9F6EE] whitespace-pre-wrap bg-[#06080F]/80 p-3 rounded-lg border border-white/[0.04]">
                        {copilotSequence.opening_message}
                      </p>
                    </div>

                    {/* Step 2 */}
                    <div className="p-3.5 rounded-xl bg-[#0B101D]/70 border border-[#D4AF37]/20 space-y-1.5">
                      <div className="text-[11px] font-bold text-cyan-300 uppercase">
                        Touch 2: Follow-up Day 1
                      </div>
                      <p className="text-xs text-[#F9F6EE] whitespace-pre-wrap bg-[#06080F]/80 p-3 rounded-lg border border-white/[0.04]">
                        {copilotSequence.followup_day_1}
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div className="p-3.5 rounded-xl bg-[#0B101D]/70 border border-[#D4AF37]/20 space-y-1.5">
                      <div className="text-[11px] font-bold text-amber-300 uppercase">
                        Touch 3: Follow-up Day 3
                      </div>
                      <p className="text-xs text-[#F9F6EE] whitespace-pre-wrap bg-[#06080F]/80 p-3 rounded-lg border border-white/[0.04]">
                        {copilotSequence.followup_day_3}
                      </p>
                    </div>

                    {/* Step 4 */}
                    <div className="p-3.5 rounded-xl bg-[#0B101D]/70 border border-[#D4AF37]/20 space-y-1.5">
                      <div className="text-[11px] font-bold text-rose-300 uppercase">
                        Touch 4: Closing Message
                      </div>
                      <p className="text-xs text-[#F9F6EE] whitespace-pre-wrap bg-[#06080F]/80 p-3 rounded-lg border border-white/[0.04]">
                        {copilotSequence.closing_message}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-[#D4AF37]/15 bg-[#0B101D] flex items-center justify-between">
              <span className="text-[11px] text-[#8C9BAE]">
                Staged in CRM with Human Safety Approval Barrier
              </span>
              <button
                onClick={() => {
                  setSelectedLead(null);
                  setCopilotSequence(null);
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#D4AF37] text-[#06080F]"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
