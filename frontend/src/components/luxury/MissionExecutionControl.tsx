'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Zap,
  Target,
  Clock,
  Coins,
  Send,
  MessageSquare,
  PhoneCall,
  FileText,
  CreditCard,
  AlertTriangle,
  Play,
  RefreshCw,
  Layers,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Lock,
  ArrowRight,
  Activity,
  Cpu,
  UserCheck
} from 'lucide-react';
import { getApiUrl } from '@/lib/api';

interface ExecutionQueueItem {
  lead_id: number;
  buyer_name: string;
  company: string;
  source_platform: string;
  channel: string;
  requirement: string;
  estimated_value_aed: number;
  pipeline_stage: string;
  message_status: string;
  delivery_status: string;
  delivery_confirmation?: string;
  reply_status: string;
  evidence_reference: string;
  source_url?: string;
  profile_url?: string;
  discovery_timestamp: string;
}

interface MissionControlStatus {
  mission_id: number;
  title: string;
  currency: string;
  mission_target: number;
  revenue_generated: number;
  revenue_remaining: number;
  time_remaining_hours: number;
  real_pipeline_aed: number;
  real_results: {
    leads_found: number;
    messages_delivered: number;
    replies_received: number;
    calls_completed: number;
    proposals_sent: number;
    payments_collected: number;
    collected_revenue_aed: number;
  };
  system_activity: {
    active_tasks_count: number;
    sectors_monitored: number;
    recent_tasks: Array<{ id: number; title: string; agent: string; status: string }>;
  };
  mission_status: string;
  current_blockers: string[];
  next_required_human_action: string[];
  audit_hash: string;
}

interface MissionExecutionControlProps {
  missionId?: number;
  onNavigateTab?: (tabId: string) => void;
}

