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
  CheckCircle2
} from "lucide-react";
import { Opportunity, MarketSignal, RevenueOpportunity } from "@/types";
import { api } from "@/lib/api";

interface Props {
  missionId: number;
  onRefreshSummary: () => void;
}

export default function OpportunityRadarView({ missionId, onRefreshSummary }: Props) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [revenueOpportunities, setRevenueOpportunities] = useState<RevenueOpportunity[]>([]);
  const [signals, setSignals] = useState<MarketSignal[]>([]);
  const [breakdown, setBreakdown] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [hunting, setHunting] = useState(false);
  const [scanningConnectors, setScanningConnectors] = useState(false);
  const [runningBrowserAgent, setRunningBrowserAgent] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>("ALL");

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
      const [oppsData, revOppsData, signalsData] = await Promise.all([
        api.getOpportunities(missionId).catch(() => []),
        api.getRevenueOpportunities(missionId).catch(() => []),
        api.getSignals(missionId, selectedSource === "ALL" ? undefined : selectedSource).catch(() => ({ signals: [], breakdown: {} }))
      ]);
      setOpportunities(oppsData);
      setRevenueOpportunities(revOppsData || []);
      setSignals(signalsData.signals || []);
      setBreakdown(signalsData.breakdown || {});
    } catch (err) {
      console.error("Failed to load opportunities & signals", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOppsAndSignals();
  }, [missionId, selectedSource]);

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

  const handleScanConnectors = async () => {
    try {
      setScanningConnectors(true);
      await api.scanAllConnectors(missionId);
      await fetchOppsAndSignals();
      onRefreshSummary();
    } catch (err) {
      console.error("Failed scanning connectors", err);
    } finally {
      setScanningConnectors(false);
    }
  };

  const handleRunBrowserResearch = async () => {
    try {
      setRunningBrowserAgent(true);
      await api.triggerBrowserResearch(missionId);
      await fetchOppsAndSignals();
      onRefreshSummary();
    } catch (err) {
      console.error("Failed triggering browser research", err);
    } finally {
      setRunningBrowserAgent(false);
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
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 border border-rose-500/40 text-rose-300">HOT INTENT</span>;
      case "Qualified":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">QUALIFIED</span>;
      case "Warm":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">WARM</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/20 border border-slate-500/40 text-slate-400">COLD</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Quick Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            Market Radar & Live Data Acquisition Layer
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Autonomous multi-source ingestion • Intent qualification • Browser research synthesis
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowIngestModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
            Ingest Signal
          </button>

          <button
            onClick={async () => {
              try {
                setScanningConnectors(true);
                await api.pollLiveConnectors(missionId);
                await fetchOppsAndSignals();
                onRefreshSummary();
              } catch (e) {
                console.error(e);
              } finally {
                setScanningConnectors(false);
              }
            }}
            disabled={scanningConnectors}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-mono transition-all disabled:opacity-50"
          >
            <Radio className={`w-3.5 h-3.5 text-emerald-400 ${scanningConnectors ? "animate-spin" : "animate-pulse"}`} />
            {scanningConnectors ? "Polling Live..." : "Poll Live Feeds"}
          </button>

          <button
            onClick={async () => {
              try {
                setRunningBrowserAgent(true);
                await api.scanPlaywrightMarket(missionId);
                await fetchOppsAndSignals();
                onRefreshSummary();
              } catch (e) {
                console.error(e);
              } finally {
                setRunningBrowserAgent(false);
              }
            }}
            disabled={runningBrowserAgent}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-black shadow-glow font-mono transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 fill-black ${runningBrowserAgent ? "animate-spin" : ""}`} />
            {runningBrowserAgent ? "Scanning Portals..." : "Playwright Portal Scan"}
          </button>
        </div>
      </div>

      {/* Live Data Acquisition Connectors Panel */}
      <div className="glass-panel p-6 border border-cyan-500/20 bg-[#090d16]/90 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
              <Database className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Live Data Acquisition Connectors
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {signals.length} Signals Captured
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Ingesting UAE Buyer Radar, Telegram VIP, Reddit r/dubai, YouTube Commentary & LinkedIn
              </p>
            </div>
          </div>

          {/* Filter Source Pills */}
          <div className="flex flex-wrap gap-1.5 font-mono text-xs">
            {["ALL", "BUYER_RADAR", "TELEGRAM", "REDDIT", "YOUTUBE", "LINKEDIN"].map((src) => (
              <button
                key={src}
                onClick={() => setSelectedSource(src)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  selectedSource === src
                    ? "bg-cyan-500 text-black font-bold shadow-sm"
                    : "bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-white/[0.05]"
                }`}
              >
                {src.replace("_", " ")} {breakdown[src] ? `(${breakdown[src]})` : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Signals Stream */}
        {signals.length === 0 ? (
          <div className="py-8 text-center text-slate-500 font-mono text-xs">
            No signals acquired for selected source. Click "Scan 5 Connectors" to fetch live data.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[340px] overflow-y-auto pr-1">
            {signals.map((sig) => (
              <div
                key={sig.id}
                className="bg-slate-900/60 border border-white/[0.06] hover:border-cyan-500/30 p-3.5 rounded-xl space-y-2.5 transition-all flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-cyan-500/20">
                      {sig.source}
                    </span>
                    {getIntentBadge(sig.intent_score)}
                  </div>
                  <p className="text-xs text-slate-200 font-sans leading-relaxed line-clamp-3">
                    "{sig.signal_text}"
                  </p>
                </div>

                <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="truncate max-w-[130px] text-slate-300">{sig.lead_name || "Anonymous Lead"}</span>
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
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" />
              Scored Revenue Opportunities & Buying Signals ({revenueOpportunities.length})
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Intent Scoring Engine • Urgency Evaluation • Closing Probability Model
            </p>
          </div>

          <button
            onClick={handleRunHunter}
            disabled={hunting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-mono bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-glow transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 fill-black ${hunting ? "animate-spin" : ""}`} />
            {hunting ? "DISCOVERING..." : "RUN OPPORTUNITY HUNTER"}
          </button>
        </div>

        {revenueOpportunities.length === 0 && !loading ? (
          <div className="glass-panel p-10 text-center text-slate-400 space-y-3">
            <p>No revenue opportunities scored yet for this mission.</p>
            <button
              onClick={handleRunHunter}
              disabled={hunting}
              className="px-4 py-2 rounded-xl text-xs font-bold font-mono bg-cyan-400 text-black shadow-glow hover:bg-cyan-300 transition-all"
            >
              Scan Live Connectors Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {revenueOpportunities.map((ro) => {
              const priority = ro.priority || "HOT";
              const priorityBadge = priority === "HOT"
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                : priority === "QUALIFIED"
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                : priority === "WARM"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-slate-700/30 text-slate-400 border-slate-600/40";

              return (
                <div key={ro.id} className="glass-panel p-6 glass-panel-hover flex flex-col justify-between space-y-4 border border-white/[0.08]">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 uppercase">
                        {ro.industry}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${priorityBadge}`}>
                        {priority === "HOT" && <Flame className="w-3 h-3 animate-pulse" />}
                        {priority} OPPORTUNITY
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white leading-snug">
                        {ro.name} {ro.company ? `• ${ro.company}` : ""}
                      </h4>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                        <strong className="text-slate-400 font-normal">Requirement Signal:</strong> {ro.requirement}
                      </p>
                    </div>

                    <div className="bg-slate-950/70 p-3.5 rounded-xl border border-white/[0.06] text-xs space-y-2.5 font-mono">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Estimated Deal Value:</span>
                        <span className="text-emerald-400 font-bold text-sm">
                          {Number(ro.estimated_value).toLocaleString()} AED
                        </span>
                      </div>

                      {/* Intent & Urgency Score meters */}
                      <div className="space-y-1.5 pt-1 border-t border-white/[0.05]">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Intent Score:</span>
                          <span className="text-cyan-400 font-bold">{ro.intent_score ?? 90}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                            style={{ width: `${ro.intent_score ?? 90}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-[11px] pt-1">
                          <span className="text-slate-400">Urgency Score:</span>
                          <span className="text-amber-400 font-bold">{ro.urgency_score ?? 85}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500"
                            style={{ width: `${ro.urgency_score ?? 85}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-[11px] pt-1">
                          <span className="text-slate-400">Closing Probability:</span>
                          <span className="text-emerald-400 font-bold">
                            {ro.closing_probability ? `${Math.round(ro.closing_probability * 100)}%` : `${ro.conversion_score ?? 85}%`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-1">
                      <span>Source: <strong className="text-cyan-400 font-medium">{ro.source}</strong></span>
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        CRM Ingested & Staged
                      </span>
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
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Synthesized Monetization Plays ({opportunities.length})
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Browser Research & Opportunity Hunter Output
          </span>
        </div>

        {opportunities.length === 0 && !loading ? (
          <div className="glass-panel p-8 text-center text-slate-400">
            <p>No market opportunities synthesized yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {opportunities.map((opp) => (
              <div key={opp.id} className="glass-panel p-6 glass-panel-hover flex flex-col justify-between space-y-4 border border-white/[0.08]">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 uppercase">
                      {opp.market}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      {opp.confidence_score}% Conviction
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white leading-snug">
                      {opp.offer_idea}
                    </h3>
                    <p className="text-xs text-slate-300 mt-2 line-clamp-3">
                      <strong className="text-slate-400 font-normal">Pain Point:</strong> {opp.problem}
                    </p>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-white/[0.05] text-xs space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Target Buyer:</span>
                      <span className="text-slate-200 font-medium">{opp.target_customer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Price Estimate:</span>
                      <span className="text-cyan-400 font-bold">{opp.price_estimate} AED</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Fulfillment Difficulty:</span>
                      <span className="text-emerald-400 font-semibold">{opp.difficulty}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">Status: {opp.status}</span>
                  <span className="text-xs font-mono font-medium text-cyan-400 flex items-center gap-1">
                    Ready for Offer Studio <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Signal Ingestion Modal */}
      {showIngestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel p-6 max-w-lg w-full border border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                Ingest Real Market Signal
              </h3>
              <button
                onClick={() => setShowIngestModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleIngestCustomSignal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Source Connector</label>
                <select
                  value={customSource}
                  onChange={(e) => setCustomSource(e.target.value)}
                  className="w-full bg-slate-900 border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:border-cyan-400 outline-none"
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
                <label className="block text-xs font-mono text-slate-300 mb-1">Raw Signal / Inquiry Text</label>
                <textarea
                  required
                  rows={3}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="e.g. Seeking distress 2BR in Business Bay under 1.6M AED liquid cash ready..."
                  className="w-full bg-slate-900 border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 outline-none placeholder:text-slate-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Lead Name (Optional)</label>
                  <input
                    type="text"
                    value={customLeadName}
                    onChange={(e) => setCustomLeadName(e.target.value)}
                    placeholder="e.g. Hamdan Al-Maktoum"
                    className="w-full bg-slate-900 border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Preferred Channel</label>
                  <select
                    value={customChannel}
                    onChange={(e) => setCustomChannel(e.target.value)}
                    className="w-full bg-slate-900 border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:border-cyan-400 outline-none"
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
                  className="px-4 py-2 rounded-xl text-xs font-mono bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ingesting}
                  className="px-5 py-2 rounded-xl text-xs font-bold font-mono bg-cyan-400 hover:bg-cyan-300 text-black shadow-glow disabled:opacity-50"
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

