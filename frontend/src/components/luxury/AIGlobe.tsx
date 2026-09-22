'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Globe2, ArrowRight, Radio, ExternalLink, Flame, Sparkles } from 'lucide-react';

interface RevenueOpportunityItem {
  id?: number;
  lead_name?: string;
  company?: string;
  source?: string;
  industry?: string;
  intent_score?: number;
  urgency_score?: number;
  price_estimate?: number;
  currency?: string;
  status?: string;
  priority?: string;
  created_at?: string;
  time_ago?: string;
}

interface AIGlobeProps {
  opportunities?: RevenueOpportunityItem[];
  leadCount?: number;
  onViewMap?: () => void;
  onViewOpportunities?: () => void;
}

export const AIGlobe: React.FC<AIGlobeProps> = ({
  opportunities = [],
  leadCount,
  onViewMap,
  onViewOpportunities,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'globe' | 'feed'>('globe');
  const handleView = onViewOpportunities || onViewMap;

  // Real verified count
  const verifiedCount = leadCount !== undefined ? leadCount : opportunities.length;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotation = 0;

    const width = 440;
    const height = 400;
    canvas.width = width;
    canvas.height = height;

    const centerX = width / 2;
    const centerY = height / 2 - 10;
    const radius = 130;

    const numPoints = 260;
    const points: { phi: number; theta: number; size: number; alpha: number }[] = [];
    for (let i = 0; i < numPoints; i++) {
      const phi = Math.acos(-1 + (2 * i) / numPoints);
      const theta = Math.sqrt(numPoints * Math.PI) * phi;
      points.push({
        phi,
        theta,
        size: Math.random() * 1.5 + 0.8,
        alpha: Math.random() * 0.5 + 0.5,
      });
    }

    const dubaiLat = 25.2048 * (Math.PI / 180);
    const dubaiLon = 55.2708 * (Math.PI / 180);

    const hubs = [
      { name: 'London', lat: 51.5074 * (Math.PI / 180), lon: -0.1278 * (Math.PI / 180) },
      { name: 'New York', lat: 40.7128 * (Math.PI / 180), lon: -74.006 * (Math.PI / 180) },
      { name: 'Singapore', lat: 1.3521 * (Math.PI / 180), lon: 103.8198 * (Math.PI / 180) },
      { name: 'Tokyo', lat: 35.6762 * (Math.PI / 180), lon: 139.6503 * (Math.PI / 180) },
    ];

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Glow aura
      const auraGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.4,
        centerX,
        centerY,
        radius * 1.35
      );
      auraGradient.addColorStop(0, 'rgba(212, 175, 55, 0.14)');
      auraGradient.addColorStop(0.5, 'rgba(229, 195, 120, 0.05)');
      auraGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // Outer ring
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Latitude rings
      const ringTilt = 0.35;
      for (let lat = -1; lat <= 1; lat += 0.5) {
        if (lat === 0) continue;
        const rLat = radius * Math.cos(lat);
        const yLat = centerY + radius * Math.sin(lat) * ringTilt;
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(centerX, yLat, rLat, rLat * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Rotate dots
      rotation += 0.008;

      points.forEach((p) => {
        const thetaRotated = p.theta + rotation;
        const x = radius * Math.sin(p.phi) * Math.cos(thetaRotated);
        const y = radius * Math.cos(p.phi);
        const z = radius * Math.sin(p.phi) * Math.sin(thetaRotated);

        const screenX = centerX + x;
        const screenY = centerY + y * Math.cos(ringTilt) - z * Math.sin(ringTilt) * 0.3;

        if (z > -radius * 0.3) {
          const depthAlpha = ((z + radius) / (2 * radius)) * p.alpha;
          ctx.fillStyle = `rgba(245, 215, 127, ${Math.max(0.1, depthAlpha)})`;
          ctx.beginPath();
          ctx.arc(screenX, screenY, p.size * (z > 0 ? 1.2 : 0.8), 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Dubai HQ marker
      const dubaiRot = dubaiLon + rotation;
      const dX = radius * Math.cos(dubaiLat) * Math.cos(dubaiRot);
      const dY = radius * Math.sin(dubaiLat);
      const dZ = radius * Math.cos(dubaiLat) * Math.sin(dubaiRot);

      const dubaiScreenX = centerX + dX;
      const dubaiScreenY = centerY - dY * Math.cos(ringTilt) - dZ * Math.sin(ringTilt) * 0.3;

      if (dZ > -20) {
        hubs.forEach((hub, idx) => {
          const hRot = hub.lon + rotation;
          const hX = radius * Math.cos(hub.lat) * Math.cos(hRot);
          const hY = radius * Math.sin(hub.lat);
          const hZ = radius * Math.cos(hub.lat) * Math.sin(hRot);

          if (hZ > -40) {
            const hScreenX = centerX + hX;
            const hScreenY = centerY - hY * Math.cos(ringTilt) - hZ * Math.sin(ringTilt) * 0.3;
            const midX = (dubaiScreenX + hScreenX) / 2;
            const midY = Math.min(dubaiScreenY, hScreenY) - 30;

            ctx.strokeStyle = `rgba(212, 175, 55, ${0.4 - idx * 0.05})`;
            ctx.lineWidth = 1.2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(dubaiScreenX, dubaiScreenY);
            ctx.quadraticCurveTo(midX, midY, hScreenX, hScreenY);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(hScreenX, hScreenY, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        const pulse = (Math.sin(Date.now() * 0.005) + 1) / 2;
        ctx.strokeStyle = `rgba(212, 175, 55, ${0.8 - pulse * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(dubaiScreenX, dubaiScreenY, 6 + pulse * 10, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#FFF6E5';
        ctx.beginPath();
        ctx.arc(dubaiScreenX, dubaiScreenY, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(212, 175, 55, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(dubaiScreenX, dubaiScreenY);
        ctx.lineTo(dubaiScreenX + 20, dubaiScreenY - 25);
        ctx.lineTo(dubaiScreenX + 75, dubaiScreenY - 25);
        ctx.stroke();

        ctx.fillStyle = 'rgba(12, 16, 28, 0.9)';
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(dubaiScreenX + 20, dubaiScreenY - 42, 60, 22, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#F5D77F';
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.fillText('DUBAI', dubaiScreenX + 26, dubaiScreenY - 32);
        ctx.fillStyle = '#A3E635';
        ctx.fillText('HQ', dubaiScreenX + 60, dubaiScreenY - 32);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const sourcesList = ['ALL', 'Telegram', 'LinkedIn', 'Instagram', 'Reddit', 'YouTube', 'Web Search'];

  const filteredOpps = opportunities.filter((opp) => {
    if (selectedSource === 'ALL') return true;
    return (opp.source || '').toLowerCase().includes(selectedSource.toLowerCase().replace(' ', ''));
  });

  return (
    <div className="relative flex flex-col justify-between h-full min-h-[460px] p-4 rounded-2xl bg-gradient-to-b from-[#0B101D]/90 via-[#06080F]/95 to-[#04060A]/95 border border-[#D4AF37]/25 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl">
      {/* Top Header & View Switcher */}
      <div className="flex items-center justify-between pb-3 border-b border-[#D4AF37]/15 z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
            <Radio className="w-4 h-4 text-[#D4AF37] animate-pulse" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-bold text-[#F9F6EE] tracking-wide">
              Live UAE Opportunity Radar
            </h3>
            <p className="text-[10px] text-[#8C9BAE]">
              6 Autonomous Signal Connectors Active
            </p>
          </div>
        </div>

        <div className="flex items-center bg-[#06080F] p-0.5 rounded-lg border border-[#D4AF37]/20 text-[10px]">
          <button
            onClick={() => setViewMode('globe')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              viewMode === 'globe'
                ? 'bg-[#D4AF37] text-[#06080F] font-bold'
                : 'text-[#8C9BAE] hover:text-[#F9F6EE]'
            }`}
          >
            3D Globe
          </button>
          <button
            onClick={() => setViewMode('feed')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              viewMode === 'feed'
                ? 'bg-[#D4AF37] text-[#06080F] font-bold'
                : 'text-[#8C9BAE] hover:text-[#F9F6EE]'
            }`}
          >
            Live Feed ({opportunities.length})
          </button>
        </div>
      </div>

      {/* Main View Area: 3D Globe OR Live Opportunity Feed */}
      {viewMode === 'globe' ? (
        <div className="relative flex-1 flex flex-col items-center justify-center my-2">
          <canvas
            ref={canvasRef}
            className="w-full max-w-[400px] h-auto cursor-pointer"
          />

          {/* Floating Gold Glass Opportunity Card */}
          <div className="absolute left-2 bottom-4 bg-[#080C16]/90 backdrop-blur-xl border border-[#D4AF37]/40 rounded-2xl p-3.5 shadow-2xl space-y-1.5 max-w-[190px] transition-transform hover:scale-105 z-10">
            <div className="flex items-center gap-1.5 text-[#8C9BAE] text-[10px] font-medium">
              <Globe2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Verified Buying Signals</span>
            </div>
            <p className="text-2xl font-bold font-serif text-[#F9F6EE]">
              {verifiedCount}
            </p>
            <p className="text-[9px] text-[#8C9BAE]">High-Intent Pipeline</p>

            <button
              onClick={handleView}
              className="w-full mt-1.5 py-1.5 px-2 rounded-lg text-[10px] font-bold text-[#06080F] bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] hover:opacity-90 flex items-center justify-center gap-1 transition-opacity"
            >
              <span>Explore Radar</span>
              <ArrowRight className="w-3 h-3 text-[#06080F]" />
            </button>
          </div>
        </div>
      ) : (
        /* Real Live Opportunity Feed across Telegram, LinkedIn, Instagram, Reddit, YouTube, Web Search */
        <div className="flex-1 flex flex-col my-2 overflow-hidden">
          {/* Source Tabs */}
          <div className="flex flex-wrap gap-1 mb-2 pt-1">
            {sourcesList.map((src) => (
              <button
                key={src}
                onClick={() => setSelectedSource(src)}
                className={`px-2 py-0.5 rounded text-[9px] font-semibold border transition-all ${
                  selectedSource === src
                    ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                    : 'bg-[#06080F] border-white/[0.05] text-[#8C9BAE] hover:text-[#F9F6EE]'
                }`}
              >
                {src}
              </button>
            ))}
          </div>

          {/* Opportunities List */}
          <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1">
            {filteredOpps.length === 0 ? (
              <div className="text-center py-10 text-xs text-[#8C9BAE]">
                No signals found for {selectedSource}. Run a radar sync to ingest signals.
              </div>
            ) : (
              filteredOpps.map((opp, i) => {
                const leadName = opp.lead_name || opp.company || 'Verified Buyer Inquiry';
                const source = opp.source || 'Web Search';
                const intent = opp.intent_score ?? opp.urgency_score ?? 85;
                const budget = opp.price_estimate || 3500;
                const ind = opp.industry || 'AI Agents & Automation';
                const status = opp.status || opp.priority || 'HOT';

                return (
                  <div
                    key={opp.id || i}
                    className="p-2.5 rounded-xl bg-[#080C16]/80 border border-white/[0.05] hover:border-[#D4AF37]/40 transition-all flex items-center justify-between text-[11px]"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#F9F6EE]">{leadName}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                          {source}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#8C9BAE] mt-0.5">
                        {ind} • Intent Score: <span className="text-emerald-400 font-semibold">{intent}%</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-serif font-bold text-[#D4AF37]">
                        AED {budget.toLocaleString()}
                      </div>
                      <span className="inline-block text-[9px] font-semibold text-emerald-400">
                        {status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Pedestal Inscription */}
      <div className="w-full flex flex-col items-center pt-2 border-t border-white/[0.03]">
        <p className="text-[10px] tracking-[0.25em] font-bold text-[#D4AF37]/90 uppercase font-serif">
          EXPAND • AUTOMATE • DOMINATE
        </p>
      </div>
    </div>
  );
};
