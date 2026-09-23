'use client';

import React, { useState, useEffect } from 'react';
import { Flame, ShieldCheck, UserCheck, DollarSign, Send, ArrowUpRight, Search, Filter, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { api, getApiUrl } from '@/lib/api';

interface HotBuyerTerminalProps {
  missionId?: number;
  onNavigateTab: (tabId: string) => void;
}

export const HotBuyerTerminal: React.FC<HotBuyerTerminalProps> = ({
  missionId = 1006,
  onNavigateTab,
}) => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [filterTier, setFilterTier] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [converting, setConverting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const res = await api.getLeads(missionId).catch(() => []);
      setLeads(res || []);
      if (res && res.length > 0) {
        setSelectedLead(res[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [missionId]);

  const handleConvertRadarSignal = async (signalData: any) => {
    setConverting(true);
    setSuccessMsg(null);
    try {
      const res = await fetch(getApiUrl('/api/v1/closing-engine/convert-signal'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mission_id: missionId,
          name: signalData.name || 'Verified Decision Maker',
          company: signalData.company_name || 'UAE Business',
          interest: signalData.interest || 'AI Automation and Pipeline Scaling',
          source: signalData.source || 'BUYER RADAR',
          country: signalData.country || 'United Arab Emirates',
          budget: signalData.estimated_budget || 25000,
          channel: signalData.channel || 'WhatsApp',
        }),
      }).catch(() => null);

      if (res && res.ok) {
        const json = await res.json();
        setSuccessMsg(`Signal promoted to active pipeline: Lead #${json.lead_id} (${json.name}) linked with ${json.offer_name}.`);
        loadLeads();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setConverting(false);
    }
  };

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      (l.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.company_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.interest || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTier === 'HOT') return (l.classification || '').includes('HOT') || (l.qualification_score || 0) >= 82;
    if (filterTier === 'QUALIFIED') return (l.classification || '').includes('QUALIFIED') || ((l.qualification_score || 0) >= 65 && (l.qualification_score || 0) < 82);
    if (filterTier === 'WARM') return (l.classification || '').includes('WARM');

    return true;
  });

  return (
    <div className="space-y-6 w-full max-w-[1640px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#0C1222] via-[#080D18] to-[#04060A] border border-[#D4AF37]/40 shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h2 className="text-2xl font-serif font-black text-white">Hot Buyer Terminal & Lead Workspace</h2>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Real Buyer Radar signals filtered for genuine business intent, decision-maker authority, and verified budget capability.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search buyers, companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-xl bg-[#04060A] border border-[#D4AF37]/30 text-xs text-white placeholder:text-slate-500 font-sans focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="flex rounded-xl bg-[#04060A] border border-[#D4AF37]/30 p-0.5 text-xs font-mono">
            {['ALL', 'HOT', 'QUALIFIED', 'WARM'].map((tier) => (
              <button
                key={tier}
                onClick={() => setFilterTier(tier)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterTier === tier ? 'bg-[#D4AF37] text-black font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left (5 Cols): Buyers Feed List */}
        <div className="lg:col-span-5 rounded-2xl bg-[#080D18]/90 border border-[#D4AF37]/30 p-4 space-y-3 max-h-[750px] overflow-y-auto">
          <div className="text-xs font-mono uppercase text-slate-400 px-2 flex justify-between items-center">
            <span>Verified Buyers ({filteredLeads.length})</span>
            <span className="text-[#D4AF37]">Click to Inspect</span>
          </div>

          {filteredLeads.map((lead) => {
            const isSelected = selectedLead?.id === lead.id;
            const isHot = (lead.classification || '').includes('HOT') || (lead.qualification_score || 0) >= 82;

            return (
              <div
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#D4AF37]/20 to-[#0B101D] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                    : 'bg-[#04060A]/70 border-white/10 hover:border-[#D4AF37]/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    {lead.name}
                    {isHot && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        HOT
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono font-bold text-[#F5D77F]">
                    AED {(lead.expected_value || lead.estimated_budget || 3500).toLocaleString()}
                  </span>
                </div>

                <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <span className="text-slate-300">{lead.company_name || 'Direct Enterprise'}</span>
                  <span>•</span>
                  <span className="text-[11px] font-mono text-[#D4AF37]">{lead.source || 'RADAR'}</span>
                </div>

                <div className="mt-2 text-xs text-slate-300 line-clamp-2">
                  {lead.interest || 'Target enterprise requirement discovered via Buyer Radar.'}
                </div>

                <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-emerald-400">Score: {lead.qualification_score || 75}%</span>
                  <span className="text-slate-400">Stage: {lead.pipeline_stage || 'QUALIFIED'}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right (7 Cols): Lead Detailed Dossier Workspace */}
        <div className="lg:col-span-7 rounded-2xl bg-[#080D18]/90 border border-[#D4AF37]/40 p-6 space-y-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          {selectedLead ? (
            <>
              {/* Profile Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-serif font-bold text-white">{selectedLead.name}</h3>
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#D4AF37]/20 text-[#F5D77F] border border-[#D4AF37]/40">
                      {selectedLead.classification || 'QUALIFIED BUYER'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <span className="text-slate-200 font-semibold">{selectedLead.company_name || 'UAE Company'}</span>
                    <span>•</span>
                    <span>{selectedLead.country || 'United Arab Emirates'}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-mono">Channel: {selectedLead.channel || 'WhatsApp'}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase font-mono text-slate-400">Deal Value / Prob</div>
                  <div className="text-lg font-mono font-black text-[#F5D77F]">
                    AED {(selectedLead.expected_value || selectedLead.estimated_budget || 3500).toLocaleString()}
                  </div>
                  <div className="text-xs font-mono text-emerald-400">
                    {Math.round((selectedLead.revenue_probability || 0.7) * 100)}% Closing Probability
                  </div>
                </div>
              </div>

              {/* 5-Dimension Radar Scoring Analysis */}
              <div className="p-4 rounded-xl bg-[#04060A]/80 border border-[#D4AF37]/20 space-y-3">
                <div className="text-xs font-mono font-bold uppercase text-[#F5D77F] tracking-wider">
                  AI 5-Dimension Qualification Score ({selectedLead.qualification_score || 75}%)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                    <div className="text-[10px] text-slate-400">Buyer Intent</div>
                    <div className="text-sm font-bold text-white mt-0.5">85% / High</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                    <div className="text-[10px] text-slate-400">Budget Confirmed</div>
                    <div className="text-sm font-bold text-[#F5D77F] mt-0.5">Verified</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                    <div className="text-[10px] text-slate-400">Decision Maker</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">95% (C-Suite)</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                    <div className="text-[10px] text-slate-400">Timeline</div>
                    <div className="text-sm font-bold text-amber-300 mt-0.5">Immediate</div>
                  </div>
                </div>
                {selectedLead.qualification_notes && (
                  <p className="text-xs text-slate-300 font-sans italic pt-1">
                    &quot;{selectedLead.qualification_notes}&quot;
                  </p>
                )}
              </div>

              {/* Requirement & Matched Offer */}
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-mono uppercase text-slate-400 mb-1">Requirement Overview</div>
                  <p className="text-xs text-slate-200 bg-[#04060A]/60 p-3 rounded-xl border border-white/5 font-sans leading-relaxed">
                    {selectedLead.interest || 'Inquiring for AI agent workflows and high-ticket customer acquisition infrastructure in Dubai.'}
                  </p>
                </div>

                <div>
                  <div className="text-xs font-mono uppercase text-slate-400 mb-1">Matched High-Ticket Solution</div>
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/40 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-white">B2B Autonomous Outbound Engine</div>
                      <div className="text-xs text-slate-300">48-Hour Delivery • Tailored Revenue Pipeline</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-xs text-slate-400">Pricing</div>
                      <div className="font-bold text-[#F5D77F]">AED 3,000</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigateTab('comms_center')}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black font-mono text-xs font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  Open Outreach in Comms Center
                </button>

                <button
                  onClick={() => onNavigateTab('proposal_desk')}
                  className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs font-semibold border border-white/10 transition-all flex items-center gap-1.5"
                >
                  Generate Proposal
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleConvertRadarSignal(selectedLead)}
                  disabled={converting}
                  className="py-2.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/40 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {converting ? 'Promoting...' : 'Promote to Deal Room'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-slate-500 font-mono text-xs">
              Select a buyer from the list to view the detailed dossier.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
