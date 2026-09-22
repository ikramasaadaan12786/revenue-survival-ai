"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  DollarSign, 
  FileText, 
  HelpCircle, 
  Target, 
  Send, 
  Copy, 
  Check, 
  Layers,
  Zap
} from "lucide-react";
import { Offer } from "@/types";
import { api } from "@/lib/api";

interface Props {
  missionId: number;
  onRefreshSummary: () => void;
}

export default function OfferStudioView({ missionId, onRefreshSummary }: Props) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const data = await api.getOffers(missionId);
      setOffers(data);
    } catch (err) {
      console.error("Failed to fetch offers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [missionId]);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      await api.generateOffer(missionId);
      await fetchOffers();
      onRefreshSummary();
    } catch (err) {
      console.error("Failed to generate offer", err);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Offer Creator Studio (Offer Creator Agent)
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Converts researched opportunities into high-converting commercial offers, sales copy & landing blueprints
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-400 hover:bg-cyan-300 text-black font-mono transition-all shadow-glow disabled:opacity-50"
        >
          <Zap className={`w-3.5 h-3.5 ${generating ? "animate-spin" : "fill-black"}`} />
          {generating ? "CRAFTING NEW OFFER..." : "GENERATE HIGH-CONVERTING OFFER"}
        </button>
      </div>

      {/* Offers List */}
      {offers.length === 0 && !loading ? (
        <div className="glass-panel p-12 text-center text-slate-400">
          <p>No offers generated yet. Click "Generate High-Converting Offer" to let the AI build your commercial package.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {offers.map((offer) => (
            <div key={offer.id} className="glass-panel p-6 md:p-8 space-y-6">
              {/* Top Details */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 uppercase">
                      Status: {offer.status}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Target: <strong className="text-slate-200">{offer.target_audience}</strong>
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight">{offer.product_name}</h3>
                  <p className="text-sm text-slate-300">{offer.description}</p>
                </div>

                <div className="bg-slate-900/90 p-4 rounded-2xl border border-cyan-500/30 text-right">
                  <div className="text-[11px] font-mono text-slate-400 uppercase">Price Point</div>
                  <div className="text-2xl font-black text-cyan-400 font-mono">
                    {offer.pricing} <span className="text-xs text-slate-400">{offer.currency}</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono mt-0.5">High Conversion Margin</div>
                </div>
              </div>

              {/* Grid: Copy Blueprint & Sales Hook */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Landing Page Copy */}
                <div className="bg-slate-950/70 p-5 rounded-2xl border border-white/[0.06] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-cyan-400 uppercase font-bold flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      Landing Page Copy Blueprint
                    </span>
                    <button
                      onClick={() => copyToClipboard(offer.landing_page_copy || "", `landing-${offer.id}`)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {copiedId === `landing-${offer.id}` ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="text-xs text-slate-300 whitespace-pre-wrap font-sans bg-slate-900/60 p-3.5 rounded-xl border border-white/[0.04] leading-relaxed">
                    {offer.landing_page_copy || "No copy specified."}
                  </div>
                </div>

                {/* Direct Sales Outreach Hook */}
                <div className="bg-slate-950/70 p-5 rounded-2xl border border-white/[0.06] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-amber-400 uppercase font-bold flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5" />
                      Direct WhatsApp / Email Hook
                    </span>
                    <button
                      onClick={() => copyToClipboard(offer.sales_message || "", `sales-${offer.id}`)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {copiedId === `sales-${offer.id}` ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="text-xs text-slate-300 whitespace-pre-wrap font-sans bg-slate-900/60 p-3.5 rounded-xl border border-white/[0.04] leading-relaxed">
                    {offer.sales_message || "No sales message specified."}
                  </div>
                </div>
              </div>

              {/* FAQs Section */}
              {offer.faq && offer.faq.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-mono text-slate-400 uppercase flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                    Objection Handling FAQs:
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {offer.faq.map((item, idx) => (
                      <div key={idx} className="bg-slate-900/60 p-3.5 rounded-xl border border-white/[0.05] text-xs">
                        <div className="font-semibold text-white mb-1">Q: {item.question}</div>
                        <div className="text-slate-300 leading-relaxed">A: {item.answer}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
