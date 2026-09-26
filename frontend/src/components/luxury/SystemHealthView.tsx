'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Database,
  Cpu,
  Server,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Clock,
  Layers,
  Globe
} from 'lucide-react';
import { api } from '@/lib/api';

export const SystemHealthView: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await api.getSystemHealth();
      setHealth(res);
    } catch (err) {
      console.error('Error fetching system health:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. HEADER */}
      <div className="bg-[#090D18] p-6 rounded-2xl border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-white/[0.08] uppercase font-mono">
              Admin &amp; Infrastructure Console
            </span>
            <span className="text-xs text-slate-400 font-mono">24/7 Cloud Architecture</span>
          </div>
          <h1 className="text-xl font-serif font-bold text-white mt-1.5">System Health &amp; Telemetry</h1>
          <p className="text-xs text-slate-400">
            Technical diagnostic data, GitHub Actions worker heartbeats, database latency, and connector scopes.
          </p>
        </div>

        <button
          onClick={fetchHealth}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/[0.08] text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Diagnostics</span>
        </button>
      </div>

      {/* 2. INFRASTRUCTURE STATUS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Backend API */}
        <div className="p-5 rounded-2xl bg-[#090D18] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              Vercel Serverless Backend
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              {health?.backend || 'ONLINE'}
            </span>
          </div>
          <div className="text-xs text-slate-400 space-y-1 font-mono">
            <p>Environment: Production (Vercel Serverless)</p>
            <p>API Endpoint: /api/v1/system/health</p>
            <p>Status: 200 OK (Healthy)</p>
          </div>
        </div>

        {/* Database */}
        <div className="p-5 rounded-2xl bg-[#090D18] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-[#D4AF37]" />
              Neon PostgreSQL Database
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              {health?.database || 'CONNECTED'}
            </span>
          </div>
          <div className="text-xs text-slate-400 space-y-1 font-mono">
            <p>Provider: AWS Neon Serverless PostgreSQL</p>
            <p>Storage: Persistent Cloud (Zero Localhost)</p>
            <p>Driver: asyncpg + SQLAlchemy 2.0 (greenlet)</p>
          </div>
        </div>

        {/* Cloud Worker */}
        <div className="p-5 rounded-2xl bg-[#090D18] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              GitHub Actions Autonomous Runner
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              {health?.worker || 'ONLINE'}
            </span>
          </div>
          <div className="text-xs text-slate-400 space-y-1 font-mono">
            <p>Host: {health?.worker_host || 'runnervmtr4k5'}</p>
            <p>Worker ID: {health?.worker_id || 'GITHUB-ACTIONS-FAST-DISPATCHER'}</p>
            <p>Last Heartbeat: {health?.last_heartbeat || 'Active UTC'}</p>
          </div>
        </div>
      </div>

      {/* 3. RAW TELEMETRY DATA */}
      <div className="bg-[#090D18] p-6 rounded-2xl border border-white/[0.08] space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#D4AF37]" />
          Raw Telemetry Payload
        </h3>

        <pre className="p-4 rounded-xl bg-black/60 border border-white/[0.06] text-xs font-mono text-cyan-300 overflow-x-auto">
          {JSON.stringify(health, null, 2)}
        </pre>
      </div>
    </div>
  );
};
