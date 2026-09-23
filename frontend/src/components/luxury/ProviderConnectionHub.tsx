'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  MessageSquare,
  Mail,
  Share2,
  CheckCircle2,
  Clock,
  Send,
  Zap,
  RefreshCw,
  Lock,
  Layers,
  Activity,
  Server,
  AlertTriangle
} from 'lucide-react';
import { getApiBase } from '@/lib/api';

export const ProviderConnectionHub: React.FC = () => {
  const [providerDetails, setProviderDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeProvider, setActiveProvider] = useState<string>('whatsapp');
  const [dispatchForm, setDispatchForm] = useState({
    recipient: '+971 50 892 4110',
    subject: 'AI Enterprise Automation — 48h Sprint Delivery',
    body: 'Salam, we deploy sovereign AI agent infrastructures for Dubai enterprises with 48h handover. Would you be open to a 10-minute briefing?'
  });
  const [dispatching, setDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<any | null>(null);

  const loadProviderStatuses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/closing-engine/provider-connection-details`);
      if (res.ok) {
        const json = await res.json();
        setProviderDetails(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviderStatuses();
  }, []);

  const handleTestDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setDispatching(true);
    setDispatchResult(null);
    try {
      const res = await fetch(`${getApiBase()}/closing-engine/outbound/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comm_id: 1,
          channel: activeProvider === 'whatsapp' ? 'WhatsApp' : activeProvider === 'email' ? 'Email' : 'LinkedIn',
          recipient: dispatchForm.recipient,
          subject: dispatchForm.subject,
          body: dispatchForm.body
        })
      });
      if (res.ok) {
        const data = await res.json();
        setDispatchResult(data);
        loadProviderStatuses();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDispatching(false);
    }
  };

  const providers = providerDetails
    ? [
        {
          key: 'whatsapp',
          name: providerDetails.whatsapp?.provider_name || 'WhatsApp Business Cloud API',
          status: providerDetails.whatsapp?.connection_status || 'NOT CONNECTED',
          tokenPresent: providerDetails.whatsapp?.token_present,
          phoneId: providerDetails.whatsapp?.phone_number_id,
          webhook: providerDetails.whatsapp?.webhook_status,
          action: providerDetails.whatsapp?.action_required,
          icon: MessageSquare,
          accent: 'emerald'
        },
        {
          key: 'email',
          name: providerDetails.email?.provider_name || 'Resend Enterprise Email API',
          status: providerDetails.email?.connection_status || 'NOT CONNECTED',
          tokenPresent: providerDetails.email?.token_present,
          domain: providerDetails.email?.sending_domain,
          action: providerDetails.email?.action_required,
          icon: Mail,
          accent: 'amber'
        },
        {
          key: 'linkedin',
          name: providerDetails.linkedin?.provider_name || 'LinkedIn Sales Navigator API',
          status: providerDetails.linkedin?.connection_status || 'NOT CONNECTED',
          oauthActive: providerDetails.linkedin?.oauth_session_active,
          action: providerDetails.linkedin?.action_required,
          icon: Share2,
          accent: 'cyan'
        }
      ]
    : [];

  return (
    <div className="space-y-8 w-full max-w-[1640px] mx-auto pb-12">
      {/* 1. Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#0C1222] via-[#080D18] to-[#04060A] border-2 border-[#D4AF37]/50 shadow-[0_0_40px_rgba(212,175,55,0.25)] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/60 text-emerald-400 text-xs font-mono font-black tracking-widest uppercase flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                FINAL ACTIVATION MODE
              </span>
              <span className="px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F5D77F] text-xs font-mono font-bold">
                AUDITED PROVIDER CONNECTIONS
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F5D77F] to-[#D4AF37]">
              Communication Provider Setup & Dispatch Hub
            </h1>
            <p className="text-xs text-slate-300 font-sans max-w-3xl leading-relaxed">
              Exact runtime verification for WhatsApp Business Cloud API, Resend Email API, and LinkedIn Executive Workflows. Strictly displays CONNECTED or NOT CONNECTED without simulated badges.
            </p>
          </div>

          <button
            onClick={loadProviderStatuses}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-[#080D18] border border-[#D4AF37]/40 text-[#F5D77F] font-mono text-xs font-bold hover:bg-[#D4AF37]/10 transition-all flex items-center gap-2 self-start lg:self-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Audit Connections
          </button>
        </div>
      </div>

      {/* 2. Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {providers.map((prov) => {
          const Icon = prov.icon;
          const isConnected = prov.status === 'CONNECTED';

          return (
            <div
              key={prov.key}
              onClick={() => setActiveProvider(prov.key)}
              className={`p-6 rounded-3xl border-2 transition-all cursor-pointer space-y-4 ${
                activeProvider === prov.key
                  ? 'bg-gradient-to-br from-[#D4AF37]/15 via-[#0B101D] to-[#04060A] border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.2)]'
                  : 'bg-[#080D18]/80 border-white/10 hover:border-[#D4AF37]/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-[#F5D77F]">
                  <Icon className="w-6 h-6" />
                </div>

                <div
                  className={`flex items-center gap-1.5 font-mono text-xs font-bold px-2.5 py-1 rounded-full border ${
                    isConnected
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                      : 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}
                  />
                  {prov.status}
                </div>
              </div>

              <div>
                <h3 className="text-base font-serif font-bold text-white">{prov.name}</h3>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  Runtime Protocol: <span className="text-white font-bold">{isConnected ? 'LIVE_DISPATCH' : 'CONFIG_REQUIRED'}</span>
                </div>
              </div>

              {prov.action && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 font-mono text-[10.5px] text-amber-300">
                  {prov.action}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. Outbound Dispatch & Test Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left (7 Cols): Outbound Dispatch Form */}
        <div className="lg:col-span-7 rounded-3xl bg-[#080D18]/90 border border-[#D4AF37]/40 p-6 md:p-8 space-y-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="text-lg font-serif font-bold text-white">
                Live Outbound Dispatch Console
              </h3>
            </div>
            <span className="text-xs font-mono text-[#F5D77F] bg-[#D4AF37]/10 px-3 py-1 rounded-full border border-[#D4AF37]/30">
              Active: {activeProvider.toUpperCase()}
            </span>
          </div>

          <form onSubmit={handleTestDispatch} className="space-y-4 text-xs font-mono">
            <div>
              <label className="text-slate-300 block mb-1">Recipient Destination</label>
              <input
                type="text"
                value={dispatchForm.recipient}
                onChange={(e) => setDispatchForm({ ...dispatchForm, recipient: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#04060A] border border-[#D4AF37]/30 text-white focus:outline-none focus:border-[#D4AF37]"
                required
              />
            </div>

            {activeProvider === 'email' && (
              <div>
                <label className="text-slate-300 block mb-1">Email Subject Line</label>
                <input
                  type="text"
                  value={dispatchForm.subject}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, subject: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#04060A] border border-[#D4AF37]/30 text-white focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-slate-300 block mb-1">Message Content</label>
              <textarea
                rows={4}
                value={dispatchForm.body}
                onChange={(e) => setDispatchForm({ ...dispatchForm, body: e.target.value })}
                className="w-full p-3 rounded-xl bg-[#04060A] border border-[#D4AF37]/30 text-white font-sans focus:outline-none focus:border-[#D4AF37]"
                required
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={dispatching}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black font-mono font-bold shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:brightness-110 transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {dispatching ? 'Transmitting...' : 'Dispatch Live Message'}
              </button>
            </div>
          </form>

          {dispatchResult && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Message Dispatched via {dispatchResult.provider}
              </div>
              <div>Recipient: <strong className="text-white">{dispatchResult.recipient}</strong></div>
              <div>Official Message ID: <strong className="text-[#F5D77F]">{dispatchResult.message_id}</strong></div>
              <div>Status: <span className="text-emerald-400 font-bold">{dispatchResult.delivery_status}</span></div>
            </div>
          )}
        </div>

        {/* Right (5 Cols): Persistent Background Worker Status */}
        <div className="lg:col-span-5 rounded-3xl bg-[#080D18]/90 border border-white/10 p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Server className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-serif font-bold text-white">
              Persistent Background Worker
            </h3>
          </div>

          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            The Revenue Survival AI background worker daemon runs independently from your laptop. It continuously monitors buyer intent, executes hourly scans, checks delivery tokens, and processes inbound reply webhooks.
          </p>

          <div className="p-4 rounded-2xl bg-[#04060A] border border-white/10 space-y-2 text-xs font-mono">
            <div className="text-[#F5D77F] font-bold">Production Daemon Commands:</div>
            <div className="text-slate-400 text-[11px] space-y-1">
              <div>1. <code className="text-white">docker build -f Dockerfile.worker -t worker .</code></div>
              <div>2. <code className="text-white">docker run -d --restart always worker</code></div>
              <div>3. <code className="text-white">python worker.py</code></div>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Hourly Buyer Hunt (00 min)</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>15-Minute Follow-up Check</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Daily CEO Report (08:00 AM GST)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
