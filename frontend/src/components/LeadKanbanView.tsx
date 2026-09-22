"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Flame, 
  CheckCircle, 
  MessageSquare, 
  Phone, 
  Mail, 
  Globe, 
  Send,
  MoreVertical,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles
} from "lucide-react";
import { Lead, CRMStage } from "@/types";
import { api } from "@/lib/api";

interface Props {
  missionId: number;
  onRefreshSummary: () => void;
}

const CRM_STAGES: { id: CRMStage; label: string; color: string; bg: string }[] = [
  { id: "NEW", label: "1. New", color: "text-slate-400", bg: "bg-slate-800/40 border-slate-700" },
  { id: "AI_VERIFIED", label: "2. AI Verified", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/30" },
  { id: "CONTACT_READY", label: "3. Contact Ready", color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/30" },
  { id: "CONTACTED", label: "4. Contacted", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
  { id: "REPLIED", label: "5. Replied", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" },
  { id: "MEETING", label: "6. Meeting", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
  { id: "DEAL", label: "7. Deal", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
  { id: "COMMISSION", label: "8. Commission", color: "text-emerald-300 font-bold", bg: "bg-emerald-500/20 border-emerald-400" },
];

export default function LeadKanbanView({ missionId, onRefreshSummary }: Props) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [hunting, setHunting] = useState(false);
  const [activeStageFilter, setActiveStageFilter] = useState<string>("ALL");

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await api.getLeads(missionId);
      setLeads(data);
    } catch (err) {
      console.error("Failed to load leads", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [missionId]);

  const handleHunt = async () => {
    try {
      setHunting(true);
      await api.huntLeads(missionId);
      await fetchLeads();
      onRefreshSummary();
    } catch (err) {
      console.error("Failed hunting leads", err);
    } finally {
      setHunting(false);
    }
  };

  const handleStatusChange = async (leadId: number, newStatus: string) => {
    try {
      await api.updateLeadStatus(leadId, newStatus);
      await fetchLeads();
      onRefreshSummary();
    } catch (err) {
      console.error("Failed updating lead status", err);
    }
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case "Hot":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
      case "Qualified":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "Warm":
        return "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
      default:
        return "bg-slate-700/30 text-slate-400 border-slate-700";
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "WhatsApp":
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />;
      case "Email":
        return <Mail className="w-3.5 h-3.5 text-cyan-400" />;
      case "LinkedIn":
        return <Globe className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <Send className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            8-Stage Revenue CRM Pipeline (Lead Hunter Agent)
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Full conversion funnel: NEW → AI VERIFIED → CONTACT READY → CONTACTED → REPLIED → MEETING → DEAL → COMMISSION
          </p>
        </div>

        <button
          onClick={handleHunt}
          disabled={hunting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-mono transition-all disabled:opacity-50"
        >
          <Search className={`w-3.5 h-3.5 ${hunting ? "animate-spin" : ""}`} />
          {hunting ? "SCOUTING PROSPECTS..." : "DISCOVER & INGEST LEADS"}
        </button>
      </div>

      {/* Stage Flow Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {CRM_STAGES.map((st) => {
          const count = leads.filter((l) => (l.status || "NEW").toUpperCase() === st.id).length;
          return (
            <div
              key={st.id}
              onClick={() => setActiveStageFilter(activeStageFilter === st.id ? "ALL" : st.id)}
              className={`glass-panel p-3 rounded-xl cursor-pointer transition-all ${
                activeStageFilter === st.id ? "border-cyan-400 bg-slate-800/80 shadow-glow" : "hover:border-white/[0.15]"
              }`}
            >
              <div className="text-[10px] font-mono text-slate-400 truncate">{st.label}</div>
              <div className="flex items-center justify-between mt-1">
                <span className={`text-base font-black font-mono ${st.color}`}>{count}</span>
                {count > 0 && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* 8-Stage Kanban Flow */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8 gap-3 overflow-x-auto pb-4">
        {CRM_STAGES.map((st) => {
          const stageLeads = leads.filter((l) => (l.status || "NEW").toUpperCase() === st.id);
          if (activeStageFilter !== "ALL" && activeStageFilter !== st.id) return null;

          return (
            <div
              key={st.id}
              className={`glass-panel p-3.5 flex flex-col space-y-3 min-w-[240px] ${
                activeStageFilter === st.id ? "col-span-full" : ""
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <span className={`text-xs font-mono font-bold ${st.color}`}>
                  {st.label} ({stageLeads.length})
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {stageLeads.reduce((acc, curr) => acc + (curr.expected_value || 0), 0)} AED
                </span>
              </div>

              {/* Lead Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[520px]">
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-slate-900/90 p-3.5 rounded-xl border border-white/[0.06] hover:border-cyan-500/40 transition-all space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white leading-tight">{lead.name}</h4>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {lead.country} • {lead.source}
                        </div>
                      </div>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${getIntentColor(
                          lead.intent_score
                        )}`}
                      >
                        {lead.intent_score}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-white/[0.03] leading-relaxed line-clamp-2">
                      {lead.interest}
                    </p>

                    {/* Financial Values */}
                    <div className="bg-slate-950/80 p-2 rounded-lg border border-white/[0.04] space-y-0.5 text-[10px] font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Dossier:</span>
                        <span className="text-cyan-400 font-bold">{lead.expected_value} AED</span>
                      </div>
                      {lead.commission_potential > 0 && (
                        <div className="flex justify-between text-emerald-400 font-semibold">
                          <span>2% Broker Fee:</span>
                          <span>{lead.commission_potential?.toLocaleString()} AED</span>
                        </div>
                      )}
                    </div>

                    {/* Channel & Stage Selector */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1">
                        {getChannelIcon(lead.channel)}
                        <span className="text-[10px] font-mono text-slate-400">{lead.channel}</span>
                      </div>

                      <select
                        value={lead.status || "NEW"}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className="bg-slate-950 text-slate-200 text-[10px] font-mono rounded px-1.5 py-0.5 border border-white/[0.1] focus:outline-none focus:border-cyan-500"
                      >
                        {CRM_STAGES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}

                {stageLeads.length === 0 && (
                  <div className="text-center py-6 text-[10px] text-slate-600 font-mono">
                    No leads in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
