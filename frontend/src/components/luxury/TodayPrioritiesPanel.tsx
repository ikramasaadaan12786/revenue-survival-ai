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
      setItems(
        priorities.map((p, idx) => ({
          id: p.id ?? idx,
          text: p.action_title || p.title || p.text || 'High Impact Revenue Action',
          completed: p.completed ?? false,
          expected_revenue_aed: p.expected_revenue_aed,
          department: p.department || 'Strategic Ops',
        }))
      );
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
    <div className="rounded-3xl bg-gradient-to-b from-[#0B101D]/90 via-[#070A14]/95 to-[#04060A]/98 border border-[#D4AF37]/35 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-2xl flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-[#D4AF37]/20">
          <div className="p-2 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-sm lg:text-base font-bold text-[#F9F6EE] tracking-wide">
              Today&apos;s Strategic Directives
            </h3>
            <p className="text-[10.5px] text-[#8C9BAE]">
              CEO Brain Action Queue
            </p>
          </div>
        </div>

        {/* Priorities Checklist */}
        <div className="mt-4 space-y-2.5 overflow-y-auto max-h-[220px] pr-1">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] cursor-pointer transition-all border border-transparent hover:border-[#D4AF37]/30 group select-none"
            >
              {item.completed ? (
                <div className="w-4 h-4 mt-0.5 rounded-md bg-[#D4AF37]/25 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] flex-shrink-0 shadow-[0_0_8px_rgba(212,175,55,0.4)]">
                  <CheckSquare className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="w-4 h-4 mt-0.5 rounded-md border border-[#64748B] group-hover:border-[#D4AF37] transition-colors flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <span
                  className={`text-xs transition-all line-clamp-2 ${
                    item.completed
                      ? 'text-[#8C9BAE] line-through decoration-[#D4AF37]/50'
                      : 'text-[#E2E8F0] group-hover:text-[#F9F6EE]'
                  }`}
                >
                  {item.text}
                </span>
                {item.expected_revenue_aed ? (
                  <span className="text-[9.5px] text-[#F5D77F] font-semibold block mt-0.5 font-serif">
                    +AED {item.expected_revenue_aed.toLocaleString()} Pipeline Value
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Primary Gold CTA Button */}
      <div className="mt-4 pt-4 border-t border-[#D4AF37]/20">
        <button
          onClick={onRunOperatingCycle}
          disabled={isRunningCycle}
          className="w-full relative py-3.5 px-4 rounded-xl font-serif text-xs font-bold uppercase tracking-wider text-[#06080F] bg-gradient-to-r from-[#FFF6E5] via-[#F5D77F] to-[#D4AF37] hover:from-[#FFFFFF] hover:via-[#FFF6E5] hover:to-[#F5D77F] shadow-[0_4px_25px_rgba(212,175,55,0.45)] hover:shadow-[0_6px_35px_rgba(212,175,55,0.7)] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 group overflow-hidden disabled:opacity-75"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

          {isRunningCycle ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin text-[#06080F]" />
              <span>Executing Autonomous Swarm Cycle...</span>
            </>
          ) : (
            <>
              <span>Run AI Operating Cycle</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
