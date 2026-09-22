'use client';

import React from 'react';
import { Coins, BarChart3, Users2, UserCheck, Target, TrendingUp } from 'lucide-react';

interface KPICardsGridProps {
  metrics?: {
    totalRevenue?: number;
    pipelineValue?: number;
    aiEmployeesOnline?: number;
    aiEmployeesTotal?: number;
    activeClients?: number;
    growthScore?: number;
  };
}

export const KPICardsGrid: React.FC<KPICardsGridProps> = ({ metrics }) => {
  const cards = [
    {
      title: 'Total Revenue',
      value: metrics?.totalRevenue ? `AED ${metrics.totalRevenue.toLocaleString()}` : 'AED 482,500',
      trend: '↑ +12.5% this month',
      trendPositive: true,
      icon: Coins,
      iconColor: 'text-[#D4AF37]',
      glowColor: 'rgba(212,175,55,0.15)',
    },
    {
      title: 'Active Pipeline',
      value: metrics?.pipelineValue ? `AED ${metrics.pipelineValue.toLocaleString()}` : 'AED 1,240,000',
      trend: '↑ +18.2% this month',
      trendPositive: true,
      icon: BarChart3,
      iconColor: 'text-amber-400',
      glowColor: 'rgba(245,158,11,0.15)',
    },
    {
      title: 'AI Employees',
      value: metrics?.aiEmployeesTotal ? `${metrics.aiEmployeesOnline || metrics.aiEmployeesTotal} / ${metrics.aiEmployeesTotal}` : '42 / 42',
      trend: '● 100% Online',
      trendPositive: true,
      isStatus: true,
      icon: Users2,
      iconColor: 'text-cyan-400',
      glowColor: 'rgba(56,189,248,0.15)',
    },
    {
      title: 'Active Clients',
      value: metrics?.activeClients ? `${metrics.activeClients}` : '28',
      trend: '↑ +4 new this month',
      trendPositive: true,
      icon: UserCheck,
      iconColor: 'text-emerald-400',
      glowColor: 'rgba(52,211,153,0.15)',
    },
    {
      title: 'Growth Score',
      value: metrics?.growthScore ? `${metrics.growthScore} / 100` : '92.4 / 100',
      trend: '↑ +6.8% this week',
      trendPositive: true,
      icon: Target,
      iconColor: 'text-[#F3E5AB]',
      glowColor: 'rgba(243,229,171,0.15)',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 w-full">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="relative rounded-xl bg-gradient-to-b from-[#0B101D]/90 to-[#04060A]/95 border border-[#D4AF37]/25 p-4 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:border-[#D4AF37]/60 hover:shadow-[0_4px_25px_rgba(212,175,55,0.15)] transition-all duration-300 group overflow-hidden"
          >
            {/* Ambient corner light */}
            <div
              className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-xl pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity"
              style={{ backgroundColor: card.glowColor }}
            />

            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-[#8C9BAE] uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05] ${card.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-1">
              <div className="font-serif text-lg lg:text-xl font-bold text-[#F9F6EE] tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#FFFFFF] group-hover:to-[#D4AF37] transition-all">
                {card.value}
              </div>

              <div className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold">
                {card.isStatus ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {card.trend}
                  </span>
                ) : (
                  <span className="text-emerald-400">
                    {card.trend}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
