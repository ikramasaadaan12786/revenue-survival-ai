"use client";

import React, { useEffect, useRef, useState } from "react";
import { Globe2, MapPin, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

interface AIGlobeProps {
  leadCount?: number;
  onViewMap?: () => void;
  onViewOpportunities?: () => void;
}

export const AIGlobe: React.FC<AIGlobeProps> = ({
  leadCount = 127,
  onViewMap,
  onViewOpportunities,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState(false);
  const handleView = onViewOpportunities || onViewMap;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let rotation = 0;

    // Fixed dimensions
    const width = 460;
    const height = 440;
    canvas.width = width;
    canvas.height = height;

    const centerX = width / 2;
    const centerY = height / 2 - 20;
    const radius = 135;

    // Pre-generate static points on sphere
    const numPoints = 280;
    const points: { phi: number; theta: number; size: number; alpha: number }[] = [];
    for (let i = 0; i < numPoints; i++) {
      const phi = Math.acos(-1 + (2 * i) / numPoints);
      const theta = Math.sqrt(numPoints * Math.PI) * phi;
      points.push({
        phi,
        theta,
        size: Math.random() * 1.6 + 0.8,
        alpha: Math.random() * 0.5 + 0.5
      });
    }

    // Dubai Location Coordinates
    const dubaiLat = 25.2048 * (Math.PI / 180);
    const dubaiLon = 55.2708 * (Math.PI / 180);

    // Connected Global Hubs (London, NYC, Singapore, Tokyo)
    const hubs = [
      { name: "London", lat: 51.5074 * (Math.PI / 180), lon: -0.1278 * (Math.PI / 180) },
      { name: "New York", lat: 40.7128 * (Math.PI / 180), lon: -74.0060 * (Math.PI / 180) },
      { name: "Singapore", lat: 1.3521 * (Math.PI / 180), lon: 103.8198 * (Math.PI / 180) },
      { name: "Tokyo", lat: 35.6762 * (Math.PI / 180), lon: 139.6503 * (Math.PI / 180) }
    ];

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw glowing aura behind globe
      const auraGradient = ctx.createRadialGradient(centerX, centerY, radius * 0.4, centerX, centerY, radius * 1.4);
      auraGradient.addColorStop(0, "rgba(212, 175, 55, 0.14)");
      auraGradient.addColorStop(0.5, "rgba(229, 195, 120, 0.05)");
      auraGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = auraGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.4, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw Sphere Outer Ring
      ctx.strokeStyle = "rgba(212, 175, 55, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // 3. Draw Orbit Rings (Equator and Latitudes)
      const ringTilt = 0.35;
      for (let lat = -1; lat <= 1; lat += 0.5) {
        if (lat === 0) continue;
        const rLat = radius * Math.cos(lat);
        const yLat = centerY + radius * Math.sin(lat) * ringTilt;
        ctx.strokeStyle = "rgba(212, 175, 55, 0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(centerX, yLat, rLat, rLat * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 4. Project and Draw rotating particle dots
      rotation += 0.008;

      points.forEach((p) => {
        const thetaRotated = p.theta + rotation;
        const x = radius * Math.sin(p.phi) * Math.cos(thetaRotated);
        const y = radius * Math.cos(p.phi);
        const z = radius * Math.sin(p.phi) * Math.sin(thetaRotated);

        // Project only front hemisphere + soft back hemisphere
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

      // 5. Draw Dubai HQ Beacon
      const dubaiRot = dubaiLon + rotation;
      const dX = radius * Math.cos(dubaiLat) * Math.cos(dubaiRot);
      const dY = radius * Math.sin(dubaiLat);
      const dZ = radius * Math.cos(dubaiLat) * Math.sin(dubaiRot);

      const dubaiScreenX = centerX + dX;
      const dubaiScreenY = centerY - dY * Math.cos(ringTilt) - dZ * Math.sin(ringTilt) * 0.3;

      if (dZ > -20) {
        // Draw connection arcs to global hubs
        hubs.forEach((hub, idx) => {
          const hRot = hub.lon + rotation;
          const hX = radius * Math.cos(hub.lat) * Math.cos(hRot);
          const hY = radius * Math.sin(hub.lat);
          const hZ = radius * Math.cos(hub.lat) * Math.sin(hRot);

          if (hZ > -40) {
            const hScreenX = centerX + hX;
            const hScreenY = centerY - hY * Math.cos(ringTilt) - hZ * Math.sin(ringTilt) * 0.3;

            // Curved Quadratic bezier arc
            const midX = (dubaiScreenX + hScreenX) / 2;
            const midY = Math.min(dubaiScreenY, hScreenY) - 35;

            ctx.strokeStyle = `rgba(212, 175, 55, ${0.4 - idx * 0.05})`;
            ctx.lineWidth = 1.2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(dubaiScreenX, dubaiScreenY);
            ctx.quadraticCurveTo(midX, midY, hScreenX, hScreenY);
            ctx.stroke();
            ctx.setLineDash([]);

            // Hub endpoint dot
            ctx.fillStyle = "rgba(0, 240, 255, 0.8)";
            ctx.beginPath();
            ctx.arc(hScreenX, hScreenY, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Glowing golden Dubai pulse marker
        const pulse = (Math.sin(Date.now() * 0.005) + 1) / 2;
        ctx.strokeStyle = `rgba(212, 175, 55, ${0.8 - pulse * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(dubaiScreenX, dubaiScreenY, 6 + pulse * 10, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "#FFF6E5";
        ctx.beginPath();
        ctx.arc(dubaiScreenX, dubaiScreenY, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Pin Beacon Line up
        ctx.strokeStyle = "rgba(212, 175, 55, 0.8)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(dubaiScreenX, dubaiScreenY);
        ctx.lineTo(dubaiScreenX + 25, dubaiScreenY - 30);
        ctx.lineTo(dubaiScreenX + 85, dubaiScreenY - 30);
        ctx.stroke();

        // Pin Tag Label
        ctx.fillStyle = "rgba(12, 16, 28, 0.9)";
        ctx.strokeStyle = "rgba(212, 175, 55, 0.5)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(dubaiScreenX + 25, dubaiScreenY - 48, 65, 24, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#F5D77F";
        ctx.font = "bold 10px Inter, sans-serif";
        ctx.fillText("DUBAI", dubaiScreenX + 33, dubaiScreenY - 36);
        ctx.font = "bold 9px Inter, sans-serif";
        ctx.fillStyle = "#A3E635";
        ctx.fillText("HQ", dubaiScreenX + 70, dubaiScreenY - 36);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-between h-full min-h-[460px] p-4">
      {/* 3D Canvas Canvas Globe */}
      <div className="relative flex items-center justify-center w-full">
        <canvas
          ref={canvasRef}
          className="w-full max-w-[440px] h-auto cursor-pointer"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        />

        {/* Floating Luxury Glass Opportunity Card (Left side overlay) */}
        <div className="absolute left-2 bottom-16 bg-slate-950/80 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-4 shadow-2xl space-y-2 max-w-[190px] transition-transform hover:scale-105">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
            <Globe2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Global Opportunities</span>
          </div>
          <p className="text-2xl font-extrabold text-white font-cinzel">
            {leadCount}
          </p>
          <p className="text-[10px] text-slate-400">High-Value Verified Leads</p>

          <button
            onClick={handleView}
            className="w-full mt-1.5 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center gap-1 transition-colors"
          >
            <span>View Map</span>
            <ArrowRight className="w-3 h-3 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Futuristic Gold Stepped Pedestal Base */}
      <div className="w-full flex flex-col items-center mt-[-10px]">
        {/* Glow rings below globe */}
        <div className="relative w-full max-w-[340px] h-14 flex items-center justify-center">
          <div className="absolute w-72 h-8 rounded-[100%] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent blur-md" />
          <div className="w-64 h-3.5 rounded-[100%] border border-amber-400/40 bg-gradient-to-r from-amber-500/10 via-amber-400/30 to-amber-500/10 shadow-[0_0_20px_rgba(212,175,55,0.4)]" />
          <div className="absolute w-44 h-2 rounded-[100%] border border-cyan-400/60 shadow-[0_0_15px_rgba(0,240,255,0.5)]" />
        </div>

        {/* Inscription Banner */}
        <div className="text-center">
          <p className="text-[11px] tracking-[0.3em] font-bold text-amber-400/90 uppercase font-cinzel">
            EXPAND • AUTOMATE • DOMINATE
          </p>
        </div>
      </div>
    </div>
  );
};
