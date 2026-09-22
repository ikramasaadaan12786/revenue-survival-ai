"use client";

import React, { useState, useEffect } from "react";
import { LuxurySidebar } from "@/components/luxury/LuxurySidebar";
import { LuxuryHeader } from "@/components/luxury/LuxuryHeader";
import { MainLuxuryDashboard } from "@/components/luxury/MainLuxuryDashboard";
import { LuxuryFooter } from "@/components/luxury/LuxuryFooter";

import SurvivalHUD from "@/components/SurvivalHUD";
import MissionPlannerView from "@/components/MissionPlannerView";
import OpportunityRadarView from "@/components/OpportunityRadarView";
import OfferStudioView from "@/components/OfferStudioView";
import LeadKanbanView from "@/components/LeadKanbanView";
import SafetyApprovalQueueView from "@/components/SafetyApprovalQueueView";
import DubaiRealEstateView from "@/components/DubaiRealEstateView";
import AnalyticsMemoryView from "@/components/AnalyticsMemoryView";
import MultiIndustryStrategyBrainView from "@/components/MultiIndustryStrategyBrainView";
import RevenueIntelligenceCenter from "@/components/RevenueIntelligenceCenter";
import AutonomousClosingCenter from "@/components/AutonomousClosingCenter";
import AICEOCommandCenter from "@/components/AICEOCommandCenter";
import { RevenueControlRoom } from "@/components/RevenueControlRoom";
import { GrowthCommandCenter } from "@/components/GrowthCommandCenter";
import { AICompanyCommandCenter } from "@/components/AICompanyCommandCenter";
import { AIScalingCommandCenter } from "@/components/AIScalingCommandCenter";
import { AIEnterpriseNetworkCenter } from "@/components/AIEnterpriseNetworkCenter";
import NewMissionModal from "@/components/NewMissionModal";
import { DashboardSummary } from "@/types";
import { api } from "@/lib/api";
import { Loader2, Settings, ShieldCheck, Sparkles, Sliders, CheckCircle } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [missionId, setMissionId] = useState<number>(1);
  const [missionsList, setMissionsList] = useState<any[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRunningStep, setIsRunningStep] = useState(false);
  const [isNewMissionOpen, setIsNewMissionOpen] = useState(false);

  const fetchSummary = async (targetId?: number) => {
    try {
      setLoading(true);
      // Fetch list of all missions
      const allMissions = await api.getMissions().catch(() => []);
      setMissionsList(allMissions || []);

      let currentId = targetId || missionId;
      if (allMissions && allMissions.length > 0) {
        const found = targetId
          ? allMissions.find((m: any) => m.id === targetId)
          : allMissions.find((m: any) => m.id === currentId);
        currentId = found ? found.id : allMissions[0].id;
        setMissionId(currentId);
      } else {
        // Automatically create initial mission if none exists yet
        try {
          const newMission = await api.createMission({
            title: "AI Agent Sales Sprint",
            goal_amount: 10000,
            currency: "AED",
            deadline_hours: 72,
            budget: 0,
            industry: "AI Agents & Automation",
            industries: ["AI Agents & Automation"],
          });
          if (newMission && newMission.id) {
            currentId = newMission.id;
            setMissionId(currentId);
            setMissionsList([newMission]);
          }
        } catch (seedErr) {
          console.warn("Could not auto-seed mission, trying direct dashboard fetch", seedErr);
        }
      }

      const data = await api.getMissionDashboard(currentId).catch(() => null);
      if (data) {
        setSummary(data);
        if (data.mission && data.mission.id) {
          setMissionId(data.mission.id);
        }
      }
    } catch (err) {
      console.error("Failed fetching mission dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleSwitchMission = (newId: number) => {
    setMissionId(newId);
    fetchSummary(newId);
  };

  const handleRunNextStep = async () => {
    try {
      setIsRunningStep(true);
      await api.runNextStep(missionId);
      await fetchSummary(missionId);
    } catch (err) {
      console.error("Failed running next step", err);
    } finally {
      setIsRunningStep(false);
    }
  };

  const handleEvaluatePivot = async () => {
    try {
      setIsRunningStep(true);
      await api.evaluatePivot(missionId);
      await fetchSummary(missionId);
    } catch (err) {
      console.error("Failed evaluating pivot", err);
    } finally {
      setIsRunningStep(false);
    }
  };

  const handleMissionCreated = (newId: number) => {
    setMissionId(newId);
    fetchSummary(newId);
    setActiveTab("dashboard");
  };

  // Map backend stats to metrics if available
  const dashboardMetrics = {
    totalRevenue: summary?.mission?.revenue_generated || 482500,
    pipelineValue: summary?.mission?.pipeline_value || 1240000,
    aiEmployeesOnline: 42,
    aiEmployeesTotal: 42,
    activeClients: 28,
    growthScore: 92.4,
  };

  return (
    <div className="min-h-screen flex bg-[#04060A] text-[#F9F6EE] font-sans antialiased selection:bg-[#D4AF37]/30 selection:text-[#F9F6EE]">
      {/* Luxury Left Sidebar */}
      <LuxurySidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingApprovalsCount={summary?.pending_approvals || 0}
      />

      {/* Main Command Viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
        {/* Luxury Top Header */}
        <LuxuryHeader
          unreadNotificationsCount={3}
          onOpenNotifications={() => setActiveTab("approvals")}
          onProfileClick={() => setActiveTab("settings")}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 lg:p-8 space-y-8">
          {loading && !summary ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
              <Loader2 className="w-9 h-9 text-[#D4AF37] animate-spin" />
              <p className="font-serif text-sm tracking-widest text-[#8C9BAE] uppercase">
                Initializing Dubai Sovereign AI Command Center...
              </p>
            </div>
          ) : (
            <>
              {/* 1. Dubai Luxury Sovereign Dashboard (Default) */}
              {(activeTab === "dashboard" || activeTab === "command") && (
                <MainLuxuryDashboard
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onRunOperatingCycle={handleRunNextStep}
                  metrics={dashboardMetrics}
                />
              )}

              {/* 2. Autonomous CEO Brain v4 */}
              {(activeTab === "ceo_brain" || activeTab === "ceo-brain") && (
                <AICEOCommandCenter
                  missionId={missionId}
                  summary={summary}
                  onRefresh={() => fetchSummary(missionId)}
                />
              )}

              {/* 3. Autonomous Revenue Empire v7 */}
              {(activeTab === "revenue_empire" || activeTab === "revenue-empire") && (
                <AICompanyCommandCenter activeMissionId={missionId} />
              )}

              {/* 4. Autonomous Scaling Engine v8 */}
              {(activeTab === "scaling_engine" || activeTab === "scaling-engine") && (
                <AIScalingCommandCenter activeMissionId={missionId} />
              )}

              {/* 5. Autonomous AI Enterprise Network v9 */}
              {(activeTab === "enterprise_network" || activeTab === "enterprise-network") && (
                <AIEnterpriseNetworkCenter />
              )}

              {/* 6. Growth Command Center / Investor Hub */}
              {(activeTab === "growth_loop" || activeTab === "growth-loop") && (
                <GrowthCommandCenter
                  missionId={missionId}
                  onRefreshAll={() => fetchSummary(missionId)}
                />
              )}

              {/* 7. Revenue Control Room v5 */}
              {activeTab === "control-room" && (
                <RevenueControlRoom
                  activeMissionId={missionId}
                  onRefreshAll={() => fetchSummary(missionId)}
                />
              )}

              {/* 8. Missions & Multi-Mission Planning */}
              {activeTab === "missions" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-[#F9F6EE]">
                        Active Missions Operation
                      </h2>
                      <p className="text-xs text-[#8C9BAE] mt-1">
                        Manage strategic campaigns, resource allocations, and real-time execution.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsNewMissionOpen(true)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-[#06080F] bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] hover:opacity-90 transition-opacity shadow-[0_2px_15px_rgba(212,175,55,0.3)]"
                    >
                      + Create New Mission
                    </button>
                  </div>
                  <SurvivalHUD
                    summary={summary}
                    onRunNextStep={handleRunNextStep}
                    onEvaluatePivot={handleEvaluatePivot}
                    isRunningStep={isRunningStep}
                    onRefreshSummary={() => fetchSummary(missionId)}
                    onSwitchMission={handleSwitchMission}
                    allMissions={missionsList}
                  />
                  <MissionPlannerView
                    missionId={missionId}
                    onRefreshSummary={() => fetchSummary(missionId)}
                  />
                </div>
              )}

              {/* 9. CRM & Lead Kanban */}
              {(activeTab === "crm" || activeTab === "leads") && (
                <LeadKanbanView
                  missionId={missionId}
                  onRefreshSummary={() => fetchSummary(missionId)}
                />
              )}

              {/* 10. Market Radar & Intelligence */}
              {(activeTab === "market_radar" || activeTab === "opportunities") && (
                <OpportunityRadarView
                  missionId={missionId}
                  onRefreshSummary={() => fetchSummary(missionId)}
                />
              )}

              {/* 11. Autonomous Closing Engine */}
              {activeTab === "closing_engine" && (
                <AutonomousClosingCenter
                  missionId={missionId}
                  onRefresh={() => fetchSummary(missionId)}
                />
              )}

              {/* 12. Safety Approvals */}
              {activeTab === "approvals" && (
                <SafetyApprovalQueueView
                  missionId={missionId}
                  onRefreshSummary={() => fetchSummary(missionId)}
                />
              )}

              {/* 13. Dubai Real Estate Mode */}
              {activeTab === "real-estate" && (
                <DubaiRealEstateView
                  missionId={missionId}
                  onRefreshSummary={() => fetchSummary(missionId)}
                />
              )}

              {/* 14. Revenue Intelligence */}
              {activeTab === "intelligence" && (
                <RevenueIntelligenceCenter missionId={missionId} />
              )}

              {/* 15. Offer Studio */}
              {activeTab === "offers" && (
                <OfferStudioView
                  missionId={missionId}
                  onRefreshSummary={() => fetchSummary(missionId)}
                />
              )}

              {/* 16. Reports & Memory Analytics */}
              {activeTab === "analytics" && (
                <AnalyticsMemoryView
                  missionId={missionId}
                  onRefreshSummary={() => fetchSummary(missionId)}
                />
              )}

              {/* 17. Multi-Industry Strategy Brain */}
              {activeTab === "strategy-brain" && (
                <MultiIndustryStrategyBrainView
                  missionId={missionId}
                  onRefreshSummary={() => fetchSummary(missionId)}
                />
              )}

              {/* 18. Executive Settings & Security Panel */}
              {activeTab === "settings" && (
                <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-b from-[#0B101D]/90 to-[#04060A]/95 border border-[#D4AF37]/30 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl">
                  <div className="flex items-center gap-3 pb-5 border-b border-[#D4AF37]/15">
                    <div className="p-2.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
                      <Settings className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="font-serif text-xl font-bold text-[#F9F6EE]">
                        Executive Empire Settings
                      </h2>
                      <p className="text-xs text-[#8C9BAE]">
                        Configure sovereign AI agent permissions, API endpoints, and Dubai financial rules.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-6 text-xs">
                    <div className="p-4 rounded-xl bg-[#06080F] border border-white/[0.04] flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-[#F9F6EE]">Autonomous Operating Frequency</h4>
                        <p className="text-[#8C9BAE] text-[11px] mt-0.5">Continuous 24/7 background AI swarm decision cycle</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/30">
                        Enabled
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-[#06080F] border border-white/[0.04] flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-[#F9F6EE]">Human-in-the-Loop Safety Vault</h4>
                        <p className="text-[#8C9BAE] text-[11px] mt-0.5">Require CEO cryptographic sign-off for deals &gt; 50,000 AED</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] font-semibold border border-[#D4AF37]/30">
                        Active Policy
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-[#06080F] border border-white/[0.04] flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-[#F9F6EE]">Multi-Region Cloud Redundancy</h4>
                        <p className="text-[#8C9BAE] text-[11px] mt-0.5">Connected Hubs: Dubai DIFC, London, New York, Singapore</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/30">
                        Synchronized
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>

        {/* Luxury Global Footer */}
        <LuxuryFooter />
      </div>

      {/* Modal for creating missions */}
      <NewMissionModal
        isOpen={isNewMissionOpen}
        onClose={() => setIsNewMissionOpen(false)}
        onMissionCreated={handleMissionCreated}
      />
    </div>
  );
}
