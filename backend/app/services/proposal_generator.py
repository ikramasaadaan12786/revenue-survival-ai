import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.entities import Proposal, Lead, Opportunity, Mission

class ProposalGeneratorService:
    """
    PART 3 — AI Proposal Generation Engine:
    Generates structured, professional proposals for:
    - AI Agent Systems
    - Custom Software Development
    - High-Converting Web Platforms
    - SaaS Products
    - Dubai Real Estate & Advisory
    - Growth Marketing & Acquisition
    """

    async def generate_proposal(
        self,
        session: AsyncSession,
        mission_id: int,
        lead_id: Optional[int] = None,
        opportunity_id: Optional[int] = None,
        proposal_type: str = "AI_AGENT",
        client_name: str = "Client Partner",
        client_industry: Optional[str] = None,
        problem_description: Optional[str] = None,
        custom_budget: Optional[float] = None,
        timeline_days: Optional[int] = None
    ) -> Dict[str, Any]:
        p_type = proposal_type.upper()
        c_name = client_name
        ind = client_industry or "B2B Technology & Commercial Services"
        prob = problem_description or "Seeking high-speed digital monetization and automated client acquisition infrastructure."
        
        # Load lead or opp details if available
        if lead_id:
            lead = await session.get(Lead, lead_id)
            if lead:
                c_name = lead.company_name or lead.name or c_name
                prob = lead.interest or prob
        elif opportunity_id:
            opp = await session.get(Opportunity, opportunity_id)
            if opp:
                c_name = opp.target_customer or c_name
                prob = opp.problem or prob

        # Dynamic Proposal Configurations per Type
        if "REAL" in p_type or "ESTATE" in p_type:
            title = f"{c_name} • Off-Market Property Acquisition & Advisory Dossier"
            p_type_clean = "REAL_ESTATE"
            price = custom_budget or 25000.0
            days = timeline_days or 7
            summary = (
                f"Strategic real estate advisory brief tailored for {c_name} targeting distressed, "
                f"high-yield off-market assets across Dubai's top capital appreciation corridors."
            )
            sol = (
                "Direct sourcing of below-market inventory (15-22% discount to OP), rigorous DLD title deed verification, "
                "escrow account auditing, and expedited 7-day conveyance execution."
            )
            deliverables = [
                "Curated 5-property off-market distress acquisition shortlist",
                "Full DLD title deed & developer escrow safety audit dossier",
                "10-year cashflow projection & net short-term rental yield model",
                "End-to-end conveyance representation through transfer"
            ]
            terms = "50% retainer on agreement, 50% success fee on title deed transfer"
            outcomes = [
                "Immediate equity capture of 15-20% below prevailing market value",
                "Guaranteed minimum 8.5%+ net rental yield projection",
                "Zero risk of fraudulent portal listings through direct owner verification"
            ]

        elif "SOFTWARE" in p_type or "CUSTOM" in p_type:
            title = f"{c_name} • Custom Internal Operations & Workflow Automation CRM"
            p_type_clean = "SOFTWARE"
            price = custom_budget or 8500.0
            days = timeline_days or 4
            summary = (
                f"End-to-end software architecture proposal for {c_name} designed to eliminate manual spreadsheet errors "
                f"and consolidate operational workflows into a central real-time command portal."
            )
            sol = (
                "Lightweight, secure Next.js and Python FastAPI cloud application with role-based access control, "
                "automated manifest tracking, SMS client alerts, and zero monthly software vendor fees."
            )
            deliverables = [
                "Full responsive administrative dashboard and dispatch interface",
                "Secure REST API backend with SQLite/Postgres persistence",
                "Automated notification triggers (WhatsApp & Email)",
                "Complete source code handoff and 1-click cloud deployment"
            ]
            terms = "50% upfront sprint deposit, 50% upon verified staging acceptance"
            outcomes = [
                "Reclaim 15+ staff operational hours per week",
                "100% elimination of spreadsheet data loss and duplicate bookings",
                "Permanent infrastructure ownership with zero recurring SaaS subscriptions"
            ]

        elif "WEB" in p_type:
            title = f"{c_name} • High-Converting 24-Hour Next.js Booking Funnel"
            p_type_clean = "WEBSITE"
            price = custom_budget or 3500.0
            days = timeline_days or 2
            summary = (
                f"Conversion-engineered web portal proposal for {c_name} built on modern Next.js 14 architecture "
                f"to maximize paid ad conversions and deliver sub-second mobile page loads."
            )
            sol = (
                "Ultra-fast landing page with 3-step friction-free booking flow, Stripe/Apple Pay checkout, "
                "and automated Google Analytics conversion tracking."
            )
            deliverables = [
                "Modern Next.js responsive web application",
                "3-step reservation & payment checkout funnel",
                "SEO-optimized metadata and Core Web Vitals score >95",
                "Live deployment on Vercel with custom domain integration"
            ]
            terms = "50% upfront deposit, 50% on live domain launch"
            outcomes = [
                "3.5x conversion lift over legacy template websites",
                "<1.0 second mobile load times for maximum paid ad efficiency",
                "Instant payment settlement directly into your bank account"
            ]

        elif "SAAS" in p_type:
            title = f"{c_name} • Turnkey Multi-Tenant Micro-SaaS Product Sprint"
            p_type_clean = "SAAS"
            price = custom_budget or 12000.0
            days = timeline_days or 7
            summary = (
                f"Commercial SaaS development plan for {c_name} to launch a subscription-ready software product "
                f"with automated billing, tenant isolation, and modern UI."
            )
            sol = (
                "Production-ready Next.js frontend, FastAPI microservices, Stripe subscription billing, "
                "and automated user onboarding flow."
            )
            deliverables = [
                "Multi-tenant customer and administrator portals",
                "Stripe billing integration with Tiered Monthly/Annual plans",
                "User authentication with OAuth2 and magic link login",
                "Automated onboarding email sequence and user telemetry"
            ]
            terms = "40% upon kickoff, 30% upon alpha testing, 30% upon production deployment"
            outcomes = [
                "Launch commercial SaaS product to paying customers in 7 days",
                "Automated recurring subscription revenue engine",
                "Scalable serverless cloud architecture supporting 10,000+ active users"
            ]

        elif "MARKETING" in p_type:
            title = f"{c_name} • High-Intent Lead Acquisition & Outbound Sales Engine"
            p_type_clean = "MARKETING"
            price = custom_budget or 4500.0
            days = timeline_days or 3
            summary = (
                f"Direct response customer acquisition strategy for {c_name} targeting decision makers "
                f"across LinkedIn, Telegram, and Reddit."
            )
            sol = (
                "Multi-channel automated prospecting pipeline, verified decision-maker scraping, "
                "and high-converting WhatsApp direct response sequences."
            )
            deliverables = [
                "250+ audited and qualified executive lead accounts",
                "Custom 3-step direct response messaging copy",
                "Automated dispatch and response tracking dashboard",
                "Bi-weekly conversion optimization reviews"
            ]
            terms = "50% setup deposit, 50% upon delivery of qualified pipeline"
            outcomes = [
                "Generate 15-25 qualified consultation calls within 14 days",
                "Lower customer acquisition cost (CAC) by 40%",
                "Full ownership of scraped prospect database"
            ]

        else:
            # AI_AGENT (Default)
            title = f"{c_name} • Autonomous 24/7 AI Sales Agent & Appointment Setter"
            p_type_clean = "AI_AGENT"
            price = custom_budget or 4500.0
            days = timeline_days or 2
            summary = (
                f"Autonomous conversational AI agent proposal for {c_name} designed to engage inbound leads "
                f"in under 5 seconds, qualify buyer intent, and book qualified consultations on calendar."
            )
            sol = (
                "Bilingual (Arabic/English) WhatsApp and Web AI Agent powered by custom fine-tuned sales prompts, "
                "automated objection handling, and real-time CRM calendar sync."
            )
            deliverables = [
                "Custom AI qualification prompt and knowledge base integration",
                "24/7 WhatsApp Business API bot connection with <5s response SLA",
                "Automated appointment scheduling calendar integration",
                "Safety guardrails and Human-in-the-Loop escalation trigger"
            ]
            terms = "50% upfront deposit upon kickoff, 50% upon verified live testing"
            outcomes = [
                "Instant 100% response rate to all inbound inquiries",
                "Over 4.0x increase in booked appointments from existing ad traffic",
                "Zero staff salary overhead for night and weekend lead coverage"
            ]

        # Markdown Document Generation
        markdown_proposal = f"""# COMMERCIAL PROPOSAL

**Document Title**: {title}  
**Prepared For**: {c_name} ({ind})  
**Prepared By**: Autonomous Revenue AI Engine  
**Date**: {datetime.date.today().strftime('%B %d, %Y')}  
**Turnaround Timeline**: {days} Business Days  
**Total Investment**: {price:,.0f} AED (VAT Included)  

---

## 1. Executive Summary
{summary}

## 2. Identified Problem & Revenue Friction
{prob}

## 3. Proposed AI & Technical Solution
{sol}

## 4. Scope of Deliverables
"""
        for d in deliverables:
            markdown_proposal += f"- **{d}**\n"

        markdown_proposal += f"""
## 5. Timeline & Milestones
- **Phase 1 (Day 1)**: Kickoff, requirements alignment & architecture provisioning.
- **Phase 2 (Day 2-{days-1})**: Core development, testing, and staging review.
- **Phase 3 (Day {days})**: Verification, handoff, and live deployment.

## 6. Commercial Terms & Payment Schedule
- **Total Project Fee**: **{price:,.0f} AED**
- **Payment Structure**: {terms}

## 7. Expected Business Outcomes
"""
        for o in outcomes:
            markdown_proposal += f"- {o}\n"

        markdown_proposal += """
---
*Confidential Document • Generated by Revenue Survival AI Operating System*
"""

        # Save to database
        proposal_obj = Proposal(
            mission_id=mission_id,
            lead_id=lead_id,
            opportunity_id=opportunity_id,
            proposal_title=title,
            proposal_type=p_type_clean,
            client_name=c_name,
            client_summary=summary,
            problem_statement=prob,
            proposed_solution=sol,
            deliverables=deliverables,
            timeline_days=days,
            pricing_amount=price,
            currency="AED",
            payment_terms=terms,
            expected_outcomes=outcomes,
            full_proposal_markdown=markdown_proposal,
            status="DRAFT"
        )
        session.add(proposal_obj)
        await session.commit()
        await session.refresh(proposal_obj)

        return {
            "id": proposal_obj.id,
            "mission_id": mission_id,
            "lead_id": lead_id,
            "proposal_title": title,
            "proposal_type": p_type_clean,
            "client_name": c_name,
            "client_summary": summary,
            "problem_statement": prob,
            "proposed_solution": sol,
            "deliverables": deliverables,
            "timeline_days": days,
            "pricing_amount": price,
            "currency": "AED",
            "payment_terms": terms,
            "expected_outcomes": outcomes,
            "full_proposal_markdown": markdown_proposal,
            "status": "DRAFT",
            "created_at": proposal_obj.created_at.isoformat()
        }

    async def get_proposals_by_mission(self, session: AsyncSession, mission_id: int) -> List[Dict[str, Any]]:
        stmt = select(Proposal).where(Proposal.mission_id == mission_id).order_by(Proposal.id.desc())
        res = await session.execute(stmt)
        proposals = res.scalars().all()
        return [
            {
                "id": p.id,
                "mission_id": p.mission_id,
                "lead_id": p.lead_id,
                "proposal_title": p.proposal_title,
                "proposal_type": p.proposal_type,
                "client_name": p.client_name,
                "client_summary": p.client_summary,
                "problem_statement": p.problem_statement,
                "proposed_solution": p.proposed_solution,
                "deliverables": p.deliverables or [],
                "timeline_days": p.timeline_days,
                "pricing_amount": p.pricing_amount,
                "currency": p.currency or "AED",
                "payment_terms": p.payment_terms,
                "expected_outcomes": p.expected_outcomes or [],
                "full_proposal_markdown": p.full_proposal_markdown,
                "status": p.status,
                "created_at": p.created_at.isoformat() if p.created_at else datetime.datetime.utcnow().isoformat()
            }
            for p in proposals
        ]

proposal_generator_service = ProposalGeneratorService()
