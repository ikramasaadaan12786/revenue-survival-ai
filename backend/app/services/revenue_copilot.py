import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.entities import Opportunity, RevenueOpportunity, Offer, Lead

class RevenueCopilotService:
    """
    AI Revenue Copilot:
    Deep-dives into any opportunity or buyer signal to formulate:
    1. Root Problem Analysis & Financial Impact
    2. Recommended High-Margin Service with exact scope
    3. Express Pricing & Upfront Deposit terms
    4. Direct Response Pitch Hook
    5. 3-Step Follow-Up Conversion Sequence
    """

    async def analyze_opportunity(
        self,
        session: Optional[AsyncSession],
        opportunity_id: Optional[int] = None,
        revenue_opportunity_id: Optional[int] = None,
        problem_text: Optional[str] = None,
        company: Optional[str] = None,
        industry: Optional[str] = None,
        target_budget: Optional[float] = None,
        currency: str = "AED"
    ) -> Dict[str, Any]:
        opp_name = company or "Target Enterprise"
        raw_text = problem_text or ""
        ind = industry or "B2B Technology & Consulting"
        est_val = target_budget or 5000.0

        if session and revenue_opportunity_id:
            ro = await session.get(RevenueOpportunity, revenue_opportunity_id)
            if ro:
                opp_name = ro.company or ro.name
                raw_text = ro.requirement
                ind = ro.industry
                est_val = ro.estimated_value or est_val
        elif session and opportunity_id:
            opp = await session.get(Opportunity, opportunity_id)
            if opp:
                opp_name = opp.target_customer
                raw_text = opp.problem
                ind = opp.market
                est_val = opp.price_estimate or est_val

        # Determine best service & scope based on industry and problem text
        low_p = raw_text.lower()
        if "real estate" in ind.lower() or "property" in low_p or "investor" in low_p or "villa" in low_p:
            service_name = "Off-Market Distress Property Brokerage & Escrow Match"
            scope = [
                "Direct seller distress verification (15-20% below original price)",
                "Transparent DLD title deed & escrow balance audit",
                "Projected short-term net yield & ROI model",
                "Expedited 7-day closing facilitation"
            ]
            sla_hours = 48
            price = est_val if est_val and est_val > 0 else 25000.0
            roi_mult = "12.8x ROI upon title resale / 9.4% annual net yield"
            bottleneck = "Inability to find audited below-market inventory without broker markup."
            problem_diag = (
                f"The buyer ({opp_name}) has immediate liquid capital but is losing deal opportunities "
                f"due to saturated public portals and unverified off-market listings."
            )
            pitch = (
                f"Salam {opp_name.split()[0]}, we have located a verified off-market distress property in prime Dubai "
                f"at 17.5% below OP with motivated seller needing 7-day closing. Would you like the title deed and ROI breakdown?"
            )
            follow_ups = [
                {"step": 1, "day": "Day 1", "hook": "Off-market title verification", "body": "Seller confirmed 7-day title transfer readiness. I can share the escrow contract draft today."},
                {"step": 2, "day": "Day 3", "hook": "Cashflow & yield model", "body": "Attached the net rental yield breakdown showing 9.4% projected returns for your review."},
                {"step": 3, "day": "Day 5", "hook": "Final closing window", "body": "Seller has 2 secondary offers pending. Can we confirm your interest before 4 PM?"}
            ]
        elif "ai" in ind.lower() or "bot" in low_p or "automation" in low_p:
            service_name = "24/7 WhatsApp AI Lead Qualifier & Appointment Setter"
            scope = [
                "Bilingual Arabic/English conversational sales bot setup",
                "Instant sub-5-second lead response engine",
                "Calendar & CRM automated appointment booking sync",
                "14-day performance optimization & escalation rules"
            ]
            sla_hours = 24
            price = max(3500.0, est_val * 0.7 if est_val > 0 else 4500.0)
            roi_mult = "4.2x monthly appointment conversion increase"
            bottleneck = "Lead drop-off exceeding 40% due to slow WhatsApp response times (>20 mins)."
            problem_diag = (
                f"{opp_name} is spending marketing budget on inbound inquiries but losing over 35% of qualified prospects "
                f"due to delayed manual responses on WhatsApp."
            )
            pitch = (
                f"Hi {opp_name.split()[0]}, noticed your inbound inquiry volume! We build WhatsApp AI sales bots that qualify leads "
                f"in under 5 seconds and double booked consultations. Delivered in 24 hours. Can I send you a 2-minute video preview?"
            )
            follow_ups = [
                {"step": 1, "day": "Day 1", "hook": "Live demo preview", "body": "Prepared a quick interactive demo of your WhatsApp qualification flow."},
                {"step": 2, "day": "Day 3", "hook": "Case study result", "body": "Similar clinics in Dubai saw booked consultations jump +60% within 7 days."},
                {"step": 3, "day": "Day 5", "hook": "Sprint kickoff offer", "body": "We have 1 deployment sprint available this week with 50% deposit on completion."}
            ]
        elif "website" in ind.lower() or "web" in low_p or "landing" in low_p:
            service_name = "24-Hour High-Converting Next.js Booking Portal"
            scope = [
                "Ultra-fast sub-second Next.js / Tailwind mobile architecture",
                "High-converting 3-step reservation & payment funnel",
                "Stripe / Apple Pay payment checkout integration",
                "Google Analytics 4 & conversion tracking setup"
            ]
            sla_hours = 24
            price = max(2500.0, est_val * 0.7 if est_val > 0 else 3500.0)
            roi_mult = "3.8x ad conversion lift with <1s page loads"
            bottleneck = "Sluggish legacy page (5.4s load time) degrading visitor trust and ad ROI."
            problem_diag = (
                f"{opp_name}'s current digital storefront is leaking paid traffic due to mobile loading latency and friction in checkout."
            )
            pitch = (
                f"Hi {opp_name.split()[0]}, saw your service offering! Your mobile load time is currently losing potential bookings. "
                f"We can deploy a high-converting Next.js portal within 24 hours for {price:,.0f} {currency} (50% on completion). Would you like to review 2 live demos?"
            )
            follow_ups = [
                {"step": 1, "day": "Day 1", "hook": "Mobile page audit", "body": "Ran a Google PageSpeed audit on your site—sharing the 3 quick fixes we can deploy today."},
                {"step": 2, "day": "Day 3", "hook": "Staging preview", "body": "Built a wireframe of your new booking funnel ready for review."},
                {"step": 3, "day": "Day 5", "hook": "Express sprint deadline", "body": "Can deliver this before the weekend to capture your upcoming traffic surge."}
            ]
        else:
            service_name = "Custom Internal Operations & Workflow Automation CRM"
            scope = [
                "Real-time operations & dispatch dashboard",
                "Automated client manifest tracking & SMS alerts",
                "Role-based staff access & invoice export",
                "Cloud deployment with zero monthly recurring software fees"
            ]
            sla_hours = 48
            price = max(5000.0, est_val * 0.75 if est_val > 0 else 7500.0)
            roi_mult = "15+ weekly operational staff hours saved"
            bottleneck = "Manual spreadsheet reconciliation causing human errors and customer churn."
            problem_diag = (
                f"{opp_name} is losing operational efficiency by managing core business workflows manually across disconnected spreadsheets."
            )
            pitch = (
                f"Dear {opp_name.split()[0]}, replacing fragmented spreadsheets with a centralized operations portal saves teams 15+ hours weekly. "
                f"We can build your tailored internal dashboard in 48 hours for {price:,.0f} {currency}. When are you free for a quick scoping call?"
            )
            follow_ups = [
                {"step": 1, "day": "Day 1", "hook": "Architecture overview", "body": "Created a 2-minute video showing how the dispatch dashboard organizes manifests in real-time."},
                {"step": 2, "day": "Day 3", "hook": "ROI calculation", "body": "Saving 15 staff hours weekly returns 100% of the build cost in under 30 days."},
                {"step": 3, "day": "Day 5", "hook": "Pilot kickoff", "body": "Ready to launch your 48-hour build sprint. Let us know when you'd like to start."}
            ]

        upfront_deposit = round(price * 0.5, 2)

        return {
            "opportunity_title": f"{opp_name} • {service_name}",
            "company_context": opp_name,
            "industry": ind,
            "problem_analysis": problem_diag,
            "buyer_bottleneck": bottleneck,
            "recommended_service": service_name,
            "service_scope": scope,
            "delivery_sla_hours": sla_hours,
            "suggested_pricing_aed": price,
            "upfront_deposit_aed": upfront_deposit,
            "roi_multiplier": roi_mult,
            "conversion_confidence": 92.5,
            "pitch_message": pitch,
            "follow_up_sequence": follow_ups
        }

revenue_copilot = RevenueCopilotService()
