"use client";

import React, { useState, useEffect } from "react";
import { 
  Network, 
  Building2, 
  Users, 
  ShoppingBag, 
  Bot, 
  CreditCard, 
  ShieldCheck, 
  Sparkles, 
  PlusCircle, 
  ChevronRight, 
  RefreshCw, 
  CheckCircle2, 
  ArrowUpRight, 
  MessageSquare, 
  Zap, 
  Send,
  Layers,
  Crown,
  Coins,
  Briefcase,
  Sliders,
  Check
} from "lucide-react";
import { api } from "@/lib/api";
import { EnterpriseNetworkData, AIEmployeeCatalogItem } from "@/types";

export const AIEnterpriseNetworkCenter: React.FC = () => {
  const [networkData, setNetworkData] = useState<EnterpriseNetworkData | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [selectedCompanyWs, setSelectedCompanyWs] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<string>("companies");
  const [loading, setLoading] = useState<boolean>(true);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Modal / Action states
  const [isNewCompanyOpen, setIsNewCompanyOpen] = useState<boolean>(false);
  const [newCompanyName, setNewCompanyName] = useState<string>("");
  const [newCompanyIndustry, setNewCompanyIndustry] = useState<string>("AI Automation & Real Estate");
  const [newCompanyPlan, setNewCompanyPlan] = useState<string>("PROFESSIONAL");

  // Client assistant test form
  const [assistantType, setAssistantType] = useState<string>("PROPERTY");
  const [clientName, setClientName] = useState<string>("Lord Henry Sterling");
  const [queryText, setQueryText] = useState<string>("Looking for 4BR luxury beachfront villa in Palm Jumeirah, budget 12M AED cash.");
  const [assistantResponse, setAssistantResponse] = useState<any | null>(null);
  const [isQuerying, setIsQuerying] = useState<boolean>(false);

  const fetchNetworkTelemetry = async () => {
    try {
      setLoading(true);
      const res = await api.getEnterpriseNetworkOverview();
      setNetworkData(res);
      if (res.companies && res.companies.length > 0 && selectedCompanyId === null) {
        setSelectedCompanyId(res.companies[0].id);
      }
    } catch (err: any) {
      console.error("Failed to load Enterprise Network overview", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectedWorkspace = async (companyId: number) => {
    try {
      const ws = await api.getEnterpriseCompanyWorkspace(companyId);
      setSelectedCompanyWs(ws);
    } catch (err: any) {
      console.error("Failed to load company workspace", err);
    }
  };

  useEffect(() => {
    fetchNetworkTelemetry();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchSelectedWorkspace(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    try {
      const created = await api.createEnterpriseCompany({
        name: newCompanyName,
        industry: newCompanyIndustry,
        tier_plan: newCompanyPlan
      });
      setFeedbackMsg(`Company workspace '${created.name}' successfully provisioned!`);
      setIsNewCompanyOpen(false);
      setNewCompanyName("");
      await fetchNetworkTelemetry();
      setSelectedCompanyId(created.id);
    } catch (err: any) {
      setFeedbackMsg("Failed to create company workspace.");
    } finally {
      setTimeout(() => setFeedbackMsg(null), 5000);
    }
  };

  const handleAssignEmployee = async (catalogId: string, empName: string) => {
    if (!selectedCompanyId) return;
    try {
      await api.assignAIEmployee(selectedCompanyId, {
        employee_catalog_id: catalogId,
        custom_name: `${empName} (Active)`
      });
      setFeedbackMsg(`AI Employee '${empName}' successfully assigned to workspace!`);
      await fetchSelectedWorkspace(selectedCompanyId);
      await fetchNetworkTelemetry();
    } catch (err: any) {
      setFeedbackMsg(err.message || "Failed to assign employee. Limit reached.");
    } finally {
      setTimeout(() => setFeedbackMsg(null), 5000);
    }
  };

  const handleUpgradePlan = async (newPlan: string) => {
    if (!selectedCompanyId) return;
    try {
      await api.upgradeCompanyPlan(selectedCompanyId, newPlan);
      setFeedbackMsg(`Company successfully upgraded to '${newPlan}' plan!`);
      await fetchSelectedWorkspace(selectedCompanyId);
      await fetchNetworkTelemetry();
    } catch (err: any) {
      setFeedbackMsg("Failed to upgrade plan.");
    } finally {
      setTimeout(() => setFeedbackMsg(null), 5000);
    }
  };

  const handleConsultAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId || !queryText.trim()) return;

    try {
      setIsQuerying(true);
      const res = await api.consultClientAssistant(selectedCompanyId, {
        assistant_type: assistantType,
        client_name: clientName,
        query_text: queryText
      });
      setAssistantResponse(res);
      await fetchSelectedWorkspace(selectedCompanyId);
    } catch (err: any) {
      console.error("Failed to consult assistant", err);
    } finally {
      setIsQuerying(false);
    }
  };

  if (loading && !networkData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-8 h-8 text-[#D4AF37] animate-spin" />
        <p className="text-[#8C9BAE] text-xs font-serif uppercase tracking-widest">
          Connecting to Sovereign Enterprise Network...
        </p>
      </div>
    );
  }

  const selectedCompany = networkData?.companies.find(c => c.id === selectedCompanyId) || networkData?.companies[0];

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B101D] via-[#06080F] to-[#04060A] border border-[#D4AF37]/30 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5 text-[#D4AF37]" />
                Autonomous AI Enterprise Network v9
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {networkData?.network_status || "Multi-Tenant Operational"}
              </span>
            </div>
            <h1 className="font-serif text-2xl lg:text-3xl font-bold tracking-tight text-[#F9F6EE] flex items-center gap-2.5">
              <Building2 className="w-7 h-7 text-[#D4AF37]" />
              Multi-Business AI Enterprise Network
            </h1>
            <p className="text-xs text-[#8C9BAE] max-w-2xl leading-relaxed">
              Operate multiple independent companies, deploy white-label AI workforce swarms as a service, and run client-facing assistants with 100% data & memory isolation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsNewCompanyOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] hover:opacity-95 text-[#06080F] font-bold text-xs rounded-xl shadow-[0_4px_20px_rgba(212,175,55,0.3)] transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Provision New Company
            </button>
            <button
              onClick={fetchNetworkTelemetry}
              className="p-2.5 bg-[#06080F] hover:bg-[#0B101D] text-[#8C9BAE] hover:text-[#F9F6EE] rounded-xl border border-white/[0.08] hover:border-[#D4AF37]/30 transition-colors"
              title="Refresh Network Telemetry"
            >
              <RefreshCw className="w-4 h-4 text-[#D4AF37]" />
            </button>
          </div>
        </div>

        {feedbackMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}
      </div>

      {/* High-Level Network Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-b from-[#0B101D]/90 to-[#04060A]/95 border border-[#D4AF37]/25 rounded-xl p-5 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold text-[#8C9BAE] uppercase tracking-wider">Network Annual Run Rate</p>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="font-serif text-2xl font-bold text-[#F9F6EE] mt-2">
            AED {networkData?.total_arr_aed?.toLocaleString() || "539,964"}
          </p>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-400 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>MRR: AED {networkData?.total_mrr_aed?.toLocaleString() || "44,997"}</span>
          </div>
        </div>

        <div className="bg-gradient-to-b from-[#0B101D]/90 to-[#04060A]/95 border border-[#D4AF37]/25 rounded-xl p-5 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold text-[#8C9BAE] uppercase tracking-wider">Active Companies</p>
            <Building2 className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <p className="font-serif text-2xl font-bold text-[#F3E5AB] mt-2">
            {networkData?.total_companies_count || 3} Enterprises
          </p>
          <p className="text-[10px] text-[#C5A059] mt-1">100% Data & Memory Isolated</p>
        </div>

        <div className="bg-gradient-to-b from-[#0B101D]/90 to-[#04060A]/95 border border-[#D4AF37]/25 rounded-xl p-5 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold text-[#8C9BAE] uppercase tracking-wider">AI Workers Deployed</p>
            <Bot className="w-4 h-4 text-purple-400" />
          </div>
          <p className="font-serif text-2xl font-bold text-purple-300 mt-2">
            {networkData?.total_ai_workers_deployed || 10} Active AI Employees
          </p>
          <p className="text-[10px] text-[#8C9BAE] mt-1">8 Marketplace Roles</p>
        </div>

        <div className="bg-gradient-to-b from-[#0B101D]/90 to-[#04060A]/95 border border-[#D4AF37]/25 rounded-xl p-5 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold text-[#8C9BAE] uppercase tracking-wider">Tenant Isolation Health</p>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="font-serif text-2xl font-bold text-cyan-300 mt-2">
            100% SECURE
          </p>
          <p className="text-[10px] text-emerald-400 mt-1 font-semibold">Zero Cross-Tenant Bleed</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#D4AF37]/15 pb-3">
        {[
          { id: "companies", label: "Company Workspaces", icon: Building2 },
          { id: "marketplace", label: "AI Employee Marketplace", icon: ShoppingBag },
          { id: "assistants", label: "Client-Facing Assistants", icon: MessageSquare },
          { id: "billing", label: "SaaS Plans & Billing", icon: CreditCard },
          { id: "admin", label: "Admin Health & Isolation", icon: Sliders },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                isActive
                  ? "bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] text-[#06080F] shadow-[0_2px_15px_rgba(212,175,55,0.3)]"
                  : "bg-[#0B101D] text-[#8C9BAE] hover:text-[#F9F6EE] hover:bg-[#06080F] border border-white/[0.06]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Company Workspaces */}
      {activeTab === "companies" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Company Selector Column */}
          <div className="bg-gradient-to-b from-[#0B101D]/90 to-[#04060A]/95 border border-[#D4AF37]/25 rounded-2xl p-4 space-y-3 backdrop-blur-xl">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-serif text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Select Tenant Workspace</h3>
              <span className="text-[10px] text-[#8C9BAE]">{networkData?.companies.length} Companies</span>
            </div>

            <div className="space-y-2">
              {networkData?.companies.map((c) => {
                const isSelected = selectedCompanyId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCompanyId(c.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all space-y-1 ${
                      isSelected
                        ? "bg-[#D4AF37]/15 border-[#D4AF37]/50 text-[#F9F6EE] shadow-[0_2px_12px_rgba(212,175,55,0.15)]"
                        : "bg-[#06080F]/80 border-white/[0.04] text-[#CBD5E1] hover:border-[#D4AF37]/30"
                    }`}
                  >
                    <div className="flex justify-between items-center font-bold">
                      <span className="truncate">{c.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#D4AF37]/20 text-[#D4AF37] uppercase">{c.tier_plan}</span>
                    </div>
                    <p className="text-[10px] text-[#8C9BAE]">{c.industry} • {c.country}</p>
                    <div className="flex justify-between text-[10px] text-[#8C9BAE] pt-1">
                      <span>Workers: <strong className="text-emerald-400">{c.active_ai_employees_count} Active</strong></span>
                      <span>Revenue: <strong className="text-[#F9F6EE] font-serif">AED {c.business_metrics?.monthly_revenue_aed?.toLocaleString() || 0}</strong></span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Workspace Deep-Dive */}
          <div className="lg:col-span-2 bg-gradient-to-b from-[#0B101D]/90 to-[#04060A]/95 border border-[#D4AF37]/25 rounded-2xl p-6 space-y-6 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
            {selectedCompanyWs ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D4AF37]/15 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 uppercase">
                        {selectedCompanyWs.tier_plan} PLAN
                      </span>
                      <h2 className="font-serif text-lg font-bold text-[#F9F6EE]">{selectedCompanyWs.name}</h2>
                    </div>
                    <p className="text-xs text-[#8C9BAE] mt-1">{selectedCompanyWs.industry} • {selectedCompanyWs.country}</p>
                  </div>

                  {/* Quota Bar */}
                  <div className="bg-[#06080F]/80 p-3 rounded-xl border border-white/[0.06] text-xs text-right space-y-1">
                    <p className="text-[10px] text-[#8C9BAE] uppercase font-semibold">AI Worker Capacity</p>
                    <p className="font-bold text-[#F9F6EE]">
                      {selectedCompanyWs.assigned_ai_employees?.length} / {selectedCompanyWs.subscription?.ai_employee_limit} Slots Used
                    </p>
                  </div>
                </div>

                {/* Assigned AI Employees */}
                <div className="space-y-3">
                  <h3 className="font-serif text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                    <Bot className="w-4 h-4" /> Assigned AI Workforce ({selectedCompanyWs.assigned_ai_employees?.length})
                  </h3>

                  {selectedCompanyWs.assigned_ai_employees?.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#8C9BAE] bg-[#06080F]/50 rounded-xl border border-white/[0.04]">
                      No AI employees assigned yet. Visit the Marketplace tab to activate specialized workers.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedCompanyWs.assigned_ai_employees?.map((emp: any) => (
                        <div key={emp.id} className="bg-[#06080F]/80 border border-white/[0.06] rounded-xl p-3.5 text-xs space-y-2">
                          <div className="flex justify-between items-start font-bold text-[#F9F6EE]">
                            <div>
                              <h4 className="text-sm text-[#F3E5AB]">{emp.name}</h4>
                              <p className="text-[10px] text-[#8C9BAE] font-normal">{emp.role} • {emp.department}</p>
                            </div>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 font-semibold">{emp.status}</span>
                          </div>
                          <div className="space-y-1 text-[10px] text-[#8C9BAE]">
                            <p className="font-semibold text-[#CBD5E1]">Custom Directives:</p>
                            {emp.custom_goals?.slice(0, 2).map((g: string, idx: number) => (
                              <p key={idx} className="truncate">• {g}</p>
                            ))}
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-[#8C9BAE] pt-1 border-t border-white/[0.04]">
                            <span>Score: <strong className="text-emerald-400">{emp.performance_score}%</strong></span>
                            <span>Fee: <strong className="text-[#F9F6EE] font-serif">AED {emp.monthly_fee_aed?.toLocaleString()}/mo</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-[#8C9BAE]">Select a company workspace from the left list.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AI Employee Marketplace */}
      {activeTab === "marketplace" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-base font-bold text-[#F9F6EE]">Pre-Trained AI Employee Catalog</h3>
              <p className="text-xs text-[#8C9BAE]">Deploy instant production-ready specialized AI agents into your selected tenant workspace.</p>
            </div>
            <span className="text-xs text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-lg border border-[#D4AF37]/20">
              Active Workspace: <strong>{selectedCompany?.name}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {networkData?.marketplace_catalog?.map((emp: AIEmployeeCatalogItem) => (
              <div key={emp.id} className="bg-gradient-to-b from-[#0B101D]/90 to-[#04060A]/95 border border-[#D4AF37]/25 rounded-2xl p-5 text-xs space-y-3 flex flex-col justify-between hover:border-[#D4AF37]/50 transition-all shadow-md">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#D4AF37]/15 text-[#D4AF37] font-bold uppercase border border-[#D4AF37]/30">{emp.department}</span>
                    <span className="text-emerald-400 font-bold text-xs">{emp.roi_multiplier}x ROI</span>
                  </div>
                  <h4 className="font-bold text-[#F9F6EE] text-sm">{emp.name}</h4>
                  <p className="text-[11px] text-[#8C9BAE]">{emp.role}</p>

                  <div className="space-y-1 text-[10px] text-[#CBD5E1] pt-1">
                    <p className="font-semibold text-[#D4AF37]">Core Capabilities:</p>
                    {emp.skills?.slice(0, 3).map((s: string, idx: number) => (
                      <p key={idx} className="truncate">• {s}</p>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#D4AF37]/15 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#8C9BAE]">Monthly Fee:</span>
                    <strong className="text-[#F9F6EE] font-serif">AED {emp.monthly_fee_aed.toLocaleString()}</strong>
                  </div>
                  <button
                    onClick={() => handleAssignEmployee(emp.id, emp.name)}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] text-[#06080F] shadow-sm hover:opacity-95 transition-all"
                  >
                    Activate in Workspace
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Client-Facing AI Assistants */}
      {activeTab === "assistants" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Interactive Consultation Simulator */}
          <div className="bg-gradient-to-b from-[#0B101D]/90 to-[#04060A]/95 border border-[#D4AF37]/25 rounded-2xl p-6 space-y-4 backdrop-blur-xl">
            <div>
              <h3 className="font-serif text-base font-bold text-[#F9F6EE] flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#D4AF37]" />
                Client-Facing AI Assistant Simulator
              </h3>
              <p className="text-xs text-[#8C9BAE]">Test autonomous multi-purpose client interactions for luxury real estate, B2B sales, support, and consulting.</p>
            </div>

            <form onSubmit={handleConsultAssistant} className="space-y-3 text-xs">
              <div>
                <label className="text-[#8C9BAE] font-semibold mb-1 block">Assistant Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {["PROPERTY", "SALES", "CONSULTANT", "SUPPORT"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAssistantType(type)}
                      className={`py-2 rounded-lg font-bold text-center border transition-all ${
                        assistantType === type
                          ? "bg-[#D4AF37] text-[#06080F] border-[#D4AF37]"
                          : "bg-[#06080F] text-[#8C9BAE] border-white/[0.06]"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[#8C9BAE] font-semibold mb-1 block">Client Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-[#06080F] border border-white/[0.08] focus:border-[#D4AF37] rounded-lg p-2.5 text-[#F9F6EE] outline-none"
                  placeholder="e.g. Lord Henry Sterling"
                />
              </div>

              <div>
                <label className="text-[#8C9BAE] font-semibold mb-1 block">Inbound Query / Message</label>
                <textarea
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  rows={3}
                  className="w-full bg-[#06080F] border border-white/[0.08] focus:border-[#D4AF37] rounded-lg p-2.5 text-[#F9F6EE] outline-none"
                  placeholder="Enter prospect message..."
                />
              </div>

              <button
                type="submit"
                disabled={isQuerying}
                className="w-full py-2.5 bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] text-[#06080F] font-bold rounded-xl shadow-[0_2px_15px_rgba(212,175,55,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {isQuerying ? "Consulting Assistant..." : "Run Client AI Consultation"}
              </button>
            </form>
          </div>

          {/* Consultation Output & Requirement Extraction */}
          <div className="bg-gradient-to-b from-[#0B101D]/90 to-[#04060A]/95 border border-[#D4AF37]/25 rounded-2xl p-6 space-y-4 backdrop-blur-xl">
            <h3 className="font-serif text-base font-bold text-[#F9F6EE] flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              Structured AI Output & Prescribed Action
            </h3>

            {assistantResponse ? (
              <div className="space-y-4 text-xs">
                <div className="bg-[#06080F]/80 p-3.5 rounded-xl border border-[#D4AF37]/30 space-y-1">
                  <p className="text-[10px] text-[#D4AF37] font-bold uppercase">Automated Client Reply</p>
                  <p className="text-[#F9F6EE] text-sm italic">&ldquo;{assistantResponse.reply_message}&rdquo;</p>
                </div>

                <div className="bg-[#06080F]/60 p-3.5 rounded-xl border border-white/[0.04] space-y-2">
                  <p className="text-[10px] text-[#8C9BAE] font-bold uppercase">Extracted Requirements</p>
                  <pre className="text-[11px] text-[#CBD5E1] font-mono overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(assistantResponse.requirements_extracted, null, 2)}
                  </pre>
                </div>

                <div className="bg-[#06080F]/60 p-3.5 rounded-xl border border-white/[0.04] space-y-2">
                  <p className="text-[10px] text-emerald-400 font-bold uppercase">Prescribed Action Plan</p>
                  <ul className="space-y-1 text-[#CBD5E1]">
                    {assistantResponse.ai_recommendations?.map((r: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-[#8C9BAE] text-xs bg-[#06080F]/40 rounded-xl border border-white/[0.04]">
                Submit a client query in the simulator to see live requirement extraction, reasoning, and report generation.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SaaS Plans & Billing */}
      {activeTab === "billing" && (
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <h3 className="font-serif text-xl font-bold text-[#F9F6EE]">SaaS Subscription Plans</h3>
            <p className="text-xs text-[#8C9BAE]">Scale your AI workforce capacity and quota across company tenants.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {networkData?.available_plans?.map((plan: any) => {
              const isCurrent = selectedCompanyWs?.tier_plan === plan.plan_name;
              return (
                <div
                  key={plan.plan_name}
                  className={`bg-gradient-to-b from-[#0B101D]/90 to-[#04060A]/95 rounded-2xl p-5 text-xs space-y-4 flex flex-col justify-between border transition-all ${
                    isCurrent ? "border-[#D4AF37] shadow-[0_4px_25px_rgba(212,175,55,0.25)]" : "border-[#D4AF37]/25"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-[#F9F6EE] text-base">{plan.plan_name}</h4>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-[#D4AF37] text-[#06080F] font-bold">CURRENT</span>
                      )}
                    </div>
                    <div>
                      <p className="font-serif text-2xl font-bold text-[#F9F6EE]">AED {plan.monthly_price_aed.toLocaleString()}</p>
                      <p className="text-[10px] text-[#8C9BAE]">/ month billed annually</p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-white/[0.06] text-[11px] text-[#CBD5E1]">
                      <p className="font-semibold text-[#D4AF37]">Up to {plan.ai_employee_limit} AI Workers</p>
                      <p className="text-[#8C9BAE]">{plan.api_call_quota.toLocaleString()} API Calls/mo</p>
                      {plan.included_features?.map((f: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleUpgradePlan(plan.plan_name)}
                    disabled={isCurrent}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                      isCurrent
                        ? "bg-[#06080F] text-[#8C9BAE] cursor-not-allowed border border-white/[0.04]"
                        : "bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] text-[#06080F] shadow-sm hover:opacity-95"
                    }`}
                  >
                    {isCurrent ? "Active Plan" : `Upgrade to ${plan.plan_name}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: Admin Health & Isolation */}
      {activeTab === "admin" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-b from-[#0B101D]/90 to-[#04060A]/95 border border-[#D4AF37]/25 rounded-2xl p-6 space-y-4 backdrop-blur-xl">
            <h3 className="font-serif text-base font-bold text-[#F9F6EE] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              Tenant Memory & Data Isolation Audit
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between bg-[#06080F]/80 p-3 rounded-xl border border-white/[0.04]">
                <span className="text-[#8C9BAE]">Isolation Layer:</span>
                <strong className="text-emerald-400">{networkData?.admin_system_health?.tenant_isolation_status}</strong>
              </div>
              <div className="flex justify-between bg-[#06080F]/80 p-3 rounded-xl border border-white/[0.04]">
                <span className="text-[#8C9BAE]">Memory Leak Status:</span>
                <strong className="text-emerald-400">{networkData?.admin_system_health?.memory_leak_check}</strong>
              </div>
              <div className="flex justify-between bg-[#06080F]/80 p-3 rounded-xl border border-white/[0.04]">
                <span className="text-[#8C9BAE]">Webhook Uptime:</span>
                <strong className="text-cyan-300">{networkData?.admin_system_health?.webhook_uptime_pct}%</strong>
              </div>
              <div className="flex justify-between bg-[#06080F]/80 p-3 rounded-xl border border-white/[0.04]">
                <span className="text-[#8C9BAE]">API Response Latency:</span>
                <strong className="text-[#F9F6EE] font-serif">{networkData?.admin_system_health?.api_latency_ms} ms</strong>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-b from-[#0B101D]/90 to-[#04060A]/95 border border-[#D4AF37]/25 rounded-2xl p-6 space-y-4 backdrop-blur-xl">
            <h3 className="font-serif text-base font-bold text-[#F9F6EE] flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#D4AF37]" />
              Platform Subscription Distribution
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {Object.entries(networkData?.plan_distribution || {}).map(([plan, count]) => (
                <div key={plan} className="bg-[#06080F]/80 p-3.5 rounded-xl border border-white/[0.04] text-center">
                  <p className="text-[10px] text-[#8C9BAE] uppercase font-semibold">{plan}</p>
                  <p className="font-serif text-xl font-bold text-[#F3E5AB] mt-1">{count} Tenants</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Provision Company Modal */}
      {isNewCompanyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-[#06080F] border border-[#D4AF37]/30 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
            <h3 className="font-serif text-lg font-bold text-[#F9F6EE]">Provision New Company Workspace</h3>
            <form onSubmit={handleCreateCompany} className="space-y-3 text-xs">
              <div>
                <label className="text-[#8C9BAE] font-semibold mb-1 block">Company Name</label>
                <input
                  type="text"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="w-full bg-[#0B101D] border border-white/[0.08] focus:border-[#D4AF37] rounded-lg p-2.5 text-[#F9F6EE] outline-none"
                  placeholder="e.g. Al Habtoor Luxury Real Estate"
                  required
                />
              </div>

              <div>
                <label className="text-[#8C9BAE] font-semibold mb-1 block">Industry / Vertical</label>
                <input
                  type="text"
                  value={newCompanyIndustry}
                  onChange={(e) => setNewCompanyIndustry(e.target.value)}
                  className="w-full bg-[#0B101D] border border-white/[0.08] focus:border-[#D4AF37] rounded-lg p-2.5 text-[#F9F6EE] outline-none"
                />
              </div>

              <div>
                <label className="text-[#8C9BAE] font-semibold mb-1 block">Initial Subscription Plan</label>
                <select
                  value={newCompanyPlan}
                  onChange={(e) => setNewCompanyPlan(e.target.value)}
                  className="w-full bg-[#0B101D] border border-white/[0.08] focus:border-[#D4AF37] rounded-lg p-2.5 text-[#F9F6EE] outline-none"
                >
                  <option value="STARTER">Starter (AED 1,999/mo)</option>
                  <option value="PROFESSIONAL">Professional (AED 4,999/mo)</option>
                  <option value="BUSINESS">Business (AED 9,999/mo)</option>
                  <option value="ENTERPRISE">Enterprise (AED 24,999/mo)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewCompanyOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#0B101D] text-[#8C9BAE] hover:text-[#F9F6EE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] text-[#06080F] font-bold"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
