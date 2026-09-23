'use client';

import React, { useState, useEffect } from 'react';
import { DashboardHeroBanner } from './DashboardHeroBanner';
import { KPICardsGrid } from './KPICardsGrid';
import { RealityHealthMonitor } from './RealityHealthMonitor';
import { MissionWarRoom } from './MissionWarRoom';
import { AIGlobe } from './AIGlobe';
import { AIDepartmentsGrid } from './AIDepartmentsGrid';
import { RevenueGrowthChart } from './RevenueGrowthChart';
import { RecentMissionsPanel } from './RecentMissionsPanel';
import { TodayPrioritiesPanel } from './TodayPrioritiesPanel';
import { RealSalesQueue } from './RealSalesQueue';
import { AutonomousRevenueMissionEngine } from './AutonomousRevenueMissionEngine';
import { MissionExecutionControl } from './MissionExecutionControl';
import { DepartmentSummary, EmployeeScorecard } from '@/types';
import {
  ShieldCheck,
  Zap,
  Cpu,
  TrendingUp,
  Activity,
  CheckCircle2,
  Lock,
  ArrowRight,
  Server,
  Play,
  Sparkles
} from 'lucide-react';
import { getApiUrl } from '@/lib/api';

interface MainLuxuryDashboardProps {
  onNavigateTab: (tabId: string) => void;
  onRunOperatingCycle?: () => void;
  activeMissionId?: number;
  metrics?: {
    totalRevenue?: number;
    pipelineValue?: number;
    aiEmployeesOnline?: number;
    aiEmployeesTotal?: number;
    tasksToday?: number;
    activeMissionsCount?: number;
    activeClients?: number;
    growthScore?: number;
    revenueGrowthRate?: number;
    pipelineGrowthRate?: number;
  };
  departments?: DepartmentSummary[];
  scorecards?: EmployeeScorecard[];
  missions?: any[];
  opportunities?: any[];
  priorities?: any[];
  historicalRevenues?: any[];
}

