'use client';

import React, { useState } from 'react';
import { TrendingUp, BarChart2, ShieldAlert } from 'lucide-react';

interface RevenuePoint {
  date?: string;
  amount?: number;
  revenue?: number;
}

interface RevenueGrowthChartProps {
  totalRevenue?: number;
  revenueGrowthRate?: number;
  historicalRevenues?: RevenuePoint[];
}

export const RevenueGrowthChart: React.FC<RevenueGrowthChartProps> = ({
  totalRevenue = 0,
  revenueGrowthRate,
  historicalRevenues = [],
}) => {
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D' | '1Y'>('30D');

  // Build points based on real data or clean dynamic baseline
  const generatePoints = () => {
    if (historicalRevenues.length > 0) {
      const step = 420 / Math.max(1, historicalRevenues.length - 1);
      const maxVal = Math.max(...historicalRevenues.map((r) => r.amount || r.revenue || 0), totalRevenue || 100);
      return historicalRevenues.map((r, i) => {
        const val = r.amount || r.revenue || 0;
        const normY = 160 - (val / maxVal) * 120;
        return {
          date: r.date || `Day ${i + 1}`,
          value: val,
          x: 30 + i * step,
          y: normY,
        };
      });
    }

    // Default progressive curve reflecting current verified revenue
    const currentRev = totalRevenue || 0;
    return [
      { date: 'Sprint 0', value: 0, x: 30, y: 155 },
      { date: 'Ingestion', value: currentRev * 0.25, x: 130, y: 135 },
      { date: 'Scoring', value: currentRev * 0.5, x: 230, y: 110 },
      { date: 'Offers', value: currentRev * 0.8, x: 330, y: 80 },
      { date: 'Live Close', value: currentRev, x: 440, y: 45 },
    ];
  };

  const points = generatePoints();
  const pathD = points.reduce((acc, pt, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} 170 L ${points[0].x} 170 Z`;

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#0B101D]/90 via-[#06080F]/95 to-[#04060A]/95 border border-[#D4AF37]/25 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl flex flex-col justify-between h-full">
      {/* Header with Title and Range Switcher */}
      <div className="flex items-center justify-between pb-3 border-b border-[#D4AF37]/15">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-bold text-[#F9F6EE] tracking-wide">
              Revenue Growth Trajectory
            </h3>
            <p className="text-[10px] text-[#8C9BAE]">
              Autonomous Verified Pipeline
            </p>
          </div>
        </div>

        {/* Range Tabs */}
        <div className="flex items-center bg-[#06080F] p-0.5 rounded-lg border border-[#D4AF37]/20 text-[10px] font-semibold">
          {(['7D', '30D', '90D', '1Y'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setTimeRange(tab)}
              className={`px-2 py-0.5 rounded-md transition-all duration-200 ${
                timeRange === tab
                  ? 'bg-[#D4AF37] text-[#06080F] font-bold shadow-[0_0_10px_rgba(212,175,55,0.4)]'
                  : 'text-[#8C9BAE] hover:text-[#F9F6EE]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Callout */}
      <div className="mt-3 flex items-baseline gap-3">
        <span className="font-serif text-xl font-bold text-[#F9F6EE]">
          AED {totalRevenue.toLocaleString()}
        </span>
        {revenueGrowthRate !== undefined && revenueGrowthRate !== null ? (
          <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            +{revenueGrowthRate.toFixed(1)}%
          </span>
        ) : (
          <span className="text-[10px] text-[#8C9BAE] font-medium">
            Live Settlement Active
          </span>
        )}
      </div>

      {/* SVG Financial Terminal Line Chart */}
      <div className="relative mt-3 w-full h-44">
        {/* Y Axis Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] text-[#64748B] font-mono pr-2">
          <div className="border-b border-white/[0.04] pb-0.5 flex justify-between">
            <span>Target Max</span>
          </div>
          <div className="border-b border-white/[0.04] pb-0.5 flex justify-between">
            <span>75%</span>
          </div>
          <div className="border-b border-white/[0.04] pb-0.5 flex justify-between">
            <span>50%</span>
          </div>
          <div className="border-b border-white/[0.04] pb-0.5 flex justify-between">
            <span>0</span>
          </div>
        </div>

        {/* SVG Chart Layer */}
        <svg
          viewBox="0 0 480 180"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.0" />
            </linearGradient>
            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Area fill */}
          <path d={areaD} fill="url(#goldGradient)" />

          {/* Golden stroke line */}
          <path
            d={pathD}
            fill="none"
            stroke="#D4AF37"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#goldGlow)"
          />

          {/* Data Points */}
          {points.map((pt, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4.5"
                className="fill-[#F9F6EE] stroke-[#D4AF37] stroke-2 shadow-[0_0_8px_rgba(212,175,55,0.8)]"
              />
              <circle
                cx={pt.x}
                cy={pt.y}
                r="8"
                className="fill-transparent hover:fill-[#D4AF37]/20 transition-all"
              />
            </g>
          ))}
        </svg>

        {/* X Axis Labels */}
        <div className="flex justify-between text-[9px] font-mono text-[#8C9BAE] pt-1.5 px-2">
          {points.map((pt, idx) => (
            <span key={idx}>{pt.date}</span>
          ))}
        </div>
      </div>
    </div>
  );
};
