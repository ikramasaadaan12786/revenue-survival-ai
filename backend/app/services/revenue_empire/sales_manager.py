"""
Revenue Survival AI - Autonomous Revenue Empire v7
AI Sales Manager: Pipeline monitoring, high-priority deal acceleration, closing strategies, and follow-up queuing.
"""

from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
import datetime

from app.models.entities import Lead, Offer, Proposal, Communication, Mission


class AISalesManager:
    """Specialized AI Sales Executive responsible for closing deals and maximizing conversion."""

    async def analyze_sales_department(self, session: AsyncSession, mission_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Gathers live sales metrics, pipeline health, top opportunities, and prescriptive closing strategies.
        """
        # 1. Pipeline aggregation
        lead_query = select(Lead)
        if mission_id:
            lead_query = lead_query.where(Lead.mission_id == mission_id)
        
        leads_res = await session.execute(lead_query)
        all_leads = leads_res.scalars().all()

        total_leads = len(all_leads)
        won_deals = [l for l in all_leads if l.pipeline_stage == "WON"]
        lost_deals = [l for l in all_leads if l.pipeline_stage == "LOST"]
        active_pipeline = [l for l in all_leads if l.pipeline_stage not in ["WON", "LOST"]]

        total_revenue_won = sum(l.expected_value for l in won_deals)
        active_pipeline_value = sum(l.expected_value for l in active_pipeline)
        win_rate = (len(won_deals) / max(total_leads, 1)) * 100.0

        # Proposals sent count
        prop_query = select(func.count(Proposal.id))
        if mission_id:
            prop_query = prop_query.where(Proposal.mission_id == mission_id)
        prop_res = await session.execute(prop_query)
        proposals_sent = prop_res.scalar() or 0

        # High priority closing targets
        closing_targets = []
        for l in sorted(active_pipeline, key=lambda x: (x.qualification_score * x.expected_value), reverse=True)[:5]:
            closing_targets.append({
                "lead_id": l.id,
                "name": l.name,
                "company": l.company_name or "UAE Enterprise",
                "deal_value_aed": l.expected_value or 8500.0,
                "qualification_score": l.qualification_score,
                "current_stage": l.pipeline_stage,
                "recommended_action": self._generate_closing_action(l.pipeline_stage, l.qualification_score),
                "closing_probability_pct": min(95.0, round(l.qualification_score * 0.95, 1))
            })

        # Sales Priorities & Recommendations
        sales_priorities = [
            f"Close top {min(len(closing_targets), 3)} high-conviction deals in pipeline (Total AED {sum(t['deal_value_aed'] for t in closing_targets):,.0f})",
            "Trigger automated 48-hour follow-up sequence on all sent proposals with zero response",
            "Apply AED 2,500 fast-action discount incentive for prospects in NEGOTIATION stage",
            "Upsell standard implementation clients into ongoing AED 3,500/mo AI retainer packages"
        ]

        closing_strategies = [
            {
                "strategy_name": "Executive ROI Fast-Close",
                "target_niche": "AI Automation & Real Estate",
                "tactic": "Provide detailed 14-day payback calculation during initial demo and offer guaranteed SLA",
                "expected_conversion_boost": "+18%"
            },
            {
                "strategy_name": "Risk-Reversal Guarantee",
                "target_niche": "High-Ticket E-commerce & Logistics",
                "tactic": "Structure contract with 50% upfront and 50% upon verified milestone deployment",
                "expected_conversion_boost": "+24%"
            }
        ]

        return {
            "department": "SALES",
            "agent_role": "AI Sales Manager",
            "status": "OPTIMIZED",
            "kpis": {
                "total_leads_managed": total_leads,
                "active_pipeline_count": len(active_pipeline),
                "deals_won_count": len(won_deals),
                "deals_lost_count": len(lost_deals),
                "win_rate_pct": round(win_rate, 1),
                "total_revenue_won_aed": round(total_revenue_won, 2),
                "active_pipeline_value_aed": round(active_pipeline_value, 2),
                "proposals_sent": proposals_sent,
                "avg_deal_size_aed": round(total_revenue_won / max(len(won_deals), 1), 2) if won_deals else 8500.0
            },
            "top_closing_targets": closing_targets,
            "sales_priorities": sales_priorities,
            "closing_strategies": closing_strategies,
            "tasks_assigned": [
                {"id": "SLS-101", "task": "Review and approve 3 pending high-ticket proposals", "status": "READY"},
                {"id": "SLS-102", "task": "Execute negotiation re-engagement on qualified prospects", "status": "IN_PROGRESS"},
                {"id": "SLS-103", "task": "Sync with AI Finance Analyst on contract margin thresholds", "status": "COMPLETED"}
            ]
        }

    def _generate_closing_action(self, stage: str, score: float) -> str:
        if stage in ["PROPOSAL_SENT", "NEGOTIATION"]:
            return "Send VIP direct founder closing message with limited-time deployment bonus"
        elif stage in ["QUALIFIED", "DISCOVERY_CALL"]:
            return "Deliver personalized 3-tier proposal with concrete 30-day revenue impact projection"
        elif score >= 80:
            return "Schedule immediate technical demo and lock in pilot phase terms"
        else:
            return "Nurture with case study proof and automated follow-up sequence"


sales_manager = AISalesManager()
