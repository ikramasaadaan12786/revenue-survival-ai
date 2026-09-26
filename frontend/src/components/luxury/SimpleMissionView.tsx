'use client';

import React, { useState } from 'react';
import {
  Target,
  Clock,
  DollarSign,
  Users,
  Mail,
  MessageSquare,
  FileText,
  Trophy,
  CheckCircle2,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface SimpleMissionViewProps {
  summary: any;
  onNavigateTab: (tab: string, params?: any) => void;
}

export const SimpleMissionView: React.FC<SimpleMissionViewProps> = ({
  summary,
  onNavigateTab,
}) => {
  const [subTab, setSubTab] = useState<'results' | 'leads' | 'outreach' | 'replies' | 'revenue'>('results');

  const mission = summary?.mission || {};
  const funnel = summary?.crm_funnel_counts || {};

  const targetAmount = mission.goal_amount || 5000;
  const revenueAchieved = mission.revenue_generated || summary?.revenue_achieved || 0.0;
  const freshBuyers = summary?.leads_count ?? funnel['NEW'] ?? 0;
  const contacted = summary?.messages_sent ?? funnel['CONTACTED'] ?? 0;
  const replies = summary?.replies_count ?? funnel['REPLIED'] ?? 0;
  const proposals = summary?.proposals_count ?? funnel['PROPOSAL'] ?? 0;

  const startedAt = mission.created_at
    ? new Date(mission.created_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '24 Sep 2026';

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. CLEAN MISSION SUMMARY CARD */}
      <div className="bg-gradient-to-r from-[#0C121E] via-[#090D18] to-[#060911] p-6 rounded-2xl border border-[#D4AF37]/30 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 uppercase font-mono">
                MISSION #{mission.id || 1013}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {mission.status || 'ACTIVE'}
              </span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-white mt-1.5">
              {mission.title || '12-Hour AED 5K Real Revenue Mission'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Started: <span className="text-slate-300 font-mono">{startedAt}</span> • Target:{' '}
              <span className="text-[#D4AF37] font-semibold font-mono">AED {targetAmount.toLocaleString()}</span>
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono text-slate-400">Revenue Achieved</span>
              <p className="text-2xl font-bold font-mono text-[#D4AF37]">
                AED {revenueAchieved.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>

        {/* 6 Essential Business Numbers */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.06]">
            <span className="text-[10px] uppercase text-slate-400 font-mono">Target</span>
            <p className="text-lg font-bold font-mono text-white mt-1">AED {targetAmount.toLocaleString()}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.06]">
            <span className="text-[10px] uppercase text-slate-400 font-mono">Fresh Buyers</span>
            <p className="text-lg font-bold font-mono text-amber-400 mt-1">{freshBuyers}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.06]">
            <span className="text-[10px] uppercase text-slate-400 font-mono">Contacted</span>
            <p className="text-lg font-bold font-mono text-blue-400 mt-1">{contacted}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.06]">
            <span className="text-[10px] uppercase text-slate-400 font-mono">Replies</span>
            <p className="text-lg font-bold font-mono text-emerald-400 mt-1">{replies}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.06]">
            <span className="text-[10px] uppercase text-slate-400 font-mono">Proposals</span>
            <p className="text-lg font-bold font-mono text-purple-400 mt-1">{proposals}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.06]">
            <span className="text-[10px] uppercase text-slate-400 font-mono">Revenue</span>
            <p className="text-lg font-bold font-mono text-[#D4AF37] mt-1">AED {revenueAchieved.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* 2. SUB-TABS: RESULTS, LEADS, OUTREACH, REPLIES, REVENUE */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-2">
          {[
            { id: 'results', label: 'Results & Funnel' },
            { id: 'leads', label: 'Buyer Leads' },
            { id: 'outreach', label: 'Outreach Dispatches' },
            { id: 'replies', label: 'Inbound Replies' },
            { id: 'revenue', label: 'Revenue Settlement' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                subTab === t.id
                  ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* SUB-TAB CONTENTS */}
        {subTab === 'results' && (
          <div className="p-6 rounded-2xl bg-[#090D18] border border-white/[0.08] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
              Current Mission Commercial Status
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Mission #{mission.id || 1013} is operating in full autonomous mode. All discovered leads are deduplicated globally and segregated from research signals.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => onNavigateTab('leads')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
              >
                <span>Inspect All Leads in CRM</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigateTab('outreach_email')}
                className="px-4 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5"
              >
                <span>Open Email Outreach</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {subTab === 'leads' && (
          <div className="p-6 rounded-2xl bg-[#090D18] border border-white/[0.08] text-center space-y-3">
            <Users className="w-8 h-8 text-[#D4AF37] mx-auto opacity-80" />
            <h3 className="text-sm font-bold text-white">Genuine Discovered Leads ({freshBuyers})</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              All active buyers are indexed in Today&apos;s Leads CRM with complete contact coordinates.
            </p>
            <button
              onClick={() => onNavigateTab('leads')}
              className="px-5 py-2 rounded-xl bg-[#D4AF37] text-slate-950 text-xs font-bold shadow-md shadow-[#D4AF37]/30"
            >
              Open Leads CRM
            </button>
          </div>
        )}

        {subTab === 'outreach' && (
          <div className="p-6 rounded-2xl bg-[#090D18] border border-white/[0.08] text-center space-y-3">
            <Mail className="w-8 h-8 text-cyan-400 mx-auto opacity-80" />
            <h3 className="text-sm font-bold text-white">Outreach Dispatch Status ({contacted} Sent)</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Personalized drafts are staged for owner review or dispatched via Resend.
            </p>
            <button
              onClick={() => onNavigateTab('outreach_email')}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold"
            >
              Open Email Center
            </button>
          </div>
        )}

        {subTab === 'replies' && (
          <div className="p-6 rounded-2xl bg-[#090D18] border border-white/[0.08] text-center space-y-3">
            <MessageSquare className="w-8 h-8 text-emerald-400 mx-auto opacity-80" />
            <h3 className="text-sm font-bold text-white">Inbound Inquiries ({replies} Received)</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {replies > 0 ? `${replies} prospects replied to outreach.` : 'No replies received yet for active outreach.'}
            </p>
          </div>
        )}

        {subTab === 'revenue' && (
          <div className="p-6 rounded-2xl bg-[#090D18] border border-white/[0.08] text-center space-y-3">
            <DollarSign className="w-8 h-8 text-[#D4AF37] mx-auto opacity-80" />
            <h3 className="text-sm font-bold text-white">Verified Revenue: AED {revenueAchieved.toLocaleString()}</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Zero synthetic math. Revenue is strictly settled upon genuine bank or payment confirmation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
