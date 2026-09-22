"use client";

import React, { useState } from "react";
import { X, Sparkles, Check, CheckSquare, Square, Layers, Building2, Bot, Code, Globe, Smartphone, ShoppingCart, Users, Megaphone, Server } from "lucide-react";
import { api } from "@/lib/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onMissionCreated: (missionId: number) => void;
}

export const AVAILABLE_INDUSTRIES = [
  { id: "Dubai Real Estate & Advisory", label: "Dubai Real Estate & Advisory", icon: Building2, tag: "High Commission" },
  { id: "Digital Services & Consulting", label: "Digital Services & Consulting", icon: Globe, tag: "Fast Cash" },
  { id: "AI Agents & Automation", label: "AI Agents & Automation", icon: Bot, tag: "High Demand" },
  { id: "Custom Software Development", label: "Custom Software Development", icon: Code, tag: "Enterprise" },
  { id: "SaaS Products", label: "SaaS Products", icon: Server, tag: "Recurring" },
  { id: "Website Development", label: "Website Development", icon: Globe, tag: "24h Turnaround" },
  { id: "Mobile Applications", label: "Mobile Applications", icon: Smartphone, tag: "High Ticket" },
  { id: "E-Commerce & High Ticket Sales", label: "E-Commerce & High Ticket Sales", icon: ShoppingCart, tag: "Direct Cash" },
  { id: "Lead Generation Services", label: "Lead Generation Services", icon: Users, tag: "B2B Outbound" },
  { id: "Marketing & Growth Services", label: "Marketing & Growth Services", icon: Megaphone, tag: "Growth Sprint" },
];

export default function NewMissionModal({ isOpen, onClose, onMissionCreated }: Props) {
  const [title, setTitle] = useState("Generate AED 5,000 within 72 Hours (Zero Spend)");
  const [goalAmount, setGoalAmount] = useState(5000);
  const [currency, setCurrency] = useState("AED");
  const [deadlineHours, setDeadlineHours] = useState(72);
  const [budget, setBudget] = useState(0);
  // Default selection is All 10 Industries
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(
    AVAILABLE_INDUSTRIES.map((ind) => ind.id)
  );
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const isAllSelected = selectedIndustries.length === AVAILABLE_INDUSTRIES.length;

  const handleToggleAll = () => {
    if (isAllSelected) {
      setSelectedIndustries([]);
    } else {
      setSelectedIndustries(AVAILABLE_INDUSTRIES.map((ind) => ind.id));
    }
  };

  const handleToggleIndustry = (industryId: string) => {
    if (selectedIndustries.includes(industryId)) {
      setSelectedIndustries(selectedIndustries.filter((id) => id !== industryId));
    } else {
      setSelectedIndustries([...selectedIndustries, industryId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndustries.length === 0) {
      alert("Please select at least one industry for the autonomous swarm to target.");
      return;
    }

    try {
      setLoading(true);
      const industryString =
        selectedIndustries.length === AVAILABLE_INDUSTRIES.length
          ? "All Industries"
          : selectedIndustries.join(", ");

      const mission = await api.createMission({
        title,
        goal_amount: Number(goalAmount),
        currency,
        deadline_hours: Number(deadlineHours),
        budget: Number(budget),
        industry: industryString,
        industries: selectedIndustries,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl glass-panel-glow p-6 md:p-8 space-y-6 bg-[#0a0f1d] border border-cyan-500/30 rounded-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1px] shadow-glow">
              <div className="w-full h-full bg-[#090d16] rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Initialize Autonomous Revenue Mission</h3>
              <p className="text-xs text-slate-400 font-mono">Multi-Industry Swarm • Cross-Sector Monetization Engine</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs font-mono">
          {/* Mission Objective */}
          <div>
            <label className="text-slate-300 font-semibold uppercase tracking-wider">Mission Objective / Strategy Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1.5 bg-slate-950 text-slate-100 p-3 rounded-xl border border-white/[0.12] focus:outline-none focus:border-cyan-400 font-sans text-sm"
              placeholder="e.g. Generate AED 5,000 in 72 Hours"
              required
            />
          </div>

          {/* Goal & Deadline Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-slate-300 font-semibold uppercase tracking-wider">Target Revenue</label>
              <div className="flex gap-2 mt-1.5">
                <input
                  type="number"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 text-cyan-400 font-bold p-3 rounded-xl border border-white/[0.12] focus:outline-none focus:border-cyan-400"
                  required
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-slate-950 text-slate-200 px-3 rounded-xl border border-white/[0.12] focus:outline-none"
                >
                  <option value="AED">AED</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold uppercase tracking-wider">Deadline (Hours)</label>
              <input
                type="number"
                value={deadlineHours}
                onChange={(e) => setDeadlineHours(Number(e.target.value))}
                className="w-full mt-1.5 bg-slate-950 text-amber-300 font-bold p-3 rounded-xl border border-white/[0.12] focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold uppercase tracking-wider">Marketing Budget</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full mt-1.5 bg-slate-950 text-emerald-400 font-bold p-3 rounded-xl border border-white/[0.12] focus:outline-none focus:border-emerald-400"
                required
              />
            </div>
          </div>

          {/* Multi-Industry Selector */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <label className="text-slate-200 font-bold uppercase tracking-wider">
                  Target Industries ({selectedIndustries.length}/{AVAILABLE_INDUSTRIES.length})
                </label>
              </div>
              <button
                type="button"
                onClick={handleToggleAll}
                className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-mono py-1 px-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30"
              >
                {isAllSelected ? (
                  <>
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Deselect All</span>
                  </>
                ) : (
                  <>
                    <Square className="w-3.5 h-3.5" />
                    <span>Select All Industries</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-400 font-mono">
              The Survival Manager will synthesize buyer radar signals across all selected niches to locate the fastest closing revenue streams.
            </p>

            {/* Checkboxes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {AVAILABLE_INDUSTRIES.map((ind) => {
                const Icon = ind.icon;
                const isSelected = selectedIndustries.includes(ind.id);
                return (
                  <label
                    key={ind.id}
                    onClick={() => handleToggleIndustry(ind.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all ${
                      isSelected
                        ? "bg-cyan-500/15 border-cyan-500/50 text-white shadow-sm"
                        : "bg-slate-950/60 border-white/[0.07] text-slate-400 hover:border-white/[0.15] hover:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                          isSelected
                            ? "bg-cyan-400 border-cyan-400 text-black font-bold"
                            : "border-slate-600 bg-slate-900"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-cyan-400" : "text-slate-500"}`} />
                      <span className="text-xs font-sans truncate">{ind.label}</span>
                    </div>

                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/[0.06] shrink-0 ml-2">
                      {ind.tag}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
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
              disabled={loading || selectedIndustries.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-black hover:from-cyan-300 hover:to-blue-400 shadow-glow transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 fill-black" />
              {loading ? "INITIALIZING MULTI-INDUSTRY SWARM..." : "LAUNCH MULTI-INDUSTRY MISSION"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
