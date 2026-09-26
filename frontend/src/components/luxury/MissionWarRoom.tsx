'use client';

import React, { useState, useEffect } from 'react';
import { Target, Zap, Clock, ShieldCheck, ArrowUpRight, Flame, Send, CheckCircle2, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import { getApiUrl } from '@/lib/api';

interface PriorityLead {
  lead_id: number;
  name: string;
  company: string;
  source: string;
  industry: string;
  offer: string;
  expected_revenue: number;
  closing_probability_percent: number;
  weighted_revenue: number;
  recommended_action: string;
  approval_id?: number;
  classification?: string;
}

interface SprintData {
  target_revenue_aed: number;
  revenue_gap_aed: number;
  remaining_hours: number;
  required_velocity_aed_hr: number;
  fastest_closing_opportunity?: {
    name: string;
    offer: string;
    expected_revenue: number;
    closing_probability_percent: number;
  };
  fastest_offer?: {
    offer_name: string;
    price_aed: number;
    delivery_timeline: string;
    reason: string;
  };
  fastest_channel?: {
    channel: string;
    response_time: string;
    confidence_score: number;
  };
  tactical_closing_plan: string[];
}


interface TargetPlanData {
  quotas: {
    calls_needed: number;
    messages_needed: number;
    offers_needed: number;
    expected_conversion_percent: number;
  };
  executive_directives: string[];
  strategy_summary: string;
}

interface MissionWarRoomProps {
  missionId?: number;
  missionTitle?: string;
  targetRevenue?: number;
  currentRevenue?: number;
  onNavigateTab: (tabId: string) => void;
}

export const MissionWarRoom: React.FC<MissionWarRoomProps> = ({
  missionId,
  missionTitle = 'Autonomous Revenue Sprint',
  targetRevenue = 0,
  currentRevenue = 0,
  onNavigateTab,
}) => {
  const [priorityQueue, setPriorityQueue] = useState<PriorityLead[]>([]);

  const [sprintData, setSprintData] = useState<SprintData>({
    target_revenue_aed: targetRevenue || 0,
    revenue_gap_aed: Math.max(0, targetRevenue - currentRevenue),
    remaining_hours: 0,
    required_velocity_aed_hr: 0,
    fastest_closing_opportunity: undefined,
    fastest_offer: undefined,
    fastest_channel: undefined,
    tactical_closing_plan: [],
  });

  const [targetPlan, setTargetPlan] = useState<TargetPlanData>({
    quotas: {
      calls_needed: 0,
      messages_needed: 0,
      offers_needed: 0,
      expected_conversion_percent: 0,
    },
    executive_directives: [],
    strategy_summary: 'Dynamic strategy aligned to production mission telemetry.',
  });

  const [approvedLeads, setApprovedLeads] = useState<number[]>([]);

  useEffect(() => {
    const fetchWarRoomData = async () => {
      try {
        const [queueRes, sprintRes, planRes] = await Promise.allSettled([
          fetch(getApiUrl(`/api/v1/closing-engine/priority-queue/${missionId}`)),
          fetch(getApiUrl(`/api/v1/closing-engine/revenue-sprint/${missionId}`)),
          fetch(getApiUrl(`/api/v1/ceo-brain/target-achievement-plan/${missionId}`)),
        ]);

        if (queueRes.status === 'fulfilled' && queueRes.value.ok) {
          const qJson = await queueRes.value.json();
          if (Array.isArray(qJson) && qJson.length > 0) {
            setPriorityQueue(qJson);
          }
        }

        if (sprintRes.status === 'fulfilled' && sprintRes.value.ok) {
          const sJson = await sprintRes.value.json();
          if (sJson && sJson.target_revenue_aed) {
            setSprintData(sJson);
          }
        }

        if (planRes.status === 'fulfilled' && planRes.value.ok) {
          const pJson = await planRes.value.json();
          if (pJson && pJson.quotas) {
            setTargetPlan(pJson);
          }
        }
      } catch (e) {
        console.error('War Room fetch failed', e);
      }
    };

    fetchWarRoomData();
    const interval = setInterval(fetchWarRoomData, 15000);
    return () => clearInterval(interval);
  }, [missionId]);

  const handleApproveAction = (leadId: number) => {
    setApprovedLeads((prev) => [...prev, leadId]);
    setTimeout(() => {
      onNavigateTab('comms_center');
    }, 400);
  };

  const revenueGap = Math.max(0, targetRevenue - currentRevenue);

  return (
    <div className="w-full space-y-6">
      {/* 1. War Room Strategic Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0C1222] via-[#080D18] to-[#04060A] border-2 border-[#D4AF37]/50 shadow-[0_0_35px_rgba(212,175,55,0.2)] p-6 md:p-8">
        {/* Glow orb */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/60 text-[#F5D77F] text-xs font-mono font-black tracking-widest uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                MISSION WAR ROOM • REVENUE SPRINT
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold">
                PHASE 13 OPTIMIZED
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] via-[#F5D77F] to-[#D4AF37]">
              {missionTitle}
            </h2>
            <p className="text-sm text-slate-400 font-sans max-w-2xl">
              High-conviction closing engine tracking real buyer intent, deal probability weights, and fastest path to target.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#04060A]/80 border border-[#D4AF37]/30 rounded-xl p-4 backdrop-blur-md">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Target</div>
              <div className="text-lg font-mono font-black text-[#F5D77F]">
                AED {targetRevenue.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Time Left</div>
              <div className="text-lg font-mono font-black text-amber-400 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {sprintData.remaining_hours}h
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Revenue Gap</div>
              <div className="text-lg font-mono font-black text-rose-400">
                AED {revenueGap.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Required Pace</div>
              <div className="text-lg font-mono font-black text-emerald-400">
                {sprintData.required_velocity_aed_hr} <span className="text-[10px]">AED/h</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Middle Grid: Top 5 Priority Closing Queue + Revenue Sprint Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (8 Cols): Top 5 Priority Queue */}
        <div className="lg:col-span-8 rounded-2xl bg-[#080D18]/90 border border-[#D4AF37]/30 shadow-[0_4px_20px_rgba(0,0,0,0.5)] p-6 space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-serif font-bold text-white">
                Safety Approval Priority Queue (Top 5 to Contact First)
              </h3>
            </div>
            <span className="text-xs font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded-full border border-[#D4AF37]/30">
              Strict 5-Dimension Scored
            </span>
          </div>

          <div className="space-y-3">
            {priorityQueue.map((item, idx) => {
              const isApproved = approvedLeads.includes(item.lead_id);
              const isHot = item.classification === 'HOT BUYER' || item.closing_probability_percent >= 80;

              return (
                <div
                  key={item.lead_id}
                  className={`p-4 rounded-xl border transition-all duration-200 ${
                    isHot
                      ? 'bg-gradient-to-r from-[#D4AF37]/10 via-[#0B101D] to-[#04060A] border-[#D4AF37]/50 shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                      : 'bg-[#04060A]/60 border-white/10 hover:border-[#D4AF37]/30'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#D4AF37]">#{idx + 1}</span>
                        <h4 className="font-bold text-white text-sm md:text-base flex items-center gap-2">
                          {item.name}
                          {isHot && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              HOT BUYER
                            </span>
                          )}
                        </h4>
                      </div>
                      <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
                        <span className="text-[#F5D77F]">{item.company}</span>
                        <span>•</span>
                        <span className="text-slate-300 font-mono text-[11px]">{item.source}</span>
                        <span>•</span>
                        <span className="text-slate-400">{item.industry}</span>
                      </div>
                      <div className="text-xs text-slate-300 pt-1">
                        <span className="text-slate-400">Offer: </span>
                        <span className="font-semibold text-emerald-400">{item.offer}</span>
                      </div>
                    </div>

                    {/* Financial Metrics & Action */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-mono text-slate-400">Expected / Weighted</div>
                        <div className="text-sm font-mono font-bold text-[#F5D77F]">
                          AED {item.expected_revenue.toLocaleString()}
                        </div>
                        <div className="text-[11px] font-mono text-emerald-400">
                          {item.closing_probability_percent}% Prob (AED {item.weighted_revenue.toLocaleString()})
                        </div>
                      </div>

                      <button
                        onClick={() => handleApproveAction(item.lead_id)}
                        disabled={isApproved}
                        className={`px-3 py-2 rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
                          isApproved
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                            : 'bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black hover:brightness-110 shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                        }`}
                      >
                        {isApproved ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approved
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            Authorize
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Recommendation pill */}
                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">
                      <strong className="text-slate-300">Action:</strong> {item.recommended_action}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right (4 Cols): Revenue Sprint Mode + CEO Brain Quotas */}
        <div className="lg:col-span-4 space-y-6">
          {/* Revenue Sprint Card */}
          <div className="rounded-2xl bg-gradient-to-b from-[#0C1222] to-[#04060A] border border-[#D4AF37]/40 shadow-[0_4px_20px_rgba(0,0,0,0.5)] p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#F5D77F]" />
              <h3 className="text-base font-serif font-bold text-white">Revenue Sprint Mode</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#04060A]/80 border border-[#D4AF37]/20 space-y-1">
                <div className="text-[10px] uppercase font-mono text-slate-400">Fastest Closing Opportunity</div>
                <div className="font-bold text-white">{sprintData.fastest_closing_opportunity?.name || 'Enterprise Client'}</div>
                <div className="text-[#F5D77F] font-mono">
                  {sprintData.fastest_closing_opportunity?.closing_probability_percent || 80}% Prob • {sprintData.fastest_closing_opportunity?.offer || 'Consultation'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#04060A]/80 border border-[#D4AF37]/20 space-y-1">
                <div className="text-[10px] uppercase font-mono text-slate-400">Fastest Offer (24h Turnaround)</div>
                <div className="font-bold text-emerald-400">{sprintData.fastest_offer?.offer_name || 'AI Automation Solution'}</div>
                <div className="text-slate-300">
                  AED {(sprintData.fastest_offer?.price_aed || 3000).toLocaleString()} • {sprintData.fastest_offer?.delivery_timeline || '24-48 Hours'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#04060A]/80 border border-[#D4AF37]/20 space-y-1">
                <div className="text-[10px] uppercase font-mono text-slate-400">Fastest Channel</div>
                <div className="font-bold text-amber-300">{sprintData.fastest_channel?.channel || 'Direct Email / Resend'}</div>
                <div className="text-slate-400">Avg response: {sprintData.fastest_channel?.response_time || '< 2 hours'}</div>
              </div>
            </div>

          </div>

          {/* CEO Brain Target Achievement Plan */}
          <div className="rounded-2xl bg-[#080D18]/90 border border-emerald-500/30 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-serif font-bold text-white">CEO Target Achievement Plan</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {targetPlan.strategy_summary}
            </p>

            {/* Quotas grid */}
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-[#04060A]/70 border border-white/5">
                <div className="text-[10px] text-slate-400 uppercase">Calls Needed</div>
                <div className="text-base font-bold text-[#F5D77F]">{targetPlan.quotas.calls_needed}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#04060A]/70 border border-white/5">
                <div className="text-[10px] text-slate-400 uppercase">Messages Needed</div>
                <div className="text-base font-bold text-emerald-400">{targetPlan.quotas.messages_needed}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#04060A]/70 border border-white/5">
                <div className="text-[10px] text-slate-400 uppercase">Offers Needed</div>
                <div className="text-base font-bold text-amber-300">{targetPlan.quotas.offers_needed}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#04060A]/70 border border-white/5">
                <div className="text-[10px] text-slate-400 uppercase">Conversion Exp.</div>
                <div className="text-base font-bold text-white">{targetPlan.quotas.expected_conversion_percent}%</div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigateTab('closing_engine')}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-mono text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                Open Safety Approval Gate
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
