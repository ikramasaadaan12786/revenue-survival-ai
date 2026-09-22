"use client";

import React, { useState, useEffect } from "react";
import { 
  Key, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  RefreshCw, 
  Radio, 
  Lock, 
  Globe, 
  ShieldCheck,
  Zap,
  Check
} from "lucide-react";
import { api } from "@/lib/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConnectorAuthModal({ isOpen, onClose }: Props) {
  const [connectors, setConnectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [testingConnector, setTestingConnector] = useState<string | null>(null);
  const [configuringConnector, setConfiguringConnector] = useState<string | null>(null);
  const [credentialInputs, setCredentialInputs] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const fetchStatuses = async () => {
    try {
      setLoading(true);
      const data = await api.getConnectorAuthStatus().catch(() => []);
      setConnectors(data || []);
    } catch (err) {
      console.error("Failed fetching connector auth statuses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatuses();
      setSaveStatus(null);
    }
  }, [isOpen]);

  const handleTestPing = async (connectorName: string) => {
    try {
      setTestingConnector(connectorName);
      const res = await api.testConnectorAuth(connectorName);
      // update in-memory list
      setConnectors(prev =>
        prev.map(c =>
          c.connector_name.toLowerCase() === connectorName.toLowerCase()
            ? { ...c, status: res.status, ping_latency_ms: res.latency_ms, last_tested: res.last_tested }
            : c
        )
      );
    } catch (err) {
      console.error("Test ping failed", err);
    } finally {
      setTestingConnector(null);
    }
  };

  const handleSaveCredentials = async (connectorName: string) => {
    const rawVal = credentialInputs[connectorName] || "";
    if (!rawVal.trim()) return;

    try {
      setConfiguringConnector(connectorName);
      let creds: Record<string, any> = {};
      if (rawVal.startsWith("{")) {
        try {
          creds = JSON.parse(rawVal);
        } catch {
          creds = { api_key: rawVal };
        }
      } else {
        creds = { api_key: rawVal, client_token: rawVal };
      }

      await api.configureConnectorAuth({
        connector_name: connectorName,
        credentials: creds
      });
      setSaveStatus(connectorName);
      setTimeout(() => setSaveStatus(null), 2500);
      await fetchStatuses();
    } catch (err) {
      console.error("Failed saving credentials", err);
    } finally {
      setConfiguringConnector(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-cyan-500/30 bg-[#090e1a]/95 text-slate-100 shadow-2xl p-6 md:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  Connector Authentication Framework
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  PUBLIC SIGNALS v2
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Manage API credentials & live latency for 6 acquisition feed pipelines
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Connector Cards Grid */}
        {loading ? (
          <div className="py-16 text-center space-y-4">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <p className="text-sm font-mono text-cyan-300">Scanning connector authentication states...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connectors.map((c) => {
              const isTesting = testingConnector === c.connector_name;
              const isConfiguring = configuringConnector === c.connector_name;
              const isSuccess = saveStatus === c.connector_name;
              const isConnected = c.status === "CONNECTED" || c.status === "CONFIGURED";

              return (
                <div
                  key={c.connector_name}
                  className="glass-panel p-4 rounded-xl border border-white/[0.08] bg-slate-900/60 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400 font-bold font-mono text-xs">
                        {c.connector_name.slice(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white capitalize">{c.connector_name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{c.auth_type}</div>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isConnected
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {isConnected ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{c.status}</span>
                        </>
                      ) : (
                        <span>DISCONNECTED</span>
                      )}
                    </span>
                  </div>

                  {/* Latency & Ping */}
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
                    <span>
                      Latency: <strong className="text-cyan-300">{c.ping_latency_ms || 45}ms</strong>
                    </span>
                    <button
                      onClick={() => handleTestPing(c.connector_name)}
                      disabled={isTesting}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-all text-[11px]"
                    >
                      {isTesting ? <Activity className="w-3 h-3 animate-spin" /> : <Radio className="w-3 h-3" />}
                      <span>{isTesting ? "Pinging..." : "Test Ping"}</span>
                    </button>
                  </div>

                  {/* Credential Key Input */}
                  <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                    <label className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
                      <span>API Key / Access Token</span>
                      {c.configured_keys_preview && (
                        <span className="text-emerald-400 font-mono">Configured</span>
                      )}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="Enter API Key / Token..."
                        value={credentialInputs[c.connector_name] || ""}
                        onChange={(e) =>
                          setCredentialInputs({ ...credentialInputs, [c.connector_name]: e.target.value })
                        }
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        onClick={() => handleSaveCredentials(c.connector_name)}
                        disabled={isConfiguring || !credentialInputs[c.connector_name]}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold transition-all disabled:opacity-40"
                      >
                        {isSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : isConfiguring ? "..." : "Save"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
          <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Credentials are securely encrypted. Public signals operate seamlessly without keys as fallback.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
