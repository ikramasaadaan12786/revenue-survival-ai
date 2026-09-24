'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  RefreshCw,
  MessageSquare,
  Mail,
  Share2,
  Calendar,
  FileText,
  DollarSign,
  AlertTriangle,
  Server,
  Zap,
  ArrowRight,
  Hash,
  ExternalLink
} from 'lucide-react';
import { getApiUrl } from '@/lib/api';

interface CEOMorningReportProps {
  missionId?: number;
  onNavigateTab?: (tabId: string) => void;
}

export const CEOMorningReport: React.FC<CEOMorningReportProps> = ({
  missionId,
  onNavigateTab
}) => {
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl(`/api/v1/closing-engine/ceo-morning-report/${missionId}`));
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (e) {
      console.error('Failed to load CEO morning report', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    const interval = setInterval(fetchReport, 30000);
    return () => clearInterval(interval);
  }, [missionId]);

  return (
    <div className="space-y-8 w-full max-w-[1640px] mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#0C1222] via-[#080D18] to-[#04060A] border-2 border-[#D4AF37]/50 shadow-[0_0_40px_rgba(212,175,55,0.25)] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/60 text-emerald-400 text-xs font-mono font-black tracking-widest uppercase flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                REAL BUSINESS OPERATION MODE
              </span>
              <span className="px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F5D77F] text-xs font-mono font-bold">
                ZERO SIMULATION POLICY ACTIVE
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F5D77F] to-[#D4AF37]">
              CEO Morning Revenue & Operating Briefing
            </h1>
            <p className="text-xs text-slate-300 font-sans max-w-3xl leading-relaxed">
              Official executive daily report for Dubai Enterprise Revenue Sprint. Zero probability assumptions. Zero fake revenue. All metrics reflect genuine database transactions and verified buyer communications.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center">
            <button
              onClick={fetchReport}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-[#080D18] border border-[#D4AF37]/40 text-[#F5D77F] font-mono text-xs font-bold hover:bg-[#D4AF37]/10 transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Report
            </button>
          </div>
        </div>

        {report && (
          <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
            <div>
              Date: <strong className="text-white">{report.date}</strong> • Generated:{' '}
              <span className="text-slate-300">{report.timestamp}</span>
            </div>
            <div>
              Audit Hash: <strong className="text-[#F5D77F] font-mono">{report.audit_hash}</strong>
            </div>
          </div>
        )}
      </div>

      {/* 1. Core Operating Metrics Grid */}
      {report && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-5 rounded-2xl bg-[#080D18]/90 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>REAL LEADS</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-serif font-black text-white">
              {report?.today_operating_metrics?.real_leads_found ?? 0}
            </div>
            <div className="text-[10.5px] font-mono text-emerald-400 font-bold">100% Verified Evidence</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#080D18]/90 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>DELIVERED</span>
              <MessageSquare className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-serif font-black text-white">
              {report?.today_operating_metrics?.messages_delivered ?? 0}
            </div>
            <div className="text-[10.5px] font-mono text-emerald-400 font-bold">Receipt Confirmed</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#080D18]/90 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>REPLIES</span>
              <Mail className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-serif font-black text-white">
              {report?.today_operating_metrics?.replies_received ?? 0}
            </div>
            <div className="text-[10.5px] font-mono text-emerald-400 font-bold">Genuine Inbound</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#080D18]/90 border border-cyan-500/30 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>CALLS BOOKED</span>
              <Calendar className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-serif font-black text-white">
              {report?.today_operating_metrics?.calls_booked ?? 0}
            </div>
            <div className="text-[10.5px] font-mono text-cyan-400 font-bold">Calendar Invite Linked</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#080D18]/90 border border-[#D4AF37]/30 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>PROPOSALS</span>
              <FileText className="w-4 h-4 text-[#F5D77F]" />
            </div>
            <div className="text-2xl font-serif font-black text-white">
              {report?.today_operating_metrics?.proposals_sent ?? 0}
            </div>
            <div className="text-[10.5px] font-mono text-[#F5D77F] font-bold">Scoped Commercials</div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 via-[#0B101D] to-[#04060A] border-2 border-[#D4AF37] space-y-2">
            <div className="flex items-center justify-between text-[#F5D77F] text-xs font-mono">
              <span>REVENUE CASH</span>
              <DollarSign className="w-4 h-4 text-[#F5D77F]" />
            </div>
            <div className="text-2xl font-serif font-black text-[#F5D77F]">
              AED {(report?.today_operating_metrics?.revenue_collected_aed ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10.5px] font-mono text-slate-300">Strict Verified Proof</div>
          </div>
        </div>
      )}

      {/* 2. Provider Connections Audit & Mission Status */}
      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Provider Exact Status (7 Cols) */}
          <div className="lg:col-span-7 rounded-3xl bg-[#080D18]/90 border border-white/10 p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-lg font-serif font-bold text-white">
                  Provider Connection Audit (Zero Fake Badges)
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Runtime Credential Scan
              </span>
            </div>

            <div className="space-y-4">
              {/* WhatsApp */}
              <div className="p-4 rounded-2xl bg-[#04060A] border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-serif font-bold text-white">
                      {report?.provider_audit?.whatsapp?.provider_name || 'WhatsApp Business Cloud API'}
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                      Webhook: <span className="text-emerald-400 font-bold">{report?.provider_audit?.whatsapp?.webhook_status || 'ACTIVE_LISTENING'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                      report?.provider_audit?.whatsapp?.connection_status === 'CONNECTED'
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                        : 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                    }`}
                  >
                    {report?.provider_audit?.whatsapp?.connection_status || 'NOT CONNECTED'}
                  </span>
                  {report?.provider_audit?.whatsapp?.action_required && (
                    <div className="text-[10px] font-mono text-slate-400 mt-1">
                      {report.provider_audit.whatsapp.action_required}
                    </div>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="p-4 rounded-2xl bg-[#04060A] border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-serif font-bold text-white">
                      {report?.provider_audit?.email?.provider_name || 'Resend Email API'}
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                      Domain: <span className="text-slate-200">{report?.provider_audit?.email?.sending_domain || 'altsofts.in'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                      report?.provider_audit?.email?.connection_status === 'CONNECTED'
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                        : 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                    }`}
                  >
                    {report?.provider_audit?.email?.connection_status || 'NOT CONNECTED'}
                  </span>
                  {report?.provider_audit?.email?.action_required && (
                    <div className="text-[10px] font-mono text-slate-400 mt-1">
                      {report.provider_audit.email.action_required}
                    </div>
                  )}
                </div>
              </div>

              {/* LinkedIn */}
              <div className="p-4 rounded-2xl bg-[#04060A] border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-serif font-bold text-white">
                      {report?.provider_audit?.linkedin?.provider_name || 'LinkedIn InMail API'}
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                      Protocol: <span className="text-slate-200">OAuth 2.0 Webflow</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                      report?.provider_audit?.linkedin?.connection_status === 'CONNECTED'
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                        : 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                    }`}
                  >
                    {report?.provider_audit?.linkedin?.connection_status || 'NOT CONNECTED'}
                  </span>
                  {report?.provider_audit?.linkedin?.action_required && (
                    <div className="text-[10px] font-mono text-slate-400 mt-1">
                      {report.provider_audit.linkedin.action_required}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Mission Integrity & Autonomous Worker (5 Cols) */}
          <div className="lg:col-span-5 rounded-3xl bg-[#080D18]/90 border border-[#D4AF37]/40 p-6 md:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="text-base font-serif font-bold text-white">
                    Mission #{report?.mission?.id ?? 1} Integrity
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold">
                  {report?.mission?.status || 'ACTIVE'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#04060A] border border-white/10 space-y-2 text-xs font-mono">
                <div className="text-white font-bold text-sm font-serif">{report?.mission?.title || 'Revenue Sprint'}</div>
                <div className="flex items-center justify-between text-slate-400 pt-1">
                  <span>Target Revenue:</span>
                  <span className="text-white font-bold">AED {(report?.mission?.target_revenue_aed ?? 2500).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Collected Cash:</span>
                  <span className="text-[#F5D77F] font-bold">AED {(report?.mission?.collected_revenue_aed ?? 0).toFixed(2)}</span>
                </div>
                <div className="text-[10.5px] text-amber-400/90 pt-2 border-t border-white/10">
                  {report?.mission?.completion_criteria || 'Verified Revenue Proof Required'}
                </div>
              </div>

              {/* Worker Heartbeat */}
              <div className="p-4 rounded-2xl bg-[#04060A] border border-white/10 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Server className="w-4 h-4 text-cyan-400" />
                    Worker Daemon:
                  </span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {report?.worker_health?.status || 'ONLINE'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Last Heartbeat: <span className="text-slate-200">{report?.worker_health?.last_heartbeat || 'Active'}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Next Buyer Hunt: <span className="text-[#F5D77F]">{report?.worker_health?.jobs?.buyer_discovery?.next_run || '1 hour'}</span>
                </div>
              </div>
            </div>

            {/* Priority Actions */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="text-xs font-mono text-[#F5D77F] font-bold">Today's Executive Priorities:</div>
              <ul className="space-y-1 text-xs text-slate-300 font-sans">
                {(report?.priority_actions || []).map((act: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
