"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  BrainCircuit, 
  DollarSign, 
  FlaskConical, 
  Sparkles, 
  PlusCircle, 
  CheckCircle2, 
  TrendingUp,
  History,
  Lightbulb,
  CalendarCheck,
  Award,
  Layers,
  ShieldAlert,
  Target,
  FileText,
  Tag
} from "lucide-react";
import { RevenueTracking, Experiment, AgentMemory, DailyCycleLog, LongTermMemory } from "@/types";
import { api } from "@/lib/api";

interface Props {
  missionId: number;
  onRefreshSummary: () => void;
}

export default function AnalyticsMemoryView({ missionId, onRefreshSummary }: Props) {
  const [revenues, setRevenues] = useState<RevenueTracking[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [memories, setMemories] = useState<AgentMemory[]>([]);
  const [longTermMemories, setLongTermMemories] = useState<LongTermMemory[]>([]);
  const [dailyCycles, setDailyCycles] = useState<DailyCycleLog[]>([]);
  const [selectedMemoryCategory, setSelectedMemoryCategory] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  // New Revenue form state
  const [showAddRevenue, setShowAddRevenue] = useState(false);
  const [amount, setAmount] = useState(299);
  const [commission, setCommission] = useState(0);
  const [source, setSource] = useState("WhatsApp Direct Close");
  const [payerName, setPayerName] = useState("");
  const [notes, setNotes] = useState("");

  // New Long Term Memory form state
  const [showAddMemory, setShowAddMemory] = useState(false);
  const [newMemTitle, setNewMemTitle] = useState("");
  const [newMemInsight, setNewMemInsight] = useState("");
  const [newMemCategory, setNewMemCategory] = useState("SUCCESSFUL_STRATEGY");
  const [savingMemory, setSavingMemory] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [revData, expData, memData, cycleData, ltData] = await Promise.all([
        api.getRevenues(missionId),
        api.getExperiments(missionId),
        api.getMemory(),
        api.getDailyCycleLogs(missionId),
        api.getLongTermMemories(selectedMemoryCategory === "ALL" ? undefined : selectedMemoryCategory)
      ]);
      setRevenues(revData);
      setExperiments(expData);
      setMemories(memData);
      setDailyCycles(cycleData);
      setLongTermMemories(ltData);
    } catch (err) {
      console.error("Failed fetching analytics data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [missionId, selectedMemoryCategory]);

  const handleRecordRevenue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.recordRevenue({
        mission_id: missionId,
        amount: Number(amount),
        currency: "AED",
        source,
        payer_name: payerName,
        deal_status: "CONFIRMED",
        commission_collected: Number(commission),
        notes,
      });
      setShowAddRevenue(false);
      setPayerName("");
      setNotes("");
      setCommission(0);
      await fetchData();
      onRefreshSummary();
    } catch (err) {
      console.error("Failed recording revenue", err);
    }
  };

  const handleCreateLongTermMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemTitle.trim() || !newMemInsight.trim()) return;
    try {
      setSavingMemory(true);
      await api.recordLongTermMemory({
        category: newMemCategory,
        title: newMemTitle,
        insight: newMemInsight,
        metrics: { user_submitted: true, timestamp: new Date().toISOString() },
        tags: ["custom_learning", newMemCategory.toLowerCase()],
        confidence: 0.98
      });
      setShowAddMemory(false);
      setNewMemTitle("");
      setNewMemInsight("");
      await fetchData();
    } catch (err) {
      console.error("Failed recording long term memory", err);
    } finally {
      setSavingMemory(false);
    }
  };

  const totalCollected = revenues.reduce((acc, curr) => acc + curr.amount, 0);
  const totalCommissionEarned = revenues.reduce((acc, curr) => acc + (curr.commission_collected || 0), 0);

  const getMemoryCategoryBadge = (cat: string) => {
    switch (cat) {
      case "SUCCESSFUL_STRATEGY":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">SUCCESSFUL STRATEGY</span>;
      case "FAILED_APPROACH":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">FAILED APPROACH</span>;
      case "CAMPAIGN_RESULT":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">CAMPAIGN RESULT</span>;
      case "AGENT_LEARNING":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">AGENT LEARNING</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">MARKET LEARNING</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-cyan-400" />
            AI Long-Term Memory, Verified Ledger & Analytics
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Persistent cognitive memory • Verified transaction receipts • Daily cycle audit logs • Split tests
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowAddMemory(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-mono transition-all"
          >
            <Lightbulb className="w-4 h-4" />
            Record Insight
          </button>

          <button
            onClick={() => setShowAddRevenue(!showAddRevenue)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black font-mono transition-all shadow-glow"
          >
            <DollarSign className="w-4 h-4" />
            Log Verified Deal (AED)
          </button>
        </div>
      </div>

      {/* AI Memory Panel (Persistent Long Term Memory) */}
      <div className="glass-panel p-6 border border-cyan-500/20 bg-[#090d18]/90 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Persistent Long-Term Cognitive Memory
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  {longTermMemories.length} Domain Learnings
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Historical strategies, anti-patterns, campaign milestones, and market learnings persisted across runs
              </p>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 font-mono text-xs">
            {["ALL", "SUCCESSFUL_STRATEGY", "FAILED_APPROACH", "CAMPAIGN_RESULT", "AGENT_LEARNING", "MARKET_LEARNING"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedMemoryCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  selectedMemoryCategory === cat
                    ? "bg-cyan-500 text-black font-bold shadow-sm"
                    : "bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-white/[0.05]"
                }`}
              >
                {cat.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Long Term Memory Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {longTermMemories.map((mem) => (
            <div
              key={mem.id}
              className="bg-slate-900/70 border border-white/[0.06] hover:border-cyan-500/30 p-4 rounded-xl space-y-3 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  {getMemoryCategoryBadge(mem.category)}
                  <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                    {(mem.confidence * 100).toFixed(0)}% Confidence
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white leading-snug">{mem.title}</h4>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">{mem.insight}</p>
              </div>

              <div className="pt-2 border-t border-white/[0.05] flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
                <div className="flex flex-wrap gap-1">
                  {mem.tags?.map((t, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-white/[0.04]">
                      #{t}
                    </span>
                  ))}
                </div>
                {mem.metrics && Object.keys(mem.metrics).length > 0 && (
                  <span className="text-cyan-400 font-bold">
                    {mem.metrics.conversion_rate ? `${mem.metrics.conversion_rate}% Conv` : mem.metrics.revenue_aed ? `${mem.metrics.revenue_aed} AED Rev` : "Metrics Linked"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Record Long Term Memory Modal */}
      {showAddMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel p-6 max-w-lg w-full border border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-cyan-400" />
                Record Cognitive Domain Insight
              </h3>
              <button onClick={() => setShowAddMemory(false)} className="text-slate-400 hover:text-white text-xs font-mono">
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleCreateLongTermMemory} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Insight Category</label>
                <select
                  value={newMemCategory}
                  onChange={(e) => setNewMemCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:border-cyan-400 outline-none"
                >
                  <option value="SUCCESSFUL_STRATEGY">Successful Strategy (High Conversion)</option>
                  <option value="FAILED_APPROACH">Failed Approach (Anti-Pattern / Avoid)</option>
                  <option value="CAMPAIGN_RESULT">Campaign Result (Revenue / Pipeline Milestone)</option>
                  <option value="AGENT_LEARNING">Agent Learning (Behavioral / Timing Rule)</option>
                  <option value="MARKET_LEARNING">Market Learning (Customer Psychology / Pain)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Insight Title</label>
                <input
                  type="text"
                  required
                  value={newMemTitle}
                  onChange={(e) => setNewMemTitle(e.target.value)}
                  placeholder="e.g. WhatsApp ROI Teardown converts at 30%+"
                  className="w-full bg-slate-900 border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Detailed Domain Insight / Lesson</label>
                <textarea
                  required
                  rows={3}
                  value={newMemInsight}
                  onChange={(e) => setNewMemInsight(e.target.value)}
                  placeholder="Explain why this approach works or failed, including context and metrics..."
                  className="w-full bg-slate-900 border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemory(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingMemory}
                  className="px-5 py-2 rounded-xl text-xs font-bold font-mono bg-cyan-400 hover:bg-cyan-300 text-black shadow-glow disabled:opacity-50"
                >
                  {savingMemory ? "Saving..." : "Save into Long-Term Memory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Deal Logger Drawer */}
      {showAddRevenue && (
        <form onSubmit={handleRecordRevenue} className="glass-panel p-6 border-emerald-500/30 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" /> Record Confirmed Revenue & Commission
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase">Dossier / Direct Amount (AED)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full mt-1 bg-slate-950 text-slate-100 text-xs p-2.5 rounded-xl border border-white/[0.1] font-mono focus:outline-none focus:border-emerald-400"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase">2% Broker Fee Collected (AED)</label>
              <input
                type="number"
                value={commission}
                onChange={(e) => setCommission(Number(e.target.value))}
                className="w-full mt-1 bg-slate-950 text-amber-300 text-xs p-2.5 rounded-xl border border-white/[0.1] font-mono focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase">Payer / Client Name</label>
              <input
                type="text"
                value={payerName}
                placeholder="e.g. Alexander Weber"
                onChange={(e) => setPayerName(e.target.value)}
                className="w-full mt-1 bg-slate-950 text-slate-100 text-xs p-2.5 rounded-xl border border-white/[0.1] font-mono focus:outline-none focus:border-emerald-400"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase">Payment Channel</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full mt-1 bg-slate-950 text-slate-100 text-xs p-2.5 rounded-xl border border-white/[0.1] font-mono focus:outline-none focus:border-emerald-400"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-mono text-slate-400 uppercase">Deal Notes</label>
            <input
              type="text"
              value={notes}
              placeholder="e.g. Dubai Marina Waterfront 1BR Purchase"
              onChange={(e) => setNotes(e.target.value)}
              className="w-full mt-1 bg-slate-950 text-slate-100 text-xs p-2.5 rounded-xl border border-white/[0.1] font-mono focus:outline-none focus:border-emerald-400"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddRevenue(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-mono font-bold bg-emerald-500 text-black hover:bg-emerald-400"
            >
              Confirm Transaction
            </button>
          </div>
        </form>
      )}

      {/* Grid: Financial Ledger + Daily Scheduler Cycles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verified Transactions Ledger */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              Verified Revenue & Commission Receipts ({revenues.length})
            </span>
            <span className="text-xs font-mono text-emerald-300 font-bold">
              Total: {totalCollected} AED {totalCommissionEarned > 0 && `(+${totalCommissionEarned} AED Comm)`}
            </span>
          </div>

          <div className="space-y-3 max-h-[320px] overflow-y-auto">
            {revenues.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 font-mono">
                No transactions recorded yet.
              </div>
            ) : (
              revenues.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-slate-900/80 p-3.5 rounded-xl border border-white/[0.05] flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {rev.payer_name || "Anonymous Client"}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {rev.source} {rev.notes && `• ${rev.notes}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-emerald-400 text-sm">
                      +{rev.amount} {rev.currency}
                    </span>
                    {rev.commission_collected > 0 && (
                      <div className="text-[10px] text-amber-300 font-mono">
                        +{rev.commission_collected} AED Comm
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 4-Phase Daily Scheduler History */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <CalendarCheck className="w-4 h-4" />
              Daily Autonomous Operational Cycles ({dailyCycles.length})
            </span>
            <span className="text-xs font-mono text-slate-400">Autonomous Execution Log</span>
          </div>

          <div className="space-y-3 max-h-[320px] overflow-y-auto">
            {dailyCycles.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 font-mono">
                No daily cycles logged. Click "Trigger Daily 4-Phase Cycle" on the HUD to run.
              </div>
            ) : (
              dailyCycles.map((cycle) => (
                <div key={cycle.id} className="bg-slate-900/80 p-3.5 rounded-xl border border-white/[0.05] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-cyan-400 text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                      {cycle.phase} PHASE • {cycle.cycle_date}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Executed
                    </span>
                  </div>
                  <p className="text-slate-200 text-xs font-sans">{cycle.summary}</p>
                  {cycle.actions_taken && cycle.actions_taken.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {cycle.actions_taken.map((act, i) => (
                        <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-white/[0.04]">
                          {act}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Real-time A/B Experiments & Agent Memory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Experiments */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4" />
              A/B Positioning Experiments ({experiments.length})
            </span>
            <span className="text-xs font-mono text-amber-300">Live Split Testing</span>
          </div>

          <div className="space-y-3">
            {experiments.map((exp) => (
              <div key={exp.id} className="bg-slate-900/80 p-4 rounded-xl border border-white/[0.05] space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-white">{exp.name}</h4>
                  <p className="text-[11px] text-slate-300 mt-1 italic">"{exp.hypothesis}"</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-white/[0.04]">
                    <div className="text-cyan-400 font-bold mb-1">Variant A</div>
                    <div className="text-slate-300 text-[10px] mb-2">{exp.variant_a}</div>
                    <div className="text-slate-400 text-[10px]">
                      Sent: {exp.metrics_a?.sent || 0} | Replied: {exp.metrics_a?.replied || 0}
                    </div>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-white/[0.04]">
                    <div className="text-amber-400 font-bold mb-1">Variant B</div>
                    <div className="text-slate-300 text-[10px] mb-2">{exp.variant_b}</div>
                    <div className="text-slate-400 text-[10px]">
                      Sent: {exp.metrics_b?.sent || 0} | Replied: {exp.metrics_b?.replied || 0}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cognitive Memory Knowledge Graph */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4" />
              Agent Cognitive Memory ({memories.length})
            </span>
            <span className="text-xs font-mono text-slate-400">Cross-Mission Brain</span>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {memories.map((mem) => (
              <div key={mem.id} className="bg-slate-950/80 p-3.5 rounded-xl border border-white/[0.05] space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {mem.category}
                  </span>
                  <span className="text-[10px] text-emerald-400">
                    {(mem.confidence * 100).toFixed(0)}% Confidence
                  </span>
                </div>
                <div className="font-bold text-white text-xs">{mem.key}</div>
                <div className="text-slate-400 text-[11px] font-sans">Agent: {mem.agent_name}</div>
                <div className="bg-slate-900/80 p-2 rounded text-[10px] text-slate-300 overflow-x-auto">
                  <pre>{JSON.stringify(mem.value, null, 2)}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

