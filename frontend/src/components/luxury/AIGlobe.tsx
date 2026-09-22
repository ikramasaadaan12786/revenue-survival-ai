'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Globe2, ArrowRight, Radio, ExternalLink, Sparkles, MapPin } from 'lucide-react';

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

    const width = 480;
    const height = 420;
    canvas.width = width;
    canvas.height = height;

    const centerX = width / 2;
    const centerY = height / 2 - 12;
    const radius = 138;

    // Pre-generate sphere points
    const numPoints = 300;
    const points: { phi: number; theta: number; size: number; alpha: number }[] = [];
    for (let i = 0; i < numPoints; i++) {
      const phi = Math.acos(-1 + (2 * i) / numPoints);
      const theta = Math.sqrt(numPoints * Math.PI) * phi;
      points.push({
        phi,
        theta,
        size: Math.random() * 1.6 + 0.8,
        alpha: Math.random() * 0.5 + 0.5,
      });
    }

    // Dubai Geographic Coordinates
    const dubaiLat = 25.2048 * (Math.PI / 180);
    const dubaiLon = 55.2708 * (Math.PI / 180);

    // Global Hubs Coordinates (London, NYC, Singapore, Tokyo)
    const hubs = [
      { name: 'London', lat: 51.5074 * (Math.PI / 180), lon: -0.1278 * (Math.PI / 180) },
      { name: 'New York', lat: 40.7128 * (Math.PI / 180), lon: -74.006 * (Math.PI / 180) },
      { name: 'Singapore', lat: 1.3521 * (Math.PI / 180), lon: 103.8198 * (Math.PI / 180) },
      { name: 'Tokyo', lat: 35.6762 * (Math.PI / 180), lon: 139.6503 * (Math.PI / 180) },
    ];

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw glowing ambient background aura
      const auraGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.35,
        centerX,
        centerY,
        radius * 1.45
      );
      auraGradient.addColorStop(0, 'rgba(212, 175, 55, 0.16)');
      auraGradient.addColorStop(0.5, 'rgba(229, 195, 120, 0.06)');
      auraGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.45, 0, Math.PI * 2);
      ctx.fill();

      // 2. Outer Ring with gold glow
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // 3. Latitude Rings
      const ringTilt = 0.35;
      for (let lat = -1; lat <= 1; lat += 0.5) {
        if (lat === 0) continue;
        const rLat = radius * Math.cos(lat);
        const yLat = centerY + radius * Math.sin(lat) * ringTilt;
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(centerX, yLat, rLat, rLat * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 4. Rotate and project particles
      rotation += 0.007;

      points.forEach((p) => {
        const thetaRotated = p.theta + rotation;
        const x = radius * Math.sin(p.phi) * Math.cos(thetaRotated);
        const y = radius * Math.cos(p.phi);
        const z = radius * Math.sin(p.phi) * Math.sin(thetaRotated);

        const screenX = centerX + x;
        const screenY = centerY + y * Math.cos(ringTilt) - z * Math.sin(ringTilt) * 0.3;

        if (z > -radius * 0.35) {
          const depthAlpha = ((z + radius) / (2 * radius)) * p.alpha;
          ctx.fillStyle = `rgba(245, 215, 127, ${Math.max(0.12, depthAlpha)})`;
          ctx.beginPath();
          ctx.arc(screenX, screenY, p.size * (z > 0 ? 1.25 : 0.8), 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 5. Draw Dubai HQ Beacon & Arcs
      const dubaiRot = dubaiLon + rotation;
      const dX = radius * Math.cos(dubaiLat) * Math.cos(dubaiRot);
      const dY = radius * Math.sin(dubaiLat);
      const dZ = radius * Math.cos(dubaiLat) * Math.sin(dubaiRot);

      const dubaiScreenX = centerX + dX;
      const dubaiScreenY = centerY - dY * Math.cos(ringTilt) - dZ * Math.sin(ringTilt) * 0.3;

      if (dZ > -25) {
        hubs.forEach((hub, idx) => {
          const hRot = hub.lon + rotation;
          const hX = radius * Math.cos(hub.lat) * Math.cos(hRot);
          const hY = radius * Math.sin(hub.lat);
          const hZ = radius * Math.cos(hub.lat) * Math.sin(hRot);

          if (hZ > -45) {
            const hScreenX = centerX + hX;
            const hScreenY = centerY - hY * Math.cos(ringTilt) - hZ * Math.sin(ringTilt) * 0.3;
            const midX = (dubaiScreenX + hScreenX) / 2;
            const midY = Math.min(dubaiScreenY, hScreenY) - 32;

            ctx.strokeStyle = `rgba(212, 175, 55, ${0.45 - idx * 0.06})`;
            ctx.lineWidth = 1.3;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(dubaiScreenX, dubaiScreenY);
            ctx.quadraticCurveTo(midX, midY, hScreenX, hScreenY);
            ctx.stroke();
            ctx.setLineDash([]);

            // Global Hub Node
            ctx.fillStyle = 'rgba(0, 240, 255, 0.85)';
            ctx.beginPath();
            ctx.arc(hScreenX, hScreenY, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Pulsing Golden Beacon for Dubai
        const pulse = (Math.sin(Date.now() * 0.005) + 1) / 2;
        ctx.strokeStyle = `rgba(212, 175, 55, ${0.85 - pulse * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(dubaiScreenX, dubaiScreenY, 6 + pulse * 10, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#FFF6E5';
        ctx.beginPath();
        ctx.arc(dubaiScreenX, dubaiScreenY, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Pin Pointer Line
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.85)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(dubaiScreenX, dubaiScreenY);
        ctx.lineTo(dubaiScreenX + 22, dubaiScreenY - 26);
        ctx.lineTo(dubaiScreenX + 80, dubaiScreenY - 26);
        ctx.stroke();

        // Pin Tag Badge
        ctx.fillStyle = 'rgba(10, 14, 24, 0.95)';
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(dubaiScreenX + 22, dubaiScreenY - 44, 62, 22, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#F5D77F';
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.fillText('DUBAI', dubaiScreenX + 28, dubaiScreenY - 34);
        ctx.fillStyle = '#10B981';
        ctx.fillText('HQ', dubaiScreenX + 64, dubaiScreenY - 34);
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
    <div className="relative flex flex-col justify-between h-full min-h-[480px] p-5 rounded-3xl bg-gradient-to-b from-[#0B101D]/90 via-[#070A14]/95 to-[#04060A]/98 border border-[#D4AF37]/35 shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
      {/* Top Header & View Switcher */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#D4AF37]/20 z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Radio className="w-4 h-4 text-[#D4AF37] animate-pulse" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-bold text-[#F9F6EE] tracking-wide">
              Global AI Opportunity Radar
            </h3>
            <p className="text-[10.5px] text-[#8C9BAE]">
              6 Autonomous Signal Connectors Synchronized
            </p>
          </div>
        </div>

        <div className="flex items-center bg-[#06080F] p-0.5 rounded-xl border border-[#D4AF37]/25 text-[10px]">
          <button
            onClick={() => setViewMode('globe')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'globe'
                ? 'bg-gradient-to-r from-[#F5D77F] via-[#D4AF37] to-[#AA771C] text-[#06080F] font-bold shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                : 'text-[#8C9BAE] hover:text-[#F9F6EE]'
            }`}
          >
            3D Globe
          </button>
          <button
            onClick={() => setViewMode('feed')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'feed'
                ? 'bg-gradient-to-r from-[#F5D77F] via-[#D4AF37] to-[#AA771C] text-[#06080F] font-bold shadow-[0_0_12px_rgba(212,175,55,0.4)]'
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
            className="w-full max-w-[440px] h-auto cursor-pointer animate-float-globe"
          />

          {/* Floating Gold Glass Opportunity Card */}
          <div className="absolute left-2 bottom-3 bg-[#080C16]/95 backdrop-blur-2xl border border-[#D4AF37]/45 rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.8)] space-y-2 max-w-[200px] transition-all hover:scale-105 hover:border-[#D4AF37] z-10">
            <div className="flex items-center gap-1.5 text-[#8C9BAE] text-[10.5px] font-semibold uppercase tracking-wider">
              <Globe2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Verified Signals</span>
            </div>
            <p className="text-2xl lg:text-3xl font-bold font-serif text-[#F9F6EE]">
              {verifiedCount}
            </p>
            <p className="text-[9.5px] text-[#8C9BAE]">High-Intent Pipeline</p>

            <button
              onClick={handleView}
              className="w-full mt-2 py-2 px-3 rounded-xl text-[10.5px] font-bold text-[#06080F] bg-gradient-to-r from-[#F5D77F] via-[#D4AF37] to-[#AA771C] hover:from-[#FFFFFF] hover:via-[#F5D77F] hover:to-[#D4AF37] flex items-center justify-center gap-1 shadow-[0_4px_15px_rgba(212,175,55,0.3)] transition-all duration-300"
            >
              <span>Explore Radar</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#06080F]" />
            </button>
          </div>
        </div>
      ) : (
        /* Real Live Opportunity Feed across Telegram, LinkedIn, Instagram, Reddit, YouTube, Web Search */
        <div className="flex-1 flex flex-col my-2 overflow-hidden">
          {/* Source Tabs */}
          <div className="flex flex-wrap gap-1.5 mb-2.5 pt-1">
            {sourcesList.map((src) => (
              <button
                key={src}
                onClick={() => setSelectedSource(src)}
                className={`px-2.5 py-1 rounded-lg text-[9.5px] font-semibold border transition-all ${
                  selectedSource === src
                    ? 'bg-[#D4AF37]/25 border-[#D4AF37] text-[#F9F6EE] shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                    : 'bg-[#06080F] border-white/[0.06] text-[#8C9BAE] hover:text-[#F9F6EE]'
                }`}
              >
                {src}
              </button>
            ))}
          </div>

          {/* Opportunities List */}
          <div className="space-y-2.5 overflow-y-auto max-h-[300px] pr-1">
            {filteredOpps.length === 0 ? (
              <div className="text-center py-12 text-xs text-[#8C9BAE]">
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
                    className="p-3 rounded-xl bg-[#080C16]/90 border border-white/[0.06] hover:border-[#D4AF37]/50 transition-all flex items-center justify-between text-[11px] group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#F9F6EE] group-hover:text-[#D4AF37] transition-colors">{leadName}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
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
                      <span className="inline-block text-[9.5px] font-semibold text-emerald-400">
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

      {/* Stepped Gold Pedestal Inscription */}
      <div className="w-full flex flex-col items-center pt-3 border-t border-[#D4AF37]/15">
        <p className="text-[10.5px] tracking-[0.28em] font-bold text-[#D4AF37]/90 uppercase font-serif">
          EXPAND • AUTOMATE • SCALE • DOMINATE
        </p>
      </div>
    </div>
  );
};
