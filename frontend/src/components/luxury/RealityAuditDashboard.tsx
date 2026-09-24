'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Coins,
  FileCheck2,
  Lock,
  Search,
  RefreshCw,
  AlertTriangle,
  FileText,
  UserCheck,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  DollarSign,
  Hash,
  Database
} from 'lucide-react';
import { getApiUrl } from '@/lib/api';

interface RealityAuditDashboardProps {
  missionId?: number;
  onNavigateTab?: (tabId: string) => void;
}

interface CompletionRule {
  rule_number: number;
  title: string;
  description: string;
  status: string;
  verified: boolean;
  evidence_count: number;
}

interface RevenueEntry {
  id: number;
  mission_id: number;
  amount: number;
  currency: string;
  client_identity: string;
  payer_name: string;
  proposal_id?: number;
  payment_status: string;
  payment_reference: string;
  revenue_verification_status: string;
  source: string;
  audit_hash: string;
  timestamp: string;
  notes: string;
  badge: string;
}

interface DemoHistoryEntry {
  id: number;
  amount: number;
  currency: string;
  client_identity: string;
  payment_reference: string;
  category: string;
  timestamp: string;
  notes: string;
  badge: string;
}

interface BuyerEvidence {
  lead_id: number;
  name: string;
  company: string;
  source_platform: string;
  source_url: string;
  profile_url: string;
  evidence_reference: string;
  requirement: string;
  contact_info: string;
  discovery_time: string;
  evidence_score: number;
  estimated_budget: number;
  pipeline_stage: string;
  reality_badge: string;
  reality_badge_label: string;
}

