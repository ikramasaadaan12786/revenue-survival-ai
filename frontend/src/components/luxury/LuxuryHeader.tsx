'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, Sparkles, ChevronDown, ShieldCheck, Crown, AlertTriangle, ArrowRight } from 'lucide-react';
import { getApiBase } from '@/lib/api';

interface LuxuryHeaderProps {
  onSearch?: (query: string) => void;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  onProfileClick?: () => void;
  onNavigateTab?: (tabId: string) => void;
  activeSectionTitle?: string;
}

export const LuxuryHeader: React.FC<LuxuryHeaderProps> = ({
  onSearch,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onProfileClick,
  onNavigateTab,
  activeSectionTitle = 'Sovereign AI Command Center',
}) => {
  const [providerAudit, setProviderAudit] = useState<any | null>(null);

  useEffect(() => {
    fetch(`${getApiBase()}/closing-engine/provider-connection-details`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setProviderAudit(data))
      .catch(() => null);
  }, []);

  const isEmailConnected = providerAudit?.email?.connection_status === 'CONNECTED';
  const isWhatsAppConnected = providerAudit?.whatsapp?.connection_status === 'CONNECTED';
  const isLinkedInConnected = providerAudit?.linkedin?.connection_status === 'CONNECTED';
  const anyProviderConnected = isEmailConnected || isWhatsAppConnected || isLinkedInConnected;

  return (
    <header className="w-full border-b border-[#D4AF37]/20 bg-gradient-to-b from-[#06080F]/95 via-[#04060A]/90 to-transparent backdrop-blur-xl relative z-20">
      {/* Channel Readiness Status Strip */}
      <div className="w-full bg-[#050811]/95 border-b border-[#D4AF37]/15 px-6 py-1.5 flex flex-wrap items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-4">
          <span className="text-[#8C9BAE] uppercase tracking-wider font-semibold">Channels:</span>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isEmailConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span className={isEmailConnected ? 'text-emerald-300 font-bold' : 'text-slate-400'}>
              Email {isEmailConnected ? '(sales@altsofts.in - Connected)' : '(Offline)'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isWhatsAppConnected ? 'bg-emerald-400' : 'bg-slate-500'}`} />
            <span className={isWhatsAppConnected ? 'text-emerald-300 font-bold' : 'text-slate-400'}>
              WhatsApp {isWhatsAppConnected ? '(Connected)' : '(Standby)'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isLinkedInConnected ? 'bg-emerald-400' : 'bg-slate-500'}`} />
            <span className={isLinkedInConnected ? 'text-emerald-300 font-bold' : 'text-slate-400'}>
              LinkedIn {isLinkedInConnected ? '(Connected)' : '(Standby)'}
            </span>
          </div>
        </div>

        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('providers')}
            className="text-[#D4AF37] hover:underline flex items-center gap-1 text-[10.5px] font-semibold"
          >
            Provider Management <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="py-4 px-6 lg:px-8 flex items-center justify-between gap-6">
        {/* Left Search Bar & Section Indicator */}
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8C9BAE] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search across sovereign empire (missions, leads, revenue, deals)..."
              onChange={(e) => onSearch && onSearch(e.target.value)}
              className="w-full bg-[#080C16]/90 border border-[#D4AF37]/25 rounded-full pl-10 pr-4 py-2 text-xs text-[#F9F6EE] placeholder-[#64748B] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] transition-all duration-300"
            />
          </div>
        </div>

        {/* Right side quote, notifications & CEO profile */}
        <div className="flex items-center gap-4 lg:gap-6">
          {/* Dubai Vision Quote */}
          <div className="hidden xl:flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
            <span className="font-serif italic text-xs tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#FFF6E5] via-[#F5D77F] to-[#D4AF37]">
              &ldquo;From Dubai To The World&rdquo;
            </span>
          </div>

          {/* Human Safety Barrier Gate Badge */}
          <button
            onClick={onOpenNotifications}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B101D]/90 border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 text-xs font-semibold text-[#F9F6EE] transition-all shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
          >
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span className="hidden sm:inline text-[11px] text-[#8C9BAE]">Safety Queue</span>
            {unreadNotificationsCount > 0 ? (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                {unreadNotificationsCount}
              </span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>

          {/* CEO Profile Jewel */}
          <div
            onClick={onProfileClick}
            className="flex items-center gap-2.5 pl-2.5 pr-4 py-1 rounded-full bg-[#0B101D]/95 border border-[#D4AF37]/35 hover:border-[#D4AF37]/70 cursor-pointer transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.6)] group select-none"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#FFF6E5] to-[#AA771C] p-[1.5px] shadow-[0_0_10px_rgba(212,175,55,0.4)]">
                <div className="w-full h-full rounded-full bg-[#04060A] flex items-center justify-center overflow-hidden">
                  <span className="text-xs font-bold text-[#F5D77F] font-serif">IK</span>
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#04060A] shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            </div>

            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-[#F9F6EE] tracking-wide font-serif">Ikrama</span>
                <ChevronDown className="w-3 h-3 text-[#8C9BAE] group-hover:text-[#D4AF37] transition-colors" />
              </div>
              <p className="text-[9.5px] text-[#D4AF37] font-semibold tracking-wider uppercase">Executive CEO</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
