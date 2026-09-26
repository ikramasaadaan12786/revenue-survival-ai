'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  ExternalLink,
  MessageSquare,
  Copy,
  Check,
  Download,
  Clock,
  ArrowRight,
  ShieldCheck,
  X,
  Send,
  FileText
} from 'lucide-react';
import { Linkedin } from '@/components/luxury/LinkedInIcon';
import { api, getApiBase } from '@/lib/api';


interface TodaysLeadsViewProps {
  missionId?: number;
  initialFilter?: string;
  onNavigateTab: (tab: string) => void;
}

export const TodaysLeadsView: React.FC<TodaysLeadsViewProps> = ({
  missionId,
  initialFilter = 'all',
  onNavigateTab,
}) => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(initialFilter);
  const [activeLead, setActiveLead] = useState<any | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await api.getLeads(missionId || 1013);
      // Filter strictly genuine sales leads (exclude JOB_VACANCY, RESEARCH_SIGNAL, DUPLICATE, BLOG_ARTICLE, SELLER_PROMO)
      const genuineLeads = (data || []).filter(
        (l: any) =>
          !['JOB_VACANCY', 'RESEARCH_SIGNAL', 'DUPLICATE', 'REJECTED', 'BLOG_ARTICLE', 'SELLER_PROMO'].includes(
            l.classification
          )
      );
      setLeads(genuineLeads);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [missionId]);

  useEffect(() => {
    if (initialFilter) setSelectedFilter(initialFilter);
  }, [initialFilter]);

  const handleCopy = (text: string, fieldKey: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Helper extraction
  const getEmail = (l: any) => {
    const combined = `${l.contact_info || ''} ${l.notes || ''}`;
    const m = combined.match(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/);
    return m ? m[0].toLowerCase() : '';
  };

  const getPhone = (l: any) => {
    const combined = `${l.contact_info || ''} ${l.notes || ''}`;
    const m = combined.match(/(\+?[0-9]{1,4}[\s\-]?[0-9]{2,4}[\s\-]?[0-9]{3,4}[\s\-]?[0-9]{3,6})/);
    return m ? m[0].trim() : '';
  };

  const getLinkedIn = (l: any) => {
    const combined = `${l.profile_url || ''} ${l.source_url || ''} ${l.contact_info || ''}`;
    const m = combined.match(/https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-_%]+\/?/i);
    return m ? m[0] : (l.profile_url && l.profile_url.includes('linkedin.com') ? l.profile_url : '');
  };

  // Filter leads
  const filteredLeads = leads.filter((l) => {
    const email = getEmail(l);
    const phone = getPhone(l);
    const linkedin = getLinkedIn(l);

    // Search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        (l.name || '').toLowerCase().includes(q) ||
        (l.company_name || '').toLowerCase().includes(q) ||
        (l.interest || '').toLowerCase().includes(q) ||
        email.includes(q) ||
        phone.includes(q);
      if (!match) return false;
    }

    // Tab filter
    if (selectedFilter === 'contact_ready') {
      return Boolean(email || phone);
    }
    if (selectedFilter === 'verified') {
      return l.verification_status === 'VERIFIED';
    }
    if (selectedFilter === 'needs_review') {
      return l.verification_status === 'NEEDS_REVIEW' || (!email && !phone);
    }
    if (selectedFilter === 'contacted') {
      return ['CONTACTED', 'REPLIED', 'MEETING', 'WON'].includes(l.status);
    }
    if (selectedFilter === 'replied') {
      return ['REPLIED', 'MEETING', 'WON'].includes(l.status);
    }

    return true;
  });

  const downloadExcelUrl = `${getApiBase()}/intelligence/daily-leads/download${
    missionId ? `?mission_id=${missionId}` : ''
  }`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#090D18] p-5 rounded-2xl border border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 uppercase tracking-wider">
              Central Sales CRM
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {filteredLeads.length} Genuine Buyer Records
            </span>
          </div>
          <h1 className="text-xl font-serif font-bold text-white mt-1">Today&apos;s Real Leads</h1>
          <p className="text-xs text-slate-400">
            Strictly authentic commercial buyers with verified requirements. Zero job vacancies or blog articles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={downloadExcelUrl}
            download
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-[#D4AF37]/20 text-slate-200 hover:text-[#D4AF37] border border-white/[0.08] text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Excel</span>
          </a>
        </div>
      </div>

      {/* 2. SEARCH & QUICK FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by buyer name, company, requirement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#090D18] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]/60 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: `All Leads (${leads.length})` },
            {
              id: 'contact_ready',
              label: `Contact Ready (${leads.filter((l) => getEmail(l) || getPhone(l)).length})`,
            },
            {
              id: 'needs_review',
              label: `Needs Review (${leads.filter((l) => l.verification_status === 'NEEDS_REVIEW' || (!getEmail(l) && !getPhone(l))).length})`,
            },
            {
              id: 'contacted',
              label: `Contacted (${leads.filter((l) => ['CONTACTED', 'REPLIED', 'MEETING', 'WON'].includes(l.status)).length})`,
            },
            {
              id: 'replied',
              label: `Replied (${leads.filter((l) => ['REPLIED', 'MEETING', 'WON'].includes(l.status)).length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedFilter === tab.id
                  ? 'bg-gradient-to-r from-[#D4AF37]/30 to-[#D4AF37]/10 text-[#F9F6EE] border border-[#D4AF37]/60 font-semibold shadow-[0_0_12px_rgba(212,175,55,0.15)]'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/[0.04]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. LEADS TABLE */}
      <div className="bg-[#090D18] rounded-2xl border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-slate-900/80 text-slate-400 text-[10px] uppercase font-mono tracking-wider">
                <th className="py-3 px-4">Name &amp; Role</th>
                <th className="py-3 px-4 min-w-[220px]">Requirement</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4">Outreach</th>
                <th className="py-3 px-4">Reply</th>
                <th className="py-3 px-4">Next Action</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Loading genuine buyer leads...
                  </td>
                </tr>
              ) : filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => {
                  const email = getEmail(lead);
                  const phone = getPhone(lead);
                  const linkedin = getLinkedIn(lead);

                  const isContactReady = Boolean(email || phone);
                  const isVerified = lead.verification_status === 'VERIFIED';
                  const isContacted = ['CONTACTED', 'REPLIED', 'MEETING', 'WON'].includes(lead.status);

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setActiveLead(lead)}
                      className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
                    >
                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white group-hover:text-[#D4AF37] transition-colors">
                          {lead.name || 'Commercial Prospect'}
                        </div>
                        <div className="text-[11px] text-slate-400">{lead.company_name || 'Direct Enterprise'}</div>
                      </td>

                      {/* Requirement */}
                      <td className="py-3.5 px-4 text-slate-300">
                        <p className="line-clamp-2 leading-relaxed">
                          {lead.interest || 'Active Commercial Requirement'}
                        </p>
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-white/[0.06]">
                          {lead.source_platform || lead.source || 'Direct'}
                        </span>
                      </td>

                      {/* Contact Coordinates */}
                      <td className="py-3.5 px-4">
                        {email ? (
                          <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[11px]">
                            <Mail className="w-3 h-3" />
                            <span className="truncate max-w-[130px]">{email}</span>
                          </div>
                        ) : phone ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
                            <Phone className="w-3 h-3" />
                            <span>{phone}</span>
                          </div>
                        ) : linkedin ? (
                          <div className="flex items-center gap-1.5 text-sky-400 font-mono text-[11px]">
                            <Linkedin className="w-3 h-3" />
                            <span>LinkedIn Profile</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">Requires Lookup</span>
                        )}
                      </td>

                      {/* Contact Method */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">
                        {email ? 'Direct Email' : phone ? 'WhatsApp / Call' : linkedin ? 'LinkedIn 1-on-1' : 'Manual'}
                      </td>

                      {/* Verification */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-400 text-[11px] font-medium">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Needs Review
                          </span>
                        )}
                      </td>

                      {/* Outreach */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isContacted ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                            CONTACTED
                          </span>
                        ) : isContactReady ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                            READY
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400">
                            UNSENT
                          </span>
                        )}
                      </td>

                      {/* Reply */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {lead.status === 'REPLIED' ? (
                          <span className="text-emerald-400 font-semibold text-[11px]">REPLIED</span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Next Action */}
                      <td className="py-3.5 px-4 text-slate-300 text-[11px] whitespace-nowrap">
                        {email
                          ? 'Approve & Send Email'
                          : linkedin
                          ? 'Send 1-on-1 Note'
                          : phone
                          ? 'WhatsApp Outreach'
                          : 'Review Coordinates'}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveLead(lead);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-[#D4AF37]/20 text-slate-200 hover:text-[#D4AF37] border border-white/[0.06] text-[11px] font-medium transition-colors"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No leads matching the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. COMPREHENSIVE LEAD DETAIL DRAWER / MODAL */}
      {activeLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm p-0 md:p-4">
          <div className="w-full max-w-2xl h-full md:h-[94vh] bg-[#0A0E1A] border-l md:border border-[#D4AF37]/30 rounded-none md:rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-white/[0.08] flex items-center justify-between bg-[#0C1222]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 font-mono">
                    LEAD #{activeLead.id}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {activeLead.classification || 'QUALIFIED_BUYER'}
                  </span>
                </div>
                <h2 className="text-lg font-serif font-bold text-white mt-1">
                  {activeLead.name || 'Commercial Prospect'}
                </h2>
                <p className="text-xs text-slate-400">{activeLead.company_name || 'Enterprise'}</p>
              </div>

              <button
                onClick={() => setActiveLead(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              {/* Full Requirement */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-white/[0.08]">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37] mb-1.5 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Full Commercial Requirement
                </h3>
                <p className="text-slate-200 leading-relaxed text-xs whitespace-pre-wrap">
                  {activeLead.interest || 'No detailed requirement provided.'}
                </p>
              </div>

              {/* Exact Buyer Evidence & Provenance */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-white/[0.08] space-y-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Exact Buyer Intent Evidence &amp; Provenance
                </h3>
                <div className="grid grid-cols-2 gap-3 text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Source Platform</span>
                    <p className="font-semibold text-white">{activeLead.source_platform || activeLead.source || 'Direct'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Discovered At</span>
                    <p className="font-mono text-slate-300">{activeLead.discovery_timestamp || 'Active Cycle'}</p>
                  </div>
                </div>

                {activeLead.source_url && (
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Original Source URL:</span>
                    <a
                      href={activeLead.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                    >
                      <span className="truncate max-w-[260px]">{activeLead.source_url}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </div>
                )}
              </div>

              {/* Contact Coordinates */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-white/[0.08] space-y-3">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Direct Contact Coordinates
                </h3>

                <div className="space-y-2">
                  {/* Email */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-cyan-400" />
                      <span className="text-slate-400">Email:</span>
                      <span className="font-mono text-white">
                        {getEmail(activeLead) || <span className="text-slate-500 italic">None found</span>}
                      </span>
                    </div>
                    {getEmail(activeLead) && (
                      <button
                        onClick={() => handleCopy(getEmail(activeLead), 'email')}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Copy Email"
                      >
                        {copiedField === 'email' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Phone / WhatsApp */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <span className="text-slate-400">Phone / WhatsApp:</span>
                      <span className="font-mono text-white">
                        {getPhone(activeLead) || <span className="text-slate-500 italic">None found</span>}
                      </span>
                    </div>
                    {getPhone(activeLead) && (
                      <button
                        onClick={() => handleCopy(getPhone(activeLead), 'phone')}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Copy Phone"
                      >
                        {copiedField === 'phone' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* LinkedIn */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <Linkedin className="w-4 h-4 text-sky-400" />
                      <span className="text-slate-400">LinkedIn Profile:</span>
                      <span className="font-mono text-white">
                        {getLinkedIn(activeLead) ? (
                          <a
                            href={getLinkedIn(activeLead)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-400 hover:underline flex items-center gap-1"
                          >
                            <span>Open Profile</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-500 italic">None</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes & Audit */}
              {activeLead.notes && (
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.06]">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Lead Notes &amp; History</span>
                  <p className="text-slate-300 text-xs mt-1 whitespace-pre-wrap">{activeLead.notes}</p>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-white/[0.08] bg-[#0C1222] flex items-center justify-between gap-3">
              <button
                onClick={() => setActiveLead(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {getEmail(activeLead) && (
                  <button
                    onClick={() => {
                      setActiveLead(null);
                      onNavigateTab('outreach_email');
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Open in Email Outreach</span>
                  </button>
                )}

                {getLinkedIn(activeLead) && (
                  <a
                    href={getLinkedIn(activeLead)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span>Open LinkedIn Profile</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
