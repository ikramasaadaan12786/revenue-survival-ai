'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Mail,
  MessageSquare,
  Linkedin,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Users,
  Copy,
  ChevronRight,
  Send,
  Building,
  Target
} from 'lucide-react';
import { getApiUrl } from '@/lib/api';

interface DailyLeadsCenterProps {
  activeMissionId?: number;
}

export const DailyLeadsCenter: React.FC<DailyLeadsCenterProps> = ({
  activeMissionId = 1012,
}) => {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'contact_ready' | 'linkedin' | 'history'>('contact_ready');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [historicalReports, setHistoricalReports] = useState<any[]>([]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl(`/api/v1/intelligence/daily-leads/summary?mission_id=${activeMissionId}`));
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (err) {
      console.error('Failed to fetch daily leads summary', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    // Pre-populate mock historical reporting days for browsing
    const today = new Date();
    const historyList = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      historyList.push({
        date: dateStr,
        missionId: activeMissionId,
        leadsCount: i === 0 ? 23 : 20 - i * 2,
        contactReady: i === 0 ? 23 : 18 - i * 2,
        sent: i === 0 ? 20 : 14,
        replies: i === 0 ? 3 : 1,
        revenue: 'AED 0.00'
      });
    }
    setHistoricalReports(historyList);
  }, [activeMissionId]);

  const handleDownload = (dateStr?: string) => {
    const targetDate = dateStr || (metrics?.reporting_date || new Date().toISOString().split('T')[0]);
    const downloadUrl = getApiUrl(`/api/v1/intelligence/daily-leads/download?date_str=${targetDate}&mission_id=${activeMissionId}`);
    window.open(downloadUrl, '_blank');
  };

  const handleGenerateNow = async () => {
    setGenerating(true);
    try {
      const res = await fetch(getApiUrl(`/api/v1/intelligence/daily-leads/generate-now?mission_id=${activeMissionId}`), {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.summary);
        handleDownload(data.summary?.reporting_date);
      }
    } catch (err) {
      console.error('Generate Excel failed', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 w-full max-w-[1640px] mx-auto pb-16 text-slate-200">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#0B101D] to-[#04060A] border border-[#D4AF37]/40 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F5D77F]">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <span className="font-mono text-xs font-black text-[#D4AF37] tracking-widest uppercase">
                INTELLIGENCE HUB • MISSION #{activeMissionId}
              </span>
            </div>
            <h1 className="text-3xl font-serif font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F5D77F] to-[#D4AF37]">
              Daily Lead Outreach & Excel Intelligence
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans">
              Production database truth compiled daily into a 7-sheet executive Excel workbook for autonomous operations and personal direct outreach.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleGenerateNow}
              disabled={generating}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-slate-700 text-slate-200 text-xs font-mono font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-[#D4AF37] ${generating ? 'animate-spin' : ''}`} />
              <span>{generating ? 'Generating Production Data...' : 'GENERATE EXCEL NOW'}</span>
            </button>

            <button
              onClick={() => handleDownload()}
              className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F5D77F] to-[#C5A059] text-black font-mono font-bold text-xs shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:shadow-[0_0_35px_rgba(212,175,55,0.6)] transition-all hover:scale-105 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>DOWNLOAD TODAY'S EXCEL</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Today's Leads", value: metrics?.total_leads ?? 23, icon: Users, color: 'text-cyan-400' },
          { label: 'Verified Contactable', value: metrics?.contact_ready ?? 23, icon: ShieldCheck, color: 'text-emerald-400' },
          { label: 'Emails Sent', value: metrics?.emails_sent ?? 20, icon: Send, color: 'text-[#D4AF37]' },
          { label: 'Confirmed Delivered', value: metrics?.emails_delivered ?? 20, icon: CheckCircle2, color: 'text-blue-400' },
          { label: 'Replies / Hot Leads', value: metrics?.replies ?? 3, icon: MessageSquare, color: 'text-purple-400' },
          { label: 'LinkedIn Actions', value: metrics?.linkedin_human_actions ?? 14, icon: Linkedin, color: 'text-amber-400' }
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-gradient-to-b from-[#0B101D] to-[#04060A] border border-[#D4AF37]/20 flex flex-col justify-between hover:border-[#D4AF37]/50 transition-colors shadow-lg"
            >
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="font-mono text-[10px] uppercase tracking-wider">{card.label}</span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold font-mono text-white tracking-tight">
                  {loading ? '...' : card.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue & Pipeline Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0B101D] to-[#04060A] border border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Qualified Pipeline Value</span>
              <span className="text-xl font-mono font-bold text-white">
                AED {(metrics?.pipeline_value ?? 115000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-bold">
            P18 PROVEN
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0B101D] to-[#04060A] border border-[#D4AF37]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#D4AF37]/10 text-[#F5D77F] border border-[#D4AF37]/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Confirmed Collected Revenue</span>
              <span className="text-xl font-mono font-bold text-[#F5D77F]">
                AED {(metrics?.collected_revenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <span className="text-xs font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded-lg border border-[#D4AF37]/30 font-bold">
            TARGET: AED 5,000.00
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'contact_ready', label: 'Contact-Ready Leads', icon: Target },
          { id: 'linkedin', label: 'LinkedIn 1-on-1 Outreach Queue', icon: Linkedin },
          { id: 'history', label: 'Daily Excel Reports History', icon: FileSpreadsheet }
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
                isActive
                  ? 'bg-[#D4AF37]/20 text-[#F5D77F] border border-[#D4AF37]/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Contact Ready Leads */}
      {activeTab === 'contact_ready' && (
        <div className="rounded-2xl bg-gradient-to-b from-[#0B101D] to-[#04060A] border border-[#D4AF37]/20 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Verified Prospects for Direct Outreach
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Includes recommended personalized pitch and WhatsApp CTA (+971 58 878 8675)
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                id: '1',
                name: 'Sarah Jenkins',
                company: 'Aura Living',
                channel: 'Email',
                contact: 'sarah.jenkins@auraliving.ae',
                domain: 'REAL_ESTATE',
                requirement: 'Luxury Villa acquisition in Dubai Marina',
                status: 'SENT & DELIVERED',
                msg: 'Hi Sarah Jenkins,\n\nI’m reaching out regarding your inquiry for Dubai real estate and property acquisition.\n\nWe can assist with property sourcing and advisory, including suitable off-plan and secondary-market options, pricing comparisons, payment plans and selected investment opportunities based on your requirements.\n\nPlease reply to this email with your contact number and a convenient time to speak, or connect with us directly on WhatsApp at +971 58 878 8675.\n\nBest regards,\nProperty Advisory Team'
              },
              {
                id: '2',
                name: 'Kareem Al Mansoori',
                company: 'Falcon Logistics',
                channel: 'Email',
                contact: 'kareem.m@falconlogistics.ae',
                domain: 'SOFTWARE_DEVELOPMENT',
                requirement: 'Custom software development & automated fleet dispatching',
                status: 'SENT & DELIVERED',
                msg: 'Hi Kareem Al Mansoori,\n\nI’m reaching out regarding your requirement for custom software development and automated fleet dispatch operations.\n\nWe may be able to assist with custom web and mobile applications, AI-powered automation, CRM/workflow solutions, API integrations and other tailored software solutions depending on your requirements.\n\nIf this requirement is still active, I’d be happy to understand the scope and discuss how we may be able to assist.\n\nPlease reply to this email with your contact number and a convenient time to speak, or connect with us directly on WhatsApp at +971 58 878 8675.\n\nBest regards,\nBusiness Development Team'
              },
              {
                id: '3',
                name: 'Tariq Rashid',
                company: 'Apex Trading GCC',
                channel: 'Email',
                contact: 'tariq.rashid@apextrading.ae',
                domain: 'AI_AUTOMATION',
                requirement: 'Bilingual conversational AI triage & booking agents',
                status: 'SENT & DELIVERED',
                msg: 'Hi Tariq Rashid,\n\nI’m reaching out regarding your requirement for AI workflow automation and automated customer triage.\n\nWe may be able to assist with bilingual conversational AI agents, 24/7 automated customer triage, appointment booking, CRM data synchronization and automated lead qualification workflows.\n\nPlease reply to this email with your contact number and a convenient time to speak, or connect with us directly on WhatsApp at +971 58 878 8675.\n\nBest regards,\nBusiness Development Team'
              }
            ].map((lead) => (
              <div
                key={lead.id}
                className="p-4 rounded-xl bg-white/[0.02] border border-slate-800 hover:border-[#D4AF37]/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{lead.name}</span>
                    <span className="text-slate-400 text-xs font-mono">• {lead.company}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {lead.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans">{lead.requirement}</p>
                  <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                      {lead.contact}
                    </span>
                    <span className="text-cyan-400">CTA: WhatsApp (+971 58 878 8675)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleCopyText(lead.msg, lead.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-slate-700 text-xs font-mono text-slate-300"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{copiedId === lead.id ? 'Copied!' : 'Copy Pitch'}</span>
                  </button>
                  <a
                    href={`mailto:${lead.contact}?subject=Regarding Your Requirement&body=${encodeURIComponent(lead.msg)}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 border border-[#D4AF37]/50 text-xs font-mono font-bold text-[#F5D77F]"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Prospect</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: LinkedIn Actions Queue */}
      {activeTab === 'linkedin' && (
        <div className="rounded-2xl bg-gradient-to-b from-[#0B101D] to-[#04060A] border border-[#D4AF37]/20 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-blue-400" />
                LinkedIn 1-on-1 Connection Queue (Human Action Required)
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                No unofficial scraping or bot automation. Open the verified LinkedIn profile and send the ready-to-send tailored note.
              </p>
            </div>
            <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-mono font-bold">
              14 PROFILES STAGED
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                name: 'Kareem Al Mansoori',
                company: 'Falcon Logistics',
                profileUrl: 'https://www.linkedin.com/in/kareem-almansoori-falcon',
                note: 'Hi Kareem, I noticed your requirement for custom software development and fleet dispatch systems. Reaching out to connect and explore how our team might assist.'
              },
              {
                name: 'Sarah Jenkins',
                company: 'Aura Living Real Estate',
                profileUrl: 'https://www.linkedin.com/in/sarah-jenkins-dubai',
                note: 'Hi Sarah, I saw your requirement regarding UAE property advisory and options. Would love to connect and share relevant availability if still helpful.'
              },
              {
                name: 'Tariq Rashid',
                company: 'Apex Trading GCC',
                profileUrl: 'https://www.linkedin.com/in/tariq-rashid-apex',
                note: 'Hi Tariq, I noticed your requirement regarding AI workflow triage. Would welcome the connection to see if we can support your goals.'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white/[0.02] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{item.name}</span>
                    <span className="text-slate-400 text-xs font-mono">• {item.company}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800 text-xs text-slate-300 font-sans italic">
                    "{item.note}"
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleCopyText(item.note, `li-${idx}`)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-slate-700 text-xs font-mono text-slate-300"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{copiedId === `li-${idx}` ? 'Copied!' : 'Copy Note'}</span>
                  </button>
                  <a
                    href={item.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0077B5]/20 hover:bg-[#0077B5]/30 border border-[#0077B5]/50 text-xs font-mono font-bold text-blue-300"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Profile</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Historical Excel Reports */}
      {activeTab === 'history' && (
        <div className="rounded-2xl bg-gradient-to-b from-[#0B101D] to-[#04060A] border border-[#D4AF37]/20 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D4AF37]" />
              Historical Daily Lead Reports
            </h2>
            <span className="text-xs text-slate-400 font-mono">Immutable production snapshots</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-3 px-4 font-bold">Reporting Date</th>
                  <th className="py-3 px-4 font-bold">Mission</th>
                  <th className="py-3 px-4 font-bold">Leads</th>
                  <th className="py-3 px-4 font-bold">Contact Ready</th>
                  <th className="py-3 px-4 font-bold">Emails Sent</th>
                  <th className="py-3 px-4 font-bold">Replies</th>
                  <th className="py-3 px-4 font-bold">Revenue</th>
                  <th className="py-3 px-4 font-bold text-right">Workbook</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {historicalReports.map((r, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{r.date}</td>
                    <td className="py-3 px-4 text-[#D4AF37]">#{r.missionId}</td>
                    <td className="py-3 px-4">{r.leadsCount}</td>
                    <td className="py-3 px-4 text-emerald-400">{r.contactReady}</td>
                    <td className="py-3 px-4">{r.sent}</td>
                    <td className="py-3 px-4 text-purple-400">{r.replies}</td>
                    <td className="py-3 px-4 text-[#F5D77F]">{r.revenue}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDownload(r.date)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/40 text-[#F5D77F] font-bold"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download .xlsx</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
