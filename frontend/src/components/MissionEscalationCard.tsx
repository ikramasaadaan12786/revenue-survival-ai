"use client";

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Flame, 
  RefreshCw, 
  ArrowUpRight, 
  CheckCircle2, 
  Zap, 
  Target, 
  Sparkles,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { api } from "@/lib/api";

interface Props {
  missionId: number;
  onEscalationApplied: () => void;
}

export default function MissionEscalationCard({ missionId, onEscalationApplied }: Props) {
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const fetchEscalation = async () => {
    try {
      setLoading(true);
      const data = await api.getMissionEscalation(missionId).catch(() => null);
      if (data) {
        setRecommendation(data);
      }
    } catch (err) {
      console.warn("Failed fetching escalation recommendation", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (missionId) {
      fetchEscalation();
      setAppliedSuccess(false);
    }
  }, [missionId]);

  const handleApply = async () => {
    if (!recommendation) return;
    try {
      setApplying(true);
      await api.applyMissionEscalation(missionId, {
        action_type: recommendation.action_type,
        new_goal_amount: recommendation.recommended_new_goal
      });
      setAppliedSuccess(true);
      onEscalationApplied();
      setTimeout(() => {
        fetchEscalation();
      }, 2000);
    } catch (err) {
      console.error("Failed applying escalation", err);
    } finally {
      setApplying(false);
    }
  };

  if (!recommendation) return null;

  const isIncrease = recommendation.action_type === "INCREASE_TARGET";
  const isHighValue = recommendation.action_type === "FOCUS_HIGH_VALUE";

  return (
    <div
      className={`glass-panel p-5 md:p-6 rounded-2xl border transition-all ${
        isIncrease
          ? "border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-transparent"
          : isHighValue
          ? "border-rose-500/30 bg-gradient-to-r from-rose-950/30 via-slate-900/60 to-transparent"
          : "border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-slate-900/60 to-transparent"
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                isIncrease
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : isHighValue
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              }`}
            >
              {isIncrease ? <TrendingUp className="w-3.5 h-3.5" /> : isHighValue ? <Flame className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5" />}
              AI MISSION ESCALATION RECOMMENDED • {recommendation.confidence}% CONFIDENCE
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Pipeline Coverage: <strong className="text-white">{recommendation.coverage_ratio}x Goal</strong>
            </span>
          </div>

          <h3 className="text-lg font-bold text-white tracking-tight">
            {recommendation.title}
          </h3>

          <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-mono">
            {recommendation.reasoning}
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {recommendation.recommended_actions?.map((act: string, i: number) => (
              <span
                key={i}
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-900/80 border border-white/[0.06] text-slate-300 flex items-center gap-1"
              >
                <ChevronRight className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                <span>{act}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-center gap-3">
          <button
            onClick={handleApply}
            disabled={applying || appliedSuccess}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-mono font-bold transition-all shadow-lg ${
              appliedSuccess
                ? "bg-emerald-500 text-black shadow-emerald-500/20"
                : isIncrease
                ? "bg-emerald-400 hover:bg-emerald-300 text-black shadow-emerald-500/20"
                : isHighValue
                ? "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20"
                : "bg-amber-400 hover:bg-amber-300 text-black shadow-amber-500/20"
            } disabled:opacity-50`}
          >
            {appliedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>Escalation Applied!</span>
              </>
            ) : applying ? (
              <>
                <Zap className="w-4 h-4 animate-spin" />
                <span>Applying Escalation...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Apply AI Escalation Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