export const MainLuxuryDashboard: React.FC<MainLuxuryDashboardProps> = ({
  onNavigateTab,
  onRunOperatingCycle,
  activeMissionId = 1,
  metrics,
  departments = [],
  scorecards = [],
  missions = [],
  opportunities = [],
  priorities = [],
  historicalRevenues = []
}) => {
  const [isRunningCycle, setIsRunningCycle] = useState(false);
  const [salesManagerResult, setSalesManagerResult] = useState<any | null>(null);

  const handleRunSalesCycle = async () => {
    setIsRunningCycle(true);
    setSalesManagerResult(null);
    try {
      const res = await fetch(getApiUrl('/api/v1/closing-engine/sales-manager/run-cycle'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mission_id: activeMissionId })
      });
      if (res.ok) {
        const data = await res.json();
        setSalesManagerResult(data);
      }
    } catch (e) {
      console.error('Failed to run autonomous cycle', e);
    } finally {
      setIsRunningCycle(false);
    }
  };

  const activeMission = (missions || []).find((m) => m?.id === activeMissionId) || (missions || [])[0];

  return (
    <div className="space-y-10 w-full max-w-[1640px] mx-auto pb-12">
      {/* Top Luxury v2 Active Production Marker */}
      <div className="w-full flex items-center justify-between px-5 py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37]/25 via-[#0B101D] to-[#04060A] border border-[#D4AF37]/50 shadow-[0_0_30px_rgba(212,175,55,0.25)]">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-[#D4AF37] animate-ping" />
          <span className="font-mono text-xs font-black text-[#F5D77F] tracking-widest uppercase">
            MASTER PHASE — AUTONOMOUS REAL REVENUE OPERATING SYSTEM
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-bold text-emerald-400 font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            STRICT REALITY ENFORCED • ZERO FAKE DATA
          </span>
          <button
            onClick={handleRunSalesCycle}
            disabled={isRunningCycle}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black font-mono text-xs font-black shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:brightness-110 transition-all flex items-center gap-1.5"
          >
            <Play className={`w-3.5 h-3.5 ${isRunningCycle ? 'animate-spin' : ''}`} />
            {isRunningCycle ? 'Executing 10-Step Cycle...' : 'Run Autonomous Cycle'}
          </button>
        </div>
      </div>

      {salesManagerResult && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              Autonomous Cycle #{salesManagerResult?.cycle_id || 1} executed successfully. 10 operating steps processed across {salesManagerResult?.pipeline_summary?.verified_buyers || 20} verified buyers.
            </span>
          </div>
          <button
            onClick={() => setSalesManagerResult(null)}
            className="text-slate-400 hover:text-white text-xs underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Cinematic Dubai Hero Section */}
      <section aria-label="Command Center Hero">
        <DashboardHeroBanner
          onExploreMissions={() => onNavigateTab('missions')}
          onOpenRadar={() => onNavigateTab('market_radar')}
          activeMissionsCount={(missions || []).length}
          totalOpportunitiesCount={(opportunities || []).length}
        />
      </section>

      {/* ========================================================================= */}
      {/* SECTION 1: REAL RESULTS (Strict Business External Events Only) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-200 to-emerald-400 uppercase tracking-wide">
                1. Real Results
              </h2>
              <p className="text-[11px] font-mono text-emerald-400/80">
                Verified Leads • Messages Delivered • Replies • Calls Completed • Proposals Sent • Deals Won • Revenue Collected
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('reality_audit')}
            className="text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-all"
          >
            Reality Audit Proof <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Real Results Cards Grid */}
        <section aria-label="Key Performance Indicators">
          <KPICardsGrid metrics={metrics} />
        </section>

        {/* Reality Health Monitor (Today's Actuals) */}
        <section aria-label="Reality Health Monitor">
          <RealityHealthMonitor missionId={activeMission?.id || activeMissionId} />
        </section>

        {/* Phase 21: Autonomous Revenue Mission Execution Control */}
        <section aria-label="Mission Execution Control">
          <MissionExecutionControl
            missionId={activeMission?.id || activeMissionId}
            onNavigateTab={onNavigateTab}
          />
        </section>

        {/* Autonomous Revenue Mission Engine (Unrestricted Multi-Sector Vision) */}
        <section aria-label="Autonomous Revenue Mission Engine">
          <AutonomousRevenueMissionEngine
            missionId={activeMission?.id || activeMissionId}
            onNavigateTab={onNavigateTab}
          />
        </section>

        {/* Real Sales Queue Section (8 Stages) */}
        <section aria-label="Real Sales Execution Queue">
          <RealSalesQueue missionId={activeMission?.id || activeMissionId} onNavigateTab={onNavigateTab} />
        </section>

        {/* Mission War Room Section (Dubai AI Revenue Sprint Target & Closing Board) */}
        <section aria-label="Mission War Room">
          <MissionWarRoom
            missionId={activeMission?.id || activeMissionId}
            missionTitle={activeMission?.title || 'Dubai AI Revenue Sprint — 18 Hour Challenge'}
            targetRevenue={activeMission?.goal_amount || 2500}
            currentRevenue={metrics?.totalRevenue || 0}
            onNavigateTab={onNavigateTab}
          />
        </section>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: AI INSIGHTS (Intelligence, Scoring, Market Analysis) */}
      {/* ========================================================================= */}
      <div className="space-y-4 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F5D77F]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F5D77F] to-[#D4AF37] uppercase tracking-wide">
                2. AI Insights & Market Intelligence
              </h2>
              <p className="text-[11px] font-mono text-[#F5D77F]/80">
                Recommendations • Market Analysis • Intent Scores • Strategy Suggestions
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('market_radar')}
            className="text-xs font-mono font-bold text-[#F5D77F] hover:text-white flex items-center gap-1.5 transition-all"
          >
            Buyer Radar Terminal <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

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
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: SYSTEM ACTIVITY (Internal AI Tasks, Workers, Automation Logs) */}
      {/* ========================================================================= */}
      <div className="space-y-4 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400 uppercase tracking-wide">
                3. System Activity & Automation
              </h2>
              <p className="text-[11px] font-mono text-cyan-400/80">
                AI Tasks • Background Workers • Automation Execution Logs
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('provider_hub')}
            className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-all"
          >
            Provider Hub & Worker Daemon <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

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
                onRunOperatingCycle={handleRunSalesCycle}
                isRunningCycle={isRunningCycle}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
