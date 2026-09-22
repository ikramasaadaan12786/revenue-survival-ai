'use client';

import React from 'react';
import { Target, ArrowRight, CheckCircle2, Clock, Zap, Flame, ShieldAlert } from 'lucide-react';

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
    <div className="rounded-2xl bg-gradient-to-b from-[#0B101D]/90 via-[#06080F]/95 to-[#04060A]/95 border border-[#D4AF37]/25 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#D4AF37]/15">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-bold text-[#F9F6EE] tracking-wide">
              Active Missions Operation
            </h3>
            <p className="text-[10px] text-[#8C9BAE]">
              {missions.length > 0 ? `${missions.length} Missions in Database` : 'No Missions Active'}
            </p>
          </div>
        </div>

        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-[#D4AF37] hover:text-[#F3E5AB] flex items-center gap-1 transition-colors group"
        >
          <span>All Missions</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Mission Items List */}
      <div className="mt-3 space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
        {missions.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#8C9BAE]">
            <ShieldAlert className="w-6 h-6 mx-auto text-[#D4AF37]/40 mb-2" />
            No active missions in database.
          </div>
        ) : (
          missions.map((mission) => {
            const isCurrent = mission.id === activeMissionId;
            const target = mission.goal_amount || 0;
            const currentRev = mission.revenue_generated || 0;
            const remaining = Math.max(0, target - currentRev);
            const timeLeft = mission.time_remaining_hours !== undefined
              ? `${mission.time_remaining_hours.toFixed(1)}h left`
              : `${mission.deadline_hours || 18}h total`;
            const prob = mission.confidence_score ? `${Math.round(mission.confidence_score)}%` : '85%';
            const isCompleted = mission.status === 'COMPLETED' || mission.status === 'SUCCESS';

            // Industries display
            const indList = mission.industries && mission.industries.length > 0
              ? mission.industries
              : (mission.industry ? [mission.industry] : ['AI Agents & Automation']);

            return (
              <div
                key={mission.id}
                onClick={() => onSelectMission && onSelectMission(mission.id)}
                className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer group ${
                  isCurrent
                    ? 'bg-gradient-to-r from-[#D4AF37]/15 via-[#0B101D] to-[#04060A] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                    : 'bg-[#080C16]/70 border-white/[0.06] hover:border-[#D4AF37]/40 hover:bg-[#0B101D]'
                }`}
              >
                {/* Title & Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                      #{mission.id}
                    </span>
                    <h4 className="text-xs font-bold text-[#F9F6EE] group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                      {mission.title}
                    </h4>
                  </div>

                  <div>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        <Clock className="w-3 h-3 animate-spin" style={{ animationDuration: '8s' }} />
                        {mission.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Target & Revenue Progress */}
                <div className="mt-2.5 grid grid-cols-3 gap-2 text-[10px] bg-[#04060A]/80 p-2 rounded-lg border border-white/[0.03]">
                  <div>
                    <span className="text-[#8C9BAE] block">Target</span>
                    <span className="font-serif font-bold text-[#F9F6EE]">
                      AED {target.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8C9BAE] block">Current</span>
                    <span className="font-serif font-bold text-emerald-400">
                      AED {currentRev.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8C9BAE] block">Remaining</span>
                    <span className="font-serif font-bold text-[#D4AF37]">
                      AED {remaining.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Telemetry Chips */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[9px]">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5" />
                    {timeLeft}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Prob: {prob}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/[0.04] text-[#8C9BAE] border border-white/[0.05]">
                    Leads: {mission.leads_count ?? 0}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/[0.04] text-[#8C9BAE] border border-white/[0.05]">
                    Opps: {mission.opportunities_count ?? 0}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/[0.04] text-[#8C9BAE] border border-white/[0.05]">
                    Offers: {mission.offers_count ?? 0}
                  </span>
                </div>

                {/* Industries */}
                <div className="mt-2 text-[9px] text-[#8C9BAE] flex items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  <span className="text-[#D4AF37]">Industries:</span>
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
