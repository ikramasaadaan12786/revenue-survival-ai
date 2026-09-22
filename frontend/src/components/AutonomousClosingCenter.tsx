"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Flame, 
  Target, 
  Clock, 
  TrendingUp, 
  DollarSign, 
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
  AlertCircle,
  HelpCircle,
  Award
} from "lucide-react";
import { DailyExecutionPlan, PrioritizedOpportunity, SalesCopilotSequence } from "@/types";
import { api } from "@/lib/api";

interface Props {
  missionId: number;
  onRefresh?: () => void;
}

const STAGES = [
  "NEW_SIGNAL",
  "QUALIFIED",
  "CONTACT_READY",
  "MESSAGE_SENT",
  "REPLIED",
  "CALL_BOOKED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
  "LOST"
];

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#0d1527] via-[#09101f] to-[#060a14] border border-cyan-500/20 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight font-mono">
                AUTONOMOUS REVENUE CLOSING ENGINE
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                DEAL ACQUISITION
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              AI Deal Qualification • High-Ticket Offer Matcher • Sales Copilot • 10-Stage Pipeline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleRunFullClosingCycle}
            disabled={runningClosingCycle}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold text-black bg-cyan-400 hover:bg-cyan-300 shadow-glow transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${runningClosingCycle ? "animate-spin" : ""}`} />
            <span>{runningClosingCycle ? "Executing Closing Cycle..." : "Run Autonomous Closing Cycle"}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards: Revenue Forecast & Velocity */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-cyan-500/20">
          <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center justify-between">
            <span>Remaining Target</span>
            <Target className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-black font-mono text-cyan-400 mt-1">
            {Number(plan?.remaining_target_aed || 5000).toLocaleString()} AED
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Goal: {Number(plan?.target_amount_aed || 5000).toLocaleString()} AED</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-indigo-500/20">
          <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center justify-between">
            <span>Forecasted Won</span>
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-black font-mono text-indigo-300 mt-1">
            {Number(plan?.expected_revenue_forecast_aed || 0).toLocaleString()} AED
          </div>
          <div className="text-[10px] text-indigo-400 font-mono mt-0.5">Probability-Weighted</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-emerald-500/20">
          <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center justify-between">
            <span>Confirmed Won</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-black font-mono text-emerald-400 mt-1">
            {Number(plan?.revenue_achieved_aed || 0).toLocaleString()} AED
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-0.5">Cash In Bank</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-amber-500/20">
          <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center justify-between">
            <span>Calls Needed</span>
            <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-black font-mono text-amber-300 mt-1">
            {plan?.calls_needed || 4}
          </div>
          <div className="text-[10px] text-amber-400 font-mono mt-0.5">Discovery Briefings</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-purple-500/20">
          <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center justify-between">
            <span>Proposals Needed</span>
            <FileText className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-black font-mono text-purple-300 mt-1">
            {plan?.proposals_needed || 2}
          </div>
          <div className="text-[10px] text-purple-400 font-mono mt-0.5">Commercial Quotes</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-rose-500/20">
          <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center justify-between">
            <span>Target Pace</span>
            <Clock className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-black font-mono text-rose-400 mt-1">
            {Number(plan?.hourly_velocity_required_aed || 69.44).toFixed(0)} AED/h
          </div>
          <div className="text-[10px] text-rose-400/80 font-mono mt-0.5">Velocity Pace</div>
        </div>
      </div>

      {/* 3. AI Daily Execution Plan & Who to Contact First */}
      {plan && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Tactical Plan Overview */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/60 border border-cyan-500/20 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                  Today's Execution Briefing • {plan.plan_date}
                </h3>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                ACTIVE
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs font-mono text-cyan-200">
              <strong>Daily Objective:</strong> {plan.todays_goal}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold font-mono text-slate-400 uppercase">Recommended Actions:</h4>
              <div className="space-y-1.5">
                {plan.recommended_actions?.map((act, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs font-mono text-slate-300">
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Who to Contact First */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] space-y-3">
            <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
              <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
              <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                Who to Contact First
              </h3>
            </div>

            <div className="space-y-2.5">
              {plan.who_to_contact_first?.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-850 border border-white/[0.06] hover:border-cyan-500/40 transition-all cursor-pointer"
                  onClick={() => {
                    const matchedOpp = plan.top_20_opportunities?.find(o => o.lead_id === item.lead_id);
                    if (matchedOpp) handleInspectSalesCopilot(matchedOpp);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono">{item.name}</span>
                    <span className="text-xs font-bold font-mono text-emerald-400">
                      {item.deal_value_aed.toLocaleString()} AED
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {item.company} • <span className="text-cyan-400">{item.channel}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1 line-clamp-1">
                    {item.reason}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Top 20 Prioritized Opportunities Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-slate-900/70 overflow-hidden shadow-xl">
        <div className="p-4 sm:px-6 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
              Top Prioritized Revenue Opportunities ({plan?.top_20_opportunities?.length || 0})
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Ranked by Weighted Closing Probability & Deal Value
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/[0.06]">
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
                <tr key={opp.lead_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 font-bold">#{opp.priority_rank}</span>
                      <span>{opp.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {opp.company} • {opp.country}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-300 max-w-[220px]">
                    <p className="line-clamp-1">{opp.interest}</p>
                  </td>

                  <td className="py-3.5 px-4 text-emerald-400 font-bold">
                    {opp.deal_value_aed.toLocaleString()} AED
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        opp.classification === "HOT BUYER"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      }`}
                    >
                      {opp.qualification_score}% • {opp.classification}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center text-slate-300 font-bold">
                    {Math.round(opp.closing_probability * 100)}%
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                      {opp.pipeline_stage}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleInspectSalesCopilot(opp)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-all flex items-center gap-1"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#0b101b] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden font-sans">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono">
                    SALES COPILOT: {selectedLead.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedLead.company} • {selectedLead.country} • Channel: {selectedLead.channel}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedLead(null);
                  setCopilotSequence(null);
                }}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingCopilot ? (
                <div className="py-16 text-center space-y-2">
                  <Sparkles className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                  <p className="text-sm font-mono text-slate-300">Generating tailored 4-touch closing sequence...</p>
                </div>
              ) : copilotSequence ? (
                <div className="space-y-5">
                  {/* Diagnosis */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.06] space-y-2">
                    <div className="text-xs font-bold font-mono text-cyan-400 uppercase">
                      Pain Point & Diagnosis
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-mono">
                      {copilotSequence.pain_point}
                    </p>
                    <div className="text-xs font-bold font-mono text-emerald-400 uppercase pt-2 border-t border-white/[0.06]">
                      Recommended Solution
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-mono">
                      {copilotSequence.recommended_solution}
                    </p>
                  </div>

                  {/* 4 Multi-Touch Messages */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold font-mono text-slate-400 uppercase flex items-center justify-between">
                      <span>4-Touch Staged Closing Sequence ({copilotSequence.channel}):</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        SAFETY QUEUE: PENDING APPROVAL
                      </span>
                    </h4>

                    {/* Step 1 */}
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-cyan-500/20 space-y-1.5">
                      <div className="text-[11px] font-bold font-mono text-cyan-300 uppercase">
                        Touch 1: Opening Message
                      </div>
                      <p className="text-xs font-mono text-slate-200 whitespace-pre-wrap bg-slate-950/60 p-3 rounded-lg border border-white/[0.04]">
                        {copilotSequence.opening_message}
                      </p>
                    </div>

                    {/* Step 2 */}
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-indigo-500/20 space-y-1.5">
                      <div className="text-[11px] font-bold font-mono text-indigo-300 uppercase">
                        Touch 2: Follow-up Day 1
                      </div>
                      <p className="text-xs font-mono text-slate-200 whitespace-pre-wrap bg-slate-950/60 p-3 rounded-lg border border-white/[0.04]">
                        {copilotSequence.followup_day_1}
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-amber-500/20 space-y-1.5">
                      <div className="text-[11px] font-bold font-mono text-amber-300 uppercase">
                        Touch 3: Follow-up Day 3
                      </div>
                      <p className="text-xs font-mono text-slate-200 whitespace-pre-wrap bg-slate-950/60 p-3 rounded-lg border border-white/[0.04]">
                        {copilotSequence.followup_day_3}
                      </p>
                    </div>

                    {/* Step 4 */}
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-rose-500/20 space-y-1.5">
                      <div className="text-[11px] font-bold font-mono text-rose-300 uppercase">
                        Touch 4: Closing Message
                      </div>
                      <p className="text-xs font-mono text-slate-200 whitespace-pre-wrap bg-slate-950/60 p-3 rounded-lg border border-white/[0.04]">
                        {copilotSequence.closing_message}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-white/[0.08] bg-slate-900/80 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">
                Staged in CRM with Human Safety Approval Barrier
              </span>
              <button
                onClick={() => {
                  setSelectedLead(null);
                  setCopilotSequence(null);
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
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
