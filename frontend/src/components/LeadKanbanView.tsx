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
  Coins, 
  ArrowRight, 
  ShieldCheck, 
  Award, 
  Sparkles,
  Zap,
  FileText,
  Clock,
  Layers,
  Activity
} from "lucide-react";
import { Lead, PipelineStage } from "@/types";
import { api } from "@/lib/api";
import SalesClosingAssistantModal from "./SalesClosingAssistantModal";
import ProposalGeneratorModal from "./ProposalGeneratorModal";

interface Props {
  missionId: number;
  onRefreshSummary: () => void;
}

const UPGRADED_PIPELINE_STAGES: { id: PipelineStage; label: string; color: string; probability: number }[] = [
  { id: "DISCOVERED", label: "1. Discovered", color: "text-[#8C9BAE]", probability: 0.10 },
  { id: "QUALIFIED", label: "2. Qualified", color: "text-cyan-400", probability: 0.25 },
  { id: "OFFER_CREATED", label: "3. Offer Created", color: "text-indigo-400", probability: 0.40 },
  { id: "CONTACT_PENDING", label: "4. Contact Pending", color: "text-blue-400", probability: 0.45 },
  { id: "CONTACTED", label: "5. Contacted", color: "text-sky-400", probability: 0.50 },
  { id: "DISCOVERY_CALL", label: "6. Discovery Call", color: "text-purple-400", probability: 0.60 },
  { id: "PROPOSAL_SENT", label: "7. Proposal Sent", color: "text-pink-400", probability: 0.70 },
  { id: "FOLLOW_UP", label: "8. Follow Up", color: "text-amber-400", probability: 0.75 },
  { id: "OBJECTION", label: "9. Objection Battle", color: "text-rose-400", probability: 0.65 },
  { id: "NEGOTIATION", label: "10. Negotiation", color: "text-[#F3E5AB] font-bold", probability: 0.85 },
  { id: "CLOSING", label: "11. Closing Stage", color: "text-emerald-400 font-bold", probability: 0.90 },
  { id: "PAYMENT_PENDING", label: "12. Payment Pending", color: "text-emerald-300 font-bold", probability: 0.95 },
  { id: "WON", label: "13. Won / Realized", color: "text-emerald-400 font-bold", probability: 1.00 },
  { id: "LOST", label: "14. Lost / Inactive", color: "text-slate-500", probability: 0.00 }
];

