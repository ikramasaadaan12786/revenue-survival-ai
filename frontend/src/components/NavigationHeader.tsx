"use client";

import React from "react";
import { 
  Flame, 
  Target, 
  Clock, 
  Radio, 
  PlusCircle, 
  Zap, 
  Layers, 
  Users, 
  ShieldCheck, 
  Building2, 
  BarChart3, 
  Sparkles,
  Bot
} from "lucide-react";
import { DashboardSummary } from "@/types";

interface Props {
  summary: DashboardSummary | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewMission: () => void;
  onRunNextStep: () => void;
  isRunningStep: boolean;
}

export default function NavigationHeader({
  summary,
  activeTab,
  setActiveTab,
  onOpenNewMission,
  onRunNextStep,
  isRunningStep
}: Props) {
  const survivalStatus = summary?.survival_status || "ACTIVE";

  const getStatusBadge = () => {
    switch (survivalStatus) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            SURVIVAL ACTIVE
          </span>
        );
      case "PIVOTING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            AI STRATEGY PIVOT
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
            <Sparkles className="w-3.5 h-3.5" />
            MISSION COMPLETED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-400">
            CRITICAL
          </span>
        );
    }
  };

  const navItems = [
    { id: "command", label: "Command HUD", icon: Flame },
    { id: "strategy-brain", label: "Strategy Brain & 8-Industry Marketplace", icon: Sparkles, brain: true },
    { id: "planner", label: "Day Plan & Swarm", icon: Layers },
    { id: "opportunities", label: "Market Radar", icon: Radio },
    { id: "offers", label: "Offer Studio", icon: Sparkles },
    { id: "leads", label: "Lead Pipeline", icon: Users },
    { 
      id: "approvals", 
      label: "Safety Approvals", 
      icon: ShieldCheck, 
      badge: summary?.pending_approvals ? summary.pending_approvals : undefined 
    },
    { id: "real-estate", label: "Dubai Real Estate Mode", icon: Building2, special: true },
    { id: "analytics", label: "Analytics & Memory", icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#060911]/90 border-b border-white/[0.08]">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1px] shadow-glow">
              <div className="w-full h-full bg-[#090d16] rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-base">
                  Revenue Survival <span className="text-cyan-400">AI Agent</span>
                </span>
                {getStatusBadge()}
              </div>
              <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                <span>Autonomous Ops</span>
                <span className="text-slate-600">•</span>
                <span className="text-cyan-400/80">Research → Decide → Execute → Measure → Improve</span>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onRunNextStep}
              disabled={isRunningStep}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-glow font-mono transition-all transform active:scale-95 disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 ${isRunningStep ? "animate-spin" : "fill-black"}`} />
              {isRunningStep ? "EXECUTING STEP..." : "RUN AUTONOMOUS STEP"}
            </button>

            <button
              onClick={onOpenNewMission}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              <span>New Mission</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none border-t border-white/[0.04]">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? tab.special
                      ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm"
                    : tab.special
                    ? "text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? (tab.special ? "text-amber-300" : "text-cyan-400") : ""}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
