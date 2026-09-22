'use client';

import React, { useState } from 'react';
import { KPICardsGrid } from './KPICardsGrid';
import { AIGlobe } from './AIGlobe';
import { AIDepartmentsGrid } from './AIDepartmentsGrid';
import { RevenueGrowthChart } from './RevenueGrowthChart';
import { RecentMissionsPanel } from './RecentMissionsPanel';
import { TodayPrioritiesPanel } from './TodayPrioritiesPanel';

interface MainLuxuryDashboardProps {
  onNavigateTab: (tabId: string) => void;
  onRunOperatingCycle?: () => void;
  metrics?: {
    totalRevenue?: number;
    pipelineValue?: number;
    aiEmployeesOnline?: number;
    aiEmployeesTotal?: number;
    activeClients?: number;
    growthScore?: number;
  };
}

export const MainLuxuryDashboard: React.FC<MainLuxuryDashboardProps> = ({
  onNavigateTab,
  onRunOperatingCycle,
  metrics,
}) => {
  const [isRunningCycle, setIsRunningCycle] = useState(false);

  const handleRunCycle = async () => {
    setIsRunningCycle(true);
    if (onRunOperatingCycle) {
      await onRunOperatingCycle();
    } else {
      // Simulate cycle execution
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    setIsRunningCycle(false);
  };

  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto">
      {/* 1. Top KPI Cards Row */}
      <section aria-label="Key Performance Indicators">
        <KPICardsGrid metrics={metrics} />
      </section>

      {/* 2. Middle Row: 3D Holographic Globe & AI Departments Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: 3D Globe with Dubai Sky Atmosphere & Global Leads */}
        <div className="lg:col-span-5 flex">
          <AIGlobe
            leadCount={127}
            onViewOpportunities={() => onNavigateTab('market_radar')}
          />
        </div>

        {/* Right: AI Departments 3x3 Panel */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <AIDepartmentsGrid
            onSelectDepartment={(deptId) => {
              if (deptId === 'sales') onNavigateTab('closing_engine');
              else if (deptId === 'scaling_engine') onNavigateTab('scaling_engine');
              else if (deptId === 'finance' || deptId === 'strategic_ops') onNavigateTab('ceo_brain');
              else onNavigateTab('revenue_empire');
            }}
            onViewAll={() => onNavigateTab('revenue_empire')}
          />
        </div>
      </section>

      {/* 3. Bottom Row: Revenue Growth Chart, Recent Missions, Today's Priorities */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Revenue Analytics Chart */}
        <div className="flex">
          <div className="w-full">
            <RevenueGrowthChart />
          </div>
        </div>

        {/* Recent Missions Panel */}
        <div className="flex">
          <div className="w-full">
            <RecentMissionsPanel
              onViewAll={() => onNavigateTab('missions')}
              onSelectMission={() => onNavigateTab('missions')}
            />
          </div>
        </div>

        {/* Today's Priorities & Run Operating Cycle */}
        <div className="flex">
          <div className="w-full">
            <TodayPrioritiesPanel
              onRunOperatingCycle={handleRunCycle}
              isRunningCycle={isRunningCycle}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