export default function LeadKanbanView({ missionId, onRefreshSummary }: Props) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [hunting, setHunting] = useState(false);
  const [activeStageFilter, setActiveStageFilter] = useState<string>("ALL");

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
        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
          <Flame className="w-2.5 h-2.5 animate-pulse" />
          HOT {score ? `${score.toFixed(0)}%` : ""}
        </span>
      );
    }
    if (cls === "QUALIFIED") {
      return (
        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
          <CheckCircle2 className="w-2.5 h-2.5" />
          QUALIFIED {score ? `${score.toFixed(0)}%` : ""}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
        WARM {score ? `${score.toFixed(0)}%` : ""}
      </span>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#0B101D] via-[#06080F] to-[#04060A] border border-[#D4AF37]/30 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#F3E5AB]/20 via-[#D4AF37]/10 to-transparent border border-[#D4AF37]/40 text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-serif text-xl font-bold text-[#F9F6EE] tracking-tight">
                Sovereign CRM Pipeline & Closing Engine
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 uppercase">
                14-STAGE VELOCITY
              </span>
            </div>
            <p className="text-xs text-[#8C9BAE] mt-0.5">
              Automated AI Lead Scoring • Objection Battlecards • Instant Proposal Synthesis • Real-Time Deal Velocity
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleHunt}
            disabled={hunting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] text-[#06080F] shadow-[0_2px_15px_rgba(212,175,55,0.3)] transition-all disabled:opacity-50"
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
              className={`p-2.5 rounded-xl cursor-pointer transition-all border ${
                activeStageFilter === st.id 
                  ? "border-[#D4AF37] bg-[#D4AF37]/15 shadow-[0_2px_12px_rgba(212,175,55,0.2)]" 
                  : "bg-[#0B101D]/70 border-white/[0.04] hover:border-[#D4AF37]/30"
              }`}
            >
              <div className="text-[10px] text-[#8C9BAE] truncate font-medium">{st.label}</div>
              <div className="flex items-center justify-between mt-1">
                <span className={`text-sm font-bold font-serif ${st.color}`}>{count}</span>
                <span className="text-[9px] text-[#64748B]">{st.probability * 100}%</span>
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
              className={`p-2.5 rounded-xl cursor-pointer transition-all border ${
                activeStageFilter === st.id 
                  ? "border-[#D4AF37] bg-[#D4AF37]/15 shadow-[0_2px_12px_rgba(212,175,55,0.2)]" 
                  : "bg-[#0B101D]/70 border-white/[0.04] hover:border-[#D4AF37]/30"
              }`}
            >
              <div className="text-[10px] text-[#8C9BAE] truncate font-medium">{st.label}</div>
              <div className="flex items-center justify-between mt-1">
                <span className={`text-sm font-bold font-serif ${st.color}`}>{count}</span>
                <span className="text-[9px] text-[#64748B]">{st.probability * 100}%</span>
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
              className="p-5 rounded-2xl border border-[#D4AF37]/25 hover:border-[#D4AF37]/50 bg-gradient-to-b from-[#0B101D]/90 to-[#04060A]/95 transition-all space-y-4 flex flex-col justify-between shadow-md"
            >
              {/* Top Row */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-[#F9F6EE] leading-tight">
                      {lead.company_name || lead.name}
                    </h4>
                    <div className="text-[10px] text-[#8C9BAE] mt-0.5 flex items-center gap-1.5">
                      <span>{lead.country}</span>
                      <span>•</span>
                      <span className="text-cyan-400">{lead.source}</span>
                    </div>
                  </div>
                  <div>
                    {getClassificationBadge(lead.classification, lead.qualification_score)}
                  </div>
                </div>

                <p className="text-xs text-[#CBD5E1] bg-[#06080F]/80 p-2.5 rounded-xl border border-white/[0.04] leading-relaxed line-clamp-2">
                  &ldquo;{lead.interest || lead.qualification_notes || "Qualified prospect seeking digital revenue infrastructure."}&rdquo;
                </p>

                {/* Values & Probability */}
                <div className="bg-[#06080F]/90 p-3 rounded-xl border border-white/[0.04] space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#8C9BAE]">Deal Target:</span>
                    <strong className="text-emerald-400 font-serif">
                      {Number(lead.estimated_budget || lead.expected_value || 3500).toLocaleString()} AED
                    </strong>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#8C9BAE]">Decision Stage:</span>
                    <span className="text-cyan-300 font-medium">{lead.decision_stage || "EVALUATION"}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#8C9BAE]">Closing Probability:</span>
                    <span className="text-purple-300 font-bold">
                      {lead.revenue_probability ? `${Math.round(lead.revenue_probability * 100)}%` : "80%"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="space-y-2.5 pt-2 border-t border-[#D4AF37]/15">
                {/* 3 AI Closing Actions */}
                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  <button
                    onClick={() => handleQualifyLead(lead)}
                    disabled={isQualifying}
                    className="p-1.5 rounded-lg bg-[#06080F] hover:bg-[#0B101D] text-[#D4AF37] border border-[#D4AF37]/30 font-bold transition-all text-center truncate"
                    title="Score and classify lead with AI"
                  >
                    {isQualifying ? "..." : "⚡ Qualify"}
                  </button>

                  <button
                    onClick={() => {
                      setSelectedLeadForCloser(lead);
                      setShowCloserModal(true);
                    }}
                    className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-bold transition-all text-center truncate"
                    title="Open Discovery Questions & Objection Battlecards"
                  >
                    🎯 Closer
                  </button>

                  <button
                    onClick={() => {
                      setSelectedLeadForProposal(lead);
                      setShowProposalModal(true);
                    }}
                    className="p-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 font-bold transition-all text-center truncate"
                    title="Generate Custom Commercial Proposal"
                  >
                    📄 Proposal
                  </button>
                </div>

                {/* Stage Advancement Dropdown */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-[10px] text-[#8C9BAE]">Stage:</span>
                  <select
                    value={lead.pipeline_stage || "DISCOVERED"}
                    onChange={(e) => handlePipelineStageChange(lead.id, e.target.value)}
                    className="w-full bg-[#06080F] text-[#F9F6EE] text-xs rounded-lg px-2 py-1.5 border border-white/[0.08] focus:border-[#D4AF37] outline-none"
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
        <div className="p-12 text-center text-[#8C9BAE] text-xs space-y-3 bg-[#0B101D] rounded-2xl border border-[#D4AF37]/20">
          <p>No active pipeline leads tracked for this mission yet.</p>
          <button
            onClick={handleHunt}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#D4AF37] text-[#06080F]"
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
