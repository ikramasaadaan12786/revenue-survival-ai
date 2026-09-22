'use client';

import React from 'react';
import {
  TrendingUp,
  Megaphone,
  Radar,
  Box,
  Coins,
  Smile,
  Rocket,
  Video,
  Layers,
  ArrowRight,
  Bot
} from 'lucide-react';
import { DepartmentSummary, EmployeeScorecard } from '@/types';

interface AIDepartmentsGridProps {
  departmentsData?: DepartmentSummary[];
  scorecardsData?: EmployeeScorecard[];
  onSelectDepartment?: (deptId: string) => void;
  onViewAll?: () => void;
}

export const AIDepartmentsGrid: React.FC<AIDepartmentsGridProps> = ({
  departmentsData = [],
  scorecardsData = [],
  onSelectDepartment,
  onViewAll,
}) => {
  // Map department codes to metadata
  const deptConfigs: Record<string, {
    name: string;
    icon: any;
    color: string;
    borderGlow: string;
    iconColor: string;
    targetTab: string;
  }> = {
    sales: {
      name: 'Sales Manager',
      icon: TrendingUp,
      color: 'from-amber-500/20 to-amber-700/10',
      borderGlow: 'hover:border-amber-500/50',
      iconColor: 'text-[#D4AF37]',
      targetTab: 'closing_engine',
    },
    marketing: {
      name: 'Marketing Manager',
      icon: Megaphone,
      color: 'from-purple-500/20 to-purple-700/10',
      borderGlow: 'hover:border-purple-500/50',
      iconColor: 'text-purple-400',
      targetTab: 'revenue_empire',
    },
    lead_gen: {
      name: 'Lead Gen Manager',
      icon: Radar,
      color: 'from-cyan-500/20 to-cyan-700/10',
      borderGlow: 'hover:border-cyan-500/50',
      iconColor: 'text-cyan-400',
      targetTab: 'market_radar',
    },
    product: {
      name: 'Product Manager',
      icon: Box,
      color: 'from-yellow-500/20 to-yellow-700/10',
      borderGlow: 'hover:border-yellow-500/50',
      iconColor: 'text-yellow-400',
      targetTab: 'offers',
    },
    finance: {
      name: 'Finance Analyst',
      icon: Coins,
      color: 'from-amber-600/20 to-amber-800/10',
      borderGlow: 'hover:border-[#D4AF37]/50',
      iconColor: 'text-[#D4AF37]',
      targetTab: 'ceo_brain',
    },
    customer_success: {
      name: 'Customer Success',
      icon: Smile,
      color: 'from-pink-500/20 to-pink-700/10',
      borderGlow: 'hover:border-pink-500/50',
      iconColor: 'text-pink-400',
      targetTab: 'revenue_empire',
    },
    scaling_engine: {
      name: 'Scaling Engine',
      icon: Rocket,
      color: 'from-emerald-500/20 to-emerald-700/10',
      borderGlow: 'hover:border-emerald-500/50',
      iconColor: 'text-emerald-400',
      targetTab: 'scaling_engine',
    },
    content_factory: {
      name: 'Content Factory',
      icon: Video,
      color: 'from-amber-400/20 to-amber-600/10',
      borderGlow: 'hover:border-amber-400/50',
      iconColor: 'text-amber-300',
      targetTab: 'scaling_engine',
    },
    strategic_ops: {
      name: 'Strategic Ops / CEO',
      icon: Layers,
      color: 'from-orange-500/20 to-orange-700/10',
      borderGlow: 'hover:border-orange-500/50',
      iconColor: 'text-orange-400',
      targetTab: 'ceo_brain',
    },
  };

  const departmentKeys = Object.keys(deptConfigs);

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#0B101D]/90 via-[#06080F]/95 to-[#04060A]/95 border border-[#D4AF37]/25 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#D4AF37]/15">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-bold text-[#F9F6EE] tracking-wide">
              AI Departments Real-Time Telemetry
            </h3>
            <p className="text-[10px] text-[#8C9BAE]">
              {departmentsData.length > 0 ? `${departmentsData.length} Live Departments Synchronized` : 'Swarm Standby Mode'}
            </p>
          </div>
        </div>

        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-[#D4AF37] hover:text-[#F3E5AB] flex items-center gap-1 transition-colors group"
        >
          <span>View Org Matrix</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 3x3 Department Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {departmentKeys.map((deptKey) => {
          const cfg = deptConfigs[deptKey];
          const Icon = cfg.icon;

          // Find real department telemetry matching deptKey
          const realDept = departmentsData.find(
            (d) =>
              d.name.toLowerCase().includes(deptKey.replace('_', ' ')) ||
              d.name.toLowerCase().includes(deptKey) ||
              d.department_type?.toLowerCase() === deptKey
          );

          // Find scorecard if available
          const realCard = scorecardsData.find(
            (s) =>
              (s.department || '').toLowerCase().includes(deptKey.replace('_', ' ')) ||
              (s.department || '').toLowerCase().includes(deptKey) ||
              (s.role || s.agent_role || '').toLowerCase().includes(deptKey.replace('_', ' '))
          );

          const statusText = realDept?.status || (realCard?.status ? 'Online' : 'Online');
          const isOnline = statusText.toUpperCase() === 'ONLINE' || statusText.toUpperCase() === 'ACTIVE';
          const tasksDone = realDept?.active_tasks_count ?? realCard?.tasks_completed ?? 0;
          const workload = realDept?.workload_level ?? (realCard?.workload_score ? `${realCard.workload_score}%` : 'Optimal');
          const revAttr = realDept?.revenue_attributed_aed ?? realCard?.revenue_generated_aed ?? 0;

          return (
            <div
              key={deptKey}
              onClick={() => onSelectDepartment && onSelectDepartment(cfg.targetTab)}
              className={`relative rounded-xl bg-[#080C16]/80 border border-[#D4AF37]/15 p-3.5 hover:bg-gradient-to-br ${cfg.color} ${cfg.borderGlow} transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)]`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg bg-[#06080F]/80 border border-[#D4AF37]/20 ${cfg.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#F9F6EE] group-hover:text-[#F3E5AB] transition-colors leading-tight">
                      {cfg.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                      <span className={`text-[10px] font-medium ${isOnline ? 'text-emerald-400' : 'text-[#8C9BAE]'}`}>
                        {statusText}
                      </span>
                    </div>
                  </div>
                </div>

                <ArrowRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
              </div>

              {/* Real Tasks & Workload Breakdown */}
              <div className="mt-2.5 pt-2 border-t border-white/[0.04] grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-[#8C9BAE] block">Tasks Done</span>
                  <span className="font-semibold text-[#F9F6EE]">{tasksDone}</span>
                </div>
                <div>
                  <span className="text-[#8C9BAE] block">Workload</span>
                  <span className="font-semibold text-cyan-400">{workload}</span>
                </div>
              </div>

              {/* Revenue Contribution */}
              <div className="mt-1.5 pt-1.5 border-t border-white/[0.02] flex items-center justify-between text-[10px]">
                <span className="text-[#8C9BAE]">Revenue Impact:</span>
                <span className="font-serif font-bold text-[#D4AF37]">
                  {revAttr > 0 ? `AED ${revAttr.toLocaleString()}` : 'AED 0'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
