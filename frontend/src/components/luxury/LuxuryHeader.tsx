'use client';

import React from 'react';
import { Search, Bell, Sparkles, ChevronDown } from 'lucide-react';

interface LuxuryHeaderProps {
  onSearch?: (query: string) => void;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  onProfileClick?: () => void;
}

export const LuxuryHeader: React.FC<LuxuryHeaderProps> = ({
  onSearch,
  unreadNotificationsCount = 3,
  onOpenNotifications,
  onProfileClick,
}) => {
  return (
    <header className="w-full pt-6 pb-4 px-8 border-b border-[#D4AF37]/15 bg-gradient-to-b from-[#06080F]/90 via-[#06080F]/60 to-transparent backdrop-blur-md relative z-20">
      {/* Top Utility Bar: Search, Quote, Notifications, Profile */}
      <div className="flex items-center justify-between gap-6 mb-5">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8C9BAE] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search anything across empire..."
            onChange={(e) => onSearch && onSearch(e.target.value)}
            className="w-full bg-[#0B101D]/70 border border-[#D4AF37]/20 rounded-full pl-10 pr-4 py-1.5 text-xs text-[#F9F6EE] placeholder-[#64748B] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/40 transition-all duration-300"
          />
        </div>

        {/* Right side quote & controls */}
        <div className="flex items-center gap-6">
          {/* Dubai Vision Quote */}
          <div className="hidden lg:block text-right">
            <span className="font-serif italic text-xs tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#C5A059]">
              &ldquo;From Dubai To The World&rdquo;
            </span>
          </div>

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-full bg-[#0B101D]/80 border border-[#D4AF37]/25 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all duration-300"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
            )}
          </button>

          {/* CEO Profile Card */}
          <div
            onClick={onProfileClick}
            className="flex items-center gap-3 pl-3 pr-4 py-1.5 rounded-full bg-[#0B101D]/90 border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 cursor-pointer transition-all duration-300 shadow-[0_2px_15px_rgba(0,0,0,0.5)] group"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#F3E5AB] to-[#996515] p-[1.5px]">
                <div className="w-full h-full rounded-full bg-[#06080F] flex items-center justify-center overflow-hidden">
                  <span className="text-xs font-bold text-[#D4AF37]">IK</span>
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#06080F]" />
            </div>

            <div className="text-left">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-[#F9F6EE] tracking-wide">Ikrama</span>
                <ChevronDown className="w-3 h-3 text-[#8C9BAE] group-hover:text-[#D4AF37] transition-colors" />
              </div>
              <p className="text-[10px] text-[#C5A059] font-medium tracking-wider">CEO & Founder</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Headline Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xs font-semibold text-[#8C9BAE] uppercase tracking-[0.2em] flex items-center gap-1.5">
              <span>Good Morning, Ikrama</span>
              <span className="text-sm">👑</span>
            </h3>
          </div>

          <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] via-[#F3E5AB] to-[#D4AF37] drop-shadow-sm leading-tight">
            Your AI Business Empire
            <br />
            Is Operating Beautifully.
          </h1>

          <p className="mt-2 text-xs md:text-sm text-[#94A3B8] flex items-center flex-wrap gap-2 tracking-wide font-light">
            <span className="text-[#D4AF37] font-medium">7 Departments</span>
            <span className="text-[#475569]">•</span>
            <span className="text-[#F9F6EE]">42 AI Agents</span>
            <span className="text-[#475569]">•</span>
            <span className="text-[#38BDF8]">Global Opportunities</span>
            <span className="text-[#475569]">•</span>
            <span className="text-[#A7F3D0]">Infinite Possibilities</span>
          </p>
        </div>
      </div>
    </header>
  );
};
