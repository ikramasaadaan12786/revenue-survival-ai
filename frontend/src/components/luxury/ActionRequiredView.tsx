'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Mail,
  Radio,
  CheckCircle2,
  XCircle,
  MessageSquare,
  FileText,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Send,
  RefreshCw
} from 'lucide-react';
import { Linkedin } from '@/components/luxury/LinkedInIcon';
import { api } from '@/lib/api';


interface ActionRequiredViewProps {
  missionId?: number;
  onNavigateTab: (tab: string) => void;
}

export const ActionRequiredView: React.FC<ActionRequiredViewProps> = ({
  missionId,
  onNavigateTab,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);

  const fetchActions = async () => {
    try {
      setLoading(true);
      const res = await api.getActionRequired(missionId);
      setData(res);
    } catch (err) {
      console.error('Error fetching required actions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, [missionId]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleApproveEmail = async (commId: number) => {
    try {
      setActionInProgress(commId);
      await api.reviewCommunication(commId, 'APPROVED');
      await fetchActions();
    } catch (err) {
      console.error('Error approving email:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRejectEmail = async (commId: number) => {
    try {
      setActionInProgress(commId);
      await api.reviewCommunication(commId, 'REJECTED');
      await fetchActions();
    } catch (err) {
      console.error('Error rejecting email:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleMarkContacted = async (leadId: number, channel: string, notes?: string) => {
    try {
      setActionInProgress(leadId);
      await api.markLeadContacted({ lead_id: leadId, channel, notes });
      await fetchActions();
    } catch (err) {
      console.error('Error marking contacted:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const emails = data?.emails_waiting_approval || [];
  const linkedinProspects = data?.linkedin_prospects || [];
  const platformProspects = data?.platform_prospects || [];
  const leadsReview = data?.leads_needing_review || [];
  const replies = data?.replies_needing_response || [];
  const proposals = data?.proposals_needing_approval || [];

  const totalActions = data?.total_actions_count || 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. HEADER */}
      <div className="bg-[#090D18] p-6 rounded-2xl border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Action Required Command Center
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {totalActions} Pending Items
            </span>
          </div>
          <h1 className="text-xl font-serif font-bold text-white mt-1.5">Owner To-Do List</h1>
          <p className="text-xs text-slate-400">
            One screen for all critical decisions. Review outreach drafts, execute 1-click LinkedIn actions, and verify leads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchActions}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Actions</span>
          </button>
        </div>
      </div>

      {/* 2. SUMMARY BADGES */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Emails to Approve', count: emails.length, color: 'text-cyan-400', icon: Mail },
          { label: 'LinkedIn to Contact', count: linkedinProspects.length, color: 'text-sky-400', icon: Linkedin },
          { label: 'Platform Prospects', count: platformProspects.length, color: 'text-purple-400', icon: Radio },
          { label: 'Leads to Review', count: leadsReview.length, color: 'text-amber-400', icon: ShieldCheck },
          { label: 'Replies to Answer', count: replies.length, color: 'text-emerald-400', icon: MessageSquare },
          { label: 'Proposals to Approve', count: proposals.length, color: 'text-[#D4AF37]', icon: FileText },
        ].map((sec, i) => {
          const Icon = sec.icon;
          return (
            <div key={i} className="p-3.5 rounded-xl bg-[#090D18] border border-white/[0.08]">
              <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-mono">
                <span>{sec.label}</span>
                <Icon className={`w-3.5 h-3.5 ${sec.color}`} />
              </div>
              <p className={`text-xl font-bold font-mono mt-1.5 ${sec.color}`}>{sec.count}</p>
            </div>
          );
        })}
      </div>

      {/* SECTION 1: EMAILS WAITING APPROVAL */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 flex items-center gap-2">
            <Mail className="w-4 h-4 text-cyan-400" />
            1. Emails Waiting Approval ({emails.length})
          </h2>
          {emails.length > 0 && (
            <button
              onClick={() => onNavigateTab('outreach_email')}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Open Email Action Center</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {emails.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emails.map((e: any) => (
              <div key={e.comm_id} className="p-5 rounded-2xl bg-[#090D18] border border-cyan-500/30 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{e.name}</span>
                    <span className="text-xs font-mono text-cyan-400">{e.email}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{e.company}</p>

                  <div className="mt-3 p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-1.5">
                    <span className="text-[10px] uppercase font-mono text-slate-500">Subject</span>
                    <p className="text-xs font-semibold text-slate-200">{e.subject}</p>
                    <span className="text-[10px] uppercase font-mono text-slate-500 mt-2 block">Body Preview</span>
                    <p className="text-xs text-slate-300 line-clamp-3 whitespace-pre-wrap">{e.body}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => handleRejectEmail(e.comm_id)}
                    disabled={actionInProgress === e.comm_id}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApproveEmail(e.comm_id)}
                    disabled={actionInProgress === e.comm_id}
                    className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white text-xs font-bold shadow-md shadow-cyan-500/20"
                  >
                    Approve &amp; Send
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-[#090D18]/50 border border-white/[0.04] text-xs text-slate-500 text-center">
            No emails waiting approval. All drafts approved or queued.
          </div>
        )}
      </div>

      {/* SECTION 2: LINKEDIN PROSPECTS TO CONTACT */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400 flex items-center gap-2">
            <Linkedin className="w-4 h-4 text-sky-400" />
            2. LinkedIn Prospects to Contact ({linkedinProspects.length})
          </h2>
          {linkedinProspects.length > 0 && (
            <button
              onClick={() => onNavigateTab('outreach_linkedin')}
              className="text-xs text-sky-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Open LinkedIn Action Center</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {linkedinProspects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {linkedinProspects.map((p: any) => (
              <div key={p.lead_id} className="p-5 rounded-2xl bg-[#090D18] border border-sky-500/30 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{p.name}</span>
                    <a
                      href={p.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-sky-400 hover:underline flex items-center gap-1 font-mono"
                    >
                      <span>Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-400">{p.company || 'Enterprise'}</p>

                  <div className="mt-2.5 p-2.5 rounded-lg bg-slate-900/80 border border-white/[0.06]">
                    <span className="text-[10px] uppercase font-mono text-slate-500">Requirement</span>
                    <p className="text-xs text-slate-200 line-clamp-2">{p.requirement}</p>
                  </div>

                  <div className="mt-2.5 p-2.5 rounded-lg bg-black/40 border border-white/[0.04]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase font-mono text-[#D4AF37]">Suggested 1-on-1 Note</span>
                      <button
                        onClick={() => handleCopy(p.suggested_message, `li-${p.lead_id}`)}
                        className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedKey === `li-${p.lead_id}` ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedKey === `li-${p.lead_id}` ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap">{p.suggested_message}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <a
                    href={p.profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleCopy(p.suggested_message, `li-${p.lead_id}`)}
                    className="px-3 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 text-xs font-semibold flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open &amp; Copy</span>
                  </a>
                  <button
                    onClick={() => handleMarkContacted(p.lead_id, 'LinkedIn', 'Message sent via LinkedIn profile')}
                    disabled={actionInProgress === p.lead_id}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                  >
                    Mark Contacted
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-[#090D18]/50 border border-white/[0.04] text-xs text-slate-500 text-center">
            No LinkedIn prospects awaiting manual action.
          </div>
        )}
      </div>

      {/* SECTION 3: PLATFORM PROSPECTS (REDDIT / TELEGRAM) */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-purple-400 flex items-center gap-2">
          <Radio className="w-4 h-4 text-purple-400" />
          3. Platform Inquiries to Contact ({platformProspects.length})
        </h2>

        {platformProspects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {platformProspects.map((p: any) => (
              <div key={p.lead_id} className="p-5 rounded-2xl bg-[#090D18] border border-purple-500/30 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{p.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      {p.platform}
                    </span>
                  </div>

                  <div className="mt-2.5 p-2.5 rounded-lg bg-slate-900/80 border border-white/[0.06]">
                    <span className="text-[10px] uppercase font-mono text-slate-500">Requirement</span>
                    <p className="text-xs text-slate-200">{p.requirement}</p>
                  </div>

                  <div className="mt-2.5 p-2.5 rounded-lg bg-black/40 border border-white/[0.04]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase font-mono text-[#D4AF37]">Suggested Response</span>
                      <button
                        onClick={() => handleCopy(p.suggested_response, `plat-${p.lead_id}`)}
                        className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedKey === `plat-${p.lead_id}` ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedKey === `plat-${p.lead_id}` ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-3 whitespace-pre-wrap">{p.suggested_response}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  {p.source_url && (
                    <a
                      href={p.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleCopy(p.suggested_response, `plat-${p.lead_id}`)}
                      className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Post &amp; Copy</span>
                    </a>
                  )}
                  <button
                    onClick={() => handleMarkContacted(p.lead_id, p.platform, `Responded on ${p.platform}`)}
                    disabled={actionInProgress === p.lead_id}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                  >
                    Mark Contacted
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-[#090D18]/50 border border-white/[0.04] text-xs text-slate-500 text-center">
            No platform inquiries awaiting owner response.
          </div>
        )}
      </div>

      {/* SECTION 4: LEADS NEEDING REVIEW */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          4. Leads Needing Verification ({leadsReview.length})
        </h2>

        {leadsReview.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leadsReview.map((r: any) => (
              <div key={r.lead_id} className="p-5 rounded-2xl bg-[#090D18] border border-amber-500/30 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{r.name}</span>
                    <span className="text-xs text-slate-400">{r.source}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{r.company || 'Enterprise'}</p>
                  <p className="text-xs text-slate-300 mt-2 line-clamp-2">{r.requirement}</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => onNavigateTab('leads')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    Inspect in CRM
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-[#090D18]/50 border border-white/[0.04] text-xs text-slate-500 text-center">
            All active leads are verified.
          </div>
        )}
      </div>
    </div>
  );
};
