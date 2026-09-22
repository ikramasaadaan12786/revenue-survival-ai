from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.entities import Lead, Offer, Opportunity

class AutonomousOfferGenerator:
    """
    Autonomous Tiered Offer Generator:
    Generates 3-tier value architectures (Starter, Growth, Enterprise)
    tailored to buyer requirements, industry economics, and conversion expectancy.
    """

    def generate_tiered_offer_matrix(
        self,
        industry: str,
        lead_requirement: Optional[str] = None,
        estimated_budget: Optional[float] = None
    ) -> Dict[str, Any]:
        industry_norm = (industry or "").lower()

        if "ai" in industry_norm or "agent" in industry_norm or "automation" in industry_norm:
            starter = {
                "tier": "STARTER",
                "package_name": "AI Automation Quick-Sprint",
                "price_aed": 5000.0,
                "delivery_days": 5,
                "deliverables": [
                    "Single-Workflow AI Agent (Lead Intake or Support)",
                    "WhatsApp / Telegram MTProto Webhook Integration",
                    "Prompt Tuning & Guardrail Safety Layer",
                    "30 Days Maintenance & Monitoring"
                ],
                "expected_roi": "Saves 15-20 human hours/week with instant 24/7 client response.",
                "pitch": "Automate your top repetitive workflow in 5 days with zero disruption to your daily operations."
            }
            growth = {
                "tier": "GROWTH",
                "package_name": "Full Autonomous Revenue Agent System",
                "price_aed": 15000.0,
                "delivery_days": 10,
                "deliverables": [
                    "Multi-Agent Workflow (Radar Discovery + Lead Qualifier + Sales Copilot)",
                    "CRM Sync (HubSpot / Notion / Custom Database)",
                    "Multi-Channel Outreach (WhatsApp, LinkedIn, Email)",
                    "Live Analytics & Telegram Alert Dispatch",
                    "60 Days Dedicated Optimization"
                ],
                "expected_roi": "Expected 3x-5x boost in outbound qualified lead volume within 30 days.",
                "pitch": "A 24/7 autonomous sales agent pipeline generating and qualifying deals without adding headcount."
            }
            enterprise = {
                "tier": "ENTERPRISE",
                "package_name": "Bespoke Enterprise AI Engine & Knowledge Brain",
                "price_aed": 40000.0,
                "delivery_days": 21,
                "deliverables": [
                    "Full Custom Multi-Tenant AI Infrastructure",
                    "Fine-Tuned Domain LLM with Local Memory & RAG",
                    "Enterprise ERP/CRM Deep Integration & RBAC",
                    "Private Dedicated Cloud Deployment & SLA Guarantee",
                    "Quarterly Fine-Tuning & Model Retraining"
                ],
                "expected_roi": "Transform entire business operations into an autonomous self-optimizing engine.",
                "pitch": "Enterprise-grade operational autonomy designed to scale your revenue 10x with zero latency."
            }
        elif "real estate" in industry_norm or "property" in industry_norm or "investor" in industry_norm:
            starter = {
                "tier": "STARTER",
                "package_name": "Off-Market Deal Assignment Package",
                "price_aed": 15000.0,
                "delivery_days": 3,
                "deliverables": [
                    "Curated Top 3 High-Yield Dubai Off-Market Units",
                    "Direct Developer Allocation & Zero Commission Fee",
                    "Full Cash Flow & ROI Model Projection",
                    "Escrow & Legal Verification Assistance"
                ],
                "expected_roi": "Instant equity upside of 8-14% below secondary market asking prices.",
                "pitch": "Exclusive allocation of prime off-market units vetted for maximum immediate yield."
            }
            growth = {
                "tier": "GROWTH",
                "package_name": "Prime Dubai Portfolio Acquisition Advisory",
                "price_aed": 35000.0,
                "delivery_days": 7,
                "deliverables": [
                    "Comprehensive AED 5M-20M Asset Allocation Strategy",
                    "Golden Visa Concierge & Corporate Structuring",
                    "Direct Master Developer VIP Access (Emaar / Meraas / Sobha)",
                    "Rental Management & Yield Optimization Setup"
                ],
                "expected_roi": "12-16% annualized net return with capital preservation structuring.",
                "pitch": "Bespoke wealth management & acquisition strategy securing high-capital appreciation Dubai assets."
            }
            enterprise = {
                "tier": "ENTERPRISE",
                "package_name": "Institutional Dubai Real Estate Syndicate Advisory",
                "price_aed": 85000.0,
                "delivery_days": 14,
                "deliverables": [
                    "AED 25M+ Bulk Unit / Full Floor Acquisition Structuring",
                    "DIFC / ADGM Special Purpose Vehicle (SPV) Formation",
                    "Private Off-Market Distressed Asset Sourcing",
                    "End-to-End Exit & Secondary Market Strategy"
                ],
                "expected_roi": "Targeted 22-30% IRR on institutional portfolio flip/hold strategies.",
                "pitch": "Full institutional-grade acquisition & syndicate vehicle for UHNW family offices."
            }
        elif "software" in industry_norm or "saas" in industry_norm or "app" in industry_norm:
            starter = {
                "tier": "STARTER",
                "package_name": "Rapid MVP & Prototype Sprint",
                "price_aed": 10000.0,
                "delivery_days": 7,
                "deliverables": [
                    "Full-Stack Web App MVP (Next.js + FastAPI + PostgreSQL)",
                    "Core Authentication, Payment & Dashboard Flow",
                    "Vercel / Cloud Production Deployment",
                    "Clean Documented Codebase & GitHub Handover"
                ],
                "expected_roi": "Launch and test customer willingness-to-pay in under 7 days.",
                "pitch": "Turn your software concept into a production-ready application in one week."
            }
            growth = {
                "tier": "GROWTH",
                "package_name": "Full Production SaaS Architecture",
                "price_aed": 25000.0,
                "delivery_days": 14,
                "deliverables": [
                    "Multi-Tenant SaaS with Stripe / Tap Payments",
                    "Background Job Queues & Worker Architecture",
                    "Role-Based Access Control & Team Management",
                    "Automated CI/CD & Production Monitoring",
                    "60 Days Post-Launch Bug Fix SLA"
                ],
                "expected_roi": "Enterprise-grade foundation capable of supporting first 10,000 active subscribers.",
                "pitch": "Production-grade SaaS engineered for scalability, high concurrency, and rapid monetization."
            }
            enterprise = {
                "tier": "ENTERPRISE",
                "package_name": "Custom Enterprise Platform & Data Infrastructure",
                "price_aed": 60000.0,
                "delivery_days": 30,
                "deliverables": [
                    "High-Throughput Microservice Architecture",
                    "Real-Time Data Streaming & WebSocket Engine",
                    "SOC2 / GDPR Compliance Readiness",
                    "Dedicated DevOps & Kubernetes Orchestration",
                    "Full IP & Code Transfer with Architecture Blueprints"
                ],
                "expected_roi": "Replaces fragmented legacy systems with a streamlined internal powerhouse.",
                "pitch": "Mission-critical enterprise software built to automate operations and drive massive operational efficiency."
            }
        else:
            starter = {
                "tier": "STARTER",
                "package_name": f"{industry} Accelerated Starter Package",
                "price_aed": 4500.0,
                "delivery_days": 5,
                "deliverables": ["Targeted Diagnostic & Rapid Implementation", "Core Deliverable Setup", "14 Days Support"],
                "expected_roi": "Immediate resolution of primary operational bottlenecks.",
                "pitch": f"Quick-win implementation for your {industry} requirements in 5 days."
            }
            growth = {
                "tier": "GROWTH",
                "package_name": f"{industry} Full Scale Growth Solution",
                "price_aed": 12500.0,
                "delivery_days": 10,
                "deliverables": ["Comprehensive Strategy & System Deployment", "Multi-Channel Integration", "45 Days Support"],
                "expected_roi": "Sustainable 2x-3x revenue acceleration.",
                "pitch": f"Full-funnel solution to maximize performance and conversions in {industry}."
            }
            enterprise = {
                "tier": "ENTERPRISE",
                "package_name": f"{industry} Enterprise Master Package",
                "price_aed": 30000.0,
                "delivery_days": 21,
                "deliverables": ["Dedicated Architecture & Custom Solutions", "White-Glove VIP Implementation", "Quarterly SLA"],
                "expected_roi": "Dominant market position and scalable operational efficiency.",
                "pitch": f"Enterprise-level engagement delivering end-to-end transformation in {industry}."
            }

        return {
            "industry": industry,
            "lead_requirement": lead_requirement or "General High-Value Requirement",
            "tiers": {
                "starter": starter,
                "growth": growth,
                "enterprise": enterprise
            }
        }

    async def attach_tiered_offers_to_lead(
        self,
        session: AsyncSession,
        lead_id: int
    ) -> Dict[str, Any]:
        lead_res = await session.execute(select(Lead).where(Lead.id == lead_id))
        lead = lead_res.scalar_one_or_none()
        if not lead:
            return {"error": "Lead not found"}

        industry = "AI Automation"
        if lead.interest:
            industry = lead.interest
        elif lead.notes and "real estate" in lead.notes.lower():
            industry = "Dubai Real Estate & Advisory"

        matrix = self.generate_tiered_offer_matrix(
            industry=industry,
            lead_requirement=lead.notes or lead.interest,
            estimated_budget=lead.estimated_budget
        )

        # Create or update Offer entity with growth tier as primary default
        growth_tier = matrix["tiers"]["growth"]
        offer = Offer(
            mission_id=lead.mission_id,
            product_name=growth_tier["package_name"],
            description=f"{industry} Package: " + "; ".join(growth_tier["deliverables"]),
            pricing=growth_tier["price_aed"],
            currency="AED",
            target_audience=f"{industry} Decision Makers in UAE",
            sales_message=growth_tier["pitch"],
            status="ACTIVE"
        )
        session.add(offer)
        await session.commit()
        await session.refresh(offer)

        lead.offer_id = offer.id
        await session.commit()

        return {
            "lead_id": lead_id,
            "prospect_name": lead.name,
            "offer_id": offer.id,
            "tiered_matrix": matrix
        }


autonomous_offer_generator = AutonomousOfferGenerator()
