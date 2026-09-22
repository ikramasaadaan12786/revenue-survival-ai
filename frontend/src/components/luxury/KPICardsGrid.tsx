'use client';

import React from 'react';
import { Coins, BarChart3, Users2, UserCheck, Target } from 'lucide-react';

interface KPICardsGridProps {
  metrics?: {
    totalRevenue?: number;
    pipelineValue?: number;
    aiEmployeesOnline?: number;
    aiEmployeesTotal?: number;
    activeClients?: number;
    growthScore?: number;
    revenueGrowthRate?: number;
    pipelineGrowthRate?: number;
  };
}

export const KPICardsGrid: React.FC<KPICardsGridProps> = ({ metrics }) => {
  const formatAED = (num?: number) => {
    if (num === undefined || num === null) return 'AED 0';
    return `AED ${Number(num).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  };

  const cards = [
    {
      title: 'Total Revenue',
      value: formatAED(metrics?.totalRevenue),
      trend: metrics?.revenueGrowthRate !== undefined && metrics.revenueGrowthRate !== null
        ? `${metrics.revenueGrowthRate >= 0 ? '↑ +' : '↓ '}${metrics.revenueGrowthRate.toFixed(1)}% pace`
        : 'Live Verified (DB)',
      trendPositive: (metrics?.revenueGrowthRate ?? 0) >= 0,
      icon: Coins,
      iconColor: 'text-[#D4AF37]',
      glowColor: 'rgba(212,175,55,0.15)',
    },
    {
      title: 'Active Pipeline',
      value: formatAED(metrics?.pipelineValue),
      trend: metrics?.pipelineGrowthRate !== undefined && metrics.pipelineGrowthRate !== null
        ? `${metrics.pipelineGrowthRate >= 0 ? '↑ +' : '↓ '}${metrics.pipelineGrowthRate.toFixed(1)}% pipeline`
        : 'Active Deals (CRM)',
      trendPositive: true,
      icon: BarChart3,
      iconColor: 'text-amber-400',
      glowColor: 'rgba(245,158,11,0.15)',
    },
    {
      title: 'AI Employees',
      value: metrics?.aiEmployeesTotal !== undefined && metrics.aiEmployeesTotal !== null
        ? `${metrics.aiEmployeesOnline ?? metrics.aiEmployeesTotal} / ${metrics.aiEmployeesTotal}`
        : '0 / 0',
      trend: (metrics?.aiEmployeesTotal ?? 0) > 0 ? '● Active Swarm' : '○ Standby Pool',
      trendPositive: (metrics?.aiEmployeesTotal ?? 0) > 0,
      isStatus: true,
      icon: Users2,
      iconColor: 'text-cyan-400',
      glowColor: 'rgba(56,189,248,0.15)',
    },
    {
      title: 'Active Clients',
      value: metrics?.activeClients !== undefined && metrics.activeClients !== null
        ? `${metrics.activeClients}`
        : '0',
      trend: (metrics?.activeClients ?? 0) > 0 ? `${metrics?.activeClients} Retainer Accounts` : 'No Clients Onboarded',
      trendPositive: (metrics?.activeClients ?? 0) > 0,
      icon: UserCheck,
      iconColor: 'text-emerald-400',
      glowColor: 'rgba(52,211,153,0.15)',
    },
    {
      title: 'Growth Score',
      value: metrics?.growthScore !== undefined && metrics.growthScore !== null
        ? `${metrics.growthScore} / 100`
        : '0 / 100',
      trend: metrics?.growthScore !== undefined && metrics.growthScore > 0 ? 'Growth Loop Synced' : 'No Data Available',
      trendPositive: (metrics?.growthScore ?? 0) > 50,
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
                  <span className={`${card.trendPositive ? 'text-emerald-400' : 'text-[#8C9BAE]'} flex items-center gap-1`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${card.trendPositive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                    {card.trend}
                  </span>
                ) : (
                  <span className={card.trendPositive ? 'text-emerald-400' : 'text-[#8C9BAE]'}>
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
