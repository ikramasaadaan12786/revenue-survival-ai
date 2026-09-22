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
  const deptConfigs: Record<string, {
    name: string;
    icon: any;
    color: string;
    borderGlow: string;
    iconColor: string;
    targetTab: string;
    roleTag: string;
  }> = {
    sales: {
      name: 'Sales Manager',
      icon: TrendingUp,
      color: 'from-amber-500/20 via-[#0B101D] to-[#04060A]',
      borderGlow: 'hover:border-amber-400/60',
      iconColor: 'text-[#F5D77F]',
      targetTab: 'closing_engine',
      roleTag: 'Outbound & Closers',
    },
    marketing: {
      name: 'Marketing Manager',
      icon: Megaphone,
      color: 'from-purple-500/20 via-[#0B101D] to-[#04060A]',
      borderGlow: 'hover:border-purple-400/60',
      iconColor: 'text-purple-300',
      targetTab: 'revenue_empire',
      roleTag: 'Brand & Campaigns',
    },
    lead_gen: {
      name: 'Lead Gen Manager',
      icon: Radar,
      color: 'from-cyan-500/20 via-[#0B101D] to-[#04060A]',
      borderGlow: 'hover:border-cyan-400/60',
      iconColor: 'text-cyan-300',
      targetTab: 'market_radar',
      roleTag: 'Radar Ingestion Swarm',
    },
    product: {
      name: 'Product Manager',
      icon: Box,
      color: 'from-yellow-500/20 via-[#0B101D] to-[#04060A]',
      borderGlow: 'hover:border-yellow-400/60',
      iconColor: 'text-yellow-300',
      targetTab: 'offers',
      roleTag: 'Tiered Offer Studio',
    },
    finance: {
      name: 'Finance Analyst',
      icon: Coins,
      color: 'from-amber-600/20 via-[#0B101D] to-[#04060A]',
      borderGlow: 'hover:border-[#D4AF37]/60',
      iconColor: 'text-[#D4AF37]',
      targetTab: 'ceo_brain',
      roleTag: 'Pricing & Cashflow',
    },
    customer_success: {
      name: 'Customer Success',
      icon: Smile,
      color: 'from-pink-500/20 via-[#0B101D] to-[#04060A]',
      borderGlow: 'hover:border-pink-400/60',
      iconColor: 'text-pink-300',
      targetTab: 'revenue_empire',
      roleTag: 'Client Retainers & LTV',
    },
    scaling_engine: {
      name: 'Scaling Engine',
      icon: Rocket,
      color: 'from-emerald-500/20 via-[#0B101D] to-[#04060A]',
      borderGlow: 'hover:border-emerald-400/60',
      iconColor: 'text-emerald-300',
      targetTab: 'scaling_engine',
      roleTag: 'Hiring & Outsource AI',
    },
    content_factory: {
      name: 'Content Factory',
      icon: Video,
      color: 'from-amber-400/20 via-[#0B101D] to-[#04060A]',
      borderGlow: 'hover:border-amber-400/60',
      iconColor: 'text-amber-200',
      targetTab: 'scaling_engine',
      roleTag: 'Multi-Platform Media',
    },
    strategic_ops: {
      name: 'Strategic Ops / CEO',
      icon: Layers,
      color: 'from-orange-500/20 via-[#0B101D] to-[#04060A]',
      borderGlow: 'hover:border-orange-400/60',
      iconColor: 'text-orange-300',
      targetTab: 'ceo_brain',
      roleTag: 'Decision Directives',
    },
  };

  const departmentKeys = Object.keys(deptConfigs);

  return (
    <div className="rounded-3xl bg-gradient-to-b from-[#0B101D]/90 via-[#070A14]/95 to-[#04060A]/98 border border-[#D4AF37]/35 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-2xl flex flex-col justify-between h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#D4AF37]/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-sm lg:text-base font-bold text-[#F9F6EE] tracking-wide">
              AI Department Organization Matrix
            </h3>
            <p className="text-[10.5px] text-[#8C9BAE]">
              9 Autonomous Departments Operating 24/7
            </p>
          </div>
        </div>

        <button
          onClick={onViewAll}
          className="text-xs font-bold text-[#D4AF37] hover:text-[#FFF6E5] flex items-center gap-1.5 transition-colors group px-3 py-1.5 rounded-lg hover:bg-[#D4AF37]/10 border border-transparent hover:border-[#D4AF37]/30"
        >
          <span>View Org Chart</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* 3x3 Luxury Department Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 flex-1">
        {departmentKeys.map((deptKey) => {
          const cfg = deptConfigs[deptKey];
          const Icon = cfg.icon;

          const realDept = departmentsData.find(
            (d) =>
              (d.name || '').toLowerCase().includes(deptKey.replace('_', ' ')) ||
              (d.name || '').toLowerCase().includes(deptKey) ||
              (d.department_type || '').toLowerCase() === deptKey
          );

          const realCard = scorecardsData.find(
            (s) =>
              (s.department || '').toLowerCase().includes(deptKey.replace('_', ' ')) ||
              (s.department || '').toLowerCase().includes(deptKey) ||
              (s.role || s.agent_role || '').toLowerCase().includes(deptKey.replace('_', ' '))
          );

          const statusText = realDept?.status || (realCard?.status ? 'Online' : 'Online');
          const isOnline = statusText.toUpperCase() === 'ONLINE' || statusText.toUpperCase() === 'ACTIVE';
          const tasksDone = realDept?.active_tasks_count ?? realCard?.tasks_completed ?? realCard?.tasks_completed_today ?? 0;
          const workload = realDept?.workload_level ?? (realCard?.workload_score ? `${realCard.workload_score}%` : 'Optimal');
          const revAttr = realDept?.revenue_attributed_aed ?? realCard?.revenue_generated_aed ?? realCard?.revenue_attributed_aed ?? 0;

          return (
            <div
              key={deptKey}
              onClick={() => onSelectDepartment && onSelectDepartment(cfg.targetTab)}
              className={`relative rounded-2xl bg-gradient-to-br ${cfg.color} border border-[#D4AF37]/20 ${cfg.borderGlow} p-4 transition-all duration-300 cursor-pointer group shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_30px_rgba(212,175,55,0.18)] hover:-translate-y-0.5 flex flex-col justify-between`}
            >
              {/* Card Top: Icon, Name & Status */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl bg-[#06080F]/90 border border-white/[0.08] ${cfg.iconColor} group-hover:scale-110 group-hover:border-[#D4AF37]/40 transition-all duration-300 shadow-[0_0_10px_rgba(0,0,0,0.4)]`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#F9F6EE] group-hover:text-[#F5D77F] transition-colors leading-tight">
                        {cfg.name}
                      </h4>
                      <p className="text-[9.5px] text-[#8C9BAE] font-medium mt-0.5">
                        {cfg.roleTag}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-500'}`} />
                  </div>
                </div>
              </div>

              {/* Card Middle: Tasks & Workload */}
              <div className="mt-3 pt-2.5 border-t border-white/[0.05] grid grid-cols-2 gap-2 text-[10.5px]">
                <div>
                  <span className="text-[#8C9BAE] block text-[9.5px]">Completed</span>
                  <span className="font-semibold text-[#F9F6EE]">{tasksDone} Tasks</span>
                </div>
                <div>
                  <span className="text-[#8C9BAE] block text-[9.5px]">Workload</span>
                  <span className="font-semibold text-cyan-300">{workload}</span>
                </div>
              </div>

              {/* Card Bottom: Revenue Impact */}
              <div className="mt-2 pt-2 border-t border-white/[0.03] flex items-center justify-between text-[10px]">
                <span className="text-[#8C9BAE]">Revenue:</span>
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
