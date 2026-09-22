"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Crown, 
  DollarSign, 
  Megaphone, 
  Radar, 
  Boxes, 
  TrendingUp, 
  HeartHandshake, 
  Award, 
  FileText, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  RefreshCw,
  Sparkles,
  Users,
  Target,
  BarChart3,
  Calendar,
  Clock,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { api } from "@/lib/api";
import { RevenueEmpireData, EmployeeScorecard, MorningCEOReport } from "@/types";

interface AICompanyCommandCenterProps {
  activeMissionId?: number;
}

export const AICompanyCommandCenter: React.FC<AICompanyCommandCenterProps> = ({ activeMissionId }) => {
  const [data, setData] = useState<RevenueEmpireData | null>(null);
  const [selectedDept, setSelectedDept] = useState<string>("sales");
  const [loading, setLoading] = useState<boolean>(true);
  const [cycling, setCycling] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const fetchEmpireTelemetry = async () => {
    try {
      setLoading(true);
      const res = await api.getCompanyCommandCenter(activeMissionId);
      setData(res);
    } catch (err: any) {
      console.error("Failed to load Revenue Empire telemetry", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpireTelemetry();
  }, [activeMissionId]);

  const handleRunOperatingCycle = async () => {
    try {
      setCycling(true);
      setFeedbackMsg(null);
      const res = await api.runCompanyOperatingCycle(activeMissionId);
      setFeedbackMsg(`Company Operating Cycle executed successfully. ${res.departments_synced.length} departments synchronized!`);
      await fetchEmpireTelemetry();
    } catch (err: any) {
      setFeedbackMsg("Failed to execute operating cycle. Please try again.");
    } finally {
      setCycling(false);
      setTimeout(() => setFeedbackMsg(null), 6000);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Booting AI Company Operating System...</p>
      </div>
    );
  }

  const deptIcons: Record<string, any> = {
    sales: DollarSign,
    marketing: Megaphone,
    lead_gen: Radar,
    product: Boxes,
    finance: TrendingUp,
    customer_success: HeartHandshake,
  };

  const activeDeptData = data?.departments?.[selectedDept as keyof typeof data.departments];

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950/40 border border-amber-500/20 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                Autonomous Revenue Empire v7
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {data?.operating_status || "7 AI Departments Online"}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <Building2 className="w-7 h-7 text-amber-400" />
              {data?.company_name || "Revenue Survival AI Enterprise"}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Fully autonomous AI company operating system with 7 specialized agent departments driving multi-channel revenue acquisition across the UAE & GCC.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRunOperatingCycle}
              disabled={cycling}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold text-sm rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Play className={`w-4 h-4 fill-current ${cycling ? "animate-spin" : ""}`} />
              {cycling ? "Synchronizing Departments..." : "Run Company Operating Cycle"}
            </button>
            <button
              onClick={fetchEmpireTelemetry}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
              title="Refresh Telemetry"
            >
              <RefreshCw className="w-4 h-4" />
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

      {/* High-Level Corporate Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gross Company Revenue</p>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            AED {data?.company_revenue_aed?.toLocaleString() || "0"}
          </p>
          <div className="flex items-center gap-1 mt-1 text-xs text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Net Profit: AED {data?.net_profit_aed?.toLocaleString() || "0"}</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Pipeline Value</p>
            <BarChart3 className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            AED {data?.active_pipeline_aed?.toLocaleString() || "0"}
          </p>
          <div className="flex items-center gap-1 mt-1 text-xs text-amber-400">
            <span>30d Forecast: AED {data?.financial_forecast?.["30_day_forecast_aed"]?.toLocaleString() || "0"}</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Empire Growth Score</p>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-400 mt-2">
            {data?.growth_score || 94.2} / 100
          </p>
          <p className="text-xs text-slate-400 mt-1">Autonomous Execution Index</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Departments</p>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            {data?.total_active_departments || 7} Specialized AI Roles
          </p>
          <p className="text-xs text-emerald-400 mt-1">100% Operational Uptime</p>
        </div>
      </div>

      {/* Autonomous Morning CEO Briefing */}
      {data?.morning_ceo_report && (
        <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">{data.morning_ceo_report.report_title}</h2>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-amber-400" /> {data.morning_ceo_report.date}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-400" /> {data.morning_ceo_report.time_gst}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Yesterday */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span>Yesterday Retrospective</span>
                <span className="text-emerald-400 font-semibold">AED {data.morning_ceo_report.yesterday.revenue_closed_aed.toLocaleString()}</span>
              </p>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {data.morning_ceo_report.yesterday.summary}
              </p>
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {data.morning_ceo_report.yesterday.deals_won_count} Wins
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  {data.morning_ceo_report.yesterday.deals_lost_count} Losses
                </span>
              </div>
            </div>

            {/* Today */}
            <div className="bg-slate-950/60 border border-amber-500/20 rounded-xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center justify-between">
                <span>Today's Target & Actions</span>
                <span className="text-amber-300 font-semibold">AED {data.morning_ceo_report.today.daily_revenue_target_aed.toLocaleString()}</span>
              </p>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {data.morning_ceo_report.today.priority_actions.map((act, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Future */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">
                Future Growth Vectors
              </p>
              <div className="space-y-2">
                {data.morning_ceo_report.future.growth_opportunities.map((opp, i) => (
                  <div key={i} className="text-xs bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <div className="flex justify-between font-medium text-slate-200">
                      <span>{opp.vector}</span>
                      <span className="text-emerald-400 font-semibold">+AED {opp.projected_upside_aed.toLocaleString()}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{opp.timeline}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Department Management & Deep-Dive */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              Specialized AI Department Operations
            </h2>
            <p className="text-xs text-slate-400">
              Interactive departmental control rooms with real-time KPI telemetry and autonomous task execution.
            </p>
          </div>

          {/* Department Selector Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
            {Object.keys(deptIcons).map((deptKey) => {
              const Icon = deptIcons[deptKey];
              const isActive = selectedDept === deptKey;
              return (
                <button
                  key={deptKey}
                  onClick={() => setSelectedDept(deptKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize flex items-center gap-1.5 transition-all ${
                    isActive
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {deptKey.replace("_", " ")}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Department Display */}
        {activeDeptData && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                    {activeDeptData.department}
                  </span>
                  <h3 className="text-base font-bold text-white">{activeDeptData.agent_role}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">Autonomous Status: <span className="text-emerald-400 font-semibold">{activeDeptData.status}</span></p>
              </div>

              {/* Department KPIs */}
              <div className="flex flex-wrap gap-4 text-xs">
                {Object.entries(activeDeptData.kpis || {}).slice(0, 4).map(([kpiKey, val]: any) => (
                  <div key={kpiKey} className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{kpiKey.replace(/_/g, " ")}</p>
                    <p className="text-sm font-bold text-white">
                      {typeof val === "number" ? val.toLocaleString() : val}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Specific Views */}
            {selectedDept === "sales" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-4 h-4" /> Top Closing Targets
                  </h4>
                  <div className="space-y-2">
                    {activeDeptData.top_closing_targets?.map((tgt: any) => (
                      <div key={tgt.lead_id} className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80 space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-white">{tgt.name} ({tgt.company})</span>
                          <span className="text-emerald-400 font-bold">AED {tgt.deal_value_aed.toLocaleString()}</span>
                        </div>
                        <p className="text-[11px] text-slate-300">{tgt.recommended_action}</p>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                          <span>Stage: <strong className="text-slate-200">{tgt.current_stage}</strong></span>
                          <span>Closing Prob: <strong className="text-emerald-400">{tgt.closing_probability_pct}%</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Sales Priorities & Closing Tactics
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {activeDeptData.sales_priorities?.map((pri: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                        <ChevronRight className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>{pri}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {selectedDept === "marketing" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Megaphone className="w-4 h-4" /> Recommended Growth Campaigns
                  </h4>
                  <div className="space-y-2">
                    {activeDeptData.campaign_ideas?.map((camp: any, i: number) => (
                      <div key={i} className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
                        <div className="flex justify-between text-xs font-bold text-white">
                          <span>{camp.campaign_name}</span>
                          <span className="text-emerald-400">AED {camp.projected_revenue_aed.toLocaleString()}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 italic">"{camp.core_hook}"</p>
                        <p className="text-[10px] text-slate-400">Channel: {camp.channel} | Target: {camp.target_audience}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Active Viral Experiments
                  </h4>
                  <div className="space-y-2">
                    {activeDeptData.growth_experiments?.map((exp: any, i: number) => (
                      <div key={i} className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                        <p className="font-semibold text-slate-200">{exp.experiment_name}</p>
                        <p className="text-[11px] text-slate-400">{exp.hypothesis}</p>
                        <div className="flex gap-2 text-[10px] text-amber-300/80 pt-1">
                          <span>A: {exp.variant_a}</span>
                          <span>vs</span>
                          <span>B: {exp.variant_b}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedDept === "lead_gen" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Radar className="w-4 h-4" /> 6 UAE Radar Discovery Sources
                  </h4>
                  <div className="space-y-2">
                    {activeDeptData.sources?.map((src: any) => (
                      <div key={src.source_key} className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-semibold text-white">{src.display_name}</p>
                          <p className="text-[10px] text-slate-400">{src.niche_focus}</p>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold">
                            {src.signals_today} Signals
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5">{src.intent_level}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-4 h-4" /> Active Hunting Directives
                  </h4>
                  <div className="space-y-2">
                    {activeDeptData.hunting_directives?.map((dir: any, i: number) => (
                      <div key={i} className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                        <div className="flex justify-between font-bold text-white">
                          <span>{dir.target_industry}</span>
                          <span className="text-amber-400 text-[10px] uppercase font-bold">{dir.urgency}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">Keywords: {dir.recommended_keywords.join(", ")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedDept === "product" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeDeptData.product_opportunities?.map((prod: any, i: number) => (
                  <div key={i} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-white text-sm">{prod.product_name}</h4>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-semibold uppercase">
                        {prod.readiness_status}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{prod.problem_solved}</p>
                    <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 space-y-1">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Pricing Tiers</p>
                      <div className="flex justify-between text-[11px]">
                        <span>Starter: <strong>AED {prod.pricing_tiers?.starter_setup_aed?.toLocaleString()}</strong></span>
                        <span>Growth: <strong>AED {prod.pricing_tiers?.growth_retainer_aed?.toLocaleString()}/mo</strong></span>
                      </div>
                    </div>
                    <p className="text-emerald-400 font-semibold text-[11px]">
                      Projected MRR: AED {prod.projected_monthly_mrr_aed?.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {selectedDept === "finance" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" /> Financial Dashboard & Unit Economics
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <p className="text-[10px] text-slate-400 uppercase">Gross Revenue</p>
                      <p className="text-sm font-bold text-emerald-400">AED {activeDeptData.financial_dashboard?.gross_revenue_aed?.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <p className="text-[10px] text-slate-400 uppercase">Net Profit</p>
                      <p className="text-sm font-bold text-emerald-400">AED {activeDeptData.financial_dashboard?.net_profit_aed?.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <p className="text-[10px] text-slate-400 uppercase">Operating Expenses</p>
                      <p className="text-sm font-bold text-rose-400">AED {activeDeptData.financial_dashboard?.total_operating_expenses_aed?.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <p className="text-[10px] text-slate-400 uppercase">Profit Margin</p>
                      <p className="text-sm font-bold text-white">{activeDeptData.financial_dashboard?.profit_margin_pct}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4" /> Predictive Revenue Forecast
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <span>30-Day Growth Forecast:</span>
                      <strong className="text-emerald-400">AED {activeDeptData.revenue_forecast?.["30_day_forecast_aed"]?.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <span>60-Day Growth Forecast:</span>
                      <strong className="text-emerald-400">AED {activeDeptData.revenue_forecast?.["60_day_forecast_aed"]?.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <span>90-Day Growth Forecast:</span>
                      <strong className="text-emerald-400">AED {activeDeptData.revenue_forecast?.["90_day_forecast_aed"]?.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedDept === "customer_success" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4" /> Client Retention & Health Monitoring
                  </h4>
                  <div className="space-y-2">
                    {activeDeptData.client_accounts?.map((acc: any, i: number) => (
                      <div key={i} className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                        <div className="flex justify-between font-bold text-white">
                          <span>{acc.client_name}</span>
                          <span className="text-emerald-400">AED {acc.contract_value_aed?.toLocaleString()}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">Upsell: <strong className="text-amber-300">{acc.upsell_opportunity}</strong> (+AED {acc.upsell_value_aed?.toLocaleString()})</p>
                        <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                          <span>Health: <strong className="text-emerald-400">{acc.health_score}/100</strong></span>
                          <span>Rating: <strong className="text-amber-400">{acc.satisfaction_rating} ★</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> Proactive Renewal Reminders & Retainer Expansion
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {activeDeptData.renewal_reminders?.map((rem: string, i: number) => (
                      <li key={i} className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>{rem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Employee Performance Scorecards */}
      {data?.employee_scorecards && data.employee_scorecards.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                AI Employee Performance Scorecards
              </h2>
              <p className="text-xs text-slate-400">
                Automated performance tracking, revenue contribution attribution, and agent efficiency grades.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.employee_scorecards.map((sc: EmployeeScorecard, idx: number) => (
              <div key={idx} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs space-y-3 hover:border-amber-500/40 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-sm">{sc.agent_role}</h4>
                    <p className="text-[10px] text-slate-400">{sc.department}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {sc.grade}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80">
                    <p className="text-[9px] text-slate-400 uppercase">Tasks Done</p>
                    <p className="font-bold text-white">{sc.tasks_completed_today}</p>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80">
                    <p className="text-[9px] text-slate-400 uppercase">Success Rate</p>
                    <p className="font-bold text-emerald-400">{sc.success_rate_pct}%</p>
                  </div>
                </div>

                <div className="text-[11px] bg-slate-900/80 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-[9px] text-slate-400 uppercase">Revenue Attributed: </span>
                  <strong className="text-emerald-400 font-bold">AED {sc.revenue_attributed_aed.toLocaleString()}</strong>
                </div>

                <div className="text-[11px] text-slate-300">
                  <p className="text-[10px] text-amber-400 font-semibold mb-0.5">Top Strength:</p>
                  <p className="italic">{sc.strengths?.[0]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
