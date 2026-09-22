"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Layers, 
  Bot, 
  ChevronRight, 
  Play, 
  Calendar,
  Terminal,
  Sparkles,
  Compass,
  AlertTriangle,
  Flame,
  Activity,
  ArrowRight
} from "lucide-react";
import { Task, DailyStrategyDecision, BottleneckReport } from "@/types";
import { api } from "@/lib/api";

interface Props {
  missionId: number;
  onRefreshSummary: () => void;
}

export default function MissionPlannerView({ missionId, onRefreshSummary }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [strategyDecision, setStrategyDecision] = useState<DailyStrategyDecision | null>(null);
  const [bottleneck, setBottleneck] = useState<BottleneckReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [runningLiveCycle, setRunningLiveCycle] = useState(false);
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [roadmapData, setRoadmapData] = useState<any>(null);

  const fetchPlannerData = async () => {
    try {
      setLoading(true);
      const [tasksData, strategyData, bottleneckData] = await Promise.all([
        api.getTasks(missionId),
        api.getDailyStrategyDecision(missionId),
        api.getBottlenecks(missionId)
      ]);
      setTasks(tasksData);
      setStrategyDecision(strategyData);
      setBottleneck(bottleneckData);
      if (tasksData.length > 0 && !selectedTask) {
        setSelectedTask(tasksData[0]);
      }
    } catch (err) {
      console.error("Failed to load tasks and planner data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannerData();
  }, [missionId]);

  const handleRunLiveCycle = async () => {
    try {
      setRunningLiveCycle(true);
      await api.executeLiveCycle(missionId);
      await fetchPlannerData();
      onRefreshSummary();
    } catch (err) {
      console.error("Failed running live cycle", err);
    } finally {
      setRunningLiveCycle(false);
    }
  };

  const handleFetchRoadmap = async () => {
    try {
      const data = await api.getLiveRoadmap(missionId, 30);
      setRoadmapData(data);
      setShowRoadmapModal(true);
    } catch (err) {
      console.error("Failed fetching live roadmap", err);
    }
  };

  // Group tasks by Day
  const groupedTasks: { [day: number]: Task[] } = {};
  tasks.forEach((t) => {
    if (!groupedTasks[t.day_number]) {
      groupedTasks[t.day_number] = [];
    }
    groupedTasks[t.day_number].push(t);
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "RUNNING":
        return <Clock className="w-4 h-4 text-cyan-400 animate-spin" />;
      case "FAILED":
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getAgentColor = (agentName: string) => {
    if (agentName.includes("Browser")) return "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
    if (agentName.includes("Opportunity")) return "bg-purple-500/15 text-purple-300 border-purple-500/30";
    if (agentName.includes("Offer")) return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    if (agentName.includes("Lead")) return "bg-blue-500/15 text-blue-300 border-blue-500/30";
    if (agentName.includes("Outreach")) return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    if (agentName.includes("Sales")) return "bg-rose-500/15 text-rose-300 border-rose-500/30";
    return "bg-slate-700/50 text-slate-300 border-slate-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            Autonomous Swarm Execution & 30-Day Live Roadmap
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time multi-agent choreography • End-to-end autonomous cycle • 50,000 AED commission milestones
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleFetchRoadmap}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 font-mono transition-all"
          >
            <Calendar className="w-3.5 h-3.5" />
            30-Day Roadmap
          </button>

          <button
            onClick={handleRunLiveCycle}
            disabled={runningLiveCycle}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-black shadow-glow font-mono transition-all disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 fill-black ${runningLiveCycle ? "animate-spin" : ""}`} />
            {runningLiveCycle ? "Executing Live Cycle..." : "Execute 1-Click Live Cycle"}
          </button>
        </div>
      </div>

      {/* 30-Day Roadmap Modal */}
      {showRoadmapModal && roadmapData && (
        <div className="glass-panel p-6 border border-indigo-500/40 bg-[#090d1a]/95 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">
                Live 30-Day Revenue Survival Roadmap: {roadmapData.goal_amount} {roadmapData.currency} Commission Target
              </h3>
            </div>
            <button
              onClick={() => setShowRoadmapModal(false)}
              className="text-xs font-mono text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {roadmapData.phases?.map((p: any, idx: number) => (
              <div key={idx} className="bg-slate-900/80 border border-white/10 p-4 rounded-xl space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
                    {p.phase.split(":")[0]}
                  </span>
                  <h4 className="text-xs font-bold text-white mt-1">{p.phase.split(":")[1] || p.phase}</h4>
                  <p className="text-[11px] text-slate-300 mt-1">{p.focus}</p>
                </div>

                <div className="pt-2 border-t border-white/[0.05] space-y-1 text-[10px] font-mono">
                  <div className="text-amber-300">Target: {p.target_metric}</div>
                  <div className="text-emerald-400 font-bold">Commission Milestone: {Number(p.commission_milestone_aed || 0).toLocaleString()} AED</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Strategy Directive & Bottleneck Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {strategyDecision && (
          <div className="glass-panel p-5 border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-slate-900/60 to-slate-950/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5 uppercase">
                <Compass className="w-4 h-4" />
                Day {strategyDecision.day_number || 1} Strategy Theme: {strategyDecision.strategy_theme || "Strategic Momentum"}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                {strategyDecision.confidence_rating ?? 85}% Conviction
              </span>
            </div>
            <p className="text-xs text-slate-200 font-sans leading-relaxed">{strategyDecision.daily_focus}</p>
            <div className="pt-2 border-t border-white/[0.06] text-[11px] font-mono text-slate-300 space-y-1">
              <div className="text-amber-300 font-bold">Target KPI: {strategyDecision.target_kpi}</div>
              <ul className="text-[10px] text-slate-400 space-y-0.5 list-disc list-inside">
                {(strategyDecision.prescribed_actions || []).map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {bottleneck && (
          <div className={`glass-panel p-5 border space-y-3 ${
            bottleneck.bottleneck_detected
              ? "border-amber-500/40 bg-gradient-to-br from-amber-950/30 to-slate-950/80"
              : "border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 to-slate-950/80"
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-mono font-bold flex items-center gap-1.5 uppercase ${
                bottleneck.bottleneck_detected ? "text-amber-400" : "text-emerald-400"
              }`}>
                <AlertTriangle className="w-4 h-4" />
                Pipeline Bottleneck Diagnostic: {bottleneck.bottleneck_stage}
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                bottleneck.severity === "HIGH" ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" : "bg-slate-800 text-slate-300"
              }`}>
                {bottleneck.severity} SEVERITY
              </span>
            </div>
            <p className="text-xs text-slate-200 font-sans leading-relaxed">{bottleneck.diagnosis}</p>
            <div className="pt-2 border-t border-white/[0.06] text-[11px] font-mono text-cyan-300">
              <strong>Prescribed Remedy:</strong> {bottleneck.remedy_action}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Days Timeline (Left Column) */}
        <div className="lg:col-span-7 space-y-6">
          {Object.keys(groupedTasks).map((dayStr) => {
            const dayNum = parseInt(dayStr);
            const dayTasks = groupedTasks[dayNum];
            return (
              <div key={dayNum} className="glass-panel p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center">
                      D{dayNum}
                    </span>
                    <h3 className="text-sm font-semibold text-white">
                      Day {dayNum}:{" "}
                      {dayNum === 1
                        ? "Market Signals & Value Packaging"
                        : dayNum === 2
                        ? "Seller Radar & Qualified Prospect Matching"
                        : dayNum === 3
                        ? "Outreach Campaign & Approval Staging"
                        : "Sales Closing & Strategic Pivot"}
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {dayTasks.filter((t) => t.status === "COMPLETED").length}/{dayTasks.length} Completed
                  </span>
                </div>

                {/* Task items list */}
                <div className="space-y-2.5">
                  {dayTasks.map((t) => {
                    const isSelected = selectedTask?.id === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTask(t)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-slate-800/90 border-cyan-500/60 shadow-glow"
                            : "bg-slate-900/50 border-white/[0.05] hover:bg-slate-800/50 hover:border-white/[0.12]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5">{getStatusIcon(t.status)}</div>
                            <div>
                              <div className="text-xs font-semibold text-slate-100">{t.title}</div>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span
                                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getAgentColor(
                                    t.agent_name
                                  )}`}
                                >
                                  {t.agent_name}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400 uppercase">
                                  {t.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 ${isSelected ? "text-cyan-400" : "text-slate-600"}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Task Inspector & Agent Log Console (Right Column) */}
        <div className="lg:col-span-5">
          <div className="glass-panel p-5 space-y-4 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Agent Execution Console</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Swarm Feed
              </span>
            </div>

            {selectedTask ? (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase">Selected Task</span>
                  <h4 className="text-sm font-bold text-white mt-0.5">{selectedTask.title}</h4>
                  <p className="text-xs text-slate-300 mt-1">{selectedTask.description}</p>
                </div>

                <div className="bg-slate-950/80 rounded-xl p-3 border border-white/[0.08] space-y-2">
                  <div className="text-[11px] font-mono text-cyan-400 flex items-center gap-1">
                    <Bot className="w-3.5 h-3.5" />
                    Agent: <strong className="text-slate-200">{selectedTask.agent_name}</strong>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    Status: <span className="text-white font-bold">{selectedTask.status}</span>
                  </div>
                  {selectedTask.output_summary && (
                    <div className="mt-2 pt-2 border-t border-white/[0.06]">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Output Summary:</div>
                      <div className="text-xs text-slate-200 mt-1 font-mono bg-slate-900/90 p-2.5 rounded-lg border border-white/[0.05]">
                        {selectedTask.output_summary}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-mono text-slate-400 uppercase">Autonomous Execution Guardrails:</div>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside font-mono text-[11px]">
                    <li>Strict Human Safety sign-off before dispatch</li>
                    <li>Zero paid advertising constraint enforced</li>
                    <li>Automatic pivot triggered on low reply velocity</li>
                    <li>Persistent Long-Term Memory cross-referencing</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-slate-400 font-mono">
                Select a task from the execution plan to view real-time logs and agent output.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

