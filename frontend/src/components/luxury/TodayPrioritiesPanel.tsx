'use client';

import React, { useState } from 'react';
import { Zap, CheckSquare, Square, ArrowRight, Sparkles } from 'lucide-react';

interface TodayPrioritiesPanelProps {
  onRunOperatingCycle?: () => void;
  isRunningCycle?: boolean;
}

export const TodayPrioritiesPanel: React.FC<TodayPrioritiesPanelProps> = ({
  onRunOperatingCycle,
  isRunningCycle = false,
}) => {
  const [items, setItems] = useState([
    { id: 1, text: 'Review sales pipeline', completed: true },
    { id: 2, text: 'Approve marketing campaign', completed: true },
    { id: 3, text: 'Check investor opportunities', completed: false },
    { id: 4, text: 'Launch new AI agents', completed: false },
    { id: 5, text: 'Client success review', completed: false },
    { id: 6, text: 'Plan market expansion', completed: false },
  ]);

  const toggleItem = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#0B101D]/90 via-[#06080F]/95 to-[#04060A]/95 border border-[#D4AF37]/25 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center gap-2 pb-3.5 border-b border-[#D4AF37]/15">
          <div className="p-1.5 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="font-serif text-sm font-bold text-[#F9F6EE] tracking-wide">
            Today&apos;s Priorities
          </h3>
        </div>

        {/* Priorities Checklist */}
        <div className="mt-3 space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.02] cursor-pointer transition-colors group select-none"
            >
              {item.completed ? (
                <div className="w-4 h-4 rounded bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
                  <CheckSquare className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="w-4 h-4 rounded border border-[#64748B] group-hover:border-[#D4AF37]/60 transition-colors" />
              )}
              <span
                className={`text-xs transition-all ${
                  item.completed
                    ? 'text-[#8C9BAE] line-through decoration-[#D4AF37]/40'
                    : 'text-[#E2E8F0] group-hover:text-[#F9F6EE]'
                }`}
              >
                {item.text}
              </span>
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
          {/* Subtle shine sweep */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

          {isRunningCycle ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin text-[#06080F]" />
              <span>Executing Cycle...</span>
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
