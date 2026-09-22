"use client";

import React, { useState, useEffect } from "react";
import { 
  Rocket, 
  Globe2, 
  UserPlus, 
  Handshake, 
  LineChart, 
  ShieldAlert, 
  Sparkles, 
  Share2, 
  FileText, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  RefreshCw,
  TrendingUp,
  Target,
  Zap,
  Building2,
  DollarSign,
  Layers,
  ChevronRight,
  Briefcase,
  Users,
  Compass,
  Video,
  MessageSquare
} from "lucide-react";
import { api } from "@/lib/api";
import { ScalingEngineData } from "@/types";

interface AIScalingCommandCenterProps {
  activeMissionId?: number;
}

export const AIScalingCommandCenter: React.FC<AIScalingCommandCenterProps> = ({ activeMissionId }) => {
  const [data, setData] = useState<ScalingEngineData | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("expansion");
  const [loading, setLoading] = useState<boolean>(true);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const fetchScalingTelemetry = async () => {
    try {
      setLoading(true);
      const res = await api.getScalingCommandCenter(activeMissionId);
      setData(res);
    } catch (err: any) {
      console.error("Failed to load Scaling Engine telemetry", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScalingTelemetry();
  }, [activeMissionId]);

  const handleRunScaleAnalysis = async () => {
    try {
      setAnalyzing(true);
      setFeedbackMsg(null);
      const res = await api.runScaleAnalysis(activeMissionId);
      setFeedbackMsg(`Scale Analysis completed! ${res.scaling_intelligence_items_persisted} scaling directives & ${res.content_assets_scheduled} content assets persisted.`);
      await fetchScalingTelemetry();
    } catch (err: any) {
      setFeedbackMsg("Failed to run scale analysis. Please try again.");
    } finally {
      setAnalyzing(false);
      setTimeout(() => setFeedbackMsg(null), 6000);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Synthesizing Business Scaling Intelligence...</p>
      </div>
    );
  }

  const tabList = [
    { id: "expansion", label: "Market Expansion", icon: Globe2 },
    { id: "hiring", label: "Hiring & Outsource", icon: UserPlus },
    { id: "partnerships", label: "Partnerships", icon: Handshake },
    { id: "investors", label: "Investor Intelligence", icon: LineChart },
    { id: "competitors", label: "Competitor Radar", icon: ShieldAlert },
    { id: "brand", label: "Brand & Authority", icon: Share2 },
    { id: "content", label: "Content Factory", icon: FileText },
    { id: "sales_auto", label: "Sales Automation", icon: Zap },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-cyan-950/40 border border-cyan-500/20 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
                <Rocket className="w-3.5 h-3.5 text-cyan-400" />
                Autonomous Scaling Engine v8
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {data?.scaling_engine_status || "Online & Expanding"}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <Compass className="w-7 h-7 text-cyan-400" />
              Autonomous AI Business Scaling Center
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Cross-border expansion intelligence, hiring & vendor delegation models, strategic channel partnerships, investor discovery, and viral brand authority engines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRunScaleAnalysis}
              disabled={analyzing}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Play className={`w-4 h-4 fill-current ${analyzing ? "animate-spin" : ""}`} />
              {analyzing ? "Analyzing Scale Vectors..." : "RUN SCALE ANALYSIS"}
            </button>
            <button
              onClick={fetchScalingTelemetry}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
              title="Refresh Scaling Intelligence"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {feedbackMsg && (
          <div className="mt-4 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}
      </div>

      {/* High-Level Scaling KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Company Growth Score</p>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-cyan-400 mt-2">
            {data?.company_growth_score || 96.5} / 100
          </p>
          <p className="text-xs text-emerald-400 mt-1">Autonomous Scaling Ready</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expansion TAM Unlocked</p>
            <Globe2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            AED {data?.market_expansion?.kpis?.total_expansion_tam_aed?.toLocaleString() || "27,250,000"}
          </p>
          <div className="flex items-center gap-1 mt-1 text-xs text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{data?.market_expansion?.kpis?.expand_markets_count || 2} Priority Markets (UAE + KSA)</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Partner Pipeline</p>
            <Handshake className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            AED {data?.partnership_intelligence?.kpis?.total_partner_pipeline_aed?.toLocaleString() || "470,000"}
          </p>
          <p className="text-xs text-amber-400 mt-1">{data?.partnership_intelligence?.kpis?.active_partner_opportunities || 4} Channel Alliances</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Investor Readiness</p>
            <LineChart className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-400 mt-2">
            {data?.investor_intelligence?.kpis?.funding_readiness_score || 91.5} / 100
          </p>
          <p className="text-xs text-slate-400 mt-1">{data?.investor_intelligence?.kpis?.implied_valuation_range_aed || "AED 25M - 35M"}</p>
        </div>
      </div>

      {/* Top Strategic Directives Bar */}
      {data?.top_scaling_directives && (
        <div className="bg-slate-900/80 border border-cyan-500/20 rounded-xl p-4">
          <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Target className="w-4 h-4" /> Top Autonomous Scaling Directives
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs text-slate-300">
            {data.top_scaling_directives.map((dir, i) => (
              <div key={i} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 flex items-start gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>{dir}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Interactive Scaling Tabs Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Scaling Intelligence Hub
            </h2>
            <p className="text-xs text-slate-400">
              Interactive strategic modules for talent, capital, geographic expansion, partnerships, and market defense.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex flex-wrap gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
            {tabList.map((t) => {
              const Icon = t.icon;
              const isActive = selectedTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTab(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isActive
                      ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab 1: Market Expansion */}
        {selectedTab === "expansion" && data?.market_expansion && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.market_expansion.markets?.map((m: any, i: number) => {
                const isExpand = m.recommendation === "EXPAND";
                const isTest = m.recommendation === "TEST";
                return (
                  <div key={i} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-sm">{m.country}</h4>
                        <p className="text-[10px] text-slate-400">{m.region} ({m.currency})</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isExpand ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                        isTest ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                        "bg-slate-800 text-slate-400"
                      }`}>
                        {m.recommendation}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{m.expansion_strategy}</p>
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80 space-y-1 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Demand Signal:</span>
                        <strong className="text-cyan-300">{m.demand_signal_strength}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Projected TAM:</span>
                        <strong className="text-emerald-400">AED {m.projected_tam_aed?.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Hiring & Outsource */}
        {selectedTab === "hiring" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Hiring Recommendations */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4" /> AI Hiring & Automation Recommendations
                </h4>
                <div className="space-y-2">
                  {data?.hiring_intelligence?.hiring_recommendations?.map((h: any, i: number) => (
                    <div key={i} className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1.5 text-xs">
                      <div className="flex justify-between items-start font-semibold text-white">
                        <span>{h.role_needed}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 font-bold uppercase">{h.engagement_type}</span>
                      </div>
                      <p className="text-[11px] text-slate-300">{h.reason}</p>
                      <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                        <span>Cost: <strong className="text-slate-200">AED {h.estimated_monthly_cost_aed?.toLocaleString()}/mo</strong></span>
                        <span>ROI: <strong className="text-emerald-400">{h.expected_roi_multiplier}x</strong></span>
                        <span>Unlock: <strong className="text-emerald-400">AED {h.projected_revenue_unlocked_aed?.toLocaleString()}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outsource Packages */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" /> Outsource Packages (Blended Margin: {data?.outsource_intelligence?.kpis?.blended_margin_pct}%)
                </h4>
                <div className="space-y-2">
                  {data?.outsource_intelligence?.outsource_packages?.map((p: any, i: number) => (
                    <div key={i} className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1.5 text-xs">
                      <div className="flex justify-between items-start font-semibold text-white">
                        <span>{p.requirement_name}</span>
                        <span className="text-emerald-400 font-bold">{p.expected_gross_margin_pct}% Margin</span>
                      </div>
                      <p className="text-[11px] text-slate-300">{p.project_scope}</p>
                      <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                        <span>Budget: <strong className="text-rose-400">AED {p.outsource_budget_aed?.toLocaleString()}</strong></span>
                        <span>Billable: <strong className="text-emerald-400">AED {p.client_billable_price_aed?.toLocaleString()}</strong></span>
                        <span>Turnaround: <strong className="text-slate-200">{p.delivery_timeline_days} Days</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Partnerships */}
        {selectedTab === "partnerships" && data?.partnership_intelligence && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.partnership_intelligence.partnerships?.map((part: any, i: number) => (
              <div key={i} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
                <div className="flex justify-between items-start font-bold text-white">
                  <div>
                    <h4 className="text-sm text-cyan-300">{part.partner_name}</h4>
                    <span className="text-[10px] text-slate-400 font-normal">{part.partner_type}</span>
                  </div>
                  <span className="text-emerald-400 font-bold">AED {part.projected_revenue_opportunity_aed?.toLocaleString()}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">{part.value_exchange}</p>
                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-[10px] space-y-1">
                  <p className="text-slate-400">Deal Structure: <strong className="text-slate-200">{part.deal_structure}</strong></p>
                  <p className="text-slate-400">Readiness Score: <strong className="text-emerald-400">{part.readiness_score}/100</strong></p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Investor Intelligence */}
        {selectedTab === "investors" && data?.investor_intelligence && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.investor_intelligence.investor_profiles?.map((inv: any, i: number) => (
              <div key={i} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-white text-sm">{inv.investor_segment}</h4>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 font-bold uppercase">
                    {inv.readiness_status}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px]">{inv.investment_thesis_alignment}</p>
                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 space-y-1 text-[10px]">
                  <p className="text-slate-400">Sample Targets: <strong className="text-slate-200">{inv.sample_firms?.join(", ")}</strong></p>
                  <p className="text-slate-400">Target Structure: <strong className="text-purple-300">{inv.target_round_structure}</strong></p>
                </div>
                <p className="text-emerald-400 font-semibold text-[10px]">Suitability: {inv.suitability_score}%</p>
              </div>
            ))}
          </div>
        )}

        {/* Tab 5: Competitor Radar */}
        {selectedTab === "competitors" && data?.competitor_intelligence && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.competitor_intelligence.competitors?.map((comp: any, i: number) => (
                <div key={i} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
                  <div className="flex justify-between items-start font-bold text-white">
                    <h4 className="text-sm text-slate-200">{comp.competitor_name}</h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{comp.threat_level}</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{comp.core_offering}</p>
                  <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 space-y-1 text-[10px]">
                    <p className="text-slate-400">Typical Pricing: <strong className="text-rose-300">{comp.typical_pricing_aed}</strong></p>
                    <p className="text-slate-400">Speed: <strong className="text-slate-200">{comp.delivery_speed}</strong></p>
                  </div>
                  <div className="text-[11px] text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                    <strong>Our Advantage:</strong> {comp.our_competitive_advantage}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Brand & Authority */}
        {selectedTab === "brand" && data?.brand_growth && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.brand_growth.platforms_strategy?.map((plat: any, i: number) => (
              <div key={i} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
                <div className="flex justify-between items-center font-bold text-white">
                  <span className="text-sm text-cyan-300">{plat.platform}</span>
                  <span className="text-[10px] text-slate-400">{plat.posting_cadence}</span>
                </div>
                <p className="text-slate-300 text-[11px] font-medium">{plat.authority_objective}</p>
                <div className="space-y-1 pt-1 border-t border-slate-800 text-[10px] text-slate-400">
                  <p className="font-semibold text-slate-300">Pillars:</p>
                  {plat.content_pillars?.map((p: string, idx: number) => (
                    <p key={idx} className="truncate">• {p}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 7: Content Factory */}
        {selectedTab === "content" && data?.content_pipeline && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.content_pipeline.daily_assets?.map((asset: any, i: number) => (
              <div key={i} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 uppercase">
                    {asset.platform} • {asset.content_type}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">{asset.status}</span>
                </div>
                <h4 className="font-bold text-white text-sm">{asset.title}</h4>
                <p className="text-slate-300 italic text-[11px]">"{asset.hook}"</p>
                <p className="text-slate-400 text-[11px] line-clamp-3 whitespace-pre-line">{asset.body}</p>
                <div className="pt-1 border-t border-slate-800 text-[10px] text-amber-300">
                  <strong>CTA:</strong> {asset.call_to_action}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 8: Sales Automation */}
        {selectedTab === "sales_auto" && data?.sales_automation && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Deal Rescue Recommendations */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> Deal Rescue Protocols
              </h4>
              <div className="space-y-2 text-xs">
                {data.sales_automation.deal_rescue_recommendations?.map((res: any, i: number) => (
                  <div key={i} className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
                    <div className="flex justify-between font-bold text-white">
                      <span>{res.lead_name}</span>
                      <span className="text-emerald-400">AED {res.deal_value_aed?.toLocaleString()}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Bottleneck: {res.current_bottleneck}</p>
                    <p className="text-[11px] text-cyan-300">Protocol: {res.rescue_protocol}</p>
                    <p className="text-[10px] text-emerald-400 pt-1">Recovery Chance: {res.confidence_of_recovery_pct}%</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Upsell Opportunities */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" /> Account Expansion & Retainers
              </h4>
              <div className="space-y-2 text-xs">
                {data.sales_automation.upsell_opportunities?.map((up: any, i: number) => (
                  <div key={i} className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
                    <div className="flex justify-between font-bold text-white">
                      <span>{up.account_name}</span>
                      <span className="text-emerald-400">+AED {up.upsell_value_aed?.toLocaleString()}</span>
                    </div>
                    <p className="text-[11px] text-slate-300">{up.proposed_expansion}</p>
                    <span className="text-[10px] text-cyan-400 font-semibold">{up.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
