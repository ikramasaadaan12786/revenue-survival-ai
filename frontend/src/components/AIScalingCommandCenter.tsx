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
  Coins,
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
        <RefreshCw className="w-8 h-8 text-[#D4AF37] animate-spin" />
        <p className="text-[#8C9BAE] text-xs font-serif uppercase tracking-widest">
          Synthesizing Business Scaling Intelligence...
        </p>
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B101D] via-[#06080F] to-[#04060A] border border-[#D4AF37]/30 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center gap-1.5">
                <Rocket className="w-3.5 h-3.5 text-[#D4AF37]" />
                Autonomous Scaling Engine v8
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {data?.scaling_engine_status || "Online & Expanding"}
              </span>
            </div>
            <h1 className="font-serif text-2xl lg:text-3xl font-bold tracking-tight text-[#F9F6EE] flex items-center gap-2.5">
              <Compass className="w-7 h-7 text-[#D4AF37]" />
              Autonomous AI Business Scaling Center
            </h1>
            <p className="text-xs text-[#8C9BAE] max-w-2xl leading-relaxed">
              Cross-border expansion intelligence, hiring & vendor delegation models, strategic channel partnerships, investor discovery, and viral brand authority engines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRunScaleAnalysis}
              disabled={analyzing}
              className="px-5 py-2.5 bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] hover:opacity-95 text-[#06080F] font-bold text-xs rounded-xl shadow-[0_4px_20px_rgba(212,175,55,0.3)] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 fill-current ${analyzing ? "animate-spin" : ""}`} />
              {analyzing ? "Analyzing Scale Vectors..." : "RUN SCALE ANALYSIS"}
            </button>
            <button
              onClick={fetchScalingTelemetry}
              className="p-2.5 bg-[#06080F] hover:bg-[#0B101D] text-[#8C9BAE] hover:text-[#F9F6EE] rounded-xl border border-white/[0.08] hover:border-[#D4AF37]/30 transition-colors"
              title="Refresh Scaling Intelligence"
            >
              <RefreshCw className="w-4 h-4 text-[#D4AF37]" />
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
        <div className="bg-gradient-to-b from-[#0B101D]/90 to-[#04060A]/95 border border-[#D4AF37]/25 rounded-xl p-5 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold text-[#8C9BAE] uppercase tracking-wider">Company Growth Score</p>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <p className="font-serif text-2xl font-bold text-purple-300 mt-2">
            {data?.company_growth_score || 96.5} / 100
          </p>
          <p className="text-[10px] text-emerald-400 mt-1 font-semibold">Autonomous Scaling Ready</p>
        </div>

        <div className="bg-gradient-to-b from-[#0B101D]/90 to-[#04060A]/95 border border-[#D4AF37]/25 rounded-xl p-5 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold text-[#8C9BAE] uppercase tracking-wider">Expansion TAM Unlocked</p>
            <Globe2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="font-serif text-2xl font-bold text-[#F9F6EE] mt-2">
            AED {data?.market_expansion?.kpis?.total_expansion_tam_aed?.toLocaleString() || "27,250,000"}
          </p>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-400 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{data?.market_expansion?.kpis?.expand_markets_count || 2} Priority Markets (UAE + KSA)</span>
          </div>
        </div>

        <div className="bg-gradient-to-b from-[#0B101D]/90 to-[#04060A]/95 border border-[#D4AF37]/25 rounded-xl p-5 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold text-[#8C9BAE] uppercase tracking-wider">Partner Pipeline</p>
            <Handshake className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <p className="font-serif text-2xl font-bold text-[#F3E5AB] mt-2">
            AED {data?.partnership_intelligence?.kpis?.total_partner_pipeline_aed?.toLocaleString() || "470,000"}
          </p>
          <p className="text-[10px] text-[#C5A059] mt-1">{data?.partnership_intelligence?.kpis?.active_partner_opportunities || 4} Channel Alliances</p>
        </div>

        <div className="bg-gradient-to-b from-[#0B101D]/90 to-[#04060A]/95 border border-[#D4AF37]/25 rounded-xl p-5 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold text-[#8C9BAE] uppercase tracking-wider">Investor Readiness</p>
            <LineChart className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="font-serif text-2xl font-bold text-cyan-300 mt-2">
            {data?.investor_intelligence?.kpis?.funding_readiness_score || 91.5} / 100
          </p>
          <p className="text-[10px] text-[#8C9BAE] mt-1">{data?.investor_intelligence?.kpis?.implied_valuation_range_aed || "AED 25M - 35M"}</p>
        </div>
      </div>

      {/* Top Strategic Directives Bar */}
      {data?.top_scaling_directives && (
        <div className="bg-gradient-to-b from-[#0B101D]/90 to-[#04060A]/95 border border-[#D4AF37]/25 rounded-xl p-4 shadow-sm backdrop-blur-md">
          <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Target className="w-4 h-4" /> Top Autonomous Scaling Directives
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs text-[#CBD5E1]">
            {data.top_scaling_directives.map((dir, i) => (
              <div key={i} className="bg-[#06080F]/80 p-2.5 rounded-lg border border-white/[0.04] flex items-start gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <span>{dir}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Interactive Scaling Tabs Container */}
      <div className="bg-gradient-to-b from-[#0B101D]/90 to-[#04060A]/95 border border-[#D4AF37]/25 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4AF37]/15 pb-4 mb-6">
          <div>
            <h2 className="font-serif text-base font-bold text-[#F9F6EE] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#D4AF37]" />
              Scaling Intelligence Hub
            </h2>
            <p className="text-xs text-[#8C9BAE] mt-0.5">
              Interactive strategic modules for talent, capital, geographic expansion, partnerships, and market defense.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex flex-wrap gap-1.5 bg-[#06080F] p-1.5 rounded-xl border border-white/[0.08]">
            {tabList.map((t) => {
              const Icon = t.icon;
              const isActive = selectedTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTab(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] text-[#06080F] shadow-[0_2px_10px_rgba(212,175,55,0.3)]"
                      : "text-[#8C9BAE] hover:text-[#F9F6EE] hover:bg-white/[0.03]"
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
                  <div key={i} className="bg-[#06080F]/80 border border-white/[0.06] rounded-xl p-4 text-xs space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-[#F9F6EE] text-sm">{m.country}</h4>
                        <p className="text-[10px] text-[#8C9BAE]">{m.region} ({m.currency})</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isExpand ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" :
                        isTest ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" :
                        "bg-slate-800 text-[#8C9BAE]"
                      }`}>
                        {m.recommendation}
                      </span>
                    </div>
                    <p className="text-[#CBD5E1] text-[11px]">{m.expansion_strategy}</p>
                    <div className="bg-[#0B101D] p-2 rounded-lg border border-white/[0.04] space-y-1 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-[#8C9BAE]">Demand Signal:</span>
                        <strong className="text-cyan-300">{m.demand_signal_strength}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8C9BAE]">Projected TAM:</span>
                        <strong className="text-emerald-400 font-serif">AED {m.projected_tam_aed?.toLocaleString()}</strong>
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
              <div className="bg-[#06080F]/80 border border-white/[0.06] rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4" /> AI Hiring & Automation Recommendations
                </h4>
                <div className="space-y-2">
                  {data?.hiring_intelligence?.hiring_recommendations?.map((h: any, i: number) => (
                    <div key={i} className="bg-[#0B101D] p-3 rounded-lg border border-white/[0.04] space-y-1.5 text-xs">
                      <div className="flex justify-between items-start font-semibold text-[#F9F6EE]">
                        <span>{h.role_needed}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#D4AF37]/15 text-[#D4AF37] font-bold uppercase">{h.engagement_type}</span>
                      </div>
                      <p className="text-[11px] text-[#CBD5E1]">{h.reason}</p>
                      <div className="flex justify-between text-[10px] text-[#8C9BAE] pt-1 border-t border-white/[0.04]">
                        <span>Cost: <strong className="text-[#F9F6EE]">AED {h.estimated_monthly_cost_aed?.toLocaleString()}/mo</strong></span>
                        <span>ROI: <strong className="text-emerald-400">{h.expected_roi_multiplier}x</strong></span>
                        <span>Unlock: <strong className="text-emerald-400 font-serif">AED {h.projected_revenue_unlocked_aed?.toLocaleString()}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outsource Packages */}
              <div className="bg-[#06080F]/80 border border-white/[0.06] rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" /> Outsource Packages (Blended Margin: {data?.outsource_intelligence?.kpis?.blended_margin_pct}%)
                </h4>
                <div className="space-y-2">
                  {data?.outsource_intelligence?.outsource_packages?.map((p: any, i: number) => (
                    <div key={i} className="bg-[#0B101D] p-3 rounded-lg border border-white/[0.04] space-y-1.5 text-xs">
                      <div className="flex justify-between items-start font-semibold text-[#F9F6EE]">
                        <span>{p.requirement_name}</span>
                        <span className="text-emerald-400 font-bold">{p.expected_gross_margin_pct}% Margin</span>
                      </div>
                      <p className="text-[11px] text-[#CBD5E1]">{p.project_scope}</p>
                      <div className="flex justify-between text-[10px] text-[#8C9BAE] pt-1 border-t border-white/[0.04]">
                        <span>Budget: <strong className="text-rose-400 font-serif">AED {p.outsource_budget_aed?.toLocaleString()}</strong></span>
                        <span>Billable: <strong className="text-emerald-400 font-serif">AED {p.client_billable_price_aed?.toLocaleString()}</strong></span>
                        <span>Turnaround: <strong className="text-[#F9F6EE]">{p.delivery_timeline_days} Days</strong></span>
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
              <div key={i} className="bg-[#06080F]/80 border border-white/[0.06] rounded-xl p-4 text-xs space-y-2">
                <div className="flex justify-between items-start font-bold text-[#F9F6EE]">
                  <div>
                    <h4 className="text-sm text-[#F3E5AB]">{part.partner_name}</h4>
                    <span className="text-[10px] text-[#8C9BAE] font-normal">{part.partner_type}</span>
                  </div>
                  <span className="text-emerald-400 font-bold font-serif">AED {part.projected_revenue_opportunity_aed?.toLocaleString()}</span>
                </div>
                <p className="text-[#CBD5E1] text-[11px] leading-relaxed">{part.value_exchange}</p>
                <div className="bg-[#0B101D] p-2 rounded-lg border border-white/[0.04] text-[10px] space-y-1">
                  <p className="text-[#8C9BAE]">Deal Structure: <strong className="text-[#F9F6EE]">{part.deal_structure}</strong></p>
                  <p className="text-[#8C9BAE]">Readiness Score: <strong className="text-emerald-400">{part.readiness_score}/100</strong></p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Investor Intelligence */}
        {selectedTab === "investors" && data?.investor_intelligence && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.investor_intelligence.investor_profiles?.map((inv: any, i: number) => (
              <div key={i} className="bg-[#06080F]/80 border border-white/[0.06] rounded-xl p-4 text-xs space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-[#F9F6EE] text-sm">{inv.investor_segment}</h4>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/15 text-purple-300 font-bold uppercase">
                    {inv.readiness_status}
                  </span>
                </div>
                <p className="text-[#CBD5E1] text-[11px]">{inv.investment_thesis_alignment}</p>
                <div className="bg-[#0B101D] p-2 rounded-lg border border-white/[0.04] space-y-1 text-[10px]">
                  <p className="text-[#8C9BAE]">Sample Targets: <strong className="text-[#F9F6EE]">{inv.sample_firms?.join(", ")}</strong></p>
                  <p className="text-[#8C9BAE]">Target Structure: <strong className="text-[#D4AF37]">{inv.target_round_structure}</strong></p>
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
                <div key={i} className="bg-[#06080F]/80 border border-white/[0.06] rounded-xl p-4 text-xs space-y-2">
                  <div className="flex justify-between items-start font-bold text-[#F9F6EE]">
                    <h4 className="text-sm text-[#F9F6EE]">{comp.competitor_name}</h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-[#8C9BAE]">{comp.threat_level}</span>
                  </div>
                  <p className="text-[#8C9BAE] text-[11px]">{comp.core_offering}</p>
                  <div className="bg-[#0B101D] p-2 rounded-lg border border-white/[0.04] space-y-1 text-[10px]">
                    <p className="text-[#8C9BAE]">Typical Pricing: <strong className="text-rose-300">{comp.typical_pricing_aed}</strong></p>
                    <p className="text-[#8C9BAE]">Speed: <strong className="text-[#F9F6EE]">{comp.delivery_speed}</strong></p>
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
              <div key={i} className="bg-[#06080F]/80 border border-white/[0.06] rounded-xl p-4 text-xs space-y-2">
                <div className="flex justify-between items-center font-bold text-[#F9F6EE]">
                  <span className="text-sm text-[#F3E5AB]">{plat.platform}</span>
                  <span className="text-[10px] text-[#8C9BAE]">{plat.posting_cadence}</span>
                </div>
                <p className="text-[#CBD5E1] text-[11px] font-medium">{plat.authority_objective}</p>
                <div className="space-y-1 pt-1 border-t border-white/[0.04] text-[10px] text-[#8C9BAE]">
                  <p className="font-semibold text-[#F9F6EE]">Pillars:</p>
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
              <div key={i} className="bg-[#06080F]/80 border border-white/[0.06] rounded-xl p-4 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D4AF37]/15 text-[#D4AF37] uppercase border border-[#D4AF37]/30">
                    {asset.platform} • {asset.content_type}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">{asset.status}</span>
                </div>
                <h4 className="font-bold text-[#F9F6EE] text-sm">{asset.title}</h4>
                <p className="text-[#CBD5E1] italic text-[11px]">&ldquo;{asset.hook}&rdquo;</p>
                <p className="text-[#8C9BAE] text-[11px] line-clamp-3 whitespace-pre-line">{asset.body}</p>
                <div className="pt-1 border-t border-white/[0.04] text-[10px] text-[#F3E5AB]">
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
            <div className="bg-[#06080F]/80 border border-white/[0.06] rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> Deal Rescue Protocols
              </h4>
              <div className="space-y-2 text-xs">
                {data.sales_automation.deal_rescue_recommendations?.map((res: any, i: number) => (
                  <div key={i} className="bg-[#0B101D] p-3 rounded-lg border border-white/[0.04] space-y-1">
                    <div className="flex justify-between font-bold text-[#F9F6EE]">
                      <span>{res.lead_name}</span>
                      <span className="text-emerald-400 font-serif">AED {res.deal_value_aed?.toLocaleString()}</span>
                    </div>
                    <p className="text-[11px] text-[#8C9BAE]">Bottleneck: {res.current_bottleneck}</p>
                    <p className="text-[11px] text-[#F3E5AB]">Protocol: {res.rescue_protocol}</p>
                    <p className="text-[10px] text-emerald-400 pt-1">Recovery Chance: {res.confidence_of_recovery_pct}%</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Upsell Opportunities */}
            <div className="bg-[#06080F]/80 border border-white/[0.06] rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-4 h-4" /> Account Expansion & Retainers
              </h4>
              <div className="space-y-2 text-xs">
                {data.sales_automation.upsell_opportunities?.map((up: any, i: number) => (
                  <div key={i} className="bg-[#0B101D] p-3 rounded-lg border border-white/[0.04] space-y-1">
                    <div className="flex justify-between font-bold text-[#F9F6EE]">
                      <span>{up.account_name}</span>
                      <span className="text-emerald-400 font-serif">+AED {up.upsell_value_aed?.toLocaleString()}</span>
                    </div>
                    <p className="text-[11px] text-[#CBD5E1]">{up.proposed_expansion}</p>
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
