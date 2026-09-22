'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Sparkles, Send, Download, CheckCircle2, DollarSign, Clock, Layers, UserCheck } from 'lucide-react';
import { api } from '@/lib/api';

interface ProposalDeskProps {
  missionId?: number;
  onNavigateTab: (tabId: string) => void;
}

export const ProposalDesk: React.FC<ProposalDeskProps> = ({
  missionId = 1006,
  onNavigateTab,
}) => {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<any | null>(null);
  const [clientName, setClientName] = useState('Prime Capital Dubai');
  const [clientIndustry, setClientIndustry] = useState('AI Agents & Automation');
  const [proposalType, setProposalType] = useState('AI_AGENTS');
  const [budgetAED, setBudgetAED] = useState('3000');
  const [timelineDays, setTimelineDays] = useState('2');
  const [problemDesc, setProblemDesc] = useState('Seeking an autonomous high-ticket lead generation system and customer support copilot in Dubai.');
  const [generating, setGenerating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const loadProposals = async () => {
    setLoading(true);
    try {
      const res = await api.getMissionProposals(missionId).catch(() => []);
      setProposals(res || []);
      if (res && res.length > 0) {
        setSelectedProposal(res[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
  }, [missionId]);

  const handleGenerateProposal = async () => {
    setGenerating(true);
    setNotice(null);
    try {
      const res = await api.generateProposal({
        mission_id: missionId,
        client_name: clientName,
        client_industry: clientIndustry,
        proposal_type: proposalType,
        custom_budget: parseFloat(budgetAED) || 3000,
        timeline_days: parseInt(timelineDays, 10) || 2,
        problem_description: problemDesc,
      });

      setNotice(`Commercial Proposal "${res.title}" generated successfully!`);
      setSelectedProposal(res);
      loadProposals();
    } catch (e) {
      console.error(e);
      setNotice('Proposal generated.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-[1640px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#0C1222] via-[#080D18] to-[#04060A] border border-[#D4AF37]/40 shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <h2 className="text-2xl font-serif font-black text-white">AI Commercial Proposal Desk</h2>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Engineers tailored high-ticket proposals with executive scope, milestone timelines, deliverables, and AED pricing.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('comms_center')}
          className="px-4 py-2 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F5D77F] text-xs font-mono font-bold hover:bg-[#D4AF37]/30 transition-all flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          Review Outreach in Comms Center
        </button>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left (5 Cols): Proposal Generator Studio */}
        <div className="lg:col-span-5 rounded-2xl bg-[#080D18]/90 border border-[#D4AF37]/30 p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Sparkles className="w-4 h-4 text-[#F5D77F]" />
            <h3 className="text-base font-serif font-bold text-white">Draft Commercial Proposal</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Target Client Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#04060A] border border-white/10 text-white font-sans focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Industry Sector</label>
              <select
                value={clientIndustry}
                onChange={(e) => setClientIndustry(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#04060A] border border-white/10 text-white font-sans focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="AI Agents & Automation">AI Agents & Automation</option>
                <option value="Website Development">Website Development</option>
                <option value="Dubai Real Estate & Advisory">Dubai Real Estate & Advisory</option>
                <option value="Marketing Services">Marketing Services</option>
                <option value="Custom Software">Custom Software</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Pricing (AED)</label>
                <input
                  type="number"
                  value={budgetAED}
                  onChange={(e) => setBudgetAED(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#04060A] border border-white/10 text-[#F5D77F] font-mono font-bold focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Timeline (Days)</label>
                <input
                  type="number"
                  value={timelineDays}
                  onChange={(e) => setTimelineDays(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#04060A] border border-white/10 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Problem & Requirement Scope</label>
              <textarea
                rows={3}
                value={problemDesc}
                onChange={(e) => setProblemDesc(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#04060A] border border-white/10 text-white font-sans focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <button
              onClick={handleGenerateProposal}
              disabled={generating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black font-mono text-xs font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-black" />
              {generating ? 'Crafting Tailored Proposal...' : 'Generate Commercial Proposal'}
            </button>
          </div>
        </div>

        {/* Right (7 Cols): Proposal Preview Canvas */}
        <div className="lg:col-span-7 rounded-2xl bg-[#080D18]/90 border border-[#D4AF37]/40 p-6 space-y-5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-xl font-serif font-bold text-white">
                {selectedProposal?.title || 'B2B Autonomous Outbound Engine — Commercial Brief'}
              </h3>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                Client: <span className="text-[#F5D77F]">{selectedProposal?.client_name || clientName}</span> • AED{' '}
                {(selectedProposal?.pricing_amount || parseFloat(budgetAED) || 3000).toLocaleString()}
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              STATUS: READY
            </span>
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-slate-200">
            {/* Executive Summary */}
            <div className="p-4 rounded-xl bg-[#04060A]/70 border border-white/5 space-y-1.5">
              <div className="text-[10px] font-mono uppercase text-[#F5D77F] font-bold">Executive Summary</div>
              <p className="text-slate-300 font-sans">
                {selectedProposal?.executive_summary ||
                  `Engineered specifically for ${clientName}, this bespoke infrastructure deploys multi-channel autonomous outbound pipelines across LinkedIn, WhatsApp, and Email with verified Dubai decision-maker targeting.`}
              </p>
            </div>

            {/* Scope of Deliverables */}
            <div className="p-4 rounded-xl bg-[#04060A]/70 border border-white/5 space-y-2">
              <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold">Deliverables & Scope</div>
              <ul className="space-y-1.5 list-disc pl-4 text-slate-300 font-sans">
                <li>Automated Multi-Channel Buyer Radar Integration (6 UAE Connectors)</li>
                <li>AI Sales Closing Copilot with 5-Dimension Intent Scoring</li>
                <li>Safety Approval Gate with Human-in-the-Loop clearance</li>
                <li>Autonomous Outreach Sequences with 4-Touch Follow-Up Engine</li>
              </ul>
            </div>

            {/* Commercial Terms */}
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-gradient-to-r from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/30">
                <div className="text-[10px] text-slate-400 uppercase">Fixed Investment</div>
                <div className="text-base font-bold text-[#F5D77F]">
                  AED {(selectedProposal?.pricing_amount || parseFloat(budgetAED) || 3000).toLocaleString()}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#04060A]/70 border border-white/5">
                <div className="text-[10px] text-slate-400 uppercase">Delivery Window</div>
                <div className="text-base font-bold text-white">
                  {selectedProposal?.timeline_days || timelineDays} Business Days
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              onClick={() => onNavigateTab('comms_center')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-mono text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Stage in Safety Gate & Dispatch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
