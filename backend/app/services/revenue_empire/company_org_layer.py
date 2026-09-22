"""
Revenue Survival AI - Autonomous Revenue Empire v7
Company Organization Layer: Department Blueprints, Agent Roles, KPIs, and Organization Hierarchy
"""

from typing import Dict, Any, List
import datetime

DEPARTMENTS = {
    "CEO": {
        "agent_role": "Chief Executive Officer AI",
        "department": "Executive Leadership",
        "icon": "Crown",
        "goals": [
            "Maximize total company gross revenue and profitability across UAE & GCC",
            "Maintain overall 80%+ deal closing velocity and zero cashflow downtime",
            "Direct and align specialized AI department heads daily"
        ],
        "kpis": {
            "monthly_run_rate_aed": 150000.0,
            "overall_conversion_target_pct": 28.5,
            "revenue_acceleration_index": 1.45
        },
        "responsibilities": [
            "Executive decision arbitration",
            "Strategic budget and resource reallocation",
            "Multi-mission oversight & daily company briefing delivery"
        ]
    },
    "SALES": {
        "agent_role": "AI Sales Manager",
        "department": "Sales & Deal Closing",
        "icon": "DollarSign",
        "goals": [
            "Convert qualified inbound opportunities into closed-won contracts",
            "Accelerate deal velocity through automated value-driven follow-ups",
            "Eliminate stalled leads with objection handling workflows"
        ],
        "kpis": {
            "pipeline_velocity_hours": 36.0,
            "win_rate_target_pct": 32.0,
            "avg_deal_size_aed": 12500.0
        },
        "responsibilities": [
            "Lead prioritization & tier assignment",
            "Closing sequence orchestration",
            "High-ticket negotiation script optimization"
        ]
    },
    "MARKETING": {
        "agent_role": "AI Marketing Manager",
        "department": "Growth & Marketing",
        "icon": "Megaphone",
        "goals": [
            "Identify top performing positioning and viral outreach copy",
            "Run automated growth experiments across high-converting UAE channels",
            "Build irresistible authority narratives for each service category"
        ],
        "kpis": {
            "message_reply_rate_target_pct": 18.5,
            "campaign_roi_multiplier": 4.8,
            "creative_experiment_cadence": 5
        },
        "responsibilities": [
            "Channel attribution & viral hook testing",
            "Audience segment blueprint generation",
            "Offer positioning and value proposition refinement"
        ]
    },
    "LEAD_GEN": {
        "agent_role": "AI Lead Generation Manager",
        "department": "Lead Generation & Radar Hunting",
        "icon": "Radar",
        "goals": [
            "Autonomously sweep 6 UAE radar channels 24/7 for high-intent buying signals",
            "Filter noise, spam, and competitors to deliver warm verified opportunities",
            "Expand radar keyword taxonomy for emerging high-budget niches"
        ],
        "kpis": {
            "daily_signal_discovery_volume": 45,
            "lead_qualification_accuracy_pct": 92.0,
            "channel_uptime_pct": 99.8
        },
        "responsibilities": [
            "Telegram, LinkedIn, Instagram, Reddit, YouTube, and Web Search sweep orchestration",
            "Intent & budget keyword discovery",
            "Automated CRM lead ingestion & enrichment"
        ]
    },
    "PRODUCT": {
        "agent_role": "AI Product Manager",
        "department": "Product & Offer Architecture",
        "icon": "Boxes",
        "goals": [
            "Design market-demanded AI automation solutions and SaaS service tiers",
            "Package high-ticket 3-tier offerings with fast 7-14 day delivery",
            "Conduct continuous competitive intelligence across UAE market"
        ],
        "kpis": {
            "product_market_fit_score": 88.5,
            "offer_acceptance_rate_pct": 27.0,
            "tier_upgrade_rate_pct": 40.0
        },
        "responsibilities": [
            "Product opportunity identification & specification",
            "Pricing elasticity & value matrix modeling",
            "Launch roadmap and deliverable blueprint creation"
        ]
    },
    "FINANCE": {
        "agent_role": "AI Finance Analyst",
        "department": "Finance & Economics",
        "icon": "TrendingUp",
        "goals": [
            "Audit live pipeline value, operating margins, and cash collection",
            "Generate accurate 30/60/90-day predictive revenue forecasts",
            "Track commission incentives and cost efficiency gains"
        ],
        "kpis": {
            "gross_profit_margin_pct": 82.0,
            "forecast_accuracy_pct": 91.5,
            "revenue_to_expense_ratio": 6.2
        },
        "responsibilities": [
            "Real-time financial telemetry computation",
            "Unit economics and margin stress-testing",
            "Dynamic revenue target recalculation"
        ]
    },
    "CUSTOMER_SUCCESS": {
        "agent_role": "AI Customer Success Manager",
        "department": "Customer Success & Retention",
        "icon": "HeartHandshake",
        "goals": [
            "Ensure 100% client satisfaction and project milestone delivery",
            "Prevent churn through proactive health score monitoring",
            "Identify expansion contracts, retainers, and upsell opportunities"
        ],
        "kpis": {
            "net_retention_rate_pct": 125.0,
            "client_satisfaction_score": 4.85,
            "upsell_conversion_rate_pct": 35.0
        },
        "responsibilities": [
            "Client health score tracking and risk escalation",
            "Retainer renewal notifications",
            "Cross-sell and enterprise upgrade proposals"
        ]
    }
}


class CompanyOrganizationLayer:
    """Provides structured departmental blueprints, agent definitions, and hierarchy metadata."""

    def get_organization_chart(self) -> Dict[str, Any]:
        return {
            "company_name": "Revenue Survival AI Enterprise",
            "headquarters": "Dubai, United Arab Emirates",
            "structure": "Autonomous AI Agent Department Hierarchy",
            "total_departments": len(DEPARTMENTS),
            "departments": DEPARTMENTS,
            "operational_status": "ONLINE",
            "last_synced_at": datetime.datetime.utcnow().isoformat()
        }

    def get_department_spec(self, dept_code: str) -> Dict[str, Any]:
        return DEPARTMENTS.get(dept_code.upper(), {})


company_org_layer = CompanyOrganizationLayer()
