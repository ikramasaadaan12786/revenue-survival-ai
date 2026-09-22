"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Search, 
  TrendingUp, 
  Sparkles, 
  Percent, 
  ShieldCheck, 
  Award, 
  Copy, 
  Check, 
  Send,
  Coins,
  Users,
  Layers,
  ArrowRight,
  Handshake,
  DollarSign,
  AlertTriangle,
  Flame,
  Radio
} from "lucide-react";
import { RealEstateDeal, SellerListing } from "@/types";
import { api } from "@/lib/api";

interface Props {
  missionId: number;
  onRefreshSummary: () => void;
}

export default function DubaiRealEstateView({ missionId, onRefreshSummary }: Props) {
  const [deals, setDeals] = useState<RealEstateDeal[]>([]);
  const [sellerListings, setSellerListings] = useState<SellerListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanningSellers, setScanningSellers] = useState(false);
  const [activeTab, setActiveTab] = useState<"seller-radar" | "distress" | "matchmaker" | "commission">("seller-radar");
  const [selectedArea, setSelectedArea] = useState("Downtown Dubai & Business Bay");
  const [matchResult, setMatchResult] = useState<any | null>(null);
  const [matching, setMatching] = useState(false);

  const fetchDealsAndSellers = async () => {
    try {
      setLoading(true);
      const [dealsData, sellersData] = await Promise.all([
        api.getRealEstateDeals(missionId),
        api.getSellerListings(missionId)
      ]);
      setDeals(dealsData);
      setSellerListings(sellersData);
    } catch (err) {
      console.error("Failed fetching real estate & seller data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealsAndSellers();
  }, [missionId]);

  const runRadarScan = async () => {
    try {
      setLoading(true);
      await api.scanRealEstateRadar(missionId, selectedArea);
      await fetchDealsAndSellers();
      onRefreshSummary();
    } catch (err) {
      console.error("Failed scanning real estate radar", err);
    } finally {
      setLoading(false);
    }
  };

  const handleScanSellers = async () => {
    try {
      setScanningSellers(true);
      await api.scanSellerListings(missionId);
      await fetchDealsAndSellers();
      onRefreshSummary();
    } catch (err) {
      console.error("Failed scanning seller pipeline", err);
    } finally {
      setScanningSellers(false);
    }
  };

  const handleRunMatchmaker = async () => {
    try {
      setMatching(true);
      const res = await api.runMatchmaker(missionId);
      setMatchResult(res);
      onRefreshSummary();
    } catch (err) {
      console.error("Failed running matchmaker", err);
    } finally {
      setMatching(false);
    }
  };

  const totalCommissionPool = deals.reduce((acc, curr) => acc + (curr.commission_amount || 0), 0) +
    sellerListings.reduce((acc, curr) => acc + (curr.commission_potential || (curr.distress_price * 0.02) || 0), 0);

  const getMotivationBadge = (tier: string) => {
    switch (tier) {
      case "CRITICAL_EXIT":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">CRITICAL EXIT</span>;
      case "HIGH_MOTIVATION":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">HIGH MOTIVATION</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/40">STANDARD</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-[#17120a] via-[#121019] to-[#090d16] p-6 md:p-8 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                SELLER INTELLIGENCE MODULE
              </span>
              <span className="text-xs font-mono text-slate-400">
                Distress Signal Detection • Urgency Scoring • 2% Commission Matrix
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Building2 className="w-7 h-7 text-amber-400" />
              Seller Radar & Dubai Real Estate Engine
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              Detects urgent off-plan balloon exits, calculates buyer equity cushions, and structures 2% broker commission mandates.
            </p>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-2xl border border-amber-500/30 text-right">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Total 2% Commission Pool</div>
            <div className="text-2xl font-black text-amber-300 font-mono">
              {totalCommissionPool.toLocaleString()} <span className="text-xs text-slate-400 font-normal">AED</span>
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-0.5">DLD Escrow & Title Screened</div>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/[0.08]">
          <button
            onClick={() => setActiveTab("seller-radar")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
              activeTab === "seller-radar"
                ? "bg-amber-500 text-black shadow-glow font-bold"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Seller Radar ({sellerListings.length})
          </button>
          <button
            onClick={() => setActiveTab("distress")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
              activeTab === "distress"
                ? "bg-amber-500 text-black shadow-glow font-bold"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Distress Inventory ({deals.length})
          </button>
          <button
            onClick={() => setActiveTab("matchmaker")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
              activeTab === "matchmaker"
                ? "bg-amber-500 text-black shadow-glow font-bold"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
            }`}
          >
            AI Matchmaker
          </button>
          <button
            onClick={() => setActiveTab("commission")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
              activeTab === "commission"
                ? "bg-amber-500 text-black shadow-glow font-bold"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Commission Ledger
          </button>
        </div>
      </div>

      {/* Tab 0: Seller Radar Panel (Live Distress Pipeline) */}
      {activeTab === "seller-radar" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60 p-4 rounded-xl border border-amber-500/20">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-white uppercase">
                Active Seller Distress Pipeline ({sellerListings.length} deals tracked)
              </span>
            </div>

            <button
              onClick={handleScanSellers}
              disabled={scanningSellers}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-glow disabled:opacity-50"
            >
              <Search className={`w-3.5 h-3.5 ${scanningSellers ? "animate-spin" : ""}`} />
              {scanningSellers ? "Scanning Sellers..." : "Scan Seller Distress Radar"}
            </button>
          </div>

          {sellerListings.length === 0 ? (
            <div className="glass-panel p-12 text-center text-slate-400 font-mono text-xs">
              No seller distress listings found. Click "Scan Seller Distress Radar" to detect motivated seller opportunities.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sellerListings.map((seller) => (
                <div
                  key={seller.id}
                  className="glass-panel p-5 glass-panel-hover flex flex-col justify-between space-y-4 border-t-2 border-t-amber-400 border border-white/[0.08]"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-amber-500/20">
                          {seller.location}
                        </span>
                        <h4 className="text-base font-bold text-white mt-1 leading-snug">{seller.project_name}</h4>
                        <div className="text-xs text-slate-400 font-mono">{seller.seller_name}</div>
                      </div>
                      {getMotivationBadge(seller.motivation_tier)}
                    </div>

                    <div className="bg-slate-950/80 p-3 rounded-xl border border-white/[0.05] space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Original Price:</span>
                        <span className="text-slate-400 line-through">{seller.original_price?.toLocaleString()} AED</span>
                      </div>
                      <div className="flex justify-between text-amber-300 font-bold">
                        <span>Distress Price:</span>
                        <span>{seller.distress_price?.toLocaleString()} AED</span>
                      </div>
                      <div className="flex justify-between text-emerald-400">
                        <span>Discount / Equity Cushion:</span>
                        <span>-{seller.discount_pct}% ({seller.equity_cushion_aed?.toLocaleString()} AED)</span>
                      </div>
                      <div className="flex justify-between text-cyan-400 font-bold pt-1 border-t border-white/[0.05]">
                        <span>Urgency Score:</span>
                        <span>{seller.urgency_score}/100</span>
                      </div>
                    </div>

                    {seller.reason && (
                      <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/50 p-2.5 rounded-lg border border-white/[0.04]">
                        <strong className="text-amber-400 font-mono text-[11px]">Distress Trigger:</strong> {seller.reason}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-400 font-bold">
                      +{(seller.distress_price * 0.02).toLocaleString()} AED Commission
                    </span>
                    <span className="text-amber-300 font-semibold cursor-pointer hover:underline flex items-center gap-1">
                      Match Buyer <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 1: Distress Inventory Radar */}
      {activeTab === "distress" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="bg-slate-950 text-xs text-slate-200 font-mono px-3 py-2 rounded-xl border border-white/[0.1] focus:outline-none focus:border-amber-400"
              >
                <option value="Downtown Dubai & Business Bay">Downtown & Business Bay</option>
                <option value="Dubai Marina & Palm Jumeirah">Dubai Marina & Palm Jumeirah</option>
                <option value="Jumeirah Village Circle (JVC)">Jumeirah Village Circle (JVC)</option>
                <option value="Dubai Hills & MBR City">Dubai Hills & MBR City</option>
              </select>
              <button
                onClick={runRadarScan}
                disabled={loading}
                className="px-3.5 py-2 rounded-xl text-xs font-bold font-mono bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40"
              >
                {loading ? "Scanning..." : "Scan Area"}
              </button>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Standard UAE 2.0% Commission Calculated on all units
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {deals.map((deal, idx) => (
              <div
                key={deal.id || idx}
                className="glass-panel p-6 glass-panel-hover flex flex-col justify-between space-y-4 border-t-2 border-t-amber-400"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {deal.location}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1.5 leading-snug">{deal.title}</h3>
                      <div className="text-xs text-slate-400 font-mono">Dev: {deal.developer}</div>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2 py-1 rounded-lg border border-emerald-500/30">
                      {deal.projected_net_roi} Net
                    </span>
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-xl border border-white/[0.05] space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Deal Price:</span>
                      <span className="text-amber-300 font-bold text-sm">
                        {deal.deal_price?.toLocaleString()} AED
                      </span>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span>2% Broker Commission:</span>
                      <span className="font-bold">{deal.commission_amount?.toLocaleString()} AED</span>
                    </div>
                  </div>

                  <div className="text-xs space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Target Buyer Match:</span>
                    <p className="text-slate-300 text-xs">{deal.buyer_profile_match}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">{deal.contact_name || "Seller Direct"}</span>
                  <span className="text-amber-400 font-semibold cursor-pointer hover:underline">
                    Match with Buyer →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: AI Investor Matchmaker */}
      {activeTab === "matchmaker" && (
        <div className="glass-panel p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Handshake className="w-5 h-5 text-amber-400" />
                AI Buyer-Seller Matchmaking Engine
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Cross-references active buyer intent profiles against off-market seller allocations
              </p>
            </div>

            <button
              onClick={handleRunMatchmaker}
              disabled={matching}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-glow transition-all"
            >
              <Sparkles className={`w-3.5 h-3.5 ${matching ? "animate-spin" : ""}`} />
              {matching ? "CALCULATING MATCHES..." : "RUN AI MATCHMAKER"}
            </button>
          </div>

          {matchResult ? (
            <div className="bg-slate-950/80 p-6 rounded-2xl border border-amber-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-bold text-sm">
                    {matchResult.match_score}%
                  </span>
                  <div>
                    <div className="text-xs font-mono text-slate-400">Top Matchmaking Candidate</div>
                    <h4 className="text-base font-bold text-white">{matchResult.buyer_name}</h4>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Projected 2% Commission</div>
                  <div className="text-xl font-black text-emerald-400 font-mono">
                    {matchResult.projected_commission_aed?.toLocaleString()} AED
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-white/[0.05] space-y-2 text-xs font-mono">
                <div className="text-slate-300">
                  <strong className="text-amber-400">Allocated Property:</strong> {matchResult.matched_deal}
                </div>
                <div className="text-slate-300">
                  <strong className="text-cyan-400">Total Transaction Value:</strong>{" "}
                  {matchResult.deal_value_aed?.toLocaleString()} AED
                </div>
                <p className="text-slate-200 text-xs font-sans mt-2 pt-2 border-t border-white/[0.04]">
                  {matchResult.match_reason}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-slate-400 font-mono">
              Click "Run AI Matchmaker" to synthesize buyer preferences with verified seller inventory.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Commission Tracker */}
      {activeTab === "commission" && (
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              Real Estate Broker Commission Ledger ({deals.length + sellerListings.length} deals)
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              Potential: {totalCommissionPool.toLocaleString()} AED
            </span>
          </div>

          <div className="space-y-3">
            {sellerListings.map((seller) => (
              <div
                key={`seller-${seller.id}`}
                className="bg-slate-900/80 p-4 rounded-xl border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-white">{seller.project_name} (Distress Resale)</h4>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {seller.location} • Deal Value: {seller.distress_price?.toLocaleString()} AED • Discount: -{seller.discount_pct}%
                  </div>
                </div>

                <div className="text-right flex items-center gap-4">
                  <div>
                    <div className="text-[10px] font-mono text-slate-400">Standard 2% Fee</div>
                    <div className="text-sm font-black text-emerald-400 font-mono">
                      +{(seller.distress_price * 0.02).toLocaleString()} AED
                    </div>
                  </div>
                  {getMotivationBadge(seller.motivation_tier)}
                </div>
              </div>
            ))}

            {deals.map((deal) => (
              <div
                key={`deal-${deal.id}`}
                className="bg-slate-900/80 p-4 rounded-xl border border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-white">{deal.title}</h4>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {deal.location} • Deal Value: {deal.deal_price?.toLocaleString()} AED
                  </div>
                </div>

                <div className="text-right flex items-center gap-4">
                  <div>
                    <div className="text-[10px] font-mono text-slate-400">Standard 2% Fee</div>
                    <div className="text-sm font-black text-emerald-400 font-mono">
                      +{deal.commission_amount?.toLocaleString()} AED
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    {deal.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

