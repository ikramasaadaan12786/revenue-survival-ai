'use client';

import React from 'react';
import { Target, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

interface RecentMissionsPanelProps {
  onViewAll?: () => void;
  onSelectMission?: (missionId: string) => void;
}

export const RecentMissionsPanel: React.FC<RecentMissionsPanelProps> = ({
  onViewAll,
  onSelectMission,
}) => {
  const missions = [
    {
      id: 'm1',
      title: 'Close 3 High-Value Leads',
      department: 'Sales',
      status: 'In Progress',
      statusType: 'progress',
      iconEmoji: '💼',
    },
    {
      id: 'm2',
      title: 'Launch UAE Viral Campaign',
      department: 'Marketing',
      status: 'In Progress',
      statusType: 'progress',
      iconEmoji: '🚀',
    },
    {
      id: 'm3',
      title: 'AI Real Estate SaaS MVP',
      department: 'Product',
      status: 'Completed',
      statusType: 'completed',
      iconEmoji: '🏢',
    },
    {
      id: 'm4',
      title: 'Investor Outreach',
      department: 'Scaling',
      status: 'In Progress',
      statusType: 'progress',
      iconEmoji: '📈',
    },
    {
      id: 'm5',
      title: 'Client Onboarding - Emaar',
      department: 'Customer Success',
      status: 'Completed',
      statusType: 'completed',
      iconEmoji: '💎',
    },
  ];

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#0B101D]/90 via-[#06080F]/95 to-[#04060A]/95 border border-[#D4AF37]/25 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#D4AF37]/15">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
            <Target className="w-4 h-4" />
          </div>
          <h3 className="font-serif text-sm font-bold text-[#F9F6EE] tracking-wide">
            Recent Missions
          </h3>
        </div>

        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-[#D4AF37] hover:text-[#F3E5AB] flex items-center gap-1 transition-colors group"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Mission Items List */}
      <div className="mt-3 space-y-2.5">
        {missions.map((mission) => (
          <div
            key={mission.id}
            onClick={() => onSelectMission && onSelectMission(mission.id)}
            className="flex items-center justify-between p-2.5 rounded-xl bg-[#080C16]/60 border border-white/[0.04] hover:border-[#D4AF37]/30 hover:bg-[#0B101D] transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-sm">{mission.iconEmoji}</span>
              <div>
                <h4 className="text-xs font-semibold text-[#F9F6EE] group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                  {mission.title}
                </h4>
                <p className="text-[10px] text-[#8C9BAE] font-medium">
                  {mission.department}
                </p>
              </div>
            </div>

            <div>
              {mission.statusType === 'completed' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  Completed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Clock className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} />
                  In Progress
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
