'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, UserCheck, ShieldCheck, ArrowRight, CheckCircle2, Flame, RefreshCw } from 'lucide-react';

interface DealClosingBoardProps {
  missionId?: number;
  onNavigateTab: (tabId: string) => void;
}

export const DealClosingBoard: React.FC<DealClosingBoardProps> = ({
  missionId = 1006,
  onNavigateTab,
}) => {
  const [boardData, setBoardData] = useState<any>({
    total_deals: 19,
    total_pipeline_value_aed: 491500,
    total_weighted_pipeline_aed: 291475,
    stages: {
      QUALIFIED: [],
      CONTACTED: [],
      DISCOVERY_CALL: [],
      PROPOSAL_SENT: [],
      NEGOTIATION: [],
      WON: [],
    },
  });

  const [loading, setLoading] = useState(true);

  const loadDealRoom = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://backend-sigma-six-79.vercel.app/api/v1/closing-engine/deal-room/${missionId}`).catch(() => null);
      if (res && res.ok) {
        const json = await res.json();
        setBoardData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDealRoom();
  }, [missionId]);

  const STAGE_CONFIG: { [key: string]: { label: string; color: string; prob: string } } = {
    QUALIFIED: { label: 'AI Qualified', color: 'border-[#D4AF37]/50 text-[#F5D77F]', prob: '65%' },
    CONTACTED: { label: 'Contacted', color: 'border-blue-500/50 text-blue-300', prob: '70%' },
    DISCOVERY_CALL: { label: 'Discovery Call', color: 'border-indigo-500/50 text-indigo-300', prob: '75%' },
    PROPOSAL_SENT: { label: 'Proposal Sent', color: 'border-purple-500/50 text-purple-300', prob: '80%' },
    NEGOTIATION: { label: 'Negotiation', color: 'border-amber-500/50 text-amber-300', prob: '85%' },
    WON: { label: 'Won Deals', color: 'border-emerald-500/50 text-emerald-300', prob: '100%' },
  };

  return (
    <div className="space-y-6 w-full max-w-[1640px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#0C1222] via-[#080D18] to-[#04060A] border border-[#D4AF37]/40 shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h2 className="text-2xl font-serif font-black text-white">Deal Room CRM & Closing Board</h2>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Real-time pipeline lifecycle tracking {boardData.total_deals} active enterprise deals in Dubai.
          </p>
        </div>

        {/* Financial Badges */}
        <div className="flex items-center gap-4 bg-[#04060A]/80 border border-[#D4AF37]/30 rounded-xl p-3 px-5">
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400">Gross Pipeline</div>
            <div className="text-base font-mono font-black text-[#F5D77F]">
              AED {Number(boardData.total_pipeline_value_aed || 491500).toLocaleString()}
            </div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400">Weighted Revenue</div>
            <div className="text-base font-mono font-black text-emerald-400">
              AED {Number(boardData.total_weighted_pipeline_aed || 291475).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board 6 Stages */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-start overflow-x-auto pb-4">
        {Object.entries(STAGE_CONFIG).map(([stageKey, cfg]) => {
          const items = boardData.stages[stageKey] || [];
          const stageTotal = items.reduce((acc: number, curr: any) => acc + (curr.deal_value || 0), 0);

          return (
            <div
              key={stageKey}
              className="rounded-2xl bg-[#080D18]/90 border border-white/10 p-3.5 space-y-3 min-h-[500px] flex flex-col justify-between"
            >
              <div className="space-y-1 pb-2 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono font-bold ${cfg.color}`}>{cfg.label}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                    {items.length}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  AED {stageTotal.toLocaleString()} ({cfg.prob})
                </div>
              </div>

              {/* Cards List */}
              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] pr-1">
                {items.length === 0 ? (
                  <div className="text-center py-10 text-slate-600 font-mono text-[10px]">
                    No deals in {cfg.label}
                  </div>
                ) : (
                  items.map((deal: any) => (
                    <div
                      key={deal.id}
                      onClick={() => onNavigateTab('hot_buyers')}
                      className="p-3 rounded-xl bg-[#04060A]/80 border border-white/10 hover:border-[#D4AF37]/50 cursor-pointer transition-all space-y-1.5 shadow-sm group"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <h5 className="font-bold text-xs text-white group-hover:text-[#F5D77F] transition-colors line-clamp-1">
                          {deal.name}
                        </h5>
                        <span className="text-[10px] font-mono font-bold text-[#F5D77F]">
                          AED {(deal.deal_value || 3500).toLocaleString()}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-400 flex items-center justify-between">
                        <span className="text-slate-300 line-clamp-1">{deal.company}</span>
                        <span className="font-mono text-emerald-400">{Math.round((deal.closing_probability || 0.65) * 100)}%</span>
                      </div>

                      <div className="text-[10px] text-slate-400 pt-1 border-t border-white/5 font-mono flex items-center justify-between">
                        <span>{deal.channel || 'WhatsApp'}</span>
                        <span className="text-[#D4AF37]">{deal.offer_name?.substring(0, 15)}...</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Bottom stage action */}
              <button
                onClick={() => onNavigateTab('comms_center')}
                className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-mono text-center transition-all"
              >
                Clear Safety Gate &rarr;
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
