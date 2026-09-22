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
  createMission: (data: any) =>
    fetcher<any>("/missions/", { method: "POST", body: JSON.stringify(data) }),
  runNextStep: (missionId: number) =>
    fetcher<any>(`/missions/${missionId}/run-next-step`, { method: "POST" }),
  evaluatePivot: (missionId: number) =>
    fetcher<any>(`/missions/${missionId}/evaluate-pivot`, { method: "POST" }),

  // Opportunities
  getOpportunities: (missionId: number) =>
    fetcher<any[]>(`/opportunities/mission/${missionId}`),
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

  // Connectors & Live Data Acquisition
  getSignals: (missionId: number, source?: string) =>
    fetcher<{ total_signals: number; breakdown: Record<string, number>; signals: any[] }>(
      `/connectors/signals/${missionId}${source ? `?source=${source}` : ""}`
    ),
  scanAllConnectors: (missionId: number) =>
    fetcher<any>(`/connectors/scan-all/${missionId}`, { method: "POST" }),
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

  // Analytics & Memory
  getRevenues: (missionId: number) =>
    fetcher<any[]>(`/analytics/revenue/${missionId}`),
  recordRevenue: (data: any) =>
    fetcher<any>("/analytics/revenue", { method: "POST", body: JSON.stringify(data) }),
  getExperiments: (missionId: number) =>
    fetcher<any[]>(`/analytics/experiments/${missionId}`),
  getMemory: () =>
    fetcher<any[]>("/analytics/memory"),
};

