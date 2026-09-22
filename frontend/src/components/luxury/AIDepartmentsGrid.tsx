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

interface AIDepartmentsGridProps {
  onSelectDepartment?: (deptId: string) => void;
  onViewAll?: () => void;
}

export const AIDepartmentsGrid: React.FC<AIDepartmentsGridProps> = ({
  onSelectDepartment,
  onViewAll,
}) => {
  const departments = [
    {
      id: 'sales',
      name: 'Sales',
      icon: TrendingUp,
      status: 'Online',
      countLabel: '6 Agents',
      color: 'from-amber-500/20 to-amber-700/10',
      borderGlow: 'hover:border-amber-500/50',
      iconColor: 'text-[#D4AF37]',
    },
    {
      id: 'marketing',
      name: 'Marketing',
      icon: Megaphone,
      status: 'Online',
      countLabel: '6 Agents',
      color: 'from-purple-500/20 to-purple-700/10',
      borderGlow: 'hover:border-purple-500/50',
      iconColor: 'text-purple-400',
    },
    {
      id: 'lead_gen',
      name: 'Lead Generation',
      icon: Radar,
      status: 'Online',
      countLabel: '6 Agents',
      color: 'from-cyan-500/20 to-cyan-700/10',
      borderGlow: 'hover:border-cyan-500/50',
      iconColor: 'text-cyan-400',
    },
    {
      id: 'product',
      name: 'Product',
      icon: Box,
      status: 'Online',
      countLabel: '6 Agents',
      color: 'from-yellow-500/20 to-yellow-700/10',
      borderGlow: 'hover:border-yellow-500/50',
      iconColor: 'text-yellow-400',
    },
    {
      id: 'finance',
      name: 'Finance',
      icon: Coins,
      status: 'Online',
      countLabel: '6 Agents',
      color: 'from-amber-600/20 to-amber-800/10',
      borderGlow: 'hover:border-[#D4AF37]/50',
      iconColor: 'text-[#D4AF37]',
    },
    {
      id: 'customer_success',
      name: 'Customer Success',
      icon: Smile,
      status: 'Online',
      countLabel: '6 Agents',
      color: 'from-pink-500/20 to-pink-700/10',
      borderGlow: 'hover:border-pink-500/50',
      iconColor: 'text-pink-400',
    },
    {
      id: 'scaling_engine',
      name: 'Scaling Engine',
      icon: Rocket,
      status: 'Online',
      countLabel: '9 Modules',
      color: 'from-emerald-500/20 to-emerald-700/10',
      borderGlow: 'hover:border-emerald-500/50',
      iconColor: 'text-emerald-400',
    },
    {
      id: 'content_factory',
      name: 'Content Factory',
      icon: Video,
      status: 'Online',
      countLabel: '4 Agents',
      color: 'from-amber-400/20 to-amber-600/10',
      borderGlow: 'hover:border-amber-400/50',
      iconColor: 'text-amber-300',
    },
    {
      id: 'strategic_ops',
      name: 'Strategic Ops',
      icon: Layers,
      status: 'Online',
      countLabel: '3 Agents',
      color: 'from-orange-500/20 to-orange-700/10',
      borderGlow: 'hover:border-orange-500/50',
      iconColor: 'text-orange-400',
    },
  ];

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
              AI Departments
            </h3>
          </div>
        </div>

        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-[#D4AF37] hover:text-[#F3E5AB] flex items-center gap-1 transition-colors group"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 3x3 Department Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {departments.map((dept) => {
          const Icon = dept.icon;
          return (
            <div
              key={dept.id}
              onClick={() => onSelectDepartment && onSelectDepartment(dept.id)}
              className={`relative rounded-xl bg-[#080C16]/80 border border-[#D4AF37]/15 p-3.5 hover:bg-gradient-to-br ${dept.color} ${dept.borderGlow} transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)]`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg bg-[#06080F]/80 border border-[#D4AF37]/20 ${dept.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#F9F6EE] group-hover:text-[#F3E5AB] transition-colors leading-tight">
                      {dept.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] text-emerald-400 font-medium">
                        {dept.status}
                      </span>
                    </div>
                  </div>
                </div>

                <ArrowRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
              </div>

              <div className="mt-3 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px]">
                <span className="text-[#8C9BAE] font-medium">{dept.countLabel}</span>
                <span className="text-[10px] font-semibold text-[#D4AF37]/80 group-hover:text-[#D4AF37] tracking-wider uppercase">
                  Active
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
