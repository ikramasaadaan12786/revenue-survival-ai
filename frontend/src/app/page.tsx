"use client";

import React, { useState, useEffect } from "react";
import NavigationHeader from "@/components/NavigationHeader";
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
import NewMissionModal from "@/components/NewMissionModal";
import { DashboardSummary } from "@/types";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("command");
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
        const found = targetId ? allMissions.find((m: any) => m.id === targetId) : allMissions.find((m: any) => m.id === currentId);
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
            industries: ["AI Agents & Automation"]
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
    setActiveTab("command");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#060911] text-slate-100">
      {/* Navigation Header */}
      <NavigationHeader
        summary={summary}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewMission={() => setIsNewMissionOpen(true)}
        onRunNextStep={handleRunNextStep}
        isRunningStep={isRunningStep}
        missionsList={missionsList}
        currentMissionId={missionId}
        onSwitchMission={handleSwitchMission}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {loading && !summary ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-xs font-mono text-slate-400">Connecting to AI Swarm Engine...</p>
          </div>
        ) : (
          <>
            {/* Command Center View (Default) */}
            {activeTab === "command" && (
              <div className="space-y-8">
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

            {/* Autonomous Revenue Empire v7: AI Company Operating System */}
            {activeTab === "revenue-empire" && (
              <AICompanyCommandCenter
                activeMissionId={missionId}
              />
            )}

            {/* Autonomous Business Operator v5: Revenue Control Room */}
            {activeTab === "control-room" && (
              <RevenueControlRoom
                activeMissionId={missionId}
                onRefreshAll={() => fetchSummary(missionId)}
              />
            )}

            {/* Autonomous Growth Loop v6 Command Center */}
            {activeTab === "growth-loop" && (
              <GrowthCommandCenter
                missionId={missionId}
                onRefreshAll={() => fetchSummary(missionId)}
              />
            )}

            {/* Autonomous CEO Brain v4 Command Center View */}
            {activeTab === "ceo-brain" && (
              <AICEOCommandCenter
                missionId={missionId}
                summary={summary}
                onRefresh={() => fetchSummary(missionId)}
              />
            )}

            {/* Autonomous Revenue Closing Engine View */}
            {activeTab === "closing-engine" && (
              <AutonomousClosingCenter
                missionId={missionId}
                onRefresh={() => fetchSummary(missionId)}
              />
            )}

            {/* Autonomous Multi-Industry Strategy Brain View */}
            {activeTab === "strategy-brain" && (
              <MultiIndustryStrategyBrainView
                missionId={missionId}
                onRefreshSummary={() => fetchSummary(missionId)}
              />
            )}

            {/* Tactical 4-Day Plan View */}
            {activeTab === "planner" && (
              <MissionPlannerView
                missionId={missionId}
                onRefreshSummary={() => fetchSummary(missionId)}
              />
            )}

            {/* Market Opportunity Radar */}
            {activeTab === "opportunities" && (
              <OpportunityRadarView
                missionId={missionId}
                onRefreshSummary={() => fetchSummary(missionId)}
              />
            )}

            {/* Offer Studio */}
            {activeTab === "offers" && (
              <OfferStudioView
                missionId={missionId}
                onRefreshSummary={() => fetchSummary(missionId)}
              />
            )}

            {/* 8-Stage CRM Lead Pipeline */}
            {activeTab === "leads" && (
              <LeadKanbanView
                missionId={missionId}
                onRefreshSummary={() => fetchSummary(missionId)}
              />
            )}

            {/* Human-in-the-Loop Safety Approvals */}
            {activeTab === "approvals" && (
              <SafetyApprovalQueueView
                missionId={missionId}
                onRefreshSummary={() => fetchSummary(missionId)}
              />
            )}

            {/* Dubai Real Estate Mode */}
            {activeTab === "real-estate" && (
              <DubaiRealEstateView
                missionId={missionId}
                onRefreshSummary={() => fetchSummary(missionId)}
              />
            )}

            {/* Revenue Intelligence Center */}
            {activeTab === "intelligence" && (
              <RevenueIntelligenceCenter
                missionId={missionId}
              />
            )}

            {/* Analytics & Brain */}
            {activeTab === "analytics" && (
              <AnalyticsMemoryView
                missionId={missionId}
                onRefreshSummary={() => fetchSummary(missionId)}
              />
            )}
          </>
        )}
      </main>

      {/* Modal for creating missions */}
      <NewMissionModal
        isOpen={isNewMissionOpen}
        onClose={() => setIsNewMissionOpen(false)}
        onMissionCreated={handleMissionCreated}
      />
    </div>
  );
}
