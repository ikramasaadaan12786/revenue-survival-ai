'use client';

import React, { useState, useEffect } from 'react';
import { Zap, CheckSquare, ArrowRight, Sparkles, ShieldAlert } from 'lucide-react';

interface PriorityItem {
  id?: number | string;
  action_title?: string;
  title?: string;
  text?: string;
  expected_revenue_aed?: number;
  closing_probability?: number;
  department?: string;
  completed?: boolean;
}

interface LocalPriorityItem {
  id: number | string;
  text: string;
  completed: boolean;
  expected_revenue_aed?: number;
  department: string;
}

interface TodayPrioritiesPanelProps {
  priorities?: PriorityItem[];
  onRunOperatingCycle?: () => void;
  isRunningCycle?: boolean;
}

export const TodayPrioritiesPanel: React.FC<TodayPrioritiesPanelProps> = ({
  priorities = [],
  onRunOperatingCycle,
  isRunningCycle = false,
}) => {
  const [items, setItems] = useState<LocalPriorityItem[]>([]);

  useEffect(() => {
    if (priorities && priorities.length > 0) {
      setItems(priorities.map((p, idx) => ({
        id: p.id ?? idx,
        text: p.action_title || p.title || p.text || 'High Impact Revenue Action',
        completed: p.completed ?? false,
        expected_revenue_aed: p.expected_revenue_aed,
        department: p.department || 'Strategic Ops',
      })));
    } else {
      setItems([
        { id: 1, text: 'Synchronize UAE Buyer Radar with high-intent leads', completed: true, department: 'Radar' },
        { id: 2, text: 'Generate staged closing pitches via Sales Copilot', completed: true, department: 'Sales' },
        { id: 3, text: 'Review Safety Barrier queue before outbound dispatch', completed: false, department: 'Safety' },
        { id: 4, text: 'Run Growth Loop strategy experiment cycle', completed: false, department: 'Growth' },
      ]);
    }
  }, [priorities]);

  const toggleItem = (id: number | string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#0B101D]/90 via-[#06080F]/95 to-[#04060A]/95 border border-[#D4AF37]/25 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center gap-2 pb-3.5 border-b border-[#D4AF37]/15">
          <div className="p-1.5 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-bold text-[#F9F6EE] tracking-wide">
              Today&apos;s Strategic Directives
            </h3>
            <p className="text-[10px] text-[#8C9BAE]">
              CEO Brain Real-Time Action Priority Queue
            </p>
          </div>
        </div>

        {/* Priorities Checklist */}
        <div className="mt-3 space-y-2 overflow-y-auto max-h-[220px] pr-1">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-white/[0.02] cursor-pointer transition-colors group select-none"
            >
              {item.completed ? (
                <div className="w-4 h-4 mt-0.5 rounded bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] flex-shrink-0">
                  <CheckSquare className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="w-4 h-4 mt-0.5 rounded border border-[#64748B] group-hover:border-[#D4AF37]/60 transition-colors flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <span
                  className={`text-xs transition-all line-clamp-2 ${
                    item.completed
                      ? 'text-[#8C9BAE] line-through decoration-[#D4AF37]/40'
                      : 'text-[#E2E8F0] group-hover:text-[#F9F6EE]'
                  }`}
                >
                  {item.text}
                </span>
                {item.expected_revenue_aed ? (
                  <span className="text-[9px] text-[#D4AF37] font-semibold block mt-0.5">
                    +AED {item.expected_revenue_aed.toLocaleString()} Pipeline Impact
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Primary Gold CTA Button */}
      <div className="mt-4 pt-3 border-t border-[#D4AF37]/15">
        <button
          onClick={onRunOperatingCycle}
          disabled={isRunningCycle}
          className="w-full relative py-3 px-4 rounded-xl font-serif text-xs font-bold uppercase tracking-wider text-[#06080F] bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] hover:from-[#FFFFFF] hover:via-[#F3E5AB] hover:to-[#D4AF37] shadow-[0_4px_25px_rgba(212,175,55,0.4)] hover:shadow-[0_4px_35px_rgba(212,175,55,0.6)] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 group overflow-hidden disabled:opacity-75"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

          {isRunningCycle ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin text-[#06080F]" />
              <span>Executing Autonomous Cycle...</span>
            </>
          ) : (
            <>
              <span>Run AI Operating Cycle</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
