'use client';

import React, { useState } from 'react';
import { DashboardHeroBanner } from './DashboardHeroBanner';
import { KPICardsGrid } from './KPICardsGrid';
import { MissionWarRoom } from './MissionWarRoom';
import { AIGlobe } from './AIGlobe';
import { AIDepartmentsGrid } from './AIDepartmentsGrid';
import { RevenueGrowthChart } from './RevenueGrowthChart';
import { RecentMissionsPanel } from './RecentMissionsPanel';
import { TodayPrioritiesPanel } from './TodayPrioritiesPanel';
import { DepartmentSummary, EmployeeScorecard } from '@/types';

interface MainLuxuryDashboardProps {
  onNavigateTab: (tabId: string) => void;
  onRunOperatingCycle?: () => void;
  activeMissionId?: number;
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
  missions?: any[];
  departments?: DepartmentSummary[];
  scorecards?: EmployeeScorecard[];
  opportunities?: any[];
  priorities?: any[];
  historicalRevenues?: any[];
}

export const MainLuxuryDashboard: React.FC<MainLuxuryDashboardProps> = ({
  onNavigateTab,
  onRunOperatingCycle,
  activeMissionId = 1006,
  metrics,
  missions = [],
  departments = [],
  scorecards = [],
  opportunities = [],
  priorities = [],
  historicalRevenues = [],
}) => {
  const [isRunningCycle, setIsRunningCycle] = useState(false);

  const handleRunCycle = async () => {
    setIsRunningCycle(true);
    if (onRunOperatingCycle) {
      await onRunOperatingCycle();
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    setIsRunningCycle(false);
  };

  const activeMission = missions.find((m) => m.id === activeMissionId) || missions[0];

  return (
    <div className="space-y-8 w-full max-w-[1640px] mx-auto">
      {/* Top Luxury v2 Active Production Marker */}
      <div className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37]/25 via-[#0B101D] to-[#04060A] border border-[#D4AF37]/50 shadow-[0_0_25px_rgba(212,175,55,0.25)]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-ping" />
          <span className="font-mono text-xs font-black text-[#F5D77F] tracking-widest uppercase">
            LUXURY V2 ACTIVE • SOVEREIGN DUBAI AI ENTERPRISE COMMAND CENTER
          </span>
        </div>
        <div className="text-[10px] font-bold text-emerald-400 font-mono">
          100% REAL PRODUCTION TELEMETRY
        </div>
      </div>

      {/* 1. Cinematic Dubai Hero Section */}
      <section aria-label="Command Center Hero">
        <DashboardHeroBanner
          onExploreMissions={() => onNavigateTab('missions')}
          onOpenRadar={() => onNavigateTab('market_radar')}
          activeMissionsCount={missions.length}
          totalOpportunitiesCount={opportunities.length}
        />
      </section>

      {/* 2. Top KPI Cards Row (Floating 3D Gold Glass) */}
      <section aria-label="Key Performance Indicators">
        <KPICardsGrid metrics={metrics} />
      </section>

      {/* 3. Mission War Room Section (Phase 13 Closing Optimization) */}
      <section aria-label="Mission War Room">
        <MissionWarRoom
          missionId={activeMission?.id || activeMissionId}
          missionTitle={activeMission?.title || 'Dubai AI Revenue Sprint — 18 Hour Challenge'}
          targetRevenue={activeMission?.goal_amount || 2500}
          currentRevenue={metrics?.totalRevenue || 0}
          onNavigateTab={onNavigateTab}
        />
      </section>

      {/* 4. Middle Row: 3D Holographic Globe & Real Opportunity Feed + AI Departments 3x3 Matrix */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left: 3D Globe with Dubai Sky Atmosphere & Real Opportunity Feed */}
        <div className="lg:col-span-5 flex">
          <AIGlobe
            leadCount={opportunities.length}
            opportunities={opportunities}
            onViewOpportunities={() => onNavigateTab('market_radar')}
          />
        </div>

        {/* Right: AI Departments 3x3 Panel */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <AIDepartmentsGrid
            departmentsData={departments}
            scorecardsData={scorecards}
            onSelectDepartment={(targetTab) => onNavigateTab(targetTab)}
            onViewAll={() => onNavigateTab('revenue_empire')}
          />
        </div>
      </section>

      {/* 4. Bottom Row: Revenue Growth Financial Terminal, Active Missions Widget, Today's Strategic Priorities */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {/* Revenue Analytics Chart */}
        <div className="flex">
          <div className="w-full">
            <RevenueGrowthChart
              totalRevenue={metrics?.totalRevenue || 0}
              revenueGrowthRate={metrics?.revenueGrowthRate}
              historicalRevenues={historicalRevenues}
            />
          </div>
        </div>

        {/* Real Active Missions Panel */}
        <div className="flex">
          <div className="w-full">
            <RecentMissionsPanel
              missions={missions}
              activeMissionId={activeMissionId}
              onViewAll={() => onNavigateTab('missions')}
              onSelectMission={(mId) => onNavigateTab('missions')}
            />
          </div>
        </div>

        {/* Today's Priorities & Run Operating Cycle */}
        <div className="flex">
          <div className="w-full">
            <TodayPrioritiesPanel
              priorities={priorities}
              onRunOperatingCycle={handleRunCycle}
              isRunningCycle={isRunningCycle}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
