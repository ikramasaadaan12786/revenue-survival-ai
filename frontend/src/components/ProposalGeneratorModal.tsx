"use client";

import React, { useState } from "react";
import { 
  FileText, 
  X, 
  Sparkles, 
  Copy, 
  Check, 
  DollarSign, 
  Clock, 
  Layers, 
  CheckCircle2, 
  Download,
  Send,
  Zap
} from "lucide-react";
import { api } from "@/lib/api";
import { Proposal } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  missionId: number;
  lead?: {
    id?: number;
    name?: string;
    company_name?: string;
    interest?: string;
    estimated_budget?: number;
    expected_value?: number;
  } | null;
  opportunityId?: number;
  onProposalCreated?: () => void;
}

export default function ProposalGeneratorModal({
  isOpen,
  onClose,
  missionId,
  lead,
  opportunityId,
  onProposalCreated
}: Props) {
  const [proposalType, setProposalType] = useState<string>("AI_AGENT");
  const [clientName, setClientName] = useState<string>(lead?.company_name || lead?.name || "Client Partner");
  const [problemDescription, setProblemDescription] = useState<string>(
    lead?.interest || "Needs automated qualification bot to capture inbound inquiries and book appointments."
  );
  const [customBudget, setCustomBudget] = useState<number>(lead?.estimated_budget || lead?.expected_value || 4500);
  const [timelineDays, setTimelineDays] = useState<number>(3);
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedProposal, setGeneratedProposal] = useState<Proposal | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  React.useEffect(() => {
    if (lead) {
      setClientName(lead.company_name || lead.name || "Client Partner");
      if (lead.interest) setProblemDescription(lead.interest);
      if (lead.estimated_budget) setCustomBudget(lead.estimated_budget);
    }
  }, [lead]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.generateProposal({
        mission_id: missionId,
        lead_id: lead?.id,
        opportunity_id: opportunityId,
        proposal_type: proposalType,
        client_name: clientName,
        problem_description: problemDescription,
        custom_budget: customBudget,
        timeline_days: timelineDays
      });
      setGeneratedProposal(res);
      if (onProposalCreated) onProposalCreated();
    } catch (err) {
      console.error("Failed generating proposal", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!generatedProposal?.full_proposal_markdown) return;
    navigator.clipboard.writeText(generatedProposal.full_proposal_markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-cyan-500/30 bg-[#090e1a]/95 text-slate-100 shadow-2xl p-6 md:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <FileText className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  AI Commercial Proposal Generator
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                  PROPOSAL ENGINE v3
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Generate tailored client proposals with deliverables, 50% escrow terms & turnaround timeline
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

        {!generatedProposal ? (
          /* Form to configure proposal */
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Proposal Type */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Proposal Solution Type</label>
                <select
                  value={proposalType}
                  onChange={(e) => setProposalType(e.target.value)}
                  className="w-full bg-slate-900 border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:border-cyan-400 outline-none"
                >
                  <option value="AI_AGENT">24/7 AI Sales Agent & WhatsApp Bot</option>
                  <option value="SOFTWARE">Custom Operations Software & CRM Dashboard</option>
                  <option value="WEBSITE">High-Converting Next.js 24h Web Funnel</option>
                  <option value="SAAS">Turnkey Multi-Tenant Micro-SaaS Product</option>
                  <option value="REAL_ESTATE">Dubai Distress Real Estate Advisory Dossier</option>
                  <option value="MARKETING">High-Intent B2B Lead Acquisition Engine</option>
                </select>
              </div>

              {/* Client Name */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Client / Company Name</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-900 border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:border-cyan-400 outline-none"
                  placeholder="e.g. Apex Dynamics FZ-LLC"
                />
              </div>
            </div>

            {/* Problem Description */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Client Problem / Business Need</label>
              <textarea
                required
                rows={3}
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                className="w-full bg-slate-900 border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs text-white focus:border-cyan-400 outline-none"
                placeholder="Describe the operational bottleneck or commercial requirement..."
              />
            </div>

            {/* Pricing & Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Proposed Investment Fee (AED)</label>
                <input
                  type="number"
                  required
                  min={500}
                  step={100}
                  value={customBudget}
                  onChange={(e) => setCustomBudget(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs font-mono text-emerald-400 font-bold focus:border-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Delivery SLA (Business Days)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={30}
                  value={timelineDays}
                  onChange={(e) => setTimelineDays(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs font-mono text-amber-300 font-bold focus:border-cyan-400 outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-mono font-bold bg-cyan-400 hover:bg-cyan-300 text-black shadow-glow transition-all disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                <span>{loading ? "Synthesizing Proposal..." : "Generate AI Proposal"}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Proposal Preview */
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{generatedProposal.proposal_title}</h3>
                <span className="text-xs font-mono text-cyan-300">
                  Turnaround: {generatedProposal.timeline_days} Days • Total: {Number(generatedProposal.pricing_amount).toLocaleString()} {generatedProposal.currency}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setGeneratedProposal(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                >
                  Edit Inputs
                </button>

                <button
                  onClick={handleCopyMarkdown}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy Markdown"}</span>
                </button>
              </div>
            </div>

            {/* Scope Deliverables & Outcomes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div className="glass-panel p-4 rounded-xl border border-cyan-500/20 space-y-2">
                <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Scope Deliverables:
                </div>
                <ul className="space-y-1 text-slate-300">
                  {generatedProposal.deliverables?.map((d, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-panel p-4 rounded-xl border border-emerald-500/20 space-y-2">
                <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  Commercial Terms & Outcomes:
                </div>
                <div className="text-slate-300 space-y-1">
                  <div>Terms: <strong className="text-white">{generatedProposal.payment_terms}</strong></div>
                  <div className="pt-1 text-emerald-300">Expected ROI Outcomes:</div>
                  <ul className="space-y-0.5 text-slate-200">
                    {generatedProposal.expected_outcomes?.map((o, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <span>• {o}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Full Markdown Preview Container */}
            <div className="p-4 rounded-xl bg-slate-950/90 border border-white/[0.08] max-h-64 overflow-y-auto text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
              {generatedProposal.full_proposal_markdown}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
              <span className="text-xs font-mono text-slate-400">
                Proposal saved into mission database (ID #{generatedProposal.id})
              </span>

              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-cyan-400 hover:bg-cyan-300 text-black transition-all"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
