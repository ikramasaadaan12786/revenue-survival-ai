"use client";

import React, { useState } from "react";
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
  Play
} from "lucide-react";
import { DashboardSummary } from "@/types";
import { api } from "@/lib/api";

interface Props {
  summary: DashboardSummary | null;
  onRunNextStep: () => void;
  onEvaluatePivot: () => void;
  isRunningStep: boolean;
  onRefreshSummary: () => void;
}

export default function SurvivalHUD({
  summary,
  onRunNextStep,
  onEvaluatePivot,
  isRunningStep,
  onRefreshSummary
}: Props) {
  const [runningCycle, setRunningCycle] = useState(false);

  if (!summary || !summary.mission) {
    return (
      <div className="glass-panel p-8 text-center text-slate-400">
        <p>No active revenue survival mission found. Please create one to initialize.</p>
      </div>
    );
  }

  const { mission, hours_remaining, revenue_achieved, pipeline_expected, total_commission_potential, budget_spent, confidence_score } = summary;
  const progressPct = Math.min(100, Math.round((revenue_achieved / mission.goal_amount) * 100));

  const handleRunDailyCycle = async () => {
    try {
      setRunningCycle(true);
      await api.runDailyCycle(mission.id);
      onRefreshSummary();
    } catch (err) {
      console.error("Failed running daily cycle", err);
    } finally {
      setRunningCycle(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner: Mission Survival HUD */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-[#0e172a]/90 via-[#0a0f1d]/90 to-[#060911]/90 p-6 md:p-8 backdrop-blur-xl shadow-cardGlow">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Mission Info & Headline */}
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                MISSION #{mission.id}
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
                {mission.goal_amount.toLocaleString()} <span className="text-xs text-slate-400 font-normal">{mission.currency}</span>
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
              2% Broker Commission Potential: <strong className="text-amber-300">{total_commission_potential?.toLocaleString()} AED</strong>
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

      {/* 4-Phase Daily Scheduler Bar */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-cyan-500/20 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
            <CalendarCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Daily Autonomous Scheduler</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Morning Sweep → Discovery → Performance Review → Evening Strategy Pivot
            </div>
          </div>
        </div>

        <button
          onClick={handleRunDailyCycle}
          disabled={runningCycle}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono shadow-glow transition-all disabled:opacity-50"
        >
          <Play className={`w-3.5 h-3.5 fill-black ${runningCycle ? "animate-spin" : ""}`} />
          {runningCycle ? "RUNNING CYCLE..." : "TRIGGER DAILY 4-PHASE CYCLE"}
        </button>
      </div>

      {/* KPI Cards Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {/* Spent */}
        <div className="glass-panel p-4 glass-panel-hover">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Ad Spend</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold font-mono text-white">
            {budget_spent} {mission.currency}
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-1">Zero-Budget Mode</div>
        </div>

        {/* Opportunities Found */}
        <div className="glass-panel p-4 glass-panel-hover">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Opportunities</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold font-mono text-cyan-300">
            {summary.opportunities_count}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">Market Signals</div>
        </div>

        {/* Leads in CRM */}
        <div className="glass-panel p-4 glass-panel-hover">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>CRM Leads</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-lg font-bold font-mono text-indigo-300">
            {summary.leads_count}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">8-Stage Funnel</div>
        </div>

        {/* Pitches Sent */}
        <div className="glass-panel p-4 glass-panel-hover">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Pitches Sent</span>
            <Send className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold font-mono text-amber-300">
            {summary.messages_sent}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">Approved & Sent</div>
        </div>

        {/* Replies */}
        <div className="glass-panel p-4 glass-panel-hover">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Replies</span>
            <MessageSquareQuote className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-lg font-bold font-mono text-rose-300">
            {summary.replies_count}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">Active Convos</div>
        </div>

        {/* Commission Pipeline */}
        <div className="glass-panel p-4 glass-panel-hover">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>2% Commission</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold font-mono text-amber-300">
            {total_commission_potential > 1000 ? `${(total_commission_potential / 1000).toFixed(0)}k` : total_commission_potential} AED
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">Broker Payout</div>
        </div>
      </div>

      {/* AI Decision & Next Best Action Box */}
      <div className="glass-panel p-6 border-l-4 border-l-cyan-400 bg-gradient-to-r from-cyan-950/30 to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400 animate-spin" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                AI Survival Brain • Next Best Action
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
    </div>
  );
}
