"use client";

import React, { useState, useEffect } from "react";
import { 
  Radio, 
  Sparkles, 
  Search, 
  TrendingUp, 
  Globe, 
  Compass,
  ArrowRight,
  ShieldAlert,
  Layers,
  Send,
  PlusCircle,
  Database,
  RefreshCw,
  MessageSquare,
  Flame,
  CheckCircle2,
  Cpu,
  Activity,
  Zap,
  Check,
  Server
} from "lucide-react";
import { Opportunity, MarketSignal, RevenueOpportunity, ConnectorHealth, BridgeSyncResult } from "@/types";
import { api } from "@/lib/api";
import RevenueCopilotModal from "./RevenueCopilotModal";

interface Props {
  missionId: number;
  onRefreshSummary: () => void;
}

export default function OpportunityRadarView({ missionId, onRefreshSummary }: Props) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [revenueOpportunities, setRevenueOpportunities] = useState<RevenueOpportunity[]>([]);
  const [signals, setSignals] = useState<MarketSignal[]>([]);
  const [breakdown, setBreakdown] = useState<Record<string, number>>({});
  const [connectorHealth, setConnectorHealth] = useState<ConnectorHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [hunting, setHunting] = useState(false);
  const [syncingBridge, setSyncingBridge] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>("ALL");
  const [bridgeSyncResult, setBridgeSyncResult] = useState<BridgeSyncResult | null>(null);

  // Revenue Copilot State
  const [copilotOpportunity, setCopilotOpportunity] = useState<any>(null);
  const [showCopilotModal, setShowCopilotModal] = useState(false);

  // Ingest custom signal modal
  const [showIngestModal, setShowIngestModal] = useState(false);
  const [customText, setCustomText] = useState("");
  const [customSource, setCustomSource] = useState("TELEGRAM");
  const [customLeadName, setCustomLeadName] = useState("");
  const [customChannel, setCustomChannel] = useState("WhatsApp");
  const [ingesting, setIngesting] = useState(false);

  const fetchOppsAndSignals = async () => {
    try {
      setLoading(true);
      const [oppsData, revOppsData, signalsData, healthData] = await Promise.all([
        api.getOpportunities(missionId).catch(() => []),
        api.getRevenueOpportunities(missionId).catch(() => []),
        api.getSignals(missionId, selectedSource === "ALL" ? undefined : selectedSource).catch(() => ({ signals: [], breakdown: {} })),
        api.getConnectorHealth().catch(() => [])
      ]);
      setOpportunities(oppsData);
      setRevenueOpportunities(revOppsData || []);
      setSignals(signalsData.signals || []);
      setBreakdown(signalsData.breakdown || {});
      setConnectorHealth(healthData || []);
    } catch (err) {
      console.error("Failed to load opportunities & signals", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOppsAndSignals();
  }, [missionId, selectedSource]);

  const handleSyncBuyerRadar = async () => {
    try {
      setSyncingBridge(true);
      const res = await api.syncBuyerRadarBridge(missionId);
      setBridgeSyncResult(res);
      await fetchOppsAndSignals();
      onRefreshSummary();
    } catch (err) {
      console.error("Failed syncing UAE Buyer Radar bridge", err);
    } finally {
      setSyncingBridge(false);
    }
  };

  const handleRunHunter = async () => {
    try {
      setHunting(true);
      await api.huntOpportunities(missionId);
      await fetchOppsAndSignals();
      onRefreshSummary();
    } catch (err) {
      console.error("Failed hunting opportunities", err);
    } finally {
      setHunting(false);
    }
  };

  const handleIngestCustomSignal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    try {
      setIngesting(true);
      await api.ingestSignal({
        mission_id: missionId,
        source: customSource,
        signal_text: customText,
        lead_name: customLeadName || undefined,
        country: "United Arab Emirates",
        channel: customChannel
      });
      setCustomText("");
      setCustomLeadName("");
      setShowIngestModal(false);
      await fetchOppsAndSignals();
      onRefreshSummary();
    } catch (err) {
      console.error("Failed ingesting custom signal", err);
    } finally {
      setIngesting(false);
    }
  };

  const getIntentBadge = (intent: string) => {
    switch (intent) {
      case "Hot":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 border border-rose-500/30 text-rose-300">HOT INTENT</span>;
      case "Qualified":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">QUALIFIED</span>;
      case "Warm":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">WARM</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 border border-white/[0.06] text-[#8C9BAE]">COLD</span>;
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header & Quick Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#0B101D] via-[#06080F] to-[#04060A] border border-[#D4AF37]/30 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#F3E5AB]/20 via-[#D4AF37]/10 to-transparent border border-[#D4AF37]/40 text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-[#F9F6EE] tracking-tight flex items-center gap-2">
              UAE Buyer Radar AI & Sovereign Connectors
            </h2>
            <p className="text-xs text-[#8C9BAE] mt-0.5">
              Telegram MTProto • LinkedIn • Instagram • Reddit • YouTube • Global Financial Web Search
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowIngestModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#06080F] hover:bg-[#0B101D] text-[#CBD5E1] border border-white/[0.08] hover:border-[#D4AF37]/30 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
            Ingest Signal
          </button>

          <button
            onClick={handleSyncBuyerRadar}
            disabled={syncingBridge}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] text-[#06080F] shadow-[0_2px_15px_rgba(212,175,55,0.3)] transition-all disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 fill-current ${syncingBridge ? "animate-spin" : ""}`} />
            {syncingBridge ? "SYNCING RADAR..." : "SYNC UAE BUYER RADAR"}
          </button>
        </div>
      </div>

      {/* Bridge Sync Result Notification Banner */}
      {bridgeSyncResult && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              UAE Buyer Radar Live Sync Completed
            </span>
            <span className="text-[#8C9BAE]">{bridgeSyncResult.timestamp}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[#CBD5E1] pt-1">
            <div className="bg-[#06080F]/80 p-2.5 rounded-lg border border-white/[0.05]">
              <div className="text-[10px] text-[#8C9BAE]">Telegram Signals</div>
              <div className="text-sm font-bold text-cyan-400">{bridgeSyncResult.source_breakdown?.telegram || 0} Imported</div>
            </div>
            <div className="bg-[#06080F]/80 p-2.5 rounded-lg border border-white/[0.05]">
              <div className="text-[10px] text-[#8C9BAE]">LinkedIn Signals</div>
              <div className="text-sm font-bold text-cyan-400">{bridgeSyncResult.source_breakdown?.linkedin || 0} Imported</div>
            </div>
            <div className="bg-[#06080F]/80 p-2.5 rounded-lg border border-white/[0.05]">
              <div className="text-[10px] text-[#8C9BAE]">Instagram Signals</div>
              <div className="text-sm font-bold text-cyan-400">{bridgeSyncResult.source_breakdown?.instagram || 0} Imported</div>
            </div>
            <div className="bg-[#06080F]/80 p-2.5 rounded-lg border border-white/[0.05]">
              <div className="text-[10px] text-[#8C9BAE]">Total Opportunities Created</div>
              <div className="text-sm font-bold text-emerald-400">+{bridgeSyncResult.opportunities_created} CRM Leads</div>
            </div>
          </div>
        </div>
      )}

      {/* CONNECTOR HEALTH DASHBOARD */}
      <div className="rounded-2xl border border-[#D4AF37]/25 bg-gradient-to-b from-[#0B101D]/90 to-[#04060A]/95 p-6 space-y-4 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between border-b border-[#D4AF37]/15 pb-3">
          <div className="flex items-center gap-2.5">
            <Server className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="font-serif text-sm font-bold text-[#F9F6EE] uppercase tracking-wider">
              Connector Health Matrix
            </h3>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            6/6 Connectors Synchronized
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[#8C9BAE] border-b border-white/[0.06] bg-[#06080F]/60 text-[9px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Source</th>
                <th className="py-2.5 px-3">Protocol / Scope</th>
                <th className="py-2.5 px-3">Signals Today</th>
                <th className="py-2.5 px-3">Last Sync</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Errors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {connectorHealth.map((conn) => (
                <tr key={conn.connector_id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3 font-bold text-[#F9F6EE] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {conn.source}
                  </td>
                  <td className="py-3 px-3 text-[#CBD5E1]">{conn.protocol}</td>
                  <td className="py-3 px-3 text-cyan-300 font-bold">{conn.signals_found_today}</td>
                  <td className="py-3 px-3 text-[#8C9BAE] text-[11px]">{conn.last_sync}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {conn.status} ({conn.latency_ms}ms)
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#8C9BAE]">{conn.errors}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Data Acquisition Connectors Panel */}
      <div className="rounded-2xl border border-[#D4AF37]/25 bg-gradient-to-b from-[#0B101D]/90 to-[#04060A]/95 p-6 space-y-5 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D4AF37]/15 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center">
              <Database className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-[#F9F6EE] flex items-center gap-2">
                Normalized Live Signals Feed
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                  {signals.length} Signals Captured
                </span>
              </h3>
              <p className="text-xs text-[#8C9BAE] mt-0.5">
                Ingesting Telegram MTProto, LinkedIn, Instagram, Reddit, YouTube & Web Search
              </p>
            </div>
          </div>

          {/* Filter Source Pills */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            {["ALL", "TELEGRAM", "LINKEDIN", "INSTAGRAM", "REDDIT", "YOUTUBE", "WEB_SEARCH"].map((src) => (
              <button
                key={src}
                onClick={() => setSelectedSource(src)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                  selectedSource === src
                    ? "bg-[#D4AF37] text-[#06080F] font-bold shadow-sm"
                    : "bg-[#06080F] text-[#8C9BAE] hover:text-[#F9F6EE] border border-white/[0.04]"
                }`}
              >
                {src.replace("_", " ")} {breakdown[src] ? `(${breakdown[src]})` : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Signals Stream */}
        {signals.length === 0 ? (
          <div className="py-8 text-center text-[#8C9BAE] text-xs">
            No signals acquired for selected source. Click &ldquo;Sync UAE Buyer Radar&rdquo; to fetch live data.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[340px] overflow-y-auto pr-1">
            {signals.map((sig) => (
              <div
                key={sig.id}
                className="bg-[#06080F]/80 border border-white/[0.04] hover:border-[#D4AF37]/30 p-3.5 rounded-xl space-y-2.5 transition-all flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0B101D] text-[#D4AF37] border border-[#D4AF37]/20">
                      {sig.source}
                    </span>
                    {getIntentBadge(sig.intent_score)}
                  </div>
                  <p className="text-xs text-[#CBD5E1] leading-relaxed line-clamp-3">
                    &ldquo;{sig.signal_text}&rdquo;
                  </p>
                </div>

                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-[#8C9BAE]">
                  <span className="truncate max-w-[130px] text-[#F9F6EE]">{sig.lead_name || "Anonymous Lead"}</span>
                  <span className="text-cyan-400">{sig.channel}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scored Revenue Opportunities Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif text-base font-bold text-[#F9F6EE] flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              Scored Revenue Opportunities & Buying Signals ({revenueOpportunities.length})
            </h3>
            <p className="text-xs text-[#8C9BAE]">
              Intent Scoring Engine • Urgency Evaluation • Closing Probability Model
            </p>
          </div>

          <button
            onClick={handleRunHunter}
            disabled={hunting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] text-[#06080F] shadow-[0_2px_15px_rgba(212,175,55,0.3)] transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 fill-[#06080F] ${hunting ? "animate-spin" : ""}`} />
            {hunting ? "DISCOVERING..." : "RUN OPPORTUNITY HUNTER"}
          </button>
        </div>

        {revenueOpportunities.length === 0 && !loading ? (
          <div className="p-10 text-center text-[#8C9BAE] space-y-3 bg-[#0B101D] rounded-2xl border border-[#D4AF37]/20">
            <p>No revenue opportunities scored yet for this mission.</p>
            <button
              onClick={handleRunHunter}
              disabled={hunting}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#D4AF37] text-[#06080F]"
            >
              Scan Live Connectors Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {revenueOpportunities.map((ro) => {
              const priority = ro.priority || "HOT";
              const priorityBadge = priority === "HOT"
                ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                : priority === "QUALIFIED"
                ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                : priority === "WARM"
                ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                : "bg-slate-800 text-[#8C9BAE] border-white/[0.06]";

              return (
                <div key={ro.id} className="p-6 flex flex-col justify-between space-y-4 rounded-2xl bg-gradient-to-b from-[#0B101D]/90 to-[#04060A]/95 border border-[#D4AF37]/25 shadow-md hover:border-[#D4AF37]/50 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] uppercase">
                        {ro.industry}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${priorityBadge}`}>
                        {priority === "HOT" && <Flame className="w-3 h-3 animate-pulse" />}
                        {priority} OPPORTUNITY
                      </span>
                    </div>

                    <div>
                      <h4 className="font-serif text-base font-bold text-[#F9F6EE] leading-snug">
                        {ro.name} {ro.company ? `• ${ro.company}` : ""}
                      </h4>
                      <p className="text-xs text-[#CBD5E1] mt-2 leading-relaxed">
                        <strong className="text-[#8C9BAE] font-normal">Requirement Signal:</strong> {ro.requirement}
                      </p>
                    </div>

                    <div className="bg-[#06080F]/80 p-3.5 rounded-xl border border-white/[0.04] text-xs space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[#8C9BAE]">Estimated Deal Value:</span>
                        <span className="text-emerald-400 font-bold font-serif text-sm">
                          {Number(ro.estimated_value).toLocaleString()} AED
                        </span>
                      </div>

                      {/* Intent & Urgency Score meters */}
                      <div className="space-y-1.5 pt-1 border-t border-white/[0.04]">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-[#8C9BAE]">Intent Score:</span>
                          <span className="text-cyan-400 font-bold">{ro.intent_score ?? 90}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                            style={{ width: `${ro.intent_score ?? 90}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-[11px] pt-1">
                          <span className="text-[#8C9BAE]">Urgency Score:</span>
                          <span className="text-amber-400 font-bold">{ro.urgency_score ?? 85}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500"
                            style={{ width: `${ro.urgency_score ?? 85}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-[11px] pt-1">
                          <span className="text-[#8C9BAE]">Closing Probability:</span>
                          <span className="text-emerald-400 font-bold">
                            {ro.closing_probability ? `${Math.round(ro.closing_probability * 100)}%` : `${ro.conversion_score ?? 85}%`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between">
                      <div className="text-[11px] text-[#8C9BAE] flex items-center gap-1">
                        <span>Source: <strong className="text-cyan-400 font-medium">{ro.source}</strong></span>
                      </div>
                      <button
                        onClick={() => {
                          setCopilotOpportunity(ro);
                          setShowCopilotModal(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-semibold transition-all shadow-sm"
                      >
                        <Cpu className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Revenue Copilot</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Discovered Opportunities Section */}
      <div className="space-y-4 pt-4 border-t border-white/[0.06]">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-base font-bold text-[#F9F6EE] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            Synthesized Monetization Plays ({opportunities.length})
          </h3>
          <span className="text-xs text-[#8C9BAE]">
            Browser Research & Opportunity Hunter Output
          </span>
        </div>

        {opportunities.length === 0 && !loading ? (
          <div className="p-8 text-center text-[#8C9BAE] bg-[#0B101D] rounded-2xl border border-white/[0.06]">
            <p>No market opportunities synthesized yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {opportunities.map((opp) => (
              <div key={opp.id} className="p-6 flex flex-col justify-between space-y-4 rounded-2xl bg-gradient-to-b from-[#0B101D]/90 to-[#04060A]/95 border border-[#D4AF37]/25 hover:border-[#D4AF37]/50 transition-all shadow-md">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] uppercase">
                      {opp.market}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                      {opp.confidence_score}% Conviction
                    </div>
                  </div>

                  <div>
                    <h3 className="font-serif text-base font-bold text-[#F9F6EE] leading-snug">
                      {opp.offer_idea}
                    </h3>
                    <p className="text-xs text-[#CBD5E1] mt-2 line-clamp-3">
                      <strong className="text-[#8C9BAE] font-normal">Pain Point:</strong> {opp.problem}
                    </p>
                  </div>

                  <div className="bg-[#06080F]/80 p-3 rounded-xl border border-white/[0.04] text-xs space-y-1.5">
                    <div className="text-[#8C9BAE]">Target Segment: <strong className="text-[#F9F6EE]">{opp.target_customer}</strong></div>
                    <div className="text-[#8C9BAE]">Price Estimate: <strong className="text-[#F3E5AB] font-serif">{opp.price_estimate} AED</strong></div>
                    <div className="text-[#8C9BAE]">Fulfillment Difficulty: <strong className="text-emerald-400">{opp.difficulty}</strong></div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between">
                  <span className="text-[11px] text-[#8C9BAE]">Status: {opp.status}</span>
                  <button
                    onClick={() => {
                      setCopilotOpportunity({
                        id: opp.id,
                        name: opp.offer_idea,
                        company: opp.target_customer,
                        industry: opp.market,
                        requirement: opp.problem,
                        estimated_value: opp.price_estimate || 3500
                      });
                      setShowCopilotModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-semibold transition-all"
                  >
                    <Cpu className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Revenue Copilot</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Revenue Copilot Drawer/Modal */}
      <RevenueCopilotModal
        isOpen={showCopilotModal}
        onClose={() => setShowCopilotModal(false)}
        opportunity={copilotOpportunity}
        onOfferStaged={() => {
          onRefreshSummary();
          fetchOppsAndSignals();
        }}
      />

      {/* Manual Signal Ingestion Modal */}
      {showIngestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="p-6 max-w-lg w-full bg-[#06080F] border border-[#D4AF37]/30 rounded-2xl space-y-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/15 pb-3">
              <h3 className="font-serif text-base font-bold text-[#F9F6EE] flex items-center gap-2">
                <Database className="w-4 h-4 text-[#D4AF37]" />
                Ingest Real Market Signal
              </h3>
              <button
                onClick={() => setShowIngestModal(false)}
                className="text-[#8C9BAE] hover:text-white text-xs"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleIngestCustomSignal} className="space-y-3.5">
              <div>
                <label className="block text-xs text-[#8C9BAE] mb-1 font-semibold">Source Connector</label>
                <select
                  value={customSource}
                  onChange={(e) => setCustomSource(e.target.value)}
                  className="w-full bg-[#0B101D] border border-white/[0.08] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-[#F9F6EE] outline-none"
                >
                  <option value="TELEGRAM">Telegram VIP Signals</option>
                  <option value="BUYER_RADAR">UAE Buyer Radar</option>
                  <option value="REDDIT">Reddit (r/dubai)</option>
                  <option value="YOUTUBE">YouTube Commentary</option>
                  <option value="LINKEDIN">LinkedIn Public Intent</option>
                  <option value="CUSTOM">Custom Source</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#8C9BAE] mb-1 font-semibold">Raw Signal / Inquiry Text</label>
                <textarea
                  required
                  rows={3}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="e.g. Seeking distress 2BR in Business Bay under 1.6M AED liquid cash ready..."
                  className="w-full bg-[#0B101D] border border-white/[0.08] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-[#F9F6EE] outline-none placeholder:text-[#64748B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#8C9BAE] mb-1 font-semibold">Lead Name (Optional)</label>
                  <input
                    type="text"
                    value={customLeadName}
                    onChange={(e) => setCustomLeadName(e.target.value)}
                    placeholder="e.g. Hamdan Al-Maktoum"
                    className="w-full bg-[#0B101D] border border-white/[0.08] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-[#F9F6EE] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8C9BAE] mb-1 font-semibold">Preferred Channel</label>
                  <select
                    value={customChannel}
                    onChange={(e) => setCustomChannel(e.target.value)}
                    className="w-full bg-[#0B101D] border border-white/[0.08] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-[#F9F6EE] outline-none"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Telegram">Telegram</option>
                    <option value="Email">Email</option>
                    <option value="LinkedIn">LinkedIn</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowIngestModal(false)}
                  className="px-4 py-2 rounded-xl text-xs bg-[#0B101D] text-[#8C9BAE] hover:text-[#F9F6EE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ingesting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] text-[#06080F] disabled:opacity-50"
                >
                  {ingesting ? "Ingesting..." : "Ingest & Auto-Score Intent"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
