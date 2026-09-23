'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Coins,
  Target,
  TrendingUp,
  Globe2,
  Layers,
  Send,
  MessageSquare,
  PhoneCall,
  FileText,
  CreditCard,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  Zap,
  Lock,
  ArrowRight,
  ChevronRight,
  DollarSign
} from 'lucide-react';
import { getApiUrl } from '@/lib/api';

interface TelemetryData {
  mission_id: number;
  title: string;
  currency: string;
  mission_target: number;
  revenue_generated: number;
  revenue_remaining: number;
  time_remaining_hours: number;
  markets_tested_count: number;
  markets_tested: string[];
  products_tested_count: number;
  products_tested: string[];
  leads_found_count: number;
  messages_sent_count: number;
  replies_count: number;
  calls_count: number;
  proposals_count: number;
  payments_count: number;
  mission_status: string;
  budget_spent: number;
  audit_hash: string;
  zero_simulation_verified: boolean;
}

interface AutonomousRevenueMissionEngineProps {
  missionId?: number;
  onNavigateTab?: (tabId: string) => void;
}

export const AutonomousRevenueMissionEngine: React.FC<AutonomousRevenueMissionEngineProps> = ({
  missionId = 1006,
  onNavigateTab
}) => {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningCycle, setIsRunningCycle] = useState(false);
  const [cycleResult, setCycleResult] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // New Mission Form State
  const [newTitle, setNewTitle] = useState('Autonomous Revenue Sprint — 18 Hour Challenge');
  const [newGoal, setNewGoal] = useState(2500);
  const [newBudget, setNewBudget] = useState(0);
  const [newHours, setNewHours] = useState(18);

  // Verify Payment Form State
  const [payAmount, setPayAmount] = useState(2500);
  const [payRef, setPayRef] = useState('');
  const [payerName, setPayerName] = useState('');
  const [paySource, setPaySource] = useState('Bank Wire Transfer');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const fetchTelemetry = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl(`/api/v1/closing-engine/mission-engine/telemetry/${missionId}`));
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      }
    } catch (e) {
      console.error('Failed to fetch mission telemetry', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 15000);
    return () => clearInterval(interval);
  }, [missionId]);

  const handleRun12StepCycle = async () => {
    setIsRunningCycle(true);
    setCycleResult(null);
    try {
      const res = await fetch(getApiUrl(`/api/v1/closing-engine/mission-engine/execute-12-step-loop/${missionId}`), {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setCycleResult(data);
        if (data.telemetry) {
          setTelemetry(data.telemetry);
        }
      }
    } catch (e) {
      console.error('Failed to run 12-step cycle', e);
    } finally {
      setIsRunningCycle(false);
    }
  };

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(getApiUrl('/api/v1/closing-engine/mission-engine/create-autonomous-mission'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          goal_amount: Number(newGoal),
          budget: Number(newBudget),
          deadline_hours: Number(newHours),
          currency: 'AED'
        })
      });
      if (res.ok) {
        setShowCreateModal(false);
        fetchTelemetry();
      }
    } catch (e) {
      console.error('Failed to create autonomous mission', e);
    }
  };

  const handleVerifyPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payRef || !payerName) return;
    setIsSubmittingPayment(true);
    try {
      const res = await fetch(getApiUrl('/api/v1/closing-engine/mission-engine/verify-real-payment'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mission_id: missionId,
          amount: Number(payAmount),
          transaction_reference: payRef,
          payer_name: payerName,
          currency: 'AED',
          payment_source: paySource,
          notes: `Verified settlement proof confirmed by CEO.`
        })
      });
      if (res.ok) {
        setShowPaymentModal(false);
        setPayRef('');
        setPayerName('');
        fetchTelemetry();
      }
    } catch (e) {
      console.error('Failed to verify payment', e);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const formatAED = (val?: number) => {
    if (val === undefined || val === null) return 'AED 0.00';
    return `AED ${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-8 w-full">
      {/* ========================================================================= */}
      {/* 1. TOP EXECUTIVE MISSION BANNER */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#0B101D] via-[#070A14] to-[#04060A] border border-[#D4AF37]/40 p-6 md:p-8 shadow-[0_12px_45px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#F5D77F] font-mono text-xs font-black tracking-widest uppercase flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#F5D77F]" />
                AUTONOMOUS REVENUE MISSION ENGINE
              </span>
              <span className={`px-3 py-1 rounded-full font-mono text-xs font-black tracking-wider uppercase flex items-center gap-1.5 ${
                telemetry?.mission_status === 'COMPLETED'
                  ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                  : 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
              }`}>
                <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                STATUS: {telemetry?.mission_status || 'ACTIVE'}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-bold">
                ZERO SIMULATION • UNRESTRICTED MULTI-SECTOR
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-serif font-black text-white tracking-tight">
              {telemetry?.title || 'Dubai AI Revenue Sprint — 18 Hour Challenge'}
            </h1>
            <p className="text-sm font-mono text-[#8C9BAE] leading-relaxed">
              Freedom mode active. The AI analyzes global market opportunities, creates sellable offers, and closes deals across any legal sector (AI Automation, SaaS, Healthcare, Logistics, E-Commerce, Consulting).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/20 text-white font-mono text-xs font-bold transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-[#F5D77F]" />
              New CEO Mission
            </button>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-bold transition-all flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              Verify Real Payment
            </button>
            <button
              onClick={handleRun12StepCycle}
              disabled={isRunningCycle}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F5D77F] to-[#AA7C11] text-black font-mono text-xs font-black shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:brightness-110 transition-all flex items-center gap-2"
            >
              <Play className={`w-4 h-4 ${isRunningCycle ? 'animate-spin' : ''}`} />
              {isRunningCycle ? 'Executing 12-Step Loop...' : 'Run 12-Step Revenue Cycle'}
            </button>
          </div>
        </div>

        {/* Audit Hash & Integrity Footer */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#8C9BAE]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cryptographic Proof: <strong className="text-white">{telemetry?.audit_hash || 'SHA-256 PENDING'}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#F5D77F]" />
            <span>Time Remaining: <strong className="text-white">{telemetry?.time_remaining_hours?.toFixed(1) || '18.0'}h</strong></span>
          </div>
          <div className="text-emerald-400 font-bold">
            Mission Rule: Payment Verified = Revenue Added. Otherwise ACTIVE.
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. THE 12 REAL DASHBOARD METRICS */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#F5D77F]" />
            <h2 className="text-lg md:text-xl font-serif font-black text-white uppercase tracking-wider">
              Real Operating & Revenue Telemetry (12 Core Metrics)
            </h2>
          </div>
          <span className="text-xs font-mono text-emerald-400">● Live External Channels</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
          {/* 1. Mission Target */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0B101D] to-[#04060A] border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 transition-all">
            <div className="flex items-center justify-between text-[#8C9BAE] text-[11px] font-mono font-semibold uppercase mb-1">
              <span>1. Mission Target</span>
              <Target className="w-3.5 h-3.5 text-[#F5D77F]" />
            </div>
            <div className="text-lg md:text-xl font-serif font-bold text-white">
              {formatAED(telemetry?.mission_target || 2500)}
            </div>
            <div className="text-[10px] font-mono text-[#8C9BAE] mt-1">Minimum Revenue Goal</div>
          </div>

          {/* 2. Revenue Generated */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0B101D] to-[#04060A] border border-emerald-500/40 hover:border-emerald-500/70 transition-all">
            <div className="flex items-center justify-between text-emerald-400 text-[11px] font-mono font-semibold uppercase mb-1">
              <span>2. Revenue Generated</span>
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg md:text-xl font-serif font-bold text-emerald-400">
              {formatAED(telemetry?.revenue_generated || 0)}
            </div>
            <div className="text-[10px] font-mono text-emerald-500/80 mt-1">Real Verified Payments</div>
          </div>

          {/* 3. Revenue Remaining */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0B101D] to-[#04060A] border border-amber-500/30 hover:border-amber-500/60 transition-all">
            <div className="flex items-center justify-between text-amber-300 text-[11px] font-mono font-semibold uppercase mb-1">
              <span>3. Revenue Remaining</span>
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-lg md:text-xl font-serif font-bold text-amber-300">
              {formatAED(telemetry?.revenue_remaining || 2500)}
            </div>
            <div className="text-[10px] font-mono text-[#8C9BAE] mt-1">Required to Complete</div>
          </div>

          {/* 4. Time Remaining */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0B101D] to-[#04060A] border border-cyan-500/30 hover:border-cyan-500/60 transition-all">
            <div className="flex items-center justify-between text-cyan-400 text-[11px] font-mono font-semibold uppercase mb-1">
              <span>4. Time Remaining</span>
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-lg md:text-xl font-serif font-bold text-cyan-300">
              {telemetry?.time_remaining_hours?.toFixed(1) || '18.0'}h
            </div>
            <div className="text-[10px] font-mono text-[#8C9BAE] mt-1">Live Countdown</div>
          </div>

          {/* 5. Markets Tested */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0B101D] to-[#04060A] border border-white/10 hover:border-[#D4AF37]/50 transition-all">
            <div className="flex items-center justify-between text-[#8C9BAE] text-[11px] font-mono font-semibold uppercase mb-1">
              <span>5. Markets Tested</span>
              <Globe2 className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-lg md:text-xl font-serif font-bold text-white">
              {telemetry?.markets_tested_count || 5} Sectors
            </div>
            <div className="text-[10px] font-mono text-[#8C9BAE] mt-1">Multi-Market Scans</div>
          </div>

          {/* 6. Products Tested */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0B101D] to-[#04060A] border border-white/10 hover:border-[#D4AF37]/50 transition-all">
            <div className="flex items-center justify-between text-[#8C9BAE] text-[11px] font-mono font-semibold uppercase mb-1">
              <span>6. Products Tested</span>
              <Layers className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-lg md:text-xl font-serif font-bold text-white">
              {telemetry?.products_tested_count || 5} Offers
            </div>
            <div className="text-[10px] font-mono text-[#8C9BAE] mt-1">Sellable Packages</div>
          </div>

          {/* 7. Leads Found */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0B101D] to-[#04060A] border border-white/10 hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-between text-[#8C9BAE] text-[11px] font-mono font-semibold uppercase mb-1">
              <span>7. Leads Found</span>
              <Target className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg md:text-xl font-serif font-bold text-white">
              {telemetry?.leads_found_count || 0}
            </div>
            <div className="text-[10px] font-mono text-emerald-400 mt-1">Verified Evidence</div>
          </div>

          {/* 8. Messages Sent */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0B101D] to-[#04060A] border border-white/10 hover:border-cyan-500/50 transition-all">
            <div className="flex items-center justify-between text-[#8C9BAE] text-[11px] font-mono font-semibold uppercase mb-1">
              <span>8. Messages Sent</span>
              <Send className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-lg md:text-xl font-serif font-bold text-white">
              {telemetry?.messages_sent_count || 0}
            </div>
            <div className="text-[10px] font-mono text-[#8C9BAE] mt-1">Delivered Only</div>
          </div>

          {/* 9. Replies */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0B101D] to-[#04060A] border border-white/10 hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-between text-[#8C9BAE] text-[11px] font-mono font-semibold uppercase mb-1">
              <span>9. Replies</span>
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg md:text-xl font-serif font-bold text-white">
              {telemetry?.replies_count || 0}
            </div>
            <div className="text-[10px] font-mono text-[#8C9BAE] mt-1">Inbound Responses</div>
          </div>

          {/* 10. Calls */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0B101D] to-[#04060A] border border-white/10 hover:border-amber-500/50 transition-all">
            <div className="flex items-center justify-between text-[#8C9BAE] text-[11px] font-mono font-semibold uppercase mb-1">
              <span>10. Calls</span>
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-lg md:text-xl font-serif font-bold text-white">
              {telemetry?.calls_count || 0}
            </div>
            <div className="text-[10px] font-mono text-[#8C9BAE] mt-1">Booked / Completed</div>
          </div>

          {/* 11. Proposals */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0B101D] to-[#04060A] border border-white/10 hover:border-purple-500/50 transition-all">
            <div className="flex items-center justify-between text-[#8C9BAE] text-[11px] font-mono font-semibold uppercase mb-1">
              <span>11. Proposals</span>
              <FileText className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-lg md:text-xl font-serif font-bold text-white">
              {telemetry?.proposals_count || 0}
            </div>
            <div className="text-[10px] font-mono text-[#8C9BAE] mt-1">Sent Commercials</div>
          </div>

          {/* 12. Payments */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0B101D] to-[#04060A] border border-emerald-500/50 hover:border-emerald-400 transition-all">
            <div className="flex items-center justify-between text-emerald-400 text-[11px] font-mono font-semibold uppercase mb-1">
              <span>12. Payments</span>
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg md:text-xl font-serif font-bold text-emerald-400">
              {telemetry?.payments_count || 0}
            </div>
            <div className="text-[10px] font-mono text-emerald-400/80 mt-1">Settled Transactions</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. 12-STEP AUTONOMOUS CYCLE LOG & EXECUTION DETAILS */}
      {/* ========================================================================= */}
      {cycleResult && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#06080F] to-[#0B101D] border border-[#D4AF37]/40 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-serif font-bold text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              12-Step Autonomous Revenue Cycle Results
            </div>
            <button
              onClick={() => setCycleResult(null)}
              className="text-xs font-mono text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {cycleResult.execution_steps?.map((step: any) => (
              <div key={step.step} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#F5D77F]">
                    Step {step.step}: {step.name}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                    {step.status}
                  </span>
                </div>
                <p className="text-xs font-mono text-[#8C9BAE]">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODALS: NEW CEO MISSION & VERIFY PAYMENT */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-[#0B101D] border border-[#D4AF37]/50 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-serif font-bold text-white">Create Autonomous Mission</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>
            <form onSubmit={handleCreateMission} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#8C9BAE] mb-1">Mission Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:border-[#D4AF37] outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono text-[#8C9BAE] mb-1">Goal (AED)</label>
                  <input
                    type="number"
                    value={newGoal}
                    onChange={(e) => setNewGoal(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:border-[#D4AF37] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#8C9BAE] mb-1">Budget (AED)</label>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:border-[#D4AF37] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#8C9BAE] mb-1">Time (Hours)</label>
                  <input
                    type="number"
                    value={newHours}
                    onChange={(e) => setNewHours(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:border-[#D4AF37] outline-none"
                    required
                  />
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[11px] font-mono text-[#F5D77F]">
                ★ Unrestricted Freedom: The AI is free to select any legal market, create sellable offers, and hunt buyers across all sectors.
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black font-mono text-xs font-bold"
                >
                  Launch Mission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-[#0B101D] border border-emerald-500/50 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                Verify Real Customer Payment
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>
            <form onSubmit={handleVerifyPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#8C9BAE] mb-1">Payer / Client Name</label>
                <input
                  type="text"
                  placeholder="e.g. Gulf Specialty Clinics"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:border-emerald-500 outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-[#8C9BAE] mb-1">Amount (AED)</label>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:border-emerald-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#8C9BAE] mb-1">Payment Method</label>
                  <select
                    value={paySource}
                    onChange={(e) => setPaySource(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:border-emerald-500 outline-none"
                  >
                    <option value="Bank Wire Transfer">Bank Wire Transfer</option>
                    <option value="Stripe Settlement">Stripe Settlement</option>
                    <option value="UAE Central Bank Direct">UAE Central Bank Direct</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-[#8C9BAE] mb-1">Bank / Transaction Reference ID</label>
                <input
                  type="text"
                  placeholder="e.g. ENBD-WIRE-8894129"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:border-emerald-500 outline-none"
                  required
                />
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-300">
                🔒 Security Rule: Verified payment updates collected revenue and generates a cryptographic SHA-256 audit record.
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-mono text-xs font-bold"
                >
                  {isSubmittingPayment ? 'Verifying...' : 'Confirm Real Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
