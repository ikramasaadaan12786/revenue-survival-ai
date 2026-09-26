'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  RefreshCw,
  Info,
  Clock
} from 'lucide-react';
import { Linkedin } from '@/components/luxury/LinkedInIcon';
import { api } from '@/lib/api';


interface LinkedInActionCenterViewProps {
  missionId?: number;
  onNavigateTab: (tab: string) => void;
}

export const LinkedInActionCenterView: React.FC<LinkedInActionCenterViewProps> = ({
  missionId,
  onNavigateTab,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);

  const fetchLinkedInCenter = async () => {
    try {
      setLoading(true);
      const res = await api.getLinkedInActionCenter(missionId);
      setData(res);
    } catch (err) {
      console.error('Error fetching LinkedIn center data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinkedInCenter();
  }, [missionId]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleMarkContacted = async (leadId: number) => {
    try {
      setActionInProgress(leadId);
      await api.markLeadContacted({
        lead_id: leadId,
        channel: 'LinkedIn',
        notes: 'Owner executed 1-on-1 personalized LinkedIn message.',
      });
      await fetchLinkedInCenter();
    } catch (err) {
      console.error('Error marking contacted:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const connection = data?.connection_status || {};
  const prospects = data?.prospects || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. HEADER */}
      <div className="bg-[#090D18] p-6 rounded-2xl border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/40 uppercase tracking-wider flex items-center gap-1.5">
              <Linkedin className="w-3.5 h-3.5" />
              LinkedIn Professional Hub
            </span>
            <span className="text-xs text-slate-400 font-mono">1-on-1 Owner Action Model</span>
          </div>
          <h1 className="text-xl font-serif font-bold text-white mt-1.5">LinkedIn Outreach Center</h1>
          <p className="text-xs text-slate-400">
            Compliant, high-converting outreach. Send customized, non-spam connection requests directly to decision-makers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchLinkedInCenter}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/[0.08] text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Prospects</span>
          </button>
        </div>
      </div>

      {/* 2. PROGRAMMATIC HONESTY BANNER */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/40 via-[#0B101D] to-[#070A12] border border-sky-500/40 shadow-lg space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>LinkedIn Account: CONNECTED</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold font-mono">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Automated DM API: NOT AVAILABLE</span>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            Granted Scopes: <code className="text-sky-300">openid profile email w_member_social</code>
          </span>
        </div>

        <div className="flex items-start gap-2.5 text-xs text-slate-300 bg-black/40 p-3 rounded-xl border border-white/[0.04]">
          <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {connection.explanation ||
              'LinkedIn official OAuth grants profile access and public feed posting. Automated 1-to-1 direct messaging requires the restricted LinkedIn Enterprise Partner tier. To protect account standing and maximize conversion, use the 1-click action buttons below to open prospect profiles and paste tailored notes.'}
          </p>
        </div>
      </div>

      {/* 3. VERIFIED PROSPECT LIST */}
      <div className="bg-[#090D18] rounded-2xl border border-white/[0.08] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
              Verified LinkedIn Decision-Makers ({prospects.length})
            </h2>
            <p className="text-[11px] text-slate-400">
              Each note is tailored under 300 characters and invites dialogue or WhatsApp (+971 58 878 8675).
            </p>
          </div>
        </div>

        {prospects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prospects.map((p: any) => {
              const isContacted = p.contact_status === 'CONTACTED';
              const cardKey = `prospect-${p.lead_id}`;

              return (
                <div
                  key={p.lead_id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                    isContacted
                      ? 'bg-slate-900/40 border-emerald-500/30'
                      : 'bg-[#0B101E] border-sky-500/30 hover:border-sky-500/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">{p.name}</span>
                        {isContacted && (
                          <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            CONTACTED
                          </span>
                        )}
                      </div>

                      {p.profile_url && (
                        <a
                          href={p.profile_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-sky-400 hover:underline flex items-center gap-1 font-mono"
                        >
                          <span>Open Profile</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <p className="text-xs text-slate-400">{p.company || 'Enterprise'}</p>

                    <div className="mt-3 p-3 rounded-xl bg-slate-900/80 border border-white/[0.06]">
                      <span className="text-[10px] uppercase font-mono text-slate-500">Stated Buyer Need</span>
                      <p className="text-xs text-slate-200 mt-0.5">{p.requirement}</p>
                    </div>

                    <div className="mt-3 p-3 rounded-xl bg-black/50 border border-white/[0.04]">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] uppercase font-mono text-[#D4AF37]">
                          Suggested 1-on-1 Note ({p.suggested_message.length} chars)
                        </span>
                        <button
                          onClick={() => handleCopy(p.suggested_message, cardKey)}
                          className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 font-mono"
                        >
                          {copiedKey === cardKey ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedKey === cardKey ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                        {p.suggested_message}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleCopy(p.suggested_message, cardKey)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedKey === cardKey ? 'Copied!' : 'Copy Note'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {p.profile_url && (
                        <a
                          href={p.profile_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleCopy(p.suggested_message, cardKey)}
                          className="px-3.5 py-2 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 text-xs font-semibold flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open Profile</span>
                        </a>
                      )}

                      {!isContacted ? (
                        <button
                          onClick={() => handleMarkContacted(p.lead_id)}
                          disabled={actionInProgress === p.lead_id}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                        >
                          Mark Contacted
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Contacted</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-xs">
            No LinkedIn prospects found in the current active mission.
          </div>
        )}
      </div>
    </div>
  );
};
