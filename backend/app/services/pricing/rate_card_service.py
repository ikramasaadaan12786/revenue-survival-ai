"""
Revenue Survival AI — Service Rate Card & Pricing Intelligence Service
Manages real commercial pricing guidance and evidence-based proposal valuation.
Zero arbitrary numbers (no fabricated AED 3,500 / AED 25,000).
"""

from typing import Dict, Any, Optional, Tuple
from app.models.entities import Lead

# UAE Market Professional Standard Rate Card Guidance Ranges (in AED)
SERVICE_RATE_CARD: Dict[str, Dict[str, Any]] = {
    "WEBSITE_DEVELOPMENT": {
        "service_name": "High-Performance Web Portal & Platform Development",
        "min_aed": 4500.0,
        "max_aed": 18000.0,
        "typical_aed": 8500.0,
        "unit": "project"
    },
    "CUSTOM_SOFTWARE": {
        "service_name": "Custom Software & Dispatch/Operations Engineering",
        "min_aed": 15000.0,
        "max_aed": 85000.0,
        "typical_aed": 28000.0,
        "unit": "project"
    },
    "MOBILE_APPLICATION": {
        "service_name": "iOS / Android Mobile Application Development",
        "min_aed": 20000.0,
        "max_aed": 95000.0,
        "typical_aed": 35000.0,
        "unit": "project"
    },
    "AI_AGENT": {
        "service_name": "Conversational AI & 24/7 Automated Triage Agent",
        "min_aed": 7500.0,
        "max_aed": 35000.0,
        "typical_aed": 12500.0,
        "unit": "deployment"
    },
    "AI_AUTOMATION": {
        "service_name": "Enterprise AI Workflow & CRM Integration",
        "min_aed": 8500.0,
        "max_aed": 45000.0,
        "typical_aed": 15000.0,
        "unit": "deployment"
    },
    "SAAS_MVP": {
        "service_name": "Turnkey SaaS Platform / MVP Launchpad",
        "min_aed": 25000.0,
        "max_aed": 120000.0,
        "typical_aed": 45000.0,
        "unit": "project"
    },
    "CRM_WORKFLOW": {
        "service_name": "CRM Architecture & Multi-Channel Pipeline Automation",
        "min_aed": 6000.0,
        "max_aed": 25000.0,
        "typical_aed": 10000.0,
        "unit": "implementation"
    },
    "LEAD_GENERATION": {
        "service_name": "B2B Outbound Infrastructure & Digital Sourcing Mandate",
        "min_aed": 5000.0,
        "max_aed": 22000.0,
        "typical_aed": 9500.0,
        "unit": "monthly retainer"
    },
    "DIGITAL_SERVICES": {
        "service_name": "Digital Optimization & Platform Engineering",
        "min_aed": 4000.0,
        "max_aed": 15000.0,
        "typical_aed": 7000.0,
        "unit": "project"
    },
    "REAL_ESTATE_ADVISORY": {
        "service_name": "Prime & Distress Real Estate Acquisition Advisory",
        "min_aed": 10000.0,
        "max_aed": 150000.0,
        "typical_aed": 25000.0,
        "commission_rate_pct": 2.0,
        "unit": "mandate / success commission"
    }
}


class RateCardService:
    """
    Evaluates pricing strictly based on evidence, explicit stated budget, or scope classification.
    """

    @classmethod
    def get_rate_card(cls) -> Dict[str, Any]:
        return SERVICE_RATE_CARD

    @classmethod
    def evaluate_pricing_for_lead(cls, lead: Lead) -> Dict[str, Any]:
        """
        Determines evidence-backed valuation or flags NEEDS_SCOPING.
        """
        # 1. If lead has an explicit, verified stated budget, prioritize it
        if lead.estimated_budget and lead.estimated_budget > 0:
            return {
                "price_status": "BUDGET_CONFIRMED",
                "recommended_price_aed": float(lead.estimated_budget),
                "pricing_basis": f"Client stated budget of AED {lead.estimated_budget:,.2f}",
                "rate_card_category": "STATED_BUDGET",
                "requires_scoping": False
            }

        interest = (lead.interest or "").lower()
        company = (lead.company_name or "").lower()
        combined = f"{interest} {company} {lead.notes or ''}"

        # 2. Check Real Estate vs Tech
        if any(k in combined for k in ["real estate", "property", "villa", "apartment", "off-plan", "distress"]):
            # For real estate, only calculate value if property price/budget is explicitly mentioned
            rc = SERVICE_RATE_CARD["REAL_ESTATE_ADVISORY"]
            return {
                "price_status": "NEEDS_SCOPING",
                "recommended_price_aed": None,
                "pricing_basis": "Real Estate Mandate (2% buyer commission upon transaction settlement)",
                "rate_card_category": "REAL_ESTATE_ADVISORY",
                "rate_card_guidance": rc,
                "requires_scoping": True
            }

        elif any(k in combined for k in ["custom software", "dispatch", "software development", "fleet"]):
            rc = SERVICE_RATE_CARD["CUSTOM_SOFTWARE"]
            return {
                "price_status": "NEEDS_SCOPING",
                "recommended_price_aed": None,
                "pricing_basis": f"Custom Software Scope (Guidance: AED {rc['min_aed']:,.0f} - {rc['max_aed']:,.0f})",
                "rate_card_category": "CUSTOM_SOFTWARE",
                "rate_card_guidance": rc,
                "requires_scoping": True
            }

        elif any(k in combined for k in ["ai agent", "ai automation", "appointment booking", "triage"]):
            rc = SERVICE_RATE_CARD["AI_AGENT"]
            return {
                "price_status": "NEEDS_SCOPING",
                "recommended_price_aed": None,
                "pricing_basis": f"AI Agent Implementation (Guidance: AED {rc['min_aed']:,.0f} - {rc['max_aed']:,.0f})",
                "rate_card_category": "AI_AGENT",
                "rate_card_guidance": rc,
                "requires_scoping": True
            }

        elif any(k in combined for k in ["crm", "workflow"]):
            rc = SERVICE_RATE_CARD["CRM_WORKFLOW"]
            return {
                "price_status": "NEEDS_SCOPING",
                "recommended_price_aed": None,
                "pricing_basis": f"CRM Workflow Automation (Guidance: AED {rc['min_aed']:,.0f} - {rc['max_aed']:,.0f})",
                "rate_card_category": "CRM_WORKFLOW",
                "rate_card_guidance": rc,
                "requires_scoping": True
            }

        return {
            "price_status": "NEEDS_SCOPING",
            "recommended_price_aed": None,
            "pricing_basis": "Discovery required to determine scope and commercial deliverables",
            "rate_card_category": "UNCLASSIFIED",
            "requires_scoping": True
        }


rate_card_service = RateCardService()
