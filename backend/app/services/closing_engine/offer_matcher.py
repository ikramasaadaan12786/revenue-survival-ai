from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.entities import Offer, Lead, Opportunity, Mission

class OfferMatchingEngine:
    """
    AI Offer Matching Engine.
    Automatically crafts tailored, high-converting service packages based on client industry,
    budget capabilities, and technical requirements.
    """

    OFFER_CATALOG = {
        "AI_AGENTS": {
            "product_name": "AI Agent Development & Workflow Automation Package",
            "price_range_aed": (5000.0, 25000.0),
            "default_price": 12500.0,
            "delivery_days": 10,
            "description": (
                "End-to-end deployment of custom LLM agents, 24/7 bilingual WhatsApp customer service bots, "
                "HubSpot/Salesforce CRM automation, and Stripe payment gateway routing."
            ),
            "target_audience": "UAE Founders, Clinics, E-commerce Brands, and Real Estate Brokerages",
            "marketing_angle": "Cut operational payroll by 60% while doubling inbound conversion speed.",
            "deliverables": [
                "Bilingual (Arabic/English) conversational AI agent",
                "WhatsApp Business API / Webhook integration",
                "CRM automatic lead capture & qualification pipeline",
                "Escrow-ready payment and calendar scheduling engine"
            ]
        },
        "WEBSITE": {
            "product_name": "High-Converting Business Website & Portal Package",
            "price_range_aed": (3000.0, 15000.0),
            "default_price": 7500.0,
            "delivery_days": 7,
            "description": (
                "Ultra-fast modern Next.js/Tailwind web portal engineered with bespoke typography, glassmorphism UI, "
                "dynamic booking forms, and enterprise SEO optimization."
            ),
            "target_audience": "Dubai/Abu Dhabi professional services, legal firms, luxury boutiques, and tech startups",
            "marketing_angle": "Turn visitors into high-ticket inbound consultations within 5 seconds of landing.",
            "deliverables": [
                "Custom Next.js responsive web application",
                "Interactive inquiry calculator & WhatsApp quick-action",
                "Enterprise Core Web Vitals score (98+ performance)",
                "Full domain, SSL & cloud server deployment"
            ]
        },
        "CUSTOM_SOFTWARE": {
            "product_name": "Custom Software MVP & Cloud Architecture Package",
            "price_range_aed": (15000.0, 100000.0),
            "default_price": 38000.0,
            "delivery_days": 21,
            "description": (
                "Production-grade full-stack backend with FastAPI/PostgreSQL, enterprise RBAC security, "
                "distributed background jobs, and cloud scalability."
            ),
            "target_audience": "Fintech, logistics, and enterprise scaleups expanding across the GCC",
            "marketing_angle": "Enterprise architecture delivered in weeks instead of quarters at 70% lower engineering cost.",
            "deliverables": [
                "Scalable Python/FastAPI microservices architecture",
                "PostgreSQL database design with automated indexing",
                "Multi-tenant authentication & API keys management",
                "Docker containerization & CI/CD deployment pipelines"
            ]
        },
        "REAL_ESTATE": {
            "product_name": "Dubai Prime & Off-Plan Investment Advisory",
            "price_range_aed": (0.0, 0.0),
            "default_price": 0.0,
            "delivery_days": 3,
            "description": (
                "VIP investment matching with top tier Dubai developers (Emaar, Sobha, Ellington, DAMAC). "
                "Exclusive access to off-market inventory, distressed assignments, and 0% commission buyer representation."
            ),
            "target_audience": "High Net Worth Individuals, Family Offices, and Global Relocation Investors",
            "marketing_angle": "Secure 8-12% net yields and prime capital appreciation with zero agency fee to the buyer.",
            "deliverables": [
                "Curated shortlist of verified off-plan & secondary inventory",
                "Cash flow ROI & payment plan projection analysis",
                "Direct developer escrow allocation & Golden Visa assistance"
            ]
        },
        "SAAS": {
            "product_name": "Micro-SaaS Production Accelerator MVP",
            "price_range_aed": (10000.0, 45000.0),
            "default_price": 22000.0,
            "delivery_days": 14,
            "description": (
                "Turn software ideas into recurring revenue SaaS platforms with Stripe billing, user auth, "
                "and core feature development."
            ),
            "target_audience": "Indie hackers, startup founders, and industry subject-matter experts",
            "marketing_angle": "Launch a monetizeable SaaS MVP ready for first paying customers in under 14 days.",
            "deliverables": [
                "Complete SaaS starter kit with Stripe subscription tiers",
                "User authentication, onboarding, and dashboard UI",
                "Core product algorithm and API integrations"
            ]
        },
        "MARKETING": {
            "product_name": "Revenue Growth & High-Ticket Lead Acquisition Engine",
            "price_range_aed": (4000.0, 18000.0),
            "default_price": 8500.0,
            "delivery_days": 5,
            "description": (
                "Autonomous multi-channel outbound radar and paid lead capture system generating 30-50 verified B2B decision maker calls monthly."
            ),
            "target_audience": "B2B service providers, high-ticket agencies, and commercial vendors in UAE",
            "marketing_angle": "Fill your sales calendar with qualified GCC buyers without relying on expensive ad agencies.",
            "deliverables": [
                "Target ICP list of 500+ verified UAE decision makers",
                "Multi-touch cold outreach copy & follow-up sequence",
                "Calendar booking automation and CRM synchronization"
            ]
        }
    }

    def match_offer_for_requirement(
        self,
        requirement: str,
        industry: str,
        budget_capability: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Selects and customizes the best offer from the catalog.
        """
        combined = f"{requirement} {industry}".lower()

        if "property" in combined or "real estate" in combined or "developer" in combined or "villa" in combined or "apartment" in combined:
            catalog_key = "REAL_ESTATE"
        elif "ai" in combined or "agent" in combined or "bot" in combined or "chat" in combined or "automation" in combined:
            catalog_key = "AI_AGENTS"
        elif "website" in combined or "landing page" in combined or "web design" in combined or "portal" in combined:
            catalog_key = "WEBSITE"
        elif "software" in combined or "custom app" in combined or "backend" in combined or "erp" in combined or "crm" in combined:
            catalog_key = "CUSTOM_SOFTWARE"
        elif "saas" in combined or "subscription" in combined:
            catalog_key = "SAAS"
        else:
            catalog_key = "MARKETING"

        base = self.OFFER_CATALOG[catalog_key]
        min_p, max_p = base["price_range_aed"]

        if catalog_key == "REAL_ESTATE":
            final_price = 0.0
            commission_note = "2% Developer / Seller Commission"
        else:
            if budget_capability and budget_capability > 0:
                # Align pricing inside the capability window
                final_price = max(min_p, min(max_p, budget_capability))
            else:
                final_price = base["default_price"]
            commission_note = f"{final_price:,.0f} AED (Upfront 50% Milestone Deposit)"

        return {
            "offer_key": catalog_key,
            "product_name": base["product_name"],
            "pricing": final_price,
            "currency": "AED",
            "delivery_days": base["delivery_days"],
            "description": base["description"],
            "target_audience": base["target_audience"],
            "marketing_angle": base["marketing_angle"],
            "deliverables": base["deliverables"],
            "pricing_terms": commission_note
        }

    async def create_or_attach_offer_for_lead(
        self,
        session: AsyncSession,
        mission_id: int,
        lead_id: int
    ) -> Optional[Offer]:
        """
        Creates and associates a tailored Offer model in the database for a given lead.
        """
        lead_res = await session.execute(select(Lead).where(Lead.id == lead_id))
        lead = lead_res.scalar_one_or_none()
        if not lead:
            return None

        matched = self.match_offer_for_requirement(
            requirement=lead.interest or "",
            industry=lead.country or "Dubai Real Estate & Advisory",
            budget_capability=lead.estimated_budget
        )

        offer = Offer(
            mission_id=mission_id,
            product_name=matched["product_name"],
            description=matched["description"],
            pricing=matched["pricing"],
            currency=matched["currency"],
            target_audience=matched["target_audience"],
            sales_message=f"Tailored {matched['product_name']} delivering within {matched['delivery_days']} days.",
            marketing_angle=matched["marketing_angle"],
            faq=[
                {"question": "What is the delivery timeline?", "answer": f"Initial delivery within {matched['delivery_days']} business days."},
                {"question": "What are the payment terms?", "answer": matched["pricing_terms"]}
            ],
            status="APPROVED"
        )
        session.add(offer)
        await session.commit()
        await session.refresh(offer)

        lead.offer_id = offer.id
        lead.expected_value = matched["pricing"] if matched.get("pricing") and matched["pricing"] > 0 else None
        lead.pipeline_stage = "OFFER_CREATED"
        await session.commit()

        return offer


offer_matching_engine = OfferMatchingEngine()
