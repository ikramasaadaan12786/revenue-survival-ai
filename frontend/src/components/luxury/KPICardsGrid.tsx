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
      title: 'Verified Revenue',
      value: formatAED(metrics?.totalRevenue),
      trend: metrics?.revenueGrowthRate !== undefined && metrics.revenueGrowthRate !== null
        ? `${metrics.revenueGrowthRate >= 0 ? '↑ +' : '↓ '}${metrics.revenueGrowthRate.toFixed(1)}% pace`
        : 'Live Verified (DB)',
      trendPositive: (metrics?.revenueGrowthRate ?? 0) >= 0,
      icon: Coins,
      iconColor: 'text-[#F5D77F]',
      glowColor: 'rgba(212,175,55,0.25)',
      gradientFrom: 'from-[#D4AF37]/15',
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
      glowColor: 'rgba(245,158,11,0.25)',
      gradientFrom: 'from-amber-500/15',
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
      glowColor: 'rgba(56,189,248,0.25)',
      gradientFrom: 'from-cyan-500/15',
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
      glowColor: 'rgba(52,211,153,0.25)',
      gradientFrom: 'from-emerald-500/15',
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
      glowColor: 'rgba(243,229,171,0.25)',
      gradientFrom: 'from-[#F3E5AB]/15',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`relative rounded-2xl bg-gradient-to-b from-[#0B101D]/90 via-[#070A14]/95 to-[#04060A]/98 border border-[#D4AF37]/30 hover:border-[#D4AF37]/70 p-5 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_12px_40px_rgba(212,175,55,0.2)] hover:-translate-y-1 transition-all duration-300 group overflow-hidden`}
          >
            {/* Ambient corner light glow */}
            <div
              className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity duration-500"
              style={{ backgroundColor: card.glowColor }}
            />

            {/* Top row: Label & Icon */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-[#8C9BAE] uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl bg-[#06080F]/90 border border-white/[0.08] ${card.iconColor} shadow-[0_0_15px_rgba(0,0,0,0.4)] group-hover:scale-110 group-hover:border-[#D4AF37]/40 transition-all duration-300`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            {/* Main Value */}
            <div className="mt-1">
              <div className="font-serif text-xl lg:text-2xl font-bold text-[#F9F6EE] tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#FFF6E5] group-hover:via-[#F5D77F] group-hover:to-[#D4AF37] transition-all duration-300">
                {card.value}
              </div>

              {/* Status Trend Pill */}
              <div className="mt-2 flex items-center gap-1.5 text-[10.5px] font-semibold">
                {card.isStatus ? (
                  <span className={`${card.trendPositive ? 'text-emerald-400' : 'text-[#8C9BAE]'} flex items-center gap-1.5`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${card.trendPositive ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-500'}`} />
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
