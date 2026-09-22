"use client";

import React, { useState } from "react";
import { X, Sparkles, Target, Clock, DollarSign, Layers } from "lucide-react";
import { api } from "@/lib/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onMissionCreated: (missionId: number) => void;
}

export default function NewMissionModal({ isOpen, onClose, onMissionCreated }: Props) {
  const [title, setTitle] = useState("Generate AED 1,000 within 72 Hours (Zero Spend)");
  const [goalAmount, setGoalAmount] = useState(1000);
  const [currency, setCurrency] = useState("AED");
  const [deadlineHours, setDeadlineHours] = useState(72);
  const [budget, setBudget] = useState(0);
  const [industry, setIndustry] = useState("Dubai Real Estate & Digital Advisory");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const mission = await api.createMission({
        title,
        goal_amount: Number(goalAmount),
        currency,
        deadline_hours: Number(deadlineHours),
        budget: Number(budget),
        industry,
      });
      onMissionCreated(mission.id);
      onClose();
    } catch (err) {
      console.error("Failed creating mission", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg glass-panel-glow p-6 md:p-8 space-y-6 bg-[#0a0f1d]">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Initialize Revenue Survival Mission</h3>
              <p className="text-xs text-slate-400 font-mono">Autonomous 4-Day Swarm Dispatch</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="text-slate-400 uppercase">Mission Title / Objective</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1 bg-slate-950 text-slate-100 p-3 rounded-xl border border-white/[0.1] focus:outline-none focus:border-cyan-400 font-sans"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 uppercase">Target Revenue</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="number"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 text-cyan-400 font-bold p-3 rounded-xl border border-white/[0.1] focus:outline-none focus:border-cyan-400"
                  required
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-slate-950 text-slate-200 px-3 rounded-xl border border-white/[0.1]"
                >
                  <option value="AED">AED</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-400 uppercase">Deadline (Hours)</label>
              <input
                type="number"
                value={deadlineHours}
                onChange={(e) => setDeadlineHours(Number(e.target.value))}
                className="w-full mt-1 bg-slate-950 text-amber-300 font-bold p-3 rounded-xl border border-white/[0.1] focus:outline-none focus:border-amber-400"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 uppercase">Marketing Budget</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full mt-1 bg-slate-950 text-emerald-400 font-bold p-3 rounded-xl border border-white/[0.1] focus:outline-none focus:border-emerald-400"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 uppercase">Target Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full mt-1 bg-slate-950 text-slate-200 p-3 rounded-xl border border-white/[0.1]"
              >
                <option value="Dubai Real Estate & Digital Advisory">Dubai Real Estate & Advisory</option>
                <option value="Digital Services & B2B Consulting">Digital Services & Consulting</option>
                <option value="E-Commerce & High-Ticket Lead Gen">E-Commerce & High-Ticket Lead Gen</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:from-cyan-300 hover:to-blue-400 shadow-glow transition-all disabled:opacity-50"
            >
              {loading ? "INITIALIZING SWARM..." : "LAUNCH MISSION"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
