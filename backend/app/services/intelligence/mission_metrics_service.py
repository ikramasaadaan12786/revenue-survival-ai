"""
Revenue Survival AI — Canonical Mission Metrics Service
Provides the single, authoritative source of truth for all mission and pipeline metrics.
Guarantees 100% mathematical consistency across:
- Dashboard Summary & Funnel APIs
- Daily Excel Intelligence Workbooks
- CEO & Operator Telemetry
- Reality & Survival Diagnostics

Strict Reality Rules:
- ZERO synthetic/fallback pricing (NO arbitrary AED 3,500).
- ZERO unearned DELIVERED statuses (delivery requires provider message proof).
- Segregates RESEARCH_SIGNAL, JOB_VACANCY, BLOG_ARTICLE, SELLER_PROMO from active sales funnel.
"""

import datetime
from typing import Dict, Any, List, Optional
from collections import defaultdict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import text
from app.models.entities import (
    Mission, Lead, Communication, Proposal, RevenueOpportunity, RevenueTracking, MarketSignal
)

class MissionMetricsService:
    """
    Authoritative single source of truth for Revenue Survival AI mission intelligence.
    """

    @classmethod
    def classify_lead_record(cls, lead: Lead) -> str:
        """
        Classifies a lead record into its strict forensic classification:
        - REAL_BUYER
        - NEEDS_REVIEW
        - RESEARCH_SIGNAL
        - JOB_VACANCY
        - BLOG_ARTICLE
        - SELLER_PROMO
        - DUPLICATE
        - REJECTED
        - ARCHIVED
        """
        st = (lead.status or "").upper()
        notes = (lead.notes or "").lower()
        interest = (lead.interest or "").lower()
        name = (lead.name or "").lower()
        contact = (lead.contact_info or "").lower()
        source_url = (lead.source_url or "").lower()

        # 1. Explicit duplicates
        if "duplicate" in st or "duplicate" in notes:
            return "DUPLICATE"

        # 2. Explicit job vacancies
        if "job_vacancy" in notes or "job vacancy" in notes or "hiring lead" in name or "jobicy" in source_url or "remoteok" in source_url:
            return "JOB_VACANCY"

        # 3. Blog articles / SEO content
        if "rfp guide" in notes or "how to write" in interest or "blog" in source_url or "article" in notes or "designrush" in source_url or "rfp.wiki" in source_url:
            return "BLOG_ARTICLE"

        # 4. Seller promotional posts
        if "seller_promo" in notes or "would you consider buying" in interest or "developer" in interest and "views" in interest and "amenities" in interest:
            return "SELLER_PROMO"

        # 5. Archived research signals
        if st in ["RESEARCH_SIGNAL", "RESEARCH_ONLY_JOB_SIGNAL", "QUARANTINED"]:
            return "RESEARCH_SIGNAL"

        # 6. Rejected
        if st in ["REJECTED", "CANCELLED"]:
            return "REJECTED"

        # 7. Unverified platform inquiries / Reddit commenters
        if "reddit" in (lead.source or "").lower() or "reddit" in contact or "reddit" in source_url:
            if "dubai apartment directly on sheikh zayed" in interest:
                return "SELLER_PROMO"
            return "NEEDS_REVIEW"

        # 8. Verified real buyers
        if lead.is_verified and lead.contact_info and ("@" in contact or "+" in contact):
            return "REAL_BUYER"

        if st in ["NEW", "AI_VERIFIED", "CONTACT_READY", "CONTACTED", "REPLIED", "MEETING", "DEAL", "COMMISSION"]:
            # Check if there is explicit buyer intent
            if any(w in interest for w in ["looking to buy", "seeking", "purchasing", "procure", "need developer", "need ai"]):
                return "NEEDS_REVIEW"
            return "RESEARCH_SIGNAL"

        return "RESEARCH_SIGNAL"

    @classmethod
    def determine_contactability(cls, lead: Lead) -> str:
        """
        Determines legitimate contact route:
        - DIRECT_CONTACT_READY (RFC email or direct phone/WhatsApp)
        - PLATFORM_ACTION_REQUIRED (Reddit native DM, LinkedIn message)
        - MANUAL_RESEARCH_REQUIRED (Missing contact coordinates)
        - NON_CONTACTABLE (Blog/Job/Archived)
        """
        contact = (lead.contact_info or "") + " " + (lead.notes or "")
        class_type = cls.classify_lead_record(lead)
        if class_type in ["JOB_VACANCY", "BLOG_ARTICLE", "SELLER_PROMO", "DUPLICATE", "REJECTED", "ARCHIVED"]:
            return "NON_CONTACTABLE"

        import re
        has_email = bool(re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", contact))
        has_phone = bool(re.search(r"(\+?[0-9]{1,4}[\s\-]?[0-9]{2,4}[\s\-]?[0-9]{3,4}[\s\-]?[0-9]{3,6})", contact))

        if has_email or has_phone:
            return "DIRECT_CONTACT_READY"

        if "reddit.com" in contact or "linkedin.com" in contact or "t.me" in contact:
            return "PLATFORM_ACTION_REQUIRED"

        return "MANUAL_RESEARCH_REQUIRED"

    @classmethod
    async def calculate_mission_metrics(
        cls,
        session: AsyncSession,
        mission_id: int
    ) -> Dict[str, Any]:
        """
        Computes canonical mission metrics from database rows.
        """
        mission = await session.get(Mission, mission_id)
        if not mission:
            return {}

        now = datetime.datetime.utcnow()
        hours_remaining = 0.0
        if mission.expires_at:
            diff = (mission.expires_at - now).total_seconds() / 3600.0
            hours_remaining = max(0.0, round(diff, 1))
        else:
            hours_remaining = float(mission.deadline_hours or 12.0)

        # Query all records
        leads_res = await session.execute(select(Lead).where(Lead.mission_id == mission_id).order_by(Lead.id.asc()))
        leads = leads_res.scalars().all()

        comms_res = await session.execute(select(Communication).where(Communication.mission_id == mission_id).order_by(Communication.id.asc()))
        comms = comms_res.scalars().all()

        props_res = await session.execute(select(Proposal).where(Proposal.mission_id == mission_id).order_by(Proposal.id.asc()))
        props = props_res.scalars().all()

        signals_res = await session.execute(select(MarketSignal).where(MarketSignal.mission_id == mission_id).order_by(MarketSignal.id.asc()))
        signals = signals_res.scalars().all()

        revs_res = await session.execute(select(RevenueTracking).where(RevenueTracking.mission_id == mission_id))
        revs = revs_res.scalars().all()

        # Classification counters
        classification_counts = defaultdict(int)
        contactability_counts = defaultdict(int)
        real_sales_leads = []
        research_and_archived_leads = []

        for l in leads:
            c_type = cls.classify_lead_record(l)
            classification_counts[c_type] += 1
            
            c_route = cls.determine_contactability(l)
            contactability_counts[c_route] += 1

            if c_type in ["REAL_BUYER", "NEEDS_REVIEW"]:
                real_sales_leads.append(l)
            else:
                research_and_archived_leads.append(l)

        # Unique humans deduplication among real leads
        unique_identities = set()
        for l in real_sales_leads:
            ident = (l.client_identity or l.name or l.contact_info or f"lead_{l.id}").strip().lower()
            unique_identities.add(ident)
        unique_people_count = len(unique_identities)

        # Communication reality metrics
        outreach_drafts = sum(1 for c in comms if c.delivery_status == "DRAFT")
        waiting_approval = sum(1 for c in comms if c.approval_status == "PENDING" and c.requires_approval)
        approved_outreach = sum(1 for c in comms if c.approval_status == "APPROVED")
        
        # Real provider submission requires provider confirmation or valid external provider message ID
        provider_submitted = sum(
            1 for c in comms 
            if c.delivery_status in ["SENT", "DELIVERED", "REPLIED"] 
            and (c.provider_message_id is not None or c.provider_confirmation is not None)
            and c.provider_name in ["RESEND_EMAIL_API", "LINKEDIN_MESSAGING_WORKFLOW", "WHATSAPP_CLOUD_API"]
        )

        # Real delivery requires provider delivery receipt/confirmation
        truly_delivered = sum(
            1 for c in comms 
            if c.delivery_status in ["DELIVERED", "REPLIED"] 
            and c.provider_message_id is not None
            and c.delivery_confirmation is not None
        )

        bounced_failed = sum(1 for c in comms if c.delivery_status in ["BOUNCED", "FAILED"])
        replies_received = sum(1 for c in comms if c.delivery_status == "REPLIED" or c.response_received is not None)
        qualified_replies = sum(1 for c in comms if c.reply_classification in ["INTERESTED", "QUALIFIED", "HOT", "MEETING_REQUESTED"])

        # Proposals & Revenue
        proposals_sent = sum(1 for p in props if p.status in ["SENT", "DELIVERED", "ACCEPTED"])
        proposals_draft = sum(1 for p in props if p.status == "DRAFT")
        won_deals = sum(1 for r in revs if r.deal_status == "CONFIRMED")
        
        # Evidence-Backed Pipeline: Only sum explicit budgets on legitimate sales opportunities
        evidence_pipeline = 0.0
        for l in real_sales_leads:
            if l.expected_value and l.expected_value > 0:
                evidence_pipeline += float(l.expected_value)
            elif l.estimated_budget and l.estimated_budget > 0:
                evidence_pipeline += float(l.estimated_budget)

        collected_cash = sum(float(r.amount or 0.0) for r in revs if r.deal_status == "CONFIRMED")
        commission_earned = sum(float(r.commission_collected or 0.0) for r in revs if r.deal_status == "CONFIRMED")

        # CRM Funnel Counts strictly on real sales leads
        crm_funnel_counts = {
            "NEW": 0,
            "AI_VERIFIED": 0,
            "CONTACT_READY": 0,
            "CONTACTED": 0,
            "REPLIED": 0,
            "MEETING": 0,
            "DEAL": 0,
            "COMMISSION": 0
        }
        for l in real_sales_leads:
            st = (l.status or "").upper()
            if st in crm_funnel_counts:
                crm_funnel_counts[st] += 1
            else:
                crm_funnel_counts["NEW"] += 1

        return {
            "mission_id": mission_id,
            "title": mission.title,
            "status": mission.status,
            "target_amount": float(mission.goal_amount or 5000.0),
            "currency": mission.currency or "AED",
            "hours_remaining": hours_remaining,
            
            # Funnel Truth
            "total_candidates_discovered": len(signals),
            "buyer_signals_count": sum(1 for s in signals if "HOT" in (s.intent_score or "").upper() or "QUALIFIED" in (s.intent_score or "").upper() or "BUYER" in (s.source or "").upper()),
            "total_leads_in_db": len(leads),
            "real_sales_leads_count": len(real_sales_leads),
            "unique_people_count": unique_people_count,
            "confirmed_real_buyers": classification_counts["REAL_BUYER"],
            "needs_review_buyers": classification_counts["NEEDS_REVIEW"],
            "research_signals_count": classification_counts["RESEARCH_SIGNAL"],
            "job_vacancies_count": classification_counts["JOB_VACANCY"],
            "blog_articles_count": classification_counts["BLOG_ARTICLE"],
            "seller_promos_count": classification_counts["SELLER_PROMO"],
            "duplicate_leads_count": classification_counts["DUPLICATE"],
            "rejected_leads_count": classification_counts["REJECTED"],
            
            # Contactability Truth
            "direct_contact_ready": contactability_counts["DIRECT_CONTACT_READY"],
            "platform_action_required": contactability_counts["PLATFORM_ACTION_REQUIRED"],
            "manual_research_required": contactability_counts["MANUAL_RESEARCH_REQUIRED"],
            "non_contactable": contactability_counts["NON_CONTACTABLE"],

            # Outreach Truth
            "outreach_drafts": outreach_drafts,
            "waiting_approval": waiting_approval,
            "approved_outreach": approved_outreach,
            "provider_submitted_outreach": provider_submitted,
            "truly_delivered": truly_delivered,
            "bounced_failed": bounced_failed,
            "replies_received": replies_received,
            "qualified_replies": qualified_replies,

            # Commercial Truth
            "proposals_sent": proposals_sent,
            "proposals_draft": proposals_draft,
            "won_deals": won_deals,
            "evidence_backed_pipeline": round(evidence_pipeline, 2),
            "collected_revenue": round(collected_cash, 2),
            "commission_earned": round(commission_earned, 2),

            # CRM Funnel
            "crm_funnel_counts": crm_funnel_counts,
            
            # Timestamp
            "audited_at_utc": now.strftime("%Y-%m-%d %H:%M:%S UTC")
        }

mission_metrics_service = MissionMetricsService()