export const RealityAuditDashboard: React.FC<RealityAuditDashboardProps> = ({
  missionId,
  onNavigateTab
}) => {
  const [auditData, setAuditData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'rules' | 'revenue' | 'buyers' | 'demo_history'>('rules');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyForm, setVerifyForm] = useState({
    lead_id: 0,
    client_identity: '',
    payer_name: '',
    amount: 0,
    payment_reference: ''
  });
  const [verifying, setVerifying] = useState(false);
  const [verifyNotice, setVerifyNotice] = useState<string | null>(null);

  const fetchAuditData = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl(`/api/v1/closing-engine/reality-audit/${missionId}`)).catch(() => null);
      if (res && res.ok) {
        const json = await res.json();
        setAuditData(json);
      }
    } catch (e) {
      console.error('Failed to fetch reality audit data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
    const interval = setInterval(fetchAuditData, 20000);
    return () => clearInterval(interval);
  }, [missionId]);

  const handleVerifyTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setVerifyNotice(null);
    try {
      const res = await fetch(getApiUrl('/api/v1/closing-engine/verify-transaction'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mission_id: missionId,
          lead_id: Number(verifyForm.lead_id),
          actual_revenue_aed: Number(verifyForm.amount),
          payment_reference: verifyForm.payment_reference,
          client_identity: verifyForm.client_identity,
          payer_name: verifyForm.payer_name,
          source: 'MANUAL_REALITY_AUDITOR_SETTLEMENT'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setVerifyNotice(`Success: Transaction settled for ${data.client_identity}. Audit Hash: ${data.audit_hash}`);
        setShowVerifyModal(false);
        fetchAuditData();
      }
    } catch (err) {
      console.error(err);
      setVerifyNotice('Verification submission failed.');
    } finally {
      setVerifying(false);
    }
  };

  const rules: CompletionRule[] = auditData?.completion_rules_checklist || [];
  const realRevenueEntries: RevenueEntry[] = auditData?.real_revenue_entries || [];
  const demoHistory: DemoHistoryEntry[] = auditData?.demo_test_history || [];
  const buyerEvidence: BuyerEvidence[] = auditData?.buyer_terminal_evidence || [];

  const satisfiedRulesCount = rules.filter(r => r.verified).length;

  return (
    <div className="space-y-8 w-full max-w-[1640px] mx-auto pb-12">
      {/* 1. Executive Reality Mode Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B101D] via-[#070A14] to-[#04060A] border-2 border-[#D4AF37]/60 shadow-[0_0_40px_rgba(212,175,55,0.25)] p-6 md:p-8">
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/60 text-emerald-400 text-xs font-mono font-black tracking-widest uppercase flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                PHASE 18 — REALITY MODE ACTIVATED
              </span>
              <span className="px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#F5D77F] text-xs font-mono font-bold">
                100% EXTERNAL PROOF ENFORCED
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-mono font-bold">
                SHA-256 AUDIT TRAILS
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F5D77F] to-[#D4AF37]">
              Reality Audit & Business Integrity Engine
            </h1>
            <p className="text-sm text-slate-300 font-sans max-w-3xl leading-relaxed">
              Zero fake revenue. Zero fake buyers. Zero auto-completed missions. All metrics strictly require verified external lead evidence, delivered messages, completed calls, and settled payment proofs.
            </p>
          </div>

          {/* Reality Status Badges Legend */}
          <div className="bg-[#04060A]/90 border border-[#D4AF37]/40 rounded-2xl p-4 space-y-2.5 backdrop-blur-md min-w-[280px]">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#F5D77F] font-bold border-b border-white/10 pb-1.5 flex items-center justify-between">
              <span>Reality Status Badges</span>
              <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span className="font-bold">GREEN:</span> Real verified transaction
              </div>
              <div className="flex items-center gap-2 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                <span className="font-bold">YELLOW:</span> Pipeline opportunity
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                <span className="font-bold">GRAY:</span> AI suggestion / Forecast
              </div>
            </div>
          </div>
        </div>

        {/* 4 Summary Metric Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="p-4 rounded-2xl bg-[#04060A]/80 border border-[#D4AF37]/30 space-y-1">
            <div className="text-[10.5px] uppercase font-mono text-[#F5D77F] font-bold">Collected Revenue</div>
            <div className="text-2xl md:text-3xl font-mono font-black text-[#F5D77F]">
              AED {(auditData?.collected_revenue_aed || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono font-bold">Payment Verified Only</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#04060A]/80 border border-white/10 space-y-1">
            <div className="text-[10.5px] uppercase font-mono text-slate-400">Target Revenue</div>
            <div className="text-2xl md:text-3xl font-mono font-black text-white">
              AED {(auditData?.target_revenue_aed || 2500).toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Mission #{missionId || auditData?.mission_id || 'Active'} Goal</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#04060A]/80 border border-blue-500/30 space-y-1">
            <div className="text-[10.5px] uppercase font-mono text-blue-300">Completion Rules</div>
            <div className="text-2xl md:text-3xl font-mono font-black text-blue-400">
              {satisfiedRulesCount} / 8 <span className="text-sm font-normal text-slate-400">Satisfied</span>
            </div>
            <div className="text-[10px] text-blue-300/80 font-mono">
              Status: <span className="text-amber-400 font-bold">{auditData?.mission_status || 'ACTIVE'}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#04060A]/80 border border-purple-500/30 space-y-1">
            <div className="text-[10.5px] uppercase font-mono text-purple-300">Verified Buyers</div>
            <div className="text-2xl md:text-3xl font-mono font-black text-purple-400">
              {buyerEvidence.length}
            </div>
            <div className="text-[10px] text-purple-300/80 font-mono">With Source URL Evidence</div>
          </div>
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D4AF37]/30 pb-4">
        <div className="flex rounded-2xl bg-[#080D18] border border-[#D4AF37]/30 p-1 font-mono text-xs">
          <button
            onClick={() => setActiveSubTab('rules')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeSubTab === 'rules'
                ? 'bg-[#D4AF37] text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            8-Point Mission Rules ({satisfiedRulesCount}/8)
          </button>

          <button
            onClick={() => setActiveSubTab('revenue')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeSubTab === 'revenue'
                ? 'bg-[#D4AF37] text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Coins className="w-4 h-4" />
            Real Revenue Ledger ({realRevenueEntries.length})
          </button>

          <button
            onClick={() => setActiveSubTab('buyers')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeSubTab === 'buyers'
                ? 'bg-[#D4AF37] text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Buyer Terminal Evidence ({buyerEvidence.length})
          </button>

          <button
            onClick={() => setActiveSubTab('demo_history')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeSubTab === 'demo_history'
                ? 'bg-[#D4AF37] text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            Demo / Test Archive ({demoHistory.length})
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAuditData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-[#080D18] border border-[#D4AF37]/30 text-xs font-mono text-[#F5D77F] hover:bg-[#D4AF37]/10 transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Audit
          </button>

          <button
            onClick={() => setShowVerifyModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-mono font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:brightness-110 transition-all flex items-center gap-2"
          >
            <FileCheck2 className="w-4 h-4" />
            Verify Settlement Proof
          </button>
        </div>
      </div>

      {verifyNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {verifyNotice}
        </div>
      )}

      {/* 3. TAB 1: 8-Point Mission Completion Rules Checklist */}
      {activeSubTab === 'rules' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
              Mission Completion Proof Gates
            </h2>
            <span className="text-xs font-mono text-slate-400">
              A mission remains <strong className="text-amber-400">ACTIVE</strong> until all 8 rules are 100% verified.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map((rule) => {
              return (
                <div
                  key={rule.rule_number}
                  className={`p-5 rounded-2xl border transition-all ${
                    rule.verified
                      ? 'bg-gradient-to-br from-emerald-500/[0.08] via-[#080D18] to-[#04060A] border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                      : 'bg-[#080D18]/80 border-white/10 hover:border-[#D4AF37]/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#D4AF37]">
                          RULE #{rule.rule_number}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            rule.verified
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {rule.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-base">{rule.title}</h3>
                      <p className="text-xs text-slate-300 font-sans leading-relaxed">
                        {rule.description}
                      </p>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                          rule.verified
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400'
                        }`}
                      >
                        {rule.verified ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Clock className="w-5 h-5" />
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 mt-1">
                        Proof Count: <strong className="text-white">{rule.evidence_count}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. TAB 2: Verified Revenue Proof Ledger */}
      {activeSubTab === 'revenue' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-[#F5D77F]" />
              Real Verified Revenue Ledger (Payment Verified Transactions Only)
            </h2>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              🟢 Real Verified Transactions
            </span>
          </div>

          {realRevenueEntries.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[#080D18]/90 border border-[#D4AF37]/30 text-center space-y-3">
              <ShieldCheck className="w-12 h-12 text-[#D4AF37] mx-auto opacity-70" />
              <h3 className="text-lg font-serif font-bold text-white">
                Zero Unsettled / Simulated Revenue in Real Ledger
              </h3>
              <p className="text-xs text-slate-400 max-w-xl mx-auto font-sans leading-relaxed">
                In strict Reality Mode, the Real Revenue Counter remains at <strong>AED 0.00</strong> until external escrow / bank payment confirmation is received and cryptographically signed with a SHA-256 audit hash.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setShowVerifyModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black font-mono text-xs font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:brightness-110 transition-all"
                >
                  Verify Real Client Payment
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {realRevenueEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-6 rounded-2xl bg-gradient-to-br from-[#0B101D] via-[#080D18] to-[#04060A] border-2 border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.15)] space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        <h3 className="text-lg font-bold text-white">{entry.client_identity}</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          PAYMENT SETTLED & VERIFIED
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Payer: <strong className="text-white">{entry.payer_name}</strong> • Timestamp: <span className="text-slate-300 font-mono">{entry.timestamp}</span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-2xl font-black text-[#F5D77F]">
                        AED {entry.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-emerald-400">
                        Commission: AED {(entry.amount * 0.20).toLocaleString()} (20%)
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                      <div className="text-slate-400 text-[10px] uppercase">Payment Reference</div>
                      <div className="text-emerald-400 font-bold">{entry.payment_reference}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                      <div className="text-slate-400 text-[10px] uppercase">Source Proof</div>
                      <div className="text-slate-200">{entry.source}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                      <div className="text-slate-400 text-[10px] uppercase">Cryptographic Audit Hash</div>
                      <div className="text-amber-400 font-bold truncate" title={entry.audit_hash}>
                        {entry.audit_hash}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. TAB 3: Buyer Terminal Evidence Table */}
      {activeSubTab === 'buyers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#D4AF37]" />
              Hot Buyer Terminal External Evidence Audit
            </h2>
            <span className="text-xs font-mono text-slate-400">
              Only buyers with verified source URL & contact channels are shown.
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#D4AF37]/30 bg-[#080D18]/90">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#04060A] text-[#F5D77F] font-mono uppercase text-[10.5px] border-b border-[#D4AF37]/30">
                <tr>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Buyer & Company</th>
                  <th className="p-3.5">Source Platform</th>
                  <th className="p-3.5">Source & Profile URLs</th>
                  <th className="p-3.5">Requirement</th>
                  <th className="p-3.5">Contact Info</th>
                  <th className="p-3.5">Score</th>
                  <th className="p-3.5">Budget</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {buyerEvidence.map((b) => (
                  <tr key={b.lead_id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5 font-mono whitespace-nowrap">
                      {b.reality_badge === 'GREEN' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          VERIFIED
                        </span>
                      ) : b.reality_badge === 'YELLOW' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          PIPELINE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/40 flex items-center gap-1 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          AI DRAFT
                        </span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-white">{b.name}</div>
                      <div className="text-[11px] text-slate-400">{b.company}</div>
                    </td>

                    <td className="p-3.5 font-mono text-[#D4AF37] font-semibold whitespace-nowrap">
                      {b.source_platform}
                    </td>

                    <td className="p-3.5 space-y-1">
                      {b.source_url && (
                        <a
                          href={b.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-mono truncate max-w-[180px]"
                        >
                          Source Link <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      )}
                      {b.profile_url && (
                        <a
                          href={b.profile_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-mono truncate max-w-[180px]"
                        >
                          Profile Link <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      )}
                    </td>

                    <td className="p-3.5 text-slate-300 max-w-xs line-clamp-2">
                      {b.requirement}
                    </td>

                    <td className="p-3.5 font-mono text-slate-300 text-[11px] whitespace-nowrap">
                      {b.contact_info}
                    </td>

                    <td className="p-3.5 font-mono text-emerald-400 font-bold whitespace-nowrap">
                      {b.evidence_score}%
                    </td>

                    <td className="p-3.5 font-mono text-[#F5D77F] font-bold whitespace-nowrap">
                      AED {b.estimated_budget.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. TAB 4: System Test Revenue / Demo History Archive */}
      {activeSubTab === 'demo_history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-slate-400" />
              System Test Revenue / Demo History Quarantined Archive
            </h2>
            <span className="text-xs font-mono text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              ⚪ Quarantined from Real KPI
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-sans leading-relaxed">
            <strong>Quarantine Notice:</strong> The records below represent previous simulated test transactions (AED 7,500 total). As required by Phase 18 Reality Mode, all simulated data has been completely removed from the real revenue counter and archived here for traceability.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {demoHistory.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-[#080D18]/80 border border-slate-700 space-y-3 opacity-80 hover:opacity-100 transition-opacity"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-700 text-slate-300">
                    {item.category}
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-400">
                    AED {item.amount.toLocaleString()}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-200">{item.client_identity}</h4>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    Ref: {item.payment_reference}
                  </div>
                </div>

                <p className="text-xs text-slate-400 font-sans italic border-t border-white/5 pt-2">
                  {item.notes}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-br from-[#0C1222] via-[#080D18] to-[#04060A] border-2 border-[#D4AF37] p-6 md:p-8 space-y-6 shadow-[0_0_50px_rgba(212,175,55,0.3)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-lg font-serif font-bold text-white">
                  Verify Real Client Settlement
                </h3>
              </div>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleVerifyTransaction} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-slate-300 block mb-1">Client / Company Identity</label>
                <input
                  type="text"
                  value={verifyForm.client_identity}
                  onChange={(e) => setVerifyForm({ ...verifyForm, client_identity: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#04060A] border border-[#D4AF37]/40 text-white focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Payer Executive Name</label>
                <input
                  type="text"
                  value={verifyForm.payer_name}
                  onChange={(e) => setVerifyForm({ ...verifyForm, payer_name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#04060A] border border-[#D4AF37]/40 text-white focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Amount (AED)</label>
                  <input
                    type="number"
                    value={verifyForm.amount}
                    onChange={(e) => setVerifyForm({ ...verifyForm, amount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-[#04060A] border border-[#D4AF37]/40 text-[#F5D77F] font-bold focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Bank Payment Reference</label>
                  <input
                    type="text"
                    value={verifyForm.payment_reference}
                    onChange={(e) => setVerifyForm({ ...verifyForm, payment_reference: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#04060A] border border-[#D4AF37]/40 text-emerald-400 font-bold focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-400 font-sans italic">
                Submitting creates a verifiable SHA-256 cryptographic audit hash, permanently moves the lead to WON / SETTLED, and updates the Collected Revenue counter.
              </p>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifying}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black font-bold shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:brightness-110 transition-all flex items-center gap-2"
                >
                  {verifying ? 'Generating Hash...' : 'Sign & Verify Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
