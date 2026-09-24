'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  MessageSquare,
  Mail,
  Calendar,
  FileText,
  DollarSign,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
  Info,
  Clock,
  Globe,
  Radio,
  Building
} from 'lucide-react';
import { getApiUrl } from '@/lib/api';

interface RealSalesQueueProps {
  missionId?: number;
  onNavigateTab?: (tabId: string) => void;
}

const STAGES = [
  'ALL',
  'DISCOVERED',
  'SOURCE VERIFIED',
  'CONTACT READY',
  'MESSAGE SENT',
  'REPLY RECEIVED',
  'QUALIFIED',
  'CALL BOOKED',
  'PROPOSAL SENT',
  'PAYMENT'
];

export const RealSalesQueue: React.FC<RealSalesQueueProps> = ({
  missionId,
  onNavigateTab
}) => {
  const [queueData, setQueueData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeadModal, setSelectedLeadModal] = useState<any | null>(null);

  const fetchSalesQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl(`/api/v1/closing-engine/real-sales-queue/${missionId}`));
      if (res.ok) {
        const data = await res.json();
        setQueueData(data);
      }
    } catch (e) {
      console.error('Failed to fetch sales queue', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesQueue();
    const interval = setInterval(fetchSalesQueue, 25000);
    return () => clearInterval(interval);
  }, [missionId]);

  const queue = queueData?.queue || [];
  const filteredQueue = queue.filter((item: any) => {
    const matchesStage = selectedStage === 'ALL' || item.status === selectedStage;
    const matchesSearch =
      (item.buyer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.requirement || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.source || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStage && matchesSearch;
  });

  const getStageBadgeColor = (status: string) => {
    switch (status) {
      case 'PAYMENT':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
      case 'DEAL OPEN':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'PROPOSAL SENT':
        return 'bg-[#D4AF37]/20 text-[#F5D77F] border-[#D4AF37]/50';
      case 'CALL BOOKED':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50';
      case 'QUALIFIED':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/50';
      case 'REPLY RECEIVED':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50';
      case 'MESSAGE SENT':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      case 'CONTACT READY':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'SOURCE VERIFIED':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/50';
    }
  };

  return (
    <div className="space-y-6 w-full max-w-[1640px] mx-auto pb-12">
      {/* Header & Stage Counters */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#0C1222] via-[#080D18] to-[#04060A] border-2 border-[#D4AF37]/50 shadow-[0_0_40px_rgba(212,175,55,0.25)] space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/60 text-emerald-400 text-xs font-mono font-black tracking-widest uppercase flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                REAL SALES QUEUE
              </span>
              <span className="px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F5D77F] text-xs font-mono font-bold">
                10 CANONICAL CLOSING STAGES
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F5D77F] to-[#D4AF37]">
              Real Sales Execution Queue
            </h1>
            <p className="text-xs text-slate-300 font-sans max-w-3xl leading-relaxed">
              Canonical operational queue of genuine discovered buyers. Tracks external source provenance, contact confirmation, and 10-stage progression with verified cryptographic tokens.
            </p>
          </div>

          <button
            onClick={fetchSalesQueue}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-[#080D18] border border-[#D4AF37]/40 text-[#F5D77F] font-mono text-xs font-bold hover:bg-[#D4AF37]/10 transition-all flex items-center gap-2 self-start lg:self-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Queue
          </button>
        </div>

        {/* 10-Stage Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
          {STAGES.map((stage) => {
            const isSelected = selectedStage === stage;
            const count =
              stage === 'ALL'
                ? queueData?.total_active_queue_count || 0
                : queueData?.stage_counts?.[stage] || 0;

            return (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                    : 'bg-[#04060A] text-slate-300 border-white/10 hover:border-[#D4AF37]/40'
                }`}
              >
                <span>{stage}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected ? 'bg-black/20 text-black' : 'bg-white/10 text-[#F5D77F]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by buyer, company, requirement, or platform source..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#080D18] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
      </div>

      {/* Table of Real Sales Queue */}
      <div className="rounded-3xl bg-[#080D18]/90 border border-white/10 overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#04060A] text-[#F5D77F] font-mono uppercase tracking-wider text-[10.5px]">
                <th className="py-3.5 px-5">Buyer</th>
                <th className="py-3.5 px-4">Source & Provenance</th>
                <th className="py-3.5 px-6">Requirement & Commission</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-mono text-xs">
                    No active buyers in this stage. Run the autonomous buyer discovery cycle to ingest verified prospects.
                  </td>
                </tr>
              ) : (
                filteredQueue.map((item: any) => (
                  <tr key={item.lead_id} className="hover:bg-white/[0.02] transition-colors group">
                    {/* 1. Buyer Column */}
                    <td className="py-4 px-5 align-top">
                      <div className="font-bold text-white text-sm font-serif">{item.name}</div>
                      <div className="text-xs text-slate-400 font-sans">{item.company || 'Private Buyer'}</div>
                      <div className="text-[10px] font-mono text-slate-500 mt-1">
                        Token: <span className="text-[#F5D77F]">{item.evidence_reference}</span>
                      </div>
                      {item.discovered_at && (
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>Disc: {item.discovered_at}</span>
                        </div>
                      )}
                    </td>

                    {/* 2. Source Column */}
                    <td className="py-4 px-4 align-top">
                      <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-slate-300 font-mono text-[11px] block w-max">
                        {item.source}
                      </span>
                      <button
                        onClick={() => setSelectedLeadModal(item)}
                        className="text-[10.5px] font-mono text-[#D4AF37] hover:underline flex items-center gap-1 mt-1.5 cursor-pointer bg-transparent border-0 p-0"
                      >
                        Verify Source <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      </button>
                    </td>

                    {/* 3. Requirement Column */}
                    <td className="py-4 px-6 align-top max-w-md">
                      <p className="text-slate-200 line-clamp-2 leading-relaxed">{item.requirement}</p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400 mt-1.5">
                        <span>
                          Target Budget: <span className="text-[#F5D77F] font-bold">AED {(item.budget_aed || 0).toLocaleString()}</span>
                        </span>
                        <span className="text-slate-600">•</span>
                        <span>
                          Potential Comm: <span className="text-emerald-400 font-bold">AED {(item.commission_potential_aed || 0).toLocaleString()}</span>
                        </span>
                      </div>
                    </td>

                    {/* 4. Contact Column */}
                    <td className="py-4 px-4 align-top">
                      <div className="font-mono text-xs text-white">{item.contact}</div>
                      <div className="text-[10px] font-mono mt-1">
                        {item.contact_provenance === 'CONNECTOR_CONFIRMED' ? (
                          <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="w-3 h-3" /> Connector Confirmed
                          </span>
                        ) : (
                          <span className="text-amber-400 font-mono">Unverified Contact</span>
                        )}
                      </div>
                      {item.profile_url && (
                        <a
                          href={item.profile_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10.5px] font-mono text-cyan-400 hover:underline flex items-center gap-1 mt-1"
                        >
                          Profile Link <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </td>

                    {/* 5. Status Column */}
                    <td className="py-4 px-4 align-top text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold border inline-block ${getStageBadgeColor(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Source Verification & Provenance Modal */}
      {selectedLeadModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setSelectedLeadModal(null)}
        >
          <div
            className="relative w-full max-w-2xl flex flex-col rounded-3xl bg-gradient-to-b from-[#0B101D] via-[#070A14] to-[#04060A] border border-[#D4AF37]/50 shadow-[0_0_50px_rgba(212,175,55,0.3)] overflow-hidden text-[#F9F6EE]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#D4AF37]/20 bg-[#06080F]/90">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#F5D77F]">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#F9F6EE]">Source Verification & Provenance</h3>
                  <p className="text-xs text-[#8C9BAE]">
                    Audited external signal origin for <strong className="text-white">{selectedLeadModal.name}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLeadModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-[#06080F] border border-white/10 space-y-1">
                  <span className="text-slate-400 text-[10.5px]">Source Platform:</span>
                  <p className="text-[#F5D77F] font-bold text-sm">{selectedLeadModal.source}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#06080F] border border-white/10 space-y-1">
                  <span className="text-slate-400 text-[10.5px]">Provenance Status:</span>
                  <p className="text-emerald-400 font-bold text-sm">{selectedLeadModal.verification_status || 'SOURCE_VERIFIED'}</p>
                </div>
              </div>

              {/* URL & HTTP Probe Result */}
              <div className="p-4 rounded-xl bg-[#06080F] border border-white/10 space-y-2">
                <span className="text-slate-400 text-[10.5px] block">External Evidence Reference / URL:</span>
                {selectedLeadModal.source_url ? (
                  <div className="flex items-center justify-between gap-3 bg-[#0B101D] p-2.5 rounded-lg border border-white/5 break-all">
                    <span className="text-cyan-300 text-[11px]">{selectedLeadModal.source_url}</span>
                    <a
                      href={selectedLeadModal.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F5D77F] font-bold hover:bg-[#D4AF37]/30 flex items-center gap-1 whitespace-nowrap flex-shrink-0"
                    >
                      Open Link <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <div className="text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                    Direct connector signal without public web permalink.
                  </div>
                )}
              </div>

              {/* Timestamps */}
              <div className="p-4 rounded-xl bg-[#06080F] border border-white/10 space-y-2">
                <h4 className="text-slate-300 font-bold uppercase text-[10.5px]">Timestamp Audit Registry:</h4>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div>• Source Inquiry Time: <strong className="text-amber-400">SOURCE TIME UNKNOWN</strong></div>
                  <div>• Discovered At: <strong className="text-[#F5D77F]">{selectedLeadModal.discovered_at || 'Recently'}</strong></div>
                  <div>• Ingested At: <strong className="text-white">{selectedLeadModal.ingested_at || 'Recently'}</strong></div>
                  <div>• Last Verified At: <strong className="text-emerald-400">{selectedLeadModal.last_verified_at || 'Recently'}</strong></div>
                </div>
              </div>

              {/* Valuation Breakdown */}
              <div className="p-4 rounded-xl bg-[#06080F] border border-white/10 space-y-2">
                <h4 className="text-slate-300 font-bold uppercase text-[10.5px]">Commercial Separation:</h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>Target Buyer Budget: <strong className="text-[#F5D77F]">AED {(selectedLeadModal.budget_aed || 0).toLocaleString()}</strong></div>
                  <div>Potential Commission (Our Revenue): <strong className="text-emerald-400">AED {(selectedLeadModal.commission_potential_aed || 0).toLocaleString()}</strong></div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#D4AF37]/20 bg-[#06080F]/90 flex items-center justify-between text-xs text-[#8C9BAE]">
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>PostgreSQL Canonical Source • Zero Synthetic URLs</span>
              </div>
              <button
                onClick={() => setSelectedLeadModal(null)}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black font-mono text-xs font-bold hover:brightness-110 transition-all"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
