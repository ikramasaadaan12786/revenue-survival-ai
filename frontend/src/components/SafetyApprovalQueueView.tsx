"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Send, 
  Check, 
  X, 
  Edit3, 
  Sparkles, 
  MessageSquare, 
  CheckCheck, 
  Mail, 
  Globe,
  AlertTriangle,
  Bot,
  Layers,
  Clock,
  Flame,
  ArrowRight,
  Filter
} from "lucide-react";
import { Communication, OutreachPipelineItem } from "@/types";
import { api } from "@/lib/api";

interface Props {
  missionId: number;
  onRefreshSummary: () => void;
}

export default function SafetyApprovalQueueView({ missionId, onRefreshSummary }: Props) {
  const [comms, setComms] = useState<Communication[]>([]);
  const [pipeline, setPipeline] = useState<OutreachPipelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafting, setDrafting] = useState(false);
  const [launchingCampaign, setLaunchingCampaign] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState<string>("Hot");
  const [customAngle, setCustomAngle] = useState<string>("");
  const [activeSubTab, setActiveSubTab] = useState<"approvals" | "campaign-builder" | "followup-matrix" | "communication-providers">("approvals");
  const [editingComm, setEditingComm] = useState<Communication | null>(null);
  const [editText, setEditText] = useState("");
  const [simulatingCommId, setSimulatingCommId] = useState<number | null>(null);
  const [simulateMessage, setSimulateMessage] = useState("");
  const [webhookSender, setWebhookSender] = useState("+971501234567");
  const [webhookText, setWebhookText] = useState("Salam, I want to book a viewing for the Marina Gate unit today.");
  const [webhookProvider, setWebhookProvider] = useState("WHATSAPP");
  const [webhookResult, setWebhookResult] = useState<any>(null);
  const [sendingWebhook, setSendingWebhook] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [commsData, pipeData] = await Promise.all([
        api.getCommunications(missionId),
        api.getOutreachPipeline(missionId)
      ]);
      setComms(commsData);
      setPipeline(pipeData.pipeline || []);
    } catch (err) {
      console.error("Failed fetching communications and pipeline", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [missionId]);

  const handleSendInboundWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookText.trim()) return;
    try {
      setSendingWebhook(true);
      const res = await api.sendInboundWebhook(webhookProvider.toLowerCase(), {
        sender: webhookSender,
        message: webhookText
      });
      setWebhookResult(res);
      await fetchData();
      onRefreshSummary();
    } catch (err) {
      console.error("Failed sending inbound webhook", err);
    } finally {
      setSendingWebhook(false);
    }
  };

  const handleLaunchCampaign = async () => {
    try {
      setLaunchingCampaign(true);
      await api.createOutreachCampaign({
        mission_id: missionId,
        target_intent: selectedIntent === "ALL" ? undefined : selectedIntent,
        custom_pitch_angle: customAngle || undefined
      });
      await fetchData();
      onRefreshSummary();
      setActiveSubTab("approvals");
    } catch (err) {
      console.error("Failed launching campaign", err);
    } finally {
      setLaunchingCampaign(false);
    }
  };

  const handleDraftOutreach = async () => {
    try {
      setDrafting(true);
      await api.draftOutreach(missionId);
      await fetchData();
      onRefreshSummary();
    } catch (err) {
      console.error("Failed drafting outreach", err);
    } finally {
      setDrafting(false);
    }
  };

  const handleReview = async (commId: number, status: string, modifiedBody?: string) => {
    try {
      await api.reviewCommunication(commId, status, modifiedBody);
      setEditingComm(null);
      await fetchData();
      onRefreshSummary();
    } catch (err) {
      console.error("Failed reviewing communication", err);
    }
  };

  const handleBatchApprove = async () => {
    try {
      await api.batchApprove(missionId);
      await fetchData();
      onRefreshSummary();
    } catch (err) {
      console.error("Failed batch approving", err);
    }
  };

  const handleSimulateReply = async (commId: number) => {
    if (!simulateMessage.trim()) return;
    try {
      await api.simulateReply(commId, simulateMessage);
      setSimulatingCommId(null);
      setSimulateMessage("");
      await fetchData();
      onRefreshSummary();
    } catch (err) {
      console.error("Failed simulating reply", err);
    }
  };

  const pendingComms = comms.filter((c) => c.approval_status === "PENDING");
  const processedComms = comms.filter((c) => c.approval_status !== "PENDING");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Live Communication Layer & Safety Queue
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Meta WhatsApp Cloud API • Twilio Fallback • SendGrid Gateway • Inbound Webhook Reply Routing
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {pendingComms.length > 0 && (
            <button
              onClick={handleBatchApprove}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-mono transition-all"
            >
              <CheckCheck className="w-4 h-4" />
              Batch Approve All ({pendingComms.length})
            </button>
          )}

          <button
            onClick={() => setActiveSubTab("communication-providers")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-mono transition-all"
          >
            <Bot className="w-3.5 h-3.5" />
            Providers & Webhooks
          </button>

          <button
            onClick={() => setActiveSubTab("campaign-builder")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-mono transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Campaign Builder
          </button>

          <button
            onClick={handleDraftOutreach}
            disabled={drafting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-black shadow-glow font-mono transition-all disabled:opacity-50"
          >
            <Send className={`w-3.5 h-3.5 fill-black ${drafting ? "animate-spin" : ""}`} />
            {drafting ? "Drafting..." : "Draft Outreach Batch"}
          </button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.08] pb-2 font-mono text-xs">
        <button
          onClick={() => setActiveSubTab("approvals")}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${
            activeSubTab === "approvals"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Pending Approvals ({pendingComms.length})
        </button>
        <button
          onClick={() => setActiveSubTab("communication-providers")}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${
            activeSubTab === "communication-providers"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Live Providers & Inbound Webhooks
        </button>
        <button
          onClick={() => setActiveSubTab("campaign-builder")}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${
            activeSubTab === "campaign-builder"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Campaign Generator
        </button>
        <button
          onClick={() => setActiveSubTab("followup-matrix")}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${
            activeSubTab === "followup-matrix"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          3-Step Cadence Matrix ({pipeline.length} leads)
        </button>
      </div>

      {/* SubTab: Live Communication Providers & Webhooks */}
      {activeSubTab === "communication-providers" && (
        <div className="space-y-6">
          {/* Provider Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-panel p-5 border border-emerald-500/30 bg-[#091512]/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp Business API
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  PRIMARY
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Meta Cloud Graph API v19.0. Direct template messaging with instant delivery receipts.
              </p>
              <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-white/[0.05] flex justify-between">
                <span>Mode: Cloud Native</span>
                <span className="text-emerald-400 font-bold">Status: Ready</span>
              </div>
            </div>

            <div className="glass-panel p-5 border border-cyan-500/30 bg-[#09121c]/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                  <Bot className="w-4 h-4" />
                  Twilio SMS / WhatsApp
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  FALLBACK
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Automated fallback channel for unverified numbers, international SMS, and rate-limit spikes.
              </p>
              <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-white/[0.05] flex justify-between">
                <span>Routing: Automatic</span>
                <span className="text-cyan-400 font-bold">Status: Standby</span>
              </div>
            </div>

            <div className="glass-panel p-5 border border-indigo-500/30 bg-[#0c0e21]/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  SendGrid Email Gateway
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  EXECUTIVE
                </span>
              </div>
              <p className="text-xs text-slate-300">
                HTML executive dossiers, investor memos, and Golden Visa private advisory briefs.
              </p>
              <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-white/[0.05] flex justify-between">
                <span>From: deals@revenuesurvival.ai</span>
                <span className="text-indigo-400 font-bold">Status: Ready</span>
              </div>
            </div>
          </div>

          {/* Inbound Webhook Simulator */}
          <div className="glass-panel p-6 border border-white/[0.08] bg-[#0c101d]/90 space-y-4">
            <div className="flex items-center gap-3 border-b border-white/[0.06] pb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Live Inbound Webhook Simulator</h3>
                <p className="text-xs text-slate-400 font-mono">
                  Test live customer reply routing, CRM pipeline stage advancement, and AI Sales Assistant analysis.
                </p>
              </div>
            </div>

            <form onSubmit={handleSendInboundWebhook} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400">Provider</label>
                <select
                  value={webhookProvider}
                  onChange={(e) => setWebhookProvider(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-slate-200"
                >
                  <option value="WHATSAPP">WhatsApp Business</option>
                  <option value="TWILIO">Twilio SMS</option>
                  <option value="EMAIL">SendGrid Email</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400">Sender Phone / Email</label>
                <input
                  type="text"
                  value={webhookSender}
                  onChange={(e) => setWebhookSender(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-slate-200"
                  placeholder="+971501234567"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-[11px] font-mono text-slate-400">Incoming Message Text</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={webhookText}
                    onChange={(e) => setWebhookText(e.target.value)}
                    className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-slate-200"
                    placeholder="Type prospect message..."
                  />
                  <button
                    type="submit"
                    disabled={sendingWebhook}
                    className="px-4 py-2 rounded-lg text-xs font-mono font-bold bg-emerald-400 hover:bg-emerald-300 text-black whitespace-nowrap disabled:opacity-50"
                  >
                    {sendingWebhook ? "Triggering..." : "Simulate Inbound"}
                  </button>
                </div>
              </div>
            </form>

            {webhookResult && (
              <div className="mt-3 p-3 bg-slate-950/80 rounded-lg border border-emerald-500/30 text-xs font-mono space-y-1">
                <span className="text-emerald-400 font-bold">✓ Webhook Processed Successfully</span>
                <p className="text-slate-300">Matched Lead: <span className="text-white font-bold">{webhookResult.matched_lead_name}</span></p>
                <p className="text-slate-400">AI Sales Response: <span className="text-cyan-300">{webhookResult.ai_sales_analysis}</span></p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SubTab 1: Campaign Builder Panel */}
      {activeSubTab === "campaign-builder" && (
        <div className="glass-panel p-6 border border-amber-500/30 bg-[#0c101d]/90 space-y-5">
          <div className="flex items-center gap-3 border-b border-white/[0.06] pb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Outreach Automation Campaign Generator</h3>
              <p className="text-xs text-slate-400 font-mono">
                Automatically builds 3-step personalized sequences (Initial Pitch, T+24h Value Drop, T+48h Scarcity Close)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-300 mb-1">Target Lead Intent Segment</label>
              <select
                value={selectedIntent}
                onChange={(e) => setSelectedIntent(e.target.value)}
                className="w-full bg-slate-900 border border-white/[0.1] rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-400 outline-none"
              >
                <option value="Hot">Hot Intent (Liquid Cash / Immediate Horizon)</option>
                <option value="Qualified">Qualified Intent (Verified Budget & Area)</option>
                <option value="Warm">Warm Inquiries (General Questions)</option>
                <option value="ALL">All Active CRM Leads</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Custom Positioning Angle (Optional)</label>
              <input
                type="text"
                value={customAngle}
                onChange={(e) => setCustomAngle(e.target.value)}
                placeholder="e.g. 8.8% Net Yield + Escrow Direct Resale Waiver"
                className="w-full bg-slate-900 border border-white/[0.1] rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-400 outline-none"
              />
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-white/[0.05] space-y-2 text-xs font-mono text-slate-300">
            <div className="font-bold text-cyan-400">Automated 3-Step Sequence Structure:</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="bg-slate-900/80 p-3 rounded-lg border border-white/[0.04] space-y-1">
                <span className="text-amber-300 font-bold">Step 1 (T+0):</span>
                <p className="text-[11px] text-slate-400 font-sans">Curated off-market distress brief + 1-page financial teardown offer.</p>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-white/[0.04] space-y-1">
                <span className="text-cyan-300 font-bold">Step 2 (T+24h):</span>
                <p className="text-[11px] text-slate-400 font-sans">Developer fee waiver update & net yield forecast sheet.</p>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-white/[0.04] space-y-1">
                <span className="text-rose-300 font-bold">Step 3 (T+48h):</span>
                <p className="text-[11px] text-slate-400 font-sans">Final allocation scarcity close & direct calendar briefing link.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleLaunchCampaign}
              disabled={launchingCampaign}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold font-mono bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-glow disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 fill-black ${launchingCampaign ? "animate-spin" : ""}`} />
              {launchingCampaign ? "Generating Campaign..." : "Generate & Stage Campaign Sequences"}
            </button>
          </div>
        </div>
      )}

      {/* SubTab 2: Follow-up Cadence Matrix */}
      {activeSubTab === "followup-matrix" && (
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
              <Layers className="w-4 h-4 text-cyan-400" />
              Lead Follow-Up Sequence Matrix ({pipeline.length} Leads)
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Stages: Draft → Staged → Approved → Sent → Replied
            </span>
          </div>

          {pipeline.length === 0 ? (
            <div className="py-8 text-center text-slate-500 font-mono text-xs">
              No follow-up sequences staged. Launch a campaign to initialize sequences.
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {pipeline.map((item) => (
                <div key={item.lead_id} className="bg-slate-900/70 p-4 rounded-xl border border-white/[0.06] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.lead_name}</h4>
                      <span className="text-[11px] font-mono text-slate-400">
                        {item.lead_country} • {item.channel} • Intent: <strong className="text-cyan-400">{item.intent_score}</strong>
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-amber-500/20">
                      CRM: {item.crm_status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {item.steps.map((st) => (
                      <div
                        key={st.id}
                        className={`p-2.5 rounded-lg border text-[11px] font-mono space-y-1 ${
                          st.approval_status === "APPROVED"
                            ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
                            : "bg-slate-950/60 border-white/[0.05] text-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold">Step {st.step}: {st.type}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800">{st.approval_status}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-sans line-clamp-2">{st.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Approvals Queue View */}
      {activeSubTab === "approvals" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Pending Operator Review ({pendingComms.length})
            </span>
          </div>

          {pendingComms.length === 0 ? (
            <div className="glass-panel p-8 text-center text-slate-400 text-xs font-mono">
              All outbound sequences have been reviewed. Queue is clear.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingComms.map((comm) => (
                <div
                  key={comm.id}
                  className="glass-panel p-6 border-l-4 border-l-amber-400 space-y-4 bg-slate-900/70"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-white/[0.05]">
                        {comm.channel}
                      </span>
                      <span className="text-xs font-mono text-slate-300">
                        Type: <strong className="text-white">{comm.message_type}</strong>
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-amber-400 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      ACTION REQUIRED
                    </span>
                  </div>

                  {comm.subject && (
                    <div className="text-xs font-semibold text-white font-mono">
                      Subject: {comm.subject}
                    </div>
                  )}

                  {editingComm?.id === comm.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={5}
                        className="w-full bg-slate-950 text-slate-100 text-xs p-3 rounded-xl border border-cyan-500/50 font-mono focus:outline-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingComm(null)}
                          className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReview(comm.id, "APPROVED", editText)}
                          className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-cyan-400 text-black hover:bg-cyan-300"
                        >
                          Save & Approve
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-200 whitespace-pre-wrap bg-slate-950/70 p-4 rounded-xl border border-white/[0.05] leading-relaxed font-sans">
                      {comm.body}
                    </div>
                  )}

                  {/* Actions */}
                  {editingComm?.id !== comm.id && (
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        onClick={() => {
                          setEditingComm(comm);
                          setEditText(comm.body);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:bg-slate-800 border border-slate-700"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                        Edit Copy
                      </button>

                      <button
                        onClick={() => handleReview(comm.id, "REJECTED")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-rose-400 hover:bg-rose-500/10 border border-rose-500/30"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject
                      </button>

                      <button
                        onClick={() => handleReview(comm.id, "APPROVED")}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-glow"
                      >
                        <Check className="w-4 h-4" />
                        Approve & Dispatch
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dispatched / Historical Outreach Section */}
      <div className="space-y-4 pt-6">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          Dispatched Sequences & Live Response Tracker ({processedComms.length})
        </span>

        <div className="space-y-3">
          {processedComms.map((comm) => (
            <div key={comm.id} className="glass-panel p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400">{comm.channel}</span>
                  <span>•</span>
                  <span className="text-slate-300 font-bold">{comm.subject || comm.message_type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      comm.delivery_status === "REPLIED"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
                        : "bg-slate-800 text-slate-400 border border-white/[0.05]"
                    }`}
                  >
                    {comm.delivery_status}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-300 bg-slate-950/40 p-3 rounded-lg border border-white/[0.04] whitespace-pre-wrap">
                {comm.body}
              </div>

              {/* Response received from customer */}
              {comm.response_received && (
                <div className="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-lg space-y-1">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    Prospect Response Received:
                  </span>
                  <p className="text-xs text-emerald-200 font-sans">{comm.response_received}</p>
                </div>
              )}

              {/* Simulate Response Button */}
              {!comm.response_received && (
                <div className="pt-2">
                  {simulatingCommId === comm.id ? (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Type simulated prospect objection/inquiry..."
                        value={simulateMessage}
                        onChange={(e) => setSimulateMessage(e.target.value)}
                        className="flex-1 bg-slate-950 text-xs px-3 py-1.5 rounded-lg border border-cyan-500/40 text-slate-100 font-mono focus:outline-none"
                      />
                      <button
                        onClick={() => handleSimulateReply(comm.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-cyan-400 text-black hover:bg-cyan-300"
                      >
                        Send Reply
                      </button>
                      <button
                        onClick={() => setSimulatingCommId(null)}
                        className="px-2 py-1.5 text-xs text-slate-400 font-mono"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSimulatingCommId(comm.id);
                        setSimulateMessage("Hi, yes definitely send it over! Are these units already under escrow?");
                      }}
                      className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <Bot className="w-3 h-3" />
                      Simulate Prospect Reply (Test Sales Agent & Conversion Pivot)
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

