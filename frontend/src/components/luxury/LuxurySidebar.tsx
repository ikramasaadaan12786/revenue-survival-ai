'use client';

import React from 'react';
import {
  LayoutDashboard,
  BrainCircuit,
  Building2,
  Rocket,
  Users2,
  Target,
  UserCheck,
  TrendingUp,
  Radar,
  FileBarChart2,
  Settings,
  ShieldCheck,
  Sparkles,
  Flame,
  MessageSquare,
  FileText,
} from 'lucide-react';

interface LuxurySidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingApprovalsCount?: number;
}

export const LuxurySidebar: React.FC<LuxurySidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingApprovalsCount = 0,
}) => {
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'war_room', label: 'War Room', icon: Flame, badge: 'v15' },
    { id: 'revenue_proof', label: 'Revenue Proof', icon: ShieldCheck, badge: 'P16' },
    { id: 'hot_buyers', label: 'Hot Buyers', icon: UserCheck },
    { id: 'comms_center', label: 'Comms Center', icon: MessageSquare, alertCount: pendingApprovalsCount },
    { id: 'proposal_desk', label: 'Proposal Desk', icon: FileText },
    { id: 'deal_room', label: 'Deal Room CRM', icon: TrendingUp },
    { id: 'ceo_brain', label: 'CEO Brain', icon: BrainCircuit, badge: 'v4' },
    { id: 'revenue_empire', label: 'Revenue Empire', icon: Building2, badge: 'v7' },
    { id: 'scaling_engine', label: 'Scaling Engine', icon: Rocket, badge: 'v8' },
    { id: 'enterprise_network', label: 'AI Employees', icon: Users2, badge: 'v9' },
    { id: 'missions', label: 'Missions', icon: Target },
    { id: 'crm', label: 'Clients', icon: UserCheck },
    { id: 'growth_loop', label: 'Investor Hub', icon: TrendingUp },
    { id: 'market_radar', label: 'Market Intelligence', icon: Radar },
    { id: 'analytics', label: 'Reports', icon: FileBarChart2 },
    { id: 'approvals', label: 'Approvals', icon: ShieldCheck, alertCount: pendingApprovalsCount },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];


  return (
    <aside className="w-72 flex-shrink-0 min-h-screen bg-gradient-to-b from-[#06080F]/95 via-[#04060A]/98 to-[#020306] backdrop-blur-2xl border-r border-[#D4AF37]/25 flex flex-col justify-between select-none relative z-30 shadow-[4px_0_30px_rgba(0,0,0,0.8)]">
      {/* Top Brand Logo Section */}
      <div>
        <div className="p-6 pb-5 border-b border-[#D4AF37]/20 flex flex-col items-center text-center relative overflow-hidden">
          {/* Subtle gold halo glow behind crown */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-36 h-36 bg-[#D4AF37]/15 rounded-full blur-2xl pointer-events-none" />

          {/* Golden Crown Jewel Box */}
          <div className="w-13 h-13 p-2.5 rounded-2xl bg-gradient-to-br from-[#F5D77F]/30 via-[#D4AF37]/15 to-[#080C16] border border-[#D4AF37]/50 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-105 transition-transform duration-300 group cursor-pointer">
            <span className="text-2xl drop-shadow-[0_2px_10px_rgba(212,175,55,0.8)]">👑</span>
          </div>

          <h1 className="font-serif text-lg tracking-[0.22em] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF6E5] via-[#F5D77F] to-[#D4AF37] uppercase drop-shadow-sm">
            Revenue
          </h1>
          <h2 className="font-serif text-sm tracking-[0.3em] font-semibold text-[#C5A059] uppercase -mt-0.5">
            Survival AI
          </h2>

          <div className="mt-3 text-[8.5px] tracking-[0.24em] text-[#8C9BAE] uppercase font-bold flex items-center justify-center gap-1.5 opacity-90">
            <span>BUILD</span>
            <span className="text-[#D4AF37] text-[7px]">•</span>
            <span>AUTOMATE</span>
            <span className="text-[#D4AF37] text-[7px]">•</span>
            <span>SCALE</span>
            <span className="text-[#D4AF37] text-[7px]">•</span>
            <span>DOMINATE</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 mt-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-[#D4AF37]/25 via-[#D4AF37]/10 to-transparent text-[#F9F6EE] border-l-2 border-[#D4AF37] shadow-[0_4px_20px_rgba(212,175,55,0.18)] font-semibold'
                    : 'text-[#8C9BAE] hover:text-[#F9F6EE] hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'text-[#8C9BAE] group-hover:text-[#D4AF37]'}`}>
                    <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <span className="tracking-wide">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 tracking-wider">
                      {item.badge}
                    </span>
                  )}
                  {item.alertCount !== undefined && item.alertCount > 0 && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                      {item.alertCount}
                    </span>
                  )}
                </div>

                {/* Subtle active right glow bar */}
                {isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-[#D4AF37] rounded-l blur-[1px] shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Dubai Global Hub Card */}
      <div className="p-4 pt-2">
        <div className="relative rounded-2xl overflow-hidden border border-[#D4AF37]/35 bg-gradient-to-b from-[#0B101D] to-[#04060A] p-3.5 text-center shadow-[0_8px_30px_rgba(0,0,0,0.7)] group">
          {/* Background image overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity group-hover:opacity-40 transition-opacity duration-500"
            style={{ backgroundImage: "url('/images/dubai_sidebar_skyline.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#04060A] via-transparent to-transparent opacity-85" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-[#D4AF37] text-[10.5px] font-bold tracking-widest uppercase">
              <span>🏙️</span>
              <span>DUBAI</span>
            </div>
            <p className="text-[9px] text-[#A0AEC0] tracking-wider uppercase mt-0.5 font-medium">
              Global Headquarters
            </p>
            <p className="font-serif italic text-[11px] text-[#F9F6EE] mt-1.5 tracking-wide">
              &ldquo;Bigger Vision, Sovereign Results&rdquo;
            </p>
            <div className="mt-2.5 w-full pt-1.5 border-t border-[#D4AF37]/20 flex items-center justify-between text-[8.5px] text-[#8C9BAE]">
              <span className="font-mono text-[#D4AF37]">v2.0 Enterprise</span>
              <span>© 2026 Revenue Survival</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
