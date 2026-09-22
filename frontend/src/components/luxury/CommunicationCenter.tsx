'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, ShieldCheck, CheckCircle2, XCircle, Edit3, Send, Layers, Mail, Phone, RefreshCw, Check } from 'lucide-react';
import { api } from '@/lib/api';

interface CommunicationCenterProps {
  missionId?: number;
  onNavigateTab: (tabId: string) => void;
}

export const CommunicationCenter: React.FC<CommunicationCenterProps> = ({
  missionId = 1006,
  onNavigateTab,
}) => {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChannelFilter, setActiveChannelFilter] = useState<string>('ALL');
  const [editingCommId, setEditingCommId] = useState<number | null>(null);
  const [editedBody, setEditedBody] = useState<string>('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [batchApproving, setBatchApproving] = useState(false);

  const loadApprovals = async () => {
    setLoading(true);
    try {
      const res = await api.getCommunications(missionId).catch(() => []);
      const pending = (res || []).filter((c: any) => c.approval_status === 'PENDING');
      setApprovals(pending.length > 0 ? pending : (res || []));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, [missionId]);

  const handleReview = async (commId: number, status: 'APPROVED' | 'REJECTED', modifiedText?: string) => {
    try {
      await api.reviewCommunication(commId, status, modifiedText);
      setActionNotice(`Message #${commId} marked as ${status}.`);
      setEditingCommId(null);
      loadApprovals();
    } catch (e) {
      console.error(e);
    }
  };

  const handleBatchApprove = async () => {
    setBatchApproving(true);
    try {
      const res = await api.batchApprove(missionId);
      setActionNotice(`Batch authorized: ${res.approved_count || approvals.length} messages approved.`);
      loadApprovals();
    } catch (e) {
      console.error(e);
    } finally {
      setBatchApproving(false);
    }
  };

  const filteredApprovals = approvals.filter((c) => {
    if (activeChannelFilter === 'ALL') return true;
    return (c.channel || '').toUpperCase() === activeChannelFilter.toUpperCase();
  });

  return (
    <div className="space-y-6 w-full max-w-[1640px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#0C1222] via-[#080D18] to-[#04060A] border border-[#D4AF37]/40 shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-2xl font-serif font-black text-white">Safety Approval & Communication Center</h2>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Human-in-the-loop dispatch gate. Zero messages are transmitted to clients without explicit authorization.
          </p>
        </div>

        {/* Channel Filter & Batch Action */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-xl bg-[#04060A] border border-[#D4AF37]/30 p-0.5 text-xs font-mono">
            {['ALL', 'WHATSAPP', 'LINKEDIN', 'EMAIL'].map((ch) => (
              <button
                key={ch}
                onClick={() => setActiveChannelFilter(ch)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeChannelFilter === ch ? 'bg-[#D4AF37] text-black font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>

          <button
            onClick={handleBatchApprove}
            disabled={batchApproving || approvals.length === 0}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-mono text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Layers className="w-3.5 h-3.5" />
            {batchApproving ? 'Authorizing All...' : `Batch Authorize All (${approvals.length})`}
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {actionNotice}
        </div>
      )}

      {/* Communications Queue */}
      <div className="space-y-4">
        {filteredApprovals.length === 0 ? (
          <div className="p-16 rounded-2xl bg-[#080D18]/90 border border-white/10 text-center space-y-3">
            <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto opacity-70" />
            <h3 className="text-lg font-serif font-bold text-white">Safety Approval Queue is Clear</h3>
            <p className="text-xs text-slate-400 font-sans max-w-md mx-auto">
              All staged outbound messages have been processed. Run the Daily Operating Cycle or hunt new opportunities to stage additional pitches.
            </p>
            <button
              onClick={() => onNavigateTab('war_room')}
              className="mt-3 px-4 py-2 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F5D77F] text-xs font-mono font-bold hover:bg-[#D4AF37]/30"
            >
              Return to War Room
            </button>
          </div>
        ) : (
          filteredApprovals.map((comm) => {
            const isEditing = editingCommId === comm.id;

            return (
              <div
                key={comm.id}
                className="p-5 rounded-2xl bg-[#080D18]/90 border border-[#D4AF37]/30 shadow-[0_4px_20px_rgba(0,0,0,0.4)] space-y-4 transition-all hover:border-[#D4AF37]/60"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-[#D4AF37]/15 text-[#F5D77F] border border-[#D4AF37]/30 flex items-center gap-1">
                      {comm.channel === 'WhatsApp' ? <Phone className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
                      {comm.channel || 'Direct'}
                    </span>
                    <h4 className="font-bold text-white text-sm">
                      Target Lead #{comm.lead_id} {comm.subject ? `• ${comm.subject}` : ''}
                    </h4>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                      Step {comm.sequence_step || 1}: {comm.message_type || 'INITIAL_PITCH'}
                    </span>
                  </div>

                  <div className="text-xs font-mono text-slate-400">
                    Status: <span className="text-amber-400 font-bold">{comm.approval_status || 'PENDING'}</span>
                  </div>
                </div>

                {/* Body / Editing */}
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      rows={5}
                      value={editedBody}
                      onChange={(e) => setEditedBody(e.target.value)}
                      className="w-full p-3 rounded-xl bg-[#04060A] border border-[#D4AF37] text-xs text-white font-mono focus:outline-none"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingCommId(null)}
                        className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-mono text-slate-300 hover:bg-white/15"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReview(comm.id, 'APPROVED', editedBody)}
                        className="px-3 py-1.5 rounded-lg bg-[#D4AF37] text-black font-mono font-bold text-xs hover:brightness-110 flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Save & Authorize
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#04060A]/80 border border-white/5 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {comm.body}
                  </div>
                )}

                {/* Actions Toolbar */}
                {!isEditing && (
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="text-[11px] font-mono text-slate-400">
                      Provider: <span className="text-slate-300">{comm.provider_name || 'Autonomous WhatsApp Engine'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingCommId(comm.id);
                          setEditedBody(comm.body);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 font-mono text-xs flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Modify
                      </button>

                      <button
                        onClick={() => handleReview(comm.id, 'REJECTED')}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-mono text-xs flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>

                      <button
                        onClick={() => handleReview(comm.id, 'APPROVED')}
                        className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-mono text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Authorize Dispatch
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