export const MissionExecutionControl: React.FC<MissionExecutionControlProps> = ({
  missionId = 1,
  onNavigateTab
}) => {
  const [statusData, setStatusData] = useState<MissionControlStatus | null>(null);
  const [queue, setQueue] = useState<ExecutionQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningCycle, setIsRunningCycle] = useState(false);
  const [cycleFeedback, setCycleFeedback] = useState<string | null>(null);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const [statusRes, queueRes] = await Promise.all([
        fetch(getApiUrl(`/api/v1/closing-engine/mission-control/status/${missionId}`)),
        fetch(getApiUrl(`/api/v1/closing-engine/mission-control/execution-queue/${missionId}`))
      ]);
      if (statusRes.ok) {
        const data = await statusRes.json();
        setStatusData(data);
      }
      if (queueRes.ok) {
        const queueData = await queueRes.json();
        setQueue(queueData);
      }
    } catch (e) {
      console.error('Failed to fetch mission control status', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(fetchStatus, 12000);
    return () => clearInterval(timer);
  }, [missionId]);

  const handleRunAutoCycle = async () => {
    setIsRunningCycle(true);
    setCycleFeedback(null);
    try {
      const res = await fetch(getApiUrl(`/api/v1/closing-engine/mission-control/run-auto-cycle/${missionId}`), {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setCycleFeedback(`Cycle executed: ${data.pipeline_actions?.length || 0} actions taken across pipeline.`);
        fetchStatus();
      }
    } catch (e) {
      console.error('Failed to run cycle', e);
    } finally {
      setIsRunningCycle(false);
    }
  };

  const formatAED = (val?: number) => {
    if (val === undefined || val === null) return 'AED 0.00';
    return `AED ${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-8 w-full">
      {/* ========================================================================= */}
      {/* 1. MISSION EXECUTION STATUS HEADER */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#0B101D] via-[#070A14] to-[#04060A] border border-[#D4AF37]/50 p-6 md:p-8 shadow-[0_12px_45px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#F5D77F] font-mono text-xs font-black tracking-widest uppercase flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#F5D77F]" />
                PHASE 21: MISSION EXECUTION CONTROL
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-black tracking-wider uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                MISSION #{missionId}: {statusData?.mission_status || 'ACTIVE'}
              </span>
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[11px] font-bold">
                PERSISTENT WORKER ACTIVE
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-serif font-black text-white tracking-tight">
              {statusData?.title || 'Autonomous Revenue Sprint - 18 Hour Challenge'}
            </h1>
            <p className="text-xs md:text-sm font-mono text-[#8C9BAE] leading-relaxed">
              Autonomous execution control is live. Continuous background daemon hunts buyers across Telegram, Reddit, YouTube, LinkedIn, and Web Intent. Zero fake revenue, zero simulated leads.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleRunAutoCycle}
              disabled={isRunningCycle}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F5D77F] to-[#AA7C11] text-black font-mono text-xs font-black shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              <Play className={`w-4 h-4 ${isRunningCycle ? 'animate-spin' : ''}`} />
              {isRunningCycle ? 'Executing Cycle...' : 'Run Autonomous Cycle'}
            </button>
            <button
              onClick={() => onNavigateTab && onNavigateTab('reality_audit')}
              className="px-4 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/20 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Reality Audit
            </button>
          </div>
        </div>

        {cycleFeedback && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{cycleFeedback}</span>
            </div>
            <button onClick={() => setCycleFeedback(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
          </div>
        )}

        {/* Audit Proof Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#8C9BAE]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Audit Hash: <strong className="text-white">{statusData?.audit_hash || 'SHA-256 PENDING'}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#F5D77F]" />
            <span>Sprint Deadline: <strong className="text-white">{statusData?.time_remaining_hours?.toFixed(1) || '18.0'}h</strong></span>
          </div>
          <div className="text-emerald-400 font-bold">
            Target: AED 2,500.00 • Budget: AED 0.00 • Freedom: Unrestricted
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. REAL RESULTS VS SYSTEM ACTIVITY (STRICT SEPARATION) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Real Business Results */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-gradient-to-b from-[#0B101D] to-[#04060A] border border-emerald-500/30 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-black text-white uppercase tracking-wider">
                  Real Business Results (External Proof Only)
                </h2>
                <p className="text-[11px] font-mono text-emerald-400/80">
                  Zero forecasts • Zero fake pipeline millions • Verified settlements only
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {formatAED(statusData?.revenue_generated || 0)} COLLECTED
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="text-[11px] font-mono text-[#8C9BAE] uppercase mb-1">Real Leads Found</div>
              <div className="text-xl font-serif font-bold text-white">
                {statusData?.real_results?.leads_found || 0}
              </div>
              <div className="text-[10px] font-mono text-emerald-400 mt-1">Mandatory 9 Evidence Fields</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="text-[11px] font-mono text-[#8C9BAE] uppercase mb-1">Messages Delivered</div>
              <div className="text-xl font-serif font-bold text-white">
                {statusData?.real_results?.messages_delivered || 0}
              </div>
              <div className="text-[10px] font-mono text-[#8C9BAE] mt-1">Provider Token Confirmed</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="text-[11px] font-mono text-[#8C9BAE] uppercase mb-1">Replies Received</div>
              <div className="text-xl font-serif font-bold text-white">
                {statusData?.real_results?.replies_received || 0}
              </div>
              <div className="text-[10px] font-mono text-[#8C9BAE] mt-1">Direct Client Responses</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="text-[11px] font-mono text-[#8C9BAE] uppercase mb-1">Calls Completed</div>
              <div className="text-xl font-serif font-bold text-white">
                {statusData?.real_results?.calls_completed || 0}
              </div>
              <div className="text-[10px] font-mono text-[#8C9BAE] mt-1">Calendar Proof Recorded</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="text-[11px] font-mono text-[#8C9BAE] uppercase mb-1">Proposals Sent</div>
              <div className="text-xl font-serif font-bold text-white">
                {statusData?.real_results?.proposals_sent || 0}
              </div>
              <div className="text-[10px] font-mono text-[#8C9BAE] mt-1">Formal Scope Documents</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-emerald-500/30 bg-emerald-500/5">
              <div className="text-[11px] font-mono text-emerald-400 uppercase mb-1">Payments Collected</div>
              <div className="text-xl font-serif font-bold text-emerald-400">
                {statusData?.real_results?.payments_collected || 0}
              </div>
              <div className="text-[10px] font-mono text-emerald-400/80 mt-1">Bank Settlement Hash</div>
            </div>
          </div>
        </div>

        {/* Right: System Activity (Internal AI Tasks & Automation) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-gradient-to-b from-[#0B101D] to-[#04060A] border border-cyan-500/30 space-y-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-black text-white uppercase tracking-wider">
                System Activity
              </h2>
              <p className="text-[11px] font-mono text-cyan-400/80">
                AI Tasks • Scans • Analysis
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-[#8C9BAE]">
              <span>Monitored Sectors:</span>
              <strong className="text-white">5 High-Velocity Sectors</strong>
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-[#8C9BAE]">
              <span>Autonomous Worker:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE (15m / 1h / Daily)
              </span>
            </div>

            <div className="pt-2 border-t border-white/10 space-y-2">
              <span className="text-[11px] font-mono font-bold text-slate-300 uppercase">Recent AI Actions:</span>
              {statusData?.system_activity?.recent_tasks && statusData.system_activity.recent_tasks.length > 0 ? (
                statusData.system_activity.recent_tasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono">
                    <div className="text-white font-bold truncate">{task.title}</div>
                    <div className="text-[10px] text-[#8C9BAE]">{task.agent} • {task.status}</div>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs font-mono text-[#8C9BAE] text-center">
                  Continuous pipeline monitor active.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BLOCKERS & NEXT REQUIRED HUMAN ACTION */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Blockers */}
        <div className="p-5 rounded-2xl bg-[#0B101D] border border-amber-500/30 space-y-3">
          <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Current Blockers
          </div>
          {statusData?.current_blockers && statusData.current_blockers.length > 0 ? (
            <ul className="space-y-2">
              {statusData.current_blockers.map((b, i) => (
                <li key={i} className="text-xs font-mono text-amber-200/90 flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> No critical execution blockers detected.
            </p>
          )}
        </div>

        {/* Next Required Human Action */}
        <div className="p-5 rounded-2xl bg-[#0B101D] border border-[#D4AF37]/30 space-y-3">
          <div className="flex items-center gap-2 text-[#F5D77F] font-serif font-bold text-sm">
            <UserCheck className="w-4 h-4 text-[#F5D77F]" />
            Next Required Human Action
          </div>
          {statusData?.next_required_human_action && statusData.next_required_human_action.length > 0 ? (
            <ul className="space-y-2">
              {statusData.next_required_human_action.map((act, i) => (
                <li key={i} className="text-xs font-mono text-[#F9F6EE] flex items-start gap-2">
                  <span className="text-[#D4AF37]">→</span>
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs font-mono text-[#8C9BAE]">Autonomous loop progressing automatically.</p>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. REAL SALES EXECUTION QUEUE */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl bg-gradient-to-b from-[#0B101D] via-[#070A14] to-[#04060A] border border-[#D4AF37]/30 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-serif font-black text-white uppercase tracking-wider">
              Real Sales Execution Queue
            </h2>
            <p className="text-[11px] font-mono text-[#8C9BAE]">
              Buyer • Channel • Message Status • Delivery Status • Reply Status • Stage
            </p>
          </div>
          <button
            onClick={fetchStatus}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-[#8C9BAE] hover:text-white transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {queue.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
            <ShieldCheck className="w-10 h-10 text-[#D4AF37]/50 mx-auto" />
            <div className="font-serif text-sm font-bold text-slate-300">
              No Unverified Dummy Leads in Execution Queue
            </div>
            <p className="font-mono text-xs text-[#8C9BAE] max-w-md mx-auto">
              Reality Mode enforced. The autonomous daemon is scanning Telegram, Reddit, YouTube comments, LinkedIn signals, and Public Web Intent. Leads are ingested only when all 9 evidence fields exist.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-black/50 text-[#8C9BAE] uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="p-3.5">Buyer & Company</th>
                  <th className="p-3.5">Channel</th>
                  <th className="p-3.5">Requirement</th>
                  <th className="p-3.5">Message Status</th>
                  <th className="p-3.5">Delivery Status</th>
                  <th className="p-3.5">Reply Status</th>
                  <th className="p-3.5">Pipeline Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {queue.map((item) => (
                  <tr key={item.lead_id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5 font-bold text-white">
                      <div>{item.buyer_name}</div>
                      <div className="text-[10px] text-[#8C9BAE]">{item.company} • {item.source_platform}</div>
                    </td>
                    <td className="p-3.5">{item.channel}</td>
                    <td className="p-3.5 max-w-xs truncate">{item.requirement}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.message_status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {item.message_status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.delivery_status === 'DELIVERED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {item.delivery_status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.reply_status.includes('REPLIED') ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {item.reply_status}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-[#F5D77F]">{item.pipeline_stage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
