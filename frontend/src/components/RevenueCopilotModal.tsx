"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  X, 
  DollarSign, 
  Target, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  Send, 
  Copy, 
  Check, 
  ShieldCheck,
  Cpu,
  Layers,
  Zap
} from "lucide-react";
import { api } from "@/lib/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  opportunity: {
    id?: number;
    name?: string;
    company?: string;
    industry?: string;
    requirement?: string;
    description?: string;
    estimated_value?: number;
    currency?: string;
  } | null;
  onOfferStaged?: () => void;
}

export default function RevenueCopilotModal({ isOpen, onClose, opportunity, onOfferStaged }: Props) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [copiedFollowup, setCopiedFollowup] = useState<number | null>(null);
  const [stagingOffer, setStagingOffer] = useState(false);
  const [stagedSuccess, setStagedSuccess] = useState(false);

  React.useEffect(() => {
    if (isOpen && opportunity) {
      runCopilotAnalysis();
    } else {
      setAnalysis(null);
      setStagedSuccess(false);
    }
  }, [isOpen, opportunity]);

  const runCopilotAnalysis = async () => {
    if (!opportunity) return;
    try {
      setLoading(true);
      setStagedSuccess(false);
      const res = await api.analyzeOpportunityWithCopilot({
        revenue_opportunity_id: opportunity.id,
        opportunity_id: opportunity.id,
        company: opportunity.company || opportunity.name,
        industry: opportunity.industry,
        problem_text: opportunity.requirement || opportunity.description || "Client seeking high conversion digital automation and acquisition system.",
        target_budget: opportunity.estimated_value,
        currency: opportunity.currency || "AED"
      });
      setAnalysis(res);
    } catch (err) {
      console.error("Failed running Revenue Copilot", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, isPitch = true, index?: number) => {
    navigator.clipboard.writeText(text);
    if (isPitch) {
      setCopiedPitch(true);
      setTimeout(() => setCopiedPitch(false), 2000);
    } else if (typeof index === "number") {
      setCopiedFollowup(index);
      setTimeout(() => setCopiedFollowup(null), 2000);
    }
  };

  const handleStageIntoPipeline = async () => {
    if (!analysis || !opportunity) return;
    try {
      setStagingOffer(true);
      await api.createOffer({
        mission_id: opportunity.id || 1,
        title: analysis.recommended_service?.service_name || `${opportunity.company} Custom Growth Offer`,
        service_type: analysis.recommended_service?.service_name || "Revenue Automation",
        tier: "CUSTOM",
        price: analysis.pricing?.recommended_price || opportunity.estimated_value || 3500,
        timeline_days: analysis.recommended_service?.delivery_timeline_days || 2,
        deliverables: analysis.recommended_service?.deliverables || ["Custom Automation Pipeline"],
        pitch_template: analysis.pitch?.full_pitch || "",
        payment_terms: analysis.pricing?.payment_terms || "50% upfront deposit"
      });
      setStagedSuccess(true);
      if (onOfferStaged) onOfferStaged();
    } catch (err) {
      console.error("Failed staging offer", err);
    } finally {
      setStagingOffer(false);
    }
  };

  if (!isOpen || !opportunity) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-cyan-500/30 bg-[#090e1a]/95 text-slate-100 shadow-2xl p-6 md:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  Revenue Copilot Engine
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  AI ACQUISITION v2
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Target: <strong className="text-white">{opportunity.company || opportunity.name}</strong> • {opportunity.industry || "General Industry"}
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

        {loading ? (
          <div className="py-16 text-center space-y-4">
            <Sparkles className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
            <p className="text-sm font-mono text-cyan-300">
              Revenue Copilot synthesizing problem diagnosis, pricing model, pitch hook & follow-up sequence...
            </p>
          </div>
        ) : analysis ? (
          <div className="space-y-6">
            {/* 1. Problem Analysis & Urgency */}
            <div className="glass-panel p-4 rounded-xl border border-rose-500/20 bg-rose-950/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-rose-400">
                <span className="flex items-center gap-1.5">
                  <Target className="w-4 h-4" />
                  1. Problem Diagnosis & Revenue Friction
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/30">
                  Urgency: {typeof analysis.problem_analysis === "object" ? analysis.problem_analysis?.urgency_tier : "HIGH"}
                </span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-mono">
                {typeof analysis.problem_analysis === "string" ? analysis.problem_analysis : analysis.problem_analysis?.root_problem}
              </p>
              <div className="text-xs text-slate-400 font-mono flex items-center gap-2 pt-1 border-t border-rose-500/10">
                <span>Buyer Bottleneck:</span>
                <strong className="text-rose-300">{analysis.buyer_bottleneck || analysis.problem_analysis?.business_impact || "Manual fulfillment friction."}</strong>
              </div>
            </div>

            {/* 2. Recommended Service & Pricing Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Service */}
              <div className="glass-panel p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/10 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-cyan-400">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    2. Recommended Solution
                  </span>
                  <span className="text-slate-400 font-normal">
                    {analysis.delivery_sla_hours || analysis.recommended_service?.delivery_timeline_days || 24}h Turnaround
                  </span>
                </div>
                <div className="text-base font-bold text-white">
                  {typeof analysis.recommended_service === "string" ? analysis.recommended_service : analysis.recommended_service?.service_name}
                </div>
                <div className="space-y-1.5">
                  <div className="text-[11px] font-mono text-slate-400">Scope Deliverables:</div>
                  <ul className="text-xs text-slate-300 space-y-1 font-mono">
                    {(analysis.service_scope || analysis.recommended_service?.deliverables || []).map((d: string, i: number) => (
                      <li key={i} className="flex items-center gap-1.5 text-cyan-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Pricing */}
              <div className="glass-panel p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/10 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" />
                    3. Pricing & Terms
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    50% Escrow
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-emerald-400">
                  {Number(analysis.suggested_pricing_aed || analysis.pricing?.recommended_price || 3500).toLocaleString()} AED
                </div>
                <div className="text-xs text-slate-300 space-y-1 font-mono">
                  <div>Upfront Deposit: <strong className="text-white">{Number(analysis.upfront_deposit_aed || 1750).toLocaleString()} AED</strong></div>
                  <div>ROI Model: <strong className="text-emerald-300">{analysis.roi_multiplier || "4.2x ROI"}</strong></div>
                  <div>Confidence: <strong className="text-cyan-300">{analysis.conversion_confidence || 92.5}%</strong></div>
                </div>
              </div>
            </div>

            {/* 3. Direct Response Pitch */}
            <div className="glass-panel p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-indigo-400">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  4. Direct Response Pitch Hook
                </span>
                <button
                  onClick={() => handleCopy(analysis.pitch_message || analysis.pitch?.full_pitch || "", true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 transition-all text-xs font-mono"
                >
                  {copiedPitch ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPitch ? "Copied" : "Copy Pitch"}</span>
                </button>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-white/[0.06] text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
                {analysis.pitch_message || analysis.pitch?.full_pitch}
              </div>
            </div>

            {/* 4. Automated Follow-Up Sequence */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  5. 3-Step Automated Follow-up Sequence
                </span>
                <span className="text-[11px] text-slate-400 font-normal">
                  Conversion-Optimized Triggers
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {analysis.follow_up_sequence?.map((step: any, idx: number) => (
                  <div key={idx} className="glass-panel p-3 rounded-xl border border-white/[0.06] bg-slate-900/60 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="font-bold text-amber-400">{step.day || `Day +${step.day_offset || idx * 2 + 1}`} ({step.hook || step.trigger_angle})</span>
                      <button
                        onClick={() => handleCopy(step.body || step.message_template, false, idx)}
                        className="text-slate-400 hover:text-white"
                        title="Copy message"
                      >
                        {copiedFollowup === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <p className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed line-clamp-4">
                      {step.body || step.message_template}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
              <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>All staged offers require human authorization before outreach</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleStageIntoPipeline}
                  disabled={stagingOffer || stagedSuccess}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold font-mono bg-cyan-400 hover:bg-cyan-300 text-black shadow-glow transition-all disabled:opacity-50"
                >
                  {stagedSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-950" />
                      <span>Staged into Safety Queue!</span>
                    </>
                  ) : stagingOffer ? (
                    <>
                      <Zap className="w-4 h-4 animate-spin" />
                      <span>Staging Offer...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Stage AI Offer to Pipeline</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 font-mono text-sm">
            Could not generate analysis. Please try again.
          </div>
        )}
      </div>
    </div>
  );
}
