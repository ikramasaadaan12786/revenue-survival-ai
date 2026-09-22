'use client';

import React, { useState } from 'react';
import { KPICardsGrid } from './KPICardsGrid';
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
  activeMissionId,
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

  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto">
      {/* 1. Top KPI Cards Row (Real DB values) */}
      <section aria-label="Key Performance Indicators">
        <KPICardsGrid metrics={metrics} />
      </section>

      {/* 2. Middle Row: 3D Holographic Globe & Real Opportunity Feed + AI Departments Real-Time Telemetry */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
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

      {/* 3. Bottom Row: Revenue Growth Chart, Real Active Missions Widget, Today's Strategic Priorities */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
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
