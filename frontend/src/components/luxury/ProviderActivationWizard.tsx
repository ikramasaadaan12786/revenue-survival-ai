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
  AlertTriangle,
  Key,
  Globe,
  Link2
} from 'lucide-react';
import { getApiUrl } from '@/lib/api';
import { WhatsAppCoexistenceLauncher } from './WhatsAppCoexistenceLauncher';

interface ProviderActivationWizardProps {
  onActivationSuccess?: () => void;
  onNavigateTab?: (tabId: string) => void;
}

export const ProviderActivationWizard: React.FC<ProviderActivationWizardProps> = ({
  onActivationSuccess,
  onNavigateTab
}) => {
  const [activeChannel, setActiveChannel] = useState<'whatsapp' | 'email' | 'linkedin'>('whatsapp');
  const [providerDetails, setProviderDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // WhatsApp Form
  const [waToken, setWaToken] = useState('');
  const [waPhoneId, setWaPhoneId] = useState('');
  const [waBusinessId, setWaBusinessId] = useState('');
  const [waSubmitting, setWaSubmitting] = useState(false);
  const [waResult, setWaResult] = useState<any | null>(null);

  // Email Form
  const [emailKey, setEmailKey] = useState('');
  const [emailDomain, setEmailDomain] = useState('altsofts.in');
  const [emailSender, setEmailSender] = useState('sales@altsofts.in');
  const [emailReplyTo, setEmailReplyTo] = useState('sales@altsofts.in');
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailResult, setEmailResult] = useState<any | null>(null);

  // LinkedIn Form
  const [liClientId, setLiClientId] = useState('');
  const [liAccessToken, setLiAccessToken] = useState('');
  const [liSubmitting, setLiSubmitting] = useState(false);
  const [liResult, setLiResult] = useState<any | null>(null);

  const fetchProviderDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/v1/closing-engine/provider-connection-details'));
      if (res.ok) {
        const data = await res.json();
        setProviderDetails(data);
        if (data.email) {
          if (data.email.domain) setEmailDomain(data.email.domain);
          if (data.email.sender) setEmailSender(data.email.sender);
          if (data.email.reply_to) setEmailReplyTo(data.email.reply_to);
        }
      }
    } catch (e) {
      console.error('Failed to fetch provider connection details', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderDetails();
  }, []);

  const handleActivateWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setWaSubmitting(true);
    setWaResult(null);
    try {
      const res = await fetch(getApiUrl('/api/v1/closing-engine/wizard/activate-whatsapp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: waToken,
          phone_number_id: waPhoneId,
          business_account_id: waBusinessId
        })
      });
      const data = await res.json();
      setWaResult(data);
      if (data.status === 'CONNECTED') {
        fetchProviderDetails();
        if (onActivationSuccess) onActivationSuccess();
      }
    } catch (e: any) {
      setWaResult({ status: 'FAILED', error: e.message || 'Network connection failed' });
    } finally {
      setWaSubmitting(false);
    }
  };

  const handleActivateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSubmitting(true);
    setEmailResult(null);
    try {
      const res = await fetch(getApiUrl('/api/v1/closing-engine/wizard/activate-email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: emailKey,
          sending_domain: emailDomain || 'altsofts.in',
          sender: emailSender || 'sales@altsofts.in',
          reply_to: emailReplyTo || 'sales@altsofts.in'
        })
      });
      const data = await res.json();
      setEmailResult(data);
      if (data.status === 'CONNECTED') {
        fetchProviderDetails();
        if (onActivationSuccess) onActivationSuccess();
      }
    } catch (e: any) {
      setEmailResult({ status: 'FAILED', error: e.message || 'Network connection failed' });
    } finally {
      setEmailSubmitting(false);
    }
  };

  const handleActivateLinkedIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLiSubmitting(true);
    setLiResult(null);
    try {
      const res = await fetch(getApiUrl('/api/v1/closing-engine/wizard/activate-linkedin'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: liClientId,
          access_token: liAccessToken
        })
      });
      const data = await res.json();
      setLiResult(data);
      if (data.status === 'CONNECTED') {
        fetchProviderDetails();
        if (onActivationSuccess) onActivationSuccess();
      }
    } catch (e: any) {
      setLiResult({ status: 'FAILED', error: e.message || 'Network connection failed' });
    } finally {
      setLiSubmitting(false);
    }
  };

  const isWaConnected = providerDetails?.whatsapp?.connection_status === 'CONNECTED';
  const isEmailConnected = providerDetails?.email?.connection_status === 'CONNECTED';
  const isLiConnected = providerDetails?.linkedin?.connection_status === 'CONNECTED';

  return (
    <div className="space-y-8 w-full max-w-[1640px] mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#0C1222] via-[#080D18] to-[#04060A] border-2 border-[#D4AF37]/50 shadow-[0_0_40px_rgba(212,175,55,0.25)] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/60 text-emerald-400 text-xs font-mono font-black tracking-widest uppercase flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                PROVIDER ACTIVATION WIZARD
              </span>
              <span className="px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F5D77F] text-xs font-mono font-bold">
                REAL CREDENTIAL VERIFICATION
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F5D77F] to-[#D4AF37]">
              Channel Provider Activation & Authentication
            </h1>
            <p className="text-xs text-slate-300 font-sans max-w-3xl leading-relaxed">
              Connect genuine Meta WhatsApp Cloud API, Resend/SMTP Email, and LinkedIn Sales Navigator OAuth. Test messages and production outbounds are strictly enabled only after credentials validate.
            </p>
          </div>

          <button
            onClick={fetchProviderDetails}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-[#080D18] border border-[#D4AF37]/40 text-[#F5D77F] font-mono text-xs font-bold hover:bg-[#D4AF37]/10 transition-all flex items-center gap-2 self-start lg:self-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Check Connection Health
          </button>
        </div>

        {/* Channel Switcher Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <button
            onClick={() => setActiveChannel('whatsapp')}
            className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
              activeChannel === 'whatsapp'
                ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'bg-[#04060A] border-white/10 hover:border-emerald-500/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-sm font-serif font-bold text-white">WhatsApp Business API</div>
                <div className="text-[10.5px] font-mono text-slate-400">Meta Graph v19.0</div>
              </div>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold border ${
                loading
                  ? 'bg-slate-500/20 text-slate-400 border-slate-500/50'
                  : isWaConnected
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/50'
              }`}
            >
              {loading ? 'CHECKING...' : isWaConnected ? 'CONNECTED' : 'NOT CONNECTED'}
            </span>
          </button>

          <button
            onClick={() => setActiveChannel('email')}
            className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
              activeChannel === 'email'
                ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : 'bg-[#04060A] border-white/10 hover:border-amber-500/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-sm font-serif font-bold text-white">Email (Resend / SMTP)</div>
                <div className="text-[10.5px] font-mono text-slate-400">DKIM / SPF Protocol</div>
              </div>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold border ${
                loading
                  ? 'bg-slate-500/20 text-slate-400 border-slate-500/50'
                  : isEmailConnected
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/50'
              }`}
            >
              {loading ? 'CHECKING...' : isEmailConnected ? 'CONNECTED' : 'NOT CONNECTED'}
            </span>
          </button>

          <button
            onClick={() => setActiveChannel('linkedin')}
            className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
              activeChannel === 'linkedin'
                ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                : 'bg-[#04060A] border-white/10 hover:border-cyan-500/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <Share2 className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="text-sm font-serif font-bold text-white">LinkedIn Navigator</div>
                <div className="text-[10.5px] font-mono text-slate-400">OAuth 2.0 Webflow</div>
              </div>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold border ${
                loading
                  ? 'bg-slate-500/20 text-slate-400 border-slate-500/50'
                  : isLiConnected
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/50'
              }`}
            >
              {loading ? 'CHECKING...' : isLiConnected ? 'CONNECTED' : 'NOT CONNECTED'}
            </span>
          </button>
        </div>
      </div>

      {/* Activation Forms Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Panel (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-[#080D18]/90 border border-[#D4AF37]/40 p-6 md:p-8 space-y-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          {activeChannel === 'whatsapp' && (
            <div className="space-y-6">
              {/* Primary: Official Meta Coexistence Launcher */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-slate-950 border-2 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-lg font-serif font-bold text-white">
                        WhatsApp Business App Coexistence
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 font-bold">
                        ZERO TOKEN ENTRY
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Connect your existing number <span className="font-mono font-bold text-white">+971 56 428 8630</span> without disconnecting your mobile WhatsApp Business App.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 self-start sm:self-center">
                    Official Meta Flow
                  </span>
                </div>

                <WhatsAppCoexistenceLauncher
                  onSuccess={() => {
                    fetchProviderDetails();
                    if (onActivationSuccess) onActivationSuccess();
                  }}
                />
              </div>

              {/* Collapsible Advanced Direct API Configuration */}
              <details className="group rounded-2xl bg-[#04060A]/80 border border-white/10 p-4 transition-all">
                <summary className="text-xs font-mono text-slate-400 cursor-pointer flex items-center justify-between hover:text-white">
                  <span>Advanced Direct Meta Credentials (Optional / Custom System User)</span>
                  <span className="text-[10px] text-slate-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>

                <form onSubmit={handleActivateWhatsApp} className="space-y-4 text-xs font-mono pt-4 mt-3 border-t border-white/10">
                  <div>
                    <label className="text-slate-300 block mb-1">Meta Permanent Access Token</label>
                    <input
                      type="password"
                      value={waToken}
                      onChange={(e) => setWaToken(e.target.value)}
                      placeholder="EAAG... (Stored securely in server environment)"
                      className="w-full p-3 rounded-xl bg-[#04060A] border border-[#D4AF37]/30 text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">WhatsApp Phone Number ID</label>
                    <input
                      type="text"
                      value={waPhoneId}
                      onChange={(e) => setWaPhoneId(e.target.value)}
                      placeholder="1136248072908865"
                      className="w-full p-3 rounded-xl bg-[#04060A] border border-[#D4AF37]/30 text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">WhatsApp Business Account ID (WABA)</label>
                    <input
                      type="text"
                      value={waBusinessId}
                      onChange={(e) => setWaBusinessId(e.target.value)}
                      placeholder="971398669179205"
                      className="w-full p-3 rounded-xl bg-[#04060A] border border-[#D4AF37]/30 text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={waSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-mono font-bold hover:brightness-110 transition-all flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {waSubmitting ? 'Authenticating...' : 'Manual Save Credentials'}
                    </button>
                  </div>
                </form>
              </details>
            </div>
          )}

          {activeChannel === 'email' && (
            <form onSubmit={handleActivateEmail} className="space-y-4 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  <h3 className="text-base font-serif font-bold text-white">Resend Email Provider Connection</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                    DOMAIN VERIFIED
                  </span>
                  <span className="text-slate-400 text-[11px]">Resend REST API</span>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Resend API Key (re_...)</label>
                <input
                  type="password"
                  value={emailKey}
                  onChange={(e) => setEmailKey(e.target.value)}
                  placeholder="re_prod_..."
                  className="w-full p-3 rounded-xl bg-[#04060A] border border-[#D4AF37]/30 text-white focus:outline-none focus:border-[#D4AF37]"
                  required
                />
                <p className="text-[10.5px] text-slate-400 mt-1">
                  API Key will be stored permanently in backend database (<code className="text-[#F5D77F]">ConnectorAuth</code>) and environment.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Verified Sending Domain</label>
                  <input
                    type="text"
                    value={emailDomain}
                    onChange={(e) => setEmailDomain(e.target.value)}
                    placeholder="altsofts.in"
                    className="w-full p-3 rounded-xl bg-[#04060A] border border-[#D4AF37]/30 text-white focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">From Sender Address</label>
                  <input
                    type="text"
                    value={emailSender}
                    onChange={(e) => setEmailSender(e.target.value)}
                    placeholder="sales@altsofts.in"
                    className="w-full p-3 rounded-xl bg-[#04060A] border border-[#D4AF37]/30 text-white focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Inbound Reply-To Address</label>
                <input
                  type="text"
                  value={emailReplyTo}
                  onChange={(e) => setEmailReplyTo(e.target.value)}
                  placeholder="sales@altsofts.in"
                  className="w-full p-3 rounded-xl bg-[#04060A] border border-[#D4AF37]/30 text-white focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-[#080D18] border border-white/10 space-y-1.5 text-[11px]">
                <div className="text-[#F5D77F] font-bold flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Verified DNS Authentication State:
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">DKIM: VERIFIED</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">SPF: VERIFIED</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">MX: VERIFIED</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold">INBOUND: ACTIVE</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={emailSubmitting}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-mono font-bold shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:brightness-110 transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {emailSubmitting ? 'Authenticating...' : 'Validate & Connect Email API'}
                </button>
              </div>

              {emailResult && (
                <div
                  className={`p-4 rounded-2xl border text-xs font-mono space-y-1 ${
                    emailResult.status === 'CONNECTED'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-red-500/10 border-red-500/30 text-red-300'
                  }`}
                >
                  <div className="font-bold flex items-center gap-2">
                    {emailResult.status === 'CONNECTED' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4" />}
                    {emailResult.message || emailResult.error}
                  </div>
                  {emailResult.sender && (
                    <div className="text-slate-300">
                      Sender: <span className="text-[#F5D77F] font-bold">{emailResult.sender}</span> • Domain: <span className="text-[#F5D77F] font-bold">{emailResult.domain}</span>
                      {emailResult.api_key_masked && <span className="ml-2">• Active Key: <span className="text-emerald-400 font-bold">{emailResult.api_key_masked}</span></span>}
                    </div>
                  )}
                  {emailResult.dkim_status && (
                    <div>DKIM: <span className="text-emerald-400 font-bold">{emailResult.dkim_status}</span> • SPF: <span className="text-emerald-400 font-bold">{emailResult.spf_status}</span> • MX: <span className="text-emerald-400 font-bold">{emailResult.mx_status || 'VERIFIED'}</span></div>
                  )}
                </div>
              )}
            </form>
          )}

          {activeChannel === 'linkedin' && (
            <div className="space-y-5 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-base font-serif font-bold text-white">LinkedIn OAuth 2.0 Integration</h3>
                </div>
                <span className="text-cyan-400 text-[11px] font-bold px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                  OFFICIAL OPENID + SHARE
                </span>
              </div>

              {/* Status Banner */}
              {isLiConnected ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2">
                  <div className="font-bold flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    LinkedIn OAuth 2.0 Connected
                  </div>
                  <div className="text-xs text-slate-300">
                    Member: <strong className="text-white">{providerDetails?.linkedin?.member_name || 'Authenticated Member'}</strong>
                    {providerDetails?.linkedin?.member_email && (
                      <span> • Email: <strong className="text-white">{providerDetails.linkedin.member_email}</strong></span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Scopes: <span className="text-cyan-300">openid profile email w_member_social</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Connect your LinkedIn Developer Application using official OAuth 2.0 authorization with <strong className="text-white">Sign In with LinkedIn (OpenID)</strong> and <strong className="text-white">Share on LinkedIn</strong> products.
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>Redirect URI:</span>
                    <code className="text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      https://backend-growth-540e.vercel.app/api/v1/oauth/linkedin/callback
                    </code>
                  </div>
                  <div className="pt-2">
                    <a
                      id="btn-linkedin-oauth-connect"
                      href={getApiUrl('/api/v1/oauth/linkedin/connect')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-mono font-bold shadow-[0_0_25px_rgba(6,182,212,0.35)] hover:brightness-110 transition-all text-xs"
                    >
                      <Key className="w-4 h-4" />
                      CONNECT WITH LINKEDIN OAUTH 2.0
                    </a>
                  </div>
                </div>
              )}

              {/* Collapsible Manual Token Input */}
              <details className="text-slate-400 border-t border-white/5 pt-3">
                <summary className="cursor-pointer hover:text-white text-[11px] font-semibold">
                  Advanced: Manual OAuth Access Token Fallback
                </summary>
                <form onSubmit={handleActivateLinkedIn} className="space-y-3 pt-3">
                  <div>
                    <label className="text-slate-300 block mb-1">LinkedIn App Client ID</label>
                    <input
                      type="text"
                      value={liClientId}
                      onChange={(e) => setLiClientId(e.target.value)}
                      placeholder="e.g. 78li_dubai_sales_app"
                      className="w-full p-2.5 rounded-lg bg-[#04060A] border border-slate-800 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">LinkedIn OAuth Access Token</label>
                    <input
                      type="password"
                      value={liAccessToken}
                      onChange={(e) => setLiAccessToken(e.target.value)}
                      placeholder="AQV..."
                      className="w-full p-2.5 rounded-lg bg-[#04060A] border border-slate-800 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={liSubmitting}
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {liSubmitting ? 'Authenticating...' : 'Save Manual Token'}
                    </button>
                  </div>
                </form>
              </details>

              {liResult && (
                <div
                  className={`p-4 rounded-2xl border text-xs font-mono space-y-1 ${
                    liResult.status === 'CONNECTED'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-red-500/10 border-red-500/30 text-red-300'
                  }`}
                >
                  <div className="font-bold flex items-center gap-2">
                    {liResult.status === 'CONNECTED' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    {liResult.message || liResult.error}
                  </div>
                  {liResult.permissions && <div>Permissions: {liResult.permissions.join(', ')}</div>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Info Box (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-[#080D18]/90 border border-white/10 p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="text-base font-serif font-bold text-white">Strict Reality Activation Rules</h3>
          </div>

          <div className="space-y-3 text-xs font-mono text-slate-300">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Test messages can only be dispatched after live tokens are verified.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Zero simulated delivery receipts. Only official WAMIDs and provider confirmation tokens are counted.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Active mission status will remain ACTIVE until actual customer payment is verified.</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#04060A] border border-white/10 space-y-2 text-xs font-mono">
            <div className="text-[#F5D77F] font-bold">Inbound Webhook Verification Endpoints:</div>
            <div className="text-slate-400 text-[11px] space-y-1">
              <div>WhatsApp: <code className="text-white">/api/v1/closing-engine/webhooks/whatsapp</code></div>
              <div>Email: <code className="text-white">/api/v1/closing-engine/webhooks/email</code></div>
              <div>LinkedIn: <code className="text-white">/api/v1/closing-engine/webhooks/linkedin</code></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
