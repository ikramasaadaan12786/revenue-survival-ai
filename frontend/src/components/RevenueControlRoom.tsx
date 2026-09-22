"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Zap,
  Play,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Target,
  Sparkles,
  Layers,
  Send,
  Radio,
  RefreshCw,
  Award,
  Cpu,
  ArrowRight,
  Sliders,
  DollarSign,
  AlertTriangle,
  Building2,
  Compass,
  FileCheck,
  ChevronRight,
  Flame,
  BrainCircuit,
  Eye
} from "lucide-react";
import { api } from "@/lib/api";
import {
  ControlRoomTelemetry,
  HunterFleetItem,
  MissionBlueprint,
  PendingApprovalQueue,
  BusinessGrowthMemoryItem,
  TieredOfferMatrix
} from "@/types";

interface RevenueControlRoomProps {
  activeMissionId?: number;
  onRefreshAll?: () => void;
}

export const RevenueControlRoom: React.FC<RevenueControlRoomProps> = ({
  activeMissionId,
  onRefreshAll,
}) => {
  const [telemetry, setTelemetry] = useState<ControlRoomTelemetry | null>(null);
  const [approvals, setApprovals] = useState<PendingApprovalQueue | null>(null);
  const [growthMemories, setGrowthMemories] = useState<BusinessGrowthMemoryItem[]>([]);
  const [blueprint, setBlueprint] = useState<MissionBlueprint | null>(null);
  const [tieredOfferMatrix, setTieredOfferMatrix] = useState<TieredOfferMatrix | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [runningCycle, setRunningCycle] = useState<boolean>(false);
  const [generatingMission, setGeneratingMission] = useState<boolean>(false);
  const [spawningMission, setSpawningMission] = useState<boolean>(false);
  const [batchApproving, setBatchApproving] = useState<boolean>(false);
  const [selectedIndustryOffer, setSelectedIndustryOffer] = useState<string>("AI Agents & Automation");
  const [notification, setNotification] = useState<string | null>(null);

  const fetchControlRoomData = async () => {
    try {
      setLoading(true);
      const [telRes, appRes, memRes] = await Promise.all([
        api.getControlRoomStats(activeMissionId),
        api.getOperatorApprovalQueue(activeMissionId),
        api.getBusinessGrowthMemory(10),
      ]);
      setTelemetry(telRes);
      setApprovals(appRes);
      setGrowthMemories(memRes || []);
    } catch (err) {
      console.error("Failed to load control room data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchControlRoomData();
  }, [activeMissionId]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRunAutonomousCycle = async () => {
    try {
      setRunningCycle(true);
      const res = await api.runAutonomousCycle(activeMissionId);
      showToast(`Master Cycle Complete: ${res.leads_enrolled || 0} leads enrolled, ${res.staged_sequences_count || 0} touches staged into Approval Queue.`);
      await fetchControlRoomData();
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      console.error("Autonomous cycle failed:", err);
      showToast("Autonomous cycle encountered an issue. Check backend logs.");
    } finally {
      setRunningCycle(false);
    }
  };

  const handleGenerateBlueprint = async () => {
    try {
      setGeneratingMission(true);
      const bp = await api.generateMissionBlueprint(selectedIndustryOffer);
      setBlueprint(bp);
      showToast(`AI Mission Blueprint generated: "${bp.mission_name}"`);
    } catch (err) {
      console.error("Failed to generate mission blueprint:", err);
    } finally {
      setGeneratingMission(false);
    }
  };

  const handleSpawnMission = async () => {
    if (!blueprint) return;
    try {
      setSpawningMission(true);
      const created = await api.createAutonomousMission(blueprint);
      showToast(`Mission #${created.mission_id} "${created.title}" successfully instantiated!`);
      setBlueprint(null);
      await fetchControlRoomData();
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      console.error("Failed to spawn mission:", err);
    } finally {
      setSpawningMission(false);
    }
  };

  const handleBatchApprove = async () => {
    try {
      setBatchApproving(true);
      const res = await api.batchApproveOperatorQueue(activeMissionId);
      showToast(`Batch Authorized: ${res.total_approved} operator actions & communications safely dispatched.`);
      await fetchControlRoomData();
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      console.error("Batch approval failed:", err);
    } finally {
      setBatchApproving(false);
    }
  };

  const handleApproveAction = async (actionId: number) => {
    try {
      await api.approveOperatorAction(actionId);
      showToast(`Action #${actionId} approved and executed.`);
      await fetchControlRoomData();
    } catch (err) {
      console.error("Approve action failed:", err);
    }
  };

  const handleRejectAction = async (actionId: number) => {
    try {
      await api.rejectOperatorAction(actionId, "Rejected by CEO User");
      showToast(`Action #${actionId} rejected.`);
      await fetchControlRoomData();
    } catch (err) {
      console.error("Reject action failed:", err);
    }
  };

  const handleApproveComm = async (commId: number) => {
    try {
      await api.approveOperatorCommunication(commId);
      showToast(`Outreach communication #${commId} dispatched to client.`);
      await fetchControlRoomData();
    } catch (err) {
      console.error("Approve communication failed:", err);
    }
  };

  if (loading && !telemetry) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-slate-400 font-medium tracking-wide">Syncing Autonomous Control Room Telemetry...</p>
      </div>
    );
  }

  const currentMission = telemetry?.current_mission;
  const pendingApprovalsCount = approvals?.total_pending_count || 0;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="p-4 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-emerald-200 text-sm shadow-2xl flex items-center justify-between backdrop-blur-md animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white text-xs ml-4">✕</button>
        </div>
      )}

      {/* Control Room Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/60 border border-emerald-500/30 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Autonomous Business Operator v5
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              Revenue Control Room
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-normal">
                {currentMission ? currentMission.title : "Fleet Active"}
              </span>
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Converts high-level AI CEO strategies into automated mission creation, 3-tier offer generation,
              continuous lead hunting, and staged approval execution.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRunAutonomousCycle}
              disabled={runningCycle}
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-900/40 hover:shadow-emerald-900/60 transition-all disabled:opacity-50 active:scale-95"
            >
              <Zap className={`w-4 h-4 ${runningCycle ? "animate-spin" : "fill-current text-white"}`} />
              {runningCycle ? "Executing Operator Loop..." : "Run Autonomous Cycle"}
            </button>
            <button
              onClick={fetchControlRoomData}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
              title="Refresh Telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Top Telemetry KPI Metric Dials */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Target Revenue</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-white">
            {telemetry ? `${telemetry.total_revenue_target_aed.toLocaleString()} AED` : "—"}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across active missions</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Confirmed Won</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400">
            {telemetry ? `${telemetry.total_revenue_achieved_aed.toLocaleString()} AED` : "0 AED"}
          </div>
          <div className="text-[11px] text-emerald-500/80 mt-1">Verified bank receipts</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Active Pipeline</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-lg font-bold text-teal-300">
            {telemetry ? `${telemetry.total_active_pipeline_aed.toLocaleString()} AED` : "—"}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{telemetry?.total_leads_in_pipeline || 0} leads in funnel</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Pending Approvals</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-amber-400">
            {pendingApprovalsCount}
          </div>
          <div className="text-[11px] text-amber-500/80 mt-1">Human safety gate</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Top Sector</span>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xs font-semibold text-purple-200 truncate" title={telemetry?.best_performing_industry}>
            {telemetry?.best_performing_industry || "AI Agents"}
          </div>
          <div className="text-[11px] text-purple-400/80 mt-1">Highest velocity</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Top Channel</span>
            <Radio className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xs font-semibold text-cyan-200 truncate">
            {telemetry?.best_performing_source || "Telegram"}
          </div>
          <div className="text-[11px] text-cyan-400/80 mt-1">Maximum deal volume</div>
        </div>
      </div>

      {/* Main Control Room Grid: AI Mission Creator & Lead Hunter Fleet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): AI Mission Creator & 3-Tier Offer Generator */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. AI Mission Creator Panel */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <BrainCircuit className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">AI Mission Creator</h2>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Market Driven
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Synthesizes market demand, competitor signals, and sector ROI to formulate high-conviction Revenue Missions with pre-configured targets and source routing.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedIndustryOffer}
                onChange={(e) => setSelectedIndustryOffer(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                <option value="AI Agents & Automation">AI Agents & Automation</option>
                <option value="Dubai Real Estate & Advisory">Dubai Real Estate & Advisory</option>
                <option value="Custom Software Development">Custom Software Development</option>
                <option value="SaaS Products">SaaS Products</option>
                <option value="Website Development">Website Development</option>
                <option value="Mobile Applications">Mobile Applications</option>
              </select>

              <button
                onClick={handleGenerateBlueprint}
                disabled={generatingMission}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 text-emerald-400 ${generatingMission ? "animate-spin" : ""}`} />
                {generatingMission ? "Synthesizing Blueprint..." : "Generate AI Blueprint"}
              </button>
            </div>

            {/* Render Blueprint Card if generated */}
            {blueprint && (
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-300">{blueprint.mission_name}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    {blueprint.confidence_score}% Confidence
                  </span>
                </div>
                
                <p className="text-xs text-slate-300">{blueprint.strategy_summary}</p>

                <div className="grid grid-cols-3 gap-2 py-1 text-xs">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Target</span>
                    <span className="font-bold text-white">{blueprint.goal_amount.toLocaleString()} {blueprint.currency}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Duration</span>
                    <span className="font-bold text-white">{blueprint.deadline_hours / 24} Days</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Industries</span>
                    <span className="font-bold text-white truncate block">{blueprint.selected_industries[0]}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 italic">
                  💡 Rationale: {blueprint.creation_rationale}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setBlueprint(null)}
                    className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSpawnMission}
                    disabled={spawningMission}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    {spawningMission ? "Instantiating..." : "Instantiate Mission"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Autonomous 3-Tier Offer Architecture Preview */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-teal-400" />
                <h2 className="text-base font-bold text-white">Dynamic 3-Tier Offer Generator</h2>
              </div>
              <span className="text-xs text-slate-400">Starter • Growth • Enterprise</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Starter Tier */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      STARTER
                    </span>
                    <span className="text-xs font-bold text-white">5,000 AED</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200">Rapid Quick-Sprint</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Single-workflow automation agent, WhatsApp MTProto integration, 5-day delivery.
                  </p>
                </div>
                <div className="text-[10px] text-emerald-400 font-medium pt-2 border-t border-slate-900">
                  ROI: 15-20 hrs/week saved
                </div>
              </div>

              {/* Growth Tier */}
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-teal-500/40 relative flex flex-col justify-between space-y-3 shadow-lg shadow-teal-950/30">
                <div className="absolute -top-2 right-2 px-1.5 py-0.5 rounded bg-teal-500 text-[9px] font-bold text-slate-950 uppercase tracking-wider">
                  HIGH VELOCITY
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">
                      GROWTH
                    </span>
                    <span className="text-xs font-bold text-teal-300">15,000 AED</span>
                  </div>
                  <div className="text-xs font-semibold text-white">Autonomous Agent Suite</div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Multi-agent radar discovery, CRM syncing, multi-channel outreach, 10-day turnaround.
                  </p>
                </div>
                <div className="text-[10px] text-teal-400 font-medium pt-2 border-t border-slate-900">
                  ROI: 3x-5x outbound qualified pipeline
                </div>
              </div>

              {/* Enterprise Tier */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                      ENTERPRISE
                    </span>
                    <span className="text-xs font-bold text-purple-300">40,000+ AED</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200">Bespoke Knowledge Brain</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Custom LLM RAG engine, private VPC deployment, enterprise ERP integration, SLA guarantee.
                  </p>
                </div>
                <div className="text-[10px] text-purple-400 font-medium pt-2 border-t border-slate-900">
                  ROI: 10x full operational scalability
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Lead Hunter Fleet & Business Growth Memory */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 3. Lead Hunter Fleet Matrix */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
                <h2 className="text-base font-bold text-white">Lead Hunter Fleet</h2>
              </div>
              <span className="text-xs font-semibold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                6/6 Online
              </span>
            </div>

            <div className="space-y-2">
              {telemetry?.hunter_fleet.map((h, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{h.display_name}</div>
                      <div className="text-[10px] text-slate-400">{h.recommended_action}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-white">{h.signals_discovered}</span>
                    <span className="text-[10px] text-slate-400 block">{h.deals_won} deals won</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Business Growth Memory Log */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Award className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">Business Growth Memory</h2>
              </div>
              <span className="text-xs text-slate-400">Continuous AI Learning</span>
            </div>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {growthMemories.length === 0 ? (
                <div className="text-xs text-slate-500 py-4 text-center">No business cycles recorded yet.</div>
              ) : (
                growthMemories.map((m) => (
                  <div key={m.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-amber-300 uppercase text-[10px] tracking-wider">
                        {m.cycle_type}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-medium">
                        +{m.efficiency_gain_pct}% Efficiency
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{m.insight_summary}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {m.best_sources.slice(0, 2).map((s, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CEO Approval Execution Layer (Human Safety Gate) */}
      <div className="p-6 rounded-2xl bg-slate-900/95 border border-amber-500/30 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                CEO Approval Execution Queue
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  {pendingApprovalsCount} Pending Authorization
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Human-in-the-loop safety layer. No outreach message or strategy pivot is dispatched without explicit sign-off.
              </p>
            </div>
          </div>

          {pendingApprovalsCount > 0 && (
            <button
              onClick={handleBatchApprove}
              disabled={batchApproving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-950/40 disabled:opacity-50 self-start sm:self-auto"
            >
              <FileCheck className="w-4 h-4" />
              {batchApproving ? "Authorizing All..." : `Authorize All (${pendingApprovalsCount})`}
            </button>
          )}
        </div>

        {pendingApprovalsCount === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="text-sm font-semibold text-slate-200">All Operations Clear & Authorized</div>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No pending operator actions or staged communications in the queue. The autonomous loop is operating smoothly within safety thresholds.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Operator Actions Section */}
            {approvals && approvals.pending_operator_actions.length > 0 && (
              <div className="space-y-2.5">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Strategic Operator Optimizations ({approvals.pending_operator_actions.length})
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {approvals.pending_operator_actions.map((act) => (
                    <div key={act.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                            {act.action_type}
                          </span>
                          <span className="text-xs text-emerald-400 font-semibold">
                            +{act.revenue_impact_aed.toLocaleString()} AED Impact
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white">{act.title}</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{act.description}</p>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-900">
                        <button
                          onClick={() => handleRejectAction(act.id)}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 text-xs transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApproveAction(act.id)}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                        >
                          Approve & Apply
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Staged Communications Section */}
            {approvals && approvals.pending_communications.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Staged Client Outreach Messages ({approvals.pending_communications.length})
                </div>
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {approvals.pending_communications.map((comm) => (
                    <div key={comm.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {comm.channel}
                          </span>
                          <span className="text-xs font-semibold text-white">{comm.subject}</span>
                        </div>
                        <p className="text-xs text-slate-300 font-mono bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 line-clamp-2">
                          {comm.body}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleApproveComm(comm.id)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Approve & Send
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
