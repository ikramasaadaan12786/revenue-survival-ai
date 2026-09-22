"""
Revenue Survival AI - Autonomous AI Enterprise Network v9
Subscription Billing: SaaS tier governance (Starter, Professional, Business, Enterprise), quota enforcement, and upgrade simulation.
"""

from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import datetime

from app.models.entities import EnterpriseCompany, EnterpriseSubscriptionBilling, CompanyAIEmployeeAssignment


PLAN_TIERS = {
    "STARTER": {
        "plan_name": "STARTER",
        "monthly_price_aed": 1999.0,
        "ai_employee_limit": 2,
        "api_call_quota": 15000,
        "included_features": ["2 White-Label AI Workers", "Telegram & LinkedIn Radar", "Standard CRM Pipeline", "Daily Email Reports"],
        "target_business_size": "Solo Consultants & Early Startups"
    },
    "PROFESSIONAL": {
        "plan_name": "PROFESSIONAL",
        "monthly_price_aed": 4999.0,
        "ai_employee_limit": 5,
        "api_call_quota": 50000,
        "included_features": ["5 White-Label AI Workers", "6 UAE Radar Channels", "Full Closing Engine", "WhatsApp Integration", "Morning CEO Reports"],
        "target_business_size": "Growing Agencies & Real Estate Teams (5-20 Staff)"
    },
    "BUSINESS": {
        "plan_name": "BUSINESS",
        "monthly_price_aed": 9999.0,
        "ai_employee_limit": 12,
        "api_call_quota": 150000,
        "included_features": ["12 White-Label AI Workers", "Multi-Department Swarm", "Saudi Arabia Expansion Radar", "Custom Sub-Second Webhooks", "Priority SLA"],
        "target_business_size": "Multi-Brokerage Networks & Tech Scale-Ups (20-100 Staff)"
    },
    "ENTERPRISE": {
        "plan_name": "ENTERPRISE",
        "monthly_price_aed": 24999.0,
        "ai_employee_limit": 30,
        "api_call_quota": 500000,
        "included_features": ["Unlimited Workspace Provisioning", "30 AI Workers Dedicated Swarm", "Custom Fine-Tuned Local LLMs", "Dedicated Solutions Architect", "99.99% Uptime Guarantee"],
        "target_business_size": "Tier-1 Enterprise Developers & Conglomerates"
    }
}


class SubscriptionBillingEngine:
    """Manages SaaS plans, company subscription upgrades, and quota enforcement."""

    def get_available_plans(self) -> List[Dict[str, Any]]:
        return list(PLAN_TIERS.values())

    async def get_company_billing_status(self, session: AsyncSession, company_id: int) -> Dict[str, Any]:
        """
        Retrieves live billing details, usage against plan quotas, and upgrade suggestions.
        """
        sub_query = select(EnterpriseSubscriptionBilling).where(EnterpriseSubscriptionBilling.company_id == company_id)
        sub_res = await session.execute(sub_query)
        sub = sub_res.scalar_one_or_none()

        emp_query = select(CompanyAIEmployeeAssignment).where(CompanyAIEmployeeAssignment.company_id == company_id)
        emp_res = await session.execute(emp_query)
        active_emps = emp_res.scalars().all()

        plan_key = (sub.plan_name if sub else "PROFESSIONAL").upper()
        plan_spec = PLAN_TIERS.get(plan_key, PLAN_TIERS["PROFESSIONAL"])

        active_count = len(active_emps)
        limit = sub.ai_employee_limit if sub else plan_spec["ai_employee_limit"]
        quota = sub.api_call_quota if sub else plan_spec["api_call_quota"]
        used_calls = sub.api_calls_used if sub else 2340

        utilization_pct = (active_count / max(limit, 1)) * 100.0

        return {
            "company_id": company_id,
            "current_plan": plan_spec["plan_name"],
            "monthly_price_aed": plan_spec["monthly_price_aed"],
            "status": sub.status if sub else "ACTIVE",
            "ai_employees_active": active_count,
            "ai_employee_limit": limit,
            "ai_employee_utilization_pct": round(utilization_pct, 1),
            "api_call_quota": quota,
            "api_calls_used": used_calls,
            "api_quota_remaining": max(0, quota - used_calls),
            "upgrade_recommended": utilization_pct >= 80.0,
            "next_tier_recommendation": "BUSINESS" if plan_key == "PROFESSIONAL" else "ENTERPRISE" if plan_key == "BUSINESS" else None,
            "renews_at": (sub.renews_at if sub and sub.renews_at else datetime.datetime.utcnow() + datetime.timedelta(days=30)).isoformat()
        }

    async def upgrade_company_plan(self, session: AsyncSession, company_id: int, new_plan_name: str) -> Dict[str, Any]:
        """
        Upgrades company to a higher tier plan and increases AI worker limits.
        """
        plan_key = new_plan_name.upper()
        if plan_key not in PLAN_TIERS:
            raise ValueError(f"Invalid plan name '{new_plan_name}'. Must be one of: {list(PLAN_TIERS.keys())}")

        plan_spec = PLAN_TIERS[plan_key]

        comp_query = select(EnterpriseCompany).where(EnterpriseCompany.id == company_id)
        comp_res = await session.execute(comp_query)
        company = comp_res.scalar_one_or_none()
        if not company:
            raise ValueError(f"Company #{company_id} not found.")

        company.tier_plan = plan_key

        sub_query = select(EnterpriseSubscriptionBilling).where(EnterpriseSubscriptionBilling.company_id == company_id)
        sub_res = await session.execute(sub_query)
        sub = sub_res.scalar_one_or_none()

        if sub:
            sub.plan_name = plan_key
            sub.monthly_price_aed = plan_spec["monthly_price_aed"]
            sub.ai_employee_limit = plan_spec["ai_employee_limit"]
            sub.api_call_quota = plan_spec["api_call_quota"]
            sub.status = "UPGRADED"
        else:
            sub = EnterpriseSubscriptionBilling(
                company_id=company_id,
                plan_name=plan_key,
                monthly_price_aed=plan_spec["monthly_price_aed"],
                ai_employee_limit=plan_spec["ai_employee_limit"],
                ai_employees_active=0,
                api_call_quota=plan_spec["api_call_quota"],
                api_calls_used=0,
                status="ACTIVE",
                renews_at=datetime.datetime.utcnow() + datetime.timedelta(days=30)
            )
            session.add(sub)

        await session.commit()

        return {
            "status": "UPGRADED_SUCCESSFULLY",
            "company_id": company.id,
            "company_name": company.name,
            "new_plan": plan_key,
            "new_monthly_price_aed": plan_spec["monthly_price_aed"],
            "new_employee_limit": plan_spec["ai_employee_limit"],
            "new_api_quota": plan_spec["api_call_quota"]
        }


subscription_billing = SubscriptionBillingEngine()
