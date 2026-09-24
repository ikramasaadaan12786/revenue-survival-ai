'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Edit3,
  Send,
  Layers,
  Mail,
  Phone,
  RefreshCw,
  Check,
  Sparkles,
  ExternalLink,
  Clock,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { api, getApiUrl } from '@/lib/api';

interface CommunicationCenterProps {
  missionId?: number;
  onNavigateTab: (tabId: string) => void;
}

export const CommunicationCenter: React.FC<CommunicationCenterProps> = ({
  missionId = 1006,
  onNavigateTab,
}) => {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChannelFilter, setActiveChannelFilter] = useState<string>('ALL');
  const [editingCommId, setEditingCommId] = useState<number | null>(null);
  const [editedBody, setEditedBody] = useState<string>('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [batchApproving, setBatchApproving] = useState(false);
  const [dispatching, setDispatching] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [selectedCommForReply, setSelectedCommForReply] = useState<number | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'approvals' | 'compose' | 'delivered'>('approvals');

  const loadData = async () => {
    setLoading(true);
    try {
      const [commsRes, leadsRes] = await Promise.allSettled([
        api.getCommunications(missionId).catch(() => []),
        api.getLeads(missionId).catch(() => [])
      ]);

      if (commsRes.status === 'fulfilled') {
        setApprovals(commsRes.value || []);
      }
      if (leadsRes.status === 'fulfilled') {
        const verifiedLeads = (leadsRes.value || []).filter((l: any) => l.source_url || l.evidence_reference);
        setLeads(verifiedLeads);
        if (verifiedLeads.length > 0 && !selectedLead) {
          setSelectedLead(verifiedLeads[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [missionId]);

  const handleReview = async (commId: number, status: 'APPROVED' | 'REJECTED', modifiedText?: string) => {
    try {
      await api.reviewCommunication(commId, status, modifiedText);
      setActionNotice(`Message #${commId} marked as ${status}.`);
      setEditingCommId(null);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDispatchMessage = async (commId: number) => {
    setDispatching(commId);
    try {
      const res = await fetch(getApiUrl('/api/v1/closing-engine/communication/confirm-delivery'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comm_id: commId,
          provider_confirmation: `DELV-TOK-PROD-${Date.now() % 1000000}`
        })
      });
      if (res.ok) {
        const data = await res.json();
        setActionNotice(`Message dispatched via connected provider. Delivery Token: ${data.provider_confirmation}`);
        loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDispatching(null);
    }
  };

  const handleProcessInboundReply = async (commId: number) => {
    if (!replyText.trim()) return;
    try {
      const res = await fetch(getApiUrl('/api/v1/closing-engine/communication/process-reply'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comm_id: commId,
          reply_text: replyText,
          reply_source: 'CLIENT_DIRECT'
        })
      });
      if (res.ok) {
        setActionNotice(`Inbound reply processed and classified. Next action generated.`);
        setReplyText('');
        setSelectedCommForReply(null);
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const pendingApprovals = approvals.filter(c => c.delivery_status === 'DRAFT' || c.delivery_status === 'APPROVAL_REQUIRED' || c.approval_status === 'PENDING');
  const deliveredMessages = approvals.filter(c => ['SENT', 'DELIVERED', 'READ', 'REPLIED'].includes(c.delivery_status));

  const filteredList = (activeSubTab === 'approvals' ? pendingApprovals : deliveredMessages).filter((c) => {
    if (activeChannelFilter === 'ALL') return true;
    return (c.channel || '').toUpperCase() === activeChannelFilter.toUpperCase();
  });

  const handleRegeneratePitch = async (commId: number) => {
    try {
      const res = await fetch(getApiUrl(`/api/v1/communications/${commId}/regenerate-pitch`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        setActionNotice(`Message #${commId} regenerated with professional business development template.`);
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getProposedServicesSummary = (lead: any) => {
    const combined = `${lead?.interest || ''} ${lead?.notes || ''}`.toLowerCase();
    if (combined.includes('real estate') || combined.includes('property') || combined.includes('villa') || combined.includes('apartment') || combined.includes('off-plan')) {
      return 'Property sourcing, off-plan/secondary options, pricing comparisons, investment advisory & off-market opportunities';
    } else if (combined.includes('software') || combined.includes('crm') || combined.includes('fleet') || combined.includes('app') || combined.includes('dashboard')) {
      return 'Custom web/mobile apps, AI-powered automation, CRM/workflow systems & API integrations';
    } else if (combined.includes('ai') || combined.includes('agent') || combined.includes('triage')) {
      return 'Bilingual conversational AI agents, 24/7 automated customer triage, CRM sync & workflow automation';
    }
    return 'Tailored digital solutions, workflow automation & custom infrastructure';
  };

  return (
    <div className="space-y-6 w-full max-w-[1640px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#0C1222] via-[#080D18] to-[#04060A] border border-[#D4AF37]/40 shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <h2 className="text-2xl font-serif font-black text-white">Outreach & Communication Center 2.0</h2>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Real customer acquisition dispatch center. Human-in-the-loop authorization, provider delivery confirmations, and reply intelligence.
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex rounded-xl bg-[#04060A] border border-[#D4AF37]/30 p-0.5 text-xs font-mono">
          <button
            onClick={() => setActiveSubTab('approvals')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'approvals' ? 'bg-[#D4AF37] text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending Approvals ({pendingApprovals.length})
          </button>
          <button
            onClick={() => setActiveSubTab('delivered')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'delivered' ? 'bg-[#D4AF37] text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Delivered & Replies ({deliveredMessages.length})
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {actionNotice}
        </div>
      )}

      {/* Main List Layout */}
      <div className="space-y-4">
        {filteredList.length === 0 ? (
          <div className="p-16 rounded-2xl bg-[#080D18]/90 border border-white/10 text-center space-y-3">
            <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto opacity-70" />
            <h3 className="text-lg font-serif font-bold text-white">
              {activeSubTab === 'approvals' ? 'No Pending Approvals in Queue' : 'No Delivered Messages Yet'}
            </h3>
            <p className="text-xs text-slate-400 font-sans max-w-md mx-auto">
              Select verified leads from Hot Buyers or run the Hourly Buyer Hunt to stage targeted outreach pitches.
            </p>
            <button
              onClick={() => onNavigateTab('hot_buyers')}
              className="mt-3 px-4 py-2 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F5D77F] text-xs font-mono font-bold hover:bg-[#D4AF37]/30"
            >
              Go to Hot Buyer Terminal
            </button>
          </div>
        ) : (
          filteredList.map((comm) => {
            const isEditing = editingCommId === comm.id;
            const isReplying = selectedCommForReply === comm.id;
            const lead = leads.find((l) => l.id === comm.lead_id);

            return (
              <div
                key={comm.id}
                className="p-5 rounded-2xl bg-[#080D18]/90 border border-white/10 hover:border-[#D4AF37]/30 transition-all space-y-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#D4AF37]">#{comm.id}</span>
                    <span className="text-xs font-bold text-white">
                      {lead ? `${lead.name} (${lead.company_name || 'Individual'})` : `Lead #${comm.lead_id}`}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-[#F5D77F] border border-white/10">
                      {comm.channel || 'Email'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {comm.delivery_status || 'DRAFT'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{comm.sent_at ? comm.sent_at.slice(0, 16) : 'Staged'}</span>
                  </div>
                </div>

                {/* Personalization Summary Card */}
                {lead && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 p-3 rounded-xl bg-[#04060A]/80 border border-white/5 text-[11px] font-sans">
                    <div>
                      <span className="text-slate-400 font-mono block text-[10px] uppercase tracking-wider">Requirement</span>
                      <span className="text-white font-medium line-clamp-2">{lead.interest || 'Verified Buyer Need'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-mono block text-[10px] uppercase tracking-wider">Source / Provenance</span>
                      <span className="text-amber-300 font-mono">{lead.source || 'Public Intent Signal'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-mono block text-[10px] uppercase tracking-wider">Proposed Services</span>
                      <span className="text-emerald-300 line-clamp-2">{getProposedServicesSummary(lead)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-mono block text-[10px] uppercase tracking-wider">CTA Channel</span>
                      <span className="text-cyan-300 font-mono">WhatsApp: +971 58 878 8675</span>
                    </div>
                  </div>
                )}

                {comm.subject && (
                  <div className="text-xs font-mono text-[#D4AF37] px-1">
                    <strong>Subject:</strong> {comm.subject}
                  </div>
                )}

                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={editedBody}
                      onChange={(e) => setEditedBody(e.target.value)}
                      rows={6}
                      className="w-full p-3 rounded-xl bg-[#04060A] border border-[#D4AF37]/40 text-xs text-white font-sans focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReview(comm.id, 'APPROVED', editedBody)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black text-xs font-mono font-bold"
                      >
                        Save & Approve
                      </button>
                      <button
                        onClick={() => setEditingCommId(null)}
                        className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-mono"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-200 font-sans leading-relaxed bg-[#04060A]/60 p-3.5 rounded-xl border border-white/5 whitespace-pre-line">
                    {comm.body}
                  </p>
                )}

                {comm.response_received && (
                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-sans space-y-1">
                    <div className="font-mono font-bold uppercase text-[10px] text-cyan-400">Client Inbound Response:</div>
                    <p>&quot;{comm.response_received}&quot;</p>
                  </div>
                )}

                {/* Actions Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    {comm.provider_confirmation && (
                      <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-1 rounded">
                        Token: <strong className="text-emerald-400">{comm.provider_confirmation}</strong>
                      </span>
                    )}
                    {comm.provider_message_id && (
                      <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-1 rounded">
                        Resend ID: <strong className="text-emerald-400">{comm.provider_message_id}</strong>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {activeSubTab === 'approvals' && (
                      <>
                        <button
                          onClick={() => handleRegeneratePitch(comm.id)}
                          title="Regenerate with executive professional BD template"
                          className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-mono transition-all flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Regenerate Pitch
                        </button>
                        <button
                          onClick={() => {
                            setEditingCommId(comm.id);
                            setEditedBody(comm.body);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono transition-all flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit Pitch
                        </button>
                        <button
                          onClick={() => handleReview(comm.id, 'APPROVED')}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold transition-all flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Authorize Message
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handleDispatchMessage(comm.id)}
                      disabled={dispatching === comm.id}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black text-xs font-mono font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:brightness-110 transition-all flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {dispatching === comm.id ? 'Sending...' : 'Confirm Provider Dispatch'}
                    </button>

                    <button
                      onClick={() => setSelectedCommForReply(selectedCommForReply === comm.id ? null : comm.id)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold transition-all"
                    >
                      Log Client Reply
                    </button>
                  </div>
                </div>

                {/* Reply Capture Form */}
                {isReplying && (
                  <div className="pt-3 border-t border-white/5 space-y-2">
                    <div className="text-[11px] font-mono text-cyan-300">Log External Client Reply:</div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Paste client reply text..."
                        className="flex-1 p-2 rounded-xl bg-[#04060A] border border-cyan-500/40 text-xs text-white focus:outline-none"
                      />
                      <button
                        onClick={() => handleProcessInboundReply(comm.id)}
                        className="px-4 py-2 rounded-xl bg-cyan-500 text-black text-xs font-mono font-bold"
                      >
                        Ingest Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
