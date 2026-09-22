"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  X, 
  HelpCircle, 
  MessageSquare, 
  TrendingUp, 
  DollarSign, 
  Copy, 
  Check, 
  Sparkles, 
  Zap,
  Target,
  ArrowRight,
  Lightbulb,
  CheckCircle2
} from "lucide-react";
import { api } from "@/lib/api";
import { SalesClosingStrategy } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lead: {
    id?: number;
    name?: string;
    company_name?: string;
    industry?: string;
    estimated_budget?: number;
    expected_value?: number;
    interest?: string;
  } | null;
}

export default function SalesClosingAssistantModal({ isOpen, onClose, lead }: Props) {
  const [strategy, setStrategy] = useState<SalesClosingStrategy | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedObjectionIdx, setSelectedObjectionIdx] = useState<number>(0);
  const [copiedScript, setCopiedScript] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"OBJECTIONS" | "DISCOVERY" | "NEGOTIATION">("OBJECTIONS");

  useEffect(() => {
    if (isOpen && lead) {
      fetchStrategy();
    } else {
      setStrategy(null);
    }
  }, [isOpen, lead]);

  const fetchStrategy = async () => {
    if (!lead) return;
    try {
      setLoading(true);
      const res = await api.getSalesClosingStrategy({
        lead_id: lead.id,
        company_name: lead.company_name || lead.name,
        industry: lead.industry || "Digital Automation & Technology",
        target_budget: lead.estimated_budget || lead.expected_value || 5000
      });
      setStrategy(res);
    } catch (err) {
      console.error("Failed generating closing strategy", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(idx);
    setTimeout(() => setCopiedScript(null), 2000);
  };

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-cyan-500/30 bg-[#090e1a]/95 text-slate-100 shadow-2xl p-6 md:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  AI Sales Closing Assistant
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  DEAL CLOSER v3
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Prospect: <strong className="text-white">{lead.company_name || lead.name}</strong> • Target: <strong className="text-emerald-400 font-mono">{Number(lead.estimated_budget || lead.expected_value || 5000).toLocaleString()} AED</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-white/[0.08] gap-2 font-mono text-xs">
          <button
            onClick={() => setActiveTab("OBJECTIONS")}
            className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 font-bold transition-all ${
              activeTab === "OBJECTIONS"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Objection Battlecards ({strategy?.objection_handling?.length || 5})</span>
          </button>

          <button
            onClick={() => setActiveTab("DISCOVERY")}
            className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 font-bold transition-all ${
              activeTab === "DISCOVERY"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Discovery Questions</span>
          </button>

          <button
            onClick={() => setActiveTab("NEGOTIATION")}
            className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 font-bold transition-all ${
              activeTab === "NEGOTIATION"
                ? "border-emerald-400 text-emerald-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Negotiation & Pricing Strategy</span>
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-4">
            <Sparkles className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
            <p className="text-sm font-mono text-amber-300">
              Generating tactical closing questions, objection battlecards & pricing strategy...
            </p>
          </div>
        ) : strategy ? (
          <div className="space-y-6">
            {/* TAB 1: OBJECTION HANDLING */}
            {activeTab === "OBJECTIONS" && (
              <div className="space-y-4">
                <div className="text-xs text-slate-400 font-mono">
                  Select an objection to view the direct closing script and tactical positioning:
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  {strategy.objection_handling.map((obj, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedObjectionIdx(i)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-mono transition-all ${
                        selectedObjectionIdx === i
                          ? "bg-amber-500/20 border-amber-500/50 text-white font-bold shadow-sm"
                          : "bg-slate-900/60 border-white/[0.06] text-slate-400 hover:bg-slate-800/80"
                      }`}
                    >
                      <div className="line-clamp-2">{obj.objection}</div>
                    </button>
                  ))}
                </div>

                {/* Selected Objection Box */}
                {strategy.objection_handling[selectedObjectionIdx] && (
                  <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-amber-950/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4" />
                        Objection: "{strategy.objection_handling[selectedObjectionIdx].objection}"
                      </span>
                      <button
                        onClick={() => handleCopy(strategy.objection_handling[selectedObjectionIdx].script, selectedObjectionIdx)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold transition-all"
                      >
                        {copiedScript === selectedObjectionIdx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Script Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Response Script</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.08] text-xs md:text-sm font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {strategy.objection_handling[selectedObjectionIdx].script}
                    </div>

                    <div className="text-xs text-slate-400 font-mono flex items-center gap-2 pt-1 border-t border-amber-500/10">
                      <span className="text-amber-400 font-bold">Tactical Positioning:</span>
                      <span className="text-slate-300">{strategy.objection_handling[selectedObjectionIdx].tactical_pivot}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: DISCOVERY QUESTIONS */}
            {activeTab === "DISCOVERY" && (
              <div className="space-y-4">
                <div className="text-xs text-slate-400 font-mono">
                  Ask these discovery questions to uncover budget ceiling, timeline urgency, and decision structure:
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {strategy.discovery_questions.map((q, idx) => (
                    <div
                      key={idx}
                      className="glass-panel p-4 rounded-xl border border-cyan-500/20 bg-slate-900/60 space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          QUESTION #{idx + 1}
                        </span>
                        <p className="text-xs md:text-sm font-bold text-white leading-relaxed">
                          "{q.question}"
                        </p>
                      </div>

                      <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-white/[0.06] flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                        <span>Objective: <strong className="text-cyan-200">{q.purpose}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: NEGOTIATION & PRICING STRATEGY */}
            {activeTab === "NEGOTIATION" && (
              <div className="space-y-5">
                {/* Pricing Tiers Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.08] space-y-1">
                    <div className="text-[11px] font-mono text-slate-400">Recommended Anchor Price</div>
                    <div className="text-2xl font-black font-mono text-cyan-400">
                      {Number(strategy.negotiation_strategy.recommended_starting_price).toLocaleString()} AED
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">Full Scope Solution</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/30 space-y-1">
                    <div className="text-[11px] font-mono text-amber-400">Minimum Acceptable Floor</div>
                    <div className="text-2xl font-black font-mono text-amber-300">
                      {Number(strategy.negotiation_strategy.minimum_acceptable_floor).toLocaleString()} AED
                    </div>
                    <div className="text-[10px] text-amber-400/80 font-mono">Target Margin: {strategy.negotiation_strategy.target_profit_margin}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                    <div className="text-[11px] font-mono text-emerald-400">Upsell Expansion Package</div>
                    <div className="text-2xl font-black font-mono text-emerald-400">
                      {Number(strategy.negotiation_strategy.upsell_opportunity?.upsell_price || 0).toLocaleString()} AED
                    </div>
                    <div className="text-[10px] text-emerald-400/80 font-mono">Monthly AI Retainer</div>
                  </div>
                </div>

                {/* Terms & Value Justification */}
                <div className="glass-panel p-4 rounded-xl border border-white/[0.08] space-y-3">
                  <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>Commercial Terms & Value Justification</span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-2 font-mono">
                    <div>Payment Structure: <strong className="text-white">{strategy.negotiation_strategy.suggested_payment_terms}</strong></div>
                    <div>Value Proof: <span className="text-slate-200">{strategy.negotiation_strategy.value_justification}</span></div>
                  </div>
                </div>

                {/* Upsell Deliverables */}
                {strategy.negotiation_strategy.upsell_opportunity && (
                  <div className="glass-panel p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/10 space-y-2">
                    <div className="text-xs font-mono font-bold text-emerald-300">
                      Upsell Scope ({strategy.negotiation_strategy.upsell_opportunity.upsell_package_name}):
                    </div>
                    <ul className="text-xs font-mono text-slate-300 space-y-1">
                      {(strategy.negotiation_strategy.upsell_opportunity.upsell_deliverables || strategy.negotiation_strategy.upsell_opportunity.deliverables || [])?.map((del, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>{del}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Recommended Next Action */}
            <div className="p-4 rounded-xl bg-slate-900/90 border-l-4 border-l-cyan-400 flex items-center justify-between gap-4">
              <div className="text-xs font-mono text-slate-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Next Best Closing Move: <strong className="text-white">{strategy.recommended_next_action}</strong></span>
              </div>

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-cyan-400 hover:bg-cyan-300 text-black transition-all flex-shrink-0"
              >
                Execute Action
              </button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 font-mono text-xs">
            Could not generate closing strategy.
          </div>
        )}
      </div>
    </div>
  );
}
