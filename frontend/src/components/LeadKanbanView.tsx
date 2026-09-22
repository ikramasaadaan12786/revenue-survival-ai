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
  CheckCircle2, 
  DollarSign, 
  ArrowRight, 
  ShieldCheck, 
  Award, 
  Sparkles,
  Zap,
  FileText,
  HelpCircle,
  Clock,
  Layers,
  Activity
} from "lucide-react";
import { Lead, CRMStage, PipelineStage } from "@/types";
import { api } from "@/lib/api";
import SalesClosingAssistantModal from "./SalesClosingAssistantModal";
import ProposalGeneratorModal from "./ProposalGeneratorModal";

interface Props {
  missionId: number;
  onRefreshSummary: () => void;
}

const UPGRADED_PIPELINE_STAGES: { id: PipelineStage; label: string; color: string; probability: number }[] = [
  { id: "DISCOVERED", label: "1. Discovered", color: "text-slate-400", probability: 0.10 },
  { id: "QUALIFIED", label: "2. Qualified", color: "text-cyan-400", probability: 0.25 },
  { id: "OFFER_CREATED", label: "3. Offer Created", color: "text-indigo-400", probability: 0.40 },
  { id: "CONTACT_PENDING", label: "4. Contact Pending", color: "text-blue-400", probability: 0.45 },
  { id: "CONTACTED", label: "5. Contacted", color: "text-sky-400", probability: 0.50 },
  { id: "DISCOVERY_CALL", label: "6. Discovery Call", color: "text-purple-400", probability: 0.60 },
  { id: "PROPOSAL_SENT", label: "7. Proposal Sent", color: "text-pink-400", probability: 0.70 },
  { id: "FOLLOW_UP", label: "8. Follow Up", color: "text-amber-400", probability: 0.75 },
  { id: "OBJECTION", label: "9. Objection Battle", color: "text-rose-400", probability: 0.65 },
  { id: "NEGOTIATION", label: "10. Negotiation", color: "text-amber-300 font-bold", probability: 0.85 },
  { id: "CLOSING", label: "11. Closing Stage", color: "text-emerald-400 font-bold", probability: 0.90 },
  { id: "PAYMENT_PENDING", label: "12. Payment Pending", color: "text-emerald-300 font-bold", probability: 0.95 },
  { id: "WON", label: "13. Won / Realized", color: "text-emerald-400 font-black", probability: 1.00 },
  { id: "LOST", label: "14. Lost / Inactive", color: "text-slate-500", probability: 0.00 }
];

