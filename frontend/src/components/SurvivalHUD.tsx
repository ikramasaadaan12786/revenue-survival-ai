"use client";

import React, { useState, useEffect } from "react";
import { 
  Target, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Compass, 
  CheckCircle2, 
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Send,
  MessageSquareQuote,
  CalendarCheck,
  Zap,
  Play,
  Pause,
  Archive,
  FolderGit2,
  Activity,
  Layers,
  Flame,
  Radio,
  Share2,
  Key
} from "lucide-react";
import { DashboardSummary, GlobalMissionsOverview } from "@/types";
import { api } from "@/lib/api";
import MissionEscalationCard from "./MissionEscalationCard";
import AcquisitionFunnelForecast from "./AcquisitionFunnelForecast";
import ConnectorAuthModal from "./ConnectorAuthModal";

interface Props {
  summary: DashboardSummary | null;
  onRunNextStep: () => void;
  onEvaluatePivot: () => void;
  isRunningStep: boolean;
  onRefreshSummary: () => void;
  onSwitchMission?: (id: number) => void;
  allMissions?: any[];
}

export default function SurvivalHUD({
  summary,
  onRunNextStep,
  onEvaluatePivot,
  isRunningStep,
  onRefreshSummary,
  onSwitchMission,
  allMissions = []
}: Props) {
  const [runningCycle, setRunningCycle] = useState(false);
  const [runningSweep, setRunningSweep] = useState(false);
  const [showConnectorModal, setShowConnectorModal] = useState(false);
  const [globalOverview, setGlobalOverview] = useState<GlobalMissionsOverview | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<number | null>(null);

  const handleRunAutoDiscoverySweep = async () => {
    if (!summary?.mission?.id) return;
    try {
      setRunningSweep(true);
      await api.runAutoDiscoverySweep(summary.mission.id);
      onRefreshSummary();
      fetchOverview();
    } catch (err) {
      console.error("Auto discovery sweep failed", err);
    } finally {
      setRunningSweep(false);
    }
  };

  const fetchOverview = async () => {
    try {
      const data = await api.getGlobalOverview().catch(() => null);
      if (data) {
        setGlobalOverview(data);
      }
    } catch (err) {
      console.warn("Failed fetching global missions overview", err);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [summary]);

  if (!summary || !summary.mission) {
    return (
      <div className="glass-panel p-8 text-center text-slate-400">
        <p>No active revenue survival mission found. Please create one to initialize.</p>
      </div>
    );
  }

  const mission = summary.mission;
  const goal_amount = Number(mission?.goal_amount || 0);
  const revenue_achieved = Number(summary.revenue_achieved || 0);
  const hours_remaining = Number(summary.hours_remaining ?? 72);
  const total_commission_potential = Number(summary.total_commission_potential || 0);
  const budget_spent = Number(summary.budget_spent || 0);
  const progressPct = goal_amount > 0 ? Math.min(100, Math.round((revenue_achieved / goal_amount) * 100)) : 0;

  const handleRunDailyCycle = async () => {
    try {
      setRunningCycle(true);
      await api.runDailyCycle(mission.id);
      onRefreshSummary();
      fetchOverview();
    } catch (err) {
      console.error("Failed running daily cycle", err);
    } finally {
      setRunningCycle(false);
    }
  };

  const handleToggleMissionStatus = async (mId: number, currentStatus: string) => {
    try {
      setIsUpdatingStatus(mId);
      const targetStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
      await api.updateMissionStatus(mId, targetStatus);
      onRefreshSummary();
      fetchOverview();
    } catch (err) {
      console.error("Failed toggling status", err);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleArchiveMission = async (mId: number) => {
    try {
      setIsUpdatingStatus(mId);
      await api.updateMissionStatus(mId, "ARCHIVED");
      onRefreshSummary();
      fetchOverview();
    } catch (err) {
      console.error("Failed archiving mission", err);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const sources = globalOverview?.source_breakdown || {
    Reddit: 0,
    LinkedIn: 0,
    Telegram: 0,
    ProductHunt: 0,
    GitHub: 0,
    Web: 0
  };

  return (
    <div className="space-y-8">
      {/* 1. Revenue Command Center Global KPIs Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Revenue Command Center</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  AUTONOMOUS OPERATING SYSTEM
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Multi-Mission Orchestrator • Real-Time Discovery Engine • Safety Approval Staging
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowConnectorModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/40 transition-all shadow-sm"
              title="Manage API keys & connection for 6 public signal connectors"
            >
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span>Connectors Auth</span>
            </button>

            <button
              onClick={handleRunAutoDiscoverySweep}
              disabled={runningSweep}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold text-black bg-cyan-400 hover:bg-cyan-300 shadow-glow transition-all disabled:opacity-50"
              title="Autonomous Daily Sweep: Scan feeds, score opportunities & stage new AI offers"
            >
              <Sparkles className={`w-3.5 h-3.5 ${runningSweep ? "animate-spin" : ""}`} />
              <span>{runningSweep ? "Sweeping..." : "Daily Auto Sweep"}</span>
            </button>

            <button
              onClick={() => {
                onRefreshSummary();
                fetchOverview();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sync All Feeds</span>
            </button>
          </div>
        </div>

        {/* Global Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          <div className="glass-panel p-4 glass-panel-hover border-cyan-500/20">
            <div className="text-slate-400 text-xs flex items-center justify-between mb-1">
              <span>Active Missions</span>
              <FolderGit2 className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black font-mono text-cyan-400">
              {globalOverview?.total_active_missions ?? 1}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              {globalOverview?.total_missions ?? 1} Total Ingested
            </div>
          </div>

          <div className="glass-panel p-4 glass-panel-hover border-indigo-500/20">
            <div className="text-slate-400 text-xs flex items-center justify-between mb-1">
              <span>Total Opportunities</span>
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black font-mono text-indigo-300">
              {globalOverview?.total_opportunities ?? summary.opportunities_count}
            </div>
            <div className="text-[10px] text-indigo-400 font-mono mt-1">Multi-Source Radar</div>
          </div>

          <div className="glass-panel p-4 glass-panel-hover border-rose-500/20 bg-gradient-to-b from-rose-950/20 to-transparent">
            <div className="text-slate-400 text-xs flex items-center justify-between mb-1">
              <span>Hot Opportunities</span>
              <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
            </div>
            <div className="text-2xl font-black font-mono text-rose-400">
              {globalOverview?.hot_opportunities ?? 0}
            </div>
            <div className="text-[10px] text-rose-400/80 font-mono mt-1">&gt; 90% Intent Score</div>
          </div>

          <div className="glass-panel p-4 glass-panel-hover border-amber-500/20">
            <div className="text-slate-400 text-xs flex items-center justify-between mb-1">
              <span>Pipeline Value</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black font-mono text-amber-300">
              {((globalOverview?.total_pipeline_value ?? summary.pipeline_expected) / 1000).toFixed(0)}k AED
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">Verified Deals</div>
          </div>

          <div className="glass-panel p-4 glass-panel-hover border-emerald-500/20">
            <div className="text-slate-400 text-xs flex items-center justify-between mb-1">
              <span>Revenue Generated</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black font-mono text-emerald-400">
              {(globalOverview?.total_revenue_generated ?? summary.revenue_achieved).toLocaleString()} AED
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-1">Confirmed Cash</div>
          </div>

          <div className="glass-panel p-4 glass-panel-hover border-purple-500/20">
            <div className="text-slate-400 text-xs flex items-center justify-between mb-1">
              <span>Safety Approval</span>
              <ShieldCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black font-mono text-purple-300">
              {summary.pending_approvals ?? 0}
            </div>
            <div className="text-[10px] text-purple-400 font-mono mt-1">Human Staged</div>
          </div>
        </div>

        {/* Source Breakdown Section */}
        <div className="glass-panel p-4 border border-white/[0.08] bg-slate-950/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
              Signal Discovery Ingestion Feeds:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <div className="px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-300 flex items-center gap-1.5">
              <span>Reddit:</span>
              <strong className="text-white font-bold">{sources.Reddit || 0} signals</strong>
            </div>

            <div className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 flex items-center gap-1.5">
              <span>LinkedIn:</span>
              <strong className="text-white font-bold">{sources.LinkedIn || 0} signals</strong>
            </div>

            <div className="px-3 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300 flex items-center gap-1.5">
              <span>Telegram:</span>
              <strong className="text-white font-bold">{sources.Telegram || 0} signals</strong>
            </div>

            <div className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-1.5">
              <span>Product Hunt:</span>
              <strong className="text-white font-bold">{sources.ProductHunt || 0} signals</strong>
            </div>

            <div className="px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 flex items-center gap-1.5">
              <span>GitHub:</span>
              <strong className="text-white font-bold">{sources.GitHub || 0} signals</strong>
            </div>

            <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
              <span>Web / Radar:</span>
              <strong className="text-white font-bold">{sources.Web || 0} signals</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE MISSIONS MANAGEMENT TABLE */}
      <div className="glass-panel overflow-hidden border border-cyan-500/20 bg-[#090d16]/90">
        <div className="p-4 sm:px-6 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Active Missions Management Matrix ({globalOverview?.active_missions?.length ?? allMissions.length ?? 1})
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Independent Parallel Execution • Real-Time Pipeline Isolation
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/[0.06]">
              <tr>
                <th className="py-3 px-4">Mission Name</th>
                <th className="py-3 px-4">Target Revenue</th>
                <th className="py-3 px-4">Current Revenue</th>
                <th className="py-3 px-4">Pipeline Value</th>
                <th className="py-3 px-4 text-center">Opps</th>
                <th className="py-3 px-4 text-center">Leads</th>
                <th className="py-3 px-4">Time Remaining</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {(globalOverview?.active_missions || allMissions).map((m: any) => {
                const isCurrent = m.id === mission.id;
                const hoursLeft = Number(m.time_remaining_hours ?? m.deadline_hours ?? 72);
                return (
                  <tr
                    key={m.id}
                    className={`transition-colors hover:bg-slate-800/40 ${
                      isCurrent ? "bg-cyan-500/[0.07] border-l-4 border-l-cyan-400" : ""
                    }`}
                  >
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">#{m.id}</span>
                        <span className="truncate max-w-[200px]">{m.title}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal truncate max-w-[240px]">
                        {m.industry || "Multi-Industry"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-cyan-300 font-bold">
                      {Number(m.goal_amount).toLocaleString()} {m.currency || "AED"}
                    </td>

                    <td className="py-3.5 px-4 text-emerald-400 font-bold">
                      {Number(m.revenue_generated || 0).toLocaleString()} {m.currency || "AED"}
                    </td>

                    <td className="py-3.5 px-4 text-amber-300 font-bold">
                      {Number(m.pipeline_value || 0).toLocaleString()} {m.currency || "AED"}
                    </td>

                    <td className="py-3.5 px-4 text-center text-slate-200">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {m.opportunities_count ?? 0}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center text-slate-200">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {m.leads_count ?? 0}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-amber-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>{hoursLeft}h</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          m.status === "ACTIVE"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : m.status === "PAUSED"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : "bg-slate-700/40 text-slate-300 border border-slate-600/40"
                        }`}
                      >
                        {m.status === "ACTIVE" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
                        {m.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onSwitchMission && !isCurrent && (
                          <button
                            onClick={() => onSwitchMission(m.id)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-all"
                          >
                            Switch
                          </button>
                        )}

                        <button
                          onClick={() => handleToggleMissionStatus(m.id, m.status)}
                          disabled={isUpdatingStatus === m.id}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                          title={m.status === "ACTIVE" ? "Pause Mission" : "Resume Mission"}
                        >
                          {m.status === "ACTIVE" ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
                        </button>

                        <button
                          onClick={() => handleArchiveMission(m.id)}
                          disabled={isUpdatingStatus === m.id}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
                          title="Archive Mission"
                        >
                          <Archive className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2.5 AI Mission Escalation Recommendation Banner */}
      <MissionEscalationCard
        missionId={mission.id}
        onEscalationApplied={() => {
          onRefreshSummary();
          fetchOverview();
        }}
      />

      {/* 3. Hero Banner: Current Selected Mission HUD */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-[#0e172a]/90 via-[#0a0f1d]/90 to-[#060911]/90 p-6 md:p-8 backdrop-blur-xl shadow-cardGlow">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Mission Info & Headline */}
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                ACTIVE MISSION #{mission.id}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Industry: <strong className="text-slate-200">{mission.industry}</strong>
              </span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {mission.title}
            </h1>
            
            <p className="text-sm text-slate-300 leading-relaxed">
              {mission.ai_strategy || "Autonomous zero-budget revenue survival execution."}
            </p>
          </div>

          {/* Quick HUD Progress & Status */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-white/[0.06]">
            {/* Target vs Current */}
            <div className="px-3 border-r border-white/[0.08] last:border-none">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Target Revenue</div>
              <div className="text-xl font-black text-cyan-400 font-mono">
                {goal_amount.toLocaleString()} <span className="text-xs text-slate-400 font-normal">{mission?.currency || "AED"}</span>
              </div>
            </div>

            {/* Revenue Achieved */}
            <div className="px-3 border-r border-white/[0.08] last:border-none">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Verified Revenue</div>
              <div className="text-xl font-black text-emerald-400 font-mono flex items-center gap-1">
                {revenue_achieved.toLocaleString()} <span className="text-xs text-slate-400 font-normal">{mission.currency}</span>
              </div>
            </div>

            {/* Time Left */}
            <div className="px-3">
              <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                Time Remaining
              </div>
              <div className="text-xl font-black text-amber-300 font-mono">
                {hours_remaining}h
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar & Commission Indicator */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              Survival Progress: <strong className="text-white">{progressPct}%</strong>
            </span>
            <span className="text-slate-400">
              Pipeline Value: <strong className="text-amber-300">{(summary.pipeline_expected || 0).toLocaleString()} AED</strong>
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-800/80 overflow-hidden p-0.5 border border-white/[0.05]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-700 shadow-glow"
              style={{ width: `${Math.max(5, progressPct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. AI Decision & Next Best Action Box */}
      <div className="glass-panel p-6 border-l-4 border-l-cyan-400 bg-gradient-to-r from-cyan-950/30 to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400 animate-spin" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                AI Revenue Strategy Brain • Next Action
              </span>
            </div>
            <p className="text-base font-semibold text-slate-100">
              "{summary.next_best_action}"
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onEvaluatePivot}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition-all font-mono"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Trigger Strategy Pivot
            </button>

            <button
              onClick={onRunNextStep}
              disabled={isRunningStep}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-black shadow-glow transition-all font-mono disabled:opacity-50"
            >
              <ArrowUpRight className="w-4 h-4" />
              {isRunningStep ? "Processing..." : "Execute Step"}
            </button>
          </div>
        </div>
      </div>

      {/* 5. Acquisition Funnel, Revenue Forecast & Source Performance Matrix */}
      <AcquisitionFunnelForecast
        summary={summary}
        globalOverview={globalOverview}
      />

      {/* Connector Auth Modal */}
      <ConnectorAuthModal
        isOpen={showConnectorModal}
        onClose={() => setShowConnectorModal(false)}
      />
    </div>
  );
}

