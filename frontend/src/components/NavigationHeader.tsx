"use client";

import React, { useState } from "react";
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
  Bot,
  ChevronDown,
  CheckCircle2,
  FolderGit2,
  Brain,
  Cpu
} from "lucide-react";
import { DashboardSummary } from "@/types";

interface Props {
  summary: DashboardSummary | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewMission: () => void;
  onRunNextStep: () => void;
  isRunningStep: boolean;
  missionsList?: any[];
  currentMissionId?: number;
  onSwitchMission?: (id: number) => void;
}

export default function NavigationHeader({
  summary,
  activeTab,
  setActiveTab,
  onOpenNewMission,
  onRunNextStep,
  isRunningStep,
  missionsList = [],
  currentMissionId,
  onSwitchMission
}: Props) {
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
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
            {survivalStatus}
          </span>
        );
    }
  };

  const navItems = [
    { id: "command", label: "Command HUD", icon: Flame },
    { id: "control-room", label: "Control Room v5", icon: Cpu, special: true },
    { id: "ceo-brain", label: "CEO Brain v4", icon: Brain, special: true },
    { id: "closing-engine", label: "Closing Engine", icon: Target, special: true },
    { id: "strategy-brain", label: "Strategy Brain & Marketplace", icon: Sparkles, brain: true },
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
    { id: "intelligence", label: "Revenue Intelligence", icon: Sparkles, special: true },
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

          {/* Mission Switcher Dropdown & Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Mission Selector */}
            {missionsList.length > 0 && onSwitchMission && (
              <div className="relative">
                <button
                  onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono bg-slate-900/90 hover:bg-slate-800/90 text-cyan-300 border border-cyan-500/30 transition-all"
                >
                  <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="max-w-[140px] truncate">
                    #{currentMissionId || summary?.mission?.id}: {summary?.mission?.title?.slice(0, 18)}...
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isSwitcherOpen ? "rotate-180" : ""}`} />
                </button>

                {isSwitcherOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-950/95 border border-cyan-500/30 backdrop-blur-2xl shadow-2xl p-2 z-50 space-y-1">
                    <div className="px-3 py-1.5 text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-white/[0.06]">
                      <span>Switch Active Mission</span>
                      <span className="text-cyan-400 font-bold">{missionsList.length} Total</span>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-1 py-1">
                      {missionsList.map((m: any) => {
                        const isSelected = m.id === (currentMissionId || summary?.mission?.id);
                        return (
                          <button
                            key={m.id}
                            onClick={() => {
                              onSwitchMission(m.id);
                              setIsSwitcherOpen(false);
                            }}
                            className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-start justify-between gap-2 ${
                              isSelected
                                ? "bg-cyan-500/15 border border-cyan-500/40 text-cyan-200"
                                : "hover:bg-slate-800/60 text-slate-300 border border-transparent"
                            }`}
                          >
                            <div className="space-y-0.5 min-w-0">
                              <div className="font-semibold text-white truncate flex items-center gap-1.5">
                                <span className="font-mono text-cyan-400">#{m.id}</span>
                                <span className="truncate">{m.title}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
                                <span>Target: {Number(m.goal_amount).toLocaleString()} {m.currency || "AED"}</span>
                                <span>•</span>
                                <span className={m.status === "ACTIVE" ? "text-emerald-400" : "text-amber-400"}>{m.status}</span>
                              </div>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => {
                        setIsSwitcherOpen(false);
                        onOpenNewMission();
                      }}
                      className="w-full mt-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition-all font-mono"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Create New Mission</span>
                    </button>
                  </div>
                )}
              </div>
            )}

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