export default function LeadKanbanView({ missionId, onRefreshSummary }: Props) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [hunting, setHunting] = useState(false);
  const [activeStageFilter, setActiveStageFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"DEAL_PIPELINE" | "CRM_STANDARD">("DEAL_PIPELINE");

  // Modals state
  const [selectedLeadForCloser, setSelectedLeadForCloser] = useState<Lead | null>(null);
  const [showCloserModal, setShowCloserModal] = useState<boolean>(false);
  const [selectedLeadForProposal, setSelectedLeadForProposal] = useState<Lead | null>(null);
  const [showProposalModal, setShowProposalModal] = useState<boolean>(false);
  const [qualifyingLeadId, setQualifyingLeadId] = useState<number | null>(null);

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

  const handlePipelineStageChange = async (leadId: number, newStage: string) => {
    try {
      await api.updatePipelineStage(leadId, { stage: newStage });
      await fetchLeads();
      onRefreshSummary();
    } catch (err) {
      console.error("Failed updating pipeline stage", err);
    }
  };

  const handleQualifyLead = async (lead: Lead) => {
    try {
      setQualifyingLeadId(lead.id);
      await api.qualifyLead({
        lead_id: lead.id,
        company_name: lead.company_name || lead.name,
        requirement_text: lead.interest || "Seeking high-speed automated digital operations.",
        channel: lead.channel
      });
      await fetchLeads();
      onRefreshSummary();
    } catch (err) {
      console.error("Failed qualifying lead", err);
    } finally {
      setQualifyingLeadId(null);
    }
  };

  const getClassificationBadge = (classification?: string, score?: number) => {
    const cls = classification || (score && score >= 80 ? "HOT" : score && score >= 60 ? "QUALIFIED" : "WARM");
    if (cls === "HOT") {
      return (
        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
          <Flame className="w-2.5 h-2.5 animate-pulse" />
          HOT {score ? `${score.toFixed(0)}%` : ""}
        </span>
      );
    }
    if (cls === "QUALIFIED") {
      return (
        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
          <CheckCircle2 className="w-2.5 h-2.5" />
          QUALIFIED {score ? `${score.toFixed(0)}%` : ""}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
        WARM {score ? `${score.toFixed(0)}%` : ""}
      </span>
    );
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

  const totalPipelineVal = leads.reduce((acc, curr) => acc + (curr.estimated_budget || curr.expected_value || 3500), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>Revenue Deal Pipeline & Closing Engine</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              UPGRADED v3
            </span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            14-Stage Velocity Tracker • AI Qualification Scores • Objection Battlecards • Instant Proposal Generator
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleHunt}
            disabled={hunting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-mono transition-all disabled:opacity-50"
          >
            <Search className={`w-3.5 h-3.5 ${hunting ? "animate-spin" : ""}`} />
            <span>{hunting ? "SCOUTING PROSPECTS..." : "DISCOVER & INGEST LEADS"}</span>
          </button>
        </div>
      </div>

      {/* Stage Filters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {UPGRADED_PIPELINE_STAGES.slice(0, 7).map((st) => {
          const count = leads.filter((l) => (l.pipeline_stage || "DISCOVERED").toUpperCase() === st.id).length;
          return (
            <div
              key={st.id}
              onClick={() => setActiveStageFilter(activeStageFilter === st.id ? "ALL" : st.id)}
              className={`glass-panel p-2.5 rounded-xl cursor-pointer transition-all ${
                activeStageFilter === st.id ? "border-cyan-400 bg-slate-800/80 shadow-glow" : "hover:border-white/[0.15]"
              }`}
            >
              <div className="text-[10px] font-mono text-slate-400 truncate">{st.label}</div>
              <div className="flex items-center justify-between mt-1">
                <span className={`text-sm font-black font-mono ${st.color}`}>{count}</span>
                <span className="text-[9px] font-mono text-slate-500">{st.probability * 100}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {UPGRADED_PIPELINE_STAGES.slice(7).map((st) => {
          const count = leads.filter((l) => (l.pipeline_stage || "DISCOVERED").toUpperCase() === st.id).length;
          return (
            <div
              key={st.id}
              onClick={() => setActiveStageFilter(activeStageFilter === st.id ? "ALL" : st.id)}
              className={`glass-panel p-2.5 rounded-xl cursor-pointer transition-all ${
                activeStageFilter === st.id ? "border-cyan-400 bg-slate-800/80 shadow-glow" : "hover:border-white/[0.15]"
              }`}
            >
              <div className="text-[10px] font-mono text-slate-400 truncate">{st.label}</div>
              <div className="flex items-center justify-between mt-1">
                <span className={`text-sm font-black font-mono ${st.color}`}>{count}</span>
                <span className="text-[9px] font-mono text-slate-500">{st.probability * 100}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Kanban Columns / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {leads.map((lead) => {
          const currentStage = (lead.pipeline_stage || "DISCOVERED").toUpperCase();
          if (activeStageFilter !== "ALL" && currentStage !== activeStageFilter) return null;
          const isQualifying = qualifyingLeadId === lead.id;

          return (
            <div
              key={lead.id}
              className="glass-panel p-5 rounded-2xl border border-white/[0.08] hover:border-cyan-500/40 bg-slate-900/80 transition-all space-y-4 flex flex-col justify-between"
            >
              {/* Top Row */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">
                      {lead.company_name || lead.name}
                    </h4>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                      <span>{lead.country}</span>
                      <span>•</span>
                      <span className="text-cyan-400">{lead.source}</span>
                    </div>
                  </div>
                  <div>
                    {getClassificationBadge(lead.classification, lead.qualification_score)}
                  </div>
                </div>

                <p className="text-xs text-slate-300 bg-slate-950/70 p-2.5 rounded-xl border border-white/[0.04] leading-relaxed line-clamp-2 font-mono">
                  "{lead.interest || lead.qualification_notes || "Qualified prospect seeking digital revenue infrastructure."}"
                </p>

                {/* Values & Probability */}
                <div className="bg-slate-950/90 p-3 rounded-xl border border-white/[0.05] space-y-1 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Deal Target:</span>
                    <strong className="text-emerald-400">
                      {Number(lead.estimated_budget || lead.expected_value || 3500).toLocaleString()} AED
                    </strong>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Decision Stage:</span>
                    <span className="text-cyan-300 font-medium">{lead.decision_stage || "EVALUATION"}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Closing Probability:</span>
                    <span className="text-purple-300 font-bold">
                      {lead.revenue_probability ? `${Math.round(lead.revenue_probability * 100)}%` : "80%"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="space-y-2.5 pt-2 border-t border-white/[0.06]">
                {/* 3 AI Closing Actions */}
                <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
                  <button
                    onClick={() => handleQualifyLead(lead)}
                    disabled={isQualifying}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-bold transition-all text-center truncate"
                    title="Score and classify lead with AI"
                  >
                    {isQualifying ? "..." : "⚡ Qualify"}
                  </button>

                  <button
                    onClick={() => {
                      setSelectedLeadForCloser(lead);
                      setShowCloserModal(true);
                    }}
                    className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 font-bold transition-all text-center truncate"
                    title="Open Discovery Questions & Objection Battlecards"
                  >
                    🎯 Closer
                  </button>

                  <button
                    onClick={() => {
                      setSelectedLeadForProposal(lead);
                      setShowProposalModal(true);
                    }}
                    className="p-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/40 font-bold transition-all text-center truncate"
                    title="Generate Custom Commercial Proposal"
                  >
                    📄 Proposal
                  </button>
                </div>

                {/* Stage Advancement Dropdown */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-[10px] font-mono text-slate-400">Stage:</span>
                  <select
                    value={lead.pipeline_stage || "DISCOVERED"}
                    onChange={(e) => handlePipelineStageChange(lead.id, e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 text-xs font-mono rounded-lg px-2 py-1.5 border border-white/[0.1] focus:outline-none focus:border-cyan-500"
                  >
                    {UPGRADED_PIPELINE_STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label} ({s.probability * 100}%)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {leads.length === 0 && !loading && (
        <div className="glass-panel p-12 text-center text-slate-400 font-mono text-xs space-y-3">
          <p>No active pipeline leads tracked for this mission yet.</p>
          <button
            onClick={handleHunt}
            className="px-4 py-2 rounded-xl text-xs font-bold font-mono bg-cyan-400 text-black shadow-glow hover:bg-cyan-300 transition-all"
          >
            Run Lead Hunter Now
          </button>
        </div>
      )}

      {/* Sales Closing Assistant Modal */}
      <SalesClosingAssistantModal
        isOpen={showCloserModal}
        onClose={() => setShowCloserModal(false)}
        lead={selectedLeadForCloser}
      />

      {/* Proposal Generator Modal */}
      <ProposalGeneratorModal
        isOpen={showProposalModal}
        onClose={() => setShowProposalModal(false)}
        missionId={missionId}
        lead={selectedLeadForProposal}
        onProposalCreated={() => {
          fetchLeads();
          onRefreshSummary();
        }}
      />
    </div>
  );
}
