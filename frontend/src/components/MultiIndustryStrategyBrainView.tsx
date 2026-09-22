"use client";

import React, { useState, useEffect } from "react";
import { 
  BrainCircuit, 
  Sparkles, 
  Calculator, 
  Layers, 
  Compass, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Target, 
  ArrowRight, 
  RefreshCw, 
  ShieldCheck, 
  Zap, 
  Briefcase, 
  Search, 
  Database,
  Radio,
  CheckCircle2
} from "lucide-react";
import { api } from "@/lib/api";
import { RevenueEvaluationResult, ServiceOffering } from "@/types";

interface Props {
  missionId: number;
  onRefreshSummary: () => void;
}

export default function MultiIndustryStrategyBrainView({ missionId, onRefreshSummary }: Props) {
  // Calculator & Brain inputs
  const [targetAmount, setTargetAmount] = useState<number>(5000);
  const [deadlineHours, setDeadlineHours] = useState<number>(72);
  const [budget, setBudget] = useState<number>(0);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<RevenueEvaluationResult | null>(null);

  // Marketplace state
  const [selectedIndustry, setSelectedIndustry] = useState<string>("ALL");
  const [services, setServices] = useState<ServiceOffering[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [loadingMarketplace, setLoadingMarketplace] = useState(true);

  // Multi-industry hunting state
  const [hunting, setHunting] = useState(false);
  const [huntResult, setHuntResult] = useState<any>(null);

  // Autonomous Pivot state
  const [pivoting, setPivoting] = useState(false);
  const [pivotResult, setPivotResult] = useState<any>(null);

  const loadMarketplaceData = async () => {
    try {
      setLoadingMarketplace(true);
      const [indData, svcData] = await Promise.all([
        api.fetchMarketplaceIndustries(),
        api.fetchMarketplaceServices()
      ]);
      setIndustries(["ALL", ...(indData.industries || [])]);
      setServices(svcData.services || []);
    } catch (e) {
      console.error("Failed loading marketplace data", e);
    } finally {
      setLoadingMarketplace(false);
    }
  };

  const runEvaluation = async () => {
    try {
      setEvaluating(true);
      const res = await api.evaluateRevenueIntent({
        target_amount: targetAmount,
        deadline_hours: deadlineHours,
        budget: budget,
        currency: "AED"
      });
      setEvaluation(res);
    } catch (e) {
      console.error("Failed evaluating revenue intent", e);
    } finally {
      setEvaluating(false);
    }
  };

  useEffect(() => {
    loadMarketplaceData();
    runEvaluation();
  }, []);

  const handleAutoApplyBrain = async () => {
    try {
      setEvaluating(true);
      await api.autoCreateMissionFromBrain({
        target_amount: targetAmount,
        deadline_hours: deadlineHours,
        budget: budget,
        currency: "AED"
      });
      onRefreshSummary();
      await runEvaluation();
    } catch (e) {
      console.error("Failed applying brain strategy", e);
    } finally {
      setEvaluating(false);
    }
  };

  const handleHuntSignals = async () => {
    try {
      setHunting(true);
      const res = await api.huntMultiIndustrySignals(missionId, selectedIndustry);
      setHuntResult(res);
      onRefreshSummary();
    } catch (e) {
      console.error("Failed hunting multi-industry signals", e);
    } finally {
      setHunting(false);
    }
  };

  const handleTriggerPivot = async (newIndustry?: string) => {
    try {
      setPivoting(true);
      const res = await api.triggerStrategyPivot(missionId, newIndustry);
      setPivotResult(res);
      onRefreshSummary();
    } catch (e) {
      console.error("Failed triggering strategy pivot", e);
    } finally {
      setPivoting(false);
    }
  };

  const filteredServices = selectedIndustry === "ALL" 
    ? services 
    : services.filter(s => s.industry.toLowerCase() === selectedIndustry.toLowerCase());

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-purple-400 animate-pulse" />
            Autonomous Multi-Industry Revenue Strategy Brain
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Universal Operator • 8 Service Industries • Mathematical Conversion Engine • Autonomous Pivot Protocol
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleHuntSignals}
            disabled={hunting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-mono transition-all disabled:opacity-50"
          >
            <Radio className={`w-3.5 h-3.5 text-cyan-400 ${hunting ? "animate-spin" : ""}`} />
            {hunting ? "Scanning Multi-Industry..." : "Hunt All 8 Industries"}
          </button>

          <button
            onClick={() => handleTriggerPivot()}
            disabled={pivoting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-mono transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${pivoting ? "animate-spin" : ""}`} />
            {pivoting ? "Pivoting Strategy..." : "Autonomous Strategy Pivot"}
          </button>
        </div>
      </div>

      {/* 1. Goal Input & Strategy Calculator Controls */}
      <div className="glass-panel p-6 border border-purple-500/30 bg-[#0d0d1f]/90 space-y-5">
        <div className="flex items-center gap-3 border-b border-white/[0.06] pb-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Revenue Intent & Math Engine</h3>
            <p className="text-xs text-slate-400 font-mono">
              Give Target, Deadline, and Budget — the AI computes the fastest monetization path across 8 industries.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-400" /> Revenue Target (AED)
            </label>
            <input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(parseFloat(e.target.value) || 0)}
              className="w-full mt-1.5 bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-sm font-bold font-mono text-white focus:border-purple-400 focus:outline-none"
              placeholder="5000"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" /> Deadline (Hours)
            </label>
            <input
              type="number"
              value={deadlineHours}
              onChange={(e) => setDeadlineHours(parseInt(e.target.value) || 24)}
              className="w-full mt-1.5 bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-sm font-bold font-mono text-white focus:border-purple-400 focus:outline-none"
              placeholder="72"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-amber-400" /> Budget Allocated (AED)
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
              className="w-full mt-1.5 bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-sm font-bold font-mono text-white focus:border-purple-400 focus:outline-none"
              placeholder="0"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={runEvaluation}
              disabled={evaluating}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold font-mono bg-purple-500 hover:bg-purple-400 text-black flex items-center justify-center gap-1.5 shadow-glow transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 fill-black ${evaluating ? "animate-spin" : ""}`} />
              {evaluating ? "Calculating..." : "Compute Best Path"}
            </button>
          </div>
        </div>

        {/* Evaluation Output Card */}
        {evaluation && (
          <div className="mt-4 p-5 rounded-xl bg-slate-950/80 border border-purple-500/40 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/[0.05] pb-3">
              <div className="space-y-1">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40 uppercase">
                  {evaluation.goal_tier}
                </span>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  Recommended Industry: <span className="text-cyan-400">{evaluation.primary_industry}</span>
                </h4>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="text-slate-400">Conviction:</span>
                <span className="text-emerald-400 font-bold text-sm">{evaluation.confidence_score}%</span>
              </div>
            </div>

            <p className="text-xs text-slate-200 font-sans leading-relaxed">
              {evaluation.strategic_thesis}
            </p>

            {/* Math Breakdown Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-900/90 p-3 rounded-lg border border-white/[0.05]">
                <div className="text-[10px] font-mono text-slate-400">Required Clients</div>
                <div className="text-base font-bold text-white font-mono mt-0.5">
                  {evaluation.primary_service.required_clients} Client(s)
                </div>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-lg border border-white/[0.05]">
                <div className="text-[10px] font-mono text-slate-400">Unit Price</div>
                <div className="text-base font-bold text-cyan-400 font-mono mt-0.5">
                  {evaluation.primary_service.unit_price_aed.toLocaleString()} AED
                </div>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-lg border border-white/[0.05]">
                <div className="text-[10px] font-mono text-slate-400">50% Upfront Cash</div>
                <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                  {evaluation.primary_service.immediate_cash_collected_aed.toLocaleString()} AED
                </div>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-lg border border-white/[0.05]">
                <div className="text-[10px] font-mono text-slate-400">Turnaround Velocity</div>
                <div className="text-base font-bold text-amber-400 font-mono mt-0.5">
                  {evaluation.primary_service.total_time_required_hours}h / {deadlineHours}h
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleAutoApplyBrain}
                className="px-4 py-2 rounded-xl text-xs font-bold font-mono bg-gradient-to-r from-purple-500 to-cyan-400 text-black hover:opacity-90 flex items-center gap-2"
              >
                Apply Strategy & Launch Swarm <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hunt / Pivot Notifications */}
      {huntResult && (
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 text-xs font-mono space-y-1">
          <span className="text-emerald-400 font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Multi-Industry Hunter Completed Scan:
          </span>
          <p className="text-slate-200">
            Ingested <strong>{huntResult.signals_ingested}</strong> buying signals and created <strong>{huntResult.leads_created}</strong> qualified CRM leads across 8 industries.
          </p>
        </div>
      )}

      {pivotResult && (
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/40 text-xs font-mono space-y-1">
          <span className="text-amber-400 font-bold flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4" /> Autonomous Strategy Pivot Executed:
          </span>
          <p className="text-slate-200">
            Pivoted from <strong>{pivotResult.previous_industry}</strong> to <strong>{pivotResult.new_industry}</strong>. Ingested {pivotResult.signals_ingested} fresh industry leads.
          </p>
        </div>
      )}

      {/* 2. Service Marketplace Catalog (8 Industries) */}
      <div className="glass-panel p-6 border border-white/[0.08] bg-[#090d18]/90 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Service Marketplace Database
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  8 Industries
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Real Estate • Web Dev • Mobile Apps • Custom Software • AI Agents • SaaS • Automation • Marketing
              </p>
            </div>
          </div>

          {/* Industry Filter Pills */}
          <div className="flex flex-wrap gap-1.5 font-mono text-xs">
            {industries.map((ind) => (
              <button
                key={ind}
                onClick={() => setSelectedIndustry(ind)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  selectedIndustry === ind
                    ? "bg-purple-500 text-black font-bold shadow-sm"
                    : "bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-white/[0.05]"
                }`}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredServices.map((svc) => (
            <div
              key={svc.id}
              className="bg-slate-900/60 border border-white/[0.06] hover:border-purple-500/40 p-5 rounded-xl space-y-3 flex flex-col justify-between transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    {svc.industry}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    {svc.typical_price_aed.toLocaleString()} AED
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white">{svc.service_name}</h4>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">{svc.headline}</p>

                <div className="space-y-1 pt-1 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Turnaround Delivery:</span>
                    <span className="text-white font-bold">{svc.delivery_hours} Hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Upfront Cash Deposit:</span>
                    <span className="text-emerald-400 font-bold">{svc.upfront_deposit_pct}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Conversion Difficulty:</span>
                    <span className="text-cyan-300">{svc.conversion_difficulty}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between">
                <button
                  onClick={() => handleTriggerPivot(svc.industry)}
                  className="text-[11px] font-mono font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  Pivot to {svc.industry} <ArrowRight className="w-3 h-3" />
                </button>
                <span className="text-[10px] font-mono text-slate-500">
                  {Math.round(svc.success_probability * 100)}% Conviction
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
