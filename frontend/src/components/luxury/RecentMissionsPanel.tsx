'use client';

import React from 'react';
import { Target, ArrowRight, CheckCircle2, Clock, Zap, ShieldAlert, Award } from 'lucide-react';

interface MissionItem {
  id: number;
  title: string;
  goal_amount: number;
  revenue_generated?: number;
  pipeline_value?: number;
  opportunities_count?: number;
  leads_count?: number;
  offers_count?: number;
  time_remaining_hours?: number;
  deadline_hours?: number;
  status: string;
  industry?: string;
  industries?: string[];
  confidence_score?: number;
  currency?: string;
}

interface RecentMissionsPanelProps {
  missions?: MissionItem[];
  activeMissionId?: number;
  onViewAll?: () => void;
  onSelectMission?: (missionId: number) => void;
}

export const RecentMissionsPanel: React.FC<RecentMissionsPanelProps> = ({
  missions = [],
  activeMissionId,
  onViewAll,
  onSelectMission,
}) => {
  return (
    <div className="rounded-3xl bg-gradient-to-b from-[#0B101D]/90 via-[#070A14]/95 to-[#04060A]/98 border border-[#D4AF37]/35 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-2xl flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-sm lg:text-base font-bold text-[#F9F6EE] tracking-wide">
              Active Revenue Missions
            </h3>
            <p className="text-[10.5px] text-[#8C9BAE]">
              {missions.length > 0 ? `${missions.length} Campaigns Synchronized` : 'No Active Missions'}
            </p>
          </div>
        </div>

        <button
          onClick={onViewAll}
          className="text-xs font-bold text-[#D4AF37] hover:text-[#FFF6E5] flex items-center gap-1.5 transition-colors group px-3 py-1.5 rounded-lg hover:bg-[#D4AF37]/10 border border-transparent hover:border-[#D4AF37]/30"
        >
          <span>All Missions</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Mission Items List */}
      <div className="mt-4 space-y-3.5 flex-1 overflow-y-auto max-h-[380px] pr-1">
        {missions.length === 0 ? (
          <div className="text-center py-12 text-xs text-[#8C9BAE]">
            <ShieldAlert className="w-8 h-8 mx-auto text-[#D4AF37]/40 mb-2" />
            No active missions in database.
          </div>
        ) : (
          missions.map((mission) => {
            const isCurrent = mission.id === activeMissionId;
            const target = mission.goal_amount || 0;
            const currentRev = mission.revenue_generated || 0;
            const remaining = Math.max(0, target - currentRev);
            const progressPct = target > 0 ? Math.min(100, Math.round((currentRev / target) * 100)) : 0;
            const timeLeft = mission.time_remaining_hours !== undefined
              ? `${mission.time_remaining_hours.toFixed(1)}h left`
              : `${mission.deadline_hours || 18}h total`;
            const prob = mission.confidence_score ? `${Math.round(mission.confidence_score)}%` : '89%';
            const isCompleted = mission.status === 'COMPLETED' || mission.status === 'SUCCESS';

            const indList = mission.industries && mission.industries.length > 0
              ? mission.industries
              : (mission.industry ? [mission.industry] : ['AI Agents & Automation']);

            return (
              <div
                key={mission.id}
                onClick={() => onSelectMission && onSelectMission(mission.id)}
                className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer group ${
                  isCurrent
                    ? 'bg-gradient-to-r from-[#D4AF37]/20 via-[#0B101D] to-[#04060A] border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.25)]'
                    : 'bg-[#080C16]/80 border-white/[0.06] hover:border-[#D4AF37]/50 hover:bg-[#0B101D]'
                }`}
              >
                {/* Title & Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded-lg text-[10.5px] font-mono font-bold bg-[#D4AF37]/25 text-[#F5D77F] border border-[#D4AF37]/40 shadow-[0_0_8px_rgba(212,175,55,0.2)]">
                      #{mission.id}
                    </span>
                    <h4 className="text-xs font-bold text-[#F9F6EE] group-hover:text-[#F5D77F] transition-colors line-clamp-1">
                      {mission.title}
                    </h4>
                  </div>

                  <div>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/35">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/35 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                        <Clock className="w-3 h-3 animate-spin" style={{ animationDuration: '8s' }} />
                        {mission.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 w-full bg-[#06080F] h-2 rounded-full overflow-hidden border border-white/[0.05]">
                  <div
                    className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F5D77F] rounded-full shadow-[0_0_10px_rgba(212,175,55,0.8)] transition-all duration-500"
                    style={{ width: `${Math.max(5, progressPct)}%` }}
                  />
                </div>

                {/* Target & Revenue Progress */}
                <div className="mt-3 grid grid-cols-3 gap-2 text-[10.5px] bg-[#04060A]/90 p-2.5 rounded-xl border border-white/[0.04]">
                  <div>
                    <span className="text-[#8C9BAE] block text-[9.5px]">Target</span>
                    <span className="font-serif font-bold text-[#F9F6EE]">
                      AED {target.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8C9BAE] block text-[9.5px]">Current</span>
                    <span className="font-serif font-bold text-emerald-400">
                      AED {currentRev.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8C9BAE] block text-[9.5px]">Remaining</span>
                    <span className="font-serif font-bold text-[#D4AF37]">
                      AED {remaining.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Telemetry Chips */}
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[9.5px]">
                  <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {timeLeft}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                    Probability: {prob}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.05] text-[#8C9BAE] border border-white/[0.06]">
                    Leads: {mission.leads_count ?? 0}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.05] text-[#8C9BAE] border border-white/[0.06]">
                    Opps: {mission.opportunities_count ?? 0}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.05] text-[#8C9BAE] border border-white/[0.06]">
                    Offers: {mission.offers_count ?? 0}
                  </span>
                </div>

                {/* Industries */}
                <div className="mt-2 text-[9.5px] text-[#8C9BAE] flex items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  <span className="text-[#D4AF37] font-semibold">Industries:</span>
                  <span className="text-slate-300">{indList.slice(0, 3).join(', ')}{indList.length > 3 ? ` +${indList.length - 3}` : ''}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
