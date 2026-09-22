import datetime
import math
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.entities import Mission, Lead, RevenueOpportunity, Communication, Offer

class DailyExecutionPlanner:
    """
    AI Daily Execution Plan Engine.
    Generates morning prioritized tactical roadmap for revenue generation:
    - Today's Revenue Target & Velocity
    - Top 20 Prioritized Opportunities (ranked by closing probability x deal value)
    - Who to Contact First (High-impact decision makers with ready pitches)
    - Calls Needed & Proposals Needed to hit goal
    - Expected Revenue Forecast
    - Recommended Strategic Actions
    """

    async def generate_daily_plan(
        self,
        session: AsyncSession,
        mission_id: int
    ) -> Dict[str, Any]:
        mission_res = await session.execute(select(Mission).where(Mission.id == mission_id))
        mission = mission_res.scalar_one_or_none()
        if not mission:
            return {"error": "Mission not found"}

        # Fetch leads & opportunities
        leads_res = await session.execute(
            select(Lead).where(Lead.mission_id == mission_id).order_by(Lead.id.desc())
        )
        leads = leads_res.scalars().all()

        opps_res = await session.execute(
            select(RevenueOpportunity).where(RevenueOpportunity.mission_id == mission_id).order_by(RevenueOpportunity.id.desc())
        )
        opps = opps_res.scalars().all()

        goal_amount = float(mission.goal_amount or 5000.0)
        revenue_achieved = float(mission.revenue_generated or 0.0)
        remaining_target = max(0.0, goal_amount - revenue_achieved)
        deadline_hours = float(mission.deadline_hours or 72)
        hourly_velocity = round(remaining_target / deadline_hours, 2) if deadline_hours > 0 else 0.0

        # Calculate Calls Needed & Proposals Needed
        avg_deal_size = 5000.0
        deals_needed = max(1, math.ceil(remaining_target / avg_deal_size)) if remaining_target > 0 else 0
        proposals_needed = deals_needed * 2
        calls_needed = proposals_needed * 2

        # Rank Top 20 Opportunities
        ranked_items = []
        for l in leads:
            score = float(l.qualification_score or 75.0)
            deal_val = float(l.expected_value or 5000.0)
            prob = float(l.revenue_probability or 0.70)
            weighted_val = deal_val * prob
            
            ranked_items.append({
                "lead_id": l.id,
                "name": l.name,
                "company": l.company_name or "Direct",
                "interest": (l.interest or "")[:100],
                "country": l.country,
                "channel": l.channel,
                "classification": l.classification or "QUALIFIED",
                "qualification_score": score,
                "deal_value_aed": deal_val,
                "closing_probability": prob,
                "weighted_value_aed": weighted_val,
                "pipeline_stage": l.pipeline_stage or "NEW",
                "decision_stage": l.decision_stage or "EVALUATION",
                "priority_rank": 0
            })

        # Sort descending by weighted value and qualification score
        ranked_items.sort(key=lambda x: (x["qualification_score"] >= 80, x["weighted_value_aed"]), reverse=True)
        for idx, item in enumerate(ranked_items[:20]):
            item["priority_rank"] = idx + 1

        top_20 = ranked_items[:20]

        # Top 5 "Who to Contact First"
        contact_first = [
            {
                "lead_id": item["lead_id"],
                "name": item["name"],
                "company": item["company"],
                "channel": item["channel"],
                "deal_value_aed": item["deal_value_aed"],
                "reason": f"High intent score ({item['qualification_score']}%), {item['deal_value_aed']:,.0f} AED potential value."
            }
            for item in top_20[:5]
        ]

        # Total expected revenue from top pipeline
        expected_revenue = sum(item["weighted_value_aed"] for item in top_20)

        # Strategic recommendations
        recs = [
            f"Review and authorize {len(top_20)} staged outreach messages in the Safety Approval Queue.",
            f"Conduct {calls_needed} discovery calls today to generate {proposals_needed} formal proposals.",
            f"Maintain target pace of {hourly_velocity:,.2f} AED/hour to hit {goal_amount:,.0f} AED milestone."
        ]

        today_str = datetime.datetime.utcnow().strftime("%B %d, %Y")

        return {
            "mission_id": mission_id,
            "plan_date": today_str,
            "todays_goal": f"Acquire {remaining_target:,.0f} {mission.currency} in confirmed revenue within {deadline_hours:.0f}h.",
            "target_amount_aed": goal_amount,
            "revenue_achieved_aed": revenue_achieved,
            "remaining_target_aed": remaining_target,
            "hourly_velocity_required_aed": hourly_velocity,
            "deals_needed": deals_needed,
            "proposals_needed": proposals_needed,
            "calls_needed": calls_needed,
            "expected_revenue_forecast_aed": round(expected_revenue, 2),
            "top_20_opportunities": top_20,
            "who_to_contact_first": contact_first,
            "recommended_actions": recs
        }


daily_execution_planner = DailyExecutionPlanner()
