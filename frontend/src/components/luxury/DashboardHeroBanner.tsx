'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Globe, Shield, Clock, Compass, ArrowUpRight } from 'lucide-react';

interface DashboardHeroBannerProps {
  onExploreMissions?: () => void;
  onOpenRadar?: () => void;
  activeMissionsCount?: number;
  totalOpportunitiesCount?: number;
}

export const DashboardHeroBanner: React.FC<DashboardHeroBannerProps> = ({
  onExploreMissions,
  onOpenRadar,
  activeMissionsCount = 1,
  totalOpportunitiesCount = 19,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateGSTTime = () => {
      try {
        const now = new Date();
        const gstString = now.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Dubai',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });
        setCurrentTime(gstString);
      } catch (e) {
        setCurrentTime('GST 19:30');
      }
    };
    updateGSTTime();
    const timer = setInterval(updateGSTTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-[#D4AF37]/35 bg-gradient-to-r from-[#04060A] via-[#080D1A] to-[#04060A] shadow-[0_12px_45px_rgba(0,0,0,0.85)] group">
      {/* Background Image: Dubai Luxury Skyline */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-screen scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out"
        style={{
          backgroundImage: "url('/images/dubai_luxury_skyline.jpg')",
          filter: 'contrast(1.15) brightness(0.9)',
        }}
      />

      {/* Atmospheric Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#04060A] via-[#060A14]/85 to-[#04060A]/90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#D4AF37]/15 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent" />

      {/* Animated Light Shimmer */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />

      {/* Content Container */}
      <div className="relative z-10 p-6 md:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Left Headline & Salutation */}
        <div className="max-w-2xl space-y-4">
          {/* Greeting Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#D4AF37]/20 via-[#D4AF37]/10 to-transparent border border-[#D4AF37]/40 backdrop-blur-xl shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <span className="text-base drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]">👑</span>
            <span className="font-serif text-xs md:text-sm font-bold tracking-wider text-[#F9F6EE]">
              Good Morning, Ikrama
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest">
              Sovereign AI Active
            </span>
          </div>

          {/* Main Cinematic Title */}
          <div className="space-y-1">
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#F9F6EE] leading-[1.15] drop-shadow-md">
              Your AI Business Empire
            </h1>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FFF6E5] via-[#F5D77F] to-[#D4AF37] leading-[1.15] drop-shadow-[0_2px_15px_rgba(212,175,55,0.3)]">
              Is Operating Beautifully.
            </h2>
          </div>

          {/* Subtitle Matrix */}
          <p className="text-xs md:text-sm text-[#94A3B8] font-light flex items-center flex-wrap gap-2.5 pt-1">
            <span className="text-[#D4AF37] font-semibold tracking-wide">
              Autonomous AI Company
            </span>
            <span className="text-[#475569]">•</span>
            <span className="text-[#F9F6EE] font-medium tracking-wide">
              Global Opportunities
            </span>
            <span className="text-[#475569]">•</span>
            <span className="text-cyan-300 font-medium tracking-wide">
              Infinite Possibilities
            </span>
          </p>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onExploreMissions}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#06080F] bg-gradient-to-r from-[#F5D77F] via-[#D4AF37] to-[#AA771C] hover:from-[#FFFFFF] hover:via-[#F5D77F] hover:to-[#D4AF37] shadow-[0_4px_20px_rgba(212,175,55,0.4)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.6)] transition-all duration-300 flex items-center gap-1.5 group"
            >
              <span>Explore Missions</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>

            <button
              onClick={onOpenRadar}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#F9F6EE] bg-[#080C16]/80 hover:bg-[#0B101D] border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 backdrop-blur-xl transition-all duration-300 flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>UAE Radar ({totalOpportunitiesCount})</span>
            </button>
          </div>
        </div>

        {/* Right Financial District Hub Badge */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 flex-shrink-0">
          {/* Dubai Vision Card */}
          <div className="rounded-2xl bg-gradient-to-b from-[#0B101D]/90 to-[#04060A]/95 border border-[#D4AF37]/35 p-4 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.7)] text-left lg:text-right space-y-2 min-w-[240px]">
            <div className="flex items-center lg:justify-end gap-2 text-[#D4AF37]">
              <Compass className="w-4 h-4 text-[#D4AF37] animate-spin" style={{ animationDuration: '20s' }} />
              <span className="font-serif italic text-xs font-bold tracking-widest uppercase">
                From Dubai To The World
              </span>
            </div>

            <div className="pt-1 border-t border-white/[0.05] space-y-1">
              <div className="flex items-center justify-between lg:justify-end gap-3 text-[11px]">
                <span className="text-[#8C9BAE]">Dubai GST Time:</span>
                <span className="font-mono font-bold text-[#F9F6EE] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#D4AF37]" />
                  {currentTime || '04:00 PM GST'}
                </span>
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-3 text-[11px]">
                <span className="text-[#8C9BAE]">Sovereign HQ:</span>
                <span className="font-semibold text-emerald-400">DIFC Innovation Hub</span>
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-3 text-[11px]">
                <span className="text-[#8C9BAE]">Swarm Status:</span>
                <span className="font-semibold text-[#D4AF37]">Autonomous Mode 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
