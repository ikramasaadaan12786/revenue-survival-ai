import { RevenueEmpireData, EmployeeScorecard, MorningCEOReport } from "@/types";

const getApiBase = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.trim().replace(/\/+$/, "");
  }
  // Default fallback for development or same-host deployment
  if (typeof window !== "undefined" && window.location.origin) {
    // If running in browser and no explicit env var is set, check if deployed behind reverse proxy or fallback
    return "http://127.0.0.1:8000/api/v1";
  }
  return "http://127.0.0.1:8000/api/v1";
};

const API_BASE = getApiBase();

export async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${getApiBase()}${cleanEndpoint}`;
  
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Missions
  getMissions: () => fetcher<any[]>("/missions/"),
  getMissionDashboard: (missionId: number) => fetcher<any>(`/missions/${missionId}/dashboard`),
  getGlobalOverview: () => fetcher<any>("/missions/global/overview"),
  updateMissionStatus: (missionId: number, status: string) =>
    fetcher<any>(`/missions/${missionId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  createMission: (data: any) =>
    fetcher<any>("/missions/", { method: "POST", body: JSON.stringify(data) }),
  runNextStep: (missionId: number) =>
    fetcher<any>(`/missions/${missionId}/run-next-step`, { method: "POST" }),
  evaluatePivot: (missionId: number) =>
    fetcher<any>(`/missions/${missionId}/evaluate-pivot`, { method: "POST" }),

  // Opportunities & Scored Revenue Opportunities
  getOpportunities: (missionId: number) =>
    fetcher<any[]>(`/opportunities/mission/${missionId}`),
  getRevenueOpportunities: (missionId: number) =>
    fetcher<any[]>(`/opportunities/revenue-opportunities/${missionId}`),
  huntOpportunities: (missionId: number) =>
    fetcher<any>(`/opportunities/hunt/${missionId}`, { method: "POST" }),

  // Offers
  getOffers: (missionId: number) =>
    fetcher<any[]>(`/offers/mission/${missionId}`),
  generateOffer: (missionId: number) =>
    fetcher<any>(`/offers/generate/${missionId}`, { method: "POST" }),
  createOffer: (data: any) =>
    fetcher<any>("/offers/", { method: "POST", body: JSON.stringify(data) }),

  // Leads & 8-Stage CRM
  getLeads: (missionId: number) =>
    fetcher<any[]>(`/leads/mission/${missionId}`),
  huntLeads: (missionId: number) =>
    fetcher<any>(`/leads/hunt/${missionId}`, { method: "POST" }),
  updateLeadStatus: (leadId: number, status: string, notes?: string) =>
    fetcher<any>(`/leads/${leadId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, notes }),
    }),

  // Communications & Safety Approvals
  getCommunications: (missionId: number) =>
    fetcher<any[]>(`/communications/mission/${missionId}`),
  getPendingApprovals: (missionId: number) =>
    fetcher<any[]>(`/communications/approvals/${missionId}`),
  draftOutreach: (missionId: number) =>
    fetcher<any>(`/communications/draft/${missionId}`, { method: "POST" }),
  reviewCommunication: (commId: number, approval_status: string, modified_body?: string) =>
    fetcher<any>(`/communications/${commId}/review`, {
      method: "POST",
      body: JSON.stringify({ approval_status, modified_body }),
    }),
  batchApprove: (missionId: number) =>
    fetcher<any>(`/communications/batch-approve/${missionId}`, { method: "POST" }),
  simulateReply: (commId: number, message: string) =>
    fetcher<any>(`/communications/${commId}/simulate-reply`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),

  // Tasks
  getTasks: (missionId: number) =>
    fetcher<any[]>(`/tasks/mission/${missionId}`),

  // Real Estate Mode & Matchmaker
  getRealEstateDeals: (missionId: number) =>
    fetcher<any[]>(`/real-estate/deals/${missionId}`),
  createRealEstateDeal: (data: any) =>
    fetcher<any>("/real-estate/deals", { method: "POST", body: JSON.stringify(data) }),
  scanRealEstateRadar: (missionId: number, area?: string, asset_class?: string) =>
    fetcher<any>("/real-estate/scan-radar", {
      method: "POST",
      body: JSON.stringify({ mission_id: missionId, area, asset_class }),
    }),
  runMatchmaker: (missionId: number, buyerId?: number, dealId?: number) =>
    fetcher<any>("/real-estate/matchmaker", {
      method: "POST",
      body: JSON.stringify({ mission_id: missionId, buyer_id: buyerId, deal_id: dealId }),
    }),

  // Daily Autonomous Scheduler
  getDailyCycleLogs: (missionId: number) =>
    fetcher<any[]>(`/scheduler/logs/${missionId}`),
  runDailyCycle: (missionId: number) =>
    fetcher<any>(`/scheduler/run-cycle/${missionId}`, { method: "POST" }),

  // Connectors & Live Data Acquisition & UAE Buyer Radar Bridge
  getSignals: (missionId: number, source?: string) =>
    fetcher<{ total_signals: number; breakdown: Record<string, number>; signals: any[] }>(
      `/connectors/signals/${missionId}${source ? `?source=${source}` : ""}`
    ),
  scanAllConnectors: (missionId: number) =>
    fetcher<any>(`/connectors/scan-all/${missionId}`, { method: "POST" }),
  syncBuyerRadarBridge: (missionId: number, source?: string) =>
    fetcher<any>(`/connectors/bridge/sync/${missionId}${source ? `?source=${source}` : ""}`, { method: "POST" }),
  getConnectorHealth: () =>
    fetcher<any[]>("/connectors/bridge/health"),
  getRevenueCommandCenter: (missionId: number) =>
    fetcher<any>(`/connectors/bridge/command-center/${missionId}`),
  getDailySurvivalReport: (missionId: number) =>
    fetcher<any>(`/connectors/bridge/daily-report/${missionId}`),
  triggerHourlyBridgeSync: () =>
    fetcher<any>("/connectors/bridge/hourly-sync", { method: "POST" }),
  ingestSignal: (data: any) =>
    fetcher<any>("/connectors/ingest", { method: "POST", body: JSON.stringify(data) }),

  // Seller Intelligence & Distress Radar
  getSellerListings: (missionId: number) =>
    fetcher<any[]>(`/seller-intelligence/listings/${missionId}`),
  scanSellerListings: (missionId: number) =>
    fetcher<any>(`/seller-intelligence/scan/${missionId}`, { method: "POST" }),
  scoreSellerOpportunity: (data: any) =>
    fetcher<any>("/seller-intelligence/score", { method: "POST", body: JSON.stringify(data) }),
  createSellerListing: (data: any) =>
    fetcher<any>("/seller-intelligence/listings", { method: "POST", body: JSON.stringify(data) }),

  // Outreach Automation & Campaigns
  createOutreachCampaign: (data: { mission_id: number; target_intent?: string; lead_ids?: number[]; custom_pitch_angle?: string }) =>
    fetcher<any>("/outreach-automation/campaign", { method: "POST", body: JSON.stringify(data) }),
  getOutreachPipeline: (missionId: number) =>
    fetcher<{ mission_id: number; total_leads_tracked: number; pipeline: any[] }>(
      `/outreach-automation/pipeline/${missionId}`
    ),
  generateSequence: (missionId: number, leadId: number) =>
    fetcher<any>("/outreach-automation/generate-sequence", {
      method: "POST",
      body: JSON.stringify({ mission_id: missionId, lead_id: leadId }),
    }),

  // Persistent Long-Term Cognitive Memory
  getLongTermMemories: (category?: string) =>
    fetcher<any[]>(`/long-term-memory/${category ? `?category=${category}` : ""}`),
  recordLongTermMemory: (data: any) =>
    fetcher<any>("/long-term-memory/", { method: "POST", body: JSON.stringify(data) }),

  // Upgraded Survival Manager & Diagnostics
  getMissionProgress: (missionId: number) =>
    fetcher<any>(`/missions/${missionId}/progress`),
  getDailyStrategyDecision: (missionId: number) =>
    fetcher<any>(`/missions/${missionId}/strategy-decision`),
  getBottlenecks: (missionId: number) =>
    fetcher<any>(`/missions/${missionId}/bottlenecks`),
  triggerBrowserResearch: (missionId: number) =>
    fetcher<any>(`/missions/${missionId}/browser-research`, { method: "POST" }),

  // Phase 4: Live Execution & Browser Automation
  pollLiveConnectors: (missionId: number) =>
    fetcher<any>(`/connectors/poll-live/${missionId}`, { method: "POST" }),

  fetchMessageTemplates: () =>
    fetcher<{ templates: any[] }>("/communications/templates"),

  dispatchCommunication: (commId: number) =>
    fetcher<any>(`/communications/dispatch/${commId}`, { method: "POST" }),

  sendInboundWebhook: (provider: string, data: { sender: string; message: string; provider_message_id?: string }) =>
    fetcher<any>(`/communications/webhooks/${provider}`, { method: "POST", body: JSON.stringify(data) }),

  scanPlaywrightMarket: (missionId: number) =>
    fetcher<any>(`/browser-automation/scan/${missionId}`, { method: "POST" }),

  getTrackedPriceDrops: (missionId: number) =>
    fetcher<any>(`/browser-automation/price-drops/${missionId}`),

  executeLiveCycle: (missionId: number) =>
    fetcher<any>(`/missions/${missionId}/live-cycle`, { method: "POST" }),

  getLiveRoadmap: (missionId: number, totalDays: number = 30) =>
    fetcher<any>(`/missions/${missionId}/live-roadmap?total_days=${totalDays}`),

  // Multi-Industry Strategy Brain & Marketplace
  evaluateRevenueIntent: (data: { target_amount: number; deadline_hours?: number; budget?: number; currency?: string }) =>
    fetcher<any>("/strategy-brain/evaluate", { method: "POST", body: JSON.stringify(data) }),

  autoCreateMissionFromBrain: (data: { target_amount: number; deadline_hours?: number; budget?: number; currency?: string; title?: string }) =>
    fetcher<any>("/strategy-brain/auto-create-mission", { method: "POST", body: JSON.stringify(data) }),

  triggerStrategyPivot: (missionId: number, forcedNewIndustry?: string) =>
    fetcher<any>(`/strategy-brain/pivot/${missionId}`, {
      method: "POST",
      body: JSON.stringify({ forced_new_industry: forcedNewIndustry || null })
    }),

  fetchMarketplaceIndustries: () =>
    fetcher<any>("/marketplace/industries"),

  fetchMarketplaceServices: (industry?: string) =>
    fetcher<any>(`/marketplace/services${industry ? `?industry=${encodeURIComponent(industry)}` : ""}`),

  huntMultiIndustrySignals: (missionId: number, industry: string = "ALL") =>
    fetcher<any>(`/marketplace/hunt-signals/${missionId}`, {
      method: "POST",
      body: JSON.stringify({ industry })
    }),

  // Acquisition Engine v2: Connector Authentication Framework
  getConnectorAuthStatus: () =>
    fetcher<any[]>("/connectors/auth/status"),
  configureConnectorAuth: (data: { connector_name: string; auth_type?: string; credentials: Record<string, any> }) =>
    fetcher<any>("/connectors/auth/configure", { method: "POST", body: JSON.stringify(data) }),
  testConnectorAuth: (connectorName: string) =>
    fetcher<any>(`/connectors/auth/test/${encodeURIComponent(connectorName)}`, { method: "POST" }),

  // Acquisition Engine v2: Autonomous Daily Scheduler
  runAutoDiscoverySweep: (missionId?: number) =>
    fetcher<any>(`/scheduler/auto-discovery-sweep${missionId ? `?mission_id=${missionId}` : ""}`, { method: "POST" }),

  // Acquisition Engine v2: Revenue Copilot
  analyzeOpportunityWithCopilot: (data: {
    opportunity_id?: number;
    revenue_opportunity_id?: number;
    problem_text?: string;
    company?: string;
    industry?: string;
    target_budget?: number;
    currency?: string;
  }) =>
    fetcher<any>("/copilot/analyze-opportunity", { method: "POST", body: JSON.stringify(data) }),

  // Acquisition Engine v2: Mission Escalation
  getMissionEscalation: (missionId: number) =>
    fetcher<any>(`/missions/${missionId}/escalation-recommendation`),
  applyMissionEscalation: (missionId: number, data: { action_type: string; new_goal_amount?: number; new_strategy_angle?: string }) =>
    fetcher<any>(`/missions/${missionId}/apply-escalation`, { method: "POST", body: JSON.stringify(data) }),

  // Revenue Closing & Learning Engine v3: Lead Qualification
  qualifyLead: (data: {
    lead_id?: number;
    opportunity_id?: number;
    company_name?: string;
    requirement_text?: string;
    channel?: string;
    contact_name?: string;
    industry?: string;
  }) =>
    fetcher<any>("/closing-engine/qualify-lead", { method: "POST", body: JSON.stringify(data) }),

  // Revenue Closing & Learning Engine v3: Sales Closing Assistant
  getSalesClosingStrategy: (data: {
    lead_id?: number;
    opportunity_id?: number;
    company_name?: string;
    industry?: string;
    target_budget?: number;
    current_objection?: string;
  }) =>
    fetcher<any>("/closing-engine/sales-copilot", { method: "POST", body: JSON.stringify(data) }),

  // Revenue Closing & Learning Engine v3: Proposal Generator
  generateProposal: (data: {
    mission_id: number;
    lead_id?: number;
    opportunity_id?: number;
    proposal_type?: string;
    client_name: string;
    client_industry?: string;
    problem_description: string;
    custom_budget?: number;
    timeline_days?: number;
  }) =>
    fetcher<any>("/closing-engine/generate-proposal", { method: "POST", body: JSON.stringify(data) }),
  getMissionProposals: (missionId: number) =>
    fetcher<any[]>(`/closing-engine/proposals/${missionId}`),

  // Revenue Closing & Learning Engine v3: Upgraded Deal Pipeline
  updatePipelineStage: (leadId: number, data: { stage: string; notes?: string; revenue_probability?: number }) =>
    fetcher<any>(`/closing-engine/leads/${leadId}/pipeline-stage`, { method: "PATCH", body: JSON.stringify(data) }),
  getDealPipelineOverview: (missionId: number) =>
    fetcher<any>(`/closing-engine/pipeline/overview/${missionId}`),

  // Revenue Closing & Learning Engine v4: Autonomous Closing Engine
  qualifyDeal: (data: any) =>
    fetcher<any>("/closing-engine/qualify-deal", { method: "POST", body: JSON.stringify(data) }),
  matchOffer: (data: any) =>
    fetcher<any>("/closing-engine/match-offer", { method: "POST", body: JSON.stringify(data) }),
  getSalesCopilotSequence: (data: any) =>
    fetcher<any>("/closing-engine/sales-copilot-sequence", { method: "POST", body: JSON.stringify(data) }),
  getDailyExecutionPlan: (missionId: number) =>
    fetcher<any>(`/closing-engine/daily-execution-plan/${missionId}`),
  recordDealOutcome: (data: { mission_id: number; lead_id: number; outcome: string; actual_revenue_aed?: number; reason?: string }) =>
    fetcher<any>("/closing-engine/record-deal-outcome", { method: "POST", body: JSON.stringify(data) }),
  runFullClosingCycle: (missionId: number) =>
    fetcher<any>(`/closing-engine/run-full-closing-cycle/${missionId}`, { method: "POST" }),

  // Revenue Closing & Learning Engine v3: Revenue Memory & Performance Review
  getRevenueLearnings: (missionId?: number) =>
    fetcher<any[]>(`/learning/insights${missionId ? `/${missionId}` : ""}`),
  getWeeklyPerformanceReport: (missionId: number) =>
    fetcher<any>(`/learning/performance-report/${missionId}`),

  // Autonomous CEO Brain v4: Strategy & Self-Optimization
  getCEODailyDecision: (missionId: number) =>
    fetcher<any>(`/ceo-brain/daily-decision/${missionId}`),
  getHistoricalCEODecisions: (missionId: number) =>
    fetcher<any[]>(`/ceo-brain/historical-decisions/${missionId}`),
  getIndustryIntelligence: (missionId?: number) =>
    fetcher<any[]>(`/ceo-brain/industry-intelligence${missionId ? `?mission_id=${missionId}` : ""}`),
  getOfferOptimization: (missionId?: number) =>
    fetcher<any[]>(`/ceo-brain/offer-optimization${missionId ? `?mission_id=${missionId}` : ""}`),
  getSourceIntelligence: (missionId?: number) =>
    fetcher<any[]>(`/ceo-brain/source-intelligence${missionId ? `?mission_id=${missionId}` : ""}`),
  getRevenueGapAnalysis: (missionId: number) =>
    fetcher<any>(`/ceo-brain/revenue-gap/${missionId}`),
  getTopPriorities: (missionId: number) =>
    fetcher<any[]>(`/ceo-brain/top-priorities/${missionId}`),
  getCEOExperiments: (missionId: number) =>
    fetcher<any[]>(`/ceo-brain/experiments/${missionId}`),
  createCEOExperiment: (data: { mission_id: number; name: string; hypothesis: string; variant_a: string; variant_b: string }) =>
    fetcher<any>("/ceo-brain/experiments/create", { method: "POST", body: JSON.stringify(data) }),
  getExecutiveWeeklyReport: (missionId: number) =>
    fetcher<any>(`/ceo-brain/weekly-report/${missionId}`),
  getMorningCEOBriefing: (missionId: number) =>
    fetcher<any>(`/ceo-brain/morning-briefing/${missionId}`),

  // Analytics & Memory
  getRevenues: (missionId: number) =>
    fetcher<any[]>(`/analytics/revenue/${missionId}`),
  recordRevenue: (data: any) =>
    fetcher<any>("/analytics/revenue", { method: "POST", body: JSON.stringify(data) }),
  getExperiments: (missionId: number) =>
    fetcher<any[]>(`/analytics/experiments/${missionId}`),
  getMemory: () =>
    fetcher<any[]>("/analytics/memory"),

  // Autonomous Business Operator v5: Control Room & Execution Layer
  getControlRoomStats: (missionId?: number) =>
    fetcher<any>(`/business-operator/control-room-stats${missionId ? `?mission_id=${missionId}` : ""}`),
  runAutonomousCycle: (missionId?: number) =>
    fetcher<any>(`/business-operator/run-autonomous-cycle${missionId ? `?mission_id=${missionId}` : ""}`, { method: "POST" }),
  generateMissionBlueprint: (marketFocusOverride?: string) =>
    fetcher<any>("/business-operator/generate-mission-blueprint", {
      method: "POST",
      body: JSON.stringify({ market_focus_override: marketFocusOverride || null }),
    }),
  createAutonomousMission: (blueprint?: any) =>
    fetcher<any>("/business-operator/create-autonomous-mission", {
      method: "POST",
      body: JSON.stringify({ blueprint: blueprint || null }),
    }),
  getMissionSelfOptimizations: (missionId: number) =>
    fetcher<any>(`/business-operator/self-optimizations/${missionId}`),
  generateTieredOffers: (leadId: number) =>
    fetcher<any>(`/business-operator/generate-tiered-offers/${leadId}`, { method: "POST" }),
  getHunterFleetStatus: () =>
    fetcher<any[]>("/business-operator/hunter-fleet-status"),
  dispatchLeadHunters: (missionId?: number, sources?: string[]) =>
    fetcher<any>("/business-operator/dispatch-lead-hunters", {
      method: "POST",
      body: JSON.stringify({ mission_id: missionId || null, sources: sources || null }),
    }),
  getOperatorApprovalQueue: (missionId?: number) =>
    fetcher<any>(`/business-operator/approval-queue${missionId ? `?mission_id=${missionId}` : ""}`),
  approveOperatorAction: (actionId: number) =>
    fetcher<any>(`/business-operator/approve-action/${actionId}`, { method: "POST" }),
  rejectOperatorAction: (actionId: number, reason?: string) =>
    fetcher<any>(`/business-operator/reject-action/${actionId}`, {
      method: "POST",
      body: JSON.stringify({ reason: reason || null }),
    }),
  approveOperatorCommunication: (commId: number) =>
    fetcher<any>(`/business-operator/approve-communication/${commId}`, { method: "POST" }),
  batchApproveOperatorQueue: (missionId?: number) =>
    fetcher<any>("/business-operator/batch-approve", {
      method: "POST",
      body: JSON.stringify({ mission_id: missionId || null }),
    }),
  getBusinessGrowthMemory: (limit: number = 10) =>
    fetcher<any[]>(`/business-operator/growth-memory?limit=${limit}`),

  // Autonomous Growth Loop v6: Optimization & Experiments
  getGrowthCommandCenterStats: (missionId?: number) =>
    fetcher<any>(`/growth-loop/command-center${missionId ? `?mission_id=${missionId}` : ""}`),
  runGrowthOptimizationCycle: (missionId?: number) =>
    fetcher<any>(`/growth-loop/run-optimization-cycle${missionId ? `?mission_id=${missionId}` : ""}`, { method: "POST" }),
  createGrowthExperiment: (data: { mission_id?: number; name: string; category?: string; hypothesis: string; variant_a: string; variant_b: string }) =>
    fetcher<any>("/growth-loop/create-experiment", { method: "POST", body: JSON.stringify(data) }),
  getPricingIntelligence: () =>
    fetcher<any[]>("/growth-loop/pricing-intelligence"),

  // Autonomous Revenue Empire v7: AI Company Operating System
  getCompanyCommandCenter: (missionId?: number) =>
    fetcher<RevenueEmpireData>(`/revenue-empire/command-center${missionId ? `?mission_id=${missionId}` : ""}`),
  getCompanyOrgChart: () =>
    fetcher<any>("/revenue-empire/org-chart"),
  getDepartmentDetails: (deptName: string, missionId?: number) =>
    fetcher<any>(`/revenue-empire/department/${deptName}${missionId ? `?mission_id=${missionId}` : ""}`),
  getEmployeeScorecards: (missionId?: number) =>
    fetcher<EmployeeScorecard[]>(`/revenue-empire/scorecards${missionId ? `?mission_id=${missionId}` : ""}`),
  getMorningCEOReport: (missionId?: number) =>
    fetcher<MorningCEOReport>(`/revenue-empire/morning-report${missionId ? `?mission_id=${missionId}` : ""}`),
  runCompanyOperatingCycle: (missionId?: number) =>
    fetcher<any>(`/revenue-empire/run-operating-cycle${missionId ? `?mission_id=${missionId}` : ""}`, { method: "POST" }),
  listClientAccounts: (missionId?: number) =>
    fetcher<any[]>(`/revenue-empire/clients${missionId ? `?mission_id=${missionId}` : ""}`),
  createClientAccount: (data: any, missionId?: number) =>
    fetcher<any>(`/revenue-empire/clients${missionId ? `?mission_id=${missionId}` : ""}`, { method: "POST", body: JSON.stringify(data) }),
};






