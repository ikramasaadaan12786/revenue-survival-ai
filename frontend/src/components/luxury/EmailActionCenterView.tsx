'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  XCircle,
  Edit3,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { api } from '@/lib/api';

interface EmailActionCenterViewProps {
  missionId?: number;
  onNavigateTab: (tab: string) => void;
}

export const EmailActionCenterView: React.FC<EmailActionCenterViewProps> = ({
  missionId,
  onNavigateTab,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);

  // Edit Modal
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');

  // Test Email Modal
  const [isTestEmailOpen, setIsTestEmailOpen] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [testResult, setTestResult] = useState<any | null>(null);
  const [sendingTest, setSendingTest] = useState(false);

  const fetchEmailCenter = async () => {
    try {
      setLoading(true);
      const res = await api.getEmailActionCenter(missionId);
      setData(res);
    } catch (err) {
      console.error('Error loading email action center:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailCenter();
  }, [missionId]);

  const handleApprove = async (commId: number) => {
    try {
      setActionInProgress(commId);
      await api.reviewCommunication(commId, 'APPROVED');
      await fetchEmailCenter();
    } catch (err) {
      console.error('Error approving communication:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (commId: number) => {
    try {
      setActionInProgress(commId);
      await api.reviewCommunication(commId, 'REJECTED');
      await fetchEmailCenter();
    } catch (err) {
      console.error('Error rejecting communication:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleApproveAllVerified = async () => {
    try {
      setLoading(true);
      await api.batchApprove(missionId || 1013);
      await fetchEmailCenter();
    } catch (err) {
      console.error('Error batch approving:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingItem?.comm_id) return;
    try {
      setActionInProgress(editingItem.comm_id);
      await api.reviewCommunication(editingItem.comm_id, 'PENDING', editBody);
      setEditingItem(null);
      await fetchEmailCenter();
    } catch (err) {
      console.error('Error saving edit:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testRecipient) return;
    try {
      setSendingTest(true);
      setTestResult(null);
      const res = await api.sendTestEmail({
        recipient_email: testRecipient,
        subject: 'Revenue Survival AI — Resend Outbound Delivery Test',
        body: 'This is an authorized verification test from Revenue Survival AI.\nOutbound email infrastructure is fully verified and connected to Resend.',
      });
      setTestResult({ success: true, message: `Delivered! Resend ID: ${res.provider_message_id}` });
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Delivery failed' });
    } finally {
      setSendingTest(false);
    }
  };

  const summary = data?.summary || {};
  const items = data?.items || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            DELIVERED
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
            SUBMITTED
          </span>
        );
      case 'WAITING_OWNER_APPROVAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
            WAITING APPROVAL
          </span>
        );
      case 'QUEUED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            QUEUED FOR DISPATCH
          </span>
        );
      case 'NO_VERIFIED_EMAIL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-white/[0.08]">
            NO VERIFIED EMAIL
          </span>
        );
      case 'FAILED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            FAILED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-white/[0.08]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. HEADER */}
      <div className="bg-[#090D18] p-6 rounded-2xl border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              Resend Verified Outbound Channel
            </span>
            <span className="text-xs text-slate-400 font-mono">Official Resend REST API</span>
          </div>
          <h1 className="text-xl font-serif font-bold text-white mt-1.5">Email Outreach Command</h1>
          <p className="text-xs text-slate-400">
            Truth-based email execution. Clear delivery statuses, explicit blocker reasons, and safe owner approval workflows.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsTestEmailOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/[0.08] text-xs font-semibold transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-cyan-400" />
            <span>Send Test Email</span>
          </button>

          {summary.waiting_approval > 0 && (
            <button
              onClick={handleApproveAllVerified}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white text-xs font-bold shadow-md shadow-cyan-500/30 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Approve All Verified ({summary.waiting_approval})</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. TOP STAT COUNTERS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Ready to Send', count: summary.ready_to_send || 0, color: 'text-cyan-400', icon: Clock },
          { label: 'Waiting Approval', count: summary.waiting_approval || 0, color: 'text-amber-400', icon: AlertCircle },
          { label: 'Sent Today', count: summary.sent_today || 0, color: 'text-blue-400', icon: Send },
          { label: 'Delivered', count: summary.delivered || 0, color: 'text-emerald-400', icon: CheckCircle2 },
          { label: 'Replies', count: summary.replies || 0, color: 'text-purple-400', icon: Mail },
          { label: 'Missing Email', count: summary.no_verified_email || 0, color: 'text-slate-400', icon: XCircle },
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="p-4 rounded-xl bg-[#090D18] border border-white/[0.08]">
              <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-mono">
                <span>{c.label}</span>
                <Icon className={`w-3.5 h-3.5 ${c.color}`} />
              </div>
              <p className={`text-2xl font-bold font-mono mt-1.5 ${c.color}`}>{c.count}</p>
            </div>
          );
        })}
      </div>

      {/* 3. PROSPECT EMAIL QUEUE & REASONS */}
      <div className="bg-[#090D18] rounded-2xl border border-white/[0.08] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
              Lead Email Dispatch Queue ({items.length})
            </h2>
            <p className="text-[11px] text-slate-400">Personalized tailored drafts referencing genuine requirements</p>
          </div>
          <button
            onClick={fetchEmailCenter}
            disabled={loading}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {items.length > 0 ? (
          <div className="space-y-3.5">
            {items.map((item: any) => {
              const isWaiting = item.status === 'WAITING_OWNER_APPROVAL';
              const hasEmail = Boolean(item.recipient_email);

              return (
                <div
                  key={item.lead_id}
                  className={`p-5 rounded-xl border transition-all ${
                    isWaiting
                      ? 'bg-amber-950/10 border-amber-500/30'
                      : hasEmail
                      ? 'bg-[#0B101E] border-white/[0.06]'
                      : 'bg-[#080B14] border-white/[0.03]'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-white text-sm">{item.name}</span>
                        <span className="text-xs text-slate-400 font-mono">({item.company})</span>
                        {getStatusBadge(item.status)}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="font-mono text-cyan-400">{item.recipient_email || 'No email on profile'}</span>
                        <span>•</span>
                        <span className="text-slate-300">{item.requirement}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {isWaiting && (
                        <>
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setEditSubject(item.subject);
                              setEditBody(item.body);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Draft</span>
                          </button>
                          <button
                            onClick={() => handleReject(item.comm_id)}
                            disabled={actionInProgress === item.comm_id}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApprove(item.comm_id)}
                            disabled={actionInProgress === item.comm_id}
                            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white text-xs font-bold shadow-md shadow-cyan-500/20"
                          >
                            Approve &amp; Send
                          </button>
                        </>
                      )}

                      {!hasEmail && (
                        <button
                          onClick={() => onNavigateTab('leads')}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                        >
                          Enrich Contact
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status Reason & Draft Preview */}
                  <div className="mt-3 pt-3 border-t border-white/[0.04] grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="md:col-span-1">
                      <span className="text-[10px] uppercase font-mono text-slate-500 block">Status Explanation</span>
                      <p className="text-slate-300 mt-0.5">{item.status_reason}</p>
                    </div>

                    <div className="md:col-span-2 p-3 rounded-lg bg-black/40 border border-white/[0.04]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase font-mono text-cyan-400">Subject: {item.subject}</span>
                      </div>
                      <p className="text-slate-300 font-mono text-[11px] whitespace-pre-wrap line-clamp-2">
                        {item.body}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-xs">No email records found.</div>
        )}
      </div>

      {/* 4. EDIT DRAFT MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-[#0B101D] border border-[#D4AF37]/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="font-serif font-bold text-white text-base">Edit Email Draft</h3>
                <p className="text-xs text-slate-400">Prospect: {editingItem.name} ({editingItem.recipient_email})</p>
              </div>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Subject</label>
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Email Body</label>
                <textarea
                  rows={8}
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={actionInProgress === editingItem.comm_id}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. TEST EMAIL MODAL */}
      {isTestEmailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0B101D] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-cyan-400" />
                <h3 className="font-serif font-bold text-white text-base">Send Test Email</h3>
              </div>
              <button onClick={() => setIsTestEmailOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Sends an authorized test message via Resend to verify DNS SPF/DKIM and API credentials.
            </p>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Recipient Test Email
              </label>
              <input
                type="email"
                placeholder="you@yourdomain.com"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs ${
                  testResult.success
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                }`}
              >
                {testResult.message}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
              <button
                onClick={() => setIsTestEmailOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={handleSendTestEmail}
                disabled={sendingTest || !testRecipient}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30 flex items-center gap-1.5"
              >
                {sendingTest && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Send Test</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
